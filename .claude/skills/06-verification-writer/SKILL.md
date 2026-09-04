---
name: 06-verification-writer
description: 'Creates a verification summary document with commands run, manual checks, results, and follow-ups.'
---

## Purpose
Verify the implemented requirement by:
- Generating Playwright tests if missing
- Running all tests
- Verifying application health
- Validating key endpoints
- Generating verification-report.md

Do not review requirements.md, architecture.md, or design-review.md.

## Responsibilities

### 1. Requirement Verification
Verify only the implemented functionality from requirements.md.

## Test Framework Setup Responsibility
Implementation is NOT complete until playwright tests have been generated and executed.

If a testing framework does not exist:
1. Detect project technology.
2. Install/configure required test frameworks.
3. Generate tests.
4. Execute tests.
5. Report actual results.

Do not skip testing because no framework exists.

### 2. Playwright Tests
If tests do not exist:
- Create Playwright tests for the implemented feature only.
- Add Positive, Negative, and Boundary scenarios.

### 3. Execute Tests
Run:
```bash
mvn test
npx playwright test
```

### 4. Application Health
Start application and verify:
- Startup succeeds
- No critical errors
- Key endpoints respond correctly

Example:
- GET /
- GET /api/products

### 5. Failure Handling
If verification fails:
- Record issue
- Explain probable cause
- Recommend fix
- Continue remaining checks

## Output
Generate verification-report.md

# Verification Report

## Requirement Verified

## Playwright Tests
- Existing Tests
- Generated Tests
- Positive Scenarios
- Negative Scenarios
- Boundary Scenarios

## Application Health Check
- Startup Status
- Endpoint Results

## Unit Test Results
Total:
Passed:
Failed:
Skipped:

## Playwright Test Results
Total:
Passed:
Failed:
Skipped:

## Verification Summary
- Requirement verified
- Tests executed
- Application health verified

