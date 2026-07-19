import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AvatarFace, AvatarState } from './AvatarFace';
import { inferAvatarState } from '../utils/inferAvatarState';
import { VoiceBar } from './VoiceBar';

interface ChatMessage {
  sender: 'user' | 'atlas';
  text: string;
  state?: AvatarState;
  timestamp: number;
}

export const ChatPanel: React.FC = () => {
  const [avatarState, setAvatarState] = useState<AvatarState>('NEUTRAL');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: 'atlas', text: "Systems online. What are we building or remembering today?", state: 'NEUTRAL', timestamp: Date.now() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [toolSchema, setToolSchema] = useState<string>('');
  const [ollamaModel, setOllamaModel] = useState('llama3.1:8b');
  const [personaLoaded, setPersonaLoaded] = useState(false);

  // Telegram Config
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Load mirror persona system prompt + Telegram config on mount
  useEffect(() => {
    const init = async () => {
      // Load tool schema for agentic OS control
      try {
        const schema: string = await invoke('get_tool_schema');
        setToolSchema(schema);
      } catch { /* tool schema not critical */ }

      // Load mirror persona system prompt from persona_engine
      try {
        const prompt: string = await invoke('get_mirror_system_prompt', { tier: 'self' });
        if (prompt && prompt.length > 30) {
          setSystemPrompt(prompt);
          setPersonaLoaded(true);
          setChatHistory(prev => [...prev, {
            sender: 'atlas',
            text: `🧬 Mirror persona loaded. I know who you are — let's talk.`,
            state: 'SASSY',
            timestamp: Date.now(),
          }]);
          setAvatarState('SASSY');
          setTimeout(() => setAvatarState('NEUTRAL'), 3000);
        }
      } catch {
        // No persona yet — that's fine, still works without it
        console.log('No persona profile found yet. Answer the Persona Clone questionnaire first.');
      }

      // Load Telegram config
      try {
        const [token, chatId]: [string | null, string | null] = await invoke('get_telegram_config');
        if (token) setTelegramToken(token);
        if (chatId) setTelegramChatId(chatId);
      } catch (err) {
        console.error('Failed to load Telegram settings:', err);
      }
    };
    init();
  }, []);


  // Phase 4: Transcription result → inject directly into chat pipeline
  const handleVoiceTranscribed = async (text: string) => {
    if (!text.trim()) return;
    // Show transcribed text as user message
    setChatHistory(prev => [...prev, { sender: 'user', text: `🎙️ ${text}`, timestamp: Date.now() }]);
    // Feed into the persona+tool pipeline (same as typed message)
    setIsGenerating(true);
    setAvatarState('THINKING');
    try {
      const nodeId = `voice_${Date.now()}`;
      await invoke('embed_and_store', { nodeId, text });
      const topMatches: Array<[string, number]> = await invoke('search_graph_vector', { query: text, topK: 3 });
      const activeSystemPrompt = systemPrompt ||
        `You are Atlas, a candid and direct digital assistant. Be concise, honest, and helpful. Never use generic AI filler phrases like "As an AI" or "Certainly!".`;
      const fullSystemPrompt = (activeSystemPrompt + '\n\n' + toolSchema).trim();
      let responseText = '';
      try {
        const ollamaRes = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: ollamaModel, messages: [
            { role: 'system', content: fullSystemPrompt },
            ...(topMatches.length > 0 && topMatches[0][1] > 0.35 ? [{ role: 'system', content: `RELEVANT CONTEXT:\n${topMatches.filter(m => m[1] > 0.35).slice(0, 3).map(m => `"${m[0]}" (${(m[1]*100).toFixed(0)}% match)`).join('\n')}` }] : []),
            { role: 'user', content: text },
          ], stream: false }),
        });
        if (ollamaRes.ok) {
          const data = await ollamaRes.json();
          responseText = data?.message?.content || '';
        }
      } catch { /* ollama not running */ }
      if (!responseText) responseText = `Voice indexed as '${nodeId}'. Ollama not running — start it with: ollama serve`;
      // Parse tool calls
      const toolCallRegex = /<TOOL_CALL>(.*?)<\/TOOL_CALL>/gs;
      const toolMatches = [...responseText.matchAll(toolCallRegex)];
      const cleanResponse = responseText.replace(toolCallRegex, '').trim();
      for (const match of toolMatches) {
        try {
          const toolJson = JSON.parse(match[1].trim());
          const result: { success: boolean; message: string; action_taken: string } = await invoke('execute_agentic_tool', { tool: toolJson.tool, params: toolJson.params || {} });
          setChatHistory(prev => [...prev, { sender: 'atlas', text: `⚡ ${result.message}`, state: 'SPEAKING', timestamp: Date.now() }]);
        } catch { /* tool error */ }
      }
      const inferred = inferAvatarState(cleanResponse || responseText, false, false);
      setAvatarState(inferred);
      if (cleanResponse.trim()) setChatHistory(prev => [...prev, { sender: 'atlas', text: cleanResponse, state: inferred, timestamp: Date.now() }]);
      setTimeout(() => setAvatarState('NEUTRAL'), 5000);
    } catch (err: any) {
      setChatHistory(prev => [...prev, { sender: 'atlas', text: `Error: ${typeof err === 'string' ? err : JSON.stringify(err)}`, state: 'NEUTRAL', timestamp: Date.now() }]);
      setAvatarState('NEUTRAL');
    } finally {
      setIsGenerating(false);
    }
  };

  // Main chat handler — Phase 2+3: persona-injected + Ollama + tool calls
  const handleSendChat = async () => {
    if (!inputMessage.trim() || isGenerating) return;
    const userMsg = inputMessage.trim();
    setInputMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg, timestamp: Date.now() }]);
    setIsGenerating(true);
    setAvatarState('THINKING');

    try {
      // 1. Embed user message into vector store
      const nodeId = `chat_${Date.now()}`;
      await invoke('embed_and_store', { nodeId, text: userMsg });

      // 2. Retrieve top reranked memories (sqlite-vec KNN)
      const topMatches: Array<[string, number]> = await invoke('search_graph_vector', { query: userMsg, topK: 3 });

      // 3. Build active system prompt (mirror persona or fallback)
      const activeSystemPrompt = systemPrompt ||
        `You are Atlas, a candid and direct digital assistant. Be concise, honest, and helpful. Never use generic AI filler phrases like "As an AI" or "Certainly!".`;


      // 4. Call local Ollama with persona + tool schema in system prompt
      let responseText = '';
      try {
        const fullSystemPrompt = (activeSystemPrompt + '\n\n' + toolSchema).trim();
        const ollamaRes = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: ollamaModel, messages: [
            { role: 'system', content: fullSystemPrompt },
            ...(topMatches.length > 0 && topMatches[0][1] > 0.35 ? [{ role: 'system', content: `RELEVANT CONTEXT:\n${topMatches.filter(m => m[1] > 0.35).slice(0, 3).map(m => `"${m[0]}" (${(m[1]*100).toFixed(0)}% match)`).join('\n')}` }] : []),
            { role: 'user', content: userMsg },
          ], stream: false }),
        });
        if (!ollamaRes.ok) throw new Error(`Ollama HTTP ${ollamaRes.status}`);
        const data = await ollamaRes.json();
        responseText = data?.message?.content || 'No response received from Ollama.';
      } catch {
        if (topMatches.length > 0 && topMatches[0][1] > 0.4) {
          responseText = `Based on what you logged earlier about "${topMatches[0][0]}" (${(topMatches[0][1] * 100).toFixed(0)}% match) — looks like you're consistent. Keep going.`;
        } else {
          responseText = `Indexed under '${nodeId}'. Ollama not running — start it with: ollama serve`;
        }
      }

      // 5. Parse and execute agentic tool calls from response
      const toolCallRegex = /<TOOL_CALL>(.*?)<\/TOOL_CALL>/gs;
      const toolMatches = [...responseText.matchAll(toolCallRegex)];
      let cleanResponse = responseText.replace(toolCallRegex, '').trim();

      if (toolMatches.length > 0) {
        for (const match of toolMatches) {
          try {
            const toolJson = JSON.parse(match[1].trim());
            const result: { success: boolean; message: string; action_taken: string } = await invoke('execute_agentic_tool', {
              tool: toolJson.tool,
              params: toolJson.params || {},
            });
            setChatHistory(prev => [...prev, {
              sender: 'atlas',
              text: `⚡ ${result.message}`,
              state: 'SPEAKING',
              timestamp: Date.now(),
            }]);
          } catch (toolErr) {
            console.error('Tool execution failed:', toolErr);
          }
        }
      }

      // 6. Infer avatar state from clean response
      const inferred = inferAvatarState(cleanResponse || responseText, false, false);
      setAvatarState(inferred);

      if (cleanResponse.trim()) {
        setChatHistory(prev => [...prev, {
          sender: 'atlas',
          text: cleanResponse,
          state: inferred,
          timestamp: Date.now(),
        }]);
      }

      setTimeout(() => setAvatarState('NEUTRAL'), 5000);
    } catch (err: any) {
      setAvatarState('NEUTRAL');
      setChatHistory(prev => [...prev, {
        sender: 'atlas',
        text: `Error processing: ${typeof err === 'string' ? err : JSON.stringify(err)}`,
        state: 'NEUTRAL',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndTestTelegram = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      setTelegramStatus('Error: Please enter both Bot Token and Chat ID.');
      return;
    }
    setTelegramStatus('Saving to SQLCipher & sending test message...');
    try {
      await invoke('save_telegram_config', { botToken: telegramToken, chatId: telegramChatId });
      const res: string = await invoke('send_telegram_update', { message: "⚡ *Atlas Identity OS* — Mirror Persona Chat connected!" });
      setTelegramStatus(`✅ Success: ${res}`);
    } catch (err: any) {
      setTelegramStatus(`❌ Error: ${typeof err === 'string' ? err : JSON.stringify(err)}`);
    }
  };

  return (
    <div style={S.page}>
      {/* Avatar Hero */}
      <div style={S.avatarCard}>
        <div style={S.stateTag}>STATE: {avatarState}</div>
        <AvatarFace state={avatarState} size={150} />

        {/* Persona status */}
        <div style={S.personaRow}>
          <div style={{ ...S.personaPill, backgroundColor: personaLoaded ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)', borderColor: personaLoaded ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.12)' }}>
            <span style={{ fontSize: 10 }}>{personaLoaded ? '🟢' : '⚪'}</span>
            <span style={{ color: personaLoaded ? '#34D399' : 'var(--color-text-secondary)' }}>
              {personaLoaded ? 'Mirror Persona Loaded' : 'No Persona — Complete Clone Setup First'}
            </span>
          </div>
          <select
            value={ollamaModel}
            onChange={e => setOllamaModel(e.target.value)}
            style={S.modelSelect}
          >
            <option value="llama3.1:8b">llama3.1:8b</option>
            <option value="qwen3:8b">qwen3:8b</option>
            <option value="mistral:7b">mistral:7b</option>
            <option value="phi3:mini">phi3:mini</option>
          </select>
        </div>

        {/* State test buttons */}
        <div style={S.stateRow}>
          {(['NEUTRAL', 'LISTENING', 'THINKING', 'SPEAKING', 'SASSY'] as AvatarState[]).map(st => (
            <button key={st} onClick={() => setAvatarState(st)} style={{ ...S.stateBtn, ...(avatarState === st ? S.stateBtnActive : {}) }}>
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={S.chatCard}>
        <div style={S.chatHeader}>
          <span>💬 Mirror Persona Chat</span>
          {isGenerating && <span style={S.generatingPill}>⚡ Thinking...</span>}
        </div>

        <div style={S.chatHistory}>
          {chatHistory.map((msg, i) => (
            <div key={i} style={{ ...S.bubble, ...(msg.sender === 'user' ? S.bubbleUser : S.bubbleAtlas) }}>
              <div style={S.bubbleLabel}>
                {msg.sender === 'user' ? 'YOU' : `ATLAS ${msg.state ? `(${msg.state})` : ''}`}
              </div>
              <div>{msg.text}</div>
            </div>
          ))}
          {isGenerating && (
            <div style={{ ...S.bubble, ...S.bubbleAtlas }}>
              <div style={S.bubbleLabel}>ATLAS (THINKING)</div>
              <div style={S.thinkingDots}><span>●</span><span>●</span><span>●</span></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div style={S.inputRow}>
          <input
            type="text"
            placeholder={personaLoaded ? "Talk to your Atlas clone..." : "Talk to Atlas (complete Persona Clone for full mirror mode)..."}
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendChat()}
            disabled={isGenerating}
            style={S.chatInput}
          />
          <button onClick={handleSendChat} disabled={isGenerating || !inputMessage.trim()} style={S.sendBtn}>
            Send
          </button>
        </div>

        {/* Phase 4: VoiceBar — push-to-talk with auto transcription */}
        <VoiceBar
          onTranscribed={handleVoiceTranscribed}
          onRecordingStart={() => setAvatarState('LISTENING')}
          onRecordingStop={() => setAvatarState('THINKING')}
          disabled={isGenerating}
        />
      </div>

      {/* Telegram */}
      <div style={S.telegramCard}>
        <div style={S.chatHeader}>📲 Outbound Telegram Bot</div>
        <p style={S.telegramDesc}>Get real-time memory summaries pinged to your phone. Stored encrypted inside SQLCipher.</p>
        <div style={S.telegramGrid}>
          <div>
            <label style={S.fieldLabel}>Bot Token (from @BotFather)</label>
            <input type="password" placeholder="123456789:ABCdef..." value={telegramToken} onChange={e => setTelegramToken(e.target.value)} style={S.fieldInput} />
          </div>
          <div>
            <label style={S.fieldLabel}>Telegram Chat ID</label>
            <input type="text" placeholder="Your Chat ID" value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)} style={S.fieldInput} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: telegramStatus?.startsWith('❌') ? '#ef4444' : '#10b981' }}>{telegramStatus}</span>
          <button onClick={handleSaveAndTestTelegram} style={S.telegramBtn}>Save & Send Test Ping</button>
        </div>
      </div>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 860, margin: '0 auto', padding: '0 0 20px' },

  // Avatar card
  avatarCard: { backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: 16, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  stateTag: { position: 'absolute', top: 16, right: 16, padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', backgroundColor: 'rgba(6,182,212,0.15)', color: 'var(--color-accent-cyan)', border: '1px solid rgba(6,182,212,0.3)' },
  personaRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  personaPill: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 10, border: '1px solid', fontSize: 11, fontWeight: 600 },
  modelSelect: { padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)', fontSize: 11, cursor: 'pointer' },
  stateRow: { display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  stateBtn: { padding: '4px 10px', borderRadius: 6, fontSize: 11, border: '1px solid var(--color-border-subtle)', backgroundColor: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', transition: 'all 0.2s' },
  stateBtnActive: { border: '1px solid var(--color-accent-cyan)', backgroundColor: 'rgba(6,182,212,0.2)', color: '#fff' },

  // Chat card
  chatCard: { backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 },
  chatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' },
  generatingPill: { fontSize: 11, padding: '3px 8px', borderRadius: 8, backgroundColor: 'rgba(167,139,250,0.15)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.3)' },
  chatHistory: { minHeight: 200, maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '10px', backgroundColor: 'var(--color-bg-base)', borderRadius: 8, border: '1px solid var(--color-border-subtle)' },
  bubble: { padding: '10px 14px', borderRadius: 10, maxWidth: '82%', fontSize: 14, lineHeight: 1.45 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)' },
  bubbleAtlas: { alignSelf: 'flex-start', backgroundColor: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)' },
  bubbleLabel: { fontSize: 10, fontWeight: 700, marginBottom: 4, color: 'var(--color-text-secondary)' },
  thinkingDots: { display: 'flex', gap: 4, color: '#A78BFA', fontSize: 18 },
  inputRow: { display: 'flex', gap: 8 },
  chatInput: { flex: 1, padding: '12px 14px', borderRadius: 8, border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)', fontSize: 14 },
  iconBtn: { padding: '0 14px', borderRadius: 8, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sendBtn: { padding: '0 20px', borderRadius: 8, backgroundColor: 'var(--color-accent-blue)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 },

  // Telegram card
  telegramCard: { backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 },
  telegramDesc: { margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' },
  telegramGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  fieldLabel: { display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4 },
  fieldInput: { width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' },
  telegramBtn: { padding: '8px 16px', borderRadius: 6, backgroundColor: 'var(--color-accent-blue)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
};
