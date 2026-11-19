# Debugging

## 1. Overview

Debugging is the systematic process of investigating unexpected software behavior, identifying its root cause, and verifying that the correction resolves the problem without introducing new defects.

Software rarely behaves incorrectly without a reason. A program follows its execution path according to its code, input data, state, dependencies, and runtime environment. When the observed behavior differs from the expected behavior, debugging helps an engineer determine which assumption, operation, or interaction caused the difference.

Debugging is not simply adding print statements, changing code until an error disappears, or restarting a service. It is a disciplined investigation based on evidence.

This chapter explains how to debug software systematically, reproduce failures, narrow down the source of a defect, inspect program execution, and verify corrections.

### Learning Objectives

By the end of this chapter, you should be able to:

- Explain the purpose of debugging and distinguish it from testing and logging.
- Reproduce a software failure reliably.
- Form and evaluate hypotheses about a defect.
- Narrow a failure to a specific function, operation, or dependency.
- Use Python exceptions, tracebacks, breakpoints, and a debugger.
- Inspect program state without changing its behavior unnecessarily.
- Identify common debugging mistakes.
- Verify a fix and prevent a regression.

### Prerequisites

You should understand:

- Functions, parameters, return values, and control flow.
- Exceptions and error propagation.
- Modules and basic program execution.
- Unit testing and integration testing from the preceding chapters.
- Dependency boundaries and separation of concerns.

### Expected Reading Time

20–30 minutes.

---

## 2. Why Debugging Matters

A software defect is a difference between intended behavior and actual behavior.

Consider a function that calculates a discount:

```python
def apply_discount(price: float, discount: float) -> float:
    return price * discount
```

The function executes successfully, but the result is incorrect when `discount` represents a percentage reduction.

For example:

```python
print(apply_discount(100, 20))
```

The program returns `2000`, whereas the expected price after a 20% discount is `80`.

There is no syntax error, and no exception is raised. The problem is a mismatch between the intended meaning of the input and the implementation.

This illustrates an important principle:

**A program can execute successfully and still produce incorrect results.**

Debugging is necessary because defects can appear in several forms:

- Incorrect calculations.
- Unexpected control flow.
- Invalid or inconsistent state.
- Incorrect assumptions about input data.
- Failures in dependencies.
- Errors at component boundaries.
- Environment-specific behavior.
- Timing-dependent failures.

Testing can reveal that behavior is incorrect. Debugging investigates why it is incorrect.

## 3. A Mental Model for Debugging

Think of debugging as investigating a chain of events.

```text
Input
  |
  v
Function A
  |
  v
Function B
  |
  v
Dependency C
  |
  v
Output
```

Suppose the output is incorrect. The defect could originate in the input, Function A, Function B, Dependency C, or the assumptions connecting these components.

The visible failure location is not necessarily the root cause.

For example, a database-related error might appear in an API endpoint, but the underlying cause could be an invalid request, an incorrectly constructed query, or an assumption made by an upstream service.

A useful distinction is:

- **Symptom:** What you observe, such as an incorrect result or exception.
- **Root cause:** The underlying defect or condition that produces the symptom.
- **Fix:** The change intended to remove the root cause.
- **Verification:** Evidence that the fix works under relevant conditions.

An effective engineer does not stop at identifying the symptom. The engineer builds an evidence-based explanation of the failure.

## 4. The Systematic Debugging Workflow

Use a repeatable process rather than making random changes.

### Step 1: Understand the Expected Behavior

Before investigating code, define what should happen.

Ask:

- What output is expected?
- What input was supplied?
- What state should the system be in?
- Is the behavior specified by a requirement, test, API contract, or business rule?
- Is the behavior consistently wrong or intermittent?

For example:

```python
def calculate_total(price: float, quantity: int) -> float:
    return price * quantity
```

If the price is `49.50` and quantity is `3`, the expected total is `148.50`.

Having a precise expected result gives the investigation a reference point.

### Step 2: Reproduce the Failure

A reproducible failure is easier to investigate than an intermittent report with incomplete information.

Capture the smallest useful set of details:

- Input values.
- Steps required to trigger the problem.
- Relevant application state.
- Expected behavior.
- Actual behavior.
- Error message or traceback, if present.
- Environment or dependency conditions that appear relevant.

A minimal reproduction removes unrelated operations and makes the defect easier to isolate.

For example, if a large API workflow fails, determine whether the same failure can be reproduced by calling the underlying service function directly with a specific input.

Do not assume that a failure has been reproduced merely because a similar error occurred once.

### Step 3: Form a Hypothesis

A hypothesis is a testable explanation of the observed behavior.

For example:

> The total is incorrect because the quantity is being interpreted as a unit price.

A useful hypothesis predicts what you should observe if it is true.

Avoid vague statements such as:

> Something is wrong in the calculation.

Instead, identify a specific assumption, operation, or boundary that could explain the failure.

Possible hypotheses include:

- A function receives the wrong argument.
- A conditional branch is selected unexpectedly.
- A value is overwritten.
- A dependency returns an unexpected result.
- A conversion changes the meaning or precision of a value.
- An exception is caught and suppressed.
- A cached value is stale.

### Step 4: Collect Evidence

Inspect the program to determine whether the hypothesis is supported.

Useful evidence includes:

- Input and output values at a function boundary.
- The active conditional branch.
- Variable values immediately before an incorrect operation.
- The call stack.
- The exact exception and its traceback.
- The response returned by a dependency.
- The state of relevant objects before and after a mutation.

Prefer observations that distinguish between competing explanations.

For example, if the result is incorrect, inspect the value entering the calculation before changing the formula. The input itself may be wrong.

### Step 5: Narrow the Fault Location

Reduce the search area until you can identify the operation responsible for the incorrect behavior.

You can do this by:

- Following the call stack.
- Inspecting inputs and outputs at function boundaries.
- Stepping through the execution path.
- Comparing a successful execution with a failing one.
- Temporarily simplifying the reproduction.
- Isolating a dependency using an appropriate test double.

Avoid changing multiple unrelated functions simultaneously. Doing so makes it difficult to determine which change affected the outcome.

### Step 6: Fix the Root Cause

Once the evidence identifies the defect, make the smallest appropriate correction.

A good fix addresses the underlying reason for the failure rather than merely hiding the symptom.

For example, catching every exception and returning `None` may prevent an error from reaching the caller, but it can also conceal the original defect and create invalid downstream state.

A correction should preserve intended behavior and make invalid assumptions explicit where appropriate.

### Step 7: Verify the Fix

Re-run the original reproduction.

Then consider:

- Relevant unit tests.
- Integration tests if a component boundary is involved.
- Boundary and invalid-input cases.
- Existing behavior that could be affected.
- A regression test that would fail if the defect returned.

A fix is not complete simply because the application no longer displays the original error.

The corrected behavior must be demonstrated.

### Step 8: Record the Learning

For significant defects, document:

- What failed.
- What the root cause was.
- How it was reproduced.
- What corrected it.
- How the fix was verified.
- Whether a test or design change can prevent recurrence.

This information helps future engineers understand the system and avoid repeating the same investigation.

## 5. Debugging Python Programs

Python provides several mechanisms that help engineers investigate execution.

### 5.1 Reading Tracebacks

A traceback describes the sequence of calls that led to an unhandled exception.

Consider:

```python
def calculate_average(total: float, count: int) -> float:
    return total / count


def generate_report() -> float:
    return calculate_average(100, 0)


generate_report()
```

Python raises a `ZeroDivisionError`.

The traceback identifies the exception and shows the relevant call path. Read it from the bottom upward to understand the exception first and then follow the calls leading to the failure.

A traceback helps answer:

- What exception occurred?
- Which operation raised it?
- Which functions called the failing function?
- Which application code should be inspected first?

The deepest application frame often identifies the immediate failing operation, but it does not always identify the root cause. For example, division by zero might originate from an upstream calculation that incorrectly produced a zero count.

### 5.2 Distinguishing Exception Types

Different exceptions provide different clues.

| Exception | Typical indication |
|---|---|
| `TypeError` | An operation received an incompatible type or an incorrect call signature. |
| `ValueError` | A value has an unacceptable form or range for an operation. |
| `KeyError` | A requested dictionary key is absent. |
| `IndexError` | A sequence index is outside its valid range. |
| `AttributeError` | An object does not expose the requested attribute. |
| `ZeroDivisionError` | A division operation used a zero denominator. |
| `FileNotFoundError` | A requested file or path could not be found. |

These are clues, not definitive root-cause explanations. An exception may be caused by invalid input, a violated assumption, or an upstream defect.

### 5.3 Handling Exceptions Without Hiding Defects

Consider:

```python
def get_user_age(user: dict) -> int | None:
    try:
        return int(user["age"])
    except Exception:
        return None
```

This implementation catches almost every ordinary exception and converts it into `None`.

That may conceal important differences between a missing field, malformed data, and an unexpected programming error.

A more explicit implementation is:

```python
def get_user_age(user: dict) -> int | None:
    try:
        return int(user["age"])
    except KeyError:
        return None
    except (TypeError, ValueError) as exc:
        raise ValueError("User age must be a valid integer") from exc
```

The behavior is now more intentional:

- A missing age returns `None`.
- An age that cannot be converted raises a clearer error.
- The original exception is preserved as the cause.

Choose exception behavior according to the function's contract. Do not replace every exception with a generic fallback simply to make the program appear stable.

## 6. Using a Debugger

A debugger allows you to pause program execution and inspect its state.

Python includes `pdb`, a command-line debugger. Modern IDEs also provide graphical debugging tools with breakpoints, variable inspection, and step controls.

### 6.1 Breakpoints

A breakpoint pauses execution at a chosen location.

For example:

```python
def calculate_total(price: float, quantity: int) -> float:
    breakpoint()
    return price * quantity
```

When execution reaches `breakpoint()`, Python enters the configured debugger.

A breakpoint is useful when you need to inspect values before an operation, especially when the incorrect value is produced earlier in the execution path.

In production environments, avoid introducing interactive breakpoints into deployed code. They may block execution or interfere with request handling.

### 6.2 Stepping Through Execution

The main debugger operations are:

- **Continue:** Resume execution until the next breakpoint or program termination.
- **Step over:** Execute the current line without entering called functions.
- **Step into:** Enter a function called by the current line.
- **Step out:** Continue until the current function returns.
- **Inspect variables:** Examine values in the current execution frame.
- **Inspect the call stack:** Understand how execution reached the current location.

The exact keyboard shortcuts depend on the debugger or IDE.

### 6.3 Example: Finding an Incorrect Calculation

```python
def apply_discount(price: float, discount_percent: float) -> float:
    discount = price * discount_percent
    return price - discount


print(apply_discount(100, 20))
```

Expected output: `80`.

Actual output: `-1900`.

A systematic investigation would be:

1. Set a breakpoint before the calculation.
2. Inspect `price` and `discount_percent`.
3. Confirm that the values are `100` and `20`.
4. Step over the calculation.
5. Inspect `discount`.
6. Observe that it becomes `2000`.
7. Compare the implementation with the percentage formula.

The defect is that the percentage was used as a whole number rather than divided by `100`.

A corrected implementation is:

```python
def apply_discount(price: float, discount_percent: float) -> float:
    discount = price * (discount_percent / 100)
    return price - discount
```

This investigation demonstrates why observing intermediate state is more effective than changing code blindly.

### 6.4 Inspecting State Carefully

A debugger can change the way you observe a program, and some inspection operations can have side effects.

Be careful when inspecting:

- Lazy properties that execute code when accessed.
- Iterators that are consumed when advanced.
- Objects whose representations perform expensive work.
- Shared mutable state.
- Time-sensitive or concurrent operations.

A value displayed by the debugger should be interpreted in the context of the program's execution and object behavior.

## 7. Debugging Logical Errors

Not every defect produces an exception.

A logical error occurs when the program executes but produces behavior that violates its intended rules.

For example:

```python
def is_eligible(age: int) -> bool:
    return age > 18
```

If the business rule allows people who are at least 18 years old, this implementation incorrectly rejects users whose age is exactly 18.

The defect is a boundary-condition error.

A systematic investigation should:

1. State the exact business rule.
2. Identify the boundary value.
3. Evaluate the condition for values below, at, and above the boundary.
4. Correct the condition.
5. Verify the behavior with regression tests.

For this example:

```python
def is_eligible(age: int) -> bool:
    return age >= 18
```

The broader lesson is that logical errors often arise from incorrect assumptions about boundaries, ordering, units, state transitions, or business rules.

When debugging a logical error, do not rely exclusively on exception messages. Compare actual behavior against an explicit expected result.

## 8. Debugging Stateful and Dependency-Driven Systems

Some defects are difficult to reproduce because the result depends on more than the current function's arguments.

Examples include:

- Mutable objects shared across operations.
- Incorrect cache contents.
- Database records in unexpected states.
- Environment-specific configuration.
- External services returning unexpected responses.
- Concurrent operations modifying shared state.
- Time-dependent behavior.

For these cases, investigate the relevant state and component boundaries.

A useful sequence is:

1. Identify the state required for the failure.
2. Determine which operation creates or modifies that state.
3. Inspect the state before and after that operation.
4. Check whether a dependency violates an assumed contract.
5. Reproduce the failure with controlled inputs and state where possible.
6. Verify that the correction works under the original conditions.

Testing and mocking can help isolate components, but they serve different purposes. Refer to the preceding chapters on unit testing, integration testing, and mocking for their detailed treatment.

**Important:** A failure that disappears when you isolate a component is evidence about the investigation, not proof that the component is defect-free. Isolation may remove the state, timing, or interaction that triggers the bug.

## 9. Debugging in Production

Production debugging requires additional care because the system may be serving real users and processing valuable data.

The goal is to gather enough evidence to identify the cause while avoiding unnecessary risk.

### 9.1 Establish the Scope

Determine:

- Which functionality is affected.
- Whether the failure is widespread or limited to specific requests.
- Whether the problem started after a deployment or configuration change.
- Whether the failure is ongoing or intermittent.
- Whether a dependency is failing.
- Whether the issue affects data correctness or system availability.

These observations help prioritize investigation and determine whether immediate mitigation is necessary.

### 9.2 Preserve Evidence

Avoid restarting services, clearing caches, or changing configuration before considering whether the action will destroy useful evidence.

A restart may temporarily restore service while hiding the state that caused the failure.

Capture relevant error details, request identifiers, timestamps, configuration versions, and other safe diagnostic information according to the system's operational procedures.

Logging is useful for preserving execution evidence across time, especially when an interactive debugger cannot be attached. The dedicated Logging chapter covers that subject in detail.

### 9.3 Protect Data and Availability

Before changing production behavior, consider:

- Could the change corrupt data?
- Could the action interrupt active requests?
- Could a retry duplicate a non-idempotent operation?
- Could diagnostic output expose personal or confidential information?
- Can the change be rolled back?
- Is there a safe mitigation while the root cause is investigated?

For urgent incidents, a reversible mitigation may be appropriate before a permanent fix is ready. Record the mitigation and verify the underlying correction separately.

### 9.4 Verify Under Realistic Conditions

A local reproduction is valuable, but production failures may depend on differences in data, configuration, dependencies, or execution timing.

After the fix, verify the affected behavior and check for unintended side effects. Use appropriate tests and operational checks rather than relying solely on the absence of a new error.

## 10. Debugging vs. Testing vs. Logging

These activities complement one another but solve different problems.

| Activity | Primary question | Typical output |
|---|---|---|
| Testing | Does the software behave as expected for the tested cases? | Pass/fail results and discovered defects |
| Debugging | Why does the observed behavior differ from expectations? | Evidence-based root-cause explanation and correction |
| Logging | What relevant events and values were recorded during execution? | A time-ordered record of application events |

A failing test can provide a repeatable starting point for debugging. Logs can reveal what happened during an execution that cannot easily be reproduced. A debugger can then help inspect the specific operations and state responsible for the failure.

These techniques are most effective when used together rather than treated as alternatives.

## 11. Common Debugging Mistakes

### 11.1 Changing Code Without a Hypothesis

**Problem:** Multiple changes are made until the failure disappears.

**Why it is harmful:** You cannot reliably determine which change fixed the defect, and unrelated behavior may break.

**Better approach:** State a hypothesis, collect evidence, and make a targeted change.

### 11.2 Fixing the Symptom Instead of the Cause

**Problem:** An exception is suppressed or an invalid result is replaced with a default value.

**Why it is harmful:** The underlying defect remains and may produce incorrect downstream behavior.

**Better approach:** Trace the failure to the operation or assumption responsible for it.

### 11.3 Ignoring the Full Traceback

**Problem:** Only the last line of an error message is inspected.

**Why it is harmful:** The call path may reveal where the invalid value originated.

**Better approach:** Read the exception type and traceback, then follow relevant application frames.

### 11.4 Assuming the Failure Is in the Visible Function

**Problem:** Investigation focuses only on the function where the error appears.

**Why it is harmful:** The root cause may be an upstream input, shared state, or dependency interaction.

**Better approach:** Inspect values and contracts across the relevant boundaries.

### 11.5 Debugging Without a Reproducible Case

**Problem:** Investigation depends on a long sequence of manual actions with no captured inputs or state.

**Why it is harmful:** The same conditions may be difficult to recreate, and a fix cannot be verified reliably.

**Better approach:** Reduce the failure to a minimal reproducible example where possible.

### 11.6 Treating a Successful Run as Proof

**Problem:** The application runs once without reproducing the error, so the defect is considered fixed.

**Why it is harmful:** Intermittent defects and boundary conditions may remain.

**Better approach:** Repeat the original reproduction and run relevant regression tests.

### 11.7 Ignoring the Possibility of a New Defect

**Problem:** A fix corrects the immediate output but changes another important behavior.

**Why it is harmful:** The correction introduces a regression.

**Better approach:** Test the original failure, nearby boundary cases, and affected behavior.

### 11.8 Debugging With Unsafe Production Changes

**Problem:** Unreviewed changes, broad retries, or destructive cleanup are used to investigate a live system.

**Why it is harmful:** The investigation can worsen the incident or destroy evidence.

**Better approach:** Preserve evidence, assess operational risk, and prefer reversible changes.

---

## 12. Engineering Trade-Offs

Debugging techniques have different costs and limitations.

| Technique | Strength | Limitation |
|---|---|---|
| Reading a traceback | Fast way to locate an exception and its call path | Does not necessarily reveal the root cause |
| Reproducing the failure | Makes investigation repeatable | Some timing- or environment-dependent defects are difficult to reproduce |
| Using breakpoints | Provides detailed access to execution state | Can alter timing and is unsuitable for ordinary unattended production execution |
| Adding temporary diagnostic output | Easy to use in a simple reproduction | Can clutter output, expose data, or miss important state |
| Isolating a dependency | Helps distinguish component behavior from dependency behavior | May remove the interaction responsible for the real failure |
| Making a minimal fix | Limits the scope of change | May be insufficient if the defect reflects a broader design problem |

The right technique depends on the evidence available, the complexity of the failure, and the risks of investigation.

A strong engineer does not choose the most sophisticated tool automatically. The engineer chooses the simplest method that can answer the current question reliably.

## 13. Production Engineering Perspective

Debugging is not merely an individual troubleshooting skill. It is part of how a team maintains software quality.

A maintainable system makes failures easier to investigate through:

- Clear function responsibilities.
- Explicit input and output contracts.
- Meaningful exception types and messages.
- Reproducible tests.
- Controlled dependency boundaries.
- Useful diagnostic records.
- Small, reviewable changes.
- Regression tests for previously discovered defects.

These practices reduce the amount of guesswork required when something goes wrong.

For example, in an AI application, an incorrect generated answer might originate from input construction, retrieval results, prompt assembly, model output handling, or post-processing. Debugging requires examining the boundaries between these stages and determining where the observed result first diverges from expectations.

The same principle applies to ordinary APIs, data-processing jobs, and database-backed services: investigate the execution path and verify each relevant contract rather than assuming that the last visible component caused the problem.

## 14. Interview Questions and Answers

### Q1. What is debugging?

Debugging is the systematic investigation of unexpected software behavior to identify the root cause, correct it, and verify that the correction works.

### Q2. What is the difference between a symptom and a root cause?

A symptom is the observable failure. The root cause is the underlying defect or condition responsible for it. A visible exception may occur far downstream from the operation that introduced the invalid state.

### Q3. How would you debug a function that returns an incorrect result without raising an exception?

I would define the expected result, reproduce the failure, inspect the input values and intermediate state, form a testable hypothesis, identify the incorrect operation, make a targeted correction, and verify the behavior with regression tests.

### Q4. What information does a Python traceback provide?

It identifies the exception and shows the sequence of calls leading to the failure. It helps locate the immediate failing operation and trace execution through relevant functions.

### Q5. Why is it dangerous to catch every exception?

Broad exception handling can hide programming defects, suppress useful failure information, and allow invalid state to propagate. Exceptions should be handled according to the function's contract and the errors the application can meaningfully recover from.

### Q6. What is a breakpoint?

A breakpoint pauses execution at a chosen location so that the engineer can inspect variable values, control flow, and the call stack.

### Q7. How do you debug an intermittent issue?

I would capture the conditions under which it occurs, including inputs, relevant state, environment, timing, and dependency behavior. I would then attempt to reproduce the failure and compare successful and failing executions. If direct reproduction is not possible, I would use safe diagnostic evidence to narrow the possibilities.

### Q8. How do you prevent a bug from returning?

I would verify the correction, add a regression test that captures the original failure, test relevant boundary cases, and consider whether a clearer contract or design change would prevent similar defects.

### Q9. Why might a bug disappear when a debugger is attached?

Pausing execution can change timing and scheduling. This may affect race conditions, timeouts, and other timing-sensitive behavior. Debugger inspection can also affect certain stateful objects.

### Q10. Is restarting a service a debugging solution?

Not by itself. A restart may mitigate a symptom, but it does not establish the root cause. It can also destroy useful state. A restart should be treated as an operational action whose risks and effects are understood.

---

## 15. Practical Assignment

### Assignment: Investigate and Fix a Defective Function

You are given the following implementation:

```python
def calculate_final_price(
    price: float,
    discount_percent: float,
    quantity: int,
) -> float:
    discount = price * discount_percent
    final_price = price - discount
    return final_price * quantity
```

For this assignment, use these requirements:

- `price` represents the price of one item.
- `discount_percent` is a percentage between `0` and `100`, inclusive.
- `quantity` is a positive integer.
- The result is the total price after applying the discount to each item.
- Invalid inputs must be rejected rather than silently converted into valid-looking results.

### Tasks

1. Write down the expected result for `price=100`, `discount_percent=20`, and `quantity=3`.
2. Execute the function and record its actual result.
3. Identify the symptom and propose at least one hypothesis.
4. Inspect the intermediate values to determine the root cause.
5. Correct the implementation.
6. Add validation for the stated input constraints.
7. Write tests for a normal case, zero discount, full discount, invalid discount, invalid quantity, and an important boundary case.
8. Verify that the tests fail against the defective implementation where appropriate and pass against the corrected one.
9. Explain why your correction addresses the root cause rather than merely hiding the symptom.

### Expected Deliverables

- A corrected Python function.
- A test file.
- A short explanation of the root cause.
- Evidence that the original failure has been corrected.

Do not begin by rewriting the entire function. First reproduce the problem and explain what the current implementation actually does.

---

## 16. Quick Revision

- Debugging investigates why software behaves incorrectly.
- A symptom is not necessarily the root cause.
- Reproduce the failure before making changes.
- A hypothesis should be specific and testable.
- Tracebacks show exceptions and the execution path leading to them.
- Breakpoints allow inspection of program state during execution.
- Logical errors can occur without exceptions.
- Production debugging must preserve evidence and protect system stability.
- A fix must be verified against the original failure and relevant regression cases.
- Testing, debugging, and logging complement one another.

## 17. Key Takeaways

1. **Debug systematically:** Define expected behavior, reproduce the failure, form a hypothesis, collect evidence, isolate the cause, fix it, and verify the result.
2. **Follow the evidence:** The location where a failure appears may differ from the location where its cause originated.
3. **Understand execution state:** Inputs, intermediate values, control flow, dependencies, and shared state all influence behavior.
4. **Avoid random changes:** Targeted changes make the investigation more reliable and easier to review.
5. **Protect production systems:** Preserve diagnostic evidence and consider the operational consequences of every action.
6. **Prevent recurrence:** Regression tests and clear component contracts make future failures easier to detect and investigate.

## 18. Further Reading

- [Python `pdb` — The Python Debugger](https://docs.python.org/3/library/pdb.html)
- [Python Exceptions Tutorial](https://docs.python.org/3/tutorial/errors.html)
- [Python Built-in Exceptions](https://docs.python.org/3/library/exceptions.html)
- [pytest Documentation](https://docs.pytest.org/)

---

# End of Document

This completes the Markdown file: `04-Debugging.md`
