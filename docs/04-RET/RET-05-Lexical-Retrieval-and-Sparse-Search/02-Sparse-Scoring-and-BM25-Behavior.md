# Sparse Scoring and BM25 Behavior

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain the difference between lexical matching and relevance scoring.
- Describe how sparse representations support lexical retrieval.
- Explain term frequency, document frequency, inverse document frequency, and their roles in scoring.
- Describe the intuition behind TF-IDF and its limitations.
- Explain the BM25 scoring function and the purpose of its main parameters.
- Predict how term frequency, document length, and term rarity can influence BM25 scores.
- Interpret lexical retrieval scores without treating them as probabilities or universal measures of relevance.
- Establish a defensible baseline configuration for lexical retrieval and validate its behavior using representative queries.

The goal is not to memorize a formula. The goal is to understand why a scoring function ranks documents differently, identify which assumptions influence those rankings, and make controlled engineering decisions when the results are unsuitable.

## 2. Prerequisites

You should understand:

- Documents, terms, postings, and inverted indexes.
- Basic Boolean retrieval and the difference between matching and ranking.
- Sets, vectors, and elementary logarithmic operations.
- The distinction between a document's text and its analyzed searchable terms.

If these concepts are unfamiliar, review [Term Matching and Inverted Indexes](./01-Term-Matching-and-Inverted-Indexes.md) first.

## 3. Estimated Reading Time

Approximately 30–40 minutes, including the scoring examples.

This estimate assumes that you work through the examples rather than reading only the section headings.

## 4. The Problem: Matching Is Not Ranking

Suppose a user searches an engineering knowledge base for:

`database connection timeout`

Three documents match some or all of the query terms:

| Document | Content |
|---|---|
| D1 | Database connection timeout troubleshooting |
| D2 | Database connection configuration and timeout settings |
| D3 | Database backup procedure and connection maintenance |

A basic lexical matching operation can identify documents that contain the required terms. However, it does not necessarily establish which document should appear first.

D1 appears to address the exact problem. D2 may contain useful configuration guidance. D3 may mention related concepts without answering the question.

A search system therefore needs to distinguish two operations:

1. **Matching:** Determine which documents satisfy the query's retrieval conditions.
2. **Scoring and ranking:** Estimate which matching documents should be presented first.

A lexical scoring function assigns a numerical score to a document-query pair. A ranking stage uses those scores, typically ordering documents from higher to lower scores.

The score is an estimate produced by a particular model. It is not a direct measurement of user satisfaction or semantic relevance.

### 4.1 Why term presence is insufficient

Imagine that two documents contain the term `timeout`.

- One is a dedicated timeout troubleshooting guide.
- Another mentions timeout once in an unrelated operational report.

A system that considers only whether the term exists cannot distinguish them using that fact alone.

Scoring functions can use additional signals, including:

- How often a query term appears in a document.
- How common the term is across the collection.
- How long the document is relative to the collection.
- Which query terms are present and how strongly they contribute.

These signals are imperfect, but they provide a principled baseline for ranking lexical matches.

## 5. Sparse Representations

A sparse representation records values for only a relatively small subset of the terms in a vocabulary.

In lexical retrieval, the vocabulary may contain a large number of distinct terms, while any individual document contains only a small fraction of them.

For example, consider the vocabulary:

```text
database, connection, timeout, authentication, backup, kubernetes
```

A document containing `database connection timeout` can be represented as a term-weight vector:

\[
\mathbf{d} = [1,1,1,0,0,0]
\]

In this simplified binary representation:

- A value of 1 indicates that the term is present.
- A value of 0 indicates that the term is absent.

A real sparse representation may use term frequencies or other weights instead of binary values.

Another document containing `database backup procedure` would have nonzero values for a different subset of terms.

### 5.1 Why the representation is sparse

Suppose a collection has a vocabulary of 100,000 distinct terms. A typical document may contain only a few hundred distinct terms.

The conceptual vector therefore contains many zero values.

Storing and processing every zero explicitly would be wasteful. Sparse data structures can store only the nonzero entries or otherwise represent the relevant terms efficiently.

An inverted index is closely related to this model: it organizes term-to-document associations so that the system can locate documents containing particular terms without scanning a dense vector for every document.

However, a sparse representation and an inverted index are not identical concepts. The sparse representation describes how term-related information can be represented; the inverted index describes an access structure for retrieving documents by term.

### 5.2 Binary presence versus term weights

A binary representation captures only whether a term occurs.

A weighted representation can capture how strongly a term contributes according to a scoring model.

For example:

| Term | Binary value | Illustrative term frequency |
|---|---:|---:|
| database | 1 | 2 |
| connection | 1 | 5 |
| timeout | 1 | 1 |
| authentication | 0 | 0 |

Binary presence cannot distinguish a document containing `connection` once from one containing it five times.

Term-weighting methods use additional information to distinguish such cases. TF-IDF and BM25 are two established approaches to lexical scoring.

The fact that a representation is sparse does not, by itself, determine how documents should be ranked. The weighting and scoring method supplies that behavior.

## 6. The Statistics Behind Lexical Scoring

Before examining TF-IDF and BM25, we need to understand three basic statistics.

Let:

- \(N\) be the number of documents in the collection.
- \(f(t,d)\) be the number of times term \(t\) occurs in document \(d\).
- \(df(t)\) be the number of documents containing term \(t\).

These statistics describe different properties.

### 6.1 Term frequency

**Term frequency (TF)** measures how often a term occurs in a particular document.

For example:

```text
D1: connection timeout troubleshooting
D2: connection connection connection configuration
```

For the term `connection`:

\[
f(\text{connection},D1)=1
\]

\[
f(\text{connection},D2)=3
\]

A basic intuition is that repeated occurrence can provide additional evidence that a document concerns a term.

But repetition is not unlimited evidence. A document may repeat a term unnaturally, contain duplicated content, or be much longer than other documents.

Consequently, production scoring functions often transform or limit the influence of raw term frequency.

### 6.2 Document frequency

**Document frequency (DF)** measures how many documents contain a term, regardless of how often it appears in each one.

Suppose a collection contains 1,000 documents:

- `database` occurs in 400 documents.
- `timeout` occurs in 80 documents.
- `ERR_CONN_504` occurs in 3 documents.

Their document frequencies are:

\[
df(\text{database})=400
\]

\[
df(\text{timeout})=80
\]

\[
df(\text{ERR\_CONN\_504})=3
\]

Document frequency differs from collection-wide term frequency. If a term occurs 10 times in each of 20 documents, its document frequency is 20, while its total collection frequency is 200.

This distinction matters because commonness across documents and repetition within a document are different signals.

### 6.3 Inverse document frequency

**Inverse document frequency (IDF)** represents how informative a term is according to its distribution across the document collection.

A common illustrative IDF expression is:

\[
\operatorname{IDF}(t)=\log\left(\frac{N}{df(t)}\right)
\]

If \(N=1000\):

For `database`, where \(df=400\):

\[
\operatorname{IDF}(\text{database})
=\log(1000/400)
=\log(2.5)
\]

For `ERR_CONN_504`, where \(df=3\):

\[
\operatorname{IDF}(\text{ERR\_CONN\_504})
=\log(1000/3)
\]

Using the natural logarithm, the second value is substantially larger.

This expression is an illustrative form, not the only IDF formula. Implementations may use smoothing, offsets, or different conventions to handle edge cases and produce useful scores.

### 6.4 Why IDF is not the same as relevance

Rare terms can be highly discriminative, but rarity does not guarantee usefulness.

A rare misspelling may have a high IDF value. A rare internal identifier may be extremely useful for a specific query. A common term may be essential to understanding a technical request.

IDF measures term distribution, not user intent.

The scoring function combines available signals, but its result still depends on the quality of the query, the indexed content, and the assumptions of the model.

## 7. TF-IDF: A Foundational Scoring Model

TF-IDF combines term frequency and inverse document frequency.

The general intuition is:

- A term should contribute more when it occurs in the document.
- A term should contribute less when it is common throughout the collection.
- A term that is frequent in a document but uncommon across the collection can receive greater weight.

A simplified term-weight expression is:

\[
w(t,d)=TF(t,d)\times IDF(t)
\]

Here, \(TF(t,d)\) represents the selected term-frequency transformation, and \(IDF(t)\) represents the selected inverse-document-frequency transformation.

Different implementations may use different TF and IDF variants. Some use raw frequency; others use logarithmic or normalized weights.

### 7.1 A numerical illustration

Suppose two query terms have these IDF values:

| Term | Illustrative IDF |
|---|---:|
| `database` | 0.4 |
| `ERR_CONN_504` | 4.0 |

Assume the document contains `database` twice and `ERR_CONN_504` once, and that raw term frequency is used for this illustration.

The term contributions are:

\[
w(\text{database},d)=2\times0.4=0.8
\]

\[
w(\text{ERR\_CONN\_504},d)=1\times4.0=4.0
\]

The rare identifier contributes more despite appearing only once.

This is a useful illustration of how IDF can make distinctive terms influential.

The numbers are illustrative, not values computed from a real collection.

### 7.2 From term weights to document scores

One simplified additive TF-IDF scoring expression is:

\[
\operatorname{Score}(q,d)
=\sum_{t\in q} TF(t,d)\,IDF(t)
\]

For this illustration, assume each distinct query term contributes once. The expression is intended to explain additive term contributions, not to specify every TF-IDF implementation.

Actual scoring can differ when query terms have weights, repeated query terms are handled separately, document or query vectors are normalized, or the implementation uses different TF and IDF transformations.

For a multi-term query, each matched term can contribute to the final score. Documents that match more informative terms, or match them with larger weights, may receive higher scores.

### 7.3 Strengths of TF-IDF

TF-IDF provides a useful conceptual foundation because it:

- Combines within-document occurrence and collection-wide rarity.
- Gives a principled alternative to binary term presence.
- Helps explain why common and rare terms can contribute differently.
- Provides a straightforward baseline for understanding weighted lexical representations.

### 7.4 Limitations of TF-IDF

A simple TF-IDF model does not inherently solve all lexical ranking problems.

Potential limitations include:

- Raw term frequency can over-reward repeated terms.
- Long documents may accumulate more term occurrences than short documents.
- Different TF and IDF variants can produce different rankings.
- Term statistics do not establish semantic equivalence between different words.
- A high score does not guarantee that a document answers the user's question.

The limitations around frequency and document length motivate scoring functions that control term-frequency saturation and normalize the effect of document length.

BM25 is one widely used approach.

## 8. BM25: The Core Mental Model

BM25 is a probabilistic-model-based lexical ranking function commonly used in search systems.

Its behavior can be understood through three central ideas:

1. **Term rarity:** Terms that occur in fewer documents can provide stronger evidence for distinguishing candidates.
2. **Term-frequency saturation:** Repeated occurrences can increase a term's contribution, but each additional occurrence generally has a diminishing effect.
3. **Document-length normalization:** A term's frequency is interpreted relative to document length rather than being rewarded without adjustment for longer documents.

BM25 is not a semantic model. It primarily uses lexical overlap and collection statistics. If the query asks for `car` and the document contains only `automobile`, ordinary BM25 does not automatically infer that the words are related.

### 8.1 A common BM25 formulation

A widely used form of BM25 is:

\[
\operatorname{BM25}(q,d)=
\sum_{t\in q}
\operatorname{IDF}(t)
\cdot
\frac{f(t,d)(k_1+1)}
{f(t,d)+k_1\left(1-b+b\frac{|d|}{\operatorname{avgdl}}\right)}
\]

Where:

- \(q\) is the query.
- \(d\) is a document.
- \(t\) is a query term.
- \(f(t,d)\) is the term frequency in document \(d\).
- \(|d|\) is the document length measured according to the implementation's indexed-term conventions.
- \(\operatorname{avgdl}\) is the average document length in the collection.
- \(\operatorname{IDF}(t)\) is the implementation's inverse-document-frequency weight.
- \(k_1\) controls term-frequency saturation.
- \(b\) controls the degree of document-length normalization.

This is a common formulation, not a universal specification for every implementation. Search engines may use different IDF variants, query handling, field statistics, and configuration defaults.

For repeated query terms, query-term handling can also depend on the engine and query representation. Do not assume that every implementation treats a repeated term in the query as a simple duplicate contribution.

### 8.2 Understanding the formula without memorizing it

The formula looks complicated because it combines several effects in one expression.

Separate it into conceptual parts:

```text
BM25 document score
       |
       +-- Term importance
       |      |
       |      +-- IDF: how discriminative is the term?
       |
       +-- Term contribution in this document
       |      |
       |      +-- TF: how often does the term occur?
       |      +-- k1: how quickly does repetition saturate?
       |
       +-- Document-length adjustment
              |
              +-- b
              +-- document length / average document length
```

For each query term, BM25 calculates a contribution using term importance, the term's frequency in the document, and a length adjustment. It then combines the contributions across the query terms.

The parameters do not independently guarantee relevance. They shape how the model responds to evidence present in the index.

## 9. BM25 Term-Frequency Saturation

A naïve scoring model could reward every additional occurrence of a term equally.

Suppose a document contains `timeout` once, while another contains it 30 times because the same phrase is repeated throughout a troubleshooting log.

Should the second document receive 30 times as much evidence from that term?

Usually, that would be an undesirable assumption.

BM25 uses a saturating term-frequency component. Increasing term frequency generally increases a term's contribution, but the marginal benefit decreases as the frequency grows.

### 9.1 Intuition for saturation

Imagine these documents:

| Document | Occurrences of `timeout` |
|---|---:|
| D1 | 1 |
| D2 | 2 |
| D3 | 5 |
| D4 | 20 |

For the same term and otherwise comparable conditions, BM25 generally gives more contribution to a document with more occurrences, but not in direct proportion to the raw count.

The increase from one occurrence to two may matter more than the increase from 20 occurrences to 21.

This is the key property of saturation.

### 9.2 The role of \(k_1\)

The parameter \(k_1\) controls how quickly the term-frequency contribution approaches saturation.

Conceptually:

- A lower \(k_1\) generally causes the contribution to saturate more quickly.
- A higher \(k_1\) generally allows term frequency to continue influencing the contribution over a wider range.

This does not mean that a higher \(k_1\) always improves ranking. It changes the model's sensitivity to repetition.

The best value depends on the document collection, query patterns, and evaluation criteria.

### 9.3 When saturation matters

Term-frequency saturation can be important when:

- Documents vary substantially in writing style.
- Logs contain repeated phrases or events.
- Documents include duplicated content.
- A long document repeats the query terms without providing proportionally more useful information.
- Repetition is common but should not dominate every other signal.

Saturation is a modeling assumption. If repetition itself carries strong meaning in a particular application, its effect should be evaluated rather than assumed to be either entirely useful or entirely harmful.

## 10. BM25 Document-Length Normalization

Long documents tend to contain more terms than short documents.

If scoring rewarded term frequency without considering document length, a long document could receive a high score simply because it provides more opportunities for query terms to occur.

BM25 adjusts term contributions using the document's length relative to the collection's average document length.

The length ratio is:

\[
\frac{|d|}{\operatorname{avgdl}}
\]

Interpretation:

- A ratio near 1 means the document is approximately average length.
- A ratio greater than 1 means it is longer than average.
- A ratio below 1 means it is shorter than average.

The length factor in the denominator is:

\[
1-b+b\frac{|d|}{\operatorname{avgdl}}
\]

The parameter \(b\) controls how strongly the length ratio affects scoring.

### 10.1 The role of \(b\)

Conceptually:

- \(b=0\) removes the explicit document-length normalization term from this part of the formula.
- Increasing \(b\) makes the length ratio more influential.
- \(b=1\) applies the full length-ratio adjustment in this formulation.

These statements describe the parameter's mathematical role, not a recommendation to choose either endpoint.

A larger value of \(b\) does not universally produce better rankings. Some collections have document lengths that strongly correlate with verbosity; others contain documents where length carries meaningful relevance information.

### 10.2 A controlled example

Consider two documents that each contain `connection` three times:

| Document | Length | Term frequency |
|---|---:|---:|
| D1 | 100 tokens | 3 |
| D2 | 1,000 tokens | 3 |

Assume the average document length is 200 tokens.

Then:

\[
\frac{|D1|}{\operatorname{avgdl}}=\frac{100}{200}=0.5
\]

\[
\frac{|D2|}{\operatorname{avgdl}}=\frac{1000}{200}=5
\]

D1 is shorter than average, while D2 is much longer.

With a positive length-normalization parameter, the length component generally makes the same term frequency contribute less in D2 than it would under otherwise identical conditions in D1.

The final score still depends on IDF, the chosen \(k_1\) and \(b\), the query terms, and the implementation's precise scoring formula.

### 10.3 Length is a proxy, not a quality measurement

Length normalization does not determine whether a document is concise, useful, or relevant.

For example:

- A long operational runbook may be the most complete answer to a complex incident.
- A short error-code reference may be the best answer to a precise identifier query.
- A long document may include important details distributed across many sections.
- A short document may contain only a superficial mention of the query terms.

BM25 uses document length as a statistical adjustment, not as a direct judgment of document quality.

The appropriate normalization behavior depends on how the collection is structured and how users search it.

## 11. Understanding IDF in BM25

BM25 uses an IDF component to distinguish terms according to their distribution across the collection.

One commonly used BM25 IDF form is:

\[
\operatorname{IDF}(t)=
\ln\left(
1+\frac{N-df(t)+0.5}{df(t)+0.5}
\right)
\]

Where:

- \(N\) is the number of documents.
- \(df(t)\) is the number of documents containing term \(t\).

The smoothing constants and logarithmic form are part of this particular formulation. Implementations can use different variants.

### 11.1 Why the BM25 IDF differs from the simple TF-IDF example

Earlier, the chapter introduced the illustrative expression:

\[
\log\left(\frac{N}{df(t)}\right)
\]

The BM25 expression includes an offset and smoothing terms. These alter the numerical behavior, particularly at the boundaries.

The expressions should not be treated as interchangeable when reproducing actual scores.

The conceptual role remains similar: term distribution contributes to the term's discriminative weight.

### 11.2 A numerical example

Suppose the collection contains \(N=1000\) documents.

For a term appearing in 400 documents:

\[
\operatorname{IDF}(t)=
\ln\left(1+\frac{1000-400+0.5}{400+0.5}\right)
\]

For a term appearing in 3 documents:

\[
\operatorname{IDF}(t)=
\ln\left(1+\frac{1000-3+0.5}{3+0.5}\right)
\]

The term appearing in only 3 documents receives a substantially larger IDF value under this formula.

That difference can strongly affect ranking when the rare term appears in the query and candidate document.

### 11.3 Rare does not mean universally important

A rare term may be:

- A unique error code.
- A product identifier.
- A misspelling.
- An internal abbreviation.
- A term that appears in only one irrelevant document.

IDF cannot distinguish these cases based on rarity alone.

It is the combination of the query, document contents, term statistics, and scoring assumptions that determines the result.

## 12. Reading BM25 Scores Correctly

A BM25 score is a value produced by a specific scoring implementation and configuration.

It should not be interpreted as:

- A probability that the document is relevant.
- A percentage match.
- A universal quality measure comparable across unrelated collections.
- A guarantee that the first result is the best answer.
- A semantic similarity score.

A higher score generally means that the document received a larger score under the same query and scoring setup.

That statement is meaningful only within the relevant comparison context.

### 12.1 Why score magnitudes are context-dependent

BM25 scores can change when:

- The query terms change.
- The document collection changes.
- Document frequencies change.
- Average document length changes.
- The analyzer changes the indexed terms.
- \(k_1\) or \(b\) changes.
- The implementation uses a different IDF or field-scoring variant.
- The query parser changes how the query is represented.

Consequently, a score of 8.2 from one collection should not automatically be interpreted as better than a score of 5.7 from another collection.

The scores may have been produced under different statistical conditions.

### 12.2 Compare rankings under controlled conditions

When evaluating a change to BM25 configuration, keep the query set and evaluation procedure consistent.

For example:

| Query | Baseline top result | Candidate configuration top result |
|---|---|---|
| `ERR_CONN_504` | Error-code reference | Error-code reference |
| `database connection timeout` | Timeout runbook | Timeout troubleshooting guide |
| `connection pool configuration` | Pool configuration guide | Pool configuration guide |

This is an illustrative comparison format, not a measured experiment.

The goal is to examine whether the ranking changes improve the results users actually need.

Do not assume that an increased score means an improvement. Inspect which documents moved, why they moved, and whether those changes align with the intended behavior.

## 13. A Worked BM25 Interpretation

Consider the query:

`database timeout`

Suppose two candidate documents contain both query terms:

| Property | D1: Timeout troubleshooting | D2: General database operations |
|---|---:|---:|
| `database` frequency | 2 | 5 |
| `timeout` frequency | 4 | 1 |
| Document length | 120 | 900 |
| Average collection length | 250 | 250 |

These values are illustrative and are not derived from a live search index.

D1 is short and repeats `timeout` more often. D2 is much longer, repeats `database` more often, and contains `timeout` once.

How might BM25 behave?

1. **Term importance:** Both terms contribute according to their IDF values. A more discriminative term may contribute more strongly.
2. **Term frequency:** D1 receives a larger contribution from `timeout` because it contains that term more often, but saturation limits the effect of repetition.
3. **Document length:** D2's greater length influences the denominator for each term's contribution.
4. **Combined score:** The final ranking depends on the IDF weights, frequency saturation, length adjustment, and chosen parameters.

This is a **qualitative interpretation**, not a numerical BM25 calculation. It explains which factors influence the score but does not establish which document must rank first.

To calculate actual BM25 values, you would also need the document frequencies, the collection size, the average document length under the implementation's length definition, the parameter values, and the precise scoring variant. The example does not provide all those inputs, so assigning a definitive winning document would be unjustified.

### 13.1 What the example teaches

The example illustrates why one isolated signal is insufficient:

- D2 has more occurrences of `database`.
- D1 has more occurrences of `timeout`.
- D1 is shorter.
- The terms may have different IDF weights.

The ranking is the combined result of those effects.

An engineer should therefore avoid explanations such as "D1 won because it is shorter" unless the actual score contributions support that conclusion.

## 14. Establishing a Lexical Scoring Baseline

A baseline is a documented starting configuration against which later changes can be evaluated.

The goal is not to find ideal parameters by intuition. It is to establish predictable behavior before introducing tuning or more complex retrieval techniques.

### 14.1 Define the retrieval objective

Before selecting scoring parameters, determine what users are trying to retrieve.

Examples include:

- Exact error codes and technical identifiers.
- Troubleshooting instructions.
- API reference documentation.
- Operational runbooks.
- General conceptual explanations.

Different objectives can produce different expectations about term importance, document length, and acceptable matching behavior.

A short identifier reference and a long troubleshooting guide should not necessarily be evaluated using identical assumptions about what makes a good result.

### 14.2 Record the baseline configuration

Document at least:

| Configuration item | What to record |
|---|---|
| Search engine | Product and relevant version |
| Searchable fields | Which fields participate in retrieval |
| Analyzer configuration | Tokenization and normalization behavior |
| Scoring model | The configured lexical scoring method |
| \(k_1\) | Configured term-frequency saturation parameter, where applicable |
| \(b\) | Configured document-length normalization parameter, where applicable |
| Query semantics | How terms, phrases, and fields are interpreted |
| Test queries | Representative queries used to inspect behavior |
| Expected results | Relevant documents and important ranking expectations |

Record actual values from the selected engine rather than assuming that its defaults match a textbook formula.

### 14.3 Start with the engine's documented baseline

For a search engine that supports BM25, begin with its documented baseline configuration unless there is evidence that the defaults are inappropriate for the application.

This approach provides a reference point before tuning.

It also avoids spending time adjusting parameters to compensate for unrelated problems, such as incorrect field mappings, inconsistent analyzers, missing documents, or badly formed queries.

### 14.4 Build a representative query set

A useful baseline should include more than a few broad natural-language queries.

Include cases such as:

| Query type | Example |
|---|---|
| Exact identifier | `ERR_CONN_504` |
| Common technical term | `database` |
| Multi-term query | `database connection timeout` |
| Configuration query | `connection pool configuration` |
| Phrase query | `"connection timeout"` |
| Query with a rare term | A specific error code or uncommon component name |

The examples should reflect actual application vocabulary and expected retrieval behavior.

For each query, record:

- The expected relevant documents.
- The observed top results.
- Unexpected omissions.
- Unexpected high-ranking documents.
- Whether the issue appears to be matching, analysis, scoring, or another retrieval concern.

The purpose is to make later comparisons reproducible.

## 15. Diagnosing BM25 Ranking Behavior

When a lexical result looks wrong, the first task is to identify which stage could explain the failure.

### 15.1 The document is missing entirely

If a relevant document does not appear in the candidate results, investigate whether:

- It is indexed and searchable.
- Its analyzed terms match the query terms.
- The query conditions exclude it.
- The required field is included in the search.
- The query uses the intended phrase or term semantics.

Changing \(k_1\) or \(b\) cannot make a document match a term that is absent from its searchable representation.

### 15.2 The document matches but ranks too low

If the document is present but appears below less useful candidates, scoring may be relevant.

Inspect:

- Which query terms occur in the document.
- Their term frequencies.
- Their document frequencies.
- The document's length relative to the collection.
- The contribution of each term, where the engine exposes explanations.
- The configured scoring formula and parameters.

This creates a hypothesis about the cause of the ranking rather than relying on guesswork.

### 15.3 A long document dominates the results

Investigate whether its score is driven by repeated query terms, broad coverage of the query vocabulary, or other effects.

Document-length normalization can influence the result, but a long document is not automatically wrong to rank first.

The document may contain more complete or useful information. Validate the actual query intent and relevance judgments before modifying length normalization.

### 15.4 Repeated terms appear to dominate

Inspect the contribution of term frequency and the saturation parameter.

If repetition is producing undesirable rankings, test a controlled adjustment to the scoring configuration. Section 16 describes the experimental procedure.

However, do not assume that every repeated term is noise. In some domains, frequency is a useful signal. The appropriate behavior should be established through representative queries and evaluation.

### 15.5 Rare identifiers dominate too strongly

A rare identifier can receive a large IDF contribution.

That behavior may be desirable for exact technical lookup, but it can be misleading when the identifier appears in an irrelevant document or the query combines an identifier with a broader information need.

Check the actual result set and query objective before concluding that the IDF formula is wrong.

In some applications, field-specific query behavior or exact-value lookup is more appropriate than changing the global scoring parameters.

## 16. Tuning BM25 Without Guesswork

Tuning should be a controlled experiment rather than a sequence of arbitrary parameter changes.

Use the diagnostic findings from Section 15 to form a specific hypothesis. The goal here is to test that hypothesis systematically, not to repeat the entire failure-diagnosis process.

### 16.1 Change one variable at a time

A disciplined process is:

1. Record the baseline configuration.
2. Select representative queries and expected relevant documents.
3. State the suspected scoring behavior and the expected effect of a change.
4. Change one parameter or setting.
5. Run the same query set.
6. Compare result order and relevant-document placement.
7. Retain the change only if it improves the intended behavior without unacceptable regressions.

This process makes it easier to attribute observed changes to a particular intervention.

### 16.2 When to investigate \(k_1\)

Investigate \(k_1\) when evidence suggests that the scoring function's response to repeated term occurrences is inappropriate.

Questions to ask:

- Do documents with repeated terms consistently rank too highly?
- Is repetition meaningful in this corpus?
- Does the problem occur across multiple queries or only one document?
- Could duplicate content or document structure be responsible?
- Would changing \(k_1\) improve one case while damaging another?

A parameter change should be supported by a pattern of observed behavior, not one surprising result.

### 16.3 When to investigate \(b\)

Investigate \(b\) when document length appears to have an undesirable influence on rankings.

Questions to ask:

- Are longer documents consistently advantaged or disadvantaged in cases where they should not be?
- Does document length reflect verbosity, useful detail, or both?
- Are documents comparable in structure?
- Does the issue appear across representative queries?
- Would a change to \(b\) improve the ranking without hiding useful long-form documents?

The direction and size of a useful adjustment depend on the collection. Do not assume that a higher or lower value is universally preferable.

### 16.4 Avoid parameter tuning for unrelated failures

BM25 parameters are not substitutes for correct indexing and query behavior.

Before tuning, verify that:

- Relevant documents are indexed.
- The expected fields are searchable.
- The query analyzer produces the intended terms.
- Query semantics match the application's intent.
- The score explanation supports the suspected failure mode.

If the issue is an identifier split into unsuitable tokens, adjusting \(k_1\) or \(b\) is unlikely to solve the underlying problem.

## 17. Common Mistakes and Misconceptions

### Mistake 1: Treating matching and ranking as the same operation

Matching determines whether a document satisfies query conditions. Ranking determines how matching candidates are ordered.

**Correction:** Establish whether the failure is a missing candidate or an incorrectly ordered result before investigating scoring.

### Mistake 2: Assuming TF-IDF and BM25 are interchangeable

Both use term statistics, but they apply different weighting and normalization behaviors.

**Correction:** Understand the selected scoring function and its implementation rather than assuming that all lexical scores use the same formula.

### Mistake 3: Assuming every additional term occurrence should contribute equally

Unbounded linear growth can allow repeated terms to dominate.

**Correction:** Understand BM25's term-frequency saturation and validate its behavior on the actual corpus.

### Mistake 4: Assuming long documents are always penalized or always rewarded

The effect depends on the entire scoring function, term frequencies, and length-normalization settings.

**Correction:** Inspect the relevant score contributions and compare documents under controlled conditions.

### Mistake 5: Treating IDF as a measure of semantic importance

IDF measures how terms are distributed across the collection. It does not determine whether a term is meaningful to the user.

**Correction:** Interpret rarity as one scoring signal, not as a complete relevance judgment.

### Mistake 6: Treating a BM25 score as a probability

A score is generated by a particular formula and collection statistics.

**Correction:** Use scores to understand rankings within a consistent retrieval setup. Do not interpret them as calibrated probabilities unless a separate, validated calibration process supports that interpretation.

### Mistake 7: Changing multiple parameters simultaneously

When several parameters change together, it becomes difficult to identify which change caused an improvement or regression.

**Correction:** Use controlled experiments and retain a record of baseline and candidate results.

### Mistake 8: Tuning scoring to compensate for analysis errors

Scoring cannot reliably compensate for a missing indexed term or an incompatible query representation.

**Correction:** Verify the indexed representation and query analysis before changing ranking parameters.

## 18. Interview Questions with Expected Answers

### Q1. What is the difference between lexical matching and lexical ranking?

Lexical matching determines which documents satisfy the query's conditions. Lexical ranking orders candidates according to a scoring function. A document can match the query but still rank poorly.

### Q2. What do TF and DF measure?

TF measures how often a term occurs in a particular document. DF measures how many documents in the collection contain that term. They describe different distributions and serve different roles in lexical scoring.

### Q3. Why does IDF help lexical ranking?

IDF gives different weights to terms according to their distribution across the collection. A term occurring in fewer documents can be more discriminative than a term occurring almost everywhere. Rarity alone, however, does not guarantee relevance.

### Q4. What is the intuition behind TF-IDF?

TF-IDF combines a term's occurrence in a document with an inverse-document-frequency weight. It provides a way to reward document-specific evidence while reducing the contribution of terms that are common throughout the collection.

### Q5. What are the principal behaviors controlled by BM25's \(k_1\) and \(b\)?

\(k_1\) controls term-frequency saturation. \(b\) controls the degree of document-length normalization. Their useful values depend on the corpus and ranking objective.

### Q6. Why does BM25 use term-frequency saturation?

Repeated occurrences can provide additional evidence, but their usefulness often diminishes. Saturation prevents the term's contribution from growing linearly without bound.

### Q7. Why does BM25 account for document length?

Long documents have more opportunities to contain query terms. Length normalization adjusts term contributions according to document length relative to the collection average, reducing the effect of raw length under the chosen model.

### Q8. Is a higher BM25 score always better across different collections?

No. Scores depend on the scoring implementation, query, collection statistics, indexed terms, and configuration. They are most meaningful when comparing documents under a consistent setup.

### Q9. A relevant document is absent from the results. Should you tune \(k_1\)?

Not initially. First determine whether the document is indexed and whether its searchable terms and fields satisfy the query. A scoring parameter cannot recover a candidate that never matches the query conditions.

### Q10. How would you evaluate a proposed BM25 configuration change?

Record a baseline, select representative queries with expected relevant documents, form a specific hypothesis, change one variable, rerun the same queries, and compare rankings. Retain the change only when it improves the intended behavior without unacceptable regressions.

## 19. Quick Revision

- **Sparse representation:** Represents values for a limited subset of a larger vocabulary.
- **Term frequency (TF):** Counts occurrences of a term in a document.
- **Document frequency (DF):** Counts documents containing a term.
- **Inverse document frequency (IDF):** Weights a term according to its distribution across the collection.
- **TF-IDF:** Combines term frequency and inverse document frequency.
- **BM25:** A lexical ranking function that combines term importance, term-frequency saturation, and document-length normalization.
- **\(k_1\):** Controls the behavior of term-frequency saturation.
- **\(b\):** Controls the degree of document-length normalization.
- **BM25 score:** A model-specific ranking score, not automatically a probability or universal relevance measure.
- **Baseline:** A documented scoring configuration and representative query set used for controlled comparisons.
- **Tuning:** A hypothesis-driven experiment, not arbitrary parameter adjustment.

## 20. Key Takeaways

1. Matching and ranking are different stages. A document can satisfy the query conditions without being the most useful result.
2. TF, DF, and IDF describe different aspects of term distribution and help explain why lexical scoring assigns different weights to terms.
3. TF-IDF provides a foundational model for understanding term weighting, while BM25 introduces term-frequency saturation and document-length normalization.
4. BM25's \(k_1\) and \(b\) parameters shape scoring behavior but do not guarantee relevance or have universally optimal values.
5. Scores must be interpreted in the context of the query, collection, implementation, and configuration.
6. Reliable tuning starts with a documented baseline, representative queries, explicit relevance expectations, and controlled changes.
7. Before tuning ranking, verify that the intended documents and terms are actually available to the query.

## 21. Further Reading

Consult the documentation for the search engine used by your application. Verify the actual scoring formula, parameter defaults, field-specific behavior, and score-explanation capabilities.

Useful starting points include:

- [Apache Lucene — Core documentation](https://lucene.apache.org/core/documentation.html)
- [Elasticsearch — Similarity settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-similarity.html)
- [Elasticsearch — The explain API](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-explain.html)
- [OpenSearch — Similarity settings](https://docs.opensearch.org/latest/field-types/mapping-parameters/similarity/)

The equations in this chapter explain common TF-IDF and BM25 formulations. Use the selected engine's current documentation and score explanations when reproducing actual production scores.

File: `02-Sparse-Scoring-and-BM25-Behavior.md`
