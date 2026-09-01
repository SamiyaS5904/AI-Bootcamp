import { Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { HomePage } from '@/features/home/pages/HomePage'
import { ShopPage } from '@/features/shop/pages/ShopPage'
import { CategoryPage } from '@/features/shop/pages/CategoryPage'
import { ProductDetailPage } from '@/features/product/pages/ProductDetailPage'
import { StyleAssistantPage } from '@/features/style-assistant/pages/StyleAssistantPage'
import { SizeGuidePage } from '@/features/size-guide/pages/SizeGuidePage'
import { CartPage } from '@/features/cart/pages/CartPage'
import { CheckoutPage } from '@/features/checkout/pages/CheckoutPage'
import { OrderConfirmationPage } from '@/features/checkout/pages/OrderConfirmationPage'
import { AccountPage } from '@/features/account/pages/AccountPage'
import { WishlistPage } from '@/features/wishlist/pages/WishlistPage'
import { AboutPage } from '@/features/content/pages/AboutPage'
import { ShippingReturnsPage } from '@/features/content/pages/ShippingReturnsPage'
import { PrivacyPolicyPage } from '@/features/content/pages/PrivacyPolicyPage'
import { TermsPage } from '@/features/content/pages/TermsPage'
import { ContactPage } from '@/features/content/pages/ContactPage'
import { NotFoundPage } from '@/features/errors/pages/NotFoundPage'

/**
 * Every route in CLAUDE.md §4, all inside the persistent header/footer shell.
 *
 * Paths are written out here rather than pulled from `routes` because React
 * Router needs literal patterns (`:slug`) that the link helpers don't produce.
 * `src/config/routes.ts` stays the source for generating links; keep the two
 * in step when adding a route.
 *
 * Not code-split yet: with placeholder pages there's nothing to split. Worth
 * revisiting once the catalog and checkout have real weight (§7 Performance).
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />

        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/:category" element={<CategoryPage />} />
        <Route path="product/:slug" element={<ProductDetailPage />} />

        <Route path="style-assistant" element={<StyleAssistantPage />} />
        <Route path="size-guide" element={<SizeGuidePage />} />

        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />

        <Route path="account" element={<AccountPage />} />
        <Route path="wishlist" element={<WishlistPage />} />

        <Route path="about" element={<AboutPage />} />
        <Route path="shipping-returns" element={<ShippingReturnsPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="contact" element={<ContactPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
