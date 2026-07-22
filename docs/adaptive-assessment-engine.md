# Adaptive Assessment Engine

O diagnóstico adaptativo é determinístico e versionado como `assessment-v1`.

## Fluxo

1. A avaliação persiste o conjunto-alvo de competências.
2. A seleção ordena questões por competência não medida, baixa confiança, diversidade temática e adequação de dificuldade; UUID é o desempate estável.
3. A resposta é registrada atomicamente como tentativa append-only e evento `QuestionAnswered`.
4. O Learning Engine deriva evidências e snapshots de mastery no mesmo fluxo transacional.
5. A conclusão persiste cobertura, confiança e classificação por competência, além de `AssessmentFinished` na timeline.

## Confiança

A confiança combina quantidade de evidências (40%), recência em janela de 90 dias (20%), consistência (20%) e diversidade de questões (20%). Os níveis são baixo (`< 0,4`), médio (`< 0,7`) e alto.

O navegador possui somente leitura das tabelas. Início, seleção, resposta e conclusão passam por funções autenticadas que validam propriedade e estado da avaliação.
