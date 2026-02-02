import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import prettier from 'eslint-config-prettier'

export default [
  // ===== 無視対象 =====
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'prisma/**',
      'src/generated/**',
      '.env',
    ],
  },

  // ===== JavaScript =====
  js.configs.recommended,

  // ===== TypeScript =====
  ...tseslint.configs.recommended,

  // ===== React =====
  {
    plugins: {
      react,
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // Next.js では不要
    },
  },

  // ===== Prettier競合回避 =====
  prettier,
]

