'use strict';

/**
 * @file api.test.js
 * INTEGRATION TESTS for the Express REST API.
 *
 * Scope: the real Express application, exercised over real HTTP by Supertest.
 * Routing, query-string parsing, URL decoding, status codes, headers and the
 * JSON response body are all in scope - these are the parts the unit tests
 * cannot see. The final block mocks the library on purpose to prove the route
 * delegates to it instead of re-implementing the conversion.
 */

const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  test('responds 200 with status ok', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/convert - success paths', () => {
  test('converts a 6-digit hex and returns the documented body', async () => {
    const response = await request(app).get('/api/convert?hex=FF8800');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      input: 'FF8800',
      r: 255,
      g: 136,
      b: 0,
      css: 'rgb(255, 136, 0)',
    });
  });

  test('responds with JSON content type', async () => {
    const response = await request(app).get('/api/convert?hex=FF8800');

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  test('handles a URL-encoded # (%23) identically to a bare hex', async () => {
    const encoded = await request(app).get('/api/convert?hex=%23FF8800');
    const bare = await request(app).get('/api/convert?hex=FF8800');

    expect(encoded.status).toBe(200);
    expect(encoded.body.r).toBe(bare.body.r);
    expect(encoded.body.css).toBe(bare.body.css);
    expect(encoded.body.input).toBe('#FF8800');
  });

  test('handles 3-digit shorthand through the HTTP layer', async () => {
    const response = await request(app).get('/api/convert?hex=%23f80');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ r: 255, g: 136, b: 0 });
  });

  test.each([
    ['%23000000', 0, 0, 0],
    ['%23ffffff', 255, 255, 255],
  ])('returns boundary colour %s correctly', async (query, r, g, b) => {
    const response = await request(app).get(`/api/convert?hex=${query}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ r, g, b });
  });
});

describe('GET /api/convert - error paths', () => {
  test('returns 400 when the hex parameter is missing', async () => {
    const response = await request(app).get('/api/convert');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Query parameter 'hex' is required" });
  });

  test.each(['%23ff88', '%23gg0000', 'notacolour'])(
    'returns 400 for malformed value %s',
    async (query) => {
      const response = await request(app).get(`/api/convert?hex=${query}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/^Invalid hex colour: /);
    }
  );

  test('returns 400 and does not crash when hex is repeated (array value)', async () => {
    const response = await request(app).get('/api/convert?hex=FF8800&hex=00FF00');

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/^Invalid hex colour: /);
  });

  test('returns an empty hex parameter as a client error', async () => {
    const response = await request(app).get('/api/convert?hex=');

    expect(response.status).toBe(400);
  });
});

describe('unknown routes', () => {
  test('returns a JSON 404', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Not found' });
  });
});

describe('route delegation (library replaced by a mock)', () => {
  let appWithMock;
  let hexToRgbMock;

  beforeAll(() => {
    // Rebuild the module registry so that app.js picks up the mocked library
    // instead of the real one loaded at the top of this file.
    jest.resetModules();
    jest.doMock('../src/hexToRgb', () => ({
      hexToRgb: jest.fn(() => ({ r: 1, g: 2, b: 3, css: 'rgb(1, 2, 3)' })),
      InvalidHexError: class InvalidHexError extends Error {},
    }));

    ({ hexToRgb: hexToRgbMock } = require('../src/hexToRgb'));
    appWithMock = require('../src/app');
  });

  afterAll(() => {
    jest.dontMock('../src/hexToRgb');
    jest.resetModules();
  });

  test('passes the decoded query value straight to the library', async () => {
    const response = await request(appWithMock).get('/api/convert?hex=%23ABCDEF');

    expect(hexToRgbMock).toHaveBeenCalledTimes(1);
    expect(hexToRgbMock).toHaveBeenCalledWith('#ABCDEF');
    expect(response.body).toMatchObject({ r: 1, g: 2, b: 3, css: 'rgb(1, 2, 3)' });
  });

  test('does not call the library when the parameter is missing', async () => {
    hexToRgbMock.mockClear();

    const response = await request(appWithMock).get('/api/convert');

    expect(response.status).toBe(400);
    expect(hexToRgbMock).not.toHaveBeenCalled();
  });
});
