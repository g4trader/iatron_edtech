# ADR 0004 — Autenticação e sessão no Next.js

Status: aceito.

Usaremos Supabase Auth com cookies SSR gerenciados por `@supabase/ssr`. O proxy renova a sessão e Server Components confirmam o usuário com `getUser`, evitando confiar apenas no conteúdo local do cookie. O browser recebe somente a chave publicável. Isso integra confirmação, recuperação e refresh sem uma sessão paralela proprietária.
