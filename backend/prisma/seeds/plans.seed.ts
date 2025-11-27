/**
 * Plan Seed Data
 *
 * Seeds test plans with elevations typical for production builders:
 * - Single-story and two-story floor plans
 * - Various square footages and configurations
 * - Multiple elevation options (Craftsman, Modern, Traditional)
 */

import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

interface PlanSeed {
  code: string;
  name: string;
  type: PlanType;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  garage: string;
  style: string;
  notes?: string;
  elevations: Array<{
    code: string;
    name: string;
    description?: string;
  }>;
}

const PLANS: PlanSeed[] = [
  // Single-Story Plans
  {
    code: '1850',
    name: 'The Willow',
    type: PlanType.SINGLE_STORY,
    sqft: 1850,
    bedrooms: 3,
    bathrooms: 2,
    garage: '2-Car',
    style: 'Ranch',
    notes: 'Popular entry-level single-story. Open floor plan with great room concept.',
    elevations: [
      { code: 'A', name: 'Craftsman', description: 'Stone accents, covered porch' },
      { code: 'B', name: 'Traditional', description: 'Brick facade, shutters' },
      { code: 'C', name: 'Modern', description: 'Clean lines, mixed materials' },
    ],
  },
  {
    code: '2200',
    name: 'The Cedar',
    type: PlanType.SINGLE_STORY,
    sqft: 2200,
    bedrooms: 4,
    bathrooms: 2.5,
    garage: '3-Car',
    style: 'Ranch',
    notes: 'Expanded ranch with split bedroom layout and bonus room option.',
    elevations: [
      { code: 'A', name: 'Craftsman', description: 'Tapered columns, exposed beams' },
      { code: 'B', name: 'Prairie', description: 'Horizontal lines, wide overhangs' },
      { code: 'C', name: 'Contemporary', description: 'Flat roof elements, large windows' },
    ],
  },
  {
    code: '2400',
    name: 'The Maple',
    type: PlanType.SINGLE_STORY,
    sqft: 2400,
    bedrooms: 4,
    bathrooms: 3,
    garage: '3-Car',
    style: 'Ranch',
    notes: 'Premium single-story with luxury master suite and covered outdoor living.',
    elevations: [
      { code: 'A', name: 'Craftsman', description: 'Full stone front, timber accents' },
      { code: 'B', name: 'Tuscan', description: 'Stucco, tile roof accents' },
      { code: 'C', name: 'Modern Farmhouse', description: 'Board and batten, metal roof' },
      { code: 'D', name: 'French Country', description: 'Brick, arched windows' },
    ],
  },
  // Two-Story Plans
  {
    code: '2650',
    name: 'The Aspen',
    type: PlanType.TWO_STORY,
    sqft: 2650,
    bedrooms: 4,
    bathrooms: 2.5,
    garage: '2-Car',
    style: 'Traditional',
    notes: 'Classic two-story with formal living/dining and upstairs bedrooms.',
    elevations: [
      { code: 'A', name: 'Colonial', description: 'Symmetrical facade, center entry' },
      { code: 'B', name: 'Craftsman', description: 'Mixed siding, tapered columns' },
      { code: 'C', name: 'Traditional', description: 'Brick front, hip roof' },
    ],
  },
  {
    code: '3100',
    name: 'The Birch',
    type: PlanType.TWO_STORY,
    sqft: 3100,
    bedrooms: 5,
    bathrooms: 3.5,
    garage: '3-Car',
    style: 'Traditional',
    notes: 'Popular family home with flex room and walk-in pantry.',
    elevations: [
      { code: 'A', name: 'Craftsman', description: 'Stone/siding mix, covered porch' },
      { code: 'B', name: 'Modern', description: 'Flat roof accents, stucco' },
      { code: 'C', name: 'French Country', description: 'Brick, dormers' },
      { code: 'D', name: 'Farmhouse', description: 'Metal roof, wrap porch' },
    ],
  },
  {
    code: '3500',
    name: 'The Oak',
    type: PlanType.TWO_STORY,
    sqft: 3500,
    bedrooms: 5,
    bathrooms: 4,
    garage: '3-Car',
    style: 'Estate',
    notes: 'Premium two-story with main floor master suite option.',
    elevations: [
      { code: 'A', name: 'Estate Craftsman', description: 'Full stone, timber beams' },
      { code: 'B', name: 'Mediterranean', description: 'Tile roof, arched entries' },
      { code: 'C', name: 'Contemporary', description: 'Mixed rooflines, large glass' },
    ],
  },
  // Townhome Plans
  {
    code: 'TH1400',
    name: 'The Spruce',
    type: PlanType.TOWNHOME,
    sqft: 1400,
    bedrooms: 2,
    bathrooms: 2.5,
    garage: '1-Car',
    style: 'Urban',
    notes: 'End-unit townhome design with attached single-car garage.',
    elevations: [
      { code: 'A', name: 'Modern', description: 'Clean lines, large windows' },
      { code: 'B', name: 'Traditional', description: 'Brick accents, classic style' },
    ],
  },
  {
    code: 'TH1650',
    name: 'The Pine',
    type: PlanType.TOWNHOME,
    sqft: 1650,
    bedrooms: 3,
    bathrooms: 2.5,
    garage: '2-Car',
    style: 'Urban',
    notes: 'Three-story townhome with rooftop deck option.',
    elevations: [
      { code: 'A', name: 'Contemporary', description: 'Mixed materials, flat roof' },
      { code: 'B', name: 'Craftsman', description: 'Shingle siding, covered entry' },
    ],
  },
  // Duplex Plans
  {
    code: 'DPX2800',
    name: 'The Twin Oaks',
    type: PlanType.DUPLEX,
    sqft: 2800,
    bedrooms: 6,
    bathrooms: 4,
    garage: '2-Car',
    style: 'Traditional',
    notes: 'Side-by-side duplex, 1400 sqft per unit. Popular for rental properties.',
    elevations: [
      { code: 'A', name: 'Craftsman', description: 'Mirrored design, shared porch' },
      { code: 'B', name: 'Modern', description: 'Clean lines, individual entries' },
    ],
  },
];

export async function seedPlans() {
  console.log('🌱 Seeding plans...');

  const createdPlans: Array<{ plan: any; elevations: any[] }> = [];

  for (const planData of PLANS) {
    console.log(`  Creating plan ${planData.code} - ${planData.name}...`);

    // Create or update plan
    const plan = await prisma.plan.upsert({
      where: { code: planData.code },
      update: {
        name: planData.name,
        type: planData.type,
        sqft: planData.sqft,
        bedrooms: planData.bedrooms,
        bathrooms: planData.bathrooms,
        garage: planData.garage,
        style: planData.style,
        notes: planData.notes,
        isActive: true,
      },
      create: {
        code: planData.code,
        name: planData.name,
        type: planData.type,
        sqft: planData.sqft,
        bedrooms: planData.bedrooms,
        bathrooms: planData.bathrooms,
        garage: planData.garage,
        style: planData.style,
        notes: planData.notes,
        isActive: true,
      },
    });

    // Create elevations
    const createdElevations = [];
    for (const elevData of planData.elevations) {
      const elevation = await prisma.planElevation.upsert({
        where: {
          planId_code: {
            planId: plan.id,
            code: elevData.code,
          },
        },
        update: {
          name: elevData.name,
          description: elevData.description,
        },
        create: {
          planId: plan.id,
          code: elevData.code,
          name: elevData.name,
          description: elevData.description,
        },
      });
      createdElevations.push(elevation);
    }

    createdPlans.push({ plan, elevations: createdElevations });
  }

  console.log('✅ Plans seeded successfully');
  console.log(`  - Total plans: ${createdPlans.length}`);
  console.log(
    `  - Total elevations: ${createdPlans.reduce((sum, p) => sum + p.elevations.length, 0)}`
  );

  return createdPlans;
}

export default seedPlans;
