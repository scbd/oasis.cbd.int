<template>
  <div v-if="loading" class="d-flex justify-content-center p-4">
    <div class="spinner-border text-primary" />
  </div>
  <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
  <ArticleForm v-else :initial="article ?? undefined" />
</template>

<script setup lang="ts">
  import { articlesApi } from '~/api'
  import type { Article } from '~/api'

  const route = useRoute()

  definePageMeta({
    title: 'Edit Article',
    breadcrumbs: [
      { label: 'Articles', path: '/articles' },
      { label: 'Edit', path: '' }
    ]
  })
  const article = ref<Article | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      article.value = await articlesApi.getArticle(route.params.id as string)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load article'
    } finally {
      loading.value = false
    }
  })
</script>
