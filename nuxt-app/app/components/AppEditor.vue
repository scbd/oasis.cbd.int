<template>
  <div class="app-editor">
    <ckeditor
      v-if="editor"
      :editor="editor"
      :config="editorConfig"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
  import {
    ClassicEditor,
    Essentials,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Paragraph,
    Heading,
    Link,
    List,
    BlockQuote,
    Table,
    TableToolbar,
    Image,
    ImageUpload,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    Indent,
    IndentBlock,
    Alignment,
    HorizontalLine,
    Undo
  } from 'ckeditor5'
  import { Ckeditor } from '@ckeditor/ckeditor5-vue'

  import 'ckeditor5/ckeditor5.css'

  defineProps<{
    modelValue: string
  }>()

  defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const editor = ClassicEditor

  const editorConfig = {
    plugins: [
      Essentials,
      Bold,
      Italic,
      Underline,
      Strikethrough,
      Paragraph,
      Heading,
      Link,
      List,
      BlockQuote,
      Table,
      TableToolbar,
      Image,
      ImageUpload,
      ImageCaption,
      ImageStyle,
      ImageToolbar,
      Indent,
      IndentBlock,
      Alignment,
      HorizontalLine,
      Undo
    ],
    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'outdent',
        'indent',
        'alignment',
        '|',
        'blockQuote',
        'insertTable',
        'horizontalLine'
      ]
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    },
    image: {
      toolbar: ['imageStyle:inline', 'imageStyle:block', '|', 'imageTextAlternative']
    }
  }
</script>
