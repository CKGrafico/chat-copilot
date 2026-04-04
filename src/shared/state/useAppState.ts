import { useReducer, useCallback } from 'react';
import {
  appStateReducer,
  INITIAL_CONTEXT,
  type AppState,
  type AppContext,
  type AppEvent,
} from './appStateMachine';

/** Valid events per state for canSend checks */
const VALID_EVENTS: Partial<Record<AppState, AppEvent[]>> = {
  idle: ['START_UPLOAD', 'ERROR', 'RESET'],
  uploading: ['UPLOAD_COMPLETE', 'ERROR', 'RESET'],
  processing: ['PROCESSING_COMPLETE', 'ERROR', 'RESET'],
  transcribing: ['TRANSCRIPTION_COMPLETE', 'ERROR', 'RESET'],
  replying: ['REPLY_COMPLETE', 'ERROR', 'RESET'],
  done: ['RESET', 'ERROR'],
  error: ['RESET', 'ERROR'],
};

export function useAppState(): {
  state: AppState;
  context: AppContext;
  send: (event: AppEvent, payload?: Partial<AppContext>) => void;
  canSend: (event: AppEvent) => boolean;
} {
  const [{ appState, context }, dispatch] = useReducer(appStateReducer, {
    appState: 'idle' as AppState,
    context: { ...INITIAL_CONTEXT },
  });

  const send = useCallback((event: AppEvent, payload?: Partial<AppContext>) => {
    dispatch({ event, payload });
  }, []);

  const canSend = useCallback(
    (event: AppEvent): boolean => {
      return VALID_EVENTS[appState]?.includes(event) ?? false;
    },
    [appState],
  );

  return { state: appState, context, send, canSend };
}
