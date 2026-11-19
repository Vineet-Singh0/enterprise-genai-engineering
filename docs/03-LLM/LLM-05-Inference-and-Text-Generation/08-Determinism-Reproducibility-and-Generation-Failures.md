# Determinism, Reproducibility, and Generation Failures

## 1. Purpose and Scope

Language model generation is often treated as a simple operation: provide an input, generate a response, and use the result. In practice, the same request can produce different outputs, reproducibility can be difficult to establish, and generation can terminate without producing a usable result.

Understanding these behaviors is essential when debugging model integrations, designing reliable applications, comparing generation configurations, and investigating production incidents.

This chapter explains:

- The difference between deterministic generation and reproducible generation.
- Why identical requests may produce different outputs.
- How decoding configuration and runtime conditions affect reproducibility.
- The distinction between generation failures and application-level failures.
- Common termination outcomes and incomplete-generation scenarios.
- How to diagnose failures systematically.
- How to design reproducible experiments and reliable recovery mechanisms.

The focus is inference behavior and generation outcomes. Training reproducibility, model evaluation methodology, systematic capability assessment, and production-serving infrastructure are covered elsewhere in the curriculum.

## 2. Determinism and Reproducibility Are Different

These terms are related, but they describe different properties.

### 2.1 Determinism

A system is deterministic when the same defined inputs and execution conditions produce the same output.

For language model inference, this definition requires careful qualification. The relevant inputs may include the prompt, model version, decoding configuration, random-number state, runtime implementation, and other execution conditions.

A deterministic generation path produces the same output when the conditions that determine its behavior remain fixed.

### 2.2 Reproducibility

Reproducibility is the ability to repeat an experiment or generation request and obtain the same result, or a result satisfying a clearly defined equivalence criterion.

Exact reproducibility means matching the output precisely. Other forms of reproducibility may allow differences that do not affect the property being investigated.

For example, an engineer might need to reproduce:

- The exact generated text.
- The same termination reason.
- The same structured output.
- The same failure under a controlled configuration.

These are different reproducibility targets and should not be treated as interchangeable.

### 2.3 The relationship

Determinism describes how a system behaves under defined conditions. Reproducibility describes whether a result can be recreated in practice.

A deterministic implementation can be difficult to reproduce if important execution conditions are not recorded. Conversely, two runs may happen to produce the same output even when the generation process is stochastic.

**Engineering principle:** a reproducibility claim is meaningful only when the inputs, execution conditions, and required notion of equivalence are specified.

## 3. Why Identical Requests Can Produce Different Outputs

A repeated request may appear identical while differing in one or more conditions that affect generation.

### 3.1 Stochastic token selection

Some decoding strategies sample from a probability distribution over eligible next tokens. Sampling introduces randomness into the generation process.

Even when the prompt and model are unchanged, different random draws can produce different token sequences. Because each selected token becomes part of the context for subsequent generation, an early difference can change the rest of the response.

For example, consider an illustrative next-token distribution:

| Candidate token | Probability |
|---|---:|
| `blue` | 0.50 |
| `green` | 0.30 |
| `red` | 0.20 |

A sampling-based decoder may choose different candidates on different runs. These values are hypothetical and are used only to demonstrate the principle.

Once a different token is selected, later probability distributions may also differ because the generated context has changed.

### 3.2 Different decoding configurations

Generation settings influence which candidate tokens can be selected and how selection occurs.

Relevant settings may include:

- Greedy selection versus sampling.
- Temperature.
- Top-k and top-p filtering.
- Repetition-related penalties.
- Stop sequences.
- Maximum generation length.
- Structured-output constraints.

A change in any relevant setting can change the output or its termination behavior.

Two requests with identical prompts but different decoding configurations are not equivalent experiments.

### 3.3 Model and tokenizer changes

The same prompt can behave differently when the underlying model version changes. Model weights, tokenizer versions, special-token conventions, or provider-side model updates can affect generation.

A human-readable model name may not always uniquely identify an immutable model artifact. Where exact reproducibility matters, record the strongest model and tokenizer identifiers the system exposes.

### 3.4 Runtime and numerical differences

Inference may involve different hardware, numerical precision, kernels, parallel execution patterns, or software versions.

Floating-point operations are not always associative:

\[
(a+b)+c \neq a+(b+c)
\]

in finite-precision arithmetic for some values.

Consequently, changes in numerical execution can sometimes produce small differences in computed scores. If candidate scores are close, even a small difference may change which token is selected.

The practical impact depends on the model, implementation, hardware, and decoding method. A change in numerical execution does not guarantee that output will differ, but it can be relevant when investigating exact reproducibility.

### 3.5 Hidden or unrecorded inputs

A request may depend on more than the visible user prompt. Other relevant inputs can include:

- System or developer instructions.
- Conversation history.
- Retrieved context.
- Tool results.
- Structured-output configuration.
- Provider defaults.
- Runtime-selected model versions.

If any of these inputs changes, the repeated request may not actually be the same experiment.

## 4. Greedy Decoding Does Not Guarantee Universal Reproducibility

Greedy decoding selects the highest-scoring eligible next token at each generation step.

Conceptually:

\[
t_i = \arg\max_{t \in V_i} s(t)
\]

where:

- \(t_i\) is the selected token at step \(i\).
- \(V_i\) is the set of eligible candidate tokens.
- \(s(t)\) is the score used for selection.

If the same candidate scores, eligible-token set, and tie-breaking behavior are reproduced at every step, greedy selection chooses the same tokens.

However, this conditional statement does not imply that every greedy-generation request is reproducible across all environments.

Differences can arise from model versions, numerical execution, hidden inputs, constraint handling, or implementation-specific behavior.

Greedy decoding removes sampling as a source of randomness from the token-selection rule. It does not eliminate every possible source of variation.

### 4.1 Ties and implementation details

If multiple candidates share the highest score, the selected token can depend on the implementation's tie-breaking rule.

A reproducibility investigation should therefore consider not only the selection strategy but also whether the candidate scores and selection behavior are stable.

### 4.2 Greedy decoding versus deterministic execution

These concepts should remain separate:

- **Greedy decoding** specifies how the next token is selected.
- **Deterministic execution** describes whether the relevant computation and selection process produce the same result under defined conditions.

A deterministic selection rule cannot guarantee identical output if its inputs or computed scores differ.

## 5. Random Seeds and Their Limits

A random seed initializes a pseudorandom-number generator so that its sequence can be reproduced under compatible conditions.

For sampling-based generation, a fixed seed may make repeated outputs reproducible within a particular implementation and execution environment.

However, a seed is not a universal guarantee.

Reproducibility may still depend on:

- The same model and relevant configuration.
- The same random-number-generation implementation.
- The same ordering of random-number consumption.
- The same runtime and numerical behavior.
- The same handling of concurrent or parallel operations.
- Provider-specific implementation details.

Some APIs expose a seed parameter; others do not. Even when a seed is supported, the provider may qualify its guarantees or limit reproducibility to particular versions or environments.

### 5.1 What a seed does not do

A seed does not:

- Make a stochastic decoding strategy inherently deterministic across every environment.
- Fix a changed model version.
- Restore missing prompt or conversation context.
- Guarantee identical outputs across different implementations.
- Correct a generation configuration that is inappropriate for the task.

### 5.2 When seeds are useful

Seeds are valuable when running controlled experiments, comparing decoding settings, reproducing a debugging case, or investigating whether an output difference is caused by sampling.

The correct engineering practice is to record the seed together with the rest of the generation configuration and to verify the reproducibility guarantee offered by the implementation.

## 6. Sources of Variation: A Diagnostic Model

When two runs differ, avoid immediately concluding that the model is unpredictable. Treat the difference as an investigation.

A useful conceptual model is:

```text
Observed output difference
          |
          v
Did the effective request change?
          |
     +----+----+
     |         |
    Yes        No
     |         |
Compare      Did the model or
inputs and   runtime change?
configuration     |
             +---+---+
             |       |
            Yes      No
             |       |
        Compare      Investigate
        versions     decoding,
        and runtime  randomness,
                     and numerical
                     behavior
```

This is a diagnostic aid, not an exhaustive decision tree. Multiple causes may coexist.

### 6.1 Compare the effective request

Check the actual inputs received by the generation system, not only the visible user message.

Verify:

- The complete prompt and relevant conversation history.
- The effective model identifier.
- The decoding configuration.
- The configured stopping conditions.
- Any active structured-output constraints.
- The presence of additional context or metadata that affects generation.

### 6.2 Compare execution conditions

Where available, record the model version, tokenizer version, library versions, hardware or execution mode, numerical precision, and provider-specific settings.

Do not assume every provider exposes all of these details. Record what is available and explicitly note what cannot be controlled.

### 6.3 Compare the first point of divergence

When token-level traces or equivalent diagnostic information are available, locate the earliest point where two generated sequences diverge.

An early divergence can help narrow the investigation to different candidate scores, random sampling, tie-breaking, or differing effective context. Later differences may simply follow from the earlier divergence.

A first-divergence analysis is useful evidence, but it does not prove the underlying cause by itself.

## 7. What Counts as a Generation Failure?

A generation failure occurs when the generation operation does not produce the result required by its contract.

Not every unsuccessful application request is a model-generation failure. The distinction matters because different failure categories require different diagnostic and recovery actions.

Consider these layers:

| Layer | Example problem | Typical diagnostic direction |
|---|---|---|
| Request construction | Invalid generation parameters | Validate the request and configuration |
| API or transport | Connection interruption or rejected request | Inspect response status and transport behavior |
| Model generation | Generation terminates before the required result is produced | Inspect termination reason and generated content |
| Output processing | Response cannot be parsed as required | Inspect the returned content and parser behavior |
| Application validation | Output violates an application-specific requirement | Inspect validation rules and task behavior |
| Downstream execution | A generated result cannot be used by a later component | Inspect the downstream contract and failure |

These layers can interact. For example, a connection interruption can cause the application to receive an incomplete response, while a token limit can cause a model to stop before producing the required structure.

A reliable system records enough information to distinguish these cases rather than grouping every unsuccessful request under a single generic error.

## 8. Common Generation Termination Outcomes

Generation systems may stop for different reasons. Exact names and guarantees depend on the API.

### 8.1 Natural or configured completion

The model reaches a recognized end-of-generation condition, such as an end-of-sequence token or a provider-defined successful completion state.

This usually indicates that generation has finished according to the model or API protocol. It does not automatically prove that the application received a semantically correct or task-complete result.

### 8.2 Maximum-token limit

Generation stops because the configured output budget has been exhausted.

This is not necessarily an infrastructure failure. The operation may have completed according to its configured limit while the resulting text remains incomplete for the application's needs.

For example, a response may stop in the middle of a sentence, code block, or structured object.

### 8.3 Stop-sequence termination

Generation stops when a configured stop condition is reached.

Whether the matching text is included in the returned output depends on the API's documented semantics.

A stop condition may be intentional, but an incorrectly configured stop sequence can truncate a response earlier than intended.

### 8.4 Cancellation

The request is cancelled by the caller, application, or runtime.

Cancellation is distinct from successful completion and from an unexpected failure. The application should preserve the termination outcome and handle any partial content according to its contract.

### 8.5 Runtime or service failure

The generation operation may fail because of an exception, unavailable service, resource problem, timeout, or another runtime issue.

The exact cause may not always be exposed to the caller. Use the available error details and operational telemetry rather than infer a cause from incomplete text alone.

### 8.6 Incomplete transport or missing terminal signal

The application may receive some content but fail to observe the terminal event required by its API contract.

This can occur because of interruption, client-side errors, or protocol-handling problems.

If the contract requires an explicit completion signal, receiving text or reaching the end of the local stream is not by itself sufficient evidence of successful generation.

## 9. Failure, Termination, and Application Success

These concepts should not be treated as synonyms.

- **Termination** means that generation has stopped.
- **Generation failure** means the generation operation did not satisfy its required generation contract.
- **Application failure** means the overall operation did not satisfy the application's requirements.
- **Application success** means the result met the conditions necessary for the application to accept it.

For example, a model may terminate normally after reaching its output limit. The API may report a completed generation operation, but the application may reject the response because a required JSON field is missing.

Likewise, a syntactically valid structured response may still fail application validation.

A useful conceptual pipeline is:

```text
Generation terminates
        |
        v
Interpret termination outcome
        |
        v
Check output completeness
        |
        v
Parse and validate if required
        |
        v
Determine application outcome
```

Not every application needs every stage, and some APIs provide stronger guarantees than others. The important requirement is to define the acceptance conditions explicitly.

## 10. Diagnosing Incomplete or Unexpected Output

When a response is incomplete or unexpected, investigate systematically.

### 10.1 Verify the termination reason

Start by determining whether generation stopped because of normal completion, a configured limit, a stop condition, cancellation, or an error.

This information often narrows the search space more effectively than inspecting the text alone.

### 10.2 Inspect the effective generation configuration

Check the output-token budget, stopping conditions, decoding parameters, and any active constraints.

A short or incomplete response may be the expected consequence of the configuration rather than a model defect.

### 10.3 Examine the output itself

Determine whether the response is empty, truncated, structurally invalid, unexpectedly terminated, or complete but unsuitable for the task.

These outcomes should not be collapsed into one category.

### 10.4 Separate generation from post-processing

If the model returned a complete result but the application rejected or damaged it during parsing, transformation, or validation, the problem may be downstream of generation.

Inspect the raw response when available and permitted by the system's privacy and data-handling requirements.

### 10.5 Reproduce the failure under controlled conditions

Repeat the request with the relevant inputs and configuration held fixed. Record the model identifier, generation settings, seed when supported, termination reason, and runtime information available.

If the failure cannot be reproduced, investigate which conditions may have changed rather than assuming the original observation was incorrect.

## 11. Designing Reproducible Generation Experiments

Reproducibility is a property of an experiment's design, not just a parameter passed to a model API.

A useful experiment record includes the following categories.

| Category | Information to record |
|---|---|
| Input | Complete effective prompt and relevant context, subject to data-handling rules |
| Model | Provider, model identifier, and version or revision where available |
| Decoding | Selection strategy and relevant generation parameters |
| Randomness | Seed and any documented random-state controls |
| Constraints | Stop conditions, output format, schema, or grammar configuration |
| Runtime | Relevant library, runtime, hardware, and numerical settings when available |
| Outcome | Returned content, termination reason, errors, and application validation result |
| Experiment definition | What counts as an identical or equivalent result |

### 11.1 Change one variable at a time

When investigating the effect of a generation parameter, hold other relevant variables constant.

For example, when comparing two temperature settings, keep the model, effective prompt, other decoding settings, and runtime conditions fixed as far as practical.

Otherwise, an observed difference cannot be confidently attributed to temperature.

### 11.2 Define the comparison criterion

Before comparing runs, determine what needs to match.

Exact text equality is useful for debugging strict reproducibility, but it may not be the right criterion for every experiment. Another investigation may care about termination behavior, schema compliance, or a particular measured property.

The criterion must be defined before interpreting the results.

### 11.3 Record limitations explicitly

If the provider does not expose an immutable model revision, runtime details, or reproducibility guarantees, document those limitations.

An experiment can still be useful without full control over the environment, but its conclusions should not claim a stronger degree of reproducibility than the evidence supports.

## 12. Recovery Strategies and Their Trade-Offs

Recovery should be based on the diagnosed failure category.

### 12.1 Correct the request

If the failure is caused by invalid parameters, incompatible constraints, or an inappropriate output budget, correct the configuration rather than repeatedly resubmitting the same request.

### 12.2 Retry transient failures

A retry may be appropriate for a transient transport or service failure.

Retries should be bounded and use an appropriate delay policy. Repeated attempts can increase latency and cost without improving the outcome if the underlying problem is persistent.

### 12.3 Retry generation when appropriate

A new generation attempt may produce different output, particularly with sampling-based decoding. This can be useful for some tasks, but it is not a universal remedy.

If the failure is caused by an unchanged token limit or unsupported constraint, repeating the same request may reproduce the same failure.

### 12.4 Increase the output budget deliberately

If the output was truncated by a token limit, increasing the budget may help, provided the model and application limits permit it.

However, a larger budget does not guarantee a complete or correct response. It may also increase latency and cost.

### 12.5 Reject unusable results safely

If the output fails required parsing or application validation, reject it or route it through a defined recovery path.

Do not silently treat an invalid result as successful merely because generation terminated normally.

### 12.6 Avoid unsafe retries

When generation is part of a workflow that can trigger external side effects, consider whether repeating the operation is safe.

For example, if a generated instruction has already been submitted to another system, retrying the entire workflow may duplicate the action unless the application uses appropriate idempotency or deduplication mechanisms.

The recovery strategy must account for the state of the overall workflow, not just the generation request.

## 13. A Conceptual Generation Failure Classifier

The following pseudocode illustrates how an application might separate generation outcomes from later acceptance checks. It is deliberately provider-neutral and assumes the caller has already normalized provider-specific termination information.

```python id="xj7b4q"
def classify_generation_result(result):
    if result.cancelled:
        return {
            "status": "cancelled",
            "reason": result.termination_reason,
        }

    if result.error is not None:
        return {
            "status": "failed",
            "reason": result.error,
        }

    # Preserve a known, specific termination reason before using
    # the missing completion signal as a fallback diagnosis.
    if result.termination_reason == "max_tokens":
        return {
            "status": "incomplete",
            "reason": "output_limit_reached",
        }

    if not result.has_required_completion_signal:
        return {
            "status": "incomplete",
            "reason": "missing_completion_signal",
        }

    if not result.output:
        return {
            "status": "incomplete",
            "reason": "empty_output",
        }

    return {
        "status": "generated",
        "reason": result.termination_reason,
        "output": result.output,
    }
```

This example illustrates several principles:

- Cancellation and explicit errors are handled separately.
- A known output-limit termination is preserved instead of being obscured by a missing completion signal.
- Missing required completion information is not silently treated as success.
- A generated result is not yet declared application-successful.

The example assumes that the application's contract treats the `max_tokens` termination reason as insufficient for accepting the result. Another application may accept output that reaches its token limit if its specific requirements are already satisfied. The classifier should reflect the actual contract and provider semantics.

The ordering is intended to preserve the most specific known diagnostic reason. In a production implementation, provider-specific termination metadata and terminal-signal semantics must be normalized consistently before classification.

A real implementation must also handle provider-specific error representations, validate structured content where required, and preserve diagnostic information without exposing sensitive data.

## 14. Common Misconceptions

### Misconception 1: Identical prompts guarantee identical outputs

The prompt is only one part of the effective generation input. Decoding randomness, model versions, runtime differences, hidden context, and other settings can affect the result.

### Misconception 2: Greedy decoding guarantees reproducibility everywhere

Greedy decoding removes sampling from the selection rule, but different effective inputs, candidate scores, tie-breaking behavior, or runtime execution can still produce different outputs.

### Misconception 3: A fixed seed guarantees identical results across environments

A seed can improve reproducibility under compatible conditions. It does not override changes in models, implementations, random-number consumption, or numerical execution.

### Misconception 4: Every terminated generation is successful

Generation can terminate because of a token limit, stop condition, cancellation, or failure. The application must interpret the termination outcome according to its requirements.

### Misconception 5: A normally completed response must be usable

A generation operation can finish normally while returning output that is incomplete for the task, structurally invalid, or rejected by application validation.

### Misconception 6: Retrying always fixes generation failures

Retries can help with transient failures or some stochastic outcomes. They do not automatically resolve persistent configuration errors, unsupported constraints, or application-level defects.

## 15. Production Engineering Considerations

Reliable generation requires more than selecting decoding parameters.

### 15.1 Preserve useful diagnostic context

Record the effective configuration, model identifier, termination reason, request outcome, and relevant errors. Capture prompt or output content only when permitted by privacy, security, and retention requirements.

### 15.2 Use meaningful failure categories

Distinguish request errors, transport failures, generation termination conditions, incomplete outputs, parsing failures, validation failures, and downstream failures.

Clear categories make debugging and operational analysis more effective than a single generic generation-error label.

### 15.3 Bound recovery behavior

Retries and regeneration attempts should have explicit limits. Define what happens after the recovery budget is exhausted and ensure that persistent failures do not create unbounded cost or latency.

### 15.4 Track outcomes, not only exceptions

Useful operational measurements include:

- Completion rate.
- Failure and cancellation rates.
- Output-limit termination frequency.
- Incomplete-output frequency.
- Parsing and validation failure rates.
- Retry and regeneration counts.
- Time to completion and total request duration.

These measurements should be interpreted according to the application's contract. For example, a normally terminated generation can still be rejected as incomplete by application validation.

### 15.5 Avoid logging sensitive generation content by default

Prompts, retrieved context, and generated responses may contain confidential or personal information. Diagnostic logging should follow the system's access controls, retention requirements, and data-minimization policies.

Where possible, use structured metadata and error categories to investigate failures without unnecessarily retaining complete content.

## 16. Interview and Design Discussion

A strong engineering explanation should connect reproducibility to the complete inference configuration and distinguish model-generation outcomes from application success.

Be prepared to explain:

1. The difference between determinism and reproducibility.
2. Why sampling can produce different outputs for the same prompt.
3. Why greedy decoding and fixed seeds do not guarantee universal reproducibility.
4. How model versions, hidden inputs, and numerical execution affect repeatability.
5. How to investigate the first point of divergence between two runs.
6. The difference between termination, generation failure, and application failure.
7. Why reaching a token limit is not always an infrastructure failure.
8. How to design a reproducible generation experiment.
9. How to choose between retrying, regenerating, correcting configuration, and rejecting output.
10. How to avoid unsafe retries when downstream side effects are possible.

For a design scenario, specify what must be reproducible, identify the conditions that can affect generation, define the result-acceptance contract, and explain how failures will be classified and recovered from.

## 17. Revision Checklist

You should be able to explain the following without relying on the chapter:

- [ ] The difference between deterministic generation and reproducible experiments.
- [ ] Why identical visible prompts may not represent identical effective requests.
- [ ] How sampling, decoding settings, model versions, and runtime conditions affect output.
- [ ] What greedy decoding guarantees and what it does not.
- [ ] Why random seeds have implementation-dependent limits.
- [ ] How to distinguish generation failures from parsing, validation, and downstream failures.
- [ ] The difference between normal termination, output-limit termination, cancellation, and runtime failure.
- [ ] How to investigate unexpected output using controlled experiments.
- [ ] How to choose an appropriate recovery strategy.
- [ ] How to build reproducibility and failure diagnosis into a production application.

## 18. Key Takeaways

- Determinism describes repeatable behavior under defined conditions; reproducibility describes the ability to recreate a result or satisfy a defined comparison criterion.
- Identical visible prompts do not guarantee identical effective inputs or execution conditions.
- Sampling, model changes, decoding configuration, and numerical execution can affect output repeatability.
- Greedy decoding and random seeds help control specific sources of variation but do not guarantee universal reproducibility.
- Generation termination, generation failure, and application success are distinct concepts.
- Token limits and stop conditions can produce normally terminated but unusable output.
- Reliable debugging requires recording effective inputs, configuration, termination outcomes, and relevant execution context.
- Recovery strategies should match the diagnosed failure and account for cost, latency, and downstream side effects.

The central engineering principle is: **make generation behavior observable, define what counts as a reproducible result, and distinguish a completed generation operation from an acceptable application outcome.**
