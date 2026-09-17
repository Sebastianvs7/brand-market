const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const boundaries = require('eslint-plugin-boundaries');

const element = (type) => ({ element: { type } });
const publicElement = (type) => ({ element: { type, internalPath: 'index.ts' } });

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/**', 'coverage/**', 'ios/**', 'android/**', '.expo/**', 'legacy.tsx'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
      'boundaries/elements': [
        { type: 'screen', pattern: 'src/screens/*' },
        { type: 'feature', pattern: 'src/features/*', capture: ['name'] },
        { type: 'branding', pattern: 'src/branding' },
        { type: 'shared', pattern: 'src/shared/*' },
        { type: 'app', pattern: 'src/app' },
        { type: 'testing', pattern: 'src/testing' },
      ],
      'boundaries/files': [{ category: 'entry', pattern: '{App.tsx,refactored.tsx,index.ts}' }],
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'import/no-cycle': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          checkUnknownLocals: true,
          policies: [
            {
              from: [element('app'), { file: { categories: 'entry' } }],
              allow: [
                { to: element(['app', 'shared']) },
                { to: { file: { categories: 'entry' } } },
                { to: publicElement(['screen', 'feature', 'branding']) },
              ],
            },
            {
              from: element('screen'),
              allow: [{ to: publicElement(['feature', 'branding']) }, { to: element('shared') }],
            },
            { from: element(['feature', 'branding']), allow: { to: element('shared') } },
            { from: element('shared'), allow: { to: element('shared') } },
            { from: element('testing'), allow: { to: element(['shared', 'branding']) } },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'src/testing/**'],
    rules: { 'boundaries/dependencies': 'off' },
  },
]);
