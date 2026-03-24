import { getDb } from "@/db";
import { teachers } from "@/db/schema";
import TeachersClient from "./TeachersClient";

export default async function TeachersPage() {
  const db = getDb();
  const allTeachers = await db.select().from(teachers).orderBy(teachers.name);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Teachers</h1>
        <p className="text-gray-500 mt-1">Add, edit, or remove teachers from the system</p>
      </div>
      <TeachersClient initialTeachers={allTeachers} />
    </div>
  );
}
