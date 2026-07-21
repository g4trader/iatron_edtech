import { demoQuestion } from '@/features/conversations/mocks/demo-data';

export const demoAssessment = {
  id: 'assessment-demo',
  title: 'Avaliação diagnóstica — demonstração',
  durationMinutes: 30,
  questions: [
    { ...demoQuestion, id: 'q1', number: 1 },
    { ...demoQuestion, id: 'q2', number: 2, area: 'Cirurgia — demonstração' },
    { ...demoQuestion, id: 'q3', number: 3, area: 'Pediatria — demonstração' },
  ],
} as const;

export const pausedAssessment = {
  ...demoAssessment,
  status: 'paused' as const,
};
export const completedAssessment = {
  ...demoAssessment,
  status: 'complete' as const,
};
