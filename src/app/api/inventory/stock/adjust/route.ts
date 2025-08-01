import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, type, quantity, reason, notes } = body;

    if (!productId || !type || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Data tidak lengkap atau tidak valid" },
        { status: 400 }
      );
    }

    
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    
    let newStock = product.stock;
    const adjustmentQuantity = parseInt(quantity);

    switch (type) {
      case "IN":
        newStock += adjustmentQuantity;
        break;
      case "OUT":
        newStock -= adjustmentQuantity;
        break;
      case "ADJUSTMENT":
        newStock = adjustmentQuantity; 
        break;
      default:
        return NextResponse.json(
          { error: "Tipe penyesuaian tidak valid" },
          { status: 400 }
        );
    }

    
    if (newStock < 0) {
      return NextResponse.json(
        { error: "Stok tidak boleh kurang dari 0" },
        { status: 400 }
      );
    }

    
    const result = await prisma.$transaction(async (tx) => {
      
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
        include: {
          category: true,
          supplier: true,
        },
      });

      
      const stockMovement = await tx.stockMovement.create({
        data: {
          type,
          quantity: adjustmentQuantity,
          reason: reason || "Penyesuaian stok",
          notes,
          productId,
          userId: session.user.id,
        },
        include: {
          user: true,
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      });

      return { product: updatedProduct, stockMovement };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error adjusting stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
