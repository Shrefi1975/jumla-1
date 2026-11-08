"use client"

import { useState, type FormEvent } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { Menu, Phone, Search, ShoppingBasket, UserRound, X } from "lucide-react"
import { BrandMark } from "./shared"
import { useCart } from "./cart-context"

const navigation = [
  { label: "الرئيسية", to: "/", end: true },
  { label: "الأقسام والتسوق", to: "/categories" },
  { label: "عروض خاصة", to: "/offers" },
  { label: "الموردون", to: "/suppliers" },
  { label: "من نحن", to: "/about" },
  { label: "تواصل معنا", to: "/contact" },
]

export function StorefrontHeader() {
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = search.trim()
    navigate(term ? `/categories?search=${encodeURIComponent(term)}` : "/categories")
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="announcement-bar">
        <div className="announcement-inner">
          <span>توريد بالجملة للمطاعم والتجار</span>
          <a href="https://wa.me/966597414858" target="_blank" rel="noreferrer"><Phone aria-hidden="true" /> دعم واتساب 0597414858</a>
        </div>
      </div>
      <div className="header-main shell">
        <button className="icon-button mobile-menu-button" type="button" aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <div className="header-brand"><BrandMark /></div>
        <form className="search-box" role="search" onSubmit={submitSearch}>
          <label className="sr-only" htmlFor="store-search">ابحث عن منتج أو قسم</label>
          <input id="store-search" type="search" placeholder="ابحث عن منتج أو قسم..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <button type="submit" aria-label="بحث"><Search aria-hidden="true" /></button>
        </form>
        <div className="header-actions">
          <Link className="account-link" to="/suppliers#join"><UserRound aria-hidden="true" /><span>حساب المورد</span></Link>
          <Link className="cart-button" to="/cart" aria-label={`سلة المشتريات، ${itemCount} قطعة`}>
            <span className="cart-count">{itemCount}</span>
            <ShoppingBasket aria-hidden="true" />
            <span>السلة</span>
          </Link>
        </div>
      </div>
      <nav id="main-navigation" className={`main-nav${menuOpen ? " nav-open" : ""}`} aria-label="التنقل الرئيسي">
        <div className="nav-inner shell">
          {navigation.map(({ label, to, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : undefined}>
              {label}
            </NavLink>
          ))}
          <Link className="mobile-cart-link" to="/cart" onClick={() => setMenuOpen(false)}>سلة المشتريات ({itemCount})</Link>
        </div>
      </nav>
    </header>
  )
}
