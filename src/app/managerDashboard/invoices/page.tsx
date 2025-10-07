
"use client";



import React, { useEffect, useState } from "react";

interface InvoiceProduct {
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
  units?: MedicineUnit[]; // Individual unit tracking for medicines
}

interface MedicineUnit {
  id: string;
  expirationDate: string;
  firstUsageDate?: string;
  customId: string; // ID to write on the medicine box
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

  const [supplierId, setSupplierId] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<InvoiceProduct[]>([{ name: "", quantity: 1, price: 0, kgPerUnit: undefined }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  interface Invoice {
    _id: string;
    invoiceNumber: number;
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
  
  // Edit mode states
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch suppliers and invoices on mount
  useEffect(() => {
    fetch("/api/suppliers")
      .then(res => res.json())
      .then(data => setSuppliers(data.suppliers || []));
    fetchInvoices();
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setAllProducts(data.products || []));
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const startEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setSupplierId(invoice.supplier?._id || "");
    setInvoiceDate(invoice.invoiceDate);
    setCategory(invoice.products[0]?.category || "");
    setProducts(invoice.products.map(p => ({
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      description: p.description,
      category: p.category,
      unit: p.unit,
      kgPerUnit: p.kgPerUnit,
      units: p.units || [],
      goodFor: p.goodFor,
      usageDescription: p.usageDescription
    })));
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditingInvoice(null);
    setShowEditModal(false);
    // Reset form
    setSupplierId("");
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setCategory("");
    setProducts([{ name: "", quantity: 1, price: 0, kgPerUnit: undefined }]);
    setError("");
    setSuccess("");
  };

  const updateInvoice = async () => {
    if (!editingInvoice) return;
    
    try {
      setLoading(true);
      setError("");
      
      const res = await fetch("/api/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: editingInvoice._id,
          supplierId,
          products,
          date: invoiceDate
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess("Invoice updated successfully!");
        await fetchInvoices();
        setTimeout(() => {
          cancelEdit();
        }, 1500);
      } else {
        setError(data.error || "Failed to update invoice");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const startDeleteInvoice = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/invoices?id=${invoiceToDelete._id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setSuccess("Invoice deleted successfully!");
        await fetchInvoices();
        setShowDeleteModal(false);
        setInvoiceToDelete(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete invoice");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  const handleProductChange = (idx: number, field: keyof InvoiceProduct, value: string | number | string[] | MedicineUnit[]) => {
    console.log(`Product change - index: ${idx}, field: ${field}, value: ${value}, category: ${category}`);
    
    setProducts(products => {
      const updated = [...products];
      updated[idx] = { ...updated[idx], [field]: value };
      
      // If quantity changes for medicine, update units array
      if (field === 'quantity' && category === 'animal_medicine') {
        console.log(`Medicine quantity changed to ${value}, current units: ${updated[idx].units?.length || 0}`);
        
        const newQuantity = value as number;
        const currentUnits = updated[idx].units || [];
        
        if (newQuantity > currentUnits.length) {
          // Add new units
          const newUnits = [...currentUnits];
          for (let j = currentUnits.length; j < newQuantity; j++) {
            // Generate custom ID based on medicine name
            const medicineName = updated[idx].name || 'Medicine';
            const sanitizedName = medicineName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
            const customId = `${sanitizedName}-${String(j + 1).padStart(3, '0')}`;
            
            newUnits.push({
              id: `${Date.now()}-${j}-${Math.random()}`,
              customId: customId,
              expirationDate: '',
              firstUsageDate: ''
            });
          }
          updated[idx].units = newUnits;
        } else if (newQuantity < currentUnits.length) {
          // Remove excess units
          updated[idx].units = currentUnits.slice(0, newQuantity);
        } else if (newQuantity > 0 && currentUnits.length === 0) {
          // Initialize units if none exist
          const newUnits = [];
          for (let j = 0; j < newQuantity; j++) {
            const medicineName = updated[idx].name || 'Medicine';
            const sanitizedName = medicineName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
            const customId = `${sanitizedName}-${String(j + 1).padStart(3, '0')}`;
            
            newUnits.push({
              id: `${Date.now()}-${j}-${Math.random()}`,
              customId: customId,
              expirationDate: '',
              firstUsageDate: ''
            });
          }
          updated[idx].units = newUnits;
        }
      }
      
      // If medicine name changes, update all unit custom IDs
      if (field === 'name' && category === 'animal_medicine' && updated[idx].units) {
        const medicineName = value as string;
        const sanitizedName = medicineName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        updated[idx].units = updated[idx].units.map((unit, unitIdx) => ({
          ...unit,
          customId: `${sanitizedName}-${String(unitIdx + 1).padStart(3, '0')}`
        }));
      }
      
      return updated;
    });
  };

  // Handle individual medicine unit changes
  const handleUnitChange = (productIdx: number, unitIdx: number, field: keyof MedicineUnit, value: string) => {
    console.log(`Updating unit ${unitIdx} of product ${productIdx}, field: ${field}, value: ${value}`);
    
    setProducts(products => {
      const updated = [...products];
      
      // Initialize units array if it doesn't exist
      if (!updated[productIdx].units) {
        updated[productIdx].units = [];
        console.log(`Initialized empty units array for product ${productIdx}`);
      }
      
      // Ensure the units array is long enough
      while (updated[productIdx].units!.length <= unitIdx) {
        const medicineName = updated[productIdx].name || 'Medicine';
        const sanitizedName = medicineName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        const customId = `${sanitizedName}-${String(updated[productIdx].units!.length + 1).padStart(3, '0')}`;
        
        updated[productIdx].units!.push({
          id: `${Date.now()}-${updated[productIdx].units!.length}`,
          customId: customId,
          expirationDate: '',
          firstUsageDate: ''
        });
        console.log(`Added new unit to product ${productIdx}: ${customId}`);
      }
      
      // Update the specific unit field
      updated[productIdx].units![unitIdx] = { 
        ...updated[productIdx].units![unitIdx], 
        [field]: value 
      };
      
      console.log(`Updated product ${productIdx} units:`, updated[productIdx].units);
      
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
    const newProduct = category === 'animal_medicine' 
      ? { 
          name: "", 
          quantity: 1, 
          price: 0, 
          kgPerUnit: undefined,
          units: [{
            id: `${Date.now()}-0`,
            customId: 'Medicine-001',
            expirationDate: '',
            firstUsageDate: ''
          }]
        }
      : { name: "", quantity: 1, price: 0, kgPerUnit: undefined };
      
    setProducts([...products, newProduct]);
    setDropdownOpen(arr => [...arr, false]);
  };
  const removeProduct = (idx: number) => {
    setProducts(products => products.length > 1 ? products.filter((_, i) => i !== idx) : products);
    setDropdownOpen(arr => arr.length > 1 ? arr.filter((_, i) => i !== idx) : arr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingInvoice) {
      await updateInvoice();
    } else {
      // Original invoice creation logic
      setError(""); setSuccess("");
      
      console.log("=== FORM SUBMISSION ===");
      console.log("Category:", category);
      console.log("Products before submission:", products);
    
    if (category === 'animal_medicine') {
      products.forEach((product, idx) => {
        console.log(`Product ${idx} (${product.name}):`, {
          quantity: product.quantity,
          units: product.units,
          unitsLength: product.units?.length || 0
        });
      });
    }
    console.log("======================");
    
    if (!supplierId) return setError("Supplier is required");
    if (products.some(p => !p.name || p.quantity <= 0 || p.price < 0)) return setError("All products must have a name, quantity > 0, and price >= 0");
    
    // Additional validation for medicine products
    if (category === 'animal_medicine') {
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (product.units && product.units.length > 0) {
          for (let j = 0; j < product.units.length; j++) {
            const unit = product.units[j];
            if (!unit.customId || !unit.customId.trim()) {
              return setError(`Product "${product.name}": Unit ${j + 1} is missing a Box ID`);
            }
            if (!unit.expirationDate) {
              return setError(`Product "${product.name}": Unit ${j + 1} (${unit.customId}) is missing an expiration date`);
            }
          }
        }
      }
    }
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
        let productPayload: Partial<InvoiceProduct> = { name: p.name, category, description: p.description };
        if (category === 'animal_medicine') {
          productPayload = {
            name: p.name,
            category,
            description: p.description,
            goodFor: p.goodFor,
            expirationDate: p.expirationDate,
            firstUsageDate: p.firstUsageDate,
            usageDescription: p.usageDescription,
          };
        }
        const resp = await fetch("/api/products", {
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
    const invoicePayload = { 
      supplierId, 
      products: products.map(p => ({ ...p, category })), 
      date: invoiceDate 
    };
    
    // Debug: Log the products being sent to see if units are included
    console.log('Submitting invoice with products:', invoicePayload.products);
    console.log('Raw products before mapping:', products);
    
    // Extra debug for medicine products
    invoicePayload.products.forEach((product, index) => {
      if (product.category === 'animal_medicine') {
        console.log(`Medicine ${index + 1} (${product.name}):`, {
          quantity: product.quantity,
          units: product.units,
          unitsLength: product.units?.length || 0,
          rawProduct: products[index]
        });
      }
    });
    
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoicePayload),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      // Enhanced success message with stock updates
      let successMessage = "Invoice added successfully!";
      if (data.stockUpdates && data.stockUpdates.length > 0) {
        successMessage += "\n\nStock Updates:\n" + data.stockUpdates.join("\n");
      }
      setSuccess(successMessage);
      setSupplierId("");
  setProducts([{ name: "", quantity: 1, price: 0 }]);
  setInvoiceDate(new Date().toISOString().slice(0, 10));
      fetchInvoices();
    } else {
      setError(data.error || "Failed to add invoice");
    }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10">
      <div className="bg-gradient-to-tr from-green-50 to-green-100 rounded-2xl shadow-lg p-8 border border-green-200">
        <h1 className="text-3xl font-extrabold text-green-800 mb-6 tracking-tight">
          {editingInvoice ? 'Edit Invoice' : 'Add New Invoice'}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              const newCategory = e.target.value;
              setCategory(newCategory);
              
              // Initialize products based on category
              if (newCategory === 'animal_medicine') {
                setProducts([{ 
                  name: "", 
                  quantity: 1, 
                  price: 0, 
                  kgPerUnit: undefined,
                  units: [{
                    id: `${Date.now()}-0`,
                    customId: 'Medicine-001',
                    expirationDate: '',
                    firstUsageDate: ''
                  }]
                }]);
              } else {
                setProducts([{ name: "", quantity: 1, price: 0, kgPerUnit: undefined }]);
              }
            }} className="border-2 border-green-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-green-500 text-gray-900" required>
              <option value="">Select category</option>
              <optgroup label="Animal Products">
                <option value="animal_feed">Animal Feed</option>
                <option value="animal_medicine">Animal Medicine</option>
              </optgroup>
              <optgroup label="Plant Products">
                <option value="plant_seeds">Plant Seeds</option>
                <option value="plant_seedlings">Plant Seedlings</option>
                <option value="plant_nutrition">Plant Nutrition</option>
                <option value="plant_medicine">Plant Medicine</option>
              </optgroup>
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
                      <div className="col-span-full">
                        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl p-4 md:p-6 mt-4 shadow-lg">
                          {/* Medicine Header */}
                          <div className="flex items-center mb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg flex items-center justify-center mr-3 md:mr-4">
                              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"></path>
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg md:text-xl font-bold text-green-800">Veterinary Medicine</h3>
                              <p className="text-green-600 text-xs md:text-sm">Configure medicine information and tracking</p>
                            </div>
                          </div>

                          {/* Medicine Form Fields */}
                          <div className="space-y-4 md:space-y-6">
                            {/* Medicine Name */}
                            <div className="bg-white rounded-xl p-3 md:p-4 border border-green-200 shadow-sm relative">
                              <label className="block text-sm font-bold text-green-800 mb-2" htmlFor={`medicine-name-${idx}`}>
                                Medicine Name*
                              </label>
                              <input
                                id={`medicine-name-${idx}`}
                                value={product.name}
                                onChange={e => handleProductChange(idx, "name", e.target.value)}
                                className="w-full border-2 border-green-200 rounded-lg px-3 md:px-4 py-2 md:py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                                placeholder="e.g., Antibiotic Solution"
                                required
                                autoComplete="off"
                                onFocus={() => setDropdown(idx, true)}
                                onClick={() => setDropdown(idx, true)}
                                onBlur={() => setTimeout(() => setDropdown(idx, false), 150)}
                              />
                              <p className="text-xs text-green-600 mt-1">Type medicine name or select from existing</p>
                              
                              {/* Custom dropdown suggestions */}
                              {dropdownOpen[idx] && (category ? allProducts.filter(p => p.category === category).length > 0 : allProducts.length > 0) && (
                                <div className="absolute left-3 right-3 md:left-4 md:right-4 bg-white border-2 border-green-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto z-50">
                                  {(category ? allProducts.filter(p => p.category === category) : allProducts).map((p, i) => (
                                    <div
                                      key={i}
                                      className="px-3 md:px-4 py-2 cursor-pointer hover:bg-green-50 text-green-900 border-b border-green-100 last:border-b-0"
                                      onMouseDown={() => handleProductChange(idx, "name", p.name)}
                                    >
                                      {p.name}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-xl p-3 md:p-4 border border-green-200 shadow-sm">
                              <label className="block text-sm font-bold text-green-800 mb-2" htmlFor={`medicine-desc-${idx}`}>
                                Medicine Description*
                              </label>
                              <textarea
                                id={`medicine-desc-${idx}`}
                                value={product.description || ""}
                                onChange={e => handleProductChange(idx, "description", e.target.value)}
                                className="w-full border-2 border-green-200 rounded-lg px-3 md:px-4 py-2 md:py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 resize-none"
                                placeholder="e.g., Broad-spectrum antibiotic for treating bacterial infections"
                                rows={3}
                                required
                              />
                              <p className="text-xs text-green-600 mt-1">Detailed description of the medicine</p>
                            </div>

                            {/* Good For Animals */}
                            <div className="bg-white rounded-xl p-3 md:p-4 border border-green-200 shadow-sm">
                              <label className="block text-sm font-bold text-green-800 mb-3">
                                Suitable For Animals*
                                <span title="Select all animal types this medicine is suitable for" className="ml-1 text-green-400 cursor-help">ℹ</span>
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                                {['sheep', 'chicken', 'quail'].map(option => (
                                  <label key={option} className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 cursor-pointer group">
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
                                      className="w-4 h-4 md:w-5 md:h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                                    />
                                    <div className="flex items-center gap-1 md:gap-2">
                                      <span className="text-lg md:text-xl">
                                        {option === 'sheep' ? '🐑' : option === 'chicken' ? '🐔' : '🐦'}
                                      </span>
                                      <span className="font-medium text-gray-700 group-hover:text-green-700 capitalize text-sm md:text-base">
                                        {option}
                                      </span>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* Quantity and Price */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                              <div className="bg-white rounded-xl p-3 md:p-4 border border-green-200 shadow-sm">
                                <label className="block text-sm font-bold text-green-800 mb-2">Number of Units*</label>
                                <input
                                  type="number"
                                  min={1}
                                  placeholder="e.g., 5"
                                  value={product.quantity}
                                  onChange={e => handleProductChange(idx, "quantity", Number(e.target.value))}
                                  className="w-full border-2 border-green-200 rounded-lg px-3 md:px-4 py-2 md:py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                                  required
                                />
                                <p className="text-xs text-green-600 mt-1">Total number of medicine units/boxes</p>
                              </div>
                              <div className="bg-white rounded-xl p-3 md:p-4 border border-green-200 shadow-sm">
                                <label className="block text-sm font-bold text-green-800 mb-2">Unit Price (MAD)*</label>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  placeholder="e.g., 45.50"
                                  value={product.price}
                                  onChange={e => handleProductChange(idx, "price", Number(e.target.value))}
                                  className="w-full border-2 border-green-200 rounded-lg px-3 md:px-4 py-2 md:py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                                  required
                                />
                                <p className="text-xs text-green-600 mt-1">Price per unit in Moroccan Dirham</p>
                              </div>
                            </div>

                            {/* Total Price Display */}
                            {product.quantity && product.price && (
                              <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-3 md:p-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-base md:text-lg font-bold text-green-800">Total Cost:</span>
                                  <span className="text-xl md:text-2xl font-bold text-green-700">
                                    {(product.quantity * product.price).toFixed(2)} MAD
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Individual Unit Tracking */}
                            {product.quantity > 0 && (
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3 md:p-4">
                                <div className="flex items-center mb-4">
                                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                  </div>
                                  <h4 className="text-sm md:text-base font-bold text-green-800">Individual Unit Tracking</h4>
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {Array.from({ length: product.quantity }, (_, unitIdx) => {
                                    // Generate custom ID based on medicine name
                                    const medicineName = product.name || 'Medicine';
                                    const sanitizedName = medicineName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
                                    const defaultCustomId = `${sanitizedName}-${String(unitIdx + 1).padStart(3, '0')}`;
                                    
                    const unit = product.units?.[unitIdx] || {
                      id: `${Date.now()}-${unitIdx}`,
                      customId: defaultCustomId,
                      expirationDate: '',
                      firstUsageDate: ''
                    };
                    
                    return (
                                      <div key={unit.id} className="bg-white rounded-lg p-3 border-2 border-green-200 shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                          <div className="flex flex-col">
                                            <label className="text-xs font-semibold text-green-700 mb-1">Box ID*</label>
                                            <input
                                              type="text"
                                              value={unit.customId}
                                              onChange={e => handleUnitChange(idx, unitIdx, 'customId', e.target.value)}
                                              className="border-2 border-green-200 rounded px-2 py-1 text-xs text-gray-900 focus:border-green-400 focus:ring-1 focus:ring-green-200"
                                              placeholder="e.g. Antibiotic-001"
                                              required
                                            />
                                            <span className="text-xs text-green-600 mt-1">Write this on the box</span>
                                          </div>
                                          <div className="flex flex-col">
                                            <label className="text-xs font-semibold text-green-700 mb-1">Expiration Date*</label>
                                            <input
                                              type="date"
                                              value={unit.expirationDate}
                                              onChange={e => handleUnitChange(idx, unitIdx, 'expirationDate', e.target.value)}
                                              className="border-2 border-green-200 rounded px-2 py-1 text-xs text-gray-900 focus:border-green-400 focus:ring-1 focus:ring-green-200"
                                              required
                                            />
                                          </div>
                                          <div className="flex flex-col">
                                            <label className="text-xs font-semibold text-green-700 mb-1">First Usage Date</label>
                                            <input
                                              type="date"
                                              value={unit.firstUsageDate || ''}
                                              onChange={e => handleUnitChange(idx, unitIdx, 'firstUsageDate', e.target.value)}
                                              className="border-2 border-green-200 rounded px-2 py-1 text-xs text-gray-900 focus:border-green-400 focus:ring-1 focus:ring-green-200"
                                            />
                                            <span className="text-xs text-green-600 mt-1">Leave empty if unused</span>
                                          </div>
                                          <div className="flex items-center justify-center">
                                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-300">
                                              Unit #{unitIdx + 1}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Usage Description */}
                            <div className="bg-white rounded-xl p-3 md:p-4 border border-green-200 shadow-sm">
                              <label className="block text-sm font-bold text-green-800 mb-2">
                                Usage Instructions
                                <span className="text-xs font-normal text-gray-500 ml-2">(Optional)</span>
                              </label>
                              <textarea
                                value={product.usageDescription || ""}
                                onChange={e => handleProductChange(idx, "usageDescription", e.target.value)}
                                className="w-full border-2 border-green-200 rounded-lg px-3 md:px-4 py-2 md:py-3 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 resize-none"
                                placeholder="e.g., Administer 2ml per 10kg body weight, twice daily for 5 days"
                                rows={3}
                              />
                              <p className="text-xs text-green-600 mt-1">Add dosage instructions and usage notes</p>
                            </div>
                          </div>
                        </div>
                      </div>
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
          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-800">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="flex-1">
                  <div className="font-bold text-green-800 mb-2">Success!</div>
                  <div className="whitespace-pre-line text-sm">{success}</div>
                </div>
              </div>
            </div>
          )}
          <button type="submit" className="bg-gradient-to-tr from-green-500 to-green-700 text-white font-bold rounded-lg px-8 py-3 shadow hover:scale-105 hover:from-green-600 hover:to-green-800 transition-all duration-150 mt-2" disabled={loading}>
            {loading ? "Saving..." : editingInvoice ? "Update Invoice" : "Add Invoice"}
          </button>
          {editingInvoice && (
            <button 
              type="button" 
              onClick={cancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg px-8 py-3 shadow transition-all duration-150"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl font-extrabold text-green-800 mb-6 tracking-tight">Existing Invoices</h2>
        {loadingInvoices ? (
          <div className="text-green-600 font-semibold">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="text-gray-400">No invoices found.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg shadow mt-2">
                <thead className="bg-green-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 border-b font-bold text-green-900">Invoice #</th>
                    <th className="px-4 py-3 border-b font-bold text-green-900">Supplier</th>
                    <th className="px-4 py-3 border-b font-bold text-green-900">Products</th>
                    <th className="px-4 py-3 border-b font-bold text-green-900">Grand Total (MAD)</th>
                    <th className="px-4 py-3 border-b font-bold text-green-900">Date</th>
                    <th className="px-4 py-3 border-b font-bold text-green-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, idx) => (
                    <tr key={inv._id} className={idx % 2 === 0 ? "bg-white" : "bg-green-50" + " border-b hover:bg-green-100 transition-all"}>
                      <td className="px-4 py-2 font-semibold text-green-800">{inv.invoiceNumber}</td>
                      <td className="px-4 py-2 text-gray-900 font-medium">{inv.supplier?.entrepriseName || "-"}</td>
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
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditInvoice(inv)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                            title="Edit Invoice"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => startDeleteInvoice(inv)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                            title="Delete Invoice"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-6">
              {invoices.map((inv) => (
                <div key={inv._id} className="bg-gradient-to-br from-white to-green-50 border-2 border-green-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                  {/* Header with gradient background */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-white text-lg tracking-wide">#{inv.invoiceNumber}</h3>
                        <p className="text-green-100 text-sm opacity-90">{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : "-"}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-white drop-shadow">
                          {typeof inv.grandTotal === 'number' ? inv.grandTotal.toFixed(2) : ''} 
                        </div>
                        <div className="text-green-100 text-sm font-medium">MAD</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Supplier Section */}
                    <div className="mb-6">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <div className="text-sm font-bold text-green-800 uppercase tracking-wider">Supplier</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
                        <div className="text-gray-900 font-semibold">{inv.supplier?.entrepriseName || "-"}</div>
                      </div>
                    </div>

                    {/* Products Section */}
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                        <div className="text-sm font-bold text-green-800 uppercase tracking-wider">Products</div>
                        <div className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                          {inv.products.length} item{inv.products.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {inv.products.map((p: InvoiceProduct, i: number) => (
                          <div key={i} className="bg-gradient-to-r from-white to-green-25 rounded-xl p-4 border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div className="font-bold text-green-800 text-base mr-3">{p.name}</div>
                                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-semibold">
                                    x{p.quantity}
                                  </div>
                                </div>
                                {p.description && (
                                  <div className="text-gray-600 text-sm leading-relaxed">{p.description}</div>
                                )}
                                {p.category && (
                                  <div className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium mt-2">
                                    {p.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-lg font-bold text-green-700">{p.price}</div>
                                <div className="text-xs text-green-600 font-medium">MAD/unit</div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Total: {(p.quantity * p.price).toFixed(2)} MAD
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Summary at bottom */}
                    <div className="mt-6 pt-4 border-t border-green-200">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-green-800 font-semibold">Invoice Total</div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-700">
                            {typeof inv.grandTotal === 'number' ? inv.grandTotal.toFixed(2) : ''} MAD
                          </div>
                          <div className="text-xs text-gray-500">
                            {inv.products.length} product{inv.products.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      {/* Action buttons for mobile */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => startEditInvoice(inv)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Edit Invoice
                        </button>
                        <button
                          onClick={() => startDeleteInvoice(inv)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && invoiceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Invoice</h3>
                <p className="text-gray-600 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete invoice <strong>#{invoiceToDelete.invoiceNumber}</strong>?
              </p>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-600">
                  Supplier: {invoiceToDelete.supplier?.entrepriseName || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Total: {typeof invoiceToDelete.grandTotal === 'number' ? invoiceToDelete.grandTotal.toFixed(2) : '0.00'} MAD
                </p>
                <p className="text-sm text-gray-600">
                  Products: {invoiceToDelete.products.length}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteInvoice}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
