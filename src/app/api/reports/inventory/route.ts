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
      where.updatedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status && status !== "all") {
      
      const statusMap: { [key: string]: string } = {
        'in_stock': 'IN_STOCK',
        'low_stock': 'LOW_STOCK',
        'out_of_stock': 'OUT_OF_STOCK',
      };
      where.status = statusMap[status] || status.toUpperCase();
    }

    
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    
    const formattedInventory = products.map(product => {
      
      let stockStatus = 'in_stock';
      if (product.stock === 0) {
        stockStatus = 'out_of_stock';
      } else if (product.stock <= (product.minStock || 10)) {
        stockStatus = 'low_stock';
      }

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category?.name || 'Uncategorized',
        currentStock: product.stock,
        minStock: product.minStock || 10,
        value: Number(product.price) * product.stock,
        status: stockStatus,
        lastUpdated: product.updatedAt.toISOString(),
        
        price: Number(product.price),
        description: product.description,
        categoryId: product.categoryId,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedInventory,
      total: formattedInventory.length,
      summary: {
        totalProducts: formattedInventory.length,
        inStock: formattedInventory.filter(item => item.status === 'in_stock').length,
        lowStock: formattedInventory.filter(item => item.status === 'low_stock').length,
        outOfStock: formattedInventory.filter(item => item.status === 'out_of_stock').length,
        totalValue: formattedInventory.reduce((sum, item) => sum + item.value, 0),
      },
    });

  } catch (error) {
    console.error("Error fetching inventory report:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch inventory report",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
