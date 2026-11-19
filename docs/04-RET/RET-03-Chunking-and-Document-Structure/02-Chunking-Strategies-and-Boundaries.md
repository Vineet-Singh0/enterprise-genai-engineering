# 02 — Chunking Strategies and Boundaries

## 1. Learning Objectives

After completing this chapter, you should be able to:

- Explain why different chunking strategies produce different retrieval units from the same source document.
- Compare fixed-size, token-based, character-based, recursive, structure-aware, and semantic chunking.
- Explain the purpose and limitations of chunk overlap.
- Identify meaningful chunk boundaries and understand the consequences of splitting across them.
- Evaluate chunking strategies against document characteristics, information needs, processing constraints, and operational requirements.
- Recognize common chunking failures and explain how they affect downstream retrieval.
- Design a defensible chunking strategy without assuming that one configuration works for every corpus.

The objective is not to memorize a list of chunking algorithms. It is to understand how chunk construction changes the units available to a retrieval system and how to select a strategy based on observable requirements.

## 2. Prerequisites

This chapter builds on:

- [Retrieval Granularity and Chunking Objectives](./01-Retrieval-Granularity-and-Chunking-Objectives.md) — establishes why retrieval granularity matters and how to define chunking objectives.
- RET-02 document processing concepts — particularly the distinction between source documents and normalized content.

The next chapter, [Structure, Context Preservation, and Chunk Comparison](./03-Structure-Context-Preservation-and-Chunk-Comparison.md), examines how document structure and surrounding context should be represented in the resulting chunks.

## 3. Why Chunking Strategy Matters

Chunking is not simply dividing text into smaller pieces. It is the process of deciding where one retrieval unit ends and another begins.

Consider a technical manual containing:

- An introduction
- Configuration instructions
- Troubleshooting procedures
- A table of error codes
- Code examples
- Operational warnings

Different chunking strategies can produce substantially different outputs from this same document.

A character-based splitter may divide the manual at regular character intervals. A recursive splitter may attempt to preserve paragraphs before falling back to smaller boundaries. A structure-aware splitter may use headings and sections. A semantic splitter may attempt to identify boundaries where the subject or meaning changes.

Each strategy makes different assumptions about what constitutes a useful unit.

```text
Same source document
        |
        v
  Chunking strategy
        |
        v
Different retrieval units
        |
        v
Different information boundaries,
context, and unit sizes
```

The strategy affects what information remains together, what relationships cross chunk boundaries, how much redundant content is produced, and whether the resulting units satisfy the requirements established in Chapter 01.

A chunking strategy can be technically correct while producing unsuitable retrieval units. For example, a splitter can respect its configured token limit perfectly yet divide a troubleshooting procedure between its symptoms and resolution.

**Engineering principle:** A splitter's successful execution does not prove that its output is suitable for retrieval.

## 4. Core Concepts

### 4.1 Chunking strategy

A chunking strategy defines how source content is divided into retrieval units.

It includes decisions such as:

- Which boundaries should be preferred?
- What should happen when a unit exceeds the size limit?
- Should adjacent units share content?
- Should the source's structural boundaries be preserved?
- What fallback behavior should be used when a preferred boundary is unavailable?

A strategy may combine multiple techniques. For example, a system may use document structure to identify sections, recursive splitting to divide oversized sections, and a token limit to constrain the resulting units.

Therefore, chunking strategies should not always be treated as mutually exclusive alternatives.

### 4.2 Chunk boundary

A chunk boundary marks the end of one unit and the beginning of another.

A boundary can occur:

- Between characters or tokens.
- Between words or sentences.
- Between paragraphs.
- Between sections.
- Between logical units such as procedure steps or code blocks.

Not all boundaries have equal significance.

A boundary between two unrelated sections may be desirable. A boundary between a condition and the action that depends on it may separate information that should remain together.

### 4.3 Chunk size

Chunk size describes the amount of content contained in a chunk. It may be measured in characters, tokens, sentences, or another explicitly defined unit.

These measurements are not interchangeable.

For example, two chunks containing the same number of characters may have different token counts because tokenization depends on the tokenizer and the content. Code, identifiers, punctuation, and multilingual text can produce different tokenization behavior from ordinary prose.

A size limit is a constraint on output, not proof of contextual quality.

### 4.4 Chunk overlap

Chunk overlap is the content shared between adjacent chunks.

If a source sequence is divided into overlapping windows, the end of one chunk appears again at the beginning of the next.

```text
Source sequence:
[A B C D E F G H I J]

Chunk 1:
[A B C D E]

Chunk 2:
        [D E F G H]

Chunk 3:
                [G H I J]
```

In this illustration, adjacent chunks share two units. The units could represent words, tokens, or other content elements, depending on the implementation.

Overlap is intended to reduce the chance that important local context is lost at a boundary. It does not guarantee that the right information remains together, and it does not replace meaningful boundary selection.

### 4.5 Structural and semantic boundaries

A **structural boundary** is indicated by the organization of the source, such as a heading, paragraph, list, table, or code block.

A **semantic boundary** is a point where the subject, meaning, or logical relationship between adjacent content changes.

These boundaries may coincide, but they do not have to.

A paragraph can contain several distinct ideas. Conversely, a single idea may continue across multiple paragraphs or subsections.

A sound strategy considers the boundary signals available in the content instead of assuming that one boundary type always represents the best division.

## 5. Fixed-Size Chunking

### 5.1 How it works

Fixed-size chunking divides content into units of a configured size, optionally using overlap.

For example, a system may create windows of 400 tokens with a 50-token overlap. These values are illustrative configuration choices, not recommended defaults.

```text
Token sequence:
-------------------------------------------------->

Chunk 1: [-------------400 tokens-------------]
Chunk 2:                         [-------------400 tokens-------------]
                               <---50-token overlap--->
```

The exact implementation may advance through the source by a fixed stride or use another windowing rule.

The essential property is that the strategy prioritizes a regular unit size rather than the document's logical structure.

### 5.2 Advantages

Fixed-size chunking is useful when predictable segmentation is more important than preserving every natural boundary.

Potential advantages include:

- Simple implementation.
- Predictable size limits.
- Straightforward processing and debugging.
- Consistent behavior across documents with limited structural information.
- Easier comparison of configurations during controlled experiments.

It can be a reasonable baseline for evaluating whether more sophisticated segmentation is necessary.

### 5.3 Limitations

Fixed-size chunking does not inherently understand the content.

It may:

- Split a sentence or procedure across chunks.
- Separate a heading from the content it introduces.
- Divide a table from its interpretation.
- Place unrelated ideas in the same chunk.
- Produce chunks that begin or end in the middle of a logical unit.

A fixed-size boundary can be acceptable when it falls between independent pieces of content. It becomes problematic when it cuts across a relationship required to interpret the information correctly.

### 5.4 When to consider it

Consider fixed-size chunking when:

- The content has weak or unreliable structure.
- A predictable size constraint is important.
- The content consists of relatively uniform passages.
- A simple baseline is needed before evaluating more complex strategies.

Avoid assuming that a regular window is suitable for every document type simply because it is easy to implement.

## 6. Character-Based and Token-Based Splitting

Character-based and token-based splitting describe how the size of a chunk is measured. They are not necessarily complete strategies for deciding where meaningful boundaries occur.

### 6.1 Character-based splitting

Character-based splitting uses a character count to constrain chunk size.

For example, a system may attempt to keep each chunk below 2,000 characters.

Advantages include straightforward measurement and implementation. However, character counts do not directly express the number of model tokens consumed by a piece of text.

A character limit may therefore be unsuitable when downstream processing has a strict token budget.

### 6.2 Token-based splitting

Token-based splitting measures content using a tokenizer's output.

Token limits can align more directly with the constraints of token-based model processing. However, token counts depend on the tokenizer used.

A limit calculated with one tokenizer may not match the count produced by another tokenizer. If a downstream model has a strict input limit, the engineering team should account for the tokenizer and additional content used by that model.

Token-based splitting also does not inherently preserve meaning. A chunk can remain below its token limit while still dividing a sentence, table, or logical procedure.

### 6.3 The important distinction

Consider the following three decisions:

1. **Boundary selection:** Where should a chunk end?
2. **Size measurement:** How much content is in the chunk?
3. **Limit enforcement:** What happens when a chunk exceeds the allowed size?

A robust implementation treats these as separate concerns.

A system can prefer paragraph boundaries, measure size in tokens, and recursively split oversized paragraphs. This combines semantic or structural boundary preferences with token-based constraint enforcement.

**Engineering principle:** Size measurement constrains a chunking strategy; it does not, by itself, determine the best boundary.

## 7. Recursive Chunking

### 7.1 How it works

Recursive chunking attempts to split content using a hierarchy of preferred separators.

A typical implementation may try:

1. Section or paragraph boundaries.
2. Sentence boundaries.
3. Word boundaries.
4. Character-level boundaries as a final fallback.

The exact hierarchy is implementation-dependent.

The strategy first tries to preserve larger logical units. If a unit exceeds the configured limit, it attempts a smaller boundary. This process continues until the content fits or the available splitting rules are exhausted.

```text
Oversized section
       |
       v
Split at paragraph boundaries
       |
       +---- Units within limit ----> Keep
       |
       +---- Oversized unit
                    |
                    v
             Split at sentences
                    |
                    +---- Within limit ----> Keep
                    |
                    +---- Still oversized
                                 |
                                 v
                         Smaller fallback
```

### 7.2 Advantages

Recursive chunking offers a practical compromise between regular windowing and more content-aware segmentation.

It can:

- Preserve paragraphs when they fit.
- Avoid unnecessary splitting of smaller logical units.
- Enforce size constraints through progressively smaller boundaries.
- Handle documents whose sections vary considerably in length.

It is often useful when content contains recognizable separators but does not have reliable metadata describing every logical unit.

### 7.3 Limitations

Recursive splitting follows its configured separator hierarchy. It does not automatically understand whether a split preserves the meaning of the content.

For example:

- A paragraph may contain a condition and its dependent action.
- A sentence may refer to an earlier sentence for essential context.
- A list may represent one procedure even though individual items can be split.
- A code example may be broken at a syntactically valid but conceptually unhelpful location.

A recursive splitter can also produce oversized or awkward units when the source contains long passages without preferred separators and the fallback behavior is poorly defined.

### 7.4 Engineering considerations

When implementing recursive chunking, define:

- The separator hierarchy.
- The size measurement and maximum size.
- Whether separators are retained in the resulting chunks.
- How oversized units are handled.
- How overlap interacts with the selected boundaries.
- What happens when no preferred separator can satisfy the limit.

These choices should be explicit and testable. Otherwise, behavior can vary unexpectedly across different source formats.

## 8. Structure-Aware Chunking

### 8.1 How it works

Structure-aware chunking uses the organization of the source document to guide segmentation.

Depending on the document format, useful boundaries may include:

- Headings and subsections.
- Paragraphs.
- Lists and list items.
- Tables and their logical groups.
- Code blocks and functions.
- FAQ question-and-answer pairs.
- Procedures and their steps.

For example, a structured operational guide might contain:

```text
Database Operations
    |
    +-- Connection Configuration
    |       |
    |       +-- Configuration fields
    |
    +-- Connection Failures
    |       |
    |       +-- Symptoms
    |       +-- Diagnostic steps
    |       +-- Resolution
    |
    +-- Connection Pooling
            |
            +-- Limits
            +-- Tuning guidance
```

A structure-aware strategy attempts to use these meaningful units instead of treating the document as an undifferentiated character sequence.

### 8.2 Advantages

Structure-aware chunking can preserve relationships that are explicit in the source.

It may be particularly useful for:

- Technical documentation.
- Policies and procedures.
- Product manuals.
- Reports with well-defined sections.
- Content containing tables, lists, or code.

It can also support more predictable handling of document types whose structure has operational significance.

### 8.3 Limitations

Source structure is not a guarantee of semantic quality.

A section may be too large to use as one chunk. A short section may rely on definitions introduced earlier. Headings may be missing, inconsistent, duplicated, or misleading. A table may span multiple pages or contain merged cells that complicate extraction.

Structure-aware chunking also depends on the quality of the structure supplied by document processing. If the source's headings or table boundaries were lost during extraction, the chunking strategy cannot reliably recover all of that information from the missing structure alone.

### 8.4 Handling oversized structural units

A practical approach is to preserve structural boundaries whenever possible while applying a secondary strategy inside oversized units.

For example:

```text
Document
   |
   v
Identify sections
   |
   v
Section within size limit?
   |
   +---- Yes ----> Keep section as a candidate unit
   |
   +---- No -----> Split within section using
                   paragraph or sentence boundaries
```

The resulting units should still be checked for completeness and suitability. Preserving a heading boundary is useful only if the content that follows remains interpretable.

Detailed decisions about heading paths, parent-child relationships, and contextual information are covered in Chapter 03.

## 9. Semantic Chunking

### 9.1 How it works

Semantic chunking attempts to identify boundaries based on changes in meaning or subject rather than relying exclusively on fixed sizes or explicit document structure.

One implementation may compare adjacent sentences or groups of sentences using semantic representations. When the measured change exceeds a configured threshold, the implementation may start a new chunk.

Other implementations use different signals or algorithms. Therefore, semantic chunking is a family of approaches rather than one universally standardized algorithm.

### 9.2 Advantages

Semantic chunking can be useful when:

- The source has weak or inconsistent structural boundaries.
- A passage transitions between distinct subjects.
- Fixed-size boundaries repeatedly combine unrelated content.
- The cost of generating and processing semantic signals is justified by the expected improvement.

Its main motivation is to create units whose internal content is more coherent in meaning.

### 9.3 Limitations

Semantic chunking introduces additional assumptions and complexity.

Potential issues include:

- Thresholds that work for one corpus but not another.
- Excessively large chunks when the subject changes gradually.
- Excessively small chunks when minor wording changes are interpreted as topic changes.
- Dependence on the model or representation used to estimate semantic similarity.
- Additional computational cost and processing latency.
- Difficult-to-explain boundaries when the signals and thresholds are not recorded.

A change in semantic similarity is not always equivalent to a useful retrieval boundary. Two passages may use different terminology while describing the same procedure. Conversely, adjacent passages may use similar language while serving different operational purposes.

Semantic chunking should therefore be evaluated against the actual chunking objectives rather than accepted as inherently superior.

### 9.4 When to consider it

Consider semantic chunking when structural or recursive approaches consistently produce unsuitable boundaries and there is evidence that meaning-based segmentation addresses the observed problem.

Before adopting it, determine whether a simpler strategy with explicit structural boundaries can satisfy the same requirements at lower operational cost.

## 10. Chunk Overlap: Purpose and Trade-offs

### 10.1 Why overlap exists

A boundary can separate information that is locally related.

For example:

> If the database connection fails repeatedly, inspect the connection pool configuration.

A split between the condition and the recommended action can weaken the usefulness of the resulting units. Overlap may preserve some of the nearby text on both sides of a boundary.

The objective is to reduce context loss near boundaries, not to duplicate content indiscriminately.

### 10.2 What overlap can improve

Overlap can help when:

- A sentence or short passage crosses a boundary.
- A procedure's interpretation depends on nearby content.
- The content lacks natural boundaries at the desired size.
- A fixed-window strategy is otherwise appropriate.

Its usefulness depends on the nature of the boundary and the content involved.

### 10.3 What overlap cannot solve

Overlap does not automatically:

- Preserve an entire procedure that spans several chunks.
- Keep a heading connected to every relevant subsection.
- Repair missing source content.
- Reconstruct document structure lost during extraction.
- Guarantee that a retrieved chunk contains all required context.

A larger overlap may copy nearby text without preserving a meaningful relationship. It can also increase redundancy while leaving the original segmentation problem unresolved.

When the real problem is a poor boundary, improving the boundary selection may be more effective than increasing overlap.

### 10.4 Costs of overlap

Overlap can increase:

- Total text stored across chunks.
- The number of tokens processed during downstream ingestion.
- Repeated content across retrieved results.
- The chance of receiving highly similar chunks in a retrieval result set.
- Storage and processing costs.

The magnitude of these costs depends on chunk size, overlap, corpus characteristics, and system architecture.

### 10.5 Selecting overlap

There is no universally correct overlap percentage or token count.

The appropriate choice depends on:

- The expected length of relationships crossing boundaries.
- The chosen chunking strategy.
- The types of content being segmented.
- The cost of duplicated text.
- The severity of boundary-related failures.

Start with the smallest overlap that plausibly addresses an observed boundary problem, then inspect representative outputs. If overlap does not improve contextual completeness, reconsider the segmentation strategy rather than continuing to increase it without evidence.

## 11. Choosing a Strategy

The following comparison describes typical characteristics. Actual behavior depends on the implementation and configuration.

| Strategy | Primary boundary signal | Main advantage | Main limitation |
|---|---|---|---|
| Fixed-size | Regular windows | Predictable unit sizes | Can split logical content |
| Character-based | Character count | Simple measurement | Character count may not reflect token budgets |
| Token-based | Token count | Aligns size measurement with a chosen tokenizer | Does not inherently preserve meaning |
| Recursive | Ordered separator hierarchy | Preserves preferred boundaries when possible | Depends on separator rules and fallback behavior |
| Structure-aware | Source document organization | Uses explicit logical boundaries | Depends on structure quality and size constraints |
| Semantic | Meaning or topic-change signals | Can identify boundaries without reliable document structure | Adds complexity and may produce unstable or unsuitable boundaries |

Character-based and token-based splitting are primarily size-measurement approaches. Fixed-size, recursive, structure-aware, and semantic approaches describe different ways of constructing or selecting boundaries. A practical implementation can combine them.

### 11.1 A decision process

Use the following process as a starting point:

**Step 1: Inspect the source.**

Determine whether the content has reliable headings, paragraphs, tables, lists, code blocks, or other useful boundaries.

**Step 2: Identify the dominant boundary problem.**

Examples include:

- No reliable structure.
- Oversized sections.
- Meaningful units repeatedly split by fixed windows.
- Mixed topics combined in one chunk.
- Inconsistent source formatting.

**Step 3: Establish hard constraints.**

Identify the maximum permitted chunk size, tokenizer requirements, and any processing constraints that the implementation must satisfy.

**Step 4: Choose the simplest plausible strategy.**

Use a simple baseline when it satisfies the objectives. Introduce recursive, structure-aware, or semantic logic when the content and observed failures justify it.

**Step 5: Define fallback behavior.**

Decide what happens when the preferred boundary cannot satisfy the size limit or when the expected structure is unavailable.

**Step 6: Inspect the output.**

Examine representative chunks, including difficult cases. Verify that the chosen strategy behaves as intended.

**Step 7: Compare alternatives when necessary.**

Use the same representative documents and the same chunking objectives to compare candidate strategies. Avoid changing multiple parameters at once when trying to understand why one configuration performs differently.

### 11.2 Example: Internal troubleshooting documentation

Suppose a corpus contains troubleshooting procedures with symptoms, diagnostic steps, commands, and resolutions.

A fixed-size splitter may separate commands from their explanations. A recursive splitter may preserve paragraphs but divide a long procedure. A structure-aware approach may preserve the procedure's explicit sections. Semantic chunking may be useful if the source structure is inconsistent.

A defensible initial design might be:

1. Preserve reliable document and section boundaries.
2. Split oversized sections recursively at paragraph or sentence boundaries.
3. Apply a token-based maximum size.
4. Use limited overlap only where boundary inspection demonstrates a need.
5. Inspect procedures that exceed the limit or depend on information in preceding sections.

This is a starting hypothesis, not a universal recommendation. If the corpus has poor structure, a different strategy may be necessary.

## 12. Common Failure Modes

### 12.1 Optimizing size while ignoring boundaries

**Failure:** Every chunk fits the configured size limit, but important logical units are split.

**Why it happens:** Size compliance is treated as the sole quality criterion.

**Correction:** Inspect whether the boundaries preserve the relationships required by the retrieval objectives.

### 12.2 Assuming recursive splitting understands meaning

**Failure:** The implementation preserves paragraphs but still separates dependent information.

**Why it happens:** Separator order is mistaken for semantic understanding.

**Correction:** Treat recursive splitting as a boundary-prioritization mechanism. Validate its output against the content's logical structure.

### 12.3 Increasing overlap to compensate for poor segmentation

**Failure:** Chunks contain substantial repeated text, yet important relationships remain difficult to interpret.

**Why it happens:** Overlap is used as a substitute for choosing appropriate boundaries.

**Correction:** Identify the specific relationship being lost and determine whether the boundary or strategy should change.

### 12.4 Treating semantic chunking as automatically better

**Failure:** A more complex algorithm creates inconsistent chunk sizes or splits related content.

**Why it happens:** Semantic sophistication is assumed to guarantee retrieval suitability.

**Correction:** Compare its output with a simpler baseline using the same objectives and representative documents.

### 12.5 Ignoring the source format

**Failure:** Tables, code, lists, and procedures are split as ordinary prose.

**Why it happens:** One generic rule is applied to every content type.

**Correction:** Select boundaries appropriate to the source format and inspect cases that do not fit the default rules.

### 12.6 Failing to define fallback behavior

**Failure:** A long passage produces oversized chunks, empty units, or unexpected fragmentation.

**Why it happens:** The strategy specifies preferred separators but not what happens when they are insufficient.

**Correction:** Define and test fallback behavior, including content that contains no preferred separator within the configured size limit.

### 12.7 Assuming all chunks need the same configuration

**Failure:** One configuration works for prose but performs poorly on tables, code, or procedural content.

**Why it happens:** Corpus uniformity is assumed without evidence.

**Correction:** Consider whether different document types require distinct, explicitly governed chunking policies. Avoid adding multiple policies unless the observed content differences justify the added complexity.

## 13. Production Engineering Considerations

Chunking is a data-processing operation with persistent downstream consequences. A production implementation should make its behavior observable and reproducible.

### 13.1 Make configuration explicit

Record the configuration needed to understand how chunks were generated, such as:

- Strategy and implementation version.
- Size unit and configured limit.
- Tokenizer identity and version, when applicable.
- Separator hierarchy.
- Overlap settings.
- Fallback behavior.
- Document-type-specific rules.

Not every system requires every field, but the configuration should be sufficient to explain important segmentation decisions.

### 13.2 Handle content that violates assumptions

Test content such as:

- Extremely long paragraphs.
- Documents without headings.
- Empty or nearly empty sections.
- Tables that span multiple pages.
- Long code blocks.
- Mixed-language content.
- Malformed or inconsistent structure.

A production pipeline should have defined behavior for these cases rather than relying on the assumption that source content is well-formed.

### 13.3 Preserve traceability

When possible, retain enough information to connect each generated chunk to its source location. This supports inspection, debugging, and later analysis.

The design of document identity, provenance, and lifecycle belongs to RET-02. The representation of parent relationships and contextual information belongs to Chapter 03. This chapter's concern is that the selected chunking strategy should not make those relationships unnecessarily difficult to preserve.

### 13.4 Manage changes to chunking rules

Changing chunk size, overlap, separator priorities, or segmentation algorithms can change the set and boundaries of generated units.

When chunking is part of a deployed retrieval system, treat meaningful configuration changes as data-processing changes. Determine which downstream artifacts depend on the generated chunks and whether they must be regenerated.

Do not assume that changing a configuration automatically updates previously processed content.

### 13.5 Inspect distributions, not only averages

Average chunk size can conceal important problems. A corpus may have a reasonable average while containing many extremely small chunks, oversized units, or unexpected fragmentation.

Useful diagnostics include:

- Chunk-size distribution.
- Proportion of units requiring fallback splitting.
- Frequency of boundary types.
- Number of chunks generated per source document.
- Frequency of unusually small or large units.
- Examples of chunks produced from difficult document types.

These diagnostics help identify implementation behavior. They do not, by themselves, prove that the chunks are semantically suitable.

Formal retrieval evaluation and end-to-end effectiveness measurement are covered in RET-10.

## 14. Engineering Decision Record: Example

The following is an illustrative decision record for a technical-documentation corpus.

**Problem:** The initial fixed-window strategy frequently splits troubleshooting procedures across chunks.

**Constraint:** Chunks must remain within a configured token limit.

**Options considered:**

- Continue with fixed windows and increase overlap.
- Use recursive splitting with paragraph and sentence boundaries.
- Use document structure to identify sections, then recursively split oversized sections.
- Introduce semantic chunking throughout the corpus.

**Decision:** Begin with structure-aware segmentation for documents with reliable headings, recursively split oversized sections, and enforce the token limit. Use overlap only where boundary inspection supports it.

**Rationale:** This approach directly addresses the observed boundary problem while keeping the implementation simpler than a corpus-wide semantic segmentation system.

**Risks:**

- Some documents may have unreliable headings.
- Long procedures may still require additional boundary decisions.
- Recursive fallback may split logically dependent content.
- Different document types may need different rules.

**Validation plan:** Inspect representative documents, including long procedures, unstructured pages, tables, and code examples. Compare the resulting units against the established chunking objectives.

**Reconsider the decision if:** The chosen strategy continues to produce unsuitable boundaries in a substantial portion of the corpus, or a more complex strategy demonstrates a clear benefit that justifies its additional operational cost.

The purpose of this record is to make assumptions, trade-offs, and reconsideration criteria explicit. The selected strategy is not permanent simply because it was implemented first.

## 15. Interview Questions

Use these questions to test your ability to reason about chunking decisions rather than recall definitions.

1. Why can a fixed-size chunking implementation satisfy every configured size limit and still produce poor retrieval units?
2. What is the difference between token-based size measurement and a token-aware boundary-selection strategy?
3. How does recursive chunking decide where to split content, and what does it fail to understand automatically?
4. When would structure-aware chunking be preferable to semantic chunking?
5. Describe a case where semantic chunking might create worse boundaries than a recursive splitter.
6. Why might increasing overlap fail to solve a context-loss problem?
7. How would you design fallback behavior for a document containing a paragraph that exceeds the maximum token limit?
8. Why should chunking rules be inspected separately for prose, tables, code, and procedural content?
9. What configuration information would you retain to reproduce chunk generation?
10. A team proposes increasing overlap because retrieval results frequently contain incomplete procedures. What evidence would you request before approving the change?

For each answer, explain the assumptions you are making, the alternatives you considered, and the trade-offs behind your decision.

## 16. Quick Revision

- **Fixed-size chunking:** Divides content into regular windows, prioritizing predictable size.
- **Character-based splitting:** Measures size using characters.
- **Token-based splitting:** Measures size using a specific tokenizer.
- **Recursive chunking:** Tries preferred separators in a defined hierarchy and falls back to smaller boundaries.
- **Structure-aware chunking:** Uses explicit source organization to guide boundaries.
- **Semantic chunking:** Uses signals related to meaning or topic changes to select boundaries.
- **Overlap:** Repeats some content across adjacent chunks to reduce certain forms of boundary-related context loss.
- **Fallback behavior:** Defines what happens when preferred boundaries cannot satisfy constraints.
- **Strategy selection:** Starts with source characteristics, chunking objectives, and hard constraints, then uses representative output inspection to validate the decision.

Remember three distinctions:

1. **Size compliance is not contextual quality.**
2. **Overlap is not a substitute for meaningful boundaries.**
3. **A more complex strategy is not automatically a better strategy.**

## 17. Key Takeaways

Chunking strategies determine how source content becomes the units a retrieval system can work with. Their value depends on how well they preserve the relationships and information required by the intended retrieval tasks while respecting operational constraints.

A fixed-size strategy provides simplicity and predictability. Recursive splitting prioritizes preferred separators. Structure-aware chunking uses the source's organization. Semantic chunking attempts to detect meaning-related boundaries. Character and token limits constrain size, while overlap can reduce some forms of local context loss at the cost of additional duplication.

No strategy is universally optimal. Good engineering requires identifying the actual boundary problem, selecting the simplest plausible solution, defining fallback behavior, and inspecting representative outputs.

The next chapter examines a closely related question: even after boundaries have been chosen, what structural and contextual information must remain available for each chunk to be interpreted correctly?

## Further Reading

Consult the documentation for the specific splitting implementation used by your system, especially its separator ordering, size-measurement behavior, overlap semantics, and fallback handling.

When comparing implementations, verify their actual behavior rather than relying only on the names of their strategies. Two tools described as recursive or semantic splitters may make different decisions because their algorithms, defaults, and configuration options differ.
