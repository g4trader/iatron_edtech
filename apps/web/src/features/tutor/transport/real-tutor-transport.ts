'use client';
import type { ChatTransport, ChatTransportEvent, SendMessageInput, TutorReference } from '@iatron/contracts';
import { createClient } from '@/lib/supabase/browser';

const apiUrl = () => (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080/v1').replace(/\/$/, '');

const referenceTypeLabel: Record<string, string> = {
  profile: 'Seu perfil',
  target_exam: 'Sua prova escolhida',
  mastery: 'Seu progresso neste assunto',
  evidence: 'Suas atividades recentes',
  study_plan: 'Seu plano de estudos',
  competency: 'Conteúdo acadêmico',
  question: 'Questão estudada',
  assessment: 'Seu diagnóstico',
};

function referenceTitle(source: TutorReference) {
  const label = source.label.replace(/^Mastery:\s*/i, '');
  return label === source.label
    ? label
    : `Seu progresso em ${label}`;
}

async function token() {
  const { data } = await createClient().auth.getSession();
  if (!data.session) throw new Error('Sua sessão expirou.');
  return data.session.access_token;
}

export class RealTutorTransport implements ChatTransport {
  async *sendMessage(input: SendMessageInput): AsyncIterable<ChatTransportEvent> {
    const accessToken = await token();
    const response = await fetch(`${apiUrl()}/tutor/conversations/${input.conversationId}/messages`, {
      method: 'POST',
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({ requestId: input.requestId, text: input.text }),
    });
    if (!response.ok || !response.body) {
      const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      yield { type: 'error', requestId: input.requestId, message: payload?.error?.message ?? 'Tutor indisponível.' };
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';
      for (const frame of frames) {
        const event = frame.match(/^event: (.+)$/m)?.[1];
        const dataText = frame.match(/^data: (.+)$/m)?.[1];
        if (!event || !dataText) continue;
        const data = JSON.parse(dataText) as Record<string, unknown>;
        if (event === 'start') yield { type: 'start', requestId: input.requestId };
        if (event === 'text-delta') yield { type: 'text-delta', requestId: input.requestId, delta: String(data.delta ?? '') };
        if (event === 'source') {
          const source = data as unknown as TutorReference;
          yield {
            type: 'part',
            requestId: input.requestId,
            part: {
              type: 'references',
              items: [{
                id: source.entityId ?? `${source.type}-${source.label}`,
                title: referenceTitle(source),
                source: referenceTypeLabel[source.type] ?? 'Informação da sua preparação',
                version: 'atual',
                reviewStatus: 'reviewed',
              }],
            },
          };
        }
        if (event === 'complete') yield { type: 'complete', requestId: input.requestId };
        if (event === 'error') yield { type: 'error', requestId: input.requestId, message: String(data.message ?? 'Resposta interrompida.') };
      }
      if (done) return;
    }
  }
  async cancel(requestId: string) {
    const accessToken = await token();
    await fetch(`${apiUrl()}/tutor/generations/${requestId}/cancel`, {
      method: 'POST',
      headers: { authorization: `Bearer ${accessToken}` },
    });
  }
}
