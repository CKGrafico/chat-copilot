import React from 'react';
import ProcessingProgressBar from '../../../shared/components/ProcessingProgressBar';
import styles from './TranscriptionProgress.module.css';

export interface TranscriptionProgressProps {
  /** Index of the chunk currently being transcribed (0-based) */
  currentChunk: number;
  /** Total number of chunks */
  totalChunks: number;
  /** Partial transcription text accumulated so far */
  partialText?: string;
}

export default function TranscriptionProgress({
  currentChunk,
  totalChunks,
  partialText = '',
}: TranscriptionProgressProps) {
  const safeTotal = Math.max(1, totalChunks);
  const safeCurrent = Math.min(currentChunk, safeTotal);
  const progress = safeCurrent / safeTotal;
  const label = `Transcribing chunk ${safeCurrent} of ${safeTotal}`;

  return (
    <section className={styles.container} aria-label="Transcription progress">
      <p className={styles.status} aria-live="polite" aria-atomic="true">
        {label}
      </p>

      <ProcessingProgressBar
        value={progress}
        label={label}
        indeterminate={safeCurrent === 0}
      />

      {partialText && (
        <div className={styles.partial} aria-live="polite" aria-label="Partial transcription">
          <p className={styles.partialLabel}>Partial result:</p>
          <p className={styles.partialText}>{partialText}</p>
        </div>
      )}
    </section>
  );
}
