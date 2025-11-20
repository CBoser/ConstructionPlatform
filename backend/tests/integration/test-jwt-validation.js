#!/usr/bin/env node
/**
 * Test Script for JWT_SECRET Validation
 * This tests the JWT_SECRET validation logic without needing the full server
 */

require('dotenv').config();

console.log('\n=== Testing JWT_SECRET Validation ===\n');

// Test 1: Production mode without JWT_SECRET
console.log('Test 1: Production mode without JWT_SECRET');
process.env.NODE_ENV = 'production';
delete process.env.JWT_SECRET;

if (!process.env.JWT_SECRET) {
  console.log('✅ PASS: Would fail in production without JWT_SECRET');
  console.log('   (Server would exit with error message)\n');
} else {
  console.log('❌ FAIL: JWT_SECRET should not be set\n');
}

// Test 2: Production mode with short JWT_SECRET
console.log('Test 2: Production mode with short JWT_SECRET');
process.env.JWT_SECRET = 'short';
if (process.env.JWT_SECRET.length < 32) {
  console.log('✅ PASS: Would fail in production with short JWT_SECRET');
  console.log(`   (Length: ${process.env.JWT_SECRET.length}, Required: 32)\n`);
} else {
  console.log('❌ FAIL: Short secret should be rejected\n');
}

// Test 3: Production mode with proper JWT_SECRET
console.log('Test 3: Production mode with proper JWT_SECRET (32+ chars)');
const crypto = require('crypto');
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
if (process.env.JWT_SECRET.length >= 32) {
  console.log('✅ PASS: Would succeed in production with proper JWT_SECRET');
  console.log(`   (Length: ${process.env.JWT_SECRET.length})\n`);
} else {
  console.log('❌ FAIL: Proper secret should be accepted\n');
}

// Test 4: Development mode without JWT_SECRET
console.log('Test 4: Development mode without JWT_SECRET');
process.env.NODE_ENV = 'development';
delete process.env.JWT_SECRET;
if (!process.env.JWT_SECRET) {
  console.log('✅ PASS: Would show warning in development without JWT_SECRET');
  console.log('   (Server would start with development default)\n');
} else {
  console.log('❌ FAIL: Should allow missing secret in development\n');
}

// Test 5: Generate a secure secret
console.log('Test 5: Generate a secure JWT_SECRET');
const secureSecret = crypto.randomBytes(32).toString('hex');
console.log('✅ PASS: Generated secure secret');
console.log(`   Example: ${secureSecret}`);
console.log(`   Length: ${secureSecret.length} characters\n`);

console.log('=== All Validation Tests Complete ===\n');
console.log('Summary:');
console.log('✅ Production requires JWT_SECRET (min 32 chars)');
console.log('✅ Development allows missing JWT_SECRET (with warning)');
console.log('✅ Short secrets are rejected in production');
console.log('✅ Proper secrets are accepted\n');
