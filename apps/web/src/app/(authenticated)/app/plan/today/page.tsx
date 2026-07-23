import {
  PlanItemCard,
  PlanPage,
} from '@/features/study-plans/components/plan-page';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import { EmptyState } from '@/components/feedback/states';
export default async function TodayPage() {
  const plan = await studyPlans.today();
  return (
    <PlanPage
      title="Plano de hoje"
      description="Atividades escolhidas para caber no tempo que você tem disponível hoje."
    >
      {plan?.items.length ? (
        plan.items.map((item) => <PlanItemCard item={item} key={item.id} />)
      ) : (
        <EmptyState
          title="Hoje não há atividades programadas"
          description="Use este tempo para descansar ou explorar uma prioridade. Seu plano continua normalmente no próximo dia disponível."
        />
      )}
    </PlanPage>
  );
}
