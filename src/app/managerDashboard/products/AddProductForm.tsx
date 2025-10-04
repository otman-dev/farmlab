"use client";
import React, { useState } from "react";


interface ProductForm {
  category: "animal_feed" | "animal_medicine" | "";
  name: string;
  description: string;
  kgPerUnit: string; // string for form input, will convert to number
}

interface AddProductFormProps {
  onProductAdded?: () => void;
}

export default function AddProductForm({ onProductAdded }: AddProductFormProps) {
  const [form, setForm] = useState<ProductForm>({ category: "", name: "", description: "", kgPerUnit: "" });
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
    
    // Validate kgPerUnit for animal_feed
    if (form.category === "animal_feed") {
      if (!form.kgPerUnit.trim()) return setError("Kilogram per unit is required for animal feed");
      const kgValue = parseFloat(form.kgPerUnit);
      if (isNaN(kgValue) || kgValue <= 0) return setError("Kilogram per unit must be a positive number");
    }
    
    setLoading(true);
    
    // Prepare payload
    const payload: {
      category: string;
      name: string;
      description: string;
      kgPerUnit?: number;
    } = {
      category: form.category,
      name: form.name.trim(),
      description: form.description.trim()
    };
    
    // Add kgPerUnit for animal_feed category
    if (form.category === "animal_feed") {
      payload.kgPerUnit = parseFloat(form.kgPerUnit);
    }
    
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess("Product added successfully!");
      setForm({ category: "", name: "", description: "", kgPerUnit: "" });
      if (onProductAdded) {
        onProductAdded(); // Refresh the products list
      }
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
            {form.category === "animal_feed" && (
              <div>
                <label className="block font-semibold mb-1 text-green-900">Kilogram per Unit*</label>
                <div className="relative">
                  <input 
                    name="kgPerUnit" 
                    type="number" 
                    step="0.01" 
                    min="0.01" 
                    value={form.kgPerUnit} 
                    onChange={handleChange} 
                    className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 pr-12" 
                    placeholder="e.g., 25.5"
                    required 
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">kg</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Weight in kilograms per unit/package of this feed</p>
              </div>
            )}
          </>
        )}
        {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
        <button type="submit" className="bg-gradient-to-tr from-green-500 to-green-700 text-white font-bold rounded-lg px-8 py-3 shadow hover:scale-105 hover:from-green-600 hover:to-green-800 transition-all duration-150 mt-2" disabled={loading || !form.category}>{loading ? "Saving..." : "Add Product"}</button>
      </form>
    </div>
  );
}

