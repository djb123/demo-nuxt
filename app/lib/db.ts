import Dexie, { type Table } from 'dexie'
import type { FavoriteCat, CalendarRecord, CalendarEvent } from './types'

export class CatCalendarDB extends Dexie {
  favorites!: Table<FavoriteCat, number>
  calendars!: Table<CalendarRecord, number>
  calendarEvents!: Table<CalendarEvent, number>

  constructor(name = 'CatCalendarDB') {
    super(name)
    this.version(1).stores({
      favorites: '++id, catApiId, isUploaded, addedAt',
      calendars: '++id, name, year, createdAt',
      calendarEvents: '++id, calendarId, date',
    })
  }
}

// IndexedDB is browser-only. The instance is shared by all Vue components.
let instance: CatCalendarDB | undefined
export function getDB(): CatCalendarDB {
  if (typeof indexedDB === 'undefined') throw new Error('IndexedDB is unavailable in this browser.')
  return instance ??= new CatCalendarDB()
}

// Keep references valid when a favorite used by a calendar is removed.
export async function removeFavorite(id: number) {
  const db = getDB()
  await db.transaction('rw', db.favorites, db.calendars, async () => {
    await db.calendars.filter(cal => cal.photoIds.includes(id)).modify(cal => {
      cal.photoIds = cal.photoIds.map(photoId => photoId === id ? null : photoId)
    })
    await db.favorites.delete(id)
  })
}
