<script setup lang="ts">
import { getDB } from '~/lib/db'
import type { CalendarEvent } from '~/lib/types'
const props = defineProps<{ calendarId: number; year: number; editingEvent?: CalendarEvent | null }>()
const emit = defineEmits<{ done: [] }>()
const form = reactive({ date: '', title: '', emoji: '', color: '#3b82f6', textColor: '#ffffff' })
const saving = ref(false)
const error = ref('')
function reset() { Object.assign(form, { date: '', title: '', emoji: '', color: '#3b82f6', textColor: '#ffffff' }); error.value = '' }
watch(() => props.editingEvent, event => {
  reset()
  if (event) Object.assign(form, { date: event.date, title: event.title, emoji: event.emoji ?? '', color: event.color ?? '#3b82f6', textColor: event.textColor ?? '#ffffff' })
}, { immediate: true })
async function save() {
  if (!form.title.trim() || !form.date || !form.date.startsWith(`${props.year}-`)) { error.value = 'Enter a title and a date within the calendar year.'; return }
  saving.value = true; error.value = ''
  try {
    const data = { ...form, title: form.title.trim(), calendarId: props.calendarId }
    if (props.editingEvent?.id != null) await getDB().calendarEvents.update(props.editingEvent.id, data)
    else await getDB().calendarEvents.add(data)
    reset(); emit('done')
  } catch { error.value = 'Failed to save event. Please try again.' }
  finally { saving.value = false }
}
</script>

<template>
  <form class="card bg-base-200 p-4" @submit.prevent="save">
    <h3 class="mb-3 font-semibold">{{ editingEvent ? 'Edit Event' : 'Add Event' }}</h3>
    <div class="flex flex-wrap items-end gap-2">
      <label class="form-control"><span class="label pb-1 text-sm">Date</span><input v-model="form.date" type="date" class="input input-sm" :min="`${year}-01-01`" :max="`${year}-12-31`" required /></label>
      <label class="form-control min-w-40 flex-1"><span class="label pb-1 text-sm">Event title</span><input v-model="form.title" type="text" class="input input-sm w-full" placeholder="e.g. Alex's Birthday!" maxlength="60" required /></label>
      <label class="form-control w-20"><span class="label pb-1 text-sm">Emoji</span><input v-model="form.emoji" type="text" class="input input-sm text-center" placeholder="🎂" maxlength="8" /></label>
      <label class="form-control"><span class="label pb-1 text-sm">BG color</span><input v-model="form.color" type="color" class="input input-sm h-9 w-12 p-1" /></label>
      <label class="form-control"><span class="label pb-1 text-sm">Text color</span><input v-model="form.textColor" type="color" class="input input-sm h-9 w-12 p-1" /></label>
      <button class="btn btn-sm btn-primary" :disabled="saving">{{ saving ? 'Saving…' : editingEvent ? 'Update' : 'Add' }}</button>
      <button v-if="editingEvent" type="button" class="btn btn-ghost btn-sm" @click="emit('done')">Cancel</button>
    </div>
    <p v-if="error" role="alert" class="mt-2 text-sm text-error">{{ error }}</p>
  </form>
</template>
