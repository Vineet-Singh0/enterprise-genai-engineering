# RET-01 — Retrieval Problem Formulation and System Fundamentals

## Purpose

This chapter establishes the foundations for formulating retrieval as an information-access problem. Before selecting retrieval algorithms or implementing a pipeline, an engineer must understand what information users need, which corpus can satisfy that need, what makes a result relevant, and how retrieval success will be judged.

The chapter introduces the core concepts and system boundaries required to reason about retrieval systems. It prepares learners to evaluate retrieval methods in later chapters without teaching those methods prematurely.

## Learning Outcomes

By completing this chapter, you should be able to:

- Define the core objects involved in retrieval, including queries, corpora, documents, candidates, and relevant results.
- Distinguish an information need from the query text used to express it.
- Identify the corpus boundaries and evidence required to address an information need.
- Explain why relevance depends on the task and the user's information need.
- Establish retrieval success criteria and acceptance conditions.
- Explain the boundary between retrieval success and downstream application or generation success.
- Write a retrieval problem specification for a defined use case.

## Prerequisites

**Required — Engineering Foundations (ENG)**

- Programming fundamentals.
- Database fundamentals.

**Recommended — AI Foundations (AIF)**

- Basic familiarity with evaluation concepts.

These prerequisites provide the background needed to reason about retrieval inputs, outputs, and success criteria. This chapter introduces the retrieval-specific concepts required for the rest of the RET domain.

## Chapter Contents

Complete the teaching files in the following order.

| File | Topic | Purpose |
|---|---|---|
| [01 — Retrieval Problems and Information Needs](01-Retrieval-Problems-and-Information-Needs.md) | Formulating retrieval problems | Establish the information need, query, corpus, document, retrieval unit, candidate, and expected evidence. |
| [02 — Relevance and Retrieval Success Criteria](02-Relevance-and-Retrieval-Success-Criteria.md) | Defining relevance and success | Explain task-dependent relevance and establish criteria for judging retrieval outcomes. |
| [03 — Retrieval Pipeline and System Boundaries](03-Retrieval-Pipeline-and-System-Boundaries.md) | Understanding the retrieval system | Connect the conceptual pipeline stages and distinguish retrieval responsibilities from downstream application responsibilities. |

## Estimated Reading Time

**20 minutes**, excluding practical exercises.

This is the planning estimate specified in the RET Phase 1 Documentation Plan. Actual reading time will depend on the learner's background and time spent on the exercise.

## Scope and Boundaries

This chapter focuses on problem formulation, relevance, success criteria, and conceptual system boundaries. It does not teach retrieval algorithms or implement a complete retrieval pipeline.

| Topic | Primary location | Relationship to RET-01 |
|---|---|---|
| Document extraction, normalization, identity, and provenance | [RET-02 — Document Ingestion and Retrieval-Oriented Processing](../RET-02-Document-Ingestion-and-Retrieval-Oriented-Processing/README.md) | Defines how source material becomes a usable corpus. |
| Retrieval granularity and chunking | [RET-03 — Chunking and Document Structure](../RET-03-Chunking-and-Document-Structure/README.md) | Develops the design of retrieval units. |
| Searchable representations and index structures | [RET-04 — Retrieval Representations and Indexing](../RET-04-Retrieval-Representations-and-Indexing/README.md) | Explains how corpus content becomes searchable. |
| Lexical retrieval and sparse search | [RET-05 — Lexical Retrieval and Sparse Search](../RET-05-Lexical-Retrieval-and-Sparse-Search/README.md) | Teaches lexical matching and sparse retrieval methods. |
| Dense retrieval and vector search | [RET-06 — Dense Retrieval and Vector Search](../RET-06-Dense-Retrieval-and-Vector-Search/README.md) | Teaches embedding-based retrieval and vector search. |
| Query processing and metadata constraints | [RET-07 — Query Processing and Metadata Constraints](../RET-07-Query-Processing-and-Metadata-Constraints/README.md) | Develops query transformations and structured constraints. |
| Hybrid retrieval and candidate generation | [RET-08 — Hybrid Retrieval and Candidate Generation](../RET-08-Hybrid-Retrieval-and-Candidate-Generation/README.md) | Combines candidate sources when the use case requires them. |
| Ranking and reranking | [RET-09 — Ranking, Reranking, and Relevance Optimization](../RET-09-Ranking-Reranking-and-Relevance-Optimization/README.md) | Develops result ordering and relevance optimization. |
| Retrieval evaluation and experimental design | [RET-10 — Retrieval Evaluation and Experimental Design](../RET-10-Retrieval-Evaluation-and-Experimental-Design/README.md) | Owns formal retrieval metrics, evaluation methodology, and controlled experiments. |
| Retrieval diagnostics and optimization | [RET-11 — Retrieval Diagnostics and Optimization](../RET-11-Retrieval-Diagnostics-and-Optimization/README.md) | Develops systematic failure analysis and targeted optimization. |
| End-to-end retrieval integration and application lab | [RET-12 — End-to-End Retrieval Integration and Application Lab](../RET-12-End-to-End-Retrieval-Integration-and-Application-Lab/README.md) | Applies retrieval concepts in an integrated implementation and design exercise. |

**Navigation note:** These cross-chapter destinations follow the proposed RET Phase 1 Documentation Plan v1.4.1. The plan states that repository verification has not been performed. Confirm every destination against the approved final inventory and actual repository before publication; the links must not be treated as verified merely because they are written as relative paths.

## Practical Exercise

Write a retrieval problem specification for a technical knowledge base.

Your specification should identify:

1. **Information need:** What information must the user obtain, and why?
2. **Corpus scope:** Which sources are in scope, and which are excluded?
3. **Representative queries:** What queries express realistic user needs?
4. **Expected evidence:** What documents or retrieval units could satisfy those needs?
5. **Relevance criteria:** What makes a result useful for the intended task?
6. **Acceptance conditions:** What observable conditions would indicate that retrieval is successful?
7. **System boundaries:** What is the responsibility of retrieval, and what remains the responsibility of a downstream application or generation component?

Keep the exercise focused on specifying the problem. Do not implement lexical search, vector search, hybrid retrieval, reranking, or a complete retrieval pipeline in this chapter.

## Completion Criteria

You have completed RET-01 when you can:

- Explain the difference between an information need and a query.
- Identify the corpus and retrieval units relevant to a defined problem.
- Describe relevance in terms of the user's task rather than superficial similarity alone.
- State explicit retrieval success and acceptance criteria.
- Distinguish retrieval outcomes from downstream application outcomes.
- Produce a retrieval problem specification that another engineer could use to guide implementation and evaluation.

If you cannot explain why a result should count as relevant or how success will be judged, the problem is not yet sufficiently specified for sound retrieval-system design.

## Documentation Status

- **Chapter structure:** Three teaching files, in the approved order.
- **Reading-time estimate:** 20 minutes, aligned with the RET Phase 1 Documentation Plan.
- **Scope:** Restricted to retrieval problem formulation, relevance, success criteria, and conceptual system boundaries.
- **Cross-chapter references:** Proposed paths based on the planning inventory; live repository compatibility has not been verified.
- **Publication readiness:** Pending validation of the final approved inventory and all relative links against the actual repository.
