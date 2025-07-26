import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface TransactionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface CreateTransactionRequest {
  items: TransactionItem[];
  customerId?: string;
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateTransactionRequest = await request.json();
    const {
      items,
      customerId,
      paymentMethod,
      subtotal,
      taxAmount,
      total,
      notes,
    } = body;

    
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    if (!paymentMethod || !subtotal || !total) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    
    const result = await prisma.$transaction(async (tx) => {
      
      const productIds = items.map(item => item.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true,
        },
      });

      if (products.length !== items.length) {
        throw new Error("Some products not found or inactive");
      }

      
      for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }
      }

      
      const transaction = await tx.transaction.create({
        data: {
          transactionNumber,
          status: "COMPLETED",
          subtotal,
          taxAmount,
          discountAmount: 0,
          total,
          paymentMethod: paymentMethod as any,
          paymentStatus: "PAID",
          notes,
          customerId,
          userId: session.user.id,
        },
      });

      
      for (const item of items) {
        const product = products.find(p => p.id === item.productId)!;
        
        
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            discount: 0,
            productName: product.name,
            productSku: product.sku,
          },
        });

        
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            userId: session.user.id,
            type: "SALE",
            quantity: item.quantity,
            reason: `Sale - Transaction ${transactionNumber}`,
          },
        });
      }

      return transaction;
    });

    
    const completeTransaction = await prisma.transaction.findUnique({
      where: { id: result.id },
      include: {
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
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    
    const response = {
      id: completeTransaction!.id,
      transactionNumber: completeTransaction!.transactionNumber,
      status: completeTransaction!.status,
      subtotal: Number(completeTransaction!.subtotal),
      taxAmount: Number(completeTransaction!.taxAmount),
      total: Number(completeTransaction!.total),
      paymentMethod: completeTransaction!.paymentMethod,
      paymentStatus: completeTransaction!.paymentStatus,
      createdAt: completeTransaction!.createdAt,
      customer: completeTransaction!.customer,
      cashier: completeTransaction!.user,
      items: completeTransaction!.items.map(item => ({
        id: item.id,
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
