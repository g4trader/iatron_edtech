import { createClient } from './supabase/server';
import { isAuthBypassEnabled } from './auth-bypass';

export function safeReturnTo(
  value: string | null | undefined,
  fallback = '/app',
) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : fallback;
}

export async function getAuthState() {
  if (isAuthBypassEnabled(process.env)) {
    return {
      user: {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'e2e@example.test',
      },
      profile: {
        display_name: 'Estudante E2E',
        onboarding_status: 'completed',
        onboarding_step: 4,
      },
    };
  }
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return { user: null, profile: null };
    const { data: profile } = await client
      .from('profiles')
      .select('display_name,onboarding_status,onboarding_step')
      .eq('id', user.id)
      .single();
    return { user, profile };
  } catch {
    return { user: null, profile: null };
  }
}
