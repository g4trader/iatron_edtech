# Governança estatística

Esta política protege o estudante contra falsa precisão e linguagem que exceda
a evidência disponível.

## Metadados obrigatórios de toda métrica

- fonte;
- período analisado;
- tamanho e unidade da amostra;
- cobertura disponível;
- dados ausentes;
- limitações e vieses conhecidos;
- método e versão;
- nível ou intervalo de confiança apropriado;
- última atualização;
- responsável estatístico.

## Regras por tipo

### Recorrência e tendências

Informar edições analisadas e denominador. “Frequente nas edições analisadas”
não equivale a “sempre cobrado”.

### Dificuldade e taxa de acerto

Separar avaliação editorial de dificuldade observada. Taxa observada informa
população, contexto, período e tratamento de tentativas incompletas.

### Discriminação

Só publicar com método, amostra e pressupostos documentados. Não interpretar
como qualidade intrínseca fora da população analisada.

### Confiança

Distinguir confiança do algoritmo, segurança declarada pelo estudante e
incerteza estatística. Os conceitos não podem compartilhar rótulo ambíguo.

### Prontidão

Indicadores agregados devem ser descritivos, explicáveis e decompostos. Não
equivalem a probabilidade de aprovação.

### Comparações

O padrão é comparar o estudante com o próprio histórico. Comparação com grupo
exige população confiável, critérios de inclusão, privacidade, tamanho de
amostra e análise de viés.

## Dados insuficientes

Quando o mínimo aprovado não for atingido, mostrar “evidência insuficiente” e
explicar o que falta. Não imputar silenciosamente, ocultar ausência ou ampliar
linguagem para compensar baixa amostra.

## Versionamento e atualização

Resultados registram versão do método e dataset. Mudança material exige nova
versão, validação, comparação e plano de recomputação. Atualizações preservam
histórico e data de corte.

## Proibições

- probabilidade de aprovação não validada;
- comparação com aprovados sem população confiável;
- linguagem absoluta baseada em amostra limitada;
- ocultação de dados insuficientes;
- métrica sem fonte ou período;
- causalidade inferida apenas de correlação;
- limiar escolhido somente por conveniência de produto.

## Decisões estatísticas pendentes

- amostra mínima por tipo de métrica;
- método de confiança e calibração;
- tratamento de múltiplas tentativas;
- janela de recência;
- critérios de comparabilidade entre edições;
- limiares de tendência e recorrência;
- metodologia de prontidão;
- população válida para comparações;
- revisão independente necessária;
- política para eventual modelo de aprovação.

Até aprovação pelo responsável estatístico, nenhum limiar final deve ser
presumido.

## Controles automatizáveis futuros

Schemas podem exigir metadados; testes podem reproduzir cálculos; CI pode
bloquear métricas sem documentação; monitoramento pode detectar drift. Esses
controles não substituem validação metodológica.
