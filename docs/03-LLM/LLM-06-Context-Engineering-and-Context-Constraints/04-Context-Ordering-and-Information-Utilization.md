# Context Ordering and Information Utilization

## 1. Purpose

A context can contain the correct information, fit within the model's supported capacity, and still fail to support a reliable answer. One reason is that **the way information is organized and presented can affect how effectively the model uses it**.

Context engineering therefore requires more than selecting relevant information and fitting it within a token budget. It also requires decisions about how instructions, evidence, examples, and task inputs are arranged and distinguished.

This chapter examines context ordering and information utilization as engineering concerns. It develops practical principles for organizing supplied information, making relationships explicit, separating different information roles, and investigating failures in which relevant evidence was present but not effectively used.

The objective is not to establish one universally optimal prompt layout. Different tasks and models can respond differently to the same arrangement. The objective is to develop a disciplined approach to context structure that can be tested against the requirements of a particular application.

### Learning objectives

By the end of this chapter, you should be able to:

- Explain why context composition, message roles, and context ordering are different engineering decisions.
- Distinguish instructions, task inputs, evidence, examples, and output requirements in a supplied context.
- Organize information so that its relationships, scope, and intended use are explicit.
- Recognize risks associated with ambiguous boundaries, conflicting placement, and long-context utilization.
- Design practical experiments to compare alternative context arrangements.
- Diagnose cases where relevant information is present but the model's answer does not reflect it.

## 2. Context Composition Versus Context Ordering

Context composition determines which information is included in a model invocation. Context ordering determines how the included information is arranged and presented.

These decisions are related but distinct.

Consider a model asked to answer a question using an internal policy.

The application has already selected:

- The governing instructions.
- The user's question.
- The applicable policy excerpt.
- A relevant transaction record.
- The required response format.

At this point, context selection may be complete. However, the application must still decide how to present these components.

It could place the policy inside a clearly labeled reference section, or mix policy text with conversational history and additional commentary. Both arrangements may contain the same facts, but they differ in clarity and structure.

The first arrangement makes it easier to distinguish the task, evidence, and response requirements. The second can leave their relationships less explicit.

This does not mean that the first arrangement will always produce a better answer. It means that **context structure is a design variable that should be controlled and evaluated rather than treated as irrelevant**.

### 2.1 A useful mental model

Think of context as an information interface between the application and the model.

The application determines what information crosses that interface. It also determines how the information is grouped, labeled, and related to the task.

A well-designed information interface makes important distinctions explicit:

- What the model must do.
- What information it should use.
- Which source supports a particular claim.
- Which information is an example rather than evidence.
- Which conditions apply to the task.
- What the response must contain.

A poorly designed interface leaves these distinctions implicit and requires the model to infer relationships that the application could have expressed directly.

### 2.2 Structure is not a substitute for quality

Organizing information cannot repair every underlying defect.

If a policy is outdated, placing it in a clearly labeled section does not make it current. If a necessary fact is absent, moving other information to the beginning does not supply that fact. If two sources contradict one another, adding headings does not automatically resolve the conflict.

Context ordering operates on the information already selected. Its purpose is to make the intended relationships and use of that information clearer, not to compensate for missing evidence or incorrect context selection.

## 3. Establish Clear Information Boundaries

A context often contains several types of information with different roles. When these roles are mixed together without clear boundaries, the model may have difficulty distinguishing an instruction from quoted content, a source claim from an application conclusion, or an example from a fact about the current task.

The application should make these distinctions explicit when they matter.

### 3.1 Separate instructions from reference material

Instructions define the required behavior or task. Reference material supplies information that may be used to complete the task.

For example:

**Instruction:** Answer using the supplied policy. If the policy does not establish eligibility, identify the missing condition.

**Reference material:** Hotel reimbursement is capped at ₹7,000 per night, subject to eligibility conditions.

The instruction defines how to use the evidence. The policy supplies the evidence itself.

Combining both into an undifferentiated paragraph can make the intended relationship less clear. Separating them gives each component a distinct role.

This distinction also matters when reference material contains text that resembles an instruction. Quoted documents, emails, or web pages may include commands directed at their original readers. Their presence as evidence does not automatically make them governing instructions for the current model invocation.

The application should preserve the distinction between the instructions governing the task and the content being analyzed.

### 3.2 Separate the task from its data

A task should identify what operation the model must perform. Its data should identify the material on which that operation operates.

For example:

**Task:** Compare the two supplied policy versions and identify changes affecting hotel reimbursement.

**Data:** Policy version A, policy version B, and their effective dates.

This separation helps prevent the model from confusing the requested operation with the subject matter.

It is especially useful when the same data can support several different operations. Two policy documents could be summarized, compared, classified, or checked for contradictions. The data alone does not establish which operation is intended.

### 3.3 Label sources and preserve their identity

When information comes from multiple sources, labels should make source identity and scope clear.

For example:

- `Current approved policy`
- `Previous policy`
- `Transaction record`
- `Informal employee comment`

These labels help distinguish the source roles without requiring the model to infer them from surrounding prose.

Where relevant, include identifying metadata such as document version, effective date, record identifier, or retrieval timestamp. The value of this metadata depends on the task; not every source requires every field.

Avoid labels that assert more than the evidence supports. A document should not be labeled `Current approved policy` unless the application has a basis for establishing that status.

### 3.4 Mark examples as examples

Examples can demonstrate a desired response structure or illustrate how a rule works. However, examples may also contain specific names, values, dates, and assumptions that do not apply to the current request.

Clearly distinguish examples from the actual task input.

For instance, a reference example showing a reimbursement decision for one employee should not be mistaken for evidence about another employee's claim.

When examples are used to guide response behavior, explain which characteristics should generalize and which details are specific to the example.

### 3.5 Make output requirements explicit

Response requirements should specify the expected result clearly enough for the application to validate it.

Examples include:

- A concise explanation.
- A comparison table with defined columns.
- A structured object containing required fields.
- A decision accompanied by supporting evidence.
- An explicit statement when the available information is insufficient.

Where the interface supports separately configured output constraints, the application should account for those settings as well as any textual instructions.

The purpose of explicit requirements is to reduce ambiguity about the response contract. They do not guarantee that the model will comply, so validation may still be necessary.

## 4. Organize Information Around the Task

A useful context structure presents the task and its supporting information in a deliberate arrangement. The exact sequence should depend on the task rather than follow a universal template.

For many straightforward applications, the following conceptual organization is a reasonable starting point:

1. Governing instructions and constraints.
2. Current task and user request.
3. Relevant evidence and source information.
4. Additional context needed to interpret that evidence.
5. Response requirements.

This is a design pattern, not a rule that every model interface must follow. Some interfaces separate instructions and messages into distinct fields or roles. Others support structured content, tool messages, or separately configured response settings.

The application should use the interface's supported mechanisms rather than flattening every component into a single string unnecessarily.

### 4.1 Message roles, interface semantics, and position are different

Three design dimensions must be distinguished:

- **Message role:** The role assigned to a message by the API or interface, such as system, developer, user, or tool.
- **Interface semantics:** The behavior associated with a role, field, structured-output setting, or other supported mechanism.
- **Positional ordering:** The location of content within a sequence of messages or within a message body.

These dimensions are not interchangeable.

For example, moving ordinary text that says "Follow this instruction" to the beginning of a user message does not necessarily give it the same authority as an instruction supplied through a dedicated developer-message field. Similarly, moving a tool result earlier in a sequence does not change the result's provenance or make it an authoritative policy.

When an application changes the message role, it may change how the interface treats that content. When it changes only the position of text, it changes the presentation but not necessarily the message's semantic role or authority.

**Engineering rule:** Use the documented interface mechanism to express instruction roles and output constraints. Use ordering to organize content within the behavior the interface already supports.

### 4.2 Put the task in an explicit location

The model should not have to reconstruct the current objective from a long history when the application can state it directly.

For example, a long support conversation may contain several completed requests and one current unresolved question. A clear task statement identifies which operation is required now.

This is particularly important when the context contains several related tasks or when earlier requests have been superseded.

A task statement should be concise but sufficiently specific to identify the intended operation, scope, and relevant constraints.

### 4.3 Keep supporting evidence close to its meaning

Evidence is easier to interpret when its source, scope, and role are clear.

For example, a policy excerpt should be accompanied by the version or effective date needed to determine applicability. A transaction amount should be accompanied by its currency and relevant transaction identifier when these affect interpretation.

The objective is not physical proximity alone. It is to make the relationship between a claim and its supporting information explicit.

A table, labeled block, structured record, or concise explanation can all serve this purpose. The appropriate representation depends on the information and the model interface.

### 4.4 Preserve qualifications with the claims they qualify

A claim may be misleading when separated from an exception, condition, or limitation.

Consider:

> Hotel reimbursement is capped at ₹7,000 per night, subject to eligibility conditions.

If the context presents the cap prominently but places the eligibility qualification elsewhere without a clear relationship, the model may produce an overly definitive answer.

The application should preserve material qualifications alongside the relevant claim or establish their relationship explicitly.

This is a structural concern: the information may already be present, but its relationship must remain clear.

### 4.5 Avoid unnecessary interleaving

Interleaving occurs when different information roles are repeatedly mixed together.

For example, a context might alternate between an instruction, a policy paragraph, a comment about the policy, a second instruction, an unrelated example, and another policy excerpt.

Such a structure can make it harder to determine which statements belong together.

Grouping related material into coherent sections can improve clarity and simplify inspection. However, grouping should not remove relationships that the task depends on, such as a qualification that applies to a particular rule.

## 5. Ordering, Position, and Long-Context Utilization

A model's ability to accept a long context does not guarantee that it will use every part of that context equally effectively.

Research on long-context language models has found that performance can vary with the position of relevant information in the supplied context. Liu et al. studied multi-document question answering and key-value retrieval, finding that performance for the tested models and tasks could decline when relevant information was placed in the middle of long contexts. The results are commonly discussed under the term *lost in the middle*. The finding is empirical and should not be treated as a universal law for every model or workload. [1]

The important engineering lesson is that **the presence of information in a context is not proof that the model used it correctly**.

### 5.1 What position sensitivity means

Suppose a model receives a long document containing one paragraph that determines the answer to a question.

The paragraph may be present, but the model could still produce an incorrect answer if it fails to identify or use the decisive passage effectively.

Position is one possible factor. Other factors may include:

- The relevance of the passage to the task.
- The clarity of the question.
- Conflicting statements elsewhere in the context.
- The amount and organization of surrounding information.
- The model and interface being used.
- The difficulty of the reasoning required.

Consequently, a failure to use a passage should not automatically be attributed to its position. Position sensitivity is a hypothesis to investigate, not a universal explanation for every long-context failure.

### 5.2 Do not infer a universal best position

It is tempting to conclude that important information should always be placed at the beginning or repeated at the end. Such rules are too broad to be reliable across all tasks and models.

Different arrangements can produce different results depending on the task, model, and context structure. Repeating important information may sometimes help, but it can also consume capacity, introduce inconsistencies, or create ambiguity about which version is authoritative.

The appropriate arrangement should be evaluated against the application's actual requirements.

### 5.3 Distinguish position effects from missing or conflicting evidence

Before changing the order of a context, establish that the relevant information is actually present and correctly represented.

A useful diagnostic sequence is:

1. Verify that the decisive evidence was included.
2. Verify that the evidence is applicable and internally consistent.
3. Verify that the task explicitly asks the model to use the relevant evidence.
4. Inspect whether the evidence's source and qualifications are clear.
5. Compare alternative arrangements while keeping the evidence and task constant.

This sequence prevents the application from treating an information-selection problem as an ordering problem.

### 5.4 Long context should be justified by task requirements

A large context is not automatically better than a small one. It may be necessary for a task requiring comprehensive analysis, but unnecessary material can introduce distractions and conflicts.

The application should use the context capacity required by the task rather than maximizing the number of supplied tokens.

Chapter 03 covers capacity and budgeting. This chapter focuses on how the arrangement and structure of the supplied information affect its use.

## 6. Structuring Different Information Types

Different information types often benefit from different representations. Structure should clarify semantics rather than merely make a prompt look organized.

### 6.1 Use prose for relationships and explanations

Natural language is useful when the context needs to express reasoning relationships, exceptions, qualifications, or nuanced instructions.

For example:

> Apply the policy version effective on the transaction date. If the effective date cannot be established, do not assume that the newest document applies.

This communicates a decision rule and its fallback behavior.

### 6.2 Use structured representations for repeated fields

Tables, JSON objects, and other structured representations can make repeated fields easier to distinguish.

A transaction record might be represented as:

```json
{
  "transaction_id": "TX-1042",
  "transaction_date": "2026-03-12",
  "amount": 8000,
  "currency": "INR",
  "stay_nights": 1
}
```

The example makes each value's role explicit. In a real application, values and field definitions should be validated before being supplied.

Structured formatting does not guarantee correctness. Missing fields, incorrect types, ambiguous units, or inconsistent values remain possible.

### 6.3 Preserve units, scope, and identity

Values should carry enough information to prevent misinterpretation.

For example:

- `8000` is ambiguous without a currency and a description of what the amount represents.
- `7,000 per night` is more precise than `7,000` when the policy defines a nightly cap.
- `2026-03-12` should be interpreted according to the application's date and timezone conventions.
- A policy version should be linked to its effective period when that period determines applicability.

These details are not decorative metadata. They can change the correct interpretation of a fact.

### 6.4 Use formatting that the interface actually supports

A representation that is meaningful in one interface may not behave identically in another.

For example, a model API may accept structured messages or content blocks, whereas a simple text interface may receive only a string. The application should verify the supported request format and preserve necessary boundaries when converting between representations.

Do not assume that visual formatting in a development tool necessarily corresponds to a special semantic boundary in the model request.

## 7. Worked Example: Investigating an Unused Policy Exception

Consider a policy assistant that must answer whether a hotel expense is reimbursable.

The supplied context contains:

- An instruction to apply the policy effective on the transaction date.
- A transaction record for a one-night hotel stay costing ₹8,000.
- An approved policy stating a ₹7,000-per-night cap.
- An exception stating that higher costs may be permitted with documented prior approval.
- A transaction record that does not indicate whether prior approval was obtained.

The model responds:

> The expense is not reimbursable because it exceeds the ₹7,000 cap.

This answer ignores the supplied exception. Several explanations are possible: the exception may have been difficult to locate, its relationship to the cap may not have been clear, or the model may have failed to apply it despite the context structure.

The application should not assume that changing the order alone will fix the problem.

### 7.1 Inspect the existing context

First, confirm that the exception was actually included in the request and that its wording was preserved accurately.

Next, check whether the exception applies to the same policy, expense category, and transaction date. An exception from a previous policy version would not necessarily apply.

Finally, check whether the transaction record contains the evidence needed to determine whether the exception's condition was met.

In this example, prior approval is not established. The model cannot conclude that the exception applies, but it should recognize that the cap alone does not settle the question.

### 7.2 Make the relationship explicit

A clearer presentation could state:

**Applicable policy**

- Standard limit: ₹7,000 per night.
- Exception: A higher amount may be permitted when documented prior approval exists.
- Required evidence: Whether prior approval was obtained for this expense.

**Task**

Determine what the supplied evidence establishes. Do not infer approval when the record does not confirm it.

This structure makes the exception's relationship to the standard limit explicit. It also identifies the missing evidence needed to reach a definitive conclusion.

### 7.3 Compare alternative arrangements

To determine whether the new structure improves performance, test it against the original arrangement using the same model and task.

Keep the policy text, transaction facts, requested outcome, message roles, and generation settings constant. Change only the arrangement of the evidence within the supported message structure.

Evaluate whether the model:

- Identifies both the standard cap and the exception.
- Recognizes the missing approval evidence.
- Avoids claiming that reimbursement is definitively approved or denied.
- Explains what information is needed to resolve the question.

If the new arrangement performs better, it provides evidence that the structure helped for this task. It does not establish that the same arrangement will improve every policy question.

### 7.4 Record and interpret the results

For a small, practical comparison, define a pass/fail record before running the test.

| Criterion | Pass condition |
|---|---|
| Standard rule | Correctly identifies the ₹7,000-per-night cap |
| Exception | Recognizes the prior-approval exception |
| Evidence limitation | States that approval is not established by the supplied record |
| Conclusion | Avoids an unsupported definitive reimbursement decision |

Run both arrangements multiple times when practical, especially if the model's output varies between runs. Record each criterion separately rather than assigning a single subjective score to the entire response.

Interpret results carefully:

- If one arrangement consistently meets more criteria, it is evidence in favor of that arrangement for this task.
- If both arrangements perform similarly, the change has not demonstrated a meaningful benefit under the tested conditions.
- If results are mixed, increase the number of trials when practical and inspect which criteria vary. Do not declare a winner from a single favorable response.
- If both arrangements fail in the same way, investigate the task instructions, evidence, or model capability rather than continuing to reorder the same content without a new hypothesis.

This is a bounded engineering experiment, not a substitute for a broader evaluation program.

### 7.5 Engineering lesson

When a model ignores relevant information, the engineer should investigate the complete path from source inclusion to final answer.

The decisive evidence may be absent, outdated, ambiguous, poorly distinguished from other content, or present but not effectively used. These are different failure causes and require different remedies.

Context ordering is one variable in that investigation, not a substitute for checking the quality and applicability of the evidence.

## 8. Evaluating Context Arrangements

Context ordering should be treated as an engineering hypothesis that can be tested.

A prompt that appears more readable to an engineer is not automatically more effective for the model. Likewise, one successful example does not establish a general improvement.

### 8.1 Define the expected behavior

Before comparing arrangements, define what a correct response must do.

For the policy example, expected behavior might include:

- Applying the policy that governs the transaction date.
- Identifying the standard cap.
- Recognizing the exception.
- Identifying the missing approval evidence.
- Avoiding an unsupported reimbursement decision.

These criteria make the comparison more meaningful than judging which response merely sounds better.

### 8.2 Change one structural variable at a time

If an experiment changes the ordering, wording, source labels, examples, and task instructions simultaneously, the result does not reveal which change affected performance.

Begin with a controlled comparison in which the same information and task are presented in two arrangements.

For example:

- Arrangement A: Evidence is supplied in the original order.
- Arrangement B: The same evidence is grouped by policy rule, exception, and transaction facts.

Keep the model, message roles, task, evidence, and other relevant settings constant. For nondeterministic systems, use repeated trials when practical and compare results rather than relying on one response.

### 8.3 Measure task correctness

Use task-specific criteria rather than relying only on subjective response quality.

Useful measurements may include:

- Whether required facts were identified.
- Whether the model used the correct policy version.
- Whether relevant exceptions were considered.
- Whether the answer respected evidence limitations.
- Whether unsupported conclusions were avoided.
- Whether the required output structure was followed.

The exact measurements depend on the application. A policy question, code analysis task, and document summary require different correctness criteria.

Formal evaluation methodology belongs to the evaluation curriculum. Here, the goal is to apply a simple controlled comparison to a context-structure question.

### 8.4 Preserve the limits of the conclusion

A result from one task or model should not be generalized without evidence.

An arrangement that helps with policy exceptions may not help with document summarization or code review. A model update may also change the behavior observed in previous tests.

Record the model, interface, task, context arrangement, and observed outcomes when the result informs a production decision.

## 9. Common Context-Ordering Mistakes

### Mixing instructions and evidence

When task requirements and quoted source content are blended together, their different roles may become ambiguous.

**Better approach:** Separate governing instructions from the evidence being analyzed.

### Confusing message role with position

Moving text to the beginning of a user message does not automatically give it the semantics or precedence of a dedicated instruction role.

**Better approach:** Use documented message roles and interface settings for their intended purposes; use ordering to organize content within those constraints.

### Assuming that the first or last position is always best

Position sensitivity varies by task and model. A fixed placement rule may not work reliably across workloads.

**Better approach:** Test alternative arrangements using the actual task and model.

### Repeating information without a clear purpose

Repeated content can increase token usage or create uncertainty when copies differ.

**Better approach:** Repeat information only when it serves a specific function, and ensure repeated statements remain consistent.

### Using labels that assert unverified facts

Calling a document "current" or "approved" without establishing that status can bias the interpretation of the evidence.

**Better approach:** Use source labels supported by validated metadata.

### Separating claims from their qualifications

A rule presented without its exception can encourage an incorrect conclusion even when the exception appears elsewhere.

**Better approach:** Keep important qualifications connected to the rules they modify.

### Treating every long-context failure as a position problem

A model may ignore a passage because it was omitted, outdated, ambiguous, or irrelevant—not because of its location.

**Better approach:** Verify inclusion, applicability, and clarity before testing alternative ordering.

### Judging arrangements by presentation quality alone

A neatly formatted prompt can still produce an incorrect answer.

**Better approach:** Compare arrangements against explicit task-correctness criteria.

## 10. Practical Engineering Procedure

Use the following procedure when designing or debugging context organization.

### Step 1: Identify the information roles

Separate governing instructions, the current task, evidence, examples, metadata, and response requirements. Identify which roles are expressed through the API and which are represented as content within a message.

### Step 2: Verify evidence inclusion

Confirm that all information necessary for the task is present, accurately represented, and applicable.

### Step 3: Establish explicit relationships

Make source identity, scope, qualifications, exceptions, and dependencies clear where they affect interpretation.

### Step 4: Choose a readable structure

Group related information and separate components with different roles. Use structured fields or tables when they clarify meaning and are supported by the interface.

### Step 5: Define expected behavior

Specify what a correct answer must identify, use, and avoid concluding without sufficient evidence.

### Step 6: Diagnose failures before changing order

Determine whether the issue is missing information, a conflict, an ambiguous relationship, or a possible utilization problem.

### Step 7: Compare controlled alternatives

Change one structural variable at a time while holding the task, evidence, message roles, and relevant generation settings constant.

### Step 8: Evaluate and record results

Use task-specific correctness criteria, repeat trials when practical, and record the conditions under which the arrangement was tested.

### Step 9: Retain only justified design rules

Adopt an arrangement when results provide sufficient evidence that it helps the relevant workload. Avoid turning a task-specific observation into a universal rule without further testing.

## 11. Summary

Context ordering concerns how selected information is arranged and related within a model invocation. Good structure makes the task, evidence, source identity, qualifications, and response requirements easier to distinguish.

A disciplined approach:

- Separates composition decisions from ordering decisions.
- Distinguishes message roles and interface semantics from positional ordering.
- Separates instructions from reference material and examples.
- Makes task scope and evidence relationships explicit.
- Preserves qualifications alongside the claims they modify.
- Recognizes that long-context capacity does not guarantee effective use of every passage.
- Treats position sensitivity as a testable possibility rather than a universal explanation.
- Compares alternative arrangements using controlled experiments and task-specific correctness criteria.

The central principle is that **context structure should make the intended use of information explicit, and its effectiveness should be established through evidence rather than intuition**.

Chapter 05 will address a related but distinct problem: maintaining useful conversational state as interactions grow over time, rather than treating every invocation as an isolated context-ordering decision.

## 12. Knowledge Check

Answer these questions in your own words before proceeding.

1. Explain the difference between context composition and context ordering. Give an example where the selected information stays constant but its organization changes.
2. Why should instructions, reference material, and examples be distinguished explicitly?
3. Explain the difference between a message role and the position of text within a message. Why is moving an instruction to the beginning of a user message not necessarily equivalent to using a dedicated instruction role?
4. What risks arise when a policy rule is separated from the exception that qualifies it?
5. A model ignores an exception that is present in a long context. What should you verify before concluding that information position caused the failure?
6. Design a controlled experiment to compare two arrangements of the same evidence. What should remain constant, and what outcomes should be measured?
7. How should an engineer interpret mixed results across repeated trials?
8. Explain why clearer formatting cannot compensate for missing or outdated evidence.
9. What evidence would justify adopting a context arrangement as an engineering practice for a particular workload?

A strong answer should distinguish hypotheses from established results, identify the failure mechanism being investigated, and explain how the proposed arrangement would be tested.

## References

[1] Nelson F. Liu, Kevin Lin, John Hewitt, Ashwin Paranjape, Michele Bevilacqua, Fabio Petroni, and Percy Liang. “Lost in the Middle: How Language Models Use Long Contexts.” *Transactions of the Association for Computational Linguistics*, 12:157–173, 2024. Originally released as arXiv:2307.03172 in 2023.

- Paper: https://aclanthology.org/2024.tacl-1.9/
- DOI: https://doi.org/10.1162/tacl_a_00638
- Preprint: https://arxiv.org/abs/2307.03172

**Next chapter:** `05-Long-Conversation-and-Context-State-Management.md` — maintaining relevant conversational state as interactions grow, without treating the entire history as equally necessary for every invocation.
