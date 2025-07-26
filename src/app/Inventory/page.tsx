"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductModal from "@/components/inventory/ProductModal";
import StockAdjustmentModal from "@/components/inventory/StockAdjustmentModal";
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiUser,
  FiCalendar,
  FiClock,
  FiAlertTriangle,
  FiRefreshCw,
  FiLogOut,
  FiPackage,
  FiUsers,
} from "react-icons/fi";

interface Product {
  id: string;
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
  productImages?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  _count: {
    products: number;
  };
}

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  _count: {
    products: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function InventoryPage() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const { data: session, status } = useSession();
  const router = useRouter();

  
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  
  useEffect(() => {
    setIsClient(true);

    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }));
      setCurrentTime(now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedSupplier && { supplierId: selectedSupplier }),
        ...(stockFilter && { stockStatus: stockFilter }),
      });

      const response = await fetch(`/api/inventory/products?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/inventory/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/inventory/suppliers");
      if (!response.ok) throw new Error("Failed to fetch suppliers");
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  
  useEffect(() => {
    if (session) {
      fetchCategories();
      fetchSuppliers();
    }
  }, [session]);

  
  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session, pagination.page, searchTerm, selectedCategory, selectedSupplier, stockFilter]);

  
  const getStockStatus = (product: Product) => {
    if (product.stock <= 0) return "out";
    if (product.stock <= product.minStock) return "low";
    return "normal";
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case "out": return "text-red-600 bg-red-50 border-red-200";
      case "low": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-green-600 bg-green-50 border-green-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setModalMode("create");
    setProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode("edit");
    setProductModalOpen(true);
  };

  const handleStockAdjustment = (product: Product) => {
    setSelectedProduct(product);
    setStockModalOpen(true);
  };

  const handleSaveProduct = async (productData: {
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
  }) => {
    try {
      const url = modalMode === "create"
        ? "/api/inventory/products"
        : `/api/inventory/products/${selectedProduct?.id}`;

      const method = modalMode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save product");
      }

      await fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      throw error;
    }
  };

  const handleSaveStockAdjustment = async (adjustment: {
    productId: string;
    type: "IN" | "OUT" | "ADJUSTMENT";
    quantity: number;
    reason: string;
    notes?: string;
  }) => {
    try {
      const response = await fetch("/api/inventory/stock/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adjustment),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to adjust stock");
      }

      await fetchProducts();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      throw error;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      const response = await fetch(`/api/inventory/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete product");
      }

      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        callbackUrl: "/",
        redirect: true
      });
    } catch (error) {
      console.error("Inventory logout error:", error);
      setIsLoggingOut(false);
    }
  };

  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  };

  
  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  Manajemen Inventori
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Kelola produk, stok, kategori, dan supplier Anda
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <FiCalendar className="inline w-4 h-4 mr-1" />
                    {isClient ? currentDate : "Loading..."}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <FiClock className="inline w-4 h-4 mr-1" />
                    {isClient ? currentTime : "Loading..."}
                  </p>
                </div>

                {/* User Info & Logout */}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {session?.user?.firstName} {session?.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session?.user?.role === "ADMIN" ? "Administrator" : session?.user?.role}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="border-gray-200 dark:border-gray-600 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                      >
                        {isLoggingOut ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <FiLogOut className="w-4 h-4 mr-2" />
                        )}
                        {isLoggingOut ? "Keluar..." : "Keluar"}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters and Actions */}
          <motion.div variants={itemVariants} className="mb-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Cari produk, SKU, atau barcode..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        className="pl-10 border-gray-200 dark:border-gray-600"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    >
                      <option value="">Semua Kategori</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category._count.products})
                        </option>
                      ))}
                    </select>

                    {/* Supplier Filter */}
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    >
                      <option value="">Semua Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} ({supplier._count.products})
                        </option>
                      ))}
                    </select>

                    {/* Stock Filter */}
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    >
                      <option value="">Semua Stok</option>
                      <option value="low">Stok Rendah</option>
                      <option value="out">Stok Habis</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchProducts()}
                        disabled={loading}
                        className="border-gray-200 dark:border-gray-600"
                      >
                        <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleCreateProduct}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                      >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Tambah Produk
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Total Produk
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {pagination.total}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                      <FiPackage className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Kategori
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {categories.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                      <FiFilter className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Supplier
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {suppliers.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center">
                      <FiUsers className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Stok Rendah
                      </p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-white">
                        {products.filter(p => getStockStatus(p) === 'low').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center">
                      <FiAlertTriangle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Products Grid */}
          <motion.div variants={itemVariants}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            ) : products.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Tidak ada produk ditemukan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Belum ada produk yang sesuai dengan filter yang dipilih
                  </p>
                  <Button
                    variant="default"
                    onClick={handleCreateProduct}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Tambah Produk Pertama
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <motion.div
                      key={product.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className="relative"
                    >
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                        <CardContent className="p-6">
                          {/* Product Image */}
                          <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                            {product.productImages && product.productImages.length > 0 ? (
                              <img
                                src={product.productImages[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <FiPackage className="w-8 h-8 text-gray-400" />
                            )}
                          </div>

                          {/* Stock Status Badge */}
                          <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium border ${getStockColor(stockStatus)}`}>
                            {stockStatus === 'out' ? 'Habis' : stockStatus === 'low' ? 'Rendah' : 'Normal'}
                          </div>

                          {/* Product Info */}
                          <div className="space-y-2">
                            <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-2">
                              {product.name}
                            </h3>

                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                              <span>SKU: {product.sku}</span>
                              {product.barcode && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {product.barcode}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(product.price)}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Stok: {product.stock}
                              </span>
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <div>Kategori: {product.category.name}</div>
                              {product.supplier && (
                                <div>Supplier: {product.supplier.name}</div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStockAdjustment(product)}
                                className="w-full border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <FiRefreshCw className="w-4 h-4 mr-2" />
                                Stok
                              </Button>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                                className="border-gray-200 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                              >
                                <FiEdit className="w-4 h-4" />
                              </Button>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="border-gray-200 dark:border-gray-600 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <motion.div variants={itemVariants} className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="border-gray-200 dark:border-gray-600"
                >
                  Sebelumnya
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={pagination.page === page
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                          : "border-gray-200 dark:border-gray-600"
                        }
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="border-gray-200 dark:border-gray-600"
                >
                  Selanjutnya
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Modals */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct || undefined}
        categories={categories}
        suppliers={suppliers}
        mode={modalMode}
      />

      <StockAdjustmentModal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        onSave={handleSaveStockAdjustment}
        product={selectedProduct || undefined}
      />
    </div>
  );
}
