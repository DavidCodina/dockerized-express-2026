import { defineConfig, globalIgnores } from 'eslint/config'

import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

import pluginPromise from 'eslint-plugin-promise'
import vitest from '@vitest/eslint-plugin'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.node }
  },
  globalIgnores(['dist', 'src/generated']),
  // The "js/recommended" configuration ensures all of the rules marked as recommended on the rules page will be turned on.
  // https://eslint.org/docs/latest/rules
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginPromise.configs['flat/recommended'],

  // https://github.com/vitest-dev/eslint-plugin-vitest?tab=readme-ov-file#rules
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/expect-expect': 'warn'
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals
      }
    }
  },
  eslintPluginPrettierRecommended,

  {
    rules: {
      /* ======================
        eslint-plugin-prettier
      ====================== */

      'prettier/prettier': 'warn', // For eslint-plugin-prettier - downgrade to "warn"
      'arrow-body-style': 'off', // eslint-plugin-prettier recommendation
      'prefer-arrow-callback': 'off', // eslint-plugin-prettier recommendation

      /* ======================
              eslint 
      ====================== */

      ///////////////////////////////////////////////////////////////////////////
      //
      //   const data = { name: 'Fred',  age: 35,}
      //
      //   for (const key in data) {
      //     if (Object.prototype.hasOwnProperty.call(data, key)) {
      //       console.log(`${key}: ${data[key as keyof typeof data]}`)
      //     }
      //   }
      //
      ///////////////////////////////////////////////////////////////////////////
      'guard-for-in': 'warn',

      // Would require an await inside the body of an async function: export const func = async () => null
      // Off by default in Next.js
      'require-await': 'off',
      'prefer-const': 'warn', // Prefer const over let, etc.
      'no-var': 'warn', // Warns user to implement let or const instead.
      'no-throw-literal': 'warn', // Warns user to use an Error object
      'no-undef': 'off',
      'no-unreachable': 'warn', // Warns user when code is unreachable due to return, throw, etc.

      'no-eq-null': 'warn', // Warns user to implement strict equality.
      'no-prototype-builtins': 'off',

      /* ======================
      @typescript-eslint/eslint-plugin
      ====================== */

      '@typescript-eslint/ban-ts-comment': 'off', // Allows @ts-ignore statement

      '@typescript-eslint/no-non-null-assertion': 'off', // Allows ! bang operator - already "off" in Next.js by defualt.

      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-empty-object-type': 'off', // Allows type Props = {}

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_', // Ignore unused arguments that start with _
          varsIgnorePattern: '^_', // Ignore unused variables that start with _
          caughtErrorsIgnorePattern: '^_', // Ignore caught errors that start with _
          destructuredArrayIgnorePattern: '^_' // Ignore destructured array elements that start with _
        }
      ],

      /* ======================
        eslint-plugin-promise
      ====================== */

      'promise/always-return': 'warn',
      'promise/no-return-wrap': 'warn',
      'promise/param-names': 'warn',
      'promise/catch-or-return': ['warn', { allowFinally: true }],
      'promise/no-native': 'off',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-callback-in-promise': 'warn',
      'promise/avoid-new': 'off',
      'promise/no-new-statics': 'warn',
      'promise/no-return-in-finally': 'warn',
      'promise/valid-params': 'warn',
      'promise/no-multiple-resolved': 'warn'
    }
  }
])
