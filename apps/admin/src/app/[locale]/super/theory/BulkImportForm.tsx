"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BulkImportForm({ countries }: { countries: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setImporting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/super/theory/bulk", {
        method: "POST",
        body: JSON.stringify({
          countryId: formData.get("countryId"),
          data: formData.get("csvData")
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
      >
        <span className="material-symbols-outlined text-sm">upload_file</span>
        Bulk Import
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Bulk Import Theory</h3>
            <p className="text-slate-500 text-sm">Format: Question;Option1,Option2,Option3;Answer</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
             <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Target Jurisdiction</label>
             <select
               name="countryId"
               required
               className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
             >
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.isoCode})</option>
                ))}
             </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">CSV Content</label>
            <textarea
              name="csvData"
              required
              rows={10}
              placeholder="What is the speed limit in cities?;50 km/h,70 km/h,90 km/h;50 km/h"
              className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-sm"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={importing}
            className="w-full bg-teal-500 text-slate-900 font-black py-4 rounded-2xl hover:bg-teal-400 transition-all disabled:opacity-50"
          >
            {importing ? "Importing questions..." : "Confirm Import"}
          </button>
        </form>
      </div>
    </div>
  );
}
