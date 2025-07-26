"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiLogOut,
} from "react-icons/fi";

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  navigationItems: NavigationItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  onBackdropClick?: () => void;
}

const Sidebar = memo(function Sidebar({
  isOpen,
  onToggle,
  navigationItems,
  activeItem,
  onItemClick,
  onBackdropClick,
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle navigation - memoized to prevent re-creation on every render
  const handleNavigation = useCallback((item: NavigationItem) => {
    try {
      // Call the onItemClick prop to update active state
      onItemClick(item.id);

      // Navigate to the route
      router.push(item.href);

      // Close sidebar on mobile after navigation
      if (isMobile) {
        onToggle();
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  }, [onItemClick, router, isMobile, onToggle]);

  // Handle logout functionality - memoized to prevent re-creation
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        callbackUrl: "/",
        redirect: true
      });
    } catch (error) {
      console.error("Sidebar logout error:", error);
      setIsLoggingOut(false);
    }
  }, []);

  // Determine active item based on current pathname - memoized to prevent recalculation
  const currentActiveItem = useMemo(() => {
    const matchingItem = navigationItems.find(item => item.href === pathname);
    return matchingItem?.id || activeItem;
  }, [pathname, navigationItems, activeItem]);

  // Memoized animation variants to prevent object recreation
  const sidebarAnimationProps = useMemo(() => ({
    initial: false,
    animate: {
      width: isMobile ? "280px" : (isOpen ? "280px" : "80px"),
      x: isMobile && !isOpen ? "-280px" : "0px",
    },
    transition: { duration: 0.3, ease: "easeInOut" as const },
  }), [isMobile, isOpen]);

  const backdropAnimationProps = useMemo(() => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  }), []);

  const headerAnimationProps = useMemo(() => ({
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 },
  }), []);

  const iconAnimationProps = useMemo(() => ({
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
    transition: { duration: 0.2 },
  }), []);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            {...backdropAnimationProps}
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={onBackdropClick || onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        {...sidebarAnimationProps}
        className="fixed left-0 top-0 h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 shadow-xl z-[9999]"
        style={{
          width: isMobile ? "280px" : undefined,
        }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.div
                    {...headerAnimationProps}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <FiShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                        Sistem POS
                      </h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Portal Kasir
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                variant="ghost"
                size={isMobile ? "lg" : "sm"}
                onClick={onToggle}
                className={`${isMobile ? "p-3 min-h-[44px] min-w-[44px]" : "p-2"} hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation flex items-center justify-center`}
              >
                {isOpen ? (
                  <FiX className={`${isMobile ? "w-6 h-6" : "w-5 h-5"}`} />
                ) : (
                  <FiMenu className={`${isMobile ? "w-6 h-6" : "w-5 h-5"}`} />
                )}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={currentActiveItem === item.id ? "default" : "ghost"}
                  size="lg"
                  onClick={() => handleNavigation(item)}
                  className={`w-full justify-start touch-manipulation ${
                    currentActiveItem === item.id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        {...iconAnimationProps}
                        className="ml-3"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {isLoggingOut ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full"
                  />
                ) : (
                  <FiLogOut className="w-5 h-5" />
                )}
                <AnimatePresence mode="wait">
                  {isOpen && (
                    <motion.span
                      {...iconAnimationProps}
                      className="ml-3"
                    >
                      {isLoggingOut ? "Keluar..." : "Keluar"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
});

export default Sidebar;
