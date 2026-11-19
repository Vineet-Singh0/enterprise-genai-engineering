# Metadata, Identity, and Provenance

## Learning Objectives

After completing this chapter, you should be able to:

- Explain the role of metadata in document ingestion.
- Distinguish logical document identity, source-version identity, and processed-representation identity.
- Separate source metadata from ingestion metadata.
- Explain provenance and apply practical metadata-validation rules.

## Prerequisites

Understand [Document Extraction and Normalization](./01-Document-Extraction-and-Normalization.md).

## 1. Why Metadata Matters

Extracted text alone does not describe a document's origin, version, publication date, or processing history. Metadata supplies this context so downstream systems can identify content, validate records, and trace processed outputs to their sources.

Metadata must have explicit semantics. For example, a source modification timestamp and an ingestion timestamp describe different events and must not share an ambiguous meaning.

## 2. Identity, Versions, and Representations

Three identities serve different purposes:

- **Logical document identity:** Identifies the continuing document entity, even if its location or content changes.
- **Source-version identity:** Identifies a particular version obtained from the source.
- **Processed-representation identity:** Identifies a particular output derived from a source version, such as normalized text.

A filename, URL, or filesystem path is not necessarily a stable document identity. A document can move without becoming a new logical document, and unrelated sources can use the same filename.

An identity design must define how identifiers are assigned, how source versions are distinguished, and how each processed representation references its source version. Source-system namespaces may be needed to prevent identifier collisions.

Representation identity also requires an explicit rule. If repeated processing produces distinct outputs, the system must distinguish them using an appropriate identifier strategy—for example, a processing-run identifier, configuration version, or output content hash. These are alternative design choices, not a universal requirement to use all three. A naming convention alone does not guarantee uniqueness or traceability.

## 3. Source Metadata and Ingestion Metadata

| Category | Examples | Purpose |
|---|---|---|
| Source metadata | Title, author, publication date, source location | Describes the source according to its source system or publisher |
| Ingestion metadata | Processing timestamp, pipeline version, processing status | Describes how the ingestion system handled the content |
| Identity and relationship metadata | Document ID, source-version ID, representation ID | Connects the document, its versions, and derived outputs |

An illustrative record:

```yaml
document_id: policy-104
source_version_id: policy-104-v3
processed_representation_id: policy-104-v3-run-08
derived_from_source_version_id: policy-104-v3
source_location: /policies/access-policy.pdf
publication_date: 2026-09-15
processed_at: 2026-10-27T08:30:00Z
processing_status: completed
```

Here, `document_id` identifies the logical document, `source_version_id` identifies a particular source version, and `processed_representation_id` identifies a specific processing output. The `derived_from_source_version_id` field explicitly records which source version produced that output.

The relationship field must reference an existing source-version record belonging to the expected logical document. The representation ID's naming convention is illustrative; the explicit relationship, not the identifier's text, establishes traceability. These fields are examples, not a universal schema.

## 4. Provenance and Traceability

**Provenance** records where content originated and how it reached its current processed form. Depending on system requirements, it may include the source system, source location, acquisition time, source-version identifier, and processing configuration.

Provenance helps engineers investigate which source version produced an output and which processing history applies to it. However, traceability does not prove that the source is accurate, authoritative, or trustworthy. Those properties require separate validation and governance.

## 5. Metadata Validation

Validation rules should reflect each field's purpose and constraints:

- **Optional value missing:** Preserve the missing state; do not invent a value.
- **Required value missing:** Reject, quarantine, or otherwise prevent processing according to an explicit policy.
- **Invalid value:** Flag or reject values that violate the field's type, format, or permitted range.
- **Conflicting value:** Apply a documented source-of-truth rule or route the conflict for resolution instead of silently choosing the latest value.

Missing, unknown, invalid, and conflicting values are different conditions. A record can also contain individually valid fields but inconsistent relationships—for example, a representation referencing a source version that does not belong to its stated logical document.

## 6. Practical Example

Suppose a knowledge-base article moves to a new URL and is later revised. The location change alone should not create a new logical document if the source system can establish continuity. A confirmed revision should receive a distinct source-version identity under the system's versioning policy.

A representation derived from the earlier version must remain linked to that version through an explicit relationship. The new version can be processed separately without relabeling the older output as current. If identity or version cannot be established reliably, record the uncertainty rather than inferring certainty from a matching title or URL.

## Engineering Checklist

- Define each field's meaning and validation rules.
- Keep document, source-version, and representation identities distinct.
- Preserve explicit source-version-to-representation relationships.
- Separate source facts from processing events.
- Handle missing and conflicting values deliberately.
- Collect metadata that serves a defined operational purpose.

## Further Reading

Continue with [Corpus Quality, Freshness, and Lifecycle](./03-Corpus-Quality-Freshness-and-Lifecycle.md) to examine how document quality, updates, and lifecycle changes affect corpus readiness. For extraction and normalization behavior, refer back to [Document Extraction and Normalization](./01-Document-Extraction-and-Normalization.md).
