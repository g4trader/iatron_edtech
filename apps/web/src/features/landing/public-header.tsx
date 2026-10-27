'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import styles from './header.module.css';

const navigation = [
  ['#como-funciona', 'Como funciona'],
  ['#plataforma', 'Plataforma'],
  ['#mentores', 'Mentores'],
  ['#comunidade', 'Comunidade'],
  ['#mentoria', 'Mentoria de carreira'],
] as const;

function LandingHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  return (
    <header
      className={styles.header}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <a className={styles.skipLink} href="#conteudo">
        Ir para o conteúdo
      </a>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="Iatron — início">
          Iatron<span aria-hidden="true">.</span>
        </Link>
        <button
          ref={toggle}
          className={styles.toggle}
          type="button"
          aria-expanded={open}
          aria-controls="landing-navigation"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen(!open)}
        >
          <span>{open ? 'Fechar' : 'Menu'}</span>
          <span className={styles.menuIcon} data-open={open} aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
        <nav
          id="landing-navigation"
          className={styles.navigation}
          aria-label="Navegação principal"
          data-open={open}
        >
          <div className={styles.sections}>
            {navigation.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
          </div>
          <div className={styles.actions}>
            <Link
              className={styles.login}
              href="/login"
              onClick={() => setOpen(false)}
            >
              Entrar
            </Link>
            <Link
              className={styles.cta}
              href="/cadastro"
              onClick={() => setOpen(false)}
            >
              Conhecer a Iatron
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function PublicHeader() {
  const pathname = usePathname();
  if (pathname === '/') return <LandingHeader />;

  return (
    <header className="public-header">
      <Link className="text-xl font-bold tracking-tight" href="/">
        Iatron
      </Link>
      <Link
        className="rounded-lg px-4 py-2 font-medium hover:bg-teal-50"
        href="/login"
      >
        Entrar
      </Link>
    </header>
  );
}
