import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import ImpersonateButton from "./ImpersonateButton";
import bcrypt from "bcryptjs";

async function createSchool(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const countryId = formData.get("countryId") as string;
  const adminEmail = formData.get("adminEmail") as string;

  const school = await prisma.school.create({
    data: {
      name,
      country_id: countryId,
    },
  });

  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      school_id: school.id,
    }
  });

  revalidatePath("/super/schools");
}

export default async function SchoolManagement() {
  const schools = await prisma.school.findMany({
    include: { country: true, _count: { select: { students: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const countries = await prisma.country.findMany();

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">School Management</h1>
        <p className="text-slate-500 font-medium">Onboard and manage schools on the DrivePro platform.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">School Details</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Region</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Capacity</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-900 text-lg">{school.name}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{school.id}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-5 bg-slate-100 rounded flex items-center justify-center text-[10px] font-black">
                          {school.country?.isoCode}
                        </span>
                        <span className="text-sm font-bold text-slate-600">{school.country?.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900">
                      {school._count.students} <span className="text-slate-400 font-bold ml-1 text-xs">Students</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <ImpersonateButton schoolId={school.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-slate-900 text-white p-10 rounded-[40px] sticky top-24 shadow-2xl">
            <h3 className="text-2xl font-black mb-8">Onboard School</h3>
            <form action={createSchool} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-3">Organization Name</label>
                <input
                  name="name"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold"
                  placeholder="e.g. Skyline Driving Academy"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-3">Admin Email</label>
                <input
                  name="adminEmail"
                  type="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold"
                  placeholder="admin@school.com"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-3">Country Jurisdiction</label>
                <select
                  name="countryId"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-bold appearance-none cursor-pointer"
                >
                  {countries.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name} ({c.isoCode})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                 <button
                   type="submit"
                   className="w-full bg-teal-500 text-slate-900 font-black py-5 rounded-2xl hover:bg-teal-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-teal-500/20"
                 >
                   Authorize & Create
                 </button>
                 <p className="text-[10px] text-white/40 text-center mt-6 font-bold uppercase tracking-widest">Initial password will be set to: password123</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
