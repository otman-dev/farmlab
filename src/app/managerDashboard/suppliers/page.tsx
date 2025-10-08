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



  // ...existing code...


  // ...existing code...

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<Supplier>>({ phones: [""] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search] = useState("");

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers");
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
    if (!form.entrepriseName) return setError("Company name is required");
    if (!form.address) return setError("Address is required");
    try {
      let res: Response, data: { supplier?: Supplier; error?: string };
      if (editingId) {
        res = await fetch("/api/suppliers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: editingId, ...form }),
        });
        data = await res.json();
        if (res.ok && data.supplier) {
          setSuppliers(suppliers.map(s => s._id === editingId ? data.supplier! : s));
          setEditingId(null);
          setForm({ phones: [""] });
          setShowForm(false);
        } else setError(data.error || "Failed to update supplier");
      } else {
        res = await fetch("/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (res.ok && data.supplier) {
          setSuppliers([data.supplier, ...suppliers]);
          setForm({ phones: [""] });
          setShowForm(false);
        } else setError(data.error || "Failed to add supplier");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to save supplier");
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier._id);
    setForm({ ...supplier, phones: supplier.phones && supplier.phones.length > 0 ? supplier.phones : [""] });
    setShowForm(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    setDeletingId(supplier._id);
    setError("");
    try {
      const res = await fetch("/api/suppliers", {
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


  // Dynamic search filter (matches any field, partial, case-insensitive)
  const filteredSuppliers: Supplier[] = suppliers.filter((supplier: Supplier) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      supplier.entrepriseName.toLowerCase().includes(q) ||
      supplier.name.toLowerCase().includes(q) ||
      (supplier.address && supplier.address.toLowerCase().includes(q)) ||
      (supplier.city && supplier.city.toLowerCase().includes(q)) ||
      (supplier.email && supplier.email.toLowerCase().includes(q)) ||
      (supplier.description && supplier.description.toLowerCase().includes(q)) ||
      (supplier.notes && supplier.notes.toLowerCase().includes(q)) ||
      (supplier.phones && supplier.phones.some((phone: string) => phone.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-green-400 to-green-700 shadow-lg">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M3 7v13h18V7H3zm16 11H5v-9h14v9zM9 9h2v6H9zm4 0h2v6h-2z"/></svg>
          </span>
          <h1 className="text-3xl font-extrabold text-green-800 tracking-tight">Suppliers Database</h1>
        </div>
        
        {/* Add New Supplier Button */}
        {!showForm && (
          <button
            onClick={() => {
              setForm({ phones: [""] });
              setEditingId(null);
              setShowForm(true);
              setError("");
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6"/>
            </svg>
            Add New Supplier
          </button>
        )}
      </div>
      {showForm && (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 mb-8 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingId ? "Edit Supplier" : "Add New Supplier"}
                  </h2>
                  <p className="text-green-100 text-sm">
                    {editingId ? "Update supplier information" : "Enter supplier details to add to your database"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { 
                  setEditingId(null); 
                  setForm({ phones: [""] }); 
                  setShowForm(false); 
                  setError("");
                }}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                    <path stroke="#dc2626" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800">Error</h4>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Information Section */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"/>
                    </svg>
                  </div>
                  Company Information
                </h3>
              </div>

              {/* Enterprise Name */}
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="entrepriseName"
                  placeholder="Enter company name"
                  value={form.entrepriseName || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              {/* Contact Information Section */}
              <div className="lg:col-span-2 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  Contact Information
                  <span className="text-sm font-normal text-gray-500">(Optional)</span>
                </h3>
              </div>

              {/* Contact Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <input
                  name="name"
                  placeholder="Enter contact person name"
                  value={form.name || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="contact@company.com"
                  value={form.email || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Phone Numbers */}
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Numbers
                </label>
                <div className="space-y-3">
                  {(form.phones || [""]).map((phone, idx) => (
                    <div key={idx} className="flex gap-3">
                      <input
                        placeholder={`Phone number ${idx + 1}`}
                        value={phone}
                        onChange={e => handlePhoneChange(idx, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                      />
                      {form.phones && form.phones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhone(idx)}
                          className="w-12 h-12 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors flex items-center justify-center"
                          title="Remove phone"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      )}
                      {idx === (form.phones?.length || 1) - 1 && (
                        <button
                          type="button"
                          onClick={addPhone}
                          className="w-12 h-12 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors flex items-center justify-center"
                          title="Add phone"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Section */}
              <div className="lg:col-span-2 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path stroke="#8b5cf6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke="#8b5cf6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  Location Details
                </h3>
              </div>

              {/* Address */}
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="address"
                  placeholder="Enter full address"
                  value={form.address || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  name="city"
                  placeholder="Enter city"
                  value={form.city || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Additional Information Section */}
              <div className="lg:col-span-2 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path stroke="#f59e0b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  Additional Information
                </h3>
              </div>

              {/* Description */}
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  placeholder="Brief description of products/services"
                  value={form.description || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Notes */}
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Internal Notes</label>
                <textarea
                  name="notes"
                  placeholder="Private notes for internal use"
                  value={form.notes || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 sm:flex-initial bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
                {editingId ? "Update Supplier" : "Add Supplier"}
              </button>
              <button
                type="button"
                onClick={() => { 
                  setEditingId(null); 
                  setForm({ phones: [""] }); 
                  setShowForm(false); 
                  setError("");
                }}
                className="px-6 py-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {loading ? (
        <div className="text-green-600 font-semibold">Loading suppliers...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gradient-to-tr from-green-50 to-green-100 rounded-xl shadow-inner border border-green-100">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path fill="#a7f3d0" d="M3 7v13h18V7H3zm16 11H5v-9h14v9zM9 9h2v6H9zm4 0h2v6h-2z"/></svg>
              <span className="text-gray-400 mt-2 text-lg">No suppliers found.</span>
            </div>
          )}
          {filteredSuppliers.map(supplier => (
            <div key={supplier._id} className="bg-white rounded-2xl shadow-lg border-2 border-green-100 hover:border-green-400 transition-all p-6 flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#22c55e" d="M3 7v13h18V7H3zm16 11H5v-9h14v9zM9 9h2v6H9zm4 0h2v6h-2z"/></svg>
                </span>
                <span className="text-lg font-bold text-green-800">{supplier.entrepriseName}</span>
              </div>
              <div className="text-gray-700 font-medium">
                Contact: <span className="text-green-700">{supplier.name || "No contact person"}</span>
              </div>
              <div className="text-gray-600 text-sm">{supplier.address}</div>
              <div className="text-gray-500 text-xs">{supplier.city}</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {supplier.phones && supplier.phones.length > 0 ? supplier.phones.map((phone, idx) => (
                  <span key={idx} className="inline-block bg-green-50 text-green-700 px-2 py-1 rounded text-xs border border-green-200">{phone}</span>
                )) : <span className="text-gray-400 text-xs">No phone numbers</span>}
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
