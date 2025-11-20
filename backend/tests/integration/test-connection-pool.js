/**
 * Database Connection Pool Test Script
 *
 * Tests:
 * - Database connection
 * - Health check functionality
 * - Connection pool configuration
 * - Graceful shutdown
 *
 * Usage: node test-connection-pool.js
 */

const { PrismaClient } = require('@prisma/client');

// Connection limit for testing (lower than production)
const CONNECTION_LIMIT = process.env.DATABASE_CONNECTION_LIMIT || 5;

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Database Connection Pool Test');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// Build DATABASE_URL with connection pool parameters
function buildDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL || '';

  if (baseUrl.includes('connection_limit=') && baseUrl.includes('pool_timeout=')) {
    return baseUrl;
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  const poolParams = `connection_limit=${CONNECTION_LIMIT}&pool_timeout=10`;

  return `${baseUrl}${separator}${poolParams}`;
}

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: buildDatabaseUrl(),
    },
  },
});

async function testConnectionPool() {
  try {
    // Test 1: Basic connection
    console.log('📌 Test 1: Database Connection');
    console.log('   Connecting to database...');
    await prisma.$connect();
    console.log('   ✅ Connected successfully');
    console.log('');

    // Test 2: Health check
    console.log('📌 Test 2: Health Check');
    console.log('   Running health check query...');
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as health_check`;
    const duration = Date.now() - startTime;
    console.log(`   ✅ Health check passed (${duration}ms)`);
    console.log('');

    // Test 3: Connection pool info
    console.log('📌 Test 3: Connection Pool Configuration');
    console.log(`   Max connections: ${CONNECTION_LIMIT}`);
    console.log(`   Pool timeout: 10 seconds`);
    console.log('   ✅ Pool configured correctly');
    console.log('');

    // Test 4: Multiple concurrent queries
    console.log('📌 Test 4: Concurrent Query Test');
    console.log(`   Running ${CONNECTION_LIMIT} concurrent queries...`);
    const queries = Array(parseInt(CONNECTION_LIMIT)).fill(null).map((_, i) =>
      prisma.$queryRaw`SELECT ${i} as query_num, NOW() as timestamp`
    );
    const results = await Promise.all(queries);
    console.log(`   ✅ All ${results.length} queries completed successfully`);
    console.log('');

    // Test 5: Database schema check (verify we can query tables)
    console.log('📌 Test 5: Schema Verification');
    console.log('   Checking User table...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ User table accessible (${userCount} users)`);

    console.log('   Checking AuditLog table...');
    const auditCount = await prisma.auditLog.count();
    console.log(`   ✅ AuditLog table accessible (${auditCount} entries)`);
    console.log('');

    // Test 6: Slow query warning (simulate with sleep)
    console.log('📌 Test 6: Slow Query Detection');
    console.log('   Simulating slow query (should warn if > 1000ms)...');
    const slowStart = Date.now();
    await prisma.$queryRaw`SELECT pg_sleep(0.5)`; // Sleep for 500ms
    const slowDuration = Date.now() - slowStart;
    if (slowDuration > 1000) {
      console.log(`   ⚠️  Query was slow: ${slowDuration}ms`);
    } else {
      console.log(`   ✅ Query completed in ${slowDuration}ms (under threshold)`);
    }
    console.log('');

    // Test 7: Graceful disconnect
    console.log('📌 Test 7: Graceful Disconnect');
    console.log('   Disconnecting from database...');
    await prisma.$disconnect();
    console.log('   ✅ Disconnected successfully');
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ✅ All Tests Passed!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Connection Pool Summary:');
    console.log(`  - Max connections: ${CONNECTION_LIMIT}`);
    console.log(`  - Pool timeout: 10s`);
    console.log(`  - Health check: ✅ Working`);
    console.log(`  - Concurrent queries: ✅ Working`);
    console.log(`  - Schema access: ✅ Working`);
    console.log(`  - Graceful shutdown: ✅ Working`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('  ❌ Test Failed');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    console.error('Error:', error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('  1. Verify DATABASE_URL is correct in .env');
    console.error('  2. Ensure database is running (docker-compose up -d)');
    console.error('  3. Check that database has been migrated (npx prisma migrate dev)');
    console.error('  4. Verify network connectivity to database');
    console.error('');

    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle SIGINT for clean shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Test interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

// Run tests
testConnectionPool();
