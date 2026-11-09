'use client'

import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { CartProvider, useCart } from '@/components/jumla-cart-context'
import { CategoriesPage } from '@/components/jumla-catalog-page'
import { CartPage } from '@/components/jumla-cart-page'
import { AboutPage, ContactPage } from '@/components/jumla-company-pages'
import { HomePage, Footer, Header } from '@/components/jumla-storefront'
import { OffersPage } from '@/components/jumla-offers-page'
import { ProductDetailPage } from '@/components/jumla-product-page'
import { SuppliersPage } from '@/components/jumla-suppliers-page'

function ScrollToRouteStart() {
  const { pathname } = useLocation()
  const titles: Record<string, string> = {
    '/': 'الرئيسية | منصة جملة',
    '/categories': 'الأقسام والتسوق | منصة جملة',
    '/store': 'الأقسام والتسوق | منصة جملة',
    '/offers': 'عروض خاصة | منصة جملة',
    '/suppliers': 'الموردون | منصة جملة',
    '/about': 'من نحن | منصة جملة',
    '/contact': 'تواصل معنا | منصة جملة',
    '/cart': 'السلة والدفع | منصة جملة',
  }
  const title = pathname.startsWith('/product/') ? 'تفاصيل المنتج | منصة جملة' : titles[pathname] ?? 'منصة جملة'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    document.title = title
  }, [pathname, title])

  return null
}

function StoreRoutes() {
  const { cartCount, addToCart } = useCart()

  return (
    <div className="jumla-app" dir="rtl">
      <Header cartCount={cartCount} />
      <ScrollToRouteStart />
      <Routes>
        <Route path="/" element={<HomePage onAdd={addToCart} />} />
        <Route path="/categories" element={<CategoriesPage onAdd={addToCart} />} />
        <Route path="/store" element={<CategoriesPage onAdd={addToCart} />} />
        <Route path="/product/:id" element={<ProductDetailPage onAdd={addToCart} />} />
        <Route path="/offers" element={<OffersPage onAdd={addToCart} />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

function NotFoundPage() {
  return (
    <main className="route-page shell route-empty" dir="rtl">
      <p className="page-kicker">الصفحة غير موجودة</p>
      <h1>لا نجد ما تبحث عنه</h1>
      <p>قد يكون الرابط غير صحيح أو أن الصفحة نُقلت.</p>
      <Link className="primary-action" to="/">العودة إلى الرئيسية</Link>
    </main>
  )
}

export function JumlaRouter() {
  const [routerReady, setRouterReady] = useState(false)

  useEffect(() => {
    setRouterReady(true)
  }, [])

  if (!routerReady) {
    return <div className="router-loading" dir="rtl" role="status">جارٍ تجهيز متجر جملة...</div>
  }

  return (
    <CartProvider>
      <BrowserRouter>
        <StoreRoutes />
      </BrowserRouter>
    </CartProvider>
  )
}
