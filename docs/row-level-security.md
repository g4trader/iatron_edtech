# Row Level Security

Todas as tabelas públicas desta fase têm RLS ativada. `profiles`, `student_profiles`, `student_availability` e `student_target_exams` comparam o proprietário a `(select auth.uid())`. Catálogos permitem somente leitura autenticada de itens ativos; usuários comuns não recebem grants de escrita.

A API usa a publishable key junto do token do estudante, preservando RLS. Service role não é configurada nem usada nas rotas `/v1/me`; operações administrativas futuras deverão ficar isoladas e auditadas.

Os testes pgTAP em `supabase/tests/database` cobrem isolamento entre dois estudantes, negação anônima, tentativa de spoofing, ocultação de edição inativa, bloqueio de escrita no catálogo e acesso administrativo intencional.

Atualização direta de `profiles` é limitada a `display_name`. Estado do onboarding é alterado apenas pela função atômica `save_onboarding`, que usa `SECURITY DEFINER`, `search_path` vazio, deriva o proprietário de `auth.uid()` e possui execute somente para `authenticated`. As funções de trigger não são executáveis diretamente pelos papéis da API.
