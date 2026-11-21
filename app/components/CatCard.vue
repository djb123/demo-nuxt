<script setup lang="ts">
import { getDB, removeFavorite } from '~/lib/db'
import type { CatImage, FavoriteCat } from '~/lib/types'
const props = defineProps<{ image: CatImage; favorite?: FavoriteCat }>()
const busy = ref(false)
const error = ref('')
async function toggleFavorite() {
  busy.value = true
  error.value = ''
  try {
    if (props.favorite?.id != null) await removeFavorite(props.favorite.id)
    else await getDB().favorites.add({ catApiId: props.image.id, imageUrl: props.image.url, name: props.image.breeds?.[0]?.name, isUploaded: false, addedAt: new Date() })
  } catch { error.value = 'Could not update favorites.' }
  finally { busy.value = false }
}
</script>

<template>
  <div class="group card overflow-hidden bg-base-100 shadow-md transition-shadow hover:shadow-lg">
    <figure class="relative aspect-square overflow-hidden bg-base-200">
      <img :src="image.url" :alt="image.breeds?.[0]?.name ?? 'Cat'" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
    </figure>
    <div class="card-actions items-center justify-between px-3 py-2">
      <span v-if="image.breeds?.length" class="badge max-w-32 truncate badge-ghost text-xs">{{ image.breeds[0]?.name }}</span><span v-else />
      <button class="btn btn-circle btn-ghost btn-sm" :aria-label="favorite ? 'Remove from favorites' : 'Add to favorites'" :aria-pressed="!!favorite" :disabled="busy" @click="toggleFavorite">
        <svg class="h-5 w-5" :class="{ 'text-error': favorite }" :fill="favorite ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
      </button>
    </div>
    <p v-if="error" role="alert" class="px-3 pb-2 text-sm text-error">{{ error }}</p>
  </div>
</template>
