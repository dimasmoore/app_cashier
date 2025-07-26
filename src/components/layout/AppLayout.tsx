"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Sidebar, { NavigationItem } from "@/components/Sidebar";
import {
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiBarChart,
  FiSettings,
  FiUsers,
  FiMenu,
} from "react-icons/fi";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Define routes that should show the sidebar
const SIDEBAR_ROUTES = [
  "/Dashboard",
  "/Inventory",
  "/sales",
  "/customers",
  "/reports",
  "/settings",
];

// Define routes that should not show the sidebar
const NO_SIDEBAR_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
];

const AppLayout = memo(function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Determine if current route should show sidebar
  const shouldShowSidebar = useMemo(() => {
    // Don't show sidebar if not authenticated
    if (status === "loading" || !session) {
      return false;
    }

    // Don't show sidebar on excluded routes
    if (NO_SIDEBAR_ROUTES.includes(pathname)) {
      return false;
    }

    // Show sidebar on included routes or any protected route
    return SIDEBAR_ROUTES.some(route => pathname.startsWith(route)) || 
           !NO_SIDEBAR_ROUTES.includes(pathname);
  }, [pathname, session, status]);

  // Navigation items configuration
  const navigationItems: NavigationItem[] = useMemo(() => [
    { id: "dashboard", label: "Dasbor", icon: FiHome, href: "/Dashboard" },
    { id: "sales", label: "Penjualan", icon: FiShoppingCart, href: "/sales" },
    { id: "inventory", label: "Inventori", icon: FiPackage, href: "/Inventory" },
    { id: "customers", label: "Pelanggan", icon: FiUsers, href: "/customers" },
    { id: "reports", label: "Laporan", icon: FiBarChart, href: "/reports" },
    { id: "settings", label: "Pengaturan", icon: FiSettings, href: "/settings" },
  ], []);

  // Detect mobile screen size and initialize sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!isInitialized) {
        setSidebarOpen(!mobile);
        setIsInitialized(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isInitialized]);

  // Update active item based on current pathname
  useEffect(() => {
    const matchingItem = navigationItems.find(item => item.href === pathname);
    if (matchingItem) {
      setActiveItem(matchingItem.id);
    }
  }, [pathname, navigationItems]);

  // Sidebar toggle handlers
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleMobileMenuToggle = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(true);
    } else {
      toggleSidebar();
    }
  }, [isMobile, toggleSidebar]);

  const handleItemClick = useCallback((itemId: string) => {
    setActiveItem(itemId);
  }, []);

  const handleBackdropClick = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Memoized layout styles to prevent recalculation
  const layoutStyles = useMemo(() => ({
    marginLeft: shouldShowSidebar 
      ? (isMobile ? "0px" : (sidebarOpen ? "280px" : "80px"))
      : "0px",
  }), [shouldShowSidebar, isMobile, sidebarOpen]);

  // If we're on a route that doesn't need sidebar, render children directly
  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        navigationItems={navigationItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        onBackdropClick={handleBackdropClick}
      />

      {/* Floating Mobile Menu Button */}
      <AnimatePresence>
        {isMobile && !sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              scale: { type: "spring", stiffness: 300, damping: 20 }
            }}
            className="fixed top-4 right-4 z-[10000] pointer-events-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 0.1,
                scale: {
                  duration: 2,
                  repeat: 2,
                  ease: "easeInOut",
                  delay: 0.5
                }
              }}
            >
              <Button
                variant="default"
                size="lg"
                onClick={handleMobileMenuToggle}
                onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                aria-label="Buka menu navigasi"
                className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl touch-manipulation flex items-center justify-center border-0 transition-all duration-150"
              >
                <FiMenu className="w-6 h-6" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        animate={layoutStyles}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
});

export default AppLayout;
