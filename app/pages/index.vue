<template>
  <div class="container mx-auto p-4 space-y-6">
    <div class="flex items-center justify-between gap-3 flex-col sm:flex-row">
      <div>
        <h1 class="text-2xl font-bold">{{ $t('index.hi', { name: nameDisplay }) }} <USkeleton v-if="!nameDisplay" class="h-5 w-40 inline-block" /></h1>
        <p class="text-gray-600">
          {{ $t('index.summary', { count: links.length, views: totalViews }) }}
        </p>
      </div>
      <UButton to="/generate" icon="mingcute:add-line" class="w-full sm:w-auto">{{ $t('index.createNew') }}</UButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="item in links" :key="item.id">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold truncate">{{ item.title || item.slug }}</h3>
              <p class="text-xs text-gray-500">/{{ item.slug }}</p>
            </div>
            <UBadge color="neutral" variant="soft">{{ $t('badges.views', { count: item.visitCount || 0 }) }}</UBadge>
          </div>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 break-all">{{ item.url }}</p>
        </div>
        <template #footer>
          <div class="flex items-center gap-2">
            <UButton size="sm" color="primary" :to="`/qr/${item.slug}`" icon="mingcute:edit-line">{{ $t('common.manage') }}</UButton>
            <UButton size="sm" :to="`/l/${item.slug}`" variant="soft"  target="_blank" icon="mingcute:external-link-line">{{ $t('common.open') }}</UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { links, refresh } = useLinks()
const { t } = useI18n()

const { data: me } = useFetch('/api/me', {lazy: true, {server: false})
const nameDisplay = computed(() => me.value?.username )

const totalViews = computed(() => links.value.reduce((acc, l) => acc + (l.visitCount || 0), 0))

const url = useRequestURL()
const shortUrl = (slug: string) => `${url.protocol}//${url.host}/l/${slug}`

const origin = computed(() => `${url.protocol}//${url.host}`)
const pageUrl = computed(() => `${origin.value}/`)
const title = computed(() => `${t('app.title')} – ${t('nav.home')}`)
const description = computed(() => t('index.summary', { count: links.value.length, views: totalViews.value }))

useHead(() => ({
  title: title.value,
  link: [
    { rel: 'canonical', href: pageUrl.value },
  ],
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

onMounted(async () => {
  try { await refresh() } catch (_) {}
})

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text) } catch (_) {}
}
</script>
