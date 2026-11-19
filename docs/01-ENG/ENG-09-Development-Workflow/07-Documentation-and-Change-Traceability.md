# Documentation and Change Traceability

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why technical documentation is part of the development workflow.
- Distinguish useful documentation from documentation that merely repeats the implementation.
- Identify which documents may need updating when application behavior changes.
- Choose appropriate locations and formats for technical information.
- Keep documentation consistent with the actual implementation.
- Understand the relationship between implementation changes, technical decisions, and supporting records.
- Recognize documentation gaps that can create maintenance problems.
- Establish a practical process for reviewing documentation alongside code changes.

## Prerequisites

- [Chapter 02 — Requirements and Acceptance Criteria](02-Requirements-and-Acceptance-Criteria.md)
- [Chapter 04 — Incremental Implementation Workflow](04-Incremental-Implementation-Workflow.md)
- [Chapter 05 — Working with Existing Codebases](05-Working-with-Existing-Codebases.md)
- [Chapter 06 — Dependency and Build Workflow](06-Dependency-and-Build-Workflow.md)
- ENG-03 — Software Engineering Principles
- ENG-04 — Version Control and Collaborative Development

## Estimated Reading Time

20–28 minutes

---

## 1. Introduction

Software changes do not affect only source code. They can also change the information other engineers need to understand, operate, maintain, or extend a system.

Consider an API that originally accepts a user's name and email address. A new feature adds an optional `preferred_language` field.

The implementation may work correctly, but several questions remain:

- Does the API documentation describe the new field?
- Does the request example include it?
- Is the field optional or required?
- Is there a documented default when the field is omitted?
- Does the onboarding guide still describe the correct registration workflow?
- Do any technical decisions or operational instructions need to be revised?

If these details are not maintained, the source code and the information used by developers can gradually disagree.

This creates avoidable uncertainty. Engineers may follow outdated instructions, misunderstand an interface, or spend time rediscovering behavior that should already be documented.

**Documentation and change traceability help preserve the knowledge needed to understand and maintain a software system as it evolves.**

## 2. Why Technical Documentation Exists

Source code describes how behavior is implemented. It does not always explain why the behavior exists, what constraints shaped it, or how someone should use it.

For example, a function might contain a condition that rejects requests with an expired token. The code shows the condition, but a future engineer may still need to know:

- Which authentication rule requires the rejection.
- Whether expired tokens can ever be refreshed.
- Which error response clients should expect.
- Whether a related endpoint follows the same rule.

Technical documentation provides context that may be difficult to infer from implementation alone.

Useful documentation helps engineers:

- Understand a system without repeatedly rediscovering its behavior.
- Use APIs and components correctly.
- Reproduce development and build workflows.
- Understand important design constraints.
- Maintain consistency across related components.
- Identify the implications of changing an existing feature.
- Transfer knowledge between team members.

Documentation is not valuable merely because it exists. It is valuable when it reduces uncertainty or supports a concrete engineering activity.

## 3. A Mental Model: Documentation as Part of the System's Knowledge

Think of a software project as containing two connected forms of information.

```text id="xj0a6m"
             Software Project
                    |
          +---------+---------+
          |                   |
          v                   v
   Implementation        Technical Knowledge
          |                   |
          v                   v
   Actual Behavior      Intended Use, Rules,
                        Constraints, Decisions
          |                   |
          +---------+---------+
                    |
                    v
          Maintained Understanding
```

The implementation establishes much of the system's actual behavior. Documentation communicates how engineers should understand, use, and maintain that system.

These sources should remain consistent where they describe the same facts.

However, documentation should not attempt to reproduce the entire implementation in prose. Doing so creates duplication and increases the chance that one copy becomes outdated.

A useful division is:

- **Code:** Detailed executable behavior and implementation mechanics.
- **Documentation:** Information that helps people understand, use, configure, or maintain the system.
- **Tests:** Executable checks of specified behavior.
- **Technical decision records:** The rationale and trade-offs behind significant engineering decisions.
- **Change-related records:** Context about a particular modification and its intended effect.

These categories complement one another. None replaces the others completely.

## 4. Different Types of Technical Documentation

Different documents answer different questions. Choosing the right type prevents information from being scattered or duplicated.

### 4.1 Project Overview Documentation

A project overview explains what a project does and provides a starting point for understanding it.

It may include:

- The project's purpose.
- Major capabilities.
- Important architectural components.
- Links to detailed documentation.
- High-level prerequisites and setup references.

A project overview should help a reader find relevant information quickly. It should not become a duplicate of every detailed chapter or operational guide.

### 4.2 Setup and Development Instructions

These instructions explain how to prepare a suitable development environment and execute the expected workflow.

They may cover:

- Required runtimes and tools.
- Dependency installation.
- Configuration prerequisites.
- Commands for running the application.
- Common setup problems.

The actual environment setup and configuration fundamentals belong to ENG-05. Here, the focus is on recognizing when changes to those requirements make existing instructions inaccurate.

For example, changing the required Python version may require an update to setup documentation.

### 4.3 API and Interface Documentation

API documentation explains how another component or client interacts with an interface.

It may describe:

- Endpoints and operations.
- Request parameters and fields.
- Response formats.
- Validation rules.
- Error behavior.
- Authentication requirements.
- Compatibility constraints.

An API change should trigger a review of any documentation describing the affected interface.

For example, changing an optional request field into a required field affects more than the implementation. It changes what callers must provide.

### 4.4 Architecture and Design Documentation

Architecture documentation explains significant components, their responsibilities, and the relationships between them.

It is useful when understanding the system requires more than reading an individual function.

Update it when a meaningful structural change makes the existing explanation inaccurate. A small internal implementation change does not automatically require an architecture-documentation revision.

Detailed design principles and architecture concepts belong to ENG-03. This chapter focuses on maintaining documentation when those design decisions or structures change.

### 4.5 Operational and Troubleshooting Documentation

Operational documentation helps engineers understand how to observe, diagnose, or maintain a running system.

Depending on the project, it may describe:

- Important configuration requirements.
- Known operational constraints.
- Recovery or troubleshooting procedures.
- Relevant logs and error signals.
- Dependencies on external services.

When a change alters an operational procedure or the information needed to diagnose a failure, the relevant instructions should be reviewed.

### 4.6 Technical Decision Records

A technical decision record captures an important engineering decision and its rationale.

A useful record typically includes:

- The context and problem.
- The decision that was made.
- The alternatives considered.
- The principal trade-offs.
- The consequences or constraints that follow.

For example, a team might record why it selected one database access strategy over another.

The implementation shows the selected approach. The decision record preserves why the team selected it, which may otherwise be lost as engineers and requirements change.

Not every small implementation choice needs a formal record. Reserve decision records for choices whose rationale is likely to matter to future engineers.

## 5. Documentation Should Have a Clear Purpose

Before creating or updating a document, identify the question it is intended to answer.

| Reader's question | Appropriate documentation |
|---|---|
| What does this project do? | Project overview |
| How do I prepare the development environment? | Setup instructions |
| How do I call this endpoint? | API documentation |
| How do the major components interact? | Architecture documentation |
| Why did the team choose this design? | Technical decision record |
| How do I investigate this known failure? | Troubleshooting documentation |
| What behavior changed in this implementation? | Change summary and relevant technical documentation |

These categories may be combined in a small project or separated into different files in a larger one.

The objective is not to create a document for every category. It is to place useful information where its intended readers can find it.

## 6. When Should Documentation Change?

A documentation update is necessary when a code or configuration change makes existing documented information incorrect, incomplete, or materially less useful.

Examples include:

- An API gains a new parameter.
- A field changes from optional to required.
- A command changes.
- A dependency or runtime requirement changes.
- A component's responsibility changes.
- An architectural boundary changes.
- An operational procedure changes.
- A documented limitation is removed or introduced.
- A technical decision is replaced or superseded.

Not every code modification requires a documentation change.

Renaming a private local variable, for example, may not affect any documented behavior. Updating a public request format probably does.

Use the following test:

> If someone follows the current documentation after this change, could they misunderstand the system, use it incorrectly, or perform the wrong development or operational procedure?

If the answer is yes, identify and update the affected documentation.

If the answer is no, a documentation change may be unnecessary. Avoid adding prose solely to make the change appear more complete.

## 7. Trace a Change to Its Documentation Impact

Change traceability, in this chapter's scope, means being able to identify the technical information affected by an implementation change and keep that information aligned with the resulting behavior.

It does not mean reproducing Git history, issue tracking, or team collaboration procedures. Those practices belong to ENG-04.

A useful reasoning process connects the change to its effects:

```text id="x5r0ct"
Requested Behavior
        |
        v
Implementation Change
        |
        v
Affected Interfaces, Rules,
Configuration, or Components
        |
        v
Documentation Impact Review
        |
        v
Updated Technical Knowledge
```

The important step is identifying what the implementation change means for other users of the system.

For example, changing a configuration variable's name may affect:

- Configuration reference documentation.
- Setup instructions.
- Example configuration files.
- Troubleshooting guidance.

A source-code search may reveal several uses of the variable, but the engineer must also consider the human-facing instructions that explain it.

### 7.1 Traceability Questions

For each meaningful change, ask:

1. What behavior or constraint changed?
2. Which interfaces, components, or workflows are affected?
3. Which documents describe those interfaces or workflows?
4. Which examples or instructions may now be incorrect?
5. Is a technical decision or known limitation no longer valid?
6. Which documentation should be updated, and which can remain unchanged?

This creates a focused review rather than an indiscriminate rewrite of project documentation.

## 8. Maintain Documentation Alongside Implementation

Documentation is easiest to keep accurate when it is considered during implementation rather than postponed until the end of a large task.

A practical workflow is:

### Step 1: Understand the Change

Clarify the intended behavior and the existing constraints.

Use [Chapter 02 — Requirements and Acceptance Criteria](02-Requirements-and-Acceptance-Criteria.md) when the expected behavior is ambiguous.

### Step 2: Identify the Affected Technical Information

Determine which interfaces, configurations, responsibilities, or operating procedures will change.

When working in an unfamiliar project, use the investigation approach in [Chapter 05 — Working with Existing Codebases](05-Working-with-Existing-Codebases.md).

### Step 3: Locate the Authoritative Documentation

Find the document that owns the information that must change.

Avoid copying the same explanation into several places. If multiple documents need to reference the same concept, prefer a clear link to its primary explanation where appropriate.

### Step 4: Update the Implementation and Documentation

Make the required implementation change and revise the relevant documentation.

For a small change, this may be a single concise update. A larger interface or architectural change may require several coordinated updates.

### Step 5: Check for Consistency

Compare the documentation with the actual implementation.

Verify details such as:

- Names and parameter types.
- Required and optional fields.
- Defaults and constraints.
- Commands and file paths.
- Error behavior.
- Relevant limitations and assumptions.

### Step 6: Review Examples

Examples often become outdated even when the surrounding explanation still appears correct.

Check whether code samples, request payloads, command examples, and configuration snippets remain valid.

### Step 7: Summarize the Change

Explain what changed, why it changed, and any important consequences that a future engineer should understand.

A change summary should communicate the engineering impact rather than simply list modified filenames.

## 9. Write Documentation That Is Easy to Maintain

### 9.1 Prefer Precise, Concrete Statements

Weak documentation:

> The application processes user information.

More useful documentation:

> The registration endpoint validates the submitted email address before creating a user record.

The second statement communicates a more specific behavior that can be checked against the implementation.

Specificity is useful only when the statement is supported by the actual system. Do not invent details to make documentation appear precise.

### 9.2 Separate Facts from Assumptions

If behavior is verified, document it as a fact.

If behavior depends on an assumption or external condition, state that limitation.

For example:

- Verified: The endpoint rejects requests without a user identifier.
- Conditional: The operation requires the configured identity provider to be available.
- Unknown: The behavior during identity-provider failure has not yet been established.

Explicit uncertainty is more useful than presenting an assumption as a guarantee.

### 9.3 Avoid Duplicating the Same Explanation

Duplicated explanations create multiple places that must be updated when a concept changes.

Suppose the same dependency-installation procedure appears in a project overview, an onboarding guide, and a feature-specific document. If the command changes, all three copies can drift apart.

Prefer one authoritative explanation and link to it from other relevant locations.

Some duplication may be appropriate when a short summary materially helps a reader. The concern is duplicated teaching or instructions that must remain identical, not every repeated mention of a concept.

### 9.4 Use Examples Carefully

Examples make abstract instructions concrete, but they can become misleading when they use outdated names, unsupported options, or incorrect assumptions.

For each important example, consider:

- Does it match the current interface?
- Are the required inputs included?
- Is the output representative?
- Are placeholders clearly identified?
- Does the example omit a constraint that could change the result?

Examples should illustrate the real contract, not an idealized version of it.

### 9.5 Keep Documentation Proportional

A simple behavior change may need one updated sentence. A major architectural change may require an updated diagram, a decision record, and revised technical guidance.

Do not create a lengthy document when a concise reference would serve the reader better.

Conversely, do not reduce an important operational constraint to a vague sentence if engineers need detailed instructions to use the system safely.

The correct level of detail depends on the information's complexity, consequences, and intended audience.

## 10. A Practical Example: Changing an API Contract

Consider an existing endpoint:

```python
@router.post("/users")
def create_user(name: str, email: str):
    ...
```

Suppose the requirement changes so that callers may optionally specify a preferred language.

The conceptual request now includes:

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "preferred_language": "en"
}
```

This example illustrates a possible request shape, not a complete API implementation.

### Step 1: Identify the Contract Change

The endpoint accepts a new optional field.

Determine its valid values, default behavior, and validation rules before documenting them.

### Step 2: Identify the Affected Information

Potentially affected documentation includes:

- API request-field descriptions.
- Request examples.
- Registration or integration instructions.
- Any documented language-selection behavior.

A general architecture document may not need an update if the change does not affect architectural responsibilities.

### Step 3: Update the Authoritative Explanation

Add the new field to the existing API documentation, including its type, optionality, and default behavior where these have been established.

Avoid creating a separate document solely to explain one additional field if the existing API reference is the appropriate location.

### Step 4: Verify the Example

Check that the sample request matches the actual interface and that the documented behavior agrees with the implementation.

If omitted values trigger a default, document that behavior only after confirming it.

### Step 5: Consider the Broader Impact

Determine whether the field changes any relevant integration or onboarding instructions.

Do not update unrelated documents simply because they mention user registration.

### Step 6: Summarize the Change

A useful summary might state:

> Added optional preferred-language input to user registration and updated the API reference to describe the field and its supported behavior.

This explains the meaningful outcome rather than merely saying that code and documentation were modified.

## 11. Keeping Documentation Consistent with Reality

Documentation can become incorrect even when nobody deliberately changes it.

Common causes include:

- Requirements evolve.
- Interfaces change.
- Examples are copied and modified inconsistently.
- A decision is superseded without updating its rationale.
- Configuration names change.
- Generated reference material is not regenerated.
- Engineers document intended behavior but never verify the implemented behavior.

A maintenance process should therefore include explicit consistency checks.

### 11.1 Verify Observable Facts

For behavior that can be exercised, compare the documentation against the actual interface or supported execution path.

For example, verify a documented command or API parameter rather than relying only on memory.

### 11.2 Check Cross-References

When a file is renamed or a document is reorganized, review references to it.

A correct explanation with a broken link can still prevent readers from finding the information.

### 11.3 Review Superseded Decisions

When a technical decision changes, preserve useful historical context where appropriate and make the current decision clear.

Do not leave two documents appearing to prescribe incompatible approaches without explaining which is authoritative.

### 11.4 Distinguish Current Instructions from Historical Context

Historical information can be valuable, but it should not be mistaken for current operating guidance.

Label historical decisions, deprecated behavior, and superseded instructions clearly when they remain relevant.

## 12. Documentation Quality Review

Before completing a change that affects technical information, review the relevant documentation.

Use these questions:

- [ ] Does the documentation describe the actual behavior?
- [ ] Are required and optional inputs described correctly?
- [ ] Are constraints and defaults accurate?
- [ ] Do examples match the current interface?
- [ ] Are commands, configuration names, and file paths correct?
- [ ] Are affected technical decisions still valid?
- [ ] Have relevant links and cross-references been checked?
- [ ] Has unnecessary duplicated explanation been avoided?
- [ ] Is the level of detail appropriate for the reader?
- [ ] Can another engineer use the documentation without relying on unstated assumptions?

Not every change requires every check. Select the checks relevant to the affected information.

For example, an internal algorithm change may require updating a design explanation but not a public API example.

## 13. Production Engineering Perspective

In a production engineering organization, technical documentation is part of the system's maintainability.

Outdated documentation can cause:

- Incorrect integration with an API.
- Repeated investigation of already-understood behavior.
- Incorrect development or troubleshooting procedures.
- Misunderstanding of architectural constraints.
- Unintentional violations of existing compatibility requirements.
- Difficulty understanding why an important technical decision was made.

However, excessive documentation can also be harmful. Large collections of duplicated or low-value explanations are difficult to keep current and make authoritative information harder to locate.

A practical documentation strategy balances three goals:

1. **Accuracy:** Information agrees with the current system.
2. **Discoverability:** Engineers can find the information when needed.
3. **Maintainability:** The information can be updated without excessive duplication.

A small amount of precise, well-located documentation is often more useful than a large collection of overlapping documents.

The goal is not maximum documentation volume. It is reliable technical knowledge at the points where engineers need it.

## 14. Common Mistakes

### Updating Code but Ignoring the Interface Documentation

**Why it fails:** Callers may continue using outdated assumptions.

**Better approach:** Review the documented contract whenever externally visible behavior changes.

### Documenting Intended Behavior Without Verifying It

**Why it fails:** The documentation may describe a feature that the implementation does not actually provide.

**Better approach:** Compare the stated behavior with the implementation and relevant observable evidence.

### Repeating the Same Instructions in Multiple Documents

**Why it fails:** Copies can become inconsistent when one is updated and another is forgotten.

**Better approach:** Maintain one authoritative explanation and use links or concise summaries elsewhere.

### Creating Documentation for Every Small Change

**Why it fails:** Low-value documentation increases maintenance effort without necessarily improving understanding.

**Better approach:** Update documentation when the change affects useful technical knowledge.

### Writing Vague Statements

**Why it fails:** Readers cannot determine precisely what behavior or constraint is being described.

**Better approach:** Use concrete, verifiable language and state important conditions explicitly.

### Leaving Historical Decisions Looking Current

**Why it fails:** Future engineers may follow an approach that has been superseded.

**Better approach:** Mark superseded decisions clearly and identify the current approach.

### Forgetting Examples and Cross-References

**Why it fails:** The main explanation may be correct while the examples or links still lead readers in the wrong direction.

**Better approach:** Review dependent examples and links whenever the change affects them.

### Treating Documentation as a Substitute for Tests

**Why it fails:** Prose does not automatically verify executable behavior.

**Better approach:** Use documentation to explain the system and tests to check specified behavior. Keep both aligned.

## 15. Interview Questions and Answers

### Q1. Why is technical documentation necessary when source code already exists?

Source code describes implementation, but it may not explain intended use, important constraints, architectural rationale, or operational procedures. Documentation makes that knowledge easier to discover and maintain.

### Q2. When should a code change trigger a documentation update?

When it makes documented behavior incorrect, incomplete, or materially less useful. Changes to interfaces, configuration, architectural responsibilities, and operating procedures are common examples.

### Q3. What is change traceability in the context of technical documentation?

It is the ability to identify which technical information is affected by an implementation change and ensure that the relevant documentation and records remain consistent with the resulting system.

### Q4. Why should a project avoid duplicating the same technical explanation across multiple documents?

Duplicated explanations create multiple sources that must be kept synchronized. A single authoritative explanation with appropriate cross-references is usually easier to maintain.

### Q5. What should a technical decision record contain?

It should explain the context, the decision, important alternatives, the main trade-offs, and the consequences or constraints that follow.

### Q6. Does every implementation change require a documentation change?

No. A change that does not affect useful documented information may not require one. The decision should depend on the behavior, constraints, and instructions affected.

### Q7. How do you determine whether documentation is accurate?

Compare it with the implementation, relevant observable behavior, established requirements, and other reliable evidence. Check examples, constraints, defaults, and cross-references as appropriate.

### Q8. What is the relationship between documentation and testing?

Documentation explains behavior, use, constraints, and rationale. Tests provide executable checks of specified behavior. They complement one another, and neither should be treated as a complete substitute for the other.

### Q9. How should a team handle an outdated technical decision record?

Make the current decision clear and preserve useful historical context where appropriate. Readers should not have to guess which incompatible instruction is authoritative.

## 16. Practical Assignment

### Scenario

An existing API supports account registration. A new implementation adds an optional `preferred_language` field and changes the default behavior for requests that omit it.

The implementation has been updated, but the API reference, onboarding guide, and an older technical decision record may contain outdated information.

### Part A — Impact Analysis

Identify:

1. Which aspects of the API contract changed.
2. Which documentation sources may describe the affected behavior.
3. Which facts must be verified before writing the update.
4. Which documents probably do not require changes and why.

Distinguish confirmed facts from assumptions.

### Part B — Documentation Plan

Prepare a concise plan that states:

- The authoritative location for the updated API description.
- The examples that need to be reviewed.
- Whether the onboarding guide requires a change.
- Whether the technical decision record should be updated, marked as superseded, or left unchanged.
- Which cross-references should be checked.

### Part C — Consistency Review

After updating the documentation in a practice project, explain:

- How you verified the documented behavior.
- How you avoided duplicating the same explanation.
- How you preserved useful historical context.
- What you would do if the implementation and an existing test disagreed about the intended behavior.

**Completion criterion:** You can trace a meaningful implementation change to its documentation impact, update the appropriate authoritative information, and explain why unrelated documents did not need changes.

## 17. Revision Questions

Answer these without looking back at the chapter:

1. What information does technical documentation provide that source code may not explain clearly?
2. How do project overviews, API references, architecture documents, and decision records differ?
3. What makes a documentation update necessary?
4. How can an engineer trace an implementation change to affected technical information?
5. Why is one authoritative explanation usually easier to maintain than several duplicated copies?
6. How should an engineer handle an important assumption that has not been verified?
7. Why should examples and cross-references be reviewed alongside prose?
8. How can a team preserve historical technical decisions without confusing them with current instructions?
9. Why are documentation and tests complementary?
10. How should documentation effort be scaled to the impact of a change?

## 18. Key Takeaways

- Technical documentation preserves knowledge needed to understand, use, and maintain a system.
- Different documentation types serve different reader needs.
- Documentation should change when implementation changes make existing technical information incorrect or materially incomplete.
- Change traceability connects implementation changes to affected interfaces, constraints, instructions, and decisions.
- Maintaining documentation alongside implementation reduces the risk of outdated information.
- Clear, verifiable statements are more useful than vague descriptions.
- One authoritative explanation with appropriate cross-references reduces duplication.
- Examples, commands, and links must remain consistent with the current system.
- Documentation does not replace executable tests.
- Good documentation balances accuracy, discoverability, and maintainability rather than maximizing volume.

## 19. Further Reading

- [Chapter 02 — Requirements and Acceptance Criteria](02-Requirements-and-Acceptance-Criteria.md)
- [Chapter 04 — Incremental Implementation Workflow](04-Incremental-Implementation-Workflow.md)
- [Chapter 05 — Working with Existing Codebases](05-Working-with-Existing-Codebases.md)
- [Chapter 06 — Dependency and Build Workflow](06-Dependency-and-Build-Workflow.md)
- ENG-03 — Software Engineering Principles
- ENG-04 — Version Control and Collaborative Development
- ENG-08 — Development Quality

---

**End of Document:** `07-Documentation-and-Change-Traceability.md`
