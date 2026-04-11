"use client";

export default function DashcamToast() {
  const showToast = () => {
    alert("Dashcam integration coming in Pilot Phase.");
  };

  return (
    <button
      className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
      onClick={showToast}
    >
      View Dashcam Clip
    </button>
  );
}
