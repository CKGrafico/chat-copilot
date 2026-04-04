import { describe, it, expect, vi } from 'vitest';
import { appStateReducer, INITIAL_CONTEXT } from '../appStateMachine';
import type { AppState, AppContext } from '../appStateMachine';

type ReducerState = { appState: AppState; context: AppContext };

function makeState(appState: AppState, ctx?: Partial<AppContext>): ReducerState {
  return { appState, context: { ...INITIAL_CONTEXT, ...ctx } };
}

describe('appStateMachine reducer', () => {
  // --- Valid transitions ---
  it('idle → uploading via START_UPLOAD', () => {
    const result = appStateReducer(makeState('idle'), { event: 'START_UPLOAD' });
    expect(result.appState).toBe('uploading');
  });

  it('uploading → processing via UPLOAD_COMPLETE', () => {
    const result = appStateReducer(makeState('uploading'), { event: 'UPLOAD_COMPLETE' });
    expect(result.appState).toBe('processing');
  });

  it('processing → transcribing via PROCESSING_COMPLETE', () => {
    const result = appStateReducer(makeState('processing'), { event: 'PROCESSING_COMPLETE' });
    expect(result.appState).toBe('transcribing');
  });

  it('transcribing → replying via TRANSCRIPTION_COMPLETE', () => {
    const result = appStateReducer(makeState('transcribing'), { event: 'TRANSCRIPTION_COMPLETE' });
    expect(result.appState).toBe('replying');
  });

  it('replying → done via REPLY_COMPLETE', () => {
    const result = appStateReducer(makeState('replying'), { event: 'REPLY_COMPLETE' });
    expect(result.appState).toBe('done');
  });

  // --- ERROR from any state ---
  it('idle → error via ERROR', () => {
    const result = appStateReducer(makeState('idle'), {
      event: 'ERROR',
      payload: { errorMessage: 'oops' },
    });
    expect(result.appState).toBe('error');
    expect(result.context.errorMessage).toBe('oops');
  });

  it('uploading → error via ERROR', () => {
    const result = appStateReducer(makeState('uploading'), { event: 'ERROR' });
    expect(result.appState).toBe('error');
  });

  it('done → error via ERROR', () => {
    const result = appStateReducer(makeState('done'), { event: 'ERROR' });
    expect(result.appState).toBe('error');
  });

  // --- RESET from any state ---
  it('RESET from idle returns idle', () => {
    const result = appStateReducer(makeState('idle'), { event: 'RESET' });
    expect(result.appState).toBe('idle');
  });

  it('RESET from uploading returns idle', () => {
    const result = appStateReducer(makeState('uploading'), { event: 'RESET' });
    expect(result.appState).toBe('idle');
  });

  it('RESET from error returns idle', () => {
    const result = appStateReducer(makeState('error'), { event: 'RESET' });
    expect(result.appState).toBe('idle');
  });

  it('RESET clears context', () => {
    const result = appStateReducer(
      makeState('error', { errorMessage: 'bad', audioFile: new File([], 'test.ogg') }),
      { event: 'RESET' },
    );
    expect(result.appState).toBe('idle');
    expect(result.context.errorMessage).toBeNull();
    expect(result.context.audioFile).toBeNull();
  });

  // --- Invalid transitions are silently ignored ---
  it('ignores invalid transition: idle + REPLY_COMPLETE', () => {
    const state = makeState('idle');
    const result = appStateReducer(state, { event: 'REPLY_COMPLETE' });
    expect(result.appState).toBe('idle');
    expect(result).toBe(state); // same reference — no change
  });

  it('ignores UPLOAD_COMPLETE when in idle', () => {
    const state = makeState('idle');
    const result = appStateReducer(state, { event: 'UPLOAD_COMPLETE' });
    expect(result.appState).toBe('idle');
    expect(result).toBe(state);
  });

  it('ignores TRANSCRIPTION_COMPLETE when in uploading', () => {
    const state = makeState('uploading');
    const result = appStateReducer(state, { event: 'TRANSCRIPTION_COMPLETE' });
    expect(result.appState).toBe('uploading');
    expect(result).toBe(state);
  });

  // --- Context / payload merging ---
  it('merges payload into context on valid transition', () => {
    const file = new File([], 'audio.ogg');
    const result = appStateReducer(makeState('idle'), {
      event: 'START_UPLOAD',
      payload: { audioFile: file },
    });
    expect(result.appState).toBe('uploading');
    expect(result.context.audioFile).toBe(file);
  });

  it('merges transcriptionText into context on TRANSCRIPTION_COMPLETE', () => {
    const result = appStateReducer(makeState('transcribing'), {
      event: 'TRANSCRIPTION_COMPLETE',
      payload: { transcriptionText: 'Hello world' },
    });
    expect(result.appState).toBe('replying');
    expect(result.context.transcriptionText).toBe('Hello world');
  });

  it('preserves existing context fields on partial payload merge', () => {
    const file = new File([], 'audio.ogg');
    const start = makeState('transcribing', { audioFile: file });
    const result = appStateReducer(start, {
      event: 'TRANSCRIPTION_COMPLETE',
      payload: { transcriptionText: 'hi' },
    });
    expect(result.context.audioFile).toBe(file);
    expect(result.context.transcriptionText).toBe('hi');
  });

  // --- Logging ---
  it('logs transitions via console.debug', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    appStateReducer(makeState('idle'), { event: 'START_UPLOAD' });
    expect(spy).toHaveBeenCalledWith('[AppState]', 'idle', '→', 'uploading', 'via', 'START_UPLOAD');
    spy.mockRestore();
  });

  it('logs RESET transitions', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    appStateReducer(makeState('error'), { event: 'RESET' });
    expect(spy).toHaveBeenCalledWith('[AppState]', 'error', '→', 'idle', 'via', 'RESET');
    spy.mockRestore();
  });
});
