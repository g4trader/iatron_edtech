# ADR 0012 — Deploy da API no Cloud Run

Status: aceito.

Cloud Build produz imagem imutável no Artifact Registry e Cloud Run recebe a
revisão por GitHub Actions/OIDC. Staging usa min 0, max 2, 1 vCPU e 512 MiB. A
service account de runtime é separada da identidade de deploy.
