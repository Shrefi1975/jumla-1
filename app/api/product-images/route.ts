import sharp from "sharp"
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 })
  }

  const [{ data: supplier }, { data: profile }] = await Promise.all([
    supabase.from("suppliers").select("status").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle(),
  ])

  if (supplier?.status !== "approved" && profile?.role !== "super_admin") {
    return NextResponse.json({ error: "supplier_approval_required" }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File) || !ACCEPTED_TYPES.has(file.type) || file.size > MAX_UPLOAD_BYTES || file.size === 0) {
    return NextResponse.json({ error: "invalid_image" }, { status: 400 })
  }

  try {
    const normalized = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 })
      .rotate()
      .resize(800, 800, { fit: "cover", position: "centre", withoutEnlargement: false })
      .webp({ quality: 84, effort: 4 })
      .toBuffer()

    const path = `${user.id}/${crypto.randomUUID()}.webp`
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, normalized, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    })

    if (uploadError) {
      return NextResponse.json({ error: "image_upload_failed" }, { status: 502 })
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path)
    return NextResponse.json({ path, publicUrl: data.publicUrl }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "image_processing_failed" }, { status: 400 })
  }
}
