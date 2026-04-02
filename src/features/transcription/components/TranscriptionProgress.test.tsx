import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TranscriptionProgress from './TranscriptionProgress';

describe('TranscriptionProgress', () => {
  it('renders chunk status label', () => {
    render(<TranscriptionProgress currentChunk={3} totalChunks={8} />);
    expect(screen.getByText('Transcribing chunk 3 of 8')).toBeInTheDocument();
  });

  it('renders partial text when provided', () => {
    render(
      <TranscriptionProgress currentChunk={2} totalChunks={5} partialText="Hello world" />,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('does not render partial text section when empty', () => {
    const { container } = render(
      <TranscriptionProgress currentChunk={1} totalChunks={4} />,
    );
    expect(container.querySelector('[aria-label="Partial transcription"]')).toBeNull();
  });

  it('clamps currentChunk to totalChunks', () => {
    render(<TranscriptionProgress currentChunk={99} totalChunks={5} />);
    expect(screen.getByText('Transcribing chunk 5 of 5')).toBeInTheDocument();
  });

  it('clamps negative currentChunk to 0', () => {
    render(<TranscriptionProgress currentChunk={-3} totalChunks={5} />);
    expect(screen.getByText('Transcribing chunk 0 of 5')).toBeInTheDocument();
  });

  it('handles totalChunks=0 gracefully (treats as 1)', () => {
    render(<TranscriptionProgress currentChunk={0} totalChunks={0} />);
    expect(screen.getByText('Transcribing chunk 0 of 1')).toBeInTheDocument();
  });

  it('uses indeterminate bar when currentChunk is 0', () => {
    render(<TranscriptionProgress currentChunk={0} totalChunks={8} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has accessible section label', () => {
    render(<TranscriptionProgress currentChunk={1} totalChunks={3} />);
    expect(screen.getByRole('region', { name: 'Transcription progress' })).toBeInTheDocument();
  });

  it('partial text live region does not include static label', () => {
    render(
      <TranscriptionProgress currentChunk={1} totalChunks={3} partialText="Some text" />,
    );
    const liveRegion = screen.getByText('Some text');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });
});
