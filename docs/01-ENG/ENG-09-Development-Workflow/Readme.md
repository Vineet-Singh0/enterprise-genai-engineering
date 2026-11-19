
# ENG-09 — Development Workflow

## Overview

Development Workflow explains how engineers organize and execute software development work, from understanding a requirement to implementing, validating, documenting, and completing a change.

The focus is on developing a systematic approach to everyday engineering work. This includes clarifying expected behavior, breaking work into manageable tasks, implementing changes incrementally, navigating unfamiliar codebases, understanding dependencies and builds, maintaining documentation, and automating repetitive activities.

This topic connects software engineering principles with practical development activities without replacing the concepts owned by neighboring ENG topics.

## Learning Objectives

After completing this topic, you should be able to:

- Explain the software development lifecycle and how feedback influences the process.
- Convert an ambiguous request into clear requirements and acceptance criteria.
- Break larger changes into manageable tasks with identifiable dependencies.
- Implement changes incrementally and validate progress throughout development.
- Explore an unfamiliar codebase and identify where a change belongs.
- Explain dependency resolution and the basic workflow that turns source code into a runnable application.
- Identify documentation and technical records that need updating when implementation changes.
- Recognize repetitive development activities that can be automated safely and maintained over time.

## Prerequisites

Before studying ENG-09, you should be familiar with the following topics:

- **ENG-03 — Software Engineering Principles:** Basic software design principles, code organization, and maintainability.
- **ENG-04 — Version Control & Collaborative Development:** Repository fundamentals and collaborative development practices.
- **ENG-05 — Linux & Development Environment:** Basic command-line usage, development environments, and dependency isolation.
- **ENG-08 — Development Quality:** Testing, debugging, logging, and other development quality practices.

You do not need advanced knowledge of every prerequisite. Relevant concepts will be referenced where necessary rather than retaught in full.

## Learning Path

Study the chapters in the following order.

| Order | Chapter | Focus |
|---|---|---|
| 01 | [Software Development Lifecycle](01-Software-Development-Lifecycle.md) | Understand the overall lifecycle of a software change, including feedback and iteration. |
| 02 | [Requirements and Acceptance Criteria](02-Requirements-and-Acceptance-Criteria.md) | Clarify requirements, expected behavior, and conditions for completion. |
| 03 | [Task Breakdown and Work Planning](03-Task-Breakdown-and-Work-Planning.md) | Decompose larger work into manageable tasks and identify dependencies. |
| 04 | [Incremental Implementation Workflow](04-Incremental-Implementation-Workflow.md) | Implement small changes, inspect behavior, and validate progress incrementally. |
| 05 | [Working with Existing Codebases](05-Working-with-Existing-Codebases.md) | Explore unfamiliar projects, trace features, and identify appropriate change locations. |
| 06 | [Dependency and Build Workflow](06-Dependency-and-Build-Workflow.md) | Understand dependency resolution, build steps, and runnable application artifacts. |
| 07 | [Documentation and Change Traceability](07-Documentation-and-Change-Traceability.md) | Keep technical documentation and relevant records aligned with implementation changes. |
| 08 | [Development Workflow Automation](08-Development-Workflow-Automation.md) | Identify repetitive development activities and automate appropriate steps. |

## How the Chapters Connect

The chapters describe connected parts of an engineering workflow rather than a rigid, one-way process.

```text
Understand the change
        |
        v
Clarify requirements
        |
        v
Break down the work
        |
        v
Implement incrementally
        |
        +------> Explore existing code
        |
        +------> Resolve dependencies and build
        |
        v
Update documentation and relevant records
        |
        v
Automate suitable repetitive activities
```

Feedback, unexpected behavior, failed validation, and newly discovered requirements can send the engineer back to an earlier stage.

For example, exploring an existing codebase may reveal that the original task needs to be redefined. A failed build may require dependency investigation before implementation can continue.

## Scope and Boundaries

ENG-09 focuses on the workflow used to carry out software development work.

The following boundaries keep the curriculum organized:

- **ENG-03 — Software Engineering Principles:** Owns software design principles and general code organization.
- **ENG-04 — Version Control & Collaborative Development:** Owns Git workflows, repository practices, collaboration, and issue-management workflows.
- **ENG-05 — Linux & Development Environment:** Owns development environment setup, virtual environments, and foundational environment configuration.
- **ENG-06 — Networking Fundamentals:** Owns networking concepts and communication fundamentals.
- **ENG-07 — Database Fundamentals:** Owns database concepts, SQL, schema design, and related fundamentals.
- **ENG-08 — Development Quality:** Owns testing, debugging, logging, profiling, static analysis, linting, and related quality practices.
- **ENG-10 — Concurrency Fundamentals:** Owns concurrency concepts and their associated correctness concerns.

Within these boundaries:

- Project exploration is covered as part of understanding and changing existing codebases.
- Dependency and build fundamentals are covered without repeating development environment setup.
- Documentation maintenance is covered as part of implementing changes. Git history, issue tracking, and collaboration workflows remain references to ENG-04.
- Workflow automation is limited to appropriate development activities. Full CI/CD, deployment engineering, cloud infrastructure, and infrastructure-as-code are outside this topic's defined scope.
- IDE usage may appear as a practical example but is not a standalone chapter.

## Recommended Study Approach

For each chapter:

1. Understand the problem the concept addresses.
2. Build a mental model of how the workflow operates.
3. Study the practical examples and engineering decisions.
4. Identify common mistakes and failure modes.
5. Apply the concepts to a small development task.
6. Answer the chapter's interview questions and review its key takeaways.

Prefer applying the workflow to a real or representative software change rather than learning each chapter in isolation.

## Completion Checklist

Use this checklist to assess your progress through ENG-09.

- [ ] Explain the software development lifecycle and its feedback loops.
- [ ] Write clear requirements and measurable acceptance criteria.
- [ ] Break a feature into manageable tasks with identifiable dependencies.
- [ ] Implement and validate a change in small, controlled steps.
- [ ] Navigate an unfamiliar codebase and trace the behavior relevant to a change.
- [ ] Explain how dependencies are resolved and how a build produces a runnable result.
- [ ] Identify documentation and technical records affected by an implementation change.
- [ ] Select a suitable repetitive development activity for automation and explain its failure-handling requirements.
- [ ] Apply the workflow to a complete development task and explain the decisions made along the way.

Completion should be based on demonstrated understanding and practical application, not merely reading every chapter.

## Estimated Reading Time

| Material | Estimated time |
|---|---:|
| README and orientation | 5–8 minutes |
| Eight teaching chapters | 141–202 minutes |
| **Total** | **146–210 minutes** |

These estimates are approximate. Practical exercises and implementation work require additional time.

## Related Topics

ENG-09 builds on engineering foundations and prepares you to apply those foundations consistently in later engineering work.

Refer to the relevant ENG chapters when you need a deeper explanation of design principles, repository workflows, environment setup, networking, databases, development quality, or concurrency.

Cross-domain references should be added as the corresponding approved documentation becomes available.

---

**Next:** Begin with [01 — Software Development Lifecycle](01-Software-Development-Lifecycle.md).
