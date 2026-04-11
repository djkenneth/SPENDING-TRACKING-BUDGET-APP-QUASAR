<!-- src/pages/RegisterPage.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth';
import { toast } from 'vue-sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Checkbox } from 'src/components/ui/checkbox';
import { Separator } from 'src/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from 'src/components/ui/dialog';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next';

interface RegisterForm {
  first_name: string;
  last_name: string;
  middle_name: string;
  suffix: string;
  email: string;
  password: string;
  password_confirmation: string;
  currency: string;
  timezone?: string;
  language?: string;
}

type FormErrors = Partial<Record<keyof RegisterForm | 'terms', string>>;

const router = useRouter();
const authStore = useAuthStore();

const formData = ref<RegisterForm>({
  first_name: '',
  last_name: '',
  middle_name: '',
  suffix: '',
  email: '',
  password: '',
  password_confirmation: '',
  currency: 'PHP',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: navigator.language.split('-')[0] || 'en',
});

// Separate ref for terms — reka-ui Checkbox emits update:modelValue,
// not update:checked, so a standalone ref is required.
const termsAccepted = ref(false);

const isPwd = ref(true);
const isPwdConfirm = ref(true);
const loading = ref(false);
const errors = ref<FormErrors>({});
const showTermsDialog = ref(false);
const showPrivacyDialog = ref(false);

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

// Password must contain uppercase, lowercase, digit, and symbol (per API docs)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const validate = (): boolean => {
  const e: FormErrors = {};

  if (!formData.value.first_name.trim()) e.first_name = 'First name is required';
  if (!formData.value.last_name.trim()) e.last_name = 'Last name is required';

  if (!formData.value.email.trim()) {
    e.email = 'Email address is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
    e.email = 'Please enter a valid email address';
  }

  if (!formData.value.password) {
    e.password = 'Password is required';
  } else if (!PASSWORD_REGEX.test(formData.value.password)) {
    e.password = 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol';
  }

  if (!formData.value.password_confirmation) {
    e.password_confirmation = 'Please confirm your password';
  } else if (formData.value.password !== formData.value.password_confirmation) {
    e.password_confirmation = 'Passwords do not match';
  }

  if (!termsAccepted.value) {
    e.terms = 'You must agree to the Terms of Service to continue';
  }

  errors.value = e;
  return Object.keys(e).length === 0;
};

const onSubmit = async () => {
  if (!validate()) return;

  const fullName = [formData.value.first_name.trim(), formData.value.last_name.trim()]
    .filter(Boolean)
    .join(' ');

  loading.value = true;
  try {
    const response = await authService.register({
      name: fullName,
      first_name: formData.value.first_name.trim(),
      last_name: formData.value.last_name.trim(),
      middle_name: formData.value.middle_name.trim() || undefined,
      suffix: formData.value.suffix.trim() || undefined,
      email: formData.value.email,
      password: formData.value.password,
      password_confirmation: formData.value.password_confirmation,
      currency: formData.value.currency,
      timezone: formData.value.timezone,
      language: formData.value.language,
    });

    if (response.success) {
      authStore.setUser(response.data.user);
      authStore.setToken(response.data.token);
      toast.success('Account created! Welcome to SpendWise.');
      router.push('/dashboard');
    } else {
      toast.error(response.message || 'Registration failed. Please try again.');
    }
  } catch (error: unknown) {
    const err = error as { response?: { status: number; data: { errors?: Record<string, string[]>; message?: string } }; message?: string };
    if (err.response?.status === 422 && err.response.data.errors) {
      const serverErrors = err.response.data.errors;
      const mapped: FormErrors = {};
      for (const [field, messages] of Object.entries(serverErrors)) {
        mapped[field as keyof FormErrors] = Array.isArray(messages) ? messages[0] : messages;
      }
      errors.value = mapped;
      toast.error('Please fix the errors below and try again.');
    } else {
      toast.error(err.message || 'An error occurred during registration');
    }
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => router.push('/login');
const socialLogin = (provider: string) => {
  toast.info(`${provider} registration will be implemented soon`);
};
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <Card class="border-border/60 shadow-xl">

      <CardHeader class="px-5 pt-6 pb-5 text-center space-y-1">
        <CardTitle class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create account
        </CardTitle>
        <CardDescription class="text-sm text-muted-foreground">
          Start managing your finances with SpendWise
        </CardDescription>
      </CardHeader>

      <CardContent class="px-5 pb-6 space-y-6">
        <form @submit.prevent="onSubmit" class="space-y-6" novalidate>

          <!-- ── Personal Info ─────────────────────────────────── -->
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personal Info
            </p>

            <!-- First Name + Last Name (side by side on sm+) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- First Name -->
              <div class="space-y-1.5">
                <Label for="first-name" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </Label>
                <div class="relative">
                  <User class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="first-name"
                    v-model="formData.first_name"
                    placeholder="Juan"
                    :class="['pl-9 h-11', errors.first_name ? 'border-destructive focus-visible:ring-destructive' : '']"
                    @input="errors.first_name = undefined" />
                </div>
                <p v-if="errors.first_name" class="text-xs text-destructive">{{ errors.first_name }}</p>
              </div>

              <!-- Last Name -->
              <div class="space-y-1.5">
                <Label for="last-name" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </Label>
                <Input
                  id="last-name"
                  v-model="formData.last_name"
                  placeholder="Dela Cruz"
                  :class="['h-11', errors.last_name ? 'border-destructive focus-visible:ring-destructive' : '']"
                  @input="errors.last_name = undefined" />
                <p v-if="errors.last_name" class="text-xs text-destructive">{{ errors.last_name }}</p>
              </div>
            </div>

            <!-- Middle Name + Suffix (side by side, both optional) -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label for="middle-name" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Middle Name
                  <span class="text-muted-foreground font-normal ml-1 text-xs">(Optional)</span>
                </Label>
                <Input
                  id="middle-name"
                  v-model="formData.middle_name"
                  placeholder="Santos"
                  class="h-11" />
              </div>

              <div class="space-y-1.5">
                <Label for="suffix" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Suffix
                  <span class="text-muted-foreground font-normal ml-1 text-xs">(Optional)</span>
                </Label>
                <Input
                  id="suffix"
                  v-model="formData.suffix"
                  placeholder="Jr., III"
                  class="h-11" />
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <Label for="reg-email" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </Label>
              <div class="relative">
                <Mail class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reg-email"
                  v-model="formData.email"
                  type="email"
                  placeholder="you@example.com"
                  :class="['pl-9 h-11', errors.email ? 'border-destructive focus-visible:ring-destructive' : '']"
                  @input="errors.email = undefined" />
              </div>
              <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
            </div>
          </div>

          <!-- ── Security ───────────────────────────────────────── -->
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Security
            </p>

            <!-- Password -->
            <div class="space-y-1.5">
              <Label for="reg-password" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <div class="relative">
                <Lock class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reg-password"
                  v-model="formData.password"
                  :type="isPwd ? 'password' : 'text'"
                  placeholder="Min. 8 chars, upper, lower, number, symbol"
                  :class="['pl-9 pr-11 h-11', errors.password ? 'border-destructive focus-visible:ring-destructive' : '']"
                  @input="errors.password = undefined" />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  @click="isPwd = !isPwd">
                  <EyeOff v-if="isPwd" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
              <!-- Password requirements hint shown when field is empty and no error -->
              <p v-else class="text-xs text-muted-foreground">
                Must include uppercase, lowercase, number, and symbol (e.g. <span class="font-mono">!Admin123</span>)
              </p>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-1.5">
              <Label for="confirm-password" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </Label>
              <div class="relative">
                <Lock class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  v-model="formData.password_confirmation"
                  :type="isPwdConfirm ? 'password' : 'text'"
                  placeholder="Repeat your password"
                  :class="['pl-9 pr-11 h-11', errors.password_confirmation ? 'border-destructive focus-visible:ring-destructive' : '']"
                  @input="errors.password_confirmation = undefined" />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  @click="isPwdConfirm = !isPwdConfirm">
                  <EyeOff v-if="isPwdConfirm" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="errors.password_confirmation" class="text-xs text-destructive">{{ errors.password_confirmation }}</p>
            </div>
          </div>

          <!-- ── Preferences ────────────────────────────────────── -->
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preferences
            </p>

            <div class="space-y-1.5">
              <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Currency
              </Label>
              <Select v-model="formData.currency">
                <SelectTrigger class="h-11">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- ── Terms ──────────────────────────────────────────── -->
          <div class="space-y-1.5">
            <div :class="[
              'rounded-xl border px-4 py-3.5 flex items-start gap-3 transition-colors',
              errors.terms
                ? 'border-destructive bg-destructive/5'
                : 'border-border bg-muted/30 dark:bg-muted/10'
            ]">
              <Checkbox
                id="terms"
                v-model="termsAccepted"
                class="mt-0.5 shrink-0"
                @update:modelValue="errors.terms = undefined" />
              <Label for="terms" class="text-sm font-normal leading-snug cursor-pointer text-muted-foreground">
                I agree to the
                <button
                  type="button"
                  class="text-indigo-500 hover:underline font-medium"
                  @click.stop="showTermsDialog = true">Terms of Service</button>
                and
                <button
                  type="button"
                  class="text-indigo-500 hover:underline font-medium"
                  @click.stop="showPrivacyDialog = true">Privacy Policy</button>
              </Label>
            </div>
            <p v-if="errors.terms" class="text-xs text-destructive pl-1">{{ errors.terms }}</p>
          </div>

          <!-- ── Submit ─────────────────────────────────────────── -->
          <Button
            type="submit"
            class="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            :disabled="loading"
            @click.prevent="onSubmit">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ loading ? 'Creating account…' : 'Create Account' }}
          </Button>
        </form>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <Separator class="w-full" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <!-- Google -->
        <Button
          type="button"
          variant="outline"
          class="w-full h-11 gap-2 border-border"
          @click="socialLogin('Google')">
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <!-- Sign in link -->
        <p class="text-center text-sm text-muted-foreground">
          Already have an account?
          <Button
            type="button"
            variant="link"
            class="h-auto px-1 py-0 text-sm text-indigo-500 font-medium"
            @click="goToLogin">
            Sign in
          </Button>
        </p>
      </CardContent>
    </Card>
  </div>

  <!-- Terms Dialog -->
  <Dialog v-model:open="showTermsDialog">
    <DialogContent class="sm:max-w-md bg-background border-border">
      <DialogHeader>
        <DialogTitle class="text-gray-900 dark:text-white">Terms of Service</DialogTitle>
        <DialogDescription class="text-muted-foreground">Last updated April 2026</DialogDescription>
      </DialogHeader>
      <p class="text-sm text-muted-foreground leading-relaxed">
        Terms of Service content will be displayed here.
      </p>
      <DialogFooter>
        <Button class="w-full sm:w-auto" @click="showTermsDialog = false">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Privacy Dialog -->
  <Dialog v-model:open="showPrivacyDialog">
    <DialogContent class="sm:max-w-md bg-background border-border">
      <DialogHeader>
        <DialogTitle class="text-gray-900 dark:text-white">Privacy Policy</DialogTitle>
        <DialogDescription class="text-muted-foreground">Last updated April 2026</DialogDescription>
      </DialogHeader>
      <p class="text-sm text-muted-foreground leading-relaxed">
        Privacy Policy content will be displayed here.
      </p>
      <DialogFooter>
        <Button class="w-full sm:w-auto" @click="showPrivacyDialog = false">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
