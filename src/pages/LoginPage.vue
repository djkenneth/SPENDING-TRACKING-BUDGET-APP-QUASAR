<!-- src/pages/LoginPage.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth';
import { toast } from 'vue-sonner';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Checkbox } from 'src/components/ui/checkbox';
import { Separator } from 'src/components/ui/separator';
import { Wallet, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

const router = useRouter();
const authStore = useAuthStore();

const formData = ref<LoginForm>({
  email: '',
  password: '',
  remember: false,
});

const isPwd = ref(true);
const loading = ref(false);
const errors = ref<Record<string, string>>({});

const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

const validate = (): boolean => {
  errors.value = {};
  if (!formData.value.email) {
    errors.value.email = 'Please enter your email';
  } else if (!validateEmail(formData.value.email)) {
    errors.value.email = 'Please enter a valid email';
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
      email: formData.value.email,
      password: formData.value.password,
      remember: formData.value.remember,
    });

    if (response.success) {
      authStore.setUser(response.data.user);
      authStore.setToken(response.data.token);
      toast.success('Login successful!');
      router.push('/dashboard');
    }
  } catch (error: any) {
    if (error.response?.status === 422) {
      const errs = error.response.data.errors;
      const firstError = Object.values(errs)[0];
      toast.error(Array.isArray(firstError) ? firstError[0] : (firstError as string));
    } else if (error.response?.status === 401) {
      toast.error('Invalid email or password');
    } else {
      toast.error(error.message || 'An error occurred during login');
    }
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => router.push('/register');
const goToForgotPassword = () => router.push('/forgot-password');

const socialLogin = (provider: string) => {
  toast.info(`${provider} login will be implemented soon`);
};
</script>

<template>
  <Card class="w-full max-w-md">
    <CardHeader class="text-center space-y-2 pb-2">
      <div class="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
        <Wallet class="w-8 h-8 text-primary" />
      </div>
      <CardTitle class="text-2xl">Welcome Back</CardTitle>
      <p class="text-sm text-muted-foreground">Sign in to your account</p>
    </CardHeader>

    <CardContent class="space-y-4">
      <form @submit.prevent="onSubmit" class="space-y-4">
        <!-- Email -->
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Enter your email"
              class="pl-10"
            />
          </div>
          <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="space-y-2">
          <Label for="password">Password</Label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              v-model="formData.password"
              :type="isPwd ? 'password' : 'text'"
              placeholder="Enter your password"
              class="pl-10 pr-10"
            />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              @click="isPwd = !isPwd">
              <EyeOff v-if="isPwd" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
          <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
        </div>

        <!-- Remember + Forgot -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Checkbox id="remember" :checked="formData.remember"
              @update:checked="formData.remember = $event" />
            <Label for="remember" class="text-sm font-normal cursor-pointer">Remember me</Label>
          </div>
          <Button variant="link" size="sm" class="px-0 text-xs" @click="goToForgotPassword">
            Forgot Password?
          </Button>
        </div>

        <!-- Submit -->
        <Button type="submit" class="w-full" size="lg" :disabled="loading">
          <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
          Sign In
        </Button>
      </form>

      <!-- Sign up link -->
      <div class="text-center text-sm">
        <span class="text-muted-foreground">Don't have an account? </span>
        <Button variant="link" class="px-1 text-sm" @click="goToRegister">Sign Up</Button>
      </div>

      <!-- Social Login -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <Separator class="w-full" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-card px-2 text-muted-foreground">OR</span>
        </div>
      </div>

      <Button variant="outline" class="w-full" @click="socialLogin('google')">
        Continue with Google
      </Button>
    </CardContent>
  </Card>
</template>

<style scoped>
/* All styles handled by Tailwind CSS */
</style>
