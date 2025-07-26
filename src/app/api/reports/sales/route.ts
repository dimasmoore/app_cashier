import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateDateRange, sanitizeSearchQuery } from "@/lib/validation";
import { cache, generateSalesReportCacheKey, CACHE_TTL } from "@/lib/cache";
import { measureDatabaseQuery, measureApiCall } from "@/lib/performance";

export async function GET(request: NextRequest) {
  return measureApiCall('sales-report', async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("reportType") || "sales";

    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    
    try {
      validateDateRange(start, end);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid date range" },
        { status: 400 }
      );
    }

    
    end.setHours(23, 59, 59, 999);

    
    const cacheKey = generateSalesReportCacheKey(
      start.toISOString(),
      end.toISOString(),
      reportType
    );

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        filters: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          reportType,
        },
        cached: true,
      });
    }

    
    const transactions = await measureDatabaseQuery('sales-transactions', () =>
      prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: "COMPLETED",
        paymentStatus: "PAID",
      },
      select: {
        id: true,
        total: true,
        paymentMethod: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            totalPrice: true,
            productId: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                categoryId: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      
      orderBy: {
        createdAt: 'desc',
      },
    }), { dateRange: `${start.toISOString()}-${end.toISOString()}` });

    
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.total), 0);
    const totalSales = transactions.reduce((sum, t) =>
      sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    
    const productSales = new Map<string, {
      id: string;
      name: string;
      sku: string;
      quantitySold: number;
      revenue: number;
      category: string;
    }>();

    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const key = item.productId;
        const existing = productSales.get(key);
        if (existing) {
          existing.quantitySold += item.quantity;
          existing.revenue += Number(item.totalPrice);
        } else {
          productSales.set(key, {
            id: item.product.id,
            name: item.product.name,
            sku: item.product.sku,
            quantitySold: item.quantity,
            revenue: Number(item.totalPrice),
            category: item.product.category.name,
          });
        }
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);
    
    const categorySales = new Map<string, {
      categoryId: string;
      categoryName: string;
      totalSales: number;
      totalRevenue: number;
      percentage: number;
    }>();

    transactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const key = item.product.categoryId;
        const existing = categorySales.get(key);
        if (existing) {
          existing.totalSales += item.quantity;
          existing.totalRevenue += Number(item.totalPrice);
        } else {
          categorySales.set(key, {
            categoryId: item.product.categoryId,
            categoryName: item.product.category.name,
            totalSales: item.quantity,
            totalRevenue: Number(item.totalPrice),
            percentage: 0, 
          });
        }
      });
    });

    
    const salesByCategory = Array.from(categorySales.values());
    salesByCategory.forEach(category => {
      category.percentage = totalRevenue > 0 ?
        Math.round((category.totalRevenue / totalRevenue) * 100) : 0;
    });
    salesByCategory.sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    const salesTrendMap = new Map<string, {
      date: string;
      sales: number;
      revenue: number;
      transactions: number;
    }>();

    transactions.forEach(transaction => {
      const dateKey = transaction.createdAt.toISOString().split('T')[0];
      const existing = salesTrendMap.get(dateKey);
      const transactionSales = transaction.items.reduce((sum, item) => sum + item.quantity, 0);

      if (existing) {
        existing.sales += transactionSales;
        existing.revenue += Number(transaction.total);
        existing.transactions += 1;
      } else {
        salesTrendMap.set(dateKey, {
          date: dateKey,
          sales: transactionSales,
          revenue: Number(transaction.total),
          transactions: 1,
        });
      }
    });

    const salesTrend = Array.from(salesTrendMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    
    const paymentMethodMap = new Map<string, {
      method: string;
      count: number;
      amount: number;
      percentage: number;
    }>();

    transactions.forEach(transaction => {
      const method = transaction.paymentMethod;
      const existing = paymentMethodMap.get(method);

      if (existing) {
        existing.count += 1;
        existing.amount += Number(transaction.total);
      } else {
        paymentMethodMap.set(method, {
          method: method,
          count: 1,
          amount: Number(transaction.total),
          percentage: 0, 
        });
      }
    });

    
    const paymentMethodBreakdown = Array.from(paymentMethodMap.values());
    paymentMethodBreakdown.forEach(method => {
      method.percentage = totalRevenue > 0 ?
        Math.round((method.amount / totalRevenue) * 100) : 0;
    });
    paymentMethodBreakdown.sort((a, b) => b.amount - a.amount);

    const salesData = {
      totalSales,
      totalTransactions,
      averageOrderValue,
      totalRevenue,
      topProducts,
      salesByCategory,
      salesTrend,
      paymentMethodBreakdown,
      
      lastUpdated: new Date().toISOString(),
      dateRange: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      isRealTime: true,
    };

    
    cache.set(cacheKey, salesData, CACHE_TTL.SALES_REPORT);

    return NextResponse.json({
      success: true,
      data: salesData,
      filters: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        reportType,
      },
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
  });
}
