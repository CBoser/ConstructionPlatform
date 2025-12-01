/**
 * Database Validation Script
 * Runs comprehensive checks to ensure data integrity
 * Run: npx ts-node scripts/validateDatabase.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  check: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

const results: ValidationResult[] = [];

function log(check: string, status: 'PASS' | 'FAIL' | 'WARN', message: string) {
  results.push({ check, status, message });
  const icon = status === 'PASS' ? '[OK]' : status === 'FAIL' ? '[FAIL]' : '[WARN]';
  console.log(`  ${icon} ${check}: ${message}`);
}

async function validateDatabase() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Database Validation');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ============================================================================
  // 1. CORE DATA INTEGRITY
  // ============================================================================
  console.log('1. CORE DATA INTEGRITY');
  console.log('───────────────────────────────────────────────────────────────');

  // Check customers exist
  const customerCount = await prisma.customer.count();
  if (customerCount >= 1) {
    log('Customers', 'PASS', `${customerCount} customers found`);
  } else {
    log('Customers', 'FAIL', 'No customers found');
  }

  // Check plans exist and are linked to builders
  const planCount = await prisma.plan.count();
  const plansWithBuilder = await prisma.plan.count({ where: { builderId: { not: null } } });
  if (planCount > 0 && plansWithBuilder === planCount) {
    log('Plans', 'PASS', `${planCount} plans, all linked to builders`);
  } else if (planCount > 0) {
    log('Plans', 'WARN', `${planCount} plans, ${planCount - plansWithBuilder} without builder`);
  } else {
    log('Plans', 'WARN', 'No plans found');
  }

  // Check materials exist
  const materialCount = await prisma.material.count();
  if (materialCount > 0) {
    log('Materials', 'PASS', `${materialCount} materials found`);
  } else {
    log('Materials', 'WARN', 'No materials found');
  }

  // ============================================================================
  // 2. CODE SYSTEM REFERENCE DATA
  // ============================================================================
  console.log('\n2. CODE SYSTEM REFERENCE DATA');
  console.log('───────────────────────────────────────────────────────────────');

  // Material Classes
  const matClassCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM material_classes`;
  if (Number(matClassCount[0].count) >= 2) {
    log('Material Classes', 'PASS', `${matClassCount[0].count} classes (1000-Framing, 1100-Siding expected)`);
  } else {
    log('Material Classes', 'FAIL', `Only ${matClassCount[0].count} material classes found`);
  }

  // Phase Definitions - check critical series exist
  const criticalSeries = ['010', '020', '034', '040', '060'];
  for (const series of criticalSeries) {
    const count = await prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(*) as count FROM phase_option_definitions
      WHERE phase_code LIKE ${series + '%'}
    `;
    if (Number(count[0].count) > 0) {
      log(`Phase Series ${series}`, 'PASS', `${count[0].count} phases`);
    } else {
      log(`Phase Series ${series}`, 'FAIL', 'No phases found for critical series');
    }
  }

  // Richmond Options
  const richCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM richmond_option_codes`;
  if (Number(richCount[0].count) >= 50) {
    log('Richmond Options', 'PASS', `${richCount[0].count} option codes`);
  } else {
    log('Richmond Options', 'WARN', `Only ${richCount[0].count} Richmond options`);
  }

  // Option Suffixes
  const suffixCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM option_suffixes WHERE is_active = true`;
  if (Number(suffixCount[0].count) >= 10) {
    log('Option Suffixes', 'PASS', `${suffixCount[0].count} active suffixes`);
  } else {
    log('Option Suffixes', 'WARN', `Only ${suffixCount[0].count} active suffixes`);
  }

  // ============================================================================
  // 3. LAYER 1 CODE INTEGRITY
  // ============================================================================
  console.log('\n3. LAYER 1 CODE INTEGRITY');
  console.log('───────────────────────────────────────────────────────────────');

  // Layer1 codes exist
  const layer1Count = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM layer1_codes`;
  if (Number(layer1Count[0].count) > 100) {
    log('Layer1 Codes', 'PASS', `${layer1Count[0].count} codes imported`);
  } else if (Number(layer1Count[0].count) > 0) {
    log('Layer1 Codes', 'WARN', `Only ${layer1Count[0].count} codes imported`);
  } else {
    log('Layer1 Codes', 'FAIL', 'No Layer1 codes found');
  }

  // All Layer1 codes have valid phase reference
  const orphanedCodes = await prisma.$queryRaw<[{count: bigint}]>`
    SELECT COUNT(*) as count FROM layer1_codes WHERE phase_option_id IS NULL
  `;
  if (Number(orphanedCodes[0].count) === 0) {
    log('Layer1 Phase Links', 'PASS', 'All codes linked to phases');
  } else {
    log('Layer1 Phase Links', 'FAIL', `${orphanedCodes[0].count} codes without phase`);
  }

  // All Layer1 codes have valid material class reference
  const orphanedMatClass = await prisma.$queryRaw<[{count: bigint}]>`
    SELECT COUNT(*) as count FROM layer1_codes WHERE material_class_id IS NULL
  `;
  if (Number(orphanedMatClass[0].count) === 0) {
    log('Layer1 Material Links', 'PASS', 'All codes linked to material classes');
  } else {
    log('Layer1 Material Links', 'FAIL', `${orphanedMatClass[0].count} codes without material class`);
  }

  // Elevation associations
  const elevCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM layer1_code_elevations`;
  if (Number(elevCount[0].count) > 0) {
    log('Elevation Associations', 'PASS', `${elevCount[0].count} elevation links`);
  } else {
    log('Elevation Associations', 'WARN', 'No elevation associations');
  }

  // Richmond option links
  const richLinkCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM layer1_code_richmond_options`;
  if (Number(richLinkCount[0].count) > 0) {
    log('Richmond Option Links', 'PASS', `${richLinkCount[0].count} option links`);
  } else {
    log('Richmond Option Links', 'WARN', 'No Richmond option links');
  }

  // ============================================================================
  // 4. FOREIGN KEY INTEGRITY
  // ============================================================================
  console.log('\n4. FOREIGN KEY INTEGRITY');
  console.log('───────────────────────────────────────────────────────────────');

  // Check plans reference valid customers
  const invalidPlanBuilders = await prisma.$queryRaw<[{count: bigint}]>`
    SELECT COUNT(*) as count FROM "Plan" p
    WHERE p.builder_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM "Customer" c WHERE c.id = p.builder_id)
  `;
  if (Number(invalidPlanBuilders[0].count) === 0) {
    log('Plan->Customer FK', 'PASS', 'All plan builder references valid');
  } else {
    log('Plan->Customer FK', 'FAIL', `${invalidPlanBuilders[0].count} invalid builder references`);
  }

  // Check Layer1 codes reference valid phases
  const invalidPhaseRefs = await prisma.$queryRaw<[{count: bigint}]>`
    SELECT COUNT(*) as count FROM layer1_codes l
    WHERE NOT EXISTS (SELECT 1 FROM phase_option_definitions p WHERE p.id = l.phase_option_id)
  `;
  if (Number(invalidPhaseRefs[0].count) === 0) {
    log('Layer1->Phase FK', 'PASS', 'All phase references valid');
  } else {
    log('Layer1->Phase FK', 'FAIL', `${invalidPhaseRefs[0].count} invalid phase references`);
  }

  // Check Layer1 codes reference valid material classes
  const invalidMatClassRefs = await prisma.$queryRaw<[{count: bigint}]>`
    SELECT COUNT(*) as count FROM layer1_codes l
    WHERE NOT EXISTS (SELECT 1 FROM material_classes m WHERE m.id = l.material_class_id)
  `;
  if (Number(invalidMatClassRefs[0].count) === 0) {
    log('Layer1->MaterialClass FK', 'PASS', 'All material class references valid');
  } else {
    log('Layer1->MaterialClass FK', 'FAIL', `${invalidMatClassRefs[0].count} invalid material class references`);
  }

  // ============================================================================
  // 5. DATA CONSISTENCY
  // ============================================================================
  console.log('\n5. DATA CONSISTENCY');
  console.log('───────────────────────────────────────────────────────────────');

  // Check unique constraints are respected
  const dupPhases = await prisma.$queryRaw<[{count: bigint}]>`
    SELECT COUNT(*) as count FROM (
      SELECT phase_code FROM phase_option_definitions GROUP BY phase_code HAVING COUNT(*) > 1
    ) dups
  `;
  if (Number(dupPhases[0].count) === 0) {
    log('Phase Code Uniqueness', 'PASS', 'No duplicate phase codes');
  } else {
    log('Phase Code Uniqueness', 'FAIL', `${dupPhases[0].count} duplicate phase codes`);
  }

  const dupRichmond = await prisma.$queryRaw<[{count: bigint}]>`
    SELECT COUNT(*) as count FROM (
      SELECT option_code FROM richmond_option_codes GROUP BY option_code HAVING COUNT(*) > 1
    ) dups
  `;
  if (Number(dupRichmond[0].count) === 0) {
    log('Richmond Code Uniqueness', 'PASS', 'No duplicate Richmond codes');
  } else {
    log('Richmond Code Uniqueness', 'FAIL', `${dupRichmond[0].count} duplicate Richmond codes`);
  }

  const dupLayer1 = await prisma.$queryRaw<[{count: bigint}]>`
    SELECT COUNT(*) as count FROM (
      SELECT full_code FROM layer1_codes GROUP BY full_code HAVING COUNT(*) > 1
    ) dups
  `;
  if (Number(dupLayer1[0].count) === 0) {
    log('Layer1 Code Uniqueness', 'PASS', 'No duplicate Layer1 codes');
  } else {
    log('Layer1 Code Uniqueness', 'FAIL', `${dupLayer1[0].count} duplicate Layer1 codes`);
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;

  console.log(`  VALIDATION COMPLETE: ${passed} passed, ${warned} warnings, ${failed} failed`);

  if (failed === 0 && warned === 0) {
    console.log('  STATUS: ALL CHECKS PASSED');
  } else if (failed === 0) {
    console.log('  STATUS: PASSED WITH WARNINGS');
  } else {
    console.log('  STATUS: VALIDATION FAILED');
  }

  console.log('═══════════════════════════════════════════════════════════════');

  await prisma.$disconnect();

  // Exit with error code if any failures
  if (failed > 0) {
    process.exit(1);
  }
}

validateDatabase().catch((error) => {
  console.error('Validation error:', error);
  process.exit(1);
});
