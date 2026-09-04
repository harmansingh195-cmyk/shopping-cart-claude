# Copilot Instructions

## Project context
- This repository is a Spring Boot 3.3.5 shopping cart demo using Java 17+ and Maven.
- The app serves a product catalog through REST endpoints and renders a modern storefront UI in the browser using plain HTML/CSS/JavaScript.
- Use the `src/docs` folder for generated SDLC artifacts such as `requirements.md`, `architecture.md`, `design-review.md`, `impl-plan.md`, `verification-report.md`, and `review-report.md`.

## Repository rules
- Keep changes small, focused, and reviewable.
- Prefer the simplest implementation that satisfies the requirement.
- Validate inputs at boundaries and handle errors consistently.
- Avoid unnecessary dependencies or framework churn.
- Do not add secrets, credentials, or sensitive configuration values to the repo.
- Update SDLC documentation when requirements, architecture, or implementation decisions change.
- Prefer existing project patterns over introducing new structure or abstractions.

## Coding expectations
- Maintain a clear separation between backend API behavior and frontend UI logic.
- Keep UI changes in the frontend assets that already serve the storefront; do not add overly complex front-end frameworks unless the requirement explicitly demands them.
- Prefer testable code and add automated tests for non-trivial logic and API behavior.
- If a feature changes behavior, update the relevant documentation and artifacts in `src/docs`.

## SDLC guidance
- The structured SDLC workflow is implemented as one orchestrator agent plus eight dedicated phase agents in `.github/agents/`, each pairing 1:1 with a skill in `.github/skills/`:

  | Phase           | Agent | Skill                                          |
  | 1. Requirements | `01-requirements-agent` | `01-requirements-clarifier` |
  | 2. Architecture | `02-architecture-agent` | `02-architecture-designer` |
  | 3. Design Review | `03-design-review-agent` | `03-design-reviewer` |
  | 4. Implementation Planning | `04-impl-planner-agent` | `04-impl-planner` |
  | 5. Implementation | `05-implementation-agent` | `05-implementation-driver` |
  | 6. Verification | `06-verification-agent` | `06-verification-writer` |
  | 7. Review | `07-code-review-agent` | `07-code-reviewer` |
  | 8. PR Creation | `08-pr-agent` | `08-pr-writer` |

- For the end-to-end SDLC flow, select or invoke `sdlc-agent`. It does not do phase work itself — it delegates each phase to the matching phase agent above (via the `agent` tool) and gates progress on completion/approval, one phase at a time.
- For a single phase in isolation, the corresponding phase agent can also be selected directly.
- Each phase agent follows its paired skill for detailed procedure and output format; keep skill usage scoped to the active phase, and do not jump ahead to implementation, verification, or PR steps before the required artifacts and approvals are complete.
- Treat skills as the domain knowledge/procedure for a phase, agents as the persona + tool access + delegation for that phase, and this file as project-wide standards that apply regardless of phase.

## Output preferences
- Provide Markdown ready to commit for docs.
- Provide code changes as diffs or full files when asked.
- When creating docs, use concise, implementation-ready language and include assumptions, trade-offs, and validation evidence.
- If a required external dependency or permission is unavailable, state the limitation clearly and continue with the safest fallback.