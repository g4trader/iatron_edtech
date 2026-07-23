import { LoadingState } from '@/components/feedback/states';

export default function AppLoading() {
  return (
    <main className="page-container" data-narrow="true">
      <LoadingState label="Estamos organizando as informações mais importantes para você." />
    </main>
  );
}
