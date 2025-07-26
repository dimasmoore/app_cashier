"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FiX, FiSave, FiLoader } from "react-icons/fi";

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  categoryId: string;
  supplierId?: string;
}

interface Product extends ProductFormData {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductFormData) => Promise<void>;
  product?: Product;
  categories: Category[];
  suppliers: Supplier[];
  mode: "create" | "edit";
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
  suppliers,
  mode,
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    sku: "",
    barcode: "",
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    maxStock: 0,
    categoryId: "",
    supplierId: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        name: product.name,
        description: product.description || "",
        sku: product.sku,
        barcode: product.barcode || "",
        price: product.price,
        cost: product.cost || 0,
        stock: product.stock,
        minStock: product.minStock,
        maxStock: product.maxStock || 0,
        categoryId: product.categoryId,
        supplierId: product.supplierId || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        sku: "",
        barcode: "",
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 0,
        maxStock: 0,
        categoryId: "",
        supplierId: "",
      });
    }
    setErrors({});
  }, [product, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama produk harus diisi";
    }
    if (!formData.sku.trim()) {
      newErrors.sku = "SKU harus diisi";
    }
    if (formData.price <= 0) {
      newErrors.price = "Harga harus lebih dari 0";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Kategori harus dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {mode === "create" ? "Tambah Produk Baru" : "Edit Produk"}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiX className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Product Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nama Produk *
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onValueChange={(value) => handleInputChange("name", value)}
                          placeholder="Masukkan nama produk"
                          className={`border-gray-200 dark:border-gray-600 ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                      </div>

                      {/* SKU */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          SKU *
                        </label>
                        <Input
                          type="text"
                          value={formData.sku}
                          onValueChange={(value) => handleInputChange("sku", value)}
                          placeholder="Masukkan SKU"
                          className={`border-gray-200 dark:border-gray-600 ${errors.sku ? 'border-red-500' : ''}`}
                        />
                        {errors.sku && (
                          <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
                        )}
                      </div>

                      {/* Barcode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Barcode
                        </label>
                        <Input
                          type="text"
                          value={formData.barcode}
                          onValueChange={(value) => handleInputChange("barcode", value)}
                          placeholder="Masukkan barcode"
                          className="border-gray-200 dark:border-gray-600"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Kategori *
                        </label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) => handleInputChange("categoryId", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 ${errors.categoryId ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                        >
                          <option value="">Pilih kategori</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors.categoryId && (
                          <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
                        )}
                      </div>

                      {/* Supplier */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Supplier
                        </label>
                        <select
                          value={formData.supplierId}
                          onChange={(e) => handleInputChange("supplierId", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                        >
                          <option value="">Pilih supplier</option>
                          {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Harga Jual *
                        </label>
                        <Input
                          type="number"
                          value={formData.price}
                          onValueChange={(value) => handleInputChange("price", parseFloat(value) || 0)}
                          placeholder="0"
                          className={`border-gray-200 dark:border-gray-600 ${errors.price ? 'border-red-500' : ''}`}
                        />
                        {errors.price && (
                          <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Deskripsi
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Masukkan deskripsi produk"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 resize-none"
                      />
                    </div>

                    {/* Stock Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Stok Awal
                        </label>
                        <Input
                          type="number"
                          value={formData.stock}
                          onValueChange={(value) => handleInputChange("stock", parseInt(value) || 0)}
                          placeholder="0"
                          className="border-gray-200 dark:border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Stok Minimum
                        </label>
                        <Input
                          type="number"
                          value={formData.minStock}
                          onValueChange={(value) => handleInputChange("minStock", parseInt(value) || 0)}
                          placeholder="0"
                          className="border-gray-200 dark:border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Stok Maksimum
                        </label>
                        <Input
                          type="number"
                          value={formData.maxStock || ""}
                          onValueChange={(value) => handleInputChange("maxStock", parseInt(value) || 0)}
                          placeholder="0"
                          className="border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 border-gray-200 dark:border-gray-600"
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                      >
                        {loading ? (
                          <>
                            <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <FiSave className="w-4 h-4 mr-2" />
                            {mode === "create" ? "Tambah Produk" : "Simpan Perubahan"}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
