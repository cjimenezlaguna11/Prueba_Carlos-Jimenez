import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import next from '@next/eslint-plugin-next'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['.next/**', '.generated/**', 'next-env.d.ts']),
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['src/**/*.{ts,tsx}'], extends: [next.configs['core-web-vitals'], reactHooks.configs.flat.recommended] }
])
