'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveOnboarding } from '../actions';

interface Edition {
  id: string;
  year: number;
  programName: string;
}
interface WizardProps {
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

export function OnboardingWizard(props: WizardProps) {
  const router = useRouter();
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
    Object.fromEntries(
      weekdays.map((_, index) => [
        index,
        props.initialAvailability.find((item) => item.weekday === index)
          ?.minutesAvailable ?? 0,
      ]),
    ),
  );
  const [targets, setTargets] = useState(props.initialTargets);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const persist = (complete = false) =>
    startTransition(async () => {
      setError('');
      const result = await saveOnboarding({
        step,
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
        router.push('/app');
        router.refresh();
      } else setStep((current) => Math.min(4, current + 1));
    });
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10">
      <p className="text-sm font-semibold text-teal-700">
        Configuração acadêmica · etapa {step} de 4
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-teal-600 transition-all"
          style={{ width: `${step * 25}%` }}
        />
      </div>
      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <div className="grid gap-4">
            <h1 className="text-2xl font-semibold">Vamos conhecer você</h1>
            <label>
              Nome
              <input
                className="mt-1 w-full rounded-xl border p-3"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                Ano da residência pretendida
                <input
                  className="mt-1 w-full rounded-xl border p-3"
                  type="number"
                  min="1"
                  max="6"
                  value={residencyYear}
                  onChange={(event) =>
                    setResidencyYear(Number(event.target.value))
                  }
                />
              </label>
              <label>
                Ano de formação
                <input
                  className="mt-1 w-full rounded-xl border p-3"
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
            <label>
              Momento profissional
              <select
                className="mt-1 w-full rounded-xl border p-3"
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
          <div className="grid gap-4">
            <h1 className="text-2xl font-semibold">Quanto tempo você tem?</h1>
            <p className="text-slate-600">
              Informe os minutos disponíveis em cada dia.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {weekdays.map((day, index) => (
                <label key={day} className="text-sm">
                  {day}
                  <input
                    aria-label={`${day} em minutos`}
                    className="mt-1 w-full rounded-xl border p-3"
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
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                Duração preferida da sessão
                <select
                  className="mt-1 w-full rounded-xl border p-3"
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
              <label>
                Preferência de avaliação
                <select
                  className="mt-1 w-full rounded-xl border p-3"
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
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-4">
            <h1 className="text-2xl font-semibold">
              Quais são suas provas-alvo?
            </h1>
            {props.editions.map((edition) => (
              <label
                key={edition.id}
                className="flex items-center gap-3 rounded-xl border p-4"
              >
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
                  {edition.programName} · {edition.year}
                </span>
              </label>
            ))}
          </div>
        )}
        {step === 4 && (
          <div className="grid gap-4">
            <h1 className="text-2xl font-semibold">Tudo pronto para começar</h1>
            <p className="text-slate-600">
              Seu plano será baseado em {targets.length} prova(s)-alvo e na
              disponibilidade semanal informada. Métricas pedagógicas só serão
              calculadas após atividades reais.
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-8 flex justify-between">
          <button
            disabled={pending || step === 1}
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            className="rounded-xl px-4 py-2 disabled:opacity-40"
          >
            Voltar
          </button>
          <button
            disabled={
              pending || !name.trim() || (step === 3 && targets.length === 0)
            }
            onClick={() => persist(step === 4)}
            className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
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
