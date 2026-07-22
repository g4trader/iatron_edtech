insert into public.learning_event_types (code, name, description, produces_evidence)
values
  ('QuestionAnswered', 'Questão respondida', 'Resposta submetida para uma questão.', true),
  ('AssessmentFinished', 'Avaliação concluída', 'Avaliação diagnóstica ou formativa concluída.', false),
  ('StudySessionCompleted', 'Sessão de estudo concluída', 'Sessão planejada de estudo concluída.', false),
  ('ReviewCompleted', 'Revisão concluída', 'Revisão de conteúdo concluída.', false),
  ('FlashcardReviewed', 'Flashcard revisado', 'Revisão individual de flashcard concluída.', false),
  ('SimulationFinished', 'Simulado concluído', 'Simulado completo concluído.', false)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  produces_evidence = excluded.produces_evidence;
