import { getDB } from '~/lib/db'
import type { FavoriteCat } from '~/lib/types'

export function useFavorites() {
  return useLiveQuery<FavoriteCat[]>(() => getDB().favorites.orderBy('addedAt').reverse().toArray(), [])
}
