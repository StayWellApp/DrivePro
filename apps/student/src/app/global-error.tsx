"use client";

import React from "react";

export const dynamic = "force-dynamic";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-950/50 border border-red-500/30 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-xl">
            <span className="material-symbols-outlined text-red-500 text-4xl">error</span>
          </div>
          <h1 className="text-4xl font-black mb-4 uppercase tracking-wider">System Halted</h1>
          <p className="text-zinc-400 font-medium mb-12">
            An unexpected error occurred in the student portal. Your session is active, but we couldn't render this view.
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => reset()}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
