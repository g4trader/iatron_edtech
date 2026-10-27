import Link from 'next/link';
import { mentors } from '../mentors/mentors';
import { journey, faqs } from './content';
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
              Entre tantos conteúdos, o desafio é reconhecer suas lacunas,
              definir prioridades e construir uma rotina que faça sentido para
              você.
            </p>
            <ul>
              <li>Estudar sem saber onde estão suas lacunas.</li>
              <li>
                Seguir a mesma sequência, mesmo com necessidades diferentes.
              </li>
              <li>Tomar decisões de formação e carreira sem orientação.</li>
            </ul>
          </div>
          <p className={s.bridge}>
            Uma preparação com direção começa ao conectar evidências de
            aprendizagem e experiência médica.
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
            Uma jornada de estudos construída <br />a partir do seu
            conhecimento.
          </h2>
          <ol className={s.journey}>
            {journey.map(([label, title, description], index) => (
              <li key={label}>
                <span className={s.step}>0{index + 1}</span>
                <span className={s.eyebrow}>{label}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
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
          Tecnologia para orientar o estudo. <br />
          <em>Experiência médica para dar contexto.</em>
        </h2>
        <div className={s.twoColumns}>
          <article>
            <span className={s.smallNumber}>01 / INTELIGÊNCIA APLICADA</span>
            <h3>Mais sentido para cada próximo passo.</h3>
            <p>
              O sistema identifica lacunas e organiza prioridades a partir das
              suas respostas. A IA ajuda a compreender os resultados e
              aprofundar os temas do seu plano.
            </p>
            <ul>
              <li>Explicações conectadas à sua preparação</li>
              <li>Apoio para explorar dúvidas e revisar conceitos</li>
              <li>Contexto para compreender suas recomendações</li>
            </ul>
          </article>
          <article>
            <span className={s.smallNumber}>02 / EXPERIÊNCIA MÉDICA</span>
            <h3>Conhecimento conectado à formação.</h3>
            <p>
              A curadoria médica integra a proposta educacional: aproximar o
              estudo da experiência de quem conhece os desafios da medicina.
            </p>
            <ul>
              <li>Referências em quatro áreas médicas</li>
              <li>Perspectivas sobre formação e carreira</li>
              <li>Fontes e status de revisão por conteúdo</li>
            </ul>
          </article>
        </div>
        <p className={s.bridge}>
          A tecnologia amplia a orientação. O olhar humano dá contexto à
          jornada.
        </p>
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
          Aprender com quem conhece a prática médica amplia sua visão sobre a
          formação, as especialidades e as decisões da carreira.
        </p>
        <div className={s.mentors}>
          {mentors.map((mentor, i) => (
            <article className={s.mentor} key={mentor.id}>
              <div className={s.mentorMark} aria-hidden="true">
                <span>{mentor.initials}</span>
                <small>0{i + 1}</small>
              </div>
              <p className={s.eyebrow}>{mentor.specialty}</p>
              <h3>{mentor.displayName}</h3>
              <p>
                Mentor de referência em{' '}
                {mentor.id === 'gynecology_obstetrics'
                  ? 'Ginecologia e Obstetrícia'
                  : mentor.specialty}{' '}
                na experiência educacional da Iatron.
              </p>
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
        <div>
          <span className={s.eyebrow}>COMUNIDADE IATRON · EM PREPARAÇÃO</span>
          <h2 id="community-title">
            Você não precisa construir sua carreira médica sozinho.
          </h2>
          <p>
            A proposta da comunidade é aproximar alunos e médicos em um ambiente
            de troca de experiências e conhecimento.
          </p>
          <a
            className={s.textLink}
            href="#comunidade-detalhes"
            data-lp-event="community_cta_click"
          >
            Conhecer a comunidade Iatron <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div id="comunidade-detalhes" className={s.communityDetails}>
          <span className={s.eyebrow}>CONEXÕES QUE AMPLIAM A FORMAÇÃO</span>
          <h3>Um espaço para aprender com outras perspectivas.</h3>
          <ul>
            <li>
              <strong>Experiência médica</strong>
              <span>
                Interação conforme as regras e a disponibilidade do programa.
              </span>
            </li>
            <li>
              <strong>Troca entre alunos</strong>
              <span>
                Desafios, estratégias de preparação e experiências
                compartilhadas.
              </span>
            </li>
            <li>
              <strong>Discussões educacionais</strong>
              <span>Conhecimento e relacionamentos ao longo da formação.</span>
            </li>
          </ul>
          <p className={s.note}>
            A comunidade será organizada no WhatsApp. Acesso e condições de
            participação serão divulgados quando disponíveis.
          </p>
        </div>
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
            A Iatron propõe um espaço de orientação para tomar decisões
            profissionais com mais clareza e aprender com a experiência de quem
            já percorreu esse caminho.
          </p>
          <a
            href="#mentoria-detalhes"
            className={s.lightLink}
            data-lp-event="career_mentoring_cta_click"
          >
            Conhecer a mentoria de carreira <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div id="mentoria-detalhes" className={s.careerTopics}>
          <span className={s.eyebrow}>PERSPECTIVAS PARA SUA TRAJETÓRIA</span>
          <ol>
            <li>Escolha de especialidade</li>
            <li>Planejamento profissional</li>
            <li>Desafios do início da carreira</li>
            <li>Desenvolvimento e prática médica</li>
          </ol>
          <p>
            Oferta complementar em preparação. Agenda, formato e condições ainda
            não estão disponíveis. Conheça reflexões sobre esses temas no
            podcast abaixo.
          </p>
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
            Assistir ao Próxima Conduta <span aria-hidden="true">↗</span>
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
        <p>
          Organize seus estudos, compreenda suas necessidades de aprendizagem e
          evolua com tecnologia e experiência médica.
        </p>
        <Link
          className={s.lightButton}
          href="/cadastro"
          data-lp-event="final_cta_click"
        >
          Começar minha jornada na Iatron <span aria-hidden="true">↗</span>
        </Link>
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
