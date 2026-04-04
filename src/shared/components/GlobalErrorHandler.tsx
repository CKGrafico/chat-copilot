import { useEffect } from 'react';

export function GlobalErrorHandler(): null {
  useEffect(() => {
    function handleUnhandledRejection(event: PromiseRejectionEvent): void {
      console.error('[GlobalErrorHandler] Unhandled promise rejection:', event.reason);
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
