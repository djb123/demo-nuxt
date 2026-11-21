<script setup lang="ts">
import { removeFavorite } from '~/lib/db'
import type { FavoriteCat } from '~/lib/types'
const props = defineProps<{ cat: FavoriteCat }>()
const busy = ref(false)
const error = ref('')
async function remove() {
  if (props.cat.id == null) return
  busy.value = true
  try { await removeFavorite(props.cat.id) }
  catch { error.value = 'Could not remove photo.' }
  finally { busy.value = false }
}
</script>

<template>
  <div class="group card relative overflow-hidden bg-base-100 shadow-md">
    <figure class="aspect-square overflow-hidden bg-base-200"><img :src="cat.imageDataUrl ?? cat.imageUrl ?? ''" :alt="cat.name ?? 'Cat'" class="h-full w-full object-cover" loading="lazy" /></figure>
    <button class="btn absolute top-2 right-2 btn-circle shadow transition-opacity btn-xs btn-error sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100" aria-label="Remove from favorites" :disabled="busy" @click="remove">✕</button>
    <div v-if="cat.name" class="px-3 py-2"><p class="truncate text-sm font-medium">{{ cat.name }}</p></div>
    <p v-if="error" class="p-2 text-sm text-error" role="alert">{{ error }}</p>
  </div>
</template>
