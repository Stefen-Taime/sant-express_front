import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'Accueil | SantéExpress' }
  },
  {
    path: '/etablissement/:id',
    name: 'EtablissementDetail',
    component: () => import('../views/EtablissementDetail.vue'),
    meta: { title: 'Détails de l\'établissement | SantéExpress' }
  },
  {
    path: '/carte',
    name: 'Carte',
    component: () => import('../views/Carte.vue'),
    meta: { title: 'Carte des établissements | SantéExpress' }
  },
  {
    path: '/itineraire/:id',
    name: 'Itineraire',
    component: () => import('../views/Itineraire.vue'),
    meta: { title: 'Itinéraire | SantéExpress' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: 'Page non trouvée | SantéExpress' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Mise à jour du titre de la page
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'SantéExpress'
  next()
})

export default router
