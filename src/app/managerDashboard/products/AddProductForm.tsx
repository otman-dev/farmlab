"use client";
import React, { useState } from "react";


interface ProductForm {
  category: "animal_feed" | "animal_medicine" | "plant_seeds" | "plant_seedlings" | "plant_nutrition" | "plant_medicine" | "";
  name: string;
  description: string;
  kgPerUnit: string; // string for form input, will convert to number
  // Plant-specific fields
  seedType: string;
  plantingInstructions: string;
  harvestTime: string;
  growthConditions: string;
  unit: string;
  amountPerUnit: string;
  // Plant seeds weight-based option
  unitType: "weight" | "count" | ""; // For plant seeds: weight-based or count-based
  kgPerPackage: string; // For weight-based plant seeds
}

interface AddProductFormProps {
  onProductAdded?: () => void;
  editingProduct?: any; // Product to edit
}

export default function AddProductForm({ onProductAdded, editingProduct }: AddProductFormProps) {
  const [form, setForm] = useState<ProductForm>(() => {
    if (editingProduct) {
      return {
        category: editingProduct.category || "",
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        kgPerUnit: editingProduct.kgPerUnit ? editingProduct.kgPerUnit.toString() : "",
        seedType: editingProduct.seedType || "",
        plantingInstructions: editingProduct.plantingInstructions || "",
        harvestTime: editingProduct.harvestTime || "",
        growthConditions: editingProduct.growthConditions || "",
        unit: editingProduct.unit || "",
        amountPerUnit: editingProduct.amountPerUnit ? editingProduct.amountPerUnit.toString() : "",
        unitType: editingProduct.unitType || "",
        kgPerPackage: editingProduct.kgPerUnit && editingProduct.unitType === 'weight' ? editingProduct.kgPerUnit.toString() : ""
      };
    }
    return {
      category: "", 
      name: "", 
      description: "", 
      kgPerUnit: "",
      seedType: "",
      plantingInstructions: "",
      harvestTime: "",
      growthConditions: "",
      unit: "",
      amountPerUnit: "",
      unitType: "",
      kgPerPackage: ""
    };
  });
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
    
    // Validate plant seeds - check if weight-based or count-based
    if (form.category === "plant_seeds") {
      if (!form.unitType.trim()) return setError("Please specify whether this is weight-based or count-based for plant seeds");
      
      if (form.unitType === "weight") {
        if (!form.kgPerPackage.trim()) return setError("Weight per package is required for weight-based plant seeds");
        const kgValue = parseFloat(form.kgPerPackage);
        if (isNaN(kgValue) || kgValue <= 0) return setError("Weight per package must be a positive number");
      } else if (form.unitType === "count") {
        if (!form.unit.trim()) return setError("Unit type is required for count-based plant seeds");
      }
    }
    
    // Validate unit for other plant products
    if (["plant_seedlings", "plant_nutrition", "plant_medicine"].includes(form.category)) {
      if (!form.unit.trim()) return setError("Unit type is required for plant products");
    }
    
    setLoading(true);
    
    // Prepare payload
    const payload: any = {
      category: form.category,
      name: form.name.trim(),
      description: form.description.trim()
    };
    
    // Add category-specific fields
    if (form.category === "animal_feed") {
      payload.kgPerUnit = parseFloat(form.kgPerUnit);
    }
    
    // Handle plant seeds with weight-based or count-based options
    if (form.category === "plant_seeds") {
      payload.unitType = form.unitType;
      
      if (form.unitType === "weight") {
        // Weight-based: treat like animal feed
        payload.kgPerUnit = parseFloat(form.kgPerPackage);
        payload.unit = "bag"; // Default unit for weight-based
      } else if (form.unitType === "count") {
        // Count-based: traditional seed count
        payload.unit = form.unit.trim();
        if (form.amountPerUnit.trim()) {
          payload.amountPerUnit = parseFloat(form.amountPerUnit);
        }
      }
      
      // Add seed-specific fields
      if (form.seedType.trim()) payload.seedType = form.seedType.trim();
      if (form.harvestTime.trim()) payload.harvestTime = form.harvestTime.trim();
      if (form.growthConditions.trim()) payload.growthConditions = form.growthConditions.trim();
      if (form.plantingInstructions.trim()) payload.plantingInstructions = form.plantingInstructions.trim();
    }
    
    if (["plant_seedlings", "plant_nutrition", "plant_medicine"].includes(form.category)) {
      payload.unit = form.unit.trim();
      if (form.amountPerUnit.trim()) {
        payload.amountPerUnit = parseFloat(form.amountPerUnit);
      }
      if (form.plantingInstructions.trim()) {
        payload.plantingInstructions = form.plantingInstructions.trim();
      }
    }
    
    if (form.category === "plant_seedlings") {
      if (form.seedType.trim()) payload.seedType = form.seedType.trim();
      if (form.harvestTime.trim()) payload.harvestTime = form.harvestTime.trim();
      if (form.growthConditions.trim()) payload.growthConditions = form.growthConditions.trim();
    }
    
    // Add ID for editing
    if (editingProduct) {
      payload.id = editingProduct._id;
    }
    
    const res = await fetch("/api/products", {
      method: editingProduct ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess(editingProduct ? "Product updated successfully!" : "Product added successfully!");
      setForm({
        category: "", 
        name: "", 
        description: "", 
        kgPerUnit: "",
        seedType: "",
        plantingInstructions: "",
        harvestTime: "",
        growthConditions: "",
        unit: "",
        amountPerUnit: "",
        unitType: "",
        kgPerPackage: ""
      });
      if (onProductAdded) {
        onProductAdded(); // Refresh the products list
      }
    } else {
      setError(data.error || "Failed to add product");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-extrabold text-green-800 mb-6 tracking-tight">
        {editingProduct ? 'Edit Product' : 'Add Product'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block font-semibold mb-1 text-green-900">Category*</label>
          <select name="category" value={form.category} onChange={handleChange} className="border-2 border-green-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-green-500 text-gray-900" required>
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
            {form.category === "plant_seeds" && (
              <>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Packaging Type*</label>
                  <select name="unitType" value={form.unitType} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" required>
                    <option value="">Select packaging type</option>
                    <option value="weight">Weight-based (kg packages)</option>
                    <option value="count">Count-based (seed quantity)</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">
                    Weight-based: For bulk seeds sold by weight (1kg, 2kg bags)<br/>
                    Count-based: For seeds sold by quantity (50 seeds per packet)
                  </p>
                </div>
                
                {form.unitType === "weight" && (
                  <div>
                    <label className="block font-semibold mb-1 text-green-900">Weight per Package*</label>
                    <div className="relative">
                      <input 
                        name="kgPerPackage" 
                        type="number" 
                        step="0.01" 
                        min="0.01" 
                        value={form.kgPerPackage} 
                        onChange={handleChange} 
                        className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 pr-12" 
                        placeholder="e.g., 1, 2, 5"
                        required 
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">kg</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Weight in kilograms per package of seeds</p>
                  </div>
                )}
                
                {form.unitType === "count" && (
                  <>
                    <div>
                      <label className="block font-semibold mb-1 text-green-900">Unit Type*</label>
                      <select name="unit" value={form.unit} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" required>
                        <option value="">Select unit</option>
                        <option value="packet">Packet</option>
                        <option value="bag">Bag</option>
                        <option value="tray">Tray</option>
                        <option value="pot">Pot</option>
                        <option value="piece">Piece</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-green-900">Seeds per Unit</label>
                      <input name="amountPerUnit" type="number" step="1" min="1" value={form.amountPerUnit} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" placeholder="e.g., 50 seeds" />
                      <p className="text-xs text-gray-600 mt-1">Number of seeds per unit</p>
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Seed Type</label>
                  <input name="seedType" value={form.seedType} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" placeholder="e.g., Heirloom, Hybrid, Open-pollinated" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Planting Instructions</label>
                  <textarea name="plantingInstructions" value={form.plantingInstructions} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 min-h-[60px]" placeholder="Depth, spacing, soil requirements..." />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Expected Harvest Time</label>
                  <input name="harvestTime" value={form.harvestTime} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" placeholder="e.g., 60-80 days, 3-4 months" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Growth Conditions</label>
                  <textarea name="growthConditions" value={form.growthConditions} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 min-h-[60px]" placeholder="Sunlight, temperature, water requirements..." />
                </div>
              </>
            )}
            {form.category === "plant_seedlings" && (
              <>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Unit Type*</label>
                  <select name="unit" value={form.unit} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" required>
                    <option value="">Select unit</option>
                    <option value="packet">Packet</option>
                    <option value="bag">Bag</option>
                    <option value="tray">Tray</option>
                    <option value="pot">Pot</option>
                    <option value="piece">Piece</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Seedlings per Unit</label>
                  <input name="amountPerUnit" type="number" step="1" min="1" value={form.amountPerUnit} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" placeholder="e.g., 12 seedlings" />
                  <p className="text-xs text-gray-600 mt-1">Number of seedlings per unit</p>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Seedling Type</label>
                  <input name="seedType" value={form.seedType} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" placeholder="e.g., Vegetable, Flower, Herb" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Planting Instructions</label>
                  <textarea name="plantingInstructions" value={form.plantingInstructions} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 min-h-[60px]" placeholder="Transplanting instructions, spacing, care..." />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Expected Harvest Time</label>
                  <input name="harvestTime" value={form.harvestTime} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" placeholder="e.g., 30-45 days after transplant" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Growth Conditions</label>
                  <textarea name="growthConditions" value={form.growthConditions} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 min-h-[60px]" placeholder="Sunlight, temperature, water requirements..." />
                </div>
              </>
            )}
            {(form.category === "plant_nutrition" || form.category === "plant_medicine") && (
              <>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Unit Type*</label>
                  <select name="unit" value={form.unit} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" required>
                    <option value="">Select unit</option>
                    <option value="bottle">Bottle</option>
                    <option value="bag">Bag</option>
                    <option value="packet">Packet</option>
                    <option value="container">Container</option>
                    <option value="kg">Kilogram</option>
                    <option value="liter">Liter</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Amount per Unit</label>
                  <input name="amountPerUnit" type="number" step="0.1" min="0.1" value={form.amountPerUnit} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900" placeholder="e.g., 500ml, 1kg" />
                  <p className="text-xs text-gray-600 mt-1">Amount per unit (ml, grams, etc.)</p>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-green-900">Usage Instructions</label>
                  <textarea name="plantingInstructions" value={form.plantingInstructions} onChange={handleChange} className="border border-green-200 rounded px-3 py-2 w-full text-gray-900 min-h-[60px]" placeholder="Application method, dosage, frequency..." />
                </div>
              </>
            )}
          </>
        )}
        {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
        <button type="submit" className="bg-gradient-to-tr from-green-500 to-green-700 text-white font-bold rounded-lg px-8 py-3 shadow hover:scale-105 hover:from-green-600 hover:to-green-800 transition-all duration-150 mt-2" disabled={loading || !form.category}>
          {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
}

