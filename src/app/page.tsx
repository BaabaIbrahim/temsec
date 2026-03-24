import Link from "next/link";
import { getDb } from "@/db";
import { teachers, attendance } from "@/db/schema";
import { gte, lte, and, eq } from "drizzle-orm";

export default async function HomePage() {
  const db = getDb();
  const allTeachers = await db.select().from(teachers);

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Get this week's attendance
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  const weekStart = monday.toISOString().split("T")[0];

  const todayAttendance = await db
    .select()
    .from(attendance)
    .where(eq(attendance.date, today));

  const weekAttendance = await db
    .select()
    .from(attendance)
    .where(and(gte(attendance.date, weekStart), lte(attendance.date, today)));

  const presentToday = todayAttendance.filter((r) => r.status === "present" || r.status === "late").length;
  const absentToday = allTeachers.length - presentToday;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Teachers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{allTeachers.length}</p>
            </div>
            <div className="text-4xl">👩‍🏫</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Present Today</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{presentToday}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Absent Today</p>
              <p className="text-3xl font-bold text-red-500 mt-1">{absentToday}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">This Week Records</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{weekAttendance.length}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/attendance"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 flex items-center gap-4 transition-colors shadow-sm"
        >
          <span className="text-4xl">📝</span>
          <div>
            <p className="font-bold text-lg">Take Attendance</p>
            <p className="text-blue-100 text-sm">Record today&apos;s attendance</p>
          </div>
        </Link>

        <Link
          href="/teachers"
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 flex items-center gap-4 transition-colors shadow-sm"
        >
          <span className="text-4xl">👥</span>
          <div>
            <p className="font-bold text-lg">Manage Teachers</p>
            <p className="text-green-100 text-sm">Add, edit or remove teachers</p>
          </div>
        </Link>

        <Link
          href="/reports"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 flex items-center gap-4 transition-colors shadow-sm"
        >
          <span className="text-4xl">🏆</span>
          <div>
            <p className="font-bold text-lg">View Reports</p>
            <p className="text-purple-100 text-sm">Best teacher rankings</p>
          </div>
        </Link>
      </div>

      {/* Today's Attendance Summary */}
      {todayAttendance.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Today&apos;s Attendance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Teacher</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Arrival Time</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance.map(async (record) => {
                  const teacher = allTeachers.find((t) => t.id === record.teacherId);
                  return (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-900">{teacher?.name || "Unknown"}</td>
                      <td className="py-2 px-3 text-gray-600">{record.arrivalTime}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            record.status === "present"
                              ? "bg-green-100 text-green-700"
                              : record.status === "late"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {allTeachers.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800 font-medium">No teachers added yet.</p>
          <p className="text-yellow-600 text-sm mt-1">
            <Link href="/teachers" className="underline">
              Add teachers
            </Link>{" "}
            to start tracking attendance.
          </p>
        </div>
      )}
    </div>
  );
}
