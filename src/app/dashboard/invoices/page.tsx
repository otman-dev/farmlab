
"use client";



import React, { useEffect, useState } from "react";

interface ProductForm {
  name: string;
  quantity: number;
  price: number;
  description?: string;
  category?: string;
  unit?: string;
  unitAmount?: number;
  kgPerUnit?: number;
  goodFor?: string[];
  expirationDate?: string;
  firstUsageDate?: string;
  usageDescription?: string;
}

interface Product {
  name: string;
  category: string;
}


interface Supplier {
  _id: string;
  entrepriseName: string;
}


export default function InvoicesPage() {
  // Date state for invoice
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ProductForm[]>([{ name: "", quantity: 1, price: 0, kgPerUnit: undefined }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  interface InvoiceProduct {
    name: string;
    quantity: number;
    price: number;
    description?: string;
    category?: string;
    unit?: string;
    kgPerUnit?: number;
  }
  interface Invoice {
    _id: string;
    invoiceNumber: string;
    supplier?: Supplier;
    products: InvoiceProduct[];
    grandTotal?: number;
    invoiceDate: string;
    createdAt?: string;
  }
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  // Track dropdown open state for each product row
  const [dropdownOpen, setDropdownOpen] = useState<boolean[]>([false]);

  // Fetch suppliers and invoices on mount
  useEffect(() => {
    fetch("/api/dashboard/suppliers")
      .then(res => res.json())
      .then(data => setSuppliers(data.suppliers || []));
    fetchInvoices();
    fetch("/api/dashboard/products")
      .then(res => res.json())
      .then(data => setAllProducts(data.products || []));
  }, []);

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    const res = await fetch("/api/dashboard/invoices");
    const data = await res.json();
    setInvoices(data.invoices || []);
    setLoadingInvoices(false);
  };

  const handleProductChange = (idx: number, field: keyof ProductForm, value: string | number | string[]) => {
    setProducts(products => {
      const updated = [...products];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };
  // Dropdown open/close handlers
  const setDropdown = (idx: number, open: boolean) => {
    setDropdownOpen(arr => {
      const copy = [...arr];
      copy[idx] = open;
      return copy;
    });
  };

  // Helper: check if a product name is new (not in DB for this category)
  const isNewProduct = (name: string) => {
    return !allProducts.some(p => p.name.trim().toLowerCase() === name.trim().toLowerCase() && p.category === category);
  };

  const addProduct = () => {
    setProducts([...products, { name: "", quantity: 1, price: 0, kgPerUnit: undefined }]);
    setDropdownOpen(arr => [...arr, false]);
  };
  const removeProduct = (idx: number) => {
    setProducts(products => products.length > 1 ? products.filter((_, i) => i !== idx) : products);
    setDropdownOpen(arr => arr.length > 1 ? arr.filter((_, i) => i !== idx) : arr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!invoiceNumber.trim()) return setError("Invoice number is required");
    if (!supplierId) return setError("Supplier is required");
    if (products.some(p => !p.name || p.quantity <= 0 || p.price < 0)) return setError("All products must have a name, quantity > 0, and price >= 0");
    // Check for new products and insert them first
    setLoading(true);
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (isNewProduct(p.name)) {
        if (!p.description || !p.description.trim()) {
          setLoading(false);
          return setError(`Please provide a description for new product: ${p.name}`);
        }
        // Only send relevant fields for animal_medicine
        let productPayload: Partial<ProductForm> = { name: p.name, category, description: p.description };
        if (category === 'animal_medicine') {
          productPayload = {
            name: p.name,
            category,
            description: p.description,
            unit: p.unit,
            unitAmount: p.unitAmount,
            goodFor: p.goodFor,
            expirationDate: p.expirationDate,
            firstUsageDate: p.firstUsageDate,
            usageDescription: p.usageDescription,
          };
        }
        const resp = await fetch("/api/dashboard/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload),
        });
        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          setLoading(false);
          return setError(errData.error || `Failed to add new product: ${p.name}`);
        }
      }
    }
    // Now submit invoice
    const res = await fetch("/api/dashboard/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceNumber, supplierId, products: products.map(p => ({ ...p, category })), date: invoiceDate }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess("Invoice added successfully!");
      setInvoiceNumber("");
      setSupplierId("");
  setProducts([{ name: "", quantity: 1, price: 0 }]);
  setInvoiceDate(new Date().toISOString().slice(0, 10));
      fetchInvoices();
    } else {
      setError(data.error || "Failed to add invoice");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10">
      <div className="bg-gradient-to-tr from-green-50 to-green-100 rounded-2xl shadow-lg p-8 border border-green-200">
        <h1 className="text-3xl font-extrabold text-green-800 mb-6 tracking-tight">Add New Invoice</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-semibold mb-1 text-green-900">Invoice Number*</label>
              <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="border-2 border-green-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-green-500 text-gray-900" required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-green-900">Supplier*</label>
              <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="border-2 border-green-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-green-500 text-gray-900" required>
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.entrepriseName}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-green-900">Invoice Date*</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="border-2 border-green-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-green-500 text-gray-900"
                required
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>
          {/* Grand Total for Invoice - moved above Add Invoice button */}
          <div>
            <label className="block font-semibold mb-2 text-green-900">Product Category*</label>
            <select value={category} onChange={e => {
              setCategory(e.target.value);
              setProducts([{ name: "", quantity: 1, price: 0, kgPerUnit: undefined }]);
            }} className="border-2 border-green-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-green-500 text-gray-900" required>
              <option value="">Select category</option>
              <option value="animal_feed">Animal Feed</option>
              <option value="animal_medicine">Animal Medicine</option>
            </select>
          </div>
          {category && (
            <div>
              <label className="block font-semibold mb-2 text-green-900">Products*</label>
              <div className="space-y-2">
                {products.map((product, idx) => (
                  <div
                    key={idx}
                    className={
                      `relative bg-white rounded-2xl border-2 border-green-200 shadow-lg p-6 mb-6 transition-all duration-200` +
                      (products.length > 1 && idx === products.length - 1 ? ' ring-2 ring-green-400' : '')
                    }
                  >
                    <div className="absolute -top-4 left-4 bg-green-100 text-green-800 font-bold px-3 py-1 rounded-xl shadow text-xs uppercase tracking-wide">
                      {category === 'animal_medicine' ? 'Medicine Details' : 'Product Details'}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 w-full">
                    {/* Medicine fields for animal_medicine */}
                    {category === 'animal_medicine' ? (
                      <>
                        <div className="flex-1 relative min-w-[260px] flex flex-col">
                          <label className="text-xs text-green-800 font-semibold mb-1" htmlFor={`medicine-name-${idx}`}>Medicine Name*</label>
                          <input
                            id={`medicine-name-${idx}`}
                            value={product.name}
                            onChange={e => handleProductChange(idx, "name", e.target.value)}
                            className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 focus:ring-2 focus:ring-green-400 text-base"
                            placeholder="Type or select medicine"
                            required
                            autoComplete="off"
                            onFocus={() => setDropdown(idx, true)}
                            onClick={() => setDropdown(idx, true)}
                            onBlur={() => setTimeout(() => setDropdown(idx, false), 150)}
                          />
                          <span className="text-xs text-gray-500">Select an existing medicine or type a new name</span>
                          {/* Custom dropdown suggestions */}
                          {dropdownOpen[idx] && (category ? allProducts.filter(p => p.category === category).length > 0 : allProducts.length > 0) && (
                            <div className="absolute left-0 right-0 bg-white border border-green-200 rounded shadow-xl mt-2 max-h-48 overflow-y-auto text-base" style={{ top: '100%', zIndex: 50 }}>
                              {(category ? allProducts.filter(p => p.category === category) : allProducts).map((p, i) => (
                                <div
                                  key={i}
                                  className="px-4 py-2 cursor-pointer hover:bg-green-100 text-green-900"
                                  onMouseDown={() => handleProductChange(idx, "name", p.name)}
                                >
                                  {p.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Description */}
                        <div className="flex flex-col w-full">
                          <label className="text-xs text-green-800 font-semibold mb-1" htmlFor={`medicine-desc-${idx}`}>Medicine Description*</label>
                          <textarea
                            id={`medicine-desc-${idx}`}
                            placeholder="Description for medicine"
                            value={product.description || ""}
                            onChange={e => handleProductChange(idx, "description", e.target.value)}
                            className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 min-h-[40px]"
                            required
                          />
                          <span className="text-xs text-gray-500">Describe the medicine in detail</span>
                        </div>
                        {/* Good for multi-select */}
                        <div className="flex flex-col w-48">
                          <label className="text-xs text-green-800 font-bold mb-1 flex items-center gap-1">
                            Good for*
                            <span title="Select all animal types or plants this medicine is suitable for." className="ml-1 text-green-400 cursor-help">&#9432;</span>
                          </label>
                          <div className="flex flex-row gap-4 mb-1">
                            {['sheep', 'chicken', 'plant'].map(option => (
                              <label key={option} className="flex items-center gap-1 text-green-900 text-xs font-medium cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={Array.isArray(product.goodFor) && product.goodFor.includes(option)}
                                  onChange={e => {
                                    const checked = e.target.checked;
                                    let updated: string[] = Array.isArray(product.goodFor) ? [...product.goodFor] : [];
                                    if (checked) {
                                      if (!updated.includes(option)) updated.push(option);
                                    } else {
                                      updated = updated.filter(val => val !== option);
                                    }
                                    handleProductChange(idx, "goodFor", updated);
                                  }}
                                  className="accent-green-600 w-4 h-4 rounded border border-green-300 focus:ring-green-400"
                                />
                                <span className="capitalize">{option}</span>
                              </label>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">Select all that apply</span>
                        </div>
                        {/* Expiration date */}
                        <div className="flex flex-col w-44">
                          <label className="text-xs text-green-800 font-semibold mb-1">Expiration Date*</label>
                          <input
                            type="date"
                            value={product.expirationDate || ""}
                            onChange={e => handleProductChange(idx, "expirationDate", e.target.value)}
                            className="border border-green-200 rounded px-3 py-2 w-full text-gray-900"
                            required
                          />
                        </div>
                        {/* First usage date (optional) */}
                        <div className="flex flex-col w-44">
                          <label className="text-xs text-green-800 font-semibold mb-1">First Usage Date</label>
                          <input
                            type="date"
                            value={product.firstUsageDate || ""}
                            onChange={e => handleProductChange(idx, "firstUsageDate", e.target.value)}
                            className="border border-green-200 rounded px-3 py-2 w-full text-gray-900"
                          />
                          <span className="text-xs text-gray-500">Leave empty if not used yet</span>
                        </div>
                        {/* Unit, amount, and quantity */}
                        <div className="flex flex-row gap-2 w-full items-end">
                          <div className="flex flex-col w-28">
                            <label className="text-xs text-green-800 font-semibold mb-1">Amount per Unit*</label>
                            <input
                              type="number"
                              min={1}
                              placeholder="e.g. 300"
                              value={product.unitAmount || ""}
                              onChange={e => handleProductChange(idx, "unitAmount", Number(e.target.value))}
                              className="border border-green-200 rounded px-3 py-2 w-full text-gray-900"
                              required
                            />
                          </div>
                          <div className="flex flex-col w-24">
                            <label className="text-xs text-green-800 font-semibold mb-1">Unit*</label>
                            <select
                              value={product.unit || ""}
                              onChange={e => handleProductChange(idx, "unit", e.target.value)}
                              className="border border-green-200 rounded px-3 py-2 w-full text-gray-900"
                              required
                            >
                              <option value="">Select</option>
                              <option value="ml">ml</option>
                              <option value="l">L</option>
                              <option value="g">g</option>
                              <option value="kg">kg</option>
                            </select>
                          </div>
                          <div className="flex flex-col w-28">
                            <label className="text-xs text-green-800 font-semibold mb-1">Number of Units*</label>
                            <input
                              type="number"
                              min={1}
                              placeholder="e.g. 10"
                              value={product.quantity}
                              onChange={e => handleProductChange(idx, "quantity", Number(e.target.value))}
                              className="border border-green-200 rounded px-3 py-2 w-full text-gray-900"
                              required
                            />
                          </div>
                        </div>
                        {/* Usage Description */}
                        <div className="flex flex-col w-full">
                          <label className="text-xs text-green-800 font-semibold mb-1">Usage Description</label>
                          <textarea
                            value={product.usageDescription || ""}
                            onChange={e => handleProductChange(idx, "usageDescription", e.target.value)}
                            className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 min-h-[40px]"
                            placeholder="Describe how this medicine should be used, dosage, etc."
                          />
                            <span className="text-xs text-gray-500">Optional: Add instructions or notes for this medicine&apos;s usage.</span>
                        </div>
                        <div className="flex flex-row gap-2 w-full items-end">
                          <div className="flex flex-col w-36">
                            <label className="text-xs text-green-800 font-semibold mb-1">Unit Price (MAD)*</label>
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              placeholder="e.g. 250.00"
                              value={product.price}
                              onChange={e => handleProductChange(idx, "price", Number(e.target.value))}
                              className="border border-green-200 rounded px-3 py-2 w-full text-gray-900"
                              required
                            />
                            <span className="text-xs text-gray-500">Enter price per unit in Moroccan Dirham (MAD)</span>
                          </div>
                          <div className="flex flex-col w-36">
                            <label className="text-xs text-green-800 font-semibold mb-1">Total (MAD)</label>
                            <input
                              type="text"
                              value={
                                product.quantity && product.price ? (product.quantity * product.price).toFixed(2) : ""
                              }
                              className="border border-green-100 bg-gray-50 rounded px-3 py-2 w-full text-gray-900 font-semibold"
                              readOnly
                              tabIndex={-1}
                            />
                            <span className="text-xs text-gray-500">Calculated: unit price × number of units</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* ...existing code for animal_feed... */}
                        <div className="flex-1 relative min-w-[260px] flex flex-col">
                          <label className="text-xs text-green-800 font-semibold mb-1" htmlFor={`product-name-${idx}`}>Product Name*</label>
                          <input
                            id={`product-name-${idx}`}
                            value={product.name}
                            onChange={e => handleProductChange(idx, "name", e.target.value)}
                            className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 focus:ring-2 focus:ring-green-400 text-base"
                            placeholder="Type or select product"
                            required
                            autoComplete="off"
                            onFocus={() => setDropdown(idx, true)}
                            onClick={() => setDropdown(idx, true)}
                            onBlur={() => setTimeout(() => setDropdown(idx, false), 150)}
                          />
                          <span className="text-xs text-gray-500">Select an existing product or type a new name</span>
                          {/* Custom dropdown suggestions */}
                          {dropdownOpen[idx] && (category ? allProducts.filter(p => p.category === category).length > 0 : allProducts.length > 0) && (
                            <div className="absolute left-0 right-0 bg-white border border-green-200 rounded shadow-xl mt-2 max-h-48 overflow-y-auto text-base" style={{ top: '100%', zIndex: 50 }}>
                              {(category ? allProducts.filter(p => p.category === category) : allProducts).map((p, i) => (
                                <div
                                  key={i}
                                  className="px-4 py-2 cursor-pointer hover:bg-green-100 text-green-900"
                                  onMouseDown={() => handleProductChange(idx, "name", p.name)}
                                >
                                  {p.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* If new product, show description input */}
                        {product.name && isNewProduct(product.name) && (
                          <div className="flex flex-col w-64">
                            <label className="text-xs text-green-800 font-semibold mb-1" htmlFor={`product-desc-${idx}`}>Product Description*</label>
                            <input
                              id={`product-desc-${idx}`}
                              type="text"
                              placeholder="Description for new product"
                              value={product.description || ""}
                              onChange={e => handleProductChange(idx, "description", e.target.value)}
                              className="border border-green-200 rounded px-3 py-2 w-full text-gray-900"
                              required
                            />
                            <span className="text-xs text-gray-500">Describe the new product you are adding</span>
                          </div>
                        )}
                        <div className="flex flex-col w-28">
                          <label className="text-xs text-green-800 font-semibold mb-1" htmlFor={`quantity-${idx}`}>Quantity*</label>
                          <input
                            id={`quantity-${idx}`}
                            type="number"
                            min={1}
                            placeholder="e.g. 10"
                            value={product.quantity}
                            onChange={e => handleProductChange(idx, "quantity", Number(e.target.value))}
                            className="border border-green-200 rounded px-3 py-2 w-full text-gray-900"
                            required
                          />
                          <span className="text-xs text-gray-500">Enter the number of units</span>
                        </div>
                        <div className="flex flex-col w-32">
                          <label className="text-xs text-green-800 font-semibold mb-1" htmlFor={`kgperunit-${idx}`}>Kilograms per Unit*</label>
                          <input
                            id={`kgperunit-${idx}`}
                            type="number"
                            min={1}
                            step={0.01}
                            placeholder="e.g. 40"
                            value={product.kgPerUnit || ""}
                            onChange={e => handleProductChange(idx, "kgPerUnit", Number(e.target.value))}
                            className="border border-green-200 rounded px-3 py-2 w-full text-gray-900"
                            required
                          />
                          <span className="text-xs text-gray-500">Enter the weight in kilograms for each unit</span>
                        </div>
                        <div className="flex flex-row gap-2 w-full items-end">
                          <div className="flex flex-col w-36">
                            <label className="text-xs text-green-800 font-semibold mb-1" htmlFor={`price-${idx}`}>Unit Price (MAD)*</label>
                            <input
                              id={`price-${idx}`}
                              type="number"
                              min={0}
                              step={0.01}
                              placeholder="e.g. 250.00"
                              value={product.price}
                              onChange={e => handleProductChange(idx, "price", Number(e.target.value))}
                              className="border border-green-200 rounded px-3 py-2 w-full text-gray-900"
                              required
                            />
                            <span className="text-xs text-gray-500">Enter price per unit in Moroccan Dirham (MAD)</span>
                          </div>
                          <div className="flex flex-col w-36">
                            <label className="text-xs text-green-800 font-semibold mb-1">Total (MAD)</label>
                            <input
                              type="text"
                              value={
                                product.quantity && product.price ? (product.quantity * product.price).toFixed(2) : ""
                              }
                              className="border border-green-100 bg-gray-50 rounded px-3 py-2 w-full text-gray-900 font-semibold"
                              readOnly
                              tabIndex={-1}
                            />
                            <span className="text-xs text-gray-500">Calculated: unit price × number of units</span>
                          </div>
                        </div>
                        {/* Price per Kilogram (unit price ÷ kg per unit) */}
                        <div className="flex flex-col w-40">
                          <label className="text-xs text-green-800 font-semibold mb-1">Price per Kilogram (MAD)</label>
                          <input
                            type="text"
                            value={
                              product.kgPerUnit && product.price ? (product.price / product.kgPerUnit).toFixed(2) : ""
                            }
                            className="border border-green-100 bg-gray-50 rounded px-3 py-2 w-full text-gray-900"
                            readOnly
                            tabIndex={-1}
                          />
                          <span className="text-xs text-gray-500">Calculated: unit price ÷ kg per unit</span>
                        </div>
                      </>
                    )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button type="button" className="text-red-500 px-2 text-xl" onClick={() => removeProduct(idx)} disabled={products.length === 1} title="Remove product">✕</button>
                      {idx === products.length - 1 && (
                        <button type="button" className="text-green-600 px-2 text-xl" onClick={addProduct} title="Add product">＋</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Grand Total for Invoice - just above Add Invoice button */}
          <div className="flex justify-end mt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 shadow text-right">
              <div className="text-lg font-bold text-green-900">Grand Total (MAD):
                <span className="ml-4 text-2xl text-green-700">
                  {products.reduce((sum, p) => sum + (p.quantity && p.price ? p.quantity * p.price : 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
          {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
          <button type="submit" className="bg-gradient-to-tr from-green-500 to-green-700 text-white font-bold rounded-lg px-8 py-3 shadow hover:scale-105 hover:from-green-600 hover:to-green-800 transition-all duration-150 mt-2" disabled={loading}>{loading ? "Saving..." : "Add Invoice"}</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl font-extrabold text-green-800 mb-6 tracking-tight">Existing Invoices</h2>
        {loadingInvoices ? (
          <div className="text-green-600 font-semibold">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="text-gray-400">No invoices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg shadow mt-2">
              <thead className="bg-green-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 border-b font-bold text-green-900">Invoice #</th>
                  <th className="px-4 py-3 border-b font-bold text-green-900">Supplier</th>
                  <th className="px-4 py-3 border-b font-bold text-green-900">Products</th>
                  <th className="px-4 py-3 border-b font-bold text-green-900">Grand Total (MAD)</th>
                  <th className="px-4 py-3 border-b font-bold text-green-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr key={inv._id} className={idx % 2 === 0 ? "bg-white" : "bg-green-50" + " border-b hover:bg-green-100 transition-all"}>
                    <td className="px-4 py-2 font-semibold text-green-800">{inv.invoiceNumber}</td>
                    <td className="px-4 py-2">{inv.supplier?.entrepriseName || "-"}</td>
                    <td className="px-4 py-2">
                      <ul className="space-y-1">
                        {inv.products.map((p: InvoiceProduct, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="inline-block bg-green-100 text-green-800 font-semibold rounded px-2 py-0.5 text-xs">{p.name}</span>
                            <span className="inline-block bg-green-200 text-green-900 rounded px-2 py-0.5 text-xs">x{p.quantity}</span>
                            <span className="inline-block bg-green-50 text-green-700 rounded px-2 py-0.5 text-xs">{p.price} MAD</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-2 font-bold text-green-700 text-right">
                      {typeof inv.grandTotal === 'number' ? inv.grandTotal.toFixed(2) : ''}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
