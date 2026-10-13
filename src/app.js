'use strict';

/**
 * @file app.js
 * Builds and exports the Express application. The application is deliberately
 * NOT started here: `app.listen` lives in server.js so that integration tests
 * can mount this app with Supertest without binding a TCP port.
 */

const express = require('express');
const { hexToRgb } = require('./hexToRgb');

const app = express();

/**
 * GET /api/health
 * Trivial liveness probe used as a smoke test.
 *
 * @returns {void} Responds 200 with `{ status: 'ok' }`.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * GET /api/convert?hex=<value>
 * Converts a hex colour supplied as a query parameter into RGB channels.
 *
 * Responses:
 * - 200 `{ input, r, g, b, css }` on success
 * - 400 `{ error: "Query parameter 'hex' is required" }` if the parameter is absent
 * - 400 `{ error: "Invalid hex colour: '<value>'" }` if the value is malformed
 *
 * @returns {void} Sends the JSON response.
 */
app.get('/api/convert', (req, res) => {
  const { hex } = req.query;

  if (hex === undefined) {
    return res.status(400).json({ error: "Query parameter 'hex' is required" });
  }

  try {
    const { r, g, b, css } = hexToRgb(hex);
    return res.status(200).json({ input: hex, r, g, b, css });
  } catch (error) {
    // Both a malformed string and a non-string value (for example a repeated
    // query parameter, which Express turns into an array) are client errors.
    return res.status(400).json({ error: `Invalid hex colour: '${hex}'` });
  }
});

/**
 * Catch-all handler returning a JSON 404 so that every response from this API
 * has the same content type.
 *
 * @returns {void} Responds 404 with `{ error: 'Not found' }`.
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
