'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, Check, Clock3, ImagePlus, LogOut, Package, Pencil, Plus, ShieldCheck, Trash2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatSAR, useCurrentUser, useMarketplaceCatalog, useSupplierProducts, useSupplierRecord } from '@/lib/marketplace'
import type { Category, ProductRecord, SupplierRecord } from '@/lib/marketplace'

type DashboardUser = { id: string; email?: string }

const productStatusLabels: Record<ProductRecord['status'], string> = {
  pending_approval: 'قيد المراجعة',
  published: 'منشور',
  rejected: 'مرفوض',
}

async function createWebpImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('اختر ملف صورة صالحاً.')
  if (file.size > 15 * 1024 * 1024) throw new Error('حجم الصورة الأصلية يجب ألا يتجاوز 15 ميجابايت.')

  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const width = 1200
  const height = 900
  const scale = Math.max(width / bitmap.width, height / bitmap.height)
  const scaledWidth = bitmap.width * scale
  const scaledHeight = bitmap.height * scale
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('تعذر تجهيز الصورة في هذا المتصفح.')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(bitmap, (width - scaledWidth) / 2, (height - scaledHeight) / 2, scaledWidth, scaledHeight)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.84))
  if (!blob) throw new Error('تعذر تحويل الصورة إلى WebP.')
  if (blob.size > 5 * 1024 * 1024) throw new Error('الصورة بعد ضغطها أكبر من حد التخزين (5 ميجابايت).')
  return blob
}

function DashboardShell({ children, companyName }: { children: React.ReactNode; companyName?: string }) {
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/auth/login')
    router.refresh()
  }

  return (
    <main className="jumla-management" dir="rtl">
      <header className="management-topbar">
        <Link className="management-brand" href="/" aria-label="العودة إلى جملة"><span className="management-brand-mark">ج</span><span><strong>جملة</strong><small>بوابة الموردين</small></span></Link>
        <div className="management-topbar-actions"><span className="management-user-label">{companyName ?? 'مساحة المورد'}</span><button className="management-quiet-button" type="button" onClick={signOut}><LogOut aria-hidden="true" /><span>تسجيل الخروج</span></button></div>
      </header>
      <div className="management-frame">
        <aside className="management-sidebar" aria-label="قائمة المورد">
          <p className="management-sidebar-label">إدارة الحساب</p>
          <a className="management-nav-link is-active" href="#overview"><Package aria-hidden="true" /> المنتجات</a>
          <Link className="management-nav-link" href="/"><ArrowLeft aria-hidden="true" /> العودة للمتجر</Link>
          <div className="management-sidebar-note"><ShieldCheck aria-hidden="true" /><span>كل منتج جديد يخضع لمراجعة المشرف قبل ظهوره للعملاء.</span></div>
        </aside>
        <section className="management-content">{children}</section>
      </div>
    </main>
  )
}

function LoadingState({ label = 'جارٍ تحميل مساحة المورد...' }: { label?: string }) {
  return <div className="management-state" role="status"><span className="management-spinner" aria-hidden="true" />{label}</div>
}

function AccessState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <main className="jumla-auth-page" dir="rtl"><section className="jumla-auth-card jumla-auth-success"><span className="jumla-auth-icon"><ShieldCheck aria-hidden="true" /></span><p className="management-eyebrow">حساب المورد</p><h1>{title}</h1><p>{description}</p>{action}</section></main>
}

export function SupplierDashboard() {
  const { user, isLoading, error } = useCurrentUser()

  if (isLoading) return <LoadingState />
  if (error) return <AccessState title="تعذر التحقق من الجلسة" description="حدّث الصفحة أو سجّل الدخول من جديد." action={<Link className="management-primary-button" href="/auth/login">تسجيل الدخول</Link>} />
  if (!user) return <AccessState title="سجّل الدخول للمتابعة" description="مساحة العمل متاحة للموردين المعتمدين فقط." action={<Link className="management-primary-button" href="/auth/login?next=%2Fsupplier%2Fdashboard">دخول المورد</Link>} />

  return <SupplierStatusGate user={user} />
}

function SupplierStatusGate({ user }: { user: DashboardUser }) {
  const { data: supplier, isLoading, error } = useSupplierRecord(user.id)

  if (isLoading) return <LoadingState />
  if (error) return <AccessState title="تعذر تحميل ملف المورد" description="لم نتمكن من قراءة بيانات المورد. حاول مرة أخرى بعد تحديث الصفحة." />
  if (!supplier) return <AccessState title="لا يوجد طلب مورد لهذا الحساب" description="أنشئ طلب انضمام للموردين باستخدام البريد نفسه." action={<Link className="management-primary-button" href="/auth/sign-up">طلب الانضمام</Link>} />
  if (supplier.status !== 'approved') {
    const rejected = supplier.status === 'rejected'
    return <AccessState title={rejected ? 'طلب المورد غير معتمد' : 'طلبك قيد المراجعة'} description={rejected ? 'تواصل مع فريق جملة لمعرفة الخطوات التالية.' : 'سنفعّل لوحة المنتجات بعد اعتماد بيانات المنشأة. لا يمكن إضافة منتجات قبل الموافقة.'} action={<Link className="management-secondary-button" href="/">العودة للمتجر</Link>} />
  }

  return <SupplierWorkspace user={user} supplier={supplier} />
}

function SupplierWorkspace({ user, supplier }: { user: DashboardUser; supplier: SupplierRecord }) {
  const { data: products, isLoading, error, mutate } = useSupplierProducts(supplier.id)
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useMarketplaceCatalog()
  const [editing, setEditing] = useState<ProductRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [formError, setFormError] = useState('')
  const pendingCount = products?.filter((product) => product.status === 'pending_approval').length ?? 0
  const publishedCount = products?.filter((product) => product.status === 'published' && product.is_active).length ?? 0

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    setFormMessage('')
    setFormError('')
    setIsSubmitting(true)
    const supabase = createClient()
    let uploadedImagePath: string | null = null

    try {
      const form = new FormData(formElement)
      const title = String(form.get('title') ?? '').trim()
      const categoryId = String(form.get('category_id') ?? '')
      const description = String(form.get('description') ?? '').trim()
      const packagingUnit = String(form.get('packaging_unit') ?? '').trim()
      const expiryDateValue = String(form.get('expiry_date') ?? '')
      const wholesalePrice = Number(form.get('wholesale_price'))
      const retailPrice = Number(form.get('retail_price'))
      const minOrderQuantity = Number(form.get('min_order_quantity'))
      const imageFile = form.get('image')

      if (!title || !categoryId || !packagingUnit) throw new Error('أكمل الحقول المطلوبة قبل الحفظ.')
      if (!Number.isFinite(wholesalePrice) || wholesalePrice <= 0 || !Number.isFinite(retailPrice) || retailPrice <= 0) throw new Error('أدخل أسعاراً صحيحة أكبر من صفر.')
      if (!Number.isInteger(minOrderQuantity) || minOrderQuantity < 1) throw new Error('الحد الأدنى للطلب يجب أن يكون عدداً صحيحاً يبدأ من 1.')
      if (retailPrice < wholesalePrice) throw new Error('سعر التجزئة يجب ألا يقل عن سعر الجملة.')

      let imageUrl = editing?.image_url ?? null
      if (imageFile instanceof File && imageFile.size > 0) {
        const webp = await createWebpImage(imageFile)
        const path = `${user.id}/${crypto.randomUUID()}.webp`
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, webp, { contentType: 'image/webp', upsert: false })
        if (uploadError) throw new Error('تعذر رفع الصورة. تحقق من اتصالك ثم حاول مجدداً.')
        uploadedImagePath = path
        imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
      } else if (!imageUrl) {
        throw new Error('أضف صورة للمنتج قبل الإرسال.')
      }

      const payload = {
        supplier_id: supplier.id,
        category_id: categoryId,
        title,
        description,
        packaging_unit: packagingUnit,
        expiry_date: expiryDateValue || null,
        image_url: imageUrl,
        wholesale_price: wholesalePrice,
        retail_price: retailPrice,
        min_order_quantity: minOrderQuantity,
      }

      const result = editing
        ? await supabase.from('products').update(payload).eq('id', editing.id).eq('supplier_id', supplier.id)
        : await supabase.from('products').insert(payload)

      if (result.error) throw new Error('تعذر حفظ المنتج. تحقق من البيانات وصلاحية الحساب ثم حاول مجدداً.')
      uploadedImagePath = null
      await mutate()
      setEditing(null)
      setFormMessage(editing ? 'تم تحديث المنتج وإعادته للمراجعة.' : 'تم إرسال المنتج للمراجعة قبل نشره في المتجر.')
      formElement.reset()
    } catch (error) {
      if (uploadedImagePath) {
        await supabase.storage.from('product-images').remove([uploadedImagePath])
      }
      setFormError(error instanceof Error ? error.message : 'تعذر حفظ المنتج الآن.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function beginEdit(product: ProductRecord) {
    setEditing(product)
    setFormMessage('')
    setFormError('')
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <DashboardShell companyName={supplier.company_name}>
      <div id="overview" className="management-page-heading">
        <div><p className="management-eyebrow">مساحة المورد</p><h1>إدارة المنتجات</h1><p>أضف منتجات الجملة وتابع حالة مراجعتها ونشرها.</p></div>
        <a className="management-primary-button" href="#product-form"><Plus aria-hidden="true" /> منتج جديد</a>
      </div>

      <div className="management-stat-grid" aria-label="ملخص المنتجات">
        <article className="management-stat-card"><span className="management-stat-icon"><Package aria-hidden="true" /></span><span>إجمالي المنتجات</span><strong>{products?.length ?? 0}</strong></article>
        <article className="management-stat-card"><span className="management-stat-icon is-amber"><Clock3 aria-hidden="true" /></span><span>قيد المراجعة</span><strong>{pendingCount}</strong></article>
        <article className="management-stat-card"><span className="management-stat-icon is-green"><Check aria-hidden="true" /></span><span>منشور في المتجر</span><strong>{publishedCount}</strong></article>
      </div>

      <section className="management-panel" id="product-form" aria-labelledby="product-form-title">
        <div className="management-panel-heading"><div><p className="management-eyebrow">كتالوج المورد</p><h2 id="product-form-title">{editing ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}</h2><p>تُعاد المنتجات المعدّلة إلى قائمة المراجعة قبل عرضها.</p></div>{editing && <button type="button" className="management-secondary-button" onClick={() => setEditing(null)}>إلغاء التعديل</button>}</div>
        {categoriesError && <p className="management-alert is-error" role="alert"><AlertCircle aria-hidden="true" />تعذر تحميل الأقسام. لا يمكن إرسال منتج قبل اختيار قسم صالح.</p>}
        <form className="management-form-grid" key={editing?.id ?? 'new-product'} onSubmit={handleProductSubmit}>
          <label className="management-field"><span>اسم المنتج</span><input name="title" required maxLength={160} defaultValue={editing?.title ?? ''} /></label>
          <label className="management-field"><span>القسم</span><select name="category_id" required disabled={categoriesLoading || categories.length === 0} defaultValue={editing?.category_id ?? ''}><option value="" disabled>{categoriesLoading ? 'جارٍ تحميل الأقسام...' : 'اختر القسم'}</option>{categories.map((category: Category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="management-field form-full"><span>وصف المنتج</span><textarea name="description" rows={3} maxLength={1000} defaultValue={editing?.description ?? ''} /></label>
          <label className="management-field"><span>وحدة التعبئة</span><input name="packaging_unit" required maxLength={80} placeholder="كرتون 12 حبة، شد، كيس" defaultValue={editing?.packaging_unit ?? ''} /></label>
          <label className="management-field"><span>تاريخ الصلاحية <small>اختياري</small></span><input name="expiry_date" type="date" defaultValue={editing?.expiry_date ?? ''} /></label>
          <label className="management-field"><span>سعر الجملة <small>ر.س</small></span><input name="wholesale_price" type="number" inputMode="decimal" min="0.01" step="0.01" required defaultValue={editing ? Number(editing.wholesale_price) : ''} /></label>
          <label className="management-field"><span>سعر التجزئة <small>ر.س</small></span><input name="retail_price" type="number" inputMode="decimal" min="0.01" step="0.01" required defaultValue={editing ? Number(editing.retail_price) : ''} /></label>
          <label className="management-field"><span>الحد الأدنى للطلب</span><input name="min_order_quantity" type="number" inputMode="numeric" min="1" step="1" required defaultValue={editing?.min_order_quantity ?? 1} /></label>
          <label className="management-field management-upload-field"><span>صورة المنتج <small>{editing?.image_url ? 'يمكن تركها دون تغيير' : 'مطلوبة'}</small></span><span className="management-upload-control"><ImagePlus aria-hidden="true" /><span>{editing?.image_url ? 'اختر صورة بديلة' : 'اختر صورة من جهازك'}</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" required={!editing?.image_url} /></span><small>تُقص إلى 1200 × 900 بصيغة WebP، والحد الأقصى بعد الضغط 5 ميجابايت.</small></label>
          {(formError || formMessage) && <p className={`management-alert form-full ${formError ? 'is-error' : 'is-success'}`} role={formError ? 'alert' : 'status'}>{formError ? <AlertCircle aria-hidden="true" /> : <Check aria-hidden="true" />}{formError || formMessage}</p>}
          <button className="management-primary-button form-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'جارٍ الحفظ...' : editing ? 'حفظ التعديلات وإرسالها للمراجعة' : 'إرسال المنتج للمراجعة'}</button>
        </form>
      </section>

      <section className="management-panel" aria-labelledby="supplier-products-title">
        <div className="management-panel-heading"><div><p className="management-eyebrow">سجل المنتجات</p><h2 id="supplier-products-title">منتجاتي</h2><p>حالة كل منتج تظهر هنا بعد مراجعته من الإدارة.</p></div></div>
        {isLoading ? <div className="management-state"><span className="management-spinner" aria-hidden="true" />جارٍ تحميل المنتجات...</div> : error ? <p className="management-alert is-error"><AlertCircle aria-hidden="true" />تعذر تحميل المنتجات. حدّث الصفحة للمحاولة مجدداً.</p> : !products?.length ? <div className="management-empty"><Package aria-hidden="true" /><strong>لا توجد منتجات بعد</strong><span>أضف أول منتج من النموذج أعلاه.</span></div> : (
          <div className="management-table-scroll"><table className="management-table"><thead><tr><th scope="col">المنتج</th><th scope="col">التسعير</th><th scope="col">الحالة</th><th scope="col">آخر تحديث</th><th scope="col"><span className="sr-only">إجراء</span></th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><th scope="row"><span className="management-product-title">{product.title}</span><small>{product.packaging_unit} · الحد الأدنى {product.min_order_quantity}</small></th><td><strong>{formatSAR(Number(product.wholesale_price))} ر.س</strong><small>تجزئة {formatSAR(Number(product.retail_price))} ر.س</small></td><td><span className={`management-status is-${product.status}`}>{productStatusLabels[product.status]}</span>{product.status === 'published' && !product.is_active && <small>غير نشط</small>}</td><td>{new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(product.updated_at))}</td><td><button className="management-icon-button" type="button" onClick={() => beginEdit(product)} aria-label={`تعديل ${product.title}`}><Pencil aria-hidden="true" /></button></td></tr>)}</tbody></table></div>
        )}
      </section>
    </DashboardShell>
  )
}
