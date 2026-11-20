# Static Analysis

## 1. Overview

Static analysis is the process of examining source code without executing the program to identify potential defects, unsafe patterns, suspicious constructs, and violations of defined rules.

Software defects can exist even when the application starts successfully and its current tests pass. Some problems arise from code paths that tests do not exercise, incorrect assumptions about values, unreachable branches, or unsafe operations that are difficult to detect through ordinary execution.

Static analysis helps identify certain classes of problems before the affected code reaches runtime.

For example, a static analyzer may detect that a variable is referenced before assignment, a function receives an argument of an incompatible type, or a code path contains a suspicious operation.

Static analysis cannot prove that every program is correct. It examines code according to the rules, models, and assumptions supported by the selected tools.

The engineering objective is to detect preventable defects early, reduce the cost of fixing them, and improve confidence in the codebase.

### Learning Objectives

By the end of this chapter, you should be able to:

- Explain what static analysis does and why it is useful.
- Distinguish static analysis from testing and runtime debugging.
- Understand common categories of static-analysis findings.
- Use Python type checking and static-analysis tools.
- Interpret findings and determine whether they represent real defects.
- Understand false positives, false negatives, and analysis limitations.
- Integrate static analysis into a development workflow.
- Evaluate the trade-offs of analysis strictness and tooling.

### Prerequisites

You should understand:

- Python functions, variables, modules, and control flow.
- Basic data types and function signatures.
- Exceptions and common programming errors.
- Unit testing and debugging from the preceding chapters.

### Expected Reading Time

18–25 minutes.

---

## 2. Why Static Analysis Matters

Consider this function:

```python
def calculate_total(price: float, quantity: int) -> float:
    return price * quantity
```

The function is syntactically valid and can execute successfully. However, the type annotations describe the intended argument types; Python does not enforce those annotations automatically at runtime.

A caller might pass an incompatible value:

```python
calculate_total("100", 3)
```

The operation raises a `TypeError` because a string cannot be multiplied by an integer in this particular way to produce the intended numeric total.

A static-analysis tool may detect the incompatible argument when it can determine the types involved and the relevant checking rules are enabled.

Now consider another defect:

```python
def calculate_total(price: float, quantity: int) -> float:
    return price + quantity
```

Both arguments can be numeric, and the function may execute successfully. However, adding the price and quantity is probably not the intended business operation.

Static analysis may not detect this defect because the expression is type-compatible. Detecting it may require a test, a business-rule check, or deeper reasoning about the function's contract.

These examples demonstrate two important principles:

1. Static analysis can identify defects without running the application.
2. Passing static analysis does not guarantee correct business behavior.

Static analysis is one part of a broader software-quality strategy.

## 3. A Mental Model of Static Analysis

Think of static analysis as examining a program's structure and possible behavior before execution.

```text
Source Code
     |
     v
Parse / Analyze
     |
     v
Apply Analysis Rules
     |
     v
Findings
     |
     v
Review and Correct
     |
     v
Re-analyze
```

Depending on the tool, analysis may examine syntax, control flow, variable usage, types, function calls, or potentially unsafe constructs.

A finding might identify:

- A variable that may be undefined.
- An expression with incompatible types.
- An unreachable branch.
- An unused import.
- A suspicious exception-handling pattern.
- A potentially unsafe operation.
- A violation of a configured rule.

Not every tool analyzes all these categories. A type checker, linter, security analyzer, and compiler may each identify different problems.

The exact coverage depends on the analysis engine, its configuration, and the information available to it.

## 4. Static Analysis vs. Testing vs. Debugging

These practices answer different questions.

| Practice | Primary question | Typical evidence |
|---|---|---|
| Static analysis | What potential problems can be identified by examining the code without executing it? | Analysis findings, type errors, suspicious patterns |
| Testing | Does the program behave as expected for the tested inputs and conditions? | Test results and assertion failures |
| Debugging | Why did the observed behavior differ from expectations? | An investigation of execution, state, and root cause |
| Runtime checks | Are particular conditions valid during execution? | Exceptions, validation results, or runtime failures |

Consider a function that calculates an order total.

- Static analysis may identify an incompatible argument type.
- A unit test may detect an incorrect total for a discount boundary.
- Debugging may reveal that an upstream operation supplied the wrong value.
- Runtime validation may reject a negative quantity when the function is called.

These approaches complement one another.

Static analysis can examine code paths that a test suite never executes, but runtime behavior may depend on data and environmental conditions that static analysis cannot fully determine.

## 5. Common Categories of Static Analysis

### 5.1 Syntax and Structural Problems

Some tools detect malformed source code, invalid constructs, or problems that prevent code from being parsed.

Python itself performs syntax checking when source code is parsed. Additional tools may report structural issues or constructs that are valid Python but violate configured rules.

Example:

```python
def calculate_total(price, quantity):
    return price * quantity
```

This function is syntactically valid, but it does not communicate the intended argument types or return type.

A type checker can provide additional information when appropriate annotations or inferred types are available.

### 5.2 Type Checking

Type checking examines whether values used in expressions and passed between functions are compatible with their declared or inferred types.

Consider:

```python
def get_user_name(user_id: int) -> str:
    return user_id
```

The annotation says that the function should return a string, but the implementation returns the integer argument.

A type checker can identify this mismatch.

Type checking is particularly useful at component boundaries, such as function calls, service interfaces, data transformations, and library APIs.

However, Python annotations are not comprehensive runtime validation. Their usefulness depends on the checking tool, available type information, and the configured strictness.

### 5.3 Control-Flow Analysis

Control-flow analysis examines possible execution paths through a program.

For example:

```python
def classify_score(score: int) -> str:
    if score >= 50:
        return "pass"
    elif score < 50:
        return "fail"
    else:
        return "unknown"
```

For ordinary integer values, the final `else` branch is unreachable because every integer is either greater than or equal to 50 or less than 50.

Some analysis tools may identify unreachable code or redundant conditions.

Such findings can reveal incorrect assumptions, unnecessary branches, or incomplete refactoring.

### 5.4 Data-Flow Analysis

Data-flow analysis examines how values move through a program.

For example:

```python
def process_name(name: str | None) -> str:
    return name.strip()
```

The parameter can be `None`, but the implementation calls `.strip()` without checking that the value is a string.

A type checker configured to analyze the union type can identify the unsafe access.

A corrected implementation might be:

```python
def process_name(name: str | None) -> str:
    if name is None:
        return ""

    return name.strip()
```

Whether returning an empty string is correct depends on the function's contract. The analysis identifies a potential problem; the engineer must choose the appropriate behavior.

### 5.5 Suspicious or Risky Patterns

Some analyzers detect patterns associated with defects or security risks.

Examples include:

- Broad exception handling.
- Unsafe evaluation of dynamically supplied expressions.
- Potentially dangerous subprocess usage.
- Unnecessary resource handling complexity.
- Suspicious comparison or control-flow patterns.

The findings depend on the tool and enabled rules. A general-purpose type checker should not be assumed to detect every security issue.

Static security analysis is a related specialized area, but a full security-engineering workflow is outside this chapter's scope.

---

## 6. Python Type Checking With `mypy`

Python is dynamically typed. Variables can refer to objects of different types during execution, and type annotations do not automatically enforce constraints.

Static type checkers use annotations and inference to identify type inconsistencies before the affected code executes.

`mypy` is one tool used for static type checking in Python.

### 6.1 Install the Tool

In a development environment:

```bash
python -m pip install mypy
```

### 6.2 Create a Type-Checked Function

```python
def calculate_total(price: float, quantity: int) -> float:
    return price * quantity

total = calculate_total("100", 3)
```

Save this code in a Python file, such as `pricing.py`.

Run:

```bash
python -m mypy pricing.py
```

A suitable configuration should report that the first argument is incompatible with the expected type.

The exact wording and diagnostic details depend on the installed version and configuration.

The important point is that the checker can detect the mismatch by examining the code without calling the function.

### 6.3 Correct the Type Mismatch

```python
def calculate_total(price: float, quantity: int) -> float:
    return price * quantity

total = calculate_total(100.0, 3)
```

Run the checker again.

A successful type check indicates that no issues were reported within the scope of the configured analysis. It does not prove that the calculation satisfies every business requirement.

### 6.4 Gradually Introducing Type Checking

An existing Python codebase may contain incomplete annotations or dynamically typed interfaces.

It is often practical to introduce type checking incrementally:

1. Identify a small module or component boundary.
2. Add annotations that reflect the intended contract.
3. Run the checker.
4. Investigate findings and correct genuine defects.
5. Configure the tool for the project's requirements.
6. Expand coverage gradually.

Avoid adding annotations that merely silence errors without accurately representing the program's behavior.

Type annotations are useful when they communicate meaningful contracts and are checked consistently.

---

## 7. Python Static-Analysis Tools

Different tools examine different aspects of code quality.

### 7.1 `mypy`

`mypy` checks type consistency in Python code using annotations and type inference.

Useful for:

- Detecting incompatible function arguments.
- Finding return-type mismatches.
- Identifying some unsafe operations involving optional values.
- Checking interfaces between functions and modules.

Its effectiveness depends on type information, configuration, and supported analysis.

### 7.2 `pyright`

`pyright` is a Python static type checker.

It provides type analysis and can be used through command-line tooling or editor integrations.

Useful for:

- Type consistency checks.
- Diagnosing incompatible values and function signatures.
- Detecting many issues involving optional types.
- Providing fast feedback during development.

`mypy` and `pyright` have different implementations and configuration behavior. A project should select a tool based on its requirements and maintain a consistent configuration rather than assuming that all checkers produce identical findings.

### 7.3 `bandit`

`bandit` analyzes Python code for selected security-related patterns.

It can identify certain risky constructs, but it is not a complete security assessment and does not guarantee that an application is secure.

Use security-specific analysis when the question concerns potentially dangerous code patterns, and interpret findings in the context of the application.

### 7.4 Selecting Tools Deliberately

Do not install multiple tools merely because they are available.

Start with the quality risks the project needs to address.

| Requirement | Appropriate starting point |
|---|---|
| Catch type inconsistencies | `mypy` or `pyright` |
| Identify selected security-related patterns | `bandit` |
| Detect formatting differences | A formatter such as `black` |
| Enforce style and selected code-quality rules | A linter such as `ruff` |

Formatting and linting are covered in the following chapters. Their detailed rules and configuration belong there rather than being repeated here.

A tool's name alone does not define its exact capabilities. Review the selected tool's documentation and enabled rules.

---

## 8. Understanding Findings

A static-analysis report is not a list of defects that should be fixed mechanically without interpretation.

Each finding should be evaluated.

### 8.1 True Positives

A true positive identifies a real issue within the intended scope of the analysis.

For example, a function promises to return a string but returns an integer. The type checker correctly identifies a mismatch.

### 8.2 False Positives

A false positive is a reported issue that is not actually a defect under the project's intended behavior.

For example, a tool may not understand a dynamic framework feature that assigns an attribute at runtime. It may report an attribute as missing even though the application provides it dynamically.

The correct response is to investigate the report, improve the type information or analysis configuration when appropriate, and avoid broad suppressions that hide unrelated issues.

### 8.3 False Negatives

A false negative occurs when a real problem exists but the analyzer does not report it.

For example, a function may use the wrong business formula while remaining completely type-compatible.

A type checker generally cannot infer every domain-specific requirement from ordinary Python code.

This is why static analysis must be combined with tests, review, and appropriate runtime validation.

### 8.4 Severity and Priority

Not every finding has equal importance.

A useful prioritization approach considers:

- Potential impact.
- Likelihood of the defect occurring.
- Whether the affected code is reachable.
- Whether the finding represents a genuine contract violation.
- The cost and risk of correcting it.

A type mismatch at a critical API boundary may deserve immediate attention. A minor warning in unused experimental code may have lower priority.

The appropriate response depends on the project's quality requirements and risk tolerance.

---

## 9. Integrating Static Analysis Into Development

Static analysis is most effective when engineers can run it regularly and understand its output.

### 9.1 Run Analysis Locally

A developer can run a type checker before submitting a change:

```bash
python -m mypy src/
```

The exact path depends on the repository structure.

Running analysis locally provides fast feedback and allows findings to be corrected before review.

### 9.2 Establish a Baseline

In an existing codebase, enabling strict analysis across every file at once may produce a large number of findings.

A practical approach is to establish a baseline, select an initial scope, and expand coverage over time.

A baseline should not become an excuse to ignore new defects indefinitely. Teams should define how existing findings will be handled and how new code will be kept within the intended quality standard.

### 9.3 Use Consistent Configuration

Different developers should not unknowingly run different rules.

Keep relevant tool configuration in the repository where practical, and document the expected command.

Consistent configuration makes local results more comparable and reduces disagreements caused by different settings.

### 9.4 Review Findings Before Suppressing Them

Some tools support inline suppressions or configuration exclusions.

Use these mechanisms narrowly and document the reason when an exception is justified.

For example, a dynamic library boundary may require a targeted annotation or exclusion. Disabling a large category of checks simply because one file is difficult to analyze can conceal unrelated defects.

### 9.5 Quality Checks and CI/CD

Static analysis can be executed manually, through editor integrations, or as part of automated repository checks.

The static-analysis tool identifies findings; the surrounding workflow decides whether those findings should block a change.

This distinction matters:

- The analyzer performs the examination.
- The configured quality policy determines acceptable results.
- An automated workflow executes the checks and reports their outcome.

Full CI/CD design and pipeline engineering are outside this chapter's scope.

---

## 10. Common Static-Analysis Mistakes

### 10.1 Assuming Successful Analysis Means Correct Software

**Problem:** The analyzer reports no findings, so the application is considered correct.

**Why it is harmful:** The tool may not detect business-rule errors, environment-dependent failures, or issues outside its analysis scope.

**Better approach:** Combine static analysis with testing, review, and runtime safeguards.

### 10.2 Treating Every Finding as a Defect

**Problem:** Reports are fixed mechanically without checking their meaning.

**Why it is harmful:** The change may introduce unnecessary complexity or distort intended behavior.

**Better approach:** Understand the finding, verify the underlying assumption, and choose an appropriate correction.

### 10.3 Suppressing Findings Too Broadly

**Problem:** Rules are disabled across the project to eliminate inconvenient warnings.

**Why it is harmful:** Genuine problems may become invisible.

**Better approach:** Use narrow, justified suppressions and improve type information or analysis configuration where possible.

### 10.4 Adding Misleading Type Annotations

**Problem:** An annotation is added only to satisfy a checker, even though it does not represent the actual values.

**Why it is harmful:** The code appears more reliable than it is, and other developers may trust an incorrect contract.

**Better approach:** Make annotations accurately describe intended behavior and validate dynamic boundaries where necessary.

### 10.5 Expecting One Tool to Detect Everything

**Problem:** A type checker is expected to find formatting issues, security problems, logical defects, and runtime performance issues.

**Why it is harmful:** Different tools analyze different properties.

**Better approach:** Select a focused set of tools that address the project's actual quality risks.

### 10.6 Enabling Strict Rules Without a Migration Plan

**Problem:** A large existing codebase suddenly receives thousands of findings.

**Why it is harmful:** Engineers may be overwhelmed and begin ignoring the output.

**Better approach:** Establish a baseline, prioritize important defects, and increase coverage deliberately.

### 10.7 Confusing Static Analysis With Runtime Validation

**Problem:** Type annotations are assumed to prevent invalid data from entering the application.

**Why it is harmful:** Ordinary Python annotations are not automatically enforced at runtime.

**Better approach:** Use static checks during development and runtime validation at boundaries where untrusted or dynamic data enters the system.

---

## 11. Engineering Trade-Offs

| Decision | Benefit | Cost or limitation |
|---|---|---|
| More comprehensive analysis | Can detect additional classes of problems | May require more configuration and produce more findings |
| Strict type checking | Makes contracts more explicit and detects more inconsistencies | Can require substantial work in dynamic or legacy code |
| Multiple analyzers | Provides complementary coverage | Adds configuration, maintenance, and overlapping diagnostics |
| Broad exclusions | Reduces immediate noise | Can hide defects in excluded code |
| Incremental adoption | Makes migration manageable | Leaves parts of the codebase with weaker coverage during the transition |
| Automated enforcement | Helps maintain consistent quality expectations | Poorly designed rules can block changes for low-value reasons |

The objective is not to maximize the number of tools or warnings. It is to identify meaningful defects at a reasonable cost and maintain a level of analysis appropriate for the system.

---

## 12. Production Engineering Perspective

Static analysis is particularly valuable in codebases where multiple engineers modify shared components.

Clear type contracts and consistent analysis rules help identify incompatible changes before integration or deployment.

For example, an internal API may expect a function to return a dictionary containing specific values. If a refactoring changes the function to return a different type, a static checker may identify affected callers before those paths execute in production.

However, production reliability also depends on dynamic inputs, external dependencies, configuration, runtime state, and business behavior. Static analysis cannot establish that every possible execution will succeed.

A practical engineering workflow therefore uses static analysis as an early feedback mechanism alongside tests, code review, and runtime safeguards.

The most valuable result is not simply a clean report. It is a codebase with clearer contracts, fewer preventable defects, and a repeatable process for detecting new problems.

---

## 13. Interview Questions and Answers

### Q1. What is static analysis?

Static analysis examines source code without executing the application to identify potential defects, type inconsistencies, unsafe patterns, or violations of configured rules.

### Q2. How is static analysis different from testing?

Static analysis examines code according to its analysis rules without running the program. Testing executes code under selected conditions and checks its observed behavior.

### Q3. Can static analysis prove that a program is correct?

No. Its conclusions are limited by the tool, rules, configuration, and information available. Some business-logic and runtime problems may remain undetected.

### Q4. What is static type checking?

Static type checking examines whether values, expressions, function arguments, and return values are compatible with their declared or inferred types.

### Q5. What is the difference between a false positive and a false negative?

A false positive reports a problem where no defect exists under the intended behavior. A false negative occurs when a real defect exists but the analyzer does not report it.

### Q6. Why are Python type annotations useful if Python does not enforce them automatically?

Type annotations communicate intended contracts and provide information that tools such as `mypy` and `pyright` can analyze before execution.

### Q7. What is the risk of suppressing static-analysis warnings broadly?

Broad suppressions can hide genuine defects and reduce confidence in the analysis. Suppressions should be narrow and justified.

### Q8. Should every static-analysis finding block a code change?

Not necessarily. Teams should establish a policy based on severity, reliability requirements, and the type of finding. Important violations may block a change, while justified exceptions may be handled through documented mechanisms.

### Q9. Why might a type checker miss a logical defect?

A function can use compatible types and still implement the wrong business rule. Type compatibility alone does not establish semantic correctness.

### Q10. How would you introduce static analysis into an existing Python project?

I would select a tool based on the project's risks, establish a baseline, configure it consistently, begin with a manageable scope, prioritize genuine defects, and gradually expand coverage while preventing new issues.

---

## 14. Practical Assignment

### Assignment: Analyze a Defective Python Module

Create a file named `user_service.py`:

```python
def get_display_name(
    first_name: str,
    last_name: str,
) -> str:
    return first_name + last_name

def calculate_age_group(age: int) -> str:
    if age < 0:
        return "invalid"
    elif age >= 18:
        return "adult"
    elif age < 18:
        return "minor"
    else:
        return "unknown"

def format_user_id(user_id: int) -> str:
    return user_id
```

The module contains several issues, but not every issue necessarily belongs to the same analysis category.

### Tasks

1. Run `mypy` against the module.
2. Record the type-related findings.
3. Identify the return-type mismatch in `format_user_id`.
4. Inspect `calculate_age_group` and identify the unreachable branch.
5. Review `get_display_name` and decide whether its behavior matches the intended requirement that the display name contains a space between the names.
6. Correct the issues while preserving the intended function contracts.
7. Run the type checker again.
8. Add unit tests for normal and boundary cases.
9. Explain which problems static analysis detected and which required reasoning or tests.
10. Identify one example where suppressing a finding would be justified and explain the evidence needed before doing so.

### Expected Deliverables

- Original module and corrected module.
- Static-analysis command and findings.
- Tests for relevant behavior.
- A short explanation of the distinction between analyzer findings and defects discovered through other methods.

Do not assume that every defect must be detected by the same tool. The objective is to understand the strengths and limits of static analysis.

---

## 15. Quick Revision

- Static analysis examines code without executing the application.
- Static type checking identifies many type inconsistencies.
- `mypy` and `pyright` are Python type-checking tools.
- `bandit` identifies selected security-related patterns.
- Static analysis can detect some unreachable or suspicious code paths.
- False positives and false negatives are possible.
- Python annotations do not automatically validate runtime inputs.
- Findings must be interpreted rather than blindly suppressed or fixed.
- Consistent configuration improves the usefulness of analysis.
- Static analysis complements testing, debugging, and runtime validation.

## 16. Key Takeaways

1. **Detect problems early:** Static analysis can identify certain defects before affected code executes.
2. **Understand tool boundaries:** Different tools analyze different properties, and none should be assumed to detect every possible defect.
3. **Treat findings as evidence:** Investigate each report and determine whether it represents a genuine problem.
4. **Use meaningful contracts:** Accurate type annotations and consistent rules improve maintainability and help detect incompatible changes.
5. **Adopt analysis deliberately:** Establish a baseline, prioritize meaningful findings, and expand coverage according to the project's needs.
6. **Combine quality practices:** Static analysis is strongest when used alongside tests, code review, and runtime safeguards.

## 17. Further Reading

- [mypy Documentation](https://mypy.readthedocs.io/)
- [Pyright Documentation](https://microsoft.github.io/pyright/)
- [Bandit Documentation](https://bandit.readthedocs.io/)
- [Python Typing Documentation](https://docs.python.org/3/library/typing.html)
- [Python `ast` Module](https://docs.python.org/3/library/ast.html)

---
