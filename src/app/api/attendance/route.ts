import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendance, teachers } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const teacherId = searchParams.get("teacherId");

    let query = db
      .select({
        id: attendance.id,
        teacherId: attendance.teacherId,
        teacherName: teachers.name,
        teacherSubject: teachers.subject,
        date: attendance.date,
        day: attendance.day,
        arrivalTime: attendance.arrivalTime,
        status: attendance.status,
        createdAt: attendance.createdAt,
      })
      .from(attendance)
      .innerJoin(teachers, eq(attendance.teacherId, teachers.id));

    const conditions = [];

    if (startDate) conditions.push(gte(attendance.date, startDate));
    if (endDate) conditions.push(lte(attendance.date, endDate));
    if (teacherId) conditions.push(eq(attendance.teacherId, parseInt(teacherId)));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const records = await query.orderBy(attendance.date, attendance.arrivalTime);
    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teacherId, date, arrivalTime, status } = body;

    if (!teacherId || !date || !arrivalTime) {
      return NextResponse.json({ error: "Teacher, date, and arrival time are required" }, { status: 400 });
    }

    // Calculate day of week from date
    const dateObj = new Date(date);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = days[dateObj.getDay()];

    // Check if attendance already recorded for this teacher on this date
    const existing = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.teacherId, parseInt(teacherId)), eq(attendance.date, date)));

    if (existing.length > 0) {
      // Update existing record
      const updated = await db
        .update(attendance)
        .set({ arrivalTime, status: status || "present", day })
        .where(and(eq(attendance.teacherId, parseInt(teacherId)), eq(attendance.date, date)))
        .returning();
      return NextResponse.json(updated[0]);
    }

    const newRecord = await db
      .insert(attendance)
      .values({
        teacherId: parseInt(teacherId),
        date,
        day,
        arrivalTime,
        status: status || "present",
      })
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
