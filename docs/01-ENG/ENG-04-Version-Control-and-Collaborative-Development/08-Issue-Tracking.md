# Issue Tracking

## Learning Objectives

By the end of this chapter, you should understand:

- Why issue tracking exists in software engineering.
- What an issue represents.
- The difference between a problem, task, feature request, and bug.
- How issues provide context for engineering work.
- The typical lifecycle of an issue.
- How to write a useful issue.
- How to prioritize and classify work.
- The relationship between issues, branches, commits, Pull Requests, and releases.
- How issue tracking improves team coordination and traceability.
- Common issue-tracking mistakes.
- How issue tracking works in production engineering teams.

---

## Prerequisites

Before reading this chapter, you should understand:

- Git fundamentals
- Branches and commits
- Pull Requests
- Code reviews
- Semantic Versioning and releases

Recommended reading:

- [Git Fundamentals](./01-Git-Fundamentals.md)
- [Branching Strategies](./03-Branching-Strategies.md)
- [Pull Requests](./05-Pull-Requests.md)
- [Code Reviews](./06-Code-Reviews.md)
- [Semantic Versioning and Releases](./07-Semantic-Versioning-and-Releases.md)

---

## Estimated Reading Time

**25–30 minutes**

---

## Before We Start

Imagine a software team receives these messages:

```text
"Login is broken."

"Can someone add search?"

"The profile page looks wrong."

"We should improve performance."

"Need to update the API."
```

All of these may represent real engineering work.

But there is a problem.

Where is the context?

Who owns the work?

What exactly needs to change?

How important is it?

Is someone already working on it?

What does "done" mean?

As a team grows, keeping this information in chat messages, memory, or private notes becomes unreliable.

This is why teams use **issue tracking**.

---

# Why This Exists

Software development generates a continuous stream of work.

Examples include:

- Bugs
- Features
- Improvements
- Technical debt
- Documentation work
- Research
- Maintenance
- Operational follow-up

Without a structured system, work can become difficult to track.

Consider:

```text id="p8z1aj"
Problem discovered
      ↓
Message in chat
      ↓
Someone says "I'll handle it"
      ↓
Days pass
      ↓
Nobody remembers the details
```

An issue-tracking system provides a persistent record.

```text id="r6u2lq"
Problem / Requirement
        ↓
Issue
        ↓
Owner
        ↓
Development
        ↓
Integration
        ↓
Completion
```

The fundamental purpose is:

> **Make engineering work visible, understandable, and trackable.**

---

# Mental Model

An issue can be viewed as a structured representation of a piece of work or a problem.

```text id="z9e8fi"
Problem / Need
      ↓
   Issue
      ↓
Planning
      ↓
Implementation
      ↓
Review
      ↓
Completion
```

The issue answers:

> **Why does this work exist?**

The branch and commits answer:

> **How was the change implemented?**

The Pull Request answers:

> **How was the change proposed for integration?**

The release answers:

> **Which version contains the resulting change?**

This separation is important.

---

# What Is an Issue?

An **issue** is a structured record representing a problem, task, request, improvement, or other unit of engineering work.

An issue usually contains some combination of:

- Title
- Description
- Context
- Expected behavior
- Current behavior
- Priority
- Status
- Assignee
- Labels
- Related issues
- Related Pull Requests
- Acceptance criteria

The exact fields depend on the team's issue-tracking system.

The underlying concept is platform-independent.

---

## What Is an Issue Not?

An issue is not necessarily:

- A bug
- A Pull Request
- A commit
- A branch
- A release
- A task assigned only to developers

An issue is a **work-tracking abstraction**.

It can represent different kinds of work.

---

## Common Types of Issues

Different teams use different classification systems.

The following categories are common.

## Bug

A bug represents behavior that does not work as expected.

Example:

```text id="x4fr2n"
Title:
Profile search returns users outside the selected age range.
```

The issue should explain the expected and actual behavior.

---

## Feature Request

A feature request describes new functionality.

Example:

```text id="t6gk7q"
Title:
Allow users to filter profiles by education.
```

The issue describes the desired capability.

---

## Task

A task represents a defined piece of work.

Example:

```text id="p1c3z8"
Title:
Add database index for profile lookup.
```

The task may not represent a bug or user-facing feature.

---

## Improvement

An improvement modifies existing functionality without necessarily fixing a defect.

Example:

```text id="f2e4t9"
Title:
Improve profile search response time.
```

---

## Research / Investigation

Sometimes the team needs to learn something before implementation.

Example:

```text id="q7v2ks"
Title:
Evaluate vector search options for profile matching.
```

The outcome may be information or a technical decision rather than production code.

---

# Issue vs Task

The words "issue" and "task" are sometimes used interchangeably, but conceptually they can differ.

An issue is the broader tracking unit.

A task is one type of work that can be tracked.

```text id="2b6v4m"
Issue
 ├── Bug
 ├── Feature
 ├── Task
 ├── Improvement
 └── Investigation
```

The exact terminology depends on the team's process.

Do not become overly attached to labels.

The important question is:

> **What work needs to be tracked, and what information does the team need to complete it?**

---

# Writing a Good Issue

A useful issue should make the problem understandable without requiring a private conversation.

A simple structure is:

```text id="7g3g4s"
Title
  ↓
Context
  ↓
Problem / Requirement
  ↓
Expected Outcome
  ↓
Acceptance Criteria
  ↓
Additional Information
```

Not every issue needs every section.

The amount of detail should match the complexity of the work.

---

# Writing the Title

A good title is:

- Specific
- Short
- Actionable or descriptive
- Understandable without opening the issue

Weak:

```text id="9z4yq0"
Search problem
```

Better:

```text id="u7xk9f"
Profile search ignores selected location filter
```

The second title gives useful information immediately.

---

# Writing the Description

A good description explains context.

For a bug:

```text id="2jv7lo"
Current behavior:
Search returns profiles outside the selected location.

Expected behavior:
Only profiles matching the selected location should be returned.

Steps to reproduce:
1. Select Mumbai.
2. Search for profiles.
3. Observe results from other locations.
```

The exact format can vary.

The principle is:

> **Provide enough context for another engineer to understand the problem without guessing.**

---

# Acceptance Criteria

Acceptance criteria define what must be true for the work to be considered complete.

For example:

```text id="f9qg40"
Feature:
Add profile location filtering.

Acceptance criteria:
- User can select a location.
- Results contain only matching locations.
- Empty results are handled correctly.
- Existing search behavior remains unaffected.
```

Acceptance criteria create a boundary around "done."

They help prevent:

```text id="z7h8nc"
"I thought it was finished."
```

from becoming a common source of ambiguity.

---

# Issue Lifecycle

A typical issue lifecycle looks like:

```text id="r5t0zi"
Created
   ↓
Triaged
   ↓
Planned
   ↓
In Progress
   ↓
Review / Validation
   ↓
Completed
   ↓
Closed
```

The exact states vary between teams.

Some teams may use:

```text
Backlog
Ready
In Progress
Blocked
Done
```

Others may use different terminology.

The important concept is that an issue moves through meaningful states.

---

# Created

Someone identifies a problem or need.

For example:

```text id="d7p2qa"
User reports:
Profile search is returning incorrect results.
```

An issue is created to capture the information.

---

# Triaged

The team evaluates the issue.

Questions may include:

- Is the issue valid?
- Is it a duplicate?
- How important is it?
- Who should own it?
- What information is missing?
- Should it be worked on now?

This prevents every reported issue from automatically becoming immediate engineering work.

---

## Planned

The team decides that the issue should be addressed.

It may be assigned to a milestone, sprint, project, or engineer.

The exact planning mechanism depends on the organization.

---

## In Progress

Someone is actively working on the issue.

At this stage, implementation may involve:

```text id="v5td5g"
Issue
  ↓
Branch
  ↓
Commits
```

The issue explains why the work exists.

The branch and commits record how the work is implemented.

---

# Review and Validation

Once implementation is ready, the work may move through:

```text id="y8h5s7"
Implementation
     ↓
Pull Request
     ↓
Code Review
     ↓
Validation
```

The issue remains the source of the original work context.

Detailed Pull Request and code-review mechanics are covered in:

- [Pull Requests](./05-Pull-Requests.md)
- [Code Reviews](./06-Code-Reviews.md)

---

# Completed and Closed

An issue can be considered complete when its defined outcome has been achieved.

For example:

```text id="0o8w4z"
Acceptance criteria satisfied
        ↓
Implementation integrated
        ↓
Required validation completed
        ↓
Issue closed
```

Closure should represent an actual state of completion rather than simply removing an item from the active list.

---

# Issue Priority

Not every issue has equal importance.

A team may classify issues using categories such as:

```text id="h4b6d8"
Critical
High
Medium
Low
```

Priority answers:

> **How urgently or importantly should this work be addressed relative to other work?**

Priority is not the same as difficulty.

For example:

```text id="y0i0p6"
Critical:
One-line security fix

Low:
Two-week internal refactoring
```

The first may be much smaller but far more important.

---

# Priority vs Severity

These concepts are often confused.

### Severity

How serious is the impact of the problem?

### Priority

How urgently should the team address it?

For example:

```text id="j2n8m6"
Issue A
High severity
Low priority

Issue B
Medium severity
High priority
```

The exact classification depends on business and engineering context.

The important idea is:

> **Impact and urgency are related but not identical.**

---

# Issue Ownership

An issue should have a clear owner when active ownership is required.

Without ownership:

```text id="0w7b6t"
Everyone knows about the problem
        ↓
Nobody is responsible
        ↓
Work remains incomplete
```

With ownership:

```text id="6q6y2m"
Issue
  ↓
Owner
  ↓
Action
```

Ownership does not mean the owner must perform every task alone.

It means there is clear responsibility for moving the issue forward.

---

# Labels and Classification

Teams often use labels to categorize issues.

Examples:

```text id="k6k1t4"
bug
feature
security
performance
documentation
technical-debt
```

Labels can help teams filter and understand their work.

However, too many labels create complexity.

A useful label should answer a meaningful question.

For example:

> "What kind of work is this?"

is useful.

Creating labels for every minor distinction may not be.

---

# Milestones and Grouping

Related issues can be grouped around a larger objective.

For example:

```text id="0oc0r4"
Project:
Profile Search Improvements

    ├── Location filtering
    ├── Education filtering
    ├── Search performance
    └── Search result ranking
```

This helps teams reason about work at multiple levels.

The individual issue tracks a specific unit.

The milestone or project provides broader context.

---

# Issue Dependencies

Some work depends on other work.

For example:

```text id="0j2r5r"
Database schema change
        ↓
API change
        ↓
Frontend integration
```

The API work may not be safely completed until the database change exists.

Representing dependencies makes sequencing visible.

A useful issue relationship might be:

```text id="z1p3k8"
Issue A
  ↓ blocks
Issue B
```

The exact syntax depends on the tracking system.

The engineering concept is dependency visibility.

---

# Duplicate Issues

Sometimes the same problem is reported multiple times.

For example:

```text id="p6x2ry"
Issue #101
Search returns incorrect results.

Issue #145
Search sometimes returns incorrect profiles.
```

If both represent the same underlying problem, keeping both active may create confusion.

A team may close one as a duplicate and link it to the canonical issue.

This preserves the history without creating duplicate work.

---

# Issue Traceability

One of the strongest benefits of issue tracking is traceability.

A useful engineering chain is:

```text id="5e5r7a"
Requirement / Problem
        ↓
Issue
        ↓
Branch
        ↓
Commits
        ↓
Pull Request
        ↓
Review
        ↓
Integration
        ↓
Release
```

Each artifact answers a different question.

| Artifact | Main Question |
|---|---|
| Issue | Why does this work exist? |
| Branch | Where is the work developed? |
| Commit | What change was recorded? |
| Pull Request | What change is proposed for integration? |
| Code Review | Was the change appropriately evaluated? |
| Release | Which software version contains the change? |

This traceability becomes increasingly valuable as systems and teams grow.

---

# Linking Issues to Pull Requests

Suppose an issue says:

```text id="u4j1x5"
Fix incorrect location filtering.
```

The developer creates:

```text id="9k0f4v"
feature/location-filter-fix
```

and then opens:

```text id="n7y8c2"
Pull Request:
Fix location filtering
```

Connecting these artifacts creates:

```text id="n4xv9c"
Issue
  ↓
Branch
  ↓
Pull Request
  ↓
Integration
```

The exact linking mechanism depends on the platform.

The important concept is traceability.

---

# Issue Tracking and Releases

Issues can also be connected to releases.

For example:

```text id="h9j2qf"
Issue #142
Fix location filtering
        ↓
Pull Request #158
        ↓
Release 2.4.1
```

This allows someone to ask:

> "Which release fixed this issue?"

It also allows a team to ask:

> "What work is included in this release?"

This creates a useful relationship between planning and software history.

---

# Issues as Engineering Memory

A good issue captures information that would otherwise live only in someone's memory.

For example:

```text id="g3q0z8"
Problem
Why it matters
Expected behavior
Decision
Implementation
Outcome
```

Months later, another engineer can understand why the work existed.

This is especially useful when:

- Team members change.
- The system becomes larger.
- Old decisions need to be revisited.
- Similar problems appear again.

Issue tracking therefore contributes to organizational memory.

---

# Issue Tracking and Technical Debt

Technical debt can also be tracked as issues.

Example:

```text id="6z0q9w"
Title:
Replace duplicated profile validation logic
```

The issue can record:

- Why the debt exists.
- What risk it creates.
- Where it exists.
- What improvement is expected.

This makes technical debt visible rather than leaving it as an informal complaint.

However, not every imperfect piece of code needs an issue.

The tracking cost should be justified by the value of remembering and addressing the work.

---

# What Makes a Good Issue?

A useful issue should provide:

```text id="2a9n6e"
Clear Problem
      +
Relevant Context
      +
Expected Outcome
      +
Useful Scope
      +
Ownership / Priority when needed
```

A good issue allows another engineer to understand the work without requiring a long private explanation.

---

# Issue Scope

An issue should represent a meaningful unit of work.

Too broad:

```text id="a5n7f2"
Improve the entire application.
```

Too narrow:

```text id="p2d4k8"
Rename variable x to y.
```

The appropriate size depends on the team's workflow.

A useful issue should be:

> **Small enough to understand and track, but meaningful enough to represent real engineering work.**

---

# Splitting Large Issues

Suppose an issue says:

```text id="2m5g7w"
Build complete profile search system.
```

This may be too broad.

It could potentially be decomposed into:

```text id="7y4j8q"
Profile search API
        ↓
Search filtering
        ↓
Ranking
        ↓
Performance optimization
        ↓
Testing
```

The goal is not to create dozens of tiny issues.

The goal is to create manageable units with clear outcomes.

---

# Issue Description vs Implementation Plan

An issue should explain the problem and expected outcome.

It does not always need to prescribe the exact implementation.

For example:

```text id="h3v0j1"
Problem:
Search becomes slow with large datasets.

Expected outcome:
Search should remain responsive as the dataset grows.
```

This leaves engineers room to determine the implementation.

A useful principle is:

> **Separate the problem that must be solved from the implementation chosen to solve it.**

However, if a technical decision has already been made, the issue can document that context.

---

# Common Mistakes

## 1. Vague Issues

### Problem

```text
Fix search.
```

### Why It Hurts

Nobody knows what is actually wrong.

### Better Approach

Describe the observable problem and expected behavior.

---

## 2. Issues Without Context

### Problem

The issue contains only:

```text
Add feature X.
```

### Why It Hurts

The motivation is unclear.

### Better Approach

Explain why the capability is needed.

---

## 3. Giant Issues

### Problem

One issue represents an entire project.

### Why It Hurts

Progress becomes difficult to measure.

### Better Approach

Break large objectives into meaningful units.

---

## 4. Over-Fragmenting Work

### Problem

Every tiny code change becomes a separate issue.

### Why It Hurts

Tracking overhead becomes larger than the value provided.

### Better Approach

Track meaningful work units.

---

## 5. Issues Without Ownership

### Problem

Everyone assumes someone else will handle it.

### Why It Hurts

Work becomes invisible.

### Better Approach

Assign ownership when active responsibility is required.

---

## 6. Stale Issues

### Problem

Issues remain open indefinitely without meaningful progress.

### Why It Hurts

The backlog becomes noisy and unreliable.

### Better Approach

Periodically review old issues and decide whether they are still relevant.

---

## 7. Duplicate Issues

### Problem

Multiple issues represent the same problem.

### Why It Hurts

The team may implement the same solution twice or split information across records.

### Better Approach

Identify duplicates and preserve a canonical issue.

---

## 8. Turning Every Idea Into Immediate Work

### Problem

Every suggestion becomes an active engineering task.

### Why It Hurts

The active backlog becomes difficult to manage.

### Better Approach

Separate ideas, planned work, and active work when appropriate.

---

# Production Perspective

Issue tracking becomes especially important in production systems because engineering work does not come only from planned features.

Teams may discover:

```text id="z6f3q8"
Production bug
Security concern
Performance problem
Customer request
Technical debt
Compatibility issue
```

Each can become trackable work.

A structured issue provides:

```text id="d1s5h8"
Problem
  ↓
Impact
  ↓
Owner
  ↓
Action
  ↓
Resolution
```

This improves coordination.

It also helps teams avoid relying on memory or scattered conversations.

---

# Issue Tracking and Team Coordination

Consider a team of five engineers.

Without structured tracking:

```text id="6q5x3m"
Slack
Email
Meetings
Personal notes
Memory
```

Important information becomes distributed.

With issue tracking:

```text id="l4y1w8"
Shared Work Queue
       ↓
Visible ownership
       ↓
Visible status
       ↓
Visible context
```

The goal is not to eliminate communication.

The goal is to create a shared source of work context.

---

# Issue Tracking and Prioritization

Suppose the team has:

```text id="4v6x1e"
30 open issues
```

Not all 30 can be addressed immediately.

The team needs to decide:

```text id="5p8r2a"
What matters most?
        ↓
What has the highest impact?
        ↓
What is urgent?
        ↓
What has dependencies?
        ↓
What should wait?
```

This turns issue tracking from a simple list into a planning tool.

---

# Engineering Decision Framework

When creating or evaluating an issue, ask:

```text id="q2k5s9"
1. What problem are we solving?
          ↓
2. Why does it matter?
          ↓
3. What should the expected outcome be?
          ↓
4. Is the scope understandable?
          ↓
5. Who should own it?
          ↓
6. How important is it?
          ↓
7. Does it depend on other work?
          ↓
8. How will we know it is complete?
```

This produces much stronger issues than simply writing:

> "Please fix this."

---

# Practical Scenario

Imagine a production issue:

> Users occasionally see profiles from outside their selected location.

A weak issue:

```text id="l8q3w4"
Title:
Location bug

Description:
Location filtering is broken.
```

A stronger issue:

```text id="e6q7p1"
Title:
Profile search returns results outside selected location

Problem:
Users selecting a specific location sometimes receive
profiles from other locations.

Expected behavior:
Search results should respect the selected location filter.

Impact:
Users receive less relevant matches.

Acceptance criteria:
- Selected location is respected.
- Profiles outside the selected location are excluded.
- Existing location behavior remains compatible.
- Relevant test cases are added.
```

The second issue gives an engineer a much better starting point.

---

# Issue Tracking and Engineering Memory

A good issue should allow a future engineer to answer:

```text id="n4m8p2"
What happened?
Why did it matter?
What did we decide?
What work was done?
What was the outcome?
```

This is one of the most valuable long-term benefits of issue tracking.

The issue is not just a task list item.

It becomes part of the project's historical context.

---

# Issue Tracking and the Full Development Flow

ENG-04 concepts fit together as:

```text id="d9v4k1"
Issue
  │
  │ Why?
  ▼
Branch
  │
  │ Where?
  ▼
Commits
  │
  │ What changed?
  ▼
Pull Request
  │
  │ What are we proposing?
  ▼
Code Review
  │
  │ Is it appropriate?
  ▼
Integration
  │
  │ How does it enter shared history?
  ▼
Version
  │
  │ What compatibility change?
  ▼
Release
  │
  │ Which software state?
  ▼
Collaborative Development
```

This is the broader mental model for ENG-04.

Each artifact has a distinct responsibility.

---

# Interview Questions

### Conceptual

1. What is issue tracking?
2. Why do software teams use issue trackers?
3. What is an issue?
4. Is every issue a bug?
5. What is the difference between an issue and a task?
6. What are acceptance criteria?
7. What is the difference between severity and priority?
8. Why is issue ownership important?
9. Why are duplicate issues problematic?
10. What is issue traceability?

### Engineering Reasoning

11. How would you decide whether an issue is too large?
12. When should one issue be split into multiple issues?
13. Why should an issue describe the problem instead of always prescribing the implementation?
14. Why can too many labels make an issue tracker worse?
15. How can issue tracking reduce organizational knowledge loss?
16. How would you prioritize 30 open issues?
17. Why should stale issues be periodically reviewed?
18. How do issues connect to Pull Requests?
19. How do issues connect to releases?
20. What makes an issue useful to an engineer who was not involved in the original discussion?

### Scenario

A team has 200 open issues.

Many are:

- Duplicates
- Old feature ideas
- Bugs that no longer reproduce
- Technical debt
- Active production problems

The team says:

> "Our issue tracker is useless."

How would you approach improving it?

Do not start by choosing a tool.

Explain the engineering process you would establish first.

---

## Quick Revision

Remember the primary question each artifact answers:

```text id="3l5p8z"
Issue
  ↓
Why does this work exist?

Branch
  ↓
Where is it being developed?

Commit
  ↓
What change was recorded?

Pull Request
  ↓
What change is being proposed?

Code Review
  ↓
Is the change appropriate?

Version
  ↓
What compatibility category does the change represent?

Release
  ↓
Which software state is being made available?
```

A good issue contains:

```text id="0l7d4m"
Problem
+
Context
+
Expected Outcome
+
Clear Scope
+
Acceptance Criteria
```

The central principle is:

> **Issue tracking makes engineering work visible, understandable, and traceable.**

---

# Key Takeaways

- An issue is a structured representation of a problem, task, feature, improvement, or other unit of work.
- Issue tracking exists because teams cannot reliably manage growing amounts of work through memory and informal communication.
- A good issue explains the problem, context, expected outcome, and relevant completion criteria.
- Not every issue is a bug.
- Priority and severity describe different dimensions of a problem.
- Ownership creates accountability for moving work forward.
- Labels, milestones, and dependencies can improve organization when used deliberately.
- Issues should be meaningful units of work rather than extremely broad projects or trivial code changes.
- Issues should not unnecessarily prescribe implementation details.
- Issue traceability connects requirements with implementation and releases.
- Issues can become valuable organizational memory.
- Technical debt can be tracked when doing so provides meaningful value.
- Stale and duplicate issues reduce the reliability of an issue tracker.
- A good issue tracker is not simply a list of tasks; it is a shared model of engineering work.
- The ultimate goal is not more tickets. It is better visibility, coordination, prioritization, and traceability.

---

## Further Reading

- [Pull Requests](./05-Pull-Requests.md)
- [Code Reviews](./06-Code-Reviews.md)
- [Semantic Versioning and Releases](./07-Semantic-Versioning-and-Releases.md)
- [Collaborative Development](./09-Collaborative-Development.md)

---

## End of Document
