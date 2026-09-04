---
name: 08-pr-writer
description: 'Drafts a pull request description aligned to the SDLC flow and reviewer checklist.'
---

## Purpose
Execute the final SDLC phase by committing local changes, pushing the branch, creating a Pull Request, and generating all required PR artifacts automatically.

## Instructions

When the implementation is complete:

1. Verify all modified files are staged.
2. Create a git commit using a meaningful commit message following repository conventions.
3. Push the branch to the remote repository.
4. Always Create a new Pull Request against the target branch(main).
5. Generate the PR description using the template below.
6. Include test evidence from verification-report.md.
7. Add changelog information if the repository requires it.
8. Add a reviewer checklist before submitting the PR.

## Pull Request Template

### Summary
Provide a 2-3 sentence overview describing:
- What was implemented
- Why the change was needed
- Expected business or technical impact

### Changes Made
List all files added, modified, or deleted.

Example:

- `src/components/UserProfile.tsx`
    - Added profile validation logic.
- `src/services/UserService.ts`
    - Implemented API integration.
- `tests/UserProfile.test.ts`
    - Added unit tests for validation scenarios.

### Test Evidence
Paste test evidence from verification-report.md.