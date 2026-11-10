'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, LockKeyhole, Mail, Phone, Store, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SupplierSignUpPage() {
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [commercialRegister, setCommercialRegister] = useState('')
  const [vatNumber, setVatNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const confirmationUrl = new URL('/auth/callback', window.location.origin)
      confirmationUrl.searchParams.set('next', '/auth/login')
      const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      const emailRedirectTo = isLocalDevelopment
        ? process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? confirmationUrl.toString()
        : confirmationUrl.toString()
      const { error } = await createClient().auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo,
          data: {
            account_type: 'supplier',
            full_name: fullName.trim(),
            phone: phone.trim(),
            company_name: companyName.trim(),
            commercial_register: commercialRegister.trim(),
            vat_number: vatNumber.trim(),
          },
        },
      })

      if (error) {
        const message = error.message.toLowerCase()
        setErrorMessage(message.includes('already registered')
          ? 'هذا البريد مسجّل بالفعل. يمكنك تسجيل الدخول بدلاً من ذلك.'
          : message.includes('password')
            ? 'اختر كلمة مرور أقوى من 8 أحرف.'
            : message.includes('rate limit') || message.includes('too many requests')
              ? 'تم تجاوز عدد رسائل التأكيد المسموح به مؤقتاً. حاول بعد قليل.'
              : 'تعذر إرسال طلبك الآن. تحقق من البيانات وحاول مجدداً.')
        return
      }

      setSubmitted(true)
    } catch {
      setErrorMessage('حدث خطأ غير متوقع أثناء إرسال الطلب. حاول مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="jumla-auth-page" dir="rtl">
        <section className="jumla-auth-card" aria-labelledby="signup-success-title">
          <Link className="jumla-auth-brand" href="/" aria-label="العودة إلى متجر جملة">
            <span className="jumla-auth-mark">ج</span><span><strong>جملة</strong><small>بوابة الموردين والإدارة</small></span>
          </Link>
          <div className="jumla-auth-success">
            <span className="jumla-auth-icon is-success"><CheckCircle2 aria-hidden="true" /></span>
            <p className="management-eyebrow">استلمنا طلبك</p>
            <h1 id="signup-success-title">تحقق من بريدك الإلكتروني</h1>
            <p>أرسلنا رسالة تأكيد إلى <strong dir="ltr">{email}</strong>. بعد تأكيد البريد، سيبقى حساب المورد قيد المراجعة حتى تتم الموافقة عليه.</p>
            <Link className="management-primary-button" href="/auth/login">الانتقال لتسجيل الدخول</Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="jumla-auth-page" dir="rtl">
      <section className="jumla-auth-card jumla-auth-card-wide" aria-labelledby="signup-title">
        <Link className="jumla-auth-brand" href="/" aria-label="العودة إلى متجر جملة">
          <span className="jumla-auth-mark">ج</span><span><strong>جملة</strong><small>بوابة الموردين والإدارة</small></span>
        </Link>
        <div className="jumla-auth-heading">
          <span className="jumla-auth-icon"><Store aria-hidden="true" /></span>
          <p className="management-eyebrow">انضم إلى شبكة التوريد</p>
          <h1 id="signup-title">طلب تسجيل مورد</h1>
          <p>أنشئ حساب منشأتك لبدء مراجعة طلب الانضمام من فريق جملة.</p>
        </div>
        <form className="jumla-auth-form management-form-grid" onSubmit={handleSubmit}>
          {errorMessage && <p className="management-alert is-error form-full" role="alert"><AlertCircle aria-hidden="true" />{errorMessage}</p>}
          <label className="management-field">
            <span>اسم مسؤول التواصل</span>
            <span className="management-input-wrap"><UserRound aria-hidden="true" /><input autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} /></span>
          </label>
          <label className="management-field">
            <span>اسم المنشأة</span>
            <span className="management-input-wrap"><Building2 aria-hidden="true" /><input autoComplete="organization" required value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></span>
          </label>
          <label className="management-field">
            <span>رقم الجوال</span>
            <span className="management-input-wrap"><Phone aria-hidden="true" /><input type="tel" autoComplete="tel" inputMode="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} /></span>
          </label>
          <label className="management-field">
            <span>السجل التجاري <small>اختياري</small></span>
            <span className="management-input-wrap"><input value={commercialRegister} onChange={(event) => setCommercialRegister(event.target.value)} /></span>
          </label>
          <label className="management-field">
            <span>الرقم الضريبي <small>اختياري</small></span>
            <span className="management-input-wrap"><input value={vatNumber} onChange={(event) => setVatNumber(event.target.value)} /></span>
          </label>
          <label className="management-field">
            <span>البريد الإلكتروني</span>
            <span className="management-input-wrap"><Mail aria-hidden="true" /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></span>
          </label>
          <label className="management-field form-full">
            <span>كلمة المرور</span>
            <span className="management-input-wrap"><LockKeyhole aria-hidden="true" /><input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></span>
          </label>
          <p className="management-form-note form-full">لن تظهر منتجاتك للمتسوقين قبل اعتماد طلب المورد وموافقة المشرف على كل منتج.</p>
          <button className="management-primary-button form-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'جارٍ إرسال الطلب...' : 'إرسال طلب الانضمام'}</button>
        </form>
        <div className="jumla-auth-links"><p>لديك حساب؟ <Link href="/auth/login">تسجيل الدخول</Link></p><Link href="/" className="management-text-link">العودة للمتجر <ArrowLeft aria-hidden="true" /></Link></div>
      </section>
    </main>
  )
}
