import React from 'react';
import styles from './TranscriptionErrorBanner.module.css';

export interface TranscriptionErrorBannerProps {
  message: string;
  onRetry: () => void;
  attempts: number;
  maxAttempts?: number;
}

export default function TranscriptionErrorBanner({ message, onRetry, attempts, maxAttempts = 3 }: TranscriptionErrorBannerProps) {
  const permanent = attempts >= maxAttempts;

  return (
    <div className={styles.banner} role="alert" aria-live="assertive">
      <div className={styles.message}>{message}</div>
      <div className={styles.controls}>
        {permanent ? (
          <div className={styles.permanent}>Please try again later.</div>
        ) : (
          <button className={styles.retry} onClick={onRetry}>
            Retry ({attempts}/{maxAttempts})
          </button>
        )}
      </div>
    </div>
  );
}
