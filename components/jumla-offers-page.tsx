'use client'

import { BadgePercent, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductCard, type Product } from '@/components/jumla-storefront'
import { useMarketplaceCatalog } from '@/lib/marketplace'

export function OffersPage({ onAdd }: { onAdd: (product: Product, quantity?: number) => void }) {
  const { products, isLoading, error } = useMarketplaceCatalog()
  const discountedProducts = products.filter((product) => product.discountPercent > 0)

  return (
    <main className="route-page offers-page" dir="rtl">
      <section className="route-hero shell offers-hero">
        <p className="page-kicker">وفّر مع كل كرتون</p>
        <h1>عروض جملة خاصة</h1>
        <p>خصومات واضحة وصفقات كميات تساعد نشاطك على الشراء بسعر أفضل.</p>
        <div className="offer-benefits"><span><BadgePercent aria-hidden="true" /> أسعار خاصة للكميات</span><span><Truck aria-hidden="true" /> توريد مباشر من المورد</span></div>
      </section>

      <section className="shell offers-listing" aria-labelledby="offers-title">
        <div className="page-section-heading">
          <div><p className="page-kicker">لفترة محدودة</p><h2 id="offers-title">الصفقات المتاحة</h2></div>
          <Link className="text-button" to="/categories">تصفح جميع المنتجات</Link>
        </div>
        {isLoading ? <p className="no-results" role="status">جارٍ تحميل العروض...</p> : error ? <p className="no-results" role="status">تعذر تحميل العروض حالياً.</p> : discountedProducts.length === 0 ? <p className="no-results">لا توجد عروض منشورة حالياً.</p> : <div className="product-grid catalog-product-grid">
          {discountedProducts.map((product) => (
            <div className="offer-card-wrap" key={product.id}>
              <span className="offer-ribbon">خصم {product.discountPercent}٪</span>
              <ProductCard product={product} onAdd={onAdd} />
              <p className="bulk-note">سعر جملة خاص على {product.pack}</p>
            </div>
          ))}
        </div>}
      </section>
    </main>
  )
}
