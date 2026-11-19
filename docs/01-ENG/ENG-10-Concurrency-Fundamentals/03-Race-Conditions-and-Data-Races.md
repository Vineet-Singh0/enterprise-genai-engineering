
# Race Conditions and Data Races

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what a race condition is and why it can occur in concurrent systems.
- Distinguish a race condition from a data race.
- Analyze how operation interleaving can produce incorrect results.
- Explain read-modify-write operations and lost updates.
- Identify timing-dependent behavior and inconsistent shared state.
- Recognize when correctness depends on an execution order that is not guaranteed.
- Select appropriate high-level strategies for preventing concurrency-related correctness failures.

## Prerequisites

- **ENG-01 — Computer Science Fundamentals:** Processes, threads, memory, and program execution.
- **ENG-02 — Programming Foundations:** Variables, functions, and basic operations.
- **ENG-10.01 — Concurrency Fundamentals:** Concurrency versus parallelism.
- **ENG-10.02 — Execution Models and Shared State:** Execution units, shared mutable state, scheduling, and interleaving.

**Estimated reading time:** 25–30 minutes.

---

## 1. Before We Start

Imagine a backend service that maintains a counter for the number of completed requests.

```python
request_count = 0
```

Two threads receive separate requests and increment the counter.

The intended behavior is straightforward:

```text
Initial count: 0
Request A completes: 1
Request B completes: 2
```

But suppose both threads read the counter before either writes its update.

```text
Thread A reads 0
Thread B reads 0
Thread A writes 1
Thread B writes 1
```

The final value is `1`, even though two increments occurred.

This is a concurrency correctness failure. The program's result depends on how operations overlap and are ordered.

The underlying problem is not that arithmetic addition is incorrect. The problem is that the complete increment operation was not guaranteed to behave as one indivisible update.

This chapter develops the mental models needed to recognize such failures before they appear in production.

---

## 2. What Is a Race Condition?

A **race condition** occurs when a program's correctness depends on the timing or ordering of operations that can occur in different ways.

In a concurrent program, multiple execution units may make progress in overlapping periods. If their interactions are not designed correctly, different permitted execution orders can produce different outcomes.

Consider two operations:

```text
Operation A: Read current inventory
Operation B: Update current inventory
```

If Operation A assumes the inventory remains unchanged while it processes the value, the result may become incorrect when Operation B changes that inventory at an unexpected point.

The defining issue is the dependency on timing or ordering.

### 2.1 A race condition is about correctness

A race condition does not necessarily mean that two instructions execute at exactly the same instant.

It can arise when operations happen sequentially but are interleaved differently.

For example:

```text
Task A: Read balance
Task A: Calculate withdrawal

Task B: Read balance
Task B: Calculate deposit

Task A: Write updated balance
Task B: Write updated balance
```

Each individual step may execute without overlapping another instruction. Yet the overall result can be wrong because the operations interleave in an unsafe order.

**Key principle:** Concurrency bugs are often caused by the relationship between operations, not by any one operation in isolation.

### 2.2 Race conditions are not limited to variables

Race conditions can involve:

- Shared in-memory objects.
- Database records.
- Files.
- Cache entries.
- Resource allocation.
- Task state transitions.
- External service operations.

For example, two workers may both check whether a job is pending and then both start processing it. Even if each worker uses its own memory, the shared job state can lead to duplicate work.

The correct analysis must include the full system boundary where the competing operations interact.

---

## 3. What Is a Data Race?

A **data race** is a more specific kind of concurrency problem involving conflicting accesses to the same memory location, at least one of which is a write, without the required synchronization or ordering guarantees.

The precise formal definition varies by programming language and memory model, so language-specific guarantees must be checked rather than assumed.

At a conceptual level, consider:

```python
shared_value = 10
```

Two threads access `shared_value`:

```text
Thread A: Reads shared_value
Thread B: Writes shared_value
```

If the language's concurrency rules do not establish the required ordering or synchronization, this may constitute a data race.

A data race is about conflicting memory accesses and the rules governing them. A race condition is the broader concept of correctness depending on timing or ordering.

### 3.1 Why the distinction matters

The terms are related but should not be treated as synonyms.

| Aspect | Race condition | Data race |
|---|---|---|
| Main concern | Correctness depends on timing or ordering | Conflicting memory accesses lack required synchronization or ordering |
| Scope | Broad | More specific |
| Must involve shared memory? | Not necessarily; shared external resources can be involved | Yes, by definition |
| Can involve a database? | Yes | Not usually described as a data race in the programming-language memory-model sense |
| Main question | Can different operation orders violate correctness? | Are conflicting memory accesses properly synchronized? |

A race condition can exist even when every individual memory access is protected.

For example, consider an operation that checks a database record and then inserts a new one. If two workers perform the check and insert as separate steps, both may observe that the record does not exist. Both can then attempt insertion.

Each individual database operation may be safe, but the overall check-then-act sequence can still violate the business rule.

Conversely, a data race is a specific issue involving memory accesses that do not have the required synchronization. Its consequences depend on the language and runtime guarantees.

**Engineering takeaway:** Preventing data races is important, but it does not automatically make the complete application workflow correct.

---

## 4. Read-Modify-Write Operations

Many concurrency bugs originate in operations that appear to be a single statement but conceptually involve several steps.

A **read-modify-write operation**:

1. Reads an existing value.
2. Computes a new value.
3. Writes the new value back.

For example:

```python
counter = counter + 1
```

Conceptually:

```text
Read counter
    ↓
Add one
    ↓
Write result
```

Unless the language and execution mechanism guarantee the required atomic behavior, the entire sequence must not be assumed to be indivisible.

### 4.1 Lost update

Suppose the counter starts at `5`.

Two threads increment it.

<text id="unused" />

```text
Thread A                    Thread B
--------                    --------
Read counter = 5
                            Read counter = 5
Calculate 6
                            Calculate 6
Write counter = 6
                            Write counter = 6
```

Expected result:

```text
5 + 1 + 1 = 7
```

Actual result:

```text
6
```

One increment is lost.

This is called a **lost update**.

### 4.2 Why ordinary testing may miss it

If Thread A completes its update before Thread B reads the counter, the result is correct:

```text
Thread A reads 5
Thread A writes 6
Thread B reads 6
Thread B writes 7
```

The program may therefore appear correct during many test runs.

The defect remains because correctness depends on the operation order.

A test that passes under one schedule does not prove that every permitted schedule is safe.

### 4.3 A database example

Suppose two purchase requests try to reserve the final unit of a product.

Initial state:

```text
available_stock = 1
```

Each request follows this logic:

```text
1. Read available stock
2. If stock > 0, accept the order
3. Decrease stock
```

A possible interleaving is:

```text
Request A reads stock = 1
Request B reads stock = 1

Request A accepts the order
Request B accepts the order

Request A decreases stock
Request B decreases stock
```

Both orders may be accepted even though only one unit was available.

The business invariant is:

```text
Accepted reservations must not exceed available inventory.
```

Protecting an individual read or write is not enough if the business decision requires a consistent check-and-update operation.

The solution must make the relevant operation atomic at the appropriate resource boundary, for example through a conditional database update or a transaction with suitable guarantees.

---

## 5. Check-Then-Act Race Conditions

A common race condition occurs when a program checks a condition and then acts based on that result, but the state can change between the two steps.

Consider:

```python
if account.balance >= amount:
    account.balance -= amount
```

This code expresses the intended business rule: do not withdraw more than the available balance.

However, if multiple tasks can execute this logic against shared mutable state without suitable coordination, they may both pass the check before either withdrawal is applied.

The issue is the gap between checking and acting.

### 5.1 Other examples

**Creating a resource**

```text
Check whether username exists
If it does not exist, create the account
```

Two requests may both observe that the username is available.

**Processing a job**

```text
Check whether job is pending
If pending, start processing
```

Two workers may both start the same job.

**Refreshing a cache**

```text
Check whether cache entry is missing
If missing, fetch and store it
```

Multiple tasks may perform the same expensive operation concurrently.

The cache example may primarily create redundant work rather than incorrect business state. Whether it is a correctness defect depends on the requirements and side effects of the computation.

### 5.2 How to reason about check-then-act logic

Ask:

1. Can another execution unit change the relevant state after the check?
2. Is the checked state still guaranteed to be valid when the action occurs?
3. Must the check and action behave as one indivisible operation?
4. At what boundary must that guarantee be enforced?

Possible solutions include atomic operations, synchronization, conditional updates, transactions, unique constraints, or a redesign that avoids shared mutation.

The correct choice depends on where the state lives and which invariant must be preserved.

---

## 6. Inconsistent Shared State

A race condition can also occur when an execution unit observes a combination of values that does not represent a valid logical state.

Suppose a recommendation service stores these fields:

```text
minimum_age = 25
maximum_age = 35
```

A configuration update changes the permitted range to:

```text
minimum_age = 30
maximum_age = 40
```

If the two fields are updated separately, another task might read:

```text
minimum_age = 30
maximum_age = 35
```

This intermediate combination may be valid in this example, but in other systems an intermediate state can violate an invariant or combine values from different logical versions.

For instance, a transfer system might track a source balance and destination balance. If a reader observes one balance after an update but the other before the corresponding update, it may see a state that does not represent a completed transfer.

The important concept is **consistency of a logical state**, not merely the safety of each field access.

### 6.1 Multi-step invariants

Suppose an application requires:

```text
minimum_age <= maximum_age
```

The program must preserve this invariant throughout the operations where other execution units are allowed to observe the state.

Possible design approaches include:

- Updating a complete immutable configuration snapshot and publishing it as one logical change.
- Protecting related updates and reads with an appropriate synchronization mechanism.
- Using a transaction where the state is stored in a transactional database.
- Representing the state so that invalid combinations cannot be constructed easily.

The choice depends on the storage and execution model.

**Engineering principle:** Synchronize around the invariant that must be preserved, not merely around individual variables.

---

## 7. Nondeterministic Behavior

A concurrency bug may appear nondeterministic because its outcome depends on timing, scheduling, or external events.

The same code and input can produce different results across runs.

For example:

```text
Run 1: Task A completes before Task B reads state
Result: Correct

Run 2: Task A and Task B read state before either update
Result: Lost update
```

The program has not necessarily become random. Rather, the execution order is not fully controlled, and different permitted schedules can produce different outcomes.

### 7.1 Common symptoms

Possible symptoms include:

- Incorrect counters or totals.
- Duplicate processing.
- Missing updates.
- Invalid state transitions.
- Intermittent failures under load.
- Behavior that disappears when debugging slows the program down.
- Failures that occur only when several requests overlap.

These symptoms do not prove a race condition. Similar behavior can result from network failures, timeouts, retries, stale caches, or other distributed-system problems.

Treat the symptom as evidence for investigation, not as a definitive diagnosis.

### 7.2 Why load can expose a race

Higher concurrency can increase the number of overlapping operations and create execution schedules that were uncommon during development.

This does not mean every race condition requires high load. A race can occur with only two tasks.

Load often makes the defect easier to trigger by increasing the number of opportunities for problematic interleavings.

---

## 8. Race Conditions Across System Boundaries

Race conditions are not confined to threads and local memory.

A production application may have several API instances, background workers, and database connections operating simultaneously.

Consider a job queue with a job in the `pending` state.

```text
Worker A                    Worker B
--------                    --------
Read state: pending
                            Read state: pending
Start processing
                            Start processing
```

Both workers may process the same job if claiming the job is not coordinated correctly.

A process-local lock does not solve this if Worker A and Worker B run in separate processes and do not share the same lock instance.

The coordination must happen at a boundary visible to both workers, such as through a database operation or queue mechanism that supports appropriate claiming semantics.

### 8.1 Local memory versus external state

| Shared resource | Example risk | Possible direction |
|---|---|---|
| In-memory variable | Lost counter update | Atomic operation or synchronization |
| Shared object | Invalid multi-field state | Protect the invariant or use immutable snapshots |
| Database record | Lost update or duplicate reservation | Conditional update, transaction, or database constraint |
| Job queue | Duplicate processing | Atomic claiming or suitable queue semantics |
| Cache | Duplicate computation or stale state | Defined update policy and coordination where necessary |
| File | Conflicting writes | File coordination or an appropriate storage design |

These are design directions, not universal prescriptions. A correct solution depends on the resource's guarantees, the number of participating workers, and the business invariant.

### 8.2 Retries can complicate correctness

Suppose a worker performs an operation but fails before reporting success. A retry may execute the operation again.

This can create duplicate effects even if there is no low-level data race.

For example, two workers might both issue a payment request because the system cannot determine whether the first attempt succeeded.

This is an important boundary distinction: concurrency correctness and distributed operation reliability overlap, but they are not identical topics. Retries, idempotency, and distributed-system guarantees require additional reasoning beyond in-memory data races.

---

## 9. Preventing Race Conditions

There is no single mechanism that solves every race condition. First identify the shared resource, the invariant, and the permitted execution paths.

### 9.1 Minimize shared mutable state

The simplest shared-state problem is often the one a design avoids entirely.

Instead of allowing several tasks to modify one object, consider whether each task can work with its own data and return a result.

```text
Task A → Local input → Result A
Task B → Local input → Result B
```

Results can then be combined at a controlled point.

This approach can reduce coordination, although it may introduce copying costs or require an explicit aggregation stage.

### 9.2 Use immutability where appropriate

Immutable data reduces the risk that another task changes an object while it is being read.

It is particularly useful for configuration snapshots, request inputs, and values that should remain stable throughout a computation.

Immutability does not eliminate races involving external side effects or other mutable objects.

### 9.3 Protect the complete invariant

If a group of operations must behave as one logical unit, protecting only one statement may be insufficient.

For example, a balance check and deduction must be coordinated as one business operation if the application must prevent overdrafts.

A synchronization mechanism or transactional storage operation should cover the relevant check and update.

### 9.4 Use atomic operations when they match the requirement

An atomic operation provides an indivisible update according to its specified guarantees.

An atomic increment can solve a lost-update problem for a counter. It does not automatically make a larger workflow atomic.

For example, atomically incrementing a reservation counter does not, by itself, guarantee that the inventory reservation and order creation are consistent with each other.

Use atomic operations for the exact state transition they are designed to protect.

### 9.5 Coordinate at the correct resource boundary

If several threads in one process share an object, an appropriate in-process synchronization mechanism may be sufficient.

If several application instances update the same database record, the guarantee must cover those instances too. A local lock is not enough.

Use the guarantees provided by the system that owns the shared resource, or introduce a coordination mechanism whose scope covers all participants.

### 9.6 Avoid assuming that a data structure solves the whole workflow

A thread-safe map, queue, or counter may protect its own internal operations.

But application-level sequences such as "check, calculate, then update" may still need a stronger guarantee.

Always analyze the complete operation and the invariant it must preserve.

---

## 10. A Practical Race-Condition Analysis

When investigating a suspected race condition, use the following sequence.

### Step 1: State the expected behavior

Write down the business rule in concrete terms.

Example:

```text
Every accepted reservation must correspond to an available unit.
```

Avoid starting with a vague statement such as "the counter seems wrong."

### Step 2: Identify the shared state

Determine which variables, objects, records, files, or external resources are involved.

### Step 3: Identify the competing operations

List the steps performed by each execution unit.

For a reservation:

```text
A. Read available stock
B. Check whether stock is positive
C. Accept reservation
D. Decrease stock
```

### Step 4: Construct a possible interleaving

Ask whether another execution unit can run between these steps.

```text
Worker A reads stock
Worker B reads stock
Worker A accepts reservation
Worker B accepts reservation
```

If this schedule violates the business rule and the system permits it, the design has a correctness problem.

### Step 5: Determine the type of race

Ask whether the issue involves:

- Conflicting memory accesses without required synchronization.
- A broader timing-dependent workflow.
- A check-then-act sequence.
- An inconsistent multi-field state.
- A shared external resource.

A single problem can involve more than one of these categories.

### Step 6: Choose the smallest correct solution

Prefer the mechanism that directly protects the required invariant without unnecessary complexity.

Possible approaches include:

- Removing shared mutable state.
- Using immutable snapshots.
- Atomic operations.
- Appropriate locks or synchronization.
- Conditional database updates.
- Transactions or constraints.
- Explicit ownership or controlled message passing.

### Step 7: Consider the system boundary

Confirm that every relevant execution unit is covered by the solution.

A lock that protects one process cannot coordinate unrelated processes unless they use a shared coordination mechanism.

### Step 8: Validate the behavior

Test the invariant under concurrent operations and relevant failure conditions.

A successful test run is evidence, not proof that every possible interleaving has been covered. General debugging and testing techniques belong to ENG-08; the detailed concurrency failure analysis chapter, ENG-10.09, will build on this reasoning.

---

## 11. Common Mistakes

### Mistake 1: Treating race conditions and data races as identical

A data race is a specific form of unsynchronized conflicting memory access. A race condition is a broader correctness problem involving timing or ordering.

**Correction:** Describe the actual failure and identify the resource involved.

### Mistake 2: Assuming one statement is one atomic operation

A statement such as `counter += 1` may involve several conceptual steps. Its guarantees depend on the language and runtime.

**Correction:** Verify the documented guarantees rather than inferring atomicity from syntax.

### Mistake 3: Protecting individual variables but not business invariants

Each field may be accessed safely while the overall operation remains incorrect.

**Correction:** Define the invariant first and ensure the complete state transition preserves it.

### Mistake 4: Assuming a race must reproduce every time

Many races depend on timing and may be rare during testing.

**Correction:** Construct possible interleavings and reason about correctness independently of whether a test reliably triggers the failure.

### Mistake 5: Assuming a local lock solves cross-process races

A process-local lock does not automatically coordinate independent application instances.

**Correction:** Choose a mechanism that covers every participant accessing the shared resource.

### Mistake 6: Assuming all nondeterministic bugs are race conditions

Network behavior, retries, caching, timeouts, and distributed failures can produce intermittent symptoms too.

**Correction:** Use evidence to identify the actual failure mechanism.

### Mistake 7: Using synchronization without understanding the protected operation

Adding a lock around one statement may not protect the state transition that matters. Excessive locking can also reduce concurrency.

**Correction:** Identify the invariant and protect the smallest complete operation that preserves it.

### Mistake 8: Believing that removing data races guarantees correctness

A program can use synchronized memory accesses and still implement an incorrect check-then-act workflow or violate a business rule.

**Correction:** Verify both memory-access safety and application-level correctness.

---

## 12. Interview Questions

### Q1. What is a race condition?

**Expected answer:**

A race condition is a correctness problem in which the outcome depends on the timing or ordering of operations. Different permitted execution orders can produce different results, and some may violate the program's requirements.

### Q2. What is a data race, and how does it differ from a race condition?

**Expected answer:**

A data race involves conflicting accesses to the same memory location, at least one being a write, without the synchronization or ordering guarantees required by the relevant memory model. A race condition is broader and can involve memory, databases, or other shared resources.

### Q3. Why can incrementing a shared counter lose updates?

**Expected answer:**

The increment may consist of a read, calculation, and write. Two execution units can read the same initial value and then overwrite each other's results, causing one update to be lost.

### Q4. Explain the check-then-act problem.

**Expected answer:**

A program checks a condition and later acts on the result. If another execution unit changes the relevant state between those steps, the action may be based on a stale assumption. The check and action may need to be coordinated as one logical operation.

### Q5. Why can a race condition exist even if individual operations are thread-safe?

**Expected answer:**

Thread safety of individual operations does not guarantee that a sequence of operations is atomic or that a business invariant is preserved. A check followed by an update may still be vulnerable.

### Q6. How can a race condition occur in a database application without a shared-memory data race?

**Expected answer:**

Two workers can independently read and update the same database record in conflicting orders. Their local memory may be separate, but they still compete over shared external state.

### Q7. When is an atomic operation sufficient?

**Expected answer:**

It is sufficient when the required invariant is fully protected by that atomic operation and its documented guarantees. If correctness requires several related updates to succeed together, a larger coordination mechanism may be necessary.

### Q8. Why can race conditions be difficult to reproduce?

**Expected answer:**

They depend on operation timing and interleaving. Small changes in workload, scheduling, network latency, or execution duration can change whether the problematic order occurs.

### Q9. Can a data race exist without an obvious incorrect result?

**Expected answer:**

Yes. A defect may not visibly affect a particular run. The relevant question is whether conflicting accesses satisfy the language's synchronization and memory-model requirements, not merely whether the output happened to look correct.

### Q10. How would you investigate duplicate job processing?

**Expected answer:**

Define the job-state invariant, inspect how workers claim jobs, identify whether the claim is an atomic or coordinated operation, and construct an interleaving where multiple workers observe the job as pending. Then choose a claim mechanism whose guarantees cover all workers and validate it under concurrent execution.

### Q11. How would you prevent two purchases from reserving the same final item?

**Expected answer:**

The inventory check and reservation must be coordinated at the resource boundary. Depending on the system, a conditional database update, transaction, constraint, or another atomic reservation mechanism may enforce the invariant. An ordinary process-local lock is insufficient if multiple independent processes can reserve inventory.

### Q12. Does eliminating shared mutable state eliminate every race condition?

**Expected answer:**

No. It reduces a major source of concurrency risk, but races can still occur over external resources, job claims, files, database records, and other side effects.

---

## 13. Quick Revision

- A race condition is a correctness problem dependent on timing or operation ordering.
- A data race is a specific problem involving conflicting memory accesses without required synchronization or ordering.
- A lost update occurs when one operation overwrites another operation's change.
- Read-modify-write operations can be vulnerable when the complete transition is not atomic.
- Check-then-act logic is risky when the checked state can change before the action.
- Multi-field state can become inconsistent if related updates and reads are not coordinated.
- Race conditions may appear intermittent because execution order varies.
- Shared external resources can have race conditions even when application processes use separate memory.
- Atomic operations, synchronization, transactions, constraints, immutability, and ownership can help, depending on the problem.
- Preventing data races does not automatically guarantee application-level correctness.
- A correct solution must protect the actual invariant at the appropriate resource boundary.

---

## 14. Key Takeaways

Race conditions occur when a system's correctness depends on how operations overlap or are ordered. Data races are a narrower category concerning conflicting memory accesses without the required synchronization guarantees.

The most important engineering habit is to stop reasoning only about individual statements and instead reason about complete state transitions.

When analyzing a concurrent operation:

1. Define the required invariant.
2. Identify shared state and competing operations.
3. Break multi-step operations into their conceptual steps.
4. Construct a possible unsafe interleaving.
5. Determine whether the problem is a data race, a broader race condition, or both.
6. Protect the complete invariant using a mechanism appropriate to the resource boundary.
7. Validate the design under concurrent execution.

This foundation leads to the next chapter: **Synchronization Fundamentals**, where we examine how to coordinate access to shared state and protect critical sections.

---

## 15. Further Reading

- [Python threading documentation](https://docs.python.org/3/library/threading.html) — Thread synchronization primitives and related facilities.
- [Python multiprocessing documentation](https://docs.python.org/3/library/multiprocessing.html) — Coordination between processes.
- [Python asyncio documentation](https://docs.python.org/3/library/asyncio.html) — Task scheduling and asynchronous coordination.

Consult the documentation for the language and runtime actually used by your application. Exact data-race definitions and memory-access guarantees differ across programming environments.

---

## End of Document

This completes the Markdown file: `03-Race-Conditions-and-Data-Races.md`.
