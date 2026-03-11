import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

export default [
  // Ignore build folders
  {
    ignores: ['node_modules', '.expo', 'dist', 'build'],
  },

  // Node scripts override
  {
    files: ['scripts/**/*.js', 'scripts/**/*.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },

  // Recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // App code rules
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
    },
    rules: {
      /* auto sort imports */
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      /* remove unused imports */
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],

      /* prevent many blank lines */
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],

      /* react hooks safety */
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
  },
]
