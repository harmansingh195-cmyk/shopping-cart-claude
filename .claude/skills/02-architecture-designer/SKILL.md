---
name: 02-architecture-designer
description: 'Creates an architecture document aligned to requirements.md and the existing repository structure.'
---

## Purpose

Design the high-level system architecture based on requirements.md.

This skill is responsible for:

- Analyzing requirements.md
- Identifying system components
- Defining responsibilities
- Proposing technology choices
- Defining data flow
- Creating architecture.md

---

## Inputs

Required:

- requirements.md
- current code structure

---

## Workflow

### Step 1: Review Requirements

Read requirements.md thoroughly.

Identify:

- Functional requirements
- Non-functional requirements
- Assumptions
- Acceptance criteria

Highlight:

- Security considerations
- Performance requirements
- Scalability requirements
- Future extensibility requirements

---

### Step 2: Architecture Analysis

Determine:

- Application type
- Major capabilities
- System boundaries
- External dependencies

Document key architectural decisions.

---

### Step 3: Identify Components

List all major components.

For each component provide:

- Name
- Purpose
- Responsibilities
- Interactions

Example:

Component: Coupon Service

Responsibilities:
- Validate coupon codes
- Calculate discounts
- Return discount details

---

### Step 4: Technology Recommendation

Recommend technologies for:

Frontend
Backend
Database
Testing
Build Tools

Explain why each technology was chosen.

---

### Step 5: Generate Data Flow

Describe:

1. User action
2. Frontend request
3. Backend processing
4. Database interaction
5. Response flow

Use numbered steps.

---

### Step 6: Generate Component Diagram

Create a Mermaid component diagram.

Example format:

```mermaid
graph TD

User --> UI

UI --> ProductController

ProductController --> ProductService

ProductService --> ProductRepository

ProductRepository --> Database