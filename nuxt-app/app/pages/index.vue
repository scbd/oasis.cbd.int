<template>
  <div class="row row-cards">
    <!-- Stat boxes -->
    <div class="col-sm-6 col-lg-3">
      <div class="card card-sm">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-auto">
              <span class="bg-azure text-white avatar"><IconArticle :size="20" /></span>
            </div>
            <div class="col">
              <div class="font-weight-medium">{{ counts.articles ?? '…' }}</div>
              <div class="text-secondary">Articles</div>
            </div>
          </div>
        </div>
        <NuxtLink to="/articles" class="card-footer text-secondary small">See all</NuxtLink>
      </div>
    </div>

    <div class="col-sm-6 col-lg-3">
      <div class="card card-sm">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-auto">
              <span class="bg-green text-white avatar"><IconTools :size="20" /></span>
            </div>
            <div class="col">
              <div class="font-weight-medium">{{ counts.widgets ?? '…' }}</div>
              <div class="text-secondary">Widgets</div>
            </div>
          </div>
        </div>
        <NuxtLink to="/widgets" class="card-footer text-secondary small">See all</NuxtLink>
      </div>
    </div>

    <div class="col-sm-6 col-lg-3">
      <div class="card card-sm">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-auto">
              <span class="bg-yellow text-white avatar"><IconBrandGithub :size="20" /></span>
            </div>
            <div class="col">
              <div class="font-weight-medium">{{ counts.projects ?? '…' }}</div>
              <div class="text-secondary">Public repositories</div>
            </div>
          </div>
        </div>
        <NuxtLink to="/projects" class="card-footer text-secondary small">See all</NuxtLink>
      </div>
    </div>

    <div class="col-sm-6 col-lg-3">
      <div class="card card-sm">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-auto">
              <span class="bg-red text-white avatar"><IconAlertCircle :size="20" /></span>
            </div>
            <div class="col">
              <div class="font-weight-medium">{{ counts.failedWorkflows ?? '…' }}</div>
              <div class="text-secondary">Failed workflows</div>
            </div>
          </div>
        </div>
        <NuxtLink
          to="/clearing-house/records/failed-workflows"
          class="card-footer text-secondary small"
          >See all</NuxtLink
        >
      </div>
    </div>

    <!-- Recent articles -->
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Recent Articles</h3>
          <div class="card-options">
            <NuxtLink to="/articles" class="btn btn-sm btn-primary">View all</NuxtLink>
          </div>
        </div>
        <div class="card-body p-0">
          <div v-if="loadingArticles" class="d-flex justify-content-center p-4">
            <div class="spinner-border text-primary" />
          </div>
          <table v-else class="table table-vcenter card-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Updated by</th>
                <th>Updated on</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(article, i) in recentArticles" :key="article._id">
                <td class="text-secondary">{{ i + 1 }}</td>
                <td>
                  <NuxtLink :to="`/articles/${article._id}`">{{ lstring(article.title) }}</NuxtLink>
                </td>
                <td class="text-secondary">
                  {{ article.meta?.modifiedByInfo?.firstName }}
                  {{ article.meta?.modifiedByInfo?.lastName }}
                </td>
                <td class="text-secondary small">{{ formatDate(article.meta?.modifiedOn) }}</td>
                <td>
                  <NuxtLink
                    :to="`/articles/${article._id}/edit`"
                    class="btn btn-sm btn-ghost-secondary"
                  >
                    <IconEdit :size="14" />
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Recent widgets -->
    <div class="col-md-4">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Recent Widgets</h3>
          <div class="card-options">
            <NuxtLink to="/widgets" class="btn btn-sm btn-primary">View all</NuxtLink>
          </div>
        </div>
        <div class="card-body p-0">
          <div v-if="loadingWidgets" class="d-flex justify-content-center p-4">
            <div class="spinner-border text-primary" />
          </div>
          <table v-else class="table table-vcenter card-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Updated on</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(widget, i) in recentWidgets" :key="widget._id">
                <td class="text-secondary">{{ i + 1 }}</td>
                <td>
                  <NuxtLink :to="`/widgets/${widget._id}/edit`">{{ widget.name }}</NuxtLink>
                </td>
                <td class="text-secondary small">{{ formatDate(widget.meta?.modifiedOn) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    IconArticle,
    IconTools,
    IconBrandGithub,
    IconAlertCircle,
    IconEdit
  } from '@tabler/icons-vue'
  import { lstring, formatDate } from '~/composables/useUtils'
  import { articlesApi, widgetsApi, githubApi, clearingHouseApi } from '~/api'
  import type { Article, Widget } from '~/api'

  definePageMeta({
    title: 'Dashboard',
    breadcrumbs: [{ label: 'Dashboard', path: '/' }]
  })

  const counts = reactive<Record<string, number | undefined>>({
    articles: undefined,
    widgets: undefined,
    projects: undefined,
    failedWorkflows: undefined
  })

  const recentArticles = ref<Article[]>([])
  const recentWidgets = ref<Widget[]>([])
  const loadingArticles = ref(true)
  const loadingWidgets = ref(true)

  onMounted(() => {
    Promise.all([
      articlesApi.countArticles().then((n) => (counts.articles = n)),
      widgetsApi.countWidgets().then((n) => (counts.widgets = n)),
      githubApi.getOrg('scbd').then((r) => (counts.projects = r.public_repos)),
      clearingHouseApi
        .getWorkflowHistory({ q: JSON.stringify({ ag: [{ $count: 'count' }] }) })
        .then((r) => (counts.failedWorkflows = (r as Array<{ count?: number }>)[0]?.count ?? 0))
    ])

    articlesApi
      .getArticles()
      .then((r) => (recentArticles.value = r.slice(0, 20)))
      .finally(() => (loadingArticles.value = false))

    widgetsApi
      .getWidgets()
      .then((r) => (recentWidgets.value = r.slice(0, 20)))
      .finally(() => (loadingWidgets.value = false))
  })
</script>
