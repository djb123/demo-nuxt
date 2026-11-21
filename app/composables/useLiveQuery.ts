import { liveQuery } from 'dexie'
import type { WatchSource } from 'vue'

/** Subscribe after hydration; dispose subscriptions on dependency changes/unmount. */
export function useLiveQuery<T>(query: () => T | Promise<T>, initial: T, sources: WatchSource[] = []) {
  const data = shallowRef<T>(initial)
  const pending = ref(true)
  const error = ref('')
  let unsubscribe: (() => void) | undefined

  function subscribe() {
    unsubscribe?.()
    pending.value = true
    error.value = ''
    const subscription = liveQuery(query).subscribe({
      next(value) { data.value = value; pending.value = false },
      error(reason) {
        error.value = reason instanceof Error ? reason.message : 'Could not read local data.'
        pending.value = false
      },
    })
    unsubscribe = () => subscription.unsubscribe()
  }

  onMounted(() => {
    subscribe()
    if (sources.length) watch(sources, subscribe, { flush: 'sync' })
  })
  onBeforeUnmount(() => unsubscribe?.())
  return { data, pending, error }
}
