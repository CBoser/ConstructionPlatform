import ExcelJS from 'exceljs';
import { db } from './database';
import { PlanType } from '@prisma/client';

interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
}

interface PlanImportData {
  code: string;
  name: string | null;
  customerPlanCode: string | null;
  type: PlanType;
  builderName: string | null;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garage: string | null;
  style: string | null;
  version: number;
  isActive: boolean;
  pdssUrl: string | null;
  notes: string | null;
}

class PlanImportService {
  /**
   * Import plans from Excel file
   */
  async importFromExcel(filePath: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.getWorksheet('Plans');
      if (!worksheet) {
        throw new Error('Plans worksheet not found in Excel file');
      }

      // Skip header row, start from row 2
      const rows = worksheet.getRows(2, worksheet.rowCount - 1) || [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 because we skip header and arrays are 0-indexed

        try {
          // Skip empty rows
          if (!row.getCell(1).value) {
            result.skipped++;
            continue;
          }

          const planData = this.parsePlanRow(row);

          // Check if plan already exists by code
          const existingPlan = await db.plan.findUnique({
            where: { code: planData.code },
          });

          if (existingPlan) {
            // Update existing plan
            await db.plan.update({
              where: { id: existingPlan.id },
              data: {
                name: planData.name,
                customerPlanCode: planData.customerPlanCode,
                type: planData.type,
                sqft: planData.sqft,
                bedrooms: planData.bedrooms,
                bathrooms: planData.bathrooms,
                garage: planData.garage,
                style: planData.style,
                version: planData.version,
                isActive: planData.isActive,
                pdssUrl: planData.pdssUrl,
                notes: planData.notes,
              },
            });
            result.updated++;
          } else {
            // Find or create builder if builderName is provided
            let builderId: string | null = null;
            if (planData.builderName) {
              let builder = await db.customer.findFirst({
                where: { customerName: planData.builderName },
              });

              if (!builder) {
                // Create new builder/customer
                builder = await db.customer.create({
                  data: {
                    customerName: planData.builderName,
                    isActive: true,
                  },
                });
              }
              builderId = builder.id;
            }

            // Create new plan
            await db.plan.create({
              data: {
                code: planData.code,
                name: planData.name,
                customerPlanCode: planData.customerPlanCode,
                type: planData.type,
                builderId,
                sqft: planData.sqft,
                bedrooms: planData.bedrooms,
                bathrooms: planData.bathrooms,
                garage: planData.garage,
                style: planData.style,
                version: planData.version,
                isActive: planData.isActive,
                pdssUrl: planData.pdssUrl,
                notes: planData.notes,
              },
            });
            result.created++;
          }
        } catch (error) {
          result.errors.push({
            row: rowNumber,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      throw new Error(
        `Failed to import plans: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse a single row into plan data
   */
  private parsePlanRow(row: ExcelJS.Row): PlanImportData {
    const getCellValue = (colNumber: number): any => {
      const cell = row.getCell(colNumber);
      return cell.value;
    };

    const code = String(getCellValue(1) || '').trim();
    if (!code) {
      throw new Error('Plan code is required');
    }

    const typeValue = String(getCellValue(4) || '').trim();
    const validTypes: PlanType[] = [
      'SINGLE_STORY',
      'TWO_STORY',
      'THREE_STORY',
      'DUPLEX',
      'TOWNHOME',
    ];

    // Try to match type, default to SINGLE_STORY if not valid
    let planType: PlanType = 'SINGLE_STORY';
    if (validTypes.includes(typeValue as PlanType)) {
      planType = typeValue as PlanType;
    } else {
      // Try to parse from display format (e.g., "Single Story" -> "SINGLE_STORY")
      const normalized = typeValue.toUpperCase().replace(/\s+/g, '_');
      if (validTypes.includes(normalized as PlanType)) {
        planType = normalized as PlanType;
      }
    }

    return {
      code,
      name: getCellValue(2) ? String(getCellValue(2)).trim() : null,
      customerPlanCode: getCellValue(3) ? String(getCellValue(3)).trim() : null,
      type: planType,
      builderName: getCellValue(5) ? String(getCellValue(5)).trim() : null,
      sqft: getCellValue(6) ? Number(getCellValue(6)) : null,
      bedrooms: getCellValue(7) ? Number(getCellValue(7)) : null,
      bathrooms: getCellValue(8) ? Number(getCellValue(8)) : null,
      garage: getCellValue(9) ? String(getCellValue(9)).trim() : null,
      style: getCellValue(10) ? String(getCellValue(10)).trim() : null,
      version: getCellValue(11) ? Number(getCellValue(11)) : 1,
      isActive: getCellValue(12) ? String(getCellValue(12)).toLowerCase() === 'yes' : true,
      pdssUrl: getCellValue(13) ? String(getCellValue(13)).trim() : null,
      notes: getCellValue(14) ? String(getCellValue(14)).trim() : null,
    };
  }

  /**
   * Validate Excel file structure
   */
  async validateExcelFile(filePath: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.getWorksheet('Plans');
      if (!worksheet) {
        return { valid: false, error: 'Plans worksheet not found' };
      }

      // Check for required header
      const headerRow = worksheet.getRow(1);
      const codeHeader = headerRow.getCell(1).value;

      if (!codeHeader || String(codeHeader).toLowerCase() !== 'code') {
        return { valid: false, error: 'Invalid file format: Code column not found' };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const planImportService = new PlanImportService();
