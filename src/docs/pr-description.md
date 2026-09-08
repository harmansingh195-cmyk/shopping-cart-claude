# feat: add client-side product search box

**Branch**: `feature/searchbox` → `main`
**Jira**: [EPMCDMETST-62766](https://jiraeu.epam.com/browse/EPMCDMETST-62766)
**Date**: 2026-09-08

---

## Summary

Adds a debounced, client-side product search box above the product grid on the storefront page. Filtering operates entirely on the already-loaded in-memory product list — no new backend endpoint is introduced. Products are filtered by name prefix match (case-insensitive, 2-character minimum threshold, leading/trailing whitespace trimmed) with a 200ms debounce to avoid per-keystroke re-renders.

---

## Changes

| File | Description |
|------|-------------|
| `src/main/resources/static/index.html` | Add search input (styled, `aria-label`), `filterProductsByName` pure function, trailing-edge `debounce` utility, search controller wiring `renderProducts` refactor to eliminate duplicate render paths |
| `src/test/js/filterProductsByName.test.js` | 16 Vitest unit tests covering all ACs and boundary cases for the Filter Engine |
| `src/test/e2e/search.spec.js` | 7 Playwright E2E browser regression tests (AC1–AC3, AC5, AC6, AC9, NFR5) |
| `src/test/java/com/example/shop/controller/ProductControllerTest.java` | 4 Spring `@WebMvcTest` tests guarding NFR5 REST contract (added as regression guard) |
| `vitest.config.js` | Vitest configuration scoping `npm test` to `src/test/js/` |
| `package.json` | Dev-only dependencies: `vitest`, `jsdom`, `@playwright/test`; scripts `test` and `test:e2e` |
| `package-lock.json` | Lockfile for reproducible installs |
| `.gitignore` | New file: covers `target/`, `node_modules/`, `*.class`, `*.jar`, `playwright-report/`, `.playwright-mcp/`, IDE, and OS artifacts |
| `pom.xml` | Minor formatting fix |
| `src/docs/requirements.md` | SDLC artifact: requirements with ACs and traceability |
| `src/docs/architecture.md` | SDLC artifact: component architecture document |
| `src/docs/design-review.md` | SDLC artifact: design review findings |
| `src/docs/impl-plan.md` | SDLC artifact: dependency-ordered implementation plan |
| `src/docs/impl-done.md` | SDLC artifact: implementation completion notes |
| `src/docs/verification-report.md` | SDLC artifact: verification results (all PASS) |
| `src/docs/review-report.md` | SDLC artifact: code review results (READY FOR PR, no blockers) |
| `.claude/agents/` | Updated 04-impl-planner-agent.md, 05-implementation-agent.md, sdlc-agent.md |
| `.claude/hooks/guard_docs.py` | Updated SDLC hook |
| `.claude/settings.json` | Updated Claude Code settings |

---

## Testing

### Automated Tests

**Java (Maven):**
```
mvn test
```
Runs 4 `@WebMvcTest` tests in `ProductControllerTest`. Expected: 4/4 PASS.

**JavaScript (Vitest):**
```
npm test
```
Runs 16 Vitest unit tests against the `filterProductsByName` Filter Engine. Expected: 16/16 PASS.

### E2E Tests (requires app running on localhost:8080)

Start the application first:
```
mvn spring-boot:run
```

Then in a separate terminal:
```
npm run test:e2e
```
Runs 7 Playwright E2E tests covering DOM-level acceptance criteria and the NFR5 cart/checkout regression.

### Manual Smoke Test

1. Start the application: `mvn spring-boot:run`
2. Open `http://localhost:8080` in a browser
3. Confirm the search input is visible above the product grid
4. Type `la` — verify only "Laptop" is shown after ~200ms
5. Type `LA` (uppercase) — verify "Laptop" still shown (case-insensitive)
6. Type `l` (1 char) — verify all 4 products still shown (threshold not yet met)
7. Type `xyz` — verify "No products found" message appears
8. Clear the search box — verify all 4 products restored
9. Type `  la` (with leading spaces) — verify "Laptop" shown (whitespace trimmed)
10. Type `irt` — verify "No products found" (substring, not prefix — "Shirt" not matched from position 0)
11. Type `la`, add Laptop to cart, click Checkout — verify "Order placed successfully! Total ₹55999"

---

## Acceptance Criteria Checklist

- [x] AC1 — Search box is visible above the product grid, styled consistently, with `aria-label="Search products"`
- [x] AC2 — Typing 2+ characters filters to products whose name starts with the typed text (prefix match)
- [x] AC3 — Search is case-insensitive ("la", "LA", "La" all match "Laptop")
- [x] AC4 — Empty search (0 chars / whitespace-only) shows all products
- [x] AC5 — Typing only 1 character shows all products (threshold not met)
- [x] AC6 — No matching products shows "No products found" message
- [x] AC7 — Leading/trailing whitespace trimmed before matching
- [x] AC8 — 200ms trailing-edge debounce prevents per-keystroke re-filtering
- [x] AC9 — Clearing search restores full product list
- [x] AC10 — Prefix-only matching: "irt" does not match "Blue Shirt"

---

## Reviewer Checklist

- [ ] **Correctness**: Verify `filterProductsByName` prefix match and debounce wiring in `index.html` are correct
- [ ] **Accessibility**: Confirm `aria-label="Search products"` is present on the search `<input>` element
- [ ] **NFR5 (Compatibility)**: Confirm cart/checkout behavior is unaffected by active search; no existing REST contract changed
- [ ] **No new backend endpoints**: Confirm `ProductController.java` has no new routes; only `/api/products` exists
- [ ] **No new front-end framework**: Confirm `package.json` contains only dev-only test tooling (`vitest`, `jsdom`, `@playwright/test`)
- [ ] **`.gitignore` coverage**: Confirm `.gitignore` covers `target/`, `node_modules/`, `.playwright-mcp/`, `playwright-report/`, IDE, and OS artifacts
- [ ] **Test coverage**: Confirm unit tests (16 Vitest), integration tests (4 `@WebMvcTest`), and E2E tests (7 Playwright) all pass

---
