/**
 * Customer Seed Data
 *
 * Seeds test customers with BAT system integration:
 * - Holt Homes (Heritage HMS of Molalla OR)
 * - Richmond American Homes OR
 * - Manor Homes NW
 *
 * Reference: /docs/reference/BAT_SYSTEM_GUIDE.md
 */

import { PrismaClient, CustomerType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Tier assignments for major accounts (Holt Homes & Richmond American)
 * Both customers use the same tier structure
 */
const MAJOR_ACCOUNT_TIERS = [
  { dartCategory: 1, dartCategoryName: '01-Lumber', tier: '09' },
  { dartCategory: 2, dartCategoryName: '02-StrctP', tier: '08' },
  { dartCategory: 3, dartCategoryName: '03-EngWdP', tier: '10' },
  { dartCategory: 4, dartCategoryName: '04-TrusWP', tier: '01' },
  { dartCategory: 5, dartCategoryName: '05-MilWrk', tier: '11' },
  { dartCategory: 6, dartCategoryName: '06-Window', tier: '12' },
  { dartCategory: 7, dartCategoryName: '07-Doors', tier: '10' },
  { dartCategory: 8, dartCategoryName: '08-CabTop', tier: '09' },
  { dartCategory: 9, dartCategoryName: '09-SidMCn', tier: '09' },
  { dartCategory: 10, dartCategoryName: '10-Insul', tier: '08' },
  { dartCategory: 11, dartCategoryName: '11-Roofing', tier: '06' },
  { dartCategory: 12, dartCategoryName: '12-Gypsum', tier: '08' },
  { dartCategory: 13, dartCategoryName: '13-Hrdwr', tier: '05' },
  { dartCategory: 14, dartCategoryName: '14-HomeCen', tier: '01' },
  { dartCategory: 15, dartCategoryName: 'special', tier: 'L5' },
];

export async function seedCustomers() {
  console.log('🌱 Seeding customers...');

  const effectiveDate = new Date('2024-01-01');

  // 1. Holt Homes (Heritage HMS of Molalla OR)
  console.log('  Creating Holt Homes...');
  const holtHomes = await prisma.customer.upsert({
    where: { billToId: '655352' },
    update: {},
    create: {
      customerName: 'HERITAGE HMS OF MOLALLA OR',
      customerType: CustomerType.PRODUCTION,
      billToId: '655352',
      customerId: '662662',
      salesId: 'P761647',
      salespersonName: 'COREY BOSER',
      locationCode: 'CLACORAD',
      accountType: 'M',
      isActive: true,
      notes: 'Holt Homes - Major production builder account',
    },
  });

  // Create tier assignments for Holt Homes
  console.log('  Creating tier assignments for Holt Homes...');
  for (const tier of MAJOR_ACCOUNT_TIERS) {
    await prisma.customerPricingTier.upsert({
      where: {
        customerId_dartCategory_effectiveDate: {
          customerId: holtHomes.id,
          dartCategory: tier.dartCategory,
          effectiveDate,
        },
      },
      update: {},
      create: {
        customerId: holtHomes.id,
        dartCategory: tier.dartCategory,
        dartCategoryName: tier.dartCategoryName,
        tier: tier.tier,
        effectiveDate,
      },
    });
  }

  // Create contacts for Holt Homes
  const existingHoltContact = await prisma.customerContact.findFirst({
    where: {
      customerId: holtHomes.id,
      email: 'corey.boser@holthomes.com',
    },
  });

  if (!existingHoltContact) {
    await prisma.customerContact.create({
      data: {
        customerId: holtHomes.id,
        contactName: 'COREY BOSER',
        role: 'Sales Representative',
        email: 'corey.boser@holthomes.com',
        phone: '503-555-0100',
        isPrimary: true,
        receivesNotifications: true,
      },
    });
  }

  // 2. Richmond American Homes OR
  console.log('  Creating Richmond American Homes...');
  const richmondAmerican = await prisma.customer.upsert({
    where: { billToId: '633637' },
    update: {},
    create: {
      customerName: 'RICHMOND AMERICAN HOMES OR',
      customerType: CustomerType.PRODUCTION,
      billToId: '633637',
      customerId: '825812',
      salesId: 'P761647',
      salespersonName: 'COREY BOSER',
      locationCode: 'CLACORAD',
      accountType: 'M',
      isActive: true,
      notes: 'Richmond American - Major production builder account',
    },
  });

  // Create tier assignments for Richmond American (same as Holt)
  console.log('  Creating tier assignments for Richmond American...');
  for (const tier of MAJOR_ACCOUNT_TIERS) {
    await prisma.customerPricingTier.upsert({
      where: {
        customerId_dartCategory_effectiveDate: {
          customerId: richmondAmerican.id,
          dartCategory: tier.dartCategory,
          effectiveDate,
        },
      },
      update: {},
      create: {
        customerId: richmondAmerican.id,
        dartCategory: tier.dartCategory,
        dartCategoryName: tier.dartCategoryName,
        tier: tier.tier,
        effectiveDate,
      },
    });
  }

  // Create contact for Richmond American
  const existingRichmondContact = await prisma.customerContact.findFirst({
    where: {
      customerId: richmondAmerican.id,
      email: 'oregon@richmondamerican.com',
    },
  });

  if (!existingRichmondContact) {
    await prisma.customerContact.create({
      data: {
        customerId: richmondAmerican.id,
        contactName: 'Main Contact',
        role: 'Project Manager',
        email: 'oregon@richmondamerican.com',
        phone: '503-555-0200',
        isPrimary: true,
        receivesNotifications: true,
      },
    });
  }

  // 3. Manor Homes NW
  console.log('  Creating Manor Homes NW...');
  const manorHomes = await prisma.customer.upsert({
    where: { billToId: '740180' },
    update: {},
    create: {
      customerName: 'MANOR HOMES NW',
      customerType: CustomerType.PRODUCTION,
      billToId: '740180',
      customerId: '987403',
      accountType: 'M',
      isActive: true,
      notes: 'Manor Homes NW - Production builder',
    },
  });

  // Create default tier assignments for Manor Homes (medium discount tiers)
  console.log('  Creating tier assignments for Manor Homes...');
  const manorHomesTiers = [
    { dartCategory: 1, dartCategoryName: '01-Lumber', tier: '07' },
    { dartCategory: 2, dartCategoryName: '02-StrctP', tier: '07' },
    { dartCategory: 3, dartCategoryName: '03-EngWdP', tier: '08' },
    { dartCategory: 4, dartCategoryName: '04-TrusWP', tier: '06' },
    { dartCategory: 5, dartCategoryName: '05-MilWrk', tier: '08' },
    { dartCategory: 6, dartCategoryName: '06-Window', tier: '09' },
    { dartCategory: 7, dartCategoryName: '07-Doors', tier: '08' },
    { dartCategory: 8, dartCategoryName: '08-CabTop', tier: '07' },
    { dartCategory: 9, dartCategoryName: '09-SidMCn', tier: '07' },
    { dartCategory: 10, dartCategoryName: '10-Insul', tier: '07' },
    { dartCategory: 11, dartCategoryName: '11-Roofing', tier: '06' },
    { dartCategory: 12, dartCategoryName: '12-Gypsum', tier: '07' },
    { dartCategory: 13, dartCategoryName: '13-Hrdwr', tier: '05' },
    { dartCategory: 14, dartCategoryName: '14-HomeCen', tier: '03' },
    { dartCategory: 15, dartCategoryName: 'special', tier: 'L5' },
  ];

  for (const tier of manorHomesTiers) {
    await prisma.customerPricingTier.upsert({
      where: {
        customerId_dartCategory_effectiveDate: {
          customerId: manorHomes.id,
          dartCategory: tier.dartCategory,
          effectiveDate,
        },
      },
      update: {},
      create: {
        customerId: manorHomes.id,
        dartCategory: tier.dartCategory,
        dartCategoryName: tier.dartCategoryName,
        tier: tier.tier,
        effectiveDate,
      },
    });
  }

  console.log('✅ Customers seeded successfully');
  console.log(`  - Holt Homes: ${holtHomes.id}`);
  console.log(`  - Richmond American: ${richmondAmerican.id}`);
  console.log(`  - Manor Homes: ${manorHomes.id}`);

  return {
    holtHomes,
    richmondAmerican,
    manorHomes,
  };
}

export default seedCustomers;
