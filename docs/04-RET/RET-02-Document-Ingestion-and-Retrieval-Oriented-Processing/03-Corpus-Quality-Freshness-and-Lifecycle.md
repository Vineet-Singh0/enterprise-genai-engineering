# Corpus Quality, Freshness, and Lifecycle

## Learning Objectives

After completing this chapter, you should be able to:

- Explain how corpus quality affects retrieval reliability.
- Identify duplicate, incomplete, conflicting, stale, and low-quality content.
- Distinguish source, processing, and index freshness.
- Explain document lifecycle transitions and their consequences.
- Define readiness criteria for making content available to retrieval systems.

## Prerequisites

Understand [Document Extraction and Normalization](./01-Document-Extraction-and-Normalization.md) and [Metadata, Identity, and Provenance](./02-Metadata-Identity-and-Provenance.md).

## 1. Why Corpus Quality Matters

A retrieval system can execute correctly and still return poor results because its corpus contains incomplete documents, obsolete policies, duplicate articles, or conflicting instructions.

**Corpus quality describes whether available content is suitable for its intended use.** Successful ingestion alone does not establish that content is complete, authoritative, current, or safe to make available.

Quality requirements depend on the use case. A missing table may be tolerable in one collection but unacceptable when the table contains essential policy rules.

## 2. Dimensions of Corpus Quality

| Dimension | Example | Possible validation approach |
|---|---|---|
| Completeness | Required sections are missing | Check expected sections or source-to-output coverage |
| Structural integrity | Table relationships are corrupted | Validate structure and required relationships |
| Duplication | The same document is ingested repeatedly | Compare stable identities and investigate content similarity |
| Consistency | Active documents give conflicting instructions | Compare applicable versions and authority rules |
| Authority | An unofficial copy is treated as authoritative | Validate against source and ownership policies |
| Relevance | Unrelated material enters a specialized corpus | Apply documented inclusion criteria |
| Freshness | An obsolete policy remains available | Compare source state with required update expectations |

Some conditions are objectively testable, such as missing required fields or malformed structure. Others, such as authority and semantic conflicts, may require source-owner decisions or human review. Similarity alone does not prove that two documents are duplicates: they may differ by version, jurisdiction, or effective date.

Quality failures should trigger an appropriate response, such as reprocessing, quarantine, source correction, review, or exclusion. A single quality score should not conceal failures that require different actions.

## 3. Freshness: Source, Processing, and Index

Freshness describes several related but distinct states:

- **Source freshness:** Whether content reflects the latest relevant state of its source.
- **Processing freshness:** Whether the processed representation reflects the source version and processing requirements that should currently apply.
- **Index freshness:** Whether retrieval infrastructure reflects the processed content that should currently be available.

These states can diverge. A source may change while its previous representation remains stored. Processing may succeed while the retrieval index still exposes an earlier representation.

A recent processing timestamp does not prove that the source is current. Similarly, a current source does not prove that its latest content is retrievable.

Systems therefore need source-specific update expectations, change-detection mechanisms, and defined responses to missed updates. Acceptable delays depend on the consequences of serving outdated information.

## 4. Document Lifecycle

A simplified conceptual lifecycle is:

```text
Discovered
    |
    v
Processed
    |
    v
Validated -------> Rejected or Quarantined
    |
    v
Available
    |
    +----> Updated --> Reprocessed --> Revalidated
    |
    +----> Retired or Removed
```

These labels represent conceptual states, not a mandatory workflow engine. Failed processing may require retry or quarantine; failed validation must not silently advance content to availability.

An updated source should not leave an obsolete representation active indefinitely. Likewise, removing a source must eventually prevent its retired content from remaining retrievable. This may require coordinated cleanup of processed records and retrieval-facing data.

The lifecycle policy defines the expected outcome; implementation details belong to the relevant ingestion and retrieval architecture.

## 5. Corpus Readiness and Acceptance Criteria

Readiness means that content meets the requirements established for its source type and intended use. It should be determined from explicit validation outcomes and lifecycle state, not inferred solely from successful processing.

Define two categories of checks:

- **Blocking conditions:** Failures that prevent availability, such as a missing required identity, unusable content structure, or unresolved critical authority conflict.
- **Warnings or review conditions:** Issues that need attention but may be acceptable under a documented exception policy.

The distinction must be risk-based. A warning for a low-impact formatting issue may be reasonable; uncertainty about which active policy is authoritative may require blocking availability.

A readiness decision should establish that required content checks have passed, unresolved critical conflicts are handled, the applicable source state is known sufficiently well, and lifecycle changes are reflected in the usable corpus. Where automated validation cannot reliably determine quality or authority, route the content for review rather than silently assuming it is trustworthy.

## Engineering Checklist

- Define quality criteria and acceptance policies for each corpus use case.
- Distinguish duplicates from legitimate versions and similar documents.
- Monitor source, processing, and index freshness separately.
- Define failure, update, retirement, and removal outcomes.
- Make blocking failures, warnings, and exceptions observable.

## Further Reading

For extraction failures, revisit [Document Extraction and Normalization](./01-Document-Extraction-and-Normalization.md). For identity and source-version traceability, revisit [Metadata, Identity, and Provenance](./02-Metadata-Identity-and-Provenance.md).

The next retrieval-engineering topics build on corpus readiness by examining how content is transformed into retrieval-oriented representations and made searchable.
