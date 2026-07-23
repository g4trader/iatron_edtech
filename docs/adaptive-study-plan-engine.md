# Plano adaptativo determinístico

O planejador transforma o estado pedagógico já calculado pelo Learning Engine em
uma agenda executável de sete dias. Ele não usa IA e não recalcula mastery ou gaps:
consome esses resultados como entradas versionadas.

## Decisão e explicabilidade

Cada competência recebe uma prioridade reproduzível, formada por gap, mastery,
confiança, tendência, esquecimento, falta de evidência, relevância para a prova,
proximidade da prova e histórico de execução. O desempate usa o código da
competência. Cada parcela da pontuação é persistida como uma justificativa
estruturada, com origem, valor e explicação.

O algoritmo respeita a disponibilidade real por dia e a duração preferida das
sessões. Itens que não cabem na semana permanecem explicitamente como
`unallocated`; o sistema nunca ultrapassa a capacidade informada.

## Histórico e replanejamento

Planos possuem versões imutáveis. Iniciar, concluir, adiar ou pular uma atividade
gera uma ação append-only. Conclusões alimentam o Learning Event Store; adiamentos,
pulos e conclusões disparam uma nova versão do plano com o estado pedagógico e o
histórico de execução mais recentes. Um hash canônico torna a geração idempotente
para a mesma entrada.

As tabelas usam RLS por estudante. O navegador possui somente leitura direta; toda
escrita passa por RPCs autenticadas que validam propriedade e transições de estado.

## Superfícies

As APIs ficam em `/v1/plans`, incluindo geração, plano atual, hoje, semana,
histórico, não alocados, detalhe, justificativas e ações de execução. As páginas de
inspeção ficam em `/app/plan`, `/app/plan/today`, `/app/plan/week`,
`/app/plan/history` e `/app/plan/unallocated`.
