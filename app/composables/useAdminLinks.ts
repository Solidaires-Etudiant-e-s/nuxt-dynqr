import type { Ref } from 'vue'
import type { Link } from '~/app/composables/useLinks'

export function useAdminLinks() {
  const items: Ref<Link[]> = useState<Link[]>('admin-links', () => [])

  async function refresh() {
    const data = await $fetch<Link[]>('/api/admin/links')
    items.value = Array.isArray(data) ? data : []
  }

  async function toggleActive(id: number, current: boolean) {
    await $fetch(`/api/admin/links/${id}`, { method: 'PATCH', body: { isActive: !current } })
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx].isActive = !current
  }

  async function remove(id: number) {
    await $fetch(`/api/admin/links/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, refresh, toggleActive, remove }
}

