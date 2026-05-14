<script setup lang="ts">
import Footer from '@/components/layout/Footer.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <main class="container mx-auto flex grow flex-col items-center justify-center p-6">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <Footer />
  </div>
</template>
