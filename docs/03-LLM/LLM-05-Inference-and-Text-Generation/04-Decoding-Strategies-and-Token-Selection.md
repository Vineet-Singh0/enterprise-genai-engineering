# Decoding Strategies and Token Selection

## 1. Learning Objectives

After completing this chapter, you should be able to:

- Explain how a language model's logits become a probability distribution used for token selection.
- Distinguish greedy decoding from sampling-based decoding.
- Explain how temperature changes the probability distribution.
- Describe top-k and top-p sampling and the problems they attempt to address.
- Compare decoding strategies in terms of output variability, diversity, and predictability.
- Trace token selection using a small numerical example.
- Identify common decoding misconceptions and choose an appropriate strategy for a given application.

## 2. Prerequisites

This chapter builds on:

- The autoregressive next-token generation loop.
- The distinction between logits, probabilities, token IDs, hidden representations, and decoded text.
- The relationship between prefill, decoding, and iterative generation.

The scope here is **how the next token is selected from the model's output scores**. Prompt construction, stopping conditions, structured output constraints, and systematic model evaluation are covered elsewhere in the curriculum.

## 3. Estimated Reading Time

10–14 minutes.

## 4. The Token-Selection Problem

A language model does not directly choose a word or sentence as its next output. At each generation step, it produces logits associated with the available vocabulary.

A decoding strategy determines how those scores are converted into a selected next token.

The high-level process is:

```text
Current context
      |
      v
Language model forward pass
      |
      v
Next-token logits
      |
      v
Probability transformation
      |
      v
Decoding strategy
      |
      v
Selected token ID
      |
      v
Append token to context
      |
      v
Repeat
```

The model's learned parameters determine the logits for a given context. The decoding strategy determines how the runtime uses those scores to select a token.

This distinction matters because **the same model can produce different outputs under different decoding strategies** without changing its learned parameters.

For example, a model may assign high probability to one token and smaller probabilities to several alternatives. A greedy strategy always selects the highest-scoring token. A sampling strategy may select a lower-probability alternative.

The choice affects the generation process, not the underlying model's trained parameters.

## 5. From Logits to Token Selection

### 5.1 Logits

Logits are the raw, unnormalized scores produced for the next-token candidates.

Suppose a hypothetical model produces the following logits for four candidate tokens:

| Candidate token | Logit |
|---|---:|
| `blue` | 3.0 |
| `green` | 2.0 |
| `red` | 1.0 |
| `yellow` | 0.0 |

The logits indicate relative preference, but they are not probabilities. They can be negative, positive, or zero, and they do not need to sum to one.

### 5.2 Softmax probabilities

A common transformation is softmax:

\[
P(x_i \mid x_{<t})=
\frac{e^{z_i}}{\sum_j e^{z_j}}
\]

Where:

- \(z_i\) is the logit for candidate \(i\).
- \(x_{<t}\) is the sequence of preceding tokens, or current context.
- \(e^{z_i}\) converts the score into a positive value.
- The denominator normalizes the values into a probability distribution.

For readability, the current context is omitted from the probability notation in later examples when it is already clear from the surrounding discussion.

For the illustrative logits above, the approximate probabilities are:

| Candidate token | Logit | Approximate probability |
|---|---:|---:|
| `blue` | 3.0 | 0.644 |
| `green` | 2.0 | 0.237 |
| `red` | 1.0 | 0.087 |
| `yellow` | 0.0 | 0.032 |

The probabilities sum to approximately one, subject to rounding.

These values are hypothetical and are used only to demonstrate the calculation.

### 5.3 What happens next?

The probability distribution does not, by itself, determine whether the highest-probability token must be selected.

That depends on the decoding strategy:

- Greedy decoding selects the highest-probability candidate.
- Sampling draws a candidate according to the configured probability distribution.
- Top-k and top-p sampling restrict the candidates before sampling.

Temperature can also modify the distribution before selection.

Understanding this separation makes decoding strategies easier to compare.

## 6. Greedy Decoding

Greedy decoding selects the token with the highest score at every generation step.

Formally:

\[
x_t=\arg\max_{x\in V}P(x\mid x_{<t})
\]

Where:

- \(x_t\) is the selected token at step \(t\).
- \(V\) is the vocabulary.
- \(x_{<t}\) represents the preceding token sequence.

Because softmax preserves the ordering of logits, selecting the highest logit and selecting the highest softmax probability give the same result when the candidate set and transformations are unchanged.

### 6.1 Example

Using the earlier distribution:

| Candidate | Probability |
|---|---:|
| `blue` | 0.644 |
| `green` | 0.237 |
| `red` | 0.087 |
| `yellow` | 0.032 |

Greedy decoding selects `blue`.

It does not consider `green` merely because that candidate has a substantial probability. The highest-probability candidate wins.

### 6.2 Advantages and limitations

**Advantages**

- Predictable selection for a fixed probability distribution.
- No random draw is required to select a token.
- Useful when the highest-probability continuation is desirable.
- Straightforward to implement and reason about.

**Limitations**

Greedy decoding makes a local decision at each step. It does not guarantee the best complete sequence under every possible sequence-level objective.

An early choice can influence the context and therefore the distributions produced at later steps. A locally highest-probability token may lead to a less desirable overall continuation than an alternative early choice.

Greedy decoding can also produce repetitive or uninteresting text when the model repeatedly favors locally likely continuations.

**Engineering intuition:** Greedy decoding answers, “Which token is most likely right now?” It does not answer, “Which complete response is best?”

## 7. Sampling-Based Decoding

Sampling-based decoding selects a token by drawing from a probability distribution rather than always choosing its maximum.

Using the earlier distribution, a sampling operation could select:

- `blue` with probability approximately 0.644.
- `green` with probability approximately 0.237.
- `red` with probability approximately 0.087.
- `yellow` with probability approximately 0.032.

These are probabilities of selection for that particular step, assuming the distribution is used directly.

A lower-probability token can therefore be selected even when a higher-probability alternative exists.

### 7.1 Why use sampling?

Natural language often has several plausible continuations. Always selecting the highest-probability token can make generation less varied.

Sampling allows the runtime to explore alternative continuations according to the model's probability distribution.

It can be useful for:

- Creative writing.
- Brainstorming.
- Open-ended conversation.
- Generating multiple candidate responses.
- Applications where variation is desirable.

Sampling does not automatically make output better. It introduces variability, and the quality of the results depends on the model, the probability distribution, and the decoding configuration.

### 7.2 Sampling is not uniform randomness

Sampling does not mean every vocabulary token has an equal chance.

If the configured distribution assigns a probability of 0.644 to one candidate and 0.032 to another, the first is much more likely to be selected.

Sampling follows the distribution provided to it. Temperature and filtering strategies can change that distribution before the draw.

## 8. Temperature

Temperature controls how sharply or broadly the probability distribution is concentrated.

A common implementation applies temperature to the logits before softmax:

\[
P_T(x_i\mid x_{<t})=
\frac{e^{z_i/T}}
{\sum_j e^{z_j/T}}
\]

Where:

- \(z_i\) is the original logit.
- \(T\) is the temperature.
- \(P_T(x_i\mid x_{<t})\) is the resulting probability.

For ordinary positive temperatures:

- Lower temperature concentrates probability more strongly on high-logit candidates.
- Higher temperature makes the distribution more even.
- Temperature \(T=1\) leaves the standard softmax distribution unchanged.

### 8.1 Illustrative comparison

Consider logits \([3,2,1,0]\).

The following values are approximate and use the same four candidates:

| Candidate | \(T=0.5\) | \(T=1.0\) | \(T=2.0\) |
|---|---:|---:|---:|
| `blue` | 0.865 | 0.644 | 0.455 |
| `green` | 0.117 | 0.237 | 0.276 |
| `red` | 0.016 | 0.087 | 0.167 |
| `yellow` | 0.002 | 0.032 | 0.102 |

At a lower temperature, `blue` dominates the distribution. At a higher temperature, the alternatives receive more probability.

The temperature changes the distribution, but it does not itself select the token.

### 8.2 Temperature and greedy decoding

For positive temperature, dividing all logits by the same value preserves their ordering. Therefore, temperature alone does not change which candidate has the maximum logit.

Consequently, if the runtime always uses greedy selection after applying temperature, the selected token remains the same, assuming no other transformations or numerical effects alter the ordering.

Temperature matters most when a selection strategy uses the probability distribution, such as sampling.

### 8.3 Choosing temperature

The appropriate value depends on the task and model.

- Lower values generally favor more concentrated, predictable sampling.
- Higher values generally allow more variation.
- Excessively high values can assign substantial probability to less plausible candidates.
- Very low positive temperatures can make sampling behave similarly to greedy selection, though it is not necessarily identical.

There is no universal temperature that guarantees the best result for all models and applications.

## 9. Top-k Sampling

Top-k sampling restricts the candidate set to the \(k\) highest-scoring tokens before sampling.

The general process is:

1. Obtain the next-token logits.
2. Rank the candidate tokens by score.
3. Keep the top \(k\) candidates.
4. Exclude the remaining candidates.
5. Renormalize the retained probabilities.
6. Sample from the resulting distribution.

### 9.1 Example

Using the original distribution:

| Candidate | Original probability | Retained when \(k=2\)? |
|---|---:|---|
| `blue` | 0.644 | Yes |
| `green` | 0.237 | Yes |
| `red` | 0.087 | No |
| `yellow` | 0.032 | No |

With \(k=2\), only `blue` and `green` remain eligible.

After renormalization, their probabilities become approximately:

\[
P(\text{blue})=\frac{0.644}{0.644+0.237}\approx0.731
\]

\[
P(\text{green})=\frac{0.237}{0.644+0.237}\approx0.269
\]

The runtime samples from this restricted distribution.

The displayed values are illustrative and rounded.

### 9.2 Advantages and limitations

**Advantages**

- Removes low-ranked candidates from the sampling pool.
- Provides a simple, fixed upper bound on the number of eligible tokens.
- Can prevent sampling from the long tail of the distribution.

**Limitations**

A fixed \(k\) does not adapt to the shape of the distribution.

If one context produces a sharply concentrated distribution and another produces a broad distribution, the same value of \(k\) may behave differently in each case.

A small \(k\) can remove plausible alternatives. A large \(k\) may retain many weak candidates.

**Engineering intuition:** Top-k asks, “How many of the highest-ranked candidates should remain eligible?”

## 10. Top-p Sampling

Top-p sampling, also known as nucleus sampling, selects a candidate set based on cumulative probability rather than a fixed number of tokens.

The runtime typically:

1. Sorts candidates by probability in descending order.
2. Accumulates probabilities from the highest-ranked candidate.
3. Retains the smallest leading set whose cumulative probability reaches or exceeds \(p\), subject to the implementation's boundary rules.
4. Renormalizes the retained probabilities.
5. Samples from the resulting distribution.

Here, \(p\) is a cumulative probability threshold, commonly between zero and one.

### 10.1 Example

Consider the illustrative distribution:

| Candidate | Original probability | Cumulative probability |
|---|---:|---:|
| `blue` | 0.644 | 0.644 |
| `green` | 0.237 | 0.881 |
| `red` | 0.087 | 0.968 |
| `yellow` | 0.032 | 1.000 |

Suppose \(p=0.90\).

The first two candidates account for only 0.881 of the probability mass, which is below the threshold. Adding `red` raises the cumulative probability to 0.968.

The retained set is therefore `blue`, `green`, and `red` under the usual smallest-prefix rule.

The probabilities are then renormalized over those three candidates before sampling:

| Candidate | Original probability | Renormalized probability |
|---|---:|---:|
| `blue` | 0.644 | 0.665 |
| `green` | 0.237 | 0.245 |
| `red` | 0.087 | 0.090 |

These renormalized values are approximate, calculated from the rounded original probabilities. The retained probabilities sum to approximately one.

### 10.2 Why top-p differs from top-k

Top-k retains a fixed number of candidates. Top-p retains a variable number based on cumulative probability.

For a sharply concentrated distribution, a relatively small set may reach the threshold. For a flatter distribution, more candidates may be needed.

This allows the candidate set to adapt to the probability distribution at each generation step.

### 10.3 Limitations

- The number of retained candidates changes with the distribution.
- Results depend on the threshold and the model's probability shape.
- Implementation details can affect boundary behavior.
- A threshold that works well for one task or model may not work equally well for another.

**Engineering intuition:** Top-p asks, “How many of the most likely candidates are needed to cover this much probability mass?”

## 11. Comparing the Main Strategies

| Strategy | Selection rule | Candidate restriction | Main characteristic |
|---|---|---|---|
| Greedy | Select the maximum-scoring candidate | None by default | Predictable, locally highest-probability choice |
| Sampling | Draw according to probabilities | None by default | Introduces variation |
| Temperature + sampling | Modify probabilities, then draw | None by temperature alone | Controls distribution concentration |
| Top-k sampling | Draw from the top \(k\) candidates | Fixed candidate count | Simple, fixed-size restriction |
| Top-p sampling | Draw from a cumulative-probability set | Variable candidate count | Adapts the candidate set to distribution shape |

These methods are not all mutually exclusive. Temperature can be combined with top-k or top-p sampling. The exact order of transformations and filtering depends on the implementation and configuration.

A decoding strategy should be chosen based on the desired behavior, not because one method is universally superior.

## 12. How Decoding Transformations Interact

Decoding configurations can combine multiple transformations.

For example:

```text
Model logits
     |
     v
Temperature scaling
     |
     v
Candidate filtering
     |
     v
Probability renormalization
     |
     v
Sampling
     |
     v
Selected token
```

This is a common conceptual pipeline, not a universal implementation order. Some runtimes apply transformations in a different order or expose different configuration controls.

The order matters because the operations are not generally interchangeable.

For example, changing the temperature before filtering can change the probability distribution used by a top-p filter and therefore change which candidates are retained.

By contrast, positive temperature scaling alone preserves the ranking of logits, so it does not change a top-k set based strictly on that ranking, assuming no ties or numerical effects alter the order.

When debugging a generation system, engineers should inspect the actual decoding pipeline rather than assuming that configuration parameters are applied in a particular sequence.

## 13. Common Misconceptions and Failure Modes

### Misconception 1: Temperature makes the model more intelligent

**Correction:** Temperature changes the distribution used for selection. It does not retrain the model or add knowledge to its parameters.

### Misconception 2: Higher temperature always improves creativity

**Correction:** Higher temperature generally increases probability spread during sampling. It can also increase incoherence or reduce relevance. The effect depends on the model, task, and other decoding settings.

### Misconception 3: Greedy decoding finds the best complete answer

**Correction:** Greedy decoding makes a locally highest-probability choice at each step. It does not guarantee the globally best sequence under every objective.

### Misconception 4: Top-k and top-p are the same method

**Correction:** Top-k uses a fixed candidate count. Top-p uses a cumulative probability threshold and can retain different numbers of candidates at different steps.

### Misconception 5: Sampling gives every token an equal chance

**Correction:** Sampling follows the configured probability distribution. Candidates with larger probabilities are selected more frequently.

### Misconception 6: Temperature changes greedy selection

**Correction:** Positive temperature scaling preserves logit ranking. With greedy selection and no other ranking-changing transformations, the same token remains the maximum.

### Misconception 7: Decoding settings guarantee response quality

**Correction:** Decoding settings influence token selection. They cannot guarantee factual accuracy, instruction compliance, or overall response quality.

### Misconception 8: One decoding configuration works for every application

**Correction:** Different applications have different requirements for predictability, variation, and candidate diversity. Configuration decisions should be based on the intended behavior and evaluated for the target task.

## 14. Practical Reasoning Scenarios

### Scenario A: Predictable short responses

A system produces short, constrained conversational responses and prioritizes predictable token selection.

Greedy decoding may be a reasonable starting point because it selects the highest-probability candidate at each step.

However, it should not be assumed to guarantee correctness or compliance with output requirements.

### Scenario B: Creative brainstorming

An application needs several varied ideas instead of repeatedly selecting the same highest-probability continuation.

Sampling is a natural starting point. Temperature and candidate filtering can then be considered to control how concentrated or broad the selection distribution should be.

### Scenario C: Removing the long tail

An application uses sampling but wants to exclude low-ranked candidates.

Top-k offers a fixed candidate limit. Top-p offers a candidate set whose size adapts to cumulative probability.

The choice depends on the desired behavior and should be validated empirically for the target model and task.

### Scenario D: A temperature change has no visible effect

An engineer changes the temperature but observes the same generated token.

Before assuming a defect, inspect the decoding strategy. If greedy selection is used, positive temperature scaling preserves candidate ranking and therefore does not ordinarily change the selected token.

This is a configuration–behavior issue, not necessarily a model failure.

## 15. Interview Questions with Expected Answers

### Q1. What is the difference between logits and probabilities?

Logits are unnormalized model scores. Probabilities are normalized values derived from those scores, commonly using softmax, that represent the distribution used for token selection.

### Q2. How does greedy decoding work?

It selects the candidate with the highest score at each generation step. It is locally optimal under that selection rule but does not guarantee the globally best complete sequence.

### Q3. What does temperature control?

Temperature scales logits before probability normalization. Lower positive temperatures concentrate probability on high-scoring candidates, while higher temperatures make the distribution more even.

### Q4. Why does temperature not normally change greedy selection?

Positive scaling preserves the ranking of logits. Greedy decoding still selects the maximum, assuming no other transformation or numerical effect changes the ordering.

### Q5. Explain top-k sampling.

It retains the \(k\) highest-scoring candidates, excludes the rest, renormalizes the retained probabilities, and samples from the resulting distribution.

### Q6. Explain top-p sampling.

It retains a leading set of candidates whose cumulative probability reaches the configured threshold, then renormalizes and samples from that set. The number of retained candidates can vary.

### Q7. Can temperature, top-k, and top-p be combined?

Yes. They can be combined in a decoding pipeline, but the order of transformations can affect the resulting candidate set and distribution.

### Q8. Why can greedy decoding produce repetitive text?

Greedy decoding repeatedly selects the locally highest-probability continuation. If those choices lead into repetitive patterns, the strategy does not independently explore alternatives merely because they might produce a better complete response.

### Q9. Does a higher temperature guarantee more useful diversity?

No. It generally broadens the distribution during sampling, but greater variation does not necessarily mean greater relevance, coherence, or usefulness.

### Q10. How would you choose a decoding strategy for a new application?

Start by defining the required output behavior, such as predictability or variation. Choose a reasonable baseline, understand the effects of its configuration, and evaluate the behavior on representative tasks before adopting it.

## 16. Quick Revision

- **Logits:** Unnormalized next-token scores.
- **Softmax:** Converts logits into a normalized probability distribution.
- **Greedy decoding:** Selects the highest-scoring candidate.
- **Sampling:** Draws a candidate according to the configured distribution.
- **Temperature:** Controls how concentrated the probability distribution is.
- **Top-k:** Retains a fixed number of highest-ranked candidates.
- **Top-p:** Retains a variable-sized candidate set based on cumulative probability.
- **Renormalization:** Rescales retained probabilities to sum to one.
- **Transformation order:** Can affect the final distribution and candidate set.
- **Core distinction:** The model produces scores; the decoding strategy determines how those scores are used to select the next token.

## 17. Key Takeaways

1. Token selection is a distinct stage of autoregressive generation.
2. Logits, probabilities, and selected token IDs are different representations and should not be conflated.
3. Greedy decoding prioritizes the highest-probability candidate at each step, while sampling introduces variation according to a distribution.
4. Temperature changes the distribution's concentration but does not ordinarily change the greedy maximum.
5. Top-k and top-p restrict the candidate set using different rules.
6. Decoding transformations can interact, so the actual pipeline matters.
7. No decoding strategy universally guarantees the best response; the choice depends on the application's requirements.

## 18. Further Reading

Consult the documentation for the model and inference runtime used in your application to understand its supported decoding parameters, transformation order, default values, and boundary behavior.

When comparing decoding strategies, distinguish the conceptual algorithm from the specific runtime implementation. Configuration names and defaults may differ across frameworks.

Further study of generation stopping conditions, constrained output, reproducibility, and systematic evaluation belongs in the subsequent chapters of this curriculum.
