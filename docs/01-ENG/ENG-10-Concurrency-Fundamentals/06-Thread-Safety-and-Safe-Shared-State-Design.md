
# Thread Safety and Safe Shared-State Design

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain thread safety and distinguish it from general program correctness.
- Identify the invariants that concurrent operations must preserve.
- Understand how shared mutable state creates coordination requirements.
- Evaluate immutability, ownership, confinement, and synchronization as design strategies.
- Distinguish thread-safe components from thread-safe application workflows.
- Recognize why protecting individual operations may not protect a complete business operation.
- Design shared-state access rules that are understandable, maintainable, and appropriate for production systems.

## Prerequisites

- **ENG-03 — Software Engineering Principles:** Modularity, separation of concerns, coupling, and maintainability.
- **ENG-10.02 — Execution Models and Shared State:** Processes, threads, tasks, and shared memory.
- **ENG-10.03 — Race Conditions and Data Races:** Lost updates, check-then-act problems, and inconsistent state.
- **ENG-10.04 — Synchronization Fundamentals:** Critical sections, mutual exclusion, atomic operations, and synchronization.
- **ENG-10.05 — Deadlocks and Related Problems:** Circular waiting and progress failures.

**Estimated reading time:** 25–30 minutes.

---

## 1. Before We Start

Imagine a backend service that processes several requests concurrently. Each request needs access to a shared in-memory cache of user preferences.

The cache is useful because it avoids repeatedly fetching the same information. However, multiple requests may read, insert, update, or invalidate entries at the same time.

Consider this operation:

```python
if user_id not in cache:
    cache[user_id] = load_preferences(user_id)
```

The intention is reasonable: load preferences only when they are absent.

But the operation contains multiple steps:

1. Check whether the entry exists.
2. Load the preferences.
3. Insert the result.

If two threads execute this sequence concurrently, both may observe a missing entry and perform the load. Depending on the requirements, this might be harmless duplicate work or a correctness problem.

Now imagine that cache updates involve several related fields, or that loading preferences triggers additional side effects. The consequences become more significant.

The underlying engineering question is:

**How should a system be designed so that concurrent access preserves its correctness requirements?**

This is the central question of thread safety and safe shared-state design.

---

## 2. What Is Thread Safety?

**Thread safety is the property of a component or operation that allows it to be used concurrently by multiple threads without violating its specified correctness guarantees.**

A thread-safe component handles the concurrency interactions within the scope of the guarantees it provides.

For example, a thread-safe counter may ensure that concurrent increments are not lost.

However, thread safety must always be evaluated against a defined contract.

A component might guarantee that its internal data structure remains valid while concurrent operations occur. That does not necessarily guarantee that a complete business workflow using the component is correct.

### 2.1 Thread safety is not the same as general program correctness

A thread-safe component can be used incorrectly.

Suppose a service uses a thread-safe collection to store active reservations. Each individual insertion is safe, but the application performs these steps:

```text
1. Check whether a reservation exists.
2. If it does not exist, create a reservation.
3. Add the reservation to the collection.
```

If the check and creation are not coordinated, two threads may both create a reservation for the same resource.

The collection may remain internally valid while the business rule is violated.

This illustrates the distinction:

- **Thread safety:** Concurrent use respects the component's specified guarantees.
- **Application correctness:** The overall system satisfies its functional requirements and invariants.

Thread safety contributes to correctness, but it does not guarantee correctness by itself.

### 2.2 Thread safety depends on the contract

When evaluating a component, ask:

- Which operations can execute concurrently?
- Which internal state is shared?
- What guarantees does the component provide?
- Are multi-step operations atomic?
- Can callers observe intermediate state?
- Must callers coordinate access to achieve a larger invariant?

The answers determine how the component can safely be used.

Do not assume that a component is thread-safe merely because it is widely used or because individual methods appear simple.

---

## 3. Start With Invariants

An **invariant** is a condition that must remain true for the system to be correct.

Safe shared-state design starts by identifying the invariants that concurrent operations must preserve.

Examples include:

```text
A bank balance must not become negative unless overdrafts are allowed.

A product must not be reserved more times than its available inventory.

A task must not be marked complete before its required result is committed.

A user's preference configuration must satisfy all validation rules.

A unique identifier must not be assigned to two distinct records.
```

These are application-level requirements, not merely implementation details.

### 3.1 Why invariants matter

Consider an inventory record:

```python
inventory = {
    "available": 5,
    "reserved": 3,
}
```

Suppose the application requires:

```text
available >= 0
reserved >= 0
available + reserved = total_inventory
```

A design that protects only the `available` field may still violate the overall invariant if another operation changes `reserved` without appropriate coordination.

The state must be considered as a logical whole.

### 3.2 Identify the complete state transition

A state transition is the operation that changes a system from one valid state to another.

For an inventory reservation, the transition may involve:

1. Checking available stock.
2. Decreasing available stock.
3. Increasing reserved stock.
4. Recording the reservation.

Depending on where these values are stored, the transition may require a lock, a transaction, a conditional update, or another mechanism.

The correct choice depends on the resource boundary and the guarantees required by the application.

**Engineering rule:** Protect the invariant, not just an individual variable or line of code.

---

## 4. Shared Mutable State: The Main Design Challenge

Shared mutable state exists when multiple execution units can access the same information and that information can change.

For example:

```python
active_sessions = {}
```

Several threads may read or modify this dictionary.

Shared mutable state is not inherently incorrect. It becomes difficult to reason about when the design does not establish clear rules for:

- Who may read the state.
- Who may modify the state.
- Which operations require coordination.
- When updates become visible.
- Which invariants must remain true.
- Which execution units participate in the coordination mechanism.

### 4.1 Why shared mutable state increases complexity

Without shared mutation, a task can often calculate a result using its own input and return the result without coordinating with other tasks.

With shared mutation, an operation must consider what other tasks might do before, during, and after its execution.

The number of possible interactions grows as more execution units access the same mutable resources.

This creates additional risks:

- Lost updates.
- Inconsistent state.
- Duplicate work.
- Lock contention.
- Deadlocks.
- Difficult-to-reproduce failures.

The goal is not to eliminate all shared state. It is to minimize unnecessary sharing and make required sharing explicit.

### 4.2 A useful design question

Before introducing a lock, ask:

**Does this state need to be shared and mutable in the first place?**

If the answer is no, a design change may remove the coordination problem entirely.

---

## 5. Strategy One: Immutability

**Immutability** means that an object's state cannot be modified in place after the object is created, according to the guarantees of the relevant type or language.

Immutable data is easier to share because readers do not need to account for another thread changing that object in place.

### 5.1 Example: Shared configuration

Suppose multiple requests need the same recommendation configuration:

```python
configuration = {
    "profession_weight": 0.6,
    "education_weight": 0.3,
    "location_weight": 0.1,
}
```

If this configuration is initialized once and never modified, concurrent readers can use the same snapshot without coordinating each read against concurrent mutation of that snapshot.

If the configuration changes, the application can construct a new configuration object and publish it through an appropriate update mechanism.

Conceptually:

```text
Configuration version 1
          │
          ├── Existing tasks continue using version 1
          │
New configuration is created
          │
          ▼
Configuration version 2 is published
```

This can make it easier for each task to reason about a consistent version of the configuration.

### 5.2 Immutability reduces coordination

If no task can modify the shared value, there is no need to coordinate concurrent writes to that value.

This can reduce locking requirements and simplify reasoning about visibility and consistency.

However, the mechanism used to publish a new reference must still provide the required guarantees.

### 5.3 Shallow immutability is not enough

An object may appear immutable while containing references to mutable objects.

For example:

```python
configuration = {
    "weights": [0.6, 0.3, 0.1]
}
```

Even if the outer configuration is treated as read-only, the nested list can still be modified unless its own representation and access rules prevent mutation.

A read-only reference also does not necessarily mean that the underlying object cannot be changed through another reference.

**Engineering implication:** Evaluate the complete object graph and its ownership, not only the outer object's interface.

### 5.4 When immutability is useful

Immutability is particularly useful for:

- Configuration snapshots.
- Request inputs.
- Shared reference data.
- Computed results passed between tasks.
- Values that should remain stable during a workflow.

It is less straightforward when the business requirement involves frequent shared updates. In those cases, a different ownership or coordination strategy may be more appropriate.

---

## 6. Strategy Two: Ownership and Confinement

Another way to simplify concurrent systems is to make it clear which execution unit owns a mutable object.

**Ownership** describes responsibility for managing a resource or mutable state.

**Confinement** means restricting access to state so that concurrent execution units cannot modify it arbitrarily.

These ideas reduce the number of places where shared-state coordination is required.

### 6.1 Thread or task confinement

Suppose each request creates its own working state:

```text
Request A → Private working state A
Request B → Private working state B
Request C → Private working state C
```

Each request modifies its own data and produces a result.

Because the working state is not shared, the tasks do not need a lock to coordinate modifications to that state.

This design is often easier to reason about than allowing all requests to modify one global object.

However, confinement must be real. Passing a reference to another thread, storing it in a global cache, or exposing it through a shared service can break the confinement assumption.

### 6.2 Single-owner design

In a single-owner design, one component is responsible for mutating a particular resource.

Other components request changes through a defined interface rather than modifying the resource directly.

Conceptually:

```text
Task A ──┐
         │
Task B ──┼──► Resource owner ──► Mutable state
         │
Task C ──┘
```

The owner controls how updates are applied.

Depending on the implementation, requests may be processed sequentially or through a defined coordination mechanism.

### 6.3 Benefits and limitations

Ownership-based designs can:

- Reduce the number of code paths that modify shared state.
- Make invariants easier to enforce.
- Reduce lock usage.
- Simplify debugging and code review.

They can also introduce bottlenecks if one owner becomes responsible for too much work.

A single owner must have sufficient capacity, and the communication mechanism must handle overload and failure appropriately.

**Engineering principle:** Prefer explicit ownership over unrestricted shared mutation when it simplifies the correctness model without creating unacceptable bottlenecks.

---

## 7. Strategy Three: Synchronization Around Shared State

Sometimes shared mutable state is necessary.

For example, a service may need to maintain a shared in-memory index that multiple threads update.

In such cases, appropriate synchronization can protect the required invariants.

### 7.1 Establish a synchronization contract

A synchronization contract defines how shared state may be accessed and modified.

For example:

```text
Shared resource: In-memory inventory map

Readers:
- May read through the defined access interface.

Writers:
- Must acquire the designated lock.

Invariant:
- Inventory cannot become negative.

Update rule:
- Checking availability and reserving stock must be one
  coordinated state transition.
```

The exact rules depend on the design, but they should be explicit enough that future code cannot accidentally bypass them.

### 7.2 Protect complete operations

Consider:

```python
if stock > 0:
    stock -= 1
```

If the invariant requires stock never to become negative, the check and decrement must be coordinated as one logical operation.

Protecting only the decrement may leave the design incorrect.

Similarly, if several related fields must change together, the coordination mechanism must cover the entire state transition.

### 7.3 Synchronization is not a universal solution

Locks introduce their own concerns:

- Contention.
- Reduced concurrency.
- Deadlock risks.
- Lock-ordering requirements.
- Correct release during exceptions.
- The need for every relevant access path to follow the same rules.

The correct strategy may be a lock, an atomic operation, an immutable snapshot, a transaction, or a redesign that reduces shared mutation.

Choose the mechanism based on the invariant and the scope of the shared resource.

---

## 8. Strategy Four: Message Passing

Instead of allowing multiple tasks to modify shared state directly, a design can communicate changes through messages.

In a message-passing design, one component sends a request or message to another component that owns the relevant state.

Conceptually:

```text
Task A ── message ──┐
                    │
Task B ── message ──┼──► Owner processes updates
                    │
Task C ── message ──┘
```

The owner applies the updates according to its own rules.

This can reduce direct shared-memory mutation and make state transitions easier to centralize.

### 8.1 Example: Reservation requests

Instead of allowing many threads to update one shared inventory object directly, workers can submit reservation requests to a component responsible for inventory updates.

The owner validates each request and applies the relevant state transition.

This does not automatically guarantee correctness. The owner still needs to preserve the inventory invariant, and the messaging mechanism must handle delivery, retries, ordering, and overload appropriately.

### 8.2 When message passing helps

Message passing can be useful when:

- One component naturally owns a resource.
- Updates can be expressed as discrete requests.
- Direct shared mutation is difficult to reason about.
- Explicit ordering of updates is valuable.
- Components need a clear boundary around state ownership.

### 8.3 Trade-offs

Message passing can introduce:

- Communication overhead.
- Queueing latency.
- Backpressure requirements.
- More complicated error handling.
- Delivery and retry concerns.
- A bottleneck at the resource owner.

Message passing is a design strategy, not a guarantee that concurrency problems disappear.

The detailed communication and coordination concepts belong to **ENG-10.07 — Communication and Coordination Between Tasks**.

---

## 9. Thread-Safe Components Versus Thread-Safe Workflows

One of the most common design errors is assuming that a workflow is safe because every individual operation uses a thread-safe component.

Consider a reservation workflow:

```text
1. Check whether inventory is available.
2. Create an order.
3. Decrease inventory.
4. Record the reservation.
```

Each step may use a thread-safe library or storage operation.

Nevertheless, the overall workflow can still violate its requirements if multiple requests execute the steps in conflicting orders.

### 9.1 Local guarantees do not automatically compose

Suppose a collection guarantees that individual insertions are thread-safe.

That guarantee does not necessarily mean the following sequence is atomic:

```text
Check key
Calculate value
Insert key
```

Two callers may interleave the sequence and both perform work based on the same assumption.

Similarly, a thread-safe cache does not automatically make a database update and cache invalidation one atomic operation.

### 9.2 Define the workflow boundary

When reviewing a workflow, identify:

- Which steps must succeed together?
- Which state transitions must be atomic?
- Which operations can be retried?
- What happens if a step fails after an earlier step succeeds?
- Which invariants must hold at completion?
- Which invariants must remain valid while other tasks observe the state?

A thread-safe component can be part of the solution, but application-level correctness requires reasoning about the complete workflow.

### 9.3 Resource boundaries matter

Suppose several API instances update the same database record.

A lock in one process cannot automatically coordinate the other instances.

The system must use a mechanism whose guarantees cover every participant, such as an appropriate database transaction, conditional update, or resource-level coordination mechanism.

**Engineering rule:** Thread safety is a local guarantee; system correctness must be established at the boundary where competing operations interact.

---

## 10. Choosing a Shared-State Strategy

There is no single best strategy for every concurrent system.

The choice depends on the nature of the state, its ownership, the number of writers, the required invariants, and the resource boundary.

| Strategy | Best suited for | Main trade-off |
|---|---|---|
| Immutability | Shared values that rarely or never change in place | Updates may require new objects or snapshots |
| Confinement | State that can remain private to one task or execution context | Sharing results requires an explicit transfer mechanism |
| Single ownership | A resource with a clear owner and controlled updates | The owner can become a throughput bottleneck |
| Synchronization | Shared mutable state that requires coordinated access | Contention and deadlock risks |
| Atomic operations | Simple updates covered by specific atomic guarantees | Does not automatically protect multi-step workflows |
| Message passing | State that can be managed by a dedicated owner | Communication, queueing, and failure-handling complexity |
| Resource-level transactions or conditional updates | State shared across processes or machines | Depends on the resource's supported guarantees and transaction costs |

These approaches can be combined.

For example, an application might use immutable request data, task-local working state, message passing to a resource owner, and a database transaction for a multi-record update.

### 10.1 A practical decision sequence

Ask these questions in order:

**1. Can the state be immutable?**

If the value does not need in-place mutation, immutability may remove much of the coordination requirement.

**2. Can each task own its own copy or working state?**

If so, independent execution may be possible without shared mutation.

**3. Can one component own all updates?**

If ownership can be centralized without creating an unacceptable bottleneck, the design may become easier to reason about.

**4. If sharing is necessary, what invariant must be preserved?**

Identify the complete state transition rather than protecting arbitrary lines of code.

**5. Which coordination mechanism covers the resource boundary?**

A local lock may be sufficient for state shared by threads in one process. It is not automatically sufficient for state shared by multiple application instances.

**6. What happens under contention or failure?**

Evaluate deadlocks, retries, partial completion, cancellation, and performance.

The goal is to choose the simplest design that satisfies the system's correctness and operational requirements.

---

## 11. Common Mistakes

### Mistake 1: Assuming thread safety guarantees business correctness

A thread-safe data structure may not make a multi-step business operation atomic.

**Correction:** Define the invariant and reason about the complete workflow.

### Mistake 2: Sharing mutable state by default

Global mutable objects make ownership and coordination difficult to understand.

**Correction:** Prefer immutable values, task-local state, or explicit ownership where appropriate.

### Mistake 3: Treating a read-only reference as proof of immutability

Another reference may still modify the underlying object, or nested objects may remain mutable.

**Correction:** Examine the complete object graph and its access rules.

### Mistake 4: Protecting one field while ignoring a multi-field invariant

Related fields may need to change together to represent a valid logical state.

**Correction:** Coordinate the complete state transition.

### Mistake 5: Assuming one lock solves every problem

A lock may not cover every access path, may not protect external resources, and may introduce contention or deadlock.

**Correction:** Define the lock's scope and contract explicitly.

### Mistake 6: Assuming message passing eliminates correctness concerns

Messages may be duplicated, delayed, reordered, or retried depending on the mechanism.

**Correction:** Define ownership, ordering, retry, and failure semantics.

### Mistake 7: Using a process-local lock for a multi-instance system

The lock may protect only threads using that specific lock instance.

**Correction:** Coordinate at the database, shared resource, or other boundary visible to all participants.

### Mistake 8: Optimizing synchronization before understanding correctness

Removing a lock may improve throughput while introducing lost updates or invalid state transitions.

**Correction:** Establish the invariant first, then measure and optimize the coordination design.

### Mistake 9: Assuming that fewer locks always mean a better design

Reducing locks can simplify code, but an uncoordinated shared-state design may be incorrect.

**Correction:** Optimize for the simplest correct design, not for the minimum number of synchronization primitives.

---

## 12. A Practical Shared-State Design Review

Use this checklist when reviewing a concurrent component or service.

### State and ownership

- What mutable state exists?
- Which execution units can access it?
- Who is allowed to modify it?
- Can any object reference escape its intended ownership boundary?

### Correctness

- What invariants must always hold?
- Which operations can violate them?
- Are multi-step operations coordinated as a complete state transition?
- Can callers observe inconsistent intermediate state?

### Coordination

- Is immutability or confinement possible?
- Is one owner sufficient?
- If synchronization is required, does it cover all relevant access paths?
- Does the mechanism cover all processes or application instances that access the resource?

### Failure handling

- What happens if an operation fails partway through?
- Can retries duplicate side effects?
- Can cancellation leave state inconsistent?
- Can locks remain held after exceptions?

### Performance and maintainability

- Is shared mutable state necessary?
- Are critical sections larger than required?
- Is contention measurable?
- Are ownership and synchronization rules documented?
- Can future developers understand the component's concurrency contract?

This review should result in explicit design decisions, not simply a statement that a component is "thread-safe."

---

## 13. Interview Questions

### Q1. What is thread safety?

**Expected answer:**

Thread safety means a component or operation can be used concurrently by multiple threads without violating its specified guarantees. Those guarantees have a defined scope and do not automatically establish correctness for a larger application workflow.

### Q2. What is the difference between thread safety and general program correctness?

**Expected answer:**

Thread safety concerns correct concurrent use within a component's contract. General program correctness concerns whether the overall system satisfies its functional requirements and invariants. A thread-safe component can still be used in an incorrect workflow.

### Q3. Why are invariants important in shared-state design?

**Expected answer:**

Invariants define the conditions that must remain true. They identify which operations must be coordinated and what correctness means for the shared state.

### Q4. How does immutability help concurrent systems?

**Expected answer:**

Immutable data cannot be modified in place, reducing the need to coordinate readers against concurrent writers. However, nested mutable objects and the mechanism used to publish updated references still require consideration.

### Q5. What is confinement?

**Expected answer:**

Confinement restricts access to state so that multiple execution units cannot modify it arbitrarily. Task-local state is one example. Confinement fails if mutable references escape the intended boundary.

### Q6. What is a single-owner design?

**Expected answer:**

A single-owner design assigns responsibility for mutating a resource to one component. Other components request changes through a defined interface, allowing the owner to enforce invariants.

### Q7. When would you prefer message passing over direct shared-state mutation?

**Expected answer:**

Message passing may be preferable when one component naturally owns a resource and other components can request updates through messages. It can simplify ownership but introduces communication, queueing, and failure-handling concerns.

### Q8. Why is a thread-safe cache not sufficient to guarantee a correct reservation workflow?

**Expected answer:**

The cache may protect individual operations, but the complete workflow can still have a race between checking availability and creating a reservation. The invariant must be protected across the complete state transition.

### Q9. Why does the coordination mechanism need to match the resource boundary?

**Expected answer:**

A process-local lock coordinates only participants using that lock instance. If several processes or machines modify the same resource, the mechanism must provide guarantees visible to all relevant participants.

### Q10. How would you decide whether to use immutability, locking, or message passing?

**Expected answer:**

Start with the state and its invariants. Prefer immutability or confinement when possible. Consider explicit ownership and message passing when they simplify updates. Use synchronization when shared mutation is necessary, choosing a mechanism that protects the complete invariant and matches the resource boundary.

### Q11. Can an application be free of data races and still be incorrect?

**Expected answer:**

Yes. Its operations may be synchronized while a multi-step workflow still violates a business rule, handles retries incorrectly, or allows invalid state transitions.

### Q12. What makes a shared-state design maintainable?

**Expected answer:**

Clear ownership, explicit access rules, well-defined invariants, minimal unnecessary shared mutation, appropriate synchronization, and documented failure behavior make the design easier to review and change safely.

---

## 14. Quick Revision

- Thread safety means concurrent use respects a component's specified guarantees.
- Thread safety does not automatically guarantee application-level correctness.
- Invariants define the conditions a concurrent design must preserve.
- Shared mutable state creates coordination requirements.
- Immutability reduces the risk of concurrent in-place modification.
- Confinement restricts access to mutable state.
- Single ownership can centralize state transitions and reduce unrestricted mutation.
- Synchronization is necessary when shared mutable state requires coordinated access.
- Message passing can reduce direct shared mutation but introduces communication and failure-handling concerns.
- Thread-safe components do not automatically make multi-step workflows correct.
- Coordination must cover the full invariant and the actual resource boundary.
- Safe designs must account for contention, deadlocks, retries, cancellation, and partial failure.

---

## 15. Key Takeaways

Thread safety is not merely a property to check on a library or data structure. It is a design concern involving ownership, state transitions, coordination, and the guarantees required by the application.

The most effective approach is to reduce unnecessary shared mutation and make required sharing explicit.

When designing a concurrent component:

1. Identify mutable state and its owners.
2. Define the invariants the state must preserve.
3. Determine whether immutability or confinement can remove sharing.
4. Consider explicit ownership or message passing when appropriate.
5. If shared mutation remains necessary, protect the complete state transition.
6. Choose a coordination mechanism that covers every relevant participant.
7. Validate failure handling, performance, and maintainability.

A well-designed concurrent system makes it clear who owns each piece of state, which operations may change it, and what guarantees keep those changes correct.

The next chapter, **Communication and Coordination Between Tasks**, examines how concurrent units exchange information and coordinate progress without relying exclusively on direct shared-memory mutation.

---

## 16. Further Reading

- [Python threading documentation](https://docs.python.org/3/library/threading.html) — Threading facilities and synchronization.
- [Python multiprocessing documentation](https://docs.python.org/3/library/multiprocessing.html) — Process-level execution and communication.
- [Python asyncio documentation](https://docs.python.org/3/library/asyncio.html) — Asynchronous tasks and coordination.

These references provide Python-specific details. The design principles in this chapter apply more broadly, but implementation guarantees must be verified for the language and runtime used by the application.

---
