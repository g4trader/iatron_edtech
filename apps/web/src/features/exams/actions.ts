'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function saveExamTargets(ids: string[]) {
  const parsed = z.array(z.uuid()).min(1).max(20).safeParse(ids);
  if (!parsed.success)
    return {
      ok: false,
      message: 'Selecione de uma a vinte provas para continuar.',
    };
  try {
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user)
      return {
        ok: false,
        requiresLogin: true,
        message: 'Sua sessão expirou. Entre novamente para salvar.',
      };
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('onboarding_status')
      .eq('id', user.id)
      .single();
    if (profileError || profile?.onboarding_status !== 'completed')
      return {
        ok: false,
        message: 'Conclua seu cadastro antes de alterar suas provas.',
      };
    // Existing atomic RPC validates active editions and derives ownership from auth.uid().
    // Omitted profile/availability fields and all diagnostic/plan records are preserved.
    const { error } = await client.rpc('save_onboarding', {
      p_step: 4,
      p_complete: true,
      p_exam_edition_ids: [...new Set(parsed.data)],
    });
    if (error)
      return {
        ok: false,
        message:
          'Não foi possível salvar. Uma prova pode ter ficado indisponível. Confira o catálogo e tente novamente.',
      };
    revalidatePath('/app');
    revalidatePath('/app/exams');
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        'Não conseguimos salvar agora. Sua seleção foi mantida; tente novamente.',
    };
  }
}
