# Lexical Use Cases, Failure Modes, and Tuning

## 1. Learning Objectives

After completing this chapter, you should be able to:

- Identify problems for which lexical retrieval is an appropriate baseline.
- Recognize vocabulary mismatch and analyzer-related failures.
- Distinguish candidate-generation failures from ranking failures.
- Evaluate when synonyms and query expansion are appropriate.
- Diagnose lexical retrieval failures using evidence rather than guesswork.
- Tune lexical retrieval systematically and validate changes against a representative query set.
- Explain the role of learned sparse retrieval, including SPLADE, without confusing it with conventional lexical retrieval.

## 2. Prerequisites

This chapter builds on the concepts established in the preceding RET-05 files:

- [01 — Term Matching and Inverted Indexes](01-Term-Matching-and-Inverted-Indexes.md): terms, postings, text analysis, fielded search, and phrase matching.
- [02 — Sparse Scoring and BM25 Behavior](02-Sparse-Scoring-and-BM25-Behavior.md): sparse scoring, TF-IDF, BM25, and score behavior.

This chapter focuses on applying those concepts to diagnose and improve real search behavior rather than re-teaching their internal mechanics.

## 3. Estimated Reading Time

Approximately 30–40 minutes, including the practical exercise.

## 4. Where Lexical Retrieval Works Well

Lexical retrieval is especially effective when a query and a relevant document share identifiable terms or when exact terminology carries important meaning.

### 4.1 Exact identifiers and error codes

Examples include:

- `ERR_CONN_504`
- `HTTP 429`
- `CustomerProfileRepository`
- `INV-2026-1042`
- Configuration keys, API paths, and exception names.

These values often have precise meanings. A semantically similar phrase may not identify the same error code, API, or configuration property.

For identifier-heavy search, preserve meaningful punctuation, case distinctions where relevant, and token boundaries. Do not assume that ordinary natural-language normalization is safe for every identifier.

### 4.2 Technical documentation and runbooks

Lexical retrieval works well when users search for:

- Product and component names.
- Configuration parameters.
- Function and class names.
- Error messages.
- Commands and documented procedures.

A query containing `connection pool timeout` can retrieve a runbook containing those terms even when the system does not need to infer deeper semantic similarity.

### 4.3 Controlled vocabularies and structured terminology

Lexical retrieval can be effective when a domain consistently uses known terms, such as product codes, internal service names, standardized labels, or documented issue categories.

Its reliability depends on the quality of the terminology and the consistency between indexed content and queries.

### 4.4 Explainable and auditable matching

Lexical retrieval provides useful evidence for debugging: matching terms, indexed fields, analyzer output, candidate documents, and scoring contributions where the search engine exposes them.

This makes it a strong baseline for systems that require traceable search behavior.

**Engineering implication:** Start with lexical retrieval when exact terminology is meaningful and the query vocabulary is reasonably aligned with the indexed content. Introduce additional retrieval techniques when evidence shows that lexical matching does not adequately cover the use case.

## 5. Where Lexical Retrieval Struggles

Lexical retrieval can fail even when a relevant document exists in the index.

### 5.1 Vocabulary mismatch

A user and a document may express the same concept using different words.

For example:

- Query: `car maintenance`
- Document: `automobile servicing`

Without an appropriate synonym mapping, expansion strategy, or another retrieval mechanism, conventional lexical matching may not recognize the relationship.

This is a vocabulary problem, not necessarily a scoring problem. Changing BM25 parameters cannot create a match when the query and document share no searchable terms.

### 5.2 Morphology and word forms

Related word forms may not match as expected:

- `connect` and `connecting`
- `timeout` and `timeouts`
- `authorize` and `authorization`

Whether these forms match depends on the analyzer, stemming or lemmatization behavior, tokenization, and the language involved.

Normalization can improve recall, but aggressive normalization may also merge terms that should remain distinct.

### 5.3 Abbreviations and domain terminology

Organizations often use abbreviations, internal names, and product-specific vocabulary that a general analyzer does not understand.

Examples include:

- `DB` versus `database`
- Internal service abbreviations.
- Product-specific names.
- Legacy component names.

The correct treatment depends on domain conventions. An abbreviation may be a reliable synonym in one system and ambiguous in another.

### 5.4 Incomplete terminology coverage

A document may use the correct term, but the user's query may contain a spelling variation, an alternate label, or a term missing from the system's synonym rules.

Adding more normalization or synonyms without examining representative failures can introduce noise rather than solve the underlying problem.

**Key distinction:** Lexical retrieval is not inherently unreliable. Its behavior depends on the relationship between query vocabulary, document vocabulary, text analysis, candidate generation, and ranking.

## 6. Classify the Failure Before Changing the System

When a relevant document is missing or poorly ranked, identify the failure category before adjusting analyzers, synonyms, or scoring parameters.

| Failure category | Diagnostic question | Evidence to inspect |
|---|---|---|
| Indexing failure | Was the document indexed successfully? | Ingestion status, indexed document, field contents |
| Analyzer failure | Were the intended terms produced and indexed? | Analyzer output, token positions, indexed terms |
| Vocabulary mismatch | Do query and document use different terminology? | Query terms, document terms, domain vocabulary |
| Query-construction failure | Was the intended query sent to the engine? | Parsed query, field selection, filters, query logs |
| Candidate-generation failure | Did the relevant document enter the result set? | Candidate set, result limits, filters, matching clauses |
| Ranking failure | Was the relevant document retrieved but ranked poorly? | Candidate rankings, score explanations, competing documents |
| Data-quality failure | Is the indexed content incomplete, stale, or incorrect? | Source record, ingestion transformations, index freshness |

These categories can overlap. For example, an analyzer mismatch may prevent a document from becoming a candidate, making it appear to be a ranking problem when the actual failure occurs earlier.

Use the evidence to identify the earliest stage at which the expected behavior breaks.

## 7. Diagnosing Analyzer Mismatch

An analyzer transforms text into searchable terms. If query analysis and document analysis are incompatible, expected matches may disappear or become unreliable.

Consider a document containing the identifier `ERR_CONN_504` and a query using the same identifier.

Depending on the analyzer, the indexed and queried representations might preserve the complete identifier, split it into components, or normalize parts of it. If the two representations differ in an unintended way, the expected match may fail.

### Diagnostic procedure

1. **Inspect the source content.** Confirm that the relevant identifier or phrase exists in the source document.
2. **Inspect the indexed field.** Confirm that the expected content reached the correct searchable field.
3. **Analyze the query.** Examine the terms produced by the query analyzer.
4. **Analyze the document.** Examine the terms and positions produced by the index analyzer, using the relevant search engine's diagnostic facilities.
5. **Compare the results.** Identify differences in tokenization, normalization, case handling, stemming, stopword removal, or positions.
6. **Test a narrow correction.** Adjust the relevant analyzer or field configuration and validate it against representative queries.

### Avoid broad normalization changes

Do not lowercase, split, stem, remove punctuation from, or otherwise normalize every field simply because one query fails.

Different fields have different requirements. A body of natural-language text may benefit from stemming, while an identifier field may need to preserve exact token boundaries.

**Engineering rule:** Make analyzer decisions at the appropriate field and use-case level. Validate changes against both expected matches and known non-matches.

## 8. Candidate-Generation Failures Versus Ranking Failures

This distinction determines which class of intervention is appropriate.

### Candidate-generation failure

The relevant document never enters the candidate set.

Possible causes include:

- No matching searchable terms.
- An analyzer mismatch.
- A restrictive filter.
- An incorrect field or query clause.
- A result-generation configuration that excludes the document.

Changing ranking weights cannot promote a document that was never retrieved.

### Ranking failure

The relevant document is retrieved, but competing documents appear above it.

Possible causes include:

- Weak term-frequency or rarity signals.
- Poorly chosen field boosts.
- Excessive influence from less important terms.
- Documents with repeated generic terms receiving an advantage.
- A mismatch between the scoring objective and user expectations.

Ranking adjustments are relevant only after confirming that the candidate set contains the expected document.

### Worked diagnostic example

Suppose a user searches for `database connection timeout`.

- If the relevant runbook does not appear in the candidate set, inspect indexed terms, query analysis, fields, and filters first.
- If the runbook appears at rank 18 while less relevant documents appear above it, inspect the matching fields, score contributions, term importance, and ranking configuration.

The first case calls for a candidate-generation investigation. The second calls for a ranking investigation.

Do not infer the failure stage from the final ranked list alone if the system can expose the candidate set or intermediate query results.

## 9. Synonyms and Query Expansion

Synonyms and query expansion can reduce vocabulary mismatch by allowing a query to match alternate terminology.

Examples might include:

- `automobile` and `car`
- An approved internal abbreviation and its full form.
- A legacy product name and its current name.

These relationships must be validated in the target domain. Related terms are not automatically interchangeable.

### 9.1 When expansion helps

Consider expansion when evidence shows that users and documents consistently use different terms for the same concept.

Useful evidence includes:

- Repeated failed queries with known relevant documents.
- Search logs showing common alternate terms.
- Domain glossaries or authoritative terminology mappings.
- User feedback identifying missing results.

### 9.2 Precision risks

Expansion can retrieve irrelevant documents when a term is ambiguous or the supposed synonyms have different meanings.

For example, a short abbreviation may represent several unrelated concepts. Expanding it globally could introduce substantial noise.

Measure both sides of the trade-off: additional relevant documents retrieved and irrelevant documents introduced.

### 9.3 Index-time versus query-time expansion

Expansion can be introduced at different stages:

- **Index-time expansion:** Alternate terms are incorporated into the indexed representation.
- **Query-time expansion:** The user's query is expanded when the search executes.

The choice depends on the search engine, update requirements, query behavior, and operational constraints. The two approaches have different effects on indexing, query execution, and consistency; neither is universally preferable.

### 9.4 A controlled synonym workflow

1. Identify a recurring vocabulary mismatch.
2. Propose a small, domain-reviewed synonym mapping.
3. Define where the mapping applies.
4. Test relevant queries and known non-matches.
5. Compare retrieval changes against the baseline.
6. Record the mapping, rationale, and validation results.

Avoid introducing a large synonym dictionary without evidence. Expansion rules should be treated as maintained search configuration, not as an unreviewed collection of similar words.

## 10. A Systematic Lexical Tuning Workflow

Use the following process as the primary procedure for improving lexical retrieval.

### Step 1: Build a representative query set

Include several query types:

- Exact identifiers and error codes.
- Natural-language technical queries.
- Phrase queries.
- Abbreviations and alternate terminology.
- Queries known to return irrelevant results.
- Queries that should return no result.

For each query, record expected relevant documents and important non-matches where practical.

### Step 2: Establish a baseline

Run the query set against the current configuration.

Capture:

- Returned candidates and their ranks.
- Whether expected documents are retrieved.
- Analyzer and query configuration.
- Relevant score explanations or diagnostic output.
- The current evaluation results, when available.

Do not rely on one successful query as evidence that the overall configuration is good.

### Step 3: Form a specific hypothesis

A useful hypothesis identifies the observed failure and its suspected cause.

For example:

> Queries using the approved abbreviation fail because the query analyzer produces terms that do not match the indexed representation.

This is more actionable than saying, “Search quality needs improvement.”

### Step 4: Select the smallest appropriate change

Match the intervention to the diagnosed failure:

- Indexing or data-quality issue → repair the document or ingestion path.
- Analyzer mismatch → adjust the relevant analyzer or field.
- Vocabulary mismatch → evaluate a targeted synonym or expansion rule.
- Candidate-generation failure → inspect query construction, fields, filters, and matching conditions.
- Ranking failure → evaluate scoring parameters, field importance, and term contributions.

Avoid changing analyzer behavior, synonym rules, and BM25 parameters simultaneously. Multiple changes make causal attribution difficult.

### Step 5: Compare before and after

Run the same query set against the modified configuration.

Check whether:

- The target failure is resolved.
- Previously successful queries remain successful.
- Irrelevant results have increased.
- Exact identifiers still behave correctly.
- Any new regressions have appeared.

Use appropriate retrieval metrics when the evaluation data supports them. Otherwise, record the observed query-level changes and acknowledge the limits of the evidence.

### Step 6: Record the change

Maintain a short change record containing:

- The observed problem.
- The hypothesis.
- The configuration change.
- The queries used for validation.
- The measured or observed outcome.
- Known regressions or unresolved limitations.

A tuning change is not validated merely because one example looks better.

## 11. Common Failure Patterns and Targeted Responses

Use this table as a quick diagnostic reference. The tuning workflow in Section 10 defines the full process.

| Observed symptom | Likely area to investigate | Initial response |
|---|---|---|
| Exact identifier does not match | Identifier analysis, field mapping, indexing | Inspect the indexed value and analyzed query |
| Alternate terminology is missing | Vocabulary coverage | Validate a narrow synonym or expansion rule |
| Relevant document is absent | Candidate generation, filters, query construction | Establish where the document is excluded |
| Relevant document ranks too low | Scoring and field configuration | Inspect candidates and score contributions |
| Expansion retrieves many irrelevant documents | Synonym ambiguity or excessive expansion | Narrow the mapping and regression-test non-matches |
| Search behavior changes unexpectedly after deployment | Analyzer or index configuration change | Compare configurations and revalidate representative queries |
| Results differ from the source content | Data quality or ingestion | Trace the source document through the indexing path |
| One fix breaks previously successful queries | Overbroad configuration change | Roll back or narrow the change and rerun the regression set |

These are starting hypotheses, not guaranteed diagnoses. Confirm the cause using evidence from the actual system.

## 12. Learned Sparse Retrieval: Awareness of SPLADE

Conventional lexical retrieval typically depends on terms produced by an analyzer and matches query terms against indexed terms. Learned sparse retrieval changes how sparse representations are produced and can expand the vocabulary used to represent text.

SPLADE is one example of a learned sparse retrieval approach. It uses a neural model to produce sparse term-weighted representations, allowing the representation to include terms beyond those appearing literally in the original text.

This can help address some vocabulary-mismatch problems while retaining a sparse, term-oriented representation. It does not eliminate the need to evaluate retrieval quality, computational cost, indexing behavior, and operational complexity.

### When to consider learned sparse retrieval

Consider investigating it when:

- Conventional lexical retrieval has persistent vocabulary-mismatch failures.
- Carefully validated analyzers and synonym rules are insufficient.
- The expected improvement justifies model-serving and indexing complexity.
- Representative evaluation data is available for a fair comparison.

Learned sparse retrieval is not automatically better than conventional lexical retrieval. Establish a lexical baseline first and compare approaches against the same representative queries and relevance judgments.

Implementation details, model selection, and deployment architecture are outside the scope of this chapter.

## 13. Lexical Retrieval in a Larger Retrieval System

Lexical retrieval is one retrieval strategy within a broader search architecture.

Its exact-term matching and interpretable term-based behavior can complement approaches designed to capture semantic similarity. Whether a system should combine retrieval methods depends on observed failure patterns, latency constraints, evaluation results, and operational cost.

This chapter establishes how to diagnose and improve the lexical component. The design of combined retrieval strategies and the evaluation of broader retrieval pipelines belong to their respective chapters.

## 14. Practical Exercise: Diagnose and Improve a Lexical Search

### Scenario

An internal engineering documentation search system contains a runbook about connection failures. Users report three problems:

1. Searching for the exact error identifier `ERR_CONN_504` does not retrieve the runbook.
2. Searching for `database connection timeout` retrieves the runbook, but several less relevant documents rank above it.
3. Searching for an approved internal abbreviation returns no relevant results.

### Tasks

1. Classify each problem by its most likely failure category.
2. Identify the evidence you would collect before modifying the configuration.
3. Explain which problem should be investigated first and why.
4. Propose one targeted intervention for each problem.
5. Define a representative query set that includes both expected matches and non-matches.
6. Describe how you would compare the baseline and modified configurations.
7. Identify at least two regressions that a seemingly successful fix could introduce.
8. Write a short change record describing your hypothesis, intervention, and validation results.

### Expected engineering approach

Do not assume that all three symptoms share the same cause.

The exact identifier failure calls for inspection of the source value, indexed field, analyzer output, and query construction. The ranking problem requires confirming that the runbook enters the candidate set before changing scoring behavior. The abbreviation problem requires evidence that the alternate terminology is valid in the relevant domain before adding expansion rules.

A strong solution distinguishes observations from hypotheses, changes one relevant variable at a time, and validates both the target queries and existing behavior.

## 15. Interview Questions with Expected Answers

### 1. Why can changing BM25 parameters fail to fix a missing document?

BM25 scores documents that are available for scoring. If a document is excluded because its terms do not match, a filter removes it, or query construction is incorrect, adjusting BM25 cannot recover it. Diagnose candidate generation before tuning ranking.

### 2. How would you distinguish an analyzer problem from a vocabulary mismatch?

Inspect the indexed representation and analyzed query first. An analyzer problem occurs when the configured transformations produce unintended or incompatible terms. A vocabulary mismatch occurs when the query and document use different terminology despite the analysis behaving as configured. The distinction matters because the interventions differ.

### 3. Why can synonym expansion reduce search quality?

Expansion can introduce ambiguous or overly broad terms, increasing irrelevant matches. Synonyms should be validated against representative positive and negative queries, with attention to precision as well as recall.

### 4. How would you improve lexical retrieval in production?

Establish a baseline, reproduce representative failures, identify the earliest failing stage, form a specific hypothesis, make a targeted change, and compare results against the same query set. Record outcomes and regressions before deploying the change.

### 5. When would you investigate learned sparse retrieval?

When persistent vocabulary mismatch remains after reasonable lexical configuration and synonym improvements, and evaluation data can demonstrate whether the additional complexity is worthwhile. It should be compared against an established baseline rather than adopted on assumption alone.

## 16. Quick Revision

- Lexical retrieval is effective when query and document terminology overlap meaningfully.
- Exact identifiers often require different analysis decisions from natural-language text.
- Vocabulary mismatch is not the same as an analyzer defect.
- Candidate-generation failures must be distinguished from ranking failures.
- Synonyms can improve recall but may introduce irrelevant matches.
- A tuning hypothesis should identify a specific failure and a testable cause.
- Validate changes against representative queries, including known non-matches.
- Learned sparse retrieval can expand term representations but introduces additional complexity.

## 17. Key Takeaways

1. Diagnose the failure before selecting an intervention.
2. Inspect indexing, analysis, query construction, and candidate generation before changing ranking parameters.
3. Treat analyzers and synonyms as explicit, testable search configuration.
4. Use a representative query set and a recorded baseline to make tuning decisions.
5. Change one relevant variable at a time and check for regressions.
6. Consider learned sparse retrieval only when evidence justifies moving beyond the conventional lexical baseline.

## 18. Further Reading

- [Elasticsearch — Text analysis](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis.html)
- [Elasticsearch — Synonym token filter](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-synonym-tokenfilter.html)
- [Apache Lucene — Core documentation](https://lucene.apache.org/core/)
- Formal paper: [SPLADE: Sparse Lexical and Expansion Model for First Stage Ranking](https://arxiv.org/abs/2107.05720)
