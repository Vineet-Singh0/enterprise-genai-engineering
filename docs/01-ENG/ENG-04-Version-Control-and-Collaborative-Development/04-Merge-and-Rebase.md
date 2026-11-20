# Merge & Rebase

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why separate development histories eventually need to be integrated.
- Understand the mental model behind merging and rebasing.
- Explain what a merge does to project history.
- Explain what a rebase does to project history.
- Understand the difference between preserving history and rewriting history.
- Understand why conflicts can occur during integration.
- Compare merge and rebase from an engineering perspective.
- Reason about when each approach may be appropriate.
- Understand the risks of rewriting shared history.
- Recognize common mistakes when working with merge and rebase.

---

## Prerequisites

Before starting this chapter, you should understand:

- Git fundamentals
- Commits and project history
- Repository structure
- Branches
- Branch divergence

See:

- [Git Fundamentals](./01-Git-Fundamentals.md)
- [Repository Structure](./02-Repository-Structure.md)
- [Branching Strategies](./03-Branching-Strategies.md)

---

## Estimated Reading Time

**35–45 minutes**

---

## Before We Start

Imagine two engineers working on the same project.

The project starts here:

```text
A ─── B ─── C
```

Engineer A works on one feature:

```text
A ─── B ─── C ─── D ─── E
```

Engineer B works on another:

```text
A ─── B ─── C
              \
               F ─── G
```

Now there are two development histories.

Eventually, the team needs the work from both histories.

This creates a fundamental engineering question:

> **How should two different lines of development become one history again?**

Git provides multiple ways to approach this.

Two important ones are:

- **Merge**
- **Rebase**

They can both help integrate changes, but they represent different approaches to project history.

---

# Why Does Integration Exist?

Branches allow engineers to work independently.

But independence cannot continue forever.

Eventually:

```text
Feature A
   │
   ▼
Completed Work
   │
   └────────┐
            │
Feature B   │
   │        │
   ▼        │
Completed Work
            │
            ▼
       Integration
```

The separate work needs to become part of a common development history.

This is where merge and rebase become relevant.

The important relationship is:

```text
Branching
    ↓
Divergent Histories
    ↓
Integration
    ↓
Merge / Rebase
```

Branching answers:

> "How can we develop independently?"

Merge and rebase answer:

> "How do we bring those development histories together?"

---

# The Mental Model

Consider this history:

```text id="5qqz0f"
             D ─── E
            /
A ─── B ─── C
            \
             F ─── G
```

There is a common history:

```text
A → B → C
```

Then the histories diverged.

One side contains:

```text
D → E
```

The other contains:

```text
F → G
```

The two approaches we will study treat that history differently.

### Merge

Merge says, conceptually:

> **Keep both histories and create a new point where they come together.**

### Rebase

Rebase says, conceptually:

> **Take one line of changes and replay it on top of another point in history.**

That difference is the heart of merge versus rebase.

---

# Merge

A **merge** combines two development histories.

Suppose we have:

```text
             D ─── E
            /
A ─── B ─── C
            \
             F ─── G
```

The histories have diverged.

A merge can create a new commit that brings the histories together:

```text
             D ─── E
            /       \
A ─── B ─── C       M
            \       /
             F ─── G
```

`M` represents the merge point.

The exact internal details are more complex, but the important mental model is:

> **Merge preserves the fact that development happened along multiple lines and records their integration.**

---

# What Does Merge Preserve?

A merge generally preserves the existing commits and their relationships.

For example:

```text id="6nt0wl"
        D ─── E
       /       \
A ─── B         M
       \       /
        F ─── G
```

The history still shows that two lines of development existed.

This can be useful because the history reflects what actually happened.

You can reason about:

- where the branches diverged,
- what work happened on each line,
- and when the histories were brought together.

---

# Merge as "Join the Histories"

A useful mental model is:

```text id="s7c1wq"
History A
     \
      \
       ───► Combined History
      /
     /
History B
```

Merge does not pretend that the two histories were always one straight line.

It records their convergence.

This makes merge useful when preserving the topology of development is important.

---

# Fast-Forward Merge

Sometimes the histories have not actually diverged.

Consider:

```text id="9m3w1f"
A ─── B ─── C
```

Suppose the main line remains at `B`, while another branch advances:

```text id="e4a3t8"
main
 │
A ─── B
       \
        C ─── D
```

If the changes can simply move the main branch pointer forward:

```text id="h9h7dy"
A ─── B ─── C ─── D
```

there is no need for a separate merge commit.

This is commonly called a **fast-forward**.

The important idea is:

> **If no histories have diverged, integration may simply move the branch reference forward.**

---

# When Histories Actually Diverge

Now consider:

```text id="x1d5sq"
        C ─── D
       /
A ─── B
       \
        E ─── F
```

Here there are two lines of development.

A fast-forward cannot represent the integration because both sides have advanced.

A merge may produce:

```text id="4a0k1x"
        C ─── D
       /       \
A ─── B         M
       \       /
        E ─── F
```

The merge commit represents the convergence.

---

# Rebase

Rebase takes a different approach.

Instead of creating a merge point between two histories, it moves a sequence of commits so they are based on another point.

Consider:

```text id="i7a4q9"
A ─── B ─── C
          \
           D ─── E
```

Suppose the branch containing `D` and `E` should now be based on `C`.

Conceptually, rebase takes the changes represented by:

```text
D
E
```

and replays them on top of the new base.

The result can look like:

```text id="4f5z4m"
A ─── B ─── C ─── D' ─── E'
```

The important detail is the apostrophe.

`D'` and `E'` are not the original commit objects.

They represent newly created commits containing the corresponding changes on the new base.

---

# Rebase as "Replay the Changes"

A useful mental model is:

```text id="h3s4xk"
Original History

A ─── B ─── C
          \
           D ─── E

Rebase

Take:
D
E

Replay on top of:
C

Result

A ─── B ─── C ─── D' ─── E'
```

This can create a more linear-looking history.

But there is an important consequence:

> **Rebase rewrites commit history.**

That distinction matters greatly when other people may already depend on the original commits.

---

# Why Does Rebase Create New Commits?

A commit is tied to its history.

If the parent of a commit changes, the resulting commit is effectively a different commit.

For example:

```text id="m9d2q8"
Original:

A ─── B ─── D
          parent
```

After changing the base:

```text id="3d9g0v"
A ─── B ─── C ─── D'
```

`D'` is based on a different history.

Therefore Git creates a new commit rather than modifying the old one in place.

This is why rebase is considered a history-rewriting operation.

---

# Merge vs Rebase

The central difference can be summarized as:

```text id="3m2j8p"
MERGE

Keep existing histories
        +
Record their convergence
```

versus:

```text id="v6p5xx"
REBASE

Move/replay changes
        +
Create a new history shape
```

A simplified comparison:

| Aspect | Merge | Rebase |
|---|---|---|
| Main idea | Join histories | Replay commits onto a new base |
| Existing commit history | Preserved | Rewritten for rebased commits |
| History shape | Can show divergence and convergence | Can produce a more linear history |
| Creates new commit(s) for integration | Often yes | Not necessarily a merge commit |
| Risk | Generally lower for shared history | Higher when rewriting shared history |
| Main concern | History can become more complex | History can become misleading or disruptive if used carelessly |

Neither approach is universally better.

The correct choice depends on context.

---

# A Visual Comparison

Start with:

```text id="k5q8o3"
             D ─── E
            /
A ─── B ─── C
```

## Merge

Conceptually:

```text id="r7h8z1"
             D ─── E
            /       \
A ─── B ─── C       M
```

The branch history remains visible.

## Rebase

Conceptually:

```text id="p3w9as"
A ─── B ─── C ─── D' ─── E'
```

The feature commits have been replayed onto the new base.

The histories therefore tell different stories.

---

# Why Would an Engineer Prefer Merge?

Merge can be useful when preserving the actual development history matters.

For example:

```text id="7ks5xq"
Feature Branch
      │
      ▼
Independent Development
      │
      ▼
Merge
      │
      ▼
Main History
```

The resulting history can show:

> "This work was developed separately and was later integrated."

That information can be valuable in some teams and repositories.

---

# Why Would an Engineer Prefer Rebase?

Rebase can be useful when an engineer wants a cleaner or more linear development history.

For example:

```text id="y8u1m6"
Before:

A ─── B ─── C
       \
        D ─── E

After:

A ─── B ─── C ─── D' ─── E'
```

This can make the history easier to follow in some workflows.

But the cleaner-looking history comes at a cost:

> **The original commit identities are replaced by rewritten commits.**

That is why rebase requires more care.

---

# History Shape vs History Truth

This is an important engineering trade-off.

A linear history can be easier to read:

```text id="c1qf6r"
A ─ B ─ C ─ D ─ E ─ F
```

But a graph can sometimes communicate more accurately how work actually happened:

```text id="z8j5pb"
       D ─ E
      /     \
A ─ B        F
      \     /
       G ─ H
```

Therefore:

> **A simpler history is not automatically a more truthful history.**

Engineers should decide whether the priority is:

- preserving the actual development topology,
- maintaining a clean linear narrative,
- or balancing both.

---

# What Is History Rewriting?

History rewriting means creating a new version of existing history rather than simply adding new commits after it.

Rebase is one example.

Conceptually:

```text id="f5y3u1"
Original

A ─── B ─── D ─── E

Rewritten

A ─── B ─── C ─── D' ─── E'
```

The old `D` and `E` are no longer the same commits represented by `D'` and `E'`.

This is why rewriting history can affect other engineers.

---

# Why Rewriting Shared History Is Risky

Suppose Engineer A and Engineer B both have access to:

```text id="e9p0a8"
A ─── B ─── C ─── D
```

Engineer B builds work on top of `D`.

Now Engineer A rewrites the history containing `D`.

The repository may now contain:

```text id="j2m8s4"
A ─── B ─── C ─── D'
```

From Git's perspective, `D'` is not the same commit as `D`.

Engineer B's work may still refer to the original history.

This creates coordination problems.

The key principle is:

> **Rewriting history that other people already depend on can disrupt their work.**

---

# Shared vs Private History

This leads to a useful engineering rule.

### Private or local work

Rewriting history can be reasonable when the commits are primarily under your control and nobody else depends on them.

### Shared work

Rewriting history requires much more caution when other engineers have already based work on those commits.

Conceptually:

```text id="x9y2s3"
Private History
      │
      ▼
More freedom to rewrite

Shared History
      │
      ▼
Rewrite with caution
```

The exact team policy may vary, but the underlying risk does not.

---

# Conflicts

Merge and rebase can both encounter conflicts.

A **conflict** occurs when Git cannot safely determine how competing changes should be combined automatically.

For example:

Engineer A changes:

```text id="6z6nwy"
timeout = 30
```

Engineer B changes the same line to:

```text id="4c9k2f"
timeout = 60
```

Git cannot automatically decide whether the correct result is:

```text
30
```

or:

```text
60
```

or perhaps something else.

A human needs to understand the intended behavior.

---

# A Conflict Is Not Just a Text Problem

It is tempting to think:

> "A merge conflict is just a Git problem."

That is incomplete.

The real issue is often an engineering decision.

Suppose two branches implement:

```text id="k7h8y2"
Branch A:
Authentication uses method X.

Branch B:
Authentication uses method Y.
```

Git may detect overlapping changes.

But Git cannot know which behavior the product actually requires.

The engineer must understand the code and choose the correct result.

Therefore:

> **Conflict resolution is often a software-design decision, not merely a text-editing task.**

---

# Conflict Resolution Mental Model

When a conflict occurs:

```text id="q6z7t2"
Conflicting Changes
       │
       ▼
Understand Both Changes
       │
       ▼
Understand Intended Behavior
       │
       ▼
Choose Correct Result
       │
       ▼
Continue Integration
```

Do not blindly choose one side simply because Git labels it as one branch or another.

Understand what each change was trying to accomplish.

---

# Merge Conflicts

During a merge, Git may detect conflicting changes.

Conceptually:

```text id="d8g2r5"
Branch A
   │
   └── Change X

Branch B
   │
   └── Change Y

       ↓

   Conflict

       ↓

Human Decision
```

The goal is not merely to make Git stop reporting a conflict.

The goal is to produce a correct software state.

---

# Rebase Conflicts

Rebase can also encounter conflicts while replaying commits.

Conceptually:

```text id="z4r1n6"
Replay Commit D'
        │
        ▼
Conflict
        │
        ▼
Resolve
        │
        ▼
Continue Replay
        │
        ▼
Replay Commit E'
```

The same engineering principle applies:

> Understand the intended behavior before resolving the conflict.

---

# Merge Does Not Mean "Ignore History"

A common misconception is:

> "Merge is the safe option, so I don't need to understand the history."

Incorrect.

Merge still requires engineers to understand:

- which branches are being combined,
- what changes occurred,
- whether conflicts matter,
- and whether the resulting code is correct.

The difference is primarily how the histories are represented.

---

## Rebase Does Not Mean "Better Git"

Another common misconception is:

> "Rebase creates a cleaner history, so it is always better."

Incorrect.

Rebase has advantages, but it also rewrites history.

A clean-looking history is not automatically worth the coordination cost of rewriting shared commits.

The correct question is:

> **What history representation best fits this situation?**

---

## Engineering Decision Framework

When choosing between merge and rebase, consider:

```text id="q2o6s9"
1. Is the history private or shared?
          │
          ▼
2. Does preserving branch topology matter?
          │
          ▼
3. Would a linear history improve understanding?
          │
          ▼
4. What coordination cost does rewriting create?
          │
          ▼
5. What does the team's workflow expect?
```

This is better than following a rule such as:

> "Always merge."

or:

> "Always rebase."

---

# Practical Scenario: Private Feature Work

Suppose you have a local feature branch that nobody else is using.

The main development line has moved forward.

You want your feature work to be based on the latest main history.

Conceptually:

```text id="a8q3u4"
Before:

main
A ─── B ─── C ─── D

feature
          \
           E ─── F
```

You may choose to rebase the private feature work:

```text id="v2n8y7"
A ─── B ─── C ─── D ─── E' ─── F'
```

The feature history now appears on top of the newer base.

Because the feature history is private, the rewriting cost may be manageable.

---

# Practical Scenario: Shared Branch

Suppose several engineers are actively building on the same branch.

```text id="4r0f1n"
Engineer A
    │
    ▼
Shared Branch
    ▲
    │
Engineer B
```

If one engineer rewrites the branch's history, the other engineer's local history may no longer align with the rewritten commits.

The coordination cost can become significant.

This is why shared history should be treated carefully.

---

# Production Perspective

Merge and rebase appear in everyday software development.

They matter in:

- backend repositories,
- frontend applications,
- machine-learning systems,
- data platforms,
- LLM applications,
- open-source projects,
- enterprise software,
- and large multi-team codebases.

The underlying problem is always similar:

```text id="q2z0nf"
Independent Development
          ↓
Different Histories
          ↓
Need Integration
          ↓
Choose Integration Approach
```

The tools may vary by platform, but the engineering trade-offs remain.

---

# Common Mistakes

## Mistake 1 — Thinking Merge and Rebase Are Identical

### Problem

An engineer assumes both commands simply "combine branches."

### Why it is wrong

They can produce different history structures.

### Correct understanding

Merge preserves the divergent histories and records their convergence.

Rebase replays commits onto a different base and rewrites the affected history.

---

## Mistake 2 — Rebasing Shared History Without Understanding the Consequences

### Problem

An engineer rewrites commits that other developers already use.

### Why it is risky

Other developers may have histories based on the original commits.

### Better approach

Treat shared history carefully and follow the team's agreed workflow.

---

## Mistake 3 — Choosing Rebase Only Because the History Looks Cleaner

### Problem

Visual simplicity becomes the only decision criterion.

### Why it is incomplete

History readability must be balanced against historical accuracy and coordination cost.

---

## Mistake 4 — Choosing Merge Automatically

### Problem

An engineer never considers whether a different history shape would improve maintainability.

### Better approach

Understand the team's workflow and the purpose of the integration.

---

## Mistake 5 — Resolving Conflicts Without Understanding the Code

### Problem

An engineer chooses one side simply to make the conflict disappear.

### Why it is dangerous

The resulting code may be syntactically valid but behaviorally incorrect.

### Better approach

Understand the intent behind both changes before deciding on the final result.

---

## Mistake 6 — Treating a Conflict as Failure

### Problem

The engineer assumes a conflict means the branching strategy was necessarily wrong.

### Better understanding

Conflicts are a natural consequence of independent development touching overlapping areas.

The important skill is resolving them correctly.

---

## Engineering Decisions

## Prefer Merge When

Merge may be appropriate when:

- preserving the development topology matters,
- the history is shared,
- explicit integration points are useful,
- or the team prefers to record branch convergence.

---

## Prefer Rebase When

Rebase may be appropriate when:

- the commits are private or controlled,
- a linear history provides real value,
- the team understands history rewriting,
- and rewriting will not disrupt other developers.

These are guidelines, not universal rules.

---

## A More Important Question

Instead of asking:

> "Is merge better than rebase?"

Ask:

> **"What history do we want to preserve, and who depends on that history?"**

That question leads to better engineering decisions.

---

## Merge and Rebase in a Team Workflow

A simplified workflow can look like:

```text id="j5n4x9"
Create Branch
     │
     ▼
Develop
     │
     ▼
Main Branch Advances
     │
     ▼
Bring Histories Together
     │
     ├───────────────┐
     ▼               ▼
  Merge            Rebase
     │               │
     └───────┬───────┘
             ▼
       Ready for Integration
```

The next chapter explains how pull requests provide a structured team mechanism for proposing and integrating changes.

See [Pull Requests](./05-Pull-Request.md).

---

# Interview Questions

## 1. Why do merge and rebase exist?

**Expected answer:**

They provide ways to integrate changes from different development histories.

---

## 2. What is the main difference between merge and rebase?

**Expected answer:**

Merge combines histories and records their convergence, while rebase replays commits onto a new base and rewrites the affected history.

---

## 3. Does rebase change existing commits?

**Expected answer:**

It creates new commits based on a different history. The rebased commits therefore have different identities from the original commits.

---

## 4. Why can rebasing shared history be dangerous?

**Expected answer:**

Other engineers may already have commits based on the original history. Rewriting it can cause their local histories to diverge from the rewritten shared history and create coordination problems.

---

## 5. What is a fast-forward?

**Expected answer:**

A fast-forward occurs when one branch has not diverged and its history can simply be advanced to a later commit without creating a separate merge commit.

---

## 6. Does merge always create a merge commit?

**Expected answer:**

No. If the history can be fast-forwarded, Git can move the branch pointer forward without creating a separate merge commit.

---

## 7. What is a merge conflict?

**Expected answer:**

A conflict occurs when Git cannot safely determine how competing changes should be combined automatically.

---

## 8. Why is conflict resolution an engineering problem?

**Expected answer:**

Because Git may identify overlapping changes but cannot determine the intended software behavior. Engineers must understand both changes and decide what the correct result should be.

---

## 9. Is rebase always better because it creates a cleaner history?

**Expected answer:**

No. A cleaner-looking history is only one consideration. Rebase rewrites history, which can create coordination problems when other engineers depend on the original commits.

---

## 10. Scenario: Your private feature branch is behind the main branch. Would rebase necessarily be wrong?

**Expected answer:**

No. If the feature history is private and controlled, rebasing it onto the newer base may be reasonable if the team workflow allows it and the resulting history is useful.

---

## 11. Scenario: A shared branch is used by several engineers. Should one engineer freely rewrite its history?

**Expected answer:**

Generally, no. Rewriting shared history can disrupt other developers whose work depends on the original commits. The team should follow an explicit policy before rewriting shared history.

---

## 12. Scenario: A conflict occurs while integrating a feature. What should you do first?

**Expected answer:**

Understand what both sides were trying to accomplish. Then determine the correct software behavior before resolving the conflicting code.

---

## Quick Revision

## Why integration?

Branches allow independent work.

Eventually the histories need to come together.

```text id="e8a4ck"
Branches
   ↓
Divergence
   ↓
Integration
```

## Merge

```text id="k4b0e8"
Keep histories
     +
Record convergence
```

Example:

```text id="t1a8dc"
       D ─ E
      /     \
A ─ B       M
      \     /
       F ─ G
```

## Rebase

```text id="h9d1e7"
Replay commits
      +
Change their base
```

Example:

```text id="f6k2r8"
A ─ B ─ C ─ D' ─ E'
```

## Key difference

> **Merge preserves divergent history and records convergence. Rebase rewrites the affected history by replaying commits onto a new base.**

## Shared history

```text id="4j9x3n"
Private history → more freedom

Shared history  → rewrite cautiously
```

## Conflicts

A conflict means Git cannot safely determine the correct combination automatically.

Resolve the **engineering intent**, not just the text conflict.

## Decision question

> **What history do we want to preserve, and who depends on it?**

---

# Key Takeaways

- Branches create separate development histories.
- Those histories eventually need to be integrated.
- Merge and rebase are two different approaches to integration.
- Merge preserves the existing development histories and records their convergence.
- Rebase replays commits onto a different base and therefore rewrites the affected history.
- A fast-forward is possible when histories have not actually diverged.
- Rebase can produce a more linear history, but linearity is not automatically better.
- Rewriting private history is generally less disruptive than rewriting history that others depend on.
- Conflicts occur when Git cannot safely determine how competing changes should be combined.
- Conflict resolution requires understanding software intent, not merely editing text until Git is satisfied.
- There is no universal rule that merge is always better or rebase is always better.
- The right choice depends on history ownership, team workflow, desired history shape, and integration cost.

---

## Further Reading

- [Git — git-merge Documentation](https://git-scm.com/docs/git-merge)
- [Git — git-rebase Documentation](https://git-scm.com/docs/git-rebase)
- [Pro Git — Git Branching](https://git-scm.com/book/en/v2/Git-Branching)
- [Pro Git — Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)

The next chapter, [Pull Requests](./05-Pull-Request.md), will build on branches and integration while focusing on the team-level process for proposing and coordinating changes.
