<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-0 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <RouterLink to="/" class="text-base font-semibold tracking-tight text-slate-900 sm:text-lg mt-2">
          Nearby Events
        </RouterLink>

        <nav class="flex items-center gap-2">
          <RouterLink
            to="/"
            class="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Search
          </RouterLink>

          <RouterLink
            to="/preferences"
            class="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Preferences
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script lang="ts">
import { RouterLink } from 'vue-router'

export default {
  name: 'AppShell',
  components: {
    RouterLink,
  },
}
</script>