# Governança editorial

Esta política define papéis, estados e fluxo para conteúdo do Iatron. Deve ser
aplicada com as políticas de [proveniência](CONTENT_PROVENANCE_POLICY.md),
[mentores](MENTOR_GOVERNANCE.md) e [IA clínica](AI_CLINICAL_CONTENT_POLICY.md).

## Separação editorial obrigatória

Todo conteúdo deve identificar exatamente uma natureza principal:

1. autoral do mentor;
2. revisado pelo mentor;
3. homologado por equipe médica;
4. editorial não homologado;
5. explicação gerada por IA a partir de conteúdo homologado;
6. provisório ou em revisão.

Essas categorias não são intercambiáveis.

## Papéis

| Papel                   | Responsabilidades e permissões                  | Proibições                                | Evidência mínima                          |
| ----------------------- | ----------------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| Autor                   | Criar conteúdo e declarar fontes                | Aprovar o próprio conteúdo sozinho        | identidade, versão, fontes e data         |
| Editor                  | Clareza, estrutura e metadados                  | Alterar sentido clínico sem revisão       | diff editorial e checklist                |
| Revisor médico          | Validar correção clínica e vigência             | Revisar fora da habilitação definida      | identidade, especialidade, parecer e data |
| Mentor responsável      | Definir metodologia e revisar quando acordado   | Receber atribuição automática             | autorização e registro da ação            |
| Homologador             | Confirmar que todas as etapas foram cumpridas   | Homologar com pendência bloqueante        | checklist completo e decisão              |
| Publicador              | Publicar somente versão homologada e autorizada | Alterar conteúdo durante publicação       | versão, autorização e timestamp           |
| Responsável jurídico    | Avaliar licença, uso e restrições               | Ser presumido por ausência de objeção     | parecer ou decisão registrada             |
| Responsável estatístico | Validar metodologia e linguagem de métricas     | Aprovar resultado sem amostra documentada | método, amostra, limitações e versão      |
| Operador de importação  | Executar lote idempotente e registrar origem    | Homologar ou corrigir conteúdo clínico    | lote, origem, hashes e relatório          |
| Administrador           | Gerenciar acessos e incidentes                  | Substituir revisão editorial ou médica    | auditoria de acesso e justificativa       |

## Conflitos de interesse

- autoria e homologação final devem ser separadas quando o risco clínico ou
  jurídico for relevante;
- conflito financeiro, institucional ou de propriedade deve ser declarado;
- o responsável não atua fora de sua competência;
- exceções exigem justificativa, segundo revisor e trilha de auditoria.

## Fluxo editorial

Rascunho → revisão editorial → revisão médica → validação de fontes → validação
de gabarito, quando aplicável → homologação → publicação → correção versionada.

Uma etapa reprovada retorna à etapa responsável sem preservar falsamente um
status posterior.

## Taxonomia conceitual de estados

| Estado                  | Significado                                   | Pode aparecer ao estudante?      |
| ----------------------- | --------------------------------------------- | -------------------------------- |
| `draft`                 | Em criação                                    | Não                              |
| `editorial_review`      | Em revisão de clareza e metadados             | Não                              |
| `medical_review`        | Em revisão clínica                            | Não                              |
| `source_validation`     | Fontes e vigência em validação                | Não                              |
| `answer_key_validation` | Gabarito em validação                         | Não                              |
| `pending_homologation`  | Etapas concluídas, aguardando decisão         | Não                              |
| `homologated`           | Aprovado, ainda não necessariamente publicado | Não                              |
| `published`             | Versão autorizada disponível                  | Sim                              |
| `suspended`             | Retirado preventivamente                      | Não                              |
| `correction_pending`    | Correção em análise                           | Conforme risco e aviso explícito |
| `superseded`            | Substituído por nova versão                   | Apenas histórico autorizado      |
| `rejected`              | Não aprovado                                  | Não                              |

Esta taxonomia é proposta documental; sua modelagem depende de iniciativa
posterior.

## Correções e incidentes

- nunca sobrescrever silenciosamente uma versão publicada;
- registrar motivo, impacto, versão afetada e responsável;
- suspender imediatamente quando houver risco clínico ou jurídico plausível;
- notificar estudantes afetados quando a correção mudar uma orientação
  relevante;
- preservar evidências sem expor dados pessoais.

## Auditoria obrigatória

Registrar ator, papel, ação, conteúdo, versão, estado anterior e posterior,
timestamp, justificativa, fontes e decisão relacionada. Acesso administrativo
não concede autoridade editorial implícita.

## Controles automatizáveis futuros

Schemas podem exigir proveniência, transições válidas e separação de papéis; CI
pode verificar links e documentos; publicação pode bloquear estados
incompletos. Nenhum check automatizado substitui decisão jurídica ou revisão
médica.
