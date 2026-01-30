import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import prettier from 'eslint-config-prettier'

const _filename = fileURLToPath(import.meta.url)
const _dirname = dirname(_filename)

const compat = new FlatCompat({
  baseDirectory: _dirname,
})

export default defineConfig([
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
  },

  // Next.js recommended rules
  ...nextVitals,
  ...nextTs,

  // Override default ignores
  globalIgnores([
    'src/generated/prisma/**',
    'prisma/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
  ]),

  // Compat for legacy extends
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Disable rules conflicting with Prettier
  prettier,
])
