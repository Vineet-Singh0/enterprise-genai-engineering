# Branching Strategies

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why branches exist in version control.
- Build a mental model of a Git branch.
- Understand how branches support parallel development.
- Explain the relationship between branches, commits, and project history.
- Understand common branching strategies at a conceptual level.
- Evaluate branching strategies based on team size, workflow, and release needs.
- Explain the trade-offs between short-lived and long-lived branches.
- Recognize common branching mistakes.
- Reason about branch strategy as an engineering decision rather than a Git command preference.

---

## Prerequisites

Before starting this chapter, you should understand:

- The purpose of version control.
- The concept of a commit.
- Git history.
- The basic repository structure.
- The difference between working changes and recorded history.

See:

- [Git Fundamentals](./01-Git-Fundamentals.md)
- [Repository Structure](./02-Repository-Structure.md)

---

## Estimated Reading Time

**30–40 minutes**

---

## Before We Start

Imagine five engineers working on the same application.

At the same time:

- one engineer is building authentication,
- another is fixing a database bug,
- another is improving the API,
- another is updating documentation,
- and another is investigating a production issue.

All of them are changing the same codebase.

A natural question appears:

> **How can several engineers work on the same project without constantly interfering with each other?**

One answer is to give each piece of work its own development path.

That is the purpose of a **branch**.

---

## Why Do Branches Exist?

Without branches, imagine that every engineer writes directly into the same line of project history:

```text id="f7wq9x"
A ── B ── C ── D ── E ── F
     ↑    ↑    ↑    ↑
   Alice Bob  Carol David
```

This can become difficult to manage.

Different features may be incomplete at the same time.

A partially finished feature should not necessarily become part of the main development line.

Branches provide separation.

Conceptually:

```text id="3l6n0w"
                 Feature A
                    │
                    ▼
A ─── B ─────────── C ─── D
       \
        \
         E ─── F
              │
              ▼
           Feature B
```

Now different pieces of work can evolve independently.

The important idea is:

> **A branch provides a separate line of development within the project's history.**

---

# Mental Model: A Branch Is a Line of Development

A common beginner mistake is to think of a branch as:

> "A copy of the entire project folder."

That mental model is not very useful.

A better model is:

> **A branch is a named line of development that points into a project's history.**

Consider:

```text id="7ly5c7"
A ─── B ─── C
```

Suppose you create a feature branch from `C`.

Now:

```text id="xw4jby"
A ─── B ─── C
              \
               D ─── E
                    ^
                    │
               feature branch
```

The feature branch represents a separate development path.

The original line can continue independently.

---

# Branches and Commits

Branches are closely connected to commits.

A simplified mental model is:

```text id="1b8i4d"
Commit A
   │
   ▼
Commit B
   │
   ▼
Commit C
   │
   ├────────► Commit D ───► Commit E
   │
   └────────► Commit F ───► Commit G
```

There are now multiple lines of development.

For example:

```text id="x4o5zq"
main
  │
  C
  │\
  │ \
  │  D ─── E
  │
  F ─── G
```

The important relationship is:

```text id="a8w6lq"
Branch
  ↓
Points to a line of commits
```

Branches become useful because commits create history, and branches provide named paths through that history.

---

# Why Not Just Create More Copies of the Project?

You could manually copy the project:

```text id="jyj83a"
project/
project-auth/
project-database/
project-api/
```

But this creates problems.

You now need to determine:

- Which copy is current?
- Which changes belong to which version?
- How do you combine the changes?
- How do you know what changed between copies?
- What happens when two copies modify the same file?

Git branches provide a structured way to represent parallel development while keeping the histories connected.

---

# Parallel Development

Suppose the main development line is:

```text id="9g0h7x"
A ─── B ─── C
```

Engineer A starts authentication:

```text id="z7j5p2"
A ─── B ─── C
              \
               D ─── E
```

Engineer B starts database work:

```text id="5izw7r"
              D ─── E
             /
A ─── B ─── C
             \
              F ─── G
```

Now the two efforts can progress independently.

This is the main value of branches:

> **They allow work to diverge without immediately forcing every change into the same development line.**

Eventually, those lines may need to be integrated.

That integration is the subject of [Merge & Rebase](./04-Merge-and-Rebase.md).

---

# Branches Reduce Change Interference

Imagine a feature is only 30% complete.

If its unfinished code is placed directly into the shared development line, other engineers may encounter:

- incomplete behavior,
- temporary code,
- failing tests,
- unfinished interfaces,
- or unexpected changes.

A separate branch provides isolation.

```text id="0of4qb"
Shared Development
       │
       ▼
     Stable
       │
       ├───────────────┐
       ▼               ▼
   Feature A        Feature B
   In Progress      In Progress
```

The work can mature before it is integrated.

This does not automatically make the code safe, but it creates a boundary around the work.

---

# Branches Do Not Eliminate Collaboration Problems

A branch is not a magic isolation mechanism.

Two engineers can still modify the same parts of the code.

For example:

```text id="n6l8nd"
Feature A
    │
    └── modifies auth.py

Feature B
    │
    └── modifies auth.py
```

Eventually, those changes may conflict.

Branches separate development histories, but they do not eliminate the need to integrate those histories.

This is why branch strategy and merge strategy are closely related.

---

# Short-Lived Branches

A **short-lived branch** exists for a relatively small piece of work and is integrated soon after the work is complete.

Conceptually:

```text id="j5p3iq"
main
  │
  C
  │\
  │ D ─── E
  │       │
  │       └── integrate
  │
  F
```

Examples of work that may fit a short-lived branch:

- a small feature,
- a bug fix,
- a focused refactoring,
- a documentation update.

### Advantages

Short-lived branches can:

- reduce divergence,
- make changes easier to review,
- reduce integration difficulty,
- keep work moving through the system.

### Risk

If the branch is created for work that is too large, it may still remain open for a long time.

The important principle is not simply:

> "Always create short branches."

It is:

> **Minimize the amount of time that independent development histories unnecessarily diverge.**

---

# Long-Lived Branches

A **long-lived branch** remains separate from another development line for a longer period.

Conceptually:

```text id="a0c0qg"
main
 │
 ├── A ─── B ─── C ─── D
 │
 └── Feature
       │
       ├── E
       ├── F
       ├── G
       ├── H
       └── I
```

The longer the branch remains separate, the more its history can diverge.

That can increase integration complexity.

However, long-lived branches are not automatically wrong.

There are situations where teams may intentionally maintain separate development lines.

The engineering question is:

> **Why does this branch need to remain separate, and what cost does that separation create?**

---

# Branch Divergence

Consider:

```text id="8e8n3p"
             D ─── E ─── F
            /
A ─── B ─── C
            \
             G ─── H ─── I
```

The two lines have diverged from `C`.

As development continues:

```text id="c3o4kk"
More commits
     ↓
More differences
     ↓
More integration work
```

This is not always a problem.

But divergence increases the possibility that:

- the same files were changed differently,
- assumptions changed,
- interfaces changed,
- code moved,
- behavior changed,
- or one branch became incompatible with the other.

Therefore:

> **Branch lifetime is an engineering trade-off.**

---

# Branch Strategy

A **branching strategy** is the set of rules a team uses to decide:

- when branches are created,
- what branches represent,
- how long they should live,
- who works on them,
- how they are integrated,
- and how the team protects important development lines.

A branching strategy is therefore not simply:

> "Which Git command do we use?"

It is a team coordination decision.

---

## Why Teams Need a Branching Strategy

Without shared rules, different engineers may use branches differently.

For example:

```text id="v2o8w5"
Engineer A
feature/login

Engineer B
new-feature

Engineer C
fix

Engineer D
development-v2-final

Engineer E
test-branch
```

The names are not the main problem.

The deeper problem is that nobody knows what the branches mean.

A team needs predictable conventions.

For example:

```text id="4z9f8j"
main
feature/*
bugfix/*
```

The exact naming convention can vary.

The important part is that the team understands what each branch represents.

---

# Common Branching Strategies

Different teams use different strategies.

There is no single strategy that is correct for every organization.

Three useful conceptual models are:

1. Feature-oriented branching
2. Mainline-oriented development
3. Environment/release-oriented branching

These names describe patterns rather than mandatory Git workflows.

---

## 1. Feature-Oriented Branching

In feature-oriented branching, individual pieces of work receive their own branches.

Conceptually:

```text id="2f5s7y"
main
 │
 ├── feature/authentication
 │
 ├── feature/search
 │
 └── feature/profile
```

Each feature can develop independently.

### Advantages

- Clear separation of work.
- Easy to associate a branch with a feature.
- Supports focused reviews.
- Multiple features can be developed in parallel.

### Risks

If feature branches remain open for too long, they can diverge significantly from the main development line.

---

# 2. Mainline-Oriented Development

In a mainline-oriented approach, teams keep a primary development line continuously updated and integrate changes frequently.

Conceptually:

```text id="b0f9ix"
main
 │
 A ─ B ─ C ─ D ─ E ─ F
```

Changes are integrated into the main line regularly rather than remaining isolated for long periods.

This approach reduces long-term divergence.

However, it requires strong engineering discipline.

Teams need:

- small changes,
- good testing,
- reliable review,
- clear ownership,
- and confidence in the shared development line.

The specific automation and CI/CD practices that may support this approach belong to later curriculum domains.

---

# 3. Environment or Release-Oriented Branching

Some teams maintain separate long-lived development lines associated with different stages or release states.

Conceptually:

```text id="v8pjg6"
development
     │
     ▼
release
     │
     ▼
stable
```

This can make sense when a team has specific release-management requirements.

However, more long-lived branches create more divergence and therefore more coordination cost.

The decision should be driven by actual engineering requirements rather than by habit.

---

# Comparing Branching Approaches

| Approach | Main Idea | Strength | Main Risk |
|---|---|---|---|
| Feature-oriented | Separate branch per piece of work | Clear isolation | Long-lived branches can diverge |
| Mainline-oriented | Integrate changes frequently | Low divergence | Requires strong discipline |
| Release-oriented | Separate lines for release states | Explicit release separation | More branches and coordination |

The important lesson is:

> **A branching strategy is a trade-off between isolation and integration cost.**

More isolation can make independent work easier.

But more isolation can also increase divergence.

More frequent integration reduces divergence.

But it requires stronger coordination and engineering discipline.

---

## The Isolation vs Integration Trade-Off

This is one of the most important engineering ideas in branching.

```text id="0ezj1p"
More Isolation
     │
     ├── Easier independent development
     ├── Less immediate interference
     └── More potential divergence
                    │
                    ▼
              Higher integration cost
```

On the other side:

```text id="s5p6lu"
More Frequent Integration
     │
     ├── Less divergence
     ├── Faster feedback
     └── More frequent coordination
```

Neither extreme is automatically correct.

Good engineering balances the two.

---

# Branch Naming

A branch name should communicate its purpose.

For example:

```text id="xx7g9f"
feature/user-registration
feature/payment-history
bugfix/login-timeout
```

Compare this with:

```text id="n4v7u1"
test
new
branch2
final
new-final
vineet
```

The first group communicates intent.

The second group requires the reader to investigate what the branch actually represents.

Good naming reduces cognitive overhead.

---

# Branch Naming Is a Team Convention

There is no universal branch naming system.

A team may use:

```text id="yqg6ip"
feature/*
bugfix/*
chore/*
```

Another team may use:

```text id="1d6yqk"
feat/*
fix/*
```

The specific prefixes matter less than consistency.

A useful rule is:

> **A branch name should make its purpose understandable without requiring tribal knowledge.**

---

# Branches and Ownership

A branch often represents a unit of work, but it does not necessarily mean one person owns all changes forever.

For example:

```text id="khv5x5"
feature/authentication
        │
        ├── Engineer A
        └── Engineer B
```

Teams may collaborate on a branch when necessary.

The branch strategy should support the team's actual collaboration model.

---

# When Should a Branch Be Created?

A branch is useful when independent development needs to be separated from another development line.

Common situations include:

- implementing a feature,
- fixing a bug,
- experimenting with a change,
- preparing a focused improvement,
- or isolating work that should not immediately affect another development line.

The decision should be based on the desired development boundary.

Ask:

> **"Does this work need its own development path?"**

If yes, a branch may be appropriate.

---

## When Should a Branch Be Avoided?

Branches introduce coordination overhead.

A branch may be unnecessary when:

- the change is extremely small,
- the team's workflow does not require isolation,
- or creating a separate development path would add more complexity than value.

The exact policy depends on the team.

There is no engineering rule that says:

> "Every single change must always have a branch."

Instead, understand the purpose of the branch and the cost it creates.

---

## Branch Lifetime as a Design Decision

Consider two branches.

### Branch A

```text id="y6d5r7"
Created
  ↓
Small change
  ↓
Review
  ↓
Integrated
```

### Branch B

```text id="afk6r1"
Created
  ↓
Feature development
  ↓
More development
  ↓
Main changes
  ↓
More development
  ↓
More main changes
  ↓
Integration
```

Branch B has had more time to diverge.

Therefore branch lifetime should be considered intentionally.

Ask:

- Why does this branch need to exist?
- How long should it remain separate?
- What happens while it is separate?
- How will it eventually be integrated?

---

# Branches and Incomplete Work

A common reason for branches is to keep incomplete work away from a shared development line.

Suppose:

```text id="u9qjwm"
Feature = 20% complete
```

You may not want the unfinished behavior integrated yet.

A branch can provide a development boundary:

```text id="qj2s2u"
main
 │
 ├── stable development
 │
 └── feature/payment
        │
        ├── 20%
        ├── 50%
        ├── 80%
        └── 100%
```

Once the work reaches an appropriate state, it can be considered for integration.

The mechanics of integration belong to the next chapter.

---

# Production Perspective

Professional engineering teams use branches to manage change at different scales.

For example, an enterprise application may have:

```text id="w7ivcl"
Main Development Line
        │
        ├── Authentication Work
        ├── Search Work
        ├── Reporting Work
        └── Bug Fixes
```

An AI engineering repository may similarly contain:

```text id="6w1r2n"
Main Development Line
        │
        ├── RAG improvement
        ├── evaluation change
        ├── API change
        └── prompt update
```

The underlying principle is the same.

The technology domain does not change the core reason for branching:

> **Separate independent development until the changes are ready to be integrated.**

---

# Branching in Enterprise Teams

In a larger organization, branch strategy becomes a coordination mechanism.

Different teams may work on different parts of a large codebase.

A useful branch strategy helps establish:

- predictable workflows,
- clear ownership,
- understandable history,
- manageable integration,
- and controlled change.

However, branch strategy alone does not guarantee software quality.

It works together with practices such as:

- code review,
- testing,
- issue tracking,
- and controlled integration.

Those practices are covered elsewhere in ENG-04 or later curriculum domains.

---

## Common Mistakes

## Mistake 1 — Creating Long-Lived Branches Without a Reason

### Problem

A branch exists for months simply because the team started it.

### Why it is risky

The branch may diverge significantly from the main development line.

### Better understanding

A long-lived branch should have a clear engineering reason.

---

## Mistake 2 — Believing More Branches Means Better Engineering

### Problem

A team creates branches for every tiny action.

### Why it is harmful

Too many branches can increase cognitive and coordination overhead.

### Better approach

Create branches where they provide useful isolation.

---

## Mistake 3 — Treating Branches as Permanent

### Problem

Engineers assume branches should remain indefinitely.

### Better understanding

Many branches represent temporary development work.

Their useful lifetime ends when their work has been appropriately integrated or otherwise concluded.

---

## Mistake 4 — Using Meaningless Names

### Problem

```text id="0q2wgr"
branch1
test2
newbranch
final-final
```

### Why it is harmful

The purpose of the branch is unclear.

### Better approach

Use names that communicate intent.

---

## Mistake 5 — Thinking Branches Prevent Conflicts

### Problem

> "We used branches, so merging will be easy."

### Why it is incorrect

Branches separate histories; they do not guarantee that changes will be compatible.

Two branches can modify the same code differently.

Integration can still require conflict resolution and engineering judgment.

---

## Mistake 6 — Using a Branching Strategy Without Understanding Its Cost

### Problem

A team copies a popular workflow without understanding why it exists.

### Why it is harmful

The strategy may not fit the team's size, release process, or development style.

### Better approach

Evaluate the actual trade-offs.

---

# Engineering Decisions

## Question 1 — How Much Isolation Do We Need?

If developers frequently interfere with one another, stronger separation may help.

If branches remain separate for too long, integration cost may increase.

---

## Question 2 — How Frequently Should Work Be Integrated?

Frequent integration reduces divergence.

But frequent integration requires:

- disciplined changes,
- clear communication,
- good review practices,
- and confidence in the shared development line.

---

## Question 3 — How Long Should a Branch Live?

Prefer a lifetime that matches the actual reason the branch exists.

Do not keep a branch alive merely because it already exists.

---

## Question 4 — Which Branching Strategy Should a Team Use?

Do not choose based only on popularity.

Consider:

```text id="u8fd8h"
Team Size
    +
Work Type
    +
Release Model
    +
Integration Frequency
    +
Risk Tolerance
    ↓
Branching Strategy
```

The right strategy is the one that provides an appropriate balance between development isolation and integration cost.

---

# Scenario: Small Engineering Team

Suppose four engineers work on an application.

They release frequently and usually work on small changes.

A reasonable strategy may emphasize:

- short-lived work branches,
- frequent integration,
- clear branch names,
- focused changes.

Why?

Because small changes reduce the amount of divergence that must later be integrated.

---

## Scenario: Large Enterprise Team

Now imagine dozens of engineers working across multiple teams.

The codebase is large and different teams have different responsibilities.

A more explicit branching strategy may be necessary.

The team may need clearer conventions around:

- branch purpose,
- ownership,
- integration,
- and release boundaries.

The exact strategy should still be chosen based on the organization's actual needs.

---

## Scenario: Experimental Work

Suppose an engineer wants to test a major architectural idea.

The change may be uncertain.

A separate branch can provide a useful boundary:

```text id="h6u3q2"
main
 │
 └── experiment/new-architecture
          │
          ├── Test idea
          ├── Evaluate
          └── Decide
```

The important question is not:

> "Should every experiment use a branch?"

It is:

> **"Would separating this uncertain work reduce risk or interference?"**

---

# Branching and Engineering Risk

Branching is fundamentally about managing change risk.

```text id="z9nq7k"
Independent Work
       │
       ▼
Controlled Separation
       │
       ▼
Review / Validation
       │
       ▼
Integration
```

The branch provides the separation.

Other engineering practices determine whether the change is actually safe.

This is why branching should not be viewed as an isolated Git feature.

It is part of a broader change-management system.

---

# Relationship to Merge and Rebase

Branches eventually create multiple development histories.

For example:

```text id="lqv5xw"
             D ─── E
            /
A ─── B ─── C
            \
             F ─── G
```

At some point, those histories may need to be combined.

That creates the next engineering question:

> **How should two development histories be integrated?**

The answer involves merge and rebase.

See [Merge & Rebase](./04-Merge-and-Rebase.md).

This chapter intentionally stops at the branching concept and does not teach merge or rebase mechanics.

---

# Relationship to Pull Requests

A branch often becomes the boundary around a proposed change.

Conceptually:

```text id="zcrjbu"
Branch
   │
   ▼
Completed Change
   │
   ▼
Pull Request
```

The pull-request workflow is responsible for proposing and coordinating integration.

See [Pull Requests](./05-Pull-Request.md).

---

# Interview Questions

## 1. Why do branches exist?

**Expected answer:**

Branches provide separate lines of development so engineers can work independently without immediately placing incomplete or unrelated changes into the same development line.

---

## 2. What is a Git branch?

**Expected answer:**

A branch is a named line of development within Git history. A useful simplified mental model is that it points to a particular line or tip of commits.

---

## 3. Are branches copies of the project?

**Expected answer:**

That is an incomplete mental model. Branches are better understood as named lines of development within project history.

---

## 4. Why are short-lived branches often useful?

**Expected answer:**

They provide temporary isolation while minimizing how far the development history diverges from the main line, which can reduce integration complexity.

---

## 5. Are long-lived branches always bad?

**Expected answer:**

No. They may be justified by particular engineering or release requirements. The important consideration is whether their benefits justify the additional divergence and coordination cost.

---

## 6. What is branch divergence?

**Expected answer:**

Branch divergence occurs when separate development lines accumulate different commits and therefore represent increasingly different project histories.

---

## 7. Does using branches eliminate merge conflicts?

**Expected answer:**

No. Branches separate development histories but do not guarantee that changes will be compatible. Conflicts can still occur during integration.

---

## 8. What makes a good branching strategy?

**Expected answer:**

A good strategy fits the team's development model and balances isolation against integration cost. It provides predictable rules for creating, naming, maintaining, and integrating branches.

---

## 9. Scenario: A feature branch has been open for three months. What questions should you ask?

**Expected answer:**

Ask why the branch needs to remain separate, how much it has diverged, whether the work can be broken into smaller changes, and what integration risks have accumulated.

---

## 10. Scenario: A team creates a new branch for every tiny change. Is that automatically good engineering?

**Expected answer:**

No. Branches introduce coordination overhead. They should provide useful isolation; unnecessary branching can increase complexity without providing meaningful value.

---

## Quick Revision

## Why branches?

To provide separate lines of development.

```text id="a9n3p1"
One Development Line
        ↓
Multiple Independent Lines
```

## Core mental model

> **A branch is a named line of development within project history.**

## Branches + commits

```text id="rj5m7g"
Commit
  ↓
Commit
  ↓
Branch
  ↓
More commits
```

## Short-lived vs long-lived

| Short-lived | Long-lived |
|---|---|
| Less divergence | More potential divergence |
| Easier integration | Higher integration cost |
| Good for focused work | Useful when separation has a clear reason |

## Main trade-off

```text id="6vlx4c"
More Isolation
      ↕
More Integration Cost

More Frequent Integration
      ↕
More Coordination
```

## Branch strategy

A branching strategy defines:

- when branches are created,
- what they represent,
- how long they live,
- how they are named,
- and how they are integrated.

## Core engineering question

> **How much isolation does this work need, and what integration cost will that isolation create?**

---

# Key Takeaways

- Branches allow independent development within the same project history.
- A branch is better understood as a named line of development, not simply a copied project folder.
- Branches are built around commits and project history.
- Branches reduce immediate interference between independent work.
- Branches do not eliminate integration problems.
- Short-lived branches generally reduce divergence.
- Long-lived branches may be appropriate when there is a clear engineering reason.
- Branch naming should communicate intent.
- A branching strategy is a team-level engineering decision.
- The central trade-off is **development isolation versus integration cost**.
- Good branching strategies fit the team's size, work patterns, and release needs.
- Branches eventually lead to the question of how separate histories should be integrated, which is covered by merge and rebase.

---

## Further Reading

- [Git Branching — Pro Git](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell)
- [Git Branch Documentation](https://git-scm.com/docs/git-branch)
- [Git Book — Git Branching](https://git-scm.com/book/en/v2/ch00/ch03-git-branching)

The next chapter, [Merge & Rebase](./04-Merge-and-Rebase.md), owns the detailed explanation of how divergent development histories are integrated.
