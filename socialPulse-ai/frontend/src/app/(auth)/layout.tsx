/**
 * src/app/(auth)/layout.tsx
 * Shared shell for all auth pages (login, signup).
 * Splits the viewport: left decorative panel (md+) + right form column.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Zap, BarChart3, TrendingUp, Bot, Target, Star } from 'lucide-react';

const FEATURE_BULLETS = [
  { icon: Bot,        text: 'IBM Granite AI assistant, always on' },
  { icon: TrendingUp, text: 'Viral trend prediction 48 h ahead'   },
  { icon: BarChart3,  text: 'Unified cross-platform analytics'     },
  { icon: Target,     text: 'Automated competitor SWOT analysis'   },
  { icon: Star,       text: 'Influencer discovery & scoring'       },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-base">
      {/* ── Left panel — visible md+ ──────────────────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative flex-col justify-between p-10 overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-indigo/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
          {/* Grid dots */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: 'radial-gradient(circle, #6172f3 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5 w-fit">
          <span className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" />
          </span>
          <span className="font-extrabold text-lg text-text-primary">
            SocialPulse <span className="text-gradient">AI</span>
          </span>
        </Link>

        {/* Hero copy */}
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.1] mb-4">
              Social media intelligence
              <br />
              <span className="text-gradient">powered by IBM AI</span>
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
              One platform to predict trends, decode competitors, generate campaigns, and
              deliver Watson NLP sentiment — all in real time.
            </p>
          </div>

          {/* Feature bullets */}
          <ul className="space-y-3">
            {FEATURE_BULLETS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-brand-indigo/15 border border-brand-indigo/25 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-accent-indigo" />
                </span>
                <span className="text-sm text-text-secondary">{text}</span>
              </li>
            ))}
          </ul>

          {/* Social proof chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-chip bg-base-surface border border-base-border w-fit">
            <span className="flex -space-x-1">
              {['SC', 'JO', 'PN'].map((ini) => (
                <span
                  key={ini}
                  className="w-5 h-5 rounded-full bg-brand-gradient border border-base text-[8px] font-bold text-white flex items-center justify-center"
                >
                  {ini}
                </span>
              ))}
            </span>
            <p className="text-[11px] text-text-secondary">
              <span className="text-text-primary font-semibold">500+ brands</span> already onboarded
            </p>
          </div>
        </div>

        {/* IBM badge */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="text-[10px] text-text-muted uppercase tracking-widest">
            Exclusively powered by
          </span>
          <span className="text-[10px] font-bold text-accent-indigo px-2 py-0.5 rounded border border-accent-indigo/30 bg-accent-indigo/10">
            IBM Granite · Langflow · Watson NLP
          </span>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 relative">
        {/* Mobile logo (shown below md) */}
        <Link
          href="/"
          className="md:hidden flex items-center gap-2 mb-8"
        >
          <span className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </span>
          <span className="font-bold text-text-primary">
            SocialPulse <span className="text-gradient">AI</span>
          </span>
        </Link>

        {children}
      </div>
    </div>
  );
}
