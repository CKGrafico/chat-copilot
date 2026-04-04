import { useState, useEffect } from 'react';
import { useAppState } from '../../../shared/state/useAppState';
import { FileUploadZone } from '../../share/FileUploadZone';
import { ReplyCandidates } from '../../reply/components/ReplyCandidates';
import { ProfileSelector } from '../../reply/components/ProfileSelector';
import ProcessingProgressBar from '../../../shared/components/ProcessingProgressBar';
import { StepIndicator } from './StepIndicator';
import { getAllProfiles } from '../../profiles/profileStore';
import type { Profile } from '../../../shared/types';
import './workflow.css';

export function WorkflowScreen() {
  const { state, context, send } = useAppState();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (state === 'done') {
      getAllProfiles().then(setProfiles).catch(() => {});
    }
  }, [state]);

  function handleFiles(files: File[]) {
    if (files.length === 0) return;
    const file = files[0];
    send('START_UPLOAD', { audioFile: file });
    // Simulate upload complete (real transcription handled in M4)
    send('UPLOAD_COMPLETE');
  }

  return (
    <div className="workflow-screen">
      <StepIndicator currentState={state} />

      {state === 'idle' && (
        <>
          <h1 className="workflow-screen__heading">Upload Audio</h1>
          <FileUploadZone onFiles={handleFiles} acceptMultiple={false} />
        </>
      )}

      {state === 'uploading' && (
        <div className="workflow-screen__progress-section">
          <h2 className="workflow-screen__heading">Receiving file…</h2>
          <ProcessingProgressBar value={0} label="Receiving file" indeterminate />
        </div>
      )}

      {state === 'processing' && (
        <div className="workflow-screen__progress-section">
          <h2 className="workflow-screen__heading">Processing audio…</h2>
          <ProcessingProgressBar value={0} label="Processing audio" indeterminate />
        </div>
      )}

      {state === 'transcribing' && (
        <div className="workflow-screen__progress-section">
          <h2 className="workflow-screen__heading">Transcribing…</h2>
          <ProcessingProgressBar value={0} label="Transcribing audio" indeterminate />
        </div>
      )}

      {state === 'replying' && (
        <>
          <h2 className="workflow-screen__heading">Generating replies…</h2>
          <ReplyCandidates replies={[]} loading={true} />
        </>
      )}

      {state === 'done' && (
        <>
          <h2 className="workflow-screen__heading">Your reply suggestions</h2>
          <ProfileSelector
            profiles={profiles}
            selectedId={selectedProfileId}
            onSelect={setSelectedProfileId}
          />
          <ReplyCandidates
            replies={[]}
            loading={false}
          />
        </>
      )}

      {state === 'error' && (
        <div className="workflow-screen__error-box" role="alert">
          <p className="workflow-screen__error-msg">
            {context.errorMessage ?? 'Something went wrong. Please try again.'}
          </p>
          <button
            className="workflow-screen__retry-btn"
            onClick={() => send('RESET')}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
