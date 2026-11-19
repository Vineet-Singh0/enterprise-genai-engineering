# Query Normalization, Rewriting, and Expansion

## 1. Purpose and Mental Model

Query processing transforms a user's request into representations that retrieval systems can use more effectively without silently changing the intended information need.

Users may describe a concept differently from the terminology used in documents, indexed records, or available data sources. Query processing bridges that gap through normalization, rewriting, expansion, decomposition, and retrieval-method routing.

These operations are conditional. A simple query may need no transformation, while a complex request may require several complementary representations.

```text
Original query
    |
    v
Identify intent, entities, and constraints
    |
    v
Select necessary transformations
    ├── Normalize representation
    ├── Rewrite or expand query
    ├── Decompose into subqueries
    └── Select retrieval method or source
    |
    v
Construct retrieval request
    |
    v
Retrieve actual evidence
    |
    v
Determine whether a defined evidence gap remains
```

This is a conceptual workflow, not a mandatory execution sequence. Operations may occur in different orders, and unnecessary transformations should be skipped.

Distinguish three representations:

- **Original query:** The user's actual request and stated requirements.
- **Processed representation:** A normalized, rewritten, expanded, or decomposed form used to support retrieval.
- **Retrieval request:** The representation combined with the selected retrieval method, data source, and applicable constraints.

Keep the original query available throughout processing. It provides the reference for interpreting transformations, investigating failures, and checking whether the system still addresses the user's request.

## 2. Normalization, Rewriting, and Expansion

These operations address different retrieval problems and should not be treated as interchangeable.

| Operation | Purpose | Example |
|---|---|---|
| Normalization | Standardize representation while preserving intended meaning. | Remove accidental surrounding whitespace. |
| Rewriting | Express the same information need in a retrieval-friendly form. | “worker-v2 keeps dying” → “worker-v2 process failures.” |
| Expansion | Introduce alternative terminology to improve evidence discovery. | Add “process termination” as a related search formulation. |

### 2.1 Query Normalization

Normalization addresses representation inconsistencies that can interfere with retrieval.

Two useful categories are:

- **Syntactic normalization:** Corrects representation-level inconsistencies, such as accidental whitespace or predictable formatting variations.
- **Semantic canonicalization:** Maps known equivalent expressions to an approved canonical representation, such as a documented product alias.

These operations have different risk profiles. Trimming unnecessary whitespace is usually straightforward. Mapping an abbreviation to a canonical entity requires domain knowledge and may be incorrect when the abbreviation is ambiguous.

Normalization rules must be compatible with the query language, indexed representations, and retrieval method.

For example, lowercasing may be appropriate for some natural-language queries but harmful when case distinguishes identifiers or commands. Removing punctuation can damage version strings, paths, and quoted expressions.

Do not assume that normalization always improves retrieval. Apply it when the expected benefit outweighs the risk of losing meaningful information.

### 2.2 Query Rewriting

Rewriting expresses the same information need in a form that is easier for a retrieval system to process.

Consider these examples:

- Original: “Why did it fail after the release?”
- Context-aware rewrite: “Why did `worker-v2` fail after the release?”
- Unsafe rewrite: “Why did the database connection pool exhaust after the release?”

The context-aware rewrite is valid only if available context establishes that “it” refers to `worker-v2`. The unsafe rewrite introduces a cause that the user did not establish.

A rewrite should preserve the target, question type, conditions, exclusions, and uncertainty of the original request.

#### Rewrite validation and fallback

A production system should not assume that a generated rewrite is correct merely because it is fluent.

A practical validation process is:

1. Identify the original request's entities, relationships, conditions, and constraints.
2. Generate a candidate rewrite only when it addresses a defined ambiguity or retrieval problem.
3. Check whether the candidate introduces unsupported entities, causes, assumptions, or changed conditions.
4. Reject or avoid using a rewrite that materially changes the information need.
5. Retain the original query as a fallback when the transformation is uncertain or invalid.

Validation may combine deterministic checks for identifiers and known constraints, domain-specific rules for recognized entities, and model-assisted checks for semantic consistency. Model-based validation is fallible and should not be treated as proof of correctness.

When ambiguity materially affects retrieval, preserve it or request clarification rather than silently inventing missing context.

### 2.3 Query Expansion

Expansion introduces alternative terminology, synonyms, domain-specific expressions, or additional formulations that may retrieve relevant evidence.

For example, a query about a “worker process crash” might also search for “process termination” when that terminology appears in relevant incident records.

Expansion differs from rewriting: rewriting expresses the same information need differently, while expansion broadens the ways relevant evidence can be discovered.

Expansion introduces several risks:

- Related terms may not be equivalent.
- Broad variants may retrieve irrelevant evidence.
- Variants may omit conditions or exclusions.
- Duplicate or nearly identical variants may increase cost without improving coverage.

Treat expanded queries as retrieval aids, not replacements for the original request. Results retrieved through an expanded variant must still be interpreted against the original requirements.

## 3. Preserving Intent Across Transformations

A transformation can preserve individual keywords while still changing the meaning of a request. Correctness therefore depends on preserving the complete information need, not merely retaining important terms.

Pay particular attention to:

- **Identifiers and named entities:** Preserve exact values such as `worker-v2`, version numbers, API names, and error codes.
- **Negation:** Do not transform “not deployed” into “deployed.”
- **Quoted text:** Preserve exact wording when the phrase itself matters.
- **Conditions and scope:** Retain relevant environments, time ranges, versions, and other restrictions.
- **Uncertainty:** Do not turn “might have caused” into “caused.”
- **Relationships:** Preserve who or what performed an action, what was affected, and how events relate.
- **Question type:** Do not replace a request for possible causes with a generic search for background documentation.

For example, retaining a service name but dropping the relevant time range can produce a materially different retrieval request.

Different retrieval methods may require different formulations of the same request. A system can maintain method-specific variants while retaining the original query as the reference representation. No single normalization or rewriting policy is optimal for every retriever.

Use this principle throughout the chapter: validate transformations against the original information need, including its conditions and relationships.

## 4. Multi-Query Retrieval and Query Decomposition

Both techniques can produce multiple retrieval operations, but they solve different problems.

### 4.1 Multi-Query Retrieval

Multi-query retrieval generates several formulations of the same information need to improve coverage when relevant sources use different terminology.

For example, a search for timeout incidents might use formulations referring to:

- Request timeouts.
- Operation timeouts.
- Requests exceeding their configured time limits.

These variants are useful only when the terminology is relevant to the underlying information need.

Multi-query retrieval is appropriate when one formulation may miss evidence because of vocabulary differences. It is less useful when variants are duplicates or introduce meanings unrelated to the request.

Each variant should preserve the original target and applicable requirements. Generating more queries does not automatically improve recall or answer quality.

Combining results from multiple queries introduces a separate problem: candidate combination and fusion. Detailed fusion methods belong to **RET-08**.

### 4.2 Query Decomposition

Query decomposition separates a complex request into smaller subqueries when answering it requires distinct pieces of evidence.

Consider:

> “Why did `worker-v2` fail after deployment? Find related timeout incidents, but exclude staging.”

Possible evidence requirements include:

1. Identify deployment changes affecting `worker-v2`.
2. Retrieve relevant failure evidence for `worker-v2`.
3. Find related timeout incidents.
4. Determine whether the collected evidence supports an explanation of the original failure.

The fourth item is an evidence-integration requirement, not necessarily another retrieval query.

Unlike multi-query retrieval, decomposition divides an information need into distinct evidence requirements. Those requirements may depend on one another.

#### Maintaining correctness across decomposition

Decomposition introduces several risks:

- **Context loss:** A subquery omits the entity or time period needed to interpret its results.
- **Constraint loss:** A subquery fails to retain an applicable exclusion.
- **Relationship loss:** Separate subqueries return individually relevant results without establishing the relationship needed to answer the original question.
- **Scope expansion:** A subquery investigates an adjacent issue rather than a necessary part of the request.
- **Unnecessary decomposition:** A straightforward query becomes several retrieval operations without gaining useful coverage.

A sound decomposition strategy identifies what evidence each subquery must contribute, retains shared context and applicable constraints, and makes dependencies between evidence requirements explicit.

The final answer must address the original request collectively. A collection of individually relevant results is insufficient if those results do not answer the original question.

Use decomposition when a request genuinely contains distinct evidence needs. Do not decompose merely because a query is long.

## 5. Query Routing and Retrieval-Method Selection

Query routing selects an appropriate retrieval method or data source according to the information need and the capabilities of available retrieval systems.

For example:

- A request for a specific known record may be best served by structured retrieval.
- A question about conceptually related documentation may benefit from semantic retrieval.
- A request containing both exact terminology and broader conceptual intent may justify more than one retrieval method.

The choice depends on available data, query characteristics, supported operations, and correctness requirements. No retrieval method is universally best.

### Routing decisions

A routing policy may use deterministic rules, a trained classifier, model-assisted classification, or a combination of these approaches.

A defensible routing decision considers:

1. **Query characteristics:** Is the request an exact lookup, a conceptual question, or a multi-part investigation?
2. **Retriever capabilities:** Which available methods can represent the request adequately?
3. **Data availability:** Does the selected source contain the relevant information?
4. **Correctness requirements:** Does the request depend on exact identifiers, structured conditions, or broader semantic matching?
5. **Operational constraints:** Do latency, cost, or resource limits affect the decision?

These considerations support routing without requiring a complex autonomous planning system.

### Uncertain or unsuccessful routing

A router may be uncertain about the request, select a method that returns no useful evidence, or encounter a source that cannot satisfy the information need.

The system should define an explicit response policy. Depending on the application, it may use a justified fallback, try an alternative retrieval method, or request clarification.

Fallbacks must not silently weaken the original requirements. Switching methods is acceptable only if the alternative can still satisfy the applicable constraints.

Routing is distinct from autonomous agent planning. Routing selects a retrieval path; autonomous planning coordinates broader sequences of actions and decisions. Agent planning belongs to the agent-engineering curriculum.

## 6. HyDE and Iterative Retrieval

These techniques extend basic query processing but introduce additional cost and failure modes. Use them when their expected benefit justifies the added complexity.

### 6.1 Hypothetical Document Embeddings

HyDE generates hypothetical document text and uses it as an intermediate retrieval representation.

The conceptual flow is:

```text
User query
    |
    v
Generate hypothetical document
    |
    v
Derive a retrieval representation from the hypothetical text
    |
    v
Retrieve actual source documents
    |
    v
Evaluate the actual retrieved evidence
```

The motivation is that hypothetical document text may resemble the language and structure of relevant source material more closely than a short user query.

However, generated text can contain plausible but incorrect details. The hypothetical document is a retrieval aid, not verified evidence. Only the actual retrieved sources can provide evidence for the answer.

HyDE may be useful when the query-to-document representation gap is a meaningful retrieval problem and the application supports the technique. It is not necessary for every semantic query. Detailed embedding mechanics belong to the dense-retrieval curriculum.

### 6.2 Iterative Retrieval

Iterative retrieval performs additional retrieval when the current evidence reveals a specific unresolved information need.

For example, an initial search may identify a timeout incident but fail to locate the deployment change associated with it. A subsequent query can target that missing evidence.

Iteration should be driven by an identifiable evidence gap, not by the assumption that more retrieval is always better.

A practical stopping policy should stop when:

- The required evidence gap has been resolved.
- Available sources have been sufficiently explored.
- Further retrieval is unlikely to improve the result.
- An operational limit has been reached.

The system should avoid repeating substantially equivalent queries without a clear reason. Unbounded iteration increases latency and cost and may introduce unrelated evidence.

Autonomous control loops and broader planning policies belong to agent engineering; this section covers retrieval-level iteration.

## 7. Observability and Transformation Traceability

Query processing can fail even when the underlying retriever is functioning correctly. A rewrite may lose a condition, an expansion may broaden the request excessively, or a router may select an unsuitable source.

Without traceability, it becomes difficult to determine which transformation influenced the retrieval outcome.

A production implementation should retain enough information to reconstruct the query-processing path, subject to privacy and data-retention requirements.

Useful diagnostic information includes:

- The original query or an appropriately protected reference to it.
- The transformations applied and their reasons.
- Generated query variants or subqueries.
- The routing decision and selected retrieval method.
- Applicable constraints that transformations must preserve.
- Transformation-validation outcomes and fallback decisions.
- Correlation identifiers linking the processing trace to its retrieval operations.

Not every intermediate value should necessarily be logged. Queries may contain personal, confidential, or sensitive information. Apply suitable access controls, retention limits, and redaction policies.

The purpose is to make transformation decisions inspectable enough to investigate query-processing failures, not to accumulate logs indiscriminately.

Detailed filter-execution diagnosis belongs to **File 03**. General retrieval observability and system-wide diagnosis belong to **RET-11**.

## 8. Practical Engineering Exercise

Design query processing for this request:

> “Why did `worker-v2` fail after deployment? Find related timeout incidents, but exclude staging.”

Implement or design a processing path that retains the original request and applies only justified transformations.

### Required deliverables

**1. Transformation design**

Document the original intent, important entities, relationships, conditions, and exclusions. Identify which transformations are necessary and justify each decision.

**2. Variant and decomposition design**

Explain whether the request benefits from alternative query formulations, decomposition into distinct evidence requirements, or both. Show how generated representations retain the original context.

**3. Routing decision**

Identify the retrieval method or methods you would select, the capabilities that justify the choice, and the fallback policy if the initial method fails to retrieve useful evidence.

**4. Validation tests**

Demonstrate that:

- `worker-v2` remains unchanged.
- The staging exclusion survives every applicable transformation.
- The request remains a question about possible failure causes rather than an assertion about a known cause.
- Subqueries retain the context required to contribute to the original request.
- Relationships between evidence requirements are not lost during decomposition.
- Routing selects a justified retrieval path.
- Invalid or unsupported rewrites are rejected or bypassed.
- Transformation and routing decisions can be traced during debugging.

**5. Failure scenarios**

Explain how the system should respond when the original query is ambiguous, expansion adds irrelevant terminology, decomposition loses a relationship, or routing selects an unsuitable source.

Structured filter construction belongs to **File 02**. Filter execution and empty-result diagnosis belong to **File 03**. Formal retrieval evaluation belongs to **RET-10**.

## 9. Completion Criteria

This chapter is complete when you can:

- Distinguish normalization, rewriting, and expansion by their purposes and risks.
- Justify whether a query needs transformation at all.
- Preserve identifiers, negation, conditions, relationships, and uncertainty.
- Explain when multi-query retrieval differs from decomposition.
- Design subqueries that contribute to the original information need without losing relevant context.
- Select and justify retrieval methods according to query requirements and system capabilities.
- Explain the purpose, retrieval flow, and limitations of HyDE.
- Define evidence-driven stopping conditions for iterative retrieval.
- Trace transformation decisions and test their correctness.

The engineering objective is not to maximize the number of transformations. It is to improve the system's ability to find relevant evidence while preserving the user's information need. Every transformation should have a defined purpose, an understood risk, and a way to validate its behavior.
