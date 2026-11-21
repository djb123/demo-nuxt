<script setup lang="ts">
import type { FavoriteCat, CalendarEvent } from '~/lib/types'
import { MONTH_NAMES, DAY_NAMES, getMonthGrid, toDateString } from '~/utils/calendar'
const props = defineProps<{ year: number; month: number; photo?: FavoriteCat | null; events: CalendarEvent[]; forPrint?: boolean }>()
const grid = computed(() => getMonthGrid(props.year, props.month))
const photoSrc = computed(() => props.photo?.imageDataUrl ?? props.photo?.imageUrl ?? '')
const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>()
  for (const event of props.events) map.set(event.date, [...(map.get(event.date) ?? []), event])
  return map
})
</script>

<template>
  <article class="calendar-month flex h-full flex-col overflow-hidden rounded-lg border border-base-300 bg-base-100" :class="{ 'calendar-month-print': forPrint }" :aria-label="`${MONTH_NAMES[month]} ${year}`">
    <div class="relative min-h-0 overflow-hidden bg-base-200" style="flex: 0 0 50%">
      <img v-if="photoSrc" :src="photoSrc" :alt="`${MONTH_NAMES[month]} ${year}`" class="h-full w-full object-cover" />
      <div v-else class="flex h-full items-center justify-center text-base-content/20"><span class="text-6xl">🐱</span></div>
    </div>
    <div class="month-dates flex min-h-0 flex-1 flex-col p-2">
      <h2 class="month-heading mb-1 shrink-0 text-center text-sm font-bold">{{ MONTH_NAMES[month] }} {{ year }}</h2>
      <div class="grid shrink-0 grid-cols-7"><div v-for="day in DAY_NAMES" :key="day" class="weekday py-0.5 text-center text-[9px] font-semibold text-base-content/60">{{ day }}</div></div>
      <div class="grid min-h-0 flex-1 grid-cols-7" :style="{ gridTemplateRows: `repeat(${grid.length / 7}, minmax(0, 1fr))` }">
        <div v-for="(cell, index) in grid" :key="index" class="min-h-0 overflow-hidden border border-base-200 p-0.5" :class="{ 'bg-base-200/50': !cell }">
          <template v-if="cell">
            <span class="day-number block text-[9px] font-semibold leading-none">{{ cell }}</span>
            <div class="mt-px flex flex-col gap-px"><span v-for="event in eventsByDate.get(toDateString(year, month, cell))" :key="event.id" class="calendar-event block rounded px-0.5 text-[7px] leading-tight" :style="{ backgroundColor: event.color ?? '#3b82f6', color: event.textColor ?? '#ffffff' }">{{ event.emoji }} {{ event.title }}</span></div>
          </template>
        </div>
      </div>
    </div>
  </article>
</template>
