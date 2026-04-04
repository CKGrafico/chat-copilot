import { useState, useEffect } from 'react';
import { useAppState } from '../../../shared/state/useAppState';
import { FileUploadZone } from '../../share/FileUploadZone';
import { ReplyCandidates } from '../../reply/components/ReplyCandidates';
import { ProfileSelector } from '../../reply/components/ProfileSelector';
import ProcessingProgressBar from '../../../shared/components/ProcessingProgressBar';
import { StepIndicator } from './StepIndicator';
import { getAllProfiles } from '../../profiles/profileStore';
import { logger } from '../../../shared/utils/logger';
import type { Profile } from '../../../shared/types';
import './workflow.css';

export function WorkflowScreen() {
  const { state, context, send } = useAppState();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [generatedReplies, setGeneratedReplies] = useState<Array<{ id: string; text: string; length: 'short' | 'medium' | 'long'; tone: string }>>([]);

  useEffect(() => {
    logger.debug('Workflow', `Rendering state: ${state}`);
  }, [state]);

  useEffect(() => {
    if (state === 'done') {
      logger.info('Workflow', 'State is done, loading profiles...');
      getAllProfiles()
        .then((loaded) => {
          logger.info('Workflow', `Loaded ${loaded.length} profiles`);
          setProfiles(loaded);
        })
        .catch((err) => {
          logger.error('Workflow', 'Failed to load profiles', err);
        });
    }
  }, [state]);

  const handleProfileSelect = (profileId: string) => {
    logger.info('Workflow', `Profile selected: ${profileId}`);
    setSelectedProfileId(profileId);
    
    // Generate demo replies based on transcription
    const selectedProfile = profiles.find(p => p.id === profileId);
    if (selectedProfile && context.transcriptionText) {
      logger.info('Workflow', `Generating ${selectedProfile.name} replies for: "${context.transcriptionText}"`);
      
      // Demo: Generate 3 reply variants
      const replies = [
        {
          id: 'reply-1',
          text: `Thanks for reaching out! As per your message: "${context.transcriptionText.substring(0, 30)}..." I'll get back to you shortly.`,
          length: 'short' as const,
          tone: 'professional',
        },
        {
          id: 'reply-2',
          text: `I appreciate you sharing that. Based on your audio message about "${context.transcriptionText.substring(0, 25)}...", I've noted the details and will follow up within 24 hours with a comprehensive response.`,
          length: 'medium' as const,
          tone: 'friendly',
        },
        {
          id: 'reply-3',
          text: `Thank you for your message! I've reviewed your transcription: "${context.transcriptionText}". I understand the context and will address each point thoughtfully in my detailed reply coming shortly.`,
          length: 'long' as const,
          tone: 'warm',
        },
      ];
      
      setGeneratedReplies(replies);
    }
  };

  const handleFiles = (files: File[]) => {
    if (files.length === 0) {
      logger.warn('Workflow', 'No files selected');
      return;
    }
    logger.info('Workflow', `File selected: ${files[0].name} (${files[0].size} bytes)`);
    send('START_UPLOAD', { audioFile: files[0] });
    
    // Simulate upload completion
    logger.debug('Workflow', 'Starting 500ms uploading delay...');
    setTimeout(() => {
      logger.debug('Workflow', 'Sending UPLOAD_COMPLETE');
      send('UPLOAD_COMPLETE');
    }, 500);

    // Simulate processing completion
    setTimeout(() => {
      logger.debug('Workflow', 'Sending PROCESSING_COMPLETE');
      send('PROCESSING_COMPLETE');
    }, 1500);

    // Simulate transcription completion
    setTimeout(() => {
      logger.debug('Workflow', 'Sending TRANSCRIPTION_COMPLETE');
      send('TRANSCRIPTION_COMPLETE', {
        transcriptionText: 'This is a demo transcription of your audio file.',
      });
    }, 3000);

    // Simulate reply generation completion
    setTimeout(() => {
      logger.debug('Workflow', 'Sending REPLY_COMPLETE');
      send('REPLY_COMPLETE');
    }, 4500);
  };

  const stepLabels: Partial<Record<typeof state, string>> = {
    uploading: 'Step 1 of 4: Receiving file',
    processing: 'Step 2 of 4: Processing audio',
    transcribing: 'Step 3 of 4: Transcribing',
    replying: 'Step 4 of 4: Generating replies',
    done: 'Step 4 of 4: Done',
  };

  return (
    <div className="workflow-screen">
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {stepLabels[state] ?? ''}
      </div>
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
            onSelect={handleProfileSelect}
          />
          <ReplyCandidates
            replies={generatedReplies}
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
