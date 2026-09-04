---
name: 04-impl-planner
description: 'Breaks design and requirements into dependency-ordered implementation tasks in impl-plan.md.'
---

## Purpose

Create a prioritized and dependency-ordered implementation plan based on the approved architecture.

This skill is responsible for:

- Reading architecture.md
- Identifying implementation tasks
- Breaking work into small deliverable units
- Defining task dependencies
- Identifying blocked tasks
- Creating impl-plan.md

---

## Inputs

Required:

- requirements.md
- architecture.md

Recommended:

- design-review.md

---

## Preconditions

Before planning begins:

1. architecture.md must exist.


---

## Workflow

### Step 1: Analyze Architecture

Review:

- Components
- Services
- APIs
- Database design
- Security requirements
- External integrations
- Technology stack

Identify all implementation work required.

---

### Step 2: Create Task Breakdown

Break implementation into small tasks.

Guidelines:

- One responsibility per task.
- Prefer tasks that can be completed independently.
- Keep tasks implementation-focused.
- Ensure tasks are testable.

Example:

Task:
Create Product entity

Task:
Create Product repository

Task:
Create Product service

Task:
Create Product controller

---

### Step 3: Define Dependencies

Determine the order of execution.

Example:

Product Entity
↓
Product Repository
↓
Product Service
↓
Product Controller
↓
API Testing

Document dependencies clearly.

---

### Step 4: Identify Parallel Work

Identify tasks that can be developed simultaneously.

Example:

Frontend UI Development

AND

Database Schema Creation

may proceed in parallel.

Document parallel opportunities.

---

### Step 5: Identify Blocked Tasks

For every task identify:

- Prerequisites
- Blocking dependencies

Example:

Task:
Implement Checkout API

Blocked By:
- Cart Service
- Order Service

Status:
Blocked

---

### Step 6: Prioritize Tasks

Assign priority levels:

P1 = Critical Foundation

P2 = Core Features

P3 = Supporting Features

P4 = Nice-to-Have Enhancements

Priority Rules:

- Foundational tasks first.
- Core business functionality next.
- Enhancements last.

---

### Step 7: Generate Milestones

Group tasks into milestones.

Example:

Milestone 1:
Project Setup

Milestone 2:
Core Backend

Milestone 3:
Frontend Integration

Milestone 4:
Testing

Milestone 5:
Release Readiness

---

### Step 8: Generate impl-plan.md

Use the format below.

# Implementation Plan

## Overview

Brief summary of implementation approach.

---

## Assumptions

- Assumption 1
- Assumption 2

---

## Task Breakdown

### Task 1

Description:

Priority:

Dependencies:

Deliverable:

---

### Task 2

Description:

Priority:

Dependencies:

Deliverable:

---

## Dependency Order

1.
2.
3.
4.
5.

---

## Parallel Work Opportunities

- Workstream 1
- Workstream 2

---

## Blocked Tasks

| Task | Blocked By |
|------|------------|
| Task Name | Dependency |

---

## Milestones

### Milestone 1

Tasks:

- Item
- Item

### Milestone 2

Tasks:

- Item
- Item

---

## Risks

- Risk
- Mitigation

---

## Suggested Implementation Sequence

1.
2.
3.
4.
5.

---

## Output

Generate:

- impl-plan.md

---

## Rules

- Do not generate source code.
- Do not generate test code.
- Do not perform implementation.
- Focus only on planning.
- Keep tasks dependency-ordered.
- Clearly identify blocked tasks.
- Prefer smaller tasks over large tasks.
- Ensure every task maps back to architecture.md.