// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
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
    ],
  },

  // Authentication routes (if needed)
  // {
  //   path: '/auth',
  //   component: () => import('layouts/AuthLayout.vue'),
  //   children: [
  //     {
  //       path: 'login',
  //       name: 'login',
  //       component: () => import('pages/auth/LoginPage.vue'),
  //       meta: {
  //         title: 'Login',
  //         requiresAuth: false,
  //       },
  //     },
  //     {
  //       path: 'register',
  //       name: 'register',
  //       component: () => import('pages/auth/RegisterPage.vue'),
  //       meta: {
  //         title: 'Register',
  //         requiresAuth: false,
  //       },
  //     },
  //     {
  //       path: 'forgot-password',
  //       name: 'forgot-password',
  //       component: () => import('pages/auth/ForgotPasswordPage.vue'),
  //       meta: {
  //         title: 'Forgot Password',
  //         requiresAuth: false,
  //       },
  //     },
  //   ],
  // },

  // Standalone pages
  // {
  //   path: '/onboarding',
  //   name: 'onboarding',
  //   component: () => import('pages/OnboardingPage.vue'),
  //   meta: {
  //     title: 'Welcome',
  //     requiresAuth: false,
  //   },
  // },

  // {
  //   path: '/privacy',
  //   name: 'privacy',
  //   component: () => import('pages/PrivacyPage.vue'),
  //   meta: {
  //     title: 'Privacy Policy',
  //     requiresAuth: false,
  //   },
  // },

  // {
  //   path: '/terms',
  //   name: 'terms',
  //   component: () => import('pages/TermsPage.vue'),
  //   meta: {
  //     title: 'Terms of Service',
  //     requiresAuth: false,
  //   },
  // },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
