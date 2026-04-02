import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TranscriptionProgress from './TranscriptionProgress';

describe('TranscriptionProgress', () => {
  it('renders chunk status label', () => {
    render(<TranscriptionProgress currentChunk={3} totalChunks={8} />);
    expect(screen.getByText('Transcribing chunk 3 of 8')).toBeDefined();
  });

  it('renders partial text when provided', () => {
    render(
      <TranscriptionProgress currentChunk={2} totalChunks={5} partialText="Hello world" />,
    );
    expect(screen.getByText('Hello world')).toBeDefined();
  });

  it('does not render partial text section when empty', () => {
    const { container } = render(
      <TranscriptionProgress currentChunk={1} totalChunks={4} />,
    );
    expect(container.querySelector('[aria-label="Partial transcription"]')).toBeNull();
  });

  it('clamps currentChunk to totalChunks', () => {
    render(<TranscriptionProgress currentChunk={99} totalChunks={5} />);
    expect(screen.getByText('Transcribing chunk 5 of 5')).toBeDefined();
  });

  it('uses indeterminate bar when currentChunk is 0', () => {
    render(<TranscriptionProgress currentChunk={0} totalChunks={8} />);
    // progress bar role exists
    expect(screen.getByRole('progressbar')).toBeDefined();
  });

  it('has accessible section label', () => {
    render(<TranscriptionProgress currentChunk={1} totalChunks={3} />);
    expect(screen.getByRole('region', { name: 'Transcription progress' })).toBeDefined();
  });
});
