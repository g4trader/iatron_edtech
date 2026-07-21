# Autenticação

O Supabase Auth é a autoridade de identidade. O Next.js cria clientes separados para browser e servidor com `@supabase/ssr`; o `proxy.ts` renova cookies e protege `/app`. Cadastro exige confirmação por e-mail. Login, logout, recuperação, redefinição e callback PKCE são executados no servidor.

Fluxo: cadastro → e-mail de confirmação → `/auth/callback` → sessão em cookie → onboarding → `/app`. O parâmetro `returnTo` aceita somente caminhos internos iniciados por `/` e rejeita URLs `//`, evitando redirecionamento aberto.

O frontend envia o access token como `Authorization: Bearer` ao consumir a API. A API nunca aceita `user_id` do cliente: usa o `sub` verificado. Mensagens em português não revelam se uma conta existe. Tokens, senhas e chaves não entram nos logs.

`E2E_AUTH_BYPASS=1` existe apenas para testes visuais locais e é ignorado quando `NODE_ENV=production`.
