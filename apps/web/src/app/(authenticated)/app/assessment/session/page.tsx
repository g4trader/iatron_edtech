import {
  completeDiagnostic,
  submitDiagnosticAnswer,
} from '@/features/assessments/actions';
import Link from 'next/link';
import { AssessmentPage } from '@/features/assessments/components/adaptive-page';
import { nextQuestion } from '@/features/assessments/server/adaptive-assessment';

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
        <Link className="primary-button inline-flex" href="/app/assessment/start">
          Começar diagnóstico
        </Link>
      </AssessmentPage>
    );

  const question = await nextQuestion(id);
  if (!question)
    return (
      <AssessmentPage
        title="Questões concluídas"
        description="Suas respostas foram salvas. Conclua para ver seus pontos fortes, prioridades e próximos passos."
      >
        <form action={completeDiagnostic}>
          <input type="hidden" name="assessmentId" value={id} />
          <button className="primary-button">Concluir avaliação</button>
        </form>
      </AssessmentPage>
    );

  return (
    <AssessmentPage
      title={`Questão ${question.number} de ${question.total}`}
      description={question.selectionReason}
    >
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
          <small id="confidence-help" className="font-normal text-[var(--foreground-muted)]">
            Isso nos ajuda a entender melhor o que você já domina.
          </small>
          <select
            aria-describedby="confidence-help"
            className="form-control"
            id="stated-confidence"
            name="statedConfidence"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </label>
        <button className="primary-button">Confirmar resposta</button>
      </form>
    </AssessmentPage>
  );
}
