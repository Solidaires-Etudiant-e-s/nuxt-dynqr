<template>
  <div class="container mx-auto p-4 space-y-4">
    <h1 class="text-2xl font-bold">{{ $t('admin.brand') }}</h1>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-2 flex-col sm:flex-row">
          <div class="flex items-center gap-2">
            <UIcon name="tabler:brand-appgallery" />
            <span>{{ $t('admin.logos') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <input type="file" ref="multiRef" class="hidden" accept="image/*" multiple @change="onPickMulti" />
            <UButton :loading="uploading" :disabled="uploading" icon="tabler:upload" @click="() => multiRef?.click()">{{ $t('admin.uploadImages') }}</UButton>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
        <template v-if="images.length">
          <div v-for="img in images" :key="img.id" class="border rounded p-2 flex flex-col items-center gap-2 bg-white">
            <img :src="img.imageUrl" class="h-16 object-contain" />
            <div class="flex items-center gap-2">
              <UButton size="xs" color="error" variant="soft" icon="tabler:trash" @click="() => deleteImage(img.id)">{{ $t('common.delete') }}</UButton>
            </div>
          </div>
        </template>
      </div>

      <div v-if="!images.length" class="text-gray-500">{{ $t('admin.noImages') }}</div>
    </UCard>

    <UCard>
      <template #header>
        <span>{{ $t('admin.defaultColors') }}</span>
      </template>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
        <span>{{ $t('qr.foreground') }}</span>
        <UInput v-model="fgColor" type="color" />
        <span>{{ $t('qr.background') }}</span>
        <UInput v-model="bgColor" type="color" />
      </div>
      <div class="mt-3">
        <UButton :loading="savingColors" @click="saveColors" icon="tabler:device-floppy">{{ $t('common.save') }}</UButton>
      </div>
    </UCard>

  </div>
</template>

<script setup lang="ts">
const { brand, images, refreshAdmin, refreshImagesAdmin, updateColors, uploadImages, deleteImage } = useBrand()
const fgColor = ref('#000000')
const bgColor = ref('#ffffff')
const savingColors = ref(false)
const multiRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const { t } = useI18n()
const url = useRequestURL()
const origin = computed(() => `${url.protocol}//${url.host}`)
const pageUrl = computed(() => `${origin.value}/admin/brand`)
const title = computed(() => `${t('app.title')} – ${t('admin.brand')}`)
const description = computed(() => t('admin.brandDesc'))

useHead(() => ({
  title: title.value,
  link: [{ rel: 'canonical', href: pageUrl.value }],
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description.value },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: pageUrl.value },
    { property: 'og:image', content: `${origin.value}/favicon.png` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title.value },
    { name: 'twitter:description', content: description.value },
    { name: 'twitter:image', content: `${origin.value}/favicon.png` },
  ],
}))

async function saveColors() {
  savingColors.value = true
  try { await updateColors({ fgColor: fgColor.value, bgColor: bgColor.value }) } finally { savingColors.value = false }
}

async function onPickMulti(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length) {
    uploading.value = true
    try { await uploadImages(files) } finally { uploading.value = false }
  }
  if (multiRef.value) multiRef.value.value = ''
}

onMounted(async () => { 
  try { await refreshAdmin() } catch (_) {}
  try { await refreshImagesAdmin() } catch (_) {}
  if (brand.value?.fgColor) fgColor.value = brand.value.fgColor
  if (brand.value?.bgColor) bgColor.value = brand.value.bgColor
})
</script>

<style scoped>
</style>
