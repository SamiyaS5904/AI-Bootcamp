import { primaryMeasurement, sizeChartForCategory } from '@/data/sizeChart'
import type { FitType } from '@/types/models'

/**
 * Size Finder logic — CLAUDE.md §5.7.
 *
 * Maps a customer's own measurement (or their usual size in a reference brand)
 * onto the real Saints Crew size chart. Deliberately transparent arithmetic
 * rather than a model call: the customer is told exactly which numbers produced
 * the answer, and the same input always gives the same result.
 */

export type SizeFinderAnswers = {
  categorySlug: string
  /** Chest (tops) or waist (trousers) in inches, if the customer measured. */
  measurementIn: number | null
  /** Their usual size in another brand, if they would rather not measure. */
  usualSize: string | null
  fit: FitType
}

export type SizeRecommendation = {
  size: string
  /** Plain-language explanation built from the actual numbers used. */
  rationale: string
  /** The adjacent size, when the customer sits between two. */
  alternative: { size: string; note: string } | null
}

/**
 * How fit preference moves the recommendation, in size steps.
 *
 * The chart lists the body measurement each size is cut for — the garment's own
 * ease is already built into the pattern. So the arithmetic is "find your size,
 * then step for preference", NOT "add inches of ease and re-match". Adding ease
 * on top double-counts it and pushes everyone a size too large: a 40" chest came
 * out as XL, which is plainly wrong.
 *
 * Keeping this as size steps also makes both paths below consistent — measuring
 * and quoting your usual size land on the same answer.
 */
const STEP_BY_FIT: Record<FitType, number> = {
  slim: -1,
  regular: 0,
  relaxed: 1,
}

export function recommendSize(answers: SizeFinderAnswers): SizeRecommendation | null {
  const chart = sizeChartForCategory(answers.categorySlug)
  if (chart.length === 0) return null

  const key = primaryMeasurement(answers.categorySlug)
  const label = key === 'waist_in' ? 'waist' : 'chest'

  // Path 1 — a real measurement. Nearest size, then step for fit preference.
  if (answers.measurementIn !== null) {
    const measurement = answers.measurementIn

    // Nearest chart value to the body measurement.
    let baseIndex = 0
    let smallestGap = Number.POSITIVE_INFINITY
    chart.forEach((entry, index) => {
      const gap = Math.abs((entry.measurements[key] ?? 0) - measurement)
      if (gap < smallestGap) {
        smallestGap = gap
        baseIndex = index
      }
    })

    const base = chart[baseIndex]
    if (!base) return null

    const step = STEP_BY_FIT[answers.fit]
    const index = Math.min(chart.length - 1, Math.max(0, baseIndex + step))
    const match = chart[index]
    if (!match) return null

    const stepNote =
      step === 0
        ? `a regular fit is true to size`
        : step > 0
          ? `a relaxed fit means one size up from your ${base.size_label}`
          : `a slim fit means one size down from your ${base.size_label}`

    // Offer the true-to-size option whenever fit preference moved us off it.
    const alternative =
      match.size_label === base.size_label
        ? null
        : {
            size: base.size_label,
            note: `True to your measurement, at ${base.measurements[key]} inch ${label}.`,
          }

    return {
      size: match.size_label,
      rationale: `A ${measurement} inch ${label} puts you in our ${base.size_label}, and ${stepNote}. Our ${match.size_label} is cut for a ${match.measurements[key]} inch ${label}.`,
      alternative,
    }
  }

  // Path 2 — their usual size elsewhere. Shift by fit preference, which is the
  // honest limit of what can be inferred without that brand's grading.
  if (answers.usualSize) {
    const startIndex = chart.findIndex((entry) => entry.size_label === answers.usualSize)
    if (startIndex === -1) return null

    const shift = STEP_BY_FIT[answers.fit]
    const index = Math.min(chart.length - 1, Math.max(0, startIndex + shift))
    const match = chart[index]
    if (!match) return null

    const shiftNote =
      shift === 0
        ? 'a regular fit matches your usual size'
        : shift > 0
          ? 'a relaxed fit means going one size up'
          : 'a slim fit means going one size down'

    return {
      size: match.size_label,
      rationale: `You usually wear ${answers.usualSize}, and ${shiftNote}. Our ${match.size_label} measures ${match.measurements[key]} inches ${label}. Sizing varies between brands, so check that against a garment you already own.`,
      alternative:
        shift === 0
          ? null
          : {
              size: answers.usualSize,
              note: 'Your usual size, if you would rather not change.',
            },
    }
  }

  return null
}
