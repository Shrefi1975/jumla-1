'use client'

import { ArrowLeft, Factory, MapPin, PackageCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

const supplierGroups = [
  { name: 'مورد المواد الغذائية', specialty: 'الأرز والزيوت والمواد التموينية', city: 'جدة', icon: PackageCheck },
  { name: 'مورد المنتجات المجمدة', specialty: 'الدواجن والخضروات والمخبوزات', city: 'جدة', icon: Truck },
  { name: 'مورد الورقيات والتغليف', specialty: 'المناديل وعبوات الاستخدام الواحد', city: 'جدة', icon: Factory },
]

export function SuppliersPage() {
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
          <p>أنشئ حساب منشأتك وقدّم طلب الانضمام من بوابة الموردين. سيبقى الحساب قيد المراجعة حتى اعتماده.</p>
          <a className="supplier-join-login" href="/login?next=%2Fsupplier%2Fdashboard">لديك حساب؟ تسجيل الدخول</a>
        </div>
        <div className="supplier-form supplier-join-panel">
          <p className="page-kicker">خطوات الانضمام</p>
          <ul>
            <li>أكمل بيانات مسؤول التواصل والمنشأة.</li>
            <li>أكّد بريدك الإلكتروني لتفعيل الحساب.</li>
            <li>بعد اعتماد الطلب، أضف منتجاتك وأسعار الجملة.</li>
          </ul>
          <a className="primary-action form-full-width" href="/register">إنشاء حساب مورد <ArrowLeft aria-hidden="true" /></a>
        </div>
      </section>
    </main>
  )
}
