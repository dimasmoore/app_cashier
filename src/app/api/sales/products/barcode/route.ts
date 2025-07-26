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

    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get("barcode");

    if (!barcode) {
      return NextResponse.json(
        { error: "Barcode is required" },
        { status: 400 }
      );
    }

    // Search for product by barcode
    const product = await prisma.product.findFirst({
      where: {
        barcode,
        isActive: true,
        stock: {
          gt: 0, // Only show products with stock
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        productImages: {
          where: {
            isActive: true,
            isPrimary: true,
          },
          select: {
            url: true,
          },
          take: 1,
        },
      },
    });

    if (!product) {
      // Log the barcode scan attempt
      await prisma.barcodeLog.create({
        data: {
          barcode,
          scanResult: "NOT_FOUND",
          productFound: false,
          userId: session.user.id,
          errorMessage: "Product not found or out of stock",
        },
      });

      return NextResponse.json(
        { error: "Product not found or out of stock" },
        { status: 404 }
      );
    }

    // Log successful barcode scan
    await prisma.barcodeLog.create({
      data: {
        barcode,
        scanResult: "SUCCESS",
        productFound: true,
        productId: product.id,
        userId: session.user.id,
      },
    });

    // Format the response
    const formattedProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      price: Number(product.price),
      stock: product.stock,
      category: {
        name: product.category.name,
      },
      primaryImageUrl: product.productImages[0]?.url || null,
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("Error scanning barcode:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
