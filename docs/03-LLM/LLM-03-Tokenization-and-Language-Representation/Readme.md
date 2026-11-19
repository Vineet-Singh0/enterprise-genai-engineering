# LLM-03 — Tokenization and Language Representation

## Overview

Tokenization is the process of converting text into discrete units that a language model can process. These units are represented by numerical token IDs, which form part of the model's input interface.

Understanding tokenization is essential for building reliable LLM applications. Tokenizer design influences how text is represented, how multilingual input and source code are processed, how many tokens a request consumes, and whether the tokenizer is compatible with a trained model.

This topic develops an engineering-level understanding of tokenization, from its fundamental concepts to practical inspection and debugging.

## Why This Topic Matters

LLM applications operate on more than human-readable text. Before text can be processed by a language model, it must be transformed into the representation expected by that model.

A weak understanding of this process can lead to incorrect token-count estimates, unexpected input lengths, compatibility problems, and misleading assumptions about how different languages or technical inputs are represented.

By completing this topic, you will understand the tokenizer as an important interface between text-processing systems and language models.

## Learning Outcomes

After completing LLM-03, you should be able to:

- Explain why language models generally process token IDs rather than raw text.
- Distinguish characters, bytes, words, subwords, tokens, token IDs, and vocabulary entries.
- Compare character-level, word-level, subword-level, and byte-level tokenization.
- Explain the core principles of BPE, WordPiece, Unigram tokenization, and byte-level BPE.
- Describe the conceptual tokenizer pipeline, including normalization, pre-tokenization, segmentation, vocabulary lookup, special-token handling, and decoding.
- Explain how vocabulary design and token IDs relate to a model's learned input representation.
- Investigate tokenization behavior across languages, Unicode text, punctuation, whitespace, and source code.
- Explain why token counts differ from word counts and why estimates depend on the tokenizer.
- Evaluate tokenization trade-offs involving vocabulary size, sequence length, coverage, and processing behavior.
- Identify tokenizer/model compatibility risks.
- Inspect token pieces, token IDs, and decoded text using a reproducible practical example.

## Prerequisites

Before starting, you should have:

- Basic programming knowledge and familiarity with text processing.
- An introductory understanding of language models.
- Familiarity with the idea that language models process sequences of input units.

The relevant AI Foundations and earlier LLM topics provide useful background. Detailed knowledge of embedding mathematics or Transformer internals is not required to begin this topic.

## Learning Path

Complete the chapters in the following order.

| Chapter | Title | Focus |
|---|---|---|
| 01 | [Language as Model Input and Discrete Representation](01-Language-as-Model-Input-and-Discrete-Representation.md) | Understand text, bytes, tokens, vocabulary entries, and token IDs. |
| 02 | [Tokenization Approaches and Design Trade-offs](02-Tokenization-Approaches-and-Design-Trade-offs.md) | Compare tokenization approaches and understand their design trade-offs. |
| 03 | [Tokenizer Pipeline, Vocabulary, and Special Tokens](03-Tokenizer-Pipeline-Vocabulary-and-Special-Tokens.md) | Trace the conceptual transformation from input text to token IDs and back to text. |
| 04 | [Subword Tokenization Algorithms](04-Subword-Tokenization-Algorithms.md) | Understand BPE, WordPiece, Unigram, and byte-level BPE. |
| 05 | [Tokenization Across Languages and Technical Text](05-Tokenization-Across-Languages-and-Technical-Text.md) | Investigate multilingual text, Unicode, punctuation, identifiers, and source code. |
| 06 | [Tokenizer-Model Compatibility and Input Interface](06-Tokenizer-Model-Compatibility-and-Input-Interface.md) | Understand the relationship between tokenizer configuration, token IDs, and trained models. |
| 07 | [Tokenization Efficiency and Practical Inspection](07-Tokenization-Efficiency-and-Practical-Inspection.md) | Inspect tokenizer outputs, compare token counts, and reason about engineering implications. |

### Recommended Learning Sequence

Start by understanding what a token represents and how it differs from other units of text. Then examine why different tokenization approaches exist and how a tokenizer processes input.

Once the pipeline is clear, study the major subword algorithms. Apply that knowledge to multilingual and technical text before examining tokenizer/model compatibility.

Finish with practical inspection and debugging. The goal is not merely to understand tokenizer terminology but to use that understanding to investigate real engineering problems.

## Cross-Topic Dependencies

LLM-03 connects with several other topics in the Enterprise GenAI Engineering curriculum.

| Topic | Relationship |
|---|---|
| AIF-05 — Representation Learning | Provides background for distinguishing discrete token IDs from general learned representations. |
| AIF-06 — Sequence Modeling | Provides context for understanding tokenization as the creation of ordered input sequences. |
| AIF-07 — Transformer Foundations | Connects token IDs with the model's input interface. |
| LLM-01 — Language Model Evolution and Landscape | Provides background on language-model families and their ecosystems. |
| LLM-02 — Language Model Training and Learned Behavior | Explains the broader training context in which tokenized inputs are used. |
| LLM-04 — Embedding Systems in Language Models | Develops the learned vector representations associated with model inputs. |
| LLM-05 — Inference and Text Generation | Covers inference and generation-time processing beyond the tokenizer fundamentals introduced here. |
| LLM-06 — Context Engineering and Context Constraints | Develops context budgeting and management strategies that use tokenizer-specific token counts. |
| LLM-07 — Model Behavior, Reasoning, and Failure Modes | Examines broader model behavior and failure modes. |
| LLM-08 — Language Model Evaluation and Benchmarking | Covers systematic evaluation and benchmarking methodology. |
| LLM-09 — Language Model Optimization and Adaptation | Covers model optimization and adaptation methods. |
| LLM-10 — Model Selection and Ecosystem Decisions | Uses compatibility and capability considerations when evaluating models. |
| RET — Retrieval Engineering | Applies text-processing concepts within retrieval systems. |
| PROD — Production AI Engineering | Covers deployment, operational reliability, and monitoring. |
| ENT — Enterprise AI Systems | Covers enterprise-wide architecture, governance, security, and risk. |

LLM-03 focuses on tokenization and the discrete input interface. It does not replace the detailed teaching owned by these related topics.

## Suggested Learning Sessions

The topic can be studied over six sessions.

| Session | Chapters | Suggested activity |
|---|---|---|
| 1 | 01 | Trace the transformation from text to token IDs and explain the differences between representation units. |
| 2 | 02 | Compare tokenization approaches using vocabulary size, sequence length, and rare-word handling. |
| 3 | 03 | Trace the tokenizer pipeline and inspect intermediate representations conceptually. |
| 4 | 04 | Explain and compare the major subword tokenization algorithms. |
| 5 | 05–06 | Investigate multilingual and technical inputs, then reason about tokenizer/model compatibility. |
| 6 | 07 | Run a practical tokenizer inspection exercise and document the findings. |

Adjust the time spent on each session according to your understanding. Practical investigation and explanation are more important than completing a fixed number of pages.

## Scope Boundaries

LLM-03 owns the foundations of tokenization, tokenization approaches, tokenizer processing stages, major subword algorithms, vocabulary and special-token concepts, linguistic variation, tokenizer/model compatibility, and practical tokenization inspection.

The following subjects remain within their respective curriculum topics:

- **LLM-02:** Training objectives, training-data pipelines, optimization, and post-training methods.
- **LLM-04:** Embedding mathematics, embedding-space geometry, and learned vector representation behavior.
- **LLM-05:** Detailed inference execution and text-generation strategies.
- **LLM-06:** Context construction, context budgeting, and context-management strategies.
- **LLM-08:** Comprehensive evaluation methodology and benchmark design.
- **LLM-09:** Model optimization and adaptation techniques.
- **RET:** Retrieval pipelines, chunking strategies, and vector indexing.
- **PROD:** Production deployment, monitoring, and operational reliability.
- **ENT:** Enterprise governance, compliance, and organization-wide risk management.

Related concepts may be introduced briefly when necessary, but their primary explanations belong to their designated topics.

## Completion Criteria

Consider LLM-03 complete when you can demonstrate the following capabilities without relying only on memorized definitions.

### Conceptual understanding

- Explain the difference between characters, bytes, words, tokens, token IDs, and vocabulary entries.
- Describe the tokenizer pipeline and distinguish its conceptual stages.
- Explain the core principles and trade-offs of the major tokenization approaches.
- Explain why token IDs are not equivalent to learned embeddings.

### Engineering judgment

- Explain why different tokenizers can produce different token sequences and counts for the same text.
- Identify potential tokenization challenges in multilingual text and source code.
- Evaluate the compatibility implications of changing a tokenizer for a trained model.
- Explain how token counts can affect input budgets and processing requirements without confusing these effects with other sources of inference cost or latency.

### Practical application

- Encode text using a named tokenizer implementation and configuration.
- Inspect token pieces and token IDs.
- Decode token IDs and examine the resulting text.
- Compare token counts across representative inputs.
- Explain findings using reproducible observations rather than assumed or invented outputs.

### Teaching ability

- Explain tokenization to another engineer using a clear mental model.
- Compare alternative approaches and justify their trade-offs.
- Identify common misconceptions and explain why they are incorrect.

## References

Technical references should be selected and verified during chapter generation. Prefer authoritative explanations of tokenizer algorithms, Unicode and text encoding, tokenizer-library behavior, and model/tokenizer compatibility.

Exact token outputs, API behavior, and implementation-specific claims must be verified against the named tokenizer and configuration before being presented as factual examples.

---

**Topic:** LLM-03 — Tokenization and Language Representation

**Domain:** LLM Engineering

**Purpose:** Build the conceptual and practical understanding required to reason about how text becomes the discrete input representation consumed by language models.

## End of Document
