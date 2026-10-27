import styles from './proficiency-bar.module.css';
/** Presentation only. Values come from the caller; this component never estimates mastery. */
export function ProficiencyBar({
  label,
  percent,
  description,
}: {
  label: string;
  percent: number;
  description?: string;
}) {
  if (!Number.isFinite(percent) || percent < 0 || percent > 100)
    return <p>{label}: evidência indisponível</p>;
  const display = Math.round(percent);
  return (
    <div className={styles.bar}>
      <div className={styles.label}>
        <span>{label}</span>
        <strong>{display}%</strong>
      </div>
      <div
        className={styles.track}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${display}%${description ? ` — ${description}` : ''}`}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      {description && <small>{description}</small>}
    </div>
  );
}
