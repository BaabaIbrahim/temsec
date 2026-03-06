import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const deleted = await db
      .delete(attendance)
      .where(eq(attendance.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 });
  }
}
