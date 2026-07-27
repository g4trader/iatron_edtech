# Iatron — Technical Handoff

Snapshot técnico para uma sessão sem memória anterior. Este documento orienta
a entrada; não substitui governança, ADR, tarefa vigente nem evidência do
ambiente.

## Ordem obrigatória de leitura

1. [`AGENTS.md`](../../AGENTS.md)
2. [`AGENT_BOOTSTRAP.md`](AGENT_BOOTSTRAP.md)
3. [`IATRON_CONSTITUTION.md`](IATRON_CONSTITUTION.md)
4. [`CURRENT_STATE.md`](CURRENT_STATE.md)
5. [`REPOSITORY_MAP.md`](REPOSITORY_MAP.md)
6. [`OPERATIONS_RUNBOOK.md`](OPERATIONS_RUNBOOK.md)
7. RFC ou tarefa vigente
8. ADRs relacionadas em [`../adr/`](../adr/)

Use a Constituição como fonte do ciclo central, das regras absolutas e do
fechamento do MVP. Leia-a em conjunto com [`PRODUCT_VISION.md`](PRODUCT_VISION.md),
[`PRODUCT_PRINCIPLES.md`](PRODUCT_PRINCIPLES.md),
[`ARCHITECTURAL_PRINCIPLES.md`](ARCHITECTURAL_PRINCIPLES.md) e
[`PRODUCT_BIBLE.md`](PRODUCT_BIBLE.md). O backlog deste snapshot deriva do
artigo 22 e está registrado no [`ACTIVE_BACKLOG.md`](ACTIVE_BACKLOG.md).

## Primeiro minuto

No diretório raiz:

```bash
git status --short --branch
git rev-parse HEAD
git log --oneline --decorate --max-count=12 --all
git diff --check
```

Depois compare:

- Git: `HEAD`, `origin/main`, `origin/staging`;
- web: SHA do deployment Vercel;
- API: `GET /v1/meta`;
- banco: baseline retornada por `/v1/meta` e migrations remotas;
- CI: execução referente ao SHA que será entregue.

Não trate documentação, código, CI e ambiente como se fossem automaticamente
sincronizados.

## Regras de segurança

- Nunca mostrar, copiar para documentação ou registrar senha, token, JWT,
  cookie, service role, URL com credencial ou link de recuperação.
- Vercel recebe somente configuração pública `NEXT_PUBLIC_*`.
- Segredos de runtime da API ficam no Secret Manager e são injetados no Cloud
  Run.
- Segredos de automação ficam no GitHub Environment correto.
- Identidade, papel e ownership vêm do JWT validado e do backend, nunca de IDs
  enviados pelo cliente.
- RLS permanece ativa; acesso privilegiado nunca ocorre no navegador.
- Antes de comando remoto ou destrutivo, confirme projeto, ambiente e autorização.
- Produção exige autorização explícita; staging é o ambiente de validação atual.

## Como validar autorização

Uma tarefa está autorizada somente quando:

1. o pedido vigente define objetivo e limites;
2. não viola `AGENTS.md` nem os documentos normativos;
3. decisões bloqueantes estão resolvidas no
   [`DECISION_REGISTER.md`](DECISION_REGISTER.md);
4. conteúdo, prova, mentor, estatística ou IA clínica respeitam
   [`EDITORIAL_GOVERNANCE.md`](EDITORIAL_GOVERNANCE.md);
5. qualquer mudança de fronteira arquitetural possui ADR e aprovação explícita.

Ausência de proibição não autoriza mudança de produto, produção ou dados.

## Como evitar duplicação de domínio

Antes de criar entidade, regra, rota ou estado:

1. procure o contrato em `packages/contracts`;
2. procure tabelas, funções e políticas em `supabase/migrations`;
3. procure o serviço/repositório correspondente em `apps/api/src`;
4. procure apenas a apresentação em `apps/web/src/features`;
5. consulte o mapa de domínio em [`REPOSITORY_MAP.md`](REPOSITORY_MAP.md);
6. confirme ADRs e documentação do domínio.

Eventos são a fonte primária da aprendizagem; estado pedagógico é derivado e
determinístico. Competência é a unidade acadêmica central. Especialidade e
ownership científico não devem ser recriados em outro módulo.

## Decisões e documentação

- ADRs existentes: [`../adr/`](../adr/), numerados de `0001` a `0014`.
- Documentação de domínio/operação: [`../`](../).
- Governança: diretório atual, `docs/product/`.
- RFC: não existe diretório ou índice formal de RFC neste snapshot. Se a tarefa
  exigir RFC, registre essa lacuna e obtenha a referência vigente; não invente.
- Histórico Git: `git log -- <caminho>`.

## Como concluir uma entrega

Siga integralmente a [`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md):

1. revise escopo e diff;
2. execute lint, typecheck, testes e build aplicáveis;
3. valide banco, contratos, RLS, RBAC e E2E conforme o risco;
4. valide mobile, acessibilidade e microcopy quando houver interface;
5. publique em staging quando exigido;
6. confirme health, ready, meta, smoke, CI e SHAs;
7. documente rollback e evidências;
8. confirme `git diff --check` e working tree limpa.

Nunca declare “verde”, “publicado” ou “concluído” sem evidência do mesmo SHA.

## Registro de divergências

Quando documento, código, CI e ambiente discordarem, registre:

| Campo              | Conteúdo obrigatório                           |
| ------------------ | ---------------------------------------------- |
| Fonte documental   | arquivo, seção e SHA                           |
| Evidência real     | comando, workflow ou endpoint                  |
| Impacto            | produto, dados, segurança ou operação          |
| Fonte atual        | qual evidência deve orientar a sessão agora    |
| Decisão necessária | responsável e ação, sem corrigir por suposição |

As divergências conhecidas deste snapshot estão em
[`CURRENT_STATE.md`](CURRENT_STATE.md#divergências-encontradas).
