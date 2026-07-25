import {
  completeDiagnostic,
  pauseDiagnostic,
  submitDiagnosticAnswer,
} from '@/features/assessments/actions';
import Link from 'next/link';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';
import { AssessmentPage } from '@/features/assessments/components/adaptive-page';
import { nextQuestion } from '@/features/assessments/server/adaptive-assessment';
import { questionSelectionReason } from '@/lib/learning-language';

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const id = (await searchParams).id;
  if (!id)
    return (
      <AssessmentPage
        title="Diagnóstico não iniciado"
        description="Comece pela tela inicial para prepararmos as questões certas para você."
      >
        <Link
          className="primary-button inline-flex"
          href="/app/assessment/start"
        >
          Começar diagnóstico
        </Link>
      </AssessmentPage>
    );

  let question: Awaited<ReturnType<typeof nextQuestion>>;
  try {
    question = await nextQuestion(id);
  } catch {
    return (
      <AssessmentPage
        title="Não conseguimos iniciar seu diagnóstico agora"
        description="Seu progresso está seguro. Tente novamente em instantes."
      >
        <section aria-live="assertive" className="state-card error-state">
          <h2>A primeira pergunta não ficou disponível</h2>
          <p>
            Você pode tentar carregar novamente ou retornar à sua Jornada sem
            perder o diagnóstico iniciado.
          </p>
          <div className="state-action flex flex-wrap gap-2">
            <Link
              className="primary-button inline-flex"
              href={`/app/assessment/session?id=${id}`}
            >
              Tentar novamente
            </Link>
            <Link className="secondary-button inline-flex" href="/app">
              Voltar para minha Jornada
            </Link>
          </div>
        </section>
      </AssessmentPage>
    );
  }
  if (!question)
    return (
      <AssessmentPage
        title="Questões concluídas"
        description="Suas respostas foram salvas. Conclua para ver seus pontos fortes, prioridades e próximos passos."
      >
        <form action={completeDiagnostic}>
          <input type="hidden" name="assessmentId" value={id} />
          <ActionSubmitButton pendingLabel="Analisando suas competências…">
            Ver meu resultado
          </ActionSubmitButton>
        </form>
      </AssessmentPage>
    );

  return (
    <AssessmentPage
      title={`Questão ${question.number} de ${question.total}`}
      description="Responda com calma. Cada questão ajuda a tornar seu diagnóstico mais confiável."
      focused
    >
      <section
        aria-label={`Progresso: questão ${question.number} de ${question.total}`}
        className="guided-progress"
      >
        <div>
          <span>Bloco {Math.ceil(question.number / 10)} · Seu progresso</span>
          <strong>
            {question.number} de {question.total}
          </strong>
        </div>
        <progress max={question.total} value={question.number} />
        <p>
          <strong>Área e motivo desta pergunta:</strong>{' '}
          {questionSelectionReason(question.selectionReason)}
        </p>
      </section>
      <form action={submitDiagnosticAnswer} className="space-y-5">
        <input type="hidden" name="assessmentId" value={id} />
        <input
          type="hidden"
          name="questionVersionId"
          value={question.questionVersionId}
        />
        <input type="hidden" name="responseTimeMs" value="30000" />
        <fieldset>
          <legend className="mb-4 text-lg font-medium">{question.stem}</legend>
          {question.options.map((option) => (
            <label
              key={option.id}
              className="mb-2 flex min-h-12 gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
            >
              <input
                required
                type="radio"
                name="selectedOptionId"
                value={option.id}
              />
              <span>
                <strong>{option.label}.</strong> {option.content}
              </span>
            </label>
          ))}
        </fieldset>
        <label className="form-field max-w-xs" htmlFor="stated-confidence">
          Quão seguro você está desta resposta?
          <small
            id="confidence-help"
            className="font-normal text-[var(--foreground-muted)]"
          >
            Isso nos ajuda a entender melhor o que você já domina.
          </small>
          <select
            aria-describedby="confidence-help"
            className="form-control"
            id="stated-confidence"
            name="statedConfidence"
          >
            <option value="low">Pouco seguro</option>
            <option value="medium">Em dúvida</option>
            <option value="high">Muito seguro</option>
          </select>
        </label>
        <ActionSubmitButton pendingLabel="Salvando sua resposta…">
          Confirmar resposta
        </ActionSubmitButton>
      </form>
      {question.total > 10 && (
        <form action={pauseDiagnostic}>
          <input type="hidden" name="assessmentId" value={id} />
          <ActionSubmitButton
            pendingLabel="Pausando com segurança…"
            className="secondary-button"
          >
            Pausar e continuar depois
          </ActionSubmitButton>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Suas respostas ficam salvas. Você poderá retomar deste ponto.
          </p>
        </form>
      )}
    </AssessmentPage>
  );
}
