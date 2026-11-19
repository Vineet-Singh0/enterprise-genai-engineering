# Inspecting Generation Systems in Practice

## 1. Purpose

Understanding inference architecture and generation algorithms is necessary, but production engineering requires another capability: **inspecting a generation system to determine what it actually did, why it behaved that way, and which component should be investigated next.**

A language model request passes through several layers:

- Application-level request construction
- Prompt and conversation preparation
- Model and tokenizer interfaces
- Inference configuration
- Token generation and decoding
- Output constraints and stopping logic
- Response assembly and application-level acceptance

A defect observed at the application boundary may originate in any of these layers. An empty response, malformed JSON, unexpected repetition, premature termination, or inconsistent answer does not automatically imply a model-quality problem.

This chapter establishes a practical workflow for inspecting generation systems, reproducing unexpected behavior, isolating causes, and producing useful engineering evidence.

### Scope

This chapter focuses on **generation-system inspection and debugging**, building on the concepts established throughout LLM-05.

It does not attempt to re-teach tokenization, decoding algorithms, streaming, structured generation, or reproducibility in depth. Instead, it shows how to investigate those mechanisms together.

It also does not replace systematic model evaluation, production observability design, retrieval debugging, or agent execution tracing. Those topics require their own workflows.

## 2. The Generation Inspection Model

A useful starting point is to separate the generation pipeline into observable boundaries.

```text
Application Input
       |
       v
Request Construction
       |
       v
Prompt / Conversation Preparation
       |
       v
Model Input Interface
       |
       v
Inference Configuration
       |
       v
Token Generation
       |
       v
Decoding / Constraints / Stopping
       |
       v
Response Assembly
       |
       v
Application Acceptance
```

These boundaries are conceptual. A provider may combine several stages internally, expose only a subset of them, or implement constraints and stopping behavior inside its inference engine.

The important engineering principle is that **the observed response is the result of a pipeline, not an isolated model call**.

For example, suppose an application expects a JSON object but receives incomplete JSON.

Possible causes include:

- The application constructed an incomplete prompt.
- The model generated an incomplete sequence.
- The output token budget was insufficient.
- A stopping condition ended generation early.
- A constrained-generation mechanism rejected or interrupted output.
- The provider returned a partial result after an error.
- The application incorrectly assembled or interpreted the response.

The symptom alone does not identify the responsible component.

## 3. Inspect the Effective Request First

When investigating unexpected generation behavior, begin with the request that was actually sent, not merely the request the application intended to send.

A source-code configuration or UI setting may not represent the effective request after defaults, wrappers, templates, and provider adapters have modified it.

Inspect the following categories where the interface exposes them.

| Category | What to inspect | Why it matters |
|---|---|---|
| Model identity | Requested model and resolved model identifier, if available | Different models or versions may behave differently |
| Input | Effective messages, prompt, and relevant instructions | Detect missing, duplicated, reordered, or stale context |
| Input representation | Token IDs, token count, special tokens, or formatted prompt, when available | Detect input-interface and token-budget issues |
| Generation settings | Sampling parameters, output limits, stopping conditions, and constraints | Determine the actual generation policy |
| Request options | Provider-specific parameters and defaults | Identify behavior introduced by wrappers or adapters |
| Execution metadata | Request identifier, timestamps, status, and available usage metadata | Correlate the request with the returned result |
| Output | Returned content and structured output fields | Determine what the generation interface actually produced |
| Termination | Finish reason, completion signal, or equivalent metadata | Distinguish successful completion from interruption or truncation |

Not every interface exposes all these fields. Record what is available and explicitly mark unavailable information rather than assuming it.

### 3.1 Compare intended and effective configuration

Consider a conceptual application configuration:

```python
application_config = {
    "temperature": 0.2,
    "max_output_tokens": 800,
    "stop_sequences": [],
}
```

The application may pass these values through a wrapper that applies defaults, renames parameters, omits unsupported fields, or overrides settings.

The investigation should establish:

1. Which values the application intended to use.
2. Which values were actually transmitted.
3. Which values the provider accepted or resolved, if observable.
4. Which values are documented as defaults or provider-controlled behavior.

These are distinct questions.

A request containing a parameter does not prove that the provider honored it exactly as expected. Conversely, the absence of a parameter does not prove that no corresponding behavior exists; the provider may apply a default.

### 3.2 Inspect the complete relevant input

A model's behavior depends on the input it receives, not only on the latest user message.

Inspect the relevant conversation history, system instructions, tool outputs, template expansion, and other context included in the request.

Look for:

- Missing messages
- Duplicated instructions
- Incorrect message ordering
- Stale conversation history
- Unexpected template variables
- Conflicting instructions
- Truncated input
- Incorrectly serialized structured data

Do not assume that a prompt visible in an application log is identical to the model's internal representation. Some interfaces transform messages into model-specific formats that are not exposed to the caller.

## 4. Inspect Input Representation and Token Budgets

When input-related failures are suspected, inspect the representation available at the model interface.

For models that use tokenization, token count is not generally equivalent to word count or character count. Special tokens, message formatting, language, and technical content can affect the number of tokens required.

Where available, inspect:

- Input token count
- Tokenizer or model compatibility
- Special-token placement
- Truncation behavior
- Maximum input or context limits
- Remaining context capacity for generation

A simplified context-budget relationship is:

\[
T_{\text{input}} + T_{\text{output}} \leq T_{\text{context}}
\]

This equation is a planning model, not a universal provider contract. Actual limits may distinguish reserved output capacity, count additional internal tokens, or impose separate input and output limits.

### Example: Unexpectedly short answers

Suppose an application sends a long conversation and requests a detailed response. The model returns a short answer.

Do not immediately conclude that the model ignored the instruction.

Investigate whether:

1. The effective input contains the expected conversation.
2. The input was truncated or summarized before submission.
3. The output budget was sufficient for the requested response.
4. The result ended because of a token limit or another stopping condition.
5. The application displayed the complete returned content.

The objective is to distinguish an input problem, a generation-budget problem, and a presentation problem.

## 5. Inspect Generation Configuration

Generation configuration determines how the inference system selects and emits output tokens, subject to the model, runtime, and any active constraints.

For an unexpected response, record the effective configuration relevant to the behavior.

Common fields include:

- Temperature
- Top-k or top-p sampling, where supported
- Random seed, where supported
- Maximum output tokens
- Stop sequences
- Structured-output or grammar constraints
- Provider-specific generation options

Do not assume every provider supports every field or gives similarly named fields identical semantics.

### 5.1 Investigate configuration changes systematically

When a response changes unexpectedly, compare the current request with a known baseline.

For example:

| Variable | Baseline | Investigation |
|---|---|---|
| Model | Fixed model identifier | Verify model or version changes |
| Prompt | Fixed input | Compare effective input |
| Sampling | Fixed settings | Check accidental overrides |
| Output limit | Fixed limit | Check whether generation reached it |
| Constraints | Fixed schema or grammar | Check whether constraints changed |
| Runtime | Same deployment where possible | Investigate runtime or provider changes |

Change one variable at a time when feasible. This does not guarantee causal identification, but it makes observations easier to interpret than changing several parameters simultaneously.

For stochastic generation, repeated trials may be necessary. A single changed response is insufficient evidence that one parameter caused the difference.

## 6. Inspect the Returned Result, Not Just Its Text

Many generation interfaces return more than a string. Depending on the provider, the result may include content blocks, usage metadata, a finish reason, tool-related fields, structured output, or error information.

Inspect the response at the level exposed by the interface before reducing it to plain text.

Conceptually, a normalized result might look like this:

```python
result = {
    "content": "...",
    "status": "completed",
    "finish_reason": "stop",
    "usage": {
        "input_tokens": 120,
        "output_tokens": 85,
    },
}
```

This is illustrative, not a standardized provider response schema. Field names and semantics vary.

The inspection process should answer:

1. Did the provider return content?
2. Was the request successful at the API level?
3. What termination information was supplied?
4. Was the response complete according to the provider's contract?
5. Did the application preserve the returned content and metadata?
6. Does the result satisfy the application's own acceptance criteria?

These questions should remain separate.

An API-successful response can contain unusable content. A response that reached a token limit can still satisfy a particular application's requirements. A response with no visible text may contain another content type or indicate an application-level extraction problem.

## 7. Diagnose Termination and Completion

Termination metadata provides evidence about how generation ended, but its meaning depends on the interface contract.

Common categories include:

- Normal stopping condition reached
- Output token limit reached
- Stop sequence matched
- Provider-side interruption or error
- Client cancellation
- Stream ended without an explicit completion signal
- Unknown or unavailable termination reason

These categories are not mutually exclusive across all APIs, and different providers may represent them differently.

### 7.1 Separate three questions

A robust investigation distinguishes:

**Generation outcome:** What happened during inference?

Examples include normal termination, output-limit termination, cancellation, or failure.

**Transport outcome:** What happened while receiving the response?

Examples include successful delivery, connection interruption, timeout, or stream closure.

**Application acceptance:** Can the application safely use the result?

Examples include valid JSON, required fields present, sufficient answer content, or successful business-rule validation.

These dimensions are related but not interchangeable.

For instance, the provider may finish generation normally while the application rejects the output because a required field is missing.

Likewise, a client may lose its connection after the provider generated part of the response. The visible partial text does not establish whether generation completed remotely.

### 7.2 Inspect completion semantics explicitly

Do not classify a response as complete merely because a function returned or a stream ended.

Determine what the interface defines as successful completion. If it provides an explicit completion signal, inspect that signal. If normal stream exhaustion is defined as successful completion, use that contract instead.

When completion information is absent, preserve the uncertainty rather than inventing a termination reason.

A useful normalized record might contain:

```python
normalized_result = {
    "generation_outcome": "unknown",
    "transport_outcome": "completed",
    "acceptance_outcome": "not_checked",
    "termination_reason": None,
}
```

The values are illustrative. A real implementation should use a documented internal schema and preserve the provider's original metadata where appropriate.

## 8. Inspect Streaming Behavior

Streaming changes the inspection problem because content may arrive incrementally rather than as one final response.

A stream may expose text fragments, metadata events, completion signals, errors, or other provider-specific event types.

When investigating a streaming issue, establish:

- Which events arrived and in what order
- Whether text was emitted before an error
- Whether a completion signal was received
- Whether the stream ended normally under the documented contract
- Whether the client cancelled or closed the stream
- Whether the application displayed provisional text as final
- Whether final metadata was preserved
- Whether partial output was incorrectly stored as a completed response

### Example: The answer appears complete but later fails

An application displays a plausible answer while generation is still in progress. The connection then fails, and the application saves the visible text as a successful final response.

The displayed text may be useful, but the application's status is incorrect if it represents the stream as completed without the required completion evidence.

Investigate the event sequence and the application's state transitions, not just the text displayed in the UI.

For streaming systems, capture the event type, event order, timing, and normalized outcome when available. Avoid assuming that every provider emits the same event sequence.

## 9. Inspect Structured Output and Constraints

When a generation system is expected to produce JSON or another structured format, distinguish syntax, schema compliance, and semantic validity.

These are different properties:

- **Syntactic validity:** Can the output be parsed?
- **Schema validity:** Does it satisfy the required structural contract?
- **Semantic validity:** Do the values make sense for the application's task?
- **Application acceptance:** Does the result satisfy downstream requirements?

A response can pass one level and fail another.

For example, valid JSON may omit a required business field. A response may match a schema but contain a value that violates a domain rule.

### Practical inspection sequence

1. Preserve the original returned output.
2. Check whether the response was terminated as expected.
3. Parse the output using the appropriate parser.
4. Validate it against the intended schema.
5. Apply domain-specific checks.
6. Record the first failed validation stage.
7. Correlate the failure with configuration and termination metadata.

If the interface supports constrained generation, inspect whether the constraint was actually enabled and whether the provider reports constraint-related errors or termination details.

Do not assume that requesting JSON in a prompt is equivalent to enforcing a JSON grammar or schema at generation time.

Similarly, do not assume that constrained decoding guarantees semantic correctness or business-rule compliance.

## 10. Investigate Repeated or Unexpectedly Different Outputs

When two requests produce different results, first determine whether they were equivalent in the ways that matter.

Compare:

- Effective model identifier and version, where available
- Input messages and relevant context
- Generation parameters
- Constraint configuration
- Stop conditions
- Seed and sampling behavior, where supported
- Provider or runtime changes
- Returned termination metadata
- Application-side transformations

### 10.1 Use a controlled experiment

A practical diagnostic sequence is:

1. Capture one representative request and response.
2. Save the effective configuration and available metadata.
3. Repeat the request without changing its inputs or settings.
4. Compare outputs and termination information.
5. If the behavior differs, identify which sources of nondeterminism remain possible.
6. Change one suspected variable and repeat the test.
7. Record the result and any remaining uncertainty.

A fixed seed does not universally guarantee identical output across model versions, hardware, runtimes, or provider implementations.

Likewise, greedy decoding does not guarantee end-to-end reproducibility if the effective input, model, constraints, or execution environment changes.

The goal is not to force every system to be perfectly deterministic. It is to identify which differences are expected, which are unexplained, and which affect application correctness.

## 11. Find the First Divergence

When a generation system behaves incorrectly, investigate from the earliest observable boundary where actual behavior differs from expected behavior.

Consider this debugging path:

```text
Expected user request
        |
        v
Effective request differs?
        |
        +-- Yes --> Investigate request construction
        |
        v
Input representation differs?
        |
        +-- Yes --> Investigate formatting, tokenization, or truncation
        |
        v
Effective configuration differs?
        |
        +-- Yes --> Investigate defaults, overrides, or adapter behavior
        |
        v
Provider result or termination unexpected?
        |
        +-- Yes --> Investigate inference, constraints, stopping, or provider errors
        |
        v
Application output differs from provider result?
        |
        +-- Yes --> Investigate decoding, assembly, parsing, or presentation
        |
        v
Application acceptance fails?
        |
        +-- Yes --> Investigate schema, semantic, or business-rule validation
```

This is a diagnostic aid, not a guarantee that every failure belongs to exactly one layer. Multiple defects can coexist, and some internal stages may be opaque to the caller.

### Why first divergence matters

Suppose the provider returns valid structured content, but the application displays an empty result.

Changing the model, temperature, or prompt would be premature. The evidence points first toward response extraction, parsing, state management, or presentation.

Conversely, if the effective input is already missing a required instruction, investigating sampling parameters is unlikely to solve the root cause.

**Debug the earliest confirmed divergence before changing downstream components.**

## 12. Build a Minimal Reproducible Case

A useful generation bug report should allow another engineer to understand the failure and reproduce it when access and runtime conditions permit.

Capture the following information where available and appropriate:

| Field | Purpose |
|---|---|
| Expected behavior | Defines what the system should have done |
| Actual behavior | Records the observed result |
| Effective input | Establishes the request being investigated |
| Model identifier | Identifies the model configuration used |
| Generation settings | Records relevant inference parameters |
| Constraint and stop configuration | Captures output restrictions and termination rules |
| Termination metadata | Helps explain how generation ended |
| Error information | Preserves provider or application failures |
| Reproduction steps | Describes how to repeat the scenario |
| Frequency | Distinguishes consistent from intermittent behavior |
| Environment information | Identifies relevant runtime or deployment differences |
| First observed divergence | Narrows the likely investigation area |

An example report:

**Problem:** The application intermittently receives incomplete JSON.

**Expected:** A response containing all required fields and satisfying the declared schema.

**Observed:** The returned content ends before the object is complete.

**Evidence to collect:**
- Effective request and model identifier
- Output-token limit and constraint configuration
- Raw returned content, subject to data-handling rules
- Termination reason and completion metadata
- Whether the issue reproduces with the same effective request
- Whether application parsing or stream assembly changes the result

**Initial hypothesis:** The output may have been truncated or interrupted.

**Alternative hypotheses:** The application may have assembled partial content incorrectly, or the generation interface may have returned a different result than the application recorded.

The hypothesis should guide investigation, not be treated as a confirmed root cause.

## 13. Create an Inspection Utility

A lightweight inspection utility can normalize available generation metadata across application code paths. Its purpose is to make evidence easier to compare, not to pretend that every provider has identical semantics.

For example:

```python
def inspect_generation_result(result):
    content = result.content

    return {
        # Indicates whether a content value was supplied.
        "content_field_present": content is not None,

        # Specifically describes nonempty text, not other content types.
        "has_nonempty_text": (
            isinstance(content, str) and len(content) > 0
        ),

        "content_length": (
            len(content)
            if isinstance(content, str)
            else None
        ),

        "generation_outcome": result.generation_outcome,
        "termination_reason": result.termination_reason,
        "input_tokens": result.input_tokens,
        "output_tokens": result.output_tokens,
        "error_type": result.error_type,
    }
```

This is conceptual pseudocode. It assumes a normalized result object whose fields have already been extracted from the provider response. The example treats `content` as a possible string; a real implementation must define how missing values, non-text content blocks, multiple content blocks, streaming results, and provider-specific termination metadata are handled.

The two content fields deliberately have different meanings:

- `content_field_present` indicates that a content value exists, even if it is an empty string.
- `has_nonempty_text` indicates that the content is a nonempty string. It does not imply that the response is valid, complete, or acceptable.

### 13.1 Preserve raw evidence and normalized interpretation

A practical inspection layer should distinguish:

- **Raw evidence:** Provider response fields, event records, and error details that the interface exposes.
- **Normalized interpretation:** Application-defined categories used for consistent debugging.
- **Derived diagnosis:** A hypothesis or conclusion inferred from the evidence.

Do not overwrite the original termination reason with a normalized category and then discard the original value. Doing so can remove information needed for future debugging when provider semantics are misunderstood or change.

### 13.2 Keep diagnostic logic conservative

A utility should not infer that:

- Missing content necessarily means the model generated nothing.
- An empty string necessarily means an API failure.
- A token limit necessarily means the result is unusable.
- A successful API status means the content is valid.
- Missing termination metadata proves the response was interrupted.

These conclusions require more evidence or an explicit contract.

## 14. Handle Sensitive Data Correctly

Generation debugging often involves prompts, conversation histories, tool outputs, and model responses. These may contain confidential business information, credentials, personal data, or proprietary material.

Diagnostic usefulness does not justify unrestricted logging.

Before capturing or sharing request content:

- Apply the organization's data-handling and access-control policies.
- Redact credentials, tokens, and other secrets.
- Minimize personal and confidential data.
- Prefer metadata and targeted excerpts when full content is unnecessary.
- Restrict access to raw diagnostic records.
- Define appropriate retention and deletion behavior.
- Avoid copying sensitive production inputs into development environments without authorization.

When exact reproduction requires sensitive input, use an approved, access-controlled process rather than silently weakening privacy controls.

Redaction can itself affect reproducibility. Record whether the captured input was modified, and distinguish a sanitized reproduction from the original production request.

## 15. Common Inspection Mistakes

### 15.1 Debugging only the final text

The final string does not reveal the complete generation lifecycle. Inspect available metadata, termination information, and application transformations.

### 15.2 Treating every unexpected response as a model problem

Request construction, token budgeting, adapters, constraints, transport, and response assembly can all cause failures.

### 15.3 Assuming requested configuration equals effective configuration

Wrappers and provider defaults can alter behavior. Verify what was actually sent and what the interface confirms.

### 15.4 Treating API success as application success

A response may be delivered successfully yet fail parsing, schema validation, semantic checks, or business rules.

### 15.5 Assuming missing metadata has a known meaning

An unavailable finish reason is not proof of a particular failure. Preserve uncertainty until additional evidence is available.

### 15.6 Changing multiple variables simultaneously

This makes it difficult to identify which change influenced the observed behavior.

### 15.7 Reproducing failures without preserving the original case

A reproduction is less useful if the model, prompt, configuration, or relevant metadata has changed without documentation.

### 15.8 Logging everything by default

Excessive logging increases privacy, security, cost, and retention risks. Capture the minimum evidence needed to investigate the problem.

### 15.9 Confusing diagnosis with proof

A plausible hypothesis is not a confirmed root cause. Document what the evidence establishes, what remains uncertain, and which experiment would distinguish competing explanations.

## 16. Production Engineering Considerations

Inspection practices should fit the surrounding production system.

### 16.1 Normalize without erasing provider differences

A shared internal result model makes debugging across providers easier. However, normalization should preserve provider-specific fields that may explain behavior the common schema cannot represent.

### 16.2 Make incomplete results explicit

Applications should distinguish completed output from partial, failed, cancelled, or otherwise uncertain results. Downstream components should not accidentally treat provisional content as final.

### 16.3 Keep diagnosis separate from acceptance

The system that explains what happened should not silently decide whether the content is safe or appropriate for business use.

Generation outcome, transport outcome, and application acceptance should be independently represented when the architecture requires that distinction.

### 16.4 Test failure paths

Test more than successful responses. Include scenarios such as:

- Output-limit termination
- Provider errors
- Empty content
- Invalid structured output
- Missing completion signals
- Interrupted streams
- Client cancellation
- Missing or unfamiliar metadata

Expected behavior should follow the documented interface contract. Test doubles should model relevant failure semantics rather than returning only idealized success responses.

### 16.5 Avoid overfitting to one provider

A diagnostic utility should treat provider-specific fields as provider-specific. Use adapters and explicit mappings instead of assuming that identically named fields always mean the same thing.

These practices support production debugging without turning this chapter into a general observability or serving-architecture guide.

## 17. Engineering Exercise: Diagnose an Incomplete Response

Consider this illustrative normalized record:

```python
request = {
    "model": "model-x",
    "max_output_tokens": 200,
    "structured_output": "json",
}

result = {
    "content": '{"name": "Asha", "skills": ["Python"',
    "api_status": "success",
    "termination_reason": "max_tokens",
    "completion_signal": True,
}
```

Assume the provider contract defines `max_tokens` as the reason generation stopped after reaching the configured output limit. The completion signal confirms that the provider finished reporting the request result; it does not guarantee that generation ended naturally or that the output satisfies the application's JSON requirements.

The application requires valid JSON with both `name` and `skills`.

Answer the following before proposing a fix:

1. What does the evidence establish, and what does it not establish?
2. Is the API-level result successful? Is the generation result complete according to the provider contract? Is the application result acceptable?
3. Which component should you investigate first, and why?
4. What additional evidence would help determine whether the output budget, prompt, constraint mechanism, or response handling contributed to the failure?
5. How would you design a controlled experiment to test whether increasing the output limit addresses the problem?
6. If increasing the limit fixes the example but raises latency and cost, what alternative design changes would you investigate?

The engineering objective is to separate observed facts from hypotheses and select experiments that distinguish plausible causes.

## 18. Interview and Design Discussion

A strong engineer should be able to explain the following scenarios clearly:

- A model returns a valid API response, but the application reports a failure. How would you isolate the problem?
- Two identical-looking requests produce different outputs. What would you compare before blaming nondeterminism?
- A streaming UI displays an answer, but the backend records an incomplete response. How would you investigate the event lifecycle?
- A JSON response fails parsing. How would you distinguish token-limit termination, constraint issues, and application-side corruption?
- A provider does not expose its internal prompt representation or all inference metadata. What can you still establish, and what remains unknown?
- How would you design a normalized generation-result schema that supports multiple providers without losing diagnostic information?
- How would you create a reproducible issue report without exposing sensitive production data?

The key evaluation criterion is not whether an engineer can list debugging tools. It is whether they can reason from observable evidence, identify the earliest confirmed divergence, and design a useful next experiment.

## 19. Revision Checklist

Before considering a generation-system investigation complete, verify that you have:

- [ ] Captured the effective request and relevant configuration.
- [ ] Inspected available input representation and token-budget evidence.
- [ ] Examined the returned content and relevant response metadata.
- [ ] Interpreted termination and completion using the correct interface contract.
- [ ] Separated generation, transport, and application-acceptance outcomes.
- [ ] Validated structured output at the required levels.
- [ ] Compared repeated requests when reproducibility is relevant.
- [ ] Identified the earliest confirmed divergence.
- [ ] Recorded facts, hypotheses, and unresolved questions separately.
- [ ] Preserved enough evidence for an authorized reproduction.
- [ ] Applied appropriate privacy and security controls.
- [ ] Tested the proposed fix against relevant failure cases.

## 20. Key Takeaways

1. **Inspect the complete generation path.** The visible answer is only the final artifact of a multi-stage process.
2. **Start with observable evidence.** Verify the effective request, configuration, result, and metadata before changing the model or prompt.
3. **Interpret termination according to the interface contract.** A completed lifecycle does not necessarily mean a complete or usable answer.
4. **Separate inference, transport, and acceptance.** Each can fail independently.
5. **Find the first confirmed divergence.** Investigating the earliest incorrect boundary is usually more effective than modifying downstream components.
6. **Use controlled experiments.** Change variables deliberately and preserve enough context to compare outcomes.
7. **Preserve uncertainty and raw evidence.** Normalized categories help operations, but they should not erase provider-specific facts or turn hypotheses into conclusions.
8. **Make debugging safe and reproducible.** Useful diagnostics must respect privacy, security, and data-retention requirements.

The central skill is not merely knowing how generation works. It is being able to investigate a generation system as an engineer: observe its behavior, establish what the evidence proves, isolate the responsible boundary, and validate a correction without introducing new failures.
