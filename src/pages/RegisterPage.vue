<template>
  <q-page class="flex flex-center">
    <q-card class="auth-card" flat bordered>
      <q-card-section>
        <div class="text-center q-mb-lg">
          <q-icon name="account_balance_wallet" size="64px" color="primary" />
          <div class="text-h4 q-mt-md q-mb-xs">Create Account</div>
          <div class="text-subtitle1 text-grey-7">Start managing your finances today</div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
          <q-input v-model="formData.name" filled label="Full Name" lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please enter your name']">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input v-model="formData.email" filled type="email" label="Email" lazy-rules :rules="[
            (val) => (val && val.length > 0) || 'Please enter your email',
            (val) => validateEmail(val) || 'Please enter a valid email',
          ]">
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input v-model="formData.password" filled :type="isPwd ? 'password' : 'text'" label="Password" lazy-rules
            :rules="[
              (val) => (val && val.length >= 8) || 'Password must be at least 8 characters',
              (val) => validatePassword(val) || 'Password must contain letters and numbers',
            ]">
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd" />
            </template>
          </q-input>

          <q-input v-model="formData.password_confirmation" filled :type="isPwdConfirm ? 'password' : 'text'"
            label="Confirm Password" lazy-rules :rules="[
              (val) => (val && val.length > 0) || 'Please confirm your password',
              (val) => val === formData.password || 'Passwords do not match',
            ]">
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwdConfirm ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="isPwdConfirm = !isPwdConfirm" />
            </template>
          </q-input>

          <!-- Optional fields -->
          <q-select v-model="formData.currency" filled label="Currency" :options="currencyOptions" emit-value
            map-options>
            <template v-slot:prepend>
              <q-icon name="payments" />
            </template>
          </q-select>

          <q-checkbox v-model="formData.terms" class="q-mb-md">
            <span class="text-grey-8">
              I agree to the
              <a href="#" class="text-primary" @click.prevent="showTerms">Terms of Service</a>
              and
              <a href="#" class="text-primary" @click.prevent="showPrivacy">Privacy Policy</a>
            </span>
          </q-checkbox>

          <div>
            <q-btn label="Create Account" type="submit" color="primary" class="full-width" size="lg" :loading="loading"
              no-caps :disable="!formData.terms" />
          </div>

          <div class="text-center q-mt-md">
            <span class="text-grey-7">Already have an account? </span>
            <q-btn flat color="primary" label="Sign In" no-caps dense @click="goToLogin" />
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  currency: string;
  timezone?: string;
  language?: string;
  terms: boolean;
}

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const formData = ref<RegisterForm>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  currency: 'PHP',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: navigator.language.split('-')[0] || 'en',
  terms: false,
});

const isPwd = ref(true);
const isPwdConfirm = ref(true);
const loading = ref(false);

// Currency options
const currencyOptions = [
  { label: 'Philippine Peso (₱)', value: 'PHP' },
  { label: 'US Dollar ($)', value: 'USD' },
  { label: 'Euro (€)', value: 'EUR' },
  { label: 'Japanese Yen (¥)', value: 'JPY' },
  { label: 'British Pound (£)', value: 'GBP' },
  { label: 'Singapore Dollar (S$)', value: 'SGD' },
  { label: 'Hong Kong Dollar (HK$)', value: 'HKD' },
  { label: 'Australian Dollar (A$)', value: 'AUD' },
];

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

const validatePassword = (password: string): boolean => {
  // Check if password contains at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
};

// Submit registration form
const onSubmit = async () => {
  if (!formData.value.terms) {
    $q.notify({
      type: 'warning',
      message: 'Please agree to the Terms of Service and Privacy Policy',
      position: 'top',
    });
    return;
  }

  loading.value = true;

  try {
    const response = await authService.register({
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
      password_confirmation: formData.value.password_confirmation,
      currency: formData.value.currency,
      timezone: formData.value.timezone,
      language: formData.value.language,
    });

    if (response.success) {
      // Store user data and token
      authStore.setUser(response.data.user);
      authStore.setToken(response.data.token);

      // Show success message
      $q.notify({
        type: 'positive',
        message: 'Account created successfully!',
        position: 'top',
      });

      // Redirect to dashboard or onboarding
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
    } else {
      $q.notify({
        type: 'negative',
        message: error.message || 'An error occurred during registration',
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
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    currency: 'PHP',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language.split('-')[0] || 'en',
    terms: false,
  };
};

// Navigation and dialog functions
const goToLogin = () => {
  router.push('/login');
};

const showTerms = () => {
  $q.dialog({
    title: 'Terms of Service',
    message: 'Terms of Service content will be displayed here.',
    ok: true,
  });
};

const showPrivacy = () => {
  $q.dialog({
    title: 'Privacy Policy',
    message: 'Privacy Policy content will be displayed here.',
    ok: true,
  });
};

const socialLogin = (provider: string) => {
  $q.notify({
    type: 'info',
    message: `${provider} registration will be implemented soon`,
    position: 'top',
  });
};
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

a {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
