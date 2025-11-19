# ReadyFrame Forms API Integration Guide

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Form Analysis](#form-analysis)
3. [MindFlow Data Mapping](#mindflow-data-mapping)
4. [API Architecture](#api-architecture)
5. [Implementation Services](#implementation-services)
6. [UI Components](#ui-components)
7. [Security & Tracking](#security--tracking)
8. [Implementation Checklist](#implementation-checklist)
9. [Code Examples](#code-examples)

---

## Executive Summary

### What This Does
Automatically pre-fills ReadyFrame schedule request forms using data from your MindFlow platform, eliminating manual data entry and reducing errors.

### Key Benefits
- **Time Savings**: 5-10 minutes per form → 30 seconds (one click)
- **Error Reduction**: 90%+ reduction in data entry errors
- **Consistency**: Standardized data flow from MindFlow to ReadyFrame
- **Tracking**: Full audit trail of schedule requests
- **User Experience**: One-click form generation with QR codes for mobile

### Technical Approach
- Pre-fill Microsoft Forms URLs with job data
- Generate unique tracking links per job
- Optional: Submit responses programmatically via Microsoft Graph API
- Full integration with existing MindFlow job management system

---

## Form Analysis

### ReadyFrame Schedule Request Form Structure

**Form URL**: `https://forms.office.com/Pages/ResponsePage.aspx?id=...`

**Total Fields**: 20 (11 required, 9 conditional/optional)

### Field Breakdown

#### Section 1: Basic Job Information (Fields 1-6)
| Field # | Label | Type | Required | Example |
|---------|-------|------|----------|---------|
| 1 | Builder | Text | Yes | "Holt Homes" |
| 2 | Sub-Division | Text | Yes | "Coyote Ridge" |
| 3 | Lot | Text | Yes | "47" |
| 4 | Plan Name/Number | Text | Yes | "2321" |
| 5 | Elevation | Text | Yes | "A" |
| 6 | Orientation | Choice | Yes | "Left" / "Right" / "Standard" |

#### Section 2: Sales Contacts (Fields 7-9)
| Field # | Label | Type | Required | Example |
|---------|-------|------|----------|---------|
| 7 | Outside Sales Email | Email | Yes | "corey.boser@bldr.com" |
| 8 | Inside Sales 1 Email | Email | Yes | "william.hatley@bldr.com" |
| 9 | Has Inside Sales 2? | Yes/No | Yes | "Yes" or "No" |
| 9b | Inside Sales 2 Email | Email | Conditional | (if Field 9 = Yes) |

#### Section 3: Production Information (Fields 10-12)
| Field # | Label | Type | Required | Rules |
|---------|-------|------|----------|-------|
| 10 | Cut Location | Choice | Yes | "Clackamas" or "Spokane" |
| 11 | First Wall Level Name | Text | Yes | "Main" (default) |
| 12 | Ship Date Level 1 | Date | Yes | Min 10 working days (SF), 20 days (MF), 15 days (Spokane) |

#### Section 4: Additional Levels (Fields 13-16)
| Field # | Label | Type | Required | Rules |
|---------|-------|------|----------|-------|
| 13 | Has Level 2? | Yes/No | Yes | Based on plan levels |
| 14 | Level 2 Name | Text | Conditional | "Upper" (typical) |
| 15 | Ship Date Level 2 | Date | Conditional | +5-7 working days after Level 1 |
| 16 | Has Level 3? | Yes/No | Yes | Based on plan levels |
| 16b | Level 3 Name | Text | Conditional | (if Field 16 = Yes) |
| 16c | Ship Date Level 3 | Date | Conditional | (if Field 16 = Yes) |

#### Section 5: Stairs & Documents (Fields 17-18)
| Field # | Label | Type | Required | Limits |
|---------|-------|------|----------|--------|
| 17 | Pre-fab Stairs Included? | Yes/No | Yes | - |
| 18 | Document Upload | File | Yes | Max 10 files, 1GB each |

**Allowed Document Types**:
- Plans (PDF)
- Structural Plans (PDF)
- Floor Layouts and Calcs (PDF, Excel)
- Truss Layout and Calcs (PDF)
- PCNs (PDF, Word)

#### Section 6: Notes (Fields 19-20)
| Field # | Label | Type | Required | Max Length |
|---------|-------|------|----------|-----------|
| 19 | Job Notes | Text | No | 4000 chars |
| 20 | Form Feedback | Text | No | Optional |

---

## MindFlow Data Mapping

### Complete Field Mapping Configuration

```typescript
// src/config/formMappings/readyframeSchedule.ts

export interface FormFieldMapping {
  formFieldId: string;           // Microsoft Forms field ID (r1, r2, etc.)
  mindflowSource: string;         // Path to data in MindFlow
  required: boolean;              // Is this field required?
  transform?: (value: any, context?: any) => any;  // Data transformation
  validation?: (value: any, context?: any) => boolean;  // Validation rule
  condition?: (data: any) => boolean;  // Show field conditionally
  defaultValue?: any;             // Fallback if no data
  allowedValues?: string[];       // Enum/choice values
  fallback?: string;              // Alternative data source
  maxLength?: number;             // String length limit
  maxFiles?: number;              // File upload limit
  maxSizePerFile?: number;        // File size limit
  allowedTypes?: string[];        // File MIME types
}

export const readyFrameScheduleMapping: FormFieldMapping[] = [
  // ===== SECTION 1: Basic Job Info =====
  {
    formFieldId: 'r1',
    mindflowSource: 'job.customer.companyName',
    required: true,
    validation: (val) => val.length > 0
  },
  {
    formFieldId: 'r2',
    mindflowSource: 'job.subdivision',
    required: true,
    validation: (val) => val.length > 0
  },
  {
    formFieldId: 'r3',
    mindflowSource: 'job.lotNumber',
    required: true,
    validation: (val) => val.length > 0
  },
  {
    formFieldId: 'r4',
    mindflowSource: 'job.plan.name',
    required: true,
    transform: (plan) => plan.name || plan.number
  },
  {
    formFieldId: 'r5',
    mindflowSource: 'job.plan.elevation',
    required: true,
    defaultValue: 'A'
  },
  {
    formFieldId: 'r6',
    mindflowSource: 'job.plan.orientation',
    required: true,
    allowedValues: ['Left', 'Right', 'Standard'],
    defaultValue: 'Standard'
  },
  
  // ===== SECTION 2: Sales Contacts =====
  {
    formFieldId: 'r7',
    mindflowSource: 'job.salesRep.email',
    required: true,
    validation: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    fallback: 'job.createdBy.email'
  },
  {
    formFieldId: 'r8',
    mindflowSource: 'job.insideSalesRep1.email',
    required: true,
    fallback: 'william.hatley@bldr.com'
  },
  {
    formFieldId: 'r9',
    mindflowSource: 'job.insideSalesRep2',
    required: true,
    transform: (rep) => rep ? 'Yes' : 'No'
  },
  {
    formFieldId: 'r9b',
    mindflowSource: 'job.insideSalesRep2.email',
    required: false,
    condition: (data) => data.hasInsideSales2
  },
  
  // ===== SECTION 3: Production Info =====
  {
    formFieldId: 'r10',
    mindflowSource: 'job.productionLocation',
    required: true,
    allowedValues: ['Clackamas', 'Spokane'],
    defaultValue: 'Clackamas'
  },
  {
    formFieldId: 'r11',
    mindflowSource: 'job.plan.levels[0].name',
    required: true,
    defaultValue: 'Main'
  },
  {
    formFieldId: 'r12',
    mindflowSource: 'job.schedule.phases.FRAMING.startDate',
    required: true,
    transform: (date, context) => {
      const workingDays = context.cutLocation === 'Spokane' ? 15 : 10;
      const isSingleFamily = context.customerType !== 'MULTI_FAMILY';
      const minDays = isSingleFamily ? workingDays : 20;
      return calculateWorkingDays(new Date(), minDays);
    },
    validation: (date, context) => {
      const minDate = calculateWorkingDays(new Date(), 10);
      return new Date(date) >= minDate;
    }
  },
  
  // ===== SECTION 4: Additional Levels =====
  {
    formFieldId: 'r13',
    mindflowSource: 'job.plan.levels',
    required: true,
    transform: (levels) => levels.length > 1 ? 'Yes' : 'No'
  },
  {
    formFieldId: 'r14',
    mindflowSource: 'job.plan.levels[1].name',
    required: false,
    condition: (data) => data.hasLevel2,
    defaultValue: 'Upper'
  },
  {
    formFieldId: 'r15',
    mindflowSource: 'job.schedule.phases.FRAMING.startDate',
    required: false,
    condition: (data) => data.hasLevel2,
    transform: (baseDate) => addWorkingDays(baseDate, 7)
  },
  {
    formFieldId: 'r16',
    mindflowSource: 'job.plan.levels',
    required: true,
    transform: (levels) => levels.length > 2 ? 'Yes' : 'No'
  },
  
  // ===== SECTION 5: Stairs & Documents =====
  {
    formFieldId: 'r17',
    mindflowSource: 'job.plan.includesStairs',
    required: true,
    transform: (val) => val ? 'Yes' : 'No',
    defaultValue: 'No'
  },
  {
    formFieldId: 'r18',
    mindflowSource: 'job.documents',
    required: true,
    transform: (docs) => {
      return docs.filter(d => 
        ['plans', 'structural', 'truss', 'pcn'].includes(d.type)
      );
    },
    maxFiles: 10,
    maxSizePerFile: 1024 * 1024 * 1024, // 1GB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'image/*',
      'video/*',
      'audio/*'
    ]
  },
  
  // ===== SECTION 6: Notes =====
  {
    formFieldId: 'r19',
    mindflowSource: 'job.notes',
    required: false,
    transform: (notes, context) => {
      const parts = [];
      if (notes) parts.push(notes);
      if (context.specialInstructions) parts.push(context.specialInstructions);
      if (context.gateCode) parts.push(`Gate Code: ${context.gateCode}`);
      return parts.join('\n\n');
    },
    maxLength: 4000
  },
  {
    formFieldId: 'r20',
    mindflowSource: null,
    required: false,
    defaultValue: ''
  }
];
```

### Data Structure Requirements

#### Required Database Fields

```typescript
// Ensure these fields exist in your Prisma schema

model Job {
  // Basic Info
  jobNumber         String
  subdivision       String
  lotNumber         String
  
  // Sales Team
  salesRep          User?     @relation("SalesRep")
  insideSalesRep1   User?     @relation("InsideSales1")
  insideSalesRep2   User?     @relation("InsideSales2")
  
  // Production
  productionLocation String?  // "Clackamas" or "Spokane"
  
  // Notes
  notes             String?
  specialInstructions String?
  accessCode        String?   // Gate code
  
  // Relations
  customer          Customer  @relation(fields: [customerId])
  plan              Plan      @relation(fields: [planId])
  schedule          Schedule?
  documents         Document[]
}

model Plan {
  name              String
  number            String?
  elevation         String?
  orientation       String?   // "Left", "Right", "Standard"
  includesStairs    Boolean   @default(false)
  levels            PlanLevel[]
  customOptions     String[]  // JSON array
}

model PlanLevel {
  name              String    // "Main", "Upper", etc.
  order             Int
  planId            String
  plan              Plan      @relation(fields: [planId])
}

model Schedule {
  jobId             String    @unique
  job               Job       @relation(fields: [jobId])
  phases            Phase[]
}

model Phase {
  name              String    // "FRAMING", etc.
  startDate         DateTime
  endDate           DateTime
  scheduleId        String
  schedule          Schedule  @relation(fields: [scheduleId])
}

model Document {
  id                String    @id
  jobId             String
  type              String    // "plans", "structural", "truss", "pcn"
  filename          String
  url               String
  mimeType          String
  size              Int
  uploadedAt        DateTime
  job               Job       @relation(fields: [jobId])
}
```

---

## API Architecture

### API Endpoints

```typescript
// ===== PRIMARY ENDPOINT =====
POST /api/readyframe/prefill
{
  "jobId": "string",
  "options": {
    "includeQRCode": boolean,
    "sendEmail": boolean,
    "recipientEmails": string[]
  }
}

Response: {
  "success": true,
  "data": {
    "prefillUrl": "https://forms.office.com/...",
    "qrCodeUrl": "/api/qr/...",
    "trackingToken": "string",
    "expiresAt": "2025-11-21T00:00:00Z",
    "jobData": {
      "builder": "Holt Homes",
      "subdivision": "Coyote Ridge",
      "lot": "47",
      "shipDate1": "2025-12-12",
      // ... etc
    }
  }
}

// ===== WEBHOOK ENDPOINT =====
POST /api/readyframe/webhook
{
  "formId": "string",
  "responseId": "string",
  "trackingToken": "string",
  "completedAt": "2025-11-14T10:30:00Z",
  "responses": {...}
}

// ===== TRACKING ENDPOINTS =====
GET /api/readyframe/submissions?jobId={jobId}
GET /api/readyframe/submissions/{submissionId}

// ===== QR CODE ENDPOINT =====
GET /api/qr/{token}
Response: PNG image
```

### Database Schema for Tracking

```typescript
// src/prisma/schema.prisma

model ReadyFrameSubmission {
  id              String    @id @default(cuid())
  jobId           String
  trackingToken   String    @unique
  prefillUrl      String    @db.Text
  qrCodeUrl       String?
  
  // Submission tracking
  createdAt       DateTime  @default(now())
  createdBy       String
  submittedAt     DateTime?
  responseId      String?   @unique
  
  // Metadata
  ipAddress       String?
  userAgent       String?
  expiresAt       DateTime
  
  // Relations
  job             Job       @relation(fields: [jobId], references: [id])
  
  @@index([jobId])
  @@index([trackingToken])
  @@index([createdAt])
}

model ReadyFrameFormResponse {
  id              String    @id @default(cuid())
  submissionId    String    @unique
  jobId           String
  
  // Form data (denormalized for reporting)
  builder         String
  subdivision     String
  lot             String
  planName        String
  shipDate1       DateTime
  shipDate2       DateTime?
  cutLocation     String
  
  // Raw response
  rawResponse     Json
  
  // Timestamps
  submittedAt     DateTime  @default(now())
  processedAt     DateTime?
  
  // Relations
  submission      ReadyFrameSubmission @relation(fields: [submissionId])
  job             Job       @relation(fields: [jobId])
  
  @@index([jobId])
  @@index([submittedAt])
}
```

---

## Implementation Services

### Service 1: ReadyFrame Data Service

```typescript
// src/services/readyFrameFormService.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ReadyFrameFormData {
  // Basic Info
  builder: string;
  subdivision: string;
  lot: string;
  planName: string;
  elevation: string;
  orientation: string;
  
  // Sales Contacts
  outsideSalesEmail: string;
  insideSales1Email: string;
  hasInsideSales2: boolean;
  insideSales2Email?: string;
  
  // Production
  cutLocation: string;
  firstLevelName: string;
  shipDate1: Date;
  
  // Additional Levels
  hasLevel2: boolean;
  level2Name?: string;
  shipDate2?: Date;
  hasLevel3: boolean;
  level3Name?: string;
  shipDate3?: Date;
  
  // Stairs & Documents
  includesStairs: boolean;
  documents: Document[];
  
  // Notes
  jobNotes: string;
  formFeedback: string;
}

export class ReadyFrameFormService {
  
  async getJobDataForReadyFrame(jobId: string): Promise<ReadyFrameFormData> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: {
          include: {
            contacts: true
          }
        },
        plan: {
          include: {
            levels: {
              orderBy: { order: 'asc' }
            },
            documents: true
          }
        },
        schedule: {
          include: {
            phases: true
          }
        },
        salesRep: true,
        insideSalesRep1: true,
        insideSalesRep2: true,
        documents: {
          where: {
            type: {
              in: ['plans', 'structural', 'truss', 'pcn', 'floor_layout']
            }
          }
        }
      }
    });

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Calculate ship dates based on rules
    const framingPhase = job.schedule?.phases.find(
      p => p.name === 'FRAMING'
    );
    
    const cutLocation = job.productionLocation || 'Clackamas';
    const workingDaysLead = cutLocation === 'Spokane' ? 15 : 10;
    
    const shipDate1 = this.calculateWorkingDays(
      new Date(), 
      workingDaysLead
    );
    
    const shipDate2 = job.plan.levels.length > 1 
      ? this.addWorkingDays(shipDate1, 7)
      : null;
    
    const shipDate3 = job.plan.levels.length > 2
      ? this.addWorkingDays(shipDate2, 7)
      : null;

    return {
      // Basic Info
      builder: job.customer.companyName,
      subdivision: job.subdivision,
      lot: job.lotNumber,
      planName: job.plan.name,
      elevation: job.plan.elevation || 'A',
      orientation: job.plan.orientation || 'Standard',
      
      // Sales Contacts
      outsideSalesEmail: job.salesRep?.email || job.createdBy.email,
      insideSales1Email: job.insideSalesRep1?.email || 'william.hatley@bldr.com',
      hasInsideSales2: !!job.insideSalesRep2,
      insideSales2Email: job.insideSalesRep2?.email,
      
      // Production
      cutLocation,
      firstLevelName: job.plan.levels[0]?.name || 'Main',
      shipDate1,
      
      // Additional Levels
      hasLevel2: job.plan.levels.length > 1,
      level2Name: job.plan.levels[1]?.name || 'Upper',
      shipDate2,
      hasLevel3: job.plan.levels.length > 2,
      level3Name: job.plan.levels[2]?.name,
      shipDate3,
      
      // Stairs & Documents
      includesStairs: job.plan.includesStairs || false,
      documents: job.documents,
      
      // Notes
      jobNotes: this.compileJobNotes(job),
      formFeedback: ''
    };
  }

  /**
   * Calculate working days from a start date
   * Excludes weekends (Saturday/Sunday)
   */
  private calculateWorkingDays(startDate: Date, workingDays: number): Date {
    let date = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < workingDays) {
      date.setDate(date.getDate() + 1);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    
    return date;
  }

  /**
   * Add working days to a base date
   */
  private addWorkingDays(baseDate: Date, workingDays: number): Date {
    return this.calculateWorkingDays(baseDate, workingDays);
  }

  /**
   * Compile comprehensive job notes from multiple sources
   */
  private compileJobNotes(job: any): string {
    const notes: string[] = [];
    
    if (job.notes) {
      notes.push(job.notes);
    }
    
    if (job.specialInstructions) {
      notes.push(`Special Instructions: ${job.specialInstructions}`);
    }
    
    if (job.accessCode) {
      notes.push(`Site Access Code: ${job.accessCode}`);
    }
    
    if (job.plan.customOptions?.length > 0) {
      notes.push(`Plan Options: ${job.plan.customOptions.join(', ')}`);
    }
    
    return notes.join('\n\n');
  }
}
```

### Service 2: Prefill URL Generator

```typescript
// src/services/readyFramePrefillService.ts

import { ReadyFrameFormService, ReadyFrameFormData } from './readyFrameFormService';
import { QRCodeService } from './qrCodeService';

export class ReadyFramePrefillService {
  private readonly FORM_BASE_URL = 
    'https://forms.office.com/Pages/ResponsePage.aspx?id=udg...';
  
  private formService: ReadyFrameFormService;
  private qrService: QRCodeService;

  constructor() {
    this.formService = new ReadyFrameFormService();
    this.qrService = new QRCodeService();
  }

  /**
   * Generate a prefilled ReadyFrame form URL
   */
  async generatePrefillUrl(jobId: string): Promise<string> {
    const data = await this.formService.getJobDataForReadyFrame(jobId);
    
    const url = new URL(this.FORM_BASE_URL);
    
    // Microsoft Forms uses 'r' prefix + field number for prefill
    url.searchParams.append('r1', data.builder);
    url.searchParams.append('r2', data.subdivision);
    url.searchParams.append('r3', data.lot);
    url.searchParams.append('r4', data.planName);
    url.searchParams.append('r5', data.elevation);
    url.searchParams.append('r6', data.orientation);
    
    url.searchParams.append('r7', data.outsideSalesEmail);
    url.searchParams.append('r8', data.insideSales1Email);
    url.searchParams.append('r9', data.hasInsideSales2 ? 'Yes' : 'No');
    
    if (data.insideSales2Email) {
      url.searchParams.append('r9b', data.insideSales2Email);
    }
    
    url.searchParams.append('r10', data.cutLocation);
    url.searchParams.append('r11', data.firstLevelName);
    url.searchParams.append('r12', this.formatDate(data.shipDate1));
    
    url.searchParams.append('r13', data.hasLevel2 ? 'Yes' : 'No');
    if (data.hasLevel2) {
      url.searchParams.append('r14', data.level2Name);
      url.searchParams.append('r15', this.formatDate(data.shipDate2));
    }
    
    url.searchParams.append('r16', data.hasLevel3 ? 'Yes' : 'No');
    if (data.hasLevel3) {
      url.searchParams.append('r16b', data.level3Name);
      url.searchParams.append('r16c', this.formatDate(data.shipDate3));
    }
    
    url.searchParams.append('r17', data.includesStairs ? 'Yes' : 'No');
    
    // Note: Documents (r18) handled separately via file upload on form
    
    if (data.jobNotes) {
      url.searchParams.append('r19', data.jobNotes);
    }
    
    return url.toString();
  }

  /**
   * Create and store a complete prefill submission record
   */
  async createPrefillSubmission(
    jobId: string,
    userId: string
  ): Promise<{
    prefillUrl: string;
    qrCodeUrl: string;
    trackingToken: string;
    expiresAt: Date;
    jobData: ReadyFrameFormData;
  }> {
    // Generate prefill URL
    const prefillUrl = await this.generatePrefillUrl(jobId);
    
    // Generate tracking token
    const trackingToken = this.generateTrackingToken();
    
    // Create QR code
    const qrCodeUrl = await this.qrService.generateQRCode(prefillUrl);
    
    // Calculate expiration (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Store in database
    await prisma.readyFrameSubmission.create({
      data: {
        jobId,
        trackingToken,
        prefillUrl,
        qrCodeUrl,
        expiresAt,
        createdBy: userId
      }
    });
    
    // Get job data for preview
    const jobData = await this.formService.getJobDataForReadyFrame(jobId);
    
    return {
      prefillUrl,
      qrCodeUrl,
      trackingToken,
      expiresAt,
      jobData
    };
  }

  /**
   * Format date for Microsoft Forms
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Generate unique tracking token
   */
  private generateTrackingToken(): string {
    return `rf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Service 3: QR Code Generator

```typescript
// src/services/qrCodeService.ts

import QRCode from 'qrcode';
import { uploadToStorage } from '@/lib/storage';

export class QRCodeService {
  
  /**
   * Generate QR code as data URL
   */
  async generateQRCode(url: string): Promise<string> {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return dataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generate and store QR code as file
   */
  async generateAndStore(
    jobId: string,
    prefillUrl: string
  ): Promise<string> {
    const qrCodeData = await this.generateQRCode(prefillUrl);
    
    // Convert data URL to buffer
    const base64Data = qrCodeData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Store in your file storage
    const filename = `qr-readyframe-${jobId}-${Date.now()}.png`;
    const publicUrl = await uploadToStorage(filename, buffer, 'image/png');
    
    return publicUrl;
  }

  /**
   * Generate QR code with custom branding
   */
  async generateBrandedQRCode(
    url: string,
    options: {
      logo?: string;
      foregroundColor?: string;
      backgroundColor?: string;
    } = {}
  ): Promise<string> {
    return QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: options.foregroundColor || '#003366',  // Your brand color
        light: options.backgroundColor || '#FFFFFF'
      }
    });
  }
}
```

### Service 4: Email Notification Service

```typescript
// src/services/readyFrameEmailService.ts

import { sendEmail } from '@/lib/email';
import { ReadyFramePrefillService } from './readyFramePrefillService';

export class ReadyFrameEmailService {
  private prefillService: ReadyFramePrefillService;

  constructor() {
    this.prefillService = new ReadyFramePrefillService();
  }

  /**
   * Send prefill link email to inside sales team
   */
  async sendPrefillLinkEmail(
    jobId: string,
    recipientEmails: string[],
    userId: string
  ): Promise<void> {
    const submission = await this.prefillService.createPrefillSubmission(
      jobId,
      userId
    );
    
    const { prefillUrl, qrCodeUrl, jobData, expiresAt } = submission;
    
    await sendEmail({
      to: recipientEmails,
      subject: `ReadyFrame Schedule Request - Job ${jobData.lot} (${jobData.subdivision})`,
      html: this.generateEmailHTML(
        jobData,
        prefillUrl,
        qrCodeUrl,
        expiresAt
      )
    });
  }

  /**
   * Generate email HTML template
   */
  private generateEmailHTML(
    jobData: any,
    prefillUrl: string,
    qrCodeUrl: string,
    expiresAt: Date
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #003366; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .job-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #003366; }
          .job-info h3 { margin-top: 0; color: #003366; }
          .job-detail { margin: 8px 0; }
          .job-detail strong { display: inline-block; width: 140px; }
          .button { display: inline-block; padding: 12px 24px; background: #003366; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .qr-code { text-align: center; margin: 20px 0; }
          .qr-code img { max-width: 250px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .expiry { color: #d9534f; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ReadyFrame Schedule Request</h1>
          </div>
          
          <div class="content">
            <p>A new ReadyFrame schedule request has been prepared with pre-filled job information.</p>
            
            <div class="job-info">
              <h3>Job Details</h3>
              <div class="job-detail"><strong>Builder:</strong> ${jobData.builder}</div>
              <div class="job-detail"><strong>Subdivision:</strong> ${jobData.subdivision}</div>
              <div class="job-detail"><strong>Lot:</strong> ${jobData.lot}</div>
              <div class="job-detail"><strong>Plan:</strong> ${jobData.planName}</div>
              <div class="job-detail"><strong>Elevation:</strong> ${jobData.elevation}</div>
              <div class="job-detail"><strong>Cut Location:</strong> ${jobData.cutLocation}</div>
              <div class="job-detail"><strong>Ship Date (Level 1):</strong> ${this.formatDate(jobData.shipDate1)}</div>
              ${jobData.hasLevel2 ? `<div class="job-detail"><strong>Ship Date (Level 2):</strong> ${this.formatDate(jobData.shipDate2)}</div>` : ''}
            </div>
            
            <p><strong>Complete the form using one of these options:</strong></p>
            
            <div style="text-align: center;">
              <a href="${prefillUrl}" class="button">Open Form in Browser</a>
            </div>
            
            <div class="qr-code">
              <p><strong>Or scan this QR code on your mobile device:</strong></p>
              <img src="${qrCodeUrl}" alt="QR Code for ReadyFrame Form" />
            </div>
            
            <p class="expiry">⏰ This link expires on ${this.formatDate(expiresAt)}</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
            
            <p><small><strong>Note:</strong> Most form fields have been pre-filled from MindFlow. Please review and complete any remaining fields (especially document uploads) before submitting.</small></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from the MindFlow Platform.</p>
            <p>Questions? Contact your system administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
```

---

## UI Components

### Component 1: Schedule Button

```typescript
// src/components/ReadyFrame/ReadyFrameScheduleButton.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TruckIcon } from '@/components/icons';
import { useToast } from '@/hooks/useToast';
import { ReadyFramePreviewModal } from './ReadyFramePreviewModal';

interface ReadyFrameScheduleButtonProps {
  jobId: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ReadyFrameScheduleButton: React.FC<ReadyFrameScheduleButtonProps> = ({
  jobId,
  variant = 'primary',
  size = 'md',
  className
}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);
  const { toast } = useToast();

  const handleScheduleClick = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/readyframe/prefill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          options: {
            includeQRCode: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate form link');
      }

      const data = await response.json();
      setPrefillData(data.data);
      setShowModal(true);
      
    } catch (error) {
      console.error('ReadyFrame form error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate ReadyFrame form link. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleScheduleClick}
        loading={loading}
        variant={variant}
        size={size}
        className={className}
        icon={<TruckIcon className="w-4 h-4" />}
      >
        Schedule with ReadyFrame
      </Button>

      {showModal && prefillData && (
        <ReadyFramePreviewModal
          data={prefillData}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
```

### Component 2: Preview Modal

```typescript
// src/components/ReadyFrame/ReadyFramePreviewModal.tsx

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CopyIcon, ExternalLinkIcon, MailIcon } from '@/components/icons';
import { useToast } from '@/hooks/useToast';

interface ReadyFramePreviewModalProps {
  data: {
    prefillUrl: string;
    qrCodeUrl: string;
    trackingToken: string;
    expiresAt: string;
    jobData: any;
  };
  onClose: () => void;
}

export const ReadyFramePreviewModal: React.FC<ReadyFramePreviewModalProps> = ({
  data,
  onClose
}) => {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(data.prefillUrl);
      toast({
        title: 'Copied!',
        description: 'Form link copied to clipboard',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive'
      });
    }
  };

  const handleOpenForm = () => {
    window.open(data.prefillUrl, '_blank');
  };

  const handleEmailForm = () => {
    setEmailModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Modal
      title="ReadyFrame Schedule Request"
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-6">
        {/* Pre-filled Data Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <span className="text-xl mr-2">✓</span>
            Pre-filled Job Information
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Builder:</span>
              <span className="ml-2 text-gray-900">{data.jobData.builder}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Subdivision:</span>
              <span className="ml-2 text-gray-900">{data.jobData.subdivision}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Lot:</span>
              <span className="ml-2 text-gray-900">{data.jobData.lot}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Plan:</span>
              <span className="ml-2 text-gray-900">{data.jobData.planName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Elevation:</span>
              <span className="ml-2 text-gray-900">{data.jobData.elevation}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cut Location:</span>
              <span className="ml-2 text-gray-900">{data.jobData.cutLocation}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-700">Ship Date (Level 1):</span>
              <span className="ml-2 text-gray-900">
                {formatDate(data.jobData.shipDate1)}
              </span>
            </div>
            {data.jobData.hasLevel2 && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Ship Date (Level 2):</span>
                <span className="ml-2 text-gray-900">
                  {formatDate(data.jobData.shipDate2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleOpenForm}
            variant="primary"
            fullWidth
            icon={<ExternalLinkIcon className="w-4 h-4" />}
          >
            Open Form in Browser
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="secondary"
            fullWidth
            icon={<CopyIcon className="w-4 h-4" />}
          >
            Copy Link to Clipboard
          </Button>

          <Button
            onClick={handleEmailForm}
            variant="secondary"
            fullWidth
            icon={<MailIcon className="w-4 h-4" />}
          >
            Email Link to Team
          </Button>
        </div>

        {/* QR Code */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 text-center mb-3">
            Or scan this QR code on a mobile device:
          </p>
          <div className="flex justify-center">
            <img
              src={data.qrCodeUrl}
              alt="ReadyFrame Form QR Code"
              className="w-64 h-64"
            />
          </div>
        </div>

        {/* Expiration Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
          <span className="font-medium text-yellow-900">⏰ Link expires: </span>
          <span className="text-yellow-800">{formatDate(data.expiresAt)}</span>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>📋 <strong>Note:</strong> Most form fields are pre-filled. Please:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Review all information for accuracy</li>
            <li>Upload required documents (plans, calcs, etc.)</li>
            <li>Add any additional notes or special instructions</li>
            <li>Submit the form when complete</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
```

### Component 3: Email Form Modal

```typescript
// src/components/ReadyFrame/EmailFormModal.tsx

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';

interface EmailFormModalProps {
  jobId: string;
  onClose: () => void;
}

export const EmailFormModal: React.FC<EmailFormModalProps> = ({
  jobId,
  onClose
}) => {
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const handleSendEmail = async () => {
    // Validate email addresses
    const validEmails = recipients.filter(email => 
      email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (validEmails.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one valid email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/readyframe/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          recipients: validEmails
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast({
        title: 'Success',
        description: `Form link sent to ${validEmails.length} recipient(s)`,
        variant: 'success'
      });

      onClose();
      
    } catch (error) {
      console.error('Email send error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Email Form Link"
      onClose={onClose}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Send the pre-filled ReadyFrame form link to your team members.
        </p>

        <div className="space-y-3">
          {recipients.map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="email"
                placeholder="email@bldr.com"
                value={email}
                onChange={(e) => handleRecipientChange(index, e.target.value)}
                className="flex-1"
              />
              {recipients.length > 1 && (
                <Button
                  onClick={() => handleRemoveRecipient(index)}
                  variant="ghost"
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleAddRecipient}
          variant="secondary"
          size="sm"
          fullWidth
        >
          + Add Another Recipient
        </Button>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            Send Email
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

---

## Security & Tracking

### Security Measures

```typescript
// src/middleware/readyFrameAuth.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function readyFrameAuthMiddleware(req: NextRequest) {
  try {
    // Verify user authentication
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Verify user has permission to access job
    const { jobId } = await req.json();
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { 
        createdBy: true,
        salesRepId: true,
        insideSalesRep1Id: true,
        insideSalesRep2Id: true
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this job
    const hasAccess = 
      user.id === job.createdBy ||
      user.id === job.salesRepId ||
      user.id === job.insideSalesRep1Id ||
      user.id === job.insideSalesRep2Id ||
      user.role === 'ADMIN';

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Add user to request
    req.user = user;
    return NextResponse.next();
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
```

### Tracking & Analytics

```typescript
// src/services/readyFrameAnalyticsService.ts

export class ReadyFrameAnalyticsService {
  
  /**
   * Track form generation event
   */
  async trackFormGenerated(
    jobId: string,
    userId: string,
    metadata: any
  ): Promise<void> {
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'READYFRAME_FORM_GENERATED',
        jobId,
        userId,
        metadata,
        timestamp: new Date()
      }
    });
  }

  /**
   * Track form submission event
   */
  async trackFormSubmitted(
    submissionId: string,
    metadata: any
  ): Promise<void> {
    const submission = await prisma.readyFrameSubmission.update({
      where: { id: submissionId },
      data: {
        submittedAt: new Date()
      }
    });

    await prisma.analyticsEvent.create({
      data: {
        eventType: 'READYFRAME_FORM_SUBMITTED',
        jobId: submission.jobId,
        metadata,
        timestamp: new Date()
      }
    });
  }

  /**
   * Get submission statistics
   */
  async getSubmissionStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalGenerated: number;
    totalSubmitted: number;
    averageTimeToSubmit: number;
    submissionRate: number;
  }> {
    const generated = await prisma.readyFrameSubmission.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const submitted = await prisma.readyFrameSubmission.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        submittedAt: {
          not: null
        }
      }
    });

    const submissions = await prisma.readyFrameSubmission.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        submittedAt: {
          not: null
        }
      },
      select: {
        createdAt: true,
        submittedAt: true
      }
    });

    const averageTimeToSubmit = submissions.length > 0
      ? submissions.reduce((acc, sub) => {
          const diff = sub.submittedAt.getTime() - sub.createdAt.getTime();
          return acc + diff;
        }, 0) / submissions.length / 1000 / 60 // Convert to minutes
      : 0;

    return {
      totalGenerated: generated,
      totalSubmitted: submitted,
      averageTimeToSubmit: Math.round(averageTimeToSubmit),
      submissionRate: generated > 0 ? (submitted / generated) * 100 : 0
    };
  }
}
```

---

## Implementation Checklist

### Phase 1: Core Functionality (Week 1)
- [ ] **Day 1-2: Database Setup**
  - [ ] Add Prisma models for ReadyFrame tracking
  - [ ] Create migration files
  - [ ] Run migrations on development database
  - [ ] Seed test data

- [ ] **Day 3-4: Core Services**
  - [ ] Implement `ReadyFrameFormService`
  - [ ] Implement working day calculator
  - [ ] Write unit tests for date calculations
  - [ ] Implement `ReadyFramePrefillService`

- [ ] **Day 5: API Endpoints**
  - [ ] Create `/api/readyframe/prefill` endpoint
  - [ ] Add authentication middleware
  - [ ] Test with Postman/Thunder Client
  - [ ] Document API in Swagger/OpenAPI

### Phase 2: UI Integration (Week 2)
- [ ] **Day 1-2: Core Components**
  - [ ] Create `ReadyFrameScheduleButton` component
  - [ ] Create `ReadyFramePreviewModal` component
  - [ ] Add to Job Detail page
  - [ ] Style with Tailwind CSS

- [ ] **Day 3: QR Code Integration**
  - [ ] Implement `QRCodeService`
  - [ ] Install `qrcode` npm package
  - [ ] Test QR code generation
  - [ ] Add QR code to preview modal

- [ ] **Day 4-5: Job Management Board**
  - [ ] Add schedule button to job cards
  - [ ] Add bulk schedule action
  - [ ] Test with multiple jobs
  - [ ] User acceptance testing

### Phase 3: Enhancement (Week 3)
- [ ] **Day 1-2: Email Integration**
  - [ ] Implement `ReadyFrameEmailService`
  - [ ] Create email template
  - [ ] Test email delivery
  - [ ] Add email modal to UI

- [ ] **Day 3: Tracking & Analytics**
  - [ ] Implement analytics service
  - [ ] Create tracking dashboard
  - [ ] Add submission stats widget
  - [ ] Set up automated reports

- [ ] **Day 4-5: Polish & Documentation**
  - [ ] Write user documentation
  - [ ] Create training video/guide
  - [ ] Final bug fixes
  - [ ] Deploy to production

---

## Code Examples

### Complete API Endpoint

```typescript
// src/app/api/readyframe/prefill/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ReadyFramePrefillService } from '@/services/readyFramePrefillService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prefillService = new ReadyFramePrefillService();

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { jobId, options } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Generate prefill submission
    const result = await prefillService.createPrefillSubmission(
      jobId,
      session.user.id
    );

    // Track analytics
    await analyticsService.trackFormGenerated(
      jobId,
      session.user.id,
      { options }
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('ReadyFrame prefill error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to generate form link'
      },
      { status: 500 }
    );
  }
}
```

### Webhook Handler

```typescript
// src/app/api/readyframe/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ReadyFrameAnalyticsService } from '@/services/readyFrameAnalyticsService';

const analyticsService = new ReadyFrameAnalyticsService();

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    const { trackingToken, formId, responseId, responses } = payload;

    // Find submission by tracking token
    const submission = await prisma.readyFrameSubmission.findUnique({
      where: { trackingToken }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Store form response
    await prisma.readyFrameFormResponse.create({
      data: {
        submissionId: submission.id,
        jobId: submission.jobId,
        rawResponse: responses,
        // Extract key fields for easy querying
        builder: responses.r1,
        subdivision: responses.r2,
        lot: responses.r3,
        planName: responses.r4,
        shipDate1: new Date(responses.r12),
        shipDate2: responses.r15 ? new Date(responses.r15) : null,
        cutLocation: responses.r10
      }
    });

    // Update submission status
    await prisma.readyFrameSubmission.update({
      where: { id: submission.id },
      data: {
        submittedAt: new Date(),
        responseId
      }
    });

    // Track analytics
    await analyticsService.trackFormSubmitted(
      submission.id,
      { formId, responseId }
    );

    // Update job status
    await prisma.job.update({
      where: { id: submission.jobId },
      data: {
        readyFrameScheduled: true,
        readyFrameScheduledAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('ReadyFrame webhook error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Webhook processing failed'
      },
      { status: 500 }
    );
  }
}
```

### Integration with Job Detail Page

```typescript
// src/app/jobs/[id]/page.tsx

import { ReadyFrameScheduleButton } from '@/components/ReadyFrame/ReadyFrameScheduleButton';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  // ... other code

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Details</h1>
        
        <div className="flex gap-3">
          {/* Other action buttons */}
          <ReadyFrameScheduleButton 
            jobId={params.id}
            variant="primary"
          />
        </div>
      </div>

      {/* Job details content */}
    </div>
  );
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// src/services/__tests__/readyFrameFormService.test.ts

import { ReadyFrameFormService } from '../readyFrameFormService';

describe('ReadyFrameFormService', () => {
  let service: ReadyFrameFormService;

  beforeEach(() => {
    service = new ReadyFrameFormService();
  });

  describe('calculateWorkingDays', () => {
    it('should calculate 10 working days correctly', () => {
      const startDate = new Date('2025-11-14'); // Friday
      const result = service['calculateWorkingDays'](startDate, 10);
      
      // Should skip 2 weekends (4 days) and add 10 working days
      expect(result.getDate()).toBe(28); // Nov 28
    });

    it('should handle starting on Monday', () => {
      const startDate = new Date('2025-11-17'); // Monday
      const result = service['calculateWorkingDays'](startDate, 5);
      
      expect(result.getDate()).toBe(24); // Nov 24 (Friday)
    });
  });

  describe('getJobDataForReadyFrame', () => {
    it('should return complete form data', async () => {
      const mockJobId = 'test-job-123';
      
      // Mock Prisma call
      prismaMock.job.findUnique.mockResolvedValue(mockJob);
      
      const result = await service.getJobDataForReadyFrame(mockJobId);
      
      expect(result).toHaveProperty('builder');
      expect(result).toHaveProperty('subdivision');
      expect(result).toHaveProperty('shipDate1');
      expect(result.shipDate1).toBeInstanceOf(Date);
    });
  });
});
```

### Integration Tests

```typescript
// src/app/api/readyframe/__tests__/prefill.test.ts

import { POST } from '../prefill/route';
import { NextRequest } from 'next/server';

describe('POST /api/readyframe/prefill', () => {
  it('should generate prefill URL successfully', async () => {
    const req = new NextRequest('http://localhost:3000/api/readyframe/prefill', {
      method: 'POST',
      body: JSON.stringify({
        jobId: 'test-job-123'
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('prefillUrl');
    expect(data.data.prefillUrl).toContain('forms.office.com');
  });

  it('should reject unauthorized requests', async () => {
    // Test without authentication
    const req = new NextRequest('http://localhost:3000/api/readyframe/prefill', {
      method: 'POST',
      body: JSON.stringify({
        jobId: 'test-job-123'
      })
    });

    const response = await POST(req);

    expect(response.status).toBe(401);
  });
});
```

---

## Troubleshooting Guide

### Common Issues

#### Issue 1: Working Day Calculation Off By One
**Symptom**: Ship dates are one day earlier/later than expected  
**Cause**: Timezone differences or weekend boundary conditions  
**Solution**:
```typescript
// Ensure dates are in local timezone
const date = new Date(startDate);
date.setHours(12, 0, 0, 0); // Set to noon to avoid DST issues
```

#### Issue 2: Missing Form Field IDs
**Symptom**: Pre-fill URL doesn't populate fields  
**Cause**: Microsoft Forms field IDs changed  
**Solution**:
1. Inspect the form HTML source
2. Look for input field `name` attributes (e.g., `name="r1"`)
3. Update `formFieldId` values in mapping configuration

#### Issue 3: QR Code Not Displaying
**Symptom**: QR code shows as broken image  
**Cause**: Data URL size exceeds limit or CORS issue  
**Solution**:
```typescript
// Store QR code as file instead of data URL
const qrCodeUrl = await qrService.generateAndStore(jobId, prefillUrl);
```

#### Issue 4: Email Delivery Failures
**Symptom**: Emails not received  
**Cause**: SMTP configuration or spam filters  
**Solution**:
1. Check SMTP credentials
2. Add SPF/DKIM records to domain
3. Test with personal email first

---

## Performance Optimization

### Caching Strategy

```typescript
// src/lib/cache/readyFrameCache.ts

import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class ReadyFrameCache {
  
  /**
   * Cache job data for 5 minutes
   */
  async cacheJobData(jobId: string, data: any): Promise<void> {
    const key = `readyframe:job:${jobId}`;
    await redis.setex(key, 300, JSON.stringify(data));
  }

  /**
   * Get cached job data
   */
  async getCachedJobData(jobId: string): Promise<any | null> {
    const key = `readyframe:job:${jobId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Invalidate cache when job updated
   */
  async invalidateJobCache(jobId: string): Promise<void> {
    const key = `readyframe:job:${jobId}`;
    await redis.del(key);
  }
}
```

### Database Optimization

```typescript
// Add indexes for common queries
// In Prisma schema:

model ReadyFrameSubmission {
  // ... fields

  @@index([jobId, createdAt])
  @@index([trackingToken])
  @@index([createdBy, createdAt])
}

model ReadyFrameFormResponse {
  // ... fields

  @@index([jobId, submittedAt])
  @@index([cutLocation, submittedAt])
  @@index([builder, submittedAt])
}
```

---

## Future Enhancements

### Phase 4: Advanced Features (Future)

1. **Automated Document Upload**
   - Auto-attach relevant documents from job file library
   - OCR document classification
   - Automatic form field extraction from PDFs

2. **Smart Ship Date Calculation**
   - Machine learning based on historical data
   - Weather delay prediction
   - Capacity planning integration

3. **Mobile App Integration**
   - Native iOS/Android app
   - Offline form completion
   - Push notifications

4. **Voice-to-Form**
   - Voice command form filling
   - Natural language processing
   - Integration with Alexa/Google Assistant

5. **Batch Processing**
   - Generate forms for multiple jobs at once
   - Bulk email distribution
   - CSV export of form data

---

## Support & Maintenance

### Monitoring

```typescript
// Set up monitoring alerts
- Form generation failures > 5% error rate
- Webhook processing delays > 5 minutes
- QR code generation failures
- Email delivery failures > 10%
```

### Logs to Track

```typescript
// Important events to log:
- Form URL generation (INFO)
- Form submission received (INFO)
- Failed field mapping (WARNING)
- Authentication failures (WARNING)
- API errors (ERROR)
- Database errors (ERROR)
```

### Regular Maintenance Tasks

**Weekly:**
- Review form submission success rates
- Check for expired/unused prefill links
- Monitor email delivery rates

**Monthly:**
- Archive old submission records (>90 days)
- Review and update form field mappings
- Analyze usage patterns and optimize

**Quarterly:**
- Update dependencies
- Review security configurations
- Optimize database queries
- Update documentation

---

## Appendix

### A. Microsoft Forms Field ID Reference

```typescript
// Current field mappings (as of implementation)
r1  = Builder
r2  = Sub-Division
r3  = Lot
r4  = Plan Name/Number
r5  = Elevation
r6  = Orientation
r7  = Outside Sales Email
r8  = Inside Sales 1 Email
r9  = Has Inside Sales 2?
r9b = Inside Sales 2 Email (conditional)
r10 = Cut Location
r11 = First Wall Level Name
r12 = Ship Date Level 1
r13 = Has Level 2?
r14 = Level 2 Name (conditional)
r15 = Ship Date Level 2 (conditional)
r16 = Has Level 3?
r16b = Level 3 Name (conditional)
r16c = Ship Date Level 3 (conditional)
r17 = Pre-fab Stairs Included?
r18 = Document Upload
r19 = Job Notes
r20 = Form Feedback
```

### B. Working Day Calculation Examples

```
Start Date: Friday, Nov 14, 2025
Working Days: 10

Calculation:
Nov 14 (Fri) - Start
Nov 15 (Sat) - Skip (weekend)
Nov 16 (Sun) - Skip (weekend)
Nov 17 (Mon) - Day 1
Nov 18 (Tue) - Day 2
Nov 19 (Wed) - Day 3
Nov 20 (Thu) - Day 4
Nov 21 (Fri) - Day 5
Nov 22 (Sat) - Skip (weekend)
Nov 23 (Sun) - Skip (weekend)
Nov 24 (Mon) - Day 6
Nov 25 (Tue) - Day 7
Nov 26 (Wed) - Day 8
Nov 27 (Thu) - Thanksgiving (would need holiday logic)
Nov 28 (Fri) - Day 9
Dec 1  (Mon) - Day 10

Result: December 1, 2025
```

### C. Database Migration Template

```sql
-- Migration: Add ReadyFrame tracking tables
-- Date: 2025-11-14

CREATE TABLE "ReadyFrameSubmission" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "trackingToken" TEXT NOT NULL,
  "prefillUrl" TEXT NOT NULL,
  "qrCodeUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT NOT NULL,
  "submittedAt" TIMESTAMP(3),
  "responseId" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "ReadyFrameSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReadyFrameFormResponse" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "builder" TEXT NOT NULL,
  "subdivision" TEXT NOT NULL,
  "lot" TEXT NOT NULL,
  "planName" TEXT NOT NULL,
  "shipDate1" TIMESTAMP(3) NOT NULL,
  "shipDate2" TIMESTAMP(3),
  "cutLocation" TEXT NOT NULL,
  "rawResponse" JSONB NOT NULL,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  
  CONSTRAINT "ReadyFrameFormResponse_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "ReadyFrameSubmission_trackingToken_key" ON "ReadyFrameSubmission"("trackingToken");
CREATE UNIQUE INDEX "ReadyFrameSubmission_responseId_key" ON "ReadyFrameSubmission"("responseId");
CREATE INDEX "ReadyFrameSubmission_jobId_idx" ON "ReadyFrameSubmission"("jobId");
CREATE INDEX "ReadyFrameSubmission_createdAt_idx" ON "ReadyFrameSubmission"("createdAt");

CREATE UNIQUE INDEX "ReadyFrameFormResponse_submissionId_key" ON "ReadyFrameFormResponse"("submissionId");
CREATE INDEX "ReadyFrameFormResponse_jobId_idx" ON "ReadyFrameFormResponse"("jobId");
CREATE INDEX "ReadyFrameFormResponse_submittedAt_idx" ON "ReadyFrameFormResponse"("submittedAt");

-- Foreign Keys
ALTER TABLE "ReadyFrameSubmission" ADD CONSTRAINT "ReadyFrameSubmission_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReadyFrameFormResponse" ADD CONSTRAINT "ReadyFrameFormResponse_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ReadyFrameSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReadyFrameFormResponse" ADD CONSTRAINT "ReadyFrameFormResponse_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

### D. Environment Variables

```bash
# .env.local

# ReadyFrame Form Configuration
READYFRAME_FORM_BASE_URL=https://forms.office.com/Pages/ResponsePage.aspx?id=...
READYFRAME_WEBHOOK_SECRET=your-webhook-secret-here

# Email Configuration (for sending form links)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=noreply@yourcompany.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=MindFlow Platform <noreply@yourcompany.com>

# QR Code Storage
QR_CODE_STORAGE_PATH=/public/qr-codes
QR_CODE_PUBLIC_URL=https://yourdomain.com/qr-codes

# Analytics
ANALYTICS_ENABLED=true

# Redis Cache (optional)
REDIS_URL=redis://localhost:6379
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-14 | Initial documentation |

---

## Contact & Support

For questions or issues with this integration:

- **Developer Documentation**: [Internal Wiki Link]
- **Support Email**: support@yourcompany.com
- **Slack Channel**: #mindflow-support

---

**End of Documentation**
