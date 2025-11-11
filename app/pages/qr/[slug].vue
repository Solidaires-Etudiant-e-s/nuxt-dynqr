<template>
  <div class="container mx-auto p-4 max-w-4xl space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-2 flex-col sm:flex-row">
          <div>
            <h1 class="text-xl font-semibold">{{ $t('qr.title', { slug }) }}</h1>
            <p class="text-sm text-gray-500">
              {{ $t('qr.views', { count: link?.visitCount ?? 0 }) }} ·
              {{ $t('qr.active', { value: link?.isActive ? $t('common.yes') : $t('common.no') }) }}
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <UButton :to="`/l/${slug}`" target="_blank" icon="tabler:external-link">{{ $t('common.open') }}</UButton>
            <UButton color="neutral" variant="soft" @click="copy(shortUrl)" icon="tabler:copy">{{ $t('qr.copyUrl') }}</UButton>
            <UButton :color="link?.isActive ? 'success' : 'error'" variant="soft" :icon="link?.isActive ? 'tabler:toggle-right' : 'tabler:toggle-left'" @click="toggleActive" :disabled="toggling">
              {{ link?.isActive ? $t('status.activated') : $t('status.disabled') }}
            </UButton>
            <UButton color="error" variant="soft" icon="tabler:trash" @click="removeLink" :disabled="deleting">{{ $t('common.delete') }}</UButton>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <UForm :state="edit" class="space-y-2" @submit.prevent="save">
          <UFormField :label="$t('generate.titleLabel')" name="title" :error="errors.title">
            <UInput v-model="edit.title" placeholder="Mon lien" class="w-full" />
          </UFormField>
          <UFormField :label="$t('generate.url')" name="url" :error="errors.url">
            <UInput v-model="edit.url" type="url" placeholder="https://example.com" class="w-full" />
          </UFormField>
          <div class="flex items-center gap-2">
            <UButton type="submit" :loading="saving">{{ $t('qr.save') }}</UButton>
            <UButton color="neutral" variant="ghost" @click="() => (edit.url = link?.url || '')" :disabled="saving">{{ $t('qr.reset') }}</UButton>
          </div>
        </UForm>

        <USeparator :label="$t('qr.section.qrcodes')" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-medium">{{ $t('qr.section.preview') }}</h3>
              </div>
            </template>
            <div class="flex flex-col items-center gap-3">
              <div class="relative max-w-full" :style="{ width: qrSize + 'px', height: qrSize + 'px' }">
                <div ref="qrContainerRef" class="border rounded-md absolute inset-0" />
              </div>
              <div class="flex items-center gap-2">
                <UButton size="sm" variant="soft" color="neutral" @click="downloadPNG">Download PNG</UButton>
                <UButton size="sm" variant="soft" color="neutral" @click="downloadSVG">Download SVG</UButton>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="font-medium">{{ $t('qr.section.customize') }}</h3>
            </template>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3 items-center">
                <span>{{ $t('qr.foreground') }}</span>
                <UInput v-model="foreground" type="color" />

                <span>{{ $t('qr.background') }}</span>
                <UInput v-model="background" type="color" />

                <span>{{ $t('qr.ecLevel') }}</span>
                <USelect v-model="ecLevel" :items="ecOptions" />

                <span>{{ $t('qr.dots') }}</span>
                <USelect v-model="dotsType" :items="dotsTypeOptions" />

                <span>{{ $t('qr.cornersSquare') }}</span>
                <USelect v-model="cornersSquareType" :items="cornersSquareTypeOptions" />

                <span>{{ $t('qr.cornersDot') }}</span>
                <USelect v-model="cornersDotType" :items="cornersDotTypeOptions" />
              </div>
              <div>
                <UCheckbox v-model="transparentBg" :label="$t('qr.transparentBg')" />
              </div>

              <USeparator :label="$t('qr.section.centerImage')" />
              <div class="space-y-3">
                <UCheckbox v-model="overlayEnabled" :label="$t('qr.enableCenterImage')" />
                <div v-if="overlayEnabled" class="grid grid-cols-2 gap-3 items-center">
                  <span>{{ $t('qr.centerImageSource') }}</span>
                  <USelect v-model="overlaySource" :items="overlaySourceOptions" />

                  <template v-if="overlaySource === 'brand'">
                    <span>{{ $t('qr.chooseBrand') }}</span>
                    <USelect v-model="selectedBrandImageVal" :items="brandImageOptions" />
                  </template>

                  <template v-else-if="overlaySource === 'upload'">
                    <span>{{ $t('qr.uploadImage') }}</span>
                    <div class="flex items-center gap-2">
                      <input type="file" ref="uploadRef" accept="image/*" @change="onOverlayPick" />
                    </div>
                  </template>

                  <template v-else>
                    <span>{{ $t('qr.chooseIcon') }}</span>
                    <IconPicker v-model="selectedIcon" :placeholder="$t('qr.chooseIcon')" />
                  </template>

                  <span>{{ $t('qr.centerSize') }}</span>
                  <input type="range" min="10" max="35" v-model.number="overlaySizePercent" />

                  <span>{{ $t('qr.rounded') }}</span>
                  <UCheckbox v-model="overlayRounded" />
                </div>
              </div>
            </div>
          </UCard>
        </div>

      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import QRCodeStyling from 'qr-code-styling'
import { useRoute, useRequestURL } from '#app'

type Link = { id: number; slug: string; url: string; visitCount: number; isActive: boolean }

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const link = ref<Link | null>(null)

const edit = reactive({ url: '', title: '' })
const errors = reactive<{ url?: string; title?: string }>({})
const saving = ref(false)
const toggling = ref(false)
const deleting = ref(false)

const urlObj = useRequestURL()
const shortUrl = computed(() => `${urlObj.protocol}//${urlObj.host}/l/${slug.value}`)
const origin = computed(() => `${urlObj.protocol}//${urlObj.host}`)
const pageUrl = computed(() => `${origin.value}/qr/${slug.value}`)
const titleText = computed(() => (edit.title?.trim() ? edit.title : `/${slug.value}`))
const pageTitle = computed(() => `${titleText.value} – ${t('app.title')}`)
const description = computed(() => edit.url ? `Short link ${shortUrl.value} → ${edit.url}` : `Short link ${shortUrl.value}`)

useHead(() => ({
  title: pageTitle.value,
  link: [
    { rel: 'canonical', href: pageUrl.value },
  ],
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: description.value },
    { property: 'og:type', content: 'website' },
    // Use the shareable short URL for better previews
    { property: 'og:url', content: shortUrl.value },
    { property: 'og:image', content: `${origin.value}/favicon.png` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageTitle.value },
    { name: 'twitter:description', content: description.value },
    { name: 'twitter:image', content: `${origin.value}/favicon.png` },
  ],
}))

// QR state
const qrContainerRef = ref<HTMLElement | null>(null)
let qr: QRCodeStyling | null = null
const qrSize = ref(384)
function updateQrSize() {
  if (typeof window === 'undefined') return
  const w = window.innerWidth || 1024
  const target = Math.max(200, Math.min(256, w - 64))
  if (qrSize.value !== target) {
    qrSize.value = target
    // update QR preview to new dimensions
    ensureQr()
  }
}
const qrMargin = 2
const foreground = ref('#000000')
const background = ref('#ffffff')
const ecLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const prevEcLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const transparentBg = ref(false)

const ecOptions = [
  { label: 'Low (L)', value: 'L' },
  { label: 'Medium (M)', value: 'M' },
  { label: 'Quartile (Q)', value: 'Q' },
  { label: 'High (H)', value: 'H' }
]
// Styling controls
const dotsTypeOptions = computed(() => [
  { label: t('qr.opt.square'), value: 'square' },
  { label: t('qr.opt.dots'), value: 'dots' },
  { label: t('qr.opt.rounded'), value: 'rounded' },
  { label: t('qr.opt.extraRounded'), value: 'extra-rounded' },
  { label: t('qr.opt.classy'), value: 'classy' },
  { label: t('qr.opt.classyRounded'), value: 'classy-rounded' },
])
const cornersSquareTypeOptions = computed(() => [
  { label: t('qr.opt.square'), value: 'square' },
  { label: t('qr.opt.dot'), value: 'dot' },
  { label: t('qr.opt.rounded'), value: 'rounded' },
  { label: t('qr.opt.extraRounded'), value: 'extra-rounded' },
  { label: t('qr.opt.dots'), value: 'dots' },
  { label: t('qr.opt.classy'), value: 'classy' },
  { label: t('qr.opt.classyRounded'), value: 'classy-rounded' },
])
const cornersDotTypeOptions = computed(() => [
  { label: t('qr.opt.square'), value: 'square' },
  { label: t('qr.opt.dot'), value: 'dot' },
  { label: t('qr.opt.rounded'), value: 'rounded' },
  { label: t('qr.opt.extraRounded'), value: 'extra-rounded' },
  { label: t('qr.opt.dots'), value: 'dots' },
  { label: t('qr.opt.classy'), value: 'classy' },
  { label: t('qr.opt.classyRounded'), value: 'classy-rounded' },
])
const dotsType = ref<'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'>('square')
const cornersSquareType = ref<'square' | 'dot' | 'rounded' | 'extra-rounded' | 'dots' | 'classy' | 'classy-rounded'>('square')
const cornersDotType = ref<'dot' | 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded'>('square')
// shape fixed to square (no control)

watch([foreground, background, ecLevel, transparentBg], () => ensureQr())

// Center image overlay state
const overlayEnabled = ref(false)
const overlaySource = ref<'brand' | 'upload' | 'icon'>('brand')
const { t } = useI18n()
const overlaySourceOptions = computed(() => [
  { label: t('qr.source.brand'), value: 'brand' },
  { label: t('qr.source.upload'), value: 'upload' },
  { label: t('qr.source.icon'), value: 'icon' },
])
const { brand, images: brandImages, refreshPublic: refreshBrand, refreshImagesPublic: refreshBrandImages } = useBrand()
const selectedBrandImageVal = ref<string>('logo')
const brandImageOptions = computed(() => {
  const opts = [] as { label: string; value: string }[]
  for (const img of brandImages.value) opts.push({ label: img.imageUrl.split('/').pop() || 'Image', value: `image:${img.id}` })
  if (!opts.length) opts.push({ label: 'None', value: 'none' })
  return opts
})
const overlaySizePercent = ref(22)
const overlayRounded = ref(true)
const uploadRef = ref<HTMLInputElement | null>(null)
const overlayUploadFile = ref<File | null>(null)
const overlayUploadDataUrl = ref<string | null>(null)
const selectedIcon = ref<string>('')

watch([overlayEnabled, overlaySource, brand, overlaySizePercent, overlayRounded], () => ensureQr())
watch([selectedBrandImageVal, () => brandImages.value.length], () => ensureQr())
watch(selectedIcon, () => ensureQr())
watch([dotsType, cornersSquareType, cornersDotType], () => ensureQr())

// Ensure high error correction when center image is enabled
watch(overlayEnabled, (enabled) => {
  if (enabled) {
    prevEcLevel.value = ecLevel.value
    if (ecLevel.value !== 'H') ecLevel.value = 'H'
  } else {
    ecLevel.value = prevEcLevel.value
  }
})

async function fetchLink() {
  const data = await $fetch<Link>(`/api/links/${slug.value}`)
  link.value = data
  edit.url = data.url
  edit.title = (data as any).title || ''
}

function validate() {
  errors.url = undefined
  errors.title = undefined
  if (!edit.url || !/^https?:\/\//i.test(edit.url)) {
    errors.url = $t('validation.invalidUrl') as string
  }
  if (edit.title && edit.title.length > 191) {
    errors.title = $t('validation.titleTooLong') as string
  }
  return !errors.url
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    const updated = await $fetch<Link>(`/api/links/${slug.value}`, { method: 'PATCH', body: { url: edit.url, title: edit.title } })
    link.value = updated
  } catch (err: any) {
    // surface minimal error, UI could be improved later
    errors.url = err?.data?.statusMessage || err?.message || 'Update failed'
  } finally {
    saving.value = false
  }
}

async function toggleActive() {
  if (!link.value) return
  toggling.value = true
  try {
    const updated = await $fetch<Link>(`/api/links/${slug.value}`, { method: 'PATCH', body: { isActive: !link.value.isActive } })
    link.value = updated
  } catch (err) {
    // ignore or surface a toast later
  } finally {
    toggling.value = false
  }
}

async function removeLink() {
  if (!link.value) return
  if (!confirm('Delete this link?')) return
  deleting.value = true
  try {
    const res = await $fetch<{ deleted: number }>(`/api/links/${slug.value}`, { method: 'DELETE' })
    if (res?.deleted) {
      await navigateTo('/')
    }
  } catch (err) {
    // ignore or surface a toast later
  } finally {
    deleting.value = false
  }
}

async function draw() {
  if (!canvasRef.value) return
  try {
    await QRCode.toCanvas(canvasRef.value, shortUrl.value, {
      width: qrSize.value,
      margin: qrMargin,
      color: {
        dark: foreground.value,
        light: transparentBg.value ? '#0000' : background.value,
      },
      errorCorrectionLevel: ecLevel.value,
    })

    // Overlay center image if enabled
    if (overlayEnabled.value) {
      const ctx = canvasRef.value.getContext('2d')
      if (!ctx) return
      const size = Math.round((overlaySizePercent.value / 100) * qrSize.value)
      const x = Math.round((qrSize.value - size) / 2)
      const y = Math.round((qrSize.value - size) / 2)

      let src: string | null = null
      if (overlaySource.value === 'upload') {
        src = overlayUploadDataUrl.value
      } else if (overlaySource.value === 'brand') {
        if (selectedBrandImageVal.value.startsWith('image:')) {
          const id = Number(selectedBrandImageVal.value.split(':')[1])
          const img = brandImages.value.find(i => i.id === id)
          src = img?.imageUrl || null
        } else src = null
      } else if (overlaySource.value === 'icon') {
        if (selectedIcon.value) {
          const color = encodeURIComponent(foreground.value)
          src = `https://api.iconify.design/tabler:${selectedIcon.value}.svg?color=${color}`
        }
      }
      if (src) {
        await new Promise<void>((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            ctx.save()
            if (overlaySource.value === 'icon') {
              const radius = Math.floor(size / 2)
              ctx.beginPath()
              ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2)
              ctx.closePath()
              ctx.fillStyle = background.value
              ctx.fill()
              ctx.clip()
              const iconSize = Math.round(size * 0.65)
              const ix = Math.round(x + (size - iconSize) / 2)
              const iy = Math.round(y + (size - iconSize) / 2)
              ctx.drawImage(img, ix, iy, iconSize, iconSize)
            } else {
              if (overlayRounded.value) {
                const r = Math.min(12, size / 4)
                ctx.beginPath()
                ctx.moveTo(x + r, y)
                ctx.arcTo(x + size, y, x + size, y + size, r)
                ctx.arcTo(x + size, y + size, x, y + size, r)
                ctx.arcTo(x, y + size, x, y, r)
                ctx.arcTo(x, y, x + size, y, r)
                ctx.closePath()
                ctx.clip()
              }
              ctx.drawImage(img, x, y, size, size)
            }
            ctx.restore()
            resolve()
          }
          img.src = src!
        })
      }
    }
  } catch (e) {
    // ignore
  }
}

async function downloadPNG() {
  if (!qr) return
  const blob = await qr.getRawData('png')
  if (!blob) return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug.value}.png`
  a.click()
  URL.revokeObjectURL(url)
}

async function downloadSVG() {
  if (!qr) return
  const blob = await qr.getRawData('svg')
  if (!blob) return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug.value}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

function overlayImageUrl(): string | undefined {
  if (!overlayEnabled.value) return undefined
  if (overlaySource.value === 'upload') return overlayUploadDataUrl.value || undefined
  if (overlaySource.value === 'brand') {
    if (selectedBrandImageVal.value.startsWith('image:')) {
      const id = Number(selectedBrandImageVal.value.split(':')[1])
      const img = brandImages.value.find(i => i.id === id)
      return img?.imageUrl ? (img.imageUrl.startsWith('http') ? img.imageUrl : `${location.origin}${img.imageUrl}`) : undefined
    }
    return undefined
  }
  if (overlaySource.value === 'icon' && selectedIcon.value) {
    const color = encodeURIComponent(foreground.value)
    return `https://api.iconify.design/tabler:${selectedIcon.value}.svg?color=${color}`
  }
  return undefined
}

function buildOptions() {
  return {
    width: qrSize.value,
    height: qrSize.value,
    type: 'svg',
    data: shortUrl.value,
    image: overlayImageUrl(),
    margin: qrMargin,
    // shape fixed to 'square'
    qrOptions: { errorCorrectionLevel: ecLevel.value },
    dotsOptions: { color: foreground.value, type: dotsType.value },
    backgroundOptions: { color: transparentBg.value ? 'transparent' : background.value },
    cornersSquareOptions: { color: foreground.value, type: cornersSquareType.value },
    cornersDotOptions: { color: foreground.value, type: cornersDotType.value },
    imageOptions: {
      crossOrigin: 'anonymous',
      hideBackgroundDots: true,
      imageSize: Math.min(0.5, Math.max(0.1, overlaySizePercent.value / 100)),
      margin: 0,
      saveAsBlob: true,
    },
  } as any
}

async function ensureQr() {
  if (!qr) {
    qr = new (QRCodeStyling as any)(buildOptions())
    if (qrContainerRef.value) (qr as any).append(qrContainerRef.value)
  } else {
    ;(qr as any).update(buildOptions() as any)
  }
}

// preview uses qr-code-styling only; no overlay layer

/* legacy helper removed */
async function withSvgOverlay(svg: string): Promise<string> {
  let src: string | null = null
  if (overlaySource.value === 'upload') {
    src = overlayUploadDataUrl.value
  } else if (overlaySource.value === 'brand') {
    if (selectedBrandImageVal.value.startsWith('image:')) {
      const id = Number(selectedBrandImageVal.value.split(':')[1])
      const img = brandImages.value.find(i => i.id === id)
      src = img?.imageUrl ? location.origin + img.imageUrl : null
    } else src = null
  } else if (overlaySource.value === 'icon') {
    if (selectedIcon.value) {
      const color = encodeURIComponent(foreground.value)
      src = `https://api.iconify.design/tabler:${selectedIcon.value}.svg?color=${color}`
      const size = Math.round((overlaySizePercent.value / 100) * qrSize.value)
      const x = Math.round((qrSize.value - size) / 2)
      const y = Math.round((qrSize.value - size) / 2)
      const radius = Math.floor(size / 2)
      const cx = x + radius
      const cy = y + radius
      const clipId = 'clip' + Math.random().toString(36).slice(2)
      const defs = `<defs><clipPath id="${clipId}"><circle cx="${cx}" cy="${cy}" r="${radius}" /></clipPath></defs>`
      const circle = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${background.value}" />`
      const iconSize = Math.round(size * 0.65)
      const ix = Math.round(x + (size - iconSize) / 2)
      const iy = Math.round(y + (size - iconSize) / 2)
      const imageEl = `<image href="${src}" x="${ix}" y="${iy}" width="${iconSize}" height="${iconSize}" clip-path="url(#${clipId})" />`
      return svg.replace('</svg>', `${defs}${circle}${imageEl}</svg>`)
    }
  }
  if (!src) return svg
  const size = Math.round((overlaySizePercent.value / 100) * qrSize.value)
  const x = Math.round((qrSize.value - size) / 2)
  const y = Math.round((qrSize.value - size) / 2)
  const id = 'clip' + Math.random().toString(36).slice(2)
  const clipDef = overlayRounded.value
    ? `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${Math.min(12, size / 4)}" ry="${Math.min(12, size / 4)}" /></clipPath></defs>`
    : ''
  const imageEl = `<image href="${src}" x="${x}" y="${y}" width="${size}" height="${size}" ${overlayRounded.value ? `clip-path="url(#${id})"` : ''} />`
  return svg.replace('</svg>', `${clipDef}${imageEl}</svg>`)
}

function onOverlayPick(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0] || null
  overlayUploadFile.value = f
  if (f) {
    const reader = new FileReader()
    reader.onload = () => { overlayUploadDataUrl.value = String(reader.result || '') ; ensureQr() }
    reader.readAsDataURL(f)
  } else {
    overlayUploadDataUrl.value = null
    ensureQr()
  }
}

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text) } catch (_) {}
}

const brandColorsApplied = ref(false)

onMounted(async () => {
  updateQrSize()
  if (typeof window !== 'undefined') window.addEventListener('resize', updateQrSize)
  await fetchLink()
  try { await refreshBrand() } catch (_) {}
  try { await refreshBrandImages() } catch (_) {}
  if (!brandColorsApplied.value && brand.value) {
    if (brand.value.fgColor) foreground.value = brand.value.fgColor
    if (brand.value.bgColor) background.value = brand.value.bgColor
    brandColorsApplied.value = true
  }
  // Default selected brand image
  if (brandImages.value.length) selectedBrandImageVal.value = `image:${brandImages.value[0].id}`
  else selectedBrandImageVal.value = 'none'
  await ensureQr()
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', updateQrSize)
})

watch(brand, (b) => {
  if (!brandColorsApplied.value && b) {
    if (b.fgColor) foreground.value = b.fgColor
    if (b.bgColor) background.value = b.bgColor
    brandColorsApplied.value = true
  }
})
</script>

<style scoped>
</style>
