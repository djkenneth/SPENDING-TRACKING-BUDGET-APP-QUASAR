// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      // Auth routes
      {
        path: '/login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { requiresAuth: false, guestOnly: true },
      },
      {
        path: '/register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue'),
        meta: { requiresAuth: false, guestOnly: true },
      },
      // {
      //   path: '/forgot-password',
      //   name: 'forgot-password',
      //   component: () => import('pages/ForgotPasswordPage.vue'),
      //   meta: { requiresAuth: false, guestOnly: true },
      // },
      // {
      //   path: '/reset-password',
      //   name: 'reset-password',
      //   component: () => import('pages/ResetPasswordPage.vue'),
      //   meta: { requiresAuth: false, guestOnly: true },
      // },
    ],
  },

  // Main app routes (with layout)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/HomePage.vue'),
        meta: {
          title: 'Dashboard',
          icon: 'home',
          requiresAuth: true,
        },
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('pages/AccountsPage.vue'),
        meta: {
          title: 'Accounts',
          icon: 'account_balance_wallet',
          requiresAuth: true,
        },
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: () => import('pages/TransactionsPage.vue'),
        meta: {
          title: 'Transactions',
          icon: 'receipt_long',
          requiresAuth: true,
        },
      },
      {
        path: 'budget',
        name: 'budget',
        component: () => import('pages/BudgetPage.vue'),
        meta: {
          title: 'Budget',
          icon: 'pie_chart',
          requiresAuth: true,
        },
      },
      {
        path: 'goals',
        name: 'goals',
        component: () => import('pages/GoalsPage.vue'),
        meta: {
          title: 'Goals',
          icon: 'flag',
          requiresAuth: true,
        },
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('pages/AnalyticsPage.vue'),
        meta: {
          title: 'Analytics',
          icon: 'analytics',
          requiresAuth: true,
        },
      },
      {
        path: 'offline',
        name: 'offline',
        component: () => import('pages/OfflineManagerPage.vue'),
        meta: {
          title: 'Offline Manager',
          icon: 'cloud_off',
          requiresAuth: true,
        },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/SettingsPage.vue'),
        meta: {
          title: 'Settings',
          icon: 'settings',
          requiresAuth: true,
        },
      },
      {
        path: 'sample',
        name: 'sample',
        component: () => import('pages/Sample.vue'),
      },
    ],
  },

  // Error pages
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
