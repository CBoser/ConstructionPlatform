/**
 * Link Plans to Builder
 *
 * Links all plans (or plans matching a pattern) to a specific builder/customer.
 *
 * Usage: npx ts-node scripts/linkPlansToBuilder.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🔗 Link Plans to Builder');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Find Heritage HMS customer
  const heritage = await prisma.customer.findFirst({
    where: {
      customerName: { contains: 'Heritage', mode: 'insensitive' }
    }
  });

  if (!heritage) {
    console.error('❌ Heritage HMS customer not found!');
    console.log('\nAvailable customers:');
    const customers = await prisma.customer.findMany({ select: { id: true, customerName: true } });
    customers.forEach(c => console.log(`   - ${c.customerName} (${c.id})`));
    process.exit(1);
  }

  console.log(`✅ Found builder: ${heritage.customerName}`);
  console.log(`   ID: ${heritage.id}\n`);

  // Count plans without a builder
  const unlinkedPlans = await prisma.plan.count({
    where: { builderId: null }
  });

  console.log(`📋 Plans without builder: ${unlinkedPlans}`);

  if (unlinkedPlans === 0) {
    console.log('\n✅ All plans already have a builder assigned!');
    return;
  }

  // Link all unlinked plans to Heritage
  const result = await prisma.plan.updateMany({
    where: { builderId: null },
    data: { builderId: heritage.id }
  });

  console.log(`\n✅ Linked ${result.count} plans to ${heritage.customerName}`);

  // Verify
  const heritageplanCount = await prisma.plan.count({
    where: { builderId: heritage.id }
  });

  console.log(`\n📊 Heritage HMS now has ${heritageplanCount} plans`);
  console.log('\n✨ Done! Refresh the website to see the updated counts.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
