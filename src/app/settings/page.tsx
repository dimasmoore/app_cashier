"use client";

import { useState, useEffect } from "react";
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
import {
  FiHome,
  FiChevronRight,
  FiSettings,
  FiUser,
  FiLock,
  FiBell,
  FiDatabase,
  FiMonitor,
} from "react-icons/fi";

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

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  usePageTitle("Pengaturan");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const settingsCategories = [
    {
      id: "profile",
      title: "Profil Pengguna",
      description: "Kelola informasi akun dan preferensi pribadi",
      icon: FiUser,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "security",
      title: "Keamanan",
      description: "Pengaturan kata sandi dan keamanan akun",
      icon: FiLock,
      color: "from-green-500 to-green-600",
    },
    {
      id: "notifications",
      title: "Notifikasi",
      description: "Atur preferensi notifikasi dan peringatan",
      icon: FiBell,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      id: "system",
      title: "Sistem",
      description: "Konfigurasi sistem dan pengaturan aplikasi",
      icon: FiDatabase,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "display",
      title: "Tampilan",
      description: "Personalisasi tema dan tampilan aplikasi",
      icon: FiMonitor,
      color: "from-indigo-500 to-indigo-600",
    },
  ];

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
              Pengaturan
            </span>
          </div>

          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FiSettings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Pengaturan Sistem
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Kelola konfigurasi dan preferensi aplikasi POS
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors duration-300"
                    >
                      Kelola Pengaturan
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Informasi Sistem
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">v1.0.0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Versi Aplikasi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Status Sistem</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{session.user?.email}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pengguna Aktif</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
