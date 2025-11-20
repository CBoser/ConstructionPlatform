/**
 * CORS Configuration Test Script
 * Tests the CORS middleware without requiring full server startup
 */

// Set test environment variables
process.env.NODE_ENV = 'development';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:3000';

console.log('🧪 Testing CORS Configuration\n');
console.log('Environment:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);
console.log('');

// Import the CORS configuration
const { validateCorsConfig } = require('./dist/middleware/corsConfig');

console.log('Test 1: Validate CORS configuration');
const isValid = validateCorsConfig();
console.log(`  Result: ${isValid ? '✅ PASSED' : '❌ FAILED'}`);
console.log('');

console.log('Test 2: Check production validation (should fail without ALLOWED_ORIGINS)');
process.env.NODE_ENV = 'production';
delete process.env.ALLOWED_ORIGINS;
const isValidProd = validateCorsConfig();
console.log(`  Result: ${!isValidProd ? '✅ PASSED (correctly rejected)' : '❌ FAILED (should have rejected)'}`);
console.log('');

console.log('Test 3: Check production validation (should pass with ALLOWED_ORIGINS)');
process.env.ALLOWED_ORIGINS = 'https://myapp.com,https://www.myapp.com';
const isValidProd2 = validateCorsConfig();
console.log(`  Result: ${isValidProd2 ? '✅ PASSED' : '❌ FAILED'}`);
console.log('');

console.log('✅ CORS configuration tests completed');
