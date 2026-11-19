# Embedding Geometry, Interpretation, and Quality

## 1. Purpose and Scope

An embedding is a learned vector representation. Understanding its values requires more than inspecting its dimensions or calculating similarity scores. Engineers must reason about the geometry of the representation space, understand what common measurements reveal, and recognize what those measurements cannot establish.

This chapter explains how to interpret embedding geometry and evaluate claims made about learned representations.

By the end of this chapter, you should be able to:

- Explain vector magnitude, direction, similarity, and distance.
- Calculate and interpret cosine similarity and Euclidean distance.
- Explain how normalization affects geometric comparisons.
- Describe how training influences the structure of embedding spaces.
- Explain why individual dimensions rarely have simple, universal meanings.
- Interpret nearest-neighbor results without overclaiming.
- Use small numerical experiments to inspect geometric relationships.
- Distinguish geometric diagnostics from evidence of task-specific representation quality.

### Scope boundaries

This chapter focuses on geometric interpretation and the limitations of evidence obtained from embedding spaces.

- Chapter 3 explains how embedding representations are learned.
- Chapter 4 explains how representations participate in model computation.
- Chapter 6 develops the integrated practical inspection workflow.
- LLM-08 owns rigorous evaluation methodology and benchmarking.
- RET owns retrieval-specific embedding pipelines, vector indexes, and retrieval evaluation.

## 2. What Does Embedding Geometry Mean?

An embedding space is a vector space in which learned representations are expressed.

Suppose a model maps tokens to vectors in a \(d\)-dimensional space:

\[
\mathbf{e}_i \in \mathbb{R}^{d}
\]

Each vector contains \(d\) numerical coordinates. These coordinates jointly represent a learned state associated with the token or representation being inspected.

Geometry provides ways to describe relationships between vectors, including:

- **Magnitude:** how large a vector is.
- **Direction:** the orientation of a vector relative to other vectors.
- **Similarity:** a measure of how closely two vectors relate under a specified metric.
- **Distance:** a measure of separation between two vectors.

These measurements are mathematical properties of the vectors. Their semantic or task-specific interpretation depends on how the representations were learned and how they are used.

For example, two vectors may point in similar directions, but that observation alone does not prove that their associated tokens have interchangeable meanings.

## 3. Vector Magnitude and Direction

Consider two vectors:

\[
\mathbf{x}=[1,0], \qquad \mathbf{y}=[5,0]
\]

Both vectors point in the same direction, but their magnitudes differ.

The Euclidean norm of a vector \(\mathbf{x}\) is:

\[
\|\mathbf{x}\|_2 =
\sqrt{\sum_{i=1}^{d}x_i^2}
\]

For the example:

\[
\|\mathbf{x}\|_2=1,\qquad
\|\mathbf{y}\|_2=5
\]

The vectors have identical direction but different magnitude.

This distinction matters because different similarity measures respond differently to magnitude.

- Cosine similarity compares direction.
- Euclidean distance measures direct separation and is affected by magnitude.
- Dot product depends on both magnitude and relative direction.

No single measurement is universally best. The appropriate interpretation depends on the model, the representation being inspected, and the question being asked.

## 4. Similarity and Distance Are Different Concepts

Similarity and distance are related but should not be treated as interchangeable.

A similarity score generally increases as a relationship becomes stronger under the selected measure. A distance generally decreases as two points become closer.

However, the meaning and scale of either measurement depend on its definition.

| Measurement | What it captures | Important limitation |
|---|---|---|
| Dot product | Alignment combined with vector magnitudes | Magnitude changes can dominate comparisons |
| Cosine similarity | Relative direction | Ignores vector magnitude |
| Euclidean distance | Straight-line separation | Sensitive to magnitude and coordinate scale |

Before interpreting a score, identify the metric that produced it. A score of `0.8` does not have a universal interpretation across different metrics, models, or tasks.

## 5. Cosine Similarity

Cosine similarity measures the cosine of the angle between two nonzero vectors:

\[
\operatorname{cos\_sim}(\mathbf{x},\mathbf{y}) =
\frac{\mathbf{x}\cdot\mathbf{y}}
{\|\mathbf{x}\|_2\|\mathbf{y}\|_2}
\]

For nonzero real-valued vectors, the result lies between \(-1\) and \(1\).

- A value near \(1\) indicates similar directions.
- A value near \(0\) indicates orthogonal directions.
- A value near \(-1\) indicates opposite directions.

These are geometric interpretations, not universal semantic labels.

### Example

Consider:

\[
\mathbf{x}=[1,0],\quad
\mathbf{y}=[5,0],\quad
\mathbf{z}=[0,1]
\]

The vectors \(\mathbf{x}\) and \(\mathbf{y}\) point in the same direction, so their cosine similarity is \(1\).

The vectors \(\mathbf{x}\) and \(\mathbf{z}\) are orthogonal, so their cosine similarity is \(0\).

This illustrates that cosine similarity is insensitive to positive scaling of a vector. It does not establish that cosine similarity is the best metric for every embedding system.

### Engineering interpretation

Cosine similarity is useful when direction is meaningful and differences in magnitude should not dominate the comparison.

However, do not assume that a model was trained to make cosine similarity meaningful for every possible pair of internal token embeddings. The suitability of the metric depends on the representation and its intended use.

Cosine similarity is undefined when either input vector has zero magnitude. Implementations may return a guarded value or apply numerical safeguards, so inspect the behavior of the library being used.

## 6. Euclidean Distance

Euclidean distance measures the straight-line distance between two vectors:

\[
d(\mathbf{x},\mathbf{y}) =
\|\mathbf{x}-\mathbf{y}\|_2
\]

Equivalently:

\[
d(\mathbf{x},\mathbf{y}) =
\sqrt{\sum_{i=1}^{d}(x_i-y_i)^2}
\]

Using the previous vectors:

\[
d(\mathbf{x},\mathbf{y})=4
\]

and

\[
d(\mathbf{x},\mathbf{z})=\sqrt{2}
\]

Although \(\mathbf{x}\) and \(\mathbf{y}\) have cosine similarity \(1\), their Euclidean distance is nonzero because their magnitudes differ.

This demonstrates why a metric must be selected deliberately rather than because it is convenient or familiar.

## 7. Normalization and Its Effects

L2 normalization scales a nonzero vector to unit magnitude:

\[
\hat{\mathbf{x}} =
\frac{\mathbf{x}}{\|\mathbf{x}\|_2}
\]

After normalization:

\[
\|\hat{\mathbf{x}}\|_2=1
\]

Normalization removes magnitude differences while preserving direction.

For two unit-normalized vectors, the relationship between cosine similarity and Euclidean distance is:

\[
\|\hat{\mathbf{x}}-\hat{\mathbf{y}}\|_2^2
=2-2\operatorname{cos\_sim}(\mathbf{x},\mathbf{y})
\]

Therefore, cosine similarity and Euclidean distance induce equivalent pairwise rankings for unit-normalized vectors, with the ranking direction reversed.

This equivalence depends on both vectors being normalized to unit length. It should not be assumed for arbitrary unnormalized vectors.

### When normalization helps

Normalization can make directional comparisons easier to interpret when vector magnitude is not intended to influence ranking.

### When normalization can mislead

If vector magnitude carries useful information in a particular model or application, discarding it may remove a meaningful signal. Normalization should therefore be treated as a modeling decision, not an automatic improvement.

A zero vector cannot be normalized using the formula above. Practical implementations must handle that case explicitly.

## 8. How Training Shapes Embedding Geometry

Embedding geometry is not an arbitrary arrangement of points. It emerges from parameter initialization, the training objective, the data distribution, and the optimization process.

Chapter 3 explains the learning mechanics in detail. The key connection here is that the objective influences which relationships become useful to the model.

A language-model training objective can encourage representations that support prediction within their architectural context. This does not guarantee that every pairwise distance or direction will correspond to a human-interpretable semantic relationship.

Several consequences follow:

- Frequently encountered patterns may influence the learned representations differently from rare patterns.
- The same token can participate in different contextual representations after subsequent model layers.
- Different models can learn different geometries from different data, architectures, and objectives.
- A change in training or fine-tuning can alter geometric relationships.

### Geometry is not the same as representation quality

**A geometrically coherent embedding space is not necessarily a high-quality representation for a particular task.**

Nearest neighbors may look plausible while the representation performs poorly for the intended downstream use. Conversely, a useful representation does not have to produce intuitively obvious neighbors for every token.

Geometric inspection is diagnostic evidence. It can reveal patterns, anomalies, or hypotheses worth investigating, but it does not establish task-specific quality on its own.

Determining whether a representation meets a particular task's requirements needs task-appropriate evidence. Rigorous evaluation design and benchmarking belong to LLM-08 and should not be replaced by visual inspection or a few similarity examples.

## 9. Interpreting Individual Dimensions

A \(d\)-dimensional embedding contains \(d\) coordinates, but this does not imply that each coordinate represents a distinct human-readable feature.

For example, it is generally unsafe to assume that one dimension represents sentiment, another represents location, and another represents grammatical role.

Learned representations can distribute information across multiple dimensions. Their interpretation may depend on combinations of coordinates and on the transformations applied by later layers.

### Practical implications

- Do not assign semantic labels to dimensions merely by inspecting a few values.
- Do not assume that the same dimension has the same meaning across different models.
- Do not assume that changing one coordinate has an isolated, easily predictable semantic effect.
- Treat dimension-level explanations as hypotheses requiring evidence.

A representation can be useful even when its individual coordinates are not directly interpretable.

## 10. Nearest Neighbors and Their Limitations

Nearest-neighbor inspection identifies vectors that rank closest to a selected vector under a chosen metric.

This can be a useful exploratory technique for investigating an embedding table.

However, the result depends on several factors:

1. **Representation choice:** initial token embeddings and contextual hidden states are not interchangeable.
2. **Metric choice:** cosine similarity and Euclidean distance may produce different rankings for unnormalized vectors.
3. **Vocabulary and tokenization:** a token may represent a word fragment, punctuation, or another token unit rather than a complete word.
4. **Frequency and training distribution:** learned patterns reflect the data and objective used during training.
5. **Model state:** different checkpoints or fine-tuned versions may produce different neighborhoods.

Nearest neighbors are therefore evidence about the inspected vectors under a particular configuration—not proof of semantic equivalence or general model quality.

A useful inspection records which model, representation layer, token IDs, preprocessing choices, and metric were used. This makes the observation reproducible and limits accidental overinterpretation.

## 11. Practical Geometry Inspection with NumPy

The following small experiment demonstrates how cosine similarity and Euclidean distance behave. These are manually defined vectors, not embeddings from a trained language model.

```python
import numpy as np

x = np.array([1.0, 0.0])
y = np.array([5.0, 0.0])
z = np.array([0.0, 1.0])


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    denominator = np.linalg.norm(a) * np.linalg.norm(b)

    if denominator == 0:
        raise ValueError("Cosine similarity is undefined for zero vectors.")

    return float(np.dot(a, b) / denominator)


print("cosine(x, y):", cosine_similarity(x, y))
print("cosine(x, z):", cosine_similarity(x, z))

print("euclidean(x, y):", np.linalg.norm(x - y))
print("euclidean(x, z):", np.linalg.norm(x - z))
```

Expected results, subject to normal floating-point formatting:

```text
cosine(x, y): 1.0
cosine(x, z): 0.0
euclidean(x, y): 4.0
euclidean(x, z): 1.4142135623730951
```

### What this experiment establishes

- Cosine similarity can remain unchanged when a vector is scaled by a positive factor.
- Euclidean distance changes when the vector magnitude changes.
- The choice of metric affects the interpretation of a pairwise relationship.

### What this experiment does not establish

It does not demonstrate semantic learning, language-model embedding quality, or downstream task performance. Those conclusions require evidence from an appropriate model and task.

## 12. Inspecting an Embedding Table with PyTorch

An embedding table can be inspected numerically, but its values must be interpreted in context.

```python
import torch
from torch import nn
import torch.nn.functional as F

torch.manual_seed(7)

vocab_size = 20
embedding_dim = 8

embedding = nn.Embedding(
    num_embeddings=vocab_size,
    embedding_dim=embedding_dim,
)

token_ids = torch.tensor([2, 5, 9])
vectors = embedding(token_ids)

print("Embedding table shape:", tuple(embedding.weight.shape))
print("Selected vectors shape:", tuple(vectors.shape))

vector_a = vectors[0]
vector_b = vectors[1]

cosine = F.cosine_similarity(
    vector_a.unsqueeze(0),
    vector_b.unsqueeze(0),
    dim=1,
)

distance = torch.linalg.vector_norm(vector_a - vector_b)

print("Cosine similarity:", cosine.item())
print("Euclidean distance:", distance.item())
```

The table has shape \((V,d)\), and the selected vectors have shape \((L,d)\) for this one-dimensional input of \(L\) token IDs.

The example demonstrates mechanics only. The table is randomly initialized; its values do not represent a trained language model's learned semantic structure.

For a real model, inspect the correct embedding component and representation stage. Chapter 6 develops that practical workflow.

## 13. Internal Token Embeddings Versus Retrieval Embeddings

The word *embedding* is used in multiple engineering contexts.

An internal language-model token embedding is a learned parameter vector used by the model's computation. A retrieval embedding is typically produced by an embedding model or representation pipeline for comparing queries and documents.

These vectors may share mathematical properties, but they do not automatically share the same training objective, intended use, or compatibility.

Do not assume that internal token embeddings can be substituted for retrieval embeddings, or that vectors from different models can be compared meaningfully just because their dimensions match.

Retrieval-specific representation design and vector-search behavior belong to RET.

## 14. Common Engineering Mistakes

### Mistake 1: Treating cosine similarity as a universal semantic score

A high score means that vectors point in similar directions under the selected calculation. It does not universally mean that their meanings are equivalent.

### Mistake 2: Ignoring vector magnitude

Cosine similarity ignores magnitude, whereas Euclidean distance and dot product respond to it. Metric selection must reflect the question being investigated.

### Mistake 3: Assuming normalization always improves results

Normalization changes which geometric information affects a comparison. It is appropriate only when that change matches the intended use.

### Mistake 4: Assigning direct meanings to individual dimensions

A learned representation can distribute information across dimensions. Coordinate-level interpretations require evidence.

### Mistake 5: Treating nearest neighbors as proof of quality

Nearest-neighbor inspection is exploratory. It does not replace task-specific evaluation.

### Mistake 6: Comparing incompatible representations

Matching dimensionality is insufficient to establish that vectors from different models, layers, or training objectives are comparable.

### Mistake 7: Confusing internal token embeddings with retrieval embeddings

Their mathematical form may be similar, but their intended roles and training setups can differ substantially.

## 15. Engineering Questions

When inspecting embedding geometry, ask:

1. Which model, checkpoint, and representation stage produced these vectors?
2. What does each vector represent: a token, a sequence, or a contextual hidden state?
3. Which similarity or distance metric is being used, and why?
4. Are the vectors normalized? If so, what information does that remove?
5. Does the observed relationship support the claim being made, or merely suggest a hypothesis?
6. Could tokenization, frequency, model architecture, or training data explain the observation?
7. What additional evidence would be needed to establish usefulness for the intended task?

These questions turn numerical inspection into disciplined engineering reasoning.

## 16. Quick Revision

**What does cosine similarity measure?**

The directional alignment between two nonzero vectors, independent of their positive magnitude scaling.

**Why can Euclidean distance disagree with cosine similarity?**

Euclidean distance is sensitive to magnitude as well as direction, while cosine similarity measures directional alignment.

**Does a high cosine similarity prove semantic equivalence?**

No. It establishes a geometric relationship under the selected representation and metric, not universal semantic equivalence.

**Does a plausible nearest-neighbor list establish representation quality?**

No. It is exploratory evidence and must not be treated as a substitute for task-specific evaluation.

**Do embedding dimensions correspond directly to human-defined features?**

Not necessarily. Information can be distributed across coordinates, and individual dimensions often lack simple universal interpretations.

**Does equal dimensionality make two models' embeddings compatible?**

No. Compatibility depends on the representation spaces, training objectives, and intended use—not just vector size.

## 17. Key Takeaways

- Embedding geometry describes relationships among learned vectors.
- Magnitude and direction are distinct properties.
- Cosine similarity and Euclidean distance answer different questions.
- Normalization changes how magnitude affects comparisons.
- Training shapes geometry, but geometry alone does not reveal the full learning process.
- Individual coordinates should not be assigned human-readable meanings without evidence.
- Nearest-neighbor inspection is useful for exploration, not proof of quality.
- Geometric diagnostics do not establish task-specific representation quality.
- Internal token embeddings and retrieval embeddings have different engineering roles.
- Sound interpretation requires recording assumptions, identifying the representation being inspected, and distinguishing observations from conclusions.

## Further Reading

- [LLM-04 README](README.md)
- [From Token IDs to Learned Embeddings](01-From-Token-IDs-to-Learned-Embeddings.md)
- [How Embedding Representations Are Learned](03-How-Embedding-Representations-Are-Learned.md)
- [Embeddings in Model Architecture and Representation Flow](04-Embeddings-in-Model-Architecture-and-Representation-Flow.md)
- [Inspecting Embedding Systems in Practice](06-Inspecting-Embedding-Systems-in-Practice.md)

## Completion Criteria

This chapter is complete when you can:

- Calculate cosine similarity and Euclidean distance and explain their differences.
- Explain how normalization affects vector comparisons.
- Critique a nearest-neighbor or visualization-based claim without overinterpreting it.
- Explain why geometric inspection is not sufficient to establish task-specific quality.
- Identify which additional evidence would be needed to support a claim about a representation's usefulness.

The next chapter applies these concepts in a structured inspection workflow. It will focus on verifying actual model components and representations rather than repeating the geometry theory taught here.
