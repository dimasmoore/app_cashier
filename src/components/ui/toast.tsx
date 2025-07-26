"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: FiCheckCircle,
  error: FiXCircle,
  warning: FiAlertCircle,
  info: FiInfo,
};

const toastColors = {
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
};

const iconColors = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = toastIcons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`relative p-4 rounded-lg border shadow-lg backdrop-blur-sm max-w-sm ${toastColors[type]}`}
        >
          <div className="flex items-start space-x-3">
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{title}</p>
              {message && (
                <p className="text-sm opacity-90 mt-1">{message}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
}

// Simple toast manager for this implementation
let toastId = 0;
const toasts: ToastProps[] = [];
let setToastsCallback: ((toasts: ToastProps[]) => void) | null = null;

export function useToast() {
  const [toastList, setToastList] = useState<ToastProps[]>([]);

  useEffect(() => {
    setToastsCallback = setToastList;
    return () => {
      setToastsCallback = null;
    };
  }, []);

  const showToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastProps = {
      id,
      type,
      title,
      message,
      duration,
      onClose: (toastId) => {
        const updatedToasts = toasts.filter(t => t.id !== toastId);
        toasts.length = 0;
        toasts.push(...updatedToasts);
        if (setToastsCallback) {
          setToastsCallback([...toasts]);
        }
      },
    };

    toasts.push(newToast);
    if (setToastsCallback) {
      setToastsCallback([...toasts]);
    }
  };

  return { toastList, showToast };
}

export function ToastContainer() {
  const { toastList } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[10001] space-y-2">
      {toastList.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
