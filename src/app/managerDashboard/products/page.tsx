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
  unit?: string;
  amountPerUnit?: number;
  unitType?: 'weight' | 'count'; // For plant_seeds
  seedType?: string;
  plantingInstructions?: string;
  harvestTime?: string;
  growthConditions?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Edit modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        // Deduplicate by name and category but keep _id and preserve important fields
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
                // Prefer new kgPerUnit field, fall back to legacy kilogramQuantity
                kgPerUnit: p.kgPerUnit || p.kilogramQuantity,
                // Preserve packaging/unit information for plant products
                unitType: (p as any).unitType,
                unit: (p as any).unit,
                amountPerUnit: (p as any).amountPerUnit,
                seedType: (p as any).seedType,
                plantingInstructions: (p as any).plantingInstructions,
                harvestTime: (p as any).harvestTime,
                growthConditions: (p as any).growthConditions
              } as Product;
            }
          }
        });
        setProducts(Object.values(unique));
      } else {
        setError("Failed to fetch products");
      }
    } catch (err) {
      console.error('Error loading products:', err);
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
      console.error('Error deleting product:', err);
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
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <span className="text-lg font-bold text-green-800">{product.name}</span>
                  <span className="ml-3 text-xs text-green-700 bg-green-50 rounded px-2 py-1">{product.category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setShowEditModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-colors border border-blue-200"
                    title={`Edit ${product.name}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product._id, product.name)}
                    disabled={deleting === product._id}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
                    title={`Delete ${product.name}`}
                  >
                    {deleting === product._id ? (
                      <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    )}
                    <span className="hidden sm:inline">{deleting === product._id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
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
              
              {product.category === 'plant_seeds' && product.unitType === 'weight' && product.kgPerUnit && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <span className="text-sm font-semibold text-blue-800">Package Weight:</span>
                    <span className="text-sm font-bold text-blue-700">{product.kgPerUnit} kg</span>
                  </div>
                </div>
              )}
              
              {product.category === 'plant_seeds' && product.unitType === 'count' && product.unit && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">Unit:</span>
                    <span className="text-sm font-bold text-purple-700">{product.unit}</span>
                    {product.amountPerUnit && (
                      <>
                        <span className="text-sm font-semibold text-purple-800 ml-2">Seeds per Unit:</span>
                        <span className="text-sm font-bold text-purple-700">{product.amountPerUnit}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {(product.category === 'plant_seedlings' || product.category === 'plant_nutrition' || product.category === 'plant_medicine') && product.unit && (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    <span className="text-sm font-semibold text-emerald-800">Unit:</span>
                    <span className="text-sm font-bold text-emerald-700">{product.unit}</span>
                    {product.amountPerUnit && (
                      <>
                        <span className="text-sm font-semibold text-emerald-800 ml-2">Amount per Unit:</span>
                        <span className="text-sm font-bold text-emerald-700">{product.amountPerUnit}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {product.seedType && (
                <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-yellow-800">Seed Type:</span>
                    <span className="text-xs font-bold text-yellow-700">{product.seedType}</span>
                  </div>
                </div>
              )}
              
              {product.harvestTime && (
                <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-orange-800">Harvest Time:</span>
                    <span className="text-xs font-bold text-orange-700">{product.harvestTime}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Edit Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-green-800">Edit Product</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <AddProductForm 
                editingProduct={editingProduct}
                onProductAdded={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                  fetchProducts();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
