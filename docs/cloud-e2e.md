# E2E remoto

`pnpm test:e2e:auth` escolhe o modo remoto quando `E2E_WEB_BASE_URL` existe.
Esse modo exige `E2E_ALLOW_DESTRUCTIVE_TESTS=1`, project ref duplicado como alvo
e aprovação e URL Supabase exatamente correspondente. A flag isolada não basta.

A fixture administrativa roda apenas no processo Playwright, confirma usuários
de staging e gera links reais de recuperação pela Admin API. A service role não
é enviada à aplicação nem ao browser. Cada execução cria e-mails únicos e remove
somente IDs que ela própria registrou.

Cobertura: cadastro com confirmação exigida, login, sessão SSR, onboarding
retomável, JWT na API, spoofing, RLS com dois usuários, logout e recuperação de
senha. Produção é recusada. Para auditoria de entrega real de e-mail, adicione
posteriormente uma caixa exclusiva programaticamente acessível; não desative a
confirmação em produção.
