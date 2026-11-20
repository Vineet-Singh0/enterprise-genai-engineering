
# 04 — Incremental Implementation Workflow

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why implementing software changes incrementally reduces engineering risk.
- Distinguish incremental implementation from completing an entire feature before checking its behavior.
- Identify a useful implementation step from a larger engineering task.
- Understand the relationship between implementation steps, feedback, and validation.
- Recognize when a change is too broad or combines unrelated concerns.
- Keep intermediate application states understandable and manageable.
- Respond appropriately when an implementation step reveals an incorrect assumption.
- Decide when to continue, revise, or reconsider an implementation approach.

## Prerequisites

You should understand:

- [01 — Software Development Lifecycle](01-Software-Development-Lifecycle.md)
- [02 — Requirements and Acceptance Criteria](02-Requirements-and-Acceptance-Criteria.md)
- [03 — Task Breakdown and Work Planning](03-Task-Breakdown-and-Work-Planning.md)

ENG-03 — Software Engineering Principles provides useful context for maintainable changes. ENG-08 — Development Quality owns the detailed practices for testing, debugging, logging, and related validation activities.

This chapter focuses on the workflow used to implement changes incrementally, not on teaching those neighboring concepts again.

## Estimated Reading Time

20–28 minutes.

## 1. Before We Start

Imagine that you need to add task archiving to an existing application.

You decide to make all the changes in one large implementation session:

- Add archive state to the data model.
- Modify the archive operation.
- Update the active task list.
- Add an archive view.
- Change the user interface.
- Update related documentation.

After several hours, the application behaves unexpectedly. Archived tasks disappear from the active list, but some existing task operations also stop working.

Now you must investigate a large collection of related changes to determine which modification introduced the problem.

The difficulty is not necessarily that any individual change was complicated. The problem is that many changes accumulated before you obtained useful feedback.

Consider a different approach.

You first understand the existing behavior. Then you implement a small, meaningful part of the feature, inspect the result, and continue only after obtaining sufficient confidence in that step.

If something fails, the scope of the investigation is easier to narrow.

This is the central idea behind an **incremental implementation workflow**.

## 2. What Is Incremental Implementation?

Incremental implementation is the practice of developing a software change through a sequence of small, understandable steps rather than treating the entire change as one large implementation activity.

Each step should contribute to the intended result while keeping the current state understandable.

A simplified workflow is:

```text
Understand the Next Step
          |
          v
Make a Focused Change
          |
          v
Inspect the Result
          |
          v
Validate Relevant Behavior
          |
          v
Is the Result Acceptable?
       /          \
     Yes           No
      |             |
      v             v
Continue       Investigate and
               Correct or Replan
      |             |
      +<------------+
          |
          v
Review Overall Completion
```

The diagram represents a feedback loop, not a rigid sequence that must be followed identically for every change.

Some implementation steps need only a quick inspection. Others require more extensive validation because they affect critical behavior.

The important principle is to obtain useful feedback before allowing too much uncertain work to accumulate.

## 3. Why Implement in Small Steps?

Software changes are based on assumptions.

An engineer may assume that an existing function behaves in a particular way, that a data model supports a feature, or that two components can be changed independently.

Some assumptions turn out to be incorrect.

When a large amount of implementation is performed before checking those assumptions, the cost of discovering a problem can increase.

Incremental implementation helps manage this uncertainty.

### 3.1 Reduce the Scope of Problems

Suppose you change one focused part of an application and immediately discover unexpected behavior.

The recent change provides a useful starting point for investigation.

If you modify many unrelated components before inspecting the result, there are more possible explanations to consider.

Smaller changes do not guarantee that a problem will be easy to diagnose, but they can reduce the number of simultaneous changes that need to be examined.

### 3.2 Obtain Feedback Earlier

A change may compile successfully but still behave incorrectly.

Early inspection and appropriate validation reveal whether the implementation is moving toward the intended outcome.

Feedback can come from different sources:

- Compiler or interpreter errors.
- A failing automated check.
- Manual observation of application behavior.
- A reviewer identifying an incorrect assumption.
- An integration component rejecting an unexpected input.
- A mismatch between the implementation and the agreed requirement.

Different forms of feedback reveal different problems. No single form establishes that the entire feature is correct.

### 3.3 Limit Unnecessary Rework

Suppose a feature depends on a data-model assumption that turns out to be wrong.

If that assumption is checked early, the engineer may need to revise only a small part of the implementation.

If several dependent components have already been built around it, correcting the assumption may require changes throughout the feature.

Incremental implementation helps expose important assumptions before they influence too much downstream work.

### 3.4 Make Progress Easier to Understand

A large implementation can be difficult to review because many decisions and changes are mixed together.

A sequence of focused steps makes it easier to explain:

- What changed.
- Why the change was needed.
- What behavior it affects.
- What remains to be done.
- What evidence supports continuing.

This is useful both for individual engineers and for teams.

## 4. The Mental Model: Change, Observe, Learn

Think of implementation as a repeated cycle of controlled change and observation.

```text
Current Understanding
        |
        v
Focused Change
        |
        v
Observed Result
        |
        v
Updated Understanding
        |
        v
Next Change
        |
        +------------------+
```

The cycle is valuable because implementation is also a way of learning about a system.

For example, inspecting an existing task operation may reveal that archive state is already supported. Implementing a small change may reveal an unexpected dependency. Validating a behavior may expose an incomplete requirement.

The next step should reflect what has actually been learned.

This does not mean changing the plan whenever a minor detail appears. It means using relevant evidence to decide whether the current approach remains appropriate.

## 5. Choosing a Useful Implementation Step

A good implementation step should be focused enough to understand, but meaningful enough to justify the effort.

Consider the task:

> Add archive support to the task-management application.

This task may contain several distinct responsibilities.

A possible sequence is:

1. Confirm how the application currently represents task state.
2. Establish the archive-state behavior required by the feature.
3. Implement the archive operation.
4. Update the active task-list behavior.
5. Implement any required archive-view behavior.
6. Validate the combined user flow.
7. Update the relevant documentation.

This is an illustrative sequence. The actual steps depend on the existing system and approved requirements.

### 5.1 Keep Each Step Focused

A focused change has a clear purpose.

For example:

> Update the active task query to exclude tasks marked as archived.

This is easier to reason about than:

> Update task handling, redesign the interface, change the API, and improve task filtering.

The second description combines several concerns. If the result is incorrect, determining which concern caused the problem may require more investigation.

### 5.2 Keep Steps Meaningful

Incremental implementation does not require splitting every line of code into a separate step.

Consider these actions:

1. Open a source file.
2. Move the cursor.
3. Add one statement.
4. Save the file.

These actions do not necessarily represent useful implementation milestones.

A meaningful step should produce a result that can be inspected or that establishes progress toward the required behavior.

### 5.3 Avoid Unrelated Changes

Suppose you are implementing task archiving and notice that an unrelated user-interface component could be refactored.

Combining that refactoring with the archive feature may increase the scope of the change without helping deliver the requested behavior.

A better approach is to evaluate the refactoring separately.

If it is necessary for the archive feature, explain the dependency. If it is merely an improvement, consider handling it as separate work.

This makes the reason for each change easier to understand.

## 6. A Practical Incremental Workflow

The following process provides a repeatable way to approach an implementation task.

### Step 1: Confirm the Intended Behavior

Before making changes, understand the requirement and the relevant acceptance criteria.

Ask:

- What behavior must change?
- What existing behavior must remain intact?
- What constraints affect the implementation?
- What would indicate that this step is complete?

The detailed techniques for clarifying requirements belong to Chapter 02.

### Step 2: Understand the Immediate Context

Identify the relevant code, interfaces, and assumptions for the next step.

Do not assume that the first file you find is the only component involved.

For example, a task-archive operation might interact with a data model, an API handler, and a task-list query.

The objective is to understand enough context to make the next change responsibly.

Detailed project exploration belongs to [05 — Working with Existing Codebases](05-Working-with-Existing-Codebases.md).

### Step 3: Select the Next Focused Change

Choose the smallest meaningful change that advances the intended outcome without creating unnecessary fragmentation.

For example:

> Implement the operation that records a task as archived.

Before implementing it, establish the relevant assumptions and expected behavior.

### Step 4: Make the Change

Implement the selected step without introducing unrelated modifications.

Keep the implementation aligned with the approved requirements and the existing system's constraints.

If the step reveals that the original plan is incomplete, do not force the code to fit an assumption that is no longer justified.

### Step 5: Inspect the Result

Review what changed.

Useful questions include:

- Did the intended modification occur?
- Were unexpected files or behaviors affected?
- Does the result remain consistent with the existing design?
- Did the implementation introduce assumptions that need attention?

Inspection helps identify obvious problems before proceeding.

It is not a substitute for the validation appropriate to the change.

### Step 6: Validate Relevant Behavior

Choose validation activities that provide evidence about the changed behavior.

For a task-archive operation, this might involve checking that:

- A permitted archive request changes the task's archive state.
- An invalid task identifier is handled appropriately.
- An unauthorized request does not archive the task.

The actual scenarios must follow the approved requirements and applicable security constraints.

Detailed testing and debugging methods belong to ENG-08 — Development Quality.

### Step 7: Evaluate the Feedback

If the result behaves as expected, determine whether the next step can proceed.

If it does not, investigate the discrepancy.

Possible responses include:

- Correcting the implementation.
- Revisiting an incorrect assumption.
- Clarifying a requirement.
- Revising the task breakdown.
- Choosing a different implementation approach.

The correct response depends on what the evidence reveals.

### Step 8: Continue Until the Intended Change Is Complete

Repeat the cycle for the remaining work.

Do not assume that validating one step establishes the correctness of the entire feature.

The combined behavior may introduce problems that are not visible when each part is examined independently.

### Step 9: Review the Complete Change

Once the planned work is complete, evaluate the feature against its requirements and relevant completion conditions.

Confirm that the pieces work together and that necessary supporting work has been completed.

The feature should be considered complete only when the agreed conditions have been satisfied.

## 7. Example: Implementing Task Archiving

Consider an application in which users can create and manage tasks.

The requirement is:

> Users can archive tasks they no longer need in their active task list.

Assume that the relevant acceptance criteria have already been agreed upon.

### 7.1 An Uncontrolled Approach

An engineer immediately changes the data model, archive endpoint, active task query, interface, and documentation.

After implementation, the application shows inconsistent behavior.

Possible causes include:

- The archive state was not persisted correctly.
- The active-list query ignores the new state.
- The interface sends an incorrect request.
- Existing task behavior was unintentionally changed.

Because many components changed before feedback was obtained, the engineer must investigate a large set of possible interactions.

### 7.2 An Incremental Approach

A more controlled plan might look like this:

| Step | Focus | Evidence to inspect |
|---|---|---|
| 1 | Understand the existing task state and retrieval behavior | Current model and query behavior |
| 2 | Establish the archive-state representation | Agreement between the required behavior and the chosen representation |
| 3 | Implement the archive operation | The operation produces the expected state transition |
| 4 | Update active-list retrieval | Archived tasks are excluded as required |
| 5 | Connect the relevant interface behavior | The user action reaches the correct operation |
| 6 | Validate the complete user flow | The combined behavior satisfies the agreed criteria |
| 7 | Update affected documentation | The documented behavior matches the implementation |

This plan allows the engineer to inspect the results of meaningful changes before moving on.

It does not require every step to be implemented in a separate session or committed independently. The appropriate grouping depends on the codebase and the team's workflow.

### 7.3 What If Step 2 Reveals a Problem?

Suppose the existing data model already contains an archive flag, but the application uses it inconsistently.

The engineer should not automatically introduce another field.

Instead:

1. Investigate the existing representation.
2. Determine whether it can satisfy the requirement.
3. Identify the actual missing behavior.
4. Revise the planned work.
5. Continue with the smallest justified change.

Incremental implementation supports better decisions because it creates opportunities to revise assumptions before unnecessary changes accumulate.

## 8. Handling Failures and Unexpected Results

Not every implementation step will succeed.

The important skill is to respond to the evidence rather than continuing blindly.

### 8.1 When the Code Does Not Run

A compilation or execution failure indicates that the current state has a problem that needs investigation.

Do not continue building additional behavior on top of a state you do not understand.

Determine whether the failure is related to the latest change, an existing issue, a dependency, or another environmental condition.

The detailed debugging process belongs to ENG-08.

### 8.2 When the Code Runs but Behavior Is Incorrect

Successful execution does not establish that the required behavior is correct.

For example, the archive endpoint may return a success response while the task remains visible in the active list.

The engineer should identify the discrepancy between the observed and expected behavior and investigate the relevant components.

Depending on the findings, the correction may involve the archive operation, persistence behavior, retrieval logic, or a misunderstood requirement.

### 8.3 When a New Assumption Is Discovered

Suppose implementation reveals that the existing application treats archived tasks as completed tasks.

That behavior may conflict with the intended meaning of archiving.

The engineer should clarify the intended semantics and assess the implications before making a change that could affect existing users.

A new discovery may require revisiting the requirement or plan, not merely changing code.

### 8.4 When the Scope Grows

Suppose the implementation reveals that archiving could also support automatic deletion.

That possibility does not make automatic deletion part of the original requirement.

Evaluate it separately and obtain the appropriate agreement before expanding the scope.

The goal is controlled adaptation, not uncontrolled feature growth.

## 9. How Much Validation Is Enough?

Incremental implementation depends on feedback, but not every step requires the same validation effort.

A small internal change may need a quick inspection and a focused check. A change involving authentication, financial operations, or sensitive data may require more extensive evidence.

The amount of validation should reflect:

- The impact of an incorrect result.
- The complexity of the changed behavior.
- The number of affected components.
- The uncertainty of the implementation.
- The relevant acceptance criteria.
- Existing quality and security requirements.

There is a trade-off.

Too little validation allows problems to accumulate. Excessive validation of every trivial intermediate action can slow progress without providing meaningful additional confidence.

The objective is to obtain enough relevant evidence to make a responsible decision about the next step.

Detailed validation methods, testing techniques, and debugging tools remain owned by ENG-08 — Development Quality.

## 10. Incremental Implementation and Version Control

Version control can help engineers organize and review changes as implementation progresses.

For example, a focused change may be easier to understand when its purpose and scope are clear.

However, incremental implementation does not require every implementation step to become a separate commit.

The appropriate commit boundaries, branching practices, and collaboration workflows belong to ENG-04 — Version Control & Collaborative Development.

The distinction is important:

- **Incremental implementation** concerns how the engineer develops and evaluates a change.
- **Version control workflow** concerns how changes are recorded, compared, coordinated, and shared.

These practices complement each other, but they are not interchangeable.

## 11. Production Engineering Perspective

Incremental implementation is especially useful in systems where changes interact with existing functionality.

### 11.1 Reduce the Size of Uncertain Changes

A focused change can make its purpose and potential effects easier to understand.

This is valuable when the system has many dependencies or when the consequences of incorrect behavior are significant.

### 11.2 Preserve Existing Behavior

A feature change must satisfy its new requirements without unintentionally breaking existing functionality.

For example, task archiving should not silently alter task ownership or completion behavior unless those changes are explicitly part of the requirement.

Each step should account for the relevant existing behavior.

### 11.3 Keep Intermediate States Understandable

A development process may temporarily pass through states in which the entire feature is not yet available.

That is normal.

However, engineers should understand what those intermediate states mean and avoid building additional changes on top of unexplained failures.

For high-risk changes, the team may need additional safeguards before intermediate changes are shared or used in environments where they could affect users.

The appropriate controls depend on the application and the team's approved operational practices.

### 11.4 Make Review Easier

A focused implementation makes it easier for another engineer to understand the purpose and scope of a change.

Reviewers can reason about the intended behavior, inspect the relevant modifications, and identify potential problems more efficiently.

The benefit comes from meaningful scope boundaries, not simply from reducing the number of changed lines.

### 11.5 Avoid Confusing Progress with Completion

Several small steps may have succeeded while the overall feature remains incomplete.

For example, the archive operation may work correctly, but the active task list may still display archived tasks.

Track progress at both levels:

- Progress within individual implementation steps.
- Completion of the overall requirement.

The feature is complete only when its agreed conditions are satisfied.

## 12. Common Mistakes and Misconceptions

### Mistake 1: Making Many Unrelated Changes at Once

Large collections of unrelated modifications make it harder to understand failures and review the result.

**Better approach:** Keep changes focused on meaningful parts of the intended outcome.

### Mistake 2: Treating Every Line of Code as a Separate Step

Excessive fragmentation creates unnecessary overhead.

**Better approach:** Choose implementation steps that produce useful progress and meaningful feedback.

### Mistake 3: Continuing After an Unexplained Failure

Additional changes may obscure the original problem and increase the cost of investigation.

**Better approach:** Understand significant failures before building more behavior on top of them.

### Mistake 4: Assuming Successful Execution Means Correct Behavior

Code can run without satisfying the requirement.

**Better approach:** Compare observed behavior with the relevant expected outcomes.

### Mistake 5: Validating Only at the End

Late feedback allows incorrect assumptions to influence more of the implementation.

**Better approach:** Obtain relevant feedback throughout development, then validate the complete feature as well.

### Mistake 6: Treating Incremental Implementation as a Requirement for Separate Commits

Implementation steps and version-control commits serve related but different purposes.

**Better approach:** Keep implementation work focused while following the approved ENG-04 workflow for recording and coordinating changes.

### Mistake 7: Adding Unrequested Improvements During Implementation

Unrelated improvements can expand the scope and introduce additional risk.

**Better approach:** Evaluate optional changes separately and make scope decisions explicit.

### Mistake 8: Assuming Small Changes Cannot Cause Serious Problems

A small change to an authorization check or shared data representation may have significant consequences.

**Better approach:** Scale validation and review according to the behavior's risk, not just the size of the change.

### Mistake 9: Confusing Step Completion with Feature Completion

An individual operation may work while the overall user flow remains incorrect.

**Better approach:** Evaluate the combined result against the complete set of agreed requirements.

## 13. Practical Assignment

### Scenario

You are working on an existing task-management application.

The requirement is:

> Users should be able to mark tasks as important and view important tasks separately.

Create an incremental implementation plan.

### Part A — Identify the Initial Unknowns

List the questions you would investigate before implementing the feature.

Consider the existing task model, current filtering behavior, and expected interaction with the user interface.

### Part B — Define Implementation Steps

Create a sequence of five to eight meaningful steps.

For each step, identify:

- The intended change.
- The expected result.
- The evidence you would inspect before continuing.

Avoid breaking the plan into trivial coding actions.

### Part C — Identify Risky Assumptions

Identify at least two assumptions that could cause rework if discovered late.

Explain how an earlier investigation or validation step could reduce that risk.

### Part D — Respond to a Failure

Suppose the importance flag updates correctly, but important tasks disappear when the application restarts.

Explain:

1. What this observation tells you.
2. Which possible causes you would investigate.
3. Whether you would continue with the next planned step.
4. What evidence would help you decide that the problem is resolved.

### Part E — Handle an Unrelated Improvement

While implementing the feature, you notice that the entire task-list component could be refactored.

Explain how you would decide whether to include the refactoring in the current change or handle it separately.

### Part F — Explain the Trade-off

Describe why incremental implementation can reduce risk while still requiring additional planning and validation effort.

**Expected outcome:** You should be able to organize a feature into focused changes, use feedback to guide the next step, and distinguish implementation progress from overall completion.

## 14. Interview Questions with Expected Answers

### Q1. What is incremental implementation?

**Expected answer:** It is the practice of developing a software change through small, meaningful steps, inspecting and validating relevant behavior throughout the process.

### Q2. Why can smaller implementation steps reduce engineering risk?

**Expected answer:** They can limit the number of simultaneous changes that need investigation, expose incorrect assumptions earlier, and make the purpose and effects of changes easier to understand.

### Q3. Does incremental implementation mean changing only one line of code at a time?

**Expected answer:** No. An implementation step should represent meaningful work. The appropriate size depends on the behavior, uncertainty, dependencies, and cost of obtaining feedback.

### Q4. What should an engineer do when an implementation step produces an unexpected result?

**Expected answer:** Investigate the discrepancy, identify whether the problem concerns implementation, requirements, assumptions, or dependencies, and correct or revise the approach before continuing with dependent work.

### Q5. Why is validating a small change not enough to establish that the entire feature is correct?

**Expected answer:** Components may interact in unexpected ways. The combined behavior must also be evaluated against the overall requirements and relevant completion conditions.

### Q6. How does incremental implementation differ from version control?

**Expected answer:** Incremental implementation concerns how a change is developed and evaluated. Version control records and coordinates changes over time. They complement each other but address different concerns.

### Q7. How should an engineer decide how much validation an implementation step needs?

**Expected answer:** The effort should reflect the risk, complexity, uncertainty, affected behavior, and applicable requirements. Higher-impact changes generally justify stronger validation.

### Q8. Should an engineer include an unrelated refactoring while implementing a feature?

**Expected answer:** Not automatically. The engineer should determine whether the refactoring is necessary for the feature. Optional improvements should be evaluated separately unless there is a justified reason to combine them.

### Q9. Can an incremental workflow still produce an incomplete feature?

**Expected answer:** Yes. Individual steps may succeed while the overall behavior remains incomplete. The engineer must evaluate the combined result against the agreed requirements.

### Q10. What is the main trade-off of incremental implementation?

**Expected answer:** It provides earlier feedback and better control over change scope, but requires deliberate step selection and repeated inspection or validation. The process should remain proportionate to the risk and complexity of the work.

## 15. Quick Revision

Incremental implementation develops software through small, meaningful changes rather than accumulating a large set of uncertain modifications before obtaining feedback.

The central cycle is:

**Choose a focused change → Implement → Inspect → Validate → Learn → Continue or revise.**

Good implementation steps are understandable, useful, and sufficiently focused without being artificially small.

Early feedback helps expose incorrect assumptions and limit unnecessary rework. Significant failures should be investigated before dependent work continues.

Incremental implementation does not replace planning, testing, debugging, or version control. It provides a practical structure for applying those activities throughout development.

Most importantly, a successful intermediate step does not prove that the overall feature is complete. The combined result must still satisfy the agreed requirements and completion conditions.

## 16. Key Takeaways

- Incremental implementation organizes development into small, meaningful steps.
- Focused changes make feedback and investigation easier.
- Early feedback helps identify incorrect assumptions before they spread.
- Implementation steps should be meaningful rather than artificially small.
- Unexpected results may require revisiting the implementation, requirements, or plan.
- Validation effort should reflect risk and complexity.
- Incremental implementation and version control are complementary, not interchangeable.
- Overall feature completion must be evaluated separately from individual step completion.

## 17. Further Reading

- [The Scrum Guide](https://scrumguides.org/scrum-guide.html)
- [Agile Manifesto](https://agilemanifesto.org/)

These resources provide additional perspectives on iterative development and feedback. This chapter remains focused on the approved ENG-09 scope of incremental implementation workflow.
