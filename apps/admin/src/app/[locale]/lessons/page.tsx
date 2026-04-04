import Shell from "../Shell";

export default function LessonsListPage() {
  return (
    <Shell>
      <div className="space-y-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">Lesson Reviews</h2>
        <div className="bg-surface-container-lowest rounded-xl border border-zinc-100 p-8 shadow-sm text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">history</span>
            <p className="text-on-surface-variant font-medium">Select a lesson from the directory or schedule to view its detailed AI replay.</p>
        </div>
      </div>
    </Shell>
  );
}
