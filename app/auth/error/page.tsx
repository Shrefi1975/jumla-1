import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <main className="jumla-auth-page" dir="rtl">
      <section className="jumla-auth-card jumla-auth-success" aria-labelledby="auth-error-title">
        <span className="jumla-auth-icon is-error"><AlertCircle aria-hidden="true" /></span>
        <p className="management-eyebrow">تعذر التحقق</p>
        <h1 id="auth-error-title">انتهت صلاحية رابط التأكيد أو لم يعد صالحاً</h1>
        <p>اطلب رابطاً جديداً أو ارجع إلى تسجيل الدخول للمحاولة مرة أخرى.</p>
        <Link className="management-primary-button" href="/login">العودة إلى الدخول <ArrowLeft aria-hidden="true" /></Link>
      </section>
    </main>
  )
}
