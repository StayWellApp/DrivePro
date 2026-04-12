"use client";

import React from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/10">
          <span className="material-symbols-outlined text-red-500 text-4xl">error</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase">System Halted</h1>
        <p className="text-slate-500 font-medium mb-12">An unexpected application error occurred. The session has been maintained, but the current view cannot be rendered.</p>

        <div className="grid grid-cols-2 gap-4">
           <button
             onClick={() => reset()}
             className="bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all"
           >
             Retry View
           </button>
           <Link
             href="/api/auth/force-signout"
             className="bg-white border border-slate-200 text-red-500 font-black py-4 rounded-2xl hover:bg-red-50 transition-all"
           >
             Force Logout
           </Link>
        </div>
      </div>
    </div>
  );
}
