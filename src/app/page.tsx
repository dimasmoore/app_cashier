"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShoppingCart,
  FiCreditCard,
  FiDollarSign,
  FiAlertCircle,
} from "react-icons/fi";

export default function CashierLogin() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const router = useRouter();
  const { data: session, status } = useSession();

  
  useEffect(() => {
    if (status === "loading") return; 

    if (session) {
      router.push("/Dashboard");
      return;
    }

    setIsCheckingSession(false);
  }, [session, status, router]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        
        router.push("/Dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md relative z-10"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              variants={iconVariants}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg"
            >
              <FiShoppingCart className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Portal Kasir
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Masuk untuk mengakses sistem POS Anda
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <FiAlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {error}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Email Input */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Input
                      type="email"
                      label="Alamat Email"
                      placeholder="Masukkan email Anda"
                      value={email}
                      onValueChange={setEmail}
                      startContent={
                        <FiUser className="text-gray-400 pointer-events-none flex-shrink-0" />
                      }
                      variant="bordered"
                      size="lg"
                      className="text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-blue-400 focus-within:border-blue-500"
                      required
                    />
                  </motion.div>

                  {/* Password Input */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Input
                      label="Kata Sandi"
                      placeholder="Masukkan kata sandi Anda"
                      value={password}
                      onValueChange={setPassword}
                      startContent={
                        <FiLock className="text-gray-400 pointer-events-none flex-shrink-0" />
                      }
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={toggleVisibility}
                        >
                          {isVisible ? (
                            <FiEyeOff className="text-gray-400 hover:text-gray-600 transition-colors" />
                          ) : (
                            <FiEye className="text-gray-400 hover:text-gray-600 transition-colors" />
                          )}
                        </button>
                      }
                      type={isVisible ? "text" : "password"}
                      variant="bordered"
                      size="lg"
                      className="text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-blue-400 focus-within:border-blue-500"
                      required
                    />
                  </motion.div>

                  {/* Remember Me & Forgot Password */}
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-between"
                  >
                    <Checkbox
                      isSelected={rememberMe}
                      onValueChange={setRememberMe}
                      size="sm"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Ingat saya
                    </Checkbox>
                    <Link
                      href="#"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Lupa kata sandi?
                    </Link>
                  </motion.div>

                  {/* Login Button */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg"
                      isLoading={isLoading}
                      spinner={
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      }
                    >
                      {isLoading ? "Masuk..." : "Masuk"}
                    </Button>
                  </motion.div>

                  {/* Divider */}
                  <motion.div variants={itemVariants} className="relative">
                    <Separator className="my-6" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-white dark:bg-gray-800 px-4 text-sm text-gray-500 dark:text-gray-400">
                        Akses Cepat
                      </span>
                    </div>
                  </motion.div>

                  {/* Quick Access Buttons */}
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-4"
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        startContent={<FiCreditCard className="w-4 h-4" />}
                      >
                        Pembaca Kartu
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-gray-200 dark:border-gray-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                        startContent={<FiDollarSign className="w-4 h-4" />}
                      >
                        Tunai Saja
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer - Moved to bottom of page */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center py-6 text-sm text-gray-500 dark:text-gray-400"
      >
        <p>© 2025 Sistem POS. Semua hak dilindungi.</p>
        <p className="mt-1">Butuh bantuan? Hubungi Dukungan IT</p>
      </motion.div>
    </div>
  );
}
