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

const onSubmit = async () => {
  if (!formData.value.terms) {
    toast.warning('Please agree to the Terms of Service and Privacy Policy');
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
      authStore.setUser(response.data.user);
      authStore.setToken(response.data.token);
      toast.success('Account created! Welcome to SpendWise.');
      router.push('/dashboard');
    }
  } catch (error: any) {
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0];
      toast.error(Array.isArray(firstError) ? firstError[0] : (firstError as string));
    } else {
      toast.error(error.message || 'An error occurred during registration');
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
        <form @submit.prevent="onSubmit" class="space-y-6">

          <!-- Section: Personal Info -->
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personal Info
            </p>

            <!-- Full Name -->
            <div class="space-y-1.5">
              <Label for="name" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </Label>
              <div class="relative">
                <User class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  v-model="formData.name"
                  placeholder="Your full name"
                  class="pl-9 h-11"
                  required />
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
                  class="pl-9 h-11"
                  required />
              </div>
            </div>
          </div>

          <!-- Section: Security -->
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
                  placeholder="Min. 8 characters"
                  class="pl-9 pr-11 h-11"
                  required />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  @click="isPwd = !isPwd">
                  <EyeOff v-if="isPwd" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
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
                  class="pl-9 pr-11 h-11"
                  required />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  @click="isPwdConfirm = !isPwdConfirm">
                  <EyeOff v-if="isPwdConfirm" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Section: Preferences -->
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preferences
            </p>

            <!-- Currency -->
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

          <!-- Terms Agreement -->
          <div class="rounded-xl border border-border bg-muted/30 dark:bg-muted/10 px-4 py-3.5 flex items-start gap-3">
            <Checkbox
              id="terms"
              :checked="formData.terms"
              class="mt-0.5 shrink-0"
              @update:checked="formData.terms = $event" />
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

          <!-- Submit -->
          <Button
            type="submit"
            class="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            Create Account
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
