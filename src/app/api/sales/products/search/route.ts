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
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          gt: 0, 
        },
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            sku: {
              contains: query,
            },
          },
          {
            barcode: {
              contains: query,
            },
          },
        ],
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
      orderBy: [
        {
          name: "asc",
        },
      ],
      take: 20, 
    });

    
    const formattedProducts = products.map((product) => ({
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
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
