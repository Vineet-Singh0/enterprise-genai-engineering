# Profiling

## 1. Overview

Profiling is the process of measuring a program's runtime behavior to understand where it spends time, how it uses resources, and which operations contribute most to its execution cost.

As software grows, performance problems become difficult to identify through code inspection alone. A function that looks expensive may execute rarely, while a seemingly simple operation may run thousands of times and dominate total execution time.

Profiling provides evidence about actual execution rather than relying on assumptions.

For example, an API endpoint may respond slowly because it repeatedly processes the same data, spends time in a database call, or performs an expensive calculation. A profiler can help determine which part of the execution deserves investigation.

Profiling does not automatically make software faster. It helps engineers identify where optimization is most likely to produce meaningful improvements.

### Learning Objectives

By the end of this chapter, you should be able to:

- Explain the purpose of profiling and distinguish it from debugging and logging.
- Identify common profiling measurements.
- Use Python's built-in `cProfile` and `pstats` modules.
- Understand cumulative time and function self-time.
- Use a profiler to identify expensive operations.
- Recognize common profiling mistakes.
- Compare profiling results before and after an optimization.
- Understand the limitations of profiling measurements.

### Prerequisites

You should understand:

- Functions, loops, modules, and function calls.
- Basic program execution.
- Logging and debugging from the preceding chapters.
- Basic Python data structures and function behavior.

### Expected Reading Time

20–30 minutes.

---

## 2. Why Profiling Matters

Performance problems are often caused by behavior that is not obvious from reading source code.

Consider this example:

```python
def find_users(users: list[dict], target_id: int) -> dict | None:
    for user in users:
        if user["id"] == target_id:
            return user

    return None
```

The function searches a list until it finds the requested user. This may be perfectly adequate for a small list.

However, if the application repeatedly searches a very large list for many different users, the total cost may become significant.

The issue is not necessarily that the function is incorrectly implemented. The issue may be that its execution cost is too high for the workload.

Profiling helps answer questions such as:

- Which functions consume the most execution time?
- How frequently is a function called?
- Which operations contribute most to the total runtime?
- Is an expensive operation being repeated unnecessarily?
- Did a code change improve or worsen measured performance?

Without measurement, engineers can spend time optimizing code that has little effect on the application's overall runtime.

**The central principle of profiling is to measure actual behavior before deciding where to optimize.**

## 3. A Mental Model of Profiling

Think of a program as a collection of operations with different execution costs.

```text
Application
    |
    +-- Parse input          5 ms
    |
    +-- Validate data       10 ms
    |
    +-- Calculate results   80 ms
    |
    +-- Format response      5 ms
```

The values above are illustrative.

If the total execution time is dominated by `Calculate results`, optimizing response formatting is unlikely to provide a meaningful improvement.

Profiling helps identify the expensive portions of the execution path.

It also helps distinguish between two different questions:

- **Where is time spent?** Identify expensive functions and operations.
- **Why is time spent there?** Investigate the algorithm, data, repeated work, dependencies, or other behavior responsible for the cost.

A profiler primarily helps answer the first question. Engineers still need reasoning and further investigation to answer the second.

## 4. Common Profiling Measurements

Different profiling tools measure different aspects of program execution.

### 4.1 Execution Time

Execution time measures how long an operation takes to complete.

For example, a function may take 0.2 seconds to process a dataset.

The measured duration depends on factors such as input size, hardware, system load, runtime configuration, and dependency behavior.

One measurement is rarely sufficient to characterize performance across all relevant workloads.

### 4.2 Call Count

Call count indicates how many times a function was invoked during the measured execution.

A function that takes a small amount of time per call may still dominate total runtime if it is called very frequently.

For example:

```python
def normalize(value: str) -> str:
    return value.strip().lower()
```

The function is inexpensive for a single string. If called millions of times inside a processing pipeline, its cumulative cost may become worth investigating.

Call counts help reveal repeated work that may otherwise be overlooked.

### 4.3 Self-Time

Self-time, also called *exclusive time*, represents time attributed to a function's own execution, excluding time attributed to its subcalls in profilers that report this metric.

Suppose a function calls three other functions and spends most of its time waiting for them to complete.

Its self-time may be small even though its total execution time is large.

Self-time helps identify work performed directly inside a function.

### 4.4 Cumulative Time

Cumulative time includes a function's own execution and the execution time attributed to its subcalls.

A function may have low self-time but high cumulative time because it calls expensive functions.

For example:

```text
Function                Self Time     Cumulative Time
-----------------------------------------------------
generate_report          0.01 s          2.40 s
load_records             0.05 s          1.50 s
calculate_statistics     0.70 s          0.75 s
format_output            0.10 s          0.12 s
```

These values are illustrative.

`generate_report` has high cumulative time because the work it initiates takes time across multiple calls. It may be the right entry point for investigation, but the expensive operation could be deeper in its call hierarchy.

### 4.5 Memory Usage

Memory profiling investigates how much memory a program allocates or retains.

This is different from measuring execution time.

A program may execute quickly but consume excessive memory, or it may have acceptable memory usage while running slowly.

Memory profiling can help investigate:

- Large intermediate collections.
- Repeated object creation.
- Unexpected memory retention.
- Excessive copying of data.
- Memory growth during long-running operations.

Python's `tracemalloc` module can help trace Python memory allocations. It is useful for many allocation investigations but does not account for every possible allocation made by native extensions or external processes.

### 4.6 CPU Time and Wall-Clock Time

CPU time measures time spent executing on the CPU, while wall-clock time measures elapsed time.

These measurements can differ significantly.

An operation that spends time waiting for a network response may have high wall-clock duration but relatively low CPU time.

An operation performing intensive calculations may consume substantial CPU time.

Understanding the distinction helps avoid interpreting every slow operation as a CPU bottleneck.

---

## 5. Profiling Python Applications With `cProfile`

Python includes `cProfile`, a deterministic profiler that records function-call information during program execution.

It can report how often functions are called and how execution time is attributed to them.

### 5.1 A Simple Example

Create a file named `profile_example.py`:

```python
def calculate_squares(limit: int) -> list[int]:
    return [number * number for number in range(limit)]


def main() -> None:
    results = calculate_squares(1_000_000)
    print(f"Calculated {len(results)} squares")


if __name__ == "__main__":
    main()
```

Run the script with the profiler:

```bash
python -m cProfile profile_example.py
```

The profiler executes the program and prints a report containing columns such as:

- `ncalls`: Number of calls.
- `tottime`: Time attributed to a function's own execution, excluding subcalls.
- `percall`: A per-call time measurement.
- `cumtime`: Cumulative time attributed to a function and its subcalls.
- `filename:lineno(function)`: The function's source location.

Exact output values depend on the execution environment.

### 5.2 Save Results for Analysis

For larger programs, saving profiling statistics can be more convenient than reading the entire report in the terminal.

```bash
python -m cProfile -o profile_results.prof profile_example.py
```

The `-o` option writes profiling data to a file.

You can inspect the saved results using `pstats`:

```python
import pstats

stats = pstats.Stats("profile_results.prof")
stats.sort_stats("cumulative").print_stats(20)
```

This prints the first 20 entries after sorting by cumulative time.

You can also sort by self-time:

```python
import pstats

stats = pstats.Stats("profile_results.prof")
stats.sort_stats("tottime").print_stats(20)
```

These two reports answer different questions.

- Sorting by cumulative time helps identify functions whose execution paths are expensive overall.
- Sorting by self-time helps identify functions that perform expensive work directly.

Do not assume that the first function in a report is automatically the best optimization target. Understand the call hierarchy and the operation's role before changing code.

### 5.3 Profiling a Specific Function

You can profile a targeted operation rather than an entire application.

```python
import cProfile


def calculate_total(values: list[int]) -> int:
    return sum(values)


values = list(range(1_000_000))

profiler = cProfile.Profile()
profiler.enable()

result = calculate_total(values)

profiler.disable()

print(result)
profiler.print_stats(sort="cumulative")
```

This focuses the profiling session on a particular execution region.

The measured region should include the work you intend to investigate. If important setup or dependency operations occur outside that region, they will not be represented in the same way.

### 5.4 What `cProfile` Does Not Tell You

`cProfile` helps attribute execution time to function calls. It does not automatically explain:

- Why an algorithm has high complexity.
- Whether a database query is poorly indexed.
- Whether memory usage is excessive.
- Whether a network dependency is slow for reasons outside the Python process.
- Whether performance is acceptable under production concurrency.
- Whether an optimization improves the user's overall experience.

Use the report as evidence for the next investigation step, not as a complete performance diagnosis.

---

## 6. Profiling Workflow

A repeatable workflow helps ensure that profiling results are useful and that optimizations are supported by evidence.

### Step 1: Define the Performance Question

Avoid starting with the vague goal of making the application faster.

Instead, define a specific question:

- Which function dominates the runtime of this batch job?
- Why does report generation take several seconds?
- Did the latest change increase the time spent processing each record?
- Which part of a local request-handling workflow is expensive?

A specific question helps determine what to measure.

### Step 2: Establish a Baseline

Measure the current implementation under a known workload.

Record relevant details, such as:

- Input size and shape.
- Runtime and library versions where relevant.
- Machine or environment.
- Number of repetitions.
- Elapsed time.
- Profiling configuration.

A baseline provides a comparison point for later changes.

### Step 3: Choose the Right Tool

Select the tool according to the question.

| Question | Possible tool |
|---|---|
| Which Python functions consume execution time? | `cProfile` |
| How much elapsed time does a small operation take? | `time.perf_counter()` |
| How does Python allocation behavior change? | `tracemalloc` |
| Which code paths need deeper statistical sampling? | A sampling profiler such as `py-spy` |

Each tool has different measurement behavior and limitations. Do not use a CPU profiler to answer every memory, latency, or throughput question.

### Step 4: Profile a Representative Workload

The input should resemble the conditions under which the performance issue matters.

A function processing ten records may behave very differently from the same function processing one million records.

For stateful applications, consider whether setup, cache state, database contents, and repeated execution affect the result.

### Step 5: Inspect the Results

Look for:

- Functions with high cumulative time.
- Functions with high self-time.
- Unexpectedly high call counts.
- Repeated operations.
- Expensive paths triggered by common inputs.
- Differences between expected and actual execution patterns.

Do not focus only on the largest duration. Consider how frequently the operation occurs and whether it affects the user-visible workload.

### Step 6: Form a Hypothesis

For example:

> Report generation is slow because the code repeatedly scans the entire user list for each report entry.

This hypothesis suggests a concrete investigation: inspect the relevant loops and determine whether repeated scanning is occurring.

### Step 7: Optimize the Relevant Operation

Make a targeted change based on the evidence.

Possible changes include eliminating repeated calculations, choosing a more suitable data structure, reducing unnecessary function calls, or avoiding repeated processing of the same data.

The right optimization depends on the measured bottleneck and the application's correctness requirements.

### Step 8: Measure Again

Repeat the same workload under comparable conditions.

Compare:

- Total runtime.
- Relevant function time.
- Call counts.
- Memory usage, if relevant.
- Correctness of the resulting output.

A change that makes one function faster may increase the cost elsewhere. Measure the overall operation as well as the targeted function.

### Step 9: Keep or Reject the Change

Retain the optimization only when the measurements and correctness checks support it.

If the improvement is negligible, the extra complexity may not be justified.

If the performance worsens, investigate the cause or revert the change.

Profiling is an iterative process, not a one-time activity.

---

## 7. A Practical Before-and-After Example

Consider a function that repeatedly searches a list.

```python
def find_user(
    users: list[dict],
    target_id: int,
) -> dict | None:
    for user in users:
        if user["id"] == target_id:
            return user

    return None


def process_orders(
    users: list[dict],
    order_user_ids: list[int],
) -> list[dict | None]:
    results = []

    for user_id in order_user_ids:
        results.append(find_user(users, user_id))

    return results
```

If there are \(N\) users and \(M\) order references, the repeated linear search can perform work proportional to \(N \times M\) in the worst case.

A profiler may reveal that `find_user` is called very frequently and accumulates substantial runtime.

A possible alternative is to build an index once:

```python
def process_orders(
    users: list[dict],
    order_user_ids: list[int],
) -> list[dict | None]:
    users_by_id = {
        user["id"]: user
        for user in users
    }

    return [
        users_by_id.get(user_id)
        for user_id in order_user_ids
    ]
```

Building the dictionary requires work proportional to the number of users, and lookups are expected to take constant time on average under normal hash-table assumptions.

The expected overall lookup work becomes approximately proportional to \(N + M\), rather than \(N \times M\), for this workload.

However, the change introduces assumptions and trade-offs:

- User identifiers must uniquely identify users if the dictionary is expected to represent one user per identifier.
- Duplicate identifiers in the original list will cause later entries to replace earlier entries in the dictionary.
- The index consumes additional memory.
- The original implementation returns the first matching user, while the dictionary version keeps the last user for duplicate identifiers.

Therefore, the optimized version is not automatically behaviorally equivalent for all possible inputs.

Before accepting it, verify the uniqueness assumptions and test the expected behavior. Then profile the representative workload again.

This example demonstrates why performance work must preserve correctness.

---

## 8. Profiling Memory With `tracemalloc`

Time profiling cannot explain every resource problem. If an application consumes increasing amounts of memory, allocation tracing may help.

Python's `tracemalloc` module can record information about Python memory allocations.

Example:

```python
import tracemalloc


def create_records(count: int) -> list[dict[str, int]]:
    return [
        {"id": number, "value": number * 2}
        for number in range(count)
    ]


tracemalloc.start()

records = create_records(100_000)

current, peak = tracemalloc.get_traced_memory()

print(f"Current traced memory: {current:,} bytes")
print(f"Peak traced memory: {peak:,} bytes")

tracemalloc.stop()
```

The example reports current and peak traced memory for the tracing session.

Important limitations:

- Tracing has overhead.
- The result is not equivalent to total operating-system process memory.
- Native allocations that are not tracked by `tracemalloc` may be missing.
- The measurement includes allocations made during the tracing interval, not only allocations in the target function.

For more detailed investigation, snapshots can be compared to identify where traced allocations originate.

The objective is to find evidence of excessive allocation or retention, not merely to collect a large memory number.

---

## 9. Measurement Quality and Profiler Overhead

Profiling itself can affect execution.

A profiler introduces overhead while collecting measurements. The overhead and the resulting attribution depend on the tool, runtime, workload, and environment.

### 9.1 Do Not Treat One Run as Definitive

Runtime varies because of:

- Operating-system scheduling.
- CPU frequency changes.
- Background processes.
- Cache state.
- Garbage collection.
- Input variation.
- Dependency latency.
- Runtime warm-up.

Repeat measurements when appropriate and compare results under similar conditions.

### 9.2 Separate Profiling From Simple Timing

For a small operation, a profiler may add substantial overhead relative to the operation's original runtime.

For basic elapsed-time measurements, `time.perf_counter()` provides a high-resolution performance counter suitable for measuring durations.

```python
from time import perf_counter


start = perf_counter()

perform_operation()

elapsed = perf_counter() - start

print(f"Elapsed time: {elapsed:.6f} seconds")
```

This measures wall-clock elapsed time around the operation. It does not provide function-level attribution.

Use a timer to measure duration and a profiler to investigate where execution time is attributed.

### 9.3 Compare Equivalent Workloads

A valid before-and-after comparison should use equivalent inputs and execution conditions.

If the optimized version processes fewer records, benefits from a warmed cache, or skips an operation that the original version performed, the comparison may be misleading.

For meaningful results, document the workload and understand any differences between the runs.

---

## 10. Common Profiling Mistakes

### 10.1 Optimizing Without Measurement

**Problem:** An engineer assumes that a particular function must be slow because its code looks complicated.

**Why it is harmful:** The real bottleneck may be elsewhere.

**Better approach:** Measure representative execution and investigate the evidence.

### 10.2 Optimizing Only Self-Time

**Problem:** A function with low self-time is ignored.

**Why it is harmful:** It may initiate expensive calls that dominate cumulative time.

**Better approach:** Inspect both self-time and cumulative time, along with the call hierarchy.

### 10.3 Confusing Cumulative Time With Exclusive Time

**Problem:** The cumulative time of several nested functions is added together as though the values were independent.

**Why it is harmful:** Parent and child measurements can include overlapping execution time.

**Better approach:** Understand the profiler's accounting rules before aggregating measurements.

### 10.4 Profiling an Unrepresentative Workload

**Problem:** A tiny local input is used to predict behavior at production scale.

**Why it is harmful:** Call counts, algorithmic behavior, allocation patterns, and dependency costs may differ substantially.

**Better approach:** Use workloads that reflect the actual performance question.

### 10.5 Ignoring Profiler Overhead

**Problem:** Profiled runtime is treated as identical to unprofiled runtime.

**Why it is harmful:** Instrumentation can affect both duration and the apparent distribution of work.

**Better approach:** Use profiler results for attribution and separate timing runs for appropriate elapsed-time comparisons.

### 10.6 Trusting One Measurement

**Problem:** A single run is treated as conclusive evidence.

**Why it is harmful:** Environmental variation may dominate small differences.

**Better approach:** Repeat measurements and compare equivalent runs.

### 10.7 Making an Optimization That Changes Behavior

**Problem:** A faster implementation changes edge-case behavior or violates an existing contract.

**Why it is harmful:** Performance improves at the expense of correctness.

**Better approach:** Verify semantic equivalence for the required inputs and preserve regression tests.

### 10.8 Assuming CPU Profiling Explains Every Slow Operation

**Problem:** A slow operation is investigated only through CPU time.

**Why it is harmful:** The delay may originate from waiting for a database, network service, lock, or other resource.

**Better approach:** Select measurements that match the suspected bottleneck and distinguish CPU time from elapsed time.

---

## 11. Engineering Trade-Offs

| Technique | Benefit | Limitation |
|---|---|---|
| Deterministic profiling with `cProfile` | Provides function-call counts and timing attribution | Adds overhead and may distort very short operations |
| Wall-clock timing | Measures elapsed duration around an operation | Does not explain where time was spent |
| Memory tracing | Helps investigate Python allocation behavior | Does not capture every form of process memory |
| Profiling a small function | Reduces the search area | May omit costs introduced by surrounding components |
| Profiling a complete workload | Shows more of the end-to-end execution path | Can produce large reports that require filtering |
| Optimizing an observed hotspot | Targets a measured cost | May have little end-to-end impact if another cost dominates |
| Building an index or cache | Can reduce repeated computation | Adds memory use, state, and potentially invalidation complexity |

Profiling results should inform engineering decisions, not replace them.

A meaningful optimization should improve the relevant workload, preserve correctness, and justify any additional complexity it introduces.

---

## 12. Production Engineering Perspective

Profiling in a production environment requires more care than profiling a small local script.

Production workloads may involve:

- Concurrent requests.
- Variable input sizes.
- Shared resources.
- External dependencies.
- Background jobs.
- Memory limits.
- Different hardware and runtime settings.

A local profile can reveal an inefficient algorithm or expensive function, but it may not capture the behavior of a service under realistic concurrency.

For an API application, distinguish the time spent executing Python code from time spent waiting on external systems. For a data-processing job, consider both total runtime and memory growth as the dataset increases.

Production profiling techniques should be chosen according to the environment's safety, overhead, and data-handling requirements. Do not assume that attaching an intrusive profiler to a live service is harmless.

The general approach remains the same:

1. Define the performance question.
2. Select a safe measurement method.
3. Collect evidence under representative conditions.
4. Identify the likely bottleneck.
5. Apply a targeted optimization.
6. Verify correctness and measure again.

Detailed scalability, latency, throughput, and algorithmic trade-offs are covered in `10-Performance-Fundamentals.md`. This chapter focuses on measurement and profiling practice.

---

## 13. Interview Questions and Answers

### Q1. What is profiling?

Profiling measures aspects of program execution, such as function timing, call counts, or memory allocation, to help identify performance bottlenecks.

### Q2. Why should engineers profile before optimizing?

Because code that looks expensive may not dominate the actual workload. Profiling provides evidence about where resources are being consumed and helps prioritize changes.

### Q3. What is the difference between self-time and cumulative time?

Self-time excludes time attributed to subcalls, while cumulative time includes the function's own execution and its subcalls.

### Q4. What is `cProfile`?

`cProfile` is Python's built-in deterministic profiler. It records function-call statistics and timing information that can be inspected using its report or the `pstats` module.

### Q5. What does a high call count indicate?

It indicates that a function was invoked frequently during the measured execution. Whether that is a problem depends on the cost per call and the workload.

### Q6. Why can a function have high cumulative time but low self-time?

The function may spend little time executing its own statements while invoking other functions that consume substantial time.

### Q7. What is the difference between CPU time and wall-clock time?

CPU time measures time spent executing on the CPU. Wall-clock time measures elapsed duration and includes time spent waiting for other operations.

### Q8. What is the purpose of `tracemalloc`?

It helps trace Python memory allocations and inspect current and peak traced memory, which can be useful when investigating allocation behavior.

### Q9. Can profiling make a program slower?

Yes. Profiling adds measurement overhead. The amount depends on the profiler, workload, and runtime.

### Q10. How would you verify a performance optimization?

Run equivalent workloads before and after the change, compare the relevant measurements, verify the output and edge cases, and determine whether the improvement justifies the additional complexity.

---

## 14. Practical Assignment

### Assignment: Profile and Improve Repeated Lookup

Use the following implementation:

```python
import cProfile
import pstats


def find_user(
    users: list[dict],
    target_id: int,
) -> dict | None:
    for user in users:
        if user["id"] == target_id:
            return user

    return None


def process_orders(
    users: list[dict],
    order_user_ids: list[int],
) -> list[dict | None]:
    return [
        find_user(users, user_id)
        for user_id in order_user_ids
    ]


def main() -> None:
    users = [
        {"id": number, "name": f"user-{number}"}
        for number in range(50_000)
    ]

    order_user_ids = list(range(40_000))

    results = process_orders(users, order_user_ids)

    print(f"Processed {len(results)} order references")


if __name__ == "__main__":
    profiler = cProfile.Profile()
    profiler.enable()

    main()

    profiler.disable()

    pstats.Stats(profiler).sort_stats(
        "cumulative"
    ).print_stats(15)
```

### Tasks

1. Run the program and inspect the profiling report.
2. Identify the functions with the highest cumulative time.
3. Inspect call counts and determine whether repeated work is occurring.
4. Form a hypothesis about why the lookup workflow is expensive.
5. Implement an alternative using a dictionary index.
6. Verify that the original and optimized versions return equivalent results for the required input assumptions.
7. Profile both implementations with equivalent data.
8. Compare the measurements and explain the result.
9. Discuss the additional memory cost of building the index.
10. Test edge cases, including a missing user identifier and duplicate identifiers, and explain how the implementations behave.

### Expected Deliverables

- Original implementation and profiling results.
- Optimized implementation.
- Before-and-after comparison.
- Correctness tests.
- A short explanation of the bottleneck and the optimization's trade-offs.

Do not claim that the optimized version is faster based only on the algorithm's expected complexity. Run the experiment and report the actual measurements from your environment.

---

## 15. Quick Revision

- Profiling measures runtime behavior and helps identify performance bottlenecks.
- `cProfile` provides function-call and timing statistics.
- `pstats` helps sort and inspect saved profiling results.
- Self-time excludes time attributed to subcalls; cumulative time includes it.
- Call counts can reveal expensive repeated work.
- `tracemalloc` helps investigate Python memory allocations.
- Wall-clock time and CPU time measure different aspects of execution.
- Profiling introduces overhead and results can vary between runs.
- Representative workloads are necessary for useful conclusions.
- Optimizations must preserve correctness and be measured again.
- A profiler identifies where time is attributed; further investigation explains why.

## 16. Key Takeaways

1. **Measure before optimizing:** Use profiling evidence instead of assumptions about expensive code.
2. **Understand the measurements:** Self-time, cumulative time, call counts, memory, and elapsed duration answer different questions.
3. **Choose the right tool:** Match the measurement method to the performance question.
4. **Use representative workloads:** Results are meaningful only in the context of the input and environment.
5. **Verify the trade-off:** An optimization should improve the relevant workload without violating correctness or introducing unjustified complexity.
6. **Treat profiling as iterative:** Establish a baseline, investigate a bottleneck, make a targeted change, and measure again.

## 17. Further Reading

- [Python Profilers — `profile` and `cProfile`](https://docs.python.org/3/library/profile.html)
- [Python `pstats` Module](https://docs.python.org/3/library/pstats.html)
- [Python `time` Module](https://docs.python.org/3/library/time.html)
- [Python `tracemalloc` — Trace Memory Allocations](https://docs.python.org/3/library/tracemalloc.html)
- [py-spy — Sampling Profiler for Python](https://github.com/benfred/py-spy)

---

# End of Document

This completes the Markdown file: `06-Profiling.md`
