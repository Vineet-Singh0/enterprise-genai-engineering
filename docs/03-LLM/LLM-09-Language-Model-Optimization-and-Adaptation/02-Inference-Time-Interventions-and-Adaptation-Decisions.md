# 02 — Inference-Time Interventions and Adaptation Decisions

## 1. Purpose

Inference-time interventions change how an existing language model is used without updating its learned weights. They can improve task suitability by changing instructions, supplying appropriate examples, adjusting generation configuration, or applying output constraints.

These interventions matter because a model's observed behavior depends on more than its learned parameters. The same model can produce different results when the task description, available context, generation settings, or output requirements change.

However, inference-time changes cannot guarantee that every limitation will be resolved. A model may lack the capability required by a task, behave unreliably under a particular workload, or operate under constraints that cannot be satisfied through configuration alone.

The engineering challenge is to determine which interventions are worth testing and when the evidence justifies considering another approach, such as weight adaptation or model selection.

This chapter focuses on intervention selection and the reasoning needed to evaluate it. Detailed context construction belongs to LLM-06, generation mechanics to LLM-05, behavioral failure analysis to LLM-07, and evaluation methodology to LLM-08.

## 2. What Changes During an Inference-Time Intervention?

During ordinary inference, a language model uses its learned parameters to process inputs and generate outputs. An inference-time intervention changes some aspect of how the model is used without updating those parameters.

A simplified abstraction is:

\[
y = f_{\theta}(x,c,g)
\]

where:

- \(y\) is the generated output.
- \(f_{\theta}\) represents the model with fixed parameters \(\theta\).
- \(x\) represents the task input.
- \(c\) represents supplied instructions and contextual information.
- \(g\) represents generation configuration and applicable output constraints.

This abstraction is simplified: actual model interfaces differ, and some constraints are enforced by the surrounding application rather than by the model itself.

The important distinction is that an inference-time intervention changes the conditions under which an existing model operates. It does not directly update the model's learned parameters.

### 2.1 Why the distinction matters

Consider a model that extracts names, dates, and amounts from invoices. The model identifies the relevant information reasonably well but occasionally adds explanatory text around its JSON output.

Possible interventions include:

- Making the required output structure explicit.
- Providing a representative input-output example.
- Using a supported structured-output mechanism.
- Adjusting relevant generation settings if they contribute to the observed behavior.

These changes address how the model is instructed or constrained. They do not require retraining.

If the model consistently fails to identify the correct information even when the task is clear and the necessary information is present, the limitation may be different. Additional instructions alone may not resolve it.

**Engineering principle:** Determine whether the existing model's capability can be expressed more reliably under appropriate inference conditions before committing to weight adaptation.

## 3. Categories of Inference-Time Intervention

The following categories describe where an intervention operates and the kinds of problems it may address. They are decision categories, not guarantees of effectiveness.

### 3.1 Instruction refinement

Instructions communicate the task, expected behavior, boundaries, and output requirements.

An underspecified instruction such as “Extract the information from this support message” leaves the expected fields and treatment of missing information unclear. A more explicit instruction can define those requirements.

Instruction refinement is worth investigating when the observed failure may result from ambiguity, incomplete requirements, or conflicting directions.

It is less likely to resolve a genuine capability limitation simply by adding more wording.

LLM-06 owns the detailed design of instructions and context. This chapter treats instruction refinement as a candidate intervention and focuses on deciding whether it addresses the observed problem.

### 3.2 Example-based intervention

Examples demonstrate the intended relationship between inputs and outputs.

They can help clarify task conventions, classification distinctions, and expected output structures. For example, a support-message example paired with the correct issue category can make a classification convention more concrete.

However, examples may be unrepresentative, conflict with one another, consume context capacity, or encourage overly narrow patterns.

An example should clarify the required behavior rather than merely increase the amount of supplied text.

The selection, organization, and placement of examples belong to LLM-06. Here, the relevant question is whether representative examples address a specific observed limitation.

### 3.3 Generation configuration

Generation configuration determines aspects of how a model produces output. Depending on the model and interface, available controls may include sampling temperature, top-p sampling, maximum output-token limits, and stop sequences.

These controls are not universally available, and their precise behavior depends on the implementation.

For example, reducing the maximum output length may prevent unnecessarily long responses, but an excessively restrictive limit can truncate a correct answer. Sampling settings can influence output variation but do not guarantee factual correctness.

A configuration change should therefore be tied to a specific hypothesis about the observed behavior.

LLM-05 owns the detailed mechanics of generation, sampling, and termination. This chapter focuses on when configuration changes are worth investigating.

### 3.4 Output constraints and application-level validation

Output requirements can be supported or enforced at different layers. These layers must not be treated as equivalent.

**Model-generation controls** include supported structured-output mechanisms and constrained decoding. Depending on the implementation, these may restrict the forms of output the model can produce.

**Application-level validation** includes parsing a response, checking it against a schema, rejecting invalid values, or requesting a retry when validation fails.

These mechanisms provide different guarantees. For example, application-side parsing can detect malformed JSON, but parsing alone does not improve the model's ability to extract the correct information.

It is useful to distinguish three properties:

1. **Syntactic validity:** Does the output conform to the required representation?
2. **Structural validity:** Does it contain the required fields and data types?
3. **Semantic validity:** Are the values correct and supported by the input?

A response can satisfy the first two properties while failing the third.

Application-level validation can enforce some requirements and detect other violations, but it cannot automatically establish semantic correctness.

This distinction helps determine whether the problem concerns output representation, task capability, or both.

## 4. Match the Intervention to the Limitation

The same visible failure can have multiple causes. An intervention should be selected because it plausibly addresses the diagnosed limitation, not because it is easy to implement or popular.

### 4.1 Diagnostic guide

| Observed behavior | Candidate investigation | Important limitation |
|---|---|---|
| Output format varies | Clarify the output contract and investigate supported structured-output controls | Structurally valid output may still contain incorrect values. |
| A required field is omitted | Check whether the field is specified and whether its value is available in the input | Instructions cannot reliably recover information that is absent. |
| Classification labels are inconsistent | Clarify label definitions and consider representative examples | Examples cannot guarantee reliable separation of genuinely ambiguous classes. |
| Responses are unnecessarily long | Clarify the required level of detail and investigate output limits | Strict limits may truncate necessary information. |
| Outputs vary across repeated runs | Inspect generation settings and execution conditions | Configuration changes do not guarantee determinism or correctness. |
| Performance is poor on unfamiliar examples | Investigate task capability, input distribution, and model suitability | Broader model selection or weight adaptation may be warranted. |
| Latency or memory exceeds requirements | Identify the actual execution bottleneck and resource constraint | Instructions may not address a computational limitation. |

This table generates hypotheses; it does not establish diagnoses.

For example, inconsistent classification may result from ambiguous labels, overlapping categories, missing input information, or limited model capability. Adding examples is one possible experiment, not proof that the problem is caused by the instructions.

### 4.2 Distinguish capability from expression

A useful starting distinction is whether the model appears to possess the required capability but expresses it unreliably, or whether the capability itself may be insufficient.

**Potential expression problem:** The model can perform the task in representative cases, but instructions, configuration, or output handling produce inconsistent results.

**Potential capability problem:** The model continues to fail on relevant cases even when the task and expected behavior are clear.

This distinction is not always straightforward. A few successful examples do not establish robust capability across the intended workload.

The engineer should inspect representative failures and use evidence appropriate to the application. LLM-07 owns the deeper methodology for behavioral failure analysis and attribution.

## 5. Conduct a Controlled Inference-Time Experiment

Inference-time interventions are often inexpensive to try, but uncontrolled experimentation can still lead to incorrect conclusions.

Suppose a developer changes instructions, adds examples, modifies generation settings, and changes output validation in one experiment. If the results improve, the contribution of each modification remains unclear.

A controlled experiment makes the comparison more interpretable.

### 5.1 Establish the baseline

Record the existing configuration before making changes. Depending on the application, this should include:

- Model and version.
- Task instructions and supplied examples.
- Relevant context and output requirements.
- Generation configuration.
- Output constraints and application validation.
- Evaluation examples.
- Relevant execution conditions.

The baseline provides the reference against which the intervention is evaluated.

### 5.2 State a testable hypothesis

A useful hypothesis predicts an observable effect.

For example:

> Explicitly defining the required output fields and the representation of missing values will reduce schema violations without materially reducing extraction correctness.

This identifies both the expected benefit and a possible regression.

By contrast, “A better prompt will improve the model” is too vague to guide a meaningful experiment.

### 5.3 Isolate the change where practical

A basic experimental procedure is:

1. Keep the model and evaluation conditions fixed.
2. Apply one defined intervention.
3. Evaluate the resulting system using the same relevant procedure.
4. Compare the outcome with the baseline.
5. Inspect regressions and newly introduced failure patterns.

If multiple changes are necessary, record them explicitly. Do not claim to have isolated the contribution of each individual change when the experiment does not support that conclusion.

### 5.4 Measure the intended outcome

Measurements should reflect the limitation being addressed.

For structured extraction, relevant measurements might include:

- Exact-match accuracy for extracted fields.
- Schema-valid output rate.
- Missing-field error rate.
- Unsupported-value rate.
- Latency, if the intervention may affect execution cost.

Not every task needs every metric. Select the measurements that reflect the actual requirements and distinguish meaningful improvement from regression.

A higher schema-valid output rate is not sufficient if the extracted values become less accurate.

LLM-08 owns detailed evaluation design, metric interpretation, and statistical reasoning. This chapter establishes the experimental discipline needed to assess inference-time changes.

### 5.5 Record the conclusion

An experiment record should identify the hypothesis, baseline, intervention, evaluation conditions, results, observed regressions, limitations, and resulting decision.

The outcome may justify retaining the intervention, revising it, rejecting it, or collecting additional evidence.

A small experiment can support a bounded engineering decision without establishing universal superiority across models, tasks, or workloads.

## 6. Decide Whether Inference-Time Intervention Is Sufficient

An intervention is sufficient when it meets the application's requirements with acceptable reliability and resource use.

An improvement alone does not establish sufficiency.

Suppose an extraction system requires at least 98% accuracy. An instruction change that increases accuracy from 80% to 90% is beneficial, but it does not satisfy the stated requirement.

Conversely, a small improvement may be enough if the system already meets its requirements and the change produces a meaningful benefit without unacceptable cost or regression.

The decision depends on the requirements and the evidence, not simply on whether a metric moved in the desired direction.

### 6.1 Use an explicit stopping rule

A practical decision rule is:

- **Keep the intervention** when the acceptance criteria are met and the evidence is adequate for the intended use.
- **Revise or investigate further** when the result is promising but inconclusive, or when a specific remaining failure warrants another test.
- **Stop iterating within the current intervention category** when improvements diminish, regressions outweigh the benefit, or evidence indicates that the underlying problem requires a different approach.
- **Reconsider the system or model choice** when the current model or design cannot credibly meet the requirements.

This is a decision aid, not a universal number-of-iterations rule. The evidence and cost of further experimentation determine when continued work is worthwhile.

### 6.2 Consider total engineering cost

A configuration change may be inexpensive to implement but require fragile workarounds. Fine-tuning may require substantial data preparation and validation but produce more suitable task behavior. Output validation may improve system reliability while adding retries, latency, or application complexity.

A sound decision considers:

- Implementation effort.
- Required data and compute.
- Evaluation and validation effort.
- Operational resource consumption.
- Maintenance and compatibility.
- Consequences if the intervention fails or degrades behavior.

The objective is to satisfy the requirements at an acceptable total cost, not simply to choose the intervention with the lowest initial implementation effort.

## 7. When Should You Consider Weight Adaptation?

Weight adaptation becomes a candidate when evidence suggests that changes to model usage are insufficient or unsuitable, and a task-specific change in model behavior may be valuable.

This decision should not be based solely on the number of prompt revisions attempted.

Reasons to investigate adaptation may include:

- Persistent task-specific failures under clear and appropriate instructions.
- A recurring input-output mapping that the existing model handles inadequately.
- Sufficient representative training data for the intended adaptation.
- A measurable requirement that simpler interventions cannot satisfy reliably.
- Available resources for training, validation, and maintenance.

These are reasons to investigate adaptation, not guarantees that fine-tuning will succeed.

Weight adaptation introduces additional considerations, including data quality, generalization, training configuration, overfitting, and potential degradation of previously useful behavior. Chapters 03 and 04 cover these topics.

### 7.1 Consider alternatives before training

A persistent failure does not automatically imply that fine-tuning is the correct solution.

The selected model may be unsuitable for the task. Required information may be missing. The application may need a different output-validation strategy or a retrieval mechanism rather than a parameter update.

For example, if a model cannot answer a question because the relevant information is absent from its input, adapting its weights may not be the most reliable way to provide current, instance-specific information.

The appropriate alternative depends on the nature of the limitation and the application's requirements.

Broader model selection belongs to LLM-10, while retrieval-based information access belongs to RET.

### 7.2 Recognize the new engineering commitment

Moving from inference-time intervention to weight adaptation changes the nature of the work.

The team must consider the adaptation objective, training data, compute requirements, validation procedure, and risk of degrading behavior outside the target task. It must also determine whether the expected improvement justifies the added complexity.

Chapter 03 examines fine-tuning and parameter-efficient adaptation methods. This chapter establishes the decision boundary: changing model parameters is an option to evaluate when the problem and evidence justify it.

## 8. Common Engineering Mistakes

### 8.1 Treating longer instructions as automatically better

**Why it fails:** Additional text can introduce contradictions, irrelevant detail, or ambiguity.

**Better approach:** Make instructions precise, relevant, and aligned with the required output. Refer to LLM-06 for detailed context-design practices.

### 8.2 Adding unrepresentative examples

**Why it fails:** Examples may overrepresent common cases, fail to clarify important edge cases, or encourage narrow response patterns.

**Better approach:** Ensure that examples illustrate the intended distinctions and consider how well they represent the actual workload.

### 8.3 Changing multiple variables without recording them

**Why it fails:** The contribution of individual changes becomes difficult to attribute.

**Better approach:** Use controlled comparisons where practical and document material configuration differences.

### 8.4 Treating output validity as task correctness

**Why it fails:** A response can be valid JSON and still contain incorrect values.

**Better approach:** Evaluate structural compliance and semantic correctness separately when both matter.

### 8.5 Repeatedly changing configuration without a hypothesis

**Why it fails:** Arbitrary changes consume time and produce difficult-to-interpret results.

**Better approach:** State the expected effect of each important change and define what evidence would justify keeping it.

### 8.6 Fine-tuning simply because prompting seems insufficient

**Why it fails:** The remaining problem may involve model selection, missing information, system design, or an incorrectly defined task.

**Better approach:** Diagnose the persistent limitation and establish why a parameter update is a plausible response before investing in adaptation.

## 9. Chapter Summary

Inference-time interventions change how an existing model is used without updating its learned weights. The principal categories covered here are instruction refinement, example-based intervention, generation configuration, and output constraints or application-level validation.

Their effectiveness depends on the underlying limitation. A formatting problem, a missing-information problem, a capability limitation, and a resource constraint require different investigations.

A disciplined approach establishes a baseline, states a testable hypothesis, applies a controlled change, evaluates the intended outcome, and records the result and its limitations.

An intervention is sufficient when it meets the application's requirements with acceptable reliability and resource use. Stop iterating when the acceptance criteria are met, when evidence shows diminishing returns, or when the problem requires a different intervention category.

Weight adaptation is one possible next step, but it is not an automatic consequence of unsuccessful prompting. It must be justified against data requirements, training cost, generalization risk, and viable alternatives.

## 10. Knowledge Check

Answer these questions before proceeding.

1. A model produces syntactically valid JSON but frequently assigns the wrong category to a support message. Why are stricter JSON constraints unlikely to solve the entire problem? What would you investigate next?
2. You improve task accuracy by adding examples, but the context becomes substantially longer. Which additional effects or constraints should you investigate before accepting the change?
3. A generation-configuration change improves output consistency but increases the rate of incomplete answers. How would you determine whether the intervention is acceptable?
4. A team has tried several instruction changes without meeting its quality requirement. What evidence would you need before recommending weight adaptation rather than selecting another model or changing the system design?
5. Design a controlled inference-time experiment. State the baseline, hypothesis, variable to change, relevant measurements, and acceptance rule.

Strong answers should distinguish observations from hypotheses, identify trade-offs, and explain what evidence would change the decision.

## 11. Transition to the Next Chapter

This chapter established how to improve the use of an existing model without updating its learned weights, and how to decide when those interventions are insufficient.

The next chapter examines weight adaptation methods, including full fine-tuning and parameter-efficient approaches, and explains the trade-offs involved in changing a model's parameters.

[Next: 03 — Fine-Tuning and Parameter-Efficient Adaptation](03-Fine-Tuning-and-Parameter-Efficient-Adaptation.md)
