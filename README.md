# Cat Calendar Creator — Nuxt + Vue

A Vue 3 / Nuxt 4 recreation of the sibling SvelteKit Cat Calendar Creator. It reuses the original cat artwork, Irish Grover font, and DaisyUI **cleo** (light) and **coffee** (system dark mode) themes. Favorites, uploaded photos, calendars, and events stay in IndexedDB through Dexie; no account or remote database is needed.

## Run locally

Use Node **22.22.3+**, **24.15+**, or **26+** (Nuxt's supported release lines) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Nuxt (normally http://localhost:3000).

If a macOS agent session reports `listen EINVAL` for a `nitro-worker` socket, its temporary directory path may exceed the operating system's socket limit. Start with `TMPDIR=/tmp npm run dev` in that session. Playwright applies this workaround automatically on macOS.

For full TheCatAPI access, copy `.env.example` to `.env` and set `NUXT_CAT_API_KEY` to your own key. You can reuse the value of `CATAPIKEY` in your SvelteKit app, under this new variable name. Restart the dev server after changing it. The key stays in Nuxt's private runtime config and is sent only by server routes. Anonymous browsing works with TheCatAPI's smaller limits; filters and results depend on the API's current availability and account permissions. The app does not copy credentials from sibling projects.

## Try the app

1. **Browse:** filter by breed, category, order, image size, or breed information. Save photos with the heart button; load more when the API returns a full page.
2. **Upload:** choose or drop your own JPG, PNG, GIF, WebP, or AVIF images. Uploaded files are stored in your browser and automatically appear in Favorites.
3. **Favorites:** switch between TheCatAPI favorites and your uploads, or remove photos.
4. **Calendar:** create a named calendar, choose a year, and assign a favorite to each month. Add or edit events with an emoji and background/text colors. Changes save immediately.
5. **Preview & Print:** open twelve A4 portrait pages and use Print to print or save as PDF. The print button waits for photo loading. Missing monthly images display a cat placeholder. Choose background graphics in the browser's print settings for the closest match to the screen colors.

Data belongs to the browser **origin** (scheme, host, and port). A different localhost port or browser has separate storage. The schema and database name match the Svelte version, but browsers do not share IndexedDB across origins. Clearing site data deletes local content. Uploaded images work without a remote image host; TheCatAPI photos and the Google font require network access.

## Learn Vue and Nuxt from this port

Read these files in order:

| File | What it demonstrates |
| --- | --- |
| [app/pages/index.vue](./app/pages/index.vue) | A single-file component, template syntax, and `NuxtLink` client navigation |
| [app/pages/upload.vue](./app/pages/upload.vue) | `<script setup lang="ts">`, `ref`, `computed`, events, `v-if`, and `v-for` |
| [app/pages/browse.vue](./app/pages/browse.vue) | `reactive`, `v-model`, reactive `useFetch` query parameters, SSR data, pagination |
| [app/composables/useLiveQuery.ts](./app/composables/useLiveQuery.ts) | Dexie subscriptions bridged to Vue `shallowRef`, browser lifecycle, subscription cleanup |
| [app/lib/db.ts](./app/lib/db.ts) | Lazy browser-only Dexie initialization, typed tables, transactional writes |
| [app/pages/calendar/index.vue](./app/pages/calendar/index.vue) | Forms, derived state, component props and emitted events |
| [app/components/PhotoPickerModal.vue](./app/components/PhotoPickerModal.vue) | Vue `defineModel` for parent/child two-way binding and native modal focus behavior |
| [app/components/EventForm.vue](./app/components/EventForm.vue) | `defineProps`, `defineEmits`, `watch`, and resetting an editable form |
| [app/composables/useCalendar.ts](./app/composables/useCalendar.ts) | A dependent live query joining calendars, events, and photos |
| [server/api/cats/images.get.ts](./server/api/cats/images.get.ts) | Nitro file-based API routes and input normalization |
| [nuxt.config.ts](./nuxt.config.ts) | Global head/CSS, Vite Tailwind integration, private runtime config |

Nuxt auto-imports Vue APIs, composables from `app/composables`, and components from `app/components`. The `~` alias points to `app/` in Nuxt 4. Page filenames define routes: `app/pages/calendar/index.vue` becomes `/calendar`, while `app/pages/calendar/print.vue` becomes `/calendar/print`.

### Familiar Svelte concepts, Vue equivalents

| Svelte / SvelteKit | Vue / Nuxt used here |
| --- | --- |
| `$state` | `ref` for individual values, `reactive` for an object |
| `$derived` | `computed` |
| `$effect` | `watch` or `watchEffect` |
| `bind:value` / `bind:checked` | `v-model` |
| `{#if}` / `{#each}` | `v-if` / `v-for` with `:key` |
| `$props()` | `defineProps` |
| Callback props | `defineEmits` and `@event` |
| `$bindable` | `defineModel` |
| `tick()` | `nextTick()` |
| `+page.svelte` / `+layout.svelte` | `app/pages/*.vue` / `app/app.vue` (or Nuxt layouts) |
| `+server.ts` | `server/api/*.get.ts` |
| `$env/static/private` | `runtimeConfig` / `useRuntimeConfig` on the server |
| TanStack Svelte Query | Nuxt `useFetch` for remote data; Dexie live queries for local data |

Inside `<script setup>`, a ref's value is accessed as `.value`; templates unwrap refs automatically. `v-model` handles both form values and checkbox booleans. `computed` values update when their dependencies change. Vue tracks these reads, while Dexie tracks the database reads inside `liveQuery` and reruns them when relevant tables change, including in another tab.

The app keeps SSR enabled for the home page, navigation, and remote browsing. IndexedDB subscriptions begin in `onMounted`, after browser hydration, so local data never needs to run on the server. No Pinia store or manual localStorage copy is necessary: Dexie remains the persistent source of state.

## Validation

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium  # once, if not already installed
npm run test:e2e
```

Unit tests cover leap years, month alignment, the March default-year cutoff, and transactional photo cleanup. Browser tests cover uploads, persistence, monthly assignment, event creation/editing/deletion, previews, twelve print pages, calendar deletion, missing calendar handling, browsing/favorites, and mobile navigation. Playwright starts a development server automatically if none is running.

The artwork and theme definitions were copied from `../demo-sveltekit`; sibling apps were not modified.
