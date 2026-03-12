import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactNative from 'eslint-plugin-react-native'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

export default [
  // Ignore build folders
  {
    ignores: [
      'node_modules',
      '.expo',
      'dist',
      'build',
      'android',
      'ios'
    ],
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
    files: ['**/*.{ts,tsx,js,jsx}'],
     plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      /* React */
      'react/react-in-jsx-scope': 'off',

      /* Hooks */
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      /* React Native */
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-raw-text': 'off',

      /* Import sorting */
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      /* Remove unused imports */
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],

      /* Clean code */
      'no-multiple-empty-lines': [
        'error',
        { max: 1, maxEOF: 0 },
      ],
    },
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
  },
]
