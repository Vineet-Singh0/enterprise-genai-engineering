# Subword Tokenization Algorithms

## 1. Purpose

Subword tokenization provides a practical way to represent text as discrete units without requiring a separate vocabulary entry for every possible word.

Byte Pair Encoding (BPE), WordPiece, and Unigram tokenization address this problem using different vocabulary-learning and segmentation principles. Byte-level BPE adds a byte-oriented representation to a BPE-style merging process.

Understanding these differences matters when engineers inspect tokenizer output, compare model input behavior, diagnose unexpected token sequences, or investigate tokenizer-specific processing.

This chapter focuses on **how the algorithms construct or select subword units**. The broader reasons for choosing character-, word-, subword-, or byte-level representations belong to [Chapter 02 — Tokenization Approaches and Design Trade-offs](02-Tokenization-Approaches-and-Design-Trade-offs.md). The overall processing pipeline, vocabulary lookup, special tokens, and decoding belong to [Chapter 03 — Tokenizer Pipeline, Vocabulary, and Special Tokens](03-Tokenizer-Pipeline-Vocabulary-and-Special-Tokens.md).

## 2. The Core Problem: Constructing Useful Subword Units

Consider a tokenizer that encounters both common words and unfamiliar words.

A word-level vocabulary must either contain a suitable entry for each word or provide a fallback for words it does not recognize. A character-level representation can cover text compositionally but may require many units to represent an ordinary word.

Subword tokenization takes another approach: construct a vocabulary of reusable units that can represent many words through segmentation.

For example, an illustrative vocabulary might contain:

```text
play
ing
er
```

It could represent words such as `playing` or `player` by combining available units. Whether a real tokenizer actually uses those exact pieces depends on its learned vocabulary and segmentation rules.

The important distinction is that **a subword algorithm does not necessarily split text according to linguistic morphemes**. A token boundary may reflect vocabulary-learning objectives and algorithmic rules rather than a linguistically meaningful boundary.

Two questions must be separated:

1. **Vocabulary construction:** How does the tokenizer learn or select the units it can use?
2. **Segmentation at inference time:** Given an input string and the learned tokenizer, how does it select a sequence of available units?

Different algorithms answer these questions differently.

## 3. Byte Pair Encoding (BPE)

### 3.1 Core idea

BPE builds a vocabulary by repeatedly merging adjacent units according to a learned merge order. In a common formulation, the training procedure begins with smaller units and uses observed pair frequencies to guide which adjacent units are merged.

The exact initial representation, preprocessing, boundary constraints, and vocabulary-building details depend on the tokenizer implementation.

The intuition is straightforward:

- Begin with a representation made from small units.
- Observe adjacent pairs in the training data.
- Select a pair according to the algorithm's merge criterion.
- Create a merged unit.
- Apply additional merges until the vocabulary or stopping criterion is reached.

Frequently occurring sequences can become compact units, while less common sequences may remain combinations of smaller units.

### 3.2 Illustrative merge process

Suppose the initial representation of a training corpus includes these sequences:

```text
l o w
l o w
l o w e r
```

Assume the merge procedure selects `l` and `o` first. The illustrative transformation is:

```text
l o w  →  lo w
l o w  →  lo w
l o w e r  →  lo w e r
```

If the next selected pair is `lo` and `w`, the result becomes:

```text
lo w  →  low
lo w  →  low
lo w e r  →  low e r
```

Further merges may create additional units, depending on the observed data and the learned merge sequence.

This example demonstrates the mechanics of successive merging. It is **not a claim about the exact training procedure, vocabulary, or output of any particular production tokenizer**.

### 3.3 How BPE segments input

During inference, a BPE tokenizer generally applies the learned merge rules to the initial units in the prescribed order. It does not retrain its vocabulary on every new input.

Conceptually:

```text
Input text
    ↓
Tokenizer-specific initial representation
    ↓
Apply applicable learned merges
    ↓
Final token pieces
    ↓
Vocabulary IDs
```

This is a simplified view of the algorithmic step, not a complete tokenizer pipeline. Normalization, pre-tokenization, special-token processing, and ID mapping are covered in Chapter 03.

The resulting segmentation depends on the learned merge rules and the tokenizer's surrounding configuration. A different BPE tokenizer can produce different pieces for the same text.

### 3.4 Engineering implications

BPE's merge-based construction provides a direct way to build reusable units from observed sequences. Its behavior is nevertheless determined by the learned vocabulary and merge rules, not by a universal linguistic segmentation standard.

When investigating BPE behavior, engineers should establish:

- Which tokenizer artifact and version are in use.
- What initial representation the tokenizer uses.
- Which preprocessing and boundary rules apply.
- Whether the observed output comes from the actual tokenizer or an illustrative example.

Do not assume that two implementations labeled BPE will produce identical token sequences.

## 4. WordPiece

### 4.1 Core idea

WordPiece is a subword tokenization approach associated with models such as BERT. Like BPE, it uses a learned subword vocabulary, but its vocabulary-learning approach is not simply the same as repeatedly merging the most frequent adjacent pair.

WordPiece vocabulary learning is commonly described in terms of selecting subword units that improve a language-modeling-related objective. The precise training algorithm and objective depend on the implementation; it is misleading to treat one simplified description as a universal specification for every WordPiece tokenizer.

The distinction is important: **similar-looking vocabularies do not imply identical vocabulary-learning algorithms**.

### 4.2 Training versus inference

WordPiece must be understood at two separate stages.

**During vocabulary learning:**

- Candidate subword units are evaluated according to the training procedure.
- The procedure selects a vocabulary intended to support useful text segmentation under its objective.
- The resulting vocabulary and associated configuration become part of the tokenizer artifact.

**During inference:**

- The tokenizer uses the learned vocabulary and its segmentation rules.
- A common WordPiece implementation uses a greedy longest-match-first strategy within the applicable input boundaries.
- If the remaining input cannot be segmented under the implementation's rules, it may produce an unknown-token representation or another configured fallback.

The inference strategy should not be mistaken for the vocabulary-learning algorithm. Greedy longest-match-first describes a common way of selecting pieces from an existing vocabulary; it does not explain how the vocabulary was originally learned.

### 4.3 Illustrative longest-match behavior

Suppose the available vocabulary contains the following pieces:

```text
un
play
##able
##s
```

Assume a tokenizer uses a convention in which `##` marks a piece that continues a word rather than beginning one.

For the illustrative input:

```text
unplayable
```

A greedy longest-match procedure might select:

```text
un + play + ##able
```

This is an explanation of the selection principle, not verified output from a named tokenizer.

The procedure attempts to select the longest available piece that matches the current position, then continues with the remaining input according to the tokenizer's continuation rules. Prefix markers and other vocabulary conventions are implementation-specific.

Greedy selection is not necessarily the same as finding the globally optimal segmentation under every conceivable scoring function. Its behavior follows the algorithm and constraints implemented by the tokenizer.

### 4.4 Engineering implications

When inspecting WordPiece, distinguish three things:

1. **The vocabulary-learning objective:** how the available subword units were selected.
2. **The inference segmentation procedure:** how a given input is divided using that vocabulary.
3. **The tokenizer configuration:** how boundaries, continuation markers, normalization, and fallback behavior are handled.

Conflating these can lead to incorrect explanations of why a token appears in a vocabulary or why a particular input was segmented in a certain way.

## 5. Unigram Tokenization

### 5.1 Core idea

Unigram tokenization approaches vocabulary construction differently from merge-based BPE. A common Unigram language-model tokenizer begins with a relatively large set of candidate pieces and iteratively removes candidates while attempting to preserve the quality of the resulting segmentation model.

Rather than defining the vocabulary primarily through a sequence of pair merges, the approach associates candidate pieces with scores used to evaluate possible segmentations.

The tokenizer can then consider multiple possible ways to segment a string.

### 5.2 Segmentation as a scoring problem

Consider an illustrative string:

```text
lowercase
```

Suppose a candidate vocabulary permits two segmentations:

```text
lower + case
low + er + case
```

A Unigram tokenizer assigns scores to candidate pieces and uses the model's scoring procedure to select a suitable segmentation. In common formulations, the score of a segmentation is derived from the scores of its constituent pieces.

The selected segmentation depends on the actual vocabulary and learned scores. The example does not imply that these exact pieces exist in a particular tokenizer.

Conceptually:

```text
Input string
    ↓
Identify valid candidate pieces
    ↓
Evaluate possible segmentations
    ↓
Select a high-scoring segmentation
    ↓
Token pieces
```

An implementation may use an efficient algorithm, such as dynamic programming, to identify a best-scoring segmentation without explicitly enumerating every possible combination.

### 5.3 Vocabulary learning and inference

These stages should also be distinguished for Unigram tokenization.

**During vocabulary learning:**

- A candidate vocabulary is established.
- A probabilistic segmentation model assigns scores to candidate pieces.
- Vocabulary candidates are removed according to the training procedure while attempting to maintain segmentation quality.

**During inference:**

- The learned vocabulary and scores guide segmentation.
- A common approach selects the highest-scoring valid segmentation.
- Some implementations also support segmentation sampling, which can produce alternative valid segmentations under a configured sampling procedure.

Sampling is not a requirement of every Unigram tokenizer or every inference configuration. Engineers should verify whether the implementation exposes or enables it.

### 5.4 Engineering implications

Unigram's scoring-based view makes the role of competing segmentations explicit. The same input may admit multiple valid segmentations, with the model preferring one according to its learned scores.

This differs conceptually from BPE's learned merge sequence and from WordPiece implementations that use greedy longest-match segmentation.

The practical question is not which algorithm is universally superior. It is whether the selected tokenizer's behavior is appropriate for the model and application using it.

## 6. Byte-Level BPE

### 6.1 Why byte-level processing exists

Text is represented as bytes by encoding systems before many forms of machine processing. A byte-level tokenizer uses a byte-oriented initial representation rather than relying exclusively on a fixed inventory of characters as its starting units.

Byte-level BPE combines this initial representation with BPE-style merging. The initial units are derived from bytes, and learned merges can create larger reusable units.

This design can provide broad input coverage without requiring a separate initial vocabulary entry for every Unicode character. However, byte-level processing does not eliminate the need to understand text encoding, normalization, preprocessing, or tokenizer-specific conventions.

### 6.2 Conceptual flow

```text
Text
  ↓
Tokenizer-specific text and byte handling
  ↓
Byte-oriented initial units
  ↓
Learned BPE-style merges
  ↓
Token pieces and token IDs
```

This diagram is conceptual. Real implementations may use transformations or representations that make the relationship between raw bytes and displayed token pieces less obvious.

### 6.3 What engineers should not assume

Byte-level BPE does not mean that every final token represents exactly one byte. Merging can create units that represent sequences of bytes.

It also does not mean that a human-readable display of a token always corresponds directly to a single Unicode character or an independently meaningful word fragment.

For precise behavior, inspect the tokenizer's actual implementation and configuration. The detailed effects of Unicode, multilingual text, punctuation, and code are owned by [Chapter 05 — Tokenization Across Languages and Technical Text](05-Tokenization-Across-Languages-and-Technical-Text.md).

## 7. Comparing the Algorithms

The following table summarizes the central algorithmic distinction rather than repeating the broader tokenization design comparison from Chapter 02.

| Approach | Vocabulary-learning principle | Common inference principle | Important qualification |
|---|---|---|---|
| BPE | Repeatedly merge adjacent units according to a learned criterion, commonly pair frequency | Apply learned merge rules to the initial units | Initial representation and merge constraints vary |
| WordPiece | Select vocabulary units under a training objective; not equivalent to simple frequency-based BPE merging | Common implementations use greedy longest-match-first segmentation | Training objective and fallback behavior are implementation-specific |
| Unigram | Learn scores over candidate pieces and prune the vocabulary under a segmentation objective | Select a high-scoring segmentation; some implementations support sampling | Exact scores, pruning procedure, and inference options vary |
| Byte-level BPE | Start from a byte-oriented representation and learn BPE-style merges | Apply the learned merging procedure | Byte-level initialization does not mean every final token is one byte |

Three distinctions are especially important:

- **Vocabulary learning is not the same as inference segmentation.** An algorithm's training procedure does not automatically describe how it segments a new string.
- **Algorithm names do not fully specify tokenizer behavior.** Preprocessing, boundaries, vocabulary artifacts, and configuration also affect output.
- **The final token sequence is an observable result, not proof of semantic segmentation.** A piece can be frequent or convenient for the tokenizer without corresponding to a meaningful linguistic unit.

For broad comparisons of vocabulary size, coverage, sequence length, and other design-level trade-offs, refer to Chapter 02 rather than duplicating those discussions here.

## 8. How to Investigate a Tokenization Algorithm

When an input produces unexpected token pieces, use a reproducible investigation rather than inferring behavior from the algorithm name alone.

### Step 1: Identify the exact tokenizer

Record the model or tokenizer identifier, artifact revision or version, and relevant configuration. A family label such as BPE or WordPiece is insufficient to reproduce exact output.

### Step 2: Preserve the exact input

Record the input string, including whitespace, punctuation, casing, and any unusual characters. Small differences in input or preprocessing can change segmentation.

### Step 3: Inspect the actual output

Use the tokenizer implementation to examine token pieces and, where relevant, token IDs. Do not invent token sequences or IDs from a conceptual algorithm description.

### Step 4: Separate observations from explanations

Record what the tokenizer produced before proposing why it happened. Then investigate the vocabulary, segmentation procedure, preprocessing, and configuration that could explain the result.

### Step 5: Reproduce the finding

Repeat the experiment with the same tokenizer artifact and input. If comparing tokenizers, change one variable at a time and document the differences.

Chapter 07 develops the practical inspection workflow, including token-count comparisons and reproducibility.

## 9. Common Misconceptions

**Misconception 1: BPE, WordPiece, and Unigram are interchangeable names for the same process.**

They are distinct approaches to vocabulary construction and segmentation. Similar outcomes on one input do not establish that their internal procedures are equivalent.

**Misconception 2: WordPiece is trained by simply merging the most frequent adjacent pair.**

That describes a common simplified account of BPE, not a general specification of WordPiece vocabulary learning.

**Misconception 3: WordPiece's training objective and its inference algorithm are the same thing.**

Vocabulary learning constructs the available units. Inference selects pieces from the learned vocabulary according to the tokenizer's segmentation procedure.

**Misconception 4: Unigram always samples a random segmentation.**

Some implementations support sampling, but common inference can select a highest-scoring segmentation deterministically. The available behavior depends on the implementation and configuration.

**Misconception 5: Byte-level BPE produces only single-byte tokens.**

The initial representation is byte-oriented, but learned merges can represent sequences of bytes.

**Misconception 6: Subword pieces always correspond to linguistic morphemes.**

Tokenization algorithms optimize according to their own construction and segmentation procedures. Resulting boundaries need not match linguistic structure.

**Misconception 7: Knowing the algorithm name is enough to predict exact token IDs.**

Exact results depend on the vocabulary artifact, tokenizer configuration, preprocessing, and ID mapping. Verify outputs using the tokenizer actually deployed.

## 10. Chapter Summary

BPE, WordPiece, Unigram, and byte-level BPE provide different mechanisms for constructing and selecting reusable text units.

- **BPE** builds units through a learned sequence of merges.
- **WordPiece** learns a vocabulary under its training objective; common inference uses greedy longest-match-first segmentation.
- **Unigram** learns scores over candidate pieces and selects a high-scoring segmentation, with optional sampling in some implementations.
- **Byte-level BPE** applies BPE-style merging to a byte-oriented initial representation.

The most important engineering habit is to separate the algorithm's general principle from the behavior of a specific tokenizer artifact. When exact behavior matters, inspect and reproduce the real implementation instead of assuming that an algorithm label fully determines its output.

### Review Questions

1. Why is BPE's merge-learning procedure different from WordPiece's common inference segmentation procedure?
2. What is the distinction between Unigram vocabulary pruning and selecting a segmentation for an input?
3. Why does byte-level BPE not imply that every final token corresponds to one byte?
4. Which details would you record to reproduce a tokenization discrepancy in production?
5. Why should broad vocabulary-size and sequence-length trade-offs be explained primarily in Chapter 02 rather than repeated here?

### Scope and Cross-References

- Previous: [Chapter 03 — Tokenizer Pipeline, Vocabulary, and Special Tokens](03-Tokenizer-Pipeline-Vocabulary-and-Special-Tokens.md)
- Related: [Chapter 02 — Tokenization Approaches and Design Trade-offs](02-Tokenization-Approaches-and-Design-Trade-offs.md)
- Next: [Chapter 05 — Tokenization Across Languages and Technical Text](05-Tokenization-Across-Languages-and-Technical-Text.md)
- Practical investigation: [Chapter 07 — Tokenization Efficiency and Practical Inspection](07-Tokenization-Efficiency-and-Practical-Inspection.md)
