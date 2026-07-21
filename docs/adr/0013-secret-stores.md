# ADR 0013 — Gestão de segredos

Status: aceito.

GitHub Secrets contém credenciais de automação, Secret Manager contém segredos de
runtime e Vercel recebe somente configuração pública necessária. Workload
Identity Federation substitui chaves JSON de deploy. Valores nunca entram em
imagem, argumentos de build ou repositório.
