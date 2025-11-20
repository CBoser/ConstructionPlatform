// Temporary type declarations for Prisma Client
// This file provides type stubs while Prisma Client generation is failing
// TODO: Remove this file once Prisma Client can be properly generated

declare module '@prisma/client' {
  // Re-export everything from the generated client
  export * from '.prisma/client';

  // Enums
  export enum UserRole {
    ADMIN = 'ADMIN',
    ESTIMATOR = 'ESTIMATOR',
    PROJECT_MANAGER = 'PROJECT_MANAGER',
    FIELD_USER = 'FIELD_USER',
    VIEWER = 'VIEWER'
  }

  export enum CustomerType {
    PRODUCTION = 'PRODUCTION',
    SEMI_CUSTOM = 'SEMI_CUSTOM',
    FULL_CUSTOM = 'FULL_CUSTOM'
  }

  export enum PlanType {
    PRODUCTION = 'PRODUCTION',
    SEMI_CUSTOM = 'SEMI_CUSTOM',
    FULL_CUSTOM = 'FULL_CUSTOM'
  }

  export enum MaterialCategory {
    FRAMING = 'FRAMING',
    DRYWALL = 'DRYWALL',
    INSULATION = 'INSULATION',
    ROOFING = 'ROOFING',
    SIDING = 'SIDING',
    FLOORING = 'FLOORING',
    CONCRETE = 'CONCRETE',
    HARDWARE = 'HARDWARE',
    OTHER = 'OTHER'
  }

  export enum LotStatus {
    AVAILABLE = 'AVAILABLE',
    RESERVED = 'RESERVED',
    UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
    COMPLETED = 'COMPLETED',
    SOLD = 'SOLD'
  }

  export enum JobStatus {
    PLANNING = 'PLANNING',
    ACTIVE = 'ACTIVE',
    ON_HOLD = 'ON_HOLD',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }

  export enum TakeoffStatus {
    DRAFT = 'DRAFT',
    IN_REVIEW = 'IN_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
  }

  export enum OptionCategory {
    DECK = 'DECK',
    FENCING = 'FENCING',
    ROOM_ADDITION = 'ROOM_ADDITION',
    GARAGE = 'GARAGE',
    OTHER = 'OTHER'
  }

  // Models
  export interface User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Customer {
    id: string;
    customerName: string;
    customerType: CustomerType;
    pricingTier: string | null;
    primaryContactId: string | null;
    isActive: boolean;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface CustomerContact {
    id: string;
    customerId: string;
    contactName: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    isPrimary: boolean;
    receivesNotifications: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface CustomerPricingTier {
    id: string;
    customerId: string;
    tierName: string;
    discountPercent: any; // Decimal
    effectiveDate: Date;
    expirationDate: Date | null;
    isActive: boolean;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface CustomerExternalId {
    id: string;
    customerId: string;
    externalSystem: string;
    externalId: string;
    metadata: any; // JSON
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Material {
    id: string;
    sku: string;
    name: string;
    category: MaterialCategory;
    unit: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface MaterialPricing {
    id: string;
    materialId: string;
    vendorId: string;
    price: any; // Decimal
    effectiveDate: Date;
    expirationDate: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Plan {
    id: string;
    code: string;
    name: string | null;
    type: PlanType;
    sqft: number | null;
    bedrooms: number | null;
    bathrooms: any | null; // Decimal
    garage: string | null;
    style: string | null;
    version: number;
    isActive: boolean;
    pdssUrl: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  // Prisma error classes
  export class PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: Record<string, any>;
    constructor(message: string, options: { code: string; clientVersion: string; meta?: any });
  }

  export class PrismaClientUnknownRequestError extends Error {
    constructor(message: string, options: { clientVersion: string });
  }

  export class PrismaClientRustPanicError extends Error {
    constructor(message: string, options: { clientVersion: string });
  }

  export class PrismaClientInitializationError extends Error {
    constructor(message: string, options: { clientVersion: string });
  }

  export class PrismaClientValidationError extends Error {
    constructor(message: string);
  }

  // Prisma namespace
  export namespace Prisma {
    export type CustomerWhereInput = any;
    export type CustomerCreateInput = any;
    export type CustomerUpdateInput = any;
    export type CustomerInclude = any;
    export type CustomerSelect = any;

    export type PlanWhereInput = any;
    export type PlanCreateInput = any;
    export type PlanUncheckedCreateInput = any;
    export type PlanInclude<T = any> = any;
    export type PlanSelect<T = any> = any;
    export type PlanCountOutputTypeSelect<T = any> = any;

    export type MaterialWhereInput = any;
    export type MaterialOrderByWithRelationInput = any;
    export type MaterialPricingWhereInput = any;

    // Prisma error classes (also available as exports)
    export { PrismaClientKnownRequestError };
    export { PrismaClientUnknownRequestError };
    export { PrismaClientRustPanicError };
    export { PrismaClientInitializationError };
    export { PrismaClientValidationError };
  }

  export interface PrismaClientOptions {
    datasources?: any;
    log?: Array<'query' | 'info' | 'warn' | 'error'>;
    errorFormat?: 'pretty' | 'colorless' | 'minimal';
  }

  export interface PlanTemplateItem {
    id: string;
    planId: string;
    materialId: string;
    quantity: any; // Decimal
    unit: string;
    wasteFactor: any; // Decimal
    category: string;
    subcategory: string | null;
    averageVariance: any | null; // Decimal
    varianceCount: number;
    lastVarianceDate: Date | null;
    confidenceScore: any | null; // Decimal
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  export class PrismaClient {
    constructor(options?: PrismaClientOptions);

    user: any;
    customer: any;
    customerContact: any;
    customerPricingTier: any;
    customerExternalId: any;
    customerPricing: any;
    material: any;
    materialPricing: any;
    plan: any;
    planTemplateItem: any;
    job: any;
    lot: any;
    community: any;
    vendor: any;
    supplier: any;

    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T>;
    $queryRaw<T = unknown>(query: TemplateStringsArray | string, ...values: any[]): Promise<T>;
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Promise<T>;
    $executeRaw(query: TemplateStringsArray | string, ...values: any[]): Promise<number>;
    $executeRawUnsafe(query: string, ...values: any[]): Promise<number>;
  }
}
