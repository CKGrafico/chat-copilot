import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'sans-serif',
            gap: '1rem',
          }}
        >
          <p>Something went wrong.</p>
          <button
            autoFocus
            onClick={() => window.location.reload()}
            style={{ minHeight: '44px', minWidth: '44px', padding: '8px 20px', fontSize: '16px', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
