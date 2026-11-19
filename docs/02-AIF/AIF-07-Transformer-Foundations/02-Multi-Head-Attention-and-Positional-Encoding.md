# 02 — Multi-Head Attention and Positional Encoding

## 1. Purpose

Chapter 01 established how attention computes context-sensitive representations by using queries, keys, and values. This chapter extends that foundation in two directions:

1. **Multi-head attention:** allowing a model to perform multiple learned attention operations in parallel, rather than relying on a single attention operation.
2. **Positional encoding:** supplying information about sequence order and position, which standard self-attention does not inherently represent.

These mechanisms address different limitations. Multi-head attention increases the model's capacity to represent different relationships, while positional information helps the model distinguish tokens according to their position in a sequence.

Together, they form important foundations of Transformer architecture.

This chapter focuses on conceptual understanding, mathematical structure, and engineering trade-offs. Detailed Transformer block composition is reserved for Chapter 03.

## 2. Learning Objectives

After completing this chapter, you should be able to:

- Explain why a single attention operation may be insufficient for rich contextual representation.
- Describe the motivation and operation of multi-head attention.
- Derive the multi-head attention equations and explain the role of each parameter matrix.
- Explain why attention heads have separate learned projections.
- Distinguish attention heads from model layers.
- Explain the positional information problem in standard self-attention.
- Compare sinusoidal positional encoding with learned positional embeddings.
- Explain how positional information is combined with token representations.
- Identify limitations of absolute positional representations.
- Analyze the computational and architectural trade-offs of multi-head attention and positional encoding.

## 3. Prerequisites and Connections

This chapter assumes familiarity with:

- Vector representations and embedding spaces from AIF-05.
- Neural-network projections and learned parameters from AIF-04.
- Sequence order and recurrent processing from AIF-06.
- Queries, keys, values, scaled dot-product attention, and attention masks from Chapter 01.

The central connection is that attention operates on learned vector representations, but those representations need sufficient capacity and information to express the relationships required by a task.

Multi-head attention changes how attention information is represented and combined. Positional encoding changes what information is available to the attention mechanism.

## 4. Why One Attention Head May Be Insufficient

A single attention head computes one set of query-key compatibility scores and uses the resulting weights to aggregate value vectors.

This is already useful: different queries can produce different attention distributions. However, a single head uses one learned set of projections to define its matching and value spaces.

Consider a sentence such as:

> The experienced engineer reviewed the model because it had failed during deployment.

To construct useful contextual representations, a model might benefit from representing several kinds of relationships:

- A token's relationship to a nearby modifier.
- A pronoun's relationship to a possible referent.
- A technical term's relationship to an event or action.
- A token's relationship to a distant part of the sentence.

These examples are illustrative, not a guarantee that a particular head will specialize in any specific linguistic function.

The engineering question is: **why require one learned attention operation to represent every useful interaction in one projection space?**

Multi-head attention addresses this limitation by creating multiple attention heads with separate learned projections.

## 5. What Is Multi-Head Attention?

Multi-head attention runs multiple attention operations in parallel. Each head transforms the input into its own query, key, and value representations, computes attention, and produces an output.

The individual outputs are then concatenated and projected into a shared output representation.

Conceptually:

```text
**Input representations**
Same sequence supplied to every head
<grid columns={3} gap={2}>
<grid-item>
**Head 1**
Own Q, K, V projections
</grid-item>
<grid-item>
**Head 2**
Own Q, K, V projections
</grid-item>
<grid-item>
**Head h**
Own Q, K, V projections
</grid-item>
</grid>
        ↓
**Concatenate head outputs**
        ↓
**Output projection**
Combine information from the heads
```

Each head processes the same input sequence, but its learned projections can produce a different representation space. As a result, the heads can calculate different attention distributions and aggregate different information.

The heads are computed in parallel conceptually and can be implemented using efficient batched tensor operations.

## 6. Mathematical Formulation

Let the input representation matrix be:

\[
X \in \mathbb{R}^{n \times d_{\text{model}}}
\]

where:

- \(n\) is the sequence length.
- \(d_{\text{model}}\) is the model's representation dimension.

Suppose the architecture uses \(h\) attention heads.

### 6.1 Head-specific projections

For head \(i\), define:

\[
Q_i = XW_i^Q
\]

\[
K_i = XW_i^K
\]

\[
V_i = XW_i^V
\]

where \(W_i^Q\), \(W_i^K\), and \(W_i^V\) are the learned projection matrices for that head.

The head computes:

\[
\operatorname{head}_i =
\operatorname{softmax}
\left(
\frac{Q_iK_i^\top}{\sqrt{d_k}}
\right)V_i
\]

Any applicable attention mask is incorporated into the score calculation before softmax.

### 6.2 Concatenating the heads

After each head produces its output, the outputs are concatenated along the feature dimension:

\[
H =
\operatorname{Concat}
(\operatorname{head}_1,\ldots,\operatorname{head}_h)
\]

The concatenated representation contains the outputs of all heads.

Concatenation preserves each head's output as a distinct feature segment at this stage. It does not mean that the model has already learned how to combine those features optimally.

### 6.3 Output projection

The concatenated output is transformed using a learned output projection:

\[
\operatorname{MultiHead}(X)
=
HW^O
\]

Combining the steps gives the standard formulation:

\[
\boxed{
\operatorname{MultiHead}(Q,K,V)
=
\operatorname{Concat}(\operatorname{head}_1,\ldots,\operatorname{head}_h)W^O
}
\]

Here, the notation \(Q,K,V\) represents the inputs from which the individual heads derive their projections. In self-attention, those inputs originate from the same sequence. In other attention arrangements, they may originate from different sources.

The output projection allows the model to learn how information from the different heads should be combined into the shared model dimension.

## 7. Understanding the Dimensions

In a common Transformer configuration, the model dimension is divided across the heads.

If:

\[
d_{\text{model}} = 768,\qquad h = 12
\]

then a typical per-head dimension is:

\[
d_k = d_v = \frac{768}{12}=64
\]

Each head produces a representation with 64 features per token. Concatenating the 12 outputs gives:

\[
12 \times 64 = 768
\]

features per token, matching the model dimension before the output projection.

This is a common design, not a universal requirement. Architectures may use different query and value dimensions, and some modern variants use different numbers of query heads and key-value heads.

### 7.1 Why divide the dimension?

Using smaller dimensions per head allows multiple attention operations to run within a model's overall representation budget.

If each head used the full model dimension and all outputs were concatenated, the intermediate feature dimension would grow with the number of heads. The conventional design controls that growth by allocating a portion of the representation dimension to each head.

The trade-off is that each head operates in a lower-dimensional space. Whether this allocation is effective depends on the model configuration, training process, and task.

## 8. Why Separate Heads Matter

Separate projection matrices allow heads to learn different matching and aggregation behaviors.

For example, one head may assign relatively high weights to nearby positions, while another may distribute its weights across more distant positions. Another head may learn a different pattern associated with a useful feature relationship.

These are possible behaviors, not predefined roles.

### 8.1 Heads are not manually assigned linguistic functions

Unless a system explicitly imposes a constraint, an engineer does not normally assign one head to nouns, another to pronouns, and another to punctuation.

The projection matrices are learned during training. The resulting behavior depends on the training data, objective, architecture, and optimization.

### 8.2 Heads may overlap

Multiple heads do not necessarily learn distinct or complementary behaviors. Some may develop similar attention patterns or redundant representations.

Therefore, increasing the number of heads does not guarantee a proportional increase in useful capability.

### 8.3 More heads are not automatically better

The number of heads is an architectural hyperparameter. Its effects depend on:

- The model dimension.
- The per-head dimension.
- Training data and objectives.
- Model depth and overall parameter budget.
- Hardware and kernel efficiency.
- The task's representation requirements.

An engineer should evaluate head count as part of the full architecture rather than treating it as an independent quality score.

## 9. Multi-Head Attention Versus Multiple Layers

These terms describe different architectural dimensions.

**Multiple heads** provide several attention operations within one multi-head attention module.

**Multiple layers** stack Transformer blocks so that later blocks operate on representations transformed by earlier blocks.

A useful conceptual comparison is:

| Dimension | Multiple heads | Multiple layers |
|---|---|---|
| Main purpose | Provide multiple learned attention spaces within a module | Build progressively transformed representations |
| Input | Typically the same input representation for each head | Output of an earlier block becomes input to a later block |
| Parameters | Separate projections per head plus an output projection | Each block has its own attention and other transformation parameters |
| Computation | Heads can be computed in parallel | Layers generally depend on preceding layers' outputs |
| Does it guarantee specialization? | No | No |

A model with many heads is not necessarily deep, and a deep model does not necessarily have many heads per layer.

The interaction between attention, feed-forward transformations, residual connections, normalization, and stacked layers is covered in Chapter 03.

## 10. The Positional Information Problem

Self-attention computes relationships from the input vectors, but standard self-attention does not inherently know the original order of a sequence.

Suppose the model receives the tokens:

- “engineer”
- “reviews”
- “model”

The arrangements “engineer reviews model” and “model reviews engineer” contain the same tokens but have different meanings.

If the input representations contain no positional or other order-dependent information, standard self-attention has no direct signal that distinguishes the original ordering. Its operations are based on the content representations and the relationships calculated from them.

This is a structural property of the mechanism, not merely a training-data problem.

### 10.1 Permutation behavior

For standard unmasked self-attention without positional information, permuting the input representations and applying the same permutation to the outputs preserves the computation's structure.

Informally, the model can relate the supplied vectors, but the attention operation alone does not identify which vector originally appeared first, second, or last.

This is why Transformer architectures introduce positional information or another order-aware mechanism.

### 10.2 Content and position are different signals

A token representation can carry information about token identity and previously learned features. Positional information provides a signal about where the token occurs or how it relates to sequence order.

These signals complement one another:

- **Content representation:** what information the token representation carries.
- **Positional representation:** where the token occurs or what order-related information is available.

The architecture must combine these signals in a way that supports the task.

## 11. What Is Positional Encoding?

Positional encoding is a method of providing position-related information to a sequence model.

A simple strategy is to create a positional vector \(p_i\) for each sequence position \(i\), then combine it with the token representation \(x_i\).

For additive positional encoding:

\[
z_i = x_i + p_i
\]

In matrix form:

\[
Z = X + P
\]

where \(P\) contains the positional vectors aligned with the input positions.

The vectors must have compatible dimensions for direct addition.

This equation represents one important design family. Not all positional methods add a fixed vector to the input embeddings. Some use learned absolute embeddings, relative position representations, or position-dependent transformations inside attention.

### 11.1 Why addition?

Addition lets the model receive both token-related and position-related signals in the same representation space without increasing the feature dimension.

The model's subsequent learned transformations can use the combined representation.

However, addition also means the content and position signals share the same dimensions. The network must learn how to use the combined signal effectively.

Concatenating content and position vectors is another possible design, but it changes the dimensionality and requires subsequent layers to accommodate the larger representation.

### 11.2 Position is not semantic content

A positional vector does not represent a word's meaning. It supplies an order-related signal that the model can combine with content information.

Likewise, a positional encoding does not itself understand grammar or sentence structure. Its usefulness comes from how the trained model uses the available position information.

## 12. Sinusoidal Positional Encoding

The original Transformer architecture introduced a fixed sinusoidal positional encoding.

For position \(pos\) and dimension index \(i\), the encoding is defined as:

\[
PE(pos,2i)
=
\sin\left(
\frac{pos}{10000^{2i/d_{\text{model}}}}
\right)
\]

\[
PE(pos,2i+1)
=
\cos\left(
\frac{pos}{10000^{2i/d_{\text{model}}}}
\right)
\]

The even-indexed dimensions use sine functions, while the odd-indexed dimensions use cosine functions.

Different dimensions use different wavelengths. Some dimensions vary relatively quickly across positions, while others vary more slowly.

The resulting vector provides a structured numerical signature for each position.

### 12.1 Why use sine and cosine?

Sinusoidal functions offer several useful properties:

- They produce deterministic positional vectors without learning a separate parameter for every position.
- Different dimensions encode position at different scales.
- Their periodic structure provides a rich set of signals that downstream learned transformations can use.
- Their mathematical relationships support transformations associated with relative offsets.

These properties make sinusoidal encodings a principled design choice, but they do not guarantee that a trained model will generalize to arbitrary sequence lengths.

### 12.2 Multiple positional scales

Consider a sequence containing 100 tokens.

A positional dimension with a relatively short wavelength changes rapidly as the position increases. A dimension with a longer wavelength changes more slowly.

Across many dimensions, the combination of these signals helps distinguish positions.

The model can learn to use these dimensions as part of its contextual representations. It does not need to interpret the sine and cosine values manually.

### 12.3 Fixed does not mean universally generalizable

Because sinusoidal encodings are computed from a formula, they can be generated for positions beyond those seen during training.

However, being able to calculate a positional vector at a new position does not guarantee that the model can use it reliably.

Generalization also depends on training, learned parameters, context constraints, and the distribution of inputs encountered during inference.

## 13. Learned Absolute Positional Embeddings

Another approach is to assign a learned vector to each supported position.

Let \(E_{\text{pos}}\) be a trainable positional embedding table. The vector for position \(i\) is:

\[
p_i = E_{\text{pos}}[i]
\]

The input representation can then be formed as:

\[
z_i = x_i + E_{\text{pos}}[i]
\]

During training, the positional embedding parameters are updated through gradient-based optimization along with other model parameters.

### 13.1 Advantages

Learned absolute positional embeddings allow the model to determine which positional patterns are useful for its training objective.

They do not require the fixed sinusoidal formula and can adapt to the learned representation space.

### 13.2 Limitations

The model typically has a defined range of supported position indices. A learned embedding table cannot automatically provide trained representations for arbitrary new indices.

Some implementations extend or modify positional embeddings, but the details depend on the architecture and the chosen method.

Learned absolute embeddings therefore introduce a position-capacity and generalization consideration that must be evaluated against the expected context length.

## 14. Sinusoidal Versus Learned Absolute Positions

| Dimension | Sinusoidal encoding | Learned absolute embeddings |
|---|---|---|
| Position vectors | Generated by a fixed mathematical formula | Retrieved from trainable parameters |
| Learned position parameters | No separate trainable table required | Yes |
| Extending to new indices | Vectors can be calculated for new positions | Requires an explicit extension or alternative strategy |
| Adaptation to training data | Encoding formula remains fixed | Positional vectors adapt during training |
| Main consideration | The model must learn to use the fixed signal | Generalization beyond trained positions is not automatic |
| Architectural role | Supplies absolute positional information | Supplies absolute positional information |

Neither approach is universally superior. The appropriate choice depends on the model design, context-length requirements, training regime, and evaluation results.

The original Transformer used sinusoidal positional encoding. Later Transformer systems have explored several other positional strategies.

## 15. Absolute and Relative Positional Information

Absolute positional methods represent a token's position in the sequence. Relative positional methods represent information about relationships between positions, such as their distance or offset.

For example, the difference between positions 8 and 9 is one token, while the difference between positions 8 and 20 is twelve tokens.

A model may benefit from knowing that two tokens are adjacent, regardless of their absolute indices.

### 15.1 Absolute position

An absolute method supplies a representation associated with position \(i\).

This can help the model distinguish early, middle, and late positions in a sequence, depending on how the positional signal is encoded.

### 15.2 Relative position

A relative method supplies information about the relationship between a query position and a key position.

In attention, this information can influence the score, the representation being attended to, or another part of the attention calculation, depending on the design.

Relative methods can be useful when the relationship between positions matters more than a token's absolute index.

### 15.3 Why this distinction matters

Many language relationships depend on relative structure. For example, a word may relate to a nearby modifier or to a token several positions away.

An architecture that explicitly represents relative offsets offers a different inductive bias from one that only adds absolute positional vectors to the input.

However, relative positional methods do not eliminate every context-length or generalization challenge. Their behavior still depends on the specific design and training process.

This chapter establishes the conceptual distinction; detailed comparisons among modern positional methods belong to model-specific LLM engineering when needed.

## 16. How Multi-Head Attention and Positional Encoding Work Together

These mechanisms solve complementary problems.

Multi-head attention lets the model compute several learned sets of attention relationships. Positional information makes order-related signals available to those computations.

A simplified information flow is:

```text
**Token representations**
**Positional information**
When the architecture uses additive position representations
        ↓
**Input representations supplied to attention**
        ↓
**Multiple learned attention heads**
        ↓
**Concatenated and projected output**
```

This diagram illustrates an additive positional design. Other positional methods may inject positional information directly into the attention computation rather than adding it to the initial token representations.

The important engineering distinction is that the architecture must provide both useful content representations and the order-related information needed for its task.

## 17. Computational and Engineering Trade-Offs

### 17.1 Multi-head attention

For a standard multi-head attention layer with model dimension \(d_{\text{model}}\), sequence length \(n\), and conventional equal-sized heads, the major operations include:

- Input projections for queries, keys, and values.
- Query-key score computation.
- Softmax and value aggregation.
- Concatenation and output projection.

Under conventional dense projections, the projection and output operations have complexity on the order of \(O(nd_{\text{model}}^2)\), while the attention score and aggregation operations are approximately \(O(n^2d_{\text{model}})\).

Exact costs depend on dimensions, architecture variants, and implementation.

Increasing the number of heads while keeping the model dimension fixed does not automatically multiply the main dense projection parameter count by the number of heads, because the conventional implementation partitions the overall projection dimensions. However, head count can still affect kernel efficiency, memory access, and practical throughput.

### 17.2 Positional methods

Positional methods also introduce trade-offs:

- Fixed encodings avoid learning a separate vector for every supported absolute position.
- Learned absolute embeddings introduce trainable parameters tied to position indices.
- Relative methods may change attention-score computation or require additional positional operations.
- Different methods have different implications for context-length extension and generalization.

There is no universally optimal positional method. Selection should follow the model's expected input lengths, task requirements, training regime, and measured performance.

### 17.3 Production considerations

When evaluating an attention architecture for deployment, consider:

- Expected sequence-length distribution, not only the maximum context length.
- Memory consumption at realistic batch sizes.
- Latency and throughput under representative workloads.
- Numerical stability and implementation support.
- Whether the selected positional method behaves as expected at the target context lengths.
- Quality and generalization, measured alongside efficiency.

A theoretically elegant design is not automatically the best production choice. It must satisfy both modeling requirements and operational constraints.

## 18. Common Misconceptions

### Misconception 1: Each attention head has a predefined job

**Correction:** Heads learn their behavior through training. They may specialize, overlap, or become partly redundant.

### Misconception 2: More heads always improve model quality

**Correction:** Head count interacts with model dimension, per-head dimension, parameter budget, training, and hardware efficiency. More heads do not guarantee better representations.

### Misconception 3: Multi-head attention means stacking multiple Transformer layers

**Correction:** Multiple heads operate within one attention module. Multiple layers stack modules or blocks and transform representations sequentially across depth.

### Misconception 4: Attention inherently knows which token came first

**Correction:** Standard self-attention without positional or other order-aware information does not inherently encode sequence order.

### Misconception 5: Positional encoding contains the meaning of a token

**Correction:** Positional encoding supplies order-related information. It does not replace token representations or directly encode complete linguistic meaning.

### Misconception 6: Sinusoidal encoding guarantees generalization to longer contexts

**Correction:** The encoding can be calculated at new positions, but model behavior at longer contexts depends on learned parameters, training, and other architectural constraints.

### Misconception 7: Learned positional embeddings are always better because they are trainable

**Correction:** Trainability offers flexibility but does not guarantee superior quality or reliable extrapolation beyond the supported position range.

### Misconception 8: Absolute and relative position methods are equivalent

**Correction:** Absolute methods represent position indices, while relative methods represent relationships or offsets between positions. They introduce different inductive biases and computational choices.

## 19. Knowledge Check

Answer these questions in your own words before moving to Chapter 03.

1. What limitation of a single attention head motivates multi-head attention?
2. Why does each head have separate query, key, and value projection matrices?
3. Derive the multi-head attention operation from individual head outputs through the output projection.
4. Why is the per-head dimension often chosen so that the concatenated outputs match the model dimension?
5. Explain the difference between multiple attention heads and multiple Transformer layers.
6. Why does standard self-attention need positional information?
7. Compare sinusoidal positional encoding and learned absolute positional embeddings.
8. Explain why generating sinusoidal vectors for unseen positions does not guarantee reliable long-context behavior.
9. What is the conceptual difference between absolute and relative positional information?
10. Which computational costs depend quadratically on sequence length, and why does this matter for production?

### Applied engineering exercise

You are reviewing a Transformer design with:

- Model dimension: 768.
- Number of attention heads: 12.
- Expected sequence lengths: between 512 and 8,000 tokens.
- A requirement to evaluate inputs longer than those used in initial training.

Write a short design note that explains:

1. The conventional per-head dimension and why it is chosen.
2. Why the model needs positional information.
3. The trade-offs between fixed sinusoidal and learned absolute positional embeddings.
4. What additional questions you would ask before selecting a positional strategy.
5. Which performance and quality measurements you would collect before approving the design.

Do not assume that a positional encoding which can be computed at a new index necessarily supports reliable extrapolation. Separate mathematical availability from empirically demonstrated model behavior.

## 20. Summary

Multi-head attention extends the single-head attention mechanism by using multiple sets of learned query, key, and value projections. Each head computes an attention output, the outputs are concatenated, and a learned output projection combines them into the shared representation space.

Positional encoding addresses a different limitation: standard self-attention does not inherently encode sequence order. Positional information can be introduced through fixed sinusoidal encodings, learned absolute embeddings, or other methods such as relative positional representations.

The key ideas are:

- Multiple heads provide multiple learned attention spaces, not guaranteed semantic specialists.
- The head outputs are concatenated and projected to form the multi-head output.
- Attention heads and Transformer layers represent different architectural dimensions.
- Positional information supplies order-related signals that content representations alone may not provide.
- Sinusoidal and learned absolute encodings differ in how positional vectors are produced and adapted.
- Relative positional methods represent relationships between positions rather than only absolute indices.
- Long-context architecture decisions require both modeling evaluation and computational measurements.

The next chapter places these mechanisms inside the Transformer block and examines how information flows through the complete architecture.

## 21. References and Further Reading

- Vaswani, A. et al. (2017). *Attention Is All You Need*. Advances in Neural Information Processing Systems.

The original Transformer paper describes scaled dot-product attention, multi-head attention, and the sinusoidal positional encoding used in its architecture.

This chapter focuses on foundational mechanisms. Implementation-specific positional methods and optimized attention variants should be examined separately when evaluating a particular model or production workload.
