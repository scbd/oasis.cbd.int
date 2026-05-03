<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <strong class="text-secondary small">Datasources</strong>
      <button class="btn btn-sm btn-ghost-primary" type="button" @click="openAdd">
        Add datasource
      </button>
    </div>

    <table v-if="rows.length" class="table table-sm table-bordered mb-2">
      <thead>
        <tr>
          <th>Name</th>
          <th>URL</th>
          <th>Method</th>
          <th style="width: 60px" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td>{{ row.name }}</td>
          <td class="small text-secondary">{{ row.url }}</td>
          <td>{{ row.method }}</td>
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
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ modal.editIndex === -1 ? 'New' : 'Edit' }} Datasource</h5>
            <button type="button" class="btn-close" @click="modal.open = false" />
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label required">Name</label>
              <input v-model="modal.item.name" type="text" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label required">URL</label>
              <input v-model="modal.item.url" type="text" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label required">Method</label>
              <select v-model="modal.item.method" class="form-select">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
            <div v-if="modal.item.method" class="mb-3">
              <WidgetParams v-model="modal.item.queryString" placeholder="Querystring params" />
            </div>
            <div v-if="modal.item.method === 'POST' || modal.item.method === 'PUT'" class="mb-3">
              <WidgetParams v-model="modal.item.formData" placeholder="Form data params" />
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
  import type { WidgetDatasource } from '~/api'

  const props = defineProps<{ modelValue?: WidgetDatasource[] }>()
  const emit = defineEmits<{ 'update:modelValue': [v: WidgetDatasource[]] }>()

  const rows = ref<WidgetDatasource[]>([])

  watch(
    () => props.modelValue,
    (val) => {
      rows.value = val ? [...val] : []
    },
    { immediate: true }
  )

  const emptyItem = (): WidgetDatasource => ({
    name: '',
    url: '',
    method: 'GET',
    queryString: {},
    formData: {}
  })

  const modal = reactive({
    open: false,
    editIndex: -1,
    item: emptyItem()
  })

  function openAdd() {
    modal.editIndex = -1
    modal.item = emptyItem()
    modal.open = true
  }

  function openEdit(i: number) {
    modal.editIndex = i
    modal.item = { ...rows.value[i] }
    modal.open = true
  }

  function saveModal() {
    if (!modal.item.name || !modal.item.url || !modal.item.method) return
    if (modal.editIndex === -1) rows.value.push({ ...modal.item })
    else rows.value[modal.editIndex] = { ...modal.item }
    modal.open = false
    emit('update:modelValue', [...rows.value])
  }

  function removeRow(i: number) {
    rows.value.splice(i, 1)
    emit('update:modelValue', [...rows.value])
  }
</script>
