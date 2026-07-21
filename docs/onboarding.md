# Onboarding acadêmico

`/app/onboarding` conduz quatro etapas: perfil, disponibilidade semanal, provas-alvo e confirmação. Cada avanço persiste o estado e `onboarding_step`, permitindo retomar e voltar sem duplicar registros. Constraints únicas garantem idempotência de disponibilidade e provas-alvo; o botão fica desabilitado durante cada envio.

O proxy direciona usuários incompletos ao onboarding e usuários completos ao app. Dados são estruturados; nenhuma informação pedagógica crítica é extraída de texto livre. Métricas existentes continuam identificadas como demonstração até haver avaliações reais.
