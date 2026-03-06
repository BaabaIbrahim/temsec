import ReportsClient from "./ReportsClient";

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
        <p className="text-gray-500 mt-1">Track the best teachers by punctuality and attendance</p>
      </div>
      <ReportsClient />
    </div>
  );
}
