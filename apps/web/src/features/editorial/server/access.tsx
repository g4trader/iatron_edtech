import type { AppRole } from '@iatron/contracts';
import { redirect } from 'next/navigation';
import { getAuthState } from '@/lib/auth';
import { editorial } from './editorial';

export async function requireEditorialRole(allowed: AppRole[]) {
  const { user, profile } = await getAuthState();
  if (!user) redirect('/login');
  const roles = await editorial.roles();
  if (!roles.some((role) => allowed.includes(role) || role === 'super_admin'))
    redirect('/app');
  return { user, profile, roles };
}
