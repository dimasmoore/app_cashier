import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cashier.com' },
    update: {},
    create: {
      email: 'admin@cashier.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+62123456789',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Created admin user:', {
    id: adminUser.id,
    email: adminUser.email,
    name: `${adminUser.firstName} ${adminUser.lastName}`,
    role: adminUser.role,
  });

  
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Makanan' },
      update: {},
      create: {
        name: 'Makanan',
        description: 'Produk makanan dan minuman',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Elektronik' },
      update: {},
      create: {
        name: 'Elektronik',
        description: 'Perangkat elektronik dan aksesoris',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Pakaian' },
      update: {},
      create: {
        name: 'Pakaian',
        description: 'Pakaian dan aksesoris fashion',
      },
    }),
  ]);

  console.log('✅ Created categories:', categories.length);

  
  let supplier = await prisma.supplier.findFirst({
    where: { name: 'PT Supplier Utama' },
  });

  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        name: 'PT Supplier Utama',
        email: 'supplier@example.com',
        phone: '+62987654321',
        address: 'Jl. Supplier No. 123, Jakarta',
        contactPerson: 'John Doe',
      },
    });
  }

  console.log('✅ Created supplier:', supplier.name);

  
  const suppliers = [supplier];

  let supplier2 = await prisma.supplier.findFirst({
    where: { name: 'CV Elektronik Jaya' },
  });

  if (!supplier2) {
    supplier2 = await prisma.supplier.create({
      data: {
        name: 'CV Elektronik Jaya',
        email: 'elektronik@jaya.com',
        phone: '+62812345678',
        address: 'Jl. Elektronik No. 456, Surabaya',
        contactPerson: 'Jane Smith',
      },
    });
    suppliers.push(supplier2);
  }

  let supplier3 = await prisma.supplier.findFirst({
    where: { name: 'Toko Fashion Modern' },
  });

  if (!supplier3) {
    supplier3 = await prisma.supplier.create({
      data: {
        name: 'Toko Fashion Modern',
        email: 'fashion@modern.com',
        phone: '+62856789012',
        address: 'Jl. Fashion No. 789, Bandung',
        contactPerson: 'Bob Wilson',
      },
    });
    suppliers.push(supplier3);
  }

  console.log('✅ Created suppliers:', suppliers.length);

  
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'FOOD001' },
      update: {},
      create: {
        name: 'Nasi Goreng',
        description: 'Nasi goreng spesial dengan telur dan ayam',
        sku: 'FOOD001',
        barcode: '1234567890123',
        price: 25000,
        cost: 15000,
        stock: 50,
        minStock: 10,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id, 
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELEC001' },
      update: {},
      create: {
        name: 'Kabel USB',
        description: 'Kabel USB Type-C 1 meter',
        sku: 'ELEC001',
        barcode: '1234567890124',
        price: 50000,
        cost: 30000,
        stock: 100,
        minStock: 20,
        categoryId: categories[1].id,
        supplierId: supplier2?.id || suppliers[0].id, 
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CLOTH001' },
      update: {},
      create: {
        name: 'T-Shirt Polos',
        description: 'T-Shirt polos katun premium',
        sku: 'CLOTH001',
        barcode: '1234567890125',
        price: 75000,
        cost: 45000,
        stock: 30,
        minStock: 5,
        categoryId: categories[2].id,
        supplierId: supplier3?.id || suppliers[0].id, 
      },
    }),
    
    prisma.product.upsert({
      where: { sku: 'FOOD002' },
      update: {},
      create: {
        name: 'Mie Ayam',
        description: 'Mie ayam dengan bakso dan pangsit',
        sku: 'FOOD002',
        barcode: '1234567890126',
        price: 20000,
        cost: 12000,
        stock: 40,
        minStock: 8,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'ELEC002' },
      update: {},
      create: {
        name: 'Power Bank',
        description: 'Power bank 10000mAh fast charging',
        sku: 'ELEC002',
        barcode: '1234567890127',
        price: 150000,
        cost: 100000,
        stock: 25,
        minStock: 5,
        categoryId: categories[1].id,
        supplierId: supplier2?.id || suppliers[0].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: 'CLOTH002' },
      update: {},
      create: {
        name: 'Jeans Denim',
        description: 'Celana jeans denim premium',
        sku: 'CLOTH002',
        barcode: '1234567890128',
        price: 200000,
        cost: 120000,
        stock: 15,
        minStock: 3,
        categoryId: categories[2].id,
        supplierId: supplier3?.id || suppliers[0].id,
      },
    }),
  ]);

  console.log('✅ Created products:', products.length);

  
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'customer1@example.com' },
      update: {},
      create: {
        firstName: 'Ahmad',
        lastName: 'Wijaya',
        email: 'customer1@example.com',
        phone: '+62812345001',
        address: 'Jl. Customer No. 1, Jakarta',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'customer2@example.com' },
      update: {},
      create: {
        firstName: 'Siti',
        lastName: 'Nurhaliza',
        email: 'customer2@example.com',
        phone: '+62812345002',
        address: 'Jl. Customer No. 2, Surabaya',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'customer3@example.com' },
      update: {},
      create: {
        firstName: 'Budi',
        lastName: 'Santoso',
        email: 'customer3@example.com',
        phone: '+62812345003',
        address: 'Jl. Customer No. 3, Bandung',
      },
    }),
  ]);

  console.log('✅ Created customers:', customers.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('=== SEEDED DATA SUMMARY ===');
  console.log(`   • 1 Admin User`);
  console.log(`   • ${categories.length} Categories`);
  console.log(`   • ${suppliers.length} Suppliers`);
  console.log(`   • ${products.length} Products`);
  console.log(`   • ${customers.length} Customers`);
  console.log('');
  console.log('=== DEFAULT ADMIN CREDENTIALS ===');
  console.log('   Email: admin@cashier.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('=== SAMPLE PRODUCTS AVAILABLE ===');
  console.log('   • Nasi Goreng (SKU: FOOD001, Barcode: 1234567890123)');
  console.log('   • Mie Ayam (SKU: FOOD002, Barcode: 1234567890126)');
  console.log('   • Kabel USB (SKU: ELEC001, Barcode: 1234567890124)');
  console.log('   • Power Bank (SKU: ELEC002, Barcode: 1234567890127)');
  console.log('   • T-Shirt Polos (SKU: CLOTH001, Barcode: 1234567890125)');
  console.log('   • Jeans Denim (SKU: CLOTH002, Barcode: 1234567890128)');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
