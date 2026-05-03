<template>
  <div class="row row-cards">
    <!-- Search filters -->
    <div class="col-12">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Search</h3></div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Environment</label>
              <select
                v-model="search.environmentKey"
                class="form-select"
                @change="onEnvironmentChange"
              >
                <option value="">Select environment</option>
                <option v-for="env in availableEnvironments" :key="env.key" :value="env.key">
                  {{ env.title }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Clearing-House</label>
              <select
                v-model="search.realmId"
                class="form-select"
                :disabled="!search.environmentKey"
                @change="onRealmChange"
              >
                <option value="">Select Clearing-House</option>
                <option v-for="r in environmentRealms" :key="r.realm" :value="r.realm">
                  {{ r.displayName }} ({{ r.realm }})
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Schema</label>
              <select
                v-model="search.schemaKey"
                class="form-select"
                :disabled="!search.realmId"
                @change="onSchemaChange"
              >
                <option value="">Select schema</option>
                <option v-for="s in searchSchemas" :key="s.key" :value="s.key">
                  {{ s.displayTitle }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Country</label>
              <select v-model="search.government" class="form-select" :disabled="!search.realmId">
                <option value="">All countries</option>
                <option v-for="c in countries" :key="c.code" :value="c.code">
                  {{ c.name.en }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="card-footer d-flex gap-2">
          <button
            class="btn btn-sm"
            :class="search.recordType === 'drafts' ? 'btn-success' : 'btn-primary'"
            @click="loadDocuments('drafts')"
          >
            Show Drafts
          </button>
          <button
            class="btn btn-sm"
            :class="search.recordType === 'published' ? 'btn-success' : 'btn-primary'"
            @click="loadDocuments('published')"
          >
            Show Published
          </button>
          <button
            class="btn btn-sm"
            :class="search.recordType === 'requests' ? 'btn-success' : 'btn-primary'"
            @click="loadDocuments('requests')"
          >
            Show Requested
          </button>
          <button class="btn btn-sm btn-danger" @click="onReset">Clear</button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="error" class="col-12">
      <div class="alert alert-danger">{{ error }}</div>
    </div>

    <div v-if="result.documents.length || loading" class="col-12">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <strong>{{ search.recordType }}</strong> records
            <span v-if="selectedRealm">
              from <strong>{{ selectedRealm.displayName }}</strong></span
            >
            <span v-if="selectedSchema">
              for <strong>{{ lstring(selectedSchema.title) }}</strong></span
            >
          </h3>
          <div class="card-options">
            <strong class="text-secondary">
              Total: {{ result.count }}
              <span v-if="search.recordType === 'published' && result.indexCount !== undefined">
                | Index: {{ result.indexCount }}
                <button
                  v-if="result.count !== result.indexCount"
                  class="btn btn-sm btn-ghost-secondary ms-1"
                  @click="onShowDifference"
                >
                  Show Difference
                </button>
              </span>
            </strong>
          </div>
        </div>

        <div v-if="loading" class="card-body d-flex justify-content-center">
          <div class="spinner-border text-primary" />
        </div>

        <div v-else class="card-body p-0">
          <table class="table table-vcenter card-table">
            <thead>
              <tr>
                <th style="width: 40px">#</th>
                <th>Title</th>
                <th>Owner</th>
                <th>Government</th>
                <th>Created by</th>
                <th>Updated by</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(doc, i) in result.documents" :key="doc.identifier">
                <td class="text-secondary">
                  {{ (result.pageNumber - 1) * result.recordsPerPage + i + 1 }}
                </td>
                <td>
                  <a :href="appDocumentUrl(doc)" target="_blank" rel="noopener" class="fw-bold">
                    {{ lstring(doc.title) }} <IconExternalLink :size="12" />
                  </a>
                  <div class="text-secondary small" v-html="lstring(doc.summary ?? {})" />
                </td>
                <td>{{ ownerName(doc.owner) }}</td>
                <td>{{ countryName(doc.metadata.government) }}</td>
                <td>
                  <a
                    v-if="doc.createdBy"
                    :href="`https://accounts.cbd.int/admin/users/${doc.createdBy.userID}`"
                    target="_blank"
                  >
                    {{ doc.createdBy.firstName }} {{ doc.createdBy.lastName }}
                  </a>
                  <div class="text-secondary small">{{ formatDate(doc.createdOn) }}</div>
                </td>
                <td>
                  <a
                    v-if="doc.updatedBy"
                    :href="`https://accounts.cbd.int/admin/users/${doc.updatedBy.userID}`"
                    target="_blank"
                  >
                    {{ doc.updatedBy.firstName }} {{ doc.updatedBy.lastName }}
                  </a>
                  <div class="text-secondary small">{{ formatDate(doc.updatedOn) }}</div>
                </td>
                <td>
                  <NuxtLink
                    :to="`/clearing-house/records/history/${doc.identifier}`"
                    class="btn btn-sm btn-ghost-secondary"
                    >History</NuxtLink
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="result.count > result.recordsPerPage"
          class="card-footer d-flex align-items-center"
        >
          <p class="m-0 text-secondary">
            Showing {{ (result.pageNumber - 1) * result.recordsPerPage + 1 }}–{{
              Math.min(result.pageNumber * result.recordsPerPage, result.count)
            }}
            of {{ result.count }}
          </p>
          <ul class="pagination m-0 ms-auto">
            <li class="page-item" :class="{ disabled: result.pageNumber <= 1 }">
              <button class="page-link" @click="onChangePage(result.pageNumber - 1)">prev</button>
            </li>
            <li class="page-item active">
              <span class="page-link">{{ result.pageNumber }}</span>
            </li>
            <li
              class="page-item"
              :class="{ disabled: result.pageNumber * result.recordsPerPage >= result.count }"
            >
              <button class="page-link" @click="onChangePage(result.pageNumber + 1)">next</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IconExternalLink } from '@tabler/icons-vue'
  import { getEnvironments } from '~/data/environments'
  import { lstring, formatDate, isRealm } from '~/composables/useUtils'
  import { clearingHouseApi as api } from '~/api'
  import type { RealmConfig, Country, KMDocument } from '~/api'

  definePageMeta({
    title: 'Records',
    breadcrumbs: [
      { label: 'Clearing-House', path: '/clearing-house' },
      { label: 'Records', path: '/clearing-house/records' }
    ]
  })

  const route = useRoute()
  const router = useRouter()
  const config = useRuntimeConfig()

  const isProduction = /\.cbd\.int$/i.test(config.public.apiBase ?? '')
  const availableEnvironments = getEnvironments(isProduction)

  const realms = ref<RealmConfig[]>([])
  const countries = ref<Country[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const search = reactive({
    environmentKey: (route.params.environment as string) ?? availableEnvironments[0]?.key ?? '',
    realmId: (route.params.realm as string)?.toUpperCase() ?? '',
    schemaKey: (route.params.schema as string) ?? '',
    government: (route.params.government as string) ?? '',
    recordType: 'published'
  })

  const result = reactive({
    documents: [] as KMDocument[],
    count: 0,
    indexCount: undefined as number | undefined,
    pageNumber: 1,
    recordsPerPage: 25
  })

  interface SchemaOption {
    key: string
    displayTitle: string
    title: { en: string }
    titlePlural?: { en: string }
    type: string
    shortCode?: string
  }

  const searchSchemas = ref<SchemaOption[]>([])

  const environmentRealms = computed(() =>
    realms.value.filter((r) => r.environment === search.environmentKey)
  )

  const selectedRealm = computed(() => realms.value.find((r) => r.realm === search.realmId))
  const selectedSchema = computed(() => searchSchemas.value.find((s) => s.key === search.schemaKey))

  function buildSchemas(realm: RealmConfig): SchemaOption[] {
    return Object.entries(realm.schemas ?? {}).map(([key, schema]) => {
      const base = lstring(schema.titlePlural ?? schema.title)
      return { key, ...schema, displayTitle: `${base} (${schema.shortCode ?? ''})` }
    })
  }

  function onEnvironmentChange() {
    search.realmId = ''
    search.schemaKey = ''
    searchSchemas.value = []
    router.push(`/clearing-house/records/${search.environmentKey}`)
  }

  function onRealmChange() {
    search.schemaKey = ''
    const realm = selectedRealm.value
    if (realm) searchSchemas.value = buildSchemas(realm)
    router.push(`/clearing-house/records/${search.environmentKey}/${search.realmId}`)
  }

  function onSchemaChange() {
    router.push(
      `/clearing-house/records/${search.environmentKey}/${search.realmId}/${search.schemaKey}`
    )
  }

  function appDocumentUrl(doc: KMDocument): string {
    const realm = selectedRealm.value
    if (!realm) return '#'
    if (isRealm('ABS', realm.realm) || isRealm('BCH', realm.realm)) {
      const shortCode = realm.schemas[doc.type]?.shortCode
      if (search.recordType === 'drafts')
        return `${realm.baseURL}/register/${shortCode}/${doc.identifier}/edit`
      return `${realm.baseURL}/register/${shortCode}/${doc.identifier}/view`
    }
    return `${realm.baseURL}/database/${doc.identifier}`
  }

  function ownerName(owner?: string): string {
    if (!owner) return ''
    if (owner.toUpperCase() === 'SCBD' || !owner.includes(':')) return owner
    const [type, code] = owner.split(':')
    if (type === 'country') return countryName(code)
    return code
  }

  function countryName(code?: string): string {
    if (!code) return ''
    return countries.value.find((c) => c.code === code.toUpperCase())?.name.en ?? code
  }

  async function loadDocuments(type: string, skip = 0, top = 25) {
    if (!selectedRealm.value) {
      error.value = 'Please select a Clearing-House'
      return
    }
    if (!selectedSchema.value) {
      error.value = 'Please select a Schema'
      return
    }

    error.value = null
    search.recordType = type
    loading.value = true
    result.documents = []

    try {
      const query: Record<string, unknown> = {
        $filter: `(type eq '${search.schemaKey}') and (realm eq '${search.realmId}')`,
        $orderby: 'updatedOn desc',
        $skip: skip,
        $top: top
      }

      if (search.government)
        query.$filter += ` and (owner eq 'country:${search.government.toLowerCase()}')`
      if (type === 'drafts') query.collection = 'alldraft'
      else if (type === 'requests') query.collection = 'allrequest'
      else query.collection = 'all'

      const res = await api.queryDocuments(query, { realm: search.realmId })
      result.documents = res.Items
      result.count = res.Count

      if (type === 'published') {
        let q = `realm_ss:${search.realmId.toLowerCase()}`
        if (search.government) q += ` AND government_s:${search.government.toLowerCase()}`
        if (search.schemaKey) q += ` AND schema_s:${search.schemaKey}`
        const solr = await api.querySolr({ query: q, rowsPerPage: 0 }).catch(() => null)
        result.indexCount = solr?.response.numFound
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error loading records'
    } finally {
      loading.value = false
    }
  }

  function onChangePage(page: number) {
    result.pageNumber = page
    loadDocuments(search.recordType, result.recordsPerPage * (page - 1), result.recordsPerPage)
  }

  function onReset() {
    search.realmId = ''
    search.schemaKey = ''
    search.government = ''
    searchSchemas.value = []
    result.documents = []
    result.count = 0
    result.indexCount = undefined
    result.pageNumber = 1
    error.value = null
  }

  async function onShowDifference() {
    // Delegates to record-list difference logic — placeholder for future implementation
    alert('Difference view not yet implemented in this phase')
  }

  onMounted(async () => {
    const [realmConfigs, countryList] = await Promise.all([
      api.getRealmConfigurations(),
      api.getCountries()
    ])

    realms.value = realmConfigs
    countries.value = countryList.sort((a, b) => a.name.en.localeCompare(b.name.en))

    if (search.realmId) {
      const realm = realms.value.find((r) => r.realm === search.realmId.toUpperCase())
      if (realm) searchSchemas.value = buildSchemas(realm)
    }

    if (search.realmId && search.schemaKey) {
      loadDocuments('published')
    }
  })
</script>
