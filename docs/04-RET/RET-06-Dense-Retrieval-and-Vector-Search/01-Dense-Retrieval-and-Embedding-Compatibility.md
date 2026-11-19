# Dense Retrieval and Embedding Compatibility

## Purpose

Dense retrieval represents queries and documents as numerical vectors and retrieves candidates by comparing those representations. It can find relevant content even when the query and document use different words, provided the embedding model captures the relationship required by the retrieval task.

This chapter establishes the engineering requirements for a reliable dense-retrieval baseline. Its central concern is **representation compatibility**: ensuring that query and document vectors can be compared meaningfully before investigating search algorithms or tuning performance.

## Learning Objectives

By completing this chapter, you should be able to:

- Explain how dense retrieval encodes and ranks queries and documents.
- Distinguish dimensional compatibility from semantic compatibility.
- Implement and validate a basic dense-retrieval pipeline.
- Diagnose embedding-model, configuration, normalization, and similarity mismatches.
- Select an embedding model based on retrieval requirements and domain characteristics.
- Recognize when dense retrieval is unnecessary or insufficient.

## 1. How Dense Retrieval Works

Lexical retrieval primarily matches terms and applies scoring rules. Dense retrieval uses learned representations to capture relationships between inputs.

For example, a query such as “How can I recover access to my account?” may retrieve a document titled “Resetting your password,” even when the two texts share few important terms. This behavior depends on the model's training and suitability for the task; using vectors does not automatically guarantee semantic relevance.

A typical dense-retrieval pipeline has four steps:

1. Encode documents into vectors and associate them with stable document identifiers.
2. Store the vectors in a searchable representation.
3. Encode an incoming query using the intended query-encoding procedure.
4. Compare the query vector with document vectors and return the highest-ranked candidates.

Formally:

\[
q = E_q(\text{query}), \qquad d_i = E_d(\text{document}_i)
\]

Here, \(E_q\) and \(E_d\) are the query and document encoders. They may be the same model or different components of a jointly designed retrieval model.

The essential requirement is that their outputs are **compatible for the intended retrieval task**.

## 2. Query–Document Compatibility

Two vectors can have the same dimensionality and still be semantically incompatible.

Imagine two independently trained models that both produce 768-dimensional vectors. A dot product between their outputs may execute without an error, but their learned coordinate systems may encode relationships differently. The resulting scores can be mathematically valid yet useless for retrieval.

Compatibility is more than a shape check.

| Property | What to verify |
|---|---|
| Model identity and revision | Were query and document vectors produced by the intended model or compatible model pair? |
| Encoding procedure | Are the expected query/document prompts, prefixes, pooling, tokenization, and truncation settings being used? |
| Dimensions and data | Do vectors have the expected dimensions, supported data types, and finite values? |
| Normalization | Does vector normalization match the intended scoring configuration? |
| Similarity semantics | Does the selected metric agree with the model's intended retrieval behavior and index implementation? |
| Corpus consistency | Were stored vectors generated using a compatible model and configuration? |

Some retrieval models use **asymmetric encoding**: queries and documents have different prompts or encoding paths because they play different roles. Applying the document encoding procedure to queries can degrade retrieval even when vector dimensions match.

### A production failure scenario

A knowledge base is indexed using model revision A. The application is upgraded to revision B, but only incoming queries are re-encoded. Both revisions produce vectors of the same dimension, so the vector database accepts the query and returns results.

The request succeeds technically, but retrieval quality deteriorates because the query and document representations may no longer be compatible.

The first investigation should examine the embedding contract—not immediately change the vector index or search parameters.

**Engineering rule:** Treat the model revision and relevant encoding configuration as part of the index's data contract. A change to that contract requires an explicit compatibility assessment and may require re-embedding the corpus.

## 3. Similarity Measures and Normalization

Common vector-comparison methods include cosine similarity, dot product, and Euclidean distance.

For query vector \(q\) and document vector \(d\):

\[
\operatorname{cos}(q,d)=
\frac{q\cdot d}{\|q\|\|d\|}
\]

\[
\operatorname{dot}(q,d)=q\cdot d
\]

\[
\operatorname{dist}(q,d)=\|q-d\|_2
\]

Cosine similarity measures angular alignment. Dot product depends on both alignment and vector magnitudes. Euclidean distance measures straight-line separation, with smaller values indicating closer vectors.

For nonzero, unit-normalized vectors:

\[
\|q-d\|_2^2=2-2(q\cdot d)
\]

Consequently, maximizing dot product, maximizing cosine similarity, and minimizing Euclidean distance produce equivalent rankings when all compared vectors are unit-normalized.

Without that condition, their rankings may differ. Dot product can favor vectors with larger magnitudes, whereas cosine similarity removes magnitude from the comparison.

Choose the metric based on the model's intended scoring behavior, normalization assumptions, and the vector database's implementation. Verify score direction as well: some systems return higher-is-better similarity scores, while others return lower-is-better distances.

A high similarity score is not a guarantee of relevance. It describes the relationship between vectors under a particular scoring method; the retrieved document must still be inspected against the user's information need.

## 4. Implementing a Dense-Retrieval Baseline

The following example implements exact search over a small corpus using Sentence Transformers, the BGE-small English embedding model, and NumPy. It embeds documents, encodes a query, calculates similarities, and returns ranked document IDs.

Install the dependencies:

```bash
pip install sentence-transformers numpy
```

For reproducible environments, pin the tested package versions in your project's dependency lockfile. The code below pins the model repository to a specific revision rather than resolving the moving `main` branch.

```python
import numpy as np
from sentence_transformers import SentenceTransformer

MODEL_NAME = "BAAI/bge-small-en-v1.5"
MODEL_REVISION = (
    "5c38ec7c405ec4b44b94cc5a9bb96e735b38267a"
)

model = SentenceTransformer(
    MODEL_NAME,
    revision=MODEL_REVISION,
)

documents = [
    {
        "id": "doc-101",
        "text": "Reset your password using the account recovery page.",
    },
    {
        "id": "doc-102",
        "text": "Update your billing information in account settings.",
    },
    {
        "id": "doc-103",
        "text": "Enable multi-factor authentication to secure your account.",
    },
]

query = (
    "Represent this sentence for searching relevant passages: "
    "How can I recover access to my account?"
)

document_texts = [item["text"] for item in documents]

if not documents or any(not text.strip() for text in document_texts):
    raise ValueError("The corpus must contain non-empty document text.")

if len({item["id"] for item in documents}) != len(documents):
    raise ValueError("Document IDs must be unique.")

document_vectors = model.encode(
    document_texts,
    normalize_embeddings=True,
    convert_to_numpy=True,
)

query_vector = model.encode(
    query,
    normalize_embeddings=True,
    convert_to_numpy=True,
)

if document_vectors.ndim != 2:
    raise ValueError("Expected a two-dimensional document matrix.")

if query_vector.shape != (document_vectors.shape[1],):
    raise ValueError("Query and document vector dimensions do not match.")

if not (
    np.isfinite(document_vectors).all()
    and np.isfinite(query_vector).all()
):
    raise ValueError("Embeddings contain non-finite values.")

if not (
    np.allclose(np.linalg.norm(document_vectors, axis=1), 1.0)
    and np.isclose(np.linalg.norm(query_vector), 1.0)
):
    raise ValueError("Expected unit-normalized embeddings.")

# Exact comparison against every document vector.
scores = document_vectors @ query_vector
ranked_indices = np.argsort(-scores)

results = [
    {
        "id": documents[i]["id"],
        "text": documents[i]["text"],
        "score": float(scores[i]),
    }
    for i in ranked_indices
]

for result in results:
    print(result)
```

The query instruction follows the documented BGE retrieval convention. The model card recommends an instruction for short-query-to-passage retrieval; documents do not require the same prefix. When changing models, verify their encoding instructions rather than reusing this prefix blindly. See the [official BGE-small-en-v1.5 model card](https://huggingface.co/BAAI/bge-small-en-v1.5).

The example validates basic invariants: a non-empty corpus, non-empty document text, unique IDs, compatible dimensions, finite values, and unit-normalized vectors. It remains a teaching baseline, not a complete production service. Production implementations also need explicit handling for empty queries, model-loading failures, resource limits, request validation, and index lifecycle management.

The example compares the query against every document vector. This is exact search over the supplied corpus and is useful for establishing reference rankings on small datasets. Scalable index selection and approximate-nearest-neighbor tuning belong to File 02.

Successful execution proves that the pipeline ran; it does not prove that the results are relevant. The code has not been executed as part of this documentation revision, so runtime behavior must still be verified in the project's pinned environment.

## 5. Model Selection and Domain Fit

Representation compatibility is necessary, but it does not establish that a model is suitable for a particular workload.

Consider a technical support knowledge base containing error codes, product identifiers, version numbers, and configuration keys. A dense model might retrieve a conceptually related article while missing the exact identifier that determines the correct fix. A customer asking “Why can't I get into my account?” may benefit more from dense retrieval when the relevant article is titled “Account recovery and password reset.”

An engineer should make this decision from observed workload behavior:

1. Identify common query types, including paraphrases, exact identifiers, and domain-specific terminology.
2. Define what makes a result useful and the cost of an incorrect result.
3. Test representative queries against a small, inspectable corpus.
4. Inspect missed relevant documents and semantically similar false positives.
5. Compare candidate models or approaches using the same queries and document set.
6. Choose the approach that best satisfies the workload's quality and operational requirements.

Assess candidates for task fit, domain fit, query/document encoding behavior, inference cost, vector dimensions, and deployment constraints.

Dense retrieval may be unnecessary when the workload is dominated by exact identifiers, structured constraints, or straightforward term matching. It may be unsuitable when the model cannot reliably represent the target domain. These are workload-specific conclusions, not universal rules.

Hybrid retrieval can combine complementary retrieval signals, but fusion strategies belong to RET-08 and are not implemented here.

## 6. Compatibility Diagnosis

When retrieval quality unexpectedly deteriorates, use a controlled investigation rather than immediately changing the index or model.

### Step 1: Establish the last known-good configuration

Record the model identity and revision, encoding settings, vector dimensions, normalization policy, scoring metric, dependency versions, and corpus version. Compare these with the current deployment. If the corpus was indexed with a different embedding contract, determine whether re-embedding is required.

### Step 2: Verify mechanical invariants

Check query/document dimensions, data types, finite values, normalization, and score direction. Confirm that query encoding follows the intended instructions and that stored vectors were generated with compatible settings.

Passing these checks establishes basic consistency, not retrieval quality.

### Step 3: Run a controlled comparison

Select representative queries with manually inspected relevant documents. Hold the query set, corpus, and scoring procedure constant. Compare the current system against a known-good, compatible configuration where available.

Inspect:

- Whether previously relevant documents have disappeared from the top results.
- Whether unrelated but semantically similar documents have moved upward.
- Whether failures cluster around particular terms, query types, languages, or document categories.
- Whether the problem began after a model, preprocessing, dependency, or corpus change.

If a known-good configuration restores useful rankings, the changed configuration becomes a strong suspect. If both configurations fail on the same domain-specific cases, investigate model suitability, document content, and the task itself.

Neither outcome proves a single root cause. Change one relevant variable at a time and gather additional evidence before selecting a remedy.

### Step 4: Choose the remedy based on evidence

| Evidence | Next investigation |
|---|---|
| Query and document dimensions differ | Check model configuration and encoding outputs. |
| Dimensions match but the model or revision changed | Verify representation compatibility and assess whether document vectors must be regenerated. |
| Rankings change after a normalization or metric change | Confirm the intended scoring semantics and index configuration. |
| Configuration checks pass, but domain-specific queries fail across compatible setups | Reassess model suitability and inspect the failing documents and queries. |
| Failures appear only after a corpus update | Investigate document preparation, indexing consistency, and content changes. |

This is a focused compatibility investigation, not a full retrieval-evaluation methodology. Formal metrics and benchmark design belong to RET-10; broader retrieval diagnosis belongs to RET-11.

## 7. Multimodal Retrieval: Awareness

Dense retrieval can also represent images, audio, video, and text using modality-specific encoders or a shared representation space designed for cross-modal comparison.

The same compatibility principle applies: equal vector dimensions alone do not make representations meaningfully comparable. The model architecture and training must support the intended relationship between modalities.

Multimodal retrieval adds concerns such as modality-specific relevance, media storage, inference cost, and preprocessing. Full multimodal model training, media ingestion, and specialized evaluation remain outside this chapter.

## Validation Checklist

Before trusting a dense-retrieval baseline, verify:

- [ ] The model revision and dependency versions are pinned and recorded.
- [ ] Query and document encoding follow the intended compatibility contract.
- [ ] Dimensions, data types, finite values, and normalization assumptions are checked.
- [ ] The similarity metric and score direction match the implementation.
- [ ] Results map to stable document IDs and can be inspected.
- [ ] Representative semantic queries and exact-identifier cases are tested.
- [ ] A known-good comparison is available for investigating unexpected regressions.
- [ ] Model or configuration changes trigger an explicit compatibility assessment.

## Key Takeaways

- Dense retrieval compares learned representations rather than relying exclusively on exact term overlap.
- Matching dimensions makes vector operations possible but does not establish semantic compatibility.
- Model revisions, encoding procedures, normalization, and scoring semantics are part of retrieval correctness.
- A runnable baseline establishes expected behavior; controlled comparisons help isolate regressions.
- Model selection should reflect the query distribution, domain, operational constraints, and cost of incorrect results.
- Establish compatibility and baseline behavior before investigating ANN algorithms or tuning search parameters.
