/**
 * Test Users
 *
 * Zentrale Definition aller Mock-User für Tests.
 * Diese User sind in package.json konfiguriert.
 */

export interface TestUser {
  auth: {
    username: string;
    password: string;
  };
}

export interface TestUsers {
  max: TestUser;
  erika: TestUser;
}

export const TEST_USERS: TestUsers = {
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
