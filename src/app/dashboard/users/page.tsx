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

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState<null | 'add' | { user: User }> (null);
  const [roleModalOpen, setRoleModalOpen] = useState<null | 'add' | { role: Role }> (null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; password: string; role: string }>({ name: '', email: '', password: '', role: '' });
  const [roleForm, setRoleForm] = useState<{ name: string; description: string; permissions: string }>({ name: '', description: '', permissions: '' });
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

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/dashboard/roles");
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  useEffect(() => { 
    fetchUsers(); 
    fetchRoles();
  }, []);

  // Modal open helpers
  const openAddModal = () => {
    setForm({ name: '', email: '', password: '', role: roles.length > 0 ? roles[0].name : '' });
    setModalOpen('add');
  };
  const openEditModal = (user: User) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setModalOpen({ user });
  };
  const openAddRoleModal = () => {
    setRoleForm({ name: '', description: '', permissions: '' });
    setRoleModalOpen('add');
  };
  const openEditRoleModal = (role: Role) => {
    setRoleForm({ name: role.name, description: role.description, permissions: role.permissions.join(', ') });
    setRoleModalOpen({ role });
  };

  // Add or edit user
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    try {
      let res, data;
      const submitData = modalOpen === 'add' ? form : { name: form.name, email: form.email, role: form.role };
      if (modalOpen === 'add') {
        res = await fetch('/api/dashboard/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });
        data = await res.json();
      } else if (modalOpen && typeof modalOpen === 'object') {
        res = await fetch('/api/dashboard/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...submitData, _id: modalOpen.user._id }),
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

  // Add or edit role
  const handleRoleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    try {
      let res, data;
      const permissions = roleForm.permissions.split(',').map(p => p.trim()).filter(p => p);
      if (roleModalOpen === 'add') {
        res = await fetch('/api/dashboard/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...roleForm, permissions }),
        });
        data = await res.json();
      } else if (roleModalOpen && typeof roleModalOpen === 'object') {
        res = await fetch('/api/dashboard/roles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...roleForm, permissions, _id: roleModalOpen.role._id }),
        });
        data = await res.json();
      }
      if (res?.ok) {
        setRoleModalOpen(null);
        fetchRoles();
      } else {
        setError(data?.error || 'Failed to save role');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to save role');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete role
  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;
    setFormLoading(true);
    setError("");
    try {
      const res = await fetch('/api/dashboard/roles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: deleteRoleId }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteRoleId(null);
        fetchRoles();
      } else {
        setError(data?.error || 'Failed to delete role');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to delete role');
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

      {/* Roles Section */}
      <h2 className="text-xl font-bold mt-8 mb-4 text-green-700 flex items-center gap-2">
        <FiShield className="text-green-500" /> Role Management
      </h2>
      <div className="flex items-center mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={openAddRoleModal}
        >
          <FiPlus /> Add Role
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role._id} className="bg-white rounded-xl shadow p-4 border border-blue-100 flex flex-col gap-2 relative">
            <div className="flex items-center gap-2 mb-1">
              <FiShield className="text-blue-500" />
              <span className="font-bold text-blue-700">{role.name}</span>
            </div>
            <div className="text-xs text-gray-500 mb-1">{role.description}</div>
            <div className="text-xs font-semibold text-gray-600">Permissions: {role.permissions.join(', ') || 'None'}</div>
            <div className="text-xs text-gray-400">Created: {new Date(role.createdAt).toLocaleString()}</div>
            <div className="flex gap-2 mt-2">
              <button
                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                onClick={() => openEditRoleModal(role)}
              >
                <FiEdit2 /> Edit
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                onClick={() => setDeleteRoleId(role._id)}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-200 animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              onClick={() => setModalOpen(null)}
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <FiUsers className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{modalOpen === 'add' ? 'Add New User' : 'Edit User'}</h2>
                <p className="text-gray-600 text-sm mt-1">{modalOpen === 'add' ? 'Create a new user account' : 'Update user information'}</p>
              </div>
            </div>
            <form className="flex flex-col gap-6" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  placeholder="Enter email address"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              {modalOpen === 'add' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                    placeholder="Enter password"
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    minLength={6}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none bg-white"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  required
                >
                  {roles.map(role => (
                    <option key={role._id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold rounded-xl px-6 py-3 hover:bg-gray-200 transition-colors"
                  onClick={() => setModalOpen(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white font-semibold rounded-xl px-6 py-3 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formLoading}
                >
                  {formLoading ? (modalOpen === 'add' ? 'Creating...' : 'Saving...') : (modalOpen === 'add' ? 'Create User' : 'Save Changes')}
                </button>
              </div>
              {error && <div className="text-red-600 text-sm mt-3 p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative border border-gray-200 animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              onClick={() => setDeleteUserId(null)}
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-xl">
                <FiTrash2 className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
            </div>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-100 text-gray-700 font-semibold rounded-xl px-6 py-3 hover:bg-gray-200 transition-colors"
                onClick={() => setDeleteUserId(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-600 text-white font-semibold rounded-xl px-6 py-3 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDelete}
                disabled={formLoading}
              >
                {formLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
            {error && <div className="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
          </div>
        </div>
      )}

      {/* Role Add/Edit Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-200 animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              onClick={() => setRoleModalOpen(null)}
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiShield className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{roleModalOpen === 'add' ? 'Add New Role' : 'Edit Role'}</h2>
                <p className="text-gray-600 text-sm mt-1">{roleModalOpen === 'add' ? 'Create a new role with specific permissions' : 'Update role details and permissions'}</p>
              </div>
            </div>
            <form className="flex flex-col gap-6" onSubmit={handleRoleFormSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="e.g., Manager, Technician, Admin"
                  value={roleForm.name}
                  onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="Brief description of this role's purpose"
                  value={roleForm.description}
                  onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Permissions</label>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="e.g., read,write,manage_users (comma-separated)"
                  value={roleForm.permissions}
                  onChange={e => setRoleForm(f => ({ ...f, permissions: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-2">Separate permissions with commas. Leave empty for no special permissions.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold rounded-xl px-6 py-3 hover:bg-gray-200 transition-colors"
                  onClick={() => setRoleModalOpen(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-semibold rounded-xl px-6 py-3 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formLoading}
                >
                  {formLoading ? (roleModalOpen === 'add' ? 'Creating...' : 'Saving...') : (roleModalOpen === 'add' ? 'Create Role' : 'Save Changes')}
                </button>
              </div>
              {error && <div className="text-red-600 text-sm mt-3 p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Delete role confirmation */}
      {deleteRoleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative border border-gray-200 animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              onClick={() => setDeleteRoleId(null)}
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-xl">
                <FiTrash2 className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Role</h2>
            </div>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this role? Users with this role may be affected.</p>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-100 text-gray-700 font-semibold rounded-xl px-6 py-3 hover:bg-gray-200 transition-colors"
                onClick={() => setDeleteRoleId(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-600 text-white font-semibold rounded-xl px-6 py-3 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDeleteRole}
                disabled={formLoading}
              >
                {formLoading ? 'Deleting...' : 'Delete Role'}
              </button>
            </div>
            {error && <div className="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
