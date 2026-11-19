# RET-05 — Lexical Retrieval and Sparse Search

## Chapter Purpose

This chapter explains how conventional lexical retrieval systems find and rank documents using terms extracted from text. It develops the engineering understanding needed to build a lexical search baseline, trace matching behavior, interpret ranking scores, and diagnose common retrieval failures.

Lexical retrieval is particularly useful when queries contain exact identifiers, technical terminology, error codes, product names, or other terms whose precise presence matters.

The chapter progresses from term matching and index structures to scoring behavior and practical tuning. It also introduces learned sparse retrieval as an alternative approach without requiring model training or implementation.

## Learning Outcomes

After completing this chapter, you should be able to:

- Explain how Boolean retrieval and term-based matching identify candidate documents.
- Trace queries through tokenization, text analysis, and inverted-index lookups.
- Explain the behavior of exact-term, fielded, phrase, and proximity queries.
- Distinguish candidate matching from relevance ranking.
- Explain TF-IDF and the core scoring behavior of BM25.
- Configure a conventional lexical retrieval baseline and interpret its scores appropriately.
- Diagnose vocabulary mismatches, analyzer problems, and other lexical retrieval failures.
- Justify targeted changes to analyzers, synonyms, or scoring parameters.
- Describe how conventional lexical retrieval differs from learned sparse retrieval.

## Prerequisites

Before starting, you should understand:

- Basic data structures and lookup operations.
- Text documents, queries, and document collections.
- Basic programming concepts and the ability to inspect program inputs and outputs.
- The distinction between retrieving candidate documents and determining whether results are relevant.

Earlier Retrieval Engineering chapters provide additional context on retrieval requirements, document preparation, chunking, and searchable representations.

## Chapter Navigation

Follow the files in the order shown below.

### 1. [Term Matching and Inverted Indexes](./01-Term-Matching-and-Inverted-Indexes.md)

**Responsibility:** Explain how lexical retrieval transforms text into searchable terms and uses inverted indexes to locate candidate documents.

Topics include:

- Boolean retrieval and query composition.
- Terms, documents, postings, and inverted-index structures.
- Tokenization, normalization, stemming, and stop-word handling.
- Analyzer behavior and its effect on matching.
- Exact-term, identifier, fielded, phrase, and proximity search.
- Tracing query processing and candidate selection.

**Expected outcome:** You can explain why a document matches or fails to match a lexical query.

### 2. [Sparse Scoring and BM25 Behavior](./02-Sparse-Scoring-and-BM25-Behavior.md)

**Responsibility:** Explain how lexical systems rank matching documents and establish a practical scoring baseline.

Topics include:

- Matching versus ranking.
- Term frequency and document frequency.
- Sparse representations and TF-IDF.
- BM25 scoring intuition and its major parameters, including \(k_1\) and \(b\).
- Term weighting and document-length normalization.
- Score interpretation and practical baseline configuration.

**Expected outcome:** You can explain why one matching document ranks above another and configure a conventional lexical scoring baseline.

### 3. [Lexical Use Cases, Failure Modes, and Tuning](./03-Lexical-Use-Cases-Failure-Modes-and-Tuning.md)

**Responsibility:** Explain when lexical retrieval is appropriate, why it fails, and how to improve it through targeted engineering decisions.

Topics include:

- Exact-match and terminology-sensitive workloads.
- Technical identifiers, error codes, product names, and version strings.
- Vocabulary mismatch, analyzer mismatches, and tokenization problems.
- Field-specific search and synonym handling.
- Practical analyzer and BM25 tuning.
- Candidate-generation failures versus ranking problems.
- Awareness of learned sparse retrieval, including SPLADE-style expansion.

**Expected outcome:** You can diagnose a lexical retrieval failure, justify a targeted adjustment, and define a suitable validation check.

## Practical Outcome

Build a **lexical retrieval baseline tested against representative queries, with documented analyzer and scoring choices**.

The resulting learning artifact should include:

1. A defined document collection and representative query set.
2. The assumptions used for tokenization, analysis, and normalization.
3. The lexical retrieval configuration.
4. The scoring approach and relevant BM25 parameters, when applicable.
5. Representative search results and their ranking order.
6. At least one traced exact-term or phrase query.
7. At least one diagnosed lexical retrieval failure.
8. A justified analyzer or scoring adjustment.
9. A validation note describing what was checked and what remains uncertain.

Keep the implementation focused on demonstrating lexical retrieval behavior. Building a complete search platform is outside this chapter's objective.

Formal retrieval metrics and controlled benchmark methodology belong to RET-10. This chapter may use small diagnostic checks to understand observed behavior without duplicating that material.

## Scope Boundaries

This chapter focuses on conventional lexical retrieval, inverted indexes, analyzers, sparse scoring, and lexical-specific diagnosis and tuning.

The following topics remain within their designated chapters:

| Topic | Primary owner |
|---|---|
| Retrieval problem formulation and relevance objectives | RET-01 |
| Document extraction, normalization, metadata, and corpus lifecycle | RET-02 |
| Retrieval granularity, chunking, and structural context | RET-03 |
| Searchable representations, index structures, and index lifecycle | RET-04 |
| Dense retrieval, embeddings, vector search, and ANN behavior | RET-06 |
| Query processing, metadata constraints, and structured filters | RET-07 |
| Hybrid retrieval, candidate generation, and fusion | RET-08 |
| General ranking and reranking | RET-09 |
| Retrieval metrics and controlled evaluation methodology | RET-10 |
| Broader retrieval failure diagnosis and root-cause analysis | RET-11 |
| End-to-end retrieval integration and application lab | RET-12 |

Learned sparse retrieval receives awareness-level coverage only. Training a learned sparse model from scratch is not required.

## Completion Criteria

Use the following checklist to verify practical understanding and completion of the chapter.

- [ ] Trace a query through term analysis and inverted-index lookup.
- [ ] Explain how Boolean, exact-term, fielded, and phrase queries affect candidate selection.
- [ ] Distinguish candidate matching from relevance ranking.
- [ ] Explain the practical differences between TF-IDF and BM25.
- [ ] Interpret BM25 behavior without treating raw scores as calibrated relevance probabilities.
- [ ] Build and document a conventional lexical retrieval baseline.
- [ ] Diagnose at least one lexical failure and justify a targeted adjustment.
- [ ] Describe when learned sparse retrieval may warrant further investigation.
- [ ] Record the configuration, representative results, validation checks, and remaining uncertainties.

Completion requires demonstrated understanding and explicit approval of the chapter documentation, not merely reading all three files.

---

**Next:** [Term Matching and Inverted Indexes](./01-Term-Matching-and-Inverted-Indexes.md)
