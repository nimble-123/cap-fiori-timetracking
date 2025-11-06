/**
 * Test Helpers Index
 *
 * Barrel export für alle Test-Helper
 */

export { TimeEntryFactory, generateUniqueFutureDate, generateTestDate } from './test-data-factory';
export { TEST_USERS } from './test-users';
export type { TestUser, TestUsers } from './test-users';

/**
 * Generic OData Collection Response Type
 * Wird von OData V4 für Listen-Responses verwendet
 */
export interface ODataCollection<T> {
  '@odata.context'?: string;
  value: T[];
}
