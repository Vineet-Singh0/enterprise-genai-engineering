
# Concurrency Failure Analysis

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why concurrency failures are often difficult to reproduce.
- Distinguish common concurrency failure symptoms using observable evidence.
- Analyze task interleavings to identify incorrect execution sequences.
- Build small execution traces to reason about timing-sensitive bugs.
- Investigate race conditions, deadlocks, starvation, and livelocks systematically.
- Design controlled experiments that increase the likelihood of reproducing a failure.
- Separate the root cause of a concurrency failure from its visible symptoms.
- Apply a disciplined investigation workflow without relying on random debugging changes.

## Prerequisites

You should understand the concepts covered in:

- [Concurrency Fundamentals](01-Concurrency-Fundamentals.md)
- [Execution Models and Shared State](02-Execution-Models-and-Shared-State.md)
- [Race Conditions and Data Races](03-Race-Conditions-and-Data-Races.md)
- [Synchronization Fundamentals](04-Synchronization-Fundamentals.md)
- [Deadlocks and Related Problems](05-Deadlocks-and-Related-Problems.md)
- [Thread Safety and Safe Shared-State Design](06-Thread-Safety-and-Safe-Shared-State-Design.md)
- [Communication and Coordination Between Tasks](07-Communication-and-Coordination-Between-Tasks.md)
- [Concurrency Models and Practical Trade-offs](08-Concurrency-Models-and-Practical-Trade-offs.md)

General debugging and testing techniques belong to the engineering testing and debugging documentation. This chapter focuses specifically on reasoning about concurrency failures.

**Estimated reading time:** 30–40 minutes.

---

## 1. Why Concurrency Failures Are Difficult to Debug

A sequential program usually follows a relatively predictable execution order. When an input produces an incorrect result, the investigation can often focus on the statements executed along that path.

Concurrent programs introduce another dimension: the order in which tasks execute and interact.

Consider a shared counter:

```python
counter = 0

def increment():
    global counter

    current = counter
    updated = current + 1
    counter = updated
```

Suppose two tasks execute `increment()` concurrently.

The intended result is:

```text
Initial counter = 0
Task A increments
Task B increments
Final counter = 2
```

However, a possible execution is:

```text
Task A: Read counter -> 0
Task B: Read counter -> 0
Task A: Calculate 1
Task B: Calculate 1
Task A: Write 1
Task B: Write 1
```

The final result is `1`, not `2`.

The individual operations may appear correct when inspected separately. The failure emerges from their interaction.

### 1.1 Four properties that complicate investigation

Concurrency failures are difficult because:

1. **Execution order varies.** The scheduler may choose different interleavings across runs.
2. **Timing changes behavior.** Logging, breakpoints, network delays, or machine load can alter execution timing.
3. **Failures may depend on rare conditions.** A particular interleaving might occur only occasionally.
4. **Symptoms may appear far from the cause.** A corrupted value may be detected several operations after the incorrect update.

A production incident might therefore show an invalid account balance, a missing job, or a request that never completes without immediately revealing the responsible concurrency defect.

### Engineering principle

Do not assume that a bug disappearing during debugging means the bug has been fixed. The investigation itself may have changed the execution schedule.

---

## 2. Recognizing Common Concurrency Failure Symptoms

Start with observable behavior, then construct hypotheses about possible causes.

| Observable symptom | Possible causes | Evidence to investigate |
|---|---|---|
| An operation appears to be lost | Race condition, unsynchronized update | Concurrent updates, operation counts, state transitions |
| Data occasionally becomes inconsistent | Shared-state race, broken invariant | Related fields, update ordering, transaction boundaries |
| Requests stop making progress | Deadlock, blocked dependency, exhausted resources | Thread or task states, lock ownership, dependency waits |
| Some tasks wait indefinitely while others continue | Starvation, unfair scheduling, resource contention | Per-task progress, resource acquisition patterns |
| Tasks repeatedly retry without progress | Livelock, retry feedback loop | Repeated state transitions, retry counts, completion rates |
| Latency rises sharply under load | Contention, oversubscription, queue growth, resource exhaustion | Queue depth, lock wait time, worker utilization |
| A failure occurs only under high concurrency | Timing-sensitive race, capacity problem, ordering defect | Load levels, interleavings, resource limits |
| Duplicate work or repeated side effects occur | Coordination failure, retries, missing idempotency | Message delivery, retry behavior, operation identifiers |

These symptoms are clues, not proof.

For example, a request that never completes could result from a deadlock, but it could also be waiting for a remote service that has stopped responding. Before concluding that a lock is responsible, establish what the task is waiting for.

### 2.1 Separate symptoms from causes

Consider a service with the following incident:

```text
Symptom:
  API latency increases.

Observation:
  Requests spend most of their time waiting.

Initial hypothesis:
  Lock contention.

Alternative hypotheses:
  Database connection pool exhaustion.
  A slow external dependency.
  Queue backlog.
  Worker starvation.
```

The observation narrows the investigation, but the cause remains unproven.

A good investigation gathers evidence that distinguishes competing hypotheses rather than immediately modifying synchronization code.

---

## 3. Build an Execution Trace

An execution trace records important operations in the order they occur within each task.

For concurrency debugging, the most useful traces often include:

- Task or thread identity.
- Operation being performed.
- Relevant state before and after the operation.
- Resource or lock being acquired or released.
- Message, request, or transaction identifier.
- Whether the task is running, waiting, blocked, or complete.

The goal is not to record everything. It is to capture enough information to reconstruct the interactions that matter.

### 3.1 Example: Lost update

Assume a shared inventory counter starts at `10`.

Two tasks attempt to reserve one item each.

Each reservation follows these steps:

```text
1. Read available inventory.
2. Check that inventory is greater than zero.
3. Decrease inventory by one.
4. Save the result.
```

A possible trace is:

| Step | Task A | Task B | Inventory |
|---|---|---|---:|
| 1 | Read inventory: 10 | — | 10 |
| 2 | — | Read inventory: 10 | 10 |
| 3 | Check inventory is positive | — | 10 |
| 4 | — | Check inventory is positive | 10 |
| 5 | Calculate 9 | — | 10 |
| 6 | — | Calculate 9 | 10 |
| 7 | Write 9 | — | 9 |
| 8 | — | Write 9 | 9 |

Both tasks report a successful reservation, but the stored inventory decreases by only one.

The key defect is not the arithmetic. It is that the check and update do not form one atomic operation.

A suitable correction must protect the complete reservation invariant. Depending on the architecture, this could involve a lock, an atomic operation, a database transaction with an appropriate concurrency-control strategy, or another mechanism that makes the check and update indivisible from the perspective of competing reservations.

Simply making the final assignment atomic does not necessarily make the entire reservation safe.

### 3.2 Use partial orders, not imagined total orders

A trace must distinguish between operations whose ordering is known and operations whose relative ordering is uncertain.

For example:

```text
Task A:
  A1: Read shared state
  A2: Calculate new value
  A3: Write shared state

Task B:
  B1: Read shared state
  B2: Calculate new value
  B3: Write shared state
```

Within each task, program order constrains the sequence:

```text
A1 -> A2 -> A3
B1 -> B2 -> B3
```

But without additional synchronization, the relative order of A's operations and B's operations may vary.

A valid execution might be:

```text
A1 -> B1 -> A2 -> B2 -> A3 -> B3
```

Another might be:

```text
A1 -> A2 -> A3 -> B1 -> B2 -> B3
```

The first may produce a lost update; the second may not.

**Important:** A trace is a model of one execution, not proof that all executions behave correctly. The investigation must identify which other interleavings are possible and whether they preserve the required invariants.

---

## 4. Investigate Race Conditions Systematically

A race condition occurs when correctness depends on the timing or ordering of concurrent operations. A data race is a more specific problem involving conflicting unsynchronized memory accesses under a memory model that defines such accesses as a data race.

See [Race Conditions and Data Races](03-Race-Conditions-and-Data-Races.md) for the distinction.

### 4.1 A practical investigation method

When suspecting a race:

1. **Identify the shared state.** Which variables, objects, records, or external resources are accessed concurrently?
2. **List all writers.** Which tasks can modify the state?
3. **List the readers.** Which tasks inspect that state before deciding what to do?
4. **Identify compound operations.** Does correctness depend on a sequence of reads, checks, calculations, and writes?
5. **State the invariant.** What must always remain true?
6. **Construct a conflicting interleaving.** Can two tasks observe the same old state and then overwrite each other's work?
7. **Find the synchronization boundary.** What mechanism prevents the invalid interleaving?
8. **Validate the correction.** Test both the reported failure and the invariant under concurrent execution.

### 4.2 Example: Duplicate job processing

Imagine two workers processing a queued job.

The intended rule is:

> A job must be claimed by at most one worker at a time.

A flawed design might perform:

```text
Worker A:
  Read job status -> pending

Worker B:
  Read job status -> pending

Worker A:
  Set job status -> processing

Worker B:
  Set job status -> processing

Worker A:
  Execute job

Worker B:
  Execute job
```

The problem is the gap between checking the job status and claiming the job.

Possible corrections include:

- Atomically claim the job through a database operation.
- Use a transaction and an appropriate locking or conditional-update strategy.
- Use a queue that provides the required delivery and claiming semantics.
- Make the operation idempotent where duplicate execution is possible.

The choice depends on the system's guarantees and failure model. A queue alone does not automatically guarantee that a side effect executes exactly once.

### 4.3 When the evidence is incomplete

Do not immediately add a lock around every suspected operation.

First determine:

- Which invariant is being violated?
- Which operations must be coordinated?
- Which tasks actually share the state?
- Is the failure inside the process, in a database, or across distributed services?
- Could a transaction, atomic conditional update, ownership model, or message-passing design provide a more appropriate guarantee?

The fix should protect the invariant, not merely suppress one observed interleaving.

---

## 5. Investigate Deadlocks and Stalled Tasks

A deadlock occurs when tasks cannot proceed because each is waiting for a condition that depends on progress that will never occur.

The investigation must identify the waiting dependencies.

### 5.1 Construct a wait-for graph

Suppose two tasks acquire two locks in opposite orders.

```text
Task A:
  Acquires Lock 1
  Waits for Lock 2

Task B:
  Acquires Lock 2
  Waits for Lock 1
```

The dependency graph is:

```text
Task A -> Lock 2 -> Task B -> Lock 1 -> Task A
```

The cycle indicates a deadlock possibility: each task holds a resource needed by the other.

For a real incident, collect evidence such as:

- Which task is waiting?
- Which resource is it waiting for?
- Which task owns that resource?
- What other resources does the owner hold?
- Is the owner waiting for another resource?
- Does the dependency chain eventually return to the original task?

A cycle in the wait-for graph is strong evidence of deadlock when the represented waits and resource ownership are accurate.

### 5.2 Distinguish deadlock from other stalls

Not every stalled task is deadlocked.

| Condition | Diagnostic clue |
|---|---|
| Deadlock | A circular dependency prevents the involved tasks from progressing. |
| Starvation | A task repeatedly fails to obtain a resource or execution opportunity while other work progresses. |
| Slow dependency | A task is waiting on an operation that may eventually complete. |
| Resource exhaustion | Work cannot proceed because a necessary capacity limit has been reached. |
| Queue backlog | Tasks may be progressing, but incoming work exceeds processing capacity. |

A snapshot showing many waiting threads does not by itself prove deadlock. Establish the dependency structure and determine whether progress is possible.

### 5.3 A useful production investigation

Suppose an API service stops responding, but CPU utilization is low.

A disciplined investigation might be:

1. Capture thread or task states.
2. Identify which requests have stopped making progress.
3. Find the locks, futures, queues, connections, or external operations they are waiting on.
4. Trace ownership and dependencies.
5. Check whether the dependency graph contains a cycle.
6. Determine whether the same condition recurs across multiple snapshots.
7. Identify the code path responsible for the dependency.
8. Correct the coordination design and test the relevant failure scenario.

Repeated snapshots help distinguish a stable deadlock from a temporarily slow operation.

The correction might require consistent lock ordering, reduced lock scope, a timeout with a recovery strategy, or a redesigned coordination protocol. A timeout alone does not resolve every deadlock: it may merely convert an indefinite wait into an error.

For the underlying conditions and prevention strategies, see [Deadlocks and Related Problems](05-Deadlocks-and-Related-Problems.md).

---

## 6. Investigate Starvation and Livelock

Starvation and livelock can resemble deadlock because useful work is not completing. The key difference is what the tasks are doing.

### 6.1 Starvation

A task is starved when it repeatedly fails to obtain the resources or execution opportunities it needs, even though other tasks continue making progress.

Example:

```text
Task A repeatedly acquires a shared lock.
Task B repeatedly attempts to acquire the same lock.
Task A continues completing work.
Task B rarely or never acquires the lock.
```

Useful evidence includes:

- Per-task completion counts.
- Lock acquisition and wait times.
- Queue positions and scheduling behavior.
- Whether one class of requests consistently waits longer than others.
- Whether throughput remains healthy while individual tasks fail to progress.

Possible remedies include fairer scheduling or resource allocation, shorter critical sections, reduced contention, or a change in the work-partitioning strategy.

Fairness is not free. A fairer mechanism may reduce throughput or increase coordination overhead, so the remedy should match the service's requirements.

### 6.2 Livelock

A livelock occurs when tasks remain active and repeatedly react to each other but fail to make useful progress.

Example:

```text
Task A detects a conflict and backs off.
Task B detects a conflict and backs off.

Task A retries.
Task B retries at nearly the same time.

Both detect the conflict again.
Both back off again.
```

The tasks are not necessarily blocked. They are performing work, but the system does not advance toward completion.

Useful evidence includes:

- Repeated state transitions.
- High retry counts with few successful operations.
- Frequent conflict detection.
- Similar retry timing across competing tasks.
- Resource utilization without corresponding completed work.

Potential remedies include randomized backoff, bounded retries, conflict serialization, or a coordination protocol that prevents tasks from repeatedly making the same conflicting decisions.

Randomized backoff can help break synchronized retry patterns, but it is not a substitute for validating the underlying protocol.

### 6.3 Diagnostic distinction

Ask two questions:

1. Are the tasks blocked while waiting for progress? Investigate deadlock and external dependencies.
2. Are the tasks active but failing to advance? Investigate livelock, repeated retries, and contention.

Then ask whether the problem affects every task or disproportionately affects particular tasks. That distinction helps separate global deadlock from starvation.

---

## 7. Reproduce Timing-Sensitive Failures

The objective of reproduction is not merely to make a failure happen. It is to create a controlled experiment that tests a specific hypothesis.

### 7.1 Start with the smallest plausible scenario

Suppose a production defect involves two workers updating a shared counter.

Instead of immediately reproducing the entire service:

1. Isolate the shared-state operation.
2. Create a small test with two or more competing tasks.
3. Define the expected invariant.
4. Introduce controlled coordination points.
5. Run the scenario repeatedly.
6. Record the actual outcomes.
7. Change one relevant condition at a time.

A smaller test reduces unrelated behavior and makes the execution easier to reason about.

### 7.2 Use barriers and events deliberately

A barrier or event can coordinate tasks so they reach particular points at predictable times.

The following Python example uses a barrier to make two threads read the same value before either writes the result.

```python
import threading

counter = 0
read_barrier = threading.Barrier(2)

def increment():
    global counter

    current = counter
    read_barrier.wait()

    updated = current + 1
    counter = updated

threads = [
    threading.Thread(target=increment),
    threading.Thread(target=increment),
]

for thread in threads:
    thread.start()

for thread in threads:
    thread.join()

print(counter)
```

Under normal CPython execution, this deliberately coordinated example can demonstrate a lost update: both threads read the same initial value, synchronize at the barrier, and then write the same incremented value.

The expected value is `2`, but the observed value can be `1`.

This example is intended to demonstrate interleaving, not to serve as a production counter implementation. The exact behavior of concurrent memory access depends on the runtime and memory model. In particular, do not infer that the Global Interpreter Lock makes arbitrary multi-step operations logically atomic.

### 7.3 Make the reproduction meaningful

A useful concurrency test should specify:

- **Preconditions:** Initial state and relevant resource configuration.
- **Concurrent actors:** Number and type of tasks.
- **Controlled points:** Where the test forces tasks to meet or pause.
- **Expected invariant:** What must always remain true.
- **Failure condition:** The precise result that indicates a defect.
- **Repetition strategy:** How the test explores repeated executions or varied schedules.

Prefer assertions about correctness over assertions about timing.

For example:

```python
assert counter == number_of_successful_increments
```

is generally more meaningful than asserting that a task finishes within an extremely small fixed duration on every machine.

### 7.4 Do not confuse forced interleavings with production probability

A barrier deliberately creates a particular execution sequence. This is valuable because it can demonstrate that the implementation is vulnerable to that sequence.

However, a forced interleaving does not tell you how often the same sequence occurs in production.

Use controlled tests to validate correctness properties, and use production telemetry to understand real-world frequency, impact, and operating conditions.

---

## 8. Design Tests Around Invariants

A concurrency test should verify the system's required properties rather than only checking one expected execution sequence.

An invariant is a condition that must remain true throughout the relevant operation or system state.

Examples:

- Inventory must never become negative.
- A job must not be claimed by two workers simultaneously.
- A completed payment must not be applied twice.
- A shared counter must equal the number of successful increments.
- A resource must not be released by a task that does not own it.
- A workflow must eventually complete under its stated assumptions.

### 8.1 Safety and liveness

Two useful categories are:

**Safety properties:** Something bad never happens.

Examples:
- Two workers do not simultaneously own an exclusive claim.
- Inventory does not fall below zero.
- A protected invariant is not violated.

**Liveness properties:** Something good eventually happens, assuming the required conditions hold.

Examples:
- A queued task eventually receives processing capacity.
- A waiting request eventually succeeds or fails with a defined result.
- A lock is eventually released by its owner.

These properties require different evidence. A test that proves a counter never becomes negative does not establish that every waiting task eventually progresses.

### 8.2 Test relevant failure scenarios

For a shared inventory reservation, consider testing:

```text
Scenario A:
  One reservation against one available item.

Scenario B:
  Two concurrent reservations against one available item.

Scenario C:
  Many concurrent reservations against a limited inventory.

Scenario D:
  A worker fails after claiming a reservation.

Scenario E:
  A request is retried after an uncertain response.
```

Each scenario tests a different property. Scenario B tests competing claims; Scenario D tests recovery; Scenario E tests duplicate side effects and idempotency.

Do not assume that passing one high-concurrency test establishes complete correctness. Different execution paths and failure points may expose different defects.

---

## 9. Use Observability Without Hiding the Failure

Logs, metrics, traces, and diagnostic snapshots help reconstruct concurrent behavior. They can also change execution timing or create excessive overhead.

### 9.1 Log causal context

For operations that share state or coordinate tasks, useful fields may include:

```text
timestamp
request_id
task_id
operation
resource_id
state_before
state_after
wait_duration
retry_count
outcome
```

Choose fields based on the suspected failure. Recording every field for every operation can produce excessive volume and obscure important evidence.

For sensitive systems, avoid logging secrets or unnecessary personal data.

### 9.2 Use metrics to detect patterns

Useful signals include:

- Lock wait duration and contention.
- Number of active, blocked, and completed tasks.
- Queue depth and time spent waiting in queues.
- Task completion and failure rates.
- Retry counts and conflict rates.
- Latency percentiles.
- Resource-pool utilization.
- Work started versus work completed.

Interpret metrics together.

For example, rising queue depth combined with stable worker throughput suggests a different problem from rising queue depth combined with collapsing worker throughput and high lock wait time.

### 9.3 Treat tracing carefully

A distributed trace can help connect a request to its downstream operations. It may reveal that a request is waiting on a database, queue, or remote service rather than on an in-process lock.

However, a trace that shows sequential spans does not necessarily establish the ordering of all concurrent operations. Correlation identifiers and event ordering must be interpreted according to what the instrumentation actually guarantees.

### 9.4 Beware of observer effects

Adding logs, breakpoints, sleeps, or extra synchronization may alter the execution schedule.

Use instrumentation to gather evidence, but validate the fix independently of the instrumentation that exposed the problem.

---

## 10. A Repeatable Concurrency Investigation Workflow

Use the following workflow during a debugging session or production incident.

### Step 1: Define the failure precisely

Replace vague descriptions such as "the system hangs" with observable facts.

For example:

```text
Three API requests remain incomplete.
CPU utilization is low.
The requests are waiting for a shared resource.
The condition began after concurrent traffic increased.
```

Avoid including assumptions as if they were observations.

### Step 2: Identify the affected invariant

What should the system guarantee?

Examples:

- Each job is claimed by at most one worker.
- Each successful reservation decrements inventory exactly once.
- Every request either completes or reaches a defined failure outcome.

Without a clear invariant, it is difficult to determine whether a behavior is incorrect.

### Step 3: Gather a minimal evidence set

Capture only what is needed to distinguish likely explanations:

- Relevant logs and correlation identifiers.
- Task or thread states.
- Shared-state transitions.
- Resource ownership and waiting dependencies.
- Queue and resource-pool metrics.
- Recent changes to concurrency or coordination logic.

### Step 4: Construct competing hypotheses

For a stalled service:

```text
H1: Deadlock between two locks.
H2: Database connection pool exhaustion.
H3: Remote dependency timeout.
H4: Worker starvation caused by long-running tasks.
```

Write down what evidence would support or weaken each hypothesis.

### Step 5: Reconstruct the relevant execution

Use the trace and resource dependencies to determine what happened.

For a suspected race, reconstruct the reads, checks, and writes.

For a suspected deadlock, reconstruct resource ownership and wait dependencies.

For suspected starvation or livelock, examine whether useful progress is occurring and which tasks are affected.

### Step 6: Build a controlled reproduction

Create the smallest scenario that exercises the suspected interaction. Force the relevant interleaving when possible and record the invariant that should hold.

### Step 7: Correct the design

Prefer a correction that addresses the root cause:

- Make compound state transitions atomic.
- Establish a consistent lock-ordering rule.
- Reduce unnecessary shared mutable state.
- Introduce explicit ownership or message-based coordination.
- Add bounded retries and a recovery protocol.
- Correct resource capacity or backpressure when the problem is overload.

The appropriate solution depends on the established cause, not just the initial symptom.

### Step 8: Validate the correction

Check that:

- The original failure no longer occurs under the controlled scenario.
- The invariant holds under concurrent execution.
- Other relevant interleavings remain safe.
- Recovery behavior is correct when tasks fail.
- Performance and resource consumption remain acceptable.
- The test does not depend on a particular machine speed or incidental delay.

### Step 9: Preserve the learning

Add a regression test, document the invariant, and record the concurrency assumption that was violated.

If the defect revealed a design-level problem, update the design or code review guidance rather than relying solely on one test.

---

## 11. Common Investigation Mistakes

### Mistake 1: Adding arbitrary sleeps

A developer inserts a short delay to make a race disappear.

**Why this is weak:** A delay changes timing but does not establish a correctness guarantee. A different machine or workload may produce another interleaving.

**Better approach:** Identify the unsafe operation sequence and introduce an appropriate synchronization or ownership strategy.

### Mistake 2: Assuming the GIL prevents races

A developer concludes that Python code cannot have concurrency defects because CPython has a Global Interpreter Lock.

**Why this is weak:** The GIL does not make arbitrary sequences of operations atomic. Threads can interleave between operations, and concurrent tasks can interact through I/O, shared resources, and external systems. Other Python runtimes may have different execution properties.

**Better approach:** Analyze the invariant and the complete operation that must be coordinated.

### Mistake 3: Treating every hang as a deadlock

A service stops responding, so the team immediately changes lock handling.

**Why this is weak:** The cause may be a blocked network request, resource exhaustion, or starvation.

**Better approach:** Establish the wait dependency and look for a circular dependency before diagnosing deadlock.

### Mistake 4: Fixing the observed schedule only

A developer adds a condition that prevents the exact interleaving seen in one log.

**Why this is weak:** Another valid interleaving may still violate the same invariant.

**Better approach:** Identify the invariant and examine all relevant conflicting operations.

### Mistake 5: Logging everything

The team enables detailed logging across every operation.

**Why this is weak:** High logging volume increases overhead, can change timing, and makes relevant evidence harder to find.

**Better approach:** Instrument the suspected shared state, coordination boundaries, and resource waits first.

### Mistake 6: Treating stress-test success as proof

A test runs one million iterations without observing a failure.

**Why this is weak:** The tested executions may not include the interleaving or failure condition that causes the defect.

**Better approach:** Combine repeated testing with explicit invariant checks, controlled interleavings, and reasoning about the concurrency design.

### Mistake 7: Ignoring recovery paths

A lock or queue behaves correctly during normal execution, so the design is considered safe.

**Why this is weak:** Failures during resource ownership, message delivery, or external side effects can leave state inconsistent or work permanently stuck.

**Better approach:** Test task failure, cancellation, timeout, retries, and recovery at the relevant coordination boundaries.

---

## 12. Production Engineering Perspective

Concurrency failure analysis is not limited to debugging application code. In production, failures often cross process and service boundaries.

Consider an order-processing system:

```text
API
 |
 v
Order database
 |
 v
Message queue
 |
 v
Worker pool
 |
 v
Payment provider
```

A customer submits an order. The API records it, a message is published, a worker processes the message, and a payment provider performs an external operation.

A duplicate charge could result from several distinct problems:

- The same message was delivered more than once.
- Two workers claimed the same order.
- A worker retried after a timeout without knowing whether the payment succeeded.
- The payment succeeded, but the local database update failed.
- The system lacked an idempotency mechanism at the external side-effect boundary.

These causes require different remedies.

A local mutex may protect in-process state, but it cannot by itself coordinate every worker across multiple machines or guarantee that a remote payment executes exactly once.

A production investigation should identify the boundary where the guarantee failed, then choose a mechanism that operates at that boundary. Depending on the system, that may include atomic database transitions, idempotency keys, durable message processing, explicit state machines, or reconciliation workflows.

### 12.1 Design for diagnosis before an incident

Production-ready concurrency design should make important state transitions observable.

For each critical operation, consider documenting:

- The invariant being protected.
- The component that owns the state.
- The operation that commits the transition.
- The synchronization or coordination guarantee.
- The expected behavior during retries and failures.
- The evidence available when the transition does not complete.

This information reduces the time needed to move from a symptom to a testable hypothesis.

---

## 13. Interview Questions and Answers

### Q1. Why are concurrency bugs difficult to reproduce?

Because their occurrence may depend on task scheduling, timing, resource contention, and specific interleavings. Changes to timing during debugging can make the failure disappear without fixing its cause.

### Q2. What is the difference between an observation and a hypothesis during debugging?

An observation is evidence directly collected from the system, such as a task waiting on a lock. A hypothesis is a proposed explanation, such as a deadlock between two tasks. An investigation tests the hypothesis against further evidence.

### Q3. How would you investigate a suspected lost update?

Identify the shared state and its invariant, list concurrent readers and writers, reconstruct the read-modify-write sequence, and determine whether competing tasks can read the same old value before overwriting each other's changes. Then reproduce the interaction and test a correction that makes the required transition safe.

### Q4. How would you distinguish deadlock from starvation?

A deadlock involves a dependency cycle that prevents the involved tasks from progressing. Starvation occurs when a task repeatedly fails to obtain resources or execution opportunities while other tasks may continue to make progress. Task states, ownership, dependency graphs, and per-task progress help distinguish them.

### Q5. Why might a concurrency bug disappear after adding logging?

Logging changes execution timing and resource usage. The modified schedule may no longer trigger the vulnerable interleaving. The defect may still exist.

### Q6. How can you test a rare concurrency failure?

Reduce the scenario to the relevant operations, define an invariant, and use barriers or events to control important interleavings. Repeat the test under relevant conditions and inspect outcomes. Use production evidence to understand real-world frequency rather than treating a forced test schedule as a frequency estimate.

### Q7. Why is a successful stress test insufficient proof of correctness?

A stress test explores only the executions that actually occur during the test. It may never exercise a vulnerable interleaving or recovery path. Correctness also requires reasoning about invariants, synchronization guarantees, and relevant failure scenarios.

### Q8. How would you investigate an API that hangs while CPU usage remains low?

Collect task or thread states, inspect resource waits, and trace the dependency chain. Check for lock cycles, exhausted connection pools, blocked external calls, and queue or worker bottlenecks. Use evidence to identify the cause before changing the implementation.

### Q9. What is the difference between forcing an interleaving and proving a race exists?

Forcing an interleaving deliberately creates an execution order for testing. If that execution violates the required invariant, it demonstrates a correctness defect for that scenario. A complete investigation still needs to establish which operations can interleave in the target runtime and whether the proposed correction protects the invariant.

### Q10. What should a concurrency regression test verify?

It should verify the required safety or liveness property under relevant concurrent conditions, including applicable failure and recovery paths. It should not rely only on a particular execution order, machine speed, or arbitrary sleep duration.

---

## 14. Quick Revision

- Concurrency failures often emerge from interactions between individually valid operations.
- Timing changes can hide a bug without correcting it.
- A trace records important events; a wait-for graph records resource dependencies.
- A race investigation should identify shared state, conflicting operations, and the violated invariant.
- Deadlock investigation focuses on blocked dependencies and cycles.
- Starvation investigation focuses on unfair or unsuccessful access to required resources.
- Livelock investigation focuses on active behavior that fails to make useful progress.
- Barriers and events can help reproduce specific interleavings.
- Controlled tests should assert invariants rather than depend on incidental timing.
- Logging and tracing provide evidence but can influence execution.
- Stress testing is valuable but does not prove complete concurrency correctness.
- Production systems require investigation across process, database, queue, and service boundaries.
- A reliable fix addresses the underlying guarantee, not just the observed symptom.

---

## 15. Key Takeaways

1. **Start with evidence.** Describe what happened before explaining why it happened.
2. **Define the invariant.** Correctness must be expressed as a property that can be checked.
3. **Reconstruct the interaction.** Examine the sequence of state transitions and resource dependencies.
4. **Use controlled reproduction.** Make the suspected failure easier to trigger without confusing the test with real-world frequency.
5. **Investigate the correct boundary.** A local lock cannot solve every distributed coordination problem.
6. **Validate the design, not only the example.** The fix must protect the invariant across relevant interleavings and failure paths.
7. **Make systems diagnosable.** Observable state transitions and explicit coordination guarantees make production incidents easier to investigate.

---

## Further Reading

- [Race Conditions and Data Races](03-Race-Conditions-and-Data-Races.md)
- [Synchronization Fundamentals](04-Synchronization-Fundamentals.md)
- [Deadlocks and Related Problems](05-Deadlocks-and-Related-Problems.md)
- [Thread Safety and Safe Shared-State Design](06-Thread-Safety-and-Safe-Shared-State-Design.md)
- [Communication and Coordination Between Tasks](07-Communication-and-Coordination-Between-Tasks.md)
- [Concurrency Models and Practical Trade-offs](08-Concurrency-Models-and-Practical-Trade-offs.md)
- [ENG-08: Testing and Debugging](../ENG-08-Development-Quality/Readme.md) — consult the repository's approved path if this relative link differs from the actual directory structure.
