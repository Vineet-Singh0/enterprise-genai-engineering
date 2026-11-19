# 01 — Attention and Self-Attention

## 1. Purpose

Attention is a mechanism that allows a neural network to determine which parts of an input are most relevant when computing a representation for a particular element.

In language, the meaning of a word often depends on other words in the same sentence. A model therefore needs a way to use surrounding context rather than representing every word independently.

This chapter establishes the conceptual foundations of attention and self-attention. It explains the problem they solve, how the mechanism works, how attention weights are computed, and what the mechanism does—and does not—guarantee.

The chapter focuses on the underlying mechanism rather than a particular framework or model implementation.

## 2. Learning Objectives

After completing this chapter, you should be able to:

- Explain why context-independent word representations are insufficient for many language tasks.
- Describe the problem attention was designed to address.
- Distinguish attention from self-attention.
- Explain queries, keys, and values conceptually.
- Derive the scaled dot-product attention equation.
- Explain how similarity scores become attention weights.
- Interpret an attention-weight matrix.
- Explain the purpose of scaling and softmax.
- Identify important assumptions, limitations, and computational costs.
- Explain how attention prepares the foundation for multi-head attention and Transformer architecture.

## 3. Prerequisites and Connections

This chapter builds on ideas from earlier AIF modules:

- **AIF-03 — Machine Learning Foundations:** model inputs, learned parameters, training objectives, and generalization.
- **AIF-04 — Deep Learning Foundations:** neural-network representations, forward propagation, activation functions, and gradient-based optimization.
- **AIF-05 — Representation Learning:** embeddings, vector spaces, similarity, and representation quality.
- **AIF-06 — Sequence Modeling:** sequential data, recurrent neural networks, LSTMs, and the limitations of recurrent processing.

The most important prerequisite is the distinction between a token and its representation. A token is a discrete unit of text; a representation is a numerical vector the model can process.

Attention operates on representations. It does not directly reason over raw words.

## 4. The Problem: Representations Need Context

Consider the sentence:

> The animal did not cross the road because it was tired.

To interpret the pronoun *it*, a language model needs information about the other words in the sentence. The meaning of a token cannot always be determined from that token alone.

Now consider:

> The animal did not cross the road because it was busy.

The word *it* appears in a similar position, but the sentence's interpretation and implications differ. More generally, words such as *bank*, *charge*, and *light* can have different meanings depending on their context.

A representation that captures only a token's identity is therefore insufficient for many language-understanding tasks.

### 4.1 Context-independent representations

Imagine that each token is mapped to a fixed embedding:

\[
x_1, x_2, \ldots, x_n
\]

Here, \(x_i\) is the input vector for token \(i\).

If the same token always receives the same initial embedding, that embedding does not by itself encode all the contextual information needed to interpret the token in every sentence.

A model needs a mechanism to combine information from relevant parts of the input and construct a context-sensitive representation.

### 4.2 The contextualization problem

Given a sequence of input representations,

\[
X = [x_1, x_2, \ldots, x_n]
\]

we want to compute output representations,

\[
Z = [z_1, z_2, \ldots, z_n]
\]

where each output \(z_i\) can incorporate information from other input positions.

Conceptually:

\[
z_i = f(x_i, x_1, x_2, \ldots, x_n)
\]

The function \(f\) must determine which other positions contribute to the representation of token \(i\), and by how much.

Attention provides a learnable, input-dependent way to perform this information selection and aggregation.

## 5. What Is Attention?

Attention is a mechanism that computes a weighted combination of value vectors. The weights depend on the relationship between a query and a collection of keys.

At a high level, attention performs three operations:

1. **Score:** determine how relevant each key is to a query.
2. **Normalize:** convert the scores into weights.
3. **Aggregate:** combine the value vectors using those weights.

A useful mental model is a search-and-aggregation process.

- The **query** describes what information is being sought.
- The **keys** describe what each available item can match against.
- The **values** contain the information that can be retrieved and combined.

These are mathematical roles within a neural network, not necessarily literal natural-language questions, labels, or database records.

### 5.1 Attention as dynamic information selection

Suppose a system has several information vectors available. A fixed weighted average would combine them in the same way every time.

Attention instead computes weights from the current query and keys. Different inputs can therefore produce different weight distributions.

This makes attention **input-dependent**.

For example, when building a representation for a token, the model might assign relatively high weight to a nearby modifier, a related noun, or a more distant token. Which relationship matters depends on the learned representations and the current input.

Attention does not require the model to use the same positions equally for every token.

### 5.2 Attention is not automatically understanding

Attention provides a computational mechanism for selecting and combining information. It does not, by itself, guarantee:

- Correct interpretation of a sentence.
- Correct factual reasoning.
- Reliable identification of semantic relationships.
- A human-interpretable explanation of the model's decision.

The quality of the resulting representation depends on the learned parameters, input representations, training data, training objective, and surrounding architecture.

## 6. From Attention to Self-Attention

Attention is a general mechanism. The source of the queries, keys, and values determines the particular attention arrangement.

In **self-attention**, the queries, keys, and values are derived from the same input sequence.

For an input sequence \(X\), learned transformations produce:

\[
Q = XW_Q
\]

\[
K = XW_K
\]

\[
V = XW_V
\]

where:

- \(Q\) is the query matrix.
- \(K\) is the key matrix.
- \(V\) is the value matrix.
- \(W_Q\), \(W_K\), and \(W_V\) are learned parameter matrices.

The notation assumes the input representations are arranged as rows. Other conventions may transpose the matrices, but the underlying operation is equivalent.

The key idea is that the same sequence supplies all three sets of vectors, while separate learned projections allow the model to use different representations for matching and information retrieval.

### 6.1 Why use separate projections?

It might seem simpler to compare input vectors directly and aggregate those same vectors. Learned projections give the model more flexibility.

The query projection learns how a position should express the information it needs. The key projection learns how positions should represent their relevance to potential queries. The value projection learns what information should be contributed when a position receives attention.

These roles are related but not identical.

For example, two tokens might be useful to match against one another for one kind of relationship, while the information contributed by each token should be represented differently.

The projections allow training to learn these distinctions.

### 6.2 Self-attention is not restricted to nearby tokens

A recurrent model processes a sequence through repeated state updates. Self-attention can directly compare a position's query with keys from multiple positions in the sequence.

For a sequence with \(n\) tokens, a standard full self-attention operation can calculate relationships between every query position and every key position.

This includes:

- A token attending to itself.
- A token attending to nearby tokens.
- A token attending to distant tokens.

Whether a particular position is allowed to attend to another depends on the attention mask and architecture. Full, unmasked self-attention is not the only possible configuration.

## 7. The Query, Key, and Value Model

The query-key-value model is the central mental model for understanding attention.

### 7.1 Query

A query vector represents the current position's matching requirements in the learned attention space.

For each query position, the mechanism asks: how compatible is this query with each available key?

The query is not a hand-written instruction. It is computed from the input through learned parameters.

### 7.2 Key

A key vector represents a position in the space used for matching.

The mechanism compares a query with candidate keys to obtain relevance scores. A larger score generally means greater compatibility under the learned scoring function.

A key is not necessarily a human-readable description of a token. Its meaning emerges from the learned parameters and training process.

### 7.3 Value

A value vector contains the information contributed by a position when it receives attention.

Once the mechanism computes a weight for each position, it uses those weights to combine the values.

The values are not the attention weights themselves. Keys help calculate the weights; values are aggregated using them.

### 7.4 Why the distinction matters

Separating matching from information contribution makes attention more expressive than simply averaging input embeddings according to their raw similarity.

The model can learn one representation for deciding *where to look* and another for deciding *what information to bring back*.

This separation is an architectural capability, not a guarantee that the learned roles will be cleanly interpretable.

## 8. Scaled Dot-Product Attention

The standard scaled dot-product attention operation is:

\[
\operatorname{Attention}(Q,K,V)
=
\operatorname{softmax}
\left(
\frac{QK^\top}{\sqrt{d_k}}
\right)V
\]

where:

- \(Q\) contains query vectors.
- \(K\) contains key vectors.
- \(V\) contains value vectors.
- \(d_k\) is the dimensionality of each key vector.
- \(K^\top\) denotes the transpose of the key matrix.
- Softmax is applied across the key positions for each query position.

The equation can be understood as scoring, normalization, and aggregation.

### 8.1 Step 1 — Compute compatibility scores

The matrix product

\[
S = QK^\top
\]

computes dot products between every query and every key.

If the sequence has \(n\) positions, then \(S\) has shape \(n \times n\) for standard self-attention with one query and key per position.

The element \(S_{ij}\) is the score for query position \(i\) against key position \(j\):

\[
S_{ij} = q_i \cdot k_j
\]

A dot product measures alignment in the learned vector space. Its magnitude and sign depend on the vectors and their learned representations.

These raw scores are not yet probabilities and do not have to sum to one.

### 8.2 Step 2 — Scale the scores

The scores are divided by \(\sqrt{d_k}\):

\[
\widetilde{S} = \frac{QK^\top}{\sqrt{d_k}}
\]

Why scale?

As the dimensionality of query and key vectors increases, dot products can become large in magnitude under common initialization and distribution assumptions. Large logits can cause softmax to become highly concentrated, reducing useful gradient signals in some regimes.

Scaling helps control the magnitude of the scores before normalization.

This factor does not guarantee well-behaved gradients in every situation. It is a design choice that addresses a common numerical and optimization concern.

### 8.3 Step 3 — Apply softmax

For each query position \(i\), softmax converts its scores over the key positions into a normalized distribution:

\[
\alpha_{ij}
=
\frac{\exp(\widetilde{S}_{ij})}
{\sum_{m=1}^{n}\exp(\widetilde{S}_{im})}
\]

For each query position, the weights satisfy:

\[
\sum_{j=1}^{n}\alpha_{ij}=1
\]

and, for finite unmasked scores, each weight is positive.

The resulting matrix \(\alpha\) contains the attention weights.

A larger weight means that the corresponding value contributes more to that query's weighted aggregation. It should not automatically be interpreted as a direct measure of semantic importance or causal influence.

### 8.4 Step 4 — Aggregate the values

The final operation is:

\[
Z = \alpha V
\]

For a single query position \(i\):

\[
z_i = \sum_{j=1}^{n}\alpha_{ij}v_j
\]

The output representation is a weighted sum of the value vectors.

If one position receives most of the attention weight, its value contributes most strongly to the output. If the weights are distributed more evenly, the output combines information from multiple positions.

The output remains a learned representation. It is not necessarily a word, a probability, or a complete interpretation.

## 9. Worked Numerical Example

Consider one query and three keys. For simplicity, assume the scores have already been scaled:

\[
s = [2, 1, 0]
\]

Applying softmax gives approximately:

\[
\operatorname{softmax}(s)
=
[0.665,\ 0.245,\ 0.090]
\]

The weights sum to approximately one.

Suppose the corresponding value vectors are:

\[
v_1=[1,0],\quad
v_2=[0,2],\quad
v_3=[3,1]
\]

The output is:

\[
z = 0.665v_1 + 0.245v_2 + 0.090v_3
\]

Computing each component:

\[
z_1 = 0.665(1)+0.245(0)+0.090(3)
\approx 0.935
\]

\[
z_2 = 0.665(0)+0.245(2)+0.090(1)
\approx 0.580
\]

Therefore:

\[
z \approx [0.935,\ 0.580]
\]

The output combines information from all three values, but the first value contributes the most because it has the largest attention weight.

This example illustrates the mechanics only. The scores were supplied directly; in a trained model, they are produced from queries and keys through learned representations.

## 10. Understanding the Attention Matrix

For a sequence of \(n\) positions, the attention-weight matrix is typically an \(n \times n\) matrix in standard full self-attention.

Each row corresponds to a query position. Each column corresponds to a key/value position.

For example:

\[
A =
\begin{bmatrix}
0.7 & 0.2 & 0.1\\
0.1 & 0.6 & 0.3\\
0.2 & 0.2 & 0.6
\end{bmatrix}
\]

Each row sums to one, subject to numerical rounding.

The first row means that query position 1 assigns weights of 0.7, 0.2, and 0.1 to positions 1, 2, and 3, respectively.

It does **not** mean that the first token is 70% important in the sentence. The weights describe how one attention operation distributes its aggregation over available values for a specific query.

### 10.1 Attention weights depend on the input and parameters

Change the input representations or learned projection matrices, and the attention weights can change.

Consequently, the same token may receive different contextual information in different sentences or positions.

This is one reason self-attention can produce context-dependent representations from initially shared token embeddings.

### 10.2 Attention weights are not complete explanations

Attention weights can help inspect the information-routing behavior of a model, but they are not a complete explanation of its prediction.

The final output may also depend on:

- The value vectors.
- The learned query, key, and value projections.
- Other attention heads and layers.
- Residual connections and feed-forward transformations in the surrounding architecture.
- The downstream task and decision process.

A high attention weight alone does not establish that a token caused a prediction or that the model correctly understood a relationship.

## 11. Self-Attention and Sequence Position

A subtle question follows from the equations: if self-attention compares learned vectors, how does the model know which token came first?

The attention mechanism described so far does not inherently encode the ordering of a sequence. If the same set of input vectors is permuted and the corresponding outputs are permuted consistently, standard unmasked self-attention without position-dependent information does not independently identify the original order.

Language, however, is order-sensitive.

Compare:

- “The dog chased the cat.”
- “The cat chased the dog.”

The same words appear, but their arrangement changes the meaning.

Transformer systems therefore need a way to supply positional information to the model. Positional encoding and related techniques are covered in Chapter 02, **Multi-Head Attention and Positional Encoding**.

The key distinction is:

- **Self-attention** determines how information from positions is combined.
- **Positional information** helps the model distinguish sequence order and position.

These mechanisms work together but solve different problems.

## 12. Attention Compared with Recurrent Processing

AIF-06 introduced recurrent neural networks and LSTMs, which process sequential inputs through state updates. Attention offers a different way to create contextual representations.

| Dimension | Recurrent processing | Full self-attention |
|---|---|---|
| Information flow | Through successive hidden states | Direct query-key interactions across permitted positions |
| Distant dependencies | Information must pass through recurrent computation | A position can directly use a distant position's value |
| Sequence processing | Naturally sequential across time steps | Position computations can be parallelized during training when the architecture permits |
| Pairwise interaction cost | Depends on recurrent computation and hidden-state design | Standard full attention computes \(n^2\) query-key scores |
| Position information | Order is reflected in recurrent processing | Requires positional information or another order-aware mechanism |
| Main trade-off | Sequential dependency limits parallelism | Pairwise interactions can be expensive for long sequences |

This is not a claim that attention is universally better than recurrence. Each architecture has different computational and modeling trade-offs.

Self-attention addresses important limitations of recurrent information flow, especially the need to route information through a sequence of intermediate states. In exchange, standard full attention incurs quadratic growth in the number of pairwise query-key interactions.

## 13. Computational Characteristics

For sequence length \(n\), standard full self-attention constructs an \(n \times n\) score matrix.

The number of query-key interactions therefore grows proportionally to:

\[
O(n^2)
\]

If the model dimension is \(d\), the score computation and value aggregation also depend on the feature dimension. A common approximate complexity description for these operations is \(O(n^2d)\), excluding projection costs and other architecture components.

The attention-weight matrix itself requires \(O(n^2)\) storage when materialized.

### 13.1 Why sequence length matters

If sequence length doubles from \(n\) to \(2n\), the number of pairwise interactions grows from \(n^2\) to:

\[
(2n)^2 = 4n^2
\]

The pairwise interaction count therefore becomes four times as large.

This has implications for:

- Training memory.
- Training compute.
- Inference latency.
- Maximum practical context length.
- Batch size and accelerator utilization.

Actual runtime and memory depend on implementation, hardware, attention kernels, masking, batching, and whether intermediate matrices are materialized.

Optimized attention implementations can reduce memory overhead and improve throughput without changing the conceptual attention operation. Other attention variants alter the interaction pattern itself. Those engineering optimizations and model-level choices belong in later LLM and Production AI Engineering topics.

## 14. Masks and Restricted Attention

Not every attention operation permits every query to access every key.

An attention mask can exclude positions from contributing to the normalized distribution. In implementations, excluded positions are typically assigned a score that effectively removes them from softmax.

Two important ideas are:

- **Padding masks:** prevent attention to positions added to make sequences the same length.
- **Causal masks:** prevent a position from attending to future positions.

Causal masking is essential for autoregressive generation when a token's prediction must not use future target tokens during training.

For example, when predicting token \(i\), a causal attention pattern permits access to positions up to \(i\), but not positions after \(i\).

Masks change which interactions are permitted; they do not change the basic query-key-value interpretation of attention.

The detailed architectural use of causal masking and other information-flow constraints is covered in Chapter 03, **Transformer Architecture and Information Flow**, and Chapter 04, **Encoder-Decoder and Decoder-Only Architectures**.

## 15. What Attention Does Not Solve by Itself

Attention is powerful, but it is one mechanism within a larger neural architecture.

Attention alone does not provide all the capabilities required for a language model.

### 15.1 It does not automatically encode position

Without positional information or another order-aware mechanism, standard self-attention does not independently represent sequence order.

### 15.2 It does not guarantee long-range reasoning

A model can connect distant positions computationally, but that does not guarantee it learns the correct dependency or uses the information effectively.

### 15.3 It does not replace the rest of the network

Transformer blocks combine attention with other components, including feed-forward transformations, residual connections, and normalization. These components have distinct roles in the architecture and training dynamics.

Their arrangement and information flow are covered in Chapter 03.

### 15.4 It does not remove all scaling problems

Full self-attention's pairwise interaction count grows quadratically with sequence length. Longer context windows can therefore require substantial memory and compute.

### 15.5 It does not make attention weights self-explanatory

The weights reveal one part of the computation, not a complete causal or semantic explanation of the model's behavior.

## 16. Common Engineering Misconceptions

### Misconception 1: Attention and self-attention are interchangeable terms

**Correction:** Self-attention is a particular arrangement in which queries, keys, and values are derived from the same input sequence. Other attention arrangements can use different sources.

### Misconception 2: Queries, keys, and values are simply the input embeddings

**Correction:** In standard learned self-attention, they are derived through separate learned projections of the input representations.

### Misconception 3: Attention weights are calculated directly from raw word similarity

**Correction:** The standard mechanism calculates scores from learned query and key vectors. These vectors are shaped by the model's parameters and training process.

### Misconception 4: The largest attention weight identifies the most important word

**Correction:** It identifies the largest weight in one particular attention distribution. It is not a universal importance score or a complete explanation of the model's prediction.

### Misconception 5: Attention weights are probabilities that a token is correct

**Correction:** Softmax normalizes the weights over available key positions for each query. These weights are not probabilities that a word is correct, true, or relevant to the final answer.

### Misconception 6: Self-attention automatically understands word order

**Correction:** Standard self-attention requires positional information or another order-aware mechanism to distinguish sequence arrangement.

### Misconception 7: Attention makes sequence length computationally irrelevant

**Correction:** Full self-attention permits direct interactions across positions, but the number of pairwise interactions grows quadratically with sequence length.

### Misconception 8: Attention alone is a complete Transformer

**Correction:** Attention is a core component, not the complete architecture. Transformer blocks include additional components that support representation transformation and training.

## 17. Engineering Decision Perspective

When evaluating an attention-based design, an engineer should ask more than whether attention can model relationships.

Consider these questions:

1. **What information should each position be able to access?**  
   This determines whether full, causal, or otherwise restricted attention is appropriate.

2. **Does the task require order-sensitive representations?**  
   If so, how will positional information be introduced?

3. **What sequence lengths are expected in production?**  
   The answer affects memory, compute, latency, and architecture selection.

4. **What does the model need to retrieve from other positions?**  
   The query-key-value separation allows matching and information contribution to be learned separately.

5. **How will the behavior be evaluated?**  
   Attention visualizations can be diagnostic, but task-level evaluation and targeted tests are still necessary.

6. **What is the simplest architecture that satisfies the requirements?**  
   Attention is not automatically the best choice for every sequential problem. The decision should reflect the task, data, constraints, and deployment environment.

These questions connect the mathematical mechanism to real system design without prematurely introducing framework-specific implementation details.

## 18. Relationship to Later Chapters

This chapter established the basic attention operation and the role of self-attention.

The next chapters build on it:

- **Chapter 02 — Multi-Head Attention and Positional Encoding:** explores multiple attention projections and how sequence position is represented.
- **Chapter 03 — Transformer Architecture and Information Flow:** places attention inside a Transformer block and explains the interactions among its components.
- **Chapter 04 — Encoder-Decoder and Decoder-Only Architectures:** explains how architectural arrangements and attention constraints support different modeling objectives.
- **Chapter 05 — Transformer Training, Inference, and Scaling:** connects the architecture to learning, generation, and computational scaling.

Model-specific APIs, production serving, retrieval pipelines, and agent orchestration are intentionally outside this chapter's scope.

## 19. Knowledge Check

Answer these in your own words before moving to Chapter 02.

1. Why is a fixed token embedding insufficient for representing every use of a word?
2. What problem does attention solve, and what does it leave unsolved?
3. Explain the different roles of queries, keys, and values without referring only to their equations.
4. Starting from \(Q\), \(K\), and \(V\), explain every step in scaled dot-product attention.
5. Why are the raw dot-product scores scaled before softmax?
6. What does one row of an attention-weight matrix represent?
7. Why are attention weights not a complete explanation of a model's prediction?
8. Why does standard self-attention need positional information for order-sensitive language?
9. If sequence length doubles, what happens to the number of pairwise interactions in full self-attention, and why?
10. What trade-off does full self-attention make compared with recurrent processing?

### Applied reasoning exercise

Suppose you are designing a language model that processes sequences of up to 16,000 tokens.

Explain:

- Why full self-attention may become expensive.
- Which resource constraints you would measure before selecting an implementation.
- Why reducing the number of attention interactions might affect model behavior.
- Why you would not select an alternative attention mechanism based on speed alone.

Do not start by naming a framework or library. Begin with the computational and modeling requirements.

## 20. Summary

Attention computes a weighted combination of value vectors using query-key compatibility scores. Self-attention applies this mechanism when queries, keys, and values are derived from the same input sequence.

Scaled dot-product attention follows the pattern:

\[
\boxed{
\operatorname{softmax}
\left(
\frac{QK^\top}{\sqrt{d_k}}
\right)V
}
\]

The key ideas to retain are:

- Queries and keys determine the attention weights.
- Values supply the information that is aggregated.
- Softmax normalizes scores over available key positions.
- Self-attention enables direct interactions between permitted sequence positions.
- Standard full self-attention has quadratic pairwise interaction growth with sequence length.
- Positional information is needed for standard self-attention to represent sequence order.
- Attention is a component of a larger architecture, not a guarantee of understanding or a complete explanation of model behavior.

The next step is to understand how multiple attention heads and positional information extend this mechanism.

## 21. References and Further Reading

The foundational reference for scaled dot-product attention and the Transformer architecture is:

- Vaswani, A. et al. (2017). *Attention Is All You Need*. Advances in Neural Information Processing Systems.

This chapter presents the core mechanism at a conceptual and mathematical level. Implementation-specific behavior, optimized attention kernels, and newer attention variants should be studied separately when required by a concrete engineering task.
