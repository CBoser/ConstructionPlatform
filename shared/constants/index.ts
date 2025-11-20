// Shared constants

export const JOB_STATUS = {
  DRAFT: 'draft',
  ESTIMATED: 'estimated',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  ESTIMATOR: 'estimator',
  PROJECT_MANAGER: 'pm',
  FIELD_USER: 'field',
  READ_ONLY: 'readonly',
} as const;

export const PO_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  SENT: 'sent',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const CUSTOMER_TIERS = {
  TIER_1: 'tier1',
  TIER_2: 'tier2',
  VOLUME: 'volume',
} as const;

export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type POStatus = typeof PO_STATUS[keyof typeof PO_STATUS];
export type CustomerTier = typeof CUSTOMER_TIERS[keyof typeof CUSTOMER_TIERS];
