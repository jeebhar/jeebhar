import js from '@eslint/js';
import globals from 'globals';

/** Backend lint rules: Node globals, ES modules, no accidental console noise. */
export default [
  { ignores: ['node_modules', 'coverage'] },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error', 'info', 'debug'] }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
    },
  },

  {
    files: ['tests/**/*.js'],
    rules: { 'no-console': 'off' },
  },
];
