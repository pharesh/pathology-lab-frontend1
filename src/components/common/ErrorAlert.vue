<template>
  <div v-if="message" class="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 text-sm">
    {{ typeof message === 'object' ? Object.values(message).flat().join(' | ') : message }}
  </div>
</template>

<script setup>
defineProps({ message: [String, Object] })
</script>
