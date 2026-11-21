<script setup lang="ts">
import type { FavoriteCat } from '~/lib/types'
const open = defineModel<boolean>({ default: false })
defineProps<{ monthName: string; busy?: boolean; error?: string }>()
const emit = defineEmits<{ pick: [cat: FavoriteCat] }>()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const searchTerm = ref('')
const { data: favorites, pending, error: dbError } = useFavorites()
const filtered = computed(() => favorites.value.filter(cat => !searchTerm.value.trim() || cat.name?.toLowerCase().includes(searchTerm.value.trim().toLowerCase())))
watchEffect(() => {
  if (!dialog.value) return
  if (open.value && !dialog.value.open) { searchTerm.value = ''; dialog.value.showModal() }
  else if (!open.value && dialog.value.open) dialog.value.close()
})
</script>

<template>
  <dialog ref="dialog" class="modal" aria-labelledby="picker-title" @close="open = false">
    <div class="modal-box w-full max-w-3xl">
      <h3 id="picker-title" class="mb-4 text-lg font-bold">Choose photo for <span class="text-primary">{{ monthName }}</span></h3>
      <input v-model="searchTerm" type="search" aria-label="Search photos by name" placeholder="Search by name…" class="input input-sm mb-4 w-full" />
      <div v-if="error || dbError" role="alert" class="alert alert-error mb-3">{{ error || dbError }}</div>
      <p v-if="pending" role="status">Loading photos…</p>
      <div v-else-if="!favorites.length" class="alert"><span>No favorites yet. <NuxtLink to="/browse" class="link">Browse</NuxtLink> or <NuxtLink to="/upload" class="link">upload</NuxtLink> cat photos first.</span></div>
      <div v-else-if="!filtered.length" class="alert">No cats match your search.</div>
      <div v-else class="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4">
        <button v-for="cat in filtered" :key="cat.id" class="aspect-square overflow-hidden rounded-lg transition-all hover:ring-2 hover:ring-primary focus:ring-2 focus:ring-primary" :disabled="busy" :aria-label="`Select ${cat.name ?? 'cat photo'}`" @click="emit('pick', cat)"><img :src="cat.imageDataUrl ?? cat.imageUrl ?? ''" :alt="cat.name ?? 'Cat'" class="h-full w-full object-cover" /></button>
      </div>
      <div class="modal-action"><form method="dialog"><button class="btn btn-ghost">Cancel</button></form></div>
    </div>
    <form method="dialog" class="modal-backdrop"><button aria-label="Close photo picker">close</button></form>
  </dialog>
</template>
