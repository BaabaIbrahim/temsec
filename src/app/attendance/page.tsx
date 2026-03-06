import { db } from "@/db";
import { teachers, attendance } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import AttendanceClient from "./AttendanceClient";

export default async function AttendancePage() {
  const allTeachers = await db.select().from(teachers).orderBy(teachers.name);

  // Get today's attendance
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = await db
    .select()
    .from(attendance)
    .where(eq(attendance.date, today));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Take Attendance</h1>
        <p className="text-gray-500 mt-1">Record teacher arrival times and attendance status</p>
      </div>
      <AttendanceClient teachers={allTeachers} todayRecords={todayRecords} today={today} />
    </div>
  );
}
