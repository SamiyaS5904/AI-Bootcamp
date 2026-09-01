import type { FitType, StyleAssistantAnswers } from '@/types/models'

/**
 * The Style Assistant's question set — CLAUDE.md §5.6.
 *
 * Declared as data rather than hardcoded JSX so the flow, the progress
 * indicator and the "refine one answer" affordance all read from one place. §5.6
 * is explicit that this is a guided flow with fixed choices, not a freeform
 * chat box.
 */

export type StepId = 'category' | 'occasion' | 'fit' | 'size' | 'budget'

export const STEP_ORDER: StepId[] = ['category', 'occasion', 'fit', 'size', 'budget']

export type Occasion = StyleAssistantAnswers['occasion']

export type Choice<T> = {
  value: T
  label: string
  /** Short clarifier shown under the label — keeps the choice unambiguous. */
  hint: string
}

/** null = "Not sure — surprise me" (§5.6 question 1). */
export const CATEGORY_CHOICES: Choice<string | null>[] = [
  { value: 'shirts', label: 'A shirt', hint: 'Oxfords, poplin, linen' },
  { value: 'knitwear', label: 'Knitwear', hint: 'Crew necks, polos, cardigans' },
  { value: 'trousers', label: 'Trousers', hint: 'Chinos, pleated, tapered' },
  { value: null, label: 'Not sure', hint: 'Show me what fits the occasion' },
]

export const OCCASION_CHOICES: Choice<Occasion>[] = [
  { value: 'everyday', label: 'Everyday', hint: 'Comfortable, worn often' },
  { value: 'office', label: 'Office', hint: 'Smart, holds its shape' },
  { value: 'evening', label: 'Evening out', hint: 'A little sharper' },
  { value: 'layering', label: 'Layering piece', hint: 'Works over or under' },
]

export const FIT_CHOICES: Choice<FitType>[] = [
  { value: 'slim', label: 'Slim', hint: 'Close to the body' },
  { value: 'regular', label: 'Regular', hint: 'Straight, not tight' },
  { value: 'relaxed', label: 'Relaxed', hint: 'Room through the body' },
]

export const STEP_TITLES: Record<StepId, string> = {
  category: 'What are you shopping for?',
  occasion: "What's the occasion?",
  fit: 'How do you like things to fit?',
  size: 'Do you know your size?',
  budget: "What's your budget?",
}

/** Budget bands, in whole rupees. null = skipped (§5.6 makes budget optional). */
export const BUDGET_CHOICES: Choice<number | null>[] = [
  { value: 2500, label: 'Under ₹2,500', hint: 'Everyday basics' },
  { value: 3500, label: 'Under ₹3,500', hint: 'A step up in fabric' },
  { value: 5000, label: 'Under ₹5,000', hint: 'The full range' },
  { value: null, label: 'No preference', hint: 'Show me everything' },
]

export type PartialAnswers = Partial<StyleAssistantAnswers>

/** True once every required answer is present and the flow can be submitted. */
export function isComplete(answers: PartialAnswers): answers is StyleAssistantAnswers {
  return (
    'category' in answers &&
    'occasion' in answers &&
    'fit' in answers &&
    'size' in answers &&
    'budgetMax' in answers
  )
}

/** A short human summary of an answer, for the "refine" chips on the results screen. */
export function describeAnswer(step: StepId, answers: PartialAnswers): string {
  switch (step) {
    case 'category': {
      if (!('category' in answers)) return '—'
      const choice = CATEGORY_CHOICES.find((c) => c.value === answers.category)
      return choice?.label ?? '—'
    }
    case 'occasion':
      return OCCASION_CHOICES.find((c) => c.value === answers.occasion)?.label ?? '—'
    case 'fit':
      return FIT_CHOICES.find((c) => c.value === answers.fit)?.label ?? '—'
    case 'size':
      return answers.size ?? 'Not sure'
    case 'budget': {
      if (!('budgetMax' in answers)) return '—'
      return BUDGET_CHOICES.find((c) => c.value === answers.budgetMax)?.label ?? 'No preference'
    }
  }
}
