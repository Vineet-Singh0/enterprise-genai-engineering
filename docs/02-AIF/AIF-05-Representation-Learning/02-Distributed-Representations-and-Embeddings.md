# 02 — Distributed Representations and Embeddings

## 1. Purpose

Chapter 01 established that a representation determines how information is expressed for a machine-learning system. This chapter examines a widely used form of representation: **embeddings**.

Modern AI systems represent words, sentences, documents, images, users, products, and other entities using numerical vectors. These vectors can encode useful patterns learned from data, allowing models to process information that would otherwise be difficult to represent using manually designed features alone.

However, an embedding is not simply a numerical description of an object. Its properties depend on how it was constructed, the data used to learn it, and the objective that shaped it.

This chapter builds the conceptual foundation for understanding embeddings without entering transformer architecture, model-specific APIs, vector database implementation, or retrieval pipelines.

The central question is:

**How can a collection of numerical values represent useful information about an object, and what determines whether that representation is useful?**

## 2. Learning Objectives

After completing this chapter, you should be able to:

- Explain distributed representations and embeddings.
- Distinguish sparse and dense representations at a conceptual level.
- Explain why an object can be represented by a vector without assigning a simple human-readable meaning to every dimension.
- Identify common objects represented by embeddings, including words, sentences, documents, images, and entities.
- Explain how training objectives influence the information encoded by a representation.
- Distinguish context-independent representations from context-dependent representations.
- Explain how embeddings can capture useful relationships while still making mistakes.
- Identify limitations involving ambiguity, domain shifts, bias, and task mismatch.
- Connect embeddings to representation spaces and similarity concepts developed in the next chapters.

## 3. From Features to Distributed Representations

Consider a system that needs to represent words.

A basic approach could assign each word an identifier:

```text
cat  -> 17
dog  -> 42
car  -> 91
```

These identifiers distinguish the words, but the numerical values do not inherently express semantic relationships.

The fact that `cat` has identifier 17 and `dog` has identifier 42 does not mean that the two words are more related than `cat` and `car`. The identifiers are labels, not meaningful measurements.

A one-hot representation can provide a distinct vector for each item:

\[
\text{cat} = [1,0,0]
\]

\[
\text{dog} = [0,1,0]
\]

\[
\text{car} = [0,0,1]
\]

Each vector marks the identity of one item. However, these vectors do not inherently express that cats and dogs are both animals or that cars are vehicles.

A distributed representation takes a different approach. Information about an item is represented across multiple numerical components.

For example, a conceptual embedding might look like this:

\[
\mathbf{e}_{\text{cat}} =
[0.24,-0.31,0.72,0.18]
\]

\[
\mathbf{e}_{\text{dog}} =
[0.21,-0.28,0.68,0.23]
\]

\[
\mathbf{e}_{\text{car}} =
[-0.64,0.51,0.12,-0.37]
\]

These are illustrative values, not outputs from a particular trained model. Their purpose is to demonstrate the idea that different items can be represented using patterns across multiple dimensions.

If a learning procedure is designed so that relevant relationships are encoded in the vectors, the representations of cats and dogs may share useful structure.

The values themselves do not establish that relationship. The learned geometry and the objective used to train the representations determine whether the vectors express useful relationships.

## 4. What Is a Distributed Representation?

A **distributed representation** represents an item through a pattern of values spread across multiple components rather than assigning all of its identity or information to one dedicated component.

The term *distributed* refers to how information is represented across the components of a representation.

For example, several dimensions may jointly contribute to distinguishing one word from another. A single dimension may also contribute to representing many different items.

This differs from a simple symbolic encoding in which an item is represented primarily by a distinct identifier.

### 4.1 Why Distribution Can Be Useful

Distributed representations can express complex patterns using combinations of numerical values.

Their potential advantages include:

- **Shared structure:** Different items can share patterns across dimensions.
- **Compactness:** A vector may represent useful information without requiring one dedicated position for every possible item.
- **Generalization:** A model may learn reusable patterns that help it handle related examples.
- **Compositional structure:** Multiple aspects of an item can contribute to its overall representation.
- **Learned relationships:** Training can encourage representations to encode relationships relevant to an objective.

These are potential benefits, not guaranteed properties of every embedding.

A vector can be distributed without capturing useful semantic relationships. Those relationships must emerge from the representation design, learning objective, and data.

### 4.2 Distributed Does Not Mean Every Dimension Is Interpretable

Suppose an embedding contains 768 dimensions.

It is tempting to assume that one dimension represents age, another represents color, and another represents sentiment. That interpretation is generally not justified without specific evidence.

In many learned representations, information is distributed across dimensions. Individual dimensions may not have stable, independently interpretable meanings.

The representation can still be useful even when its internal coordinates are difficult to explain in human terms.

This distinction matters when interpreting model behavior: the usefulness of a representation does not automatically imply that each component corresponds to a recognizable real-world attribute.

## 5. What Is an Embedding?

An **embedding** is a mapping from an object or input into a numerical vector within a representation space.

The object being represented may be a word, sentence, document, image, user, product, or another entity.

Conceptually, an embedding function can be written as:

\[
f(x)=\mathbf{e}_x
\]

where:

- \(x\) is the input object.
- \(f\) is the mapping that produces the representation.
- \(\mathbf{e}_x\) is the resulting vector.

For an input sentence, the function produces a vector. For an image, another embedding function may produce a vector. Different functions can produce different representations of the same object.

The mapping may be based on manually specified rules, learned parameters, or a combination of techniques. In modern representation learning, embeddings are often learned from data.

### 5.1 An Embedding Is Not the Object Itself

An embedding is a representation of an object, not a complete copy of everything that can be known about it.

For example, a sentence embedding may preserve information useful for a semantic task while failing to retain every detail of the original sentence.

If two sentences express the same broad idea but differ in a critical negation, an embedding system may or may not preserve that distinction sufficiently for a particular application.

Similarly, a product embedding may encode patterns useful for product categorization but omit a specific technical attribute required for compatibility checking.

This means an embedding should not automatically be treated as a lossless encoding.

### 5.2 An Embedding Is Not Automatically Semantic

A vector representation does not necessarily encode meaning.

A vector can represent an arbitrary identifier, a learned latent state, a visual feature pattern, or a semantic relationship.

Whether it is useful for semantic reasoning depends on the task and how the representation was constructed or trained.

For example, an embedding trained to predict the next event in a user interaction sequence may capture behavioral patterns without being designed to express general semantic similarity.

Therefore, the term *embedding* describes a type of representation, not a guarantee about what information it contains.

## 6. Sparse and Dense Representations

Representations differ in how their information is distributed across vector components.

Two important categories are sparse and dense representations.

### 6.1 Sparse Representations

A **sparse representation** has many components equal to zero, with only a relatively small number of nonzero values.

Consider a vocabulary-based representation:

\[
\mathbf{x}=[0,1,0,0,1,0,0,0]
\]

Only two of the eight components are nonzero.

A one-hot vector is a special case of a sparse representation: exactly one component is active and all others are zero.

Sparse representations are common in traditional text-processing methods, including word-count and term-frequency-based representations.

Their advantages can include:

- Direct association between dimensions and known features or vocabulary items.
- Straightforward inspection of active components.
- Efficient storage and computation when sparsity is exploited.
- Useful performance for tasks where explicit feature occurrence matters.

Their limitations can include:

- Large dimensionality when the feature vocabulary is large.
- Weak representation of relationships between different features unless additional structure is introduced.
- Limited ability to generalize from one feature to a related but unseen feature.

These limitations depend on the representation and task; sparse representations can be highly effective for many applications.

### 6.2 Dense Representations

A **dense representation** has values distributed across a substantial portion of its dimensions, with relatively few components equal to zero.

For example:

\[
\mathbf{e}=[0.18,-0.42,0.73,0.09,-0.26]
\]

Dense vectors are widely used for learned embeddings.

Rather than assigning one dedicated dimension to each vocabulary item, a dense representation can encode patterns across a fixed number of components.

Potential advantages include:

- Compact representation relative to a very large explicit feature vocabulary.
- Ability to encode shared patterns across different inputs.
- Support for learned relationships between represented objects.
- Reuse across tasks when the representation transfers successfully.

Potential limitations include:

- Individual dimensions may be difficult to interpret.
- Relationships encoded during training may not match a downstream task.
- The representation may preserve biases or spurious correlations.
- Dense vectors can still be high-dimensional and computationally expensive.

Dense representations are not inherently more meaningful or more accurate than sparse representations. Their value depends on what information they encode and how that information is used.

### 6.3 Conceptual Comparison

| Property | Sparse representation | Dense representation |
|---|---|---|
| Distribution of values | Many zeros | Values commonly spread across many dimensions |
| Dimension interpretation | May correspond to explicit features or tokens | Often distributed and difficult to interpret individually |
| Typical example | Word-count vector | Learned word or sentence embedding |
| Relationships between inputs | Depend on the features and method used | Can be learned across dimensions |
| Main advantage | Explicit feature structure and potential sparsity efficiency | Compact encoding of learned patterns |
| Main limitation | May not naturally express relationships between different features | Meaning and usefulness depend on the learned representation |

This comparison describes common patterns rather than strict rules. Some representations are sparse but learned, and some dense representations are constructed without semantic training.

## 7. What Can Be Represented by Embeddings?

Embeddings can be produced for many kinds of inputs. The type of object matters because different representations preserve different kinds of information.

### 7.1 Word Embeddings

A word embedding maps a word or token to a vector.

For example:

```text
"doctor" -> vector
"nurse"  -> vector
"hospital" -> vector
```

A training procedure may encourage these vectors to capture patterns associated with how words are used.

Depending on the training method and data, a representation may encode relationships involving context, usage, or linguistic regularities.

However, the vector is not a dictionary definition. Its usefulness depends on the patterns captured by the representation and the task in which it is used.

### 7.2 Sentence Embeddings

A sentence embedding maps an entire sentence to a vector.

For example:

```text
"The meeting was postponed."
"The meeting will happen later."
```

A sentence-embedding method designed to capture semantic relationships may produce vectors that reflect the similarity of these statements.

This outcome is not guaranteed for every model. A method trained for another objective may encode different information or may fail to distinguish important details.

Sentence embeddings are often useful when a system needs a representation of a complete textual expression rather than separate representations of individual tokens.

### 7.3 Document Embeddings

A document embedding represents a larger text unit, such as a report, article, or policy document.

The representation may reflect topic, terminology, style, or other patterns emphasized by its construction and training objective.

A single document vector can be convenient, but compressing a long document into one vector can obscure details such as:

- A specific clause within a policy.
- A numerical value in a report.
- A qualification or exception.
- Different subjects discussed in separate sections.

A document-level representation should therefore not be assumed to preserve every detail required for exact question answering or factual verification.

### 7.4 Image Embeddings

An image embedding maps an image to a numerical vector.

Depending on the model and training objective, the representation may capture visual characteristics such as object categories, shapes, textures, or other learned patterns.

Two images of the same object may receive related representations if the method is designed to recognize such relationships.

But an image embedding can also overlook fine-grained distinctions. Two visually similar products might differ in a technical specification that is not captured strongly by the representation.

The intended task determines whether the image representation is adequate.

### 7.5 Entity Embeddings

An entity embedding represents an entity, such as a person, organization, product, or location, as a vector.

Entity representations may be learned from structured relationships, interaction data, descriptive information, or other sources.

For example, a system could learn representations for products based on how they are described or used.

However, entity identity and semantic similarity are not the same thing. Two distinct entities may have similar embeddings, and two related entities may not be close under every representation.

The representation should not replace authoritative identifiers when exact identity is required.

### 7.6 One Vector Does Not Fit Every Purpose

The same underlying object may need multiple representations.

A product may have:

- A categorical identifier for exact record lookup.
- Structured attributes for compatibility checks.
- A text embedding for description similarity.
- An image embedding for visual similarity.

These representations serve different purposes. They should not be treated as interchangeable simply because each can be expressed numerically.

**Engineering principle:** choose a representation according to the information the task requires, not merely according to the object being represented.

## 8. How Training Objectives Shape Representations

Learned representations do not emerge independently of their training process. The objective influences which patterns are useful for the model to encode.

A training objective specifies what the learning procedure is trying to achieve. Different objectives can encourage different representations even when the underlying data overlaps.

### 8.1 Representations Reflect the Learning Signal

Imagine two systems trained using the same collection of product descriptions.

- System A learns to classify products into broad categories.
- System B learns to distinguish descriptions that express similar product attributes.

System A may develop representations that emphasize category distinctions. System B may emphasize similarities within categories and differences in descriptive details.

The examples and data may overlap, but the objectives encourage different representational properties.

This illustrates a general rule:

**A representation tends to encode patterns that help satisfy its learning objective, not every relationship a downstream application might care about.**

### 8.2 Supervised Learning Signals

In supervised learning, the training process uses labeled examples or target values.

If the task is image classification, the representation may become useful for distinguishing the target classes.

However, the representation may also preserve accidental correlations between the training inputs and labels. If a shortcut helps predict the label during training, the model may exploit it unless the training setup or data discourages that behavior.

A representation optimized for classification should not automatically be assumed to be optimal for semantic search, fine-grained attribute comparison, or causal reasoning.

### 8.3 Self-Supervised Learning Signals

Self-supervised learning derives training signals from the data itself rather than requiring every training example to have a manually assigned target label.

For example, a training procedure may use parts of an input to construct a prediction task involving other parts of the data.

Such objectives can help a system learn broad regularities from large datasets.

However, the representation's resulting properties still depend on the objective, data, and learning procedure. Self-supervised training does not guarantee that every downstream relationship will be captured accurately.

Detailed learning paradigms are covered in AIF-03. Neural-network mechanisms used by particular approaches are covered in AIF-04 and AIF-07 where applicable.

### 8.4 The Downstream Task Can Differ from the Training Objective

A representation may perform well on the objective for which it was learned and still be unsuitable for a new task.

For example, a text representation trained to predict likely word usage may capture linguistic regularities. A downstream system that needs to distinguish a legal obligation from a legal recommendation may require distinctions that the representation does not reliably preserve.

This is not necessarily a failure of the original training process. The representation may be functioning as intended, while the downstream task requires additional capabilities or a different representation.

When reusing an embedding, engineers should ask:

1. What objective shaped the representation?
2. What kinds of patterns would help satisfy that objective?
3. Which distinctions does the downstream task require?
4. Is there evidence that the representation preserves those distinctions?

These questions are more informative than asking only whether the embedding is considered a strong general-purpose model.

## 9. Context-Independent and Context-Dependent Representations

The representation of a word can depend on whether its surrounding context is considered.

### 9.1 Context-Independent Representations

A context-independent word representation assigns a word or token a representation that does not change according to the particular sentence in which it appears.

Consider the word *bank*:

```text
"We deposited money at the bank."
"The river bank was covered with grass."
```

A context-independent representation of the word *bank* does not directly change based on these two sentence contexts.

Such representations can be useful because they provide a consistent vector for a word. However, they have difficulty expressing distinctions between multiple senses of the same word through the word representation alone.

### 9.2 Context-Dependent Representations

A context-dependent representation can vary according to the surrounding input.

For the two sentences above, the representation associated with *bank* may differ because the surrounding words provide different contextual evidence.

This can help a system distinguish different uses of the same word.

Context-dependent representations are useful in many modern language-modeling systems, although the exact behavior depends on the model and objective.

The distinction does not mean that every context-dependent representation resolves ambiguity correctly. Context can be incomplete, misleading, or insufficient to determine the intended meaning.

### 9.3 Comparison

| Property | Context-independent representation | Context-dependent representation |
|---|---|---|
| Dependence on surrounding input | Does not vary with the particular context | Can vary with the surrounding context |
| Ambiguous words | One representation may cover multiple senses | Can represent different uses differently |
| Consistency | Same word representation across contexts | Representation may change across contexts |
| Limitation | Cannot directly adapt the word vector to each usage | Depends on contextual information and model behavior |

These categories describe the role of context in producing a representation. They do not by themselves determine representation quality.

Context-independent does not mean untrained, and context-dependent does not automatically mean correct or more useful for every task.

## 10. Semantic Relationships and Their Limits

One motivation for learned embeddings is the ability to encode relationships between objects.

A representation may capture similarities or distinctions that are useful for a particular task. For example, a text embedding system may represent two paraphrases in a way that reflects their related meaning.

But this behavior requires careful interpretation.

### 10.1 Similarity Is Learned or Imposed, Not Guaranteed by Vector Format

The fact that two objects are represented as vectors does not guarantee that related objects will be close together.

That property depends on the representation method, training objective, and evaluation context.

A vector can encode arbitrary or task-specific information. Geometric relationships become useful only when the representation supports the intended interpretation.

### 10.2 Similarity Does Not Mean Equivalence

Consider these statements:

```text
"The medication reduced the symptoms."
"The medication eliminated the symptoms."
```

The statements are related, but they do not make the same claim.

A representation might place them close together because of their shared vocabulary and topic. For an application that must preserve the difference between partial improvement and complete elimination, this closeness may not be sufficient.

Similarly, two documents can discuss the same policy while expressing opposing positions.

A representation optimized for broad topical similarity may not preserve every distinction in meaning.

### 10.3 Similarity Does Not Establish Truth

An embedding's relationship between two inputs is not proof that either input is factually correct.

A false claim can be expressed in language very similar to a true claim. Two documents can be closely related while one contains outdated or fabricated information.

Representation similarity must therefore not be treated as a truth score.

### 10.4 Similarity Does Not Establish Causality

Two entities or concepts may frequently appear together without one causing the other.

A representation can capture patterns of co-occurrence or association. Those patterns do not, by themselves, establish a causal relationship.

Causal reasoning requires additional assumptions and evidence beyond the existence of a learned representation.

### 10.5 Similarity Depends on the Required Granularity

A representation useful for broad topic matching may be insufficient for fine-grained comparisons.

For example, two laptops may be similar in brand, appearance, and general category but differ in memory capacity. If a task requires checking software compatibility, the representation must preserve or be supplemented with the exact specification.

The appropriate representation depends on the level of distinction the task requires.

## 11. Common Failure Modes

Understanding how embeddings can fail is part of understanding what they represent.

### 11.1 Ambiguity

A representation may fail to distinguish multiple senses of a word or phrase.

**Example:** A text system confuses a financial bank with the bank of a river because it does not capture enough contextual information.

**Engineering response:** Check whether the representation is context-independent or context-dependent and whether the task requires sense-level distinctions.

### 11.2 Domain Mismatch

A representation learned on one distribution may not encode the terminology or relationships needed in another domain.

**Example:** A general-purpose text representation may not adequately distinguish specialized medical or legal terms.

**Engineering response:** Evaluate the representation on representative examples from the target domain rather than assuming broad training coverage is sufficient.

### 11.3 Overgeneralization

A representation may group examples together because they share broad patterns while ignoring an important distinction.

**Example:** Two product descriptions are represented similarly even though one product lacks a required safety feature.

**Engineering response:** Identify which distinctions are critical and determine whether the representation preserves them. Use exact structured attributes where necessary.

### 11.4 Biased Associations

A representation may reflect biased or imbalanced patterns in its training data.

**Example:** An entity representation encodes historical associations that lead to systematically different treatment of groups in a downstream decision.

**Engineering response:** Investigate relevant subgroup behavior, examine data coverage, and evaluate the downstream consequences. Do not assume that numerical encoding removes bias.

### 11.5 Objective Mismatch

The representation may optimize a training objective that does not align with the intended application.

**Example:** A representation optimized for broad document-topic similarity fails to distinguish between a document supporting a policy and one opposing it.

**Engineering response:** Test the distinctions required by the downstream task and consider whether a different representation or task-specific learning objective is necessary.

### 11.6 Information Compression

A compact vector may not retain every detail of the original input.

**Example:** A document embedding captures the overall topic but fails to preserve an exact deadline stated in one paragraph.

**Engineering response:** Do not rely on a single embedding when the application requires exact values, complete evidence, or fine-grained factual distinctions.

These failures demonstrate why embeddings should be evaluated as task-dependent representations rather than universal summaries of meaning.

## 12. Practical Engineering Checklist

When selecting or evaluating an embedding, work through the following questions.

### Representation Purpose

- [ ] What object is being represented: a word, sentence, document, image, entity, or something else?
- [ ] What downstream task will use the representation?
- [ ] What distinctions must the representation preserve?
- [ ] Is a learned embedding necessary, or would structured attributes or simpler features be sufficient?

### Origin and Training

- [ ] Was the representation manually designed or learned from data?
- [ ] What is known about the data and objective used to learn it?
- [ ] Is the representation context-independent or context-dependent where that distinction matters?
- [ ] Is there evidence that the representation transfers to the intended task?

### Limitations and Validation

- [ ] Could the representation discard exact details required by the application?
- [ ] Could it confuse related but meaningfully different inputs?
- [ ] Could the training data encode unwanted biases or domain-specific shortcuts?
- [ ] Have representative and difficult examples been considered?
- [ ] Are exact identity, factual verification, or structured constraints being incorrectly delegated to semantic similarity?

This checklist is a reasoning aid, not a substitute for the evaluation procedures required by the application.

## 13. Relationship to Other Curriculum Topics

### AIF-01 — Mathematics Foundation

AIF-01 provides the general mathematics needed to work with vectors and related operations. This chapter uses vectors as representations without repeating the general linear-algebra instruction.

### AIF-03 — Machine Learning Foundations

AIF-03 covers learning paradigms, data preparation, and general evaluation principles. This chapter explains how the training objective can influence what a learned representation captures.

### AIF-04 — Deep Learning Foundations

AIF-04 explains neural-network learning and training mechanisms. This chapter focuses on the representational outcomes rather than re-teaching those mechanisms.

### AIF-06 — Sequence Modeling

AIF-06 develops sequence-modeling concepts and architectures. This chapter introduces contextual representation as a concept without teaching recurrent networks or other sequence-modeling internals.

### AIF-07 — Transformer Foundations

AIF-07 covers transformer architecture and attention. This chapter discusses context-dependent representations at a conceptual level without explaining transformer internals.

### AIF-05 Chapter 03 — Representation Spaces, Dimensionality and Similarity

Chapter 03 develops the geometry of representations, including dimensions, magnitude, direction, and similarity measures.

This chapter introduces embeddings as vectors but does not attempt to provide the full mathematical treatment of representation-space geometry.

### AIF-05 Chapter 04 — Distance Metrics and Representation Quality

Chapter 04 examines distance measures, metric selection, and representation quality in greater depth.

This chapter identifies important limitations of embeddings but leaves systematic metric comparison and quality evaluation to Chapter 04.

### RET — Retrieval Engineering

RET applies embeddings to retrieval systems and covers indexing, vector databases, nearest-neighbor search, ranking, and retrieval evaluation.

This chapter establishes what embeddings are and what their limitations mean. It does not implement retrieval pipelines or select production retrieval infrastructure.

## 14. Key Takeaways

- A distributed representation spreads information across multiple components.
- An embedding maps an object into a numerical vector.
- Sparse and dense representations differ in the distribution of values and often in how their dimensions are interpreted.
- Embeddings can represent words, sentences, documents, images, entities, and many other objects.
- A vector's existence does not guarantee that it captures semantic meaning.
- Training objectives influence which patterns a learned representation captures.
- Context-dependent representations can adapt to surrounding input, but they do not automatically resolve ambiguity.
- Similarity does not establish equivalence, truth, or causality.
- Representations can fail through ambiguity, domain mismatch, overgeneralization, bias, objective mismatch, and information loss.
- The usefulness of an embedding depends on the distinctions and behavior required by its downstream task.

## 15. Knowledge Check

Answer these questions without immediately consulting the explanations.

1. Why is assigning a unique numeric identifier to every word different from learning a distributed representation?
2. What makes an embedding a representation rather than a complete copy of its input?
3. Explain the conceptual difference between sparse and dense representations. Can either category be useful for real-world machine-learning tasks?
4. Why might an embedding have useful properties even when individual dimensions are not human-interpretable?
5. How can two systems trained on the same data develop representations that emphasize different relationships?
6. Explain the difference between context-independent and context-dependent word representations using the word *bank*.
7. Why does an embedding that works well for document-topic classification not necessarily work well for detecting contradictions?
8. Give an example where two entities have similar embeddings but must remain distinct for a downstream decision.
9. Why can an embedding encode a biased association without explicitly representing a human-defined category?
10. What evidence would you seek before reusing an embedding for a task different from the one for which it was trained?

## 16. Practical Exercise

### Scenario: Representing Product Information

You are designing an AI system that works with product descriptions and images. The system needs to support three tasks:

1. Group products by broad category.
2. Find products with descriptions similar to a user-provided sentence.
3. Verify whether a product meets an exact technical requirement, such as a specified memory capacity.

For each task, propose a suitable representation strategy.

Then explain:

- Whether you would use sparse features, dense embeddings, structured attributes, or a combination.
- Which information each representation should preserve.
- Which training objectives or data characteristics might influence a learned embedding.
- Where a learned representation could confuse products that must remain distinct.
- Why a semantically similar description is not sufficient proof that a product satisfies an exact technical requirement.
- How you would validate the proposed representation against the task.

Do not assume that a single embedding must solve all three tasks. Your goal is to explain why different tasks may require different representations and where exact structured information is preferable.

## 17. Exit Criteria

You are ready to continue when you can:

- Explain distributed representations and embeddings in your own words.
- Compare sparse and dense representations without treating either as universally superior.
- Explain how training objectives influence representational behavior.
- Distinguish context-independent and context-dependent representations.
- Identify at least three ways an embedding can fail in a downstream task.
- Explain why semantic similarity cannot replace exact factual or structured validation.

If these explanations are still unclear, revisit Sections 3–10 and complete the practical exercise before proceeding.

---

**Next chapter:** [03 — Representation Spaces, Dimensionality and Similarity](03-Representation-Spaces-Dimensionality-and-Similarity.md)

**Scope:** This lesson covers the conceptual foundations of distributed representations and embeddings. Detailed representation-space geometry is in Lesson 03; systematic distance-metric selection and representation-quality evaluation are in Lesson 04. Transformer internals and retrieval implementation remain in their respective topics.

# End of Document
