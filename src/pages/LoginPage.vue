<!-- src/pages/LoginPage.vue -->
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
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next';

interface LoginForm {
  login: string;
  password: string;
  remember: boolean;
}

const router = useRouter();
const authStore = useAuthStore();

const formData = ref<LoginForm>({
  login: '',
  password: '',
  remember: false,
});

const isPwd = ref(true);
const loading = ref(false);
const errors = ref<Record<string, string>>({});
const credentialError = ref('');

const validate = (): boolean => {
  errors.value = {};
  credentialError.value = '';
  if (!formData.value.login) {
    errors.value.login = 'Please enter your email or username';
  }
  if (!formData.value.password) {
    errors.value.password = 'Please enter your password';
  }
  return Object.keys(errors.value).length === 0;
};

const onSubmit = async () => {
  if (!validate()) return;

  loading.value = true;
  try {
    const response = await authService.login({
      login: formData.value.login,
      password: formData.value.password,
      remember: formData.value.remember,
    });

    if (response.success) {
      authStore.setUser(response.data.user);
      authStore.setToken(response.data.token);
      toast.success('Welcome back!');
      router.push('/dashboard');
    }
  } catch (error: any) {
    if (error.response?.status === 422) {
      const errs = error.response.data.errors;
      const firstError = Object.values(errs)[0];
      toast.error(Array.isArray(firstError) ? firstError[0] : (firstError as string));
    } else if (error.response?.status === 401) {
      credentialError.value = 'Invalid email/username or password. Please try again.';
    } else {
      toast.error(error.message || 'An error occurred during login');
    }
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => router.push('/register');
const goToForgotPassword = () => router.push('/forgot-password');
</script>

<template>
  <Card class="w-full max-w-sm mx-auto border-border/60 shadow-xl">
    <CardHeader class="space-y-1 pb-4 text-center">
      <CardTitle class="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
      <CardDescription>Sign in to your SpendWise account</CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <form @submit.prevent="onSubmit" class="space-y-4">
        <!-- Credential error banner -->
        <div v-if="credentialError"
          class="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {{ credentialError }}
        </div>

        <!-- Email or Username -->
        <div class="space-y-1.5">
          <Label for="login">Email or Username</Label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="login" v-model="formData.login" type="text"
              placeholder="you@example.com or username" class="pl-9"
              @input="credentialError = ''" />
          </div>
          <p v-if="errors.login" class="text-xs text-destructive">{{ errors.login }}</p>
        </div>

        <!-- Password -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <Label for="password">Password</Label>
            <Button type="button" variant="link" size="sm" class="h-auto px-0 py-0 text-xs text-muted-foreground"
              @click="goToForgotPassword">
              Forgot password?
            </Button>
          </div>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="password" v-model="formData.password" :type="isPwd ? 'password' : 'text'"
              placeholder="••••••••" class="pl-9 pr-10"
              @input="credentialError = ''" />
            <button type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              @click="isPwd = !isPwd">
              <EyeOff v-if="isPwd" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
          <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
        </div>

        <!-- Remember me -->
        <div class="flex items-center gap-2">
          <Checkbox id="remember" :checked="formData.remember" @update:checked="formData.remember = $event" />
          <Label for="remember" class="text-sm font-normal cursor-pointer text-muted-foreground">
            Keep me signed in
          </Label>
        </div>

        <!-- Submit -->
        <Button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white" size="lg" :disabled="loading">
          <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
          Sign In
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
      <Button type="button" variant="outline" class="w-full gap-2">
        <svg class="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </Button>

      <!-- Sign up -->
      <p class="text-center text-sm text-muted-foreground">
        Don't have an account?
        <Button type="button" variant="link" class="h-auto px-1 py-0 text-sm text-indigo-500 font-medium"
          @click="goToRegister">
          Sign up free
        </Button>
      </p>
    </CardContent>
  </Card>
</template>
