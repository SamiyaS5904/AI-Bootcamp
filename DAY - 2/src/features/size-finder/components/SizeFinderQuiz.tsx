import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '@/data/catalog'
import { primaryMeasurement, sizeChartForCategory } from '@/data/sizeChart'
import { recommendSize, type SizeRecommendation } from '@/features/size-finder/lib/recommendSize'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { routes } from '@/config/routes'
import { cn } from '@/lib/utils'
import { FIT_TYPES, type FitType } from '@/types/models'

/**
 * Size Finder — CLAUDE.md §5.7.
 *
 * Two ways in: measure, or give your usual size elsewhere. Both map onto the
 * real size chart and explain the arithmetic, so the answer is checkable rather
 * than a black box.
 */
export function SizeFinderQuiz() {
  const [categorySlug, setCategorySlug] = useState('shirts')
  const [mode, setMode] = useState<'measure' | 'usual'>('measure')
  const [measurement, setMeasurement] = useState('')
  const [usualSize, setUsualSize] = useState('')
  const [fit, setFit] = useState<FitType>('regular')
  const [result, setResult] = useState<SizeRecommendation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const chart = sizeChartForCategory(categorySlug)
  const measurementKey = primaryMeasurement(categorySlug)
  const measurementLabel = measurementKey === 'waist_in' ? 'waist' : 'chest'

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (mode === 'measure') {
      const value = Number(measurement)
      if (!Number.isFinite(value) || value < 24 || value > 60) {
        setError(`Enter your ${measurementLabel} in inches, somewhere between 24 and 60.`)
        setResult(null)
        return
      }
      setResult(recommendSize({ categorySlug, measurementIn: value, usualSize: null, fit }))
      return
    }

    if (!usualSize) {
      setError('Pick the size you usually wear.')
      setResult(null)
      return
    }
    setResult(recommendSize({ categorySlug, measurementIn: null, usualSize, fit }))
  }

  return (
    <div className="border-border rounded-md border p-6 md:p-8">
      <h2 className="font-display text-2xl">Size Finder</h2>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        One measurement, or your usual size in another brand. We map it onto the chart above and
        show you the working, so you can check it yourself.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-7">
        <Group label="What are you buying?">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Chip
                key={category.slug}
                active={categorySlug === category.slug}
                onClick={() => {
                  setCategorySlug(category.slug)
                  setResult(null)
                  setUsualSize('')
                }}
              >
                {category.name}
              </Chip>
            ))}
          </div>
        </Group>

        <Group label="How would you like to work it out?">
          <div className="flex flex-wrap gap-2">
            <Chip active={mode === 'measure'} onClick={() => setMode('measure')}>
              I can measure
            </Chip>
            <Chip active={mode === 'usual'} onClick={() => setMode('usual')}>
              Use my usual size
            </Chip>
          </div>
        </Group>

        {mode === 'measure' ? (
          <Group label={`Your ${measurementLabel}, in inches`}>
            <Input
              type="number"
              inputMode="decimal"
              min={24}
              max={60}
              step={0.5}
              value={measurement}
              onChange={(event) => setMeasurement(event.target.value)}
              placeholder={measurementKey === 'waist_in' ? '32' : '40'}
              className="max-w-32"
            />
            <p className="text-muted-foreground mt-2 text-xs">
              {measurementKey === 'waist_in'
                ? 'Measure around your natural waist, where trousers usually sit.'
                : 'Measure around the fullest part of your chest, keeping the tape level.'}
            </p>
          </Group>
        ) : (
          <Group label="The size you usually wear">
            <div className="flex flex-wrap gap-2">
              {chart.map((entry) => (
                <Chip
                  key={entry.id}
                  active={usualSize === entry.size_label}
                  onClick={() => setUsualSize(entry.size_label)}
                >
                  {entry.size_label}
                </Chip>
              ))}
            </div>
          </Group>
        )}

        <Group label="How do you like things to fit?">
          <div className="flex flex-wrap gap-2">
            {FIT_TYPES.map((option) => (
              <Chip key={option} active={fit === option} onClick={() => setFit(option)}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Chip>
            ))}
          </div>
        </Group>

        <Button type="submit">Find my size</Button>
      </form>

      {error && (
        <p className="text-brick mt-6 text-sm" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="border-clay/40 bg-clay/5 mt-8 rounded-md border p-6" aria-live="polite">
          <p className="eyebrow text-clay">Your size</p>
          <p className="font-display mt-3 text-4xl">{result.size}</p>
          <p className="mt-4 text-sm leading-relaxed">{result.rationale}</p>

          {result.alternative && (
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Also consider <span className="text-foreground">{result.alternative.size}</span> —{' '}
              {result.alternative.note}
            </p>
          )}

          <Button asChild variant="outline" size="sm" className="mt-6">
            <Link to={`${routes.shopCategory(categorySlug)}`}>
              Shop {categorySlug} in {result.size}
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow text-muted-foreground mb-3">{label}</p>
      {children}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-sm border px-3.5 py-2 text-sm transition-colors',
        active ? 'border-clay bg-clay text-bone' : 'border-border hover:border-stone',
      )}
    >
      {children}
    </button>
  )
}
