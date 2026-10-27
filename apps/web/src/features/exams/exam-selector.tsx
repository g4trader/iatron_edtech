'use client';
import { useState, type Dispatch, type SetStateAction } from 'react';
export interface Edition {
  id: string;
  year: number;
  edition?: string | null;
  programName: string;
  programCode?: string | null;
  stateCode?: string | null;
  city?: string | null;
  institutionName?: string;
}

export function ExamSelector({
  editions,
  targets,
  setTargets,
  optional = false,
}: {
  editions: Edition[];
  targets: string[];
  setTargets: Dispatch<SetStateAction<string[]>>;
  optional?: boolean;
}) {
  const [targetRegion, setTargetRegion] = useState(optional ? 'S' : '');
  const [targetState, setTargetState] = useState(optional ? 'RS' : '');
  const [targetSearch, setTargetSearch] = useState('');
  const normalizedTargetSearch = targetSearch.trim().toLocaleLowerCase('pt-BR');
  const visibleEditions = editions.filter((edition) => {
    if (
      targetRegion === 'S' &&
      !['RS', 'SC', 'PR'].includes(edition.stateCode ?? '')
    )
      return false;
    if (targetState && edition.stateCode !== targetState) return false;
    if (!normalizedTargetSearch) return true;
    return [
      edition.programName,
      edition.programCode,
      edition.institutionName,
      edition.city,
    ].some((value) =>
      value?.toLocaleLowerCase('pt-BR').includes(normalizedTargetSearch),
    );
  });

  return (
    <>
      <div className="target-catalog-filters">
        <label className="form-field" htmlFor="target-region">
          Região
          <select
            className="form-control"
            id="target-region"
            value={targetRegion}
            onChange={(event) => {
              setTargetRegion(event.target.value);
              if (event.target.value !== 'S') setTargetState('');
            }}
          >
            <option value="S">Sul</option>
            <option value="">Todas as regiões</option>
          </select>
        </label>
        <label className="form-field" htmlFor="target-state">
          Estado
          <select
            className="form-control"
            id="target-state"
            value={targetState}
            onChange={(event) => setTargetState(event.target.value)}
          >
            <option value="">Todos</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="SC">Santa Catarina</option>
            <option value="PR">Paraná</option>
          </select>
        </label>
      </div>
      <label className="form-field" htmlFor="target-search">
        Buscar prova, instituição ou cidade
        <input
          className="form-control"
          id="target-search"
          placeholder="Ex.: AMRIGS, HCPA ou Porto Alegre"
          type="search"
          value={targetSearch}
          onChange={(event) => setTargetSearch(event.target.value)}
        />
      </label>
      {targets.length > 0 && (
        <p aria-live="polite" className="target-selection-summary">
          {targets.length}{' '}
          {targets.length === 1 ? 'prova selecionada' : 'provas selecionadas'}
        </p>
      )}
      <fieldset className="target-options" tabIndex={-1}>
        <legend className="sr-only">Provas-alvo</legend>
        {visibleEditions.map((edition) => (
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
              <small>
                {[edition.city, edition.stateCode]
                  .filter(Boolean)
                  .join(' — ') || edition.institutionName}
              </small>
              <small>{edition.edition ?? `Edição ${edition.year}`}</small>
            </span>
          </label>
        ))}
      </fieldset>
      {visibleEditions.length === 0 && (
        <section className="target-empty-state" role="status">
          <strong>Não encontrou sua prova?</strong>
          <p>
            Tente outro termo ou remova os filtros. Se não houver provas
            disponíveis, volte mais tarde.
          </p>
        </section>
      )}
      {optional && targets.length === 0 && visibleEditions.length > 0 && (
        <p className="onboarding-help">
          Ainda não decidiu? Você pode continuar sem escolher e definir suas
          provas depois.
        </p>
      )}
    </>
  );
}
