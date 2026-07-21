# ADR 0006 — Criação automática de perfil

Status: aceito.

Um trigger `after insert` em `auth.users` cria `profiles` e `student_profiles`. Como o trigger participa da transação de cadastro, falhas impedem usuários órfãos. A função é `security definer`, fixa `search_path` vazio e referencia objetos qualificados para reduzir risco de resolução indevida.
