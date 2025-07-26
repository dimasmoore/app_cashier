"use client";

import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "text" | "chart" | "table" | "metric";
  count?: number;
}

const shimmer = {
  hidden: { opacity: 0.3 },
  visible: {
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: "reverse" as const,
      duration: 1.5
    }
  }
};

export default function LoadingSkeleton({ 
  className = "", 
  variant = "card",
  count = 1 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "metric":
        return (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <motion.div 
                variants={shimmer}
                initial="hidden"
                animate="visible"
                className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"
              />
              <motion.div 
                variants={shimmer}
                initial="hidden"
                animate="visible"
                className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded"
              />
            </div>
            <motion.div 
              variants={shimmer}
              initial="hidden"
              animate="visible"
              className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"
            />
            <motion.div 
              variants={shimmer}
              initial="hidden"
              animate="visible"
              className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"
            />
          </div>
        );

      case "chart":
        return (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <motion.div 
                variants={shimmer}
                initial="hidden"
                animate="visible"
                className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"
              />
              <div>
                <motion.div 
                  variants={shimmer}
                  initial="hidden"
                  animate="visible"
                  className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"
                />
                <motion.div 
                  variants={shimmer}
                  initial="hidden"
                  animate="visible"
                  className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded"
                />
              </div>
            </div>
            <motion.div 
              variants={shimmer}
              initial="hidden"
              animate="visible"
              className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded"
            />
          </div>
        );

      case "table":
        return (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg rounded-lg p-6">
            <motion.div 
              variants={shimmer}
              initial="hidden"
              animate="visible"
              className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6"
            />
            <div className="space-y-4">
              {/* Table header */}
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    variants={shimmer}
                    initial="hidden"
                    animate="visible"
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                  />
                ))}
              </div>
              {/* Table rows */}
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <motion.div 
                      key={colIndex}
                      variants={shimmer}
                      initial="hidden"
                      animate="visible"
                      className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                      style={{ animationDelay: `${(rowIndex * 5 + colIndex) * 0.1}s` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-2">
            <motion.div 
              variants={shimmer}
              initial="hidden"
              animate="visible"
              className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"
            />
            <motion.div 
              variants={shimmer}
              initial="hidden"
              animate="visible"
              className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded"
            />
          </div>
        );

      default: 
        return (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg rounded-lg p-6">
            <motion.div 
              variants={shimmer}
              initial="hidden"
              animate="visible"
              className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"
            />
            <motion.div 
              variants={shimmer}
              initial="hidden"
              animate="visible"
              className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded"
            />
          </div>
        );
    }
  };

  if (count === 1) {
    return <div className={className}>{renderSkeleton()}</div>;
  }

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}
