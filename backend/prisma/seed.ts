import { PrismaClient, CustomerType, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { seedCustomers } from './seeds/customers.seed';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// ============================================================================
// SECURITY: Prevent seed from running in production
// ============================================================================
if (process.env.NODE_ENV === 'production') {
  console.error('');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('  🔴 FATAL ERROR: Seed script cannot run in production!');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('');
  console.error('  Running seed scripts in production would:');
  console.error('  - Delete all existing production data');
  console.error('  - Create test users with known credentials');
  console.error('  - Compromise security');
  console.error('');
  console.error('  Seed scripts are ONLY for development and testing.');
  console.error('');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('');
  process.exit(1);
}

// ============================================================================
// SECURITY: Get seed password from environment variable
// ============================================================================
const SEED_PASSWORD = process.env.SEED_USER_PASSWORD || 'DevPassword123!';

if (!process.env.SEED_USER_PASSWORD) {
  console.warn('');
  console.warn('⚠️  WARNING: SEED_USER_PASSWORD not set');
  console.warn('   Using default password: DevPassword123!');
  console.warn('   Set SEED_USER_PASSWORD in .env for custom password');
  console.warn('');
}

console.log('🔐 Test user credentials:');
console.log(`   Email: admin@mindflow.com`);
console.log(`   Password: ${SEED_PASSWORD}`);
console.log(`   (Same password for all test users)`);
console.log('');

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Cleaning existing data...');
  await prisma.customerExternalId.deleteMany({});
  await prisma.customerPricingTier.deleteMany({});
  await prisma.customerContact.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});

  // ============================================================================
  // Test Users - Create users with different roles for testing
  // ============================================================================
  console.log('👤 Creating test users...');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mindflow.com',
      passwordHash: await bcrypt.hash(SEED_PASSWORD, 10),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Created user: ${adminUser.email} (${adminUser.role})`);

  const estimatorUser = await prisma.user.create({
    data: {
      email: 'estimator@mindflow.com',
      passwordHash: await bcrypt.hash(SEED_PASSWORD, 10),
      firstName: 'John',
      lastName: 'Estimator',
      role: UserRole.ESTIMATOR,
      isActive: true,
    },
  });
  console.log(`✅ Created user: ${estimatorUser.email} (${estimatorUser.role})`);

  const pmUser = await prisma.user.create({
    data: {
      email: 'pm@mindflow.com',
      passwordHash: await bcrypt.hash(SEED_PASSWORD, 10),
      firstName: 'Sarah',
      lastName: 'ProjectManager',
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
    },
  });
  console.log(`✅ Created user: ${pmUser.email} (${pmUser.role})`);

  const fieldUser = await prisma.user.create({
    data: {
      email: 'field@mindflow.com',
      passwordHash: await bcrypt.hash(SEED_PASSWORD, 10),
      firstName: 'Mike',
      lastName: 'FieldUser',
      role: UserRole.FIELD_USER,
      isActive: true,
    },
  });
  console.log(`✅ Created user: ${fieldUser.email} (${fieldUser.role})`);

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@mindflow.com',
      passwordHash: await bcrypt.hash(SEED_PASSWORD, 10),
      firstName: 'Jane',
      lastName: 'Viewer',
      role: UserRole.VIEWER,
      isActive: true,
    },
  });
  console.log(`✅ Created user: ${viewerUser.email} (${viewerUser.role})`);

  console.log('');

  // ============================================================================
  // BAT System Customers (Real Production Data)
  // ============================================================================
  await seedCustomers();

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n📊 Seed Summary:');
  const totalUsers = await prisma.user.count();
  const totalCustomers = await prisma.customer.count();
  const totalContacts = await prisma.customerContact.count();
  const totalPricingTiers = await prisma.customerPricingTier.count();
  const totalExternalIds = await prisma.customerExternalId.count();

  console.log(`   Users: ${totalUsers}`);
  console.log(`   Customers: ${totalCustomers}`);
  console.log(`   Contacts: ${totalContacts}`);
  console.log(`   Pricing Tiers: ${totalPricingTiers}`);
  console.log(`   External IDs: ${totalExternalIds}`);
  console.log('\n✨ Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
