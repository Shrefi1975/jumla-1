import { useDeferredValue } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useCategories, useProducts } from "./data"
import { DataError, LoadingMessage, PageBanner, ProductGrid } from "./shared"

const packagingFilters = ["كرتون", "شد", "كيس"]

export function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const categorySlug = searchParams.get("category") ?? ""
  const selectedCategory = categories?.find((category) => category.slug === categorySlug)
  const search = searchParams.get("search") ?? ""
  const deferredSearch = useDeferredValue(search)
  const packaging = searchParams.get("packaging") ?? ""
  const categoryReady = !categorySlug || Boolean(selectedCategory)
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts({
    categoryId: selectedCategory?.id,
    search: deferredSearch,
    packaging,
  }, categoryReady)

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  function clearFilters() {
    setSearchParams({}, { replace: true })
  }

  const hasFilters = Boolean(categorySlug || search || packaging)

  return (
    <>
      <PageBanner eyebrow="كتالوج جملة" title="الأقسام والتسوق" description="ابحث في المنتجات المنشورة، واختر وحدة التعبئة التي تناسب طلبك." />
      <section className="catalog-layout shell" aria-label="كتالوج المنتجات">
        <aside className="filter-panel">
          <div className="filter-panel-heading"><SlidersHorizontal aria-hidden="true" /><h2>تصفية المنتجات</h2></div>
          <label className="filter-label" htmlFor="catalog-search">ابحث عن منتج</label>
          <div className="catalog-search"><Search aria-hidden="true" /><input id="catalog-search" type="search" value={search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="اسم المنتج" /></div>
          <fieldset className="filter-group">
            <legend>الأقسام</legend>
            <button type="button" className={!categorySlug ? "filter-option is-selected" : "filter-option"} onClick={() => updateFilter("category", "")}>جميع الأقسام</button>
            {categoriesLoading && <span className="filter-hint">جارٍ تحميل الأقسام</span>}
            {categoriesError && <span className="filter-hint">تعذر تحميل الأقسام</span>}
            {(categories ?? []).map((category) => (
              <button key={category.id} type="button" className={categorySlug === category.slug ? "filter-option is-selected" : "filter-option"} onClick={() => updateFilter("category", category.slug)}>
                <span>{category.name_ar}</span>
              </button>
            ))}
          </fieldset>
          <fieldset className="filter-group">
            <legend>وحدة التعبئة</legend>
            <button type="button" className={!packaging ? "filter-option is-selected" : "filter-option"} onClick={() => updateFilter("packaging", "")}>الكل</button>
            {packagingFilters.map((option) => <button key={option} type="button" className={packaging === option ? "filter-option is-selected" : "filter-option"} onClick={() => updateFilter("packaging", option)}>{option}</button>)}
          </fieldset>
          {hasFilters && <button className="clear-filters" type="button" onClick={clearFilters}><X aria-hidden="true" /> مسح التصفية</button>}
        </aside>

        <div className="catalog-results">
          <div className="catalog-toolbar">
            <div><p className="page-kicker">{selectedCategory?.name_ar ?? "تسوق بالجملة"}</p><h2>{search ? `نتائج البحث عن «${search}»` : selectedCategory?.name_ar ?? "جميع المنتجات"}</h2></div>
            <span>{products?.length ?? 0} منتج</span>
          </div>
          {productsError ? <DataError /> : productsLoading || (categorySlug && !categoryReady) ? <LoadingMessage /> : (
            <ProductGrid products={products ?? []} emptyTitle="لم نعثر على منتجات مطابقة" emptyBody="جرّب تغيير كلمات البحث أو وحدة التعبئة، أو عد إلى جميع الأقسام." />
          )}
          <Link to="/suppliers" className="supplier-callout">هل تورد هذه المنتجات؟ <strong>انضم إلى الموردين المعتمدين</strong></Link>
        </div>
      </section>
    </>
  )
}

export function OffersPage() {
  const { data: products, isLoading, error } = useProducts({ limit: 100 })
  const discounted = (products ?? []).filter((product) => product.retail_price > product.wholesale_price)

  return (
    <>
      <PageBanner eyebrow="أسعار جملة" title="عروض خاصة" description="منتجات يكون سعر الجملة فيها أقل من سعر التجزئة المسجل في الكتالوج." />
      <section className="page-section shell">
        {error ? <DataError /> : isLoading ? <LoadingMessage label="جارٍ تحميل العروض" /> : (
          <ProductGrid products={discounted} emptyTitle="لا توجد عروض منشورة حالياً" emptyBody="تابع الكتالوج؛ ستظهر هنا المنتجات التي تحمل سعراً خاصاً بالجملة." />
        )}
      </section>
    </>
  )
}
