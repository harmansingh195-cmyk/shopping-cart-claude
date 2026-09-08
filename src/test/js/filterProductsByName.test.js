/**
 * Vitest unit tests for filterProductsByName (T09 — NFR4)
 *
 * Strategy (architecture.md §7):
 *   - Load index.html into a JSDOM instance with runScripts:"dangerously"
 *   - Mock window.fetch before parse so the inline script's fetch('/api/products') call
 *     does not throw and filterProductsByName is available on window immediately
 *   - Extract dom.window.filterProductsByName and drive it as a pure function
 *
 * Coverage: AC2, AC3, AC4, AC5, AC6, AC7, AC9, AC10 / FR2-FR6, FR9
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── test fixture ──────────────────────────────────────────────────────────────
const sampleProducts = [
  { id: 1, name: 'Laptop',      price: 55999, image: '💻' },
  { id: 2, name: 'Headphones',  price: 2999,  image: '🎧' },
  { id: 3, name: 'Keyboard',    price: 1499,  image: '⌨️' },
  { id: 4, name: 'Mouse',       price: 899,   image: '🖱️' },
  { id: 5, name: 'Blue Shirt',  price: 999,   image: '👕' },
  { id: 6, name: 'Shoes',       price: 2499,  image: '👟' },
];

// ── harness setup ─────────────────────────────────────────────────────────────
let filterProductsByName;

beforeAll(() => {
  // Path from src/test/js/ up to src/main/resources/static/index.html
  const htmlPath = path.resolve(__dirname, '../../main/resources/static/index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    beforeParse(window) {
      // Mock window.fetch so the inline script's fetch('/api/products') call resolves
      // without a network request; filterProductsByName is defined synchronously so
      // it is available immediately after the script block executes.
      window.fetch = () =>
        Promise.resolve({ json: () => Promise.resolve([]) });
    },
  });

  filterProductsByName = dom.window.filterProductsByName;
});

// ── test suite ────────────────────────────────────────────────────────────────
describe('filterProductsByName', () => {

  // AC4, FR5: empty search term → full list
  it('returns all products when search term is an empty string', () => {
    const result = filterProductsByName(sampleProducts, '');
    expect(result).toEqual(sampleProducts);
  });

  // AC5, FR4: 1 character → below 2-char threshold → full list
  it('returns all products when search term is exactly 1 character (threshold not met)', () => {
    const result = filterProductsByName(sampleProducts, 'L');
    expect(result).toEqual(sampleProducts);
  });

  // AC2, FR2: 2-char prefix match (lowercase input)
  it('filters by 2-character prefix match using lowercase input', () => {
    const result = filterProductsByName(sampleProducts, 'la');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Laptop');
  });

  // AC3, FR3: case-insensitive — uppercase input matches mixed-case name
  it('filters case-insensitively (uppercase input)', () => {
    const result = filterProductsByName(sampleProducts, 'LA');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Laptop');
  });

  it('filters case-insensitively (mixed-case input)', () => {
    const result = filterProductsByName(sampleProducts, 'La');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Laptop');
  });

  // AC7, FR6: whitespace trimming
  it('trims leading whitespace before matching ("  la" matches Laptop)', () => {
    const result = filterProductsByName(sampleProducts, '  la');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Laptop');
  });

  it('trims trailing whitespace before matching ("la  " matches Laptop)', () => {
    const result = filterProductsByName(sampleProducts, 'la  ');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Laptop');
  });

  it('returns all products when term is whitespace-only (trimmed length is 0)', () => {
    const result = filterProductsByName(sampleProducts, '   ');
    expect(result).toEqual(sampleProducts);
  });

  // AC6, FR7: no match → empty array
  it('returns an empty array when no products match the search term', () => {
    const result = filterProductsByName(sampleProducts, 'xyz');
    expect(result).toHaveLength(0);
  });

  // AC10, FR2: prefix-only — "irt" is not a prefix of "Shirt" → no match
  it('does not match a substring that is not a prefix ("irt" does not match Shirt)', () => {
    const result = filterProductsByName(sampleProducts, 'irt');
    expect(result).toHaveLength(0);
  });

  // AC10: "shirt" is not a prefix of "Blue Shirt" → no match
  it('does not match "shirt" against "Blue Shirt" (starts-with check, not substring)', () => {
    const result = filterProductsByName(sampleProducts, 'shirt');
    expect(result).toHaveLength(0);
  });

  // AC9, FR9: clearing to empty string restores full list
  it('restores full product list when search term is cleared to empty string', () => {
    const filtered = filterProductsByName(sampleProducts, 'la');
    expect(filtered).toHaveLength(1);           // narrowed first

    const cleared = filterProductsByName(sampleProducts, '');
    expect(cleared).toEqual(sampleProducts);    // then restored
  });

  // Boundary: empty products array
  it('returns an empty array when the products list is empty', () => {
    const result = filterProductsByName([], 'la');
    expect(result).toHaveLength(0);
  });

  // Boundary: undefined rawSearchTerm handled gracefully
  it('handles undefined rawSearchTerm gracefully (returns all products)', () => {
    const result = filterProductsByName(sampleProducts, undefined);
    expect(result).toEqual(sampleProducts);
  });

  // Boundary: null rawSearchTerm handled gracefully
  it('handles null rawSearchTerm gracefully (returns all products)', () => {
    const result = filterProductsByName(sampleProducts, null);
    expect(result).toEqual(sampleProducts);
  });

  // Multiple matches
  it('returns multiple products when several names share the same prefix', () => {
    const result = filterProductsByName(sampleProducts, 'h');  // 1 char → full list
    expect(result).toEqual(sampleProducts);

    const result2 = filterProductsByName(sampleProducts, 'he'); // 2 chars → Headphones
    expect(result2).toHaveLength(1);
    expect(result2[0].name).toBe('Headphones');
  });
});
