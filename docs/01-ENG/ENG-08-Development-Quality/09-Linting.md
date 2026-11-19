# Linting

## 1. Overview

Linting is the process of analyzing source code against a defined set of rules to identify potential mistakes, suspicious constructs, inconsistent practices, and maintainability problems.

A linter helps engineers detect issues that may not immediately cause the program to fail but can make the code harder to understand, maintain, or extend.

For example, a linter may identify an unused import, a variable that is assigned but never used, an unnecessary conditional, or an exception-handling pattern that deserves review.

Linting is a form of automated code analysis. It does not replace tests, debugging, or code review, and a clean lint report does not guarantee that the program implements the correct business behavior.

The engineering objective is to establish consistent, useful rules that catch preventable problems while keeping the development workflow practical.

### Learning Objectives

By the end of this chapter, you should be able to:

- Explain the purpose of linting.
- Distinguish linting from static analysis, formatting, and testing.
- Understand lint rules, diagnostics, severity, and configuration.
- Use a Python linter to inspect source code.
- Interpret and fix lint findings.
- Handle justified exceptions without disabling useful checks broadly.
- Introduce linting into an existing codebase.
- Balance code-quality enforcement with developer productivity.

### Prerequisites

You should understand:

- Python syntax, functions, imports, and control flow.
- Basic software maintainability principles.
- Static analysis from the preceding chapter.
- The distinction between formatting and semantic code quality.

### Expected Reading Time

15–22 minutes.

---

## 2. Why Linting Matters

Consider the following function:

```python
def calculate_total(price, quantity):
    discount = 0
    total = price * quantity
    return total
```

The function may execute successfully, but it contains an unused variable, `discount`.

Unused variables can indicate abandoned logic, incomplete implementation, or unnecessary complexity. In larger codebases, such issues make it harder to distinguish intentional behavior from leftover code.

A linter can identify selected issues like this before the code is reviewed or deployed.

Now consider:

```python
def calculate_total(price, quantity):
    if quantity > 0:
        if quantity > 0:
            return price * quantity

    return 0
```

The repeated condition suggests unnecessary control flow. A suitable lint rule may identify this pattern.

Linting helps improve code quality by detecting issues consistently instead of relying entirely on each engineer remembering every convention and common mistake.

### 2.1 What Linting Can Help Detect

Depending on the tool and enabled rules, linting may identify:

- Unused imports and variables.
- Undefined names.
- Suspicious expressions.
- Redundant conditions.
- Unnecessary code.
- Common programming mistakes.
- Problematic exception-handling patterns.
- Unclear or inconsistent coding practices.
- Violations of project-specific rules.

Not every linter detects every category. Some tools focus on style, others on likely defects, and some support both.

### 2.2 Linting Is About Rules, Not Absolute Correctness

A linter evaluates code against rules. Those rules encode assumptions about what constitutes acceptable or suspicious code.

A finding is therefore a signal that something should be examined, not automatic proof that the code is defective.

For example, an unused variable may be accidental, but a variable used only for a deliberate side effect might require a different interpretation. A project may also have conventions that differ from a tool's default rules.

Engineers must understand the finding and the project's intended behavior before making a correction.

---

## 3. A Mental Model of Linting

Think of a linter as an automated reviewer that applies repeatable checks.

```text
Source Code
     |
     v
Lint Tool
     |
     v
Configured Rules
     |
     v
Diagnostics
     |
     v
Review and Correction
     |
     v
Run Linter Again
```

A diagnostic commonly includes:

- The source file.
- The line or code location.
- A rule identifier.
- A description of the issue.
- A severity or category, depending on the tool.

For example, a diagnostic might indicate that an imported name is never used.

The engineer can then determine whether the import should be removed, whether the code is incomplete, or whether the rule needs a narrowly justified exception.

Linting becomes most useful when the rules are consistent across the project and engineers treat the results as part of normal development.

## 4. Linting vs. Static Analysis vs. Formatting vs. Testing

These practices overlap in some tools but serve different purposes.

| Practice | Primary purpose | Example |
|---|---|---|
| Static analysis | Broadly examines code without executing it to identify potential problems | Detecting incompatible types |
| Linting | Applies configured rules to identify suspicious code, likely mistakes, and maintainability issues | Detecting unused imports |
| Formatting | Applies consistent presentation rules to source code | Standardizing indentation and line wrapping |
| Testing | Executes code under selected conditions to verify behavior | Checking that a discount calculation returns the expected result |

Linting is commonly considered a form of static analysis, although the exact boundaries depend on the tool and the terminology used by a project.

Formatting and linting can be provided by separate tools or overlapping toolchains. The important distinction is their purpose.

- A formatter primarily determines how code is presented.
- A linter identifies patterns that violate rules or deserve investigation.
- A type checker examines type consistency.
- Tests verify behavior under executed conditions.

For detailed formatting concepts, refer to `08-Formatting.md`. The broader concepts and limits of static analysis are covered in `07-Static-Analysis.md`.

---

## 5. Lint Rules and Diagnostics

A lint rule defines a condition that the tool checks for.

Examples include:

- Do not leave unused imports.
- Do not reference undefined names.
- Avoid certain redundant expressions.
- Follow selected naming conventions.
- Flag suspicious exception-handling constructs.

A linter can apply many rules in a single run.

### 5.1 Rule Identifiers

Lint tools often assign identifiers to rules.

For example, a diagnostic might use a rule identifier to indicate that a name is unused.

Rule identifiers make it possible to:

- Understand the category of a finding.
- Look up the rule's documentation.
- Enable or disable a specific rule.
- Suppress a specific diagnostic when justified.
- Track changes to lint findings over time.

The exact identifiers and behavior depend on the tool.

### 5.2 Severity and Priority

Not every lint finding deserves the same response.

A finding that indicates an undefined name may reveal a real defect. A finding about a minor naming preference may be less urgent.

When reviewing findings, consider:

- Whether the issue is real.
- Whether the affected code is executed.
- The potential impact.
- Whether the issue violates a project requirement.
- The risk of the proposed correction.
- Whether the finding is already understood and intentionally accepted.

Do not ignore a potentially serious finding merely because the linter labels it as a warning. Tool severity is useful guidance, but engineering context still matters.

### 5.3 Configuration

A linter's behavior depends on its configuration.

Configuration may specify:

- Which rule categories are enabled.
- Which rules are ignored.
- Which files are included or excluded.
- How findings are reported.
- Which source-code conventions the project follows.

A configuration should express the project's quality expectations rather than merely silence inconvenient output.

Keep configuration consistent and version-controlled where practical so that developers receive comparable results.

---

## 6. Using Ruff for Python Linting

`ruff` is a Python tool that provides fast linting and supports a broad collection of configurable rules. It also provides formatting capabilities, which are covered separately in the formatting chapter.

For this chapter, use Ruff as a linter.

### 6.1 Install Ruff

Install it in the project's development environment:

```bash
python -m pip install ruff
```

The project may instead manage development tools through its existing dependency-management workflow. Use the repository's established approach when one exists.

### 6.2 Create a File With Lint Issues

Create `sample.py`:

```python
import os


def calculate_total(price, quantity):
    unused_value = 100
    total = price * quantity
    return total
```

Potential issues include:

- `os` is imported but never used.
- `unused_value` is assigned but never used.
- The function parameters have no type annotations, although whether this is reported depends on the enabled rules.

Not every possible issue is enabled by default. The tool reports only the findings supported by its configured rules.

### 6.3 Run the Linter

```bash
ruff check sample.py
```

To inspect a directory:

```bash
ruff check .
```

The command reports applicable findings for the selected files.

The exact diagnostics depend on the Ruff version, configuration, enabled rule set, and project context.

### 6.4 Fix the Issues

A cleaned-up version might be:

```python
def calculate_total(price: float, quantity: int) -> float:
    return price * quantity
```

The unused import and variable have been removed, and the function's intended types are now more explicit.

Type annotations are not automatically a requirement of every lint configuration. In this example, they improve the function contract, but a dedicated type checker is responsible for deeper type analysis.

### 6.5 Run the Linter Again

```bash
ruff check sample.py
```

A successful result means the configured lint checks reported no remaining findings for that file.

It does not establish that the calculation is correct for every business requirement. Tests are still needed to verify behavior.

---

## 7. Understanding and Fixing Findings

A good linting workflow does not blindly apply every suggested change.

For each finding:

1. Read the diagnostic message.
2. Identify the rule and the affected code.
3. Understand why the rule exists.
4. Determine whether the finding represents a real issue.
5. Apply the smallest appropriate correction.
6. Run the linter again.
7. Run relevant tests if the correction could affect behavior.

Consider this example:

```python
def get_discount(price: float) -> float:
    discount = 0.10
    return price * discount
```

A linter may not report a problem. The code can be valid and easy to read, yet the business rule could still be wrong if the required discount is 15%.

This is a requirement-level defect, not necessarily a lint violation.

Now consider:

```python
def get_discount(price: float) -> float:
    discount = 0.10
    unused_limit = 100
    return price * discount
```

A linter may report `unused_limit` as an unused variable.

The distinction matters: linting identifies selected code patterns, while engineers must verify that the program implements the intended requirements.

### 7.1 Automatic Fixes

Some linters can automatically correct certain findings.

For Ruff, the following command applies supported automatic fixes:

```bash
ruff check --fix .
```

Automatic fixes can be useful for mechanical changes, but they should not replace review.

Before applying them broadly:

- Understand what kinds of fixes the tool supports.
- Review the resulting changes.
- Run the linter again.
- Run tests where appropriate.
- Confirm that behavior and intended code structure remain correct.

A linter cannot safely infer the correct resolution for every finding.

---

## 8. Configuration and Rule Selection

A useful lint configuration balances defect detection, consistency, and development cost.

### 8.1 Start With a Clear Rule Set

A project can configure Ruff through a `pyproject.toml` file.

For example:

```toml
[tool.ruff]
line-length = 88

[tool.ruff.lint]
select = ["E4", "E7", "E9", "F"]
```

This is an illustrative configuration. It selects particular rule families rather than enabling every available rule.

The exact rule families and their meanings should be verified against the Ruff version used by the project.

A focused starting configuration can identify common errors without immediately introducing every possible style or complexity rule.

### 8.2 Expand Rules Deliberately

As the team gains experience, it can introduce additional rule families based on recurring defects and maintenance needs.

For each new category, ask:

- What problem does this rule prevent?
- How often does that problem occur in this codebase?
- Can the finding be interpreted reliably?
- Will the rule create excessive low-value noise?
- Can the team apply it consistently?

The objective is to improve code quality, not maximize the number of enabled rules.

### 8.3 Avoid Configuration Drift

If each engineer uses a different set of rules, code may pass on one machine and fail on another.

Keep shared configuration in the repository and document the expected lint command.

Version consistency also matters because tools may add, change, or deprecate rules across releases.

---

## 9. Handling Exceptions to Lint Rules

Sometimes a finding is justified by a specific design requirement.

For example, a name may appear unused to a linter because it is referenced by a dynamic framework or an external integration mechanism.

In such cases, an exception may be appropriate.

### 9.1 Prefer Narrow Suppressions

If Ruff reports a specific rule, a targeted suppression may be possible:

```python
value = dynamic_framework_value  # noqa: F821
```

This example illustrates the syntax for suppressing a particular Ruff rule on a line. Use the exact rule identifier reported by the tool and verify that the suppression is supported by the configured version.

A suppression should explain why the rule does not apply when the reason is not obvious.

### 9.2 Avoid Broad Suppressions

Disabling all linting in a file can hide unrelated problems.

Prefer:

- Correcting the underlying code.
- Providing accurate type or analysis information when appropriate.
- Suppressing only the specific justified rule.
- Documenting exceptional behavior.
- Reviewing suppressions periodically.

A suppression should represent an intentional engineering decision, not a shortcut for avoiding investigation.

---

## 10. Linting in an Existing Codebase

Introducing linting into a new project is usually easier than applying it to a large legacy codebase.

Existing projects may already contain many findings.

A practical adoption process is:

### Step 1: Establish a Baseline

Run the linter against the current codebase and inspect the findings.

Determine which categories are most important and which parts of the project need immediate attention.

### Step 2: Choose the Initial Scope

Start with a manageable set of files or rules.

Avoid introducing a large number of low-priority findings before the team has established a reliable workflow.

### Step 3: Fix High-Value Issues

Prioritize findings that indicate likely defects, unclear behavior, or repeated maintenance problems.

### Step 4: Make the Checks Repeatable

Document the command and configuration so that developers can run the same checks locally.

### Step 5: Prevent New Problems

Once the baseline is understood, establish a policy for new or modified code. For example, the team may require that changed files pass the selected lint checks.

### Step 6: Expand Gradually

Introduce additional rules as the team learns which checks provide meaningful value.

This process improves quality without requiring an entire legacy codebase to be rewritten at once.

---

## 11. Common Linting Mistakes

### 11.1 Enabling Too Many Rules Immediately

**Problem:** A project receives a large number of findings before developers understand the tool.

**Why it is harmful:** The team may ignore the results or spend excessive time on low-value changes.

**Better approach:** Start with a focused rule set and expand deliberately.

### 11.2 Fixing Findings Without Understanding Them

**Problem:** A developer changes code simply to silence a diagnostic.

**Why it is harmful:** The change may obscure intended behavior or introduce a new defect.

**Better approach:** Understand the rule and determine the correct fix before changing the code.

### 11.3 Treating a Clean Lint Report as Proof of Correctness

**Problem:** Code is considered ready because the linter reports no issues.

**Why it is harmful:** Business-rule defects and many runtime problems may remain undetected.

**Better approach:** Combine linting with tests, review, and appropriate static analysis.

### 11.4 Disabling Rules Broadly

**Problem:** A large number of rules are disabled because one rule produces inconvenient findings.

**Why it is harmful:** The configuration may stop detecting unrelated defects.

**Better approach:** Use narrow, justified exceptions and preserve useful checks.

### 11.5 Confusing Linting With Formatting

**Problem:** Developers expect linting to handle every presentation issue or assume that formatting alone detects suspicious code.

**Why it is harmful:** The tools have different primary responsibilities.

**Better approach:** Define formatting and linting as separate quality checks, even when one tool supports both.

### 11.6 Ignoring Version Differences

**Problem:** Different environments use different tool versions or rule sets.

**Why it is harmful:** Findings may differ unexpectedly between developers and automated checks.

**Better approach:** Manage tool versions and configuration consistently.

### 11.7 Automatically Fixing Everything

**Problem:** Automatic fixes are applied without reviewing the diff or running tests.

**Why it is harmful:** Some changes may not align with the intended implementation or project conventions.

**Better approach:** Review automated changes and verify affected behavior.

---

## 12. Engineering Trade-Offs

| Decision | Benefit | Cost or limitation |
|---|---|---|
| Focused rule set | Fast adoption and relatively low noise | May miss some useful findings |
| Extensive rule set | Broader automated checks | More configuration and potential false positives |
| Automatic fixes | Efficiently resolves supported mechanical issues | Requires review and verification |
| Narrow suppressions | Preserves most checks while handling justified exceptions | Requires explanation and maintenance |
| Broad exclusions | Reduces immediate findings | Can conceal genuine problems |
| Gradual adoption | Manageable migration for legacy code | Full coverage takes longer |
| Shared configuration | Consistent results across developers | Requires version and configuration maintenance |

The correct balance depends on the codebase, team size, risk profile, and cost of maintaining the rules.

Linting should improve engineering decisions rather than become a goal disconnected from software quality.

---

## 13. Production Engineering Perspective

In a production-oriented codebase, linting helps establish a repeatable minimum standard for source-code quality.

It can catch simple mistakes before code review, reduce unnecessary clutter, and encourage consistency across modules maintained by multiple engineers.

For example, an API service may contain many routes and service functions. A shared lint configuration can help identify unused imports, undefined names, and suspicious code patterns before changes reach runtime.

However, linting cannot establish that the service's business logic is correct, that an external API is available, or that its performance meets production requirements.

A mature development workflow uses linting as one quality gate among several. The analyzer identifies rule violations; the team defines the policy for handling them; and tests verify behavior.

The result should be a codebase that is easier to review, understand, and maintain—not simply one with fewer reported warnings.

---

## 14. Interview Questions and Answers

### Q1. What is linting?

Linting is automated analysis of source code against defined rules to identify potential mistakes, suspicious constructs, and maintainability issues.

### Q2. How is linting different from formatting?

Formatting primarily standardizes code presentation. Linting identifies patterns that violate rules or may indicate problems. Some tools provide both capabilities.

### Q3. Is linting a form of static analysis?

Linting is commonly considered a form of static analysis because it examines source code without executing the application. The exact terminology can vary by tool and project.

### Q4. What is a lint rule?

A lint rule defines a condition that the tool checks for, such as unused imports, undefined names, or a suspicious coding pattern.

### Q5. What is Ruff?

Ruff is a Python tool that provides fast linting and supports a broad collection of configurable rules. It also offers formatting functionality.

### Q6. What should you do when a lint finding appears to be incorrect?

Investigate the code and the rule, determine whether the finding is a false positive or reflects a genuine issue, and then correct the code or apply a narrow, justified suppression.

### Q7. Should all lint findings block a release?

Not necessarily. Teams should establish a policy based on the importance of the rule and the project's requirements. Important violations may block a change, while justified exceptions can be documented.

### Q8. Why is broad rule suppression risky?

It can hide unrelated defects and weaken the effectiveness of the linting process.

### Q9. How would you introduce linting into a large existing project?

I would establish a baseline, choose a focused set of rules, prioritize important findings, make the checks repeatable, and expand coverage incrementally.

### Q10. Does passing lint checks mean that the code is correct?

No. Linting checks selected code patterns. Tests, code review, static analysis, and runtime safeguards address additional classes of problems.

---

## 15. Practical Assignment

### Assignment: Clean Up a Python Module

Create a file named `order_utils.py`:

```python
import os
import json


def calculate_total(price, quantity):
    unused_value = 10
    total = price * quantity
    return total


def get_order_status(status):
    if status == "completed":
        return "done"
    elif status == "completed":
        return "finished"
    else:
        return "unknown"
```

### Tasks

1. Run Ruff against the file.
2. Record the findings produced by the configured rules.
3. Remove unused imports and variables where appropriate.
4. Add type annotations that accurately represent the intended function contracts.
5. Inspect the repeated condition in `get_order_status`.
6. Decide the intended behavior for each supported status and correct the logic.
7. Run the linter again.
8. Add unit tests for normal, repeated, and unknown status values.
9. Explain which issues were detected by the linter and which required reasoning about intended behavior.
10. Identify one situation where a narrow suppression would be justified and explain what evidence would support it.

### Expected Deliverables

- Original and corrected modules.
- The lint command and findings.
- The final lint report.
- Tests for the intended behavior.
- A short explanation of the changes and any remaining limitations.

**Important:** A linter may identify the unused imports and variable, but it may not identify the incorrect business logic. Do not assume that a clean lint report proves the status function is correct.

---

## 16. Quick Revision

- Linting applies configured rules to source code without executing the application.
- Linters can identify unused names, suspicious expressions, and other code-quality issues.
- Static analysis is the broader category; linting is one commonly used form of analysis.
- Formatting and linting have different primary responsibilities.
- Ruff is a Python tool for linting and formatting.
- Findings must be interpreted in the context of the code and its intended behavior.
- Rule selection and configuration determine what the linter reports.
- Automatic fixes should be reviewed and verified.
- Suppressions should be narrow and justified.
- A clean lint report does not guarantee correct business behavior.

## 17. Key Takeaways

1. **Use rules to catch preventable mistakes:** Linting reduces reliance on manual inspection for common code-quality issues.
2. **Understand each diagnostic:** A finding is evidence to investigate, not an instruction to change code blindly.
3. **Keep the rule set useful:** Configure checks that provide meaningful value for the project.
4. **Separate quality responsibilities:** Linting, formatting, type checking, and testing complement one another.
5. **Adopt linting consistently:** Shared configuration and repeatable commands improve results across the team.
6. **Preserve engineering judgment:** A clean lint report is useful, but correctness still depends on requirements, tests, and sound design.

## 18. Further Reading

- [Ruff Documentation](https://docs.astral.sh/ruff/)
- [Ruff Rules Reference](https://docs.astral.sh/ruff/rules/)
- [Python `ast` Module](https://docs.python.org/3/library/ast.html)
- [mypy Documentation](https://mypy.readthedocs.io/)

---

# End of Document

This completes the Markdown file: `09-Linting.md`
