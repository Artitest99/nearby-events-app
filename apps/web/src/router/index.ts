import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/results',
      name: 'results',
      component: () => import('@/pages/ResultsPage.vue'),
    },
    {
      path: '/event/:id',
      name: 'event-details',
      component: () => import('@/pages/EventDetailsPage.vue'),
      props: true,
    },
    {
      path: '/preferences',
      name: 'preferences',
      component: () => import('@/pages/PreferencesPage.vue'),
    },
  ],
})

export default router