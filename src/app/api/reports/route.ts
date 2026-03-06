import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendance, teachers } from "@/db/schema";
import { and, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week"; // week, month, year
    const referenceDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const ref = new Date(referenceDate);
    let startDate: string;
    let endDate: string;

    if (period === "week") {
      // Get Monday of the current week
      const day = ref.getDay();
      const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(ref.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      startDate = monday.toISOString().split("T")[0];
      endDate = sunday.toISOString().split("T")[0];
    } else if (period === "month") {
      startDate = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
      endDate = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}-${lastDay}`;
    } else {
      // year
      startDate = `${ref.getFullYear()}-01-01`;
      endDate = `${ref.getFullYear()}-12-31`;
    }

    // Get all teachers
    const allTeachers = await db.select().from(teachers);

    // Get attendance records for the period
    const records = await db
      .select()
      .from(attendance)
      .where(and(gte(attendance.date, startDate), lte(attendance.date, endDate)));

    // Calculate stats per teacher
    const teacherStats = allTeachers.map((teacher) => {
      const teacherRecords = records.filter((r) => r.teacherId === teacher.id);
      const presentDays = teacherRecords.filter((r) => r.status === "present" || r.status === "late").length;
      const earlyDays = teacherRecords.filter((r) => {
        if (r.status !== "present" && r.status !== "late") return false;
        const [hours, minutes] = r.arrivalTime.split(":").map(Number);
        return hours < 8 || (hours === 8 && minutes === 0); // Before or at 8:00 AM
      }).length;

      const avgArrivalMinutes =
        teacherRecords.length > 0
          ? teacherRecords.reduce((sum, r) => {
              const [hours, minutes] = r.arrivalTime.split(":").map(Number);
              return sum + hours * 60 + minutes;
            }, 0) / teacherRecords.length
          : null;

      const avgArrivalTime =
        avgArrivalMinutes !== null
          ? `${String(Math.floor(avgArrivalMinutes / 60)).padStart(2, "0")}:${String(Math.round(avgArrivalMinutes % 60)).padStart(2, "0")}`
          : "N/A";

      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherSubject: teacher.subject,
        totalDays: teacherRecords.length,
        presentDays,
        earlyDays,
        avgArrivalTime,
        avgArrivalMinutes,
        attendanceRate: teacherRecords.length > 0 ? Math.round((presentDays / teacherRecords.length) * 100) : 0,
      };
    });

    // Sort by: most present days first, then earliest average arrival
    const ranked = teacherStats
      .filter((t) => t.totalDays > 0)
      .sort((a, b) => {
        if (b.presentDays !== a.presentDays) return b.presentDays - a.presentDays;
        if (a.avgArrivalMinutes !== null && b.avgArrivalMinutes !== null) {
          return a.avgArrivalMinutes - b.avgArrivalMinutes;
        }
        return 0;
      });

    return NextResponse.json({
      period,
      startDate,
      endDate,
      rankings: ranked,
      allStats: teacherStats,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
