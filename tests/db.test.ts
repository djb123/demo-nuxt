import 'fake-indexeddb/auto'
import { afterEach, expect, it } from 'vitest'
import { getDB, removeFavorite } from '../app/lib/db'

afterEach(async () => {
  const db = getDB()
  await Promise.all([db.favorites.clear(), db.calendars.clear(), db.calendarEvents.clear()])
})
it('removes deleted favorite references from every calendar while preserving other photos', async () => {
  const db = getDB()
  const photo = await db.favorites.add({ isUploaded: true, imageDataUrl: 'data:image/png;base64,test', addedAt: new Date() })
  const other = await db.favorites.add({ isUploaded: false, imageUrl: 'https://example.com/cat.png', addedAt: new Date() })
  const id = await db.calendars.add({ name: 'Cats', year: 2028, photoIds: [photo, other, photo, ...Array(9).fill(null)], createdAt: new Date() })
  const second = await db.calendars.add({ name: 'More cats', year: 2029, photoIds: [photo, ...Array(11).fill(null)], createdAt: new Date() })
  await removeFavorite(photo)
  expect(await db.favorites.get(photo)).toBeUndefined()
  expect((await db.calendars.get(id))?.photoIds).toEqual([null, other, ...Array(10).fill(null)])
  expect((await db.calendars.get(second))?.photoIds).toEqual(Array(12).fill(null))
  expect(await db.favorites.get(other)).toBeDefined()
})
