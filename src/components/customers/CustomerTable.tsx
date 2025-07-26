"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Customer, CustomerFilters } from "@/types/customer";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: CustomerFilters;
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onPageChange: (page: number) => void;
  onSort: (field: string) => void;
}

const CustomerTable = ({
  customers,
  isLoading,
  pagination,
  filters,
  onEdit,
  onView,
  onDelete,
  onPageChange,
  onSort,
}: CustomerTableProps) => {
  const [sortField, setSortField] = useState(filters.sortBy || "createdAt");
  const [sortOrder, setSortOrder] = useState(filters.sortOrder || "desc");

  const handleSort = (field: string) => {
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
    onSort(`${field}:${newOrder}`);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return "-";
    return phone.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <tr>
                <th className="px-6 py-4 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("firstName")}
                    className="font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  >
                    Nama
                    {sortField === "firstName" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </Button>
                </th>
                <th className="px-6 py-4 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("email")}
                    className="font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  >
                    Email
                    {sortField === "email" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </Button>
                </th>
                <th className="px-6 py-4 text-left hidden md:table-cell">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Telepon
                  </span>
                </th>
                <th className="px-6 py-4 text-left hidden lg:table-cell">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Transaksi
                  </span>
                </th>
                <th className="px-6 py-4 text-left hidden lg:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("createdAt")}
                    className="font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  >
                    Terdaftar
                    {sortField === "createdAt" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </Button>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Aksi
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {customers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.firstName.charAt(0)}
                        {customer.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 md:hidden">
                          {customer.email || "Tidak ada email"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center space-x-2">
                      {customer.email ? (
                        <>
                          <FiMail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {customer.email}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                          Tidak ada email
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center space-x-2">
                      {customer.phone ? (
                        <>
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {formatPhoneNumber(customer.phone)}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                          Tidak ada telepon
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center space-x-2">
                      <FiShoppingCart className="w-4 h-4 text-gray-400" />
                      <Badge variant="secondary">
                        {customer._count?.transactions || 0} transaksi
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(customer.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(customer)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <FiEye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(customer)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(customer)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              Tidak ada pelanggan ditemukan
            </div>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)}{" "}
              dari {pagination.totalCount} pelanggan
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
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
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center space-x-1"
              >
                <span>Selanjutnya</span>
                <FiChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerTable;
