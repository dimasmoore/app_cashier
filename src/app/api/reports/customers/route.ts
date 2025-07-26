import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    
    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    
    const customers = await prisma.customer.findMany({
      where,
      include: {
        transactions: {
          select: {
            id: true,
            total: true,
            createdAt: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    
    const formattedCustomers = customers.map(customer => {
      const completedTransactions = customer.transactions.filter(
        t => t.status === 'COMPLETED'
      );
      
      const totalSpent = completedTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.total), 
        0
      );

      const lastOrderDate = completedTransactions.length > 0 
        ? Math.max(...completedTransactions.map(t => new Date(t.createdAt).getTime()))
        : null;

      
      let customerStatus = 'active';
      if (completedTransactions.length === 0) {
        customerStatus = 'inactive';
      } else if (lastOrderDate) {
        const daysSinceLastOrder = (Date.now() - lastOrderDate) / (1000 * 60 * 60 * 24);
        if (daysSinceLastOrder > 90) {
          customerStatus = 'inactive';
        } else if (daysSinceLastOrder > 30) {
          customerStatus = 'dormant';
        }
      }

      return {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        totalOrders: completedTransactions.length,
        totalSpent: totalSpent,
        lastOrderDate: lastOrderDate ? new Date(lastOrderDate).toISOString() : null,
        status: customerStatus,
        
        firstName: customer.firstName,
        lastName: customer.lastName,
        address: customer.address,
        createdAt: customer.createdAt.toISOString(),
        allTransactions: customer.transactions.length,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedCustomers,
      total: formattedCustomers.length,
      summary: {
        totalCustomers: formattedCustomers.length,
        activeCustomers: formattedCustomers.filter(c => c.status === 'active').length,
        dormantCustomers: formattedCustomers.filter(c => c.status === 'dormant').length,
        inactiveCustomers: formattedCustomers.filter(c => c.status === 'inactive').length,
        totalRevenue: formattedCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
        averageOrderValue: formattedCustomers.length > 0 
          ? formattedCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / 
            formattedCustomers.reduce((sum, c) => sum + c.totalOrders, 0)
          : 0,
      },
    });

  } catch (error) {
    console.error("Error fetching customer report:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch customer report",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
