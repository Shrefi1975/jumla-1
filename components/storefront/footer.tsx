import { Link } from "react-router-dom"
import { BrandMark } from "./shared"

export function StorefrontFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main shell">
        <div className="footer-about">
          <BrandMark light />
          <p>منصة توريد تجمع الموردين المعتمدين والمنتجات بالجملة في مكان واحد.</p>
        </div>
        <div className="footer-column">
          <h2>تسوق</h2>
          <Link to="/categories">الأقسام والمنتجات</Link>
          <Link to="/offers">العروض</Link>
          <Link to="/cart">سلة المشتريات</Link>
        </div>
        <div className="footer-column">
          <h2>عن جملة</h2>
          <Link to="/about">من نحن</Link>
          <Link to="/suppliers">انضم كمورد</Link>
          <Link to="/contact">تواصل معنا</Link>
        </div>
        <div className="footer-column footer-contact">
          <h2>خدمة العملاء</h2>
          <p>جدة، المملكة العربية السعودية</p>
          <a href="https://wa.me/966597414858" target="_blank" rel="noreferrer">واتساب 0597414858</a>
        </div>
      </div>
      <div className="footer-bottom shell"><span>© {new Date().getFullYear()} منصة جملة</span><span>التوريد بالجملة، بثقة ووضوح</span></div>
    </footer>
  )
}
