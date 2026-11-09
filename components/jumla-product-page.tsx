'use client'

import { useState } from 'react'
import { CalendarDays, Check, Minus, PackageCheck, Plus, ShoppingBasket, Store, Truck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CatalogImage, formatSAR, type Product } from '@/components/jumla-storefront'
import { useMarketplaceCatalog } from '@/lib/marketplace'

export function ProductDetailPage({ onAdd }: { onAdd: (product: Product, quantity?: number) => void }) {
  const { id } = useParams()
  const { products, categories, isLoading, error } = useMarketplaceCatalog()
  const product = products.find((item) => item.id === id)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (isLoading) {
    return <main className="route-page shell route-empty" dir="rtl"><p role="status">جارٍ تحميل بيانات المنتج...</p></main>
  }

  if (error || !product) {
    return (
      <main className="route-page shell route-empty" dir="rtl">
        <h1>{error ? 'تعذر تحميل بيانات المنتج' : 'لم نعثر على هذا المنتج'}</h1>
        <p>{error ? 'حاول تحديث الصفحة بعد قليل.' : 'قد يكون المنتج غير متاح حالياً.'}</p>
        <Link className="primary-action" to="/categories">العودة إلى الأقسام</Link>
      </main>
    )
  }

  const category = categories.find((item) => item.id === product.categoryId)
  const expiryDate = product.expiryDate ? new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${product.expiryDate}T00:00:00`)) : 'غير محدد'

  function addProduct() {
    if (!product) return
    onAdd(product, Math.max(product.minimumOrderQuantity, quantity))
    setAdded(true)
  }

  return (
    <main className="route-page product-detail-page shell" dir="rtl">
      <nav className="breadcrumbs" aria-label="مسار التنقل">
        <Link to="/">الرئيسية</Link><span aria-hidden="true">/</span>
        <Link to={`/categories?category=${product.categoryId}`}>{category?.name ?? 'الأقسام'}</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="product-detail-grid">
        <div className="detail-image-panel">
          {product.discountPercent > 0 && <span className="detail-discount">خصم {product.discountPercent}٪ للكميات</span>}
          <CatalogImage imageUrl={product.imageUrl} loading="eager" className="detail-product-image" alt={`صورة ${product.name}`} />
        </div>

        <section className="product-detail-copy" aria-labelledby="product-title">
          <p className="page-kicker">{category?.name ?? 'منتجات جملة'}</p>
          <h1 id="product-title">{product.name}</h1>
          <p className="product-detail-description">{product.description}</p>
          <p className="supplier-line"><Store aria-hidden="true" /> المورد: <strong>{product.supplier}</strong></p>

          <div className="detail-prices">
            <div className="wholesale-price"><span>سعر الجملة</span><strong>{formatSAR(product.wholesalePrice)} <small>ر.س</small></strong></div>
            <div className="retail-price"><span>سعر التجزئة المقترح</span><strong>{formatSAR(product.retailPrice)} <small>ر.س</small></strong></div>
          </div>

          <dl className="product-specs">
            <div><dt><PackageCheck aria-hidden="true" /> وحدة التعبئة</dt><dd>{product.pack}</dd></div>
            <div><dt><ShoppingBasket aria-hidden="true" /> الحد الأدنى للطلب</dt><dd>{product.minimumOrderQuantity} {product.packagingUnit}</dd></div>
            <div><dt><CalendarDays aria-hidden="true" /> تاريخ الانتهاء</dt><dd><time dateTime={product.expiryDate}>{expiryDate}</time></dd></div>
            <div><dt><Truck aria-hidden="true" /> التوريد</dt><dd>توصيل مباشر من المورد</dd></div>
          </dl>

          <div className="detail-purchase-row">
            <div className="quantity-stepper" aria-label="كمية الطلب">
              <button type="button" aria-label="تقليل الكمية" disabled={quantity <= product.minimumOrderQuantity} onClick={() => setQuantity((current) => Math.max(product.minimumOrderQuantity, current - 1))}><Minus aria-hidden="true" /></button>
              <input aria-label="الكمية" type="number" min={product.minimumOrderQuantity} value={quantity} onChange={(event) => setQuantity(Math.max(product.minimumOrderQuantity, Number(event.target.value) || product.minimumOrderQuantity))} />
              <button type="button" aria-label="زيادة الكمية" onClick={() => setQuantity((current) => current + 1)}><Plus aria-hidden="true" /></button>
            </div>
            <button className="primary-action detail-add-button" type="button" onClick={addProduct}><ShoppingBasket aria-hidden="true" /> أضف إلى السلة</button>
          </div>
          <p className="detail-line-total">إجمالي الكمية: <strong>{formatSAR(product.wholesalePrice * quantity)} ر.س</strong></p>
          {added && <p className="inline-success" role="status"><Check aria-hidden="true" /> تمت الإضافة إلى سلتك <Link to="/cart">عرض السلة</Link></p>}
        </section>
      </div>
    </main>
  )
}
