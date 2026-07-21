# ADR 0001: Fastify como framework da API

- Status: aceito
- Data: 2026-07-21

## Contexto

A API precisa ser stateless, versionada, validada, documentada com OpenAPI, capaz de realizar streaming por SSE e adequada ao Cloud Run. As opções autorizadas são NestJS e Fastify.

## Decisão

Usaremos Fastify. Seu núcleo pequeno, modelo de plugins, logs Pino integrados e suporte baseado em JSON Schema atendem diretamente ao bootstrap. A menor quantidade de abstrações também facilita separar os domínios sem antecipar uma estrutura excessiva.

## Consequências

- O código deve manter composição explícita por plugins e domínios conforme o produto crescer.
- Validação externa e contratos compartilhados usam Zod; schemas HTTP relevantes também são declarados para OpenAPI.
- Injeção de dependências será feita por composição e decorators tipados, sem container global nesta fase.
- NestJS poderia oferecer convenções e DI prontas, mas adicionaria uma camada maior antes de existirem fluxos de domínio que a justifiquem.
