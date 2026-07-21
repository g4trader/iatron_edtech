import { PageContainer } from '@/components/layout/page-container';
import {
  GapSummaryCard,
  MasteryMeter,
} from '@/features/learning/components/learning-cards';

const areas = [
  ['Clínica Médica', 62],
  ['Cirurgia', 48],
  ['Pediatria', 71],
  ['Ginecologia e Obstetrícia', 55],
  ['Medicina Preventiva', 67],
] as const;

export default function PerformancePage() {
  return (
    <PageContainer>
      <div className="demo-banner">
        Dados exclusivamente demonstrativos — nenhuma métrica pedagógica real
        foi calculada.
      </div>
      <section className="page-intro">
        <p className="eyebrow">Visão geral</p>
        <h2>Desempenho demonstrativo</h2>
        <p>
          Uma prévia de como seus sinais de aprendizagem poderão ser
          apresentados.
        </p>
      </section>
      <div className="metric-grid">
        <article>
          <span>Atividades</span>
          <strong>24</strong>
          <small>exemplo visual</small>
        </article>
        <article>
          <span>Questões</span>
          <strong>186</strong>
          <small>exemplo visual</small>
        </article>
        <article>
          <span>Consistência</span>
          <strong>4 dias</strong>
          <small>exemplo visual</small>
        </article>
      </div>
      <div className="two-column">
        <section className="structured-card">
          <h2>Domínio por grande área</h2>
          <div className="stack-list">
            {areas.map(([area, value]) => (
              <MasteryMeter key={area} label={area} value={value} />
            ))}
          </div>
        </section>
        <section>
          <h2 className="section-title">Gaps prioritários</h2>
          <GapSummaryCard
            data={{
              id: 'g1',
              area: 'Clínica Médica',
              topic: 'Raciocínio diagnóstico',
              priority: 'high',
              mastery: 42,
            }}
          />
          <div className="trend-card">
            <p className="eyebrow">Evolução recente</p>
            <h3>Tendência visual estável</h3>
            <div
              className="trend-bars"
              aria-label="Barras demonstrativas de evolução"
            >
              {[30, 42, 38, 55, 62, 68].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
