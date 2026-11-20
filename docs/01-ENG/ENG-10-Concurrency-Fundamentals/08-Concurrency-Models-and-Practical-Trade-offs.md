
# Concurrency Models and Practical Trade-offs

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain the major execution models used to organize concurrent work.
- Distinguish thread-based concurrency, process-based concurrency, and asynchronous I/O.
- Explain how I/O-bound and CPU-bound workloads influence execution-model choices.
- Understand the relationship between concurrency, parallelism, resource utilization, and throughput.
- Evaluate the trade-offs between simplicity, isolation, performance, and coordination complexity.
- Recognize why increasing the number of threads, processes, or tasks does not always improve performance.
- Select an execution model based on workload characteristics and measurable engineering requirements.

## Prerequisites

- **ENG-01 — Computer Science Fundamentals:** Processes, threads, memory, and program execution.
- **ENG-02 — Programming Foundations:** Functions, data structures, and control flow.
- **ENG-10.01 — Concurrency Fundamentals:** Concurrency versus parallelism.
- **ENG-10.02 — Execution Models and Shared State:** Tasks, processes, threads, and shared state.
- **ENG-10.04 — Synchronization Fundamentals:** Critical sections and coordination.
- **ENG-10.06 — Thread Safety and Safe Shared-State Design:** Ownership and shared-state design.
- **ENG-10.07 — Communication and Coordination Between Tasks:** Queues, task completion, and backpressure.

**Estimated reading time:** 30–35 minutes.

---

## 1. Before We Start

Consider a backend API that performs three operations:

1. Fetches user information from a database.
2. Calls an external recommendation service.
3. Calculates a ranking score.

These operations do not necessarily have the same execution characteristics.

Database and network calls often spend substantial time waiting for external systems. Ranking calculations may spend most of their time performing CPU computations.

A concurrency model that works well for one workload may perform poorly for another.

For example:

- Threads may allow several blocking operations to make progress without forcing the entire application to wait for each operation.
- Processes can provide separate execution environments and support parallel computation when the runtime and hardware permit it.
- Asynchronous I/O can manage many waiting operations without requiring a dedicated operating-system thread for every operation.

None of these approaches is universally best.

The engineering question is:

**Which execution model satisfies the workload's correctness, throughput, latency, resource, and maintainability requirements with the least unnecessary complexity?**

Answering this requires understanding the workload before choosing the implementation.

---

## 2. What Is a Concurrency Model?

A **concurrency model** describes how a system organizes work, allows tasks to make progress, and coordinates their interactions.

It influences:

- How work is represented.
- Which execution units perform the work.
- How tasks are scheduled.
- How information moves between tasks.
- How shared resources are accessed.
- How failures and cancellation are handled.
- How the system uses CPU, memory, and other resources.

Common execution approaches include:

- Thread-based concurrency.
- Process-based concurrency.
- Asynchronous I/O.
- Hybrid models that combine multiple approaches.

These approaches are not mutually exclusive. A production service may use an asynchronous API layer, a process pool for CPU-heavy computation, and background workers for deferred tasks.

### 2.1 Concurrency model versus workload

A workload describes the actual work the system must perform.

Examples include:

- Waiting for database responses.
- Downloading multiple documents.
- Transforming images.
- Running inference.
- Parsing large files.
- Processing background jobs.

The execution model determines how the application organizes that work.

Choosing a model without understanding the workload is similar to selecting a storage system without understanding the access pattern: the implementation may work, but its operational characteristics may be unsuitable.

---

## 3. Revisit Concurrency and Parallelism

Concurrency and parallelism are related but distinct concepts.

**Concurrency** means multiple tasks can make progress during overlapping periods.

**Parallelism** means multiple operations execute at the same time.

```text
Concurrent progress:

Task A: ███───████───██
Task B: ──████───███───

Parallel execution:

Task A: █████████████
Task B: █████████████
        Same time period
```

These diagrams are conceptual. Actual scheduling and execution depend on the runtime and hardware.

### 3.1 Why the distinction matters

A system can handle many concurrent I/O operations without executing all of them simultaneously on separate CPU cores.

For example, a service may initiate several network requests and continue other work while those requests wait for responses.

Parallelism becomes particularly relevant when independent CPU computations can execute simultaneously on available processing resources.

### 3.2 Concurrency does not guarantee speedup

Concurrency may improve responsiveness or resource utilization, but it also introduces coordination overhead.

If tasks compete for the same lock, database connection, or external API quota, increasing concurrency may increase waiting rather than useful work.

A good design therefore measures the actual bottleneck instead of assuming that more concurrent tasks always produce better performance.

---

## 4. Understand the Workload First

Before comparing execution models, classify the workload.

Two broad categories are especially useful: I/O-bound and CPU-bound work.

### 4.1 I/O-bound workloads

An **I/O-bound workload** spends a significant portion of its time waiting for input or output operations.

Examples include:

- Database queries.
- HTTP requests.
- Reading remote files.
- Waiting for storage operations.
- Calling external APIs.

A simplified timeline:

```text
Task A:
Send request ── Wait for response ── Process result

Task B:
      Send request ── Wait for response ── Process result
```

While Task A waits, the application may allow Task B or other work to make progress.

The primary opportunity is to avoid leaving execution capacity idle while operations wait.

### 4.2 CPU-bound workloads

A **CPU-bound workload** spends most of its time performing computations.

Examples include:

- Large numerical calculations.
- CPU-intensive data transformations.
- Image processing.
- Complex parsing.
- Some machine-learning preprocessing tasks.

A simplified timeline:

```text
Task A: Compute ─ Compute ─ Compute
Task B: Compute ─ Compute ─ Compute
```

If one CPU core must execute both tasks, they may compete for processing time. Concurrent scheduling alone does not make the computations finish sooner.

If the runtime and hardware permit genuine parallel execution, independent computations may run on separate processing resources.

### 4.3 Workloads can be mixed

A recommendation service may:

1. Fetch candidate profiles from a database.
2. Wait for an external service.
3. Calculate semantic or ranking scores.
4. Persist the results.

The first two steps may be I/O-bound, while the third may be CPU-bound.

A mixed workload may benefit from a hybrid design, but introducing multiple execution models adds complexity. Use that complexity only when the measured benefits justify it.

---

## 5. Thread-Based Concurrency

Thread-based concurrency uses multiple threads to execute work within a process.

Threads in the same process normally share the process's address space, while each thread maintains its own execution state.

```text
Process
│
├── Shared memory and resources
│
├── Thread A ──► Work A
├── Thread B ──► Work B
└── Thread C ──► Work C
```

### 5.1 Why threads are useful

Threads can be useful when:

- Several blocking operations need to overlap.
- Tasks share in-process data.
- The language and runtime provide suitable thread facilities.
- The workload benefits from concurrent waiting and execution.
- The synchronization requirements remain manageable.

For example, a service might use multiple threads to handle blocking database or network operations.

### 5.2 Shared-memory advantages

Because threads share memory, they can exchange information through shared objects without explicitly transferring every value between separate processes.

This can simplify some workflows.

However, shared mutable state creates coordination requirements. Threads may need synchronization to protect invariants, and poorly designed locking can introduce contention or deadlocks.

The relevant design principles are covered in:

- `03-Race-Conditions-and-Data-Races.md`
- `04-Synchronization-Fundamentals.md`
- `06-Thread-Safety-and-Safe-Shared-State-Design.md`

### 5.3 Thread-related costs

Threads are not free.

Potential costs include:

- Memory and runtime overhead.
- Scheduling and context-switching overhead.
- Synchronization.
- Lock contention.
- Deadlock risk.
- Complexity in cancellation and failure handling.

The impact depends on the language, runtime, operating system, workload, and number of threads.

### 5.4 Threads and CPU-bound work

Whether multiple threads provide CPU parallelism depends on the language and runtime.

Some runtimes permit multiple threads to execute CPU-bound code simultaneously on separate cores. Others impose runtime constraints that limit simultaneous execution of certain code paths.

For example, conventional CPython builds with the Global Interpreter Lock (GIL) generally do not execute multiple threads' Python bytecode simultaneously within one interpreter. Threads can still be useful for I/O-bound work, and native extensions or alternative runtime configurations may have different behavior.

**Do not generalize one language's threading behavior to every language or runtime.**

---

## 6. Process-Based Concurrency

Process-based concurrency organizes work into multiple processes.

Each process normally has its own address space and process-level resources.

```text
Operating system
│
├── Process A ──► Work A
│
├── Process B ──► Work B
│
└── Process C ──► Work C
```

### 6.1 Why processes are useful

Processes can be appropriate when:

- CPU-intensive work can be divided into independent tasks.
- The runtime's threading model limits CPU parallelism.
- Isolation between workloads is valuable.
- Separate processes can use multiple CPU cores.
- A failure in one process should not directly corrupt another process's private memory.

Process isolation is useful, but it is not complete fault isolation. Processes can still share external dependencies and compete for system resources.

### 6.2 Communication costs

Because processes generally have separate address spaces, exchanging data often requires an explicit communication mechanism.

Depending on the environment, this may involve:

- Pipes.
- Queues.
- Sockets.
- Shared-memory mechanisms.
- Serialized messages.

Communication can add latency, memory copies, serialization costs, and operational complexity.

For small tasks, these costs may outweigh the benefit of parallel execution.

### 6.3 Process-related costs

Potential costs include:

- Process startup overhead.
- Memory usage.
- Data transfer.
- Coordination between processes.
- Resource management.
- More complex lifecycle and failure handling.

The appropriate process count depends on the workload and available resources. Creating more processes than the system can use effectively may increase overhead and contention.

### 6.4 Processes do not eliminate shared-resource conflicts

Two processes may use separate memory but update the same database record.

They can still experience lost updates, duplicate reservations, or other concurrency problems involving external state.

A process-local lock does not automatically coordinate independent processes.

The coordination mechanism must cover the resource boundary where the conflict occurs.

---

## 7. Asynchronous I/O

Asynchronous I/O allows an application to initiate operations that may wait for external events and continue other work without blocking the entire execution flow.

An event loop or similar runtime mechanism can manage many waiting tasks.

A simplified model:

```text
Task A starts I/O ──► Waiting
                         │
Task B starts I/O ──► Waiting
                         │
Task C performs work
                         │
I/O completion event ◄───┘
                         │
Task A resumes
```

The diagram illustrates the conceptual model rather than a particular runtime's scheduling guarantees.

### 7.1 Why asynchronous I/O is useful

Asynchronous I/O can be useful when:

- The application handles many concurrent I/O operations.
- Tasks spend substantial time waiting.
- The libraries and dependencies support asynchronous operations.
- The application can express task lifecycles clearly.
- Avoiding a dedicated thread for every waiting operation is beneficial.

A network service that manages many simultaneous requests is a common example.

### 7.2 Asynchronous does not mean parallel CPU execution

An asynchronous task can yield control while waiting, allowing another task to run.

That does not automatically mean two CPU-intensive tasks execute simultaneously on separate cores.

If one task performs a long, blocking CPU computation on the event-loop thread, it may prevent other tasks on that loop from making progress.

CPU-heavy work may need to be moved to a suitable thread pool, process pool, or separate worker system.

### 7.3 Asynchronous I/O still requires correct coordination

Asynchronous applications can still encounter:

- Race conditions over shared state.
- Invalid state transitions.
- Incorrect cancellation handling.
- Tasks that wait indefinitely.
- Unbounded task creation.
- Resource exhaustion.
- Deadlocks or deadlock-like stalls caused by incorrect coordination.

The absence of traditional thread-per-task execution does not eliminate concurrency design requirements.

### 7.4 Asynchronous programming has its own complexity

Potential costs include:

- More complex control flow.
- Cancellation and timeout handling.
- Coordination between asynchronous and blocking code.
- Library compatibility constraints.
- Difficulties debugging task lifecycles.
- The need to prevent event-loop blocking.

Asynchronous I/O is most valuable when the workload and ecosystem benefit from it. It should not be adopted simply because it is a modern programming style.

---

## 8. Compare the Major Models

The following table summarizes common trade-offs. It is a conceptual guide, not a performance ranking.

| Dimension | Thread-based | Process-based | Asynchronous I/O |
|---|---|---|---|
| Primary abstraction | Threads | Processes | Tasks coordinated by an asynchronous runtime |
| Memory relationship | Threads normally share process memory | Processes generally have separate address spaces | Depends on runtime; tasks often share the application's memory space |
| Communication | Shared objects and synchronization | Explicit inter-process communication or external resources | Task results, channels, queues, shared objects, or other runtime mechanisms |
| I/O-bound workloads | Often useful | Can work, but may add unnecessary process overhead | Often useful when dependencies support asynchronous operations |
| CPU-bound workloads | Runtime-dependent | Often useful when work can execute in parallel | Usually requires a suitable CPU execution strategy for parallel computation |
| Isolation | Lower between threads in one process | Stronger process-level memory isolation | Depends on the tasks and runtime; usually not separate process isolation |
| Coordination | Shared-state synchronization | Communication and resource-level coordination | Task dependencies, cancellation, and shared-state coordination |
| Main complexity | Thread safety, locks, lifecycle | Process lifecycle, data transfer, coordination | Async control flow, cancellation, blocking operations |
| Common risk | Race conditions and deadlocks | Communication overhead and shared external resource conflicts | Event-loop blocking and unmanaged task growth |

### 8.1 Hybrid designs

Production systems often combine these models.

For example:

```text
API layer
   │
   ├── Asynchronous I/O for network operations
   │
   ├── Thread pool for suitable blocking operations
   │
   └── Process workers for CPU-intensive calculations
```

This architecture may be appropriate when different workload stages have distinct requirements.

However, every additional execution model creates boundaries that must be managed:

- How work is transferred.
- How errors are reported.
- How cancellation propagates.
- How resources are limited.
- How completion is tracked.
- How observability works across components.

Use a hybrid model when the benefit is measurable and the boundaries can be maintained clearly.

---

## 9. Throughput, Latency, and Resource Utilization

Concurrency-model decisions should be tied to measurable system behavior.

Three concepts are particularly important.

### 9.1 Latency

**Latency** is the time taken for an operation to complete, measured from a defined start point to a defined end point.

For an API request, latency might be measured from request arrival to response delivery.

Concurrency can reduce latency when independent work overlaps or when a task avoids waiting for an unnecessary sequential step.

But concurrency can also increase latency through contention, queueing, resource exhaustion, or coordination overhead.

### 9.2 Throughput

**Throughput** is the amount of useful work completed per unit of time.

Examples include:

- Requests completed per second.
- Documents processed per minute.
- Jobs completed per hour.

A concurrency model may improve throughput by using idle resources more effectively.

However, throughput eventually encounters constraints such as CPU capacity, database limits, network bandwidth, and external service quotas.

### 9.3 Resource utilization

Resource utilization describes how much of a resource's available capacity is being used.

Relevant resources include:

- CPU.
- Memory.
- Network connections.
- Database connections.
- Worker slots.
- Storage bandwidth.

Increasing concurrency can improve utilization when resources would otherwise remain idle. It can also cause oversubscription, contention, and resource exhaustion.

### 9.4 These metrics must be considered together

A system may increase throughput while also increasing average latency.

For example, a larger queue may allow the service to accept more jobs, but those jobs may wait longer before processing begins.

Likewise, adding more workers may increase CPU utilization without improving completed work if all workers compete for the same database bottleneck.

**Engineering principle:** Optimize the metric that reflects the actual requirement, while monitoring the other metrics for regressions.

---

## 10. Why More Concurrency Can Make a System Slower

Concurrency has costs, and every system has capacity limits.

### 10.1 Scheduling overhead

More execution units can increase scheduling and context-switching overhead.

If tasks are extremely small, the overhead of managing them may be significant compared with the useful work they perform.

### 10.2 Contention

Multiple tasks may compete for:

- Locks.
- Database connections.
- CPU time.
- Memory bandwidth.
- External API rate limits.
- Shared storage.

Increasing the number of tasks can increase waiting time rather than productive work.

### 10.3 Memory pressure

Every task, thread, process, request context, or queued job may consume memory.

If concurrency is unbounded, the application may accumulate too many active tasks or pending requests.

This can lead to excessive memory use, garbage-collection pressure, or process failure.

### 10.4 Downstream saturation

Suppose an API can launch 500 concurrent operations, but the database can efficiently serve only a much smaller number of active queries.

Increasing application concurrency may overload the database without improving end-to-end throughput.

The actual bottleneck is not necessarily the application execution model.

### 10.5 Coordination complexity

More concurrent operations create more possible interactions and failure paths.

The additional complexity can increase debugging time, operational risk, and maintenance costs.

### 10.6 Amdahl's law as an intuition

Amdahl's law describes the limits of parallel speedup when part of a workload must remain sequential.

If a fraction of the work cannot be parallelized, adding more processing resources eventually produces diminishing returns.

For example, if a workflow contains a sequential database transaction that must finish before the next stage can begin, parallelizing unrelated calculations cannot eliminate that dependency.

The exact speedup depends on the sequential fraction and the assumptions of the model.

The practical lesson is simple: identify the portion of work that can actually overlap or execute in parallel before investing in more concurrency.

---

## 11. A Practical Selection Framework

Use the following process when choosing an execution model.

### Step 1: Describe the workload

Identify the dominant operations:

- Network requests.
- Database access.
- CPU computation.
- File processing.
- Background jobs.
- Mixed workflows.

Estimate which operations spend most of their time waiting and which consume CPU.

### Step 2: Identify dependencies

Determine which tasks can run independently and which require previous results.

Concurrency cannot remove genuine data dependencies.

### Step 3: Identify shared resources

List the state and resources that concurrent tasks may access:

- In-memory objects.
- Databases.
- Caches.
- Files.
- Connection pools.
- External services.

Determine which resources require synchronization or rate limiting.

### Step 4: Define requirements

Clarify the important objectives:

- Maximum acceptable latency.
- Required throughput.
- Memory constraints.
- Isolation requirements.
- Failure handling.
- Operational simplicity.

A design optimized for high throughput may not be appropriate when strict per-request latency is the primary objective.

### Step 5: Choose the simplest suitable model

Consider:

- Threads for appropriate concurrent work, particularly blocking operations.
- Processes when separate execution environments or CPU parallelism are valuable.
- Asynchronous I/O when many I/O operations can benefit from non-blocking coordination.
- A hybrid design only when different workload stages justify the additional boundaries.

Verify the behavior of the actual language, runtime, and libraries.

### Step 6: Bound concurrency

Set appropriate limits for:

- Active tasks.
- Threads or processes.
- Open connections.
- Queue capacity.
- Concurrent calls to external services.

The correct limits depend on system capacity and workload characteristics.

### Step 7: Measure the baseline

Before optimizing, collect measurements for:

- Latency distributions.
- Throughput.
- CPU and memory utilization.
- Queue depth.
- Connection-pool utilization.
- Error and timeout rates.

Measurements should represent realistic workloads, not only small development examples.

### Step 8: Test under realistic conditions

Evaluate the design with representative concurrency, data sizes, downstream dependencies, and failure conditions.

Look for bottlenecks, contention, unbounded resource growth, and incorrect assumptions about ordering.

### Step 9: Reevaluate complexity

Ask whether the measured benefit justifies the execution model's maintenance and operational costs.

A simpler implementation may be the better engineering choice if it satisfies the required performance and reliability targets.

---

## 12. Common Mistakes

### Mistake 1: Assuming asynchronous I/O automatically makes CPU-heavy work faster

Asynchronous I/O helps tasks make progress while waiting. It does not automatically create parallel CPU execution.

**Correction:** Use an appropriate CPU execution strategy when parallel computation is needed.

### Mistake 2: Assuming threads always provide CPU parallelism

Thread behavior depends on the language and runtime. Some environments restrict simultaneous execution of certain CPU-bound code paths.

**Correction:** Verify the runtime's threading and parallel-execution guarantees.

### Mistake 3: Assuming processes eliminate concurrency bugs

Processes can still compete over shared databases, files, and external services.

**Correction:** Analyze shared resources at the system boundary, not just process memory.

### Mistake 4: Increasing worker counts without measuring capacity

More workers can overload databases, connection pools, or external APIs.

**Correction:** Measure end-to-end throughput and downstream utilization before increasing concurrency.

### Mistake 5: Choosing an execution model based only on familiarity

A familiar model may not fit the workload's waiting behavior, CPU demand, or isolation requirements.

**Correction:** Start with workload characteristics and operational constraints.

### Mistake 6: Treating a hybrid architecture as automatically superior

Combining threads, processes, and asynchronous tasks can add complexity without meaningful performance improvement.

**Correction:** Introduce multiple models only when the measured benefits justify their communication and lifecycle costs.

### Mistake 7: Ignoring task and queue limits

Unbounded task creation or queue growth can exhaust memory and downstream resources.

**Correction:** Establish capacity limits and explicit overload behavior.

### Mistake 8: Optimizing only for throughput

A system may complete more work per second while producing unacceptable latency or error rates.

**Correction:** Define the service objective and evaluate latency, throughput, resource use, and reliability together.

### Mistake 9: Ignoring the sequential portion of a workflow

Adding parallel execution cannot remove a dependency that requires an earlier operation to finish first.

**Correction:** Map the dependency graph and identify the work that can genuinely overlap.

### Mistake 10: Assuming a successful benchmark proves production suitability

A benchmark may omit realistic data sizes, downstream limits, failure conditions, or workload variation.

**Correction:** Test representative workloads and validate the operational assumptions.

---

## 13. Interview Questions

### Q1. What is a concurrency model?

**Expected answer:**

A concurrency model describes how work is organized, scheduled, and coordinated so multiple tasks can make progress. It influences resource use, communication, isolation, and failure handling.

### Q2. What is the difference between thread-based and process-based concurrency?

**Expected answer:**

Threads in one process normally share memory, which can simplify communication but requires careful shared-state coordination. Processes generally have separate address spaces, providing stronger process-level memory isolation but often requiring explicit communication.

### Q3. When is asynchronous I/O useful?

**Expected answer:**

It is useful when many operations spend substantial time waiting for I/O and the runtime and dependencies support non-blocking operations. It allows other tasks to make progress while operations wait.

### Q4. Why does asynchronous programming not automatically improve CPU-bound workloads?

**Expected answer:**

Asynchronous scheduling allows tasks to yield while waiting, but CPU-heavy work can occupy the execution thread and prevent other tasks from progressing. Parallel CPU execution requires an appropriate runtime and execution strategy.

### Q5. How do I/O-bound and CPU-bound workloads differ?

**Expected answer:**

I/O-bound workloads spend much of their time waiting for external operations. CPU-bound workloads spend much of their time performing computations. The distinction helps determine whether the main opportunity is overlapping waiting or parallelizing computation.

### Q6. Why can increasing the number of threads reduce performance?

**Expected answer:**

Additional threads can increase scheduling overhead, memory use, lock contention, and competition for limited resources. Beyond a useful concurrency level, additional threads may add overhead without increasing throughput.

### Q7. What is a hybrid concurrency model?

**Expected answer:**

A hybrid model combines approaches such as asynchronous I/O, thread pools, and process workers to handle different workload characteristics. It can be effective but adds communication, lifecycle, and operational complexity.

### Q8. How would you choose a model for an API that makes many external requests?

**Expected answer:**

First determine the workload's waiting behavior, library support, latency and throughput requirements, and resource limits. Threads or asynchronous I/O may be suitable, depending on the environment. The choice should be validated under realistic workloads.

### Q9. How would you handle CPU-intensive ranking calculations?

**Expected answer:**

Measure the workload and determine whether parallel CPU execution would help. Depending on the runtime and calculation, suitable options may include processes, native parallel computation, or dedicated workers. Data-transfer costs and task granularity must also be considered.

### Q10. What is Amdahl's law, and why is it relevant?

**Expected answer:**

Amdahl's law describes the limits of parallel speedup when some portion of a workload remains sequential. It reminds engineers that adding processing resources cannot eliminate work that depends on a sequential stage.

### Q11. Why must concurrency be bounded?

**Expected answer:**

Unbounded concurrency can exhaust memory, connection pools, CPU capacity, or downstream services. Limits and backpressure help keep resource usage controlled and overload behavior predictable.

### Q12. What would you measure before changing a concurrency model?

**Expected answer:**

Measure latency distributions, throughput, CPU and memory usage, queue depth, downstream resource utilization, and error rates under representative workloads. Identify the bottleneck before changing the execution model.

---

## 14. Quick Revision

- A concurrency model describes how work is organized, executed, and coordinated.
- Thread-based concurrency uses multiple threads within a process.
- Process-based concurrency uses separate process execution environments.
- Asynchronous I/O allows other tasks to progress while operations wait.
- I/O-bound workloads often benefit from overlapping waits.
- CPU-bound workloads may benefit from parallel execution when the runtime and hardware permit it.
- Thread behavior depends on language and runtime guarantees.
- Processes improve memory isolation but do not eliminate conflicts over external resources.
- Asynchronous I/O does not automatically provide CPU parallelism.
- Hybrid models can fit mixed workloads but increase complexity.
- More concurrency can increase contention, memory pressure, and downstream saturation.
- Latency, throughput, and resource utilization must be considered together.
- Bound active work and queue growth.
- Measure realistic workloads before choosing or changing an execution model.

---

## 15. Key Takeaways

No concurrency model is universally best. The correct choice depends on the workload, runtime guarantees, resource limits, correctness requirements, and operational constraints.

A strong engineering decision starts with the actual work rather than the preferred technology.

When choosing a model:

1. Classify the workload as I/O-bound, CPU-bound, or mixed.
2. Identify dependencies and opportunities for overlap.
3. Map shared resources and coordination requirements.
4. Define latency, throughput, isolation, and reliability targets.
5. Select the simplest suitable execution model.
6. Bound concurrency and downstream resource usage.
7. Measure performance under representative conditions.
8. Reevaluate whether added complexity produces enough benefit.

The goal is not to maximize the number of threads, processes, or tasks. The goal is to make useful progress reliably while meeting the system's performance and maintainability requirements.

The next chapter, **Concurrency Failure Analysis**, focuses on investigating timing-dependent failures, understanding execution traces, and diagnosing concurrency problems that are difficult to reproduce.

---

## 16. Further Reading

- [Python threading documentation](https://docs.python.org/3/library/threading.html) — Thread-based execution and synchronization.
- [Python multiprocessing documentation](https://docs.python.org/3/library/multiprocessing.html) — Process-based execution and communication.
- [Python asyncio documentation](https://docs.python.org/3/library/asyncio.html) — Asynchronous programming and task coordination.

These references illustrate Python-specific execution models. Always verify the actual behavior and limitations of the language, runtime, libraries, and deployment environment used by your application.

---
