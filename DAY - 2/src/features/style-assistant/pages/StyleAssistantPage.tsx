import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react'
import { allSizes } from '@/data/catalog'
import {
  BUDGET_CHOICES,
  CATEGORY_CHOICES,
  FIT_CHOICES,
  OCCASION_CHOICES,
  STEP_ORDER,
  STEP_TITLES,
  describeAnswer,
  type PartialAnswers,
  type StepId,
} from '@/features/style-assistant/lib/flow'
import { diagnoseEmptyResult, recommendProducts } from '@/features/style-assistant/lib/recommend'
import { ProductCard } from '@/features/shop/components/ProductCard'
import { Seo } from '@/components/common/Seo'
import { philosophyImage } from '@/data/editorial'
import { Button } from '@/components/ui/button'
import { routes } from '@/config/routes'
import { cn } from '@/lib/utils'
import type { StyleAssistantAnswers } from '@/types/models'

/**
 * Style Assistant — CLAUDE.md §5.6.
 *
 * A guided five-step flow with fixed choices, not a freeform chat box. On
 * submit it produces 3–5 real products with a one-line reason each. Any answer
 * can be revised from the results screen without redoing the whole flow.
 *
 * PHASE 1: matching runs client-side (see `lib/recommend.ts`). The Anthropic
 * Edge Function was deferred; the results screen contract won't change when it
 * lands.
 */
export function StyleAssistantPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<PartialAnswers>({})
  const [submitted, setSubmitted] = useState(false)

  const step = STEP_ORDER[stepIndex]

  const recommendations = useMemo(
    () => (submitted ? recommendProducts(answers as StyleAssistantAnswers) : []),
    [submitted, answers],
  )

  const answer = <K extends keyof StyleAssistantAnswers>(
    key: K,
    value: StyleAssistantAnswers[K],
  ) => {
    const next = { ...answers, [key]: value }
    setAnswers(next)

    if (stepIndex === STEP_ORDER.length - 1) setSubmitted(true)
    else setStepIndex(stepIndex + 1)
  }

  const restart = () => {
    setAnswers({})
    setStepIndex(0)
    setSubmitted(false)
  }

  /** Jump back to one question, keeping every other answer (§5.6). */
  const refine = (target: StepId) => {
    setSubmitted(false)
    setStepIndex(STEP_ORDER.indexOf(target))
  }

  return (
    <>
      <Seo
        title="Style Assistant"
        description="Answer five questions and get specific Saints Crew pieces, with a plain-language reason for each."
      />

      <div className="container-page py-14 md:py-20">
        {/* While answering, the flow sits beside a full-height image so the
            page reads as part of the store rather than a bare form floating in
            white space. Once results exist, the layout goes full width to give
            the products room. */}
        <div
          className={cn(submitted ? 'mx-auto max-w-5xl' : 'grid gap-12 lg:grid-cols-12 lg:gap-20')}
        >
          {!submitted && (
            <div className="hidden lg:col-span-5 lg:block">
              <div className="bg-bone-sunk sticky top-28 aspect-3/4 overflow-hidden">
                <img
                  src={philosophyImage.url}
                  alt={philosophyImage.alt}
                  className="size-full object-cover"
                />
              </div>
            </div>
          )}

          <div className={cn(!submitted && 'lg:col-span-6 lg:col-start-7')}>
            <div className="flex items-center gap-2.5">
              <Sparkles className="text-clay size-4" strokeWidth={1.5} aria-hidden />
              <p className="eyebrow text-clay">Find your fit</p>
            </div>

            {!submitted ? (
              <>
                <h1 className="text-display mt-5">{STEP_TITLES[step ?? 'category']}</h1>

                {/* Progress */}
                <div className="mt-8 flex items-center gap-2" aria-hidden>
                  {STEP_ORDER.map((id, index) => (
                    <div
                      key={id}
                      className={cn(
                        'h-0.5 flex-1 rounded-full transition-colors',
                        index <= stepIndex ? 'bg-clay' : 'bg-bone-sunk',
                      )}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mt-3 text-xs">
                  Question {stepIndex + 1} of {STEP_ORDER.length}
                </p>

                <div className="mt-10">
                  {step === 'category' && (
                    <OptionGrid
                      choices={CATEGORY_CHOICES}
                      onPick={(value) => answer('category', value)}
                    />
                  )}
                  {step === 'occasion' && (
                    <OptionGrid
                      choices={OCCASION_CHOICES}
                      onPick={(value) => answer('occasion', value)}
                    />
                  )}
                  {step === 'fit' && (
                    <OptionGrid choices={FIT_CHOICES} onPick={(value) => answer('fit', value)} />
                  )}
                  {step === 'size' && <SizeStep onPick={(value) => answer('size', value)} />}
                  {step === 'budget' && (
                    <OptionGrid
                      choices={BUDGET_CHOICES}
                      onPick={(value) => answer('budgetMax', value)}
                    />
                  )}
                </div>

                {stepIndex > 0 && (
                  <Button
                    variant="link"
                    className="text-muted-foreground mt-10"
                    onClick={() => setStepIndex(stepIndex - 1)}
                  >
                    <ArrowLeft className="mr-1.5 size-3.5" strokeWidth={1.5} />
                    Back
                  </Button>
                )}
              </>
            ) : (
              <>
                <h1 className="text-display mt-5">
                  {recommendations.length > 0
                    ? 'Here is what we would pick'
                    : 'Nothing matches yet'}
                </h1>

                {/* Refine chips — change one answer without starting over. */}
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  {STEP_ORDER.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => refine(id)}
                      className="border-border hover:border-clay rounded-sm border px-3 py-1.5 text-xs transition-colors"
                    >
                      <span className="text-muted-foreground">{labelForStep(id)}: </span>
                      {describeAnswer(id, answers)}
                    </button>
                  ))}
                  <Button variant="link" className="text-muted-foreground ml-1" onClick={restart}>
                    <RotateCcw className="mr-1.5 size-3.5" strokeWidth={1.5} />
                    Start over
                  </Button>
                </div>

                {recommendations.length === 0 ? (
                  <div className="border-border mt-12 rounded-md border border-dashed px-6 py-16 text-center">
                    <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed">
                      {diagnoseEmptyResult(answers as StyleAssistantAnswers)} Try relaxing one
                      answer above, or browse the full collection.
                    </p>
                    <Button asChild variant="outline" className="mt-8">
                      <Link to={routes.shop}>Browse everything</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8">
                    {recommendations.map(({ product, reason }) => (
                      <div key={product.id}>
                        <ProductCard product={product} />
                        {/* The one-line reason §5.6 requires, sat under the card. */}
                        <p className="text-muted-foreground border-clay mt-3 border-l-2 pl-3 text-xs leading-relaxed">
                          {reason}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function labelForStep(id: StepId) {
  const labels: Record<StepId, string> = {
    category: 'Looking for',
    occasion: 'Occasion',
    fit: 'Fit',
    size: 'Size',
    budget: 'Budget',
  }
  return labels[id]
}

function OptionGrid<T>({
  choices,
  onPick,
}: {
  choices: Array<{ value: T; label: string; hint: string }>
  onPick: (value: T) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {choices.map((choice) => (
        <button
          key={choice.label}
          type="button"
          onClick={() => onPick(choice.value)}
          className="border-border hover:border-clay group rounded-md border px-5 py-5 text-left transition-colors"
        >
          <span className="group-hover:text-clay block text-base transition-colors">
            {choice.label}
          </span>
          <span className="text-muted-foreground mt-1.5 block text-xs">{choice.hint}</span>
        </button>
      ))}
    </div>
  )
}

/**
 * Size step — CLAUDE.md §5.6 question 4, including the "I don't know" branch
 * that routes into the Size Finder (§5.7).
 */
function SizeStep({ onPick }: { onPick: (size: string | null) => void }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {allSizes().map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onPick(size)}
            className="border-border hover:border-clay min-w-14 rounded-sm border px-4 py-2.5 text-sm transition-colors"
          >
            {size}
          </button>
        ))}
      </div>

      <div className="border-border mt-8 rounded-md border border-dashed p-5">
        <p className="text-sm leading-relaxed">Not sure of your size?</p>
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
          The Size Finder asks for one measurement, or your usual size in another brand, and maps it
          onto our actual size chart.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to={routes.sizeGuide}>Open the Size Finder</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onPick(null)}>
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  )
}
