/**
 * src/components/analytics/PostingTimesHeatmap.tsx
 * Best posting times — 7-day × 24-hour heatmap grid per platform.
 * Platform tab selector. Cells coloured by score 0-100.
 */
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PLATFORM_META, PLATFORMS } from '@/lib/constants';
import { Clock } from 'lucide-react';

interface PostingSlot { day: string; hour: number; score: number; label: string }
type PostingTimesData = Record<string, PostingSlot[]>;

interface Props {
  data: PostingTimesData | undefined;
  loading: boolean;
}

const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = [0, 3, 6, 9, 12, 15, 18, 21];
const HOUR_LABELS = ['12am','3am','6am','9am','12pm','3pm','6pm','9pm'];

function scoreToColor(score: number, platformColor: string): string {
  if (score === 0) return 'transparent';
  const opacity = 0.08 + (score / 100) * 0.72;
  return `${platformColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}

function buildGrid(slots: PostingSlot[]): Record<string, Record<number, number>> {
  const grid: Record<string, Record<number, number>> = {};
  DAYS.forEach(d => { grid[d] = {}; HOURS.forEach(h => { grid[d][h] = 0; }); });
  slots.forEach(s => {
    const dayKey = s.day.slice(0, 3);
    const hourBucket = HOURS.reduce((prev, h) => (Math.abs(h - s.hour) < Math.abs(prev - s.hour) ? h : prev), 0);
    if (grid[dayKey]) grid[dayKey][hourBucket] = Math.max(grid[dayKey][hourBucket] ?? 0, s.score);
  });
  return grid;
}

// Fallback mock data if API not available
function buildMockData(platform: string): PostingSlot[] {
  const slots: PostingSlot[] = [];
  DAYS.forEach(day => {
    HOURS.forEach(hour => {
      let score = Math.floor(Math.random() * 40);
      // Peak hours vary by platform
      if (platform === 'instagram' && (hour === 9 || hour === 18) && (day === 'Tue' || day === 'Thu')) score = 80 + Math.floor(Math.random() * 20);
      if (platform === 'linkedin' && hour === 9 && (day === 'Tue' || day === 'Wed')) score = 85 + Math.floor(Math.random() * 15);
      if (platform === 'twitter' && (hour === 9 || hour === 21)) score = 70 + Math.floor(Math.random() * 25);
      if (platform === 'facebook' && hour === 15 && day === 'Wed') score = 75 + Math.floor(Math.random() * 20);
      slots.push({ day, hour, score, label: score > 70 ? 'Peak' : score > 40 ? 'Good' : 'Low' });
    });
  });
  return slots;
}

export function PostingTimesHeatmap({ data, loading }: Props) {
  const [platform, setPlatform] = useState<typeof PLATFORMS[number]>('instagram');

  const slots = data?.[platform] ?? buildMockData(platform);
  const grid  = buildGrid(slots);
  const meta  = PLATFORM_META[platform];

  // Find top 3 slots for this platform
  const topSlots = [...slots]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="card space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-text-muted" />
          <div>
            <h3 className="text-sm font-semibold text-white">Best Posting Times</h3>
            <p className="text-xs text-text-muted">Optimal scheduling windows</p>
          </div>
        </div>
        {/* Platform tabs */}
        <div className="flex gap-1 bg-base-sunken p-1 rounded-lg border border-base-border">
          {PLATFORMS.map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all duration-150',
                platform === p ? 'bg-base-surface text-white border border-base-border' : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {PLATFORM_META[p].label.replace('/ Twitter', '')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse bg-base-border/30 rounded-xl" />
      ) : (
        <>
          {/* Heatmap grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Hour headers */}
              <div className="flex mb-1 ml-8">
                {HOURS.map((_, i) => (
                  <div key={i} className="flex-1 text-center text-[9px] text-text-dim">{HOUR_LABELS[i]}</div>
                ))}
              </div>
              {/* Rows */}
              {DAYS.map(day => (
                <div key={day} className="flex items-center gap-1 mb-1">
                  <span className="w-7 text-[9px] text-text-muted flex-shrink-0">{day}</span>
                  {HOURS.map(hour => {
                    const score = grid[day]?.[hour] ?? 0;
                    return (
                      <div
                        key={hour}
                        title={`${day} ${hour}:00 — Score: ${score}`}
                        className="flex-1 h-7 rounded-md border border-base-border/40 cursor-default transition-transform hover:scale-110"
                        style={{ background: scoreToColor(score, meta.color) }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-text-dim">Low</span>
            <div className="flex gap-0.5">
              {[0.1,0.3,0.5,0.7,0.9].map(o => (
                <div key={o} className="w-4 h-3 rounded-sm" style={{ background: `${meta.color}${Math.round(o*255).toString(16).padStart(2,'0')}` }} />
              ))}
            </div>
            <span className="text-[9px] text-text-dim">Peak</span>
          </div>

          {/* Top 3 recommendations */}
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Top recommended slots</p>
            <div className="flex flex-wrap gap-2">
              {topSlots.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-base border border-base-border">
                  <span className="text-[10px] font-bold text-text-primary">{s.day} {s.hour}:00</span>
                  <span className="text-[9px] font-semibold" style={{ color: meta.color }}>{s.score}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
