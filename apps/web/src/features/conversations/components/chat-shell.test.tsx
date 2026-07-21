import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChatShell } from './chat-shell';

describe('ChatShell', () => {
  it('renders the initial conversation prompt', () => {
    render(<ChatShell />);
    expect(
      screen.getByRole('heading', { name: 'Como vamos estudar hoje?' }),
    ).toBeInTheDocument();
  });
});
