<template>
  <div class="row row-cards">
    <div class="col-12">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title">Dashboard</h3>
          <p class="text-secondary">Welcome to Oasis.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    title: 'Dashboard',
    breadcrumbs: [{ label: 'Dashboard', path: '/' }]
  })
</script>
