<template>
  <ArticleForm />
</template>

<script setup lang="ts">
  definePageMeta({
    title: 'New Article',
    breadcrumbs: [
      { label: 'Articles', path: '/articles' },
      { label: 'New', path: '' }
    ]
  })
</script>
