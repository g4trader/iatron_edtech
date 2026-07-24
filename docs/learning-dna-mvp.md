# Learning DNA MVP

## Escopo

O MVP descreve padrões longitudinais observáveis a partir de tentativas,
eventos e revisões do próprio estudante. Não cria perfil psicológico, não
compara estudantes e não altera diagnóstico, prioridade ou plano.

## Indicadores

- **Consistência:** `stable`, `variable` ou `insufficient_evidence`.
- **Velocidade observada:** compara somente com o histórico próprio válido e
  retorna `faster_than_own_baseline`, `within_own_baseline`,
  `slower_than_own_baseline` ou insuficiência.
- **Segurança calibrada:** combina resultado e segurança declarada em múltiplas
  respostas. Possíveis divergências usam obrigatoriamente `possible_`.
- **Recorrência de erro:** observa repetição apenas na mesma competência, tema
  ou subtema.
- **Retenção:** exige conteúdo comparável separado pela janela mínima.
- **Resposta à revisão:** exige tentativa confiável antes e depois de uma
  revisão registrada.
- **Estabilidade:** combina consistência e retenção sem criar rótulo permanente.

## Regras de evidência

`learning-dna-policy-v1-synthetic` define:

- quatro eventos comparáveis para consistência;
- três tempos válidos para baseline próprio;
- quatro respostas declaradas para calibração;
- dois erros na mesma dimensão para recorrência;
- sete dias entre tentativas comparáveis para retenção;
- tolerância de 20% para velocidade;
- variação máxima de 0,25 para estabilidade inicial.

Os valores são sintéticos, conservadores e pendentes de validação pedagógica e
estatística.

Cada indicador informa período, quantidade, áreas, competências, regra,
limitações, suficiência e versão. Tempo ausente ou fora de 1–900 segundos é
ignorado.

## Snapshots

Cada nova tentativa gera um snapshot global append-only. O registro contém:

- estudante derivado do contexto autenticado;
- janela analisada e data de cálculo;
- política e algoritmo;
- quantidade e cobertura;
- indicadores e limitações;
- suficiência e origens;
- hash determinístico das fontes.

O serviço sob demanda recalcula o estado atual e permite escopo por grande área
ou competência. O mesmo conjunto ordenado de eventos, política e data de
cálculo produz a mesma saída.

## APIs

Todas exigem JWT e são somente leitura:

- `GET /v1/learning/dna/current`;
- `GET /v1/learning/dna/snapshots`;
- `GET /v1/learning/dna/areas/:id`;
- `GET /v1/learning/dna/competencies/:id`.

O endpoint atual aceita janela ISO opcional e a versão de política suportada.
O histórico usa `limit` e `offset`.

## Privacidade

- RLS limita snapshots a `auth.uid()`.
- O backend ignora eventos cujo estudante difere do JWT validado.
- Não existe comparação entre estudantes.
- Snapshots não podem ser atualizados ou removidos diretamente.
- Exclusão da conta segue o `on delete cascade` já adotado para dados de
  aprendizagem.

## Formatter

O formatter traduz estados para linguagem observacional. Não expõe nome do
módulo, versão técnica, diagnóstico pessoal ou percentuais sem contexto.

## Integração futura

`toLearningDnaContext` disponibiliza somente suficiência, mensagens,
limitações e hash para consumidores futuros. Nesta sprint nenhum consumidor
altera plano, diagnóstico, simulados ou mentor.

## Limitações

- DEC-007 ainda impede tratar limiares como estatisticamente validados.
- DEC-011 ainda exige decisão formal sobre retenção final dos snapshots.
- Resposta à revisão depende de `ReviewCompleted` com `competencyId`.
- Catálogo incompleto reduz cobertura e produz insuficiência explícita.
- Snapshots persistidos mantêm indicadores conservadores; consultas atuais
  executam a análise temporal detalhada.
- Não há machine learning, clustering, LLM ou probabilidade de aprovação.
