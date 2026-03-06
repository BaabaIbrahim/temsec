"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Teacher = {
  id: number;
  name: string;
  subject: string;
  email: string | null;
  phone: string | null;
  createdAt: Date | null;
};

type AttendanceRecord = {
  id: number;
  teacherId: number;
  date: string;
  day: string;
  arrivalTime: string;
  status: string;
  createdAt: Date | null;
};

type Props = {
  teachers: Teacher[];
  todayRecords: AttendanceRecord[];
  today: string;
};

export default function AttendanceClient({ teachers, todayRecords, today }: Props) {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>(todayRecords);
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state for each teacher
  const [attendanceForm, setAttendanceForm] = useState<
    Record<number, { arrivalTime: string; status: string }>
  >(() => {
    const initial: Record<number, { arrivalTime: string; status: string }> = {};
    teachers.forEach((t) => {
      const existing = todayRecords.find((r) => r.teacherId === t.id);
      initial[t.id] = {
        arrivalTime: existing?.arrivalTime || "",
        status: existing?.status || "present",
      };
    });
    return initial;
  });

  // Load attendance for selected date
  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance?startDate=${selectedDate}&endDate=${selectedDate}`);
        const data = await res.json();
        setRecords(data);

        // Update form with loaded data
        const newForm: Record<number, { arrivalTime: string; status: string }> = {};
        teachers.forEach((t) => {
          const existing = data.find((r: AttendanceRecord) => r.teacherId === t.id);
          newForm[t.id] = {
            arrivalTime: existing?.arrivalTime || "",
            status: existing?.status || "present",
          };
        });
        setAttendanceForm(newForm);
      } catch {
        setError("Failed to load attendance records");
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [selectedDate, teachers]);

  const handleSave = async (teacherId: number) => {
    const form = attendanceForm[teacherId];
    if (!form.arrivalTime) {
      setError("Please enter arrival time");
      return;
    }

    setSavingId(teacherId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          date: selectedDate,
          arrivalTime: form.arrivalTime,
          status: form.status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save attendance");
      }

      const saved = await res.json();
      setRecords((prev) => {
        const existing = prev.find((r) => r.teacherId === teacherId);
        if (existing) {
          return prev.map((r) => (r.teacherId === teacherId ? saved : r));
        }
        return [...prev, saved];
      });

      setSuccess(`Attendance saved for ${teachers.find((t) => t.id === teacherId)?.name}`);
      setTimeout(() => setSuccess(""), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSavingId(null);
    }
  };

  const handleMarkAll = async (status: string) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newForm: Record<number, { arrivalTime: string; status: string }> = {};
    teachers.forEach((t) => {
      newForm[t.id] = {
        arrivalTime: status === "absent" ? "00:00" : currentTime,
        status,
      };
    });
    setAttendanceForm(newForm);
  };

  const getRecordForTeacher = (teacherId: number) => {
    return records.find((r) => r.teacherId === teacherId);
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const presentCount = records.filter((r) => r.status === "present" || r.status === "late").length;
  const absentCount = teachers.length - presentCount;

  return (
    <div>
      {/* Date Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500 text-sm font-medium">{getDayName(selectedDate)}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => handleMarkAll("present")}
            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll("absent")}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-gray-500 mt-1">Present</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{absentCount}</p>
          <p className="text-xs text-gray-500 mt-1">Absent</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          ✅ {success}
        </div>
      )}

      {/* Attendance Table */}
      {teachers.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">👩‍🏫</p>
          <p className="text-gray-600 font-medium">No teachers registered</p>
          <p className="text-gray-400 text-sm mt-1">Add teachers first to take attendance</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading && (
            <div className="p-4 text-center text-gray-500 text-sm">Loading attendance records...</div>
          )}
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">#</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Teacher</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm hidden sm:table-cell">Subject</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Arrival Time</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Status</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => {
                const record = getRecordForTeacher(teacher.id);
                const form = attendanceForm[teacher.id] || { arrivalTime: "", status: "present" };

                return (
                  <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-400 text-sm">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                          {teacher.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{teacher.name}</p>
                          {record && (
                            <p className="text-xs text-green-600">✓ Recorded</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm hidden sm:table-cell">{teacher.subject}</td>
                    <td className="py-3 px-4">
                      <input
                        type="time"
                        value={form.arrivalTime}
                        onChange={(e) =>
                          setAttendanceForm((prev) => ({
                            ...prev,
                            [teacher.id]: { ...prev[teacher.id], arrivalTime: e.target.value },
                          }))
                        }
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setAttendanceForm((prev) => ({
                            ...prev,
                            [teacher.id]: { ...prev[teacher.id], status: e.target.value },
                          }))
                        }
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="absent">Absent</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSave(teacher.id)}
                        disabled={savingId === teacher.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        {savingId === teacher.id ? "Saving..." : record ? "Update" : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
