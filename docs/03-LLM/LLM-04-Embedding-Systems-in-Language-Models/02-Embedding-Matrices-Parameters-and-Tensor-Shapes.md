# Embedding Matrices, Parameters, and Tensor Shapes

## Learning Objectives

By the end of this chapter, you should be able to:

- Derive the shape of a token embedding matrix from vocabulary size and embedding dimension.
- Calculate embedding parameter counts and estimate raw parameter storage.
- Trace tensor shapes from individual token IDs through sequences and batches.
- Explain how padding affects batch shapes and why masking may be necessary.
- Inspect embedding parameters and output shapes using NumPy and PyTorch.
- Diagnose indexing errors, tensor-shape mismatches, and tokenizer/model vocabulary incompatibilities.

**Estimated reading time:** 12–15 minutes

## 1. Scope: From Lookup to Engineering

Chapter 1 established the core mental model: a token ID selects a row from a learned embedding table, producing a vector.

This chapter focuses on the engineering consequences of that operation:

- How the table's dimensions determine its parameter count.
- How parameter count relates to raw memory requirements.
- How sequence and batch dimensions propagate through lookup operations.
- How to reason about padding, tensor layouts, and indexing errors.

The goal is not to repeat the embedding lookup concept in depth. It is to develop the ability to inspect, calculate, and debug embedding systems.

## 2. Embedding Matrix Dimensions

Let:

- \(V\) = vocabulary size.
- \(d\) = embedding dimension.

A conventional token embedding matrix has shape:

\[
E \in \mathbb{R}^{V \times d}
\]

The first dimension represents vocabulary entries. The second represents the number of values in each token vector.

For example, a vocabulary containing five entries with an embedding dimension of three produces a matrix shaped \((5,3)\).

A valid token ID \(i\) must identify an entry in the vocabulary:

\[
0 \leq i < V
\]

The corresponding embedding vector is selected from row \(i\):

\[
\mathbf{e}_i = E[i,:]
\]

The selected vector has shape \((d,)\).

The matrix's dimensions are independent of the sequence being processed. A larger sequence selects more rows, but does not change the shape of the underlying embedding table.

**Engineering rule:** distinguish the complete parameter table from the vectors selected for a particular input.

## 3. Parameter Count and Memory

### 3.1 Calculating parameter count

A conventional embedding matrix contains \(V\) rows with \(d\) scalar values per row.

Therefore:

\[
N_{\text{embedding}} = V \times d
\]

Suppose:

\[
V=50{,}000,\qquad d=768
\]

Then:

\[
N_{\text{embedding}}=50{,}000 \times 768
=38{,}400{,}000
\]

The table contains **38.4 million scalar parameters**.

This calculation applies to a standard embedding table. Architectures using factorized embeddings, projections, or other parameterizations may have additional or differently organized parameters.

### 3.2 Estimating raw parameter storage

The raw storage required for the table can be estimated using:

\[
M_{\text{raw}}=V \times d \times b
\]

where \(b\) is the number of bytes used per value.

For 38.4 million parameters:

| Representation | Bytes per value | Approximate raw storage |
|---|---:|---:|
| FP32 | 4 | 153.6 MB |
| FP16 | 2 | 76.8 MB |
| BF16 | 2 | 76.8 MB |
| INT8 | 1 | 38.4 MB |

These estimates use decimal megabytes and describe only the table's values. Actual quantized storage may include additional metadata.

Total model memory can be higher because of other parameters, gradients, optimizer states, activations, temporary buffers, and runtime overhead. Not all of these are present in every inference configuration.

### 3.3 How design choices affect size

Holding one dimension constant:

- Doubling \(V\) doubles the number of embedding parameters.
- Doubling \(d\) doubles the number of embedding parameters.
- Doubling both \(V\) and \(d\) quadruples the number of embedding parameters.

For a fixed vocabulary, increasing the embedding dimension increases parameter count and raw weight storage linearly.

However, a larger embedding dimension does not automatically produce better representations. Quality also depends on the training data, objectives, architecture, and optimization process.

## 4. Tensor Shapes: Sequences and Batches

Embedding lookup preserves the arrangement of token positions and appends the embedding dimension.

### 4.1 A single sequence

Let \(L\) represent the number of token positions in a sequence.

A sequence of token IDs commonly has shape:

\[
(L,)
\]

Its embedding output has shape:

\[
(L,d)
\]

For example, three token IDs with an embedding dimension of four produce an output shaped \((3,4)\).

The dimensions mean:

- First dimension: token positions.
- Second dimension: embedding coordinates.

Repeated token IDs select the same row during lookup. Their initial embedding vectors are therefore identical, although later contextual computation can produce different representations depending on position and surrounding tokens.

### 4.2 A batch of sequences

Let:

- \(B\) = batch size.
- \(L\) = sequence length.
- \(d\) = embedding dimension.

In a common batch-first layout, the token-ID tensor has shape:

\[
(B,L)
\]

The embedding output has shape:

\[
(B,L,d)
\]

For \(B=2\), \(L=4\), and \(d=3\):

| Tensor | Shape | Interpretation |
|---|---|---|
| Embedding matrix | \((V,3)\) | Vocabulary entries and vector width |
| Token-ID batch | \((2,4)\) | Two sequences, four positions each |
| Embedding output | \((2,4,3)\) | Two sequences, four vectors per sequence, three values per vector |

The output contains:

\[
N_{\text{output}}=B \times L \times d
\]

scalar values. For this example, that is \(2 \times 4 \times 3=24\).

These 24 output values are not 24 independent trainable parameters. The lookup reuses the same embedding table for every sequence and token position.

### 4.3 Shape conventions are implementation-dependent

Batch-first layouts are common, but not universal across every API or architecture. A tensor shaped \((B,L,d)\) and one shaped \((L,B,d)\) can contain the same number of elements while assigning different meanings to their dimensions.

Always inspect the shape contract of the operation consuming the tensor. Do not infer dimension meaning from tensor rank alone.

## 5. Padding and Variable-Length Sequences

Sequences in a real batch often have different lengths. Many batch operations represent them using rectangular tensors with a common sequence length. Padding is one way to achieve this.

Consider two sequences of lengths three and five:

```text
Sequence A: [12, 7, 4]
Sequence B: [ 8, 2, 9, 5, 1]
```

If the chosen batch length is five and token ID `0` is the configured padding ID, the batch could be represented as:

```text
Sequence A: [12, 7, 4, 0, 0]
Sequence B: [ 8, 2, 9, 5, 1]
```

The padding ID here is illustrative. The actual ID depends on the tokenizer and model.

The batch shape is \((2,5)\), and its embedding output has shape \((2,5,d)\).

### 5.1 Padding positions still exist in the tensor

Padding positions can still produce embedding vectors during lookup. Whether those positions affect subsequent computation depends on the model's implementation and its use of mechanisms such as attention masks or padding-aware loss calculations.

A padding-token ID and padding behavior are different concepts:

- **Padding-token ID:** the vocabulary entry used to fill unused sequence positions.
- **Padding behavior:** the mechanisms that determine how those positions affect model computation or loss.

Do not assume that choosing a padding-token ID automatically causes every operation to ignore those positions.

The NumPy and PyTorch examples later in this chapter demonstrate lookup and shape mechanics. They do not implement a complete padding-aware Transformer input pipeline.

### 5.2 Padding and efficiency

Padding can introduce unnecessary computation when padded positions pass through parts of the model. The extent depends on sequence lengths, batching strategy, and implementation.

Length-aware batching and other optimization techniques can reduce this overhead. Detailed performance engineering belongs to the relevant optimization and production topics.

## 6. Distinguishing the Dimensions

The following quantities appear together in embedding systems but describe different properties.

| Quantity | Symbol | Meaning |
|---|---|---|
| Vocabulary size | \(V\) | Number of addressable vocabulary entries |
| Embedding dimension | \(d\) | Number of values in each embedding vector |
| Sequence length | \(L\) | Number of token positions in a sequence |
| Batch size | \(B\) | Number of sequences processed together |

Suppose an embedding matrix has shape \((32{,}000,1024)\).

You can conclude that:

- It contains 32,000 rows.
- Each row has 1,024 values.
- The table contains 32,768,000 scalar parameters.

You cannot infer the batch size or sequence length from the embedding matrix's shape alone.

Similarly, a sequence containing 100 tokens does not need an embedding matrix with 100 rows. Sequence length determines how many positions are processed; vocabulary size determines which token IDs the table can address.

## 7. Practical Inspection with NumPy

The following example uses a small manually specified table to demonstrate lookup and tensor shapes.

```python
import numpy as np

embedding_matrix = np.array(
    [
        [0.2, -0.1, 0.7],
        [0.4, 0.3, -0.2],
        [-0.5, 0.8, 0.1],
        [0.6, -0.4, 0.2],
        [0.1, 0.5, -0.3],
    ],
    dtype=np.float32,
)

token_ids = np.array([2, 0, 3])
embeddings = embedding_matrix[token_ids]

print("Embedding matrix:", embedding_matrix.shape)
print("Token IDs:", token_ids.shape)
print("Embedding output:", embeddings.shape)
```

Expected shapes:

```text
Embedding matrix: (5, 3)
Token IDs: (3,)
Embedding output: (3, 3)
```

The matrix contains five vocabulary entries, each with three values. The input contains three token positions, so the lookup returns three vectors.

### 7.1 Inspecting a batch

```python
batch_token_ids = np.array(
    [
        [2, 0, 3],
        [1, 4, 2],
    ]
)

batch_embeddings = embedding_matrix[batch_token_ids]

print("Batch input:", batch_token_ids.shape)
print("Batch output:", batch_embeddings.shape)
```

Expected shapes:

```text
Batch input: (2, 3)
Batch output: (2, 3, 3)
```

NumPy's array indexing performs the lookup for the entire batch without requiring a manually written loop over each sequence position.

This is a demonstration of indexing, not model training. The NumPy array is not automatically updated by a learning algorithm.

## 8. Practical Inspection with PyTorch

PyTorch's `nn.Embedding` provides a trainable embedding table.

```python
import torch
import torch.nn as nn

vocab_size = 5
embedding_dim = 3

embedding = nn.Embedding(
    num_embeddings=vocab_size,
    embedding_dim=embedding_dim,
)

token_ids = torch.tensor([2, 0, 3], dtype=torch.long)
embeddings = embedding(token_ids)

print("Embedding weight:", embedding.weight.shape)
print("Token IDs:", token_ids.shape)
print("Embedding output:", embeddings.shape)

parameter_count = sum(
    p.numel()
    for p in embedding.parameters()
    if p.requires_grad
)
print("Trainable parameters:", parameter_count)
```

Expected shapes and parameter count:

```text
Embedding weight: torch.Size([5, 3])
Token IDs: torch.Size([3])
Embedding output: torch.Size([3, 3])
Trainable parameters: 15
```

The vectors themselves depend on the layer's initialization, so they will not necessarily match the manually specified NumPy values.

The parameter count agrees with:

\[
V \times d = 5 \times 3 = 15
\]

### 8.1 Batched PyTorch input

```python
batch_token_ids = torch.tensor(
    [
        [2, 0, 3],
        [1, 4, 2],
    ],
    dtype=torch.long,
)

batch_embeddings = embedding(batch_token_ids)

print("Batch input:", batch_token_ids.shape)
print("Batch output:", batch_embeddings.shape)
```

Expected shapes:

```text
Batch input: torch.Size([2, 3])
Batch output: torch.Size([2, 3, 3])
```

More generally, an ordinary embedding lookup transforms an input index tensor shaped

\[
(s_1,s_2,\ldots,s_n)
\]

into an output shaped

\[
(s_1,s_2,\ldots,s_n,d)
\]

The input dimensions are preserved, and the embedding dimension is appended.

## 9. Debugging Shape and Indexing Errors

### 9.1 Invalid token IDs

For a vocabulary size \(V\), valid token IDs must fall within the expected range:

\[
0 \leq i < V
\]

Do not assume that every indexing library handles invalid IDs identically.

For example, NumPy interprets a negative array index as an index from the end. If the table has five rows, `embedding_matrix[-1]` selects the last row instead of raising an error. That behavior can silently return the wrong vector for an invalid token ID.

PyTorch embedding lookups generally reject negative indices.

**Production lesson:** validate token IDs against the expected vocabulary range instead of relying on indexing behavior to detect invalid data.

When debugging:

1. Inspect the embedding table's first dimension.
2. Check the minimum and maximum token IDs.
3. Verify that the tokenizer and model agree on vocabulary indexing.
4. Check how special tokens are represented.
5. Validate IDs before lookup when inputs can originate from untrusted or inconsistent sources.

### 9.2 Confusing the full table with lookup output

Suppose the embedding matrix has shape \((32{,}000,768)\), and the input contains 20 token IDs.

The output for a single sequence should have shape \((20,768)\), not \((32{,}000,768)\).

The first shape represents selected token vectors. The second describes the complete embedding table.

When debugging, identify whether the tensor is a parameter table or an activation produced for a particular input.

### 9.3 Incorrect batch layout

A component expecting \((B,L,d)\) may interpret \((L,B,d)\) incorrectly even though both tensors have the same number of elements.

The operation may fail, or it may execute with incorrect dimension semantics. Inspect the receiving operation's documented input contract before reshaping or permuting tensors.

### 9.4 Confusing activation size with parameter count

Suppose a batch contains eight sequences, each with 100 positions and embedding dimension 768.

The output contains:

\[
8 \times 100 \times 768=614{,}400
\]

scalar values.

That does not mean the embedding table has 614,400 trainable parameters. Its count is determined by \(V \times d\), regardless of how many sequences are processed in a particular batch.

## 10. Important Distinctions

### 10.1 Parameters versus activations

**Parameters** are learned values stored by the model. The embedding matrix is a parameter tensor.

**Activations** are values produced when an input passes through the model. The result of an embedding lookup is an activation tensor.

This distinction matters when analyzing memory usage, training behavior, and model execution.

### 10.2 Embedding dimension versus hidden-state dimension

The embedding dimension describes the width of the initial learned token vectors. A hidden-state dimension describes the width of representations at a particular stage of model computation.

Some architectures use the same dimension for both. Others introduce projections or use more specialized parameterizations. Do not assume these dimensions must always be identical.

Chapter 4 covers how embeddings connect to subsequent model computation and representation flow.

### 10.3 Language-model embeddings versus retrieval embeddings

The token embedding table maps vocabulary IDs to internal learned vectors. Retrieval embedding systems transform inputs into representations used for similarity-based retrieval.

Both use vectors, but their inputs, training objectives, interfaces, and downstream purposes differ. Retrieval pipelines, vector indexes, and RAG belong to the Retrieval Engineering domain.

## 11. Common Mistakes

1. Treating token IDs as embedding vectors.
2. Reversing the conventional embedding matrix dimensions.
3. Confusing parameter count with activation size.
4. Assuming sequence length determines vocabulary size.
5. Assuming every model uses batch-first tensor layouts.
6. Assuming padding tokens are automatically ignored by all operations.
7. Assuming a larger embedding dimension guarantees better representation quality.
8. Ignoring tokenizer/model vocabulary compatibility.
9. Treating raw parameter storage as total runtime memory.
10. Relying on library indexing behavior instead of validating token IDs.

## 12. Engineering Questions

Use these questions to test your reasoning.

### Question 1: Parameter and memory calculation

A model has 64,000 vocabulary entries and an embedding dimension of 1,024.

Calculate the number of embedding parameters and estimate the raw storage needed for FP16 weights. Explain what this estimate excludes.

### Question 2: Tensor-shape tracing

A batch contains 16 sequences, each with 128 token positions. The vocabulary size is 32,000 and the embedding dimension is 768.

Determine the shapes of the embedding matrix, token-ID batch, and embedding output. Explain every dimension.

### Question 3: Debugging

A developer observes an embedding output shaped `(4, 12, 256)` and concludes that the vocabulary contains four tokens.

Explain why this conclusion is incorrect. What additional information would you inspect to determine vocabulary size?

### Question 4: Design trade-off

A team proposes doubling the embedding dimension to improve model quality.

Assuming vocabulary size remains constant, explain the effect on parameter count and raw weight storage. Why is this insufficient evidence that quality will improve?

### Question 5: Indexing behavior

A token ID of `-1` reaches a NumPy embedding lookup.

Explain the risk and how it differs from the usual behavior of a PyTorch embedding lookup. What validation should occur before lookup?

## 13. Quick Revision

- A conventional token embedding matrix has shape \((V,d)\).
- Its parameter count is \(V \times d\).
- Raw storage is approximately \(V \times d \times b\) bytes.
- A sequence of length \(L\) produces an embedding tensor shaped \((L,d)\).
- A batch-first token-ID tensor shaped \((B,L)\) commonly produces \((B,L,d)\).
- Padding creates common-length representations but does not automatically make every operation ignore padded positions.
- The embedding table is a parameter tensor; lookup outputs are activations.
- Vocabulary size, sequence length, batch size, and embedding dimension describe different properties.
- Invalid token IDs must be validated explicitly because indexing behavior differs across libraries.
- Always inspect actual tensor shapes and tokenizer/model compatibility.

## 14. Key Takeaways

The embedding matrix connects discrete vocabulary indexing to learned vector representations. Its vocabulary dimension determines the number of token entries, and its embedding dimension determines the width of each vector.

The same table is reused across positions and batches. Therefore, its parameter count depends on \(V\) and \(d\), while a particular lookup output depends on the input dimensions and embedding width.

A reliable engineer should be able to derive these shapes, estimate memory requirements, distinguish parameters from activations, and diagnose invalid IDs without relying on assumptions about library behavior.

## Further Reading

- [LLM-04: Embedding Systems in Language Models — Overview](README.md)
- [Chapter 1: From Token IDs to Learned Embeddings](01-From-Token-IDs-to-Learned-Embeddings.md)
- [Chapter 3: How Embedding Representations Are Learned](03-How-Embedding-Representations-Are-Learned.md)

## Completion Criteria

- [ ] Derive the embedding matrix shape from vocabulary size and embedding dimension.
- [ ] Calculate parameter count and estimate raw weight storage.
- [ ] Trace tensor shapes for a token sequence and a batch.
- [ ] Explain padding and why masking may be required.
- [ ] Inspect embedding shapes and parameter counts using NumPy and PyTorch.
- [ ] Explain the difference between NumPy negative indexing and valid token-ID semantics.
- [ ] Diagnose shape mismatches separately from tokenizer/model vocabulary incompatibilities.
- [ ] Explain the difference between embedding parameters and lookup activations without referring to this document.
