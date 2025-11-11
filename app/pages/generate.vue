<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-2 flex-col sm:flex-row">
          <h1 class="text-xl font-semibold">{{ $t('generate.title') }}</h1>
        </div>
      </template>

      <UForm :state="form" class="space-y-4" @submit.prevent="onSubmit">
        <UFormField :label="$t('generate.url')" name="url" :error="errors.url">
          <UInput v-model="form.url" placeholder="https://example.com/page" type="url" required class="w-full" />
        </UFormField>

        <UFormField :label="$t('generate.titleLabel')" name="title" :error="errors.title">
          <UInput v-model="form.title" placeholder="My Awesome Link" />
        </UFormField>

        <UFormField :label="$t('generate.slug')" name="slug" :error="errors.slug">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-gray-500">{{ basePath }}/l/</span>
            <UInput v-model="form.slug" placeholder="my-link" />
          </div>
          <p v-if="previewShort" class="text-xs text-gray-500 mt-1">{{ $t('generate.preview') }}: {{ previewShort }}</p>
        </UFormField>

        <div class="flex items-center gap-2">
          <UButton type="submit" :loading="loading" :disabled="loading">{{ $t('generate.create') }}</UButton>
          <UButton color="neutral" variant="ghost" @click="() => onReset()" :disabled="loading">{{ $t('generate.reset') }}</UButton>
        </div>
      </UForm>

      <div v-if="errorMsg" class="mt-4">
        <UAlert color="error" variant="soft" :title="$t('generate.error')" :description="errorMsg" />
      </div>

      
    </UCard>
  </div>
  
</template>

<script setup lang="ts">
const { t } = useI18n()

type CreatedLink = {
  id: number
  slug: string
  url: string
  title?: string | null
}

const url = useRequestURL()
const basePath = computed(() => `${url.protocol}//${url.host}`)
const origin = computed(() => basePath.value)
const pageUrl = computed(() => `${origin.value}/generate`)

const title = computed(() => `${t('app.title')} – ${t('generate.title')}`)
const description = computed(() => t('generate.title'))

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

const form = reactive({ url: '', slug: '', title: '' })
const errors = reactive<{ url?: string; slug?: string; title?: string }>({})
const loading = ref(false)
const errorMsg = ref('')
// success alert removed because we redirect immediately after creation
const { add } = useLinks()

const previewShort = computed(() => form.slug ? `${basePath.value}/l/${form.slug}` : '')

//

function validate() {
  errors.url = undefined
  errors.slug = undefined
  if (!form.url || !/^https?:\/\//i.test(form.url)) {
    errors.url = t('validation.invalidUrl')
  }
  if (form.title && form.title.length > 191) {
    errors.title = t('validation.titleTooLong')
  }
  if (form.slug && !/^[A-Za-z0-9_-]+$/.test(form.slug)) {
    errors.slug = t('validation.invalidSlug')
  }
  return !errors.url && !errors.slug && !errors.title
}

async function onSubmit() {
  errorMsg.value = ''
  
  if (!validate()) return
  loading.value = true
  try {
    const body: Record<string, string> = { url: form.url }
    if (form.slug) body.slug = form.slug
    if (form.title) body.title = form.title
    const res = await $fetch<CreatedLink>('/api/links', { method: 'POST', body })
    // add to global links list so layout updates immediately
    add(res as any)
    onReset(false)
    await navigateTo(`/qr/${res.slug}`)
  } catch (err: any) {
    const statusMessage = err?.data?.statusMessage || err?.message || 'Unknown error'
    errorMsg.value = statusMessage
  } finally {
    loading.value = false
  }
}

function onReset(resetMessages = true) {
  form.url = ''
  form.slug = ''
  form.title = ''
  errors.url = undefined
  errors.slug = undefined
  errors.title = undefined
  if (resetMessages) {
    errorMsg.value = ''
  }
}

// copy helper no longer needed here
</script>

<style scoped>
</style>
