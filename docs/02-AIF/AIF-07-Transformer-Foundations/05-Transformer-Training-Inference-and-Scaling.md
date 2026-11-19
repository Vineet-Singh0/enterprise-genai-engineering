# 05 — Transformer Training, Inference, and Scaling

## 1. Purpose

The previous chapters established how attention works, how positional information supports sequence processing, how Transformer blocks transform representations, and how encoder-decoder and decoder-only architectures organize information flow.

This chapter connects those architectural foundations to the lifecycle of a Transformer model:

- **Training:** learning parameters from data through a training objective and optimization.
- **Inference:** using trained parameters to produce predictions or generate sequences.
- **Scaling:** understanding how sequence length, model size, computation, memory, and workload affect system behavior.

The distinction matters because a model that trains successfully is not automatically efficient at inference, and a model that performs well on short sequences may become expensive or impractical at longer context lengths.

The goal is to develop the engineering reasoning needed to understand Transformer behavior beyond the architecture diagram.

## 2. Learning Objectives

After completing this chapter, you should be able to:

- Explain the relationship between training objectives, loss functions, and learned Transformer parameters.
- Describe how causal language-model training works.
- Distinguish teacher-forced training from autoregressive generation.
- Explain why training can process multiple sequence positions in parallel while generation is sequential across new tokens.
- Describe the inference lifecycle of a decoder-only Transformer.
- Explain the purpose and trade-offs of key-value caching.
- Analyze how sequence length affects attention computation and memory.
- Distinguish model scaling from sequence-length scaling.
- Identify major training and inference bottlenecks.
- Explain why scaling model size does not guarantee proportional improvements in quality.
- Develop a measurement-driven approach to Transformer performance evaluation.

## 3. Prerequisites and Connections

This chapter builds on:

- **AIF-03 — Machine Learning Foundations:** training objectives, loss functions, generalization, and evaluation.
- **AIF-04 — Deep Learning Foundations:** forward propagation, backpropagation, gradients, optimization, and training dynamics.
- **AIF-05 — Representation Learning:** learned representations and embedding spaces.
- **Chapter 01 — Attention and Self-Attention:** attention scores and weighted aggregation.
- **Chapter 02 — Multi-Head Attention and Positional Encoding:** multi-head attention and position-related information.
- **Chapter 03 — Transformer Architecture and Information Flow:** Transformer blocks, residual paths, normalization, and feed-forward networks.
- **Chapter 04 — Encoder-Decoder and Decoder-Only Architectures:** causal information flow and architectural families.

The central question is:

**How do the same Transformer computations behave differently during parameter learning, prediction, and large-scale execution?**

## 4. The Transformer Lifecycle

A Transformer model moves through several conceptual stages.

```text
**Training data**
Tokenized examples and targets
        ↓
**Forward pass**
Transformer computes predictions
        ↓
**Loss and backpropagation**
Measure error and calculate gradients
        ↓
**Parameter updates**
Optimizer updates learned weights
        ↓
**Trained parameters**
        ↓
**Inference**
Generate predictions using learned parameters
```

Training and inference use related forward computations, but they have different objectives and resource requirements.

During training, the model's parameters change as the optimizer processes data. During ordinary inference, the parameters remain fixed while the model computes outputs for new inputs.

Inference can still involve sampling, search, caching, batching, and other runtime mechanisms. These affect how predictions are produced without necessarily changing the model's learned parameters.

## 5. What Does It Mean to Train a Transformer?

A Transformer contains learned parameters, including attention projections, feed-forward weights, normalization parameters where applicable, embeddings, and output-layer parameters.

Training adjusts these parameters so that the model performs better on a specified objective.

Let the model's parameters be \(\theta\). Given input \(X\), the model computes predictions:

\[
\hat{Y} = f_\theta(X)
\]

A loss function compares the predictions with the training targets:

\[
L = \mathcal{L}(\hat{Y},Y)
\]

The optimizer uses gradients of the loss with respect to the parameters to update them.

A simplified gradient-based update is:

\[
\theta_{t+1}
=
\theta_t-\eta\nabla_\theta L
\]

where \(\eta\) is a learning rate. Actual optimizers, such as Adam-family methods, use additional state and update rules.

The Transformer architecture defines the computation that produces predictions. The training objective defines what behavior the model is optimized to learn.

These are related but distinct design decisions.

## 6. Autoregressive Language-Model Training

A common training objective for decoder-only language models is next-token prediction.

Given a sequence:

\[
x_1,x_2,\ldots,x_T
\]

the model learns conditional distributions of the form:

\[
P_\theta(x_t\mid x_1,\ldots,x_{t-1})
\]

The joint sequence probability can be factorized as:

\[
P_\theta(x_1,\ldots,x_T)
=
\prod_{t=1}^{T}
P_\theta(x_t\mid x_1,\ldots,x_{t-1})
\]

The training objective commonly maximizes the likelihood of the observed sequence or, equivalently, minimizes its negative log-likelihood.

For token-level targets, a typical loss is:

\[
L =
-\sum_{t=1}^{T}
\log P_\theta(x_t\mid x_{<t})
\]

where \(x_{<t}\) denotes the tokens preceding position \(t\). Actual implementations may average the loss, ignore selected target positions, or apply additional weighting.

### 6.1 Why causal masking matters during training

The training sequence contains tokens that occur later than a given prediction target. The model must not use those future tokens when constructing the representation for that prediction.

Causal masking enforces this restriction.

Without it, the model could access information from future target positions and exploit that information to reduce the training loss without learning the intended next-token prediction behavior.

This is a correctness requirement, not simply a performance optimization.

### 6.2 Shifted inputs and targets

A common implementation aligns input tokens with the preceding context and targets with the next token.

For example:

| Model input | Training target |
|---|---|
| `The` | `engineer` |
| `The engineer` | `reviewed` |
| `The engineer reviewed` | `the` |
| `The engineer reviewed the` | `model` |

The table illustrates the prediction relationship, not the exact tensor format of a training batch.

In a real implementation, the model typically processes a tokenized sequence in one forward pass, produces logits at multiple positions, and aligns those logits with shifted labels.

The loss is computed across eligible positions.

## 7. Teacher Forcing and Parallel Training

An important distinction is that autoregressive training does not require generating every training token one at a time.

During training, the complete target sequence is already available. The model receives the shifted sequence and uses causal masking to ensure that each position can only use its permitted context.

This is commonly called teacher-forced training.

### 7.1 Why training can be parallelized

Consider the sequence:

> Transformers learn from data.

During training, the model can compute representations for multiple positions in parallel because all input tokens are available.

The causal mask ensures that the representation used to predict a token cannot attend to prohibited future target positions.

The model therefore evaluates many next-token prediction targets in a single forward pass rather than generating the sequence incrementally.

### 7.2 Parallel computation does not mean unrestricted information flow

Parallel hardware execution and causal dependency are different concepts.

The model can calculate many position-specific operations simultaneously while still restricting which tokens each position may use.

The mask determines permitted information flow. The implementation determines how the permitted operations are scheduled on the hardware.

This distinction is fundamental to understanding Transformer training.

### 7.3 Backpropagation during training

After calculating the loss, the training system computes gradients through the network.

The gradients propagate through the output projection, Transformer blocks, attention operations, FFNs, and other trainable components.

The optimizer then updates the parameters.

This process repeats across training batches and optimization steps. The model's behavior changes as the parameters are updated.

## 8. From Training Loss to Learned Behavior

A decreasing training loss indicates that the model is improving on the optimization objective over the measured training examples. It does not guarantee that the model will generalize well to unseen data or perform every downstream task correctly.

Important factors include:

- Training data quality and coverage.
- The representativeness of the data.
- Model capacity.
- Optimization settings.
- Regularization and training procedure.
- The relationship between the objective and the intended application.
- Evaluation methodology.

For example, a model can learn to predict frequent token patterns while remaining unreliable on rare technical terminology or unusual input structures.

Training loss is therefore one measurement, not a complete quality assessment.

### 8.1 Generalization

The model is expected to perform on data beyond the examples directly used to update its parameters.

Validation data and held-out evaluation sets help estimate this behavior, although no evaluation set perfectly represents every future input.

A production system also requires task-specific testing, failure analysis, and monitoring appropriate to its use case.

These concerns connect Transformer training to the broader machine-learning foundations established in AIF-03.

## 9. Training-Time and Inference-Time Computation

Training and inference both use forward computations, but their operational profiles differ.

| Dimension | Training | Inference |
|---|---|---|
| Parameter updates | Yes | Usually no |
| Gradient computation | Required | Usually disabled |
| Primary objective | Learn parameters from data | Produce outputs for supplied inputs |
| Intermediate activations | Often retained for backpropagation | Can often be released or reused according to the execution strategy |
| Data availability | Training sequences and targets are available | Inputs and future generated tokens may not be known in advance |
| Typical challenge | Compute, memory, optimization stability | Latency, throughput, memory, and generation cost |
| Execution pattern | Many positions can be processed in parallel under appropriate masks | Autoregressive generation depends on previously generated tokens |

The distinction is not that training uses attention while inference uses something fundamentally different. Both use the model's forward computations. The differences arise from gradients, parameter updates, data availability, and the way outputs are produced.

## 10. Decoder-Only Inference

A decoder-only model commonly generates a sequence one token at a time.

Given a prompt:

> A production system should

the model computes a probability distribution over the next token.

A decoding procedure selects a token according to the configured strategy. The selected token is appended to the sequence, and the model predicts the next token using the updated context.

This continues until a stopping condition is reached.

### 10.1 Conceptual generation loop

```text
tokens = tokenize(prompt)

while not finished:
    logits = model(tokens)
    next_token = decode(logits)
    tokens.append(next_token)

    if stopping_condition(tokens):
        finished = true

return detokenize(tokens)
```

This pseudocode illustrates the logical process. It omits batching, attention masks, cache management, stopping criteria, token limits, error handling, and implementation-specific optimizations.

### 10.2 Why generation is sequential across new tokens

The model cannot know the actual next generated token before selecting it.

The representation and prediction for the following step depend on the selected token becoming part of the context.

Consequently, ordinary autoregressive generation has a sequential dependency across newly generated tokens.

This is different from training, where the full training sequence is available in advance.

### 10.3 The prompt-processing phase

The initial prompt is often processed as a batch of tokens in one model forward pass.

The model computes contextual representations and next-token scores for the prompt. Once the prompt has been processed, subsequent generation steps extend the context.

This creates two conceptually distinct phases:

- **Prompt processing:** process the supplied context.
- **Token generation:** repeatedly predict and append new tokens.

The computational behavior of these phases differs, particularly when key-value caching is used.

## 11. Key-Value Caching

During autoregressive inference, earlier tokens remain part of the context at every generation step.

A straightforward implementation could recompute the keys and values for the entire context on every step. That repeats work for tokens whose representations have already been processed.

Key-value caching avoids much of this repeated computation.

### 11.1 What is cached?

In attention layers, the model projects representations into keys and values.

During autoregressive generation, the key and value tensors for previously processed tokens can be stored and reused in subsequent steps.

When a new token is processed, the model computes the new token's relevant key and value representations and appends them to the cache.

The new query can then attend to the cached keys and use the associated values.

The exact caching arrangement depends on the architecture and inference implementation.

### 11.2 Without a cache

At each generation step, a simple implementation may recompute key and value projections for the entire prefix.

As the prefix grows, repeated computation increases.

### 11.3 With a cache

Previously computed keys and values are reused.

The system still needs to compute the new token's layer representations and attention operations. Caching does not eliminate the cost of generating new tokens; it reduces redundant work associated with the existing prefix.

### 11.4 Conceptual comparison

```text
**Without key-value caching**
Recompute representations for the growing prefix
More repeated computation as the prefix grows.
<divider />
**With key-value caching**
Reuse past keys and values; compute the new token
Less repeated work, with additional cache memory.
```

### 11.5 The trade-off

Key-value caching exchanges memory for reduced repeated computation.

The cache grows with the number of stored tokens, the number of layers, the number of key-value heads, the key/value dimensions, and the numerical precision used.

For long contexts or many concurrent requests, cache memory can become a major inference constraint.

Caching is therefore an optimization with operational trade-offs, not a free improvement.

## 12. Understanding the Key-Value Cache Memory

A simplified estimate for the memory occupied by a key-value cache is:

\[
M_{\text{KV}}
\approx
2LBnH_{\text{KV}}d_hs
\]

where:

- \(L\) is the number of Transformer layers.
- \(B\) is the number of sequences in the batch.
- \(n\) is the number of cached tokens.
- \(H_{\text{KV}}\) is the number of key-value heads.
- \(d_h\) is the dimension of each key-value head.
- \(s\) is the number of bytes per stored element.
- The factor of 2 accounts for keys and values.

This estimate assumes a conventional dense cache with the same dimensions at each layer. It excludes allocator overhead, metadata, padding, temporary buffers, and other runtime memory.

### 12.1 Example

Suppose an inference configuration has:

- 32 layers.
- 8 key-value heads.
- 128 dimensions per key-value head.
- 8,000 cached tokens.
- 2 bytes per stored element.
- One sequence.

The approximate cache size is:

\[
M_{\text{KV}}
\approx
2 \times 32 \times 1 \times 8000
\times 8 \times 128 \times 2
\]

This gives approximately 8.39 billion bytes, or about 8 GiB when expressed in binary gibibytes.

The example is illustrative. Actual model configurations, cache layouts, and precision choices vary.

### 12.2 Why this matters in production

The cache memory per request affects how many concurrent sequences can fit within available accelerator memory.

An inference system must balance:

- Context length.
- Number of concurrent requests.
- Batch size.
- Model parameter memory.
- Cache memory.
- Temporary computation buffers.
- Latency and throughput targets.

A model that fits in memory for one request may not support the desired concurrency under a long-context workload.

## 13. Inference Strategies and Decoding

The Transformer produces logits or probability distributions over possible next tokens. A decoding strategy determines how the system selects the next token from those predictions.

Common strategies include:

- **Greedy decoding:** choose the highest-scoring next token.
- **Sampling:** select a token according to a probability distribution.
- **Top-k sampling:** restrict sampling to a selected number of high-probability candidates.
- **Top-p sampling:** restrict sampling to a candidate set based on cumulative probability mass.

These methods affect generation behavior but do not change the underlying Transformer parameters.

### 13.1 Greedy decoding

Greedy decoding selects the most probable token at each step.

It is straightforward and deterministic when the model and execution are deterministic, but locally optimal choices do not guarantee the best complete sequence under every sequence-level objective.

### 13.2 Sampling

Sampling introduces variability by selecting among possible tokens according to a distribution.

The output can change across runs depending on the sampling configuration and random state.

### 13.3 Why decoding is a separate decision

A model defines a distribution over possible outputs. The decoding procedure determines how the system uses that distribution to construct a sequence.

Changing decoding settings can change output quality, diversity, repeatability, and latency without retraining the model.

Production systems should select and evaluate decoding settings against the intended task and constraints.

## 14. Model Scaling and Sequence-Length Scaling

The word *scaling* can refer to several different changes. Engineers should distinguish them because they affect cost and quality differently.

### 14.1 Model-size scaling

Model-size scaling changes characteristics such as:

- Number of parameters.
- Model dimension.
- Number of Transformer layers.
- Number of attention heads.
- Feed-forward hidden dimension.

Increasing these dimensions generally increases the amount of computation and parameter memory.

It may improve model capability when supported by appropriate data, optimization, and training compute, but the outcome is not guaranteed to scale linearly.

### 14.2 Sequence-length scaling

Sequence-length scaling increases the number of tokens processed in a context.

For standard full self-attention, the number of query-key interactions grows quadratically with sequence length:

\[
C_{\text{attention}} \propto n^2
\]

If the sequence length doubles:

\[
(2n)^2 = 4n^2
\]

the number of pairwise interactions becomes four times as large.

This can substantially increase attention computation and memory requirements.

### 14.3 Batch-size scaling

Increasing batch size allows more examples or sequences to be processed together. This may improve hardware utilization and throughput, but it also increases memory use and may change the optimization behavior during training.

At inference, batching can improve throughput while increasing the time an individual request waits for batch formation or execution.

### 14.4 Concurrency scaling

For inference services, concurrency scaling means serving more requests at the same time.

It affects memory, scheduling, batching, and resource contention. With autoregressive generation, different requests may have different prompt lengths, output lengths, and stopping times.

Consequently, a larger batch does not always imply proportionally better throughput or latency.

## 15. Compute and Memory Bottlenecks

A Transformer workload has several potential bottlenecks.

### 15.1 Parameter memory

The model's parameters occupy memory according to parameter count and storage precision.

Training often requires additional memory for gradients and optimizer state, beyond the parameters themselves.

The exact overhead depends on the optimizer, precision strategy, sharding, and training implementation.

### 15.2 Activation memory

During training, intermediate activations may need to be retained for backpropagation.

Memory use depends on sequence length, batch size, model dimensions, number of layers, precision, and the implementation's activation-management strategy.

Activation checkpointing can reduce some memory requirements by recomputing selected activations during backpropagation, trading additional computation for lower memory usage.

### 15.3 Attention computation

Standard full attention computes pairwise interactions between sequence positions.

Its quadratic dependence on sequence length can dominate the cost of attention for long sequences.

Optimized attention kernels can reduce memory traffic and avoid materializing some intermediate tensors, improving practical performance without necessarily changing the conceptual full-attention operation.

### 15.4 Feed-forward computation

The FFN applies dense transformations to every token position.

For conventional dense layers, the computational cost grows with both sequence length and the dimensions of the transformations.

For some configurations, FFN computation can account for a large share of the total Transformer computation.

The dominant bottleneck depends on model dimensions, sequence lengths, hardware, and implementation.

## 16. Scaling Is Not Just Increasing Parameters

A larger model can have greater capacity, but capacity alone does not determine useful behavior.

The result also depends on:

- Data quantity and quality.
- Training compute.
- Training duration and optimization.
- Model architecture.
- The training objective.
- Data diversity and coverage.
- Evaluation criteria.

If the training data is poor or the objective is misaligned with the application, adding parameters may increase cost without solving the underlying problem.

Likewise, a longer context window does not guarantee that the model will reliably use every token in that context.

An engineer should distinguish between the model's technical ability to accept a longer sequence and its demonstrated ability to use the additional information effectively.

## 17. Scaling Decisions in Production

A production system must choose configurations that satisfy quality, latency, throughput, and memory constraints simultaneously.

### 17.1 Start with workload characteristics

Measure or estimate:

- Typical and maximum prompt lengths.
- Typical and maximum output lengths.
- Request arrival rate.
- Concurrent active sequences.
- Required response latency.
- Throughput targets.
- Available accelerator memory.
- Expected decoding behavior.

These values influence which model configurations and inference strategies are feasible.

### 17.2 Measure before optimizing

A useful baseline should include:

- Time to process the initial prompt.
- Time per generated token.
- Total response latency.
- Tokens generated per second.
- Requests served per second.
- Peak memory use.
- Cache memory per active sequence.
- Quality under representative tasks.

A single benchmark number is rarely sufficient. Performance can change substantially with prompt length, output length, batch size, and concurrency.

### 17.3 Identify the actual bottleneck

Different symptoms suggest different investigations:

- High memory use may indicate parameter, activation, cache, or temporary-buffer pressure.
- High latency during prompt processing may indicate expensive input processing or attention computation.
- Slow generation may be caused by per-token computation, memory bandwidth, scheduling, or contention.
- Poor throughput may indicate insufficient batching, inefficient kernels, or a workload that does not match the execution strategy.

These are diagnostic hypotheses, not guaranteed causes. Profiling and controlled measurements are needed to identify the actual bottleneck.

## 18. Common Engineering Misconceptions

### Misconception 1: Training and inference are completely different model computations

**Correction:** Both use forward computations through the trained architecture. Training adds gradient computation and parameter updates, while inference normally uses fixed parameters to produce outputs.

### Misconception 2: Autoregressive training must generate tokens one at a time

**Correction:** Training can process multiple positions in parallel using the complete training sequence and a causal mask.

### Misconception 3: Parallel training violates causal dependencies

**Correction:** Parallel execution schedules permitted computations simultaneously. Causal masking still restricts which positions each prediction can use.

### Misconception 4: Key-value caching eliminates inference computation

**Correction:** Caching avoids recomputing keys and values for previously processed tokens. The model still performs computation for new tokens and their attention operations.

### Misconception 5: Key-value caching always improves a system without trade-offs

**Correction:** It reduces repeated work but consumes memory that grows with context length and concurrency.

### Misconception 6: Doubling context length only doubles attention cost

**Correction:** Standard full attention's pairwise interaction count grows quadratically, so doubling sequence length produces four times as many pairwise interactions.

### Misconception 7: A larger model is always better

**Correction:** Larger models require more resources, and quality depends on data, optimization, training compute, architecture, and evaluation.

### Misconception 8: A model that supports a long context will use it effectively

**Correction:** Technical context capacity and demonstrated long-context performance are different properties. Both must be evaluated.

### Misconception 9: High throughput guarantees low latency

**Correction:** A system may increase aggregate throughput through batching while individual requests experience additional waiting or longer execution times.

### Misconception 10: Training loss alone establishes production readiness

**Correction:** Training loss does not establish generalization, reliability, latency, throughput, memory feasibility, or task-specific quality.

## 19. Production Evaluation Checklist

Before approving a Transformer configuration for a workload, verify the following.

### Training

- The training objective matches the intended modeling task.
- Input and target alignment are correct.
- Attention masks enforce the intended information flow.
- Training and validation measurements are tracked.
- Memory use and optimization stability are measured.
- The evaluation dataset is appropriate for the target application.

### Inference

- Prompt processing and token generation are measured separately.
- Decoding behavior matches the application requirements.
- Key-value cache behavior is understood and tested.
- Memory use is measured at realistic context lengths and concurrency.
- Stopping conditions and output limits are handled correctly.
- The inference path is tested against representative inputs.

### Scaling

- Model-size and sequence-length costs are considered separately.
- Peak memory is measured under realistic workloads.
- Throughput and latency are both evaluated.
- Long-context quality is tested rather than assumed.
- Bottleneck hypotheses are confirmed through profiling.
- Performance optimizations are evaluated for both quality and operational impact.

A configuration should be approved based on evidence that it satisfies the application's requirements, not only because it runs successfully on a small test case.

## 20. Knowledge Check

Answer these questions in your own words.

1. How do a Transformer architecture, training objective, and loss function relate to one another?
2. Why can autoregressive training process multiple sequence positions in parallel?
3. What role does causal masking play in training correctness?
4. Explain the difference between teacher-forced training and autoregressive generation.
5. Why does autoregressive generation have a sequential dependency across newly generated tokens?
6. What does a key-value cache store, and what repeated computation does it reduce?
7. Derive the approximate key-value cache memory formula and explain every factor.
8. What happens to the number of full-attention pairwise interactions when sequence length doubles?
9. Distinguish model-size scaling, sequence-length scaling, batch-size scaling, and concurrency scaling.
10. Why can a model with lower training loss still perform poorly in production?
11. How can a system improve throughput while worsening individual request latency?
12. What measurements would you collect before deciding whether an inference workload is memory-bound or compute-bound?

### Applied engineering exercise

You are evaluating a decoder-only Transformer for a production text-generation service.

The service must support:

- Long prompts.
- Variable output lengths.
- Multiple concurrent requests.
- A fixed accelerator-memory budget.
- Explicit latency and throughput targets.

Write a design note that:

1. Separates prompt-processing cost from token-generation cost.
2. Explains how causal masking affects training and inference.
3. Estimates how cache memory changes with sequence length and concurrency.
4. Identifies the main bottlenecks you would investigate.
5. Proposes a measurement plan for latency, throughput, memory, and quality.
6. Explains which trade-offs you would consider before increasing model size or context length.

Do not assume that a larger model, longer context, larger batch, or more aggressive caching is automatically the correct solution. Your decision should follow from the workload and measurements.

## 21. Summary

Transformer training, inference, and scaling share the same underlying architecture but have different computational and operational requirements.

The key ideas are:

- Training optimizes learned parameters against a defined objective.
- Causal language-model training predicts next tokens while using masks to prevent future-token leakage.
- Teacher-forced training can process many positions in parallel, whereas autoregressive generation depends on previously selected tokens.
- Key-value caching reduces repeated work during generation but consumes memory.
- Standard full attention has quadratic pairwise interaction growth with sequence length.
- Model size, context length, batch size, and request concurrency affect different aspects of system behavior.
- Scaling model capacity does not guarantee proportional improvements in quality.
- Production readiness requires measurements of task quality, memory, latency, throughput, and behavior under realistic workloads.

The broader lesson is that Transformer engineering does not end with understanding the architecture. It requires connecting model behavior to optimization, computation, memory, evaluation, and workload constraints.

## 22. References and Further Reading

- Vaswani, A. et al. (2017). *Attention Is All You Need*. Advances in Neural Information Processing Systems.
- Brown, T. B. et al. (2020). *Language Models are Few-Shot Learners*. Advances in Neural Information Processing Systems.
- Hoffmann, J. et al. (2022). *Training Compute-Optimal Large Language Models*. Advances in Neural Information Processing Systems.

These works provide foundational perspectives on Transformer architecture, autoregressive language modeling, and the relationship between model size, data, and training compute.

This chapter focuses on foundational training, inference, and scaling principles. Framework-specific training pipelines, optimized inference engines, distributed serving, quantization, production monitoring, and deployment architecture belong in the relevant downstream engineering domains.
