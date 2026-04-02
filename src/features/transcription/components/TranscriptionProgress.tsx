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
  // Guard against negative values and clamp to valid range
  const safeCurrent = Math.min(Math.max(0, currentChunk), safeTotal);
  const progress = safeCurrent / safeTotal;
  const label = `Transcribing chunk ${safeCurrent} of ${safeTotal}`;

  return (
    <section className={styles.container} aria-label="Transcription progress">
      {/* aria-live is omitted here — ProcessingProgressBar's internal live region handles announcements */}
      <p className={styles.status}>
        {label}
      </p>

      <ProcessingProgressBar
        value={progress}
        label={label}
        indeterminate={safeCurrent === 0}
      />

      {partialText && (
        <div className={styles.partial} aria-label="Partial transcription">
          {/* Static label kept outside the live region to avoid re-announcement on every update */}
          <p className={styles.partialLabel} aria-hidden="true">Partial result:</p>
          <p className={styles.partialText} aria-live="polite" aria-atomic="false">
            {partialText}
          </p>
        </div>
      )}
    </section>
  );
}
