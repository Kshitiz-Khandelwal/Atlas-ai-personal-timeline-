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
}
