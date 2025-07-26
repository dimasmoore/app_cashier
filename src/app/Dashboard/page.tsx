"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiEye,
  FiCalendar,
  FiClock,
  FiUser,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiBarChart,
  FiRefreshCw,
} from "react-icons/fi";



interface DashboardMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface DashboardStats {
  dailySales: {
    value: number;
    change: number;
    changeType: "increase" | "decrease" | "neutral";
  };
  transactions: {
    value: number;
    change: number;
    changeType: "increase" | "decrease" | "neutral";
  };
  activeCustomers: {
    value: number;
    change: number;
    changeType: "increase" | "decrease" | "neutral";
  };
  productStock: {
    value: number;
    change: number;
    changeType: "increase" | "decrease" | "neutral";
  };
}

interface RecentTransaction {
  id: string;
  transactionNumber: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
  } | null;
  cashier: {
    name: string;
  };
  itemCount: number;
}

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      setStatsError(null);
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setStatsError("Failed to load dashboard statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      setTransactionsError(null);
      const response = await fetch("/api/dashboard/recent-transactions");
      if (!response.ok) {
        throw new Error("Failed to fetch recent transactions");
      }
      const data = await response.json();
      setRecentTransactions(data);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      setTransactionsError("Failed to load recent transactions");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Refresh all dashboard data
  const refreshDashboardData = async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchRecentTransactions(),
    ]);
  };

  // Fix hydration error by only showing date/time on client side
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
    const interval = setInterval(updateDateTime, 60000); // Update every minute

    // Fetch dashboard data
    if (session) {
      fetchDashboardStats();
      fetchRecentTransactions();

      // Set up auto-refresh every 5 minutes
      const refreshInterval = setInterval(() => {
        fetchDashboardStats();
        fetchRecentTransactions();
      }, 5 * 60 * 1000); // 5 minutes

      return () => {
        clearInterval(interval);
        clearInterval(refreshInterval);
      };
    }

    return () => {
      clearInterval(interval);
    };
  }, [session]);

  // Generate dashboard metrics from dynamic data
  const getDashboardMetrics = (): DashboardMetric[] => {
    if (!dashboardStats) {
      // Return loading state metrics
      return [
        {
          id: "daily-sales",
          title: "Penjualan Hari Ini",
          value: isLoadingStats ? "Loading..." : "Rp 0",
          change: "0%",
          changeType: "neutral",
          icon: FiDollarSign,
          color: "from-green-500 to-emerald-600",
        },
        {
          id: "transactions",
          title: "Total Transaksi",
          value: isLoadingStats ? "Loading..." : "0",
          change: "0%",
          changeType: "neutral",
          icon: FiCreditCard,
          color: "from-blue-500 to-indigo-600",
        },
        {
          id: "customers",
          title: "Pelanggan Aktif",
          value: isLoadingStats ? "Loading..." : "0",
          change: "0%",
          changeType: "neutral",
          icon: FiUsers,
          color: "from-purple-500 to-violet-600",
        },
        {
          id: "inventory",
          title: "Stok Produk",
          value: isLoadingStats ? "Loading..." : "0",
          change: "0%",
          changeType: "neutral",
          icon: FiPackage,
          color: "from-orange-500 to-red-600",
        },
      ];
    }

    return [
      {
        id: "daily-sales",
        title: "Penjualan Hari Ini",
        value: `Rp ${dashboardStats.dailySales.value.toLocaleString("id-ID")}`,
        change: `${dashboardStats.dailySales.change >= 0 ? "+" : ""}${dashboardStats.dailySales.change.toFixed(1)}%`,
        changeType: dashboardStats.dailySales.changeType,
        icon: FiDollarSign,
        color: "from-green-500 to-emerald-600",
      },
      {
        id: "transactions",
        title: "Total Transaksi",
        value: dashboardStats.transactions.value.toString(),
        change: `${dashboardStats.transactions.change >= 0 ? "+" : ""}${dashboardStats.transactions.change.toFixed(1)}%`,
        changeType: dashboardStats.transactions.changeType,
        icon: FiCreditCard,
        color: "from-blue-500 to-indigo-600",
      },
      {
        id: "customers",
        title: "Pelanggan Aktif",
        value: dashboardStats.activeCustomers.value.toString(),
        change: `${dashboardStats.activeCustomers.change >= 0 ? "+" : ""}${dashboardStats.activeCustomers.change.toFixed(1)}%`,
        changeType: dashboardStats.activeCustomers.changeType,
        icon: FiUsers,
        color: "from-purple-500 to-violet-600",
      },
      {
        id: "inventory",
        title: "Stok Produk",
        value: dashboardStats.productStock.value.toLocaleString("id-ID"),
        change: `${dashboardStats.productStock.change >= 0 ? "+" : ""}${dashboardStats.productStock.change.toFixed(1)}%`,
        changeType: dashboardStats.productStock.changeType,
        icon: FiPackage,
        color: "from-orange-500 to-red-600",
      },
    ];
  };

  const dashboardMetrics = getDashboardMetrics();

  // Show loading if session is still loading or user is not authenticated
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

  return (
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
                  Dasbor Utama
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Selamat datang kembali, {session?.user?.firstName || session?.user?.name}! Berikut ringkasan aktivitas hari ini.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={refreshDashboardData}
                  disabled={isLoadingStats || isLoadingTransactions}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <FiRefreshCw className={`w-4 h-4 ${(isLoadingStats || isLoadingTransactions) ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
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
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {session?.user?.firstName} {session?.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Administrator
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Metrics */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {statsError ? (
              <div className="col-span-full">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <p className="text-red-500 dark:text-red-400 mb-2">
                      {statsError}
                    </p>
                    <button
                      onClick={fetchDashboardStats}
                      className="text-blue-500 hover:text-blue-600 text-sm underline"
                    >
                      Coba lagi
                    </button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              dashboardMetrics.map((metric) => (
                <motion.div
                  key={metric.id}
                  variants={cardVariants}
                  whileHover="hover"
                  className="relative"
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {metric.title}
                          </p>
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {metric.value}
                          </p>
                          <div className="flex items-center mt-2">
                            {metric.changeType === "increase" ? (
                              <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : metric.changeType === "decrease" ? (
                              <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            ) : (
                              <FiEye className="w-4 h-4 text-gray-500 mr-1" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                metric.changeType === "increase"
                                  ? "text-green-600 dark:text-green-400"
                                  : metric.changeType === "decrease"
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {metric.change}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                              dari kemarin
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center shadow-lg`}
                        >
                          <metric.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Additional Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Transaksi Terbaru
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    5 transaksi terakhir hari ini
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingTransactions ? (
                      // Loading state
                      Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-pulse"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                            <div>
                              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
                              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-1"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                          </div>
                        </div>
                      ))
                    ) : transactionsError ? (
                      // Error state
                      <div className="text-center py-8">
                        <p className="text-red-500 dark:text-red-400 text-sm">
                          {transactionsError}
                        </p>
                        <button
                          onClick={fetchRecentTransactions}
                          className="mt-2 text-blue-500 hover:text-blue-600 text-sm underline"
                        >
                          Coba lagi
                        </button>
                      </div>
                    ) : recentTransactions.length === 0 ? (
                      // Empty state
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Belum ada transaksi hari ini
                        </p>
                      </div>
                    ) : (
                      // Data state
                      recentTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <FiCreditCard className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-white">
                                {transaction.transactionNumber}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(transaction.createdAt).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                              Rp {transaction.total.toLocaleString("id-ID")}
                            </p>
                            <p className={`text-xs ${
                              transaction.paymentStatus === "PAID"
                                ? "text-green-600 dark:text-green-400"
                                : "text-yellow-600 dark:text-yellow-400"
                            }`}>
                              {transaction.paymentStatus === "PAID" ? "Berhasil" : "Pending"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Aksi Cepat
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Akses fitur utama dengan cepat
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-20 flex-col space-y-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <FiShoppingCart className="w-6 h-6" />
                        <span className="text-sm">Transaksi Baru</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-20 flex-col space-y-2 border-gray-200 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <FiPackage className="w-6 h-6" />
                        <span className="text-sm">Kelola Stok</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-20 flex-col space-y-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        <FiUsers className="w-6 h-6" />
                        <span className="text-sm">Data Pelanggan</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-20 flex-col space-y-2 border-gray-200 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      >
                        <FiBarChart className="w-6 h-6" />
                        <span className="text-sm">Laporan</span>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
}
