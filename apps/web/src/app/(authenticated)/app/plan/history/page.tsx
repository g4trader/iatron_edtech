import { PlanPage } from '@/features/study-plans/components/plan-page';
import { studyPlans } from '@/features/study-plans/server/study-plans';
export default async function HistoryPage() {
  const plans = await studyPlans.history();
  return (
    <PlanPage
      title="Histórico de planos"
      description="Versões anteriores permanecem disponíveis e auditáveis."
    >
      {plans.map((plan) => (
        <article
          className="mb-3 rounded-xl border border-[var(--color-border)] p-4"
          key={plan.versionId}
        >
          <strong>Versão {plan.version}</strong>
          <p>
            {plan.periodStart} a {plan.periodEnd} · {plan.triggerReason}
          </p>
          <p>{plan.totalPlannedMinutes} minutos planejados</p>
        </article>
      ))}
    </PlanPage>
  );
}
