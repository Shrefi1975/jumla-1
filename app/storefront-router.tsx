"use client"

import { useEffect, useState } from "react"
import { BrowserRouter } from "react-router-dom"
import { CartProvider } from "@/components/storefront/cart-context"
import { StorefrontShell } from "@/components/storefront/shell"

export function StorefrontRouter() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  if (!isMounted) return <div className="route-loading" aria-busy="true" aria-label="جارٍ تجهيز المتجر" />

  return (
    <BrowserRouter>
      <CartProvider>
        <StorefrontShell />
      </CartProvider>
    </BrowserRouter>
  )
}
