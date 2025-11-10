<template>
  <UDashboardGroup>
    <UDashboardSidebar class="w-64 pt-2">
      <UButton :to="'/generate'" icon="tabler:plus">
        {{ $t('nav.create') }}
      </UButton>
      <UNavigationMenu :items="navigationMenu" orientation="vertical" />

    </UDashboardSidebar>
    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="$t('app.title')" />
      </template>
      <template #body>
    <slot />
      </template>
    </UDashboardPanel>

  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const { links, refresh } = useLinks()
const { t } = useI18n()
const { me, refreshMe } = useMe()

const navigationMenu = computed<NavigationMenuItem[]>(() => {
  const base: NavigationMenuItem[] = [
    {
      label: t('nav.home'),
      to: '/',
      icon: 'tabler:home',
    },
    {
      label: t('nav.myQRCodes'),
      icon: 'tabler:qrcode',
      badge: links.value.length || 0,
      defaultOpen: true,
      children: links.value.map((link) => ({
        label: link.title || link.slug,
        to: `/qr/${link.slug}`,
      })),
    },
  ]
  if (me.value?.role === 'admin') {
    base.push({
      label: t('admin.section'),
      to: '/admin',
      icon: 'tabler:shield-lock',
      defaultOpen: true,
      children: [
        { label: t('admin.qrList'), to: '/admin/qr-list', icon: 'tabler:list-details' },
        { label: t('admin.brand'), to: '/admin/brand', icon: 'tabler:brand-appgallery' },
      ],
    })
  }
  return base
})

onMounted(async () => {
  try {
    await refresh()
  } catch (error) {
    console.error('Failed to fetch links:', error)
  }
  try { await refreshMe() } catch (_) { }
})
</script>
