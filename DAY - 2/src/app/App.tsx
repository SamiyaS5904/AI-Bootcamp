import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/app/router'
import { CartProvider } from '@/features/cart/CartContext'
import { WishlistProvider } from '@/features/wishlist/WishlistContext'

/**
 * App root.
 *
 * Global state is React Context per CLAUDE.md §2 — no Redux/Zustand. An auth
 * session provider joins these two once Supabase Auth is connected (§5.9).
 */
export function App() {
  return (
    <BrowserRouter>
      <WishlistProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </WishlistProvider>
    </BrowserRouter>
  )
}
