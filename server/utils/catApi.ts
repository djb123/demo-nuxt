export async function catApi<T>(path: string, query?: Record<string, string | number>): Promise<T> {
  const { catApiKey } = useRuntimeConfig()
  try {
    return await $fetch(`https://api.thecatapi.com/v1/${path}`, {
      query,
      headers: catApiKey ? { 'x-api-key': catApiKey } : undefined,
      timeout: 15000,
    }) as T
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'TheCatAPI is unavailable. Please try again.' })
  }
}
