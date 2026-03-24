import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const allTeachers = await db.select().from(teachers).orderBy(teachers.name);
    return NextResponse.json(allTeachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { name, subject, email, phone } = body;

    if (!name || !subject) {
      return NextResponse.json({ error: "Name and subject are required" }, { status: 400 });
    }

    const newTeacher = await db.insert(teachers).values({ name, subject, email, phone }).returning();
    return NextResponse.json(newTeacher[0], { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  }
}
