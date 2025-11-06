/**
 * Test Users
 *
 * Zentrale Definition aller Mock-User für Tests.
 * Diese User sind in package.json konfiguriert.
 */

const TEST_USERS = {
  max: {
    auth: {
      username: 'max.mustermann@test.de',
      password: 'max',
    },
  },
  erika: {
    auth: {
      username: 'erika.musterfrau@test.de',
      password: 'erika',
    },
  },
};

module.exports = { TEST_USERS };
