import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-11-20',
  telemetry: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: { catApiKey: '' },
  app: {
    head: {
      title: 'Cat Calendar Creator',
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'description', content: 'Browse cat photos, upload your own, and create a personalized printable cat calendar.' }],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Irish+Grover&display=swap' },
      ],
    },
  },
})
