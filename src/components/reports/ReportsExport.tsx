"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportsExportProps, ExportFormat } from "@/types/reports";
import {
  FiDownload,
  FiFileText,
  FiFile,
  FiGrid,
  FiLoader,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const exportOptions = [
  {
    format: "pdf" as ExportFormat,
    label: "PDF",
    description: "Laporan dalam format PDF",
    icon: FiFileText,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-600 dark:text-red-400",
  },
  {
    format: "excel" as ExportFormat,
    label: "Excel",
    description: "Spreadsheet Excel (.xlsx)",
    icon: FiGrid,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-600 dark:text-green-400",
  },
  {
    format: "csv" as ExportFormat,
    label: "CSV",
    description: "Comma Separated Values",
    icon: FiFile,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
  },
];

interface ExportState {
  format: ExportFormat | null;
  status: "idle" | "loading" | "success" | "error";
  message?: string;
}

export default function ReportsExport({
  reportType,
  filters,
  onExport,
  isExporting = false,
}: ReportsExportProps) {
  const [exportState, setExportState] = useState<ExportState>({
    format: null,
    status: "idle",
  });

  const handleExport = async (format: ExportFormat) => {
    setExportState({
      format,
      status: "loading",
      message: `Mengekspor laporan ke format ${format.toUpperCase()}...`,
    });

    try {
      await onExport(format);
      setExportState({
        format,
        status: "success",
        message: `Laporan berhasil diekspor ke format ${format.toUpperCase()}`,
      });

      // Reset status after 3 seconds
      setTimeout(() => {
        setExportState({ format: null, status: "idle" });
      }, 3000);
    } catch (error) {
      setExportState({
        format,
        status: "error",
        message: `Gagal mengekspor laporan: ${error instanceof Error ? error.message : "Unknown error"}`,
      });

      // Reset status after 5 seconds
      setTimeout(() => {
        setExportState({ format: null, status: "idle" });
      }, 5000);
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels = {
      sales: "Penjualan",
      inventory: "Inventori",
      transactions: "Transaksi",
      customers: "Pelanggan",
      revenue: "Pendapatan",
      products: "Produk",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDateRange = () => {
    const startDate = filters.dateRange.startDate.toLocaleDateString('id-ID');
    const endDate = filters.dateRange.endDate.toLocaleDateString('id-ID');
    return `${startDate} - ${endDate}`;
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FiDownload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Ekspor Laporan
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Unduh laporan {getReportTypeLabel(reportType)} dalam berbagai format
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
              Detail Laporan
            </h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Jenis Laporan:</span>
                <span className="font-medium">{getReportTypeLabel(reportType)}</span>
              </div>
              <div className="flex justify-between">
                <span>Periode:</span>
                <span className="font-medium">{formatDateRange()}</span>
              </div>
              {filters.paymentMethod && (
                <div className="flex justify-between">
                  <span>Metode Pembayaran:</span>
                  <span className="font-medium">{filters.paymentMethod}</span>
                </div>
              )}
              {filters.status && (
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium">{filters.status}</span>
                </div>
              )}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-3">
              Pilih Format Ekspor
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exportOptions.map((option) => {
                const isCurrentlyExporting = 
                  exportState.format === option.format && exportState.status === "loading";
                const isSuccess = 
                  exportState.format === option.format && exportState.status === "success";
                const isError = 
                  exportState.format === option.format && exportState.status === "error";

                return (
                  <motion.div
                    key={option.format}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleExport(option.format)}
                      disabled={isExporting || isCurrentlyExporting}
                      className={`w-full h-auto p-4 flex flex-col items-center space-y-2 ${option.bgColor} border-2 ${
                        isSuccess
                          ? "border-green-300 dark:border-green-600"
                          : isError
                          ? "border-red-300 dark:border-red-600"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                        {isCurrentlyExporting ? (
                          <FiLoader className="w-6 h-6 text-white animate-spin" />
                        ) : isSuccess ? (
                          <FiCheck className="w-6 h-6 text-white" />
                        ) : isError ? (
                          <FiAlertCircle className="w-6 h-6 text-white" />
                        ) : (
                          <option.icon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      
                      <div className="text-center">
                        <div className={`font-medium ${option.textColor}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Status Message */}
          {exportState.status !== "idle" && exportState.message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg flex items-center space-x-2 ${
                exportState.status === "loading"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : exportState.status === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              }`}
            >
              {exportState.status === "loading" && (
                <FiLoader className="w-5 h-5 animate-spin" />
              )}
              {exportState.status === "success" && (
                <FiCheck className="w-5 h-5" />
              )}
              {exportState.status === "error" && (
                <FiAlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{exportState.message}</span>
            </motion.div>
          )}

          {/* Export Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              Tips Ekspor
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• PDF: Ideal untuk laporan yang akan dicetak atau dibagikan</li>
              <li>• Excel: Cocok untuk analisis data lebih lanjut</li>
              <li>• CSV: Format universal yang dapat dibuka di berbagai aplikasi</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
