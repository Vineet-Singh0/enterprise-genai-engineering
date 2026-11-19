# Metadata Filters and Structured Constraints

## 1. Purpose and Scope

Retrieval systems must determine not only which records are relevant to a query, but also which records are eligible to be returned.

Metadata filters and structured constraints express the second requirement. They restrict retrieval using fields such as document type, tenant, status, date, category, environment, or other structured attributes.

Consider this request:

> Find relevant incident reports about database timeouts involving `worker-v2` in production between October 1 and October 31, 2026. Prefer recently resolved incidents, but do not include staging.

The system must distinguish several requirements:

- The incident category is a mandatory constraint.
- The production environment is a mandatory constraint.
- The requested time interval is a mandatory constraint.
- The service identifier is a mandatory constraint if the request requires incidents involving that specific service.
- Recently resolved incidents are preferred, not necessarily required.
- The report's textual content determines its relevance to database timeouts.

A retrieval system that returns a highly relevant staging incident has not satisfied the request. Relevance cannot compensate for violating a mandatory constraint.

The central principle is:

**Metadata constraints define eligibility; retrieval and ranking determine relevance among eligible candidates.**

### Scope of this document

This document covers:

- Metadata fields and structured predicates.
- Equality, comparison, membership, range, existence, and logical conditions.
- Boolean composition and the semantics of missing values.
- Hard constraints versus relevance preferences.
- Pre-filtering, post-filtering, and filter selectivity.
- The interaction between filters and lexical or dense retrieval.
- Tenant and access-related constraints at the retrieval boundary.
- Choosing between text retrieval, structured retrieval, and hybrid approaches.
- Validating constraints before execution.
- Preserving constraints across multiple retrieval operations.

This document does not teach query rewriting, candidate fusion, ranking algorithms, general retrieval evaluation, or enterprise-wide authorization policy. Those subjects belong to their related chapters.

## 2. Metadata as a Retrieval Contract

Metadata describes properties associated with a document, chunk, record, or other retrievable unit. A filter evaluates these properties against conditions specified by the request.

For example, an incident record might contain:

```json
{
  "document_id": "INC-1042",
  "title": "Database connection timeout",
  "category": "incident",
  "document_type": "incident_report",
  "environment": "production",
  "service": "worker-v2",
  "tenant_id": "tenant-17",
  "language": "en",
  "severity": 2,
  "created_at": "2026-10-12T09:30:00Z",
  "status": "resolved"
}
```

This is an illustrative data model, not a required schema or engine-specific query format.

The fields enable the retrieval system to express conditions independently of the document's natural-language content.

### 2.1 Common metadata fields

| Field category | Example | Typical constraint |
|---|---|---|
| Identity | `document_id` | Select a specific record |
| Document classification | `document_type` | Include incident reports only |
| Category | `category` | Include incidents rather than runbooks |
| Tenant | `tenant_id` | Restrict records to an authorized tenant |
| Access scope | Access-control attributes | Restrict eligible records to the permitted scope |
| Date and time | `created_at` | Select records in a time interval |
| Status | `status` | Include resolved or open records |
| Language | `language` | Restrict to a supported language |
| Environment | `environment` | Include production, exclude staging |
| Service | `service` | Select records associated with a particular service |
| Numeric attributes | `severity` | Apply numeric comparisons or ranges |

A field is useful only when its meaning, type, allowed values, and population rules are sufficiently well defined.

For example, if `created_at` sometimes contains timestamps and sometimes contains unparsed strings, a date comparison cannot be assumed to behave consistently. Similarly, if `status` uses both `resolved` and `closed` for the same business state, equality filters may not express the intended requirement.

Metadata is therefore not merely descriptive information. It forms part of the retrieval system's data contract.

### 2.2 Document-level versus chunk-level metadata

A metadata field can apply to an entire document or to an individual chunk.

For example:

- A document-level `document_type` may classify an entire incident report.
- A chunk-level `section_type` may distinguish the incident summary from the remediation section.
- A document-level `tenant_id` may apply to every chunk derived from that document.

The retrieval architecture must preserve the intended scope when documents are chunked, indexed, updated, and retrieved.

If a constraint is applied to chunk records, the relevant metadata must exist at that level or be reliably available through the retrieval architecture. Missing propagation can cause incorrect eligibility decisions.

The design and lifecycle of indexes and chunk metadata are covered in the relevant index-design and document-structure chapters; the concern here is the correctness of the field's scope.

## 3. Structured Predicates

A structured predicate is a condition evaluated against a field or set of fields.

The exact syntax varies by database, vector store, search engine, and query API. The following examples use conceptual notation rather than prescribing a particular implementation.

| Predicate type | Conceptual example | Purpose |
|---|---|---|
| Equality | `environment == "production"` | Match a specific value |
| Inequality | `status != "open"` | Exclude a specific value, subject to null and missing-value semantics |
| Membership | `category IN ["incident", "postmortem"]` | Match one of several allowed values |
| Numeric comparison | `severity <= 2` | Apply an ordered numeric condition |
| Range | `created_at >= start AND created_at < end` | Select values within an interval |
| Existence | `EXISTS(service)` | Require the field to be present, where supported |
| Logical composition | `A AND (B OR C)` | Combine multiple predicates |

A filter may contain several predicates, but the number of predicates alone does not determine its selectivity, execution cost, or correctness.

Each predicate must be supported by the target engine and interpreted according to the field's type and semantics.

### 3.1 Field types and comparison semantics

A comparison is meaningful only when the field and comparison value have compatible types and definitions.

Examples include:

- A numeric severity field should be compared numerically, not as an arbitrary string.
- A timestamp should be compared using a consistent time representation.
- A category should use a documented vocabulary if equality or membership filters depend on exact values.
- An identifier should retain the semantics of the identifier system rather than being treated as ordinary prose.

Implicit type conversion can differ between engines. A production system should not assume that two engines interpret malformed or incompatible values identically.

When a comparison cannot be evaluated reliably, the system needs an explicit policy: reject the request, reject the affected predicate, or use another defined safe behavior. Mandatory constraints must not silently disappear.

## 4. Representing and Composing Constraints

Natural-language requests often contain multiple conditions. The retrieval system must translate them into a structured representation that preserves the intended logic.

Consider:

> Find database timeout incidents from production during October 2026.

A conceptual representation is:

```json
{
  "category": {
    "eq": "incident"
  },
  "environment": {
    "eq": "production"
  },
  "created_at": {
    "gte": "2026-10-01T00:00:00Z",
    "lt": "2026-11-01T00:00:00Z"
  }
}
```

This example illustrates the intended conditions. It is not a claim that every retrieval engine accepts this schema.

### 4.1 Inclusive and exclusive boundaries

A range may include or exclude its boundary values.

For example:

- `created_at >= start` includes a record whose timestamp equals `start`.
- `created_at > start` excludes a record whose timestamp equals `start`.
- `created_at <= end` includes a record whose timestamp equals `end`.
- `created_at < end` excludes a record whose timestamp equals `end`.

For October 2026, the interval

\[
[\text{2026-10-01T00:00:00Z},\,
\text{2026-11-01T00:00:00Z})
\]

means that the start is inclusive and the end is exclusive.

A half-open interval is often useful for time-based retrieval because adjacent periods can be represented without overlapping at their boundaries. The same pattern works for many numeric and ordered intervals.

Correctness depends on the intended calendar and the data contract.

**Calendar dates must be interpreted before being converted into timestamp predicates.** If the user means October in a particular local timezone, determine the start of October and the start of November in that timezone, then convert those boundaries to the representation used by the retrieval system, commonly UTC. Do not assume that a calendar month in a local timezone has the same UTC boundaries.

The implementation must also account for:

- Consistent timezone normalization.
- Compatible timestamp types and comparison representations.
- The precision supported by the stored timestamps.
- Daylight-saving transitions when relevant to the specified timezone.
- The distinction between an inclusive and an exclusive end boundary.

For example, “October 2026 in India” and “October 2026 UTC” refer to different timestamp intervals. A filter is correct only if its boundaries reflect the user's intended calendar interval.

### 4.2 AND, OR, and grouping

Logical composition determines which combinations of conditions are accepted.

Suppose the request allows incidents involving either `worker-v2` or `worker-v3`, but only in production.

The intended condition is:

```text
environment == "production"
AND
(
  service == "worker-v2"
  OR service == "worker-v3"
)
```

This is not equivalent to:

```text
(
  environment == "production"
  AND service == "worker-v2"
)
OR
service == "worker-v3"
```

The second expression permits `worker-v3` records from staging or other environments.

This is a correctness problem, not merely a formatting issue. An incorrectly grouped predicate can broaden the eligible result set.

Engine-specific operator precedence must not be relied on unless it is explicitly understood and verified. When the intended logic is important, represent the grouping explicitly.

### 4.3 Inequality, negation, null, and missing values

These concepts are related but not interchangeable.

- **Inequality** compares a field against a value.
- **Negation** reverses the truth of a predicate, subject to the engine's logical semantics.
- **Null** represents an explicitly unknown or absent value according to the data model.
- **Missing** means the field is not present in the record or indexed representation.

Consider:

```text
status != "open"
```

It is unsafe to assume that this includes every record whose status is absent. Depending on the engine, a missing or null value may fail the comparison, produce an unknown result, or be handled through engine-specific rules.

Likewise:

```text
NOT (status == "open")
```

does not necessarily produce the same result set as an inequality predicate when nulls or missing fields are involved.

Three-valued logic is one common model for SQL-like predicates: a comparison can evaluate to true, false, or unknown. Other systems may expose different semantics.

The retrieval system must therefore define how missing and null values affect mandatory constraints.

For example, if a request requires production incidents, a record with no trustworthy environment value should not be treated as production merely because its environment is unknown.

A sound data contract specifies:

- Whether a field is required.
- Whether explicit null is allowed.
- Whether missing and null have different meanings.
- How predicates evaluate against those states.
- How ingestion and indexing handle malformed values.

If an engine cannot enforce the intended condition reliably, the system must not claim the constraint is satisfied.

## 5. Hard Constraints Versus Relevance Signals

Not every phrase in a request should become a mandatory filter.

Some requirements determine eligibility; others express preferences that should influence relevance or ordering.

### 5.1 Hard constraints

A hard constraint defines a condition that a returned result must satisfy.

Examples:

- Only production incidents.
- Only records from the permitted tenant.
- Only records created during a specified interval.
- Exclude staging.
- Include only a specified document type.

A candidate that violates a mandatory condition is ineligible, regardless of its semantic similarity or lexical score.

### 5.2 Relevance signals and preferences

A preference helps distinguish better results among eligible candidates.

Examples:

- Prefer recently resolved incidents.
- Prefer reports with detailed remediation steps.
- Prefer records that mention connection-pool exhaustion explicitly.
- Prefer recent reports when older reports are also acceptable.

Consider:

> Find relevant timeout incidents from production, preferably those resolved recently.

The production requirement is mandatory. Recent resolution is a preference unless the request explicitly defines a required time interval for resolution.

A system may express the preference through ranking, scoring, or another retrieval strategy. It should not automatically convert every preference into a strict filter.

If “prefer recently resolved” becomes `resolved_at >= cutoff`, older but otherwise relevant records are excluded entirely. That changes the meaning of the request.

### 5.3 When a preference becomes a constraint

Natural language can be ambiguous.

Compare:

- “Prefer recent incidents.”
- “Only include incidents from the last 30 days.”

The first expresses a preference. The second imposes a temporal eligibility requirement.

When the distinction materially affects the answer, the system should use a defined interpretation policy or ask for clarification rather than silently changing the requirement.

A useful internal representation separates:

1. Mandatory predicates.
2. Optional preferences.
3. Unresolved or ambiguous conditions.

This separation also makes validation and debugging easier.

## 6. How Filters Interact with Lexical and Dense Retrieval

Metadata filtering and content retrieval solve different problems, but they must cooperate to produce a correct result set.

### 6.1 Lexical retrieval

Lexical retrieval identifies candidates using term-based matching and scoring.

For example, a query about database timeouts may match documents containing terms such as `database`, `timeout`, and `connection`.

A metadata condition can restrict lexical candidates to production incident reports created during October 2026.

The filter does not replace lexical matching. It constrains which records are eligible under the requested conditions.

### 6.2 Dense retrieval

Dense retrieval identifies candidates using vector representations and similarity measures.

A query about connection failures may retrieve semantically related documents even if they use different terminology.

Metadata constraints can restrict the eligible records for this search as well. However, the exact interaction between the filter and the vector-search algorithm depends on the engine and index implementation.

In particular:

- A filter does not make vector similarity exact.
- A pre-filtered approximate nearest-neighbor search is not necessarily equivalent to exhaustive exact search over every eligible vector.
- Some systems support different filter execution strategies with different recall, latency, or candidate-availability characteristics.
- The system must understand the guarantees its selected engine actually provides.

Dense retrieval's representation and search fundamentals belong to RET-06; this chapter addresses the constraints applied to its candidate set.

### 6.3 Hybrid retrieval

A hybrid system may combine lexical and dense retrieval. The metadata constraints must remain effective across every path that can contribute results.

For example:

```text
User request
    |
    v
Classify mandatory constraints
    |
    v
Build validated metadata predicates
    |
    +----------------------+
    |                      |
    v                      v
Lexical retrieval      Dense retrieval
    |                      |
    +----------+-----------+
               |
               v
      Constraint-safe result path
               |
               v
        Eligible candidates
```

This is a conceptual flow, not a requirement that all engines execute filters at this exact point.

If separate retrieval paths apply different filter scopes, one path may introduce records that violate a requirement enforced by another. A later combination stage must not accidentally restore ineligible records.

Candidate fusion and deduplication are covered in RET-08. The responsibility here is to establish that mandatory constraints are preserved across the retrieval paths.

## 7. Pre-Filtering, Post-Filtering, and Selectivity

Filters can be applied at different stages of retrieval. These choices affect candidate availability, execution cost, and the behavior of the retrieval engine.

### 7.1 Pre-filtering

Pre-filtering applies the constraint as part of candidate search so that the search is restricted to eligible records according to the engine's semantics.

For example, a dense search may be restricted to production incident vectors before selecting its candidate set.

Potential benefits include avoiding candidates that would later be discarded and improving the usefulness of a fixed candidate budget.

However, the term *pre-filtering* does not guarantee a particular implementation or exact-search behavior. Engines may use different index structures and algorithms to combine filtering with approximate search.

### 7.2 Post-filtering

Post-filtering retrieves an initial candidate set and then removes records that violate the specified constraints.

Suppose retrieval produces 20 candidates, of which 12 belong to staging. Post-filtering leaves only 8 eligible candidates.

If the request requires 10 results, the system may return fewer than requested even though additional eligible records exist outside the initial candidate set.

**The eight remaining candidates are not necessarily the complete set of eligible records, nor are they necessarily the globally best eight eligible records.** The result depends on the initial candidate-generation process, its search strategy, and its candidate budget. This is especially important when the initial retrieval uses approximate nearest-neighbor search.

Increasing the candidate budget may help, but it does not guarantee that the requested number of eligible results will be found or that the returned set is the exact top-ranked set over all eligible records.

Most importantly, **post-filtering must not return ineligible records simply to fill the result count**.

### 7.3 Comparing the approaches

| Dimension | Pre-filtering | Post-filtering |
|---|---|---|
| Constraint timing | Applied as part of candidate search | Applied after initial candidate retrieval |
| Candidate eligibility | Governed by the engine's filtered-search semantics | Non-matching candidates are removed after retrieval |
| Result availability | Depends on eligible population and engine behavior | Can produce too few results if many initial candidates are rejected |
| Search cost | Depends on index, filter implementation, and selectivity | Includes the cost of retrieving and evaluating candidates that may be discarded |
| Completeness and ranking | Depends on the search algorithm and its guarantees | Limited by the initial candidate set; filtering alone does not establish completeness |
| Principal risk | Assuming filtering guarantees exact search or adequate recall | Returning too few eligible candidates or incorrectly relaxing the filter |

Neither strategy is universally faster or more accurate. The correct choice depends on the engine, index implementation, data distribution, filter conditions, candidate budget, and required correctness guarantees.

For a mandatory constraint, the implementation must preserve eligibility regardless of which execution strategy is used.

### 7.4 Filter selectivity

Selectivity describes how restrictive a filter is relative to the collection being considered.

For example, if a collection contains 100,000 records and 5,000 satisfy a condition, the observed qualifying fraction is:

\[
\frac{5{,}000}{100{,}000}=0.05
\]

Five percent of the collection qualifies for that condition.

A more selective filter generally admits fewer records, but that does not automatically mean it is faster or slower. Execution cost depends on how the engine evaluates the predicate and uses its indexes.

Selectivity matters because it can affect:

- How many records remain eligible.
- Whether a requested result count is achievable.
- The effectiveness of a fixed candidate budget.
- The cost of evaluating the filter.
- The trade-offs between filtered and unfiltered candidate generation.

The number of predicates is not a reliable substitute for selectivity. One condition may eliminate almost the entire collection, while several other conditions may each eliminate very few records.

Filter-specific result shortages and execution diagnostics are treated in File 03.

## 8. Tenant and Access-Related Constraints

Tenant and access restrictions require special care because they define which data a request is permitted to retrieve.

They must not be treated as ordinary relevance preferences.

For example, a request may contain a valid semantic query and a valid production filter while still being unauthorized to access a particular tenant's records.

A relevant record is not eligible if the caller is not permitted to access it.

### 8.1 Trusted enforcement flow

A conceptual retrieval path is:

```text
Authenticated request
        |
        v
Trusted application authorization
        |
        v
Determine permitted data scope
        |
        v
Constrain retrieval using trusted scope
        |
        v
Apply additional user-requested constraints
        |
        v
Retrieve eligible records
        |
        v
Verify applicable result-access requirements
        |
        v
Expose authorized results to downstream processing
```

The trusted application or retrieval architecture must determine the caller's permitted scope using authenticated identity and authorization context.

The language model may help interpret the user's request, but it must not be the sole authority deciding which tenant or protected records the caller may access.

### 8.2 Required properties

A secure implementation should preserve these properties:

- Access scope comes from trusted identity and authorization context, not merely from user-provided text.
- User-requested conditions may narrow the permitted scope but cannot expand it.
- Model-generated filters cannot remove or override mandatory access restrictions.
- Every retrieval path that can contribute records preserves the required access constraints.
- Unauthorized records must not enter security-sensitive downstream processing, including model context, shared caches, or outputs, merely because they will later be removed from the final response.
- Empty results do not justify relaxing tenant or authorization restrictions.
- Failure to construct or enforce a mandatory access condition must not silently become an unrestricted query.

A final authorization check can provide defense in depth, but it is not a universal substitute for enforcing access restrictions at retrieval time. If unauthorized records have already influenced model context, intermediate processing, or shared state, removing them from the final result does not undo that exposure.

For example, if the authorized scope is `tenant-17`, the user must not be able to obtain `tenant-23` records by asking for them explicitly or by causing a generated filter to omit the tenant predicate.

This chapter covers the retrieval-level correctness boundary. Enterprise-wide identity, policy governance, permission lifecycle, and broader security architecture belong to the ENT domain.

## 9. Choosing Between Text Retrieval and Structured Retrieval

A metadata filter does not make every information request a text-retrieval problem. Some questions are better answered through structured queries, while others require content retrieval.

### 9.1 Text retrieval with metadata constraints

Use lexical or dense retrieval when the system must find documents based on their content.

Examples:

- Find incident reports explaining database connection timeouts.
- Find runbooks describing recovery from connection-pool exhaustion.
- Find postmortems that discuss failures similar to a new incident.

Metadata filters can restrict the eligible documents by service, environment, category, date, tenant, or other attributes.

### 9.2 Direct structured retrieval

Use a structured query when the requested operation depends on exact field values or structured computation.

Examples:

- How many database timeout incidents occurred during October?
- Which production incidents remain open?
- What is the distribution of incident severity?
- Return the record with a specified incident identifier.

A limited semantic-retrieval result set should not be treated as the authoritative source for an exact count or aggregation over the full matching collection.

If the underlying data and query requirements are structured, execute the corresponding structured operation and preserve the relevant access constraints.

### 9.3 Hybrid approaches

Some requests require both content relevance and structured conditions.

| Information need | Appropriate starting point |
|---|---|
| Find explanations of database timeouts in production incidents | Text retrieval with metadata constraints |
| Count production timeout incidents during October | Structured query and aggregation |
| Find relevant timeout incidents from a specified service and date interval | Text retrieval with service, environment, and date constraints |
| Find relevant remediation reports and then summarize their content | Constrained retrieval followed by evidence-based processing |
| Retrieve a specific incident by identifier | Direct structured lookup |

The appropriate design depends on the actual information need, not simply on whether the system has a vector database.

For example:

> Find reports explaining production database timeouts involving `worker-v2` during October 2026.

This request combines content relevance with structured eligibility conditions. A suitable approach is to use text retrieval, constrain the candidate set by trusted and requested metadata, and return only eligible records.

By contrast:

> How many production database timeout incidents involving `worker-v2` occurred during October 2026?

This asks for a count. A structured query over the authoritative records is generally the appropriate starting point.

## 10. Validating Constraints Before Execution

A generated filter is not correct merely because it is syntactically plausible.

Before executing a retrieval request, the system must validate the conditions against the permitted schema, supported operators, field types, and security requirements.

### 10.1 Validation workflow

1. **Validate fields.** Confirm that every referenced field is recognized and permitted for the request.
2. **Validate operators.** Confirm that each operator is supported for the field's type.
3. **Validate values.** Check value types, allowed categories, timestamp formats, and relevant bounds.
4. **Validate logical structure.** Check grouping, nesting, and the intended relationship between predicates.
5. **Classify conditions.** Distinguish mandatory constraints from optional preferences.
6. **Validate access scope.** Apply trusted authorization context independently of model-generated conditions.
7. **Validate missing-value behavior.** Confirm that the intended semantics for null, missing, and malformed values are supported.
8. **Construct the execution request.** Map the validated representation to the retrieval engine's supported filter format.

The exact validation implementation varies by system, but the responsibility is not optional.

### 10.2 Invalid and unsupported conditions

Consider a generated predicate that refers to an unsupported field:

```text
deployment_region == "north"
```

If `deployment_region` is not part of the approved schema, the system must not assume that the predicate has been enforced.

Likewise, if the engine cannot implement a mandatory condition with the required semantics, the system must not silently discard the condition and return a broader result set.

**If a mandatory constraint cannot be enforced with the required semantics, the operation must fail closed or use a verified alternative execution path that preserves the constraint.** Rejecting the predicate while continuing with a broader query is not a safe fallback.

The application should follow an explicit policy for invalid or unsupported requests. Depending on the condition and system requirements, that may mean rejecting the request, asking for clarification, or using a verified alternative execution path.

Optional preferences may have a different fallback policy from mandatory constraints, but that distinction must be deliberate and observable.

### 10.3 Model output is an input to validation

A model may produce a structured filter representation, but that representation should be treated as untrusted input.

A robust implementation:

- Maps fields to an approved schema.
- Restricts operators to supported operations.
- Validates values and types.
- Preserves logical grouping.
- Separates user intent from trusted access scope.
- Rejects unsupported mandatory constraints.
- Produces a validated request for the target engine.

This is a controlled translation boundary between language interpretation and retrieval execution. It is not a reason to allow arbitrary model-generated database expressions.

## 11. Preserving Constraints Across Multiple Retrieval Operations

Some requests lead to multiple retrieval operations. For example, a system may search separate collections, retrieve evidence from multiple sources, or execute multiple subqueries derived from a larger request.

Constraints must remain associated with every operation to which they apply.

This does not mean that every constraint must be repeated in the natural-language query string. It means that the execution plan must preserve the constraint's intended scope.

### 11.1 Global and operation-specific constraints

Suppose a request requires:

- Production records only.
- A particular tenant's permitted data.
- Evidence about database timeouts.
- Additional evidence about connection-pool configuration.

The tenant and production restrictions may apply to both retrieval operations, while the content-specific conditions may differ.

The execution plan should represent this distinction explicitly.

```text
Request constraints
    |
    +--> Trusted tenant/access scope
    |
    +--> Global environment constraint
    |
    +--> Retrieval operation A: timeout evidence
    |
    +--> Retrieval operation B: pool configuration evidence
    |
    v
Validate each operation's effective constraints
    |
    v
Return only results satisfying applicable constraints
```

This diagram represents constraint propagation, not a mandatory execution architecture.

### 11.2 Common implementation mistakes

Common failures include:

- Applying a mandatory condition to only one retrieval branch.
- Losing a constraint when transforming a request into a subquery.
- Allowing a generated query variant to broaden the authorized data scope.
- Treating an optional preference as a mandatory condition in one branch but not another.
- Combining results from multiple operations without preserving their eligibility requirements.

A system should be able to inspect the effective constraints for each retrieval operation and determine which source or transformation introduced them.

The detailed diagnosis of filter-specific empty results and execution failures belongs in File 03.

## 12. Practical Engineering Exercise

Consider the request:

> Find relevant incident reports about database timeouts involving `worker-v2` in production between October 1 and October 31, 2026. Prefer recently resolved incidents, but do not include staging.

Assume the data model contains:

- `document_id`
- `document_type`
- `category`
- `tenant_id`
- `environment`
- `service`
- `created_at`
- `resolved_at`
- `status`
- `content`

The authenticated request also has a trusted authorization scope.

### 12.1 Classify the requirements

Identify which conditions are mandatory, which are preferences, and which relate to content relevance.

Your design should not turn “prefer recently resolved” into a hard date cutoff unless the requirement explicitly defines one.

### 12.2 Design the constraints

Specify the intended conditions for:

- Incident classification.
- Production environment.
- `worker-v2` service.
- October 2026 creation interval.
- Trusted tenant/access scope.

Use a half-open time interval if it correctly represents the intended calendar range. State the timezone and timestamp assumptions. If the request refers to a local calendar month, calculate the corresponding start and end instants in that timezone before converting them to the timestamp representation used for execution.

### 12.3 Choose an execution strategy

Explain whether pre-filtering, post-filtering, or another engine-supported strategy is appropriate.

Address:

- Expected filter selectivity.
- The number of eligible records.
- The candidate budget and risk of too few post-filtered results.
- The actual guarantees offered by the selected retrieval engine.
- How the implementation preserves hard constraints.
- What the system does if a mandatory condition cannot be enforced.

Do not assume that one strategy is always optimal.

### 12.4 Select the retrieval method

Explain why content retrieval is appropriate for finding reports about database timeouts. Then compare it with this different request:

> How many database timeout incidents involving `worker-v2` occurred in production during October 2026?

Your answer should distinguish semantic relevance from exact structured aggregation.

### 12.5 Design correctness tests and document their evidence

At minimum, test the following cases:

1. A relevant staging record is excluded.
2. A record outside the requested interval is excluded.
3. A record associated with another service is excluded when the service condition is mandatory.
4. A relevant record cannot override a hard constraint.
5. Recency remains a preference rather than a hard exclusion.
6. Missing or malformed mandatory metadata cannot be treated as proof that a condition is satisfied.
7. Boolean grouping does not admit records from unintended environments.
8. A record outside the authorized tenant or access scope cannot enter protected downstream processing.
9. A generated query cannot remove a mandatory access restriction.
10. Post-filtering cannot return an ineligible record merely to satisfy a requested result count.
11. Timestamp comparisons handle the specified timezone, precision, and exclusive end boundary correctly.
12. An unsupported mandatory filter fails closed or uses a verified alternative that preserves the constraint; it never silently broadens the result set.

For each test, document:

- **Input:** the request, record, or condition being tested.
- **Expected behavior:** whether the record is eligible, whether execution succeeds, or whether the operation must fail.
- **Observation point:** where the behavior is verified, such as the effective filter, retrieved candidate set, model context boundary, cache write, or final result.
- **Evidence:** the assertion, trace, or test output that supports the conclusion.
- **Limitation:** what the test does not establish.

For example, a test that checks only the final response does not prove that unauthorized records never entered an intermediate model prompt or shared cache. A test that returns the requested number of results does not prove that they are the globally best eligible candidates.

The exercise is complete when the implementation and its tests establish the specific guarantees claimed, without overstating what the available evidence proves. Formal retrieval-quality metrics and benchmark methodology belong to RET-10.

## 13. Completion Criteria

This topic is complete when an engineer can:

- Explain how metadata predicates restrict the eligible result set.
- Select appropriate predicate types for supported field types.
- Compose conditions using correct Boolean grouping.
- Distinguish inclusive and exclusive boundaries.
- Explain the effects of null, missing, and malformed metadata.
- Separate hard constraints from relevance preferences.
- Explain how metadata filters interact with lexical and dense retrieval.
- Compare pre-filtering and post-filtering without assuming universal engine behavior.
- Reason about selectivity, candidate availability, result counts, and candidate-set limitations.
- Preserve trusted tenant and access constraints throughout security-sensitive processing.
- Choose between text retrieval, structured retrieval, and hybrid approaches.
- Validate a generated filter before execution.
- Preserve applicable constraints across multiple retrieval operations.
- Design correctness tests and state what their evidence does and does not prove.

## Conclusion

Metadata filtering is a correctness mechanism as well as a retrieval capability.

It determines which records are eligible, how structured conditions are composed, and how those conditions interact with retrieval execution. A system can produce plausible relevance scores and still fail if its metadata constraints are incorrect, inconsistently applied, or silently discarded.

A production-quality implementation must therefore treat constraints as explicit, validated parts of the retrieval request. It must preserve mandatory eligibility and access requirements across retrieval paths while keeping optional preferences distinct from hard restrictions. It must also distinguish the records returned by a retrieval strategy from the complete set of eligible records, and distinguish a successful test from evidence of a stronger guarantee.

**The governing principle is simple: relevance determines how well a candidate addresses the information need; constraints determine whether that candidate is allowed to qualify at all.**
