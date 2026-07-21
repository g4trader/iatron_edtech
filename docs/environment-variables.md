# Variáveis de ambiente

## Web

- `NEXT_PUBLIC_API_URL`: URL pública da API `/v1`.
- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publicável; nunca use service role no navegador.

## API

- `PORT`, `HOST`, `NODE_ENV`, `LOG_LEVEL`: execução Cloud Run.
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`: acesso sujeito a RLS.
- `SUPABASE_JWT_ISSUER`, `SUPABASE_JWT_AUDIENCE`: validação do token.
- `CORS_ALLOWED_ORIGINS`: origens separadas por vírgula; wildcard não é aceito.

Vercel e Cloud Run devem receber valores por configuração de ambiente/Secret Manager. Nenhuma service role ou segredo OpenAI é necessário nesta fase.
