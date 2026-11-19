
# Communication and Coordination Between Tasks

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why concurrent tasks need communication and coordination.
- Distinguish communication from synchronization.
- Compare shared-memory communication with message passing.
- Understand how queues coordinate producers and consumers.
- Explain task completion, signaling, and dependency coordination.
- Understand bounded queues and the role of backpressure.
- Recognize common coordination failures, including duplicate processing, lost signals, and unbounded work accumulation.
- Choose a communication strategy based on ownership, workload, correctness requirements, and system complexity.

## Prerequisites

- **ENG-02 — Programming Foundations:** Functions, data structures, and control flow.
- **ENG-10.02 — Execution Models and Shared State:** Tasks, execution models, dependencies, and shared state.
- **ENG-10.04 — Synchronization Fundamentals:** Critical sections, atomicity, and synchronization.
- **ENG-10.06 — Thread Safety and Safe Shared-State Design:** Immutability, ownership, confinement, and shared-state design.

**Estimated reading time:** 25–30 minutes.

---

## 1. Before We Start

Imagine a backend service that receives user requests and performs several operations:

1. Fetch user profile information.
2. Retrieve matching preferences.
3. Calculate recommendations.
4. Store the result.
5. Return a response.

Some operations can proceed independently. Others must wait for earlier results.

Now consider a second requirement: expensive recommendation calculations should run in background workers instead of blocking incoming requests.

The API service must communicate work to the workers. The workers must obtain that work, process it, and communicate the result or failure.

This creates two related engineering problems:

- **Communication:** How does one task transfer information or work to another?
- **Coordination:** How do tasks establish the ordering, completion, and resource-access guarantees required for correctness?

These problems appear in threaded applications, asynchronous programs, process-based workers, and distributed services.

The underlying principles remain similar, even though the mechanisms differ.

---

## 2. Communication and Coordination

Communication and coordination are related, but they solve different problems.

### 2.1 Communication

**Communication** is the transfer of information, data, or work between execution units.

Examples include:

- Passing a function result to another task.
- Sending a message to a worker.
- Placing a job into a queue.
- Publishing an event that another component consumes.
- Returning a response from a background operation.

Communication answers:

> How does one execution unit provide information or work to another?

### 2.2 Coordination

**Coordination** establishes the relationships and guarantees needed for tasks to work together correctly.

Examples include:

- Waiting until a task finishes.
- Ensuring a dependent task starts only after its input is ready.
- Preventing multiple tasks from claiming the same resource incorrectly.
- Controlling how much work can be queued.
- Ensuring a result is not consumed before it is available.

Coordination answers:

> How do execution units agree on when work can proceed and what conditions must hold?

### 2.3 How they work together

Consider a producer-consumer workflow:

```text
Producer
   │
   │ Sends a work item
   ▼
Queue
   │
   │ Makes the item available
   ▼
Consumer
   │
   │ Processes the item
   ▼
Result
```

The queue communicates the work item from producer to consumer.

The queue's behavior, consumer waiting rules, capacity limits, and task-completion protocol provide coordination.

The distinction matters because transferring data does not automatically establish every guarantee required by the application.

A message may arrive, but the consumer may still need to validate it, coordinate access to shared resources, or report whether processing succeeded.

---

## 3. Strategy One: Shared-Memory Communication

In shared-memory communication, multiple execution units access common memory to exchange information.

For example, two threads may share an in-memory object:

```python
shared_results = {}
```

One thread writes a result, and another thread reads it.

Conceptually:

```text
Thread A
   │
   │ Writes result
   ▼
Shared memory
   │
   │ Reads result
   ▼
Thread B
```

### 3.1 Why shared memory is useful

Shared memory can make communication efficient because the application does not necessarily need to serialize and transmit every value between execution units.

It is useful when:

- Tasks operate within the same process.
- Shared data is naturally represented by in-memory objects.
- Low-overhead access is important.
- Ownership and synchronization rules can be defined clearly.

### 3.2 The main challenge

Shared memory can make it difficult to determine who may modify a value and when another task may observe it.

Consider:

```python
shared_results["user-123"] = recommendation
```

If another task reads the dictionary while updates occur, correctness depends on the guarantees provided by the data structure, language, and access pattern.

Even if individual dictionary operations are safe in a particular environment, a larger workflow may require additional coordination.

For example:

```text
Check whether result exists
Calculate result if missing
Insert result
```

Multiple tasks may perform the calculation concurrently if the complete operation is not coordinated.

### 3.3 When shared memory becomes difficult to maintain

Shared-memory designs become harder to reason about when:

- Many components modify the same state.
- Ownership is unclear.
- Multiple fields must change together.
- Locking rules are inconsistent.
- Components depend on undocumented timing assumptions.

The issue is not shared memory itself. The issue is uncontrolled shared mutation.

**Design principle:** If shared memory is necessary, make ownership, access rules, and invariants explicit.

For detailed shared-state design principles, refer to `06-Thread-Safety-and-Safe-Shared-State-Design.md`.

---

## 4. Strategy Two: Message Passing

In message passing, one execution unit communicates with another by sending a message rather than directly modifying the other unit's internal state.

A message might represent:

- A request.
- A result.
- A command.
- An event.
- A job to execute.

Conceptually:

```text
Task A
   │
   │ Sends message
   ▼
Communication mechanism
   │
   │ Delivers message
   ▼
Task B
```

The communication mechanism may be an in-process queue, a process communication channel, or a system designed to communicate between services.

This chapter focuses on the underlying model rather than distributed messaging infrastructure.

### 4.1 Why message passing helps

Message passing can establish a clearer ownership boundary.

Instead of allowing multiple tasks to modify one shared object, a component can own that object and accept messages requesting changes.

```text
Task A ──┐
         │
Task B ──┼──► Resource owner ──► Owned state
         │
Task C ──┘
```

The owner decides how to process each request and preserve the relevant invariants.

This can reduce the number of places that need direct access to mutable state.

### 4.2 Example: Recommendation jobs

Suppose an API receives a request to generate recommendations.

Instead of performing the full calculation immediately, the API creates a job description:

```python
job = {
    "job_id": "job-1001",
    "user_id": "user-123",
    "operation": "generate_recommendations",
}
```

The job is sent to a worker through an appropriate communication mechanism.

The worker processes it and reports a result or failure.

Conceptually:

```text
API service
    │
    │ Submits job
    ▼
Work queue
    │
    │ Delivers job
    ▼
Recommendation worker
    │
    │ Reports result
    ▼
Result handling
```

The API and worker do not need to directly modify the same in-memory object.

However, the system must still define job identity, failure handling, retries, result storage, and what happens if the same job is processed more than once.

Message passing changes the coordination model; it does not eliminate the need for correctness guarantees.

### 4.3 Trade-offs

Message passing can improve ownership clarity, but it may introduce:

- Serialization and transfer costs.
- Queueing latency.
- Additional data structures or infrastructure.
- Message validation requirements.
- Retry and failure-handling complexity.
- Delayed visibility of results.

Use it when the ownership and communication benefits justify the additional complexity.

---

## 5. Queues as Communication Mechanisms

A **queue** stores work items or messages so that producers and consumers can operate at different times.

A producer adds work. A consumer retrieves and processes it.

```text
Producer(s)
     │
     ▼
┌───────────────────┐
│       Queue       │
│  Job A            │
│  Job B            │
│  Job C            │
└───────────────────┘
     │
     ▼
Consumer(s)
```

Queues are useful because producers and consumers do not need to execute at exactly the same time.

A producer can submit work while a consumer is busy processing an earlier item.

### 5.1 Producer

A producer creates or submits work.

Examples:

- An API handler creates a recommendation job.
- A file-upload service submits a document-processing task.
- A scheduler submits a periodic maintenance job.

### 5.2 Consumer

A consumer retrieves work and performs the requested operation.

Examples:

- A recommendation worker calculates candidate scores.
- A document worker extracts information.
- A background task sends notifications.

### 5.3 Why a queue helps

A queue can separate the rate at which work arrives from the rate at which work is processed.

If requests arrive in bursts, consumers may continue processing the queued work after the burst ends.

This is useful, but the queue cannot create unlimited processing capacity.

If work arrives faster than it can be completed for a sustained period, the queue grows unless the system limits incoming work, increases effective capacity, or changes the workload.

### 5.4 Queue ordering is not a complete correctness guarantee

A queue may provide a particular ordering guarantee, but engineers must verify the actual queue semantics.

Questions include:

- Is order preserved for all messages or only under specific conditions?
- Can multiple consumers process different messages concurrently?
- Can a message be delivered more than once?
- What happens when a consumer fails?
- When is a message considered completed?
- Can a message be lost under the system's failure model?

Do not infer exactly-once processing, global ordering, or durable delivery merely from the existence of a queue.

---

## 6. Producer-Consumer Coordination

The producer-consumer pattern separates work creation from work processing.

The producer supplies items. The consumer retrieves and processes them.

This pattern is useful when the two sides have different execution rates or responsibilities.

### 6.1 Basic lifecycle

```text
Producer
   │
   │ 1. Create item
   ▼
Queue
   │
   │ 2. Make item available
   ▼
Consumer
   │
   │ 3. Process item
   ▼
Completion or failure
```

The system must define what each transition means.

For example, placing a job into a queue does not necessarily mean the job has completed. It means the job has been submitted according to the queue's contract.

### 6.2 Completion must be explicit

Consider a job submitted by an API.

Several different events may occur:

1. The job is accepted.
2. The job is retrieved by a worker.
3. Processing starts.
4. Processing succeeds or fails.
5. The result is stored.
6. The caller is notified or retrieves the result.

These events are not equivalent.

An API that returns after step 1 should not claim that the operation completed at step 4.

A useful job lifecycle might be:

```text
Submitted
    │
    ▼
Queued
    │
    ▼
Processing
   / \
  ▼   ▼
Succeeded  Failed
```

Real systems may require additional states, such as cancellation, retrying, or dead-letter handling. The state model should reflect the application's requirements.

### 6.3 Multiple consumers

Multiple consumers can process different queue items concurrently.

This can increase throughput, but it introduces additional considerations:

- Two workers may attempt the same logical operation.
- Shared downstream resources may become bottlenecks.
- Completion order may differ from submission order.
- Failures may require retrying work.
- Adding consumers may increase pressure on databases or external APIs.

More consumers do not always mean better throughput. Capacity must be considered across the entire workflow.

---

## 7. Task Completion and Signaling

Communication often needs to answer more than "what data should be transferred?"

A task may need to signal that an event has occurred or wait until another task reaches a required state.

Examples include:

- Waiting until initialization completes.
- Waiting until a computation produces a result.
- Signaling that a queue contains work.
- Waiting until a group of tasks finishes.
- Notifying another task that cancellation has been requested.

These are coordination problems.

### 7.1 Completion is a state transition

Suppose a recommendation task calculates a result.

A dependent task should not consume the result before it is available.

```text
Task A: Calculate recommendations
              │
              ▼
        Result available
              │
              ▼
Task B: Persist recommendations
```

The dependency requires a reliable relationship between result production and result consumption.

A completion signal, future, promise, task handle, or another appropriate primitive may provide this relationship, depending on the runtime.

The particular mechanism is language-specific, but the conceptual requirement is the same: the consumer needs a defined way to know when the result is ready.

### 7.2 Avoid timing assumptions

A fragile design might assume:

```text
Start Task A
Wait for a short fixed delay
Read Task A's result
```

This is unreliable because execution duration can vary.

Task A may finish earlier, later, or fail entirely.

A better design uses an explicit completion or readiness mechanism rather than guessing how long the work will take.

### 7.3 Signaling is not the same as protecting shared state

A completion signal can tell a task that another operation has finished.

It does not automatically make every related shared-state operation safe.

The system must still use the guarantees provided by the language, runtime, or communication mechanism to ensure the result is valid and properly published.

---

## 8. Bounded Queues and Backpressure

A queue separates producers from consumers, but an unbounded queue can grow indefinitely if work arrives faster than it is processed.

This creates a resource-management problem.

**Backpressure** is a mechanism by which a system limits or slows incoming work when downstream capacity is insufficient.

### 8.1 The queue growth problem

Suppose a service receives 100 jobs per second, but its workers can process only 70 jobs per second.

The backlog grows by approximately 30 jobs per second while those rates persist.

```text
Incoming work: 100 jobs/sec
Processing:      70 jobs/sec
                     │
                     ▼
Backlog grows by 30 jobs/sec
```

The system may initially appear healthy because requests are accepted quickly. Eventually, however, the backlog consumes memory or storage, increases latency, or exceeds operational limits.

A queue moves the work; it does not eliminate the difference between arrival rate and processing capacity.

### 8.2 Bounded queues

A **bounded queue** has a maximum capacity.

When the queue reaches that capacity, the system must follow a defined policy.

Possible policies include:

- Block or delay producers.
- Reject new work.
- Apply a timeout.
- Drop work when the business requirements permit it.
- Redirect work to another capacity pool.
- Reduce incoming traffic.

Each policy has different consequences.

For example, rejecting a nonessential analytics event may be acceptable, while silently dropping a financial transaction is not.

### 8.3 What backpressure accomplishes

Backpressure helps prevent a fast producer from overwhelming a slower consumer indefinitely.

It makes overload visible and forces the system to handle it deliberately.

A simplified flow is:

```text
Producer
   │
   ▼
Bounded queue
   │
   ├── Capacity available → Accept work
   │
   └── Capacity exhausted → Apply backpressure policy
```

### 8.4 Backpressure is not free

Blocking producers can increase request latency. Rejecting work can reduce availability. Dropping work can violate business requirements.

Backpressure should therefore be designed according to:

- Work importance.
- Maximum acceptable latency.
- Queue capacity.
- Consumer processing rate.
- Retry behavior.
- Resource limits.
- User-visible failure semantics.

The goal is controlled overload behavior, not merely a smaller queue.

---

## 9. Coordination Failures

Communication and coordination mechanisms can fail in ways that produce correctness or availability problems.

### 9.1 Lost or missed signals

A consumer may wait for a signal that was not delivered or was handled incorrectly.

A design must establish what happens when a signal arrives before the consumer begins waiting, when a consumer is cancelled, or when a task fails before signaling completion.

Use mechanisms with clearly defined state and signaling semantics rather than relying on fragile timing assumptions.

### 9.2 Duplicate processing

A worker may process the same job more than once because of retries, redelivery, or multiple workers attempting the same logical operation.

If processing is not safe to repeat, duplicate execution can create incorrect results or repeated side effects.

The design may need idempotent operations, unique job identifiers, deduplication, or resource-level coordination.

The appropriate mechanism depends on the delivery guarantees and business requirements.

### 9.3 Out-of-order completion

Suppose jobs are submitted in this order:

```text
Job A
Job B
Job C
```

If multiple consumers process them concurrently, completion might occur in this order:

```text
Job B
Job C
Job A
```

This may be acceptable for independent jobs. It can be incorrect if later jobs depend on earlier state transitions.

If ordering matters, the system must define the required ordering boundary and enforce it through appropriate partitioning, sequencing, or coordination.

### 9.4 Worker failure

A consumer may fail after retrieving a job but before reporting completion.

The system must define whether the job can be retried, how it is recovered, and how duplicate side effects are avoided.

A queue alone does not answer these questions.

### 9.5 Unbounded waiting

A task may wait indefinitely for a result or signal that never arrives.

Possible causes include:

- The producing task failed.
- A completion signal was never sent.
- A dependency became unavailable.
- A worker is blocked.
- A coordination protocol is incorrect.

Timeouts can make waiting bounded, but the system still needs a recovery or failure-reporting policy.

### 9.6 Deadlocks

Coordination involving multiple resources can introduce circular waiting.

For example, two workers may each hold a resource while waiting for another resource held by the other worker.

The deadlock principles in `05-Deadlocks-and-Related-Problems.md` apply to communication and coordination designs as well.

---

## 10. Choosing a Communication and Coordination Strategy

Different requirements call for different mechanisms.

| Requirement | Possible approach | Main consideration |
|---|---|---|
| Pass a result between functions | Return value or explicit parameter | Appropriate when the caller controls execution flow |
| Share read-only data between threads | Immutable shared data | Ensure the data and its referenced objects are genuinely safe to share |
| Coordinate access to shared mutable state | Synchronization mechanism | Protect the complete invariant |
| Submit work to background consumers | Queue | Define capacity, completion, retry, and failure behavior |
| Wait for one task's result | Completion primitive or task result mechanism | Handle failure and cancellation explicitly |
| Notify a task that an event occurred | Signal or coordination primitive | Ensure signaling semantics match the required event |
| Coordinate a producer and consumer | Queue or channel | Define ordering and ownership |
| Handle sustained overload | Bounded queue and backpressure | Choose an explicit policy for capacity exhaustion |
| Coordinate state across independent processes | Shared resource or process-visible mechanism | A local lock may not cover all participants |

These are design directions rather than universal prescriptions. The correct choice depends on the execution model, ownership boundaries, and correctness guarantees.

### 10.1 A practical decision sequence

**Step 1: Identify what needs to move.**

Is the communication transferring data, a command, an event, or a result?

**Step 2: Identify who owns the state.**

Can the receiving task own and modify the relevant resource, or must several tasks share it directly?

**Step 3: Define the ordering requirement.**

Can messages be processed in any order, or must certain operations happen in sequence?

**Step 4: Define the completion contract.**

Does submission mean accepted, queued, started, or completed?

**Step 5: Define failure behavior.**

What happens if the producer, consumer, or communication mechanism fails?

**Step 6: Define overload behavior.**

Can the queue grow? Should producers block, wait, reject work, or apply another policy?

**Step 7: Validate the system boundary.**

If multiple processes or machines participate, ensure the coordination mechanism covers all relevant participants.

**Step 8: Measure the trade-offs.**

Evaluate throughput, latency, memory use, complexity, and the cost of coordination.

---

## 11. Common Mistakes

### Mistake 1: Treating communication and synchronization as synonyms

Communication transfers information or work. Synchronization establishes ordering, access, or coordination guarantees.

**Correction:** Identify which problem needs to be solved and choose the appropriate mechanism.

### Mistake 2: Assuming message passing eliminates every race condition

The receiver may still modify shared resources, process duplicate messages, or violate business invariants.

**Correction:** Define ownership, delivery semantics, and the invariants that must be preserved.

### Mistake 3: Assuming queue insertion means work is complete

Queue insertion usually indicates submission or acceptance, not successful processing.

**Correction:** Define the job lifecycle and communicate completion or failure explicitly.

### Mistake 4: Using arbitrary delays to coordinate tasks

A fixed sleep does not guarantee that a task has finished or that its result is ready.

**Correction:** Use explicit readiness, completion, or signaling mechanisms.

### Mistake 5: Using an unbounded queue without considering overload

If producers consistently outpace consumers, the backlog can grow until resources are exhausted.

**Correction:** Establish capacity limits, monitor backlog, and define backpressure behavior.

### Mistake 6: Assuming multiple consumers preserve completion order

Concurrent workers may complete jobs in a different order from submission.

**Correction:** Enforce ordering only where required, using a mechanism appropriate to the dependency.

### Mistake 7: Ignoring duplicate processing

Retries or redelivery may cause the same logical job to execute more than once.

**Correction:** Define retry semantics and use idempotency or deduplication where needed.

### Mistake 8: Waiting indefinitely for completion

A failed task may never provide the expected result or signal.

**Correction:** Use bounded waiting where appropriate and define how timeouts, failures, and cancellation are handled.

### Mistake 9: Adding workers without considering downstream capacity

More consumers can overwhelm a database, API, or other shared dependency.

**Correction:** Evaluate end-to-end capacity, not just worker throughput.

### Mistake 10: Treating backpressure as an implementation detail

Blocking, rejecting, or dropping work changes application behavior.

**Correction:** Choose an overload policy based on business importance and make the behavior explicit.

---

## 12. A Practical Coordination Design Review

When reviewing a concurrent workflow, use the following questions.

### Communication

- What data, event, command, or result must be transferred?
- Who produces it?
- Who consumes it?
- Is the transfer in-process or across a process boundary?
- What guarantees does the communication mechanism provide?

### Ordering and completion

- Which tasks depend on other tasks?
- Does submission mean acceptance or completion?
- Must messages be processed in order?
- How is completion reported?
- What happens when a task fails or is cancelled?

### Ownership and correctness

- Who owns the mutable state?
- Can multiple consumers process the same logical operation?
- Which invariants must remain true?
- Are retries safe?
- Is shared-state coordination still required?

### Capacity and failure

- Is the queue bounded?
- What happens when it fills?
- Can producers overwhelm consumers?
- How are stalled workers detected?
- Can a job be recovered without repeating unsafe side effects?

### Performance and maintainability

- Is the communication mechanism unnecessarily complex?
- Is queueing adding acceptable latency?
- Are downstream resources protected from overload?
- Are ordering and retry rules documented?
- Can an engineer understand the workflow from its state transitions?

A useful design review should make the communication contract, completion contract, and failure behavior explicit.

---

## 13. Interview Questions

### Q1. What is the difference between communication and coordination?

**Expected answer:**

Communication transfers information, data, or work between execution units. Coordination establishes the ordering, completion, access, or resource guarantees needed for those units to work together correctly.

### Q2. What is message passing?

**Expected answer:**

Message passing is a communication model in which execution units exchange messages instead of directly modifying one another's internal state. It can clarify ownership but still requires appropriate delivery, ordering, and failure semantics.

### Q3. What is the producer-consumer pattern?

**Expected answer:**

The producer-consumer pattern separates work creation from work processing. Producers submit items, and consumers retrieve and process them, often through a queue that decouples their execution rates.

### Q4. Does a queue guarantee exactly-once processing?

**Expected answer:**

No. Delivery and processing guarantees depend on the queue's implementation and failure model. Retries or redelivery may cause duplicate execution, so the application may need idempotency or deduplication.

### Q5. Why is queue capacity important?

**Expected answer:**

If work arrives faster than it can be processed, a queue can grow until it consumes excessive resources. Capacity limits and backpressure make overload behavior controlled and explicit.

### Q6. What is backpressure?

**Expected answer:**

Backpressure limits or slows incoming work when downstream processing capacity is insufficient. Depending on the system, it may block producers, reject work, apply timeouts, or use another defined policy.

### Q7. Why is a fixed sleep unreliable for task coordination?

**Expected answer:**

Task duration varies, so a fixed delay cannot guarantee completion or readiness. Explicit completion, readiness, or signaling mechanisms provide a more reliable contract.

### Q8. Why might multiple consumers complete jobs out of order?

**Expected answer:**

Consumers process jobs concurrently and may take different amounts of time. If order matters for correctness, the system must explicitly preserve the required ordering.

### Q9. What is the difference between job submission and job completion?

**Expected answer:**

Submission means work has been accepted according to the communication mechanism's contract. Completion means the operation has reached its defined terminal state, such as success or failure. These events may be separated by a significant amount of time.

### Q10. How can duplicate job processing be handled safely?

**Expected answer:**

Define the retry and delivery guarantees, then use an appropriate combination of idempotent operations, unique job identifiers, deduplication, or resource-level coordination. The choice depends on the operation's side effects and correctness requirements.

### Q11. Can message passing eliminate the need for synchronization?

**Expected answer:**

It can reduce direct shared-memory coordination, but it does not eliminate every coordination requirement. Tasks still need rules for message ordering, completion, resource ownership, retries, and shared external state.

### Q12. What should happen when a bounded queue is full?

**Expected answer:**

The system should follow an explicit overload policy, such as blocking producers, rejecting work, applying a timeout, or dropping work where permitted. The policy must reflect business requirements and downstream capacity.

---

## 14. Quick Revision

- Communication transfers data, information, or work.
- Coordination establishes ordering, completion, and access guarantees.
- Shared-memory communication is convenient but requires clear ownership and synchronization rules when state is mutable.
- Message passing can reduce direct shared mutation.
- Queues decouple producers and consumers.
- Queue insertion does not necessarily mean a job has completed.
- Multiple consumers may process jobs concurrently and complete them out of order.
- Delivery and processing guarantees depend on the communication mechanism.
- Duplicate processing, retries, and worker failure require explicit handling.
- Bounded queues help control backlog growth.
- Backpressure defines what happens when incoming work exceeds downstream capacity.
- Communication mechanisms must be evaluated for correctness, capacity, failure behavior, and maintainability.

---

## 15. Key Takeaways

Communication and coordination allow concurrent tasks to cooperate without relying on uncontrolled timing assumptions.

The most important design decision is to establish explicit contracts for ownership, message transfer, task completion, ordering, and failure handling.

When designing a communication workflow:

1. Identify the information or work that must be transferred.
2. Define who owns the relevant state.
3. Determine the required ordering and completion guarantees.
4. Choose a communication mechanism that provides the required contract.
5. Define retry, failure, cancellation, and duplicate-processing behavior.
6. Set capacity limits and backpressure policies where needed.
7. Validate that the mechanism covers all relevant processes and resources.
8. Measure throughput, latency, and downstream impact.

A queue, message, or signal is only one part of the design. The complete system must still preserve its invariants and make progress under normal load, overload, and failure.

The next chapter, **Concurrency Models and Practical Trade-offs**, compares the major ways concurrent work can be organized and examines when each approach is appropriate.

---

## 16. Further Reading

- [Python queue documentation](https://docs.python.org/3/library/queue.html) — Synchronized queues for exchanging data between threads.
- [Python multiprocessing documentation](https://docs.python.org/3/library/multiprocessing.html) — Process-based communication and coordination.
- [Python asyncio documentation](https://docs.python.org/3/library/asyncio.html) — Asynchronous tasks and coordination mechanisms.

These references provide Python-specific implementation details. Verify the guarantees of the actual communication mechanism used by your application.

---

## End of Document

This completes the Markdown file: `07-Communication-and-Coordination-Between-Tasks.md`.
