import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TutorConversation } from '@iatron/contracts';
import { mentors } from '@/features/mentors/mentors';
import { TutorShell } from './tutor-shell';

vi.mock('@/features/conversations/components/chat-shell', () => ({
  ChatShell: ({
    assistantIdentity,
  }: {
    assistantIdentity: { name: string };
  }) => <div>{assistantIdentity.name}</div>,
}));

vi.mock('../transport/real-tutor-transport', () => ({
  RealTutorTransport: class {},
}));

const conversation: TutorConversation = {
  id: '0d537508-870c-4d0e-aa6a-d9af0206ee4c',
  title: 'Nova conversa',
  mode: 'general',
  originType: null,
  originId: null,
  status: 'active',
  createdAt: '2026-07-24T12:00:00.000Z',
  updatedAt: '2026-07-24T12:00:00.000Z',
};

describe('experiência de mentoria', () => {
  it('separa o mentor da área da explicação gerada por IA', () => {
    render(
      <TutorShell
        conversation={conversation}
        mentor={mentors[1]!}
        messages={[]}
      />,
    );

    expect(screen.getByText(/mentor da área: dr\. lucas/i)).toBeVisible();
    expect(
      screen.getByText(/explicação gerada pela ia do iatron/i),
    ).toBeVisible();
    expect(screen.getByText('IA do Iatron')).toBeVisible();
    expect(document.body.textContent).not.toMatch(/dr\. lucas orienta/i);
  });
});
