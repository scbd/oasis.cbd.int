<template>
  <div class="row row-cards">
    <div class="col-12">
      <TranslationProjectForm @saved="onSaved" />
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    title: 'New Trados Project',
    breadcrumbs: [
      { label: 'Translation', path: '/translation' },
      { label: 'Trados Projects', path: '/translation/trados-projects' },
      { label: 'New', path: '/translation/trados-projects/new' }
    ]
  })

  const router = useRouter()

  function onSaved(_id: string) {
    router.push('/translation/trados-projects')
  }
</script>
