import type {
  GapSummaryViewModel,
  ReferenceViewModel,
  SimulationResultViewModel,
  StudyPlanViewModel,
  StudySessionViewModel,
} from '@iatron/contracts';

export function GapPriorityBadge({
  priority,
}: {
  priority: GapSummaryViewModel['priority'];
}) {
  const label = {
    high: 'Prioridade alta',
    medium: 'Prioridade média',
    low: 'Prioridade baixa',
  }[priority];
  return (
    <span className="priority-badge" data-priority={priority}>
      {label}
    </span>
  );
}

export function MasteryMeter({
  value,
  label = 'Domínio demonstrativo',
}: {
  value: number;
  label?: string;
}) {
  return (
    <div className="meter">
      <div className="meter-label">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <progress max={100} value={value}>
        {value}%
      </progress>
    </div>
  );
}

export function GapSummaryCard({ data }: { data: GapSummaryViewModel }) {
  return (
    <article className="structured-card">
      <div className="card-heading">
        <div>
          <p>{data.area}</p>
          <h3>{data.topic}</h3>
        </div>
        <GapPriorityBadge priority={data.priority} />
      </div>
      <MasteryMeter value={data.mastery} />
    </article>
  );
}

export function StudySessionCard({
  session,
  onAction,
}: {
  session: StudySessionViewModel;
  onAction?: () => void;
}) {
  return (
    <article className="session-card">
      <div>
        <p>{session.durationMinutes} min</p>
        <h3>{session.title}</h3>
      </div>
      <button className="secondary-button" onClick={onAction} type="button">
        {session.status === 'complete'
          ? 'Concluída'
          : session.status === 'active'
            ? 'Continuar'
            : 'Iniciar'}
      </button>
    </article>
  );
}

export function StudyPlanCard({ data }: { data: StudyPlanViewModel }) {
  return (
    <article className="structured-card">
      <div className="card-heading">
        <div>
          <p>Plano de estudo</p>
          <h3>{data.title}</h3>
        </div>
        <strong>{data.progress}%</strong>
      </div>
      <MasteryMeter label="Progresso" value={data.progress} />
      <div className="stack-list">
        {data.sessions.map((session) => (
          <StudySessionCard key={session.id} session={session} />
        ))}
      </div>
    </article>
  );
}

export function SimulationResultCard({
  data,
}: {
  data: SimulationResultViewModel;
}) {
  return (
    <article className="structured-card">
      <p>Resultado demonstrativo</p>
      <h3>{data.title}</h3>
      <strong className="result-number">
        {data.answered}/{data.total}
      </strong>
      <span>{data.label}</span>
    </article>
  );
}

export function ReferenceList({ items }: { items: ReferenceViewModel[] }) {
  return (
    <section className="structured-card" aria-labelledby="references-title">
      <h3 id="references-title">Referências</h3>
      <ul className="reference-list">
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            <span>
              {item.source} · {item.version}
            </span>
            <small>
              {item.reviewStatus === 'reviewed' ? 'Revisada' : 'Demonstração'}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}
