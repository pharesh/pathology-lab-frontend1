<template>
  <span :class="classes" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ status: String })

const colorMap = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-orange-100 text-orange-800',
  unpaid: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  'no bill': 'bg-gray-100 text-gray-500',
  'result_entered': 'bg-teal-100 text-teal-800',
  'sample_collected': 'bg-indigo-100 text-indigo-800',
}

const classes = computed(() => colorMap[props.status] ?? 'bg-gray-100 text-gray-700')
</script>
