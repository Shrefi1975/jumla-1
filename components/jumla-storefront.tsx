'use client'

import { useMemo, useState } from 'react'
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

const categories = [
  { name: 'المجمدات', count: '٥', items: 'منتجات', image: [0, 0], detail: 'دواجن، أسماك، خضروات ومخبوزات مجمدة' },
  { name: 'الورقيات', count: '٤', items: 'منتجات', image: [0, 3], detail: 'مناديل الوجه، رولات المطبخ وورق السفرة' },
  { name: 'البلاستيك', count: '٣', items: 'منتجات', image: [0, 2], detail: 'أدوات الاستخدام الواحد ومواد التغليف' },
  { name: 'المنظفات', count: '٢', items: 'منتجات', image: [0, 1], detail: 'منظفات المنزل، المطهرات والعناية' },
  { name: 'المواد الغذائية', count: '١', items: 'منتجات', image: [0, 4], detail: 'الأرز، السكر، الزيوت، المعلبات والمزيد' },
]

const products = [
  { id: 1, name: 'زيت زيتون', description: 'زيت نباتي نقي · ١ لتر', pack: 'كرتون ١٢ حبة', price: '٥٨.٠٠', badge: 'الأكثر مبيعاً', image: [0, 5] },
  { id: 2, name: 'مسحوق غسيل', description: 'قوة تنظيف فائقة · ٢.٥ كجم', pack: 'كرتون ٤ حبات', price: '٩٥.٠٠', badge: 'خصم خاص', image: [1, 1] },
  { id: 3, name: 'مناديل وجه', description: 'مناديل ناعمة · ١٠ علب', pack: 'كرتون ٤٨ علبة', price: '٤٢.٠٠', badge: '', image: [0, 3] },
  { id: 4, name: 'دجاج مجمد', description: 'دجاج طازج مجمد · ١٠٠٠ جم', pack: 'كرتون ١٠ حبات', price: '٩٥.٠٠', badge: '', image: [0, 0] },
  { id: 5, name: 'بطاطس مقلية', description: 'بطاطس مقرمشة · ٢.٥ كجم', pack: 'كرتون ٤ أكياس', price: '٢٢.٠٠', badge: '', image: [0, 4] },
]

const brands = ['المراعي', 'Tide', 'Persil', 'LUX', 'Nestlé', 'Sadia', 'فانيس', 'PINAR', 'Maggi']
const audiences = ['الأفراد', 'التجار', 'الشركات', 'المطاعم والفنادق']

function CatalogImage({ position, className = '' }: { position: number[]; className?: string }) {
  const [row, column] = position
  const horizontalPositions = ['0%', '20%', '40%', '60%', '80%', '100%']
  return (
    <div
      aria-hidden="true"
      className={`catalog-image ${className}`}
      style={{ backgroundPosition: `${horizontalPositions[column]} ${row === 0 ? '0%' : '100%'}` }}
    />
  )
}

function BrandMark({ light = false }: { light?: boolean }) {
  if (!light) {
    return (
      <a href="#home" className="brand-mark brand-mark-image" aria-label="جملة - الصفحة الرئيسية">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20261108-WA0005-huqzxE3Rx26QlmTh4TD9FYqtOoJxJA.jpg"
          alt="جملة، منصة البيع بالجملة والمواد الغذائية"
          fetchPriority="high"
        />
      </a>
    )
  }

  return (
    <a href="#home" className="brand-mark brand-mark-light" aria-label="جملة - الصفحة الرئيسية">
      <span className="brand-word">جملة<span className="brand-leaf" aria-hidden="true" /></span>
      <span className="brand-caption">منصة البيع بالجملة والتوريد المباشر</span>
    </a>
  )
}

function Header({ cartCount, query, onSearch }: { cartCount: number; query: string; onSearch: (value: string) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigation = ['الرئيسية', 'الأقسام', 'عروض خاصة', 'الموردون', 'من نحن', 'تواصل معنا']

  return (
    <header className="site-header" id="home">
      <div className="announcement-bar">
        <div className="announcement-inner">
          <span><Truck aria-hidden="true" /> توصيل مباشر من المورد</span>
          <span><ShieldCheck aria-hidden="true" /> ضمان وموثوقية</span>
          <span><BadgePercent aria-hidden="true" /> أسعار خاصة للتجار والشركات</span>
          <a href="#account">إنشاء حساب جديد <span aria-hidden="true">＋</span></a>
          <a href="#account"><UserRound aria-hidden="true" /> تسجيل الدخول</a>
        </div>
      </div>

      <div className="header-main shell">
        <button className="icon-button mobile-menu-button" type="button" aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} onClick={() => setMobileMenuOpen((open) => !open)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
        <div className="header-brand"><BrandMark /></div>
        <label className="search-box">
          <span className="sr-only">ابحث عن منتج أو قسم أو علامة تجارية</span>
          <input value={query} onChange={(event) => onSearch(event.target.value)} placeholder="ابحث عن منتج، قسم، أو علامة تجارية..." />
          <button type="button" aria-label="بحث"><Search aria-hidden="true" /></button>
        </label>
        <div className="header-actions">
          <button className="cart-button" type="button" aria-label={`سلة المشتريات، ${cartCount} منتجات`}>
            <span className="cart-count">{cartCount}</span>
            <ShoppingCart aria-hidden="true" />
            <span>سلة المشتريات</span>
          </button>
        </div>
      </div>

      <nav className={`main-nav${mobileMenuOpen ? ' nav-open' : ''}`} aria-label="التنقل الرئيسي">
        <div className="nav-inner shell">
          {navigation.map((item, index) => (
            <a key={item} href={index === 1 ? '#categories' : index === 2 ? '#products' : index === 5 ? '#footer' : '#home'} onClick={() => setMobileMenuOpen(false)}>
              {item}{index === 1 && <ChevronDown aria-hidden="true" />}
            </a>
          ))}
        </div>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-photo" aria-hidden="true" />
      <div className="hero-copy">
        <p className="hero-eyebrow">جملة كل بيت • بالكرتون أو بالحبة</p>
        <h1 id="hero-title">جملة.. كل احتياجاتك<br /><span>بالجملة</span></h1>
        <p className="hero-description">من المواد الغذائية إلى المجمدات، نوفر لك أفضل المنتجات بأفضل الأسعار.</p>
        <a className="hero-cta" href="#products">تسوق الآن <ArrowLeft aria-hidden="true" /></a>
      </div>
      <aside className="audience-card" aria-label="تسوق حسب احتياجك">
        <p>تسوق حسب احتياجك</p>
        {audiences.map((audience, index) => (
          <a href="#categories" key={audience} className="audience-link">
            <span>{audience}</span><span className="audience-icon" aria-hidden="true">{index + 1}</span>
          </a>
        ))}
      </aside>
      <div className="hero-dots" aria-hidden="true"><i /><i /><i /></div>
    </section>
  )
}

function SectionHeading({ title, action }: { title: string; action?: string }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {action && <a href="#products">{action}<ChevronLeft aria-hidden="true" /></a>}
    </div>
  )
}

function Categories() {
  return (
    <section className="categories-section shell" id="categories" aria-labelledby="categories-title">
      <SectionHeading title="أقسام جملة الرئيسية" />
      <div className="category-grid">
        {categories.map((category) => (
          <article className="category-card" key={category.name}>
            <a href="#products" className="category-link" aria-label={`تصفح قسم ${category.name}`}>
              <CatalogImage position={category.image} className="category-art" />
              <div className="category-title-row"><h3>{category.name}</h3><span className="category-count">{category.count}</span></div>
              <p>{category.detail}</p>
              <span className="category-action">تصفح القسم <ArrowLeft aria-hidden="true" /></span>
            </a>
          </article>
        ))}
      </div>
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

function ProductCard({ product, isFavorite, onFavorite, onAdd }: {
  product: (typeof products)[number]
  isFavorite: boolean
  onFavorite: (id: number) => void
  onAdd: (name: string) => void
}) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <CatalogImage position={product.image} className="product-image" />
        <button className={`favorite-button${isFavorite ? ' is-favorite' : ''}`} type="button" aria-label={isFavorite ? `إزالة ${product.name} من المفضلة` : `إضافة ${product.name} للمفضلة`} aria-pressed={isFavorite} onClick={() => onFavorite(product.id)}>
          <Heart aria-hidden="true" />
        </button>
        {product.badge && <span className={`product-badge${product.badge === 'خصم خاص' ? ' badge-discount' : ''}`}>{product.badge}</span>}
      </div>
      <div className="product-info">
        <p className="product-description">{product.description}</p>
        <h3>{product.name}</h3>
        <span className="product-pack">{product.pack}</span>
        <div className="product-price"><strong>{product.price} <small>ر.س</small></strong><span>شامل الضريبة</span></div>
        <button className="add-to-cart" type="button" onClick={() => onAdd(product.name)}><ShoppingBasket aria-hidden="true" /> أضف إلى السلة</button>
      </div>
    </article>
  )
}

function FeaturedProducts({ query, onAdd }: { query: string; onAdd: (name: string) => void }) {
  const [favorites, setFavorites] = useState<number[]>([])
  const visibleProducts = useMemo(() => products.filter((product) => product.name.includes(query.trim())), [query])

  function toggleFavorite(id: number) {
    setFavorites((current) => current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id])
  }

  return (
    <section className="products-section shell" id="products" aria-labelledby="products-title">
      <SectionHeading title="عروض مميزة" action="عرض الكل" />
      {visibleProducts.length > 0 ? (
        <div className="product-grid">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)} onFavorite={toggleFavorite} onAdd={onAdd} />)}
        </div>
      ) : (
        <div className="no-results"><Search aria-hidden="true" /><p>لا توجد منتجات مطابقة لبحثك</p></div>
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

function Brands() {
  return (
    <section className="brands-section shell" aria-labelledby="brands-title">
      <div className="brands-heading"><h2 id="brands-title">أشهر العلامات التجارية</h2><span>منتجات تثق بها، من موردين نثق بهم</span></div>
      <div className="brand-strip">
        <span className="brand-arrow" aria-hidden="true"><ChevronRight /></span>
        <div className="brand-marquee" role="region" aria-label="شريط أشهر العلامات التجارية" aria-roledescription="شريط متحرك" tabIndex={0}>
          <div className="brand-track">
            <BrandGroup />
            <BrandGroup decorative />
            <BrandGroup decorative />
          </div>
        </div>
        <span className="brand-arrow" aria-hidden="true"><ChevronLeft /></span>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-main shell">
        <div className="footer-about"><BrandMark light /><p>منصة جملة تجمع أفضل الموردين والمنتجات في مكان واحد، لتجعل تجربة التسوق بالجملة أسهل وأسرع.</p><div className="social-links"><a href="#footer" aria-label="منصة إكس">𝕏</a><a href="#footer" aria-label="إنستغرام">◎</a><a href="#footer" aria-label="تيك توك">♪</a><a href="#footer" aria-label="يوتيوب">▶</a></div></div>
        <div className="footer-column"><h2>روابط سريعة</h2><a href="#home">الرئيسية</a><a href="#categories">الأقسام</a><a href="#products">عروض خاصة</a><a href="#footer">من نحن</a><a href="#footer">تواصل معنا</a></div>
        <div className="footer-column"><h2>خدمة العملاء</h2><a href="#footer">مركز المساعدة</a><a href="#footer">سياسة الخصوصية</a><a href="#footer">سياسة الاسترجاع</a><a href="#footer">الشروط والأحكام</a></div>
        <div className="footer-contact"><h2>تواصل معنا</h2><a href="tel:+96659741858"><UserRound aria-hidden="true" /> +966 59 741 4858</a><a href="mailto:info@jumla.sa"><CircleHelp aria-hidden="true" /> info@jumla.sa</a><p><span aria-hidden="true">⌖</span> جدة، المملكة العربية السعودية</p></div>
      </div>
      <div className="footer-bottom shell"><div className="payment-methods" aria-label="طرق الدفع المتاحة"><span>mada</span><span>VISA</span><span>◉</span></div><p>© 2026 منصة جملة. جميع الحقوق محفوظة.</p><a href="#home">جملة.. تسوق بكل سهولة</a></div>
    </footer>
  )
}

export function JumlaStorefront() {
  const [query, setQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [announcement, setAnnouncement] = useState('')

  function addToCart(name: string) {
    setCartCount((count) => count + 1)
    setAnnouncement(`تمت إضافة ${name} إلى السلة`)
    window.setTimeout(() => setAnnouncement(''), 2800)
  }

  return (
    <main dir="rtl">
      <Header cartCount={cartCount} query={query} onSearch={setQuery} />
      <Hero />
      <Categories />
      <Benefits />
      <FeaturedProducts query={query} onAdd={addToCart} />
      <Brands />
      <Footer />
      <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    </main>
  )
}
