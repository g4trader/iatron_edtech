import { PageContainer } from '@/components/layout/page-container';
import { SimulationResultCard } from '@/features/learning/components/learning-cards';

const formats = [
  ['Rápido', '10 questões para uma sessão curta.'],
  ['Direcionado', 'Foco em um tema selecionado.'],
  ['Por banca', 'Estrutura visual por instituição.'],
  ['Retenção', 'Revisão de conteúdos já estudados.'],
] as const;

export default function SimulationsPage() {
  return (
    <PageContainer>
      <section className="page-intro">
        <p className="eyebrow">Prática demonstrativa</p>
        <h2>Escolha um formato de simulado</h2>
        <p>
          As opções não executam seleção adaptativa ou correção real nesta fase.
        </p>
      </section>
      <div className="simulation-grid">
        {formats.map(([title, description], index) => (
          <article className="simulation-card" key={title}>
            <span className="format-number">0{index + 1}</span>
            <h2>Simulado {title.toLowerCase()}</h2>
            <p>{description}</p>
            <button className="secondary-button" type="button">
              Configurar
            </button>
          </article>
        ))}
      </div>
      <section className="content-section">
        <h2>Histórico fictício</h2>
        <SimulationResultCard
          data={{
            title: 'Simulado de demonstração',
            answered: 18,
            total: 20,
            label: 'Concluído em 12 jul · sem nota real',
          }}
        />
      </section>
    </PageContainer>
  );
}
