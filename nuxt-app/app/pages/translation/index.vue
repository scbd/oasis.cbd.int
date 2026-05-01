<template>
  <div class="row row-cards">
    <div class="col-md-6 col-lg-4">
      <div class="card card-link card-link-pop">
        <div class="card-body">
          <div class="d-flex align-items-center mb-3">
            <IconLanguage :size="32" class="text-primary me-3" />
            <h3 class="card-title mb-0">Trados Projects</h3>
          </div>
          <p class="text-secondary">Manage translation projects and track file packages.</p>
          <NuxtLink to="/translation/trados-projects" class="btn btn-primary btn-sm stretched-link">
            Open
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="col-md-6 col-lg-4">
      <div class="card card-link card-link-pop">
        <div class="card-body">
          <div class="d-flex align-items-center mb-3">
            <IconDatabase :size="32" class="text-azure me-3" />
            <h3 class="card-title mb-0">Database Tables</h3>
          </div>
          <p class="text-secondary">Import translated content into database tables.</p>
          <NuxtLink to="/translation/database-tables" class="btn btn-azure btn-sm stretched-link">
            Open
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IconLanguage, IconDatabase } from '@tabler/icons-vue'

  definePageMeta({
    title: 'Translation',
    breadcrumbs: [{ label: 'Translation', path: '/translation' }]
  })
</script>
