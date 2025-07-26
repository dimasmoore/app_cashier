"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FiHome,
  FiChevronRight,
  FiBarChart,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiPackage,
  FiTrendingUp,
  FiRefreshCw,
} from "react-icons/fi";


import {
  ReportsSummaryCards,
  ReportsFilters,
  ReportsCharts,
  ReportsTable,
  ReportsExport,
} from "@/components/reports";

import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { validateDateRange, sanitizeSearchQuery } from "@/lib/validation";


import {
  ReportFilters,
  ReportType,
  ExportFormat,
  ReportMetric,
  SalesReportData,
  TransactionReportData,
  InventoryReportData,
  CustomerReportData,
} from "@/types/reports";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); 
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
    },
    reportType: "sales",
  });

  
  const [reportMetrics, setReportMetrics] = useState<ReportMetric[]>([
    {
      id: "total-sales",
      title: "Total Penjualan",
      value: "1,234",
      change: "+12.5%",
      changeType: "increase",
      icon: FiShoppingCart,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      id: "total-revenue",
      title: "Total Pendapatan",
      value: "45,678,900",
      change: "+8.3%",
      changeType: "increase",
      icon: FiDollarSign,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      prefix: "Rp ",
    },
    {
      id: "total-customers",
      title: "Total Pelanggan",
      value: "567",
      change: "+15.2%",
      changeType: "increase",
      icon: FiUsers,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
    {
      id: "avg-order-value",
      title: "Rata-rata Nilai Order",
      value: "37,000",
      change: "-2.1%",
      changeType: "decrease",
      icon: FiTrendingUp,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      prefix: "Rp ",
    },
  ]);

  const [salesData, setSalesData] = useState<SalesReportData>({
    totalSales: 1234,
    totalTransactions: 567,
    averageOrderValue: 37000,
    totalRevenue: 45678900,
    topProducts: [
      {
        id: "1",
        name: "Produk A",
        sku: "SKU001",
        quantitySold: 150,
        revenue: 4500000,
        category: "Kategori 1",
      },
      {
        id: "2",
        name: "Produk B",
        sku: "SKU002",
        quantitySold: 120,
        revenue: 3600000,
        category: "Kategori 2",
      },
    ],
    salesByCategory: [
      {
        categoryId: "1",
        categoryName: "Elektronik",
        totalSales: 450,
        totalRevenue: 15000000,
        percentage: 35,
      },
      {
        categoryId: "2",
        categoryName: "Fashion",
        totalSales: 320,
        totalRevenue: 12000000,
        percentage: 28,
      },
      {
        categoryId: "3",
        categoryName: "Makanan",
        totalSales: 280,
        totalRevenue: 8500000,
        percentage: 22,
      },
      {
        categoryId: "4",
        categoryName: "Lainnya",
        totalSales: 184,
        totalRevenue: 6500000,
        percentage: 15,
      },
    ],
    salesTrend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      sales: Math.floor(Math.random() * 100) + 20,
      revenue: Math.floor(Math.random() * 2000000) + 500000,
      transactions: Math.floor(Math.random() * 50) + 10,
    })),
    paymentMethodBreakdown: [
      { method: "Tunai", count: 450, amount: 18000000, percentage: 40 },
      { method: "Kartu Kredit", count: 320, amount: 15000000, percentage: 35 },
      { method: "Transfer Bank", count: 180, amount: 8000000, percentage: 18 },
      { method: "E-Wallet", count: 84, amount: 4000000, percentage: 7 },
    ],
    
    lastUpdated: new Date().toISOString(),
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    },
    isRealTime: false,
  });

  
  const [transactionData, setTransactionData] = useState<TransactionReportData[]>([
    {
      id: "1",
      transactionNumber: "TRX001",
      date: "2024-01-15T10:30:00Z",
      customerName: "John Doe",
      items: 3,
      subtotal: 150000,
      tax: 15000,
      discount: 5000,
      total: 160000,
      paymentMethod: "Tunai",
      status: "COMPLETED",
    },
    {
      id: "2",
      transactionNumber: "TRX002",
      date: "2024-01-16T14:45:00Z",
      customerName: "Jane Smith",
      items: 2,
      subtotal: 200000,
      tax: 20000,
      discount: 0,
      total: 220000,
      paymentMethod: "Kartu Kredit",
      status: "COMPLETED",
    },
    {
      id: "3",
      transactionNumber: "TRX003",
      date: "2024-01-17",
      customerName: "Bob Wilson",
      items: 1,
      subtotal: 75000,
      tax: 7500,
      discount: 0,
      total: 82500,
      paymentMethod: "E-Wallet",
      status: "PENDING",
    },
    {
      id: "4",
      transactionNumber: "TRX004",
      date: new Date().toISOString(),
      customerName: undefined,
      items: 4,
      subtotal: 300000,
      tax: 30000,
      discount: 15000,
      total: 315000,
      paymentMethod: "Transfer Bank",
      status: "COMPLETED",
    },
  ]);

  const [inventoryData, setInventoryData] = useState<InventoryReportData[]>([]);
  const [customerData, setCustomerData] = useState<CustomerReportData[]>([]);

  
  const fetchSalesData = useCallback(async () => {
    try {
      setIsLoadingSales(true);
      setSalesError(null);

      const params = new URLSearchParams({
        startDate: filters.dateRange.startDate.toISOString(),
        endDate: filters.dateRange.endDate.toISOString(),
        reportType: filters.reportType,
      });

      const response = await fetch(`/api/reports/sales?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }

      const result = await response.json();
      if (result.success) {
        setSalesData(result.data);

        
        const newMetrics: ReportMetric[] = [
          {
            id: "total-sales",
            title: "Total Penjualan",
            value: result.data.totalSales.toLocaleString(),
            change: "+12.5%", 
            changeType: "increase",
            icon: FiShoppingCart,
            color: "bg-gradient-to-r from-blue-500 to-blue-600",
          },
          {
            id: "total-revenue",
            title: "Total Pendapatan",
            value: `Rp ${result.data.totalRevenue.toLocaleString()}`,
            change: "+8.2%", 
            changeType: "increase",
            icon: FiDollarSign,
            color: "bg-gradient-to-r from-green-500 to-green-600",
          },
          {
            id: "total-transactions",
            title: "Total Transaksi",
            value: result.data.totalTransactions.toLocaleString(),
            change: "+15.3%", 
            changeType: "increase",
            icon: FiBarChart,
            color: "bg-gradient-to-r from-purple-500 to-purple-600",
          },
          {
            id: "avg-order-value",
            title: "Rata-rata Nilai Order",
            value: `Rp ${Math.round(result.data.averageOrderValue).toLocaleString()}`,
            change: "+5.1%", 
            changeType: "increase",
            icon: FiTrendingUp,
            color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
          },
        ];
        setReportMetrics(newMetrics);
      } else {
        throw new Error(result.error || 'Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setSalesError(error instanceof Error ? error.message : 'Failed to fetch sales data');
    } finally {
      setIsLoadingSales(false);
    }
  }, [filters]);

  const fetchTransactionData = useCallback(async (page = 1, limit = 10) => {
    try {
      setIsLoadingTransactions(true);
      setTransactionsError(null);

      const params = new URLSearchParams({
        startDate: filters.dateRange.startDate.toISOString(),
        endDate: filters.dateRange.endDate.toISOString(),
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/reports/transactions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction data');
      }

      const result = await response.json();
      if (result.success) {
        setTransactionData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch transaction data');
      }
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      setTransactionsError(error instanceof Error ? error.message : 'Failed to fetch transaction data');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [filters]);

  
  const fetchInventoryData = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.startDate.toISOString(),
        endDate: filters.dateRange.endDate.toISOString(),
      });

      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      const response = await fetch(`/api/reports/inventory?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const result = await response.json();
      if (result.success) {
        setInventoryData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch inventory data');
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setInventoryData([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [filters]);

  
  const fetchCustomerData = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.dateRange.startDate.toISOString(),
        endDate: filters.dateRange.endDate.toISOString(),
      });

      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      const response = await fetch(`/api/reports/customers?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch customer data');
      }

      const result = await response.json();
      if (result.success) {
        setCustomerData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch customer data');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setCustomerData([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [filters]);

  
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
    setIsLoading(false);
  }, [session, status, router]);

  
  const fetchDataForReportType = useCallback(() => {
    if (!session || isLoading) return;

    fetchSalesData(); 

    switch (filters.reportType) {
      case 'transactions':
      case 'sales':
        fetchTransactionData();
        break;
      case 'inventory':
      case 'products':
        fetchInventoryData();
        break;
      case 'customers':
        fetchCustomerData();
        break;
      default:
        fetchTransactionData();
        break;
    }
  }, [
    session,
    isLoading,
    filters.reportType,
    fetchSalesData,
    fetchTransactionData,
    fetchInventoryData,
    fetchCustomerData
  ]);

  
  useEffect(() => {
    fetchDataForReportType();
  }, [session, isLoading, fetchSalesData, fetchTransactionData, fetchInventoryData, fetchCustomerData]);

  
  useEffect(() => {
    fetchDataForReportType();
  }, [filters, fetchDataForReportType]);

  
  const handleFiltersChange = useCallback((newFilters: ReportFilters) => {
    try {
      
      validateDateRange(newFilters.dateRange.startDate, newFilters.dateRange.endDate);
      setFilters(newFilters);
      setSalesError(null);
      setTransactionsError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid filter values";
      setSalesError(errorMessage);
      setTransactionsError(errorMessage);
    }
  }, []);



  
  const getCurrentTableData = useCallback(() => {
    switch (filters.reportType) {
      case 'transactions':
      case 'sales':
        return transactionData;
      case 'inventory':
      case 'products':
        return inventoryData;
      case 'customers':
        return customerData;
      default:
        return transactionData;
    }
  }, [filters.reportType, transactionData, inventoryData, customerData]);

  
  const getTableType = useCallback((): 'transactions' | 'inventory' | 'customers' => {
    switch (filters.reportType) {
      case 'transactions':
      case 'sales':
        return 'transactions';
      case 'inventory':
      case 'products':
        return 'inventory';
      case 'customers':
        return 'customers';
      default:
        return 'transactions';
    }
  }, [filters.reportType]);

  
  const getExportData = useCallback(() => {
    const exportData = getCurrentTableData();

    console.log('getExportData called:', {
      reportType: filters.reportType,
      dataLength: exportData?.length || 0,
      dataType: Array.isArray(exportData) ? 'array' : typeof exportData,
      sampleData: exportData?.[0]
    });

    return exportData;
  }, [filters.reportType, getCurrentTableData]);

  
  const handleExport = useCallback(async (format: ExportFormat) => {
    console.log(`Exporting ${filters.reportType} report as ${format}`);
    
  }, [filters]);

  
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchSalesData(),
        fetchTransactionData(),
      ]);
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchSalesData, fetchTransactionData]);

  
  useEffect(() => {
    if (!autoRefresh || !session || isLoading) return;

    const interval = setInterval(() => {
      if (!isRefreshing && !isLoadingSales && !isLoadingTransactions) {
        handleRefresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, session, isLoading, isRefreshing, isLoadingSales, isLoadingTransactions, handleRefresh]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
          <span className="text-blue-600 dark:text-blue-400 font-medium">Laporan</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Laporan & Analitik
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Analisis performa bisnis dan laporan komprehensif
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Auto-refresh toggle */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Auto-refresh
                </span>
              </label>
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-xs px-2 py-1 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded"
                >
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>1m</option>
                  <option value={300000}>5m</option>
                </select>
              )}
            </div>

            {/* Last refresh indicator */}
            {lastRefresh && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Terakhir: {lastRefresh.toLocaleTimeString('id-ID')}
              </span>
            )}

            {/* Manual refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRefreshing ? "Memperbarui..." : "Perbarui"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="mb-8">
        <ReportsSummaryCards metrics={reportMetrics} isLoading={isLoadingSales} />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="mb-8">
        <ReportsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isLoading={isLoadingSales || isLoadingTransactions}
        />
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="mb-8">
        {salesError ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{salesError}</p>
            <button
              onClick={fetchSalesData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <ReportsCharts salesData={salesData} isLoading={isLoadingSales} />
        )}
      </motion.div>

      {/* Table and Export */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          {transactionsError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{transactionsError}</p>
              <button
                onClick={() => fetchTransactionData()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <ReportsTable
              data={getCurrentTableData()}
              type={getTableType()}
              isLoading={isLoadingTransactions}
            />
          )}
        </motion.div>

        {/* Export */}
        <motion.div variants={itemVariants}>
          <ReportsExport
            reportType={filters.reportType}
            filters={filters}
            data={getExportData()}
            onExport={handleExport}
            isExporting={false}
          />
        </motion.div>
      </div>
    </motion.div>
    </ErrorBoundary>
  );
}
