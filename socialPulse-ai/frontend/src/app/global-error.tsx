'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body style={{ background: '#0f1117', color: '#e5e7eb', fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ maxWidth: 600, padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Something went wrong</h2>
          <pre style={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: 8, padding: '1rem', fontSize: 12, textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#f87171', marginBottom: '1.5rem' }}>
            {error?.message ?? 'Unknown error'}
            {error?.stack ? '\n\n' + error.stack : ''}
          </pre>
          <button
            onClick={reset}
            style={{ padding: '0.5rem 1.5rem', background: '#6172f3', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
