# RET-10.01 — Retrieval Evaluation Questions and Test Queries

## 1. Why Retrieval Evaluation Starts with Questions

Retrieval evaluation is not simply calculating metrics against a collection of queries. It is the engineering process of determining whether a retrieval system satisfies defined information-retrieval requirements under representative conditions.

Before selecting metrics, creating relevance judgments, or comparing retrieval configurations, engineers must establish what the evaluation is intended to answer.

Consider an enterprise knowledge assistant. A team reports 85% Recall@10. That number alone does not establish whether the system is good.

Important questions remain:

- Which users and workloads does the evaluation represent?
- Are the queries representative of production behavior?
- Are rare but business-critical queries included?
- Does the evaluation include restrictive metadata constraints?
- Are queries answerable from the evaluated corpus?
- Were queries obtained from production logs, experts, or synthetic generation?
- Does the evaluation reflect the corpus version the system will use?
- Can the results be reproduced?
- Which important scenarios are missing?

A retrieval metric is meaningful only within the scope of the evaluation design that produced it.

### 1.1 Evaluation design sequence

1. Define the retrieval requirement.
2. Convert the requirement into an evaluation question.
3. Identify the target population and workload.
4. Define important query scenarios.
5. Establish candidate query sources.
6. Select queries using a documented procedure.
7. Validate records and provenance.
8. Freeze the query-set artifact and dependencies.
9. Use the query set in relevance judgment and metric evaluation.

This file focuses on the first eight activities.

RET-10.02 owns relevance judgments and retrieval metrics. RET-10.03 owns baselines, controlled experiments, and ablations. RET-10.04 owns reproducible benchmark execution and reporting.

### 1.2 Scope ownership

This file owns:

- Evaluation questions.
- Query-set purpose and scope.
- Query classification.
- Target populations and sampling frames.
- Candidate-frame construction.
- Workload and coverage selection.
- Deterministic selection contracts.
- Probability-sampling evidence requirements.
- Query provenance.
- Query-record and dataset-manifest contracts.
- Query-set validation and release integrity.

It does not re-teach embedding behavior, ANN tuning, metadata-filter execution, candidate generation, retrieval fusion, reranking, relevance judgment methodology, or general statistical theory.

---

## 2. From Requirements to Evaluation Questions

An evaluation requirement describes what a system must achieve. An evaluation question converts that requirement into something that can be investigated using a defined workload.

For example:

> The retrieval system should return relevant enterprise documents.

This is insufficient. It does not define users, query conditions, corpus context, or expected behavior.

### 2.1 Convert requirements into questions

| Requirement | Evaluation question |
|---|---|
| Support employee searches | How effectively does retrieval serve representative employee information requests? |
| Respect department restrictions | Does retrieval behave correctly under department-specific constraints? |
| Support difficult terminology | How does retrieval behave with abbreviations, internal terminology, and ambiguous expressions? |
| Handle unavailable information | How does the system behave when the evaluated corpus lacks the requested information? |
| Support multilingual usage | Does the selected workload represent the target languages and query forms? |
| Protect critical workflows | Are critical retrieval scenarios represented independently of production frequency? |

An evaluation question should identify the behavior, workload, operating conditions, evidence, and limits of the intended conclusion.

### 2.2 Separate evaluation objectives

**Workload representation:** Determine whether selected queries represent an intended production workload.

**Scenario coverage:** Ensure important conditions are represented, including rare but operationally significant cases.

**Behavioral investigation:** Provide queries that expose specific retrieval behaviors or weaknesses.

**Release qualification:** Provide a controlled query set for a defined release decision.

**Regression investigation:** Preserve previously observed cases for investigating changes in retrieval behavior.

A dataset designed for workload representation is not automatically suitable for every diagnostic or release-qualification purpose.

### 2.3 Define the scope of each question

For example:

> Evaluate English-language employee queries submitted to the internal policy assistant during the previous 90-day production period, using the frozen policy corpus identified by `policy-corpus-2026-10`.

This identifies the workload period, language, application, and corpus reference.

### 2.4 Bound evaluation claims

If a query set contains only English-language queries, it cannot establish multilingual retrieval quality.

If it contains only employee policy queries, it cannot establish engineering-document retrieval quality.

If rare scenarios are deliberately oversampled, aggregate metrics cannot automatically be interpreted as production workload averages.

Evaluation conclusions must remain within the evidence collected.

---

## 3. Choose the Correct Unit of Evaluation

Retrieval evaluation involves several distinct units. Confusing them creates incorrect sampling and interpretation.

### 3.1 Evaluation unit

The evaluation unit is the individual case against which retrieval behavior is assessed.

For a conventional benchmark, it is usually a query record evaluated against a defined corpus snapshot and retrieval configuration.

The same query text may represent different evaluation units when tenant scope, language, user context, or constraints differ.

### 3.2 Sampling unit

The sampling unit is the entity selected during query-set construction.

Examples:

- Production query event.
- Deduplicated query template.
- Support-ticket-derived query.
- Expert-authored scenario.
- Synthetic query candidate.
- Existing evaluation case.

Selecting individual events and selecting unique query templates produce different datasets.

### 3.3 Analysis unit

The analysis unit is the unit used when interpreting results:

- Individual queries.
- Query scenarios.
- Languages.
- Departments.
- Tenants.
- Business workflows.
- Query-source categories.

### 3.4 Grouping unit

The grouping unit identifies records that share a meaningful relationship:

- Queries from the same source ticket.
- Paraphrases of the same information need.
- Queries from the same session.
- Queries referring to the same underlying document.
- Queries representing the same business scenario.

One hundred paraphrases of a single information need do not necessarily provide one hundred independent examples of retrieval coverage.

### 3.5 Record identity and evaluation identity

A query-record ID identifies a stored record. An evaluation-case ID identifies a particular evaluation instance.

A single query record may participate in different evaluation cases if evaluation context changes. Multiple query records may be grouped under one underlying scenario.

Do not equate unique query strings, query records, sampling units, information needs, and evaluation cases.

---

## 4. Classify Query Scenarios Using Independent Dimensions

A useful query set requires more than one label such as `easy`, `medium`, or `hard`.

### 4.1 Classification dimensions

| Dimension | Purpose | Illustrative values |
|---|---|---|
| `input_validity` | Validity for the target retrieval interface | `valid`, `invalid`, `malformed` |
| `application_scope` | Application or business domain | `hr_policy`, `engineering_docs`, `finance_knowledge` |
| `interpretation` | Interpretation characteristics | `clear`, `ambiguous`, `underspecified`, `context_dependent` |
| `expected_corpus_availability` | Expected information availability | `expected_present`, `expected_absent`, `unknown` |
| `frequency_category` | Observed or expected frequency | `high`, `medium`, `low`, `unknown` |
| `difficulty_category` | Intended retrieval challenge | `easy`, `moderate`, `difficult`, `unknown` |
| `query_form` | Expression form | `keyword`, `natural_language`, `question`, `fragment`, `conversational`, `multilingual` |
| `intent_category` | Information-seeking intent | Application-defined controlled vocabulary |
| `constraint_profile` | Associated structured constraints | `unconstrained`, `metadata_constrained`, `tenant_constrained`, `multi_constraint`, `other` |
| `business_criticality` | Consequence of retrieval failure | `low`, `medium`, `high`, `critical` |

These dimensions are independent classification axes, not mutually exclusive categories.

Example:

```json
{
  "input_validity": "valid",
  "interpretation": "clear",
  "expected_corpus_availability": "expected_present",
  "frequency_category": "high",
  "difficulty_category": "easy",
  "query_form": "natural_language",
  "intent_category": "policy_lookup",
  "constraint_profile": "unconstrained",
  "business_criticality": "medium"
}
```

### 4.2 Classification is not evaluation outcome

Classification describes intended query characteristics. It does not establish whether retrieval succeeded.

- `difficulty_category = difficult` is a dataset annotation.
- Low Recall@K is an evaluation result.
- `expected_corpus_availability = expected_absent` is a scenario expectation.
- A verified no-answer judgment is evidence from corpus assessment and relevance evaluation.

Do not derive classification from the observed retrieval result.

### 4.3 Vocabulary ownership

Classification values are controlled vocabulary values.

Each dataset release must reference immutable vocabulary artifacts defining:

- Namespace and version.
- Allowed values and descriptions.
- Deprecated values and replacements.
- Compatibility rules.
- Effective release or date.

The application or business domain owns its intent vocabulary. RET-10 defines how to reference and validate it, not a universal intent taxonomy.

Do not silently reinterpret an old record using a newer vocabulary version.

### 4.4 Classification and answerability consistency

The classification and answerability evidence fields use related but distinct vocabularies.

Their required relationship is defined in Section 13.9. The validator must use that contract rather than inventing its own interpretation.

---

## 5. Define the Target Population and Sampling Frame

A query set can be internally consistent and still represent the wrong population.

### 5.1 Target population

The target population is the workload or scenario population about which the evaluation intends to make claims.

Examples:

- Eligible employee queries submitted to a policy assistant during a specified period.
- Approved support-search requests for a product workflow.
- Engineering-document searches performed by defined teams.
- Expert-defined critical scenarios for a business process.

Bound the population by application, user population, tenant scope, period, language, eligibility rules, and relevant corpus state.

### 5.2 Sampling frame

The sampling frame is the operational collection from which candidates can be selected.

Examples include production query-log exports, deduplicated query-event tables, approved support-ticket collections, expert-authored scenario repositories, and synthetic candidate artifacts.

A sampling frame may not fully represent its target population. For example, logs may omit requests that failed before reaching retrieval.

### 5.3 Candidate frame

The candidate frame is the set of candidates made eligible for a particular selection procedure.

It must have:

- Stable candidate identifiers.
- Documented sources.
- Defined construction and transformation procedures.
- Declared eligibility rules.
- Immutable artifact references.
- Reproducible candidate counts.

### 5.4 Selected subset

The selected subset is the set of candidates included by a specific selection run.

```text
Target population
       |
       v
Sampling frame
       |
       v
Candidate frame
       |
       v
Selection procedure
       |
       v
Selected subset
       |
       v
Released evaluation query set
```

The manifest must preserve these boundaries.

### 5.5 Population limitations

Document limitations such as missing tenants, incomplete logs, unavailable languages, short retention windows, or excluded privacy-restricted records.

Do not claim representativeness beyond what the frame supports.

---

## 6. Workload-Oriented Sampling and Coverage-Oriented Selection

These are different selection objectives and must be tracked separately.

### 6.1 Workload-oriented selection

Workload-oriented selection aims to represent an observed or defined query workload.

It investigates:

- Query frequency.
- Language distribution.
- Business-domain distribution.
- Constraint prevalence.
- User-workflow prevalence.

### 6.2 Coverage-oriented selection

Coverage-oriented selection ensures important scenarios are represented.

Examples include rare query forms, ambiguous requests, critical workflows, difficult terminology, no-answer cases, multilingual cases, and restrictive metadata conditions.

Coverage selection does not necessarily preserve production frequency.

### 6.3 Why separate tracks are necessary

Suppose a workload contains:

| Scenario | Production frequency |
|---|---:|
| Common policy lookup | 70% |
| Standard employee question | 20% |
| Ambiguous request | 7% |
| Critical restricted-data request | 2% |
| Corpus-absent request | 1% |

A frequency-driven selection may contain very few examples of the last two scenarios. Coverage selection may intentionally include more.

Both tracks are useful, but support different interpretations.

### 6.4 Reproducibility is not probability sampling

**Deterministic reproducibility** means the same inputs and procedure produce the same output.

**Probability-based sampling** means the selection design assigns defined probabilities of inclusion to sampling units.

A fixed-seed hash ranking can provide reproducibility. It does not, by itself, establish a valid probability sample.

### 6.5 Mode A — Deterministic reproducibility

This mode is appropriate when a stable, repeatable query set is required.

It may use a fixed seed, deterministic ranking, stable identifiers, tie-breaking rules, fixed selection counts, and frozen candidate frames.

The manifest must identify the mode:

```json
{
  "selection_mode": "deterministic_reproducibility",
  "selection_algorithm": "sha256_seeded_rank_v1",
  "probability_sampling_claim": false
}
```

Do not describe this mode as probability sampling merely because the ranking uses a hash.

### 6.6 Mode B — Probability-based selection

A probability-based design must establish:

1. Sampling frame and eligible population.
2. Selection design.
3. Randomness-generation method.
4. Seed-generation process, if a pseudorandom generator is used.
5. Algorithm and implementation version.
6. Strata and allocation, where applicable.
7. Inclusion probabilities or enough design information to derive them.
8. Weighting information needed for population inference.
9. Randomness-generation evidence needed for audit and reproduction.

The seed must be generated independently of candidate identities and evaluation outcomes.

Record the seed-generation method, timestamp, generator algorithm and version, candidate-frame checksum, and allocation calculations.

A pseudorandom generator can support reproducible probability sampling when embedded in a valid sampling design. SHA-256 ordering alone does not prove an exact random sampling design.

### 6.7 Stratified workload sampling

Example:

| Stratum | Candidate count | Planned sample |
|---|---:|---:|
| HR policy | 400 | 20 |
| Engineering documentation | 200 | 10 |
| Finance knowledge | 100 | 5 |
| Other | 100 | 5 |
| Total | 800 | 40 |

Allocation may be proportional, disproportionate, or otherwise justified.

For probability sampling, inclusion probabilities must reflect the actual design. Proportional allocation does not automatically establish equal inclusion probabilities when eligibility or later selection stages differ.

For deterministic selection, quotas are repeatable rules, not probability statements.

### 6.8 Shortfalls and redistribution

Define the shortfall policy before selection.

Example:

| Stratum | Planned quota | Eligible candidates | Selected |
|---|---:|---:|---:|
| HR policy | 20 | 18 | 18 |
| Engineering documentation | 10 | 50 | 10 |
| Finance knowledge | 5 | 30 | 5 |
| Other | 5 | 40 | 7 |
| Total | 40 | 138 | 40 |

This example redistributes two unfilled HR places to `Other`.

For probability sampling, redistribution changes the design and requires corresponding inclusion-probability calculations.

### 6.9 Overlap across tracks

A query may be selected in both tracks.

Maintain separate selection outputs. Store the query record once and preserve both memberships:

```json
{
  "query_id": "query:Q-101",
  "selection_memberships": ["workload", "coverage"]
}
```

Do not discard the second membership during deduplication.

### 6.10 Statistical inference

Coverage-oriented samples and disproportionate combined samples are not automatically suitable for unweighted production-population estimates.

Preserve the sampling design and required weights whenever downstream evaluation needs population inference.

Detailed statistical estimators and metric interpretation belong to AIF and RET-10.02.

---

## 7. Design Query Coverage

Coverage design translates evaluation questions into explicit scenario requirements.

### 7.1 Coverage matrix

| Coverage dimension | Required scenarios |
|---|---|
| Interpretation | Clear, ambiguous, underspecified |
| Corpus availability | Expected present, expected absent |
| Query form | Natural language, keyword, fragment |
| Constraints | Unconstrained, metadata-constrained, multi-constraint |
| Difficulty | Easy, moderate, difficult |
| Frequency | High, medium, low |
| Criticality | Low, medium, high, critical |
| Language | English, Hindi, multilingual |
| Application scope | HR, engineering, finance |

Not every possible combination must be represented.

### 7.2 Scenario priority

Classify scenarios as:

- Mandatory.
- Recommended.
- Exploratory.
- Excluded.

Define minimum representation for mandatory scenarios based on the evaluation objective.

### 7.3 Avoid combinatorial explosion

Ten dimensions with four values each produce:

\[
4^{10}=1,048,576
\]

possible combinations.

Most may be irrelevant or impossible.

Instead, identify important dimensions, mandatory scenarios, meaningful interactions, representative combinations, and unrepresented combinations that limit evaluation claims.

### 7.4 Coverage gaps

Distinguish:

- No candidate exists.
- Candidates exist but are ineligible.
- Eligible candidates exist but were not selected.
- Scenario is intentionally excluded.
- Scenario is selected but not released.

These conditions require different responses.

### 7.5 Coverage is not only record count

Review unique underlying scenarios, source diversity, group concentration, language representation, business workflow representation, constraint combinations, and scenario dependencies.

---

## 8. Make Coverage Selection Reproducible

### 8.1 Stable candidate identifiers

Every candidate must have a stable identifier before selection.

Identifiers must not depend on row position, database retrieval order, unstable timestamps, per-run random UUIDs, or mutable display text.

Use declared namespaces:

```text
production-event:evt-001
support-ticket:ticket-001
expert-scenario:scenario-001
synthetic-candidate:syn-001
```

Candidate IDs and canonical query IDs are separate namespaces.

### 8.2 Deterministic ranking primitive

For a non-empty UTF-8 seed \(S\) and candidate identifier \(C\), construct:

\[
M =
\operatorname{UINT64\_BE}(|S|)
\parallel S
\parallel
\operatorname{UINT64\_BE}(|C|)
\parallel C
\]

Where `UINT64_BE(n)` is an unsigned 64-bit big-endian encoding of byte length `n`, and both values are encoded as UTF-8.

Calculate:

\[
R(C)=\operatorname{SHA256}(M)
\]

Sort by digest bytes in ascending lexicographic order, then candidate identifier UTF-8 bytes as a tie-breaker.

Select the first \(N\) candidates.

This is a deterministic ranking primitive, not a probability-sampling design.

### 8.3 Python ranking implementation

```python
from __future__ import annotations

import hashlib
from collections.abc import Iterable

UINT64_MAX = (1 << 64) - 1


def _encode_length_prefixed(value: bytes) -> bytes:
    length = len(value)

    if length > UINT64_MAX:
        raise ValueError("Encoded value exceeds UINT64 length capacity")

    return length.to_bytes(8, byteorder="big", signed=False) + value


def deterministic_rank(
    candidate_ids: Iterable[str],
    seed: str,
) -> list[str]:
    """
    Deterministic SHA-256 ranking.
    This does not establish a probability-sampling design.
    """

    if not isinstance(seed, str):
        raise TypeError("seed must be a string")

    if not seed.strip():
        raise ValueError("seed must not be empty or whitespace-only")

    try:
        seed_bytes = seed.encode("utf-8")
    except UnicodeEncodeError as exc:
        raise ValueError("seed must be UTF-8 encodable") from exc

    if not isinstance(candidate_ids, Iterable):
        raise TypeError("candidate_ids must be iterable")

    if isinstance(candidate_ids, (str, bytes, bytearray)):
        raise TypeError("candidate_ids must be a collection of IDs, not text")

    ids = list(candidate_ids)

    for candidate_id in ids:
        if not isinstance(candidate_id, str):
            raise TypeError("every candidate ID must be a string")

        if not candidate_id.strip():
            raise ValueError("candidate IDs must not be empty or whitespace-only")

        try:
            candidate_id.encode("utf-8")
        except UnicodeEncodeError as exc:
            raise ValueError(
                "candidate IDs must be UTF-8 encodable"
            ) from exc

    if len(ids) != len(set(ids)):
        raise ValueError("candidate IDs must be unique")

    def rank_key(candidate_id: str) -> tuple[bytes, bytes]:
        candidate_bytes = candidate_id.encode("utf-8")
        payload = (
            _encode_length_prefixed(seed_bytes)
            + _encode_length_prefixed(candidate_bytes)
        )
        return hashlib.sha256(payload).digest(), candidate_bytes

    return sorted(ids, key=rank_key)


def select_deterministically(
    candidate_ids: Iterable[str],
    seed: str,
    sample_size: int,
) -> list[str]:
    if isinstance(sample_size, bool) or not isinstance(sample_size, int):
        raise TypeError("sample_size must be an integer")

    if sample_size < 0:
        raise ValueError("sample_size must be non-negative")

    ranked = deterministic_rank(candidate_ids, seed)

    if sample_size > len(ranked):
        raise ValueError("sample_size exceeds candidate count")

    return ranked[:sample_size]
```

### 8.4 Identifier normalization policy

Candidate identifiers are opaque identifiers, not natural-language text.

- No automatic trimming or Unicode normalization is performed.
- Whitespace-only identifiers are rejected.
- Leading or trailing whitespace in otherwise non-empty identifiers is not silently removed; identifier producers must follow the declared namespace policy.
- Two byte-distinct Unicode identifiers remain distinct unless an upstream identifier policy explicitly canonicalizes them.
- Any canonicalization must occur before candidate-frame freezing and must be versioned.

The seed is a non-empty UTF-8 string with whitespace-only values rejected. It is not automatically trimmed or normalized.

### 8.5 Required implementation tests

Test:

- Empty and whitespace-only seed.
- Non-string seed.
- Empty and whitespace-only candidate ID.
- Non-string candidate ID.
- Unhashable candidate ID.
- Passing a string or bytes object as the entire candidate collection.
- Duplicate IDs.
- Unicode identifiers.
- Identical inputs and seed producing identical rankings.
- Different seeds against a fixed fixture with expected rankings.
- Empty candidate collection.
- Zero, negative, and oversized sample counts.
- Boolean sample size rejection.

Do not assert that different seeds must produce different orderings for every possible candidate set. Small sets may coincidentally retain the same order.

### 8.6 Separate selection pipeline stages

The complete selection process has distinct stages:

```text
Candidate-frame construction
          |
          v
Eligibility validation
          |
          v
Candidate identity validation
          |
          v
Scenario assignment
          |
          v
Ranking within declared selection groups
          |
          v
Quota allocation and shortfall handling
          |
          v
Selection
          |
          v
Deduplication and identity reconciliation
          |
          v
Unique-subset construction
          |
          v
Selection report and manifest
```

Each stage must have a documented input, output, algorithm or policy version, and validation rule.

The ranking primitive does not define the quota-allocation or deduplication stages.

### 8.7 Stratified deterministic selection

For mutually exclusive strata:

1. Freeze the candidate frame.
2. Assign every eligible candidate to exactly one declared stratum.
3. Record the assignment policy.
4. Define quotas.
5. Define per-stratum seeds or a documented seed-derivation rule.
6. Rank within each stratum.
7. Select up to each quota.
8. Apply the predefined shortfall policy.
9. Reconcile unique records and quotas.
10. Publish the selection report.

This remains deterministic selection, not probability sampling.

### 8.8 Multi-label coverage selection

A candidate may satisfy several scenarios.

Define scenario membership, eligible candidates, quotas, whether one record can satisfy multiple quotas, deduplication behavior, shortfall policy, and unique-record requirements.

A record can satisfy multiple scenario quotas but remains one unique selected record.

### 8.9 Exclusive strata versus multi-label scenarios

**Mutually exclusive strata:** Each candidate belongs to exactly one stratum for the selection design.

**Multi-label scenarios:** A candidate may belong to multiple coverage scenarios. Quotas apply to memberships, and selected records may satisfy several quotas.

Do not apply exclusive-stratum calculations to a multi-label matrix without an explicitly defined transformation.

### 8.10 Deduplication policy

Deduplication must not erase meaningful evaluation distinctions.

Two candidates may have identical text but differ by tenant, permissions, corpus snapshot, constraints, answerability evidence, or business workflow.

Define equivalence for the target evaluation.

For a query-template benchmark, paraphrases may be grouped under one information-need group while preserving individual records.

For a production-event benchmark, repeated events may be retained when frequency is part of the objective.

### 8.11 Selection report

Every selection run must preserve:

- Input artifact IDs and checksums.
- Candidate, eligible, and excluded counts.
- Exclusion reasons.
- Stratum or scenario counts.
- Planned quotas and actual selections.
- Shortfalls and redistribution.
- Duplicate handling.
- Unique selected count.
- Selection mode.
- Algorithm and implementation versions.
- Seed and randomness evidence, where applicable.
- Output checksum.

---

## 9. Validate Query Sources and Provenance

### 9.1 Production query logs

Production logs provide realistic workload evidence but may contain sensitive information, repeated automation, incomplete context, or logging omissions.

They must pass applicable privacy and governance controls.

### 9.2 Support tickets

Support tickets often overrepresent difficult queries, complaints, failed workflows, and unusual scenarios.

Use them for targeted coverage unless the target population explicitly concerns support-related retrieval cases.

### 9.3 Expert-authored queries

Record domain expertise, scenario definition, review quality, independence from retrieval outcomes, and provenance.

### 9.4 Synthetic queries

Record generation method, model or tool version, prompt or template version, source scenario, human review status, and limitations.

Synthetic queries must not be presented as observed production behavior.

### 9.5 Search analytics

Aggregated analytics can identify workload distributions but may not preserve individual query context.

Record the source artifact and transformation procedure.

### 9.6 Provenance contract

Every record identifies its source category and source reference.

The source reference is an opaque, namespaced identifier, not a raw URL or unrestricted source payload.

Format:

```text
<source-namespace>:<opaque-reference>
```

The first colon separates namespace from opaque reference. The remainder is treated as opaque and must not be reparsed into additional namespace components.

Examples:

| Source type | Namespace example |
|---|---|
| `production_log` | `production-event` |
| `support_ticket` | `support-ticket` |
| `expert_authored` | `expert-scenario` |
| `synthetic` | `synthetic-candidate` |
| `search_analytics` | `analytics-extract` |

The reference must be non-empty, stable, and approved. It must not contain credentials, secrets, or direct personal identifiers.

### 9.7 Provenance limitations

A source reference establishes traceability. It does not prove representativeness, validity, or privacy approval.

### 9.8 Separate eligibility dimensions

Keep these decisions separate:

- Sampling eligibility.
- Privacy status.
- Review status.
- Record validity.
- Dataset membership.

`record_validity` is a validation result associated with a record version, schema version, validator version, and validation run. It is not an intrinsic query-record field.

Dataset membership belongs to a selection output or manifest.

### 9.9 Privacy-state lifecycle

The default privacy states are:

| State | Meaning | Release eligibility |
|---|---|---|
| `not_assessed` | No decision recorded | No |
| `pending_review` | Review in progress | No |
| `approved` | Approved for declared purpose and scope | Yes, subject to other gates |
| `rejected` | Explicitly rejected | No |
| `revoked` | Previous approval withdrawn | No |

Approval requires an approval reference, policy version, purpose, scope, decision timestamp, and any applicable review or expiry date.

A revoked approval cannot be restored by changing a status field. A new approval event and reference are required.

Privacy decisions are immutable events in a separate approval-history artifact.

A privacy change does not mutate a previously released record or approval artifact. It creates a new privacy-state event or artifact version. A future dataset release must bind to the new state and revalidate eligibility.

If content must be deleted, preserve only the minimum permitted audit evidence. Governance and retention policies take precedence over benchmark convenience.

---

## 10. Define Inclusion and Exclusion Criteria

### 10.1 Inclusion criteria

Examples:

- Within application scope.
- Within the specified collection period.
- Sufficient context for an evaluation case.
- Approved source.
- Valid input under the evaluation policy.
- Sampling-eligible.
- Privacy-approved for the intended use.
- Assignable to required scenarios.

### 10.2 Exclusion criteria

Examples:

- Prohibited sensitive information.
- Outside target scope.
- Missing source reference.
- Malformed beyond supported recovery.
- Duplicate under the declared deduplication policy.
- Missing mandatory context.
- Privacy rejected, pending, or revoked.
- Outside the collection window.

### 10.3 Exclusion reasons

Use a versioned vocabulary:

```text
OUT_OF_SCOPE
PRIVACY_NOT_APPROVED
INVALID_RECORD
MISSING_REQUIRED_CONTEXT
DUPLICATE_UNDER_POLICY
UNSUPPORTED_LANGUAGE
SOURCE_PROVENANCE_UNAVAILABLE
OUTSIDE_COLLECTION_WINDOW
```

### 10.4 Preserve exclusion evidence

Record counts and approved audit references without retaining prohibited raw content.

### 10.5 Eligibility is not selection

A candidate may be eligible but not selected, valid but ineligible, or selected in a draft run but fail release validation.

Do not collapse these into one `included` flag.

---

## 11. Prevent Leakage and Protect Evaluation Integrity

### 11.1 Selection leakage

Selection leakage occurs when inclusion depends on the retrieval behavior being evaluated.

Examples:

- Selecting only cases where the current system performs poorly.
- Excluding cases because the system fails them.
- Choosing candidates after observing benchmark scores.
- Adjusting quotas to obtain a desired result.

Freeze selection policies before observing evaluation outcomes.

### 11.2 Annotation leakage

Avoid allowing current system outputs to influence independent query definitions or expected behavior.

Detailed judgment controls belong to RET-10.02.

### 11.3 Duplicate leakage

Track shared underlying information needs, paraphrases, source relationships, and overlap across development, release, and regression datasets.

### 11.4 Temporal leakage

Record source collection window, extraction timestamp, corpus snapshot, query-set construction timestamp, and selection timestamp.

### 11.5 Integrity rules

- Freeze selection policies before evaluation.
- Preserve candidate-frame snapshots.
- Record seeds and algorithm versions.
- Preserve exclusion counts and reasons.
- Track dataset overlap.
- Separate diagnostic selection from workload sampling.
- Do not silently alter released records.
- Version evaluation artifacts.

---

## 12. Control Corpus and System State

### 12.1 Corpus-dependent expectations

A query may be answerable in one corpus snapshot and unanswerable in another.

Example:

```text
Query: What is the 2026 parental leave policy?
Corpus snapshot: hr-policy-corpus-2026-10-01
Expected availability: expected_present
```

### 12.2 Corpus snapshot reference

The manifest must identify the corpus snapshot used for evaluation.

A query may also carry an optional corpus reference when its answerability evidence is tied to a specific snapshot.

### 12.3 Answerability evidence states

| State | Meaning |
|---|---|
| `expected_answerable` | Evidence indicates required information should exist in the specified corpus |
| `expected_no_answer` | Evidence indicates required information should not exist in the specified corpus |
| `not_assessed` | No supported assessment completed |
| `not_applicable` | Corpus answerability does not apply |

These states describe evidence, not retrieval success.

### 12.4 Answerability evidence contract

For `expected_answerable` and `expected_no_answer`, provide corpus snapshot and evidence references.

For `not_assessed`, evidence references may be absent.

For `not_applicable`, provide a reason.

References must not expose prohibited source content.

### 12.5 System-state boundary

The query-set artifact should not contain a mutable copy of every retrieval configuration.

The benchmark manifest identifies the system configuration and corpus snapshot for an evaluation run. RET-10.04 owns the full benchmark execution contract.

---

## 13. Query Record, Dataset Manifest, and Validation Contracts

A production query set requires explicit data contracts.

Keep three artifact categories separate:

1. Query-record data.
2. Validation-result data.
3. Selection and dataset-release data.

### 13.1 Canonical query-record structure

```json
{
  "query_id": "query:Q-0001",
  "query_text": "What is the employee leave policy?",
  "locale": "en-IN",
  "application_scope": "hr_policy",
  "classification": {
    "input_validity": "valid",
    "interpretation": "clear",
    "expected_corpus_availability": "expected_present",
    "frequency_category": "high",
    "difficulty_category": "easy",
    "query_form": "natural_language",
    "intent_category": "policy_lookup",
    "constraint_profile": "unconstrained",
    "business_criticality": "medium"
  },
  "tenant_scope": {
    "scope_type": "tenant",
    "scope_reference": "tenant:pseudonymous-001"
  },
  "constraints": {
    "constraint_types": [],
    "constraint_context_reference": null
  },
  "source": {
    "source_type": "production_log",
    "source_reference": "production-event:evt-000123"
  },
  "collection_window": {
    "start": "2026-10-01T00:00:00Z",
    "end": "2026-10-31T23:59:59Z"
  },
  "answerability": {
    "state": "expected_answerable",
    "corpus_snapshot_reference": "corpus:hr-policy-2026-10-01",
    "evidence_reference": "evidence:hr-policy-0001",
    "reason": null
  },
  "privacy": {
    "status": "approved",
    "privacy_state_reference": "privacy-state:approval-001"
  },
  "record_version": "1.0.0",
  "vocabulary_references": {
    "query_classification": "1.0.0",
    "intent": "hr-policy-intents:1.0.0",
    "source_type": "1.0.0",
    "privacy_status": "1.0.0"
  }
}
```

The identifiers and references are illustrative.

### 13.2 Field-level contract

| Field | JSON type | Required | Nullable | Empty behavior |
|---|---|---:|---:|---|
| `query_id` | string | Yes | No | Reject |
| `query_text` | string | Yes | No | Reject empty/whitespace-only |
| `locale` | string | Yes | No | Reject |
| `application_scope` | string | Yes | No | Reject |
| `classification` | object | Yes | No | Reject empty |
| `tenant_scope` | object | Yes | Yes | Null only when policy permits |
| `constraints` | object | Yes | No | Empty allowed for unconstrained |
| `source` | object | Yes | No | Reject empty |
| `collection_window` | object | Yes | Yes | Null only for sources without a meaningful collection window |
| `answerability` | object | Yes | No | Reject empty |
| `privacy` | object | Yes | No | Reject empty |
| `record_version` | string | Yes | No | Reject |
| `vocabulary_references` | object | Yes | No | Reject empty |

Required fields are non-nullable unless explicitly stated otherwise.

### 13.3 Identifier and text contracts

**`query_id`**

- Non-empty namespaced string.
- Recommended format: `namespace:identifier`.
- Unique within the query-record namespace and dataset lineage.
- Stable for the logical query record.
- Must not contain raw personal identifiers.

**`query_text`**

- Non-empty string containing at least one non-whitespace Unicode character.
- Must not contain prohibited secrets or disallowed personal information.
- Preserve source wording when required by the evaluation objective.
- Any normalization, redaction, or translation must be documented and versioned.
- Validation must not silently trim, lowercase, translate, or normalize text.

**`locale`**

- Valid BCP 47 language tag.
- Validate using a documented BCP 47-compatible parser and registry policy.
- Canonicalize casing according to that parser.
- Do not infer locale from query text during schema validation.
- A syntactically valid but unsupported locale is an application-policy issue, not a syntax error.

**`application_scope`**

- Non-empty value from an approved, versioned application-scope vocabulary.

### 13.4 Classification contract

All fields are required, non-nullable strings.

| Field | Vocabulary |
|---|---|
| `input_validity` | Query-classification vocabulary |
| `interpretation` | Query-classification vocabulary |
| `expected_corpus_availability` | Query-classification vocabulary |
| `frequency_category` | Query-classification vocabulary |
| `difficulty_category` | Query-classification vocabulary |
| `query_form` | Query-classification vocabulary |
| `intent_category` | Application intent vocabulary |
| `constraint_profile` | Query-classification vocabulary |
| `business_criticality` | Query-classification vocabulary |

Unknown values are rejected unless the vocabulary explicitly supports extensions.

Every vocabulary reference must resolve to an immutable version compatible with the record's `application_scope`.

`intent_category` must resolve through the application-specific namespace and version.

### 13.5 Tenant-scope contract

`tenant_scope` is required but nullable.

When non-null:

```json
{
  "scope_type": "tenant",
  "scope_reference": "tenant:pseudonymous-001"
}
```

Both fields are required non-empty strings.

The reference must be stable and pseudonymous or otherwise approved. It must not contain secrets, access tokens, direct personal identifiers, or unapproved confidential labels.

Null is allowed only when the evaluation policy declares tenant scope not applicable. If the application requires tenant context, null is a semantic validation failure.

The application-scope policy artifact owns the rule determining whether tenant scope is mandatory.

### 13.6 Constraint contract

```json
{
  "constraint_types": [],
  "constraint_context_reference": null
}
```

- `constraint_types`: required array of unique non-empty vocabulary strings.
- Empty array means no structured constraints.
- `constraint_context_reference`: required nullable string.
- Non-null reference must be a stable approved reference.
- Canonical ordering is defined by the referenced constraint vocabulary's declared `canonical_order`, not by locale-sensitive string sorting.
- Unknown or duplicate values are rejected.
- `constraint_profile` must be semantically consistent with the constraint types.

RET-07 owns filter execution semantics.

### 13.7 Source contract

```json
{
  "source_type": "production_log",
  "source_reference": "production-event:evt-000123"
}
```

Both fields are required non-empty strings.

`source_reference` uses:

```text
<source-namespace>:<opaque-reference>
```

The first colon separates namespace from the opaque remainder. The opaque remainder may contain additional colons if the source-specific identifier contract permits them. It must not be empty.

The namespace must match `source_type` through a versioned source mapping.

The source-specific mapping owns any further encoding or escaping requirements. References must not be parsed using assumptions about the internal format of the opaque portion.

### 13.8 Collection-window contract

`collection_window` is required but nullable.

When non-null:

```json
{
  "start": "2026-10-01T00:00:00Z",
  "end": "2026-10-31T23:59:59Z"
}
```

Both timestamps are RFC 3339 date-times with explicit offsets. End must be greater than or equal to start.

Normalize to UTC for comparison.

Null is permitted for authored or synthetic sources without a meaningful collection period. For sources with a meaningful collection period, null is a semantic failure.

### 13.9 Answerability contract and consistency mapping

```json
{
  "state": "expected_answerable",
  "corpus_snapshot_reference": "corpus:hr-policy-2026-10-01",
  "evidence_reference": "evidence:hr-policy-0001",
  "reason": null
}
```

All four properties are required. `corpus_snapshot_reference`, `evidence_reference`, and `reason` are nullable strings.

The following mapping is normative:

| `expected_corpus_availability` | `answerability.state` | Validity | Required evidence |
|---|---|---|---|
| `expected_present` | `expected_answerable` | Valid | Corpus snapshot and evidence |
| `expected_absent` | `expected_no_answer` | Valid | Corpus snapshot and evidence |
| `unknown` | `not_assessed` | Valid | No evidence required |
| Any value | `not_applicable` | Valid only when corpus answerability is genuinely outside the evaluation's scope | Reason required |
| `expected_present` | `not_assessed` | Invalid | Classification/evidence mismatch |
| `expected_absent` | `not_assessed` | Invalid | Classification/evidence mismatch |
| `unknown` | `expected_answerable` | Invalid | Classification/evidence mismatch |
| `unknown` | `expected_no_answer` | Invalid | Classification/evidence mismatch |
| `expected_present` | `expected_no_answer` | Invalid | Contradictory expectation |
| `expected_absent` | `expected_answerable` | Invalid | Contradictory expectation |

`not_applicable` is permitted only when the evaluation policy explicitly states that corpus availability does not apply. It cannot be used to bypass an assessment for a normal corpus-dependent retrieval query.

For `expected_answerable` and `expected_no_answer`, both corpus snapshot and evidence references are mandatory.

For `not_assessed`, both may be null.

For `not_applicable`, `reason` is mandatory and corpus references may be null.

**Input validity interaction:**

- `input_validity = invalid` or `malformed` cannot be paired with `expected_answerable` or `expected_no_answer` unless the evaluation explicitly defines a separate corpus-inspection scenario independent of query execution.
- The default contract rejects that combination.
- Invalid-input test cases normally use `unknown + not_assessed`, or `not_applicable` where the evaluation policy explicitly justifies it.

A semantic validator must implement this mapping exactly. Any permitted exception must be defined in a versioned evaluation policy, not improvised by individual implementations.

### 13.10 Privacy contract and immutable state

The query record references a separate immutable privacy-state artifact:

```json
{
  "status": "approved",
  "privacy_state_reference": "privacy-state:approval-001"
}
```

Both fields are required and non-nullable.

Allowed states:

- `not_assessed`
- `pending_review`
- `approved`
- `rejected`
- `revoked`

The privacy-state artifact contains:

- State and decision.
- Approval or decision reference.
- Policy version.
- Approved purpose and scope, when approved.
- Decision timestamp.
- Review or expiry date, when applicable.
- Previous state reference.
- Actor or authorized role reference.
- Immutable event identifier.

The query record's `privacy.status` is a snapshot of the referenced state, not a mutable source of truth.

The validator must confirm that the status equals the referenced privacy-state artifact's status.

Only `approved` is potentially release-eligible. Expired, revoked, pending, rejected, and unassessed states are ineligible.

A privacy-state change creates a new immutable privacy-state artifact and a new query-record artifact version referencing it. It does not mutate an already released query record.

The logical query content version and privacy-state event history have separate responsibilities:

- `record_version` versions the query record, including changes to its privacy-state reference.
- Privacy-state references preserve the immutable decision history.
- The dataset manifest binds to the exact privacy-state artifact used for release validation.

A later revocation blocks future releases. Historical release evidence remains bound to the original artifact set, subject to applicable retention and deletion policy.

### 13.11 Record-version contract

`record_version` follows Semantic Versioning 2.0.0 syntax.

Examples:

```text
1.0.0
1.1.0
2.0.0
1.0.0-rc.1
1.0.0+build.15
```

The syntax parser accepts valid prerelease and build metadata syntax. A production release policy may prohibit prerelease versions.

Versioning rules:

- Patch: correction without a change in evaluation meaning.
- Minor: backward-compatible metadata or classification extension.
- Major: incompatible schema or evaluation-meaning change.

Changes to query wording, tenant scope, constraints, source identity, answerability evidence, or privacy-state reference must be assessed for their impact on evaluation meaning.

Copying a record into another manifest does not by itself increment its version.

### 13.12 Vocabulary-reference contract

Required references:

- `query_classification`
- `intent`
- `source_type`
- `privacy_status`

Every reference must be immutable and resolvable.

The semantic validator must verify:

- Exact artifact resolution.
- Vocabulary namespace compatibility.
- Version compatibility.
- Application-scope compatibility for application-specific vocabularies.
- Value membership.
- Deprecated-value policy.

Aliases such as `latest` are prohibited in released datasets.

### 13.13 Structural versus semantic validation

| Concern | JSON Schema | Semantic validator |
|---|---:|---:|
| Required fields and JSON types | Yes | Defense-in-depth |
| Nullability and object shape | Yes | Defense-in-depth |
| Non-empty strings | Yes | Yes |
| BCP 47 locale validity | Format support varies | Yes |
| Vocabulary membership | Limited/custom | Yes |
| Vocabulary version resolution | No | Yes |
| Application-scope compatibility | No | Yes |
| Source namespace compatibility | No | Yes |
| Unique IDs across dataset | No | Yes |
| Tenant-reference policy | No | Yes |
| Timestamp semantics | Format support varies | Yes |
| Start/end consistency | No | Yes |
| Answerability consistency | No | Yes |
| Privacy approval validity | No | Yes |
| Privacy expiry or revocation | No | Yes |
| Record-version migration policy | No | Yes |
| Dataset membership | No | Selection/manifest validator |
| Selection reproducibility | No | Selection validator |

The release process must identify exact schema and validator versions.

### 13.14 Validation-result artifact

Validation results are separate from query records.

```json
{
  "query_id": "query:Q-0001",
  "record_version": "1.0.0",
  "schema_version": "1.0.0",
  "validator_version": "1.0.0",
  "validation_run_id": "validation:run-001",
  "structural_status": "passed",
  "semantic_status": "passed",
  "errors": [],
  "validated_at": "2026-10-31T10:30:00Z"
}
```

`record_validity` is derived from this artifact and is not duplicated as a mutable query-record property.

### 13.15 Dataset manifest

The manifest describes a released query set and its construction.

```json
{
  "dataset_id": "retrieval-eval:hr-policy-v1",
  "dataset_version": "1.0.0",
  "dataset_purpose": "retrieval_evaluation",
  "target_population": "Eligible HR policy assistant queries",
  "sampling_frames": [
    {
      "frame_id": "frame:production-2026-10",
      "artifact_reference": "artifact:production-frame-001",
      "checksum": "sha256:..."
    }
  ],
  "selection_tracks": {
    "workload": {
      "selection_mode": "deterministic_reproducibility",
      "algorithm": "sha256_seeded_rank_v1",
      "selection_output_reference": "artifact:workload-selection-v1"
    },
    "coverage": {
      "selection_mode": "deterministic_reproducibility",
      "algorithm": "scenario_quota_hash_rank_v1",
      "selection_output_reference": "artifact:coverage-selection-v1"
    }
  },
  "combined_unique_record_ids": [
    "query:Q-0001",
    "query:Q-0002"
  ],
  "corpus_snapshot_reference": "corpus:hr-policy-2026-10-01",
  "schema_reference": "schema:retrieval-query:1.0.0",
  "vocabulary_references": {
    "query_classification": "1.0.0",
    "intent": "hr-policy-intents:1.0.0",
    "source_type": "1.0.0",
    "privacy_status": "1.0.0"
  }
}
```

The manifest must additionally preserve candidate-frame checksums, selection policies, deduplication policy, implementation versions, seeds and randomness evidence, quotas and shortfalls, inclusion probabilities and weights where applicable, validation reports, record checksums, track counts, overlap counts, unique-record count, and dataset checksum.

### 13.16 Dataset membership and selection state

Membership belongs to selection outputs or the manifest, not the immutable logical query content.

A record may be eligible but not selected, selected in either or both tracks, present in a draft dataset, excluded from a later release, or removed from future eligibility following privacy revocation.

Preserve these decisions in versioned artifacts.

### 13.17 Structural and semantic test fixtures

Minimum fixtures:

| Fixture | Expected result |
|---|---|
| Fully valid query record | Pass |
| Missing `query_id` | Structural failure |
| Null `query_text` | Structural failure |
| Whitespace-only query text | Failure |
| Invalid locale syntax | Semantic failure |
| Unknown classification value | Semantic failure |
| Unknown intent vocabulary | Semantic failure |
| Invalid source namespace | Semantic failure |
| Invalid timestamp | Failure |
| End before start | Semantic failure |
| Expected availability and answerability mismatch | Semantic failure |
| Invalid input with assessed answerability | Semantic failure by default |
| Approved privacy state without matching approval artifact | Release failure |
| Revoked privacy state | Valid history, release-ineligible |
| Expired approval | Release failure |
| Duplicate query ID | Dataset failure |
| Missing vocabulary artifact | Release failure |
| Invalid SemVer | Failure |
| Unapproved tenant reference | Semantic/privacy failure |

Also test vocabulary compatibility, source-specific conditions, null and empty-array behavior, version migration, privacy transitions, validation traceability, and manifest consistency.

### 13.18 Non-waivable release controls

A released dataset must pass:

1. Structural validation.
2. Semantic validation.
3. Vocabulary resolution.
4. Unique query-ID validation.
5. Provenance validation.
6. Privacy eligibility.
7. Approval validity.
8. Corpus-context consistency.
9. Selection-policy/output consistency.
10. Required reproducibility or probability-design evidence.
11. Manifest consistency.
12. Checksum verification.
13. Required review and approval.

A coverage limitation may be accepted only where release policy permits it. Privacy, schema, provenance, and integrity controls cannot be bypassed.

### 13.19 Immutable release evidence

Release approval binds to the exact artifact versions.

At minimum, bind:

- Dataset manifest and checksum.
- Query-record artifact and checksum.
- Schema version and checksum.
- Vocabulary versions and checksums.
- Candidate-frame artifacts and checksums.
- Selection-policy version and checksum.
- Selection-output checksums.
- Validation-report references and checksums.
- Privacy-state artifact references and checksums.
- Corpus snapshot identifier and checksum or immutable reference.
- Validator and selection implementation versions.

Example:

```json
{
  "release_id": "release:retrieval-eval-hr-v1",
  "manifest_reference": "artifact:manifest-hr-v1",
  "manifest_checksum": "sha256:...",
  "bound_artifacts": [
    {
      "artifact_type": "query_records",
      "artifact_reference": "artifact:queries-hr-v1",
      "checksum": "sha256:..."
    },
    {
      "artifact_type": "schema",
      "artifact_reference": "artifact:query-schema-v1",
      "checksum": "sha256:..."
    },
    {
      "artifact_type": "vocabulary",
      "artifact_reference": "artifact:query-vocabulary-v1",
      "checksum": "sha256:..."
    },
    {
      "artifact_type": "validation_report",
      "artifact_reference": "artifact:validation-hr-v1",
      "checksum": "sha256:..."
    },
    {
      "artifact_type": "selection_output",
      "artifact_reference": "artifact:selection-hr-v1",
      "checksum": "sha256:..."
    },
    {
      "artifact_type": "privacy_state",
      "artifact_reference": "privacy-state:approval-001",
      "checksum": "sha256:..."
    },
    {
      "artifact_type": "corpus_snapshot",
      "artifact_reference": "corpus:hr-policy-2026-10-01",
      "checksum": "sha256:..."
    }
  ],
  "decision": "approved",
  "approver_reference": "approver:role-retrieval-eval-owner",
  "approved_at": "2026-10-31T14:00:00Z"
}
```

If a bound artifact changes, the previous approval cannot be reused for the changed artifact set.

A new validation and approval process is required.

### 13.20 Release validation versus approval

Release validation establishes that technical and policy gates pass for the exact artifacts.

Release approval records acceptance by an authorized owner.

A technically valid dataset is not automatically approved. An approval for one immutable artifact set does not authorize a modified set.

### 13.21 Repository publication checklist

- Confirm approved RET-10 folder structure.
- Confirm canonical schema and vocabulary locations.
- Confirm manifest and validation-report locations.
- Verify relative links and artifact references.
- Verify diagrams render.
- Verify code examples execute.
- Verify illustrative identifiers are clearly labeled.
- Verify prohibited source data is absent.
- Verify checksums and release references.
- Verify approval binds the exact artifact set.

Paths remain proposed logical locations until checked against the repository. This document does not claim repository files have been modified.

---

## 14. Audit Query-Set Coverage and Evaluation Claims

### 14.1 Coverage audit

Review:

- Mandatory scenario representation.
- Missing or insufficient scenarios.
- Candidates that were ineligible.
- Multi-scenario membership.
- Source concentration.
- Underlying information-need concentration.
- Critical workflow representation.
- No-answer representation.
- Language and tenant scope.

### 14.2 Coverage report

| Scenario | Eligible candidates | Required quota | Selected memberships | Status |
|---|---:|---:|---:|---|
| Ambiguous | 20 | 3 | 3 | Satisfied |
| Multilingual | 12 | 2 | 2 | Satisfied |
| Critical | 8 | 3 | 3 | Satisfied |
| Expected no answer | 15 | 2 | 2 | Satisfied |
| Multi-constraint | 5 | 2 | 1 | Shortfall |

The numbers are illustrative.

Report scenario memberships separately from unique selected records.

### 14.3 Evaluation-claim audit

For every claim, document target population, selection tracks, represented scenarios, excluded scenarios, corpus snapshot, selection procedure, and limitations.

Example:

> This evaluation assesses retrieval behavior for the selected English-language HR policy workload and the explicitly defined coverage scenarios. It does not establish multilingual retrieval quality or performance for unrepresented business domains.

### 14.4 Coverage is not relevance judgment

Coverage analysis determines whether the query set represents intended scenarios. It does not establish which retrieved documents are relevant. That belongs to RET-10.02.

---

## 15. Diagnostic Queries and Representative Benchmark Queries

### 15.1 Representative benchmark queries

These support evaluation claims about a defined workload or scenario population.

They require stable provenance, defined scope, reproducible selection, valid records, corpus context, privacy approval, and traceable membership.

### 15.2 Diagnostic queries

Diagnostic queries investigate particular behaviors or suspected problems:

- Previously irrelevant results.
- Restrictive metadata filters.
- Ambiguous terminology.
- Tenant-isolation concerns.
- Known corpus gaps.
- Specific retrieval failure conditions.

Diagnostic cases may be selected because they expose known failures. They are not automatically an unbiased workload sample.

### 15.3 Membership distinction

A query may belong to both tracks, but membership must be explicit:

```json
{
  "query_id": "query:Q-0009",
  "selection_memberships": ["coverage", "diagnostic"]
}
```

Do not merge diagnostic queries into a representative workload dataset and report the aggregate as production workload performance.

### 15.4 Regression cases

A diagnostic query may become a permanent regression case after its purpose and expected behavior are documented.

Preserve original failure reference, scenario, corpus dependency, constraints, record version, review status, and regression-suite membership.

RET-11 owns the detailed failure taxonomy and diagnosis process.

---

## 16. Practical Engineering Exercise — Construct a Documented Evaluation Query Set

This exercise demonstrates separate workload and coverage selection using illustrative candidate frames.

### 16.1 Evaluation objective

Assume an enterprise HR policy assistant.

> Construct a reproducible query set containing a workload-oriented sample and a separate coverage-oriented sample.

Target corpus:

```text
corpus:hr-policy-2026-10-01
```

### 16.2 Candidate frames and identity namespaces

Assume:

- 720 workload candidates.
- 24 coverage candidates.

Candidate identifiers:

```text
workload:W001
workload:W002
...
workload:W720
```

```text
coverage:C001
coverage:C002
...
coverage:C024
```

Canonical query IDs use a separate namespace.

Examples:

```text
workload:W001 -> query:HR-W001
coverage:C001 -> query:HR-C001
```

### 16.3 Identity reconciliation

Assume the following ten logical candidates occur in both frames:

| Workload candidate | Coverage candidate | Canonical query ID |
|---|---|---|
| W011 | C003 | HR-0011 |
| W025 | C007 | HR-0025 |
| W040 | C010 | HR-0040 |
| W052 | C012 | HR-0052 |
| W078 | C014 | HR-0078 |
| W101 | C016 | HR-0101 |
| W144 | C018 | HR-0144 |
| W210 | C020 | HR-0210 |
| W350 | C022 | HR-0350 |
| W600 | C024 | HR-0600 |

For clarity, the table abbreviates the declared namespaces. The canonical identity mapping is the authoritative relationship.

Candidate-frame overlap is calculated using canonical IDs, not by comparing raw candidate strings.

Therefore:

\[
|F_W|=720,\quad |F_C|=24,\quad |F_W\cap F_C|=10
\]

\[
|F_W\cup F_C|=720+24-10=734
\]

\[
J(F_W,F_C)=\frac{10}{734}\approx0.0136
\]

This is candidate-frame identity overlap.

### 16.4 Workload selection

Assume deterministic reproducibility mode:

```text
Candidate frame: workload-frame-v1
Candidate count: 720
Selection count: 30
Algorithm: sha256_seeded_rank_v1
Seed: hr-workload-v1
```

Procedure:

1. Freeze the candidate frame.
2. Validate candidate identifiers.
3. Apply eligibility policy.
4. Rank eligible candidates.
5. Select the first 30.
6. Preserve IDs, seed, algorithm, and input checksum.

This is not a probability-sampling claim.

### 16.5 Coverage scenario membership

The 24 coverage candidates have the following illustrative multi-label memberships.

| Candidate | Ambiguous | Multilingual | Critical | Expected no answer | Multi-constraint |
|---|---:|---:|---:|---:|---:|
| C001 | Yes | No | No | No | No |
| C002 | Yes | No | Yes | No | Yes |
| C003 | Yes | No | No | Yes | No |
| C004 | Yes | Yes | No | No | No |
| C005 | No | Yes | No | No | Yes |
| C006 | No | Yes | Yes | No | No |
| C007 | No | Yes | No | Yes | No |
| C008 | No | Yes | No | No | No |
| C009 | No | No | Yes | No | Yes |
| C010 | No | No | Yes | Yes | No |
| C011 | No | No | Yes | No | No |
| C012 | No | No | Yes | No | No |
| C013 | No | No | No | Yes | Yes |
| C014 | No | No | No | Yes | No |
| C015 | No | No | No | Yes | No |
| C016 | No | No | No | No | Yes |
| C017 | No | No | No | No | Yes |
| C018 | No | No | No | No | Yes |
| C019 | No | No | No | No | No |
| C020 | No | No | No | No | No |
| C021 | No | No | No | No | No |
| C022 | No | No | No | No | No |
| C023 | No | No | No | No | No |
| C024 | No | No | No | No | No |

All memberships are explicitly illustrative.

### 16.6 Derive scenario counts and quotas

The scenario counts must be derived from the membership matrix, not manually asserted.

| Scenario | Eligible candidates | Required quota |
|---|---:|---:|
| Ambiguous | 4 | 2 |
| Multilingual | 5 | 2 |
| Critical | 6 | 2 |
| Expected no answer | 6 | 2 |
| Multi-constraint | 7 | 2 |

The critical count is six: C002, C006, C009, C010, C011, and C012.

Selection policy: multi-label scenario selection. A selected record can satisfy multiple scenario quotas but is stored once in the unique selected subset.

### 16.7 Deterministic scenario selection

Use documented per-scenario seeds:

```text
hr-coverage-v1:ambiguous
hr-coverage-v1:multilingual
hr-coverage-v1:critical
hr-coverage-v1:expected-no-answer
hr-coverage-v1:multi-constraint
```

For this worked example, assume the following illustrative selection outputs:

| Scenario | Selected candidates | Quota |
|---|---|---:|
| Ambiguous | C001, C002 | 2 |
| Multilingual | C004, C005 | 2 |
| Critical | C009, C010 | 2 |
| Expected no answer | C003, C007 | 2 |
| Multi-constraint | C002, C009 | 2 |

These are declared example outputs, not claimed SHA-256 execution results.

### 16.8 Reconcile selected records

Scenario memberships selected: 10.

C002 is selected for Ambiguous and Multi-constraint.

C009 is selected for Critical and Multi-constraint.

Unique selected candidates:

```text
coverage:C001
coverage:C002
coverage:C003
coverage:C004
coverage:C005
coverage:C007
coverage:C009
coverage:C010
```

Therefore:

- Scenario memberships: 10.
- Unique coverage records: 8.
- Records satisfying multiple selected scenarios: 2.
- All five scenario quotas: satisfied.

The quota count is not the unique record count.

### 16.9 Executable coverage reconciliation

The following code independently derives eligibility counts and verifies the selected scenario memberships.

```python
from collections import Counter

memberships = {
    "C001": {"ambiguous"},
    "C002": {"ambiguous", "critical", "multi_constraint"},
    "C003": {"ambiguous", "expected_no_answer"},
    "C004": {"ambiguous", "multilingual"},
    "C005": {"multilingual", "multi_constraint"},
    "C006": {"multilingual", "critical"},
    "C007": {"multilingual", "expected_no_answer"},
    "C008": {"multilingual"},
    "C009": {"critical", "multi_constraint"},
    "C010": {"critical", "expected_no_answer"},
    "C011": {"critical"},
    "C012": {"critical"},
    "C013": {"expected_no_answer", "multi_constraint"},
    "C014": {"expected_no_answer"},
    "C015": {"expected_no_answer"},
    "C016": {"multi_constraint"},
    "C017": {"multi_constraint"},
    "C018": {"multi_constraint"},
    "C019": set(),
    "C020": set(),
    "C021": set(),
    "C022": set(),
    "C023": set(),
    "C024": set(),
}

quotas = {
    "ambiguous": 2,
    "multilingual": 2,
    "critical": 2,
    "expected_no_answer": 2,
    "multi_constraint": 2,
}

selected_by_scenario = {
    "ambiguous": {"C001", "C002"},
    "multilingual": {"C004", "C005"},
    "critical": {"C009", "C010"},
    "expected_no_answer": {"C003", "C007"},
    "multi_constraint": {"C002", "C009"},
}

eligible_counts = Counter(
    scenario
    for candidate_scenarios in memberships.values()
    for scenario in candidate_scenarios
)

for scenario, quota in quotas.items():
    eligible = eligible_counts[scenario]
    selected = selected_by_scenario[scenario]

    assert len(selected) == quota
    assert all(
        scenario in memberships[candidate]
        for candidate in selected
    )
    assert eligible >= quota

unique_selected = set().union(*selected_by_scenario.values())

membership_count = sum(
    len(selected)
    for selected in selected_by_scenario.values()
)

assert len(unique_selected) == 8
assert membership_count == 10

print("Eligible counts:", dict(eligible_counts))
print("Scenario memberships:", membership_count)
print("Unique selected records:", len(unique_selected))
print("Selected records:", sorted(unique_selected))
```

Expected reconciliation:

```text
Eligible counts:
ambiguous: 4
multilingual: 5
critical: 6
expected_no_answer: 6
multi_constraint: 7

Scenario memberships: 10
Unique selected records: 8
```

This code validates membership and reconciliation. It does not claim to reproduce the SHA-256 ranking output shown in the illustrative selection table.

### 16.10 Candidate-frame overlap

Using the explicit canonical identity mapping:

\[
|F_W|=720
\]

\[
|F_C|=24
\]

\[
|F_W\cap F_C|=10
\]

\[
|F_W\cup F_C|=734
\]

\[
J(F_W,F_C)=\frac{10}{734}\approx0.0136
\]

### 16.11 Selected-subset overlap

For the selected-subset example, assume one of the eight coverage records is also among the 30 workload records.

The identity must be explicit. For example:

```text
workload:W011 -> query:HR-0011
coverage:C003 -> query:HR-0011
```

Assume `query:HR-0011` is selected in both tracks.

Then:

\[
|S_W|=30,\quad |S_C|=8,\quad |S_W\cap S_C|=1
\]

\[
|S_W\cup S_C|=30+8-1=37
\]

\[
J(S_W,S_C)=\frac{1}{37}\approx0.0270
\]

This is selected-subset identity overlap, not scenario-membership overlap.

### 16.12 Build the combined dataset

The combined dataset contains:

- Workload selection output.
- Coverage selection output.
- Canonical query records.
- Selection-track memberships.
- Candidate-frame references.
- Corpus snapshot.
- Validation evidence.
- Privacy evidence.
- Dataset manifest.

The combined record count uses unique canonical query IDs.

For this example:

```text
Workload selected unique records: 30
Coverage selected unique records: 8
Selected overlap: 1

Combined unique records:
30 + 8 - 1 = 37
```

### 16.13 Coverage audit

| Scenario | Eligible | Required | Selected memberships | Unique selected records satisfying scenario | Status |
|---|---:|---:|---:|---:|---|
| Ambiguous | 4 | 2 | 2 | 2 | Satisfied |
| Multilingual | 5 | 2 | 2 | 2 | Satisfied |
| Critical | 6 | 2 | 2 | 2 | Satisfied |
| Expected no answer | 6 | 2 | 2 | 2 | Satisfied |
| Multi-constraint | 7 | 2 | 2 | 2 | Satisfied |

### 16.14 Freeze and validate

1. Validate records against the exact schema.
2. Validate vocabulary references.
3. Validate source references.
4. Validate tenant-scope references.
5. Validate answerability evidence.
6. Validate privacy state and scope.
7. Validate record IDs and versions.
8. Validate selection outputs.
9. Validate scenario quotas.
10. Validate identity reconciliation.
11. Validate unique-record counts.
12. Verify artifact checksums.
13. Generate the manifest.
14. Generate validation reports.
15. Bind release approval to the immutable artifact set.

### 16.15 Exercise completion criteria

An engineer must be able to explain:

- What population the workload track represents.
- What the coverage track represents.
- Why selection procedures differ.
- Which candidates satisfy each scenario.
- How multi-label quotas work.
- How candidate identities are reconciled.
- How selected records are deduplicated.
- How the unique count is calculated.
- Which corpus snapshot defines answerability.
- Which controls block release.
- Which conclusions are unsupported.

---

## 17. Interview Preparation

### 17.1 Conceptual questions

1. Why begin retrieval evaluation with questions rather than metrics?
2. Distinguish target population, sampling frame, candidate frame, and selected subset.
3. Why is a production log not automatically representative?
4. Distinguish workload selection from coverage selection.
5. Why is deterministic reproducibility not probability sampling?
6. What evidence supports a probability-based sampling claim?
7. Why use independent classification dimensions?
8. Distinguish query record from evaluation case.
9. Why preserve provenance?
10. Why tie answerability to a corpus snapshot?
11. Why separate privacy status from record validity?
12. Why store dataset membership outside the immutable query record?
13. Distinguish exclusive strata from multi-label scenarios.
14. Why can scenario quota count exceed unique record count?
15. Why bind approval to checksums?

### 17.2 Engineering scenarios

**Scenario A — Production workload bias**

Production logs contain mostly simple queries, but critical workflows must be evaluated. Design the dataset without misrepresenting production performance.

**Scenario B — Reproducibility versus probability**

A teammate claims fixed-seed SHA-256 ranking creates a statistically random sample. Identify what is missing.

**Scenario C — Multi-label allocation**

One query belongs to three scenarios, each with a quota of five. Explain membership counting and unique-record counting.

**Scenario D — Privacy revocation**

A previously approved record is included in a released dataset and its approval is later revoked. Explain future eligibility, historical evidence, immutability, and revalidation.

**Scenario E — Corpus drift**

A query was answerable in an earlier corpus but its document was removed. Explain how the evaluation dataset should represent this.

### 17.3 Design exercise

Design query-set construction for an enterprise assistant with three tenants, two languages, four domains, production logs, support tickets, expert critical scenarios, privacy restrictions, and reproducible release benchmarks.

Specify target populations, sampling frames, candidate construction, classification, selection tracks, sampling modes, quotas, deduplication, provenance, privacy lifecycle, validation, and release controls.

Start with evaluation claims, not metrics.

---

## 18. Common Engineering Mistakes

1. **Using production logs as the entire benchmark:** maintain separate workload and coverage tracks.
2. **Treating a deterministic seed as statistical validity:** distinguish repeatability from sampling design.
3. **Merging tracks without membership:** preserve selection reasons.
4. **Using one difficulty label:** classify independent dimensions.
5. **Treating paraphrases as independent cases:** preserve grouping.
6. **Deduplicating only by text:** account for tenant, constraints, permissions, and corpus context.
7. **Treating classification as evidence:** preserve corpus-specific answerability evidence.
8. **Using one validation Boolean:** separate structural, semantic, privacy, and selection state.
9. **Confusing memberships with unique records:** report both.
10. **Reusing approval after artifact changes:** bind approval to immutable versions and checksums.
11. **Overstating evaluation claims:** state population, scenarios, and limitations.
12. **Treating diagnostic cases as representative workload:** preserve distinct membership.

---

## 19. Self-Assessment

### 19.1 Concept clarity

- Can you distinguish the target population, sampling frame, candidate frame, and selected subset?
- Can you explain workload and coverage objectives?
- Can you distinguish query record, evaluation case, and sampling unit?

### 19.2 Internal understanding

- Can you explain deterministic ranking at the byte level?
- Can you explain why repeatability does not establish probability sampling?
- Can you reconcile multi-label quotas?
- Can you explain corpus-dependent answerability?

### 19.3 Engineering thinking

- Can you identify assumptions behind a workload claim?
- Can you detect incomplete candidate frames?
- Can you define defensible deduplication?
- Can you distinguish record validity from release eligibility?

### 19.4 Production awareness

- Can you define exact types, nullability, and conditional rules?
- Can you separate query records from validation and selection artifacts?
- Can you model immutable privacy-state history?
- Can you bind approval to artifact checksums?

### 19.5 Teaching ability

Explain to another engineer:

1. Why workload and coverage selection differ.
2. Why deterministic ranking does not prove representativeness.
3. How multi-label quotas work.
4. Why corpus snapshots matter.
5. Why release approval must bind to checksums.

A topic is incomplete if you can recognize terminology but cannot defend the design.

---

## 20. Key Takeaways

1. Retrieval evaluation begins with explicit questions and defensible claims.
2. Target population, sampling frame, candidate frame, and selected subset are distinct.
3. Evaluation, sampling, analysis, and grouping units must be defined independently.
4. Query classification uses independent dimensions.
5. Workload and coverage selection serve different objectives.
6. Deterministic reproducibility and probability sampling are different properties.
7. Probability sampling requires an explicit design and inclusion-probability evidence.
8. Coverage selection requires explicit membership, quotas, multi-label behavior, and unique-record reconciliation.
9. Stable IDs, provenance, and deduplication rules support reproducibility.
10. Privacy, validity, eligibility, review, and membership are separate decisions.
11. Answerability must be tied to corpus context and evidence.
12. Query-record contracts must define types, nullability, empty behavior, vocabularies, and conditional requirements.
13. Structural and semantic validation have different responsibilities.
14. Validation and selection state belong in separate artifacts.
15. Privacy decisions require immutable history.
16. Released datasets require immutable artifact references and checksums.
17. Release validation and approval are separate operations.
18. Evaluation claims must remain within the evidence supported by the query set.

---

## 21. Connection to the Next Files

### RET-10.02 — Relevance Judgments and Retrieval Metrics

Defines how to establish relevance judgments and measure retrieval behavior.

Builds on evaluation units, query-set identity, provenance, corpus snapshots, answerability, and scenario classification.

It owns judgment methodology and metric definitions, not query-set construction.

### RET-10.03 — Baselines, Controlled Experiments, and Ablations

Defines comparisons under controlled conditions.

Builds on frozen query sets, evaluation objectives, corpus snapshots, judgments, and metric contracts.

It owns baseline design, experimental controls, and ablations.

### RET-10.04 — Reproducible Retrieval Benchmark and Report

Defines benchmark execution, packaging, reproduction, and reporting.

Builds on manifests, immutable references, validation evidence, judgments, metrics, and experiment outputs.

It owns benchmark execution and reporting.

### Relationship with RET-11

RET-11 uses evaluation evidence to classify retrieval failures, investigate root causes, and validate improvements.

RET-10 establishes how evaluation evidence is constructed. RET-11 establishes how that evidence supports diagnosis and improvement.

### Final boundary

RET-10.01 is the authoritative location for evaluation questions, query-set scope, classification, target populations, candidate frames, workload and coverage selection, deterministic selection contracts, probability-sampling evidence, provenance, query-record and manifest contracts, validation, and release integrity.

Later files may reference these concepts but must not duplicate their detailed teaching.
