import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const teachers = sqliteTable("teachers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  email: text("email"),
  phone: text("phone"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teacherId: integer("teacher_id").notNull().references(() => teachers.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  day: text("day").notNull(), // Monday, Tuesday, etc.
  arrivalTime: text("arrival_time").notNull(), // HH:MM format
  status: text("status").notNull().default("present"), // present, absent, late
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
