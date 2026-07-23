import { PlanPage } from '@/features/study-plans/components/plan-page';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import { EmptyState } from '@/components/feedback/states';
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
          <strong>Plano {plan.version}</strong>
          <p>
            {plan.periodStart} a {plan.periodEnd} · {plan.triggerReason}
          </p>
          <p>{plan.totalPlannedMinutes} minutos planejados</p>
        </article>
      ))}
    </PlanPage>
  );
}
