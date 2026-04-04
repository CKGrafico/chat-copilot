import { useState, useCallback } from 'react';
import { useAppState } from '../../../shared/state/useAppState';
import { FileUploadZone } from '../../share/FileUploadZone';
import { ReplyCandidates } from '../../reply/components/ReplyCandidates';
import { ProfileSelector } from '../../reply/components/ProfileSelector';
import ProcessingProgressBar from '../../../shared/components/ProcessingProgressBar';
import { StepIndicator } from './StepIndicator';
import { getAllProfiles } from '../../profiles/profileStore';
import { getStoredProfileId } from '../../reply/profileStorage';
import { logger } from '../../../shared/utils/logger';
import type { Profile } from '../../profiles/profile';
import type { GenerateReplyOutput } from '../../../shared/squad/types';
import './workflow.css';

type Reply = GenerateReplyOutput['replies'][number];

export function WorkflowScreen() {
  const { state, context, send } = useAppState();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(getStoredProfileId);
  const [generatedReplies, setGeneratedReplies] = useState<Reply[]>([]);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [modelProgress, setModelProgress] = useState(0);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    logger.info('Workflow', `File selected: ${file.name} (${file.size} bytes)`);

    send('START_UPLOAD', { audioFile: file });

    try {
      // Step 1 (uploading): normalize audio → 16kHz mono WAV
      logger.debug('Workflow', 'Normalizing audio...');
      let audioBuffer: ArrayBuffer;
      try {
        const { normalizeAudio } = await import('../../transcription/audioProcessor');
        audioBuffer = await normalizeAudio(file, p => {
          logger.debug('Workflow', `Audio normalization: ${Math.round(p * 100)}%`);
        });
        logger.info('Workflow', 'Audio normalization complete');
      } catch (normErr) {
        // ffmpeg not available — fall back to raw ArrayBuffer; Whisper handles most formats
        logger.warn('Workflow', 'Audio normalization failed, falling back to raw file', normErr);
        audioBuffer = await file.arrayBuffer();
      }
      send('UPLOAD_COMPLETE');

      // Step 2 (processing): load the Whisper model
      logger.info('Workflow', 'Loading Whisper model...');
      const { loadWhisperModel, transcribeAudio } = await import('../../transcription/whisperService');
      await loadWhisperModel(p => {
        setModelProgress(p);
        logger.debug('Workflow', `Model loading: ${p}%`);
      });
      logger.info('Workflow', 'Whisper model loaded');
      send('PROCESSING_COMPLETE');

      // Step 3 (transcribing): run Whisper on the audio
      logger.info('Workflow', 'Transcribing audio...');
      const result = await transcribeAudio(audioBuffer);
      logger.info('Workflow', `Transcription complete: "${result.text}"`);

      send('TRANSCRIPTION_COMPLETE', { transcriptionText: result.text });

      // Load profiles and move to done
      const loaded = await getAllProfiles();
      setProfiles(loaded);
      if (!getStoredProfileId() && loaded.length > 0) {
        setSelectedProfileId(loaded[0].id);
      }
      send('REPLY_COMPLETE');

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('Workflow', 'Pipeline failed', err);
      send('ERROR', { errorMessage: msg });
    }
  }, [send]);

  const handleGenerate = useCallback(async () => {
    if (!context.transcriptionText || !selectedProfileId) return;
    const profile = profiles.find(p => p.id === selectedProfileId);
    setReplyLoading(true);
    setReplyError(null);
    try {
      const { squadService } = await import('../../../shared/squad/squadService');
      const result = await squadService.run('generateReply', {
        transcriptionText: context.transcriptionText,
        profileInstructions: profile?.instructions ?? '',
        profileName: profile?.name,
      });
      setGeneratedReplies(result.replies);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Failed to generate replies.');
    } finally {
      setReplyLoading(false);
    }
  }, [context.transcriptionText, selectedProfileId, profiles]);

  const stepLabels: Partial<Record<typeof state, string>> = {
    uploading: 'Step 1 of 4: Receiving file',
    processing: 'Step 2 of 4: Loading AI model',
    transcribing: 'Step 3 of 4: Transcribing',
    replying: 'Step 4 of 4: Almost done',
    done: 'Done',
  };

  return (
    <div className="workflow-screen">
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
      >
        {stepLabels[state] ?? ''}
      </div>
      <StepIndicator currentState={state} />

      {state === 'idle' && (
        <>
          <h1 className="workflow-screen__heading">Upload Audio</h1>
          <FileUploadZone onFiles={files => { void handleFiles(files); }} acceptMultiple={false} />
        </>
      )}

      {state === 'uploading' && (
        <div className="workflow-screen__progress-section">
          <h2 className="workflow-screen__heading">Preparing audio…</h2>
          <ProcessingProgressBar value={0} label="Preparing audio" indeterminate />
        </div>
      )}

      {state === 'processing' && (
        <div className="workflow-screen__progress-section">
          <h2 className="workflow-screen__heading">Loading AI model…</h2>
          <p className="workflow-screen__progress-hint">First time takes a moment — model is cached after that.</p>
          <ProcessingProgressBar value={modelProgress / 100} label="Loading Whisper model" />
        </div>
      )}

      {(state === 'transcribing' || state === 'replying') && (
        <div className="workflow-screen__progress-section">
          <h2 className="workflow-screen__heading">Transcribing audio…</h2>
          <ProcessingProgressBar value={0} label="Transcribing audio" indeterminate />
        </div>
      )}

      {state === 'done' && (
        <>
          <h2 className="workflow-screen__heading">Transcription</h2>
          {context.transcriptionText && (
            <div className="workflow-screen__transcription">
              <p>{context.transcriptionText}</p>
            </div>
          )}

          <div className="workflow-screen__reply-controls">
            <ProfileSelector
              profiles={profiles}
              selectedId={selectedProfileId}
              onSelect={setSelectedProfileId}
            />
            <button
              className="btn btn-primary"
              onClick={() => { void handleGenerate(); }}
              disabled={replyLoading || !selectedProfileId}
              aria-label="Generate reply suggestions"
            >
              {replyLoading ? '⟳ Generating...' : '✓ Generate Replies'}
            </button>
          </div>

          {replyError && (
            <div className="workflow-screen__error-box" role="alert">
              <p className="workflow-screen__error-msg">{replyError}</p>
            </div>
          )}

          <ReplyCandidates replies={generatedReplies} loading={replyLoading} />

          <button
            className="workflow-screen__retry-btn"
            onClick={() => send('RESET')}
            style={{ marginTop: '24px' }}
          >
            ↑ Upload another file
          </button>
        </>
      )}

      {state === 'error' && (
        <div className="workflow-screen__error-box" role="alert">
          <p className="workflow-screen__error-msg">
            {context.errorMessage ?? 'Something went wrong. Please try again.'}
          </p>
          <button className="workflow-screen__retry-btn" onClick={() => send('RESET')}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
