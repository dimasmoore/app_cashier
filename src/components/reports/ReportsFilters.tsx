"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReportsFiltersProps, ReportType } from "@/types/reports";
import {
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiBarChart,
  FiShoppingCart,
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
} from "react-icons/fi";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const reportTypeOptions: { value: ReportType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "sales", label: "Laporan Penjualan", icon: FiShoppingCart },
  { value: "inventory", label: "Laporan Inventori", icon: FiPackage },
  { value: "transactions", label: "Laporan Transaksi", icon: FiCreditCard },
  { value: "customers", label: "Laporan Pelanggan", icon: FiUsers },
  { value: "revenue", label: "Laporan Pendapatan", icon: FiDollarSign },
  { value: "products", label: "Laporan Produk", icon: FiBarChart },
];

const paymentMethodOptions = [
  { value: "", label: "Semua Metode Pembayaran" },
  { value: "CASH", label: "Tunai" },
  { value: "CREDIT_CARD", label: "Kartu Kredit" },
  { value: "DEBIT_CARD", label: "Kartu Debit" },
  { value: "DIGITAL_WALLET", label: "Dompet Digital" },
  { value: "BANK_TRANSFER", label: "Transfer Bank" },
];

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "PENDING", label: "Menunggu" },
  { value: "CANCELLED", label: "Dibatalkan" },
  { value: "REFUNDED", label: "Dikembalikan" },
];

const quickDateRanges = [
  { label: "Hari Ini", days: 0 },
  { label: "7 Hari Terakhir", days: 7 },
  { label: "30 Hari Terakhir", days: 30 },
  { label: "90 Hari Terakhir", days: 90 },
];

export default function ReportsFilters({
  filters,
  onFiltersChange,
  isLoading = false,
}: ReportsFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    const newDate = new Date(value);
    const newFilters = {
      ...localFilters,
      dateRange: {
        ...localFilters.dateRange,
        [field]: newDate,
      },
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleQuickDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (days === 0) {
      // Today only
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate.setDate(endDate.getDate() - days);
    }

    const newFilters = {
      ...localFilters,
      dateRange: { startDate, endDate },
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReportTypeChange = (reportType: ReportType) => {
    const newFilters = { ...localFilters, reportType };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...localFilters, [field]: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateRange: {
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate: new Date(),
      },
      reportType: "sales" as ReportType,
      category: undefined,
      paymentMethod: undefined,
      status: undefined,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiFilter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Filter Laporan
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
              className="text-gray-600 dark:text-gray-300"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Jenis Laporan
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {reportTypeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={localFilters.reportType === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleReportTypeChange(option.value)}
                  disabled={isLoading}
                  className={`flex flex-col items-center p-3 h-auto ${
                    localFilters.reportType === option.value
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <option.icon className="w-4 h-4 mb-1" />
                  <span className="text-xs text-center">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Rentang Tanggal
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Dari Tanggal
                    </label>
                    <Input
                      type="date"
                      value={formatDateForInput(localFilters.dateRange.startDate)}
                      onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Sampai Tanggal
                    </label>
                    <Input
                      type="date"
                      value={formatDateForInput(localFilters.dateRange.endDate)}
                      onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Quick Date Range Buttons */}
                <div className="flex flex-wrap gap-2">
                  {quickDateRanges.map((range) => (
                    <Button
                      key={range.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDateRange(range.days)}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Filters */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Filter Tambahan
              </label>
              <div className="space-y-3">
                {/* Payment Method Filter */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    Metode Pembayaran
                  </label>
                  <select
                    value={localFilters.paymentMethod || ""}
                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                    disabled={isLoading}
                    className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-blue-500 dark:focus:border-blue-400"
                  >
                    {paymentMethodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    Status Transaksi
                  </label>
                  <select
                    value={localFilters.status || ""}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    disabled={isLoading}
                    className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:border-blue-500 dark:focus:border-blue-400"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
