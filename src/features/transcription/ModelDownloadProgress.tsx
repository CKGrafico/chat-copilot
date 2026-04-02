import React from 'react';
import ProcessingProgressBar from '../../shared/components/ProcessingProgressBar';
import styles from './ModelDownloadProgress.module.css';

export interface ModelDownloadProgressProps {
  percent: number; // 0-100
  message?: string;
}

export default function ModelDownloadProgress({ percent, message }: ModelDownloadProgressProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Model download">
      <div className={styles.card}>
        <h2 className={styles.title}>Downloading transcription model</h2>
        <p className={styles.message}>{message ?? 'This is a one-time download. It may take a few moments.'}</p>
        <ProcessingProgressBar value={percent / 100} label="Model download progress" />
        <div className={styles.meta} aria-hidden="true">{percent}%</div>
      </div>
    </div>
  );
}
