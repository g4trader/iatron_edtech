import Link from 'next/link';
import type { LearningContentVersion } from '@iatron/contracts';
import { MentorRecommendation } from '@/features/mentors/components/mentor';
import { defaultMentor, mentors } from '@/features/mentors/mentors';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';
import {
  completeLearningActivity,
  requestReviewPriority,
  startLearningActivity,
} from '../actions';

export function MentorReviewSeal({
  material,
}: {
  material: LearningContentVersion;
}) {
  const reviewed =
    material.editorialStatus === 'published' &&
    material.reviewDecision === 'approved' &&
    material.reviewId !== null &&
    material.mentorName !== null &&
    material.reviewedAt !== null;
  if (!reviewed)
    return (
      <aside className="state-card" aria-label="Situação da revisão médica">
        <strong>Material em revisão médica</strong>
        <p>
          Este conteúdo foi preparado com apoio de IA e ainda aguarda revisão do
          mentor responsável.
        </p>
      </aside>
    );
  return (
    <details className="state-card" aria-label="Revisado pelo Mentor">
      <summary className="font-semibold">✓ Revisado pelo Mentor</summary>
      <p>
        {material.mentorName} · {material.mentorSpecialty ?? 'Medicina'}
      </p>
      <p>
        Versão {material.versionNumber} · Revisado em{' '}
        {new Intl.DateTimeFormat('pt-BR').format(
          new Date(material.reviewedAt!),
        )}
      </p>
      <p>
        Revisão médica educacional da versão e de suas referências principais.
        Este material não substitui atendimento médico.
      </p>
    </details>
  );
}

export function LearningContentPage({
  material,
  itemId,
  itemStatus,
  reason,
  preview = false,
}: {
  material: LearningContentVersion;
  itemId: string;
  itemStatus: string;
  reason: string;
  preview?: boolean;
}) {
  const mentor =
    mentors.find(({ specialty }) => specialty === material.mentorSpecialty) ??
    defaultMentor;
  return (
    <main className="experience-page mx-auto w-full max-w-4xl space-y-8 px-4 py-6 sm:p-8">
      {!preview && (
        <Link
          className="text-sm font-semibold text-[var(--primary)]"
          href="/app"
        >
          ← Voltar para minha Jornada
        </Link>
      )}
      <header className="space-y-3">
        <p className="text-sm text-[var(--foreground-muted)]">
          {material.mentorSpecialty ?? 'Preparação médica'} ·{' '}
          {material.estimatedMinutes} minutos
        </p>
        <h1 className="text-3xl font-semibold">{material.title}</h1>
        {material.subtitle && <p>{material.subtitle}</p>}
        <p>
          <strong>Por que este estudo está no seu plano?</strong> {reason}
        </p>
      </header>

      <MentorReviewSeal material={material} />
      <MentorRecommendation mentor={mentor}>
        <strong>Mentor da área</strong>
        <p>
          O mentor acompanha a qualidade médica do material; seu plano continua
          sendo definido pelos seus resultados.
        </p>
      </MentorRecommendation>

      <section className="state-card" aria-labelledby="video-title">
        <h2 id="video-title">Aula em vídeo</h2>
        {material.video?.url ? (
          <a href={material.video.url}>Assistir à aula</a>
        ) : (
          <p>
            Esta aula em vídeo ainda não está disponível. Continue pelo material
            didático.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">O que você vai aprender</h2>
        <ul className="list-disc space-y-2 pl-6">
          {material.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </section>
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Material didático</h2>
        <p>{material.summary}</p>
        {material.sections.map((section) => (
          <article className="space-y-2" key={section.heading}>
            <h3 className="text-xl font-semibold">{section.heading}</h3>
            <p className="whitespace-pre-line">{section.body}</p>
          </article>
        ))}
      </section>
      {material.keyPoints.length > 0 && (
        <section className="state-card">
          <h2>Pontos-chave</h2>
          <ul className="list-disc pl-6">
            {material.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      )}
      {material.examApplication && (
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Como isso aparece na prova</h2>
          <p>{material.examApplication}</p>
        </section>
      )}
      {material.commonMistakes.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Erros comuns</h2>
          <ul className="list-disc pl-6">
            {material.commonMistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </section>
      )}
      {material.quickReview.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Revisão rápida</h2>
          <ul className="list-disc pl-6">
            {material.quickReview.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Referências</h2>
        {material.references.length ? (
          <ol className="list-decimal space-y-2 pl-6">
            {material.references.map((reference) => (
              <li key={reference.id}>
                {reference.title}
                {reference.verificationStatus === 'verified'
                  ? ' · referência verificada'
                  : ' · verificação pendente'}
              </li>
            ))}
          </ol>
        ) : (
          <p>As referências desta versão ainda estão sendo organizadas.</p>
        )}
      </section>

      {!preview && material.editorialStatus !== 'published' && (
        <form action={requestReviewPriority}>
          <input name="versionId" type="hidden" value={material.id} />
          <ActionSubmitButton pendingLabel="Registrando pedido…">
            {material.reviewRequested
              ? 'Prioridade de revisão solicitada'
              : 'Solicitar prioridade de revisão'}
          </ActionSubmitButton>
        </form>
      )}
      {!preview && (
        <>
          {itemStatus === 'planned' ? (
            <form action={startLearningActivity}>
              <input name="itemId" type="hidden" value={itemId} />
              <ActionSubmitButton pendingLabel="Iniciando atividade…">
                Iniciar atividade
              </ActionSubmitButton>
            </form>
          ) : (
            <form action={completeLearningActivity}>
              <input name="itemId" type="hidden" value={itemId} />
              <input
                name="actualMinutes"
                type="hidden"
                value={material.estimatedMinutes}
              />
              <ActionSubmitButton pendingLabel="Atualizando sua jornada…">
                Finalizar e atualizar minha jornada
              </ActionSubmitButton>
            </form>
          )}
          <p className="text-sm text-[var(--foreground-muted)]">
            Ao finalizar, seus próximos passos serão reorganizados com base no
            progresso registrado.
          </p>
        </>
      )}
    </main>
  );
}
