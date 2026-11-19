
# Concurrency Design Decisions and Engineering Practices

## Learning Objectives

By the end of this chapter, you should be able to:

- Make concurrency decisions based on workload, correctness requirements, and operational constraints.
- Determine when concurrency is necessary and when sequential execution is preferable.
- Choose appropriate coordination strategies for shared state and independent tasks.
- Evaluate the trade-offs between locks, atomic operations, immutability, ownership, and message passing.
- Reason about concurrency limits, backpressure, cancellation, timeouts, and failure recovery.
- Review concurrency designs for correctness, performance, maintainability, and diagnosability.
- Identify common design mistakes before they become production incidents.
- Explain and defend a concurrency design using explicit assumptions and measurable requirements.

## Prerequisites

This chapter consolidates the concepts introduced throughout ENG-10:

- [Concurrency Fundamentals](01-Concurrency-Fundamentals.md)
- [Execution Models and Shared State](02-Execution-Models-and-Shared-State.md)
- [Race Conditions and Data Races](03-Race-Conditions-and-Data-Races.md)
- [Synchronization Fundamentals](04-Synchronization-Fundamentals.md)
- [Deadlocks and Related Problems](05-Deadlocks-and-Related-Problems.md)
- [Thread Safety and Safe Shared-State Design](06-Thread-Safety-and-Safe-Shared-State-Design.md)
- [Communication and Coordination Between Tasks](07-Communication-and-Coordination-Between-Tasks.md)
- [Concurrency Models and Practical Trade-offs](08-Concurrency-Models-and-Practical-Trade-offs.md)
- [Concurrency Failure Analysis](09-Concurrency-Failure-Analysis.md)

This chapter focuses on design decisions and engineering practices. It references earlier chapters rather than repeating their internal explanations.

**Estimated reading time:** 35–45 minutes.

---

## 1. Start with the Problem, Not the Concurrency Mechanism

A common engineering mistake is to begin with a technology choice:

- Should we use threads?
- Should we use asynchronous programming?
- Should we introduce a worker pool?
- Should we use a distributed queue?

These questions are premature until the workload and correctness requirements are understood.

Concurrency is a means of satisfying requirements. It is not a requirement by itself.

Before choosing a concurrency mechanism, establish:

1. What work needs to be performed?
2. Which operations are independent?
3. Which operations depend on the results of other operations?
4. Which resources are shared?
5. What correctness guarantees must hold?
6. What latency and throughput targets matter?
7. What resource limits must be respected?
8. What should happen when an operation fails or is cancelled?

### 1.1 Example: Profile recommendation service

Consider a recommendation endpoint that retrieves information from several independent sources:

```text
Recommendation Request
        |
        +----> Retrieve candidate profiles
        |
        +----> Retrieve user preferences
        |
        +----> Retrieve location information
        |
        +----> Retrieve verification status
        |
        v
Combine results and rank candidates
        |
        v
Return recommendations
```

If the retrieval operations are independent, they may execute concurrently.

However, candidate ranking depends on the results. It cannot correctly finish until the required inputs are available.

A suitable design might be:

```text
Independent retrieval
        |
        v
Coordinate completion
        |
        v
Validate combined state
        |
        v
Rank candidates
        |
        v
Return response
```

The design should express the actual dependency structure rather than attempting to execute every operation simultaneously.

### Engineering principle

**Parallelize independent work; coordinate dependent work explicitly.**

This does not mean every independent operation must be concurrent. The expected benefit must justify the additional scheduling, coordination, and failure-handling complexity.

---

## 2. Decide Whether Concurrency Is Necessary

Concurrency introduces costs:

- Task scheduling.
- Synchronization.
- Context switching.
- Memory usage.
- Coordination logic.
- More complex testing.
- More difficult failure analysis.

Use it when those costs are justified by a meaningful improvement in responsiveness, throughput, resource utilization, or task coordination.

### 2.1 When sequential execution is preferable

Sequential execution is often the better choice when:

- The operations are naturally dependent.
- The workload is small.
- Concurrency would provide negligible speedup.
- The operations are inexpensive relative to coordination overhead.
- Simplicity is more valuable than additional throughput.
- A strict execution order is part of the business requirement.

For example, applying three dependent transformations to a small object may be clearer and faster as sequential code than as three independently scheduled tasks.

### 2.2 When concurrency is useful

Concurrency may be beneficial when:

- Multiple independent I/O operations can overlap.
- A service must handle many simultaneous requests.
- Background tasks should not block an interactive workflow.
- Work can be divided into independent units.
- Available CPU cores can execute independent CPU-bound tasks in parallel.
- A producer and consumer need to operate at different rates.

The appropriate execution model depends on the workload and runtime. See [Concurrency Models and Practical Trade-offs](08-Concurrency-Models-and-Practical-Trade-offs.md).

### 2.3 Use a measurable decision

Do not justify concurrency with statements such as "it should be faster."

Define the expected improvement:

```text
Current behavior:
  Request latency: 900 ms
  Concurrent independent retrievals: not implemented

Target:
  Request latency: below 500 ms
  Correctness: unchanged
  Resource usage: within service limits
```

These numbers are illustrative. Actual targets must come from workload measurements and product requirements.

Measure the existing implementation first, identify the likely bottleneck, then evaluate the simplest design that can meet the target.

---

## 3. Choose a Shared-State Strategy Deliberately

Shared mutable state is a major source of concurrency complexity. Before introducing synchronization, consider whether the design can reduce or eliminate shared mutation.

The main strategies are:

| Strategy | Core idea | Useful when | Main trade-off |
|---|---|---|---|
| Immutability | Shared data does not change after creation | Configuration, snapshots, request data | Updates require new values or controlled replacement |
| Ownership or confinement | One task or component owns mutable state | Task-local processing, actor-like designs | Ownership transfers need explicit coordination |
| Message passing | Tasks exchange messages instead of directly modifying the same state | Queues, worker systems, actor-style systems | Messaging introduces delivery, ordering, and failure concerns |
| Locks and synchronization | Multiple tasks coordinate access to shared state | Small shared structures and protected invariants | Contention, deadlocks, and maintenance complexity |
| Atomic operations | A supported operation changes a value indivisibly | Counters, flags, selected state transitions | Limited operation scope; compound invariants may need more |
| Transactional state changes | A state transition commits under database or storage guarantees | Persistent business state | Isolation, contention, retries, and transaction costs |

These approaches are not mutually exclusive. A system might use immutable request data, task-local processing, a message queue, and a database transaction at different boundaries.

### 3.1 Prefer eliminating coordination when practical

Consider a batch job that processes 1,000 independent documents.

A design that lets all workers update one shared result object introduces coordination.

An alternative is:

```text
Input documents
      |
      v
Partition into independent batches
      |
      +----> Worker A -> Local results A
      |
      +----> Worker B -> Local results B
      |
      +----> Worker C -> Local results C
      |
      v
Combine local results
      |
      v
Final result
```

Local results reduce contention during processing. The final combination still needs a defined rule, but coordination occurs at a smaller and more predictable boundary.

This is often easier to reason about than allowing every worker to modify the same structure.

### 3.2 Use synchronization at the invariant boundary

If several fields must change together, protecting only one assignment may be insufficient.

Suppose a reservation updates:

```text
available_inventory
reserved_inventory
reservation_status
```

The business invariant may require these values to change consistently.

A lock, transaction, or atomic state transition should protect the complete logical operation required by that invariant.

Do not synchronize individual lines merely because they look important. Synchronize the state transition whose correctness depends on coordination.

For detailed mechanisms, see [Synchronization Fundamentals](04-Synchronization-Fundamentals.md) and [Thread Safety and Safe Shared-State Design](06-Thread-Safety-and-Safe-Shared-State-Design.md).

---

## 4. Design Concurrency Boundaries Explicitly

A concurrency boundary defines where independent execution begins, where coordination is required, and where results are combined.

Poorly defined boundaries allow concurrency concerns to spread throughout the application.

### 4.1 Example: Background document processing

A document-processing service might have these stages:

```text
Receive Document
       |
       v
Validate Input
       |
       v
Create Processing Job
       |
       v
Bounded Worker Pool
       |
       +----> Extract Text
       |
       +----> Generate Embeddings
       |
       +----> Classify Content
       |
       v
Persist Results
       |
       v
Mark Job Complete
```

Not every stage is necessarily independent. For example, embedding generation may require successful text extraction, and final completion may require all mandatory outputs.

A sound design makes those dependencies explicit.

### 4.2 Questions for every boundary

For each stage, determine:

- Who owns the input?
- Can multiple tasks access the input safely?
- Is the operation independent of other tasks?
- What marks successful completion?
- What happens if the task fails?
- Can the task be retried safely?
- Is the output partial or complete?
- Who owns the final state transition?
- How is cancellation propagated?
- What limits the number of active tasks?

These questions help turn a collection of concurrent operations into a defined workflow.

### 4.3 Keep ownership and completion separate

A task starting does not mean the task completed successfully.

Similarly, a worker finishing its local computation does not necessarily mean the business operation has committed successfully.

For example:

```text
Worker computes embedding
       |
       v
Embedding stored successfully?
       |
       +---- No ---> Record failure or retry safely
       |
       +---- Yes --> Update job state
                         |
                         v
                    Mark complete
```

The system should define the exact point at which an operation is considered complete.

---

## 5. Bound Concurrency and Apply Backpressure

More concurrent tasks do not always produce more useful work.

If a service accepts work faster than it can process it, unbounded task creation can lead to:

- Excessive memory consumption.
- Increased queueing latency.
- Connection pool exhaustion.
- Thread or task scheduling overhead.
- Timeouts and cascading retries.
- Reduced throughput due to contention.

A production system should generally have explicit capacity limits appropriate to its workload.

### 5.1 Example: Embedding generation

Suppose an application receives 500 document requests in a short interval. Each request requires a remote embedding call.

Creating 500 unrestricted concurrent tasks may exceed connection limits, provider quotas, or the application's memory budget.

A bounded design might look like:

```text
Incoming Requests
        |
        v
Bounded Queue
        |
        v
Fixed or Controlled Worker Pool
        |
        v
Embedding Provider
        |
        v
Results
```

The queue and worker pool should have defined capacity and overload behavior.

Possible policies include:

- Wait for capacity.
- Reject excess work.
- Return a retryable response.
- Persist work for later processing.
- Apply admission control based on resource availability.

The correct policy depends on whether the operation is interactive, batch-oriented, or business-critical.

### 5.2 Backpressure

Backpressure communicates that downstream processing cannot currently accept more work at the incoming rate.

It prevents overload from spreading silently through the system.

For example, if embedding generation is slower than document ingestion, the system must either slow ingestion, queue work within a defined capacity, or reject or defer some requests.

Simply creating more tasks does not solve a sustained throughput mismatch.

### 5.3 Capacity planning

For a simplified steady-state workload, Little's Law relates average work in the system, arrival rate, and average time in the system:

\[
L = \lambda W
\]

Where:

- \(L\) is the average number of items in the system.
- \(\lambda\) is the average arrival or completion rate in a stable system.
- \(W\) is the average time an item spends in the system.

For example, if a service processes 20 requests per second and the average time in the system is 0.5 seconds:

\[
L = 20 \times 0.5 = 10
\]

The average number of requests in the system is approximately 10 under those assumptions.

This relationship does not determine the ideal worker count by itself. Service-time variability, resource limits, queue capacity, and tail latency also matter.

If arrivals continuously exceed processing capacity, the system cannot remain stable indefinitely without admission control, scaling, or a change in workload.

---

## 6. Define Timeouts, Cancellation, and Failure Semantics

Concurrency design must specify what happens when tasks do not finish as expected.

Without explicit policies, a request may wait indefinitely, background work may continue after its result is no longer needed, or failed tasks may leave partially updated state.

### 6.1 Timeouts

A timeout bounds how long a caller is willing to wait for an operation.

A timeout should answer:

- What operation is being timed?
- Does the timeout include queue waiting?
- What happens when it expires?
- Can the underlying operation actually be stopped?
- Is retrying safe?
- Could the operation have completed even though the caller timed out?

A timeout is not proof that the underlying operation did not execute.

For example, a payment request may succeed at the provider while the response is delayed. Retrying without an idempotency strategy can create a duplicate side effect.

### 6.2 Cancellation

Cancellation communicates that work is no longer required or should stop.

A sound design defines:

- Which component may request cancellation.
- Which tasks must observe the request.
- How cancellation propagates to dependent tasks.
- Whether cleanup must run.
- Whether partial results can be retained.
- Whether the operation is safe to cancel at its current stage.

Cancellation is often cooperative. A request to cancel does not automatically stop arbitrary code or undo completed external side effects.

### 6.3 Failure handling

A task failure should have a defined outcome.

Possible outcomes include:

- Retry with a bounded policy.
- Return a failure to the caller.
- Record a failed job for later recovery.
- Cancel dependent tasks.
- Produce a partial result if the contract permits it.
- Initiate compensation for a previously committed side effect.

Do not treat all failures as retryable. Invalid input, exhausted capacity, transient network failures, and uncertain external outcomes require different responses.

### 6.4 Preserve a consistent state

Consider a multi-stage workflow:

```text
Create Job
    |
    v
Generate Embedding
    |
    v
Persist Vector
    |
    v
Mark Job Complete
```

If vector persistence succeeds but marking the job complete fails, the system has an intermediate state.

The design should define how that state is detected and recovered. A retry may be appropriate if the operations are idempotent; otherwise, reconciliation or a more explicit state machine may be necessary.

Concurrency correctness includes failure and recovery behavior, not just successful execution.

---

## 7. Avoid Hidden Dependencies and Excessive Coordination

A design can be technically thread-safe and still be difficult to maintain.

Excessive coordination creates hidden dependencies between components and makes performance harder to predict.

### 7.1 Warning signs

Review a design carefully when you see:

- A global lock protecting unrelated operations.
- Many components reading and modifying the same mutable object.
- Nested lock acquisition across multiple layers.
- Locks held while waiting for network or database operations.
- Unbounded queues or task creation.
- Shared mutable state with unclear ownership.
- Callbacks that acquire locks in inconsistent orders.
- Retry loops without limits or backoff.
- Cancellation that does not propagate to dependent work.
- Business completion inferred from task completion rather than committed state.

These patterns are not automatically defects, but each deserves an explicit justification.

### 7.2 Reduce lock scope carefully

Holding a lock for longer than necessary increases contention.

For example:

```text
Acquire lock
Read shared configuration
Call remote API
Transform result
Update local state
Release lock
```

If the remote API call is slow, every task needing that lock may be blocked for the duration.

Where correctness permits, a better design may be:

```text
Read or snapshot required state
Perform independent remote work
Acquire lock
Validate current state
Apply protected update
Release lock
```

However, moving work outside the lock can introduce a time-of-check/time-of-use problem if the shared state changes before the final update.

The correct approach is to minimize the protected region while preserving the invariant. Sometimes that requires revalidation or version checking before committing the result.

---

## 8. Make Concurrency Designs Observable

A concurrency design is incomplete if the team cannot determine what it is doing under load or during failure.

Observability should be designed around the operations and invariants that matter.

### 8.1 Useful measurements

Depending on the system, consider tracking:

- Active task count.
- Task completion and failure rates.
- Queue depth and queue waiting time.
- Resource acquisition and wait duration.
- Retry counts and retry outcomes.
- Cancellation counts.
- Timeouts by dependency.
- Work started versus work completed.
- Processing latency percentiles.
- Resource-pool utilization.
- Age of the oldest pending task.

Use measurements that support operational decisions. Collecting every possible metric creates overhead and can make important signals harder to interpret.

### 8.2 Correlate operations

A single business operation may cross multiple tasks or services.

Use appropriate request, job, or operation identifiers to connect the related events.

For example:

```text
request_id: req-184
job_id: job-92
operation: embedding_generation
attempt: 2
outcome: timeout
```

These fields help distinguish repeated attempts from independent operations and make failure reconstruction more reliable.

### 8.3 Monitor progress, not just utilization

High CPU utilization does not automatically indicate healthy throughput.

Low CPU utilization does not automatically indicate a deadlock.

Track both resource usage and completed work. A system that creates thousands of active tasks but completes very few jobs may have a coordination or capacity problem rather than insufficient concurrency.

For the investigation process, see [Concurrency Failure Analysis](09-Concurrency-Failure-Analysis.md).

---

## 9. Concurrency Design Review Checklist

Before approving a concurrency design, review the following dimensions.

### Correctness

- [ ] The important invariants are documented.
- [ ] Shared mutable state has an explicit ownership or synchronization strategy.
- [ ] Compound operations are protected at the correct logical boundary.
- [ ] Task dependencies and completion conditions are explicit.
- [ ] The design does not depend on an accidental execution order.
- [ ] Duplicate execution and retries are handled where relevant.

### Resource management

- [ ] Concurrency limits are defined where required.
- [ ] Queue capacity and overload behavior are explicit.
- [ ] Connections, locks, and other resources have clear lifetimes.
- [ ] Timeouts and cancellation have defined semantics.
- [ ] Resource exhaustion does not create uncontrolled task growth.

### Failure recovery

- [ ] Partial completion states are understood.
- [ ] Retry policies are bounded and appropriate to the failure type.
- [ ] External side effects have suitable idempotency or reconciliation behavior.
- [ ] Cancellation and task failure do not silently violate invariants.
- [ ] The system has a defined outcome when a dependency remains unavailable.

### Performance

- [ ] The expected benefit of concurrency is measurable.
- [ ] Coordination overhead and contention have been considered.
- [ ] Workload type matches the chosen execution model.
- [ ] Tail latency and queueing behavior are considered, not just average throughput.
- [ ] Capacity assumptions have been tested under realistic load.

### Maintainability and operations

- [ ] Ownership and synchronization responsibilities are easy to identify.
- [ ] Lock ordering and critical sections are understandable.
- [ ] Logs and metrics can reveal stalled or failing work.
- [ ] Relevant invariants have regression tests.
- [ ] The design can be explained without relying on undocumented timing assumptions.

A checklist does not prove correctness. It creates a consistent review process and exposes assumptions that require further analysis.

---

## 10. Common Design Mistakes

### Mistake 1: Making everything concurrent

**Why it fails:** Independent task creation and coordination add overhead, while dependencies still require waiting.

**Better approach:** Introduce concurrency only where it serves a defined requirement.

### Mistake 2: Using a global lock as a universal solution

**Why it fails:** A global lock may serialize unrelated work and create a system-wide bottleneck.

**Better approach:** Identify the invariant and protect only the state transition that requires coordination.

### Mistake 3: Assuming a queue solves all coordination problems

**Why it fails:** Queues do not automatically solve duplicate processing, idempotency, ordering, durability, or partial failure.

**Better approach:** Define delivery semantics, ownership, acknowledgment, retry behavior, and recovery explicitly.

### Mistake 4: Increasing worker count to solve a throughput problem

**Why it fails:** The actual bottleneck may be a database pool, remote API quota, lock contention, or CPU capacity.

**Better approach:** Measure where work waits and where throughput is constrained before increasing concurrency.

### Mistake 5: Treating a timeout as cancellation

**Why it fails:** The caller may stop waiting while the underlying operation continues.

**Better approach:** Define timeout and cancellation separately, and determine whether the operation can be stopped or safely repeated.

### Mistake 6: Ignoring state after partial failure

**Why it fails:** A task may have performed some side effects before failing, leaving the workflow inconsistent.

**Better approach:** Define durable states, safe retries, compensation, or reconciliation.

### Mistake 7: Optimizing throughput while ignoring fairness

**Why it fails:** A system may have good aggregate throughput while some requests wait indefinitely or experience unacceptable tail latency.

**Better approach:** Evaluate per-task progress, latency distribution, and fairness requirements alongside throughput.

### Mistake 8: Relying only on tests

**Why it fails:** Tests may not explore every relevant interleaving or production failure condition.

**Better approach:** Combine testing with explicit invariants, design review, runtime observability, and failure analysis.

---

## 11. Worked Design Example: A Bounded Background Worker System

Consider an application that receives documents and generates embeddings asynchronously.

The system must:

- Accept documents without blocking on the entire embedding workflow.
- Prevent uncontrolled task growth.
- Avoid duplicate logical processing.
- Recover from temporary provider failures.
- Make job status observable.
- Preserve a consistent final state.

### 11.1 Proposed architecture

```text
                  +-------------------+
                  |  API / Ingestion  |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  | Durable Job Store |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |  Bounded Queue    |
                  +---------+---------+
                            |
                +-----------+-----------+
                |           |           |
                v           v           v
             Worker A    Worker B    Worker C
                |           |           |
                +-----------+-----------+
                            |
                            v
                  +-------------------+
                  | Embedding Provider|
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  | Persist Result    |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  | Mark Job Complete |
                  +-------------------+
```

This is a conceptual design. The actual implementation may use a durable queue, a database-backed job table, or another mechanism appropriate to the system's delivery and recovery requirements.

### 11.2 Important design decisions

**Decision 1: Where is job state owned?**

The durable job store is the source of truth for job status. Queue messages can trigger processing, but the design should not assume that a message alone represents the complete business state.

**Decision 2: How is a job claimed?**

The claim operation must prevent competing workers from simultaneously owning the same logical job, according to the required semantics.

**Decision 3: What limits concurrency?**

The worker pool and any downstream request limit must reflect provider quotas, connection limits, memory usage, and the desired throughput.

**Decision 4: What happens after a timeout?**

A timeout may leave the provider's outcome uncertain. The retry policy must consider idempotency, provider capabilities, and whether duplicate computation or side effects are possible.

**Decision 5: When is the job complete?**

The job should be marked complete only when the required durable result has been successfully committed.

**Decision 6: How are abandoned jobs recovered?**

The design needs a way to detect jobs that remain in a processing state beyond an expected interval and determine whether to retry, reconcile, or mark them failed.

### 11.3 Trade-offs

| Design choice | Benefit | Cost or risk |
|---|---|---|
| Durable job state | Recovery and auditability | Storage and state-management complexity |
| Bounded worker pool | Controlled resource usage | Queueing delay under overload |
| Explicit job claiming | Prevents conflicting ownership | Requires atomic claim semantics |
| Bounded retries | Limits retry storms | Some work may require manual recovery |
| Idempotent processing | Safer duplicate execution | May require additional design or storage |
| Operational metrics | Easier diagnosis | Instrumentation and monitoring overhead |

The architecture should be validated against realistic workloads, provider behavior, and failure scenarios before production deployment.

---

## 12. Interview Questions and Answers

### Q1. How do you decide whether a task should execute concurrently?

First identify dependencies, workload type, performance targets, and resource limits. Concurrency is appropriate when independent work can overlap or execute in parallel and the expected benefit justifies coordination overhead.

### Q2. How can a design reduce concurrency bugs without adding more locks?

Reduce shared mutable state, use immutable data, assign clear ownership, process data locally, and exchange messages between components. Synchronization is still necessary at boundaries where shared invariants must be preserved.

### Q3. Why is a bounded worker pool important?

It limits active work and protects downstream resources. Without limits, a service may create more tasks than it can process, causing memory pressure, queueing delays, resource exhaustion, and cascading failures.

### Q4. Why is a timeout insufficient for safe retries?

The operation may have completed even if the caller did not receive the result. Retrying can duplicate side effects unless the operation is idempotent or the system has a suitable reconciliation strategy.

### Q5. What should a concurrency design review focus on?

Correctness invariants, shared-state ownership, task dependencies, resource limits, failure recovery, observability, and measurable performance requirements. The review should establish why the chosen mechanism is appropriate rather than merely confirming that a lock or queue exists.

### Q6. How do you know whether increasing concurrency will improve performance?

Measure the current bottleneck, determine whether the workload can overlap or execute in parallel, and benchmark representative loads. Evaluate throughput, latency percentiles, resource utilization, and error rates rather than relying on task count alone.

### Q7. How should a system handle a worker that fails after performing part of an operation?

Define durable states and recovery semantics. Depending on the operation, the system may use idempotent retries, explicit state transitions, compensation, or reconciliation. It must distinguish a failed operation from an operation whose outcome is unknown.

### Q8. Can a thread-safe component guarantee a correct workflow?

No. A component can protect its own internal state while the larger workflow still has incorrect ordering, duplicate side effects, invalid transitions, or incomplete recovery. Workflow correctness requires the end-to-end invariants and coordination boundaries to be designed explicitly.

### Q9. What is the difference between concurrency control and capacity control?

Concurrency control coordinates interacting tasks so they preserve correctness. Capacity control limits how much work is active or queued so the system remains within resource and performance constraints. A production system often needs both.

### Q10. What makes a concurrency design maintainable?

Explicit ownership, well-defined invariants, narrow coordination boundaries, understandable task dependencies, bounded resource use, clear failure semantics, useful observability, and tests that validate important properties.

---

## 13. Quick Revision

- Start with requirements and dependencies before selecting a concurrency mechanism.
- Concurrency should provide a measurable benefit.
- Reduce shared mutable state before adding synchronization.
- Protect complete logical state transitions, not arbitrary individual lines.
- Use explicit concurrency limits and backpressure to manage overload.
- Define task completion, cancellation, timeout, retry, and recovery semantics.
- Treat external side effects and uncertain outcomes carefully.
- Measure progress and completed work, not only active tasks or CPU utilization.
- Design observability around important operations and invariants.
- Review safety, liveness, capacity, maintainability, and failure behavior together.
- Test concurrency designs under representative workloads and failure conditions.
- A production-ready design must be diagnosable and recoverable, not merely correct on the happy path.

---

## 14. Key Takeaways

1. **Requirements drive concurrency.** Do not introduce concurrency without a clear reason.
2. **Ownership simplifies reasoning.** Reducing shared mutable state often reduces synchronization complexity.
3. **Correctness comes before throughput.** Protect the invariant even when a faster-looking alternative is available.
4. **Capacity must be controlled.** Unbounded concurrency can make a healthy service unstable under load.
5. **Failure behavior is part of the design.** Timeouts, cancellation, retries, and partial completion require explicit semantics.
6. **Measure the system.** Use real workload data to validate throughput, latency, and resource assumptions.
7. **Review the whole workflow.** Thread safety in one component does not guarantee end-to-end correctness.
8. **Make assumptions explicit.** A concurrency design should be explainable, testable, observable, and maintainable.

---

## Further Reading

- [Concurrency Fundamentals](01-Concurrency-Fundamentals.md)
- [Execution Models and Shared State](02-Execution-Models-and-Shared-State.md)
- [Race Conditions and Data Races](03-Race-Conditions-and-Data-Races.md)
- [Synchronization Fundamentals](04-Synchronization-Fundamentals.md)
- [Deadlocks and Related Problems](05-Deadlocks-and-Related-Problems.md)
- [Thread Safety and Safe Shared-State Design](06-Thread-Safety-and-Safe-Shared-State-Design.md)
- [Communication and Coordination Between Tasks](07-Communication-and-Coordination-Between-Tasks.md)
- [Concurrency Models and Practical Trade-offs](08-Concurrency-Models-and-Practical-Trade-offs.md)
- [Concurrency Failure Analysis](09-Concurrency-Failure-Analysis.md)
