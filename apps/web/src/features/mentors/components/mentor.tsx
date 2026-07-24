import type { ReactNode } from 'react';
import type { Mentor } from '../mentors';

export function MentorAvatar({
  mentor,
  size = 'medium',
}: {
  mentor: Mentor;
  size?: 'small' | 'medium' | 'large';
}) {
  return (
    <span
      aria-hidden="true"
      className="mentor-avatar"
      data-size={size}
      data-specialty={mentor.id}
    >
      {mentor.initials}
    </span>
  );
}

export function MentorIdentity({
  mentor,
  compact = false,
}: {
  mentor: Mentor;
  compact?: boolean;
}) {
  return (
    <div className="mentor-identity">
      <MentorAvatar mentor={mentor} size={compact ? 'small' : 'medium'} />
      <span>
        <strong>{mentor.displayName}</strong>
        <small>{mentor.specialty}</small>
      </span>
    </div>
  );
}

export function MentorMessage({
  mentor,
  title,
  children,
  action,
}: {
  mentor: Mentor;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section
      aria-label={`Contexto de ${mentor.specialty}`}
      className="mentor-message"
    >
      <MentorAvatar mentor={mentor} size="large" />
      <div>
        <p className="eyebrow">Mentor da área: {mentor.displayName}</p>
        <h2>{title}</h2>
        <div className="mentor-message-copy">{children}</div>
        {action && <div className="mentor-message-action">{action}</div>}
      </div>
    </section>
  );
}

export function MentorCard({ mentor }: { mentor: Mentor }) {
  return (
    <article className="mentor-card">
      <MentorIdentity mentor={mentor} />
      <p>{mentor.description}</p>
    </article>
  );
}

export function TargetExamBadge({
  name,
  isSynthetic = false,
}: {
  name: string;
  isSynthetic?: boolean;
}) {
  return (
    <div className="target-exam-badge">
      <span>Preparação para</span>
      <strong>{name}</strong>
      {isSynthetic && (
        <small>Perfil demonstrativo, sem dados de provas oficiais.</small>
      )}
    </div>
  );
}

export function MentorRecommendation({
  mentor,
  children,
}: {
  mentor: Mentor;
  children: ReactNode;
}) {
  return (
    <div className="mentor-recommendation">
      <MentorIdentity compact mentor={mentor} />
      <div>
        <strong>Por que recomendamos este tema?</strong>
        {children}
      </div>
    </div>
  );
}
