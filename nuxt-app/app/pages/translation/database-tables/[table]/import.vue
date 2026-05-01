<template>
  <div class="row row-cards">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Import translations: {{ table }}</h3>
        </div>

        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label required">Language of file(s)</label>
              <select v-model="selectedLanguage" class="form-select">
                <option value="">Select language</option>
                <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                  {{ lang.title }} ({{ lang.code }})
                </option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label required">Files</label>
              <div
                class="upload-drop-zone"
                :class="{ dragging: isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="onDrop"
              >
                <IconUpload class="mb-2" :size="32" />
                <p class="mb-1">
                  Drop files here or
                  <label class="text-primary cursor-pointer" for="import-file-input">browse</label>
                </p>
                <small class="text-secondary">Accepted: .zip, .json</small>
                <input
                  id="import-file-input"
                  type="file"
                  class="d-none"
                  multiple
                  accept=".zip,.json,application/zip,application/json"
                  @change="onFileChange"
                />
              </div>

              <div v-if="queue.length" class="mt-2">
                <div
                  v-for="item in queue"
                  :key="item.name"
                  class="d-flex align-items-center gap-2 py-1"
                >
                  <IconFile :size="16" class="text-secondary" />
                  <span class="flex-fill text-truncate small">{{ item.name }}</span>
                  <span
                    v-if="item.status === 'uploading'"
                    class="spinner-border spinner-border-sm"
                  />
                  <IconCheck v-else-if="item.status === 'done'" :size="16" class="text-success" />
                  <IconX v-else-if="item.status === 'error'" :size="16" class="text-danger" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer d-flex gap-2">
          <button class="btn btn-primary" :disabled="loading" @click="onUploadAll">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1" />
            Upload All
          </button>
          <button class="btn btn-danger" :disabled="loading" @click="onReset">Clear</button>
        </div>
      </div>
    </div>

    <!-- File status results -->
    <div v-if="fileStatuses.length" class="col-12">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">File Status</h3>
        </div>
        <div class="card-body p-0">
          <table class="table table-vcenter card-table">
            <thead>
              <tr>
                <th style="width: 40px">#</th>
                <th>File</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(fs, i) in fileStatuses" :key="i">
                <tr>
                  <td class="text-secondary">{{ i + 1 }}</td>
                  <td>{{ fs.fileName }}</td>
                  <td>
                    <span v-if="!fs.isFolder && fs.files?.length">
                      {{ fs.files[0].message ?? 'Success' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="fs.isFolder && fs.files?.length">
                  <td />
                  <td colspan="2">
                    <table class="table table-sm table-bordered mb-0">
                      <tbody>
                        <tr v-for="(sub, j) in fs.files" :key="j">
                          <td style="width: 40px">{{ j + 1 }}</td>
                          <td>
                            <a
                              v-if="sub.id"
                              :href="`${table.toLowerCase()}/${sub.id}`"
                              target="_blank"
                              >{{ sub.fileName }}</a
                            >
                            <span v-else>{{ sub.fileName }}</span>
                          </td>
                          <td>{{ sub.message ?? 'Success' }}</td>
                        </tr>
                      </tbody>
                    </table>
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
  import { IconUpload, IconFile, IconCheck, IconX } from '@tabler/icons-vue'
  import { languages } from '~/data/languages'
  import type { FileStatus } from '~/types/translation'

  const route = useRoute()
  const auth = useAuthStore()
  const table = route.params.table as string

  definePageMeta({
    title: 'Import Translations',
    breadcrumbs: [
      { label: 'Translation', path: '/translation' },
      { label: 'Database Tables', path: '/translation/database-tables' },
      { label: 'Import', path: '' }
    ]
  })

  interface QueueItem {
    name: string
    file: File
    status: 'pending' | 'uploading' | 'done' | 'error'
  }

  const selectedLanguage = ref('')
  const isDragging = ref(false)
  const loading = ref(false)
  const queue = ref<QueueItem[]>([])
  const fileStatuses = ref<FileStatus[]>([])

  function addFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      const ok = file.name.endsWith('.zip') || file.name.endsWith('.json')
      if (ok) queue.value.push({ name: file.name, file, status: 'pending' })
    }
  }

  function onFileChange(e: Event) {
    const files = (e.target as HTMLInputElement).files
    if (files) addFiles(files)
  }

  function onDrop(e: DragEvent) {
    isDragging.value = false
    if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
  }

  async function uploadFile(item: QueueItem) {
    item.status = 'uploading'
    const token = await auth.fetchToken()

    const format =
      item.file.type === 'application/zip' || item.name.endsWith('.zip') ? 'zip' : 'json'
    let url = `/translation-api/database-table/${encodeURIComponent(table)}/import/${format}`
    if (selectedLanguage.value) url += `/${encodeURIComponent(selectedLanguage.value)}`

    const body = new FormData()
    body.append('file', item.file)

    try {
      const result = await $fetch<
        Array<{
          fileName: string
          success?: Array<{ id?: string; fileName: string; message?: string }>
          errors?: Array<{ error: string }>
        }>
      >(url, {
        method: 'POST',
        headers: token ? { Authorization: `Ticket ${token.token}` } : {},
        body
      })

      for (const file of result ?? []) {
        if (file.success) {
          const isFolder = item.name.includes('/')
          fileStatuses.value.push({
            fileName: file.fileName ?? item.name,
            fileType: format,
            isFolder,
            files: file.success
          })
        }
      }

      item.status = 'done'
    } catch {
      item.status = 'error'
    }
  }

  async function onUploadAll() {
    if (!selectedLanguage.value) {
      alert('Select a translation language first')
      return
    }
    const pending = queue.value.filter((i) => i.status === 'pending')
    if (!pending.length) {
      alert('Add at least one file to process')
      return
    }

    loading.value = true
    for (const item of pending) {
      await uploadFile(item)
    }
    loading.value = false
  }

  function onReset() {
    queue.value = []
    fileStatuses.value = []
    selectedLanguage.value = ''
    loading.value = false
  }
</script>

<style scoped>
  .upload-drop-zone {
    border: 2px dashed var(--tblr-border-color);
    border-radius: var(--tblr-border-radius);
    padding: 2rem;
    text-align: center;
    transition: border-color 0.15s;
    cursor: pointer;
  }

  .upload-drop-zone.dragging {
    border-color: var(--tblr-primary);
    background-color: var(--tblr-primary-lt);
  }
</style>
