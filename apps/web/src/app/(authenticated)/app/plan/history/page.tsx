import { PlanPage } from '@/features/study-plans/components/plan-page';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import { EmptyState } from '@/components/feedback/states';

const planChangeLabel: Record<string, string> = {
  manual: 'Criado por você',
  assessment_completed: 'Atualizado depois do diagnóstico',
  mastery_changed: 'Atualizado com suas respostas mais recentes',
  availability_changed: 'Ajustado à sua nova rotina',
  target_exam_changed: 'Ajustado à sua prova escolhida',
  item_completed: 'Atualizado depois de uma atividade concluída',
  item_deferred: 'Reorganizado depois de um adiamento',
  item_skipped: 'Reorganizado depois de uma atividade removida',
};

export default async function HistoryPage() {
  const plans = await studyPlans.history();
  return (
    <PlanPage
      title="Histórico de planos"
      description="Veja como seu plano mudou conforme sua rotina e seu aprendizado evoluíram."
    >
      {plans.length === 0 && (
        <EmptyState
          title="Seu primeiro plano ainda será criado"
          description="Depois disso, cada reorganização ficará registrada aqui para você acompanhar sua evolução."
        />
      )}
      {plans.map((plan) => (
        <article
          className="mb-3 rounded-xl border border-[var(--color-border)] p-4"
          key={plan.versionId}
        >
          <strong>Plano de {plan.periodStart} a {plan.periodEnd}</strong>
          <p>
            {planChangeLabel[plan.triggerReason] ??
              'Atualizado para acompanhar sua preparação'}
          </p>
          <p>{plan.totalPlannedMinutes} minutos planejados</p>
        </article>
      ))}
    </PlanPage>
  );
}
