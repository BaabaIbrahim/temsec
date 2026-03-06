"use client";

import { useState, useEffect } from "react";

type TeacherStat = {
  teacherId: number;
  teacherName: string;
  teacherSubject: string;
  totalDays: number;
  presentDays: number;
  earlyDays: number;
  avgArrivalTime: string;
  avgArrivalMinutes: number | null;
  attendanceRate: number;
};

type ReportData = {
  period: string;
  startDate: string;
  endDate: string;
  rankings: TeacherStat[];
  allStats: TeacherStat[];
};

export default function ReportsClient() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().split("T")[0]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/reports?period=${period}&date=${referenceDate}`);
        if (!res.ok) throw new Error("Failed to fetch report");
        const data = await res.json();
        setReport(data);
      } catch {
        setError("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [period, referenceDate]);

  const getMedalEmoji = (rank: number) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `#${rank + 1}`;
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 70) return "text-yellow-600";
    return "text-red-500";
  };

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const e = new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${s} – ${e}`;
  };

  return (
    <div>
      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {p === "week" ? "This Week" : p === "month" ? "This Month" : "This Year"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-gray-600">Reference date:</label>
          <input
            type="date"
            value={referenceDate}
            onChange={(e) => setReferenceDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-500">Loading report...</div>
      )}

      {report && !loading && (
        <>
          {/* Period Info */}
          <div className="text-sm text-gray-500 mb-4">
            Showing data for:{" "}
            <span className="font-medium text-gray-700">
              {formatDateRange(report.startDate, report.endDate)}
            </span>
          </div>

          {/* Top 3 Podium */}
          {report.rankings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">🏆 Top Performers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {report.rankings.slice(0, 3).map((teacher, index) => (
                  <div
                    key={teacher.teacherId}
                    className={`rounded-xl p-5 border-2 ${
                      index === 0
                        ? "bg-yellow-50 border-yellow-300"
                        : index === 1
                        ? "bg-gray-50 border-gray-300"
                        : "bg-orange-50 border-orange-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{getMedalEmoji(index)}</div>
                    <p className="font-bold text-gray-900 text-lg">{teacher.teacherName}</p>
                    <p className="text-gray-500 text-sm mb-3">{teacher.teacherSubject}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Attendance:</span>
                        <span className={`font-bold ${getAttendanceColor(teacher.attendanceRate)}`}>
                          {teacher.attendanceRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Days Present:</span>
                        <span className="font-medium text-gray-700">{teacher.presentDays}/{teacher.totalDays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Early Arrivals:</span>
                        <span className="font-medium text-gray-700">{teacher.earlyDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Avg Arrival:</span>
                        <span className="font-medium text-gray-700">{teacher.avgArrivalTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Full Rankings</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Ranked by attendance rate, then by earliest average arrival time
              </p>
            </div>
            {report.rankings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-3xl mb-2">📊</p>
                <p>No attendance data for this period</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Rank</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Teacher</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm hidden sm:table-cell">Subject</th>
                    <th className="text-center py-3 px-4 text-gray-500 font-medium text-sm">Days</th>
                    <th className="text-center py-3 px-4 text-gray-500 font-medium text-sm hidden md:table-cell">Early</th>
                    <th className="text-center py-3 px-4 text-gray-500 font-medium text-sm hidden md:table-cell">Avg Arrival</th>
                    <th className="text-center py-3 px-4 text-gray-500 font-medium text-sm">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rankings.map((teacher, index) => (
                    <tr key={teacher.teacherId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-lg">{getMedalEmoji(index)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                            {teacher.teacherName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{teacher.teacherName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm hidden sm:table-cell">{teacher.teacherSubject}</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-700">
                        {teacher.presentDays}/{teacher.totalDays}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-700 hidden md:table-cell">
                        {teacher.earlyDays}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-700 hidden md:table-cell">
                        {teacher.avgArrivalTime}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            teacher.attendanceRate >= 90
                              ? "bg-green-100 text-green-700"
                              : teacher.attendanceRate >= 70
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {teacher.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Teachers with no records */}
          {report.allStats.filter((t) => t.totalDays === 0).length > 0 && (
            <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-600 mb-2">No records this period:</p>
              <div className="flex flex-wrap gap-2">
                {report.allStats
                  .filter((t) => t.totalDays === 0)
                  .map((t) => (
                    <span
                      key={t.teacherId}
                      className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full"
                    >
                      {t.teacherName}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
