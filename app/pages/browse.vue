<script setup lang="ts">
import type { CatImage } from '~/lib/types'
useHead({ title: 'Browse Cats · Cat Calendar Creator' })
const filters = reactive({ breedId: '', categoryId: '', order: 'RAND', size: 'med', hasBreeds: false })
const query = computed(() => ({ ...filters, hasBreeds: filters.hasBreeds ? 'true' : undefined, limit: 20, page: 0 }))
const { data: breeds, error: breedsError } = await useFetch<{ id: string; name: string }[]>('/api/cats/breeds')
const { data: categories } = await useFetch<{ id: number; name: string }[]>('/api/cats/categories')
const { data: images, status, error, refresh } = await useFetch<CatImage[]>('/api/cats/images', { query })
const { data: favorites, error: dbError } = useFavorites()
const favoriteMap = computed(() => new Map(favorites.value.map(cat => [cat.catApiId, cat])))
const extra = ref<CatImage[]>([])
const page = ref(0)
const loadingMore = ref(false)
const moreError = ref('')
const hasMore = ref(true)
const allImages = computed(() => [...new Map([...(images.value ?? []), ...extra.value].map(cat => [cat.id, cat])).values()])
watch(query, () => { extra.value = []; page.value = 0; hasMore.value = true; moreError.value = '' })
watch(images, value => { hasMore.value = (value?.length ?? 0) >= 20 })
hasMore.value = (images.value?.length ?? 0) >= 20
async function loadMore() {
  loadingMore.value = true
  moreError.value = ''
  const filterKey = JSON.stringify(query.value)
  try {
    const next = await $fetch<CatImage[]>('/api/cats/images', { query: { ...query.value, page: page.value + 1 } })
    if (filterKey !== JSON.stringify(query.value)) return
    extra.value.push(...next)
    page.value++
    hasMore.value = next.length >= 20
  } catch { moreError.value = 'Could not load more cats. Try again.' }
  finally { loadingMore.value = false }
}
function resetFilters() { Object.assign(filters, { breedId: '', categoryId: '', order: 'RAND', size: 'med', hasBreeds: false }) }
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Browse Cats</h1>
    <div class="card bg-base-200 p-4">
      <div class="flex flex-wrap items-end gap-3">
        <label class="form-control"><span class="label pb-1 text-sm font-medium">Breed</span><select v-model="filters.breedId" class="select select-sm min-w-36" aria-label="Breed"><option value="">All breeds</option><option v-for="breed in breeds" :key="breed.id" :value="breed.id">{{ breed.name }}</option></select></label>
        <label class="form-control"><span class="label pb-1 text-sm font-medium">Category</span><select v-model="filters.categoryId" class="select select-sm" aria-label="Category"><option value="">All categories</option><option v-for="category in categories" :key="category.id" :value="String(category.id)">{{ category.name }}</option></select></label>
        <label class="form-control"><span class="label pb-1 text-sm font-medium">Order</span><select v-model="filters.order" class="select select-sm" aria-label="Order"><option value="RAND">Random</option><option value="ASC">Ascending</option><option value="DESC">Descending</option></select></label>
        <label class="form-control"><span class="label pb-1 text-sm font-medium">Size</span><select v-model="filters.size" class="select select-sm" aria-label="Size"><option value="small">Small</option><option value="med">Medium</option><option value="full">Full</option></select></label>
        <label class="label cursor-pointer gap-2 pb-1 text-sm"><span>With breed info</span><input v-model="filters.hasBreeds" type="checkbox" class="checkbox checkbox-sm" /></label>
        <button class="btn btn-ghost btn-sm" @click="resetFilters">Reset</button>
      </div>
    </div>
    <p v-if="breedsError" class="text-sm text-error" role="alert">Breed filters are temporarily unavailable.</p>
    <div v-if="dbError" class="alert alert-error" role="alert">{{ dbError }}</div>
    <div v-if="status === 'pending'" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" aria-label="Loading cats"><div v-for="n in 20" :key="n" class="aspect-square skeleton rounded-xl" /></div>
    <div v-else-if="error" class="alert alert-error" role="alert"><span>Failed to load cats. Please try again.</span><button class="btn btn-sm" @click="refresh()">Retry</button></div>
    <div v-else-if="!allImages.length" class="alert">No cats found with these filters. Try different settings.</div>
    <template v-else>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"><CatCard v-for="image in allImages" :key="image.id" :image="image" :favorite="favoriteMap.get(image.id)" /></div>
      <p v-if="moreError" role="alert" class="text-error">{{ moreError }}</p>
      <div class="flex justify-center py-6"><button v-if="hasMore" class="btn btn-primary" :disabled="loadingMore" @click="loadMore">{{ loadingMore ? 'Loading…' : 'Load More' }}</button><p v-else class="text-sm text-base-content/60">All {{ allImages.length }} cats loaded</p></div>
    </template>
  </div>
</template>
