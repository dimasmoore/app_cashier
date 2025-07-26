"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ReportsTableProps, TransactionReportData, InventoryReportData, CustomerReportData } from "@/types/reports";
import {
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiTable,
  FiFilter,
  FiDownload,
  FiFileText,
  FiGrid,
  FiFile,
  FiLoader,
  FiCheck,
  FiChevronDown as FiDropdown,
} from "react-icons/fi";
import { exportToPDF, exportToExcel, exportToCSV, ExportType } from "@/lib/exportUtils";
import { formatDate } from "@/lib/utils";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const ITEMS_PER_PAGE = 10;

const exportOptions = [
  {
    format: 'pdf' as const,
    label: 'PDF',
    description: 'Laporan dalam format PDF',
    icon: FiFileText,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/20',
  },
  {
    format: 'excel' as const,
    label: 'Excel',
    description: 'Spreadsheet Excel (.xlsx)',
    icon: FiGrid,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'hover:bg-green-50 dark:hover:bg-green-900/20',
  },
  {
    format: 'csv' as const,
    label: 'CSV',
    description: 'Comma Separated Values',
    icon: FiFile,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
  },
];

const LoadingSkeleton = () => (
  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
    <CardHeader>
      <div className="animate-pulse">
        <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="animate-pulse space-y-4">
        <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "selesai":
      case "active":
      case "in_stock":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
      case "menunggu":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
      case "dibatalkan":
      case "inactive":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "low_stock":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "out_of_stock":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border-0`}>
      {status}
    </Badge>
  );
};

export default function ReportsTable({
  data,
  type,
  isLoading = false,
  onSort,
  onSearch,
}: ReportsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<string | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((item) => {
        const searchableFields = Object.values(item).join(" ").toLowerCase();
        return searchableFields.includes(searchQuery.toLowerCase());
      });
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = (a as any)[sortColumn];
        const bValue = (b as any)[sortColumn];
        
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortDirection === "asc") {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return filtered;
  }, [data, searchQuery, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    onSort?.(column, sortDirection === "asc" ? "desc" : "asc");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    onSearch?.(query);
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    setExportFormat(format);
    setShowExportDropdown(false);

    try {
      console.log('Starting export process...', { format, type, dataLength: filteredAndSortedData.length });

      // Validate data
      if (!filteredAndSortedData || filteredAndSortedData.length === 0) {
        throw new Error('Tidak ada data untuk diekspor');
      }

      const exportData = filteredAndSortedData;
      const exportType = type as ExportType;
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `laporan-${type}-${timestamp}`;

      console.log('Export data prepared:', { exportType, filename, dataCount: exportData.length });

      switch (format) {
        case 'pdf':
          await exportToPDF(exportData, exportType, {
            filename: `${filename}.pdf`,
            title: `Laporan ${type === 'transactions' ? 'Transaksi' : type === 'inventory' ? 'Inventori' : 'Pelanggan'}`,
            subtitle: `Total: ${exportData.length} data | Diekspor pada ${new Date().toLocaleDateString('id-ID')}`,
          });
          break;
        case 'excel':
          await exportToExcel(exportData, exportType, {
            filename: `${filename}.xlsx`,
          });
          break;
        case 'csv':
          await exportToCSV(exportData, exportType, {
            filename: `${filename}.csv`,
          });
          break;
        default:
          throw new Error(`Format ekspor tidak didukung: ${format}`);
      }

      console.log('Export completed successfully');

      // Show success state
      setExportFormat(format);

      // Reset export state after a short delay
      setTimeout(() => {
        setIsExporting(false);
        setExportFormat(null);
      }, 2000);
    } catch (error) {
      console.error('Export error:', error);

      // Show error to user (you might want to add a toast notification here)
      alert(`Gagal mengekspor data: ${error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui'}`);

      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? 
      <FiChevronUp className="w-4 h-4" /> : 
      <FiChevronDown className="w-4 h-4" />;
  };

  const renderTableHeaders = () => {
    switch (type) {
      case "transactions":
        return (
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("transactionNumber")}
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span>No. Transaksi</span>
                <SortIcon column="transactionNumber" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("date")}
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span>Tanggal</span>
                <SortIcon column="date" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Pelanggan</th>
            <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("total")}
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 ml-auto"
              >
                <span>Total</span>
                <SortIcon column="total" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Pembayaran</th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
          </tr>
        );
      case "inventory":
        return (
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("name")}
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span>Produk</span>
                <SortIcon column="name" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">SKU</th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Kategori</th>
            <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("currentStock")}
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 ml-auto"
              >
                <span>Stok</span>
                <SortIcon column="currentStock" />
              </button>
            </th>
            <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("value")}
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 ml-auto"
              >
                <span>Nilai</span>
                <SortIcon column="value" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
          </tr>
        );
      case "customers":
        return (
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("name")}
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span>Nama</span>
                <SortIcon column="name" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Email</th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Telepon</th>
            <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("totalOrders")}
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 ml-auto"
              >
                <span>Total Order</span>
                <SortIcon column="totalOrders" />
              </button>
            </th>
            <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort("totalSpent")}
                className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 ml-auto"
              >
                <span>Total Belanja</span>
                <SortIcon column="totalSpent" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    return paginatedData.map((item, index) => {
      switch (type) {
        case "transactions":
          const transaction = item as TransactionReportData;
          return (
            <motion.tr
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td className="p-3 text-sm text-gray-800 dark:text-white font-medium">
                {transaction.transactionNumber}
              </td>
              <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                {formatDate(transaction.date)}
              </td>
              <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                {transaction.customerName || "Guest"}
              </td>
              <td className="p-3 text-sm text-gray-800 dark:text-white font-medium text-right">
                Rp {transaction.total.toLocaleString()}
              </td>
              <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                {transaction.paymentMethod}
              </td>
              <td className="p-3">
                <StatusBadge status={transaction.status} />
              </td>
            </motion.tr>
          );
        case "inventory":
          const inventory = item as InventoryReportData;
          return (
            <motion.tr
              key={inventory.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td className="p-3 text-sm text-gray-800 dark:text-white font-medium">
                {inventory.name}
              </td>
              <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                {inventory.sku}
              </td>
              <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                {inventory.category}
              </td>
              <td className="p-3 text-sm text-gray-800 dark:text-white font-medium text-right">
                {inventory.currentStock}
              </td>
              <td className="p-3 text-sm text-gray-800 dark:text-white font-medium text-right">
                Rp {inventory.value.toLocaleString()}
              </td>
              <td className="p-3">
                <StatusBadge status={inventory.status} />
              </td>
            </motion.tr>
          );
        case "customers":
          const customer = item as CustomerReportData;
          return (
            <motion.tr
              key={customer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td className="p-3 text-sm text-gray-800 dark:text-white font-medium">
                {customer.name}
              </td>
              <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                {customer.email || "-"}
              </td>
              <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                {customer.phone || "-"}
              </td>
              <td className="p-3 text-sm text-gray-800 dark:text-white font-medium text-right">
                {customer.totalOrders}
              </td>
              <td className="p-3 text-sm text-gray-800 dark:text-white font-medium text-right">
                Rp {customer.totalSpent.toLocaleString()}
              </td>
              <td className="p-3">
                <StatusBadge status={customer.status} />
              </td>
            </motion.tr>
          );
        default:
          return null;
      }
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-2">
              <FiTable className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Data {type === "transactions" ? "Transaksi" : type === "inventory" ? "Inventori" : "Pelanggan"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {filteredAndSortedData.length} dari {data.length} data
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              {/* Export Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  disabled={isExporting || filteredAndSortedData.length === 0}
                  className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  {isExporting ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : exportFormat ? (
                    <FiCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <FiDownload className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isExporting ? 'Mengekspor...' : exportFormat ? 'Berhasil!' : 'Ekspor'}
                  </span>
                  <FiDropdown className="w-3 h-3" />
                </Button>

                {/* Export Dropdown Menu */}
                {showExportDropdown && !isExporting && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 sm:right-0 left-0 sm:left-auto top-full mt-2 w-full sm:w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        Pilih Format Ekspor
                      </div>
                      {exportOptions.map((option) => (
                        <button
                          key={option.format}
                          onClick={() => handleExport(option.format)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${option.bgColor} ${option.color}`}
                        >
                          <option.icon className="w-4 h-4" />
                          <div>
                            <div className="text-sm font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {option.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {renderTableHeaders()}
              </thead>
              <tbody>
                {renderTableRows()}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Menampilkan {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSortedData.length)} dari {filteredAndSortedData.length} data
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : ""}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FiChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
