"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReportsChartsProps } from "@/types/reports";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiTrendingUp,
  FiPieChart,
  FiBarChart,
  FiActivity,
} from "react-icons/fi";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const COLORS = [
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
];

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="animate-pulse">
            <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsCharts({
  salesData,
  isLoading = false,
}: ReportsChartsProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Format data for charts
  const salesTrendData = salesData.salesTrend.map(item => ({
    date: new Date(item.date).toLocaleDateString('id-ID', { 
      month: 'short', 
      day: 'numeric' 
    }),
    penjualan: item.sales,
    pendapatan: item.revenue,
    transaksi: item.transactions,
  }));

  const categoryData = salesData.salesByCategory.map(item => ({
    name: item.categoryName,
    value: item.totalSales,
    revenue: item.totalRevenue,
    percentage: item.percentage,
  }));

  const paymentMethodData = salesData.paymentMethodBreakdown.map(item => ({
    method: item.method,
    count: item.count,
    amount: item.amount,
    percentage: item.percentage,
  }));

  const topProductsData = salesData.topProducts.slice(0, 10).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    quantity: item.quantitySold,
    revenue: item.revenue,
  }));

  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Sales Trend Chart */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FiTrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Tren Penjualan
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Perkembangan penjualan dari waktu ke waktu
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesTrendData}>
              <defs>
                <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="penjualan"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorPenjualan)"
                name="Penjualan"
              />
              <Area
                type="monotone"
                dataKey="pendapatan"
                stroke="#6366F1"
                fillOpacity={1}
                fill="url(#colorPendapatan)"
                name="Pendapatan"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FiPieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Penjualan per Kategori
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Distribusi penjualan berdasarkan kategori produk
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FiBarChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Produk Terlaris
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                10 produk dengan penjualan tertinggi
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" fontSize={12} />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="#6B7280" 
                fontSize={12}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="quantity" 
                fill="#8B5CF6" 
                name="Kuantitas Terjual"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FiActivity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Metode Pembayaran
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Distribusi transaksi berdasarkan metode pembayaran
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentMethodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="method" 
                stroke="#6B7280" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#10B981" 
                name="Jumlah Transaksi"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
