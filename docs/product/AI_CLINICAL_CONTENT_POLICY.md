# Política de IA para conteúdo clínico

Esta política governa toda IA que explique medicina ou use dados pedagógicos no
Iatron. Ela complementa os
[princípios arquiteturais](ARCHITECTURAL_PRINCIPLES.md) e a
[governança editorial](EDITORIAL_GOVERNANCE.md).

## A IA pode

- explicar conteúdo homologado;
- adaptar profundidade e linguagem;
- pedir que o estudante explique o raciocínio;
- comparar hipóteses com base em fontes autorizadas;
- conduzir reflexão pós-erro;
- citar fontes autorizadas e vigentes;
- contextualizar dados reais de diagnóstico, plano e prova-alvo;
- sugerir atividade já autorizada pelo backend;
- declarar incerteza e pedir revisão humana.

## A IA não pode

- calcular mastery, Learning DNA, confiança ou prioridade;
- criar ou alterar plano;
- escolher prioridade fora de ferramentas autorizadas;
- inventar, completar ou falsificar fontes;
- emitir diagnóstico, prescrição ou recomendação assistencial;
- atribuir autoria ou revisão fictícia;
- afirmar participação do mentor sem registro;
- tratar conteúdo provisório como homologado;
- revelar ou usar dados de outro estudante;
- transformar inferência em fato;
- executar mutação sem autorização e validação determinística.

## Fontes

Afirmações clínicas devem usar conteúdo homologado, vigente e recuperável. A
resposta distingue fonte, síntese e interpretação. Quando não houver fonte
suficiente, informa o limite em vez de completar por memória. Referências devem
apontar para a versão efetivamente usada.

## Falha segura

Em indisponibilidade, conflito ou baixa confiança:

1. não inventar resposta ou dado;
2. preservar o estado pedagógico;
3. informar que não é possível responder com segurança;
4. oferecer fonte homologada ou encaminhamento editorial, quando disponível;
5. registrar evento operacional sem conteúdo sensível.

Não há fallback silencioso para conteúdo não homologado.

## Isolamento entre estudantes

- identidade vem do JWT validado;
- contexto é resolvido no backend;
- ferramentas aplicam ownership e menor privilégio;
- caches e logs não misturam estudantes;
- avaliações incluem ataques de troca de identificador e vazamento;
- prompts não recebem dados pessoais desnecessários.

## Prompt injection

Prompt do estudante, documento recuperado e tool output são entradas não
confiáveis. Eles não podem alterar instruções, autorização, fontes permitidas
ou ferramentas. Conteúdo externo é delimitado, minimizado e filtrado; chamadas
de ferramenta usam schemas e validação server-side.

## Conteúdo conflitante ou desatualizado

- comparar versão, vigência, população e órgão emissor;
- não escolher silenciosamente entre fontes relevantes;
- explicar o conflito em linguagem educacional;
- priorizar política editorial aprovada, quando houver;
- encaminhar para revisão médica;
- suspender resposta conclusiva quando o conflito impedir segurança.

## Relação com mentores

IA atua como apoio à metodologia autorizada, não como o próprio mentor.
Primeira pessoa atribuída a mentor é proibida até decisão e autorização
explícitas. A interface usa:

> Explicação gerada por IA com base em conteúdo médico homologado.

## Avaliação e auditoria

Prompts, modelos, ferramentas, fontes e políticas são versionados. Avaliações
cobrem precisão clínica, citação, atribuição, isolamento, injection, recusa,
conteúdo desatualizado e ausência de mutação pedagógica. Auditoria não registra
segredos nem dados pessoais desnecessários.
