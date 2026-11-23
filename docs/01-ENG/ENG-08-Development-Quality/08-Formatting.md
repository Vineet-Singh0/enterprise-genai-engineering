# Formatting

## 1. Overview

Formatting is the process of applying consistent presentation rules to source code so that indentation, spacing, line wrapping, and related layout choices follow a shared standard.

Formatting does not change the intended behavior of a program. It changes how the source is written and displayed so that engineers spend less time negotiating style and more time reviewing meaning.

For example, a formatter may rewrite this:

```python
def calculate_total(price,quantity):
  return price*quantity
```

into this:

```python
def calculate_total(price, quantity):
    return price * quantity
```

Both versions can execute the same way. The second is easier for a team to read consistently because spacing and indentation follow a shared convention.

The engineering objective is not decorative neatness. It is to reduce friction in reading, reviewing, and maintaining code by making presentation predictable.

### Learning Objectives

By the end of this chapter, you should be able to:

- Explain what formatting does and why it is useful.
- Distinguish formatting from linting, static analysis, and testing.
- Understand what a formatter may change and what it must not change.
- Use an automated Python formatter in a development workflow.
- Decide which formatting decisions belong to tools rather than debate.
- Introduce formatting into an existing codebase safely.
- Recognize common formatting mistakes and limitations.

### Prerequisites

You should understand:

- Python syntax, indentation, and basic module structure.
- The purpose of collaborative code review.
- Static analysis from the preceding chapter at a high level.

### Expected Reading Time

15–22 minutes.

---

## 2. Why Formatting Matters

Consider two functionally equivalent functions reviewed in the same pull request:

```python
def create_user(name,email,is_active=True):
  return {"name":name,"email":email,"active":is_active}
```

```python
def create_user(name, email, is_active=True):
    return {
        "name": name,
        "email": email,
        "active": is_active,
    }
```

A reviewer comparing the second version with surrounding project code can focus on naming, defaults, and return shape. A reviewer comparing the first version must also decide whether the style differences are intentional.

Inconsistent presentation creates noise:

- Diffs become harder to read when style and logic change together.
- Code review time is spent on commas, quotes, and wrapping instead of behavior.
- New contributors must reverse-engineer local conventions from existing files.
- Automated tools that depend on stable layout become less reliable.

Formatting removes a large class of avoidable discussion. Once a project chooses a formatter and configuration, presentation becomes a shared default rather than a personal preference.

### 2.1 Formatting Is About Communication

Source code is read more often than it is written. Consistent layout is part of how a team communicates intent.

Formatting does not guarantee good design. Poorly structured logic remains poorly structured after formatting. What formatting provides is a stable surface so that structure and behavior are easier to see.

---

## 3. A Mental Model of Formatting

Think of formatting as a deterministic rewrite of source presentation.

```text
Source file
    |
    v
Parser / syntax tree
    |
    v
Style rules
    |
    v
Rewritten source with the same meaning
```

Important properties of this model:

1. **Input must be valid enough to parse.** A formatter generally cannot safely rewrite code it cannot understand.
2. **Output should preserve meaning.** Changing `a+b` spacing is formatting. Changing `a+b` into `a*b` is not.
3. **Rules are project-level.** The value comes from every file following the same convention.
4. **Automation beats memory.** Engineers should not manually enforce dozens of micro-rules during every edit.

### 3.1 What Formatters Commonly Control

Depending on the tool and language, formatting may include:

- Indentation width and consistency.
- Spacing around operators and commas.
- Blank lines between top-level definitions.
- Line length and wrapping strategy.
- Quote style for strings, when configured.
- Trailing commas in multi-line collections.
- Import block layout, when the formatter owns that responsibility.

Exact capabilities differ by tool. The shared idea is consistent presentation under explicit rules.

---

## 4. Formatting vs. Linting vs. Static Analysis vs. Testing

These practices are related but not interchangeable.

| Practice | Primary question | Example |
|---|---|---|
| Formatting | Is the code presented consistently? | Indentation and wrapping |
| Linting | Does the code violate configured quality rules? | Unused import |
| Static analysis | Can deeper code inspection find likely defects without running the program? | Type inconsistency |
| Testing | Does the program behave as required when executed? | Assertion failure |

A formatter may change spaces around an operator. A linter may warn that a variable is unused. A type checker may report an incompatible argument. A test may show that a discount is applied twice.

Some tools combine formatting and linting. The engineering distinction still matters: presentation consistency is not the same as defect detection, and neither replaces behavioral verification.

---

## 5. What Formatting Must Not Change

A formatter should preserve program meaning.

Safe formatting changes include:

```python
# Before
total=price*quantity

# After
total = price * quantity
```

Unsafe changes that are **not** formatting include:

```python
# Original behavior
total = price * quantity

# Not formatting
total = price + quantity
```

If a tool rewrites APIs, renames symbols, removes statements, or alters control flow, it is performing a different kind of transformation. Those changes require review under their own criteria.

### 5.1 Semantic Edge Cases

Most day-to-day Python formatting is behavior-preserving. Still, engineers should treat any automated rewrite as a change that deserves a quick review, especially when:

- The file mixes generated and hand-written regions.
- The project contains unusual macros, templates, or embedded languages.
- A tool is configured with aggressive rewrite rules beyond ordinary style.

The practical rule is simple: run the formatter, then verify that the resulting diff is presentation-only before committing.

---

## 6. Python Formatting in Practice

In the Python ecosystem, Black and Ruff are common choices for automated formatting. Ruff can also provide linting, which is why later chapters mention it in both contexts.

A typical local workflow looks like this:

```bash
# Check whether files would change
ruff format --check .

# Apply formatting
ruff format .
```

Or with Black:

```bash
black --check .
black .
```

The important workflow properties are:

1. **One command** produces the project-standard layout.
2. **Check mode** can fail CI when unformatted files are introduced.
3. **Shared configuration** keeps local and remote behavior aligned.

### 6.1 Configuration Belongs in the Repository

Formatting rules should live with the code, for example in `pyproject.toml`, so every engineer and every CI job applies the same standard.

Without repository-level configuration, each machine may silently use different defaults. That recreates the original problem: inconsistent presentation.

### 6.2 Editor Integration

Many editors can format on save. That is useful when the editor uses the same project configuration as CI.

If the editor uses a different style engine or different settings, on-save formatting becomes a source of noise rather than a solution. Align editor integration with the repository standard.

---

## 7. Introducing Formatting Into an Existing Codebase

Applying a formatter to a large unformatted repository creates a large diff. That diff is valuable, but it must be managed carefully.

A practical approach:

1. Choose the tool and commit its configuration.
2. Format the codebase in one dedicated change, or in a small number of clearly scoped batches.
3. Avoid mixing large formatting rewrites with behavior changes in the same commit.
4. Communicate the cutover so reviewers know the large diff is intentional.
5. Enforce formatting afterward in CI so the codebase does not drift.

### 7.1 Why Mixing Formatting With Logic Changes Is Costly

If one pull request both reformats a module and changes its business logic, reviewers must mentally separate style noise from behavior. That increases review cost and raises the chance that a real defect is missed.

Prefer:

```text
Commit A: apply formatting only
Commit B: implement the behavior change
```

or equivalent pull-request separation.

---

## 8. Common Formatting Mistakes

### 8.1 Debating Style After Choosing Automation

Once a formatter is adopted, reopening debates about personal preferences usually wastes time. Configure the tool, document exceptions if any exist, and move on.

### 8.2 Manual Cleanup Instead of Tooling

Hand-fixing spacing in one file while leaving the rest of the repository inconsistent does not establish a standard. Prefer project-wide automation.

### 8.3 Different Rules Locally and in CI

If developers format with one configuration and CI checks another, formatting becomes an intermittent failure mode. Keep one source of truth.

### 8.4 Using Formatting as a Substitute for Review

Consistent layout helps review. It does not prove correctness, security, or maintainable design.

### 8.5 Disabling Formatting for Convenience

Broad opt-outs defeat the purpose. If a generated file or a special region must be excluded, exclude it narrowly and document why.

---

## 9. Engineering Trade-Offs

Formatting involves trade-offs, even though the benefits are usually strong.

- **Consistency vs. local preference:** A shared standard may differ from an individual's favorite style.
- **Line length vs. readability:** Aggressive wrapping can help or hurt depending on the code and display environment.
- **One-time migration cost vs. long-term review speed:** The initial formatting commit can be large.
- **Tool opinionation vs. configurability:** Highly opinionated tools reduce debate; highly configurable tools can recreate debate through options.

For most teams, the cost of inconsistency exceeds the cost of adopting a standard formatter.

---

## 10. Production Engineering Perspective

In production engineering environments, formatting supports collaboration at scale.

- Pull requests stay focused on behavior when style is already normalized.
- Automated checks prevent style drift across many contributors.
- Generated patches and refactors are easier to inspect when layout rules are stable.
- Onboarding is faster because newcomers inherit a visible standard instead of tribal conventions.

Formatting is infrastructure for teamwork. Like linting and testing, it should be boring, repeatable, and enforced.

---

## 11. Interview Questions and Answers

**Q1. What is code formatting?**  
Applying consistent presentation rules to source code without changing its intended behavior.

**Q2. How does formatting differ from linting?**  
Formatting standardizes presentation. Linting reports rule violations and suspicious patterns that may indicate quality or correctness concerns.

**Q3. Why use an automatic formatter instead of a style guide alone?**  
A written guide relies on memory and review pressure. A formatter enforces the standard mechanically and consistently.

**Q4. Can formatting introduce bugs?**  
Ordinary formatting should preserve meaning, but automated rewrites should still be reviewed, especially with unusual files or aggressive tool settings.

**Q5. How should a team introduce formatting to a legacy codebase?**  
Adopt shared configuration, apply formatting in dedicated changes, then enforce it in CI so style and logic changes remain separable.

**Q6. Does formatted code mean good code?**  
No. Formatting improves consistency. Design quality, correctness, and tests remain separate concerns.

---

## 12. Practical Assignment

1. Choose a small Python module that has inconsistent spacing or wrapping.
2. Run an automatic formatter in check mode and record which files would change.
3. Apply the formatter and inspect the diff.
4. Confirm that the changes are presentation-only.
5. Add or verify repository configuration so the same command works for others.
6. Write three sentences explaining how formatting differs from linting in this example.

Success criteria:

- You can run format and format-check commands.
- You can explain why the resulting diff is or is not safe.
- You can state where the project stores formatting configuration.

---

## 13. Quick Revision

- Formatting standardizes source presentation.
- It should preserve program meaning.
- Its main value is consistent readability and cleaner reviews.
- Formatting is not linting, type checking, or testing.
- Automate formatting with repository-shared configuration.
- Separate large formatting migrations from behavior changes.
- A formatted file can still contain defects.

## 14. Key Takeaways

1. **Make presentation a shared default:** Consistency reduces review noise.
2. **Keep meaning unchanged:** Formatting is not a logic rewrite.
3. **Prefer automation:** Tools beat manual style policing.
4. **Store rules with the code:** Local and CI behavior must match.
5. **Separate concerns:** Formatting, linting, analysis, and tests answer different questions.
6. **Manage adoption deliberately:** Large first-time diffs deserve dedicated changes.

## 15. Further Reading

- [Black Documentation](https://black.readthedocs.io/)
- [Ruff Formatter Documentation](https://docs.astral.sh/ruff/formatter/)
- [PEP 8 — Style Guide for Python Code](https://peps.python.org/pep-0008/)

---
