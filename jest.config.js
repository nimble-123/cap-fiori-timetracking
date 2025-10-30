/** @type {import('jest').Config} **/
module.exports = {
  preset: 'ts-jest',
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
