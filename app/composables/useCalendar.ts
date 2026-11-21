import { getDB } from '~/lib/db'
import type { CalendarEvent, CalendarRecord, FavoriteCat } from '~/lib/types'

export function useCalendar(id: Ref<number | null>) {
  // Capture the current ID before entering Dexie's async observation context.
  const result = useLiveQuery(async () => {
    const calendarId = id.value
    if (calendarId == null) return { calendar: undefined, events: [], photos: [] }
    const db = getDB()
    const calendar = await db.calendars.get(calendarId)
    const events = await db.calendarEvents.where('calendarId').equals(calendarId).sortBy('date')
    const photos = calendar ? await Promise.all(calendar.photoIds.map(photoId => photoId == null ? null : db.favorites.get(photoId))) : []
    return { calendar, events, photos }
  }, { calendar: undefined, events: [], photos: [] } as {
    calendar: CalendarRecord | undefined
    events: CalendarEvent[]
    photos: (FavoriteCat | undefined | null)[]
  }, [id])
  return {
    calendar: computed(() => result.data.value.calendar),
    events: computed(() => result.data.value.events),
    photos: computed(() => result.data.value.photos),
    pending: result.pending,
    error: result.error,
  }
}
