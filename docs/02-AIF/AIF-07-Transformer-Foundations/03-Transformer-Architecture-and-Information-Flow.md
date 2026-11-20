# 03 — Transformer Architecture and Information Flow

## 1. Purpose

Chapters 01 and 02 established the foundations of attention, self-attention, multi-head attention, and positional information. This chapter connects those mechanisms into a complete Transformer block and explains how information moves through the architecture.

Understanding the Transformer requires more than knowing the attention equation. An engineer must understand how attention interacts with residual connections, normalization, feed-forward networks, and stacked layers to transform token representations.

This chapter focuses on the architecture's internal structure and data flow. It does not yet compare encoder-decoder and decoder-only model families in detail; that distinction belongs in Chapter 04.

## 2. Learning Objectives

After completing this chapter, you should be able to:

- Explain the major components of a Transformer block and their responsibilities.
- Trace information from input token representations through multiple Transformer layers.
- Explain the roles of multi-head attention, feed-forward networks, residual connections, and normalization.
- Distinguish attention-based token interaction from position-wise feature transformation.
- Explain why Transformer layers are stacked.
- Compare pre-normalization and post-normalization at a conceptual level.
- Describe the difference between a Transformer block and a complete Transformer architecture.
- Analyze the computational and optimization trade-offs of the main components.
- Identify common architectural misconceptions and debugging considerations.

## 3. Prerequisites and Connections

This chapter builds on:

- **AIF-04 — Deep Learning Foundations:** forward propagation, learned transformations, activation functions, backpropagation, and optimization.
- **AIF-05 — Representation Learning:** vector representations and learned feature spaces.
- **AIF-06 — Sequence Modeling:** sequential information flow and recurrent architectures.
- **Chapter 01 — Attention and Self-Attention:** queries, keys, values, attention scores, and aggregation.
- **Chapter 02 — Multi-Head Attention and Positional Encoding:** multiple attention heads and positional information.

The central question is:

**How does a sequence of token representations become progressively more useful contextual representations through a stack of neural-network transformations?**

## 4. The Transformer as a Representation-Processing System

A Transformer is a neural-network architecture designed to process sequences using attention and other learned transformations.

For a sequence of tokens, the model begins with numerical representations and repeatedly transforms them. At each layer, token representations can incorporate information from other permitted positions and then undergo additional feature transformations.

A simplified flow is:

```text
Input tokens
        ↓
Token representations + positional information
Exact positional method depends on the architecture
        ↓
Transformer block 1
Attention, residual paths, normalization, feed-forward transformation
        ↓
Transformer block 2 ... block N
Repeated learned transformations
        ↓
Final contextual representations
A task-specific output component may consume these representations.
```

The diagram is conceptual. Different Transformer families arrange components differently, and the output component depends on the task.

A Transformer block is a reusable processing unit. A complete architecture may contain many blocks plus input processing, positional mechanisms, and task-specific output components.

## 5. Inside a Transformer Block

A conventional Transformer block combines two major sublayers:

1. **Attention sublayer:** allows each permitted query position to aggregate information from other positions.
2. **Position-wise feed-forward sublayer:** transforms the features of each position using a learned neural network.

Residual connections and normalization support the information flow and optimization of these sublayers.

A conceptual pre-normalization block can be written as:

\[
U = X + \operatorname{MHA}(\operatorname{Norm}_1(X))
\]

\[
Y = U + \operatorname{FFN}(\operatorname{Norm}_2(U))
\]

where:

- \(X\) is the input representation matrix.
- \(\operatorname{MHA}\) is multi-head attention.
- \(\operatorname{Norm}_1\) and \(\operatorname{Norm}_2\) are normalization operations.
- \(\operatorname{FFN}\) is the position-wise feed-forward network.
- \(Y\) is the block output.

This is one common block arrangement, not the only valid design. The order of normalization, residual connections, and sublayers varies among architectures.

## 6. The Attention Sublayer

The attention sublayer provides interaction across sequence positions.

Given input representations \(X\), the model constructs query, key, and value projections. Multi-head attention then computes multiple attention distributions and aggregates the corresponding value representations.

For standard full self-attention:

\[
\operatorname{MHA}(X)
=
\operatorname{Concat}(H_1,\ldots,H_h)W^O
\]

where each head is:

\[
H_i =
\operatorname{softmax}
\left(
\frac{Q_iK_i^\top}{\sqrt{d_k}}
+ M
\right)V_i
\]

Here, \(M\) represents any applicable mask, expressed in a form compatible with the score calculation. An implementation may apply masking by assigning excluded positions effectively negative-infinite scores.

### 6.1 What attention contributes

Attention lets a position's output depend on information from other positions allowed by the attention pattern.

For example, a representation associated with a pronoun may incorporate information from another token that helps contextualize it. The model learns which information to aggregate through training.

Attention therefore changes the representation of a position based on interactions with other positions.

### 6.2 Attention is not the entire block

Attention mixes information across positions, but it is only one part of the Transformer block.

The block also needs transformations that process the resulting features, paths that preserve existing information, and normalization choices that affect training dynamics.

These components work together rather than independently defining the full architecture.

## 7. The Position-Wise Feed-Forward Network

The feed-forward network, commonly called the FFN, applies a learned transformation to each token position.

A standard form is:

\[
\operatorname{FFN}(x)
=
W_2\,\phi(W_1x+b_1)+b_2
\]

where:

- \(x\) is one token's representation.
- \(W_1\) and \(W_2\) are learned weight matrices.
- \(b_1\) and \(b_2\) are bias vectors.
- \(\phi\) is a nonlinear activation function.

The hidden dimension is often larger than the model dimension. The network expands the feature representation, applies a nonlinear transformation, and projects it back to the model dimension.

### 7.1 Why position-wise?

The same FFN parameters are applied independently to every sequence position.

If the input matrix has shape:

\[
X \in \mathbb{R}^{n \times d_{\text{model}}}
\]

then the FFN transforms each of the \(n\) rows using the same learned function.

The FFN does not independently mix information between different sequence positions. Cross-position interaction is supplied by attention or other architectural mechanisms.

### 7.2 Why use an FFN after attention?

Attention determines how information is combined across positions. The FFN provides additional nonlinear feature transformation at each position.

This separation is useful:

- Attention mixes information across permitted positions.
- The FFN transforms the features available at each position.

The two sublayers provide complementary operations.

### 7.3 What the FFN does not guarantee

The FFN does not automatically learn a human-interpretable concept for each hidden neuron. Its feature transformations are learned through the training objective.

Likewise, increasing the FFN's hidden dimension does not guarantee proportional improvements in model quality. It changes the architecture's capacity and computational requirements.

## 8. Residual Connections

A residual connection adds a sublayer's input to its output.

A generic residual transformation is:

\[
y = x + F(x)
\]

where \(F\) is a learned transformation, such as attention or a feed-forward network.

Instead of requiring the sublayer to produce an entirely new representation, the network can learn a modification to the incoming representation.

### 8.1 Why residual connections matter

Deep neural networks repeatedly apply learned transformations. Without effective information and gradient paths, optimization can become difficult as depth increases.

Residual connections provide a direct path from a sublayer's input to its output. This can help preserve useful information and support gradient propagation through deep networks.

They do not eliminate all optimization difficulties, but they are an important part of the architecture's training behavior.

### 8.2 Residual connections preserve shape compatibility

For the simple addition \(x + F(x)\), the tensors must have compatible shapes.

In a conventional Transformer block, the attention and FFN outputs are generally projected back to the model dimension so they can be added to the residual stream.

If an architecture changes dimensions, it must handle the mismatch explicitly—for example, through a compatible projection or a different residual design.

### 8.3 Residual stream as a mental model

The sequence representation passing through a stack of Transformer blocks is often described as a residual stream.

Each sublayer reads a representation, computes an update, and contributes that update through a residual connection.

Conceptually:

\[
x_{l+1} = x_l + \Delta_l
\]

where \(\Delta_l\) is the update contributed by the relevant sublayer.

This mental model helps explain why a block can refine existing representations rather than replacing them completely at each step.

## 9. Normalization

Normalization operations transform activations according to specified statistics or learned scaling and shifting parameters.

Transformers commonly use Layer Normalization or related normalization designs. Layer Normalization operates across the feature dimensions of an individual token representation, rather than calculating statistics across the batch in the same manner as Batch Normalization.

For a vector \(x\) with \(d\) features, Layer Normalization computes a mean and variance over those features:

\[
\mu = \frac{1}{d}\sum_{j=1}^{d}x_j
\]

\[
\sigma^2 = \frac{1}{d}\sum_{j=1}^{d}(x_j-\mu)^2
\]

It then normalizes the values and applies learned scale and shift parameters:

\[
\operatorname{LN}(x)_j
=
\gamma_j
\frac{x_j-\mu}{\sqrt{\sigma^2+\epsilon}}
+\beta_j
\]

where \(\gamma_j\) and \(\beta_j\) are learned parameters and \(\epsilon\) is a small constant used for numerical stability.

Exact implementations may differ in details such as variance calculation and numerical precision.

### 9.1 Why normalization is used

Normalization helps control activation scales and can make optimization more stable.

It does not guarantee that every activation is bounded, that gradients never become unstable, or that training will converge. Its effect depends on the broader architecture and training setup.

### 9.2 Pre-normalization and post-normalization

The placement of normalization changes the information and gradient paths through the block.

**Post-normalization** applies normalization after the residual addition. A simplified original-style block can be expressed as:

\[
U = \operatorname{Norm}_1(X+\operatorname{MHA}(X))
\]

\[
Y = \operatorname{Norm}_2(U+\operatorname{FFN}(U))
\]

**Pre-normalization** normalizes the input before each sublayer and then adds the sublayer output through the residual path:

\[
U = X+\operatorname{MHA}(\operatorname{Norm}_1(X))
\]

\[
Y = U+\operatorname{FFN}(\operatorname{Norm}_2(U))
\]

These equations omit implementation-specific details and are intended to illustrate the order of operations.

Pre-normalization often provides a more direct residual path through deep stacks and is widely used in modern architectures. Post-normalization was used in the original Transformer design. Neither arrangement should be selected without considering the full training configuration.

## 10. Putting the Sublayers Together

A conventional block can be understood as a repeated sequence of transformations.

For a pre-normalization design:

1. Start with token representations \(X\).
2. Normalize the representations.
3. Apply multi-head attention.
4. Add the attention output to the residual stream.
5. Normalize the updated representations.
6. Apply the position-wise FFN.
7. Add the FFN output to the residual stream.
8. Pass the result to the next block.

The data flow is:

```text
Input \(X\)
        ↓
Layer Normalization
        ↓
Multi-Head Attention
        ↓
Residual addition with \(X\)
        ↓
Layer Normalization
        ↓
Position-Wise FFN
        ↓
Residual addition → Block output
```

The diagram emphasizes the order of operations. A real implementation must preserve the intended residual connections and tensor dimensions.

## 11. Why Stack Multiple Transformer Blocks?

A single block provides one round of cross-position interaction and feature transformation. Stacking blocks allows the model to repeatedly refine representations.

Let:

\[
X^{(0)} = X
\]

and let \(F_l\) represent the transformation performed by block \(l\). Then:

\[
X^{(l)} = F_l(X^{(l-1)})
\]

Each block receives the previous block's output, so its learned transformations operate on representations already modified by earlier layers.

### 11.1 Progressive representation transformation

Consider a sentence in which a token's interpretation depends on multiple relationships.

A lower layer may learn useful local or surface-level relationships. Later layers can process the resulting representations and learn more complex interactions.

This is an intuition, not a universal rule that specific layers always correspond to specific linguistic levels. Actual layer behavior depends on the model and training process.

### 11.2 Depth increases capacity and cost

Adding layers increases the number of learned transformations and generally increases model capacity. It also increases:

- Parameter count.
- Training compute.
- Sequential dependency across layers.
- Inference latency.
- Memory requirements for parameters and, during training, intermediate activations.

More layers do not guarantee better generalization. The benefit depends on the data, optimization, architecture, and evaluation task.

## 12. Information Flow Across Positions and Features

The Transformer block combines two distinct forms of transformation.

### 12.1 Cross-position information mixing

Attention allows one position to incorporate information from other positions permitted by the attention mask.

For example, the representation at position \(i\) can depend on value vectors from positions \(j\) selected by the learned attention distribution.

This operation mixes information across sequence positions.

### 12.2 Position-wise feature transformation

The FFN transforms each position's feature vector independently using shared learned parameters.

The FFN can reshape or expand features that were produced by attention, but it does not directly compare different positions in its standard form.

### 12.3 Why the distinction is useful

Separating these operations helps engineers reason about model behavior and performance.

If a model struggles to use information from other tokens, investigate the attention mechanism, masks, positional information, and relevant representations.

If a model's feature transformation capacity or optimization behavior is the concern, the FFN, normalization, residual design, and training configuration may also matter.

These are diagnostic starting points, not guaranteed one-to-one mappings between a failure and a single component.

## 13. Masks and Information-Flow Constraints

Attention masks define which positions are allowed to contribute to a query's attention distribution.

For standard full self-attention, each position may attend to every position in the sequence, subject to any padding mask or other constraints.

For causal attention, a query at position \(i\) cannot attend to positions after \(i\).

A causal mask can be represented conceptually as:

\[
M_{ij} =
\begin{cases}
0, & j \leq i\\
-\infty, & j > i
\end{cases}
\]

The mask is added to the attention scores before softmax, making the prohibited future positions receive zero attention weight in the idealized mathematical formulation.

Actual implementations use numerically appropriate masking operations rather than necessarily storing literal negative infinity in every case.

### 13.1 Why masks matter

Masking changes the information that can flow between positions.

Without the correct causal constraint, a model trained to predict the next token could access future target tokens during training, creating information leakage and an invalid training setup for autoregressive prediction.

Padding masks serve a different purpose: they prevent artificial padding positions from contributing as if they were meaningful tokens.

Masking is therefore part of the architecture's correctness, not merely a performance option.

## 14. Shape and Dimension Reasoning

Shape consistency is one of the most useful tools for understanding and debugging Transformer implementations.

Assume:

- Batch size: \(B\)
- Sequence length: \(n\)
- Model dimension: \(d_{\text{model}}\)
- Number of heads: \(h\)
- Per-head dimension: \(d_h\)

The input representation tensor commonly has shape:

\[
X \in \mathbb{R}^{B \times n \times d_{\text{model}}}
\]

After the query, key, and value projections, a conventional implementation reshapes them to:

\[
Q,K,V \in
\mathbb{R}^{B \times h \times n \times d_h}
\]

For equal-sized heads:

\[
d_h = \frac{d_{\text{model}}}{h}
\]

The attention score tensor has shape:

\[
S \in \mathbb{R}^{B \times h \times n \times n}
\]

After attention aggregation, the head outputs are combined into:

\[
H \in \mathbb{R}^{B \times n \times d_{\text{model}}}
\]

The output projection typically preserves the model dimension:

\[
Y \in \mathbb{R}^{B \times n \times d_{\text{model}}}
\]

This is a conventional dense multi-head attention layout. Implementations may use different tensor layouts or specialized attention variants, but the dimensions must remain consistent with the intended computation.

### 14.1 Practical debugging implications

If a residual addition fails, check whether the sublayer output and residual stream have compatible shapes.

If attention scores have unexpected dimensions, verify the head reshape, transpose, and batch dimensions.

If memory usage grows unexpectedly, inspect the dimensions of the attention score tensor. Its two sequence dimensions are the reason standard full attention has quadratic interaction growth.

Shape reasoning often reveals architectural errors before inspecting the numerical values.

## 15. Computational Cost and Scaling

Transformer cost comes from several components, not attention alone.

For a conventional dense block with sequence length \(n\) and model dimension \(d\):

- The query, key, value, output, and FFN projections have costs that are commonly dominated by terms proportional to \(nd^2\), with constants depending on the architecture.
- Full attention score computation and value aggregation introduce terms proportional to \(n^2d\).
- Stacking more blocks increases the total work across layers.

The quadratic sequence-length term becomes especially important as context length grows.

If sequence length doubles, the number of pairwise query-key interactions in standard full attention grows by a factor of four.

However, total model cost also depends on the model dimension, FFN expansion ratio, number of layers, batch size, precision, attention implementation, and hardware.

### 15.1 Training and inference are not identical

During training, the model processes batches of target sequences and must support gradient computation. Activations required for backpropagation can contribute substantially to memory use.

During autoregressive inference, a model typically generates tokens incrementally. Implementations may cache previously computed key and value tensors to avoid recomputing them for every generated token.

That cache changes the operational cost profile and introduces additional memory requirements.

Detailed inference and key-value cache behavior are covered in Chapter 05, **Transformer Training, Inference, and Scaling**.

## 16. Common Engineering Misconceptions

### Misconception 1: Attention is the entire Transformer block

**Correction:** A conventional block also includes a feed-forward network, residual connections, and normalization. These components have different responsibilities.

### Misconception 2: The FFN mixes information across tokens

**Correction:** A standard position-wise FFN transforms each token's feature vector independently using shared parameters. Attention provides cross-position information mixing.

### Misconception 3: Residual connections and normalization are interchangeable

**Correction:** Residual connections provide additive paths for information and gradients. Normalization transforms activation statistics and scales. They serve different purposes.

### Misconception 4: Every Transformer uses the same normalization order

**Correction:** Pre-normalization and post-normalization arrangements differ. The choice affects optimization and information flow.

### Misconception 5: More layers always produce better representations

**Correction:** Additional depth increases capacity and cost, but the effect on quality depends on training, data, architecture, and evaluation.

### Misconception 6: Causal masking is only a speed optimization

**Correction:** Causal masking enforces the information constraints required by autoregressive prediction. Incorrect masking can introduce future-token leakage.

### Misconception 7: Full self-attention is always used

**Correction:** Attention patterns can be restricted by causal, padding, or other masks, and some architectures use alternative interaction patterns.

### Misconception 8: A shape-correct implementation must be architecturally correct

**Correction:** Shape consistency is necessary but not sufficient. A model can have valid tensor dimensions while using the wrong mask, normalization order, positional mechanism, or information flow.

## 17. Production Engineering Perspective

When reviewing a Transformer implementation, evaluate both architecture and operational behavior.

### 17.1 Architecture review

Verify:

- The intended attention pattern is implemented correctly.
- Positional information is introduced according to the design.
- Residual paths connect the intended tensors.
- Normalization is placed correctly.
- FFN dimensions and activation functions match the architecture.
- Output dimensions are compatible with the next block or output component.

### 17.2 Numerical and training review

Investigate:

- Activation and gradient behavior during training.
- Loss stability and convergence.
- Mixed-precision numerical behavior.
- Mask correctness, including padding and causal constraints.
- Differences between training and inference paths.

### 17.3 Performance review

Measure:

- Peak training memory.
- Inference memory at realistic batch and context sizes.
- Throughput and latency.
- Scaling behavior as sequence length increases.
- The cost of the selected FFN dimensions and layer count.
- The effect of attention implementation and precision.

A production design should be validated against representative workloads rather than relying only on theoretical complexity.

## 18. Relationship to the Next Chapters

This chapter described the internal components and information flow of a conventional Transformer block.

The remaining AIF-07 chapters extend the discussion:

- **Chapter 04 — Encoder-Decoder and Decoder-Only Architectures:** compares how Transformer blocks are arranged for different modeling objectives and how attention constraints shape information flow.
- **Chapter 05 — Transformer Training, Inference, and Scaling:** explains training objectives, autoregressive generation, inference-time computation, and scaling considerations.

Model-specific tokenization APIs, fine-tuning workflows, deployment systems, and production monitoring remain in their respective downstream curriculum domains.

## 19. Knowledge Check

Answer these questions in your own words before moving to Chapter 04.

1. What are the main components of a conventional Transformer block, and what does each contribute?
2. Why does the Transformer combine attention with a position-wise FFN?
3. Explain the purpose of a residual connection without describing it only as an addition.
4. What does Layer Normalization normalize, and how does it differ conceptually from a residual connection?
5. Compare pre-normalization and post-normalization.
6. Why are Transformer blocks stacked, and what are the costs of increasing depth?
7. Explain the difference between cross-position information mixing and position-wise feature transformation.
8. Why can incorrect causal masking invalidate autoregressive training?
9. Given \(B\), \(n\), \(h\), and \(d_h\), derive the shapes of the input, attention scores, and concatenated head outputs.
10. Why is a shape-correct implementation not necessarily an architecturally correct implementation?

### Applied engineering exercise

You are reviewing a Transformer block that has:

- An input tensor with shape \((B,n,768)\).
- Twelve equal-sized attention heads.
- A residual addition after attention.
- A feed-forward network with hidden dimension 3,072.
- A second residual addition after the feed-forward network.

Write a short architecture review that:

1. Derives the per-head dimension and attention-score tensor shape.
2. Explains the role of each residual connection.
3. Identifies where normalization placement must be verified.
4. Explains what must be checked to ensure causal information flow.
5. Identifies the likely computational bottlenecks when sequence length increases significantly.

Your answer should distinguish between properties implied by the stated dimensions and properties that cannot be determined without inspecting the implementation.

## 20. Summary

A Transformer block combines attention, a position-wise feed-forward network, residual connections, and normalization to transform token representations.

The key ideas are:

- Attention mixes information across permitted sequence positions.
- The FFN transforms features independently at each position using shared parameters.
- Residual connections provide direct additive paths through the network.
- Normalization affects activation behavior and training dynamics.
- Pre-normalization and post-normalization are distinct architectural arrangements.
- Stacking blocks enables repeated representation transformations, at increased computational and memory cost.
- Attention masks constrain information flow and are essential for correct causal training.
- Tensor-shape reasoning is an important tool for implementation review and debugging.
- Production evaluation must consider numerical behavior, memory, latency, throughput, and model quality.

The next chapter examines how Transformer blocks are arranged into encoder-decoder and decoder-only architectures.

## 21. References and Further Reading

- Vaswani, A. et al. (2017). *Attention Is All You Need*. Advances in Neural Information Processing Systems.

This foundational paper describes the original Transformer architecture, including attention, position-wise feed-forward networks, residual connections, normalization, and the encoder-decoder arrangement.

This chapter presents architectural principles rather than a framework-specific implementation. Implementation details should be checked against the exact model specification being built or evaluated.
