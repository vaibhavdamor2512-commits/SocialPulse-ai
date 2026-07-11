'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Trash2, RefreshCw, FileText, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { reportsApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { mockReports } from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/motion';
import { formatDate, formatNumber, formatRelativeTime, capitalize } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Report } from '@/types';

const STATUS_VARIANTS: Record<Report['status'], 'green' | 'orange' | 'pink'> = {
  ready: 'green',
  generating: 'orange',
  failed: 'pink',
};

function ReportStatusBadge({ status }: { status: Report['status'] }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{capitalize(status)}</Badge>;
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const reportId = params?.id as string;

  const reportQuery = useQuery<Report>({
    queryKey: QUERY_KEYS.report(reportId),
    queryFn: () => reportsApi.get(reportId),
    placeholderData: mockReports.find((report) => report.id === reportId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: () => reportsApi.delete(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.reports);
      toast.success('Report deleted.');
      router.push('/reports');
    },
    onError: () => {
      toast.error('Unable to delete report.');
    },
  });

  const report = reportQuery.data;
  const isLoading = reportQuery.isLoading || deleteMutation.isLoading;

  if (!report && !reportQuery.isLoading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-text-muted">Report not found.</p>
        <Button variant="ghost" onClick={() => router.push('/reports')} className="mt-4">
          Back to reports
        </Button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push('/reports')}>
            Back to reports
          </Button>
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow">
              <FileText className="w-5 h-5 text-white" />
            </span>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight">{report?.name ?? 'Report details'}</h1>
              <p className="text-xs text-text-muted max-w-2xl">
                Review report metadata, AI insights, and download the latest version.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            leftIcon={<RefreshCw className="w-4 h-4" />}
            variant="outline"
            onClick={() => reportQuery.refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => window.open(report?.download_url ?? reportsApi.downloadUrl(reportId), '_blank')}
            disabled={report?.status !== 'ready'}
          >
            Download
          </Button>
          <Button
            leftIcon={<Trash2 className="w-4 h-4" />}
            variant="danger"
            onClick={() => deleteMutation.mutate()}
          >
            Delete
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <Card className="p-4">
            <CardHeader>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Overview</p>
                <h2 className="text-base font-semibold text-white">Report snapshot</h2>
              </div>
              <ReportStatusBadge status={report?.status ?? 'generating'} />
            </CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-muted">Report type</p>
                <p className="text-sm text-white mt-2">{report ? capitalize(report.report_type.replace(/_/g, ' ')) : '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-muted">Created</p>
                <p className="text-sm text-white mt-2">{report ? formatDate(report.created_at, 'long') : '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-muted">Period</p>
                <p className="text-sm text-white mt-2">{report?.period.replace(/_/g, ' ') ?? '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-muted">Format</p>
                <p className="text-sm text-white mt-2">{report?.format.toUpperCase() ?? '—'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-muted">File size</p>
                <p className="text-sm text-white mt-2">{report?.file_size_bytes ? formatNumber(report.file_size_bytes) : 'Pending'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-muted">Platforms</p>
                <p className="text-sm text-white mt-2">{report?.platforms?.join(', ') ?? 'All channels'}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted">AI summary</p>
                <h2 className="text-base font-semibold text-white">Key insights</h2>
              </div>
              <Sparkles className="w-5 h-5 text-accent-purple" />
            </CardHeader>
            <CardBody>
              <p className="text-sm leading-6 text-text-muted">
                {report?.ai_summary ?? 'AI summary will be available once the report is ready.'}
              </p>
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="rounded-2xl bg-base-surface border border-base-border p-4">
                <p className="text-xs uppercase tracking-wider text-text-muted">Last update</p>
                <p className="mt-2 text-sm text-white">{report ? formatRelativeTime(report.created_at) : '—'}</p>
              </div>
              <div className="rounded-2xl bg-base-surface border border-base-border p-4">
                <p className="text-xs uppercase tracking-wider text-text-muted">Status detail</p>
                <p className="mt-2 text-sm text-white">
                  {report?.status === 'ready'
                    ? 'Your report is ready to download.'
                    : report?.status === 'generating'
                    ? 'Generating in the background. Check back shortly.'
                    : 'Report generation failed. Please try again.'}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Export options</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <Button
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => window.open(report?.download_url ?? reportsApi.downloadUrl(reportId), '_blank')}
                disabled={report?.status !== 'ready'}
              >
                Download {report?.format.toUpperCase()}
              </Button>
              <div className="rounded-2xl bg-base-surface border border-base-border p-4">
                <p className="text-[11px] uppercase tracking-wider text-text-muted">Delivery</p>
                <p className="mt-2 text-sm text-white">Schedule export, download instantly or add to your weekly report deck.</p>
              </div>
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Related reports</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {mockReports
                .filter((item) => item.id !== reportId)
                .slice(0, 3)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(`/reports/${item.id}`)}
                    className="w-full text-left rounded-2xl border border-base-border bg-base-surface p-3 text-sm text-text-muted hover:border-accent-indigo hover:text-white"
                  >
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-[11px]">{item.period.replace(/_/g, ' ')} · {item.format.toUpperCase()}</p>
                  </button>
                ))}
            </CardBody>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
