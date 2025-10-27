import cdsPlugin from '@sap/eslint-plugin-cds';
import cds from '@sap/cds/eslint.config.mjs';
export default [
  cdsPlugin.configs.recommended,
  ...cds.recommended,
  {
    ignores: ['**/gen/**', '**/node_modules/**', '**/dist/**', '**/coverage/**', '**/*.config.mjs'],
  },
];
