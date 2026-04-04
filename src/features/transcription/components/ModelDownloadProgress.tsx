import ProcessingProgressBar from '../../../shared/components/ProcessingProgressBar';
import './transcription.css';

export interface ModelDownloadProgressProps {
  progress: number;
  status: string;
}

export default function ModelDownloadProgress({ progress, status }: ModelDownloadProgressProps) {
  const percent = Math.round(Math.max(0, Math.min(1, Number(progress) || 0)) * 100);
  const isIndeterminate = progress <= 0;

  return (
    <div
      className="model-download-overlay"
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Model download progress"
    >
      <div className="model-download-card">
        <div className="model-download-icon" aria-hidden="true">⬇️</div>
        <h2 className="model-download-title">Downloading transcription model</h2>
        <p className="model-download-status">{status}</p>

        <ProcessingProgressBar
          value={progress}
          label="Model download progress"
          indeterminate={isIndeterminate}
        />

        <p className="model-download-percent" aria-hidden="true">
          {isIndeterminate ? 'Starting…' : `${percent}%`}
        </p>

        <p className="model-download-notice">This is a one-time download</p>
      </div>
    </div>
  );
}
