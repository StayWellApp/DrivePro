import React from "react";
import { createStudentAction } from "@/lib/actions/student";
import { prisma } from "@/lib/prisma";
import Shell from "../Shell";

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    where: { school_id: "default-school" },
    include: {
      user: true,
      instructor: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const instructors = await prisma.instructor.findMany({
    where: { school_id: "default-school" },
    include: { user: true },
  });

  return (
    <Shell title="Students" subtitle="Manage your driving school students.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4">Register New Student</h2>
            <form action={createStudentAction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Jan"
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
                    placeholder="Novak"
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
                  placeholder="jan@example.com"
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
                  placeholder="+420 777 666 555"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Assign Instructor
                </label>
                <select
                  name="instructorId"
                  className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Instructor (Optional)</option>
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.user.firstName} {inst.user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Course Category
                </label>
                <select
                  name="courseType"
                  className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="B">Category B (Car)</option>
                  <option value="A">Category A (Motorcycle)</option>
                  <option value="C">Category C (Truck)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
              >
                Register Student
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
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {student.user.firstName} {student.user.lastName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {student.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.instructor
                        ? `${student.instructor.user.firstName} ${student.instructor.user.lastName}`
                        : "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.courseType}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-bold">
                      {student.balance} CZK
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No students found.
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
