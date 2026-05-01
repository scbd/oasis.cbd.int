<template>
  <div class="row row-cards">
    <!-- Search -->
    <div class="col-12">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Articles</h3></div>
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-6">
              <input
                v-model="search"
                type="text"
                class="form-control"
                placeholder="Search by title…"
                @keyup.enter="onSearch"
              />
            </div>
            <div class="col-auto">
              <button class="btn btn-primary" @click="onSearch">Search</button>
              <button class="btn btn-link text-secondary ms-2" @click="onClear">Clear</button>
            </div>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
          <span class="text-secondary small">{{ total }} articles</span>
          <NuxtLink to="/articles/new" class="btn btn-sm btn-success">New article</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="error" class="col-12">
      <div class="alert alert-danger">{{ error }}</div>
    </div>

    <div class="col-12">
      <div class="card">
        <div v-if="loading" class="card-body d-flex justify-content-center">
          <div class="spinner-border text-primary" />
        </div>
        <div v-else class="card-body p-0">
          <table class="table table-vcenter card-table">
            <thead>
              <tr>
                <th style="width: 40px">#</th>
                <th>Title</th>
                <th>Updated by</th>
                <th>Updated on</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-if="!articles.length">
                <td colspan="5" class="text-secondary text-center py-4">No articles found</td>
              </tr>
              <tr v-for="(article, i) in articles" :key="article._id">
                <td class="text-secondary">{{ (page - 1) * pageSize + i + 1 }}</td>
                <td>
                  <NuxtLink :to="`/articles/${article._id}`" class="fw-bold">{{
                    lstring(article.title)
                  }}</NuxtLink>
                </td>
                <td class="text-secondary">
                  {{ article.meta?.modifiedByInfo?.firstName }}
                  {{ article.meta?.modifiedByInfo?.lastName }}
                </td>
                <td class="text-secondary small">{{ formatDate(article.meta?.modifiedOn) }}</td>
                <td class="text-end">
                  <NuxtLink
                    :to="`/articles/${article._id}/edit`"
                    class="btn btn-sm btn-ghost-secondary me-1"
                    >Edit</NuxtLink
                  >
                  <button class="btn btn-sm btn-ghost-danger" @click="onDelete(article)">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="card-footer d-flex align-items-center">
          <p class="m-0 text-secondary">
            Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, total) }} of
            {{ total }}
          </p>
          <ul class="pagination m-0 ms-auto">
            <li class="page-item" :class="{ disabled: page <= 1 }">
              <button class="page-link" @click="onChangePage(page - 1)">prev</button>
            </li>
            <li class="page-item active">
              <span class="page-link">{{ page }}</span>
            </li>
            <li class="page-item" :class="{ disabled: page * pageSize >= total }">
              <button class="page-link" @click="onChangePage(page + 1)">next</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { lstring, formatDate } from '~/composables/useUtils'
  import { useArticlesApi } from '~/composables/useArticlesApi'
  import type { Article } from '~/composables/useArticlesApi'

  definePageMeta({
    title: 'Articles',
    breadcrumbs: [{ label: 'Articles', path: '/articles' }]
  })

  const articlesApi = useArticlesApi()

  const search = ref('')
  const articles = ref<Article[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = 25
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadArticles() {
    loading.value = true
    error.value = null
    try {
      const filter = search.value ? { 'title.en': { $$contains: search.value } } : undefined

      const [items, count] = await Promise.all([
        $fetch<Article[]>('/api/v2017/articles', {
          params: {
            q: JSON.stringify({
              query: filter,
              pageNumber: page.value - 1,
              pageLength: pageSize,
              sort: { 'meta.modifiedOn': -1 },
              fields: {
                _id: 1,
                'title.en': 1,
                'meta.modifiedOn': 1,
                'meta.modifiedBy': 1,
                'meta.modifiedByInfo': 1
              }
            })
          }
        }),
        $fetch<Array<{ count?: number }>>('/api/v2017/articles', {
          params: {
            q: JSON.stringify({
              ag: [...(filter ? [{ $match: filter }] : []), { $count: 'count' }]
            })
          }
        }).then((r) => r[0]?.count ?? 0)
      ])
      articles.value = items
      total.value = count
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load articles'
    } finally {
      loading.value = false
    }
  }

  function onSearch() {
    page.value = 1
    loadArticles()
  }

  function onClear() {
    search.value = ''
    page.value = 1
    loadArticles()
  }

  function onChangePage(p: number) {
    page.value = p
    loadArticles()
  }

  async function onDelete(article: Article) {
    if (!confirm(`Delete "${lstring(article.title)}"?`)) return
    try {
      await articlesApi.deleteArticle(article._id)
      await loadArticles()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete article'
    }
  }

  onMounted(loadArticles)
</script>
