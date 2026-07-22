# Custos e limites

- Cloud Run staging: 1 vCPU, 512 MiB, timeout 60 s, min 0, max 2. Gera custo por
  uso, egress e logs; cold start é aceito em staging.
- Cloud Build e Artifact Registry: builds, armazenamento de imagens e tráfego
  podem gerar custo. Definir política de retenção após observar o ciclo real.
- Supabase: banco/Auth/Storage e backups seguem o plano do projeto; Branching e
  PITR podem ser pagos. Confirmar plano/região no painel.
- Vercel: previews, build minutes, bandwidth e concorrência dependem do plano.
- E-mail transacional: fixture Admin API não mede entrega; um provedor futuro
  terá custo e retenção próprios.

O Supabase staging está em `us-west-2` (Oregon) e o Cloud Run staging em
`us-west1` (Oregon), reduzindo distância sem misturar provedores. Não
superdimensionar produção a partir dos limites econômicos de staging.
