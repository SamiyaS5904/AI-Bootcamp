import { useSiteSettings } from '@/data/siteSettings'
import { amountToFreeShipping, freeShippingProgress } from '@/features/cart/lib/pricing'
import { formatPrice } from '@/lib/utils'

/**
 * Progress toward free shipping — CLAUDE.md §5.3.
 *
 * The threshold is read from `useSiteSettings()`, never written inline. The old
 * site showed ₹600 in one place and ₹6000 in another; this component and the
 * checkout summary both derive from the same value, so they cannot disagree.
 */
export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const settings = useSiteSettings()
  const remaining = amountToFreeShipping(subtotal, settings)
  const progress = freeShippingProgress(subtotal, settings)
  const qualified = remaining === 0

  return (
    <div>
      <p className="text-sm leading-relaxed">
        {qualified ? (
          <span className="text-moss">Shipping is on us.</span>
        ) : (
          <>
            <span className="text-muted-foreground">Add </span>
            <span className="text-clay">{formatPrice(remaining)}</span>
            <span className="text-muted-foreground"> for free shipping.</span>
          </>
        )}
      </p>

      <div
        className="bg-bone-sunk mt-3 h-1 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={settings.freeShippingThresholdInr}
        aria-valuenow={Math.min(subtotal, settings.freeShippingThresholdInr)}
        aria-label="Progress toward free shipping"
      >
        <div
          className={qualified ? 'bg-moss h-full' : 'bg-clay h-full'}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {!qualified && (
        <p className="text-muted-foreground mt-2 text-xs">
          Free over {formatPrice(settings.freeShippingThresholdInr)} · otherwise{' '}
          {formatPrice(settings.standardShippingFeeInr)} flat
        </p>
      )}
    </div>
  )
}
