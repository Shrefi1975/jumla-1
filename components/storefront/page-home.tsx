import { Link } from "react-router-dom"
import { ArrowLeft, BadgePercent, ShieldCheck, Truck } from "lucide-react"
import { useApprovedSuppliers, useCategories, useProducts } from "./data"
import { CategoryCard, DataError, LoadingMessage, ProductGrid, SectionHeading } from "./shared"

export function HomePage() {
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts({ limit: 5 })
  const { data: suppliers } = useApprovedSuppliers()

  return (
    <>
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-photo" aria-hidden="true" />
        <div className="hero-copy">
          <p className="hero-eyebrow">جملة واحدة · توريد أوضح</p>
          <h1 id="hero-title">كل احتياجاتك<br /><span>بسعر الجملة</span></h1>
          <p className="hero-description">اكتشف منتجات الموردين المعتمدين، قارن الأسعار، واجمع طلبك في مكان واحد.</p>
          <Link className="hero-cta" to="/categories">ابدأ التسوق <ArrowLeft aria-hidden="true" /></Link>
        </div>
        <aside className="audience-card" aria-label="استكشف منصة جملة">
          <p>حلول توريد تناسب</p>
          <Link className="audience-link" to="/categories"><span>المطاعم والتجار</span><span className="audience-icon">01</span></Link>
          <Link className="audience-link" to="/suppliers"><span>الموردين والمصانع</span><span className="audience-icon">02</span></Link>
          <Link className="audience-link" to="/offers"><span>طلبات الجملة</span><span className="audience-icon">03</span></Link>
        </aside>
        <div className="hero-dots" aria-hidden="true"><i /><i /><i /></div>
      </section>

      <section className="categories-section shell" aria-labelledby="home-categories-title">
        <SectionHeading title="تسوق حسب القسم" action="عرض جميع الأقسام" to="/categories" />
        {categoriesError ? <DataError /> : categoriesLoading ? <LoadingMessage label="جارٍ تحميل الأقسام" /> : (
          <div className="category-grid">
            {(categories ?? []).slice(0, 5).map((category) => <CategoryCard key={category.id} category={category} />)}
          </div>
        )}
        {!categoriesLoading && !categoriesError && !(categories?.length) && <p className="inline-empty">ستظهر الأقسام هنا بعد تحديث الكتالوج.</p>}
      </section>

      <section className="home-benefits shell" aria-label="مميزات منصة جملة">
        <div><span><Truck aria-hidden="true" /></span><p><strong>توريد أسهل</strong><small>قارن المنتجات من مكان واحد</small></p></div>
        <div><span><BadgePercent aria-hidden="true" /></span><p><strong>أسعار جملة واضحة</strong><small>اعرف سعر الجملة والتجزئة</small></p></div>
        <div><span><ShieldCheck aria-hidden="true" /></span><p><strong>موردون معتمدون</strong><small>الكتالوج يعرض المنتجات المنشورة</small></p></div>
      </section>

      <section className="products-section shell" aria-labelledby="featured-products-title">
        <SectionHeading title="منتجات مميزة" action="تصفح الكتالوج" to="/categories" />
        {productsError ? <DataError /> : productsLoading ? <LoadingMessage label="جارٍ تحميل المنتجات" /> : (
          <ProductGrid products={products ?? []} emptyTitle="الكتالوج يستقبل منتجاته الأولى" emptyBody="تُعرض المنتجات هنا بعد مراجعتها واعتمادها من فريق جملة." />
        )}
      </section>

      <section className="brands-section shell" aria-labelledby="partners-title">
        <div className="brands-heading"><h2 id="partners-title">شركاؤنا من الموردين</h2><Link to="/suppliers">انضم إلى شبكة الموردين <ArrowLeft aria-hidden="true" /></Link></div>
        {suppliers?.length ? (
          <div className="brand-strip" aria-label="الموردون المعتمدون">
            {suppliers.slice(0, 8).map((supplier) => <div key={supplier.id} className="brand-tile">{supplier.company_name}</div>)}
          </div>
        ) : (
          <div className="partner-empty"><span>شبكة التوريد تبدأ بموردين مثلك</span><Link to="/suppliers">سجّل كمورد</Link></div>
        )}
      </section>
    </>
  )
}
