# ADR 0005 — Validação JWT na API

Status: aceito.

O Fastify valida JWT assimétrico com `jose` e JWKS do issuer Supabase, incluindo assinatura, issuer, audience e expiração. A identidade vem exclusivamente do `sub`. A API cria um cliente Supabase com o bearer do usuário para manter RLS, em vez de contornar políticas com service role.
