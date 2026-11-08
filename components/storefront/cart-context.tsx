"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { ProductWithRelations } from "./data"

export type CartItem = {
  product: ProductWithRelations
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  announcement: string
  addProduct: (product: ProductWithRelations) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeProduct: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [announcement, setAnnouncement] = useState("")

  const addProduct = useCallback((product: ProductWithRelations) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + product.min_order_quantity }
            : item,
        )
      }
      return [...current, { product, quantity: product.min_order_quantity }]
    })
    setAnnouncement(`أُضيف ${product.title} إلى سلة المشتريات`)
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(item.product.min_order_quantity, Math.floor(quantity) || item.product.min_order_quantity) }
          : item,
      ),
    )
  }, [])

  const removeProduct = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId))
    setAnnouncement("تم حذف المنتج من السلة")
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setAnnouncement("تم إرسال طلبك إلى واتساب")
  }, [])

  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.product.wholesale_price * item.quantity, 0),
    announcement,
    addProduct,
    updateQuantity,
    removeProduct,
    clearCart,
  }), [items, announcement, addProduct, updateQuantity, removeProduct, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error("useCart must be used inside CartProvider")
  return value
}
