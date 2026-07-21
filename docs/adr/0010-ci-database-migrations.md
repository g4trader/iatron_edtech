# ADR 0010 — Migrations pelo CI/CD

Status: aceito.

Migrations versionadas são aplicadas antes dos deploys de aplicação. O pipeline
faz dry-run, push, seed protegido, pgTAP e verificação de drift. Produção requer
environment protegido e aprovação; migrations permanecem forward-only.
