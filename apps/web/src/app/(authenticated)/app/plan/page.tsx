import { PageContainer } from '@/components/layout/page-container';
import {
  MasteryMeter,
  StudySessionCard,
} from '@/features/learning/components/learning-cards';

const sessions = [
  {
    id: 'session-1',
    title: 'Revisão de raciocínio diagnóstico',
    durationMinutes: 25,
    status: 'active' as const,
  },
  {
    id: 'session-2',
    title: 'Questões de Clínica Médica',
    durationMinutes: 35,
    status: 'pending' as const,
  },
  {
    id: 'session-3',
    title: 'Revisão dos erros recentes',
    durationMinutes: 20,
    status: 'pending' as const,
  },
];

export default function PlanPage() {
  return (
    <PageContainer>
      <section className="page-intro">
        <p className="eyebrow">Plano demonstrativo</p>
        <h2>Seu foco para hoje</h2>
        <p>
          Uma visão de interface; nenhuma prescrição pedagógica foi calculada.
        </p>
      </section>
      <section className="current-activity">
        <div>
          <p className="eyebrow">Atividade atual</p>
          <h2>Revisão de raciocínio diagnóstico</h2>
          <p>25 minutos · Clínica Médica</p>
        </div>
        <button className="primary-button" type="button">
          Continuar sessão
        </button>
      </section>
      <div className="two-column">
        <section className="content-section">
          <h2>Atividades do dia</h2>
          <div className="stack-list">
            {sessions.map((session) => (
              <StudySessionCard key={session.id} session={session} />
            ))}
          </div>
        </section>
        <section className="structured-card">
          <p className="eyebrow">Visão semanal</p>
          <h2>Consistência de estudo</h2>
          <MasteryMeter label="Progresso demonstrativo" value={38} />
          <div className="week-strip">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => (
              <span data-complete={index < 3} key={`${day}-${index}`}>
                {day}
              </span>
            ))}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
