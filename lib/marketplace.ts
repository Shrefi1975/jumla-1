'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export type ProductStatus = 'pending_approval' | 'published' | 'rejected'
export type SupplierStatus = 'pending' | 'approved' | 'rejected'

export type Product = {
  id: string
  name: string
  description: string
  pack: string
  packagingUnit: string
  categoryId: string
  wholesalePrice: number
  retailPrice: number
  minimumOrderQuantity: number
  expiryDate: string
  supplier: string
  discountPercent: number
  badge: string
  imageUrl?: string
}

export type Category = {
  id: string
  slug: string
  name: string
  count: string
  items: string
  imageUrl?: string
  detail: string
}

export type SupplierRecord = {
  id: string
  user_id: string
  company_name: string
  commercial_register: string | null
  vat_number: string | null
  status: SupplierStatus
  created_at: string
  updated_at: string
}

export type ProductRecord = {
  id: string
  supplier_id: string
  category_id: string
  title: string
  description: string
  packaging_unit: string
  expiry_date: string | null
  image_url: string | null
  wholesale_price: number | string
  retail_price: number | string
  min_order_quantity: number
  is_active: boolean
  status: ProductStatus
  created_at: string
  updated_at: string
}

export type PlatformSettings = {
  id: number
  admin_whatsapp: string
  min_order_value: number | string
  platform_fee_percentage: number | string
  updated_at: string
}

const categoryArtwork: Record<string, { imageUrl: string; detail: string }> = {
  frozen: { imageUrl: '/category-frozen.webp', detail: 'دواجن، أسماك، خضروات ومخبوزات مجمدة' },
  paper: { imageUrl: '/category-paper.webp', detail: 'مناديل الوجه، رولات المطبخ وورق السفرة' },
  plastic: { imageUrl: '/category-plastic.webp', detail: 'أدوات الاستخدام الواحد ومواد التغليف' },
  cleaning: { imageUrl: '/category-cleaning.webp', detail: 'منظفات المنزل، المطهرات والعناية' },
  food: { imageUrl: '/category-food.webp', detail: 'الأرز، السكر، الزيوت، المعلبات والمزيد' },
  drinks: { imageUrl: '/category-drinks.webp', detail: 'مياه وعصائر ومشروبات بكميات تجارية' },
  dairy: { imageUrl: '/category-dairy.webp', detail: 'منتجات الألبان والحليب طويل الأجل' },
  restaurant: { imageUrl: '/category-restaurant.webp', detail: 'عبوات وأدوات تقديم وتجهيز الطعام' },
  'personal-care': { imageUrl: '/category-personal-care.webp', detail: 'منتجات العناية اليومية للعائلة' },
}

const fallbackArtwork = { detail: 'منتجات جملة مختارة' }
const arabicNumber = new Intl.NumberFormat('ar-SA')

export function formatSAR(value: number) {
  return new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function getWhatsAppUrl(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, '')
  const internationalNumber = digits.startsWith('00')
    ? digits.slice(2)
    : digits.startsWith('966')
      ? digits
      : digits.startsWith('0')
        ? `966${digits.slice(1)}`
        : `966${digits}`
  const query = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${internationalNumber}${query}`
}

async function fetchMarketplaceCatalog() {
  const supabase = createClient()
  const [productsResult, categoriesResult, suppliersResult, settingsResult] = await Promise.all([
    supabase
      .from('products')
      .select('id,supplier_id,category_id,title,description,packaging_unit,expiry_date,image_url,wholesale_price,retail_price,min_order_quantity,is_active,status,created_at,updated_at')
      .eq('status', 'published')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .neq('image_url', '')
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('id,name_ar,slug,description,sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase.from('suppliers').select('id,company_name').eq('status', 'approved'),
    supabase
      .from('platform_settings')
      .select('id,admin_whatsapp,min_order_value,platform_fee_percentage,updated_at')
      .eq('id', 1)
      .maybeSingle(),
  ])

  const error = productsResult.error ?? categoriesResult.error ?? suppliersResult.error ?? settingsResult.error
  if (error) throw error

  const supplierNames = new Map(
    (suppliersResult.data ?? []).map((supplier) => [supplier.id, supplier.company_name]),
  )
  const counts = new Map<string, number>()

  const products: Product[] = (productsResult.data ?? []).map((row) => {
    const categoryId = String(row.category_id)
    const wholesalePrice = Number(row.wholesale_price)
    const retailPrice = Number(row.retail_price)
    const minimumOrderQuantity = Number(row.min_order_quantity)
    const discountPercent = retailPrice > wholesalePrice && retailPrice > 0
      ? Math.max(0, Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100))
      : 0

    counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1)

    return {
      id: row.id,
      name: row.title,
      description: row.description,
      pack: `${arabicNumber.format(minimumOrderQuantity)} ${row.packaging_unit}`,
      packagingUnit: row.packaging_unit,
      categoryId,
      wholesalePrice,
      retailPrice,
      minimumOrderQuantity,
      expiryDate: row.expiry_date ?? '',
      supplier: supplierNames.get(row.supplier_id) ?? 'مورد معتمد',
      discountPercent,
      badge: discountPercent ? `خصم ${arabicNumber.format(discountPercent)}٪` : '',
      imageUrl: row.image_url ?? undefined,
    }
  })

  const categories: Category[] = (categoriesResult.data ?? []).map((row) => {
    const artwork = categoryArtwork[row.slug]
    return {
      id: row.id,
      slug: row.slug,
      name: row.name_ar,
      count: arabicNumber.format(counts.get(row.id) ?? 0),
      items: 'منتجات',
      imageUrl: artwork?.imageUrl,
      detail: row.description || artwork?.detail || fallbackArtwork.detail,
    }
  })

  return {
    products,
    categories,
    settings: (settingsResult.data as PlatformSettings | null) ?? null,
  }
}

export function useMarketplaceCatalog() {
  const { data, error, isLoading, mutate } = useSWR('jumla:marketplace-catalog', fetchMarketplaceCatalog, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 60_000,
  })

  return {
    products: data?.products ?? [],
    categories: data?.categories ?? [],
    settings: data?.settings ?? null,
    error,
    isLoading,
    mutate,
  }
}

async function fetchCurrentUser() {
  const { data, error } = await createClient().auth.getUser()
  if (error && error.name !== 'AuthSessionMissingError') throw error
  return data.user
}

export function useCurrentUser() {
  const supabase = createClient()
  const { data: user, error, isLoading, mutate } = useSWR<User | null>('jumla:auth-user', fetchCurrentUser, {
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  })

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => { void mutate() }, 0)
    })
    return () => subscription.unsubscribe()
  }, [mutate, supabase])

  return { user: user ?? null, error, isLoading, mutate }
}

export function useSupplierRecord(userId: string | null) {
  return useSWR<SupplierRecord | null>(
    userId ? ['jumla:supplier-record', userId] : null,
    async ([, id]) => {
      const { data, error } = await createClient()
        .from('suppliers')
        .select('id,user_id,company_name,commercial_register,vat_number,status,created_at,updated_at')
        .eq('user_id', id as string)
        .maybeSingle()
      if (error) throw error
      return data as SupplierRecord | null
    },
    { revalidateOnFocus: true, shouldRetryOnError: false },
  )
}

export function useSupplierProducts(supplierId: string | null) {
  return useSWR<ProductRecord[]>(
    supplierId ? ['jumla:supplier-products', supplierId] : null,
    async ([, id]) => {
      const { data, error } = await createClient()
        .from('products')
        .select('id,supplier_id,category_id,title,description,packaging_unit,expiry_date,image_url,wholesale_price,retail_price,min_order_quantity,is_active,status,created_at,updated_at')
        .eq('supplier_id', id as string)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as ProductRecord[]
    },
    { revalidateOnFocus: true, shouldRetryOnError: false },
  )
}

async function fetchAdminOverview() {
  const supabase = createClient()
  const [suppliersResult, productsResult, settingsResult] = await Promise.all([
    supabase
      .from('suppliers')
      .select('id,user_id,company_name,commercial_register,vat_number,status,created_at,updated_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('products')
      .select('id,supplier_id,category_id,title,description,packaging_unit,expiry_date,image_url,wholesale_price,retail_price,min_order_quantity,is_active,status,created_at,updated_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('platform_settings')
      .select('id,admin_whatsapp,min_order_value,platform_fee_percentage,updated_at')
      .eq('id', 1)
      .maybeSingle(),
  ])

  const error = suppliersResult.error ?? productsResult.error ?? settingsResult.error
  if (error) throw error

  return {
    suppliers: (suppliersResult.data ?? []) as SupplierRecord[],
    products: (productsResult.data ?? []) as ProductRecord[],
    settings: (settingsResult.data as PlatformSettings | null) ?? null,
  }
}

export function useAdminOverview() {
  return useSWR('jumla:admin-overview', fetchAdminOverview, {
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  })
}

export function useSuperAdmin(userId: string | null) {
  return useSWR<boolean>(
    userId ? ['jumla:super-admin', userId] : null,
    async () => {
      const { data, error } = await createClient().rpc('is_super_admin')
      if (error) throw error
      return data === true
    },
    { revalidateOnFocus: true, shouldRetryOnError: false },
  )
}
