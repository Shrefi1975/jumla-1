'use client'

import { Link } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/components/jumla-cart-context'
import { CatalogImage } from '@/components/jumla-storefront'
import { formatSAR, getWhatsAppUrl, useMarketplaceCatalog } from '@/lib/marketplace'

export function CartPage() {
  const { lines, subtotal, updateQuantity, removeFromCart } = useCart()
  const { settings } = useMarketplaceCatalog()
  const minimumOrderTotal = Number(settings?.min_order_value ?? 1000)
  const adminWhatsapp = settings?.admin_whatsapp ?? '0597414858'
  const minimumRemaining = Math.max(0, minimumOrderTotal - subtotal)
  const canCheckout = lines.length > 0 && subtotal >= minimumOrderTotal
  const orderMessage = [
    'طلب جملة جديد',
    ...lines.map(({ product, quantity }) => `${product.name} — ${quantity} × ${product.pack} — ${formatSAR(product.wholesalePrice * quantity)} ر.س`),
    `الإجمالي: ${formatSAR(subtotal)} ر.س`,
  ].join('\n')
  const whatsappUrl = getWhatsAppUrl(adminWhatsapp, orderMessage)

  if (lines.length === 0) {
    return (
      <main className="route-page shell cart-page" dir="rtl">
        <div className="page-section-heading"><div><p className="page-kicker">طلبك بالجملة</p><h1>سلة المشتريات</h1></div></div>
        <div className="cart-empty-state"><span><ShoppingCart aria-hidden="true" /></span><h2>سلتك فارغة حالياً</h2><p>ابدأ بتصفح المنتجات وأضف احتياجاتك بالجملة.</p><Link className="primary-action" to="/categories">تصفح الأقسام <ArrowLeft aria-hidden="true" /></Link></div>
      </main>
    )
  }

  return (
    <main className="route-page shell cart-page" dir="rtl">
      <div className="page-section-heading"><div><p className="page-kicker">راجع طلبك قبل الإرسال</p><h1>سلة المشتريات</h1></div><Link className="text-button" to="/categories">متابعة التسوق</Link></div>
      <div className="cart-layout">
        <section className="cart-lines" aria-label="المنتجات في السلة">
          {lines.map(({ product, quantity }) => (
            <article className="cart-line" key={product.id}>
              <CatalogImage position={product.image} imageUrl={product.imageUrl} className="cart-line-image" alt={`صورة ${product.name}`} />
              <div className="cart-line-info"><Link to={`/product/${product.id}`}><h2>{product.name}</h2></Link><p>{product.pack}</p><strong>{formatSAR(product.wholesalePrice)} ر.س / {product.packagingUnit}</strong></div>
              <div className="cart-line-actions">
                <div className="quantity-stepper compact-stepper" aria-label={`كمية ${product.name}`}>
                  <button type="button" aria-label={`تقليل كمية ${product.name}`} disabled={quantity <= product.minimumOrderQuantity} onClick={() => updateQuantity(product.id, quantity - 1)}><Minus aria-hidden="true" /></button>
                  <input aria-label={`كمية ${product.name}`} type="number" min={product.minimumOrderQuantity} value={quantity} onChange={(event) => updateQuantity(product.id, Number(event.target.value))} />
                  <button type="button" aria-label={`زيادة كمية ${product.name}`} onClick={() => updateQuantity(product.id, quantity + 1)}><Plus aria-hidden="true" /></button>
                </div>
                <strong className="cart-line-total">{formatSAR(product.wholesalePrice * quantity)} ر.س</strong>
                <button className="remove-line" type="button" aria-label={`حذف ${product.name} من السلة`} onClick={() => removeFromCart(product.id)}><Trash2 aria-hidden="true" /><span>حذف</span></button>
              </div>
            </article>
          ))}
        </section>

        <aside className="cart-summary" aria-labelledby="cart-summary-title">
          <h2 id="cart-summary-title">ملخص الطلب</h2>
          <div className="summary-row"><span>قيمة المنتجات</span><strong>{formatSAR(subtotal)} ر.س</strong></div>
          <div className="summary-row"><span>التوصيل</span><span>يحدد بعد تأكيد المورد</span></div>
          <div className="summary-total"><span>الإجمالي قبل التوصيل</span><strong>{formatSAR(subtotal)} ر.س</strong></div>
          {!canCheckout && <div className="minimum-order-warning" role="status"><strong>الحد الأدنى للطلب {formatSAR(minimumOrderTotal)} ر.س</strong><span>أضف منتجات بقيمة {formatSAR(minimumRemaining)} ر.س على الأقل لإتمام الطلب.</span></div>}
          {canCheckout
            ? <a className="primary-action checkout-action" href={whatsappUrl} target="_blank" rel="noreferrer">تأكيد الطلب عبر واتساب</a>
            : <button className="primary-action checkout-action" type="button" disabled>يجب إكمال الحد الأدنى للطلب</button>}
          <p className="checkout-note">سيتم إرسال تفاصيل المنتجات والكميات إلى واتساب <bdi dir="ltr">{adminWhatsapp}</bdi>.</p>
        </aside>
      </div>
    </main>
  )
}
