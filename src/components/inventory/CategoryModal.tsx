"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FiTag,
  FiSave,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { Category, CategoryFormData, InventoryModalMode } from "@/types/inventory";
import { CategoryFormSchema } from "@/lib/validation";
import { z } from "zod";

interface CategoryModalProps {
  isOpen: boolean;
  category?: Category | null;
  mode: InventoryModalMode;
  isLoading: boolean;
  onSubmit: (data: CategoryFormData) => void;
  onClose: () => void;
}

const CategoryModal = ({
  isOpen,
  category,
  mode,
  isLoading,
  onSubmit,
  onClose,
}: CategoryModalProps) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category && (mode === "edit" || mode === "view")) {
      setFormData({
        name: category.name,
        description: category.description || "",
        isActive: category.isActive,
      });
    } else if (mode === "create") {
      setFormData({
        name: "",
        description: "",
        isActive: true,
      });
      setErrors({});
    }
  }, [category, mode]);

  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    try {
      CategoryFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view") return;

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isReadOnly = mode === "view";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <FiTag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {mode === "create" && "Tambah Kategori Baru"}
                        {mode === "edit" && "Edit Kategori"}
                        {mode === "view" && "Detail Kategori"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mode === "create" && "Buat kategori produk baru"}
                        {mode === "edit" && "Perbarui informasi kategori"}
                        {mode === "view" && "Informasi lengkap kategori"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Kategori *
                    </label>
                    <div className="relative">
                      <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Masukkan nama kategori"
                        className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                        disabled={isReadOnly}
                      />
                    </div>
                    {errors.name && (
                      <div className="flex items-center space-x-1 mt-1">
                        <FiAlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-sm text-red-600">{errors.name}</p>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Masukkan deskripsi kategori (opsional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      disabled={isReadOnly}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange("isActive", checked as boolean)}
                        disabled={isReadOnly}
                      />
                      <label
                        htmlFor="isActive"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Kategori aktif
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Kategori yang tidak aktif tidak akan muncul dalam pilihan produk
                    </p>
                  </motion.div>

                  {!isReadOnly && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-gray-700"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Menyimpan...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <FiSave className="w-4 h-4" />
                            <span>
                              {mode === "create" ? "Tambah Kategori" : "Simpan Perubahan"}
                            </span>
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryModal;
