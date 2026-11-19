# 01 — Requirements and Workload Characterization

## 1. Purpose

Model selection begins with the application, not the model.

An engineer who starts by comparing popular models risks optimizing for capabilities the application does not need while overlooking constraints that determine whether a candidate is usable.

Consider an application that extracts structured information from customer support messages. A highly capable general-purpose model might perform well, but the application may also require valid JSON, predictable latency, a strict cost ceiling, and restrictions on where customer data can be processed.

The selection problem is therefore not simply:

> Which model is the most capable?

It is:

> Which model and access or operating arrangement satisfy the application's requirements, and which feasible option offers the best trade-offs?

This chapter establishes how to characterize a workload, define acceptable outcomes, distinguish mandatory constraints from preferences, and record unresolved requirements.

The primary output is a **workload specification** that subsequent chapters can use to shortlist candidates, interpret evidence, estimate costs, and justify a selection decision.

## 2. Define the Application Decision

A model is a component within a larger application. Its suitability depends on the role it performs and the conditions under which it operates.

Consider three applications:

- A document classification service that processes thousands of short messages.
- A coding assistant that generates and explains code.
- A multilingual conversational assistant that handles long user interactions.

These applications have different workloads and success conditions. The classification service may prioritize throughput and cost per record. The coding assistant may emphasize task correctness and instruction following. The conversational assistant may require multilingual capability, appropriate context handling, and acceptable response latency.

No single selection criterion adequately describes all three.

### 2.1 Capability versus suitability

**Capability** describes what a model can do and how well it performs relevant tasks.

**Suitability** describes whether a candidate option satisfies the application's requirements under its actual operating constraints.

A candidate may perform well on a task but still be unsuitable because its access arrangement violates a data-processing restriction, its operating costs exceed the budget, or its latency is unacceptable. Another candidate may be less capable in general but satisfy the application's requirements with lower cost and operational complexity.

Model selection therefore has two distinct stages:

1. **Establish feasibility:** Determine whether each candidate option satisfies the mandatory requirements under the defined workload conditions.
2. **Compare eligible options:** Evaluate the trade-offs among candidates that satisfy those requirements and choose the option best suited to the application.

A **candidate option** means a model together with the relevant access or operating arrangement, such as a hosted API or a self-hosted runtime. Some requirements depend on this complete arrangement rather than on the model's weights or capabilities alone.

A candidate that violates a genuine non-negotiable requirement should not win because it performs better on an unrelated dimension.

### 2.2 Define the decision before collecting model names

Clarify the decision being made before creating a shortlist.

Examples include:

- Selecting a model option for a new application.
- Replacing an existing option because of cost or reliability problems.
- Choosing between a hosted API and an open-weight model with an appropriate runtime.
- Determining whether a current model is adequate or whether adaptation should be considered.

The decision context matters because alternatives, migration costs, existing integrations, and acceptable risks may differ.

**Engineering rule:** Define the application decision first. Investigate candidate options second.

## 3. Characterize the Workload

A workload specification describes the work the application asks a model to perform, the conditions under which requests arrive, and the outcomes the application must deliver.

A useful specification captures the dimensions that could materially change the selection decision.

| Dimension | Questions to answer | Why it matters |
|---|---|---|
| Task | What must the model produce or decide? | Establishes the required capability. |
| Input characteristics | What types, sizes, languages, and formats of input are expected? | Helps determine candidate compatibility and suitability. |
| Output characteristics | Is the output free-form text, structured data, a classification, or another format? | Identifies output and integration requirements. |
| Interaction pattern | Are requests independent, conversational, or part of a multi-step workflow? | Influences context and application requirements. |
| Traffic | What is the expected request volume, peak arrival rate, and relevant concurrency? | Affects capacity, throughput, and cost. |
| Quality and reliability | What constitutes an acceptable result, and which failures are tolerable? | Defines application-level acceptance conditions. |
| Latency | How quickly must the application return a response or complete a task? | Constrains viable candidates and arrangements. |
| Availability | What service continuity is required? | Affects access and operational suitability. |
| Resources | What compute, memory, and infrastructure are available? | Constrains deployment options. |
| Data constraints | What restrictions apply to processing, storage, and location? | May disqualify otherwise capable options. |
| Economics | What spending limits and usage assumptions apply? | Defines financial feasibility. |
| Maintainability | Who will integrate, operate, and maintain the solution? | Makes engineering effort part of the decision. |

These dimensions are not a checklist of equally important requirements. A simple offline classification task may need little detail about interactive latency. A customer-facing assistant may need a precise response-time objective and a description of peak traffic.

The goal is to capture the dimensions that could materially change candidate eligibility or the final trade-off.

### 3.1 Describe representative requests

Abstract descriptions such as "summarize documents" are rarely sufficient.

A more useful specification describes representative inputs and outputs:

- Input: a customer complaint of approximately 300 words.
- Output: a category, a priority, and a short explanation.
- Output format: a predefined JSON object.
- Interaction: one independent request per complaint.
- Expected volume: 20,000 records per business day.
- Processing pattern: scheduled batches and occasional interactive requests.

These details expose important questions. Is the output schema mandatory? Can records be processed in batches? Which requests require an immediate response? Does traffic arrive evenly or in bursts?

Use realistic workload ranges when exact values are unknown. Record uncertainty instead of presenting an unsupported estimate as fact.

### 3.2 Distinguish typical requests from difficult requests

Average inputs do not describe the entire workload.

A production workload may contain:

- Very short and unusually long inputs.
- Common and rare languages.
- Clean, structured data and malformed input.
- Ordinary requests and difficult edge cases.
- Normal traffic and demand spikes.
- Low concurrency and periods of high concurrent demand.

These variations can affect suitability. A candidate that handles typical requests well may still be unsuitable if it cannot handle a critical class of inputs or the expected peak workload.

Identify the workload segments that could materially affect the decision. Formal sampling, dataset construction, and evaluation design belong to LLM-08.

## 4. Define Success and Failure

A model's output is useful only insofar as it satisfies the application's needs.

Requirements should describe observable outcomes rather than vague expectations.

"Good responses" is not a sufficient requirement. "Return an object containing three required fields, using the approved data types and values, without additional text" is more actionable.

### 4.1 Separate quality requirements from output requirements

**Quality requirements** concern the correctness or usefulness of the result. Examples include correctly classifying a complaint, preserving important information in a summary, or providing a relevant answer.

**Output requirements** concern the form of the result. Examples include valid JSON, required fields, specific data types, or a classification from an allowed set.

A response can satisfy one and fail the other.

For example, a model may correctly identify a complaint as urgent but return malformed JSON. If a downstream service expects machine-readable output, the request may still fail.

Also distinguish the model's generation behavior from the application's output contract. Schema validity may depend on model capabilities, API-supported structured-output features, runtime behavior, and application-side validation. A selection requirement should specify the behavior the complete candidate arrangement must provide rather than assuming the model alone guarantees it.

### 4.2 Define unacceptable outcomes

Describe important failure conditions explicitly.

Examples include:

- Missing mandatory output fields.
- Unsupported output values.
- Incorrect classifications that trigger harmful downstream actions.
- Responses that exceed the application's permitted latency.
- Processing data through an arrangement that violates a mandatory data restriction.
- Costs that exceed the approved workload budget.

Not every failure has equal consequences. An incorrect suggestion in an internal drafting tool may be recoverable through human review. An incorrect result in an automated workflow may trigger an irreversible downstream action.

Requirements should reflect the consequences of failure, not merely its frequency.

### 4.3 Make acceptance conditions observable

Prefer requirements that can be checked.

Weak requirement:

> The model must be fast and reliable.

Stronger requirement:

> Under the expected monthly request volume and defined peak-traffic conditions, the application must meet the agreed response-time objective, stay within the monthly spending limit, and satisfy the agreed quality and output-validity requirements.

The precise thresholds depend on the application. They must be agreed with relevant stakeholders rather than invented during model comparison.

LLM-08 covers formal evaluation methodology and performance measurement. This chapter establishes the required outcomes and acceptance conditions that the later evaluation process must address.

## 5. Translate Operational Constraints into Selection Requirements

A model option does not operate in isolation. Its suitability depends on how it is accessed, integrated, and operated within the application.

This section identifies constraints that influence selection. It does not design the complete production architecture.

### 5.1 Latency, throughput, and availability

These are distinct requirements.

- **Latency** is the elapsed time for a clearly defined operation, measured between an explicitly specified start and end point.
- **Throughput** is the amount of work completed per unit of time.
- **Availability** describes whether the required service is accessible when needed.

The measurement boundary matters. Model generation time, provider response time, and end-to-end application latency are not interchangeable. For a streaming application, time to first token and time to complete the response can also represent different requirements.

This chapter does not prescribe inference mechanics or a measurement methodology. It requires the selection specification to state which user-visible or system-level response milestone matters.

A system can have acceptable average latency but insufficient throughput during demand spikes. It can also have adequate throughput while a significant proportion of requests violate the response-time requirement.

For interactive applications, specify the response-time objective and the traffic conditions under which it applies. For batch applications, specify the volume and completion deadline.

Do not assume a candidate will meet these requirements. The workload specification establishes the target; candidate evidence determines whether it is feasible.

### 5.2 Context requirements

Some applications process short independent requests. Others need information from long documents or extended conversations.

Record expected input sizes, relevant conversation history, and approximate output sizes where applicable. Consider realistic upper bounds rather than only typical requests.

A model's advertised context capacity alone does not establish suitability. The application must account for the amount of information needed and the quality of the resulting output.

This chapter records context requirements as selection inputs. Detailed context construction, truncation, summarization, and context-management strategies belong to LLM-06.

### 5.3 Resource constraints

For a self-hosted candidate, hardware capacity, memory availability, and inference resource requirements can determine feasibility.

For a hosted candidate, relevant constraints may include service availability, supported capabilities, request limits, or access conditions.

Do not assume that self-hosting is automatically cheaper or that a hosted API is automatically simpler. The implications depend on the workload and the organization's existing capabilities. [Chapter 04 — Cost, Latency, and Total Cost of Ownership](04-Cost-Latency-and-Total-Cost-of-Ownership.md) examines economic comparison; [Chapter 05 — Hosted APIs, Open Weights, and Ecosystem Fit](05-Hosted-APIs-Open-Weights-and-Ecosystem-Fit.md) covers ecosystem choices.

At this stage, record the resource and access constraints that a candidate must satisfy.

### 5.4 Privacy, data residency, and compliance constraints

Applications may process personal information, confidential business documents, or other restricted data.

The workload specification should identify relevant requirements, such as:

- Where data may be processed.
- Whether external processing is permitted.
- Whether data may be retained by a provider.
- Which categories of information may be sent to a model.
- Which confirmed contractual or organizational restrictions apply.

Distinguish a confirmed mandatory restriction from an assumption that has not been validated.

For example, "customer data must not leave the approved processing region" may be a hard constraint if confirmed by the responsible authority. "A local model would feel safer" is not, by itself, a verified requirement.

LLM-10 records how such constraints affect candidate eligibility. Detailed policy interpretation, security controls, compliance obligations, and enterprise governance remain with ENT and the relevant organizational authorities.

### 5.5 Cost and maintainability constraints

Cost should be expressed in relation to the expected workload whenever possible.

A monthly budget without an assumed request volume may be misleading. A low advertised token price does not establish that a candidate will have the lowest total cost.

Record the spending ceiling alongside the relevant assumptions, including expected monthly volume, input/output characteristics, and peak workload where material. [Chapter 04 — Cost, Latency, and Total Cost of Ownership](04-Cost-Latency-and-Total-Cost-of-Ownership.md) develops the cost and latency comparison.

Maintainability also matters. An organization may lack the skills or operational capacity to run a self-hosted model reliably. Another organization may already have the infrastructure and expertise, making that option more feasible.

Treat these realities as explicit constraints or preferences rather than hiding them inside an informal preference for one deployment style.

## 6. Separate Hard Constraints from Preferences

A **hard constraint** is a requirement a candidate must satisfy to remain eligible.

A **preference** is a desirable property used to distinguish candidates after mandatory requirements have been considered.

| Requirement | Possible classification | Reason |
|---|---|---|
| Data must remain within an approved processing region | Hard constraint | A violation makes the candidate option ineligible. |
| Output must conform to a required schema | Hard constraint, if required by downstream processing | Invalid output may break the application. |
| Monthly spending must not exceed an approved ceiling under the defined workload | Hard constraint, if non-negotiable | The candidate must fit the financial limit. |
| Lower latency is desirable below the required limit | Preference | Faster response is beneficial, but exceeding the defined limit is the actual failure condition. |
| A familiar SDK is preferred | Preference | Familiarity may reduce integration effort but need not determine eligibility. |
| A particular provider is preferred because the team already uses it | Preference unless a genuine dependency makes it mandatory | Existing familiarity alone does not establish a hard requirement. |

Classification depends on the application and its stakeholders. The same characteristic may be a hard constraint in one application and a preference in another.

### 6.1 Avoid turning every preference into a hard constraint

Overconstraining a selection problem can eliminate viable alternatives unnecessarily.

Suppose an application requires a response within 1.5 seconds under a defined interactive workload. If a candidate meets that requirement with sufficient evidence, requiring it to have the absolute lowest possible latency without a business reason may exclude cheaper or simpler alternatives that already satisfy the need.

The reverse mistake is equally serious: treating a mandatory privacy restriction as a preference and allowing superior task performance to outweigh it.

The classification must reflect real consequences and the workload conditions under which the requirement applies.

### 6.2 Establish candidate eligibility states

For each hard constraint, record:

1. The requirement.
2. Why it is mandatory.
3. The conditions under which it applies.
4. How compliance will be established.
5. Whether the requirement itself is confirmed.
6. What evidence is available for each candidate option.
7. What happens if the option fails the requirement.

Evidence must be appropriate to the requirement. Technical documentation or controlled tests may help establish capability and performance; contractual or provider documentation may be needed for service terms and data-processing conditions. The precise evidence standard depends on the requirement and the consequences of getting it wrong.

Use three states when assessing a candidate option:

- **Eligible:** Appropriate evidence supports that all mandatory requirements are satisfied under the defined conditions.
- **Ineligible:** Evidence establishes that at least one mandatory requirement is violated.
- **Eligibility unconfirmed:** Available evidence is insufficient to determine whether one or more mandatory requirements are satisfied.

This distinction prevents two errors: treating missing evidence as proof of failure and treating missing evidence as proof of compliance.

A conceptual eligibility rule is:

\[
\text{Eligibility}(c)=
\begin{cases}
\text{Eligible}, & \text{if all mandatory requirements are supported}\\
\text{Ineligible}, & \text{if at least one mandatory requirement is violated}\\
\text{Unconfirmed}, & \text{otherwise}
\end{cases}
\]

Here, \(c\) represents the candidate model and its relevant access or operating arrangement.

This is a decision rule, not a claim that every requirement can be verified automatically. Some require technical evidence, provider documentation, contractual confirmation, or stakeholder review.

Options with unconfirmed eligibility should not be treated as proven failures, but neither should they be treated as ready for adoption. The missing evidence must be resolved or explicitly accepted through the appropriate decision process before the option is considered eligible.

## 7. Handle Missing and Contradictory Requirements

Real projects rarely begin with a complete specification.

Stakeholders may request "the most accurate model" without defining acceptable errors. Product teams may demand immediate responses while infrastructure teams impose strict capacity limits. Budget estimates may assume a different request volume from the product forecast.

An engineer should expose these gaps before they become hidden assumptions in a recommendation.

### 7.1 Identify missing requirements

For each important unknown, record:

- What is unknown.
- Why it affects the decision.
- Who can clarify it.
- Whether a provisional assumption is reasonable.
- How the assumption could change eligibility or the shortlist.

For example, if expected request volume is unknown, cost comparisons may be unreliable. Low-, expected-, and high-volume scenarios may help bound the decision, but they should not be presented as a confirmed production forecast.

### 7.2 Resolve contradictions explicitly

Consider these requirements:

- Product: responses must feel instantaneous.
- Finance: monthly spending must stay below a strict ceiling.
- Quality: every response must be correct.

These statements are not yet an actionable specification. "Instantaneous" is undefined, and perfect correctness may be unrealistic or insufficiently defined for the task.

The engineer should clarify the response-time target, define acceptable task outcomes and failure handling, and establish the workload assumptions needed to assess the budget.

If stakeholders cannot agree immediately, document the conflict and its effect on the decision. Do not silently choose the interpretation that makes a preferred candidate look best.

### 7.3 Use scenarios when uncertainty cannot be eliminated

Some uncertainty is unavoidable during early design.

Define plausible scenarios and record how each could affect feasibility.

| Scenario | Assumption | Potential consequence |
|---|---|---|
| Low volume | Demand is substantially below forecast | Fixed operating costs may dominate the comparison. |
| Expected volume | Demand matches the current forecast | Provides the primary planning case. |
| High volume | Demand reaches a plausible peak | Throughput, capacity, and variable costs may become decisive. |

These scenarios do not replace confirmed requirements. They make uncertainty visible and help identify which assumptions need further investigation.

## 8. Practical Example: Structured Customer Message Processing

Consider a hypothetical application that classifies customer support messages and returns structured output for a downstream workflow.

The numbers below are illustrative planning inputs, not measured results or claims about any model.

### 8.1 Initial workload description

The application must:

- Accept customer messages in English.
- Assign a category and priority.
- Return a structured object containing required fields.
- Process approximately 20,000 messages per business day.
- Support an interactive path for some requests.
- Remain within an approved monthly budget.
- Follow confirmed data-processing restrictions.

This description is enough to begin a workload specification, but not enough to select a model option.

Questions remain: How is correctness defined? What response time is required for interactive requests? Is the schema mandatory? What is the actual budget ceiling? What are the peak request rate and concurrency expectations? Which processing arrangements are permitted?

### 8.2 Convert the description into requirements

| ID | Requirement | Classification | Evidence or clarification needed |
|---|---|---|---|
| R1 | Classify messages into the approved category set | Quality requirement | Define acceptable classification outcomes. |
| R2 | Return every mandatory field in the required schema | Hard constraint, if required by downstream processing | Specify the output contract and how the complete arrangement will be validated. |
| R3 | Support English-language inputs | Hard constraint | Confirm candidate suitability for the workload. |
| R4 | Process expected daily volume within the deadline | Hard constraint | Clarify deadline, peak arrival rate, and concurrency; validate capacity. |
| R5 | Meet the interactive response-time target | Hard constraint once agreed | Define the latency boundary and applicable traffic conditions. |
| R6 | Remain within the approved spending ceiling | Hard constraint if non-negotiable | Confirm budget and usage assumptions. |
| R7 | Satisfy data-processing restrictions | Hard constraint where confirmed as mandatory | Verify the relevant model and access or operating arrangement. |
| R8 | Prefer lower latency among otherwise suitable candidates | Preference | Compare evidence after feasibility is established. |

R4 and R5 cannot be validated properly until the relevant deadlines and workload conditions are specified.

### 8.3 Determine what is known about each candidate

Suppose three candidate options are being considered:

- **Option A:** Evidence establishes that its data-processing arrangement violates a confirmed restriction. It is ineligible under the current requirements.
- **Option B:** Its arrangement appears compatible with the data restriction, but the available evidence does not establish whether it satisfies the interactive latency requirement. Its eligibility is unconfirmed.
- **Option C:** Appropriate evidence supports compliance with the confirmed mandatory requirements under the defined workload. It can proceed to comparative analysis, subject to any remaining validation conditions.

This example separates a known violation from missing evidence. It also shows why eligibility applies to the model and its arrangement, not simply to a model name.

For an output-schema requirement, the assessment must consider the available model or API capabilities and the application's validation mechanism. A model's ability to produce JSON in some circumstances is not, by itself, proof that the complete arrangement satisfies a strict output contract.

The next chapters establish how to gather and compare the evidence needed to make the final decision.

## 9. Reusable Workload Specification Template

Use this template when starting a model-selection task.

### Application context

- **Application or feature:**
- **Decision being made:**
- **Target users and business purpose:**
- **Consequences of an incorrect or delayed result:**

### Workload

- **Primary task:**
- **Input types, formats, languages, and size ranges:**
- **Expected output and required structure:**
- **Interaction pattern:**
- **Expected request volume:**
- **Peak arrival rate and relevant concurrency:**
- **Representative difficult or unusual cases:**

### Acceptance requirements

- **Required task outcomes:**
- **Unacceptable failure conditions:**
- **Output-format requirements:**
- **Latency requirement and measurement boundary:**
- **Workload conditions under which latency applies:**
- **Throughput and processing-deadline requirements:**
- **Availability requirements, if applicable:**

### Constraints

- **Context and input-size requirements:**
- **Resource or infrastructure limitations:**
- **Privacy and data-processing restrictions:**
- **Budget and workload assumptions:**
- **Access, integration, and maintainability requirements:**
- **Licensing or other mandatory restrictions, where applicable:**

### Requirement classification and evidence

For each requirement, record:

| Field | Description |
|---|---|
| ID | Stable identifier for traceability. |
| Requirement | The specific condition to satisfy. |
| Type | Quality, output, latency, cost, privacy, resource, or another relevant category. |
| Priority | Hard constraint or preference. |
| Operating conditions | Workload assumptions or scenarios under which the requirement applies. |
| Rationale | Why it matters to the application. |
| Validation approach | Evidence or confirmation needed. |
| Evidence reference | Link, document identifier, test report, or other reference to the supporting evidence. |
| Verification date | Date the evidence was checked, where applicable. |
| Status | Confirmed, unresolved, or provisionally assumed. |
| Owner | Person or role responsible for clarification, where applicable. |

When evaluating a candidate option against a hard constraint, separately record whether the evidence supports compliance, establishes a violation, or leaves eligibility unconfirmed.

Evidence references and verification dates improve traceability; they do not automatically make evidence sufficient or authoritative. The reviewer must still assess whether the source is appropriate to the requirement and whether it applies to the specific candidate arrangement and workload.

### Open questions and assumptions

- **Missing information:**
- **Contradictory requirements:**
- **Provisional assumptions:**
- **Scenarios that could change the decision:**
- **Stakeholder clarifications required:**

The completed specification should be specific enough to identify unsuitable options without prematurely deciding which eligible candidate will win.

## 10. Common Engineering Mistakes

### Starting with a model leaderboard

**Why it fails:** General rankings may not represent the target workload or its mandatory constraints.

**Better approach:** Define the workload and eligibility requirements before comparing candidate rankings.

### Confusing preferences with requirements

**Why it fails:** The selection process either excludes viable alternatives unnecessarily or admits options that violate mandatory conditions.

**Better approach:** Record the rationale for each hard constraint and preference.

### Treating unknown evidence as a pass or fail

**Why it fails:** An unverified candidate may be incorrectly rejected or adopted.

**Better approach:** Track eligibility as eligible, ineligible, or unconfirmed according to the available evidence.

### Using vague acceptance language

**Why it fails:** Terms such as "fast," "accurate," and "reliable" cannot guide a defensible decision without context and agreed acceptance conditions.

**Better approach:** Define observable outcomes and the operating conditions under which they must be met.

### Ignoring workload variation

**Why it fails:** Average input sizes and request rates may hide important edge cases, demand spikes, and concurrency requirements.

**Better approach:** Record representative workload ranges and peak conditions that could affect feasibility.

### Treating assumptions as facts

**Why it fails:** An unsupported traffic forecast or unverified restriction can distort eligibility and cost comparisons.

**Better approach:** Label assumptions, identify owners, and record how uncertainty could change the decision.

### Turning the workload specification into a deployment design

**Why it fails:** It mixes selection requirements with implementation decisions that belong to production engineering.

**Better approach:** Record operational constraints here; defer detailed serving, deployment, scaling, and reliability design to PROD.

## 11. Chapter Summary

A workload specification establishes the requirements against which candidate options can be assessed.

The essential practices are:

1. Describe the actual application workload before comparing models.
2. Distinguish model capability from application suitability.
3. Define acceptable outcomes and important failure conditions.
4. Record material latency, throughput, availability, resource, privacy, cost, and maintainability requirements.
5. Separate hard constraints from preferences.
6. Distinguish confirmed violations from missing evidence.
7. Expose contradictory requirements and provisional assumptions.
8. Produce a traceable workload specification that identifies unresolved requirements and the evidence needed to establish eligibility.

The quality of the final selection decision depends heavily on the quality of this initial specification. A comparison can be technically rigorous and still produce a poor decision if it optimizes for the wrong requirements.

## 12. Knowledge Check

Answer these questions using your own reasoning. Do not simply repeat the definitions.

1. A candidate performs better on a general benchmark but violates a confirmed data-processing restriction. Should it remain eligible? Explain why.
2. An application requires a response within 1.5 seconds. One candidate responds in 1.2 seconds and another in 1.4 seconds. What additional information would you need before concluding that the first is the better choice?
3. A product manager says the application must be "highly accurate." What questions would you ask to turn this into an actionable requirement?
4. Why might a model option that performs well on average requests still be unsuitable for the workload?
5. How would you handle a selection decision when expected request volume is unknown but a decision is needed soon?
6. Give an example of a preference that should not automatically become a hard constraint. Explain when it might legitimately become mandatory.
7. A candidate has not been verified against a hard data-processing requirement. Why is it incorrect to label it either eligible or ineligible based only on the missing evidence?
8. Why should a requirement's supporting evidence include a reference and verification date, and why are those fields insufficient by themselves to establish compliance?

## 13. Transition to Chapter 02

The deliverable from this chapter is a **workload specification** containing:

- The application task, input/output characteristics, and relevant traffic conditions.
- Explicit quality and operational requirements.
- A classification of hard constraints and preferences.
- Documented assumptions, unresolved questions, and requirement owners where applicable.
- The evidence needed to establish whether candidate options satisfy mandatory requirements.

Chapter 02, [Model Capability Fit and Candidate Shortlisting](02-Model-Capability-Fit-and-Candidate-Shortlisting.md), uses this specification to identify plausible candidate options based on capability fit, access arrangements, and known constraints.

Chapter 02 should build on the workload specification rather than reteach how to create one.
