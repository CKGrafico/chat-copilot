import React from 'react';
import styles from './ProcessingProgressBar.module.css';

export interface ProcessingProgressBarProps {
  /** Value between 0 and 1 (ignored when indeterminate) */
  value: number;
  /** Visible label for assistive tech (optional) */
  label?: string;
  /** When true, show an indeterminate/animated state */
  indeterminate?: boolean;
  /** Respect prefers-reduced-motion: if true, animations disabled */
  reduceMotion?: boolean;
}

export default function ProcessingProgressBar({
  value,
  label = 'Processing',
  indeterminate = false,
  reduceMotion,
}: ProcessingProgressBarProps) {
  // Ensure safe value between 0 and 1
  const clamped = Math.max(0, Math.min(1, Number(value) || 0));
  const percent = Math.round(clamped * 100);
  const id = React.useId();

  // Determine reduced motion preference
  const prefersReduced = typeof window !== 'undefined' && 'matchMedia' in window
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  const disableAnimation = reduceMotion ?? prefersReduced;

  return (
    <div className={styles.container}>
      <span id={`ppb-label-${id}`} className={styles.visuallyHidden} role="status" aria-live="polite">
        {label}
      </span>

      <div
        className={styles.track}
        role="progressbar"
        aria-labelledby={`ppb-label-${id}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : percent}
        aria-busy={indeterminate ? true : undefined}
      >
        <div
          className={`${styles.fill} ${indeterminate && !disableAnimation ? styles.indeterminate : ''}`}
          style={indeterminate ? undefined : { width: `${percent}%` }}
          aria-hidden="true"
        />
      </div>

      <div className={styles.meta} aria-hidden="true">
        {indeterminate ? 'Processing…' : `${percent}%`}
      </div>
    </div>
  );
}
