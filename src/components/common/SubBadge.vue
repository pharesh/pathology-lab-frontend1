<template>
  <span :class="styles[status] ?? styles.none" class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
    {{ labels[status] ?? status ?? 'None' }}
  </span>
</template>

<script setup>
defineProps({ status: String })

const labels = {
  trial:    'Trial',
  active:   'Active',
  grace:    'Grace Period',
  expired:  'Expired',
  cancelled:'Cancelled',
  none:     'No Plan',
}

const styles = {
  trial:    'bg-yellow-100 text-yellow-800',
  active:   'bg-green-100 text-green-700',
  grace:    'bg-orange-100 text-orange-700',
  expired:  'bg-red-100 text-red-700',
  cancelled:'bg-gray-100 text-gray-600',
  none:     'bg-gray-100 text-gray-400',
}
</script>
