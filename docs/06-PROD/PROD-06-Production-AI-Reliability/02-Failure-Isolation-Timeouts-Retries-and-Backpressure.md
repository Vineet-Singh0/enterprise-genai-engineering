# PROD-06 — Failure Isolation, Timeouts, Retries, and Backpressure

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain how failures propagate through production AI systems.
- Identify and reduce failure blast radius.
- Design appropriate failure-isolation boundaries.
- Explain timeouts, timeout budgets, and deadline propagation.
- Distinguish transient failures from persistent failures.
- Design bounded retry policies with exponential backoff and jitter.
- Explain retry amplification and retry storms.
- Evaluate idempotency before introducing retries.
- Explain circuit-breaking and its relationship with timeouts and retries.
- Design concurrency limits, bounded queues, and backpressure controls.
- Explain admission control and load shedding.
- Combine reliability controls rather than treating them as isolated patterns.
- Reason about these mechanisms in AI workloads with variable latency, token usage, inference cost, and external dependencies.

---

## Prerequisites

Before studying this chapter, you should understand:

- Basic production service architecture.
- Request/response lifecycles.
- Dependencies and service boundaries.
- Basic observability concepts.
- Reliability, SLI, SLO, and error-budget concepts from [File 01](./01-AI-Service-Reliability-SLIs-SLOs-and-Error-Budgets.md).

You should also understand that this chapter focuses on **how the system behaves when failure or overload occurs**, not on how operators detect and investigate those conditions.

---

## Estimated Reading Time

Approximately 60–75 minutes.

---

## Before We Start

Production AI systems rarely fail in one simple way.

A dependency may become slow rather than completely unavailable.

A model provider may return errors intermittently.

A retrieval service may become overloaded.

A request may consume significantly more resources than another request.

A queue may continue accepting work even though downstream processing has already fallen behind.

A retry mechanism may unintentionally multiply traffic against an already unhealthy dependency.

A system may remain technically available while becoming unusably slow.

These conditions interact.

For that reason, reliability engineering cannot be reduced to adding isolated mechanisms such as retries or timeouts.

The engineering problem is:

> **How do we control failure propagation, resource consumption, and overload so that one unhealthy component does not unnecessarily destabilize the rest of the system?**

---

## Why This Exists

A production AI request often crosses multiple boundaries:

```text
Client
   ↓
API
   ↓
Application Service
   ↓
Retrieval
   ↓
Model Provider
   ↓
Tool / External Dependency
```

Every boundary introduces possible failure.

A dependency can:

- fail immediately,
- fail intermittently,
- become slow,
- return rate-limit responses,
- exhaust capacity,
- accept requests but process them slowly,
- or recover gradually.

Without appropriate controls, one unhealthy component can create a chain reaction.

For example:

```text
Slow Dependency
      ↓
Requests wait longer
      ↓
Concurrency increases
      ↓
Queues grow
      ↓
Timeouts occur
      ↓
Retries begin
      ↓
Traffic increases
      ↓
Dependency becomes more overloaded
      ↓
More failures
```

This is a **failure amplification loop**.

The purpose of the controls in this chapter is to interrupt such loops.

---

# Mental Model

Think of reliability controls as a set of boundaries around work.

```text
                    ┌──────────────────────┐
                    │   Incoming Traffic   │
                    └──────────┬───────────┘
                               │
                         Admission Control
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Concurrency Limits  │
                    └──────────┬───────────┘
                               │
                         Bounded Queue
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Work Begins     │
                    └──────────┬───────────┘
                               │
                           Timeout
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Dependency Call    │
                    └──────────┬───────────┘
                               │
                     Retry if appropriate
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Circuit Breaker /    │
                    │ Dependency Protection│
                    └──────────┬───────────┘
                               │
                        Backpressure /
                        Load Shedding
```

These controls answer different questions:

| Control | Primary question |
|---|---|
| Timeout | How long may this operation wait? |
| Deadline | How long may the overall request remain useful? |
| Retry | Should this failed operation be attempted again? |
| Backoff | How quickly should another attempt occur? |
| Jitter | How do we avoid synchronized retries? |
| Circuit breaker | Should calls to this unhealthy dependency temporarily stop? |
| Concurrency limit | How much work may execute simultaneously? |
| Queue bound | How much work may wait? |
| Backpressure | How do we signal or enforce that upstream must slow down? |
| Admission control | Should this work be allowed to enter? |
| Load shedding | Which work should be intentionally rejected or dropped? |
| Failure isolation | How do we prevent one failure domain from consuming shared resources? |

The key idea is:

> **Reliability controls manage the amount, duration, and propagation of work under failure.**

---

# 1. Failure Propagation

A failure becomes dangerous when it spreads beyond the component that originally failed.

Consider:

```text
Model Provider
      ↓
Inference Service
      ↓
Application API
      ↓
Client Requests
```

Suppose the model provider becomes slow.

The inference service may keep requests open.

The application API may therefore accumulate active requests.

The API may exhaust connection or worker capacity.

New requests may then fail even though the API itself is technically healthy.

The original failure was:

```text
Model Provider latency
```

The resulting system failure was:

```text
Application-wide capacity exhaustion
```

This is failure propagation.

---

# 2. Failure Blast Radius

The **blast radius** is the portion of the system affected by a failure.

A useful engineering objective is:

> **Keep the blast radius as small as reasonably possible.**

For example:

```text
Without Isolation

Provider A failure
       ↓
Shared worker pool
       ↓
All requests affected
```

With isolation:

```text
Provider A failure
       ↓
Provider A resource pool
       ↓
Provider A traffic affected

Provider B resource pool
       ↓
Provider B traffic continues
```

Isolation does not eliminate failure.

It limits the amount of the system that the failure can consume.

---

# 3. Failure Isolation

Failure isolation means designing boundaries so that one unhealthy component cannot consume unlimited shared resources or directly destabilize unrelated workloads.

Isolation can occur at multiple levels:

```text
Request
   ↓
Concurrency
   ↓
Resource Pool
   ↓
Dependency
   ↓
Service
   ↓
Failure Domain
```

Possible isolation mechanisms include:

- separate concurrency limits,
- separate queues,
- separate worker pools,
- dependency-specific resource budgets,
- tenant-level limits,
- priority classes,
- independent execution paths.

The correct boundary depends on what resource can become exhausted.

---

# 4. Failure Domains

A **failure domain** is a portion of the system that can fail together or become unhealthy together.

Examples include:

- one dependency,
- one provider,
- one worker pool,
- one queue,
- one tenant,
- one region,
- one deployment,
- one infrastructure resource group.

The goal is not to eliminate every shared component.

The goal is to understand:

> **Which failures can consume which shared resources?**

That question determines where isolation is useful.

---

## 5. Bulkhead-Style Resource Isolation

A bulkhead-style design separates resources so that one workload cannot consume all available capacity.

For example:

```text
                    Shared Service
                         │
              ┌──────────┴──────────┐
              │                     │
        Critical Work          Background Work
              │                     │
       Concurrency = 20       Concurrency = 5
```

If background work becomes expensive, it should not automatically consume the concurrency budget reserved for critical work.

Bulkhead-style isolation can be implemented through:

- separate worker pools,
- separate queues,
- concurrency partitions,
- tenant quotas,
- dependency-specific pools,
- priority-based resource allocation.

The implementation does not need to use physically separate infrastructure.

The important property is **resource containment**.

---

# 6. Timeouts

A timeout defines how long an operation is allowed to wait before the caller stops treating the operation as successful progress.

Without timeouts:

```text
Request
   ↓
Dependency
   ↓
Wait
   ↓
Wait
   ↓
Wait
   ↓
Worker remains occupied
```

With a timeout:

```text
Request
   ↓
Dependency
   ↓
Wait
   ↓
Timeout
   ↓
Control returns
```

Timeouts protect the caller from indefinitely waiting on unhealthy or slow work.

However:

> **A timeout at one layer does not automatically mean that the underlying work has stopped.**

Where the execution model supports cancellation or termination, timeout handling should also attempt to stop the underlying work so that resources are released rather than merely stopping the caller from waiting.

---

# 7. Timeout Semantics

A timeout can represent different events depending on the system layer.

For example:

```text
Caller
   ↓
"Stop waiting after 2 seconds"
```

does not necessarily mean:

```text
Dependency
   ↓
"Stop processing after 2 seconds"
```

The dependency may continue processing unless cancellation or termination is propagated and supported.

Therefore, production systems should distinguish between:

- caller-side wait timeout,
- operation cancellation,
- dependency timeout,
- connection timeout,
- read timeout,
- overall request deadline.

These may produce different operational consequences.

---

# 8. Timeout Budgets

Timeouts should be selected relative to the useful lifetime of the request.

Suppose an API has a 10-second request deadline.

A dependency call should not independently receive a 15-second timeout.

Otherwise:

```text
API deadline = 10s

Dependency timeout = 15s
```

creates contradictory behavior.

A better model is:

```text
Request Deadline
       │
       ├── Retrieval
       ├── Model
       └── Tool
```

Each operation receives only the time that can still be useful.

---

# 9. Deadline Propagation

A **deadline** represents the latest point at which the overall request remains useful.

Consider:

```text
Incoming Request
Deadline = T

        ↓

API

        ↓

Retrieval

        ↓

Model

        ↓

Tool
```

Each downstream operation should respect the remaining time.

For example:

```text
Original deadline: 10s

API consumes:      1s
Retrieval consumes:3s

Remaining:         6s
```

The model operation should reason about approximately 6 seconds of remaining useful time, not independently assume a fresh 10-second budget.

The principle is:

> **Downstream work should not outlive the useful lifetime of the upstream request.**

---

# 10. Choosing Timeout Values

Timeouts should be based on measured behavior and service objectives rather than arbitrary constants.

Consider:

- normal latency,
- tail latency,
- workload type,
- dependency behavior,
- request deadline,
- expected recovery time,
- resource cost,
- user experience.

A timeout that is too short can create false failures.

A timeout that is too long can allow unhealthy work to consume resources for too long.

Therefore:

```text
Too Short
→ unnecessary failures

Too Long
→ resource exhaustion

Appropriate
→ bounded waiting with acceptable failure rate
```

---

# 11. Streaming Timeouts

Streaming workloads require additional care.

A request may remain open for a long time while continuously producing useful output.

A single fixed request timeout may therefore be inappropriate.

Possible controls include:

- connection timeout,
- time-to-first-token timeout,
- idle timeout,
- maximum stream duration,
- per-operation deadline.

For example:

```text
Request accepted
      ↓
First token expected
      ↓
Streaming begins
      ↓
Idle period monitored
      ↓
Stream continues while progress remains acceptable
```

The correct timeout model depends on the streaming protocol and workload.

---

# 12. Transient vs Persistent Failures

Retries are most useful when failure may resolve without changing the request.

A useful distinction is:

### Transient failure

The condition may recover shortly.

Examples:

- temporary network failure,
- temporary dependency overload,
- connection reset,
- short-lived provider throttling.

### Persistent failure

Repeating the same operation is unlikely to help immediately.

Examples:

- invalid authentication,
- invalid request,
- malformed input,
- unsupported operation,
- consistently failing dependency.

This distinction is essential because retrying persistent failures wastes resources.

---

## 13. Retry Policy

A retry should not be defined simply as:

```text
If failure → retry
```

A production retry policy should answer:

```text
Was the failure retryable?
Is another attempt allowed?
Is the operation safe to repeat?
Is enough deadline remaining?
Is the dependency likely to accept another request?
How many attempts have already occurred?
```

A useful decision model is:

```text
Failure
   ↓
Transient?
   ↓
Retry permitted?
   ↓
Operation safe?
   ↓
Deadline remaining?
   ↓
Dependency able to accept work?
   ↓
Retry
```

---

# 14. Bounded Retries

Retries must be bounded.

For example:

```text
Attempt 1
   ↓
Attempt 2
   ↓
Attempt 3
   ↓
Stop
```

Without a bound, a retry mechanism can turn a dependency failure into a resource-exhaustion problem.

The retry limit should consider:

- overall request deadline,
- operation cost,
- dependency behavior,
- failure rate,
- workload priority.

More retries do not automatically mean higher reliability.

---

# 15. Exponential Backoff

Immediate retries can produce synchronized bursts.

Instead, retry delays can increase after successive failures.

Conceptually:

```text
Retry 1 → short delay
Retry 2 → longer delay
Retry 3 → longer delay
Retry 4 → longer delay
```

A common model is:

```text
delay = min(cap, base × 2^attempt)
```

The exact formula is less important than the engineering principle:

> **Do not repeatedly hit an unhealthy dependency at full speed.**

---

# 16. Jitter

Even exponential backoff can create synchronized retries if many clients calculate the same delays.

For example:

```text
100 clients fail
      ↓
all wait 2 seconds
      ↓
all retry together
      ↓
dependency receives another burst
```

Jitter introduces controlled randomness into retry timing.

Conceptually:

```text
Base Backoff
      +
Randomized Variation
      ↓
Less Synchronization
```

Jitter is particularly useful in distributed systems where many independent callers may experience the same failure.

---

# 17. Retry Amplification

Retries increase traffic.

Suppose:

```text
100 original requests
```

and each request performs up to:

```text
3 attempts
```

The dependency could receive up to:

```text
300 attempts
```

depending on where failures occur.

This is **retry amplification**.

The dangerous case is:

```text
Dependency becomes unhealthy
        ↓
Requests fail
        ↓
Clients retry
        ↓
Traffic increases
        ↓
Dependency becomes more unhealthy
        ↓
More retries
```

Retries can therefore become part of the failure mechanism.

---

# 18. Retry Storms

A retry storm occurs when large numbers of clients repeatedly retry an unhealthy dependency.

Typical contributing factors include:

- unlimited retries,
- synchronized retries,
- missing backoff,
- missing jitter,
- retries at multiple layers,
- long retry windows,
- poor failure classification.

The protection strategy is therefore not simply "add retries."

It is:

```text
Bound
+
Backoff
+
Jitter
+
Deadline
+
Failure Classification
+
Retry Ownership
```

---

# 19. Idempotency

Retries are safe only when repeating the operation is acceptable.

For example:

```text
GET profile
```

may be naturally repeatable.

But:

```text
POST create-payment
```

may create a duplicate side effect if repeated without appropriate protection.

Therefore, retry design must consider **idempotency**.

A retry policy should ask:

> **If this operation executes twice, what happens?**

Possible strategies include:

- naturally idempotent operations,
- idempotency keys,
- deduplication,
- transactional safeguards,
- avoiding retries for unsafe operations.

The reliability mechanism must not create correctness problems.

---

# 20. Retry Ownership

Retries should have clear ownership.

Consider:

```text
Service A
   ↓ retry
Service B
   ↓ retry
Service C
   ↓ retry
Dependency
```

A single logical request may generate many physical attempts.

For example:

```text
A: 3 attempts
B: 3 attempts
C: 3 attempts
```

The dependency could potentially observe:

```text
3 × 3 × 3 = 27 attempts
```

for one logical operation.

This is why retry responsibility should normally be deliberate and bounded rather than independently added at every layer.

---

# 21. Circuit Breaking

A circuit breaker prevents repeated calls to a dependency that is showing sustained failure.

The basic state model is:

```text
Closed
→ normal traffic

Open
→ normal calls blocked

Half-open
→ limited probing
```

A typical transition is:

```text
Closed
   ↓
Failure condition detected
   ↓
Open
   ↓
Recovery interval
   ↓
Half-open
   ↓
Probe succeeds → Closed
Probe fails    → Open
```

The purpose is not to make the dependency healthy.

The purpose is to prevent continued traffic from consuming local resources while the dependency is unhealthy.

---

# 22. Circuit Breaker Failure Signals

A circuit breaker needs signals that represent meaningful dependency health.

Potential signals include:

- connection failures,
- dependency timeouts,
- transport failures,
- selected server-side failures,
- sustained error-rate thresholds,
- consecutive failure thresholds.

However, not every error should necessarily contribute equally to circuit state.

For example:

```text
Invalid user input
```

usually indicates a problem with the request rather than dependency health.

Treating every application error as a circuit-breaker failure could incorrectly open the circuit.

Therefore, circuit-breaker policy should define:

```text
Which failures count?
Which failures do not count?
How many failures?
Over what observation period?
What recovery condition closes the circuit?
```

The exact policy depends on the dependency and failure semantics.

---

# 23. Circuit Breaker Is Not a Replacement for Timeouts

These mechanisms solve different problems.

```text
Timeout
→ limits how long an individual operation may wait

Retry
→ attempts selected transient recovery

Circuit breaker
→ prevents repeated calls when dependency failure persists
```

A circuit breaker without timeouts may still allow an individual call to hang.

A timeout without a circuit breaker may allow the system to repeatedly call an unhealthy dependency.

They therefore work together.

---

# 24. Circuit Breakers and Retries

Retries and circuit breakers must be coordinated.

Consider:

```text
Request
   ↓
Dependency call
   ↓
Timeout
   ↓
Retry?
   ↓
Circuit permits call?
```

If retries continue after a dependency has clearly become unhealthy, they can undermine the circuit breaker's purpose.

A useful model is:

```text
Timeout
→ detects an individual unhealthy operation

Retry
→ attempts selected transient recovery

Circuit breaker
→ prevents repeated calls when failure persists
```

The exact control order depends on where the mechanisms are implemented.

---

# 25. Circuit Breaker Configuration Trade-offs

A circuit breaker that opens too easily may reject healthy traffic.

A circuit breaker that opens too slowly may fail to contain an unhealthy dependency.

Important configuration considerations include:

- failure threshold,
- error classification,
- observation window,
- minimum sample size,
- open duration,
- half-open probe count,
- recovery criteria.

The objective is not:

> "Open as quickly as possible."

The objective is:

> **Stop harmful traffic when the evidence indicates sustained dependency failure while avoiding unnecessary disruption to healthy traffic.**

---

## 26. Concurrency Limits

Concurrency limits control how much work can execute simultaneously.

Suppose a service has:

```text
Maximum concurrent inference = 100
```

A request arriving when all 100 execution slots are occupied must not automatically create unlimited additional work.

Without concurrency protection:

```text
Traffic
   ↓
More active work
   ↓
More resource usage
   ↓
Slower processing
   ↓
More active work
   ↓
Resource exhaustion
```

Concurrency limits provide a hard boundary around active work.

---

# 27. Concurrency Is Not Capacity

Concurrency is the amount of work executing at the same time.

Capacity is the amount of work the system can sustainably process.

They are related but not identical.

For example:

```text
Concurrency = 20
```

does not tell us whether the service can process:

```text
10 requests/sec
```

or:

```text
100 requests/sec
```

because service time, workload cost, hardware, and dependency behavior matter.

This distinction becomes especially important in AI workloads where request cost can vary significantly.

---

# 28. Queueing

When work cannot execute immediately, systems may place it into a queue.

```text
Incoming Work
      ↓
Queue
      ↓
Workers
```

Queues can absorb short bursts.

But a queue is not infinite capacity.

If:

```text
Arrival Rate > Service Rate
```

for long enough:

```text
Queue
   ↓
Queue grows
   ↓
Memory/resource usage grows
   ↓
Latency grows
   ↓
Timeouts increase
```

Therefore, production queues should have meaningful bounds.

---

# 29. Bounded Queues

A bounded queue defines how much waiting work the system is willing to hold.

For example:

```text
Queue Capacity = 1,000
```

Once the queue reaches its limit, the system must apply a policy.

Possible outcomes include:

- reject new work,
- shed low-priority work,
- apply backpressure,
- defer work,
- route work elsewhere.

An unbounded queue often hides overload until the system fails elsewhere.

---

# 30. Backpressure

Backpressure is a mechanism for preventing downstream overload from becoming unlimited upstream work.

Conceptually:

```text
Downstream capacity decreases
          ↓
Pressure moves upstream
          ↓
Upstream slows, waits, or rejects work
```

Without backpressure:

```text
Producer
   ↓
Unlimited requests
   ↓
Consumer
   ↓
Overload
```

With backpressure:

```text
Producer
   ↓
Bounded intake
   ↓
Consumer
```

Backpressure can be implemented through:

- bounded queues,
- concurrency limits,
- rate controls,
- admission control,
- explicit flow-control protocols,
- producer throttling.

---

# 31. Backpressure in AI Workloads

AI workloads make backpressure particularly important because requests may have highly variable cost.

Two requests may both count as:

```text
1 request
```

while consuming very different resources.

For example:

```text
Request A
→ short prompt
→ small response
→ low inference cost

Request B
→ long context
→ large output
→ expensive inference
```

Therefore, request count alone may not represent actual system pressure.

Relevant workload dimensions can include:

- token volume,
- inference duration,
- model size,
- GPU/CPU usage,
- tool execution,
- retrieval work,
- output size.

Backpressure design should therefore consider the actual resources being protected.

---

# 32. Admission Control

Admission control determines whether new work should enter the system.

```text
Request
   ↓
Admission Decision
   ├── Accept
   └── Reject / Defer
```

Admission decisions may consider:

- current concurrency,
- queue depth,
- priority,
- tenant limits,
- dependency health,
- remaining deadline,
- resource availability.

Admission control prevents the system from accepting more work than it can safely process.

---

# 33. Load Shedding

Load shedding intentionally rejects or drops work when continuing to accept everything would threaten system stability.

For example:

```text
System overloaded
      ↓
Protect critical traffic
      ↓
Reject lower-priority work
```

Possible strategies include:

- reject new requests,
- reject background work,
- reduce optional processing,
- apply tenant-specific limits,
- reject requests with insufficient remaining deadline.

Load shedding should be deliberate.

It is preferable to controlled rejection over uncontrolled system-wide failure.

---

# 34. Priority and Work Protection

Not every request has equal business or operational importance.

A system may define:

```text
Priority 1
Critical user requests

Priority 2
Normal interactive requests

Priority 3
Background processing
```

Under pressure, the system can preserve higher-priority work while limiting lower-priority work.

This turns overload handling into an explicit engineering policy rather than an accidental outcome.

---

# 35. Reliability Control Interaction

These mechanisms should be understood as a control system.

```text
                     ┌───────────────┐
                     │    Traffic    │
                     └───────┬───────┘
                             │
                     Admission Control
                             │
                             ▼
                    ┌─────────────────┐
                    │ Concurrency     │
                    │ Limits          │
                    └───────┬─────────┘
                            │
                       Bounded Queue
                            │
                            ▼
                       Work Starts
                            │
                       Timeout/Deadline
                            │
                            ▼
                       Dependency
                            │
                  ┌─────────┴─────────┐
                  │                   │
               Success             Failure
                                      │
                            Retry if eligible
                                      │
                              Backoff + Jitter
                                      │
                              Circuit State
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                       Closed                    Open
                         │                         │
                    Continue calls            Stop calls
```

The controls have different responsibilities.

The goal is not to maximize the use of every mechanism.

The goal is to prevent failure from becoming amplification.

---

# 36. Reliability Control Loop

A useful way to reason about the controls is:

```text
1. Limit entry
       ↓
2. Bound active work
       ↓
3. Bound waiting work
       ↓
4. Bound operation duration
       ↓
5. Recover selectively
       ↓
6. Stop repeated unhealthy calls
       ↓
7. Reject or defer work when necessary
```

This gives the system multiple opportunities to contain failure.

If one mechanism is insufficient, another boundary can still protect the system.

---

# 37. Production Scenario: Slow Retrieval Dependency

Consider an AI application that depends on retrieval.

```text
User Request
     ↓
Application
     ↓
Retrieval Service
```

Retrieval becomes slow.

A poorly designed system might behave like this:

```text
Slow Retrieval
      ↓
Requests remain active
      ↓
Concurrency grows
      ↓
Queue grows
      ↓
Timeouts occur
      ↓
Retries begin
      ↓
Retrieval receives more traffic
```

A controlled system may instead use:

```text
Request
   ↓
Deadline
   ↓
Retrieval timeout
   ↓
Bounded retry
   ↓
Concurrency limit
   ↓
Circuit breaker if persistent failure
```

The controls work together to limit the blast radius.

---

# 38. Production Scenario: Model Provider Throttling

Suppose an external model provider begins returning throttling responses.

A naïve implementation may immediately retry.

```text
429
 ↓
Retry immediately
 ↓
429
 ↓
Retry immediately
 ↓
429
```

This increases pressure on the provider.

A more controlled design may use:

```text
Provider throttling
       ↓
Classify as retryable when appropriate
       ↓
Respect provider signals and deadline
       ↓
Exponential backoff
       ↓
Jitter
       ↓
Bounded attempts
       ↓
Stop when budget/deadline is exhausted
```

If the dependency remains unhealthy, circuit-breaking or admission controls may prevent continued pressure.

---

# 39. Production Scenario: Circuit Opens

Consider a dependency with sustained failures.

```text
Normal traffic
      ↓
Repeated dependency failures
      ↓
Failure threshold reached
      ↓
Circuit opens
      ↓
Normal calls blocked
      ↓
Local resources protected
      ↓
Recovery interval
      ↓
Half-open probe
```

If the probe succeeds:

```text
Half-open
    ↓
Healthy
    ↓
Closed
```

If it fails:

```text
Half-open
    ↓
Unhealthy
    ↓
Open
```

The circuit breaker therefore controls repeated dependency traffic rather than directly fixing the dependency.

---

# 40. Production Scenario: Queue Explosion

Suppose a service receives work faster than it can process it.

```text
Arrival Rate
     >
Service Rate
```

Then:

```text
Queue grows
   ↓
Waiting time grows
   ↓
Request deadlines expire
   ↓
Requests fail
```

A reliability-oriented response may be:

```text
Queue reaches threshold
        ↓
Admission becomes stricter
        ↓
Low-priority work rejected/deferred
        ↓
Critical work preserved
```

The important lesson is:

> **A queue can absorb a burst, but it cannot permanently compensate for insufficient processing capacity.**

Capacity planning belongs to the scaling domain; this chapter focuses on the reliability controls that prevent queue growth from becoming uncontrolled failure.

---

# 41. Production Scenario: Retry Amplification

Consider:

```text
100 incoming requests
```

A dependency becomes unhealthy.

If each request performs three attempts:

```text
100 original requests
        ↓
300 dependency attempts
```

If multiple layers independently retry, the number can grow further.

The reliability controls should therefore include:

```text
Retry eligibility
      ↓
Bounded attempts
      ↓
Backoff
      ↓
Jitter
      ↓
Deadline
      ↓
Clear retry ownership
```

The objective is to prevent recovery mechanisms from becoming additional load.

---

# 42. Deadline and Retry Interaction

Retries consume time.

Suppose:

```text
Request deadline = 5 seconds
```

and the first attempt consumes:

```text
3 seconds
```

A retry that requires another 3 seconds is unlikely to provide useful recovery.

Therefore:

> **Retry policy must operate inside the request's remaining deadline.**

The retry decision should consider:

```text
Remaining Deadline
        +
Expected Retry Duration
        +
Backoff
        +
Expected Recovery Value
```

A retry is not useful merely because it is technically possible.

---

# 43. Timeout and Queue Interaction

Queues affect timeout behavior.

Suppose a request spends:

```text
2 seconds waiting in queue
```

and has:

```text
5-second deadline
```

Only approximately:

```text
3 seconds
```

remain for actual processing.

If the worker then starts an independent five-second timeout, it can exceed the request's useful lifetime.

Therefore:

```text
Queue Time
   +
Execution Time
   +
Dependency Time
```

must be considered within the overall deadline.

---

# 44. Concurrency and Queue Interaction

Concurrency limits and queues solve different problems.

```text
Concurrency Limit
→ limits active work

Queue
→ stores waiting work
```

Consider:

```text
Concurrency = 10
Queue = 10,000
```

The system may still accept a huge amount of waiting work.

That can produce:

- high latency,
- memory pressure,
- stale requests,
- expired deadlines,
- large cancellation waste.

Therefore, concurrency limits should often be paired with bounded queues and admission policies.

---

# 45. Backpressure and Load Shedding Interaction

Backpressure attempts to slow or constrain upstream work.

Load shedding intentionally rejects some work.

A typical sequence may be:

```text
Pressure increases
      ↓
Backpressure
      ↓
Queue/concurrency limits reached
      ↓
Admission becomes stricter
      ↓
Low-priority work shed
```

These controls provide progressively stronger protection.

The exact sequence depends on architecture.

---

# 46. Dependency-Specific Reliability Controls

Different dependencies may require different policies.

For example:

| Dependency | Potential controls |
|---|---|
| Retrieval service | Timeout, concurrency limit, bounded retry |
| External model provider | Deadline, backoff, jitter, circuit breaker |
| Database | Connection pool limit, timeout, bounded retry |
| Tool API | Timeout, retry eligibility, circuit breaker |
| Background worker | Queue bound, admission control, load shedding |

The correct control depends on:

- failure characteristics,
- resource cost,
- retry safety,
- latency requirements,
- recovery behavior.

There is no universal reliability configuration.

---

## 47. AI-Specific Reliability Considerations

AI systems introduce additional variability.

### Variable inference latency

Inference time can vary with:

- input length,
- output length,
- model size,
- batching,
- hardware contention.

### Token-dependent workload

Two requests with identical request counts may have very different computational costs.

### External model providers

External providers introduce:

- network latency,
- rate limits,
- quotas,
- provider-side failures,
- availability variation.

### Retrieval and tool dependencies

An AI request may depend on several downstream systems.

```text
Application
   ├── Retrieval
   ├── Database
   ├── Model
   └── Tools
```

Each dependency adds another possible failure boundary.

### Streaming

Streaming creates long-lived connections and requires different timeout and resource-management strategies.

### Shared compute

GPU or CPU contention can create queue buildup and latency increases even when individual components remain technically available.

These factors make explicit resource and failure controls especially important.

---

# 48. Reliability Control Matrix

| Problem | Primary control | Supporting controls |
|---|---|---|
| Dependency hangs | Timeout | Deadline, cancellation |
| Transient dependency failure | Retry | Backoff, jitter |
| Persistent dependency failure | Circuit breaker | Timeout, admission control |
| Too much active work | Concurrency limit | Admission control |
| Too much waiting work | Bounded queue | Backpressure |
| Sustained overload | Admission control | Load shedding |
| Retry amplification | Retry budget | Backoff, jitter, deadline |
| Shared-resource exhaustion | Failure isolation | Bulkheads, concurrency limits |
| Low-priority overload | Priority policy | Load shedding |
| Request exceeds useful lifetime | Deadline | Timeout, cancellation |

The table should be interpreted as a design aid, not as a fixed implementation recipe.

---

## 49. Engineering Trade-offs

Reliability controls introduce trade-offs.

## Aggressive Timeouts

Advantages:

- free resources sooner,
- reduce long waits,
- limit dependency impact.

Risks:

- false failures,
- unnecessary retries,
- poor experience for legitimate long-running requests.

---

## Aggressive Retries

Advantages:

- may recover transient failures.

Risks:

- retry amplification,
- higher dependency load,
- longer request duration,
- duplicate side effects.

---

## Aggressive Circuit Breaking

Advantages:

- quickly protects local resources.

Risks:

- may reject requests while the dependency is actually recovering,
- may overreact to small failure samples.

---

## Large Queues

Advantages:

- absorb bursts.

Risks:

- high latency,
- memory/resource pressure,
- stale work,
- deadline expiration.

---

## Small Queues

Advantages:

- fast overload detection,
- bounded waiting.

Risks:

- more immediate rejection during bursts.

---

## Aggressive Load Shedding

Advantages:

- protects critical traffic.

Risks:

- legitimate users may experience rejection,
- requires clear priority policy.

---

## 50. Common Mistakes and Misconceptions

### 1. "Retries always improve reliability."

False.

Retries can increase reliability for selected transient failures but can amplify persistent failures.

---

### 2. "A timeout stops the underlying operation."

Not necessarily.

The caller may stop waiting while the underlying operation continues unless cancellation or termination is supported and propagated.

---

### 3. "A circuit breaker replaces timeouts."

False.

A circuit breaker prevents repeated calls under sustained failure; a timeout bounds an individual operation.

---

### 4. "Every failure should trigger a retry."

False.

Retryability depends on failure type, operation safety, remaining deadline, and dependency state.

---

### 5. "Every error should count toward circuit breaking."

False.

Circuit-breaker signals should represent meaningful dependency health rather than arbitrary application errors.

---

### 6. "More retries mean better availability."

False.

Additional retries may increase dependency load and reduce overall system reliability.

---

### 7. "Exponential backoff alone prevents retry storms."

Not necessarily.

Without jitter, many clients can still retry at approximately the same time.

---

### 8. "A queue solves overload."

False.

A queue can absorb temporary bursts but cannot compensate indefinitely when arrival rate exceeds service rate.

---

### 9. "Concurrency limits solve capacity planning."

False.

Concurrency limits protect active resources; capacity planning determines sustainable system capacity.

---

### 10. "Load shedding means the system has failed."

Not necessarily.

Intentional load shedding can be a reliability mechanism that prevents uncontrolled system-wide failure.

---

### 11. "One reliability policy works for every dependency."

False.

Different dependencies have different failure modes, costs, retry semantics, and recovery behavior.

---

### 12. "Failure controls can be designed independently."

Usually false.

Timeouts, retries, circuit breakers, queues, concurrency limits, and admission controls interact.

A poorly configured combination can undermine an otherwise sensible individual control.

---

## 51. Interview Questions

## Question 1

**Why are retries dangerous in distributed systems?**

Expected answer:

Retries increase traffic. If the dependency is already unhealthy, retries can amplify load and create a feedback loop. Production retries therefore require bounded attempts, backoff, jitter, failure classification, deadline awareness, and clear ownership.

---

## Question 2

**What is the difference between a timeout and a circuit breaker?**

Expected answer:

A timeout limits how long an individual operation may wait. A circuit breaker prevents repeated calls to a dependency that is showing sustained failure.

---

## Question 3

**Why is jitter important with exponential backoff?**

Expected answer:

Without jitter, many clients may calculate similar retry delays and retry simultaneously, creating synchronized traffic bursts.

---

## Question 4

**Why can an unbounded queue be dangerous?**

Expected answer:

It can hide overload while continuously accumulating work, eventually causing high latency, memory/resource exhaustion, deadline expiration, and cascading failures.

---

## Question 5

**What is failure isolation?**

Expected answer:

Failure isolation limits the resources and components affected by a failure so that one unhealthy workload or dependency does not destabilize unrelated workloads.

---

## Question 6

**How would you protect an AI service from a slow external model provider?**

Expected answer should consider:

- timeout,
- deadline propagation,
- bounded retries,
- backoff,
- jitter,
- circuit breaking,
- concurrency limits,
- admission control,
- possibly load shedding.

The exact combination depends on workload and dependency behavior.

---

## Question 7

**Why should retry policy consider idempotency?**

Expected answer:

Because repeating an operation may duplicate side effects. Retries must be safe for the operation or protected through mechanisms such as idempotency keys or deduplication.

---

## Question 8

**What is the difference between concurrency and queue size?**

Expected answer:

Concurrency controls active work. Queue size controls waiting work. Both may be required because limiting active work alone does not prevent unlimited accumulation of waiting requests.

---

## Question 9

**When should a circuit breaker open?**

Expected answer:

When defined evidence indicates sustained or significant dependency failure according to an explicit policy. The policy should distinguish meaningful dependency failures from errors that do not represent dependency health.

---

## Question 10

**Why should retries respect the request deadline?**

Expected answer:

Because a retry that completes after the request is no longer useful wastes resources and can increase system load without producing useful recovery.

---

## Question 11

**What is backpressure?**

Expected answer:

Backpressure constrains upstream work when downstream processing cannot safely accept additional load.

---

## Question 12

**How can retrying at multiple layers become dangerous?**

Expected answer:

Independent retry loops can multiply attempts. A single logical request can generate many physical dependency calls, creating retry amplification or a retry storm.

---

## Quick Revision

Remember the following model:

```text
Failure
   ↓
Can we isolate it?
   ↓
Can we bound the wait?
   ↓
Can we bound the work?
   ↓
Should we retry?
   ↓
Can we retry safely?
   ↓
Can we slow retries down?
   ↓
Should we stop calling the dependency?
   ↓
Should we accept more work?
   ↓
Should we shed some work?
```

And remember the distinction:

```text
Timeout
→ bound duration

Deadline
→ bound useful request lifetime

Retry
→ attempt selected recovery

Backoff
→ slow repeated attempts

Jitter
→ avoid synchronized retries

Circuit breaker
→ stop repeated calls to an unhealthy dependency

Concurrency limit
→ bound active work

Queue bound
→ bound waiting work

Backpressure
→ constrain upstream pressure

Admission control
→ decide what enters

Load shedding
→ intentionally reject selected work

Failure isolation
→ limit blast radius
```

---

# Key Takeaways

1. Failures become dangerous when they propagate and consume shared resources.
2. Failure isolation limits blast radius.
3. Timeouts bound waiting, but they do not automatically stop underlying work.
4. Deadlines prevent downstream work from outliving the useful lifetime of a request.
5. Retries should be selective, bounded, and safe.
6. Exponential backoff reduces repeated pressure.
7. Jitter prevents synchronized retry bursts.
8. Retry amplification can turn recovery mechanisms into failure mechanisms.
9. Circuit breakers prevent repeated calls to dependencies showing sustained failure.
10. Circuit-breaker failure signals must be deliberately classified.
11. Concurrency limits bound active work.
12. Bounded queues prevent unlimited accumulation of waiting work.
13. Backpressure prevents downstream overload from becoming unlimited upstream work.
14. Admission control decides whether new work should enter.
15. Load shedding protects system stability by intentionally rejecting selected work.
16. These mechanisms must be designed as an interacting control system.
17. AI workloads require special attention because request cost, latency, inference time, and dependency behavior can vary significantly.

---

## Further Reading

For related concepts, continue with:

- **PROD-06 — Production AI Reliability**
- **PROD-06 — Graceful Degradation, Fallbacks, and Dependency Failure**
- **PROD-05 — Production AI Observability and Telemetry**
- **PROD-07 — Capacity, Scaling, and Resource Management**
- **PROD-08 — Performance, Optimization, and Cost Engineering**
- **PROD-10 — Production AI Operations and Incident Management**

These chapters should be used for cross-domain context rather than re-teaching the same reliability mechanisms.

---

## Completion Check

Before considering this chapter complete, you should be able to explain:

- Why failures propagate.
- How blast radius is controlled.
- How failure isolation works.
- How bulkhead-style resource isolation protects shared systems.
- Why timeouts are necessary.
- Why timeout does not necessarily cancel underlying work.
- How deadlines propagate through downstream calls.
- When retries are appropriate.
- Why retries must be bounded.
- How exponential backoff and jitter work.
- Why retry amplification occurs.
- Why idempotency matters.
- How circuit breakers work.
- Which failures should influence circuit state.
- How circuit breakers interact with timeouts and retries.
- Why concurrency limits matter.
- Why queues should be bounded.
- How backpressure works.
- How admission control differs from load shedding.
- How reliability controls interact under overload and dependency failure.
- How these principles apply to AI workloads.

The deeper engineering question you should now be able to answer is:

> **When one part of a production AI system becomes slow, overloaded, or unhealthy, how do we prevent that condition from consuming the resources needed by the rest of the system?**
