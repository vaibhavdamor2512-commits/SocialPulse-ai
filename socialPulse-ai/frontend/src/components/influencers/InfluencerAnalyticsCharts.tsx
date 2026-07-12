'use client';

import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartWrapper, CHART_THEME } from '@/components/charts/ChartWrapper';
import type { InfluencerDemographic, PlatformDistribution, TimeSeriesPoint } from '@/types';

interface Props {
  growthData: TimeSeriesPoint[];
  engagementData: TimeSeriesPoint[];
  demographics: InfluencerDemographic[];
  platformDistribution: PlatformDistribution[];
  loading?: boolean;
}

const COLORS = ['#6172f3', '#a855f7', '#38bdf8', '#f472b6', '#4ade80'];

export function InfluencerAnalyticsCharts({ growthData, engagementData, demographics, platformDistribution, loading }: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartWrapper height={240} loading={loading} empty={growthData.length === 0}>
        <AreaChart data={growthData} margin={{ top: 6, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={CHART_THEME.gridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: CHART_THEME.tickColor, fontSize: CHART_THEME.fontSize }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: CHART_THEME.tickColor, fontSize: CHART_THEME.fontSize }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 8 }} labelStyle={{ color: CHART_THEME.tooltipText }} itemStyle={{ color: CHART_THEME.tooltipText }} />
          <Area type="monotone" dataKey="value" stroke="#6172f3" fill="#6172f3" fillOpacity={0.18} strokeWidth={2} />
        </AreaChart>
      </ChartWrapper>

      <ChartWrapper height={240} loading={loading} empty={engagementData.length === 0}>
        <LineChart data={engagementData} margin={{ top: 6, right: -10, left: -10, bottom: 0 }}>
          <CartesianGrid stroke={CHART_THEME.gridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: CHART_THEME.tickColor, fontSize: CHART_THEME.fontSize }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: CHART_THEME.tickColor, fontSize: CHART_THEME.fontSize }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 8 }} labelStyle={{ color: CHART_THEME.tooltipText }} itemStyle={{ color: CHART_THEME.tooltipText }} />
          <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartWrapper>

      <ChartWrapper height={240} loading={loading} empty={demographics.length === 0}>
        <PieChart>
          <Pie data={demographics} dataKey="share" nameKey="label" cx="50%" cy="50%" innerRadius={44} outerRadius={80} paddingAngle={4}>
            {demographics.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 8 }} labelStyle={{ color: CHART_THEME.tooltipText }} itemStyle={{ color: CHART_THEME.tooltipText }} />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: CHART_THEME.tickColor, fontSize: 11 }} />
        </PieChart>
      </ChartWrapper>

      <ChartWrapper height={240} loading={loading} empty={platformDistribution.length === 0}>
        <BarChart data={platformDistribution} margin={{ top: 6, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={CHART_THEME.gridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="platform" tick={{ fill: CHART_THEME.tickColor, fontSize: CHART_THEME.fontSize }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: CHART_THEME.tickColor, fontSize: CHART_THEME.fontSize }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 8 }} labelStyle={{ color: CHART_THEME.tooltipText }} itemStyle={{ color: CHART_THEME.tooltipText }} />
          <Bar dataKey="value" fill="#38bdf8" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ChartWrapper>
    </div>
  );
}
