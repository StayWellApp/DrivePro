import { prisma } from "@/lib/prisma"; // Adjust this path if Jules put prisma elsewhere

export default async function Home() {
  // Test database connection
  const schools = await prisma.school.findMany();

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-4">DrivePro Admin Dashboard</h1>
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <p className="text-blue-700">
          <strong>Database Status:</strong> Connected to local PostgreSQL
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">Registered Schools ({schools.length})</h2>
        {schools.length === 0 ? (
          <p className="text-gray-500 italic">No schools found in the database yet.</p>
        ) : (
          <ul className="list-disc ml-5">
            {schools.map((school) => (
              <li key={school.id}>{school.name}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}