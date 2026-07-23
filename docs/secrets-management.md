# Variáveis e segredos

Nenhum valor deve ser commitado ou enviado no chat. Chaves públicas ainda devem
ser tratadas como configuração por ambiente; `service_role`, tokens e senhas são
segredos de privilégio elevado.

| Variável                               | Vercel Preview | Vercel Production | Cloud Run Staging | Cloud Run Production | GitHub Actions | Classe                 |
| -------------------------------------- | -------------- | ----------------- | ----------------- | -------------------- | -------------- | ---------------------- |
| `NEXT_PUBLIC_API_URL`                  | sim            | sim               | não               | não                  | E2E            | pública                |
| `NEXT_PUBLIC_SUPABASE_URL`             | sim            | sim               | não               | não                  | E2E            | pública                |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | sim            | sim               | não               | não                  | E2E secret     | pública por ambiente   |
| `SUPABASE_URL`                         | não            | não               | sim               | sim                  | não            | configuração           |
| `SUPABASE_PUBLISHABLE_KEY`             | não            | não               | Secret Manager    | Secret Manager       | não            | configuração protegida |
| `SUPABASE_SERVICE_ROLE_KEY`            | nunca          | nunca             | quando necessário | quando necessário    | E2E staging    | privilégio elevado     |
| `SUPABASE_ACCESS_TOKEN`                | não            | não               | não               | não                  | secret         | privilégio elevado     |
| `SUPABASE_STAGING_DB_PASSWORD`         | não            | não               | não               | não                  | secret         | segredo                |
| `SUPABASE_STAGING_DATABASE_URL`        | não            | não               | não               | não                  | secret         | segredo                |
| `SUPABASE_*_PROJECT_ID`                | não            | não               | não               | não                  | variable       | configuração           |
| `CORS_ALLOWED_ORIGINS`                 | não            | não               | variable          | variable             | variable       | configuração           |
| `OPENAI_API_KEY`                       | não            | não               | Secret Manager    | Secret Manager       | secret         | backend apenas         |
| `GCP_WORKLOAD_IDENTITY_PROVIDER`       | não            | não               | não               | não                  | variable       | configuração           |
| `GCP_*_SERVICE_ACCOUNT`                | não            | não               | não               | não                  | variable       | configuração           |

GitHub Secrets hospedam automação de banco/E2E; Secret Manager hospeda runtime da
API; Vercel recebe apenas `NEXT_PUBLIC_*`. Rotacione imediatamente qualquer valor
exposto e revise logs — apagar histórico não substitui rotação.
