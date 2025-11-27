/**
 * One-time XLSX to CSV Conversion Script
 *
 * Converts xlsx files in the data directory to CSV format
 * to enable removal of the vulnerable xlsx library.
 *
 * Usage: npx ts-node scripts/convertXlsxToCsv.ts
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const ARCHIVE_DIR = path.join(__dirname, '..', '..', 'docs', 'archive', 'reference-materials');

// Files to convert
const xlsxFiles = [
  { dir: DATA_DIR, file: 'Conversion_Sheet.xlsx' },
  { dir: DATA_DIR, file: 'Margin_Update_Sheet.xlsx' },
  { dir: DATA_DIR, file: 'Price_Update_Sheet.xlsx' },
];

function convertXlsxToCsv(filePath: string, outputDir: string): void {
  const fileName = path.basename(filePath, path.extname(filePath));

  console.log(`\nProcessing: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`  File not found, skipping`);
    return;
  }

  try {
    const workbook = XLSX.readFile(filePath, {
      cellFormula: true,
      cellNF: true,
      cellDates: true,
    });

    console.log(`  Found ${workbook.SheetNames.length} sheet(s): ${workbook.SheetNames.join(', ')}`);

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet, {
        blankrows: false,
        strip: true,
      });

      // Create output filename
      const safeSheetName = sheetName.replace(/[^a-zA-Z0-9]/g, '_');
      const outputFileName = workbook.SheetNames.length === 1
        ? `${fileName}.csv`
        : `${fileName}_${safeSheetName}.csv`;

      const outputPath = path.join(outputDir, outputFileName);

      fs.writeFileSync(outputPath, csv, 'utf-8');
      console.log(`  Exported: ${outputFileName} (${csv.split('\n').length} rows)`);
    }

    // Also export as JSON for complex data structures
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      if (json.length > 0) {
        const safeSheetName = sheetName.replace(/[^a-zA-Z0-9]/g, '_');
        const outputFileName = workbook.SheetNames.length === 1
          ? `${fileName}.json`
          : `${fileName}_${safeSheetName}.json`;

        const outputPath = path.join(outputDir, outputFileName);
        fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), 'utf-8');
        console.log(`  Exported: ${outputFileName} (${json.length} records)`);
      }
    }
  } catch (error) {
    console.error(`  Error processing ${filePath}:`, error);
  }
}

async function main(): Promise<void> {
  console.log('========================================');
  console.log('XLSX to CSV Conversion Script');
  console.log('========================================');
  console.log(`Data directory: ${DATA_DIR}`);

  // Convert data files
  for (const { dir, file } of xlsxFiles) {
    const filePath = path.join(dir, file);
    convertXlsxToCsv(filePath, dir);
  }

  console.log('\n========================================');
  console.log('Conversion complete!');
  console.log('========================================');
  console.log('\nNext steps:');
  console.log('1. Verify the CSV files contain the expected data');
  console.log('2. Update any scripts that reference xlsx files');
  console.log('3. Remove the xlsx files after verification');
  console.log('4. Uninstall xlsx: npm uninstall xlsx');
}

main().catch(console.error);
