<template>
  <div class="row row-cards">
    <div class="col-12">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="loading" class="d-flex justify-content-center p-4">
        <div class="spinner-border text-primary" />
      </div>

      <template v-else-if="details">
        <!-- Header -->
        <div class="card mb-3">
          <div class="card-header">
            <h3 class="card-title">
              {{ details.realm }} Details
              <RolesStatus :admin-roles="details.roles.administrator" class="ms-2" />
            </h3>
          </div>
        </div>

        <!-- Hosts info -->
        <div class="card mb-3">
          <div class="card-header"><strong>Hosts info</strong></div>
          <div class="card-body p-0">
            <table class="table table-vcenter card-table mb-0">
              <thead>
                <tr>
                  <th>Protocol</th>
                  <th>UID prefix</th>
                  <th>Display name</th>
                  <th>Hosts</th>
                  <th>Email</th>
                  <th>Base URL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ details.protocol }}</td>
                  <td>{{ details.uIdPrefix }}</td>
                  <td>{{ details.displayName }}</td>
                  <td>
                    <div v-for="h in details.hosts" :key="h">{{ h }}</div>
                  </td>
                  <td>{{ details.email }}</td>
                  <td>{{ details.baseURL }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Roles -->
        <div class="card mb-3">
          <div class="card-header"><strong>Roles</strong></div>
          <div class="card-body p-0">
            <table class="table table-vcenter card-table mb-0">
              <thead>
                <tr>
                  <th>Roles</th>
                  <th>Admin roles</th>
                  <th>NFP roles</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div v-for="(roles, roleName) in details.roles" :key="roleName" class="mb-2">
                      <strong>{{ camelCaseToWords(roleName) }}:</strong>
                      <ul class="mb-0">
                        <li v-for="role in roles" :key="role">
                          <a
                            :href="`https://accounts.cbd.int/admin/users?role=${getRoleId(role)}`"
                            target="_blank"
                          >
                            {{ getRoleName(role) }} ({{ role }})
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                  <td>
                    <div v-for="role in details.adminRoles" :key="role">
                      <a
                        :href="`https://accounts.cbd.int/admin/users?role=${getRoleId(role)}`"
                        target="_blank"
                      >
                        {{ getRoleName(role) }} ({{ role }})
                      </a>
                    </div>
                  </td>
                  <td>
                    <div v-for="role in details.nfpRoles" :key="role">
                      <a
                        :href="`https://accounts.cbd.int/admin/users?role=${getRoleId(role)}`"
                        target="_blank"
                      >
                        {{ getRoleName(role) }} ({{ role }})
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Schemas -->
        <div class="card mb-3">
          <div class="card-header"><strong>Schemas</strong></div>
          <div class="card-body p-0">
            <table class="table table-vcenter card-table mb-0">
              <thead>
                <tr>
                  <th>Schema</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Short Code</th>
                  <th>Disable new</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(schema, key) in details.schemas" :key="key">
                  <td>
                    <NuxtLink
                      :to="`/clearing-house/records/${environment}/${details.realm}/${key}`"
                      >{{ key }}</NuxtLink
                    >
                  </td>
                  <td>
                    {{ lstring(schema.title) }}
                    <div v-if="schema.titlePlural">
                      <small><strong>Plural:</strong> {{ lstring(schema.titlePlural) }}</small>
                    </div>
                  </td>
                  <td>{{ schema.type }}</td>
                  <td>{{ schema.shortCode }}</td>
                  <td>{{ schema.disableAdd }}</td>
                  <td>
                    <div v-if="schema.publishingAuthorities?.length">
                      <strong>Publishing Authorities:</strong>
                      <ul class="mb-1">
                        <li v-for="role in schema.publishingAuthorities" :key="role">
                          <a
                            :href="`https://accounts.cbd.int/admin/users?role=${getRoleId(role)}`"
                            target="_blank"
                          >
                            {{ getRoleName(role) }} ({{ role }})
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div v-if="schema.nationalAuthorizedUser?.length">
                      <strong>NAU:</strong>
                      <ul class="mb-0">
                        <li v-for="role in schema.nationalAuthorizedUser" :key="role">
                          <a
                            :href="`https://accounts.cbd.int/admin/users?role=${getRoleId(role)}`"
                            target="_blank"
                          >
                            {{ getRoleName(role) }} ({{ role }})
                          </a>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PDF -->
        <div v-if="details.pdf" class="card mb-3">
          <div class="card-header"><strong>PDF</strong></div>
          <div class="card-body p-0">
            <table class="table table-vcenter card-table mb-0">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>File name</th>
                  <th>Path</th>
                  <th>S3</th>
                  <th>Use PrincePDF</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pdf, key) in details.pdf" :key="key">
                  <td>{{ key }}</td>
                  <td>{{ pdf.fileName }}</td>
                  <td>{{ pdf.path }}</td>
                  <td>{{ pdf.s3 ? `${pdf.s3.bucket}/${pdf.s3.folder}` : '' }}</td>
                  <td>{{ pdf.usePrincePdf }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- External notification -->
        <div v-if="details.externalNotification" class="card mb-3">
          <div class="card-header"><strong>External notification</strong></div>
          <div class="card-body p-0">
            <table class="table table-vcenter card-table mb-0">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(emails, org) in details.externalNotification" :key="org">
                  <td>{{ org }}</td>
                  <td>{{ emails.join(', ') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Notification/Env message -->
        <div class="card mb-3">
          <div class="card-header"><strong>Notification / Env message</strong></div>
          <div class="card-body p-0">
            <table class="table table-vcenter card-table mb-0">
              <thead>
                <tr>
                  <th>Notification template folder</th>
                  <th>Env message</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ details.notificationTemplateFolder }}</td>
                  <td>{{ details.envMsg }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Raw JSON -->
        <div class="card mb-3">
          <div class="card-header">
            <button class="btn btn-sm btn-primary" @click="showJson = !showJson">
              {{ showJson ? 'Hide JSON' : 'Show JSON' }}
            </button>
          </div>
          <div v-if="showJson" class="card-body">
            <pre class="text-wrap">{{ JSON.stringify(details, null, 2) }}</pre>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { lstring, camelCaseToWords } from '~/composables/useUtils'
  import { clearingHouseApi as api } from '~/api'
  import type { RealmConfig, UserRole } from '~/api'

  const route = useRoute()
  const environment = route.params.environment as string
  const realmParam = route.params.realm as string

  definePageMeta({
    title: 'Realm Details',
    breadcrumbs: [
      { label: 'Clearing-House', path: '/clearing-house' },
      { label: 'Realm Details', path: '' }
    ]
  })

  const details = ref<RealmConfig | null>(null)
  const userRoles = ref<UserRole[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const showJson = ref(false)

  const roleCodes = computed(() => {
    if (!details.value) return []
    return [
      ...(details.value.adminRoles ?? []),
      ...(details.value.nfpRoles ?? []),
      ...Object.values(details.value.roles ?? {})
        .flat()
        .filter((r): r is string => !!r)
    ]
  })

  function getRoleName(code: string): string {
    return userRoles.value.find((r) => r.code === code)?.name ?? code
  }

  function getRoleId(code: string): string {
    return userRoles.value.find((r) => r.code === code)?.roleId ?? code
  }

  onMounted(async () => {
    loading.value = true
    try {
      details.value = (await api.getRealmConfigurationByHost(realmParam)) ?? null
      if (roleCodes.value.length) {
        userRoles.value = await api.getUserRoles([...new Set(roleCodes.value)])
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load realm'
    } finally {
      loading.value = false
    }
  })
</script>
