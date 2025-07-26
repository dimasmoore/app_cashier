"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FiSearch,
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiCreditCard,
  FiDollarSign,
  FiUser,
  FiCode,
  FiCheck,
  FiX,
  FiHome,
  FiChevronRight,
} from "react-icons/fi";

// Types
interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: number;
  category: {
    name: string;
  };
  primaryImageUrl?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export default function SalesPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Search products
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`/api/sales/products/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to search products");
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Fetch customers
  const fetchCustomers = useCallback(async (query: string = "") => {
    try {
      const response = await fetch(`/api/sales/customers/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to fetch customers");

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }, []);

  // Load initial customers
  useEffect(() => {
    if (session) {
      fetchCustomers();
    }
  }, [session, fetchCustomers]);

  // Debounced search for products
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchProducts]);

  // Debounced search for customers
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showCustomerModal) {
        fetchCustomers(customerSearchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearchTerm, showCustomerModal, fetchCustomers]);



  // Cart calculations
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const taxRate = 0.1; // 10% tax
  const taxAmount = cartSubtotal * taxRate;
  const cartTotal = cartSubtotal + taxAmount;

  // Cart management functions
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * product.price
              }
            : item
        );
      } else {
        return [...prev, {
          product,
          quantity: 1,
          subtotal: product.price
        }];
      }
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.product.price
            }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedCustomer(null);
  };

  // Process transaction
  const processTransaction = async () => {
    if (cartItems.length === 0) return;

    try {
      setIsLoading(true);

      const transactionData = {
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
        customerId: selectedCustomer?.id,
        paymentMethod,
        subtotal: cartSubtotal,
        taxAmount,
        total: cartTotal,
        notes: "",
      };

      const response = await fetch("/api/sales/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process transaction");
      }

      const result = await response.json();
      setTransactionResult(result);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error processing transaction:", error);
      alert(error instanceof Error ? error.message : "Failed to process transaction");
    } finally {
      setIsLoading(false);
    }
  };

  // Create new customer
  const createNewCustomer = async () => {
    if (!newCustomerData.firstName || !newCustomerData.lastName) {
      alert("Nama depan dan belakang harus diisi");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/sales/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomerData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create customer");
      }

      const customer = await response.json();
      setSelectedCustomer(customer);
      setCustomers(prev => [customer, ...prev]);
      setShowNewCustomerModal(false);
      setShowCustomerModal(false);
      setNewCustomerData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      alert(error instanceof Error ? error.message : "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  // Barcode scanning
  const handleBarcodeInput = async () => {
    const barcode = prompt("Masukkan atau scan barcode:");
    if (!barcode) return;

    try {
      setIsSearching(true);
      const response = await fetch(`/api/sales/products/barcode?barcode=${encodeURIComponent(barcode)}`);

      if (response.ok) {
        const product = await response.json();
        addToCart(product);
        // Clear search and show the found product
        setSearchTerm("");
        setProducts([product]);
      } else {
        const error = await response.json();
        alert(error.error || "Produk tidak ditemukan");
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      alert("Gagal memindai barcode");
    } finally {
      setIsSearching(false);
    }
  };

  // Generate and print receipt
  const printReceipt = () => {
    if (!transactionResult) return;

    const receiptContent = `
      ========================================
                SISTEM POS
      ========================================

      Transaksi: ${transactionResult.transactionNumber}
      Tanggal: ${new Date().toLocaleString("id-ID")}
      Kasir: ${transactionResult.cashier.firstName} ${transactionResult.cashier.lastName}
      ${transactionResult.customer ? `Pelanggan: ${transactionResult.customer.firstName} ${transactionResult.customer.lastName}` : 'Pelanggan: Umum'}

      ----------------------------------------
      ITEM                    QTY    HARGA
      ----------------------------------------
      ${transactionResult.items.map((item: any) =>
        `${item.productName.padEnd(20)} ${item.quantity.toString().padStart(3)} ${item.totalPrice.toLocaleString("id-ID").padStart(10)}`
      ).join('\n')}
      ----------------------------------------

      Subtotal:           Rp ${transactionResult.subtotal.toLocaleString("id-ID")}
      Pajak (10%):        Rp ${(transactionResult.total - transactionResult.subtotal).toLocaleString("id-ID")}
      TOTAL:              Rp ${transactionResult.total.toLocaleString("id-ID")}

      Metode Bayar: ${transactionResult.paymentMethod}
      Status: ${transactionResult.paymentStatus}

      ========================================
      Terima kasih atas kunjungan Anda!
      ========================================
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${transactionResult.transactionNumber}</title>
            <style>
              body { font-family: 'Courier New', monospace; font-size: 12px; margin: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${receiptContent}</pre>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F1 - Focus search
      if (event.key === "F1") {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Cari produk"]') as HTMLInputElement;
        searchInput?.focus();
      }

      // F2 - Barcode scan
      if (event.key === "F2") {
        event.preventDefault();
        handleBarcodeInput();
      }

      // F3 - Customer selection
      if (event.key === "F3" && cartItems.length > 0) {
        event.preventDefault();
        setShowCustomerModal(true);
      }

      // F4 - Payment
      if (event.key === "F4" && cartItems.length > 0) {
        event.preventDefault();
        setShowPaymentModal(true);
      }

      // Escape - Close modals
      if (event.key === "Escape") {
        setShowCustomerModal(false);
        setShowPaymentModal(false);
        setShowNewCustomerModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cartItems.length]);

  // Show loading if session is still loading
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-6"
    >
      {/* Header with Breadcrumbs */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <FiHome className="w-4 h-4" />
          <span>Dashboard</span>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-blue-600 dark:text-blue-400 font-medium">Penjualan</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Sistem Penjualan
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Kelola transaksi penjualan dan proses pembayaran
            </p>
          </div>
          <div className="hidden lg:block">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                  Shortcut Keys
                </h4>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div>F1 - Focus Search</div>
                  <div>F2 - Scan Barcode</div>
                  <div>F3 - Select Customer</div>
                  <div>F4 - Payment</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Search and Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Cari produk berdasarkan nama, SKU, atau barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-12 h-12 text-lg border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={handleBarcodeInput}
                    title="Scan Barcode"
                  >
                    <FiCode className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Product Grid */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Produk Tersedia
                </h3>
              </CardHeader>
              <CardContent>
                {isSearching ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
                        onClick={() => addToCart(product)}
                      >
                        <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg mb-3 flex items-center justify-center">
                          {product.primaryImageUrl ? (
                            <img
                              src={product.primaryImageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <FiShoppingCart className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <h4 className="font-medium text-gray-800 dark:text-white text-sm mb-1 truncate">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {product.category.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            Rp {product.price.toLocaleString("id-ID")}
                          </span>
                          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                            Stok: {product.stock}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-12">
                    <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Tidak ada produk ditemukan untuk "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Mulai mengetik untuk mencari produk
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Shopping Cart */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg sticky top-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    <FiShoppingCart className="w-5 h-5 mr-2" />
                    Keranjang ({cartItems.length})
                  </h3>
                  {cartItems.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <FiShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Keranjang masih kosong
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 dark:text-white text-sm truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Rp {item.product.price.toLocaleString("id-ID")} × {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              <FiMinus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              <FiPlus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="font-medium">Rp {cartSubtotal.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Pajak (10%):</span>
                        <span className="font-medium">Rp {taxAmount.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
                        <span>Total:</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          Rp {cartTotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <Button
                        onClick={() => setShowCustomerModal(true)}
                        variant="outline"
                        className="w-full"
                      >
                        <FiUser className="w-4 h-4 mr-2" />
                        {selectedCustomer ? selectedCustomer.firstName + " " + selectedCustomer.lastName : "Pilih Pelanggan"}
                      </Button>
                      <Button
                        onClick={() => setShowPaymentModal(true)}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                        disabled={cartItems.length === 0}
                      >
                        <FiCreditCard className="w-4 h-4 mr-2" />
                        Proses Pembayaran
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      <AnimatePresence>
        {showCustomerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCustomerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Pilih Pelanggan
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomerModal(false)}
                  >
                    <FiX className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerModal(false);
                    }}
                  >
                    <FiUser className="w-4 h-4 mr-2" />
                    Pelanggan Umum (Tanpa Data)
                  </Button>

                  <div className="relative">
                    <Input
                      placeholder="Cari pelanggan..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {customers.map((customer) => (
                      <Button
                        key={customer.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCustomerModal(false);
                        }}
                      >
                        <FiUser className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                          {customer.email && (
                            <div className="text-xs text-gray-500">
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    onClick={() => setShowNewCustomerModal(true)}
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Tambah Pelanggan Baru
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Proses Pembayaran
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    <FiX className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Transaction Summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                    Ringkasan Transaksi
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Items:</span>
                      <span>{cartItems.length} produk</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span>Rp {cartSubtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pajak:</span>
                      <span>Rp {taxAmount.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-600 pt-2">
                      <span>Total:</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        Rp {cartTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                    Metode Pembayaran
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "CASH", label: "Tunai", icon: FiDollarSign },
                      { id: "CREDIT_CARD", label: "Kartu Kredit", icon: FiCreditCard },
                      { id: "DEBIT_CARD", label: "Kartu Debit", icon: FiCreditCard },
                      { id: "DIGITAL_WALLET", label: "E-Wallet", icon: FiCreditCard },
                    ].map((method) => (
                      <Button
                        key={method.id}
                        variant={paymentMethod === method.id ? "default" : "outline"}
                        className={`h-16 flex-col space-y-1 ${
                          paymentMethod === method.id
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                            : ""
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <method.icon className="w-5 h-5" />
                        <span className="text-xs">{method.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                {selectedCustomer && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                      Pelanggan
                    </h4>
                    <div className="text-sm">
                      <div className="font-medium">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </div>
                      {selectedCustomer.email && (
                        <div className="text-gray-600 dark:text-gray-400">
                          {selectedCustomer.email}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    disabled={isLoading}
                    onClick={processTransaction}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <FiCheck className="w-4 h-4 mr-2" />
                    )}
                    Bayar Sekarang
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && transactionResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                </motion.div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Transaksi Berhasil!
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Transaksi #{transactionResult.transactionNumber} telah berhasil diproses
                </p>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total:</span>
                      <span className="font-medium">
                        Rp {transactionResult.total?.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Metode:</span>
                      <span className="font-medium">{transactionResult.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Waktu:</span>
                      <span className="font-medium">
                        {new Date().toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowSuccessModal(false);
                      clearCart();
                    }}
                  >
                    Selesai
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600"
                    onClick={printReceipt}
                  >
                    Cetak Struk
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Customer Modal */}
      <AnimatePresence>
        {showNewCustomerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewCustomerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Tambah Pelanggan Baru
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewCustomerModal(false)}
                  >
                    <FiX className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama Depan *
                    </label>
                    <Input
                      value={newCustomerData.firstName}
                      onChange={(e) => setNewCustomerData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Nama depan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama Belakang *
                    </label>
                    <Input
                      value={newCustomerData.lastName}
                      onChange={(e) => setNewCustomerData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Nama belakang"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={newCustomerData.email}
                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nomor Telepon
                  </label>
                  <Input
                    value={newCustomerData.phone}
                    onChange={(e) => setNewCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+62 xxx xxx xxxx"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowNewCustomerModal(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600"
                    onClick={createNewCustomer}
                    disabled={isLoading || !newCustomerData.firstName || !newCustomerData.lastName}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <FiPlus className="w-4 h-4 mr-2" />
                    )}
                    Tambah
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
