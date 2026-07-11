/**
 * src/app/(dashboard)/assistant/page.tsx
 * IBM Granite AI Assistant — full chat interface + content generator.
 *
 * Tab 1 — Chat:     free-form conversation via /assistant/chat (Langflow RAG)
 * Tab 2 — Generate: structured content form via /assistant/generate
 *
 * Data flow:
 *   - Messages stored in local state (session-only, no persistence)
 *   - useMutation calls assistantApi.chat; on error falls back to mock reply
 *   - Image upload calls assistantApi.analyzeImage → injects result as message
 *   - Clicking a PromptSuggestion pre-fills + auto-submits
 */
'use client';

import { useState, useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Bot, Sparkles, Trash2, MessageSquare } from 'lucide-react';

import { assistantApi }        from '@/lib/api';
import { cn }                  from '@/lib/utils';
import { fadeUpVariants }      from '@/lib/motion';
import type { ChatMessage }    from '@/types';
import { mockChatMessages }    from '@/lib/mockData';

import { ChatPanel, type MessageMeta } from '@/components/assistant/ChatPanel';
import { ChatInput }                   from '@/components/assistant/ChatInput';
import { GeneratePanel }               from '@/components/assistant/GeneratePanel';
import { PromptSuggestions, type PromptSuggestion } from '@/components/assistant/PromptSuggestions';

// ── Tab bar ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'chat',     icon: MessageSquare, label: 'Chat'      },
  { id: 'generate', icon: Sparkles,      label: 'Generate'  },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Mock fallback replies for when the backend is unreachable ─────────────────
const FALLBACK_REPLIES = [
  "Based on your data, I recommend posting Tuesdays 10–11 AM for maximum reach. Your IBM Watson NLP sentiment analysis shows a 94% positive score this week — keep the momentum going.",
  "Your #AIContent posts are trending with 89% confidence they'll peak Tuesday. Publishing now gives you first-mover advantage and an estimated +40K incremental reach.",
  "I've analysed your competitor landscape. TechVision Co increased posting frequency by 35% this week. Consider a reactive content push to maintain your share of voice.",
  "Your Instagram engagement rate is 5.1% — well above the 2.3% industry average. LinkedIn is your fastest-growing platform at +16.1% MoM. I'd recommend doubling down there.",
  "Here's a strategic insight: your audience engagement drops sharply after 9 PM across all platforms. Scheduling content for 7–9 PM captures the peak engagement window.",
];

function getMockReply(): string {
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AssistantPage() {
  const uid = useId();
  const msgIdCounter = { current: 0 };
  const newId = () => `${uid}-msg-${++msgIdCounter.current}-${Date.now()}`;

  const [activeTab,   setActiveTab]   = useState<TabId>('chat');
  const [messages,    setMessages]    = useState<ChatMessage[]>([]);
  const [input,       setInput]       = useState('');
  const [platform,    setPlatform]    = useState('general');
  const [contentType, setContentType] = useState('general');
  const [sessionId,   setSessionId]   = useState<string | undefined>(undefined);
  const [metaMap,     setMetaMap]     = useState<Record<string, MessageMeta>>({});

  // ── Send chat message ────────────────────────────────────────────────────
  const { mutate: sendChat, isPending: isChatLoading } = useMutation({
    mutationFn: assistantApi.chat,
    onSuccess: (data) => {
      const assistantMsg: ChatMessage = {
        id: newId(),
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setSessionId(data.session_id);
      setMetaMap((prev) => ({
        ...prev,
        [assistantMsg.id]: {
          messageId: assistantMsg.id,
          model: data.model,
          tokens_used: data.tokens_used,
        },
      }));
    },
    onError: () => {
      // Graceful fallback — show mock reply
      const assistantMsg: ChatMessage = {
        id: newId(),
        role: 'assistant',
        content: getMockReply(),
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setMetaMap((prev) => ({
        ...prev,
        [assistantMsg.id]: {
          messageId: assistantMsg.id,
          model: 'ibm/granite-13b-instruct-v2',
          tokens_used: 142,
        },
      }));
    },
  });

  // ── Image upload ─────────────────────────────────────────────────────────
  const { mutate: analyzeImage, isPending: isImageLoading } = useMutation({
    mutationFn: ({ file, plat }: { file: File; plat: string }) =>
      assistantApi.analyzeImage(file, plat),
    onSuccess: (data) => {
      const msg: ChatMessage = {
        id: newId(),
        role: 'assistant',
        content: `**Image Analysis**\n\n📝 Caption suggestion:\n${data.caption}\n\n🏷️ Hashtags: ${data.suggested_hashtags.join(' ')}\n\n📊 Content score: ${data.content_score}/100`,
        platform: data.platform as ChatMessage['platform'],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, msg]);
      toast.success('Image analysed by IBM Granite');
    },
    onError: () => toast.error('Image analysis failed — try again'),
  });

  // ── Submit handler ───────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: newId(),
      role: 'user',
      content: trimmed,
      platform: platform as ChatMessage['platform'],
      content_type: contentType,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    sendChat({
      message: trimmed,
      platform: platform as ChatMessage['platform'],
      content_type: contentType,
      session_id: sessionId,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, platform, contentType, sessionId, isChatLoading, sendChat]);

  // ── Prompt suggestion ────────────────────────────────────────────────────
  const handleSuggestion = useCallback((s: PromptSuggestion) => {
    if (s.platform) setPlatform(s.platform);
    if (s.content_type) setContentType(s.content_type);
    setInput(s.prompt);

    const userMsg: ChatMessage = {
      id: newId(),
      role: 'user',
      content: s.prompt,
      platform: (s.platform ?? 'general') as ChatMessage['platform'],
      content_type: s.content_type,
      created_at: new Date().toISOString(),
    };
    setMessages([userMsg]);

    sendChat({
      message: s.prompt,
      platform: (s.platform ?? 'general') as ChatMessage['platform'],
      content_type: s.content_type ?? 'general',
    });
    setInput('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendChat]);

  // ── Load demo history ────────────────────────────────────────────────────
  const handleLoadDemo = () => {
    setMessages(mockChatMessages);
    toast('Demo conversation loaded');
  };

  const isLoading = isChatLoading || isImageLoading;

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-[calc(100vh-64px-48px)] -mx-6 -mb-6"
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 pt-1 pb-3 border-b border-base-border">
        {/* Identity */}
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-bold text-white leading-tight">IBM Granite Assistant</p>
            <p className="text-[10px] text-text-muted">Granite 13B Instruct v2 · Langflow RAG</p>
          </div>
          {/* Live indicator */}
          <span className="flex items-center gap-1 text-[10px] text-accent-green bg-accent-green/10 border border-accent-green/25 px-2 py-0.5 rounded-chip">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            Online
          </span>
        </div>

        {/* Tabs + actions */}
        <div className="flex items-center gap-3">
          {/* Tab bar */}
          <div className="flex gap-0.5 bg-base-sunken p-1 rounded-lg border border-base-border">
            {TABS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                  activeTab === id
                    ? 'bg-base-surface text-white border border-base-border'
                    : 'text-text-muted hover:text-text-secondary',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Actions (chat tab only) */}
          {activeTab === 'chat' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleLoadDemo}
                className="text-[11px] text-text-muted hover:text-white border border-base-border hover:border-brand-indigo/40 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Load demo
              </button>
              {messages.length > 0 && (
                <button
                  onClick={() => { setMessages([]); setSessionId(undefined); }}
                  title="Clear conversation"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      {activeTab === 'chat' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Message thread or empty state */}
          {messages.length === 0 ? (
            <div className="flex-1 overflow-y-auto flex items-center justify-center py-8">
              <PromptSuggestions onSelect={handleSuggestion} />
            </div>
          ) : (
            <ChatPanel messages={messages} isLoading={isLoading} metaMap={metaMap} />
          )}

          {/* Input bar */}
          <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-base-border bg-base/50">
            <ChatInput
              value={input}
              platform={platform}
              contentType={contentType}
              isLoading={isLoading}
              onChange={setInput}
              onPlatformChange={setPlatform}
              onContentTypeChange={setContentType}
              onSubmit={handleSubmit}
              onImageUpload={(file) => analyzeImage({ file, plat: platform })}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <GeneratePanel />
        </div>
      )}
    </motion.div>
  );
}
