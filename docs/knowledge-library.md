# Knowledge Library

A Knowledge Library é uma projeção operacional dos domínios acadêmicos e
editoriais existentes. Ela não possui taxonomia, conteúdo ou fonte de verdade
próprios.

## Escopo

- `/editorial/library`: catálogo completo para descoberta e decisões
  editoriais;
- `/review/library`: mesma projeção, limitada no servidor às especialidades
  sob ownership ativo do mentor;
- `/admin/library`: resumo gerencial, sem substituir o workflow editorial.

Conteúdos, questões, referências, blueprints e competências continuam
pertencendo às tabelas e serviços de origem. Busca, filtros, ordenação e
paginação usam DTOs resumidos; detalhes permanecem sob demanda nos fluxos
existentes.

## Cobertura e lacunas

A biblioteca reutiliza exatamente o cálculo determinístico da Product Vision
7.1: uma competência coberta possui conteúdo publicado, questão elegível e
referência verificada. Lacunas e prioridades não são calculadas por IA.

## Duplicidades

Correspondências são candidatas determinísticas por identificador ou título
normalizado. Não existe merge automático. Decisões humanas são append-only em
`knowledge_duplicate_decisions` e também geram evento na auditoria editorial.
O item canônico precisa pertencer ao par comparado.

## Segurança

RBAC é validado na API e RLS continua protegendo as entidades originais.
Mentores consultam somente áreas com ownership ativo. Student não recebe rota
nem política de acesso. Service-role não participa do frontend.

## Migration e rollback

`202607270002_knowledge_library_duplicate_decisions.sql` é aditiva e cria
somente o registro de decisões de duplicidade, sua política RLS e a RPC
auditável. A biblioteca de leitura funciona sobre entidades existentes.

Rollback seguro: interromper chamadas à RPC, preservar a tabela como histórico
e remover apenas permissões/rotas. Não apagar decisões já registradas.
