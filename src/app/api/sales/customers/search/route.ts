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
      const recentCustomers = await prisma.customer.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 10,
      });

      return NextResponse.json(recentCustomers);
    }

    
    const customers = await prisma.customer.findMany({
      where: {
        isActive: true,
        OR: [
          {
            firstName: {
              contains: query,
            },
          },
          {
            lastName: {
              contains: query,
            },
          },
          {
            email: {
              contains: query,
            },
          },
          {
            phone: {
              contains: query,
            },
          },
        ],
      },
      orderBy: [
        {
          firstName: "asc",
        },
        {
          lastName: "asc",
        },
      ],
      take: 20, 
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error searching customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
