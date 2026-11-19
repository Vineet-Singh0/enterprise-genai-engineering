# Candidate Generation and Retriever Complementarity

## 1. Purpose and Learning Objectives

Candidate generation is the retrieval stage responsible for identifying a set of potentially relevant items for downstream processing. In a hybrid retrieval system, candidate generation may use multiple retrievers whose strengths differ across queries, content types, and information needs.

The engineering objective is not to maximize the number of retrieval methods in a system. It is to construct a candidate set that contains useful relevant items at an acceptable operational cost.

After completing this file, you should be able to:

- Explain candidate generation and distinguish it from final ranking.
- Identify why a single retriever may miss relevant items.
- Explain how lexical and dense retrievers can complement each other.
- Decide when a single retriever is sufficient and when multiple retrievers may be justified.
- Compare overlapping and source-specific candidates.
- Explain the relationship between candidate coverage and downstream ranking.
- Make a candidate-generation design decision that accounts for relevance, latency, complexity, and maintenance.
- Answer conceptual, comparative, and scenario-based interview questions about retriever complementarity.

## 2. The Mental Model: Retrieval Produces Candidates, Not Guaranteed Answers

Consider a technical documentation assistant answering:

> How do I configure connection pooling in the database client?

Its corpus contains API references, configuration guides, troubleshooting pages, and implementation examples. The system must find useful items before a downstream component determines their final order.

A high-level pipeline is:

```text
User query
    |
    v
Query processing and applicable constraints
    |
    v
Candidate generation
    |
    +--> Lexical retriever --------+
    |                              |
    +--> Dense retriever ----------+--> Candidate combination
    |                              |           |
    +--> Optional other sources ---+           v
                                         Candidate set
                                              |
                                              v
                                     Downstream ranking
                                              |
                                              v
                                      Selected results
```

This is a conceptual pipeline, not a mandatory execution architecture. Retrieval sources may run in parallel, sequentially, or conditionally. The choice affects latency, resource consumption, error handling, and whether every query invokes every source.

The key distinction is:

**Candidate generation determines which items are available for downstream processing; ranking determines the final relative order of those items.**

A candidate can be relevant but ranked poorly. More importantly, a relevant item that never enters the candidate set cannot be recovered by a downstream ranker operating exclusively on that set.

Candidate generation is therefore an independent engineering responsibility. Improving the candidate set and improving the ordering of its members are related but different problems.

## 3. Why a Single Retriever May Miss Relevant Items

Retrievers identify candidates through particular representations, algorithms, and configurations. These choices determine which relationships between a query and a corpus item are easy or difficult for a retriever to detect.

No single retrieval method should be assumed to cover every relevant relationship in every workload.

### 3.1 Lexical retrieval: matching expressed terms

Lexical retrieval is useful when relevance is strongly associated with terms appearing in the query and indexed content.

Typical examples include:

- Product identifiers such as `PRD-4821`.
- Error codes such as `ERR_CONNECTION_RESET`.
- API names such as `create_session`.
- Exact configuration keys and specialized technical terminology.
- Rare names or identifiers that must be preserved precisely.

Suppose a query asks for `ERR-731`. A document containing that exact identifier may be highly relevant even if its surrounding prose differs substantially from the query.

However, a relevant document can be missed when the query and document express the same concept using different vocabulary. A guide about *reusing database connections* may be relevant to a query about *connection pooling*, even if the terms do not overlap sufficiently under the current retrieval configuration.

This does not mean lexical retrieval always fails on vocabulary differences. Analyzers, synonyms, query expansion, and corpus terminology can change its behavior. Their detailed mechanics belong to the relevant lexical and query-processing chapters.

For lexical retrieval internals, see [RET-05 — Lexical Retrieval and Sparse Search](../RET-05-Lexical-Retrieval-and-Sparse-Search/README.md).

### 3.2 Dense retrieval: matching semantic relationships

Dense retrieval represents queries and corpus items using learned vector representations and retrieves items according to a similarity or distance function.

It can help when the query and relevant content use different words but express related meanings.

For example:

- Query: `How can I reuse database connections?`
- Document title: `Configuring connection pooling in the client library`

The terminology differs, but the underlying information need may be similar.

Dense retrieval can also miss relevant items. A representation may fail to preserve an exact identifier sufficiently, confuse closely related technical concepts, or retrieve broadly related content that does not satisfy a precise requirement.

Dense retrieval therefore does not replace lexical retrieval in every workload.

For representation and search mechanics, see [RET-06 — Dense Retrieval and Vector Search](../RET-06-Dense-Retrieval-and-Vector-Search/README.md).

### 3.3 Other candidate sources

Lexical and dense retrieval are a common hybrid combination, but they are not the only possible sources.

Depending on the application, candidate generation may also use:

- **Structured or entity-based retrieval:** Select records associated with known identifiers, entity types, attributes, or relationships.
- **Graph-based retrieval:** Use explicit relationships between entities or records to identify potentially relevant candidates.
- **Specialized retrieval sources:** Apply a source designed for a particular content type, domain, or retrieval requirement.

These sources introduce their own data, indexing, query, and operational requirements. They should be considered when their capabilities address a concrete retrieval need, not merely because additional retrieval methods are available.

Detailed graph construction, multi-hop retrieval implementation, and specialized graph-based architectures are outside this file's scope.

## 4. Retriever Complementarity: What It Means and How to Inspect It

Two retrievers are complementary when their combined outputs contribute useful retrieval coverage that is not adequately provided by either source alone.

Complementarity is not established merely because two retrievers use different algorithms. It must be examined through their candidate outputs and the workload's relevance requirements.

Consider this hypothetical query:

> Find the exact configuration option for reusing database connections.

Assume the corpus contains these documents:

| ID | Document | Relevance to this query |
|---|---|---|
| D1 | `pool_size` configuration reference | Relevant |
| D2 | Connection reuse implementation guide | Relevant |
| D3 | Database error-code reference | Not relevant |
| D4 | General database performance guide | Not relevant for the defined exact-configuration need |
| D5 | Connection pooling troubleshooting guide | Relevant |

Suppose the lexical retriever returns:

`L = [D1, D5, D3]`

The dense retriever returns:

`V = [D2, D5, D4]`

These lists and relevance labels are illustrative, not measured results. The relevance labels also depend on the stated information need: D4 could be useful for a broader performance question, but it is not judged relevant to this particular exact-configuration task.

The shared candidate is D5. The lexical retriever uniquely contributes D1 and D3, while the dense retriever uniquely contributes D2 and D4.

The union of the candidate lists is:

`C = {D1, D2, D3, D4, D5}`

Under the stated relevance judgments, D1, D2, and D5 are relevant. D3 and D4 are not relevant to this query.

The important observation is not that the union contains five items. It is that the dense retriever contributes D2, a relevant item absent from the lexical list, while also contributing D4, which is not relevant to this specific information need.

This illustrates both potential value and cost: an additional source may introduce useful candidates and unnecessary candidates at the same time.

### 4.1 Complementarity has multiple dimensions

Complementarity may arise from differences in:

- **Vocabulary sensitivity:** One source matches expressed terms; another can capture semantic similarity.
- **Identifier behavior:** A source may be effective for codes, names, or exact technical tokens.
- **Representation:** Different representations may expose relationships another source does not capture well.
- **Data coverage:** Sources may index different subsets or representations of the corpus.
- **Query characteristics:** Different query types may benefit from different retrieval strategies.

Data coverage matters independently of algorithm choice. Two retrievers using similar techniques may complement each other if they index different data. Conversely, two fundamentally different retrievers may return nearly identical candidate sets on a particular workload.

Algorithmic diversity is therefore not sufficient evidence of useful complementarity.

### 4.2 Complementarity is workload-dependent

A retriever that helps with natural-language technical questions may add little value for queries consisting almost entirely of exact identifiers.

Likewise, a source that helps with broad conceptual questions may be unnecessary for a constrained lookup workload.

The design must consider the query distribution and the cost of missing relevant items. A global hybrid configuration should not be assumed optimal for every query type.

Query routing and query transformations can help address these differences, but their primary ownership remains in [RET-07 — Query Processing and Metadata Constraints](../RET-07-Query-Processing-and-Metadata-Constraints/README.md).

## 5. Candidate Sets and Retrieval Depth

A retriever generally returns a bounded set of candidates rather than every item in the corpus.

For example, a lexical retriever might return its top 20 candidates while a dense retriever returns its top 50. These values are illustrative configuration choices, not recommended defaults.

The depth of a retrieval source affects which items become available for combination. If a relevant item falls below the source's returned depth, that item cannot enter the current candidate set through that source.

Increasing retrieval depth may expose additional relevant items. It may also introduce more irrelevant candidates, increase the combined set's size, and raise downstream processing cost.

Candidate depth also affects how complementarity is observed. A second retriever might appear to contribute unique candidates because the first source returned too few items. Alternatively, it might contribute genuinely different relevant items even when both sources use comparable depths.

When comparing retrievers, record their retrieval depths. Otherwise, an observed difference may reflect configuration rather than a meaningful difference in retrieval behavior.

This file establishes the concept. Detailed depth selection, overlap analysis, deduplication, and coverage diagnostics belong to [File 03 — Candidate Depth, Deduplication, and Coverage](03-Candidate-Depth-Deduplication-and-Coverage.md).

## 6. Candidate Relevance, Candidate Recall, and Final Ranking

Three ideas must remain distinct.

### Candidate relevance

Candidate relevance concerns whether a retrieved item is useful for the stated information need. A candidate set can contain relevant and irrelevant items simultaneously.

Relevance is task-dependent: the same document may be useful for one query and irrelevant for another.

### Candidate recall

Candidate recall concerns how many known relevant items are present in the candidate set.

For an illustrative query, suppose the complete set of relevant items under the example's assumptions is:

`R = {D1, D2, D5}`

If a candidate set contains D1 and D5 but omits D2, it contains two of the three known relevant items.

The basic calculation is:

\[
\operatorname{CandidateRecall}
=
\frac{|C \cap R|}{|R|}
\]

where:

- \(C\) is the generated candidate set.
- \(R\) is the set of known relevant items for the query.
- \(|C \cap R|\) is the number of known relevant items present in the candidate set.
- \(|R|\) is the total number of known relevant items in the reference set.

In this illustrative case:

\[
\operatorname{CandidateRecall} = \frac{2}{3} \approx 0.667
\]

This value is only as trustworthy as the relevance judgments and corpus coverage behind \(R\). If relevant items have not been judged or the reference set is incomplete, the calculation may fail to represent all relevant items available in the corpus. The formula does not solve that evidence problem.

The example is intended to explain the concept, not establish a benchmark result. Formal relevance-judgment design, metric selection, test-query construction, and controlled evaluation belong to [RET-10 — Retrieval Evaluation and Experimental Design](../RET-10-Retrieval-Evaluation-and-Experimental-Design/README.md).

### Final ranking quality

Final ranking concerns the relative ordering of candidates for the downstream task.

A candidate set can contain all known relevant items while placing the most useful one too low in the final ranking. Another system can order its candidates effectively but still fail because important relevant items never entered the candidate set.

These cases require different interventions.

**Engineering implication:** Before tuning a downstream ranker, establish whether the relevant items are present in its input. A ranking-stage change cannot recover candidates that the system never supplied.

Detailed ranking and reranking methods belong to [RET-09 — Ranking, Reranking, and Relevance Optimization](../RET-09-Ranking-Reranking-and-Relevance-Optimization/README.md).

## 7. Choosing One Retriever or Multiple Retrievers

The decision to add a retriever should be based on an identified retrieval need and a plausible benefit that justifies the added complexity.

### 7.1 When one retriever may be sufficient

A single retriever may be appropriate when:

- It adequately handles the workload's important query types.
- Exact matching or semantic matching is sufficient for the defined task.
- Another source is unlikely to contribute useful candidates.
- Latency, infrastructure cost, or operational simplicity is a dominant constraint.
- Available evidence does not justify the additional source.

A simple architecture is not inherently inferior to a hybrid one. It can be the better engineering decision when it meets the requirements with fewer operational dependencies.

### 7.2 When multiple retrievers may be justified

Multiple sources may be appropriate when:

- Important query types expose different weaknesses in the existing retriever.
- A second source contributes relevant candidates that the baseline misses.
- The application needs both exact-token matching and semantic matching.
- Candidate coverage is important enough to justify additional retrieval cost.
- The team can inspect, evaluate, monitor, and maintain the combined system.

The decision should not be based solely on the number of returned candidates. Additional candidates are valuable only insofar as they help serve the information need or satisfy another explicitly defined requirement.

### 7.3 Operational trade-offs

Adding a retriever may introduce:

- Additional compute, memory, storage, or index-management requirements.
- More latency from executing and waiting for retrieval sources.
- Additional failure modes, such as timeouts or partial source failures.
- More configuration, monitoring, testing, and maintenance.
- A larger candidate set that increases downstream processing work.

Execution strategy affects these trade-offs:

- **Parallel execution** can reduce the time spent waiting for independent sources, but increases concurrent resource demand and requires a policy for slow or failed sources.
- **Sequential execution** can simplify staged decisions or avoid unnecessary work, but may increase end-to-end latency.
- **Conditional or routed execution** can avoid invoking every source for every query, but depends on a routing decision that may misclassify queries.

These are architectural options, not universally superior patterns. The appropriate choice depends on the workload, service-level objectives, source reliability, and the cost of retrieval failures.

## 8. Practical Engineering Exercise

### Scenario

You are building a search system for technical documentation. Users search using both exact identifiers and natural-language questions. The initial implementation uses a lexical retriever, and the team proposes adding dense retrieval.

### Tasks

1. Identify two query types that the lexical baseline should handle well and one type that may expose its limitations.
2. Predict what additional candidates dense retrieval might contribute. State the assumptions behind your prediction.
3. Create a small hypothetical corpus and candidate lists for both retrievers.
4. Identify overlapping candidates, source-specific candidates, and irrelevant candidates.
5. Define a known relevant set for at least one query and calculate candidate recall for the baseline and combined set.
6. Record the retrieval settings needed to make the comparison interpretable.
7. List the additional latency, infrastructure, and maintenance costs that must be considered.
8. Recommend whether the second retriever should be added and specify the evidence needed to validate the decision.

### Minimum experiment record

For each comparison, record:

- **Query identity:** The query text or stable query ID, plus the query type.
- **Corpus identity:** The corpus or dataset version used.
- **Retriever configuration:** The source, relevant configuration, and retrieval depth.
- **Candidate identities:** The IDs returned by each source, preserving their original order.
- **Reference relevance:** The relevant-item set and the origin or limitations of its judgments.
- **Execution conditions:** Relevant latency measurements and whether sources ran in parallel, sequentially, or conditionally.
- **Decision and limitations:** What the observed candidates support, what remains uncertain, and what further evidence is needed.

This is a lightweight reproducibility record, not a complete benchmark protocol. RET-10 owns formal evaluation design and reporting.

**Exercise rule:** Label invented candidate lists and judgments as hypothetical. Do not report them as measured system performance or use them to claim that hybrid retrieval improves production quality.

## 9. Interview Preparation

### A. Conceptual questions

**Q1. What is candidate generation, and how does it differ from final ranking?**

**Model answer:** Candidate generation identifies a bounded set of potentially relevant items from the corpus. Final ranking determines the relative order of items available to the ranking stage. Candidate generation controls which items can be considered; ranking controls how those items are ordered.

**Q2. Why might lexical and dense retrieval complement each other?**

**Model answer:** Lexical retrieval can be effective when exact terms, identifiers, or specialized vocabulary are strong relevance signals. Dense retrieval can identify semantically related content when query and document wording differ. Their outputs may therefore contain different relevant items. The benefit must be established for the workload rather than assumed from the algorithms alone.

**Q3. Can a better ranker compensate for missing relevant candidates?**

**Model answer:** Not if the ranker only receives the existing candidate set. It can reorder available items but cannot select an item absent from its input. The retrieval stage must be examined when relevant items are missing before ranking.

### B. Comparison and trade-off questions

**Q4. When would you keep a single retriever instead of introducing hybrid retrieval?**

**Model answer:** I would retain a single retriever when it adequately serves the important query types, an additional source contributes little useful coverage, or its operational cost is not justified. I would revisit that decision if representative queries reveal important retrieval gaps that another source could address.

**Q5. Is a candidate set with 100 items necessarily better than one with 20?**

**Model answer:** No. The larger set may contain additional relevant items, but it may also contain mostly irrelevant or duplicate items and increase downstream cost. Candidate-set size must be considered alongside relevant-item coverage and operational constraints.

### C. Scenario-based question

**Q6. A hybrid system returns more candidates than the lexical baseline, but users report no noticeable improvement. How would you reason about this?**

**Model answer:**

1. Inspect candidates contributed uniquely by the added retriever.
2. Determine whether those candidates contain relevant items or mostly irrelevant material.
3. Check whether the baseline already contained the important relevant items.
4. Inspect whether relevant candidates survive into downstream processing.
5. Separate candidate-coverage problems from downstream ordering problems.
6. Compare quality evidence and operational cost before deciding whether to keep the additional source.

The additional source may be redundant, poorly suited to the query distribution, or useful only for a subset of queries. The observation alone does not identify which explanation is correct.

### D. Practical coding exercise

**Q7. Given two candidate lists, how would you identify their overlap and unique contributions without changing their original order?**

Input contract:

- Each input is a list of non-empty string candidate IDs.
- For this exercise, IDs are assumed to be stable identifiers for the same underlying items across both retrievers.
- The input lists are expected to contain unique IDs. Duplicate handling and identity resolution are separate production concerns.
- If two sources use different IDs for the same underlying document, this comparison cannot identify that semantic identity without an explicit mapping.

Input:

```python
lexical = ["D1", "D5", "D3"]
dense = ["D2", "D5", "D4"]
```

Expected output:

```python
{
    "overlap": ["D5"],
    "lexical_only": ["D1", "D3"],
    "dense_only": ["D2", "D4"],
}
```

One valid solution:

```python
def compare_candidates(lexical, dense):
    if not all(isinstance(item, str) and item for item in lexical + dense):
        raise ValueError("Candidate IDs must be non-empty strings")

    if len(lexical) != len(set(lexical)):
        raise ValueError("Lexical candidate IDs must be unique")

    if len(dense) != len(set(dense)):
        raise ValueError("Dense candidate IDs must be unique")

    lexical_set = set(lexical)
    dense_set = set(dense)

    overlap = [item for item in lexical if item in dense_set]
    lexical_only = [item for item in lexical if item not in dense_set]
    dense_only = [item for item in dense if item not in lexical_set]

    return {
        "overlap": overlap,
        "lexical_only": lexical_only,
        "dense_only": dense_only,
    }
```

**Reasoning:** Sets provide efficient membership checks, while list comprehensions preserve the order of each original list.

For input lengths \(n\) and \(m\), expected time complexity is \(O(n+m)\) under average-case constant-time set membership. The sets and output lists require \(O(n+m)\) additional space.

The validation checks assume the inputs are lists, as stated in the exercise contract. A more general production interface would validate container types explicitly and define behavior for malformed upstream responses.

The code compares IDs; it does not determine whether different IDs refer to the same underlying document. That requires a reliable identity strategy, which is treated in File 03.

### E. Advanced follow-up questions

**Q8. Two retrievers return almost identical candidates. Does that prove the second retriever is useless?**

**Model answer:** No. It suggests limited observed complementarity for the inspected workload, but the conclusion depends on query coverage, retrieval depth, relevance evidence, and operational cost. The second source may still help on particular query classes.

**Q9. Could a second retriever improve candidate recall while making the application worse?**

**Model answer:** Yes. It may add relevant candidates while increasing latency, cost, or the number of irrelevant candidates passed downstream. Whether the change is beneficial depends on the application's quality and operational requirements.

**Q10. Why might complementarity differ across query types?**

**Model answer:** Query types differ in vocabulary, identifier usage, specificity, and semantic intent. The same retrieval sources may contribute differently across these cases, so an aggregate result can hide important differences.

### F. Common misconceptions

- **Misconception:** Hybrid retrieval is always better than single-retriever retrieval.  
  **Correction:** Hybrid retrieval is justified only when its additional coverage or other benefits warrant the complexity and cost.

- **Misconception:** Different algorithms necessarily produce complementary results.  
  **Correction:** Different algorithms may return nearly identical candidates. Complementarity must be examined in the actual workload.

- **Misconception:** More candidates mean better relevance.  
  **Correction:** More candidates increase the available set, but do not guarantee that more relevant items are included.

- **Misconception:** A strong downstream ranker fixes all retrieval problems.  
  **Correction:** A ranker cannot recover items absent from its input candidate set.

## 10. Self-Assessment and Completion Criteria

Before moving to the next file, verify that you can:

- [ ] Explain candidate generation without confusing it with final ranking.
- [ ] Describe how lexical and dense retrieval may contribute different candidates.
- [ ] Explain why retriever complementarity is workload-dependent.
- [ ] Compare the benefits and operational costs of one versus multiple retrievers.
- [ ] Distinguish candidate relevance, candidate recall, and final ranking quality.
- [ ] Work through a small candidate-list comparison and preserve input order.
- [ ] Explain the identity assumptions required to compare candidate lists.
- [ ] Explain why an increased candidate count does not prove a quality improvement.
- [ ] Design a reproducible, small-scale candidate-generation comparison.
- [ ] Answer the scenario-based interview question using evidence-driven reasoning.

### Completion exercise

Write a short design note for a retrieval workload you understand. State the information need, the proposed retriever or retrievers, the expected source-specific contributions, the costs, and the evidence needed to justify the design.

Include a minimum experiment record so another engineer can understand the query, corpus, retrieval settings, candidate outputs, and relevance assumptions.

The goal is not to prove that hybrid retrieval is preferable. The goal is to make a defensible engineering decision and identify what remains uncertain.

## Key Takeaways

- Candidate generation determines which items are available to downstream processing.
- Lexical, dense, and other retrieval sources may contribute different candidates because they capture different signals.
- Retriever complementarity is a workload-dependent property, not an automatic consequence of using different algorithms.
- Candidate recall describes the presence of known relevant items in the candidate set; it does not establish final ranking quality.
- Candidate-recall conclusions depend on the completeness and quality of relevance judgments.
- Additional retrievers can improve coverage while increasing latency, resource use, and operational complexity.
- A good candidate-generation design is justified by its expected contribution and validated with appropriate evidence.

**Next file:** `02-Retrieval-Fusion-and-Candidate-Combination.md` — begin only after this file has been reviewed, corrected if necessary, reviewed again, and explicitly approved.
