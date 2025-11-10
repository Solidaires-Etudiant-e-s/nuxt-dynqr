import type { Ref } from 'vue'

export type Brand = {
  id: number
  name: string
  imageUrl: string
  fgColor?: string | null
  bgColor?: string | null
}

export type BrandImage = { id: number; imageUrl: string }

export function useBrand() {
  const brand: Ref<Brand | null> = useState<Brand | null>('brand', () => null)
  const images: Ref<BrandImage[]> = useState<BrandImage[]>('brand-images', () => [])

  async function refreshAdmin() {
    const data = await $fetch<Brand | null>('/api/admin/brand')
    brand.value = data || null
  }

  async function refreshPublic() {
    const data = await $fetch<Brand | null>('/api/brand')
    brand.value = data || null
  }

  async function setBrand(form: FormData) {
    const data = await $fetch<Brand>('/api/admin/brand', { method: 'POST', body: form })
    brand.value = data
  }

  async function clearBrand() {
    await $fetch('/api/admin/brand', { method: 'DELETE' })
    brand.value = null
  }

  async function updateColors(payload: { name?: string; fgColor?: string; bgColor?: string }) {
    const data = await $fetch<Brand>('/api/admin/brand', { method: 'PATCH', body: payload })
    brand.value = data
  }

  async function refreshImagesAdmin() {
    const data = await $fetch<BrandImage[]>('/api/admin/brand/images')
    images.value = Array.isArray(data) ? data : []
  }

  async function refreshImagesPublic() {
    const data = await $fetch<BrandImage[]>('/api/brand/images')
    images.value = Array.isArray(data) ? data : []
  }

  async function uploadImages(files: File[]) {
    const form = new FormData()
    for (const f of files) form.append('files', f)
    const data = await $fetch<BrandImage[]>('/api/admin/brand/images', { method: 'POST', body: form })
    images.value = [...data, ...images.value]
  }

  async function deleteImage(id: number) {
    await $fetch(`/api/admin/brand/images/${id}`, { method: 'DELETE' })
    images.value = images.value.filter(i => i.id !== id)
  }

  return { brand, images, refreshAdmin, refreshPublic, setBrand, clearBrand, updateColors, refreshImagesAdmin, refreshImagesPublic, uploadImages, deleteImage }
}
