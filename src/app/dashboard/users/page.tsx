"use client";
import { useEffect, useState } from "react";
import { FiUsers, FiShield, FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState<null | 'add' | { user: User }> (null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; password: string; role: string }>({ name: '', email: '', password: '', role: 'visitor' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Modal open helpers
  const openAddModal = () => {
    setForm({ name: '', email: '', password: '', role: 'visitor' });
    setModalOpen('add');
  };
  const openEditModal = (user: User) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setModalOpen({ user });
  };

  // Add or edit user
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    try {
      let res, data;
      if (modalOpen === 'add') {
        res = await fetch('/api/dashboard/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        data = await res.json();
      } else if (modalOpen && typeof modalOpen === 'object') {
        res = await fetch('/api/dashboard/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, _id: modalOpen.user._id }),
        });
        data = await res.json();
      }
      if (res?.ok) {
        setModalOpen(null);
        fetchUsers();
      } else {
        setError(data?.error || 'Failed to save user');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to save user');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!deleteUserId) return;
    setFormLoading(true);
    setError("");
    try {
      const res = await fetch('/api/dashboard/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: deleteUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteUserId(null);
        fetchUsers();
      } else {
        setError(data?.error || 'Failed to delete user');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to delete user');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-2">
        <FiUsers className="text-green-500" /> User Management
      </h1>
      <div className="flex items-center mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
          onClick={openAddModal}
        >
          <FiPlus /> Add User
        </button>
      </div>
      {loading && <div className="text-green-600">Loading users...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user._id} className="bg-white rounded-xl shadow p-4 border border-green-100 flex flex-col gap-2 relative">
            <div className="flex items-center gap-2 mb-1">
              <FiShield className={user.role === 'admin' ? 'text-green-500' : 'text-gray-400'} />
              <span className="font-bold text-green-700">{user.name}</span>
            </div>
            <div className="text-xs text-gray-500 mb-1">{user.email}</div>
            <div className="text-xs font-semibold capitalize text-gray-600">Role: {user.role}</div>
            <div className="text-xs text-gray-400">Created: {new Date(user.createdAt).toLocaleString()}</div>
            <div className="flex gap-2 mt-2">
              <button
                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                onClick={() => openEditModal(user)}
              >
                <FiEdit2 /> Edit
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                onClick={() => setDeleteUserId(user._id)}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setModalOpen(null)}
              aria-label="Close"
            >
              <FiX size={22} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-green-700">{modalOpen === 'add' ? 'Add User' : 'Edit User'}</h2>
            <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
              <input
                className="border rounded px-3 py-2"
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
              <input
                className="border rounded px-3 py-2"
                placeholder={modalOpen === 'add' ? "Password" : "New Password (leave blank to keep)"}
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                minLength={modalOpen === 'add' ? 6 : 0}
                required={modalOpen === 'add'}
              />
              <select
                className="border rounded px-3 py-2"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                required
              >
                <option value="admin">Admin</option>
                <option value="visitor">Visitor</option>
              </select>
              <button
                type="submit"
                className="bg-green-600 text-white font-semibold rounded px-4 py-2 mt-2 hover:bg-green-700 transition"
                disabled={formLoading}
              >
                {formLoading ? (modalOpen === 'add' ? 'Adding...' : 'Saving...') : (modalOpen === 'add' ? 'Add User' : 'Save Changes')}
              </button>
              {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setDeleteUserId(null)}
              aria-label="Close"
            >
              <FiX size={22} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-red-700">Delete User</h2>
            <p className="mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                className="bg-red-600 text-white font-semibold rounded px-4 py-2 hover:bg-red-700 transition"
                onClick={handleDelete}
                disabled={formLoading}
              >
                {formLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                className="bg-gray-200 text-gray-700 rounded px-4 py-2 hover:bg-gray-300 transition"
                onClick={() => setDeleteUserId(null)}
              >
                Cancel
              </button>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
