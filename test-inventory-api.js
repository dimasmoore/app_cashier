/**
 * Simple test script to verify Inventory API endpoints work correctly
 * Run with: node test-inventory-api.js
 * 
 * Note: This requires a running development server and valid session
 */

const BASE_URL = 'http://localhost:3000';

// Test cases for the inventory API
const testCases = [
  {
    name: 'Get all products',
    url: '/api/inventory/products',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Get products with pagination',
    url: '/api/inventory/products?page=1&limit=5',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Search products (case-insensitive)',
    url: '/api/inventory/products?search=nasi',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Search products (uppercase)',
    url: '/api/inventory/products?search=NASI',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Filter by stock status - low',
    url: '/api/inventory/products?stockStatus=low',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Filter by stock status - out',
    url: '/api/inventory/products?stockStatus=out',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Get categories',
    url: '/api/inventory/categories',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Get suppliers',
    url: '/api/inventory/suppliers',
    method: 'GET',
    expectedStatus: 200
  }
];

async function runTests() {
  console.log('🧪 Starting Inventory API Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`URL: ${test.url}`);
      
      const response = await fetch(`${BASE_URL}${test.url}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ PASSED - Status: ${response.status}`);
        
        if (response.status === 200) {
          const data = await response.json();
          if (test.url.includes('/products')) {
            console.log(`   Products returned: ${data.products?.length || 0}`);
            console.log(`   Total: ${data.pagination?.total || 'N/A'}`);
          } else {
            console.log(`   Items returned: ${Array.isArray(data) ? data.length : 'N/A'}`);
          }
        }
        passed++;
      } else {
        console.log(`❌ FAILED - Expected: ${test.expectedStatus}, Got: ${response.status}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
        failed++;
      }
      
    } catch (error) {
      console.log(`❌ FAILED - Network Error: ${error.message}`);
      failed++;
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The Prisma query fixes are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above.');
    console.log('   Common issues:');
    console.log('   - Development server not running (npm run dev)');
    console.log('   - Database not seeded (npm run db:seed)');
    console.log('   - Authentication required (login first)');
  }
}

// Run the tests
runTests().catch(console.error);

// Export for use in other test files
module.exports = { testCases, runTests };
