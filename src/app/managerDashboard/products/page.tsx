"use client";

import { useEffect, useState } from "react";
import AddProductForm from "./AddProductForm";

interface Product {
  _id: string;
  name: string;
  category: string;
  description?: string;
  kgPerUnit?: number;
  kilogramQuantity?: number; // For backward compatibility
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        // Deduplicate by name and category but keep _id for deletion
        const unique: Record<string, Product> = {};
        (data.products || []).forEach((p: Product) => {
          if (p.name && p.category) {
            const key = `${p.name.toLowerCase()}|${p.category}`;
            if (!unique[key] || unique[key]._id < p._id) { // Keep the latest one
              unique[key] = { 
                _id: p._id,
                name: p.name, 
                category: p.category,
                description: p.description,
                kgPerUnit: p.kgPerUnit || p.kilogramQuantity
              };
            }
          }
        });
        setProducts(Object.values(unique));
      } else {
        setError("Failed to fetch products");
      }
    } catch (err) {
      setError("Error loading products");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeleting(productId);
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(`Product "${productName}" deleted successfully!`);
        fetchProducts(); // Refresh the list
      } else {
        setError(data.error || 'Failed to delete product');
      }
    } catch (err) {
      setError('Error deleting product');
    } finally {
      setDeleting(null);
    }
  };

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
      <AddProductForm onProductAdded={fetchProducts} />
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
      
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-800 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-800 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="font-semibold">{success}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-800 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-800 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="font-semibold">{success}</span>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
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
            <div key={idx} className="bg-white rounded-2xl shadow-lg border-2 border-green-100 hover:border-green-400 transition-all p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-bold text-green-800">{product.name}</span>
                <span className="ml-auto text-xs text-green-700 bg-green-50 rounded px-2 py-1">{product.category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
              
              {product.description && (
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              )}
              
              {product.category === 'animal_feed' && product.kgPerUnit && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3"></path>
                    </svg>
                    <span className="text-sm font-semibold text-green-800">Weight per Unit:</span>
                    <span className="text-sm font-bold text-green-700">{product.kgPerUnit} kg</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
