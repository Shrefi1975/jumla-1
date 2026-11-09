'use client'

import { useState, type FormEvent } from 'react'
import { ArrowLeft, Factory, MapPin, PackageCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

const supplierGroups = [
  { name: 'مورد المواد الغذائية', specialty: 'الأرز والزيوت والمواد التموينية', city: 'جدة', icon: PackageCheck },
  { name: 'مورد المنتجات المجمدة', specialty: 'الدواجن والخضروات والمخبوزات', city: 'جدة', icon: Truck },
  { name: 'مورد الورقيات والتغليف', specialty: 'المناديل وعبوات الاستخدام الواحد', city: 'جدة', icon: Factory },
]

export function SuppliersPage() {
  const [registrationUrl, setRegistrationUrl] = useState('')

  function handleRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const message = [
      'طلب تسجيل مورد جديد في منصة جملة',
      `اسم المنشأة: ${formData.get('company')}`,
      `اسم مسؤول التواصل: ${formData.get('contact')}`,
      `رقم الجوال: ${formData.get('phone')}`,
      `التخصص: ${formData.get('specialty')}`,
      `المدينة: ${formData.get('city')}`,
    ].join('\n')
    setRegistrationUrl(`https://wa.me/966597414858?text=${encodeURIComponent(message)}`)
  }

  return (
    <main className="route-page suppliers-page" dir="rtl">
      <section className="route-hero shell">
        <p className="page-kicker">معاً لتوريد أسهل</p>
        <h1>الموردون</h1>
        <p>تعرّف على فئات الموردين في شبكة جملة، واطلب الانضمام لتوسيع وصول منتجاتك.</p>
      </section>

      <section className="shell supplier-network" aria-labelledby="supplier-network-title">
        <div className="page-section-heading"><div><p className="page-kicker">شبكة التوريد</p><h2 id="supplier-network-title">فئات الموردين</h2></div><span className="results-count">توريد مباشر إلى جدة ومناطق المملكة</span></div>
        <div className="supplier-grid">
          {supplierGroups.map(({ name, specialty, city, icon: Icon }) => (
            <article className="supplier-card" key={name}>
              <span className="supplier-icon"><Icon aria-hidden="true" /></span>
              <p className="supplier-status">فئة توريد</p>
              <h3>{name}</h3>
              <p>{specialty}</p>
              <span className="supplier-city"><MapPin aria-hidden="true" /> {city}</span>
              <Link to="/categories" className="supplier-link">تصفح المنتجات <ArrowLeft aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="shell supplier-registration" id="register" aria-labelledby="supplier-registration-title">
        <div className="registration-intro">
          <p className="page-kicker">انضم إلى جملة</p>
          <h2 id="supplier-registration-title">هل أنت مورّد أو مصنع؟</h2>
          <p>أرسل بيانات منشأتك وفريق التوريد سيتواصل معك عبر واتساب لاستكمال التسجيل.</p>
          <a className="supplier-whatsapp" href="https://wa.me/966597414858" target="_blank" rel="noreferrer">0597414858</a>
        </div>
        <form className="supplier-form" onSubmit={handleRegistration}>
          <label>اسم المنشأة<input name="company" autoComplete="organization" required placeholder="اسم الشركة أو المصنع" /></label>
          <label>مسؤول التواصل<input name="contact" autoComplete="name" required placeholder="الاسم الكامل" /></label>
          <label>رقم الجوال<input name="phone" type="tel" autoComplete="tel" inputMode="tel" required placeholder="05xxxxxxxx" /></label>
          <label>التخصص<select name="specialty" defaultValue="" required><option value="" disabled>اختر مجال التوريد</option><option>مواد غذائية</option><option>مجمدات وألبان</option><option>ورقيات وتغليف</option><option>منظفات وعناية</option><option>مستلزمات مطاعم</option><option>مجال آخر</option></select></label>
          <label className="form-full-width">المدينة<input name="city" autoComplete="address-level2" required placeholder="مثال: جدة" /></label>
          <button className="primary-action form-full-width" type="submit">إرسال طلب التسجيل</button>
          {registrationUrl && <a className="whatsapp-submit form-full-width" href={registrationUrl} target="_blank" rel="noreferrer">فتح طلب التسجيل في واتساب</a>}
        </form>
      </section>
    </main>
  )
}
