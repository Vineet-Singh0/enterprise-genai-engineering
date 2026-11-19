# RET — Retrieval Engineering

## Overview

Retrieval Engineering covers the design, implementation, evaluation, and optimization of systems that find relevant information from a corpus under defined quality, constraint, and operational requirements.

Retrieval supports semantic search, enterprise knowledge discovery, structured information access, recommendation, and retrieval-augmented generation (RAG). **Retrieval is not synonymous with RAG**; RET treats retrieval as an independent capability serving multiple downstream applications.

## Learning Outcomes

By completing RET Phase 1, you should be able to:

- Formulate retrieval problems and define measurable success criteria.
- Prepare traceable, retrieval-ready data and metadata.
- Select suitable retrieval units, representations, and indexes.
- Implement and compare lexical and dense retrieval baselines.
- Apply query processing and metadata constraints appropriately.
- Design candidate-generation and ranking pipelines when justified.
- Evaluate retrieval quality through controlled experiments.
- Diagnose failures and optimize quality, latency, and resource usage.
- Integrate retrieval with downstream consumers through explicit interfaces.

## Curriculum and Chapter Navigation

Follow the recommended sequence below. The order supports progressive learning but does not imply that every chapter is a mandatory technical prerequisite for every architecture.

1. [**RET-01 — Retrieval Problem Formulation and System Fundamentals**](RET-01-Retrieval-Problem-Formulation-and-System-Fundamentals/README.md) — Define retrieval problems, relevance, success criteria, and system boundaries.
2. [**RET-02 — Document Ingestion and Retrieval-Oriented Processing**](RET-02-Document-Ingestion-and-Retrieval-Oriented-Processing/README.md) — Prepare source content, metadata, provenance, and corpus lifecycle.
3. [**RET-03 — Chunking and Document Structure**](RET-03-Chunking-and-Document-Structure/README.md) — Select retrieval granularity and preserve useful document structure.
4. [**RET-04 — Retrieval Representations and Indexing**](RET-04-Retrieval-Representations-and-Indexing/README.md) — Understand searchable representations, index design, and lifecycle trade-offs.
5. [**RET-05 — Lexical Retrieval and Sparse Search**](RET-05-Lexical-Retrieval-and-Sparse-Search/README.md) — Build and evaluate lexical retrieval baselines.
6. [**RET-06 — Dense Retrieval and Vector Search**](RET-06-Dense-Retrieval-and-Vector-Search/README.md) — Implement dense retrieval and compare exact with approximate search.
7. [**RET-07 — Query Processing and Metadata Constraints**](RET-07-Query-Processing-and-Metadata-Constraints/README.md) — Apply query transformations, routing, and structured constraints.
8. [**RET-08 — Hybrid Retrieval and Candidate Generation**](RET-08-Hybrid-Retrieval-and-Candidate-Generation/README.md) — Combine retrieval sources and evaluate candidate generation when appropriate.
9. [**RET-09 — Ranking, Reranking, and Relevance Optimization**](RET-09-Ranking-Reranking-and-Relevance-Optimization/README.md) — Improve candidate ordering and manage ranking trade-offs.
10. [**RET-10 — Retrieval Evaluation and Experimental Design**](RET-10-Retrieval-Evaluation-and-Experimental-Design/README.md) — Design reproducible evaluations and interpret metrics.
11. [**RET-11 — Retrieval Diagnostics and Optimization**](RET-11-Retrieval-Diagnostics-and-Optimization/README.md) — Diagnose failures and validate targeted improvements.
12. [**RET-12 — End-to-End Retrieval Integration and Application Lab**](RET-12-End-to-End-Retrieval-Integration-and-Application-Lab/README.md) — Integrate, test, evaluate, and defend a reusable retrieval capability.

## Learning Progression

Basic programming and software engineering from ENG are assumed. AIF provides useful embedding and similarity foundations, while LLM is an optional downstream dependency when an application uses language-model generation.

RET-05 and RET-06 establish independent lexical and dense baselines. Both are needed for hybrid implementations combining both methods, but neither is universally required for the other. RET-08 and RET-09 apply according to the architecture's candidate-generation and ranking stages. ANN evaluation requires an exact-search reference; candidate-recall evaluation requires a defined candidate-generation stage.

Practical work progresses from retrieval baselines and controlled evaluation to diagnosis, optimization, and the RET-12 integration lab.

## Evaluation Principles

Select evaluation methods according to the system and experiment. Distinguish candidate recall from final-ranking quality, ANN recall from relevance recall, hard-constraint correctness from relevance, and retrieval quality from downstream application quality. Assess operational behavior, including latency and resource use, where relevant.

## Domain Boundaries

- **ENG — Engineering Foundations:** Programming, software engineering, databases, APIs, and testing.
- **AIF — AI Foundations:** Representation learning, embedding spaces, similarity, and foundational machine learning.
- **LLM — LLM Engineering:** Language-model behavior, generation, and context engineering.
- **AGT — Agent Engineering:** Agent planning, tool use, and orchestration.
- **PROD — Production AI Engineering:** Deployment, serving, monitoring, reliability, and infrastructure.
- **ENT — Enterprise AI Systems:** Enterprise authorization, security, governance, and compliance.

RET owns retrieval-specific design, implementation, evaluation, ranking, and diagnostics. It applies adjacent-domain capabilities without duplicating their foundational teaching.

## Capstone and Completion Criteria

RET-12 culminates in a tested retrieval pipeline with explicit interfaces, traceable evidence, acceptance results, and an architectural design review. RAG is one possible downstream consumer, not a mandatory definition of the capstone.

You have completed RET Phase 1 when you can design and implement a retrieval pipeline, evaluate it against defined acceptance criteria, diagnose retrieval and operational failures, and justify the architecture and its trade-offs.

**Estimated reading time:** 345 minutes (5 hours 45 minutes), excluding implementation, debugging, experiments, and design review.

## Documentation Status and Maintenance

This README is based on **RET Phase 1 Documentation Plan v1.4.1**. Chapter paths reflect the planned structure and proposed RET-12 rename. Repository existence and link resolution have not been verified; validate all relative links against the approved repository structure before publication.

Maintain this README as the domain navigation entry point, not as a substitute for chapter teaching. Use relative paths, validate links whenever referenced files or folders are renamed, and keep detailed concept explanations in their designated lessons. Later chapters may reference earlier concepts but should not duplicate their primary explanations.
