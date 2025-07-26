



export interface ReportMetric {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  prefix?: string;
  suffix?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ReportFilters {
  dateRange: DateRange;
  reportType: ReportType;
  category?: string;
  paymentMethod?: string;
  status?: string;
}

export type ReportType = 
  | "sales"
  | "inventory" 
  | "transactions"
  | "customers"
  | "products"
  | "revenue";

export type ExportFormat = "pdf" | "excel" | "csv";

export interface SalesReportData {
  totalSales: number;
  totalTransactions: number;
  averageOrderValue: number;
  totalRevenue: number;
  topProducts: ProductSalesData[];
  salesByCategory: CategorySalesData[];
  salesTrend: SalesTrendData[];
  paymentMethodBreakdown: PaymentMethodData[];
  
  lastUpdated: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  isRealTime: boolean;
}

export interface ProductSalesData {
  id: string;
  name: string;
  sku: string;
  quantitySold: number;
  revenue: number;
  category: string;
  imageUrl?: string;
}

export interface CategorySalesData {
  categoryId: string;
  categoryName: string;
  totalSales: number;
  totalRevenue: number;
  percentage: number;
}

export interface SalesTrendData {
  date: string;
  sales: number;
  revenue: number;
  transactions: number;
}

export interface PaymentMethodData {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface TransactionReportData {
  id: string;
  transactionNumber: string;
  date: string;
  customerName?: string;
  items: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: string;
}

export interface InventoryReportData {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  value: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  lastUpdated: string;
}

export interface CustomerReportData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: "active" | "inactive";
}





export interface ReportsSummaryCardsProps {
  metrics: ReportMetric[];
  isLoading?: boolean;
}

export interface ReportsFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  isLoading?: boolean;
}

export interface ReportsChartsProps {
  salesData: SalesReportData;
  isLoading?: boolean;
}

export interface ReportsTableProps {
  data: TransactionReportData[] | InventoryReportData[] | CustomerReportData[];
  type: "transactions" | "inventory" | "customers";
  isLoading?: boolean;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  onSearch?: (query: string) => void;
}

export interface ReportsExportProps {
  reportType: ReportType;
  filters: ReportFilters;
  data?: TransactionReportData[] | InventoryReportData[] | CustomerReportData[];
  onExport?: (format: ExportFormat) => Promise<void>;
  isExporting?: boolean;
}





export interface ReportsApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface SalesReportApiResponse extends ReportsApiResponse<SalesReportData> {}

export interface TransactionReportApiResponse extends ReportsApiResponse<TransactionReportData[]> {}

export interface InventoryReportApiResponse extends ReportsApiResponse<InventoryReportData[]> {}

export interface CustomerReportApiResponse extends ReportsApiResponse<CustomerReportData[]> {}





export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }[];
}

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
  }[];
}

export interface PieChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}





export type SortDirection = "asc" | "desc";

export interface SortConfig {
  column: string;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface SearchConfig {
  query: string;
  fields: string[];
}
