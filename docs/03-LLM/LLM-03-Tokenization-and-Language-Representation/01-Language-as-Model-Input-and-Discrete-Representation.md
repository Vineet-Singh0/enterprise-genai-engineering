# 01 — Language as Model Input and Discrete Representation

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why a language model needs a machine-processable representation of text.
- Distinguish characters, Unicode code points, bytes, words, tokens, token strings, token IDs, and vocabulary entries.
- Explain how human-readable text becomes a sequence of discrete identifiers.
- Understand why a token is not necessarily a word, character, or fixed number of bytes.
- Explain why token IDs are different from learned vector representations.
- Trace a simple example from input text to a conceptual sequence of token IDs.

## Prerequisites

You should be comfortable with basic programming and text processing. Familiarity with the general idea of a language model is helpful, but knowledge of Transformer internals or embedding mathematics is not required.

## Estimated Reading Time

8–10 minutes.

## Before We Start

Consider this sentence:

```text
The engineer builds AI systems.
```

A human reads the sentence and understands its meaning. A computer can store the sentence as text, but a language model does not ordinarily process the original human-readable string directly as its learned numerical input.

Instead, the text passes through a tokenizer. The tokenizer converts it into discrete units called **tokens** and maps those units to numerical identifiers called **token IDs**.

Conceptually, the transformation looks like this:

```text
Human-readable text
        |
        v
Text representation
        |
        v
Tokenizer
        |
        v
Token pieces
        |
        v
Token IDs
        |
        v
Language model input
```

This diagram presents the central idea, not a universal implementation sequence. Actual tokenizer pipelines may contain additional stages or organize them differently.

To understand this process properly, we first need to distinguish the different ways a computer can represent text.

## 1. Why This Exists

### 1.1 Humans and machines represent text differently

Humans naturally work with words, sentences, and meaning. Computers work with encoded data and numerical operations.

A computer can store a sentence as bytes in memory or in a file. However, a trained language model expects its input in the representation defined by its architecture and training process.

Tokenization provides a practical interface between these two worlds.

It converts text into a manageable sequence of discrete units while balancing several competing requirements:

- The vocabulary should represent common text efficiently.
- Unfamiliar words should not make the input impossible to process.
- The sequence should not become unnecessarily long.
- The tokenizer should handle the relevant characters and writing systems.
- The resulting token IDs must be compatible with the model that consumes them.

These requirements are related, but they are not identical. A tokenizer that produces fewer tokens for one language or type of input is not automatically better for every application.

### 1.2 Why not process individual words directly?

Imagine building a vocabulary containing every English word.

Even a large vocabulary would struggle with new names, misspellings, product identifiers, scientific terminology, and words formed through morphology. Expanding the vocabulary indefinitely would create additional complexity.

At the opposite extreme, representing every character separately can create long sequences and may not align efficiently with the patterns a model needs to learn.

Tokenization addresses this design problem by dividing text into units chosen according to a particular tokenizer's vocabulary and rules.

The important point is that tokenization is a representation decision. It determines the discrete units through which text enters the model.

## 2. Mental Model: From Text to Numerical Input

Think of a tokenizer as a translator between two representation systems.

The first system is human-readable text. The second system is a finite vocabulary whose entries have numerical identifiers.

For example, consider a hypothetical vocabulary:

| Token string | Token ID |
|---|---:|
| `cat` | 42 |
| `play` | 57 |
| `ing` | 83 |
| `.` | 12 |

These entries are **illustrative only**. They do not describe any real tokenizer's vocabulary or token-ID assignments.

Suppose a tokenizer represents the word `playing` using the pieces `play` and `ing`.

The conceptual mapping would be:

```text
Input text:
"playing"

Token pieces:
["play", "ing"]

Token IDs:
[57, 83]
```

The model receives the numerical sequence rather than the literal strings `play` and `ing` as its ordinary token-ID input.

Notice three important distinctions:

1. A token piece can be smaller than a word.
2. A token ID identifies a vocabulary entry; it does not encode the word's meaning by itself.
3. The same text can be segmented differently by another tokenizer.

The tokenizer's vocabulary and configuration determine the actual result.

## 3. Core Concepts

### 3.1 Characters and Unicode text

A character is a unit of written text as people understand it. However, the word *character* can refer to different technical units depending on the context.

Unicode provides a standard way to identify characters and other textual elements across writing systems.

Several distinctions matter:

- **Unicode code point:** A numbered value in the Unicode codespace.
- **Grapheme cluster:** A sequence of one or more code points that a user typically perceives as one character.
- **Encoded bytes:** The byte sequence used to represent text in an encoding such as UTF-8.

These units are not interchangeable.

For example, an accented letter may be represented by a single Unicode code point or by a base letter followed by a combining mark. Both representations can appear visually similar while having different underlying sequences.

Similarly, a visible emoji may consist of multiple code points joined together.

This matters because a tokenizer operates on a particular representation of text. Its behavior can depend on normalization, encoding, and tokenizer-specific processing rules.

Do not assume that one visible character always corresponds to one code point, one byte, or one token.

### 3.2 Bytes and encoded text

Computers store and transmit data using bytes. Text encodings define how textual information is represented as byte sequences.

UTF-8 is a widely used encoding in which Unicode code points use between one and four bytes.

Consider the following conceptual transformation:

```text
Text
 |
 v
Unicode code points
 |
 v
UTF-8 encoding
 |
 v
Bytes
```

This illustrates a text-encoding process, not a complete tokenizer pipeline.

Bytes and tokens serve different purposes. Bytes are units of encoded data, while tokens are units defined by a tokenizer's representation scheme.

A byte-level tokenizer may operate using byte-oriented units or constructs built from bytes. A tokenizer based on another representation may process text differently.

Therefore, it is incorrect to assume that every tokenizer consumes one byte at a time or that each token always corresponds to a fixed number of bytes.

### 3.3 Words

Words are linguistic units, but identifying them is not always as simple as splitting text at spaces.

Consider:

```text
The engineer builds AI systems.
```

A simple whitespace-based split produces:

```text
["The", "engineer", "builds", "AI", "systems."]
```

Notice that the period remains attached to `systems.`.

A different word-segmentation procedure might separate the punctuation. Languages without spaces between words introduce additional challenges.

More importantly, a tokenizer is not required to preserve words as indivisible units.

A single word may become multiple tokens, while punctuation or whitespace may be included in token pieces depending on the tokenizer.

Words are useful linguistic concepts, but they do not define universal token boundaries.

### 3.4 Tokens and token pieces

A **token** is a discrete unit produced or recognized by a tokenizer.

Depending on the tokenizer, a token may correspond to:

- A complete word.
- Part of a word.
- Punctuation or whitespace-related text.
- A byte-oriented unit or a unit derived from bytes.
- A special symbol used by the model's input or output conventions.

There is no universal rule that a token must be a complete word or a fixed number of characters.

For example, a tokenizer might represent an unfamiliar word as several subword pieces. Another tokenizer might represent the same word using a different number of pieces.

The segmentation depends on the tokenizer's vocabulary, algorithm, and configuration.

This is why the number of tokens in a sentence cannot reliably be determined by counting its words.

### 3.5 Token strings

A token string is the human-readable representation associated with a token, where such a representation is available.

For example, a tokenizer may expose token pieces that resemble ordinary text:

```text
["The", " engineer", " builds", " AI", " systems", "."]
```

This is an illustrative sequence, not verified output from a particular tokenizer.

The leading spaces shown in some pieces are intentional. Certain tokenizers represent spaces as part of token pieces, while others use different conventions.

Consequently, token pieces should be interpreted according to the selected tokenizer rather than through assumptions based on ordinary word boundaries.

Some token representations may use visible markers or escaped forms to make otherwise difficult-to-see characters identifiable.

### 3.6 Vocabulary entries

A **vocabulary** is the collection of token entries that a tokenizer recognizes under its configuration.

Each entry corresponds to a token identifier in the tokenizer's mapping.

For example:

```text
Vocabulary
    |
    +-- Token entry A
    +-- Token entry B
    +-- Token entry C
    +-- ...
```

A tokenizer may have a vocabulary containing common words, subword pieces, punctuation-related entries, byte-oriented units, or special tokens.

Vocabulary design affects how text can be represented.

A larger vocabulary may allow some inputs to be represented using fewer tokens, but it can also increase the number of entries the model must support. A smaller vocabulary may require longer token sequences for some inputs.

Neither vocabulary size nor token count alone determines the overall quality of a language model.

Detailed vocabulary construction and special-token behavior are covered in [Chapter 03 — Tokenizer Pipeline, Vocabulary, and Special Tokens](03-Tokenizer-Pipeline-Vocabulary-and-Special-Tokens.md).

### 3.7 Token IDs

A token ID is a numerical identifier assigned to a vocabulary entry.

For example:

```text
Token pieces:
["play", "ing"]

Token IDs:
[57, 83]
```

Again, the IDs are illustrative.

The ID provides a discrete way to identify which vocabulary entry is present at a particular position in the input sequence.

Token IDs are not ordinary word indexes, universal identifiers, or numerical measures of semantic similarity.

For example, if one token has ID `57` and another has ID `83`, this does not imply that the corresponding token pieces are linguistically or semantically related.

IDs are meaningful within the relevant tokenizer and model configuration.

Changing the tokenizer can change the mapping between text and IDs. Even if two tokenizers contain similar-looking token strings, their numerical assignments need not match.

### 3.8 Input sequences

After tokenization, the input is represented as an ordered sequence of token IDs.

For a hypothetical sentence:

```text
Input:
"AI systems learn."

Token pieces:
["AI", " systems", " learn", "."]

Token IDs:
[104, 215, 367, 12]
```

All token strings and IDs in this example are illustrative.

The order matters. The model receives a sequence, not merely an unordered collection of vocabulary entries.

The tokenizer establishes the discrete units and their order. The model then processes those IDs according to its architecture and learned parameters.

The internal processing of these sequences belongs to the relevant sequence-modeling and Transformer curriculum, rather than this chapter.

## 4. Internal Working: The Conceptual Transformation

The distinctions above can be combined into a simplified view of the transformation from text to model input.

### Step 1: Receive text

An application supplies a string, such as:

```text
Build reliable AI systems.
```

At this stage, the application has human-readable text represented according to its programming language and text-handling conventions.

### Step 2: Apply tokenizer-specific processing

A tokenizer may normalize text or perform other preprocessing operations before segmentation.

The precise operations depend on the tokenizer. Some transformations may change the original textual representation, so the original input should not be assumed recoverable in every case.

Detailed processing stages are covered in Chapter 03.

### Step 3: Determine token pieces

The tokenizer identifies a sequence of token pieces according to its algorithm, vocabulary, and configuration.

A conceptual result might be:

```text
["Build", " reliable", " AI", " systems", "."]
```

This sequence is illustrative, not verified output from a specific tokenizer.

### Step 4: Map token pieces to IDs

The recognized token pieces are mapped to their numerical vocabulary identifiers.

```text
Token pieces
     |
     v
Vocabulary mapping
     |
     v
Token IDs
```

The actual identifiers depend on the selected tokenizer.

### Step 5: Supply the sequence to the model

The resulting IDs are provided through the model's input interface, potentially alongside other model-specific inputs.

At a conceptual level:

```text
Text
  |
  v
Tokenizer
  |
  v
Ordered token IDs
  |
  v
Model input interface
```

This is the boundary LLM-03 establishes. The model's learned vector representations and subsequent numerical processing belong to the embedding and model-architecture topics.

### Step 6: Understand the reverse direction

When a model produces token IDs, a tokenizer's decoding procedure can convert those IDs into a text representation.

However, decoding does not guarantee recovery of the exact original input. Normalization, lossy transformations, special-token handling, and other tokenizer-specific behavior can affect the result.

Encoding and decoding should therefore be understood as operations governed by a particular tokenizer's conventions, not as a universal promise of perfect reversibility.

## 5. Token IDs Are Not Embeddings

This distinction is fundamental to understanding LLM inputs.

A token ID is a discrete identifier. An embedding is a learned numerical vector associated with a token or another representation.

Conceptually:

```text
Token ID
   |
   v
Model's learned input representation
   |
   v
Numerical vector
```

For example, an ID such as `57` identifies a vocabulary entry. It does not mean that the token has a semantic value of 57 or that it occupies a meaningful numerical position relative to other token IDs.

A model's learned parameters determine the vector representations associated with its input identifiers.

The distinction is similar to the difference between a database record's identifier and the data associated with that record. The identifier tells you which entry is being referenced; it is not the content of the entry itself.

This analogy has limits: a model's input representation is part of a learned numerical system rather than an ordinary database lookup alone.

For a detailed treatment of learned vector representations, see [LLM-04 — Embedding Systems in Language Models](../LLM-04-Embedding-Systems-in-Language-Models/README.md). The destination path is provisional until verified against the repository.

## 6. Practical Example: Inspecting the Representation

Consider the sentence:

```text
The system processes text.
```

Before running any tokenizer, we can establish several facts:

1. The input is a human-readable text string.
2. Its visible words do not necessarily correspond one-to-one with tokens.
3. The punctuation may be represented separately or as part of a token piece.
4. Whitespace may affect segmentation.
5. The token IDs depend on the chosen tokenizer and its vocabulary.

A practical inspection should record at least four outputs:

| Observation | What to examine |
|---|---|
| Original input | The exact string supplied to the tokenizer. |
| Token pieces | The segmentation produced by the selected tokenizer. |
| Token IDs | The numerical identifiers returned by that tokenizer. |
| Decoded text | The text produced by decoding the token IDs. |

When conducting the experiment, record the tokenizer implementation, model or tokenizer identifier, relevant configuration, and library version.

Do not substitute guessed token IDs or manually invented token boundaries for actual results.

The purpose of the exercise is to observe the relationship between the original text, its discrete representation, and the tokenizer's decoding behavior.

A reproducible implementation and comparisons across input types belong to [Chapter 07 — Tokenization Efficiency and Practical Inspection](07-Tokenization-Efficiency-and-Practical-Inspection.md).

## 7. Production Perspective

Tokenization is not merely a preprocessing detail. It is part of the interface between an application and its language model.

Consider an application that accepts user messages and sends them to a model.

If the application estimates token counts using word counts alone, its estimates may differ significantly from the tokenizer's actual output. If it assumes that every token corresponds to a complete word, its debugging tools may misrepresent what the model receives.

Similarly, changing a tokenizer without verifying compatibility can alter the sequence of IDs presented to a trained model.

These are different classes of engineering problems:

- **Representation errors:** Misunderstanding the difference between text, token pieces, and IDs.
- **Measurement errors:** Assuming word counts predict token counts.
- **Compatibility errors:** Using tokenization conventions that do not match the model's expected input interface.
- **Reproducibility errors:** Comparing outputs without recording the tokenizer and configuration.

Understanding the representation is the first step toward diagnosing these failures.

Detailed efficiency analysis, token counting, and practical debugging are covered in Chapter 07. Model compatibility is developed in Chapter 06.

## 8. Common Mistakes and Misconceptions

### Mistake 1: One token always equals one word

Incorrect. A token may represent a complete word, a subword piece, punctuation, whitespace-related text, or another tokenizer-defined unit.

### Mistake 2: One character always equals one token

Incorrect. A visible character can correspond to multiple underlying code points, and a tokenizer may group multiple characters into one token or divide textual units differently.

### Mistake 3: A token always contains a fixed number of bytes

Incorrect. Token units depend on the tokenizer's representation and configuration. Byte-level approaches do not imply that every token represents exactly one byte.

### Mistake 4: Token IDs encode meaning numerically

Incorrect. IDs identify vocabulary entries. Their numerical magnitudes do not provide a general measure of semantic similarity.

### Mistake 5: All tokenizers produce the same IDs

Incorrect. Token boundaries, vocabulary entries, and ID assignments can differ across tokenizers.

### Mistake 6: Decoding always reconstructs the original input exactly

Incorrect. The result depends on tokenizer-specific processing, normalization, and decoding behavior. Some transformations can be lossy.

### Mistake 7: A tokenizer is interchangeable with any model

Incorrect. A trained model expects an input representation consistent with its learned parameters and configuration. Compatibility must be verified.

### Mistake 8: Fewer tokens automatically means a better model

Incorrect. Token count is only one consideration. Coverage, language behavior, model architecture, training, and other factors also influence the usefulness of a model and tokenizer combination.

## 9. Interview Questions with Expected Answers

### Q1. Why do language models use token IDs instead of consuming raw text directly?

**Expected answer:** Token IDs provide a discrete numerical representation of textual input that can be mapped into the model's learned input representation. Tokenization establishes the units and identifier mapping expected by the model.

### Q2. What is the difference between a token, a token ID, and an embedding?

**Expected answer:** A token is a discrete unit recognized by a tokenizer. A token ID is the numerical identifier for its vocabulary entry. An embedding is a learned numerical vector associated with the model's representation of that entry.

### Q3. Why is a token not necessarily a word?

**Expected answer:** Token boundaries are determined by the tokenizer's design, vocabulary, and configuration rather than by a universal linguistic definition of a word. A word may be represented by one token or multiple pieces.

### Q4. What is the difference between bytes and tokens?

**Expected answer:** Bytes are units of encoded data. Tokens are discrete units defined by a tokenizer. A tokenizer may use byte-oriented representations, but bytes and tokens are not universally interchangeable.

### Q5. Two tokenizers process the same sentence and return different token IDs. Is this necessarily a bug?

**Expected answer:** No. Tokenizers may use different segmentation rules, vocabularies, and ID mappings. The difference is expected when the tokenizers are different, provided each behaves according to its own specification.

### Q6. Why can changing a tokenizer break an existing model integration?

**Expected answer:** The new tokenizer may map text to different token IDs or use different special-token conventions. Those identifiers are interpreted through the model's learned input representation, so the changed interface may no longer match what the model expects.

### Q7. Can decoded text always reproduce the exact original input?

**Expected answer:** Not necessarily. Normalization and other transformations may alter the input, and decoding behavior depends on the tokenizer. Exact round-trip recovery must be verified for the specific implementation and configuration.

### Q8. An application estimates that a request contains 100 words. Can it safely assume that the request contains 100 tokens?

**Expected answer:** No. Token boundaries do not necessarily correspond to word boundaries. The application should use the tokenizer associated with the target model to obtain a meaningful token count.

## 10. Quick Revision

- Text can be represented using Unicode code points and encoded as bytes.
- Words are linguistic units; tokens are tokenizer-defined units.
- Tokenization converts text into a sequence of discrete units.
- A vocabulary contains token entries, each associated with an identifier.
- Token IDs identify entries; they are not semantic embeddings.
- Token boundaries and token counts depend on the tokenizer.
- Tokenizer and model compatibility matters because the model expects a particular input representation.
- Decoding is tokenizer-specific and does not universally guarantee exact reconstruction of the original input.

## 11. Key Takeaways

1. **Tokenization is a representation decision.** It defines the discrete units through which text enters a language model.
2. **Text units are not interchangeable.** Characters, code points, bytes, words, tokens, token strings, and token IDs represent different concepts.
3. **Token IDs are identifiers, not meanings.** Their numerical values do not independently describe semantic relationships.
4. **Tokenizer behavior is configuration-dependent.** Never assume universal token boundaries or token counts.
5. **Compatibility matters.** A tokenizer must provide an input representation consistent with the model that consumes it.

## 12. Further Reading

Consult the following sources for authoritative background:

- [The Unicode Standard](https://www.unicode.org/standard/standard.html) — Unicode text representation and character concepts.
- [RFC 3629 — UTF-8, a transformation format of ISO 10646](https://www.rfc-editor.org/rfc/rfc3629) — UTF-8 encoding and byte sequences.
- [Hugging Face Tokenizers documentation](https://huggingface.co/docs/tokenizers/) — Tokenizer concepts, implementations, and practical inspection.

Use these references to deepen the concepts introduced here. Implementation-specific claims and exact tokenizer outputs should be verified against the actual tokenizer and configuration being studied.

---

# End of Document

This completes the Markdown file: `01-Language-as-Model-Input-and-Discrete-Representation.md`

All parts can now be combined into a single production-ready Markdown document for the GitHub repository.
