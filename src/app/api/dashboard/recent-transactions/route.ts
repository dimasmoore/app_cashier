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

    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        status: "COMPLETED",
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    
    const formattedTransactions = recentTransactions.map((transaction) => ({
      id: transaction.id,
      transactionNumber: transaction.transactionNumber,
      total: Number(transaction.total),
      paymentMethod: transaction.paymentMethod,
      paymentStatus: transaction.paymentStatus,
      status: transaction.status,
      createdAt: transaction.createdAt,
      customer: transaction.customer ? {
        name: `${transaction.customer.firstName} ${transaction.customer.lastName}`,
      } : null,
      cashier: {
        name: `${transaction.user.firstName} ${transaction.user.lastName}`,
      },
      itemCount: transaction.items.length,
      items: transaction.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
