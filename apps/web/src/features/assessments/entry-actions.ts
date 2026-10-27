'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  assessmentHistory,
  startAssessment,
  resumeAssessment,
  finishAssessment,
} from './server/adaptive-assessment';
import {
  selectAssessmentEntry,
  type DiagnosticActionState,
} from './entry-state';

export async function beginAcquisitionDiagnostic(
  _state: DiagnosticActionState,
  form: FormData,
): Promise<DiagnosticActionState> {
  const mode = form.get('mode');
  if (mode !== 'quick_screening' && mode !== 'full_diagnostic')
    return {
      status: 'error',
      message: 'Escolha o tipo de diagnóstico para continuar.',
    };
  try {
    // Recheck immediately before creation. Cross-tab races still require API idempotency.
    const { current } = selectAssessmentEntry(await assessmentHistory());
    if (current) {
      if (current.status === 'paused') await resumeAssessment(current.id);
      return {
        status: 'success',
        destination: `/app/assessment/session?id=${current.id}`,
      };
    }
    const id = await startAssessment(mode);
    revalidatePath('/app');
    revalidatePath('/app/assessment/entry');
    revalidatePath('/app/assessment/history');
    return {
      status: 'success',
      destination: `/app/assessment/session?id=${id}`,
      event: 'diagnostic_started',
    };
  } catch {
    return {
      status: 'error',
      message:
        'Não conseguimos confirmar o início agora. Tente novamente: primeiro verificaremos se já existe um diagnóstico salvo.',
    };
  }
}

export async function resumeAcquisitionDiagnostic(
  _state: DiagnosticActionState,
  form: FormData,
): Promise<DiagnosticActionState> {
  try {
    const { current } = selectAssessmentEntry(await assessmentHistory());
    if (!current || current.id !== form.get('assessmentId'))
      return {
        status: 'error',
        message:
          'O estado deste diagnóstico mudou. Volte à entrada do diagnóstico para verificar seu próximo passo.',
      };
    if (current.status === 'paused') await resumeAssessment(current.id);
    return {
      status: 'success',
      destination: `/app/assessment/session?id=${current.id}`,
    };
  } catch {
    return {
      status: 'error',
      message:
        'Não conseguimos retomar agora. Suas respostas continuam salvas. Tente novamente.',
    };
  }
}

export async function finishAcquisitionDiagnostic(
  _state: DiagnosticActionState,
  form: FormData,
): Promise<DiagnosticActionState> {
  const parsedId = z.uuid().safeParse(form.get('assessmentId'));
  if (!parsedId.success)
    return {
      status: 'error',
      message:
        'Diagnóstico inválido. Volte à entrada para selecionar sua avaliação.',
    };
  const id = parsedId.data;
  try {
    const saved = (await assessmentHistory()).find((item) => item.id === id);
    if (!saved)
      return {
        status: 'error',
        message:
          'Não encontramos este diagnóstico no seu histórico. Volte à entrada para conferir sua avaliação.',
      };
    if (saved.status === 'completed' && saved.completedAt !== null)
      return {
        status: 'success',
        destination: `/app/assessment/result?id=${id}`,
      };
    if (saved.status !== 'active' || saved.answeredCount === 0)
      return {
        status: 'error',
        message:
          'Este diagnóstico ainda não pode ser concluído. Volte à entrada para retomar sua avaliação.',
      };
    await finishAssessment(id);
    // These reads use no-store. Revalidating here would rerender /session after completion,
    // remove this action's form, and prevent its confirmed result from reaching the client.
    // The finish form performs a full navigation, discarding its previous Router Cache.
    return {
      status: 'success',
      destination: `/app/assessment/result?id=${id}`,
      event: 'diagnostic_completed',
    };
  } catch {
    return {
      status: 'error',
      message:
        'Não conseguimos concluir este diagnóstico agora. Tente novamente ou volte à entrada para conferir seu progresso.',
    };
  }
}
