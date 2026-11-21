import type { CatImage } from '../../../app/lib/types'

export default defineEventHandler(event => {
  const params = getQuery(event)
  const integer = (value: unknown, fallback: number, min: number, max: number) => {
    const number = Number(value ?? fallback)
    return Number.isInteger(number) ? Math.min(max, Math.max(min, number)) : fallback
  }
  const query: Record<string, string | number> = {
    limit: integer(params.limit, 20, 1, 100),
    page: integer(params.page, 0, 0, 10000),
    order: ['ASC', 'DESC', 'RAND'].includes(String(params.order)) ? String(params.order) : 'RAND',
    size: ['small', 'med', 'full'].includes(String(params.size)) ? String(params.size) : 'med',
  }
  if (typeof params.breedId === 'string' && /^[a-z0-9_-]+$/i.test(params.breedId)) query.breed_ids = params.breedId
  if (typeof params.categoryId === 'string' && /^\d+$/.test(params.categoryId)) query.category_ids = params.categoryId
  if (params.hasBreeds === 'true') query.has_breeds = 1
  return catApi<CatImage[]>('images/search', query)
})
