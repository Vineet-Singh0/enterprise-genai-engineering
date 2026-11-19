# Candidate Depth, Deduplication, and Coverage

## 1. Purpose

Candidate generation determines which records are available to downstream retrieval stages. However, generating candidates is not enough. The system must also decide how many candidates to retain, how to combine overlapping result sets, how to identify duplicate representations, and how to diagnose relevant candidates that never enter the combined pool.

These decisions affect retrieval quality and operational cost.

A candidate pool that is too small may exclude relevant records before downstream components can consider them. An unnecessarily large pool can increase processing cost, latency, memory consumption, and the amount of data passed to subsequent stages.

Deduplication introduces another trade-off. Removing repeated representations of the same candidate prevents wasted work, but merging distinct records merely because their content looks similar can destroy legitimate alternatives.

The objective is to construct a candidate pool with sufficient depth, useful coverage, reliable identity handling, and traceable provenance—not simply to maximize candidate count or eliminate every similarity.

### Learning objectives

After studying this chapter, you should be able to:

- Explain candidate depth, candidate overlap, candidate coverage, and final result count.
- Diagnose candidate pools that are too small or unnecessarily large.
- Measure overlap and inspect source-specific contributions.
- Distinguish duplicate representations from distinct records with similar content.
- Preserve provenance when combining candidates.
- Implement candidate combination and basic candidate-pool diagnostics.
- Investigate missing candidates before blaming downstream ranking.
- Justify changes to candidate depth, retriever participation, and deduplication policy.

## 2. Candidate depth and downstream cost

Candidate depth is the number of candidates requested or retained from a retrieval source or at a particular pipeline stage.

Suppose a system retrieves 100 candidates from lexical retrieval and 100 from dense retrieval. It initially has up to 200 source-result appearances. If 40 candidate identities appear in both lists, the combined pool contains:

\[
100 + 100 - 40 = 160
\]

distinct candidates, assuming both lists use the same candidate identity granularity.

The number of source-result appearances and the number of unique candidates are different measurements. Both are useful for diagnosing retrieval behavior.

### 2.1 Candidate depth is not final result count

A pipeline may retrieve 200 source-result appearances, combine them into 160 unique candidates, pass those candidates to a reranker, and return 10 results to the user.

```text
Lexical retrieval: 100 appearances
                 \
                  -> Combine and deduplicate -> 160 unique candidates
                 /                                |
Dense retrieval: 100 appearances                  v
                                               Reranking
                                                  |
                                                  v
                                          Final results: 10
```

The final result count does not tell you whether the candidate pool was sufficient. If a relevant record never entered the pool, a downstream ranking stage cannot select it.

Likewise, retrieving more candidates does not automatically improve quality. Additional candidates may be irrelevant, redundant, expensive to process, or harmful to latency budgets.

### 2.2 Candidate depth and cost

Increasing candidate depth can increase:

- Retrieval work, depending on the underlying search implementation.
- Memory consumption for candidate lists and metadata.
- Deduplication and provenance-processing work.
- The number of candidates sent to a reranker.
- End-to-end latency and infrastructure cost.

The relationship between depth and cost is not always linear. An approximate nearest-neighbor index may have search parameters that affect work differently from the number of returned results. A reranker, however, commonly incurs additional work for every candidate it evaluates.

Candidate depth is an engineering parameter that must be justified by observed behavior and resource constraints.

## 3. Too few candidates versus too many

Candidate depth trades off the opportunity to retain relevant records against the cost of processing them.

### 3.1 When the pool is too small

A candidate pool may be too small when:

- Relevant records are consistently absent from retrieved lists.
- Increasing depth reveals additional relevant candidates.
- A source returns few candidates because of restrictive retrieval settings.
- Different query types require substantially different retrieval depth.
- The pool lacks useful diversity for queries requiring different kinds of evidence.

A small pool alone does not prove a retrieval problem. A narrow query may legitimately have only a few relevant matches. Diagnose the cause rather than increasing depth automatically.

### 3.2 When the pool is unnecessarily large

A candidate pool may be unnecessarily large when:

- Additional candidates rarely contribute relevant records.
- Many candidates are redundant representations of the same underlying entity.
- Expensive downstream stages process many unsuitable candidates.
- Latency or resource consumption exceeds the system's budget.
- Additional candidates do not improve final-result quality under the evaluation conditions.

A large pool is not inherently poor engineering. It can be justified when it materially improves candidate coverage and downstream stages can process it within the required budget.

### 3.3 Diagnose before changing depth

Suppose a relevant document is missing from the final results. Possible explanations include:

1. The document is not indexed.
2. The document is indexed but is not retrieved by any configured source.
3. The document falls outside a source's requested depth.
4. A filter excludes it.
5. It appears under an unexpected or inconsistent identity.
6. It enters a source list but is incorrectly removed during combination or deduplication.

Increasing depth addresses only some of these possibilities. It will not repair a missing index entry, an incorrect filter, or faulty identity mapping.

A useful diagnostic sequence is:

1. Verify that the expected record exists and is eligible for retrieval.
2. Inspect the individual source-result lists.
3. Check source depth and retrieval constraints.
4. Inspect identity mapping and deduplication behavior.
5. Confirm that the candidate reaches the downstream stage.
6. Adjust depth only when evidence indicates that depth contributes to the problem.

## 4. Candidate overlap and coverage

Multiple retrieval sources may return the same candidates. Overlap is not inherently bad: different sources may independently identify useful records. The important question is whether each source contributes useful candidates that the other sources miss.

### 4.1 Measuring overlap

Suppose two sources return:

- Lexical: `{A, B, C, D}`
- Dense: `{B, C, E, F}`

Their intersection is:

\[
L \cap D = \{B,C\}
\]

Their union is:

\[
L \cup D = \{A,B,C,D,E,F\}
\]

The intersection contains two candidates, and the union contains six unique candidates.

Jaccard similarity measures overlap relative to the union:

\[
J(L,D) = \frac{|L \cap D|}{|L \cup D|}
       = \frac{2}{6}
       \approx 0.333
\]

A value of approximately 0.333 means that one-third of the distinct identities in the combined pool are shared by the two lists.

**Compare candidate sets at a consistent identity granularity.** If one source returns passage IDs and another returns document IDs, calculating overlap directly between those IDs may be misleading. Normalize or map identities according to an explicit policy before interpreting overlap.

Jaccard similarity is descriptive, not a retrieval-quality score. It does not tell us whether unique candidates are relevant, whether shared candidates are better, or whether either source is necessary.

### 4.2 Unique contribution

For the example above:

- Lexical-only contribution: `{A, D}`
- Dense-only contribution: `{E, F}`
- Shared contribution: `{B, C}`

These sets reveal which candidates each source contributes to the combined pool.

A source can have high overlap and still be useful if it consistently retrieves strong candidates. A source can have low overlap and still be unhelpful if its unique candidates are irrelevant.

**Unique contribution measures distinctness, not usefulness.** A source's unique candidate count is not evidence that the source improves retrieval quality without relevance evidence or downstream evaluation.

### 4.3 Coverage is not the same as overlap

Coverage asks whether the relevant candidates of interest are present in the pool. Overlap asks how much the source-result lists share.

A pool may have high overlap and cover the relevant candidates well. A pool may have low overlap while missing important candidates entirely.

For example, two sources might return largely different records, but neither may retrieve the document that answers the query.

To reason about coverage, you need a reference set of relevant candidates, a known target candidate, or another trustworthy source of evidence. Without such evidence, you can measure pool size and overlap, but cannot reliably claim that coverage is good.

## 5. Stable identity and deduplication

Deduplication determines whether multiple candidate appearances represent the same underlying retrieval object.

The central engineering requirement is identity correctness. Content similarity alone is not sufficient evidence that two records should be merged.

### 5.1 Define identity granularity

A system may retrieve candidates at different levels:

- **Entity:** a person, product, organization, or other real-world entity.
- **Record:** a database record representing an entity or business object.
- **Document:** a document in a content repository.
- **Passage:** a chunk or passage extracted from a document.

These identity levels are not interchangeable.

Two passages from the same document may be distinct candidates if they contain different evidence. Two records may describe the same real-world entity but have different business meanings. Two documents may have nearly identical text while representing different versions, jurisdictions, or sources.

Before implementing deduplication, define what one candidate means at the current pipeline stage.

### 5.2 True duplicates versus similar content

Consider three product records:

| Candidate | Description | Canonical identity |
|---|---|---|
| A | Product listing from source one | `product-123` |
| B | Product listing from source two for the same product | `product-123` |
| C | Similar product with a different model number | `product-456` |

If the pipeline deduplicates at product identity, A and B may be combined while C must remain separate.

Text similarity may help identify possible duplicates, but it should not silently replace an authoritative identity policy. If no reliable identity is available, preserve distinct records or use an explicitly defined entity-resolution process with traceable decisions.

### 5.3 Define the deduplication contract

A practical policy should answer:

1. What is the candidate identity at this stage?
2. Which field or mapping defines that identity?
3. Are IDs canonicalized before combination?
4. Can multiple passages from one document remain distinct?
5. How are aliases and conflicting identifiers handled?
6. What information is preserved when appearances are combined?

Canonicalization should occur at a clearly defined boundary. An upstream identity service might map aliases to canonical IDs. The combination stage can then require canonical IDs instead of silently trimming or rewriting them.

This matters because accidental normalization can merge candidates that should remain separate or treat equivalent identities as different.

## 6. Provenance preservation

When multiple sources retrieve the same candidate, combining the appearances should not erase how that candidate was found.

Provenance can include:

- Source or retriever name.
- Rank within the source list.
- Original source-specific record identifier.
- Retrieval configuration or query variant, when needed for diagnosis.
- Relevant scores and metadata, if the pipeline explicitly defines how they are retained.

For example, candidate B might appear at lexical rank 2 and dense rank 1. The combined pool should represent B once at the selected identity granularity while preserving both source appearances.

```text
Candidate B
  canonical_id: B
  provenance:
    - source: lexical
      rank: 2
    - source: dense
      rank: 1
```

Provenance supports debugging and analysis. It helps engineers determine whether a candidate was retrieved by one source or several, and whether a change in source participation affects the candidate pool.

### 6.1 Provenance is not ranking

A candidate appearing in multiple source lists is not automatically more relevant than a candidate appearing in one list.

Likewise, source rank 1 from one retriever is not necessarily comparable with source rank 1 from another retriever. The sources may use different scoring functions and score distributions.

Preserve source ranks as provenance. Do not invent a combined ranking rule during deduplication. Formal score or rank fusion belongs in the retrieval fusion chapter.

### 6.2 Provenance and identity granularity

Suppose two passages from the same document are retrieved. If the pipeline's candidate identity is the document, the passages may be combined under one document identity, but passage-level evidence should be retained if downstream processing needs it.

If the pipeline's candidate identity is the passage, those passages should remain separate.

The correct behavior depends on the stage's contract. Deduplication must not destroy information required by downstream consumers.

## 7. Candidate-pool diagnostics in practice

A useful diagnostic should answer more than “How many candidates did we retrieve?”

At minimum, inspect:

- Raw appearances returned by each source.
- Unique identities within each source.
- Unique identities in the combined pool.
- Pairwise overlap and source-specific contributions.
- Duplicate appearances within a source.
- Known relevant candidates absent from the combined set, when a trustworthy reference is available.

The following helper provides a compact diagnostic for source-result lists. It expects each list to contain unique, canonical candidate IDs at the same identity granularity.

```python
from collections.abc import Mapping, Sequence

def _validate_ids(values, label: str) -> list[str]:
    if isinstance(values, (str, bytes)) or not isinstance(values, Sequence):
        raise TypeError(f"{label} must be a sequence of candidate IDs")

    ids = list(values)

    for candidate_id in ids:
        if (
            not isinstance(candidate_id, str)
            or not candidate_id
            or candidate_id != candidate_id.strip()
        ):
            raise ValueError(
                f"{label} contains an invalid canonical candidate ID"
            )

    if len(ids) != len(set(ids)):
        raise ValueError(f"{label} contains duplicate candidate IDs")

    return ids

def inspect_candidate_pool(
    source_results: Mapping[str, Sequence[str]],
    known_relevant_ids: set[str] | None = None,
) -> dict[str, object]:
    """Inspect source contributions, overlap, and known missing candidates.

    Source lists must contain unique canonical IDs at a consistent
    identity granularity. The reference set, when supplied, must use
    the same identity granularity.
    """
    if not isinstance(source_results, Mapping):
        raise TypeError("source_results must be a mapping")

    if known_relevant_ids is not None:
        if not isinstance(known_relevant_ids, set):
            raise TypeError("known_relevant_ids must be a set or None")

        for candidate_id in known_relevant_ids:
            if (
                not isinstance(candidate_id, str)
                or not candidate_id
                or candidate_id != candidate_id.strip()
            ):
                raise ValueError(
                    "known_relevant_ids contains an invalid canonical ID"
                )

        relevant_ids = set(known_relevant_ids)
    else:
        relevant_ids = None

    source_sets: dict[str, set[str]] = {}

    for source, values in source_results.items():
        if (
            not isinstance(source, str)
            or not source
            or source != source.strip()
        ):
            raise ValueError(
                "Source names must be non-empty canonical strings"
            )

        ids = _validate_ids(values, f"source_results[{source!r}]")
        source_sets[source] = set(ids)

    combined = set().union(*source_sets.values()) if source_sets else set()

    contributions = {}

    for source, candidates in source_sets.items():
        other_candidates = set().union(
            *(
                values
                for other_source, values in source_sets.items()
                if other_source != source
            )
        ) if len(source_sets) > 1 else set()

        contributions[source] = {
            "unique_candidate_count": len(candidates),
            "unique_to_source_count": len(candidates - other_candidates),
        }

    pairwise_overlap = {}
    source_names = list(source_sets)

    for i, left_name in enumerate(source_names):
        for right_name in source_names[i + 1:]:
            left = source_sets[left_name]
            right = source_sets[right_name]
            union = left | right

            pairwise_overlap[f"{left_name} vs {right_name}"] = {
                "intersection_count": len(left & right),
                "union_count": len(union),
                "jaccard": len(left & right) / len(union) if union else 0.0,
            }

    missing_relevant = (
        relevant_ids - combined if relevant_ids is not None else None
    )

    return {
        "source_candidate_counts": {
            source: len(candidates)
            for source, candidates in source_sets.items()
        },
        "combined_unique_count": len(combined),
        "source_contributions": contributions,
        "pairwise_overlap": pairwise_overlap,
        "missing_known_relevant_ids": (
            sorted(missing_relevant)
            if missing_relevant is not None
            else None
        ),
    }
```

### 7.1 Diagnostic contract and interpretation

The helper deliberately validates its inputs rather than silently repairing them.

- A source result must be a sequence, not a string or bytes object.
- Candidate IDs must be non-empty canonical strings without surrounding whitespace.
- A source list must not contain repeated IDs.
- `known_relevant_ids` must be either `None` or a set of canonical IDs.
- Source names must be non-empty canonical strings.
- Source lists and the reference set must use the same identity granularity.

The distinction between `None` and an empty reference set is intentional:

- `None` means no reference set was supplied, so missing-relevant-candidate analysis is unavailable.
- An empty set means a reference set was supplied and contains no relevant candidate IDs.

The helper does not infer relevance, resolve aliases, or determine whether two distinct IDs describe the same real-world entity.

### 7.2 Example

For these lists:

- Lexical: `A, B, C, D`
- Dense: `B, C, E, F`

The diagnostic should report:

- Lexical unique count: 4.
- Dense unique count: 4.
- Combined unique count: 6.
- Lexical-only candidates: `A, D`.
- Dense-only candidates: `E, F`.
- Pairwise intersection count: 2.
- Pairwise union count: 6.
- Jaccard overlap: approximately 0.333.

If the known relevant set is `{C, F, G}`, the combined pool contains C and F but misses G. This identifies G as absent from the observed candidate pool; it does not explain why G is missing.

The next step is to inspect index availability, source-specific retrieval, filters, depth, and identity handling.

### 7.3 Interpreting diagnostics

| Observation | Possible interpretation | Next investigation |
|---|---|---|
| Low combined unique count | Sources overlap heavily or return few candidates | Inspect source depths and individual lists |
| One source contributes no unique candidates | The source may be redundant for this query or configuration | Inspect its candidates and relevance evidence |
| Many unique candidates but known relevant IDs are missing | Candidate diversity does not guarantee coverage | Inspect indexing, filtering, depth, and query behavior |
| Combined count is unexpectedly low | Identity mapping or deduplication may be collapsing records | Inspect canonical IDs and identity granularity |
| Large pool with little useful contribution from added depth | Additional retrieval may be unnecessary | Compare candidate contribution and downstream cost |
| A candidate appears in a source list but not in the combined pool | Combination or identity handling may be responsible | Trace the candidate through the pipeline |

These are diagnostic hypotheses, not automatic conclusions. Confirm them against the actual source lists and system behavior.

## 8. Selecting an initial candidate depth

Candidate depth should be selected according to the retrieval pipeline's purpose, resource budget, and observed candidate behavior.

A disciplined initial process is:

1. **Define the downstream requirement.** Determine how many candidates the next stage can process within the latency and cost budget.
2. **Choose an initial depth for each source.** Base it on the source's expected role and existing system constraints.
3. **Inspect the combined pool.** Measure raw appearances, unique identities, overlap, and source-specific contributions.
4. **Check relevant-candidate evidence.** Where a trustworthy reference set exists, inspect which known relevant candidates enter or miss the pool.
5. **Change one factor at a time.** Adjust source depth, source participation, or deduplication policy separately when possible.
6. **Record the result.** Capture candidate counts, relevant-candidate observations, latency, and downstream workload for comparable queries.
7. **Retain changes only when justified.** A larger pool is not automatically better, and a smaller pool is not automatically more efficient if it excludes useful candidates.

### 8.1 Fixed versus query-dependent depth

A fixed depth is simpler to operate and easier to reason about. It may be appropriate when query behavior and resource budgets are reasonably stable.

Query-dependent depth can be useful when candidate needs vary substantially. However, adaptive depth introduces additional decisions: what signals trigger expansion, what stopping criteria apply, how latency is bounded, and how behavior remains observable.

Begin with a measurable baseline. Add adaptive logic only when observed variation justifies its complexity.

## 9. Worked scenario: depth, retriever participation, and identity

Consider a system with two candidate sources.

Initial results:

- Lexical: `A, B, C`
- Dense: `B, D, E`

Assume the IDs represent canonical candidate identities and the lists contain no duplicates within a source.

### Step 1: Inspect the initial pool

The combined unique set is:

`{A, B, C, D, E}`

There are six source-result appearances and five unique candidates. Candidate B has two provenance entries; the remaining candidates have one each.

The dense source contributes D and E beyond the lexical list. The lexical source contributes A and C beyond the dense list.

These observations establish source contribution, not candidate relevance.

### Step 2: Compare retriever participation

If dense retrieval is removed, the pool becomes:

`{A, B, C}`

The unique pool decreases from five candidates to three. D and E are no longer available through these observed source results.

That change may reduce downstream processing cost, but it may also remove relevant candidates. Without relevance evidence or a representative evaluation set, we cannot conclude that removing dense retrieval improves or harms retrieval quality.

The engineering question is whether dense retrieval contributes candidates that are useful enough to justify its cost.

### Step 3: Increase lexical depth

Suppose increasing lexical depth adds F and G:

- Lexical: `A, B, C, F, G`
- Dense: `B, D, E`

The union now contains seven unique candidates:

`{A, B, C, D, E, F, G}`

The additional lexical depth contributes F and G to the combined pool. Whether those candidates improve retrieval depends on their relevance and the downstream pipeline.

### Step 4: Apply the identity policy

Suppose E and F have similar descriptions but different authoritative product IDs.

They must remain separate if the candidate identity is the product. Similar wording alone does not establish duplicate identity.

If two appearances instead resolve to the same canonical product ID, the system can combine them into one product candidate while preserving both source appearances.

### Step 5: Interpret the result

The engineer should record:

- How the combined unique count changed.
- Which candidates were added by increasing lexical depth.
- Which candidates were lost when dense retrieval was removed.
- Which source contributed each candidate.
- Whether known relevant candidates entered or left the pool.
- The added downstream cost.
- Whether identity handling merged only legitimate duplicates.

The correct configuration depends on observed evidence and system constraints, not candidate count alone.

## 10. Implementation boundaries and failure handling

Candidate combination code should make its identity and duplicate policies explicit.

The following implementation combines candidates by canonical ID and preserves source rank as provenance. It rejects malformed records, non-canonical IDs, and repeated canonical IDs within a single source list.

```python
from collections.abc import Mapping, Sequence
from typing import Any

def combine_candidates(
    source_results: Mapping[str, Sequence[Mapping[str, Any]]],
) -> dict[str, dict[str, Any]]:
    """Combine source results by canonical candidate ID.

    Contract:
    - Source names are non-empty canonical strings.
    - Each candidate is a mapping containing a canonical candidate_id.
    - Candidate IDs are non-empty strings with no surrounding whitespace.
    - Each source list contains at most one appearance of a canonical ID.
    - Source rank is inferred from the one-based list position.
    - Repeated IDs across different sources are combined, preserving
      one provenance entry per source appearance.
    """
    if not isinstance(source_results, Mapping):
        raise TypeError("source_results must be a mapping")

    combined: dict[str, dict[str, Any]] = {}

    for source_name, candidates in source_results.items():
        if (
            not isinstance(source_name, str)
            or not source_name
            or source_name != source_name.strip()
        ):
            raise ValueError(
                "Source names must be non-empty canonical strings"
            )

        if isinstance(candidates, (str, bytes)) or not isinstance(
            candidates, Sequence
        ):
            raise TypeError(
                f"Candidates for source {source_name!r} must be a sequence"
            )

        seen_in_source: set[str] = set()

        for rank, candidate in enumerate(candidates, start=1):
            if not isinstance(candidate, Mapping):
                raise TypeError(
                    f"Candidate at rank {rank} in source "
                    f"{source_name!r} must be a mapping"
                )

            candidate_id = candidate.get("candidate_id")

            if (
                not isinstance(candidate_id, str)
                or not candidate_id
                or candidate_id != candidate_id.strip()
            ):
                raise ValueError(
                    f"Candidate ID at rank {rank} in source "
                    f"{source_name!r} must be a non-empty canonical string"
                )

            if candidate_id in seen_in_source:
                raise ValueError(
                    f"Duplicate candidate ID {candidate_id!r} "
                    f"within source {source_name!r}"
                )

            seen_in_source.add(candidate_id)

            if candidate_id not in combined:
                combined[candidate_id] = {
                    "candidate_id": candidate_id,
                    "provenance": [],
                }

            combined[candidate_id]["provenance"].append(
                {
                    "source": source_name,
                    "rank": rank,
                }
            )

    return combined
```

### 10.1 Why reject repeated IDs within one source?

The implementation expects each source to return one appearance per candidate identity at the selected granularity.

Repeated IDs may indicate an upstream duplicate, a mismatch between document and passage identity, or an aggregation issue that should be diagnosed explicitly.

If a source legitimately returns multiple passages belonging to one document, choose the correct candidate granularity first. Either retain passages as separate candidates using passage-level IDs or aggregate them deliberately at the document level while preserving the passage-level provenance needed downstream.

Do not remove the validation merely to make malformed input pass.

### 10.2 Verify provenance preservation

A focused test case can verify cross-source deduplication and one-based source ranks:

```python
source_results = {
    "lexical": [
        {"candidate_id": "B"},
        {"candidate_id": "A"},
    ],
    "dense": [
        {"candidate_id": "B"},
    ],
}

combined = combine_candidates(source_results)

assert set(combined) == {"A", "B"}
assert combined["B"]["provenance"] == [
    {"source": "lexical", "rank": 1},
    {"source": "dense", "rank": 1},
]
assert combined["A"]["provenance"] == [
    {"source": "lexical", "rank": 2},
]
```

These assertions express the expected contract:

- B appears once in the combined result.
- Both source appearances of B are retained as provenance.
- Source ranks remain one-based and source-specific.
- A remains a separate candidate with its original lexical rank.

This is a test specification, not a claim that the code has been executed.

### 10.3 Why reject whitespace around IDs?

The function requires upstream canonicalization. IDs `"B"` and `" B "` are not silently treated as equivalent.

Silent trimming could conceal inconsistent identity handling, and normalization rules may be more complex than whitespace removal. A production system should define canonicalization at a clear boundary, test that contract, and ensure all retrievers use the same identity representation.

### 10.4 What this implementation does not do

The function does not:

- Resolve aliases or perform entity resolution.
- Determine whether two different IDs describe the same real-world entity.
- Calculate a combined ranking score.
- Merge candidate metadata according to a conflict-resolution policy.
- Infer relevance from provenance.
- Guarantee that the candidate pool contains every relevant record.

These are separate responsibilities. Keeping them separate makes the identity contract easier to test and the retrieval pipeline easier to debug.

The code is a teaching implementation. Before production use, execute it and add automated tests for empty inputs, malformed mappings, duplicate IDs within a source, repeated IDs across sources, invalid canonical IDs, and preservation of source ranks.

## 11. Common misconceptions

### Misconception 1: More candidates always improve retrieval

More candidates can increase the chance of including relevant records, but can also increase latency and downstream cost. Evaluate the additional candidates rather than assuming depth is beneficial.

### Misconception 2: High overlap means one retriever is unnecessary

Overlap describes shared identities, not usefulness. A source may still provide important candidates or more reliable retrieval for particular query types.

### Misconception 3: Similar text means duplicate identity

Two records can have similar descriptions but represent distinct entities, versions, or business objects. Use the identity contract, not textual resemblance alone.

### Misconception 4: Deduplication should discard all repeated information

Combine duplicate candidate identities, but preserve provenance and any evidence required by downstream processing.

### Misconception 5: A candidate absent from the final results was necessarily ranked too low

The candidate may never have entered the pool. Inspect source results and combination behavior before investigating downstream ranking.

### Misconception 6: Candidate count measures coverage

Candidate count measures pool size. Coverage requires evidence about which relevant candidates are present or missing.

### Misconception 7: A candidate retrieved by multiple sources is automatically more relevant

Multiple appearances indicate agreement or overlap between retrieval sources, not guaranteed relevance. Any use of this signal in ranking must be an explicit, evaluated design decision.

## 12. Interview preparation

### Conceptual questions

1. Explain the difference between candidate depth and final result count.
2. Why can increasing candidate depth increase cost without improving retrieval quality?
3. What does Jaccard overlap measure, and what does it not tell you?
4. Why is stable candidate identity necessary for reliable deduplication?
5. Why should a combined candidate retain source provenance?
6. How would you distinguish a coverage problem from a downstream ranking problem?

### Scenario question

A hybrid retrieval system returns 200 source-result appearances but only 90 unique candidates. A relevant document is missing from the final output.

Describe how you would investigate the issue before changing candidate depth.

A strong answer should inspect the individual source lists, verify index availability and filter behavior, examine source depths, validate identity mapping, trace deduplication, and confirm whether the relevant document ever entered the combined pool. It should distinguish observed evidence from hypotheses.

### Practical exercise

Given:

- Lexical: `A, B, C`
- Dense: `B, D, E`
- Additional lexical depth: `F, G`
- Known relevant IDs: `{C, F, G, H}`

Answer the following:

1. How many unique candidates are in the initial combined pool?
2. How many unique candidates are present after increasing lexical depth?
3. Which candidates are unique to each source after the depth increase?
4. Which known relevant candidates are missing from the expanded pool?
5. If E and F have similar descriptions but different authoritative product IDs, should they be merged?
6. What changes if dense retrieval is removed?
7. What provenance should be retained for B?

**Expected reasoning:**

- The initial pool is `{A, B, C, D, E}`, containing five unique candidates.
- After increasing lexical depth, the pool is `{A, B, C, D, E, F, G}`, containing seven unique candidates.
- After the depth increase, lexical-only candidates are `{A, C, F, G}` and dense-only candidates are `{D, E}`; B is shared.
- H is the only known relevant ID absent from the expanded pool.
- E and F remain distinct when their authoritative product IDs differ and product identity is the chosen granularity.
- Removing dense retrieval leaves `{A, B, C, F, G}`. D and E are no longer available through the observed source results.
- B retains its source and rank from both lexical and dense retrieval.

The fact that H is missing does not explain why. Investigate whether it is indexed, eligible under filters, retrieved at a deeper source depth, or lost through identity or combination behavior.

### Advanced follow-up

Suppose increasing depth adds 50 candidates but does not recover H. What would you investigate next, and what evidence would distinguish an indexing problem from a filtering problem?

A strong answer identifies the evidence needed before proposing a fix. Increasing depth again without diagnosing the cause is not a sufficient engineering response.

## 13. Self-assessment

You should be able to answer these questions without referring to the chapter:

- Can I explain why candidate depth and final result count are different?
- Can I calculate intersection, union, unique contribution, and Jaccard overlap?
- Can I explain why overlap is not the same as coverage?
- Can I define candidate identity granularity for a specific retrieval stage?
- Can I explain when two similar records must remain separate?
- Can I preserve source and rank provenance while combining candidate identities?
- Can I inspect source lists and identify where a relevant candidate disappeared?
- Can I justify a depth or retriever-participation change using evidence and cost constraints?

If you cannot explain a decision's assumptions and failure modes, treat that decision as unresolved rather than memorizing a rule.

## 14. Key takeaways

- Candidate depth controls how many candidates a source or pipeline stage makes available; it is not the same as final result count.
- Candidate overlap describes shared identities between sources, while coverage concerns the presence of relevant candidates.
- Unique source contributions are diagnostic evidence, not proof of relevance.
- Deduplication requires a defined identity granularity and reliable canonical identifiers.
- Similar content is not sufficient evidence that two records represent the same candidate.
- Provenance should survive candidate combination so engineers can trace where candidates came from.
- Missing candidates should be diagnosed across indexing, filters, source retrieval, identity handling, and combination before increasing depth.
- Candidate depth and retriever participation should be adjusted using observed candidate behavior, relevance evidence, latency, and cost.

## 15. Chapter boundary

This chapter focuses on candidate depth, overlap, identity, deduplication, provenance, and candidate-pool diagnostics.

The preceding retrieval material covers how lexical and dense sources generate candidates and how their retrieval behavior can be inspected. The next retrieval material can build on these candidate sets when examining retrieval evaluation and quality measurement.

Detailed score or rank fusion belongs in **02-Retrieval-Fusion-and-Candidate-Combination.md**. Formal evaluation metrics and evaluation methodology belong in the relevant retrieval evaluation material. Detailed reranking strategies remain outside this chapter.

**Status:** Revised draft; awaiting review and approval.
