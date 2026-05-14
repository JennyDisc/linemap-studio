<script setup lang="ts">
import { provide } from 'vue'
import { showModal, type ModalOptions } from '@/composables/useBaseModal'

import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const openModal = (options: ModalOptions) => {
  showModal(options)
}
provide('openModal', openModal)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <Header />
    <main class="container mx-auto grow p-6">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
      <BaseModal />
    </main>
    <Footer />
  </div>
</template>
