'use client';

import { AdminDashboardView } from '@/components/admin/admin-dashboard-view';
import { RequireAuth } from '@/components/auth/require-auth';

export default function AdminDashboardPage() {
  return (
    <RequireAuth role="ADMIN">
      <AdminDashboardView />
    </RequireAuth>
  );
}
