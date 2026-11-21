<script setup lang="ts">
import { getDB } from '~/lib/db'
useHead({ title: 'Upload Your Cats · Cat Calendar Creator' })
const { data: favorites, error: dbError } = useFavorites()
const uploads = computed(() => favorites.value.filter(cat => cat.isUploaded))
const isDragging = ref(false)
const uploading = ref(false)
const hydrated = ref(false)
onMounted(() => { hydrated.value = true })
const error = ref('')
const message = ref('')
async function handleFiles(files: FileList | null) {
  if (!files?.length || uploading.value) return
  uploading.value = true
  error.value = ''; message.value = ''
  let count = 0
  try {
    for (const file of Array.from(files)) {
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'].includes(file.type)) { error.value = 'Please choose JPG, PNG, GIF, WebP, or AVIF images.'; continue }
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      await getDB().favorites.add({ imageDataUrl, isUploaded: true, name: file.name.replace(/\.[^.]+$/, ''), addedAt: new Date() })
      count++
    }
    if (count) message.value = `${count} photo${count === 1 ? '' : 's'} saved to your favorites.`
  } catch { error.value = 'Failed to save image. Your browser storage may be full. Please try again.' }
  finally { uploading.value = false }
}
async function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  await handleFiles(input.files)
  input.value = ''
}
function onDrop(event: DragEvent) { isDragging.value = false; void handleFiles(event.dataTransfer?.files ?? null) }
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <h1 class="text-2xl font-bold">Upload Your Cats</h1>
    <section class="rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-12" :class="isDragging ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/50'" aria-label="File upload area" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="onDrop">
      <div class="flex flex-col items-center gap-3">
        <svg class="h-12 w-12 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        <p class="text-base-content/60">Drag &amp; drop cat photos here</p><span class="text-sm text-base-content/50">or</span>
        <label class="btn btn-primary relative focus-within:outline-2 focus-within:outline-offset-2" :class="{ 'btn-disabled': uploading || !hydrated }">{{ uploading ? 'Uploading…' : 'Choose Files' }}<input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/avif" multiple class="absolute inset-0 w-full cursor-pointer opacity-0" aria-label="Choose Files" :disabled="uploading || !hydrated" @change="onFileInput" /></label>
        <p class="text-sm text-base-content/50">Supports JPG, PNG, GIF, WebP, AVIF</p>
      </div>
    </section>
    <div v-if="error || dbError" class="alert alert-error" role="alert">{{ error || dbError }}</div>
    <p v-if="message" role="status" class="text-success">{{ message }}</p>
    <section v-if="uploads.length"><h2 class="mb-3 text-lg font-semibold">Uploaded ({{ uploads.length }})</h2><div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"><FavoriteCard v-for="cat in uploads" :key="cat.id" :cat="cat" /></div></section>
  </div>
</template>
