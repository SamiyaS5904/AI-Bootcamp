import { categories } from '@/data/catalog'
import type { SizeChartEntry } from '@/types/models'

/**
 * Stands in for the `size_chart` table (CLAUDE.md §5.7).
 *
 * These are standard Indian menswear grading figures in inches — reasonable
 * working values, NOT Saints Crew's measured garments. A wrong size chart is
 * worse than no size chart, so these must be replaced with real measurements
 * before launch. §5.7 requires them to live in the database precisely so that
 * correction needs no redeploy.
 */

const TOP_GRADING: Array<{ size: string; measurements: Record<string, number> }> = [
  { size: 'XS', measurements: { chest_in: 36, length_in: 26, shoulder_in: 16.5 } },
  { size: 'S', measurements: { chest_in: 38, length_in: 27, shoulder_in: 17 } },
  { size: 'M', measurements: { chest_in: 40, length_in: 28, shoulder_in: 17.5 } },
  { size: 'L', measurements: { chest_in: 42, length_in: 29, shoulder_in: 18 } },
  { size: 'XL', measurements: { chest_in: 44, length_in: 30, shoulder_in: 18.5 } },
  { size: 'XXL', measurements: { chest_in: 46, length_in: 31, shoulder_in: 19 } },
]

const WAIST_GRADING: Array<{ size: string; measurements: Record<string, number> }> = [
  { size: '28', measurements: { waist_in: 28, inseam_in: 30, hip_in: 36 } },
  { size: '30', measurements: { waist_in: 30, inseam_in: 30, hip_in: 38 } },
  { size: '32', measurements: { waist_in: 32, inseam_in: 31, hip_in: 40 } },
  { size: '34', measurements: { waist_in: 34, inseam_in: 31, hip_in: 42 } },
  { size: '36', measurements: { waist_in: 36, inseam_in: 32, hip_in: 44 } },
  { size: '38', measurements: { waist_in: 38, inseam_in: 32, hip_in: 46 } },
]

export const sizeChart: SizeChartEntry[] = categories.flatMap((category) => {
  const grading = category.slug === 'trousers' ? WAIST_GRADING : TOP_GRADING
  return grading.map((row, index) => ({
    id: `${category.slug}-${row.size}`,
    category_id: category.id,
    size_label: row.size,
    measurements: row.measurements,
    position: index,
  }))
})

export function sizeChartForCategory(categorySlug: string): SizeChartEntry[] {
  const category = categories.find((c) => c.slug === categorySlug)
  if (!category) return []
  return sizeChart
    .filter((entry) => entry.category_id === category.id)
    .sort((a, b) => a.position - b.position)
}

/** Which measurement a category is primarily graded on. */
export function primaryMeasurement(categorySlug: string) {
  return categorySlug === 'trousers' ? 'waist_in' : 'chest_in'
}

/** Column keys present for a category, in a stable display order. */
export function measurementKeys(categorySlug: string): string[] {
  const rows = sizeChartForCategory(categorySlug)
  const first = rows[0]
  if (!first) return []
  const preferred = ['chest_in', 'waist_in', 'hip_in', 'length_in', 'inseam_in', 'shoulder_in']
  const present = Object.keys(first.measurements)
  return preferred.filter((key) => present.includes(key))
}

/** Human label for a measurement key. */
export function measurementLabel(key: string) {
  const labels: Record<string, string> = {
    chest_in: 'Chest',
    waist_in: 'Waist',
    hip_in: 'Hip',
    length_in: 'Length',
    inseam_in: 'Inseam',
    shoulder_in: 'Shoulder',
  }
  return labels[key] ?? key
}
