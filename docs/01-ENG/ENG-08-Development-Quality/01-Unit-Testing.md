# Unit Testing

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain why unit testing exists and which problems it solves.
- Understand what constitutes a unit of behavior.
- Distinguish testing observable behavior from testing implementation details.
- Structure tests so that they are readable, deterministic, and maintainable.
- Write unit tests using Python and `pytest`.
- Test normal behavior, boundary conditions, invalid inputs, and expected exceptions.
- Understand assertions, test discovery, test execution, and failure reports.
- Identify characteristics of effective and ineffective unit tests.
- Make informed decisions about test coverage and testing effort.
- Apply unit testing to realistic application logic.

## 2. Prerequisites

This chapter assumes familiarity with:

- Python functions and return values.
- Parameters and arguments.
- Conditional statements and loops.
- Exceptions and error handling.
- Basic modules and imports.
- Fundamental programming concepts from ENG-02 — Programming Foundations.
- Separation of concerns and maintainable design from ENG-03 — Software Engineering Principles.

These concepts are prerequisites rather than subjects of this chapter.

**Estimated reading time:** 20–30 minutes.

## 3. Before We Start

Consider a function that calculates a discount:

```python
def calculate_discount(price: float, discount_percent: float) -> float:
    return price * discount_percent / 100
```

The function looks simple. A developer might inspect it and conclude that it works correctly.

But several questions remain:

- Does it return the correct value for a normal input?
- What happens when the discount is zero?
- What happens when the discount is 100 percent?
- Does it behave correctly for decimal prices?
- What happens if the discount is negative?
- Will a future change accidentally break its behavior?

Reading the code helps us understand what the implementation appears to do. It does not independently demonstrate that the implementation behaves as expected.

This is the problem unit testing addresses.

## 4. Why Unit Testing Exists

### 4.1 The problem with manual verification

Suppose an application contains 100 functions.

Whenever a developer changes one function, that change might affect other behavior. Manually checking every relevant case becomes increasingly expensive and unreliable.

Manual verification also has limitations:

- Developers may forget important cases.
- The same scenario may be checked differently by different people.
- Repeated verification consumes development time.
- Defects may remain unnoticed until a user encounters them.
- A previously fixed defect may return after a later change.

Software behavior needs a repeatable way to be checked.

### 4.2 What is unit testing?

**Unit testing is the practice of verifying that a small, isolated unit of software behaves as expected under specified conditions.**

A unit may be a function, a method, or another small piece of behavior. The appropriate boundary depends on the design of the application.

A unit test typically:

1. Establishes the inputs and conditions.
2. Executes the behavior being tested.
3. Observes the result.
4. Compares the result with an expected outcome.
5. Reports success or failure.

For example:

```python
def add(a: int, b: int) -> int:
    return a + b
```

A test could verify:

```python
def test_add_returns_sum():
    assert add(2, 3) == 5
```

If the function returns `5`, the assertion succeeds. If it returns a different value, the test fails.

The test makes an expectation executable and repeatable.

### 4.3 What unit testing does not guarantee

A passing unit test does not prove that an entire application is correct.

It provides evidence about the specific behavior covered by the test under the conditions in which it executes.

A function may pass its unit tests and still fail when used with an incompatible database, an incorrectly configured dependency, or an unexpected external response.

Unit testing is therefore one part of software quality, not a substitute for every other verification technique.

## 5. Mental Model: Tests as Executable Specifications

An executable specification describes expected software behavior in a form that can be checked automatically.

Consider this requirement:

> A customer with a qualifying order receives a discount of 10 percent.

This statement expresses an expectation, but it is not directly executable.

A unit test converts the expectation into a concrete example:

```python
def test_qualifying_order_receives_discount():
    final_price = calculate_final_price(1000, 10)

    assert final_price == 900
```

The test communicates three things:

- The input represents an order worth 1,000.
- The discount is 10 percent.
- The expected final price is 900.

The test now serves two purposes:

1. It checks the implementation.
2. It documents the intended behavior for future developers.

This mental model is useful because tests should describe meaningful expectations, not merely execute code.

### 5.1 The feedback loop

```text
Write or modify code
        |
        v
Execute unit tests
        |
        v
Compare actual behavior
with expected behavior
        |
        v
  +-----+-----+
  |           |
 Pass        Fail
  |           |
  v           v
Continue    Investigate
            the failure
```

A failure does not automatically mean the implementation is wrong. The test expectation may also be incorrect.

The developer must determine whether the failure reveals a defect, an incorrect assumption, or an invalid test.

## 6. Core Concepts

### 6.1 Units and behavioral boundaries

A unit test should focus on a clearly defined unit of behavior.

For example:

```python
def is_adult(age: int) -> bool:
    return age >= 18
```

The behavior is simple: the function determines whether an age meets the threshold of 18.

Useful test cases include:

- An age below 18.
- An age equal to 18.
- An age above 18.

The tests focus on the function's contract: the relationship between its input and its expected output.

A unit does not always have to be one line of code or one individual statement. A function containing several conditions may still represent one meaningful unit of behavior.

The important question is:

**What behavior can be verified independently and meaningfully?**

### 6.2 Test inputs and expected outcomes

A test needs a reason to pass or fail.

Consider the following test:

```python
def test_is_adult():
    assert is_adult(20)
```

This checks that the returned value is truthy. However, the intended behavior can be communicated more clearly:

```python
def test_is_adult_returns_true_for_age_20():
    assert is_adult(20) is True
```

An explicit expectation is easier to understand when a test fails.

The same principle applies to numeric results, strings, collections, and exceptions.

Prefer assertions that express the intended behavior directly.

### 6.3 The Arrange–Act–Assert pattern

A common way to structure unit tests is **Arrange–Act–Assert (AAA)**.

- **Arrange:** Prepare the inputs and conditions.
- **Act:** Execute the behavior.
- **Assert:** Verify the expected result.

Example:

```python
def test_discount_calculation():
    # Arrange
    price = 1000
    discount_percent = 10

    # Act
    discount = calculate_discount(price, discount_percent)

    # Assert
    assert discount == 100
```

The three phases separate setup, execution, and verification.

For simple tests, separate comments may be unnecessary. The structure should remain understandable without adding boilerplate.

Avoid putting several unrelated behaviors into one test merely because they share the same setup.

### 6.4 Assertions

An assertion expresses a condition that must hold for a test to pass.

Examples:

```python
assert result == expected
assert result is None
assert len(results) == 3
assert "email" in user
```

Each assertion should communicate an expectation relevant to the behavior being tested.

A test can execute successfully without proving anything useful if it contains no meaningful assertion or other explicit verification.

For example:

```python
def test_add():
    add(2, 3)
```

This test executes the function but does not check whether the result is correct.

A better test is:

```python
def test_add():
    assert add(2, 3) == 5
```

The distinction is fundamental: **executing code is not the same as verifying behavior.**

### 6.5 Normal cases, boundary cases, and invalid inputs

A strong test suite covers meaningful variations in behavior.

Consider:

```python
def is_adult(age: int) -> bool:
    return age >= 18
```

Three important cases are:

| Case | Input | Expected result |
|---|---:|---|
| Below boundary | 17 | `False` |
| At boundary | 18 | `True` |
| Above boundary | 19 | `True` |

Boundary values deserve attention because defects frequently occur around thresholds, limits, and transitions.

Invalid-input tests are also important when the function defines how invalid inputs should be handled.

However, Python type annotations do not automatically enforce runtime input validation. If a function accepts an integer by convention but does not validate it, the expected behavior for an invalid input must be determined from the function's actual contract.

Do not invent requirements solely to increase the number of tests.

### 6.6 Deterministic tests

A deterministic test produces the same result when executed repeatedly under equivalent conditions.

For example:

```python
def multiply(a: int, b: int) -> int:
    return a * b


def test_multiply():
    assert multiply(4, 5) == 20
```

The inputs and expected output are explicit.

By contrast, a test that depends on an uncontrolled random value, current time, or changing external state may produce inconsistent results.

Non-deterministic tests are difficult to diagnose because a failure may not correspond to a reproducible defect in the code being tested.

When randomness or time is part of the intended behavior, design the test around controlled conditions or explicit expectations. The appropriate dependency-control techniques are covered in the Mocking chapter.

### 6.7 Test independence

Tests should not depend on an unrelated test having executed first.

For example, a test should not pass only because another test previously created a required object in shared mutable state.

Independent tests are easier to run individually, repeat, debug, and maintain.

Test setup should establish the conditions required by that test. Shared setup mechanisms can be useful, but they should not create hidden dependencies between tests.

### 6.8 Testing behavior versus implementation

Consider two implementations:

```python
def get_active_users(users):
    return [user for user in users if user["active"]]
```

An alternative implementation might use a loop and build the list incrementally.

If both return the same expected active users, their externally visible behavior is equivalent for those inputs.

A good unit test should normally verify the returned users, not require the implementation to use a list comprehension.

Tests that depend unnecessarily on internal details can break when the implementation changes without any change in intended behavior.

This does not mean internal details can never be tested. Internal behavior may matter when it forms part of an explicit contract. The goal is to avoid coupling tests to details that do not matter.

## 7. Internal Working: What Happens When a Test Runs?

A test framework such as `pytest` automates test discovery, execution, assertion reporting, and result collection.

A simplified execution model is:

```text
Test command
     |
     v
Discover test files and functions
     |
     v
Prepare test-specific state
     |
     v
Execute test function
     |
     v
Evaluate assertions
     |
     v
Collect result and diagnostics
     |
     v
Display summary
```

The exact execution details depend on the framework and its configuration.

### 7.1 Test discovery

With the conventional `pytest` naming scheme, test files commonly begin with `test_` or end with `_test.py`. Test functions commonly begin with `test_`.

For example:

```text
project/
├── pricing.py
└── tests/
    └── test_pricing.py
```

The framework searches for eligible tests according to its discovery rules.

A correctly written test may never run if its file or function does not match the discovery configuration.

### 7.2 Test execution

The framework executes the discovered test functions.

A test may:

- Complete successfully.
- Fail an assertion.
- Raise an unexpected exception.
- Be skipped according to the test configuration.
- Encounter another execution error.

These outcomes provide different diagnostic information. A failed assertion generally indicates that an observed value did not match an expectation. An unexpected exception indicates that execution did not complete as the test expected.

### 7.3 Assertion reporting

When an assertion fails, the framework reports information about the failure, such as the test name, source location, and relevant values.

For example, if the actual result is `8` and the expected result is `10`, the report helps identify the mismatch.

The framework reports the evidence. It does not determine whether the requirement, test, or implementation is conceptually correct.

That decision remains an engineering responsibility.

## 8. Practical Implementation with Python and pytest

This section develops a small unit-testing example from implementation to execution.

### 8.1 Project structure

Create the following structure:

```text
unit-testing-demo/
├── pricing.py
└── tests/
    └── test_pricing.py
```

The application logic belongs in `pricing.py`. The tests belong in `tests/test_pricing.py`.

Keeping the test code separate from the application code makes it clear which behavior is being verified.

### 8.2 Install the test framework

Use a development environment appropriate for your project, then install `pytest`:

```bash
python -m pip install pytest
```

This installs the test framework. It does not change the business logic being tested.

### 8.3 Implement the application behavior

Create `pricing.py`:

```python
def calculate_final_price(
    price: float,
    discount_percent: float,
) -> float:
    if price < 0:
        raise ValueError("Price cannot be negative")

    if not 0 <= discount_percent <= 100:
        raise ValueError(
            "Discount must be between 0 and 100"
        )

    discount = price * discount_percent / 100
    return price - discount
```

The function implements three behaviors:

1. Negative prices are rejected.
2. Discounts outside the inclusive range from 0 to 100 are rejected.
3. Valid inputs produce a final price after the discount.

The validation rules are part of this example's explicit contract.

### 8.4 Write the unit tests

Create `tests/test_pricing.py`:

```python
import pytest

from pricing import calculate_final_price


def test_calculates_price_after_discount():
    result = calculate_final_price(1000, 10)

    assert result == 900


def test_zero_discount_preserves_price():
    result = calculate_final_price(1000, 0)

    assert result == 1000


def test_full_discount_returns_zero():
    result = calculate_final_price(1000, 100)

    assert result == 0


def test_rejects_negative_price():
    with pytest.raises(
        ValueError,
        match="Price cannot be negative",
    ):
        calculate_final_price(-100, 10)


def test_rejects_discount_above_100():
    with pytest.raises(
        ValueError,
        match="Discount must be between 0 and 100",
    ):
        calculate_final_price(1000, 120)


def test_rejects_negative_discount():
    with pytest.raises(
        ValueError,
        match="Discount must be between 0 and 100",
    ):
        calculate_final_price(1000, -5)
```

These tests verify valid behavior, boundary values, and invalid-input handling.

Notice that each test has one clear purpose. When a test fails, its name helps identify the behavior that needs investigation.

### 8.5 Run the tests

From the project root, execute:

```bash
python -m pytest -v
```

The `-v` option requests verbose output.

If all six tests pass, the framework reports six successful tests. If a test fails, inspect the failure report before changing the code.

You can also run one specific test:

```bash
python -m pytest -v \
    tests/test_pricing.py::test_full_discount_returns_zero
```

Running a focused test is useful when investigating a particular behavior. Run the relevant suite again after making a change to check for regressions.

### 8.6 What this example demonstrates

The example illustrates several important principles:

- Expected behavior is explicit.
- Normal and boundary cases are covered.
- Invalid inputs are tested against a defined contract.
- Each test has a descriptive name.
- The tests do not require a database, network connection, or external service.
- The test framework reports whether the observed behavior matches expectations.

The example is intentionally small. A production pricing system might need additional rules for currency precision, tax, rounding, promotions, and monetary representation. Those requirements should be defined and tested separately when they belong to the actual application contract.

### 8.7 Parameterized tests

When several cases verify the same rule, `pytest.mark.parametrize` can reduce duplication.

For example:

```python
import pytest

from pricing import calculate_final_price


@pytest.mark.parametrize(
    ("price", "discount", "expected"),
    [
        (1000, 0, 1000),
        (1000, 10, 900),
        (1000, 50, 500),
        (1000, 100, 0),
    ],
)
def test_calculates_final_price(
    price,
    discount,
    expected,
):
    assert calculate_final_price(
        price,
        discount,
    ) == expected
```

The framework executes the test function for each supplied parameter set.

Parameterized tests are useful when multiple inputs share the same behavioral rule and assertion.

However, do not combine unrelated scenarios into one parameterized test merely to reduce the number of functions. Test readability matters more than minimizing lines of code.

## 9. Designing a Useful Unit-Test Suite

Writing tests is not enough. The cases selected determine what the suite can reveal.

### 9.1 Start with the contract

Before writing tests, identify:

- Valid inputs.
- Expected outputs.
- Boundary conditions.
- Invalid inputs and their expected handling.
- Relevant error conditions.
- Behavior that must remain stable when the implementation changes.

These expectations should come from the requirements and intended behavior of the software.

### 9.2 Prioritize meaningful cases

A useful starting point is:

| Category | Question |
|---|---|
| Normal behavior | Does the expected case work? |
| Boundary behavior | Does the function behave correctly at important limits? |
| Invalid input | Is invalid data handled according to the contract? |
| Error behavior | Are expected failures reported appropriately? |
| Regression | Could a previously fixed defect return? |

Not every function needs a separate test for every category. The appropriate coverage depends on the behavior, complexity, risk, and cost of failure.

### 9.3 Avoid redundant tests

Suppose a function simply returns the sum of two integers.

Testing every possible pair of integers is generally impractical and unnecessary. A few carefully selected examples can establish basic behavior, while additional cases should target meaningful risks or boundaries.

Redundant tests increase maintenance effort without necessarily increasing confidence.

The goal is not the largest test suite. It is a suite that provides useful evidence about the behavior that matters.

### 9.4 Keep tests readable

A test should make it easy to understand:

- What scenario is being evaluated.
- What behavior is executed.
- What result is expected.
- Why a failure matters.

Avoid overly complicated setup, unexplained values, and multiple unrelated assertions that make the cause of failure difficult to identify.

A descriptive test name is often more useful than a long explanatory comment.

## 10. Production Perspective

Unit tests are valuable in production-oriented software development because application logic changes continuously.

Consider a backend service that calculates eligibility for a feature. A small change to a comparison operator might unintentionally alter who qualifies.

A unit test can preserve the expected boundary behavior and provide immediate feedback when that behavior changes.

### 10.1 Regression protection

A regression occurs when a change reintroduces a defect or breaks previously correct behavior.

A useful workflow is:

1. Reproduce or identify the incorrect behavior.
2. Establish the expected behavior.
3. Write a test that detects the defect.
4. Correct the implementation.
5. Run the test to verify the fix.
6. Run relevant existing tests to check for unintended effects.

The test becomes a repeatable check against the same class of failure.

### 10.2 Testing business rules

Unit testing is particularly useful for logic with explicit rules, such as:

- Eligibility calculations.
- Price and discount calculations.
- Input validation.
- Scoring functions.
- Data transformations.
- Permission decisions.
- State-transition rules.

These behaviors can often be tested without launching the complete application.

For example, a matchmaking application might have a function that assigns a score based on age difference. Unit tests can verify its expected behavior at defined thresholds without requiring a live database or vector search service.

The test should verify the agreed scoring contract, not invent product rules.

### 10.3 Running tests during development

Tests are most useful when developers can execute them frequently and interpret failures quickly.

A small, focused suite can provide rapid feedback while changing a function. Larger test suites may take longer and can be executed at broader verification stages.

The relevant engineering trade-off is feedback speed versus the amount of behavior being checked.

Full CI/CD pipeline design is outside this chapter's scope.

### 10.4 Unit tests and code design

Code that separates business logic from unrelated concerns is often easier to test.

For example, a function that calculates a discount is easier to verify when it does not also connect to a database, send an email, and modify application-wide state.

This is a practical connection to separation of concerns and dependency injection from ENG-03. Those design principles are not retaught here.

Difficulty writing a unit test may reveal that a unit has too many responsibilities or depends on too much uncontrolled state. This is a useful signal to investigate, not automatic proof that the design is wrong.

## 11. Engineering Decisions and Trade-offs

### 11.1 What should be unit tested?

Prioritize behavior that is important, error-prone, complex, or likely to change.

Examples include:

- Business rules with several conditions.
- Calculations with meaningful boundaries.
- Input-validation rules.
- Logic responsible for important decisions.
- Previously defective behavior.

Trivial code may need fewer tests when its behavior is already exercised adequately through more meaningful cases.

### 11.2 How much test coverage is enough?

Code coverage measures which portions of the code are executed by tests. Depending on the tool, coverage may be measured at the line, statement, branch, or other level.

Coverage is useful for identifying code that has not been exercised. It does not prove that the exercised behavior has been verified correctly.

Consider:

```python
def is_adult(age: int) -> bool:
    return age >= 18
```

A test using only `age = 20` executes the comparison and may achieve full line coverage for this function. However, it does not establish that the boundary at 18 behaves correctly.

A test suite can execute every line and still contain incorrect expectations or miss important scenarios.

Use coverage as a diagnostic aid, not as the sole measure of quality.

### 11.3 When should tests be added?

Add or update tests when:

- Introducing new behavior.
- Fixing a defect.
- Changing business rules.
- Refactoring behavior that must remain stable.
- Discovering an uncovered boundary or failure condition.

The tests should reflect intended behavior. They should not force the application to preserve an accidental implementation detail.

### 11.4 Testing cost versus confidence

Tests require time to write, execute, and maintain.

Insufficient testing increases the risk of undetected defects. Excessive or poorly designed testing increases maintenance cost and can slow development without proportionate benefits.

A sensible approach is to allocate testing effort according to risk, complexity, and the consequences of failure.

There is no universal number of unit tests that makes an application reliable.

## 12. Common Mistakes and Misconceptions

### Mistake 1: Testing without assertions

Calling a function without verifying its result does not meaningfully establish correctness.

**Better approach:** Express the expected behavior through a clear assertion or another explicit verification.

### Mistake 2: Testing only the happy path

A function may work for typical inputs but fail at a threshold or mishandle invalid input.

**Better approach:** Identify meaningful boundaries and failure conditions from the function's contract.

### Mistake 3: Writing tests that depend on execution order

Tests that share hidden mutable state may pass together but fail individually or in a different order.

**Better approach:** Make each test establish the conditions it needs.

### Mistake 4: Testing implementation details unnecessarily

A test may fail after an internal refactor even though the externally observable behavior is unchanged.

**Better approach:** Test the behavior that the unit promises to provide.

### Mistake 5: Assuming a passing test proves correctness

A test can pass because its expectation is wrong, its assertion is weak, or the important scenario is missing.

**Better approach:** Review whether each test represents a meaningful requirement and whether the selected cases cover important risks.

### Mistake 6: Treating code coverage as a quality score

High coverage does not necessarily mean that the tests would detect incorrect behavior.

**Better approach:** Examine test quality, assertions, boundaries, and failure scenarios alongside coverage.

### Mistake 7: Writing one enormous test

A test that checks many unrelated behaviors can make failures difficult to interpret.

**Better approach:** Give each test a clear purpose and separate unrelated scenarios.

### Mistake 8: Overusing parameterization

Parameterization is useful for repeated instances of the same rule. It can obscure a suite when unrelated scenarios are forced into a common structure.

**Better approach:** Optimize for clarity rather than minimizing test count.

### Mistake 9: Making tests unnecessarily complicated

Complex setup can make tests harder to understand than the production behavior itself.

**Better approach:** Keep setup focused, use descriptive values, and avoid unrelated dependencies.

### Mistake 10: Ignoring a failing test

Changing an assertion simply to make the suite pass can hide a genuine defect.

**Better approach:** Investigate the expected behavior, actual result, and test assumptions before deciding what should change.

## 13. Interview Questions with Expected Answers

### Q1. What is unit testing?

Unit testing verifies the expected behavior of a small, isolated unit of software, such as a function or method. It provides repeatable evidence that the unit behaves correctly under selected conditions.

### Q2. Why is unit testing important?

It helps detect defects early, documents expected behavior, supports safer refactoring, and reduces dependence on repetitive manual verification.

### Q3. What is the difference between executing code and testing it?

Executing code runs the implementation. Testing also verifies the observed behavior against an explicit expectation. A function call without meaningful verification may not detect incorrect results.

### Q4. What is the Arrange–Act–Assert pattern?

It separates a test into preparation, execution, and verification. This makes the scenario easier to understand and the source of a failure easier to identify.

### Q5. What is a boundary test?

A boundary test checks behavior at or near an important limit, such as a minimum age of 18 or a maximum discount of 100 percent. Boundary tests help detect errors around thresholds.

### Q6. What makes a unit test deterministic?

A deterministic test produces the same result under equivalent conditions. It avoids uncontrolled dependencies on changing state, time, randomness, or external conditions.

### Q7. Can a unit test pass while the implementation is wrong?

Yes. The test may use an incorrect expectation, weak assertions, or insufficient scenarios. Passing tests provide evidence about tested behavior, not proof of total correctness.

### Q8. Does 100 percent code coverage guarantee quality?

No. Coverage indicates which code was exercised according to the measurement method. It does not establish that assertions are correct or that all important behaviors have been tested.

### Q9. Why should unit tests avoid unnecessary implementation details?

Tests tightly coupled to implementation details can fail during harmless refactoring. Testing meaningful behavior generally allows the implementation to evolve while preserving its intended contract.

### Q10. What would you do if a test passed locally but failed in another environment?

First, compare the failure reports and execution conditions. Investigate differences in configuration, runtime versions, test data, environment-dependent assumptions, and shared state. Reproduce the failure before changing the test or implementation.

### Q11. How can unit tests help with regression prevention?

A test can capture the expected behavior associated with a previously discovered defect. Future changes can then be checked against the same expectation.

### Q12. When might a function need more unit tests?

When it has important branches, complex rules, boundary conditions, high failure consequences, or a history of defects that the current tests do not adequately cover.

## 14. Practical Assignment

### Assignment: Build a Unit-Tested Eligibility Calculator

Implement a Python function that determines whether a customer qualifies for a benefit.

Use the following example contract:

- A customer must be at least 18 years old.
- The customer's annual income must be at least ₹300,000.
- Both conditions must be satisfied.
- A customer who fails either condition is not eligible.

Create the function in `eligibility.py` and its tests in `tests/test_eligibility.py`.

#### Requirements

1. Implement the eligibility function.
2. Write tests for a customer who qualifies.
3. Write tests for a customer who fails the age requirement.
4. Write tests for a customer who fails the income requirement.
5. Test the exact age threshold.
6. Test the exact income threshold.
7. Add a test for a customer who fails both conditions.
8. Use descriptive test names and explicit assertions.
9. Run the full test suite using `pytest`.
10. Explain why each test case is necessary.

Treat these conditions as the assignment's explicit requirements. Decide how to handle invalid inputs only after defining a reasonable validation contract.

#### Expected project structure

```text
eligibility-project/
├── eligibility.py
└── tests/
    └── test_eligibility.py
```

#### Engineering reflection

After completing the assignment, answer these questions:

- Which test case was most likely to catch a boundary defect?
- Could two different implementations satisfy the same tests?
- What important behavior would remain untested if you tested only eligible customers?
- If the age requirement changed from 18 to 21, which tests would need updating?
- How would you demonstrate that the tests detect an intentionally introduced defect?

Do not focus only on making all tests pass. Focus on whether the suite would detect incorrect behavior.

## 15. Quick Revision

- Unit testing verifies a small, isolated unit of behavior.
- A useful test compares observed behavior with an explicit expectation.
- Arrange–Act–Assert separates preparation, execution, and verification.
- Normal, boundary, invalid-input, and error cases should be considered according to the contract.
- Deterministic and independent tests are easier to reproduce and maintain.
- Tests should generally verify behavior rather than unnecessary implementation details.
- `pytest` discovers and executes tests and reports failures.
- Code coverage measures execution, not the correctness of expectations.
- A passing suite provides evidence, not a mathematical guarantee of correctness.
- Good unit tests balance meaningful coverage, readability, and maintenance cost.

## 16. Key Takeaways

1. **Tests are executable expectations.** Their value depends on the correctness and usefulness of the behavior they verify.
2. **Test design matters more than test count.** A small number of carefully selected cases can be more valuable than many redundant tests.
3. **Boundary conditions deserve deliberate attention.** Thresholds and limits often expose defects that ordinary examples miss.
4. **Maintainability applies to tests too.** Clear names, focused scenarios, and explicit expectations reduce debugging effort.
5. **Testing is an engineering decision.** Select cases based on behavior, risk, and failure consequences.
6. **Unit testing is one part of quality engineering.** It does not replace integration testing, debugging, profiling, or other quality practices.

## 17. Further Reading

- [pytest — Official Documentation](https://docs.pytest.org/en/stable/): Test discovery, assertions, parameterization, and test execution.
- [Python — `unittest` Documentation](https://docs.python.org/3/library/unittest.html): Python's standard-library unit-testing framework and its testing concepts.

Use these references to deepen your understanding of the framework and its capabilities. The engineering principles in this chapter remain applicable across different testing frameworks.

---

# End of Document

This completes the Markdown file: `01-Unit-Testing.md`

All parts can now be combined into a single production-ready Markdown document for the GitHub repository.
