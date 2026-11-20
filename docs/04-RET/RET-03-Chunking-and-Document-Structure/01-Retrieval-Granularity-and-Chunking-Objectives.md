# Retrieval Granularity and Chunking Objectives

## 1. Learning Objectives

After completing this chapter, you should be able to:

- Explain why a source document and a retrieval unit serve different purposes.
- Define retrieval granularity and explain why it matters.
- Describe how granularity influences focus, contextual completeness, and preservation of source information.
- Explain why neither smaller nor larger chunks are universally better.
- Identify how different information needs influence the required retrieval unit.
- Recognize symptoms of unsuitable retrieval granularity.
- Define explicit chunking objectives before selecting a strategy.
- Justify chunking decisions using source characteristics, retrieval requirements, and engineering constraints.

The goal is to develop a repeatable method for deciding what a retrieval unit should contain and why, rather than memorizing a preferred chunk size.

## 2. Prerequisites

This chapter builds on the following Retrieval Engineering concepts:

- **RET-01 — Retrieval Problems and Information Needs:** Understand information needs, relevance, retrieval success criteria, and system boundaries.
- **RET-02 — Document Preparation:** Understand document extraction, normalization, metadata, identity, provenance, and corpus quality.

These prerequisites establish what information the system needs and how source content is prepared. RET-03 builds on that foundation by determining how prepared content should be divided into retrieval units.

## 3. Estimated Reading Time

Approximately 20–25 minutes, including the worked example and practical exercise.

## 4. Before We Start

Imagine that an engineer asks a retrieval system:

> How do I restart the payment service after a database connection failure?

The source documentation contains a 40-page operations manual. Somewhere inside it is a restart procedure, but the same manual also contains deployment instructions, database configuration, monitoring guidance, and incident history.

The retrieval system has two broad choices:

1. Treat the entire manual as one retrieval unit.
2. Divide the manual into smaller units that represent meaningful portions of its content.

The first choice preserves the whole document but may return far more information than the engineer needs. The second can produce more focused results, but a poorly chosen boundary might separate the restart command from its prerequisites or warnings.

The engineering problem is therefore not simply how to split a document.

It is:

**What portion of the source should be treated as one retrieval unit so that it contains the information needed for a useful answer without losing essential context?**

This question defines the problem of retrieval granularity.

## 5. Why Retrieval Granularity Exists

### 5.1 Source documents and retrieval units have different purposes

A source document is organized for its original purpose. It may be designed for human reading, legal review, operational reference, software maintenance, or policy communication.

A retrieval system has a different responsibility: identify the portion of the source that best supports a particular information need.

Consider an API reference containing 80 endpoints. A developer asking about the authentication requirements of one endpoint usually does not need the complete reference.

Similarly, an incident report may contain a timeline, observations, root-cause analysis, corrective actions, and follow-up tasks. A question about the corrective action may be best served by a focused portion of that report rather than the entire document.

The source document's natural organization is therefore not automatically the best retrieval organization.

A **retrieval unit** is a portion of source content that the system treats as an individual unit for retrieval.

It may correspond to:

- An entire document.
- A chapter or section.
- A procedure.
- A group of related paragraphs.
- A smaller passage within a section.

The appropriate unit depends on what the system needs to retrieve.

### 5.2 What is retrieval granularity?

**Retrieval granularity** describes the level of detail represented by an individual retrieval unit.

- **Coarse granularity:** Each unit contains a relatively large amount of content.
- **Fine granularity:** Each unit contains a relatively small, focused amount of content.

These descriptions are relative. A 500-token unit may be fine-grained compared with a complete technical manual but coarse-grained compared with a single API parameter description.

Granularity is not defined by size alone. Two units containing the same number of tokens may differ substantially in usefulness because one contains a complete procedure while the other ends halfway through an explanation.

A useful mental model is to treat granularity as a decision about the information boundary of a retrieval unit.

```text
Source document
    |
    +-- Coarse granularity
    |       |
    |       +-- Large unit containing several topics
    |
    +-- Fine granularity
            |
            +-- Focused unit containing one small portion
```

The diagram illustrates relative unit size, not a guarantee that either representation is better.

### 5.3 Why not retrieve complete documents?

Document-level retrieval is a valid design in some systems. It is not inherently incorrect.

For example, a system retrieving short FAQ entries may already have appropriate retrieval units because each entry answers a relatively focused question.

However, complete-document retrieval can become unsuitable when documents contain many topics or independently useful sections.

Suppose an internal security policy contains:

1. Password requirements.
2. Access-token expiration.
3. Account recovery.
4. Administrative privileges.
5. Incident reporting.

A question about token expiration may be better supported by the relevant section than by the entire policy.

Large units can make it harder to isolate the required information, while smaller units introduce their own risks if related details are separated.

The decision must be based on the retrieval task and the structure of the content, not on an assumption that every document must be split.

## 6. The Mental Model: Granularity Is a Trade-off

A useful retrieval unit must balance three related but distinct properties.

### 6.1 Focus

**Focus** describes how closely the content of a unit relates to a particular information need.

A unit containing one relevant procedure and little unrelated material is focused for a question about that procedure.

A unit containing ten different procedures may be less focused for the same question.

Greater focus can help isolate useful information, but an extremely small unit may contain too little information to be meaningful by itself.

### 6.2 Contextual completeness

**Contextual completeness** describes whether the information available for interpreting a unit is sufficient for its intended use.

The required context may be contained entirely within the unit, or it may be supplied through an explicitly preserved relationship to a parent section or source document.

Consider this instruction:

> Increase it to 30 seconds if the connection pool is exhausted.

The instruction is difficult to interpret independently. What does *it* refer to? Which connection pool? Under what conditions should the change be made?

A larger passage might include the missing information:

> The database connection timeout defaults to 10 seconds. During a connection-pool exhaustion incident, increase the timeout to 30 seconds only after confirming that the database is healthy and the pool configuration is appropriate.

The second passage contains more context needed to interpret the instruction.

However, contextual completeness does not require copying an entire document into every unit. It requires ensuring that the information necessary for interpretation remains available when the unit is used.

There are two broad ways to achieve this:

- **Self-contained unit:** The necessary explanation, conditions, and qualifications are included within the unit.
- **Context-associated unit:** The unit preserves a reliable relationship to additional context that can be retrieved or supplied when needed.

The second approach depends on the surrounding system actually preserving and using that relationship. A reference to missing context is not sufficient by itself.

Detailed treatment of headings, parent sections, and structural context belongs to Lesson 03.

### 6.3 Source-information preservation

**Source-information preservation** describes whether the chunking process retains the relevant source information and relationships needed by the intended retrieval tasks across the resulting units.

For example, a chunking process may preserve every sentence but separate a warning from the procedure it qualifies. The words remain present, but an important relationship has been weakened.

Similarly, splitting a multi-step procedure into isolated fragments may make it difficult to reconstruct the intended sequence.

This property concerns what happens to source content during chunking. It is distinct from whether a retrieval system subsequently returns the right units for a particular query.

The latter depends on the broader retrieval system and its evaluation.

### 6.4 How these properties interact

| Design tendency | Potential benefit | Potential problem |
|---|---|---|
| Smaller, focused units | Isolate specific facts or procedures | Separate conditions, explanations, or qualifications from the information they modify |
| Larger, context-rich units | Preserve relationships and surrounding explanations | Include unrelated material and make focused information harder to isolate |
| Units aligned with meaningful content boundaries | Preserve complete ideas, sections, or procedures | Produce units of varying sizes that may require additional handling |
| Units designed only around a size limit | Provide predictable size constraints | Split meaningful content at unsuitable locations |

These are tendencies, not universal outcomes. A well-designed small unit can be contextually complete, and a large unit can remain focused when its content covers one coherent topic.

The important question is whether the resulting unit preserves the information and context required for its intended use.

## 7. Core Concepts

### 7.1 Chunking is a transformation, not just a splitting operation

**Chunking** is the process of dividing source content into retrieval units according to chosen boundaries and constraints.

A simplistic view treats chunking as a string operation:

```text
Input text
    |
    v
Split after every N characters
    |
    v
List of chunks
```

This can produce valid text fragments, but it does not establish whether those fragments are useful retrieval units.

A more appropriate conceptual model is:

```text
Prepared source content
          |
          v
Understand content and information needs
          |
          v
Define retrieval-unit objectives
          |
          v
Choose boundaries and granularity
          |
          v
Inspect resulting units
          |
          v
Determine whether they meet the objectives
```

The actual splitting mechanism is a separate design decision. RET-03 Lesson 02 covers the available chunking strategies and their boundary behavior.

The distinction matters because a splitting algorithm can work exactly as designed while producing unsuitable retrieval units.

### 7.2 Retrieval granularity should follow information needs

Different questions require different amounts of information.

Consider an internal service operations manual.

| Information need | Potentially suitable retrieval unit | Why |
|---|---|---|
| What port does the service use? | A focused configuration entry | The required fact may be self-contained |
| What conditions cause a retry? | A retry-policy explanation with its conditions | The conditions are part of the answer |
| How do I recover from a failed deployment? | A complete recovery procedure | The steps and their ordering matter |
| Why did the previous incident occur? | A relevant incident-analysis section | The causal explanation may depend on several related facts |
| What changes are required before upgrading? | A complete set of relevant upgrade prerequisites | Omitting one prerequisite could make the answer misleading |

These examples describe candidate units, not guaranteed optimal boundaries. The final decision depends on the actual source and the questions the system must support.

A common engineering mistake is to choose granularity before understanding the retrieval requirements. This reverses the reasoning process.

Instead, determine the information the system must retrieve, then decide what content a retrieval unit needs to contain or what additional context must remain accessible.

### 7.3 A retrieval unit must be useful at its intended boundary

A unit should be inspected as a piece of content that may be retrieved independently or interpreted with associated context.

Ask:

- Can a reader identify what the unit is about?
- Does the unit contain the information required for its intended use?
- Are important conditions or qualifications missing?
- Does it include unrelated content that obscures its purpose?
- Does it depend on surrounding material?
- If it depends on surrounding material, is that context reliably available through the system's design?

These questions reveal weaknesses that simple size checks cannot detect.

A unit can satisfy a maximum token limit and still be unsuitable because it begins halfway through an explanation or ends before the relevant condition is stated.

Conversely, a larger unit may be appropriate when the content represents one coherent explanation that should not be separated.

### 7.4 Chunk size is a constraint, not the objective

Engineers often begin by choosing a target chunk size because size is easy to measure and configure.

However, size is only one factor.

A character limit measures the number of characters. A token limit measures the number of tokens produced by a particular tokenizer. Neither directly measures whether a chunk contains a complete idea.

Token counts depend on the tokenizer and the representation being processed. The same text can have different token counts under different tokenizers.

Similarly, a structurally meaningful section may be much shorter or longer than an initial target size.

The engineering objective is not to make every chunk the same size. It is to create suitable retrieval units while respecting practical constraints.

A size limit may be necessary, but it should not override meaningful boundaries without a deliberate reason.

### 7.5 Overlap is a supporting decision

**Overlap** means intentionally repeating some content between adjacent chunks.

Overlap can help preserve information when a meaningful explanation crosses a chunk boundary. For example, the end of one passage may introduce a condition that is explained at the beginning of the next passage.

However, overlap also creates repeated content, increases the amount of content processed, and may cause similar passages to appear multiple times.

Overlap does not automatically repair a poor granularity decision. Repeating a fragment of an incomplete explanation may still leave both units difficult to interpret.

The first question should be whether the boundaries and unit sizes are appropriate. Overlap should then be considered as a specific way to address boundary-spanning information.

The detailed mechanisms and trade-offs of overlap belong to RET-03 Lesson 02.

## 8. Defining Chunking Objectives

Before choosing a chunking strategy, define what a successful retrieval unit must achieve.

This prevents implementation convenience from becoming the primary design criterion.

### 8.1 Identify the expected information needs

Start with the questions the system is expected to answer.

Examples include:

- Short factual questions.
- Questions requiring definitions and explanations.
- Multi-step operational procedures.
- Troubleshooting questions involving several conditions.
- Questions about relationships between different sections.

These information needs may coexist within one application. A single corpus may contain both short FAQ entries and long operational procedures.

Do not assume that one granularity must suit every content type equally well.

### 8.2 Identify the minimum useful content unit

Determine the smallest portion of content that can satisfy each important information need without losing essential meaning, either within the unit itself or through reliably available associated context.

For a configuration reference, the minimum useful unit might include a parameter name, its meaning, its default, and its constraints.

For a troubleshooting procedure, the minimum useful unit might need to include the symptom, the diagnostic condition, and the corrective action.

The minimum useful unit is not necessarily the smallest physically possible fragment. It is the smallest meaningful unit for the intended task.

### 8.3 Identify context that must remain available

Some content depends on surrounding information.

Examples include:

- A statement whose subject was introduced in the previous paragraph.
- A warning that applies to a particular procedure.
- A table whose column headings define the meaning of its values.
- A configuration example whose environment and prerequisites are explained elsewhere.
- A policy exception that modifies a general rule.

For each content type, determine which surrounding information is necessary for interpretation and whether it must be included in the unit or made available through a preserved relationship.

The aim is to preserve required context without automatically repeating all neighboring content.

### 8.4 Identify hard constraints and preferences

Distinguish constraints that must be satisfied from preferences that can be traded off.

**Hard constraints** may include:

- A downstream component's maximum supported input size.
- A mandatory processing or storage limit.
- A requirement to preserve a complete safety-critical instruction.

**Preferences** may include:

- Keeping units relatively easy to inspect.
- Reducing unnecessary duplication.
- Favoring boundaries that align with natural sections.

A hard constraint can make an otherwise desirable unit infeasible. A preference helps compare feasible alternatives but should not automatically override correctness or completeness.

When a meaningful unit exceeds a hard size limit, the design must handle that conflict explicitly rather than silently cutting away essential information.

### 8.5 Make objectives explicit

A useful chunking objective can be written as a set of requirements.

For example:

> For operational runbooks, produce retrieval units that preserve complete actionable procedures, include the conditions and warnings required to interpret them safely, avoid combining unrelated procedures, and remain within the downstream processing limit. Where a complete procedure cannot fit within that limit, preserve its structure and the relationships required to interpret its parts.

This objective describes the desired content properties, a hard constraint, and how to handle a conflict.

It is more useful than:

> Split every document into 500-token chunks.

The first statement defines what the units must achieve. The second specifies an implementation parameter without establishing why it is appropriate.

## 9. A Reusable Framework for Selecting Retrieval Granularity

Use the following framework before selecting a chunking strategy.

### Step 1: Characterize the source content

Identify the major content types in the corpus.

Examples:

- Technical prose.
- API references.
- Runbooks.
- FAQs.
- Incident reports.
- Policies.
- Tables and structured records.

Determine whether the content naturally consists of independent entries, coherent sections, multi-step procedures, or explanations that span several paragraphs.

This characterization informs the granularity decision without requiring a full catalog of splitting algorithms.

### Step 2: Characterize the information needs

Identify the types of information users need to retrieve.

Ask whether they generally need a single fact, a complete explanation, a procedure, or a collection of related details.

If several different information needs are important, record them separately rather than forcing them into one assumed pattern.

### Step 3: Define minimum completeness requirements

For each important content type, state what information must remain together or reliably accessible through associated context.

| Content type | Potential completeness requirement |
|---|---|
| Configuration reference | Setting name, meaning, relevant constraints, and necessary qualifications |
| Troubleshooting procedure | Symptom, required checks, conditions, and corrective steps |
| Incident analysis | Relevant observations and the reasoning that supports the conclusion |
| Policy section | Rule, applicable scope, and exceptions needed to interpret it |
| API operation | Operation identity, relevant parameters, and required constraints |

These are starting points for inspection, not rigid templates. Actual source content may require additional context.

### Step 4: Establish practical limits

Identify hard constraints and distinguish them from preferences.

A hard limit may require a unit to remain below a downstream processing capacity. A preference may favor shorter units because they are easier to inspect.

When a complete meaningful unit exceeds a hard limit, the design must handle the conflict explicitly rather than silently cutting away essential information.

### Step 5: Choose an initial granularity hypothesis

Based on the source content and information needs, state what a retrieval unit should represent.

Examples:

- One self-contained FAQ entry.
- One complete API operation description.
- One coherent policy section.
- One actionable runbook procedure.
- One focused explanation within a larger technical chapter.

This is a hypothesis to inspect, not a final guarantee. A unit may be self-contained or depend on context that the system reliably preserves.

### Step 6: Inspect representative outputs

Examine actual units produced from representative documents.

Include ordinary content and difficult cases, such as long procedures, irregular sections, tables, or explanations with important conditions.

Look for incomplete statements, missing prerequisites, unrelated material, and content that has been divided at an unsuitable boundary.

### Step 7: Refine the objective before changing arbitrary parameters

If the output is unsuitable, determine why.

Possible causes include:

- The unit is too broad for the intended information need.
- The unit is too narrow to preserve essential context.
- A meaningful section boundary was ignored.
- A hard size limit conflicts with the natural structure of the content.
- Different content types require different granularity decisions.

Change the design in response to the observed failure. Do not assume that increasing or decreasing the target size will solve every problem.

### Step 8: Record the decision and its rationale

Document:

- The content types covered.
- The expected information needs.
- The required completeness properties.
- Relevant size or processing constraints.
- The chosen granularity.
- Known limitations and cases requiring special handling.

This makes the design explainable and maintainable when the corpus or retrieval requirements change.

## 10. Worked Example: An Operations Runbook

The following fictional runbook illustrates how different granularity choices affect the content available within individual retrieval units.

> ### Database Connection Failures
>
> The payment service may fail to connect to PostgreSQL when the connection pool is exhausted or the database becomes temporarily unavailable.
>
> **Initial checks**
>
> 1. Inspect the database health endpoint.
> 2. Check the active and idle connection counts.
> 3. Review the application logs for connection timeout errors.
>
> **Recovery**
>
> If the database is healthy and the connection pool is exhausted, inspect for connections that are not being released. Correct the connection leak before increasing the pool limit.
>
> If the database is unavailable, follow the database recovery procedure. Do not increase the connection pool limit until database health has been confirmed.

Assume the system must support these questions:

1. What should I check first when database connections fail?
2. Why should I avoid increasing the connection pool limit immediately?
3. What should I do if the database itself is unavailable?

### 10.1 Candidate A: One unit for the entire manual

The complete manual is treated as one retrieval unit.

This representation retains all source information, but it combines many unrelated topics. A question about database connection failures must be answered from a unit that may also contain deployment procedures, monitoring instructions, and unrelated operational guidance.

This is a coarse-grained design.

It may be appropriate for a small document collection or a task requiring complete-document retrieval. For a large operational manual with many independent procedures, it is likely to be unnecessarily broad.

### 10.2 Candidate B: One unit per sentence

The runbook is divided into individual sentences.

A resulting unit might contain:

> Correct the connection leak before increasing the pool limit.

This sentence expresses an action, but it does not explain how to identify the leak or when the instruction applies.

Another unit might contain:

> Do not increase the connection pool limit until database health has been confirmed.

Without surrounding context or a reliable relationship to the relevant recovery conditions, the reader may not know what to do if the database is unavailable.

This is a fine-grained design that risks separating conditions from actions.

The problem is not that sentence-level units are always wrong. The problem is that these particular boundaries do not reliably preserve the information required by the example questions.

### 10.3 Candidate C: Units based on meaningful procedures

The passage is divided into units representing the initial checks and the recovery procedure, with the relevant conditions retained in each unit.

**Unit 1 — Initial checks**

> When the payment service fails to connect to PostgreSQL, inspect the database health endpoint, check active and idle connection counts, and review application logs for connection timeout errors.

**Unit 2 — Recovery when the database is healthy**

> If the database is healthy and the connection pool is exhausted, inspect for connections that are not being released. Correct the connection leak before increasing the pool limit.

**Unit 3 — Recovery when the database is unavailable**

> If the database is unavailable, follow the database recovery procedure. Do not increase the connection pool limit until database health has been confirmed.

These units are more closely aligned with the example information needs. Each has an identifiable purpose, and the relevant conditions remain attached to the instructions.

However, the choice should be justified against explicit requirements rather than assumed to be best simply because the units look coherent.

### 10.4 Compare the candidates against the objectives

Assume the objectives are to preserve the troubleshooting conditions, retain actionable instructions, avoid combining unrelated procedures, and keep units within practical processing limits.

| Criterion | Candidate A: Whole manual | Candidate B: Individual sentences | Candidate C: Meaningful procedures |
|---|---|---|---|
| Focus | Weak when the manual contains unrelated topics | Often strong at the sentence level | Strong for the specified troubleshooting tasks |
| Contextual completeness | Usually retains source context but may include much unrelated content | At risk when conditions and actions are separated | Better within each unit for the illustrated questions |
| Source-information preservation | Broad source content remains together | Relationships between sentences may be weakened | Relevant relationships are more deliberately preserved |
| Processing constraints | May exceed downstream limits | Individual units are small | Requires inspection to confirm feasibility |
| Main limitation | Excessive breadth | Fragmentation and missing context | May require associated context for questions spanning multiple units |

**Decision:** Candidate C is the strongest initial hypothesis for the stated requirements, provided its units satisfy the actual size constraints and the relationships between the initial checks and recovery steps remain available.

This is a structural and content-based decision. It does not prove that a retrieval system will return these units for every relevant query. That requires downstream retrieval evaluation.

The example illustrates the central principle: select boundaries that preserve the information needed for the task rather than boundaries that merely produce convenient text lengths.

## 11. Production Perspective

### 11.1 Different corpora can require different granularity

An enterprise retrieval system may contain several content types:

- Short FAQ entries.
- Long engineering design documents.
- API references.
- Operational runbooks.
- Incident reports.
- Internal policies.

A single granularity policy may be operationally convenient, but convenience alone does not establish suitability.

FAQ entries may already be self-contained. A long incident report may require sections that preserve relationships between evidence, analysis, and corrective action. A runbook may require complete procedures and their execution conditions.

A practical design should identify meaningful differences in content and information needs before deciding whether one policy is sufficient.

### 11.2 Downstream constraints matter, but do not define usefulness

Retrieval units are used by later components in a retrieval system. Those components may impose size constraints or require particular amounts of context.

Such constraints must be considered when selecting granularity.

However, satisfying a downstream size limit is only a feasibility condition. It does not prove that a unit contains the right information or will be relevant to a particular question.

Likewise, a structurally complete unit is not guaranteed to be retrieved for every relevant query.

Keep these claims separate:

- **Structural suitability:** Does the unit contain coherent, interpretable content or have the required context reliably available?
- **Source-information preservation:** Does chunking retain the relevant content and relationships across the resulting units?
- **Observed retrieval effectiveness:** Does the complete system actually return useful results for relevant queries?

These properties are related, but they are not interchangeable.

### 11.3 Revisit granularity when requirements change

A granularity decision is based on assumptions about the corpus and its use.

Revisit those assumptions when:

- New document types are introduced.
- Existing documents become substantially longer or more complex.
- Users begin asking different kinds of questions.
- New processing constraints appear.
- Inspections reveal repeated context loss or excessive fragmentation.

A design that works for a collection of short FAQs may not remain appropriate after the collection expands to include long technical procedures.

The appropriate response is to reassess the objectives and evidence, not to assume that the original parameters remain correct indefinitely.

## 12. Engineering Decisions and Trade-offs

The following table summarizes the principal trade-offs involved in selecting retrieval granularity.

| Decision | If the unit is too small | If the unit is too large |
|---|---|---|
| Content focus | A fragment may not express a complete idea | Unrelated content may obscure the relevant information |
| Context | Prerequisites, qualifications, or explanations may be separated | Excess context may make the useful portion harder to isolate |
| Source-information preservation | Relationships across multiple fragments may be difficult to reconstruct | Multiple topics may be combined into one broad unit |
| Processing constraints | More units may increase handling and storage overhead | Individual units may exceed downstream limits |
| Maintenance | More boundaries may need inspection when source content changes | A small source change may affect a larger retrieval unit |

These are possible failure patterns rather than deterministic outcomes.

A larger unit is not necessarily less focused if its content is coherent. A smaller unit is not necessarily incomplete if it represents a self-contained fact or explanation.

The engineering decision should account for:

1. The information users need.
2. The structure and characteristics of the source.
3. The context required to interpret the content.
4. The constraints of downstream components.
5. The observed quality of representative outputs.

## 13. Common Mistakes and Misconceptions

### Mistake 1: Assuming one chunk size works for every corpus

**Why it fails:** Different content types have different natural boundaries and completeness requirements.

**Better approach:** Establish objectives for the relevant content types and inspect representative outputs.

### Mistake 2: Treating token count as a measure of meaning

**Why it fails:** Token count measures the size of a representation, not whether a passage expresses a complete idea.

**Better approach:** Use size constraints where necessary, but assess the meaning and completeness of the resulting units separately.

### Mistake 3: Assuming smaller chunks are always more precise

**Why it fails:** Small chunks can separate facts from their conditions, prerequisites, explanations, or qualifications.

**Better approach:** Determine the minimum useful content unit for the intended information need, including any context that must remain available.

### Mistake 4: Assuming larger chunks always provide better context

**Why it fails:** Large chunks may combine unrelated information and make it harder to isolate the portion needed for a particular question.

**Better approach:** Preserve the context required for interpretation without automatically including the entire surrounding document.

### Mistake 5: Using overlap as a universal repair

**Why it fails:** Repeating adjacent text does not necessarily restore a missing prerequisite, a complete procedure, or an incorrectly selected boundary.

**Better approach:** Diagnose the underlying boundary or granularity problem before deciding whether overlap is appropriate.

### Mistake 6: Choosing the implementation before defining the objective

**Why it fails:** The easiest splitting method may produce units that do not match the system's information needs.

**Better approach:** Define the desired retrieval unit first. Select a strategy in RET-03 Lesson 02 to produce it.

### Mistake 7: Equating structural coherence with retrieval success

**Why it fails:** A coherent chunk may still be irrelevant to a particular query or fail to appear among the retrieved results.

**Better approach:** Treat structural inspection as one part of engineering validation. Formal retrieval evaluation belongs to RET-10.

## 14. Interview Questions with Expected Answers

### Q1. Why might a retrieval system divide documents into smaller units?

**Expected answer:** A document may contain several topics or information needs. Smaller units can isolate useful content and reduce unrelated material, provided the boundaries preserve enough context for interpretation.

### Q2. What is retrieval granularity?

**Expected answer:** Retrieval granularity describes the level of detail represented by a retrieval unit. Coarse units contain relatively large portions of content, while fine-grained units contain smaller portions. Suitability depends on the content and information needs, not size alone.

### Q3. Why are smaller chunks not always better?

**Expected answer:** Small chunks can separate facts from their conditions, prerequisites, explanations, or qualifications. Essential context may need to be included in the unit or made available through a preserved relationship.

### Q4. Why are larger chunks not always better?

**Expected answer:** Large chunks may combine unrelated information and make it harder to isolate the portion needed for a particular question. They may also exceed downstream processing constraints.

### Q5. How would you choose granularity for an enterprise corpus containing FAQs, API references, and runbooks?

**Expected answer:** I would characterize the content types and expected information needs separately. I would define the minimum useful content and required context for each, account for practical constraints, inspect representative outputs, and document the resulting decisions. I would not assume that every content type needs identical granularity.

### Q6. Does a structurally coherent chunk guarantee successful retrieval?

**Expected answer:** No. Structural coherence helps preserve meaning, but retrieval success also depends on how well the system identifies relevant units for a query. The two properties require separate consideration.

### Q7. What would you investigate if a retrieval unit repeatedly contains incomplete instructions?

**Expected answer:** I would inspect the original content and identify which conditions or steps have been separated. I would reconsider the intended unit boundary and completeness requirements, then inspect revised outputs. I would not immediately assume that increasing overlap or changing the size parameter would solve the problem.

## 15. Quick Revision

- **Source document:** Content organized for its original purpose.
- **Retrieval unit:** A portion of source content treated as an individual unit for retrieval.
- **Retrieval granularity:** The relative level of detail represented by each unit.
- **Fine granularity:** Smaller, more focused units that may lose necessary context.
- **Coarse granularity:** Larger, more context-rich units that may include unrelated material.
- **Chunking objective:** An explicit statement of what a suitable retrieval unit must preserve and achieve.
- **Source-information preservation:** Retention of relevant content and relationships across the resulting units.
- **Core trade-off:** Focus must be balanced with contextual completeness and source-information preservation.
- **Design principle:** Determine information needs and required content boundaries before selecting a splitting strategy.
- **Validation principle:** Inspect representative outputs instead of assuming that a configured size produces useful units.

## 16. Key Takeaways

1. A source document and a retrieval unit serve different purposes.
2. Retrieval granularity should follow information needs and source characteristics, not a universal size rule.
3. Small units can lose context; large units can combine unrelated material.
4. Size, focus, contextual completeness, and source-information preservation are distinct considerations.
5. Context may be contained within a unit or supplied through a reliably preserved relationship.
6. Define explicit chunking objectives before choosing a strategy.
7. Inspect actual outputs to determine whether the objectives have been met.
8. Structural suitability does not guarantee retrieval effectiveness.

## 17. Further Reading

Continue with the following approved RET-03 chapter files:

- **[Chunking Strategies and Boundaries](./02-Chunking-Strategies-and-Boundaries.md):** Learn how splitting mechanisms establish boundaries and how their assumptions, parameters, and trade-offs influence resulting units.
- **[Structure, Context Preservation, and Chunk Comparison](./03-Structure-Context-Preservation-and-Chunk-Comparison.md):** Learn how to preserve structural meaning and context, and how to inspect alternative chunking outputs.

Related topics in the broader Retrieval Engineering curriculum include retrieval problem formulation in RET-01, document preparation in RET-02, indexing in RET-04, and formal retrieval evaluation in RET-10. These chapters own their respective concepts and should be consulted for their detailed treatment.
