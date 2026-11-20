# Exact Search, Approximate Search, and ANN

## Learning Objectives

By completing this chapter, you should be able to:

- Explain exact and approximate nearest-neighbor search and their guarantees.
- Compare their computational, latency, memory, and completeness trade-offs.
- Explain graph-based, partition-based, and quantization-based ANN approaches.
- Distinguish ANN recall from semantic relevance and end-to-end retrieval quality.
- Select a search strategy using workload requirements and measured evidence.

## Prerequisites

This chapter assumes familiarity with dense retrieval, query and document vectors, and similarity measures. See [Lesson 01 — Dense Retrieval and Embedding Compatibility](01-Dense-Retrieval-and-Embedding-Compatibility.md) for the representation contract.

**Estimated reading time:** 11 minutes.

## 1. Why Exact and Approximate Search Exist

A dense retrieval system must identify the document vectors closest to a query vector under a configured similarity or distance function.

There are two broad approaches:

- **Exact nearest-neighbor search** guarantees the true nearest neighbors for the defined search problem.
- **Approximate nearest-neighbor (ANN) search** reduces search work while accepting that the returned results may differ from the exact nearest neighbors.

The distinction concerns the search algorithm and its guarantees, not the quality of the embeddings themselves.

Exact search does not necessarily mean scanning every vector. Exhaustive search is one way to obtain exact results. An exact algorithm may also use an index to prune regions that provably cannot contain better results while preserving the exactness guarantee.

ANN methods typically reduce work by exploring promising parts of the collection, using compressed representations, or combining these approaches.

## 2. Exact Nearest-Neighbor Search

### 2.1 Exhaustive search as a reference

Exhaustive search evaluates every eligible vector against the query, then selects the top-\(k\) results according to the configured scoring function.

The following educational example uses dot-product scoring:

```python
import numpy as np

# Shape: (number_of_documents, dimensions)
document_vectors = np.asarray(document_vectors, dtype=np.float32)

# Shape: (dimensions,)
query_vector = np.asarray(query_vector, dtype=np.float32)

top_k = 5

if document_vectors.ndim != 2:
    raise ValueError("document_vectors must be a 2D matrix")

if query_vector.ndim != 1:
    raise ValueError("query_vector must be a 1D vector")

if document_vectors.shape[1] != query_vector.shape[0]:
    raise ValueError("Query and document dimensions must match")

if not 1 <= top_k <= len(document_vectors):
    raise ValueError("top_k must be within the document count")

# Assumes dot product is the configured scoring function.
scores = document_vectors @ query_vector

# Educational implementation: sorts every score.
indices = np.argsort(-scores)[:top_k]
```

This example assumes all rows are eligible, the query and document vectors use compatible representations, and higher scores indicate better matches. If eligibility filters exist, they must be applied consistently before selecting results.

The full sort is simple to understand, but it is not the most efficient way to select a small top-\(k\) set from a large collection.

### 2.2 Exactness and its boundaries

Exactness is defined relative to:

- The indexed vector collection and its current state.
- The eligible candidates, including applicable filters.
- The configured distance or similarity function.
- The numerical representation and implementation.
- The required result count \(k\), including the treatment of ties.

An exact algorithm returns the true nearest neighbors for that defined problem, subject to its implementation and numerical behavior.

This does not guarantee semantic relevance. If the embedding model fails to represent the user's intent, exact search can faithfully return the wrong documents in practical terms.

Exact search is a reference for the configured vector-search objective, not a substitute for relevance evaluation.

### 2.3 Computational cost

For \(N\) eligible vectors with \(d\) dimensions, straightforward exhaustive scoring requires approximately:

\[
O(Nd)
\]

work per query.

Top-\(k\) selection introduces an additional cost. A full sort, as used in the example, generally costs:

\[
O(N\log N)
\]

A partial-selection algorithm can avoid fully sorting every score, although the cost depends on the algorithm and implementation. Optimized libraries may also combine scoring and selection more efficiently.

Therefore, exhaustive search cost should not be reduced to one complexity expression without stating what operation is being analyzed.

Observed latency also depends on memory bandwidth, batching, parallelism, hardware acceleration, concurrency, data layout, and implementation efficiency. A well-optimized exhaustive scan can outperform an ANN index on some workloads.

### 2.4 Memory requirements

The raw vector payload can be estimated as:

\[
M = N \times d \times b
\]

where:

- \(N\) is the number of vectors.
- \(d\) is the number of dimensions.
- \(b\) is the number of bytes per vector component.

For one million vectors with 384 dimensions and four-byte components:

\[
1{,}000{,}000 \times 384 \times 4
= 1.536 \times 10^9 \text{ bytes}
\]

That is 1.536 decimal GB, or approximately 1.43 GiB.

This estimate includes only the raw vector payload. Actual memory requirements can also include identifiers, metadata, index structures, temporary buffers, runtime overhead, and replicas. Depending on the implementation, an ANN index can consume more memory than an exhaustive scan or reduce memory through compression.

### 2.5 When exact search is sufficient

Exact search is a reasonable choice when:

- It satisfies the workload's latency and resource requirements.
- The eligible candidate set is small.
- A straightforward search implementation is operationally preferable.
- An exact reference is needed to evaluate ANN behavior.
- The expected benefit of approximation has not been demonstrated.

There is no universal corpus-size threshold at which ANN becomes necessary. The decision depends on the workload, hardware, query rate, latency requirements, and memory constraints.

## 3. Approximate Nearest-Neighbor Search

ANN reduces search work by prioritizing promising candidates rather than guaranteeing that every true nearest neighbor will be returned.

Approximation can occur in two distinct ways.

**Candidate omission:** The algorithm does not visit some vectors that belong to the exact top-\(k\) set.

**Distance estimation:** The algorithm estimates distances using compressed or otherwise approximate representations rather than calculating distances from the original vectors.

A method can use either mechanism or both. For example, an index may restrict the candidate set and then calculate exact distances for every candidate it visits. In that case, candidate omission is the source of approximation.

### 3.1 Exact versus approximate search

| Dimension | Exact search | Approximate search |
|---|---|---|
| Result guarantee | True nearest neighbors for the defined search problem | May differ from the exact top-\(k\) results |
| Candidate coverage | Exact algorithms preserve the required guarantee; exhaustive search evaluates every eligible vector | May omit true neighbors |
| Search work | Exhaustive scoring grows with \(N\) and \(d\) | Depends on index structure and search effort |
| Latency | Can become costly for some workloads | May reduce latency when the index suits the workload |
| Memory | Raw vectors and any supporting structures | May add index overhead or reduce storage through compression |
| Complexity | Often simpler to reason about | Introduces index construction, configuration, and lifecycle concerns |
| Quality assessment | Establishes a reference for the configured vector objective | Requires comparison with exact results and task-level relevance |

These are general tendencies, not universal guarantees. Exact search may be faster for small workloads, and ANN may increase memory or fail to meet latency expectations when poorly suited to the data.

## 4. ANN Index Families

ANN is not a single algorithm. Different index families reduce search costs through different mechanisms, and practical implementations may combine them.

### 4.1 Graph-based search

Graph-based methods connect vectors through a graph. Search starts from one or more entry points and explores connected nodes that appear promising relative to the query.

Hierarchical Navigable Small World (HNSW) is a widely used example. Its hierarchical graph structure supports navigation at different levels of granularity.

**Primary benefit:** Search can reach promising candidates without evaluating every vector.

**Primary trade-offs:**

- Graph edges and supporting structures consume memory.
- Index construction and updates require additional computation.
- Search quality depends on graph structure and how much of the graph is explored.
- The graph does not guarantee low latency or high recall for every dataset and configuration.

Graph-based methods are candidates when query latency is important and sufficient memory is available for the index.

### 4.2 Partition-based search

Partition-based methods divide vectors into regions and search selected regions rather than the full collection.

An inverted-file (IVF) index is a common example. Vectors are assigned to clusters represented by centroids. At query time, the search identifies promising centroids and searches the corresponding partitions.

**Primary benefit:** The search can avoid evaluating vectors in regions unlikely to contain the nearest neighbors.

**Primary trade-offs:**

- Partitioning and centroid selection affect candidate coverage.
- Searching too few partitions can exclude true neighbors before local scoring begins.
- Searching more partitions increases work and may improve recall.
- Performance depends on the distribution of the vectors and the partition structure.

Partition-based methods can be useful when the collection can be divided into regions that make query-time candidate selection effective.

### 4.3 Quantization-based search

Quantization represents vectors using compact codes instead of storing and comparing every original component directly. Product quantization (PQ), for example, divides vectors into subvectors and encodes them using compact representations.

The search can use these codes to estimate distances at lower storage or computation cost.

**Primary benefit:** Compact representations can reduce vector-storage requirements and memory traffic.

**Primary trade-offs:**

- Estimated distances can differ from distances computed using the original vectors.
- The amount of compression affects approximation error.
- Some systems retain original vectors or refine promising candidates after an initial compressed search.
- Quantization does not inherently require candidate omission, although it is often combined with candidate-selection methods.

Quantization is particularly relevant when memory capacity or memory bandwidth is a major constraint.

### 4.4 Compare the mechanisms

| Family | How it reduces search cost | Principal risk | Resource consideration |
|---|---|---|---|
| Graph-based | Navigates links toward promising candidates | Missed neighbors when exploration is insufficient | Graph memory and construction cost |
| Partition-based | Searches selected clusters or regions | True neighbors excluded with unsearched partitions | Partition quality and search coverage |
| Quantization-based | Uses compact codes to estimate distances | Distance-estimation error | Compression level and possible refinement cost |

These families are not mutually exclusive product categories. An implementation can use partitioning to select candidates and quantization to compare them, for example.

The engineering question is not which family is universally best. It is which combination meets the workload's latency, memory, update, and quality requirements at an acceptable operational cost.

Detailed parameter tuning belongs to Lesson 03.

## 5. ANN Recall and Retrieval Quality

ANN results can differ from exact results because the index may omit true neighbors, estimate distances, or both.

Suppose exact search returns:

```text
A, B, C, D, E
```

and ANN returns:

```text
A, C, D, F, G
```

The overlap-based ANN recall at five is:

\[
\operatorname{ANNRecall@5}
=
\frac{|\{A,C,D,F,G\}\cap\{A,B,C,D,E\}|}{5}
=
\frac{3}{5}=0.6
\]

The ANN result contains three of the five exact neighbors.

For a valid comparison, both result sets must use the same query vector, corpus snapshot, eligible candidate set, scoring function, and \(k\). Ties at the ranking cutoff can complicate strict set-overlap measurements; the evaluation should define how tied results are handled.

### 5.1 Three different questions

**ANN recall:** How much of the exact nearest-neighbor result set did ANN recover?

**Semantic relevance:** Are the retrieved documents useful for the user's information need?

**End-to-end retrieval quality:** Does the complete retrieval system return suitable candidates for its downstream task?

These questions are related but not interchangeable.

An ANN index can have lower overlap with exact results while still returning useful documents. Conversely, an ANN index can reproduce the exact results closely even when those results are semantically poor.

The exact result set is a reference for search fidelity. It is not automatically a relevance-labeled ground truth. Formal relevance evaluation and benchmark methodology belong to RET-10.

## 6. Worked Engineering Decision

Consider a hypothetical technical knowledge base with the following acceptance criteria:

- **Latency:** p95 query latency must be at most 50 ms at the expected production load.
- **Memory:** the vector index and its required supporting structures must fit within a 4 GiB memory budget.
- **Search fidelity for ANN candidates:** ANN recall@10 must be at least 0.95 against exact search on the agreed evaluation workload.
- **Task quality:** retrieval relevance must not fall below the application's independently defined acceptance threshold.

These numbers are illustrative requirements, not benchmark results.

### Step 1: Establish the reference

Run exact search on a representative corpus and query workload. Record p50 and p95 latency, memory use, query throughput, and the top-10 result sets.

Measure under realistic concurrency and filtering conditions. A single-query microbenchmark may not represent production behavior.

### Step 2: Evaluate exact search against applicable requirements

Evaluate exact search against the latency, memory, and task-quality requirements. ANN recall is not a pass/fail requirement for exact search against itself; exact results are the reference used to calculate ANN recall.

If exact search meets the latency and memory budgets and satisfies the task-quality requirement, retain it as the initial design unless another requirement justifies approximation.

If exact search exceeds a budget, identify the limiting resource. The bottleneck might be exhaustive scoring, memory bandwidth, concurrency, filtering, or another part of the request path. ANN is relevant only if it addresses the observed constraint.

### Step 3: Select an index hypothesis

Choose candidates based on the diagnosed constraint:

- Evaluate a graph-based index when search latency is the main concern and additional index memory is available.
- Evaluate a partition-based index when the collection supports useful region selection.
- Evaluate quantization when vector storage or memory bandwidth is the dominant constraint.
- Consider combined approaches when one mechanism alone cannot satisfy the requirements.

These are hypotheses for evaluation, not guarantees of performance.

### Step 4: Evaluate ANN candidates against all applicable requirements

For each ANN candidate, measure:

1. p95 latency at the expected production load.
2. Total index memory, including supporting structures.
3. ANN recall@10 against the exact reference.
4. Task-level relevance against the application's quality requirement.
5. Build, update, and operational costs relevant to the workload.

Use the same corpus, query set, filters, and scoring definition when comparing search results.

An ANN candidate is acceptable only if it meets the latency and memory requirements, achieves the minimum ANN recall, and satisfies the task-quality threshold. These criteria must be assessed independently; passing one does not imply passing the others.

### Step 5: Apply the decision rule

- **Keep exact search** if it meets the latency, memory, and task-quality requirements. It does not need to satisfy an ANN-recall threshold against itself.
- **Choose ANN** if exact search fails an operational requirement and an ANN candidate meets all applicable latency, memory, recall, and task-quality criteria.
- **Reject or revise an ANN candidate** if it meets latency requirements but fails recall or task quality.
- **Revisit the architecture or requirements** if neither approach satisfies the constraints.

This process separates the decision to use ANN from the later task of tuning it. Lesson 03 covers detailed vector-search tuning and diagnostics.

## 7. Common Engineering Failure Modes

**Assuming ANN is always faster.** Index traversal, memory access, and overhead can make ANN slower than an optimized exhaustive scan.

**Treating exact results as relevance ground truth.** Exact search establishes the nearest neighbors under the configured vector objective, not whether those documents answer the question.

**Confusing candidate omission with distance estimation.** These mechanisms create different failure modes and may require different remedies.

**Comparing inconsistent workloads.** Different corpus snapshots, filters, metrics, or queries can make exact-versus-ANN comparisons misleading.

**Choosing an index based only on a headline benchmark.** Performance depends on the dataset, hardware, query distribution, configuration, and workload.

**Introducing approximation without an acceptance criterion.** Latency improvements alone do not justify reduced search fidelity or task quality.

## 8. Interview Questions

### 1. Does exact search require scanning every vector?

No. Exhaustive search evaluates every eligible vector, but an exact algorithm can use safe pruning or indexing while preserving the true-neighbor guarantee.

### 2. Why is \(O(Nd)\) not a complete latency model for exhaustive search?

It describes the approximate scoring work. Result selection, memory movement, batching, parallelism, hardware, and concurrency also influence observed latency.

### 3. Why might ANN use more memory than exact search?

Graph links, partition metadata, and other index structures add overhead. Quantization can reduce storage, but the total memory effect depends on the implementation.

### 4. What is the difference between candidate omission and distance estimation?

Candidate omission means a true neighbor is not considered. Distance estimation means the distance is approximated, potentially changing the ranking even among candidates that are considered.

### 5. Does high ANN recall guarantee good retrieval?

No. ANN recall measures agreement with exact nearest neighbors. Relevance and end-to-end retrieval quality require separate assessment.

### 6. How should a team decide whether to use ANN?

Establish an exact reference, define latency, memory, search-fidelity, and task-quality requirements, then evaluate suitable candidates under representative workload conditions. Choose ANN only when measured results justify its operational complexity.

## Quick Revision

Exact nearest-neighbor search guarantees the true results for the defined vector-search problem; exhaustive scanning is one way to obtain that guarantee. Exhaustive scoring is approximately \(O(Nd)\), while top-\(k\) selection introduces additional work.

ANN reduces search effort through candidate selection, compact representations, or both. Graph-based methods navigate connections, partition-based methods search selected regions, and quantization-based methods estimate distances using compact codes.

ANN recall measures overlap with exact results, not semantic relevance. Evaluate exact search against latency, memory, and task-quality requirements; evaluate ANN against those requirements plus its required recall threshold.

## Further Reading

- [FAISS — Similarity Search and Clustering of Dense Vectors](https://github.com/facebookresearch/faiss)
- [hnswlib — Hierarchical Navigable Small World Graphs](https://github.com/nmslib/hnswlib)
- [ScaNN — Efficient Vector Similarity Search](https://github.com/google-research/google-research/tree/master/scann)
- [Lesson 01 — Dense Retrieval and Embedding Compatibility](01-Dense-Retrieval-and-Embedding-Compatibility.md)
- [Lesson 03 — Vector Search Tuning and Dense Retrieval Diagnostics](03-Vector-Search-Tuning-and-Dense-Retrieval-Diagnostics.md)
