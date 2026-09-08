# Design Review: Product Search by Name

## Source
- Jira issue: EPMCDMETST-62766
- Reviewed artifacts: `src/docs/requirements.md`, `src/docs/architecture.md`
- Reviewer role: Senior Architect / Principal Engineer (Design Review phase, SDLC Phase 3)
- Also inspected: `src/main/resources/static/index.html` (current production markup/script) to validate refactor-risk claims empirically rather than by inspection of the architecture doc alone.

## Verdict

**Approved with minor follow-ups.**

The architecture is well-scoped, correctly bounded to the client, and traces cleanly to every FR/NFR/AC in requirements.md. One genuine gap was found — the Vitest testing approach did not specify a concrete, workable mechanism for unit-testing a function that lives only inside an inline `<script>` in `index.html` — and has been fixed directly in `architecture.md` (see "Architecture.md Update Made" below). No other blocking issues were found. Two items below are recommended, non-blocking follow-ups for the Implementation Planning phase.

The two decisions the user already confirmed (inline JS/CSS placement, Vitest as the test runner) are treated as final and are not re-opened here; they are evaluated only for residual risk/soundness, not reversed.

---

## 1. Functional Coverage

| Requirement | Architecture Coverage | Status |
|---|---|---|
| FR1, FR10 (search box, styled consistently) | Search Input component, Technology Choices row "Styling" | Covered |
| FR2, FR3 (prefix, case-insensitive) | Filter Engine responsibilities + Data Flow step 6 (`toLowerCase().startsWith(...)`) | Covered |
| FR4 (2-char threshold) | Filter Engine: "If trimmed length < 2, return full array" | Covered |
| FR5 (empty -> full list) | Same code path as FR4 (threshold check subsumes empty case<br/>) | Covered |
| FR6 (trim) | Filter Engine step 1 | Covered |
| FR7 (no-results message) | Render Engine responsibility, Data Flow step 7 | Covered |
| FR8 (200ms debounce) | Search Controller + dedicated `debounce()` utility | Covered |
| FR9 (clear restores list) | Data Flow step 8, explicitly notes "no separate code path needed" | Covered |
| NFR1 (perf < 50ms) | Trade-offs section: full-array rescan justified against catalog size (A2) | Covered |
| NFR2 (client-only, no new endpoint) | Hard boundary stated in Section 2 and Component: ProductController (unchanged) | Covered |
| NFR3 (no framework/library churn) | Vanilla JS, hand-rolled debounce, plain CSS class | Covered |
| NFR4 (testable filter logic) | Pure `filterProductsByName(products, searchTerm)`, no DOM access | Covered, see Section 5 finding below on test harness mechanics |
| NFR5 (no regression to existing behavior) | `renderProducts` refactor reuses one render path; cart/checkout (`add`, `render`, `checkout`) explicitly called out as untouched | Covered, verified further below |
| AC1–AC10 | All map to Filter Engine / Render Engine / Search Controller behavior described in Data Flow | Covered — no AC is unaddressed |

**Traceability check**: requirements.md's own FR→AC table (Traceability Notes) is complete. Architecture.md does not restate an FR/AC→component matrix, but every FR is unambiguously attributable to exactly one component (Search Input, Search Controller, Filter Engine, or Render Engine). No missing features, journeys, or business rules were found. No gap here that blocks approval; see Recommendation R2 below for a low-cost improvement.

---

## 2. Architecture Quality

- **Separation of concerns**: Clean split — Search Input (presentation) → Search Controller (event/timing orchestration) → Filter Engine (pure data transform) → Render Engine (DOM). This is the right amount of layering for a single-page vanilla-JS feature; it is neither under- nor over-engineered.
- **Reuse over duplication**: The decision to refactor the existing inline render callback into a named `renderProducts(list)` function so both initial load and filtered re-render share one code path (Key Decision #4) is correct and is the single most important design choice protecting NFR5. Verified below.
- **No unnecessary complexity**: No state-management library, no virtual DOM, no framework — appropriately matches a "tens of products, one input box" scope. Good judgment against over-engineering.
- **Simplicity of debounce**: A hand-rolled `setTimeout`/`clearTimeout` debounce (trailing-edge only) is the correct minimal implementation for FR8/AC8 — it fires once, 200ms after the last keystroke, which is what "not re-evaluated on every keystroke faster than that interval" (FR8) requires. No leading-edge or cancel-on-unmount complexity is needed for a static page with no route changes.

**Verified regression risk against existing behavior (NFR5)** — I inspected `src/main/resources/static/index.html` directly rather than relying on the architecture doc's description:
- Product cards currently use inline `onclick=add(${p.id})` HTML attributes (not `addEventListener`), and the "Add To Cart" wiring is regenerated fresh every time `#products.innerHTML` is reassigned. This means re-rendering the grid via a shared `renderProducts()` function — called after every filter — carries **no event-listener-loss risk**; each re-render naturally re-creates working `onclick` handlers. This confirms Key Decision #4 is low-risk in practice, not just low-risk in theory.
- The existing cart functions (`add`, `render` for the cart panel, `checkout`) operate on separate global state (`cart`, `#items`, `#total`) that the Filter Engine/Render Engine refactor does not touch. No naming collision: the architecture's new `renderProducts()` is distinct from the existing cart `render()` function. This was confirmed by reading the current source, not assumed.
- Conclusion: the render-function refactor is sound and the regression risk against cart/checkout is low, provided the refactor is a pure extraction (i.e., the existing `d.map(...).join('')` template logic is moved verbatim into `renderProducts`, not rewritten). This should be an explicit acceptance check in Implementation/Verification (see Recommendation R1).

---

## 3. Security Review

- No authentication/authorization is required or introduced (public storefront, matches assumptions).
- No new attack surface: the Filter Engine never writes the user's search term back into the DOM (the "No products found" message is static text, not an echo of user input), so no reflected-XSS risk is introduced by this feature. The existing unescaped `${p.name}` interpolation in the product card template is a pre-existing pattern, not something this feature changes or worsens.
- No secrets, credentials, or new configuration are involved. NFR2's client-only boundary means no new API surface to secure.
- **Finding**: none blocking. Security posture is unchanged from the current app.

---

## 4. Performance Review

- NFR1 target (<50ms) is realistic for a full-array `.filter()` scan over "tens of products" (A2); no caching or indexing is warranted at this scale, and adding either would be over-engineering.
- Debounce (200ms) is correctly identified as the primary mechanism smoothing keystroke-driven work; the architecture correctly avoids incremental/narrowing-filter optimizations since they add complexity without a measurable benefit at this data size (documented trade-off, appropriately justified).
- No new network calls are introduced (NFR2), so there is no additional latency or backend load to consider.
- **Finding**: none. No performance concerns.

---

## 5. Reliability, Testing, and NFR4 Deep-Dive

This is the one area where a real gap was found.

**Debounce implementation**: sound, as discussed in Section 2. One edge case worth naming explicitly (not a defect, just documentation): if a user types before `fetch('/api/products')` resolves, `products` is still `[]`, so the Filter Engine will correctly return an empty array and the Render Engine will show "No products found" rather than a loading state. Requirements.md does not require a loading indicator (out of scope), so this is acceptable as-is — flagged only so it isn't mistaken for a bug during Verification.

**Filter Engine testability**: the pure-function design (`filterProductsByName(products, rawSearchTerm) -> filteredProducts`, no DOM access) is exactly right for NFR4 and maps directly to Vitest test cases (empty, 1-char, 2+-char prefix, case-insensitivity, whitespace, no-match, substring-not-prefix) as listed in architecture.md Section 7.

**Gap found — Vitest test-harness mechanism was underspecified**: architecture.md Section 7 previously said the Filter Engine would be "exposed in a form importable by a test file (e.g., via a small ES module export alongside the inline `<script>` in `index.html`, or a shared source snippet consumed by both)". Given the *already-finalized* decision to keep all JS inline in `index.html` (no extraction to a `.js` file), this description left an unresolved contradiction: Vitest runs in Node and cannot `import` a function that exists only inside an inline `<script>` block in an HTML file without an explicit loading mechanism, and "a shared source snippet consumed by both" risks two copies of the same logic silently drifting apart — which would undermine NFR4's intent (testing the *actual* shipped logic, not a parallel copy).

This does **not** require reopening the inline-JS decision. It requires specifying *how* a test harness reaches into the inline script without duplicating source. I resolved this by adding a concrete, single-source-of-truth mechanism to `architecture.md` (see below): the Vitest test loads `index.html` via `jsdom`, executes its inline `<script>` content in that DOM context (exactly as a browser would), and then invokes the resulting global `filterProductsByName` function directly. This keeps `index.html` the single source of truth, requires no build step, and needs no code extraction — fully consistent with both finalized decisions (inline JS, Vitest).

**Testing coverage beyond unit tests**: architecture.md correctly defers Playwright/E2E and manual AC1–AC10 verification to the Verification phase (Phase 6), which is appropriate scope for a design review, not a defect here. See Recommendation R1 for what to carry forward.

---

## 6. Non-Functional Requirements Summary

| NFR | Status | Notes |
|---|---|---|
| Security | N/A / no new surface | No auth, no new attack surface |
| Performance (NFR1) | Covered | <50ms target realistic for catalog size |
| Reliability | Covered, minor note | No loading-state requirement; edge case documented above, not a defect |
| Availability | N/A | Single static page, no HA requirement in requirements.md |
| Maintainability (NFR3) | Covered | Plain JS/CSS, no framework churn |
| Testability (NFR4) | Covered after fix | See Section 5 — architecture.md updated with concrete Vitest harness |
| Usability (FR10) | Covered | Styling consistency requirement addressed |
| Scalability | N/A | Explicitly out of scope per A2 (small catalog) |

---

## 7. Evaluation of the Two Finalized Decisions (confirmatory only, not reopened)

- **Inline JS/CSS, final**: No residual risk identified beyond the general (pre-existing, unchanged-by-this-feature) observation that `index.html` will grow slightly larger as a single file — consistent with current repo convention and explicitly accepted trade-off. No action needed.
- **Vitest, deliberate exception to "avoid unnecessary dependencies"**: Reasonable and well-scoped — confirmed dev-dependency-only, no production/runtime impact, directly justified by NFR4, and no lower-cost alternative exists for automating tests against extracted-but-not-extracted (inline) JS logic. The scoping is sound. The one implementation detail needed to make it actually work (how the test reaches the inline script) was missing and has been added — see Section 5 and the update below.

---

## Architecture.md Update Made

`src/docs/architecture.md` Section 7 ("Validation approach") has been updated to replace the vague "exposed in a form importable by a test file" language with a concrete mechanism: Vitest + `jsdom` loads `index.html`, executes its inline script in that DOM, and calls the resulting global `filterProductsByName` directly — no source duplication, no extraction, single source of truth preserved. This is the only change made to architecture.md; both previously-resolved decisions (inline JS/CSS, Vitest) are untouched.

---

## Recommendations (non-blocking, for Implementation Planning)

- **R1**: When implementing the `renderProducts` refactor, treat "byte-for-byte behavior parity with the current inline render callback" as an explicit acceptance check (e.g., a quick manual/Playwright smoke test of add-to-cart and checkout immediately after the refactor, before layering search on top) to make the NFR5 protection real, not just designed-for.
- **R2**: Carry the FR/AC → component mapping implicitly established in this review into the impl-plan.md task breakdown, so each task can cite the FR/AC it satisfies (useful for Verification phase traceability), even though it wasn't required as a standalone matrix in architecture.md.
