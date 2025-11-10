<template>
  <div class="container mx-auto p-4 space-y-4">
    <div class="flex items-center justify-between gap-2 flex-col sm:flex-row">
      <h1 class="text-2xl font-bold">{{ $t('admin.qrList') }}</h1>
      <UInput v-model="q" :placeholder="$t('admin.search')" icon="tabler:search" class="w-full sm:w-64" />
    </div>

    <UCard>
      <div class="overflow-x-auto">
      <UTable :data="filtered" :columns="columns" :empty="$t('admin.empty')">
        <template #slug-cell="{ row }">
          <NuxtLink class="text-primary-600 hover:underline" :to="`/qr/${row.original.slug}`">/{{ row.original.slug }}</NuxtLink>
        </template>
        <template #ownerUsername-cell="{ row }">
          <UBadge variant="soft" color="neutral">{{ row.original.ownerUsername }}</UBadge>
        </template>
        <template #isActive-cell="{ row }">
          <UBadge :color="row.original.isActive ? 'success' : 'error'" variant="soft">{{ row.original.isActive ? $t('common.yes') : $t('common.no') }}</UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton size="xs" :to="`/qr/${row.original.slug}`" icon="tabler:qrcode">{{ $t('common.manage') }}</UButton>
            <UButton size="xs" color="neutral" variant="soft" @click="() => toggle(row.original)" :icon="row.original.isActive ? 'tabler:toggle-right' : 'tabler:toggle-left'">
              {{ row.original.isActive ? $t('admin.deactivate') : $t('admin.activate') }}
            </UButton>
            <UButton size="xs" color="error" variant="soft" @click="() => del(row.original)"> {{ $t('admin.delete') }} </UButton>
          </div>
        </template>
      </UTable>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
const { items, refresh, toggleActive, remove } = useAdminLinks()
const q = ref('')

const columns: ColumnDef<any, any>[] = [
  { accessorKey: 'title', header: 'Titre' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'url', header: 'URL' },
  { accessorKey: 'ownerUsername', header: 'Propriétaire' },
  { accessorKey: 'visitCount', header: 'Vues' },
  { accessorKey: 'isActive', header: 'Actif' },
  { id: 'actions', header: '' },
]

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return items.value
  return items.value.filter(r =>
    (r.title || '').toLowerCase().includes(s) ||
    r.slug.toLowerCase().includes(s) ||
    (r.url || '').toLowerCase().includes(s) ||
    (r.ownerUsername || '').toLowerCase().includes(s)
  )
})

function toggle(row: any) {
  toggleActive(row.id, !!row.isActive)
}

function del(row: any) {
  if (confirm('Supprimer ce lien ?')) remove(row.id)
}

onMounted(async () => {
  try { await refresh() } catch (_) {}
})
</script>

<style scoped>
</style>
