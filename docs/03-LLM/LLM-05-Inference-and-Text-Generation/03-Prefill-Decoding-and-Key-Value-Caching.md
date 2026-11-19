# Prefill, Decoding, and Key-Value Caching

## 1. Learning Objectives

After completing this chapter, you should be able to:

- Distinguish prefill from autoregressive decoding.
- Explain why naïve generation can repeatedly process an expanding input sequence.
- Describe how a key-value (KV) cache reuses previously computed attention state.
- Trace cache growth across successive generation steps.
- Estimate KV-cache memory requirements using a simplified formula.
- Explain the relationship between caching, computation, memory usage, and generation latency.
- Identify common KV-cache misconceptions and correctness issues.

## 2. Prerequisites

This chapter builds on:

- The inference execution lifecycle.
- Autoregressive next-token generation.
- The distinction between token IDs, hidden representations, logits, probabilities, and decoded text.
- The basic role of attention in processing a sequence.

Detailed Transformer architecture is outside this chapter's scope. The goal is to understand the inference mechanism, not rederive attention or optimize its implementation.

## 3. Estimated Reading Time

8–11 minutes.

## 4. Before We Start

Autoregressive generation produces a sequence one token at a time. Each new token depends on the preceding context.

For example, suppose the prompt is:

> Explain how a database index works.

The model processes the prompt and produces a next-token distribution. After a token is selected, that token becomes part of the context for the next generation step.

The logical sequence grows:

```text
Prompt
  ↓
Select token 1
  ↓
Prompt + token 1
  ↓
Select token 2
  ↓
Prompt + token 1 + token 2
  ↓
Select token 3
  ↓
...
```

This creates an engineering question: **Must the model recompute everything about the preceding sequence every time it generates another token?**

KV caching addresses much of the repeated attention-state computation in conventional autoregressive Transformer inference.

## 5. Why Prefill and Decoding Are Different

Inference is commonly described using two phases: **prefill** and **decoding**.

### 5.1 Prefill

Prefill processes the initial prompt.

For a prompt containing \(P\) tokens, the model performs the forward computation needed to process those positions. In a conventional autoregressive Transformer implementation, this includes computing the key and value tensors required for attention at each relevant layer.

The final relevant position produces the logits used to select the first generated token.

Prefill can process the prompt's positions together rather than generating each prompt token sequentially. The attention computation must still respect the model's causal constraints.

### 5.2 Decoding

Decoding generates subsequent tokens incrementally.

After selecting a token, the runtime typically processes that new token to obtain the next-token distribution. With a KV cache, it reuses the keys and values retained from earlier positions instead of recomputing those states for the entire prefix.

The distinction is:

| Phase | Main responsibility | Typical KV-cache behavior |
|---|---|---|
| Prefill | Process the initial prompt | Build cache entries for prompt positions |
| Decoding | Generate subsequent tokens | Reuse existing entries and add entries for new tokens |

These are conceptual phases, not immutable implementation boundaries. Systems may use chunked prefill or other execution strategies that alter how prompt processing is scheduled.

## 6. The Repeated-Computation Problem

Consider a prompt with \(P\) tokens and a generation that produces \(G\) tokens.

A naïve implementation could repeatedly run the model over the entire current prefix:

```text
Call 1: P tokens
Call 2: P + 1 tokens
Call 3: P + 2 tokens
...
Call G: P + G - 1 tokens
```

The total number of token positions processed across these calls is:

\[
GP+\frac{G(G-1)}{2}
\]

This is a count of token positions across repeated calls, **not** a general formula for total FLOPs or wall-clock latency. Actual cost depends on attention operations, model dimensions, hardware, batching, and runtime implementation.

The important observation is that earlier positions appear in multiple calls. Their attention keys and values may be recomputed even though the preceding tokens have not changed.

For a standard causal Transformer, the keys and values for an earlier position do not need to be recalculated simply because a later token was appended. The earlier position cannot attend to future tokens, so its previously computed attention state remains reusable under the same model inputs and execution conditions.

This motivates caching.

## 7. What Is a Key-Value Cache?

A KV cache stores attention keys and values computed for previously processed tokens so that later decoding steps can reuse them.

At a high level, attention uses three kinds of representations:

- **Query:** Used to determine what information a position seeks from other positions.
- **Key:** Used to determine how positions are matched during attention.
- **Value:** Carries the information combined according to the attention weights.

For a new token, the model computes the new position's required query, key, and value representations. Its query can attend to the available keys, and the resulting attention computation uses the corresponding values.

The keys and values from earlier positions can be reused, so the runtime does not have to recompute them for every decoding step.

### 7.1 What the Cache Does Not Store

A KV cache is not:

- The complete model parameter set.
- The generated text itself.
- A replacement for the model's hidden representations throughout the entire network.
- A general-purpose long-term memory.
- A cache of every possible next-token probability.

It stores specific intermediate attention state needed for subsequent inference.

### 7.2 Why Both Keys and Values Matter

The keys participate in calculating attention weights. The values provide the information aggregated using those weights.

Caching only keys or only values would not provide the full reusable attention state required by the usual attention computation.

## 8. How KV Caching Works Across Generation Steps

Consider a prompt with three tokens: `A`, `B`, and `C`.

### Step 1: Prefill

The model processes all three prompt tokens. For each relevant layer, the runtime computes and stores the corresponding key and value entries.

```text
Input: A B C

KV cache:
[A] [B] [C]
```

The model produces logits at the final relevant position, and the decoding strategy selects token `D`.

### Step 2: Generate the next token

The runtime processes `D` using the existing cache.

```text
New input: D

Existing cache:
[A] [B] [C]

New entries:
[D]

Cache after processing D:
[A] [B] [C] [D]
```

The model can use the query for `D` to attend to the cached keys, including the key for `D` where appropriate, and combine the corresponding values.

The resulting logits determine the next token, `E`.

### Step 3: Continue decoding

The same process repeats:

```text
Before processing E:
[A] [B] [C] [D]

After processing E:
[A] [B] [C] [D] [E]
```

The cache grows as new positions are processed. Existing entries are reused; new entries are added.

This example represents the conventional single-sequence, autoregressive case. Actual implementations can use different layouts, memory-management techniques, or execution schedules without changing the fundamental reuse principle.

## 9. What Changes When Caching Is Disabled?

Without a KV cache, a straightforward implementation may repeatedly process the full current prefix. With caching, it can process the newly appended token while reusing prior keys and values.

| Aspect | Repeated full-prefix computation | KV-cached decoding |
|---|---|---|
| Earlier key/value computation | May be repeated | Reused |
| Input processed during each decoding call | Entire current prefix | Usually the new token |
| Attention to prior context | Recomputed from the prefix | Uses cached keys and values |
| Intermediate memory requirement | May be lower for retained KV state | Requires memory for cached state |
| Computation reuse | Limited | Substantial for prior attention state |

The table describes common implementations rather than a universal runtime guarantee.

### 9.1 Correctness and Output Differences

KV caching is intended to preserve the model's logical computation for the same context. It should not be interpreted as a different token-selection strategy.

However, cached and uncached executions are not guaranteed to produce bit-for-bit identical intermediate values or outputs across every runtime. Differences can arise from numerical precision, kernel implementations, execution order, or implementation bugs.

When unexpected output differences occur, engineers should investigate whether the cache is being updated and associated with the correct sequence, position, model, and request state. They should also check whether the comparison uses equivalent numerical and execution settings.

A correctness investigation should distinguish expected numerical variation from stale entries, incorrect positions, cross-request state leakage, or other cache-management defects.

## 10. The Memory–Computation Trade-off

KV caching reduces repeated computation, but the retained state consumes memory.

A simplified estimate of KV-cache memory is:

\[
M_{\mathrm{KV}}
\approx
B \times L \times T \times H_{\mathrm{KV}}
\times D_{\mathrm{head}} \times 2 \times S
\]

Where:

- \(B\): number of sequences represented in the cache.
- \(L\): number of Transformer layers.
- \(T\): number of cached token positions.
- \(H_{\mathrm{KV}}\): number of key/value heads per layer.
- \(D_{\mathrm{head}}\): dimension of each head.
- \(2\): accounts for both keys and values.
- \(S\): bytes per stored element.

This is a simplified footprint estimate. It assumes the listed dimensions apply uniformly and does not account for padding, allocation overhead, metadata, fragmentation, or implementation-specific compression and sharing.

The number of KV heads matters. Architectures using multi-query attention or grouped-query attention can use fewer KV heads than query heads, reducing the size of cached key and value state compared with an otherwise comparable multi-head configuration.

### Illustrative calculation

Assume:

- \(B=1\)
- \(L=32\)
- \(T=2048\)
- \(H_{\mathrm{KV}}=8\)
- \(D_{\mathrm{head}}=128\)
- \(S=2\) bytes

Then:

\[
\begin{aligned}
M_{\mathrm{KV}}
&\approx 1 \times 32 \times 2048 \times 8\\
&\quad\times 128 \times 2 \times 2\\
&= 268{,}435{,}456\text{ bytes}
\end{aligned}
\]

That is approximately 256 MiB using binary units.

This value is illustrative, not a measured model result. It represents only the estimated KV-cache footprint under the stated assumptions, not total inference memory.

**Engineering implication:** Longer contexts and more concurrent sequences increase cache demand. KV caching trades additional retained memory for reduced repeated attention-state computation.

Detailed cache layouts, memory allocation strategies, batching policies, and serving optimization belong in production inference engineering.

## 11. Prefill, Time to First Token, and Decoding Speed

The two phases affect user-perceived latency differently.

### 11.1 Time to First Token

Time to first token (TTFT) measures the time from the relevant request start point until the first output token becomes available.

Prompt processing is a major contributor because the model must process the input before selecting the first generated token. Other request handling and scheduling costs may also contribute.

A long prompt can therefore increase TTFT even when the generated response is short.

### 11.2 Inter-Token Latency

Inter-token latency describes the time between successive generated tokens. It is influenced by the repeated decoding steps required to produce a response.

KV caching can reduce redundant work during these steps, but it does not make token generation free. Each next-token decision still requires model computation.

Actual latency depends on factors such as model size, sequence length, hardware, scheduling, and runtime behavior.

Do not assume that enabling a KV cache guarantees a particular latency improvement. The benefit depends on the workload and implementation.

## 12. Common Misconceptions and Failure Modes

### Misconception 1: The KV cache stores the model's memory

**Correction:** It stores reusable attention keys and values for processed positions. It is not a general-purpose memory store.

### Misconception 2: Caching eliminates attention computation

**Correction:** New tokens still require attention computation. Caching avoids recomputing the earlier keys and values, but the new token must still interact with the available context.

### Misconception 3: The cache stays the same size

**Correction:** In ordinary autoregressive generation, cached state grows as new positions are added, subject to the model's context limits and runtime's cache-management behavior.

### Misconception 4: More caching always means faster inference

**Correction:** Caching usually reduces redundant computation but increases memory use. Under memory pressure, the overall system may still be constrained by capacity, bandwidth, or scheduling.

### Misconception 5: Cached and uncached output must always be identical bit for bit

**Correction:** They are intended to implement equivalent logical computation, but numerical differences can occur. Unexpected discrepancies require investigation rather than automatic acceptance or rejection.

### Misconception 6: Prefill and decoding are completely separate model architectures

**Correction:** They are phases of inference execution. Both use the same model's learned parameters, though the runtime can execute them differently.

## 13. Interview Questions with Expected Answers

### Q1. What is the difference between prefill and decoding?

Prefill processes the initial prompt and establishes the state needed for generation. Decoding incrementally produces subsequent tokens, typically reusing the cached key/value state from earlier positions.

### Q2. Why is a KV cache useful?

It avoids repeatedly computing key and value representations for previously processed positions during autoregressive decoding, reducing redundant computation.

### Q3. Why does the KV cache grow during generation?

Each newly processed token contributes new key and value entries for the relevant layers. Those entries are retained so future tokens can attend to the accumulated context.

### Q4. Does a KV cache store generated tokens?

Not as its primary purpose. It stores intermediate attention state associated with processed tokens. Token IDs and decoded text are separate representations.

### Q5. What is the primary trade-off of KV caching?

It exchanges additional memory consumption for reduced repeated computation. The cache's footprint grows with sequence length and the dimensions of the model's key/value state.

### Q6. Why can a long prompt increase time to first token?

The model must process the prompt before producing the first generated token. The cost of this processing is a major contributor to TTFT.

### Q7. Does KV caching remove the cost of attending to prior context?

No. It reuses earlier keys and values, but the new token still needs to compute attention against the available context.

### Q8. What should you investigate if cached and uncached runs differ unexpectedly?

First verify that the runs use equivalent model inputs and execution settings. Then inspect cache updates, sequence and position association, numerical precision, and possible stale or incorrectly shared state.

## 14. Quick Revision

- **Prefill:** Processes the initial prompt.
- **Decoding:** Generates subsequent tokens incrementally.
- **KV cache:** Retains previously computed attention keys and values for reuse.
- **Main benefit:** Avoids redundant computation of earlier key/value state.
- **Main cost:** Additional memory that generally grows with cached sequence length.
- **TTFT:** Includes prompt processing and other work before the first output token.
- **Inter-token latency:** Reflects the time between generated tokens.
- **Correctness:** Caching should preserve logical behavior, but bitwise identity is not universally guaranteed.

## 15. Key Takeaways

1. Autoregressive generation has distinct prompt-processing and incremental-decoding phases.
2. Recomputing the full prefix at every step can repeat work for positions that have not changed.
3. A KV cache retains attention keys and values so later decoding steps can reuse them.
4. Cache memory grows with the number of cached positions and the dimensions of the key/value state.
5. Caching reduces redundant computation but does not eliminate the computation required for each new token.
6. Engineers should reason about correctness, memory consumption, and latency separately.

## 16. Further Reading

Consult the original documentation and papers relevant to the model architecture and inference runtime you use. Focus on the explanations of autoregressive inference, attention key/value state, and the memory implications of retained context.

For this chapter, further reading should deepen the KV-cache mental model without expanding into detailed serving optimization, GPU kernel design, or production benchmarking.
