import { redirect } from 'next/navigation';
import type { Route } from 'next';

export default function LegacyAdminContentPage() {
  redirect('/editorial/content' as Route);
}
