"use client";

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
} from "react-icons/fi";
import { Customer } from "@/types/customer";

interface CustomerCardProps {
  customer: Customer;
  index: number;
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomerCard = ({
  customer,
  index,
  onEdit,
  onView,
  onDelete,
}: CustomerCardProps) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return null;
    return phone.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {customer.firstName.charAt(0)}
                {customer.lastName.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {customer.firstName} {customer.lastName}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <FiCalendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Bergabung {formatDate(customer.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(customer)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
              >
                <FiEye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(customer)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2"
              >
                <FiEdit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(customer)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
              >
                <FiTrash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {customer.email && (
              <div className="flex items-center space-x-2">
                <FiMail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {customer.email}
                </span>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center space-x-2">
                <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formatPhoneNumber(customer.phone)}
                </span>
              </div>
            )}

            {customer.address && (
              <div className="flex items-start space-x-2">
                <FiMapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {customer.address}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <FiShoppingCart className="w-4 h-4 text-gray-400" />
                <Badge variant="secondary" className="text-xs">
                  {customer._count?.transactions || 0} transaksi
                </Badge>
              </div>
              
              {customer.dateOfBirth && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Lahir {formatDate(customer.dateOfBirth)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CustomerCard;
