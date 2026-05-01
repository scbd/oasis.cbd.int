<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <strong class="text-secondary small">{{ placeholder }}</strong>
      <button class="btn btn-sm btn-ghost-primary" type="button" @click="openAdd">Add param</button>
    </div>

    <table v-if="rows.length" class="table table-sm table-bordered mb-2">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Validation</th>
          <th style="width: 60px" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td>{{ row.name }}</td>
          <td>{{ row.type }}</td>
          <td class="small text-secondary">
            {{ row.validationRegex ?? (row.validationJsonSchema ? 'JSON schema' : '') }}
          </td>
          <td>
            <button class="btn btn-sm btn-ghost-secondary me-1" type="button" @click="openEdit(i)">
              <IconEdit :size="13" />
            </button>
            <button class="btn btn-sm btn-ghost-danger" type="button" @click="removeRow(i)">
              <IconTrash :size="13" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div
      v-if="modal.open"
      class="modal modal-blur show d-block"
      style="background: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modal.editIndex === -1 ? 'New' : 'Edit' }} Param</h5>
            <button type="button" class="btn-close" @click="modal.open = false" />
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label required">Name</label>
              <input v-model="modal.item.name" type="text" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label required">Type</label>
              <select v-model="modal.item.type" class="form-select">
                <option value="">Select type</option>
                <option value="regex">Regex</option>
                <option value="jsonSchema">JSON Schema</option>
              </select>
            </div>
            <div v-if="modal.item.type === 'regex'" class="mb-3">
              <label class="form-label">Validation Regex</label>
              <input
                v-model="modal.item.validationRegex"
                type="text"
                class="form-control"
                placeholder="/^...$/i"
              />
            </div>
            <div v-if="modal.item.type === 'jsonSchema'" class="mb-3">
              <label class="form-label">Validation JSON Schema</label>
              <textarea v-model="modal.schemaStr" class="form-control font-monospace" rows="6" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost-secondary" @click="modal.open = false">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="saveModal">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IconEdit, IconTrash } from '@tabler/icons-vue'
  import type { WidgetParam } from '~/composables/useWidgetsApi'

  type ParamMap = Record<string, Omit<WidgetParam, 'name'>>

  const props = defineProps<{ modelValue?: ParamMap; placeholder?: string }>()
  const emit = defineEmits<{ 'update:modelValue': [v: ParamMap] }>()

  interface Row extends WidgetParam {
    schemaStr?: string
  }

  const rows = ref<Row[]>([])

  watch(
    () => props.modelValue,
    (val) => {
      if (!val) {
        rows.value = []
        return
      }
      rows.value = Object.entries(val).map(([name, p]) => ({
        name,
        ...p,
        schemaStr: p.validationJsonSchema ? JSON.stringify(p.validationJsonSchema, null, 2) : ''
      }))
    },
    { immediate: true }
  )

  const modal = reactive({
    open: false,
    editIndex: -1,
    item: {
      name: '',
      type: '' as 'regex' | 'jsonSchema' | '',
      validationRegex: '',
      validationJsonSchema: undefined as unknown
    },
    schemaStr: ''
  })

  function openAdd() {
    modal.editIndex = -1
    modal.item = { name: '', type: '', validationRegex: '', validationJsonSchema: undefined }
    modal.schemaStr = ''
    modal.open = true
  }

  function openEdit(i: number) {
    modal.editIndex = i
    const row = rows.value[i]
    modal.item = {
      name: row.name,
      type: row.type,
      validationRegex: row.validationRegex ?? '',
      validationJsonSchema: row.validationJsonSchema
    }
    modal.schemaStr = row.validationJsonSchema
      ? JSON.stringify(row.validationJsonSchema, null, 2)
      : ''
    modal.open = true
  }

  function saveModal() {
    if (!modal.item.name || !modal.item.type) return
    const row: Row = { name: modal.item.name, type: modal.item.type as 'regex' | 'jsonSchema' }
    if (modal.item.type === 'regex') row.validationRegex = modal.item.validationRegex
    if (modal.item.type === 'jsonSchema') {
      try {
        row.validationJsonSchema = JSON.parse(modal.schemaStr)
      } catch {
        return
      }
    }
    if (modal.editIndex === -1) rows.value.push(row)
    else rows.value[modal.editIndex] = row
    modal.open = false
    emitChange()
  }

  function removeRow(i: number) {
    rows.value.splice(i, 1)
    emitChange()
  }

  function emitChange() {
    const out: ParamMap = {}
    for (const row of rows.value) {
      const { name, ...rest } = row
      out[name] = rest
    }
    emit('update:modelValue', out)
  }
</script>
