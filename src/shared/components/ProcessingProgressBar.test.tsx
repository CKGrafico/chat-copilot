
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ProcessingProgressBar from './ProcessingProgressBar';
import { describe, it, expect } from 'vitest';

describe('ProcessingProgressBar', () => {
  it('renders aria attributes for determinate state', () => {
    render(<ProcessingProgressBar value={0.42} label="Upload" />);
    const bar = screen.getByRole('progressbar', { name: /upload/i });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
  });

  it('omits aria-valuenow in indeterminate state and marks busy', () => {
    render(<ProcessingProgressBar value={0} indeterminate label="Loading" />);
    const bar = screen.getByRole('progressbar', { name: /loading/i });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('aria-busy', 'true');
  });
});
