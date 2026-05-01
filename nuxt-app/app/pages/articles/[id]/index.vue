<template>
  <div class="row row-cards">
    <div class="col-12">
      <div v-if="loading" class="d-flex justify-content-center p-4">
        <div class="spinner-border text-primary" />
      </div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
      <template v-else-if="article">
        <div class="card mb-3">
          <div class="card-header">
            <h3 class="card-title">{{ lstring(article.title) }}</h3>
            <div class="card-options">
              <NuxtLink :to="`/articles/${article._id}/edit`" class="btn btn-sm btn-primary me-2"
                >Edit</NuxtLink
              >
              <NuxtLink to="/articles" class="btn btn-sm btn-ghost-secondary">Back</NuxtLink>
            </div>
          </div>

          <!-- Locale tabs -->
          <div v-if="hasMultipleLocales" class="card-header border-top">
            <ul class="nav nav-tabs card-header-tabs">
              <li v-for="locale in availableLocales" :key="locale" class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeLocale === locale }"
                  @click="activeLocale = locale"
                >
                  {{ locale.toUpperCase() }}
                </button>
              </li>
            </ul>
          </div>

          <div class="card-body">
            <!-- Cover image -->
            <div v-if="article.coverImage?.url" class="mb-3">
              <img
                :src="article.coverImage.url"
                class="img-fluid rounded"
                style="max-height: 300px"
              />
            </div>
            <!-- Content -->
            <div
              class="ck-content"
              v-html="(article.content as Record<string, string> | undefined)?.[activeLocale] ?? ''"
            />
          </div>

          <div class="card-footer text-secondary small d-flex gap-3">
            <span
              >Updated by {{ article.meta?.modifiedByInfo?.firstName }}
              {{ article.meta?.modifiedByInfo?.lastName }}</span
            >
            <span>{{ formatDate(article.meta?.modifiedOn) }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { lstring, formatDate } from '~/composables/useUtils'
  import { useArticlesApi } from '~/composables/useArticlesApi'
  import type { Article } from '~/composables/useArticlesApi'

  const route = useRoute()
  const articlesApi = useArticlesApi()

  definePageMeta({
    title: 'Article',
    breadcrumbs: [
      { label: 'Articles', path: '/articles' },
      { label: 'View', path: '' }
    ]
  })

  const article = ref<Article | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const activeLocale = ref('en')

  const availableLocales = computed(() => {
    const content = article.value?.content as Record<string, string> | undefined
    if (!content) return ['en']
    return Object.keys(content).filter((k) => content[k])
  })

  const hasMultipleLocales = computed(() => availableLocales.value.length > 1)

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
