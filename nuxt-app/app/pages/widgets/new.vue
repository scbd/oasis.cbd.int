<template>
  <WidgetForm />
</template>

<script setup lang="ts">
  definePageMeta({
    title: 'New Widget',
    breadcrumbs: [
      { label: 'Widgets', path: '/widgets' },
      { label: 'New', path: '' }
    ]
  })
</script>
