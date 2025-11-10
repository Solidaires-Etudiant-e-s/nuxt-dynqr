<template>
  <div class="container mx-auto p-4 space-y-4">
    <h1 class="text-2xl font-bold">{{ $t('admin.title') }}</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="tabler:list-details" />
            <span>{{ $t('admin.qrList') }}</span>
          </div>
        </template>
        <p class="text-gray-600 mb-3">{{ $t('admin.qrListDesc') }}</p>
        <UButton :to="'/admin/qr-list'" icon="tabler:arrow-right">{{ $t('common.open') }}</UButton>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="tabler:brand-appgallery" />
            <span>{{ $t('admin.brand') }}</span>
          </div>
        </template>
        <p class="text-gray-600 mb-3">{{ $t('admin.brandDesc') }}</p>
        <UButton :to="'/admin/brand'" icon="tabler:arrow-right">{{ $t('common.open') }}</UButton>
      </UCard>
    </div>
  </div>
  
</template>

<script setup lang="ts">
// Admin landing page
</script>

<style scoped>
</style>
