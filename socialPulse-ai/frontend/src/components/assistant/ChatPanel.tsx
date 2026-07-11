/**
 * src/components/assistant/ChatPanel.tsx
 * Scrollable chat thread — renders user & assistant bubbles.
 * Assistant messages support:
 *   - Markdown-like line breaks (newlines → <br>)
 *   - Hashtag highlighting
 *   - Copy-to-clipboard button
 *   - Token count + model badge
 *   - Animated typing indicator while streaming
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Copy, Check, User } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { ChatMessage } from '@/types';

/* ── Hashtag highlighter ─────────────────────────────────────────────────── */
function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/(#\w+)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <span key={i} className="text-accent-indigo font-medium">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ── Copy button ─────────────────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="p-1 rounded text-text-muted hover:text-white transition-colors"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-accent-green" />
        : <Copy className="w-3.5 h-3.5" />
      }
    </button>
  );
}

/* ── Typing indicator ────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-accent-indigo rounded-full"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

/* ── Message bubble ──────────────────────────────────────────────────────── */
interface MessageBubbleProps {
  msg: ChatMessage;
  meta?: { model?: string; tokens_used?: number };
}

function MessageBubble({ msg, meta }: MessageBubbleProps) {
  const isUser = msg.role === 'user';
  const lines  = msg.content.split('\n');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          isUser
            ? 'bg-brand-indigo/20 border border-brand-indigo/40'
            : 'bg-brand-gradient',
        )}
      >
        {isUser
          ? <User className="w-4 h-4 text-accent-indigo" />
          : <Bot className="w-4 h-4 text-white" />
        }
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col gap-1 max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-brand-indigo/20 border border-brand-indigo/30 text-text-primary rounded-tr-sm'
              : 'bg-base-surface border border-base-border text-text-primary rounded-tl-sm',
          )}
        >
          {lines.map((line, i) => (
            <span key={i}>
              {line === '' ? <br /> : <HighlightedText text={line} />}
              {i < lines.length - 1 && line !== '' && <br />}
            </span>
          ))}
        </div>

        {/* Footer: timestamp + copy + model info */}
        <div className={cn('flex items-center gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-text-dim">
            {formatRelativeTime(msg.created_at)}
          </span>
          {!isUser && (
            <>
              <CopyButton text={msg.content} />
              {meta?.model && (
                <span className="text-[9px] font-medium text-text-dim bg-base-surface border border-base-border px-1.5 py-0.5 rounded">
                  {meta.model.replace('ibm/', '')} · {meta.tokens_used ?? '—'} tok
                </span>
              )}
            </>
          )}
          {msg.platform && msg.platform !== 'general' && (
            <span className="text-[9px] text-text-dim capitalize">{msg.platform}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Chat panel ──────────────────────────────────────────────────────────── */
export interface MessageMeta {
  messageId: string;
  model?: string;
  tokens_used?: number;
}

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  metaMap?: Record<string, MessageMeta>;
}

export function ChatPanel({ messages, isLoading, metaMap = {} }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            meta={metaMap[msg.id]}
          />
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-base-surface border border-base-border rounded-2xl rounded-tl-sm px-4 py-3">
              <TypingIndicator />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}
