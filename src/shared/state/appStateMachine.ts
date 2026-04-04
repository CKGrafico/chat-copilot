import { logger } from '../utils/logger';

export type AppState =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'transcribing'
  | 'replying'
  | 'done'
  | 'error';

export type AppEvent =
  | 'START_UPLOAD'
  | 'UPLOAD_COMPLETE'
  | 'PROCESSING_COMPLETE'
  | 'TRANSCRIPTION_COMPLETE'
  | 'REPLY_COMPLETE'
  | 'ERROR'
  | 'RESET';

export type AppContext = {
  audioFile: File | null;
  transcriptionText: string | null;
  errorMessage: string | null;
};

export const INITIAL_CONTEXT: AppContext = {
  audioFile: null,
  transcriptionText: null,
  errorMessage: null,
};

type Action = {
  event: AppEvent;
  payload?: Partial<AppContext>;
};

/** Valid state transitions — only these are allowed */
const TRANSITIONS: Partial<Record<AppState, Partial<Record<AppEvent, AppState>>>> = {
  idle: { START_UPLOAD: 'uploading' },
  uploading: { UPLOAD_COMPLETE: 'processing' },
  processing: { PROCESSING_COMPLETE: 'transcribing' },
  transcribing: { TRANSCRIPTION_COMPLETE: 'replying' },
  replying: { REPLY_COMPLETE: 'done' },
};

export function appStateReducer(
  state: { appState: AppState; context: AppContext },
  action: Action,
): { appState: AppState; context: AppContext } {
  const { event, payload } = action;
  const prev = state.appState;

  if (event === 'RESET') {
    logger.info('AppState', `RESET: ${prev} → idle`, payload);
    return { appState: 'idle', context: { ...INITIAL_CONTEXT } };
  }

  if (event === 'ERROR') {
    logger.error('AppState', `ERROR: ${prev} → error`, payload);
    return {
      appState: 'error',
      context: { ...state.context, ...(payload ?? {}) },
    };
  }

  const next = TRANSITIONS[prev]?.[event];
  if (!next) {
    logger.warn('AppState', `Invalid transition: ${prev} + ${event}`, null);
    return state;
  }

  logger.info('AppState', `${prev} → ${next} (${event})`);
  return {
    appState: next,
    context: { ...state.context, ...(payload ?? {}) },
  };
}
