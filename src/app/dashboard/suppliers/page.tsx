"use client";
import { useEffect, useState } from "react";

interface Supplier {
  _id: string;
  name: string;
  entrepriseName: string;
  address: string;
  description?: string;
  phones: string[];
  email?: string;
  city?: string;
  category?: string;
  notes?: string;
  createdAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<Supplier>>({ phones: [""] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/suppliers");
      const data = await res.json();
      if (res.ok) setSuppliers(data.suppliers);
      else setError(data.error || "Failed to fetch suppliers");
    } catch (err) {
      setError((err as Error).message || "Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (idx: number, value: string) => {
    const phones = [...(form.phones || [])];
    phones[idx] = value;
    setForm({ ...form, phones });
  };

  const addPhone = () => {
    setForm({ ...form, phones: [...(form.phones || []), ""] });
  };

  const removePhone = (idx: number) => {
    const phones = [...(form.phones || [])];
    phones.splice(idx, 1);
    setForm({ ...form, phones });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  if (!form.name) return setError("Contact name is required");
  if (!form.entrepriseName) return setError("Entreprise name is required");
  if (!form.address) return setError("Address is required");
  if (!form.phones || form.phones.length === 0 || form.phones.some(p => !p)) return setError("At least one phone number is required");
    try {
  let res: Response, data: { supplier?: Supplier; error?: string };
      if (editingId) {
        res = await fetch("/api/dashboard/suppliers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: editingId, ...form }),
        });
        data = await res.json();
        if (res.ok && data.supplier) {
          setSuppliers(suppliers.map(s => s._id === editingId ? data.supplier! : s));
          setEditingId(null);
          setForm({});
        } else setError(data.error || "Failed to update supplier");
      } else {
        res = await fetch("/api/dashboard/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (res.ok && data.supplier) {
          setSuppliers([data.supplier, ...suppliers]);
          setForm({});
        } else setError(data.error || "Failed to add supplier");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to save supplier");
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier._id);
  setForm({ ...supplier, phones: supplier.phones && supplier.phones.length > 0 ? supplier.phones : [""] });
  };

  const handleDelete = async (supplier: Supplier) => {
    setDeletingId(supplier._id);
    setError("");
    try {
      const res = await fetch("/api/dashboard/suppliers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: supplier._id }),
      });
      if (res.ok) {
        setSuppliers(suppliers.filter(s => s._id !== supplier._id));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete supplier");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to delete supplier");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-green-400 to-green-700 shadow-lg">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M3 7v13h18V7H3zm16 11H5v-9h14v9zM9 9h2v6H9zm4 0h2v6h-2z"/></svg>
        </span>
        <h1 className="text-3xl font-extrabold text-green-800 tracking-tight">Suppliers Database</h1>
      </div>
      <p className="text-gray-500 mb-8 text-lg">Manage all your supplier contacts, categories, and details in one place.</p>
      <form onSubmit={handleSubmit} className="bg-gradient-to-tr from-green-50 to-green-100 rounded-2xl shadow-lg p-8 mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 border border-green-200">
  <input name="entrepriseName" placeholder="Entreprise Name*" value={form.entrepriseName || ""} onChange={handleChange} className="border rounded px-3 py-2 text-gray-900" required />
  <input name="name" placeholder="Contact Name*" value={form.name || ""} onChange={handleChange} className="border rounded px-3 py-2 text-gray-900" required />
  <input name="address" placeholder="Address*" value={form.address || ""} onChange={handleChange} className="border rounded px-3 py-2 md:col-span-2 text-gray-900" required />
  <input name="city" placeholder="City" value={form.city || ""} onChange={handleChange} className="border rounded px-3 py-2 text-gray-900" />
  <input name="category" placeholder="Category" value={form.category || ""} onChange={handleChange} className="border rounded px-3 py-2 text-gray-900" />
  <input name="email" placeholder="Email" value={form.email || ""} onChange={handleChange} className="border rounded px-3 py-2 text-gray-900" />
        <div className="md:col-span-2">
          <label className="block mb-1 font-semibold">Phone Numbers*</label>
          {(form.phones || [""]).map((phone, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                name={`phone-${idx}`}
                placeholder={`Phone #${idx + 1}`}
                value={phone}
                onChange={e => handlePhoneChange(idx, e.target.value)}
                className="border rounded px-3 py-2 flex-1 text-gray-900"
                required
              />
              {form.phones && form.phones.length > 1 && (
                <button type="button" className="text-red-500 px-2" onClick={() => removePhone(idx)} title="Remove phone">✕</button>
              )}
              {idx === (form.phones?.length || 1) - 1 && (
                <button type="button" className="text-green-600 px-2" onClick={addPhone} title="Add phone">＋</button>
              )}
            </div>
          ))}
        </div>
  <textarea name="description" placeholder="Description" value={form.description || ""} onChange={handleChange} className="border rounded px-3 py-2 md:col-span-2 text-gray-900" />
  <textarea name="notes" placeholder="Notes" value={form.notes || ""} onChange={handleChange} className="border rounded px-3 py-2 md:col-span-2 text-gray-900" />
        <div className="md:col-span-2 flex gap-2 mt-2">
          <button type="submit" className="bg-gradient-to-tr from-green-500 to-green-700 text-white font-bold rounded-lg px-6 py-2 shadow hover:scale-105 hover:from-green-600 hover:to-green-800 transition-all duration-150">
            {editingId ? "Update" : "Add Supplier"}
          </button>
          {editingId && (
            <button type="button" className="text-gray-500 px-2" onClick={() => { setEditingId(null); setForm({ phones: [""] }); }}>Cancel</button>
          )}
        </div>
        {error && <div className="text-red-600 md:col-span-2 font-semibold">{error}</div>}
      </form>
      {loading ? (
        <div className="text-green-600 font-semibold">Loading suppliers...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gradient-to-tr from-green-50 to-green-100 rounded-xl shadow-inner border border-green-100">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path fill="#a7f3d0" d="M3 7v13h18V7H3zm16 11H5v-9h14v9zM9 9h2v6H9zm4 0h2v6h-2z"/></svg>
              <span className="text-gray-400 mt-2 text-lg">No suppliers yet. Add your first supplier!</span>
            </div>
          )}
          {suppliers.map(supplier => (
            <div key={supplier._id} className="bg-white rounded-2xl shadow-lg border-2 border-green-100 hover:border-green-400 transition-all p-6 flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#22c55e" d="M3 7v13h18V7H3zm16 11H5v-9h14v9zM9 9h2v6H9zm4 0h2v6h-2z"/></svg>
                </span>
                <span className="text-lg font-bold text-green-800">{supplier.entrepriseName}</span>
                <span className="ml-auto text-xs text-gray-400">{supplier.category || "-"}</span>
              </div>
              <div className="text-gray-700 font-medium">Contact: <span className="text-green-700">{supplier.name}</span></div>
              <div className="text-gray-600 text-sm">{supplier.address}</div>
              <div className="text-gray-500 text-xs">{supplier.city}</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {supplier.phones && supplier.phones.length > 0 ? supplier.phones.map((phone, idx) => (
                  <span key={idx} className="inline-block bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200">{phone}</span>
                )) : <span className="text-gray-400">No phone</span>}
              </div>
              {supplier.email && <div className="text-xs text-gray-500">Email: {supplier.email}</div>}
              {supplier.description && <div className="text-xs text-gray-500">{supplier.description}</div>}
              <div className="flex gap-2 mt-2">
                <button className="text-green-600 hover:underline font-semibold" onClick={() => handleEdit(supplier)}>Edit</button>
                <button className="text-red-500 hover:underline font-semibold" onClick={() => handleDelete(supplier)} disabled={deletingId === supplier._id}>
                  {deletingId === supplier._id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
