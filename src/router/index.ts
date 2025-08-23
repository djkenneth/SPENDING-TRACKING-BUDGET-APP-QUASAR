import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from '../stores/auth';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Navigation guards
  Router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext,
    ) => {
      const authStore = useAuthStore();

      // Initialize auth if not already done
      if (!authStore.isAuthenticated && localStorage.getItem('auth_token')) {
        await authStore.initAuth();
      }

      const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
      const guestOnly = to.matched.some((record) => record.meta.guestOnly);
      const isAuthenticated = authStore.isAuthenticated;

      // Check if route requires authentication
      if (requiresAuth && !isAuthenticated) {
        // Redirect to login page
        next({
          path: '/login',
          query: { redirect: to.fullPath },
        });
      } else if (guestOnly && isAuthenticated) {
        // Redirect authenticated users away from guest-only pages
        next('/dashboard');
      } else {
        // Proceed to route
        next();
      }
    },
  );

  // After each navigation
  Router.afterEach((to: RouteLocationNormalized) => {
    // Update page title
    const defaultTitle = 'Spending Tracker Budget App';
    const pageTitle = to.meta.title as string;
    document.title = pageTitle ? `${pageTitle} - ${defaultTitle}` : defaultTitle;
  });

  return Router;
});
