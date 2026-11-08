import { Link } from "react-router-dom"
import { Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react"
import { useCart } from "./cart-context"
import { usePlatformSettings } from "./data"
import { formatSar, PageBanner } from "./shared"

function whatsappNumber(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits.startsWith("966")) return digits
  if (digits.startsWith("0")) return `966${digits.slice(1)}`
  return digits
}

export function CartPage() {
  const { items, subtotal, updateQuantity, removeProduct, clearCart } = useCart()
  const { data: settings } = usePlatformSettings()
  const minimum = settings?.min_order_value ?? 1000
  const remaining = Math.max(0, minimum - subtotal)
  const readyForOrder = items.length > 0 && subtotal >= minimum

  function sendOrderToWhatsApp() {
    if (!readyForOrder) return
    const itemLines = items.map(({ product, quantity }) => `• ${product.title} — ${quantity} ${product.packaging_unit} × ${formatSar(product.wholesale_price)}`)
    const message = [
      "السلام عليكم، أود تأكيد طلب جملة من منصة جملة:",
      "",
      ...itemLines,
      "",
      `الإجمالي: ${formatSar(subtotal)}`,
      `عدد المنتجات: ${items.length}`,
    ].join("\n")
    const phone = whatsappNumber(settings?.admin_whatsapp ?? "0597414858")
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
    clearCart()
  }

  return (
    <>
      <PageBanner eyebrow="طلبك" title="سلة المشتريات" description="راجع الكميات والأسعار قبل إرسال طلبك مباشرة إلى واتساب." />
      <section className="cart-layout shell">
        <div className="cart-items-panel">
          {items.length ? items.map(({ product, quantity }) => (
            <article key={product.id} className="cart-row">
              <div className="cart-thumb">{product.image_url && <img src={product.image_url} alt="" />}</div>
              <div className="cart-product-copy">
                <h2><Link to={`/product/${product.id}`}>{product.title}</Link></h2>
                <p>{product.packaging_unit} · الحد الأدنى {product.min_order_quantity}</p>
                <strong>{formatSar(product.wholesale_price)} <small>للوحدة</small></strong>
              </div>
              <div className="quantity-control" aria-label={`كمية ${product.title}`}>
                <button type="button" aria-label={`زيادة كمية ${product.title}`} onClick={() => updateQuantity(product.id, quantity + product.min_order_quantity)}><Plus aria-hidden="true" /></button>
                <span aria-live="polite">{quantity}</span>
                <button type="button" aria-label={`تقليل كمية ${product.title}`} disabled={quantity <= product.min_order_quantity} onClick={() => updateQuantity(product.id, quantity - product.min_order_quantity)}><Minus aria-hidden="true" /></button>
              </div>
              <strong className="cart-line-total">{formatSar(product.wholesale_price * quantity)}</strong>
              <button className="remove-cart-item" type="button" aria-label={`حذف ${product.title} من السلة`} onClick={() => removeProduct(product.id)}><Trash2 aria-hidden="true" /></button>
            </article>
          )) : (
            <div className="empty-state cart-empty"><ShoppingBasket aria-hidden="true" /><h2>سلتك فارغة</h2><p>أضف منتجات من الكتالوج لتجهيز طلب الجملة.</p><Link className="primary-action" to="/categories">استعراض المنتجات</Link></div>
          )}
        </div>

        <aside className="cart-summary" aria-label="ملخص الطلب">
          <h2>ملخص الطلب</h2>
          <div><span>عدد المنتجات</span><strong>{items.length}</strong></div>
          <div><span>الإجمالي قبل الإرسال</span><strong>{formatSar(subtotal)}</strong></div>
          <div className="minimum-status">
            {readyForOrder ? <span>وصلت إلى الحد الأدنى للطلب</span> : <span>الحد الأدنى للطلب {formatSar(minimum)}</span>}
            {!readyForOrder && items.length > 0 && <strong>أضف {formatSar(remaining)} لإكمال الطلب</strong>}
          </div>
          <button className="primary-action whatsapp-checkout" type="button" disabled={!readyForOrder} onClick={sendOrderToWhatsApp}>إرسال الطلب عبر واتساب</button>
          <p className="summary-note">سيُفتح واتساب برسالة تتضمن المنتجات والكميات والإجمالي. لا يتم تحصيل أي مبلغ داخل الموقع.</p>
        </aside>
      </section>
    </>
  )
}
