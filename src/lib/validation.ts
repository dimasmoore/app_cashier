import { z } from "zod";

// ================================
// REPORTS VALIDATION SCHEMAS
// ================================

export const ReportFiltersSchema = z.object({
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }),
  reportType: z.enum(["sales", "inventory", "transactions", "customers"]),
  paymentMethod: z.enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "DIGITAL_WALLET", "BANK_TRANSFER", "CHECK"]).optional(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED", "REFUNDED"]).optional(),
  search: z.string().optional(),
});

export const SalesReportDataSchema = z.object({
  totalSales: z.number().min(0),
  totalTransactions: z.number().min(0),
  averageOrderValue: z.number().min(0),
  totalRevenue: z.number().min(0),
  topProducts: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    sku: z.string().min(1),
    quantitySold: z.number().min(0),
    revenue: z.number().min(0),
    category: z.string().min(1),
  })),
  salesByCategory: z.array(z.object({
    categoryId: z.string(),
    categoryName: z.string().min(1),
    totalSales: z.number().min(0),
    totalRevenue: z.number().min(0),
    percentage: z.number().min(0).max(100),
  })),
  salesTrend: z.array(z.object({
    date: z.string(),
    sales: z.number().min(0),
    revenue: z.number().min(0),
    transactions: z.number().min(0),
  })),
  paymentMethodBreakdown: z.array(z.object({
    method: z.string().min(1),
    count: z.number().min(0),
    amount: z.number().min(0),
    percentage: z.number().min(0).max(100),
  })),
  lastUpdated: z.string(),
  dateRange: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  isRealTime: z.boolean(),
});

export const TransactionReportDataSchema = z.object({
  id: z.string(),
  transactionNumber: z.string().min(1),
  total: z.number().min(0),
  paymentMethod: z.enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "DIGITAL_WALLET", "BANK_TRANSFER", "CHECK"]),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_PAID"]),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED", "REFUNDED"]),
  createdAt: z.string(),
  customer: z.object({
    name: z.string(),
  }).nullable(),
  cashier: z.object({
    name: z.string().min(1),
  }),
  itemCount: z.number().min(0),
  items: z.array(z.object({
    productName: z.string().min(1),
    sku: z.string().min(1),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),
  })).optional(),
});

export const PaginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  totalCount: z.number().min(0),
  totalPages: z.number().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// ================================
// API RESPONSE SCHEMAS
// ================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  pagination: PaginationSchema.optional(),
  filters: z.any().optional(),
});

export const SalesApiResponseSchema = ApiResponseSchema.extend({
  data: SalesReportDataSchema.optional(),
});

export const TransactionsApiResponseSchema = ApiResponseSchema.extend({
  data: z.array(TransactionReportDataSchema).optional(),
  pagination: PaginationSchema.optional(),
});

// ================================
// VALIDATION FUNCTIONS
// ================================

export function validateReportFilters(data: unknown) {
  try {
    return ReportFiltersSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid report filters: ${error.errors.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
}

export function validateSalesReportData(data: unknown) {
  try {
    return SalesReportDataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid sales report data: ${error.errors.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
}

export function validateTransactionReportData(data: unknown) {
  try {
    return z.array(TransactionReportDataSchema).parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid transaction report data: ${error.errors.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
}

export function validateApiResponse(data: unknown) {
  try {
    return ApiResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid API response: ${error.errors.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
}

// ================================
// DATE VALIDATION HELPERS
// ================================

export function validateDateRange(startDate: Date, endDate: Date) {
  if (startDate > endDate) {
    throw new Error("Start date must be before end date");
  }
  
  const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  if (endDate.getTime() - startDate.getTime() > maxRange) {
    throw new Error("Date range cannot exceed 1 year");
  }
  
  const now = new Date();
  if (endDate > now) {
    throw new Error("End date cannot be in the future");
  }
}

export function sanitizeSearchQuery(query: string): string {
  // Remove potentially dangerous characters and limit length
  return query
    .replace(/[<>\"'%;()&+]/g, "")
    .trim()
    .substring(0, 100);
}

// ================================
// TYPE EXPORTS
// ================================

export type ValidatedReportFilters = z.infer<typeof ReportFiltersSchema>;
export type ValidatedSalesReportData = z.infer<typeof SalesReportDataSchema>;
export type ValidatedTransactionReportData = z.infer<typeof TransactionReportDataSchema>;
export type ValidatedApiResponse = z.infer<typeof ApiResponseSchema>;
