<template>
  <span class="badge" :class="isAdmin ? 'bg-success' : 'bg-secondary'">
    {{ isAdmin ? 'You are Administrator' : 'You are not Administrator' }}
  </span>
</template>

<script setup lang="ts">
  const props = defineProps<{
    adminRoles?: string[]
  }>()

  const auth = useAuthStore()

  const isAdmin = computed(() =>
    (props.adminRoles ?? []).some((role) => auth.user.roles.includes(role))
  )
</script>
