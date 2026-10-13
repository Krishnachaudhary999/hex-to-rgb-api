# hex-to-rgb-api

A small JavaScript library that converts hexadecimal colour notation to RGB
channels, exposed through an Express REST API. Written for the Integration
Testing exercise (LAB University of Applied Sciences).

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Install

```bash
npm install
```

## Run the API

```bash
npm start
# hex-to-rgb API listening on http://localhost:3000
```

## Library

`src/hexToRgb.js` exports a single function.

```js
const { hexToRgb } = require('./src/hexToRgb');

hexToRgb('#FF8800'); // { r: 255, g: 136, b: 0, css: 'rgb(255, 136, 0)' }
hexToRgb('f80');     // { r: 255, g: 136, b: 0, css: 'rgb(255, 136, 0)' }
```

Accepted input: `#RRGGBB`, `RRGGBB`, `#RGB`, `RGB`, any case, surrounding
whitespace trimmed. A non-string argument throws `TypeError`; a malformed
string throws `InvalidHexError`.

## API

| Method | Path                    | Success | Failure |
| ------ | ----------------------- | ------- | ------- |
| GET    | `/api/health`           | 200     | –       |
| GET    | `/api/convert?hex=<v>`  | 200     | 400     |
| GET    | anything else           | –       | 404     |

### Example

```bash
curl "http://localhost:3000/api/convert?hex=%23FF8800"
```

```json
{ "input": "#FF8800", "r": 255, "g": 136, "b": 0, "css": "rgb(255, 136, 0)" }
```

Error responses:

```json
{ "error": "Query parameter 'hex' is required" }
{ "error": "Invalid hex colour: '#gg0000'" }
{ "error": "Not found" }
```

## Tests

```bash
npm test            # all suites
npm run test:unit   # library only
npm run test:api    # API only (Supertest)
npm run test:coverage
```

- `tests/hexToRgb.test.js` – unit tests for the library in isolation.
- `tests/api.test.js` – integration tests driving the real Express app over
  HTTP with Supertest, including a mocked-library test that proves the route
  delegates the conversion instead of duplicating it.

## Postman

Import `postman/hex-to-rgb.postman_collection.json` and run the collection
against a running server. Each request carries assertions, so the Collection
Runner produces a pass/fail summary.

## Project structure

```
hex-to-rgb-api/
├── src/
│   ├── hexToRgb.js   # library: the conversion function
│   ├── app.js        # Express app (exported, not started)
│   └── server.js     # entry point: binds app to a port
├── tests/
│   ├── hexToRgb.test.js
│   └── api.test.js
├── postman/
│   └── hex-to-rgb.postman_collection.json
├── .gitignore
├── package.json
└── README.md
```
