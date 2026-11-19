# Performance Fundamentals

## 1. Overview

Performance engineering is the practice of understanding and improving how efficiently software uses resources while meeting its functional requirements.

A program can be correct and maintainable yet still perform poorly. It may take too long to respond, process too few requests per second, consume excessive memory, or become unstable as its workload increases.

Performance fundamentals help engineers reason about these problems before choosing an optimization.

For example, an API endpoint that responds in 100 milliseconds for ten records may take several seconds for one million records. The problem might be an inefficient algorithm, repeated database access, unnecessary object creation, or a dependency that dominates the execution time.

These problems require different solutions. Increasing CPU resources will not necessarily fix an algorithm that performs excessive repeated work, and optimizing a Python function will not necessarily improve an endpoint dominated by database latency.

The objective is to understand the workload, identify the limiting resource, and choose an improvement that produces measurable value without sacrificing correctness or maintainability.

### Learning Objectives

By the end of this chapter, you should be able to:

- Explain the major dimensions of software performance.
- Understand how algorithmic complexity affects execution cost.
- Distinguish latency, throughput, and resource utilization.
- Recognize CPU, memory, I/O, and dependency bottlenecks.
- Explain the benefits and costs of caching.
- Understand how batching and repeated operations affect performance.
- Use a measurement-driven approach to evaluate optimizations.
- Recognize common performance mistakes and engineering trade-offs.

### Prerequisites

You should understand:

- Functions, loops, data structures, and basic algorithms.
- Software testing and debugging.
- Logging and profiling from the preceding chapters.
- Basic database, API, and application architecture concepts.

### Expected Reading Time

25–35 minutes.

---

## 2. Why Performance Fundamentals Matter

Performance is not simply about making code execute as quickly as possible.

A production application must satisfy multiple requirements simultaneously:

- Correctness.
- Acceptable response times.
- Sufficient processing capacity.
- Reasonable resource consumption.
- Reliability under expected workloads.
- Maintainability.
- Cost-effective operation.

An optimization that improves one dimension can make another worse.

For example, keeping a large dataset in memory may reduce database access time but increase memory consumption. Caching results may improve response time but introduce stale data. Running more requests concurrently may increase throughput but also increase contention for shared resources.

Performance engineering therefore begins with a question:

**What performance requirement are we trying to satisfy, under which workload, and at what cost?**

Without a clear requirement, an engineer may optimize a component that is not important to the overall system.

## 3. A Mental Model of Performance

Consider a request handled by an API service.

```text
Client
  |
  v
API Request
  |
  v
Input Validation
  |
  v
Business Logic
  |
  v
Database / External API
  |
  v
Response Construction
  |
  v
Client Receives Response
```

The overall response time depends on the work performed across this path.

Some operations consume CPU. Others allocate memory, wait for I/O, or depend on external services.

The slowest operation is not necessarily the one with the most complex-looking code. It is the operation or combination of operations that limits the workload being measured.

A useful performance investigation separates three questions:

1. **What does the system need to achieve?** Define the performance objective.
2. **What currently limits it?** Identify the bottleneck under a representative workload.
3. **Which change improves the objective?** Select and measure a targeted optimization.

This mental model connects performance engineering with profiling: profiling helps attribute runtime cost, while broader performance reasoning helps determine which cost matters and what should change.

## 4. Major Dimensions of Performance

### 4.1 Latency

Latency is the time required for an operation to complete or for a response to become available.

For an API, latency commonly refers to the elapsed time between a request and its response.

For example:

- Request A completes in 80 milliseconds.
- Request B completes in 250 milliseconds.
- Request C completes in 1.8 seconds.

These values describe individual request durations, not the number of requests the service can handle per second.

Low latency is important for interactive applications, APIs, and user-facing workflows.

However, latency requirements depend on the operation. A simple profile lookup may need to be fast, while a large offline report may reasonably take longer.

### 4.2 Throughput

Throughput measures how much work a system completes per unit of time.

Examples include:

- Requests per second.
- Records processed per minute.
- Jobs completed per hour.
- Messages consumed per second.

Suppose a service processes 500 requests in 10 seconds. Its average throughput over that interval is:

\[
\text{Throughput} = \frac{500}{10} = 50
\]

The throughput is 50 requests per second over the measured interval.

High throughput does not guarantee low latency. A system may process many requests per second while individual requests experience long queues.

### 4.3 Resource Utilization

Resource utilization describes how much of a resource is being used.

Relevant resources include:

- CPU.
- Memory.
- Disk I/O.
- Network bandwidth.
- Database connections.
- Worker capacity.

High utilization is not automatically a defect. A batch-processing system may intentionally use most available CPU to complete work efficiently.

However, sustained saturation can reduce the system's ability to handle additional work and may increase latency.

### 4.4 Scalability

Scalability describes how a system behaves as its workload or available resources change.

For example, an application may process 1,000 records efficiently but degrade sharply when processing 100,000 records.

The degradation may result from algorithmic complexity, memory pressure, contention, or an external dependency.

Scalability is not simply the ability to add more machines. A workload that performs unnecessary repeated computation may remain inefficient even with additional resources.

Detailed distributed-systems scaling strategies are outside this chapter's scope. Here, the focus is on recognizing the factors that influence performance as workloads grow.

### 4.5 Reliability Under Load

A system's performance must be considered alongside its ability to continue operating correctly.

Under excessive load, an application may experience:

- Increasing request queues.
- Timeouts.
- Resource exhaustion.
- Failed requests.
- Memory pressure.
- Reduced throughput.

An optimization that improves average response time but increases the probability of incorrect results is not an acceptable improvement.

Performance requirements must remain subordinate to correctness and the system's reliability requirements.

---

## 5. Algorithmic Complexity

Algorithmic complexity describes how an algorithm's resource requirements grow as its input size increases.

It helps engineers reason about performance beyond a single measurement.

### 5.1 Constant Time: \(O(1)\)

An operation is \(O(1)\) when its cost remains bounded independently of input size under the complexity model being used.

Example:

```python id="j9l5nk"
def get_first_item(items: list[int]) -> int | None:
    if not items:
        return None

    return items[0]
```

Accessing the first list element takes constant time under Python's list model.

The function does not need to inspect every element to return the first item.

### 5.2 Linear Time: \(O(n)\)

An operation is \(O(n)\) when its cost grows approximately in proportion to the input size.

```python id="6xdg72"
def find_value(items: list[int], target: int) -> bool:
    for item in items:
        if item == target:
            return True

    return False
```

In the worst case, the function examines every item.

If the list grows from 1,000 elements to 10,000 elements, the number of inspected elements may grow by approximately ten times.

Actual runtime also depends on constant factors, hardware, and the data.

### 5.3 Quadratic Time: \(O(n^2)\)

Quadratic behavior commonly appears when an operation processes every item against every other item.

```python id="x6qdb1"
def count_equal_pairs(items: list[int]) -> int:
    count = 0

    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                count += 1

    return count
```

The number of pairs grows quadratically with the input size.

Doubling the input can increase the number of pair comparisons by approximately four times for this algorithm.

Quadratic complexity is not automatically unacceptable. It may be reasonable for small inputs or when the problem genuinely requires pairwise comparison. The concern is whether the growth rate fits the expected workload.

### 5.4 Logarithmic Time: \(O(\log n)\)

Logarithmic behavior occurs when an operation repeatedly reduces the remaining search space by a constant factor.

Binary search is a common example.

It requires a sorted sequence and compares the target against the middle element, eliminating approximately half the remaining search space after each comparison.

The number of comparisons grows logarithmically with the number of elements.

### 5.5 Comparing Growth Rates

| Complexity | Typical pattern | Effect of increasing input |
|---|---|---|
| \(O(1)\) | Direct indexed access | Cost remains approximately bounded |
| \(O(\log n)\) | Binary search | Cost grows slowly |
| \(O(n)\) | Single traversal | Cost grows proportionally |
| \(O(n \log n)\) | Efficient comparison sorting | Cost grows faster than linear but slower than quadratic |
| \(O(n^2)\) | Pairwise comparisons | Cost can grow rapidly |
| \(O(2^n)\) | Some exhaustive search algorithms | Cost grows extremely quickly |

This comparison describes asymptotic growth, not exact runtime.

An \(O(n \log n)\) algorithm can be slower than an \(O(n^2)\) algorithm for small inputs because constants, implementation details, and workload characteristics matter.

The useful question is whether the algorithm's growth behavior fits the input sizes the system must handle.

### 5.6 Time Complexity Is Not the Whole Story

Two algorithms with the same asymptotic complexity may have different actual performance.

For example, one implementation may allocate many temporary objects, while another performs fewer allocations. A database-backed operation may spend most of its time waiting for I/O rather than executing CPU instructions.

Complexity analysis helps identify potential scaling problems, but measurement is still needed to understand real execution behavior.

---

## 6. CPU-Bound and I/O-Bound Workloads

Understanding the limiting resource helps determine which optimization is likely to work.

### 6.1 CPU-Bound Work

A workload is CPU-bound when computation is the primary limiting factor.

Examples include:

- Large numerical calculations.
- Repeated transformations of data.
- Complex parsing.
- Expensive image processing.
- Computationally intensive model inference.

Potential improvements include reducing unnecessary computation, choosing better algorithms, avoiding repeated work, or using an appropriate optimized implementation.

Adding concurrency does not automatically improve a CPU-bound workload. The result depends on the language runtime, available processors, execution model, and coordination overhead.

### 6.2 I/O-Bound Work

A workload is I/O-bound when it spends a substantial amount of time waiting for operations such as:

- Database queries.
- Network requests.
- Disk access.
- External service responses.

Consider:

```python id="jtp7ki"
def load_profiles(profile_ids: list[int]) -> list[dict]:
    profiles = []

    for profile_id in profile_ids:
        profile = fetch_profile_from_api(profile_id)
        profiles.append(profile)

    return profiles
```

If each API call waits for a remote response, the function may spend much of its elapsed time waiting rather than executing Python calculations.

Possible improvements depend on the external service and application requirements. Batching requests, reducing unnecessary calls, or using suitable concurrency may help.

However, concurrency introduces additional considerations, including connection limits, rate limits, ordering, error handling, and resource consumption.

### 6.3 Mixed Workloads

Many applications combine CPU-bound and I/O-bound operations.

For example, an AI service may:

1. Receive an HTTP request.
2. Read data from a database.
3. Generate embeddings.
4. Retrieve candidate documents.
5. Call an external model API.
6. Process the result.
7. Return a response.

Different stages may have different performance characteristics.

The correct optimization depends on the stage that limits the user-visible operation and the cost of changing it.

---

## 7. Memory and Allocation Costs

Memory is another important performance dimension.

A program may become slow because it creates large intermediate objects, retains data unnecessarily, or exceeds available memory.

### 7.1 Large Intermediate Collections

Consider:

```python id="gaxz4u"
def process_records(records: list[dict]) -> list[str]:
    names = [
        record["name"]
        for record in records
    ]

    return [
        name.lower()
        for name in names
    ]
```

The function creates an intermediate list of names and then another list of lowercase names.

For some workloads, the intermediate list is unnecessary.

A single comprehension may reduce the number of intermediate collections:

```python id="5w7bno"
def process_records(records: list[dict]) -> list[str]:
    return [
        record["name"].lower()
        for record in records
    ]
```

This reduces an intermediate list, but it does not eliminate the final output list.

Whether the change matters depends on input size and the cost of allocation relative to other work.

### 7.2 Streaming and Iteration

When the consumer does not need all results in memory at once, an iterator may be more appropriate than building a complete list.

```python id="kq5xzz"
def iter_names(records: list[dict]):
    for record in records:
        yield record["name"].lower()
```

The generator yields one result at a time instead of constructing a complete result list.

This can reduce memory requirements when results are consumed incrementally.

However, generators change the consumption model. They are evaluated lazily, may be exhausted after iteration, and do not provide every list operation.

Choose the representation that fits the caller's needs.

### 7.3 Memory Pressure

When memory consumption becomes too high, an application may experience:

- Increased garbage-collection activity.
- Reduced available memory for other operations.
- Operating-system paging.
- Allocation failures.
- Process termination under memory limits.

Reducing unnecessary allocation and retention can help, but memory optimizations should be based on actual usage patterns.

The Profiling chapter covers measurement techniques for investigating memory allocation and runtime behavior.

---

## 8. Repeated Work and Batching

Repeated work is a common source of unnecessary cost.

An application may repeatedly perform an operation even when the result could be reused or several operations could be combined.

### 8.1 Repeated Lookups

Consider:

```python id="z0p36e"
def get_order_user_names(
    orders: list[dict],
    users: list[dict],
) -> list[str | None]:
    names = []

    for order in orders:
        user_id = order["user_id"]

        user = next(
            (
                user
                for user in users
                if user["id"] == user_id
            ),
            None,
        )

        names.append(
            user["name"] if user else None
        )

    return names
```

For each order, the code may scan the user list.

If there are \(M\) orders and \(N\) users, the worst-case search work can grow proportionally to \(M \times N\).

Building a dictionary index can reduce repeated searches:

```python id="a3gh0m"
def get_order_user_names(
    orders: list[dict],
    users: list[dict],
) -> list[str | None]:
    users_by_id = {
        user["id"]: user
        for user in users
    }

    return [
        (
            users_by_id[order["user_id"]]["name"]
            if order["user_id"] in users_by_id
            else None
        )
        for order in orders
    ]
```

The indexed version builds the dictionary once and then performs lookups.

Under typical hash-table assumptions, the expected work is approximately proportional to \(N + M\), rather than \(M \times N\).

The improvement depends on the input, data structure, and assumptions about identifiers. Dictionary construction also consumes memory, and duplicate identifiers can change behavior compared with selecting the first matching user.

### 8.2 Batching

Suppose an application inserts 1,000 records into a database by executing 1,000 separate requests.

Each request may incur network round-trip and protocol overhead.

If the database supports a suitable batch operation, processing multiple records in one request may reduce that overhead.

Batching can improve efficiency, but it introduces trade-offs:

- Larger batches may consume more memory.
- A failed batch may require more complicated error handling.
- Transaction boundaries may change.
- Large requests may exceed service limits.
- Latency for the first item may increase while the batch is being assembled.

The appropriate batch size depends on the dependency, workload, and correctness requirements.

### 8.3 Avoiding Repeated Serialization

Converting the same data repeatedly between JSON, Python objects, or other formats can introduce unnecessary CPU and allocation costs.

Before caching or reusing serialized data, consider whether the underlying data can change and whether the serialized representation must remain synchronized with it.

The correct optimization depends on the data lifecycle and consistency requirements.

---

## 9. Caching Fundamentals

Caching stores the result of an operation so that later requests can reuse it instead of repeating the original work.

A cache may store:

- Database query results.
- Computed values.
- API responses.
- Parsed configuration.
- Frequently accessed reference data.

### 9.1 How Caching Helps

Suppose an application repeatedly loads a reference dataset from a remote service.

Without caching:

```text
Request
   |
   v
Remote Service
   |
   v
Result
```

With a cache:

```text
Request
   |
   v
Cache Lookup
   |
   +-- Hit --> Return Cached Result
   |
   +-- Miss --> Fetch Original Result
                    |
                    v
                Store Result
                    |
                    v
                Return Result
```

A cache hit avoids the original operation. A cache miss performs the work and may populate the cache for future requests.

Caching is especially useful when operations are expensive and the same data is requested repeatedly.

### 9.2 Cache Hit and Miss

A **cache hit** occurs when the requested entry is available in the cache.

A **cache miss** occurs when the requested entry is unavailable and the application must obtain the data from its original source or recompute it.

The benefit of caching depends on how often requests hit the cache and how much cost is avoided by a hit.

Caching data that is rarely reused may add complexity without meaningful performance improvement.

### 9.3 Cache Invalidation

A cache can become stale when the underlying data changes.

For example, if a user's profile changes but the cache continues returning the old profile, the application may show incorrect information.

Cache invalidation strategies include:

- Time-to-live (TTL), which expires entries after a configured duration.
- Explicit invalidation when relevant data changes.
- Versioned keys that distinguish different data versions.
- Recomputing entries when they are next requested.

Each approach has trade-offs.

A short TTL can reduce staleness but increase cache misses. Explicit invalidation can provide fresher data but requires reliable coordination with the update path.

### 9.4 Memory and Operational Costs

Caches consume memory or storage and require policies for expiration, eviction, and failure handling.

A cache may also introduce concurrency problems if multiple requests update or populate the same entry simultaneously.

Caching is not automatically beneficial. It should be justified by the workload, the cost of recomputation or retrieval, and the application's consistency requirements.

---

## 10. Concurrency and Performance

Concurrency allows multiple operations to make progress during overlapping periods.

It can improve throughput or reduce elapsed time when a workload has suitable independent operations, particularly when some tasks spend time waiting.

However, concurrency also introduces scheduling, synchronization, and resource-management costs.

### 10.1 Sequential Execution

Suppose three independent I/O operations each take approximately one second.

Sequential execution might take approximately three seconds, ignoring additional overhead:

```text
Task A: [1 second]
Task B:             [1 second]
Task C:                         [1 second]
```

### 10.2 Overlapping Execution

If the operations can safely overlap, their combined elapsed time may approach the duration of the slowest operation rather than the sum of all durations:

```text
Task A: [1 second]
Task B: [1 second]
Task C: [1 second]
```

This is an illustrative scenario, not a guarantee. Actual results depend on the runtime, remote services, resource limits, and coordination overhead.

### 10.3 Concurrency Is Not Always Faster

Concurrency can make performance worse when:

- Tasks compete for the same resource.
- The dependency enforces strict rate limits.
- Synchronization becomes expensive.
- Too many operations are active simultaneously.
- Work is CPU-bound and the execution model does not provide additional parallel computation.
- Results must be coordinated or processed in a particular order.

Choose concurrency based on the workload and verify its effects through measurement.

Detailed threading, asynchronous programming, and distributed execution models belong to their respective engineering topics. Here, the important principle is that overlapping work can help only when the workload and resources support it.

---

## 11. Latency, Queues, and Resource Saturation

A system can slow down even when the work required for each request has not changed.

One reason is queueing.

If requests arrive faster than a component can process them, requests accumulate while waiting for available capacity.

For example:

```text
Incoming Requests
       |
       v
   Request Queue
       |
       v
  Limited Workers
       |
       v
   Dependency
```

As the queue grows, the time before processing begins increases. Total request latency includes both waiting and execution.

This explains why a system can exhibit high latency even when the average processing time of an individual operation remains relatively stable.

### 11.1 Saturation

A resource becomes saturated when demand approaches or exceeds its effective capacity.

Examples include:

- CPU resources fully occupied by runnable work.
- A database connection pool with no available connections.
- A worker pool that cannot process requests as quickly as they arrive.
- An external API enforcing request limits.

When a bottleneck is saturated, adding more work to it may increase waiting rather than useful throughput.

### 11.2 Backpressure and Bounded Work

A system should avoid accepting unlimited work when downstream components have limited capacity.

Bounded queues, request limits, controlled concurrency, and backpressure can help prevent resource exhaustion.

These mechanisms must be designed according to the application's requirements. Rejecting or delaying work may protect the system but can affect user experience.

The key principle is to understand the capacity of shared resources and avoid creating more simultaneous work than the system can handle safely.

---

## 12. Measuring Performance Correctly

Performance decisions should be based on measurements that reflect the actual objective.

### 12.1 Establish a Baseline

Before changing code, record the current behavior under a representative workload.

Depending on the problem, useful measurements may include:

- Total execution time.
- Per-operation latency.
- Throughput.
- CPU utilization.
- Memory consumption.
- Number of dependency calls.
- Error rate.

Not every investigation requires every metric. Select the measurements that answer the performance question.

### 12.2 Use Equivalent Workloads

A before-and-after comparison is meaningful only when the workload is comparable.

Keep relevant factors consistent, including:

- Input size and shape.
- Runtime configuration.
- Data state.
- Cache state.
- Dependency behavior.
- Measurement method.

If the optimized version processes less work, the apparent improvement may be misleading.

### 12.3 Consider Percentiles

Average latency alone can hide slow requests.

Suppose most requests complete quickly, but a small proportion take several seconds. The average may not communicate the experience of users who encounter the slow requests.

Latency percentiles help describe the distribution.

- **p50:** The median latency; half the measured observations are at or below this value.
- **p95:** Approximately 95% of measured observations are at or below this value.
- **p99:** Approximately 99% of measured observations are at or below this value.

These measurements are useful for understanding the tail of the latency distribution.

Percentiles must be calculated from an appropriate sample and interpreted in context. They do not explain why slow requests occur.

### 12.4 Avoid Premature Optimization

Premature optimization occurs when engineers add complexity to improve performance before establishing that the change is necessary or valuable.

Examples include:

- Introducing a cache for data that is rarely requested.
- Rewriting clear code into a complex implementation without evidence of a bottleneck.
- Adding concurrency before understanding the dependency limits.
- Optimizing a small calculation while most time is spent waiting for a database.

A better process is:

1. Define the performance requirement.
2. Measure representative behavior.
3. Identify the bottleneck.
4. Make a targeted change.
5. Verify correctness.
6. Measure again.

The Profiling chapter explains tools and techniques for identifying expensive functions and memory behavior.

---

## 13. Performance Budgets and Requirements

A performance requirement should describe the expected behavior under a defined workload.

For example:

> The profile endpoint should return responses within 200 milliseconds at p95 under the agreed test workload.

This is more actionable than saying:

> The endpoint should be fast.

A useful performance requirement defines:

- The operation being measured.
- The workload or request distribution.
- The measurement interval or test conditions.
- The metric and target.
- The environment in which the target applies.

The numerical target should come from the application's requirements and expected usage, not from a universal assumption about acceptable latency.

Performance budgets help teams evaluate whether a change remains within the required limits.

They also create a basis for trade-offs. If a feature increases response time, engineers can determine whether the increase is acceptable rather than arguing from intuition.

---

## 14. Common Performance Mistakes

### 14.1 Optimizing Without Measuring

**Problem:** Engineers assume a particular operation is the bottleneck.

**Why it is harmful:** The actual limiting factor may be elsewhere.

**Better approach:** Measure representative behavior and use profiling when attribution is needed.

### 14.2 Ignoring Algorithmic Growth

**Problem:** An algorithm is tested only with small inputs.

**Why it is harmful:** An operation that is acceptable for hundreds of records may become impractical for millions.

**Better approach:** Understand the algorithm's growth characteristics and evaluate realistic input sizes.

### 14.3 Optimizing the Wrong Metric

**Problem:** A function becomes faster, but end-to-end response time does not improve.

**Why it is harmful:** The function may not have contributed significantly to the overall delay.

**Better approach:** Measure the user-visible or workload-level objective as well as the local operation.

### 14.4 Assuming More Concurrency Means More Throughput

**Problem:** The number of concurrent operations is increased without considering shared resource limits.

**Why it is harmful:** Contention, queuing, and dependency throttling can reduce effective throughput.

**Better approach:** Increase concurrency cautiously and measure latency, throughput, and resource usage.

### 14.5 Caching Without an Invalidation Strategy

**Problem:** Cached data is returned after the source has changed.

**Why it is harmful:** Performance improvements introduce incorrect or stale results.

**Better approach:** Define freshness requirements and choose an explicit expiration or invalidation strategy.

### 14.6 Ignoring Memory Consumption

**Problem:** An optimization reduces execution time by retaining large objects indefinitely.

**Why it is harmful:** Memory pressure can degrade the application or cause termination.

**Better approach:** Measure memory usage and evaluate the resource trade-off.

### 14.7 Treating Average Latency as the Whole Story

**Problem:** The average response time looks acceptable while some requests are extremely slow.

**Why it is harmful:** The average hides variation and tail latency.

**Better approach:** Examine latency distributions and relevant percentiles.

### 14.8 Changing Several Things at Once

**Problem:** Multiple optimizations are applied simultaneously.

**Why it is harmful:** It becomes difficult to determine which change produced the improvement or regression.

**Better approach:** Make targeted changes and compare results under equivalent conditions.

### 14.9 Sacrificing Correctness for Speed

**Problem:** An optimization changes edge-case behavior or silently drops work.

**Why it is harmful:** Faster execution is achieved by violating the system's contract.

**Better approach:** Preserve behavior through tests and verify important edge cases.

---

## 15. Engineering Trade-Offs

| Optimization | Potential benefit | Cost or risk |
|---|---|---|
| More efficient algorithm | Reduces work as input grows | May require a more complex implementation |
| Dictionary indexing | Avoids repeated linear searches | Uses additional memory and assumes appropriate key semantics |
| Caching | Avoids repeated computation or retrieval | Introduces freshness, invalidation, and storage concerns |
| Batching | Reduces per-operation overhead | Can increase memory use and complicate error handling |
| Concurrency | Overlaps suitable operations and may improve throughput | Adds coordination overhead and can increase contention |
| Streaming | Reduces the need to retain complete result sets | Changes consumption behavior and may limit repeated access |
| More compute resources | Can increase capacity for resource-bound workloads | Increases cost and may not address the underlying bottleneck |
| Reducing diagnostic work | Can reduce runtime overhead | May make failures harder to investigate if useful evidence is lost |

The best optimization is not necessarily the one that produces the largest local speedup. It is the one that meets the performance objective while preserving correctness, reliability, and maintainability at an acceptable cost.

---

## 16. Production Engineering Perspective

Performance fundamentals apply across APIs, data-processing jobs, AI applications, and backend services.

Consider an AI-powered API that retrieves candidate profiles and generates a ranked result.

Its response time may include:

1. Input validation.
2. Database or vector-search queries.
3. Embedding generation.
4. Retrieval and filtering.
5. Model inference or external API calls.
6. Result transformation.
7. Response serialization.

Optimizing the response transformation may have little effect if most time is spent waiting for a remote model API.

Similarly, caching embeddings may reduce repeated computation, but the cache must use appropriate keys and remain consistent with the relevant input data and model configuration.

A useful production approach is to examine the entire operation, identify the limiting stage, and choose a targeted improvement.

Before accepting the change, verify:

- Correctness for relevant inputs.
- Performance under a representative workload.
- Resource consumption.
- Failure behavior.
- Any additional complexity or operational cost.

Performance engineering is an ongoing activity because workloads, dependencies, data volumes, and system requirements change over time.

---

## 17. Interview Questions and Answers

### Q1. What is the difference between latency and throughput?

Latency measures the time required for an operation to complete. Throughput measures how much work a system completes per unit of time. A system can have high throughput while individual operations experience high latency.

### Q2. What is algorithmic complexity?

Algorithmic complexity describes how resource requirements grow as input size increases. It helps predict whether an algorithm will remain practical as workloads grow.

### Q3. Why can an \(O(n^2)\) algorithm become problematic?

Its work can grow quadratically with input size. Doubling the input may produce approximately four times as many operations, depending on the algorithm and workload.

### Q4. What is the difference between CPU-bound and I/O-bound work?

CPU-bound work is primarily limited by computation. I/O-bound work spends substantial time waiting for operations such as database queries, network requests, or disk access.

### Q5. When is caching useful?

Caching is useful when the same data or computation is requested repeatedly and reusing a result is cheaper than retrieving or computing it again. Its value depends on reuse frequency, storage cost, and freshness requirements.

### Q6. What is cache invalidation?

Cache invalidation is the process of expiring or removing cached entries when they are no longer valid. It is necessary to prevent outdated data from being used beyond the application's accepted freshness requirements.

### Q7. Why is concurrency not always faster?

Concurrency introduces coordination overhead and can increase contention for shared resources. It is beneficial only when the workload and execution model allow useful work to overlap without excessive costs.

### Q8. Why can reducing the runtime of a function fail to improve API latency?

The function may account for only a small portion of total request time. Other stages, such as database queries or external API calls, may dominate the end-to-end duration.

### Q9. Why are p95 and p99 latency useful?

They describe the slower portion of the latency distribution and can reveal problems hidden by the average. They help engineers evaluate how often requests experience high latency.

### Q10. What is premature optimization?

Premature optimization is adding complexity to improve performance before establishing that the improvement is needed or that the targeted operation is a meaningful bottleneck.

### Q11. How would you investigate a slow API endpoint?

I would define the latency requirement and representative workload, measure end-to-end latency, identify expensive stages, use profiling or other appropriate measurements, form a hypothesis, apply a targeted optimization, and verify both correctness and performance.

### Q12. How would you decide whether to cache a database result?

I would evaluate the query cost, access frequency, expected reuse, data freshness requirements, memory or storage cost, invalidation strategy, and behavior when the cache is unavailable. I would then measure whether caching improves the relevant workload.

---

## 18. Practical Assignment

### Assignment: Improve a Repeated-Lookup Workflow

Consider this implementation:

```python id="qwmzjr"
def get_order_totals(
    orders: list[dict],
    products: list[dict],
) -> list[float]:
    totals = []

    for order in orders:
        product_id = order["product_id"]

        product = next(
            (
                product
                for product in products
                if product["id"] == product_id
            ),
            None,
        )

        if product is None:
            raise ValueError(
                f"Product not found: {product_id}"
            )

        total = (
            product["price"] * order["quantity"]
        )

        totals.append(total)

    return totals
```

The function repeatedly scans the product list to find the product for each order.

### Tasks

1. Explain the time-complexity characteristics of the original implementation.
2. Create a representative dataset with many products and orders.
3. Measure the original implementation's execution time.
4. Implement an alternative that builds a dictionary index of products.
5. Verify that both implementations return the same results for valid inputs.
6. Verify that missing product identifiers are handled consistently.
7. Investigate how duplicate product identifiers affect the two implementations.
8. Compare execution time under equivalent workloads.
9. Discuss the memory cost of building the index.
10. Explain when the indexed implementation would be a better engineering choice.

### Additional Challenge

Suppose the product data changes frequently.

Explain how you would decide whether to rebuild the index, cache it, or construct it for each operation. Consider freshness, memory, repeated work, and correctness.

### Expected Deliverables

- Original implementation.
- Optimized implementation.
- Tests for normal and edge cases.
- Before-and-after timing measurements.
- Complexity analysis.
- A short trade-off analysis covering memory, correctness, and maintainability.

Do not assume the optimized version is automatically better in every scenario. Use the measured workload and stated requirements to justify your decision.

---

## 19. Quick Revision

- Performance engineering balances execution efficiency with correctness and maintainability.
- Latency measures elapsed time for an operation.
- Throughput measures completed work per unit of time.
- Resource utilization describes how much of a resource is being used.
- Algorithmic complexity helps predict growth as input size increases.
- CPU-bound and I/O-bound workloads require different investigations.
- Memory allocation and retention can affect performance.
- Repeated work can often be reduced through appropriate indexing or batching.
- Caching can reduce repeated work but introduces freshness and invalidation concerns.
- Concurrency helps only when useful work can overlap without excessive contention.
- Profiling and measurement help identify bottlenecks.
- Performance changes must be verified against equivalent workloads and correctness requirements.

## 20. Key Takeaways

1. **Start with a requirement:** Define what performance means for the operation and workload.
2. **Understand the limiting resource:** CPU, memory, I/O, dependencies, and queues create different bottlenecks.
3. **Reason about growth:** Algorithmic complexity helps identify designs that become impractical as input sizes increase.
4. **Avoid repeated work:** Indexing, batching, and caching can improve efficiency when their assumptions and trade-offs are appropriate.
5. **Measure the actual outcome:** Compare equivalent workloads and evaluate the metric that matters to the user or system.
6. **Preserve correctness:** An optimization is unacceptable if it violates the application's behavior or data requirements.
7. **Prefer justified simplicity:** Optimize where the evidence supports improvement and avoid complexity without a clear benefit.

## 21. Further Reading

- [Python Profilers](https://docs.python.org/3/library/profile.html)
- [Python `time` Module](https://docs.python.org/3/library/time.html)
- [Python `tracemalloc` Module](https://docs.python.org/3/library/tracemalloc.html)
- [Python Data Structures](https://docs.python.org/3/tutorial/datastructures.html)
- [Python `functools` Module](https://docs.python.org/3/library/functools.html)

---

# End of Document

This completes the Markdown file: `10-Performance-Fundamentals.md`
