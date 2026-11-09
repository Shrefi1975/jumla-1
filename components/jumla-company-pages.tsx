'use client'

import { useState, type FormEvent } from 'react'
import { Building2, Clock3, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'

export function AboutPage() {
  return (
    <main className="route-page company-page about-page" dir="rtl">
      <section className="route-hero shell">
        <p className="page-kicker">من نحن</p>
        <h1>جملة.. كل احتياجاتك بالجملة</h1>
        <p>منصة سعودية تجمع المشترين بالموردين، وتسهّل الوصول إلى المنتجات بالجملة من مكان واحد.</p>
      </section>

      <section className="shell about-story">
        <div className="about-story-copy">
          <p className="page-kicker">رؤيتنا</p>
          <h2>توريد أوضح، وتسوق أسهل</h2>
          <p>تعمل منصة جملة على تبسيط تجربة الشراء التجاري؛ من اكتشاف المنتجات ومقارنة أسعار الجملة إلى تنسيق الطلبات والتوصيل المباشر من المورد.</p>
          <p>نركز على توفير تشكيلة واسعة من احتياجات المتاجر والمطاعم والشركات، مع تفاصيل واضحة عن وحدات التعبئة والحد الأدنى للطلب.</p>
        </div>
        <div className="about-values">
          <article><span>١</span><h3>الشفافية</h3><p>تفاصيل التعبئة والأسعار ظاهرة قبل الطلب.</p></article>
          <article><span>٢</span><h3>التوريد المباشر</h3><p>ربط المشتري بالمورد لتسهيل التوريد بالجملة.</p></article>
          <article><span>٣</span><h3>خدمة محلية</h3><p>نخدم المنشآت من جدة إلى مختلف مناطق المملكة.</p></article>
        </div>
      </section>

      <section className="shell warehouse-card" aria-labelledby="warehouse-title">
        <span className="warehouse-icon"><Building2 aria-hidden="true" /></span>
        <div><p className="page-kicker">مركز التوريد</p><h2 id="warehouse-title">مستودع جملة الرئيسي</h2><p><MapPin aria-hidden="true" /> جدة، المملكة العربية السعودية</p></div>
        <a className="secondary-action" href="https://wa.me/966597414858?text=%D8%A3%D8%B1%D8%BA%D8%A8%20%D8%A8%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%88%D9%82%D8%B9%20%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D9%88%D8%AF%D8%B9" target="_blank" rel="noreferrer">استفسر عن الموقع</a>
      </section>
    </main>
  )
}

export function ContactPage() {
  const [messageUrl, setMessageUrl] = useState('')

  function handleMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const message = `رسالة من ${formData.get('name')} (${formData.get('phone')}):\n${formData.get('message')}`
    setMessageUrl(`https://wa.me/966597414858?text=${encodeURIComponent(message)}`)
  }

  return (
    <main className="route-page company-page contact-page" dir="rtl">
      <section className="route-hero shell">
        <p className="page-kicker">نحن هنا لمساعدتك</p>
        <h1>تواصل معنا</h1>
        <p>يسعد فريق جملة بمساعدتك في المنتجات والطلبات والتوريد.</p>
      </section>

      <section className="shell contact-layout">
        <div className="contact-options" aria-label="وسائل التواصل">
          <a className="contact-option contact-option-featured" href="https://wa.me/966597414858?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D8%A8%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%20%D9%81%D8%B1%D9%8A%D9%82%20%D8%AC%D9%85%D9%84%D8%A9" target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" /><span><strong>واتساب الدعم</strong><small>0597414858</small></span></a>
          <a className="contact-option" href="tel:+966597414858"><Phone aria-hidden="true" /><span><strong>اتصل بنا</strong><small>0597414858</small></span></a>
          <a className="contact-option" href="mailto:info@jumla.sa"><Mail aria-hidden="true" /><span><strong>البريد الإلكتروني</strong><small>info@jumla.sa</small></span></a>
          <div className="contact-option"><MapPin aria-hidden="true" /><span><strong>مستودع جملة</strong><small>جدة، المملكة العربية السعودية</small></span></div>
          <div className="contact-note"><Clock3 aria-hidden="true" /><p>للطلبات والاستفسارات، أرسل رسالتك وسيتم فتح واتساب لإكمال التواصل.</p></div>
        </div>

        <form className="contact-form" onSubmit={handleMessage}>
          <p className="page-kicker">أرسل استفسارك</p>
          <h2>كيف نساعدك؟</h2>
          <label>الاسم<input name="name" autoComplete="name" required placeholder="الاسم الكامل" /></label>
          <label>رقم الجوال<input name="phone" type="tel" autoComplete="tel" inputMode="tel" required placeholder="05xxxxxxxx" /></label>
          <label>رسالتك<textarea name="message" required rows={5} placeholder="اكتب تفاصيل استفسارك..." /></label>
          <button className="primary-action" type="submit">متابعة إلى واتساب</button>
          {messageUrl && <a className="whatsapp-submit" href={messageUrl} target="_blank" rel="noreferrer">فتح الرسالة في واتساب</a>}
        </form>
      </section>
    </main>
  )
}
