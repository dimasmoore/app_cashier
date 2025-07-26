export interface Category {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    products: number;
  };
}

export interface Supplier {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    products: number;
  };
}

export interface CategoryFormData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface SupplierFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  isActive?: boolean;
}

export interface CategoryResponse {
  success?: boolean;
  data?: Category;
  error?: string;
}

export interface SupplierResponse {
  success?: boolean;
  data?: Supplier;
  error?: string;
}

export type InventoryModalMode = "create" | "edit" | "view";

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  categoryId: string;
  supplierId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  supplier?: {
    id: string;
    name: string;
  };
  productImages?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
}
