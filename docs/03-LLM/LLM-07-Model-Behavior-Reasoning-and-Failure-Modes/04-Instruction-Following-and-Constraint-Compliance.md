# 04 — Instruction Following and Constraint Compliance

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Distinguish instruction following from factual correctness, reasoning quality, and output validity.
- Explain how system, developer, and user instructions influence expected LLM application behavior.
- Identify conflicts, ambiguities, omissions, and competing requirements.
- Distinguish hard constraints from preferences and understand why the distinction matters.
- Explain why a factually correct answer can still fail the task.
- Design validation mechanisms for structured outputs, required fields, prohibited content, and task-specific constraints.
- Diagnose instruction-following failures in enterprise workflows.
- Determine when an application should comply, clarify, report a conflict, or reject a request that cannot be satisfied as specified.

## 2. Prerequisites

Recommended background:

| Topic | Relevant knowledge |
|---|---|
| LLM-03 — Tokenization | How text is represented at the model input and output interface |
| LLM-05 — Inference and Text Generation | How an LLM produces responses |
| LLM-06 — Context Engineering and Context Constraints | How instructions and context are assembled for a task |
| LLM-07 Chapter 01 — Model Behavior Fundamentals | Observable behavior and behavioral variation |
| LLM-07 Chapter 02 — Reasoning Capabilities and Limitations | Constraint preservation and task validity |
| LLM-07 Chapter 03 — Factuality, Hallucination, and Grounding | Evidence-supported claims and factual correctness |

These topics provide context for understanding how instructions reach the model and how its response should be evaluated.

## 3. Estimated Reading Time

**25–30 minutes**, excluding the practical exercise.

## 4. Before We Start

Suppose an enterprise application asks an LLM to produce a deployment summary under these requirements:

- Return valid JSON.
- Include exactly three fields: `service`, `version`, and `status`.
- Do not include explanatory text outside the JSON object.
- Use only the deployment information supplied in the request.

The model returns:

```json
{
  "service": "payments-api",
  "version": "2.4.1",
  "status": "deployed"
}
```

Assume the supplied deployment record supports all three values. The response satisfies the task.

Now consider this response:

```text
Here is the requested deployment summary:

{
  "service": "payments-api",
  "version": "2.4.1",
  "status": "deployed",
  "region": "ap-south-1"
}
```

The response violates several requirements:

- It includes explanatory text outside the JSON.
- It includes an unrequested fourth field.
- The region is not established by the supplied information.

The values may look plausible, and the JSON object itself may be syntactically valid. Neither property makes the overall response compliant.

**A response succeeds only when it satisfies the applicable requirements, not merely when it contains a plausible or correct answer.**

## 5. Why Instruction Following Matters

LLM applications operate within task requirements and application contracts.

A customer-support assistant may need to follow an approved refund policy. A data-extraction pipeline may require a fixed schema. A workflow assistant may be allowed to read records but not modify them. A summarization system may need to include specific sections and remain within a word limit.

These tasks can impose requirements involving:

- The task objective.
- Required and prohibited information.
- Source restrictions.
- Output format and length.
- Completeness and ordering.
- Business rules and acceptance criteria.
- Authorization and tool-use boundaries.

A response can fail even when its factual content is correct. For example, a correct explanation returned instead of a required machine-readable object may break a downstream application.

Instruction following is therefore both a model-behavior concern and an application-engineering concern.

## 6. Mental Model: Instructions as a Task Contract

Treat a task operationally as a contract defining the desired outcome and the conditions under which the result is acceptable.

```text
Task instructions
       |
       v
Interpret the requested outcome
       |
       v
Identify applicable constraints
       |
       v
Generate a candidate response
       |
       v
Validate content and format
       |
       v
Check acceptance criteria
       |
       v
Return, repair, clarify, or reject
```

This is an application-level workflow, not a claim that the model internally executes these steps in a deterministic sequence.

### 6.1 Why a task contract helps

An explicit contract makes success inspectable. A reviewer can ask:

- Did the response perform the requested operation?
- Were required fields included?
- Were prohibited additions avoided?
- Were source restrictions respected?
- Were mandatory conditions satisfied?
- Is the output consumable by the next system component?

Without explicit acceptance criteria, evaluation can become a subjective judgment of whether a response seems helpful.

### 6.2 Separate evaluation dimensions

| Property | Example question |
|---|---|
| Content correctness | Is the deployment version accurate? |
| Instruction compliance | Did the response include only the permitted fields? |
| Output validity | Can the downstream system parse the result? |

These properties are related but independent. Valid JSON can contain incorrect values, and correct values can appear in invalid JSON.

## 7. Core Concept: Instruction Sources and Applicability

LLM applications may assemble instructions from multiple sources, depending on the model interface and application architecture.

Typical sources include:

- System-level instructions.
- Developer or application instructions.
- User requests.
- Tool descriptions and tool-use constraints.
- Structured output contracts.
- Domain-specific business rules supplied through trusted application context.

These sources can differ in authority, scope, and purpose.

### 7.1 Instruction authority and conflict resolution

In systems with role-based instruction hierarchies, higher-priority instructions generally govern when they conflict with lower-priority instructions. The precise rules depend on the model interface and platform.

However, **instruction priority does not resolve every possible conflict**.

For example:

- If a higher-priority instruction requires JSON and a user requests a Markdown table instead, the applicable higher-priority requirement governs.
- If two applicable requirements at the same effective priority demand incompatible output formats, priority alone may not determine the answer.
- If an instruction is ambiguous, assigning it a higher priority does not establish which interpretation was intended.
- If a required input is missing, instruction hierarchy does not supply the missing fact.

A robust application should define conflict-resolution rules for its supported tasks. When the rules do not resolve a material conflict, the system should ask for clarification or report that the requirements cannot all be satisfied.

Do not silently combine incompatible requirements or invent a resolution that changes the task's meaning.

### 7.2 Instructions versus contextual information

Not every statement in the context is an instruction.

| Type | Example | Purpose |
|---|---|---|
| Instruction | Return only the `service` and `version` fields | Defines required behavior |
| Context | The service is `payments-api` | Supplies task information |
| Constraint | Do not expose customer secrets | Limits acceptable behavior |
| Evidence | The deployment record reports version `2.4.1` | Supports a factual claim |

Confusing these roles can cause the model to treat a quoted example as an instruction or unverified contextual information as authoritative evidence.

Chapter 06 covers context construction and management in greater depth. This chapter focuses on task compliance and validation.

## 8. Core Concept: Hard Constraints, Preferences, and Acceptance Criteria

Requirements differ in how strictly they must be satisfied.

### 8.1 Hard constraints

A hard constraint is a condition that must be satisfied for a result to be accepted.

Examples:

- The response must be valid JSON.
- Exactly three fields must be returned.
- A payment must not be initiated without authorization.
- Restricted information must not be disclosed.
- A database update must affect only an authorized record.

Violating a hard constraint may invalidate the result even if the remaining response is useful.

### 8.2 Preferences

A preference describes a desirable property that may be traded off against other requirements.

Examples:

- Prefer a concise explanation.
- Use a friendly tone.
- Prefer a table when it improves readability.
- Keep examples relevant to Python.

Preferences should be followed when compatible with applicable constraints and the task's purpose.

### 8.3 Acceptance criteria

Acceptance criteria make success conditions explicit.

For a data-extraction task, they might require that:

- Every required field is present.
- Values come from the supplied document.
- Missing values use a defined representation.
- No additional fields are returned.
- The output passes schema validation.

### 8.4 When requirements are incompatible

Suppose a task requires exactly 50 words but also requires a quotation containing 70 words. If both conditions apply literally to the same output, they cannot both be satisfied.

The application should follow an established resolution rule if one exists. Otherwise, it should identify the conflict and ask for clarification.

Do not treat a hard constraint as optional simply because satisfying it is inconvenient.

## 9. Core Concept: Instruction Conflicts and Ambiguity

Different problems require different handling.

### 9.1 Conflicting instructions

Two instructions conflict when they cannot both be satisfied under the same interpretation.

Example:

- Instruction A: Return exactly two bullet points.
- Instruction B: Return exactly five bullet points.

First determine which instructions apply and whether an established authority or conflict-resolution rule resolves the conflict. If the conflict remains unresolved, clarification may be necessary.

### 9.2 Ambiguous instructions

An instruction is ambiguous when it permits multiple materially different interpretations.

Example:

> Return the latest deployment.

This could mean the most recently started deployment, the currently active production deployment, or the most recently completed deployment.

If the distinction materially affects the result, clarify the intended meaning unless the application's domain contract already defines it.

### 9.3 Underspecified instructions

A request is underspecified when necessary information is missing.

Example:

> Calculate the monthly cost.

The system may need usage volume, pricing, region, and billing assumptions.

If essential information cannot be established safely, request it or return a qualified result.

### 9.4 Choose the appropriate response

| Problem | Appropriate response |
|---|---|
| Conflict resolved by applicable rules | Apply the resolution |
| Unresolved incompatible requirements | Report the conflict or ask for clarification |
| Ambiguous meaning | Establish the intended interpretation |
| Missing essential information | Request it or state the limitation |
| Clear, feasible task | Execute and validate |
| Prohibited or unauthorized operation | Decline that operation or use an allowed alternative |

## 10. Core Concept: Constraint Preservation Across a Response

A model can acknowledge a requirement early in a task but fail to preserve it in the final result.

Consider a request to compare three architectures under these conditions:

- Monthly cost must remain below ₹50,000.
- Customer data must remain within an approved region.
- All three options must be compared.
- The recommendation must identify the main trade-off.

A response may compare every option and explain the performance characteristics correctly but recommend one that exceeds the budget. The analysis may be useful, but the recommendation does not satisfy the contract.

### 10.1 Represent constraints explicitly

For nontrivial tasks, translate the requirements into a checklist or structured representation.

| Constraint | Type | Validation |
|---|---|---|
| Cost below ₹50,000 | Hard constraint | Check estimated monthly cost |
| Data remains in approved region | Hard constraint | Check service and data-location configuration |
| Compare three options | Completeness requirement | Confirm all options are addressed |
| Explain main trade-off | Content requirement | Check that a meaningful trade-off is stated |

### 10.2 Validate against the original request

A response should be checked against the complete task, not merely the last instruction or most prominent requirement.

| Requirement | Evidence in result | Status |
|---|---|---|
| Requirement A | Relevant output section or validated field | Pass / Fail / Unknown |
| Requirement B | Relevant output section or validated field | Pass / Fail / Unknown |
| Requirement C | Relevant output section or validated field | Pass / Fail / Unknown |

`Unknown` is an important status. A requirement should not be marked as satisfied simply because the response does not visibly contradict it.

This checklist is an application-level validation technique; it does not guarantee that the model will preserve every constraint during generation.

## 11. Core Concept: Structured Output and Contract Compliance

Enterprise applications often need machine-consumable responses rather than free-form prose.

Examples include JSON objects consumed by an API, classification labels used for routing, extracted fields inserted into a database, tool arguments, and structured summaries consumed by another workflow.

In these cases, output formatting is part of the interface contract.

### 11.1 Syntactic validity versus semantic validity

Consider:

```json
{
  "status": "approved",
  "amount": -500
}
```

This is syntactically valid JSON. It may nevertheless violate the application's business rules if negative amounts are not permitted.

Three distinct checks may be required:

1. **Syntax validation:** Can the output be parsed?
2. **Schema validation:** Does it contain the required fields and permitted types?
3. **Semantic validation:** Do the values satisfy domain rules and reflect the available evidence?

Passing one check does not imply passing the others.

### 11.2 Example: A structured extraction contract

Suppose an application expects:

```json
{
  "employee_id": "E1042",
  "department": "Engineering",
  "manager": null
}
```

The contract might require:

- All three fields to exist.
- `employee_id` and `department` to be strings.
- `manager` to be a string or `null`.
- Missing values to use `null`, not an invented value.
- No additional keys.

A robust implementation should validate these properties outside the model where feasible.

A JSON parser can detect malformed syntax, a schema validator can enforce field types and required properties, and application logic can verify the employee ID against an authoritative source.

### 11.3 Structured generation is not factual verification

A constrained output mechanism may enforce a schema or restrict permitted output forms. It can reduce format failures, but it does not automatically establish that values are true, authorized, or appropriate.

Use model-side constraints together with deterministic validation where feasible.

## 12. Core Concept: Instruction Following and Tool Boundaries

In tool-enabled systems, instructions may govern not only the response but also which actions the application may perform.

Examples include:

- Read a record but do not modify it.
- Search approved documentation but do not access unrelated repositories.
- Prepare a deployment plan but do not execute the deployment.
- Request confirmation before an irreversible operation.

A model may produce a correct explanation and still violate the task if it performs an unauthorized action.

### 12.1 Separate recommendation from execution

Consider:

> Review this database migration and tell me whether it is safe. Do not execute it.

An application that executes the migration has violated the task even if the migration succeeds.

Where practical, enforce execution boundaries through application logic and tool permissions rather than relying solely on the model to obey an instruction.

### 12.2 Validate before consequential actions

A high-impact workflow may require:

1. Parse the requested action.
2. Verify the user's authorization.
3. Check required arguments.
4. Validate the proposed operation.
5. Obtain confirmation when required.
6. Execute through the authorized tool.
7. Verify the outcome.
8. Report what actually happened.

The exact controls depend on the application, action, and risk.

### 12.3 Tool-call correctness has multiple dimensions

A tool invocation may fail because:

- The wrong tool was selected.
- Required arguments are missing.
- An argument has the wrong type.
- The action is unauthorized.
- The tool returns an error.
- The result is misinterpreted.
- The final response claims success despite an unsuccessful operation.

The application should validate the action and inspect its result rather than equating an attempted tool call with successful completion.

Detailed orchestration belongs to Agent Engineering. This section focuses on compliance with the task's stated boundaries.

## 13. Practical Engineering Workflow

Use the following workflow when designing an instruction-sensitive LLM application.

### Step 1: Define the task outcome

State what the application must accomplish in terms that can be checked. Avoid relying exclusively on vague goals such as “be helpful.”

### Step 2: Identify applicable instructions

Separate task instructions, contextual facts, output requirements, business rules, and tool permissions.

Apply the relevant instruction hierarchy and documented conflict-resolution rules.

### Step 3: Classify requirements

Identify:

- Hard constraints.
- Preferences.
- Required information.
- Prohibited information or actions.
- Output-format requirements.
- Preconditions and dependencies.
- Conditions requiring clarification or escalation.

### Step 4: Identify missing information

Determine whether the task can be completed with the supplied inputs and accessible sources. Clarify unresolved ambiguity or missing information when it materially affects the result.

### Step 5: Generate a candidate response or action

Supply the model with relevant instructions, context, and the output contract. Use structured intermediate representations or specialized tools when justified by the task.

### Step 6: Validate independently where possible

Use deterministic mechanisms for properties they can reliably check:

- Parsers for syntax.
- Schemas for structural constraints.
- Code for arithmetic and deterministic transformations.
- Application rules for business constraints.
- Authorization controls for actions.
- Source checks for evidence requirements.

Model-based review may provide supplementary assistance, but should not be the sole control for consequential constraints.

### Step 7: Handle failures explicitly

Depending on the failure, repair the output, request clarification, return a validation error, decline an unauthorized action, or route the task for human review.

Do not silently change the user's requirements to make a response appear successful.

### Step 8: Report the actual outcome

Distinguish among:

- A response that was generated.
- A response that passed validation.
- An action that was attempted.
- An action that completed successfully.
- An outcome that was independently verified.

These are different states and should not be conflated in application reporting.

## 14. Engineering Decisions and Trade-offs

| Decision | Benefit | Trade-off |
|---|---|---|
| More explicit instructions | Reduces ambiguity | Can increase prompt complexity and conflicts |
| Strict output schemas | Improves structural reliability | Can reject useful results or require explicit handling of missing values |
| Deterministic validators | Makes defined constraints easier to enforce | Cannot independently establish every semantic property |
| Clarification before proceeding | Reduces ambiguity-related errors | Adds interaction latency |
| Strict prohibition on extra content | Protects downstream contracts | May limit explanatory usefulness |
| Application-enforced action boundaries | Reduces dependence on model compliance | Requires additional authorization and control logic |
| Automated repair | Can recover from common format failures | Repair can alter content or introduce new defects |
| Human review | Adds oversight for high-impact decisions | Increases cost and turnaround time |

### 14.1 Apply controls according to consequence

A conversational answer may tolerate minor stylistic deviations. A payment instruction, database update, or access-control decision requires stricter enforcement.

Consider:

- The consequence of a constraint violation.
- Whether the constraint is machine-verifiable.
- Whether the action is reversible.
- The reliability of available validation mechanisms.
- The cost of clarification or human review.
- The availability of a safe fallback.

The objective is to define and enforce the constraints that matter to the task, not to maximize the number of constraints.

## 15. Practical Exercise: Diagnose a Contract Violation

An enterprise application asks an LLM to produce a deployment decision under this contract:

- Return valid JSON only.
- Include exactly `service`, `version`, and `decision`.
- Use only the deployment record supplied below.
- Do not approve a deployment if the recorded security check failed.
- Do not execute the deployment.

The supplied record is:

```json
{
  "service": "billing-api",
  "version": "3.1.0",
  "security_check": "failed"
}
```

The model returns:

```text
The deployment looks acceptable based on the version information.

{
  "service": "billing-api",
  "version": "3.1.0",
  "decision": "approved",
  "security_check": "failed"
}
```

### Your task

Identify at least four contract or compliance failures.

For each, explain:

1. Which requirement was violated?
2. Is the failure about content, format, constraints, or action boundaries?
3. What validation mechanism could detect it?
4. What should the application do instead?

Do not assume the response is compliant merely because it includes the correct service and version.

### Expected findings

<details>
<summary>Reveal the expected findings after attempting the exercise</summary>

**1. Extra text outside JSON**

The response violates the JSON-only requirement. A parser applied to the entire response should reject it.

**2. Extra field**

The object includes `security_check`, although the contract permits exactly three fields. A schema with additional properties disallowed can detect this.

**3. Invalid decision**

The supplied record states that the security check failed. The application explicitly prohibits approval in this case, so `approved` violates the task contract.

**4. Failure to preserve a stated constraint**

The response includes the failed security check but produces a decision inconsistent with it. The requirement was not merely omitted; it was contradicted.

**5. Action boundary**

The response does not establish that deployment was executed, and execution is prohibited. The application must not initiate deployment while producing this answer.

**6. Appropriate response**

The application should return a schema-valid object containing only the three permitted fields and a decision reflecting the failed security check, such as `rejected`, if that value is allowed by the decision contract.

If the contract does not define permitted decision values, the application specification should be clarified rather than guessing.

</details>

## 16. Common Mistakes and Misconceptions

### Mistake 1: Treating a correct answer as a compliant answer

A response can contain accurate facts while violating format, scope, or action boundaries.

**Better approach:** Evaluate content correctness and instruction compliance separately.

### Mistake 2: Treating every instruction as equally authoritative

Instructions may have different priorities, and not every conflict is resolved by priority alone.

**Better approach:** Define the applicable hierarchy and rules for unresolved conflicts.

### Mistake 3: Treating preferences as hard constraints

A preference for brevity is not necessarily equivalent to a mandatory word limit.

**Better approach:** Classify requirements explicitly and resolve trade-offs according to their actual status.

### Mistake 4: Assuming the model preserves every constraint

A model can omit fields, add prohibited content, or contradict an earlier requirement.

**Better approach:** Validate critical requirements independently where feasible.

### Mistake 5: Treating valid JSON as a valid business decision

A response can pass parsing and schema validation while violating a business rule.

**Better approach:** Separate syntax, schema, and semantic validation.

### Mistake 6: Relying only on prompts to prevent unauthorized actions

An instruction to avoid a tool call is not a substitute for access controls.

**Better approach:** Enforce permissions and consequential action boundaries in the application and tool layer.

### Mistake 7: Reporting an attempted action as a completed action

Issuing a tool call does not establish that the operation succeeded.

**Better approach:** Inspect the actual result and report the outcome accurately.

## 17. Interview Questions with Expected Answers

### Q1. How is instruction following different from factual correctness?

**Expected answer:** Factual correctness concerns whether claims are accurate. Instruction following concerns whether the response or action satisfies the applicable task requirements. A response may be correct but violate a schema, omit required content, or perform a prohibited action.

### Q2. What is the difference between a hard constraint and a preference?

**Expected answer:** A hard constraint must be satisfied for the result to be accepted. A preference is desirable but may be traded off against other requirements when necessary. The task contract should make the distinction explicit.

### Q3. How should conflicting instructions be handled?

**Expected answer:** Apply the applicable instruction hierarchy and documented conflict-resolution rules. If the conflict remains unresolved and materially affects the outcome, ask for clarification or report that the requirements are incompatible.

### Q4. Why is JSON parsing insufficient for validating an LLM response?

**Expected answer:** Parsing checks syntax, not required fields, permitted types, factual accuracy, authorization, or business rules. Schema and semantic validation may also be required.

### Q5. How would you enforce an exact output contract in production?

**Expected answer:** Define the contract explicitly, use constrained generation where available, parse the result, validate the schema, apply relevant business rules, handle failures explicitly, and test representative and adversarial cases. Do not rely solely on the model's promise to comply.

### Q6. Why should tool permissions be enforced outside the model?

**Expected answer:** The model can misinterpret instructions or generate an unauthorized action. Application-level authorization and tool restrictions provide an additional enforcement boundary independent of the generated response.

### Q7. What should happen when a task is impossible to satisfy as written?

**Expected answer:** Identify the conflicting or missing requirements, apply a documented resolution if one exists, or request clarification. Do not silently violate a requirement and report success.

### Q8. How would you investigate recurring instruction-following failures?

**Expected answer:** Classify and reproduce the failure, inspect the task contract and context, determine whether the issue concerns ambiguity, conflict, generation, parsing, validation, or action enforcement, then apply a targeted fix and test for regressions.

## 18. Quick Revision

- Instruction following concerns compliance with applicable task requirements.
- Factual correctness, instruction compliance, and output validity are distinct properties.
- Instructions, contextual facts, evidence, constraints, and preferences serve different purposes.
- Hard constraints must be distinguished from negotiable preferences.
- Instruction priority does not automatically resolve ambiguity or every incompatible requirement.
- Constraint preservation should be checked against the original task.
- Valid syntax does not establish schema or semantic validity.
- Tool-use boundaries should be enforced through application controls where practical.
- Attempted actions, completed actions, and verified outcomes must be reported distinctly.
- Validation should target the properties that matter to the task and the consequences of failure.

## 19. Key Takeaways

Instruction following is a contract-compliance problem, not merely a prompt-writing problem.

Reliable enterprise applications define task requirements explicitly, distinguish hard constraints from preferences, handle conflicts deliberately, and validate important properties independently wherever practical.

For machine-consumable outputs, syntax and schema checks may be necessary but insufficient. For tool-enabled applications, generated instructions and proposed actions must remain separate from authorization and execution.

The central engineering principle is to **define what success means, enforce the constraints that matter, and verify that the result actually satisfies the contract**.

## 20. Further Reading

These resources provide broader context for instruction following, structured generation, and model behavior. Their findings should be interpreted within the specific methods and evaluation settings used by their authors.

- Ouyang et al., [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155) — Research on instruction following and alignment through human feedback.
- OpenAI, [Introducing Structured Outputs in the API](https://openai.com/index/introducing-structured-outputs-in-the-api/) — An overview of schema-constrained output generation and its intended applications.
- Wang et al., [Self-Instruct: Aligning Language Models with Self-Generated Instructions](https://arxiv.org/abs/2212.10560) — Research on instruction generation and instruction-following model training.
