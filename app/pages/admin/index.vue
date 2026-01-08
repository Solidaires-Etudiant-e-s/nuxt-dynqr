<template>
  <div class="container mx-auto p-4 space-y-4">
    <h1 class="text-2xl font-bold">{{ $t('admin.title') }}</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="mingcute:list-check-line" />
            <span>{{ $t('admin.qrList') }}</span>
          </div>
        </template>
        <p class="text-gray-600 mb-3">{{ $t('admin.qrListDesc') }}</p>
        <UButton :to="'/admin/qr-list'" icon="mingcute:arrow-right-line">{{ $t('common.open') }}</UButton>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="mingcute:grid-line" />
            <span>{{ $t('admin.brand') }}</span>
          </div>
        </template>
        <p class="text-gray-600 mb-3">{{ $t('admin.brandDesc') }}</p>
        <UButton :to="'/admin/brand'" icon="mingcute:arrow-right-line">{{ $t('common.open') }}</UButton>
      </UCard>
    </div>
  </div>
  
</template>

<script setup lang="ts">
// Admin landing page
const { t } = useI18n()
const url = useRequestURL()
const origin = computed(() => `${url.protocol}//${url.host}`)
const pageUrl = computed(() => `${origin.value}/admin`)
const title = computed(() => `${t('app.title')} – ${t('admin.section')}`)
const description = computed(() => t('admin.title'))

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
</script>

<style scoped>
</style>
