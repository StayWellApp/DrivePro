import Shell from "@/app/[locale]/Shell";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import ImpersonateButton from "./ImpersonateButton";

async function createSchool(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const countryId = formData.get("countryId") as string;

  await prisma.school.create({
    data: {
      name,
      country_id: countryId,
    },
  });

  revalidatePath("/super/schools");
}

export default async function SchoolManagement() {
  const schools = await prisma.school.findMany({
    include: { country: true, _count: { select: { students: true } } },
  });

  const countries = await prisma.country.findMany();

  return (
    <Shell
      title="School Management"
      subtitle="Manage all schools onboarded to the DrivePro platform."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">School Name</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Country</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Students</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{school.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{school.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-4 bg-slate-200 rounded-sm flex items-center justify-center text-[10px] font-bold">
                          {school.country?.isoCode}
                        </span>
                        <span className="text-sm font-medium">{school.country?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-600">
                      {school._count.students}
                    </td>
                    <td className="px-6 py-4">
                      <ImpersonateButton schoolId={school.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-slate-900 text-white p-8 rounded-3xl sticky top-24">
            <h3 className="text-xl font-bold mb-6">Register New School</h3>
            <form action={createSchool} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">School Name</label>
                <input
                  name="name"
                  required
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="e.g. Skyline Driving"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Country</label>
                <select
                  name="countryId"
                  required
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                >
                  {countries.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name} ({c.isoCode})</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-teal-500 text-slate-900 font-black py-4 rounded-xl hover:bg-teal-400 transition-colors mt-4"
              >
                Onboard School
              </button>
            </form>
          </div>
        </div>
      </div>
    </Shell>
  );
}
