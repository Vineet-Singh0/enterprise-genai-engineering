# Generation Configuration and Stopping Conditions

## 1. Learning Objectives

After completing this chapter, you should be able to:

- Explain the purpose of generation configuration and distinguish it from model parameters.
- Identify common generation parameters and understand their effects on inference behavior.
- Distinguish token-selection settings from output-length limits and stopping conditions.
- Explain how maximum token limits, end-of-sequence tokens, and stop sequences affect generation.
- Understand how multiple stopping conditions interact.
- Identify common configuration mistakes and their operational consequences.
- Design a generation configuration that matches an application's requirements.

## 2. Prerequisites

This chapter builds on:

- The autoregressive next-token generation loop.
- The distinction between logits, probabilities, selected token IDs, and decoded text.
- Greedy decoding, sampling, temperature, top-k, and top-p.
- The distinction between prefill and iterative decoding.

This chapter focuses on **configuring a generation request and determining when generation ends**. It does not re-teach token-selection algorithms or cover constrained structured output in depth.

## 3. Estimated Reading Time

9–12 minutes.

## 4. What Is Generation Configuration?

A language model produces a distribution over possible next tokens. The inference runtime uses a decoding strategy to select tokens and continues generating until an applicable stopping condition is reached.

Generation configuration specifies how this process should behave for a particular request.

Depending on the model and runtime, configuration may include:

- Decoding strategy.
- Temperature.
- Top-k and top-p.
- Maximum number of generated tokens.
- Minimum generation length, where supported.
- End-of-sequence token handling.
- Stop sequences.
- Random seed or other reproducibility controls, where supported.
- Penalties or other transformations that affect candidate scores.

Not every runtime supports every parameter, and parameter names and defaults can differ between APIs.

### 4.1 Model parameters versus generation parameters

These two categories serve different purposes.

| Model parameters | Generation parameters |
|---|---|
| Learned during training or subsequent model adaptation | Supplied or selected for inference |
| Encode learned model behavior | Control aspects of how an inference request generates output |
| Usually remain fixed during ordinary inference | Can vary between requests without changing the trained model |
| Examples include learned weight tensors | Examples include temperature, top-p, and maximum output tokens |

Changing temperature does not retrain the model. Changing a maximum-token limit does not change the learned weights.

However, generation parameters can change the output substantially because they influence token selection or determine when the process stops.

## 5. Generation Configuration Has Multiple Responsibilities

It is useful to separate generation settings into three conceptual categories.

```text
Generation configuration
          |
          +-------------------------+
          |                         |
          v                         v
Token-selection behavior      Termination behavior
          |                         |
          v                         v
Which token is selected?      When does generation stop?
          |
          v
Optional score transformations
```

A third practical concern is **request reproducibility**: whether the same configuration and input produce the same output across repeated runs.

These categories interact, but they answer different questions.

### 5.1 Token-selection behavior

Settings such as temperature, top-k, and top-p influence the candidate distribution or selection process.

These were covered in Chapter 04. Here, they are treated as configuration parameters rather than re-explained as algorithms.

### 5.2 Termination behavior

Stopping conditions determine when the generation loop ends.

Examples include:

- The model emits a recognized end-of-sequence token.
- The generation reaches its configured maximum number of new tokens.
- A configured stop sequence is detected by the runtime.
- The request is terminated by an external cancellation or execution limit.

The supported conditions depend on the runtime.

### 5.3 Reproducibility behavior

A fixed random seed can help make sampling repeatable in some environments. It does not universally guarantee identical output across different hardware, kernels, runtime versions, or serving configurations.

Reproducibility is discussed in more detail in Chapter 08.

## 6. Common Generation Parameters

### 6.1 Maximum new tokens

A maximum-new-token setting limits how many tokens the model may generate beyond the input prompt.

Suppose a request contains 200 input tokens and has a maximum-new-token limit of 100.

The request can generate at most 100 new tokens under that limit. The input tokens are not counted as generated tokens.

If generation ends earlier because another stopping condition is met, the model may produce fewer than 100 tokens.

The distinction between input length and generated length matters when estimating response size, latency, and token usage.

### 6.2 Maximum sequence length

A maximum sequence length is different from a maximum-new-token limit.

Depending on the runtime, sequence length may refer to the total number of tokens in the model's context or another implementation-defined limit.

For example, a model may have a context limit that constrains the combined prompt and generated continuation. A request with a long prompt therefore may not be able to use the full configured generation budget.

Do not assume that every API exposes a parameter named `max_length` with identical semantics. Check whether a parameter limits the new continuation, the complete sequence, or something else.

### 6.3 Minimum generation length

Some runtimes support a minimum-new-token setting. It can prevent ordinary termination before the configured minimum is reached.

The exact behavior is implementation-dependent. For example, a runtime may suppress certain end-of-sequence tokens until the minimum is satisfied.

A minimum-length setting does not guarantee that the generated content will be meaningful or complete. It constrains length behavior, not semantic quality.

Use it only when the application has a genuine minimum-length requirement. An unnecessary minimum can force the model to continue after it has already produced an adequate response.

### 6.4 Temperature, top-k, and top-p

These settings control token-selection behavior rather than the overall generation budget.

| Parameter | Primary purpose |
|---|---|
| Temperature | Changes the concentration of the probability distribution |
| Top-k | Restricts sampling to a fixed number of highest-ranked candidates |
| Top-p | Restricts sampling to a candidate set based on cumulative probability |

These parameters are not interchangeable with stopping conditions. They affect which tokens may be selected, while stopping conditions determine when the process terminates.

### 6.5 Repetition and presence penalties

Some runtimes support penalties that modify candidate scores based on tokens already present in the context or generated sequence.

Different APIs define these parameters differently. A repetition penalty, frequency penalty, and presence penalty should not be assumed to use the same formula.

Such penalties can influence repeated-token behavior, but they do not guarantee the absence of repetition. Excessive penalties may also suppress appropriate terminology or make the output less coherent.

Because exact semantics vary, consult the specific runtime's documentation before transferring settings between frameworks.

## 7. Stopping Conditions

A generation loop needs a termination rule. Without one, the runtime could continue generating tokens until some external limit or failure interrupts execution.

Several stopping conditions are common.

### 7.1 End-of-sequence token

An end-of-sequence (EOS) token is a token that the model or runtime recognizes as a signal that generation should end.

At a high level:

```text
Select next token
      |
      v
Is it a recognized EOS token?
      |
   +--+--+
   |     |
  Yes    No
   |     |
   v     v
 Stop   Continue
```

EOS behavior depends on the model and runtime. Some interfaces may recognize one or more EOS token IDs, and some may configure additional termination behavior.

The token ID and its decoded representation are not the same thing. A special token may be represented in decoded text in a way that depends on the tokenizer and decoding options.

A runtime may also omit a recognized EOS token from the user-visible response.

### 7.2 Maximum-new-token limit

The maximum-new-token limit is a hard generation budget for the request.

If the limit is reached before another stopping condition occurs, generation ends because the budget has been exhausted.

This does not necessarily mean the model completed its answer. It may have stopped in the middle of a sentence, list, code block, or structured response.

The application should distinguish a response that ended naturally from one that was truncated by a token limit when that distinction affects correctness.

### 7.3 Stop sequences

A stop sequence is a configured sequence of text or tokens that signals termination when detected according to the runtime's rules.

For example, a text-generation interface might configure a delimiter as a stop sequence so that generation ends before the next section begins.

Stop-sequence semantics vary. Implementations may detect sequences in generated token text, decoded text, or another representation. Some runtimes remove the matched stop sequence from the returned text, while others may expose different behavior.

This matters because text and token boundaries do not always align one-to-one. A multi-character text delimiter can span multiple generated tokens.

When detection operates on decoded text, the runtime may need to retain a short buffer of recent output. The buffer allows it to detect a stop sequence that begins in one token's decoded text and finishes in a later token's text. Without appropriate buffering, a delimiter spanning token boundaries could be missed or partially exposed.

Do not assume that a stop sequence is a special token in the model vocabulary. It may be an ordinary text sequence interpreted by the inference runtime.

### 7.4 External cancellation and execution limits

Generation can also stop because the caller cancels the request, a service deadline expires, or an external execution limit is reached.

These are operational termination conditions rather than model-selected completion signals.

They should be distinguished from ordinary EOS termination and maximum-new-token exhaustion, particularly when diagnosing incomplete responses.

## 8. How Stopping Conditions Interact

A request can have several stopping conditions configured at once.

For example, suppose a request has:

- A maximum of 150 new tokens.
- EOS-based termination.
- A stop sequence configured by the application.

Generation may stop when any applicable condition is satisfied first.

```text
Begin generation
      |
      v
Select and process output
      |
      v
Evaluate applicable stopping rules
      |
      +--> EOS detected ----------> Stop
      |
      +--> Stop sequence found ---> Stop
      |
      +--> Token budget reached --> Stop
      |
      +--> External cancellation -> Stop
      |
      +--> Otherwise -------------> Continue
```

This diagram is conceptual. The exact order of checking conditions, text buffering, and handling a matched stop sequence depends on the runtime.

### 8.1 Termination reason versus completion status

These concepts are related but not identical.

- **Termination reason** explains why generation stopped, such as EOS, a matched stop sequence, maximum-token exhaustion, or cancellation.
- **Completion status** indicates whether the application considers the returned result complete and usable for its intended purpose.

A request can terminate normally because it reached its configured token limit while still returning an incomplete answer. Conversely, EOS may indicate that the model ended its sequence, but the application may still need to validate whether the result satisfies its requirements.

The application should not infer completion status solely from the fact that generation has stopped.

### 8.2 First applicable condition wins

In a typical setup, generation ends when the first applicable stopping condition is reached.

Suppose the model emits EOS after 42 generated tokens while the configured maximum is 150. EOS ends the request first.

If no other condition is met and the model reaches 150 generated tokens, the token limit ends the request.

If a configured stop sequence is detected earlier, the runtime may stop generation at that point, subject to its stop-matching semantics.

### 8.3 Stop conditions are not interchangeable

Each condition communicates a different reason for ending:

| Condition | What it indicates |
|---|---|
| EOS | The model or runtime recognized an end-of-sequence signal |
| Stop sequence | A configured delimiter or text pattern was detected |
| Maximum-new-token limit | The generation budget was exhausted |
| External cancellation | The caller or execution environment interrupted the request |

These reasons can have different implications for completion status. For example, an application might accept an EOS-terminated response but treat maximum-token exhaustion as potentially truncated.

## 9. Generation Configuration in Practice

Consider a service that generates a short explanation for a user.

The application needs:

- A bounded output length.
- Predictable response behavior.
- A way to terminate generation if the model emits its recognized EOS token.
- A clear indication if the response reaches the token limit.

A conceptual configuration might be:

```python
generation_config = {
    "max_new_tokens": 200,
    "temperature": 0.2,
    "do_sample": True,
}
```

This is an illustrative example, not a universal API contract. The accepted field names and their exact meanings depend on the library or inference provider.

The example demonstrates only basic generation settings. It does not configure stop sequences, define EOS-handling behavior, or implement termination-reason reporting. Those behaviors require runtime-specific configuration or response handling.

The example also illustrates an important point: a low positive temperature with sampling is still sampling, not greedy decoding. The temperature concentrates the distribution, but lower-probability candidates may remain selectable.

### 9.1 Configuration should express application requirements

Before choosing values, identify what the application actually needs:

- Does it prioritize predictable token selection or variation?
- Is there a meaningful maximum output budget?
- Can a response be considered complete if the token limit is reached?
- Does the application use a stop delimiter?
- Must the caller distinguish natural completion from interruption?
- Which configuration options does the selected runtime actually support?

These questions lead to better configuration decisions than copying a collection of parameters from another application.

## 10. Common Misconceptions and Failure Modes

### Misconception 1: Maximum-new-token limits guarantee complete answers

**Correction:** They limit the generation budget. The model can reach the limit before completing its intended response.

### Misconception 2: Maximum sequence length and maximum-new-token limits mean the same thing

**Correction:** One may constrain the total sequence or context, while the other limits newly generated tokens. Exact API semantics must be checked.

### Misconception 3: EOS always appears in returned text

**Correction:** A runtime may consume or omit recognized special tokens from the user-visible output.

### Misconception 4: A stop sequence must be a special vocabulary token

**Correction:** It can be an ordinary text delimiter detected by the runtime. Its matching behavior depends on the implementation.

### Misconception 5: Every generation stop means successful completion

**Correction:** Termination describes why generation stopped; completion status describes whether the application considers the result complete and usable. Token-budget exhaustion and cancellation can leave an incomplete result.

### Misconception 6: Temperature controls output length

**Correction:** Temperature primarily changes the probability distribution used for token selection. Output length is governed by stopping conditions and other runtime behavior.

### Misconception 7: A minimum-token setting guarantees meaningful content

**Correction:** It constrains generation length behavior, not correctness, relevance, or semantic completeness.

### Misconception 8: Configuration names have universal meanings

**Correction:** Similar parameter names can have different defaults or semantics across frameworks and providers. Verify the API contract before reusing a configuration.

## 11. Practical Reasoning Scenarios

### Scenario A: A response ends mid-sentence

A service returns a response that ends abruptly.

Before concluding that the model failed to follow instructions, inspect the termination reason. If the maximum-new-token limit was reached, the response may have been truncated by configuration.

The engineering response is to determine whether the budget is appropriate and whether the application can detect or handle incomplete output.

### Scenario B: A response stops at a delimiter

An application configures a stop sequence and observes that the returned output ends immediately before a delimiter.

This may be expected behavior. Inspect the runtime's stop-matching and returned-text semantics before treating it as a defect. If the delimiter spans multiple generated tokens, verify that the runtime detects cross-token matches correctly.

### Scenario C: Responses end at different lengths

Two requests use the same maximum-new-token setting but produce different output lengths.

This is not necessarily an error. One response may end through EOS or a stop sequence before reaching the limit, while another may consume more of the available token budget.

### Scenario D: A configuration works in one framework but not another

An engineer transfers a generation configuration between inference libraries and notices different behavior.

Check the supported parameters, default values, stopping semantics, and transformation order. Matching parameter names does not prove matching behavior.

## 12. Interview Questions with Expected Answers

### Q1. What is the difference between model parameters and generation parameters?

Model parameters are learned during training or adaptation. Generation parameters control aspects of how the model is used during inference without ordinarily changing its learned weights.

### Q2. What is the difference between maximum-new-token and maximum-sequence-length limits?

A maximum-new-token limit constrains the generated continuation. A maximum-sequence-length limit may constrain the complete token sequence or another runtime-defined sequence boundary.

### Q3. What is an EOS token?

It is a token recognized by the model or runtime as an end-of-sequence signal. The runtime determines how this signal affects generation and whether the token appears in returned text.

### Q4. How does a stop sequence differ from an EOS token?

An EOS token is a token-level signal recognized by the runtime. A stop sequence is a configured text or token pattern that triggers termination according to implementation-specific matching rules.

### Q5. What happens when the maximum-new-token limit is reached?

Generation ends if the limit is the applicable stopping condition. The output may be incomplete, so the application should distinguish budget exhaustion from natural completion where necessary.

### Q6. Can several stopping conditions be configured simultaneously?

Yes. Generation typically stops when the first applicable condition is satisfied, although exact checking and matching behavior depend on the runtime.

### Q7. Why can the same generation configuration behave differently across libraries?

Libraries may differ in parameter names, defaults, supported options, stopping behavior, and the order in which transformations are applied.

### Q8. How should an application handle token-limit termination?

It should identify the termination reason where the runtime exposes it, assess whether the output is incomplete, and decide whether to return it, request continuation, or use another application-specific recovery path.

## 13. Quick Revision

- **Generation configuration:** Controls aspects of token selection and request execution.
- **Model parameters:** Learned values that ordinarily remain fixed during inference.
- **Maximum new tokens:** Limits the generated continuation.
- **Maximum sequence length:** May constrain the total sequence or another runtime-defined boundary.
- **EOS:** A recognized end-of-sequence signal.
- **Stop sequence:** A configured pattern that triggers termination according to runtime rules.
- **External cancellation:** An interruption initiated outside the model's normal completion behavior.
- **Termination reason:** Explains why generation stopped.
- **Completion status:** Indicates whether the application considers the result complete and usable.
- **Configuration portability:** Requires checking API semantics rather than assuming identical behavior across runtimes.

## 14. Key Takeaways

1. Generation configuration controls how an inference request selects tokens and when it terminates.
2. Token-selection parameters and stopping conditions solve different problems.
3. Maximum-new-token limits bound generation but do not guarantee a complete answer.
4. EOS, stop sequences, token budgets, and external cancellation represent different termination causes.
5. Stop-sequence detection may require buffering when a delimiter spans multiple generated tokens.
6. Applications should distinguish natural completion from truncation or interruption when correctness depends on it.
7. Parameter names, defaults, and semantics must be verified against the actual inference runtime.

## 15. Further Reading

Consult the documentation for your selected model and inference runtime to verify:

- Supported generation parameters and their defaults.
- The semantics of maximum-new-token and sequence-length limits.
- EOS-token handling.
- Stop-sequence matching and returned-text behavior.
- How termination reasons are exposed to callers.
- The supported mechanisms for cancellation and execution deadlines.

Detailed output constraints and structured-generation mechanisms are covered in the next chapter. Reproducibility and the interpretation of generation failures are addressed later in the curriculum.
