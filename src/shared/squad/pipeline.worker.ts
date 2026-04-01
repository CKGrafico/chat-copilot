// Transformers.js Web Worker — AI inference pipeline skeleton.
//
// Runs in a dedicated Web Worker to keep the main thread unblocked during
// model loading and inference (Whisper can take several seconds per audio chunk).
//
// Protocol: main thread posts PipelineRequest, worker replies with PipelineResponse.
// M4 will replace the stub handler with actual @xenova/transformers pipeline calls.
//
// IMPORTANT: @xenova/transformers is dynamically imported — never statically at top-level.
// This satisfies the lazy-load architecture guardrail.

export type PipelineRequest = {
  id: string;
  task: 'transcribeAudio';
  payload: ArrayBuffer;
};

export type PipelineResponse =
  | { id: string; status: 'success'; result: unknown }
  | { id: string; status: 'error'; message: string };

// Worker message handler — receives tasks from the main thread.
self.addEventListener('message', async (event: MessageEvent<PipelineRequest>) => {
  const { id, task } = event.data;

  try {
    if (task === 'transcribeAudio') {
      // TODO M4: dynamically import @xenova/transformers and run Whisper pipeline:
      //   const { pipeline } = await import('@xenova/transformers');
      //   const model = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
      //   const result = await model(audioFloat32Array);
      //   self.postMessage({ id, status: 'success', result });
      throw new Error('pipeline.worker: transcribeAudio not implemented — see M4');
    }

    const response: PipelineResponse = {
      id,
      status: 'error',
      message: `Unknown task: ${task}`,
    };
    self.postMessage(response);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    const response: PipelineResponse = { id, status: 'error', message };
    self.postMessage(response);
  }
});
