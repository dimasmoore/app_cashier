"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FiX, FiSave, FiLoader, FiPlus, FiMinus, FiEdit3 } from "react-icons/fi";

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
}

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adjustment: {
    productId: string;
    type: "IN" | "OUT" | "ADJUSTMENT";
    quantity: number;
    reason: string;
    notes?: string;
  }) => Promise<void>;
  product?: Product;
}

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  onSave,
  product,
}: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setAdjustmentType("IN");
    setQuantity(0);
    setReason("");
    setNotes("");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (quantity <= 0) {
      newErrors.quantity = "Jumlah harus lebih dari 0";
    }

    if (adjustmentType === "OUT" && product && quantity > product.stock) {
      newErrors.quantity = "Jumlah tidak boleh melebihi stok yang tersedia";
    }

    if (!reason.trim()) {
      newErrors.reason = "Alasan harus diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !validateForm()) return;

    setLoading(true);
    try {
      await onSave({
        productId: product.id,
        type: adjustmentType,
        quantity,
        reason,
        notes: notes.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adjusting stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNewStock = () => {
    if (!product) return 0;
    
    switch (adjustmentType) {
      case "IN":
        return product.stock + quantity;
      case "OUT":
        return Math.max(0, product.stock - quantity);
      case "ADJUSTMENT":
        return quantity;
      default:
        return product.stock;
    }
  };

  const getAdjustmentTypeLabel = (type: "IN" | "OUT" | "ADJUSTMENT") => {
    switch (type) {
      case "IN":
        return "Tambah Stok";
      case "OUT":
        return "Kurangi Stok";
      case "ADJUSTMENT":
        return "Sesuaikan Stok";
      default:
        return "";
    }
  };

  const getAdjustmentTypeIcon = (type: "IN" | "OUT" | "ADJUSTMENT") => {
    switch (type) {
      case "IN":
        return <FiPlus className="w-4 h-4" />;
      case "OUT":
        return <FiMinus className="w-4 h-4" />;
      case "ADJUSTMENT":
        return <FiEdit3 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getAdjustmentTypeColor = (type: "IN" | "OUT" | "ADJUSTMENT") => {
    switch (type) {
      case "IN":
        return "from-green-500 to-emerald-600";
      case "OUT":
        return "from-red-500 to-rose-600";
      case "ADJUSTMENT":
        return "from-blue-500 to-indigo-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
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
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Penyesuaian Stok
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

                  {/* Product Info */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      SKU: {product.sku}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Stok Saat Ini:
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {product.stock}
                      </span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Adjustment Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Jenis Penyesuaian
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["IN", "OUT", "ADJUSTMENT"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAdjustmentType(type)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              adjustmentType === type
                                ? `bg-gradient-to-r ${getAdjustmentTypeColor(type)} text-white border-transparent`
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                          >
                            <div className="flex flex-col items-center space-y-1">
                              {getAdjustmentTypeIcon(type)}
                              <span className="text-xs font-medium">
                                {getAdjustmentTypeLabel(type)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {adjustmentType === "ADJUSTMENT" ? "Stok Baru" : "Jumlah"}
                      </label>
                      <Input
                        type="number"
                        value={quantity}
                        onValueChange={(value) => {
                          setQuantity(parseInt(value) || 0);
                          if (errors.quantity) {
                            setErrors(prev => ({ ...prev, quantity: "" }));
                          }
                        }}
                        placeholder="0"
                        className={`border-gray-200 dark:border-gray-600 ${errors.quantity ? 'border-red-500' : ''}`}
                      />
                      {errors.quantity && (
                        <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                      )}
                    </div>

                    {/* Stock Preview */}
                    {quantity > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700 dark:text-blue-300">
                            Stok Setelah Penyesuaian:
                          </span>
                          <span className="font-bold text-blue-800 dark:text-blue-200">
                            {getNewStock()}
                          </span>
                        </div>
                        {getNewStock() <= product.minStock && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            ⚠️ Stok akan berada di bawah minimum ({product.minStock})
                          </p>
                        )}
                      </div>
                    )}

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Alasan *
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => {
                          setReason(e.target.value);
                          if (errors.reason) {
                            setErrors(prev => ({ ...prev, reason: "" }));
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 ${
                          errors.reason ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <option value="">Pilih alasan</option>
                        <option value="Penerimaan barang">Penerimaan barang</option>
                        <option value="Penjualan">Penjualan</option>
                        <option value="Retur pelanggan">Retur pelanggan</option>
                        <option value="Barang rusak">Barang rusak</option>
                        <option value="Barang hilang">Barang hilang</option>
                        <option value="Koreksi stok">Koreksi stok</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      {errors.reason && (
                        <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Catatan
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Catatan tambahan (opsional)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
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
                        className={`flex-1 bg-gradient-to-r ${getAdjustmentTypeColor(adjustmentType)} text-white`}
                      >
                        {loading ? (
                          <>
                            <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <FiSave className="w-4 h-4 mr-2" />
                            Simpan Penyesuaian
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
