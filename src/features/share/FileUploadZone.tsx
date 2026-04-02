import React, { useRef, useState } from 'react';
import { validateAudio } from '../../shared/utils/validateAudio';

type FileUploadZoneProps = {
  onFiles?: (files: File[]) => void;
  acceptMultiple?: boolean;
  maxSizeBytes?: number;
};

export function FileUploadZone({ onFiles, acceptMultiple = true, maxSizeBytes }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleFilesList(list: FileList | null) {
    if (!list) return;
    setError(null);
    const files = Array.from(list);
    const validated: File[] = [];

    for (const f of files) {
      const res = validateAudio(f, { maxSizeBytes });
      if (!res.valid) {
        setError(res.error ?? 'Invalid file');
        // Do not include invalid files
      } else {
        validated.push(f);
      }
    }

    if (validated.length > 0) {
      onFiles?.(validated);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFilesList(e.dataTransfer.files);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFilesList(e.target.files);
    // clear value to allow selecting same file again
    e.target.value = '';
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFilePicker();
        }
      }}
      tabIndex={0}
      style={{
        border: dragOver ? '2px dashed #007bff' : '2px dashed #ddd',
        borderRadius: 8,
        padding: '1.5rem',
        textAlign: 'center',
        background: dragOver ? '#f0f8ff' : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'center',
        outline: 'none',
      }}
      aria-label="File upload zone. Press Enter or Space to open file picker"
      role="button"
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.opus,.ogg,.m4a"
        multiple={acceptMultiple}
        onChange={onInputChange}
        style={{ display: 'none' }}
        aria-hidden
      />
      <div style={{ fontSize: '1rem', color: '#333' }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Drop audio here</p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>or</p>
      </div>
      <button
        onClick={openFilePicker}
        style={{
          padding: '0.6rem 1rem',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: '1rem',
        }}
        aria-label="Browse files"
      >
        Browse files
      </button>
      <div style={{ fontSize: '0.85rem', color: '#666' }}>Supported: .opus, .ogg, .m4a (max 50MB)</div>
      {error && (
        <div style={{ color: '#d9534f', marginTop: '0.5rem' }} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export default FileUploadZone;
