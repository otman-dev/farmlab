"use client";


import { useEffect, useState } from "react";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTodo, setNewTodo] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/todolist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodo }),
      });
      const data = await res.json();
      if (res.ok) {
        setTodos([data.todo, ...todos]);
        setNewTodo("");
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
  };

  const handleEditSave = async (todo: Todo) => {
    try {
      const res = await fetch("/api/dashboard/todolist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: todo._id, title: editValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setTodos(todos.map(t => t._id === todo._id ? { ...t, title: editValue } : t));
        setEditingId(null);
      } else {
        setError(data.error || "Failed to update todo");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to update todo");
    }
  };

  const handleDelete = async (todo: Todo) => {
    setDeletingId(todo._id);
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
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-green-400 to-green-700 shadow-lg">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M9 11.586l-2.293-2.293-1.414 1.414L9 14.414l8-8-1.414-1.414z"/></svg>
        </span>
        <h1 className="text-3xl font-extrabold text-green-800 tracking-tight">Farm To-Do List</h1>
      </div>
      <p className="text-gray-500 mb-8 text-lg">Organize, track, and complete your farm tasks with style.</p>
      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
        <input
          className="flex-1 border-2 border-green-200 focus:border-green-500 rounded-lg px-4 py-2 text-lg shadow-sm transition"
          placeholder="Add a new todo..."
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          disabled={adding}
        />
        <button
          type="submit"
          className="bg-gradient-to-tr from-green-500 to-green-700 text-white font-bold rounded-lg px-6 py-2 shadow hover:scale-105 hover:from-green-600 hover:to-green-800 transition-all duration-150"
          disabled={adding}
        >
          {adding ? (
            <span className="flex items-center gap-2"><svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4" opacity="0.3"/><path d="M4 12a8 8 0 018-8" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></svg>Adding...</span>
          ) : (
            <span className="flex items-center gap-2"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 5v14m7-7H5"/></svg>Add</span>
          )}
        </button>
      </form>
      {loading && <div className="text-green-600 font-semibold">Loading todos...</div>}
      {error && <div className="text-red-600 mb-2 font-semibold">{error}</div>}
      <ul className="space-y-4">
        {todos.length === 0 && !loading && (
          <li className="flex flex-col items-center justify-center py-12 bg-gradient-to-tr from-green-50 to-green-100 rounded-xl shadow-inner border border-green-100">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path fill="#a7f3d0" d="M9 11.586l-2.293-2.293-1.414 1.414L9 14.414l8-8-1.414-1.414z"/></svg>
            <span className="text-gray-400 mt-2 text-lg">No tasks yet. Add your first farm task!</span>
          </li>
        )}
        {todos.map(todo => (
          <li
            key={todo._id}
            className={`group flex items-center gap-3 bg-gradient-to-tr from-white to-green-50 rounded-2xl shadow-lg p-5 border-2 ${todo.completed ? 'border-green-200 opacity-60' : 'border-green-400'} transition-all hover:shadow-xl hover:border-green-600`}
          >
            <button
              onClick={() => handleToggle(todo)}
              className={`w-7 h-7 flex items-center justify-center rounded-full border-2 ${todo.completed ? 'bg-green-500 border-green-500' : 'bg-white border-green-300'} shadow-sm transition hover:scale-110`}
              title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {todo.completed ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M9 11.586l-2.293-2.293-1.414 1.414L9 14.414l8-8-1.414-1.414z"/></svg>
              ) : (
                <span className="block w-3 h-3 rounded-full bg-green-200"></span>
              )}
            </button>
            {editingId === todo._id ? (
              <>
                <input
                  className="flex-1 border-2 border-green-300 focus:border-green-500 rounded-lg px-3 py-1 text-lg shadow-sm"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleEditSave(todo); }}
                  autoFocus
                />
                <button
                  className="text-green-700 font-bold px-2 hover:underline"
                  onClick={() => handleEditSave(todo)}
                >Save</button>
                <button
                  className="text-gray-400 px-2 hover:underline"
                  onClick={() => setEditingId(null)}
                >Cancel</button>
              </>
            ) : (
              <span
                className={`flex-1 text-lg font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-green-900'} cursor-pointer`}
                onDoubleClick={() => handleEdit(todo)}
                title="Double-click to edit"
              >{todo.title}</span>
            )}
            <span className="text-xs text-gray-400 font-mono px-2 hidden sm:inline">{new Date(todo.createdAt).toLocaleString()}</span>
            <button
              className="text-red-500 hover:text-red-700 px-2 opacity-70 hover:opacity-100 transition"
              onClick={() => handleDelete(todo)}
              disabled={deletingId === todo._id}
              title="Delete"
            >
              {deletingId === todo._id ? (
                <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="4" opacity="0.3"/><path d="M4 12a8 8 0 018-8" stroke="#ef4444" strokeWidth="4" strokeLinecap="round"/></svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#ef4444" d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zm3.46-9.12l1.06 7.06h1.96l1.06-7.06H9.46zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
