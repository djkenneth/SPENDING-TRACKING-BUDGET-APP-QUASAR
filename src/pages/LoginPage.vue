<template>
  <q-page class="flex flex-center">
    <q-card class="auth-card" flat bordered>
      <q-card-section>
        <div class="text-center q-mb-lg">
          <q-icon name="account_balance_wallet" size="64px" color="primary" />
          <div class="text-h4 q-mt-md q-mb-xs">Welcome Back</div>
          <div class="text-subtitle1 text-grey-7">Sign in to your account</div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
          <q-input v-model="formData.email" filled type="email" label="Email" lazy-rules :rules="[
            (val) => (val && val.length > 0) || 'Please enter your email',
            (val) => validateEmail(val) || 'Please enter a valid email',
          ]">
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input v-model="formData.password" filled :type="isPwd ? 'password' : 'text'" label="Password" lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please enter your password']">
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>

          <div class="row items-center justify-between">
            <q-checkbox v-model="formData.remember" label="Remember me" />
            <q-btn flat color="primary" label="Forgot Password?" no-caps dense @click="goToForgotPassword" />
          </div>

          <div>
            <q-btn label="Sign In" type="submit" color="primary" class="full-width" size="lg" :loading="loading"
              no-caps />
          </div>

          <div class="text-center q-mt-md">
            <span class="text-grey-7">Don't have an account? </span>
            <q-btn flat color="primary" label="Sign Up" no-caps dense @click="goToRegister" />
          </div>
        </q-form>
      </q-card-section>

      <!-- Social Login Options (Optional) -->
      <q-card-section class="q-pt-none">
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <div class="text-center text-grey-6 q-mb-md">
              <div class="row items-center">
                <div class="col">
                  <q-separator />
                </div>
                <div class="col-auto q-px-md">OR</div>
                <div class="col">
                  <q-separator />
                </div>
              </div>
            </div>
          </div>
          <div class="col-12">
            <q-btn outline color="primary" label="Continue with Google" icon="fab fa-google" class="full-width" no-caps
              @click="socialLogin('google')" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const formData = ref<LoginForm>({
  email: '',
  password: '',
  remember: false,
});

const isPwd = ref(true);
const loading = ref(false);

// Email validation function
const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

// Submit login form
const onSubmit = async () => {
  loading.value = true;

  try {
    const response = await authService.login({
      email: formData.value.email,
      password: formData.value.password,
      remember: formData.value.remember,
    });

    if (response.success) {
      // Store user data and token
      authStore.setUser(response.data.user);
      authStore.setToken(response.data.token);

      // Show success message
      $q.notify({
        type: 'positive',
        message: 'Login successful!',
        position: 'top',
      });

      // Redirect to dashboard
      router.push('/dashboard');
    }
  } catch (error: any) {
    // Handle validation errors
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0];
      $q.notify({
        type: 'negative',
        message: Array.isArray(firstError) ? firstError[0] : firstError,
        position: 'top',
      });
    } else if (error.response?.status === 401) {
      $q.notify({
        type: 'negative',
        message: 'Invalid email or password',
        position: 'top',
      });
    } else {
      $q.notify({
        type: 'negative',
        message: error.message || 'An error occurred during login',
        position: 'top',
      });
    }
  } finally {
    loading.value = false;
  }
};

// Reset form
const onReset = () => {
  formData.value = {
    email: '',
    password: '',
    remember: false,
  };
};

// Navigation functions
const goToRegister = () => {
  router.push('/register');
};

const goToForgotPassword = () => {
  router.push('/forgot-password');
};

const socialLogin = (provider: string) => {
  $q.notify({
    type: 'info',
    message: `${provider} login will be implemented soon`,
    position: 'top',
  });
};

onMounted(() => {
  console.log('LoginPage mounted', process.env.VITE_API_URL?.replace('/api', ''));
});
</script>

<style lang="scss" scoped>
.auth-card {
  width: 100%;
  max-width: 450px;
  margin: 0 16px;
}

@media (min-width: $breakpoint-sm-min) {
  .auth-card {
    margin: 0;
  }
}
</style>
