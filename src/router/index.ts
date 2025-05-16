import { createRouter, createWebHistory } from 'vue-router'
import ModelView from '../views/ModelView.vue'
import SketchfabView from '../views/SketchfabView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'model',
      component: ModelView
    },
    {
      path:'/model',
      name: '3d-model',
      component: SketchfabView
    }
  ],
})

export default router
