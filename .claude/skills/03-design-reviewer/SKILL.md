---
name: 03-design-reviewer
description: 'This skill acts as a Senior Architect / Principal Engineer performing a structured design review'
---

## Purpose

Review the proposed architecture before implementation begins.

The objective is to identify architectural risks, gaps, ambiguities, and improvement opportunities while ensuring the solution remains simple, maintainable, testable, and aligned with requirements.


## Inputs

Required:

- architecture.md

Optional:

- requirements.md
- Jira User Story
- Acceptance Criteria
- Non-Functional Requirements

---

## Responsibilities

1. Review architecture.md against requirements.
2. Identify risks, gaps, and unsupported scenarios.
3. Ask clarification questions when information is missing.
4. Incorporate stakeholder responses.
5. Generate design-review.md.
6. Recommend updates to architecture.md.
7. Prefer simple and maintainable designs.
8. Avoid unnecessary complexity and over-engineering.

---

## Review Checklist

### Functional Coverage

Verify that all requirements are represented in the architecture.

Check for:

- Missing features
- Missing user journeys
- Missing integrations
- Missing acceptance criteria coverage
- Missing business rules

---

### Architecture Quality

Review:

- Separation of concerns
- Layered architecture
- Maintainability
- Extensibility
- Reusability
- Simplicity

Identify:

- Tight coupling
- Duplicate responsibilities
- Unnecessary complexity
- Over-engineered solutions

---

### Security Review

Check for:

- Authentication requirements
- Authorization requirements
- Input validation
- Sensitive data exposure
- Secret management
- API security concerns

---

### Performance Review

Review:

- Scalability considerations
- Potential bottlenecks
- Excessive API calls
- Database access patterns
- Caching opportunities

---

### Reliability Review

Review:

- Error handling
- Exception management
- Logging strategy
- Failure recovery approach
- Monitoring considerations

---

### Testing Review

Verify architecture supports:

- Unit Testing
- Integration Testing
- End-to-End Testing
- Playwright Automation
- CI/CD Validation

---

### Non-Functional Requirements Review

Review coverage of:

- Security
- Performance
- Reliability
- Availability
- Maintainability
- Usability
- Scalability

Identify any missing NFR coverage.

---

## Clarification Process

Before finalizing the review:

1. Identify ambiguities and missing information.
2. Ask concise clarification questions.
3. Record responses in the review report.
4. Update recommendations using stakeholder feedback.

Example Questions:

- Is authentication required?
- Is database persistence required?
- Is mobile responsiveness required?
- Are audit logs required?
- Are there performance targets?
- Are there compliance requirements?
- Is high availability required?

---

## If No Stakeholder Response Is Received

Do not stop the review.

Proceed using reasonable assumptions.

Requirements:

- Clearly document assumptions.
- State why assumptions were made.
- Continue generating design-review.md.
- Prefer the simplest implementation.
- Avoid unnecessary complexity.