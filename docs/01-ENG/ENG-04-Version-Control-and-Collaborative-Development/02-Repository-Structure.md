# Repository Structure

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what a Git repository is.
- Understand the relationship between a working directory, staging area, and repository.
- Explain why Git separates working changes from recorded history.
- Understand how files move through the basic Git workflow.
- Distinguish between uncommitted changes and committed history.
- Explain how Git uses these different areas to provide controlled change management.
- Reason about what state a change is in during development.
- Avoid common mistakes caused by misunderstanding Git's repository structure.

---

## Prerequisites

Before starting this chapter, you should understand:

- The purpose of version control.
- The basic Git mental model.
- The concept of a commit.
- The idea that Git records project history.

See [Git Fundamentals](./01-Git-Fundamentals.md) for the foundational mental model.

---

## Estimated Reading Time

**25–35 minutes**

---

## Before We Start

Imagine you are editing a software project.

You change three files.

At this point, should Git immediately consider all three changes part of the project's permanent history?

Not necessarily.

You may want to:

- inspect the changes,
- decide which changes belong together,
- leave some changes for later,
- prepare a specific set of changes,
- and only then record them as a commit.

This creates an important question:

> **Where does a change exist before it becomes part of project history?**

Git answers this by separating the development process into different areas.

The simplified model is:

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

Understanding this model is one of the most important foundations for using Git correctly.

---

# Why Does This Structure Exist?

A naive version-control system could work like this:

```text
Edit File
   ↓
Immediately Record Change
```

But real development is rarely that simple.

An engineer may change several files while working on multiple things.

For example:

```text
app.py          → authentication change
database.py     → authentication change
README.md       → documentation change
debug.py        → temporary debugging change
```

You may want to record only the authentication work.

If Git automatically recorded everything immediately, you would lose control over what belongs in the next commit.

Git therefore provides an intermediate area where you can prepare the next commit.

That intermediate area is the **staging area**.

---

# The Three Important Areas

For this chapter, use this mental model:

```text
┌─────────────────────┐
│   Working Directory │
│                     │
│ Files you are       │
│ currently editing   │
└──────────┬──────────┘
           │
           │ prepare changes
           ▼
┌─────────────────────┐
│    Staging Area      │
│                     │
│ Changes selected    │
│ for next commit     │
└──────────┬──────────┘
           │
           │ commit
           ▼
┌─────────────────────┐
│      Repository      │
│                     │
│ Recorded Git history │
└─────────────────────┘
```

Each area has a different responsibility.

---

# 1. Working Directory

The **working directory** is the set of files you are currently working with.

In simple terms:

> **This is where you edit the project.**

Suppose your project contains:

```text
project/
├── app.py
├── database.py
├── config.py
└── README.md
```

You open `app.py` and change some code.

The file has now changed in your working directory.

Conceptually:

```text
Working Directory

app.py       ← changed
database.py  ← unchanged
config.py    ← unchanged
README.md    ← unchanged
```

The change exists on your machine, but it has not necessarily been recorded in Git history.

---

# Working Changes Are Not Yet History

This distinction is critical.

Suppose the repository contains:

```text
Commit A
```

You modify `app.py`.

Now the situation is:

```text
Repository History
       │
       ▼
    Commit A

Working Directory
       │
       ▼
app.py has new changes
```

The new change is not automatically part of `Commit A`.

The old commit remains unchanged.

This is an important property of version control:

> **Changing a file does not rewrite an existing commit.**

You are creating a new potential change that may eventually become part of a future commit.

---

# 2. Staging Area

The **staging area** is where you prepare the changes that should go into the next commit.

Think of it as a preparation area.

```text
Working Directory
       │
       │ select changes
       ▼
Staging Area
       │
       │ commit
       ▼
Repository History
```

Suppose you changed three files:

```text
app.py
database.py
README.md
```

But you only want the first two changes in the next commit.

You can conceptually prepare:

```text
Working Directory
├── app.py       ✓
├── database.py  ✓
├── README.md    -
```

The staging area therefore gives you control over the exact set of changes you are preparing to record.

---

# Why Have a Staging Area?

The staging area provides a useful separation:

```text
What I changed
       ≠
What I want to record now
```

This distinction is extremely useful.

Imagine you are working on a feature and notice an unrelated typo.

You fix both:

```text
Feature change
+
Typo fix
```

You may decide that these should not become one commit.

The staging area allows you to prepare related changes separately.

This leads to cleaner project history.

---

# 3. Repository

The **repository** is where Git maintains the project's recorded history.

Once a change is committed, it becomes part of the repository's history.

Conceptually:

```text
Working Directory
       │
       ▼
Staging Area
       │
       ▼
Commit
       │
       ▼
Repository History
```

The repository therefore represents the recorded side of the development process.

It contains the information Git needs to understand the project's history.

---

# The Complete Mental Model

Put the three areas together:

```text
                 YOU
                  │
                  │ edit
                  ▼
        ┌──────────────────┐
        │ Working Directory│
        └────────┬─────────┘
                 │
                 │ prepare
                 ▼
        ┌──────────────────┐
        │  Staging Area    │
        └────────┬─────────┘
                 │
                 │ commit
                 ▼
        ┌──────────────────┐
        │    Repository    │
        │                  │
        │  Git History     │
        └──────────────────┘
```

This gives you three distinct questions:

### Working Directory

> What am I currently changing?

### Staging Area

> What do I want to include in my next commit?

### Repository

> What changes have I permanently recorded in Git history?

This distinction is more important than memorizing individual commands.

---

# A Practical Example

Suppose you start with:

```text
Commit A
```

You then modify two files:

```text
app.py
database.py
```

The state becomes:

```text
Repository
    │
    └── Commit A

Working Directory
    │
    ├── app.py       changed
    └── database.py  changed
```

Now you prepare `app.py`.

```text
Repository
    │
    └── Commit A

Staging Area
    │
    └── app.py       selected

Working Directory
    │
    └── database.py  changed but not staged
```

Now you commit.

```text
Repository

Commit A
   │
   ▼
Commit B
```

`Commit B` contains the staged change.

The database change can remain in the working directory for later.

---

# The Key State Transition

A useful way to understand Git is to focus on state transitions.

```text
                    edit
                     │
                     ▼
              ┌─────────────┐
              │   Changed   │
              │    Files    │
              └──────┬──────┘
                     │
                  prepare
                     │
                     ▼
              ┌─────────────┐
              │   Staged    │
              │   Changes   │
              └──────┬──────┘
                     │
                   commit
                     │
                     ▼
              ┌─────────────┐
              │   Recorded  │
              │   History   │
              └─────────────┘
```

This is the central workflow of this chapter.

---

# What Happens When You Modify a File?

Suppose Git currently knows:

```text
version = 1
```

You change the file to:

```text
version = 2
```

The working directory now contains the new value.

But the repository's existing history still represents the previous recorded state.

Conceptually:

```text
Repository History
version = 1

        ≠

Working Directory
version = 2
```

Git can therefore identify that the working directory has changes relative to the recorded state.

---

# What Happens When You Stage the Change?

After preparing the change:

```text
Working Directory
version = 2

        │
        ▼

Staging Area
version = 2

        │
        ▼

Repository
version = 1
```

Notice something important:

The repository history has still not changed.

The change is only prepared for the next commit.

This is why the staging area is an intermediate state.

---

# What Happens When You Commit?

When the staged changes are committed:

```text
Working Directory
version = 2
        │
        ▼
Staging Area
version = 2
        │
        ▼
Commit
        │
        ▼
Repository History
version = 2
```

Now the new state has been recorded.

The repository history has moved forward.

Conceptually:

```text
Commit A
   │
   ▼
Commit B
```

---

# Clean and Changed States

Another useful mental model is the difference between a **clean** and **changed** working state.

### Clean

Your working files match the recorded state.

```text
Working Directory
       │
       │ matches
       ▼
Recorded State
```

There are no unrecorded changes.

### Changed

Your working files differ from the recorded state.

```text
Working Directory
       │
       │ differs
       ▼
Recorded State
```

There are changes that have not yet become part of recorded history.

This distinction becomes useful when inspecting a repository before making further changes.

---

# Staging Does Not Mean Committing

This is one of the most common beginner misunderstandings.

```text
Stage
  ≠
Commit
```

Staging means:

> "Prepare this change for the next commit."

Committing means:

> "Record the staged change in Git history."

The complete process is:

```text
Edit
 ↓
Stage
 ↓
Commit
```

Not:

```text
Edit
 ↓
Stage
 = finished
```

The change is only part of history after the commit.

---

# You Can Stage Selectively

Suppose you modify four files:

```text
app.py
database.py
README.md
debug.log
```

You may decide that only the first two belong to the current logical change.

Conceptually:

```text
Working Directory
├── app.py
├── database.py
├── README.md
└── debug.log

        │

        ▼

Staging Area
├── app.py
└── database.py
```

This lets the next commit remain focused.

The other changes can remain outside the next commit.

This is one reason the staging area is valuable for creating clean history.

---

# Why Clean History Matters

Suppose six months later an engineer investigates a bug.

They inspect the history and find:

```text
Commit:
"Update files"
```

That tells them very little.

Now imagine:

```text
Commit:
"Fix session expiration handling"
```

The second history is easier to reason about.

A clean history improves:

- debugging,
- maintenance,
- review,
- historical understanding,
- and collaboration.

The staging area helps engineers construct that history deliberately.

---

# Repository Structure and Commit History

A Git repository is not simply a folder containing the latest files.

It also represents recorded project history.

Conceptually:

```text
Repository
│
├── Current project state
│
└── Historical information
      │
      ├── Commit A
      ├── Commit B
      ├── Commit C
      └── Commit D
```

This historical information allows Git to reason about how the project evolved.

The details of Git's internal object model are outside the scope of this chapter.

The important engineering model is:

> **The repository is the recorded history against which your current work is compared and from which new history is created.**

---

# The `.git` Directory

A Git repository created in a project normally contains a hidden `.git` directory.

Conceptually:

```text
project/
├── app.py
├── README.md
├── config.py
└── .git/
```

The `.git` directory contains Git's repository metadata and information needed to manage the repository's history and state.

For example, it is associated with information about:

- commits,
- references,
- repository configuration,
- and other internal Git data.

You generally should not manually modify its internal contents.

For this chapter, remember:

> **The `.git` directory is what turns an ordinary project directory into a Git repository.**

The internal object model behind it is an implementation detail and does not need to be memorized to use Git effectively.

---

# A Repository Is Not the Same as a Remote

Another important distinction:

```text
Local Repository
       │
       │ exchange history
       ▼
Remote Repository
```

Your local repository exists on your machine.

A remote repository is another repository location used for sharing and collaboration.

For example, a team may host a repository on GitHub.

But the fundamental Git repository model exists independently of GitHub.

The collaboration workflow built around remote repositories will be covered later in this topic.

---

# Repository Structure in a Team Context

Consider two engineers.

```text
Engineer A
    │
    ▼
Local Repository A

Engineer B
    │
    ▼
Local Repository B
```

Each engineer can have their own local Git repository.

A shared remote repository can provide a common exchange point:

```text
Local Repository A
        │
        ▼
Shared Remote Repository
        ▲
        │
Local Repository B
```

The important idea is that Git's local repository model remains useful even when collaboration is added.

Branching, remote synchronization, and pull-request workflows build on this foundation.

---

# Engineering Perspective

The repository structure provides an important control boundary.

Without separation:

```text
Edit
  ↓
Immediately permanent history
```

With separation:

```text
Edit
  ↓
Inspect
  ↓
Select
  ↓
Prepare
  ↓
Record
```

This gives the engineer more control over what becomes project history.

That control is especially important when:

- several files are changing,
- changes are unrelated,
- temporary debugging work exists,
- a feature is being developed incrementally,
- or a team depends on readable history.

---

# How an Engineer Should Reason About Git State

When working with Git, do not ask only:

> "What command should I run?"

First ask:

> **"What state is my change currently in?"**

For example:

### Situation 1

You edited a file.

Ask:

> Is the change only in my working directory?

### Situation 2

You selected the change for the next commit.

Ask:

> Is it now staged?

### Situation 3

You created a commit.

Ask:

> Is the change now part of repository history?

This state-based thinking is much more reliable than memorizing commands without understanding what they do.

---

## Common Mistakes

## Mistake 1 — Thinking the Working Directory Is the Repository History

### Incorrect

> "The file currently contains this code, so Git history must contain it."

### Why it is wrong

Your working directory can contain changes that have not been committed.

### Correct understanding

```text
Working Directory
      ≠
Recorded History
```

---

## Mistake 2 — Thinking Staging Means Committing

### Incorrect

> "I staged it, so it is already saved in Git history."

### Why it is wrong

Staging only prepares changes for the next commit.

### Correct understanding

```text
Stage
 ↓
Prepare

Commit
 ↓
Record
```

---

## Mistake 3 — Committing Everything Automatically

### Problem

An engineer stages every modified file without checking whether all changes belong together.

### Why it matters

Unrelated changes can become mixed into one commit.

### Better approach

Inspect changes and decide deliberately what belongs in the next logical unit of history.

---

## Mistake 4 — Treating `.git` as an Ordinary Project Folder

### Problem

An engineer manually changes or deletes internal `.git` data.

### Why it is dangerous

That directory contains repository metadata required by Git.

### Better approach

Manage repository state through Git itself rather than manually editing its internal structure.

---

## Mistake 5 — Confusing Local and Remote Repositories

### Problem

Thinking that Git only works when connected to GitHub or another hosting service.

### Correct understanding

Git repositories can exist locally.

Remote repositories are used for sharing and collaboration.

---

## Mistake 6 — Thinking Git Stores Only the Current Files

### Problem

The engineer thinks the repository is simply another copy of the current project.

### Correct understanding

A Git repository also maintains information about project history.

---

# Engineering Decisions

## When Does the Staging Area Matter Most?

It becomes particularly useful when:

- several files changed,
- only some changes belong in the next commit,
- unrelated work is mixed together,
- or you want deliberate control over commit boundaries.

---

## Should Every File Change Be Staged Immediately?

Not necessarily.

The correct decision depends on what you want the next commit to represent.

Ask:

> **"What coherent change am I trying to record?"**

Then prepare the changes that belong to that change.

---

## Should Engineers Care About Repository State?

Yes.

Before committing or collaborating, engineers should understand whether they have:

- uncommitted changes,
- staged changes,
- or clean working state.

Knowing the current state prevents accidental assumptions.

---

## Practical Scenario

Imagine you are working on an API.

You make these changes:

```text
auth.py
database.py
README.md
debug.py
```

The changes represent:

```text
auth.py       → Login feature
database.py   → Login feature
README.md     → Documentation
debug.py      → Temporary debugging
```

You want the next commit to represent only the login feature.

A reasonable conceptual process is:

```text
All Changes
     │
     ├── auth.py ───────┐
     │                  │
     ├── database.py ───┤
     │                  ▼
     │              Next Commit
     │
     ├── README.md
     │
     └── debug.py
```

The staging area lets you select the changes that belong together.

The important lesson is not the specific command.

It is:

> **Commit boundaries should reflect logical engineering changes.**

---

# Relationship to Git Fundamentals

The previous chapter introduced commits and Git history.

This chapter explains where changes exist **before and during the process of creating that history**.

The relationship is:

```text
Git Fundamentals
       │
       ├── Why version control?
       ├── Git mental model
       ├── Commits
       └── History
              │
              ▼
Repository Structure
       │
       ├── Working Directory
       ├── Staging Area
       └── Repository
```

The two concepts should be understood together.

The previous chapter established **why history matters**.

This chapter explains **how changes move toward that history**.

---

# Relationship to Future Chapters

Repository structure provides the foundation for understanding later Git concepts.

### Branching

Branches provide different lines of development within Git history.

See [Branching Strategies](./03-Branching-Strategies.md).

### Merge and Rebase

Merge and rebase operate on development histories and therefore depend on understanding commits and repositories.

See [Merge & Rebase](./04-Merge-and-Rebase.md).

### Pull Requests

Pull requests build on branches, commits, and repository collaboration.

See [Pull Requests](./05-Pull-Requests.md).

This chapter does not re-teach those concepts.

---

## Interview Questions

## 1. What is a Git repository?

**Expected answer:**

A Git repository is a project managed by Git that contains the information Git uses to track and maintain the project's recorded history and state.

---

## 2. What is the working directory?

**Expected answer:**

The working directory is the set of project files that an engineer is currently working on. It can contain changes that have not yet been recorded in Git history.

---

## 3. What is the staging area?

**Expected answer:**

The staging area is an intermediate area where an engineer prepares the changes that should be included in the next commit.

---

## 4. Why does Git need a staging area?

**Expected answer:**

It gives engineers control over which changes belong in the next commit. This allows related changes to be grouped together and unrelated changes to remain separate.

---

## 5. What is the difference between staging and committing?

**Expected answer:**

Staging prepares changes for the next commit. Committing records those staged changes into Git history.

---

## 6. Can a file be changed without changing Git history?

**Expected answer:**

Yes. Editing a file changes the working directory, but Git history remains unchanged until the change is committed.

---

## 7. What is the purpose of the `.git` directory?

**Expected answer:**

It contains Git repository metadata and information required for Git to manage the repository's state and history.

---

## 8. Is a local Git repository the same as a remote repository?

**Expected answer:**

No. A local repository exists on the engineer's machine. A remote repository is another repository location used to exchange and share project history.

---

## 9. Scenario: You modified five files but only two belong to the feature you want to commit. What should you reason about first?

**Expected answer:**

First identify which changes logically belong to the intended commit. Then prepare only those changes for the commit, leaving unrelated work separate.

---

## 10. Why is understanding repository state more important than memorizing Git commands?

**Expected answer:**

Because Git commands manipulate repository state. Understanding whether a change is in the working directory, staging area, or repository allows an engineer to choose the correct operation instead of blindly executing commands.

---

## Quick Revision

### Three important areas

```text
Working Directory
      ↓
Staging Area
      ↓
Repository
```

### Working Directory

Where you currently edit files.

### Staging Area

Where you prepare selected changes for the next commit.

### Repository

Where Git maintains recorded project history.

### The core transition

```text
Edit
 ↓
Stage
 ↓
Commit
```

### Important distinction

```text
Changed file
    ≠
Staged change
    ≠
Committed history
```

### Why staging exists

It allows you to decide:

> "Which changes belong in my next logical commit?"

### `.git`

The `.git` directory contains Git's repository metadata and internal information.

### Local vs remote

```text
Local Repository
       ↕
Remote Repository
```

A remote is used for sharing and collaboration; Git itself is not the same thing as a hosting platform.

### Core engineering idea

> **Always know what state your changes are in before deciding what to do with them.**

---

# Key Takeaways

- A Git repository manages both project state and recorded history.
- The working directory contains the files you are currently editing.
- The staging area contains changes prepared for the next commit.
- The repository contains recorded Git history.
- Editing a file does not automatically change Git history.
- Staging and committing are different operations.
- Selective staging allows engineers to create logically focused commits.
- The `.git` directory contains repository metadata and internal Git information.
- Local repositories can exist independently of remote hosting platforms.
- Understanding Git state is more important than memorizing commands.
- Clean commit boundaries begin with deliberate selection of changes.
- Repository structure provides the foundation for understanding branching, merge/rebase, and collaborative workflows.

---

## Further Reading

- [Git Documentation](https://git-scm.com/docs)
- [Git Book — Pro Git](https://git-scm.com/book/en/v2)
- [Git Repository Documentation](https://git-scm.com/docs/gitrepository-layout)

---

## End of Document

This completes the Markdown file:

`02-Repository-Structure.md`
