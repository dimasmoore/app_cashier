"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Customer, CustomerFormData, CustomerModalMode } from "@/types/customer";
import CustomerForm from "./CustomerForm";

interface CustomerModalProps {
  isOpen: boolean;
  customer?: Customer | null;
  mode: CustomerModalMode;
  isLoading: boolean;
  onSubmit: (data: CustomerFormData) => void;
  onClose: () => void;
}

const CustomerModal = ({
  isOpen,
  customer,
  mode,
  isLoading,
  onSubmit,
  onClose,
}: CustomerModalProps) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CustomerForm
              customer={customer}
              mode={mode}
              isLoading={isLoading}
              onSubmit={onSubmit}
              onCancel={onClose}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomerModal;
