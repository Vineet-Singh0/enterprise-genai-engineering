# Semantic Versioning and Releases

## Learning Objectives

By the end of this chapter, you should understand:

- Why software versions exist.
- The difference between a version and a release.
- What Semantic Versioning (SemVer) is.
- The meaning of major, minor, and patch versions.
- How version numbers communicate compatibility expectations.
- What breaking and non-breaking changes mean.
- How pre-release and build metadata work at a conceptual level.
- What a software release represents.
- How teams decide when and what to release.
- How releases connect code history with a usable software version.
- Common versioning and release mistakes.
- How versioning and releases fit into professional engineering workflows.

---

## Prerequisites

Before reading this chapter, you should understand:

- Git fundamentals
- Commits and project history
- Branches
- Pull Requests
- Code reviews
- Basic collaborative development

Recommended reading:

- [Git Fundamentals](./01-Git-Fundamentals.md)
- [Branching Strategies](./03-Branching-Strategies.md)
- [Pull Requests](./05-Pull-Requests.md)
- [Code Reviews](./06-Code-Reviews.md)

---

## Estimated Reading Time

**25–35 minutes**

---

## Before We Start

Imagine that a team publishes a software library.

The first version is:

```text
1.0.0
```

Later, the team changes the library.

A user sees:

```text
1.1.0
```

What does that number mean?

Does it contain a new feature?

Did an existing API change?

Could an existing application continue working?

Now imagine the next release is:

```text
2.0.0
```

Should users expect something different?

Without a consistent versioning system, users have to inspect every release to understand what changed.

Version numbers provide a compact communication mechanism.

A good versioning strategy answers:

> **What kind of change happened, and what should users expect from compatibility?**

---

# Why This Exists

Software changes continuously.

A project may evolve like this:

```text
Initial software
      ↓
Bug fixes
      ↓
New functionality
      ↓
API changes
      ↓
Breaking changes
      ↓
New software generation
```

Users need a way to understand these changes.

Consider a library used by hundreds of applications.

If the library changes:

```python
get_user(id)
```

into:

```python
get_user(id, include_deleted=True)
```

the impact may be different from completely removing `get_user()`.

A version number can communicate the expected level of change.

This creates a useful engineering principle:

> **Versioning is a communication contract between software producers and software consumers.**

---

# Mental Model

A useful mental model is:

```text
Code Changes
     ↓
Change Classification
     ↓
Version Decision
     ↓
Release
     ↓
Users Consume Version
```

Another useful model is:

```text
Version
   ↓
Communicates expected change

Release
   ↓
Delivers a particular state of the software
```

These concepts are related but not identical.

---

# Version vs Release

A **version** identifies a particular state or iteration of software.

For example:

```text
2.4.1
```

A **release** is the act or event of making a particular version available for users or consumers.

Conceptually:

```text
Version
  ↓
2.4.1

Release
  ↓
Make 2.4.1 available
```

Therefore:

> **Version answers "which version?"**

> **Release answers "when/how was that version made available?"**

The exact release mechanism depends on the software and organization.

This chapter focuses on the engineering concepts rather than release automation or deployment systems.

---

# What Is Semantic Versioning?

**Semantic Versioning**, commonly called **SemVer**, is a convention for representing software versions using three primary numbers:

```text
MAJOR.MINOR.PATCH
```

For example:

```text
2.7.3
```

The three components communicate different categories of change.

```text
2   .   7   .   3
│       │       │
│       │       └── PATCH
│       └────────── MINOR
└────────────────── MAJOR
```

The basic idea is:

```text
MAJOR
  ↓
Breaking changes

MINOR
  ↓
Backward-compatible functionality

PATCH
  ↓
Backward-compatible fixes
```

The exact interpretation depends on the project's compatibility contract.

---

# MAJOR Version

A **major version** generally indicates breaking changes.

Example:

```text
1.8.4
  ↓
2.0.0
```

A breaking change is a change that may require existing consumers to modify their code or behavior.

For example:

```python
# Previous API
create_user(name, email)
```

becomes:

```python
# New API
create_user(user_data)
```

Existing callers may no longer work without modification.

This is a significant compatibility change.

The major version communicates that consumers should pay attention.

---

# MINOR Version

A **minor version** generally represents new functionality that remains backward compatible.

Example:

```text
2.3.1
  ↓
2.4.0
```

Suppose a library previously provides:

```python
get_user(id)
```

and adds:

```python
search_users(query)
```

Existing users can continue using `get_user()`.

The new functionality expands the API without intentionally breaking existing usage.

That is the kind of change normally associated with a minor version.

---

# PATCH Version

A **patch version** generally represents backward-compatible fixes.

Example:

```text
2.4.1
  ↓
2.4.2
```

Suppose a bug causes incorrect formatting.

The implementation is corrected without changing the public behavior expected by existing consumers.

That type of change is generally represented by a patch increment.

Typical examples include:

- Bug fixes
- Small correctness fixes
- Security fixes that preserve compatibility
- Internal corrections

The important principle is:

> **A patch release should not intentionally introduce a breaking public behavior change.**

---

# Semantic Versioning Example

Consider:

```text
1.4.2
```

Now imagine the team makes three different changes.

### Change A — Bug Fix

```text
1.4.2 → 1.4.3
```

### Change B — New Backward-Compatible Feature

```text
1.4.3 → 1.5.0
```

### Change C — Breaking API Change

```text
1.5.0 → 2.0.0
```

The version number communicates the category of change.

```text
1.4.2
  │
  ├── Bug fix ──────────────→ 1.4.3
  │
  ├── New compatible feature → 1.5.0
  │
  └── Breaking change ──────→ 2.0.0
```

---

# Backward Compatibility

Semantic Versioning depends heavily on the concept of **backward compatibility**.

Backward compatibility means that existing consumers can continue to work with the new version without requiring changes for the supported use cases.

For example:

```text
Existing consumer
        ↓
Version 1.x
        ↓
Upgrade
        ↓
Version 1.x newer release
        ↓
Still works
```

This is the expectation behind many minor and patch changes.

But compatibility is not always simple.

A change can appear small while still breaking real consumers.

Therefore:

> **Version decisions require understanding the software's public contract.**

---

# What Counts as a Breaking Change?

A breaking change is not defined only by whether code was deleted.

Examples can include:

### Removing an API

```text
get_user()
```

is removed.

Existing consumers calling it fail.

---

### Changing Required Parameters

Before:

```python
create_user(name)
```

After:

```python
create_user(name, organization_id)
```

Existing callers may fail because the new parameter is required.

---

### Changing Behavior Unexpectedly

Suppose:

```python
calculate_discount()
```

previously returns a percentage-based discount.

A new release changes it to return a fixed currency amount.

The function still exists.

But its contract changed.

That can still be a breaking change.

---

### Changing Data Contracts

For example:

```json
{
  "user_id": 123,
  "name": "Vineet"
}
```

becomes:

```json
{
  "id": 123,
  "full_name": "Vineet"
}
```

Consumers expecting the previous fields may break.

---

# Not Every Code Change Is a Version Change

Internal implementation changes may not require a new public API version category.

For example:

```text
Before:
Implementation A

After:
Implementation B
```

If consumers see the same behavior and compatibility contract, the internal implementation may change without being a breaking change.

This is important because:

> **Versioning should describe externally meaningful change, not every internal code modification.**

---

# Versioning Is About Contracts

Consider an API:

```text
GET /users/{id}
```

The versioning question is not:

> "Did the developer change the code?"

The better question is:

> "Did the externally observable contract change?"

For example:

```text
Internal refactor
        ↓
Same API contract
        ↓
Potentially non-breaking


API removed
        ↓
Contract changed
        ↓
Potentially breaking
```

This mindset is more useful than looking only at source-code differences.

---

# Pre-Release Versions

Software is sometimes published before it is considered a stable release.

Examples include:

```text
2.0.0-alpha.1
2.0.0-beta.1
2.0.0-rc.1
```

These communicate that the version is associated with a pre-release stage.

Common conceptual stages include:

```text
alpha
  ↓
beta
  ↓
release candidate
  ↓
stable release
```

The exact workflow varies between teams.

The important idea is that pre-release identifiers communicate additional maturity or stability information.

---

# Build Metadata

Semantic Versioning can also include build metadata.

Example:

```text
1.4.2+build.183
```

The `+` portion is build metadata.

Conceptually:

```text
1.4.2
   +
build.183
```

Build metadata can provide additional identification information without changing the core semantic version.

The exact information stored there depends on the project's tooling and practices.

---

# The Special Case of 0.x Versions

Projects before their first stable major release often use versions such as:

```text
0.1.0
0.2.0
0.9.0
```

The important engineering idea is that the project may still be evolving toward a stable public contract.

For a production team, the exact interpretation should be documented rather than assumed.

Do not use `0.x` as an excuse to make compatibility changes without considering consumers.

---

# Version Selection as an Engineering Decision

Choosing the next version should not be arbitrary.

Consider:

```text
What changed?
     ↓
Does the public contract change?
     ↓
Is the change breaking?
     ↓
Is the new behavior backward compatible?
     ↓
Choose version category
```

A useful decision model is:

```text
Breaking change?
      │
   Yes ─────→ MAJOR
      │
      No
      ↓
New backward-compatible functionality?
      │
   Yes ─────→ MINOR
      │
      No
      ↓
Backward-compatible fix?
      │
   Yes ─────→ PATCH
```

This is the basic reasoning pattern behind Semantic Versioning.

---

# What Is a Release?

A **release** is a defined version of software that is made available for consumption.

For example:

```text
Version:
3.2.0

Release:
3.2.0
```

A release may contain:

- A version identifier
- Release notes
- A summary of changes
- Important compatibility information
- Known limitations
- Artifacts appropriate to the software

The exact release contents depend on the project.

The key concept is:

> **A release represents a deliberate point in the evolution of a software product.**

---

# Why Releases Exist

A codebase may contain thousands of commits.

Users generally do not want to consume arbitrary commits.

They want identifiable software states.

Instead of saying:

> "Use whatever code exists after commit `abc123`."

a project can say:

> "Use version `2.4.1`."

This creates a stable reference point.

```text
Continuous development
        ↓
Many commits
        ↓
Selected stable state
        ↓
Version
        ↓
Release
```

---

# Release as a Stable Boundary

A release creates a boundary in project history.

For example:

```text
Commit ─ Commit ─ Commit ─ Commit
                     │
                     ▼
                  Release
                   2.4.0
                     │
                     ▼
Commit ─ Commit ─ Commit
                     │
                     ▼
                  Release
                   2.5.0
```

This allows teams and users to refer to known software states.

---

# Release Notes

A release should communicate what changed.

For example:

```text
Version 2.4.0

Added:
- User profile search
- Profile filtering

Changed:
- Improved search response format

Fixed:
- Incorrect location filtering

Compatibility:
- Existing search API remains compatible
```

Good release notes answer:

- What changed?
- What is new?
- What was fixed?
- What should users know?
- Are there compatibility considerations?

Release notes are a communication artifact.

They should help consumers understand the new version without reading the entire code history.

---

# Release History

A project may develop a release history such as:

```text
1.0.0
 ↓
1.0.1
 ↓
1.1.0
 ↓
1.1.1
 ↓
2.0.0
```

This history communicates how the software evolved.

For example:

```text
1.0.0 → 1.0.1
        Fix

1.0.1 → 1.1.0
        New compatible functionality

1.1.0 → 2.0.0
        Breaking change
```

This creates a useful relationship between:

```text
Change
  ↓
Version
  ↓
Release
  ↓
Consumer expectations
```

---

# Releases and Git History

Git provides project history.

Releases identify meaningful points in that history.

Conceptually:

```text
Git History

A ─ B ─ C ─ D ─ E ─ F ─ G
        ↑           ↑
      v1.0.0      v1.1.0
```

The exact mechanism used to identify releases depends on the team's tooling.

The important concept is that a release should correspond to a known state of the source.

---

# Version Tags

In Git-based workflows, teams commonly use tags to identify important points in history.

Conceptually:

```text
A ─ B ─ C ─ D ─ E
        ↑       ↑
      v1.0.0  v1.1.0
```

A tag can provide a stable name for a specific point in repository history.

This makes it easier to identify the source state associated with a release.

The important concept here is **identification of history**.

Release automation and deployment are outside the scope of this chapter.

---

# Release Lifecycle

A conceptual release lifecycle may look like:

```text
Changes Implemented
        ↓
Changes Reviewed
        ↓
Changes Integrated
        ↓
Change Set Evaluated
        ↓
Version Selected
        ↓
Release Prepared
        ↓
Release Published
        ↓
Users Consume Version
```

The exact organizational process varies.

The underlying idea remains:

> A release is a deliberate transition from ongoing development to a consumable software version.

---

# What Should Be Considered Before a Release?

Before creating a release, a team should understand:

### Scope

What changes are included?

### Compatibility

Could consumers be affected?

### Stability

Is the software sufficiently validated?

### Version

What version should represent the change?

### Communication

What should users know?

### Known Limitations

Are there unresolved issues that users should understand?

These decisions should match the risk and maturity of the software.

---

## Release Types

Different projects use different release patterns.

Common conceptual categories include:

### Feature Release

Introduces meaningful new functionality.

Example:

```text
2.3.0
```

### Maintenance Release

Contains fixes and smaller improvements.

Example:

```text
2.3.1
```

### Breaking Release

Introduces a new compatibility boundary.

Example:

```text
3.0.0
```

The exact release policy should be documented by the project.

---

# Versioning an API

Versioning becomes especially important for public APIs.

Suppose an API exposes:

```text
GET /users
```

A team changes the response format.

Existing consumers may depend on:

```json
{
  "users": [...]
}
```

The new version returns:

```json
{
  "data": [...]
}
```

Even though the endpoint still exists, consumers may break.

This illustrates an important principle:

> **Compatibility is defined by the consumer-visible contract, not merely by the existence of the same endpoint or function.**

---

# Versioning Libraries

Libraries provide another strong example.

Suppose applications depend on:

```text
library 1.4.2
```

The library releases:

```text
1.5.0
```

and adds a new function.

Existing applications can continue using the old functions.

The version communicates:

> "There is new functionality, but existing supported usage should remain compatible."

Now suppose:

```text
2.0.0
```

removes an existing function.

The major version warns consumers that migration may be necessary.

---

# Release Notes vs Commit Messages

These serve different purposes.

### Commit Message

Usually describes an individual change.

```text
Add profile image validation
```

### Release Notes

Summarize the important changes in a release.

```text
Version 2.4.0

Added profile image validation.
Improved profile upload handling.
Fixed invalid image format handling.
```

The distinction is:

```text
Commit
  ↓
Developer-level history


Release Notes
  ↓
Consumer-level summary
```

Do not simply dump every commit message into release notes.

A release should communicate the meaningful change at the appropriate level.

---

# Production Perspective

In a production organization, versioning reduces ambiguity.

Consider a bug report:

> "The API is failing."

That is incomplete.

A better report includes:

```text
Application: Profile Service
Version: 2.4.1
Environment: Production
```

Now engineers know which software state is involved.

Version identifiers can help with:

- Incident investigation
- Compatibility analysis
- Support
- Reproduction
- Rollback decisions
- Dependency management
- Change tracking

Versioning therefore has operational value even though this chapter does not cover deployment operations.

---

# Releases and Reproducibility

A good release should correspond to a known source state.

For example:

```text
Release 2.4.1
       ↓
Known source history
       ↓
Known version
       ↓
Known change set
```

This makes it easier to answer:

> "What exactly was released?"

Without a clear relationship between releases and source history, reproducing historical software states becomes more difficult.

---

# Common Mistakes

## 1. Changing the Version Arbitrarily

### Problem

A developer chooses:

```text
1.7.3 → 1.8.0
```

without considering the type of change.

### Why It Hurts

Consumers may receive misleading compatibility information.

### Better Approach

Classify the change first.

---

## 2. Treating Every Change as a Major Release

### Problem

Every modification increments the major version.

### Why It Hurts

The version loses useful information.

If everything is breaking, consumers cannot distinguish meaningful compatibility boundaries.

### Better Approach

Use major versions for genuine breaking changes under the project's compatibility contract.

---

## 3. Treating Breaking Changes as Minor

### Problem

A breaking API change results in:

```text
2.4.0 → 2.5.0
```

### Why It Hurts

Consumers may reasonably expect backward compatibility.

### Better Approach

Evaluate the public contract before choosing the version.

---

## 4. Using Patch Releases for New Features

### Problem

A significant new feature becomes:

```text
2.4.0 → 2.4.1
```

### Why It Hurts

The version communicates less information than it should.

### Better Approach

Use the appropriate version category for the nature of the change.

---

## 5. Ignoring Consumer Contracts

### Problem

The developer thinks:

> "The function still exists, so this is not breaking."

But its behavior has changed incompatibly.

### Why It Hurts

Consumers can still break even when names and endpoints remain unchanged.

### Better Approach

Evaluate observable behavior and contracts.

---

## 6. Release Without Useful Notes

### Problem

The release only says:

```text
v2.5.0
```

### Why It Hurts

Users do not know what changed.

### Better Approach

Provide concise, meaningful release notes.

---

## 7. Treating Releases as Deployment

### Problem

The team assumes that release and deployment are the same thing.

### Why It Hurts

They represent different concepts.

A release identifies and communicates a software version.

Deployment concerns making software run in an environment.

These concepts may be connected operationally, but they should not be conflated.

---

# Engineering Decisions

## Decision 1: Is This a Major, Minor, or Patch Change?

Ask:

```text
Did the public contract break?
        │
       Yes
        ↓
      MAJOR

       No
        ↓
Is new backward-compatible functionality added?
        │
       Yes
        ↓
      MINOR

       No
        ↓
Is this primarily a backward-compatible fix?
        │
       Yes
        ↓
      PATCH
```

This is the fundamental Semantic Versioning decision.

---

## Decision 2: What Is the Public Contract?

Do not assume that only APIs count.

A public contract may include:

- API behavior
- Function signatures
- Data formats
- Configuration interfaces
- Command-line behavior
- Library behavior
- Supported workflows

The exact contract depends on the software.

Before choosing a version, identify what consumers depend on.

---

## Decision 3: When Should a Release Be Created?

A release should represent a meaningful and intentional software state.

Avoid releasing merely because:

```text
"We have some commits."
```

Instead consider:

```text
Is there a meaningful change?
Is the change understood?
Is the software appropriately validated?
Is the version clear?
Can consumers understand what changed?
```

The exact release cadence is a team decision.

---

## Decision 4: How Much Should Release Notes Contain?

Release notes should contain information useful to consumers.

Avoid:

```text
- Changed line 27
- Refactored helper
- Renamed variable
```

Prefer:

```text
- Added profile search filtering.
- Improved location matching.
- Fixed incorrect age filtering.
```

The release-level perspective is more valuable than implementation-level noise.

---

# Practical Scenario

Imagine a library currently at:

```text
3.2.4
```

The team makes the following changes.

### Change A

Fixes an incorrect calculation.

```text
?
```

Likely:

```text
3.2.5
```

---

### Change B

Adds a new optional API:

```python
search_users(query, limit=None)
```

Existing usage continues to work.

Likely:

```text
3.3.0
```

---

### Change C

Removes an existing public API:

```python
delete_user()
```

Likely:

```text
4.0.0
```

The important reasoning is not memorizing the numbers.

It is classifying the compatibility impact.

---

# Another Scenario: Behavioral Breaking Change

Suppose an API currently returns:

```json
{
  "age": 25
}
```

A new release changes the meaning of `age` from:

```text
Age in years
```

to:

```text
Birth year
```

The field still exists.

The JSON still parses.

But consumers interpreting `age` as years may break.

Therefore, the change may represent a compatibility break.

This demonstrates:

> **Breaking changes can be semantic, not only structural.**

---

# Semantic Versioning and Collaborative Development

Versioning becomes useful after multiple developers contribute changes.

The broader workflow becomes:

```text
Requirement
    ↓
Branch
    ↓
Commits
    ↓
Pull Request
    ↓
Code Review
    ↓
Integration
    ↓
Version Classification
    ↓
Release
```

Each stage answers a different question.

| Stage | Question |
|---|---|
| Requirement | What problem are we solving? |
| Branch | Where will we develop it? |
| Commit | What change did we record? |
| Pull Request | What change are we proposing? |
| Code Review | Is the change appropriate? |
| Integration | How does it become part of shared history? |
| Version | What kind of compatibility change is this? |
| Release | Which software state are we making available? |

This separation prevents process concepts from becoming mixed together.

---

# Semantic Versioning and Long-Term Maintenance

Versioning becomes more valuable as software ages.

Consider:

```text
v1.x
v2.x
v3.x
```

Each major version can represent a compatibility boundary.

This allows teams to reason about:

- Migration
- Supported versions
- Consumer dependencies
- Compatibility expectations
- Historical behavior

Without consistent versioning, long-term maintenance becomes harder.

---

# Engineering Intuition

When you see:

```text
2.7.4
```

do not think:

> "Three random numbers."

Think:

```text
MAJOR
  ↓
Compatibility boundary

MINOR
  ↓
New compatible capability

PATCH
  ↓
Compatible correction
```

And when you see:

```text
Release 2.7.4
```

think:

> "This identifies a particular consumable state of the software."

The most important mental model is:

```text
Change
  ↓
Compatibility Impact
  ↓
Version
  ↓
Release
```

---

# Interview Questions

### Conceptual

1. What is Semantic Versioning?
2. What do MAJOR, MINOR, and PATCH represent?
3. What is a breaking change?
4. What is backward compatibility?
5. What is the difference between a version and a release?
6. Why do software projects need versions?
7. What is a pre-release version?
8. What is build metadata?
9. Why are release notes useful?
10. What is the purpose of a Git tag in a release workflow?

### Engineering Reasoning

11. Why should versioning be based on consumer-visible contracts?
12. Can a change be breaking even if no API is removed?
13. Why is an internal refactor not necessarily a major version change?
14. Why should release notes not simply contain every commit message?
15. Why is release different from deployment?
16. How does versioning help incident investigation?
17. Why is consistent versioning important for libraries?
18. What should you evaluate before choosing a new version?
19. Why can a minor version sometimes still create compatibility problems if the project violates its stated contract?
20. How would you decide whether a change belongs in a major, minor, or patch release?

### Scenario

A library is currently at:

```text
2.8.3
```

The team changes a function:

```python
calculate_score(user)
```

Previously, the function returned an integer from `0–100`.

It now returns a floating-point value from `0–1`.

The function name and parameters remain unchanged.

Would you classify this as a breaking change?

Explain your reasoning.

---

# Quick Revision

## Semantic Versioning

```text
MAJOR.MINOR.PATCH

MAJOR
  ↓
Breaking change

MINOR
  ↓
Backward-compatible functionality

PATCH
  ↓
Backward-compatible fix
```

## Release Model

```text
Code Changes
     ↓
Change Classification
     ↓
Version
     ↓
Release
     ↓
Consumer
```

## Version vs Release

```text
Version
  ↓
Identifies software state

Release
  ↓
Makes that version available
```

## Core Question

Before selecting a version, ask:

> **How does this change affect the consumer-visible contract?**

---

# Key Takeaways

- Version numbers communicate meaningful information about software evolution.
- Semantic Versioning uses the `MAJOR.MINOR.PATCH` model.
- Major versions communicate breaking compatibility changes.
- Minor versions generally communicate new backward-compatible functionality.
- Patch versions generally communicate backward-compatible fixes.
- Versioning should be based on consumer-visible behavior and contracts.
- A change can be breaking even when no function, endpoint, or field is removed.
- Internal implementation changes do not automatically require a major version.
- A release represents a deliberate, identifiable state of software made available to consumers.
- Release notes communicate important changes at the consumer level.
- Git history records development; releases identify meaningful points in that history.
- Version tags can provide stable references to release points in Git history.
- Release and deployment are different concepts.
- Consistent versioning improves compatibility management, support, debugging, and long-term maintenance.
- The correct version should be chosen by reasoning about the change, not by memorizing a numbering rule.

---

## Further Reading

- [Git Fundamentals](./01-Git-Fundamentals.md)
- [Merge and Rebase](./04-Merge-and-Rebase.md)
- [Pull Requests](./05-Pull-Requests.md)
- [Code Reviews](./06-Code-Reviews.md)
- [Issue Tracking](./08-Issue-Tracking.md)
- [Collaborative Development](./09-Collaborative-Development.md)

---

## End of Document
