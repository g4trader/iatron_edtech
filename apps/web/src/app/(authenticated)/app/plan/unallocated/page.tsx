import {
  PlanItemCard,
  PlanPage,
} from '@/features/study-plans/components/plan-page';
import { studyPlans } from '@/features/study-plans/server/study-plans';
export default async function UnallocatedPage() {
  const plan = await studyPlans.unallocated();
  return (
    <PlanPage
      title="Itens não alocados"
      description="Recomendações preservadas quando a disponibilidade é insuficiente."
    >
      {plan?.items.length ? (
        plan.items.map((item) => <PlanItemCard item={item} key={item.id} />)
      ) : (
        <p>Todas as recomendações foram alocadas.</p>
      )}
    </PlanPage>
  );
}
