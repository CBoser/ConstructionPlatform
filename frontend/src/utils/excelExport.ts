import ExcelJS from 'exceljs';
import type { Plan, PlanElevation, PlanAssignedOption } from '../services/planService';

// Exportable plan type - allows string for type field (for API responses)
type ExportablePlan = Omit<Plan, 'type'> & { type: string };

// Format plan type for display
const formatPlanType = (type: string): string => {
  const typeMap: Record<string, string> = {
    SINGLE_STORY: 'Single Story',
    TWO_STORY: 'Two Story',
    THREE_STORY: 'Three Story',
    DUPLEX: 'Duplex',
    TOWNHOME: 'Townhome',
  };
  return typeMap[type] || type;
};

// Format category for display
const formatCategory = (category: string): string => {
  return category
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

// Format date for display
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

// Format currency
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Export plans data to Excel
 */
export async function exportPlansToExcel(
  plans: ExportablePlan[],
  filename = 'plans-export'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MindFlow Platform';
  workbook.created = new Date();

  // Plans Sheet
  const plansSheet = workbook.addWorksheet('Plans', {
    headerFooter: {
      firstHeader: 'Plans Export',
    },
  });

  // Define columns
  plansSheet.columns = [
    { header: 'Plan Code', key: 'code', width: 15 },
    { header: 'Customer Plan Code', key: 'customerPlanCode', width: 18 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Builder', key: 'builder', width: 25 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Sq Ft', key: 'sqft', width: 10 },
    { header: 'Bedrooms', key: 'bedrooms', width: 10 },
    { header: 'Bathrooms', key: 'bathrooms', width: 10 },
    { header: 'Garage', key: 'garage', width: 12 },
    { header: 'Style', key: 'style', width: 15 },
    { header: 'Version', key: 'version', width: 10 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Elevations', key: 'elevations', width: 10 },
    { header: 'Jobs', key: 'jobs', width: 10 },
    { header: 'Created', key: 'createdAt', width: 12 },
    { header: 'Updated', key: 'updatedAt', width: 12 },
    { header: 'Notes', key: 'notes', width: 40 },
    { header: 'PDSS URL', key: 'pdssUrl', width: 30 },
  ];

  // Style header row
  const headerRow = plansSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Add data rows
  plans.forEach((plan) => {
    plansSheet.addRow({
      code: plan.code,
      customerPlanCode: plan.customerPlanCode || '',
      name: plan.name || '',
      builder: plan.builder?.customerName || '',
      type: formatPlanType(plan.type),
      sqft: plan.sqft || '',
      bedrooms: plan.bedrooms || '',
      bathrooms: plan.bathrooms || '',
      garage: plan.garage || '',
      style: plan.style || '',
      version: plan.version,
      status: plan.isActive ? 'Active' : 'Inactive',
      elevations: plan._count?.elevations || 0,
      jobs: plan._count?.jobs || 0,
      createdAt: formatDate(plan.createdAt),
      updatedAt: formatDate(plan.updatedAt),
      notes: plan.notes || '',
      pdssUrl: plan.pdssUrl || '',
    });
  });

  // Auto-filter
  plansSheet.autoFilter = {
    from: 'A1',
    to: `R${plans.length + 1}`,
  };

  // Freeze header row
  plansSheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  downloadExcelFile(buffer, `${filename}.xlsx`);
}

/**
 * Export plan with elevations to Excel
 */
export async function exportPlanDetailToExcel(
  plan: Plan,
  elevations: PlanElevation[],
  options: PlanAssignedOption[],
  filename?: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MindFlow Platform';
  workbook.created = new Date();

  // Plan Overview Sheet
  const overviewSheet = workbook.addWorksheet('Plan Overview');

  // Add plan details as key-value pairs
  const planDetails = [
    ['Plan Code', plan.code],
    ['Customer Plan Code', plan.customerPlanCode || '—'],
    ['Name', plan.name || '—'],
    ['Builder', plan.builder?.customerName || '—'],
    ['Type', formatPlanType(plan.type)],
    ['Square Feet', plan.sqft?.toLocaleString() || '—'],
    ['Bedrooms', plan.bedrooms?.toString() || '—'],
    ['Bathrooms', plan.bathrooms?.toString() || '—'],
    ['Garage', plan.garage || '—'],
    ['Style', plan.style || '—'],
    ['Version', plan.version.toString()],
    ['Status', plan.isActive ? 'Active' : 'Inactive'],
    ['Elevations Count', elevations.length.toString()],
    ['Options Count', options.length.toString()],
    ['Created', formatDate(plan.createdAt)],
    ['Updated', formatDate(plan.updatedAt)],
    ['PDSS URL', plan.pdssUrl || '—'],
    ['Notes', plan.notes || '—'],
  ];

  overviewSheet.columns = [
    { header: 'Property', key: 'property', width: 20 },
    { header: 'Value', key: 'value', width: 50 },
  ];

  // Style header
  const overviewHeader = overviewSheet.getRow(1);
  overviewHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  overviewHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };

  planDetails.forEach(([property, value]) => {
    overviewSheet.addRow({ property, value });
  });

  // Elevations Sheet
  if (elevations.length > 0) {
    const elevationsSheet = workbook.addWorksheet('Elevations');

    elevationsSheet.columns = [
      { header: 'Code', key: 'code', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Architect/Designer', key: 'architectDesigner', width: 25 },
      { header: 'Architect Date', key: 'architectDesignerDate', width: 15 },
      { header: 'Structural Engineer', key: 'structuralEngineer', width: 25 },
      { header: 'Engineer Date', key: 'structuralEngineerDate', width: 15 },
      { header: 'I-Joist Company', key: 'iJoistCompany', width: 20 },
      { header: 'I-Joist Date', key: 'iJoistCompanyDate', width: 15 },
      { header: 'Floor Truss', key: 'floorTrussCompany', width: 20 },
      { header: 'Floor Truss Date', key: 'floorTrussCompanyDate', width: 15 },
      { header: 'Roof Truss', key: 'roofTrussCompany', width: 20 },
      { header: 'Roof Truss Date', key: 'roofTrussCompanyDate', width: 15 },
      { header: 'Version', key: 'currentVersion', width: 10 },
      { header: 'Updated', key: 'updatedAt', width: 15 },
    ];

    // Style header
    const elevHeader = elevationsSheet.getRow(1);
    elevHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    elevHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF059669' },
    };
    elevHeader.alignment = { vertical: 'middle', horizontal: 'center' };

    elevations.forEach((elev) => {
      elevationsSheet.addRow({
        code: elev.code,
        name: elev.name || '',
        description: elev.description || '',
        architectDesigner: elev.architectDesigner || '',
        architectDesignerDate: formatDate(elev.architectDesignerDate),
        structuralEngineer: elev.structuralEngineer || '',
        structuralEngineerDate: formatDate(elev.structuralEngineerDate),
        iJoistCompany: elev.iJoistCompany || '',
        iJoistCompanyDate: formatDate(elev.iJoistCompanyDate),
        floorTrussCompany: elev.floorTrussCompany || '',
        floorTrussCompanyDate: formatDate(elev.floorTrussCompanyDate),
        roofTrussCompany: elev.roofTrussCompany || '',
        roofTrussCompanyDate: formatDate(elev.roofTrussCompanyDate),
        currentVersion: elev.currentVersion,
        updatedAt: formatDate(elev.updatedAt),
      });
    });

    elevationsSheet.autoFilter = {
      from: 'A1',
      to: `O${elevations.length + 1}`,
    };
    elevationsSheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  // Options Sheet
  if (options.length > 0) {
    const optionsSheet = workbook.addWorksheet('Options');

    optionsSheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Scope', key: 'scope', width: 20 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Estimated Cost', key: 'estimatedCost', width: 15 },
      { header: 'Standard', key: 'isStandard', width: 12 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Updated', key: 'updatedAt', width: 15 },
    ];

    // Style header
    const optHeader = optionsSheet.getRow(1);
    optHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    optHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF59E0B' },
    };
    optHeader.alignment = { vertical: 'middle', horizontal: 'center' };

    options.forEach((opt) => {
      // Determine scope - find elevation name if elevation-specific
      const elevation = opt.elevationId
        ? elevations.find((e) => e.id === opt.elevationId)
        : null;
      const scope = elevation ? `Elevation ${elevation.code}` : 'Plan-Level';

      optionsSheet.addRow({
        name: opt.name,
        category: formatCategory(opt.category),
        scope,
        description: opt.description || '',
        estimatedCost: formatCurrency(opt.estimatedCost),
        isStandard: opt.isStandard ? 'Yes' : 'No',
        notes: opt.notes || '',
        updatedAt: formatDate(opt.updatedAt),
      });
    });

    optionsSheet.autoFilter = {
      from: 'A1',
      to: `H${options.length + 1}`,
    };
    optionsSheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const exportFilename = filename || `plan-${plan.code}-export`;
  downloadExcelFile(buffer, `${exportFilename}.xlsx`);
}

/**
 * Helper to download Excel file
 */
function downloadExcelFile(buffer: ExcelJS.Buffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
