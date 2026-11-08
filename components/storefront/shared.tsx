import { Link } from "react-router-dom"
import { ArrowLeft, Coffee, Cookie, Droplets, Milk, Nut, Package, PackageOpen, Snowflake, Wheat } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { CategoryRow } from "@/lib/supabase/database.types"
import type { ProductWithRelations } from "./data"
import { useCart } from "./cart-context"

const categoryIcons: Record<string, LucideIcon> = {
  CupSoda: Coffee,
  Wheat,
  Droplets,
  Package,
  Milk,
  Snowflake,
  Nut,
  Cookie,
  PackageOpen,
}

export function formatSar(value: number) {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(value)
}

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`brand-mark${light ? " brand-mark-light" : ""}`} aria-label="جملة، الصفحة الرئيسية">
      <span className="brand-word">جملة<span className="brand-leaf" aria-hidden="true" /></span>
      <span className="brand-caption">منصة البيع بالجملة والتوريد المباشر</span>
    </Link>
  )
}

export function SectionHeading({ title, action, to = "/categories" }: { title: string; action?: string; to?: string }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {action && <Link to={to}>{action}<ArrowLeft aria-hidden="true" /></Link>}
    </div>
  )
}

export function CategoryIcon({ category, className = "" }: { category: CategoryRow; className?: string }) {
  const Icon = categoryIcons[category.icon] ?? Package
  return <Icon aria-hidden="true" className={className} strokeWidth={1.65} />
}

export function CategoryCard({ category }: { category: CategoryRow }) {
  return (
    <article className="category-card">
      <Link to={`/categories?category=${encodeURIComponent(category.slug)}`} className="category-link" aria-label={`تصفح قسم ${category.name_ar}`}>
        <span className="category-art"><CategoryIcon category={category} /></span>
        <div className="category-title-row"><h3>{category.name_ar}</h3></div>
        <p>{category.description}</p>
        <span className="category-action">تصفح القسم <ArrowLeft aria-hidden="true" /></span>
      </Link>
    </article>
  )
}

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const { addProduct } = useCart()
  const hasDiscount = product.retail_price > product.wholesale_price

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-link" aria-label={`عرض ${product.title}`}>
        <div className="product-image-wrap">
          {product.image_url ? <img src={product.image_url} alt={product.title} className="product-image" loading="lazy" /> : <span className="product-image-fallback" aria-hidden="true"><Package /></span>}
          {hasDiscount && <span className="product-badge badge-discount">سعر جملة</span>}
        </div>
      </Link>
      <div className="product-info">
        <p className="product-description">{product.categories?.name_ar ?? "منتجات جملة"}</p>
        <h3><Link to={`/product/${product.id}`}>{product.title}</Link></h3>
        <span className="product-pack">{product.packaging_unit} · حد الطلب {product.min_order_quantity}</span>
        <div className="product-price">
          <strong dir="rtl">{formatSar(product.wholesale_price)}</strong>
          {hasDiscount && <span className="retail-price">بدلاً من {formatSar(product.retail_price)}</span>}
        </div>
        <button className="add-to-cart" type="button" onClick={() => addProduct(product)}>
          أضف إلى السلة
        </button>
      </div>
    </article>
  )
}

export function ProductGrid({ products, emptyTitle = "لا توجد منتجات منشورة بعد", emptyBody = "سيظهر هنا ما يضيفه الموردون المعتمدون إلى الكتالوج." }: {
  products: ProductWithRelations[]
  emptyTitle?: string
  emptyBody?: string
}) {
  if (!products.length) {
    return <div className="empty-state"><Package aria-hidden="true" /><h3>{emptyTitle}</h3><p>{emptyBody}</p></div>
  }
  return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
}

export function PageBanner({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="page-banner shell">
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <span>{description}</span>
    </header>
  )
}

export function LoadingMessage({ label = "جارٍ تحميل البيانات" }: { label?: string }) {
  return <div className="loading-message" role="status"><span className="loading-dot" />{label}</div>
}

export function DataError({ title = "تعذر تحميل البيانات", message = "تحقق من اتصال الإنترنت ثم حاول مرة أخرى." }: { title?: string; message?: string }) {
  return <div className="error-panel" role="alert"><h3>{title}</h3><p>{message}</p></div>
}
