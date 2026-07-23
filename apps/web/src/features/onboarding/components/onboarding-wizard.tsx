'use client';
import { useRef, useState, useTransition } from 'react';
import { saveOnboarding } from '../actions';

interface Edition {
  id: string;
  year: number;
  programName: string;
}
interface WizardProps {
  e2eBypass?: boolean;
  initialStep: number;
  initialName: string;
  initialResidencyYear: number | null;
  initialGraduationYear: number | null;
  initialExperienceLevel:
    | 'medical_student'
    | 'recent_graduate'
    | 'practicing_physician'
    | null;
  initialSessionMinutes: number | null;
  initialAssessmentPreference: 'guided' | 'independent' | 'mixed' | null;
  initialAvailability: { weekday: number; minutesAvailable: number }[];
  initialTargets: string[];
  editions: Edition[];
}
const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const routineProfiles = [
  {
    id: 'daily',
    title: 'Estudo praticamente todos os dias',
    description: 'Tenho uma rotina relativamente constante durante a semana.',
    minutes: [45, 45, 45, 45, 45, 45, 45],
  },
  {
    id: 'weekdays',
    title: 'Consigo estudar principalmente em dias úteis',
    description: 'Durante a semana tenho mais disponibilidade.',
    minutes: [0, 60, 60, 60, 60, 60, 0],
  },
  {
    id: 'shifts',
    title: 'Minha rotina depende de plantões',
    description: 'Minha disponibilidade muda bastante.',
    minutes: [90, 0, 90, 0, 90, 0, 90],
  },
  {
    id: 'manual',
    title: 'Prefiro configurar manualmente',
    description: 'Quero informar a disponibilidade de cada dia.',
    minutes: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'unsure',
    title: 'Não tenho certeza ainda',
    description:
      'Sem problemas. Vamos começar com uma rotina equilibrada e você poderá ajustar isso depois.',
    minutes: [45, 45, 45, 45, 45, 45, 45],
  },
] as const;
type RoutineId = (typeof routineProfiles)[number]['id'];

function RoutineIcon({ id }: { id: RoutineId }) {
  const commonProps = {
    'aria-hidden': true,
    className: 'routine-option-icon',
    fill: 'none',
    viewBox: '0 0 24 24',
  } as const;

  if (id === 'daily')
    return (
      <svg {...commonProps}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
      </svg>
    );
  if (id === 'weekdays')
    return (
      <svg {...commonProps}>
        <path d="M9 6V4.75C9 3.78 9.78 3 10.75 3h2.5C14.22 3 15 3.78 15 4.75V6" />
        <rect height="14" rx="2" width="20" x="2" y="6" />
        <path d="M2 11.5c5.9 2.4 14.1 2.4 20 0M9.5 12v2h5v-2" />
      </svg>
    );
  if (id === 'shifts')
    return (
      <svg {...commonProps}>
        <path d="M7 3v3M17 3v3M4 9h16" />
        <rect height="18" rx="2" width="18" x="3" y="4" />
        <path d="M12 12v6M9 15h6" />
      </svg>
    );
  if (id === 'manual')
    return (
      <svg {...commonProps}>
        <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h7M15 18h5" />
        <circle cx="15" cy="6" r="2" />
        <circle cx="9" cy="12" r="2" />
        <circle cx="13" cy="18" r="2" />
      </svg>
    );
  return (
    <svg {...commonProps}>
      <path d="M12 3a6 6 0 0 0-3.75 10.68c.48.38.75.93.75 1.5V16h6v-.82c0-.57.27-1.12.75-1.5A6 6 0 0 0 12 3Z" />
      <path d="M9.5 19h5M10.5 22h3M12 6.5v1M7.5 8.5l.87.5M16.5 8.5l-.87.5" />
    </svg>
  );
}

function availabilityFrom(items: WizardProps['initialAvailability']) {
  return Object.fromEntries(
    weekdays.map((_, index) => [
      index,
      items.find((item) => item.weekday === index)?.minutesAvailable ?? 0,
    ]),
  ) as Record<number, number>;
}

function inferRoutine(
  availability: Record<number, number>,
  hasPersistedAvailability: boolean,
): RoutineId | null {
  if (!hasPersistedAvailability) return null;
  const match = routineProfiles.find(
    (profile) =>
      profile.id !== 'manual' &&
      profile.minutes.every((minutes, weekday) => availability[weekday] === minutes),
  );
  if (match) return match.id;
  return Object.values(availability).some((minutes) => minutes > 0)
    ? 'manual'
    : null;
}

export function OnboardingWizard(props: WizardProps) {
  const [step, setStep] = useState(
    Math.max(1, Math.min(props.initialStep || 1, 4)),
  );
  const [name, setName] = useState(props.initialName);
  const [residencyYear, setResidencyYear] = useState(
    props.initialResidencyYear ?? 1,
  );
  const [graduationYear, setGraduationYear] = useState(
    props.initialGraduationYear ?? new Date().getFullYear(),
  );
  const [experienceLevel, setExperienceLevel] = useState(
    props.initialExperienceLevel ?? 'medical_student',
  );
  const [preferredSessionMinutes, setPreferredSessionMinutes] = useState(
    props.initialSessionMinutes ?? 45,
  );
  const [assessmentPreference, setAssessmentPreference] = useState(
    props.initialAssessmentPreference ?? 'guided',
  );
  const [availability, setAvailability] = useState(() =>
    availabilityFrom(props.initialAvailability),
  );
  const [routine, setRoutine] = useState<RoutineId | null>(() =>
    inferRoutine(
      availabilityFrom(props.initialAvailability),
      props.initialAvailability.length > 0,
    ),
  );
  const [customizingAvailability, setCustomizingAvailability] = useState(
    () =>
      inferRoutine(
        availabilityFrom(props.initialAvailability),
        props.initialAvailability.length > 0,
      ) === 'manual',
  );
  const [targets, setTargets] = useState(props.initialTargets);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const targetGroupRef = useRef<HTMLFieldSetElement>(null);
  const [pending, startTransition] = useTransition();

  const validateStep = () => {
    if (step === 1 && !name.trim()) {
      setError('Informe seu nome para continuar.');
      nameRef.current?.focus();
      return false;
    }
    if (step === 3 && targets.length === 0) {
      setError('Selecione ao menos uma prova-alvo.');
      targetGroupRef.current?.focus();
      return false;
    }
    if (step === 2 && !routine) {
      setError('Escolha a rotina que mais combina com você.');
      return false;
    }
    return true;
  };

  const selectRoutine = (id: RoutineId) => {
    const profile = routineProfiles.find((item) => item.id === id);
    if (!profile) return;
    setRoutine(id);
    setAvailability(
      Object.fromEntries(
        profile.minutes.map((minutes, weekday) => [weekday, minutes]),
      ),
    );
    setCustomizingAvailability(id === 'manual');
    setError('');
  };

  const weeklyMinutes = weekdays.reduce(
    (total, _, weekday) => total + Number(availability[weekday] ?? 0),
    0,
  );
  const weeklyHours = Math.floor(weeklyMinutes / 60);
  const remainingMinutes = weeklyMinutes % 60;
  const weeklyDuration =
    weeklyHours === 0
      ? `${remainingMinutes} minutos`
      : remainingMinutes === 0
        ? `${weeklyHours} ${weeklyHours === 1 ? 'hora' : 'horas'}`
        : `${weeklyHours} ${weeklyHours === 1 ? 'hora' : 'horas'} e ${remainingMinutes} minutos`;

  const persist = (complete = false) => {
    if (!validateStep()) return;
    if (props.e2eBypass) {
      setError('');
      if (complete) window.location.assign('/app');
      else setStep((current) => Math.min(4, current + 1));
      return;
    }
    startTransition(async () => {
      setError('');
      const result = await saveOnboarding({
        step: complete ? step : Math.min(4, step + 1),
        displayName: name,
        residencyYear,
        graduationYear,
        experienceLevel,
        preferredSessionMinutes,
        assessmentPreference,
        availability: {
          items: weekdays.map((_, weekday) => ({
            weekday,
            minutesAvailable: Number(availability[weekday] ?? 0),
          })),
        },
        examEditionIds: targets,
        complete,
      });
      if (!result.ok) return setError(result.message);
      if (complete) {
        window.location.assign('/app');
      } else {
        setStep((current) => Math.min(4, current + 1));
        document.querySelector<HTMLElement>('.onboarding-title')?.focus();
      }
    });
  };

  const goBack = () => {
    setError('');
    setStep((current) => Math.max(1, current - 1));
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('.onboarding-title')?.focus(),
    );
  };

  return (
    <main className="onboarding-page">
      <header className="onboarding-progress">
        <p>Configuração acadêmica</p>
        <strong>Etapa {step} de 4</strong>
      </header>
      <div
        aria-label={`Progresso: etapa ${step} de 4`}
        aria-valuemax={4}
        aria-valuemin={1}
        aria-valuenow={step}
        className="onboarding-progress-track"
        role="progressbar"
      >
        <div
          className="onboarding-progress-value"
          style={{ width: `${step * 25}%` }}
        />
      </div>
      <section
        aria-busy={pending}
        aria-labelledby="onboarding-title"
        className="onboarding-card"
      >
        {step === 1 && (
          <div className="onboarding-step">
            <h1
              className="onboarding-title"
              id="onboarding-title"
              tabIndex={-1}
            >
              Vamos conhecer você
            </h1>
            <p className="onboarding-description">
              Estas informações personalizam sua preparação.
            </p>
            <label className="form-field" htmlFor="display-name">
              Nome completo
              <input
                ref={nameRef}
                autoComplete="name"
                className="form-control"
                id="display-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <div className="onboarding-field-grid">
              <label className="form-field" htmlFor="residency-year">
                Ano da residência pretendida
                <input
                  className="form-control"
                  id="residency-year"
                  inputMode="numeric"
                  type="number"
                  min="1"
                  max="6"
                  value={residencyYear}
                  onChange={(event) =>
                    setResidencyYear(Number(event.target.value))
                  }
                />
              </label>
              <label className="form-field" htmlFor="graduation-year">
                Ano de formação
                <input
                  className="form-control"
                  id="graduation-year"
                  inputMode="numeric"
                  type="number"
                  min="1950"
                  max="2100"
                  value={graduationYear}
                  onChange={(event) =>
                    setGraduationYear(Number(event.target.value))
                  }
                />
              </label>
            </div>
            <label className="form-field" htmlFor="experience-level">
              Momento profissional
              <select
                className="form-control"
                id="experience-level"
                value={experienceLevel}
                onChange={(event) =>
                  setExperienceLevel(
                    event.target.value as typeof experienceLevel,
                  )
                }
              >
                <option value="medical_student">Estudante de medicina</option>
                <option value="recent_graduate">Recém-formado</option>
                <option value="practicing_physician">
                  Médico em atividade
                </option>
              </select>
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="onboarding-step">
            <h1
              className="onboarding-title"
              id="onboarding-title"
              tabIndex={-1}
            >
              Sua rotina de estudos
            </h1>
            <p className="onboarding-description">
              Como é sua rotina de estudos?
            </p>
            <fieldset className="routine-options">
              <legend className="sr-only">Perfil da rotina de estudos</legend>
              {routineProfiles.map((profile) => (
                <button
                  aria-checked={routine === profile.id}
                  className="routine-option"
                  key={profile.id}
                  onClick={() => selectRoutine(profile.id)}
                  role="radio"
                  type="button"
                >
                  <RoutineIcon id={profile.id} />
                  <span>
                    <strong>{profile.title}</strong>
                    <small>{profile.description}</small>
                  </span>
                </button>
              ))}
            </fieldset>
            {routine && (
              <>
                <section
                  aria-label="Disponibilidade semanal"
                  className="availability-summary"
                >
                  <span>Disponibilidade semanal</span>
                  <strong>{weeklyMinutes} minutos</strong>
                  <small>≈ {weeklyDuration}</small>
                </section>
                <div className="availability-customize">
                  <p>Deseja ajustar algum dia?</p>
                  <button
                    aria-controls="availability-fields"
                    aria-expanded={customizingAvailability}
                    className="secondary-button"
                    onClick={() =>
                      setCustomizingAvailability((current) => !current)
                    }
                    type="button"
                  >
                    {customizingAvailability ? 'Recolher' : 'Personalizar'}
                  </button>
                </div>
              </>
            )}
            {customizingAvailability && (
              <fieldset className="availability-grid" id="availability-fields">
                <legend className="sr-only">Disponibilidade por dia</legend>
                {weekdays.map((day, index) => (
                  <label className="availability-field" key={day}>
                    <span>{day}</span>
                    <input
                      aria-label={`${day} em minutos`}
                      className="form-control"
                      inputMode="numeric"
                      type="number"
                      min="0"
                      max="1440"
                      value={availability[index]}
                      onChange={(event) =>
                        setAvailability((current) => ({
                          ...current,
                          [index]: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                ))}
              </fieldset>
            )}
            <label className="form-field" htmlFor="session-duration">
              Duração preferida da sessão
              <select
                className="form-control"
                id="session-duration"
                value={preferredSessionMinutes}
                onChange={(event) =>
                  setPreferredSessionMinutes(Number(event.target.value))
                }
              >
                {[30, 45, 60, 90].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutos
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field" htmlFor="assessment-preference">
              Preferência de avaliação
              <select
                className="form-control"
                id="assessment-preference"
                value={assessmentPreference}
                onChange={(event) =>
                  setAssessmentPreference(
                    event.target.value as typeof assessmentPreference,
                  )
                }
              >
                <option value="guided">Com orientação</option>
                <option value="independent">Sem intervenções</option>
                <option value="mixed">Mista</option>
              </select>
            </label>
            <p className="onboarding-help">
              Essas informações ajudam o Iatron a distribuir seu plano de
              estudos. Você poderá alterá-las depois.
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="onboarding-step">
            <h1
              className="onboarding-title"
              id="onboarding-title"
              tabIndex={-1}
            >
              Escolha suas provas
            </h1>
            <p className="onboarding-description">
              Você pode selecionar mais de uma opção.
            </p>
            <fieldset
              ref={targetGroupRef}
              className="target-options"
              tabIndex={-1}
            >
              <legend className="sr-only">Provas-alvo</legend>
              {props.editions.map((edition) => (
                <label className="target-option" key={edition.id}>
                  <input
                    type="checkbox"
                    checked={targets.includes(edition.id)}
                    onChange={() =>
                      setTargets((current) =>
                        current.includes(edition.id)
                          ? current.filter((id) => id !== edition.id)
                          : [...current, edition.id],
                      )
                    }
                  />
                  <span>
                    <strong>{edition.programName}</strong>
                    <small>Edição {edition.year}</small>
                  </span>
                </label>
              ))}
            </fieldset>
          </div>
        )}
        {step === 4 && (
          <div className="onboarding-step">
            <h1
              className="onboarding-title"
              id="onboarding-title"
              tabIndex={-1}
            >
              Tudo pronto
            </h1>
            <p className="onboarding-description">
              Seu plano será baseado em {targets.length} prova(s)-alvo e na
              disponibilidade semanal informada. Métricas pedagógicas só serão
              calculadas após atividades reais.
            </p>
          </div>
        )}
        {error && (
          <p aria-live="assertive" className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="onboarding-actions">
          <button
            disabled={pending || step === 1}
            onClick={goBack}
            className="secondary-button"
            type="button"
          >
            Voltar
          </button>
          <button
            disabled={pending}
            onClick={() => persist(step === 4)}
            className="primary-button"
            type="button"
          >
            {pending
              ? 'Salvando…'
              : step === 4
                ? 'Concluir'
                : 'Salvar e continuar'}
          </button>
        </div>
      </section>
    </main>
  );
}
