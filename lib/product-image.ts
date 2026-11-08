export async function uploadProductImage(file: File) {
  const formData = new FormData()
  formData.set("file", file)

  const response = await fetch("/api/product-images", {
    method: "POST",
    body: formData,
  })
  const result = await response.json() as { path?: string; publicUrl?: string }

  if (!response.ok || !result.path || !result.publicUrl) {
    throw new Error("تعذر تجهيز صورة المنتج")
  }

  return { path: result.path, publicUrl: result.publicUrl }
}
