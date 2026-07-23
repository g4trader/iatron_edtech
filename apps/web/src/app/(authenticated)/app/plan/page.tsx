import { generatePlan } from '@/features/study-plans/actions';
import {
  PlanItemCard,
  PlanPage,
} from '@/features/study-plans/components/plan-page';
import { studyPlans } from '@/features/study-plans/server/study-plans';

export default async function CurrentPlanPage() {
  const plan = await studyPlans.current();
  if (!plan)
    return (
      <PlanPage
        title="Plano adaptativo"
        description="Gere um plano de sete dias a partir do seu estado pedagógico."
      >
        <form action={generatePlan}>
          <button className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-white">
            Gerar meu plano
          </button>
        </form>
      </PlanPage>
    );
  return (
    <PlanPage
      title="Plano atual"
      description={`Versão ${plan.version} · ${plan.totalPlannedMinutes} de ${plan.totalAvailableMinutes} minutos disponíveis.`}
    >
      <div className="space-y-3">
        {plan.items.slice(0, 5).map((item) => (
          <PlanItemCard item={item} key={item.id} />
        ))}
      </div>
    </PlanPage>
  );
}
