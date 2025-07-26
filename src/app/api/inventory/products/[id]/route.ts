import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        supplier: true,
        productImages: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        stockMovements: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      sku,
      barcode,
      price,
      cost,
      stock,
      minStock,
      maxStock,
      categoryId,
      supplierId,
    } = body;

    
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    
    const duplicate = await prisma.product.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          {
            OR: [
              { sku },
              ...(barcode ? [{ barcode }] : []),
            ],
          },
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "SKU atau barcode sudah digunakan" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        sku,
        barcode,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : null,
        stock: parseInt(stock),
        minStock: parseInt(minStock) || 0,
        maxStock: maxStock ? parseInt(maxStock) : null,
        categoryId,
        supplierId,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    
    const stockDifference = parseInt(stock) - existingProduct.stock;
    if (stockDifference !== 0) {
      await prisma.stockMovement.create({
        data: {
          type: stockDifference > 0 ? "IN" : "OUT",
          quantity: Math.abs(stockDifference),
          reason: "Penyesuaian stok manual",
          productId: product.id,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
