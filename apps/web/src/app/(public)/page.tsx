import { Button } from '@iatron/ui';
import Link from 'next/link';
import { MentorCard } from '@/features/mentors/components/mentor';
import { mentors } from '@/features/mentors/mentors';

export default function HomePage() {
  return (
    <main className="mentor-landing">
      <section className="mentor-hero">
        <div>
          <p className="eyebrow">Preparação para residência médica</p>
          <h1>Os melhores próximos passos começam com boa orientação.</h1>
          <p>
            Mentores médicos acompanham sua preparação com um plano que respeita
            sua rotina, suas respostas e a prova que você escolheu. A tecnologia
            trabalha nos bastidores para ampliar esse cuidado.
          </p>
          <Link href="/login">
            <Button className="mt-8">Conhecer minha preparação</Button>
          </Link>
        </div>
        <div className="mentor-hero-panel" aria-label="Mentores do Iatron">
          <p className="eyebrow">Mentores do Iatron</p>
          <h2>Especialistas presentes em cada etapa.</h2>
          <p>
            Do diagnóstico ao plano diário, você sempre sabe quem está
            conduzindo a orientação e por que aquele passo importa.
          </p>
          <div className="mentor-avatar-stack">
            {mentors.map((mentor) => (
              <span
                aria-label={`${mentor.displayName}, ${mentor.specialty}`}
                className="mentor-avatar"
                data-size="medium"
                data-specialty={mentor.id}
                key={mentor.id}
              >
                {mentor.initials}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section aria-labelledby="mentor-team-title" className="mentor-team">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Quem orienta sua preparação</p>
            <h2 id="mentor-team-title">Conheça seus mentores</h2>
          </div>
          <p>
            Cada especialidade tem uma referência. O mentor mais próximo do seu
            plano assume a condução da experiência.
          </p>
        </div>
        <div className="mentor-grid">
          {mentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      </section>
      <section aria-labelledby="podcast-title" className="landing-podcast">
        <div className="landing-podcast-copy">
          <p className="eyebrow">Podcast oficial do Iatron</p>
          <h2 id="podcast-title">Próxima Conduta</h2>
          <p>
            Conheça o episódio de estreia e acompanhe o Próxima Conduta no
            YouTube.
          </p>
          <div className="landing-podcast-episode">
            <p className="landing-podcast-number">Episódio #0</p>
            <h3>Carreira médica: como escolhemos nossos caminhos</h3>
          </div>
          <a
            className="landing-podcast-link"
            href="https://www.youtube.com/watch?v=PEKL4AgCtMQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            Assistir no YouTube
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (abre em uma nova aba)</span>
          </a>
        </div>
        <div className="landing-podcast-player">
          <iframe
            src="https://www.youtube-nocookie.com/embed/PEKL4AgCtMQ"
            title="Próxima Conduta — Episódio #0: Carreira médica: como escolhemos nossos caminhos"
            width="560"
            height="315"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>
    </main>
  );
}
