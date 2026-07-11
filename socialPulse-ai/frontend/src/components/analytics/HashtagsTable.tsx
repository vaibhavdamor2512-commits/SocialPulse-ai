/**
 * src/components/analytics/HashtagsTable.tsx
 * Full hashtag analytics table: rank, tag, posts, reach, trend, % change.
 * Sortable columns, search filter.
 */
'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Search, Hash } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import type { TrendingHashtag } from '@/types';

interface Props { data: TrendingHashtag[]; loading: boolean }

type SortKey = 'posts' | 'reach' | 'pct_change';
type SortDir = 'asc' | 'desc';

function TrendIcon({ dir }: { dir: string }) {
  if (dir === 'up')   return <TrendingUp   className="w-3.5 h-3.5 text-accent-green" />;
  if (dir === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-text-muted" />;
}

function SortBtn({ col, active, dir, onClick }: { col: string; active: boolean; dir: SortDir; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 group hover:text-white transition-colors">
      {col}
      <span className={cn('text-[9px] transition-colors', active ? 'text-accent-indigo' : 'text-text-dim group-hover:text-text-muted')}>
        {active ? (dir === 'desc' ? '▼' : '▲') : '⇅'}
      </span>
    </button>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-t border-base-border">
      {[0,1,2,3,4,5].map(i => (
        <td key={i} className="py-3 px-3">
          <div className="h-3 bg-base-border rounded animate-pulse" style={{ width: i === 1 ? '80px' : '50px' }} />
        </td>
      ))}
    </tr>
  );
}

export function HashtagsTable({ data, loading }: Props) {
  const [search,  setSearch]  = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('reach');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...data]
      .filter(h => h.tag.toLowerCase().includes(q))
      .sort((a, b) => {
        const diff = a[sortKey] - b[sortKey];
        return sortDir === 'desc' ? -diff : diff;
      });
  }, [data, search, sortKey, sortDir]);

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Hash className="w-4 h-4 text-accent-indigo" />
            Trending Hashtags
          </h3>
          <p className="text-xs text-text-muted mt-0.5">{filtered.length} hashtags</p>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter hashtags…"
            className="input-base pl-8 py-1.5 text-xs w-44"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr>
              <th className="text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider pb-2 pl-1 pr-3 w-8">#</th>
              <th className="text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider pb-2 px-3">Hashtag</th>
              <th className="text-right text-[10px] font-semibold text-text-muted uppercase tracking-wider pb-2 px-3">
                <SortBtn col="Posts" active={sortKey==='posts'} dir={sortDir} onClick={() => handleSort('posts')} />
              </th>
              <th className="text-right text-[10px] font-semibold text-text-muted uppercase tracking-wider pb-2 px-3">
                <SortBtn col="Reach" active={sortKey==='reach'} dir={sortDir} onClick={() => handleSort('reach')} />
              </th>
              <th className="text-center text-[10px] font-semibold text-text-muted uppercase tracking-wider pb-2 px-3">Trend</th>
              <th className="text-right text-[10px] font-semibold text-text-muted uppercase tracking-wider pb-2 px-3">
                <SortBtn col="Change" active={sortKey==='pct_change'} dir={sortDir} onClick={() => handleSort('pct_change')} />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [0,1,2,3,4,5,6,7].map(i => <SkeletonRow key={i} />)
              : filtered.length === 0
                ? (
                  <tr><td colSpan={6} className="py-8 text-center text-xs text-text-muted">No hashtags match your filter</td></tr>
                )
                : filtered.map((h, idx) => (
                  <tr key={h.tag} className="border-t border-base-border hover:bg-base-surface/40 transition-colors">
                    <td className="py-3 pl-1 pr-3 text-[10px] text-text-dim">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs font-semibold text-accent-indigo">{h.tag}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-xs font-medium text-text-primary">{formatNumber(h.posts)}</td>
                    <td className="py-3 px-3 text-right text-xs font-medium text-text-primary">{formatNumber(h.reach)}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex justify-center"><TrendIcon dir={h.trend} /></div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={cn('text-xs font-bold',
                        h.pct_change > 0 ? 'text-accent-green' :
                        h.pct_change < 0 ? 'text-red-400' : 'text-text-muted'
                      )}>
                        {h.pct_change > 0 ? '+' : ''}{h.pct_change.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
