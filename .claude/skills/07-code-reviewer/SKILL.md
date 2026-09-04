---
name: 07-code-reviewer
description: 'Reviews current changes before PR and writes review-report.md with actionable checklist items.'
---

## Purpose

Review the implementation and generate review-report.md.

---

## Inputs

- requirements.md
- Source Code
- Unit Tests
- Integration Tests
- Playwright Tests (if available)

---

## Review Areas

### Correctness
- Does the implementation satisfy the requirement?
- Does functionality behave as expected?

### Security
- Are secrets excluded?
- Is user input validated?
- Are security risks identified?

### Error Handling
- Are exceptions handled properly?
- Are API failures handled gracefully?
- Are missing resources and invalid inputs managed correctly?

### Test Coverage
- Are automated tests present?
- Do tests cover happy path scenarios?
- Do tests cover negative and edge cases?

### Code Clarity
- Are method and variable names meaningful?
- Is the code easy to understand and maintain?
- Is complexity reasonable?

### DRY Principle
- Is duplicate logic present?
- Can common code be refactored into reusable methods?

### Dependency Safety
- Are dependencies appropriate and up to date?
- Are known vulnerable or unnecessary dependencies present?

---

## Review Rules

- Focus on actionable feedback.
- Classify findings as High, Medium, or Low.
- Recommend improvements where needed.
- Do not rewrite the implementation unless necessary.

---

## Output

Generate:

# Review Report

## Summary

Brief assessment of the implementation.

## Findings

### High Priority
- Finding
- Impact
- Recommendation

### Medium Priority
- Finding
- Impact
- Recommendation

### Low Priority
- Finding
- Impact
- Recommendation

## Review Results

### Correctness
✅ Pass / ❌ Issues Found

### Security
✅ Pass / ❌ Issues Found

### Error Handling
✅ Pass / ❌ Issues Found

### Test Coverage
✅ Pass / ❌ Issues Found

### Code Clarity
✅ Pass / ❌ Issues Found

### DRY Principle
✅ Pass / ❌ Issues Found

### Dependency Safety
✅ Pass / ❌ Issues Found

## Recommended Improvements

- Improvement 1
- Improvement 2

## Overall Assessment

✅ Ready for PR

OR

⚠ Ready for PR with Minor Improvements

OR

❌ Additional Changes Required