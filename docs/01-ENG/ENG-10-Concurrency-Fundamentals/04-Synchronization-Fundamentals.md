
# Synchronization Fundamentals

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why concurrent execution sometimes requires synchronization.
- Identify a critical section and the shared state it protects.
- Explain mutual exclusion, locks, mutexes, and atomic operations at a conceptual level.
- Distinguish atomicity from mutual exclusion.
- Understand how synchronization helps preserve application invariants.
- Recognize the costs and limitations of excessive synchronization.
- Select a suitable synchronization strategy based on the scope of shared state and the required correctness guarantees.

## Prerequisites

- **ENG-01 — Computer Science Fundamentals:** Processes, threads, memory, and program execution.
- **ENG-03 — Software Engineering Principles:** Modularity, abstraction, and separation of concerns.
- **ENG-10.02 — Execution Models and Shared State:** Shared memory, execution units, and scheduling.
- **ENG-10.03 — Race Conditions and Data Races:** Lost updates, check-then-act problems, and inconsistent shared state.

**Estimated reading time:** 25–30 minutes.

---

## 1. Before We Start

Consider an API service that maintains a shared counter:

```python
request_count = 0
```

Two threads can process requests concurrently. Each thread increments the counter when a request completes.

The intended result is simple: two completed requests should increase the counter by two.

But an increment may involve multiple conceptual operations:

```text
Read current value
       ↓
Calculate new value
       ↓
Write new value
```

If two threads interleave these operations, one update may overwrite the other.

The system needs a way to coordinate access to the shared state so that the required correctness guarantee is preserved.

That coordination is called **synchronization**.

Synchronization does not mean that all work must execute sequentially. It means that operations requiring coordination follow rules that preserve correctness.

The engineering challenge is to synchronize only what needs coordination while allowing independent work to continue concurrently.

---

## 2. What Is Synchronization?

**Synchronization is the coordination of concurrent execution units to establish required ordering, control access to shared resources, or ensure that operations occur under defined conditions.**

Synchronization can serve several purposes:

- Prevent conflicting updates to shared mutable state.
- Ensure an operation completes before another dependent operation begins.
- Protect invariants across multiple operations.
- Coordinate the production and consumption of data.
- Make changes visible to other execution units according to the language's concurrency guarantees.

The exact mechanisms vary across programming languages, runtimes, and system boundaries.

### 2.1 Why synchronization exists

Without appropriate coordination, concurrent operations may execute in an order that violates the program's requirements.

Suppose two requests try to reserve the final available product.

```text
Initial inventory: 1

Request A reads inventory = 1
Request B reads inventory = 1

Request A accepts reservation
Request B accepts reservation
```

Both requests may accept a reservation based on the same outdated assumption.

The business invariant is:

```text
Accepted reservations must not exceed available inventory.
```

Synchronization or an equivalent atomic resource-level operation must ensure that the competing requests cannot both commit an invalid state transition.

### 2.2 Synchronization does not eliminate concurrency

Consider two tasks:

```text
Task A: Fetch profile ───────┐
                             ├──► Build response
Task B: Fetch preferences ───┘
```

The two fetch operations may proceed concurrently because they are independent. Response construction waits until both results are available.

The coordination establishes the required dependency without forcing the independent tasks to execute sequentially.

**Key principle:** Synchronization controls the relationships between operations; it does not necessarily serialize the entire program.

---

## 3. Critical Sections

A **critical section** is a region of code that accesses shared state or performs an operation requiring coordinated access.

For example:

```python
shared_balance = 100

# Conceptual critical section
shared_balance = shared_balance - 20
```

If several threads can modify `shared_balance`, this update may need coordination.

However, the critical section may need to include more than the assignment.

Consider:

```python
if shared_balance >= amount:
    shared_balance -= amount
```

If the balance must never become negative, the check and update belong to the same logical operation. Protecting only the subtraction would not necessarily preserve the invariant.

### 3.1 Critical sections protect invariants

An **invariant** is a condition that must remain true for the system to be correct.

Examples:

- A balance must not become negative unless overdrafts are allowed.
- A shared counter must not lose updates.
- An inventory reservation must not exceed available stock.
- A collection must not be observed in an invalid intermediate state.

The critical section should cover the complete state transition needed to preserve the relevant invariant.

```text
Acquire coordination mechanism
             ↓
Read relevant state
             ↓
Validate required conditions
             ↓
Update shared state
             ↓
Release coordination mechanism
```

This is a conceptual sequence. The exact implementation depends on the synchronization mechanism.

### 3.2 Keep critical sections small—but correct

A critical section should generally contain only the work that needs coordination.

Unnecessarily large critical sections can:

- Block unrelated operations.
- Reduce concurrency.
- Increase waiting time.
- Increase contention.
- Make deadlocks more likely when multiple locks are involved.

However, making a critical section too small can be incorrect if it no longer protects the full invariant.

The goal is not the smallest possible block of code. It is the **smallest complete operation that preserves correctness**.

---

## 4. Mutual Exclusion

**Mutual exclusion** ensures that only one eligible execution unit at a time can enter a protected region guarded by the same exclusion mechanism.

It is useful when multiple execution units must not perform conflicting operations on shared state simultaneously.

Conceptually:

```text
Thread A ──► Acquire lock ──► Critical section ──► Release lock
Thread B ──► Wait if needed ─────────────────────► Enter when allowed
```

If Thread A holds the lock, Thread B cannot enter the protected region through that same lock until the lock becomes available.

### 4.1 Why mutual exclusion helps

Suppose two threads increment a shared counter.

Without coordination:

```text
Thread A reads 0
Thread B reads 0
Thread A writes 1
Thread B writes 1
```

With appropriate mutual exclusion around the complete increment:

```text
Thread A acquires lock
Thread A reads 0
Thread A writes 1
Thread A releases lock

Thread B acquires lock
Thread B reads 1
Thread B writes 2
Thread B releases lock
```

The protected operation no longer overlaps with another operation guarded by the same lock.

### 4.2 Mutual exclusion has a scope

A lock protects only the operations that follow the lock's coordination rules.

Suppose one function uses a lock while another function modifies the same shared object without acquiring it. The unprotected function can still violate the invariant.

Likewise, a typical in-process mutex does not automatically coordinate separate application processes or machines.

**Engineering implication:** A lock is not a magical property of the data. It is a coordination mechanism whose effectiveness depends on consistent use and appropriate scope.

### 4.3 Mutual exclusion is not the only synchronization goal

Some coordination requirements do not need exclusive access to a resource.

Examples include:

- Waiting until a task completes.
- Signaling that data is available.
- Coordinating a producer and consumer.
- Waiting for several independent tasks to finish.

These situations may be better handled by other synchronization or communication primitives. They are discussed further in ENG-10.07.

---

## 5. Locks and Mutexes

A **lock** is a synchronization mechanism used to control access to a protected resource or critical section.

A **mutex**, short for mutual exclusion, is a type of lock intended to provide exclusive access.

In many programming environments, the terms are used similarly, but exact semantics and supported behaviors vary.

A conceptual lock lifecycle is:

```text
          Acquire
             ↓
       ┌───────────┐
       │   Held    │
       └───────────┘
             ↓
       Critical section
             ↓
          Release
```

If another execution unit attempts to acquire an unavailable lock, it may wait, retry, or follow behavior defined by the particular lock implementation.

### 5.1 The lock must cover the complete operation

Consider a shared inventory value:

```python
stock = 1
```

An unsafe design might coordinate only the final decrement:

```text
Check stock outside the lock
Acquire lock
Decrease stock
Release lock
```

Two threads could both check that stock is positive before either acquires the lock. Both might then enter the critical section in turn and perform an invalid reservation.

A safer conceptual design is:

```text
Acquire lock
Check stock
If stock is available:
    Reserve one unit
Release lock
```

The check and update are protected as one logical state transition.

This example assumes all relevant operations use the same lock and access the same protected state. That assumption would not hold across independent processes unless a suitable cross-process coordination mechanism were used.

### 5.2 Lock ownership and release

Many lock implementations define rules about which execution unit may release a lock and how lock ownership works.

Incorrect use can lead to:

- Locks that remain held indefinitely.
- Operations that proceed without the required protection.
- Deadlocks.
- Unexpected behavior from acquiring a lock more than once when the implementation does not support reentrant acquisition.

Production code should use the language's documented locking patterns and ensure that locks are released even when an error occurs.

The exact syntax is language-specific, so this chapter focuses on the underlying engineering requirements rather than teaching one API.

---

## 6. Atomic Operations

An **atomic operation** behaves as one indivisible operation with respect to the concurrency guarantees it provides.

Other execution units cannot observe an intermediate state of that operation in a way that violates those guarantees.

For example, an atomic increment may guarantee that each increment updates a shared counter without losing another increment.

Conceptually:

```text
Atomic increment:
Read current value + add one + commit update
as one indivisible operation
```

This is different from an ordinary read-modify-write sequence that lacks the required atomic guarantee.

### 6.1 When atomic operations are useful

Atomic operations can be appropriate for:

- Counters.
- Flags.
- Simple state transitions.
- Coordinating access to certain shared values.

Their exact capabilities depend on the language, runtime, hardware, and operation being used.

### 6.2 Atomicity is not the same as mutual exclusion

Atomicity describes a guarantee about an operation. Mutual exclusion describes a coordination property that prevents multiple execution units from entering a protected region simultaneously.

| Property | Atomic operation | Mutual exclusion |
|---|---|---|
| Main purpose | Make a specified operation indivisible | Allow exclusive access to a protected region |
| Scope | Usually a particular supported operation | A region of work guarded by a lock |
| Multiple steps | Only when supported by the operation's guarantees | Can protect multiple steps when the entire sequence is guarded |
| Typical use | Atomic counter update | Coordinated check-and-update workflow |

An atomic increment can protect a counter update without requiring application code to lock an entire critical section.

But atomicity of one increment does not make a larger workflow atomic.

For example:

```text
Read inventory
Check inventory > 0
Atomically decrement inventory
Create order
```

Even if the decrement is atomic, the entire sequence may still be incorrect unless the inventory check and order creation are coordinated according to the business requirements.

### 6.3 Atomicity does not mean every operation is safe

An operation can be atomic but still implement the wrong business rule.

For example, an atomic operation that changes inventory from `1` to `0` may be safe as a single update. But if the system separately accepts two orders before performing the update, atomicity of the decrement alone may not prevent duplicate reservations.

Always ask which guarantee is needed:

- Is one value update indivisible?
- Must only one execution unit enter a region?
- Must several state changes succeed together?
- Must the change be visible to other execution units in a defined order?

These are related but different requirements.

---

## 7. Visibility and Ordering

Synchronization can also establish ordering and visibility guarantees between execution units.

A thread may update shared state, while another thread later reads that state. Correctness can depend not only on whether the update occurred but also on whether the reading thread is guaranteed to observe the relevant change.

Programming languages and runtimes define rules for how concurrent memory accesses are ordered and observed. Those rules are often described through a **memory model**.

This chapter does not cover advanced memory-model internals. The practical rule is simpler:

**Do not assume that one execution unit's update is automatically observed by another in the required way unless the language or synchronization mechanism guarantees it.**

### 7.1 Ordering between dependent operations

Suppose one task initializes an object before another task uses it.

```text
Task A: Initialize configuration
              ↓
        Establish required ordering
              ↓
Task B: Read configuration
```

The application needs a valid ordering guarantee between initialization and use.

A suitable synchronization mechanism or task-completion relationship may establish that guarantee.

Without the required guarantee, the program may rely on assumptions about execution timing or visibility that are not portable or correct.

### 7.2 Synchronization must match the language's guarantees

Different programming languages provide different concurrency primitives and memory-model rules.

A correct design in one language should not be assumed to have identical semantics in another.

Use the language's documentation to verify:

- What a lock guarantees.
- Whether an operation is atomic.
- How updates become visible.
- Which operations establish ordering.
- What happens when synchronization is used incorrectly.

The mental model remains useful across languages, but implementation guarantees must be verified for the chosen environment.

---

## 8. Choosing Between Locks and Atomic Operations

Consider two requirements.

**Requirement A:** Count completed requests accurately.

**Requirement B:** Withdraw money only if sufficient funds are available.

The first requirement may be satisfied by an appropriate atomic counter operation.

The second usually requires coordinating a condition check with a state update. An atomic decrement by itself does not necessarily enforce the balance rule.

This illustrates an important design principle: choose the mechanism based on the invariant, not merely on the shared variable's type.

### 8.1 A decision framework

| Requirement | Possible direction | Important limitation |
|---|---|---|
| Increment a shared counter | Atomic increment or suitable lock | Verify the operation's guarantees |
| Protect a multi-step in-memory update | Lock around the complete critical section | Every relevant access must follow the coordination rules |
| Publish a consistent configuration | Immutable snapshot or coordinated update | Referenced mutable objects may still need protection |
| Reserve a database resource | Conditional update or transaction | Must rely on the database's actual guarantees |
| Coordinate multiple workers | Shared coordination mechanism or resource-level operation | A process-local lock may not cover all workers |
| Signal task completion | Completion or coordination primitive | Does not automatically protect unrelated shared state |

These are starting points, not universal answers. The appropriate choice depends on resource ownership, contention, failure modes, and the guarantees required by the application.

---

## 9. The Cost of Synchronization

Synchronization improves correctness when used appropriately, but it has costs.

### 9.1 Contention

**Contention** occurs when multiple execution units compete for the same synchronization resource.

If many threads repeatedly acquire the same lock, they may spend significant time waiting instead of doing useful work.

```text
Thread A ──► Lock held ──► Work ──► Release
Thread B ──► Waiting ─────────────────► Work
Thread C ──► Waiting ───────────────────────► Work
```

This can reduce throughput and increase latency.

### 9.2 Reduced concurrency

A large critical section can serialize operations that could otherwise run independently.

For example, if a thread acquires a shared lock before making a slow network request and releases it only after the response arrives, other threads may be blocked for the entire duration.

If the network request does not need the protected state, moving it outside the critical section may improve concurrency—provided the resulting design still preserves the required invariant.

### 9.3 Coordination overhead

Lock acquisition, release, waiting, and coordination can consume resources.

The impact depends on the implementation, contention level, workload, and system architecture.

### 9.4 Increased complexity

Synchronization adds rules that engineers must understand and maintain.

Potential problems include:

- Deadlocks.
- Inconsistent locking conventions.
- Accidental access outside a critical section.
- Hard-to-reproduce failures.
- Excessive coupling between components.

A design with many locks can become difficult to reason about, especially when operations acquire locks in different orders.

### 9.5 Correctness comes first, but performance still matters

Removing synchronization solely to improve performance is not acceptable if doing so breaks correctness.

Instead:

1. Establish the required invariant.
2. Choose the simplest mechanism that correctly protects it.
3. Measure contention and performance.
4. Reduce unnecessary shared state.
5. Narrow critical sections where safe.
6. Reevaluate the design if synchronization becomes a bottleneck.

The objective is not to eliminate synchronization. It is to avoid unnecessary coordination while preserving correctness.

---

## 10. Common Synchronization Mistakes

### Mistake 1: Locking only one line of a multi-step operation

A business invariant may depend on a check and a subsequent update.

**Correction:** Protect the complete state transition, not an arbitrary line of code.

### Mistake 2: Assuming a lock protects data automatically

A lock only coordinates execution units that use the same mechanism according to its rules.

**Correction:** Establish a clear ownership and synchronization convention for the protected state.

### Mistake 3: Assuming atomicity guarantees application-level correctness

An atomic operation may protect one update while a larger workflow remains vulnerable.

**Correction:** Identify the full invariant and verify that all required steps are coordinated.

### Mistake 4: Holding a lock during slow, unrelated work

Network calls, long computations, or unrelated I/O inside a critical section can increase contention.

**Correction:** Keep protected regions focused on the work that requires coordination, while preserving correctness.

### Mistake 5: Using a local lock to coordinate independent application instances

A normal in-process lock cannot automatically coordinate separate machines.

**Correction:** Use a mechanism whose scope covers all participants accessing the shared resource.

### Mistake 6: Adding locks everywhere

Unnecessary locks increase complexity and can introduce contention or deadlocks.

**Correction:** Synchronize shared mutable state when required by correctness, not by default.

### Mistake 7: Assuming synchronized code cannot deadlock

Two or more locks can create circular waiting when different execution units acquire them in conflicting orders.

**Correction:** Use consistent lock-ordering rules and understand the deadlock risks before introducing multiple locks. Deadlocks are the subject of ENG-10.05.

### Mistake 8: Ignoring exception paths

If a lock is not released after an exception or early exit, other execution units may remain blocked.

**Correction:** Use the language's recommended scoped-lock or cleanup pattern so that lock release is handled reliably.

---

## 11. A Practical Synchronization Design Process

Use the following process when designing a concurrent operation.

### Step 1: Define the invariant

Example:

```text
The available inventory must never become negative.
```

### Step 2: Identify the shared resource

Determine whether the state exists in process memory, a database, a file, or another system.

### Step 3: Identify every competing operation

List all operations that can read or modify the state.

Do not consider only the code path currently under investigation. Other endpoints, workers, or application instances may access the same resource.

### Step 4: Define the required guarantee

Ask whether the operation requires:

- Mutual exclusion.
- Atomic update.
- Ordering or visibility.
- Coordination between tasks.
- A transaction covering multiple changes.

More than one guarantee may be necessary.

### Step 5: Choose the mechanism

Select a synchronization primitive or resource-level operation whose guarantees match the invariant and resource boundary.

### Step 6: Minimize the protected region

Keep the critical section as small as possible without splitting the invariant across unprotected steps.

### Step 7: Check failure paths

Consider exceptions, cancellation, early returns, timeouts, and process failure. Verify that the design does not leave resources in an invalid state or block unrelated work indefinitely.

### Step 8: Evaluate performance

Measure contention and throughput under representative workloads. Do not assume synchronization is a bottleneck without evidence.

### Step 9: Document the rule

Explain which state is protected, which mechanism must be used, and which invariants depend on it.

A clear synchronization contract helps prevent future code from modifying shared state through an unprotected path.

---

## 12. Interview Questions

### Q1. What is synchronization in concurrent programming?

**Expected answer:**

Synchronization coordinates concurrent execution units to control access to shared resources, establish required ordering, or ensure that operations occur under defined conditions.

### Q2. What is a critical section?

**Expected answer:**

A critical section is a region of code that accesses shared state or performs an operation requiring coordinated access. It should protect the complete state transition needed to preserve the relevant invariant.

### Q3. What is mutual exclusion?

**Expected answer:**

Mutual exclusion ensures that only one eligible execution unit at a time enters a region protected by the same exclusion mechanism.

### Q4. What is the difference between a lock and a mutex?

**Expected answer:**

A lock is a general term for a synchronization mechanism that controls access. A mutex is a type of lock intended to provide mutual exclusion. Exact terminology and semantics vary by programming environment.

### Q5. What is an atomic operation?

**Expected answer:**

An atomic operation behaves as one indivisible operation according to its documented concurrency guarantees. Other execution units cannot observe an intermediate state in a way that violates those guarantees.

### Q6. What is the difference between atomicity and mutual exclusion?

**Expected answer:**

Atomicity describes the indivisibility guarantee of an operation. Mutual exclusion prevents multiple execution units from entering a protected region simultaneously. A lock can protect a multi-step operation, while an atomic primitive may protect one supported update.

### Q7. Why is an atomic increment not enough to implement a safe bank withdrawal?

**Expected answer:**

The withdrawal requires checking the balance and updating it consistently. An atomic increment or decrement only protects its own operation and does not necessarily make the complete check-and-update workflow atomic.

### Q8. Why should critical sections be small?

**Expected answer:**

Small critical sections reduce unnecessary blocking and contention, allowing more independent work to proceed concurrently. They must still cover the complete operation required to preserve correctness.

### Q9. Can a lock protect shared state across multiple machines?

**Expected answer:**

A typical in-process lock cannot. Cross-process or cross-machine coordination requires a mechanism visible to all relevant participants, such as an appropriate database operation or distributed coordination mechanism.

### Q10. Can synchronization reduce performance?

**Expected answer:**

Yes. Lock contention, waiting, coordination overhead, and unnecessary serialization can reduce throughput and increase latency. The correct approach is to preserve correctness first and then measure and reduce unnecessary synchronization.

### Q11. How would you choose between an atomic operation and a lock?

**Expected answer:**

Start with the required invariant. Use an atomic operation when its guarantees fully protect the required update. Use a lock or another coordination mechanism when a larger sequence of operations must be coordinated. For external state, rely on guarantees at the resource boundary.

### Q12. What is the danger of acquiring multiple locks?

**Expected answer:**

Different execution units may acquire the same locks in conflicting orders and wait indefinitely for one another, producing a deadlock. Consistent lock ordering and simpler shared-state designs help reduce this risk.

---

## 13. Quick Revision

- Synchronization coordinates concurrent execution units.
- Synchronization can protect shared state, establish ordering, or coordinate task progress.
- A critical section contains work that requires coordinated access.
- A critical section should protect the complete invariant, not just an arbitrary statement.
- Mutual exclusion prevents simultaneous entry into a protected region guarded by the same mechanism.
- A mutex is a type of lock intended for mutual exclusion.
- Atomic operations provide indivisibility for specified operations.
- Atomicity and mutual exclusion are related but different guarantees.
- A local lock does not automatically coordinate separate processes or machines.
- Excessive synchronization can increase contention, reduce throughput, and complicate code.
- Removing necessary synchronization can break correctness.
- The coordination mechanism must match the scope of the shared resource.

---

## 14. Key Takeaways

Synchronization is a tool for establishing the guarantees a concurrent program needs. It is not a requirement to make the whole application sequential.

The central engineering task is to identify the invariant, determine which operations can violate it, and choose a mechanism whose guarantees cover those operations and the relevant resource boundary.

When designing synchronization:

1. Define the invariant.
2. Identify the shared resource and competing operations.
3. Determine whether atomicity, mutual exclusion, ordering, or broader coordination is required.
4. Select a mechanism that covers the complete operation.
5. Keep critical sections focused but correct.
6. Check failure paths and deadlock risks.
7. Measure performance rather than guessing.
8. Document the synchronization contract.

These principles prepare us for the next chapter, **Deadlocks and Related Problems**, which examines what can happen when synchronization and resource dependencies prevent progress.

---

## 15. Further Reading

- [Python threading documentation](https://docs.python.org/3/library/threading.html) — Thread locks and synchronization primitives.
- [Python multiprocessing documentation](https://docs.python.org/3/library/multiprocessing.html) — Process-level synchronization and communication.
- [Python asyncio synchronization primitives](https://docs.python.org/3/library/asyncio-sync.html) — Synchronization mechanisms for asynchronous tasks.

These references provide language-specific details. Always verify the guarantees of the actual programming language and runtime used by your application.

---
