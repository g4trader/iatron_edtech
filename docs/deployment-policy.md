# Política de deploy e validação — 27/10/2026

Autorização permanente do proprietário: toda implementação deve incluir testes,
build, deploy direto e validação online em https://go.iatron.com.br.
Não solicitar autorização adicional nem gerar previews de apresentação.

Usar somente Vercel `iatron-web-staging`, Cloud Run `iatron-api-staging` em
`stg1-512818/us-west1` e Supabase `dajdcecjaobdsgatubsb`. O ambiente Production
nesse projeto Vercel dedicado representa a homologação atual, não um ambiente
comercial futuro.

Antes da publicação: lint, typecheck, testes relevantes, build e confirmação dos
gates. Falhas transitórias de infraestrutura admitem tentativas limitadas;
verificações críticas não podem ser ignoradas. Depois: verificar SHA, health,
ready, LP, navegação, autenticação e fluxos alterados com fixtures exclusivas.
Prioridade V3: LP → cadastro/login → diagnóstico → resultado → trilha.

Relatar versão, URL, deploy, evidências online, testes e bloqueios. Publicação
ou validação pendente impede status concluído. Rollback usa revisões existentes.
A autorização não inclui ações destrutivas, dados reais, credenciais, ambientes
novos ou impacto financeiro relevante. Essas fronteiras continuam protegidas.
