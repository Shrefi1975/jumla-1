import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import type { CategoryRow, PlatformSettingsRow, ProductRow, SupplierRow } from "@/lib/supabase/database.types"

export type ProductWithRelations = ProductRow & {
  suppliers: Pick<SupplierRow, "company_name"> | null
  categories: Pick<CategoryRow, "name_ar" | "slug"> | null
}

export type ApprovedSupplier = Pick<SupplierRow, "id" | "company_name" | "created_at">

export type ProductFilters = {
  categoryId?: string
  search?: string
  packaging?: string
  limit?: number
}

export const defaultSettings: PlatformSettingsRow = {
  id: 1,
  admin_whatsapp: "0597414858",
  min_order_value: 1000,
  platform_fee_percentage: 0,
  updated_at: "",
}

export async function fetchCategories(): Promise<CategoryRow[]> {
  const { data, error } = await createClient()
    .from("categories")
    .select("id, name_ar, slug, icon, description, sort_order, is_active, created_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductWithRelations[]> {
  let query = createClient()
    .from("products")
    .select("*, suppliers(company_name), categories(name_ar, slug)")
    .eq("status", "published")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 100)

  if (filters.categoryId) query = query.eq("category_id", filters.categoryId)
  if (filters.search?.trim()) query = query.ilike("title", `%${filters.search.trim()}%`)
  if (filters.packaging) query = query.ilike("packaging_unit", `%${filters.packaging}%`)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as ProductWithRelations[]
}

export async function fetchProduct(id: string): Promise<ProductWithRelations | null> {
  const { data, error } = await createClient()
    .from("products")
    .select("*, suppliers(company_name), categories(name_ar, slug)")
    .eq("id", id)
    .eq("status", "published")
    .eq("is_active", true)
    .maybeSingle()

  if (error) throw error
  return data as unknown as ProductWithRelations | null
}

export async function fetchApprovedSuppliers(): Promise<ApprovedSupplier[]> {
  const { data, error } = await createClient()
    .from("suppliers")
    .select("id, company_name, created_at")
    .eq("status", "approved")
    .order("company_name", { ascending: true })
    .limit(24)

  if (error) throw error
  return data ?? []
}

export async function fetchPlatformSettings(): Promise<PlatformSettingsRow> {
  const { data, error } = await createClient()
    .from("platform_settings")
    .select("id, admin_whatsapp, min_order_value, platform_fee_percentage, updated_at")
    .eq("id", 1)
    .maybeSingle()

  if (error) throw error
  return data ?? defaultSettings
}

export function useCategories() {
  return useSWR("jumla-categories", fetchCategories)
}

export function useProducts(filters: ProductFilters = {}, enabled = true) {
  const key = enabled
    ? ["jumla-products", filters.categoryId ?? "", filters.search ?? "", filters.packaging ?? "", filters.limit ?? 100]
    : null
  return useSWR(key, () => fetchProducts(filters), { keepPreviousData: true })
}

export function useProduct(id: string | undefined) {
  return useSWR(id ? ["jumla-product", id] : null, () => fetchProduct(id as string))
}

export function useApprovedSuppliers() {
  return useSWR("jumla-approved-suppliers", fetchApprovedSuppliers)
}

export function usePlatformSettings() {
  return useSWR("jumla-platform-settings", fetchPlatformSettings, { fallbackData: defaultSettings })
}
