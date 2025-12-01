/**
 * Seed Code System Only
 *
 * Seeds ONLY the code system reference tables without affecting existing data:
 * - MaterialClass
 * - PhaseOptionDefinition
 * - RichmondOptionCode
 * - OptionSuffix
 *
 * Use this when you have existing data you want to preserve.
 *
 * Usage: npx ts-node scripts/seedCodeSystemOnly.ts
 */

import { seedCodeSystem } from '../prisma/seeds/codeSystem.seed';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🏗️  Seed Code System Only (Preserving Existing Data)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Show existing data counts
  const existingPlans = await prisma.plan.count();
  const existingCustomers = await prisma.customer.count();
  const existingMaterials = await prisma.material.count();

  console.log('📊 Existing data (will NOT be modified):');
  console.log(`   Plans: ${existingPlans}`);
  console.log(`   Customers: ${existingCustomers}`);
  console.log(`   Materials: ${existingMaterials}`);
  console.log('');

  // Run code system seed
  const result = await seedCodeSystem();

  console.log('\n📊 Code System Summary:');
  console.log(`   Material Classes: ${result.materialClasses}`);
  console.log(`   Phase Definitions: ${result.phaseDefinitions}`);
  console.log(`   Richmond Options: ${result.richmondOptions}`);
  console.log(`   Option Suffixes: ${result.optionSuffixes}`);
  console.log('\n✅ Code system seeded successfully!');
  console.log('   Your existing data was preserved.');
  console.log('\n👉 Next step: npm run import:coding-schema');
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
