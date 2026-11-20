# ENG-04 — Version Control & Collaborative Development

## Overview

Professional software development is rarely an individual activity.

Engineers work on the same codebase, change files at the same time, review each other's work, track problems, and release new versions of software.

Without a reliable way to manage these changes, teams quickly run into problems:

- Changes get overwritten.
- Important work gets lost.
- Engineers cannot easily understand what changed.
- Bugs become difficult to trace.
- Multiple developers struggle to work in parallel.
- Unsafe changes reach shared code.
- Teams lose track of what was released.

**Version control** provides the foundation for managing these changes.

**Collaborative development practices** build on that foundation so that teams can work together safely and predictably.

ENG-04 explains the engineering concepts behind this workflow, using Git as the primary example while keeping the underlying ideas framework-independent.

---

## Learning Objectives

By the end of ENG-04, you should be able to:

- Explain why version control exists and what problem it solves.
- Understand the fundamental Git mental model.
- Understand how a repository stores and manages project history.
- Explain why branches are used for parallel development.
- Reason about merge and rebase and their trade-offs.
- Understand how pull requests support controlled change integration.
- Understand the purpose of code reviews.
- Explain how semantic versioning communicates software changes.
- Understand the purpose of releases.
- Understand how issue tracking connects work with software changes.
- Explain how these practices combine into a professional collaborative workflow.
- Reason about how version control practices reduce engineering risk.

---

## Prerequisites

Before starting ENG-04, you should have a basic understanding of:

- Software development
- Source code and files
- Programming projects
- Basic command-line usage
- The idea of making changes to a software system

You do not need advanced Git knowledge.

---

## Learning Path

ENG-04 is organized as a progression from the basic version-control mental model toward complete team collaboration.

## 1. Git Fundamentals

[Git Fundamentals](./01-Git-Fundamentals.md)

Start here.

This chapter establishes the core reason version control exists and introduces the fundamental Git mental model.

You will understand how Git tracks changes and preserves project history.

---

## 2. Repository Structure

[Repository Structure](./02-Repository-Structure.md)

Once the basic Git model is clear, learn where changes actually exist inside a Git workflow.

This chapter explains the relationship between:

```text
Working Directory
       ↓
Staging Area
       ↓
Repository
       ↓
History
```

---

## 3. Branching Strategies

[Branching Strategies](./03-Branching-Strategies.md)

Software teams often need multiple pieces of work to happen at the same time.

This chapter explains how branches support parallel development and how engineers should reason about different branching strategies.

---

## 4. Merge & Rebase

[Merge & Rebase](./04-Merge-and-Rebase.md)

Parallel development eventually creates separate histories that need to be combined.

This chapter explains merge and rebase, how they differ, and the engineering trade-offs involved in choosing between them.

---

## 5. Pull Requests

[Pull Requests](./05-Pull-Request.md)

A change is rarely integrated directly into shared code without some form of discussion or control.

This chapter explains how pull requests provide a structured mechanism for proposing and integrating changes.

---

## 6. Code Reviews

[Code Reviews](./06-Code-Reviews.md)

A pull request creates an opportunity to evaluate a change before it becomes part of shared code.

This chapter explains the purpose and engineering mindset behind code reviews.

---

## 7. Semantic Versioning & Releases

[Semantic Versioning & Releases](./07-Semantic-Versioning-and-Releases.md)

Software changes need a meaningful way to communicate their impact.

This chapter explains semantic versioning and how releases represent published versions of software.

---

## 8. Issue Tracking

[Issue Tracking](./08-Issue-Tracking.md)

Software changes usually begin with a problem, requirement, task, or improvement.

This chapter explains how issue tracking connects engineering work with the changes made to the codebase.

---

## 9. Collaborative Development

[Collaborative Development](./09-Collaborative-Development.md)

The final chapter brings the individual concepts together.

It explains how issues, branches, commits, pull requests, reviews, integration, and releases form a coherent team development workflow.

---

# Concept Map

The major concepts in ENG-04 connect together as follows:

```text
                    SOFTWARE TEAM
                         │
                         ▼
                What needs to change?
                         │
                         ▼
                   ISSUE TRACKING
                         │
                         ▼
                       BRANCH
                         │
                         ▼
                      COMMITS
                         │
                         ▼
                  PULL REQUEST
                         │
                         ▼
                   CODE REVIEW
                         │
                         ▼
                MERGE / INTEGRATION
                         │
                         ▼
                     VERSION
                         │
                         ▼
                     RELEASE
                         │
                         ▼
              COLLABORATIVE DEVELOPMENT
```

The underlying Git model supports this workflow:

```text
Working Directory
       │
       ▼
Staging Area
       │
       ▼
Repository
       │
       ▼
Project History
```

---

# How the Pieces Fit Together

A useful way to think about ENG-04 is to distinguish the purpose of each concept:

| Concept | Engineering Question |
|---|---|
| Issue | What problem or work needs to be addressed? |
| Branch | Where is this line of development happening? |
| Commit | What code change was recorded? |
| Pull Request | What change is being proposed for integration? |
| Code Review | Is the proposed change appropriate and safe? |
| Merge / Rebase | How should development histories be combined? |
| Version | What level of change does this software version represent? |
| Release | What version of the software is being published? |

These concepts are related, but they are **not interchangeable**.

Understanding these distinctions is one of the central goals of ENG-04.

---

## Engineering Perspective

Version control is not simply a collection of commands.

The important engineering question is:

> **How can a team change software without losing control of its history, quality, and collaboration?**

The practices covered in ENG-04 provide different parts of that answer.

```text
Version Control
      │
      ├── Preserve History
      │
      ├── Enable Parallel Work
      │
      ├── Control Change Integration
      │
      ├── Enable Review
      │
      ├── Track Engineering Work
      │
      └── Communicate Software Versions
```

The goal is not to memorize Git commands.

The goal is to understand the engineering system those commands support.

---

# Quick Revision Path

For fast revision, review the concepts in this order:

```text
1. Why Version Control?
        ↓
2. Git Mental Model
        ↓
3. Repository Structure
        ↓
4. Branches
        ↓
5. Merge vs Rebase
        ↓
6. Pull Requests
        ↓
7. Code Reviews
        ↓
8. Semantic Versioning
        ↓
9. Releases
        ↓
10. Issue Tracking
        ↓
11. Collaborative Development
```

For detailed explanations, use the individual chapter links above.

---

# Practical Engineering Workflow

A typical collaborative development flow can be represented as:

```text
Identify Work
     │
     ▼
Create / Track Issue
     │
     ▼
Create Branch
     │
     ▼
Make Changes
     │
     ▼
Create Commits
     │
     ▼
Open Pull Request
     │
     ▼
Code Review
     │
     ▼
Address Feedback
     │
     ▼
Integrate Change
     │
     ▼
Version / Release
```

The individual chapters explain each part of this workflow in depth.

---

# Interview Preparation

ENG-04 should prepare you to reason about questions such as:

- Why does version control exist?
- What problem does Git solve?
- What is a commit?
- Why do branches exist?
- When would a team use different branching strategies?
- What is the difference between merge and rebase?
- Why can rebasing require caution?
- Why are pull requests useful?
- What makes a good code review?
- Why is code review more than simply finding bugs?
- What does semantic versioning communicate?
- What is the purpose of a release?
- How do issues connect to code changes?
- How do Git practices reduce engineering risk?
- How would you design a safe collaborative workflow for a software team?

The detailed interview questions belong inside the individual chapters.

---

## Cross-Domain Connections

ENG-04 is a foundational engineering topic.

Its concepts will be reused throughout the later curriculum.

## Git

```text
ENG-04
  │
  ├──► LLM
  ├──► RET
  ├──► AGT
  ├──► PROD
  └──► ENT
```

Git is a general software engineering foundation and is not limited to AI projects.

## Pull Requests

```text
ENG-04
  │
  ├──► PROD
  └──► ENT
```

Later production-oriented topics may depend on pull-request-based change management.

## Code Reviews

```text
ENG-04
  │
  ├──► AIF
  ├──► LLM
  ├──► RET
  ├──► AGT
  ├──► PROD
  └──► ENT
```

Code review becomes a cross-cutting engineering practice across the curriculum.

## Semantic Versioning & Releases

```text
ENG-04
  │
  ├──► PROD
  └──► ENT
```

Later domains can reference versioning and releases without re-teaching their fundamentals.

## Collaborative Development

```text
ENG-04
       │
       └──► Entire Engineering Curriculum
```

The collaborative-development principles introduced here should remain reusable across future engineering domains.

---

# Scope Boundary

ENG-04 focuses on **version control and collaborative software development**.

It does not teach:

- CI/CD implementation
- DevOps
- Infrastructure as Code
- Deployment
- Kubernetes
- Cloud infrastructure
- Advanced GitHub Actions
- Production release automation

These topics belong to later curriculum domains.

GitHub, GitLab, and Bitbucket may be used as practical examples, but the underlying engineering concepts remain the focus.

---

## Chapter Ownership

Each major concept has one primary documentation location.

| Concept | Primary Documentation |
|---|---|
| Git Fundamentals | [Git Fundamentals](./01-Git-Fundamentals.md) |
| Repository Structure | [Repository Structure](./02-Repository-Structure.md) |
| Branching Strategies | [Branching Strategies](./03-Branching-Strategies.md) |
| Merge & Rebase | [Merge & Rebase](./04-Merge-and-Rebase.md) |
| Pull Requests | [Pull Requests](./05-Pull-Request.md) |
| Code Reviews | [Code Reviews](./06-Code-Reviews.md) |
| Semantic Versioning & Releases | [Semantic Versioning & Releases](./07-Semantic-Versioning-and-Releases.md) |
| Issue Tracking | [Issue Tracking](./08-Issue-Tracking.md) |
| Collaborative Development | [Collaborative Development](./09-Collaborative-Development.md) |

Other chapters should reference these locations instead of duplicating their explanations.

---

## Key Takeaways

- Version control provides a reliable way to manage software changes and history.
- Git provides the foundational version-control model used throughout this topic.
- Branches enable parallel development.
- Merge and rebase provide different ways to combine development histories.
- Pull requests provide a structured change-integration workflow.
- Code reviews help teams evaluate changes before integration.
- Semantic versioning communicates the meaning of software changes.
- Releases represent published versions of software.
- Issue tracking connects engineering work with implementation.
- Collaborative development combines these practices into a controlled team workflow.
- The real goal is not Git command memorization. It is **safe, understandable, and maintainable software change**.

This completes the README:

README
