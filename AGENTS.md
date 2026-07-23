# CONTEXTO DO PROJETO

# GOVERNANÇA OBRIGATÓRIA

Antes de qualquer implementação, leia integralmente:

1. `docs/product/UX_PRINCIPLES.md`;
2. `docs/product/VOICE_AND_TONE.md`;
3. `docs/product/ARCHITECTURAL_PRINCIPLES.md`;
4. `docs/product/DEFINITION_OF_DONE.md`;
5. `docs/product/AI_DEVELOPMENT_GUIDE.md`.

Para mudanças de interface, aplique também
`docs/product/DESIGN_REVIEW_CHECKLIST.md`. Para revisar entregas, siga
`docs/product/CODE_REVIEW_GUIDELINES.md`.

Esses documentos são parte da arquitetura. Nenhuma fase ou funcionalidade pode
ser declarada concluída sem executar a Definition of Done, validar staging e
registrar as evidências aplicáveis.

Você é o engenheiro principal responsável por desenvolver uma plataforma AI First de preparação para provas de residência médica no Brasil.

O produto terá como interface principal uma experiência conversacional inspirada nos padrões de usabilidade do ChatGPT, tanto em desktop quanto em dispositivos móveis, sem copiar marcas, logotipos, textos, ícones proprietários ou elementos protegidos da OpenAI.

A interface conversacional será o principal meio pelo qual o estudante:

* selecionará as provas e instituições para as quais pretende se preparar;
* realizará avaliações diagnósticas;
* responderá questões;
* receberá explicações;
* visualizará seus gaps de aprendizagem;
* receberá planos de estudos;
* realizará simulados adaptativos;
* acompanhará sua evolução;
* solicitará revisões e explicações adicionais.

O sistema deverá avaliar continuamente o domínio do estudante, identificar gaps específicos e recomendar ações para reduzir esses gaps.

O fluxo pedagógico central é:

Diagnosticar → identificar gaps → prescrever estudo → praticar → reavaliar → ajustar o plano.

# STACK OBRIGATÓRIA

Use a seguinte arquitetura:

## Monorepo

* pnpm workspaces;
* Turborepo;
* TypeScript em modo strict;
* ESLint;
* Prettier;
* testes automatizados;
* Husky e lint-staged, quando apropriado.

## Frontend

* Next.js com App Router;
* React;
* TypeScript;
* Tailwind CSS;
* componentes acessíveis;
* componentes próprios ou biblioteca headless;
* Vercel AI SDK apenas quando ele simplificar streaming e estado conversacional;
* hospedagem na Vercel;
* PWA-ready;
* layout responsivo;
* suporte futuro a dark mode;
* idioma inicial: português do Brasil.

## Backend

* Node.js com TypeScript;
* NestJS ou Fastify, escolhendo uma única opção e justificando-a no ADR;
* API REST versionada;
* suporte a Server-Sent Events para streaming;
* OpenAPI;
* validação de entrada;
* execução em Google Cloud Run;
* Dockerfile multi-stage;
* configuração stateless;
* health checks;
* logs estruturados.

## Banco de dados

* Supabase PostgreSQL;
* Supabase Auth;
* Supabase Storage;
* extensão pgvector;
* Row Level Security;
* migrations versionadas;
* nenhum acesso privilegiado diretamente pelo navegador.

## IA

* OpenAI Responses API;
* streaming de respostas;
* tool calling;
* Structured Outputs;
* embeddings para recuperação de conteúdo homologado;
* prompts versionados;
* auditoria de chamadas;
* limites de uso;
* proteção contra prompt injection;
* nenhuma chave da OpenAI exposta no frontend.

## Google Cloud

* Cloud Run para a API;
* Artifact Registry;
* Secret Manager;
* Cloud Logging;
* Cloud Tasks para tarefas assíncronas;
* Pub/Sub apenas quando houver benefício claro;
* Cloud Run Jobs para processamentos longos ou em lote.

# PRINCÍPIOS DO PRODUTO

1. O modelo de IA não é a única fonte de verdade.
2. Notas, domínio, prioridade de gaps e resultados de provas devem ser calculados pelo backend.
3. A IA explica e personaliza decisões, mas não inventa métricas.
4. Conteúdo médico deve possuir fonte, versão e status de revisão.
5. Questões devem estar vinculadas a competências pedagógicas.
6. Dados clínicos sensíveis ou desnecessários não devem ser solicitados.
7. A plataforma é educacional e não deve prestar atendimento médico.
8. Toda ação relevante deve ser auditável.
9. A interface deve funcionar perfeitamente em desktop e mobile.
10. A experiência deve ser rápida, fluida e centrada no chat.

# REGRAS DE ENGENHARIA

* Não implemente funcionalidades fictícias.
* Não deixe funções críticas apenas com comentários TODO.
* Não use dados sensíveis em logs.
* Não armazene chaves no repositório.
* Não faça chamadas da OpenAI diretamente do navegador.
* Não permita que o modelo determine sozinho notas ou domínio.
* Não misture domínio pedagógico com componentes de apresentação.
* Não introduza dependências sem necessidade.
* Não use `any`, exceto quando inevitável e documentado.
* Não crie tabelas sem índices, constraints e políticas RLS adequadas.
* Não gere uma aplicação monolítica difícil de testar.
* Não copie pixel a pixel a interface do ChatGPT.

# PADRÃO DE EXECUÇÃO

Antes de alterar código:

1. Analise o repositório existente.
2. Leia README, documentação e arquivos de configuração.
3. Informe resumidamente o que será alterado.
4. Identifique riscos e decisões necessárias.
5. Implemente a menor unidade funcional completa.
6. Execute lint, typecheck e testes.
7. Corrija os erros encontrados.
8. Atualize a documentação.
9. Apresente os arquivos alterados e as decisões tomadas.

Caso o repositório esteja vazio, crie a estrutura inicial.

Não implemente todo o produto de uma vez. Trabalhe por fases pequenas e verificáveis.

# ARQUITETURA DE DOMÍNIOS

Organize o sistema nos seguintes domínios:

* identity;
* students;
* institutions;
* exams;
* medical-taxonomy;
* question-bank;
* assessments;
* answers;
* mastery;
* learning-gaps;
* study-plans;
* simulations;
* content-library;
* conversations;
* ai-orchestration;
* analytics;
* audit;
* administration.

# RESULTADO ESPERADO

A plataforma deve permitir que um estudante:

1. crie uma conta;
2. selecione as provas de residência desejadas;
3. informe data de prova e disponibilidade semanal;
4. realize uma avaliação diagnóstica;
5. responda questões através de uma interface integrada ao chat;
6. receba um relatório de domínio;
7. identifique gaps por área, tema, subtema e competência;
8. receba um plano de estudos;
9. faça simulados direcionados;
10. seja reavaliado até demonstrar domínio estável.

Use estas instruções como contexto permanente durante todo o desenvolvimento.
