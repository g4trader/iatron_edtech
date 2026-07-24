# Roadmap consolidado — Product Vision 4.1

## 1. Resumo executivo

O Iatron evoluirá de uma plataforma que organiza estudos para uma preparação
longitudinal conduzida por médicos mentores, sustentada por conteúdo real e por
decisões pedagógicas determinísticas.

A transformação esperada é que o estudante deixe de receber apenas resultados
e listas de atividades. Ele deverá:

- compreender seu nível atual e a qualidade dessa medição;
- reconhecer onde, como e com que frequência costuma errar;
- saber qual é o próximo passo e por que ele foi recomendado;
- estudar de acordo com o perfil documentado da prova-alvo;
- perceber a participação editorial dos mentores sem atribuições fictícias;
- acompanhar evolução, retenção e preparação em linguagem compreensível.

O caminho começa pela governança editorial, jurídica e estatística. Em seguida,
estrutura conteúdo e relações médicas, contextualiza a banca-piloto, aprofunda o
diagnóstico e só então amplia simulados, inteligência pedagógica e atuação
conversacional dos mentores.

Os principais riscos são:

- uso de provas sem licença ou base jurídica definida;
- conteúdo clínico sem proveniência ou revisão adequada;
- atribuição indevida de autoria ou revisão aos mentores;
- métricas frágeis apresentadas como certeza;
- perfis pedagógicos opacos ou rótulos permanentes;
- IA assumindo decisões que pertencem ao backend determinístico;
- vieses de cobertura decorrentes de um catálogo incompleto.

## 2. Princípios estratégicos

1. **Conteúdo real antes de funcionalidades superficiais.** Quando houver
   conflito de prioridade, aprofundar conteúdo homologado, mentoria e
   inteligência pedagógica prevalece sobre adicionar uma nova superfície.
2. **Mentoria como identidade.** Mentores orientam a experiência e a governança
   editorial; sua imagem não é decoração.
3. **IA como tecnologia de apoio.** A IA conduz conversas e explica decisões,
   mas não calcula estado pedagógico nem substitui autoria médica.
4. **Pedagogia determinística.** Diagnóstico, Learning DNA, domínio, prioridades
   e plano são reproduzíveis, versionados e auditáveis.
5. **Transparência estatística.** Toda tendência declara amostra, período,
   cobertura, limitações, atualização e nível de confiança.
6. **Rastreabilidade editorial.** Conteúdo identifica origem, autoria, revisão,
   homologação, vigência e versão.
7. **Segurança clínica.** Explicações preservam rigor científico, fontes e
   limites educacionais; o produto não presta atendimento médico.
8. **Experiência orientada ao próximo passo.** Toda tela ajuda o estudante a
   entender onde está, o que fazer e o que acontecerá depois.
9. **Sem rótulos permanentes.** Indicadores descrevem evidências observadas em
   um período e podem mudar com novas evidências.
10. **Promessas proporcionais à evidência.** O produto não promete aprovação e
    não exibe probabilidade sem modelo validado e documentação estatística.

## 3. Roadmap revisado

### Iniciativa 0 — Estabelecer confiança, autoria e direção

**Nome técnico interno:** Product and Editorial Governance

**Objetivo:** instituir visão, responsabilidades e critérios obrigatórios antes
da ampliação do catálogo.

**Mudança percebida pelo estudante:** informações, comentários e recomendações
passam a deixar claro quem produziu, revisou ou homologou o conteúdo.

**Escopo:**

- visão e princípios oficiais do produto;
- papéis de autoria, revisão médica, homologação e publicação;
- política de atribuição dos mentores;
- política de uso de IA em conteúdo clínico;
- critérios jurídicos para provas;
- critérios mínimos para estatísticas e indicadores.

**Fora de escopo:** importar provas, alterar algoritmos ou publicar métricas.

**Dependências:** decisões dos stakeholders e assessoria jurídica.

**Riscos:** governança apenas documental ou responsabilidades ambíguas.

**Mitigação:** responsáveis nomeados, estados editoriais verificáveis e
checklists bloqueantes no fluxo de publicação.

**Esforço:** pequeno a médio.

**Métricas de sucesso:**

- 100% dos tipos de conteúdo com responsável e fluxo definidos;
- nenhuma publicação sem origem e status editorial;
- decisões jurídicas críticas registradas.

**Critérios de aceite:**

- visão e princípios integrados à governança do repositório;
- matriz de responsabilidade editorial aprovada;
- política de atribuição e IA clínica aprovada;
- banca-piloto formalmente decidida.

### Iniciativa 1 — Tornar os mentores responsáveis visíveis e verificáveis

**Nome técnico interno:** Mentor Governance and Experience

**Objetivo:** posicionar os mentores no início do ciclo de conteúdo para que
influenciem metodologia, linguagem, revisão e experiência.

**Mudança percebida pelo estudante:** ele entende qual mentor orienta cada área
e distingue orientação médica revisada de explicação gerada como apoio.

**Escopo:**

- Aristóteles em Pediatria;
- Lucas em Clínica Médica;
- Guilherme Peterson em Cirurgia Geral;
- Fernanda Grosbelli em Ginecologia e Obstetrícia;
- apresentação, atuação, metodologia, mensagem e materiais;
- estados de atribuição: criado, revisado, homologado pela equipe, gerado por
  IA a partir de conteúdo homologado e provisório;
- autorização de nome, imagem e materiais.

**Fora de escopo:** atribuir automaticamente textos existentes ou permitir que
a IA fale em nome pessoal do mentor sem autorização.

**Dependências:** iniciativa 0 e autorização dos mentores.

**Riscos:** falsa autoria, inconsistência de voz e gargalo editorial.

**Mitigação:** trilha de auditoria, rótulos explícitos e filas de revisão por
especialidade.

**Esforço:** médio.

**Métricas de sucesso:**

- 100% das orientações identificam corretamente sua natureza editorial;
- utilidade percebida do mentor no beta;
- zero atribuição sem registro de revisão.

**Critérios de aceite:**

- perfis oficiais aprovados;
- matriz especialidade–mentor estabelecida;
- regras de atribuição aplicadas a todos os formatos de conteúdo;
- revisão editorial auditável.

### Iniciativa 2 — Construir uma base confiável de provas e conhecimento médico

**Nome técnico interno:** Content Intelligence Foundation

**Objetivo:** assegurar que questões, competências, diretrizes e metadados
tenham qualidade suficiente para sustentar decisões pedagógicas.

**Mudança percebida pelo estudante:** questões e recomendações passam a ter
origem, contexto de prova, referências e comentários confiáveis.

**Escopo:**

- análise de lacunas no modelo acadêmico existente;
- metadados de banca, instituição, ano, especialidade, subespecialidade,
  dificuldade, recorrência e estatísticas observadas;
- versionamento e vigência;
- status editorial e proveniência;
- qualidade, deduplicação e identidade externa;
- contratos de leitura e inspeção editorial.

**Fora de escopo:** inferir estatísticas inexistentes ou importar conteúdo sem
direito de uso.

**Dependências:** iniciativas 0 e 1.

**Riscos:** duplicação de dados derivados, taxonomia rígida e metadados
incompletos.

**Mitigação:** fatos canônicos, projeções recomputáveis, entidades relacionais e
campos de ausência explícita.

**Esforço:** grande.

**Métricas de sucesso:**

- cobertura dos metadados obrigatórios;
- taxa de duplicidade detectada;
- percentual de conteúdo publicado com proveniência completa;
- tempo médio de revisão.

**Critérios de aceite:**

- modelo incremental compatível com a base atual;
- constraints, índices, RLS e histórico adequados;
- importação idempotente demonstrada com conteúdo autorizado;
- nenhuma estatística apresentada sem amostra identificável.

### Iniciativa 3 — Relacionar conhecimentos além de uma árvore rígida

**Nome técnico interno:** Medical Knowledge Graph

**Objetivo:** representar relações médicas revisadas para investigar
pré-requisitos, confusões e conteúdos relacionados sem generalizações
automáticas.

**Mudança percebida pelo estudante:** após um erro, ele recebe uma investigação
mais precisa dos conceitos relacionados que realmente merecem atenção.

**Escopo:**

- relações tipadas entre entidades acadêmicas;
- pré-requisito, relacionado, diagnóstico diferencial, complicação, conduta,
  exame, diretriz, fisiopatologia, farmacologia e confusão frequente;
- origem, responsável editorial, revisão, vigência, confiança e versão;
- consultas de vizinhança com profundidade limitada;
- ferramentas editoriais de validação.

**Fora de escopo:** inferência clínica automática ou propagação automática de
erro para todos os nós relacionados.

**Dependências:** iniciativas 1 e 2.

**Riscos:** relações excessivas, baixa qualidade editorial e ciclos sem
significado.

**Mitigação:** vocabulário controlado, validação por tipo, limites de
profundidade e revisão médica.

**Esforço:** grande.

**Métricas de sucesso:**

- percentual de competências prioritárias com relações revisadas;
- taxa de relações rejeitadas na revisão;
- utilidade das relações na investigação de erros;
- ausência de recomendações sem caminho explicável.

**Critérios de aceite:**

- relações versionadas e auditáveis;
- origem e responsável obrigatórios;
- consultas não inferem comprometimento automaticamente;
- testes de integridade, ciclos permitidos e isolamento.

### Iniciativa 4 — Conhecer como o estudante aprende e costuma errar

**Nome técnico interno:** Learning DNA

**Objetivo:** construir um perfil pedagógico longitudinal, determinístico e
revisável a partir de evidências observáveis.

**Mudança percebida pelo estudante:** ele compreende padrões como pressa,
insegurança, retenção e recorrência sem receber rótulos pessoais.

**Escopo:**

- consistência, velocidade e estabilidade;
- revisão, retenção e resposta à repetição;
- segurança declarada, observada e calibrada;
- excesso e baixa confiança como estados temporais;
- categorias de erro com origem verificável;
- desempenho por formato de questão;
- evolução por área, competência e subtema;
- snapshots versionados derivados de eventos.

**Fora de escopo:** diagnóstico psicológico, traços permanentes ou perfil
produzido por LLM.

**Dependências:** iniciativas 0 e 2; eventos já existentes; taxonomia de
evidências aprovada.

**Riscos:** rotular comportamento com pouca evidência, confundir velocidade com
conhecimento e amplificar vieses do catálogo.

**Mitigação:** janelas temporais, mínimos de evidência, níveis de incerteza,
linguagem não determinista e possibilidade de revisão.

**Esforço:** grande.

**Métricas de sucesso:**

- percentual de indicadores com evidência e versão consultáveis;
- estabilidade dos resultados em reprocessamento;
- redução de recomendações genéricas;
- compreensão dos indicadores pelos estudantes.

**Critérios de aceite:**

- todos os indicadores reproduzíveis;
- nenhum indicador nasce de evento único quando exigir padrão;
- histórico preservado;
- explicação inclui evidências, período e incerteza;
- perfis sintéticos cobrem extremos e ausência de dados.

### Iniciativa 5 — Preparar o estudante para o perfil real da prova escolhida

**Nome técnico interno:** Exam Intelligence

**Objetivo:** contextualizar diagnóstico, plano, conteúdo e simulado com base em
um perfil documentado da banca.

**Mudança percebida pelo estudante:** ele entende por que determinado assunto
recebe prioridade para sua prova-alvo.

**Escopo:**

- perfil versionado da banca;
- distribuição de áreas, recorrência, formato, dificuldade e estilo;
- provas analisadas, período, quantidade de questões e cobertura;
- dados ausentes, confiança e última atualização;
- explicações comparativas sem absolutismos.

**Fora de escopo:** afirmar padrões universais ou usar amostra não documentada.

**Dependências:** iniciativas 2 e 3; decisão da banca-piloto; conteúdo
legalmente utilizável.

**Riscos:** tendências frágeis, mudança de edital e viés de anos incompletos.

**Mitigação:** recortes explícitos, atualização versionada, intervalo de
confiança e estado “dados insuficientes”.

**Esforço:** grande.

**Métricas de sucesso:**

- cobertura temporal e amostral publicada;
- percentual de recomendações com justificativa de banca;
- compreensão da personalização pelo estudante;
- frequência de atualização dentro da política definida.

**Critérios de aceite:**

- toda tendência declara fonte, período, amostra e confiança;
- ausência de dados é visível;
- mesmas entradas produzem mesmas prioridades;
- perfil da banca é versionado e reversível.

### Iniciativa 6 — Descobrir com precisão onde e por que evoluir

**Nome técnico interno:** Diagnostic Engine 2.0

**Objetivo:** transformar o diagnóstico em uma entrevista adaptativa que mede
conhecimento, segurança e qualidade das evidências.

**Mudança percebida pelo estudante:** ele responde apenas ao necessário, mas o
diagnóstico não termina antes de medir as grandes áreas com qualidade.

**Escopo:**

- cobertura por grande área e competência;
- dificuldade progressiva e diversidade;
- velocidade e consistência;
- segurança declarada: certeza, dúvida ou não sei;
- segurança calibrada;
- estabilidade e relevância para a prova-alvo;
- critérios mínimos de aprofundamento e parada;
- relatório de forças, fragilidades, insegurança e excesso de confiança.

**Fora de escopo:** raciocínio inferido sem dado explícito, rótulos permanentes
ou seleção produzida por IA.

**Dependências:** iniciativas 2, 4 e 5; catálogo suficiente por estrato.

**Riscos:** diagnóstico longo, encerramento precoce, exposição desigual a
dificuldade e viés de conteúdo.

**Mitigação:** orçamento de questões, cobertura mínima, critérios versionados,
perfis sintéticos e auditoria de seleção.

**Esforço:** muito grande.

**Métricas de sucesso:**

- taxa de conclusão;
- cobertura mínima atingida;
- precisão e calibração da confiança;
- quantidade mediana de questões;
- estabilidade em reaplicação controlada;
- compreensão do relatório.

**Critérios de aceite:**

- nenhuma área encerra sem evidência mínima;
- seleção é reproduzível e explicável;
- certeza combinada ao resultado sem conclusão por evento único;
- relatório separa dado, interpretação e incerteza;
- testes determinísticos cobrem perfis fortes, frágeis, inconsistentes e sem
  dados.

### Iniciativa 7 — Garantir que o estudante sempre saiba o próximo passo

**Nome técnico interno:** Unified Study Journey

**Objetivo:** conectar diagnóstico, plano, mentor, atividade, simulado e
evolução em uma única jornada.

**Mudança percebida pelo estudante:** ao entrar, ele encontra a ação mais útil,
seu motivo e o resultado esperado sem navegar entre módulos.

**Escopo:**

- hoje, próxima atividade, mentor responsável e justificativa;
- continuidade após diagnóstico, atividade e simulado;
- evolução e conquistas factuais;
- estados vazios, retomada e replanejamento explicados;
- preservação das rotas e funções existentes.

**Fora de escopo:** nova regra pedagógica no frontend ou gamificação sem
benefício comprovado.

**Dependências:** iniciativas 1, 4, 5 e 6.

**Riscos:** esconder opções importantes ou apresentar recomendação desatualizada.

**Mitigação:** fonte e horário da recomendação, caminhos secundários e
revalidação server-side.

**Esforço:** grande.

**Métricas de sucesso:**

- início da primeira atividade;
- tempo até o próximo passo;
- execução do plano;
- clareza do próximo passo;
- retorno em sete dias.

**Critérios de aceite:**

- próximo passo sempre explicável;
- nenhum módulo existente removido;
- fluxo completo acessível e mobile-first;
- estados de erro, vazio, retomada e conclusão cobertos.

### Iniciativa 8 — Praticar em condições compatíveis com a prova-alvo

**Nome técnico interno:** Exam Simulation Suite

**Objetivo:** oferecer quatro experiências inequivocamente distintas e medir
desempenho em condições relevantes.

**Mudança percebida pelo estudante:** ele sabe se está resolvendo uma prova
original, uma versão comentada, um equivalente ou um treino personalizado.

**Escopo:**

1. prova original;
2. prova comentada;
3. simulado equivalente à banca;
4. simulado inteligente e personalizado;
5. análise global, por área e competência;
6. erros críticos, acertos frágeis e confiança calibrada;
7. comparação com o próprio histórico;
8. plano de recuperação e recomendação do mentor.

**Fora de escopo:** apresentar conteúdo autoral como original ou comparar com
aprovados sem dados confiáveis.

**Dependências:** iniciativas 2, 4, 5 e 6; autorização jurídica por formato.

**Riscos:** confusão de proveniência, infração autoral e falsa equivalência.

**Mitigação:** identidade visual e metadados distintos, licença registrada,
validação de blueprint e linguagem explícita.

**Esforço:** muito grande.

**Métricas de sucesso:**

- conclusão de simulados;
- fidelidade ao blueprint;
- evolução contra histórico próprio;
- compreensão do tipo de simulado;
- execução do plano de recuperação.

**Critérios de aceite:**

- quatro tipos separados em dados, API e interface;
- proveniência e critérios visíveis;
- resultado alimenta eventos existentes sem sobrescrever histórico;
- simulado inteligente permanece determinístico.

### Iniciativa 9 — Explicar a preparação em métricas úteis ao estudante

**Nome técnico interno:** Student Success Metrics

**Objetivo:** traduzir evidências em indicadores compreensíveis, sem prometer
aprovação.

**Mudança percebida pelo estudante:** ele acompanha cobertura, estabilidade,
constância e prontidão por área em vez de números técnicos isolados.

**Escopo:**

- cobertura da prova-alvo;
- estabilidade do conhecimento;
- prontidão por área;
- evolução recente e aderência;
- desempenho em condições de prova;
- recuperação de prioridades;
- confiança calibrada;
- constância e risco de esquecimento;
- indicador agregado descritivo, se houver evidência suficiente.

**Fora de escopo:** probabilidade de aprovação sem modelo estatístico validado.

**Dependências:** iniciativas 4, 5, 6 e 8.

**Riscos:** falsa precisão, efeito motivacional adverso e comparações injustas.

**Mitigação:** narrativa, incerteza, histórico próprio como padrão e revisão
ética/estatística.

**Esforço:** grande.

**Métricas de sucesso:**

- compreensão dos indicadores;
- capacidade de identificar o próximo foco;
- redução de interpretações equivocadas;
- calibração e estabilidade técnica.

**Critérios de aceite:**

- metodologia e versão consultáveis;
- linguagem não promete aprovação;
- indicador insuficiente aparece como insuficiente;
- cálculo no backend, reproduzível e coberto por testes.

### Iniciativa 10 — Conversar com um mentor que conhece a jornada

**Nome técnico interno:** Active AI Mentor

**Objetivo:** permitir que a IA, como extensão controlada da metodologia do
mentor, conduza reflexão e explicação com conteúdo homologado.

**Mudança percebida pelo estudante:** o mentor pergunta sobre o raciocínio,
ajuda a comparar hipóteses e explica o próximo passo usando seu contexto real.

**Escopo:**

- perguntar raciocínio e segurança;
- solicitar síntese e comparação;
- conduzir reflexão pós-erro;
- sugerir revisão já autorizada pelo motor;
- adaptar profundidade ao histórico;
- fontes, contexto, prompt e auditoria versionados;
- avaliações clínicas e de segurança.

**Fora de escopo:** calcular Learning DNA, alterar domínio ou plano, inventar
fontes e atribuir falas fictícias.

**Dependências:** iniciativas 1 a 6 e política de IA clínica.

**Riscos:** alucinação, mistura de estudantes, atribuição indevida e confiança
excessiva.

**Mitigação:** recuperação homologada, ferramentas somente leitura, isolamento,
avaliações adversariais e falha segura.

**Esforço:** grande.

**Métricas de sucesso:**

- utilidade percebida;
- precisão de citações;
- aderência ao contexto do estudante;
- taxa de respostas inseguras bloqueadas;
- ausência de mutação pedagógica indevida.

**Critérios de aceite:**

- mentor e natureza da resposta identificados;
- fontes reais e rastreáveis;
- nenhuma regra determinística movida ao modelo;
- testes de isolamento, injection, atribuição e segurança clínica aprovados.

### Iniciativa 11 — Demonstrar valor e aprender com o beta

**Nome técnico interno:** Perceived Value and Beta

**Objetivo:** comprovar que a personalização construída é percebida e melhora a
capacidade de agir.

**Mudança percebida pelo estudante:** nos primeiros minutos, ele entende que a
preparação considera sua prova, seu histórico e a orientação dos mentores.

**Escopo:** métricas de jornada, entrevistas, testes de compreensão, qualidade
do conteúdo e ciclos de melhoria.

**Fora de escopo:** otimização de aquisição antes de validar valor e retenção.

**Dependências:** incrementos utilizáveis das iniciativas anteriores.

**Riscos:** métricas de vaidade, amostra enviesada e coleta excessiva.

**Mitigação:** hipóteses pré-definidas, minimização de dados e combinação de
evidência quantitativa e qualitativa.

**Esforço:** médio e contínuo.

**Métricas de sucesso:** definidas na seção 9.

**Critérios de aceite:**

- instrumentação segura e consentida;
- baseline e metas aprovados;
- resultados segmentados sem expor indivíduos;
- decisões do beta registradas com evidência.

## 4. Domínios transversais

### Learning DNA

Consome eventos e evidências observáveis para produzir indicadores
longitudinais versionados. Não substitui mastery nem cria diagnóstico
psicológico. Todo indicador declara janela, amostra, versão e incerteza.

### Medical Knowledge Graph

Complementa a hierarquia acadêmica com relações editoriais tipadas. Relações
ajudam a formular hipóteses de investigação, mas nunca propagam automaticamente
um erro ou estado pedagógico.

### Student Success Metrics

Traduz estado determinístico para objetivos compreensíveis. A fonte continua
no backend, enquanto a interface apresenta contexto, evolução e próximo passo.

### Mentor Governance

Controla autorização, especialidade, atribuição, autoria, revisão, homologação
e metodologia. O mentor só é associado ao conteúdo conforme evidência
editorial registrada.

### Content Provenance

Registra origem, licença, identidade externa, autoria, revisores, versão,
vigência, fontes e status editorial. Conteúdo sem proveniência suficiente não
é publicado como homologado.

### Exam Intelligence

Mantém perfis de banca versionados e transparentes. Toda afirmação informa
amostra, período, lacunas e confiança.

### AI Safety and Evaluation

Versiona prompts, fontes, ferramentas e avaliações. Mede precisão clínica,
atribuição, isolamento, injection, recusa segura e fidelidade aos dados
determinísticos.

## 5. Sequenciamento

### Ordem recomendada

1. Governança da visão, editorial, jurídica e de IA.
2. Mentor Governance.
3. Content Intelligence Foundation.
4. Medical Knowledge Graph em recorte piloto.
5. Learning DNA mínimo e auditável.
6. Exam Intelligence da banca-piloto.
7. Diagnostic Engine 2.0.
8. Study Journey unificada.
9. Quatro experiências de simulado.
10. Student Success Metrics.
11. Active AI Mentor.
12. Beta e ciclos de melhoria.

### Caminho crítico

Governança jurídica e editorial → conteúdo autorizado e proveniente → perfil
transparente da banca → cobertura suficiente do catálogo → diagnóstico
confiável → simulados e indicadores → beta.

### Entregas paralelizáveis

- perfis e metodologia dos mentores podem avançar junto da fundação de
  conteúdo, após autorização;
- vocabulário inicial do Knowledge Graph pode ser desenhado junto da taxonomia;
- Learning DNA pode começar com eventos existentes enquanto o catálogo cresce;
- UX da jornada pode ser pesquisada sem alterar regras;
- framework de avaliação da IA pode ser preparado antes do Active AI Mentor.

### Dependências jurídicas

- licença ou hipótese legal por prova e material;
- autorização de nome, imagem, vídeo e metodologia;
- regras de citação, transformação e armazenamento;
- política de privacidade para métricas longitudinais.

### Dependências editoriais

- responsáveis por especialidade;
- critérios de revisão e homologação;
- SLA e amostragem de controle de qualidade;
- vocabulário de relações médicas;
- política para correção de conteúdo publicado.

### Dependências de dados

- quantidade e distribuição suficientes por área, competência e dificuldade;
- histórico mínimo para tendências;
- registros confiáveis de tempo e segurança declarada;
- identidade externa e deduplicação;
- dados ausentes representados explicitamente.

### Dependências técnicas

- eventos append-only e reprocessáveis;
- versionamento de algoritmos e projeções;
- consultas e índices para relações;
- contratos compatíveis;
- auditoria, RLS e isolamento;
- observabilidade de importação e avaliações da IA.

## 6. Estratégia de banca-piloto — proposta AMRIGS

AMRIGS é a recomendação técnica, ainda pendente de aprovação formal.

### Escopo inicial

- uma instituição/banca-alvo;
- perfil documentado do formato;
- catálogo de competências e áreas cobradas;
- questões legalmente autorizadas ou metadados analíticos permitidos;
- diagnóstico e simulado equivalente em recorte controlado;
- Clínica Médica, Pediatria, Cirurgia e GO como cobertura mínima.

### Janela recomendada

Analisar inicialmente cinco edições consecutivas recentes, por exemplo 2021 a
2025, desde que todas tenham fonte e situação jurídica registradas. Caso a
licença não cubra alguma edição, a análise deve declarar a lacuna e não
substituí-la silenciosamente.

### Quantidade mínima

- para descrever o perfil geral: pelo menos três provas completas comparáveis;
- para tendência temática: mínimo de 30 itens relevantes e ocorrência em mais
  de uma edição;
- para estatísticas de desempenho: amostra de respostas definida por análise
  estatística, nunca apenas pelo número de questões;
- abaixo dos mínimos, exibir “evidência insuficiente”.

Os limiares finais devem ser aprovados por responsável estatístico e editorial.

### Critérios de qualidade

- fonte e licença registradas;
- enunciado e alternativas conferidos;
- gabarito validado;
- edição, posição e área identificadas;
- competência revisada;
- dificuldade observada separada de dificuldade editorial;
- comentários e referências versionados;
- conflitos encaminhados para revisão.

### Fluxo editorial

Aquisição autorizada → importação idempotente → deduplicação → classificação
inicial → revisão médica → revisão editorial → validação de gabarito e fonte →
homologação → publicação → monitoramento e correção versionada.

### Recursos necessários

- responsável jurídico;
- editor de conteúdo;
- revisores das quatro grandes áreas;
- responsável estatístico;
- engenharia de dados/backend;
- QA editorial e de produto.

### Riscos de licenciamento

- reprodução integral não autorizada;
- limites sobre comentários e transformação;
- origem pública confundida com domínio público;
- materiais de cursinhos ou terceiros incorporados indevidamente.

### MVP sem violar direitos autorais

Enquanto não houver licença para reprodução, o MVP pode usar:

- metadados factuais permitidos e perfil público do edital;
- questões autorais claramente identificadas;
- blueprint equivalente construído a partir de estatísticas legalmente
  utilizáveis;
- links para fontes oficiais quando permitido;
- análises agregadas sem reproduzir conteúdo protegido.

O MVP não deve apresentar questão autoral como original nem armazenar prova
integral sem autorização.

## 7. Estratégia do diagnóstico

### Grandes áreas

O primeiro ciclo deve medir Clínica Médica, Pediatria, Cirurgia Geral,
Ginecologia e Obstetrícia e Medicina Preventiva/Saúde Coletiva quando aplicável
à prova-alvo.

### Cobertura mínima

Cada grande área precisa de:

- itens em mais de uma competência;
- ao menos dois níveis de dificuldade quando o catálogo permitir;
- diversidade de formato e tema;
- quantidade mínima de evidências independentes;
- representação proporcional à prova-alvo sem eliminar cobertura global.

Os números exatos serão calibrados com simulações antes do uso.

### Lógica de aprofundamento

1. medir cobertura ampla;
2. identificar sinais consistentes de força, fragilidade ou incerteza;
3. aprofundar a competência relevante;
4. variar dificuldade e item para confirmar a hipótese;
5. parar somente quando o mínimo de qualidade for atingido ou o orçamento
   seguro de questões for alcançado;
6. declarar incerteza quando o catálogo ou as respostas forem insuficientes.

### Confiança declarada

Quando pedagogicamente adequado, cada resposta permite “tenho certeza”, “estou
em dúvida” ou “não sei”. O sistema combina essa declaração com acerto,
dificuldade, tempo, recorrência e diversidade.

- certeza com erro é sinal para investigação, não rótulo;
- dúvida com acerto indica conhecimento que pode precisar de consolidação;
- não sei com erro registra lacuna explícita;
- padrões exigem múltiplas evidências.

### Critérios de parada

- cobertura mínima por grande área;
- quantidade e diversidade mínimas por competência investigada;
- dificuldade suficiente para a hipótese;
- evidências não redundantes;
- qualidade e atualidade dos itens;
- relevância mínima para a prova-alvo;
- limite de duração e fadiga;
- declaração explícita de baixa confiança quando faltar evidência.

### Prevenção de vieses

- auditar distribuição por área e dificuldade;
- não confundir ausência no catálogo com domínio;
- separar velocidade de acessibilidade ou conexão;
- evitar penalizar uso consistente de “não sei”;
- monitorar diferenças de comportamento entre grupos somente com dados
  minimizados e análise ética;
- usar regras versionadas e reproduzíveis.

### Perfis sintéticos para teste

- forte global;
- frágil global;
- forte em uma área e frágil em outra;
- acerto com baixa confiança;
- erro com alta confiança;
- respostas rápidas e inconsistentes;
- respostas lentas e consistentes;
- catálogo insuficiente;
- interrupção e retomada;
- respostas idênticas com ordens diferentes;
- ausência de segurança declarada.

### Relatório ao estudante

O relatório deve explicar:

- o que foi medido;
- onde há força, fragilidade e incerteza;
- onde mais respostas são necessárias;
- quais padrões de segurança foram observados;
- como a prova-alvo influenciou a leitura;
- qual é o próximo passo;
- que os resultados evoluem com novas evidências.

## 8. Estratégia de simulados

### Prova original

Reprodução autorizada de uma edição real, preservando estrutura, ordem, tempo e
critérios. Deve identificar edição, origem e licença.

### Prova comentada

Versão autorizada da prova original acrescida de comentários homologados,
referências, análise por alternativa, competências e orientação do mentor
quando efetivamente revisada.

### Simulado equivalente

Composição autoral ou autorizada que reproduz um blueprint documentado da
banca. Deve informar que não é prova original e declarar período, amostra e
critérios usados.

### Simulado inteligente

Composição personalizada e determinística que combina perfil da banca,
prioridades do estudante, Learning DNA, revisão necessária, data da prova e
diversidade. Deve explicar por que foi montado e nunca se apresentar como prova
oficial.

Os quatro formatos preservam tentativas e eventos, geram análise comparável ao
próprio histórico e encaminham um plano de recuperação pelo motor
determinístico.

## 9. Métricas do beta

As metas numéricas finais serão definidas após baseline. O beta deve medir:

| Dimensão                        | Métrica                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| Personalização em cinco minutos | Percentual que identifica espontaneamente prova-alvo, mentor e recomendação pessoal |
| Conclusão do diagnóstico        | Inícios, conclusões, abandono por etapa e duração                                   |
| Compreensão do resultado        | Percentual que identifica força, prioridade e próximo passo                         |
| Primeira atividade              | Percentual que inicia uma atividade após diagnóstico ou retorno                     |
| Retorno em sete dias            | Estudantes ativos novamente em até sete dias                                        |
| Execução do plano               | Itens iniciados e concluídos, com motivos de adiamento                              |
| Simulados                       | Início, conclusão, evolução contra histórico e recuperação posterior                |
| Utilidade do mentor             | Avaliação contextual após orientação, sem interrupções frequentes                   |
| Confiança no conteúdo           | Percepção de origem, revisão, atualização e segurança                               |
| Clareza do próximo passo        | Percentual que sabe o que fazer sem procurar outro módulo                           |

Métricas devem ser segmentadas por estágio da jornada e prova-alvo, com
minimização de dados e sem exposição individual.

## 10. Decisões pendentes dos stakeholders

1. Modelo de licenciamento e armazenamento das provas.
2. Autorização de nome, imagem, metodologia, materiais e vídeos dos mentores.
3. Regras de atribuição para autoria, revisão, homologação e IA.
4. Aprovação formal da AMRIGS como banca-piloto.
5. Processo, responsáveis e SLA de revisão médica.
6. Responsabilidade editorial e processo de correção pública.
7. Critérios mínimos de amostra, período e confiança estatística.
8. Política de uso de IA em conteúdo clínico e atribuição aos mentores.
9. Critérios éticos e estatísticos para indicador agregado de prontidão.
10. Condições necessárias para qualquer futura estimativa de aprovação.
11. Política de retenção e explicação dos indicadores de Learning DNA.
12. Baseline e metas de sucesso do beta.

Nenhuma implementação das iniciativas deve começar antes da aprovação deste
roadmap e das decisões bloqueantes aplicáveis à primeira entrega.
