import type { Metadata } from 'next';
import Link from 'next/link';
import {
  DiagnosisPreview,
  PlatformShowcase,
} from '../../features/landing/platform-showcase';
import { LandingEvents } from '../../features/landing/landing-events';
import {
  LearningJourney,
  AIAndMedicalCuration,
  MentorsSection,
  CommunitySection,
  CareerMentoringSection,
  PodcastSection,
  FAQSection,
  FinalCTA,
  LandingFooter,
} from '../../features/landing/landing-sections';
import s from '../../features/landing/landing.module.css';

const title = 'Iatron | Preparação Inteligente para Residência Médica';
const description =
  'Organize sua preparação para a residência médica com diagnóstico de proficiência, trilhas personalizadas e explicações apoiadas por inteligência artificial.';
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: 'https://go.iatron.com.br/' },
  openGraph: {
    title,
    description,
    url: 'https://go.iatron.com.br/',
    siteName: 'Iatron',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: { card: 'summary', title, description },
};

export default function HomePage() {
  return (
    <div className={s.page}>
      <LandingEvents />
      <main id="conteudo" tabIndex={-1}>
        <section className={s.hero} aria-labelledby="hero-title">
          <div className={`${s.container} ${s.heroGrid}`}>
            <div className={s.heroCopy}>
              <span className={s.eyebrow}>
                PREPARAÇÃO INTELIGENTE PARA RESIDÊNCIA MÉDICA
              </span>
              <h1 id="hero-title">
                Sua preparação começa pelo que você precisa <em>aprender.</em>
              </h1>
              <p>
                A Iatron combina inteligência artificial e uma proposta de
                curadoria médica para identificar lacunas, organizar sua trilha
                de estudos e acompanhar sua evolução.
              </p>
              <div className={s.actions}>
                <Link
                  href="/cadastro"
                  className={s.button}
                  data-lp-event="hero_primary_cta_click"
                >
                  Conhecer minha trilha de estudos{' '}
                  <span aria-hidden="true">↗</span>
                </Link>
                <a
                  href="#como-funciona"
                  className={s.textLink}
                  data-lp-event="hero_secondary_cta_click"
                >
                  Como funciona a Iatron
                </a>
              </div>
              <p className={s.note}>
                Crie sua conta e comece pelo diagnóstico.
              </p>
              <ul className={s.benefits}>
                <li>Diagnóstico individual</li>
                <li>Trilha personalizada</li>
                <li>Referências médicas</li>
              </ul>
            </div>
            <div className={s.heroVisual}>
              <div className={s.visualCaption}>
                <strong>Sua preparação, com direção.</strong>
                <span>VISÃO DA PLATAFORMA</span>
              </div>
              <DiagnosisPreview />
              <p>
                Do que você já sabe ao que precisa revisar: cada etapa informa o
                próximo passo.
              </p>
            </div>
          </div>
        </section>
        <div className={s.strip}>
          <div className={s.container}>
            <span>Clínica Médica</span>
            <span>Pediatria</span>
            <span>Cirurgia Geral</span>
            <span>Ginecologia e Obstetrícia</span>
          </div>
        </div>
        <LearningJourney />
        <AIAndMedicalCuration />
        <section
          id="plataforma"
          className={s.section}
          aria-labelledby="platform-title"
        >
          <div className={s.container}>
            <span className={s.eyebrow}>CONHEÇA A EXPERIÊNCIA</span>
            <h2 id="platform-title">
              Visualize sua preparação. <br />
              Entenda seu próximo passo.
            </h2>
            <p className={s.intro}>
              Explore um exemplo de como diagnóstico, lacunas e atividades se
              conectam na sua jornada.
            </p>
            <PlatformShowcase />
            <div className={s.actions}>
              <Link
                href="/cadastro"
                className={s.button}
                data-lp-event="platform_cta_click"
              >
                Quero conhecer minha preparação{' '}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
        <MentorsSection />
        <CommunitySection />
        <CareerMentoringSection />
        <PodcastSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
