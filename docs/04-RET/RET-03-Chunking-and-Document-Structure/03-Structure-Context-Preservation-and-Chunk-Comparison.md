# 03 — Structure, Context Preservation, and Chunk Comparison

## 1. Learning Objectives

After completing this chapter, you should be able to:

- Explain why a chunk's text alone may be insufficient to interpret its meaning.
- Identify structural relationships in documents that should remain available after chunking.
- Preserve useful heading paths, section relationships, and source context without blindly duplicating large amounts of text.
- Explain the challenges of chunking tables, lists, code, procedures, and hierarchical documents.
- Distinguish between information contained directly in a chunk and context available through an associated parent or source relationship.
- Compare candidate chunking outputs using contextual completeness, boundary quality, redundancy, and interpretability.
- Develop a practical inspection procedure for deciding whether generated chunks preserve the relationships required by their intended use.

The central objective is to ensure that chunk boundaries do not make source information misleading, ambiguous, or unnecessarily difficult to interpret.

## 2. Prerequisites

This chapter builds on:

- [01 — Retrieval Granularity and Chunking Objectives](./01-Retrieval-Granularity-and-Chunking-Objectives.md) — establishes the requirements a retrieval unit should satisfy.
- [02 — Chunking Strategies and Boundaries](./02-Chunking-Strategies-and-Boundaries.md) — explains the strategies used to create retrieval units and the trade-offs involved in selecting boundaries.

This chapter focuses on what must remain interpretable after those boundaries have been selected. It does not repeat the chunking-strategy catalog or introduce a formal retrieval evaluation framework.

## 3. The Problem: A Chunk Can Be Textually Valid but Contextually Incomplete

Consider this passage from an imaginary database operations manual:

> Connection failures may occur when the configured pool limit is exhausted. Before increasing the limit, inspect active connections and database capacity.

A chunking process might produce the following units:

**Chunk A**

> Connection failures may occur when the configured pool limit is exhausted.

**Chunk B**

> Before increasing the limit, inspect active connections and database capacity.

Both chunks contain grammatical text. Neither contains an obvious extraction error. Yet each has limitations when interpreted independently.

Chunk A describes a condition but does not contain the recommended response. Chunk B contains an instruction, but the phrase “the limit” depends on preceding context.

The problem is not necessarily that the chunks are invalid. The problem is that the relationships needed to interpret them may not remain available in the chunk itself.

There are several ways to address this:

- Keep the related content together in one retrieval unit.
- Associate the chunk with a larger parent section.
- Preserve a meaningful heading or section path.
- Add a concise contextual label when it improves interpretation.
- Make the surrounding source content available through a reliable relationship.

These approaches are not interchangeable in every situation. The appropriate choice depends on how the resulting chunks will be used.

```text
Source document
      |
      v
Structured content
      |
      v
Chunk boundaries
      |
      v
Resulting chunks
      |
      +---- Context retained in the chunk
      |
      +---- Context available through a relationship
      |
      +---- Context lost or made ambiguous
```

**Engineering principle:** A chunk should preserve the context required for its intended use, either directly or through a reliable, usable relationship to its source.

## 4. Understanding Document Structure

### 4.1 Structure is more than formatting

Document structure describes how information is organized and how its parts relate to one another.

A document may contain:

- Titles and headings.
- Sections and subsections.
- Paragraphs.
- Lists and nested lists.
- Tables, captions, and footnotes.
- Code blocks and explanations.
- Procedures and ordered steps.
- Warnings, prerequisites, and exceptions.
- References to other sections or documents.

These elements often express relationships that are not fully represented by the text of an individual paragraph.

For example, a statement beneath a heading named “Production Database” may have a different interpretation from the same statement beneath “Local Development Database.”

If chunking removes the heading without preserving another reliable way to identify the relevant context, the statement can become ambiguous.

### 4.2 Hierarchical relationships

Many documents have a hierarchy:

```text
Operations Manual
    |
    +-- Database Operations
            |
            +-- Connection Management
            |       |
            |       +-- Configuration
            |       +-- Failure Diagnosis
            |       +-- Recovery Procedure
            |
            +-- Backup Management
                    |
                    +-- Backup Schedule
                    +-- Restore Procedure
```

A paragraph under “Recovery Procedure” inherits meaning from its parent sections. The paragraph may not repeat that it concerns database connections because the original document's organization already establishes that fact.

When the paragraph becomes a separate retrieval unit, the system must preserve enough information to interpret it correctly.

That does not mean every chunk must contain the complete document hierarchy as text. It means the relevant relationship must remain available in a form that the consuming system can actually use.

### 4.3 Structural context versus semantic context

Structural context comes from the organization of the source, such as a heading or parent section.

Semantic context comes from the meaning and relationships needed to understand the content.

The two overlap, but they are not identical.

A heading can provide useful structural context without resolving every ambiguity. Conversely, a paragraph can contain sufficient semantic context even if its original heading is absent.

For example:

- Heading: `Connection Management`
- Paragraph: `Increase the limit only after verifying database capacity.`

The heading helps establish the subject. The paragraph still assumes that the reader knows which limit is being discussed.

A contextual label should not be treated as a substitute for information that is essential to the instruction itself.

## 5. Preserving Context Without Blind Duplication

### 5.1 Three ways to represent context

A system can preserve context in several ways.

| Approach | How it works | Main consideration |
|---|---|---|
| Self-contained chunk | The unit contains enough information to be interpreted on its own for the intended task | May produce larger units or repeat information |
| Context-enriched chunk | The unit includes selected contextual information, such as a title or heading path | Added context must be accurate, relevant, and distinguishable from source content |
| Relationship-associated chunk | The unit retains a reliable relationship to its parent section or source content | The consuming system must be able to resolve and use that relationship |

These approaches can also be combined.

For example, a chunk may include its immediate heading while retaining a parent-section identifier that allows the application to retrieve a broader passage when necessary.

### 5.2 Self-contained does not mean universally complete

A self-contained chunk is interpretable without needing to recover surrounding source text for a particular intended use.

It does not need to contain every detail from the original document.

A chunk describing a configuration parameter might be self-contained if it includes the parameter's name, meaning, and applicable condition. It may not need the entire configuration manual.

The required degree of completeness depends on the question the retrieval system is expected to answer.

A short definition, a troubleshooting procedure, and a compliance policy may require different amounts of context.

### 5.3 Context enrichment

Context enrichment adds selected information that helps identify or interpret a chunk.

For example:

Original chunk:

> Increase the limit only after verifying database capacity.

Context-enriched version:

> **Section:** Database Operations → Connection Management → Recovery Procedure  
> **Content:** Increase the limit only after verifying database capacity.

The heading path provides useful orientation. However, it does not resolve the ambiguous word “limit” by itself.

A more appropriate correction might require retaining the preceding explanation or rewriting the chunk representation to identify the specific configuration setting, provided that the transformation is faithful to the source.

Context enrichment should therefore be guided by a specific interpretability problem rather than applied mechanically.

### 5.4 Relationship-associated context

Sometimes the most appropriate design is to keep chunks relatively focused and retain their relationships to larger source units.

For example:

```text
Parent section: Connection Management
    |
    +-- Chunk 1: Symptoms
    |
    +-- Chunk 2: Diagnostic steps
    |
    +-- Chunk 3: Recovery procedure
```

The parent relationship allows a consuming system to recover broader context when required.

This design can avoid copying an entire section into every child chunk. However, it introduces a dependency: the parent relationship must be preserved correctly, and the application must know when and how to use it.

A relationship that exists only in metadata but is never resolved by the consuming system does not automatically improve interpretation.

### 5.5 When to choose each approach

Use the intended retrieval task to guide the decision.

- Prefer self-contained units when the information is short and can be interpreted accurately without much surrounding content.
- Consider context enrichment when a small amount of missing structural information creates ambiguity.
- Consider relationship-associated context when the source is hierarchical or when the broader section is too large to duplicate in every chunk.
- Combine approaches when a focused chunk needs a small contextual label but occasionally requires access to a larger parent passage.

Avoid requiring every chunk to be fully independent if the architecture can reliably preserve and use source relationships. Equally, avoid relying on external context when the application will not retrieve that context before interpreting the chunk.

## 6. Heading Paths and Section Identity

### 6.1 Why heading paths matter

A heading path identifies the location of a passage within the document hierarchy.

For example:

`Operations Manual > Database Operations > Connection Management > Recovery Procedure`

This path helps distinguish passages that might otherwise appear similar.

A statement such as “Restart the service after configuration changes” may be ambiguous without knowing which service or configuration area the section describes.

A heading path can reduce that ambiguity by preserving the passage's organizational location.

### 6.2 What a heading path cannot guarantee

Heading paths are useful context, but they are not a universal solution.

They may be insufficient when:

- The heading is vague.
- The section contains several unrelated procedures.
- The statement depends on a definition introduced elsewhere.
- The heading is incorrectly assigned during extraction.
- The original document contains duplicate or inconsistent headings.
- The content refers to a condition or exception in another section.

Adding more headings does not necessarily make a chunk more interpretable. Only relevant and accurate context should be retained.

### 6.3 Avoiding misleading enrichment

Contextual metadata and generated prefixes should be faithful to the source.

A system should not infer a precise heading relationship merely because it seems plausible. If structural extraction is uncertain, the uncertainty should be handled explicitly rather than silently presenting the inferred relationship as established fact.

Likewise, contextual prefixes should not introduce recommendations, conditions, or interpretations that the source does not support.

The objective is to preserve meaning, not to manufacture additional meaning.

## 7. Preserving Tables, Lists, Code, and Procedures

Different content types express relationships differently. Treating every source element as ordinary prose can destroy those relationships even when the resulting text remains readable.

### 7.1 Tables

A table often communicates meaning through the combination of:

- Column headers.
- Row labels.
- Cell values.
- Captions.
- Footnotes.
- Units and qualifications.

Consider the following example:

| Error code | Meaning | Recommended action |
|---|---|---|
| DB-101 | Connection pool exhausted | Inspect active connections |
| DB-205 | Authentication rejected | Verify credentials and permissions |

If a chunk contains only:

> DB-205 — Authentication rejected

the error code and description remain, but the recommended action is absent.

If a chunk contains only:

> Verify credentials and permissions

the action may be difficult to associate with the relevant error.

A table-aware representation should preserve the relationships needed to interpret each record. Depending on the table and retrieval task, that may involve keeping rows together, repeating relevant headers, retaining captions, or representing rows as structured records.

Repeating headers may improve interpretability, but it also introduces duplication. The decision should depend on whether the repeated information is needed to interpret the extracted rows.

For complex tables, inspect merged cells, multi-level headers, units, and footnotes. A plain-text extraction may flatten these relationships in ways that are not immediately obvious.

### 7.2 Lists

Lists may represent independent items, grouped concepts, or a sequence of dependent actions.

Consider:

1. Stop the application.
2. Back up the configuration.
3. Update the connection settings.
4. Restart the application.
5. Verify connectivity.

Splitting each item into an independent chunk can remove the ordering and purpose of the procedure.

A better representation may keep the complete procedure together or preserve its sequence and parent relationship across smaller units.

However, not every list must remain intact. A list of independent product features may be divided into smaller units without losing essential meaning.

The important question is whether the relationship between list items matters for the intended use.

### 7.3 Code blocks

Code is sensitive to structure and dependencies.

A code block may contain:

- Imports.
- Function or class definitions.
- Configuration.
- Comments.
- Initialization.
- Error handling.
- Usage examples.

A syntactically valid fragment may still be difficult to understand without its function signature or required configuration.

For example, a chunk containing only a function call may not reveal which variables must be initialized or which function is being invoked.

When handling code, consider whether the relevant unit should be a complete function, class, configuration block, or example. If a large code unit must be split, preserve enough information to identify its role and dependencies.

Do not assume that splitting at a character or line boundary produces an independently meaningful code unit.

### 7.4 Procedures and workflows

Procedures frequently contain dependencies between conditions, actions, and expected results.

A procedure might follow this pattern:

```text
Condition
    |
    v
Diagnostic check
    |
    v
Decision
    |
    +---- Condition A ----> Action A
    |
    +---- Condition B ----> Action B
    |
    v
Verification
```

A chunk containing only an action may be misleading if the action is valid only under a particular condition.

When chunking procedures, preserve the relationships between prerequisites, steps, decisions, exceptions, and verification where they are needed to execute the procedure safely and correctly.

If the complete procedure is too large for one unit, smaller units should retain reliable relationships to the broader workflow.

### 7.5 Content-type comparison

| Content type | Relationships to preserve | Common failure |
|---|---|---|
| Prose | Subject, references, qualifying statements | Sentence separated from required context |
| Tables | Headers, row values, units, footnotes | Values detached from their labels |
| Lists | Grouping, order, dependencies | Steps become isolated instructions |
| Code | Definitions, dependencies, configuration | Fragment loses its required setup |
| Procedures | Conditions, actions, exceptions, verification | Action is separated from the condition that makes it valid |

These are inspection priorities, not universal rules requiring every element of a particular type to remain in one chunk.

## 8. Context Preservation Versus Redundancy

Preserving context often introduces a trade-off: adding information can improve interpretability, but repeating too much information can make the corpus unnecessarily large and repetitive.

### 8.1 Useful context

Context is useful when it helps answer a concrete interpretive question.

Examples include:

- Which system does this instruction concern?
- Which configuration parameter is being discussed?
- Which table column does this value belong to?
- Which procedure contains this step?
- Which condition makes this action appropriate?

If a heading or short label resolves the ambiguity, repeating an entire parent section may be unnecessary.

### 8.2 Unnecessary duplication

Suppose a document contains a long introduction that applies to every section. Copying the complete introduction into every chunk may substantially increase duplicated text without improving interpretation of most chunks.

Potential consequences include:

- Increased storage and processing requirements.
- Repeated information across generated units.
- Less distinct content within each unit.
- More repetitive results when several related chunks are retrieved.

The presence of repeated content does not automatically make a chunk unsuitable. Some duplication is intentional and useful. The question is whether the additional text provides sufficient interpretive value.

### 8.3 A practical decision rule

For each proposed contextual addition, ask:

1. What ambiguity or missing relationship does it resolve?
2. Is the information accurate and available from the source?
3. Can a shorter label or relationship represent it adequately?
4. Does the consuming system actually use the added context?
5. Does the additional text introduce substantial redundancy?

Prefer the smallest reliable representation that satisfies the contextual requirement.

This is a design heuristic, not a mathematical rule. Some content, such as a complex procedure, may require substantial surrounding information to remain meaningful.

## 9. Comparing Chunking Outputs

Selecting a chunking strategy is only part of the task. Engineers also need a repeatable way to inspect what the strategy actually produces.

This section provides a practical comparison method. It is not a formal retrieval evaluation framework and does not define ranking metrics or end-to-end retrieval success criteria.

### 9.1 Compare the same source material

When comparing candidate outputs, use the same representative source passages.

The comparison should include ordinary content and difficult cases such as:

- Long sections.
- Short sections with important headings.
- Tables and lists.
- Procedures that span multiple paragraphs.
- Code examples.
- Passages containing references to earlier content.

If each candidate is tested on different source material, differences in the output may reflect differences in the input rather than the chunking approach.

### 9.2 Inspection dimensions

Use the following dimensions to examine each candidate.

**Contextual completeness**

Can the chunk be interpreted accurately for its intended use, either directly or through a reliable relationship to surrounding content?

**Boundary quality**

Do the chunk boundaries preserve important relationships, or do they separate conditions, explanations, values, and actions that belong together?

**Redundancy**

Does the chunk repeat substantial information unnecessarily? Does the comparison reveal avoidable duplication between adjacent units?

**Interpretability**

Can a reviewer identify what the chunk is about, what its statements refer to, and what qualifications apply?

These dimensions are related but distinct. A chunk can have good boundary quality while lacking a necessary heading. Another can be interpretable but contain excessive repeated content.

### 9.3 A practical comparison worksheet

For each representative source passage, record observations such as the following:

| Inspection dimension | Questions to ask | Evidence to record |
|---|---|---|
| Contextual completeness | Is required context present or reliably accessible? | Missing conditions, definitions, or dependencies |
| Boundary quality | Are related statements split appropriately? | Specific relationships preserved or separated |
| Redundancy | Is repeated content useful or unnecessary? | Repeated passages, labels, or explanations |
| Interpretability | Can the unit be understood without misleading assumptions? | Ambiguous references, unclear subjects, missing labels |

Use concrete examples rather than relying on impressions such as “this chunk looks better.”

### 9.4 Example comparison

Suppose a troubleshooting section contains a failure condition, a diagnostic check, and a resolution.

Three candidate outputs are produced.

**Candidate A — Broad section**

The entire troubleshooting section is retained as one unit.

- Contextual completeness: potentially high because the condition, diagnostic check, and resolution remain together.
- Boundary quality: the relevant relationships are preserved, but the unit may contain several distinct troubleshooting topics.
- Redundancy: low duplication within the unit, although it may be repeated if the same broad section is copied into multiple units elsewhere.
- Interpretability: potentially high, provided the section is internally coherent and not excessively broad.

**Candidate B — Independent sentences**

Each sentence becomes a separate unit.

- Contextual completeness: potentially low when sentences depend on neighboring statements.
- Boundary quality: meaningful relationships may be separated.
- Redundancy: may be low within individual chunks, but later contextual enrichment could introduce duplication.
- Interpretability: depends on whether each sentence contains enough information to stand alone.

**Candidate C — Related procedure units**

The condition, diagnostic check, and resolution are retained together where practical. If the procedure is too large, smaller units preserve a reliable relationship to the broader procedure.

- Contextual completeness: potentially high for the intended troubleshooting task.
- Boundary quality: designed to preserve the procedure's dependencies.
- Redundancy: can remain controlled if broader context is associated rather than copied indiscriminately.
- Interpretability: potentially high when the procedure identity and required context remain available.

Candidate C is a reasonable hypothesis for this particular example, not a universal winner. Candidate A may be preferable for a short, cohesive section. Candidate B may be appropriate for independent statements. The correct choice depends on the actual source, the intended retrieval unit, and the evidence collected during inspection.

### 9.5 Record the decision

A useful comparison record includes:

- The source passages used.
- The candidate configurations.
- Representative output examples.
- Observed contextual gaps.
- Boundary failures.
- Redundancy introduced.
- Interpretability issues.
- The selected approach and its rationale.
- Remaining limitations and conditions that would trigger reconsideration.

This creates an auditable engineering decision rather than an undocumented preference.

## 10. Common Failure Modes

### 10.1 Treating a chunk as self-contained by default

**Failure:** Every chunk is expected to contain all the context required for every possible question.

**Why it happens:** Independent interpretation is confused with the only acceptable representation.

**Correction:** Determine the context required by the intended task. Preserve it directly or through a relationship the consuming system can reliably use.

### 10.2 Keeping headings without checking their usefulness

**Failure:** Heading paths are added to every chunk, but ambiguous references remain unresolved.

**Why it happens:** Structural labels are assumed to guarantee semantic completeness.

**Correction:** Identify the specific ambiguity and determine whether the heading path, additional source text, or a parent relationship resolves it.

### 10.3 Duplicating complete parent sections

**Failure:** Large amounts of parent content are repeated in every child chunk.

**Why it happens:** Duplication is used to avoid designing reliable contextual relationships.

**Correction:** Determine whether a shorter label, selected contextual text, or parent relationship can satisfy the requirement with less redundancy.

### 10.4 Flattening tables into unstructured text

**Failure:** Cell values become detached from their headers, units, or row relationships.

**Why it happens:** Extraction and chunking preserve text but lose the relationships expressed by the table layout.

**Correction:** Inspect the table's logical organization and preserve the labels and relationships required to interpret each extracted unit.

### 10.5 Splitting dependent procedures into isolated actions

**Failure:** Individual steps are retrievable, but their prerequisites and conditions are missing.

**Why it happens:** Each step is treated as independent content.

**Correction:** Preserve the procedure as a cohesive unit or maintain reliable relationships to the larger workflow.

### 10.6 Assuming context metadata is always available downstream

**Failure:** Chunks retain parent identifiers or heading paths, but the application ignores them.

**Why it happens:** Storing context is mistaken for using context.

**Correction:** Verify that the consuming system can resolve and apply the relationship at the point where it is needed.

### 10.7 Comparing outputs by appearance alone

**Failure:** A chunking strategy is selected because its output looks cleaner.

**Why it happens:** Visual neatness is used as a substitute for explicit inspection criteria.

**Correction:** Compare contextual completeness, boundary quality, redundancy, and interpretability using the same representative source material.

## 11. Production Engineering Considerations

### 11.1 Preserve context as a deliberate design choice

Decide which contextual information belongs directly in the chunk and which can be maintained through a relationship.

The choice should be explicit rather than an accidental consequence of the splitting library's defaults.

### 11.2 Make structural assumptions visible

If the pipeline assumes that headings identify sections or that list items are independent, record those assumptions and test them against representative documents.

Incorrect assumptions about structure can silently produce misleading chunks.

### 11.3 Inspect changes to context representation

Changing heading enrichment, parent relationships, table handling, or procedure grouping can alter the information represented by each chunk.

Review these changes using representative examples. Ensure that the new representation remains faithful to the source and that dependent application behavior is still correct.

### 11.4 Distinguish source fidelity from interpretability

A chunk may faithfully reproduce a sentence while still being difficult to interpret outside its original section.

Conversely, adding a generated contextual label may improve interpretability but introduce an error if the label is incorrect.

Production systems should therefore inspect both whether the source information was preserved and whether the resulting representation communicates it accurately.

### 11.5 Do not confuse inspection with retrieval evaluation

This chapter's comparison procedure examines the quality of generated chunk representations. It does not establish whether a retrieval system returns the right results for actual queries.

End-to-end retrieval effectiveness, evaluation datasets, and formal metrics belong to RET-10.

## 12. Engineering Exercise

Use a short technical document that contains at least one heading hierarchy, one list or procedure, and one table or code example.

Generate two or more candidate chunking outputs using strategies covered in Chapter 02.

For each candidate:

1. Select several representative chunks.
2. Identify the context needed to interpret each chunk.
3. Record whether that context is present directly or accessible through a reliable relationship.
4. Inspect boundaries that separate conditions, explanations, table labels, code dependencies, or procedure steps.
5. Identify unnecessary repetition.
6. Explain whether a reader could misinterpret the chunk.
7. Compare the candidates using contextual completeness, boundary quality, redundancy, and interpretability.
8. Recommend a candidate and explain the trade-offs.
9. Identify a case where your preferred candidate might fail.

Do not select a winner merely because the chunks are shorter, more uniform, or visually cleaner.

Your explanation should connect the observed output to the requirements of the intended retrieval task.

## 13. Interview Questions

1. Why can a chunk contain all the original words from a sentence and still lose important context?
2. What is the difference between a self-contained chunk and a chunk associated with a parent section?
3. When would adding a heading path be insufficient to resolve ambiguity?
4. How would you preserve the meaning of a table when its rows are split into separate retrieval units?
5. Why can splitting a numbered procedure into individually readable steps still produce unsuitable chunks?
6. How would you decide whether to repeat contextual text or preserve a relationship to the parent section?
7. What can go wrong if a pipeline stores parent identifiers but the consuming application never resolves them?
8. How would you compare two chunking outputs without confusing visual cleanliness with contextual quality?
9. What is the difference between inspecting chunk quality and measuring end-to-end retrieval effectiveness?
10. A team proposes adding the complete section heading hierarchy to every chunk. What benefits, limitations, and costs would you discuss before approving the change?

For each answer, identify the relevant assumptions, describe at least one alternative, and explain the trade-off behind your recommendation.

## 14. Quick Revision

- **Document structure:** The organization and relationships among headings, sections, tables, lists, code, and other content.
- **Structural context:** Information conveyed by the source's organization.
- **Semantic context:** Meaning and relationships required to interpret content correctly.
- **Self-contained chunk:** A unit that can be interpreted without recovering surrounding source text for its intended use.
- **Context-enriched chunk:** A unit augmented with selected contextual information.
- **Relationship-associated chunk:** A unit connected to a parent or source passage that can provide additional context when needed.
- **Heading path:** A representation of the chunk's location in the document hierarchy.
- **Contextual completeness:** Whether the context required for the intended use is present or reliably accessible.
- **Boundary quality:** Whether chunk boundaries preserve the relationships important to interpretation.
- **Redundancy:** Repeated information that may or may not provide sufficient value to justify its cost.
- **Interpretability:** Whether a chunk can be understood accurately without misleading assumptions.

Keep these distinctions in mind:

1. A chunk does not always need to contain all context physically.
2. Context metadata is useful only when it is accurate and can be used.
3. Preserving every word is not the same as preserving every relationship.
4. More contextual text is not automatically better.
5. Chunk inspection and retrieval evaluation answer different engineering questions.

## 15. Key Takeaways

Chunk boundaries determine which pieces of information remain together, but the resulting text alone does not always communicate the source's full meaning.

Document structure, heading paths, table relationships, list ordering, code dependencies, and procedural conditions can all affect how a chunk should be interpreted. These relationships may be preserved within the chunk, represented through carefully selected contextual enrichment, or maintained through a reliable relationship to a larger source unit.

Context preservation should be deliberate. Blindly duplicating parent content can create unnecessary redundancy, while relying on metadata that the consuming application never uses can leave the original ambiguity unresolved.

A disciplined engineering process compares representative outputs using contextual completeness, boundary quality, redundancy, and interpretability. It records concrete observations and makes the trade-offs explicit.

The central lesson of RET-03 is that chunking is not merely a size-management operation. It is a representation decision: the system must preserve the information and relationships needed for the resulting retrieval units to serve their intended purpose.
