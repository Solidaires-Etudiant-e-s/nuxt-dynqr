export type Me = { username: string | null; role: 'admin' | 'user' | null }

export function useMe() {
  const me = useState<Me | null>('me', () => null)

  async function refreshMe() {
    try {
      me.value = (await $fetch('/api/me')) as any
    } catch (_) {
      me.value = { username: null, role: null }
    }
  }

  return { me, refreshMe }
}

