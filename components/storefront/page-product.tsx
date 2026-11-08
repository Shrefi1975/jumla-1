import { Link, useParams } from "react-router-dom"
import { ArrowRight, CalendarDays, Package, Store } from "lucide-react"
import { useProduct } from "./data"
import { useCart } from "./cart-context"
import { DataError, LoadingMessage, formatSar } from "./shared"

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, error } = useProduct(id)
  const { addProduct } = useCart()

  if (isLoading) return <section className="page-section shell"><LoadingMessage label="جارٍ تحميل تفاصيل المنتج" /></section>
  if (error) return <section className="page-section shell"><DataError /></section>
  if (!product) {
    return (
      <section className="not-found shell">
        <p className="page-kicker">المنتج غير متاح</p>
        <h1>تعذر العثور على هذا المنتج</h1>
        <p>قد يكون المنتج غير منشور أو تم إيقافه من المورد.</p>
        <Link className="primary-action" to="/categories"><ArrowRight aria-hidden="true" /> العودة إلى التسوق</Link>
      </section>
    )
  }

  return (
    <section className="product-detail shell">
      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link to="/">الرئيسية</Link><span aria-hidden="true">/</span>
        <Link to={`/categories?category=${encodeURIComponent(product.categories?.slug ?? "")}`}>{product.categories?.name_ar ?? "الأقسام"}</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{product.title}</span>
      </nav>
      <div className="product-detail-grid">
        <div className="product-detail-image">
          {product.image_url ? <img src={product.image_url} alt={product.title} /> : <Package aria-hidden="true" />}
        </div>
        <div className="product-detail-copy">
          <p className="page-kicker">{product.categories?.name_ar ?? "منتجات جملة"}</p>
          <h1>{product.title}</h1>
          <p className="product-detail-description">{product.description || "منتج متاح للشراء بالجملة من مورد معتمد."}</p>
          <div className="supplier-attribution"><Store aria-hidden="true" /><span>المورد</span><strong>{product.suppliers?.company_name ?? "مورد معتمد"}</strong></div>
          <div className="price-comparison">
            <div><span>سعر الجملة</span><strong>{formatSar(product.wholesale_price)}</strong></div>
            <div><span>سعر التجزئة</span><strong className="retail-price-detail">{formatSar(product.retail_price)}</strong></div>
          </div>
          <dl className="product-facts">
            <div><dt><Package aria-hidden="true" /> وحدة التعبئة</dt><dd>{product.packaging_unit}</dd></div>
            <div><dt><Package aria-hidden="true" /> الحد الأدنى للطلب</dt><dd>{product.min_order_quantity} {product.packaging_unit}</dd></div>
            <div><dt><CalendarDays aria-hidden="true" /> تاريخ الصلاحية</dt><dd>{product.expiry_date ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(product.expiry_date)) : "غير محدد"}</dd></div>
          </dl>
          <button className="primary-action product-add-button" type="button" onClick={() => addProduct(product)}>أضف إلى السلة</button>
          <p className="minimum-order-hint">يبدأ الطلب من الحد الأدنى المحدد لهذا المنتج. الحد الأدنى لسلة الشراء ١٬٠٠٠ ر.س.</p>
        </div>
      </div>
    </section>
  )
}
