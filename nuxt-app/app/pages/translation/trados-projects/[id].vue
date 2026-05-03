<template>
  <div class="row row-cards">
    <div class="col-12">
      <div v-if="loading" class="d-flex justify-content-center p-4">
        <div class="spinner-border text-primary" />
      </div>

      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <TranslationProjectForm v-else-if="project" :initial="project" @saved="onSaved" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { TranslationProject } from '~/types/translation'
  import { translationApi as api } from '~/api'

  const route = useRoute()
  const router = useRouter()

  const id = route.params.id as string

  definePageMeta({
    title: 'Trados Project',
    breadcrumbs: [
      { label: 'Translation', path: '/translation' },
      { label: 'Trados Projects', path: '/translation/trados-projects' },
      { label: 'Project', path: '' }
    ]
  })

  const project = ref<TranslationProject | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProject() {
    loading.value = true
    error.value = null
    try {
      project.value = await api.getProject(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load project'
    } finally {
      loading.value = false
    }
  }

  function onSaved(_id: string) {
    router.push('/translation/trados-projects')
  }

  onMounted(fetchProject)
</script>
