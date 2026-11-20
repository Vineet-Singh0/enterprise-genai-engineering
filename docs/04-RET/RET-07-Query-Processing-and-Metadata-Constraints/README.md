# RET-07 — Query Processing and Metadata Constraints

## Purpose

This chapter teaches how retrieval systems transform queries, select appropriate retrieval methods, and enforce structured constraints while preserving user intent and correctness.

## Prerequisites

- [RET-01 — Retrieval Problem Formulation and System Fundamentals](../RET-01-Retrieval-Problem-Formulation-and-System-Fundamentals/README.md)
- [RET-02 — Document Ingestion and Retrieval-Oriented Processing](../RET-02-Document-Ingestion-and-Retrieval-Oriented-Processing/README.md)
- [RET-05 — Lexical Retrieval and Sparse Search](../RET-05-Lexical-Retrieval-and-Sparse-Search/README.md)
- [RET-06 — Dense Retrieval and Vector Search](../RET-06-Dense-Retrieval-and-Vector-Search/README.md)

## Learning Path

Estimated reading time: **25 minutes**, excluding practical work.

| Lesson | Focus | Reading time |
|---|---|---:|
| [01 — Query Normalization, Rewriting, and Expansion](01-Query-Normalization-Rewriting-and-Expansion.md) | Query transformations, decomposition, routing, and awareness-level HyDE and iterative retrieval. | 8 min |
| [02 — Metadata Filters and Structured Constraints](02-Metadata-Filters-and-Structured-Constraints.md) | Structured predicates, hard constraints, relevance signals, and choosing structured retrieval when preferable to text retrieval. | 8 min |
| [03 — Filter Execution, Empty Results, and Query Diagnostics](03-Filter-Execution-Empty-Results-and-Query-Diagnostics.md) | Filter interactions, over-filtering, empty results, and query-specific diagnostics. | 9 min |

## Learning Outcomes and Practical Work

You should be able to preserve query intent, select appropriate retrieval methods, express structured requirements as explicit filters, distinguish hard constraints from relevance preferences, and determine when direct structured retrieval is preferable to text retrieval.

Build or design a constrained retrieval endpoint. Validate it with tests for intent preservation, filter correctness, restrictive or conflicting constraints, and evidence-based diagnosis of empty results.

## Scope Boundaries

RET-05 and RET-06 own lexical and dense retrieval mechanics; RET-08 owns candidate combination and fusion; RET-11 owns general retrieval diagnostics. AGT owns autonomous planning, while ENT owns enterprise-wide authorization policy.

## Completion Criteria

Demonstrate correct query transformations, justified retrieval-method selection, explicit constraint enforcement, and evidence-based diagnosis. An empty result set can be correct: never silently relax a hard constraint merely to return results.
