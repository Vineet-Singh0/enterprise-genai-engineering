# Vector Search Tuning and Dense Retrieval Diagnostics

## Purpose

Dense retrieval can return poor results even when the embedding model, vector database, and ANN algorithm appear to be configured correctly. Diagnosing these failures requires separating representation problems from indexing and search-execution problems before changing parameters.

This chapter provides a systematic approach to diagnosing and tuning dense vector retrieval. It focuses on interpreting retrieval symptoms, comparing approximate search with an exact-search reference, selecting the appropriate tuning layer, and validating changes against relevance, latency, and resource constraints.

This chapter does not replace embedding-compatibility guidance, ANN algorithm foundations, formal retrieval evaluation, or general retrieval diagnostics. Those topics belong to their respective chapters.

## Learning Objectives

After completing this chapter, you should be able to:

- Diagnose common dense retrieval failures from observable evidence.
- Distinguish representation and scoring problems from index and search-execution problems.
- Use exact search as a diagnostic reference for approximate nearest-neighbor retrieval.
- Distinguish index-construction parameters from query-time search parameters.
- Explain the roles and trade-offs of search depth, candidate counts, approximation settings, and candidate refinement.
- Investigate the relationship between retrieval quality, latency, and resource consumption.
- Apply controlled changes and inspect their effects without confusing correlation with causation.
- Build a repeatable diagnostic workflow for dense retrieval failures.

## Prerequisites

Understand the following concepts before applying the workflow:

- [Dense Retrieval and Embedding Compatibility](01-Dense-Retrieval-and-Embedding-Compatibility.md)
- [Exact Search, Approximate Search, and ANN](02-Exact-Search-Approximate-Search-and-ANN.md)

The first chapter explains representation compatibility. The second explains exact search, approximate search, and the foundations of ANN indexes. This chapter applies those concepts to operational diagnosis and tuning.

---

## 1. Start With the Observed Failure, Not a Parameter

A poor retrieval result is an observation, not a diagnosis.

For example, a relevant document may be missing from the results. Several explanations are possible:

- The document representation does not capture the intended meaning.
- The query and document vectors are incompatible.
- The configured similarity function does not match the intended scoring semantics.
- The document vector is missing from the active index.
- Approximate search does not explore enough of the index.
- Search-time filtering excludes the document.
- The requested result depth is insufficient.
- A later retrieval or application stage removes the document.

Changing ANN parameters before distinguishing these possibilities can increase latency without addressing the underlying failure.

### 1.1 Classify the symptom

| Observed symptom | Plausible causes | Initial investigation |
|---|---|---|
| Relevant documents are consistently ranked poorly by exact and approximate search | Representation, scoring, or corpus problem | Inspect query/document compatibility, vector construction, and similarity semantics |
| Exact search finds a relevant document, but ANN search misses it | Approximation, index construction, or inconsistent execution | Verify equivalent inputs and constraints, then investigate the ANN index |
| Results change unexpectedly after data updates | Missing or stale vectors, index synchronization, or changed corpus state | Verify that expected vectors exist in the active searchable collection |
| Results are plausible but omit relevant candidates | Search depth, filtering, representation, or result-depth issue | Inspect candidates, filters, and exact-search results |
| Latency is too high while results appear reasonable | Excessive search effort, large candidate sets, index layout, or resource contention | Measure the search path and identify the dominant cost |
| Similarity scores look high, but results are not useful | Representation mismatch, score misinterpretation, or unsuitable similarity semantics | Inspect actual candidate content and verify the scoring configuration |
| Results differ between supposedly identical tests | Different data snapshots, filters, parameters, concurrency, or nondeterministic execution | Compare the complete execution configuration |

These are hypotheses, not one-to-one mappings. A symptom can have several causes, and a single cause can produce multiple symptoms.

### 1.2 Establish the retrieval contract

Before tuning, record the conditions under which the failure occurs:

- Query text and the exact query vector used, when available.
- Embedding model and relevant preprocessing configuration.
- Corpus or collection snapshot.
- Active index version and index configuration.
- Similarity function and score direction.
- Metadata filters and eligibility constraints.
- Requested result depth.
- Query-time search parameters.
- Observed candidates, scores, and latency.

This baseline helps ensure that comparisons reflect the intended change rather than differences in inputs or execution conditions.

---

## 2. Separate Representation Problems From Search-Execution Problems

The most important early decision is whether the search system is finding the right neighbors according to the configured vector space.

### 2.1 Representation and scoring failures

A representation problem exists when the vectors or scoring semantics fail to express the intended relationship.

Examples include:

- Query and document vectors were produced using incompatible models or configurations.
- The query and document pipelines apply inconsistent preprocessing.
- The configured similarity function does not match the intended comparison.
- The embedding model does not adequately represent a domain-specific distinction.
- The document content or metadata used to construct the vector omits important information.

Increasing ANN search effort does not correct these problems. It may help the system retrieve more neighbors, but those neighbors are still determined by the underlying vector representation and scoring function.

Use the compatibility and representation procedures in File 01 rather than duplicating them here.

### 2.2 Index and search-execution failures

A search-execution problem occurs when the intended representation and scoring configuration are reasonable, but the system fails to retrieve the expected candidates or spends excessive resources doing so.

Possible causes include:

- The expected document vector is absent from the active searchable collection.
- The index is stale or has not incorporated the expected update.
- The index structure does not provide the desired search-quality and resource trade-off.
- Query-time exploration is too limited.
- The search is restricted by filters or eligibility constraints.
- The requested result depth is too small for the intended downstream operation.
- Candidate refinement is insufficient for the required distance accuracy.

Verify data availability and execution consistency before attributing every missing candidate to ANN approximation.

### 2.3 A practical distinction

Suppose exact search and ANN search both return the same poor candidates.

That observation weakens the hypothesis that ANN exploration alone is responsible. Investigate representation, scoring, the indexed corpus, and the query constraints.

Suppose exact search returns a relevant document while ANN search misses it under otherwise equivalent conditions.

That observation provides stronger evidence of an index or approximation issue. It does not automatically prove that query-time exploration is the cause: index construction, filtering behavior, and execution consistency must still be checked.

---

## 3. Use Exact Search as a Diagnostic Reference

Exact search evaluates the configured distance or similarity calculation across the eligible indexed vectors. It can therefore provide a reference for investigating the omissions introduced by approximate search.

Exact search is a diagnostic reference, not an independent measure of semantic relevance. If the representation is poor, exact search can efficiently return poor neighbors.

### 3.1 Make the comparison valid

For a meaningful exact-versus-ANN comparison, keep the following consistent:

- The query vector and its embedding configuration.
- The searchable corpus or collection snapshot.
- The similarity function and score interpretation.
- The metadata filters and eligibility constraints.
- The requested result depth.
- Any other retrieval conditions that affect candidate eligibility.

If these differ, observed result differences may not be caused by approximation.

### 3.2 Compare the candidate sets

Consider an illustrative query for which the expected document is present in the searchable corpus.

| Rank | Exact search | ANN search |
|---|---|---|
| 1 | Document A | Document A |
| 2 | Document B | Document B |
| 3 | Document C | Document F |
| 4 | Document D | Document G |
| 5 | Document E | Document H |

The table shows a possible discrepancy, not a benchmark result. The important question is which candidates ANN failed to recover and whether the discrepancy matters to the application.

Investigate in this order:

1. Verify that the missing documents have vectors in the active collection.
2. Confirm that both searches use the same query vector, scoring configuration, and eligibility constraints.
3. Inspect whether the relevant documents appear in the exact-search result at the same requested depth.
4. If exact search consistently retrieves the missing candidates, investigate the ANN index and its search configuration.
5. If the candidates are also absent from exact search, return to representation, scoring, corpus, and filtering diagnosis.

### 3.3 Interpret discrepancies carefully

A difference between exact and approximate results does not automatically indicate a production defect.

The relevant question is whether the approximation error violates the application's retrieval requirements.

For example, a small difference among near-equivalent candidates may have little practical impact. Missing the only document that supports an answer may be much more consequential.

Use the exact-search comparison to locate the likely failure layer. Use representative application queries and relevance judgments to determine whether the difference is acceptable.

Formal metric selection and benchmark design belong to RET-10.

---

## 4. Understand the Tuning Layers

Vector retrieval parameters operate at different stages. Choosing the wrong layer can waste resources or force an unnecessary index rebuild.

### 4.1 Index-construction parameters

Construction parameters influence how the searchable index is built. Their effects depend on the index family and implementation.

Examples include:

| Index family | Example parameter | General role |
|---|---|---|
| HNSW | `M` | Controls graph connectivity during index construction |
| HNSW | `ef_construction` | Controls construction-time search effort used when building the graph |
| IVF | `nlist` | Controls the number of coarse partitions or clusters |

Construction choices can affect index quality, memory requirements, build time, and the search effort needed to achieve a target retrieval quality.

They are not interchangeable with query-time settings. A poorly constructed index may have structural limitations that cannot be fully compensated for by increasing query-time exploration.

Depending on the implementation, changing a construction parameter may require rebuilding or retraining the index. That introduces operational costs, including compute, memory, build time, and index replacement or synchronization.

### 4.2 Query-time search parameters

Query-time parameters control how the existing index is searched.

Examples include:

| Index family | Example parameter | General role |
|---|---|---|
| HNSW | `ef_search` or an equivalent setting | Controls search-time exploration effort |
| IVF | `nprobe` or an equivalent setting | Controls how many coarse partitions are examined |

Increasing query-time search effort can recover candidates missed by a cheaper approximate search, but it generally increases computation and may increase latency.

The exact relationship depends on the implementation, data distribution, index structure, filtering behavior, and workload. More search effort does not guarantee a proportional improvement in retrieval quality.

Parameter names and semantics vary across libraries and vector databases. Treat these names as illustrative rather than universal API contracts.

### 4.3 Candidate depth and refinement

Two additional controls are easy to confuse with index construction or query-time exploration.

**Candidate depth** determines how many results or intermediate candidates are requested at a particular stage. Its meaning depends on where it is applied. Asking the database for more final results is not necessarily equivalent to increasing ANN exploration.

**Candidate refinement** may recompute distances for retained approximate candidates using higher-precision or original vectors. This can improve the ordering of candidates already retrieved. It generally cannot recover a candidate that the ANN stage never returned.

The operational question is not simply whether to increase a number. It is which stage is failing and which control affects that stage.

### 4.4 Decide which layer to investigate

| Evidence | More appropriate next investigation |
|---|---|
| Expected document is absent from the searchable collection | Data ingestion, vector presence, and index freshness |
| Exact search and ANN both return poor candidates | Representation, scoring, corpus, and constraints |
| Exact search finds a relevant candidate, but ANN misses it | ANN index construction and query-time exploration |
| Relevant candidates are retrieved, but their ordering is inaccurate | Similarity semantics and candidate refinement |
| The required results are excluded by eligibility conditions | Filter and constraint behavior |
| Search quality is acceptable, but latency is too high | Query-time effort, index structure, workload, and resource costs |

This table guides the investigation; it does not eliminate the need to verify the underlying evidence.

### 4.5 Avoid changing multiple tuning layers at once

Suppose an engineer simultaneously increases HNSW construction connectivity, increases query-time exploration, and doubles the requested candidate count.

If retrieval improves, the cause remains unclear. If latency increases, it is also difficult to attribute the cost to one change.

Prefer this sequence:

1. Establish a reproducible baseline.
2. State a specific hypothesis about the failing stage.
3. Change one relevant parameter or one tightly related configuration.
4. Repeat the same diagnostic comparison.
5. Record quality, latency, and resource effects.
6. Keep, revert, or investigate the change based on the evidence.

If a construction-time change is warranted, treat it as a separate index-build experiment with its own operational cost and validation.

---

## 5. Tune Against an Explicit Constraint

A tuning decision should respond to a concrete failure or operational constraint, not to a desire to maximize every parameter.

### 5.1 ANN misses candidates found by exact search

**Likely investigation:** Confirm equivalent inputs and constraints, verify that expected vectors exist, then examine the index structure and query-time exploration.

**Potential action:** Increase search-time exploration within a controlled experiment. If the index still cannot meet the requirement at an acceptable cost, investigate whether its construction settings or index design are suitable.

**Trade-off:** More search effort can increase latency and resource consumption. Construction changes can add build and memory costs.

### 5.2 Relevant candidates are present, but the ordering is poor

**Likely investigation:** Confirm the scoring function and inspect whether the relevant documents are actually present in the candidate set.

If the candidates are present but incorrectly ordered, investigate score semantics and whether approximate distances need refinement.

If a relevant candidate is missing entirely, changing refinement alone is unlikely to solve the problem.

**Trade-off:** Higher-precision distance computation may add CPU or memory-bandwidth cost. It cannot repair incompatible embeddings or recover candidates discarded earlier in the search.

### 5.3 Latency exceeds the requirement

**Likely investigation:** Identify which part of retrieval consumes the time. Separate vector search from filtering, network overhead, serialization, and downstream processing where those components exist.

Then investigate whether the current search effort, index design, candidate depth, or resource allocation is responsible.

**Potential action:** Reduce unnecessary search effort, adjust the index design, or revisit the required candidate depth only after understanding the relevance impact.

**Trade-off:** A faster configuration may omit useful candidates. The target is an acceptable quality-cost balance, not the lowest possible latency in isolation.

### 5.4 Similarity scores are high, but results are unhelpful

**Likely investigation:** Inspect the actual documents and verify the representation and scoring configuration. Similarity scores express relationships under a configured vector-space calculation; they are not universal confidence scores or guarantees of task relevance.

**Potential action:** Correct a representation or scoring issue before increasing search effort.

**Trade-off:** A more exhaustive search cannot make a poorly defined vector-space relationship semantically correct.

### 5.5 Results differ after an index update

**Likely investigation:** Verify that the intended vectors are present in the active searchable index and that the compared runs use equivalent corpus snapshots, filters, and configurations.

**Potential action:** Correct an ingestion, synchronization, or index-update problem before tuning search parameters.

**Trade-off:** Rebuilding or refreshing an index can consume significant resources and may require coordination with live traffic. The appropriate procedure depends on the database's consistency and index-management model.

---

## 6. A Repeatable Diagnostic Workflow

Use this workflow when investigating a dense retrieval failure.

1. **Reproduce the symptom.** Record the query, expected behavior, observed candidates, and relevant configuration.
2. **Verify the data.** Confirm that expected document vectors exist in the active searchable collection.
3. **Verify compatibility and scoring.** Check the query/document representation and configured similarity semantics using File 01's guidance.
4. **Verify execution equivalence.** Ensure the comparison uses the same query vector, corpus snapshot, filters, and result depth.
5. **Compare with exact search.** Determine whether the expected candidates appear in the exact-search reference.
6. **Locate the failing stage.** Distinguish representation, data/index state, ANN approximation, candidate depth, and candidate refinement.
7. **State a testable hypothesis.** Explain what you expect to change and why.
8. **Change one relevant control.** Choose a query-time setting, construction setting, or other control appropriate to the diagnosed stage.
9. **Repeat the same comparison.** Inspect candidate differences and record latency and resource effects.
10. **Decide based on evidence.** Keep the change, revert it, or continue the investigation. If a construction change is required, account for rebuild or retraining implications.
11. **Check for regressions.** Revisit representative queries and previously working retrieval cases before accepting the configuration.

In compact form:

**Reproduce → Verify data and scoring → Compare exact vs. ANN → Locate failure stage → State hypothesis → Change one control → Recheck quality and cost → Validate regressions**

This is a practical troubleshooting sequence, not a substitute for the formal evaluation and benchmark methodology defined in RET-10.

---

## 7. Worked Investigation: HNSW Misses an Expected Candidate

### Scenario

An application uses HNSW for dense retrieval. A query should retrieve a particular document, but that document is absent from the ANN results.

The engineer initially suspects that query-time exploration is too limited.

That is a plausible hypothesis, but it is not yet established.

### Step 1: Establish the baseline

Record the query vector, active collection, index configuration, filters, requested result depth, query-time settings, observed results, and latency.

The same inputs and constraints must be used for the exact-search comparison.

### Step 2: Verify the candidate exists

Confirm that the expected document's vector is present in the active searchable collection.

If the vector is absent, increasing ANN exploration cannot retrieve it. Investigate ingestion or index-update behavior instead.

Assume the vector is present.

### Step 3: Compare with exact search

Run exact search under equivalent conditions.

Suppose exact search retrieves the expected document, while ANN search does not.

This narrows the investigation toward index state, ANN approximation, or differences in execution. It does not yet prove that the query-time setting is too low.

### Step 4: State the hypothesis

After verifying index state and equivalent search conditions, the engineer hypothesizes that the current HNSW search effort is insufficient to recover the expected candidate.

The hypothesis predicts that increasing the relevant query-time exploration setting may recover the candidate, with some additional latency or resource cost.

### Step 5: Change one query-time setting

Increase the implementation's supported HNSW search-time exploration setting. Do not simultaneously change graph connectivity, rebuild the index, or alter the requested candidate depth.

Use a controlled value appropriate to the system and workload; there is no universally correct setting.

### Step 6: Inspect the result

Repeat the same query and exact-search comparison.

- If the expected candidate appears and latency remains acceptable, the hypothesis gains support.
- If the candidate remains absent, investigate other explanations, including index construction, filter behavior, and implementation-specific constraints.
- If the candidate appears but latency becomes unacceptable, investigate whether a different index configuration or search strategy offers a better trade-off.

No numerical improvement should be assumed until it is measured.

### Step 7: Consider construction-time changes only when justified

If query-time tuning cannot meet the retrieval requirement at an acceptable cost, investigate the HNSW construction configuration and index design.

A construction-time change may improve the structure available to future searches, but it can require rebuilding the index and consuming additional memory or build resources. Validate the resulting index independently before replacing the existing configuration.

### Engineering lesson

A missing ANN candidate is evidence of a retrieval discrepancy, not proof of one particular parameter problem. Exact search narrows the possibilities; controlled changes test hypotheses; measured quality and cost determine whether the change is useful.

---

## 8. Controlled Changes and Regression Checks

A tuning change is not complete merely because one query improves.

Record enough information to understand and reproduce the outcome.

| Record | Why it matters |
|---|---|
| Query and query-vector configuration | Establishes the retrieval input |
| Corpus snapshot and index version | Makes data and index state explicit |
| Similarity function and filters | Ensures equivalent eligibility and scoring |
| Index-construction settings | Identifies the structure being searched |
| Query-time search settings | Identifies the runtime exploration configuration |
| Requested result and candidate depths | Clarifies which retrieval stage was changed |
| Candidate IDs and scores | Shows what changed in the returned results |
| Latency and relevant resource observations | Exposes operational costs |
| Hypothesis and change made | Connects the intervention to the expected effect |
| Regression observations | Reveals whether other retrieval cases deteriorated |

For each change, answer:

1. What specific failure did the change target?
2. What result did the hypothesis predict?
3. Did the expected candidate set change?
4. What happened to latency and resource use?
5. Did previously working queries regress?
6. Is the result sufficient to justify the operational cost?

Use a representative set of diagnostic queries rather than relying exclusively on one successful example. This is not a formal benchmark-design exercise; it is a safeguard against accepting an obviously narrow improvement that damages other known cases.

If a construction-time change requires rebuilding the index, record the old and new configurations and validate the replacement index before relying on it in production.

---

## 9. Common Tuning Mistakes

### Increasing search effort before verifying the representation

This adds cost without correcting an incompatible or inadequate vector representation.

### Treating every exact-versus-ANN difference as a defect

Approximation introduces differences by design. Investigate whether the differences violate the application's retrieval requirements.

### Assuming query-time tuning can compensate for any index problem

Query-time exploration cannot recover missing vectors, bypass incompatible scoring, or guarantee that an unsuitable index structure meets the required quality-cost balance.

### Confusing final result depth with ANN exploration

Requesting more returned results and exploring more of an ANN index are different operations. Confirm which stage a parameter controls.

### Using candidate refinement to recover missing candidates

Refinement can improve distance calculations for retained candidates. It generally cannot recover candidates excluded before refinement.

### Changing multiple parameter categories together

Changing index construction, query-time search, and candidate depth simultaneously makes the result difficult to explain and the operational cost difficult to attribute.

### Optimizing latency without checking retrieval behavior

A faster search that consistently omits important candidates may not satisfy the application's requirements.

### Treating similarity scores as relevance guarantees

A score is meaningful only in the context of the configured representation and scoring function. Inspect the retrieved content and the task requirements.

---

## 10. Key Takeaways

- Diagnose the observed failure before changing parameters.
- Separate representation and scoring problems from index and search-execution problems.
- Verify that expected vectors exist in the active searchable collection.
- Use exact search as a reference under equivalent data, scoring, and filtering conditions.
- Distinguish index-construction parameters from query-time search parameters.
- Recognize that construction-time changes may require rebuilding or retraining the index.
- Treat candidate depth and candidate refinement as distinct controls.
- Change one relevant control at a time when testing a hypothesis.
- Evaluate retrieval behavior alongside latency and resource consumption.
- Validate the change against representative queries before accepting it.

## Further Reading

- [Dense Retrieval and Embedding Compatibility](01-Dense-Retrieval-and-Embedding-Compatibility.md)
- [Exact Search, Approximate Search, and ANN](02-Exact-Search-Approximate-Search-and-ANN.md)
- [FAISS documentation](https://github.com/facebookresearch/faiss)
- [hnswlib documentation](https://github.com/nmslib/hnswlib)
- [ScaNN repository](https://github.com/google-research/google-research/tree/master/scann)

Implementation documentation should be consulted before applying specific parameter names or assumptions to a production index. Parameter semantics, supported operations, and index-update behavior vary by system.
