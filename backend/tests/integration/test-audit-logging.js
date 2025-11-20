/**
 * Audit Logging Test Script
 * Tests the audit logging functionality without requiring full server startup
 */

const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function testAuditLogging() {
  console.log('🧪 Testing Audit Logging Functionality\n');

  try {
    // Test 1: Count existing audit logs
    console.log('Test 1: Checking existing audit logs');
    const existingLogs = await db.auditLog.count();
    console.log(`  ✅ Found ${existingLogs} existing audit log(s)\n`);

    // Test 2: Create a test audit log
    console.log('Test 2: Creating test audit log');
    const testLog = await db.auditLog.create({
      data: {
        action: 'TEST_ACTION',
        entityType: 'Test',
        entityId: 'test-123',
        changes: {
          test: true,
          timestamp: new Date().toISOString(),
          message: 'This is a test audit log entry',
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
      },
    });
    console.log(`  ✅ Created test audit log: ${testLog.id}\n`);

    // Test 3: Query recent audit logs
    console.log('Test 3: Querying recent audit logs');
    const recentLogs = await db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log(`  ✅ Found ${recentLogs.length} recent log(s):`);
    recentLogs.forEach((log, index) => {
      const userInfo = log.user
        ? `${log.user.email}`
        : 'anonymous';
      console.log(`     ${index + 1}. [${log.action}] User: ${userInfo} - ${log.createdAt.toISOString()}`);
    });
    console.log('');

    // Test 4: Query by action type
    console.log('Test 4: Querying failed login attempts');
    const failedLogins = await db.auditLog.findMany({
      where: {
        action: 'FAILED_LOGIN',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    console.log(`  ✅ Found ${failedLogins.length} failed login attempt(s)\n`);

    // Test 5: Get action statistics
    console.log('Test 5: Audit log statistics');
    const allLogs = await db.auditLog.findMany({
      select: {
        action: true,
      },
    });

    const stats = {};
    allLogs.forEach(log => {
      stats[log.action] = (stats[log.action] || 0) + 1;
    });

    console.log('  ✅ Actions breakdown:');
    Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([action, count]) => {
        console.log(`     - ${action}: ${count}`);
      });
    console.log('');

    // Test 6: Clean up test log
    console.log('Test 6: Cleaning up test audit log');
    await db.auditLog.delete({
      where: { id: testLog.id },
    });
    console.log('  ✅ Test audit log deleted\n');

    console.log('✅ All audit logging tests passed!\n');
    console.log('📝 Summary:');
    console.log(`   - Total audit logs: ${allLogs.length}`);
    console.log(`   - Unique action types: ${Object.keys(stats).length}`);
    console.log(`   - Database connectivity: ✅ Working`);
    console.log(`   - Audit model: ✅ Accessible\n`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run tests
testAuditLogging();
