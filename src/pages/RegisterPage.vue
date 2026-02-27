<!-- src/pages/RegisterPage.vue -->
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from 'src/components/ui/select';
import { ScrollArea } from 'src/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from 'src/components/ui/dialog';
import { Wallet, User, Mail, Lock, Eye, EyeOff, Loader2, Coins } from 'lucide-vue-next';

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
      toast.success('Account created successfully!');
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
  <Card class="w-full max-w-md">
    <CardHeader class="text-center space-y-2 pb-2">
      <div class="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
        <Wallet class="w-8 h-8 text-primary" />
      </div>
      <CardTitle class="text-2xl">Create Account</CardTitle>
      <p class="text-sm text-muted-foreground">Start managing your finances today</p>
    </CardHeader>

    <CardContent>
      <ScrollArea class="max-h-[60vh]">
        <form @submit.prevent="onSubmit" class="space-y-4 pr-2">
          <div class="space-y-2">
            <Label for="name">Full Name</Label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="name" v-model="formData.name" placeholder="Enter your name" class="pl-10" required />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="reg-email">Email</Label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="reg-email" v-model="formData.email" type="email" placeholder="Enter your email" class="pl-10"
                required />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="reg-password">Password</Label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="reg-password" v-model="formData.password" :type="isPwd ? 'password' : 'text'"
                placeholder="Min 8 chars, letters & numbers" class="pl-10 pr-10" required />
              <button type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="isPwd = !isPwd">
                <EyeOff v-if="isPwd" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="confirm-password">Confirm Password</Label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="confirm-password" v-model="formData.password_confirmation"
                :type="isPwdConfirm ? 'password' : 'text'" placeholder="Confirm your password" class="pl-10 pr-10"
                required />
              <button type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                @click="isPwdConfirm = !isPwdConfirm">
                <EyeOff v-if="isPwdConfirm" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <Label>Currency</Label>
            <Select v-model="formData.currency">
              <SelectTrigger>
                <div class="flex items-center gap-2">
                  <Coins class="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Select currency" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-start gap-2">
            <Checkbox id="terms" v-model:checked="formData.terms" class="mt-0.5" />
            <Label for="terms" class="text-sm font-normal leading-snug cursor-pointer">
              I agree to the
              <button type="button" class="text-primary hover:underline" @click="showTermsDialog = true">Terms of
                Service</button>
              and
              <button type="button" class="text-primary hover:underline" @click="showPrivacyDialog = true">Privacy
                Policy</button>
            </Label>
          </div>

          <Button type="submit" class="w-full" size="lg">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            Create Account
          </Button>
        </form>
      </ScrollArea>

      <div class="text-center text-sm mt-4">
        <span class="text-muted-foreground">Already have an account? </span>
        <Button variant="link" class="px-1 text-sm" @click="goToLogin">Sign In</Button>
      </div>

      <div class="relative mt-4">
        <div class="absolute inset-0 flex items-center">
          <Separator class="w-full" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-card px-2 text-muted-foreground">OR</span>
        </div>
      </div>

      <Button variant="outline" class="w-full mt-4" @click="socialLogin('google')">
        Continue with Google
      </Button>
    </CardContent>
  </Card>

  <Dialog v-model:open="showTermsDialog">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Terms of Service</DialogTitle>
        <DialogDescription class="sr-only">Terms of service content</DialogDescription>
      </DialogHeader>
      <p class="text-sm text-muted-foreground">Terms of Service content will be displayed here.</p>
      <DialogFooter><Button @click="showTermsDialog = false">Close</Button></DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="showPrivacyDialog">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Privacy Policy</DialogTitle>
        <DialogDescription class="sr-only">Privacy policy content</DialogDescription>
      </DialogHeader>
      <p class="text-sm text-muted-foreground">Privacy Policy content will be displayed here.</p>
      <DialogFooter><Button @click="showPrivacyDialog = false">Close</Button></DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* All styles handled by Tailwind CSS */
</style>
