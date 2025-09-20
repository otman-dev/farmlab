"use client";

import { useEffect, useState } from "react";
import AddProductForm from "./AddProductForm";

interface Product {
  name: string;
  category: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Will fetch products from invoices API endpoint
    const fetchProducts = async () => {
      setLoading(true);
      const res = await fetch("/api/dashboard/products");
      const data = await res.json();
      // Deduplicate by name and category
      const unique: Record<string, Product> = {};
  (data.products || []).forEach((p: Product) => {
        if (p.name && p.category) {
          unique[`${p.name.toLowerCase()}|${p.category}`] = { name: p.name, category: p.category };
        }
      });
      setProducts(Object.values(unique));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <AddProductForm />
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 mt-10">
        <h1 className="text-3xl font-extrabold text-green-800 tracking-tight">Products</h1>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto border rounded px-3 py-2 text-gray-900"
        />
      </div>
      {loading ? (
        <div className="text-green-600 font-semibold">Loading products...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 bg-gradient-to-tr from-green-50 to-green-100 rounded-xl shadow-inner border border-green-100">
              <span className="text-gray-400 mt-2 text-lg">No products found.</span>
            </div>
          )}
          {filteredProducts.map((product, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg border-2 border-green-100 hover:border-green-400 transition-all p-6 flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold text-green-800">{product.name}</span>
                <span className="ml-auto text-xs text-green-700 bg-green-50 rounded px-2 py-1">{product.category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
