import {
  PlanItemCard,
  PlanPage,
} from '@/features/study-plans/components/plan-page';
import { studyPlans } from '@/features/study-plans/server/study-plans';
export default async function WeekPage() {
  const plan = await studyPlans.week();
  return (
    <PlanPage
      title="Próximos sete dias"
      description={
        plan
          ? `${plan.totalPlannedMinutes} de ${plan.totalAvailableMinutes} minutos alocados.`
          : 'Nenhum plano atual.'
      }
    >
      <div className="space-y-3">
        {plan?.items
          .filter((item) => item.status !== 'unallocated')
          .map((item) => (
            <PlanItemCard item={item} key={item.id} />
          ))}
      </div>
    </PlanPage>
  );
}
