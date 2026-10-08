import { MOCK_OUTCOME_LABELS, type MockOutcome } from "./grandstreamMockProvider";

const SCENARIOS = Object.keys(MOCK_OUTCOME_LABELS) as MockOutcome[];

interface DemoScenarioPickerProps {
  value: MockOutcome;
  onChange: (value: MockOutcome) => void;
}

/**
 * Seletor visível apenas em modo demonstração (Seção 17): permite forçar qualquer
 * cenário de autorização do GrandstreamMockProvider para validar as 5 telas do
 * portal sem depender do access point físico.
 */
export function DemoScenarioPicker({ value, onChange }: DemoScenarioPickerProps) {
  return (
    <div className="rounded-md border border-dashed border-warning/40 bg-warning/5 p-3">
      <label htmlFor="demo-scenario" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-warning">
        Cenário de demonstração
      </label>
      <select
        id="demo-scenario"
        value={value}
        onChange={(event) => onChange(event.target.value as MockOutcome)}
        className="h-9 w-full rounded-md border border-surface-border bg-surface px-2 text-sm text-text-primary"
      >
        {SCENARIOS.map((scenario) => (
          <option key={scenario} value={scenario}>
            {MOCK_OUTCOME_LABELS[scenario]}
          </option>
        ))}
      </select>
    </div>
  );
}
