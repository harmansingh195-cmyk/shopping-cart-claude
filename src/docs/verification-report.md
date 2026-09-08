# Verification Report: Product Search by Name

**Feature**: Client-side product search box (prefix match, debounced)
**Branch**: feature/searchbox
**Date**: 2026-09-08
**Overall Verdict**: PASS

---

## Requirement Verified

The search box feature (FR1–FR10, AC1–AC10, NFR1–NFR5) as specified in `src/docs/requirements.md`
was verified against the implementation in `src/main/resources/static/index.html` and associated
test files. All acceptance criteria passed.

---

## Automated Test Results

### Maven (Java) — `mvn test`

| Metric | Value |
|--------|-------|
| Command | `mvn test` |
| Exit code | 0 |
| Total | 4 |
| Passed | 4 |
| Failed | 0 |
| Skipped | 0 |
| Test class | `com.example.shop.controller.ProductControllerTest` |

Tests cover: non-empty product list returned, required fields populated (`id`, `name`, `price`, `image`),
`GET /api/products` returns HTTP 200 with JSON array of length 4, first product is Laptop at ₹55999
(NFR5 regression).

### Maven Build — `mvn clean package`

| Metric | Value |
|--------|-------|
| Command | `mvn clean package -q` |
| Exit code | 0 |
| Outcome | BUILD SUCCESS |

### Vitest (JavaScript) — `npm test`

| Metric | Value |
|--------|-------|
| Command | `npm test` (runs `vitest run`) |
| Exit code | 0 |
| Config | `vitest.config.js` scopes collection to `src/test/js/**/*.test.js` |
| Test file | `src/test/js/filterProductsByName.test.js` |
| Total | 16 |
| Passed | 16 |
| Failed | 0 |
| Duration | ~1.7s |

| Test Name | AC/FR Covered |
|-----------|---------------|
| returns all products when search term is empty string | AC4, FR5 |
| returns all products when search term is exactly 1 character | AC5, FR4 |
| filters by 2-character prefix match (lowercase) | AC2, FR2 |
| filters case-insensitively (uppercase) | AC3, FR3 |
| filters case-insensitively (mixed-case) | AC3, FR3 |
| trims leading whitespace before matching | AC7, FR6 |
| trims trailing whitespace before matching | AC7, FR6 |
| returns all products when term is whitespace-only | AC4, FR5, FR6 |
| returns empty array when no products match | AC6, FR7 |
| does not match a substring that is not a prefix ("irt" vs "Shirt") | AC10, FR2 |
| does not match "shirt" against "Blue Shirt" | AC10, FR2 |
| restores full product list when search term is cleared | AC9, FR9 |
| returns empty array when products list is empty | boundary |
| handles undefined rawSearchTerm gracefully | boundary |
| handles null rawSearchTerm gracefully | boundary |
| returns multiple products sharing same prefix (multiple-match case) | AC2, FR2 |

---

## Application Health Check

### Startup

| Check | Result |
|-------|--------|
| Command | `mvn spring-boot:run` (background) |
| Startup time | Under 3 seconds |
| Outcome | SUCCESS — application responsive on http://localhost:8080 |
| Console errors (browser) | 1 error: `GET /favicon.ico 404` — non-critical, pre-existing |

### Endpoints

| Endpoint | Method | Status Code | Outcome |
|----------|--------|-------------|---------|
| `/` | GET | 200 | PASS — serves index.html with search input |
| `/api/products` | GET | 200 | PASS — `application/json`, array of 4 products |

`/api/products` confirmed: Laptop (₹55999), Headphones (₹2999), Keyboard (₹1499), Mouse (₹899).
No new search-related backend endpoint introduced (NFR2 verified).

---

## Browser Acceptance Checks (Playwright MCP)

| AC | Action | Expected | Result |
|----|--------|----------|--------|
| AC1 | Navigate to http://localhost:8080 | Search input visible above product grid with `aria-label` | PASS |
| AC2 | Type "la" | Only Laptop shown | PASS |
| AC3 | Type "LA" (uppercase) | Laptop still shown | PASS |
| AC4 | Clear input to "" | All 4 products shown | PASS |
| AC5 | Type "l" (1 char) | All 4 products shown (threshold not met) | PASS |
| AC6 | Type "xyz" | "No products found" message shown | PASS |
| AC7 | Type "  la" (leading spaces) | Laptop shown (whitespace trimmed) | PASS |
| AC8 | Code inspection | `debounce(fn, 200)` trailing-edge in `index.html`; Search Controller wired through debounced handler | PASS |
| AC9 | Clear from "xyz" | All 4 products restored | PASS |
| AC10 | Type "irt" (substring, not prefix) | "No products found" shown | PASS |
| NFR5 | Add Laptop to cart while "la" is active; click Checkout | Alert: "Order placed successfully! Total ₹55999" | PASS |

---

## Acceptance Criteria Coverage

| Criterion | Description | Result | Evidence |
|-----------|-------------|--------|----------|
| AC1 | Search input visible above product grid, styled consistently | PASS | `textbox "Search products"` with `aria-label`; `.search` CSS rules present |
| AC2 | 2+ chars filter by prefix match | PASS | Browser: "la" → Laptop only; Vitest: 2-char prefix test |
| AC3 | Case-insensitive matching | PASS | Browser: "LA" → Laptop; Vitest: uppercase and mixed-case tests |
| AC4 | Empty search shows all products | PASS | Browser: clear → 4 cards; Vitest: empty string test |
| AC5 | Single char shows all products (threshold not met) | PASS | Browser: "l" → 4 cards; Vitest: 1-char threshold test |
| AC6 | No matching products shows "No products found" | PASS | Browser: "xyz" → message; Vitest: empty-result test |
| AC7 | Leading/trailing whitespace trimmed | PASS | Browser: "  la" → Laptop; Vitest: whitespace trim tests |
| AC8 | 200ms debounce | PASS | Code inspection of `debounce(fn, 200)` implementation |
| AC9 | Clearing search restores full product list | PASS | Browser: clear → 4 cards; Vitest: clear-to-empty test |
| AC10 | Prefix-only match — substring not at position 0 does not match | PASS | Browser: "irt" → no results; Vitest: prefix-only tests |

---

## Non-Functional Requirements

| NFR | Requirement | Result | Evidence |
|-----|-------------|--------|----------|
| NFR1 | Filtering < 50ms for tens of products | PASS | 16 filter tests completed in ~125ms total; in-browser filter visually instant |
| NFR2 | No new backend endpoint | PASS | No new routes in `ProductController.java`; API test confirms only `/api/products` |
| NFR3 | Plain HTML/CSS/JS — no new front-end framework | PASS | `index.html` uses vanilla JS and inline CSS; `package.json` is dev-only |
| NFR4 | Filter logic in testable pure function | PASS | `filterProductsByName` globally exposed; 16 Vitest tests pass |
| NFR5 | No existing behavior broken | PASS | Maven 4/4 pass; cart and checkout work correctly with and without active search |

---

## Deviations

1. **Debounce delay**: requirements.md FR8 specifies 200ms; implementation uses 200ms. Correct.
2. **Java tests not in impl-plan**: `ProductControllerTest.java` (4 tests) was added as an NFR5 regression guard. Positive addition.
3. **AC8 debounce not browser-exercisable via `fill()`**: Playwright `fill()` populates atomically. Debounce verified by code inspection of the trailing-edge `debounce(fn, 200)` implementation.

---

## Verification Summary

| Item | Status |
|------|--------|
| Maven build (`mvn clean package`) | PASS — exit 0 |
| Maven tests (`mvn test`) | PASS — 4/4 |
| Vitest JS tests (`npm test`) | PASS — 16/16 |
| Application startup | PASS — responsive in < 3s |
| `GET /` | PASS — 200 |
| `GET /api/products` | PASS — 200, 4 products |
| AC1–AC10 | PASS — all 10 |
| NFR1–NFR5 | PASS — all 5 |

**Overall Verdict: PASS**

All 10 acceptance criteria and all 5 non-functional requirements are met. The search box feature is
ready for code review and PR.
