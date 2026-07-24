# Voz e tom do Iatron

Este documento define como o Iatron conversa com estudantes em toda a
experiência. Ele é obrigatório para textos de interface, notificações,
mensagens transacionais e respostas do Tutor.

## Nossa personalidade

O Iatron é:

- **humano:** fala com naturalidade e reconhece o contexto do estudante;
- **calmo:** orienta sem criar urgência ou culpa;
- **confiável:** explica limites, motivos e próximos passos;
- **objetivo:** usa a menor quantidade de texto necessária para ajudar;
- **encorajador:** valoriza progresso real sem exageros;
- **respeitoso:** trata escolhas e dificuldades sem julgamento.

O Iatron nunca é:

- arrogante ou dono da verdade;
- excessivamente técnico;
- robótico ou burocrático;
- infantil;
- artificialmente motivacional;
- alarmista.

## Regras de escrita

1. Fale diretamente com o estudante usando “você” e “seu”.
2. Comece pela informação que ajuda a agir.
3. Prefira voz ativa, verbos concretos e frases curtas.
4. Explique termos médicos quando o contexto não os tornar evidentes.
5. Evite termos internos do produto, nomes de algoritmos e códigos.
6. Explique por que uma informação é pedida e qual benefício ela oferece.
7. Diga quando uma escolha poderá ser alterada depois.
8. Não use culpa, medo, pressão ou comparação com outros estudantes.
9. Não prometa aprovação, desempenho ou resultados clínicos.
10. Preserve precisão médica sem transformar a interface em documentação
    técnica.

## Como adaptar o tom

A voz permanece a mesma. O tom se ajusta à situação:

- **decisão:** claro e orientador;
- **progresso:** positivo e factual;
- **erro:** calmo, responsável e recuperável;
- **espera:** transparente sobre o que está acontecendo;
- **resultado abaixo do esperado:** acolhedor, sem minimizar o dado;
- **risco ou limite:** direto, sem dramatização.

## Padrões por situação

### Mensagens de erro

Informe o que não funcionou, preserve o que for possível e ofereça uma ação.
Nunca culpe o estudante.

- Evite: “Erro 500. Operação inválida.”
- Use: “Não conseguimos salvar agora. Suas respostas continuam nesta tela.
  Tente novamente.”

Quando não houver recuperação imediata:

- “Não foi possível carregar seu plano. Tente novamente em alguns minutos.”

### Mensagens de sucesso

Confirme a ação e, quando útil, explique o que acontece depois.

- Evite: “Operação realizada com sucesso.”
- Use: “Preferências salvas. Vamos usá-las para organizar seu plano.”

### Onboarding

Explique benefício, esforço esperado e liberdade para mudar depois.

- “Conte como é sua rotina. Assim, distribuímos seus estudos em horários que
  façam sentido para você.”
- “Você poderá ajustar estas escolhas depois.”

Evite linguagem de cadastro administrativo como “parametrização”,
“configuração obrigatória” e “preenchimento de perfil”.

### Carregamento

Descreva o resultado que está sendo preparado. Não deixe apenas um spinner.

- Evite: “Carregando…”
- Use: “Organizando suas prioridades de estudo…”
- Use: “Preparando o resultado do diagnóstico…”

Não invente etapas ou percentuais que o sistema não consegue medir.

### Estados vazios

Explique por que ainda não há conteúdo, o que aparecerá ali e qual é o próximo
passo.

- Evite: “Nenhum dado encontrado.”
- Use: “Seu domínio aparecerá aqui depois do primeiro diagnóstico. Comece
  quando estiver pronto.”

### Tutor IA

O Tutor deve parecer uma orientação conduzida por um mentor médico, nunca um
chatbot genérico. A IA amplia a capacidade do mentor, mas não assume sua voz
como protagonista.

- identifique o mentor e sua especialidade quando isso ajudar o contexto;
- reconheça a pergunta antes de responder;
- use dados reais do estudante sem inventar métricas;
- explique recomendações e cite fontes quando existirem;
- diferencie fatos, interpretações e sugestões;
- admita limites com clareza;
- não faça diagnóstico, prescrição ou atendimento médico;
- nunca use dados de outro estudante;
- termine com um próximo passo útil quando houver.

Evite:

> Sou uma IA e analisei seu mastery.

Prefira:

> Durante seu diagnóstico, percebemos que este tema merece reforço antes da
> prova. Vamos começar pelo fundamento que mais ajudará nos próximos conteúdos.

Exemplo:

> Esta competência está no seu plano porque suas evidências recentes indicam
> baixa confiança nesse conteúdo. Posso revisar o conceito com você ou propor
> uma questão para praticar.

### Notificações

Uma notificação deve ser útil, específica e acionável. Evite pressão e
interrupções sem benefício.

- Evite: “Você está atrasado!”
- Use: “Há uma sessão planejada para hoje. Se sua rotina mudou, você pode
  reorganizar o plano.”

### Confirmações

Use confirmação adicional apenas em ações relevantes ou difíceis de desfazer.
Nomeie a ação no botão.

- Título: “Sair desta sessão?”
- Texto: “Suas respostas confirmadas continuarão salvas.”
- Ações: “Continuar respondendo” e “Sair da sessão”.

Evite botões genéricos como “OK”, “Sim” e “Não”.

### Feedback durante ações

O feedback deve acompanhar o ciclo completo:

1. ação disponível;
2. ação em andamento;
3. resultado confirmado;
4. recuperação, se houver erro.

Exemplo:

- “Salvar e continuar”
- “Salvando suas preferências…”
- “Preferências salvas”

O texto em andamento descreve o benefício, não o mecanismo:

- Evite: “Processando…”
- Use: “Organizando suas prioridades…”
- Evite: “Loading assessment…”
- Use: “Preparando seu diagnóstico…”

### Resultados e progresso

Apresente primeiro o significado, depois os números.

- Evite: “Resultado: 62%. Coverage: 40%.”
- Use: “Agora já conhecemos seu ponto de partida. Avaliamos 40% das
  competências selecionadas e continuaremos refinando esse retrato.”

Celebre conclusão sem exagero:

- Evite: “Incrível! Você arrasou!”
- Use: “Sessão concluída. Este resultado já atualizou sua evolução.”

## Vocabulário preferido

| Evite | Prefira |
| --- | --- |
| Configuração | Preferências, escolhas |
| Assessment | Diagnóstico, avaliação |
| Learning Engine | Seu progresso, sua aprendizagem |
| Scheduler | Plano, organização dos estudos |
| Mastery | Domínio |
| Learning gaps | Prioridades, pontos a fortalecer |
| Persistência | Salvo, suas informações continuam aqui |
| Algoritmo | Critérios, motivos |
| Usuário | Estudante ou você |

## Revisão rápida

Antes de publicar um texto, confirme:

- parece uma conversa com uma pessoa adulta?
- ajuda o estudante a compreender ou agir?
- explica benefício e consequência quando necessário?
- evita jargão interno e promessas artificiais?
- funciona fora do contexto visual?
- continua claro em uma tela pequena e para leitor de tela?
