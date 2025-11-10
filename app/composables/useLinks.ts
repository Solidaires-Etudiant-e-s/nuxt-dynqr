import type { Ref } from 'vue'

export type Link = {
  id: number
  slug: string
  url: string
  title?: string | null
  ownerUsername?: string
  isActive?: boolean
  visitCount?: number
}

export function useLinks() {
  const links: Ref<Link[]> = useState<Link[]>('links', () => [])

  async function refresh() {
    const data = await $fetch<Link[]>('/api/links')
    links.value = Array.isArray(data) ? data : []
  }

  function add(link: Link) {
    // Prepend new link to list; ensure unique by id
    links.value = [link, ...links.value.filter(l => l.id !== link.id)]
  }

  return { links, refresh, add }
}
