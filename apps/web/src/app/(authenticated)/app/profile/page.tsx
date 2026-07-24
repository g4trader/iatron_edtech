import { PageContainer } from '@/components/layout/page-container';
import { getAuthState } from '@/lib/auth';
import { examIntelligenceContext } from '@/features/exam-intelligence/server/context';

export default async function ProfilePage() {
  const { user, profile } = await getAuthState();
  const examContext = await examIntelligenceContext().catch(() => null);

  return (
    <PageContainer narrow>
      <main className="profile-page">
        <header className="page-intro">
          <p className="eyebrow">Seu perfil</p>
          <h1>As escolhas que orientam sua jornada</h1>
          <p>
            Aqui você confere as informações usadas para manter sua preparação
            conectada ao seu objetivo.
          </p>
        </header>
        <dl className="profile-summary">
          <div>
            <dt>Nome</dt>
            <dd>{profile?.display_name ?? 'Estudante'}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{user?.email ?? 'E-mail não disponível'}</dd>
          </div>
          <div>
            <dt>Objetivo atual</dt>
            <dd>
              {examContext?.availability === 'available'
                ? examContext.profile.program.code
                : 'Sua prova de residência'}
            </dd>
          </div>
        </dl>
        <p className="profile-help">
          Sua rotina e suas preferências continuam sendo consideradas sempre que
          o plano organiza os próximos passos.
        </p>
      </main>
    </PageContainer>
  );
}
