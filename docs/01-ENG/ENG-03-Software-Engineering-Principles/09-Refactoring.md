# Refactoring

## 1. Overview

Refactoring is the disciplined process of improving the internal structure of existing software without changing its externally observable behavior.

Software rarely remains in its original form. Requirements evolve, new features are added, defects are fixed, and engineers discover that earlier implementation decisions no longer serve the system well.

As a result, code that was initially understandable can gradually become difficult to modify, test, debug, or extend.

Refactoring helps engineers improve that code incrementally while preserving the behavior that existing users and systems depend on.

The central idea is simple:

**Change the internal structure deliberately, verify that behavior remains intact, and reduce the cost of future changes.**

Refactoring is not synonymous with rewriting code, renaming variables, or making an implementation shorter. It is a controlled engineering activity with an explicit objective and a verification strategy.

### Learning Objectives

After completing this chapter, you should be able to:

- Explain the purpose and boundaries of refactoring.
- Distinguish refactoring from feature development, bug fixing, and rewriting.
- Identify code that may benefit from refactoring.
- Establish an appropriate safety net before changing existing code.
- Refactor code through small, verifiable steps.
- Recognize common refactoring techniques and their appropriate use.
- Refactor unfamiliar code without relying on assumptions about its behavior.
- Review refactoring changes for correctness and regression risk.
- Decide when to refactor immediately, defer the work, or avoid it.

### Scope Boundaries

This chapter focuses on the safe improvement of existing code.

- [Software Quality Attributes](01-Software-Quality-Attributes.md) explains the quality characteristics refactoring can help improve.
- [Software Design Principles](02-Software-Design-Principles.md) explains the principles that guide design decisions.
- [Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md) covers responsibility boundaries.
- [Coupling and Cohesion](04-Coupling-and-Cohesion.md) explains structural relationships between components.
- [SOLID Principles](05-SOLID-Principles.md) covers the relevant object-oriented design principles.
- [Dependency Injection](06-Dependency-Injection.md) explains dependency construction and substitution.
- [Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md) covers system-level boundaries.

These topics provide the design knowledge used during refactoring. They are referenced here rather than taught again.

---

## 2. Why Refactoring Is Necessary

Consider a registration endpoint that originally handled a small workflow:

```python
def register_user(data, db):
    if not data.email:
        raise ValueError("Email is required")

    if db.find_user(data.email):
        raise ValueError("Email already exists")

    password_hash = hash_password(data.password)

    user = User(
        email=data.email,
        password_hash=password_hash,
        status="pending",
    )

    db.save(user)
    send_verification_email(data.email)

    return user
```

Assume this implementation is part of an established application. Over time, registration may acquire additional requirements:

- Email normalization.
- Password policy enforcement.
- Duplicate-account handling.
- Verification workflows.
- Audit events.
- Retry handling.
- Additional persistence operations.

If every new requirement is added directly to the existing function, the function may become harder to understand and modify safely.

A developer asked to add one feature must understand a growing collection of unrelated decisions. A small change may unintentionally affect an existing behavior.

Refactoring addresses this problem by improving the structure without intentionally changing the behavior of the operation.

For example, an engineer might extract a well-defined piece of logic into a named helper, introduce an explicit result type, or separate a complex workflow into smaller units.

The correct transformation depends on the existing code and the behavior that must be preserved.

### 2.1 The Cost of Avoiding Refactoring

When structural problems accumulate, engineers may experience:

- Slower feature development.
- Repeated debugging of similar problems.
- More difficult code reviews.
- Increasing regression risk.
- Greater difficulty writing focused tests.
- More complicated onboarding.
- A growing reluctance to modify fragile code.

These costs do not mean every imperfect implementation must be refactored immediately. Refactoring itself consumes time and introduces risk.

The engineering decision is whether the expected benefit justifies the cost of the change.

---

## 3. Refactoring and Behavior Preservation

Behavior preservation is the defining constraint of refactoring.

A refactoring may change how code is organized, but it should not intentionally change the behavior that callers and users can observe.

Observable behavior can include more than a successful return value.

Depending on the system, it may include:

- Return values and output formats.
- Exceptions and error responses.
- Database writes and transaction outcomes.
- Events emitted to other components.
- Authorization decisions.
- Ordering of results.
- Resource cleanup.
- Timing constraints and performance characteristics.
- Public API compatibility.

Not every internal implementation detail must remain identical. The objective is to preserve the relevant contract of the existing system.

### 3.1 Internal Structure Versus External Behavior

Suppose a function returns the total price of an order.

Before refactoring:

```python
def calculate_total(items):
    total = 0

    for item in items:
        total += item["price"] * item["quantity"]

    return total
```

After refactoring:

```python
def calculate_total(items):
    return sum(
        item["price"] * item["quantity"]
        for item in items
    )
```

For valid inputs where the original and new implementations use the same numeric semantics, both produce the same result.

The implementation changed, but the intended observable behavior did not.

However, the transformation is not automatically safe for every possible input. If callers rely on special handling of malformed items, custom numeric types, or exceptions, those behaviors must also be considered.

The engineer must understand the contract before deciding that two implementations are equivalent.

### 3.2 Refactoring Is Not Permission to Fix Everything

Suppose an existing system has a documented bug in which an invalid input produces a particular error response.

Correcting that behavior may be desirable, but it is a behavior change rather than a pure refactoring.

Combining the bug fix and structural transformation in one large change makes verification harder because a failing test may be caused by either change.

A safer approach is to separate the work when practical:

1. Establish the current behavior.
2. Refactor while preserving that behavior.
3. Make the intended behavior change in a separate step.
4. Verify the new contract explicitly.

Sometimes the existing behavior is unsafe or legally unacceptable and cannot reasonably be preserved. In that case, treat the work as an intentional behavior change, document the exception, and validate the new behavior rather than describing the entire change as pure refactoring.

---

## 4. Refactoring Versus Other Engineering Activities

These activities often occur together, but they have different objectives.

| Activity | Primary objective | Expected behavior |
|---|---|---|
| Refactoring | Improve internal structure | Preserved |
| Feature development | Add capability | Intentionally expanded or changed |
| Bug fixing | Correct incorrect behavior | Intentionally changed for affected cases |
| Rewriting | Replace an implementation | May be preserved or changed; requires explicit verification |
| Performance optimization | Improve resource use or latency | Intended functional behavior preserved |
| Code cleanup | Broad term for improving code organization or readability | Depends on the changes included |

Performance optimization deserves particular care. An optimization may also be a refactoring if it changes only the internal implementation and preserves the relevant behavior. However, changing consistency guarantees, result ordering, precision, or caching semantics can introduce observable changes.

Similarly, a rewrite can preserve behavior, but its larger scope usually makes equivalence more difficult to establish.

The important distinction is the objective and the evidence used to verify the result.

---

## 5. Recognizing Refactoring Opportunities

Refactoring should be driven by evidence of a real maintenance problem, not by a preference for a particular coding style.

Common indicators include the following.

### 5.1 Repeated Logic

The same business calculation or decision is implemented in multiple places.

A future change may update one implementation while leaving the others inconsistent.

Before extracting shared logic, confirm that the implementations represent the same rule. Similar-looking code may encode different requirements.

### 5.2 Overly Long Functions

A function handles several distinct operations and requires the reader to track many intermediate decisions.

Length alone is not proof of a problem. A long function may still represent one coherent operation, while a short function can hide substantial complexity.

Look for unclear responsibility, excessive branching, repeated reasoning, and difficulty testing individual decisions.

### 5.3 Hidden Dependencies

A function depends on global state, environment variables, a database session, or external services without making those dependencies clear.

This can make the function difficult to reason about or execute in isolation.

The appropriate response depends on the actual boundary problem. Do not introduce extra abstractions merely because a dependency exists.

### 5.4 Duplicated Conditional Logic

Multiple code paths implement similar decisions with subtle differences.

This may lead to inconsistent behavior as requirements evolve.

Before consolidating the logic, identify which conditions and outcomes are genuinely equivalent.

### 5.5 Unclear Names and Data Flow

Names do not explain the purpose of a function or variable, or values are repeatedly transformed without clear ownership.

A focused rename or extraction may improve readability without changing the algorithm.

### 5.6 Fragile Changes

A small requirement regularly requires edits across many unrelated locations, and engineers struggle to predict the impact.

This can indicate that responsibilities or dependencies are poorly localized.

The correct response is to trace the dependency and change impact before modifying the structure.

### 5.7 Difficult Testing

Important behavior cannot be tested without starting a large application, connecting to multiple services, or preparing complicated shared state.

This may indicate that the code has responsibilities or dependencies that are too difficult to control.

Before changing the design, determine whether the difficulty comes from the code, missing test infrastructure, or a legitimate integration requirement.

---

## 6. Establishing a Safety Net

Refactoring existing code is risky because the intended behavior may not be fully documented.

A safety net provides evidence that the transformation has preserved the required behavior.

The strongest approach combines appropriate tests, static checks, careful change boundaries, and a clear understanding of the existing contract.

### 6.1 Understand the Current Behavior

Before editing the code, investigate:

- Where the component is called.
- Which inputs it receives.
- Which outputs and exceptions callers expect.
- Which external side effects it performs.
- Which invariants it must preserve.
- Whether callers depend on undocumented behavior.
- Which tests already cover the component.

Do not assume that the function signature tells the whole story.

Existing call sites, tests, API contracts, database constraints, and production behavior may reveal important requirements that are not obvious from the implementation.

### 6.2 Run the Existing Tests

Run the relevant tests before making changes.

This establishes a baseline and helps distinguish pre-existing failures from regressions introduced by the refactoring.

Record failures that are known to exist before the change. Do not silently treat a failing baseline as proof that the new implementation is incorrect—or ignore a newly introduced failure because the suite was already imperfect.

### 6.3 Add Characterization Tests When Needed

A characterization test records the behavior of an existing implementation, particularly when its behavior is poorly documented.

For example:

```python
def test_calculate_total_for_multiple_items():
    items = [
        {"price": 100, "quantity": 2},
        {"price": 50, "quantity": 3},
    ]

    assert calculate_total(items) == 350
```

This test records an expected result for a representative input.

For an established component, useful characterization tests may also cover:

- Empty collections.
- Boundary values.
- Duplicate records.
- Missing values.
- Invalid inputs.
- Exception behavior.
- Ordering requirements.
- Relevant side effects.

Do not add tests mechanically for every possible input. Select cases that describe the existing contract and the risks associated with the planned change.

A characterization test records current behavior; it does not automatically establish that the behavior is correct. If current behavior is undesirable, distinguish the compatibility requirement from the intended future contract.

### 6.4 Test Observable Outcomes

Tests should verify meaningful outcomes rather than depending unnecessarily on internal implementation details.

For example, a test should usually verify that registration creates the correct user and handles duplicate registration correctly, rather than asserting every internal helper call.

Interaction assertions are appropriate when the interaction itself is part of the contract—for example, verifying that a payment is not charged twice.

The test strategy should match the risks of the component.

### 6.5 Understand the Limits of Tests

Passing tests do not prove that behavior is identical for every possible input.

Tests provide evidence for the cases and properties they cover.

Additional confidence may come from:

- Static type checking.
- Linting and static analysis.
- Contract tests.
- Integration tests.
- Property-based tests.
- Differential testing against the previous implementation.
- Production telemetry and controlled rollout.

Use the methods appropriate to the system's risk and complexity.

---

## 7. The Refactoring Workflow

A disciplined refactoring workflow reduces the number of unknowns introduced by each change.

### Step 1: State the Objective

Describe the structural problem in concrete terms.

Weak objective:

> Clean up the registration module.

Better objective:

> Extract email normalization from the registration workflow so that its behavior can be tested independently without changing registration outcomes.

The objective should describe the problem and the intended structural improvement.

### Step 2: Define the Behavioral Contract

Identify the inputs, outputs, error cases, side effects, and compatibility requirements that must remain stable.

Write tests for important behavior that is not already covered.

### Step 3: Identify the Smallest Useful Transformation

Choose one structural improvement that can be understood and verified independently.

Examples include:

- Renaming a misleading variable.
- Extracting a calculation into a function.
- Replacing repeated equivalent logic with one shared operation.
- Moving a responsibility to the component that owns it.
- Introducing a value object where the existing design genuinely needs one.

Avoid combining several unrelated transformations simply because they affect the same file.

### Step 4: Make the Change

Apply the transformation while keeping the diff focused.

Do not mix formatting changes, unrelated cleanup, feature development, and dependency upgrades into the same refactoring change unless there is a clear reason.

### Step 5: Verify Immediately

Run the most relevant tests and checks.

If a test fails, determine whether the failure represents:

- A genuine behavior change.
- An incorrect test assumption.
- A pre-existing defect.
- An environment or test-fixture problem.
- An unintended dependency or integration change.

Do not continue stacking changes on top of an unexplained failure.

### Step 6: Inspect the Result

Read the modified code as a reviewer.

Ask:

- Is the new structure actually easier to understand?
- Did the change introduce unnecessary indirection?
- Are error paths preserved?
- Are side effects still performed at the correct point?
- Are public interfaces still compatible?
- Did the transformation make hidden assumptions explicit?

### Step 7: Commit a Coherent Change

Once the transformation is verified, commit it separately when that fits the team's workflow.

A focused commit makes review, rollback, and regression investigation easier.

### Step 8: Repeat Only When Necessary

After completing one transformation, reassess the code.

The first change may reveal another improvement opportunity, but not every opportunity needs to be addressed immediately.

Stop when the stated objective is achieved and further changes are not justified by the current scope.

---

## 8. Common Refactoring Techniques

This section introduces representative techniques. The objective is to understand when a transformation is useful and what must be verified—not to apply every technique to every codebase.

### 8.1 Rename for Clarity

Replace a misleading name with one that communicates its actual purpose.

Before:

```python
def process(data):
    return data["price"] * data["quantity"]
```

After:

```python
def calculate_line_total(item):
    return item["price"] * item["quantity"]
```

The new name communicates the function's intent.

Before applying a rename, check whether the name is used by external callers, reflection, serialization, dependency registration, or other mechanisms that make names part of a public contract.

A local variable rename usually has a different compatibility risk from renaming a public API method.

### 8.2 Extract a Function

Move a coherent calculation or operation into a separately named function.

Before:

```python
def calculate_invoice(items):
    total = 0

    for item in items:
        total += item["price"] * item["quantity"]

    tax = total * 0.18

    return total + tax
```

After:

```python
def calculate_subtotal(items):
    return sum(
        item["price"] * item["quantity"]
        for item in items
    )

def calculate_invoice(items):
    subtotal = calculate_subtotal(items)
    tax = subtotal * 0.18

    return subtotal + tax
```

The extraction gives the subtotal calculation an explicit name and allows it to be tested independently.

This example assumes the same numeric semantics and input contract. It does not address rounding policy, currency precision, or tax rules, which may be essential in a production billing system.

Extract a function when the extracted operation has a coherent purpose. Avoid creating tiny wrappers that merely add another level of indirection.

### 8.3 Inline an Unnecessary Function

Sometimes a helper adds no useful meaning or boundary and makes a simple operation harder to follow.

In that situation, inlining the implementation may improve readability.

This is the reverse of extraction. It should still preserve behavior and avoid accidentally changing evaluation order or side effects.

### 8.4 Consolidate Equivalent Logic

When several locations implement the same rule, consider consolidating the shared operation.

For example, multiple functions may normalize an email address in exactly the same way.

Before consolidation, confirm:

- The implementations have the same semantics.
- Their callers expect the same result.
- Their error behavior is compatible.
- The resulting shared function has a clear owner.

Do not consolidate code solely because the syntax looks similar. Two similar calculations may represent different business rules.

### 8.5 Introduce a Named Value

When the same expression is difficult to interpret, assign it to a meaningfully named variable.

Before:

```python
if user.age >= 18 and user.status == "active":
    allow_access()
```

After:

```python
is_eligible_adult = user.age >= 18
is_active = user.status == "active"

if is_eligible_adult and is_active:
    allow_access()
```

This can improve readability when the names communicate meaningful conditions.

However, extracting every Boolean expression into multiple variables can make simple code more verbose. Use names when they improve understanding.

### 8.6 Replace Repeated Conditionals with a Clearer Decision Structure

Repeated conditional logic may be a sign that a decision is difficult to understand or maintain.

A focused transformation might isolate a policy calculation or make the decision table explicit.

Before changing the structure, record the behavior for each relevant branch, including default cases and unexpected inputs.

This is particularly important when conditions overlap or depend on their evaluation order.

### 8.7 Separate Mechanical and Semantic Changes

A mechanical transformation, such as renaming a local variable, generally has a smaller reasoning burden than a transformation that changes how responsibilities are distributed.

Perform simple mechanical changes separately when that makes review easier.

When a change requires understanding business behavior, treat it as a semantic risk even if the code diff is small.

---

## 9. Refactoring Unfamiliar Code

Refactoring unfamiliar code is especially difficult because the engineer may not know which implementation details have become dependencies for callers.

A safe approach begins with investigation.

### 9.1 Trace the Call Path

Identify:

- The entry point.
- Direct callers.
- Indirect consumers.
- External dependencies.
- Data transformations.
- Side effects.
- Error handling.
- Relevant tests.

In a Python application, this may involve searching for function references, inspecting dependency registrations, tracing API routes, and examining background jobs.

### 9.2 Inspect the Data Flow

Determine where important values originate, how they are transformed, and which components rely on them.

For example, a profile score may be produced by a retrieval adapter, normalized by a ranking component, filtered by a business policy, and serialized by an API route.

Moving the calculation without understanding these transformations can change ranking behavior even if the code appears equivalent.

### 9.3 Record Hidden Contracts

Look for behavior that may not be documented explicitly:

- `None` versus an empty collection.
- Ordering of returned records.
- Case sensitivity.
- Timezone assumptions.
- Rounding behavior.
- Exception types.
- Transaction boundaries.
- Retry behavior.
- Whether a function mutates its input.
- Whether a function performs external side effects.

These details can become compatibility requirements once other components depend on them.

### 9.4 Make One Boundary Change at a Time

Avoid simultaneously changing function signatures, storage representations, business rules, and external integrations.

When several dimensions must change, split the work into smaller steps wherever practical and establish verification points between them.

If the code is too fragile to support safe incremental changes, the first task may be to improve the safety net rather than restructure the implementation immediately.

---

## 10. Refactoring and Testing Strategy

The required level of verification depends on the transformation's scope and risk.

| Change type | Useful verification |
|---|---|
| Local rename | Targeted tests, reference checks, static analysis |
| Function extraction | Unit tests for the extracted behavior and existing callers |
| Consolidating duplicated logic | Tests for all relevant variants and boundary cases |
| Changing module boundaries | Import checks, unit tests, integration tests |
| Changing persistence implementation | Repository integration tests, transaction checks, relevant application tests |
| Refactoring asynchronous workflows | Concurrency tests, failure-path tests, idempotency checks where applicable |
| Refactoring a public API boundary | Contract tests, compatibility checks, end-to-end tests |

These are starting points, not absolute rules. A local-looking change may have a large impact if the code participates in a critical workflow.

### 10.1 Unit Tests

Use unit tests to verify isolated calculations and behavior where external dependencies are unnecessary.

### 10.2 Integration Tests

Use integration tests when correctness depends on actual interactions between components, such as database queries, transaction behavior, serialization, or external-client adapters.

### 10.3 Regression Tests

When a previous refactoring or bug fix exposed a specific failure, preserve that case as a regression test when appropriate.

This helps prevent the same failure from returning.

### 10.4 Static Analysis

Static checks can catch certain problems before runtime, including invalid references, type inconsistencies, unused variables, and some unsafe transformations.

They complement behavioral tests rather than replacing them.

### 10.5 Differential Testing

For high-risk transformations, execute the old and new implementations against the same representative inputs and compare their outputs.

Differential testing is useful when:

- Replacing a complex calculation.
- Optimizing ranking logic.
- Changing serialization.
- Replacing an implementation with a new algorithm.

Comparison must account for legitimate nondeterminism, timing-dependent behavior, and explicitly permitted differences.

For stateful operations, comparing return values alone may be insufficient. Side effects and resulting state may also need comparison.

---

## 11. Refactoring in Production Systems

Production refactoring introduces risks that may not appear in isolated unit tests.

### 11.1 Database Changes

Moving code around should not accidentally alter:

- Transaction ownership.
- Commit and rollback behavior.
- Lock acquisition.
- Query ordering assumptions.
- Uniqueness checks.
- Resource cleanup.

If the refactoring also changes the schema or stored representation, it is no longer merely an internal code transformation. It requires a migration and compatibility strategy.

Database migrations should be planned explicitly, including how old and new application versions interact during deployment when zero-downtime changes are required.

### 11.2 API Compatibility

Renaming an internal function may be safe, while renaming a public endpoint or changing a response field may break clients.

Identify the compatibility boundary before making the change.

For public interfaces, consider versioning, deprecation, compatibility tests, and staged rollout.

### 11.3 Asynchronous Workflows

In asynchronous systems, refactoring can change when tasks are scheduled, when resources are released, and how failures propagate.

Preserve relevant behavior involving:

- Cancellation.
- Timeouts.
- Retries.
- Ordering.
- Task completion.
- Resource cleanup.
- Duplicate event handling.

Do not assume that two implementations are equivalent merely because they eventually return the same value. The timing and ordering of side effects may be part of the system's contract.

### 11.4 Caching

Changing where values are calculated or stored can affect cache keys, invalidation, consistency, and expiration.

If caching behavior is part of the existing operational contract, include it in the refactoring analysis.

### 11.5 Observability

Preserve meaningful logs, metrics, traces, and audit events.

A refactoring that improves code readability but removes the information needed to diagnose production failures may be a net loss.

At the same time, avoid adding sensitive information to logs simply to make debugging easier.

---

## 12. Refactoring AI and GenAI Applications

AI applications introduce additional compatibility concerns because outputs may be probabilistic, provider-dependent, or sensitive to small changes in configuration.

Consider a retrieval pipeline:

```text
User Query
    |
    v
Query Processing
    |
    v
Embedding Generation
    |
    v
Vector Retrieval
    |
    v
Filtering and Ranking
    |
    v
Context Construction
    |
    v
LLM Generation
    |
    v
Response Processing
```

A refactoring may extract a scoring function, separate provider-specific code, or simplify how results are transformed between stages.

The engineer must identify which behaviors are expected to remain stable.

### 12.1 Embedding and Retrieval Changes

Replacing an embedding provider or changing vector dimensions is not automatically a behavior-preserving refactoring.

It may require re-embedding stored documents or profiles, rebuilding indexes, and re-evaluating retrieval quality.

Even when the application interface remains unchanged, retrieval results can differ.

A safer approach is to isolate code-structure improvements from model and retrieval changes whenever practical.

### 12.2 Ranking Logic

Suppose a matching system combines profession, education, location, and age scores.

Refactoring the calculation into smaller functions can improve readability, but the transformation must preserve:

- Score weights.
- Normalization.
- Eligibility filters.
- Boundary behavior.
- Tie-breaking.
- Missing-value handling.
- Ranking order.

Tests should include representative and boundary cases. For high-impact ranking changes, compare old and new outputs over a representative dataset and investigate differences.

### 12.3 LLM Prompt Construction

Extracting prompt construction into a dedicated component may improve testability and organization.

However, seemingly minor changes to prompt text, whitespace, ordering, or message roles may affect model output.

If exact prompt compatibility matters, test the generated prompt representation. If semantic behavior matters, use an appropriate evaluation dataset rather than assuming that unchanged function signatures guarantee equivalent output.

### 12.4 Tool-Calling and Agent Workflows

Refactoring an agent workflow can alter:

- Tool-selection decisions.
- Tool-call order.
- State transitions.
- Retry behavior.
- Termination conditions.
- Error recovery.

Use deterministic tests for orchestration rules where possible, and separate those tests from probabilistic model evaluations.

Architecture and code-level tests can verify workflow mechanics, but they cannot alone establish that an LLM continues to produce equally useful answers.

---

## 13. Common Refactoring Mistakes

### 13.1 Changing Too Much at Once

A large transformation makes it difficult to identify the source of a regression.

**Better approach:** Split the work into small, coherent changes with clear verification points.

### 13.2 Refactoring Without Understanding Behavior

The engineer changes code based on what it appears to do rather than what callers actually depend on.

**Better approach:** Trace call paths, inspect tests, and document important observable behavior first.

### 13.3 Treating Passing Tests as Complete Proof

Tests pass, so the engineer assumes every behavior is preserved.

**Better approach:** Assess test coverage and risk. Use integration, contract, property-based, or differential testing where appropriate.

### 13.4 Mixing Refactoring with Feature Work

A change simultaneously reorganizes the code and changes the business requirements.

**Better approach:** Separate structural and behavioral changes when practical. When separation is impossible, document the intended behavior change explicitly.

### 13.5 Refactoring for Personal Preference

The engineer changes code because another style looks more elegant, even though the existing implementation is clear and stable.

**Better approach:** Identify a concrete benefit such as improved testability, reduced change risk, clearer behavior, or easier maintenance.

### 13.6 Creating Unnecessary Abstractions

The refactoring adds interfaces, wrappers, classes, and layers without reducing meaningful complexity.

**Better approach:** Evaluate the resulting design, not the number of abstractions introduced.

### 13.7 Ignoring Public Contracts

An internal-looking rename or transformation changes an API, serialized field, or externally consumed event.

**Better approach:** Identify public and operational boundaries before editing.

### 13.8 Ignoring Non-Functional Behavior

The new code returns the same result but performs significantly more queries, holds resources longer, or increases latency.

**Better approach:** Include relevant performance, resource, and reliability constraints in the verification plan.

### 13.9 Continuing After the Objective Is Achieved

The engineer keeps modifying adjacent code because the initial refactoring revealed additional imperfections.

**Better approach:** Complete the agreed objective, review the result, and create separate work for unrelated improvements.

---

## 14. Deciding Whether to Refactor Now

Not every structural problem should be fixed immediately.

Evaluate the decision using four factors.

### 14.1 Expected Benefit

Will the refactoring make an anticipated change easier, reduce repeated defects, improve testability, or remove a known source of maintenance cost?

### 14.2 Change Risk

How much of the system could be affected? Are there public contracts, external side effects, or poorly understood dependencies?

### 14.3 Verification Confidence

Are there adequate tests and tools to establish that the relevant behavior is preserved?

If confidence is low, improve the safety net before making a broad transformation.

### 14.4 Timing and Scope

Is the code being modified already? Is a related feature making the structural problem immediately relevant? Can the work be completed in a focused change?

A useful decision model is:

| Situation | Reasonable response |
|---|---|
| Small, well-understood change with good tests | Refactor incrementally |
| Repeated defects caused by unclear structure | Prioritize focused refactoring |
| High-risk code with weak tests | Establish a safety net first |
| Low-impact code unlikely to change | Defer unnecessary cleanup |
| Structural change mixed with major behavior changes | Separate the work where practical |
| Existing design is simple and stable | Leave it alone unless a concrete need emerges |

This is a decision aid, not a mathematical scoring formula.

The purpose is to make the trade-off explicit rather than treating refactoring as either universally necessary or universally avoidable.

---

## 15. Code Review Checklist

Use this checklist when reviewing a refactoring pull request.

### Objective and Scope

- [ ] Is the structural problem clearly described?
- [ ] Does the change address that problem?
- [ ] Are unrelated modifications excluded?
- [ ] Are intentional behavior changes identified separately?

### Behavior Preservation

- [ ] Are existing public contracts preserved?
- [ ] Are relevant error cases and side effects covered?
- [ ] Are ordering, mutation, and boundary conditions understood?
- [ ] Have compatibility-sensitive consumers been considered?

### Verification

- [ ] Were relevant tests run before and after the change?
- [ ] Are tests focused on meaningful behavior?
- [ ] Are integration tests included where infrastructure behavior matters?
- [ ] Are new failures explained rather than ignored?
- [ ] Is the verification proportionate to the risk?

### Resulting Design

- [ ] Is the code easier to understand or modify?
- [ ] Are new abstractions justified?
- [ ] Are dependencies and responsibilities clearer?
- [ ] Has unnecessary indirection been avoided?
- [ ] Are performance and resource implications acceptable?

### Production Safety

- [ ] Are database and transaction semantics preserved?
- [ ] Are retries, timeouts, and asynchronous behavior preserved where relevant?
- [ ] Are logs, metrics, and audit behavior still appropriate?
- [ ] Is rollback or recovery practical if the change causes a regression?

---

## 16. Practical Exercise

### Scenario

You are maintaining an existing FastAPI application that generates profile recommendations.

The recommendation function currently:

1. Loads the user's preferences.
2. Queries a vector database.
3. Filters ineligible profiles.
4. Calculates a weighted score.
5. Sorts candidates.
6. Loads additional profile details.
7. Constructs the API response.

The function has grown significantly. Existing tests cover only the happy path, and the application is already used by real customers.

Your task is to plan a safe refactoring.

### Assignment

Write a short engineering proposal that answers the following.

1. Which existing behavior must be preserved?
2. What would you inspect before modifying the function?
3. Which tests would you add before refactoring?
4. What would be your first small structural change, and why?
5. How would you verify that candidate ordering remains unchanged?
6. Which database, vector-search, and API boundaries could be affected?
7. Which changes would you explicitly defer rather than include in the same pull request?
8. What evidence would convince you that the refactoring improved maintainability?

Do not begin by splitting the function into an arbitrary number of smaller functions. First identify the behavior, responsibilities, dependencies, and risks.

### Expected Engineering Reasoning

A strong proposal should distinguish between structural improvements and changes to recommendation behavior. It should identify the current ranking contract, add representative tests, isolate transformations that can be verified independently, and define how integration behavior will be checked.

There is no single universally correct decomposition. The quality of the proposal depends on whether the selected changes solve a real problem while controlling regression risk.

---

## 17. Key Takeaways

- Refactoring improves internal structure while preserving externally observable behavior.
- A refactoring should have a specific objective and a verification strategy.
- Understanding existing behavior is a prerequisite for safely changing unfamiliar code.
- Tests, static analysis, integration checks, and differential testing provide different forms of evidence.
- Small, focused transformations make regressions easier to identify and changes easier to review.
- Feature development and bug fixing should be distinguished from pure refactoring.
- Public contracts, side effects, transactions, asynchronous workflows, and performance can all be part of the behavior that must be preserved.
- AI applications require special care when changing prompts, embedding models, retrieval logic, ranking calculations, or agent workflows.
- Refactoring should be justified by a concrete engineering benefit rather than personal style preferences.
- Good refactoring reduces future change cost without introducing more complexity than it removes.

---

## 18. Knowledge Connections

### Prerequisites

- [01 — Software Quality Attributes](01-Software-Quality-Attributes.md)
- [02 — Software Design Principles](02-Software-Design-Principles.md)
- [03 — Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md)
- [04 — Coupling and Cohesion](04-Coupling-and-Cohesion.md)
- [05 — SOLID Principles](05-SOLID-Principles.md)
- [06 — Dependency Injection](06-Dependency-Injection.md)
- [07 — Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md)
- [08 — Design Patterns](./08-Design-Patterns.md)

### Connection to the Next Chapter

Refactoring is often used to reduce the cost of existing design problems, but structural problems can remain unresolved for long periods.

When those problems accumulate and make future work more expensive, they may contribute to technical debt.

The next chapter, [10 — Technical Debt](10-Technical-Debt.md), examines that accumulated cost, how to evaluate it, and how to make deliberate engineering decisions about addressing it.

---

## 19. Revision Questions

Answer these in your own words.

1. What makes a code transformation a refactoring rather than a feature change?
2. Why can preserving return values alone be insufficient to establish behavior preservation?
3. How would you refactor a function when its behavior is poorly documented?
4. Why should structural changes and business behavior changes be separated when practical?
5. What is the difference between a characterization test and a test that validates intended behavior?
6. How would you decide whether a refactoring is worth doing now?
7. How would you refactor ranking code while preserving the ordering of results?
8. Why can a small code diff still create a large production risk?
9. Which additional verification methods would you consider for a high-risk refactoring?
10. When is leaving imperfect code unchanged the better engineering decision?

---

## Chapter Completion Criteria

This chapter is complete when you can:

- Define the behavioral contract of an existing component.
- Identify a concrete structural problem worth solving.
- Establish a proportionate safety net before changing the implementation.
- Plan and execute small, independently verifiable transformations.
- Distinguish structural changes from intentional behavior changes.
- Review a refactoring for regression risk, maintainability, and unnecessary complexity.
- Explain when to refactor, when to defer, and when to leave the code unchanged.

**Next chapter:** [10 — Technical Debt](10-Technical-Debt.md).

---

*Document status: Generated content for review. The supplied GitHub URL could not be inspected in this session, and this response does not directly modify the repository file.*
