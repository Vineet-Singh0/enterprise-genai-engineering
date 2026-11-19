# Index Design and Engineering Trade-offs

## 1. Why Index Design Is a Workload Decision

An index structure should be selected according to the retrieval workload it must support, not simply because a database or framework provides it.

Different workloads impose different requirements. A catalog search system may prioritize structured filtering and predictable latency. A document retrieval system may need to balance candidate relevance, metadata constraints, update frequency, and corpus size. A frequently changing knowledge base may place greater importance on update visibility and maintenance cost than a mostly static collection.

No single index design is optimal across every workload.

Index design translates retrieval requirements into decisions about searchable representations, index structures, query execution, resource consumption, and lifecycle behavior. The underlying representations and index structures are covered in [01 — Searchable Representations and Index Structures](01-Searchable-Representations-and-Index-Structures.md); their construction and maintenance are covered in [02 — Index Lifecycle, Freshness, and Consistency](02-Index-Lifecycle-Freshness-and-Consistency.md).

This chapter focuses on selecting and evaluating designs under real engineering constraints.

## 2. Define the Retrieval Workload

Index selection should begin with a workload specification. Without one, engineers risk optimizing an isolated benchmark rather than the system's actual requirements.

| Dimension | Questions to answer | Design implications |
|---|---|---|
| Query semantics | Are queries based on exact terms, structured attributes, semantic similarity, or combinations? | Determines which retrieval mechanisms are appropriate. |
| Corpus characteristics | How many records and retrieval units exist, how are they distributed, and how quickly will the corpus grow? | Affects storage, index construction, search behavior, and scaling requirements. |
| Query workload | What are the average and peak query rates, concurrency levels, and query distributions? | Influences capacity requirements and latency under load. |
| Update workload | How often are records added, modified, replaced, or deleted? | Affects maintenance cost, freshness, and publication requirements. |
| Filtering requirements | Which conditions are mandatory, and how selective are they individually and in combination? | Influences filter placement, candidate availability, and query execution. |
| Relevance requirements | What makes a result relevant, and how will retrieval quality be evaluated? | Determines quality metrics, evaluation data, and acceptable error rates. |
| Latency requirements | What response-time objectives apply at typical and peak load? | Constrains candidate generation, query execution, and downstream processing. |
| Resource constraints | What storage, memory, compute, and operational budgets are available? | Limits the feasible design space. |

These dimensions interact. A restrictive filter may reduce the eligible population while also making it harder for a candidate-generation mechanism to return enough eligible results. Frequent updates may increase maintenance work and compete with query processing for resources. A larger corpus may increase storage and construction cost without necessarily increasing query latency in a predictable way.

The initial goal is to identify which workload characteristics materially constrain the design and which requirements can be traded against one another.

### 2.1 Separate Mandatory Constraints from Preferences

Not all requirements have equal status.

A mandatory tenant-isolation rule, access restriction, or eligibility condition defines which records may be returned. A relevance preference affects how eligible records are prioritized.

A candidate design that violates a mandatory constraint is not acceptable merely because it is faster or produces a higher relevance score on an unconstrained benchmark.

Design selection must therefore separate:

- **Correctness and security constraints:** Conditions that must always hold.
- **Service objectives:** Targets such as latency, freshness, and throughput.
- **Quality objectives:** Desired candidate coverage and relevance.
- **Resource and maintenance budgets:** Limits on operational cost and complexity.

This classification establishes which candidates are feasible before performance comparisons begin.

## 3. Match Index Design to Query Requirements

Different query requirements call for different retrieval mechanisms. Selection should follow query semantics, correctness requirements, and the expected workload.

### 3.1 Exact and Structured Retrieval

Exact identifiers, equality conditions, ranges, and structured attributes often require mechanisms that preserve predictable matching behavior.

Examples include:

- Retrieving a record by its stable identifier.
- Filtering products by price range.
- Selecting documents by tenant, access scope, or content type.
- Restricting candidates to records satisfying mandatory eligibility rules.

The design must distinguish eligibility from relevance. A record that violates an access requirement must not become eligible merely because it receives a high relevance score.

Filtering also interacts with candidate generation. Consider a corpus containing many records but only a small number eligible under a mandatory filter. Retrieving a fixed number of candidates from the unrestricted corpus and filtering afterward may leave too few eligible results, even when relevant eligible records exist elsewhere.

Possible approaches include:

- **Filter during candidate generation:** Restrict candidate discovery to eligible records where the retrieval mechanism supports this behavior.
- **Retrieve candidates, then filter:** Generate a broader candidate set and discard ineligible results before returning them.
- **Combine filtering strategies:** Apply some constraints during retrieval and enforce remaining constraints before results are returned.

No approach is universally superior. The choice depends on filter selectivity, available index capabilities, candidate coverage requirements, query cost, and correctness guarantees. Post-filtering must not be allowed to violate mandatory constraints in returned results. Pre-filtering must not be assumed efficient or supported for every retrieval mechanism.

**Security boundary:** Retrieval filters do not replace authoritative authorization checks. If access depends on tenant membership, permissions, or changing security policies, the system must enforce authorization before exposing results. A search filter alone is insufficient when it can be bypassed, applied inconsistently, or evaluated against stale permissions.

For structured queries, evaluate actual combinations of filters rather than assuming that individually efficient attribute lookups will make every combined query efficient.

### 3.2 Term-Based Retrieval

Term-based retrieval is appropriate when matching depends on term occurrence, term statistics, or lexical relationships. It can support searches where identifiable words, phrases, and identifiers matter.

Design choices depend on query semantics, normalization, corpus characteristics, and expected matching behavior.

Detailed lexical ranking and sparse-retrieval algorithms belong to RET-05. At the RET-04 design level, the important questions are whether term-oriented retrieval fits the workload and what quality, latency, and maintenance constraints it must satisfy.

### 3.3 Semantic Retrieval

Semantic retrieval is useful when relevant content may express an idea without sharing the query's exact words. Its design depends on the representation model, candidate-retrieval mechanism, filtering requirements, and quality targets.

Relevant considerations include:

- Representation-generation cost.
- Storage for required representations.
- Query-time computation.
- Candidate coverage and relevance.
- Model and representation compatibility.
- Behavior when the corpus or representation model changes.

Detailed dense-retrieval and vector-search mechanisms belong to RET-06. Here, the design question is whether semantic retrieval improves the target workload enough to justify its additional costs and constraints.

### 3.4 Combined Retrieval

Some workloads benefit from combining multiple retrieval mechanisms. A system may combine lexical and semantic candidates before ranking them, or use structured constraints alongside relevance-based retrieval.

A combined design introduces three separate decisions.

**Candidate merging:** Candidates from different retrieval paths may overlap. The system needs a defined policy for deduplication, identity resolution, and candidate-budget allocation.

**Relevance comparison:** Scores from different mechanisms may have different scales and meanings. Directly comparing them can produce misleading rankings. Possible approaches include calibrated score combination, rank-based fusion, or passing merged candidates to a shared downstream ranker. The appropriate choice depends on the available relevance signals and evaluation evidence.

**Incremental contribution:** Each retrieval path should demonstrate value relative to a single-path baseline. A second path may improve recall while adding latency and complexity; it may also contribute mostly duplicate candidates without improving the final results.

A hybrid design should therefore be evaluated against the strongest appropriate single-path baselines using the same workload and relevance criteria. Evaluate both the merged candidate set and the final ranked results.

**Engineering principle:** Add another retrieval mechanism only when its measured contribution justifies its additional cost and complexity.

## 4. Evaluate the Main Engineering Trade-offs

Index selection is a constrained optimization problem. Improving one property may worsen another, so decisions must be evaluated against explicit requirements.

| Trade-off | Engineering consideration |
|---|---|
| Query latency vs. resource consumption | Lower latency may require more memory, additional compute, or precomputed structures. |
| Candidate coverage vs. query cost | Broader candidate discovery may find more relevant records while increasing computation and downstream processing. |
| Ranking quality vs. candidate quality | A ranker can reorder retrieved candidates but cannot recover relevant records that candidate generation omitted. |
| Update freshness vs. maintenance cost | More frequent updates may reduce staleness while increasing write and coordination overhead. |
| Storage vs. search performance | Additional representations or auxiliary structures consume storage but may reduce query work. |
| Filtering efficiency vs. candidate availability | Restrictive constraints can reduce the eligible population and leave too few results if retrieval and filtering are poorly coordinated. |
| Simplicity vs. specialized optimization | A simpler design may be easier to operate, while specialized structures may better serve a narrowly defined workload. |
| Build speed vs. query readiness | Faster construction is useful only if the resulting index satisfies correctness and searchability requirements. |

Three quality concepts should remain distinct throughout design and evaluation:

- **Candidate coverage:** Whether relevant records enter the candidate set.
- **Ranking quality:** Whether relevant candidates are ordered appropriately.
- **End-to-end retrieval quality:** Whether the final returned results satisfy the application's relevance requirements.

These concepts can be measured using different metrics. For example, Recall@k can evaluate candidate coverage when the relevance judgments and retrieval task support that interpretation. NDCG@k can evaluate the ordering of results when graded relevance judgments are available. End-to-end evaluation should use the actual production constraints and ranking stages, including filtering and candidate merging.

These metrics are examples, not universal requirements. Select metrics that reflect the application's definition of relevance and the decisions the evaluation must support.

These distinctions help identify the actual bottleneck. Poor end-to-end results may originate in candidate generation, ranking, filtering, or their interaction. Changing the ranking mechanism alone will not solve a candidate-coverage problem.

Trade-offs should be evaluated using representative data and query patterns. A design that performs well on a small development corpus may behave differently at scale, under restrictive filters, or during concurrent updates. Average-load performance also does not establish acceptable behavior during traffic spikes.

## 5. Establish a Decision and Evaluation Process

A defensible index design follows a repeatable process.

### Step 1: Establish requirements

Define supported query patterns, mandatory constraints, corpus characteristics, update behavior, quality objectives, latency targets, and resource limits.

Specify which requirements are hard constraints and which are optimization objectives. Do not allow performance gains to compensate for correctness or security violations.

### Step 2: Identify feasible candidates

Select candidate designs capable of satisfying the mandatory requirements.

Reject infeasible candidates before expensive benchmarking. Document unsupported query patterns, incompatible consistency requirements, and other known limitations.

### Step 3: Define a representative evaluation workload

Use a representative corpus and query set, including realistic filter distributions, query frequencies, and update patterns. Include difficult cases, not only common or easy queries.

Where relevance quality matters, define relevance judgments or another defensible evaluation method. The evaluation data must be suitable for the intended application; a convenient dataset is not automatically representative.

For combined retrieval, include the relevant single-path baselines so the incremental contribution of each retrieval mechanism can be measured.

### Step 4: Control comparison conditions

Compare candidates under equivalent conditions wherever possible:

- Use the same corpus, queries, relevance criteria, and mandatory constraints.
- Apply comparable workload and concurrency levels.
- Document hardware, resource allocation, configuration, and warm-up conditions.
- Separate index construction and maintenance measurements from query-serving measurements.
- Repeat measurements sufficiently to distinguish stable behavior from noise.

If a difference in conditions is unavoidable, document it and account for its effect when interpreting the results.

### Step 5: Measure the relevant dimensions

Depending on the workload, evaluate:

- Candidate coverage and ranking quality.
- End-to-end retrieval quality.
- Query latency, including relevant tail percentiles such as p95 and p99.
- Throughput and behavior under concurrent load.
- Index construction and update duration.
- Freshness and publication delay.
- Storage, memory, and compute consumption.
- Recovery behavior after interrupted operations.

No single metric establishes that a design is superior. Quality, latency, and resource usage must be interpreted together against the application's requirements.

### Step 6: Apply acceptance criteria

First, confirm that each candidate satisfies all mandatory correctness, security, and workload constraints.

Then compare the feasible candidates against the quality objectives, service targets, resource budgets, and maintenance requirements. If no candidate satisfies the requirements, revisit the design space or negotiate explicit changes to the objectives. Do not silently weaken a mandatory constraint to make a benchmark pass.

### Step 7: Document the decision

Record the chosen design, alternatives considered, evaluation conditions, results, known limitations, and conditions that would justify reevaluation.

A useful decision record allows another engineer to understand not only what was selected, but why it was selected and which assumptions support that decision.

## 6. Design for Change

An index design is not a permanent answer. Corpus size, query distribution, product requirements, and update patterns can change.

A design suitable for a small, mostly static corpus may become expensive under frequent updates. A mechanism selected for broad candidate coverage may become too costly as query volume grows. New filtering requirements may invalidate earlier performance assumptions.

Define reevaluation triggers such as:

- Sustained violations of latency or freshness targets.
- Growth beyond the evaluated corpus range.
- Material changes in query or filter distribution.
- Storage or compute costs exceeding the accepted budget.
- Declining retrieval quality against the evaluation set.
- New correctness, isolation, or deletion requirements.

Reevaluation should be evidence-driven. A new technology or index structure is not automatically an improvement; it must solve a demonstrated limitation without introducing unacceptable regressions.

## 7. Practical Exercise: Write an Index Design Decision Record

Choose a retrieval workload and compare at least two feasible index designs.

Document:

1. The workload, query patterns, corpus characteristics, and mandatory constraints.
2. The candidate designs and the requirements each can or cannot satisfy.
3. Expected trade-offs in candidate coverage, ranking quality, latency, freshness, storage, and maintenance cost.
4. The evaluation dataset, relevance methodology, workload conditions, and baselines needed for a fair comparison.
5. The acceptance criteria and evidence required to select a design.
6. The chosen design, rejected alternatives, known limitations, and reevaluation triggers.

**Completion criterion:** You can justify an index design using workload requirements and comparable evaluation evidence, distinguish candidate-generation limitations from ranking limitations, explain the major trade-offs, and identify the conditions under which the decision should change.

## Further Reading

- [01 — Searchable Representations and Index Structures](01-Searchable-Representations-and-Index-Structures.md)
- [02 — Index Lifecycle, Freshness, and Consistency](02-Index-Lifecycle-Freshness-and-Consistency.md)
- [RET-02 — Document Ingestion and Retrieval-Oriented Processing](../RET-02-Document-Ingestion-and-Retrieval-Oriented-Processing/README.md)
- [RET-03 — Chunking and Document Structure](../RET-03-Chunking-and-Document-Structure/README.md)
- [RET-05 — Lexical Retrieval and Sparse Search](../RET-05-Lexical-Retrieval-and-Sparse-Search/README.md)
- [RET-06 — Dense Retrieval and Vector Search](../RET-06-Dense-Retrieval-and-Vector-Search/README.md)
