export default defineEventHandler(() => catApi<{ id: string; name: string }[]>('breeds'))
