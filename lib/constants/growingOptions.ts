/**
 * Growing Options Constants
 * Centralized dropdown options for grow log forms
 */

export const GROWTH_STAGES = [
  'Inoculation',
  'Colonization',
  'Fruiting',
  'Harvest'
] as const

export const STRAINS = [
  'Blue Oyster',
  'Golden Oyster',
  'Pink Oyster',
  'King Oyster',
  'Phoenix Oyster',
  'Shiitake',
  "Lion's Mane",
  'Reishi',
  'Maitake',
  'Enoki',
  'Chestnut',
  'Wine Cap',
  'Turkey Tail',
  'Button/Portobello',
  'Nameko',
  'Pioppino',
  'Other'
] as const

export const SUBSTRATES = [
  'Coco Coir',
  'Coco+Verm',
  'CVG',
  'Manure-based',
  'Straw',
  'Hardwood',
  "Master's Mix",
  'BRF',
  'Rye Grain',
  'Wild Bird Seed',
  "Uncle Ben's",
  'Popcorn',
  'Other'
] as const

export const INOCULATION_METHODS = [
  'Liquid Culture',
  'Spore Syringe',
  'Agar Transfer',
  'G2G',
  'Spore Print',
  'Clone',
  'Sawdust Spawn',
  'Other'
] as const

export const GROWING_METHODS = [
  'Monotub',
  'SGFC',
  'Fruiting Bag',
  'Martha Tent',
  'Shoebox',
  'Hydroponics',
  'Open Air',
  'Other'
] as const

export const TEK_METHODS = [
  'PF Tek',
  "Uncle Ben's",
  'G2G',
  'Agar',
  'Liquid Culture',
  'Shoebox',
  'Broke Boi',
  'BRF Cakes',
  'Bulk Substrate',
  'Monotub Tek',
  'Other'
] as const

// Type exports for TypeScript
export type GrowthStage = typeof GROWTH_STAGES[number]
export type Strain = typeof STRAINS[number]
export type Substrate = typeof SUBSTRATES[number]
export type InoculationMethod = typeof INOCULATION_METHODS[number]
export type GrowingMethod = typeof GROWING_METHODS[number]
export type TekMethod = typeof TEK_METHODS[number]

