import { defineStore } from 'pinia';
import { authService } from '../services/auth.service';
import { User } from 'src/types/auth.types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    authToken: (state) => state.token,
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || '',
    userCurrency: (state) => state.user?.currency || 'PHP',
    userAvatar: (state) => state.user?.avatar || null,
  },

  actions: {
    /**
     * Set user data
     */
    setUser(user: User) {
      this.user = user;
      this.isAuthenticated = true;
    },

    /**
     * Set authentication token
     */
    setToken(token: string) {
      this.token = token;
      authService.setToken(token);
      this.isAuthenticated = true;
    },

    /**
     * Initialize auth state from localStorage
     */
    async initAuth() {
      const token = authService.getToken();

      if (token) {
        this.token = token;
        authService.setAuthHeader(token);

        try {
          // Fetch user data
          const user = await authService.getUser();
          this.setUser(user);
        } catch (error) {
          // Token might be invalid
          this.logout();
        }
      }
    },

    /**
     * Login user
     */
    async login(email: string, password: string, remember: boolean = false) {
      this.loading = true;

      try {
        const response = await authService.login({ email, password, remember });

        if (response.success) {
          this.setUser(response.data.user);
          this.setToken(response.data.token);
          return response;
        }

        throw new Error(response.message || 'Login failed');
      } finally {
        this.loading = false;
      }
    },

    /**
     * Register user
     */
    async register(data: any) {
      this.loading = true;

      try {
        const response = await authService.register(data);

        if (response.success) {
          this.setUser(response.data.user);
          this.setToken(response.data.token);
          return response;
        }

        throw new Error(response.message || 'Registration failed');
      } finally {
        this.loading = false;
      }
    },

    /**
     * Logout user
     */
    async logout() {
      try {
        await authService.logout();
      } catch (error) {
        // Continue with local logout even if API call fails
        console.error('Logout API error:', error);
      } finally {
        this.clearAuth();
      }
    },

    /**
     * Logout from all devices
     */
    async logoutAll() {
      try {
        await authService.logoutAll();
      } catch (error) {
        console.error('Logout all API error:', error);
      } finally {
        this.clearAuth();
      }
    },

    /**
     * Clear authentication state
     */
    clearAuth() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      authService.removeToken();
    },

    /**
     * Update user profile
     */
    updateUserProfile(userData: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...userData };
      }
    },

    /**
     * Refresh authentication token
     */
    async refreshToken() {
      try {
        const response = await authService.refreshToken();

        if (response.success) {
          this.setToken(response.data.token);
          return response;
        }

        throw new Error('Token refresh failed');
      } catch (error) {
        this.clearAuth();
        throw error;
      }
    },

    /**
     * Check authentication status
     */
    checkAuth() {
      return this.isAuthenticated && this.token !== null;
    },
  },

  // persist: {
  //   enabled: true,
  //   strategies: [
  //     {
  //       key: 'auth',
  //       storage: localStorage,
  //       paths: ['user', 'token', 'isAuthenticated'],
  //     },
  //   ],
  // },
});
