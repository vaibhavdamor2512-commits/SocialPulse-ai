/**
 * src/components/assistant/ChatInput.tsx
 * Textarea + platform/content-type selectors + send button.
 * Grows vertically up to 5 lines. Ctrl+Enter / Cmd+Enter sends.
 * Image upload button wired to analyzeImage endpoint.
 */
'use client';

import { useRef, useEffect, type KeyboardEvent } from 'react';
import { Send, ImagePlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PLATFORM_OPTIONS = [
  { value: 'general',   label: '🌐 General'    },
  { value: 'instagram', label: '📸 Instagram'  },
  { value: 'twitter',   label: '🐦 X / Twitter'},
  { value: 'linkedin',  label: '💼 LinkedIn'   },
  { value: 'facebook',  label: '👥 Facebook'   },
] as const;

export const CONTENT_TYPE_OPTIONS = [
  { value: 'general',   label: 'General'       },
  { value: 'caption',   label: 'Caption'       },
  { value: 'thread',    label: 'Thread'        },
  { value: 'post',      label: 'Post'          },
  { value: 'story',     label: 'Story'         },
  { value: 'strategy',  label: 'Strategy'      },
  { value: 'analysis',  label: 'Analysis'      },
  { value: 'tips',      label: 'Tips'          },
  { value: 'brief',     label: 'Brief'         },
] as const;

interface Props {
  value: string;
  platform: string;
  contentType: string;
  isLoading: boolean;
  onChange: (v: string) => void;
  onPlatformChange: (v: string) => void;
  onContentTypeChange: (v: string) => void;
  onSubmit: () => void;
  onImageUpload: (file: File) => void;
}

export function ChatInput({
  value,
  platform,
  contentType,
  isLoading,
  onChange,
  onPlatformChange,
  onContentTypeChange,
  onSubmit,
  onImageUpload,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && value.trim()) onSubmit();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageUpload(file);
    e.target.value = '';
  };

  return (
    <div className="bg-base-surface border border-base-border rounded-xl shadow-card">
      {/* Platform + content-type row */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-base-border/60">
        <select
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="text-[11px] font-medium bg-base border border-base-border rounded-lg px-2 py-1
                     text-text-secondary hover:border-brand-indigo/40 cursor-pointer
                     focus:outline-none focus:border-brand-indigo/60 transition-colors appearance-none"
        >
          {PLATFORM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-base-sunken">{o.label}</option>
          ))}
        </select>
        <select
          value={contentType}
          onChange={(e) => onContentTypeChange(e.target.value)}
          className="text-[11px] font-medium bg-base border border-base-border rounded-lg px-2 py-1
                     text-text-secondary hover:border-brand-indigo/40 cursor-pointer
                     focus:outline-none focus:border-brand-indigo/60 transition-colors appearance-none"
        >
          {CONTENT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-base-sunken">{o.label}</option>
          ))}
        </select>
        <span className="ml-auto text-[10px] text-text-dim">⌘ + Enter to send</span>
      </div>

      {/* Textarea + actions */}
      <div className="flex items-end gap-2 px-3 py-2.5">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask IBM Granite AI anything about your social media strategy…"
          disabled={isLoading}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent text-sm text-text-primary placeholder-text-muted',
            'focus:outline-none disabled:opacity-50 leading-relaxed',
            'min-h-[36px] max-h-[140px]',
          )}
        />

        <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
          {/* Image upload */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isLoading}
            title="Analyse image"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted
                       hover:text-white hover:bg-base-border transition-colors disabled:opacity-40"
          >
            <ImagePlus className="w-4 h-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          {/* Send */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !value.trim()}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150',
              value.trim() && !isLoading
                ? 'bg-brand-gradient text-white hover:opacity-90'
                : 'bg-base-border text-text-muted cursor-not-allowed',
            )}
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
