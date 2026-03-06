import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "School Attendance System",
  description: "Track teacher attendance for your school",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-blue-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏫</span>
                <span className="font-bold text-xl tracking-tight">School Attendance</span>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  href="/attendance"
                  className="px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                >
                  Take Attendance
                </Link>
                <Link
                  href="/teachers"
                  className="px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                >
                  Teachers
                </Link>
                <Link
                  href="/reports"
                  className="px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                >
                  Reports
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
