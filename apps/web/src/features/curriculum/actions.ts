'use server';
import { saveCurriculumSchema } from '@iatron/contracts';
import { revalidatePath } from 'next/cache';
import { editorial } from '@/features/editorial/server/editorial';
import { z } from 'zod';
export async function saveCurriculum(
  _previous: { message: string; ok: boolean },
  form: FormData,
) {
  const id = z.uuid().safeParse(form.get('id'));
  const lines = (name: string) =>
    String(form.get(name) ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  const input = saveCurriculumSchema.safeParse({
    name: form.get('name'),
    description: form.get('description'),
    objectives: lines('objectives'),
    terms: lines('terms'),
    revision: Number(form.get('revision')),
    status: form.get('status'),
    reason: form.get('reason'),
    requestId: crypto.randomUUID(),
  });
  if (!id.success || !input.success)
    return {
      message:
        'Revise os campos: informe nome, descrição, objetivos e justificativa completos.',
      ok: false,
    };
  try {
    await editorial.mutate(`/admin/curriculum/${id.data}`, input.data);
    revalidatePath('/admin/competencies');
    revalidatePath(`/admin/competencies/${id.data}`);
    return {
      message:
        'Proposta salva. A revisão médica e a ativação continuam pendentes.',
      ok: true,
    };
  } catch {
    return {
      message:
        'Não foi possível salvar. Recarregue a página para conferir a versão atual; suas alterações não foram confirmadas.',
      ok: false,
    };
  }
}
