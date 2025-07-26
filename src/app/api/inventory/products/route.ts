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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const supplierId = searchParams.get("supplierId") || "";
    const stockStatus = searchParams.get("stockStatus") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (search) {
      // MySQL-compatible case-insensitive search using LIKE operator
      // Note: MySQL's LIKE operator is case-insensitive by default with utf8_general_ci collation
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    // Note: Low stock filtering will be handled in application logic after fetching
    // since Prisma doesn't support comparing two fields directly in MySQL
    if (stockStatus === "out") {
      where.stock = { lte: 0 };
    }

    // Fetch products first
    let allProducts = await prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true,
        productImages: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Apply low stock filtering in application logic if needed
    if (stockStatus === "low") {
      allProducts = allProducts.filter(product =>
        product.stock > 0 && product.stock <= product.minStock
      );
    }

    // Calculate pagination after filtering
    const total = allProducts.length;
    const products = allProducts.slice(skip, skip + limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!name || !sku || !price || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate SKU or barcode
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { sku },
          ...(barcode ? [{ barcode }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "SKU atau barcode sudah digunakan" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        barcode,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : null,
        stock: parseInt(stock) || 0,
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

    // Create initial stock movement
    if (parseInt(stock) > 0) {
      await prisma.stockMovement.create({
        data: {
          type: "IN",
          quantity: parseInt(stock),
          reason: "Stok awal produk",
          productId: product.id,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
