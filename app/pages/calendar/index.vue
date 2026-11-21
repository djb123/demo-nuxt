<script setup lang="ts">
import { getDB } from '~/lib/db'
import { getDefaultYear, MONTH_NAMES } from '~/utils/calendar'
import type { CalendarRecord, FavoriteCat, CalendarEvent } from '~/lib/types'
useHead({ title: 'My Calendars · Cat Calendar Creator' })
const { data: calendars, pending, error: listError } = useLiveQuery(() => getDB().calendars.orderBy('createdAt').reverse().toArray(), [] as CalendarRecord[])
const newName = ref('')
const newYear = ref(getDefaultYear())
const creating = ref(false)
const error = ref('')
const activeId = ref<number | null>(null)
const { calendar, events, photos, error: calendarError } = useCalendar(activeId)
const filledSlots = computed(() => photos.value.filter(Boolean).length)
const pickingMonth = ref<number | null>(null)
const pickerOpen = ref(false)
const picking = ref(false)
const pickerError = ref('')
const editingEvent = ref<CalendarEvent | null>(null)
const showPreview = ref(false)
const previewSection = useTemplateRef<HTMLElement>('previewSection')
watch(activeId, () => { editingEvent.value = null; showPreview.value = false; pickerOpen.value = false })
async function createCalendar() {
  if (!newName.value.trim() || !Number.isInteger(newYear.value) || newYear.value < 2024 || newYear.value > 2100) return
  creating.value = true; error.value = ''
  try {
    activeId.value = await getDB().calendars.add({ name: newName.value.trim(), year: newYear.value, photoIds: Array(12).fill(null), createdAt: new Date() })
    newName.value = ''
  } catch { error.value = 'Could not create calendar. Please try again.' }
  finally { creating.value = false }
}
async function deleteCalendar(cal: CalendarRecord) {
  if (cal.id == null || !window.confirm(`Delete "${cal.name}"? This will also delete all its events.`)) return
  try {
    const db = getDB()
    await db.transaction('rw', db.calendars, db.calendarEvents, async () => {
      await db.calendarEvents.where('calendarId').equals(cal.id!).delete()
      await db.calendars.delete(cal.id!)
    })
    if (activeId.value === cal.id) activeId.value = null
  } catch { error.value = 'Could not delete calendar.' }
}
function openPicker(month: number) { pickingMonth.value = month; pickerError.value = ''; pickerOpen.value = true }
async function pickPhoto(cat: FavoriteCat) {
  if (pickingMonth.value == null || !calendar.value?.id || cat.id == null) return
  picking.value = true
  try {
    const photoIds = [...calendar.value.photoIds]
    photoIds[pickingMonth.value] = cat.id
    await getDB().calendars.update(calendar.value.id, { photoIds })
    pickerOpen.value = false
  } catch { pickerError.value = 'Could not assign photo. Please try again.' }
  finally { picking.value = false }
}
async function clearPhoto(month: number) {
  if (!calendar.value?.id) return
  try {
    const photoIds = [...calendar.value.photoIds]; photoIds[month] = null
    await getDB().calendars.update(calendar.value.id, { photoIds })
  } catch { error.value = 'Could not remove photo.' }
}
async function deleteEvent(event: CalendarEvent) {
  if (event.id == null) return
  try { await getDB().calendarEvents.delete(event.id); if (editingEvent.value?.id === event.id) editingEvent.value = null }
  catch { error.value = 'Could not delete event.' }
}
async function togglePreview() {
  showPreview.value = !showPreview.value
  if (showPreview.value) { await nextTick(); previewSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">My Calendars</h1>
    <form class="card bg-base-200 p-4" @submit.prevent="createCalendar">
      <h2 class="mb-3 font-semibold">New Calendar</h2>
      <div class="flex flex-wrap items-end gap-2">
        <label class="form-control min-w-48 flex-1"><span class="label pb-1 text-sm">Calendar name</span><input v-model="newName" type="text" class="input input-sm w-full" placeholder="e.g. Family Cats 2027" maxlength="60" required /></label>
        <label class="form-control"><span class="label pb-1 text-sm">Year</span><input v-model.number="newYear" type="number" class="input input-sm w-24" min="2024" max="2100" required /></label>
        <button class="btn btn-sm btn-primary" :disabled="creating || !newName.trim()">{{ creating ? 'Creating…' : 'Create' }}</button>
      </div>
    </form>
    <div v-if="error || listError || calendarError" role="alert" class="alert alert-error">{{ error || listError || calendarError }}</div>
    <div v-if="pending" class="flex gap-3"><div v-for="n in 3" :key="n" class="h-20 w-48 skeleton rounded-xl" /></div>
    <div v-else-if="!calendars.length && !listError" class="alert">No calendars yet. Create one above to get started.</div>
    <div v-else class="flex flex-wrap gap-3">
      <div v-for="cal in calendars" :key="cal.id" class="card border-2 bg-base-100 shadow transition-colors" :class="activeId === cal.id ? 'border-primary' : 'border-transparent hover:border-base-300'">
        <div class="flex items-start gap-4 px-4 py-3"><button class="text-left" :aria-pressed="activeId === cal.id" @click="activeId = cal.id ?? null"><span class="block font-semibold">{{ cal.name }}</span><span class="block text-sm text-base-content/60">{{ cal.year }}</span></button><button class="btn btn-circle text-error btn-ghost btn-xs" :aria-label="`Delete calendar ${cal.name}`" @click="deleteCalendar(cal)">✕</button></div>
      </div>
    </div>
    <template v-if="calendar && calendar.id === activeId">
      <div class="divider" />
      <div class="flex flex-wrap items-center justify-between gap-2"><h2 class="text-xl font-bold">{{ calendar.name }} — {{ calendar.year }}</h2><div class="flex gap-2"><button class="btn btn-ghost btn-sm" @click="togglePreview">{{ showPreview ? 'Hide preview' : 'Show preview' }}</button><NuxtLink :to="`/calendar/print?id=${calendar.id}`" class="btn btn-sm btn-primary" target="_blank">Preview &amp; Print</NuxtLink></div></div>
      <div class="flex items-center gap-2 text-sm text-base-content/60"><span>{{ filledSlots }}/12 photos assigned</span><span v-if="filledSlots === 12" class="badge badge-sm badge-success">Ready to print!</span></div>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        <div v-for="(month, index) in MONTH_NAMES" :key="month" class="group relative">
          <button class="relative aspect-3/4 w-full overflow-hidden rounded-xl border-2 border-dashed transition-colors" :class="photos[index] ? 'border-transparent' : 'border-base-300 bg-base-200 hover:border-primary/50'" :aria-label="`Pick photo for ${month}`" @click="openPicker(index)">
            <template v-if="photos[index]"><img :src="photos[index]?.imageDataUrl ?? photos[index]?.imageUrl ?? ''" :alt="month" class="h-full w-full object-cover" /><span class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20"><span class="rounded bg-black/50 px-2 py-1 text-sm font-semibold text-white opacity-0 group-hover:opacity-100">Change</span></span></template>
            <span v-else class="flex h-full flex-col items-center justify-center gap-1"><span class="text-2xl opacity-30">🐱</span><span class="text-sm text-base-content/50">{{ month }}</span></span>
          </button>
          <button v-if="photos[index]" class="btn absolute top-1 right-1 z-10 btn-circle shadow btn-xs btn-error sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100" :aria-label="`Remove photo for ${month}`" @click="clearPhoto(index)">✕</button>
          <p class="mt-1 text-center text-sm font-medium text-base-content/60">{{ month }}</p>
        </div>
      </div>
      <div class="divider">Events</div>
      <EventForm :key="calendar.id" :calendar-id="calendar.id!" :year="calendar.year" :editing-event="editingEvent" @done="editingEvent = null" />
      <div v-if="events.length" class="overflow-x-auto"><table class="table table-sm"><thead><tr><th>Date</th><th>Event</th><th>Style</th><th>Actions</th></tr></thead><tbody><tr v-for="event in events" :key="event.id"><td class="whitespace-nowrap">{{ event.date }}</td><td class="font-medium">{{ event.emoji }} {{ event.title }}</td><td><span class="badge badge-sm border-0" :style="{ backgroundColor: event.color ?? '#3b82f6', color: event.textColor ?? '#ffffff' }">{{ event.title.slice(0, 12) }}</span></td><td><div class="flex gap-1"><button class="btn btn-ghost btn-xs" @click="editingEvent = event">Edit</button><button class="btn text-error btn-ghost btn-xs" @click="deleteEvent(event)">Delete</button></div></td></tr></tbody></table></div>
      <p v-else class="text-sm text-base-content/60">No events yet. Add important dates above.</p>
      <section v-if="showPreview" ref="previewSection" class="scroll-mt-20"><div class="divider">Preview</div><div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"><div v-for="(_, index) in MONTH_NAMES" :key="index" class="aspect-3/4"><CalendarMonth :year="calendar.year" :month="index" :photo="photos[index]" :events="events" /></div></div></section>
    </template>
    <PhotoPickerModal v-model="pickerOpen" :month-name="pickingMonth == null ? '' : MONTH_NAMES[pickingMonth] ?? ''" :busy="picking" :error="pickerError" @pick="pickPhoto" />
  </div>
</template>
