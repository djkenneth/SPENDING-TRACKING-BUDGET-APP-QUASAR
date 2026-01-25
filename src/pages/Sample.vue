<script setup lang="ts">
import Button from 'src/components/ui/button/Button.vue';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
</script>

<template>
  <!-- All Tailwind classes use tw- prefix -->
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-sky-800">
      Budget Dashboard
    </h1>

    <!-- Quasar components work normally without prefix -->
    <q-card class="mt-6 shadow-lg">
      <q-card-section>
        <div class="text-h6">Account Balance</div>
        <div class="text-4xl font-bold text-green-600 mt-2">
          $12,345.67
        </div>
      </q-card-section>
    </q-card>

    <div class="flex gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>


    <!-- Sizes -->
    <!-- <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button> -->


    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">
            Sign Up
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
      </CardContent>
      <CardFooter class="flex flex-col gap-2">
        <Button class="w-full">
          Login
        </Button>
        <Button variant="outline" class="w-full">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped lang="scss"></style>
