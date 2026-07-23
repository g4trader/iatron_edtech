import { PageContainer } from '@/components/layout/page-container';
import { EmptyState } from '@/components/feedback/states';

export default function SimulationsPage() {
  return (
    <PageContainer>
      <section className="page-intro">
        <p className="eyebrow">Prática completa</p>
        <h1>Simulados</h1>
        <p>
          Em breve, você poderá testar seu preparo em condições próximas às da
          prova.
        </p>
      </section>
      <EmptyState
        title="Seus simulados aparecerão aqui"
        description="Enquanto preparamos essa experiência, use o diagnóstico para medir suas competências e orientar seu plano."
      />
    </PageContainer>
  );
}
