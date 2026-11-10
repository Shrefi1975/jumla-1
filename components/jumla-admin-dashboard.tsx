'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, BadgeCheck, Building2, Check, ClipboardList, LoaderCircle, LogOut, PackageCheck, Settings2, ShieldAlert, Store, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatSAR, useAdminOverview, useCurrentUser, useMarketplaceCatalog, useSuperAdmin } from '@/lib/marketplace'
import type { Category, ProductRecord, SupplierRecord } from '@/lib/marketplace'

type DashboardTab = 'suppliers' | 'products' | 'settings'

function AdminAccessMessage({ title, description, showLogin = false }: { title: string; description: string; showLogin?: boolean }) {
  return <main className="jumla-auth-page" dir="rtl"><section className="jumla-auth-card jumla-auth-success"><span className="jumla-auth-icon"><ShieldAlert aria-hidden="true" /></span><p className="management-eyebrow">إدارة المنصة</p><h1>{title}</h1><p>{description}</p>{showLogin && <Link className="management-primary-button" href="/login?next=%2Fadmin%2Fdashboard">تسجيل دخول المشرف</Link>}<Link className="management-text-link" href="/">العودة إلى المتجر <ArrowLeft aria-hidden="true" /></Link></section></main>
}

function AdminShell({ children, activeTab, onSelectTab }: { children: React.ReactNode; activeTab: DashboardTab; onSelectTab: (tab: DashboardTab) => void }) {
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <main className="jumla-management" dir="rtl">
      <header className="management-topbar">
        <Link className="management-brand" href="/" aria-label="العودة إلى جملة"><span className="management-brand-mark">ج</span><span><strong>جملة</strong><small>إدارة المنصة</small></span></Link>
        <div className="management-topbar-actions"><span className="management-admin-pill"><BadgeCheck aria-hidden="true" /> مشرف موثّق</span><button className="management-quiet-button" type="button" onClick={signOut}><LogOut aria-hidden="true" /><span>تسجيل الخروج</span></button></div>
      </header>
      <div className="management-frame">
        <aside className="management-sidebar" aria-label="قائمة إدارة المنصة">
          <p className="management-sidebar-label">إدارة جملة</p>
          <button className={`management-nav-link${activeTab === 'suppliers' ? ' is-active' : ''}`} type="button" aria-pressed={activeTab === 'suppliers'} onClick={() => onSelectTab('suppliers')}><Building2 aria-hidden="true" /> الموردون</button>
          <button className={`management-nav-link${activeTab === 'products' ? ' is-active' : ''}`} type="button" aria-pressed={activeTab === 'products'} onClick={() => onSelectTab('products')}><PackageCheck aria-hidden="true" /> المنتجات</button>
          <button className={`management-nav-link${activeTab === 'settings' ? ' is-active' : ''}`} type="button" aria-pressed={activeTab === 'settings'} onClick={() => onSelectTab('settings')}><Settings2 aria-hidden="true" /> إعدادات المنصة</button>
          <Link className="management-nav-link" href="/"><ArrowLeft aria-hidden="true" /> العودة للمتجر</Link>
          <div className="management-sidebar-note"><ShieldAlert aria-hidden="true" /><span>قرارات الاعتماد والنشر تطبق مباشرة على سياسات قاعدة البيانات.</span></div>
        </aside>
        <section className="management-content">{children}</section>
      </div>
    </main>
  )
}

export function AdminDashboard() {
  const { user, isLoading, error } = useCurrentUser()
  const { data: isSuperAdmin, isLoading: isCheckingAdmin, error: adminError } = useSuperAdmin(user?.id ?? null)

  if (isLoading || (user && isCheckingAdmin)) return <div className="management-state" role="status"><span className="management-spinner" aria-hidden="true" />جارٍ التحقق من الصلاحية...</div>
  if (error || adminError) return <AdminAccessMessage title="تعذر التحقق من صلاحية الحساب" description="لم نتمكن من تأكيد صلاحية المشرف. حاول مجدداً أو تواصل مع مسؤول المشروع." />
  if (!user) return <AdminAccessMessage title="تسجيل دخول المشرف مطلوب" description="هذه اللوحة مخصصة لحساب مشرف المنصة فقط." showLogin />
  if (isSuperAdmin !== true) return <AdminAccessMessage title="ليس لديك صلاحية الوصول" description="لوحة الإدارة متاحة حصرياً لحساب مشرف منصة جملة." />

  return <AdminWorkspace />
}

function AdminWorkspace() {
  const { data: overview, error, isLoading, mutate } = useAdminOverview()
  const { categories } = useMarketplaceCatalog()
  const [activeTab, setActiveTab] = useState<DashboardTab>('suppliers')
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState('')
  const pendingSuppliers = overview?.suppliers.filter((supplier) => supplier.status === 'pending').length ?? 0
  const pendingProducts = overview?.products.filter((product) => product.status === 'pending_approval').length ?? 0

  async function updateSupplier(supplier: SupplierRecord, status: SupplierRecord['status']) {
    setBusyId(supplier.id)
    setActionMessage('')
    setActionError('')
    const { error: updateError } = await createClient().from('suppliers').update({ status }).eq('id', supplier.id)
    setBusyId('')
    if (updateError) {
      setActionError('تعذر تحديث حالة المورد. تحقق من صلاحية الحساب ثم حاول مجدداً.')
      return
    }
    setActionMessage(status === 'approved' ? `تم اعتماد ${supplier.company_name}.` : `تم رفض طلب ${supplier.company_name}.`)
    await mutate()
  }

  async function updateProduct(product: ProductRecord, status: ProductRecord['status']) {
    setBusyId(product.id)
    setActionMessage('')
    setActionError('')
    const payload = status === 'published' ? { status, is_active: true } : { status, is_active: false }
    const { error: updateError } = await createClient().from('products').update(payload).eq('id', product.id)
    setBusyId('')
    if (updateError) {
      setActionError('تعذر تحديث حالة المنتج. تحقق من صلاحية الحساب ثم حاول مجدداً.')
      return
    }
    setActionMessage(status === 'published' ? `تم نشر ${product.title} في المتجر.` : `تم إرجاع ${product.title} للمراجعة.`)
    await mutate()
  }

  if (isLoading) return <div className="management-state" role="status"><span className="management-spinner" aria-hidden="true" />جارٍ تحميل بيانات الإدارة...</div>
  if (error || !overview) return <AdminAccessMessage title="تعذر تحميل بيانات المنصة" description="تحقق من اتصال قاعدة البيانات ثم حدّث الصفحة." />

  return (
    <AdminShell activeTab={activeTab} onSelectTab={setActiveTab}>
      <div className="management-page-heading"><div><p className="management-eyebrow">نظرة عامة</p><h1>إدارة منصة جملة</h1><p>اعتماد الموردين، مراجعة المنتجات، وتحديث إعدادات الطلب.</p></div><span className="management-live-badge"><span /> متصل بقاعدة البيانات</span></div>
      <div className="management-stat-grid" aria-label="ملخص إدارة المنصة">
        <article className="management-stat-card"><span className="management-stat-icon is-amber"><Building2 aria-hidden="true" /></span><span>طلبات الموردين</span><strong>{pendingSuppliers}</strong><small>بانتظار المراجعة</small></article>
        <article className="management-stat-card"><span className="management-stat-icon is-blue"><ClipboardList aria-hidden="true" /></span><span>منتجات جديدة</span><strong>{pendingProducts}</strong><small>بانتظار الاعتماد</small></article>
        <article className="management-stat-card"><span className="management-stat-icon is-green"><Store aria-hidden="true" /></span><span>موردون معتمدون</span><strong>{overview.suppliers.filter((supplier) => supplier.status === 'approved').length}</strong><small>ضمن شبكة جملة</small></article>
      </div>

      <div className="management-tabs" role="group" aria-label="أقسام الإدارة">
        <button aria-pressed={activeTab === 'suppliers'} className={activeTab === 'suppliers' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('suppliers')}>الموردون <span>{pendingSuppliers}</span></button>
        <button aria-pressed={activeTab === 'products'} className={activeTab === 'products' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('products')}>المنتجات <span>{pendingProducts}</span></button>
        <button aria-pressed={activeTab === 'settings'} className={activeTab === 'settings' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('settings')}>الإعدادات</button>
      </div>

      {(actionMessage || actionError) && <p className={`management-alert ${actionError ? 'is-error' : 'is-success'}`} role={actionError ? 'alert' : 'status'}>{actionError ? <AlertCircle aria-hidden="true" /> : <Check aria-hidden="true" />}{actionError || actionMessage}</p>}

      {activeTab === 'suppliers' && <section className="management-panel" id="suppliers" aria-labelledby="suppliers-title"><div className="management-panel-heading"><div><p className="management-eyebrow">مراجعة المنشآت</p><h2 id="suppliers-title">طلبات الموردين</h2><p>اعتماد الحسابات أو رفض الطلبات غير المكتملة.</p></div><span className="management-count-pill">{pendingSuppliers} قيد الانتظار</span></div>{overview.suppliers.length === 0 ? <div className="management-empty"><Building2 aria-hidden="true" /><strong>لا توجد طلبات موردين</strong><span>ستظهر الطلبات الجديدة هنا.</span></div> : <div className="management-table-scroll"><table className="management-table"><thead><tr><th scope="col">المنشأة</th><th scope="col">بيانات التسجيل</th><th scope="col">الحالة</th><th scope="col">تاريخ الطلب</th><th scope="col">الإجراء</th></tr></thead><tbody>{overview.suppliers.map((supplier) => <tr key={supplier.id}><th scope="row"><span className="management-product-title">{supplier.company_name}</span><small>رقم السجل: {supplier.commercial_register || '—'}</small></th><td><span>الرقم الضريبي: {supplier.vat_number || '—'}</span></td><td><span className={`management-status is-supplier-${supplier.status}`}>{supplier.status === 'pending' ? 'قيد المراجعة' : supplier.status === 'approved' ? 'معتمد' : 'مرفوض'}</span></td><td>{new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(supplier.created_at))}</td><td>{supplier.status === 'pending' ? <div className="management-row-actions"><button className="management-icon-button is-approve" type="button" disabled={busyId === supplier.id} onClick={() => void updateSupplier(supplier, 'approved')} aria-label={`اعتماد ${supplier.company_name}`}><Check aria-hidden="true" /></button><button className="management-icon-button is-reject" type="button" disabled={busyId === supplier.id} onClick={() => void updateSupplier(supplier, 'rejected')} aria-label={`رفض ${supplier.company_name}`}><X aria-hidden="true" /></button></div> : <span className="management-muted">—</span>}</td></tr>)}</tbody></table></div>}</section>}

      {activeTab === 'products' && <section className="management-panel" id="products" aria-labelledby="products-title"><div className="management-panel-heading"><div><p className="management-eyebrow">مراجعة المحتوى</p><h2 id="products-title">مراجعة المنتجات</h2><p>المنتجات المنشورة فقط تظهر في واجهة التسوق العامة.</p></div><span className="management-count-pill">{pendingProducts} قيد المراجعة</span></div>{overview.products.length === 0 ? <div className="management-empty"><PackageCheck aria-hidden="true" /><strong>لا توجد منتجات مضافة</strong><span>ستظهر المنتجات المقدمة من الموردين هنا.</span></div> : <div className="management-table-scroll"><table className="management-table"><thead><tr><th scope="col">المنتج</th><th scope="col">المورد والقسم</th><th scope="col">السعر</th><th scope="col">الحالة</th><th scope="col">الإجراء</th></tr></thead><tbody>{overview.products.map((product) => { const supplier = overview.suppliers.find((item) => item.id === product.supplier_id); const category = categories.find((item: Category) => item.id === product.category_id); return <tr key={product.id}><th scope="row"><div className="management-product-cell">{product.image_url && <img className="management-product-thumb" src={product.image_url} alt={`صورة ${product.title}`} loading="lazy" decoding="async" />}<div><span className="management-product-title">{product.title}</span><small>{product.packaging_unit} · الحد الأدنى {product.min_order_quantity}</small></div></div></th><td><span>{supplier?.company_name ?? 'مورد غير معروف'}</span><small>{category?.name ?? 'قسم غير معروف'}</small></td><td><strong>{formatSAR(Number(product.wholesale_price))} ر.س</strong><small>تجزئة {formatSAR(Number(product.retail_price))} ر.س</small></td><td><span className={`management-status is-${product.status}`}>{product.status === 'pending_approval' ? 'قيد المراجعة' : product.status === 'published' ? 'منشور' : 'مرفوض'}</span></td><td>{product.status === 'pending_approval' ? <div className="management-row-actions"><button className="management-icon-button is-approve" type="button" disabled={busyId === product.id} onClick={() => void updateProduct(product, 'published')} aria-label={`نشر ${product.title}`}><Check aria-hidden="true" /></button><button className="management-icon-button is-reject" type="button" disabled={busyId === product.id} onClick={() => void updateProduct(product, 'rejected')} aria-label={`رفض ${product.title}`}><X aria-hidden="true" /></button></div> : <span className="management-muted">—</span>}</td></tr>})}</tbody></table></div>}</section>}

      {activeTab === 'settings' && <SettingsPanel settings={overview.settings} onSaved={() => mutate()} />}
    </AdminShell>
  )
}

function SettingsPanel({ settings, onSaved }: { settings: { id: number; admin_whatsapp: string; min_order_value: number | string; platform_fee_percentage: number | string; updated_at: string } | null; onSaved: () => Promise<unknown> }) {
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!settings) {
      setErrorMessage('لم يتم العثور على سجل إعدادات المنصة.')
      return
    }
    setIsSaving(true)
    setMessage('')
    setErrorMessage('')
    const form = new FormData(event.currentTarget)
    const adminWhatsapp = String(form.get('admin_whatsapp') ?? '').trim()
    const minOrderValue = Number(form.get('min_order_value'))
    const platformFeePercentage = Number(form.get('platform_fee_percentage'))

    const phoneDigits = adminWhatsapp.replace(/\D/g, '')
    const validSaudiMobile = /^05\d{8}$/.test(phoneDigits) || /^9665\d{8}$/.test(phoneDigits) || /^009665\d{8}$/.test(phoneDigits)
    if (!validSaudiMobile || !Number.isFinite(minOrderValue) || minOrderValue < 0 || !Number.isFinite(platformFeePercentage) || platformFeePercentage < 0 || platformFeePercentage > 100) {
      setErrorMessage('تحقق من رقم واتساب والحد الأدنى ونسبة الرسوم.')
      setIsSaving(false)
      return
    }

    const { error } = await createClient().from('platform_settings').update({
      admin_whatsapp: adminWhatsapp,
      min_order_value: minOrderValue,
      platform_fee_percentage: platformFeePercentage,
      updated_at: new Date().toISOString(),
    }).eq('id', settings.id)

    setIsSaving(false)
    if (error) {
      setErrorMessage('تعذر حفظ الإعدادات. تحقق من صلاحية المشرف ثم حاول مجدداً.')
      return
    }
    setMessage('تم حفظ إعدادات المنصة.')
    await onSaved()
  }

  return <section className="management-panel" id="panel-settings" role="tabpanel" aria-labelledby="tab-settings"><div className="management-panel-heading"><div><p className="management-eyebrow">خيارات المنصة</p><h2 id="settings">إعدادات الطلب والتواصل</h2><p>تنعكس هذه القيم على ملخص السلة ورسائل واتساب.</p></div></div>{!settings ? <p className="management-alert is-error"><AlertCircle aria-hidden="true" />لم يتم العثور على إعدادات المنصة.</p> : <form className="management-form-grid management-settings-form" onSubmit={handleSave}><label className="management-field"><span>رقم واتساب الإدارة</span><input name="admin_whatsapp" type="tel" inputMode="tel" autoComplete="tel" required defaultValue={settings.admin_whatsapp} /></label><label className="management-field"><span>الحد الأدنى للطلب <small>ر.س</small></span><input name="min_order_value" type="number" min="0" step="0.01" required defaultValue={Number(settings.min_order_value)} /></label><label className="management-field"><span>رسوم المنصة <small>%</small></span><input name="platform_fee_percentage" type="number" min="0" max="100" step="0.01" required defaultValue={Number(settings.platform_fee_percentage)} /></label>{(message || errorMessage) && <p className={`management-alert form-full ${errorMessage ? 'is-error' : 'is-success'}`} role={errorMessage ? 'alert' : 'status'}>{errorMessage ? <AlertCircle aria-hidden="true" /> : <Check aria-hidden="true" />}{errorMessage || message}</p>}<button className="management-primary-button form-full" type="submit" disabled={isSaving}>{isSaving ? <><LoaderCircle aria-hidden="true" className="management-spin" /> جارٍ الحفظ...</> : 'حفظ الإعدادات'}</button></form>}</section>
}
