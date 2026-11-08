export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type Relationship<
  ForeignKeyName extends string,
  Columns extends string[],
  ReferencedRelation extends string,
  ReferencedColumns extends string[],
> = {
  foreignKeyName: ForeignKeyName
  columns: Columns
  isOneToOne: false
  referencedRelation: ReferencedRelation
  referencedColumns: ReferencedColumns
}

type NoRelationships = []

export type CategoryRow = {
  id: string
  name_ar: string
  slug: string
  icon: string
  description: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export type SupplierRow = {
  id: string
  user_id: string
  company_name: string
  commercial_register: string | null
  vat_number: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export type ProductRow = {
  id: string
  supplier_id: string
  category_id: string
  title: string
  description: string
  packaging_unit: string
  expiry_date: string | null
  image_url: string | null
  wholesale_price: number
  retail_price: number
  min_order_quantity: number
  is_active: boolean
  status: "pending_approval" | "published" | "rejected"
  created_at: string
  updated_at: string
}

export type PlatformSettingsRow = {
  id: number
  admin_whatsapp: string
  min_order_value: number
  platform_fee_percentage: number
  updated_at: string
}

export type ProfileRow = {
  id: string
  user_id: string
  full_name: string
  phone: string | null
  role: "super_admin" | "supplier" | "customer"
  created_at: string
  updated_at: string
}

type Table<Row, Insert, Update, Relationships = NoRelationships> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: Relationships
}

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" }
  public: {
    Tables: {
      categories: Table<
        CategoryRow,
        Omit<CategoryRow, "id" | "created_at" | "sort_order" | "is_active" | "description" | "icon"> &
          Partial<Pick<CategoryRow, "id" | "created_at" | "sort_order" | "is_active" | "description" | "icon">>,
        Partial<CategoryRow>
      >
      products: Table<
        ProductRow,
        Omit<ProductRow, "id" | "created_at" | "updated_at" | "description" | "expiry_date" | "image_url" | "min_order_quantity" | "is_active" | "status"> &
          Partial<Pick<ProductRow, "id" | "created_at" | "updated_at" | "description" | "expiry_date" | "image_url" | "min_order_quantity" | "is_active" | "status">>,
        Partial<ProductRow>,
        [
          Relationship<"products_category_id_fkey", ["category_id"], "categories", ["id"]>,
          Relationship<"products_supplier_id_fkey", ["supplier_id"], "suppliers", ["id"]>,
        ]
      >
      suppliers: Table<
        SupplierRow,
        Omit<SupplierRow, "id" | "status" | "created_at" | "updated_at" | "commercial_register" | "vat_number"> &
          Partial<Pick<SupplierRow, "id" | "status" | "created_at" | "updated_at" | "commercial_register" | "vat_number">>,
        Partial<SupplierRow>,
        [Relationship<"suppliers_user_id_fkey", ["user_id"], "profiles", ["user_id"]>]
      >
      profiles: Table<
        ProfileRow,
        Omit<ProfileRow, "id" | "role" | "created_at" | "updated_at" | "phone"> &
          Partial<Pick<ProfileRow, "id" | "role" | "created_at" | "updated_at" | "phone">>,
        Partial<ProfileRow>,
        NoRelationships
      >
      platform_settings: Table<
        PlatformSettingsRow,
        Partial<PlatformSettingsRow>,
        Partial<PlatformSettingsRow>,
        NoRelationships
      >
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      user_role: "super_admin" | "supplier" | "customer"
      supplier_status: "pending" | "approved" | "rejected"
      product_status: "pending_approval" | "published" | "rejected"
      order_status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
      payment_status: "unpaid" | "pending" | "paid" | "refunded" | "failed"
      payout_status: "pending" | "processing" | "paid" | "failed" | "cancelled"
    }
    CompositeTypes: { [_ in never]: never }
  }
}
