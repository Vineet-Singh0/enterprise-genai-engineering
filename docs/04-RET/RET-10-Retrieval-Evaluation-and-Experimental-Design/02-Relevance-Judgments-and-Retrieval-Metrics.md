# RET-10.02 — Relevance Judgments and Retrieval Metrics

## 1. Why Relevance Judgments Matter

A retrieval system produces an ordered list of documents, but the ordering alone does not establish whether the retrieved information satisfies the user's information need.

Retrieval evaluation therefore requires a reference against which retrieved results can be assessed.

A **relevance judgment** records how useful a particular document is for a particular query under a defined evaluation context.

Relevance is not an intrinsic property of a document. The same document may be highly relevant to one query and irrelevant to another. Judgments must therefore be associated with query-document pairs rather than documents in isolation.

Consider the query:

> Find the company's current parental leave policy for employees in India.

A document describing a general parental leave policy may be topically relevant. However, a policy applicable only to employees in another country may not satisfy the query's geographic requirement.

This illustrates an important distinction: topical similarity does not necessarily establish task relevance.

RET-10.01 defines evaluation questions and test queries. This file defines how relevance is judged and how retrieval quality is measured against those judgments.

## 2. Define a Relevance Judgment Rubric

A relevance rubric establishes consistent criteria for deciding whether a retrieved document satisfies an evaluation query.

A useful rubric defines:

- **Evaluation context:** The information need and intended task represented by the query.
- **Relevance criteria:** What makes a document useful, partially useful, or irrelevant.
- **Judgment scale:** Whether relevance is binary or graded.
- **Constraint handling:** How explicit query requirements affect the judgment.
- **Evidence requirements:** What an assessor must inspect before assigning a grade.
- **Assessment boundaries:** What information an assessor may use and what assumptions are prohibited.

A rubric must be designed around the application. Relevance labels should not be treated as universal classifications that work identically across domains.

### 2.1 Binary Relevance

Binary relevance classifies a result as either relevant or non-relevant.

| Grade | Meaning |
|---|---|
| 0 | Non-relevant |
| 1 | Relevant |

Binary judgments are appropriate when the evaluation task has a clear acceptance criterion.

For example, a document either contains the requested product's current warranty conditions or does not.

Binary judgments are straightforward to aggregate, but they cannot represent differences in usefulness among relevant results.

### 2.2 Graded Relevance

Graded relevance represents different levels of usefulness.

An illustrative four-level rubric is:

| Grade | Interpretation |
|---|---|
| 0 | Not relevant |
| 1 | Marginally relevant; provides limited supporting information |
| 2 | Relevant; substantially satisfies the information need |
| 3 | Highly relevant; directly and comprehensively satisfies the information need |

The exact interpretation must be documented for the application.

For example, in an enterprise policy search system:

- Grade 0: Unrelated policy or incorrect subject.
- Grade 1: Mentions the requested topic but provides little useful information.
- Grade 2: Contains applicable information but does not fully answer the query.
- Grade 3: Directly provides the applicable policy and satisfies the requested scope.

Graded relevance is useful when the system should prioritize more useful results rather than merely retrieve documents that cross a minimum relevance threshold.

### 2.3 Converting Graded Judgments into Binary Relevance

Precision, Recall, MRR, and conventional MAP use binary relevance.

When the underlying judgments are graded, the evaluation configuration must define a binary relevance threshold.

For example:

| Graded judgment | Binary relevance at threshold 1 | Binary relevance at threshold 2 |
|---:|---:|---:|
| 0 | 0 | 0 |
| 1 | 1 | 0 |
| 2 | 1 | 1 |
| 3 | 1 | 1 |

Under threshold 1, marginally relevant documents count as relevant. Under threshold 2, only documents that substantially satisfy the information need count as relevant.

Neither threshold is universally correct. The choice depends on the task's acceptance criteria.

The threshold must be:

- Defined before evaluating system results.
- Applied consistently across compared systems.
- Stored in the metric configuration.
- Reported alongside binary metrics.

Changing the threshold changes the relevant-document set and can change Precision, Recall, MRR, and MAP.

Do not silently convert graded judgments into binary labels using an undocumented rule.

### 2.4 Relevance and Explicit Constraints

A rubric must distinguish between topical relevance and satisfaction of mandatory constraints.

For example, a query may require:

- A specific tenant.
- A particular geographic jurisdiction.
- A document type.
- A valid publication period.
- A required access scope.

A document may be topically relevant but still fail a mandatory requirement.

For evaluation, define whether a constraint violation makes the result ineligible or assigns it a non-relevant grade. Record constraint correctness separately so that a high relevance score cannot hide a violation.

Security and authorization constraints must be enforced independently of relevance scoring. A document from another tenant must not become acceptable merely because it is semantically relevant.

## 3. Construct Reliable Relevance Judgments

Relevance judgments are reference data. Their quality directly affects the credibility of retrieval metrics.

### 3.1 Human Judgments

Human assessors can interpret context, ambiguity, and nuanced information needs.

A reliable assessment process should include:

1. A documented relevance rubric.
2. Consistent assessor instructions.
3. Access to the evidence required for judgment.
4. Independent judgments where appropriate.
5. Disagreement identification.
6. Adjudication for unresolved disagreements.
7. Versioned judgment records.

Independent assessment helps reveal ambiguity in the rubric and differences in interpretation.

For graded judgments, disagreement between adjacent grades may be less significant than disagreement between relevant and non-relevant classifications. The evaluation process should define how disagreements are assessed rather than treating all disagreements as equivalent.

Agreement statistics can help quantify consistency. Select an agreement measure appropriate to the number of assessors and the judgment scale. For example, weighted agreement measures may be appropriate for ordered relevance grades.

However, high assessor agreement does not prove that the rubric represents the actual business requirement. Consistency and validity are separate concerns.

### 3.2 Model-Assisted and Automated Judgments

Automated assessment can increase judgment throughput, but it introduces additional assumptions.

Three judgment sources should be distinguished:

| Method | Characteristics | Main concern |
|---|---|---|
| Human assessment | Contextual interpretation by people | Cost and assessor inconsistency |
| Model-assisted assessment | Model proposes judgments that may be reviewed by humans | Model bias and reviewer dependence |
| Fully automated assessment | A model or rule assigns judgments without human confirmation | Unverified systematic errors |

An automated judge may favor particular writing styles, reproduce the behavior of the retrieval model being evaluated, or incorrectly interpret domain-specific constraints.

When using model-assisted or automated judgments, record:

- Judge model and version.
- Prompt or assessment instruction version.
- Input evidence.
- Judgment scale.
- Assessment timestamp.
- Human review status, where applicable.

For high-impact evaluations, use independently verified human judgments for a representative portion of the assessment set and investigate disagreements.

Do not assume that an LLM-generated judgment is ground truth.

### 3.3 Judgment Records and Provenance

A judgment record should contain sufficient information to reproduce and interpret the assessment.

A practical logical structure is:

| Field | Purpose |
|---|---|
| query_id | Identifies the evaluation query |
| document_id | Identifies the assessed document |
| relevance_grade | Stores the assigned grade |
| rubric_version | Identifies the assessment criteria |
| assessor_id | Identifies the assessor or assessment process |
| assessment_method | Human, model-assisted, or automated |
| evidence_reference | Identifies the evidence used |
| judgment_timestamp | Records when the judgment was made |
| adjudication_status | Records whether disagreement was resolved |

The judgment dataset should also identify its version, scope, and completeness characteristics.

Stable query and document identifiers are essential. A change to document content, corpus state, or rubric should not silently overwrite the historical meaning of an existing judgment.

## 4. Unjudged Documents and Judgment Coverage

An unjudged document is not automatically non-relevant.

It means the evaluation process has not established its relevance.

A judgment dataset should preserve at least three states:

| State | Meaning | Binary relevance available? |
|---|---|---|
| Judged relevant | Assessor established relevance | Yes |
| Judged non-relevant | Assessor established non-relevance | Yes |
| Unjudged | Relevance has not been established | No |

The third state must not be silently converted into either of the first two.

### 4.1 Judgment Pooling

A common approach is to construct a judgment pool.

Documents retrieved by selected retrieval systems are collected, deduplicated, and presented for relevance assessment.

For example:

- System A contributes its top 20 results.
- System B contributes its top 20 results.
- System C contributes its top 20 results.
- Duplicate document identities are removed.
- The remaining documents are assessed against the evaluation queries.

Pooling makes judgment construction more manageable, but it has an important limitation: documents not retrieved by the contributing systems may remain unjudged.

Consequently, the judgment pool may favor documents discovered by the systems used to construct it.

### 4.2 Pooling Bias and Incomplete Coverage

Suppose System A retrieves a relevant document that is absent from the judgment pool.

If the document is treated as non-relevant, the evaluation may incorrectly penalize System A.

If it is excluded from metric calculations, the evaluation may still fail to capture the full relevance distribution.

Judgment coverage must therefore be measured and reported.

For an evaluated query and cutoff K:

\[
JudgmentCoverage@K =
\frac{\text{Judged results in top K}}
{\text{Returned results in top K}}
\]

A judged result includes either a judged-relevant or judged-non-relevant document. An unjudged result does not count as judged.

If no results are returned, report coverage as not applicable rather than dividing by zero.

This metric measures how much of the evaluated result list has known judgments. It does not measure how many relevant documents exist in the entire corpus.

A high JudgmentCoverage@K also does not prove that every relevant document in the corpus has been discovered.

### 4.3 Operational Policies for Incomplete Judgments

Metric calculations require an explicit policy for unjudged results.

Three approaches are useful in different circumstances.

**Policy A — Complete judgments for the evaluated result set**

Obtain judgments for every document required by the evaluation cutoff before calculating the metric.

This is the preferred approach when the evaluation requires strong, interpretable comparisons.

For example, if comparing Precision@10, ensure that all returned documents in the top 10 for each evaluated query have judgments.

This avoids treating unknown relevance as a known outcome.

**Policy B — Conservative treatment of unjudged results**

For binary ranking metrics, an evaluation may conservatively treat unjudged documents as non-relevant while preserving their original ranking positions.

This must be explicitly labeled as a conservative, incomplete-judgment policy.

Its limitations differ by metric:

- Precision may be underestimated because an unjudged document could actually be relevant.
- MRR, AP, and nDCG may also be underestimated because unjudged documents receive no relevance gain.
- Recall calculated against only the known relevant-document set is not necessarily a lower bound on true corpus recall. Missing relevant documents may be absent from the denominator, causing recall to appear higher than it would with complete judgments.

Therefore, conservative treatment does not make every metric a mathematically valid lower bound on the true metric.

**Policy C — Judged-only calculations**

An evaluation may calculate a metric using only judged results.

For example, judged-only precision can be defined as:

\[
P@K_{\text{judged}} =
\frac{\text{Judged relevant results in top K}}
{\text{Judged results in top K}}
\]

This answers:

**Among the judged results in the evaluated positions, what proportion is relevant?**

It does not answer the same question as conventional Precision@K. Removing unjudged results from the denominator can inflate the score.

For ranking-sensitive calculations, removing unjudged results must not silently shift the original ranking positions. Any judged-only ranking variant requires its own precise definition and should not be presented as an ordinary metric without qualification.

**Recommended engineering rule:** Prefer complete judgments for the evaluated ranking depth. If judgments are incomplete, preserve the three-state judgment information, report JudgmentCoverage@K, identify the chosen calculation policy, and qualify the metric interpretation.

Do not compare scores calculated under different unjudged-document policies as if they were directly equivalent.

## 5. Retrieval Metrics

Metrics answer different evaluation questions. No single metric describes every aspect of retrieval quality.

Let:

- \(Q\) be the evaluation query set.
- \(R_q\) be the ordered retrieved results for query \(q\).
- \(Rel_q\) be the set of known relevant documents for query \(q\).
- \(rel_i\) be the binary relevance indicator at rank \(i\).
- \(g_i\) be the graded relevance at rank \(i\).
- \(K\) be the evaluation cutoff.

For binary relevance:

\[
rel_i =
\begin{cases}
1 & \text{if the document is relevant}\\
0 & \text{if the document is non-relevant}
\end{cases}
\]

An unjudged document does not have a valid binary relevance value. Its treatment depends on the explicitly selected incomplete-judgment policy.

### 5.1 Precision@K

Precision@K measures the proportion of the first K evaluated positions occupied by relevant results.

Under the conventional fixed-denominator policy:

\[
Precision@K =
\frac{\text{Relevant results in top K}}{K}
\]

It answers:

**How much of the returned top-K result list is relevant?**

The fixed-denominator policy uses K even when fewer than K documents are returned. Missing positions are effectively treated as non-relevant.

An alternative actual-returned-count convention is:

\[
Precision@K_{\text{actual}} =
\frac{\text{Relevant results in top K}}
{\min(K,\text{number of returned results})}
\]

These conventions can produce different scores. Choose one explicitly, apply it consistently, and report it with the metric.

For complete-judgment evaluation, all evaluated positions must have known judgments. For incomplete judgments, follow Section 4.3 and report the selected policy.

Precision@K is useful when irrelevant results create user effort or operational cost.

### 5.2 Recall@K

Recall@K measures the proportion of known relevant documents retrieved within the first K positions.

\[
Recall@K =
\frac{\text{Relevant results in top K}}
{\text{Total known relevant documents}}
\]

It answers:

**How much of the known relevant information did the system retrieve?**

Recall depends on the completeness of the known relevant-document set.

If relevant documents remain undiscovered or unjudged, the denominator may be incomplete. The resulting value should be described as recall against the known judgment set, not guaranteed corpus-wide recall.

For queries with no known relevant documents, the ordinary formula is undefined. Define an explicit eligibility policy rather than silently assigning a score.

### 5.3 Mean Reciprocal Rank (MRR)

Reciprocal Rank measures the inverse position of the first relevant result.

\[
RR(q) =
\frac{1}{rank_{\text{first relevant}}}
\]

MRR averages reciprocal rank across the evaluation queries:

\[
MRR =
\frac{1}{|Q|}
\sum_{q \in Q} RR(q)
\]

It answers:

**How quickly does the user encounter the first relevant result?**

MRR must specify its evaluation boundary.

Two common conventions are:

**Full evaluated-ranking MRR:** Search for the first relevant result within the full evaluated ranking depth.

**MRR@K:** Search only within the first K positions.

For MRR@K:

\[
RR@K(q) =
\begin{cases}
\frac{1}{r_q} & r_q \leq K\\
0 & \text{otherwise}
\end{cases}
\]

where \(r_q\) is the rank of the first relevant result.

If the first relevant result occurs at rank K+1, MRR@K assigns zero even though a relevant result exists later.

For a query with no relevant result within the evaluated boundary, reciprocal rank is zero.

Queries known to have no relevant answer are a different evaluation category. They should be handled through an explicitly defined no-answer evaluation rather than automatically mixed into an MRR population intended to measure answerable queries.

The query population and the evaluation depth must be reported.

MRR is useful when the primary objective is to surface one useful result quickly. It does not adequately describe the quality of all subsequent relevant results.

### 5.4 Mean Average Precision (MAP)

Average Precision measures the precision achieved at each rank containing a relevant document.

\[
AP(q) =
\frac{
\sum_{k=1}^{N} Precision@k \cdot rel_k
}{
|Rel_q|
}
\]

MAP is the mean Average Precision across eligible evaluation queries.

\[
MAP =
\frac{1}{|Q_{\text{eligible}}|}
\sum_{q \in Q_{\text{eligible}}} AP(q)
\]

It answers:

**How effectively are relevant documents distributed throughout the ranking?**

MAP uses binary relevance judgments. If the source judgments are graded, the binary relevance threshold from Section 2.3 must be applied first.

For a query with at least one known relevant document, AP can be calculated using the selected evaluation ranking depth. Relevant documents beyond that depth remain in the denominator when the evaluation uses the complete known relevant set.

For a query with zero known relevant documents, the ordinary AP formula has a zero denominator.

The conventional policy is to exclude such queries from MAP aggregation and report their count separately.

This policy must not be confused with excluding queries that contain relevant documents but whose relevant results were not retrieved. Those queries remain eligible and receive AP = 0.

### 5.5 Normalized Discounted Cumulative Gain (nDCG@K)

nDCG evaluates ranked results using graded relevance and discounts results appearing at lower ranks.

A commonly used gain function is:

\[
gain(rel_i)=2^{rel_i}-1
\]

Discounted Cumulative Gain is:

\[
DCG@K =
\sum_{i=1}^{K}
\frac{2^{rel_i}-1}{\log_2(i+1)}
\]

The ideal ranking places documents in descending relevance order.

\[
nDCG@K =
\frac{DCG@K}{IDCG@K}
\]

Here, IDCG is the DCG of the ideal ordering for the same query and judgment set.

It answers:

**How closely does the actual ranking match the ideal ordering by graded relevance?**

The gain function and discount function are evaluation choices, not universal constants. Different gain mappings can produce different nDCG values.

If IDCG is zero because no documents have positive relevance, nDCG is undefined under the ordinary formula. Define an explicit policy, such as reporting the query separately.

nDCG is particularly useful when the difference between marginally relevant and highly relevant results matters.

## 6. Understand What Each Metric Actually Measures

Metric selection must follow the retrieval requirement.

| Evaluation objective | Suitable metric |
|---|---|
| Relevant results among the first K positions | Precision@K |
| Coverage of known relevant documents | Recall@K |
| Position of the first relevant result | MRR or MRR@K |
| Distribution of relevant results throughout the ranking | MAP |
| Ordering quality with graded relevance | nDCG@K |

These metrics are not interchangeable.

A system can improve MRR without improving Recall@K. A system can improve Recall@K while reducing Precision@K. A system can achieve similar binary relevance scores while producing substantially different graded rankings.

### 6.1 ANN Recall Is Not Relevance Recall

These two concepts are fundamentally different.

**ANN Recall** evaluates how closely approximate nearest-neighbor search reproduces the results of an exact-search reference under a defined comparison setup.

**Relevance Recall** evaluates how many known relevant documents are retrieved.

A vector index can achieve high ANN Recall while retrieving semantically irrelevant documents because the embedding space or query representation does not adequately capture the information need.

Conversely, an approximate search system may miss some exact nearest neighbors while still retrieving useful relevant documents.

ANN behavior and dense retrieval diagnostics belong to RET-06. Relevance Recall belongs to retrieval evaluation.

### 6.2 Candidate Recall Is Not Final-Ranking Quality

Candidate Recall asks whether relevant documents entered the candidate set.

Final-ranking metrics ask whether relevant documents appear in useful positions in the final ordered results.

A reranker cannot recover a relevant document that candidate generation never retrieved.

Candidate generation and candidate coverage mechanisms belong to RET-08. Ranking and reranking mechanisms belong to RET-09. This file defines how their outcomes are evaluated.

### 6.3 Relevance Is Not Constraint Correctness

A semantically relevant document may violate a mandatory condition.

For example, a document from another tenant may directly answer a query but must never be returned.

Track constraint correctness separately from relevance metrics. Hard constraints such as tenant isolation and authorization must be enforced by the system independently of relevance ranking.

### 6.4 Retrieval Quality Is Not Complete RAG Quality

Retrieval metrics evaluate the retrieval stage.

They do not independently establish that a downstream RAG system produces:

- Factually correct answers.
- Properly grounded answers.
- Complete answers.
- Correct citations.
- Safe responses.
- Useful responses for the intended task.

A retrieval evaluation can demonstrate that relevant evidence was retrieved. It cannot, by itself, prove that the generation stage used that evidence correctly.

Downstream answer quality requires its own evaluation criteria.

## 7. Worked Example — Calculate and Interpret Retrieval Metrics

Consider one query with three known relevant documents:

| Document | Relevance grade |
|---|---:|
| D1 | 3 |
| D2 | 2 |
| D3 | 1 |

The remaining documents are judged non-relevant.

**Worked-example assumptions:**

- Every document appearing in either system's evaluated ranking has a known judgment.
- There are no unjudged results.
- The binary relevance threshold is grade 1.
- All three known relevant documents are included in the judgment set.
- The Precision denominator uses the fixed K convention.
- The ranking cutoff for Precision, Recall, and nDCG is K = 3.
- AP uses the full displayed ranking depth of five positions and the complete known relevant-document denominator.

Compare two systems:

| Rank | System A | Grade | System B | Grade |
|---:|---|---:|---|---:|
| 1 | D1 | 3 | D2 | 2 |
| 2 | X1 | 0 | D3 | 1 |
| 3 | D2 | 2 | X2 | 0 |
| 4 | D3 | 1 | D1 | 3 |
| 5 | X3 | 0 | X3 | 0 |

### 7.1 Precision@3

System A:

\[
P@3 = \frac{2}{3} = 0.667
\]

System B:

\[
P@3 = \frac{2}{3} = 0.667
\]

Both systems retrieve two relevant documents in their first three positions.

### 7.2 Recall@3

There are three known relevant documents.

System A:

\[
Recall@3 = \frac{2}{3} = 0.667
\]

System B:

\[
Recall@3 = \frac{2}{3} = 0.667
\]

Both retrieve two of the three known relevant documents.

### 7.3 MRR

Both systems return a relevant result at rank 1.

\[
MRR_A = 1
\]

\[
MRR_B = 1
\]

MRR cannot distinguish the systems in this example.

### 7.4 Average Precision

For System A, relevant documents occur at ranks 1, 3, and 4.

\[
AP_A =
\frac{1 + \frac{2}{3} + \frac{3}{4}}{3}
= 0.806
\]

For System B, relevant documents occur at ranks 1, 2, and 4.

\[
AP_B =
\frac{1 + 1 + \frac{3}{4}}{3}
= 0.917
\]

System B has higher Average Precision because its relevant documents are more concentrated near the beginning of the ranking.

### 7.5 nDCG@3

The ideal ordering is D1, D2, D3, with grades 3, 2, and 1.

\[
IDCG@3 =
7 + \frac{3}{\log_2 3} + \frac{1}{\log_2 4}
\]

\[
IDCG@3 \approx 9.393
\]

System A has grades 3, 0, and 2:

\[
DCG_A@3 =
7 + 0 + \frac{3}{\log_2 4}
= 8.5
\]

\[
nDCG_A@3 \approx 0.905
\]

System B has grades 2, 1, and 0:

\[
DCG_B@3 =
3 + \frac{1}{\log_2 3} + 0
\approx 3.631
\]

\[
nDCG_B@3 \approx 0.387
\]

System A has substantially higher nDCG because it places the most useful document first.

### 7.6 Interpret the Results

| Metric | System A | System B | Better result |
|---|---:|---:|---|
| Precision@3 | 0.667 | 0.667 | Equal |
| Recall@3 | 0.667 | 0.667 | Equal |
| MRR | 1.000 | 1.000 | Equal |
| AP | 0.806 | 0.917 | B |
| nDCG@3 | 0.905 | 0.387 | A |

This example demonstrates why reporting a single metric is dangerous.

System B places more binary-relevant results near the top, improving AP. However, System A places the highly relevant document first, resulting in substantially better nDCG.

The correct choice depends on the application requirement.

If the user needs one highly useful result immediately, System A may be preferable. If the goal is to retrieve a broader set of relevant documents early, System B's ranking may deserve further investigation.

Neither conclusion should be made without considering the actual business objective.

## 8. Metric Configuration and Reproducibility Contract

A metric result is not fully specified by its name alone.

For example, reporting Precision@5 without its evaluation configuration is insufficient to establish exactly what was calculated.

Every evaluation should preserve a metric configuration containing:

| Configuration field | Purpose |
|---|---|
| metric_name | Precision, Recall, MRR, MAP, nDCG, or another metric |
| cutoff | Evaluation depth, where applicable |
| relevance_rubric_version | Identifies the judgment criteria |
| binary_relevance_threshold | Defines the graded-to-binary conversion, where required |
| gain_function | Defines how graded relevance contributes to gain |
| discount_function | Defines rank-position discounting |
| short_result_policy | Defines handling of fewer than K results |
| unjudged_policy | Defines complete, conservative, or judged-only evaluation |
| zero_relevant_query_policy | Defines eligibility and handling of zero-denominator cases |
| aggregation_policy | Defines macro or justified weighted aggregation |
| judgment_set_version | Identifies the exact judgment dataset |
| evaluation_population | Identifies the query population |
| evaluation_depth | Identifies the retrieved ranking depth |

A reproducible metric record should also preserve the resulting per-query scores and the aggregate result.

The same configuration must be used when comparing systems unless a deliberate evaluation change is being studied.

Changing a threshold, cutoff, judgment set, or unjudged-document policy changes the meaning of the result.

This configuration contract establishes the requirements for RET-10.04's reproducible benchmark and report.

## 9. Aggregate and Interpret Evaluation Results

Metrics are calculated per query and then aggregated across the evaluation set.

A common approach is macro averaging:

\[
MacroMetric =
\frac{1}{|Q_{\text{eligible}}|}
\sum_{q \in Q_{\text{eligible}}} Metric(q)
\]

Macro averaging gives each eligible query equal weight.

Other aggregation approaches may weight queries differently, for example by query frequency or business importance.

These are different evaluation objectives:

- **Workload weighting** represents how frequently query types occur in the actual workload.
- **Business-priority weighting** emphasizes the consequences or importance of particular query types.

Business-priority weighting may be useful for decision-making, but it should not silently replace workload-representative evaluation. Report the weighting rationale and, where useful, show both results separately.

Always inspect query-level results alongside aggregate scores.

A high overall score can hide failures affecting:

- A particular language.
- A specific query category.
- A particular tenant or business unit.
- Complex multi-constraint queries.
- Critical business workflows.
- Queries with expected-no-answer behavior.

Evaluation reports should identify the metric configuration, judgment-set version, query population, aggregation method, and judgment coverage.

Comparisons are meaningful only when the evaluation conditions are compatible.

## 10. Production Engineering Considerations

A production evaluation process must preserve the relationship between judgments, queries, documents, and the corpus state being evaluated.

**Judgment versioning:** A changed rubric or revised judgment must create an identifiable new judgment-set version.

**Corpus changes:** Document updates, deletions, and access-control changes can invalidate previous assumptions about relevance or eligibility. Preserve the corpus snapshot or equivalent version reference required to interpret historical evaluations.

**Metric implementation:** Different implementations may use different cutoff, denominator, and undefined-value policies. Validate metric calculations with known test cases.

**Constraint evaluation:** Track hard-constraint violations independently. Do not hide them inside an aggregate relevance score.

**Judgment completeness:** Report judgment coverage and the provenance of reference judgments.

**Evaluation reproducibility:** Record enough information to reproduce the calculation, including the ranked result list, judgment-set version, metric configuration, and aggregation policy.

RET-10.04 defines the reproducible benchmark and reporting process. This section establishes the evaluation-data and metric requirements that the benchmark must preserve.

## 11. Common Engineering Mistakes

- Treating relevance as an intrinsic property of a document.
- Using graded relevance without an explicit rubric.
- Converting graded judgments into binary relevance without a documented threshold.
- Treating unjudged documents as non-relevant without justification.
- Reporting metrics without judgment coverage.
- Assuming automated LLM judgments are ground truth.
- Ignoring assessor disagreement and rubric ambiguity.
- Comparing metrics calculated using different cutoffs or denominator policies.
- Ignoring queries with zero known relevant documents.
- Confusing MRR with MRR@K.
- Reporting MAP without identifying its eligible query population.
- Reporting ANN Recall as evidence of semantic relevance.
- Confusing candidate coverage with final-ranking quality.
- Treating relevance scores as proof of authorization correctness.
- Using retrieval metrics as proof of complete RAG answer quality.
- Reporting only aggregate metrics and hiding query-level failures.
- Comparing results from incompatible judgment sets without qualification.
- Treating business-priority weighting as workload-representative evaluation.

## 12. Interview Preparation

An engineer should be able to explain the following without relying on memorized definitions:

1. Why is relevance a query-document relationship rather than a document property?
2. When would binary relevance be preferable to graded relevance?
3. How does a graded relevance threshold affect binary metrics?
4. Why can two assessors assign different relevance grades to the same document?
5. Why is an unjudged document not equivalent to a non-relevant document?
6. How can judgment pooling introduce bias?
7. What does JudgmentCoverage@K measure?
8. What is the difference between Precision@K and Recall@K?
9. Why can MRR improve while Recall@K remains unchanged?
10. What is the difference between MRR and MRR@K?
11. Why does MAP use binary relevance judgments?
12. Why is nDCG useful when relevance is graded?
13. What happens when a query has zero known relevant documents?
14. What is the difference between ANN Recall and Relevance Recall?
15. Why can a reranker not recover a document missing from the candidate set?
16. Why must tenant isolation be evaluated separately from relevance?
17. Why is retrieval quality not equivalent to complete RAG answer quality?
18. What information is required to reproduce a historical metric result?

## 13. Self-Assessment

Before considering this topic complete, verify that you can:

- Design a relevance rubric for a real enterprise retrieval task.
- Explain binary and graded relevance with appropriate examples.
- Define a binary relevance threshold.
- Design a judgment record with traceable provenance.
- Explain independent assessment and adjudication.
- Identify the risks of automated judgments.
- Explain judgment pooling and incomplete coverage.
- Calculate JudgmentCoverage@K.
- Explain the operational policies for unjudged documents.
- Calculate Precision@K, Recall@K, MRR, MAP, and nDCG@K.
- Explain the edge cases and assumptions of each metric.
- Interpret conflicting metric results.
- Distinguish relevance quality, ANN fidelity, candidate coverage, constraint correctness, and downstream answer quality.
- Explain how judgment and metric configurations must be preserved in production.

A topic is not complete merely because the formulas can be recalled. You should be able to select the appropriate metric, defend that choice, identify its assumptions, and explain what conclusions the result supports.

## 14. Connection to the Next Files

This file establishes the reference judgments and metrics used to measure retrieval quality.

- **RET-10.01 — Retrieval Evaluation Questions and Test Queries:** Defines evaluation questions and test-query construction.
- **RET-10.02 — Relevance Judgments and Retrieval Metrics:** Defines relevance assessment and retrieval-quality measurement.
- **RET-10.03 — Baselines, Controlled Experiments, and Ablations:** Uses evaluation evidence to compare system configurations and investigate the impact of individual components.
- **RET-10.04 — Reproducible Retrieval Benchmark and Report:** Establishes reproducible benchmark execution, evidence preservation, and reporting.

RET-10 establishes how retrieval quality is measured. RET-11 uses evaluation evidence to diagnose retrieval failures, identify root causes, and validate optimization decisions.
