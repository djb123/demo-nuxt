import { afterEach, describe, expect, it, vi } from 'vitest'
import { getDefaultYear, getMonthGrid, toDateString } from '../app/utils/calendar'

afterEach(() => vi.useRealTimers())
describe('calendar dates', () => {
  it('places leap day and padding in the correct weekday columns', () => {
    const grid = getMonthGrid(2028, 1)
    expect(grid.length % 7).toBe(0)
    expect(grid.filter(Boolean)).toHaveLength(29)
    expect(grid.indexOf(1) % 7).toBe(2)
    expect(grid.indexOf(29) % 7).toBe(2)
    expect(getMonthGrid(2027, 1).filter(Boolean)).toHaveLength(28)
  })
  it('includes all six rows when a month needs them', () => {
    expect(getMonthGrid(2026, 7)).toHaveLength(42)
  })
  it('defaults to the next year beginning March 1', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 28, 23, 59))
    expect(getDefaultYear()).toBe(2026)
    vi.setSystemTime(new Date(2026, 2, 1))
    expect(getDefaultYear()).toBe(2027)
  })
  it('formats local dates without UTC conversion', () => {
    expect(toDateString(2028, 1, 29)).toBe('2028-02-29')
    expect(toDateString(2027, 0, 1)).toBe('2027-01-01')
  })
})
