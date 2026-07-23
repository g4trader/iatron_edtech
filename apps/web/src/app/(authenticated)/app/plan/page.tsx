import { generatePlan } from '@/features/study-plans/actions';
import { EmptyState } from '@/components/feedback/states';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';
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
        title="Seu plano de estudos"
        description="Vamos distribuir suas prioridades nos horários que você informou, com espaço para estudar e revisar."
      >
        <EmptyState
          title="Seu plano está pronto para ser criado"
          description="Usaremos seu diagnóstico, suas prioridades e sua rotina para sugerir os próximos sete dias."
          action={
            <form action={generatePlan}>
              <ActionSubmitButton pendingLabel="Organizando suas prioridades…">
                Criar meu plano
              </ActionSubmitButton>
            </form>
          }
        />
      </PlanPage>
    );
  return (
    <PlanPage
      title="Plano atual"
      description={`${plan.totalPlannedMinutes} de ${plan.totalAvailableMinutes} minutos disponíveis foram organizados para os próximos dias.`}
    >
      <section className="experience-callout" aria-label="Como seu plano foi criado">
        <div>
          <p className="eyebrow">Feito para a sua rotina</p>
          <h2>Seu plano transforma prioridades em próximos passos</h2>
          <p>
            Consideramos seu diagnóstico, a confiança das evidências e o tempo
            disponível. Em cada atividade, você pode conferir o motivo da
            recomendação.
          </p>
        </div>
      </section>
      <div className="space-y-3">
        {plan.items.slice(0, 5).map((item) => (
          <PlanItemCard item={item} key={item.id} />
        ))}
      </div>
    </PlanPage>
  );
}
