export function learningStage(value: number) {
  if (value >= 0.75) return 'Você demonstra segurança neste conteúdo.';
  if (value >= 0.5) return 'Seu conhecimento está ganhando consistência.';
  if (value >= 0.3) return 'Você ainda está consolidando este conteúdo.';
  return 'Este conteúdo merece atenção desde os fundamentos.';
}

export function measurementClarity(value: number) {
  if (value >= 0.75)
    return 'Já temos respostas suficientes para compreender bem seu momento.';
  if (value >= 0.4)
    return 'Seu retrato está ficando mais claro a cada nova atividade.';
  return 'Ainda precisamos de mais respostas para conhecer seu nível com precisão.';
}

export function studyPriority(value: number) {
  if (value >= 0.65) return 'Vale estudar agora';
  if (value >= 0.35) return 'Importante para os próximos estudos';
  return 'Pode entrar depois no seu plano';
}

export function questionSelectionReason(reason: string) {
  return (
    {
      'competência ainda não medida':
        'Ainda conhecemos pouco seu desempenho neste assunto.',
      'confirmação de baixa confiança':
        'Uma nova resposta ajudará a tornar seu resultado mais preciso.',
      'aumento controlado de dificuldade':
        'Você avançou bem, então esta questão propõe um desafio um pouco maior.',
      'cobertura equilibrada de competências':
        'Esta questão ajuda a conhecer outra parte importante da sua preparação.',
    }[reason] ?? 'Esta questão ajuda a tornar seu diagnóstico mais completo.'
  );
}

export function activityReason(code: string) {
  return (
    {
      gap_priority:
        'Este assunto está entre suas principais oportunidades de evolução.',
      low_mastery:
        'Suas respostas mostram que este conteúdo ainda está em consolidação.',
      low_confidence:
        'Mais prática ajudará a compreender seu desempenho com maior precisão.',
      negative_trend:
        'Suas respostas recentes indicam que vale retomar este conteúdo.',
      forgotten: 'Faz algum tempo desde sua última prática neste assunto.',
      unmeasured:
        'Ainda precisamos conhecer melhor seu desempenho neste conteúdo.',
      target_exam_relevance:
        'Este conteúdo faz parte da preparação para a prova que você escolheu.',
      exam_proximity:
        'A proximidade da sua prova torna esta revisão mais oportuna.',
      previously_deferred:
        'Esta atividade foi adiada antes e voltou para não ficar esquecida.',
      previously_skipped:
        'Este assunto voltou ao plano porque ainda merece atenção.',
      recently_completed:
        'Você já estudou este conteúdo recentemente; esta atividade reforça o aprendizado.',
    }[code] ?? 'Esta atividade ajuda a fortalecer uma prioridade da sua preparação.'
  );
}

export function learningActivityLabel(type: string) {
  return (
    {
      evidence: 'Atividade considerada',
      mastery: 'Progresso atualizado',
      gap: 'Nova prioridade identificada',
      schedule: 'Próximo estudo sugerido',
      QuestionAnswered: 'Questão respondida',
      AssessmentFinished: 'Diagnóstico concluído',
      StudySessionCompleted: 'Sessão de estudo concluída',
      ReviewCompleted: 'Revisão concluída',
      FlashcardReviewed: 'Cartão de revisão estudado',
      SimulationFinished: 'Simulado concluído',
    }[type] ?? 'Evolução registrada'
  );
}

export function difficultyLabel(value: number) {
  if (value >= 4) return 'questão desafiadora';
  if (value >= 3) return 'questão intermediária';
  return 'questão fundamental';
}
