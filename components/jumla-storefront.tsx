'use client'

import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgePercent,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Heart,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBasket,
  ShoppingCart,
  Truck,
  UserRound,
  X,
} from 'lucide-react'
import { getWhatsAppUrl, useMarketplaceCatalog, type Category, type Product } from '@/lib/marketplace'

export type { Category, Product } from '@/lib/marketplace'

export const brands = ['المراعي', 'Tide', 'Persil', 'LUX', 'Nestlé', 'Sadia', 'فانيس', 'PINAR', 'Maggi']

export function formatSAR(value: number) {
  return new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

export function CatalogImage({ className = '', alt, imageUrl, loading = 'lazy' }: { className?: string; alt?: string; imageUrl?: string; loading?: 'eager' | 'lazy' }) {
  return (
    <div aria-hidden={!imageUrl} className={`catalog-image ${className}`}>
      {imageUrl && <img src={imageUrl} alt={alt ?? ''} loading={loading} decoding="async" />}
    </div>
  )
}

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className={`brand-mark brand-mark-image${light ? ' brand-mark-footer' : ''}`}
      aria-label="جملة - الصفحة الرئيسية"
    >
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20261108-WA0005-huqzxE3Rx26QlmTh4TD9FYqtOoJxJA.jpg"
        alt="جملة، منصة البيع بالجملة والمواد الغذائية"
        fetchPriority={light ? undefined : 'high'}
        loading={light ? 'lazy' : 'eager'}
      />
    </Link>
  )
}

export function Header({ cartCount }: { cartCount: number }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => setMobileMenuOpen(false), [pathname])
  const navigation = [
    { label: 'الرئيسية', to: '/', end: true },
    { label: 'الأقسام', to: '/categories' },
    { label: 'عروض خاصة', to: '/offers' },
    { label: 'الموردون', to: '/suppliers' },
    { label: 'من نحن', to: '/about' },
    { label: 'تواصل معنا', to: '/contact' },
  ]

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const search = query.trim()
    navigate(search ? `/categories?search=${encodeURIComponent(search)}` : '/categories')
    setMobileMenuOpen(false)
  }

  return (
    <header className="site-header" id="home">
      <div className="announcement-bar">
        <div className="announcement-inner">
          <span><Truck aria-hidden="true" /> توصيل مباشر من المورد</span>
          <span><ShieldCheck aria-hidden="true" /> ضمان وموثوقية</span>
          <span><BadgePercent aria-hidden="true" /> أسعار خاصة للتجار والشركات</span>
          <a href="/register">قدّم طلب انضمام <span aria-hidden="true">＋</span></a>
          <a href="/login"><UserRound aria-hidden="true" /> تسجيل الدخول</a>
        </div>
      </div>

      <div className="header-main shell">
        <button className="icon-button mobile-menu-button" type="button" aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={mobileMenuOpen} aria-controls="primary-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
        <div className="header-brand"><BrandMark /></div>
        <form className="search-box" role="search" onSubmit={handleSearch}>
          <label className="sr-only" htmlFor="store-search">ابحث عن منتج أو قسم أو علامة تجارية</label>
          <input id="store-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن منتج، قسم، أو علامة تجارية..." />
          <button type="submit" aria-label="بحث"><Search aria-hidden="true" /></button>
        </form>
        <div className="header-actions">
          <Link className="cart-button" to="/cart" aria-label={`سلة المشتريات، ${cartCount} منتجات`}>
            <span className="cart-count">{cartCount}</span>
            <ShoppingCart aria-hidden="true" />
            <span>سلة المشتريات</span>
          </Link>
        </div>
      </div>

      <nav id="primary-navigation" className={`main-nav${mobileMenuOpen ? ' nav-open' : ''}`} aria-label="التنقل الرئيسي">
        <div className="nav-inner shell">
          {navigation.map(({ label, to, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMobileMenuOpen(false)}>
              {label}{label === 'الأقسام' && <ChevronDown aria-hidden="true" />}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" aria-label="عرض جملة">
      <Link className="hero-banner-link" to="/categories">
        <img
          className="hero-banner-image"
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yn7rxwJRyGEa6JFHKvuDhNUv4UJWv1.png"
          alt="جملة، كل احتياجاتك بالجملة من المواد الغذائية إلى المجمدات. تسوق الآن. للأفراد والتجار والشركات والمطاعم والفنادق."
          width={1048}
          height={290}
          fetchPriority="high"
        />
      </Link>
    </section>
  )
}

export function SectionHeading({ title, action }: { title: string; action?: string }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {action && <Link to="/offers">{action}<ChevronLeft aria-hidden="true" /></Link>}
    </div>
  )
}

function Categories() {
  const { categories, isLoading, error } = useMarketplaceCatalog()
  return (
    <section className="categories-section shell" id="categories" aria-labelledby="categories-title">
      <SectionHeading title="أقسام جملة الرئيسية" />
      {isLoading ? <p className="no-results" role="status">جارٍ تحميل الأقسام...</p> : error ? <p className="no-results" role="status">تعذر تحميل الأقسام حالياً.</p> : (
        <div className="category-grid">
          {categories.slice(0, 5).map((category) => (
            <article className="category-card" key={category.id}>
              <Link to={`/categories?category=${category.id}`} className="category-link" aria-label={`تصفح قسم ${category.name}`}>
                <CatalogImage imageUrl={category.imageUrl} className="category-art" alt={`صورة قسم ${category.name}`} />
                <div className="category-title-row"><h3>{category.name}</h3><span className="category-count">{category.count}</span></div>
                <p>{category.detail}</p>
                <span className="category-action">تصفح القسم <ArrowLeft aria-hidden="true" /></span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function Benefits() {
  const benefits = [
    { title: 'توصيل مباشر من المورد', detail: 'لجميع مناطق المملكة', icon: Truck, featured: true },
    { title: 'أسعار تنافسية', detail: 'توفير أكبر عند الكميات', icon: BadgePercent },
    { title: 'منتجات أصلية', detail: 'من أفضل المصانع والموردين', icon: ShieldCheck },
    { title: 'دفع آمن', detail: 'بطاقات مدى والتحويل البنكي', icon: CreditCard },
  ]
  return (
    <section className="benefits shell" aria-label="مميزات التسوق من جملة">
      {benefits.map(({ title, detail, icon: Icon, featured }) => (
        <div key={title} className={`benefit-item${featured ? ' benefit-featured' : ''}`}>
          <span className="benefit-icon"><Icon aria-hidden="true" /></span>
          <span><strong>{title}</strong><small>{detail}</small></span>
        </div>
      ))}
      <div className="pay-later"><span className="tamara">تمارا</span><span className="tabby">تابي</span><strong>متوفر الآن</strong></div>
    </section>
  )
}

export function ProductCard({ product, isFavorite = false, onFavorite, onAdd }: {
  product: Product
  isFavorite?: boolean
  onFavorite?: (id: string) => void
  onAdd: (product: Product, quantity?: number) => void
}) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link to={`/product/${product.id}`} className="product-image-link" aria-label={`عرض تفاصيل ${product.name}`}>
          <CatalogImage imageUrl={product.imageUrl} className="product-image" alt={`صورة ${product.name}`} />
        </Link>
        {onFavorite && (
          <button className={`favorite-button${isFavorite ? ' is-favorite' : ''}`} type="button" aria-label={isFavorite ? `إزالة ${product.name} من المفضلة` : `إضافة ${product.name} للمفضلة`} aria-pressed={isFavorite} onClick={() => onFavorite(product.id)}>
            <Heart aria-hidden="true" />
          </button>
        )}
        {product.badge && <span className={`product-badge${product.discountPercent > 0 ? ' badge-discount' : ''}`}>{product.badge}</span>}
      </div>
      <div className="product-info">
        <p className="product-description">{product.description}</p>
        <h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3>
        <span className="product-pack">{product.pack}</span>
        <div className="product-price"><strong>{formatSAR(product.wholesalePrice)} <small>ر.س</small></strong><span>سعر الجملة</span></div>
        <button className="add-to-cart" type="button" onClick={() => onAdd(product, product.minimumOrderQuantity)}><ShoppingBasket aria-hidden="true" /> أضف إلى السلة</button>
      </div>
    </article>
  )
}

function FeaturedProducts({ onAdd }: { onAdd: (product: Product, quantity?: number) => void }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const { products, isLoading, error } = useMarketplaceCatalog()

  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id])
  }

  return (
    <section className="products-section shell" id="products" aria-labelledby="products-title">
      <SectionHeading title="عروض مميزة" action="عرض الكل" />
      {isLoading ? <p className="no-results" role="status">جارٍ تحميل المنتجات...</p> : error ? <p className="no-results" role="status">تعذر تحميل المنتجات حالياً.</p> : products.length === 0 ? <p className="no-results">ستظهر المنتجات المنشورة هنا قريباً.</p> : (
        <div className="product-grid">
          {products.slice(0, 5).map((product) => <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)} onFavorite={toggleFavorite} onAdd={onAdd} />)}
        </div>
      )}
    </section>
  )
}

function BrandGroup({ decorative = false }: { decorative?: boolean }) {
  return (
    <div className="brand-group" role={decorative ? undefined : 'list'} aria-hidden={decorative || undefined}>
      {brands.map((brand, index) => (
        <div key={brand} className={`brand-tile brand-tile-${index}`} role={decorative ? undefined : 'listitem'}>
          {brand}
        </div>
      ))}
    </div>
  )
}

export function Brands() {
  return (
    <section className="brands-section shell" aria-labelledby="brands-title">
      <div className="brands-heading"><h2 id="brands-title">أشهر العلامات التجارية</h2><span>منتجات تثق بها، من موردين نثق بهم</span></div>
      <div className="brand-strip">
        <span className="brand-arrow" aria-hidden="true"><ChevronRight /></span>
        <div className="brand-marquee" role="region" aria-label="شريط أشهر العلامات التجارية" aria-roledescription="شريط متحرك" tabIndex={0}>
          <div className="brand-track">
            <BrandGroup />
            <BrandGroup decorative />
          </div>
        </div>
        <span className="brand-arrow" aria-hidden="true"><ChevronLeft /></span>
      </div>
    </section>
  )
}

export function Footer() {
  const { settings } = useMarketplaceCatalog()
  const adminWhatsapp = settings?.admin_whatsapp ?? ''
  const telephone = adminWhatsapp.replace(/[^+\d]/g, '')

  return (
    <footer className="site-footer" id="footer">
      <div className="footer-main shell">
        <div className="footer-about"><BrandMark light /><p>منصة جملة تجمع أفضل الموردين والمنتجات في مكان واحد، لتجعل تجربة التسوق بالجملة أسهل وأسرع.</p><div className="social-links"><a href="#footer" aria-label="منصة إكس">𝕏</a><a href="#footer" aria-label="إنستغرام">◎</a><a href="#footer" aria-label="تيك توك">♪</a><a href="#footer" aria-label="يوتيوب">▶</a></div></div>
        <div className="footer-column"><h2>روابط سريعة</h2><Link to="/">الرئيسية</Link><Link to="/categories">الأقسام</Link><Link to="/offers">عروض خاصة</Link><Link to="/suppliers">الموردون</Link><Link to="/about">من نحن</Link><Link to="/contact">تواصل معنا</Link></div>
        <div className="footer-column"><h2>خدمة العملاء</h2><Link to="/contact">مركز المساعدة</Link><Link to="/contact">سياسة الخصوصية</Link><Link to="/contact">سياسة الاسترجاع</Link><Link to="/contact">الشروط والأحكام</Link><Link to="/cart">السلة والدفع</Link></div>
        <div className="footer-contact"><h2>تواصل معنا</h2>{adminWhatsapp ? <><a href={`tel:${telephone}`}><UserRound aria-hidden="true" /> <bdi dir="ltr">{adminWhatsapp}</bdi></a><a href={getWhatsAppUrl(adminWhatsapp)} target="_blank" rel="noreferrer"><CircleHelp aria-hidden="true" /> واتساب الدعم</a></> : <p>بيانات التواصل غير متاحة حالياً.</p>}<p><span aria-hidden="true">⌖</span> مستودع جملة، جدة، المملكة العربية السعودية</p></div>
      </div>
      <div className="footer-bottom shell"><div className="payment-methods" aria-label="طرق الدفع المتاحة"><span>mada</span><span>VISA</span><span>◉</span></div><p>© 2026 منصة جملة. جميع الحقوق محفوظة.</p><Link to="/">جملة.. تسوق بكل سهولة</Link></div>
    </footer>
  )
}

export function HomePage({ onAdd }: { onAdd: (product: Product, quantity?: number) => void }) {
  const [announcement, setAnnouncement] = useState('')

  function addToCart(product: Product, quantity?: number) {
    onAdd(product, quantity)
    setAnnouncement(`تمت إضافة ${product.name} إلى السلة`)
    window.setTimeout(() => setAnnouncement(''), 2800)
  }

  return (
    <main className="home-page" dir="rtl">
      <Hero />
      <Categories />
      <Benefits />
      <FeaturedProducts onAdd={addToCart} />
      <Brands />
      <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    </main>
  )
}
