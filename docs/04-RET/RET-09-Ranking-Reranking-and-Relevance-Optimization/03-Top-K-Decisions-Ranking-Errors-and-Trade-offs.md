# Top-K Decisions, Ranking Errors, and Trade-offs

## 1. Purpose

Ranking systems produce an ordered list of candidates, but production systems must also decide which candidates to retain, how many to return, and what to do when candidates near the selection boundary are difficult to distinguish.

These decisions affect more than presentation. They influence relevance, latency, computational cost, downstream context size, user experience, and system reliability.

This chapter examines the engineering decisions involved in selecting the final candidates from a ranked list. It focuses on selection boundaries, top-K behavior, score thresholds, ties, duplicates, ranking instability, and practical implementation.

The central principle is:

> A ranking system determines relative order. A selection policy determines which candidates survive.

A technically correct ranking can still produce poor retrieval outcomes when its selection policy is inappropriate.

## 2. Learning Objectives

After completing this chapter, you should be able to:

- Distinguish ranking from candidate selection.
- Explain the roles of candidate depth, reranking depth, and final K.
- Choose between fixed-K, threshold-based, and hybrid selection.
- Identify errors caused by selection boundaries.
- Explain why score gaps do not automatically establish relevance.
- Implement deterministic top-K selection with explicit validation.
- Handle ties, duplicate identifiers, and invalid scores safely.
- Recognize ranking instability and its operational consequences.
- Design tests for selection behavior and numeric edge cases.
- Evaluate the trade-offs between retrieval quality, latency, and downstream cost.

## 3. Prerequisites and Scope Boundaries

This chapter assumes familiarity with:

- Candidate retrieval and candidate generation.
- Relevance scores and ranking order.
- Reranking, including Cross-Encoder-based approaches.
- Basic Python collections, sorting, and testing.

The surrounding retrieval curriculum separates responsibilities deliberately:

| Topic | Primary responsibility |
|---|---|
| RET-08 | Candidate generation, retrieval fusion, candidate depth, deduplication, and coverage |
| RET-09 File 01 | Candidate scores and relevance ordering |
| RET-09 File 02 | Reranking strategies and Cross-Encoders |
| RET-09 File 03 | Final selection, top-K decisions, boundary errors, and trade-offs |
| RET-10 | Formal retrieval evaluation, relevance judgments, and benchmark methodology |
| RET-11 | Broader retrieval diagnostics and troubleshooting |

This chapter uses evaluation concepts when explaining engineering trade-offs, but it does not attempt to teach a complete evaluation methodology. Likewise, it discusses duplicate candidates as a selection concern without replacing the broader deduplication and coverage treatment in RET-08.

## 4. Ranking Versus Selection

Ranking and selection are related but distinct operations.

Suppose a retrieval system produces these candidates:

| Candidate | Score | Rank |
|---|---:|---:|
| A | 0.94 | 1 |
| B | 0.89 | 2 |
| C | 0.84 | 3 |
| D | 0.63 | 4 |
| E | 0.51 | 5 |

A ranking operation orders the candidates by score. A selection operation decides how many candidates to retain and whether any candidate should be excluded.

If the policy selects the top three, the final set is A, B, and C. The ranking operation itself does not determine whether three is the right number.

### 4.1 Why the distinction matters

A system can rank candidates correctly but still return a poor result set.

For example:

- A fixed top-10 policy can include irrelevant candidates when only three are useful.
- A top-3 policy can exclude relevant candidates ranked fourth or fifth.
- A strict score threshold can return no results for a difficult query.
- A permissive threshold can admit weak candidates.
- A ranking change that swaps two low-ranked candidates may be harmless, while a change at the selection boundary may alter the final result set.

Consequently, ranking quality and selection quality must be reasoned about separately.

### 4.2 The selection contract

A production selection policy should define:

1. The maximum number of returned candidates.
2. Whether a minimum relevance threshold is applied.
3. How ties are resolved.
4. Whether duplicate candidate identifiers are permitted.
5. How invalid or non-finite scores are handled.
6. Whether an empty result set is allowed.
7. Whether candidate validation occurs even when the requested K is zero.

These are contract decisions, not incidental implementation details.

## 5. Candidate Depth, Reranking Depth, and Final K

Retrieval pipelines commonly have multiple candidate counts.

Consider this simplified pipeline:

```text
Initial retrieval
      |
      v
Retrieve 500 candidates
      |
      v
Deduplicate and apply constraints
      |
      v
Rerank 100 candidates
      |
      v
Select final 10 candidates
      |
      v
Return results or build downstream context
```

The numbers are illustrative, not universal recommendations.

### 5.1 Candidate depth

Candidate depth is the number of candidates retrieved or made available at an earlier stage.

A shallow candidate pool may omit relevant documents before the reranker has an opportunity to evaluate them.

A deeper pool can improve the opportunity to discover relevant candidates, but it may increase:

- Retrieval latency.
- Memory use.
- Reranking cost.
- Data transfer.
- Deduplication and filtering work.

A reranker cannot recover a relevant candidate that never enters its input set.

### 5.2 Reranking depth

Reranking depth is the number of candidates passed to the reranking stage.

If the reranker processes only the first 20 retrieved candidates, a relevant candidate ranked 21st by the initial retriever will not benefit from reranking.

Increasing reranking depth can improve the opportunity to correct first-stage ordering errors, but expensive rerankers may make this increase costly.

### 5.3 Final K

Final K is the maximum number of candidates retained after ranking and selection.

For example, a retrieval system might rerank 100 candidates and return 10.

Final K is not necessarily the number of documents ultimately inserted into an LLM prompt. A later context-building stage may exclude documents because of token budgets, redundancy, access constraints, or other application policies.

### 5.4 Why these values must not be conflated

Increasing final K does not recover candidates that were excluded before reranking. Increasing reranking depth does not guarantee that more relevant candidates exist. Increasing initial candidate depth does not automatically improve the final set if the additional candidates are low quality.

Tune each depth according to its own bottleneck.

## 6. Why K Is an Engineering Decision

K is often treated as a configuration value. In practice, it expresses a trade-off between result coverage and downstream cost.

A larger K may provide:

- More opportunities to include relevant evidence.
- Better coverage when relevant material is distributed across multiple documents.
- Greater resilience when the top-ranked candidate is incomplete.
- More alternatives for downstream selection or synthesis.

It may also cause:

- More irrelevant or redundant results.
- Greater latency and memory consumption.
- Higher embedding, reranking, or downstream processing costs.
- Larger prompts and more difficult evidence synthesis.
- Increased exposure to conflicting or low-quality information.

A smaller K reduces some costs but risks excluding useful material.

### 6.1 K depends on the application

Different applications have different selection requirements.

| Application | Important selection consideration |
|---|---|
| Search results page | User attention and result diversity |
| RAG context construction | Evidence coverage, redundancy, and token budget |
| Product recommendation | Candidate usefulness and catalog diversity |
| Support knowledge retrieval | Coverage of the specific issue and authoritative evidence |
| Classification with candidate labels | Risk of excluding the correct label |
| Agent tool selection | Execution cost and the consequences of choosing an unsuitable tool |

There is no universally optimal K independent of the task.

### 6.2 K is not a relevance guarantee

Returning exactly ten candidates does not mean that ten candidates are relevant. It means the selection policy retained ten candidates, assuming at least ten eligible candidates existed.

Likewise, returning three candidates does not establish that all three satisfy the user's needs.

Candidate count is a quantity. Relevance is a quality property.

## 7. Ranking Cutoffs and Their Errors

A selection cutoff divides candidates into retained and excluded groups.

For a top-K policy, the boundary is determined by rank. For a threshold policy, it is determined by the configured score threshold.

### 7.1 Boundary errors

Two important errors can occur near the cutoff.

**False exclusion:** A relevant candidate is excluded because it falls below the selection boundary.

**False inclusion:** An irrelevant or insufficiently useful candidate is retained because it falls above the boundary.

These errors can occur even when the ranking order is internally consistent.

Consider:

| Candidate | Score | Relevant? | Top-3 result |
|---|---:|---|---|
| A | 0.91 | Yes | Retained |
| B | 0.88 | Yes | Retained |
| C | 0.79 | No | Retained |
| D | 0.77 | Yes | Excluded |
| E | 0.42 | No | Excluded |

The top-3 policy includes C and excludes D. The scores alone do not reveal whether this is a relevance error; the relevance labels are needed to establish that.

The example illustrates why a selection policy cannot be judged solely by the number of returned candidates or their scores.

### 7.2 Boundary sensitivity

A selection policy is boundary-sensitive when a small change in ranking causes a meaningful change in the final candidate set.

For example, if the third and fourth candidates have nearly identical scores, a small model or numerical change may exchange their positions. If only three candidates are retained, the change affects which document reaches the downstream stage.

A similar swap at ranks 80 and 81 may have no effect when the final K is 10.

This means ranking changes should be interpreted in relation to the selection boundary, not just by examining whether any ranks changed.

### 7.3 Practical implications

When investigating selection errors, ask:

- Was the relevant candidate retrieved?
- Did it reach the reranker?
- What rank did it receive?
- Was it excluded by K, a threshold, or another constraint?
- Did a tie-breaking rule determine the outcome?
- Would a different selection policy have retained it?
- What additional latency or cost would that policy introduce?

These questions help distinguish candidate-generation failures from ranking and selection failures.

## 8. Fixed-K, Threshold-Based, and Hybrid Selection

Three common policies are fixed-K, threshold-based, and hybrid selection.

### 8.1 Fixed-K selection

A fixed-K policy returns up to K eligible candidates, regardless of the absolute score values.

For example:

```python
selected = ranked_candidates[:10]
```

Assuming the input is already correctly ranked, this retains at most ten candidates.

**Advantages**

- Simple and predictable result count.
- Straightforward latency and downstream budget planning.
- Easy to explain and test.

**Limitations**

- Can retain weak candidates when all scores are low.
- Can exclude useful candidates just below the boundary.
- Does not adapt to query difficulty or score distribution.

Fixed-K is appropriate when downstream consumers require a predictable maximum count and the system can tolerate variation in candidate quality.

### 8.2 Threshold-based selection

A threshold policy retains candidates whose scores meet a configured minimum.

```python
selected = [
    candidate
    for candidate in ranked_candidates
    if candidate["reranker_score"] >= min_score
]
```

**Advantages**

- Can return fewer candidates when available candidates are weak.
- Expresses a minimum score requirement.
- Can avoid filling result sets with candidates that do not meet a configured cutoff.

**Limitations**

- May return zero candidates.
- Depends on the score scale and calibration.
- A threshold that works for one model or query distribution may not work for another.
- Can produce unpredictable result counts.

A score threshold is meaningful only in the context of the score-producing model and its behavior. A score of 0.8 is not automatically an 80% probability of relevance.

### 8.3 Hybrid selection

A hybrid policy combines a minimum score threshold with a maximum result count.

```python
selected = [
    candidate
    for candidate in ranked_candidates
    if candidate["reranker_score"] >= min_score
][:k]
```

This policy returns no more than K candidates and excludes candidates below the configured threshold.

**Advantages**

- Limits downstream processing cost.
- Avoids returning candidates below the configured score cutoff.
- Allows result counts to vary with the available candidates.

**Limitations**

- Can return fewer than K candidates, including none.
- Still depends on the meaning and stability of the score threshold.
- Does not guarantee relevance or diversity.

### 8.4 Choosing a policy

Choose based on application requirements rather than convenience alone.

| Requirement | Candidate policy to consider |
|---|---|
| Predictable maximum result count | Fixed-K |
| Exclude candidates below a score requirement | Threshold-based |
| Bound result count and apply a minimum score | Hybrid |
| Must return at least one candidate | Requires an explicit fallback policy |
| Must satisfy a hard token budget | Requires downstream budget-aware selection |

A requirement to return at least one candidate should not silently override a minimum relevance requirement. If no candidate meets the threshold, the system should apply an explicit fallback or return no result.

## 9. Score Gaps and Boundary Sensitivity

The difference between adjacent scores can provide information about ranking structure, but it should not be overinterpreted.

Suppose the reranker produces:

```text
A: 0.91
B: 0.89
C: 0.88
D: 0.53
E: 0.51
```

The gap between C and D is much larger than the gap between A, B, and C.

This may suggest a natural separation in the score distribution. However, the gap alone does not prove that A, B, and C are relevant or that D and E are irrelevant.

### 9.1 What score gaps can tell you

Score gaps can help identify:

- Candidates with similar scores near the selection boundary.
- Abrupt changes in the score distribution.
- Potentially unstable ordering when scores are nearly tied.
- Cases worth examining during offline evaluation.

### 9.2 What score gaps cannot establish by themselves

A score gap does not automatically establish:

- A calibrated probability of relevance.
- A universal threshold suitable for every query.
- A reliable semantic distinction between candidates.
- That the highest-scoring group is complete.
- That lower-scoring candidates are irrelevant.

The score's interpretation depends on the model, training objective, input distribution, and scoring method.

### 9.3 Avoid arbitrary gap-based rules

A policy such as “stop when the score gap exceeds 0.2” may be useful only if supported by empirical evidence and a clear application requirement.

Without validation, such a rule can behave inconsistently across queries or model versions.

If a gap-based policy is considered, evaluate its behavior across representative queries and monitor the effect on relevance, result count, and downstream outcomes.

## 10. Ties and Deterministic Selection

Two candidates can receive identical scores. This can happen because of rounding, model behavior, quantization, or genuinely equal output values.

If the selection boundary falls inside a group of tied candidates, the system needs a tie-breaking policy.

Consider:

```text
A: 0.91
B: 0.88
C: 0.88
D: 0.88
E: 0.73
```

With K equal to three, the system must choose between B, C, and D if it cannot retain all three tied candidates.

### 10.1 Why implicit tie-breaking is risky

A system that relies on input order may produce different selected sets when:

- Database query order changes.
- Parallel retrieval returns candidates in a different order.
- A collection implementation changes.
- Candidates are merged from multiple retrievers.
- A new software version changes iteration behavior.

This makes failures harder to reproduce and can create noisy changes in downstream outputs.

### 10.2 Explicit tie-breaking

A deterministic policy can order candidates by:

1. Descending primary score.
2. A stable, unique candidate identifier in ascending lexical order.

For example:

```python
ranked = sorted(
    candidates,
    key=lambda candidate: (
        -candidate["reranker_score"],
        candidate["document_id"],
    ),
)
```

This makes the result deterministic for the same candidate identifiers and normalized scores.

A stable identifier is not necessarily a relevance signal. It is a deterministic fallback used only when the primary scores tie.

If the application has a justified secondary ranking criterion, that criterion can be used instead. The policy should be documented and consistently applied.

### 10.3 Determinism has limits

Deterministic selection does not guarantee that the same candidates will be retrieved on every run. If candidate generation, model inference, or upstream filtering changes the input set, the output may also change.

Deterministic tie-breaking guarantees a specific outcome only for the same validated candidate set under the same ordering contract.

## 11. Duplicate and Redundant Candidates

Duplicate candidates can waste selection capacity.

For example, a result set may contain several records referring to the same document or several highly overlapping passages from the same source.

If the final K is five and three selected entries convey nearly identical information, the result set may have less useful coverage than its size suggests.

### 11.1 Duplicate identifiers versus redundant content

These are different conditions:

- **Duplicate identifier:** Two candidate records use the same canonical document identifier.
- **Redundant content:** Different identifiers refer to identical or highly overlapping information.

Duplicate identifiers can often be detected through exact identifier comparison.

Content redundancy requires a different policy, potentially using canonicalization, passage overlap, content hashes, or semantic similarity.

A unique identifier does not prove that two candidates contain distinct information.

### 11.2 Why the distinction matters

A selection function should not silently assume that unique IDs imply unique information. Conversely, it should not silently collapse records with different IDs without an application-specific reason.

The correct behavior depends on the contract established by earlier retrieval stages.

In the implementation below, duplicate identifiers are rejected as a contract violation. Content-level deduplication remains the responsibility of an explicitly defined upstream or downstream component.

### 11.3 Selection capacity

Suppose a result set has a final K of five. If four selected candidates are redundant, only one position remains for distinct evidence.

This can reduce the usefulness of the selected set even if every individual candidate has a high score.

For applications requiring coverage across sources, topics, or evidence types, plain top-K selection may be insufficient. Diversity-aware or constraint-aware selection should be treated as a separate, explicitly designed policy rather than hidden inside a generic top-K helper.

## 12. Ranking Instability and Reproducibility

A ranking system can produce different orders for the same or nearly identical query inputs.

Potential causes include:

- Changes in candidate retrieval.
- Different model versions.
- Changes in preprocessing or query construction.
- Floating-point differences.
- Non-deterministic upstream processing.
- Changes in candidate metadata or tie-breaking.
- Changes in score normalization.

Not every ranking change is a defect. The engineering question is whether the change is expected, justified, and acceptable for the application.

### 12.1 Selection magnifies some ranking changes

If the selected K is ten, a swap between candidates ranked second and third may leave the selected set unchanged. A swap between candidates ranked tenth and eleventh may change membership.

Therefore, a small change in score or ordering can have a disproportionate effect near the cutoff.

### 12.2 Reproducibility requirements

A reproducible selection process should make the following explicit:

- Score validation and normalization rules.
- Sorting direction.
- Tie-breaking behavior.
- Threshold comparison semantics.
- Duplicate identifier behavior.
- The candidate set supplied to selection.
- The model and configuration versions used upstream, where relevant.

A deterministic selection helper addresses only the selection portion of reproducibility. Reproducing the full retrieval result requires capturing the relevant upstream inputs and configuration as well.

### 12.3 Floating-point precision

Scores produced by neural models are commonly represented as floating-point values. Floating-point arithmetic has finite precision, and two mathematically close values may be represented identically or in slightly different ways.

An engineering implementation should not casually convert every numeric type to a floating-point value if doing so can change ordering.

For example, Python integers can represent arbitrarily large integer values exactly, while a Python float cannot distinguish every integer at sufficiently large magnitudes.

The implementation below therefore defines a narrow numeric contract:

- Python integers are accepted and remain exact.
- Python floats are accepted only when finite.
- NumPy integer scalars are converted to Python integers.
- NumPy floating-point scalars are accepted only when their precision does not exceed Python float precision, and their values must be representable as finite Python floats.
- Booleans, strings, `None`, `Fraction`, and unsupported numeric types are rejected.

This contract is intentionally designed for ordinary model-ranking scores plus exact integer values. If an application requires arbitrary-precision decimal or rational scores, it should define and test a separate comparison and normalization policy rather than silently narrowing those values.

## 13. Trade-offs Across the Retrieval Pipeline

Selection decisions affect the entire retrieval pipeline.

### 13.1 Retrieval quality versus latency

Increasing candidate depth may improve the opportunity to find relevant material, but additional candidates can increase reranking and filtering costs.

Increasing final K may provide more evidence but can increase the cost of downstream processing.

The correct choice depends on where the system is losing useful candidates and where additional computation produces measurable benefit.

### 13.2 Relevance versus coverage

A narrow selection policy may favor the strongest candidates while excluding useful but differently worded evidence.

A broader selection policy may increase coverage but also introduce redundancy and noise.

Neither policy is universally superior. The application must define whether its primary objective is precision, coverage, diversity, or a combination of these properties.

Formal evaluation of these objectives belongs in the evaluation curriculum. This chapter establishes the engineering decisions that those evaluations should inform.

### 13.3 Predictability versus adaptability

Fixed-K selection provides a predictable maximum result count. Threshold-based selection adapts the result count to score values. Hybrid selection combines a threshold with a maximum count.

Adaptability is useful only when the score semantics and fallback behavior are understood. A variable result count is not automatically better than a fixed count.

### 13.4 Simplicity versus application-specific constraints

A generic top-K helper is easy to test and reuse. More sophisticated selection can incorporate diversity, source quotas, token budgets, access policies, or business constraints.

Those constraints may be necessary, but adding them to a generic function without a clear contract makes the behavior harder to reason about.

Keep generic ordering and selection behavior separate from application-specific policies when possible.

## 14. Practical Implementation: Deterministic Top-K Selection

The following implementation demonstrates a selection helper with explicit input validation, deterministic ordering, optional threshold filtering, and a documented numeric contract.

It is an educational reference implementation, not a claim of production certification. An actual service should also consider its data models, logging, exception handling, performance requirements, and application-specific selection rules.

### 14.1 Define the numeric contract

The helper accepts:

- Python `int`, excluding `bool`.
- Python `float`, excluding NaN and positive or negative infinity.
- NumPy integer scalar types, excluding NumPy booleans.
- NumPy floating scalar types that do not have greater mantissa precision than Python floats and that can be represented as finite Python floats.

It rejects other numeric types, including `fractions.Fraction`. This avoids silently converting rational values to floats when the conversion could collapse distinct scores into the same value.

Large Python integers remain exact. Mixed integer and floating-point comparisons follow Python's numeric comparison semantics; integer scores are not first converted to floats.

### 14.2 Implementation

```python
from collections.abc import Sequence
from typing import Any
import math

import numpy as np


def _normalize_real(
    value: Any,
    field_name: str,
) -> int | float:
    """Validate a supported score or threshold.

    Contract:
    - Python integers remain exact.
    - Python floats must be finite.
    - NumPy integer scalars become Python integers.
    - NumPy floating scalars with no more mantissa precision
      than Python float are converted to finite Python floats.
    - Booleans and unsupported numeric types are rejected.
    """

    if isinstance(value, (bool, np.bool_)):
        raise ValueError(
            f"{field_name} must not be a boolean."
        )

    if isinstance(value, (int, np.integer)):
        return int(value)

    if isinstance(value, (float, np.floating)):
        # NumPy extended-precision floating types can carry more
        # mantissa precision than Python float. Reject them rather
        # than silently narrowing precision and potentially changing
        # ordering.
        if isinstance(value, np.floating):
            precision_bits = np.finfo(type(value)).nmant
            python_float_precision_bits = np.finfo(float).nmant

            if precision_bits > python_float_precision_bits:
                raise ValueError(
                    f"{field_name} uses a NumPy floating type "
                    "with greater precision than Python float."
                )

        try:
            numeric_value = float(value)
        except (TypeError, ValueError, OverflowError) as exc:
            raise ValueError(
                f"{field_name} must be representable as a finite float."
            ) from exc

        if not math.isfinite(numeric_value):
            raise ValueError(
                f"{field_name} must be finite."
            )

        return numeric_value

    raise ValueError(
        f"{field_name} must be a supported integer or floating-point value."
    )


def select_top_k(
    ranked_candidates: Sequence[dict[str, Any]],
    k: int,
    min_score: int | float | None = None,
) -> list[dict[str, Any]]:
    """Return up to k candidates in deterministic descending-score order.

    Candidates must contain:
    - document_id: a non-empty string
    - reranker_score: a supported finite numeric score

    Selection policy:
    - Higher scores rank first.
    - Ties are broken by ascending document_id.
    - If min_score is supplied, candidates below it are excluded.
    - Duplicate document_id values are rejected.
    - Every candidate is validated even when k == 0.
    """

    if type(k) is not int or k < 0:
        raise ValueError(
            "k must be a non-negative Python integer."
        )

    if min_score is not None:
        min_score = _normalize_real(
            min_score,
            "min_score",
        )

    if (
        not isinstance(ranked_candidates, Sequence)
        or isinstance(
            ranked_candidates,
            (str, bytes, bytearray),
        )
    ):
        raise TypeError(
            "ranked_candidates must be a non-string sequence."
        )

    validated: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for index, candidate in enumerate(ranked_candidates):
        if not isinstance(candidate, dict):
            raise TypeError(
                f"Candidate at index {index} must be a dictionary."
            )

        document_id = candidate.get("document_id")

        if (
            not isinstance(document_id, str)
            or not document_id.strip()
        ):
            raise ValueError(
                f"Candidate at index {index} requires a non-empty "
                "string document_id."
            )

        if document_id in seen_ids:
            raise ValueError(
                f"Duplicate document_id: {document_id!r}"
            )

        score = _normalize_real(
            candidate.get("reranker_score"),
            f"reranker_score for {document_id!r}",
        )

        seen_ids.add(document_id)

        # Avoid mutating the caller's dictionary.
        copied = candidate.copy()
        copied["reranker_score"] = score
        validated.append(copied)

    # Contract: validate every candidate, even when k == 0.
    if k == 0:
        return []

    # Keep integer scores exact. Python's numeric comparisons support
    # comparing integers and floats without first converting every
    # integer to a float.
    validated.sort(
        key=lambda candidate: (
            -candidate["reranker_score"],
            candidate["document_id"],
        )
    )

    if min_score is not None:
        validated = [
            candidate
            for candidate in validated
            if candidate["reranker_score"] >= min_score
        ]

    return validated[:k]
```

### 14.3 Why validate before returning

The function validates the complete input before applying K.

That means invalid candidates are rejected even if they would fall outside the final selected range or if K is zero.

This behavior is intentional. It enforces the contract that the input collection is valid, rather than allowing invalid data to pass unnoticed because of a particular selection configuration.

An alternative API could validate only candidates that are actually considered for selection, but that would be a different contract and should be documented explicitly.

### 14.4 Why copy candidate dictionaries

The helper creates a shallow copy before storing the normalized score. This prevents the function from modifying the original candidate dictionary when normalizing a NumPy scalar.

The copy is shallow: nested objects remain shared. The function does not mutate nested fields, so deep copying is unnecessary for its current behavior.

### 14.5 Complexity

For N candidates, the implementation performs validation in \(O(N)\) time and full sorting in \(O(N \log N)\) time.

The sorting operation requires additional memory proportional to the number of candidates.

For very large candidate collections and small K, a heap-based approach may reduce selection work. However, a heap implementation must preserve the same score validation, threshold semantics, duplicate handling, and deterministic tie-breaking contract.

Optimization should follow measurement. A more complex selection algorithm is not automatically better for typical retrieval candidate counts.

## 15. Testing Selection Behavior

Selection behavior should be tested as a contract. Tests should cover normal ranking, boundary conditions, invalid values, numeric precision, and deterministic tie-breaking.

The examples below use `pytest` and NumPy. They are illustrative tests and have **not been executed** in this document.

### 15.1 Basic top-K behavior

```python
def test_selects_highest_scores():
    candidates = [
        {"document_id": "a", "reranker_score": 0.7},
        {"document_id": "b", "reranker_score": 0.9},
        {"document_id": "c", "reranker_score": 0.8},
    ]

    result = select_top_k(candidates, k=2)

    assert [
        candidate["document_id"]
        for candidate in result
    ] == ["b", "c"]
```

This verifies that candidates are ordered by descending score and that no more than K candidates are returned.

### 15.2 Deterministic tie-breaking

```python
def test_ties_use_document_id():
    candidates = [
        {"document_id": "c", "reranker_score": 0.8},
        {"document_id": "a", "reranker_score": 0.8},
        {"document_id": "b", "reranker_score": 0.8},
    ]

    result = select_top_k(candidates, k=2)

    assert [
        candidate["document_id"]
        for candidate in result
    ] == ["a", "b"]
```

This verifies the secondary ordering rule.

### 15.3 Threshold semantics

```python
def test_threshold_excludes_lower_scores():
    candidates = [
        {"document_id": "a", "reranker_score": 0.9},
        {"document_id": "b", "reranker_score": 0.7},
        {"document_id": "c", "reranker_score": 0.5},
    ]

    result = select_top_k(
        candidates,
        k=3,
        min_score=0.7,
    )

    assert [
        candidate["document_id"]
        for candidate in result
    ] == ["a", "b"]
```

The threshold is inclusive: a candidate whose score equals `min_score` is retained.

### 15.4 Empty and boundary cases

```python
def test_empty_input_returns_empty_list():
    assert select_top_k([], k=3) == []


def test_zero_k_returns_empty_list_for_valid_input():
    candidates = [
        {"document_id": "a", "reranker_score": 0.9},
    ]

    assert select_top_k(candidates, k=0) == []


def test_k_larger_than_candidate_count():
    candidates = [
        {"document_id": "a", "reranker_score": 0.9},
        {"document_id": "b", "reranker_score": 0.8},
    ]

    result = select_top_k(candidates, k=10)

    assert len(result) == 2
```

These tests establish that K is an upper bound, not a guarantee that exactly K candidates will be returned.

### 15.5 Invalid K values

```python
import pytest


@pytest.mark.parametrize(
    "k",
    [-1, 1.5, True, False, "3", None],
)
def test_rejects_invalid_k(k):
    with pytest.raises(ValueError):
        select_top_k([], k=k)
```

The implementation accepts only a non-negative Python integer for K. In particular, booleans are rejected even though Python treats `bool` as a subclass of `int`.

### 15.6 Invalid score types and non-finite values

```python
@pytest.mark.parametrize(
    "score",
    [
        True,
        False,
        float("nan"),
        float("inf"),
        -float("inf"),
        "0.9",
        None,
    ],
)
def test_rejects_invalid_scores(score):
    candidates = [
        {
            "document_id": "a",
            "reranker_score": score,
        }
    ]

    with pytest.raises(ValueError):
        select_top_k(candidates, k=1)
```

This test covers booleans, non-finite floats, strings, and missing-like values.

It deliberately does **not** include arbitrarily large Python integers. Those are supported by the implementation and remain exact integers.

### 15.7 Unsupported numeric types and extended precision

```python
from fractions import Fraction


def test_rejects_fraction_scores():
    candidates = [
        {
            "document_id": "a",
            "reranker_score": Fraction(1, 3),
        }
    ]

    with pytest.raises(ValueError):
        select_top_k(candidates, k=1)


def test_rejects_fraction_threshold():
    candidates = [
        {
            "document_id": "a",
            "reranker_score": 0.9,
        }
    ]

    with pytest.raises(ValueError):
        select_top_k(
            candidates,
            k=1,
            min_score=Fraction(1, 2),
        )


def test_rejects_extended_precision_numpy_float_when_supported():
    extended = np.longdouble("0.9")

    if (
        np.finfo(type(extended)).nmant
        > np.finfo(float).nmant
    ):
        candidates = [
            {
                "document_id": "a",
                "reranker_score": extended,
            }
        ]

        with pytest.raises(ValueError):
            select_top_k(candidates, k=1)
```

The extended-precision test is conditional because the precision available for `np.longdouble` depends on the platform. On platforms where it offers no more mantissa precision than Python float, the implementation permits it if it is finite and representable.

### 15.8 Integer precision regression tests

```python
def test_large_integer_scores_remain_exact():
    lower = 2**100
    higher = lower + 1

    candidates = [
        {
            "document_id": "lower",
            "reranker_score": lower,
        },
        {
            "document_id": "higher",
            "reranker_score": higher,
        },
    ]

    result = select_top_k(candidates, k=2)

    assert [
        candidate["document_id"]
        for candidate in result
    ] == ["higher", "lower"]

    assert result[0]["reranker_score"] == higher
    assert type(result[0]["reranker_score"]) is int
```

This verifies that large integer scores are not narrowed to floats.

The following test demonstrates why indiscriminate float conversion is unsafe:

```python
def test_large_integers_can_collapse_when_converted_to_float():
    lower = 2**53
    higher = lower + 1

    assert lower != higher
    assert float(lower) == float(higher)
```

The test does not call `select_top_k`; it documents the numeric hazard that the implementation avoids for Python integer scores.

### 15.9 Threshold semantics and precision regression tests

```python
def test_large_integer_threshold_remains_exact():
    threshold = 2**100

    candidates = [
        {
            "document_id": "below",
            "reranker_score": threshold - 1,
        },
        {
            "document_id": "equal",
            "reranker_score": threshold,
        },
        {
            "document_id": "above",
            "reranker_score": threshold + 1,
        },
    ]

    result = select_top_k(
        candidates,
        k=3,
        min_score=threshold,
    )

    assert [
        candidate["document_id"]
        for candidate in result
    ] == ["above", "equal"]
```

The threshold is preserved as an integer. No conversion to float is required, and equality with the threshold is inclusive.

### 15.10 Duplicate identifiers

```python
def test_rejects_duplicate_document_ids():
    candidates = [
        {"document_id": "a", "reranker_score": 0.9},
        {"document_id": "a", "reranker_score": 0.8},
    ]

    with pytest.raises(ValueError, match="Duplicate"):
        select_top_k(candidates, k=2)
```

This test establishes that duplicate identifiers violate the helper's input contract.

### 15.11 Input immutability

```python
def test_does_not_mutate_input_candidate():
    original = {
        "document_id": "a",
        "reranker_score": np.float32(0.9),
    }

    original_score = original["reranker_score"]

    result = select_top_k([original], k=1)

    assert original["reranker_score"] is original_score
    assert isinstance(result[0]["reranker_score"], float)
```

This verifies that score normalization occurs on the copied candidate rather than by mutating the caller's dictionary.

### 15.12 Validation when K is zero

```python
def test_validates_candidates_when_k_is_zero():
    candidates = [
        {
            "document_id": "a",
            "reranker_score": float("nan"),
        }
    ]

    with pytest.raises(ValueError):
        select_top_k(candidates, k=0)
```

This test captures a deliberate contract choice: a zero-sized selection does not disable input validation.

### 15.13 Additional contract tests

Before adopting the helper in a service, add tests for:

- Non-sequence inputs.
- String and byte inputs mistakenly supplied as candidate collections.
- Non-dictionary candidate entries.
- Missing or blank identifiers.
- Missing scores.
- Duplicate identifiers that differ only in whitespace, if identifier canonicalization is part of the application contract.
- Mixed Python integer and float scores.
- NumPy integer and supported floating-point scalar inputs.
- Empty results when every candidate falls below the threshold.
- Candidate dictionaries containing additional metadata.
- Consistent behavior when the same candidate set arrives in different input orders.

The whitespace case deserves a deliberate decision. The implementation rejects identifiers that are entirely whitespace but does not trim or canonicalize identifiers. Consequently, `"doc-1"` and `" doc-1 "` are different identifiers under this contract. If the application requires canonical identifiers, normalize them at a clearly defined boundary and test that behavior separately.

## 16. Production Design Checklist

Before deploying a top-K selection policy, verify the following.

### Selection contract

- [ ] K is explicitly defined and validated.
- [ ] The policy specifies whether K is a maximum or an exact count.
- [ ] Threshold comparison semantics are documented.
- [ ] Empty result behavior is intentional.
- [ ] Fallback behavior, if any, is explicit.

### Ranking and ordering

- [ ] Score direction is correct.
- [ ] Tie-breaking is deterministic.
- [ ] Numeric types and precision behavior are defined.
- [ ] Non-finite and unsupported scores are rejected or handled by an explicit policy.
- [ ] The policy does not interpret raw scores as calibrated probabilities without evidence.

### Data integrity

- [ ] Duplicate identifier behavior is explicit.
- [ ] Content redundancy is addressed at the appropriate pipeline stage.
- [ ] Invalid records cannot silently bypass validation.
- [ ] Selection does not unexpectedly mutate caller-owned data.

### Performance and integration

- [ ] Candidate depth and reranking depth are tuned independently of final K.
- [ ] Selection cost is measured for realistic candidate counts.
- [ ] Downstream token or processing budgets are enforced by the appropriate component.
- [ ] Changes to selection policy are evaluated against representative queries.
- [ ] Logs or traces can explain why a candidate was excluded when operational debugging requires it.

### Operational readiness

- [ ] Tests cover normal, boundary, invalid-input, and precision cases.
- [ ] Configuration changes are versioned or otherwise traceable.
- [ ] Model and retrieval changes can be distinguished from selection-policy changes.
- [ ] The service has a clear policy for unexpected validation failures.

A selection helper should be small enough to reason about and strict enough that its behavior does not depend on accidental input characteristics.

## 17. Interview Preparation

### Question 1: Why can a correct ranking still produce poor retrieval results?

A ranking orders the candidates it receives. It cannot guarantee that the candidate pool is complete, that the selected K is appropriate, or that every retained candidate is relevant. Selection can exclude useful candidates or retain weak ones even when the ordering is consistent.

### Question 2: Why not always increase K?

A larger K can improve the opportunity to retain relevant evidence, but it can also increase latency, cost, redundancy, and downstream noise. K should be chosen according to application requirements and evaluated behavior.

### Question 3: When would you use a score threshold instead of fixed K?

A threshold is useful when candidates below a defined score requirement should be excluded, even if that means returning fewer results. It requires understanding the score scale and validating the threshold against representative data.

### Question 4: Why is deterministic tie-breaking important?

Without an explicit rule, candidates with equal scores may be selected according to incidental input ordering. A stable secondary key makes selection reproducible for the same validated candidate set.

### Question 5: Does deterministic selection make the entire retrieval system reproducible?

No. It makes the selection operation deterministic for a given candidate set and ordering contract. Upstream retrieval, model inference, preprocessing, and configuration can still change the candidates or scores.

### Question 6: Why preserve large integer scores instead of converting everything to float?

Floating-point values have finite precision. Distinct large integers can become equal after conversion to float, potentially changing ranking or threshold behavior. A numeric contract should preserve supported values without unnecessary narrowing.

### Question 7: What is the difference between duplicate IDs and redundant content?

Duplicate IDs indicate repeated references to the same canonical identifier. Redundant content may exist across different IDs. The former can be checked with exact identifier comparison; the latter requires an explicitly defined content-level policy.

### Question 8: How would you investigate a relevant document that was not returned?

Trace it through the pipeline: confirm retrieval, inspect filtering, establish whether it reached reranking, inspect its rank and score, then determine whether K, a threshold, or another constraint excluded it. Only then decide whether the defect belongs to retrieval, ranking, or selection.

### Question 9: When would a heap be preferable to sorting every candidate?

A heap can be useful when the candidate set is large and K is small, because it can reduce selection work. The implementation must still preserve the required validation, threshold, tie-breaking, and duplicate semantics.

### Question 10: Is the highest score necessarily the most relevant candidate?

Not necessarily. The score reflects a model's scoring behavior, not an infallible relevance judgment. Ranking and selection policies must be assessed against the requirements of the application and appropriate evaluation evidence.

## 18. Self-Assessment

Answer these questions in your own words. Focus on the engineering reasoning behind your choices.

1. Your system reranks 100 candidates and returns the top five. A relevant document is ranked sixth. What information would you need before deciding whether to increase K?
2. A threshold-based system returns zero candidates for 15% of queries. How would you determine whether that behavior is acceptable?
3. Two candidates have equal scores at the final selection boundary. What tie-breaking rule would you choose, and why?
4. A new model version changes the candidate ranked tenth but leaves the top nine unchanged. What should you investigate before calling this a regression?
5. Your RAG pipeline returns ten candidates, but eight are nearly identical passages. Which component should own the redundancy policy, and what trade-offs should it consider?
6. An implementation converts all scores to Python floats. What numeric edge cases could make this unsafe?
7. Your team wants to replace full sorting with a heap. Which behavioral guarantees must remain unchanged?
8. Explain why a deterministic selection helper does not guarantee deterministic end-to-end retrieval.

A strong answer should identify assumptions, distinguish upstream from downstream responsibilities, and explain the consequences of alternative choices.

## 19. Key Takeaways and Next Steps

- Ranking determines order; selection determines membership in the final set.
- Candidate depth, reranking depth, and final K serve different purposes.
- K is an engineering trade-off, not a universal constant.
- Fixed-K, threshold-based, and hybrid selection policies have different failure modes.
- Score gaps can inform investigation but do not independently prove relevance.
- Selection boundaries can magnify small ranking changes.
- Deterministic tie-breaking improves reproducibility for a fixed candidate set.
- Duplicate identifiers and redundant content are separate concerns.
- Numeric validation must define supported types and precision behavior explicitly.
- Tests should reflect the actual implementation contract, including large-integer and threshold behavior.

### Recommended practical exercise

Implement the selection helper in a small isolated module. Add the tests from this chapter, then extend them with randomized candidate orders and additional boundary cases. Run the test suite in your environment before integrating the helper into a retrieval pipeline.

For a realistic engineering exercise, compare fixed-K and hybrid selection on a representative query set. Record the result count, selection latency, downstream processing cost, and the relevance or coverage outcomes your evaluation process supports.

Do not assume that the policy with the largest K or the most elaborate selection logic is automatically best. The objective is to choose a policy whose behavior is justified by the system's requirements and measured evidence.

**Chapter boundary:** This chapter establishes how a ranked candidate set is converted into a final selected set. Formal retrieval evaluation methodology belongs in RET-10; broader diagnostic workflows belong in RET-11.
