import React from "react";
import { createInstructorAction } from "@/lib/actions/instructor";
import { prisma } from "@/lib/prisma";
import Shell from "../Shell";

export default async function InstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    where: { school_id: "default-school" },
    include: {
      user: true,
      students: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Shell
      title="Instructors"
      subtitle="Manage your driving school instructors."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4">Add New Instructor</h2>
            <form action={createInstructorAction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Eva"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Kovacova"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="eva@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Phone Number
                </label>
                <input
                  name="phoneNumber"
                  type="text"
                  className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="+420 777 000 111"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
              >
                Add Instructor
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-bottom border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {instructors.map((inst) => (
                  <tr
                    key={inst.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {inst.user.firstName} {inst.user.lastName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {inst.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {inst.user.phoneNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {inst.students.length}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(inst.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {instructors.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No instructors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}
