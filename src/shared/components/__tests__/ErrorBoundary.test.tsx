// @testing-library/react is not installed — tests are skipped.
// Install @testing-library/react and @testing-library/jest-dom to enable.
import { describe, it } from 'vitest';

describe('ErrorBoundary', () => {
  it.skip('renders fallback UI with "Something went wrong" when a child throws', async () => {
    // Would need: import { render, screen } from '@testing-library/react';
    // const ThrowingComponent = () => { throw new Error('boom'); };
    // render(<ErrorBoundary><ThrowingComponent /></ErrorBoundary>);
    // expect(screen.getByRole('alert')).toBeTruthy();
    // expect(screen.getByText('Something went wrong.')).toBeTruthy();
    // expect(screen.getByRole('button', { name: /refresh/i })).toBeTruthy();
  });
});
