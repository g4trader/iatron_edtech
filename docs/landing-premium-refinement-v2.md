# Landing premium — refinamento V2 (27/10/2026)

## 1. Resumo executivo

Refinamento incremental da LP publicada em `8a94bb4`. Arquitetura de informação,
ordem das seções, identidade, podcast, autenticação e rotas internas preservadas.
Prioridade: demonstrar diagnóstico, trilha e acompanhamento com menos explicação
institucional. O usuário autorizou explicitamente alterações e deploy direto,
sem etapa de aprovação de preview. CI e validação visual continuam obrigatórias.

## 2. Arquivos modificados

Caminhos relativos a `apps/web/src`:

- `app/(public)/page.tsx` e `page.test.tsx`;
- `features/landing/content.ts`;
- `features/landing/landing-sections.tsx` e `landing.module.css`;
- `features/landing/platform-showcase.tsx`, `showcase.module.css` e
  `platform-showcase.test.tsx`;
- novos `features/landing/learning-journey.tsx`, `journey.module.css` e
  `mentor-portrait.tsx`.

Também: `apps/web/e2e/landing.spec.ts` e este relatório.

## 3. Decisões visuais e segunda passagem

Hero: painel de software mais compacto, sem moldura externa redundante, prioridade,
atividade e progresso junto às quatro áreas. Redução de espaçamento e maior largura
para a interface. Identidade verde/off-white e fontes existentes preservadas.

Jornada: quatro miniinterfaces distintas conectadas, horizontais no desktop e
verticais no mobile. Mantida estática porque a exploração interativa já existe na
demonstração; não acrescentamos controles decorativos.

IA + curadoria: fluxo visual das respostas às prioridades e explicações, conectado
aos pilares da proposta médica. O sistema calcula prioridades; IA explica.
Nenhum status de revisão clínica é inventado ou atribuído aos médicos.

Comunidade: mensagens fictícias entre participantes genéricos, claramente rotuladas.
Sem médicos falando, membros/horários inventados, disponibilidade ou grupo público.
Mentoria: percurso editorial de escolhas, fundo verde e CTA de alto contraste.

Após inspecionar as capturas da primeira versão V2 e comparar com V1, a segunda
passagem encurtou o título da jornada, a introdução da demonstração, a descrição
repetida dos mentores e o encerramento. A revisão da aba de trilha também alinhou os indicadores: duas atividades concluídas em cinco, com a revisão como próximo passo, coerente com o hero. Não foram adicionadas seções.

## 4. Demonstração da plataforma

- **Meu diagnóstico:** quatro áreas, prioridades de Pré-natal e cuidados
  perioperatórios, síntese e próximo passo.
- **Minha trilha:** diagnóstico, conteúdo, revisão, prática e reavaliação; tempos ilustrativos.
- **Minha evolução:** comparativos Antes/Agora por área, histórico de duas semanas,
  atividades concluídas e próximo objetivo, todos fictícios.

As abas mudam efetivamente o conteúdo e mantêm roving tabindex, setas, Home/End,
ARIA e foco. Aviso persistente identifica dados, tempos e evolução ilustrativos.
Não há chamadas a APIs, dados privados nem promessa de resultado.

## 5. Conversão e eventos

Ação principal: **Descobrir meu ponto de partida** → `/cadastro`. Microcopy explica
que a conta precede o diagnóstico. Repetida após a demo e no encerramento.
Secundária no hero: **Entenda como funciona** → `#como-funciona`.

Comunidade e mentoria: os CTAs agora expandem informações reais de disponibilidade
com `<details>/<summary>`, sem formulário ou contratação fictícios. Podcast segue
no YouTube oficial. Header/login não foram alterados.

Eventos locais existentes preservados, inclusive `platform_demo_interaction`;
labels de aba passam aos nomes V2. Continua sem coletor, rede, cookies ou PII.
Não há cadastro concluído inferido de clique. CTA fixo mobile não foi adicionado:
a ação está na primeira dobra e reaparece após a demo, sem cobrir a interface.

## 6. Responsividade

Matriz: 320×812, 375×812, 390×844, 768×1024, 1024×768, 1366×768,
1440×900 e 1920×1080. E2E verifica overflow e primeira dobra mobile.
Painéis se reorganizam verticalmente; sidebar demonstrativa não comprime o mobile.
Mentores passam a linhas editoriais com identidade e texto lado a lado.

## 7. Validação

- Lint, typecheck, testes do monorepo e build aprovados localmente.
- Testes da LP: 26 E2Es aprovados; 4 skips intencionais da matriz duplicada.
- Menu, tabs/teclado, FAQ, detalhes das ofertas, cadastro/login, oito larguras e
  axe nas três abas aprovados; sem violações críticas/sérias.
- Capturas desktop/mobile da primeira V2 inspecionadas; segunda passagem editorial
  e build final executados. Validação publicada e CI registradas no PR.
- Testes locais simulam somente iframe externo e autenticação pelo mecanismo
  existente. Não equivalem a autenticação real, e-mail ou reprodução audiovisual.
- Sem novas dependências, secrets, variáveis ou migrations.
- Warnings existentes de Turbo outputs e NO_COLOR/FORCE_COLOR permanecem.
- Sem dados de LCP/CLS/INP p75 ou alegação de ganho de conversão medido.

## 8. Evidências

Capturas preservadas em `iatron-evidence/2026-10-27/premium-refinement-v2`, fora do
repositório. Comparação V1: `premium-landing/published` no mesmo diretório de data.
Capturas finais e de publicação são identificadas separadamente, com seus limites
no PR. Conteúdo e resultados ilustrativos não são evidência de aprendizagem real.

## 9. Pendências

Fotografias oficiais e biografias verificadas continuam indisponíveis no repositório.
O novo `MentorPortrait` aceita imagem oficial local com alt e layout reservado;
identidades atuais permanecem até o fornecimento. Nenhuma foto de banco ou IA.

Continuam pendentes: regras/link da comunidade, formato/agenda/condições da mentoria,
documentos legais, contato institucional e analytics com consentimento. Não impedem
publicar a apresentação transparente das ofertas como em preparação.

## 10. Antes → depois

| Área           | V1                                   | V2                                                              |
| -------------- | ------------------------------------ | --------------------------------------------------------------- |
| Hero           | Barras e recomendação em painel alto | Mapa compacto com prioridade, atividade e progresso             |
| Plataforma     | Diagnóstico, lacunas e trilha        | Diagnóstico integrado às lacunas, trilha e evolução             |
| Jornada        | Quatro descrições                    | Quatro miniinterfaces conectadas, vertical no mobile            |
| IA + curadoria | Parágrafos e listas                  | Fluxo tecnológico e pilares de curadoria complementares         |
| Mentores       | Iniciais em arco e texto repetido    | Identidade editorial, papel conciso e suporte a foto oficial    |
| Comunidade     | Lista abstrata de benefícios         | Conversa ilustrativa e informações expansíveis                  |
| Mentoria       | Lista de temas                       | Percurso de escolhas e CTA que revela disponibilidade           |
| Conversão      | CTA de conhecer a trilha             | Diagnóstico como porta de entrada, com cadastro explícito       |
| Mobile         | Grades e painéis básicos             | Jornada vertical, mentores em linhas e dashboards reorganizados |

Rollback: reverter o commit de refinamento e republicar frontend pelo pipeline
oficial, mantendo alinhamento de versão. Nenhuma alteração de esquema ou dados.
