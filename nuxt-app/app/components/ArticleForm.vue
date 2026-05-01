<template>
  <div class="row row-cards">
    <div v-if="error" class="col-12">
      <div class="alert alert-danger">{{ error }}</div>
    </div>

    <div class="col-md-8">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ isNew ? 'New Article' : 'Edit Article' }}</h3>
        </div>
        <div class="card-body">
          <!-- Language tabs -->
          <ul class="nav nav-tabs mb-3">
            <li v-for="loc in locales" :key="loc" class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeLocale === loc }"
                type="button"
                @click="activeLocale = loc"
              >
                {{ loc.toUpperCase() }}
              </button>
            </li>
          </ul>

          <!-- Title -->
          <div class="mb-3">
            <label class="form-label required">Title ({{ activeLocale }})</label>
            <input
              v-model="form.title[activeLocale]"
              type="text"
              class="form-control"
              :placeholder="`Title in ${activeLocale}`"
            />
          </div>

          <!-- Content -->
          <div class="mb-3">
            <label class="form-label">Content ({{ activeLocale }})</label>
            <AppEditor v-model="form.content[activeLocale]" />
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <!-- Cover image -->
      <div class="card mb-3">
        <div class="card-header"><strong>Cover image</strong></div>
        <div class="card-body">
          <div v-if="form.coverImage?.url" class="mb-2">
            <img :src="form.coverImage.url" class="img-fluid rounded" />
          </div>
          <div
            class="dropzone border rounded p-3 text-center text-secondary"
            :class="{ 'border-primary': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onImageDrop"
          >
            <div v-if="uploadingImage" class="spinner-border spinner-border-sm text-primary" />
            <span v-else
              >Drop image here or
              <label class="text-primary" style="cursor: pointer">
                browse<input
                  type="file"
                  accept="image/*"
                  class="d-none"
                  @change="onImageSelect"
                /> </label
            ></span>
          </div>
          <div v-if="form.coverImage?.url" class="mt-2 row g-2">
            <div class="col-6">
              <select v-model="form.coverImage.position" class="form-select form-select-sm">
                <option value="">Position</option>
                <option v-for="p in coverPositions" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <div class="col-6">
              <select v-model="form.coverImage.size" class="form-select form-select-sm">
                <option value="">Size</option>
                <option v-for="s in coverSizes" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div class="card mb-3">
        <div class="card-header"><strong>Status</strong></div>
        <div class="card-body">
          <div class="form-check mb-2">
            <input
              id="statusDraft"
              v-model="form.status"
              class="form-check-input"
              type="radio"
              value="draft"
            />
            <label class="form-check-label" for="statusDraft">Draft</label>
          </div>
          <div class="form-check">
            <input
              id="statusPublished"
              v-model="form.status"
              class="form-check-input"
              type="radio"
              value="published"
            />
            <label class="form-check-label" for="statusPublished">Published</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="col-12">
      <div class="card">
        <div class="card-footer d-flex gap-2">
          <button class="btn btn-primary" :disabled="saving" @click="onSave">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1" />
            Save
          </button>
          <NuxtLink to="/articles" class="btn btn-ghost-secondary">Cancel</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Article } from '~/composables/useArticlesApi'

  const props = defineProps<{ initial?: Partial<Article> }>()
  const emit = defineEmits<{ saved: [id: string] }>()

  const router = useRouter()
  const articlesApi = useArticlesApi()

  const locales = ['en', 'ar', 'es', 'fr', 'ru', 'zh']
  const coverPositions = ['center', 'bottom', 'left', 'right', 'top', 'none']
  const coverSizes = ['contain', 'cover', 'none']

  const isNew = computed(() => !props.initial?._id)
  const activeLocale = ref('en')
  const saving = ref(false)
  const error = ref<string | null>(null)
  const isDragging = ref(false)
  const uploadingImage = ref(false)

  const form = reactive<{
    title: Record<string, string>
    content: Record<string, string>
    status: string
    coverImage: { url?: string; position?: string; size?: string }
  }>({
    title: { en: '' },
    content: { en: '' },
    status: 'draft',
    coverImage: {}
  })

  watch(
    () => props.initial,
    (val) => {
      if (!val) return
      form.title = val.title ? { ...(val.title as Record<string, string>) } : { en: '' }
      form.content = val.content ? { ...(val.content as Record<string, string>) } : { en: '' }
      form.status = val.status ?? 'draft'
      form.coverImage = { ...(val.coverImage ?? {}) }
    },
    { immediate: true }
  )

  async function uploadImage(file: File): Promise<string> {
    uploadingImage.value = true
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await $fetch<{ url: string }>('/api/v2015/temporary-files', {
        method: 'POST',
        body: fd
      })
      return res.url
    } finally {
      uploadingImage.value = false
    }
  }

  async function onImageDrop(e: DragEvent) {
    isDragging.value = false
    const file = e.dataTransfer?.files?.[0]
    if (!file) return
    form.coverImage.url = await uploadImage(file)
  }

  async function onImageSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    form.coverImage.url = await uploadImage(file)
  }

  async function onSave() {
    if (!form.title.en?.trim()) {
      error.value = 'English title is required'
      return
    }
    saving.value = true
    error.value = null
    try {
      const payload: Partial<Article> = {
        title: form.title,
        content: form.content,
        status: form.status,
        coverImage: form.coverImage.url ? form.coverImage : undefined
      }
      if (isNew.value) {
        const { id } = await articlesApi.createArticle(payload)
        emit('saved', id)
        router.push(`/articles/${id}/edit`)
      } else {
        await articlesApi.updateArticle(props.initial!._id!, payload)
        emit('saved', props.initial!._id!)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save article'
    } finally {
      saving.value = false
    }
  }
</script>
