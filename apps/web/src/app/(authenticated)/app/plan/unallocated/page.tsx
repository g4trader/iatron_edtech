import {
  PlanItemCard,
  PlanPage,
} from '@/features/study-plans/components/plan-page';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import { EmptyState } from '@/components/feedback/states';
export default async function UnallocatedPage() {
  const plan = await studyPlans.unallocated();
  return (
    <PlanPage
      title="Atividades para reorganizar"
      description="Quando uma prioridade não cabe na semana, ela fica guardada aqui para o próximo planejamento."
    >
      {plan?.items.length ? (
        plan.items.map((item) => <PlanItemCard item={item} key={item.id} />)
      ) : (
        <EmptyState
          title="Tudo coube no seu plano"
          description="Ótimo: nenhuma prioridade ficou de fora da sua disponibilidade atual."
        />
      )}
    </PlanPage>
  );
}
