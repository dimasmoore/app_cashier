"use client";

import { motion, Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ReportsSummaryCardsProps, ReportMetric } from "@/types/reports";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.2,
    },
  },
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const MetricCard = ({ metric }: { metric: ReportMetric }) => {
  const isPositive = metric.changeType === "increase";
  const isNegative = metric.changeType === "decrease";
  
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="relative"
    >
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          {/* Header with Icon and Change */}
          <div className="flex items-center justify-between mb-4">
            <div 
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.color}`}
            >
              <metric.icon className="w-6 h-6 text-white" />
            </div>
            
            {metric.change && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                isPositive 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : isNegative
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}>
                {isPositive && <FiTrendingUp className="w-3 h-3" />}
                {isNegative && <FiTrendingDown className="w-3 h-3" />}
                <span>{metric.change}</span>
              </div>
            )}
          </div>

          {/* Value */}
          <div className="mb-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-2xl font-bold text-gray-800 dark:text-white"
            >
              {metric.prefix}{metric.value}{metric.suffix}
            </motion.div>
          </div>

          {/* Title */}
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {metric.title}
          </div>

          {/* Gradient Accent */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-lg ${metric.color.replace('bg-gradient-to-r', 'bg-gradient-to-r')}`}></div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ReportsSummaryCards({ 
  metrics, 
  isLoading = false 
}: ReportsSummaryCardsProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </motion.div>
  );
}
