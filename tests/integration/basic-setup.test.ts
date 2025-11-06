/**
 * Integration Tests - Basic Setup
 *
 * Testet grundlegende OData-Funktionalität und $metadata
 */
import cds from '@sap/cds';
import type { AxiosResponse } from 'axios';

const { GET, expect } = cds.test(__dirname + '/../..', '--in-memory');

describe('TrackService - Basic Setup', () => {
  it('should serve $metadata document in v4', async () => {
    const { headers, status, data } = (await GET`/odata/v4/track/$metadata`) as AxiosResponse<string>;

    expect(status).to.equal(200);
    expect(headers).to.contain({
      'odata-version': '4.0',
    });
    expect(headers['content-type']).to.match(/application\/xml/);
    expect(data).to.contain('<EntitySet Name="TimeEntries" EntityType="TrackService.TimeEntries">');
  });

  it('should serve OData service document', async () => {
    const { status, data } = (await GET('/odata/v4/track/')) as AxiosResponse<{
      '@odata.context': string;
      value: unknown[];
    }>;

    expect(status).to.equal(200);
    expect(data).to.have.property('@odata.context');
    expect(data.value).to.be.an('array');
  });
});
