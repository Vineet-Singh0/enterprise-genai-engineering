# 04 — Encoder-Decoder and Decoder-Only Architectures

## 1. Purpose

The previous chapters established the core Transformer mechanisms: attention, multi-head attention, positional information, residual connections, normalization, and feed-forward networks.

This chapter examines how Transformer components are arranged into different architectural families.

Two important designs are:

- **Encoder-decoder architectures:** use an encoder to process an input sequence and a decoder to generate or transform an output sequence, with the decoder able to attend to encoder representations.
- **Decoder-only architectures:** use a stack of decoder-style Transformer blocks to model sequences, commonly with causal attention for autoregressive language generation.

These architectures share important building blocks but differ in information flow, attention patterns, and typical training objectives.

The objective is to understand their structural differences and learn how to reason about architectural selection without assuming that one family is universally superior.

## 2. Learning Objectives

After completing this chapter, you should be able to:

- Explain the responsibilities of an encoder and a decoder.
- Trace information flow through an encoder-decoder Transformer.
- Distinguish encoder self-attention, decoder causal self-attention, and cross-attention.
- Explain how a decoder-only architecture processes sequences.
- Compare bidirectional encoder representations with causal representations.
- Explain the relationship between architecture and training objective.
- Identify typical tasks associated with each architectural family.
- Evaluate architectural trade-offs using task requirements and information-flow constraints.
- Recognize common misconceptions about encoder-only, encoder-decoder, and decoder-only models.

## 3. Prerequisites and Connections

This chapter builds on:

- **Chapter 01 — Attention and Self-Attention:** queries, keys, values, attention scores, and masking.
- **Chapter 02 — Multi-Head Attention and Positional Encoding:** multiple attention heads and positional information.
- **Chapter 03 — Transformer Architecture and Information Flow:** Transformer blocks, residual connections, normalization, feed-forward networks, and stacking.
- **AIF-03 — Machine Learning Foundations:** training objectives, data representations, and generalization.
- **AIF-06 — Sequence Modeling:** sequential prediction and the distinction between input and output sequences.

The central question is:

**Given a task's input, output, and information constraints, how should Transformer blocks be arranged so the model can learn the required mapping?**

## 4. Architectural Families at a Glance

Transformer architectures can be distinguished by how they organize representations and restrict information flow.

| Architecture family | Typical information flow | Common use cases |
|---|---|---|
| Encoder-only | Input positions can often attend bidirectionally to other permitted input positions | Classification, semantic representation, token labeling |
| Encoder-decoder | Encoder processes the input; decoder generates outputs using its own history and encoder representations | Translation, conditional generation, sequence transformation |
| Decoder-only | Each position typically attends only to itself and preceding positions | Autoregressive language modeling and text generation |

These are common patterns, not absolute restrictions on every model. Specific architectures may use different masks, objectives, or modifications.

The most important distinction is not the name of the architecture. It is the **information available to each representation when it is computed**.

## 5. Encoder-Decoder Architecture

An encoder-decoder Transformer contains two major stacks:

1. The encoder transforms the input sequence into contextual representations.
2. The decoder generates or transforms an output sequence using its own available context and information from the encoder.

The encoder and decoder have different responsibilities, even though both may use Transformer blocks.

### 5.1 High-level information flow

```text
Source sequence
Input tokens and their representations
        ↓
Encoder stack
Self-attention and feed-forward transformations
        ↓
Encoder representations
        ↓
Decoder stack
Causal self-attention and cross-attention
        ↓
Output representations and token predictions
```

This is a simplified view. The decoder commonly receives both previously available output tokens and encoder representations. It does not simply consume the encoder's final output as its only input.

### 5.2 The encoder's role

The encoder processes the source sequence and builds contextual representations.

In a conventional encoder, self-attention is bidirectional: a token can attend to other permitted source positions on either side of it. This lets the encoder construct representations using the broader input context.

For example, in a translation system, the encoder processes the source sentence before the decoder generates the target sentence.

The encoder's output is a sequence of vectors, often represented as:

\[
H = \operatorname{Encoder}(X)
\]

where:

- \(X\) is the source representation sequence.
- \(H\) is the contextual encoder output.

Each vector in \(H\) represents a source position after processing through the encoder stack.

### 5.3 Why contextual encoder representations matter

The decoder needs access to information about the source sequence while generating the target.

The encoder provides a representation that the decoder can use rather than requiring the decoder to reconstruct all source information from a single fixed-size vector.

The encoder output retains a representation for each source position, allowing the decoder to attend to different parts of the source when producing different output tokens.

This is particularly useful when the output is a transformation of an input sequence.

## 6. The Encoder's Self-Attention

The encoder's self-attention operates over the source sequence.

Given source representations \(X\), the encoder derives queries, keys, and values from that sequence:

\[
Q = XW_Q,\qquad K = XW_K,\qquad V = XW_V
\]

The attention operation is:

\[
\operatorname{Attention}(Q,K,V)
=
\operatorname{softmax}
\left(
\frac{QK^\top}{\sqrt{d_k}}+M
\right)V
\]

where \(M\) represents any applicable mask.

In a conventional encoder with bidirectional self-attention, there is no causal mask preventing a position from using later source positions. Padding masks may still exclude padding positions.

This distinction matters because the encoder is generally allowed to construct representations using the complete source input.

### 6.1 Example

Consider the source sentence:

> The engineer repaired the server after it failed.

When computing the representation of *it*, the encoder may use information from both preceding and following source positions, including information later in the sentence.

This is valid because the encoder is processing an input sequence that is already available. It is not predicting each source token from only its preceding tokens.

## 7. The Decoder's Two Attention Mechanisms

A conventional encoder-decoder Transformer decoder contains two distinct attention sublayers:

1. Causal self-attention over the decoder's available target tokens.
2. Cross-attention over the encoder's output representations.

These mechanisms solve different problems.

### 7.1 Decoder causal self-attention

During autoregressive generation, the decoder must predict the next token without using future target tokens.

Its self-attention therefore uses a causal mask.

For a target sequence of length \(m\), the mask allows position \(i\) to attend to positions \(j\) satisfying:

\[
j \leq i
\]

and prevents it from attending to future positions:

\[
j > i
\]

Conceptually:

\[
M_{ij} =
\begin{cases}
0, & j \leq i\\
-\infty, & j > i
\end{cases}
\]

The mask is applied before softmax so prohibited positions receive zero attention weight in the idealized mathematical formulation.

Causal masking enforces the information constraint required by autoregressive prediction.

### 7.2 Why causal self-attention is needed

Suppose the target sequence is:

> The system is ready.

When training a next-token prediction objective, the representation used to predict *ready* must not use the future target token *ready* itself or tokens after it.

Without causal masking, the model could access target information that should be unavailable when making the prediction.

This would undermine the intended prediction task and could introduce information leakage.

## 8. Cross-Attention

Cross-attention allows the decoder to retrieve information from the encoder's output representations.

Unlike self-attention, the query source differs from the key and value source.

Let:

- \(D\) be the current decoder representations.
- \(H\) be the encoder output representations.

The decoder derives queries from \(D\), while keys and values are derived from \(H\):

\[
Q = DW_Q
\]

\[
K = HW_K
\]

\[
V = HW_V
\]

Cross-attention is then:

\[
\operatorname{CrossAttention}(D,H)
=
\operatorname{softmax}
\left(
\frac{QK^\top}{\sqrt{d_k}}+M
\right)V
\]

The exact projection arrangements depend on the implementation, but the conceptual distinction remains: queries come from decoder-side representations, while keys and values come from encoder-side representations.

### 8.1 What cross-attention enables

At each target position, the decoder can calculate which source representations are useful for generating the next output representation.

For example, in translation, a decoder generating a target word can attend to source positions containing relevant meaning.

Different target positions can produce different attention distributions over the source sequence. The decoder is therefore not required to use the same source positions in the same way for every output token.

### 8.2 Self-attention versus cross-attention

| Property | Self-attention | Cross-attention |
|---|---|---|
| Query source | Same sequence used for key/value source | Decoder-side representation in a conventional encoder-decoder model |
| Key/value source | Same sequence | Encoder output representations |
| Main role | Mix information within the sequence | Retrieve information from another representation sequence |
| Example | A target token uses preceding target tokens | A target token uses relevant source representations |

Cross-attention is not inherently limited to translation. It is a general mechanism for one representation sequence to retrieve information from another.

## 9. Decoder Information Flow

A conventional encoder-decoder block can be understood as processing decoder information in stages:

1. The decoder receives representations of the available target tokens.
2. Causal self-attention contextualizes those representations using permitted target positions.
3. Cross-attention retrieves information from the encoder output.
4. A feed-forward network transforms the resulting features.
5. Residual connections and normalization support the transformations.

The precise order and normalization arrangement depend on the architecture.

The critical property is that the decoder has two information sources:

- Its own permitted target-side context.
- The encoder's source-side representations.

This lets the model generate outputs conditioned on an input sequence while preserving autoregressive constraints on target generation.

## 10. Decoder-Only Architecture

A decoder-only Transformer uses a stack of decoder-style Transformer blocks, typically with causal self-attention, to process a sequence.

It does not require a separate encoder stack or the encoder-decoder cross-attention sublayer.

A common decoder-only information flow is:

```text
Input token sequence
        ↓
Token representations and positional information
        ↓
Decoder-style Transformer block
Causal self-attention, residual paths, normalization, FFN
        ↓
Repeated blocks
        ↓
Output representations and next-token scores
```

This is a simplified architecture. Actual models may use different normalization strategies, positional methods, attention variants, and output heads.

### 10.1 Why decoder-only models can generate text

A decoder-only model is commonly trained to predict the next token from preceding tokens.

Given tokens:

\[
x_1,x_2,\ldots,x_t
\]

the model estimates a distribution for the next token:

\[
P(x_{t+1}\mid x_1,\ldots,x_t)
\]

After selecting or sampling a token, the model can append it to the sequence and predict another token.

Repeated prediction produces an autoregressive generation process.

The architecture's causal attention pattern ensures that a position's representation does not depend on future target tokens.

### 10.2 A decoder-only model is not merely an encoder-decoder model with its encoder removed

The two designs differ in more than the presence or absence of an encoder.

A conventional decoder-only architecture does not include the separate encoder output and associated cross-attention sublayers. Its causal self-attention stack processes the supplied sequence directly.

An encoder-decoder architecture explicitly separates source processing from target generation.

This distinction affects the architecture, information flow, computation, and how the model is conditioned on input data.

## 11. Autoregressive Language Modeling

Autoregressive language modeling factorizes a sequence probability into conditional next-token probabilities:

\[
P(x_1,\ldots,x_T)
=
\prod_{t=1}^{T}
P(x_t\mid x_1,\ldots,x_{t-1})
\]

The exact treatment of the first token depends on the model's sequence convention and special tokens.

The factorization states that the sequence is modeled as a succession of conditional predictions.

### 11.1 Training

During training, a model is commonly given a sequence and trained to predict its next tokens. The input and target sequences are shifted relative to each other, with the causal mask ensuring that each prediction uses only the permitted preceding context.

For a sequence such as:

> Models learn useful representations.

Training examples can align prefixes with their next-token targets:

| Available context | Prediction target |
|---|---|
| Start of sequence | `Models` |
| `Models` | `learn` |
| `Models learn` | `useful` |
| `Models learn useful` | `representations` |

This table is illustrative. Real training data includes tokenization, special tokens, and implementation-specific label masking.

### 11.2 Training versus generation

During training, multiple target positions can be processed in parallel because the full training sequence is available and the causal mask enforces the prediction constraints.

During autoregressive generation, the next token depends on the generated prefix. The model generally cannot generate all future tokens independently in one pass because each new token depends on previous outputs.

This difference has important consequences for inference latency and computation, which are covered in Chapter 05.

## 12. Encoder-Decoder Training Objectives

Encoder-decoder architectures are commonly trained to map a source sequence to a target sequence.

The model learns a conditional distribution:

\[
P(Y\mid X)
\]

where \(X\) is the source sequence and \(Y\) is the target sequence.

For autoregressive target generation, this can be factorized as:

\[
P(Y\mid X)
=
\prod_{t=1}^{T}
P(y_t\mid y_1,\ldots,y_{t-1},X)
\]

The decoder predicts each target token using the available target prefix and the encoder representations of the source.

### 12.1 Example: translation

Given a source sentence in one language, the encoder creates contextual source representations. The decoder generates the translated target sequence, using cross-attention to access source information.

### 12.2 Example: sequence transformation

An encoder-decoder model can also transform one structured sequence into another, provided the task and training data support that mapping.

The essential architectural pattern is not limited to natural-language translation. It is the separation of source representation processing and target generation.

## 13. Encoder-Only Architectures in Context

Although this chapter focuses on encoder-decoder and decoder-only designs, encoder-only architectures help clarify the broader family.

A conventional encoder-only Transformer processes input representations using bidirectional self-attention. It produces contextual representations for the input sequence without requiring an autoregressive decoder stack.

An encoder-only model can be trained or adapted for tasks such as:

- Text classification.
- Token classification.
- Semantic representation learning.
- Input sequence understanding.

The architecture alone does not determine the exact task. Training objectives, output heads, data, and fine-tuning influence the model's behavior.

The three families can therefore be understood as different architectural arrangements that support different information-flow patterns and task objectives.

## 14. Architectural Comparison

| Dimension | Encoder-only | Encoder-decoder | Decoder-only |
|---|---|---|---|
| Main stacks | Encoder | Encoder and decoder | Decoder-style stack |
| Typical encoder self-attention | Bidirectional | Bidirectional on source | Not applicable as a separate encoder |
| Typical decoder self-attention | Not applicable | Causal on target | Causal |
| Cross-attention to encoder | No separate decoder | Yes, in the conventional design | No separate encoder output |
| Common objective pattern | Representation learning or task-specific prediction | Conditional sequence generation | Autoregressive next-token prediction |
| Typical use cases | Classification and input understanding | Translation and conditional sequence transformation | Text generation and continuation |
| Source conditioning | Input representations directly processed | Encoder representations supplied to decoder | Supplied context processed in the same causal stack |
| Generation behavior | Depends on task-specific design | Commonly autoregressive target generation | Commonly autoregressive continuation |

This table describes common architectural patterns rather than strict limitations. Model families can support additional objectives and tasks through changes to training, heads, or architecture.

## 15. Architectural Selection: Reason from Requirements

A good engineering decision begins with the task and information constraints rather than model popularity.

### 15.1 When an encoder-only architecture may fit

Consider encoder-only designs when the main goal is to construct contextual representations of an available input sequence and use them for classification, labeling, or representation-based tasks.

The model can use bidirectional input context where the architecture permits it.

### 15.2 When an encoder-decoder architecture may fit

Consider encoder-decoder designs when the problem naturally separates an input sequence from an output sequence and the output must be conditioned on the source.

Examples include translation and other sequence-to-sequence transformations.

Cross-attention provides an explicit mechanism for the decoder to retrieve information from encoder representations.

### 15.3 When a decoder-only architecture may fit

Consider decoder-only designs when the task centers on predicting or generating a sequence from a preceding context.

The causal stack provides a consistent next-token prediction mechanism and supports autoregressive continuation.

### 15.4 Questions to ask before selecting

1. Is the main task input understanding, conditional transformation, or sequence continuation?
2. Must the model use information from later positions when constructing an input representation?
3. Is the output sequence distinct from the source sequence?
4. Does the architecture need an explicit mechanism to retrieve information from a separately encoded source?
5. What are the expected input and output lengths?
6. What training data and objective are available?
7. What inference latency, memory, and deployment constraints apply?
8. How will task quality and failure modes be evaluated?

These questions help identify the architectural requirements before comparing specific models.

## 16. Common Engineering Misconceptions

### Misconception 1: Every Transformer is decoder-only

**Correction:** Transformer architectures include encoder-only, encoder-decoder, and decoder-only families, among other variations.

### Misconception 2: Encoder-decoder and decoder-only architectures differ only in the encoder

**Correction:** They also differ in the presence of cross-attention, the arrangement of their blocks, and their source-to-target information flow.

### Misconception 3: The encoder-decoder decoder can freely attend to all target tokens

**Correction:** In conventional autoregressive generation, decoder self-attention is causally masked to prevent access to future target tokens.

### Misconception 4: Cross-attention is another name for self-attention

**Correction:** In conventional encoder-decoder architectures, cross-attention derives queries from decoder representations and keys and values from encoder representations.

### Misconception 5: Decoder-only models cannot condition on input

**Correction:** They condition on the supplied token context. The distinction is that they process this context through a causal stack rather than a separate encoder with cross-attention.

### Misconception 6: Encoder-only models cannot produce useful contextual representations

**Correction:** Encoder-only models are specifically designed to produce contextual input representations and are widely applicable to understanding and representation tasks.

### Misconception 7: Architecture alone determines model behavior

**Correction:** Architecture constrains information flow and computational structure, but training objectives, data, optimization, and task-specific components strongly influence learned behavior.

### Misconception 8: Training and autoregressive generation use identical computation

**Correction:** Training can process multiple positions in parallel under a causal mask, while autoregressive generation depends on previously generated tokens and is sequential across new token steps.

## 17. Production Engineering Considerations

Architectural selection affects more than model quality.

### 17.1 Input and output handling

Encoder-decoder systems must manage source and target sequences, including their different lengths and any task-specific formatting.

Decoder-only systems must manage the supplied context and the growing generated sequence.

Both designs require correct tokenization, attention masks, output interpretation, and evaluation.

### 17.2 Memory and compute

Encoder-decoder architectures perform work in both the encoder and decoder. Decoder cross-attention adds operations involving decoder queries and encoder representations.

Decoder-only architectures avoid a separate encoder stack but process the complete context through their causal stack.

The actual cost comparison depends on sequence lengths, model dimensions, layer counts, caching, batch size, implementation, and hardware. No architecture family is universally cheaper.

### 17.3 Latency

For autoregressive generation, the number of generated tokens and the cost per generation step influence latency.

Encoder-decoder systems additionally process the source through an encoder before or as part of generation. Depending on the workload, this separation can be beneficial or costly.

Latency must be measured for the intended source lengths, output lengths, concurrency, and hardware.

### 17.4 Correctness and leakage

For any autoregressive objective, verify that the attention mask and target alignment prevent future-token leakage.

For encoder-decoder systems, verify that:

- Source padding is handled correctly.
- Target padding is handled correctly.
- Decoder causal masking is correct.
- Cross-attention uses the intended encoder representations.
- Training labels align with the intended target positions.

Incorrect masks or alignment can produce a model that trains without obvious runtime errors but does not implement the intended task.

## 18. Knowledge Check

Answer these questions in your own words before moving to Chapter 05.

1. What are the distinct responsibilities of the encoder and decoder in an encoder-decoder Transformer?
2. Why can a conventional encoder use bidirectional self-attention while an autoregressive decoder requires causal self-attention?
3. Explain how cross-attention retrieves information from encoder representations.
4. Why is a decoder-only model not simply an encoder-decoder model with one stack removed?
5. Derive the autoregressive sequence-probability factorization.
6. How can training process multiple token positions in parallel while preserving causal prediction constraints?
7. Compare the typical information-flow patterns of encoder-only, encoder-decoder, and decoder-only architectures.
8. What task characteristics suggest an encoder-decoder design?
9. What are the principal computational and operational questions to investigate before choosing an architecture?
10. Identify three implementation mistakes that could produce invalid information flow or target leakage.

### Applied engineering exercise

You are asked to design a model for each of these tasks:

- Classifying a document into one of several categories.
- Translating a source sentence into a target language.
- Generating a continuation from a supplied text prompt.

For each task:

1. Recommend an initial architectural family.
2. Describe the information available to each token representation.
3. Explain whether cross-attention is required by the proposed design.
4. Identify the training objective you would investigate.
5. List the main quality and operational measurements you would use to validate the choice.

Your justification should be based on task requirements, not on claims that one architecture family is universally better.

## 19. Summary

Transformer architecture families differ in how they arrange blocks and constrain information flow.

- **Encoder-only architectures** commonly use bidirectional self-attention to build contextual input representations.
- **Encoder-decoder architectures** use an encoder to process source inputs and a decoder that combines causal target-side self-attention with cross-attention to encoder outputs.
- **Decoder-only architectures** commonly use causal self-attention to support autoregressive next-token prediction and generation.

The key ideas are:

- Self-attention mixes information within a sequence.
- Cross-attention allows one representation sequence to retrieve information from another.
- Causal masking prevents autoregressive predictions from accessing future target tokens.
- Architecture and training objective must be considered together.
- Correct masking, target alignment, and source conditioning are essential for implementation correctness.
- Architectural selection must account for task quality, sequence lengths, memory, compute, latency, and deployment constraints.

The final chapter connects these architectural foundations to Transformer training, inference, and scaling.

## 20. References and Further Reading

- Vaswani, A. et al. (2017). *Attention Is All You Need*. Advances in Neural Information Processing Systems.
- Devlin, J. et al. (2019). *BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding*. Proceedings of NAACL-HLT.
- Radford, A. et al. (2018). *Improving Language Understanding by Generative Pre-Training*. OpenAI technical report.

These works illustrate important architectural and training patterns: the original encoder-decoder Transformer, bidirectional encoder pretraining, and generative pretraining using a decoder-style language model.

This chapter focuses on architecture and information flow. Model-specific implementations, pretraining recipes, fine-tuning workflows, and serving details belong in the relevant downstream engineering domains.
