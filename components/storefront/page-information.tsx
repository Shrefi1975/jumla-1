"use client"

import { useEffect, useState, type FormEvent } from "react"
import useSWR from "swr"
import { Link } from "react-router-dom"
import { ArrowLeft, Building2, CheckCircle2, Clock3, MapPin, Phone, ShieldCheck, Store, UploadCloud } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { uploadProductImage } from "@/lib/product-image"
import type { SupplierRow } from "@/lib/supabase/database.types"
import { useApprovedSuppliers, useCategories } from "./data"
import { DataError, LoadingMessage, PageBanner } from "./shared"

function getAuthMessage(error: { code?: string; message: string }) {
  const code = error.code ?? ""
  const message = error.message.toLowerCase()
  if (code === "invalid_credentials" || message.includes("invalid login credentials")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة."
  if (code === "weak_password" || message.includes("password should")) return "اختر كلمة مرور أقوى لا تقل عن ٨ أحرف."
  if (code.includes("rate") || message.includes("too many requests")) return "وصلت إلى حد المحاولات المسموح. انتظر قليلاً ثم أعد المحاولة."
  if (code === "email_address_invalid" || message.includes("invalid email")) return "تحقق من صيغة البريد الإلكتروني."
  if (code === "user_already_exists" || message.includes("already registered")) return "تعذر التسجيل بهذا البريد. جرّب تسجيل الدخول أو استخدم بريداً آخر."
  return "تعذر إكمال الطلب الآن. تحقق من البيانات وحاول مرة أخرى."
}

export function SuppliersPage() {
  const { data: suppliers, isLoading, error } = useApprovedSuppliers()
  const { data: categories } = useCategories()
  const supabase = createClient()
  const { data: user, isLoading: authLoading, mutate: refreshUser } = useSWR<User | null>("jumla-auth-user", async () => {
    const { data, error: authError } = await supabase.auth.getUser()
    return authError ? null : data.user
  }, { revalidateOnFocus: false })
  const { data: ownSupplier, isLoading: supplierLoading, mutate: refreshSupplier } = useSWR<SupplierRow | null>(
    user ? ["jumla-own-supplier", user.id] : null,
    async () => {
      const { data, error: supplierError } = await supabase.from("suppliers").select("*").eq("user_id", user?.id ?? "").maybeSingle()
      if (supplierError) throw supplierError
      return data
    },
  )

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void refreshUser() })
    return () => subscription.unsubscribe()
  }, [supabase, refreshUser])

  async function signOut() {
    await supabase.auth.signOut()
    await refreshUser(null, { revalidate: true })
  }

  return (
    <>
      <PageBanner eyebrow="شبكة التوريد" title="الموردون" description="اكتشف شركاء جملة المعتمدين، أو ابدأ طلب الانضمام إلى شبكة جملة." />
      <section className="page-section shell">
        <div className="supplier-intro-grid">
          <div className="supplier-intro-copy"><p className="page-kicker">للمصانع والموزعين</p><h2>اعرض منتجاتك أمام مشترين جادين</h2><p>أرسل بيانات منشأتك للمراجعة. بعد اعتماد الحساب، يمكنك إضافة المنتجات ورفع صور موحدة للكتالوج.</p><a href="#join" className="primary-action">ابدأ التسجيل <ArrowLeft aria-hidden="true" /></a></div>
          <div className="supplier-process"><div><span>١</span><p><strong>سجّل بيانات المنشأة</strong><small>بيانات التواصل والسجل التجاري</small></p></div><div><span>٢</span><p><strong>مراجعة فريق جملة</strong><small>حساب المورد يبدأ بحالة قيد المراجعة</small></p></div><div><span>٣</span><p><strong>أضف المنتجات</strong><small>بعد الاعتماد، ارفع منتجاتك للكتالوج</small></p></div></div>
        </div>
      </section>

      <section className="page-section shell" aria-labelledby="supplier-list-title">
        <div className="section-heading"><h2 id="supplier-list-title">الموردون المعتمدون</h2></div>
        {error ? <DataError /> : isLoading ? <LoadingMessage label="جارٍ تحميل الموردين" /> : suppliers?.length ? (
          <div className="supplier-grid">{suppliers.map((supplier) => <article className="supplier-card" key={supplier.id}><span className="supplier-card-icon"><Building2 aria-hidden="true" /></span><div><p>مورد معتمد</p><h3>{supplier.company_name}</h3></div><ShieldCheck aria-label="مورد معتمد" className="supplier-verified" /></article>)}</div>
        ) : <div className="empty-state"><Store aria-hidden="true" /><h3>لا يوجد موردون منشورون بعد</h3><p>سيظهر الموردون هنا بعد إتمام مراجعة طلباتهم.</p></div>}
      </section>

      <section id="join" className="page-section supplier-join-section">
        <div className="shell supplier-join-grid">
          <div><p className="page-kicker">انضم إلينا</p><h2>ابدأ طلب التسجيل كمورد</h2><p>يُنشأ الحساب بصلاحية عميل، ثم يُراجع طلب المورد قبل فتح صلاحيات إدارة المنتجات.</p><ul className="supplier-checklist"><li><CheckCircle2 aria-hidden="true" /> لا يمكن نشر المنتجات قبل الاعتماد</li><li><CheckCircle2 aria-hidden="true" /> صور المنتجات تُعالج إلى مقاس موحد</li><li><CheckCircle2 aria-hidden="true" /> حالة الطلب مرتبطة بحسابك</li></ul></div>
          <div className="form-card"><SupplierAccount user={user ?? null} authLoading={authLoading} supplier={ownSupplier ?? null} supplierLoading={supplierLoading} onRefreshSupplier={refreshSupplier} onSignOut={signOut} categories={categories ?? []} /></div>
        </div>
      </section>
    </>
  )
}

function SupplierAccount({ user, authLoading, supplier, supplierLoading, onRefreshSupplier, onSignOut, categories }: {
  user: User | null
  authLoading: boolean
  supplier: SupplierRow | null
  supplierLoading: boolean
  onRefreshSupplier: () => Promise<SupplierRow | null | undefined>
  onSignOut: () => Promise<void>
  categories: NonNullable<ReturnType<typeof useCategories>["data"]>
}) {
  const [mode, setMode] = useState<"register" | "signin">("register")
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [commercialRegister, setCommercialRegister] = useState("")
  const [vatNumber, setVatNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setNotice("")
    const supabase = createClient()

    if (user) {
      const { error } = await supabase.from("suppliers").insert({
        user_id: user.id,
        company_name: company.trim(),
        commercial_register: commercialRegister.trim() || null,
        vat_number: vatNumber.trim() || null,
      })
      if (error) setNotice("تعذر إرسال الطلب. تحقق من البيانات أو تواصل مع الدعم.")
      else {
        setNotice("تم استلام طلبك. سيظهر لك وضع المراجعة هنا بعد تحديث الصفحة.")
        await onRefreshSupplier()
      }
      setBusy(false)
      return
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) setNotice(getAuthMessage(error))
      else setNotice("تم تسجيل الدخول.")
      setBusy(false)
      return
    }

    const redirectTo = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          account_type: "supplier",
          full_name: fullName.trim(),
          phone: phone.trim(),
          company_name: company.trim(),
          commercial_register: commercialRegister.trim(),
          vat_number: vatNumber.trim(),
        },
      },
    })
    if (error) setNotice(getAuthMessage(error))
    else {
      setMode("signin")
      setNotice("تم إرسال رسالة تأكيد إلى بريدك. أكّد البريد ثم سجّل الدخول لمتابعة حالة الطلب.")
    }
    setBusy(false)
  }

  if (authLoading || (user && supplierLoading)) return <LoadingMessage label="جارٍ التحقق من حساب المورد" />

  if (user && supplier) {
    return (
      <div className="supplier-status-card">
        <div className={`status-icon status-${supplier.status}`}>
          {supplier.status === "approved" ? <CheckCircle2 aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
        </div>
        <p className="page-kicker">حساب المورد</p>
        <h3>{supplier.company_name}</h3>
        <p>{supplier.status === "approved" ? "تم اعتماد حسابك. يمكنك الآن إرسال منتجات جديدة للمراجعة." : supplier.status === "pending" ? "طلبك قيد المراجعة. ستتمكن من إضافة المنتجات بعد اعتماده." : "لم تتم الموافقة على الطلب حالياً. تواصل مع فريق جملة لمعرفة التفاصيل."}</p>
        {supplier.status === "approved" && <ProductSubmissionForm supplier={supplier} categories={categories} />}
        <button className="text-button" type="button" onClick={onSignOut}>تسجيل الخروج</button>
      </div>
    )
  }

  return (
    <form className="supplier-form" onSubmit={handleAccountSubmit}>
      <div className="form-mode-switch" role="tablist" aria-label="إدارة حساب المورد">
        <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "is-active" : ""} onClick={() => { setMode("register"); setNotice("") }}>تسجيل مورد</button>
        <button type="button" role="tab" aria-selected={mode === "signin"} className={mode === "signin" ? "is-active" : ""} onClick={() => { setMode("signin"); setNotice("") }}>لدي حساب</button>
      </div>
      {mode === "register" && <>
        <label>الاسم الكامل<input required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
        <label>رقم الجوال<input required autoComplete="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
        <label>اسم المنشأة<input required autoComplete="organization" value={company} onChange={(event) => setCompany(event.target.value)} /></label>
        <div className="form-row"><label>السجل التجاري<input value={commercialRegister} onChange={(event) => setCommercialRegister(event.target.value)} /></label><label>الرقم الضريبي<input value={vatNumber} onChange={(event) => setVatNumber(event.target.value)} /></label></div>
      </>}
      <label>البريد الإلكتروني<input required type="email" autoComplete="email" dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>كلمة المرور<input required type="password" minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} dir="ltr" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {notice && <p className="form-notice" role="status">{notice}</p>}
      <button className="primary-action form-submit" type="submit" disabled={busy}>{busy ? "جارٍ الإرسال..." : mode === "signin" ? "تسجيل الدخول" : user ? "إرسال طلب الانضمام" : "إنشاء حساب وطلب الانضمام"}</button>
      <p className="form-footnote">تُراجع طلبات الموردين قبل إتاحة إضافة المنتجات ونشرها.</p>
    </form>
  )
}

function ProductSubmissionForm({ supplier, categories }: { supplier: SupplierRow; categories: NonNullable<ReturnType<typeof useCategories>["data"]> }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "")
  const [packagingUnit, setPackagingUnit] = useState("كرتون")
  const [wholesalePrice, setWholesalePrice] = useState("")
  const [retailPrice, setRetailPrice] = useState("")
  const [minimum, setMinimum] = useState("1")
  const [expiryDate, setExpiryDate] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("")

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) {
      setNotice("أرفق صورة للمنتج قبل الإرسال.")
      return
    }
    setBusy(true)
    setNotice("")
    let uploadedPath = ""

    try {
      const image = await uploadProductImage(file)
      uploadedPath = image.path

      const supabase = createClient()
      const { error } = await supabase.from("products").insert({
        supplier_id: supplier.id,
        category_id: categoryId,
        title: title.trim(),
        description: description.trim(),
        packaging_unit: packagingUnit.trim(),
        expiry_date: expiryDate || null,
        image_url: image.publicUrl,
        wholesale_price: Number(wholesalePrice),
        retail_price: Number(retailPrice),
        min_order_quantity: Number(minimum),
      })
      if (error) {
        await supabase.storage.from("product-images").remove([uploadedPath])
        throw new Error("product_submission_failed")
      }

      setNotice("تم إرسال المنتج للمراجعة. سيظهر في الكتالوج بعد اعتماده.")
      setTitle("")
      setDescription("")
      setFile(null)
      event.currentTarget.reset()
    } catch {
      setNotice("تعذر إرسال المنتج الآن. تأكد من اتصالك وحاول مرة أخرى.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="product-upload-form" onSubmit={submitProduct}>
      <h4>إضافة منتج للمراجعة</h4>
      <label>اسم المنتج<input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label>وصف المنتج<textarea rows={3} maxLength={1000} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      <label>القسم<select required value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name_ar}</option>)}</select></label>
      <div className="form-row"><label>وحدة التعبئة<input required value={packagingUnit} onChange={(event) => setPackagingUnit(event.target.value)} placeholder="كرتون 12 حبة" /></label><label>الحد الأدنى<input required type="number" min="1" step="1" value={minimum} onChange={(event) => setMinimum(event.target.value)} /></label></div>
      <div className="form-row"><label>سعر الجملة<input required type="number" min="0.01" step="0.01" inputMode="decimal" value={wholesalePrice} onChange={(event) => setWholesalePrice(event.target.value)} /></label><label>سعر التجزئة<input required type="number" min="0.01" step="0.01" inputMode="decimal" value={retailPrice} onChange={(event) => setRetailPrice(event.target.value)} /></label></div>
      <label>تاريخ الصلاحية<input type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} /></label>
      <label className="upload-field"><span><UploadCloud aria-hidden="true" /> صورة المنتج · تُقصّ إلى ٨٠٠×٨٠٠ وتُضغط بصيغة WebP</span><input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
      {notice && <p className="form-notice" role="status">{notice}</p>}
      <button className="primary-action form-submit" type="submit" disabled={busy || !categories.length}>{busy ? "جارٍ رفع الصورة..." : "إرسال المنتج للمراجعة"}</button>
    </form>
  )
}

export function AboutPage() {
  return (
    <>
      <PageBanner eyebrow="قصتنا" title="من نحن" description="منصة سعودية تجعل التوريد بالجملة أوضح وأسهل للمطاعم والتجار والموردين." />
      <section className="page-section shell about-layout">
        <article className="about-card about-story"><p className="page-kicker">منصة جملة</p><h2>سوق واحد لعلاقات توريد أفضل</h2><p>تجمع جملة الموردين المعتمدين والمنتجات في كتالوج واحد، لتساعد أصحاب الأعمال على اكتشاف الخيارات ومقارنة أسعار الجملة قبل إرسال طلبهم.</p><p>نعمل على بناء تجربة عملية تعتمد على وضوح المعلومات ومراجعة الموردين والمنتجات قبل ظهورها للعملاء.</p><Link to="/categories" className="text-link">استكشف الكتالوج <ArrowLeft aria-hidden="true" /></Link></article>
        <aside className="about-card warehouse-card"><span className="warehouse-icon"><MapPin aria-hidden="true" /></span><p className="page-kicker">مقر عملياتنا</p><h2>مستودع جملة</h2><p>جدة، المملكة العربية السعودية</p><a href="https://wa.me/966597414858" target="_blank" rel="noreferrer"><Phone aria-hidden="true" /> تواصل مع فريق جملة</a></aside>
      </section>
      <section className="page-section shell values-grid"><div><ShieldCheck aria-hidden="true" /><h3>مراجعة الموردين</h3><p>يبدأ كل حساب مورد بحالة قيد المراجعة.</p></div><div><Building2 aria-hidden="true" /><h3>كتالوج واضح</h3><p>معلومات التعبئة والسعر والحد الأدنى للطلب في صفحة المنتج.</p></div><div><Store aria-hidden="true" /><h3>تواصل مباشر</h3><p>إرسال طلبات الشراء مباشرة إلى فريق جملة عبر واتساب.</p></div></section>
    </>
  )
}

export function ContactPage() {
  const { data: settings } = useSWR("jumla-contact-settings", async () => {
    const { data, error } = await createClient().from("platform_settings").select("admin_whatsapp").eq("id", 1).maybeSingle()
    if (error) throw error
    return data?.admin_whatsapp ?? "0597414858"
  }, { fallbackData: "0597414858" })
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState("استفسار عن المنتجات")
  const [message, setMessage] = useState("")
  const [notice, setNotice] = useState("")

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const digits = (settings ?? "0597414858").replace(/\D/g, "")
    const number = digits.startsWith("966") ? digits : digits.startsWith("0") ? `966${digits.slice(1)}` : digits
    const text = [`رسالة جديدة عبر منصة جملة`, `الاسم: ${name}`, `رقم التواصل: ${phone}`, `الموضوع: ${subject}`, `التفاصيل: ${message}`].join("\n")
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
    setNotice("تم تجهيز رسالتك في واتساب. أرسلها من التطبيق لإكمال التواصل.")
  }

  return (
    <>
      <PageBanner eyebrow="نحن هنا للمساعدة" title="تواصل معنا" description="أرسل استفسارك وسيتم فتح رسالة جاهزة إلى فريق جملة عبر واتساب." />
      <section className="page-section shell contact-layout">
        <div className="contact-details"><h2>يسعدنا تواصلك</h2><p>للاستفسارات عن المنتجات أو طلبات التوريد، تواصل مع فريقنا.</p><a href="https://wa.me/966597414858" target="_blank" rel="noreferrer"><Phone aria-hidden="true" /><span><strong>واتساب الدعم</strong><small>0597414858</small></span></a><div><MapPin aria-hidden="true" /><span><strong>عنوان المستودع</strong><small>جدة، المملكة العربية السعودية</small></span></div></div>
        <form className="form-card contact-form" onSubmit={submitContact}>
          <h2>أرسل رسالة</h2>
          <label>الاسم<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>رقم الجوال<input required autoComplete="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          <label>الموضوع<select value={subject} onChange={(event) => setSubject(event.target.value)}><option>استفسار عن المنتجات</option><option>التسجيل كمورد</option><option>طلب جملة</option><option>أخرى</option></select></label>
          <label>الرسالة<textarea required rows={5} value={message} onChange={(event) => setMessage(event.target.value)} /></label>
          {notice && <p className="form-notice" role="status">{notice}</p>}
          <button className="primary-action form-submit" type="submit">متابعة عبر واتساب</button>
        </form>
      </section>
    </>
  )
}
