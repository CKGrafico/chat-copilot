import { useState, useRef } from 'react';
import './reply.css';

type Reply = {
  id: string;
  text: string;
  length: 'short' | 'medium' | 'long';
  tone: string;
};

type Props = {
  replies: Reply[];
  loading?: boolean;
};

const LENGTH_LABELS: Record<Reply['length'], string> = {
  short: 'Short',
  medium: 'Medium',
  long: 'Long',
};

function SkeletonCard() {
  return (
    <div className="reply-skeleton-card" aria-hidden="true">
      <div className="reply-skeleton-line reply-skeleton-line--short" />
      <div className="reply-skeleton-line reply-skeleton-line--long" />
      <div className="reply-skeleton-line reply-skeleton-line--full" />
      <div className="reply-skeleton-line reply-skeleton-line--medium" />
    </div>
  );
}

type CopyState = 'idle' | 'copied' | 'fallback';

function ReplyCard({ reply }: { reply: Reply }) {
  const [expanded, setExpanded] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const textRef = useRef<HTMLParagraphElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(reply.text);
        setCopyState('copied');
        timerRef.current = setTimeout(() => setCopyState('idle'), 2000);
      } catch {
        // writeText available but failed (e.g. permission denied) — fall back to selection
        if (textRef.current) {
          const range = document.createRange();
          range.selectNodeContents(textRef.current);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
        setCopyState('fallback');
        timerRef.current = setTimeout(() => setCopyState('idle'), 3000);
      }
    } else {
      // Clipboard API unavailable — select text and prompt manual copy
      if (textRef.current) {
        const range = document.createRange();
        range.selectNodeContents(textRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setCopyState('fallback');
      timerRef.current = setTimeout(() => setCopyState('idle'), 3000);
    }
  };

  const copyLabel = `Copy ${LENGTH_LABELS[reply.length].toLowerCase()} reply`;

  return (
    <div className="reply-card">
      <div className="reply-card__header">
        <span className="reply-card__length-label">{LENGTH_LABELS[reply.length]}</span>
        <span className="reply-card__tone-badge">{reply.tone}</span>
      </div>

      <p
        ref={textRef}
        className={`reply-card__text${expanded ? '' : ' reply-card__text--clamped'}`}
      >
        {reply.text}
      </p>

      <div className="reply-card__actions">
        <button
          className="reply-card__toggle"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>

        <button
          className="reply-card__copy-btn"
          onClick={handleCopy}
          aria-label={copyLabel}
        >
          {copyState === 'idle' && '📋 Copy'}
          {copyState === 'copied' && '✓ Copied!'}
          {copyState === 'fallback' && '📋 Copy'}
        </button>
      </div>

      {copyState === 'copied' && (
        <p className="reply-card__copy-confirm" role="status" aria-live="polite">
          Copied! ✓
        </p>
      )}
      {copyState === 'fallback' && (
        <p className="reply-card__copy-fallback" role="status" aria-live="polite">
          Press Ctrl+C to copy
        </p>
      )}
    </div>
  );
}

export function ReplyCandidates({ replies, loading = false }: Props) {
  if (loading) {
    return (
      <div className="reply-candidates" aria-busy="true" aria-label="Loading reply suggestions">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="reply-candidates">
      {replies.map(reply => (
        <ReplyCard key={reply.id} reply={reply} />
      ))}
    </div>
  );
}
