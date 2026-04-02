import { useEffect, useState } from 'react';
import FileUploadZone from '../../FileUploadZone';
import { Link, useNavigate } from 'react-router-dom';
import { useShareData } from '../hooks/useShareData';

const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/webm',
  'audio/wav',
  'audio/x-m4a',
];

export function ShareScreen() {
  const { loading, files, text, error } = useShareData();
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !error && files.length > 0) {
      // Validate file types
      const unsupportedFiles = files.filter(
        file => !SUPPORTED_AUDIO_TYPES.includes(file.type)
      );

      if (unsupportedFiles.length > 0) {
        console.error('Unsupported file types:', unsupportedFiles.map(f => f.type));
        return;
      }

      // Log accepted files to console
      console.log('Shared files received:');
      files.forEach(file => {
        console.log(`  - ${file.name}`);
        console.log(`    Type: ${file.type}`);
        console.log(`    Size: ${(file.size / 1024).toFixed(2)} KB`);
      });

      if (text) {
        console.log('Shared text:', text);
      }

      // TODO: Route to transcription flow when implemented (M7)
      // For now, wait a moment to show the success state, then navigate home
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }, [loading, error, files, text, navigate]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner} />
        <p style={styles.text}>Loading shared content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.errorTitle}>⚠️ Error</h1>
        <p style={styles.errorText}>{error}</p>
        <Link to="/" style={styles.link}>
          ← Back to home
        </Link>
      </div>
    );
  }

  if (files.length === 0 && localFiles.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.errorTitle}>No files shared</h1>
        <p style={styles.text}>
          This page is for receiving shared audio files. Please share an audio file to this app or upload below.
        </p>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <FileUploadZone onFiles={(f) => setLocalFiles(f)} />
        </div>
        <Link to="/" style={styles.link}>
          ← Back to home
        </Link>
      </div>
    );
  }

  // Check for unsupported file types
  const unsupportedFiles = files.filter(
    file => !SUPPORTED_AUDIO_TYPES.includes(file.type)
  );

  if (unsupportedFiles.length > 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.errorTitle}>Unsupported file type</h1>
        <p style={styles.errorText}>
          The following file(s) are not supported audio formats:
        </p>
        <ul style={styles.fileList}>
          {unsupportedFiles.map((file, index) => (
            <li key={index} style={styles.fileItem}>
              <strong>{file.name}</strong>
              <br />
              <span style={styles.fileType}>{file.type || 'unknown type'}</span>
            </li>
          ))}
        </ul>
        <p style={styles.text}>Supported formats: MP3, OGG, M4A, WAV, WebM</p>
        <Link to="/" style={styles.link}>
          ← Back to home
        </Link>
      </div>
    );
  }

  // Success state - files are valid
  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      <p style={styles.text}>Processing {files.length} audio file(s)...</p>
      {text && (
        <p style={styles.textPreview}>
          <strong>Message:</strong> {text}
        </p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderTopColor: '#007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    marginTop: '1rem',
    fontSize: '1rem',
    color: '#333',
  },
  textPreview: {
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: '#666',
    maxWidth: '400px',
  },
  errorTitle: {
    fontSize: '1.5rem',
    color: '#d9534f',
    marginBottom: '1rem',
  },
  errorText: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '1rem',
    maxWidth: '400px',
  },
  link: {
    marginTop: '1.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  fileList: {
    listStyle: 'none',
    padding: 0,
    margin: '1rem 0',
    textAlign: 'left',
  },
  fileItem: {
    padding: '0.5rem',
    marginBottom: '0.5rem',
    backgroundColor: 'white',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  fileType: {
    fontSize: '0.85rem',
    color: '#999',
  },
};
