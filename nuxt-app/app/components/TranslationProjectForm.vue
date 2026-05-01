<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Translation Project</h3>
    </div>

    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label required">Name</label>
          <input
            v-model="form.name"
            type="text"
            class="form-control"
            placeholder="e.g. chm-2025-q1"
            maxlength="50"
            @input="
              form.name = ($event.target as HTMLInputElement).value.replace(/[^.a-z0-9_-]/gi, '')
            "
          />
          <small class="text-secondary"
            >Max 50 chars — letters, numbers, <code>- _ .</code> only</small
          >
        </div>

        <div class="col-md-6">
          <label class="form-label required">Application</label>
          <input
            v-model="form.application"
            type="text"
            class="form-control"
            placeholder="e.g. CHM, ABSCH, ORT"
          />
        </div>

        <div class="col-md-6">
          <label class="form-label required">Description</label>
          <input
            v-model="form.description"
            type="text"
            class="form-control"
            placeholder="Short description"
          />
        </div>

        <div class="col-md-6">
          <label class="form-label required">Target languages</label>
          <select v-model="form.targetLocales" class="form-select" multiple>
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.title }} ({{ lang.code }})
            </option>
          </select>
        </div>

        <div class="col-12">
          <label class="form-label required">Source files</label>
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
              <label class="text-primary cursor-pointer" for="file-input">browse</label>
            </p>
            <small class="text-secondary">Accepted: .zip, .json, .sdlppx</small>
            <input
              id="file-input"
              type="file"
              class="d-none"
              multiple
              accept=".zip,.json,.sdlppx,application/zip,application/json"
              @change="onFileChange"
            />
          </div>

          <div v-if="uploadQueue.length" class="mt-2">
            <div
              v-for="item in uploadQueue"
              :key="item.name"
              class="d-flex align-items-center gap-2 py-1"
            >
              <IconFile :size="16" class="text-secondary" />
              <span class="flex-fill text-truncate small">{{ item.name }}</span>
              <span v-if="item.status === 'uploading'" class="spinner-border spinner-border-sm" />
              <IconCheck v-else-if="item.status === 'done'" :size="16" class="text-success" />
              <IconX v-else-if="item.status === 'error'" :size="16" class="text-danger" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer d-flex gap-2">
      <button class="btn btn-primary" :disabled="loading" @click="onSave">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" />
        Save
      </button>
      <button class="btn btn-danger" :disabled="loading" @click="onReset">Clear</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IconUpload, IconFile, IconCheck, IconX } from '@tabler/icons-vue'
  import { languages } from '~/data/languages'
  import type { TranslationProject, SourceFileUrl } from '~/types/translation'

  const props = defineProps<{
    initial?: Partial<TranslationProject>
  }>()

  const emit = defineEmits<{
    saved: [id: string]
  }>()

  const router = useRouter()
  const api = useTranslationApi()

  interface QueueItem {
    name: string
    file: File
    status: 'pending' | 'uploading' | 'done' | 'error'
    result?: SourceFileUrl
  }

  const loading = ref(false)
  const isDragging = ref(false)
  const uploadQueue = ref<QueueItem[]>([])

  const form = reactive<TranslationProject>({
    name: props.initial?.name ?? '',
    application: props.initial?.application ?? '',
    description: props.initial?.description ?? '',
    targetLocales: props.initial?.targetLocales ?? [],
    sourceFileUrls: props.initial?.sourceFileUrls ?? [],
    _id: props.initial?._id
  })

  function addFiles(files: FileList | File[]) {
    const ext = ['.zip', '.json', '.sdlppx']
    for (const file of Array.from(files)) {
      const ok = ext.some((e) => file.name.toLowerCase().endsWith(e))
      if (ok) uploadQueue.value.push({ name: file.name, file, status: 'pending' })
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

  async function uploadPendingFiles() {
    const pending = uploadQueue.value.filter((i) => i.status === 'pending')
    for (const item of pending) {
      item.status = 'uploading'
      try {
        const result = await api.uploadTempFile(item.file)
        item.result = {
          contentType: result.contentType,
          hash: result.hash,
          fileName: item.file.name,
          folderPath: item.file.name,
          size: result.size,
          uid: result.uid,
          url: result.url
        }
        item.status = 'done'
        form.sourceFileUrls.push(item.result)
      } catch {
        item.status = 'error'
      }
    }
  }

  function validate(): string | null {
    if (!form.name) return 'Please provide a project name'
    if (!form.application) return 'Please provide an application name'
    if (!form.description) return 'Please provide a description'
    if (!form.targetLocales.length) return 'Please select at least one target language'
    const hasPendingOrDone =
      uploadQueue.value.some((i) => i.status === 'pending') || form.sourceFileUrls.length > 0
    if (!hasPendingOrDone) return 'Please add at least one source file'
    return null
  }

  async function onSave() {
    const err = validate()
    if (err) {
      alert(err)
      return
    }

    loading.value = true
    try {
      await uploadPendingFiles()
      if (form._id) {
        await api.updateProject(form._id, form)
        emit('saved', form._id)
      } else {
        const id = await api.addProject(form)
        emit('saved', id)
      }
      router.push('/translation/trados-projects')
    } catch {
      alert('An error occurred while saving. Please try again.')
    } finally {
      loading.value = false
    }
  }

  function onReset() {
    uploadQueue.value = []
    form.name = ''
    form.application = ''
    form.description = ''
    form.targetLocales = []
    form.sourceFileUrls = []
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
