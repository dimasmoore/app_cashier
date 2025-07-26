-- Add performance indexes for reports and analytics

-- Transactions table indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_created_at_status_payment ON transactions(createdAt, status, paymentStatus);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(paymentMethod);
CREATE INDEX IF NOT EXISTS idx_transactions_status_created_at ON transactions(status, createdAt);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status_created_at ON transactions(paymentStatus, createdAt);

-- Transaction items indexes for aggregation queries
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON transaction_items(productId);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id_product_id ON transaction_items(transactionId, productId);

-- Products table indexes for category and sales analysis
CREATE INDEX IF NOT EXISTS idx_products_category_id_active ON products(categoryId, isActive);
CREATE INDEX IF NOT EXISTS idx_products_active_created_at ON products(isActive, createdAt);

-- Categories table index for active categories
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(isActive);

-- Customers table indexes for customer analysis
CREATE INDEX IF NOT EXISTS idx_customers_active_created_at ON customers(isActive, createdAt);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_transactions_date_range_completed ON transactions(createdAt, status, paymentStatus) 
WHERE status = 'COMPLETED' AND paymentStatus = 'PAID';

-- Index for transaction number searches
CREATE INDEX IF NOT EXISTS idx_transactions_number_search ON transactions(transactionNumber);

-- Index for customer name searches (if needed for reports)
CREATE INDEX IF NOT EXISTS idx_customers_name_search ON customers(firstName, lastName);

-- Stock movements indexes for inventory reports
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created ON stock_movements(productId, createdAt);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type_created ON stock_movements(type, createdAt);
