# ADR 0007 — RLS como fronteira de dados

Status: aceito.

RLS é obrigatória em toda tabela exposta. Dados próprios usam `auth.uid()`; catálogos ativos têm leitura autenticada e nenhuma escrita comum. A API também opera com o token do usuário. Service role será reservada a rotinas administrativas explícitas, isoladas e auditadas.
