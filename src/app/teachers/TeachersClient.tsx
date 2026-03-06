"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Teacher = {
  id: number;
  name: string;
  subject: string;
  email: string | null;
  phone: string | null;
  createdAt: Date | null;
};

type Props = {
  initialTeachers: Teacher[];
};

export default function TeachersClient({ initialTeachers }: Props) {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    subject: "",
    email: "",
    phone: "",
  });

  const resetForm = () => {
    setForm({ name: "", subject: "", email: "", phone: "" });
    setEditingTeacher(null);
    setShowForm(false);
    setError("");
  };

  const openEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setForm({
      name: teacher.name,
      subject: teacher.subject,
      email: teacher.email || "",
      phone: teacher.phone || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = editingTeacher ? `/api/teachers/${editingTeacher.id}` : "/api/teachers";
      const method = editingTeacher ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save teacher");
      }

      const saved = await res.json();

      if (editingTeacher) {
        setTeachers((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      } else {
        setTeachers((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
      }

      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete teacher");
      }
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirm(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Add Teacher Button */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          {teachers.length} teacher{teachers.length !== 1 ? "s" : ""} registered
        </p>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>+</span> Add Teacher
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Mathematics"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. john@school.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. +1234567890"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? "Saving..." : editingTeacher ? "Save Changes" : "Add Teacher"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Teacher?</h2>
            <p className="text-gray-600 mb-6">
              This will also delete all attendance records for this teacher. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teachers List */}
      {teachers.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">👩‍🏫</p>
          <p className="text-gray-600 font-medium">No teachers added yet</p>
          <p className="text-gray-400 text-sm mt-1">Click &quot;Add Teacher&quot; to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">#</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">Subject</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm hidden md:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm hidden md:table-cell">Phone</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-400 text-sm">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{teacher.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{teacher.subject}</td>
                  <td className="py-3 px-4 text-gray-500 text-sm hidden md:table-cell">
                    {teacher.email || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-sm hidden md:table-cell">
                    {teacher.phone || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(teacher)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(teacher.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
