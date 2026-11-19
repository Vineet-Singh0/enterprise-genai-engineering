# 02 — Model Capability Fit and Candidate Shortlisting

## 1. Purpose

Chapter 01 established the application workload, acceptance requirements, mandatory constraints, preferences, and unresolved assumptions.

This chapter translates that specification into a manageable set of model options worth investigating.

Candidate discovery and shortlisting are not final selection. Discovery identifies plausible alternatives; shortlisting removes clear mismatches and retains candidates whose capabilities and operating arrangements justify further evaluation.

The chapter develops a repeatable process to:

- Translate workload requirements into capability requirements.
- Discover plausible model options from relevant sources.
- Verify basic capability and compatibility.
- Identify confirmed mismatches and unresolved evidence gaps.
- Prioritize further investigation.
- Produce a traceable candidate shortlist.

The primary deliverable is a **candidate shortlist with documented rationale, capability-fit observations, eligibility status, evidence references, and unresolved questions**.

Formal evaluation methodology, cost modeling, ecosystem comparisons, adaptation decisions, and final trade-off analysis remain the responsibility of later chapters.

## 2. Translate Workload Requirements into Capability Requirements

A workload specification describes what the application must accomplish. Capability requirements identify what a candidate model or its access arrangement must support to make that application possible.

For example, consider an application that classifies customer support messages and returns structured results.

Its workload requirements might include:

- Classifying messages into an approved set of categories.
- Accepting English-language text.
- Returning a required structured output.
- Handling the expected input sizes.
- Operating through an arrangement permitted by the application's data restrictions.

These requirements imply capability and compatibility checks involving text processing, classification, output generation, context limits, and access arrangements.

The mapping should be explicit enough that another engineer can understand why a candidate was considered suitable for investigation.

### 2.1 Distinguish capability from application suitability

A candidate's advertised or documented capability establishes a reason to investigate it, not proof that it satisfies the application's acceptance criteria.

For example:

- Supporting image input does not prove accurate image interpretation.
- Supporting a long context does not prove effective use of all supplied information.
- Generating JSON does not guarantee compliance with a strict output schema.
- Supporting multiple languages does not establish adequate performance on every required language.
- Supporting code generation does not establish correctness for a particular programming task.

The candidate may still need application-specific evaluation even when its basic capabilities appear compatible.

Chapter 01 owns the general distinction between capability, requirements, and eligibility. Here, the engineering task is to determine whether each candidate has a credible path to satisfying the workload.

### 2.2 Identify mandatory and optional capabilities

Use the requirements already classified in Chapter 01 rather than inventing a new priority system.

| Capability or property | When it is mandatory | When it is optional |
|---|---|---|
| Required input modality | The workload depends on that modality. | The application does not process that input type. |
| Required output mechanism | Downstream processing depends on the mechanism or output contract. | Alternative output mechanisms are acceptable. |
| Required language support | The application must handle that language. | The language is outside the current workload. |
| Context capacity | The expected input and relevant context must fit. | The application processes only short, independent inputs. |
| Tool interaction | The application architecture depends on the required interaction mechanism. | The application uses a simple request-response pattern. |
| Additional task capabilities | A confirmed application requirement depends on them. | They are speculative future features. |

A capability should not become mandatory merely because a model offers it or a future product version might use it.

**Output of this section:** a capability requirement map that connects each important workload requirement to the capability or compatibility check needed during candidate discovery and shortlisting.

## 3. Discover Plausible Candidate Options

Candidate discovery should be broad enough to avoid premature commitment, but focused enough to avoid producing an unmanageable catalog.

### 3.1 Use relevant discovery sources

Potential sources include:

- Official model and provider documentation.
- Model cards and technical reports.
- Model repositories and published artifacts.
- Provider capability and availability documentation.
- Existing organizational deployments and internal experiments.
- Public model catalogs and relevant benchmark reports.
- Recommendations from engineers with relevant experience.

Different sources answer different questions. Official documentation may describe supported interfaces or limits; model cards may describe intended uses and limitations; internal experiments may provide observations from comparable workloads.

Do not treat one source as authoritative for every requirement. Evidence supporting a technical capability may not establish contractual terms, data-processing conditions, or operational compatibility.

Record the source of each candidate and the claim that made it worth investigating.

### 3.2 Identify specific variants and arrangements

A model family may contain variants with different capabilities, limits, resource requirements, or intended uses.

Similarly, the same model may be available through different access or operating arrangements. Those arrangements may differ in supported interfaces, available controls, resource requirements, or applicable restrictions.

Therefore, record the specific candidate option rather than relying on a family name alone.

A useful candidate identity includes:

- Model and variant.
- Relevant hosted API, runtime, or operating arrangement.
- Discovery source.
- Initial reason for consideration.

Do not assume that two variants or access arrangements are interchangeable without evidence.

### 3.3 Search for functional alternatives

Consider alternative approaches that could plausibly satisfy the workload rather than limiting discovery to one provider or model family.

For a classification application, plausible discovery directions might include a general-purpose language model, a task-oriented model, or an existing internal model.

These are options to investigate, not recommendations to test every category. The appropriate search breadth depends on the workload, available evidence, and cost of investigation.

The objective is to preserve credible alternatives without retaining candidates that have no meaningful path to meeting the requirements.

## 4. Verify Basic Capability Fit

Once candidates have been discovered, perform an initial compatibility assessment. The aim is to identify clear mismatches and important unknowns before investing in formal evaluation.

### 4.1 Task and input/output compatibility

Check whether the candidate plausibly supports the actual task and accepts the required inputs.

Questions include:

- Does it accept the required input modality and format?
- Is there credible evidence relevant to the required task?
- Can the intended access arrangement provide the required output mechanism?
- Are documented input or output limits compatible with the workload?
- Does the application depend on an interface the candidate does not provide?

A confirmed mismatch with a mandatory requirement may justify elimination. A missing detail in the documentation should instead be recorded as an evidence gap unless other evidence establishes the mismatch.

### 4.2 Language and domain fit

Distinguish three kinds of evidence:

1. **Documented support:** The candidate or its interface claims to support the required language or task.
2. **Relevant capability evidence:** Available documentation or prior results provide a credible basis for expecting the candidate to handle the relevant workload.
3. **Application-level evidence:** Evaluation demonstrates whether the candidate meets the application's acceptance criteria.

These are not interchangeable.

For example, documented support for a language does not establish adequate performance on specialized terminology or domain-specific classification. Such requirements may need targeted evaluation in LLM-08 and LLM-10 Chapter 03.

During shortlisting, identify whether there is a credible capability fit and record any critical uncertainty.

### 4.3 Context and input-size compatibility

Compare the workload's expected input and relevant context against the candidate arrangement's documented limits.

Depending on the application, the context requirement may include task instructions, user input, conversation history, supplied supporting information, and the required output budget where relevant to the interface's limits.

A candidate that cannot accommodate the mandatory workload under the intended arrangement may be eliminated.

A candidate with sufficient documented capacity should not automatically be considered effective at using the supplied information. Capacity is a compatibility check; behavior under realistic context conditions remains an evaluation question.

Detailed context construction and management belong to LLM-06.

### 4.4 Required interaction mechanisms

Some applications need a single request and response. Others depend on streaming, constrained structured output, or tool-calling interfaces.

Verify the specific mechanism required by the application.

For example, generating text that resembles a tool call is not equivalent to supporting the structured tool-calling interface required by the application. Similarly, the ability to generate JSON does not establish that the access arrangement supports constrained structured output.

Assess the model and its intended access arrangement together whenever interface support affects application feasibility.

### 4.5 Record the result of each check

For each candidate, classify the findings as:

- **Supported:** Appropriate evidence supports the required capability or compatibility.
- **Mismatch established:** Evidence establishes incompatibility with a requirement.
- **Unconfirmed:** Available evidence does not establish either support or incompatibility.

These labels describe individual capability checks, not a replacement for the candidate's overall eligibility status. Use the eligibility framework from Chapter 01 when assessing mandatory constraints.

## 5. Apply the Eligibility Framework to Candidates

Chapter 01 defines the three eligibility states. Apply that framework to each candidate option rather than re-creating it as a separate scoring system.

| Eligibility state | Shortlisting implication |
|---|---|
| Eligible | The candidate can proceed to comparative evaluation if its capability fit justifies further work. |
| Ineligible | Eliminate it under the current requirements unless a legitimate change to the requirement or arrangement resolves the violation. |
| Eligibility unconfirmed | Decide whether the unresolved evidence is important and worth investigating before retaining or deferring the candidate. |

Eligibility and capability fit answer different questions.

Eligibility asks whether mandatory requirements are satisfied. Capability fit asks whether there is a credible reason to expect the candidate to perform the required task.

A candidate may satisfy all documented mandatory constraints yet still lack convincing evidence of task capability. It may remain worth evaluating, but its eligibility should not be mistaken for evidence of quality.

Likewise, a candidate with strong task-related evidence remains ineligible if a mandatory constraint is known to be violated.

### 5.1 Prioritize unresolved evidence gaps

When a candidate's eligibility or capability fit is unconfirmed, ask three questions:

1. **Could resolving the uncertainty change the decision?** If the answer cannot affect eligibility, shortlist status, or a material requirement, the investigation may have little value.
2. **Is the evidence realistically obtainable?** Identify whether documentation, provider confirmation, technical inspection, or a targeted experiment could resolve the question.
3. **Is the investigation worth its effort?** Consider the candidate's potential value, the cost and time of obtaining evidence, and whether credible alternatives already exist.

For example, verifying a potentially suitable candidate's processing region may be worthwhile if the option offers a meaningful capability advantage. Investigating a candidate with a confirmed mandatory input incompatibility is unlikely to be worthwhile unless a permitted alternative arrangement could resolve it.

These questions guide investigation priorities; they do not replace the evidence required to establish eligibility.

## 6. Build a Manageable Shortlist

A shortlist is a limited set of candidate options that warrant further evaluation. It should be broad enough to preserve credible alternatives and narrow enough to support meaningful investigation.

### 6.1 Use a staged workflow

1. Start with the approved workload specification.
2. Map important requirements to capability and compatibility checks.
3. Discover plausible candidate options.
4. Verify basic task, input/output, language, context, and interface fit.
5. Apply the eligibility framework from Chapter 01.
6. Investigate uncertainties that could materially change the decision.
7. Retain, eliminate, or defer each candidate with an explicit rationale.
8. Record the evidence and questions that the next evaluation stage must address.

The process does not guarantee that shortlisted candidates will succeed in formal evaluation. It reduces unnecessary work while making the basis of the shortlist traceable.

### 6.2 Retain credible alternatives

When practical, retain more than one plausible candidate. Alternatives reduce dependence on a single option that may later fail evaluation or prove unsuitable.

A one-candidate shortlist can be justified when the requirements genuinely leave only one viable option, but that conclusion should be supported rather than assumed.

There is no universally correct shortlist size. It depends on the number of credible alternatives, the complexity of the workload, the available evidence, and the effort required for further evaluation.

Do not retain weak candidates merely to meet an arbitrary target.

### 6.3 Record elimination and deferral reasons

Use specific, requirement-linked reasons.

Examples include:

- A required input modality is unsupported.
- A documented context limit is insufficient for the workload.
- A mandatory interface capability is unavailable.
- Evidence establishes a violation of a confirmed mandatory constraint.
- Critical capability evidence is missing, and obtaining it is not justified.
- A candidate has no clear decision-relevant advantage and would require disproportionate investigation.

Distinguish elimination from deferral.

**Eliminate** when evidence establishes a decisive incompatibility under the current requirements.

**Defer** when the candidate remains potentially viable but an unresolved question, resource limitation, or investigation priority prevents further work at this stage.

Deferral does not establish that a candidate is unsuitable. It records that further investigation is not currently justified or cannot yet be completed.

## 7. Maintain a Traceable Candidate Register

The candidate register records the evidence and reasoning behind the shortlist. It should be concise enough to maintain and detailed enough for another engineer to understand the decisions.

### 7.1 Recommended fields

| Field | Purpose |
|---|---|
| Candidate ID | Stable identifier for cross-referencing later evaluation results. |
| Model and variant | Identifies the specific model under consideration. |
| Access or operating arrangement | Records the relevant hosted API, runtime, or other arrangement. |
| Discovery source | Identifies where the candidate was found. |
| Initial rationale | Explains why the candidate may fit the workload. |
| Capability findings | Records supported capabilities, mismatches, and unknowns. |
| Eligibility status | Eligible, Ineligible, or Eligibility unconfirmed, using Chapter 01's definitions. |
| Evidence references | Links to documentation, test results, or other supporting material. |
| Evidence verification date | Records when evidence was last checked, where applicable. |
| Open questions | Lists uncertainties that could affect the decision. |
| Shortlist decision | Retain, eliminate, or defer. |
| Decision rationale | Explains why that action is justified. |

The register should distinguish documented properties from experimental observations and assumptions. It should also identify which unresolved questions must be addressed before formal evaluation or final selection.

### 7.2 Illustrative register entries

The following entries are hypothetical.

| Candidate | Capability findings | Eligibility | Decision | Rationale |
|---|---|---|---|---|
| Option A | Required input and task capability appear plausible; remaining task-quality questions require evaluation. | Eligible | Retain | No known mandatory mismatch and a credible reason to evaluate further. |
| Option B | A mandatory input modality is unsupported. | Ineligible | Eliminate | The candidate cannot meet the current workload requirement in the assessed arrangement. |
| Option C | Task capability appears plausible, but a mandatory data-processing condition is undocumented. | Eligibility unconfirmed | Investigate or defer | Further evidence may change the eligibility decision. |
| Option D | Required interfaces appear compatible, but task capability evidence is weak and no targeted investigation has yet been justified. | Eligible, if all mandatory requirements are supported | Defer | Eligibility alone does not justify spending evaluation effort on every candidate. |

The status of Option D is conditional on the stated evidence: if its mandatory requirements have not actually been established, it must instead be marked Eligibility unconfirmed. A candidate register must never use an assumption to turn missing evidence into a confirmed status.

### 7.3 Keep the shortlist synchronized with requirements

The shortlist can become stale when the workload changes.

For example, adding image input to a text-only application may invalidate previous capability checks. Changing a data-processing restriction may alter eligibility. A new output contract may require a different interface.

When a material requirement changes:

1. Update the workload specification.
2. Identify the affected capability checks.
3. Reassess relevant candidate options.
4. Update eligibility and shortlist decisions.
5. Preserve the rationale for each material change.

The shortlist must remain a consequence of the current workload requirements, not an independent catalog of model preferences.

## 8. End-to-End Shortlisting Example

Consider the structured customer message processing application from Chapter 01.

The application requires English-language input, classification into approved categories, a specified output structure, support for expected input sizes, and compliance with confirmed data-processing restrictions. It also has throughput, latency, and spending requirements that will need evidence-based validation.

### 8.1 Apply the capability checks

The initial discovery process identifies four hypothetical candidate options.

- **Option A:** Supports the required text input and output mechanism. Its access arrangement has appropriate evidence supporting the mandatory data restrictions. Task quality remains unverified.
- **Option B:** Does not support a required input modality under the intended arrangement.
- **Option C:** Appears capable of the task, but the processing location required by a mandatory restriction is undocumented.
- **Option D:** Supports the required interfaces, but the evidence for the specific model variant is incomplete.

### 8.2 Make the shortlisting decisions

| Candidate | Finding | Eligibility | Decision |
|---|---|---|---|
| Option A | No known mandatory mismatch; task-quality evidence is still needed. | Eligible | Retain for evaluation. |
| Option B | Confirmed incompatibility with a mandatory input requirement. | Ineligible | Eliminate under the current requirements. |
| Option C | Mandatory data-processing condition remains unverified. | Eligibility unconfirmed | Investigate if the missing evidence is realistically obtainable and decision-relevant. |
| Option D | Evidence is insufficient to establish a required capability for the specific variant. | Eligibility unconfirmed unless other evidence establishes compliance | Defer or investigate based on the value of resolving the gap. |

Option A is not automatically the best model. Its eligibility allows it to proceed, but the evaluation stage must establish whether it meets the task-quality and operational acceptance criteria.

Option B is removed because a specific mandatory incompatibility is established, not because it has a lower general capability score.

Options C and D remain unresolved. Their next steps depend on whether the missing evidence can be obtained and whether resolving the uncertainty could change the shortlist.

### 8.3 Define the handoff to evaluation

The shortlist now identifies which options warrant formal evaluation and what remains unknown.

For Option A, the next stage may need to test classification quality, output validity, and performance on representative workload data.

For Option C, data-processing evidence must be resolved before its eligibility can be established. Task evaluation alone cannot compensate for that gap.

For Option D, the specific variant and its documented capabilities need clarification before the team can decide whether further evaluation is justified.

The shortlisting stage is complete when the retained candidates, unresolved eligibility questions, elimination reasons, and evaluation needs are documented clearly enough for the next stage to proceed.

## 9. Common Shortlisting Mistakes

### Choosing based on popularity

**Why it fails:** Popularity does not establish suitability for the target workload.

**Better approach:** Use popularity as a discovery signal, then verify relevant capabilities and constraints.

### Treating documentation as proof of application-level performance

**Why it fails:** Documentation may establish interface support without demonstrating that the candidate meets the application's acceptance criteria.

**Better approach:** Separate initial capability fit from formal workload evaluation.

### Assuming variants are interchangeable

**Why it fails:** Model variants and access arrangements can differ in supported capabilities and limits.

**Better approach:** Record and assess the specific candidate option.

### Rejecting candidates solely because evidence is missing

**Why it fails:** Missing evidence does not establish incompatibility.

**Better approach:** Record the uncertainty and investigate it when the result could materially change the decision.

### Retaining candidates without a decision-relevant rationale

**Why it fails:** An oversized shortlist increases evaluation effort without necessarily improving the outcome.

**Better approach:** Require a credible reason to retain each option.

### Ranking candidates before formal evaluation

**Why it fails:** Early rankings can combine incomparable claims, assumptions, and incomplete evidence.

**Better approach:** Shortlist plausible options first, then compare them using appropriate evaluation evidence and decision criteria.

### Mixing current requirements with speculative future features

**Why it fails:** Unconfirmed future needs can unnecessarily restrict the current candidate pool.

**Better approach:** Keep future capabilities separate from the mandatory requirements of the current workload.

## 10. Chapter Summary

Candidate shortlisting translates a workload specification into a manageable set of model options worth investigating.

The essential practices are:

1. Derive capability requirements from the actual workload.
2. Separate required capabilities from optional advantages.
3. Discover plausible alternatives using relevant sources.
4. Verify basic task, input/output, language, context, and interface compatibility.
5. Apply Chapter 01's eligibility framework without confusing missing evidence with a confirmed violation.
6. Investigate uncertainties when resolving them could materially change the decision.
7. Maintain a traceable register of candidates, evidence, limitations, and decisions.
8. Revisit the shortlist when material requirements change.

A shortlist is a bridge between requirements and evaluation. It should reduce wasted investigation while preserving credible alternatives and making uncertainty explicit.

## 11. Knowledge Check

Answer these questions using your own reasoning.

1. An application requires text and image input. A candidate supports text input and performs well on text-only tasks. What evidence would you need before retaining it for the complete workload?
2. Why is documented context capacity insufficient to establish that a candidate can satisfy a long-document processing requirement?
3. A candidate's task capability appears plausible, but a mandatory data-processing restriction is undocumented. How should its eligibility and shortlist decision be recorded?
4. How would you distinguish a capability that is mandatory today from one that may be useful in a future product version?
5. What is the difference between discovering a candidate, shortlisting it, and establishing that it meets the application's acceptance criteria?
6. When is it reasonable to eliminate a candidate early, and when should it remain under investigation?
7. Why can a candidate with strong task-related evidence still be ineligible?
8. Suppose the workload changes from independent short requests to long conversational interactions. Which capability checks and candidate-register entries must be revisited, and why?

## 12. Transition to Chapter 03

The deliverable from this chapter is a **candidate shortlist** containing:

- Candidate identities, variants, and access or operating arrangements.
- The rationale for considering each option.
- Capability findings and known limitations.
- Eligibility status using Chapter 01's framework.
- Evidence references and unresolved questions.
- Explicit retain, eliminate, or defer decisions.

Chapter 03, [Evaluation Evidence for Model Selection](03-Evaluation-Evidence-for-Model-Selection.md), builds on this shortlist by examining the evidence needed to compare candidates against the workload's acceptance criteria.

Shortlisting establishes which options warrant further investigation. Evaluation determines how well those options satisfy the defined requirements under the conditions being measured.

Do not treat the shortlist as a final ranking or carry unverified assumptions into evaluation as established facts.
