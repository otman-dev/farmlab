"use client";

import { useEffect, useState } from "react";
import { FiCheck, FiPlus, FiEdit2, FiTrash2, FiCircle, FiList, FiAlertTriangle, FiClock, FiMinus, FiTag, FiCalendar, FiUser } from "react-icons/fi";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

// Helper functions
const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date();
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
};

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState("general");
  const [dueDate, setDueDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editCategory, setEditCategory] = useState("general");
  const [editDueDate, setEditDueDate] = useState("");
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [users, setUsers] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [editUser, setEditUser] = useState<string>('');
  const [selectedAssignedUser, setSelectedAssignedUser] = useState<string>('all');

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/todolist");
      const data = await res.json();
      if (res.ok) setTodos(data.todos);
      else setError(data.error || "Failed to fetch todos");
    } catch (err) {
      setError((err as Error).message || "Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTodos(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/dashboard/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/todolist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTodo,
          priority,
          category,
          dueDate: dueDate || undefined,
          user: selectedUser || undefined
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTodos([data.todo, ...todos]);
        setNewTodo("");
        setPriority('medium');
        setCategory("general");
        setDueDate("");
        setSelectedUser("");
      } else {
        setError(data.error || "Failed to add todo");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to add todo");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const res = await fetch("/api/dashboard/todolist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: todo._id, completed: !todo.completed }),
      });
      const data = await res.json();
      if (res.ok) {
        setTodos(todos.map(t => t._id === todo._id ? { ...t, completed: !t.completed } : t));
      } else {
        setError(data.error || "Failed to update todo");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to update todo");
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingId(todo._id);
    setEditValue(todo.title);
    setEditPriority(todo.priority || 'medium');
    setEditCategory(todo.category || 'general');
    setEditDueDate(todo.dueDate || "");
    setEditUser(todo.user?._id || "");
  };

  const handleEditSave = async (todo: Todo) => {
    try {
      const res = await fetch("/api/dashboard/todolist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: todo._id,
          title: editValue,
          priority: editPriority,
          category: editCategory,
          dueDate: editDueDate || undefined,
          user: editUser || undefined
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTodos(todos.map(t => t._id === todo._id ? {
          ...t,
          title: editValue,
          priority: editPriority,
          category: editCategory,
          dueDate: editDueDate || undefined,
          user: users.find(u => u._id === editUser) || undefined
        } : t));
        setEditingId(null);
      } else {
        setError(data.error || "Failed to update todo");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to update todo");
    }
  };

  const handleDelete = async (todo: Todo) => {
    setError("");
    try {
      const res = await fetch("/api/dashboard/todolist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: todo._id }),
      });
      if (res.ok) {
        setTodos(todos.filter(t => t._id !== todo._id));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete todo");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to delete todo");
    }
  };

  // Filter todos based on current filters
  const filteredTodos = todos.filter(todo => {
    const matchesStatus = filter === 'all' ||
      (filter === 'pending' && !todo.completed) ||
      (filter === 'completed' && todo.completed);
    const matchesCategory = selectedCategory === 'all' || (todo.category || 'general') === selectedCategory;
    const matchesUser = selectedAssignedUser === 'all' ||
      (selectedAssignedUser === 'unassigned' && !todo.user) ||
      (todo.user && todo.user._id === selectedAssignedUser);
    return matchesStatus && matchesCategory && matchesUser;
  });

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(todos.map(todo => todo.category || 'general')));

  // Stats
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 shadow-2xl mb-6">
            <FiList className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Farm To-Do List</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Organize, track, and complete your farm tasks with style and efficiency
          </p>
        </div>

        {/* Stats Overview */}
        {todos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FiList className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FiCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <FiCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-xl">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overdueTasks}</p>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {todos.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({totalTasks})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === 'pending'
                      ? 'bg-yellow-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending ({pendingTasks})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === 'completed'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completed ({completedTasks})
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Assigned to:</label>
                <select
                  value={selectedAssignedUser}
                  onChange={(e) => setSelectedAssignedUser(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="all">All Users</option>
                  <option value="unassigned">Unassigned</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Add Todo Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <form onSubmit={handleAdd} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title</label>
              <div className="relative">
                <input
                  className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-lg text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all outline-none shadow-sm"
                  placeholder="What needs to be done on the farm?"
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  disabled={adding}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <FiPlus className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g., maintenance, planting"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to User</label>
                <select
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none bg-white"
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl px-8 py-4 shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                disabled={adding || !newTodo.trim()}
              >
                {adding ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <FiPlus className="w-5 h-5" />
                    <span>Add Task</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
            <span className="ml-3 text-lg text-gray-600 font-medium">Loading your tasks...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Todo List */}
        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
              <div className="max-w-md mx-auto">
                <FiList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">
                  {todos.length === 0
                    ? "Get started by adding your first farm task above!"
                    : "Try adjusting your filters to see more tasks."
                  }
                </p>
              </div>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo._id}
                className={`bg-white rounded-3xl shadow-lg border border-gray-100 p-6 transition-all duration-200 hover:shadow-xl ${
                  todo.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggle(todo)}
                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      todo.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                    }`}
                  >
                    {todo.completed && <FiCheck className="w-4 h-4" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingId === todo._id ? (
                      <div className="space-y-4">
                        <input
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <select
                            value={editPriority}
                            onChange={e => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                          <input
                            type="text"
                            value={editCategory}
                            onChange={e => setEditCategory(e.target.value)}
                            placeholder="Category"
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={e => setEditDueDate(e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                          <select
                            value={editUser}
                            onChange={e => setEditUser(e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                          >
                            <option value="">Unassigned</option>
                            {users.map(user => (
                              <option key={user._id} value={user._id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSave(todo)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold text-gray-900 ${
                              todo.completed ? 'line-through text-gray-500' : ''
                            }`}>
                              {todo.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              {/* Priority Badge */}
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                (todo.priority || 'medium') === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : (todo.priority || 'medium') === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {(todo.priority || 'medium') === 'high' && <FiAlertTriangle className="w-3 h-3 mr-1" />}
                                {(todo.priority || 'medium') === 'medium' && <FiClock className="w-3 h-3 mr-1" />}
                                {(todo.priority || 'medium') === 'low' && <FiMinus className="w-3 h-3 mr-1" />}
                                {((todo.priority || 'medium').charAt(0).toUpperCase() + (todo.priority || 'medium').slice(1))} Priority
                              </span>

                              {/* Category Badge */}
                              {todo.category && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <FiTag className="w-3 h-3 mr-1" />
                                  {todo.category}
                                </span>
                              )}

                              {/* Due Date Badge */}
                              {todo.dueDate && (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  isOverdue(todo.dueDate) && !todo.completed
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  <FiCalendar className="w-3 h-3 mr-1" />
                                  {formatDate(todo.dueDate)}
                                  {isOverdue(todo.dueDate) && !todo.completed && (
                                    <span className="ml-1 text-red-600">• Overdue</span>
                                  )}
                                </span>
                              )}

                              {/* User Assignment Badge */}
                              {todo.user && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                  <FiUser className="w-3 h-3 mr-1" />
                                  {todo.user.name}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(todo)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="Edit task"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(todo)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              title="Delete task"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
