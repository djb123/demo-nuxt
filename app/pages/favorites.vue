<script setup lang="ts">
useHead({ title: 'Favorites · Cat Calendar Creator' })
const activeTab = ref<'api' | 'uploads'>('api')
const { data: favorites, pending, error } = useFavorites()
const apiFavorites = computed(() => favorites.value.filter(cat => !cat.isUploaded))
const uploads = computed(() => favorites.value.filter(cat => cat.isUploaded))
const displayed = computed(() => activeTab.value === 'api' ? apiFavorites.value : uploads.value)
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Favorites</h1>
    <div role="tablist" aria-label="Favorite photos" class="tabs tabs-border">
      <button role="tab" class="tab" :class="{ 'tab-active': activeTab === 'api' }" :aria-selected="activeTab === 'api'" @click="activeTab = 'api'">Cat API ({{ apiFavorites.length }})</button>
      <button role="tab" class="tab" :class="{ 'tab-active': activeTab === 'uploads' }" :aria-selected="activeTab === 'uploads'" @click="activeTab = 'uploads'">My Uploads ({{ uploads.length }})</button>
    </div>
    <div v-if="error" role="alert" class="alert alert-error">{{ error }}</div>
    <div v-else-if="pending" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"><div v-for="n in 8" :key="n" class="aspect-square skeleton rounded-xl" /></div>
    <div v-else-if="!displayed.length" class="alert">
      <span v-if="activeTab === 'api'">No favorited cats yet. <NuxtLink to="/browse" class="link">Browse cats</NuxtLink> and click ❤ to save them here.</span>
      <span v-else>No uploads yet. <NuxtLink to="/upload" class="link">Upload your cats</NuxtLink> to get started.</span>
    </div>
    <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"><FavoriteCard v-for="cat in displayed" :key="cat.id" :cat="cat" /></div>
  </div>
</template>
