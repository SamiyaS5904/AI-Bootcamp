import type { Product } from '@/types/models'

/**
 * Fabric & fit — CLAUDE.md §5.2 requires this as an explicit section, not
 * buried in a tab or accordion. It is the reason this store exists (§1), so it
 * sits inline on the page at full readability.
 *
 * Values come straight from the catalog. Where copy is still pending they carry
 * the {{TODO}} marker and render as visible placeholders (§8) rather than
 * invented fabric claims — which would be the worst possible thing to fake.
 */
export function FabricFitPanel({ product }: { product: Product }) {
  const rows = [
    { label: 'Fabric', value: product.fabric },
    { label: 'Fit', value: fitDescription(product.fit_type) },
    { label: 'Care', value: product.care_instructions },
  ]

  return (
    <section aria-labelledby="fabric-fit" className="border-border border-t pt-8">
      <h2 id="fabric-fit" className="eyebrow text-muted-foreground">
        Fabric &amp; fit
      </h2>

      <dl className="mt-5 space-y-5">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-4">
            <dt className="text-muted-foreground text-sm">{row.label}</dt>
            <dd className="text-sm leading-relaxed">
              {isTodo(row.value) ? <TodoValue value={row.value} /> : row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/**
 * Fit descriptions are real copy, not placeholders — they describe the three
 * fixed `fit_type` values, which are structural facts about the garment rather
 * than per-product marketing.
 */
function fitDescription(fit: Product['fit_type']) {
  switch (fit) {
    case 'slim':
      return 'Slim — cut close through the chest and waist, with a shorter body.'
    case 'regular':
      return 'Regular — straight through the body without pulling. Our most forgiving cut.'
    case 'relaxed':
      return 'Relaxed — deliberate room through the body and a longer line.'
  }
}

function isTodo(value: string) {
  return value.startsWith('{{TODO')
}

function TodoValue({ value }: { value: string }) {
  return (
    <span className="bg-brick/15 text-brick ring-brick/40 inline-block rounded-sm px-1.5 py-0.5 font-mono text-[0.6875rem] ring-1 ring-inset">
      {value}
    </span>
  )
}
