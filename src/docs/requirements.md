# Requirements: Product Search by Name

## Source
- Jira issue: [EPMCDMETST-62766](https://jiraeu.epam.com/browse/EPMCDMETST-62766)
- Type: Story | Priority: Low | Status: Open
- Reporter: Harman Singh
- Clarifying questions posted as Jira comment id 15897960; confirmed answers recorded as Jira follow-up comment id 15897989.

## Overview
As a shopper browsing the storefront, I want to search products by name so that I can quickly find the products I'm looking for without scrolling through the entire catalog. Search is implemented as client-side filtering of the product list already loaded into the browser via the existing product REST endpoint — no new backend search API is introduced.

## Assumptions
- A1: The storefront already loads the full product catalog into the browser on page load via an existing REST endpoint; no server-side search/query capability is required for this feature.
- A2: The catalog size is small (tens of products), so client-side filtering has negligible performance impact and does not require virtualization or pagination.
- A3: Only the product "name" field is searched; description, category, and SKU/ID are out of scope for matching.
- A4: There is no existing filter, sort, or pagination feature on the product grid that search needs to compose with.
- A5: The search term is transient UI state only — it is not persisted to the URL, localStorage, or any backend, and resets on page refresh.
- A6: No explicit clear ("X") button is required; users clear the search by deleting the typed text.
- A7: No additional accessibility requirements beyond standard semantic HTML (e.g., a labeled `<input>`) apply beyond what the existing storefront UI already follows.

## Functional Requirements
- FR1: A search input (search box) shall be displayed above the product grid on the storefront page.
- FR2: As the user types into the search box, the product grid shall filter to show only products whose name starts with the typed text (prefix match), once the minimum character threshold (FR4) is met.
- FR3: The search match shall be case-insensitive (e.g., typing "sh" matches "Shirt" and "shoes").
- FR4: Filtering shall only activate once the (trimmed) search input contains 2 or more characters. Below this threshold, the full product list shall be shown.
- FR5: When the search input is empty (0 characters, after trimming), the full, unfiltered product list shall be displayed.
- FR6: Leading and trailing whitespace in the search input shall be trimmed before matching; the trimmed value is used to evaluate the 2-character threshold (FR4) and the prefix match (FR2).
- FR7: If no products match the current search term, the product grid area shall display a "No products found" message in place of product cards.
- FR8: Filtering input shall be debounced by 200ms so that filtering is not re-evaluated on every keystroke faster than that interval.
- FR9: Clearing the search box (deleting all typed text) shall restore the full product list (equivalent to FR5); no dedicated clear button is required.
- FR10: The search box shall be styled consistently with the existing storefront UI (matching current fonts, colors, spacing conventions).

## Non-Functional Requirements
- NFR1 (Performance): Filtering shall complete and re-render within a perceptibly instant time (target < 50ms) for catalogs of tens of products, given the 200ms debounce already smooths keystroke-driven work.
- NFR2 (Client-only): No new backend endpoint, database query, or network round-trip shall be introduced for search; filtering operates entirely on already-loaded, in-memory product data in the browser.
- NFR3 (Maintainability): Search logic shall be implemented using the existing plain HTML/CSS/JavaScript patterns already used in the storefront frontend, without introducing a new front-end framework or library.
- NFR4 (Testability): Search filtering logic (trim, threshold check, case-insensitive prefix match, empty/no-results handling) shall be structured so it can be exercised by automated tests.
- NFR5 (Compatibility): The feature shall not change or break any existing REST API contract or existing storefront behavior (e.g., initial page load, product rendering).

## Acceptance Criteria (Given/When/Then)

**AC1 — Search box is displayed**
- Given a shopper loads the storefront page
- When the page finishes rendering
- Then a search input box is visible above the product grid, styled consistently with the rest of the storefront UI.

**AC2 — Products filter as user types (prefix match)**
- Given the storefront page has loaded with its full product catalog
- When the shopper types 2 or more characters into the search box that match the start of one or more product names
- Then, after the 200ms debounce, the product grid updates to show only products whose name starts with the typed text.

**AC3 — Search is case-insensitive**
- Given a product named "Shirt" exists in the catalog
- When the shopper types "sh", "SH", or "Sh" into the search box
- Then the product "Shirt" is included in the filtered results in all cases.

**AC4 — Empty search shows all products**
- Given the shopper has an empty search box (no characters, or only whitespace)
- When the product grid is rendered or re-rendered
- Then all products in the catalog are displayed, unfiltered.

**AC5 — Minimum character threshold**
- Given the shopper types only 1 character into the search box
- When the debounce interval elapses
- Then the product grid continues to show the full, unfiltered product list (filtering does not activate below 2 characters).

**AC6 — No matching products**
- Given the shopper types 2 or more characters that do not match the start of any product name
- When the debounce interval elapses and filtering runs
- Then the product grid displays a "No products found" message instead of product cards.

**AC7 — Whitespace trimming**
- Given the shopper types "  sh" (with leading spaces) or "sh  " (with trailing spaces) into the search box
- When filtering runs
- Then the input is trimmed before evaluation, and results match as if "sh" were typed (leading/trailing whitespace does not prevent or alter matching).

**AC8 — Debounce behavior**
- Given the shopper types multiple characters in rapid succession (faster than 200ms apart)
- When the shopper is still actively typing
- Then the product grid does not re-filter on every keystroke; filtering is evaluated only after 200ms has elapsed since the last keystroke.

**AC9 — Clearing search restores full list**
- Given the shopper has an active search term with filtered results showing
- When the shopper deletes all typed text from the search box
- Then the product grid returns to showing the full, unfiltered product list (per AC4).

**AC10 — Prefix-only matching (not substring)**
- Given a product named "Blue Shirt" exists in the catalog
- When the shopper types "shirt" (which appears mid-name, not as a prefix)
- Then "Blue Shirt" is NOT included in the filtered results, since matching is prefix-based ("starts with"), not substring-based.

## Out of Scope
- Backend/server-side search API or database query changes.
- Searching fields other than product name (e.g., description, category, SKU/ID).
- Substring or fuzzy/typo-tolerant matching (only prefix "starts with" matching is in scope).
- An explicit clear/"X" button on the search box.
- Persisting the search term across page reloads, in the URL, or in localStorage.
- Integration with any product filter, sort, or pagination feature (none currently exist on this page).
- Accessibility enhancements beyond standard semantic HTML (e.g., no ARIA live-region announcements for result counts).
- Highlighting matched text within product names.
- Search analytics/telemetry.

## Traceability Notes
- FR1, FR10 -> AC1
- FR2, FR3 -> AC2, AC3, AC10
- FR4 -> AC5
- FR5, FR9 -> AC4, AC9
- FR6 -> AC7
- FR7 -> AC6
- FR8 -> AC8
