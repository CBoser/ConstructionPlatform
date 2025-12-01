/**
 * Database Review Script
 * Run: npx ts-node scripts/reviewDatabase.ts
 *
 * Note: For code system tables, run prisma generate first if you see errors.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reviewDatabase() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Database Review Report');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ============================================================================
  // CORE BUSINESS DATA
  // ============================================================================
  console.log('CORE BUSINESS DATA');
  console.log('───────────────────────────────────────────────────────────────');

  const customers = await prisma.customer.findMany({
    include: { _count: { select: { plans: true, jobs: true, communities: true } } }
  });
  console.log(`   Customers: ${customers.length}`);
  for (const c of customers) {
    console.log(`     - ${c.customerName} (${c.customerType}): ${c._count.plans} plans, ${c._count.jobs} jobs, ${c._count.communities} communities`);
  }

  const plans = await prisma.plan.count();
  const plansWithBuilder = await prisma.plan.count({ where: { builderId: { not: null } } });
  const plansWithoutBuilder = await prisma.plan.count({ where: { builderId: null } });
  console.log(`   Plans: ${plans} total`);
  console.log(`     - With builder: ${plansWithBuilder}`);
  console.log(`     - Without builder: ${plansWithoutBuilder}`);

  // Sample plans
  const samplePlans = await prisma.plan.findMany({
    take: 10,
    include: { builder: true },
    orderBy: { code: 'asc' }
  });
  console.log('\n   Sample Plans:');
  for (const p of samplePlans) {
    console.log(`     - ${p.code} ${p.name || ''} (${p.type}) - Builder: ${p.builder?.customerName || 'None'}`);
  }

  const materials = await prisma.material.count();
  console.log(`\n   Materials: ${materials}`);

  const jobs = await prisma.job.count();
  console.log(`   Jobs: ${jobs}`);

  const communities = await prisma.community.count();
  console.log(`   Communities: ${communities}`);

  // ============================================================================
  // CODE SYSTEM DATA (requires prisma generate after schema update)
  // ============================================================================
  console.log('\n───────────────────────────────────────────────────────────────');
  console.log('CODE SYSTEM DATA');
  console.log('───────────────────────────────────────────────────────────────');

  // Try to access code system tables - they may not exist yet
  // Note: Table and column names use snake_case due to @@map directives in schema
  try {
    // Use raw query to check if tables exist and get counts
    const materialClassCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM material_classes`;
    console.log(`   Material Classes: ${materialClassCount[0].count}`);

    const phaseCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM phase_option_definitions`;
    const basePhaseCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM phase_option_definitions WHERE is_base_phase = true`;
    const optionPhaseCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM phase_option_definitions WHERE is_option = true`;
    console.log(`   Phase Definitions: ${phaseCount[0].count}`);
    console.log(`     - Base phases: ${basePhaseCount[0].count}`);
    console.log(`     - Option phases: ${optionPhaseCount[0].count}`);

    const richmondCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM richmond_option_codes`;
    const multiPhaseCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM richmond_option_codes WHERE is_multi_phase = true`;
    console.log(`   Richmond Options: ${richmondCount[0].count}`);
    console.log(`     - Multi-phase: ${multiPhaseCount[0].count}`);
    console.log(`     - Single-phase: ${Number(richmondCount[0].count) - Number(multiPhaseCount[0].count)}`);

    const suffixCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM option_suffixes`;
    const activeSuffixCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM option_suffixes WHERE is_active = true`;
    console.log(`   Option Suffixes: ${suffixCount[0].count}`);
    console.log(`     - Active: ${activeSuffixCount[0].count}`);

    // ============================================================================
    // LAYER 1 CODES (FROM CSV IMPORT)
    // ============================================================================
    console.log('\n───────────────────────────────────────────────────────────────');
    console.log('LAYER 1 CODES (Imported from CSV)');
    console.log('───────────────────────────────────────────────────────────────');

    const layer1Count = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM layer1_codes`;
    console.log(`   Layer1 Codes: ${layer1Count[0].count}`);

    const elevAssocCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM layer1_code_elevations`;
    console.log(`   Elevation Associations: ${elevAssocCount[0].count}`);

    const richLinkCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM layer1_code_richmond_options`;
    console.log(`   Richmond Option Links: ${richLinkCount[0].count}`);

    // Sample Layer1 codes with raw query
    const sampleCodes = await prisma.$queryRaw<Array<{full_code: string, phase_name: string | null}>>`
      SELECT l.full_code, p.phase_name
      FROM layer1_codes l
      LEFT JOIN phase_option_definitions p ON l.phase_option_id = p.id
      LIMIT 5
    `;
    console.log('\n   Sample Layer1 Codes:');
    for (const code of sampleCodes) {
      console.log(`     - ${code.full_code} (Phase: ${code.phase_name || 'N/A'})`);
    }

    // ============================================================================
    // PHASE COVERAGE CHECK
    // ============================================================================
    console.log('\n───────────────────────────────────────────────────────────────');
    console.log('PHASE COVERAGE');
    console.log('───────────────────────────────────────────────────────────────');

    // Group phases by series using raw query
    const phasesBySeries = await prisma.$queryRaw<Array<{series: string, count: bigint}>>`
      SELECT SUBSTRING(phase_code, 1, 3) as series, COUNT(*) as count
      FROM phase_option_definitions
      GROUP BY SUBSTRING(phase_code, 1, 3)
      ORDER BY series
    `;
    console.log('   Phases by Series:');
    for (const s of phasesBySeries) {
      console.log(`     - ${s.series}.xxx: ${s.count} phases`);
    }

    // ============================================================================
    // DATA QUALITY CHECKS
    // ============================================================================
    console.log('\n───────────────────────────────────────────────────────────────');
    console.log('DATA QUALITY CHECKS');
    console.log('───────────────────────────────────────────────────────────────');

    // Layer1 codes without phase
    const codesNoPhase = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM layer1_codes WHERE phase_option_id IS NULL`;
    console.log(`   Layer1 codes without phase: ${codesNoPhase[0].count}`);

    // Richmond options without phase link (single-phase only)
    const optsNoPhase = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM richmond_option_codes WHERE phase_id IS NULL AND is_multi_phase = false`;
    console.log(`   Single-phase Richmond options without phase link: ${optsNoPhase[0].count}`);

  } catch (error) {
    console.log('   [Code system tables not yet migrated - run prisma migrate first]');
    console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  DATABASE REVIEW COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');

  await prisma.$disconnect();
}

reviewDatabase().catch(console.error);
