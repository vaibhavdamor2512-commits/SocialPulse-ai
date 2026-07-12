'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, RefreshCw, Plus, Download, Trash2, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { reportsApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { mockReports } from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/motion';
import { formatDate, formatNumber, formatRelativeTime, capitalize } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { Report, ReportFormat, ReportType } from '@/types';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

const REPORT_TYPE_OPTIONS = [
  { value: 'all' as const, label: 'All report types' },
  { value: 'analytics_summary' as const, label: 'Analytics summary' },
  { value: 'campaign_performance' as const, label: 'Campaign performance' },
  { value: 'competitor_analysis' as const, label: 'Competitor analysis' },
  { value: 'sentiment_report' as const, label: 'Sentiment report' },
  { value: 'influencer_report' as const, label: 'Influencer report' },
  { value: 'trend_forecast' as const, label: 'Trend forecast' },
];

const FORMAT_OPTIONS = [
  { value: 'all' as const, label: 'All formats' },
  { value: 'pdf' as const, label: 'PDF' },
  { value: 'excel' as const, label: 'Excel' },
  { value: 'csv' as const, label: 'CSV' },
];

const PERIOD_OPTIONS = [
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

type ReportFilterType = ReportType | 'all';
type ReportFilterFormat = ReportFormat | 'all';

const FORM_TEMPLATE = {
  report_type: 'analytics_summary' as ReportType,
  format: 'pdf' as ReportFormat,
  period: 'last_30_days',
  include_ai_summary: true,
};

const REPORT_LABELS: Record<ReportType, string> = {
  analytics_summary: 'Analytics summary',
  campaign_performance: 'Campaign performance',
  competitor_analysis: 'Competitor analysis',
  sentiment_report: 'Sentiment report',
  influencer_report: 'Influencer report',
  trend_forecast: 'Trend forecast',
};

const STATUS_VARIANTS: Record<Report['status'], 'green' | 'orange' | 'pink'> = {
  ready: 'green',
  generating: 'orange',
  failed: 'pink',
};

function ReportStatusBadge({ status }: { status: Report['status'] }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{capitalize(status)}</Badge>;
}

function getReportChartData(reports: Report[]) {
  const counts = reports.reduce<Record<ReportType, number>>(
    (acc, report) => {
      acc[report.report_type] += 1;
      return acc;
    },
    {
      analytics_summary: 0,
      campaign_performance: 0,
      competitor_analysis: 0,
      sentiment_report: 0,
      influencer_report: 0,
      trend_forecast: 0,
    },
  );

  return Object.entries(counts).map(([key, value]) => ({
    name: REPORT_LABELS[key as ReportType],
    value,
  }));
}

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportFilterType>('all');
  const [formatFilter, setFormatFilter] = useState<ReportFilterFormat>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<(typeof FREQUENCY_OPTIONS)[number]['value']>('weekly');
  const [scheduleDay, setScheduleDay] = useState('Monday');
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addedReports, setAddedReports] = useState<Report[]>([]);
  const [formValues, setFormValues] = useState<typeof FORM_TEMPLATE>(FORM_TEMPLATE);

  const reportsQuery = useQuery<Report[]>({
    queryKey: QUERY_KEYS.reports,
    queryFn: reportsApi.list,
    placeholderData: mockReports,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const generateMutation = useMutation({
    mutationFn: (body: typeof FORM_TEMPLATE) => reportsApi.generate(body),
    onSuccess: (newReport) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
      setAddedReports((prev) => [{ ...newReport, status: 'generating' }, ...prev]);
      toast.success('Report generation started.');
      setCreateOpen(false);
      setFormValues(FORM_TEMPLATE);
    },
    onError: () => {
      toast.error('Unable to generate report. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reportsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
      toast.success('Report deleted successfully.');
    },
    onError: () => {
      toast.error('Unable to delete report. Please try again.');
    },
  });

  const reports = useMemo(() => {
    const combined = [...addedReports, ...(reportsQuery.data ?? mockReports)];
    return combined.filter((report, index) => combined.findIndex((item) => item.id === report.id) === index);
  }, [addedReports, reportsQuery.data]);

  const visibleReports = useMemo(
    () => reports.filter((report) => !deletedIds.includes(report.id)),
    [reports, deletedIds],
  );

  const filteredReports = useMemo(() => {
    return visibleReports
      .filter((report) => {
        const matchesType = typeFilter === 'all' || report.report_type === typeFilter;
        const matchesFormat = formatFilter === 'all' || report.format === formatFilter;
        const lowerSearch = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !lowerSearch ||
          [report.name, report.period, REPORT_LABELS[report.report_type]]
            .join(' ')
            .toLowerCase()
            .includes(lowerSearch);
        return matchesType && matchesFormat && matchesSearch;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [visibleReports, typeFilter, formatFilter, searchQuery]);

  const summary = useMemo(
    () => ({
      total: visibleReports.length,
      ready: visibleReports.filter((report) => report.status === 'ready').length,
      generating: visibleReports.filter((report) => report.status === 'generating').length,
      failed: visibleReports.filter((report) => report.status === 'failed').length,
    }),
    [visibleReports],
  );

  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pageReports = filteredReports.slice(pageStart, pageStart + pageSize);
  const allSelected = pageReports.length > 0 && pageReports.every((report) => selectedIds.includes(report.id));

  const chartData = getReportChartData(visibleReports);
  const isBusy = reportsQuery.isFetching || generateMutation.isPending || deleteMutation.isPending;

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(pageReports.map((report) => report.id));
  };

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => [...prev, id]);
    deleteMutation.mutate(id);
  };

  const handleGenerateSubmit = () => {
    if (!formValues.report_type || !formValues.format) {
      toast.error('Choose a report type and file format.');
      return;
    }

    generateMutation.mutate(formValues);
  };

  const handleExportSelected = () => {
    const selected = visibleReports.filter((report) => selectedIds.includes(report.id));
    if (!selected.length) {
      toast('Select at least one report to export.');
      return;
    }

    const rows = [
      ['Name', 'Type', 'Period', 'Format', 'Status', 'Created At', 'Size'],
      ...selected.map((report) => [
        report.name,
        REPORT_LABELS[report.report_type],
        report.period,
        report.format.toUpperCase(),
        report.status,
        formatDate(report.created_at, 'short'),
        report.file_size_bytes ? `${formatNumber(report.file_size_bytes)} bytes` : '—',
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reports-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleScheduleSubmit = () => {
    toast.success(`Scheduled reports ${scheduleFrequency} on ${scheduleDay}.`);
    setScheduleOpen(false);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <BarChart3 className="w-5 h-5 text-white" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">Reports</h1>
            <p className="text-xs text-text-muted max-w-2xl">
              Generate, review, and export cross-channel reports with AI summaries, scheduling, and file-level insights.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => reportsQuery.refetch()}
            disabled={isBusy}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-white border border-base-border hover:border-brand-indigo/40 rounded-lg px-3 py-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Button leftIcon={<CalendarDays className="w-4 h-4" />} variant="outline" onClick={() => setScheduleOpen(true)}>
            Schedule
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
            New report
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total reports', value: summary.total, tone: 'text-accent-indigo' },
          { label: 'Ready', value: summary.ready, tone: 'text-accent-green' },
          { label: 'Generating', value: summary.generating, tone: 'text-accent-orange' },
          { label: 'Failed', value: summary.failed, tone: 'text-accent-pink' },
        ].map((card) => (
          <Card key={card.label} className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-2">{card.label}</p>
            <p className={`text-2xl font-semibold ${card.tone}`}>{card.value}</p>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Filter reports</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as ReportFilterType)}
              options={REPORT_TYPE_OPTIONS}
            />
            <Select
              value={formatFilter}
              onChange={(event) => setFormatFilter(event.target.value as ReportFilterFormat)}
              options={FORMAT_OPTIONS}
            />
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>Report type distribution</CardTitle>
          </CardHeader>
          <CardBody className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted">Report list</p>
            <h2 className="text-lg font-semibold text-white">Latest exports</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportSelected}>
              Export selected
            </Button>
            <Button variant="ghost" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => { setDeletedIds((prev) => [...prev, ...selectedIds]); setSelectedIds([]); toast.success('Selected reports removed from view.'); }}>
              Remove selected
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-base-border bg-base-surface">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-xs text-text-muted uppercase tracking-[0.2em]">
                <th className="px-4 py-3 text-left">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded border-base-border bg-base-surface text-accent-indigo focus:ring-accent-indigo" />
                    Select
                  </label>
                </th>
                <th className="px-4 py-3 text-left">Report</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Period</th>
                <th className="px-4 py-3 text-left">Format</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Size</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-text-muted">
                    No reports match the current filters.
                  </td>
                </tr>
              ) : (
                pageReports.map((report) => (
                  <tr key={report.id} className="border-t border-base-border hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(report.id)}
                        onChange={() => toggleSelectRow(report.id)}
                        className="rounded border-base-border bg-base-surface text-accent-indigo focus:ring-accent-indigo"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <Link href={`/reports/${report.id}`} className="text-sm font-semibold text-white hover:text-accent-indigo">
                          {report.name}
                        </Link>
                        <p className="text-[11px] text-text-muted">{report.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-white">{REPORT_LABELS[report.report_type]}</td>
                    <td className="px-4 py-3 align-top text-sm text-text-muted">{report.period.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 align-top text-sm uppercase text-text-muted">{report.format}</td>
                    <td className="px-4 py-3 align-top"><ReportStatusBadge status={report.status} /></td>
                    <td className="px-4 py-3 align-top text-sm text-text-muted">{formatRelativeTime(report.created_at)}</td>
                    <td className="px-4 py-3 align-top text-sm text-text-muted">{report.file_size_bytes ? formatNumber(report.file_size_bytes) : '—'}</td>
                    <td className="px-4 py-3 align-top text-sm text-text-muted space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(report.download_url ?? reportsApi.downloadUrl(report.id), '_blank')}
                        disabled={report.status !== 'ready'}
                      >
                        Download
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(report.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          Showing {pageReports.length} of {filteredReports.length} reports.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}>
            Previous
          </Button>
          <span className="text-xs text-text-muted">
            Page {currentPage} of {pageCount}
          </span>
          <Button variant="outline" size="sm" disabled={currentPage === pageCount} onClick={() => setCurrentPage((prev) => Math.min(pageCount, prev + 1))}>
            Next
          </Button>
        </div>
      </motion.div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Generate new report" size="md">
        <div className="space-y-4 p-4">
          <Select
            label="Report type"
            value={formValues.report_type}
            onChange={(event) => setFormValues((prev) => ({ ...prev, report_type: event.target.value as ReportType }))}
            options={REPORT_TYPE_OPTIONS.slice(1)}
          />
          <Select
            label="File format"
            value={formValues.format}
            onChange={(event) => setFormValues((prev) => ({ ...prev, format: event.target.value as ReportFormat }))}
            options={FORMAT_OPTIONS.slice(1)}
          />
          <Select
            label="Reporting period"
            value={formValues.period}
            onChange={(event) => setFormValues((prev) => ({ ...prev, period: event.target.value }))}
            options={PERIOD_OPTIONS}
          />
          <label className="flex items-center gap-3 text-sm text-text-muted">
            <input
              type="checkbox"
              checked={formValues.include_ai_summary}
              onChange={(event) => setFormValues((prev) => ({ ...prev, include_ai_summary: event.target.checked }))}
              className="rounded border-base-border bg-base-surface text-accent-indigo focus:ring-accent-indigo"
            />
            Include AI summary
          </label>
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button loading={generateMutation.isPending} onClick={handleGenerateSubmit}>
              Generate report
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule report exports" size="md">
        <div className="space-y-4 p-4">
          <Select
            label="Frequency"
            value={scheduleFrequency}
            onChange={(event) => setScheduleFrequency(event.target.value as typeof scheduleFrequency)}
            options={FREQUENCY_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          />
          <Input
            label="Delivery day"
            value={scheduleDay}
            onChange={(event) => setScheduleDay(event.target.value)}
            placeholder="e.g. Monday"
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleSubmit}>Save schedule</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
