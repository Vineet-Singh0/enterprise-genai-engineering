# Git Fundamentals

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why version control exists.
- Describe the problems teams face without version control.
- Explain what Git is and what makes it different from simply backing up files.
- Build a mental model of Git as a system for recording changes and history.
- Explain what a commit represents.
- Understand why project history is valuable.
- Understand the basic Git workflow.
- Distinguish between a change in your files and a recorded change in Git history.
- Explain why small, meaningful commits are useful.
- Recognize common beginner mistakes when using Git.
- Reason about how Git reduces engineering risk.

---

## Prerequisites

Before starting this chapter, you should have a basic understanding of:

- Source code
- Files and folders
- Software projects
- Making changes to code
- Basic command-line usage

You do not need previous Git experience.

---

## Estimated Reading Time

**35–45 minutes**

This estimate covers the conceptual material and examples. Practical experimentation with Git will require additional time.

---

## Before We Start

Imagine that you are working on a software project.

On Monday, the project works.

On Tuesday, you change several files.

On Wednesday, you discover that something is broken.

You remember that the project worked on Monday.

But now you have a problem:

> **What exactly changed between Monday and Wednesday?**

You might try to remember the changes.

You might copy the project folder before making another change.

You might create folders such as:

```text
project/
project-final/
project-final-2/
project-final-working/
project-final-working-new/
project-final-working-new-2/
```

This may work for a while.

But it does not scale.

Now imagine that five engineers are changing the same project.

They need to:

- work on different features,
- preserve each other's work,
- understand what changed,
- recover older versions,
- investigate bugs,
- combine changes,
- and know who changed what.

Simply keeping copies of files is no longer enough.

This is the problem that **version control** addresses.

---

# Why Does Version Control Exist?

Version control exists because software changes continuously.

A software project is not a static collection of files.

It is a sequence of changes made over time.

```text
Project
   │
   ├── Initial implementation
   │
   ├── Feature added
   │
   ├── Bug fixed
   │
   ├── Configuration changed
   │
   ├── Another feature added
   │
   └── Performance improvement
```

Each change creates a new state of the project.

Without a system for recording those changes, important information can disappear.

A useful way to think about version control is:

> **Version control gives a project memory.**

It allows engineers to understand how the project reached its current state.

---

# What Problem Does It Solve?

A version-control system helps answer questions such as:

- What changed?
- When did it change?
- Who made the change?
- Why was the change made?
- What did the project look like before the change?
- Can we return to an earlier state?
- Can we compare two versions?
- Can multiple engineers work on the same project?

These are engineering questions, not merely file-management questions.

---

## What Happens Without Version Control?

Consider a small team of three engineers.

```text
              Shared Project
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
       Engineer A Engineer B Engineer C
```

Engineer A changes authentication.

Engineer B changes the database layer.

Engineer C fixes a user-interface bug.

If everyone simply copies files around, several problems appear.

### Problem 1 — Lost Changes

One person's copy may overwrite another person's work.

### Problem 2 — No Reliable History

The team may know that something changed but not exactly what changed.

### Problem 3 — Difficult Debugging

A bug may have appeared several changes ago.

Without history, finding the responsible change becomes much harder.

### Problem 4 — Poor Collaboration

Engineers cannot safely work independently and then combine their work.

### Problem 5 — Difficult Recovery

If a change breaks the system, returning to a known working state becomes difficult.

Version control addresses these problems by treating changes as information that should be recorded and managed.

---

# Version Control Is More Than Backup

A common beginner mental model is:

> "Git is a backup system."

This is incomplete.

A backup answers:

> "Can I recover my files?"

Version control answers a much broader set of questions:

> "How did my project change over time, and how can I manage those changes?"

For example:

```text
Backup

Current Files
     │
     └── Copy


Version Control

Project
   │
   ├── Change 1
   ├── Change 2
   ├── Change 3
   ├── Change 4
   └── Current State
```

A backup primarily preserves data.

Version control preserves **change history**.

This distinction becomes important when debugging, reviewing, collaborating, and maintaining software.

---

# What Existed Before Modern Version Control?

Before distributed systems such as Git became common, teams used different approaches to manage source code.

Some teams manually created copies of projects.

Others used centralized version-control systems.

The important idea is not memorizing the history of every version-control tool.

The important engineering progression is:

```text
Manual Copies
     ↓
Centralized Version Control
     ↓
Distributed Version Control
```

Each stage attempted to solve limitations of the previous approach.

Git belongs to the distributed version-control family.

---

# What Is Git?

Git is a **distributed version-control system**.

Let's break that sentence down.

### Version control

A system for recording and managing changes to files over time.

### Distributed

Instead of depending entirely on one central copy of the project history, each Git repository can contain its own complete history.

### System

Git is not just one command.

It is a collection of concepts and mechanisms for storing, identifying, comparing, and managing changes.

A useful simplified mental model is:

> **Git records snapshots of your project and the history connecting those snapshots.**

This gives engineers a way to reason about the evolution of a codebase.

---

## Mental Model: Git as Project Memory

Imagine taking photographs of a project at meaningful points in time.

```text
Snapshot A        Snapshot B        Snapshot C
   │                  │                  │
   ▼                  ▼                  ▼

Initial Project → Login Added → Bug Fixed
```

Each snapshot represents a known state.

Git's actual internal model is more sophisticated than a simple folder-copy system, but this snapshot model is useful for understanding the basic idea.

Instead of asking:

> "Which folder contains the latest version?"

you can ask:

> "Which recorded state of the project do I want to inspect?"

This is a much stronger model for software engineering.

---

# The Project Has a History

Suppose a project starts with three files:

```text
app.py
config.py
README.md
```

You make the first meaningful change.

Then another.

Then another.

Conceptually:

```text
A ─── B ─── C ─── D
```

Each point represents a recorded state in the project's history.

The current project is not disconnected from its past.

It is the result of a sequence of changes.

```text
Past
 │
 ▼
A → B → C → D
           │
           ▼
         Current
```

This history is one of the most valuable things Git provides.

---

# What Is a Commit?

A **commit** is a recorded change in Git history.

It represents a deliberate point in the evolution of the project.

For example:

```text
A ─── B ─── C
```

Each of these points can represent a commit.

A commit typically contains information that allows Git to identify and describe a particular state/change in the project's history.

A useful mental model is:

> **A commit is a named checkpoint in the evolution of your project.**

For example:

```text
Commit A
"Create project structure"

        ↓

Commit B
"Add authentication"

        ↓

Commit C
"Fix login validation"
```

The exact commit message is chosen by the engineer, but the important idea is that each commit records a meaningful unit of change.

---

# A Commit Is Not Just "Save"

This is an important distinction.

Saving a file and committing a change are different operations.

When you save a file:

```text
Editor
  │
  ▼
File changed
```

The file has changed on your machine.

Git does not automatically mean:

> "This is now a permanent point in project history."

A commit is an intentional act of recording a change into Git history.

Conceptually:

```text
Edit Files
    │
    ▼
Changes Exist
    │
    ▼
Review Changes
    │
    ▼
Record a Commit
    │
    ▼
Project History
```

This distinction is fundamental.

---

# Why Are Commits Useful?

Imagine that an engineer makes one huge commit containing:

- authentication changes,
- database changes,
- UI changes,
- configuration changes,
- formatting changes,
- and unrelated cleanup.

The history becomes difficult to understand.

Instead, meaningful changes can be recorded separately.

```text
Commit 1
Add user authentication

Commit 2
Add database validation

Commit 3
Fix login error handling
```

This creates a clearer history.

A good commit should generally answer:

> **What meaningful change does this checkpoint represent?**

---

# Small, Meaningful Changes

Small commits are easier to understand than large unrelated commits.

Compare:

```text
Commit:
"Update stuff"
```

with:

```text
Commit:
"Fix invalid password handling"
```

The second communicates much more useful information.

This does not mean every commit must contain only one changed line.

The important principle is **cohesion**.

A commit should represent a related unit of work.

---

# Commit Messages

A commit message should help another engineer understand the intention of the change.

Weak:

```text
changes
update
final
fix
new code
```

Better:

```text
Add email validation to registration
```

Better commit messages reduce the amount of investigation required when reading project history.

However, a commit message does not replace the actual code or documentation.

It is a concise description of the change's intent.

---

# Git Tracks Changes Over Time

Suppose a configuration value changes:

```text
timeout = 30
```

Later:

```text
timeout = 60
```

Git can help identify that the file changed.

Conceptually:

```text
Before

timeout = 30


After

timeout = 60
```

This ability to compare states is extremely useful.

It allows engineers to investigate questions such as:

> "What changed between the working version and the broken version?"

---

# The Basic Git Workflow

At a high level, a developer's local Git workflow can be understood as:

```text
1. Inspect the project
        ↓
2. Make changes
        ↓
3. Review changes
        ↓
4. Prepare changes for recording
        ↓
5. Create a commit
        ↓
6. Continue development
```

The exact Git commands used to perform these actions are less important initially than understanding the state transitions.

The important mental model is:

```text
Files
  │
  │ edit
  ▼
Working Changes
  │
  │ prepare
  ▼
Changes Ready to Record
  │
  │ commit
  ▼
Recorded History
```

The repository structure chapter will explain these states in greater depth.

---

# A Simple Example

Suppose you are building a Python application.

Initially:

```text
app.py
README.md
requirements.txt
```

You implement a login feature.

Your files change.

Conceptually:

```text
Initial State
     │
     ▼
Add Login Code
     │
     ▼
Review Changes
     │
     ▼
Commit
     │
     ▼
"Add user login"
```

Later you fix a login bug:

```text
"Add user login"
       │
       ▼
"Fix invalid login handling"
```

The project history now communicates how the login feature evolved.

---

# Why History Matters

History becomes especially valuable when something goes wrong.

Suppose the application worked yesterday but fails today.

Without version control:

```text
"It worked before."
```

That statement provides little information.

With a useful history:

```text
Working State
      │
      ▼
Commit A
      │
      ▼
Commit B
      │
      ▼
Commit C
      │
      ▼
Broken State
```

Engineers can investigate the changes between these states.

This turns debugging from pure guesswork into an investigation based on recorded evidence.

---

# Git and Team Development

Git also enables engineers to maintain their own development work while sharing project history.

Conceptually:

```text
             Project History
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     Engineer A           Engineer B
          │                   │
       Changes             Changes
          │                   │
          └─────────┬─────────┘
                    ▼
             Shared Development
```

This becomes much more important when branches and pull requests are introduced.

For now, remember the basic principle:

> **Git provides a structured history of changes that engineers can use as a foundation for collaboration.**

Branching and collaboration mechanisms are covered in later chapters.

---

# Git's Distributed Nature

Git is called distributed because a Git repository can contain the project's history locally.

This has an important consequence.

An engineer does not need to contact a central server for every basic historical operation.

For example, local Git can generally:

- inspect history,
- compare changes,
- create commits,
- create branches,
- and perform many other operations

without requiring constant communication with a remote server.

This makes Git different from systems whose core workflow depends on a central repository for every operation.

---

## Local Repository vs Shared Repository

It is useful to distinguish between two ideas.

### Local repository

The Git repository available on an engineer's machine.

### Shared remote repository

A repository hosted somewhere that allows engineers to exchange project history and collaborate.

Common hosting platforms include GitHub, GitLab, and Bitbucket.

The important distinction is:

```text
Local Git Repository
        │
        │ exchange changes
        ▼
Shared Remote Repository
```

Git itself provides the version-control model.

Hosting platforms provide additional collaboration infrastructure around Git.

Do not confuse Git with a specific hosting platform.

---

# Git vs GitHub

This distinction is important for beginners.

**Git** is the version-control system.

**GitHub** is a platform that can host Git repositories and provide collaboration features.

Similarly, Git repositories can be hosted using other platforms.

Therefore:

```text
Git
│
└── Version Control System


GitHub / GitLab / Bitbucket
│
└── Platforms that can host and support collaboration around repositories
```

The underlying engineering concepts in this curriculum are based on Git and version control, not on one particular platform.

---

# What Git Actually Gives an Engineer

At a high level, Git provides several capabilities.

```text
                 Git
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
   History     Changes     Identity
      │           │           │
      ▼           ▼           ▼
  What happened? What changed? Who changed it?
```

Together, these capabilities allow engineers to reason about the evolution of software.

This is much more powerful than simply storing the latest copy of a file.

---

# Engineering Perspective

The most important shift in thinking is this:

### Beginner mental model

> "Git stores my code."

### Stronger engineering mental model

> "Git records the evolution of my codebase so that changes can be understood, compared, and managed."

The second model leads to better engineering decisions.

When working with Git, ask:

- What change am I making?
- Why am I making it?
- Is this change understandable?
- Should this change be recorded separately?
- Will another engineer understand the history later?
- If this change causes a problem, can the history help investigate it?

These questions are more important than memorizing commands.

---

## Practical Example: A Small Feature

Imagine a Python project:

```text
shopping-app/
├── app.py
├── users.py
├── products.py
└── README.md
```

You need to add user registration.

A reasonable development sequence could be:

```text
Start
  │
  ▼
Understand existing code
  │
  ▼
Implement registration
  │
  ▼
Review changes
  │
  ▼
Record meaningful commit
  │
  ▼
Continue development
```

A possible history might look like:

```text
A  Initial project structure
│
B  Add user registration
│
C  Validate registration input
│
D  Fix duplicate email handling
```

Now six months later, another engineer can inspect the history and understand how the feature evolved.

That is the value of version control.

---

# Production Perspective

Version control is foundational to professional software engineering.

It appears in almost every serious software environment:

- Backend services
- Frontend applications
- Data engineering projects
- Machine learning systems
- LLM applications
- Libraries
- Infrastructure repositories
- Internal enterprise applications
- Open-source projects

For an AI engineer, this is especially important.

An enterprise GenAI system may contain:

```text
Application Code
       │
       ├── API Services
       ├── Data Processing
       ├── Retrieval Logic
       ├── Prompt Templates
       ├── Evaluation Code
       ├── Configuration
       └── Tests
```

These components evolve continuously.

Version control provides the history needed to understand those changes.

Later domains will build additional engineering practices around this foundation.

---

# Engineering Decisions

## When Should Version Control Be Used?

Almost always for software projects.

A project should generally be placed under version control when:

- code is being developed,
- multiple people may modify it,
- changes need to be tracked,
- history matters,
- or the project needs reliable collaboration.

Even small projects benefit from having a clear history.

---

## When Is a Simple File Backup Enough?

A backup may be sufficient for very simple personal data where change history and collaboration do not matter.

For example:

```text
Personal image collection
```

does not necessarily need Git.

But a software project generally has a different requirement:

```text
Change
   ↓
Understand
   ↓
Compare
   ↓
Review
   ↓
Recover
   ↓
Collaborate
```

This is where version control becomes valuable.

---

# Trade-Offs

Version control introduces some complexity.

Engineers must learn:

- repositories,
- commits,
- branches,
- histories,
- change management,
- and collaboration workflows.

There is also a small operational cost in maintaining meaningful history.

But the trade-off is generally favorable for software engineering:

```text
Small Learning Cost
        +
Small Workflow Cost
        ↓
Large Reduction in
Change Management Risk
```

The value increases as the project and team grow.

---

# Common Mistakes

## Mistake 1 — Thinking Git Is Just Backup

### Incorrect

> "Git is mainly for keeping another copy of my code."

### Why it is incomplete

Git's important value is the history and management of changes.

### Better understanding

Think of Git as a system for recording and reasoning about software evolution.

---

## Mistake 2 — Committing Everything as One Huge Change

### Problem

One commit contains many unrelated changes.

### Why it is harmful

It makes history difficult to understand and investigate.

### Better approach

Keep commits logically cohesive.

---

## Mistake 3 — Using Meaningless Commit Messages

### Problem

```text
update
fix
changes
final
```

### Why it is harmful

The history becomes difficult to understand.

### Better approach

Describe the meaningful change.

```text
Fix invalid login handling
```

---

## Mistake 4 — Assuming Saving a File Creates Git History

### Problem

An engineer changes a file and assumes Git has permanently recorded the change.

### Why it is incorrect

Changing a file and recording a commit are separate actions.

### Better understanding

```text
Edit
 ↓
Change exists
 ↓
Review
 ↓
Commit
 ↓
History
```

---

## Mistake 5 — Confusing Git With GitHub

### Problem

Treating Git and GitHub as the same thing.

### Better understanding

Git is the version-control system.

GitHub is one platform that can host Git repositories and support collaboration.

---

## Mistake 6 — Treating Commit Count as a Quality Metric

Having many commits does not automatically mean good engineering.

For example:

```text
100 meaningless commits
```

may be less useful than:

```text
10 clear, cohesive commits
```

The quality of the history matters more than the raw number of commits.

---

# Interview Questions

## 1. Why does version control exist?

**Expected answer:**

Version control exists to manage changes to software over time. It preserves history, helps engineers understand what changed, supports recovery and comparison, and enables teams to collaborate safely.

---

## 2. Is Git a backup system?

**Expected answer:**

Not primarily. Git does preserve project history locally, but its main purpose is version control: recording and managing changes so engineers can understand, compare, and collaborate around software evolution.

---

## 3. What is Git?

**Expected answer:**

Git is a distributed version-control system used to record and manage changes to files over time.

---

## 4. What is a commit?

**Expected answer:**

A commit is a recorded point in Git history representing a meaningful change or project state.

---

## 5. Why are meaningful commits important?

**Expected answer:**

Meaningful commits make project history easier to understand, review, debug, and investigate.

---

## 6. What is the difference between saving a file and committing a change?

**Expected answer:**

Saving changes the file on the local filesystem. Committing intentionally records a change into Git history.

---

## 7. What is the difference between Git and GitHub?

**Expected answer:**

Git is the version-control system. GitHub is a platform that can host Git repositories and provide collaboration features around them.

---

## 8. Why is project history valuable?

**Expected answer:**

History provides evidence of how the project evolved. It helps engineers understand changes, investigate bugs, compare states, and reason about previous decisions.

---

## 9. Why is Git called distributed?

**Expected answer:**

A Git repository can contain the project's history locally, allowing many version-control operations without depending on a central server for every operation.

---

## 10. Scenario: A production bug appeared today. Why can Git history help?

**Expected answer:**

Engineers can investigate the changes between a known working state and the current broken state. This reduces reliance on memory or guesswork when identifying what may have caused the problem.

---

## Quick Revision

### Why version control?

Because software changes continuously and teams need a reliable way to manage those changes and preserve history.

### What is Git?

A distributed version-control system.

### What is the core mental model?

Git records the evolution of a project through its history.

```text
Change → Record → History
```

### What is a commit?

A meaningful recorded point in project history.

### Why do commits matter?

They make changes understandable and provide useful historical checkpoints.

### Is Git just backup?

No.

Backup preserves data.

Version control manages change and history.

### Git vs GitHub?

```text
Git      → Version control
GitHub   → Hosting and collaboration platform
```

### Core workflow

```text
Make Changes
     ↓
Review Changes
     ↓
Record Commit
     ↓
Project History
```

### Core engineering idea

> **Treat software changes as information that should be deliberately recorded, understood, and managed.**

---

# Key Takeaways

- Software projects evolve continuously.
- Version control provides a structured way to manage that evolution.
- Git is a distributed version-control system.
- Git provides a history of project changes.
- A commit represents a meaningful recorded point in that history.
- Saving a file and committing a change are different operations.
- Small, cohesive commits create more useful history.
- Good commit messages communicate change intent.
- Git is not the same thing as GitHub.
- Version control is useful because it supports investigation, recovery, comparison, and collaboration.
- The real engineering value of Git is not command memorization.
- The deeper goal is to make software change **traceable, understandable, and manageable**.

---

## Further Reading

For long-term understanding, prioritize primary and authoritative resources when studying Git itself.

- [Git Documentation](https://git-scm.com/docs)
- [Git Book — Pro Git](https://git-scm.com/book/en/v2)
- [Git Reference](https://git-scm.com/docs)

These resources can be used after completing the conceptual material in this chapter.

---

## End of Document

This completes the Markdown file:

`01-Git-Fundamentals.md`

This chapter establishes the Git mental model. Detailed repository structure, branching, merging, rebasing, pull requests, reviews, releases, issue tracking, and collaborative development are intentionally handled by the subsequent ENG-04 documents.
