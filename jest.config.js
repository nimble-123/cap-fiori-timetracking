const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('jest').Config} **/
module.exports = {
  preset: "ts-jest",
  globalSetup: "./tests/setup.ts",
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
    '^.+node_modules/@cap-js/console/.+\\.js$': [
      'babel-jest',
      {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: 'current',
              },
            },
          ],
        ],
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!(?:@cap-js/console)/)'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '.',
        outputName: 'junit.xml',
      },
    ],
  ],
};
