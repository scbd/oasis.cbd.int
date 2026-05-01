<template>
  <div class="row row-cards">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">SCBD Projects</h3>
        </div>
        <div class="card-body">
          <div v-if="loading" class="d-flex justify-content-center p-4">
            <div class="spinner-border text-primary" />
          </div>
          <div v-else class="row g-3">
            <div v-for="project in projects" :key="project.id" class="col-md-6 col-lg-4">
              <div class="card card-sm">
                <div class="card-header">
                  <a
                    :href="project.html_url"
                    target="_blank"
                    rel="noopener"
                    class="fw-bold text-body"
                  >
                    {{ project.name }} <IconExternalLink :size="13" />
                  </a>
                </div>
                <div class="card-body">
                  <p v-if="project.description" class="text-secondary small mb-2">
                    {{ project.description }}
                  </p>
                  <div class="row text-center">
                    <div class="col-4 border-end">
                      <div class="fw-bold">{{ project.stargazers_count }}</div>
                      <div class="text-secondary small">Stars</div>
                    </div>
                    <div class="col-4 border-end">
                      <div class="fw-bold">{{ project.forks_count }}</div>
                      <div class="text-secondary small">Forks</div>
                    </div>
                    <div class="col-4">
                      <NuxtLink
                        :to="`/translation/trados-projects?repo=${project.name}`"
                        class="text-secondary small"
                      >
                        Translation
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IconExternalLink } from '@tabler/icons-vue'

  definePageMeta({
    title: 'Projects',
    breadcrumbs: [{ label: 'Projects', path: '/projects' }]
  })

  interface GithubRepo {
    id: number
    name: string
    description?: string
    html_url: string
    stargazers_count: number
    forks_count: number
    owner: { avatar_url: string }
  }

  const projects = ref<GithubRepo[]>([])
  const loading = ref(true)

  onMounted(async () => {
    try {
      const res = await $fetch<GithubRepo[]>('https://api.github.com/orgs/scbd/repos?per_page=100')
      projects.value = res.sort((a, b) => a.name.localeCompare(b.name))
    } finally {
      loading.value = false
    }
  })
</script>
