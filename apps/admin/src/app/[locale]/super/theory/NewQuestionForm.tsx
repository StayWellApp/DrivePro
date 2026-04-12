"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewQuestionForm({ countries }: { countries: any[] }) {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("cs");
  const [countryId, setCountryId] = useState(countries[0]?.id || "");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/super/theory", {
      method: "POST",
      body: JSON.stringify({ question, language, countryId, options, answer }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setIsOpen(false);
      setQuestion("");
      setAnswer("");
      setOptions(["", "", "", ""]);
      router.refresh();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        New Question
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Question</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border p-3 rounded-xl"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full border p-3 rounded-xl">
                <option value="cs">Czech</option>
                <option value="sk">Slovak</option>
                <option value="pl">Polish</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Country</label>
              <select value={countryId} onChange={e => setCountryId(e.target.value)} className="w-full border p-3 rounded-xl">
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold mb-2">Options</label>
            {options.map((opt, i) => (
              <input
                key={i}
                value={opt}
                onChange={e => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }}
                className="w-full border p-2 rounded-lg"
                placeholder={`Option ${i+1}`}
                required
              />
            ))}
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Correct Answer</label>
            <select value={answer} onChange={e => setAnswer(e.target.value)} className="w-full border p-3 rounded-xl" required>
              <option value="">Select correct answer</option>
              {options.filter(o => o).map((o, i) => (
                <option key={i} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-6 py-3 rounded-xl border font-bold">Cancel</button>
            <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-teal-500 text-white font-bold">Save Question</button>
          </div>
        </form>
      </div>
    </div>
  );
}
