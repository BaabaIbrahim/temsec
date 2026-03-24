import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { teachers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await request.json();
    const { name, subject, email, phone } = body;

    if (!name || !subject) {
      return NextResponse.json({ error: "Name and subject are required" }, { status: 400 });
    }

    const updated = await db
      .update(teachers)
      .set({ name, subject, email, phone })
      .where(eq(teachers.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json({ error: "Failed to update teacher" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    const deleted = await db
      .delete(teachers)
      .where(eq(teachers.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}
