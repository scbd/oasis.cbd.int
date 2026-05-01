<template>
  <div class="row row-cards">
    <div v-if="error" class="col-12">
      <div class="alert alert-danger">{{ error }}</div>
    </div>

    <div class="col-md-8">
      <div class="card mb-3">
        <div class="card-header"><strong>Widget details</strong></div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label required">Name</label>
            <input v-model="form.name" type="text" class="form-control" maxlength="30" />
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label required">Content type</label>
              <select v-model="form.contentType" class="form-select">
                <option v-for="ct in contentTypes" :key="ct" :value="ct">{{ ct }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label required">HTTP method</label>
              <select v-model="form.method" class="form-select">
                <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Querystring params -->
      <div v-if="form.method" class="card mb-3">
        <div class="card-header"><strong>Querystring params</strong></div>
        <div class="card-body">
          <WidgetParams v-model="form.queryString" placeholder="Querystring params" />
        </div>
      </div>

      <!-- Form data params -->
      <div v-if="form.method === 'POST' || form.method === 'PUT'" class="card mb-3">
        <div class="card-header"><strong>Form data params</strong></div>
        <div class="card-body">
          <WidgetParams v-model="form.formData" placeholder="Form data params" />
        </div>
      </div>

      <!-- Datasources -->
      <div class="card mb-3">
        <div class="card-header"><strong>Datasources</strong></div>
        <div class="card-body">
          <WidgetDatasource v-model="form.dataSource" />
        </div>
      </div>

      <!-- Template -->
      <div class="card mb-3">
        <div class="card-header"><strong>Template</strong></div>
        <div class="card-body">
          <textarea
            v-model="form.template"
            class="form-control font-monospace"
            rows="20"
            placeholder="Handlebars template…"
          />
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <!-- Preview -->
      <div class="card mb-3">
        <div class="card-header"><strong>Preview</strong></div>
        <div class="card-body">
          <p class="text-secondary small">Save the widget first, then use the preview function.</p>
          <button
            v-if="widgetId"
            class="btn btn-ghost-primary btn-sm"
            type="button"
            @click="onPreview"
          >
            Preview
          </button>
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
          <NuxtLink to="/widgets" class="btn btn-ghost-secondary">Cancel</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useWidgetsApi } from '~/composables/useWidgetsApi'
  import type { Widget } from '~/composables/useWidgetsApi'

  const props = defineProps<{ initial?: Partial<Widget> }>()
  const emit = defineEmits<{ saved: [id: string] }>()

  const router = useRouter()
  const widgetsApi = useWidgetsApi()

  const contentTypes = ['text/html', 'application/json']
  const methods = ['GET', 'POST', 'PUT']

  const widgetId = computed(() => props.initial?._id)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const form = reactive<Widget>({
    name: '',
    contentType: 'text/html',
    method: 'GET',
    queryString: {},
    formData: {},
    dataSource: [],
    template: ''
  })

  watch(
    () => props.initial,
    (val) => {
      if (!val) return
      Object.assign(form, {
        name: val.name ?? '',
        contentType: val.contentType ?? 'text/html',
        method: val.method ?? 'GET',
        queryString: val.queryString ?? {},
        formData: val.formData ?? {},
        dataSource: val.dataSource ?? [],
        template: val.template ?? ''
      })
    },
    { immediate: true }
  )

  async function onSave() {
    if (!form.name?.trim()) {
      error.value = 'Name is required'
      return
    }
    if (!form.template?.trim()) {
      error.value = 'Template is required'
      return
    }
    saving.value = true
    error.value = null
    try {
      if (widgetId.value) {
        await widgetsApi.updateWidget(widgetId.value, { ...form, _id: widgetId.value })
        emit('saved', widgetId.value)
      } else {
        const { id } = await widgetsApi.createWidget(form)
        emit('saved', id)
        router.push(`/widgets/${id}/edit`)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to save widget'
    } finally {
      saving.value = false
    }
  }

  function onPreview() {
    if (widgetId.value) window.open(`/widgets/${widgetId.value}/preview`, '_blank')
  }
</script>
