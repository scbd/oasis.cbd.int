<template>
  <div class="row row-cards">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            Trados Projects
            <span v-if="projects.length" class="text-secondary ms-1">({{ projects.length }})</span>
          </h3>
          <div class="card-options">
            <NuxtLink to="/translation/trados-projects/new" class="btn btn-primary btn-sm">
              <IconPlus :size="16" class="me-1" /> New Trados Project
            </NuxtLink>
          </div>
        </div>

        <div class="card-body p-0">
          <div v-if="error" class="alert alert-danger m-3">{{ error }}</div>

          <div v-if="loading" class="d-flex justify-content-center p-4">
            <div class="spinner-border text-primary" />
          </div>

          <div v-else-if="!projects.length" class="p-4 text-secondary text-center">
            No records found
          </div>

          <div v-else class="table-responsive">
            <table class="table table-vcenter card-table">
              <thead>
                <tr>
                  <th style="width: 40px">#</th>
                  <th>Name</th>
                  <th>Application</th>
                  <th>Target languages</th>
                  <th>Files</th>
                  <th>Status</th>
                  <th>Updated on</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr v-for="(doc, i) in projects" :key="doc._id">
                  <td class="text-secondary">{{ i + 1 }}</td>
                  <td>{{ doc.name }}</td>
                  <td>{{ doc.application }}</td>
                  <td>
                    <span v-if="doc.targetLocales?.length" class="d-flex flex-wrap gap-1">
                      <span
                        v-for="code in doc.targetLocales"
                        :key="code"
                        class="badge bg-azure-lt"
                        >{{ code }}</span
                      >
                    </span>
                    <span v-else class="text-secondary">none</span>
                  </td>
                  <td>{{ doc.sourceFileUrls?.length ?? 0 }}</td>
                  <td>
                    <span class="badge" :class="statusBadge(doc.status)">
                      {{ doc.status ?? '—' }}
                    </span>
                  </td>
                  <td class="text-secondary">{{ formatDate(doc.updatedOn) }}</td>
                  <td>
                    <NuxtLink
                      :to="`/translation/trados-projects/${doc._id}`"
                      class="btn btn-sm btn-ghost-primary"
                    >
                      View
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IconPlus } from '@tabler/icons-vue'
  import type { TranslationProject } from '~/types/translation'

  definePageMeta({
    title: 'Trados Projects',
    breadcrumbs: [
      { label: 'Translation', path: '/translation' },
      { label: 'Trados Projects', path: '/translation/trados-projects' }
    ]
  })

  const api = useTranslationApi()

  const projects = ref<TranslationProject[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function formatDate(value?: string): string {
    if (!value) return '—'
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  function statusBadge(status?: string): string {
    const map: Record<string, string> = {
      active: 'bg-success-lt',
      pending: 'bg-warning-lt',
      completed: 'bg-azure-lt',
      cancelled: 'bg-danger-lt'
    }
    return map[status?.toLowerCase() ?? ''] ?? 'bg-secondary-lt'
  }

  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      projects.value = await api.getProjects({ length: 25, skip: 0 })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load projects'
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchProjects)
</script>
