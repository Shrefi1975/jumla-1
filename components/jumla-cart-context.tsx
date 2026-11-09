'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '@/components/jumla-storefront'

export type CartLine = {
  product: Product
  quantity: number
}

type CartContextValue = {
  lines: CartLine[]
  cartCount: number
  subtotal: number
  addToCart: (product: Product, quantity?: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  removeFromCart: (productId: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  const addToCart = useCallback((product: Product, quantity = product.minimumOrderQuantity) => {
    const requestedQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : product.minimumOrderQuantity
    const addedQuantity = Math.max(product.minimumOrderQuantity, requestedQuantity)
    setLines((current) => {
      const existingLine = current.find((line) => line.product.id === product.id)
      if (existingLine) {
        return current.map((line) => line.product.id === product.id
          ? { ...line, quantity: line.quantity + addedQuantity }
          : line)
      }
      return [...current, { product, quantity: addedQuantity }]
    })
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const safeQuantity = Math.max(1, Math.floor(quantity) || 1)
    setLines((current) => current.map((line) => line.product.id === productId
      ? { ...line, quantity: safeQuantity }
      : line))
  }, [])

  const removeFromCart = useCallback((productId: number) => {
    setLines((current) => current.filter((line) => line.product.id !== productId))
  }, [])

  const value = useMemo(() => ({
    lines,
    cartCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotal: lines.reduce((total, line) => total + line.product.wholesalePrice * line.quantity, 0),
    addToCart,
    updateQuantity,
    removeFromCart,
  }), [lines, addToCart, updateQuantity, removeFromCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
