import type { ApiEnvironment } from './config/environment.js';

export interface ReviewAssignmentEmail {
  recipientId: string;
  recipientEmail: string;
  mentorName: string;
  contentId: string;
  versionId: string;
  title: string;
  versionNumber: number;
  estimatedMinutes: number;
  requestCount: number;
  idempotencyKey: string;
}

export interface EditorialEmailGateway {
  sendReviewAssignment(
    input: ReviewAssignmentEmail,
  ): Promise<{ providerId: string }>;
}

export function createResendEditorialEmailGateway(
  environment: ApiEnvironment,
): EditorialEmailGateway {
  return {
    async sendReviewAssignment(input) {
      if (!environment.RESEND_API_KEY)
        throw new Error('RESEND_API_KEY_NOT_CONFIGURED');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${environment.RESEND_API_KEY}`,
          'content-type': 'application/json',
          'idempotency-key': input.idempotencyKey,
        },
        body: JSON.stringify({
          from: `Iatron <${environment.REVIEW_EMAIL_FROM}>`,
          to: [input.recipientEmail],
          subject: `Conteúdo aguardando sua revisão — ${input.title}`,
          html: [
            `<p>Olá, ${escapeHtml(input.mentorName)}.</p>`,
            `<p><strong>${escapeHtml(input.title)}</strong> · versão ${input.versionNumber}</p>`,
            `<p>Tempo estimado: ${input.estimatedMinutes} minutos. Solicitações agregadas: ${input.requestCount}.</p>`,
            `<p><a href="https://go.iatron.com.br/review/${input.versionId}">Abrir conteúdo para revisão</a></p>`,
            '<p>O link abre uma página autenticada. A decisão exige confirmação explícita e não ocorre por e-mail.</p>',
          ].join(''),
        }),
      });
      if (!response.ok) throw new Error(`RESEND_${response.status}`);
      const body = (await response.json()) as { id?: string };
      if (!body.id) throw new Error('RESEND_INVALID_RESPONSE');
      return { providerId: body.id };
    },
  };
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
