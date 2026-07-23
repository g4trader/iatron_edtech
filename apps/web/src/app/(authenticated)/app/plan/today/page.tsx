import {
  PlanItemCard,
  PlanPage,
} from '@/features/study-plans/components/plan-page';
import { studyPlans } from '@/features/study-plans/server/study-plans';
export default async function TodayPage() {
  const plan = await studyPlans.today();
  return (
    <PlanPage
      title="Plano de hoje"
      description="Carga limitada à disponibilidade informada para o dia."
    >
      {plan?.items.length ? (
        plan.items.map((item) => <PlanItemCard item={item} key={item.id} />)
      ) : (
        <p>Nenhum item planejado para hoje.</p>
      )}
    </PlanPage>
  );
}
