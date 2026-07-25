import { redirect } from 'next/navigation';
import type { Route } from 'next';

export default function LegacyAdminAuditPage() {
  redirect('/editorial/audit' as Route);
}
