'use strict';

/**
 * @file hexToRgb.test.js
 * UNIT TESTS for the hexToRgb library.
 *
 * Scope: the library function only. No HTTP server, no Express, no network.
 * These tests describe the contract of the function itself - accepted input
 * formats, exact output shape, boundary values and every rejection path - so
 * that a failure here points at the conversion logic and nothing else.
 */

const { hexToRgb, InvalidHexError } = require('../src/hexToRgb');

describe('hexToRgb() - valid input', () => {
  // Table-driven: one row per accepted format. Adding a format means adding a
  // row, not another copy of the same assertions.
  test.each([
    ['#FF8800', 255, 136, 0],
    ['FF8800', 255, 136, 0],
    ['#ff8800', 255, 136, 0],
    ['#f80', 255, 136, 0],
    ['f80', 255, 136, 0],
    ['#000000', 0, 0, 0],
    ['#ffffff', 255, 255, 255],
    ['#000', 0, 0, 0],
    ['#fff', 255, 255, 255],
    ['#1A2B3C', 26, 43, 60],
  ])('converts %s to r=%i g=%i b=%i', (input, r, g, b) => {
    expect(hexToRgb(input)).toEqual({ r, g, b, css: `rgb(${r}, ${g}, ${b})` });
  });

  test('is case insensitive', () => {
    expect(hexToRgb('#AABBCC')).toEqual(hexToRgb('#aabbcc'));
  });

  test('treats the leading # as optional', () => {
    expect(hexToRgb('#123456')).toEqual(hexToRgb('123456'));
  });

  test('expands 3-digit shorthand by doubling each digit', () => {
    expect(hexToRgb('#f80')).toEqual(hexToRgb('#ff8800'));
  });

  test.each(['  #FF8800', '#FF8800  ', '\t#FF8800\n'])(
    'trims surrounding whitespace in %j',
    (input) => {
      expect(hexToRgb(input).css).toBe('rgb(255, 136, 0)');
    }
  );

  test('formats the css string as "rgb(r, g, b)" with spaces after commas', () => {
    expect(hexToRgb('#FF8800').css).toBe('rgb(255, 136, 0)');
  });

  test('returns exactly the four documented keys', () => {
    expect(Object.keys(hexToRgb('#FF8800')).sort()).toEqual(['b', 'css', 'g', 'r']);
  });

  test('returns numbers, not strings', () => {
    const { r, g, b } = hexToRgb('#0A0B0C');
    [r, g, b].forEach((channel) => expect(typeof channel).toBe('number'));
  });
});

describe('hexToRgb() - malformed strings', () => {
  // Every row must be rejected with InvalidHexError, never silently coerced.
  test.each([
    ['#ff88', 'four digits'],
    ['#fffff', 'five digits'],
    ['#1234567', 'seven digits'],
    ['#gg0000', 'non-hex characters'],
    ['#ff 00 00', 'inner whitespace'],
    ['', 'empty string'],
    ['   ', 'whitespace only'],
    ['#', 'hash only'],
    ['rgb(255,0,0)', 'a css rgb string'],
    ['##ffffff', 'a doubled hash'],
  ])('rejects %j (%s)', (input) => {
    expect(() => hexToRgb(input)).toThrow(InvalidHexError);
  });

  test('error message echoes the rejected value', () => {
    expect(() => hexToRgb('#gg0000')).toThrow("Invalid hex colour: '#gg0000'");
  });
});

describe('hexToRgb() - wrong argument types', () => {
  test.each([
    [null],
    [undefined],
    [255],
    [{}],
    [['#ffffff']],
    [true],
  ])('throws TypeError for %p', (input) => {
    expect(() => hexToRgb(input)).toThrow(TypeError);
  });

  test('TypeError message names the received type', () => {
    expect(() => hexToRgb(255)).toThrow('hexToRgb expects a string, received number');
  });

  test('throws when called with no arguments at all', () => {
    expect(() => hexToRgb()).toThrow(TypeError);
  });
});
