import { useCallback, useEffect, useState } from 'react';
import ProcessingProgressBar from '../../../shared/components/ProcessingProgressBar';
import { squadService } from '../../../shared/squad/squadService';
import type { GenerateReplyOutput } from '../../../shared/squad/types';
import { useAppState } from '../../../shared/state/useAppState';
import { logger } from '../../../shared/utils/logger';
import type { Profile } from '../../profiles/profile';
import { getAllProfiles } from '../../profiles/profileStore';
import { ProfileSelector } from '../../reply/components/ProfileSelector';
import { ReplyCandidates } from '../../reply/components/ReplyCandidates';
import { isWebGPUSupported, loadLLM } from '../../reply/llmService';
import { getStoredProfileId } from '../../reply/profileStorage';
import { FileUploadZone } from '../../share/FileUploadZone';
import { sortFiles } from '../sortFiles';
import { StepIndicator } from './StepIndicator';
import './workflow.css';
// whisperService is imported dynamically inside handleFiles because @xenova/transformers
// is ~4MB — it should only be downloaded when the user actually uploads audio.
// WebLLM (~1.9GB) is loaded lazily when the user clicks "Generate Replies".

type Reply = GenerateReplyOutput['replies'][number];

type FileTranscription = {
  fileName: string;
  text: string;
};

export function WorkflowScreen() {
  const { state, context, send } = useAppState();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(getStoredProfileId);
  const [generatedReplies, setGeneratedReplies] = useState<Reply[]>([]);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyLoadingLabel, setReplyLoadingLabel] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [modelProgress, setModelProgress] = useState(0);
  const [fileTranscriptions, setFileTranscriptions] = useState<FileTranscription[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set());

  // Load profiles on mount so the selector is available before upload
  useEffect(() => {
    getAllProfiles()
      .then(loaded => {
        setProfiles(loaded);
        if (!getStoredProfileId() && loaded.length > 0) {
          setSelectedProfileId(loaded[0].id);
        }
      })
      .catch(err => logger.warn('Workflow', 'Failed to load profiles', err));
  }, []);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) ?? null;

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Sort by date/timestamp extracted from filename, then lastModified, then natural string order
    const sorted = sortFiles(files);
    logger.info('Workflow', `${sorted.length} file(s) sorted: ${sorted.map(f => f.name).join(', ')}`);

    setTotalFiles(sorted.length);
    setCurrentFileIndex(0);
    setFileTranscriptions([]);
    setGeneratedReplies([]);
    setReplyError(null);

    send('START_UPLOAD', { audioFile: sorted[0] });

    try {
      logger.info('Workflow', 'Loading Whisper model...');
      const { loadWhisperModel, transcribeAudio, decodeAudioFile } = await import('../../transcription/whisperService');
      await loadWhisperModel(p => {
        setModelProgress(p);
        logger.debug('Workflow', `Model loading: ${p}%`);
      });
      logger.info('Workflow', 'Whisper model loaded');
      send('UPLOAD_COMPLETE');
      send('PROCESSING_COMPLETE');

      const profileLanguage = selectedProfile?.language;

      // Transcribe each file sequentially using profile language hint
      const results: FileTranscription[] = [];
      for (let i = 0; i < sorted.length; i++) {
        const file = sorted[i];
        setCurrentFileIndex(i + 1);
        logger.info('Workflow', `Processing file ${i + 1}/${sorted.length}: ${file.name}`);

        const audio = await decodeAudioFile(file);
        logger.debug('Workflow', `Decoded ${file.name}: ${audio.data.length} samples @ ${audio.sampling_rate}Hz`);

        const result = await transcribeAudio(audio, profileLanguage);
        logger.info('Workflow', `File ${i + 1} transcribed: "${result.text}"`);
        results.push({ fileName: file.name, text: result.text.trim() });
        setFileTranscriptions([...results]);
      }

      const combined = results.map(r => r.text).filter(Boolean).join('\n\n');
      logger.info('Workflow', `Combined transcription: "${combined}"`);

      send('TRANSCRIPTION_COMPLETE', { transcriptionText: combined });
      send('REPLY_COMPLETE');

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('Workflow', 'Pipeline failed', err);
      send('ERROR', { errorMessage: msg });
    }
  }, [send, selectedProfile]);

  const handleGenerate = useCallback(async () => {
    if (!selectedProfileId) return;
    setReplyLoading(true);
    setReplyError(null);
    setGeneratedReplies([]);
    try {
      // Load LLM lazily on first use (downloads ~1.9GB model, then browser-cached)
      if (isWebGPUSupported()) {
        setReplyLoadingLabel('Loading AI model…');
        await loadLLM(undefined, (pct, text) => {
          setReplyLoadingLabel(text || `Loading AI… ${pct}%`);
        });
      }
      setReplyLoadingLabel('Generating replies…');
      const result = await squadService.run('generateReply', {
        transcriptionText: context.transcriptionText ?? '',
        profileInstructions: selectedProfile?.instructions ?? '',
        profileName: selectedProfile?.name,
        profileLanguage: selectedProfile?.language,
        profileReplyLength: selectedProfile?.replyLength ?? 'long',
      });
      setGeneratedReplies(result.replies);
    } catch (err) {
      logger.error('Workflow', 'Reply generation failed', err);
      setReplyError(err instanceof Error ? err.message : 'Failed to generate replies.');
    } finally {
      setReplyLoading(false);
      setReplyLoadingLabel('');
    }
  }, [context.transcriptionText, selectedProfileId, selectedProfile]);

  const toggleFile = (index: number) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const stepLabels: Partial<Record<typeof state, string>> = {
    uploading: 'Step 1 of 4: Loading AI model',
    processing: 'Step 2 of 4: Loading AI model',
    transcribing: `Step 3 of 4: Transcribing file ${currentFileIndex} of ${totalFiles}`,
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
          <p className="workflow-screen__progress-hint">
            Select a profile first — the language and tone will be used during transcription and reply generation.
          </p>
          <div className="workflow-screen__idle-profile">
            <ProfileSelector
              profiles={profiles}
              selectedId={selectedProfileId}
              onSelect={setSelectedProfileId}
            />
          </div>
          <FileUploadZone onFiles={files => { void handleFiles(files); }} acceptMultiple={true} />
        </>
      )}

      {(state === 'uploading' || state === 'processing') && (
        <div className="workflow-screen__progress-section">
          <h2 className="workflow-screen__heading">Loading AI model…</h2>
          <p className="workflow-screen__progress-hint">First load takes a moment — cached after that.</p>
          <ProcessingProgressBar value={modelProgress / 100} label="Loading Whisper model" />
        </div>
      )}

      {(state === 'transcribing' || state === 'replying') && (
        <div className="workflow-screen__progress-section">
          <h2 className="workflow-screen__heading">
            Transcribing {totalFiles > 1 ? `file ${currentFileIndex} of ${totalFiles}` : 'audio'}…
          </h2>
          <ProcessingProgressBar value={totalFiles > 1 ? (currentFileIndex - 1) / totalFiles : 0} label="Transcribing" indeterminate={totalFiles === 1} />
          {fileTranscriptions.length > 0 && (
            <div className="workflow-screen__partial-results">
              {fileTranscriptions.map((ft, i) => (
                <div key={i} className="workflow-screen__file-chip">
                  <span className="workflow-screen__file-chip-name">✓ {ft.fileName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {state === 'done' && (
        <>
          {/* Individual file transcriptions (if multiple) */}
          {fileTranscriptions.length > 1 && (
            <div className="workflow-screen__files-section">
              <h2 className="workflow-screen__heading">Individual Transcriptions</h2>
              <div className="workflow-screen__file-list">
                {fileTranscriptions.map((ft, i) => (
                  <div key={i} className="workflow-screen__file-item">
                    <button
                      className="workflow-screen__file-toggle"
                      onClick={() => toggleFile(i)}
                      aria-expanded={expandedFiles.has(i)}
                    >
                      <span className="workflow-screen__file-index">{i + 1}</span>
                      <span className="workflow-screen__file-name">{ft.fileName}</span>
                      <span className="workflow-screen__file-preview">
                        {expandedFiles.has(i) ? '' : ft.text.substring(0, 60) + (ft.text.length > 60 ? '…' : '')}
                      </span>
                      <span className="workflow-screen__file-chevron">{expandedFiles.has(i) ? '▲' : '▼'}</span>
                    </button>
                    {expandedFiles.has(i) && (
                      <div className="workflow-screen__file-text">{ft.text}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combined / full transcription */}
          <div>
            <h2 className="workflow-screen__heading">
              {fileTranscriptions.length > 1 ? 'Combined Transcription' : 'Transcription'}
            </h2>
            <div className="workflow-screen__transcription">
              <p>{context.transcriptionText}</p>
            </div>
          </div>

          {/* Profile + generate */}
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
            >
              {replyLoading ? '⟳ ' + (replyLoadingLabel || 'Generating…') : '✓ Generate Replies'}
            </button>
          </div>

          {replyLoading && replyLoadingLabel && (
            <ProcessingProgressBar indeterminate label={replyLoadingLabel} value={0} />
          )}

          {replyError && (
            <div className="workflow-screen__error-box" role="alert">
              <p className="workflow-screen__error-msg">{replyError}</p>
            </div>
          )}

          {generatedReplies.length > 0 && (
            <ReplyCandidates replies={generatedReplies} loading={replyLoading} />
          )}

          <button className="workflow-screen__retry-btn" onClick={() => send('RESET')} style={{ marginTop: '8px' }}>
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
