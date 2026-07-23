# Onboarding acadêmico

`/app/onboarding` conduz quatro etapas: perfil/experiência, disponibilidade e preferências de sessão/avaliação, provas-alvo e confirmação. Cada avanço persiste o estado e `onboarding_step`, permitindo retomar e voltar sem duplicar registros. Constraints únicas garantem idempotência de disponibilidade e provas-alvo; o botão fica desabilitado durante cada envio.

O proxy direciona usuários incompletos ao onboarding e usuários completos ao app. Dados são estruturados; nenhuma informação pedagógica crítica é extraída de texto livre. Métricas existentes continuam identificadas como demonstração até haver avaliações reais.

## Provas-alvo

O onboarding consulta edições ativas do catálogo acadêmico e permite múltiplas
provas-alvo. A escolha começa pela Região Sul e pelo Rio Grande do Sul, sem
inferir a localização do estudante. Região, estado e busca por processo,
instituição ou cidade são filtros de apresentação; os IDs persistidos continuam
sendo `exam_edition_id`.

Não encontrar uma prova não bloqueia o onboarding. O estudante pode seguir sem
seleção e alterar o objetivo depois. O catálogo regional verificado, sua
proveniência e o processo de atualização estão em
[Catálogo regional de processos seletivos](regional-exam-catalog.md).
