# Concurrency, Queues, Batching, and Streaming

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why production inference systems need concurrency control.
- Distinguish sequential execution from concurrent request handling.
- Explain the role of workers in an inference-serving system.
- Explain why requests may need to wait in a queue.
- Reason about queue depth, waiting time, and processing capacity.
- Explain why unlimited concurrency is unsafe.
- Describe admission behavior and concurrency limits at a serving level.
- Explain batching, dynamic batching, and micro-batching.
- Reason about the trade-offs between batch size, waiting time, throughput, and latency.
- Explain how streaming changes the response behavior of an inference request.
- Distinguish streaming from making inference itself faster.
- Reason about request lifecycle under increasing concurrent load.
- Make basic serving architecture decisions involving concurrency, queues, batching, and streaming.
- Clearly distinguish serving mechanisms from reliability, capacity planning, and performance optimization.

---

## Prerequisites

Before reading this chapter, you should understand:

- What production inference means.
- What a model-serving system does.
- The difference between a model and an inference service.
- The basic request lifecycle through a serving system.
- The concepts of model loading, serving runtime, and serving replicas.

These concepts are introduced in:

- [`01-Production-Inference-and-Model-Serving.md`](./01-Production-Inference-and-Model-Serving.md)

---

## Estimated Reading Time

**35–45 minutes**

---

## Before We Start

A model can produce an inference result for one request.

Production systems rarely receive only one request.

They receive many requests.

Those requests may arrive:

- one after another,
- at nearly the same time,
- in bursts,
- with different input sizes,
- with different processing times,
- or with different response patterns.

This creates a serving problem.

The question is no longer simply:

> "Can the model produce an answer?"

The question becomes:

> "How should the serving system handle many inference requests at the same time without creating uncontrolled contention, unnecessary waiting, or unpredictable execution?"

This chapter focuses on the mechanisms that sit between incoming requests and model execution:

```text
Incoming Requests
       |
       v
   Admission
       |
       v
 Queue / Scheduling
       |
       v
     Workers
       |
       v
Inference Runtime
       |
       v
 Model Execution
       |
       v
   Responses
```

The mechanisms are related, but they solve different problems.

- **Admission** determines whether incoming work enters the serving execution path.
- **Concurrency** determines how much inference work may be active at once.
- **Queues** organize work that cannot execute immediately.
- **Scheduling** determines which waiting work should be selected for execution.
- **Batching** combines compatible work into larger execution units.
- **Streaming** changes how results are delivered to the caller.

Understanding these distinctions is essential for production AI serving.

---

# 1. Why Concurrent Inference Exists

A simple inference system can be imagined as:

```text
Request
   |
   v
Model
   |
   v
Response
```

This is sufficient for a single request.

Now consider:

```text
Request A ----\
Request B -----\
Request C ------> Serving System ---> Model
Request D -----/
```

The serving system must decide what happens when multiple requests arrive.

If every request executes strictly one after another:

```text
A -> Model -> Response
B -> Model -> Response
C -> Model -> Response
D -> Model -> Response
```

the system is sequential.

That may be acceptable for some workloads.

But if requests can safely overlap:

```text
A ----\
B -----+--> Serving Runtime
C ----/
```

the system can operate concurrently.

The important engineering question is therefore not:

> "Can we make everything concurrent?"

It is:

> "What level and type of concurrency is appropriate for this inference workload and serving runtime?"

---

# 2. Sequential vs Concurrent Inference

## 2.1 Sequential Execution

In sequential execution, the serving system processes one inference operation before starting another.

```text
Time ------------------------------------------------>

Request A: [==========]
Request B:              [==========]
Request C:                            [==========]
```

The next request waits for the previous execution to complete.

### Advantages

Sequential execution can be:

- simple,
- predictable,
- easy to reason about,
- easier to isolate from shared-state problems.

### Limitations

If requests can safely overlap, strict sequential execution may leave available processing resources underused.

For example, if part of the serving runtime can work on another request while the first request is waiting on an internal operation, sequential handling may unnecessarily serialize work.

However, this does **not** mean concurrency is always better.

---

## 2.2 Concurrent Execution

Concurrent serving allows multiple requests to be active at the same time.

```text
Time ------------------------------------------------>

Request A: [==========]
Request B:    [========]
Request C:       [===========]
```

The exact meaning of "concurrent" depends on the serving runtime.

It may involve:

- multiple worker processes,
- multiple threads,
- asynchronous execution,
- runtime-managed request concurrency,
- accelerator-level parallel execution,
- or combinations of these mechanisms.

Therefore:

> **Concurrency is a workload and runtime behavior, not simply a decision to create more threads.**

This distinction matters for AI workloads because model inference can have very different execution characteristics from ordinary request processing.

---

# 3. Why Unlimited Concurrency Is Unsafe

Suppose a service receives 100 requests.

A naive design might attempt to execute all 100 immediately.

```text
100 Requests
     |
     v
100 Active Inferences
```

This can create contention for shared resources.

Possible effects include:

- increased memory consumption,
- contention for accelerator resources,
- longer execution times,
- increased queueing elsewhere,
- unpredictable latency,
- interference between requests,
- and eventually failed or rejected work.

The problem is not that concurrency itself is bad.

The problem is **uncontrolled concurrency**.

A serving system therefore needs some mechanism to determine how much work can be active at once.

Conceptually:

```text
Incoming Requests
        |
        v
  Concurrency Limit
        |
   +----+----+
   |         |
Allowed    Waiting
   |         |
   v         v
Workers     Queue
```

The appropriate limit depends on the workload and serving architecture.

There is no universal value such as "10 concurrent requests is correct."

---

# 4. Workers and Inference Execution

A serving system may use workers to process requests.

A simplified model is:

```text
                +--> Worker 1 --> Model Execution
Requests --> Queue
                +--> Worker 2 --> Model Execution
                +--> Worker 3 --> Model Execution
```

A worker represents an execution path capable of handling inference work.

The implementation may differ between serving runtimes.

The important concept is:

> **Workers provide execution capacity for active requests, while the queue provides a place for work that cannot execute immediately.**

Workers do not necessarily mean independent copies of the model.

Depending on the serving architecture, workers may:

- share model state,
- operate in separate processes,
- use different execution contexts,
- or interact with a shared inference runtime.

The relationship between workers and model resources is therefore architecture-dependent.

---

# 5. The Request Lifecycle Under Load

Consider a serving system with limited concurrent execution.

```text
Incoming Requests
       |
       v
   Admission
       |
       v
     Queue
       |
       v
  Scheduling
       |
       v
    Workers
       |
       v
Inference Runtime
       |
       v
 Model Execution
       |
       v
   Response
```

When traffic is low, requests may move through this path quickly.

```text
Request
   |
   v
Admission
   |
   v
Worker
   |
   v
Model
   |
   v
Response
```

When traffic increases:

```text
Request A --> Worker
Request B --> Worker
Request C --> Queue
Request D --> Queue
Request E --> Queue
```

The queue becomes important because not every request can execute immediately.

This introduces a new component of request latency:

```text
Total Request Time
        |
        +--> Waiting Time
        |
        +--> Execution Time
```

The model may have the same execution behavior, while the user experiences a longer response time because the request waited before execution.

---

# 6. Admission, Queues, and Scheduling

These mechanisms are closely related but have different responsibilities.

| Mechanism | Primary Question |
|---|---|
| **Admission** | Should this incoming request enter the serving execution path? |
| **Concurrency limit** | How much inference work may be active simultaneously? |
| **Queue** | Where does accepted but not-yet-executing work wait? |
| **Scheduling** | Which waiting work should be selected for execution? |

This distinction matters because a request can be:

1. newly arrived,
2. admitted,
3. waiting in a queue,
4. selected for execution,
5. actively executing,
6. or returning a response.

The serving system therefore needs more than simply "workers."

It needs a controlled transition between these states.

---

## 7. Queues

## 7.1 Why Queues Exist

A queue manages work that has arrived but cannot yet execute.

For example:

```text
Request A ----\
Request B -----\
Request C ------> Queue ---> Worker
Request D -----/
```

The queue separates:

- **request arrival**
from
- **inference execution**.

This separation allows the serving system to coordinate work when demand and immediate execution capacity do not match.

---

## 7.2 Queue Depth

Queue depth is the amount of work currently waiting.

For example:

```text
Worker capacity: 2

Incoming:
A B C D E F

Active:
A B

Waiting:
C D E F
```

The queue depth is **4 waiting requests**.

Queue depth is useful because it tells us whether requests are accumulating before execution.

However:

> **Queue depth alone does not tell us whether the system is healthy or unhealthy.**

A queue may briefly contain requests during a short burst and then drain.

A queue that continuously grows is a different situation.

---

## 7.3 Queue Growth

Consider:

```text
Arrival rate > Processing rate
```

If requests arrive faster than the system can process them, waiting work accumulates.

Conceptually:

```text
Requests
   |
   v
++++++++++++
   |
   v
  Queue
  +++++
  +++++
  +++++
  +++++
   |
   v
Workers
```

As the queue grows:

1. more requests wait,
2. waiting time increases,
3. response latency increases,
4. eventually the system may reach a limit where additional work cannot be accepted.

This is a fundamental property of queueing systems.

A queue therefore does not create processing capacity.

It only organizes work that is waiting for processing.

---

# 8. Bounded vs Unbounded Queues

## 8.1 Unbounded Queue

An unbounded queue allows waiting work to continue accumulating.

```text
Requests
   |
   v
Queue
++++++++++++++++++++++++
++++++++++++++++++++++++
++++++++++++++++++++++++
```

This can make the system appear to accept more traffic, but waiting time can grow without a useful upper bound.

The system may eventually consume significant memory or produce extremely stale requests.

---

## 8.2 Bounded Queue

A bounded queue establishes a limit.

```text
Requests
   |
   v
+-------------+
| Queue       |
|-------------|
| A           |
| B           |
| C           |
| D           |
+-------------+
      |
   limit reached
```

Once the queue reaches its limit, the serving system must have some defined admission behavior.

Conceptually, requests may be:

- accepted,
- delayed,
- rejected,
- or handled through another serving path.

The exact behavior is architecture-dependent.

The important principle is:

> **A queue limit makes the boundary between accepted work and excess work explicit.**

Detailed overload handling, backpressure strategy, retries, degradation, and failure recovery belong to reliability engineering rather than this chapter.

---

# 9. Admission and Concurrency Limits

Admission determines whether an incoming request can enter active processing or waiting.

A simplified model is:

```text
Incoming Request
       |
       v
   Admission
       |
   +---+---+
   |       |
Accept    Cannot accept
   |       |
   v       v
Queue     Defined
/Worker   behavior
```

Concurrency limits restrict how much inference work can be active simultaneously.

For example:

```text
Maximum active inference = 4
```

If four requests are already executing:

```text
A --> Worker
B --> Worker
C --> Worker
D --> Worker

E --> Waiting
F --> Waiting
```

The serving system does not need to start E and F immediately.

This protects the serving runtime from uncontrolled concurrent execution.

The exact admission policy is a serving design decision.

---

# 10. Scheduling

Once requests are waiting, the serving system needs to decide which work should execute next.

This is the role of scheduling.

Conceptually:

```text
Queue
  |
  v
Scheduling Decision
  |
  +----> Worker 1
  |
  +----> Worker 2
  |
  +----> Batch Formation
```

Scheduling can determine:

- which waiting request is selected,
- when work is dispatched,
- whether compatible requests should be grouped,
- and how available execution paths are used.

The exact scheduling policy depends on the serving runtime and workload.

The important point is:

> **Scheduling connects waiting work with execution.**

Scheduling is therefore closely related to concurrency and batching, but it is not the same as either one.

---

# 11. Concurrency Is Not Capacity Planning

Concurrency and capacity are related, but they are not the same concept.

**Concurrency** asks:

> How many requests or inference operations may be active at the same time?

**Capacity planning** asks:

> How much workload can the system sustain, and what resources are required as demand changes?

For example:

```text
Concurrency Limit = 8
```

does not mean:

```text
System capacity = 8 requests/second
```

A request may take 100 ms or 10 seconds.

Therefore, the same concurrency limit can produce very different throughput depending on workload characteristics.

Detailed capacity modeling, demand forecasting, autoscaling, burst capacity, and load testing belong to **PROD-07**.

---

# 12. Batching

Concurrency handles multiple requests as active work.

Batching asks a different question:

> Can multiple compatible requests be combined into one model execution unit?

Consider individual requests:

```text
Request A --> Model
Request B --> Model
Request C --> Model
```

With batching:

```text
Request A --\
Request B ----> Batch --> Model
Request C --/
```

The model runtime processes the requests together as one batch.

Batching is especially relevant when the inference runtime and model support batched execution.

---

# 13. Why Batching Can Help

Suppose a runtime can execute multiple compatible inputs together efficiently.

Without batching:

```text
A --> Execute
B --> Execute
C --> Execute
D --> Execute
```

With batching:

```text
A --\
B ---\
C ----> Batch --> Execute
D ---/
```

The combined execution may use available processing resources more effectively.

This can improve throughput or resource utilization.

But batching introduces waiting.

The system may need to wait for additional compatible requests before forming a batch.

Therefore:

> **Batching trades some waiting for potentially more efficient execution.**

This is one of the most important serving trade-offs in this chapter.

---

# 14. Batch Formation

A serving system needs to decide when a batch should execute.

Conceptually, it can consider:

- whether enough requests have arrived,
- whether requests are compatible,
- whether a waiting limit has been reached,
- whether the runtime can execute the resulting batch,
- and whether additional waiting is worthwhile.

A simplified flow is:

```text
Incoming Requests
       |
       v
Batch Formation
       |
       +---- batch ready ----> Model
       |
       +---- wait for more --> Batch Formation
```

If the system waits too long:

```text
More batching
     |
     v
Potentially better utilization
     |
     v
More request waiting
     |
     v
Higher latency
```

If it executes too quickly:

```text
Less waiting
     |
     v
Smaller batches
     |
     v
Potentially lower batching efficiency
```

There is therefore no universally optimal batch size or waiting period.

---

# 15. Dynamic Batching

A fixed batch size assumes the system will always execute exactly the same number of requests together.

Production traffic is rarely that predictable.

Dynamic batching allows the serving system to form batches based on requests that are available at runtime.

For example:

```text
Time 1:
A B

Time 2:
C D E

Time 3:
F
```

The actual batch size changes with incoming work.

Conceptually:

```text
Requests
   |
   v
Dynamic Batch Formation
   |
   +--> Batch 2
   |
   +--> Batch 3
   |
   +--> Batch 1
```

Dynamic batching is useful when request arrival is variable and the serving runtime supports compatible batched execution.

It does not eliminate the latency-throughput trade-off.

---

# 16. Micro-Batching

Micro-batching forms relatively small batches from requests arriving over a short interval.

For example:

```text
Requests arriving:

A   B   C   D
|   |   |   |
+---+---+---+
    |
    v
Micro-batch
    |
    v
Model Execution
```

The goal is to obtain some batching benefit without waiting for a very large batch.

Micro-batching can therefore sit between two extremes:

```text
Immediate execution
        |
        | less waiting
        v
Small micro-batches
        |
        | more waiting
        v
Large batches
```

The appropriate strategy depends on the workload and runtime.

---

# 17. Batch Size Trade-offs

Batch size is not simply a "bigger is better" parameter.

A larger batch may provide:

- more efficient execution,
- better utilization,
- higher throughput.

But it may also introduce:

- more waiting,
- higher memory requirements,
- greater variability in completion time,
- more scheduling complexity,
- compatibility constraints.

A simplified trade-off looks like:

| Smaller Batches | Larger Batches |
|---|---|
| Less waiting | More potential waiting |
| Lower batching delay | Higher batching delay |
| Potentially lower per-request latency | Potentially higher per-request latency |
| Lower resource requirement per execution | Higher resource requirement per execution |
| Potentially lower throughput | Potentially higher throughput |

The correct decision depends on the workload.

For example, an interactive request may prioritize fast initial response, while an offline inference workload may prioritize throughput.

---

## 18. Batching and Request Compatibility

Not every request can necessarily be placed into the same batch.

Compatibility may depend on the model and serving runtime.

Examples include differences in:

- input shape,
- input modality,
- request type,
- model,
- execution requirements,
- generation behavior.

Therefore, batching requires more than simply collecting requests.

The serving system needs to determine whether requests can be executed together.

This is one reason dynamic batching introduces scheduling complexity.

---

## 19. Concurrency and Batching Are Different

These concepts are often confused.

### Concurrency

Multiple requests are active or being processed at the same time.

```text
A --> Execution
B --> Execution
C --> Execution
```

### Batching

Multiple compatible requests are combined into an execution unit.

```text
A --\
B ---+--> Batch --> Execution
C --/
```

They can also be used together.

For example:

```text
Incoming Requests
       |
       v
Admission
       |
       v
Queue
       |
       v
Batch Formation
       |
       v
Inference Runtime
       |
       v
Model
```

The system may have multiple batches active concurrently depending on the serving architecture.

---

# 20. Streaming

So far, we have considered a request where the server produces a complete result and then sends it back.

For example:

```text
Request
   |
   v
Inference
   |
   v
Complete Result
   |
   v
Response
```

Streaming changes the delivery model.

Instead of waiting for the complete result, the serving system can deliver partial results as they become available.

```text
Request
   |
   v
Inference
   |
   +----> Partial Result 1
   |
   +----> Partial Result 2
   |
   +----> Partial Result 3
   |
   v
Completion
```

This is particularly relevant to generative AI workloads where output may be produced incrementally.

---

# 21. Streaming vs Non-Streaming

A non-streaming request can be represented as:

```text
Client
  |
  | Request
  v
Serving
  |
  | Complete inference
  v
Complete Response
  |
  v
Client
```

A streaming request can be represented as:

```text
Client
  |
  | Request
  v
Serving
  |
  +----> Partial output
  |
  +----> Partial output
  |
  +----> Partial output
  |
  +----> Completion
  |
  v
Client
```

The inference work may be similar.

What changes is **how the result is delivered**.

This distinction is critical.

> **Streaming does not automatically make inference faster.**

It can make the system feel more responsive because the client receives useful output earlier.

---

# 22. Time to First Output

For streaming workloads, an important user-visible concept is the time until the first useful output appears.

Consider:

```text
Request
   |
   | waiting + initial processing
   v
First Output
   |
   | continued generation
   v
Final Output
```

This creates two useful points in the request lifecycle:

- **Time to first output**
- **Time to completion**

A system may therefore have:

```text
Fast first output
+
Long total generation time
```

or:

```text
Slow first output
+
Short remaining generation time
```

These produce different user experiences.

Detailed performance optimization of these metrics belongs to **PROD-08**. Here, the goal is to understand their role in serving behavior.

---

# 23. Incremental Output

Generative models may produce output incrementally.

For example:

```text
Inference starts
      |
      v
"Hello"
      |
      v
"Hello, how"
      |
      v
"Hello, how can"
      |
      v
"Hello, how can I help?"
      |
      v
Complete
```

The serving system can expose these intermediate outputs to the client.

This is useful for:

- interactive text generation,
- conversational interfaces,
- long-running generation,
- user interfaces where partial progress is valuable.

Streaming therefore changes the request-response interaction without changing the fundamental ownership of inference execution.

---

# 24. Connection and Response Lifecycle

Streaming introduces a longer-lived response interaction.

A simplified lifecycle is:

```text
Request
   |
   v
Inference Begins
   |
   v
First Output
   |
   v
More Output
   |
   v
Completion
```

The serving system must maintain the response path while output is still being generated.

This creates additional considerations around:

- partial results,
- completion,
- cancellation,
- client disconnects,
- long-running generation,
- and resource occupancy.

These are serving concerns.

Detailed network protocol behavior is outside the scope of this chapter.

---

# 25. Cancellation

A streaming request may continue generating output for some time.

The client may no longer want the result.

For example:

```text
Client
   |
   | Request
   v
Generation
   |
   | Output 1
   | Output 2
   | Output 3
   |
   X Client cancels
```

The serving system may need to recognize the cancellation and stop or terminate the associated work when the architecture supports it.

This matters because continuing unnecessary inference consumes serving resources.

The exact cancellation mechanism depends on the serving runtime and interface.

> **Cancellation is introduced here as part of the serving request lifecycle. Detailed cancellation policy, client retry behavior, failure handling, and reliability consequences belong to PROD-06.**

The important serving principle is:

> **Long-running inference should have a defined lifecycle from admission through completion or cancellation.**

---

# 26. Request Lifecycle Under Increasing Load

Consider a serving system with limited execution capacity.

### Low load

```text
Request
   |
   v
Admission
   |
   v
Worker
   |
   v
Model
   |
   v
Response
```

Most requests execute immediately.

### Moderate load

```text
A --> Worker
B --> Worker
C --> Queue
D --> Queue
```

Some requests wait.

### Higher load

```text
A --> Worker
B --> Worker
C --> Worker
D --> Worker

E --> Queue
F --> Queue
G --> Queue
H --> Queue
```

Waiting becomes more significant.

### Sustained overload

```text
Incoming Traffic
       |
       v
Admission
       |
       v
Queue
+++++++++++++++
+++++++++++++++
+++++++++++++++
       |
       v
Workers
```

The queue may continue growing if arrival exceeds processing.

This illustrates an important principle:

> **Concurrency limits, queues, and batching manage execution behavior; they do not create additional capacity.**

Capacity planning and scaling decisions belong to **PROD-07**.

---

# 27. Combining Concurrency, Queues, and Batching

These mechanisms often operate together.

Consider:

```text
                    Incoming Requests
                           |
                           v
                      Admission
                           |
                           v
                         Queue
                           |
                           v
                    Batch Formation
                           |
                           v
                      Scheduling
                           |
                 +---------+---------+
                 |                   |
                 v                   v
             Worker 1            Worker 2
                 |                   |
                 +---------+---------+
                           |
                           v
                  Inference Runtime
                           |
                           v
                          Model
                           |
                           v
                      Responses
```

Each mechanism has a distinct responsibility:

| Mechanism | Primary Question |
|---|---|
| Admission | Should this work enter the serving path? |
| Concurrency | How much work is active? |
| Queue | Where does waiting work go? |
| Scheduling | Which work executes next? |
| Batching | Which compatible requests execute together? |
| Streaming | How are results delivered over time? |

This separation is useful when reasoning about serving architectures.

---

# 28. Example: Text Generation Service

Imagine a text generation service receiving requests from several applications.

```text
Application A ----\
Application B -----\
Application C ------> Serving Service
Application D -----/
```

The requests may vary in:

- prompt length,
- requested output length,
- generation parameters,
- urgency,
- and expected response behavior.

A serving design might conceptually use:

```text
Requests
   |
   v
Admission
   |
   v
Queue
   |
   v
Scheduling
   |
   v
Generation Workers
   |
   v
Model
   |
   +----> Streaming Output
```

The serving system may allow multiple requests to be active while using batching where the runtime supports compatible generation requests.

The engineering challenge is balancing:

- concurrent work,
- waiting,
- batching opportunities,
- resource contention,
- and response behavior.

---

# 29. Example: Image Classification

Consider an image classification service.

Requests arrive:

```text
Image 1
Image 2
Image 3
Image 4
```

Instead of executing each image separately:

```text
Image 1 --> Model
Image 2 --> Model
Image 3 --> Model
Image 4 --> Model
```

the serving system may form:

```text
Image 1 --\
Image 2 ---\
Image 3 ----> Batch --> Model
Image 4 ---/
```

For a high-volume classification workload, batching may provide useful execution efficiency.

However, if the application requires very low response latency, waiting to form a batch may not be desirable.

The serving architecture therefore depends on workload requirements.

---

# 30. Example: Mixed Interactive and Batch Workloads

Suppose one serving system receives:

```text
Interactive requests
        +
Offline inference requests
```

The two workloads may have different priorities.

Interactive requests may care strongly about:

- fast response,
- fast first output,
- predictable waiting.

Offline workloads may care more about:

- total throughput,
- efficient batch execution,
- resource utilization.

Putting both workloads into the same execution path can create contention.

This illustrates why serving architecture and workload characteristics must be considered together.

Whether the workloads should share a serving target or use isolated targets is an architectural decision.

---

# 31. Engineering Decisions and Trade-offs

## 31.1 Higher Concurrency vs Resource Contention

Higher concurrency can allow more requests to make progress.

But excessive concurrency can increase contention.

```text
More concurrency
      |
      v
More active work
      |
      v
More resource contention
      |
      v
Potentially worse latency
```

Therefore:

> **More concurrency is not automatically better.**

---

## 31.2 Queueing vs Immediate Execution

A queue allows work to wait rather than immediately competing for execution.

Benefits:

- controlled execution,
- organized scheduling,
- explicit waiting behavior.

Costs:

- additional waiting,
- increased latency,
- potential accumulation.

---

## 31.3 Batching vs Immediate Execution

Immediate execution:

```text
Request --> Execute
```

Batching:

```text
Requests --> Wait --> Batch --> Execute
```

Batching can improve execution efficiency but introduces waiting.

The correct decision depends on whether the workload prioritizes latency, throughput, or another serving objective.

---

## 31.4 Streaming vs Complete Responses

Complete response:

```text
Inference --> Complete Response
```

Streaming:

```text
Inference --> Partial Output --> Partial Output --> Completion
```

Streaming can improve perceived responsiveness.

But it also creates a longer-lived response lifecycle and additional serving complexity.

---

## 31.5 Shared vs Isolated Execution

Multiple workloads may share serving resources:

```text
Workload A ---\
Workload B ----> Shared Serving
Workload C ---/
```

Or they may be isolated:

```text
Workload A --> Serving A
Workload B --> Serving B
Workload C --> Serving C
```

Shared execution can improve resource efficiency.

Isolation can provide clearer resource boundaries and reduce interference.

The trade-off depends on workload characteristics and architecture.

Detailed capacity and cost modeling belong to **PROD-07** and **PROD-08**.

---

# 32. Production Perspective

A production serving system should not be designed around a single happy-path request.

It should be reasoned about as a workload-processing system.

Instead of:

```text
Request -> Model -> Response
```

think:

```text
                    +------------------+
                    | Incoming Traffic|
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |    Admission     |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | Queue / Scheduler|
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | Batch Formation  |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |     Workers      |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | Inference Runtime|
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |      Model       |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | Response Delivery|
                    +------------------+
```

This mental model helps engineers reason about where waiting, execution, and response behavior occur.

---

# 33. What This Chapter Does Not Cover

This chapter intentionally does **not** become a complete treatment of adjacent production domains.

### Not Packaging and Runtime Contracts

Packaging, dependency management, containers, configuration, runtime contracts, and artifact identity belong to:

- **PROD-02 — Production AI Application Packaging and Runtime**

### Not Deployment and Release Engineering

Deployment workflows, CI/CD, artifact promotion, infrastructure provisioning, progressive delivery, and rollback belong to:

- **PROD-04 — Production AI Deployment and Release Engineering**

### Not Observability

Telemetry architecture, signal design, observability pipelines, and detailed monitoring strategy belong to:

- **PROD-05 — Production AI Observability and Telemetry**

### Not Reliability Engineering

Timeouts, retries, failure isolation, reliability backpressure, graceful degradation, fallback strategy, and dependency failure handling belong to:

- **PROD-06 — Production AI Reliability Engineering**

This chapter explains queues, admission, scheduling, and cancellation as serving mechanisms. It does not teach reliability-oriented backpressure strategy, retry policy, failure recovery, or degradation design.

### Not Capacity Planning and Autoscaling

Capacity modeling, demand forecasting, autoscaling, resource capacity, burst capacity, GPU scaling, and load testing belong to:

- **PROD-07 — Production AI Capacity and Scaling**

This chapter explains concurrency and queue behavior but does not determine how much infrastructure must be provisioned.

### Not Performance Optimization

Detailed inference optimization, latency optimization, throughput optimization, resource efficiency, benchmarking, and cost-performance optimization belong to:

- **PROD-08 — Production AI Performance and Cost Optimization**

This chapter introduces batching and serving trade-offs because they are necessary to understand serving behavior. Detailed optimization techniques are intentionally deferred.

---

## 34. Common Mistakes and Misconceptions

## Mistake 1: "More concurrency always means better throughput."

Not necessarily.

Higher concurrency can increase contention and produce worse execution behavior.

Concurrency must match the serving runtime and workload.

---

## Mistake 2: "A queue solves overload."

A queue only stores waiting work.

If requests continuously arrive faster than they can be processed, the queue can continue growing.

Queueing is a serving mechanism, not a capacity solution.

---

## Mistake 3: "Batching always improves performance."

Batching may improve execution efficiency, but it can also increase waiting time and memory requirements.

The correct question is:

> "What trade-off does batching create for this workload?"

---

## Mistake 4: "A larger batch is always better."

A larger batch can increase efficiency, but it may also increase:

- waiting,
- memory requirements,
- scheduling complexity,
- and latency.

---

## Mistake 5: "Streaming makes inference faster."

Streaming changes result delivery.

It may reduce the time until the user sees useful output, but it does not automatically reduce total inference work.

---

## Mistake 6: "Concurrency means creating more threads."

Concurrency is a broader serving concept.

The implementation may use threads, processes, asynchronous execution, runtime-managed concurrency, accelerator execution, or other mechanisms.

---

## Mistake 7: "Queues and workers are the same thing."

They serve different purposes.

- **Queue:** waiting work.
- **Worker:** execution path.

---

## Mistake 8: "If requests are queued, they are safe."

Queueing does not guarantee safe resource usage.

A poorly designed queue can accumulate excessive work and increase latency or resource consumption.

---

## Mistake 9: "Streaming is only a frontend feature."

Streaming changes the server-side response lifecycle as well.

The server must support incremental delivery and maintain the request until completion or cancellation.

---

## Mistake 10: "Concurrency is the same as capacity."

Concurrency describes active work.

Capacity describes how much workload the system can sustain.

They are related but not interchangeable.

---

## Mistake 11: "Batching and concurrency are alternatives."

They solve different problems and can be combined.

A serving system may concurrently process multiple batches.

---

## Mistake 12: "Serving is solved once a model can answer requests."

A production serving system must also define how requests are admitted, scheduled, executed, queued, batched, and responded to under realistic workload conditions.

---

## 35. Interview Questions and Expected Answers

## Question 1

**What problem does concurrency solve in an inference-serving system?**

### Expected Answer

Concurrency allows multiple inference requests to be active or processed without strictly serializing all work. The appropriate level depends on the runtime, model, and workload. More concurrency is not automatically better because excessive concurrency can create resource contention.

---

## Question 2

**Why would a serving system use a queue?**

### Expected Answer

A queue holds requests that cannot execute immediately. It separates request arrival from execution and allows the serving system to coordinate work. It does not create additional processing capacity.

---

## Question 3

**What happens if requests arrive faster than workers can process them?**

### Expected Answer

Waiting work accumulates in the queue, increasing queue depth and request waiting time. If the condition persists, the queue may reach its limit and the system needs a defined admission behavior.

---

## Question 4

**Why is unlimited concurrency dangerous?**

### Expected Answer

Unlimited concurrency can create uncontrolled resource contention, memory pressure, unpredictable execution time, and degraded latency. A serving system generally needs controlled concurrency.

---

## Question 5

**What is batching?**

### Expected Answer

Batching combines multiple compatible inference requests into a single execution unit when the model runtime supports it.

---

## Question 6

**Why can batching improve throughput?**

### Expected Answer

The runtime may execute multiple compatible inputs more efficiently together, improving utilization and reducing the overhead of processing each request independently.

---

## Question 7

**Why can batching increase latency?**

### Expected Answer

The serving system may wait for additional compatible requests before executing the batch. That waiting time increases request latency.

---

## Question 8

**What is dynamic batching?**

### Expected Answer

Dynamic batching forms batches at runtime based on requests that are available and compatible, rather than relying on a fixed batch size.

---

## Question 9

**What is the difference between concurrency and batching?**

### Expected Answer

Concurrency controls how much work can be active at once. Batching combines multiple compatible requests into one execution unit. They can be used together.

---

## Question 10

**Does streaming make model inference faster?**

### Expected Answer

Not necessarily. Streaming changes how output is delivered. It can reduce time to first visible output and improve perceived responsiveness, but it does not automatically reduce total inference time.

---

## Question 11

**Why is streaming useful for generative AI?**

### Expected Answer

Generative models often produce output incrementally. Streaming allows partial output to reach the client before the entire generation is complete, which is useful for interactive applications and long-running generation.

---

## Question 12

**What is the difference between time to first output and total completion time?**

### Expected Answer

Time to first output measures how long it takes before the client receives the first useful result. Total completion time measures how long the request takes to finish completely. A streaming system can provide an early first output even when total generation takes significantly longer.

---

## Question 13

**A team says, "We can solve our traffic problem by increasing concurrency." What would you ask?**

### Expected Answer

Ask what the current bottleneck is, how the inference runtime behaves under concurrent execution, whether resource contention exists, whether queueing is occurring, and what the workload's processing characteristics are. Increasing concurrency without understanding the workload may worsen latency.

---

## Question 14

**A team says, "Batch size should always be as large as possible." What is wrong with this reasoning?**

### Expected Answer

Larger batches may improve execution efficiency, but they can increase waiting time, memory requirements, and latency. The appropriate batch size depends on workload and serving objectives.

---

## Question 15

**What is the relationship between queue depth and latency?**

### Expected Answer

As more requests wait in the queue, waiting time generally increases. However, queue depth is not itself a complete measure of system health because transient bursts and processing rates also matter.

---

## Question 16

**Can a queue create more serving capacity?**

### Expected Answer

No. A queue organizes waiting work. It does not increase the rate at which the model can process requests.

---

## Question 17

**An AI application generates long responses. Why might streaming be preferable to returning one complete response?**

### Expected Answer

Streaming can provide partial results earlier, improving perceived responsiveness and allowing the user to start consuming output before generation completes.

---

## Question 18

**What is the difference between a serving queue and reliability backpressure?**

### Expected Answer

A serving queue is an execution mechanism that holds work waiting for inference processing. Reliability backpressure is a broader strategy for controlling work when downstream capacity or dependencies are under stress. Detailed reliability backpressure belongs to PROD-06.

---

## Question 19

**How would you explain concurrency versus capacity to a junior engineer?**

### Expected Answer

Concurrency is how much work is active at one time. Capacity is how much workload the system can sustain. A concurrency limit of 10 does not mean the system can process 10 requests per second.

---

## Question 20

**An image classification service receives thousands of compatible requests. Would you immediately recommend batching?**

### Expected Answer

Not immediately. First determine the latency requirements, request compatibility, model/runtime support for batching, traffic pattern, and whether the waiting introduced by batch formation is acceptable. Batching may be useful, but it is a workload-dependent decision.

---

## 36. Quick Revision

### Admission

Determines whether incoming work enters the serving execution path.

### Concurrency

Controls how much inference work can be active at once.

### Workers

Provide execution paths for serving inference work.

### Queue

Holds requests that cannot execute immediately.

### Queue Depth

Represents waiting work at a point in time.

### Scheduling

Determines which waiting work should be selected for execution and, where applicable, how compatible work is grouped.

### Batching

Combines compatible requests into a single execution unit.

### Dynamic Batching

Forms batches based on requests available at runtime.

### Micro-Batching

Forms relatively small batches over short intervals.

### Streaming

Delivers inference results incrementally instead of waiting for the complete result.

### Time to First Output

Measures how quickly the first useful output becomes available.

### Completion Time

Measures how long the request takes to finish completely.

### Critical Relationship

```text
Admission
    |
    v
Should this work enter the serving path?

Concurrency
    |
    v
How much work is active?

Queue
    |
    v
Where does waiting work go?

Scheduling
    |
    v
Which work executes next?

Batching
    |
    v
Which compatible requests execute together?

Streaming
    |
    v
How are results delivered over time?
```

---

# 37. Key Takeaways

1. Production inference involves handling many requests, not just executing one model call.
2. Concurrency allows multiple requests to be active, but uncontrolled concurrency can create resource contention.
3. Workers provide execution paths; queues hold work that cannot execute immediately.
4. Admission determines whether incoming work enters the serving execution path.
5. Scheduling connects waiting work with execution.
6. Queueing separates request arrival from inference execution.
7. Queue growth occurs when incoming work consistently exceeds processing ability.
8. A queue does not create additional capacity.
9. Batching combines compatible requests into a shared execution unit.
10. Batching can improve throughput or utilization but may increase waiting and latency.
11. Dynamic batching adapts batch formation to runtime traffic.
12. Micro-batching provides smaller batching opportunities over short intervals.
13. Concurrency and batching are different mechanisms and can be combined.
14. Streaming changes how results are delivered, not necessarily how quickly inference executes.
15. Streaming is especially useful when output is generated incrementally.
16. Time to first output and total completion time represent different user-visible behaviors.
17. Long-running streaming requests require a defined lifecycle, including completion and potentially cancellation.
18. Serving mechanisms should be distinguished from reliability engineering, capacity planning, and performance optimization.
19. Good serving architecture balances execution efficiency, waiting, resource contention, and response behavior.

---

## 38. Further Reading

For the next topic in this chapter, continue with:

- [`03-Model-Routing-and-Serving-Architecture.md`](./03-Model-Routing-and-Serving-Architecture.md)

For the previous serving foundation, see:

- [`01-Production-Inference-and-Model-Serving.md`](./01-Production-Inference-and-Model-Serving.md)

Related production domains:

- `PROD-02` — Production AI Application Packaging and Runtime
- `PROD-04` — Production AI Deployment and Release Engineering
- `PROD-05` — Production AI Observability and Telemetry
- `PROD-06` — Production AI Reliability Engineering
- `PROD-07` — Production AI Capacity and Scaling
- `PROD-08` — Production AI Performance and Cost Optimization

---
