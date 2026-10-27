'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import styles from './showcase.module.css';

const tabs = ['Diagnóstico', 'Lacunas', 'Trilha'] as const;
const areas = [
  { name: 'Pediatria', value: 72 },
  { name: 'Clínica Médica', value: 64 },
  { name: 'Cirurgia Geral', value: 58 },
  { name: 'Ginecologia e Obstetrícia', value: 46 },
];

function AreaBars() {
  return (
    <ul className={styles.bars} aria-label="Percentuais fictícios por área">
      {areas.map((area) => (
        <li key={area.name}>
          <div className={styles.barLabel}>
            <span>{area.name}</span>
            <strong>{area.value}%</strong>
          </div>
          <div className={styles.track} aria-hidden="true">
            <span style={{ width: `${area.value}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DiagnosisPreview() {
  return (
    <div className={styles.preview}>
      <div className={styles.topline}>
        <span>IATRON / SUA PREPARAÇÃO</span>
        <span className={styles.dot} aria-hidden="true" />
      </div>
      <p className={styles.caption}>Exemplo ilustrativo</p>
      <h2 className={styles.previewTitle}>
        Um ponto de partida.
        <br />
        Um caminho que faz sentido.
      </h2>
      <p className={styles.muted}>Retrato por área · percentuais fictícios</p>
      <AreaBars />
      <div className={styles.nextStep}>
        <span className={styles.stepNumber} aria-hidden="true">
          01
        </span>
        <div>
          <strong>Próximo passo no exemplo</strong>
          <p>Fortalecer Ginecologia e Obstetrícia com uma sessão de revisão.</p>
        </div>
      </div>
      <p className={styles.disclaimer}>
        Demonstração visual. Não representa resultados de estudantes ou chance
        de aprovação.
      </p>
    </div>
  );
}

export function PlatformShowcase() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();

  function activate(index: number, focus = false) {
    setActive(index);
    if (focus) refs.current[index]?.focus();
    window.dispatchEvent(
      new CustomEvent('iatron:landing-event', {
        detail: { name: 'platform_demo_interaction', tab: tabs[index] },
      }),
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        next = (index + tabs.length - 1) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    activate(next, true);
  }

  return (
    <div className={styles.showcase}>
      <div className={styles.showcaseHeader}>
        <span className={styles.brand}>Iatron</span>
        <span className={styles.caption}>Exemplo ilustrativo</span>
      </div>
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Explore uma jornada ilustrativa"
      >
        {tabs.map((tab, index) => (
          <button
            type="button"
            role="tab"
            key={tab}
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            ref={(element) => {
              refs.current[index] = element;
            }}
            onClick={() => activate(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <span className={styles.tabNumber} aria-hidden="true">
              0{index + 1}
            </span>
            {tab}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel-0`}
        aria-labelledby={`${id}-tab-0`}
        tabIndex={0}
        hidden={active !== 0}
        className={styles.panel}
      >
        <div className={styles.panelIntro}>
          <p className={styles.eyebrow}>CONHEÇA SEU PONTO DE PARTIDA</p>
          <h3>O que fortalecer primeiro?</h3>
          <p>
            O diagnóstico reúne evidências das suas respostas para orientar os
            próximos estudos.
          </p>
          <span className={styles.note}>
            Percentuais fictícios, apenas para demonstrar a interface.
          </span>
        </div>
        <AreaBars />
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel-1`}
        aria-labelledby={`${id}-tab-1`}
        tabIndex={0}
        hidden={active !== 1}
        className={styles.panel}
      >
        <div className={styles.panelIntro}>
          <p className={styles.eyebrow}>ENTENDA SUAS PRIORIDADES</p>
          <h3>Uma lacuna é um próximo passo.</h3>
          <p>
            As prioridades consideram suas respostas, a confiança nas evidências
            e os critérios pedagógicos da plataforma.
          </p>
          <span className={styles.note}>
            Temas e domínio ilustrativos. Não são dados reais de estudantes.
          </span>
        </div>
        <ol className={styles.priorities}>
          <li>
            <span className={styles.priority}>Fortalecer primeiro</span>
            <h4>Pré-natal</h4>
            <p>Ginecologia e Obstetrícia · Domínio ilustrativo: 46%</p>
            <p>
              No exemplo, esta área precisa de mais estudo e prática para
              consolidar os fundamentos.
            </p>
          </li>
          <li>
            <span className={styles.priority}>Aprofundar na sequência</span>
            <h4>Cuidados perioperatórios</h4>
            <p>Cirurgia Geral · Domínio ilustrativo: 58%</p>
            <p>
              Revisar os pontos de dúvida e buscar novas evidências com
              questões.
            </p>
          </li>
        </ol>
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel-2`}
        aria-labelledby={`${id}-tab-2`}
        tabIndex={0}
        hidden={active !== 2}
        className={styles.panel}
      >
        <div className={styles.panelIntro}>
          <p className={styles.eyebrow}>TRANSFORME CLAREZA EM AÇÃO</p>
          <h3>Um estudo de cada vez.</h3>
          <p>
            Uma trilha organiza atividades e tempo disponível. Novas respostas
            ajudam a atualizar o próximo passo.
          </p>
          <span className={styles.note}>
            Tema do exemplo: Pré-natal. Tempos ilustrativos, sem atividades
            reais nesta demonstração.
          </span>
        </div>
        <ol className={styles.journey}>
          <li>
            <span className={styles.stepNumber} aria-hidden="true">
              01
            </span>
            <div>
              <span className={styles.priority}>
                Conteúdo recomendado · 10 min ilustrativos
              </span>
              <h4>Estudar Pré-natal</h4>
              <p>Ginecologia e Obstetrícia</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNumber} aria-hidden="true">
              02
            </span>
            <div>
              <span className={styles.priority}>
                Revisar · 20 min ilustrativos
              </span>
              <h4>Retomar os fundamentos de Pré-natal</h4>
              <p>Revisar os pontos que precisam de reforço.</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNumber} aria-hidden="true">
              03
            </span>
            <div>
              <span className={styles.priority}>
                Praticar · 15 min ilustrativos
              </span>
              <h4>Responder questões</h4>
              <p>Aplicar o que acabou de estudar.</p>
            </div>
          </li>
          <li>
            <span className={styles.stepNumber} aria-hidden="true">
              04
            </span>
            <div>
              <span className={styles.priority}>
                Reavaliar · 10 min ilustrativos
              </span>
              <h4>Reconhecer o que mudou</h4>
              <p>Usar novas evidências para orientar a continuidade.</p>
            </div>
          </li>
        </ol>
      </div>
      <p className={styles.footer}>
        Dados e atividades fictícios para demonstração. Seu plano depende do
        diagnóstico e da sua disponibilidade.
      </p>
    </div>
  );
}
