import styles from './journey.module.css';

const areas = [
  ['Pediatria', 72],
  ['Clínica Médica', 64],
  ['Cirurgia Geral', 58],
  ['Ginecologia e Obstetrícia', 46],
] as const;

/** Static interface examples: no student data or pedagogical calculations. */
export function LearningProgression() {
  return (
    <div className={styles.progression}>
      <p className={styles.example}>
        Uma jornada ilustrativa, do diagnóstico à continuidade.
      </p>
      <ol className={styles.steps} aria-label="Etapas da preparação">
        <li className={styles.step}>
          <div className={styles.heading}>
            <span className={styles.number} aria-hidden="true">
              01
            </span>
            <h3>Diagnóstico</h3>
          </div>
          <p className={styles.description}>
            Reconheça o que já sabe em cada área.
          </p>
          <div className={styles.diagnosis}>
            <span className={styles.label}>Retrato por área</span>
            <ul
              className={styles.bars}
              aria-label="Percentuais ilustrativos por área"
            >
              {areas.map(([name, value]) => (
                <li key={name}>
                  <div>
                    <span>{name}</span>
                    <strong>{value}%</strong>
                  </div>
                  <div className={styles.track} aria-hidden="true">
                    <span style={{ width: `${value}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </li>
        <li className={styles.step}>
          <div className={styles.heading}>
            <span className={styles.number} aria-hidden="true">
              02
            </span>
            <h3>Lacunas</h3>
          </div>
          <p className={styles.description}>
            Entenda quais temas fortalecer primeiro.
          </p>
          <div className={styles.priorities}>
            <span className={styles.label}>Prioridades do exemplo</span>
            <ol>
              <li>
                <span className={styles.priority}>Primeiro</span>
                <strong>Pré-natal</strong>
                <span>Ginecologia e Obstetrícia</span>
              </li>
              <li>
                <span className={styles.priority}>Na sequência</span>
                <strong>Cuidados perioperatórios</strong>
                <span>Cirurgia Geral</span>
              </li>
            </ol>
          </div>
        </li>
        <li className={styles.step}>
          <div className={styles.heading}>
            <span className={styles.number} aria-hidden="true">
              03
            </span>
            <h3>Trilha</h3>
          </div>
          <p className={styles.description}>
            Transforme prioridades em ações de estudo.
          </p>
          <div className={styles.plan}>
            <span className={styles.label}>Seu próximo tema</span>
            <strong className={styles.topic}>Pré-natal</strong>
            <ol>
              <li>
                <span className={styles.activityNumber}>1</span>
                <span>Estudar o conteúdo</span>
              </li>
              <li>
                <span className={styles.activityNumber}>2</span>
                <span>Revisar fundamentos</span>
              </li>
              <li>
                <span className={styles.activityNumber}>3</span>
                <span>Praticar com questões</span>
              </li>
            </ol>
          </div>
        </li>
        <li className={styles.step}>
          <div className={styles.heading}>
            <span className={styles.number} aria-hidden="true">
              04
            </span>
            <h3>Evolução</h3>
          </div>
          <p className={styles.description}>
            Acompanhe atividades e reavalie o próximo passo.
          </p>
          <div className={styles.evolution}>
            <span className={styles.label}>Continuidade do estudo</span>
            <div className={styles.count}>
              <strong>
                2<span> / 5</span>
              </strong>
              <span>atividades concluídas</span>
            </div>
            <div className={styles.progress} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className={styles.next}>
              <span>Depois da prática</span>
              <strong>Reavaliar o conhecimento</strong>
            </div>
          </div>
        </li>
      </ol>
      <p className={styles.disclaimer}>
        Dados e atividades fictícios para demonstrar a experiência. Seu percurso
        depende do diagnóstico e das novas respostas.
      </p>
    </div>
  );
}
