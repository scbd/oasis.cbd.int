<template>
  <div v-if="loading" class="d-flex justify-content-center p-4">
    <div class="spinner-border text-primary" />
  </div>
  <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
  <WidgetForm v-else :initial="widget ?? undefined" />
</template>

<script setup lang="ts">
  import { useWidgetsApi } from '~/composables/useWidgetsApi'
  import type { Widget } from '~/composables/useWidgetsApi'

  const route = useRoute()

  definePageMeta({
    title: 'Edit Widget',
    breadcrumbs: [
      { label: 'Widgets', path: '/widgets' },
      { label: 'Edit', path: '' }
    ]
  })

  const widgetsApi = useWidgetsApi()
  const widget = ref<Widget | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      widget.value = await widgetsApi.getWidget(route.params.id as string)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load widget'
    } finally {
      loading.value = false
    }
  })
</script>
