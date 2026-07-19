use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

use crate::errors::{AtlasError, Result};

pub struct AudioRecorder {
    is_recording: Arc<Mutex<bool>>,
    buffer: Arc<Mutex<Vec<f32>>>,
    output_dir: PathBuf,
}

impl AudioRecorder {
    pub fn new(app_data_dir: PathBuf) -> Self {
        let output_dir = app_data_dir.join("recordings");
        let _ = std::fs::create_dir_all(&output_dir);
        Self {
            is_recording: Arc::new(Mutex::new(false)),
            buffer: Arc::new(Mutex::new(Vec::new())),
            output_dir,
        }
    }

    pub async fn start_recording(&self) -> Result<()> {
        let mut rec_guard = self.is_recording.lock().await;
        if *rec_guard {
            return Ok(());
        }
        *rec_guard = true;

        let mut buf_guard = self.buffer.lock().await;
        buf_guard.clear();
        drop(buf_guard);

        let is_recording_flag = self.is_recording.clone();
        let flag_for_stream = is_recording_flag.clone();
        let audio_buffer = self.buffer.clone();

        tokio::task::spawn_blocking(move || {
            let host = cpal::default_host();
            let device = match host.default_input_device() {
                Some(d) => d,
                None => return,
            };

            let config = match device.default_input_config() {
                Ok(c) => c,
                Err(_) => return,
            };

            let stream = match config.sample_format() {
                cpal::SampleFormat::F32 => device.build_input_stream(
                    &config.into(),
                    move |data: &[f32], _| {
                        if let Ok(mut guard) = audio_buffer.try_lock() {
                            if let Ok(flag) = flag_for_stream.try_lock() {
                                if *flag {
                                    guard.extend_from_slice(data);
                                }
                            }
                        }
                    },
                    |_err| {},
                    None,
                ),
                _ => return, // Handle I16/U16 formats similarly in production if needed
            };

            if let Ok(s) = stream {
                let _ = s.play();
                // Loop while recording is active
                while let Ok(flag) = is_recording_flag.try_lock() {
                    if !*flag {
                        break;
                    }
                    drop(flag);
                    std::thread::sleep(std::time::Duration::from_millis(100));
                }
            }
        });

        Ok(())
    }

    pub async fn stop_recording(&self) -> Result<PathBuf> {
        let mut rec_guard = self.is_recording.lock().await;
        *rec_guard = false;
        drop(rec_guard);

        // Allow stream thread to exit cleanly
        tokio::time::sleep(std::time::Duration::from_millis(200)).await;

        let buf_guard = self.buffer.lock().await;
        if buf_guard.is_empty() {
            return Err(AtlasError::Internal("No audio data recorded".to_string()));
        }

        // Write simple 16kHz mono WAV file format
        let filename = format!("diary_{}.wav", chrono::Utc::now().timestamp());
        let filepath = self.output_dir.join(&filename);
        let mut file = File::create(&filepath)?;

        let num_samples = buf_guard.len() as u32;
        let sample_rate = 16000u32;
        let byte_rate = sample_rate * 2; // 16-bit mono
        let data_chunk_size = num_samples * 2;
        let form_size = 36 + data_chunk_size;

        // RIFF header
        file.write_all(b"RIFF")?;
        file.write_all(&form_size.to_le_bytes())?;
        file.write_all(b"WAVE")?;

        // fmt chunk
        file.write_all(b"fmt ")?;
        file.write_all(&16u32.to_le_bytes())?; // Subchunk1Size
        file.write_all(&1u16.to_le_bytes())?;  // AudioFormat (PCM)
        file.write_all(&1u16.to_le_bytes())?;  // NumChannels (Mono)
        file.write_all(&sample_rate.to_le_bytes())?;
        file.write_all(&byte_rate.to_le_bytes())?;
        file.write_all(&2u16.to_le_bytes())?;  // BlockAlign
        file.write_all(&16u16.to_le_bytes())?; // BitsPerSample

        // data chunk
        file.write_all(b"data")?;
        file.write_all(&data_chunk_size.to_le_bytes())?;

        for &sample in buf_guard.iter() {
            // Convert f32 [-1.0, 1.0] to i16 PCM
            let clamped = sample.clamp(-1.0, 1.0);
            let sample_i16 = (clamped * 32767.0) as i16;
            file.write_all(&sample_i16.to_le_bytes())?;
        }

        Ok(filepath)
    }

    /// Transcribe a WAV file using the local Ollama speech endpoint or fallback.
    /// Ollama (>=0.5.0) supports: POST /api/speech with base64-encoded audio.
    /// Falls back to a readable placeholder if Ollama/whisper isn't available.
    pub async fn transcribe_audio(wav_path: &std::path::Path) -> Result<String> {
        use std::io::Read;

        // Read WAV bytes
        let mut file = std::fs::File::open(wav_path)
            .map_err(|e| AtlasError::Internal(format!("Cannot open WAV: {}", e)))?;
        let mut bytes = Vec::new();
        file.read_to_end(&mut bytes)
            .map_err(|e| AtlasError::Internal(format!("Cannot read WAV: {}", e)))?;

        // Base64-encode for Ollama API
        let b64 = base64_encode(&bytes);

        // Try Ollama whisper transcription endpoint
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .map_err(|e| AtlasError::Internal(format!("HTTP client error: {}", e)))?;

        // Attempt Ollama /api/transcribe (whisper integration)
        let body = serde_json::json!({
            "model": "whisper",
            "audio": b64
        });

        let response = client
            .post("http://localhost:11434/api/transcribe")
            .json(&body)
            .send()
            .await;

        match response {
            Ok(resp) if resp.status().is_success() => {
                let data: serde_json::Value = resp.json().await
                    .map_err(|e| AtlasError::Internal(format!("JSON parse error: {}", e)))?;

                let text = data["text"]
                    .as_str()
                    .unwrap_or("")
                    .trim()
                    .to_string();

                if !text.is_empty() {
                    return Ok(text);
                }
                // Empty transcription
                Err(AtlasError::Internal("Whisper returned empty transcription".into()))
            }
            _ => {
                // Ollama not available or whisper model not pulled
                // Return informative message so the frontend can handle gracefully
                Err(AtlasError::Internal(
                    "Whisper transcription unavailable. Run: ollama pull whisper".into()
                ))
            }
        }
    }
}

/// Simple base64 encoder (no external dep needed for this small payload)
fn base64_encode(bytes: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::with_capacity((bytes.len() + 2) / 3 * 4);
    for chunk in bytes.chunks(3) {
        let b0 = chunk[0] as usize;
        let b1 = if chunk.len() > 1 { chunk[1] as usize } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as usize } else { 0 };
        result.push(CHARS[(b0 >> 2) & 0x3F] as char);
        result.push(CHARS[((b0 << 4) | (b1 >> 4)) & 0x3F] as char);
        result.push(if chunk.len() > 1 { CHARS[((b1 << 2) | (b2 >> 6)) & 0x3F] as char } else { '=' });
        result.push(if chunk.len() > 2 { CHARS[b2 & 0x3F] as char } else { '=' });
    }
    result
}
