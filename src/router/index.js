import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  // ── Public ──────────────────────────────────────────────────────────────
  { path: '/login',    component: () => import('@/pages/Login.vue'),    meta: { public: true } },
  // { path: '/register', component: () => import('@/pages/Register.vue'), meta: { public: true } },

  // ── Lab-facing app ───────────────────────────────────────────────────────
  { path: '/',                   component: () => import('@/pages/Dashboard.vue') },
  { path: '/patients',           component: () => import('@/pages/patients/PatientList.vue') },
  { path: '/patients/new',       component: () => import('@/pages/patients/PatientForm.vue') },
  { path: '/patients/:id',       component: () => import('@/pages/patients/PatientDetail.vue') },
  { path: '/patients/:id/edit',  component: () => import('@/pages/patients/PatientForm.vue') },
  { path: '/tests',              component: () => import('@/pages/tests/TestList.vue') },
  { path: '/tests/new',          component: () => import('@/pages/tests/TestForm.vue') },
  { path: '/tests/:id/edit',     component: () => import('@/pages/tests/TestForm.vue') },
  { path: '/orders',             component: () => import('@/pages/orders/OrderList.vue') },
  { path: '/orders/new',         component: () => import('@/pages/orders/NewOrder.vue') },
  { path: '/orders/:id',         component: () => import('@/pages/orders/ResultEntry.vue') },
  { path: '/billing',            component: () => import('@/pages/billing/BillList.vue') },
  { path: '/billing/:id',        component: () => import('@/pages/billing/BillDetail.vue') },
  { path: '/settings/lab',       component: () => import('@/pages/settings/LabSettings.vue'),    meta: { adminOnly: true } },
  { path: '/settings/users',     component: () => import('@/pages/settings/UserManagement.vue'), meta: { adminOnly: true } },

  // ── Super Admin panel ────────────────────────────────────────────────────
  { path: '/super',          redirect: '/super/dashboard' },
  { path: '/super/dashboard', component: () => import('@/pages/super/SuperDashboard.vue'), meta: { superAdmin: true } },
  { path: '/super/labs',      component: () => import('@/pages/super/LabList.vue'),        meta: { superAdmin: true } },
  { path: '/super/labs/:id',  component: () => import('@/pages/super/LabDetail.vue'),      meta: { superAdmin: true } },
  { path: '/super/plans',     component: () => import('@/pages/super/PlanList.vue'),       meta: { superAdmin: true } },
  { path: '/super/profile',   component: () => import('@/pages/super/SuperProfile.vue'),   meta: { superAdmin: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const auth = useAuthStore()

  // Public routes — allow unauthenticated
  if (to.meta.public) {
    // Already on a public route → never redirect (prevents loops)
    if (from.meta.public) return true
    if (auth.isAuthenticated) {
      return auth.isSuperAdmin ? { path: '/super/dashboard' } : { path: '/' }
    }
    return true
  }

  // Must be authenticated for everything else
  if (!auth.isAuthenticated) {
    // Only redirect if we're not already going to /login
    if (to.path === '/login') return true
    return { path: '/login' }
  }

  // Super admin routes — only superadmin
  if (to.meta.superAdmin) {
    return auth.isSuperAdmin ? true : { path: '/' }
  }

  // Lab routes — superadmin should not access lab UI
  if (auth.isSuperAdmin) return { path: '/super/dashboard' }

  // Admin-only lab routes
  if (to.meta.adminOnly && !auth.isAdmin) return { path: '/' }

  return true
})

export default router
