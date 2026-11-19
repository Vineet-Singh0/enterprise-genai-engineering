# The Autoregressive Next-Token Generation Loop

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain why autoregressive language models generate output one token at a time.
- Trace the path from input token IDs to next-token logits, probabilities, and a selected token.
- Distinguish hidden representations, logits, probabilities, token IDs, and decoded text.
- Explain how the generated sequence becomes the input context for the next generation step.
- Work through a numerical example of several consecutive generation steps.
- Describe the relationship between greedy selection, probabilistic sampling, and the generation loop.
- Implement a simplified autoregressive generation loop using pseudocode.
- Identify common implementation mistakes and explain their consequences.

This chapter focuses on the **mechanics of autoregressive generation**. The mathematical and behavioral details of decoding strategies belong primarily to Chapter 04, while prefill and key-value caching are covered in Chapter 03.

## 2. Prerequisites

You should understand:

- The distinction between training and inference.
- The high-level inference lifecycle described in Chapter 01.
- The difference between a trained model and its inference-time configuration.
- The purpose of tokenization and token IDs. See LLM-03 for the complete tokenization pipeline.
- The basic idea that a language model produces scores for possible next tokens.

You do not need to understand the full Transformer architecture to follow this chapter. The internal attention and representation mechanisms belong to AIF-07 and LLM-04.

## 3. Estimated Reading Time

Approximately 25–35 minutes, including the worked numerical example and pseudocode.

## 4. Before We Start

Consider the prompt:

> Water freezes at

A language model might continue with:

> zero degrees Celsius.

A reader sees one continuous sentence. The inference system, however, does not generally produce the entire continuation through one indivisible next-token decision.

Instead, an autoregressive model repeatedly predicts and selects the next token, extends the available sequence, and uses that extended sequence to determine the next prediction.

Conceptually:

```text
Prompt
  |
  v
Model computes next-token scores
  |
  v
Select one token
  |
  v
Append token to sequence
  |
  v
Compute scores for the next token
  |
  v
Repeat until generation stops
```

This repeated process is called **autoregressive generation**.

The central idea is simple:

**Each generation step produces a decision about the next token, conditioned on the sequence available at that step.**

Understanding this loop is essential because decoding strategies, stopping conditions, streaming, and many generation-time bugs depend on it.

## 5. Why Autoregressive Generation Exists

### 5.1 Predicting a sequence through conditional predictions

A language model does not need to predict an entire arbitrary-length response as one indivisible output.

Instead, it can model the probability of a sequence as a product of conditional next-token probabilities.

For a token sequence \(x_1, x_2, \ldots, x_n\):

\[
P(x_1,\ldots,x_n)
=
\prod_{t=1}^{n}
P(x_t \mid x_1,\ldots,x_{t-1})
\]

Here:

- \(x_t\) represents the token at position \(t\).
- \(x_1,\ldots,x_{t-1}\) represent the preceding tokens.
- \(P(x_t \mid x_1,\ldots,x_{t-1})\) represents the conditional probability assigned to the next token given the preceding sequence.

For text generation, the prompt supplies an initial context. The model then repeatedly predicts tokens that extend it.

This factorization does not mean that each token is generated independently. The opposite is true: each prediction is conditioned on the available context.

### 5.2 Why not generate the complete response in one step?

A complete response may contain an unknown number of tokens. The model cannot generally know the entire continuation in advance through a single ordinary next-token decision.

Autoregressive generation provides a mechanism for extending the sequence incrementally:

1. Start with the prompt.
2. Predict the next token.
3. Add the selected token.
4. Predict another token using the extended context.
5. Continue until a stopping condition is reached.

The generated output can therefore adapt its continuation to the tokens already selected.

This does not guarantee that the output is correct, coherent, or desirable. It describes the generation mechanism, not a quality guarantee.

### 5.3 What does “autoregressive” mean?

In this context, *autoregressive* means that predictions for future positions are conditioned on previously available tokens from the same sequence.

During ordinary causal text generation, the model does not use future generated tokens that have not yet been selected.

The model's learned parameters determine how the current context is processed. The generation procedure determines how the resulting next-token scores are used to extend the sequence.

Do not confuse autoregressive generation with a specific decoding strategy. Greedy decoding and sampling can both operate through the same autoregressive loop.

## 6. The Core Data Objects

Before tracing the loop, distinguish the objects involved in one generation step.

| Object | Meaning | Example |
|---|---|---|
| Token IDs | Integer identifiers representing tokens | `[812, 4912, 318]` |
| Hidden representations | Internal numerical representations produced during model computation | A vector associated with a sequence position |
| Logits | Unnormalized scores for possible next tokens | `[2.4, 1.7, 0.3, -0.8]` |
| Probabilities | Normalized values representing a distribution over candidate tokens | `[0.603, 0.299, 0.074, 0.025]` |
| Selected token ID | Integer ID chosen for the next position | `1042` |
| Decoded text | Human-readable text reconstructed from token IDs | `" zero"` |

The values above are illustrative. The token IDs do not correspond to the displayed logits or probabilities; the table identifies different types of objects, not one measured model output.

### 6.1 Token IDs are not words

A tokenizer can represent a word using one token, multiple subword tokens, or a token that includes whitespace or punctuation.

Therefore, the generation loop should operate on token IDs rather than assume that each token is a complete word.

For example, a displayed word such as `freezing` might be represented by one token or several tokens, depending on the tokenizer.

The exact tokenization is model-dependent and belongs to LLM-03.

### 6.2 Hidden representations are not logits

During model computation, internal layers transform the input representations.

The resulting hidden representation at the relevant sequence position is used by the model's output computation to produce logits over the model's vocabulary.

Conceptually:

```text
Input token IDs
      |
      v
Model computation
      |
      v
Hidden representation at the relevant position
      |
      v
Output projection
      |
      v
Next-token logits
```

This is a conceptual view, not a complete account of Transformer internals. AIF-07 and LLM-04 cover the internal architecture and representation flow.

### 6.3 Logits are not probabilities

Logits are real-valued scores. They are not restricted to the range from zero to one and do not have to sum to one.

For example:

```text
Candidate token     Logit
" zero"              2.4
" 0°C"               1.7
" room"              0.3
" the"              -0.8
```

The logits express relative preference under the model's current output distribution before any applicable probability transformation or decoding-time processing.

A probability distribution can be derived from logits using softmax:

\[
P(x_i)=\frac{e^{z_i}}{\sum_j e^{z_j}}
\]

where \(z_i\) is the logit for candidate token \(i\).

The generation system may transform or filter scores before selection, depending on its decoding configuration. Chapter 04 explains those mechanisms.

### 6.4 Probabilities are not selected tokens

A probability distribution describes the available choices. It does not, by itself, specify which token the system must select.

A selection rule is also required.

For example:

- Greedy selection chooses the candidate with the highest applicable score.
- Sampling selects a candidate according to a probability distribution.

These approaches can produce different continuations from the same initial context. The generation loop remains autoregressive in either case.

## 7. One Generation Step, Internally

A single generation step can be understood as a sequence of operations.

### 7.1 Start with the available sequence

Suppose the prompt has been converted into token IDs:

```text
[Water, freezes, at]
```

This is a human-readable illustration, not a literal tokenizer output. In an implementation, the model receives integer token IDs and any other required inputs.

Let the current sequence be:

\[
X_t=[x_1,x_2,\ldots,x_t]
\]

Here, \(X_t\) denotes the token sequence available before selecting the next token.

### 7.2 Compute the model output

The model processes the current context and computes internal representations.

For a causal language model, the representation at the final relevant position is used to obtain scores for the next token.

In a straightforward full-sequence implementation, the model may compute representations and logits for multiple positions. The next-token decision uses the logits corresponding to the current sequence's final position.

Efficient implementations can avoid recomputing the entire sequence at every step. Prefill and key-value caching are the subject of Chapter 03.

### 7.3 Produce next-token logits

Assume the model produces these hypothetical logits for four candidate tokens:

| Candidate | Logit |
|---|---:|
| `" zero"` | 2.4 |
| `" 0°C"` | 1.7 |
| `" room"` | 0.3 |
| `" the"` | -0.8 |

These values are invented for teaching. They are not measured outputs from a real model.

The logits correspond to candidate tokens in the model's vocabulary. A real vocabulary typically contains far more than four candidates.

The four-token example is deliberately simplified so that the arithmetic can be inspected manually.

### 7.4 Convert logits into probabilities

Applying softmax to the four illustrative logits gives approximately:

| Candidate | Approximate probability |
|---|---:|
| `" zero"` | 60.3% |
| `" 0°C"` | 29.9% |
| `" room"` | 7.4% |
| `" the"` | 2.5% |

The percentages sum to approximately 100%, with a small rounding difference.

These probabilities are normalized over the four displayed candidates for this example. In an actual model, the distribution normally covers the model's full output vocabulary unless a supported constraint or transformation changes the candidate set.

Notice that the highest logit corresponds to the highest probability under ordinary softmax without additional transformations. However, this does not mean that the selected token must always be the highest-probability token: the selection rule determines that.

### 7.5 Select the next token

If the system uses greedy decoding and no other score transformation changes the ranking, it selects:

```text
" zero"
```

The token is appended to the existing sequence.

Conceptually:

```text
Before:
Water freezes at

After:
Water freezes at zero
```

The actual internal operation appends a token ID, not a string.

### 7.6 Prepare for the next step

The selected token becomes part of the context for the next prediction:

\[
X_{t+1}=[x_1,x_2,\ldots,x_t,x_{t+1}]
\]

The model now predicts a token conditioned on this extended sequence.

It does not simply reuse the previous next-token distribution as the new answer. The next prediction must reflect the new context, using the model's computation and any applicable cached state.

This is the essential transition that makes generation autoregressive.

## 8. Worked Example: Three Consecutive Generation Steps

We will now follow one illustrative sequence through multiple generation steps.

The prompt is:

> Water freezes at

The model and token values below are hypothetical. They demonstrate the mechanics, not the behavior of a specific model.

For clarity, assume greedy decoding, no additional score transformations, and no stopping token in the first two steps.

### 8.1 Step 1: Predict the first continuation token

**Available context**

```text
Water freezes at
```

**Illustrative candidate logits**

| Candidate token | Logit |
|---|---:|
| `" zero"` | 2.4 |
| `" 0°C"` | 1.7 |
| `" room"` | 0.3 |
| `" the"` | -0.8 |

The corresponding approximate probabilities are 60.3%, 29.9%, 7.4%, and 2.5%.

Greedy selection chooses `" zero"`.

**Updated sequence**

```text
Water freezes at zero
```

The selected token is now part of the context for the next step.

### 8.2 Step 2: Predict using the extended context

**Available context**

```text
Water freezes at zero
```

For this illustrative example, suppose the new model computation produces the following candidate scores:

| Candidate token | Illustrative logit |
|---|---:|
| `" degrees"` | 2.8 |
| `" when"` | 0.9 |
| `" because"` | 0.2 |
| `" but"` | -0.4 |

These are hypothetical values. They are not calculated from a real model or from the previous table.

Greedy selection chooses `" degrees"`.

**Updated sequence**

```text
Water freezes at zero degrees
```

Notice that the candidate scores are different from Step 1. The model is now predicting from a different context.

### 8.3 Step 3: Predict another token

**Available context**

```text
Water freezes at zero degrees
```

Suppose the next illustrative logits are:

| Candidate token | Illustrative logit |
|---|---:|
| `" Celsius"` | 2.1 |
| `" Fahrenheit"` | 1.8 |
| `" below"` | 0.5 |
| `" today"` | -0.6 |

Greedy selection chooses `" Celsius"`.

**Updated sequence**

```text
Water freezes at zero degrees Celsius
```

The resulting text is an illustrative continuation. The example does not establish that a real model would produce these exact scores or tokens.

### 8.4 What did the example demonstrate?

The loop can be summarized as follows:

| Step | Context before selection | Selected token | Context after selection |
|---|---|---|---|
| 1 | `Water freezes at` | `" zero"` | `Water freezes at zero` |
| 2 | `Water freezes at zero` | `" degrees"` | `Water freezes at zero degrees` |
| 3 | `Water freezes at zero degrees` | `" Celsius"` | `Water freezes at zero degrees Celsius` |

Four important principles emerge:

1. Each step predicts a next token rather than an entire arbitrary-length continuation.
2. Each prediction depends on the sequence available at that step.
3. The selection rule converts the model's scores into a concrete token choice.
4. The selected token becomes part of the context for subsequent predictions.

The precise numerical values and candidate choices are not the lesson. The state transition is.

## 9. The Generation Loop as an Algorithm

The same process can be expressed independently of any specific model framework.

### 9.1 Conceptual pseudocode

```python
sequence = prepare_prompt(prompt)

while not should_stop(sequence):
    logits = model_next_token_logits(sequence)

    scores = apply_generation_transforms(logits, sequence)
    next_token_id = select_token(scores)

    sequence.append(next_token_id)

output = decode_generated_tokens(sequence)
```

This is conceptual pseudocode, not a drop-in implementation.

It intentionally leaves several details abstract:

- `prepare_prompt` handles model-compatible input preparation.
- `model_next_token_logits` obtains scores for the next-token decision.
- `apply_generation_transforms` represents optional configuration-dependent score processing.
- `select_token` applies the configured selection strategy.
- `should_stop` checks the relevant stopping conditions.
- `decode_generated_tokens` converts token IDs into readable text.

Chapter 05 owns stopping conditions. Chapter 04 owns decoding strategies and score transformations. Chapter 03 owns the prefill and cache details that make repeated inference more efficient.

### 9.2 A more explicit view of the state transition

Let \(X_t\) be the sequence before generation step \(t\).

The model computes next-token logits:

\[
z_t=f_\theta(X_t)
\]

Here, \(f_\theta\) represents the model computation using learned parameters \(\theta\). The notation is simplified: \(z_t\) refers to the logits used for the next-token decision, not every intermediate tensor produced by the model.

A probability transformation may then produce:

\[
p_t=\operatorname{softmax}(z_t)
\]

If no additional transformations are applied, the distribution \(p_t\) describes the model's next-token probabilities.

A selection procedure chooses the next token:

\[
x_{t+1}=\operatorname{Select}(p_t)
\]

Finally, the sequence is extended:

\[
X_{t+1}=X_t \mathbin{\|} [x_{t+1}]
\]

The operator \(\mathbin{\|}\) denotes sequence concatenation.

In real implementations, the selection procedure may operate on transformed logits rather than directly on the unmodified softmax distribution. For example, a sampling configuration can modify the effective distribution before choosing a token.

The essential invariant remains the same: the chosen token extends the sequence used for subsequent generation.

### 9.3 Why the abstraction matters

Separating these operations helps engineers reason about failures.

If a generated token is unexpected, possible causes include:

- The input sequence was not what the application intended.
- The model produced unexpected logits.
- A score transformation changed the relative candidate scores.
- The configured selection strategy selected a different candidate.
- The application handled the selected token incorrectly.

These are different failure categories. Debugging becomes more effective when the engineer identifies which stage produced the unexpected behavior rather than treating the entire generation process as a black box.

## 10. How Token Selection Fits into the Loop

The autoregressive loop defines **when** a token is predicted and how the sequence is extended. The decoding strategy defines **how** the next token is selected from the available scores.

These are related but distinct concerns.

### 10.1 Greedy selection

Greedy decoding chooses the candidate with the highest applicable score.

For unmodified logits, this can be written as:

\[
x_{t+1}=\arg\max_i z_{t,i}
\]

Because softmax preserves the ranking of logits, taking the highest-probability candidate from an unmodified distribution gives the same selection.

Greedy decoding is straightforward to reason about, but it does not guarantee the globally best sequence, factual correctness, or the most useful response.

### 10.2 Sampling

Sampling chooses a token probabilistically rather than always selecting the highest-probability candidate.

A candidate with a lower probability can therefore be selected on one step and a different candidate on another run.

Sampling does not remove the autoregressive structure. After a token is sampled and appended, the next prediction is conditioned on the updated sequence.

### 10.3 Why the distinction matters

Consider two runs with the same prompt:

```text
Prompt
  |
  v
Next-token distribution
  |
  +---- Greedy selection ----> Highest-scoring token
  |
  +---- Sampling ------------> Token selected probabilistically
```

The first token may differ. If it does, the contexts for subsequent steps also differ, so later distributions may differ as well.

This is why a small change in a generation decision can produce a substantially different continuation.

Temperature, top-k, top-p, repetition penalties, and related controls affect selection behavior in different ways. Their mechanics and interactions are covered in Chapter 04 rather than repeated here.

## 11. What Happens After a Token Is Selected?

A selected token is not necessarily a complete word, sentence, or response.

### 11.1 Token IDs extend the sequence

At the implementation level, the generated token is represented by its token ID. The sequence of IDs is extended with that ID.

The human-readable text is obtained by decoding token IDs according to the relevant tokenizer.

For this reason, engineers should not assume that:

- One token equals one word.
- Every token can be displayed independently without context.
- Every generation step produces a visible character or word.
- The visible output always corresponds to the complete internal token sequence.

The tokenizer's behavior and compatibility requirements belong to LLM-03.

### 11.2 Generation can finish before the output limit

The loop does not necessarily continue until a maximum token count is reached.

A generation request may stop because the model emits a configured end-of-sequence token, a stop condition is met, or a generation limit is reached. The exact conditions depend on the model interface and implementation.

The stopping lifecycle is covered in Chapter 05.

The important point here is that **the loop must have a termination policy**. Without an appropriate stopping condition or bound, generation may continue longer than intended.

### 11.3 Generated tokens can be hidden from the user until later

A system may collect generated tokens internally and decode the final sequence after generation finishes. Another system may expose partial output while generation is still running.

These are different output-delivery behaviors around the generation loop. The model's next-token decisions remain incremental in either case.

Chapter 07 covers streaming semantics in detail.

## 12. The Straightforward Loop Versus Efficient Inference

The conceptual algorithm is easy to express, but a naive implementation can repeat unnecessary computation.

For example, the pseudocode:

```python
for each generation step:
    run_model_on_entire_sequence()
    select_next_token()
    append_token()
```

captures the logical process but does not prescribe the most efficient execution strategy.

At every step, the sequence contains the original prompt and all previously generated tokens. Reprocessing the entire sequence can repeat work already performed.

Efficient inference implementations can reuse previously computed attention state through key-value caching. They may also separate initial prompt processing from subsequent token-by-token decoding.

These optimizations change how the loop is executed, not the fundamental autoregressive dependency.

Chapter 03 explains prefill, decoding, and key-value caching. Detailed batching, serving throughput, hardware utilization, and production optimization belong to PROD.

## 13. Common Mistakes and Misconceptions

### Mistake 1: Treating generation as one model call that creates the complete answer

A high-level API may expose a single generation request, but the underlying autoregressive process generally involves repeated next-token decisions.

**Correction:** Distinguish the application's request from the model's internal generation steps.

### Mistake 2: Confusing logits with probabilities

Logits can be negative, positive, or have arbitrary magnitudes. They are not probabilities.

**Correction:** Identify whether a value is an unnormalized score, a normalized probability, or a selected token ID.

### Mistake 3: Assuming the highest-probability token is always selected

That is true for ordinary greedy selection under the corresponding unmodified scores, but not for every sampling-based strategy.

**Correction:** Inspect the selection strategy and applicable score transformations.

### Mistake 4: Reusing the same distribution after appending a token

The newly selected token changes the context. The next-token prediction must account for that updated context.

**Correction:** Model each step as a transition from the current sequence to an extended sequence, followed by a new next-token computation.

### Mistake 5: Assuming every token is a complete word

Tokenization depends on the tokenizer and vocabulary.

**Correction:** Treat token IDs as the fundamental sequence elements. Decode them according to the model-compatible tokenizer.

### Mistake 6: Assuming the conceptual loop is the optimized implementation

Recomputing the entire sequence at every step is a simple mental model, not necessarily the implementation used by a production inference engine.

**Correction:** Separate algorithmic behavior from execution optimizations such as key-value caching.

### Mistake 7: Confusing deterministic selection with reliable output

Greedy selection can make token selection deterministic for a fixed distribution, but it cannot guarantee factual correctness. Moreover, identical requests do not guarantee identical outputs across every model version, runtime, or provider.

**Correction:** Distinguish selection mechanics, reproducibility, and output quality. Reproducibility is explored in Chapter 08, while systematic evaluation belongs to LLM-08.

## 14. Interview Questions with Expected Answers

### Question 1: Why is autoregressive generation iterative?

**Expected answer:** The model predicts a next token conditioned on the current sequence. After the token is selected, it becomes part of the context for the next prediction. Repeating this process allows the model to generate a continuation of variable length.

### Question 2: What is the difference between logits and probabilities?

**Expected answer:** Logits are unnormalized model output scores. Probabilities can be derived from logits using softmax or another applicable transformation. Logits do not need to be between zero and one or sum to one.

### Question 3: Does greedy decoding change the autoregressive generation loop?

**Expected answer:** No. Greedy decoding changes the token-selection rule. The selected token is still appended to the sequence, and the next prediction is conditioned on the updated sequence.

### Question 4: Why must the next-token distribution be recomputed after a token is selected?

**Expected answer:** The new token changes the context. The next prediction must reflect that extended context. An implementation may reuse cached computation, but it still needs to obtain the next-token scores conditioned on the new sequence.

### Question 5: What is the difference between token IDs and decoded text?

**Expected answer:** Token IDs are integer identifiers used in the model's input and output sequence. Decoded text is the human-readable representation reconstructed using the compatible tokenizer. A token does not necessarily correspond to one complete word.

### Question 6: A model repeatedly produces the same token or phrase. Which part of the loop should you inspect?

**Expected answer:** Start by examining the current input sequence, next-token scores, score transformations, and selection strategy. Also inspect stopping and repetition-related configuration where supported. Do not assume the cause is the loop itself; broader behavioral analysis and evaluation may be needed.

### Question 7: Why might a naive implementation be inefficient?

**Expected answer:** It may recompute representations for the entire sequence at each generation step. Efficient implementations can reuse cached attention state. This improves execution efficiency without changing the fundamental next-token dependency.

### Question 8: If the model assigns a 60% probability to one token, does that mean it must select that token?

**Expected answer:** No. A probability describes the distribution, not a mandatory decision. Greedy decoding chooses the highest-scoring candidate, while sampling can select a lower-probability candidate. The actual behavior depends on the configured selection procedure.

## 15. Quick Revision

Autoregressive generation extends a sequence through repeated next-token predictions.

At each step:

1. The model processes the available context.
2. The relevant final-position output produces next-token logits.
3. The system may transform the scores into a probability distribution or apply other decoding-time processing.
4. A selection strategy chooses a token ID.
5. The selected token extends the sequence.
6. The process repeats until a stopping condition is reached.

Logits are scores, probabilities describe a distribution, token IDs represent sequence elements, and decoded text is their human-readable representation.

Greedy decoding and sampling use different selection rules but can operate through the same autoregressive loop. Efficient implementations may reuse cached computation without changing the underlying sequence-extension logic.

## 16. Key Takeaways

- **Autoregressive generation is a repeated state transition:** predict, select, append, and predict again.
- **The context changes after every selected token:** subsequent predictions depend on the extended sequence.
- **Logits, probabilities, token IDs, and decoded text are distinct objects:** confusing them leads to incorrect debugging and reasoning.
- **The selection strategy is separate from the generation loop:** greedy decoding and sampling change how the next token is chosen.
- **Conceptual correctness and execution efficiency are different concerns:** caching and other optimizations can improve inference without changing the fundamental generation process.
- **Generation mechanics do not guarantee output quality:** correctness, reliability, and evaluation require separate treatment.

## 17. Further Reading

Use these topics to deepen understanding without duplicating their primary explanations:

- **LLM-02 — Language Model Training and Learned Behavior:** How training objectives and learned parameters shape the model used during inference.
- **LLM-03 — Tokenization and Language Representation:** How text is converted into token IDs and how token IDs are decoded.
- **AIF-07 — Transformer Foundations:** The causal attention and internal computation that support next-token prediction.
- **LLM-04 — Embedding Systems in Language Models:** Input embeddings and the internal representation flow used by the model.
- **LLM-05, Chapter 03 — Prefill, Decoding, and Key-Value Caching:** How inference implementations reuse computation across generation steps.
- **LLM-05, Chapter 04 — Decoding Strategies and Token Selection:** Greedy decoding, sampling, temperature, top-k, top-p, and related controls.
- **LLM-05, Chapter 05 — Generation Configuration and Stopping Conditions:** Output limits, end-of-sequence behavior, and termination.
- **LLM-05, Chapter 07 — Streaming Generation and Output Semantics:** How partial generated output is delivered while generation is in progress.
- **LLM-08 — Language Model Evaluation and Benchmarking:** How to assess output quality systematically rather than infer it from the generation mechanism alone.

---

**Completion criterion:** You should be able to trace one generation step numerically, explain why the next step depends on the newly selected token, and distinguish the logical generation algorithm from the optimizations used to execute it efficiently.
