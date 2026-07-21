# ADR 0002: divisão entre Vercel, Supabase e Google Cloud

- Status: aceito
- Data: 2026-07-21

## Contexto

O produto exige uma experiência web rápida, persistência PostgreSQL com autenticação e RLS, além de processamento seguro e escalável para IA e tarefas assíncronas.

## Decisão

- **Vercel:** hospeda apenas o frontend Next.js, previews e recursos públicos da experiência web.
- **Supabase:** fornece PostgreSQL, pgvector, Auth e Storage. RLS protege acesso do usuário, mas operações privilegiadas são exclusivas da API.
- **Google Cloud:** executa a API no Cloud Run, armazena imagens no Artifact Registry, segredos no Secret Manager, logs no Cloud Logging e tarefas no Cloud Tasks ou Cloud Run Jobs.

O frontend chama a API versionada. A API aplica autorização e regras de negócio, calcula métricas pedagógicas e integra Supabase e OpenAI. O modelo não calcula notas nem persiste decisões sem validação do backend.

## Consequências

- Não haverá chave privilegiada ou chave OpenAI no navegador.
- CORS, autenticação e correlação de requisições deverão ser configurados antes da primeira integração web/API.
- Serviços possuem ambientes isolados e contratos explícitos.
- Pub/Sub só será introduzido quando existir necessidade concreta de fan-out ou eventos desacoplados.
