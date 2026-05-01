<template>
  <div class="row row-cards">
    <!-- Quick nav cards -->
    <div class="col-md-4">
      <NuxtLink to="/clearing-house/records" class="card card-link card-link-pop">
        <div class="card-body d-flex align-items-center gap-3">
          <IconListNumbers :size="32" class="text-azure" />
          <div>
            <div class="card-title mb-0">Records</div>
            <small class="text-secondary">View all Clearing-House records</small>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div class="col-md-4">
      <NuxtLink to="/clearing-house/records/history" class="card card-link card-link-pop">
        <div class="card-body d-flex align-items-center gap-3">
          <IconHistory :size="32" class="text-green" />
          <div>
            <div class="card-title mb-0">Record History</div>
            <small class="text-secondary">View all record history</small>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div class="col-md-4">
      <NuxtLink to="/clearing-house/records/failed-workflows" class="card card-link card-link-pop">
        <div class="card-body d-flex align-items-center gap-3">
          <IconHourglass :size="32" class="text-yellow" />
          <div>
            <div class="card-title mb-0">Failed Workflows</div>
            <small class="text-secondary">View all failed workflows</small>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Realms section -->
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <div class="d-flex align-items-center gap-3 flex-fill">
            <h3 class="card-title mb-0">Realms</h3>
            <select
              v-model="selectedEnvKey"
              class="form-select form-select-sm w-auto"
              @change="onEnvironmentChange"
            >
              <option value="">Select environment</option>
              <option v-for="env in availableEnvironments" :key="env.key" :value="env.key">
                {{ env.title }}
              </option>
            </select>
          </div>
          <div class="card-options">
            <NuxtLink
              v-if="selectedEnvKey"
              :to="`/clearing-house/realms/${selectedEnvKey}/list`"
              class="btn btn-sm btn-primary"
            >
              View realm list
            </NuxtLink>
          </div>
        </div>

        <div class="card-body">
          <div v-if="loading" class="d-flex justify-content-center p-4">
            <div class="spinner-border text-primary" />
          </div>

          <div v-else-if="!selectedEnvKey" class="text-secondary text-center py-4">
            Select an environment to view realms
          </div>

          <div v-else-if="!environmentRealms.length" class="text-secondary text-center py-4">
            No realms found for this environment
          </div>

          <div v-else class="row g-3">
            <div v-for="realm in environmentRealms" :key="realm.realm" class="col-md-6 col-lg-4">
              <div class="card card-sm">
                <div class="card-header">
                  <div class="d-flex align-items-center gap-2 flex-fill">
                    <a
                      :href="realm.baseURL"
                      target="_blank"
                      rel="noopener"
                      class="text-body fw-bold"
                    >
                      {{ realm.displayName }} ({{ realm.realm }})
                      <IconExternalLink :size="14" />
                    </a>
                  </div>
                  <div class="card-options">
                    <RolesStatus :admin-roles="realm.roles.administrator" />
                  </div>
                </div>
                <div class="card-body p-0">
                  <table class="table table-sm table-vcenter card-table mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Schema</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(schema, name, i) in realm.schemas" :key="name">
                        <td>{{ i + 1 }}</td>
                        <td>
                          <NuxtLink
                            :to="`/clearing-house/records/${selectedEnvKey}/${realm.realm}/${name}`"
                          >
                            {{ lstring(schema.title) }} ({{ name }})
                          </NuxtLink>
                        </td>
                        <td>{{ schema.type }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="card-footer">
                  <NuxtLink
                    :to="`/clearing-house/realms/${selectedEnvKey}/${encodeURIComponent(realm.hosts[0])}`"
                    class="btn btn-sm btn-primary"
                  >
                    View realm details
                  </NuxtLink>
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
  import { IconListNumbers, IconHistory, IconHourglass, IconExternalLink } from '@tabler/icons-vue'
  import { getEnvironments } from '~/data/environments'
  import { lstring } from '~/composables/useUtils'
  import type { RealmConfig } from '~/composables/useClearingHouseApi'

  definePageMeta({
    title: 'Clearing-House',
    breadcrumbs: [{ label: 'Clearing-House', path: '/clearing-house' }]
  })

  const route = useRoute()
  const router = useRouter()
  const api = useClearingHouseApi()
  const config = useRuntimeConfig()

  const isProduction = computed(() => /\.cbd\.int$/i.test(config.public.apiBase ?? ''))
  const availableEnvironments = computed(() => getEnvironments(isProduction.value))

  const realmConfigurations = ref<RealmConfig[]>([])
  const loading = ref(false)
  const selectedEnvKey = ref(
    (route.params.environment as string) ?? availableEnvironments.value[0]?.key ?? ''
  )

  const environmentRealms = computed(() =>
    realmConfigurations.value.filter((r) => r.environment === selectedEnvKey.value)
  )

  function onEnvironmentChange() {
    router.push(`/clearing-house/realms/${selectedEnvKey.value}`)
  }

  onMounted(async () => {
    loading.value = true
    try {
      realmConfigurations.value = await api.queryRealmConfigurations()
      if (route.params.environment) {
        selectedEnvKey.value = route.params.environment as string
      }
    } finally {
      loading.value = false
    }
  })
</script>
