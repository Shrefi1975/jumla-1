'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, LockKeyhole, Mail, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function safeNextPath(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') && !value.startsWith('/admin')
    ? value
    : '/supplier/dashboard'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        setErrorMessage(error.message.includes('Email not confirmed')
          ? 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.'
          : 'تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور ثم حاول مجدداً.')
        return
      }

      const { data: isSuperAdmin, error: accessError } = await supabase.rpc('ensure_super_admin_access')
      if (accessError) {
        await supabase.auth.signOut()
        setErrorMessage('تعذر التحقق من صلاحيات الحساب. حاول مرة أخرى.')
        return
      }

      const requestedNext = new URLSearchParams(window.location.search).get('next')
      router.replace(isSuperAdmin ? '/admin/dashboard' : safeNextPath(requestedNext))
      router.refresh()
    } catch {
      setErrorMessage('حدث خطأ غير متوقع أثناء تسجيل الدخول. حاول مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="jumla-auth-page" dir="rtl">
      <section className="jumla-auth-card" aria-labelledby="login-title">
        <Link className="jumla-auth-brand" href="/" aria-label="العودة إلى متجر جملة">
          <span className="jumla-auth-mark">ج</span>
          <span><strong>جملة</strong><small>بوابة الموردين والإدارة</small></span>
        </Link>
        <div className="jumla-auth-heading">
          <span className="jumla-auth-icon"><Store aria-hidden="true" /></span>
          <p className="management-eyebrow">أهلاً بعودتك</p>
          <h1 id="login-title">تسجيل الدخول</h1>
          <p>ادخل إلى مساحة عمل المورد أو لوحة إدارة المنصة.</p>
        </div>
        <form className="jumla-auth-form" onSubmit={handleSubmit}>
          {errorMessage && <p className="management-alert is-error" role="alert"><AlertCircle aria-hidden="true" />{errorMessage}</p>}
          <label className="management-field">
            <span>البريد الإلكتروني</span>
            <span className="management-input-wrap"><Mail aria-hidden="true" /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></span>
          </label>
          <label className="management-field">
            <span>كلمة المرور</span>
            <span className="management-input-wrap"><LockKeyhole aria-hidden="true" /><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></span>
          </label>
          <button className="management-primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'جارٍ التحقق...' : 'دخول آمن'}</button>
        </form>
        <div className="jumla-auth-links">
          <p>لست مورّداً بعد؟ <Link href="/auth/sign-up">قدّم طلب انضمام</Link></p>
          <Link href="/admin/dashboard" className="management-text-link">دخول مشرف المنصة <ArrowLeft aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  )
}
