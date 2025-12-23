import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import reactPlugin from 'eslint-plugin-react'
import importPlugin from 'eslint-plugin-import'

export default [
  {
    ignores: [
      '.*',
      '.*/**',
      'dist/**',
      'build/**',
      'esm/**',
      'public/**',
      'node_modules/**',
      '*.tgz',
      'pnpm-lock.yaml',
    ],
  },

  js.configs.recommended,

  // TS without types
  ...tseslint.configs.recommended,

  // TS with types
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      import: importPlugin,
      react: reactPlugin,
    },
    rules: {
      ...tseslint.configs.strictTypeChecked.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import/no-default-export': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-vars': 'error',
    },
  },

  // Config files: default export is okay at
  {
    files: ['tsup.config.ts', 'eslint.config.js'],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  prettier,
]
