
# Execution Models and Shared State

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain how processes, threads, and tasks relate to concurrent execution.
- Distinguish independent execution from shared-memory execution.
- Explain what shared state is and why mutable shared state creates engineering risks.
- Understand how scheduling and execution order affect program behavior.
- Identify dependencies between concurrent tasks.
- Choose an appropriate mental model for reasoning about concurrent code.

## Prerequisites

- **ENG-01 — Computer Science Fundamentals:** Processes, threads, memory, and program execution.
- **ENG-02 — Programming Foundations:** Variables, functions, data structures, and control flow.
- **ENG-03 — Software Engineering Principles:** Modularity, abstraction, and maintainability.

This chapter builds on those concepts. It does not reteach operating-system internals or introduce language-specific concurrency APIs.

**Estimated reading time:** 20–25 minutes.

---

## 1. Before We Start

Imagine an application processing three customer requests:

1. Retrieve a customer's profile.
2. Calculate a recommendation score.
3. Fetch additional information from an external service.

A sequential implementation might perform each operation one after another. A concurrent implementation may allow multiple operations to make progress during overlapping periods.

However, concurrency introduces an important question:

**What happens when multiple units of execution access the same data?**

Consider a shared variable:

```python
request_count = 0
```

Suppose two tasks both need to increment it.

Each task might read the current value, calculate a new value, and write the result. If their operations overlap in an unfortunate order, one increment could be lost.

The issue is not simply that multiple tasks exist. The issue is how they execute and whether they share mutable state.

To reason about concurrency correctly, we need to understand execution units, memory relationships, and dependencies.

---

## 2. Execution Models: The Basic Mental Model

An **execution model** describes how a program's work is organized and how its units of execution make progress.

Three useful concepts are:

- **Process:** An executing program instance with its own process-level resources and virtual address space.
- **Thread:** A path of execution within a process. Threads in the same process normally share its address space.
- **Task:** A unit of work that a program or runtime schedules for execution. The exact meaning depends on the language and runtime.

These concepts are related, but they are not interchangeable.

### 2.1 Process

A process provides an execution environment for a running program.

For example, a backend service and a separate background worker may run as different processes.

```text
Operating system
│
├── Process A: API server
│   ├── Code and process resources
│   └── Process A address space
│
└── Process B: Background worker
    ├── Code and process resources
    └── Process B address space
```

Separate processes generally have separate address spaces. One process cannot ordinarily access another process's private memory directly.

Processes can communicate through mechanisms such as pipes, sockets, shared-memory regions, or other inter-process communication mechanisms. The existence of separate processes does not mean communication is impossible; it means communication requires an appropriate mechanism.

**Engineering implication:** Process boundaries can provide useful isolation, but exchanging data across them introduces communication and coordination costs.

### 2.2 Thread

A thread is an execution path within a process.

Threads in the same process normally share process memory and resources, while each thread maintains its own execution state, such as its stack and current execution position.

```text
One process
│
├── Shared process memory
│   ├── Application configuration
│   ├── Shared objects
│   └── Shared counters
│
├── Thread A
│   └── Its own execution state
│
└── Thread B
    └── Its own execution state
```

Because threads share memory, one thread may modify an object that another thread reads or modifies.

This can make communication convenient, but it also creates the possibility of conflicting operations.

**Engineering implication:** Shared memory reduces the need to explicitly transmit every value between threads, but it requires careful ownership and synchronization rules for mutable data.

### 2.3 Task

A task represents a unit of work that needs to be executed.

For example:

- Fetch a user's profile.
- Retrieve matching candidates.
- Send a notification.
- Process an uploaded document.

A task is a logical unit of work; it is not necessarily an operating-system thread.

Depending on the runtime, tasks might be executed by threads, processes, an event loop, or another scheduling mechanism.

```text
Application work
│
├── Task A: Fetch profile
├── Task B: Retrieve preferences
└── Task C: Fetch recommendations
```

The runtime determines how these tasks are scheduled and executed.

Two tasks may overlap in time without running simultaneously on separate CPU cores. This is one reason concurrency and parallelism must remain distinct concepts.

### 2.4 Compare the Concepts

| Concept | What it represents | Important property |
|---|---|---|
| Process | A running program instance | Has its own process-level execution environment and address space |
| Thread | An execution path inside a process | Threads in the same process normally share memory |
| Task | A unit of work | Its execution mechanism depends on the runtime |

A useful way to remember the distinction:

- A **task** describes work.
- A **thread** describes an execution path.
- A **process** provides an execution environment.

These are different levels of abstraction, not competing definitions of the same thing.

---

## 3. Independent Execution and Shared-Memory Execution

Concurrency becomes easier to reason about when we ask two questions:

1. Which units of execution can make progress independently?
2. Which data can they access or modify in common?

### 3.1 Independent execution

Two units of execution are independent with respect to a particular operation when neither operation depends on the other's result or intermediate state.

For example, retrieving a user's profile and retrieving public product information may be independent if neither request needs the result of the other.

```text
Task A: Retrieve profile ─────────► Result A
Task B: Retrieve products ────────► Result B
```

Both operations may be eligible to make progress concurrently.

However, independence is contextual. Two tasks may be independent in their calculations but still compete for a shared connection pool, rate limit, database resource, or mutable cache.

Therefore, **logical independence does not guarantee resource independence**.

### 3.2 Shared-memory execution

In shared-memory execution, multiple execution units can access the same memory region or objects.

Consider:

```python
user_preferences = {
    "location": "Bengaluru",
    "max_distance_km": 50,
}
```

If multiple threads access this dictionary, they may read the same values. If one thread modifies a value while another reads it, the second thread may observe a changed state.

The consequences depend on the operations involved and the language's guarantees. Some operations may be safe under specific conditions; others may require synchronization or a different design.

Shared memory is not inherently unsafe. The main risk is **uncontrolled access to mutable shared state**.

### 3.3 Separate memory does not eliminate every concurrency problem

Suppose two worker processes independently calculate the next identifier:

```text
Process A reads stored ID: 100
Process B reads stored ID: 100

Process A calculates: 101
Process B calculates: 101
```

Even if the processes do not share ordinary application memory, both can conflict through a shared database or another external resource.

This is a different coordination problem from two threads modifying one in-memory variable, but the broader lesson is similar: multiple execution units can interact with common state through different mechanisms.

**Do not assume that separate processes make a system free from concurrency problems.**

---

## 4. Understanding Shared State

**State** is information that represents the current condition of a program or system.

Examples include:

- A user's preferences.
- An in-memory cache.
- A request counter.
- A collection of active sessions.
- A task status.
- A database record.

State becomes relevant to concurrency when multiple execution units can observe or influence it.

### 4.1 What makes state shared?

State is shared when multiple execution units can access the same underlying information or can affect the same logical resource.

For example:

```python
active_requests = 0
```

If several threads can read and modify this variable, it is shared mutable state.

By contrast, consider a local variable created and used exclusively within one task:

```python
def calculate_score(profile):
    score = profile["experience"] * 2
    return score
```

If the local `score` is not exposed to other execution units, it does not create the same shared-state problem.

The function may still read shared input data, and the referenced `profile` object might itself be shared. Whether the function is safe depends on the full access pattern, not merely on the variable being local.

### 4.2 Mutable versus immutable state

**Mutable state** can change after creation.

```python
settings = {"language": "en"}
settings["language"] = "hi"
```

**Immutable state** cannot be modified in place after creation, according to the relevant data type's guarantees.

Conceptually:

```text
Mutable object:
Initial state ──► Modified state ──► Modified again

Immutable value:
Value A remains unchanged
A new value B represents the update
```

Immutability can simplify concurrency because readers do not need to account for another execution unit changing that object in place.

However, an immutable object may contain references to mutable objects. A read-only reference also does not necessarily guarantee that the underlying object cannot be changed elsewhere.

**Engineering implication:** Immutability can reduce coordination requirements, but it must be evaluated across the entire object structure and its ownership.

### 4.3 Why shared mutable state is difficult

Imagine two tasks updating a shared balance:

```python
balance = 100

# Task A
balance = balance - 30

# Task B
balance = balance + 20
```

If these are simple sequential assignments, the result is straightforward when Task A completes before Task B:

```text
100 → 70 → 90
```

But concurrent execution may involve separate reads and writes. If both tasks read the original value before either update is committed, the final value may reflect only one update.

This illustrates the central difficulty:

**A shared variable is not automatically a safe coordination mechanism.**

To reason correctly, we need to know:

- Who can read the state?
- Who can modify it?
- Can operations overlap?
- Which operations must behave as one indivisible unit?
- What invariant must always remain true?
- What mechanism guarantees that invariant?

These questions lead directly to race conditions and synchronization, which are covered in later chapters.

---

## 5. Execution Order and Scheduling

Concurrent code does not always execute in one fixed order.

A scheduler or runtime decides when eligible execution units make progress. The exact scheduling behavior depends on the environment and is not generally something application code should assume without an explicit guarantee.

Consider two tasks:

```text
Task A:
1. Read configuration
2. Calculate result

Task B:
1. Update configuration
2. Write configuration
```

A possible execution order is:

```text
A1 → A2 → B1 → B2
```

Another possible order is:

```text
A1 → B1 → B2 → A2
```

If Task A expects the configuration to remain unchanged between steps, these orders can produce different behavior.

The critical question is not whether one schedule is more common. It is whether the program remains correct under every execution order that the runtime permits.

### 5.1 Interleaving

An **interleaving** is one possible ordering of operations from multiple execution units.

For example, suppose incrementing a counter involves three conceptual steps:

```text
1. Read the counter
2. Add one
3. Write the result
```

Two tasks may interleave these steps:

```text
Task A reads 0
Task B reads 0
Task A calculates 1
Task B calculates 1
Task A writes 1
Task B writes 1
```

The counter ends at `1`, even though two increments were requested.

This is a lost-update scenario. It is explored formally in the next chapter.

### 5.2 Correctness must not depend on lucky timing

A concurrent program may appear correct during development because its operations happen to execute in a favorable order.

Under production load, timing can change due to:

- Different request volumes.
- Variable network latency.
- Resource contention.
- Different hardware or runtime behavior.
- Background work.
- Changes in task duration.

These conditions can expose assumptions that were never guaranteed.

A reliable design establishes correctness through explicit rules, not through an expectation that operations will usually happen in a convenient order.

---

## 6. Dependencies Between Tasks

Concurrency is useful only when the dependency structure permits it.

Consider a recommendation workflow:

```text
Task A: Load user profile
Task B: Load user preferences
Task C: Generate recommendations
```

If Task C requires both the profile and preferences, it cannot correctly finish before those inputs are available.

The workflow is better represented as:

```text
Task A ──────┐
             ├────► Task C
Task B ──────┘
```

Tasks A and B may run concurrently if they are independent. Task C must wait until the required results are available.

### 6.1 Independent tasks

```text
A ─────────► Result A
B ─────────► Result B
C ─────────► Result C
```

If the tasks have no relevant dependencies, they may be scheduled concurrently.

### 6.2 Dependent tasks

```text
A ─────► B ─────► C
```

If each task requires the previous task's result, the dependency chain constrains execution.

Adding concurrency does not remove a genuine dependency.

### 6.3 Mixed workflows

Most real systems contain both independent and dependent work:

```text
                 ┌────► Fetch profile ──────┐
Incoming request ┤                          ├────► Build response
                 └────► Fetch preferences ───┘
```

The independent operations can overlap, while response construction waits for both.

This dependency-based view is more useful than attempting to make every operation concurrent.

**Engineering rule:** Identify dependencies before choosing an execution model. Concurrency should follow the structure of the work, not be added indiscriminately.

---

## 7. Shared State in Production Systems

Shared-state problems appear in ordinary backend systems, not only in specialized concurrency experiments.

### 7.1 Request counters

Several requests increment one in-memory counter.

Potential concern: concurrent updates may be lost if the increment operation is not protected by an appropriate guarantee.

Possible design directions include:

- Use a suitable atomic operation.
- Protect the update with synchronization.
- Use an external counting mechanism designed for concurrent updates.
- Avoid maintaining an exact shared counter if approximate metrics are sufficient.

The correct choice depends on whether the counter is a correctness requirement, a metric, or a performance-sensitive hot path.

### 7.2 In-memory caches

Several tasks access a shared cache.

Potential concerns:

- Concurrent writes to the same key.
- Inconsistent state during updates.
- Duplicate expensive computations.
- Cache invalidation races.

A thread-safe container may protect its own internal structure, but that does not necessarily make a multi-step application operation atomic.

For example, "check whether a key exists, then compute and insert its value" may involve several operations whose combined behavior needs separate consideration.

### 7.3 User preferences

One task updates preferences while another generates recommendations.

Potential concern: the recommendation task might observe an inconsistent combination of old and new preference values if updates are not coordinated.

Possible design directions include:

- Use immutable snapshots of preferences.
- Pass a consistent preference object into the recommendation task.
- Coordinate reads and writes around a defined invariant.
- Store and retrieve versioned state where appropriate.

### 7.4 Database records

Multiple workers update the same database record.

Potential concern: one update may overwrite another or violate a business invariant.

The solution may require database transactions, conditional updates, optimistic concurrency controls, or other database-level mechanisms.

An in-process thread lock is not a complete solution when multiple application processes or machines can update the same record. The coordination mechanism must operate at the scope where the shared state exists.

This is an important architectural distinction:

**Choose the coordination mechanism according to the boundary of the shared resource.**

---

## 8. A Practical Method for Analyzing an Execution Model

When reviewing a concurrent design, work through these questions in order.

### Step 1: Identify the units of work

List the logical tasks the system performs.

Example:

```text
A. Retrieve profile
B. Retrieve preferences
C. Calculate candidate scores
D. Persist the result
```

### Step 2: Identify dependencies

Ask which tasks require outputs from other tasks.

For example, candidate scoring may require both profile and preference data.

### Step 3: Identify shared resources

Look beyond local variables. Include:

- In-memory objects.
- Caches.
- Database records.
- Files.
- External service quotas.
- Connection pools.
- Shared queues.

### Step 4: Identify mutation

For every shared resource, determine whether tasks only read it or can modify it.

Read-only access to a genuinely immutable snapshot is usually easier to reason about than concurrent mutation.

### Step 5: Identify required invariants

An **invariant** is a condition that must remain true for the system to be correct.

Examples:

- A balance must not become negative unless overdrafts are allowed.
- A request identifier must remain unique.
- A task must not be marked complete before its result is committed.
- A preference update must not produce an invalid combination of fields.

### Step 6: Choose the coordination boundary

Determine where the invariant must be protected:

- Within one task.
- Between threads in one process.
- Between processes.
- Across multiple application instances.
- At a shared database or external service.

The coordination mechanism must cover all execution units capable of violating the invariant.

### Step 7: Validate correctness under different schedules

Do not test only the expected execution order. Consider how operations could interleave and whether the design still preserves its invariants.

Detailed concurrency failure investigation is covered in ENG-10.09. General debugging and testing practices remain within ENG-08.

---

## 9. Common Mistakes

### Mistake 1: Treating tasks, threads, and processes as synonyms

They represent different concepts. A task can be executed by a thread, but a task is not itself necessarily a thread.

**Correction:** Describe the unit of work separately from the mechanism that executes it.

### Mistake 2: Assuming separate processes cannot have concurrency conflicts

Separate processes generally have separate address spaces, but they can still modify the same database record, file, or external resource.

**Correction:** Identify shared logical resources, not just shared memory.

### Mistake 3: Assuming a shared object is safe because the language provides a thread-safe container

Container-level safety does not necessarily guarantee that a sequence of application operations is atomic or that business invariants are preserved.

**Correction:** Define the invariant and examine the complete operation.

### Mistake 4: Assuming local variables eliminate every shared-state risk

A local variable may refer to a shared mutable object. A function may also modify state through a database, cache, or other external resource.

**Correction:** Trace object references and side effects, not only variable scope.

### Mistake 5: Making every operation concurrent

Some tasks depend on previous results. Other tasks compete for limited resources, so adding concurrency can increase contention without improving throughput.

**Correction:** Model dependencies and resource constraints before introducing concurrency.

### Mistake 6: Assuming execution order is deterministic

A favorable order during testing does not establish a guarantee.

**Correction:** Design for the permitted execution orders and protect the required invariants.

### Mistake 7: Using a thread lock to protect state shared across machines

A typical in-process lock coordinates only the execution units that share that lock instance. It cannot, by itself, coordinate independent application instances.

**Correction:** Match the coordination mechanism to the scope of the shared resource.

---

## 10. Interview Questions

### Q1. What is the difference between a process, a thread, and a task?

**Expected answer:**

A process is a running program instance with its own process-level environment and address space. A thread is an execution path within a process. A task is a logical unit of work whose execution mechanism depends on the runtime.

### Q2. Why can threads introduce shared-state risks?

**Expected answer:**

Threads in the same process normally share memory. If multiple threads access and modify the same object without suitable coordination, their operations may overlap and produce unexpected results.

### Q3. Does using multiple processes eliminate concurrency problems?

**Expected answer:**

No. Separate processes generally have separate address spaces, but they can still interact with shared databases, files, queues, and external services. Those resources may require coordination.

### Q4. What is shared mutable state?

**Expected answer:**

It is information that multiple execution units can access and that can be modified. Concurrent access to such state requires careful reasoning about visibility, operation ordering, and preservation of invariants.

### Q5. Why does execution order matter?

**Expected answer:**

Concurrent operations can interleave in different ways. If correctness depends on a particular ordering that is not guaranteed, different schedules can produce different results.

### Q6. How does immutability help concurrent systems?

**Expected answer:**

Immutable data cannot be modified in place, reducing the possibility that one execution unit changes a value while another relies on it. However, nested mutable objects and external side effects still need consideration.

### Q7. Can two independent tasks still contend with each other?

**Expected answer:**

Yes. They may be logically independent but compete for shared resources such as database connections, CPU time, network capacity, rate limits, or a shared cache.

### Q8. How would you decide whether two tasks can execute concurrently?

**Expected answer:**

Identify their data dependencies, shared resources, side effects, and required invariants. If neither task requires the other's result and their resource interactions can be handled safely, they may be eligible for concurrent execution.

### Q9. Why is a thread-safe data structure not always sufficient?

**Expected answer:**

The data structure may protect its internal operations, but a sequence of operations performed by application code can still have race conditions or violate a business invariant.

### Q10. What should determine the scope of a synchronization mechanism?

**Expected answer:**

The scope of the shared state and all execution units capable of modifying it. A local lock may protect threads within one process but cannot automatically coordinate independent processes or machines.

---

## 11. Quick Revision

- A process is an executing program instance.
- A thread is an execution path within a process.
- A task is a logical unit of work.
- Threads in one process normally share memory.
- Separate processes generally have separate address spaces but may access the same external resources.
- Shared state is information that multiple execution units can access or affect.
- Mutable shared state requires careful coordination.
- Scheduling determines when eligible execution units make progress.
- Interleaving can change the outcome of operations that are not safely coordinated.
- Task dependencies constrain which work can run concurrently.
- Logical independence does not guarantee independence from resource contention.
- The coordination mechanism must cover the scope of the shared resource and the invariant being protected.

---

## 12. Key Takeaways

The central challenge of concurrency is not simply running multiple tasks. It is preserving correctness while work progresses through an execution environment that may permit different operation orderings.

Processes, threads, and tasks describe different aspects of execution. Shared memory makes communication convenient but can make concurrent mutation difficult to reason about. Separate processes provide memory isolation but do not eliminate conflicts over external resources.

Before choosing a concurrency model:

1. Identify units of work.
2. Map their dependencies.
3. Locate shared resources.
4. Identify mutable state and required invariants.
5. Select a coordination mechanism appropriate to the resource boundary.
6. Verify that correctness does not depend on an accidental execution order.

These ideas prepare us to study race conditions and data races in the next chapter.

---

## 13. Further Reading

- [Python threading documentation](https://docs.python.org/3/library/threading.html) — Python's thread-based execution facilities.
- [Python multiprocessing documentation](https://docs.python.org/3/library/multiprocessing.html) — Process-based execution and communication.
- [Python asyncio documentation](https://docs.python.org/3/library/asyncio.html) — Asynchronous programming and task coordination.

These resources provide language-specific examples. This chapter's concepts are intended to remain applicable beyond Python.

---

## End of Document

This completes the Markdown file: `02-Execution-Models-and-Shared-State.md`.
