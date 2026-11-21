<script setup lang="ts">
import { MONTH_NAMES } from '~/utils/calendar'
const route = useRoute()
const id = computed(() => {
  const value = Number(route.query.id)
  return Number.isSafeInteger(value) && value > 0 ? value : null
})
const { calendar, photos, events, pending, error } = useCalendar(id)
const imagesReady = ref(false)
let readinessGeneration = 0
// Preload every selected image before enabling printing, including remote photos.
watch(photos, async value => {
  const generation = ++readinessGeneration
  imagesReady.value = false
  await Promise.all(value.map(photo => new Promise<void>(resolve => {
    const src = photo?.imageDataUrl ?? photo?.imageUrl
    if (!src) return resolve()
    const image = new Image()
    image.onload = image.onerror = () => resolve()
    image.src = src
  })))
  if (generation === readinessGeneration) imagesReady.value = true
})
useHead({ title: computed(() => calendar.value ? `${calendar.value.name} ${calendar.value.year}` : 'Print Calendar · Cat Calendar Creator') })
function printCalendar() { window.print() }
</script>

<template>
  <div class="print-view">
    <div class="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-base-200 p-4">
      <div><h1 class="text-xl font-bold">{{ calendar ? `${calendar.name} — ${calendar.year}` : 'Print Calendar' }}</h1><p v-if="calendar" class="text-sm text-base-content/60">{{ photos.filter(Boolean).length }}/12 photos assigned</p></div>
      <div class="flex gap-2"><NuxtLink to="/calendar" class="btn btn-ghost btn-sm">Back</NuxtLink><button class="btn btn-sm btn-primary" :disabled="!calendar || !imagesReady || pending" @click="printCalendar">{{ calendar && !imagesReady ? 'Loading photos…' : '🖨 Print' }}</button></div>
    </div>
    <div v-if="error" role="alert" class="no-print alert alert-error">{{ error }}</div>
    <div v-else-if="!id" class="no-print alert alert-error">No calendar selected. Go back and choose a calendar to print.</div>
    <div v-else-if="pending" role="status" class="no-print h-64 skeleton">Loading calendar…</div>
    <div v-else-if="!calendar" class="no-print alert alert-error">Calendar not found. It may have been deleted, or saved in a different browser.</div>
    <template v-else><div v-for="(_, index) in MONTH_NAMES" :key="index" class="month-page mx-auto mb-6 flex w-full max-w-[210mm] flex-col" style="aspect-ratio: 190 / 277"><CalendarMonth :year="calendar.year" :month="index" :photo="photos[index]" :events="events" for-print /></div></template>
  </div>
</template>
