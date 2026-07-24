# Diagnostic Engine 2.0 MVP

## Escopo

Esta extensão preserva o diagnóstico adaptativo existente e adiciona sinais de
segurança declarada, cobertura mínima por grande área, seleção e parada
versionadas e um relatório determinístico por área.

Não há uso de IA, alteração do plano adaptativo ou probabilidade de aprovação.

## Segurança declarada

A resposta pode informar:

- `certain`;
- `uncertain`;
- `do_not_know`;
- ou omitir o valor.

Tentativas antigas com `low`, `medium` e `high` continuam legíveis. O valor é
uma evidência da resposta naquele momento, nunca um rótulo do estudante.

## Evidência combinada

`diagnostic-evidence-v2` combina acerto, segurança declarada, dificuldade e
tempo de resposta confiável. Os sinais temporários são:

- `evidence_of_consolidation`;
- `explicit_gap`;
- `uncertain_knowledge`;
- `possible_miscalibration`;
- `insufficient_evidence`.

Um único erro declarado como certo permanece insuficiente. Possível
descalibração exige repetição do padrão.

## Política de cobertura

`diagnostic-policy-v2-synthetic` é uma configuração conservadora de
desenvolvimento:

- uma evidência e uma competência distinta por grande área;
- dificuldades desejadas 2, 3 e 4;
- mínimo global de cinco evidências;
- máximo de dez questões;
- duração máxima de trinta minutos.

As grandes áreas são Clínica Médica, Pediatria, Cirurgia Geral, Ginecologia e
Obstetrícia e Medicina Preventiva/Saúde Coletiva.

Esses parâmetros são sintéticos. Precisam de validação pedagógica e estatística
antes de orientar alegações sobre desempenho.

## Seleção

A ordem determinística é:

1. cobrir grandes áreas ainda não medidas;
2. aprofundar fragilidade ou incerteza repetida;
3. variar competência, tema e dificuldade;
4. evitar questões já respondidas;
5. usar relevância AMRIGS apenas como desempate complementar.

Ausência de perfil AMRIGS não impede o diagnóstico. Exam Intelligence permanece
somente leitura e nunca substitui a necessidade individual.

## Parada

O diagnóstico encerra quando cobertura, diversidade e evidência mínima são
atingidas, ou quando alcança orçamento, duração ou esgota conteúdo compatível.

Parada por limite sem cobertura suficiente fica registrada como evidência
insuficiente. Não há preenchimento artificial de precisão.

## Resultado

O resultado preserva os campos anteriores e acrescenta:

- motivo da conclusão;
- suficiência explícita da evidência;
- nível observado e qualidade por grande área;
- segurança calibrada;
- forças, fragilidades e incertezas;
- influência complementar da prova-alvo;
- próximo passo sugerido.

Os textos de apresentação são humanos; nomes internos permanecem restritos a
contratos, logs e administração.

## Persistência e compatibilidade

- `stated_confidence` passa a ser opcional e aceita valores legados;
- tentativas recebem sinal e versão do método;
- avaliações recebem versão da política;
- resultados por área são append-only e protegidos por RLS;
- sessões e resultados antigos continuam serializáveis;
- a função v1 permanece disponível para compatibilidade;
- a função v2 exige JWT e deriva o estudante de `auth.uid()`.

## Limitações

- Os limiares não possuem validação pedagógica ou estatística aprovada
  (DEC-007 pendente).
- O perfil AMRIGS e os dados desta etapa são sintéticos; DEC-001 e DEC-004
  permanecem pendentes.
- Cobertura real depende de catálogo publicado suficiente nas cinco áreas.
- Tempo influencia apenas o peso quando está em uma faixa confiável.
- O MVP não implementa Learning DNA longitudinal, simulados, mentor ou mudanças
  no plano.

## Validação local

```bash
pnpm --filter @iatron/api test -- assessment-engine assessment-routes
pnpm --filter @iatron/contracts test
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm db:test
```
