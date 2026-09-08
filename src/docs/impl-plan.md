# Implementation Plan: Product Search by Name

**Feature**: Client-side product search by name (prefix match, debounced)
**Jira**: EPMCDMETST-62766
**Branch**: feature/searchbox
**Date**: 2026-09-08
**Status**: Draft — pending user approval before implementation begins

---

## Overview

This plan covers the implementation of a client-side product search box layered onto the existing
storefront `src/main/resources/static/index.html`. All work is confined to that single HTML file
(plus a new `package.json` for Vitest) — no backend changes are made.

The implementation has three natural phases:

1. **Core logic functions** (`debounce`, `filterProductsByName`, `renderProducts` refactor) —
   pure or near-pure functions that carry no DOM risk and can be developed and tested independently.
2. **UI integration** — the `<input>` element, its CSS class, and the Search Controller that wires
   the three core functions together in an event pipeline.
3. **Tests and acceptance** — Vitest unit tests for the Filter Engine and manual AC1–AC10 smoke tests.

The render-callback refactor (T04) is the only task that touches existing behavior; it must be
smoke-tested before any search logic is layered on top (per design-review Recommendation R1).

---

## Assumptions

- A1: The storefront already loads the full product catalog into the browser at page load via
  `fetch('/api/products')`. No new backend endpoint is added.
- A2: All JavaScript and CSS remain inline in `index.html`; no separate `.js` or `.css` files are
  introduced (finalized decision, architecture.md Section 2).
- A3: Vitest is introduced as a **dev-only** dependency via a new top-level `package.json`; it has
  no effect on the production `index.html` or the Spring Boot runtime.
- A4: The Vitest test loads `index.html` via `jsdom` with script execution enabled, then calls the
  globally exposed `filterProductsByName` function directly — keeping `index.html` as the single
  source of truth (architecture.md Section 7).
- A5: The existing cart `render()` function name is already in use; the new product-grid render
  function is named `renderProducts(list)` to avoid collision (confirmed by design review).
- A6: The `add(id)` onclick attributes are regenerated fresh on each `#products.innerHTML`
  reassignment, so no event-listener-loss risk exists after the refactor (confirmed in design review
  by inspecting `index.html`).

---

## Task Breakdown

---

### T01 — Initialize Vitest test infrastructure

**Description**
Create a top-level `package.json` declaring `vitest` and `jsdom` as dev-dependencies and adding a
`test` npm script (e.g., `vitest run`). No source code or test files are written in this task —
this task only establishes the toolchain so T09 can use it.

**Satisfies**: NFR4 (testability infrastructure)

**Acceptance Criteria**
- `package.json` exists at the project root with `vitest` and `jsdom` in `devDependencies`.
- Running `npm install` completes without error.
- Running `npm test` (with no test files yet) exits without crashing the runner.
- No new runtime dependency is introduced (devDependencies only).

**Dependencies**: None

**Effort**: S

**Priority**: P2

---

### T02 — Implement debounce(fn, delayMs) utility function

**Description**
Add a small, self-contained `debounce(fn, delayMs)` higher-order function inline in `index.html`'s
`<script>` block. Implementation: trailing-edge only, using `setTimeout` / `clearTimeout`. No
leading-edge or cancel-on-unmount handling is needed. Target: ~5 lines. Expose as a module-level
function (global in the inline script scope).

**Satisfies**: FR8 (200ms debounce), AC8

**Acceptance Criteria**
- `debounce(fn, 200)` returns a function that calls `fn` only after 200ms of inactivity.
- Rapid successive calls cancel the previous pending invocation and restart the timer.
- Implemented inline in `index.html`; no external library added.

**Dependencies**: None (independent, can be written in parallel with T03 and T04)

**Effort**: S

**Priority**: P1

---

### T03 — Implement filterProductsByName(products, rawSearchTerm) pure function

**Description**
Add the Filter Engine pure function inline in `index.html`'s `<script>` block. The function must:
1. Trim `rawSearchTerm` (FR6).
2. If trimmed length is 0 or 1, return `products` unchanged (FR4, FR5).
3. Otherwise, return `products.filter(p => p.name.toLowerCase().startsWith(trimmed.toLowerCase()))` (FR2, FR3, FR10).
4. Accept no other arguments; perform no DOM access; return a new array.

The function must be exposed as a named global (`window.filterProductsByName` or equivalent) so the
Vitest/jsdom test harness can invoke it directly (architecture.md Section 7).

**Satisfies**: FR2, FR3, FR4, FR5, FR6, FR9; AC2, AC3, AC4, AC5, AC7, AC9, AC10

**Acceptance Criteria**
- `filterProductsByName([], "sh")` returns `[]`.
- `filterProductsByName(products, "")` returns full `products` array (empty string case).
- `filterProductsByName(products, "s")` returns full `products` array (1-char, below threshold).
- `filterProductsByName(products, "sh")` returns only products whose name starts with "sh" (case-insensitive).
- `filterProductsByName(products, "  sh  ")` trims whitespace before matching.
- `filterProductsByName(products, "irt")` does NOT match "Shirt" (prefix-only, not substring).
- Function is a pure function — no global state mutations, no DOM calls.

**Dependencies**: None (independent, can be written in parallel with T02 and T04)

**Effort**: S

**Priority**: P1

---

### T04 — Extract renderProducts(list) from existing inline fetch callback

**Description**
Refactor the existing anonymous product-render logic inside the `.then(d => { ... })` callback into
a named `renderProducts(list)` function. This is a **pure extraction** — the existing
`d.map(p => \`<div class=card>...\`).join('')` template string is moved verbatim into
`renderProducts`; no logic is changed or rewritten yet. The `.then()` callback then calls
`renderProducts(d)`.

The existing cart `render()` function is untouched. The new function name `renderProducts` must not
conflict with the existing `render` function name (confirmed distinct names).

This task is the single highest-risk change to existing behavior (NFR5). After completing this task,
perform a quick manual smoke test of the cart add and checkout flow before T05 is started (design
review Recommendation R1).

**Satisfies**: NFR5 (foundation for safe render reuse), FR2 (re-render path for filtered results)

**Acceptance Criteria**
- A named `renderProducts(list)` function exists in the inline `<script>`.
- The `.then()` callback calls `renderProducts(products)` and produces identical HTML output to the
  previous inline implementation.
- Initial page load still displays all products correctly.
- Add-to-cart buttons on all product cards still function after the refactor (onclick handlers
  regenerated correctly on each innerHTML reassignment).
- Checkout flow (total, alert) behaves identically to before the refactor.
- No visual or behavioral difference from the pre-refactor page (pixel-for-pixel equivalent initial render).

**Dependencies**: None (independent of T02, T03; can be written in parallel with them)

**Effort**: S

**Priority**: P1

---

### T05 — Add "No products found" handling to renderProducts

**Description**
Extend `renderProducts(list)` from T04 with a guard: if `list` is empty, set `#products.innerHTML`
to a "No products found" message element instead of product cards (FR7). The message text must be
exactly "No products found". The existing behavior when `list` is non-empty is unchanged.

**Satisfies**: FR7; AC6

**Acceptance Criteria**
- When `renderProducts([])` is called, `#products` contains a visible "No products found" message.
- When `renderProducts(nonEmptyList)` is called, `#products` contains product cards (no change from T04).
- The "No products found" text is static — it does not echo any user input (confirmed XSS-safe in design review Section 3).

**Dependencies**: T04 (renderProducts must exist before it can be extended)

**Effort**: S

**Priority**: P1

---

### T06 — Add Search Input HTML element above the product grid

**Description**
Add an `<input type="text" id="search-input" placeholder="Search products...">` (or equivalent)
element to the HTML markup of `index.html`, placed above the `<div class="grid" id="products">`.
The element must have an accessible label (either a `<label>` element or an `aria-label` attribute)
per standard semantic HTML (A7 in requirements.md). Assign a CSS class (e.g., `search`) so T07
can style it.

**Satisfies**: FR1; AC1

**Acceptance Criteria**
- The search input is visible on the storefront page above the product grid.
- The element has a meaningful accessible label (or placeholder text meeting A7).
- The element is assigned a CSS class that T07 will target for styling.
- The element has an `id` attribute the Search Controller (T08) will bind to.
- No existing layout or product-grid elements are displaced or broken.

**Dependencies**: None (independent; can be written in parallel with T02, T03, T04)

**Effort**: S

**Priority**: P1

---

### T07 — Add CSS styling for the search input

**Description**
Add CSS rules for the search input inside the existing inline `<style>` block in `index.html`.
Style using the same design tokens already in use: `font-family: Arial`, the existing purple
gradient palette (`#667eea`), `border-radius`, `padding`, and `box-shadow` values consistent with
`.card` and `button` elements. Target: a `.search` rule (or the id selector matching T06's element).
The input should span the available width above the product grid and be visually distinct from body
text but cohesive with the existing card/button aesthetics.

**Satisfies**: FR10; AC1 (styled consistently)

**Acceptance Criteria**
- The search input is visually consistent with the existing card and button styling (font, border-radius, color palette).
- The search input is comfortably sized and does not overflow its container.
- No existing CSS rules are modified or overridden in an unintended way.

**Dependencies**: T06 (the element must exist; the CSS class from T06 is targeted here)

**Effort**: S

**Priority**: P2

---

### T08 — Implement Search Controller (event listener + pipeline wiring)

**Description**
Add the Search Controller inline in `index.html`'s `<script>` block after the DOM and product
catalog are ready. The controller must:
1. Obtain a reference to the search input element (by the `id` set in T06).
2. Create a debounced handler using `debounce()` (T02): on each invocation, read the current
   input value, call `filterProductsByName(products, value)` (T03), and pass the result to
   `renderProducts(result)` (T04/T05).
3. Attach the debounced handler to the input element's `input` event.
4. Ensure `products` (the module-level array populated by the fetch callback) is always read at
   invocation time, not captured at handler-creation time, so a race with page load is handled
   gracefully (design review Section 5 note: if search fires before fetch resolves, `products` is
   `[]`, Filter Engine returns `[]`, and Render Engine shows "No products found" — acceptable
   per requirements.md Out of Scope).

**Satisfies**: FR2, FR3, FR4, FR5, FR8, FR9; AC2, AC3, AC4, AC5, AC8, AC9

**Acceptance Criteria**
- Typing 2+ characters into the search box filters the product grid to matching products (prefix, case-insensitive) after the 200ms debounce.
- Typing 0 or 1 characters shows the full, unfiltered product list.
- Typing rapidly does not re-filter on every keystroke; filtering fires once after 200ms of inactivity.
- Clearing the input restores the full product list.
- Add-to-cart and checkout flows continue to work correctly while a search term is active.

**Dependencies**: T02 (debounce), T03 (filterProductsByName), T04 (renderProducts), T05 (no-results handling), T06 (search input element)

**Effort**: M

**Priority**: P1

---

### T09 — Write Vitest unit tests for filterProductsByName

**Description**
Create a Vitest test file (e.g., `src/test/js/filterProductsByName.test.js`) that:
1. Loads `index.html` via `jsdom` (using Vitest's `jsdom` environment or an explicit `JSDOM` constructor
   with `runScripts: "dangerously"` as specified in architecture.md Section 7).
2. Reads the inline `<script>` tag's content from `index.html` and executes it in the `jsdom`
   context so `filterProductsByName` is available on the `window` / global object.
3. Writes one test case per acceptance criterion that exercises the Filter Engine:

   | Test case | Maps to |
   |---|---|
   | Empty search term returns all products | AC4, FR5 |
   | 1-character term returns all products (threshold not met) | AC5, FR4 |
   | 2-character prefix match, case-sensitive lower | AC2, FR2 |
   | 2-character prefix match, case-insensitive upper/mixed | AC3, FR3 |
   | Leading and trailing whitespace trimmed before match | AC7, FR6 |
   | No matching products returns empty array | AC6, FR7 |
   | Substring (not prefix) does not match | AC10, FR2 |
   | Clearing to empty restores full list (empty string edge) | AC9, FR9 |

**Satisfies**: NFR4

**Acceptance Criteria**
- All test cases pass when `npm test` is run.
- No test reads from or writes to the DOM beyond loading `index.html` for function extraction.
- Test file path follows the project structure (under `src/test/js/` or equivalent).
- Running `npm test` exits 0 (all pass).

**Dependencies**: T01 (Vitest installed), T03 (filterProductsByName implemented in index.html)

**Effort**: M

**Priority**: P2

---

### T10 — Acceptance smoke test against AC1–AC10

**Description**
Manually exercise the running application against every acceptance criterion in requirements.md
(AC1–AC10) and confirm each passes. Also perform the NFR5 regression check: verify that
add-to-cart and checkout behavior are identical to the pre-feature baseline after the
`renderProducts` refactor (design review Recommendation R1).

This task produces no code. Its output is a pass/fail table suitable for the Verification phase.

**Satisfies**: AC1–AC10, NFR5

**Acceptance Criteria**
- Each of AC1–AC10 is individually checked and marked pass.
- Add-to-cart button and checkout flow work correctly with a search term active and with no search term active.
- No console errors in browser DevTools during any of the above checks.

**Dependencies**: T04, T05, T06, T07, T08, T09 (all implementation tasks complete)

**Effort**: S

**Priority**: P2

---

## Dependency Order

1. T01 (Vitest setup) — no dependencies; start immediately
2. T02 (debounce) — no dependencies; start immediately
3. T03 (filterProductsByName) — no dependencies; start immediately
4. T04 (renderProducts extraction) — no dependencies; start immediately
5. T05 (no-results handling) — depends on T04
6. T06 (search input HTML) — no dependencies; start immediately
7. T07 (search input CSS) — depends on T06
8. T08 (Search Controller) — depends on T02, T03, T04, T05, T06
9. T09 (unit tests) — depends on T01, T03
10. T10 (acceptance smoke test) — depends on T04–T09

---

## Parallel Work Opportunities

The following tasks have no mutual dependencies and may be worked in any order or simultaneously:

- **Workstream A — Core Logic**: T02 (debounce), T03 (filterProductsByName), T04 (renderProducts
  extraction) may all be written in parallel since they are independent pure/near-pure functions.
- **Workstream B — UI Shell**: T06 (search input HTML) and T01 (Vitest setup) may be worked in
  parallel with Workstream A.
- **Workstream C — Tests**: T09 (unit tests) may begin as soon as T01 and T03 are done, independent
  of T04–T08.
- T07 (CSS) and T05 (no-results handling) can each be worked as soon as their single predecessor is
  done, without waiting for any other task.

The only hard sequential gate is T08 (Search Controller), which requires T02, T03, T04, T05, and
T06 all complete before it can be wired up.

---

## Blocked Tasks

| Task | Blocked By | Reason |
|---|---|---|
| T05 — no-results handling | T04 | Extends the function created in T04; cannot be added before the function exists |
| T07 — search input CSS | T06 | CSS class targets the HTML element introduced in T06 |
| T08 — Search Controller | T02, T03, T04, T05, T06 | Wires all five components; all must exist before the controller can bind events and call functions |
| T09 — unit tests | T01, T03 | Needs Vitest installed (T01) and the function under test implemented (T03) |
| T10 — acceptance smoke test | T04, T05, T06, T07, T08, T09 | Requires a fully functional, styled, and tested feature |

---

## Milestones

### M1 — Test Infrastructure Setup

Stand up the Vitest dev-dependency so automated tests can run.

| Task | Priority | Effort |
|---|---|---|
| T01 — Initialize Vitest test infrastructure | P2 | S |

Completion gate: `npm install` and `npm test` succeed (no test files needed yet).

---

### M2 — Core Logic Functions

Implement the three pure / near-pure functions that carry the feature logic. These can be written
and reviewed before any UI element exists.

| Task | Priority | Effort |
|---|---|---|
| T02 — debounce utility | P1 | S |
| T03 — filterProductsByName pure function | P1 | S |
| T04 — renderProducts extraction (refactor) | P1 | S |

Completion gate: T04 smoke-tested manually (cart add + checkout work correctly after refactor) before
proceeding. This is the explicit check from design-review Recommendation R1.

---

### M3 — Render Engine Extension and UI Integration

Extend the render function with empty-list handling, add the HTML element and its styling, then wire
everything together in the Search Controller.

| Task | Priority | Effort |
|---|---|---|
| T05 — no-results handling in renderProducts | P1 | S |
| T06 — search input HTML element | P1 | S |
| T07 — search input CSS styling | P2 | S |
| T08 — Search Controller (event + pipeline wiring) | P1 | M |

Completion gate: Search box is visible, functional, and correctly filters products in a live browser
session before tests are run.

---

### M4 — Tests and Acceptance Verification

Write and run automated unit tests; perform full acceptance check against AC1–AC10.

| Task | Priority | Effort |
|---|---|---|
| T09 — Vitest unit tests for filterProductsByName | P2 | M |
| T10 — Manual acceptance smoke test (AC1–AC10) | P2 | S |

Completion gate: `npm test` exits 0; all AC1–AC10 manually verified pass.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| renderProducts refactor breaks add-to-cart onclick behavior | Low | High | Confirmed low-risk in design review (onclick attributes are regenerated on every innerHTML reassignment). Explicit smoke test at end of M2 (T04 completion gate) before any search logic is added. |
| filterProductsByName name collision with another global | Low | Medium | Only one render-related function named `renderProducts` is introduced; `debounce` and `filterProductsByName` are sufficiently distinct from existing `add`, `render`, `checkout` globals. Verify in browser console after T08. |
| jsdom script execution flag causes test-harness friction | Medium | Low | architecture.md Section 7 specifies `runScripts: "dangerously"` or equivalent; if jsdom version constraints arise, consult the Vitest `environment: 'jsdom'` option as an alternative that may handle inline scripts differently. |
| Vitest version mismatch with Node.js version on CI | Low | Low | Pin a specific Vitest version in package.json (e.g., `"vitest": "^1.0.0"`); document the minimum Node.js version in a README comment. |
| Pre-fetch race (search fires before /api/products resolves) | Very low | Low | Accepted as-is per requirements.md (no loading indicator in scope). Filter Engine returns `[]` and Render Engine shows "No products found" — acceptable degradation documented in design review Section 5. |

---

## FR and AC Coverage by Task

| Task | Functional Requirements | Acceptance Criteria |
|---|---|---|
| T01 | NFR4 (infra) | — |
| T02 | FR8 | AC8 |
| T03 | FR2, FR3, FR4, FR5, FR6, FR9 | AC2, AC3, AC4, AC5, AC7, AC9, AC10 |
| T04 | NFR5 | — |
| T05 | FR7 | AC6 |
| T06 | FR1 | AC1 |
| T07 | FR10 | AC1 (styled) |
| T08 | FR2, FR3, FR4, FR5, FR8, FR9 | AC2, AC3, AC4, AC5, AC8, AC9 |
| T09 | NFR4 | AC2–AC10 (automated) |
| T10 | NFR5 | AC1–AC10 (manual) |

---

## Suggested Implementation Sequence

The following sequence minimizes blocked time and surfaces NFR5 risk early:

1. T04 — Extract `renderProducts` (highest NFR5 risk; smoke-test immediately after)
2. T02 — Implement `debounce` (can overlap with T04 in practice)
3. T03 — Implement `filterProductsByName` (can overlap with T04/T02)
4. T01 — Set up Vitest (can overlap with T02–T04)
5. T05 — Extend `renderProducts` with no-results handling (unblocked as soon as T04 done)
6. T06 — Add search input HTML (can overlap with T02–T05)
7. T07 — Add search input CSS (immediately after T06)
8. T08 — Implement Search Controller (final wiring; all predecessors now done)
9. T09 — Write and run Vitest unit tests (T01 + T03 are done; run `npm test`)
10. T10 — Manual acceptance smoke test AC1–AC10 and NFR5 regression check
