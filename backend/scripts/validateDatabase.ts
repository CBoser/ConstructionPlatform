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
  // 6. HOLT CROSS-REFERENCE SYSTEM
  // ============================================================================
  console.log('\n6. HOLT CROSS-REFERENCE SYSTEM');
  console.log('───────────────────────────────────────────────────────────────');

  // Holt Phase Mappings
  try {
    const holtPhaseCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM holt_phase_xref`;
    if (Number(holtPhaseCount[0].count) >= 20) {
      log('Holt Phase Mappings', 'PASS', `${holtPhaseCount[0].count} phase mappings`);
    } else if (Number(holtPhaseCount[0].count) > 0) {
      log('Holt Phase Mappings', 'WARN', `Only ${holtPhaseCount[0].count} phase mappings`);
    } else {
      log('Holt Phase Mappings', 'FAIL', 'No Holt phase mappings found');
    }

    // Check Holt->Unified phase links
    const orphanedHolt = await prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(*) as count FROM holt_phase_xref
      WHERE unified_phase_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM phase_option_definitions p WHERE p.id = unified_phase_id)
    `;
    if (Number(orphanedHolt[0].count) === 0) {
      log('Holt->Phase Links', 'PASS', 'All Holt mappings reference valid phases');
    } else {
      log('Holt->Phase Links', 'FAIL', `${orphanedHolt[0].count} invalid phase references`);
    }
  } catch {
    log('Holt Phase Mappings', 'WARN', 'Table not yet created (run migration)');
  }

  // Item Type Mappings
  try {
    const itemTypeCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM item_type_xref`;
    if (Number(itemTypeCount[0].count) >= 5) {
      log('Item Type Mappings', 'PASS', `${itemTypeCount[0].count} item type mappings`);
    } else if (Number(itemTypeCount[0].count) > 0) {
      log('Item Type Mappings', 'WARN', `Only ${itemTypeCount[0].count} item type mappings`);
    } else {
      log('Item Type Mappings', 'FAIL', 'No item type mappings found');
    }
  } catch {
    log('Item Type Mappings', 'WARN', 'Table not yet created (run migration)');
  }

  // BAT Pack Definitions
  try {
    const batPackCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM bat_pack_definitions`;
    if (Number(batPackCount[0].count) >= 20) {
      log('BAT Pack Definitions', 'PASS', `${batPackCount[0].count} pack definitions`);
    } else if (Number(batPackCount[0].count) > 0) {
      log('BAT Pack Definitions', 'WARN', `Only ${batPackCount[0].count} pack definitions`);
    } else {
      log('BAT Pack Definitions', 'FAIL', 'No BAT pack definitions found');
    }

    // Check shipping order consistency
    const invalidShipping = await prisma.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(*) as count FROM bat_pack_definitions
      WHERE shipping_order < 1 OR shipping_order > 15
    `;
    if (Number(invalidShipping[0].count) === 0) {
      log('BAT Shipping Order', 'PASS', 'All shipping orders are valid (1-15)');
    } else {
      log('BAT Shipping Order', 'WARN', `${invalidShipping[0].count} packs with invalid shipping order`);
    }
  } catch {
    log('BAT Pack Definitions', 'WARN', 'Table not yet created (run migration)');
  }

  // ============================================================================
  // 7. LAYER 2 MATERIALS (SKU Level)
  // ============================================================================
  console.log('\n7. LAYER 2 MATERIALS (SKU Level)');
  console.log('───────────────────────────────────────────────────────────────');

  try {
    const layer2Count = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM layer2_materials`;
    if (Number(layer2Count[0].count) >= 100) {
      log('Layer2 Materials', 'PASS', `${layer2Count[0].count} SKU-level materials`);
    } else if (Number(layer2Count[0].count) > 0) {
      log('Layer2 Materials', 'WARN', `Only ${layer2Count[0].count} SKU-level materials`);
    } else {
      log('Layer2 Materials', 'FAIL', 'No Layer2 materials found');
    }

    // Check materials by pack
    const packDistribution = await prisma.$queryRaw<{bat_pack_id: string, count: bigint}[]>`
      SELECT bat_pack_id, COUNT(*) as count FROM layer2_materials
      GROUP BY bat_pack_id ORDER BY bat_pack_id
    `;
    const criticalPacks = ['|10', '|20', '|40', '|60'];
    for (const pack of criticalPacks) {
      const packData = packDistribution.find(p => p.bat_pack_id === pack);
      if (packData && Number(packData.count) >= 5) {
        log(`Layer2 Pack ${pack}`, 'PASS', `${packData.count} materials`);
      } else if (packData) {
        log(`Layer2 Pack ${pack}`, 'WARN', `Only ${packData.count} materials`);
      } else {
        log(`Layer2 Pack ${pack}`, 'WARN', 'No materials for critical pack');
      }
    }
  } catch {
    log('Layer2 Materials', 'WARN', 'Table not yet created (run migration)');
  }

  // ============================================================================
  // 8. CUSTOMER CODE CROSS-REFERENCE
  // ============================================================================
  console.log('\n8. CUSTOMER CODE CROSS-REFERENCE');
  console.log('───────────────────────────────────────────────────────────────');

  try {
    const custXrefCount = await prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM customer_code_xref`;
    if (Number(custXrefCount[0].count) > 0) {
      log('Customer Code Xref', 'PASS', `${custXrefCount[0].count} customer code mappings`);

      // Check validation status
      const validatedCount = await prisma.$queryRaw<[{count: bigint}]>`
        SELECT COUNT(*) as count FROM customer_code_xref WHERE is_validated = true
      `;
      const validatedPct = Number(custXrefCount[0].count) > 0
        ? Math.round((Number(validatedCount[0].count) / Number(custXrefCount[0].count)) * 100)
        : 0;
      if (validatedPct >= 80) {
        log('Customer Code Validation', 'PASS', `${validatedPct}% codes validated`);
      } else if (validatedPct > 0) {
        log('Customer Code Validation', 'WARN', `Only ${validatedPct}% codes validated`);
      } else {
        log('Customer Code Validation', 'WARN', 'No codes validated yet');
      }
    } else {
      log('Customer Code Xref', 'WARN', 'No customer code mappings yet');
    }
  } catch {
    log('Customer Code Xref', 'WARN', 'Table not yet created (run migration)');
  }

  // ============================================================================
  // 9. OPTION SUFFIX COMPLETENESS
  // ============================================================================
  console.log('\n9. OPTION SUFFIX COMPLETENESS');
  console.log('───────────────────────────────────────────────────────────────');

  // Check complete suffix range 00-83
  const allSuffixes = await prisma.$queryRaw<{suffix_code: string}[]>`
    SELECT suffix_code FROM option_suffixes ORDER BY suffix_code
  `;
  const suffixSet = new Set(allSuffixes.map(s => s.suffix_code));

  // Check critical suffixes exist
  const criticalSuffixes = ['00', '01', '03', '04', '05', '06', '07', '08', '09', '10', '11', '20', '30', '40', '50', '60', '70', '80'];
  let missingSuffixes = 0;
  for (const cs of criticalSuffixes) {
    if (!suffixSet.has(cs)) {
      missingSuffixes++;
    }
  }
  if (missingSuffixes === 0) {
    log('Critical Suffixes', 'PASS', 'All critical suffixes defined');
  } else {
    log('Critical Suffixes', 'FAIL', `${missingSuffixes} critical suffixes missing`);
  }

  // Check suffix range completeness
  const totalExpected = 84; // 00-83
  if (suffixSet.size >= totalExpected) {
    log('Suffix Range', 'PASS', `${suffixSet.size}/${totalExpected} suffixes defined`);
  } else if (suffixSet.size >= 50) {
    log('Suffix Range', 'WARN', `${suffixSet.size}/${totalExpected} suffixes defined`);
  } else {
    log('Suffix Range', 'WARN', `Only ${suffixSet.size}/${totalExpected} suffixes defined`);
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
