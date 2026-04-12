"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ProfileSwitcher() {
  const { data: session, update } = useSession();
  const [schools, setSchools] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const user = session?.user as any;
  if (user?.role !== "SUPER_ADMIN") return null;

  const fetchSchools = async () => {
    const res = await fetch("/api/super/schools");
    if (res.ok) {
      const data = await res.json();
      setSchools(data);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSchools();
    }
  }, [isOpen]);

  const handleSwitch = async (schoolId: string | null) => {
    if (schoolId) {
      await update({ impersonatedSchoolId: schoolId });
    } else {
      await update({ stopImpersonating: true });
    }
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-xs font-bold w-full"
      >
        <span className="material-symbols-outlined text-sm">switch_account</span>
        {user?.impersonatedSchoolId ? "Switching School" : "Jump to School"}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-64 bg-slate-800 border border-white/10 rounded-xl shadow-2xl mb-2 overflow-hidden z-50">
          <div className="p-3 border-b border-white/10 bg-slate-900/50">
            <p className="text-[10px] font-black uppercase text-white/50">Available Schools</p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <button
              onClick={() => handleSwitch(null)}
              className="w-full text-left px-4 py-3 text-xs hover:bg-teal-500 hover:text-slate-900 transition-colors border-b border-white/5 font-bold"
            >
              Global View (Owner)
            </button>
            {schools.map(school => (
              <button
                key={school.id}
                onClick={() => handleSwitch(school.id)}
                className={`w-full text-left px-4 py-3 text-xs hover:bg-teal-500 hover:text-slate-900 transition-colors border-b border-white/5 flex flex-col ${user?.impersonatedSchoolId === school.id ? 'bg-teal-500/20 text-teal-400' : ''}`}
              >
                <span className="font-bold">{school.name}</span>
                <span className="text-[10px] opacity-60">{school.country?.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
