# Reranking Strategies and Cross-Encoders

## 1. Purpose

Reranking improves the ordering of an existing candidate set by applying a more expressive relevance-scoring method to candidates retrieved by an earlier stage.

In a typical retrieval system, the first-stage retriever prioritizes candidate-generation efficiency. A reranker then examines a smaller candidate set in greater detail and produces a revised ordering.

This chapter explains:

- Why retrieval systems separate candidate generation from reranking.
- How Bi-Encoders and Cross-Encoders differ.
- How Cross-Encoders compute query–document relevance scores.
- How reranking strategies differ in computational cost and ranking behavior.
- How to implement a Cross-Encoder reranker with explicit input and output contracts.
- How to validate the implementation and reason about production constraints.

The central engineering principle is:

> A reranker improves the ordering of candidates it receives. It does not recover relevant documents that candidate generation failed to retrieve.

## 2. Learning Objectives

After completing this chapter, you should be able to:

1. Explain why a retrieval system may use different models for candidate generation and reranking.
2. Compare Bi-Encoder and Cross-Encoder architectures.
3. Explain how joint query–document encoding supports relevance scoring.
4. Distinguish a model score from a calibrated probability.
5. Implement a reranker with explicit validation, deterministic ordering, and predictable output behavior.
6. Identify failure conditions in reranker input and output contracts.
7. Explain the engineering trade-offs associated with reranking.

## 3. Prerequisites and Scope Boundaries

This chapter builds on the retrieval concepts established earlier in the Retrieval Engineering domain.

Relevant prerequisites include:

- Dense retrieval and embedding-based similarity.
- Candidate generation and retrieval result sets.
- Ranking scores and ordering.
- Document identifiers and metadata.
- Basic Python typing, exceptions, and automated testing.

The chapter assumes that a first-stage retriever has already produced a candidate set.

### Scope boundaries

| Topic | Primary location |
|---|---|
| Score interpretation and fundamental ranking concepts | RET-09 File 01 |
| Reranking strategies and Cross-Encoder implementation | This file |
| Top-K decisions, ranking errors, and ranking trade-offs | RET-09 File 03 |
| Candidate generation, fusion, and candidate coverage | RET-08 |
| Formal retrieval evaluation and benchmark methodology | RET-10 |
| General retrieval diagnostics | RET-11 |

This chapter introduces the implementation and operational implications of reranking without duplicating the formal evaluation methodology or developing a complete learned-ranking training pipeline.

## 4. Why Reranking Exists

A retrieval system often needs to satisfy two competing requirements:

- Retrieve useful candidates from a potentially large collection.
- Rank those candidates accurately enough to support the downstream application.

Applying the most computationally expensive relevance model to every document may be impractical.

Consider a collection containing one million documents. A query arrives, and the system needs to identify the most relevant results.

A first-stage retriever can use vector search, lexical search, or a combination of retrieval methods to produce a manageable candidate set. A reranker can then spend more computation on those candidates.

```text
User Query
    |
    v
First-Stage Retrieval
    |
    |  Efficient candidate generation
    v
Candidate Set
    |
    v
Reranker
    |
    |  More expressive relevance scoring
    v
Reordered Candidates
    |
    v
Downstream Selection or Retrieval Consumer
```

The first stage and reranker solve different problems.

The first stage answers:

**Which documents should receive further consideration?**

The reranker answers:

**Given these candidates, which should appear first?**

This separation allows the system to allocate computational resources according to the importance of each stage.

### 4.1 Why not use one model for everything?

A single model can be sufficient for small collections or workloads with relaxed latency constraints. However, one-stage retrieval can become problematic when the collection grows or when high-quality relevance ordering is required.

A model optimized for searching a large collection may not provide the strongest possible pairwise relevance judgment. Conversely, a model that jointly processes every query–document pair may be too expensive to run across the entire collection.

A two-stage architecture separates these responsibilities instead of requiring one model to optimize both.

This is an architectural trade-off, not a universal rule. A reranker adds value only when its relevance improvements justify its computational and operational costs.

## 5. Bi-Encoders Versus Cross-Encoders

Bi-Encoders and Cross-Encoders differ primarily in how they represent and compare queries and documents.

### 5.1 Bi-Encoder

A Bi-Encoder independently encodes the query and document.

```text
Query -----------------> Query Encoder -----> Query Vector
                                                    |
                                                    v
                                             Similarity Score
                                                    ^
                                                    |
Document -------------> Document Encoder --> Document Vector
```

The document vector can be computed ahead of time and stored in a vector index. At query time, the system computes the query vector and compares it with stored document vectors.

A simplified similarity calculation is:

\[
s(q,d) = \operatorname{sim}(E_q(q), E_d(d))
\]

Here, \(E_q\) and \(E_d\) represent the query and document encoders. They may share model parameters, depending on the architecture.

**Advantages**

- Document embeddings can be precomputed.
- Large collections can be searched efficiently using vector indexes.
- The same document representation can be reused across many queries.
- Candidate generation can be scaled independently of the reranker.

**Limitations**

- The query and document are encoded independently.
- Fine-grained interactions between individual query and document tokens are not jointly modeled during scoring.
- Semantic similarity does not necessarily equal task-specific relevance.

### 5.2 Cross-Encoder

A Cross-Encoder receives the query and document together.

```text
Query --------\
               \
                ---> Joint Tokenization
               /           |
Document -----/             v
                       Transformer
                           |
                           v
                    Relevance Head
                           |
                           v
                     Scalar Score
```

The model processes the combined input and produces a relevance score.

A simplified representation is:

\[
s(q,d) = f_\theta(q,d)
\]

The model jointly processes the query and document, allowing it to learn interactions between their tokens. This can help distinguish documents that mention similar concepts but differ in whether they actually answer the query.

**Advantages**

- Joint query–document interaction.
- Strong relevance discrimination for many reranking tasks.
- Useful contextual comparisons between the query and each candidate.
- Flexible scoring for task-specific relevance objectives.

**Limitations**

- Each query–document pair requires model computation.
- Document representations generally cannot be precomputed into reusable query-independent embeddings for ordinary Cross-Encoder scoring.
- Long inputs may be truncated.
- Inference cost grows with the number of candidates and the input lengths.

### 5.3 Comparison

| Property | Bi-Encoder | Cross-Encoder |
|---|---|---|
| Query and document encoding | Independent | Joint |
| Document representation reusable across queries | Usually | Not as a standalone embedding for standard pair scoring |
| Large-collection search | Well suited | Usually unsuitable for exhaustive scoring |
| Pairwise token interaction | Limited by independent encoding | Explicitly modeled |
| Typical role | Candidate generation | Candidate reranking |
| Per-candidate scoring cost | Usually lower after embedding and indexing | Usually higher |
| Can recover missing candidates by itself? | Not applicable to its own retrieved set | No |

Neither architecture is universally superior. Their suitability depends on the task, collection size, latency requirements, and quality requirements.

## 6. How a Cross-Encoder Works Internally

A typical Cross-Encoder inference path consists of several stages.

### 6.1 Pair construction

The query and candidate text are combined into the input format expected by the model tokenizer.

Conceptually:

```text
[CLS] query tokens [SEP] document tokens [SEP]
```

The exact format depends on the tokenizer and model architecture.

### 6.2 Tokenization and truncation

Text is converted into token IDs and associated model inputs.

The model has a finite maximum sequence length. If the combined query and document exceed that limit, the configured truncation policy may remove part of the input.

This can cause relevance errors when important evidence occurs near the end of a document.

Truncation should therefore be treated as an explicit model-input policy, not an invisible implementation detail.

### 6.3 Joint contextualization

The Transformer processes the combined sequence. Its attention layers can model relationships between query tokens and document tokens.

For example, a query might ask:

> Which database supports point-in-time recovery?

Two candidates may mention the same database technology, but only one may explain its point-in-time recovery capability. Joint contextualization can help the model distinguish these candidates.

It does not guarantee a correct judgment. Model quality still depends on training data, task alignment, input construction, and other factors.

### 6.4 Relevance scoring

A scoring head transforms the model representation into one or more outputs.

For a conventional single-score reranker, each query–document pair produces one scalar score.

The score is then used to order the candidates.

### 6.5 Batch inference

Instead of invoking the model separately for every candidate, the implementation can submit multiple pairs in a batch.

Batching can improve throughput by reducing per-call overhead and better utilizing hardware. However, larger batches also increase memory use and may affect tail latency.

Batch size must be tuned against actual workload and hardware behavior rather than selected solely for maximum throughput.

## 7. Understanding Reranker Scores

A reranker score is meaningful within the scoring model and task for which it was produced.

A score of `4.2` does not automatically mean that a document has a 92% probability of being relevant. A score of `0.87` is not automatically a calibrated 87% probability either.

Unless the model and its training procedure establish a suitable probabilistic interpretation, treat the output as a ranking score.

### 7.1 Relative ordering

Suppose the model returns:

| Document | Score |
|---|---:|
| `doc-c` | 5.1 |
| `doc-a` | 2.8 |
| `doc-b` | -0.4 |

For a model whose contract specifies higher scores as more relevant, the resulting order is:

1. `doc-c`
2. `doc-a`
3. `doc-b`

The numerical values should not be interpreted as universal relevance measurements.

### 7.2 Score direction is a model contract

The implementation in this chapter assumes **higher scores indicate greater relevance**.

Some models or adapters may expose distances, losses, or other outputs where lower values are better. Such outputs must be converted through an explicit, documented adapter before they enter this reranker.

Do not silently reverse scores based on an assumption about their numerical range.

### 7.3 Do not assume cross-model score comparability

Scores produced by different models may have different distributions and semantics. A score of `3.0` from one reranker is not necessarily comparable to `3.0` from another.

If a system combines scores from different models, it needs a deliberate fusion or normalization strategy. That is a separate design decision from sorting a single reranker's output.

## 8. Reranking Strategies

Reranking is not limited to one architecture or scoring technique.

### 8.1 Cross-Encoder reranking

The system scores each query–document pair with a joint model and orders candidates by the resulting scores.

This is appropriate when pairwise relevance quality matters and the candidate set is manageable.

### 8.2 Lightweight reranking

A lightweight reranker can use task-specific rules or a compact model to refine an existing order.

Examples include domain-specific boosts, freshness adjustments, or a small learned scoring function.

Such approaches may be cheaper, but their effectiveness depends on whether their features capture the relevance signals that matter for the application.

### 8.3 Late-interaction models

Late-interaction architectures, such as ColBERT-style models, retain finer-grained token representations and compare query and document token representations during scoring.

They occupy a different point in the design space from both a single-vector Bi-Encoder and a conventional Cross-Encoder.

Their index structures, storage requirements, and scoring procedures introduce additional engineering considerations. They are useful to recognize as an alternative when single-vector retrieval loses important token-level information but full Cross-Encoder inference is too expensive.

### 8.4 Learning-to-Rank

Learning-to-Rank methods train a scoring function to order documents using relevance labels or preference signals.

Depending on the method, the features may include lexical scores, semantic scores, document metadata, freshness, or other ranking signals.

A learned ranking function can combine multiple signals, but it introduces training-data, feature-quality, and evaluation requirements. Training and deploying a complete Learning-to-Rank pipeline is outside this chapter's implementation scope.

## 9. Candidate-Set Dependence

Reranking is conditional on the candidate set produced upstream.

Let \(C(q)\) be the candidates retrieved for query \(q\). The reranker computes a new ordering over \(C(q)\).

If the truly relevant document is absent from \(C(q)\), the reranker cannot place it first because it never receives it.

```text
Collection
    |
    v
Candidate Generation
    |
    +---- Relevant document missing
    |          |
    |          v
    |     Reranker cannot recover it
    |
    v
Candidate Set
    |
    v
Reranking
    |
    v
Improved or degraded ordering of available candidates
```

This produces two distinct classes of failure:

- **Candidate-generation failure:** A relevant document is not retrieved.
- **Ranking failure:** A relevant document is retrieved but placed too low.

The distinction matters during debugging. Increasing reranker complexity is not a reliable fix for missing candidate coverage.

Likewise, an excellent candidate set does not guarantee an excellent final ordering.

## 10. Practical Implementation with a Cross-Encoder

This section implements a small, explicit reranking boundary using Python, NumPy, and Sentence Transformers.

The implementation is designed around a narrow contract:

- The query must be a non-empty string.
- The candidate collection must be a non-string sequence of dictionaries.
- Each candidate must contain a unique, non-empty string `document_id`.
- Each candidate must contain non-empty string `text`.
- `batch_size` must be a positive built-in integer; Boolean values are rejected.
- An empty candidate sequence returns an empty list without calling the model.
- The model must return exactly one numeric, finite, non-Boolean score per candidate.
- Higher scores indicate greater relevance.
- Equal scores are resolved deterministically by document ID.
- The original top-level candidate dictionaries are not modified.

The output contract deliberately rejects ambiguous or malformed model output rather than silently coercing it into a potentially incorrect ranking.

### 10.1 Implementation

```python
from collections.abc import Sequence
from typing import Any

import math
import numbers

import numpy as np
from sentence_transformers import CrossEncoder

class CrossEncoderReranker:
    """Rerank a candidate sequence using one scalar score per candidate."""

    def __init__(
        self,
        model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2",
        batch_size: int = 32,
    ) -> None:
        self._validate_batch_size(batch_size)

        self.model = CrossEncoder(model_name)
        self.batch_size = batch_size

    @staticmethod
    def _validate_batch_size(batch_size: int) -> None:
        # bool is a subclass of int in Python, so reject it explicitly.
        if type(batch_size) is not int or batch_size <= 0:
            raise ValueError(
                "batch_size must be a positive integer, not a Boolean."
            )

    @staticmethod
    def _validate_query(query: str) -> None:
        if not isinstance(query, str) or not query.strip():
            raise ValueError("query must be a non-empty string.")

    @staticmethod
    def _validate_candidates(
        candidates: Sequence[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        if (
            not isinstance(candidates, Sequence)
            or isinstance(candidates, (str, bytes, bytearray))
        ):
            raise TypeError(
                "candidates must be a non-string sequence of dictionaries."
            )

        validated: list[dict[str, Any]] = []
        seen_ids: set[str] = set()

        for index, candidate in enumerate(candidates):
            if not isinstance(candidate, dict):
                raise TypeError(
                    f"Candidate at index {index} must be a dictionary."
                )

            document_id = candidate.get("document_id")
            text = candidate.get("text")

            if (
                not isinstance(document_id, str)
                or not document_id.strip()
            ):
                raise ValueError(
                    f"Candidate at index {index} must have a non-empty "
                    "string document_id."
                )

            if document_id in seen_ids:
                raise ValueError(
                    f"Duplicate document_id: {document_id!r}"
                )

            if not isinstance(text, str) or not text.strip():
                raise ValueError(
                    f"Candidate {document_id!r} must have non-empty text."
                )

            seen_ids.add(document_id)
            validated.append(candidate.copy())

        return validated

    @staticmethod
    def _validate_scores(
        raw_scores: Any,
        expected_count: int,
    ) -> list[float]:
        # Validate the original container before NumPy can coerce mixed
        # values such as [True, 0.5] into [1.0, 0.5].
        if isinstance(raw_scores, (bool, np.bool_)):
            raise ValueError("Reranker output must not be Boolean.")

        if isinstance(raw_scores, (str, bytes, bytearray)):
            raise ValueError("Reranker output must be numeric scores.")

        if isinstance(raw_scores, np.ndarray):
            if raw_scores.shape != (expected_count,):
                raise ValueError(
                    "Expected exactly one score per candidate with shape "
                    f"({expected_count},); received shape "
                    f"{raw_scores.shape}."
                )

            # A NumPy array has already committed to a dtype. Boolean and
            # non-numeric dtypes can be rejected before element conversion.
            if raw_scores.dtype.kind not in "iuf":
                raise ValueError(
                    "Reranker output must contain real numeric scores."
                )

            raw_values = raw_scores.tolist()

        elif isinstance(raw_scores, Sequence):
            if len(raw_scores) != expected_count:
                raise ValueError(
                    "Expected exactly one score per candidate; "
                    f"expected {expected_count}, received "
                    f"{len(raw_scores)}."
                )

            raw_values = list(raw_scores)

        else:
            raise ValueError(
                "Reranker output must be a one-dimensional numeric "
                "sequence or NumPy array."
            )

        validated_scores: list[float] = []

        for index, score in enumerate(raw_values):
            if isinstance(score, (bool, np.bool_)):
                raise ValueError(
                    f"Score at index {index} must not be Boolean."
                )

            if not isinstance(
                score,
                (numbers.Real, np.integer, np.floating),
            ):
                raise ValueError(
                    f"Score at index {index} must be numeric."
                )

            try:
                numeric_score = float(score)
            except (TypeError, ValueError, OverflowError) as exc:
                raise ValueError(
                    f"Score at index {index} cannot be converted to float."
                ) from exc

            if not math.isfinite(numeric_score):
                raise ValueError(
                    f"Score at index {index} must be finite."
                )

            validated_scores.append(numeric_score)

        return validated_scores

    def rerank(
        self,
        query: str,
        candidates: Sequence[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        self._validate_query(query)
        validated = self._validate_candidates(candidates)

        if not validated:
            return []

        pairs = [
            (query, candidate["text"])
            for candidate in validated
        ]

        raw_scores = self.model.predict(
            pairs,
            batch_size=self.batch_size,
        )

        scores = self._validate_scores(
            raw_scores,
            expected_count=len(validated),
        )

        ranked = [
            (candidate, score)
            for candidate, score in zip(validated, scores)
        ]

        # Higher score first; document_id breaks ties deterministically.
        ranked.sort(
            key=lambda item: (
                -item[1],
                item[0]["document_id"],
            )
        )

        result: list[dict[str, Any]] = []

        for candidate, score in ranked:
            output = candidate.copy()
            output["reranker_score"] = score
            result.append(output)

        return result
```

### 10.2 Why the validation boundary matters

The reranker is an integration boundary between a model library and the rest of the retrieval system.

Without explicit validation, malformed outputs can cause subtle failures:

- A Boolean score may be converted to `1.0` or `0.0`.
- A string such as `"0.9"` may be implicitly converted to a float.
- A multi-output model may produce a two-dimensional array where the code expects one score per candidate.
- A missing score may shift assumptions about candidate-to-score correspondence.
- A NaN score may lead to surprising or inconsistent ordering.
- Duplicate IDs may make later result tracking or debugging ambiguous.

Validation must happen before normalization or conversion destroys information needed to determine whether an input was valid.

The implementation accepts one-dimensional NumPy arrays with real integer or floating-point dtypes, as well as Python sequences whose individual elements are checked before conversion. It deliberately rejects Boolean arrays, object arrays, string arrays, nested sequences, and mixed Boolean/numeric Python sequences.

### 10.3 Important implementation assumptions

This implementation has deliberate limits:

1. It expects a standard single-score Cross-Encoder interface whose `predict` method returns one score per input pair.
2. It expects higher scores to indicate higher relevance.
3. It treats document IDs as exact, case-sensitive identifiers.
4. It validates the candidate sequence and returns shallow copies of candidate dictionaries.
5. It does not implement retries, timeouts, concurrency control, caching, or serving-level fallback behavior.
6. It does not claim that the model's scores are probabilities.
7. It does not guarantee that every candidate fits within the model's input-length limit.
8. It expects a one-dimensional score sequence or NumPy array. Other output containers require an explicit adapter.

If an application uses a model with different output semantics, introduce an adapter that explicitly maps the model's outputs into this contract.

## 11. Production Engineering Considerations

A working reranking function is only one component of a production retrieval system.

### 11.1 Model lifecycle

Load the model during application or worker initialization rather than loading it for every query.

Repeated model initialization can waste time and memory and create unnecessary resource pressure.

Model lifecycle decisions should also account for process forking, GPU initialization, worker count, and the deployment environment.

### 11.2 Batching and resource use

Batching improves execution efficiency in many inference workloads, but larger batches increase the amount of data processed simultaneously.

The appropriate batch size depends on:

- Model size.
- Input sequence lengths.
- Available CPU or GPU memory.
- Request concurrency.
- Throughput targets.
- Tail-latency objectives.

Measure performance under representative workloads rather than selecting a batch size solely from a benchmark on short inputs.

### 11.3 Input length and truncation

The combined query and document must fit the model's configured input limits.

A production system should make truncation behavior explicit and monitor whether important evidence is being removed. Long-document applications may need a separate passage-selection or chunking strategy.

Such a strategy changes the input representation and must be evaluated as part of the retrieval pipeline.

### 11.4 Error handling and fallback

The implementation intentionally raises exceptions for invalid input and malformed model output. Model invocation errors also propagate to the caller.

A serving layer must decide how to handle these failures. Depending on the application's reliability requirements, options may include:

- Returning a controlled error.
- Using the original first-stage ranking as a documented fallback.
- Applying bounded retries for failures known to be transient.
- Rejecting a request when the ranking contract cannot be satisfied.

A fallback must not conceal persistent defects. Record failure reasons, monitor fallback rates, and distinguish invalid requests from model-serving failures.

Do not silently convert malformed model scores into arbitrary defaults.

### 11.5 Observability

Useful operational signals include:

- Candidate count before reranking.
- Number of pairs scored per request.
- Input-length and truncation distributions.
- Model inference latency.
- Batch size.
- Model errors and malformed-output errors.
- Fallback frequency.
- Resource utilization.

Metrics should be designed to avoid exposing sensitive query or document content.

### 11.6 Model and data versioning

The reranker model, tokenizer configuration, truncation policy, and scoring adapter can all affect ranking behavior.

Record relevant versions so that a change in ranking quality can be investigated and reproduced.

A model upgrade should not be assumed to improve relevance simply because it is newer or larger.

### 11.7 Security and privacy

Queries and candidate documents may contain confidential or personal information.

Production implementations should apply appropriate access controls, data-handling policies, logging restrictions, and model-provider controls. Avoid logging complete text pairs merely to debug a scoring issue.

## 12. When Reranking Helps—and When It Does Not

Reranking is useful when the first-stage candidate set has reasonable coverage but its ordering needs improvement.

It may be less useful when:

- The relevant documents are routinely absent from the candidate set.
- First-stage ranking already meets the application's quality requirements.
- The additional inference cost exceeds the value of the expected improvement.
- The reranker is poorly aligned with the domain or relevance definition.
- Input truncation removes decisive evidence.
- The candidate set contains too little useful diversity or too many near-duplicates.

A reranker is not automatically beneficial merely because it is more computationally expensive or uses a more expressive model.

The engineering decision must consider the retrieval system as a whole.

## 13. Worked Scenario

Suppose a knowledge base contains technical documentation, and a user asks:

> How can I restore a database to a specific point in time?

The first-stage retriever returns three candidates:

| Candidate | First-stage position | Content summary |
|---|---:|---|
| `doc-a` | 1 | General database backup overview |
| `doc-b` | 2 | Point-in-time recovery procedure |
| `doc-c` | 3 | Database performance tuning |

The first-stage retriever ranks `doc-a` first because it contains broad backup-related language.

A Cross-Encoder evaluates each candidate against the full query and produces the following hypothetical scores:

| Candidate | Reranker score |
|---|---:|
| `doc-a` | 1.4 |
| `doc-b` | 4.7 |
| `doc-c` | -0.2 |

The reranked order becomes:

1. `doc-b`
2. `doc-a`
3. `doc-c`

The reranker improves the order because `doc-b` directly addresses the requested recovery operation.

However, suppose the recovery procedure was never included in the first-stage candidate set. The reranker would have no opportunity to return it.

This example demonstrates the distinction between improving relevance ordering and improving candidate coverage.

The scores are illustrative values, not calibrated probabilities or measured performance results.

## 14. Interview Preparation

### Question 1: Why use a Cross-Encoder after a Bi-Encoder?

A strong answer should explain that a Bi-Encoder supports efficient large-scale retrieval through reusable document embeddings, while a Cross-Encoder jointly processes the query and each candidate to provide more expressive relevance scoring. The architecture balances candidate-generation efficiency with downstream ranking quality.

### Question 2: Can a Cross-Encoder fix poor retrieval recall?

No. It can only reorder the candidates it receives. If a relevant document is absent, the reranker cannot recover it without another retrieval operation.

### Question 3: Why is a Cross-Encoder usually not used to score an entire large collection?

Each query–document pair requires model inference, making exhaustive scoring expensive for large collections. A first-stage retriever narrows the search space before reranking.

### Question 4: Why should you not interpret a reranker score as a probability?

The output's meaning depends on the model and its training objective. A scalar ranking score does not automatically have calibrated probabilistic semantics.

### Question 5: Why reject a model output with shape `(n, 2)`?

The implementation's contract requires exactly one score per candidate. A two-column output is ambiguous unless the model adapter defines what each column represents and how it should be converted into the required score.

Silently selecting a column would hide a mismatch between the model's output and the application's assumptions.

### Question 6: Why reject Boolean scores if Python can convert them to floats?

Because the ability to convert a value does not establish that it is a valid relevance score. Boolean outputs often indicate an incorrect adapter or mock, and converting them to `0.0` or `1.0` could produce a plausible-looking but invalid ranking.

### Question 7: What should happen when reranker inference fails in production?

The serving layer should apply an explicit failure policy based on reliability requirements. A controlled error or documented fallback to the first-stage ranking may be appropriate. Failures should be observable, and fallback behavior should not conceal persistent model or integration defects.

## 15. Common Misconceptions

**Misconception: A more expensive model must rank better.**

Model capacity alone does not guarantee better relevance. Task alignment, data quality, input handling, and evaluation matter.

**Misconception: Cross-Encoder scores are probabilities.**

They are ranking scores unless an appropriate probabilistic interpretation has been established.

**Misconception: Reranking repairs candidate-generation failures.**

Reranking is constrained by the candidates it receives.

**Misconception: Any numeric-looking output is a valid score.**

The output must satisfy the model adapter's contract. Strings, Boolean values, non-finite numbers, and unexpected array shapes should not be silently accepted.

**Misconception: Deterministic sorting makes the model deterministic.**

A deterministic tie-breaker stabilizes the ordering of equal scores. It does not guarantee identical model outputs across hardware, model versions, precision modes, or nondeterministic execution paths.

**Misconception: A successful unit test proves production readiness.**

Unit tests validate specific behaviors. Production readiness also requires realistic workload tests, operational monitoring, resource testing, and validation against the application's relevance requirements.

## 16. Self-Assessment and Testing

The following tests are illustrative and have **not been executed as part of this documentation**. They are designed to exercise the input contract, output contract, ordering behavior, and non-mutation guarantee.

Place the implementation in an importable module named `reranker.py` and the tests in a test module such as `test_reranker.py`.

### 16.1 Test fixture

```python
import numpy as np
import pytest

from reranker import CrossEncoderReranker

class FakeCrossEncoder:
    def __init__(self, scores):
        self.scores = scores
        self.received_pairs = None

    def predict(self, pairs, batch_size):
        self.received_pairs = pairs

        if callable(self.scores):
            return self.scores(pairs)

        return self.scores

def make_reranker(scores, batch_size=32):
    reranker = CrossEncoderReranker.__new__(
        CrossEncoderReranker
    )
    reranker.model = FakeCrossEncoder(scores)
    reranker.batch_size = batch_size
    return reranker
```

The fixture bypasses real model loading so the tests focus on the reranking contract. It does not validate the behavior or accuracy of a real Cross-Encoder model.

### 16.2 Ordering and deterministic tie-breaking

```python
def test_reranks_by_score_and_breaks_ties_by_document_id():
    reranker = make_reranker([0.8, 0.8, 0.3])

    candidates = [
        {"document_id": "doc-b", "text": "Second"},
        {"document_id": "doc-a", "text": "First"},
        {"document_id": "doc-c", "text": "Third"},
    ]

    result = reranker.rerank("example query", candidates)

    assert [item["document_id"] for item in result] == [
        "doc-a",
        "doc-b",
        "doc-c",
    ]
    assert [item["reranker_score"] for item in result] == [
        0.8,
        0.8,
        0.3,
    ]
```

### 16.3 Empty candidate sequence

```python
def test_empty_candidates_return_empty_list_without_inference():
    reranker = make_reranker([])

    result = reranker.rerank("example query", [])

    assert result == []
    assert reranker.model.received_pairs is None
```

### 16.4 Invalid candidate containers

```python
@pytest.mark.parametrize(
    "candidates",
    [
        "not a candidate sequence",
        b"not a candidate sequence",
        {"document_id": "doc-a", "text": "A mapping"},
        123,
        None,
    ],
)
def test_rejects_invalid_candidate_containers(candidates):
    reranker = make_reranker([])

    with pytest.raises(TypeError):
        reranker.rerank("query", candidates)

    assert reranker.model.received_pairs is None
```

This checks that strings, bytes, a dictionary used as the outer container, scalar values, and `None` are rejected before model inference.

### 16.5 Invalid query

```python
@pytest.mark.parametrize(
    "query",
    ["", "   ", None, 123],
)
def test_rejects_invalid_query(query):
    reranker = make_reranker([])

    with pytest.raises(ValueError):
        reranker.rerank(query, [])
```

### 16.6 Invalid candidate records

```python
def test_rejects_non_dictionary_candidate():
    reranker = make_reranker([0.5])

    with pytest.raises(TypeError):
        reranker.rerank(
            "query",
            ["not a candidate dictionary"],
        )

def test_rejects_duplicate_document_ids():
    reranker = make_reranker([0.5, 0.4])

    candidates = [
        {"document_id": "doc-a", "text": "First"},
        {"document_id": "doc-a", "text": "Duplicate"},
    ]

    with pytest.raises(ValueError, match="Duplicate"):
        reranker.rerank("query", candidates)

@pytest.mark.parametrize(
    "candidate",
    [
        {"text": "Missing ID"},
        {"document_id": "", "text": "Empty ID"},
        {"document_id": "doc-a", "text": ""},
        {"document_id": "doc-a", "text": "   "},
        {"document_id": "doc-a", "text": None},
    ],
)
def test_rejects_invalid_candidate_fields(candidate):
    reranker = make_reranker([0.5])

    with pytest.raises(ValueError):
        reranker.rerank("query", [candidate])
```

### 16.7 Output-count mismatch

```python
def test_rejects_wrong_number_of_scores():
    reranker = make_reranker([0.9])

    candidates = [
        {"document_id": "doc-a", "text": "First"},
        {"document_id": "doc-b", "text": "Second"},
    ]

    with pytest.raises(ValueError, match="Expected exactly one score"):
        reranker.rerank("query", candidates)
```

This tests a one-dimensional sequence with the wrong number of scores. It is distinct from testing an array with the correct count but an unexpected shape.

### 16.8 Unexpected output shape

```python
def test_rejects_multi_output_scores():
    reranker = make_reranker(
        np.array([
            [0.9, 0.1],
            [0.2, 0.8],
        ])
    )

    candidates = [
        {"document_id": "doc-a", "text": "First"},
        {"document_id": "doc-b", "text": "Second"},
    ]

    with pytest.raises(ValueError, match="shape"):
        reranker.rerank("query", candidates)
```

### 16.9 Boolean and non-numeric scores

```python
@pytest.mark.parametrize(
    "scores",
    [
        [True, False],
        [True, 0.5],
        np.array([True, False], dtype=bool),
        ["0.9", "0.2"],
        [object(), object()],
    ],
)
def test_rejects_boolean_and_non_numeric_scores(scores):
    reranker = make_reranker(scores)

    candidates = [
        {"document_id": "doc-a", "text": "First"},
        {"document_id": "doc-b", "text": "Second"},
    ]

    with pytest.raises(ValueError):
        reranker.rerank("query", candidates)
```

The mixed-type case `[True, 0.5]` is particularly important: it verifies that validation happens before a coercive conversion can turn the Boolean into a floating-point value.

### 16.10 Non-finite scores

```python
@pytest.mark.parametrize(
    "scores",
    [
        [float("nan")],
        [float("inf")],
        [float("-inf")],
    ],
)
def test_rejects_non_finite_scores(scores):
    reranker = make_reranker(scores)

    candidates = [
        {"document_id": "doc-a", "text": "First"},
    ]

    with pytest.raises(ValueError, match="finite"):
        reranker.rerank("query", candidates)
```

### 16.11 Invalid batch size

```python
@pytest.mark.parametrize(
    "batch_size",
    [0, -1, True, False, 1.5, "32"],
)
def test_rejects_invalid_batch_size(batch_size):
    with pytest.raises(ValueError):
        CrossEncoderReranker._validate_batch_size(batch_size)
```

### 16.12 Candidate dictionaries are not mutated

```python
def test_does_not_mutate_original_candidate_dictionaries():
    reranker = make_reranker([0.9])

    candidate = {
        "document_id": "doc-a",
        "text": "Original text",
        "metadata": {"source": "manual"},
    }

    original_top_level = candidate.copy()

    result = reranker.rerank("query", [candidate])

    assert candidate == original_top_level
    assert "reranker_score" not in candidate
    assert result[0]["reranker_score"] == 0.9
    assert result[0] is not candidate
```

This verifies top-level non-mutation. The copy is shallow, so nested metadata objects are shared between the input and output dictionaries.

### 16.13 Testing responsibilities

These tests exercise contract validation and deterministic ordering. They do not establish:

- That the selected model improves relevance on the target dataset.
- That inference meets production latency objectives.
- That GPU memory use remains acceptable under concurrency.
- That the model's score direction matches an independently verified model specification.
- That a serving layer implements the intended timeout and fallback policy.

Those questions require additional integration, performance, and relevance testing.

## 17. Key Takeaways and Next Step

Reranking applies a more expressive relevance-scoring method to a candidate set produced by an earlier retrieval stage. Cross-Encoders achieve this by jointly processing queries and candidate documents, enabling more detailed relevance judgments at a higher computational cost.

The implementation contract is as important as the model choice. A reliable reranker must validate its inputs, enforce an unambiguous score contract, reject malformed output, and order results deterministically.

Most importantly, reranking and candidate generation address different failure modes. A reranker can improve the order of retrieved candidates, but it cannot compensate for relevant documents that were never retrieved.

The next chapter, **`03-Top-K-Decisions-Ranking-Errors-and-Trade-offs.md`**, will examine how ranking decisions affect final result selection, how ranking errors arise, and how engineers reason about the trade-offs involved in selecting and presenting ranked results.
