import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current date and yesterday's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Fetch today's sales data
    const todayTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        status: "COMPLETED",
        paymentStatus: "PAID",
      },
      select: {
        total: true,
      },
    });

    // Fetch yesterday's sales data for comparison
    const yesterdayTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
        status: "COMPLETED",
        paymentStatus: "PAID",
      },
      select: {
        total: true,
      },
    });

    // Calculate today's sales
    const todaySales = todayTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.total),
      0
    );

    // Calculate yesterday's sales
    const yesterdaySales = yesterdayTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.total),
      0
    );

    // Calculate sales percentage change
    const salesChange = yesterdaySales > 0 
      ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 
      : todaySales > 0 ? 100 : 0;

    // Get transaction counts
    const todayTransactionCount = todayTransactions.length;
    const yesterdayTransactionCount = yesterdayTransactions.length;

    // Calculate transaction percentage change
    const transactionChange = yesterdayTransactionCount > 0 
      ? ((todayTransactionCount - yesterdayTransactionCount) / yesterdayTransactionCount) * 100 
      : todayTransactionCount > 0 ? 100 : 0;

    // Get active customers (customers who made transactions in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeCustomersToday = await prisma.customer.count({
      where: {
        isActive: true,
        transactions: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo,
              lt: tomorrow,
            },
            status: "COMPLETED",
          },
        },
      },
    });

    const activeCustomersYesterday = await prisma.customer.count({
      where: {
        isActive: true,
        transactions: {
          some: {
            createdAt: {
              gte: new Date(thirtyDaysAgo.getTime() - 24 * 60 * 60 * 1000),
              lt: today,
            },
            status: "COMPLETED",
          },
        },
      },
    });

    // Calculate customer percentage change
    const customerChange = activeCustomersYesterday > 0 
      ? ((activeCustomersToday - activeCustomersYesterday) / activeCustomersYesterday) * 100 
      : activeCustomersToday > 0 ? 100 : 0;

    // Get total product stock
    const totalStock = await prisma.product.aggregate({
      where: {
        isActive: true,
      },
      _sum: {
        stock: true,
      },
    });

    // Get yesterday's total stock for comparison
    // Since we don't have historical stock data, we'll calculate based on stock movements
    const stockMovementsToday = await prisma.stockMovement.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        type: true,
        quantity: true,
      },
    });

    // Calculate stock change based on today's movements
    let stockChangeQuantity = 0;
    stockMovementsToday.forEach(movement => {
      if (movement.type === "IN") {
        stockChangeQuantity += movement.quantity;
      } else if (movement.type === "OUT" || movement.type === "SALE") {
        stockChangeQuantity -= movement.quantity;
      }
    });

    const currentTotalStock = totalStock._sum.stock || 0;
    const previousTotalStock = currentTotalStock - stockChangeQuantity;
    
    // Calculate stock percentage change
    const stockChange = previousTotalStock > 0 
      ? (stockChangeQuantity / previousTotalStock) * 100 
      : stockChangeQuantity > 0 ? 100 : 0;

    // Format the response
    const dashboardStats = {
      dailySales: {
        value: todaySales,
        change: salesChange,
        changeType: salesChange > 0 ? "increase" : salesChange < 0 ? "decrease" : "neutral",
      },
      transactions: {
        value: todayTransactionCount,
        change: transactionChange,
        changeType: transactionChange > 0 ? "increase" : transactionChange < 0 ? "decrease" : "neutral",
      },
      activeCustomers: {
        value: activeCustomersToday,
        change: customerChange,
        changeType: customerChange > 0 ? "increase" : customerChange < 0 ? "decrease" : "neutral",
      },
      productStock: {
        value: currentTotalStock,
        change: stockChange,
        changeType: stockChange > 0 ? "increase" : stockChange < 0 ? "decrease" : "neutral",
      },
    };

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
