<template>
  <div class="row row-cards">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Realms List</h3>
        </div>
        <div class="card-body p-0">
          <div v-if="error" class="alert alert-danger m-3">{{ error }}</div>
          <div v-if="loading" class="d-flex justify-content-center p-4">
            <div class="spinner-border text-primary" />
          </div>

          <div v-else>
            <div v-for="realm in environmentRealms" :key="realm.realm" class="p-3 border-bottom">
              <div class="d-flex align-items-center gap-2 mb-2">
                <strong>{{ realm.realm }}</strong>
                <RolesStatus :admin-roles="realm.roles.administrator" />
              </div>
              <table class="table table-sm table-bordered mb-0">
                <thead>
                  <tr>
                    <th>UID prefix</th>
                    <th>Display name</th>
                    <th>Hosts</th>
                    <th>Email</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ realm.uIdPrefix }}</td>
                    <td>{{ realm.displayName }}</td>
                    <td>
                      <div v-for="host in realm.hosts" :key="host">{{ host }}</div>
                    </td>
                    <td>{{ realm.email }}</td>
                    <td>
                      <NuxtLink
                        :to="`/clearing-house/realms/${environment}/${encodeURIComponent(realm.hosts[0])}`"
                      >
                        <IconSearch :size="16" />
                      </NuxtLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IconSearch } from '@tabler/icons-vue'
  import { clearingHouseApi as api } from '~/api'
  import type { RealmConfig } from '~/api'

  const route = useRoute()
  const environment = route.params.environment as string

  definePageMeta({
    title: 'Realms List',
    breadcrumbs: [
      { label: 'Clearing-House', path: '/clearing-house' },
      { label: 'Realms', path: '' }
    ]
  })

  const realms = ref<RealmConfig[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const environmentRealms = computed(() =>
    realms.value.filter((r) => r.environment === environment)
  )

  onMounted(async () => {
    loading.value = true
    try {
      realms.value = await api.getRealmConfigurations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load realms'
    } finally {
      loading.value = false
    }
  })
</script>
