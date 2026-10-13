'use strict';

/**
 * @file hexToRgb.js
 * Library module for converting hexadecimal colour notation into RGB
 * components. This module has no dependencies and performs no I/O, which
 * makes it directly unit testable.
 */

/**
 * Error thrown when a string is syntactically not a hexadecimal colour.
 * A dedicated error type lets callers (and tests) distinguish a malformed
 * value from a wrong argument type.
 *
 * @extends Error
 */
class InvalidHexError extends Error {
  /**
   * @param {string} value The rejected input, echoed back in the message.
   */
  constructor(value) {
    super(`Invalid hex colour: '${value}'`);
    this.name = 'InvalidHexError';
  }
}

/**
 * Matches a hex colour body (no leading '#') of either 3 or 6 digits.
 * @type {RegExp}
 */
const HEX_BODY = /^(?:[0-9a-f]{3}|[0-9a-f]{6})$/;

/**
 * Converts a hexadecimal colour string into its red, green and blue channels.
 *
 * Accepted input formats:
 * - `#RRGGBB` or `RRGGBB` (the leading `#` is optional)
 * - `#RGB` or `RGB` (shorthand, expanded by doubling each digit)
 * - Upper or lower case; surrounding whitespace is trimmed
 *
 * @param {string} hex The hexadecimal colour to convert.
 * @returns {{r: number, g: number, b: number, css: string}} Channel values in
 *   the range 0-255 plus a ready-to-use CSS `rgb(r, g, b)` string.
 * @throws {TypeError} If `hex` is not a string.
 * @throws {InvalidHexError} If `hex` is empty, has the wrong number of digits,
 *   or contains characters outside 0-9 and a-f.
 *
 * @example
 * hexToRgb('#FF8800'); // { r: 255, g: 136, b: 0, css: 'rgb(255, 136, 0)' }
 * hexToRgb('f80');     // { r: 255, g: 136, b: 0, css: 'rgb(255, 136, 0)' }
 */
function hexToRgb(hex) {
  if (typeof hex !== 'string') {
    throw new TypeError(
      `hexToRgb expects a string, received ${hex === null ? 'null' : typeof hex}`
    );
  }

  // Normalise once so that case, whitespace and the optional '#' are handled
  // in a single place rather than scattered through the parsing logic.
  const body = hex.trim().replace(/^#/, '').toLowerCase();

  if (!HEX_BODY.test(body)) {
    throw new InvalidHexError(hex);
  }

  // Expand shorthand so the slicing below can assume six digits.
  const full = body.length === 3
    ? body.split('').map((digit) => digit + digit).join('')
    : body;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  return { r, g, b, css: `rgb(${r}, ${g}, ${b})` };
}

module.exports = { hexToRgb, InvalidHexError };
