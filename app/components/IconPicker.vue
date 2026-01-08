<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const searchQuery = ref('')
const showSheet = ref(false)
const icons = ref<string[]>([])
const isLoading = ref(false)

const filteredIcons = computed(() => {
  if (!searchQuery.value) return icons.value
  return icons.value.filter(icon =>
    icon.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const ICONS_URL = 'https://raw.githubusercontent.com/iconify/icon-sets/refs/heads/master/json/mingcute.json'

onMounted(async () => {
  isLoading.value = true
  try {
    const response = await fetch(ICONS_URL)
    const data = await response.json()
    icons.value = Object.keys(data.icons)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load icons:', error)
  }
  isLoading.value = false
})

function close() {
  showSheet.value = false
  searchQuery.value = ''
}

function open() {
  showSheet.value = true
}

function selectIcon(icon: string) {
  emit('update:modelValue', icon)
  close()
}
</script>

<template>
  <div>
    <UButton @click="open" color="primary" variant="soft" class="w-full justify-start gap-3">
      <span class="w-8 h-8 flex items-center justify-center bg-primary-500 rounded-full">
        <Icon v-if="modelValue" :icon="'mingcute:' + modelValue" class="w-6 h-6 text-white" />
        <Icon v-else icon="mingcute:add-line" class="w-6 h-6 text-white" />
      </span>
      <span class="flex-1 text-left">
        <span class="text-sm">{{ placeholder || 'Select an icon' }}</span>
        <span v-if="modelValue" class="block text-xs text-gray-500">{{ modelValue }}</span>
      </span>
      <Icon icon="mingcute:down-line" class="w-4 h-4 text-gray-400" />
    </UButton>

    <UModal v-model:open="showSheet" :title="$t('qr.chooseIcon')">
      <template #body>
        <div class="flex items-center mb-2 gap-2">
          <UInput v-model="searchQuery" :placeholder="$t('qr.searchIcon')" class="flex-1" />
          <UButton @click="close" color="neutral" size="sm">{{ $t('common.cancel') }}</UButton>
        </div>
        <div class="overflow-y-auto" style="max-height: 60vh;">
          <div v-if="isLoading" class="p-4 text-center text-gray-500">
            <span class="animate-spin inline-block"><Icon icon="mingcute:loading-line" class="w-6 h-6" /></span>
            {{ $t('qr.loadingIcons') }}
          </div>
          <div v-else-if="filteredIcons.length === 0" class="p-4 text-center text-gray-500">
            {{ $t('qr.noIcons') }}
          </div>
          <div v-else class="grid grid-cols-6 gap-3">
            <button v-for="icon in filteredIcons" :key="icon" @click="selectIcon(icon)"
              class="aspect-square rounded-xl flex items-center justify-center transition-all"
              :class="modelValue === icon ? 'bg-primary/10' : 'hover:bg-gray-50'">
              <Icon :icon="'mingcute:' + icon" class="w-6 h-6" />
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
  
</template>

<style scoped>
.overflow-y-auto {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
</style>
