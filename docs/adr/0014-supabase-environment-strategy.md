# ADR 0014 — Projetos Supabase separados

Status: aceito.

Projetos separados para staging e produção são a estratégia padrão por funcionar
sem depender de Branching. Quando o plano oferecer Branching, previews efêmeros
serão preferidos para validar migrations do zero e destruídos após o PR. Branching
não é pré-requisito de entrega.
