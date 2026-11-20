
# Concurrency Fundamentals

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain what concurrency means in software engineering.
- Distinguish sequential execution, concurrency, and parallelism.
- Understand why applications use concurrent execution.
- Explain how concurrency can improve responsiveness and throughput.
- Recognize the difference between making progress on multiple tasks and executing multiple tasks simultaneously.
- Identify situations in which concurrency is useful and situations in which it introduces unnecessary complexity.
- Explain the basic trade-offs involved in introducing concurrency into an application.

The objective is to build a mental model that can be used when reasoning about real applications, backend services, and AI-powered systems.

## 2. Prerequisites

This chapter assumes a basic understanding of:

- Variables, functions, and control flow.
- How a program executes a sequence of instructions.
- The difference between an operation that performs computation and one that waits for an external result.

Refer to **ENG-02 — Programming Foundations** for programming fundamentals.

No detailed knowledge of threads, operating-system scheduling, or synchronization mechanisms is required at this stage. Those concepts are introduced in later chapters.

## 3. Estimated Reading Time

Approximately 15–20 minutes.

The estimate includes the explanations, diagrams, examples, engineering considerations, and revision questions.

## 4. Before We Start

Consider a backend application that receives two requests.

The first request needs to retrieve information from a database. The second request needs to call an external API.

Suppose the database operation takes 500 milliseconds and the external API call takes 800 milliseconds.

A simple implementation might perform the first operation, wait for it to finish, and then start the second operation.

During this process, the application cannot begin the second operation until the first one has completed.

But is that necessary?

If the application is waiting for the database to respond, could it make progress on other work instead of remaining occupied with that one request?

This question leads to one of the central ideas in software engineering: **concurrency**.

Concurrency is not automatically about making a computation faster. It is about organizing work so that multiple tasks can make progress without requiring each task to finish before another begins.

Understanding this distinction is important before learning threads, asynchronous programming, or parallel execution.

## 5. Why Concurrency Exists

### 5.1 The Problem with Strictly Sequential Work

A sequential program performs operations in an established order. Each operation proceeds according to the program's control flow, and dependent operations wait for the results they need.

This is simple to understand and often exactly what a program requires.

However, some operations spend a significant amount of time waiting for something outside the program's immediate computation.

Examples include:

- Waiting for a database query to return.
- Waiting for an HTTP request to complete.
- Reading data from a file.
- Waiting for a user to submit a form.
- Waiting for another component to produce a result.

During a wait, the application may have other work that could proceed independently.

If the application cannot make progress on that work, available resources and opportunities for responsiveness may be wasted.

Concurrency provides ways to organize independent or partially independent work so that progress on one task does not always require every other task to stop.

### 5.2 A Simple Example

Imagine an application that must perform two independent operations:

- Task A: retrieve a database record, taking approximately 500 ms.
- Task B: retrieve information from an external service, taking approximately 800 ms.

For simplicity, assume the durations are stable, both operations can overlap safely, and neither depends on the result of the other.

In a sequential implementation:

```text
Time (ms)  0          500                    1300
           |-----------|-----------------------|
Task A     [ Database ]
Task B                  [ External API         ]
```

The total elapsed time is approximately:

500 ms + 800 ms = 1300 ms.

In an implementation that overlaps the two operations:

```text
Time (ms)  0                         800
           |---------------------------|
Task A     [ Database ]               |
Task B     [ External API             ]
```

The total elapsed time is approximately 800 ms because both operations can progress during overlapping time intervals.

The example illustrates a potential benefit of concurrency. It does not imply that every concurrent implementation will achieve this timing.

Real performance depends on scheduling, resource availability, contention, operation dependencies, and implementation overhead.

### 5.3 The Core Idea

The key question is not simply:

"How can the program execute more instructions at once?"

A better question is:

"How can the program make useful progress on independent work while another task is waiting or otherwise unable to proceed?"

This perspective helps distinguish concurrency from parallelism and prevents engineers from treating every performance problem as a problem that requires more threads or more CPU cores.

## 6. Mental Model

### 6.1 Think in Terms of Tasks and Progress

A task is a unit of work that an application needs to complete.

Examples include:

- Processing an incoming request.
- Fetching data from a database.
- Calling an external API.
- Validating user input.
- Preparing a response.

A task may involve computation, waiting, or both.

Consider two tasks:

```text
Task A: Compute -> Wait -> Process result
Task B: Compute -> Wait -> Process result
```

A sequential arrangement may require Task A to finish before Task B begins.

A concurrent arrangement can allow the tasks to make progress during overlapping periods.

The important concept is **overlapping progress**, not necessarily simultaneous execution.

### 6.2 An Analogy: Preparing Multiple Orders

Imagine a restaurant worker preparing two orders.

For Order A, the worker must wait for an oven to finish cooking. For Order B, the worker can prepare ingredients while the oven is operating.

A strictly sequential workflow might delay all work on Order B until Order A is completely finished.

A better workflow allows the worker to prepare Order B while Order A is cooking.

The overall process can finish sooner because waiting time is used productively.

This analogy has limitations. A software application may execute work on multiple CPU cores, involve many independent tasks, and encounter synchronization problems that have no direct equivalent in the restaurant example.

Nevertheless, it captures the central idea: **waiting for one activity does not always require all other activities to stop**.

### 6.3 Concurrency Does Not Mean Everything Runs Simultaneously

A concurrent application can have multiple tasks whose execution periods overlap even when only one task is executing instructions on a particular CPU core at any instant.

The execution system may switch between tasks, allowing each to make progress at different times.

Alternatively, multiple tasks may execute simultaneously on different CPU cores.

These are different execution situations, even though both may be used to implement concurrent applications.

The distinction leads to two important concepts:

- **Concurrency:** Multiple tasks can make progress during overlapping periods.
- **Parallelism:** Multiple tasks or computations execute simultaneously.

A concurrent design may use parallel execution, but concurrency does not require it.

## 7. Core Concepts

### 7.1 Sequential Execution

Sequential execution means that operations follow an established execution order.

Consider the following pseudocode:

```text
read_database_record()
call_external_service()
combine_results()
```

The external service call starts after the database operation returns.

The final operation combines the results after both preceding operations complete.

This ordering may be necessary when one operation depends on another. It may also be the simplest correct implementation when concurrency provides no meaningful benefit.

Sequential execution offers several advantages:

- Easier control-flow reasoning.
- Fewer coordination requirements.
- Simpler error handling in many cases.
- Fewer concurrency-specific correctness risks.

Its limitation is that independent work may be delayed unnecessarily when operations must wait for external resources.

Sequential execution is not inherently inefficient. It is often the best starting point.

### 7.2 Concurrency

Concurrency allows multiple tasks to make progress during overlapping periods.

A concurrent application may organize work so that a task waiting for a database response does not prevent another independent task from progressing.

Conceptually:

```text
Task A: [Work] [Wait] [Continue]
Task B:      [Work] [Continue]
```

The tasks' timelines overlap.

Concurrency is particularly useful when:

- Multiple independent requests need to be handled.
- An operation waits for an external system.
- An application must remain responsive while work is pending.
- Several independent activities can proceed without waiting for one another to finish completely.

Concurrency also creates additional engineering responsibilities. Tasks may interact, execution order may vary, and shared resources may require coordination.

These correctness concerns are covered in subsequent chapters.

### 7.3 Parallelism

Parallelism means that multiple computations execute at the same time.

For example, a computation might divide a large dataset into independent partitions and process several partitions simultaneously on different CPU cores.

```text
CPU Core 1: [ Compute partition A ]
CPU Core 2: [ Compute partition B ]
CPU Core 3: [ Compute partition C ]
```

If the partitions are sufficiently independent and the system has available resources, parallel execution may reduce the total computation time.

However, parallelism does not guarantee a speedup.

The work may require coordination, data transfer, synchronization, or merging results. These costs can outweigh the benefit of executing multiple computations simultaneously.

### 7.4 Comparing the Three

| Property | Sequential execution | Concurrency | Parallelism |
|---|---|---|---|
| Main idea | Operations follow an execution order | Multiple tasks can make progress during overlapping periods | Multiple computations execute simultaneously |
| Overlapping task timelines | Not required | Yes | Usually, when considering the parallel tasks |
| Simultaneous execution required | No | No | Yes |
| Typical benefit | Simplicity and predictable control flow | Responsiveness and overlapping independent work | Faster completion of suitable computational work |
| Main limitation | Independent work may be delayed | Coordination and correctness can become harder | Resource and coordination overhead can reduce speedup |

Concurrency and parallelism are related but not interchangeable terms.

An application may use concurrency to manage many requests while executing only a portion of their work at a time. It may also use parallel computation to process CPU-intensive work.

## 8. How Concurrency Improves Application Behavior

Concurrency can improve application behavior in several ways.

### 8.1 Responsiveness

Responsiveness describes how quickly an application can react to events or continue serving useful work.

Suppose a user submits a request that triggers an operation waiting for an external service.

If the application can manage other independent requests while that operation is pending, one slow operation does not necessarily prevent all other work from progressing.

This is especially important for interactive applications and backend services handling multiple requests.

However, concurrency alone does not guarantee responsiveness. An application may still become unresponsive if it blocks a critical execution resource, exhausts its capacity, or waits on a dependency required by every request.

### 8.2 Throughput

Throughput describes how much work a system completes per unit of time.

For example, a backend service might process 100 requests per second under one workload and 160 requests per second under another implementation.

The second implementation has higher throughput for that workload if the measurements are comparable.

Concurrency can improve throughput by overlapping waiting periods and keeping available resources productive.

But throughput depends on the workload and system limits. A database connection limit, CPU bottleneck, rate limit, or shared resource can constrain the improvement.

Adding concurrent tasks beyond the system's capacity may increase contention without increasing completed work.

### 8.3 Overlapping Waiting Time

A common opportunity for concurrency appears when tasks spend time waiting for independent operations.

Consider three independent external requests, each taking approximately 400 ms.

Under a strictly sequential arrangement, their combined elapsed time may approach 1200 ms.

If all three can proceed concurrently, the elapsed time may approach 400 ms, excluding overhead.

This is an idealized comparison. It assumes that the service can handle the requests together, that the requests are independent, and that overlapping them does not materially change their individual durations.

The lesson is not that concurrent execution always divides elapsed time by the number of tasks. The lesson is that independent waiting periods may overlap.

## 9. Practical Example: Backend Request Handling

Consider a matchmaking application that needs to retrieve profile information and fetch a user's preference data.

The operations are independent for the purpose of this example.

### Sequential approach

```text
Incoming request
       |
       v
Fetch profile
       |
       v
Fetch preferences
       |
       v
Build response
       |
       v
Return response
```

If fetching the profile takes 100 ms and fetching preferences takes 150 ms, the two fetches may require approximately 250 ms in total, excluding other work.

### Concurrent approach

```text
                  +--> Fetch profile ------+
Incoming request -|                        |--> Build response
                  +--> Fetch preferences --+
                                                   |
                                                   v
                                             Return response
```

If the operations can safely overlap, the combined waiting time may approach the duration of the slower operation: approximately 150 ms, excluding other work and overhead.

The concurrent approach is useful only if the operations are genuinely independent and the implementation correctly coordinates their completion and errors.

If fetching preferences requires an identifier returned by the profile lookup, the operations cannot simply be started independently without changing the workflow.

**Engineering lesson:** Before introducing concurrency, identify the dependencies between operations. Independent work may be overlapped; dependent work must respect the required order.

## 10. Production Perspective

Concurrency is a foundational concept in backend services, database clients, web servers, and AI-powered applications.

Consider an AI application that receives multiple user requests. Each request may involve:

1. Validating input.
2. Retrieving relevant information.
3. Calling an external model API.
4. Processing the response.
5. Returning a result.

Different requests may be at different stages at the same time.

Concurrency can help the application handle this workload efficiently, especially when requests spend substantial time waiting for external services.

However, introducing concurrency requires engineers to consider:

- Whether operations are independent.
- Whether shared resources can be accessed safely.
- Whether the system has sufficient capacity.
- Whether failures can be handled correctly.
- Whether increasing concurrency will create contention or overload dependencies.
- Whether the added implementation complexity is justified.

These concerns become increasingly important in production systems, where timing, workload, and resource availability vary.

This chapter establishes the motivation for concurrency. Detailed shared-state correctness, synchronization, workload selection, and production operational concerns belong to their respective chapters and domains.

## 11. Engineering Decisions and Trade-offs

### 11.1 When Should You Introduce Concurrency?

Concurrency is worth considering when:

- Multiple independent tasks can make progress during overlapping periods.
- Waiting on one task unnecessarily delays other useful work.
- The application must handle multiple requests or activities.
- The expected benefit justifies the additional complexity.

Concurrency may be unnecessary when:

- The workload is small and sequential execution is sufficient.
- Operations depend heavily on one another.
- Coordination costs outweigh the expected benefit.
- The implementation would become substantially harder to reason about without a meaningful improvement.

The decision should be based on the actual workload and requirements rather than a general belief that concurrency always improves performance.

### 11.2 Concurrency Is Not a Substitute for Measurement

Suppose a backend request is slow.

Possible causes include:

- Expensive computation.
- Slow database queries.
- External service latency.
- Resource contention.
- Unnecessary sequential dependencies.

Concurrency may help with some of these problems, but it does not automatically solve them.

For example, if a database query is inefficient, running more queries concurrently may increase database load and make the system less reliable.

The correct engineering process is to understand the bottleneck, identify which work can safely overlap, and evaluate the result.

Detailed measurement and profiling practices belong to ENG-08 — Development Quality.

### 11.3 Correctness Comes Before Speed

A concurrent implementation that responds faster but produces incorrect results is not a successful optimization.

When evaluating a concurrency design, consider:

- Does it preserve the required behavior?
- Are operation dependencies respected?
- Can failures be handled correctly?
- Are resource limits considered?
- Is the complexity justified by the expected benefit?

These questions will become more concrete in the chapters on race conditions, synchronization, and thread safety.

## 12. Common Mistakes and Misconceptions

### Mistake 1: Treating Concurrency and Parallelism as Synonyms

Concurrency concerns overlapping progress. Parallelism concerns simultaneous execution.

A system can coordinate many concurrent tasks without executing all of them simultaneously.

### Mistake 2: Assuming More Concurrency Always Means Better Performance

More concurrent work may increase contention, resource consumption, and coordination overhead.

Performance depends on the workload and available resources.

### Mistake 3: Assuming Concurrency Requires Multiple CPU Cores

Concurrent tasks can make progress through interleaved execution even when they are not executing simultaneously.

Multiple CPU cores are relevant to parallel execution, but concurrency is a broader concept.

### Mistake 4: Making Independent-Looking Operations Concurrent Without Checking Dependencies

Two operations may appear separate but still depend on shared data, ordering, or external side effects.

Their dependencies must be understood before their execution can safely overlap.

### Mistake 5: Using Concurrency to Avoid Understanding a Bottleneck

Concurrency does not automatically improve an inefficient algorithm, an overloaded database, or a rate-limited external dependency.

Identify the actual constraint before changing the execution model.

### Mistake 6: Ignoring Complexity

Concurrency introduces additional behaviors and execution possibilities that engineers must reason about.

If sequential execution already meets the requirements, the simpler solution may be preferable.

## 13. Interview Questions with Expected Answers

### Q1. What is concurrency?

Concurrency is the ability of a system to organize multiple tasks so that they can make progress during overlapping periods. It does not require those tasks to execute simultaneously.

### Q2. What is the difference between concurrency and parallelism?

Concurrency is about overlapping progress among tasks. Parallelism is about executing multiple computations simultaneously. Parallel execution can be used to implement concurrent workloads, but concurrency does not require parallelism.

### Q3. Why do backend applications use concurrency?

Concurrency can allow independent operations to overlap, improve responsiveness, and increase throughput. Its usefulness depends on workload characteristics, operation dependencies, available resources, and coordination costs.

### Q4. Can a single CPU core support concurrency?

Yes. Multiple tasks can make progress through interleaved execution, even if only one task executes instructions on that core at any particular instant.

### Q5. Does concurrency always make a program faster?

No. Concurrency introduces overhead and may increase contention. It is beneficial when the work and system constraints allow useful overlap that outweighs the associated costs.

### Q6. When would you avoid introducing concurrency?

I would avoid it when the workload is small, operations are strongly dependent, the expected benefit is negligible, or the additional coordination complexity is not justified.

### Q7. How would concurrency help an API service that calls two independent external services?

The service may start both calls so their waiting periods overlap. Once both results are available, it can combine them. The actual improvement depends on service capacity, latency, and implementation overhead.

### Q8. Why is identifying operation dependencies important?

Concurrency can only safely overlap operations when their dependencies and required ordering are respected. Starting dependent operations independently may produce incorrect behavior or require additional coordination.

## 14. Quick Revision

- **Sequential execution:** Operations follow an established execution order.
- **Concurrency:** Multiple tasks can make progress during overlapping periods.
- **Parallelism:** Multiple computations execute simultaneously.
- **Responsiveness:** How effectively an application reacts and continues useful work.
- **Throughput:** The amount of work completed per unit of time.
- **Main opportunity:** Overlap independent work, especially when tasks spend time waiting.
- **Main trade-off:** Potential improvements in responsiveness or throughput versus coordination costs and implementation complexity.
- **Key rule:** Understand operation dependencies and the actual bottleneck before introducing concurrency.

## 15. Key Takeaways

1. Concurrency is about organizing overlapping progress, not necessarily simultaneous execution.
2. Parallelism is one way concurrent work may be executed, but the concepts are distinct.
3. Concurrency is useful when independent work can progress without waiting unnecessarily for other tasks.
4. Performance improvements depend on workload characteristics, system capacity, and coordination overhead.
5. Correctness and maintainability remain essential when choosing a concurrent design.
6. The right question is not whether concurrency is possible, but whether it provides a justified benefit for the problem.

## 16. Further Reading

- [Python Documentation — Threading](https://docs.python.org/3/library/threading.html): A language-specific reference for thread-based execution. Use it to connect the general concepts in this chapter with a concrete implementation.
- [Python Documentation — asyncio](https://docs.python.org/3/library/asyncio.html): A reference for asynchronous programming using an event loop. Detailed language-specific implementation is outside this chapter's scope.

These references provide additional context. The concepts and scope boundaries established by the ENG-10 curriculum remain the basis of this chapter.

---
