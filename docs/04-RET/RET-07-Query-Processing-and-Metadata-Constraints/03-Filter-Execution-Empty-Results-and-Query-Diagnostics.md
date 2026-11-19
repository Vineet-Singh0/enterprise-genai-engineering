# Filter Execution, Empty Results, and Query Diagnostics

## 1. Purpose and Scope

Metadata constraints define which records are eligible for retrieval. However, defining a correct filter is only part of the engineering problem. A production retrieval system must also execute that filter correctly, preserve its meaning across retrieval operations, handle empty results deliberately, and provide enough evidence to explain unexpected outcomes.

This chapter covers the execution and diagnosis of constrained retrieval.

It focuses on:

- How filters participate in retrieval execution.
- How structured constraints interact with candidate generation.
- Why valid queries can produce empty or unexpectedly small result sets.
- How to distinguish legitimate empty results from filtering, indexing, configuration, and execution failures.
- How to diagnose over-filtering and incorrect filter application.
- How to instrument retrieval operations for production troubleshooting.
- How to design tests that verify constraint correctness and failure behavior.
- How to report retrieval limitations without inventing results or silently weakening constraints.

This chapter does not redefine metadata schemas, structured predicate semantics, or authorization policy. Those concerns are covered by the preceding chapter and the broader enterprise security domain. It also does not define the general candidate-fusion, ranking, or formal retrieval-evaluation systems covered by subsequent retrieval chapters.

The central principle is:

> An empty result is an observation, not an explanation.

A retrieval system must determine whether the eligible result set is genuinely empty, whether candidate generation failed to discover eligible records, whether a constraint was incorrectly constructed or executed, or whether the retrieval operation itself failed.

## 2. The Retrieval Execution Model

A constrained retrieval request passes through multiple stages. A failure at any stage can affect the final result.

A conceptual execution path is:

```text
User request
    |
    v
Query interpretation
    |
    v
Structured constraint construction
    |
    v
Constraint validation
    |
    v
Retrieval request planning
    |
    v
Filter and candidate-generation execution
    |
    v
Candidate eligibility verification
    |
    v
Relevance scoring and result selection
    |
    v
Result validation and response construction
    |
    v
Diagnostics and observability
```

This diagram is conceptual, not a requirement that every system execute these stages in exactly this order. A vector database may combine filtering and approximate nearest-neighbor search in one operation. A relational retrieval implementation may apply predicates before computing relevance. A hybrid system may execute lexical and dense retrieval separately and combine their results later.

The important requirement is that each execution path preserves the intended constraints.

### 2.1 Logical correctness versus execution behavior

Consider a request:

> Find resolved incidents involving worker-v2 in production during October 2026. Prefer recently resolved incidents.

The request contains several different requirements:

- Incident content must be relevant to worker-v2 and the underlying problem.
- The environment must be production.
- The incident must satisfy the October 2026 time interval.
- The incident must have a resolved status.
- More recently resolved incidents should be preferred, if that preference can be represented meaningfully.

The first four requirements define eligibility. The last influences ordering among eligible results.

A correct retrieval execution must preserve that distinction. It cannot return a staging incident merely because its text is highly relevant, nor can it exclude a valid production incident merely because it is less recent than another candidate.

Even when the logical filter is correct, execution can still fail because:

- The indexed metadata does not contain the expected fields.
- A filter uses a different field name from the index schema.
- The date interval is constructed incorrectly.
- The query is routed to a stale or incomplete index.
- An approximate search examines too few candidates.
- A filter is applied only to one retrieval branch.
- A downstream component removes candidates unexpectedly.
- A timeout interrupts the operation before it completes.

The execution system must make these possibilities distinguishable.

### 2.2 A useful result-state model

A production system should distinguish at least the following outcomes.

| State | Meaning | Appropriate handling |
|---|---|---|
| `success_with_results` | Execution completed and returned eligible candidates | Continue with normal downstream processing |
| `success_empty` | Execution completed successfully but returned no candidates | Diagnose or communicate the empty outcome |
| `partial` | Some required operations completed, but the overall retrieval was incomplete | Preserve the partial status and its limitations |
| `timeout` | The operation exceeded its execution deadline | Apply bounded retry or failure handling |
| `invalid_request` | The request or constraints failed validation | Reject or request correction |
| `unsupported_constraint` | The backend cannot faithfully execute a mandatory constraint | Fail closed or use a verified alternative |
| `backend_error` | The retrieval backend failed | Apply error handling and preserve diagnostic evidence |
| `degraded` | A known limitation affected retrieval behavior | Report the limitation and avoid claiming complete retrieval |

These labels are illustrative application-level states, not standardized status names required by a particular vector database or framework.

Do not collapse all outcomes into an empty list. A successful query returning no matches and a timed-out query returning no matches have different meanings.

**An empty collection must never be used as the only signal for execution success or failure.**

## 3. Where Filters Execute

The location and behavior of filtering depend on the retrieval architecture.

### 3.1 Filter-aware retrieval

In filter-aware retrieval, the backend receives the query and structured constraints as part of the same retrieval operation.

Conceptually:

```python
results = retriever.search(
    query="worker-v2 database timeout",
    filters={
        "environment": "production",
        "status": "resolved",
    },
    limit=20,
)
```

The example illustrates an interface, not a particular framework API.

Potential benefits include:

- The backend can use metadata indexes to restrict eligible records.
- Ineligible records may be excluded before expensive scoring or retrieval work.
- Candidate selection and constraint evaluation can be coordinated by the backend.
- The application avoids transferring large unfiltered candidate sets.

However, accepting a filter parameter does not prove that every backend execution path enforces the filter correctly. Engineers must verify the backend's documented semantics, supported operators, and behavior under approximate search.

Questions to investigate include:

- Are all supplied predicates supported?
- Are missing fields treated consistently with the intended semantics?
- Can the backend apply the predicate during candidate generation?
- Does approximate search remain approximate under the filter?
- Are counts exact or estimates?
- Does the operation expose whether it completed successfully?
- Does the backend return enough information to inspect the applied constraints?

### 3.2 Application-side filtering

Application-side filtering retrieves candidates and then evaluates metadata constraints in application code.

```python
candidates = retriever.search(
    query="worker-v2 database timeout",
    limit=100,
)

eligible = [
    candidate
    for candidate in candidates
    if candidate.metadata.get("environment") == "production"
    and candidate.metadata.get("status") == "resolved"
]
```

This example is intentionally simplified. Production code must also handle missing fields, types, date boundaries, authorization, and execution status.

Application-side filtering can be useful when a backend lacks an operator or when a small candidate set requires an application-specific condition.

Its major limitation is that filtering cannot recover eligible records that were never retrieved.

Suppose the backend returns 100 candidates and only 4 satisfy the constraints. The system now has 4 eligible candidates from the retrieved set. It does not know that these are the best 4 among all eligible records unless the retrieval strategy provides the necessary guarantee.

The system also cannot conclude that no eligible records exist when the retrieved candidates contain no matches.

Formally, let:

- \(D\) be the full indexed corpus.
- \(F(d)\) be the eligibility predicate for document \(d\).
- \(C(q)\) be the candidate set retrieved for query \(q\).

The eligible corpus is:

\[
D_F = \{d \in D \mid F(d)\}
\]

Application-side filtering produces:

\[
C_F(q) = \{d \in C(q) \mid F(d)\}
\]

Since \(C(q)\) may be only a subset of \(D\):

\[
C_F(q) \subseteq D_F
\]

An empty \(C_F(q)\) therefore does not establish that \(D_F\) is empty.

### 3.3 Hybrid execution

A system may combine several execution strategies:

- A structured database query selects eligible document identifiers.
- A lexical index retrieves textually relevant candidates.
- A vector index retrieves semantically relevant candidates.
- The application combines candidate sets and validates eligibility.
- A later stage ranks or selects results.

This can provide flexibility, but every branch must preserve the intended constraints.

For example, suppose the lexical branch applies the production filter but the dense branch does not. If the results are merged without a final eligibility check, a staging document can enter the candidate set through the dense branch.

The correct engineering response is not to assume that one branch's filter covers the entire pipeline. Constraint propagation and the guarantees of each branch must be explicit.

Detailed candidate combination and fusion behavior belong to the subsequent candidate-generation and fusion chapter. Here, the execution requirement is that each branch and the final combination respect eligibility.

## 4. Filter Execution Guarantees

Before diagnosing individual queries, establish what the retrieval implementation actually guarantees.

### 4.1 Predicate support

A backend may support equality and membership but not every combination of nested logical expressions, date operations, or existence checks.

An application should maintain an explicit mapping between its constraint model and the backend's supported filter language.

A constraint is not correctly executed merely because the backend accepted a request.

For each mandatory predicate, verify that:

1. The field is supported.
2. The operator is supported.
3. The value has the correct type.
4. The logical grouping is preserved.
5. Missing-value behavior is understood.
6. The backend executes the intended condition rather than silently ignoring it.

If a mandatory predicate cannot be represented faithfully, the system must not silently omit it.

### 4.2 Exact versus approximate behavior

A filter can be logically exact while candidate generation remains approximate.

For example, a vector index may enforce a metadata filter correctly on the candidates it considers but still fail to discover the globally nearest eligible vectors because the search is approximate or its exploration budget is insufficient.

These are separate guarantees:

- **Constraint correctness:** returned records satisfy the required predicates.
- **Candidate completeness:** all relevant eligible candidates required by the retrieval contract are discoverable.
- **Ranking quality:** the returned eligible candidates are ordered appropriately.
- **Execution completeness:** the operation completed according to its declared contract.

A system can satisfy one guarantee while failing another.

Do not describe a result set as complete merely because every returned result passed the filter.

### 4.3 Candidate limits and result limits

A result limit and a candidate-generation budget are not necessarily the same thing.

For example:

- Requested output limit: 10.
- Internal candidate exploration budget: 50.
- Final eligible results: 3.

The system may have returned fewer than 10 results because only 3 eligible candidates were discovered within the execution strategy and budget.

Whether that means only 3 eligible records exist depends on the retrieval method and its completeness guarantees.

Operational diagnostics should distinguish, where available:

- Requested result limit.
- Candidate exploration or retrieval budget.
- Number of candidates generated.
- Number of candidates passing constraints.
- Number of results returned.
- Whether the backend exhausted its search procedure or stopped at a budget limit.

These measurements help distinguish data scarcity from search-budget limitations.

## 5. Understanding Empty Results

An empty result is not automatically a defect. It can be the correct outcome of a restrictive but valid request.

The diagnostic task is to identify why the result set is empty and determine whether the behavior satisfies the retrieval contract.

### 5.1 The main categories of empty results

| Category | Explanation | Example |
|---|---|---|
| Genuine absence | No indexed record satisfies all mandatory constraints | No resolved production incident exists for the requested interval |
| Constraint mismatch | The request expresses a different condition from the one intended | `resolved` was requested, but the stored value is `closed` |
| Metadata defect | Required metadata is missing, stale, or incorrectly typed | `environment` is absent from indexed chunks |
| Predicate-construction defect | The application generated an incorrect filter | The lower date boundary was accidentally set after the upper boundary |
| Filter-execution defect | The backend did not execute the intended predicate correctly | A supported filter was omitted from one retrieval branch |
| Candidate-generation limitation | Eligible records exist but were not discovered | Approximate search explored too few candidates |
| Index freshness problem | Recent changes are not reflected in the searched index | An incident was resolved in the source database but the retrieval index still shows it as open |
| Operational failure | Retrieval did not complete successfully | A backend timeout was converted into an empty list |
| Downstream elimination | Candidates were found but later processing removed all of them | A post-retrieval validation step rejects every candidate |

These categories overlap in some systems. The purpose is to establish a diagnostic path, not force every failure into a mutually exclusive classification.

### 5.2 Genuine absence versus failure to discover

Consider a corpus with 10,000 documents, of which 500 satisfy the production constraint and 40 also satisfy the requested time interval and status.

If retrieval returns no results, there are at least two fundamentally different possibilities:

- No documents satisfy the complete filter.
- Eligible documents exist, but the retrieval operation did not find them.

A vector search returning zero results does not prove that the eligible corpus is empty. A filter-aware search may still have limitations involving index state, approximation, supported operators, or execution failures.

To establish genuine absence, use an independent, trustworthy method where available, such as an exact structured count over the authoritative indexed data or a deterministic query against the source of truth.

The verification method must answer the same logical question over the same relevant data snapshot. A count from a different index version or a source database that has not yet synchronized does not establish what the retrieval index contained when the original query ran.

### 5.3 Empty results are not permission to weaken constraints

A common application-level mistake is to respond to an empty result by removing constraints until something is returned.

For example:

1. Search for resolved incidents in production during October.
2. Receive zero results.
3. Remove the date constraint.
4. Receive staging incidents.
5. Present them as if they satisfied the original request.

This changes the meaning of the query.

A system must not silently convert a constrained search into a broader one. If a fallback is allowed, it must be explicit, preserve mandatory constraints, and clearly communicate the change.

For example, the system may offer to search a wider date interval while retaining the production and resolved requirements. It must not remove a mandatory environment or authorization restriction merely to produce a nonempty response.

### 5.4 Empty-result handling as a decision process

A useful diagnostic sequence is:

```text
Retrieval returns no candidates
           |
           v
Did execution complete successfully?
       /           \
     No             Yes
     |               |
Investigate          v
timeout,       Was the intended filter
backend error,   constructed correctly?
or partial       /              \
execution      No                Yes
               |                  |
          Fix predicate           v
                         Are eligible records
                         present in the same
                         index snapshot?
                           /          \
                         No            Yes
                         |              |
                    Genuine absence    v
                              Could candidate generation,
                              filter execution, or
                              downstream processing
                              have removed eligible results?
                                    |
                                    v
                              Inspect the relevant
                              execution stage
```

This is a diagnostic guide rather than a claim that all systems can determine each branch automatically.

If the system lacks the evidence to distinguish the branches, report the uncertainty rather than presenting a guess as fact.

## 6. Diagnosing Over-Filtering

Over-filtering occurs when constraints eliminate records that should have remained eligible.

The problem can originate in user intent interpretation, metadata, predicate construction, execution semantics, or the retrieval architecture.

### 6.1 Inspect constraints incrementally

For a query containing several predicates, a diagnostic process can measure the impact of each condition.

Suppose the complete request requires:

- `environment = production`
- `status = resolved`
- `service = worker-v2`
- `created_at` within October 2026

A diagnostic count sequence might be:

| Diagnostic step | Remaining records |
|---|---:|
| All records in the relevant index snapshot | 100,000 |
| Production | 25,000 |
| Production and resolved | 8,000 |
| Plus worker-v2 | 1,100 |
| Plus October interval | 0 |

This pattern identifies the final date condition as the point at which the count reaches zero. It does **not** prove that the date condition is wrong. There may genuinely be no matching incidents.

The next step is to inspect date field semantics, data coverage, timezone conversion, and the authoritative count for the same interval.

When incremental counts are available, they can identify which predicate first eliminates all records. When they are not available, the system may need a separate diagnostic query or sampled inspection.

Important precautions:

- Keep diagnostic queries scoped to the same tenant and authorization boundary.
- Use the same index snapshot or record the snapshot difference.
- Avoid logging sensitive record values.
- Do not expose counts that reveal the existence of unauthorized records.
- Do not remove mandatory predicates from a live query merely to make it succeed.
- Distinguish diagnostic execution from the original production execution.

### 6.2 Validate field names and schema mappings

A filter can be syntactically valid while referencing the wrong field.

For example, the application may use `environment`, while the indexed payload stores `deployment_environment`.

If the backend treats an absent field as a non-match, the query may return zero results without raising an error.

Useful checks include:

- Comparing the application metadata schema with the indexed schema.
- Verifying field mappings during index creation.
- Inspecting representative indexed records through an authorized diagnostic path.
- Confirming that field names are consistent across lexical, dense, and structured retrieval components.
- Testing both present and missing metadata values.

Schema drift should be detected through deployment validation and index-health checks rather than discovered only through empty user queries.

### 6.3 Validate types and stored values

Metadata types affect comparison behavior.

Potential mismatches include:

- Numeric values stored as strings.
- Timestamps stored in inconsistent formats.
- Status values using different vocabularies.
- Boolean values encoded as text.
- Arrays stored as scalar strings.
- Null values confused with missing fields.

For example, the values `"10"` and `10` are not interchangeable in every backend. Lexical string comparison and numeric comparison can also produce different ordering.

Normalize and validate metadata during ingestion where practical. At query time, reject invalid constraint values or convert them through a defined, tested schema mapping.

Do not rely on implicit backend coercion unless its behavior is documented and covered by tests.

### 6.4 Check logical grouping

A filter can use individually correct predicates but combine them incorrectly.

For example, the intended condition might be:

```text
environment = production
AND status = resolved
AND (service = worker-v2 OR service = worker-v3)
```

A faulty translation could accidentally produce:

```text
(environment = production AND status = resolved AND service = worker-v2)
OR service = worker-v3
```

The second expression permits worker-v3 records regardless of environment or status.

This is not merely a recall problem. It can violate hard constraints and potentially security boundaries.

Use structured predicate representations and test the generated expression tree or backend payload. Avoid constructing nested filter expressions through ambiguous string concatenation.

### 6.5 Investigate missing and null metadata

Missing values, explicit nulls, and empty strings may have different meanings.

For example:

- `environment` does not exist.
- `environment` exists with a null value.
- `environment` is `""`.
- `environment` is `"unknown"`.

A query that excludes explicit nulls may still encounter records where the field is missing, depending on backend semantics.

The application should define what these states mean for each field. If a mandatory constraint requires a known environment, records without trustworthy environment metadata should not be treated as eligible merely because the filter could not evaluate them.

## 7. Date and Time Boundary Diagnostics

Time filters are a common source of unexpected empty or incomplete result sets because the query and stored data may use different time semantics.

This section focuses on diagnosing execution behavior; the structured predicate model and general timestamp conventions belong to the preceding chapter.

### 7.1 Half-open intervals

For October 2026, a calendar-month interval is naturally represented as:

\[
[\text{2026-10-01T00:00:00},\ \text{2026-11-01T00:00:00})
\]

The lower boundary is inclusive; the upper boundary is exclusive.

This avoids guessing the final representable instant of October. The exact timestamps used in a production query must also account for the defined timezone and storage convention.

### 7.2 Common date-filter failures

Investigate:

- An inclusive upper boundary that unintentionally includes the first instant of November.
- An exclusive upper boundary that was accidentally made inclusive.
- A lower bound later than the upper bound.
- A timezone conversion applied twice or omitted.
- Local calendar boundaries interpreted as UTC without conversion.
- Seconds and milliseconds confused.
- Date-only fields compared against timestamp values.
- Timestamp precision differences.
- The wrong field being filtered, such as `updated_at` instead of `resolved_at`.
- An ingestion or indexing delay that leaves recently updated records stale.

A query can return plausible results while still having a boundary defect. Testing only dates far from the boundary is insufficient.

### 7.3 Boundary test cases

For a half-open October interval, tests should include:

| Record timestamp | Expected eligibility for the time condition |
|---|---|
| One instant before October begins | Excluded |
| Exactly at October's start | Included |
| A timestamp within October | Included |
| The last representable timestamp before November begins | Included |
| Exactly at November's start | Excluded |

The precise test values should match the timestamp precision and timezone conventions of the actual system.

If the application converts local calendar intervals to UTC, test the conversion separately from backend filter execution. A correct UTC predicate cannot repair an incorrect interpretation of the requested calendar interval.

## 8. Diagnosing Filter Execution Across Retrieval Branches

Hybrid retrieval systems frequently execute lexical and dense search separately. A filter that is correctly applied to one branch may be missing or interpreted differently in another.

### 8.1 Branch-level constraint parity

Consider a hybrid system:

```text
                     Query + constraints
                              |
                 +------------+------------+
                 |                         |
                 v                         v
           Lexical retrieval          Dense retrieval
                 |                         |
          Filter applied?             Filter applied?
                 |                         |
                 v                         v
          Lexical candidates          Dense candidates
                 |                         |
                 +------------+------------+
                              |
                              v
                    Candidate combination
                              |
                              v
                    Final eligibility check
```

For each branch, verify:

- The complete mandatory constraint set was supplied.
- Every predicate was supported and executed.
- Missing-value and comparison semantics are consistent.
- The branch's result limit and execution status are recorded.
- The final combined candidate set is checked against mandatory eligibility rules.

A final eligibility check is valuable defense-in-depth, but it does not prove that unauthorized records never entered an earlier sensitive processing stage. Security-sensitive constraints must be enforced before data is exposed to components that are not permitted to process it.

### 8.2 Compare branch outcomes

When one branch returns results and another returns none, do not immediately assume that one branch is defective.

Possible explanations include:

- The query has lexical matches but weak semantic similarity.
- The query has semantic matches but no exact lexical matches.
- The branches use different index snapshots.
- The filter payload differs between branches.
- One backend supports a predicate differently.
- One branch timed out or returned partial results.
- Candidate limits or search budgets differ.

Useful diagnostic comparisons include the effective constraints, index versions, execution status, candidate counts, and timing for each branch.

Detailed fusion and duplicate handling are covered in RET-08. The goal here is to establish whether each contributing retrieval operation executed its constraints as intended.

### 8.3 Partial execution

Suppose lexical retrieval succeeds, but dense retrieval times out. Returning lexical results may be a valid degraded-mode decision if the application explicitly permits it.

However, the response must not claim that the complete hybrid retrieval strategy ran successfully.

Record:

- Which branches completed.
- Which branches failed or timed out.
- Whether the response used partial results.
- Which capabilities were unavailable.
- Whether the partial result still satisfies all mandatory constraints.

A failed branch is not equivalent to a successful branch that found no matches.

## 9. Filter Execution and Index Freshness

Correct constraints can still return unexpected results when the index does not reflect the current source data.

### 9.1 Source-of-truth state versus indexed state

A retrieval system may have several representations of the same record:

```text
Source database
      |
      v
Change capture / ingestion
      |
      v
Metadata transformation
      |
      v
Retrieval index
      |
      v
Constrained search
```

An incident may be resolved in the source database while the retrieval index still records it as open.

The filter `status = resolved` then correctly evaluates the indexed representation while disagreeing with the current source of truth.

This is an index freshness problem, not necessarily a filter execution bug.

### 9.2 What to inspect

Useful freshness evidence includes:

- Source record version or update timestamp.
- Ingestion event timestamp.
- Transformation completion status.
- Index write or upsert acknowledgment.
- Indexed record version, where available.
- Index refresh or visibility delay.
- Deletion and tombstone propagation.
- Failed or retried ingestion operations.

The system should define its freshness contract. Examples include bounded indexing delay or read-after-write visibility for specific workflows. A diagnostic cannot classify a record as stale without knowing the expected contract.

### 9.3 Updates to metadata fields

A metadata update can affect eligibility even when the document's textual content does not change.

For example, changing an incident's `environment` from `staging` to `production` can alter which queries should retrieve it.

The ingestion pipeline must ensure that metadata changes update the indexed representation and that stale values do not remain active indefinitely.

If the system stores separate copies of metadata across lexical, dense, and structured indexes, it must also define how consistency between these copies is maintained and verified.

## 10. Query Diagnostics: What to Record

A production retrieval system needs enough evidence to explain unexpected outcomes without exposing sensitive query contents or document data.

Diagnostics should be designed around the execution stages and the guarantees the system intends to provide.

### 10.1 Request-level diagnostics

At the request level, record appropriate fields such as:

- Request or trace identifier.
- Retrieval operation identifier.
- Query-processing version.
- Constraint schema or policy version.
- Retrieval backend and index identifier.
- Index version or freshness marker, where available.
- Requested result limit.
- Execution status.
- Total latency.
- Whether the operation was complete, partial, or degraded.

A request identifier allows engineers to correlate events across query processing, backend calls, and downstream result handling.

### 10.2 Constraint-level diagnostics

Useful constraint diagnostics include:

- Which constraint fields were applied.
- Which supported operator categories were used.
- Whether mandatory predicates passed validation.
- Whether the backend acknowledged the expected filter.
- Whether any optional preference was applied.
- Whether a predicate was rejected or translated through an alternative.
- Which filter-schema version was used.

Avoid logging raw filter values by default when they may contain sensitive user information, private identifiers, or confidential business data.

A safe diagnostic record may identify a field and operator without storing its actual value. If values must be recorded for a controlled investigation, apply an approved access, retention, and redaction policy.

### 10.3 Execution-stage metrics

Where the backend exposes them, collect measurements such as:

| Metric | Diagnostic value |
|---|---|
| Candidate count before application-side filtering | Shows the size of the retrieved candidate set |
| Candidate count after eligibility checks | Shows how many candidates survived those checks |
| Candidate count per retrieval branch | Helps identify branch-specific behavior |
| Requested result limit | Establishes the intended output size |
| Candidate budget or exploration limit | Helps identify search-budget limitations |
| Filter execution latency | Helps identify expensive predicates or backend paths |
| Total retrieval latency | Measures the complete retrieval operation |
| Timeout or error count | Identifies operational failures |
| Index version or freshness lag | Helps identify stale indexed data |
| Empty-result rate | Reveals changes in query outcomes |
| Filter-validation failure rate | Identifies invalid or unsupported requests |

Not every backend exposes every metric. Do not invent unavailable measurements or infer internal candidate counts from final output alone.

### 10.4 Diagnostic events

A useful structured event might look like this:

```json
{
  "event": "retrieval_execution_completed",
  "request_id": "req-example",
  "retrieval_path": "dense",
  "status": "success_empty",
  "filter_schema_version": "v3",
  "mandatory_filter_fields": [
    "environment",
    "status",
    "created_at"
  ],
  "requested_limit": 10,
  "returned_count": 0,
  "duration_ms": 42
}
```

This is an illustrative event schema. The fields should be adapted to the system's actual observability capabilities.

The example intentionally omits raw query text, tenant identifiers, document contents, and sensitive filter values. A real implementation should choose fields based on operational usefulness, privacy requirements, and access controls.

### 10.5 Do not infer more than the metrics show

Suppose the system records:

```text
requested_limit = 10
returned_count = 0
duration_ms = 42
status = success_empty
```

This proves that the application recorded a successful empty outcome and its duration. It does not prove:

- That no eligible documents exist.
- That the index is fresh.
- That the backend explored every eligible candidate.
- That every retrieval branch applied the filter.
- That the query's constraints match the user's intent.

Observability is evidence for diagnosis, not a substitute for understanding execution semantics.

## 11. Query Diagnostics: A Practical Investigation Workflow

Use a repeatable investigation process instead of changing filters until results appear.

### Step 1: Establish the observed failure

Capture the request identifier, query-processing version, retrieval path, execution status, index identifier, and relevant timestamps.

Determine whether the observed symptom is:

- A successful empty result.
- Fewer results than expected.
- Results that violate constraints.
- Excessive latency.
- Partial execution.
- An execution error.

These symptoms require different investigations.

### Step 2: Reconstruct the intended request

Recover the normalized query and structured constraint representation that the application intended to execute.

Confirm:

- Mandatory predicates.
- Optional preferences.
- Date interval semantics.
- Logical grouping.
- Expected field types.
- The intended retrieval paths.

Do not reconstruct the request solely from the final natural-language response. The response may omit information about the actual backend operation.

### Step 3: Inspect the effective backend request

Verify the filter actually submitted to each relevant backend.

Compare the intended constraint representation with the effective backend payload after translation.

Look for:

- Missing predicates.
- Unsupported operators.
- Incorrect field mappings.
- Type conversion errors.
- Changed logical grouping.
- Incorrect boundary values.
- Differences between lexical and dense branches.

If the application cannot expose the effective request safely, improve instrumentation rather than relying on assumptions.

### Step 4: Establish execution status

Check whether each required retrieval operation completed successfully.

Inspect timeouts, retries, cancellations, backend exceptions, and partial results.

A missing result must not be classified as genuine absence when the operation failed before completing.

### Step 5: Check metadata and index state

Use authorized diagnostics to establish whether representative eligible records exist in the relevant index snapshot.

Inspect schema mappings, stored values, ingestion versions, and freshness indicators.

If necessary, compare the retrieval index with an authoritative structured query, accounting for snapshot and synchronization differences.

### Step 6: Isolate the predicate interaction

Where permitted, compare the effects of individual constraints using controlled diagnostic queries.

Identify which predicate or combination causes the result set to become empty or unexpectedly small.

Do not remove tenant or authorization boundaries to conduct this investigation. Diagnostics must preserve the same security scope as the original operation.

### Step 7: Investigate candidate-generation limitations

If eligible records exist but retrieval does not discover them, examine the retrieval method's guarantees, candidate budget, approximate-search behavior, and backend-specific filtering limitations.

Do not assume that increasing the result limit alone will resolve a candidate-generation problem.

### Step 8: Inspect downstream processing

If backend candidates exist but the final response is empty, inspect the intermediate stages that may remove candidates.

Potential causes include:

- Application-side eligibility checks.
- Metadata normalization differences.
- Deduplication.
- Candidate validation.
- Post-retrieval business rules.
- Cancellation or timeout in a later stage.

Record where candidates disappear, not only the final count.

### Step 9: Classify the outcome

Classify the evidence-supported cause, such as:

- Genuine absence.
- Constraint-construction defect.
- Metadata or schema defect.
- Index freshness problem.
- Candidate-generation limitation.
- Backend execution failure.
- Downstream elimination.
- Inconclusive due to insufficient evidence.

An inconclusive classification is preferable to an unsupported diagnosis.

### Step 10: Correct and prevent recurrence

Fix the underlying cause and add a regression test that captures it.

Examples include:

- A date-boundary test.
- A missing-metadata test.
- A filter-translation test.
- A branch-parity test.
- A stale-index test.
- A timeout-state test.
- An authorization-boundary test.

A production incident is not fully resolved when the immediate query returns results again. The relevant failure mode should become testable and observable.

## 12. Common Diagnostic Mistakes

### 12.1 Treating every empty result as genuine absence

**Why it fails:** A failed, incomplete, or approximate retrieval operation may return no candidates even when eligible records exist.

**Better approach:** Verify execution status and retrieval guarantees before classifying the outcome.

### 12.2 Removing filters until results appear

**Why it fails:** This changes the query's eligibility requirements and may expose records that must not be returned.

**Better approach:** Inspect the effective filter and identify the condition responsible for the result. Broaden optional preferences only when the behavior is explicitly permitted. Never weaken mandatory authorization or eligibility constraints silently.

### 12.3 Trusting the requested filter object

**Why it fails:** The application may translate the object incorrectly, or a backend may not support the requested semantics.

**Better approach:** Inspect the effective backend request and test its behavior.

### 12.4 Assuming post-filtering proves complete retrieval

**Why it fails:** Application-side filtering can remove ineligible candidates but cannot recover eligible records that were never retrieved.

**Better approach:** Document the candidate-generation guarantee and distinguish a filtered candidate set from the complete eligible corpus.

### 12.5 Confusing low selectivity with a defect

**Why it fails:** A highly selective filter may legitimately return few or no results.

**Better approach:** Compare the observed count with an authoritative count or a trustworthy baseline over the same scope and data snapshot.

### 12.6 Using only final-result tests

**Why it fails:** Final output may hide incorrect intermediate processing, missing constraints in one branch, or unauthorized data entering downstream components.

**Better approach:** Test filter construction, execution, branch behavior, intermediate eligibility boundaries, and final results as appropriate to the risk.

### 12.7 Logging unrestricted raw queries and metadata

**Why it fails:** Diagnostics can become a source of privacy leakage, credential exposure, or cross-tenant information disclosure.

**Better approach:** Prefer structured, minimized telemetry; redact sensitive values; enforce access controls and retention limits.

### 12.8 Treating retries as a universal fix

**Why it fails:** Retrying a deterministic schema or predicate error does not correct it. Repeated expensive queries can also increase load during an incident.

**Better approach:** Retry only appropriate transient failures, within bounded deadlines and budgets. Preserve the distinction between retries, partial execution, and a successful empty result.

### 12.9 Reporting false precision

**Why it fails:** The system may know that zero candidates were returned without knowing whether the eligible corpus is empty.

**Better approach:** State what was observed and what remains unknown. Do not claim completeness without evidence.

## 13. Testing Filter Execution and Diagnostics

Tests should validate not only whether a query returns results, but whether the system preserves constraints and classifies outcomes correctly.

### 13.1 Predicate-construction tests

Verify that the application generates the expected constraint representation for:

- Equality and membership conditions.
- Multiple mandatory predicates.
- Nested AND/OR expressions.
- Inclusive and exclusive boundaries.
- Missing or invalid values.
- Unsupported operators.
- Optional preferences.
- Conflicting or contradictory constraints.

Where the application translates predicates to a backend-specific representation, test that translation separately.

### 13.2 Execution contract tests

Against the chosen backend or a suitable integration-test environment, verify:

- Supported predicates are applied as intended.
- Unsupported mandatory predicates do not silently disappear.
- Records violating hard constraints are not returned.
- Result limits are honored according to the backend contract.
- Empty successful execution differs from errors and timeouts.
- Partial execution is represented accurately.
- Relevant index freshness behavior matches the documented contract.

Mocked tests are useful for deterministic application behavior but cannot establish backend execution guarantees by themselves.

### 13.3 Empty-result tests

Build fixtures that exercise distinct causes of empty results:

1. No record satisfies the complete predicate.
2. Records exist but none match a mandatory metadata condition.
3. Records exist in the source but have not yet appeared in the index.
4. A predicate references an unsupported field or operator.
5. Candidate generation returns no eligible candidates despite known eligible records elsewhere in the index.
6. A backend operation times out.
7. Candidates are found but downstream validation removes them all.

The expected outcomes should distinguish legitimate emptiness, invalid requests, execution failures, and incomplete discovery.

### 13.4 Security-boundary tests

For tenant-scoped or access-controlled retrieval, verify:

- The trusted authorization scope is applied before sensitive processing.
- User-provided constraints cannot broaden the trusted scope.
- Model-generated filter values cannot override mandatory constraints.
- Every retrieval branch enforces the required boundary.
- Ineligible records cannot enter unauthorized model context or sensitive downstream processing.
- Diagnostic queries and telemetry preserve the same security protections.

Final-result assertions alone are insufficient to prove that sensitive records were never exposed at an intermediate stage.

### 13.5 Diagnostic correctness tests

Test the diagnostic state independently from result content.

For example:

- A successful query with zero results is classified as successful and empty.
- A timeout is classified as a timeout, not a successful empty result.
- A failed hybrid branch produces a partial or failed state according to the documented contract.
- A filter-validation error records the appropriate failure reason.
- Candidate counts are not fabricated when the backend does not expose them.
- Sensitive values are not written into logs contrary to the telemetry policy.

### 13.6 Regression tests from incidents

For every confirmed production defect, add a minimal regression case that reproduces the relevant behavior.

A useful regression test specifies:

- The intended query and constraints.
- The relevant index or fixture state.
- The execution method.
- The expected status.
- The expected eligibility behavior.
- The diagnostic evidence required to distinguish success from failure.

Keep tests focused on the failure mechanism. Do not create a large number of near-duplicate tests that all prove the same predicate behavior.

## 14. Operational Metrics and Alerting

Observability becomes more useful when measurements are interpreted against a baseline and an explicit service contract.

### 14.1 Empty-result rate

A rising empty-result rate can indicate:

- A legitimate change in query distribution.
- An ingestion or indexing problem.
- Metadata schema drift.
- A filter-generation regression.
- An incorrect deployment.
- A change in retrieval behavior.

The rate alone cannot identify which explanation is correct.

Segment analysis by appropriate dimensions such as retrieval path, index version, query-processing version, or constraint category. Avoid labels that create unbounded metric cardinality or expose sensitive values.

### 14.2 Filter-validation failures

A sudden increase may indicate:

- A client began sending invalid filters.
- A query parser changed its output.
- A model began producing unsupported predicates.
- An application deployment introduced a schema mismatch.
- A backend capability changed.

Validation failures should be observable without recording unrestricted user input.

### 14.3 Latency and timeout rates

Complex filters, low-selectivity conditions, backend contention, and index maintenance can affect latency. However, latency alone does not establish that a particular filter is inefficient.

Compare:

- Total retrieval latency.
- Backend execution latency.
- Filter-related latency where available.
- Candidate-generation duration.
- Timeout and cancellation rates.
- Index freshness and backend health.

Use controlled tests and backend-specific diagnostics to establish the actual cause.

### 14.4 Alert design

An alert should identify an actionable deviation from an established baseline or service-level objective.

Examples include:

- A sustained rise in retrieval timeouts.
- A sudden increase in invalid-filter errors after a deployment.
- A drop in indexing freshness beyond the defined contract.
- A sharp change in empty-result rates for a stable, monitored workload.
- Evidence that a required constraint is missing from a retrieval path.

An alert should direct engineers toward evidence and a defined investigation process. It should not imply that every unusual metric represents a confirmed correctness defect.

## 15. Practical Engineering Exercise

### Scenario

A production incident-search system supports the following request:

> Find incidents involving worker-v2 database timeouts that were resolved in production during October 2026. Prefer incidents resolved most recently.

The system returns zero results. Engineers know that the source incident database contains matching incidents.

Your task is to determine why the retrieval operation is empty without weakening the request's mandatory constraints.

### Required investigation

**1. Reconstruct the intended query.**

Write down the text query, mandatory constraints, optional preference, date interval semantics, and intended retrieval branches.

**2. Establish the execution state.**

Determine whether each required retrieval operation completed successfully or returned partial results.

**3. Inspect the effective filter.**

Compare the intended constraints with the backend request. Verify field mappings, types, operators, and logical grouping.

**4. Verify index state.**

Determine whether the known incidents are present in the same index and snapshot used by the failing retrieval operation.

**5. Isolate the failure.**

Use authorized diagnostics to determine whether the issue originates in metadata, date boundaries, filter translation, index freshness, candidate generation, or downstream elimination.

**6. Propose a correction.**

Describe the smallest correction that addresses the confirmed cause while preserving all mandatory constraints.

**7. Design regression coverage.**

Specify tests that would have caught the defect and tests that would prevent a future regression.

### Evidence requirements

For every important conclusion, record:

| Item | Required evidence |
|---|---|
| Intended behavior | The normalized request and mandatory constraints |
| Observed behavior | Execution status, counts where available, and relevant timestamps |
| Suspected cause | Evidence supporting the diagnosis |
| Verified cause | A reproducible failure or authoritative observation |
| Correction | The specific behavior changed |
| Regression protection | A test that reproduces the original defect |
| Remaining limitation | Any uncertainty about completeness, approximation, or freshness |

Do not claim that the eligible corpus is empty based only on a zero-result vector query. Do not claim that retrieval is complete based only on the fact that returned candidates pass the filters.

### Deliverable

Produce a concise incident investigation report containing:

- A description of the failure.
- The expected and observed behavior.
- The diagnostic sequence.
- The confirmed root cause, or an explicit statement that the cause remains unconfirmed.
- The correction and regression tests.
- Any remaining retrieval guarantees or limitations.

The goal is not merely to make the query return results. The goal is to establish why it failed and prove that the correction preserves the retrieval contract.

## 16. Completion Criteria

This chapter is complete when an engineer can:

- Explain the distinction between a successful empty result and an execution failure.
- Distinguish filter correctness from candidate completeness and ranking quality.
- Explain why post-filtering cannot recover candidates that were never retrieved.
- Diagnose over-filtering caused by schema, types, logical grouping, date boundaries, or missing metadata.
- Investigate differences between lexical and dense retrieval branches.
- Recognize index freshness as a possible cause of unexpected filter results.
- Design diagnostics that reveal execution behavior without unnecessarily exposing sensitive data.
- Build tests for predicate construction, execution state, empty results, and security boundaries.
- Explain why silently removing constraints is not a valid empty-result recovery strategy.
- Communicate uncertainty without claiming that retrieval is complete when the available evidence does not establish completeness.

## 17. Relationship to the Retrieval Engineering Domain

This chapter builds on the preceding RET-07 chapter, **Metadata Filters and Structured Constraints**, which defines how structured constraints represent eligibility requirements and how they interact with retrieval.

It prepares the engineer for later retrieval topics:

- **RET-08 — Candidate Generation, Fusion, and Deduplication:** how independently retrieved candidate sets are combined and how candidate coverage is affected.
- **RET-09 — Ranking and Reranking:** how eligible candidates are ordered by relevance.
- **RET-10 — Retrieval Evaluation:** how retrieval behavior and quality are measured systematically.
- **RET-11 — Retrieval Diagnostics and Observability:** how broader retrieval failures, latency, and quality regressions are investigated.
- **RET-12 — Retrieval Integration:** how retrieval components are assembled into a dependable system.

The boundaries matter. This chapter establishes how to reason about filter execution and its observable outcomes. It does not attempt to define the full fusion algorithm, ranking methodology, evaluation framework, or enterprise authorization governance model.

## Conclusion

Reliable constrained retrieval requires more than constructing a valid predicate. The system must preserve the predicate through execution, distinguish empty results from incomplete or failed operations, expose sufficient diagnostic evidence, and test the behavior that matters in production.

The essential engineering discipline is to separate three questions:

1. **Eligibility:** Which records are allowed to qualify?
2. **Execution:** What did the retrieval system actually evaluate and return?
3. **Evidence:** What can the observed execution legitimately establish?

When these questions remain distinct, engineers can diagnose empty results without silently changing query meaning, confusing approximate search with exact absence, or weakening mandatory constraints to make a system appear successful.
