<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <AppShell>
      <RouterView />
    </AppShell>
  </div>
</template>

<script lang="ts">
import { RouterView } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'

export default {
  name: 'App',
  components: {
    AppShell,
    RouterView,
  },
}
</script>