'use strict';

/**
 * @file server.js
 * Process entry point. Its only job is to bind the Express application from
 * app.js to a port, keeping the app itself free of side effects.
 */

const app = require('./app');

/** @type {number} Port to listen on; override with the PORT env variable. */
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`hex-to-rgb API listening on http://localhost:${PORT}`);
});
