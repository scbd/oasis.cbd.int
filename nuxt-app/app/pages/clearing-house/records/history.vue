<template>
  <div class="row row-cards">
    <!-- Search -->
    <div class="col-12">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Record History</h3></div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Clearing-House ID</label>
              <input
                v-model="identifier"
                type="text"
                class="form-control"
                placeholder="e.g. CHM-AA-123456"
                @keyup.enter="showHistory"
              />
            </div>
          </div>
        </div>
        <div class="card-footer d-flex gap-2">
          <button class="btn btn-primary btn-sm" @click="showHistory">Show History</button>
          <button class="btn btn-danger btn-sm" @click="onReset">Clear</button>
        </div>
      </div>
    </div>

    <div v-if="error" class="col-12">
      <div class="alert alert-danger">{{ String(error) }}</div>
    </div>

    <div v-if="loading" class="col-12 d-flex justify-content-center py-4">
      <div class="spinner-border text-primary" />
    </div>

    <!-- Published record -->
    <div v-if="hasSearched" class="col-12">
      <div class="card">
        <div class="card-header"><strong>Published Record</strong></div>
        <div class="card-body p-0">
          <table class="table table-vcenter card-table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Realm</th>
                <th>Title</th>
                <th>Owner</th>
                <th>Government</th>
                <th>Created by</th>
                <th>Submitted by</th>
                <th>Updated by</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-if="!document && !loading">
                <td colspan="9" class="text-secondary text-center">
                  No published document found for {{ identifier }}
                </td>
              </tr>
              <template v-if="document">
                <tr>
                  <td>#</td>
                  <td>{{ document.realm }}</td>
                  <td>
                    <a
                      :href="appDocumentUrl(document, 'published')"
                      target="_blank"
                      class="fw-bold"
                    >
                      {{ lstring(document.title) }} <IconExternalLink :size="12" />
                    </a>
                    <div class="text-secondary small" v-html="lstring(document.summary ?? {})" />
                  </td>
                  <td>{{ countryName(document.owner?.replace('country:', '')) }}</td>
                  <td>{{ countryName(document.metadata.government) }}</td>
                  <td><PersonDate :person="document.createdBy" :date="document.createdOn" /></td>
                  <td>
                    <PersonDate :person="document.submittedBy" :date="document.submittedOn" />
                  </td>
                  <td><PersonDate :person="document.updatedBy" :date="document.updatedOn" /></td>
                  <td>
                    <button
                      class="btn btn-sm btn-ghost-primary"
                      @click="document.showJson = !document.showJson"
                    >
                      JSON
                    </button>
                  </td>
                </tr>
                <tr v-if="document.showJson">
                  <td colspan="9">
                    <pre class="text-wrap small">{{ JSON.stringify(document, null, 2) }}</pre>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Index record -->
    <div v-if="hasSearched" class="col-12">
      <div class="card">
        <div class="card-header d-flex align-items-center gap-2">
          <strong>Index Record</strong>
          <span v-if="documentIndex" class="text-secondary small"
            >(Indexed on: {{ formatDate(indexedOn) }})</span
          >
          <button
            v-if="document?.identifier"
            class="btn btn-sm btn-danger ms-auto"
            @click="reindexRecord"
          >
            Request Re-indexing
          </button>
        </div>
        <div class="card-body p-0">
          <table class="table table-vcenter card-table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Realm</th>
                <th>Title</th>
                <th>Owner</th>
                <th>Government</th>
                <th>Created</th>
                <th>Submitted</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-if="!documentIndex && !loading">
                <td colspan="9" class="text-secondary text-center">
                  No indexed document found for {{ identifier }}
                </td>
              </tr>
              <tr v-if="idx">
                <td>#</td>
                <td>{{ idx.realm }}</td>
                <td>
                  <strong>{{ (idx.uniqueIdentifier_s ?? '').toUpperCase() }}</strong>
                  {{ idx.title }}
                </td>
                <td>{{ countryName(idx.owner?.replace('country:', '')) }}</td>
                <td>{{ countryName(idx.government) }}</td>
                <td>{{ formatDate(idx.createdOn) }}</td>
                <td>{{ formatDate(idx.submittedOn) }}</td>
                <td>{{ formatDate(idx.updatedOn) }}</td>
                <td>
                  <a
                    :href="`${apiHost}/api/v2013/index/select?q=identifier_s:${idx.identifier}`"
                    target="_blank"
                    class="btn btn-sm btn-ghost-primary"
                    >JSON</a
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Draft record -->
    <div v-if="hasSearched" class="col-12">
      <div class="card">
        <div class="card-header"><strong>Draft Record</strong></div>
        <div class="card-body p-0">
          <table class="table table-vcenter card-table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Realm</th>
                <th>Title</th>
                <th>Owner</th>
                <th>Government</th>
                <th>Created by</th>
                <th>Submitted by</th>
                <th>Updated by</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-if="!documentDraft && !loading">
                <td colspan="9" class="text-secondary text-center">
                  No draft found for {{ identifier }}
                </td>
              </tr>
              <template v-if="documentDraft">
                <tr>
                  <td>#</td>
                  <td>{{ documentDraft.realm }}</td>
                  <td>
                    <a
                      :href="appDocumentUrl(documentDraft, 'draft')"
                      target="_blank"
                      class="fw-bold"
                    >
                      {{ lstring(documentDraft.title) }} <IconExternalLink :size="12" />
                    </a>
                  </td>
                  <td>{{ countryName(documentDraft.owner?.replace('country:', '')) }}</td>
                  <td>{{ countryName(documentDraft.metadata.government) }}</td>
                  <td>
                    <PersonDate :person="documentDraft.createdBy" :date="documentDraft.createdOn" />
                  </td>
                  <td>
                    <PersonDate
                      :person="documentDraft.submittedBy"
                      :date="documentDraft.submittedOn"
                    />
                  </td>
                  <td>
                    <PersonDate :person="documentDraft.updatedBy" :date="documentDraft.updatedOn" />
                  </td>
                  <td class="d-flex gap-1 flex-wrap">
                    <button
                      class="btn btn-sm btn-ghost-primary"
                      @click="documentDraft.showJson = !documentDraft.showJson"
                    >
                      JSON
                    </button>
                    <button
                      class="btn btn-sm btn-danger"
                      :disabled="
                        !documentDraft.workingDocumentLock?.lockID ||
                        !!documentDraft.failureProcessed
                      "
                      @click="restartWorkflow(documentDraft)"
                    >
                      Restart workflow
                    </button>
                    <button
                      class="btn btn-sm btn-danger"
                      :disabled="
                        !documentDraft.workingDocumentLock?.lockID ||
                        !!documentDraft.failureProcessed
                      "
                      @click="releaseWorkflow(documentDraft)"
                    >
                      Release workflow
                    </button>
                  </td>
                </tr>
                <tr v-if="documentDraft.failureProcessed">
                  <td />
                  <td colspan="8">
                    <div class="alert alert-success mb-0">Workflow processed!</div>
                  </td>
                </tr>
                <tr v-if="documentDraft.validationErrors?.length">
                  <td />
                  <td colspan="8">
                    <table class="table table-sm table-danger mb-0">
                      <tr>
                        <td colspan="2" class="fw-bold">
                          The draft has validation errors — modify the record on the owner
                          clearing-house
                        </td>
                      </tr>
                      <tr v-for="e in documentDraft.validationErrors" :key="e.code">
                        <td>{{ e.code }}</td>
                        <td>{{ e.property }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr v-if="documentDraft.showJson">
                  <td colspan="9">
                    <pre class="text-wrap small">{{ JSON.stringify(documentDraft, null, 2) }}</pre>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Revisions -->
    <div v-if="hasSearched" class="col-12">
      <div class="card">
        <div class="card-header">
          <strong>Document Revisions</strong>
          <span v-if="documentRevisions" class="ms-1 text-secondary"
            >({{ documentRevisions.Count }})</span
          >
        </div>
        <div class="card-body p-0">
          <table class="table table-vcenter card-table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Realm</th>
                <th>Title</th>
                <th>Owner</th>
                <th>Government</th>
                <th>Created</th>
                <th>Submitted</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-if="!documentRevisions?.Count && !loading">
                <td colspan="9" class="text-secondary text-center">
                  No revisions found for {{ identifier }}
                </td>
              </tr>
              <template v-for="rev in documentRevisions?.Items ?? []" :key="rev.revision">
                <tr :class="{ 'table-danger': rev.deletedBy }">
                  <td>{{ rev.revision }}</td>
                  <td>{{ rev.realm }}</td>
                  <td>
                    <a :href="appDocumentUrl(rev, 'draft')" target="_blank" class="fw-bold">
                      {{ lstring(rev.title) }} <IconExternalLink :size="12" />
                    </a>
                  </td>
                  <td>{{ countryName(rev.owner?.replace('country:', '')) }}</td>
                  <td>{{ countryName(rev.metadata.government) }}</td>
                  <td><PersonDate :person="rev.createdBy" :date="rev.createdOn" /></td>
                  <td><PersonDate :person="rev.submittedBy" :date="rev.submittedOn" /></td>
                  <td><PersonDate :person="rev.updatedBy" :date="rev.updatedOn" /></td>
                  <td>
                    <button
                      class="btn btn-sm btn-ghost-primary"
                      @click="rev.showJson = !rev.showJson"
                    >
                      JSON
                    </button>
                  </td>
                </tr>
                <tr v-if="rev.showJson" :class="{ 'table-danger': rev.deletedBy }">
                  <td colspan="9">
                    <pre class="text-wrap small">{{ JSON.stringify(rev, null, 2) }}</pre>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IconExternalLink } from '@tabler/icons-vue'
  import { lstring, formatDate, isRealm, sleep } from '~/composables/useUtils'
  import { clearingHouseApi as api } from '~/api'
  import type { KMDocument, Country, RealmConfig } from '~/api'

  definePageMeta({
    title: 'Record History',
    breadcrumbs: [
      { label: 'Clearing-House', path: '/clearing-house' },
      { label: 'Record History', path: '/clearing-house/records/history' }
    ]
  })

  // Inline PersonDate helper component
  const PersonDate = defineComponent({
    props: {
      person: {
        type: Object as () => { firstName?: string; lastName?: string } | undefined,
        default: undefined
      },
      date: { type: String, default: undefined }
    },
    setup(props) {
      return () =>
        h('div', [
          props.person
            ? h('span', `${props.person.firstName ?? ''} ${props.person.lastName ?? ''}`.trim())
            : null,
          props.date ? h('div', { class: 'text-secondary small' }, formatDate(props.date)) : null
        ])
    }
  })

  const route = useRoute()
  const router = useRouter()
  const config = useRuntimeConfig()

  const apiHost = config.public.apiBase ?? ''

  const identifier = ref((route.params.identifier as string) ?? '')
  const realms = ref<RealmConfig[]>([])
  const countries = ref<Country[]>([])
  const document = ref<KMDocument | null>(null)
  const documentDraft = ref<KMDocument | null>(null)
  const documentRevisions = ref<{ Items: KMDocument[]; Count: number } | null>(null)
  const documentIndex = ref<Record<string, unknown> | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)
  const hasSearched = ref(false)

  const idx = computed(
    () =>
      documentIndex.value as {
        realm?: string
        uniqueIdentifier_s?: string
        title?: string
        owner?: string
        government?: string
        createdOn?: string
        submittedOn?: string
        updatedOn?: string
        indexedOn?: string
        identifier?: string
      } | null
  )
  const indexedOn = computed(() => idx.value?.indexedOn)

  function countryName(code?: string): string {
    if (!code) return ''
    return countries.value.find((c) => c.code === code.toUpperCase())?.name.en ?? code
  }

  function appDocumentUrl(doc: KMDocument, recordType: string): string {
    const realm = realms.value.find((r) => {
      const dr = doc.realm
      return Array.isArray(dr) ? dr.includes(r.realm.toUpperCase()) : r.realm === dr?.toUpperCase()
    })
    if (!realm) return '#'
    if (isRealm('ABS', realm.realm) || isRealm('BCH', realm.realm)) {
      const shortCode = realm.schemas[doc.type]?.shortCode
      if (recordType === 'draft')
        return `${realm.baseURL}/register/${shortCode}/${doc.identifier}/edit`
      return `${realm.baseURL}/register/${shortCode}/${doc.identifier}/view`
    }
    return `${realm.baseURL}/database/${doc.identifier}`
  }

  async function showHistory() {
    if (!identifier.value) return

    router.push(`/clearing-house/records/history/${identifier.value}`)
    hasSearched.value = false
    document.value = null
    documentDraft.value = null
    documentRevisions.value = null
    documentIndex.value = null
    error.value = null
    loading.value = true

    try {
      const uidRegex = /^(?:[a-z]+(?:-dev|trg)?)-(?:[a-z]+)-(?:[a-z]+)-([0-9]+)(?:-[0-9]+)?$/i
      const match = identifier.value.match(uidRegex)
      let idToSearch: string | number = identifier.value
      const solrQuery = {
        query: `identifier_s:${identifier.value}`,
        fields:
          'realm:realm_ss,identifier:identifier_s,type:schema_s,title:title_EN_t,summary:summary_EN_t,createdOn:createdDate_dt,updatedOn:updatedDate_dt,owner:_ownership_s,uniqueIdentifier_s,submittedOn:submittedDate_dt,createdBy:createdBy_s,updatedBy:updatedBy_s,submittedBy:submittedBy_s,government:government_EN_s,indexedOn:indexedDate_dt',
        rowsPerPage: 1
      }
      const mongoQuery: Record<string, unknown> = { $or: [{ 'data.identifier': identifier.value }] }

      if (match && Number.isInteger(Number(match[1]))) {
        idToSearch = Number(match[1])
        solrQuery.query = `_documentId_i:${idToSearch}`
        mongoQuery.$or = [{ 'data.documentID': idToSearch }]
      }

      const [doc, revisions, , solr] = await Promise.all([
        api.getDocument(idToSearch),
        api.getDocumentRevisions(idToSearch),
        api.getWorkflowHistory({ q: mongoQuery }),
        api.querySolr(solrQuery).catch(() => null)
      ])

      document.value = doc ?? null
      documentRevisions.value = revisions ?? null
      // workflows stored on the document for display — simplified here
      documentIndex.value = (solr?.response.docs[0] as Record<string, unknown>) ?? null

      if (doc?.identifier) {
        documentDraft.value = (await api.getDocumentDraft(doc.identifier)) ?? null
      }
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
      hasSearched.value = true
    }
  }

  async function reindexRecord() {
    if (!document.value) return
    if (!confirm('Are you sure you want to re-index this record?')) return
    try {
      loading.value = true
      const res = await api.reIndexDocument(
        document.value.type,
        document.value.identifier,
        document.value.realm
      )
      if ((res as unknown as { status: number }).status === 200) {
        await sleep(5000)
        alert('Re-indexing successful!')
        showHistory()
      }
    } catch (e) {
      alert('Re-indexing failed: ' + String(e))
    } finally {
      loading.value = false
    }
  }

  async function restartWorkflow(doc: KMDocument) {
    if (!doc.workingDocumentLock) return
    if (!confirm('Are you sure you want to restart the workflow?')) return
    try {
      loading.value = true
      const lockId = doc.workingDocumentLock.lockID.replace('workflow-', '')
      const result = await api.startNewWorkflow(lockId, doc.realm)
      const r = result as { errors?: unknown[] }
      if (r.errors) doc.validationErrors = r.errors as { code: string; property: string }[]
      else
        doc.failureProcessed = result as {
          processedOn?: string
          processedBy?: string
          action?: string
        }
      alert('Workflow restarted!')
      showHistory()
    } finally {
      loading.value = false
    }
  }

  async function releaseWorkflow(doc: KMDocument) {
    if (!doc.workingDocumentLock) return
    if (!confirm('Are you sure you want to release the lock?')) return
    try {
      loading.value = true
      const lockId = doc.workingDocumentLock.lockID.replace('workflow-', '')
      await api.releaseWorkflow(lockId, doc.realm)
      alert('Workflow released!')
      showHistory()
    } finally {
      loading.value = false
    }
  }

  function onReset() {
    identifier.value = ''
    document.value = null
    documentDraft.value = null
    documentRevisions.value = null
    documentIndex.value = null
    hasSearched.value = false
    error.value = null
    router.push('/clearing-house/records/history')
  }

  onMounted(async () => {
    const [realmConfigs, countryList] = await Promise.all([
      api.getRealmConfigurations(),
      api.getCountries()
    ])
    realms.value = realmConfigs
    countries.value = countryList

    if (route.params.identifier) {
      identifier.value = route.params.identifier as string
      showHistory()
    }
  })
</script>
