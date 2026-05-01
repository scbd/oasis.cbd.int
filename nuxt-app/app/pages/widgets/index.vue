<template>
  <div class="row row-cards">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Widgets</h3>
          <div class="card-options">
            <NuxtLink to="/widgets/new" class="btn btn-sm btn-success">New widget</NuxtLink>
          </div>
        </div>

        <div v-if="loading" class="card-body d-flex justify-content-center">
          <div class="spinner-border text-primary" />
        </div>

        <div v-else class="card-body p-0">
          <div v-if="error" class="alert alert-danger m-3">{{ error }}</div>
          <table class="table table-vcenter card-table">
            <thead>
              <tr>
                <th style="width: 40px">#</th>
                <th>Name</th>
                <th>Method</th>
                <th>Content type</th>
                <th>Updated by</th>
                <th>Updated on</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-if="!widgets.length">
                <td colspan="7" class="text-secondary text-center py-4">No widgets found</td>
              </tr>
              <tr v-for="(widget, i) in widgets" :key="widget._id">
                <td class="text-secondary">{{ i + 1 }}</td>
                <td>
                  <NuxtLink :to="`/widgets/${widget._id}/edit`" class="fw-bold">{{
                    widget.name
                  }}</NuxtLink>
                </td>
                <td>
                  <span class="badge bg-azure-lt">{{ widget.method }}</span>
                </td>
                <td class="text-secondary small">{{ widget.contentType }}</td>
                <td class="text-secondary">
                  {{ widget.meta?.modifiedByInfo?.firstName }}
                  {{ widget.meta?.modifiedByInfo?.lastName }}
                </td>
                <td class="text-secondary small">{{ formatDate(widget.meta?.modifiedOn) }}</td>
                <td class="text-end">
                  <NuxtLink
                    :to="`/widgets/${widget._id}/edit`"
                    class="btn btn-sm btn-ghost-secondary me-1"
                    >Edit</NuxtLink
                  >
                  <button class="btn btn-sm btn-ghost-danger" @click="onDelete(widget)">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { formatDate } from '~/composables/useUtils'
  import { useWidgetsApi } from '~/composables/useWidgetsApi'
  import type { Widget } from '~/composables/useWidgetsApi'

  definePageMeta({
    title: 'Widgets',
    breadcrumbs: [{ label: 'Widgets', path: '/widgets' }]
  })

  const widgetsApi = useWidgetsApi()
  const widgets = ref<Widget[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      widgets.value = await widgetsApi.getWidgets()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load widgets'
    } finally {
      loading.value = false
    }
  }

  async function onDelete(widget: Widget) {
    if (!confirm(`Delete widget "${widget.name}"?`)) return
    try {
      await widgetsApi.deleteWidget(widget._id!)
      widgets.value = widgets.value.filter((w) => w._id !== widget._id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete widget'
    }
  }

  onMounted(load)
</script>
