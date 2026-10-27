# Landing page premium — 27/10/2026

## Escopo e decisões

Reformulação somente da rota pública `/`. Cadastro, login, recuperação de
senha, aplicação autenticada, APIs, banco, secrets e infraestrutura preservados.
Header comercial montado apenas na raiz; estilos em CSS Modules.

Auditoria antes da implementação: Next.js App Router, tokens verde/off-white,
fontes do sistema, sem fotografias/fontes/assets institucionais versionados.
Cadastro Supabase, onboarding, diagnóstico, domínio/gaps, plano e explicações
com IA têm implementação real. Simulados independentes não estão disponíveis
(a rota redireciona) e não são promovidos. Comunidade e mentoria de carreira são
propostas planejadas, sem inscrição, agenda ou integração existentes.

Domínio, prioridades e planos são calculados pelo backend. A IA explica e
contextualiza; a LP não atribui esses cálculos ao modelo. Curadoria não equivale
à revisão individual de todas as respostas. Mentores seguem o registro canônico
já autorizado, incluindo Dr. João Garcia; sem títulos, fotos ou biografias
inventados. Dados, percentuais e tempos da demo são explícita e persistentemente
ilustrativos, não evidência de resultado, aprovação ou estudante real.

## Arquitetura e conversão

- Hero com diagnóstico ilustrativo e cadastro como ação primária.
- Problema, jornada, IA e curadoria, demo com três abas, quatro mentores.
- Comunidade e mentoria com status em preparação e detalhes locais reais.
- Podcast oficial preservado (episódio PEKL4AgCtMQ), FAQ nativo e CTA final.
- Footer somente com destinos existentes; sem páginas legais fictícias.
- `/cadastro`: hero, header, demo e encerramento. Cadastro não significa
  diagnóstico imediato: microcopy explica conta → diagnóstico.
- `#como-funciona`, `#plataforma`, `#mentores`, `#comunidade`, `#mentoria`:
  navegação interna. CTAs de comunidade/mentoria levam às respectivas descrições.
- Podcast: link externo oficial com aviso de nova aba e iframe lazy privacy-enhanced.
- Metadata específica, canonical, Open Graph e Twitter summary sem imagens ou
  avaliações inventadas. Nenhuma alteração a robots/proxy ou exposição das rotas
  autenticadas em sitemap.

## Eventos e privacidade

Não há GA4, GTM ou outro coletor configurado. O ponto de integração local é
`window` / `CustomEvent('iatron:landing-event')`. Não envia rede, não persiste
cookies/storage e não contém PII. Um adaptador futuro precisa respeitar a política
de consentimento e não duplicar pageviews.

Eventos locais: `lp_view` (uma vez por montagem, protegido de efeitos duplicados
em StrictMode), `hero_primary_cta_click`, `hero_secondary_cta_click`,
`platform_cta_click`, `platform_demo_interaction` (aba), `community_cta_click`,
`career_mentoring_cta_click`, `podcast_play_click` (clique no link externo, não
confirma reprodução), `faq_interaction` (índice da pergunta aberta),
`final_cta_click`. Não há perfil de mentor navegável, portanto não há evento de
perfil. Não emitimos `signup_started` nem `signup_completed` a partir de cliques
na LP. A confirmação de cadastro deve ser instrumentada futuramente no fluxo
real, com consentimento. Eventos locais não constituem mensuração persistida.

## Pendências institucionais

Fotografias profissionais autorizadas, biografias e credenciais verificadas;
link/regras da comunidade; escopo, disponibilidade, condições e inscrição da
mentoria; textos e URLs de termos/privacidade; contato institucional; provedor e
consentimento de analytics. Nenhuma dessas informações foi inventada. As seções
planejadas não oferecem contratação nem simulam coleta de interesse.

## Validação e publicação

Resultados e evidências finais registrados no PR. Meta de performance é referência,
não resultado medido em usuários reais: não há dados de LCP/CLS/INP p75.
A avaliação de clareza em cinco segundos ainda requer pesquisa com usuários.
Acessibilidade automatizada e teclado não equivalem a auditoria completa WCAG
ou teste com leitor de tela.

A solicitação proíbe deploy em produção sem autorização explícita. A entrega deve
permanecer em branch/PR e preview até aprovação; não promover para o domínio
canônico nem integrar em main, que dispara publicação automática. A validação do
preview não equivale ao aceite final em staging canônico alinhado ao backend.
Rollback após eventual publicação: reverter o commit da reformulação e promover
a versão anterior do frontend; nenhuma migration ou alteração de backend.

## Evidências locais da implementação

- `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build`: aprovados.
  Suite web: 110 testes; demais domínios também passaram (cache do Turbo quando
  aplicável). Guardas cloud: 9 testes aprovados.
- E2E da LP: 21 aprovados, 4 skips intencionais (matriz executada uma vez no
  projeto desktop, não repetida nos outros perfis).
- Viewports: 320×812, 375×812, 390×844, 768×1024, 1024×768,
  1366×768, 1440×900, 1920×1080. Sem overflow em menu aberto/fechado;
  ação principal dentro da primeira dobra nos celulares.
- Teclado: menu/Escape/âncoras, abas/setas/Home/End, FAQ nativo; skip link.
- Axe: nenhuma violação crítica/séria nas três abas, em cinco perfis.
- Inspeção visual: hero e seções em desktop/mobile, segunda passagem após
  corrigir contraste secundário e escala do título da prévia. E2E usa mock
  somente do iframe externo do YouTube; essa captura não comprova reprodução.
- Cadastro e login: navegação chega aos formulários; testes locais usam o bypass
  de autenticação já existente para E2E. Não comprovam entrega de e-mail, sessão
  real ou conclusão de cadastro em provedor externo.
- Warnings preexistentes: Turbo sem outputs de teste, NO_COLOR/FORCE_COLOR.

Arquivos alterados/criados: `app/(public)/{page.tsx,page.test.tsx,layout.tsx}`;
`features/landing/{content.ts,landing-sections.tsx,landing.module.css,
landing-events.tsx,landing-events.test.tsx,public-header.tsx,header.module.css,
public-header.test.tsx,platform-showcase.tsx,showcase.module.css,
platform-showcase.test.tsx}`; `e2e/landing.spec.ts`; este relatório.
Caminhos do frontend relativos a `apps/web/src`, exceto E2E em `apps/web`.
