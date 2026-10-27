'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import styles from './showcase.module.css';

const tabs = ['Meu diagnóstico', 'Minha trilha', 'Minha evolução'] as const;
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

function TrailProgress() {
  return (
    <div className={styles.progress}>
      <div>
        <span>Progresso da trilha</span>
        <strong>2 de 5 etapas</strong>
      </div>
      <div className={styles.segments} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((step) => (
          <span key={step} data-complete={step < 2} />
        ))}
      </div>
    </div>
  );
}

export function DiagnosisPreview() {
  return (
    <div className={styles.preview}>
      <div className={styles.topline}>
        <span className={styles.brand}>Iatron</span>
        <span className={styles.caption}>Exemplo ilustrativo</span>
      </div>
      <h2 className={styles.previewTitle}>Seu mapa de aprendizagem</h2>
      <p className={styles.subtitle}>
        Uma visão organizada das suas prioridades de estudo.
      </p>
      <div className={styles.chartTitle}>
        <span>Domínio por área</span>
        <span>4 áreas</span>
      </div>
      <AreaBars />
      <div className={styles.nextStep}>
        <div>
          <span className={styles.eyebrow}>PRIORIDADE · PRÉ-NATAL</span>
          <strong>Revisar os fundamentos</strong>
          <span className={styles.muted}>Próxima atividade · 20 min</span>
        </div>
        <span className={styles.priorityValue}>
          46<span>%</span>
        </span>
      </div>
      <TrailProgress />
      <p className={styles.disclaimer}>
        Dados, tempos e progresso fictícios. Não são resultados de estudantes
        nem chance de aprovação.
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
      <div className={styles.workspace}>
        <aside className={styles.sidebar} aria-label="Resumo do exemplo">
          <span className={styles.eyebrow}>SUA JORNADA</span>
          <strong>Um próximo passo claro.</strong>
          <div className={styles.sidebarMetric}>
            <span>Áreas no mapa</span>
            <b>04</b>
          </div>
          <div className={styles.sidebarMetric}>
            <span>Foco atual</span>
            <b>Pré-natal</b>
          </div>
          <TrailProgress />
        </aside>
        <div
          className={styles.panel}
          role="tabpanel"
          id={`${id}-panel-0`}
          aria-labelledby={`${id}-tab-0`}
          tabIndex={0}
          hidden={active !== 0}
        >
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>SEU PONTO DE PARTIDA</p>
              <h3>Clareza antes de acelerar.</h3>
            </div>
            <span className={styles.caption}>Diagnóstico ilustrativo</span>
          </div>
          <div className={styles.diagnosticGrid}>
            <div>
              <div className={styles.chartTitle}>
                <span>Domínio por área</span>
                <span>%</span>
              </div>
              <AreaBars />
            </div>
            <div className={styles.gaps}>
              <span className={styles.eyebrow}>PRIORIDADES DE ESTUDO</span>
              <div>
                <span className={styles.priority}>Fortalecer primeiro</span>
                <h4>Pré-natal</h4>
                <p>Ginecologia e Obstetrícia</p>
                <strong>46% de domínio</strong>
              </div>
              <div>
                <span className={styles.priority}>Na sequência</span>
                <h4>Cuidados perioperatórios</h4>
                <p>Cirurgia Geral</p>
                <strong>58% de domínio</strong>
              </div>
            </div>
          </div>
          <div className={styles.insight}>
            <span aria-hidden="true">↗</span>
            <p>
              <strong>Do resultado à ação.</strong> Neste exemplo, revisar
              Pré-natal é o próximo passo antes de praticar com novas questões.
            </p>
          </div>
        </div>
        <div
          className={styles.panel}
          role="tabpanel"
          id={`${id}-panel-1`}
          aria-labelledby={`${id}-tab-1`}
          tabIndex={0}
          hidden={active !== 1}
        >
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>FOCO · PRÉ-NATAL</p>
              <h3>Seu estudo, em sequência.</h3>
            </div>
            <span className={styles.caption}>Tempos ilustrativos</span>
          </div>
          <ol className={styles.journey}>
            {[
              {
                label: 'Diagnóstico',
                title: 'Reconhecer as prioridades',
                time: '30 min',
                state: 'Concluída',
              },
              {
                label: 'Conteúdo recomendado',
                title: 'Estudar Pré-natal',
                time: '10 min',
                state: 'Concluída',
              },
              {
                label: 'Revisão',
                title: 'Retomar os fundamentos',
                time: '20 min',
                state: 'Próxima atividade',
              },
              {
                label: 'Prática',
                title: 'Responder questões',
                time: '15 min',
                state: 'Na sequência',
              },
              {
                label: 'Reavaliação',
                title: 'Reconhecer o que mudou',
                time: '10 min',
                state: 'Depois da prática',
              },
            ].map((item, index) => (
              <li
                key={item.label}
                data-current={item.state === 'Próxima atividade'}
              >
                <span className={styles.stepNumber} aria-hidden="true">
                  {item.state === 'Concluída' ? '✓' : `0${index + 1}`}
                </span>
                <div>
                  <span className={styles.priority}>{item.label}</span>
                  <h4>{item.title}</h4>
                  <span className={styles.activityState}>{item.state}</span>
                </div>
                <span className={styles.duration}>{item.time}</span>
              </li>
            ))}
          </ol>
        </div>
        <div
          className={styles.panel}
          role="tabpanel"
          id={`${id}-panel-2`}
          aria-labelledby={`${id}-tab-2`}
          tabIndex={0}
          hidden={active !== 2}
        >
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>CADA ETAPA CONTA</p>
              <h3>Perceba o que mudou.</h3>
            </div>
            <span className={styles.caption}>Evolução fictícia</span>
          </div>
          <div className={styles.evolutionGrid}>
            <div>
              <div className={styles.legend}>
                <span>
                  <i aria-hidden="true" />
                  Antes
                </span>
                <span>
                  <i aria-hidden="true" />
                  Agora
                </span>
              </div>
              <ul
                className={styles.comparisons}
                aria-label="Comparação fictícia de domínio por área"
              >
                {areas.map((area, index) => (
                  <li key={area.name}>
                    <strong>{area.name}</strong>
                    <div className={styles.comparisonRow}>
                      <span>Antes</span>
                      <div className={styles.track} aria-hidden="true">
                        <span
                          className={styles.before}
                          style={{ width: `${[60, 52, 42, 32][index]}%` }}
                        />
                      </div>
                      <b>{[60, 52, 42, 32][index]}%</b>
                    </div>
                    <div className={styles.comparisonRow}>
                      <span>Agora</span>
                      <div className={styles.track} aria-hidden="true">
                        <span style={{ width: `${area.value}%` }} />
                      </div>
                      <b>{area.value}%</b>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.evolutionSummary}>
              <div>
                <span className={styles.eyebrow}>ATIVIDADES CONCLUÍDAS</span>
                <strong className={styles.largeMetric}>08</strong>
                <span className={styles.muted}>em 2 semanas ilustrativas</span>
              </div>
              <div>
                <span className={styles.eyebrow}>HISTÓRICO DO EXEMPLO</span>
                <p>Semana 1 · diagnóstico e estudo</p>
                <p>Semana 2 · prática e reavaliação</p>
              </div>
              <div>
                <span className={styles.eyebrow}>PRÓXIMO OBJETIVO</span>
                <h4>Consolidar Pré-natal</h4>
                <p>Revisar dúvidas e reunir novas evidências.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className={styles.footer}>
        Exemplo ilustrativo: dados, atividades, tempos e evolução são fictícios.
        Não representam estudantes reais nem chance de aprovação.
      </p>
    </div>
  );
}
