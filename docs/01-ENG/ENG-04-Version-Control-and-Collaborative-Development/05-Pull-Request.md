# Pull Requests

## Learning Objectives

By the end of this chapter, you should understand:

- What a Pull Request (PR) is and why it exists.
- Why teams use PRs instead of integrating changes silently.
- The relationship between branches, commits, and Pull Requests.
- The typical lifecycle of a Pull Request.
- What makes a Pull Request easy to review and integrate.
- How developers should communicate changes through a PR.
- How to recognize when a PR is ready for integration.
- Common Pull Request mistakes.
- How Pull Requests fit into professional collaborative development.

---

## Prerequisites

Before reading this chapter, you should understand:

- Basic version control concepts
- Git repositories
- Commits and project history
- Working directory, staging area, and repository
- Branches and branching strategies
- Merge and rebase concepts

Recommended reading:

- [Git Fundamentals](./01-Git-Fundamentals.md)
- [Repository Structure](./02-Repository-Structure.md)
- [Branching Strategies](./03-Branching-Strategies.md)
- [Merge and Rebase](./04-Merge-and-Rebase.md)

---

## Estimated Reading Time

**25–35 minutes**

---

## Before We Start

Imagine that three engineers are working on the same codebase.

One engineer implements authentication.

Another fixes a database bug.

A third adds a new API endpoint.

Each engineer works on a separate branch.

At some point, their changes need to become part of the shared project history.

The technical problem is straightforward:

> How should one developer propose their changes to the rest of the team before those changes become part of the shared codebase?

This is where a **Pull Request** becomes useful.

A Pull Request creates a structured place where a change can be presented, discussed, reviewed, updated, and eventually integrated.

The important idea is:

> A Pull Request is not the change itself. It is a structured proposal for integrating a set of changes into another branch.

---

## Why This Exists

Git provides the technical mechanisms for creating commits, branches, and integrating histories.

But technical mechanisms alone do not solve the entire collaboration problem.

Consider a team without Pull Requests.

A developer creates a branch, makes several commits, and directly integrates the branch into the main branch.

The code may work.

But the team may not know:

- Why the change was made.
- What problem it solves.
- What files were intentionally changed.
- Whether another engineer should review it.
- Whether the change is complete.
- Whether there are known limitations.
- Whether the change should be integrated at all.

The missing piece is **collaborative context**.

A Pull Request provides a formal boundary around a proposed change.

It gives the team a place to answer:

> "What is changing, why is it changing, and should this change become part of this branch?"

---

## Mental Model

A useful mental model is:

```text
Issue / Requirement
        ↓
   Development
        ↓
      Branch
        ↓
     Commits
        ↓
 Pull Request
        ↓
 Discussion / Review
        ↓
   Integration
```

The Pull Request sits between **development** and **integration**.

It represents a proposed transition:

```text
Current shared history
        +
Proposed changes
        ↓
     Integration
```

Another useful way to think about a PR is:

> **A PR is a conversation around a proposed code change.**

The code is important, but the surrounding context is also important.

---

# What Is a Pull Request?

A **Pull Request** is a request to integrate changes from one branch into another branch.

For example:

```text
feature/user-authentication
            │
            │ Pull Request
            ▼
          main
```

The developer is effectively saying:

> "I have completed this change on my branch. I would like the team to evaluate it and, if appropriate, integrate it into the target branch."

A PR commonly contains:

- Source branch
- Target branch
- Commits
- Changed files
- Description
- Reason for the change
- Review discussion
- Review status
- Integration status

The exact interface differs between platforms, but the underlying engineering concept remains the same.

---

# Pull Request vs Branch

These concepts are related but not identical.

A **branch** is a line of development in project history.

A **Pull Request** is a collaborative proposal to integrate changes from one branch into another.

```text
Branch
  ↓
Contains development history

Pull Request
  ↓
Proposes integrating that history
into another branch
```

A branch can exist without a Pull Request.

A Pull Request normally refers to changes represented by a branch.

Therefore:

> **Branch = development boundary**

> **Pull Request = integration proposal**

This distinction is important.

---

# Pull Request vs Commit

A commit records a change in project history.

A Pull Request groups and presents changes for collaboration and integration.

For example:

```text
feature/payment
      │
      ├── Commit A
      ├── Commit B
      └── Commit C
             │
             ▼
      Pull Request
             │
             ▼
           main
```

The commits provide the historical record.

The Pull Request provides the collaboration context around those commits.

A PR does not replace commits.

It organizes a proposed integration of commits.

---

# Pull Request Lifecycle

A typical Pull Request lifecycle looks like this:

```text
1. Create Branch
       ↓
2. Implement Change
       ↓
3. Create Commits
       ↓
4. Open Pull Request
       ↓
5. Explain the Change
       ↓
6. Discussion / Review
       ↓
7. Update Changes if Required
       ↓
8. Ready for Integration
       ↓
9. Integrate
       ↓
10. Close Pull Request
```

The exact process differs between teams, but the underlying flow is similar.

---

# 1. Create a Branch

The developer begins by creating an appropriate branch.

For example:

```text
main
  │
  └── feature/user-profile
```

The branch provides isolation for the proposed work.

Branching strategy is covered in detail in:

[Branching Strategies](./03-Branching-Strategies.md)

---

# 2. Implement the Change

The developer works on the required change.

For example:

```text
Requirement:
Allow users to update their profile photo.
```

The developer modifies the relevant application code.

The goal is to keep the change focused on the intended problem.

A Pull Request becomes easier to understand when the branch contains a coherent change rather than unrelated modifications.

---

# 3. Create Commits

The developer records meaningful checkpoints using commits.

For example:

```text
Add profile image validation
Add profile image upload endpoint
Add profile image tests
```

Commit design belongs to Git fundamentals and repository history.

The important PR-level principle is:

> The commits included in a PR should tell a reasonably understandable story about the change.

This does not mean every PR must contain only one commit.

A PR can contain multiple commits when those commits represent useful development history.

---

# 4. Open the Pull Request

The developer creates the Pull Request.

For example:

```text
Source:
feature/user-profile

Target:
main
```

The PR now represents a proposed integration:

```text
feature/user-profile
          │
          │
          ▼
         main
```

At this point, the developer should provide enough information for another engineer to understand the change.

---

# 5. Explain the Change

A good Pull Request description answers basic questions.

### What changed?

Describe the implementation at a useful level.

### Why was it changed?

Explain the problem or requirement.

### How was it implemented?

Mention important implementation decisions.

### How was it validated?

Describe relevant testing or verification.

### Are there limitations?

Mention known limitations, risks, or follow-up work.

A useful structure is:

```text
## What

Added profile image upload support.

## Why

Users need to update their profile photos.

## How

Added upload validation and storage handling.

## Validation

Tested valid, invalid, and oversized images.

## Notes

Image resizing is intentionally handled separately.
```

The purpose is not to write a long document.

The purpose is to reduce ambiguity.

---

# 6. Discussion and Review

Once the Pull Request is open, other engineers may examine the proposed change.

They may ask:

- Why was this approach chosen?
- Can this logic be simplified?
- Is this behavior intentional?
- What happens in an error case?
- Is this change compatible with existing behavior?
- Is there a better design?

This creates an engineering discussion around the proposed change.

Detailed **Code Review** practices are covered separately in:

[Code Reviews](./06-Code-Reviews.md)

The important distinction is:

> The Pull Request provides the collaboration surface. Code review is one of the activities performed through that surface.

---

## 7. Update the Pull Request

A Pull Request is not necessarily static after it is created.

Reviewers may identify issues or request changes.

The developer can then modify the branch.

For example:

```text
Initial PR
    ↓
Review feedback
    ↓
Developer changes code
    ↓
New commits
    ↓
PR updated
    ↓
Review continues
```

The PR therefore represents an evolving conversation.

The developer should not treat feedback as a completely separate process.

The goal is to move the proposed change toward a state where the team can confidently integrate it.

---

# 8. Ready for Integration

A Pull Request becomes ready for integration when the relevant requirements have been satisfied.

Depending on team practices, this may mean:

- The intended change is complete.
- Relevant discussion has been resolved.
- Required reviews are complete.
- Important issues have been addressed.
- The branch is in an acceptable state.
- The team agrees that the change can be integrated.

The exact approval rules belong to the engineering team's workflow.

The key principle is:

> **"Ready to merge" is an engineering state, not merely a button becoming available.**

---

## 9. Integration

Once the team decides to integrate the change, the source branch is integrated into the target branch.

For example:

```text
feature/payment
       │
       │
       ▼
      main
```

The actual integration mechanism may involve:

- Merge
- Fast-forward integration
- Rebase followed by integration

Those mechanics are covered in:

[Merge and Rebase](./04-Merge-and-Rebase.md)

The Pull Request does not replace these Git operations.

It provides the collaborative workflow around them.

---

# 10. Close the Pull Request

After integration, the Pull Request is generally closed.

The important outcome is that the proposed change has reached a final state.

Conceptually:

```text
Open PR
   ↓
Discussion
   ↓
Review
   ↓
Approved
   ↓
Integrated
   ↓
Closed
```

Not every PR ends this way.

A PR can also be closed without integration if:

- The requirement is no longer needed.
- Another solution was selected.
- The implementation is abandoned.
- The change belongs in another branch or proposal.

This is useful because a closed PR does not necessarily mean "bad code."

It means the proposal is no longer active.

---

# What Makes a Good Pull Request?

A good Pull Request reduces the amount of reasoning another engineer needs to perform.

A reviewer should be able to understand:

```text
What changed?
      ↓
Why?
      ↓
What should I pay attention to?
      ↓
How was it validated?
      ↓
Is it safe and appropriate to integrate?
```

Good PRs generally have the following characteristics.

## 1. Focused Scope

The PR addresses a coherent problem.

Avoid combining unrelated changes:

```text
PR:
Add authentication
+
Rename 30 files
+
Change formatting everywhere
+
Upgrade unrelated dependency
```

This makes the proposed change harder to understand.

Prefer:

```text
PR:
Add authentication
```

and handle unrelated work separately.

---

## 2. Clear Description

The description explains the purpose of the change.

A reviewer should not have to reverse-engineer the reason from the code alone.

---

## 3. Reasonable Size

A PR should be large enough to represent a meaningful change but small enough to understand.

There is no universal number of lines that defines a good PR.

A 500-line change may be reasonable for a large feature.

A 500-line formatting change may be unnecessary.

Therefore:

> **PR size should be evaluated in terms of cognitive complexity, not only line count.**

---

## 4. Clear Change Boundaries

The PR should make it obvious which parts of the system were intentionally changed.

Unexpected unrelated changes increase review cost.

---

## 5. Useful Context

If the change has important design decisions, assumptions, or limitations, document them.

This is especially valuable when the implementation is not obvious from the code.

---

## 6. Validation Information

Explain how the change was tested or verified.

For example:

```text
Validation:
- Unit tests added
- Existing tests passed
- Tested invalid input
- Tested failure scenario
```

This gives reviewers confidence about what has actually been checked.

---

# Pull Request Size and Cognitive Load

One of the most important engineering considerations is **review complexity**.

Consider two PRs.

### PR A

```text
20 files
600 lines changed
5 unrelated features
```

### PR B

```text
8 files
450 lines changed
1 coherent feature
```

PR B may be easier to review despite having many lines.

Why?

Because the reviewer only needs to understand one conceptual change.

This leads to an important engineering principle:

> **Optimize PRs for human comprehension, not simply for fewer lines.**

---

# Pull Requests as Communication

A Pull Request is also a communication artifact.

Suppose an engineer writes:

> "Fixed issue."

This provides almost no useful context.

Compare that with:

> "Profile creation failed when the user's location was missing. This change validates the location field before profile creation and returns the existing validation response."

The second description gives the reviewer a mental model before they inspect the code.

Good engineering communication reduces review effort.

---

## Linking a Pull Request to a Requirement

A Pull Request usually exists because some requirement or problem needs to be addressed.

For example:

```text
Issue #142
"Profile image upload fails for large files."

        ↓

Branch
feature/profile-image-validation

        ↓

Pull Request
"Fix profile image upload validation"
```

This creates traceability:

```text
Problem
   ↓
Implementation
   ↓
Review
   ↓
Integration
```

Detailed issue tracking is covered in:

[Issue Tracking](./08-Issue-Tracking.md)

The important PR concept is simply that connecting a PR to its reason for existence improves traceability.

---

# Pull Request States

Although exact names vary across platforms, a PR generally moves through states such as:

```text
Draft
  ↓
Open
  ↓
Under Review
  ↓
Changes Requested
  ↓
Ready
  ↓
Integrated
  ↓
Closed
```

These states communicate where the proposal currently stands.

## Draft

The developer is still working on the change.

It may not yet be ready for formal review.

## Open

The proposal is active and available for discussion.

## Changes Requested

Review identified changes that should be addressed before integration.

## Ready

The developer considers the change ready for integration, subject to team rules.

## Integrated

The change has been incorporated into the target branch.

## Closed Without Integration

The proposal ended without becoming part of the target branch.

---

# Draft Pull Requests

A Draft PR can be useful when the developer wants early visibility without suggesting that the work is ready for final approval.

For example:

```text
Developer begins complex feature
          ↓
Creates Draft PR
          ↓
Shares early implementation
          ↓
Receives early feedback
          ↓
Continues development
          ↓
Marks PR ready
```

This can be useful for large or uncertain changes.

However, opening a PR too early can also create noise.

The decision depends on the team's workflow and the value of early feedback.

---

# Updating a Pull Request

Suppose a reviewer identifies a problem.

The developer updates the branch.

The PR automatically represents the newer state of the proposed change.

Conceptually:

```text
PR
 │
 ├── Initial changes
 │
 ├── Review feedback
 │
 ├── Additional changes
 │
 └── Final proposed state
```

This is one reason Pull Requests are more than a one-time approval form.

They provide a persistent record of the collaboration around the change.

---

# Resolving Discussion

A PR may contain multiple conversations.

For example:

```text
Reviewer A
"Why is this validation here?"

Developer
"This protects the API from invalid profile states."

Reviewer A
"Understood."
```

Another discussion may require a code change.

The important principle is:

> Resolve the underlying engineering question, not merely the visible comment.

A comment marked as resolved does not automatically mean the underlying problem was addressed.

---

# When Should You Open a Pull Request?

A PR should generally be opened when there is enough meaningful work to evaluate.

Avoid creating a PR merely because a few files changed.

Before opening one, ask:

```text
What problem am I solving?

Is the change coherent?

Is the branch in a reasonable state?

Can another engineer understand the change?

Have I validated the important behavior?

Have I included the necessary context?
```

If the answer to these questions is mostly yes, the PR is likely ready to be useful.

---

# When Should You Avoid Opening a Pull Request?

Avoid using a PR as a dumping ground for unrelated work.

For example:

```text
Feature work
+
Personal refactoring
+
Formatting changes
+
Unrelated bug fix
+
Dependency experimentation
```

This creates unnecessary review complexity.

A PR should have a clear reason for existing.

---

# Engineering Decisions

## Decision 1: One Large PR or Multiple Smaller PRs?

Consider the conceptual boundary.

If the work contains independent changes:

```text
Feature A
Feature B
Feature C
```

separate PRs may be easier to review.

If the changes are tightly coupled:

```text
Feature
 ├── API
 ├── Database
 ├── Validation
 └── Tests
```

one PR may be more appropriate.

The goal is not "always make PRs small."

The goal is:

> **Make the PR represent a coherent unit of change.**

---

## Decision 2: Should Every Commit Be Perfect?

Not necessarily.

Development is iterative.

A branch may contain several commits created while solving a problem.

The important question at the PR level is whether the proposed change is understandable and suitable for integration.

Teams may have different policies about commit cleanup and history presentation.

Do not confuse this with the separate question of how merge or rebase operations work.

---

## Decision 3: Should You Update the PR After Every Review Comment?

If a review comment identifies a real problem, address it.

But avoid making unrelated changes simply because you are already touching the code.

Keep the PR's scope stable unless the new change is directly connected to the original objective.

---

## Decision 4: Should a PR Be Opened Early?

Sometimes.

Open early when:

- Early architectural feedback is valuable.
- The change is complex.
- The implementation direction is uncertain.
- Multiple engineers need visibility.

Wait when:

- The change is trivial.
- The branch is incomplete and provides little useful information.
- Early visibility would create unnecessary review noise.

The correct choice depends on the expected value of early collaboration.

---

# Production Perspective

In a production engineering organization, Pull Requests create a controlled collaboration boundary.

Without a PR-based workflow:

```text
Developer
   ↓
Changes code
   ↓
Direct integration
```

The team has less structured opportunity to understand the change.

With a PR-based workflow:

```text
Developer
   ↓
Branch
   ↓
Commits
   ↓
Pull Request
   ↓
Engineering Discussion
   ↓
Review
   ↓
Integration
```

This creates a visible record of how changes entered the shared codebase.

That record can later help engineers understand:

- Why a change was made.
- Who proposed it.
- What discussion occurred.
- What alternatives were considered.
- What was changed before integration.

This becomes particularly valuable as a team and codebase grow.

---

# Pull Requests and Team Scale

A small team can sometimes coordinate informally.

As the team grows, informal coordination becomes harder.

For example:

```text
2 engineers
   ↓
Easy direct communication

20 engineers
   ↓
More coordination required

100+ engineers
   ↓
Structured collaboration becomes essential
```

Pull Requests help create that structure.

They do not eliminate communication.

They make important communication visible and associated with the proposed change.

---

# Pull Requests and Distributed Teams

Remote and distributed teams cannot always discuss a change synchronously.

A well-written PR provides asynchronous context.

An engineer in another time zone can understand:

```text
Problem
   ↓
Proposed solution
   ↓
Implementation
   ↓
Discussion
   ↓
Current state
```

This reduces dependence on meetings and private conversations.

The PR therefore becomes part of the team's engineering memory.

---

# Common Mistakes

## 1. Giant PRs

### Problem

The PR contains too many unrelated or complex changes.

### Why It Hurts

Reviewers cannot easily understand the complete change.

### Better Approach

Separate independent work and preserve coherent boundaries.

---

## 2. Empty PR Descriptions

### Problem

The PR says:

> "Changes."

### Why It Hurts

The reviewer must discover the purpose by inspecting the entire diff.

### Better Approach

Explain what changed, why, and how it was validated.

---

## 3. Mixing Unrelated Changes

### Problem

A feature PR also contains formatting, refactoring, and unrelated bug fixes.

### Why It Hurts

It becomes difficult to identify the actual feature change.

### Better Approach

Keep unrelated work separate.

---

## 4. Treating Review as Approval Theater

### Problem

The goal becomes obtaining an approval rather than improving the change.

### Why It Hurts

Important engineering problems may remain unresolved.

### Better Approach

Treat review as technical collaboration.

Detailed review practices are covered in:

[Code Reviews](./06-Code-Reviews.md)

---

## 5. Ignoring Reviewer Questions

### Problem

Questions are marked resolved without meaningful explanation.

### Why It Hurts

The underlying engineering concern may remain unresolved.

### Better Approach

Address the actual question and explain the reasoning when necessary.

---

## 6. Changing Scope During Review

### Problem

The developer adds unrelated improvements during review.

### Why It Hurts

The PR becomes larger and harder to reason about.

### Better Approach

Keep the scope focused unless the additional change is directly connected.

---

## 7. Using PRs as a Substitute for Design

### Problem

A large architectural decision is introduced without prior discussion.

### Why It Hurts

Reviewers may discover fundamental design problems after significant implementation work.

### Better Approach

For high-impact changes, discuss important design decisions early.

A Pull Request is a collaboration mechanism, not a replacement for engineering design.

---

## Practical Scenario

Imagine a team building a matrimonial application.

A developer is asked to add profile verification.

The developer creates:

```text
feature/profile-verification
```

They implement:

```text
Verification request
Verification status
Validation
Error handling
Tests
```

They then create a Pull Request:

```text
Title:
Add profile verification flow

Description:

Problem:
Users need a way to verify their profiles.

Changes:
- Added verification request handling
- Added verification status
- Added validation
- Added tests

Validation:
- Tested successful verification
- Tested invalid requests
- Tested repeated verification attempts
```

The team can now understand the proposed change before integration.

The PR provides a clear boundary around the work.

---

# Pull Request Decision Checklist

Before opening a PR, ask:

```text
[ ] What problem does this PR solve?
[ ] Is the scope coherent?
[ ] Is the branch in a reasonable state?
[ ] Are the commits understandable?
[ ] Is the description clear?
[ ] Have important behaviors been validated?
[ ] Are limitations documented?
[ ] Are unrelated changes excluded?
[ ] Is the target branch correct?
[ ] Is the PR ready for the expected level of collaboration?
```

Before requesting integration, ask:

```text
[ ] Required discussion is complete.
[ ] Important review concerns are addressed.
[ ] The intended behavior is clear.
[ ] The change has been appropriately validated.
[ ] No accidental changes remain.
[ ] The team agrees that integration is appropriate.
```

---

# Relationship With Other ENG-04 Concepts

Pull Requests connect several concepts already covered.

```text
Repository
    ↓
Branch
    ↓
Commits
    ↓
Pull Request
    ↓
Code Review
    ↓
Merge / Integration
```

Each concept has a different responsibility.

| Concept | Primary Purpose |
|---|---|
| Repository | Stores project history |
| Branch | Isolates a line of development |
| Commit | Records a change |
| Pull Request | Proposes integration of changes |
| Code Review | Evaluates the proposed change |
| Merge / Rebase | Integrates histories |
| Release | Represents a delivered version |

This separation is important.

Do not treat these concepts as interchangeable.

---

# Engineering Intuition

When deciding whether a Pull Request is good, ask one question:

> **Can another engineer understand and evaluate this change without reconstructing the entire development story themselves?**

If yes, the PR is probably communicating effectively.

If no, improve:

- Scope
- Description
- Context
- Change organization
- Validation information

The purpose of a PR is not to make the process bureaucratic.

The purpose is to make collaboration easier.

---

## Interview Questions

### Conceptual

1. What is a Pull Request?
2. Why do teams use Pull Requests?
3. How is a Pull Request different from a branch?
4. How is a Pull Request different from a commit?
5. Can a branch exist without a Pull Request?
6. Can a Pull Request be closed without being merged?
7. What information should a good PR description contain?
8. Why is PR size important?
9. Why should unrelated changes usually be separated?
10. What is the purpose of a Draft Pull Request?

### Engineering Reasoning

11. Would you prefer one 800-line PR or four 200-line PRs?
12. When can a large PR be justified?
13. Why is line count alone a poor measure of PR quality?
14. When would you open a PR before the implementation is complete?
15. Why should a PR have a clear reason for existing?
16. What problems occur when developers directly integrate changes without collaboration?
17. How does a PR help distributed teams?
18. Why should a PR description explain the reason behind a change?
19. When should unrelated refactoring be separated from a feature PR?
20. Why is a Pull Request not a replacement for engineering design?

### Scenario

You receive a PR containing:

```text
Authentication feature
+
Database refactoring
+
Code formatting
+
Dependency upgrade
+
Bug fix
```

How would you evaluate it?

What would you ask the developer to change, and why?

---

# Quick Revision

Remember these core ideas:

```text
Branch
    ↓
Line of development

Commit
    ↓
Recorded change

Pull Request
    ↓
Proposal to integrate changes

Code Review
    ↓
Evaluation and discussion

Merge / Integration
    ↓
Changes become part of the target history
```

A Pull Request should provide:

```text
Context
+
Focused Change
+
Discussion
+
Validation
+
Integration Decision
```

The most important principle is:

> **A Pull Request is a structured proposal for integrating a coherent change into another branch.**

---

# Key Takeaways

- A Pull Request is an integration proposal, not a replacement for a branch or commit.
- Branches isolate development; PRs provide collaboration around integration.
- A good PR has a clear purpose and coherent scope.
- PR descriptions should explain what changed, why it changed, and how it was validated.
- PR size should be evaluated by cognitive complexity, not only line count.
- Review feedback should be treated as engineering collaboration.
- PRs provide useful historical context for teams.
- Draft PRs can provide early visibility when early feedback is valuable.
- A PR can be closed without integration.
- Pull Requests are especially valuable as teams and systems grow.
- Merge and rebase explain how histories are integrated; Pull Requests provide the collaborative workflow around that integration.
- Code review is covered separately and should not be confused with the Pull Request itself.
- Issue tracking provides the problem or work context that often motivates a PR.
- The ultimate goal of a PR workflow is safer, clearer, and more maintainable collaboration.

---

## Further Reading

- [Git Fundamentals](./01-Git-Fundamentals.md)
- [Repository Structure](./02-Repository-Structure.md)
- [Branching Strategies](./03-Branching-Strategies.md)
- [Merge and Rebase](./04-Merge-and-Rebase.md)
- [Code Reviews](./06-Code-Reviews.md)
- [Issue Tracking](./08-Issue-Tracking.md)
- [Collaborative Development](./09-Collaborative-Development.md)

---
