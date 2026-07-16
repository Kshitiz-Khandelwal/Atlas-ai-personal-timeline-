import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AvatarFace, AvatarState } from './AvatarFace';

export const ChatPanel: React.FC = () => {
  const [avatarState, setAvatarState] = useState<AvatarState>('NEUTRAL');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'atlas'; text: string; state?: AvatarState }>>([
    { sender: 'atlas', text: "Systems online. What are we building or remembering today?", state: 'NEUTRAL' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Telegram Config States
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);

  // Load existing Telegram configuration on mount
  useEffect(() => {
    const loadTelegram = async () => {
      try {
        const [token, chatId]: [string | null, string | null] = await invoke('get_telegram_config');
        if (token) setTelegramToken(token);
        if (chatId) setTelegramChatId(chatId);
      } catch (err) {
        console.error("Failed to load Telegram settings:", err);
      }
    };
    loadTelegram();
  }, []);

  // Handle Voice Recording (`cpal`) coupled with `LISTENING` avatar state
  const toggleRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setAvatarState('LISTENING');
      try {
        await invoke('start_voice_recording');
      } catch (err) {
        console.error("Failed to start voice recording:", err);
        setIsRecording(false);
        setAvatarState('NEUTRAL');
      }
    } else {
      setIsRecording(false);
      setAvatarState('THINKING');
      try {
        const wavPath: string = await invoke('stop_voice_recording');
        // Add recorded note to chat
        setTimeout(() => {
          setChatHistory(prev => [
            ...prev,
            { sender: 'user', text: `🎙️ Voice Diary Captured (${wavPath.split('\\').pop()})` },
            { sender: 'atlas', text: "Indexed into your local audio timeline and embedded via ONNX vector engine.", state: 'SASSY' }
          ]);
          setAvatarState('SASSY');
        }, 1000);
      } catch (err: any) {
        setAvatarState('NEUTRAL');
        alert("Audio error: " + (typeof err === 'string' ? err : JSON.stringify(err)));
      }
    }
  };

  // Handle Text Chat & Persona Response
  const handleSendChat = async () => {
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage;
    setInputMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);

    // Set Avatar to THINKING state while querying graph/ONNX
    setAvatarState('THINKING');

    try {
      // 1. First embed and store user thought in sqlite-vec vector table
      const nodeId = `chat_${Date.now()}`;
      await invoke('embed_and_store', { nodeId, text: userMsg });

      // 2. Query top nearest memories from identity graph
      const topMatches: Array<[string, number]> = await invoke('search_graph_vector', { queryText: userMsg, topK: 3 });

      // 3. Generate Mirror Persona response (simulated local or Ollama response with sassy/candid flair)
      setTimeout(() => {
        let responseText = "";
        let responseState: AvatarState = 'SPEAKING';

        if (topMatches.length > 0 && topMatches[0][1] > 0.4) {
          responseText = `Ah, right! Based on what you logged earlier about "${topMatches[0][0]}" (similarity: ${(topMatches[0][1] * 100).toFixed(0)}%), looks like we're staying consistent. Keep crushing it.`;
          responseState = 'SPEAKING';
        } else if (userMsg.toLowerCase().includes('telegram') || userMsg.toLowerCase().includes('phone')) {
          responseText = `Sending updates straight to your pocket via Telegram Bot API. Check the config tab below if you haven't wired up your chat ID yet.`;
          responseState = 'SASSY';
        } else {
          responseText = `Got it. Indexed into your vector timeline under ID '${nodeId}'. Anything else you want to log while we're in the zone?`;
          responseState = 'NEUTRAL';
        }

        setChatHistory(prev => [...prev, { sender: 'atlas', text: responseText, state: responseState }]);
        setAvatarState(responseState);

        // Revert to neutral idle after speaking
        setTimeout(() => {
          setAvatarState('NEUTRAL');
        }, 4000);
      }, 1200);

    } catch (err: any) {
      setAvatarState('NEUTRAL');
      setChatHistory(prev => [...prev, { sender: 'atlas', text: `Error processing thought: ${typeof err === 'string' ? err : JSON.stringify(err)}`, state: 'NEUTRAL' }]);
    }
  };

  // Save Telegram Config & Test Message
  const handleSaveAndTestTelegram = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setTelegramStatus('Error: Please enter both Bot Token and Chat ID.');
      return;
    }
    setTelegramStatus('Saving to SQLCipher & sending test message...');
    try {
      await invoke('save_telegram_config', { botToken: telegramToken, chatId: telegramChatId });
      const res: string = await invoke('send_telegram_update', { message: "⚡ *Atlas Identity OS* Phase 3 Outbound Telegram connection verified!" });
      setTelegramStatus(`✅ Success: ${res}`);
    } catch (err: any) {
      setTelegramStatus(`❌ Error: ${typeof err === 'string' ? err : JSON.stringify(err)}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 850, margin: '0 auto' }}>
      {/* Top Header & Avatar Face Box */}
      <div style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 16,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        {/* State Indicator Tag */}
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          padding: '4px 10px',
          borderRadius: 12,
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          backgroundColor: 'rgba(6, 182, 212, 0.15)',
          color: 'var(--color-accent-cyan)',
          border: '1px solid rgba(6, 182, 212, 0.3)'
        }}>
          STATE: {avatarState}
        </div>

        {/* Dynamic Animated Avatar Face */}
        <AvatarFace state={avatarState} size={150} />

        {/* Manual State Test Buttons (So you can click around and test all expressions!) */}
        <div style={{ display: 'flex', gap: 6, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          {(['NEUTRAL', 'LISTENING', 'THINKING', 'SPEAKING', 'SASSY'] as AvatarState[]).map(st => (
            <button
              key={st}
              onClick={() => setAvatarState(st)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: '11px',
                border: `1px solid ${avatarState === st ? 'var(--color-accent-cyan)' : 'var(--color-border-subtle)'}`,
                backgroundColor: avatarState === st ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: avatarState === st ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 16,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-text-primary)' }}>💬 Mirror Persona & Memory Log</h3>
        
        {/* Chat History Box */}
        <div style={{
          maxHeight: 280,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '12px',
          backgroundColor: 'var(--color-bg-base)',
          borderRadius: 8,
          border: '1px solid var(--color-border-subtle)'
        }}>
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(6, 182, 212, 0.12)',
                border: `1px solid ${msg.sender === 'user' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(6, 182, 212, 0.3)'}`,
                padding: '10px 14px',
                borderRadius: 10,
                maxWidth: '80%',
                color: 'var(--color-text-primary)',
                fontSize: 14,
                lineHeight: 1.4
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: msg.sender === 'user' ? '#60a5fa' : '#22d3ee', marginBottom: 4 }}>
                {msg.sender === 'user' ? 'YOU' : 'ATLAS MIRROR PERSONA'} {msg.state && `(${msg.state})`}
              </div>
              <div>{msg.text}</div>
            </div>
          ))}
        </div>

        {/* Input & Microphone Bar */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Talk to Atlas or log a memory..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid var(--color-border-subtle)',
              backgroundColor: 'var(--color-bg-base)',
              color: 'var(--color-text-primary)',
              fontSize: 14
            }}
          />
          <button
            onClick={toggleRecording}
            style={{
              padding: '0 16px',
              borderRadius: 8,
              backgroundColor: isRecording ? '#ef4444' : '#10b981',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {isRecording ? '⏹️ Stop & Save' : '🎙️ Voice Diary'}
          </button>
          <button
            onClick={handleSendChat}
            style={{
              padding: '0 20px',
              borderRadius: 8,
              backgroundColor: 'var(--color-accent-blue)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Outbound Telegram Bot Configuration Box */}
      <div style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 16,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--color-text-primary)' }}>📲 Outbound Telegram Bot API</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Get real-time reminders and memory summaries pinged directly to your phone. Stored encrypted inside SQLCipher (`settings_secure`).
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Bot Token (from @BotFather)</label>
            <input
              type="password"
              placeholder="123456789:ABCdefGHI..."
              value={telegramToken}
              onChange={(e) => setTelegramToken(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: 'var(--color-bg-base)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Telegram Chat ID</label>
            <input
              type="text"
              placeholder="Your personal Chat ID"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--color-border-subtle)',
                backgroundColor: 'var(--color-bg-base)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 12, color: telegramStatus?.startsWith('❌') ? '#ef4444' : '#10b981' }}>
            {telegramStatus}
          </div>
          <button
            onClick={handleSaveAndTestTelegram}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              backgroundColor: 'var(--color-accent-blue)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13
            }}
          >
            Save & Send Test Ping
          </button>
        </div>
      </div>
    </div>
  );
};
