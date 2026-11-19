# 06 — Inference Performance and Resource Trade-offs

## 1. Purpose

Optimizing a language model requires understanding not only how much memory its parameters occupy, but also how the model consumes computation, memory, and time during inference.

Inference performance depends on several interacting factors:

- Input and output token counts.
- Model architecture and computational requirements.
- Memory traffic and intermediate state.
- Hardware and numerical representation.
- Workload concurrency and request characteristics.
- Quality and resource constraints imposed by the application.

These factors affect latency, throughput, memory consumption, and the amount of work an execution environment can support.

A model can fit within available memory and still be too slow for an application. A model that performs well on short prompts may struggle with long contexts. A configuration that improves aggregate throughput may increase the time individual requests spend waiting.

The engineering objective is not simply to make inference faster. It is to identify the relevant workload, understand its limiting resource, and choose an appropriate trade-off without violating application requirements.

This chapter covers:

- Prefill and decode performance.
- Latency and throughput metrics.
- Input length, output length, and attention-related costs.
- KV-cache memory and its relationship to context length.
- Compute-bound and memory-bound behavior.
- Batch size, concurrency, and workload trade-offs.
- The relationship between model representation and inference performance.
- Controlled inference-performance investigations.

The focus is model-level inference behavior and resource reasoning. Advanced serving schedulers, continuous batching implementations, GPU kernels, distributed inference, production infrastructure, and operational monitoring belong to Production AI Engineering.

## 2. An Execution-Oriented Mental Model

A typical decoder-only autoregressive language model processes the input sequence and then generates output tokens sequentially. For performance analysis, these activities are commonly divided into two phases:

1. **Prefill:** Process the input sequence and prepare the state needed for generation.
2. **Decode:** Generate successive output tokens using the existing context and updated model state.

These phases have different performance characteristics and can stress different resources.

Consider two requests:

- Request A processes a long document and generates a short answer.
- Request B processes a short prompt and generates a long answer.

Request A may spend a larger share of its execution time processing the input. Request B may spend more time performing successive generation steps.

This distinction helps determine which performance metrics and resource constraints deserve investigation.

```text
<title size="md">Prefill</title>
Input sequence → prompt-processing computation → initial generation state
Performance analysis focuses on input length, prompt-processing cost, and time until generation begins.
        ↓
<title size="md">Decode</title>
Current context → next-token computation → updated context → repeat
Performance analysis focuses on per-token latency, output length, and the resources needed to retain and access context.
```

A long delay before the first output token suggests investigating prompt processing and request-startup costs. Slow token emission after generation begins suggests investigating decode execution, memory behavior, and other per-step costs.

These are diagnostic hypotheses, not definitive conclusions. Tokenization, queueing, network transfer, runtime initialization, and other factors can also affect observed latency.

The detailed mechanics of autoregressive generation belong to LLM-05. Here, the distinction is used to explain performance and resource behavior.

## 3. Prefill and Decode Performance

### 3.1 Prefill performance

Prefill processes the input tokens to establish the state required for generation. Its cost depends on input length, model architecture, computational operations, numerical representation, hardware, and implementation.

For a decoder-only transformer, prefill includes attention and feed-forward computation across the input sequence. Attention-related computation can become particularly important for long prompts.

Prefill can process multiple input positions in parallel, but parallelism does not eliminate its computational or memory costs.

When prefill is a major contributor to request latency, useful questions include:

- How many input tokens are being processed?
- Is the workload dominated by long prompts?
- Which operations contribute most to the processing cost?
- Is the relevant limitation computation, memory movement, or another request-startup component?
- Does the application genuinely require the entire input context?

A long prompt may be necessary for the task, so reducing context should not be treated as a free optimization. Removing relevant information can affect answer quality.

### 3.2 Decode performance

Decode generates output tokens through successive model executions. Its total cost depends on the number of generation steps and the cost of each step.

The cost of a decode step need not remain constant. As the context grows, attention-related work and cached-state access can change.

Relevant factors include:

- Model architecture and parameter count.
- Output token count.
- Length of the existing context.
- KV-cache size and access behavior.
- Memory bandwidth and compute capacity.
- Numerical representation and execution implementation.

A longer output requires more generation steps. Even when the time per step is stable, total generation time increases with the number of output tokens.

When decode is the primary concern, measure token-generation behavior rather than relying exclusively on TTFT or prefill measurements.

### 3.3 Diagnosing the phase that matters

| Observed behavior | Initial hypothesis | Evidence to investigate |
|---|---|---|
| Long delay before the first token | Prefill or request-startup costs may dominate | Input token count, TTFT, tokenization and setup time where measurable |
| Fast first token, slow subsequent tokens | Decode execution may be limiting | Inter-token latency, output length, memory behavior |
| Performance degrades with longer prompts | Input processing or context-related costs may dominate | Prompt length, prefill time, memory consumption |
| Performance degrades as outputs grow | Additional decode steps or growing context costs may dominate | Output length, generation time, KV-cache behavior |
| Performance degrades with more active sequences | Shared-resource or memory pressure may be increasing | Concurrency, peak memory, latency and throughput together |

These relationships guide investigation; they do not prove a particular bottleneck. Measurements should determine whether the hypothesis is correct.

## 4. Understanding Inference Performance Metrics

Latency, time to first token, inter-token latency, throughput, and memory consumption describe different properties of inference.

They should not be treated as interchangeable.

### 4.1 End-to-end latency

End-to-end latency is the elapsed time from the defined start of a request to its completion.

Depending on the measurement boundary, it may include:

- Request transmission.
- Tokenization.
- Waiting or queueing.
- Model prefill.
- Output generation.
- Post-processing.
- Response transmission.

A benchmark measuring only model execution is not directly equivalent to a measurement covering the complete application request.

Always define what the latency measurement includes.

### 4.2 Time to first token

Time to first token (TTFT) measures the elapsed time from the defined request start until the first generated token becomes available.

TTFT is especially relevant to interactive applications because it influences how long users wait before seeing the beginning of a response.

It can be affected by input length, prefill computation, request setup, queueing, and the measurement boundary.

A low TTFT does not guarantee that the complete response will finish quickly.

### 4.3 Inter-token latency

Inter-token latency measures the time between successive generated tokens.

Implementations and evaluation tools may report different aggregations, such as average time between tokens or other defined intervals.

For streaming applications, inter-token latency influences how quickly a response appears after generation begins.

Observed values can vary during a generation because the context grows and runtime conditions change.

### 4.4 Average time per output token

If a defined generation interval takes \(T\) seconds to produce \(N\) output tokens, the average time per output token is:

\[
t_{\text{token}}=\frac{T}{N}
\]

The interpretation depends on how \(T\) and \(N\) are defined.

If the interval includes the initial prefill delay, this metric combines initial latency and generation time. If it measures only the decode interval, it more closely characterizes the average time spent producing tokens after generation begins.

State the measurement boundary when reporting this value.

### 4.5 Throughput

Throughput measures the amount of work completed per unit of time.

Common inference measures include:

- Output tokens per second.
- Requests completed per second.
- Total tokens processed per second, with input and output token counts explicitly defined.

Throughput can be measured for one request or across multiple concurrent requests. These measurements answer different questions.

Single-request throughput helps characterize an individual execution path. Aggregate throughput helps characterize how much work the system completes under a specified workload.

A system can achieve high aggregate throughput while individual requests experience longer latency.

### 4.6 Metric comparison

| Metric | Main question | Important qualification |
|---|---|---|
| End-to-end latency | How long does the complete request take? | Depends on the measurement boundary and workload. |
| TTFT | How long until the first output token? | Includes whatever request-startup and prefill work falls inside the measurement boundary. |
| Inter-token latency | How frequently do generated tokens arrive? | Depends on the interval and aggregation used. |
| Output tokens per second | How quickly are output tokens generated? | Specify whether it is per-request or aggregate throughput. |
| Requests per second | How many requests complete per unit of time? | Depends on request sizes, concurrency, and completion criteria. |
| Memory consumption | How much execution memory is required? | Includes more than model weights. |

A performance report should define each metric and state the workload under which it was measured.

## 5. Input Length, Output Length, and Attention Costs

Sequence length is one of the most important variables affecting transformer inference.

The input sequence determines how much context the model initially processes. Generated tokens extend that context over successive decode steps.

Input and output lengths affect computation and memory differently.

### 5.1 Input length and attention computation

Let \(S_{\text{in}}\) denote the input sequence length in tokens.

For standard full self-attention, attention computation during prefill contains a quadratic component in sequence length:

\[
C_{\text{attention,prefill}}\propto S_{\text{in}}^2
\]

This describes the scaling of the attention component under the standard full-attention assumption. It is not a formula for total model latency.

The complete computation also includes other operations, and implementation techniques can change memory behavior and practical performance.

Under this simplified model, doubling input length increases the pairwise attention work by approximately four times. It does not follow that measured end-to-end latency will always increase fourfold, because other operations, fixed costs, and implementation details also contribute.

The engineering implication is that longer prompts can become disproportionately expensive for attention-related computation.

### 5.2 Output length and decode work

Let \(S_{\text{out}}\) denote the number of generated output tokens.

A simplified representation of total decode work is:

\[
C_{\text{decode}}\approx
\sum_{t=1}^{S_{\text{out}}} C_t
\]

where \(C_t\) is the computation required for the \(t\)-th generated token.

The cost of each step need not remain constant. As generation progresses, the context grows and attention-related work and cached-state access may increase.

Output length therefore affects both the number of decode steps and the work associated with the growing context.

### 5.3 Total sequence length

If the prompt contains \(S_{\text{in}}\) tokens and the model generates \(S_{\text{out}}\) tokens, the final sequence length is approximately:

\[
S_{\text{final}}=S_{\text{in}}+S_{\text{out}}
\]

This relationship assumes no additional context transformations and describes token count rather than a guarantee about runtime storage layout.

A request with both a long prompt and a long response can incur substantial cumulative computation and cached-state requirements.

### 5.4 Workload shape matters

Consider two requests:

- Request A: 6,000 input tokens and 100 output tokens.
- Request B: 500 input tokens and 1,000 output tokens.

Request A has a much longer prompt and may incur substantial prefill work and initial latency. Request B requires many more sequential decode steps.

Token counts alone cannot determine which request will finish first. The answer depends on the model, hardware, implementation, and relative costs of prefill and decode.

Inference experiments should therefore vary input and output lengths independently rather than relying on one representative prompt.

## 6. KV Cache and Memory Growth

The key-value (KV) cache stores attention-related representations from previously processed tokens so that subsequent generation steps can reuse them.

The cache avoids repeatedly recomputing the cached portions of attention state, but retaining that state consumes memory.

This section focuses on the resource model and its implications rather than re-teaching the internal mechanics of attention caching.

### 6.1 Factors affecting KV-cache memory

KV-cache memory depends on:

- Number of transformer layers.
- Number of key-value heads.
- Head dimension.
- Numerical representation of cached values.
- Number of tokens retained in the cache.
- Number of active sequences.
- Architecture-specific cache organization.

For a conventional transformer cache, a simplified estimate is:

\[
M_{\text{KV}}\approx
2 \times B \times N_{\text{layers}}
\times H_{\text{KV}}\times D_{\text{head}}
\times S_{\text{cache}}\times b
\]

where:

- \(B\) is the number of sequences represented by the estimate.
- \(N_{\text{layers}}\) is the number of transformer layers.
- \(H_{\text{KV}}\) is the number of key-value heads per layer.
- \(D_{\text{head}}\) is the dimension of each key-value head.
- \(S_{\text{cache}}\) is the number of cached token positions per sequence.
- \(b\) is the number of bytes per cached element.
- The factor of 2 accounts for keys and values.

The estimate assumes a conventional cache layout, uniform dimensions, and a uniform representation. It excludes allocation overhead, padding, metadata, and implementation-specific details.

Actual memory use can differ when sequence lengths vary, allocations are padded, or the architecture or runtime uses a different cache organization.

### 6.2 Numerical example

Consider an illustrative transformer with:

- 32 layers.
- 8 key-value heads per layer.
- A head dimension of 128.
- 4,096 cached tokens.
- 2 bytes per cached element.

For one sequence:

\[
\begin{aligned}
M_{\text{KV}}
&\approx 2 \times 1 \times 32 \times 8\\
&\quad\times 128 \times 4096 \times 2\\
&=536{,}870{,}912 \text{ bytes}
\end{aligned}
\]

This is approximately 537 MB in decimal units, or 512 MiB.

For four sequences with the same cached length and layout, the simplified estimate is approximately four times as large.

This is an illustrative calculation, not a prediction for a particular commercial model. Architectures using different attention arrangements or cache representations can have substantially different requirements.

### 6.3 KV cache and concurrency

Each active sequence may require its own cached state. Increasing the number of simultaneously active sequences can therefore increase KV-cache memory even when model-weight memory remains unchanged.

This creates an important resource interaction:

- Model weights consume a relatively persistent portion of memory.
- KV-cache memory grows with retained sequence state.
- Temporary computation buffers and other allocations also consume memory.

A configuration that fits one long-running request may not fit several simultaneous requests of comparable length.

Model-weight size alone is therefore insufficient for estimating how many requests an execution environment can support.

### 6.4 KV cache and context constraints

Longer contexts increase the amount of state retained by a conventional KV cache.

A system may encounter memory constraints even when the model's weights fit comfortably within device memory.

Possible engineering responses include:

- Evaluating a smaller or more memory-efficient model representation.
- Reducing unnecessary context.
- Choosing a suitable supported cache configuration.
- Constraining the workload's concurrency.

Each option changes a different part of the problem. Reducing context may affect answer quality; changing representation can affect numerical behavior; reducing concurrency can affect aggregate throughput.

The appropriate choice depends on the application's requirements.

Detailed cache-management algorithms and serving-level memory scheduling belong to Production AI Engineering.

## 7. Compute-Bound and Memory-Bound Inference

A workload is often described as compute-bound or memory-bound according to the resource that most strongly limits execution under the current conditions.

These are useful diagnostic models, but a workload can shift between bottlenecks during a request.

### 7.1 Compute-bound behavior

A workload is compute-bound when arithmetic processing capacity is the dominant limitation.

Potential contributing factors include:

- Large matrix operations.
- Substantial computational requirements.
- Operations that efficiently use available compute resources.
- Arithmetic demand that exceeds the system's processing capacity.

When compute is the primary bottleneck, reducing computational work or using a more efficient supported numerical representation may improve performance.

However, a lower operation count does not guarantee faster execution. The implementation must still use the hardware effectively.

### 7.2 Memory-bound behavior

A workload is memory-bound when moving data between memory and processing units is the dominant limitation.

Language-model inference repeatedly accesses model parameters. Decode can be sensitive to parameter movement because the model is invoked repeatedly to generate successive tokens.

KV-cache reads and writes also contribute to memory traffic, particularly as the context grows.

Potential responses depend on the actual source of memory pressure. Reducing weight storage, improving data reuse, reducing retained context, or changing the workload may help in different circumstances.

Quantization can reduce the amount of weight data transferred when the execution path can use the compressed representation effectively. Chapter 05 covers the representation-level trade-offs.

### 7.3 Why the distinction matters

If a model is slow because it repeatedly moves a large amount of parameter data, reducing arithmetic operations alone may not solve the dominant problem.

Conversely, if a particular prefill workload is limited by attention computation, reducing weight storage without changing the relevant computational work may have limited impact on that bottleneck.

The engineer must identify the dominant constraint before selecting an optimization.

### 7.4 Bottlenecks can change

The limiting resource can vary with:

- Input and output lengths.
- Number of active sequences.
- Numerical representation.
- Hardware.
- Runtime implementation.

A statement that a model is compute-bound or memory-bound should therefore be tied to a specific workload and execution configuration, not treated as a permanent property of the model.

## 8. Batch Size, Concurrency, and Workload Trade-offs

Batching and concurrency influence how the execution system shares computation and memory across requests.

They matter because the configuration that minimizes latency for one request may not maximize the amount of work completed across multiple requests.

This chapter covers their general resource implications. Advanced batching policies and serving schedulers are outside scope.

### 8.1 Single-request execution

Single-request execution helps establish a baseline for:

- TTFT.
- Decode behavior.
- Memory consumption.
- Sensitivity to input and output length.

However, isolated execution does not reveal how the model behaves when several requests compete for the same resources. It should not be treated as a complete estimate of production capacity.

### 8.2 Batched execution

Batching allows multiple inputs or active sequences to share model operations where the implementation supports it.

By sharing computation, batching may improve aggregate hardware utilization and throughput.

However, the effects depend on the phase and implementation. Requests may have different sequence lengths, and the execution system must accommodate their associated computation and state.

Batching can increase memory requirements and may affect individual-request latency. Greater batch size is not universally better.

### 8.3 Concurrency

Concurrency describes the number of requests or sequences processed or kept active at the same time.

Increasing concurrency can improve aggregate throughput when it helps the system use otherwise underutilized resources.

It can also increase:

- KV-cache memory.
- Temporary memory requirements.
- Competition for compute resources.
- Competition for memory bandwidth.
- Variability in individual-request latency.

When memory becomes the limiting resource, increasing concurrency may exceed the available budget or require a change in execution behavior.

The relationship between concurrency and throughput is not unlimited or necessarily linear.

### 8.4 Latency versus throughput

Consider two configurations.

Configuration A completes one request quickly but processes requests mostly one at a time.

Configuration B processes several requests together and completes more requests per second, but each request may experience additional waiting or take longer to finish.

Configuration B can have better aggregate throughput while having worse individual-request latency.

Neither configuration is automatically superior. An interactive application may prioritize responsiveness, while a background-processing workload may prioritize aggregate throughput.

### 8.5 Workload priorities

| Workload priority | Important measurements | Potential trade-off |
|---|---|---|
| Interactive response | TTFT, inter-token latency, end-to-end latency | May sacrifice aggregate throughput to improve responsiveness. |
| High-volume generation | Aggregate output tokens per second, requests per second | May increase individual-request latency or memory use. |
| Long-context analysis | Prefill latency, context-dependent memory, total request latency | Long prompts can increase attention computation and cache requirements. |
| Long-form generation | Decode latency, output tokens per second, total generation time | More output tokens require additional sequential generation steps. |
| Memory-constrained execution | Peak memory, KV-cache growth, supported workload size | Reducing memory use may constrain quality, context, or concurrency. |

These are workload priorities, not universal configuration prescriptions.

## 9. Model Representation and Inference Performance

Chapter 05 covered quantization, pruning, and distillation as ways to reduce model representation or capacity requirements. Their effects on inference depend on the execution path.

### 9.1 Weight storage and memory movement

Reducing the number of bytes used for model weights reduces raw weight-storage requirements.

When the runtime can use the representation efficiently, it may also reduce the amount of parameter data that must move through the memory hierarchy during execution.

This can be particularly relevant when repeated model-weight access is a significant part of the workload's cost.

However, compressed representations may introduce conversion work or depend on specialized operations. Actual performance must be measured on the target execution path.

### 9.2 Model capacity and computation

A smaller model often has fewer parameters and may require less computation per token, depending on its architecture.

Parameter count alone does not fully determine performance. Hidden dimensions, layer count, attention arrangement, supported operations, and implementation efficiency also contribute.

A smaller model that lacks required task capabilities is not an acceptable optimization merely because it generates tokens faster.

Quality requirements remain constraints on every performance decision.

### 9.3 Representation does not eliminate sequence-length costs

Reducing weight precision does not eliminate the need to process the prompt or generate the requested output.

Likewise, a smaller model still needs to maintain whatever context state its architecture and execution configuration require.

Representation efficiency can change the cost of computation and storage, but input length, output length, and retained context remain important workload variables.

### 9.4 Treat performance benefits as hypotheses

When evaluating a compressed or smaller model, separate three questions:

1. Did the candidate reduce the intended resource requirement?
2. Did that reduction improve the relevant inference metric?
3. Did the candidate preserve the required task behavior?

A positive result for one question does not establish a positive result for the others.

For example, lower artifact size demonstrates a storage benefit. It does not by itself establish lower end-to-end latency or higher throughput.

## 10. A Controlled Inference-Performance Investigation

Performance optimization should begin with a defined workload and a measurable problem. Without a controlled baseline, it is easy to attribute an observed improvement to the wrong variable.

### Step 1 — Define the workload

Specify the request characteristics that matter.

Record, where relevant:

- Model and representation.
- Input token count.
- Expected output token count or stopping criteria.
- Generation configuration.
- Number of concurrent requests.
- Hardware and execution environment.
- Whether measurements include tokenization, network transfer, and other request-level work.

The workload should represent the intended use case or explicitly state which aspects it simplifies.

### Step 2 — Establish a baseline

Measure the current configuration under the defined workload.

Capture the metrics relevant to the problem, such as:

- End-to-end latency.
- TTFT.
- Inter-token latency.
- Output tokens per second.
- Peak memory consumption.

Not every investigation requires every metric. Choose measurements that help explain the observed limitation.

### Step 3 — Form a bottleneck hypothesis

Use the workload and measurements to identify the likely limiting factor.

Examples:

- Long prompts and high TTFT suggest investigating prefill and request-startup costs.
- Slow token emission suggests investigating decode execution and its memory or compute behavior.
- Memory growth with longer contexts suggests investigating KV-cache requirements.
- High aggregate throughput accompanied by poor individual-request latency suggests investigating concurrency and resource sharing.

These are hypotheses. Measurements should be used to test them.

### Step 4 — Change one primary variable

Examples include:

- Input length.
- Output length.
- Model representation.
- Model choice.
- Number of concurrent requests.
- A supported batch configuration.

Changing one primary variable at a time makes it easier to interpret results. Keep other conditions stable where possible; document conditions that cannot remain stable.

### Step 5 — Repeat measurements

Inference latency and throughput can vary because of warm-up, system state, runtime behavior, and measurement noise.

Repeat runs sufficiently to distinguish a consistent effect from a one-off observation.

Use consistent measurement boundaries and comparable workload conditions.

Formal benchmarking and statistical interpretation belong to LLM-08. The requirement here is to make the performance investigation controlled and interpretable.

### Step 6 — Interpret the result

For each candidate, record:

- The change made.
- The intended bottleneck.
- The metrics that improved or regressed.
- The memory consequences.
- Any quality or compatibility concerns.
- The remaining uncertainty.

Accept a change when the evidence supports the intended benefit and the candidate remains within the application's requirements.

Reject or revise it when the intended benefit is absent, the trade-off is unacceptable, or the results cannot support the conclusion.

A negative result is useful when it rules out a hypothesis or identifies a different limiting factor.

## 11. Common Performance-Diagnosis Mistakes

### 11.1 Assuming model size determines latency

**Why it is incorrect:** Model size influences resource requirements, but latency also depends on sequence lengths, hardware, runtime implementation, and workload characteristics.

**Better approach:** Measure the relevant latency metrics under the intended workload.

### 11.2 Treating prefill and decode as equivalent

**Why it is incorrect:** They perform different work and can stress different resources.

**Better approach:** Investigate the phase that contributes to the observed delay.

### 11.3 Optimizing TTFT when decode is the actual problem

**Why it is incorrect:** A faster initial response does not guarantee faster subsequent token generation.

**Better approach:** Measure TTFT and token-generation behavior separately when both matter.

### 11.4 Ignoring output length

**Why it is incorrect:** Longer outputs require more sequential generation steps and extend the effective context.

**Better approach:** Record output length and compare workloads with similar generation requirements.

### 11.5 Estimating total memory from parameter storage alone

**Why it is incorrect:** Execution also requires intermediate state, KV cache, temporary buffers, and other allocations.

**Better approach:** Measure memory under realistic context lengths and concurrency.

### 11.6 Assuming more concurrency always increases throughput

**Why it is incorrect:** Additional requests can increase cache memory, resource competition, and latency. Throughput may eventually stop improving or decline.

**Better approach:** Compare throughput, latency, and memory across a controlled range of workloads.

### 11.7 Assuming lower precision guarantees better performance

**Why it is incorrect:** Numerical representation affects storage and potentially memory movement, but runtime compatibility and execution efficiency determine the realized benefit.

**Better approach:** Measure the compressed representation in the actual execution environment.

### 11.8 Changing several variables at once

**Why it is incorrect:** If latency changes after simultaneously changing the model, context length, and concurrency, the contribution of each change is unclear.

**Better approach:** Change one primary variable at a time, or design a controlled experiment that explicitly accounts for multiple variables.

## 12. Engineering Decision Checklist

Before recommending an inference-performance change, verify the following.

### Workload definition

- Is the model and representation identified?
- Are input and output token counts defined or measured?
- Is the concurrency level recorded?
- Is the measurement boundary explicit?
- Does the workload represent the application's actual priority?

### Performance diagnosis

- Are latency and throughput being distinguished?
- Is TTFT measured separately when initial responsiveness matters?
- Is prefill distinguished from decode?
- Has context-dependent memory been considered?
- Is the bottleneck a measured finding or only a hypothesis?

### Resource reasoning

- Are weight memory and total execution memory distinguished?
- Has KV-cache growth been considered?
- Could the proposed change increase memory elsewhere?
- Does the execution path support the selected representation?
- Are model quality and compatibility still within requirements?

### Experimental discipline

- Is there a baseline?
- Is the primary variable being changed identified?
- Are comparable conditions maintained?
- Are measurements repeated when variability matters?
- Are improvements and regressions recorded together?
- Does the evidence support the conclusion?

A performance recommendation should explain both why the change is expected to help and what evidence would demonstrate that it actually helped.

## 13. Knowledge Check

Answer these questions before proceeding.

1. A model takes a long time to produce its first token but generates subsequent tokens quickly. Explain which stages and external factors you would investigate before recommending an optimization.

2. A model has acceptable TTFT but generates tokens slowly. Explain why improving prefill alone may not solve the observed problem.

3. Two requests use the same model. One has a long prompt and short output; the other has a short prompt and long output. Explain why their latency and memory behavior can differ.

4. A model's weights occupy 12 GiB, but peak execution memory reaches 20 GiB for a long-context request. Identify the additional resource requirements you would investigate.

5. A model fits into memory for one active sequence but exceeds the memory budget when four long-context sequences are active. Explain the role of KV-cache memory and why weight storage alone cannot explain this behavior.

6. A compressed model uses substantially less memory but shows almost no improvement in token-generation speed. Give plausible explanations and describe what measurements would help distinguish them.

7. Increasing concurrency improves aggregate throughput but increases individual-request latency. Explain why both observations can be true and how you would decide whether the change is acceptable.

8. You are asked to optimize a model because it is “too slow.” Before changing any code or configuration, identify the minimum workload information and measurements you would request.

Strong answers should identify the relevant phase, metric, resource constraint, and assumptions. Avoid proposing an optimization before explaining the likely cause of the observed problem.

## 14. Chapter Summary

Inference performance emerges from the interaction between model computation, sequence lengths, memory movement, cached state, hardware, and workload characteristics.

The central concepts are:

- **Prefill:** Processes the input sequence and establishes state for generation.
- **Decode:** Generates output tokens sequentially using the current context.
- **TTFT:** Measures how long it takes for the first output token to become available.
- **Inter-token latency:** Describes the timing between generated tokens.
- **Throughput:** Measures completed work per unit of time and must be interpreted using its workload definition.
- **Sequence length:** Influences attention-related computation, decode behavior, and cached-state requirements.
- **KV cache:** Reuses attention-related state to avoid recomputing cached portions of the context, at the cost of additional memory.
- **Compute and memory bottlenecks:** Describe different resource limitations that require different diagnostic approaches.
- **Concurrency and batching:** Can improve aggregate resource utilization while increasing memory requirements or individual-request latency.
- **Controlled investigation:** Connects a measured problem to a hypothesis, a targeted change, and interpretable evidence.

The key engineering principles are:

1. Define the workload before interpreting performance.
2. Distinguish prefill from decode.
3. Separate initial latency, token-generation behavior, aggregate throughput, and memory usage.
4. Account for input length, output length, and KV-cache growth.
5. Diagnose the limiting resource before selecting an optimization.
6. Treat compression-related speed improvements as hypotheses to verify.
7. Evaluate resource benefits together with quality and compatibility constraints.
8. Record enough experimental detail to explain why a change succeeded or failed.

The next chapter turns these concepts into a decision framework for comparing optimization approaches and deciding when an optimization is justified.

## 15. Transition to the Next Chapter

Proceed to:

[07 — Optimization Trade-offs and Engineering Decision Framework](07-Optimization-Trade-offs-and-Engineering-Decision-Framework.md)

The next chapter will synthesize adaptation, compression, and inference-performance concepts into a structured engineering decision process. It should reference the mechanisms already explained in Chapters 02–06 rather than re-teaching them, and prepare the reader for the controlled adaptation experiment in Chapter 08.
