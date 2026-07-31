'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
          <h2>Something went wrong!</h2>
          <button
            onClick={() => reset()}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '0.25rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
