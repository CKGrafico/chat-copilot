import type { AppState } from '../../../shared/state/appStateMachine';
import './workflow.css';

const STEPS: { label: string; states: AppState[] }[] = [
  { label: 'Upload', states: ['uploading'] },
  { label: 'Process', states: ['processing'] },
  { label: 'Transcribe', states: ['transcribing'] },
  { label: 'Reply', states: ['replying', 'done'] },
];

/** Maps an AppState to the active step index (0-based). */
function getStepIndex(state: AppState): number {
  const map: Partial<Record<AppState, number>> = {
    idle: -1,
    uploading: 0,
    processing: 1,
    transcribing: 2,
    replying: 3,
    done: 3,
    error: -1,
  };
  return map[state] ?? -1;
}

type Props = {
  currentState: AppState;
};

export function StepIndicator({ currentState }: Props) {
  const activeIndex = getStepIndex(currentState);

  return (
    <nav aria-label="Workflow steps">
      <ol className="step-indicator" role="list">
        {STEPS.map((step, i) => {
          const isCompleted = activeIndex > i;
          const isCurrent = activeIndex === i;

          return (
            <li key={step.label} className="step-indicator__item">
              <div className="step-indicator__dot-wrap">
                <div
                  className={[
                    'step-indicator__dot',
                    isCompleted ? 'step-indicator__dot--completed' : '',
                    isCurrent ? 'step-indicator__dot--current' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Step ${i + 1}: ${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                >
                  {isCompleted ? '✓' : i + 1}
                </div>
                <span
                  className={[
                    'step-indicator__label',
                    isCompleted ? 'step-indicator__label--completed' : '',
                    isCurrent ? 'step-indicator__label--current' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={[
                    'step-indicator__connector',
                    isCompleted ? 'step-indicator__connector--completed' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
