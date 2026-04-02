import React from 'react';
import ProcessingProgressBar from '../shared/components/ProcessingProgressBar';

export default function ProcessingDemo() {
  const [value, setValue] = React.useState(0.25);

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h1>Processing Progress Bar — Demo</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Determinate</h2>
        <ProcessingProgressBar value={value} label="File upload progress" />
        <input
          aria-label="progress slider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          style={{ width: '100%', marginTop: 12 }}
        />
      </section>

      <section>
        <h2>Indeterminate</h2>
        <ProcessingProgressBar value={0} indeterminate label="Processing results" />
        <p style={{ marginTop: 8 }}>
          Resize the viewport to mobile width (<600px) to see larger touch targets and responsive
          sizing.
        </p>
      </section>

      <hr style={{ marginTop: 24 }} />

      <p>
        Run the dev server with <code>npm run dev</code> and open <code>/processing-demo</code> route to
        view this demo.
      </p>
    </div>
  );
}
