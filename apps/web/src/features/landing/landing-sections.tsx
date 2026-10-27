import Link from 'next/link';
import { DiagnosticCTA } from '@/features/acquisition/diagnostic-cta';
import { mentors } from '../mentors/mentors';
import { faqs } from './content';
import { LearningProgression } from './learning-journey';
import { MentorPortrait } from './mentor-portrait';
import s from './landing.module.css';

export function LearningJourney() {
  return (
    <>
      <section className={s.problem} aria-labelledby="problem-title">
        <div className={s.container}>
          <span className={s.eyebrow}>MAIS CLAREZA. MENOS DISPERSÃO.</span>
          <h2 id="problem-title">
            Estudar mais nem sempre <br />
            significa estudar melhor.
          </h2>
          <div className={s.problemGrid}>
            <p>
              Mais conteúdo não resolve a falta de direção. Reconheça suas
              lacunas, escolha prioridades e encontre uma rotina possível.
            </p>
            <ul>
              <li>O que preciso aprender?</li>
              <li>Por onde começo?</li>
              <li>Como sei que estou evoluindo?</li>
            </ul>
          </div>
          <p className={s.bridge}>
            Transforme essas perguntas em próximos passos.
          </p>
        </div>
      </section>
      <section
        id="como-funciona"
        className={s.section}
        aria-labelledby="journey-title"
      >
        <div className={s.container}>
          <span className={s.eyebrow}>
            DA PRIMEIRA RESPOSTA AO PRÓXIMO PASSO
          </span>
          <h2 id="journey-title">
            Do seu ponto de partida <br />
            ao próximo passo.
          </h2>
          <LearningProgression />
        </div>
      </section>
    </>
  );
}

export function AIAndMedicalCuration() {
  return (
    <section className={s.curation} aria-labelledby="curation-title">
      <div className={s.container}>
        <span className={s.eyebrow}>DUAS FORÇAS. UMA PREPARAÇÃO.</span>
        <h2 id="curation-title">
          A tecnologia orienta o estudo. <br />
          <em>A experiência médica dá contexto.</em>
        </h2>
        <div className={s.curationPair}>
          <article className={s.technologyPanel}>
            <span className={s.smallNumber}>01 / TECNOLOGIA</span>
            <h3>Dados orientam. A IA explica.</h3>
            <p>
              O sistema organiza suas prioridades. A IA ajuda a compreender os
              resultados e aprofundar o estudo.
            </p>
            <div
              className={s.decisionFlow}
              aria-label="Como a tecnologia apoia o estudo"
            >
              <span>Suas respostas</span>
              <span aria-hidden="true">↓</span>
              <strong>Prioridades de aprendizagem</strong>
              <span aria-hidden="true">↓</span>
              <span>Explicações com IA</span>
            </div>
          </article>
          <span className={s.connection} aria-hidden="true">
            +
          </span>
          <article className={s.medicalPanel}>
            <span className={s.smallNumber}>02 / EXPERIÊNCIA MÉDICA</span>
            <h3>Conhecimento encontra contexto.</h3>
            <p>
              A curadoria integra a proposta educacional, conectando fontes,
              formação e perspectivas da prática médica.
            </p>
            <div
              className={s.curationPillars}
              aria-label="Pilares da proposta de curadoria"
            >
              <span>Fontes e referências</span>
              <span>Status de revisão</span>
              <span>Contexto clínico</span>
              <span>Formação profissional</span>
            </div>
          </article>
        </div>
        <div className={s.curationResult}>
          <span aria-hidden="true">↳</span>
          <strong>Seu próximo estudo, com direção e contexto.</strong>
          <p>
            Consulte fontes e revisão em cada conteúdo. Explicações de IA não
            equivalem a revisão médica individual.
          </p>
        </div>
      </div>
    </section>
  );
}

export function MentorsSection() {
  return (
    <section
      id="mentores"
      className={s.section}
      aria-labelledby="mentors-title"
    >
      <div className={s.container}>
        <span className={s.eyebrow}>CONHEÇA SEUS MENTORES</span>
        <h2 id="mentors-title">
          Experiência médica <br />
          que vai além dos livros.
        </h2>
        <p className={s.intro}>
          Quatro referências médicas para ampliar sua visão da formação e das
          especialidades.
        </p>
        <div className={s.mentors}>
          {mentors.map((mentor) => (
            <article className={s.mentor} key={mentor.id}>
              <MentorPortrait
                name={mentor.displayName}
                initials={mentor.initials}
              />
              <p className={s.eyebrow}>{mentor.specialty}</p>
              <h3>{mentor.displayName}</h3>
              <p className={s.mentorRole}>Referência educacional da Iatron.</p>
            </article>
          ))}
        </div>
        <p className={s.note}>
          A orientação na plataforma é apoiada por IA. A apresentação dos
          mentores não implica atendimento individual nem revisão pessoal de
          cada resposta.
        </p>
      </div>
    </section>
  );
}

export function CommunitySection() {
  return (
    <section
      id="comunidade"
      className={s.community}
      aria-labelledby="community-title"
    >
      <div className={`${s.container} ${s.twoColumns}`}>
        <div className={s.communityCopy}>
          <span className={s.eyebrow}>COMUNIDADE IATRON · EM PREPARAÇÃO</span>
          <h2 id="community-title">
            Você não precisa construir sua carreira médica sozinho.
          </h2>
          <p>
            Estratégias de estudo, dúvidas e experiências. Um espaço proposto
            para aprender também com outras perspectivas.
          </p>
          <details id="comunidade-detalhes" className={s.offerDetails}>
            <summary className={s.textLink} data-lp-event="community_cta_click">
              Conhecer a comunidade <span aria-hidden="true">+</span>
            </summary>
            <p>
              A comunidade será organizada no WhatsApp. Acesso, regras e
              condições serão divulgados quando disponíveis. A participação dos
              médicos dependerá da disponibilidade do programa.
            </p>
          </details>
        </div>
        <figure
          className={s.conversation}
          aria-label="Exemplo ilustrativo de conversa na comunidade"
        >
          <figcaption>
            <strong>Comunidade Iatron</strong>
            <span>Exemplo ilustrativo · mensagens fictícias</span>
          </figcaption>
          <div className={s.conversationTopic}>
            TROCA DE ESTRATÉGIAS DE ESTUDO
          </div>
          <div className={s.message}>
            <span>Participante A</span>
            <p>Como vocês encaixam a revisão na semana?</p>
          </div>
          <div className={`${s.message} ${s.reply}`}>
            <span>Participante B</span>
            <p>
              Separo um momento para retomar os temas em que tive mais dúvidas.
            </p>
          </div>
          <div className={s.message}>
            <span>Participante A</span>
            <p>Vou experimentar e compartilhar como foi.</p>
          </div>
          <p className={s.conversationNote}>
            Uma representação de troca educacional. Não são mensagens reais nem
            falas dos mentores.
          </p>
        </figure>
      </div>
    </section>
  );
}

export function CareerMentoringSection() {
  return (
    <section id="mentoria" className={s.career} aria-labelledby="career-title">
      <div className={`${s.container} ${s.twoColumns}`}>
        <div>
          <span className={s.eyebrow}>ALÉM DA PROVA · EM PREPARAÇÃO</span>
          <h2 id="career-title">
            A residência é uma etapa. <br />
            <em>Sua carreira médica é uma jornada.</em>
          </h2>
          <p>
            Uma proposta de orientação para suas escolhas profissionais, com a
            perspectiva de quem conhece a medicina na prática.
          </p>
          <details id="mentoria-detalhes" className={s.offerDetails}>
            <summary
              className={s.lightButton}
              data-lp-event="career_mentoring_cta_click"
            >
              Conhecer a mentoria <span aria-hidden="true">+</span>
            </summary>
            <p>
              Oferta complementar em preparação. Formato, agenda e condições
              ainda serão divulgados. Não há contratação disponível nesta
              página.
            </p>
          </details>
        </div>
        <div className={s.careerMap}>
          <span className={s.eyebrow}>UM OLHAR PARA AS PRÓXIMAS ESCOLHAS</span>
          <ol>
            <li>
              <span>01 / FORMAÇÃO</span>
              <h3>Onde quero chegar?</h3>
              <p>Residência e escolha de especialidade.</p>
            </li>
            <li>
              <span>02 / PRÁTICA</span>
              <h3>Que caminho faz sentido?</h3>
              <p>Desafios do início da carreira.</p>
            </li>
            <li>
              <span>03 / DESENVOLVIMENTO</span>
              <h3>Como seguir evoluindo?</h3>
              <p>Planejamento da trajetória profissional.</p>
            </li>
          </ol>
          <a className={s.lightLink} href="#podcast-title">
            Explore essas conversas no podcast <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function PodcastSection() {
  return (
    <section className={s.section} aria-labelledby="podcast-title">
      <div className={`${s.container} ${s.podcast}`}>
        <div>
          <span className={s.eyebrow}>PRÓXIMA CONDUTA · PODCAST OFICIAL</span>
          <h2 id="podcast-title">
            Conversas que ampliam <br />
            sua visão da medicina.
          </h2>
          <p>
            No Próxima Conduta, os médicos compartilham experiências,
            trajetórias e reflexões sobre a carreira médica.
          </p>
          <span className={s.episode}>EPISÓDIO #0</span>
          <h3>Carreira médica: como escolhemos nossos caminhos</h3>
          <a
            className={s.textLink}
            href="https://www.youtube.com/watch?v=PEKL4AgCtMQ"
            target="_blank"
            rel="noopener noreferrer"
            data-lp-event="podcast_play_click"
          >
            Assistir ao episódio <span aria-hidden="true">↗</span>
            <span className="sr-only"> no YouTube (abre em nova aba)</span>
          </a>
        </div>
        <div className={s.player}>
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
      </div>
    </section>
  );
}

export function FAQSection() {
  return (
    <section className={s.faq} aria-labelledby="faq-title">
      <div className={`${s.container} ${s.faqGrid}`}>
        <div>
          <span className={s.eyebrow}>ANTES DO SEU PRÓXIMO PASSO</span>
          <h2 id="faq-title">
            Suas dúvidas sobre <br />a Iatron, respondidas.
          </h2>
        </div>
        <div>
          {faqs.map(([question, answer], i) => (
            <details key={question} data-faq={String(i + 1)}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className={s.final} aria-labelledby="final-title">
      <div className={s.container}>
        <span className={s.eyebrow}>
          INTELIGÊNCIA PARA ESTUDAR. EXPERIÊNCIA MÉDICA PARA EVOLUIR.
        </span>
        <h2 id="final-title">
          Seu próximo passo na medicina <br />
          merece uma preparação com direção.
        </h2>
        <p>Conheça seu ponto de partida e organize o próximo estudo.</p>
        <DiagnosticCTA location="final" className={s.lightButton} />
        <a className={s.lightLink} href="#mentoria">
          Conhecer a mentoria
        </a>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.footerTop}>
          <div>
            <Link href="/" className={s.logo}>
              Iatron<span>.</span>
            </Link>
            <p>
              Inteligência para estudar. <br />
              Experiência médica para evoluir.
            </p>
          </div>
          <nav aria-label="Navegação institucional">
            <a href="#plataforma">Plataforma</a>
            <a href="#mentores">Mentores</a>
            <a href="#comunidade">Comunidade</a>
            <a href="#mentoria">Mentoria de carreira</a>
            <a href="#podcast-title">Podcast</a>
            <Link href="/login">Entrar</Link>
          </nav>
        </div>
        <div className={s.footerBottom}>
          <span>Iatron · Educação médica</span>
          <span>
            Uma experiência educacional. Não oferece atendimento médico.
          </span>
        </div>
      </div>
    </footer>
  );
}
