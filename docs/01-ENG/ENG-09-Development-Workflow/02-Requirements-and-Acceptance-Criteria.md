
# 02 — Requirements and Acceptance Criteria

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain the difference between a requirement and an acceptance criterion.
- Identify ambiguity in software requests and ask useful clarification questions.
- Translate a high-level request into clear, observable expected behavior.
- Distinguish functional requirements from constraints and quality expectations.
- Write acceptance criteria that can be evaluated consistently.
- Recognize incomplete, contradictory, or unnecessarily restrictive requirements.
- Understand how requirements influence planning, implementation, and validation.
- Handle changing requirements without losing control of the intended scope.

## Prerequisites

You should understand the basic software development lifecycle described in [01 — Software Development Lifecycle](01-Software-Development-Lifecycle.md).

The following related topics may also be useful:

- **ENG-03 — Software Engineering Principles:** Maintainability and software quality.
- **ENG-08 — Development Quality:** Testing and validation practices.

These topics provide supporting context. This chapter focuses on clarifying expected behavior and defining conditions for completion.

## Estimated Reading Time

18–25 minutes.

## 1. Before We Start

Imagine that a product manager asks you to implement this feature:

> Add search to the application.

You understand the general idea, but several important questions remain unanswered.

- What information should users be able to search?
- Should the search match complete words or partial text?
- Should results update while the user types?
- How should the application behave when there are no matches?
- Should search ignore differences in letter casing?
- How much data must the feature support?

Two engineers could implement different solutions and both believe they followed the request.

The problem is not necessarily their coding ability. The request does not yet define enough expected behavior to guide a consistent implementation.

This is why engineers need to clarify requirements and establish acceptance criteria before committing to a solution.

## 2. What Is a Requirement?

A **requirement** describes a capability, behavior, constraint, or quality that a software system must satisfy.

Requirements establish what the system needs to achieve or what conditions it must respect.

For example:

- Users must be able to search their own tasks.
- Search results must exclude tasks the user is not authorized to access.
- The application must display a useful message when no tasks match.
- Search results should be returned within an agreed response-time target under specified conditions.

These statements describe different expectations. Some concern functionality, while others concern security or performance.

Requirements help establish a shared understanding between the people requesting a change and the engineers implementing it.

### 2.1 Why Requirements Matter

Without clear requirements, engineers may:

- Implement behavior that users did not request.
- Miss important edge cases.
- Make incompatible assumptions.
- Estimate work incorrectly.
- Validate the wrong behavior.
- Introduce unnecessary complexity.
- Disagree about whether the work is complete.

Clear requirements reduce avoidable uncertainty. They cannot eliminate every unknown, and they should not attempt to prescribe every implementation detail.

A useful requirement defines the necessary outcome while leaving appropriate engineering decisions to the implementation process.

## 3. Requirement Versus Acceptance Criterion

A requirement describes what the system needs to satisfy. An **acceptance criterion** defines a condition that can be checked to determine whether the relevant requirement has been met.

Consider this requirement:

> Users can search their tasks by title.

Possible acceptance criteria include:

- A search for a matching title returns the corresponding task.
- A search with no matching tasks displays an appropriate empty state.
- Search results include only tasks the current user is authorized to access.

The requirement establishes the capability. The criteria make important aspects of its expected behavior explicit.

| Aspect | Requirement | Acceptance criterion |
|---|---|---|
| Primary purpose | Define a necessary capability or constraint | Establish an observable condition for acceptance |
| Typical question | What must the system do or satisfy? | What evidence demonstrates that it meets the expectation? |
| Example | Users can search tasks by title | Searching for an existing task title returns the corresponding authorized task |
| Relationship | May be supported by several criteria | Usually evaluates a particular aspect of a requirement |

Acceptance criteria do not need to be automated tests. They can be evaluated through different forms of evidence, depending on the requirement.

However, they should be sufficiently clear that different people can evaluate the result consistently.

## 4. From a Vague Request to a Clear Requirement

A practical approach is to refine a request in stages.

```text
Initial Request
      |
      v
Identify the Intended Outcome
      |
      v
Discover Missing Information
      |
      v
Clarify Expected Behavior
      |
      v
Define Requirements
      |
      v
Write Acceptance Criteria
      |
      v
Review and Confirm
```

This is a reasoning aid rather than a mandatory sequence. Clarification may reveal new questions, and acceptance criteria may expose gaps in the original requirement.

### Example: Improving Task Search

Initial request:

> Add search to the task-management application.

Step 1 — Identify the outcome.

Users need to locate relevant tasks without manually scanning the entire task list.

Step 2 — Identify missing information.

Questions include:

- Is the search limited to task titles?
- Can users search descriptions as well?
- Should matching ignore letter casing?
- What should happen when no task matches?
- Which tasks is the user authorized to see?

Step 3 — Clarify the expected behavior.

For this example, assume the product owner confirms:

- Search is based on task titles.
- Matching is case-insensitive.
- Results are restricted to tasks the current user can access.
- A useful empty state appears when no task matches.

Step 4 — Write the requirement.

> Users can search the titles of tasks they are authorized to access, using case-insensitive matching.

Step 5 — Define acceptance criteria.

- Searching for an existing task title returns the matching authorized task.
- Searching with different letter casing still finds the task.
- Tasks outside the user's authorized scope are not exposed.
- A search with no matching tasks displays the agreed empty state.

The example is now more useful because the expected behavior is clearer.

The implementation details—such as the database query, indexing strategy, or frontend component—can be decided separately unless they are explicit constraints.

## 5. Functional Requirements and Quality Constraints

Not every requirement describes a user-visible feature.

### 5.1 Functional Requirements

A **functional requirement** describes what the system must do.

Examples:

- A user can create a task.
- A user can mark a task as completed.
- The application returns matching tasks for a search request.
- An authorized administrator can deactivate an account.

Functional requirements focus on system behavior.

### 5.2 Quality Requirements and Constraints

Quality requirements describe characteristics such as performance, reliability, accessibility, or usability. Constraints establish boundaries within which the solution must operate.

Examples:

- Search results should be returned within a specified response-time target under defined load conditions.
- The application must enforce the existing access-control policy.
- A supported API must remain compatible with existing clients.
- A feature must operate within an agreed resource limit.

Quality expectations should be made measurable when practical.

For example, "search must be fast" is difficult to evaluate. A more useful statement defines a response-time target, the measurement method, the expected workload, and the relevant operating conditions.

Do not invent targets merely to make a requirement appear precise. Targets should be agreed upon and justified by the actual product needs.

### 5.3 Why the Distinction Matters

Suppose a search feature returns correct results but takes ten seconds for a typical request.

Its functional behavior may be correct, while its performance expectation remains unsatisfied.

Similarly, a feature may work correctly for one user but expose another user's private tasks. Functional behavior alone is not enough to establish acceptable behavior.

Requirements should account for the relevant quality and security constraints without turning every possible characteristic into a separate requirement.

## 6. Characteristics of Useful Requirements

A useful requirement should have several properties.

### 6.1 Clear

The wording should have a reasonably consistent interpretation.

Weak:

> The application should handle tasks properly.

Better:

> A user can mark an existing task as completed, and the updated status is displayed in the task list.

The second statement describes a specific capability and an observable result.

### 6.2 Specific Enough to Guide Implementation

A requirement should contain enough information to distinguish acceptable behavior from unacceptable behavior.

Weak:

> Users can upload files.

Potentially relevant questions include which file types are allowed, the maximum permitted size, and what happens when an upload fails.

Not every detail must appear in the first sentence. Important rules should be captured somewhere in the agreed requirements and acceptance criteria.

### 6.3 Verifiable

There should be a practical way to determine whether the requirement is satisfied.

Weak:

> The interface should feel modern.

More useful:

> The interface must follow the approved design specification.

If the team has agreed on measurable usability or accessibility criteria, those should also be recorded.

### 6.4 Consistent

Requirements should not contradict one another.

For example:

- One requirement states that a task can be edited only by its owner.
- Another states that every logged-in user can edit every task.

Unless an explicit exception resolves the conflict, these requirements are inconsistent.

The conflict should be clarified before implementation relies on either interpretation.

### 6.5 Necessary

A requirement should support a genuine user need, business objective, technical constraint, or other justified goal.

Unnecessary requirements can increase implementation cost and constrain future decisions without providing corresponding value.

### 6.6 Feasible

The proposed behavior should be achievable within the actual technical, operational, and organizational constraints—or the constraints should be discussed and revised.

Feasibility does not mean rejecting difficult requirements automatically. It means understanding the implications before committing to an approach.

### 6.7 Appropriately Scoped

Requirements should define the intended change without silently expanding it into unrelated features.

For example, a request to add task search does not automatically authorize building a recommendation engine, redesigning the task-management system, or replacing the existing database.

Related improvements may be proposed separately.

## 7. Writing Acceptance Criteria

Acceptance criteria should describe outcomes that can be evaluated, not merely restate the implementation task.

Consider:

> Implement the task-search API.

This describes work to perform. It does not clearly state what successful behavior means.

A more useful set of criteria describes the expected results.

### Example: Task Search

**Requirement**

Users can search task titles within their authorized scope.

**Acceptance criteria**

| Scenario | Expected result |
|---|---|
| A matching task exists | The matching authorized task appears in the results |
| The query differs in letter casing | Matching still works |
| No task matches | An appropriate empty state is displayed |
| A task belongs to an inaccessible scope | Its information is not exposed |
| The search query is empty | The agreed empty-query behavior occurs |

The final row illustrates why clarification matters. An empty query might display the complete task list, return no results, or be handled in another explicitly agreed way. The engineer should not silently choose a behavior when the decision materially affects the product.

### 7.1 Scenario-Based Criteria

Acceptance criteria can be written using a simple structure:

- **Given:** The initial conditions.
- **When:** The action or event.
- **Then:** The expected result.

Example:

```text
Given a user has access to a task titled "Prepare Report"
When the user searches for "prepare report"
Then the matching task appears in the results
```

This structure can make preconditions, actions, and outcomes easier to distinguish.

It is especially useful when behavior depends on user permissions, application state, or specific conditions.

It is not mandatory for every requirement. A concise table or straightforward statement may be clearer for simpler cases.

### 7.2 Avoid Overly Implementation-Specific Criteria

Consider this criterion:

> The application must execute a particular SQL query using a specific database function.

That may be appropriate if the implementation constraint is intentional and approved. Otherwise, it unnecessarily binds the requirement to one solution.

A behavior-oriented criterion is usually more flexible:

> The search returns matching authorized tasks according to the agreed matching rules.

Engineers can then choose an appropriate implementation while preserving the required behavior.

### 7.3 Avoid Ambiguous Acceptance Criteria

Weak:

> Search should work correctly.

Questions remain about matching behavior, access control, empty results, and error handling.

Better criteria identify the relevant conditions and expected outcomes.

The objective is not to create an exhaustive list of every theoretical possibility. It is to cover the scenarios that matter for the requirement's scope and risk.

## 8. Handling Edge Cases and Uncertainty

Normal scenarios rarely tell the complete story.

A requirement may work for ordinary input but behave incorrectly under unusual or invalid conditions.

For a file-upload feature, relevant questions might include:

- What happens when the file exceeds the permitted size?
- What happens when the file type is not allowed?
- What happens if storage is temporarily unavailable?
- What happens if the upload is interrupted?
- What happens when the user lacks permission?

For a task-search feature:

- What happens with an empty query?
- How should leading or trailing spaces be handled?
- What happens when no tasks match?
- How are access restrictions enforced?
- What behavior is expected for very long queries?

These questions help reveal missing requirements.

### 8.1 Prioritize Meaningful Edge Cases

Not every theoretical input needs a separate acceptance criterion.

Prioritize scenarios according to:

- Potential impact if behavior is incorrect.
- Likelihood of occurrence.
- Security or privacy implications.
- Frequency of use.
- Complexity of the affected behavior.
- Existing system constraints.

Security-sensitive cases deserve particular attention even when they are less common.

### 8.2 Record Unresolved Questions

If a requirement cannot yet be clarified, make the uncertainty visible.

For example:

> Open question: Should task search include task descriptions, or only titles?

This is better than silently choosing one interpretation and treating it as approved.

If the uncertainty affects architecture, security, cost, or the acceptance of the feature, resolve it before committing to a design that depends on the answer.

For lower-risk details, the team may agree on a temporary assumption and document it explicitly.

## 9. Requirements and Scope Control

Requirements establish the intended boundaries of a change.

Suppose the original request is to add search by task title.

During implementation, an engineer proposes adding:

- Search by description.
- Advanced filters.
- Saved searches.
- Search recommendations.
- A redesigned task list.

Some additions may be useful, but they are not automatically part of the original request.

Uncontrolled expansion can increase implementation time, introduce additional failure modes, and delay the original capability.

A disciplined approach is to distinguish:

- **Required scope:** What must be delivered for the agreed change to be accepted.
- **Optional improvements:** Additional ideas that may provide value.
- **Dependencies:** Work that must be completed to satisfy the requirement.
- **Unresolved decisions:** Questions that need clarification.

When new information changes the requirement, update the agreed scope and acceptance criteria accordingly.

Scope control does not mean rejecting all additional ideas. It means making their costs and benefits explicit rather than allowing the work to expand unnoticed.

Detailed task decomposition and dependency planning belong to [03 — Task Breakdown and Work Planning](03-Task-Breakdown-and-Work-Planning.md).

## 10. Requirements in Existing Applications

When changing an existing application, requirements must account for behavior that already exists.

A new feature can satisfy its own criteria while unintentionally breaking another capability.

For example, changing task-search logic might return the correct results for one user while ignoring an existing permission restriction.

Before finalizing requirements, consider:

- Existing behavior that must remain unchanged.
- Interfaces or consumers that depend on the current behavior.
- Compatibility expectations.
- Security and access-control rules.
- Relevant failure scenarios.
- Documentation that may become inaccurate.

These considerations help distinguish the new behavior from the behavior that must be preserved.

Understanding unfamiliar modules and tracing existing behavior are covered in [05 — Working with Existing Codebases](05-Working-with-Existing-Codebases.md).

## 11. Changing Requirements During Development

Requirements are not always stable.

New information may emerge after implementation begins. A stakeholder may clarify a business rule, an integration may impose a constraint, or validation may expose an incorrect assumption.

A useful response is to evaluate the change rather than automatically accepting or rejecting it.

Consider:

1. What new information has emerged?
2. Which requirement or assumption does it affect?
3. Does the change affect scope, design, dependencies, or risk?
4. Which acceptance criteria need to change?
5. What existing work must be revisited?
6. Who needs to agree to the revised expectation?

For example, suppose task search was initially defined as title-only search, but users later request description search as well.

That change may affect query behavior, data access, performance, and validation.

The team should assess those implications and update the intended behavior before treating the additional capability as part of the agreed scope.

### Feedback Is Not a Failure

A requirement that changes because of new information is not necessarily evidence of poor planning.

The important distinction is between a deliberate change based on new understanding and uncontrolled changes that are never evaluated or communicated.

The lifecycle remains useful because it provides a way to revisit requirements and planning when circumstances change.

## 12. Production Engineering Perspective

Requirements and acceptance criteria influence several downstream engineering decisions.

### 12.1 Implementation Decisions

Clear expected behavior helps engineers decide which components need to change and which existing behaviors must be preserved.

Poorly specified requirements can force engineers to guess about product behavior while making architectural decisions.

### 12.2 Validation Effort

Acceptance criteria provide a basis for deciding what needs to be validated.

A requirement involving authorization may need evidence that both permitted and prohibited access paths behave correctly.

A performance requirement needs a measurement approach and defined conditions rather than a simple visual inspection.

The validation method should match the requirement.

### 12.3 Risk Management

Requirements involving payments, authentication, personal data, or permissions deserve particular attention because an incorrect interpretation may have serious consequences.

For these requirements, clarify assumptions and expected failure behavior before implementation decisions become difficult to change.

### 12.4 Traceability

For a meaningful change, engineers should be able to connect the intended behavior with the implementation and the evidence used to evaluate it.

Traceability does not require a large formal document for every task. The amount of recorded information should be proportionate to the change's complexity, risk, and organizational needs.

The broader lifecycle context is covered in [01 — Software Development Lifecycle](01-Software-Development-Lifecycle.md). Maintaining documentation alongside implementation changes is covered in [07 — Documentation and Change Traceability](07-Documentation-and-Change-Traceability.md).

## 13. Common Mistakes and Misconceptions

### Mistake 1: Treating a Feature Name as a Complete Requirement

"Add search" names a capability but leaves important behavior unspecified.

**Better approach:** Clarify the intended outcome, matching rules, relevant constraints, and important edge cases.

### Mistake 2: Writing Acceptance Criteria That Merely Repeat the Requirement

"Users can search tasks" does not establish enough evidence to determine whether the behavior is correct.

**Better approach:** Identify observable scenarios and their expected outcomes.

### Mistake 3: Confusing Implementation Tasks with Requirements

"Create a database table" describes a proposed implementation activity, not necessarily the user's required outcome.

**Better approach:** Express the necessary behavior first. Record implementation constraints separately when they are genuinely required.

### Mistake 4: Making Every Requirement Extremely Detailed

Trying to define every implementation detail upfront can waste time and restrict useful engineering decisions.

**Better approach:** Specify behavior and constraints at the level necessary to make decisions and evaluate the result.

### Mistake 5: Ignoring Negative and Unauthorized Scenarios

Valid inputs and successful operations are only part of expected behavior.

**Better approach:** Include relevant invalid, failure, boundary, and authorization scenarios.

### Mistake 6: Assuming Requirements Cannot Change

New evidence can reveal incorrect assumptions or new needs.

**Better approach:** Evaluate changes explicitly, update the agreed expectations, and assess their impact on the work.

### Mistake 7: Silently Resolving Important Ambiguity

An engineer may choose an interpretation simply to keep coding.

**Better approach:** Ask for clarification when the decision materially affects behavior, risk, or scope. Record agreed assumptions when immediate clarification is not possible.

### Mistake 8: Treating Acceptance Criteria as a Guarantee of Quality

Passing the listed criteria does not prove that every possible defect is absent.

**Better approach:** Use acceptance criteria as an important basis for evaluating behavior, alongside the relevant quality and risk considerations.

## 14. Practical Assignment

### Scenario

You are working on a task-management application.

A stakeholder requests:

> Users should be able to archive tasks they no longer need in their active task list.

Your task is to clarify the requirement before implementation.

### Part A — Identify Ambiguity

Write at least six clarification questions.

Consider:

- What archiving means.
- Who is allowed to archive a task.
- Whether archived tasks remain accessible.
- Whether an archived task can be restored.
- How archived tasks appear in search.
- What happens when an unauthorized user attempts the operation.

Do not assume that every question has only one correct answer. The objective is to identify decisions that affect expected behavior.

### Part B — Write the Requirement

Write one concise requirement that captures the agreed behavior.

If a critical decision remains unresolved, state the assumption or open question explicitly rather than inventing an answer.

### Part C — Write Acceptance Criteria

Write at least five criteria.

Include:

- A normal successful scenario.
- A permission-related scenario.
- A scenario involving an archived task.
- A scenario involving restoration or the decision that restoration is unsupported.
- An additional meaningful edge or failure case.

For each criterion, describe the expected observable result.

### Part D — Identify Constraints

List any relevant quality requirements or technical constraints that need clarification.

Explain why each one matters. Do not invent numerical targets without justification.

### Part E — Handle a Requirement Change

Suppose the stakeholder later requests automatic deletion of archived tasks after a specified period.

Explain:

1. Why this is not necessarily a minor implementation detail.
2. Which new decisions need clarification.
3. Which acceptance criteria may need updating.
4. What risks the team should evaluate before agreeing to the change.

**Expected outcome:** You should be able to turn an ambiguous feature request into a clear, reviewable description of expected behavior without prematurely prescribing the implementation.

## 15. Interview Questions with Expected Answers

### Q1. What is the difference between a requirement and an acceptance criterion?

**Expected answer:** A requirement defines a capability, behavior, or constraint that the system must satisfy. An acceptance criterion describes an observable condition that can be evaluated to determine whether the relevant requirement has been met.

### Q2. Why are vague requirements an engineering problem?

**Expected answer:** Different people may interpret them differently, resulting in inconsistent implementations, missed scenarios, rework, and disagreements about completion.

### Q3. What makes an acceptance criterion useful?

**Expected answer:** It describes a clear, relevant, and observable expected outcome that can be evaluated consistently. It should reflect the requirement without unnecessarily prescribing implementation details.

### Q4. Should acceptance criteria always be automated tests?

**Expected answer:** No. They define acceptance conditions, not a mandatory validation mechanism. Depending on the requirement, the evidence may come from automated tests, manual evaluation, inspection, measurement, or other appropriate methods.

### Q5. How would you handle a requirement that has multiple possible interpretations?

**Expected answer:** Identify the ambiguity, assess whether it affects scope or risk, and ask the relevant stakeholder to clarify the expected behavior. If a decision must be deferred, record the assumption and its implications explicitly.

### Q6. What is the difference between a functional requirement and a quality requirement?

**Expected answer:** A functional requirement describes what the system does. A quality requirement describes a characteristic such as performance or reliability, while constraints establish boundaries the solution must respect.

### Q7. Why should requirements include relevant failure and authorization scenarios?

**Expected answer:** A feature may work under normal conditions while behaving incorrectly for invalid input, failures, or unauthorized users. Defining these scenarios helps prevent incomplete or unsafe behavior.

### Q8. How can an engineer avoid scope creep?

**Expected answer:** Distinguish required behavior from optional improvements, make dependencies explicit, and evaluate new requests before incorporating them into the agreed scope.

### Q9. What should happen when requirements change during implementation?

**Expected answer:** Evaluate the new information, determine which requirements and decisions are affected, assess the impact on scope and risk, update the agreed criteria, and revisit relevant work.

### Q10. Can a feature satisfy all acceptance criteria and still contain defects?

**Expected answer:** Yes. Acceptance criteria cover agreed conditions, not every possible failure. Appropriate additional validation and risk-based quality practices remain necessary.

## 16. Quick Revision

A requirement defines what a system must do or satisfy. An acceptance criterion defines an observable condition for evaluating whether the relevant requirement has been met.

A useful requirement is clear, necessary, feasible, consistent, and sufficiently specific to guide implementation. It should avoid prescribing implementation details unless those details are genuine constraints.

To refine an ambiguous request:

**Understand the outcome → Identify uncertainty → Clarify behavior → Define requirements → Write acceptance criteria → Review the scope.**

Acceptance criteria should cover relevant normal, boundary, failure, and authorization scenarios. Their form may vary; the important property is that expected outcomes can be evaluated consistently.

Requirements may change as new information emerges. Evaluate those changes explicitly, update the agreed expectations, and assess their implications.

Finally, acceptance criteria are not a guarantee that all defects have been eliminated. They are one part of a disciplined approach to building and validating software.

## 17. Key Takeaways

- Requirements define the expected capability, behavior, or constraint.
- Acceptance criteria define observable conditions for evaluating a requirement.
- Ambiguous requests should be clarified before important implementation decisions depend on them.
- Requirements should describe necessary outcomes without unnecessarily dictating implementation.
- Quality constraints, negative scenarios, and authorization behavior matter when relevant to the feature.
- Scope changes should be evaluated and communicated rather than introduced silently.
- Acceptance criteria guide validation but do not replace broader quality and risk considerations.

## 18. Further Reading

- [ISO/IEC/IEEE 29148 — Requirements Engineering](https://www.iso.org/standard/72089.html)
- [The Scrum Guide](https://scrumguides.org/scrum-guide.html)

These resources provide additional perspectives on requirements and acceptance. The examples and guidance in this chapter remain focused on the approved ENG-09 scope.
