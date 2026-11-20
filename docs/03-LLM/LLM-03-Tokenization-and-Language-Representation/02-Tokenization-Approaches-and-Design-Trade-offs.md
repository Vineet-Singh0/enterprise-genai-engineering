# 02 — Tokenization Approaches and Design Trade-offs

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why language models need a practical strategy for dividing text into discrete units.
- Compare character-level, word-level, subword-level, and byte-level tokenization.
- Explain the trade-offs between vocabulary size, sequence length, coverage, and rare-word handling.
- Understand how different tokenization approaches represent unfamiliar words and multilingual text.
- Explain why no tokenization approach is universally optimal.
- Evaluate tokenization choices using engineering requirements rather than token count alone.
- Distinguish broad tokenization approaches from the specific algorithms that implement them.

## Prerequisites

You should understand the distinctions between text, words, tokens, vocabulary entries, and token IDs from [Chapter 01 — Language as Model Input and Discrete Representation](01-Language-as-Model-Input-and-Discrete-Representation.md).

## Estimated Reading Time

9–12 minutes.

## 1. Before We Start

Consider three possible ways to represent the word:

```text
unpredictable
```

One tokenizer might represent the entire word as a single unit.

Another might divide it into smaller pieces:

```text
un + predict + able
```

A third might represent it using individual characters or byte-oriented units.

These are illustrative possibilities, not verified outputs from specific tokenizers.

Each representation has advantages and limitations. A whole-word representation can be compact for familiar words, while smaller units can help represent unfamiliar words. However, smaller units can produce longer sequences.

This creates a central design problem:

**How should text be divided into discrete units so that a language model can represent diverse inputs efficiently and reliably?**

The answer depends on the tokenization approach, the vocabulary, the language distribution, and the application's requirements.

## 2. Why Tokenization Approaches Exist

A tokenizer must balance two competing goals:

1. Represent common text efficiently.
2. Handle unfamiliar or unusual text without requiring a separate vocabulary entry for every possible input.

Imagine building a vocabulary containing every word a model might encounter.

Even a very large vocabulary cannot anticipate every new name, spelling variation, technical identifier, or newly formed word. Adding more entries also increases the number of token identities the model must support.

Now imagine representing every word as individual characters. This avoids the need for a separate entry for every complete word, but a sentence may require many more tokens.

Neither extreme solves every problem well.

Different tokenization approaches represent different points in this trade-off space.

The main approaches considered here are:

- Character-level tokenization.
- Word-level tokenization.
- Subword-level tokenization.
- Byte-level tokenization.

These categories describe broad representation strategies. Specific tokenizer algorithms and configurations determine how the strategies are implemented.

## 3. The Main Design Trade-offs

Before comparing the approaches, it helps to understand the criteria used to evaluate them.

### 3.1 Vocabulary size

The vocabulary is the set of token entries available to a tokenizer.

A word-level vocabulary may need many entries to cover common words and their variations. A character-level vocabulary can often use a much smaller set of basic units for a given writing system.

Subword approaches occupy a middle ground by combining frequently useful pieces into a larger vocabulary.

However, vocabulary size alone does not determine quality. A smaller vocabulary may produce longer sequences, while a larger vocabulary may introduce other costs.

### 3.2 Sequence length

Sequence length is the number of tokens used to represent an input.

For example, a hypothetical tokenizer could represent a word using one token, while another might use four.

If a complete input contains many such words, these differences accumulate.

Longer token sequences can affect:

- How much text fits within a model's context limit.
- The amount of sequence processing required.
- Inference latency and computational cost, depending on the model and execution configuration.

These effects should not be confused with all sources of model latency or cost. Model architecture, hardware, batching, and other execution factors also matter.

### 3.3 Coverage

Coverage describes how well the tokenization system can represent the inputs it encounters.

A tokenizer with a word-level vocabulary may encounter a word that does not exist in its vocabulary.

A subword tokenizer may instead represent that word using smaller known pieces.

A byte-oriented approach can provide a representation path for arbitrary byte sequences, but that does not guarantee that the model understands every input equally well.

Coverage is therefore not the same as understanding.

### 3.4 Rare-word handling

Rare words include unfamiliar names, specialized terminology, unusual spellings, and words that appear infrequently in the data used to construct a vocabulary.

A tokenizer that relies on complete-word entries may struggle with such inputs when the relevant word is absent from its vocabulary.

Smaller reusable units can reduce this problem because an unfamiliar word may be assembled from known pieces.

However, a valid tokenization does not guarantee that the model has learned a useful representation or behavior for that word.

### 3.5 Compositionality

Compositionality, in this context, refers to the ability to represent a larger textual unit using smaller reusable units.

For example, a subword tokenizer may divide a word into pieces that also appear in other words.

This can make vocabulary coverage more flexible. Yet the pieces do not necessarily correspond to meaningful linguistic components, and the model must still learn useful patterns from its training data.

## 4. Character-Level Tokenization

### 4.1 The basic idea

Character-level tokenization represents text using individual character-like units.

For example, the word:

```text
cat
```

could be represented as:

```text
c | a | t
```

The exact definition of a character unit depends on the implementation. It might operate on Unicode code points or use another character-oriented representation.

The important property is that ordinary words are not generally treated as indivisible vocabulary entries.

### 4.2 Why use it?

A character-oriented vocabulary can be relatively small compared with a vocabulary containing large numbers of complete words.

It can also represent unfamiliar words using familiar character units, provided the relevant characters are supported by the representation.

Consider a newly encountered name:

```text
Virelona
```

If the tokenizer recognizes its component characters, it can represent the name without requiring a dedicated vocabulary entry for the entire word.

This is useful for understanding the coverage advantage of smaller representation units.

### 4.3 The trade-off

The same flexibility can increase sequence length.

A word that another tokenizer represents using one or two tokens may require several character-level tokens.

For language models, a longer sequence can increase processing requirements and consume more of the available context.

Character-level representations also do not eliminate all text-processing challenges. Unicode contains multiple writing systems and combining sequences, and a visible character may not correspond to a single underlying code point.

### 4.4 When is it useful?

Character-level approaches are useful as a conceptual baseline and can be appropriate for particular modeling tasks.

However, they are not automatically the best choice for general-purpose language models. The longer sequences and the model's ability to learn useful patterns from individual characters must be considered.

## 5. Word-Level Tokenization

### 5.1 The basic idea

Word-level tokenization treats words as the primary units.

For example:

```text
The engineer builds systems.
```

A simple whitespace-based word splitter might produce:

```text
The | engineer | builds | systems.
```

Notice that punctuation remains attached to the final unit in this example. A more sophisticated word-level tokenizer could treat punctuation separately.

This illustrates an important distinction: word-level tokenization is a broad approach, not a guarantee that every implementation uses the same splitting rules.

### 5.2 Why use it?

Word-level representations can be compact when the input consists of words already present in the vocabulary.

A common word may be represented using one token instead of several smaller pieces.

The resulting sequences can be shorter than those produced by character-level tokenization.

Word-level representations also align naturally with many familiar linguistic concepts, although this does not mean they always produce the most useful representation for a model.

### 5.3 The vocabulary problem

The main difficulty is the number of possible words.

Consider variations such as:

```text
connect
connected
connecting
reconnection
```

A word-level vocabulary may require separate entries for these forms if each is to be represented as a single token.

The problem becomes more pronounced with rare names, technical terminology, misspellings, and newly created words.

A word-level tokenizer with an unknown-token mechanism may replace unsupported words with a special unknown token. This avoids an undefined mapping, but it loses distinctions between different unsupported words.

Some systems use other fallback mechanisms, so unknown-token handling should not be assumed to be universal.

### 5.4 When is it useful?

Word-level tokenization is useful for understanding vocabulary-based text representation and can suit constrained domains with controlled vocabularies.

For broad, open-ended language modeling, its vocabulary and unknown-word limitations make it less flexible than approaches that can compose unfamiliar words from smaller units.

## 6. Subword-Level Tokenization

### 6.1 The basic idea

Subword tokenization represents text using units that may be smaller than a word but larger than a character.

For example, a tokenizer might represent:

```text
reusable
```

as:

```text
re | use | able
```

This is an illustrative segmentation, not a claim about any specific tokenizer.

Another tokenizer might use different boundaries for the same word.

The central idea is to combine reusable smaller pieces with larger units that are useful for common patterns.

### 6.2 Why it exists

Subword approaches address an important weakness of word-level vocabularies: the inability to represent every possible word as a known whole-word entry.

Suppose a tokenizer has learned useful pieces associated with familiar words. It may use those pieces to represent an unfamiliar word without adding the entire word to the vocabulary.

This gives the tokenizer a flexible representation system.

At the same time, common words or common textual sequences can sometimes be represented compactly using larger vocabulary entries.

Subword tokenization therefore balances vocabulary reuse with sequence length.

### 6.3 The trade-off

Subword tokenization introduces design choices about which pieces should be included in the vocabulary and how text should be segmented.

Different algorithms make these decisions differently. Their results can differ even when they are applied to the same input.

Subword boundaries are not guaranteed to match linguistic morphemes, syllables, or meaningful word components.

A model may process a rare word as several valid subword pieces without having learned a strong understanding of the word itself.

Subword tokenization improves representation flexibility; it does not automatically solve every language-modeling problem.

### 6.4 When is it useful?

Subword tokenization is a widely used design strategy in modern language-model systems because it balances several competing requirements:

- A manageable vocabulary.
- Reuse of common textual patterns.
- Flexible handling of unfamiliar words.
- Reasonable sequence lengths for many inputs.

The exact balance depends on the tokenizer algorithm, vocabulary, training data, and target languages.

The specific algorithms that implement subword tokenization are covered in [Chapter 04 — Subword Tokenization Algorithms](04-Subword-Tokenization-Algorithms.md).

## 7. Byte-Level Tokenization

### 7.1 The basic idea

Byte-level tokenization uses byte-oriented units as the basis for representing text, or constructs tokens from byte sequences.

A byte is a unit of encoded data consisting of eight bits.

Unlike a vocabulary containing only complete words, a byte-oriented representation can provide a way to represent text using the underlying encoded bytes.

For example, UTF-8 represents Unicode code points using one to four bytes. A byte-oriented tokenizer can work with these encoded units rather than requiring a dedicated vocabulary entry for every possible word.

This distinction matters when processing unfamiliar text.

### 7.2 Why use it?

Byte-oriented approaches can provide broad input coverage.

A previously unseen name or technical identifier does not necessarily require a dedicated whole-word token. The underlying byte sequence can be represented using the tokenizer's byte-oriented mechanism.

This can reduce dependence on a predefined inventory of complete words.

However, broad byte coverage should not be confused with universal support for every input format or with guaranteed semantic understanding.

The application still needs to handle text encoding correctly, and the model must learn useful patterns from the representations it receives.

### 7.3 The trade-off

Bytes are smaller units than most words and many subword pieces.

Representing text at a byte-oriented level can therefore produce longer sequences than a tokenizer that groups frequent byte sequences into larger tokens.

Some practical systems combine byte-level foundations with a subword vocabulary. Byte-level BPE is an important example: it uses byte-oriented representation while learning or constructing larger reusable token units.

Thus, byte-level and subword-level tokenization are not necessarily mutually exclusive categories.

### 7.4 When is it useful?

Byte-oriented approaches are useful when broad coverage and a well-defined underlying representation are important.

Their efficiency depends on how the tokenizer groups units, the input distribution, and the implementation. It is not correct to assume that every byte-level tokenizer produces one token per byte.

## 8. Comparing the Approaches

The following table summarizes the principal trade-offs.

| Criterion | Character-level | Word-level | Subword-level | Byte-level |
|---|---|---|---|---|
| Basic unit | Character-oriented unit | Whole word or word-like unit | Reusable word fragments and larger pieces | Byte-oriented units or constructions from bytes |
| Vocabulary pressure | Often relatively low | Potentially high | Adjustable through vocabulary design | Broad underlying coverage; size depends on token construction |
| Sequence length | Often long | Often short for known words | Usually balances larger and smaller units | Can be long without grouping |
| Rare-word handling | Uses component character units | May require an unknown-token or fallback mechanism | Can compose unfamiliar words from known pieces | Can represent encoded text through byte-oriented units |
| Linguistic alignment | Does not preserve whole words as units | Often aligns with word boundaries | Boundaries may or may not align with linguistic units | Does not inherently preserve word boundaries |
| Main limitation | Potentially long sequences | Vocabulary growth and unknown words | Segmentation and vocabulary trade-offs | Potentially long sequences and encoding considerations |

These are broad tendencies, not universal guarantees. Actual behavior depends on implementation details, text normalization, vocabulary construction, and configuration.

### 8.1 Vocabulary size versus sequence length

A useful way to reason about tokenization is to examine vocabulary size and sequence length together.

A whole-word vocabulary can reduce the number of tokens for familiar words, but supporting a wider variety of words can require more entries.

A character-oriented vocabulary can reuse a small set of units, but may require more tokens for the same input.

Subword approaches aim to balance these extremes.

Byte-oriented approaches can provide broad coverage, while grouping frequent byte sequences into larger units can improve efficiency.

No single metric is sufficient to select a tokenizer.

### 8.2 Coverage versus efficiency

Coverage asks whether an input can be represented.

Efficiency asks how economically the input is represented under the chosen system.

These properties are related but different.

A representation can cover unfamiliar text while producing a long sequence. Another representation may be compact for familiar text but handle unsupported words poorly.

For production systems, both properties matter. The relevant balance depends on the application's languages, input distribution, context constraints, and compatibility requirements.

## 9. Engineering Decisions and Trade-offs

Tokenization should be evaluated in the context of a specific application rather than as an isolated algorithm choice.

### 9.1 General-purpose language applications

For an application that accepts open-ended user messages, names, technical terms, and varied writing styles, a rigid whole-word vocabulary can create substantial coverage problems.

A subword approach can provide a useful balance between vocabulary reuse and sequence length.

A byte-oriented fallback or representation strategy may offer additional coverage, depending on the tokenizer design.

The correct choice still depends on the model's trained interface and the languages the application must support.

### 9.2 Multilingual applications

A tokenizer may be efficient for some languages and less efficient for others.

Languages differ in writing systems, morphology, word boundaries, and how their text appears in the tokenizer's vocabulary and training data.

Therefore, an engineering evaluation should examine representative inputs from the actual target languages rather than relying on English-only examples.

A lower token count is useful evidence about representation efficiency, but it is not a complete measure of language quality.

### 9.3 Source code and technical identifiers

Source code contains punctuation, symbols, whitespace, identifiers, and combinations of characters that may be uncommon in ordinary prose.

A tokenizer designed around common natural-language patterns may segment these inputs differently from how an engineer would visually interpret them.

When code is a major input type, inspect representative code snippets, paths, URLs, variable names, and error messages.

Do not assume that a tokenizer that performs well on ordinary prose will necessarily represent technical inputs equally efficiently.

### 9.4 Context and inference implications

Tokenization influences how many tokens an input occupies.

That count can affect how much text fits within a model's context constraints and may influence processing time or cost.

However, the total impact also depends on the model, its execution strategy, the length of generated output, hardware, and service configuration.

Detailed token counting and practical measurement belong to [Chapter 07 — Tokenization Efficiency and Practical Inspection](07-Tokenization-Efficiency-and-Practical-Inspection.md). Context budgeting and management belong to LLM-06.

## 10. Common Mistakes and Misconceptions

### Mistake 1: Word-level tokenization is always better because words have meaning

Words are useful linguistic units, but a fixed word vocabulary cannot easily cover every name, spelling variation, or newly formed word.

### Mistake 2: Character-level tokenization solves all vocabulary problems

Character-oriented units can improve coverage, but may create longer sequences. Unicode representation and text-processing rules also remain important.

### Mistake 3: Subword boundaries always represent meaningful word parts

Subword boundaries are determined by the tokenizer's design and learned or constructed vocabulary. They do not necessarily correspond to linguistic morphemes or semantic units.

### Mistake 4: Byte-level tokenization always means one token per byte

Some byte-oriented approaches group byte sequences into larger tokens. The actual number of tokens depends on the tokenizer.

### Mistake 5: A tokenizer that covers every input understands every input

Coverage means the input can be represented. It does not guarantee that the model has learned useful patterns or can answer questions about that input reliably.

### Mistake 6: The smallest vocabulary is always the most efficient

A smaller vocabulary can require longer token sequences. Vocabulary size and sequence length must be evaluated together.

### Mistake 7: Fewer tokens automatically means better model quality

Token efficiency is only one dimension. Model training, language coverage, input distribution, and other factors also affect model behavior.

### Mistake 8: One tokenization approach is universally best

Different applications have different language requirements, input types, and performance constraints. A sound engineering decision evaluates the trade-offs against those requirements.

## 11. Interview Questions with Expected Answers

### Q1. Why is character-level tokenization more flexible than whole-word tokenization?

**Expected answer:** It can represent unfamiliar words using known character-oriented units without requiring a separate vocabulary entry for every complete word. Its main trade-off is that it can produce longer sequences.

### Q2. What problem does subword tokenization attempt to solve?

**Expected answer:** It balances the compact representation of common textual patterns with the ability to represent unfamiliar words using reusable smaller pieces. This reduces dependence on a complete vocabulary of whole words.

### Q3. What is the difference between subword-level and byte-level tokenization?

**Expected answer:** Subword-level tokenization uses reusable pieces that may span multiple characters or parts of words. Byte-level tokenization uses byte-oriented units or constructs tokens from byte sequences. A tokenizer can combine both strategies, as in byte-level BPE.

### Q4. Why can a large vocabulary still be insufficient for open-ended text?

**Expected answer:** The space of possible words, names, identifiers, and spelling variations is open-ended. A finite vocabulary of complete words cannot contain every possible input.

### Q5. Why does a tokenizer's vocabulary size affect sequence length?

**Expected answer:** Vocabulary entries determine which units can represent an input. A vocabulary containing useful larger units may represent some text with fewer tokens, while a vocabulary of smaller units may require more tokens. The relationship depends on the vocabulary and segmentation rules.

### Q6. Is broad input coverage sufficient to establish that a tokenizer is suitable for a multilingual application?

**Expected answer:** No. The tokenizer must also be evaluated on representative languages and inputs. Coverage alone does not establish segmentation efficiency, model quality, or suitability for the application's requirements.

### Q7. How would you compare tokenization approaches for a code-assistant application?

**Expected answer:** Define representative code inputs and evaluate how candidate tokenizers represent identifiers, punctuation, whitespace, URLs, and error messages. Measure token counts and inspect segmentation, then consider model compatibility and the application's performance requirements.

### Q8. Why should tokenization decisions be evaluated alongside model compatibility?

**Expected answer:** The trained model expects the input representation associated with its tokenizer and learned parameters. A different tokenization scheme can change the sequence of IDs and therefore change what the model receives.

## 12. Quick Revision

- Character-level approaches use character-oriented units and can produce long sequences.
- Word-level approaches represent words compactly when they exist in the vocabulary but can struggle with unfamiliar words.
- Subword approaches balance reusable pieces, vocabulary size, and sequence length.
- Byte-level approaches provide byte-oriented representation, sometimes combined with subword grouping.
- Vocabulary size, sequence length, coverage, and rare-word handling must be evaluated together.
- Tokenization boundaries do not necessarily correspond to meaningful linguistic units.
- Input coverage does not guarantee model understanding.
- Tokenizer selection must account for the application's language distribution, input types, and model compatibility.

## 13. Key Takeaways

1. **Tokenization is a trade-off.** Vocabulary size, sequence length, coverage, and efficiency are connected design considerations.
2. **Whole words are not enough for every input.** Open-ended language contains too many possible words and identifiers for a finite whole-word vocabulary to cover completely.
3. **Smaller units increase flexibility but can increase sequence length.** This is a central motivation for subword approaches.
4. **Byte-level and subword approaches can coexist.** Broad representation coverage and efficient grouping are not mutually exclusive.
5. **Evaluate the complete system.** Token count alone cannot establish tokenizer quality, model quality, or production suitability.

## 14. Further Reading

- [Hugging Face Tokenizers documentation](https://huggingface.co/docs/tokenizers/) — Practical tokenizer concepts and implementation details.
- [SentencePiece](https://github.com/google/sentencepiece) — An open-source tokenizer library supporting subword tokenization approaches.
- [Unicode Standard](https://www.unicode.org/standard/standard.html) — Background on Unicode text representation.
- [RFC 3629 — UTF-8](https://www.rfc-editor.org/rfc/rfc3629) — The UTF-8 character encoding and its byte representation.

These references provide background for further investigation. Exact behavior should always be verified against the tokenizer implementation and configuration under consideration.
