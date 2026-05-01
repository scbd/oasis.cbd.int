// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // TypeScript strict rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',

    // Vue rules
    'vue/component-api-style': ['error', ['script-setup']],
    'vue/define-macros-order': ['error', {
      order: ['defineProps', 'defineEmits', 'defineSlots']
    }],

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
})
