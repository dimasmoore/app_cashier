import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateDateRange, sanitizeSearchQuery } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = sanitizeSearchQuery(searchParams.get("search") || "");
    const paymentMethod = searchParams.get("paymentMethod");
    const status = searchParams.get("status");

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Parse and validate date range
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

    // Build where clause
    const where: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { transactionNumber: { contains: search } },
        { customer: { firstName: { contains: search } } },
        { customer: { lastName: { contains: search } } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({ where });

    // Get transactions with pagination
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format transaction data
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      transactionNumber: transaction.transactionNumber,
      date: transaction.createdAt.toISOString(), // Map createdAt to date for consistency
      customerName: transaction.customer ?
        `${transaction.customer.firstName} ${transaction.customer.lastName}` : null,
      items: transaction.items.length,
      subtotal: Number(transaction.subtotal || 0),
      tax: Number(transaction.tax || 0),
      discount: Number(transaction.discount || 0),
      total: Number(transaction.total),
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      // Additional fields for detailed view
      paymentStatus: transaction.paymentStatus,
      createdAt: transaction.createdAt.toISOString(),
      customer: transaction.customer ? {
        name: `${transaction.customer.firstName} ${transaction.customer.lastName}`,
      } : null,
      cashier: {
        name: `${transaction.user.firstName} ${transaction.user.lastName}`,
      },
      itemCount: transaction.items.length,
      itemDetails: transaction.items.map(item => ({
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        search,
        paymentMethod,
        status,
      },
    });
  } catch (error) {
    console.error("Error fetching transaction report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
