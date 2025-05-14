import js from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['src/**/*.{js,mjs,cjs}'],
    plugins: { js, '@stylistic/js': stylisticJs },
    rules: {
      'no-console': 'error',
      'no-unused-vars': 'error',
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/semi': ['error', 'always'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/space-before-function-paren': ['error', 'always'],
      '@stylistic/js/array-bracket-spacing': ['error', 'never'],
      '@stylistic/js/object-curly-spacing': ['error', 'always'],
      '@stylistic/js/no-trailing-spaces': 'error',
      '@stylistic/js/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
        { blankLine: 'always', prev: 'multiline-const', next: '*' },
      ],
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  },
  {
    files: ['src/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { chrome: 'readonly', ...globals.browser },
    },
  },
]);
