'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { CatalogImage, ProductCard, type Product } from '@/components/jumla-storefront'
import { useMarketplaceCatalog } from '@/lib/marketplace'

const packagingUnits = ['الكل', 'كرتون', 'شد', 'كيس', 'صندوق']

export function CategoriesPage({ onAdd }: { onAdd: (product: Product, quantity?: number) => void }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories, products, isLoading, error } = useMarketplaceCatalog()
  const search = searchParams.get('search') ?? ''
  const selectedCategory = searchParams.get('category') ?? 'all'
  const selectedUnit = searchParams.get('unit') ?? 'all'

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value === 'all' || value === '') next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  const visibleProducts = products.filter((product) => {
    const searchableText = `${product.name} ${product.description} ${product.supplier}`.toLocaleLowerCase('ar')
    const matchesSearch = searchableText.includes(search.trim().toLocaleLowerCase('ar'))
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
    const matchesUnit = selectedUnit === 'all' || product.packagingUnit.trim().startsWith(selectedUnit)
    return matchesSearch && matchesCategory && matchesUnit
  })

  const selectedCategoryName = categories.find((category) => category.id === selectedCategory)?.name
  const localizedProductCount = new Intl.NumberFormat('ar-SA').format(visibleProducts.length)

  return (
    <main className="route-page catalog-page" dir="rtl">
      <section className="route-hero shell">
        <p className="page-kicker">تسوّق أذكى، ووفّر أكثر</p>
        <h1>الأقسام والتسوق</h1>
        <p>تصفّح تسعة أقسام بالجملة، وابحث عن وحدة التعبئة التي تناسب نشاطك.</p>
      </section>

      <section className="shell category-browser" aria-labelledby="category-browser-title">
        <div className="page-section-heading">
          <div>
            <p className="page-kicker">تسوق حسب احتياجك</p>
            <h2 id="category-browser-title">الأقسام الرئيسية</h2>
          </div>
          <button className={`filter-chip${selectedCategory === 'all' ? ' is-selected' : ''}`} type="button" aria-pressed={selectedCategory === 'all'} onClick={() => updateFilter('category', 'all')}>كل الأقسام</button>
        </div>
        {isLoading ? <p className="no-results" role="status">جارٍ تحميل الأقسام...</p> : error ? <p className="no-results" role="status">تعذر تحميل الأقسام حالياً.</p> : <div className="catalog-category-grid">
          {categories.map((category) => {
            const itemCount = products.filter((product) => product.categoryId === category.id).length
            const isSelected = selectedCategory === category.id
            return (
              <button className={`catalog-category-option${isSelected ? ' is-selected' : ''}`} key={category.id} type="button" aria-pressed={isSelected} onClick={() => updateFilter('category', category.id)}>
                <CatalogImage position={category.image} className="catalog-category-image" alt={`صورة قسم ${category.name}`} />
                <span className="catalog-category-copy"><strong>{category.name}</strong><small>عدد المنتجات: {new Intl.NumberFormat('ar-SA').format(itemCount)}</small></span>
              </button>
            )
          })}
        </div>}
      </section>

      <section className="shell catalog-listing" aria-labelledby="catalog-products-title">
        <div className="page-section-heading catalog-listing-heading">
          <div>
            <p className="page-kicker">تشكيلة جملة</p>
            <h2 id="catalog-products-title">{selectedCategoryName ?? 'كل المنتجات'}</h2>
          </div>
          <span className="results-count">عدد المنتجات: {localizedProductCount}</span>
        </div>

        <div className="catalog-controls">
          <label className="page-search">
            <Search aria-hidden="true" />
            <span className="sr-only">ابحث في المنتجات</span>
            <input value={search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="ابحث عن منتج أو مورد..." />
          </label>
          <div className="unit-filter" role="group" aria-label="تصفية حسب وحدة التعبئة">
            <span className="unit-filter-label"><SlidersHorizontal aria-hidden="true" /> وحدة التعبئة</span>
            {packagingUnits.map((unit) => {
              const value = unit === 'الكل' ? 'all' : unit
              const selected = selectedUnit === value
              return <button className={`filter-chip${selected ? ' is-selected' : ''}`} key={unit} type="button" aria-pressed={selected} onClick={() => updateFilter('unit', value)}>{unit}</button>
            })}
          </div>
        </div>

        {isLoading ? <p className="no-results" role="status">جارٍ تحميل المنتجات...</p> : error ? <p className="no-results" role="status">تعذر تحميل المنتجات حالياً. حاول تحديث الصفحة.</p> : visibleProducts.length > 0 ? (
          <div className="product-grid catalog-product-grid">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}
          </div>
        ) : (
          <div className="no-results catalog-empty-state"><Search aria-hidden="true" /><p>لم نعثر على منتجات تطابق خياراتك.</p><button className="text-button" type="button" onClick={() => setSearchParams({}, { replace: true })}>مسح عوامل التصفية</button></div>
        )}
      </section>
    </main>
  )
}
