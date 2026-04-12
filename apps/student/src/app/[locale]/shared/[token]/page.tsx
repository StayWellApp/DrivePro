"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import IntelligenceOverview from '@/components/IntelligenceOverview';
import BrandingProvider from '@/components/BrandingProvider';

export default function SponsorDashboardPage() {
  const { token } = useParams();
  const searchParams = useSearchParams();
  const passcode = searchParams.get('passcode');

  const [studentId, setStudentId] = useState<string | null>(null);
  const [branding, setBranding] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/shared/${token}/verify?passcode=${passcode || ''}`)
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized access");
        return res.json();
      })
      .then(data => {
        setStudentId(data.studentId);
        // We need a separate endpoint or include branding in verify
        // For now let's assume branding can be fetched if studentId is known
      })
      .catch(err => setError(err.message));
  }, [token, passcode]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-error bg-error-container/10 p-4 rounded-xl font-bold">
            {error}
          </div>
          <p className="text-slate-500 text-sm">Please ask the student for a valid link or passcode.</p>
        </div>
      </div>
    );
  }

  if (!studentId) return <div className="min-h-screen flex items-center justify-center">Loading encrypted progress...</div>;

  return (
    <BrandingProvider primaryColor={branding?.primaryColor} secondaryColor={branding?.secondaryColor}>
      <div className="min-h-screen bg-[#F7F9FB] p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <header className="flex justify-between items-center">
            <div>
              {branding?.customLogoUrl ? (
                <img src={branding.customLogoUrl} alt="School Logo" className="h-12 mb-4 object-contain object-left" />
              ) : (
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sponsor Progress View</h1>
              )}
              <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px] mt-1">Read-only intelligence dashboard</p>
            </div>
            <div className="bg-teal-500/10 text-teal-600 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              Secure Signed Link
            </div>
          </header>

          <section className="bg-white rounded-[32px] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50">
            <IntelligenceOverview studentId={studentId} />
          </section>

          <footer className="text-center text-slate-400 text-xs font-medium">
            DrivePro Academy &copy; 2025 | Secure Pilot Program Prague
          </footer>
        </div>
      </div>
    </BrandingProvider>
  );
}
