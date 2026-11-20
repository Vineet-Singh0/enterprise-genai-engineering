
# Deadlocks and Related Problems

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what a deadlock is and how it prevents progress.
- Understand the four necessary conditions associated with classic resource deadlocks.
- Analyze how lock ordering and circular waiting can produce deadlocks.
- Distinguish deadlock, starvation, and livelock.
- Identify common deadlock scenarios in application code.
- Apply practical strategies to prevent, avoid, detect, and recover from deadlocks.
- Evaluate synchronization designs for both correctness and progress.

## Prerequisites

- **ENG-01 — Computer Science Fundamentals:** Processes, threads, and program execution.
- **ENG-03 — Software Engineering Principles:** Modularity and managing dependencies.
- **ENG-10.02 — Execution Models and Shared State:** Execution units, scheduling, and shared resources.
- **ENG-10.04 — Synchronization Fundamentals:** Critical sections, locks, mutual exclusion, and synchronization.

**Estimated reading time:** 25–30 minutes.

---

## 1. Before We Start

Consider a backend service with two shared resources:

- Resource A: a customer account lock.
- Resource B: a transaction record lock.

Two tasks need both resources to complete their operations.

Task 1 acquires Resource A and then requests Resource B.

Task 2 acquires Resource B and then requests Resource A.

```text
Task 1                         Task 2
------                         ------
Acquires Resource A            Acquires Resource B
Requests Resource B            Requests Resource A
Waits for Task 2                Waits for Task 1
```

Neither task can proceed because each is waiting for a resource held by the other.

If neither task releases its current resource, both remain blocked indefinitely.

This situation is called a **deadlock**.

The problem is not simply that the tasks are slow. They are waiting on one another in a way that prevents either from making progress.

Synchronization helps protect shared state, but poorly designed synchronization can introduce progress failures. A correct concurrent system must consider both:

1. **Safety:** Does the system preserve its correctness requirements?
2. **Progress:** Can eligible work continue to make progress?

---

## 2. What Is a Deadlock?

A **deadlock** is a state in which a set of execution units cannot proceed because each is waiting for a resource or condition that another blocked unit in the set must release or satisfy.

In the classic resource-deadlock scenario, tasks hold resources while waiting for resources held by other tasks.

A simple example:

```text
Task A holds Lock 1 and waits for Lock 2.
Task B holds Lock 2 and waits for Lock 1.
```

Neither task can enter its next critical section.

### 2.1 Why deadlocks matter

A deadlock can cause:

- Requests that never complete.
- Threads that remain blocked.
- Resources that remain occupied.
- Reduced throughput.
- Exhaustion of connection pools or worker capacity.
- Cascading failures when blocked work prevents other requests from being processed.

For example, suppose every worker in a service becomes blocked while waiting for a lock. New requests may remain queued even when the CPU is mostly idle.

The service may appear unresponsive without consuming much processing power.

### 2.2 Deadlock does not mean high CPU usage

A deadlocked task is often waiting rather than actively computing.

Therefore, low CPU utilization does not prove that a system is healthy. A service can be stalled because execution units cannot obtain the resources they need.

Likewise, high CPU utilization does not prove that a deadlock exists.

The important question is whether the relevant execution units can make progress.

---

## 3. How Deadlocks Form

A classic resource deadlock can be understood through a dependency cycle.

Suppose:

- Task A holds Lock 1 and waits for Lock 2.
- Task B holds Lock 2 and waits for Lock 1.

The dependency graph is:

```text
Task A ──waits for──► Lock 2
   ▲                     │
   │                     │ held by
   │                     ▼
Lock 1 ◄──held by──── Task B
```

Another representation makes the cycle explicit:

```text
Task A → Lock 2 → Task B → Lock 1 → Task A
```

The cycle represents circular waiting. Each task needs something that cannot become available until another task proceeds.

For classic single-instance resource deadlocks, a cycle in the resource-allocation graph indicates deadlock. With multiple instances of a resource type, the presence of a cycle alone does not always prove deadlock.

### 3.1 A simple lock-ordering example

Consider two conceptual operations:

```python
def update_customer():
    acquire(lock_a)
    acquire(lock_b)

    try:
        update_customer_state()
    finally:
        release(lock_b)
        release(lock_a)

def update_transaction():
    acquire(lock_b)
    acquire(lock_a)

    try:
        update_transaction_state()
    finally:
        release(lock_a)
        release(lock_b)
```

The pseudocode illustrates inconsistent lock ordering. The exact lock API is intentionally omitted.

One possible execution is:

```text
1. update_customer acquires lock_a.
2. update_transaction acquires lock_b.
3. update_customer waits for lock_b.
4. update_transaction waits for lock_a.
```

Both operations are now blocked.

The key design problem is that the operations acquire the same locks in different orders.

---

## 4. Four Necessary Conditions for Classic Resource Deadlock

A classic resource deadlock can occur when four conditions hold simultaneously.

These are commonly known as the **Coffman conditions**.

### 4.1 Mutual exclusion

At least one resource must be held in a way that prevents multiple tasks from using it simultaneously.

For example, a mutex allows only one eligible task at a time to enter a protected region.

If every resource could always be shared without restriction, this particular resource-deadlock mechanism would not apply.

### 4.2 Hold and wait

A task holds one or more resources while waiting for additional resources.

Example:

```text
Task A holds Lock 1.
Task A waits for Lock 2.
```

The task does not release Lock 1 while waiting for Lock 2.

### 4.3 No preemption

The resource cannot simply be taken away from its current holder by an external mechanism while preserving the system's correctness.

For example, forcibly removing a lock from a task that is midway through updating shared state could leave that state inconsistent.

This condition does not mean resources can never be released. It means that, in the classic model, the system cannot safely preempt the held resource at will.

### 4.4 Circular wait

A cycle exists in which each task waits for a resource held by another task in the cycle.

```text
Task A waits for Task B's resource.
Task B waits for Task C's resource.
Task C waits for Task A's resource.
```

The dependency cycle prevents progress.

### 4.5 Why the four conditions are useful

The conditions provide a framework for reasoning about prevention.

If a design can reliably eliminate at least one necessary condition, it can prevent deadlock through that mechanism under the model's assumptions.

For example, enforcing a global lock order can eliminate circular wait.

However, the conditions are not a complete diagnostic checklist for every possible system stall. Real applications can also hang because of blocking I/O, unresolved dependencies, exhausted resources, or faulty coordination logic.

---

## 5. Lock Ordering and Circular Waiting

One practical strategy for preventing classic lock deadlocks is to define a consistent global order for acquiring locks.

Suppose the system has:

```text
Lock A
Lock B
Lock C
```

The rule is:

```text
Always acquire A before B before C.
```

An operation that needs both Lock A and Lock C acquires A first, then C.

An operation that needs Lock B and Lock C acquires B first, then C.

Neither operation acquires a later lock and then requests an earlier lock.

### 5.1 Why consistent ordering helps

If every task follows the same strict ordering, a circular wait involving those locks cannot form under the stated locking rules.

For example:

```text
Operation 1: A → B
Operation 2: B → C
Operation 3: A → C
```

These acquisition sequences follow the same order.

A conflicting design would permit:

```text
Operation 1: A → B
Operation 2: B → A
```

The second sequence violates the global ordering and reintroduces the possibility of a cycle.

### 5.2 Practical considerations

A lock-ordering rule must be explicit and consistently enforced.

It becomes more difficult when:

- New locks are introduced.
- Different modules acquire locks independently.
- Callbacks acquire locks indirectly.
- A function acquires a lock and calls another function that acquires a different lock.
- Lock acquisition order depends on dynamic data.

Useful engineering practices include:

- Documenting the order in code or design documentation.
- Keeping lock ownership and acquisition rules easy to discover.
- Avoiding unnecessary nested locks.
- Reviewing call chains that acquire locks.
- Testing concurrent operations that use overlapping resources.

A global ordering strategy is effective for classic lock-ordering deadlocks, but it does not solve every possible progress failure.

---

## 6. Other Deadlock Prevention Strategies

Consistent lock ordering is useful, but other strategies may be more appropriate depending on the system.

### 6.1 Avoid holding resources while waiting unnecessarily

Suppose a task acquires a lock and then makes a slow external API request while holding it.

If the external request does not need the protected state, the task is keeping the lock unavailable longer than necessary.

A better design may be:

```text
Read or prepare required data
          ↓
Perform independent external work
          ↓
Acquire lock
          ↓
Validate current state and apply update
          ↓
Release lock
```

This pattern can reduce contention and simplify dependencies.

However, the state may change during the external operation. The task may need to revalidate its assumptions before committing the update.

The correct design must balance reduced lock duration with consistency requirements.

### 6.2 Minimize nested locking

A design that acquires multiple locks creates more opportunities for circular waiting.

Where practical, consider:

- Combining related state behind one synchronization boundary.
- Reducing shared mutable state.
- Passing immutable snapshots.
- Using ownership or message passing.
- Restructuring operations so they do not need multiple locks simultaneously.

These changes can reduce complexity, but a single large lock can itself become a contention bottleneck. The trade-off must be evaluated against the system's requirements.

### 6.3 Use timeouts where appropriate

Some lock APIs support timed acquisition.

Instead of waiting indefinitely, an operation may stop waiting after a specified period and handle the failure.

Conceptually:

```text
Attempt to acquire lock
          ↓
Acquired?
  ├── Yes → Continue operation
  └── No  → Recover, retry safely, or report failure
```

Timeouts can prevent an operation from remaining blocked indefinitely, but they do not automatically eliminate the underlying deadlock.

A timed-out task must handle partial work, release resources it already owns where safe, and avoid duplicating side effects during retries.

### 6.4 Avoid unnecessary shared resources

Sometimes the best solution is architectural rather than a different lock.

For example, if one worker owns a resource and other workers send it messages, the system may not need multiple workers to acquire locks around the same mutable object.

Reducing shared mutable state can eliminate entire categories of coordination problems.

This is a design direction, not a universal replacement for locking. The ownership model and communication mechanism must still guarantee correct behavior.

---

## 7. Deadlock Avoidance, Detection, and Recovery

Prevention, avoidance, detection, and recovery are different strategies.

### 7.1 Prevention

**Prevention** designs the system so that at least one necessary condition for the relevant deadlock model cannot hold.

Examples:

- Enforce a strict global lock order to prevent circular wait.
- Avoid holding one resource while requesting another when the design can safely release it.
- Restructure the design to reduce simultaneous resource ownership.

Prevention is often attractive when the rules can be enforced without excessive complexity.

### 7.2 Avoidance

**Avoidance** evaluates resource-allocation decisions to avoid entering a state that could lead to deadlock.

The system needs enough information about resource requirements and availability to make that decision.

This approach can be useful in controlled resource-allocation systems, but it is not always practical for general-purpose application code whose future resource needs are difficult to predict.

### 7.3 Detection

**Detection** identifies that a deadlock has already occurred.

Possible techniques include:

- Inspecting blocked tasks and their held resources.
- Building wait-for graphs.
- Detecting cycles in relevant dependency structures.
- Monitoring operations that exceed expected waiting thresholds.

Detection does not itself restore progress. It provides evidence that the system needs intervention or recovery.

### 7.4 Recovery

**Recovery** attempts to restore progress after a deadlock or related stall is detected.

Possible strategies include:

- Cancelling an operation when cancellation is safe.
- Aborting and retrying a transaction.
- Releasing resources through a controlled rollback.
- Restarting an affected worker or service when no safer recovery exists.

Recovery is difficult when an operation has already produced external side effects. Retrying a payment, sending a notification twice, or repeating a non-idempotent operation may cause additional problems.

Recovery mechanisms must therefore be designed around the operation's state and side effects.

---

## 8. Deadlock, Starvation, and Livelock

Deadlock is one of several ways a concurrent system can fail to make useful progress.

The distinctions matter because each problem has different causes and possible remedies.

### 8.1 Deadlock

A **deadlock** occurs when execution units are blocked in a dependency cycle or an equivalent circular-wait situation.

Example:

```text
Task A waits for a resource held by Task B.
Task B waits for a resource held by Task A.
```

Neither task can proceed without a change to the situation.

### 8.2 Starvation

**Starvation** occurs when an execution unit waits indefinitely or for an unacceptably long time because it repeatedly fails to obtain the resources or scheduling opportunities it needs, while other work continues to make progress.

Example:

```text
Task A repeatedly receives access to a shared resource.
Task B repeatedly waits and rarely or never receives access.
```

The system is not necessarily deadlocked. Other tasks may continue working.

Starvation can arise from unfair scheduling, resource allocation, priority policies, or a workload that consistently favors other execution units.

Possible mitigations include fairer resource allocation, appropriate queueing policies, or redesigning the contention pattern.

Fairness guarantees vary by synchronization primitive and runtime; they should not be assumed without documentation.

### 8.3 Livelock

**Livelock** occurs when execution units remain active and repeatedly react to one another, but the system fails to make useful progress.

For example, two tasks may both detect a conflict, back off, retry, and collide again in a synchronized pattern.

```text
Task A detects conflict → backs off → retries
Task B detects conflict → backs off → retries
          ↖ both collide again ↗
```

The tasks are not necessarily blocked. They keep executing, but their activity does not accomplish the intended work.

Possible mitigations include introducing randomized backoff, changing the coordination protocol, or reducing synchronized retries.

### 8.4 Comparison

| Problem | What happens? | Does other work progress? | Typical clue |
|---|---|---|---|
| Deadlock | Tasks wait on one another or a blocked dependency cycle | Some unrelated work may continue; affected tasks do not progress | Blocked tasks and a dependency cycle |
| Starvation | A task repeatedly fails to obtain a needed resource or opportunity | Yes, other work continues | One task waits while others repeatedly succeed |
| Livelock | Tasks remain active but repeatedly fail to complete useful work | Activity continues, but affected work does not progress | Repeated retries or reactions without completion |

Do not diagnose these problems based only on CPU usage or response latency. Inspect the behavior of the affected execution units and their dependencies.

---

## 9. Recognizing Deadlocks in Production

A deadlock may appear as an application hang rather than an obvious error.

Possible symptoms include:

- Requests remain pending.
- Worker threads appear blocked.
- A connection pool becomes exhausted.
- Throughput drops sharply.
- CPU usage is low while requests continue to accumulate.
- Multiple tasks wait for resources held by one another.
- A service recovers only after a worker or process is restarted.

These symptoms are not proof of deadlock. Slow dependencies, exhausted resource pools, long-running transactions, and external service failures can produce similar effects.

### 9.1 What to investigate

Start with concrete evidence:

1. Identify which operations are not completing.
2. Determine whether they are actively computing, blocked, or repeatedly retrying.
3. Inspect lock ownership and waiting relationships where the runtime exposes them.
4. Check whether several blocked operations form a dependency cycle.
5. Review recent changes to lock acquisition order and critical sections.
6. Inspect whether locks are held across network calls, database calls, or callbacks.
7. Examine timeouts, retries, and resource-pool utilization.

The objective is to establish a causal explanation rather than assume that every hang is a deadlock.

### 9.2 Why restarting may appear to fix the problem

Restarting a process releases many process-owned resources and clears its in-memory execution state.

This may temporarily restore service availability.

However, a restart does not prove that the root cause has been corrected. If the same execution pattern occurs again, the deadlock may recur.

In addition, restarting can be unsafe if in-flight operations have already produced external side effects or if multiple service instances share the same problematic resource.

Use recovery as an operational measure, but investigate the underlying dependency and resource-ownership design.

Detailed failure investigation practices are covered in **ENG-10.09 — Concurrency Failure Analysis**, with general debugging and diagnostic foundations in ENG-08.

---

## 10. A Practical Deadlock Analysis

Consider a service with two operations:

```text
Operation A:
1. Acquire customer lock.
2. Update customer state.
3. Acquire transaction lock.
4. Update transaction state.

Operation B:
1. Acquire transaction lock.
2. Update transaction state.
3. Acquire customer lock.
4. Update customer state.
```

Analyze the design systematically.

### Step 1: List the resources

```text
Customer lock
Transaction lock
```

### Step 2: Identify acquisition order

```text
Operation A: Customer → Transaction
Operation B: Transaction → Customer
```

The orders conflict.

### Step 3: Construct a possible interleaving

```text
Operation A acquires customer lock.
Operation B acquires transaction lock.

Operation A requests transaction lock and waits.
Operation B requests customer lock and waits.
```

### Step 4: Check for a cycle

```text
Operation A waits for Operation B.
Operation B waits for Operation A.
```

A circular wait is possible.

### Step 5: Choose a mitigation

One option is to enforce a consistent global order:

```text
Customer lock → Transaction lock
```

Both operations must follow this order whenever they need both locks.

Another option may be to redesign ownership or state updates so the operations do not need both locks at once. That alternative must still preserve the required invariants.

### Step 6: Check other failure modes

Even after fixing the lock order, evaluate:

- Whether a lock can remain held after an exception.
- Whether external calls occur while a lock is held.
- Whether cancellation leaves partial state changes.
- Whether a task can starve under contention.
- Whether the lock scope covers all relevant participants.

Solving one deadlock pattern does not guarantee that the entire system is free of progress failures.

---

## 11. Common Mistakes

### Mistake 1: Assuming every blocked task indicates deadlock

A task may be waiting normally for I/O, a dependency, or a resource.

**Correction:** Inspect the dependency relationships and determine whether progress is impossible or merely delayed.

### Mistake 2: Acquiring locks in different orders

Different acquisition orders can create circular waiting.

**Correction:** Define and consistently enforce a lock-ordering policy, or redesign the operation to avoid nested locking.

### Mistake 3: Holding locks across slow external operations

Long waits can increase contention and contribute to complex dependency cycles.

**Correction:** Keep locks held only as long as necessary, while revalidating state when work performed outside the lock may invalidate previous assumptions.

### Mistake 4: Treating timeouts as deadlock prevention

A timeout may end one waiting attempt, but the underlying dependency cycle can remain.

**Correction:** Treat timeouts as a bounded-wait or recovery mechanism, and address the root cause separately.

### Mistake 5: Confusing deadlock with starvation

A starved task may wait while other tasks continue to make progress. A deadlocked set of tasks cannot progress through the blocked dependency cycle.

**Correction:** Examine whether other tasks succeed and whether a circular dependency exists.

### Mistake 6: Confusing livelock with useful activity

Repeated retries may consume resources without completing the intended work.

**Correction:** Measure successful progress, not just execution activity or retry counts.

### Mistake 7: Assuming a restart fixes the design

Restarting may release blocked resources but leave the faulty acquisition pattern unchanged.

**Correction:** Use operational recovery where necessary, then investigate and correct the underlying design.

### Mistake 8: Using too many locks without a clear ownership model

Numerous interdependent locks make acquisition order and resource ownership difficult to reason about.

**Correction:** Minimize shared mutable state, simplify lock ownership, and document the coordination rules.

---

## 12. Interview Questions

### Q1. What is a deadlock?

**Expected answer:**

A deadlock is a state in which a set of execution units cannot progress because each waits for a resource or condition that another blocked unit must release or satisfy. A classic example involves two tasks holding locks that the other task needs.

### Q2. What are the four necessary conditions for a classic resource deadlock?

**Expected answer:**

Mutual exclusion, hold and wait, no preemption, and circular wait. Under the classic model, deadlock requires these conditions to hold simultaneously.

### Q3. How can inconsistent lock ordering cause deadlock?

**Expected answer:**

Two tasks may acquire the same locks in opposite orders. Each can hold one lock while waiting for the other, creating a circular dependency.

### Q4. How does global lock ordering prevent a class of deadlocks?

**Expected answer:**

If all operations acquire locks according to one consistent strict order, they cannot create a circular wait by acquiring those locks in conflicting orders, assuming the policy is consistently followed.

### Q5. What is the difference between deadlock and starvation?

**Expected answer:**

In a deadlock, the affected tasks are blocked by a dependency cycle or equivalent circular wait. In starvation, one task repeatedly fails to obtain a resource or opportunity while other tasks continue to make progress.

### Q6. What is livelock?

**Expected answer:**

Livelock occurs when tasks remain active and repeatedly respond to one another but fail to complete useful work, often because of repeated conflict and retry patterns.

### Q7. Does a timeout eliminate deadlock?

**Expected answer:**

Not necessarily. A timeout can bound a waiting attempt and trigger recovery, but the underlying dependency cycle may remain. The system must handle partially completed work and side effects safely.

### Q8. What is the difference between deadlock prevention and detection?

**Expected answer:**

Prevention designs the system so that a necessary deadlock condition cannot occur under the relevant model. Detection identifies a deadlock after it occurs. Recovery then attempts to restore progress.

### Q9. Why can holding a lock during a network request be dangerous?

**Expected answer:**

The request may take an unpredictable amount of time, leaving the lock unavailable and increasing contention. If other operations depend on that resource, the wait can contribute to a stall or deadlock.

### Q10. How would you investigate a production service that appears to hang?

**Expected answer:**

Identify the affected operations, determine whether they are blocked or actively executing, inspect resource ownership and wait relationships, look for dependency cycles, and review lock ordering and external calls inside critical sections. Similar symptoms from slow I/O or resource exhaustion must also be ruled out.

### Q11. Can eliminating circular lock ordering guarantee that a system never stalls?

**Expected answer:**

No. It prevents a specific class of lock-ordering deadlocks, but the system may still stall because of other dependencies, blocking operations, resource exhaustion, starvation, or faulty coordination logic.

### Q12. Why is deadlock recovery harder when external side effects are involved?

**Expected answer:**

Restarting or retrying an operation may repeat an action that already succeeded externally. Recovery must account for partial completion, resource release, transaction semantics, and whether retries are safe.

---

## 13. Quick Revision

- A deadlock prevents a set of execution units from progressing through a blocked dependency cycle.
- Classic resource deadlocks are associated with four conditions: mutual exclusion, hold and wait, no preemption, and circular wait.
- Conflicting lock-acquisition orders can create circular waiting.
- A consistent global lock order can prevent that class of deadlock when followed consistently.
- Avoid holding resources while waiting on unrelated, slow operations.
- Timeouts can bound waiting but do not automatically eliminate the underlying deadlock.
- Prevention, avoidance, detection, and recovery are different strategies.
- Starvation means a task fails to obtain needed resources or opportunities while other work progresses.
- Livelock means tasks remain active but fail to make useful progress.
- Production symptoms such as hangs or low CPU usage require investigation; they do not prove deadlock.
- Recovery must account for partial work and external side effects.
- Correct concurrency design requires both safety and progress.

---

## 14. Key Takeaways

Synchronization can preserve correctness, but it also introduces resource dependencies. When those dependencies form a cycle, tasks may become deadlocked.

The most useful engineering habit is to make resource ownership and acquisition order explicit.

When reviewing a concurrent design:

1. Identify the resources each operation acquires.
2. Record the order in which resources are acquired.
3. Look for conflicting orders and circular waiting.
4. Avoid holding resources across unrelated blocking operations.
5. Use timeouts and recovery where appropriate, without treating them as substitutes for correct design.
6. Distinguish deadlock from starvation, livelock, and ordinary slow execution.
7. Investigate the root cause when production recovery appears to resolve a hang.

These ideas lead to the next chapter, **Thread Safety and Safe Shared-State Design**, which examines how to structure data ownership and access rules so that concurrent code remains correct and maintainable.

---

## 15. Further Reading

- [Python threading documentation](https://docs.python.org/3/library/threading.html) — Thread locks and synchronization facilities.
- [Python multiprocessing documentation](https://docs.python.org/3/library/multiprocessing.html) — Process synchronization and resource coordination.
- [Python asyncio synchronization primitives](https://docs.python.org/3/library/asyncio-sync.html) — Coordination mechanisms for asynchronous tasks.

These references provide implementation-specific details. Always verify the behavior of the synchronization primitives used by the actual language and runtime.

---
