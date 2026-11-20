
# 03 — Task Breakdown and Work Planning

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why larger software changes need to be broken into smaller tasks.
- Translate requirements into actionable engineering work.
- Distinguish a task from a requirement, a deliverable, and a dependency.
- Identify dependencies and determine a sensible order of execution.
- Recognize tasks that are too large, too vague, or unnecessarily fragmented.
- Estimate work while accounting for uncertainty and technical risk.
- Plan work around scope, constraints, and available resources.
- Adapt a plan when implementation reveals new information.

## Prerequisites

You should understand the concepts covered in:

- [01 — Software Development Lifecycle](01-Software-Development-Lifecycle.md)
- [02 — Requirements and Acceptance Criteria](02-Requirements-and-Acceptance-Criteria.md)

ENG-03 — Software Engineering Principles and ENG-04 — Version Control & Collaborative Development provide useful supporting context.

This chapter focuses on planning and decomposition. Detailed implementation practices belong to Chapter 04.

## Estimated Reading Time

15–22 minutes.

## 1. Before We Start

Imagine that you receive this requirement:

> Users should be able to archive tasks they no longer need in their active task list.

The requirement describes the intended behavior, but it does not tell you exactly how to organize the engineering work.

You may need to understand the existing task model, implement archive behavior, update the interface, handle permissions, and validate the result.

If you treat the entire feature as one task, it becomes difficult to understand its progress, dependencies, risks, and remaining work.

If you split it into dozens of tiny tasks, managing the plan may take more effort than completing the feature.

The challenge is to identify meaningful units of work.

This is the purpose of **task breakdown and work planning**.

## 2. What Is Task Breakdown?

Task breakdown is the process of dividing a larger engineering objective into smaller, manageable units of work.

Each task should describe a meaningful piece of work that contributes to the intended outcome.

For example:

```text
Feature: Archive Tasks
        |
        +-- Understand Existing Task Behavior
        |
        +-- Define Archive State and Rules
        |
        +-- Implement Archive Operation
        |
        +-- Update Task List Behavior
        |
        +-- Validate Relevant Scenarios
        |
        +-- Update Affected Documentation
```

This is an illustrative breakdown. The actual tasks depend on the application's existing design and the agreed requirements.

The purpose is not to create the maximum possible number of tasks. It is to make the work understandable, actionable, and manageable.

### 2.1 Why Break Work into Smaller Tasks?

A large task often hides several different engineering concerns.

Breaking it down helps engineers:

- Understand what work is required.
- Identify dependencies before they block progress.
- Recognize uncertainty and risk.
- Estimate effort more realistically.
- Assign responsibility when multiple engineers are involved.
- Review progress without relying on vague status updates.
- Detect missing work before the feature is considered complete.

Task breakdown also exposes gaps between the original requirement and the proposed implementation plan.

For example, a plan that includes archiving a task but ignores how archived tasks appear in the interface may be incomplete.

### 2.2 A Task Is Not Necessarily a Small Coding Change

A task may involve investigation, implementation, validation, or documentation.

Examples include:

- Trace how task ownership is enforced.
- Determine whether the current data model supports archived tasks.
- Implement the archive operation.
- Verify that archived tasks are excluded from the active list.
- Update the relevant usage instructions.

Some tasks produce code. Others produce information or evidence needed to make a good engineering decision.

## 3. Requirement, Task, and Deliverable

These terms are related, but they describe different things.

| Concept | Meaning | Example |
|---|---|---|
| Requirement | What the system must do or satisfy | Users can archive tasks |
| Task | A unit of work performed to achieve the requirement | Implement the archive operation |
| Deliverable | A result produced by the work | A working archive operation |
| Acceptance criterion | A condition used to evaluate expected behavior | An archived task no longer appears in the active list |

A single requirement may require several tasks.

A task may contribute to several requirements, particularly when shared functionality is involved.

A deliverable may consist of multiple related changes rather than a single file or code component.

Keeping these distinctions clear prevents a common planning mistake: assuming that describing the requested feature automatically describes all the work required to deliver it.

## 4. The Mental Model: Decompose by Meaningful Outcomes

A useful mental model is to think of a feature as a collection of related outcomes.

```text
Requirement
    |
    v
Required Outcomes
    |
    v
Engineering Work
    |
    v
Tasks and Dependencies
    |
    v
Coordinated Execution
    |
    v
Completed Requirement
```

Each task should contribute to a meaningful part of the overall outcome.

Consider a profile-picture feature:

- Users can select a supported image.
- The application validates the image.
- The image is stored successfully.
- The profile displays the stored image.
- Invalid uploads produce appropriate feedback.

These outcomes help reveal the different kinds of work involved.

However, the outcomes are not necessarily independent. The display behavior may depend on successful storage, and validation rules may need to be established before implementation begins.

A good breakdown captures both the work and its relationships.

## 5. How to Break Down a Feature

The following process is a practical starting point.

### Step 1: Understand the Intended Outcome

Start with the approved requirement and acceptance criteria.

Do not begin by inventing implementation tasks before understanding what behavior the feature must deliver.

For example:

> Users can archive tasks and no longer see archived tasks in their active list.

This statement establishes a capability and an important expected result.

### Step 2: Identify the Major Areas of Work

Consider the different areas that may need attention:

- Existing behavior and constraints.
- Data representation.
- Business rules.
- Application interfaces.
- Validation.
- Documentation.

These are prompts for investigation, not a mandatory checklist. A simple feature may not require work in every area.

### Step 3: Identify Concrete Tasks

Convert each relevant area into actionable work.

Weak task:

> Handle archiving.

More useful tasks might include:

- Inspect the existing task model and lifecycle.
- Determine how archive state should be represented.
- Implement the operation that archives a task.
- Update the active task query to exclude archived tasks.
- Validate the archive and retrieval behavior.

The tasks are easier to understand because each describes a specific activity.

The final breakdown should reflect the actual codebase rather than assume a particular architecture.

### Step 4: Identify Dependencies

Determine which tasks require another task, decision, or external input to be completed first.

For example, implementing archive filtering may depend on how archive state is represented.

A dependency is a relationship between work items, not simply a preference about which task should happen first.

### Step 5: Check for Missing Work

Review the proposed tasks against the requirements and acceptance criteria.

Ask:

- Is every required behavior covered?
- Are important failure scenarios accounted for?
- Is there investigation that must happen before implementation?
- Does the feature affect existing behavior?
- Is documentation likely to require an update?
- Are there unresolved decisions that could block the work?

### Step 6: Review the Breakdown

Check whether tasks are sufficiently clear and manageable.

A task should not be so broad that its completion is difficult to assess. It should also not be so small that it creates unnecessary coordination and tracking overhead.

### Step 7: Establish a Working Plan

Organize tasks by dependency, risk, priority, and available resources.

The resulting plan should make the next actions and important constraints understandable.

It is a working model, not a promise that every detail will remain unchanged.

## 6. Task Granularity: How Small Should a Task Be?

**Task granularity** describes the level of detail at which work is divided.

There is no universal ideal task size. The appropriate granularity depends on complexity, uncertainty, dependencies, coordination needs, and the cost of tracking work.

### 6.1 Tasks That Are Too Large

Consider:

> Implement the entire profile-management feature.

This may include profile editing, image uploads, validation, permissions, persistence, and interface changes.

The task is difficult to estimate and its completion status is not very informative.

A more useful breakdown separates the meaningful areas of work.

### 6.2 Tasks That Are Too Small

Now consider this breakdown:

1. Open the source file.
2. Find the function.
3. Add one line.
4. Save the file.
5. Run a command.

These actions may be useful within a personal checklist, but tracking each as a separate engineering task usually adds little value.

They do not necessarily represent independent outcomes.

### 6.3 A Practical Test

A task is often well-sized when:

- Its purpose is understandable without extensive explanation.
- Its expected result can be described.
- Its completion can be assessed.
- Its dependencies are reasonably clear.
- Its scope is small enough to manage.
- It does not require unnecessary fragmentation.

A task may still contain several internal steps. The goal is meaningful decomposition, not eliminating every multi-step activity.

### 6.4 Split a Task When It Hides Distinct Work

Consider:

> Add file uploads.

This may be too broad if the work includes several independently understandable responsibilities.

A more useful breakdown might be:

- Define permitted file types and size limits.
- Implement upload validation.
- Implement storage integration.
- Connect the upload operation to the profile workflow.
- Validate successful and unsuccessful uploads.

Whether these should be separate tracked tasks depends on the project. A small application might combine some of them, while a larger system may need clearer boundaries.

### 6.5 Avoid Splitting Work Artificially

Do not create separate tasks simply because two lines of code are involved or because a task appears large in a tracking system.

Split work when doing so improves understanding, estimation, sequencing, coordination, or validation.

## 7. Dependencies and Task Ordering

A **dependency** exists when one task relies on another task, decision, or external condition.

Understanding dependencies helps prevent blocked work and unrealistic plans.

### 7.1 Sequential Dependencies

Suppose a feature requires a new data field.

A simplified dependency chain might be:

```text
Agree on Required Behavior
          |
          v
Determine Data Representation
          |
          v
Implement Persistence
          |
          v
Implement Dependent Behavior
          |
          v
Validate the Complete Flow
```

This diagram is illustrative. Existing systems may already provide the required data representation or persistence capability.

The important idea is that some work cannot be completed meaningfully until an earlier condition is satisfied.

### 7.2 Parallel Work

Some tasks can proceed independently.

For example, if an application already has a stable API contract, one engineer may update a frontend component while another implements a compatible backend change.

However, parallel work is safe only when the relevant interfaces, responsibilities, and integration expectations are sufficiently clear.

Otherwise, the team may discover conflicting assumptions later.

### 7.3 A Dependency Graph

Consider the following example:

```text
A. Clarify Archive Rules
          |
          v
B. Determine Data Representation
          |
          v
C. Implement Archive Operation
          |
          +------------------+
          |                  |
          v                  v
D. Update Active List    E. Update Archive View
          |                  |
          +---------+--------+
                    |
                    v
          F. Validate User Flows
                    |
                    v
          G. Update Relevant Documentation
```

The diagram shows a possible plan, not an approved implementation design.

If the application does not have an archive view, task E may be unnecessary. If the current model already supports archive state, task B may require only a short inspection rather than a new design activity.

A dependency graph should describe actual constraints, not preserve tasks merely because they appeared in an initial plan.

### 7.4 Common Dependency Mistakes

**Mistake: Treating every preferred order as a hard dependency.**

Some tasks can be rearranged without blocking one another.

**Better approach:** Distinguish actual prerequisites from convenient sequencing.

**Mistake: Ignoring external dependencies.**

A task may rely on a stakeholder decision, external service, API contract, or another team's work.

**Better approach:** Make the dependency visible and determine how the team will handle the wait.

**Mistake: Starting dependent work on unconfirmed assumptions.**

An engineer may begin implementing behavior before a critical interface or business rule is agreed upon.

**Better approach:** Resolve important uncertainties or explicitly manage the assumption and its risk.

## 8. Estimation and Uncertainty

Task estimation attempts to predict the effort or time needed to complete work.

Estimates are useful for planning, but they are not guarantees.

A task may take longer than expected because the codebase is unfamiliar, an integration behaves differently than anticipated, or a requirement was incomplete.

### 8.1 Estimate the Work, Not Just the Coding

Consider the task:

> Add a new API endpoint.

The implementation may require more than writing the route handler.

Relevant work might include:

- Understanding existing API conventions.
- Clarifying expected behavior.
- Inspecting related data models.
- Implementing the endpoint.
- Validating successful and unsuccessful requests.
- Updating relevant documentation.

Ignoring these activities can produce systematically optimistic estimates.

### 8.2 Use Investigation When Uncertainty Is High

Suppose you do not know whether the existing application supports task archiving.

Estimating the full implementation before examining the codebase may be unreliable.

Instead, create an investigation task:

> Inspect the task model and existing lifecycle behavior to determine whether archive support already exists.

The result of this investigation can make subsequent estimates more informed.

Investigation is useful when it reduces uncertainty that materially affects planning. It should not become an excuse to investigate every possible detail before making progress.

### 8.3 Distinguish Effort from Elapsed Time

Effort is the amount of work required. Elapsed time is the time that passes before the work is completed.

A task requiring four hours of engineering effort may take two calendar days if it depends on an external decision or must wait for another task.

Adding more engineers does not necessarily reduce elapsed time proportionally. Some work is sequential, and coordination creates overhead.

### 8.4 Account for Risk Without Pretending to Know the Future

When uncertainty is significant, communicate it explicitly.

For example:

> Estimated effort is uncertain because the existing storage behavior has not been investigated.

This statement is more useful than presenting a precise number that hides an unresolved assumption.

Where useful, teams may estimate a range or identify the assumptions on which an estimate depends.

## 9. Prioritization and Work Planning

Task breakdown identifies the work. Work planning determines how that work should be organized and approached.

Several factors influence the order in which tasks should be performed.

### 9.1 Priority

Priority reflects the relative importance of work.

A task may have high priority because it is necessary for the feature, addresses a serious risk, or unblocks other work.

Priority should not be confused with dependency. A high-priority task may still be blocked by a prerequisite.

### 9.2 Risk

Some tasks reveal important uncertainty.

For example, integrating with an unfamiliar storage service may carry more uncertainty than updating a straightforward user-interface label.

Investigating a risky dependency early can help the team avoid committing to an unrealistic plan.

### 9.3 Dependencies

A task that blocks several other tasks may deserve early attention, even if it does not directly produce visible functionality.

### 9.4 Available Resources

Planning should account for the people, tools, information, and time actually available.

Assigning several dependent tasks to different people does not make them independently executable.

### 9.5 Scope and Value

Work should remain connected to the intended outcome.

Optional improvements can be valuable, but they should not displace essential work without an explicit decision.

### 9.6 A Practical Planning Table

| Task | Priority | Dependency | Main uncertainty |
|---|---|---|---|
| Clarify archive behavior | High | None | Whether archived tasks remain restorable |
| Inspect the existing task model | High | Initial requirements | Whether archive support already exists |
| Implement archive operation | High | Data representation and rules | Interaction with existing lifecycle behavior |
| Update active task list | High | Archive representation | Existing filtering behavior |
| Add optional archive view | Depends on scope | Archive behavior | Whether a separate view is required |
| Validate relevant scenarios | High | Relevant implementation available | Uncovered edge cases |

This table is an example of a planning aid, not a universal prioritization scheme.

The actual plan should reflect the agreed requirements and the real application.

## 10. Work Planning in Existing Codebases

Planning a change in an unfamiliar codebase introduces uncertainty.

The engineer may not know:

- Which module owns the relevant behavior.
- Whether a required capability already exists.
- Which components depend on the current behavior.
- Whether tests or documentation reveal hidden assumptions.
- Whether the proposed change conflicts with existing architecture.

A useful response is to include targeted investigation in the plan.

For example:

```text
Feature: Task Archiving
        |
        v
Inspect Existing Task Lifecycle
        |
        v
Identify Relevant Modules
        |
        v
Confirm Data and Behavior Constraints
        |
        v
Finalize Implementation Tasks
```

This avoids planning an implementation around assumptions that may be false.

Detailed codebase exploration belongs to [05 — Working with Existing Codebases](05-Working-with-Existing-Codebases.md). This chapter focuses on recognizing investigation as a legitimate part of the plan.

## 11. Adapting the Plan During Development

A plan is a representation of the team's current understanding. It should change when important new information invalidates that understanding.

Suppose the archive feature was expected to require a new database field. During investigation, the engineer discovers that the application already stores an archive status.

The original task breakdown may now contain unnecessary work.

A sensible response is to:

1. Verify the existing behavior.
2. Determine whether it satisfies the requirement.
3. Remove or revise unnecessary tasks.
4. Update the dependencies and estimates.
5. Continue with the remaining work.

The reverse can also happen. An apparently small feature may reveal additional work because an existing component cannot support the required behavior.

### 11.1 Distinguish Useful Adaptation from Uncontrolled Scope Growth

A revised plan is justified when new information changes the work needed to satisfy the agreed requirements.

Adding unrelated capabilities simply because they seem useful is different.

When scope changes, clarify the new requirement, evaluate the additional work, and obtain the appropriate agreement before treating it as part of the committed plan.

### 11.2 Keep the Plan Useful

A plan that no longer reflects the actual work can become misleading.

However, maintaining the plan should not become an excessive administrative activity.

Update the parts that matter: task scope, dependencies, priorities, estimates, and completion status.

## 12. Production Engineering Perspective

Task breakdown becomes particularly important when multiple engineers contribute to the same feature.

Poorly divided work can cause:

- Conflicting assumptions about interfaces.
- Multiple people changing the same behavior without coordination.
- Hidden dependencies that block progress.
- Incomplete validation because each person focuses only on their assigned component.
- Confusion about who owns a task's completion.

A useful task should have a clear purpose and an understandable expected result.

### 12.1 Responsibility and Ownership

When work is assigned, ownership should be clear enough that the team knows who is responsible for progressing the task and communicating blockers.

Ownership does not mean that only one person may contribute. It means that responsibility for coordination and completion is not ambiguous.

Team-specific assignment and collaboration procedures remain part of ENG-04.

### 12.2 Plan for Integration

Individually completed tasks do not automatically form a correct feature.

The overall plan should include the work needed to validate how the pieces behave together.

For example, a successful archive operation and a correctly implemented active-list filter may still fail to provide the expected behavior when the two components interact.

Integration-related planning should reflect the feature's actual risks and dependencies.

Detailed integration testing belongs to ENG-08 — Development Quality.

### 12.3 Prefer Useful Visibility Over Excessive Tracking

A task board or project tracker can help teams understand:

- What needs to be done.
- What is currently in progress.
- What is blocked.
- What has been completed.
- Which dependencies threaten the plan.

The tool is secondary to the quality of the information it contains.

A large number of tiny tasks does not necessarily provide better visibility. A small number of vague tasks does not provide useful control either.

## 13. Common Mistakes and Misconceptions

### Mistake 1: Treating the Entire Feature as One Task

A broad task hides its component work and dependencies.

**Better approach:** Identify meaningful outcomes and divide the work where doing so improves planning and visibility.

### Mistake 2: Splitting Work into Excessively Small Tasks

Tracking trivial actions creates overhead without improving understanding.

**Better approach:** Use task boundaries that represent meaningful work and assessable outcomes.

### Mistake 3: Creating Tasks Before Understanding the Requirements

The resulting plan may implement the wrong behavior or omit important conditions.

**Better approach:** Use the approved requirements and acceptance criteria as the basis for decomposition.

### Mistake 4: Ignoring Investigation Work

Engineers may underestimate a feature because they count only implementation time.

**Better approach:** Include targeted investigation when understanding existing behavior or resolving uncertainty is necessary.

### Mistake 5: Treating Every Task Relationship as a Dependency

This can create unnecessary sequencing and delay independent work.

**Better approach:** Record genuine prerequisites separately from preferred ordering.

### Mistake 6: Ignoring Integration Work

Individually completed components may not work together correctly.

**Better approach:** Plan for the relevant combined behavior and its validation.

### Mistake 7: Treating Estimates as Commitments Without Assumptions

Uncertainty may be hidden behind a precise number.

**Better approach:** Identify the assumptions, dependencies, and unknowns that affect the estimate.

### Mistake 8: Refusing to Update an Outdated Plan

A plan can become misleading when implementation reveals that its assumptions were wrong.

**Better approach:** Revise the affected tasks and dependencies when new evidence justifies doing so.

### Mistake 9: Adding Optional Features Without Evaluating Their Cost

Uncontrolled additions can delay essential functionality.

**Better approach:** Separate required work from optional improvements and make scope decisions explicit.

## 14. Practical Assignment

### Scenario

You are asked to add a notification preference to an existing application.

Users should be able to choose whether they receive email notifications for task updates.

Your responsibility is to create a practical work plan.

### Part A — Identify the Major Work Areas

List the areas that may require investigation or implementation.

Consider the existing user model, preference storage, notification behavior, user interface, validation, and documentation.

Do not assume that every area requires a new implementation.

### Part B — Create the Task Breakdown

Write between five and eight meaningful tasks.

For each task, describe:

- The work to perform.
- The expected result.
- Any important uncertainty.

Avoid tasks such as "finish notifications" that do not make the scope clear.

### Part C — Identify Dependencies

Draw a simple dependency graph.

Identify:

- Tasks that can begin immediately.
- Tasks that require an earlier decision or implementation.
- Tasks that may proceed independently.
- Work needed to validate the complete behavior.

### Part D — Prioritize the Work

Choose the tasks that should be investigated or completed first.

Explain your decisions using dependencies, risk, and importance to the requirement.

### Part E — Estimate with Uncertainty

Identify the task that is hardest to estimate.

Explain what information would make its estimate more reliable.

Do not invent exact time estimates if you lack sufficient information.

### Part F — Adapt the Plan

Suppose you discover that the application already stores notification preferences, but the notification service ignores them.

Explain which tasks become unnecessary, which tasks remain, and what new work may be required.

**Expected outcome:** You should be able to turn a feature requirement into a manageable work plan and explain why the tasks are ordered as proposed.

## 15. Interview Questions with Expected Answers

### Q1. Why is task breakdown important in software engineering?

**Expected answer:** It makes larger changes easier to understand, estimate, sequence, assign, and validate. It also exposes missing work, dependencies, and uncertainty.

### Q2. What is the difference between a requirement and a task?

**Expected answer:** A requirement describes what the system must do or satisfy. A task describes a unit of work performed to achieve that requirement.

### Q3. How do you decide whether a task should be split?

**Expected answer:** Split it when doing so improves clarity, estimation, ownership, sequencing, or validation. Avoid splitting work into trivial actions that create more tracking overhead than value.

### Q4. What is a task dependency?

**Expected answer:** A dependency is a relationship in which a task relies on another task, decision, or external condition. It affects when the dependent work can proceed meaningfully.

### Q5. Can two tasks be performed in parallel?

**Expected answer:** Yes, when they do not depend on one another and their interfaces, responsibilities, and integration expectations are sufficiently clear. Apparent independence should be checked rather than assumed.

### Q6. Why should investigation be included in a work plan?

**Expected answer:** Investigation reduces uncertainty about existing behavior, constraints, and implementation options. Without it, the plan may omit work or rely on incorrect assumptions.

### Q7. What is the difference between effort and elapsed time?

**Expected answer:** Effort represents the amount of work required. Elapsed time represents the calendar time before completion. Dependencies, waiting, coordination, and parallelism can make them substantially different.

### Q8. How should an engineer handle a dependency that blocks progress?

**Expected answer:** Make the dependency visible, identify the required decision or input, communicate the blocker appropriately, and determine whether independent work can continue safely.

### Q9. Why should task plans change during development?

**Expected answer:** Investigation and implementation can reveal new information that invalidates the original assumptions. Updating the plan keeps the work aligned with the actual requirements and constraints.

### Q10. How can a team avoid creating too many tasks?

**Expected answer:** Choose boundaries based on meaningful outcomes, assessable completion conditions, dependencies, and coordination needs rather than tracking every small coding action.

## 16. Quick Revision

Task breakdown divides a larger engineering objective into smaller, manageable units of work. Work planning organizes those tasks according to dependencies, priority, risk, and available resources.

A useful workflow is:

**Understand the requirement → Identify work areas → Define tasks → Map dependencies → Check coverage → Prioritize and estimate → Adapt as needed.**

Tasks should be meaningful and assessable without becoming excessively broad or unnecessarily fragmented.

Dependencies identify genuine prerequisites. They should not be confused with preferred sequencing.

Estimates should account for investigation and uncertainty rather than only coding effort. Plans should change when new evidence changes the work required.

Finally, individually completed tasks do not guarantee a completed feature. The plan must account for the relevant combined behavior and completion conditions.

## 17. Key Takeaways

- Requirements describe expected behavior; tasks describe work needed to achieve it.
- Task breakdown improves clarity, estimation, sequencing, and progress visibility.
- Good task boundaries represent meaningful, assessable units of work.
- Dependencies must be identified before they become blockers.
- Investigation is legitimate engineering work when it reduces important uncertainty.
- Estimates should communicate assumptions and uncertainty.
- Work plans should adapt when evidence changes the original assumptions.
- A complete plan includes the work needed to validate the overall feature, not just its individual components.

## 18. Further Reading

- [The Scrum Guide](https://scrumguides.org/scrum-guide.html)
- [Agile Manifesto](https://agilemanifesto.org/)

These resources provide additional perspectives on organizing work and adapting plans. This chapter remains focused on the approved ENG-09 scope of task breakdown and work planning.
