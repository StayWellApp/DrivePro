'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="cs">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
          <h2>Něco se nepovedlo!</h2>
          <button
            onClick={() => reset()}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '0.25rem', backgroundColor: '#1E40AF', color: '#ffffff', border: 'none', cursor: 'pointer' }}
          >
            Zkusit znovu
          </button>
        </div>
      </body>
    </html>
  );
}
