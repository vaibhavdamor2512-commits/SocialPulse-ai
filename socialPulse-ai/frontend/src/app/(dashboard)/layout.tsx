/**
 * src/app/(dashboard)/layout.tsx
 * Layout for all authenticated routes — wraps in DashboardLayout.
 * All pages inside (dashboard)/ share the sidebar + header shell.
 */
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
