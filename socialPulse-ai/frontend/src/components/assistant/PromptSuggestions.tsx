/**
 * src/components/assistant/PromptSuggestions.tsx
 * Quick-start prompt chips shown in the empty chat state.
 * Clicking a chip pre-fills the input and auto-submits.
 */
'use client';

import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/motion';

export interface PromptSuggestion {
  label: string;
  prompt: string;
  platform?: string;
  content_type?: string;
  icon: string;
}

export const SUGGESTIONS: PromptSuggestion[] = [
  { icon: '📸', label: 'Instagram caption',        prompt: 'Write a compelling Instagram caption for a new product launch with relevant hashtags.',              platform: 'instagram', content_type: 'caption'  },
  { icon: '🐦', label: 'Twitter thread',           prompt: 'Write a 5-tweet thread about the future of AI in marketing.',                                       platform: 'twitter',   content_type: 'thread'   },
  { icon: '💼', label: 'LinkedIn thought piece',   prompt: 'Write a thought-leadership LinkedIn post about building a strong personal brand in the AI era.',    platform: 'linkedin',  content_type: 'post'     },
  { icon: '📊', label: 'Competitor SWOT brief',    prompt: 'Summarise the key strengths and weaknesses of a social media-first brand competing in the tech space.', platform: 'general', content_type: 'analysis' },
  { icon: '🚀', label: 'Campaign strategy',        prompt: 'Create a 30-day social media campaign strategy for launching a new SaaS productivity tool.',          platform: 'general', content_type: 'strategy' },
  { icon: '📈', label: 'Engagement tips',          prompt: 'What are the top 5 tactics to increase Instagram engagement rate in Q4 2024?',                       platform: 'instagram', content_type: 'tips'     },
  { icon: '🤝', label: 'Influencer brief',         prompt: 'Write an influencer collaboration brief for a micro-influencer campaign targeting Gen Z tech users.', platform: 'general', content_type: 'brief'    },
  { icon: '🧠', label: 'Trend analysis',           prompt: 'Analyse the current trend of short-form vertical video and recommend how our brand should adapt.',   platform: 'general', content_type: 'analysis' },
];

interface Props {
  onSelect: (suggestion: PromptSuggestion) => void;
}

export function PromptSuggestions({ onSelect }: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto px-4"
    >
      {/* Hero text */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4 shadow-glow">
          <span className="text-2xl">🤖</span>
        </div>
        <h2 className="text-xl font-extrabold text-white mb-2">IBM Granite AI Assistant</h2>
        <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
          Powered by IBM Granite 13B Instruct v2 via Langflow. Ask me anything about your
          social media strategy, content creation, or analytics.
        </p>
      </motion.div>

      {/* Prompt chips */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SUGGESTIONS.map((s) => (
          <motion.button
            key={s.label}
            variants={itemVariants}
            onClick={() => onSelect(s)}
            className="flex items-start gap-3 p-3.5 rounded-xl text-left
                       bg-base-surface border border-base-border
                       hover:border-brand-indigo/40 hover:bg-base-surface/80
                       transition-all duration-150 group"
          >
            <span className="text-lg leading-none mt-0.5 flex-shrink-0">{s.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text-primary group-hover:text-white transition-colors">
                {s.label}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5 leading-snug line-clamp-2">
                {s.prompt}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
