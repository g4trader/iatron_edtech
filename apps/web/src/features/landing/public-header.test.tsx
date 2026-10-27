import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicHeader } from './public-header';

let pathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

describe('PublicHeader', () => {
  beforeEach(() => {
    pathname = '/';
  });

  it('oferece as seções da landing e os destinos reais de acesso', () => {
    render(<PublicHeader />);
    expect(
      screen.getByRole('link', { name: 'Iniciar meu diagnóstico' }),
    ).toHaveAttribute('href', '/app/assessment/entry');
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
      'href',
      '/login',
    );
    for (const [label, href] of [
      ['Como funciona', '#como-funciona'],
      ['Plataforma', '#plataforma'],
      ['Mentores', '#mentores'],
      ['Comunidade', '#comunidade'],
      ['Mentoria de carreira', '#mentoria'],
    ]) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute(
        'href',
        href,
      );
    }
  });

  it('fecha o disclosure por Escape e restaura o foco', () => {
    render(<PublicHeader />);
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const link = screen.getByRole('link', { name: 'Mentores' });
    link.focus();
    fireEvent.keyDown(link, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('fecha ao seguir uma âncora', () => {
    render(<PublicHeader />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    fireEvent.click(screen.getByRole('link', { name: 'Plataforma' }));
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it.each(['/login', '/cadastro', '/esqueci-minha-senha', '/redefinir-senha'])(
    'preserva o header público anterior em %s',
    (route) => {
      pathname = route;
      render(<PublicHeader />);
      expect(screen.getByRole('banner')).toHaveClass('public-header');
      expect(screen.getAllByRole('link')).toHaveLength(2);
      expect(screen.getByRole('link', { name: 'Iatron' })).toHaveAttribute(
        'href',
        '/',
      );
      expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
        'href',
        '/login',
      );
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    },
  );

  it('descarta o menu aberto quando sai da landing', () => {
    const { rerender } = render(<PublicHeader />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    pathname = '/login';
    rerender(<PublicHeader />);
    pathname = '/';
    rerender(<PublicHeader />);
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
