import { useEffect } from "react"
import { Link, Route, Routes, useLocation } from "react-router-dom"
import { useCart } from "./cart-context"
import { StorefrontHeader } from "./header"
import { StorefrontFooter } from "./footer"
import { HomePage } from "./page-home"
import { StorePage, OffersPage } from "./page-catalog"
import { ProductDetailsPage } from "./page-product"
import { AboutPage, ContactPage, SuppliersPage } from "./page-information"
import { CartPage } from "./page-cart"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])
  return null
}

function NotFoundPage() {
  return (
    <section className="not-found shell">
      <p className="page-kicker">404</p>
      <h1>الصفحة غير موجودة</h1>
      <p>قد يكون الرابط قد تغير. يمكنك العودة إلى الصفحة الرئيسية أو استعراض الأقسام.</p>
      <Link className="primary-action" to="/categories">استعراض الأقسام</Link>
    </section>
  )
}

export function StorefrontShell() {
  const { announcement } = useCart()

  return (
    <>
      <ScrollToTop />
      <StorefrontHeader />
      <main id="main-content" className="storefront-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<StorePage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <StorefrontFooter />
      <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    </>
  )
}
