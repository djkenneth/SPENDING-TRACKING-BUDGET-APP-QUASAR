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
  <div class="tw:container tw:mx-auto tw:p-4">
    <h1 class="tw:text-3xl tw:font-bold tw:text-sky-800">
      Budget Dashboard
    </h1>

    <!-- Quasar components work normally without prefix -->
    <q-card class="tw:mt-6 tw:shadow-lg">
      <q-card-section>
        <div class="tw:text-h6">Account Balance</div>
        <div class="tw:text-4xl tw:font-bold tw:text-green-600 tw:mt-2">
          $12,345.67
        </div>
      </q-card-section>
    </q-card>

    <button class="tw:bg-blue-500 tw:hover:bg-blue-700 tw:text-white tw:font-bold tw:py-2 tw:px-4 tw:rounded">
      Button Text
    </button>

    <!-- Primary button (default) -->
    <Button>Save</Button>

    <!-- Outline button -->
    <Button variant="outline">Cancel</Button>

    <!-- Destructive button -->
    <Button variant="destructive">Delete</Button>

    <!-- Ghost button -->
    <Button variant="ghost">Edit</Button>

    <!-- Link button -->
    <Button variant="link">Learn more</Button>

    <!-- Sizes -->
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">
      <Plus class="tw-h-4 tw-w-4" />
    </Button>


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
