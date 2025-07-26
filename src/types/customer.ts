export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    transactions: number;
  };
  transactions?: CustomerTransaction[];
}

export interface CustomerTransaction {
  id: string;
  transactionNumber: string;
  total: number;
  status: string;
  createdAt: Date;
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface CustomerFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CustomerResponse {
  success: boolean;
  data: Customer;
}

export interface CustomerDeleteResponse {
  success: boolean;
  message: string;
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  topCustomers: {
    id: string;
    name: string;
    totalSpent: number;
    transactionCount: number;
  }[];
}

export type CustomerSortField = 
  | "firstName" 
  | "lastName" 
  | "email" 
  | "phone" 
  | "createdAt" 
  | "updatedAt";

export type CustomerModalMode = "create" | "edit" | "view";
