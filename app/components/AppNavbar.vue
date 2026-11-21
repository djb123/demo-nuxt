<script setup lang="ts">
const route = useRoute()
const menuOpen = ref(false)
const links = [
  { href: '/browse', label: 'Browse' },
  { href: '/upload', label: 'Upload' },
  { href: '/favorites', label: 'Favorites' },
  { href: '/calendar', label: 'Calendar' },
]
watch(() => route.path, () => { menuOpen.value = false })
</script>

<template>
  <nav aria-label="Main navigation" class="no-print navbar sticky top-0 z-50 bg-base-200 shadow-sm">
    <div class="navbar-start">
      <NuxtLink to="/" class="fancy-font btn btn-ghost text-xl font-bold" aria-label="Cat Calendar Creator home">
        <img src="/images/CatCalendarCreator_h.png" alt="Cat Calendar Creator" class="max-h-[40px] max-w-[65vw]" />
      </NuxtLink>
    </div>
    <div class="navbar-center hidden md:flex">
      <ul class="menu menu-horizontal gap-1 px-1">
        <li v-for="link in links" :key="link.href">
          <NuxtLink :to="link.href" :class="{ 'menu-active': route.path.startsWith(link.href) }" :aria-current="route.path.startsWith(link.href) ? 'page' : undefined">{{ link.label }}</NuxtLink>
        </li>
      </ul>
    </div>
    <div class="navbar-end relative md:hidden">
      <button class="btn btn-circle btn-ghost" aria-label="Toggle navigation" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
      </button>
      <ul v-if="menuOpen" class="menu absolute right-0 top-full mt-3 w-52 rounded-box bg-base-100 p-2 shadow">
        <li v-for="link in links" :key="link.href"><NuxtLink :to="link.href" :class="{ 'menu-active': route.path.startsWith(link.href) }">{{ link.label }}</NuxtLink></li>
      </ul>
    </div>
  </nav>
</template>
