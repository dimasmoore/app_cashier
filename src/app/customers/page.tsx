"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FiHome,
  FiChevronRight,
  FiChevronLeft,
  FiUsers,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiGrid,
  FiList,
} from "react-icons/fi";
import {
  CustomerTable,
  CustomerModal,
  CustomerCard,
} from "@/components/customers";
import {
  Customer,
  CustomerFormData,
  CustomerFilters,
  CustomerListResponse,
  CustomerModalMode,
} from "@/types/customer";

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



export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<CustomerModalMode>("create");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  usePageTitle("Pelanggan");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: filters.page?.toString() || "1",
        limit: filters.limit?.toString() || "10",
        ...(filters.search && { search: filters.search }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });

      const response = await fetch(`/api/sales/customers?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data: CustomerListResponse = await response.json();
      setCustomers(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));
  }, []);

  const handleSort = useCallback((sortString: string) => {
    const [field, order] = sortString.split(":");
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: order as "asc" | "desc",
      page: 1,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreateCustomer = () => {
    setModalMode("create");
    setSelectedCustomer(null);
    setShowModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setModalMode("edit");
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setModalMode("view");
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pelanggan ${customer.firstName} ${customer.lastName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sales/customers/${customer.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete customer");
      }

      await fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Gagal menghapus pelanggan");
    }
  };

  const handleSubmitCustomer = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);
      const url = modalMode === "create" 
        ? "/api/sales/customers"
        : `/api/sales/customers/${selectedCustomer?.id}`;
      
      const method = modalMode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save customer");
      }

      setShowModal(false);
      await fetchCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("Gagal menyimpan pelanggan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4 md:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants}>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <FiHome className="w-4 h-4" />
            <span>Dashboard</span>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Pelanggan
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Manajemen Pelanggan
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Kelola data pelanggan dan riwayat transaksi
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2"
              >
                <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                >
                  <FiList className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <FiGrid className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={handleCreateCustomer}
                className="bg-blue-600 hover:bg-blue-700 text-white relative z-10"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Tambah Pelanggan</span>
                <span className="sm:hidden">Tambah</span>
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Cari pelanggan..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Total: {pagination.totalCount} pelanggan</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {viewMode === "table" ? (
                <CustomerTable
                  customers={customers}
                  isLoading={isLoading}
                  pagination={pagination}
                  filters={filters}
                  onEdit={handleEditCustomer}
                  onView={handleViewCustomer}
                  onDelete={handleDeleteCustomer}
                  onPageChange={handlePageChange}
                  onSort={handleSort}
                />
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers.map((customer, index) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        index={index}
                        onEdit={handleEditCustomer}
                        onView={handleViewCustomer}
                        onDelete={handleDeleteCustomer}
                      />
                    ))}
                  </div>
                  
                  {customers.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <div className="text-gray-500 dark:text-gray-400">
                        Tidak ada pelanggan ditemukan
                      </div>
                    </div>
                  )}

                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.totalCount)}{" "}
                        dari {pagination.totalCount} pelanggan
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={!pagination.hasPrev}
                          className="flex items-center space-x-1"
                        >
                          <FiChevronLeft className="w-4 h-4" />
                          <span>Sebelumnya</span>
                        </Button>
                        <span className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {pagination.page} / {pagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={!pagination.hasNext}
                          className="flex items-center space-x-1"
                        >
                          <span>Selanjutnya</span>
                          <FiChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <CustomerModal
        isOpen={showModal}
        customer={selectedCustomer}
        mode={modalMode}
        isLoading={isSubmitting}
        onSubmit={handleSubmitCustomer}
        onClose={handleCloseModal}
      />
    </div>
  );
}
