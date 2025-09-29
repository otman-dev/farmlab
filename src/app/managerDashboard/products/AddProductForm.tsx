"use client";
import React, { useState } from "react";


interface ProductForm {
  category: "animal_feed" | "animal_medicine" | "";
  name: string;
  description: string;
}

export default function AddProductForm() {
  const [form, setForm] = useState<ProductForm>({ category: "", name: "", description: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.category) return setError("Category is required");
    if (!form.name.trim()) return setError("Product name is required");
    if (!form.description.trim()) return setError("Description is required");
    setLoading(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess("Product added successfully!");
      setForm({ category: "", name: "", description: "" });
    } else {
      setError(data.error || "Failed to add product");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-extrabold text-green-800 mb-6 tracking-tight">Add Product</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block font-semibold mb-1 text-green-900">Category*</label>
          <select name="category" value={form.category} onChange={handleChange} className="border-2 border-green-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-green-500 text-gray-900" required>
            <option value="">Select category</option>
            <option value="animal_feed">Animal Feed</option>
            <option value="animal_medicine">Animal Medicine</option>
          </select>
        </div>
        {form.category && (
          <>
            <div>
              <label className="block font-semibold mb-1 text-green-900">Product Name*</label>
              <input name="name" value={form.name} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-green-900">Description*</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 min-h-[60px]" required />
            </div>
          </>
        )}
        {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
        <button type="submit" className="bg-gradient-to-tr from-green-500 to-green-700 text-white font-bold rounded-lg px-8 py-3 shadow hover:scale-105 hover:from-green-600 hover:to-green-800 transition-all duration-150 mt-2" disabled={loading || !form.category}>{loading ? "Saving..." : "Add Product"}</button>
      </form>
    </div>
  );
}

