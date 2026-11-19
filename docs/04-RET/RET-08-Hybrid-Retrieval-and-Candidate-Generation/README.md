# RET-08 — Hybrid Retrieval and Candidate Generation

## Purpose

Hybrid retrieval and candidate generation determine how a retrieval system gathers a sufficiently relevant, diverse, and manageable set of candidates from one or more retrieval sources.

Different retrieval methods identify different kinds of relevance. Lexical retrieval can be effective for exact terms, identifiers, and vocabulary-specific matches. Dense retrieval can identify semantically related content despite vocabulary differences. Structured, entity-based, or graph-based retrieval may contribute additional candidates when the application's data model and retrieval requirements justify their use.

Combining these sources does not automatically improve retrieval quality. A hybrid system must decide which sources to use, how to combine their results, how many candidates to retain, how to handle duplicates, and how to determine whether the resulting candidate set contains relevant items that individual sources would miss.

The central engineering question is:

**How should a retrieval system construct a candidate set that provides adequate relevance coverage without introducing unnecessary latency, computational cost, duplication, or downstream ranking work?**

RET-08 focuses on candidate generation and candidate-set composition. It does not replace the deeper treatment of lexical retrieval, dense retrieval, query processing, final ranking, or formal retrieval evaluation covered elsewhere in RET.

## Learning Outcomes

After completing this chapter, the learner should be able to:

- Explain the difference between candidate generation and final ranking.
- Select retrieval sources according to their complementary strengths and the application's retrieval requirements.
- Identify when lexical and dense retrieval may contribute complementary candidates.
- Recognize when structured, entity-based, or graph-based candidate sources may be useful, without assuming that every system requires them.
- Compare rank-based and score-based retrieval fusion approaches.
- Explain Reciprocal Rank Fusion (RRF), weighted score fusion, score compatibility, normalization, and retrieval-stage cascades at an engineering level.
- Analyze candidate depth, overlap, deduplication, provenance, and candidate-set size.
- Distinguish candidate recall from final ranking quality.
- Compare a single-retriever baseline with a hybrid candidate set using appropriate relevance evidence.
- Reason about the trade-offs among candidate coverage, latency, resource consumption, and downstream ranking cost.
- Identify the limitations of a candidate set before attempting to improve downstream ranking.

## Prerequisites and Dependencies

### Conceptual prerequisites

The learner should understand the broad retrieval pipeline and the distinction between retrieving a candidate set and ordering candidates for downstream use.

If these concepts are unfamiliar, review the relevant retrieval-pipeline and ranking-boundary material in the earlier RET chapters before proceeding. This README provides navigation rather than duplicating those foundational explanations.

### Implementation-specific dependencies

The following chapters provide the relevant implementation foundations when working with the corresponding retrieval methods:

- [RET-05 — Lexical Retrieval and Sparse Search](../RET-05-Lexical-Retrieval-and-Sparse-Search/README.md): lexical matching and sparse-retrieval behavior.
- [RET-06 — Dense Retrieval and Vector Search](../RET-06-Dense-Retrieval-and-Vector-Search/README.md): dense retrieval, vector search, and approximate nearest-neighbor behavior.
- [RET-07 — Query Processing and Metadata Constraints](../RET-07-Query-Processing-and-Metadata-Constraints/README.md): query processing, transformations, and structured constraints.

These are conditional implementation dependencies. For example, a system combining lexical and dense retrieval benefits from the corresponding RET-05 and RET-06 foundations. A system using only one source or a different source combination does not need to implement every technique discussed in those chapters.

## Chapter Structure

### 01 — Candidate Generation and Retriever Complementarity

File: Candidate Generation and Retriever Complementarity

This chapter establishes the role of candidate generation in the retrieval pipeline and explains why different retrieval sources may contribute different candidates.

It covers:

- Candidate generation versus final ranking.
- Retrieval-source strengths, limitations, and complementarity.
- Lexical and dense retrieval as a common hybrid-retrieval combination.
- Exact terms, identifiers, semantic similarity, and vocabulary mismatch.
- When structured, entity-based, or graph-based sources may contribute useful candidates.
- Selecting retrieval sources according to the query, data, constraints, and system requirements.

The emphasis is on deciding which sources should participate and why. It does not re-teach the internal mechanics of lexical or dense retrieval, nor does it cover detailed graph construction or final ranking.

### 02 — Retrieval Fusion and Candidate Combination

File: Retrieval Fusion and Candidate Combination

This chapter examines how outputs from multiple retrieval sources can be combined into a unified candidate set.

It covers:

- Candidate-set combination versus score-based combination.
- Rank-based and score-based fusion.
- Reciprocal Rank Fusion (RRF).
- Weighted score fusion and the compatibility of source scores.
- Score normalization and the limitations of assuming that scores from different retrievers are directly comparable.
- Retrieval-stage cascades and their operational trade-offs.
- Worked calculations that illustrate how fusion decisions affect candidate composition.

The emphasis is on combining retrieval outputs correctly and understanding the assumptions behind each approach. Detailed final-ranking and cross-encoder mechanics belong to RET-09.

### 03 — Candidate Depth, Deduplication, and Coverage

File: Candidate Depth Deduplication and Coverage

This chapter examines how the size and composition of a candidate set affect the rest of the retrieval pipeline.

It covers:

- Candidate depth and the trade-off between coverage and computational cost.
- Candidate overlap across retrieval sources.
- Deduplication and stable candidate identity.
- Preserving source provenance and retrieval evidence.
- Candidate recall against a known set of relevant items.
- Candidate survival and the handoff from retrieval to downstream ranking.
- Diagnosing candidate-set limitations without confusing them with ranking failures.

The emphasis is on determining whether the candidate set is adequate for downstream processing. Formal metric methodology, benchmark design, and controlled evaluation belong to RET-10.

## Recommended Learning Sequence

Work through the chapter in the following order:

1. **Understand candidate generation:** Establish what the retrieval stage must provide before ranking begins.
2. **Analyze source complementarity:** Determine which sources contribute useful candidates that other sources may miss.
3. **Choose a fusion strategy:** Understand how the selected sources should be combined.
4. **Inspect candidate-set composition:** Examine depth, overlap, duplication, provenance, and coverage.
5. **Make an engineering decision:** Balance relevance coverage against latency, cost, and downstream processing requirements.
6. **Define the evaluation evidence:** Identify what data is required to establish whether the proposed combination is actually beneficial.

Do not assume that adding more retrieval sources, increasing candidate depth, or applying fusion necessarily improves system quality. Each is a design choice that requires justification.

## Practical Engineering Exercise

Design a small candidate-generation experiment that compares a single-retriever baseline with a hybrid retrieval configuration.

### Exercise procedure

1. **Define the retrieval scenario.** Specify the query, corpus, relevant constraints, and retrieval objective.

2. **Establish a baseline.** Generate candidates using one retrieval source. Record the source, retrieval depth, candidate identities, latency, and other relevant operational measurements.

3. **Generate a hybrid candidate set.** Add a complementary retrieval source and combine the outputs using a justified strategy. Keep the comparison conditions sufficiently consistent to make the results interpretable.

4. **Inspect complementarity.** Identify candidates shared by both sources and candidates contributed by only one source. Determine whether the unique candidates add meaningful value rather than merely increasing set size.

5. **Apply fusion and deduplication.** Record the fusion method, candidate identity rules, resulting candidate set, and source provenance.

6. **Assess coverage using relevance evidence.** Define a small set of known relevant items using appropriate relevance judgments or a documented ground-truth dataset. Compare how many of these items appear in the baseline and hybrid candidate sets. Report the observed coverage and its limitations.

7. **Inspect operational trade-offs.** Compare candidate-set size, overlap, latency, and resource or ranking cost where measurements are available.

8. **Document the decision.** Explain whether the hybrid configuration is justified for the scenario, which assumptions remain untested, and what further evaluation would be required.

### Expected outcome

Produce a short engineering note containing:

- The retrieval scenario and baseline.
- The selected candidate sources and justification.
- The fusion and deduplication strategy.
- Candidate overlap and source-specific contributions.
- Coverage results grounded in known relevance evidence.
- Measured operational trade-offs, where available.
- Limitations, unresolved assumptions, and a recommendation.

Do not claim improved candidate recall without relevance evidence. Do not claim improved end-to-end retrieval quality merely because the hybrid candidate set is larger. A candidate set may contain more items without containing more relevant items.

This exercise introduces candidate-coverage reasoning. Formal metric definitions, statistical considerations, benchmark methodology, and controlled experiments are developed in RET-10.

## Where This Is Covered
The RET chapters form a connected retrieval-engineering curriculum. Each chapter has a primary responsibility.

| Chapter | Primary responsibility | Relationship to RET-08 |
|---|---|---|
| RET-05 — Lexical Retrieval and Sparse Search | Lexical matching and sparse retrieval | Supplies one possible candidate source. |
| RET-06 — Dense Retrieval and Vector Search | Dense retrieval and vector search | Supplies another possible candidate source. |
| RET-07 — Query Processing and Metadata Constraints | Query processing, transformations, and constraints | Shapes retrieval inputs and applicable restrictions. |
| RET-08 — Hybrid Retrieval and Candidate Generation | Candidate-source combination, fusion, depth, deduplication, and coverage | Determines which candidates are available downstream. |
| RET-09 — Ranking, Reranking, and Relevance Optimization | Final candidate ordering and reranking | Uses the candidate set produced by retrieval. |
| RET-10 — Retrieval Evaluation and Experimental Design | Formal metrics and controlled evaluation | Establishes how retrieval approaches should be evaluated. |
| RET-11 — Retrieval Diagnostics and Failure Analysis | Diagnosing retrieval failures | Uses retrieval evidence to investigate system behavior. |

The essential boundary is:

**RET-08 determines how candidates are assembled; RET-09 determines how candidates are ordered; RET-10 establishes how retrieval quality is evaluated.**

A downstream ranker cannot recover a relevant item that was never included in its candidate set. Conversely, including a relevant item does not guarantee that the ranker will place it in an appropriate position. These are different failure modes and must be investigated separately.

For detailed ranking and reranking concepts, continue to [RET-09 — Ranking, Reranking, and Relevance Optimization](../RET-09-Ranking-Reranking-and-Relevance-Optimization/README.md).

For formal retrieval metrics and experimental methodology, continue to [RET-10 — Retrieval Evaluation and Experimental Design](../RET-10-Retrieval-Evaluation-and-Experimental-Design/README.md).

## Completion Criteria

RET-08 is complete when the learner can:

- Explain why multiple retrieval sources may or may not be useful for a given scenario.
- Distinguish candidate generation, fusion, and final ranking.
- Justify a fusion strategy and explain its assumptions.
- Analyze candidate depth, overlap, deduplication, and provenance.
- Assess candidate coverage using known relevance evidence.
- Identify whether a limitation originates in candidate generation or downstream ranking.
- Compare retrieval alternatives while accounting for operational trade-offs.
- State which conclusions are supported by evidence and which require further evaluation.

Completion is demonstrated through engineering reasoning and a reproducible practical comparison, not merely by reading the chapter.

## Planning Notes

The chapter's planning estimates are governed by the RET chapter plan. Reading time and word count are estimates for planning purposes, not per-file quotas or substitutes for technical completeness. Each lesson should be as detailed as necessary to meet its learning objectives without unnecessary repetition.

## Next Step

Begin with [01 — Candidate Generation and Retriever Complementarity](01-Candidate-Generation-and-Retriever-Complementarity.md) after this README has been reviewed and explicitly approved.

