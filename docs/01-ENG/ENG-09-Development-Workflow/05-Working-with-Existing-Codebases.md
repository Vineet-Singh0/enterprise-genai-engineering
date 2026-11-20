# Working with Existing Codebases

## Learning Objectives

By the end of this chapter, you should be able to:

- Approach an unfamiliar codebase systematically instead of exploring files randomly.
- Identify the likely entry points and components involved in a feature.
- Trace how a request or piece of data moves through an application.
- Locate where a change should be made and identify its likely impact.
- Distinguish observed behavior from assumptions about how the system works.
- Make a focused change while preserving existing behavior.
- Recognize when you need more context before modifying code.

## Prerequisites

- [Chapter 02 — Requirements and Acceptance Criteria](02-Requirements-and-Acceptance-Criteria.md)
- [Chapter 03 — Task Breakdown and Work Planning](03-Task-Breakdown-and-Work-Planning.md)
- [Chapter 04 — Incremental Implementation Workflow](04-Incremental-Implementation-Workflow.md)
- ENG-03 — Software Engineering Principles
- ENG-04 — Version Control and Collaborative Development

## Estimated Reading Time

25–35 minutes

---

## 1. Introduction

Most engineering work does not begin with an empty directory.

In an existing project, the application may already contain established behavior, dependencies, conventions, abstractions, and assumptions. A requested change must fit into that environment.

Consider a task:

> Add a filter that allows users to view only active tasks.

The implementation might appear straightforward. However, an engineer must first understand:

- Where task data is stored.
- How tasks are retrieved.
- Where filtering currently occurs.
- Whether filtering belongs in the API, service layer, database query, or user interface.
- Which other features depend on the same behavior.
- How the existing application represents an active task.

Writing code before answering these questions can produce a locally correct change that breaks another part of the application.

**The primary skill is not reading every file. It is discovering the smallest amount of reliable context needed to make a correct change.**

## 2. Why Systematic Codebase Exploration Matters

An unfamiliar codebase contains more information than an engineer can reasonably read in one sitting. Some files are central to the requested behavior; many others are irrelevant to the current task.

Random exploration creates several problems:

- **Wasted effort:** Reading unrelated modules consumes time without improving the implementation decision.
- **Incorrect assumptions:** A filename or class name may suggest a responsibility that the code does not actually own.
- **Changes in the wrong location:** The implementation may duplicate existing behavior or bypass an established boundary.
- **Unexpected side effects:** Shared functions and data structures may be used by multiple features.
- **Unnecessary redesign:** An engineer may replace a working pattern simply because it is unfamiliar.

A systematic approach reduces uncertainty before code changes begin.

The objective is not complete knowledge of the system. It is sufficient understanding of the relevant behavior, its dependencies, and the risks of changing it.

## 3. A Mental Model for an Existing Codebase

Think of an application as a network of connected responsibilities.

A user action may trigger a request, which passes through several components before producing a result.

For example:

```text
User action
    |
    v
API endpoint
    |
    v
Application/service logic
    |
    v
Data access
    |
    v
Database
```

The response travels back through the relevant components to the caller.

This diagram is illustrative, not a requirement that every application use these exact layers. Some systems have fewer layers, while others introduce queues, external services, caches, or additional processing stages.

When exploring a codebase, investigate three things:

1. **Entry points:** Where does the behavior begin?
2. **Execution path:** Which components participate in the behavior?
3. **Data and dependencies:** What information does the behavior consume, modify, or rely on?

This model helps turn an unfamiliar collection of files into a traceable execution path.

## 4. Begin with the Task, Not the File Tree

Before opening files, restate the requested change in terms of observable behavior.

For example:

> When a client requests active tasks, the application should return only tasks whose status is active. Requests without the filter should retain their existing behavior.

This statement identifies the behavior to investigate and the compatibility requirement.

Next, identify what is already known and what remains uncertain.

| Question | Why it matters |
|---|---|
| What behavior should change? | Defines the target of the investigation. |
| What behavior must remain unchanged? | Identifies compatibility constraints. |
| Where is the behavior visible? | Helps locate the likely entry point. |
| What data does it depend on? | Identifies relevant models, queries, or external inputs. |
| What might consume the result? | Reveals possible downstream effects. |

Do not begin by assuming that a particular file must contain the solution. Use the requirement to guide exploration, then use the code to confirm or reject your assumptions.

## 5. Explore the Codebase in Layers

A useful investigation proceeds from broad context to specific behavior.

### 5.1 Understand the Project at a High Level

Start with a small number of high-value sources:

- The project README.
- The application entry point.
- Dependency and build configuration files.
- Existing developer instructions.
- The directory containing the relevant feature.
- Nearby tests or examples.

These sources help answer questions such as:

- What kind of application is this?
- How is it started or executed?
- Which major libraries and frameworks does it use?
- Where are the likely application boundaries?
- Are there documented conventions or commands?

Do not read every configuration file or dependency in detail. Investigate further only when the task requires it.

Project layout and architectural organization are related but distinct topics. For deeper guidance on design responsibilities and code organization, refer to ENG-03. Repository structure and collaboration practices belong to ENG-04.

### 5.2 Locate the Entry Point

An entry point is where a relevant execution path begins or becomes accessible.

Depending on the application, it might be:

- An API route.
- A command-line handler.
- A user-interface event handler.
- A scheduled job.
- A message consumer.
- A framework-registered callback.

Search for observable names associated with the requested behavior, such as endpoint paths, route names, function names, model names, or user-facing labels.

Then inspect the surrounding code to verify the match.

A name is a clue, not proof. A function named `get_active_tasks` might call another service, return cached data, or have behavior that differs from its name.

### 5.3 Trace the Execution Path

After finding a likely entry point, follow the calls and data flow.

Suppose an API endpoint retrieves tasks:

```python
@router.get("/tasks")
def list_tasks(active_only: bool = False):
    return task_service.list_tasks(active_only=active_only)
```

The endpoint delegates to a service. Inspecting only the route does not reveal how filtering works.

The service might contain:

```python
def list_tasks(active_only: bool = False):
    tasks = task_repository.get_all()

    if active_only:
        return [task for task in tasks if task.status == "active"]

    return tasks
```

The repository might retrieve the underlying records from a database.

A simplified trace is:

```text
GET /tasks?active_only=true
          |
          v
    list_tasks route
          |
          v
    task service
          |
          v
    task repository
          |
          v
      task records
```

The goal is to identify where the behavior is implemented, not merely where the request first appears.

In a real system, follow the actual execution path. Do not assume that every application separates routes, services, and repositories in this way.

### 5.4 Follow the Data

Function calls explain control flow. Data flow explains what those functions operate on.

For the active-task example, investigate:

- Where the task status is defined.
- What values the status can contain.
- How records are loaded.
- Whether filtering happens before or after retrieval.
- Whether the result is transformed before being returned.
- Whether another component interprets the same status differently.

This prevents errors such as filtering on the wrong field or assuming that a missing status means a task is active.

When a field's meaning is unclear, look for its definition, existing uses, tests, and documented constraints rather than inventing a new interpretation.

## 6. Use Multiple Sources of Evidence

No single source always explains an unfamiliar feature completely.

A useful evidence hierarchy is:

1. **Executable behavior:** What the application actually does when exercised.
2. **Implementation:** What the relevant code paths currently specify.
3. **Tests:** What behavior existing checks expect or protect.
4. **Documentation and comments:** What maintainers say the system is intended to do.
5. **Names and assumptions:** What appears likely from identifiers or structure.

This is not an absolute ranking for every situation. Tests can be incomplete, documentation can be outdated, and code can contain defects. The point is to compare evidence rather than trust one source blindly.

For example, a comment may say that an endpoint returns only active tasks, while the implementation returns all tasks. That discrepancy is a finding to investigate, not a reason to assume the comment is correct.

When evidence conflicts, determine whether the difference is intentional, outdated, or a defect before deciding what to change.

## 7. Find the Correct Place for a Change

Once the behavior is understood, determine where the modification belongs.

A useful decision process is:

1. Identify the observable behavior that needs to change.
2. Locate the component responsible for that behavior.
3. Find existing code that performs a similar operation.
4. Identify the data and interfaces the component depends on.
5. Check whether the change would affect unrelated behavior.
6. Prefer the smallest change that fits the existing design.

For example, if the requirement is to filter tasks by status, possible locations include:

- The API endpoint.
- The service layer.
- The database query.
- The client-side interface.

The correct choice depends on existing architecture and the intended semantics.

If the application already supports database-level filtering through its repository, adding another filter in the user interface alone may be insufficient. It could hide records visually while still transferring unnecessary data, and other clients would not receive the same behavior.

On the other hand, if the requirement is only to change how an already-loaded list is displayed, a client-side filter may be appropriate.

**Choose the location based on responsibility and required behavior, not on which file is easiest to edit.**

For deeper principles about assigning responsibilities and managing dependencies, see ENG-03 rather than duplicating its design guidance here.

## 8. Assess the Impact Before Editing

A change can affect code beyond the function being modified.

Before editing, identify the likely impact surface:

- Direct callers of the function.
- Components that consume its return value.
- Shared data structures or models.
- Public interfaces, such as API parameters and response fields.
- Error-handling paths.
- Existing tests and documented behavior.
- Other features that rely on the same component.

Consider a function that changes from returning a list of task objects to returning a dictionary containing the list and metadata. Even if the new function works correctly in isolation, callers expecting a list may fail.

For this reason, inspect relevant callers and consumers before changing a shared interface.

The investigation does not need to enumerate every dependency in the entire system. Focus on the dependencies reasonably connected to the requested behavior.

## 9. Work with Existing Conventions

Established codebases usually contain patterns that make implementation more predictable.

Look for nearby examples of:

- Function and variable naming.
- Error handling.
- Input validation.
- Return types and response formats.
- Data access.
- Logging and observability.
- Test organization.
- Documentation conventions.

When an existing pattern is appropriate, follow it. Doing so reduces inconsistency and makes the change easier for the next engineer to understand.

However, consistency does not mean copying every existing pattern without evaluation. A nearby implementation may contain a defect or may serve a different purpose.

Use this rule:

> Follow established conventions when they fit the requirement and existing design; investigate before reproducing a pattern that appears incorrect or unsuitable.

If a proposed change requires a broad architectural redesign, separate that decision from the immediate task. Explain the reason, scope, risks, and alternatives before expanding the change.

## 10. Make the Change Incrementally

After understanding the relevant execution path, implement the change in small, reviewable steps.

A practical sequence is:

1. Confirm the requirement and expected behavior.
2. Identify the relevant code and dependencies.
3. Make the smallest meaningful modification.
4. Inspect the changed logic and its immediate callers.
5. Run the appropriate checks.
6. Investigate failures and revise the implementation.
7. Confirm that existing behavior remains intact.
8. Summarize the change and any remaining uncertainty.

This connects directly to [Chapter 04 — Incremental Implementation Workflow](04-Incremental-Implementation-Workflow.md).

Do not combine unrelated cleanup, refactoring, dependency upgrades, and feature changes unless the task requires them. Unrelated changes make it harder to determine which modification caused a regression.

Testing, debugging, and quality-checking techniques are covered in ENG-08. This chapter focuses on finding the right code and understanding the context before applying those techniques.

## 11. Practical Example: Adding an Active-Task Filter

Imagine you join a project with an existing task-management API. You receive this requirement:

> Allow clients to request only active tasks without changing the default response.

### Step 1: Clarify the Behavior

Determine:

- How a client requests the filter.
- What counts as an active task.
- What happens when the filter is omitted.
- Whether the existing response format must remain unchanged.

If any of these points are ambiguous, resolve them before implementation.

### Step 2: Locate the Entry Point

Find the task-list endpoint and inspect its current parameters and response.

Do not immediately add a new route. First determine whether the existing endpoint already supports related filtering.

### Step 3: Trace the Current Behavior

Follow the endpoint into the relevant application logic and data access code.

Determine whether the current implementation retrieves all tasks, filters them, or delegates to another component.

### Step 4: Inspect the Data Model

Find how task status is represented and which values are valid.

Do not assume that the application uses `"active"` without checking the existing model and data conventions.

### Step 5: Inspect Consumers

Determine whether the returned data is consumed by multiple clients or components and whether the response contract must remain stable.

### Step 6: Choose the Appropriate Change Location

If the existing design centralizes task filtering in the service or repository, prefer extending that path where appropriate. Avoid introducing a second, inconsistent implementation.

### Step 7: Implement and Validate

Add the filter while preserving the default behavior. Check both the filtered and unfiltered cases, along with relevant boundary cases.

### Step 8: Record What Changed

Summarize the new behavior, the relevant implementation location, and any important assumptions. Update technical documentation if the behavior or interface changes make it necessary.

The important result is not simply a working filter. It is a change that fits the existing system, preserves established behavior, and can be understood by another engineer.

## 12. When the Codebase Is Difficult to Understand

Some projects have incomplete documentation, unclear naming, indirect execution paths, or inconsistent patterns.

In these situations, do not compensate by guessing.

Use a controlled investigation:

1. State what you currently believe the code does.
2. Identify the evidence supporting that belief.
3. List the specific uncertainties that could affect the change.
4. Find the smallest experiment, code path, or existing check that can resolve them.
5. Update your understanding based on the evidence.
6. Ask a maintainer for clarification when a business rule or architectural decision cannot be established from the code.

Separate observations from hypotheses.

For example:

- **Observation:** The endpoint calls `task_service.list_tasks()`.
- **Observation:** The service retrieves records through `task_repository`.
- **Hypothesis:** The repository is the intended location for status filtering.
- **Next step:** Inspect existing filtering patterns and the service's responsibilities before deciding.

This makes your reasoning reviewable and reduces the chance that an unverified assumption becomes part of the implementation.

## 13. Production Engineering Perspective

In production systems, codebase exploration is also a risk-management activity.

A seemingly small change may affect:

- Multiple consumers of a shared function.
- API compatibility.
- Data interpretation across services.
- Performance when a large dataset is processed.
- Error behavior relied on by callers.
- Operational behavior such as logs or metrics.

The required investigation should be proportional to the potential impact.

A localized change to an internal helper may need only a short inspection of its callers. A change to a widely used API, shared data model, or core business rule warrants a broader impact assessment.

Keep the following distinction in mind:

- **Understanding the code:** Identifying what the current implementation does.
- **Understanding the requirement:** Identifying what the system should do.
- **Engineering the change:** Deciding how to satisfy the requirement while preserving important system properties.

These activities inform one another, but they are not interchangeable. Existing behavior can be incorrect, and a requirement can be incomplete.

## 14. Common Mistakes

### Reading the Entire Codebase First

**Why it fails:** It consumes time without prioritizing relevant information.

**Better approach:** Start with the requirement, locate the entry point, and trace only the relevant execution path.

### Trusting File and Function Names

**Why it fails:** Names can be misleading or outdated.

**Better approach:** Verify responsibilities by inspecting implementation, callers, tests, and observed behavior.

### Editing the First Relevant File

**Why it fails:** The file where behavior becomes visible may not own the behavior.

**Better approach:** Trace the execution path and identify the appropriate responsibility before modifying code.

### Ignoring Callers and Consumers

**Why it fails:** A change can break other components that depend on the same interface.

**Better approach:** Inspect the relevant dependencies and preserve established contracts unless the requirement explicitly changes them.

### Copying Existing Code Without Evaluation

**Why it fails:** Existing patterns may be unsuitable or defective.

**Better approach:** Understand why the pattern exists before reusing it.

### Refactoring Too Much at Once

**Why it fails:** Broad changes increase review complexity and make regressions harder to isolate.

**Better approach:** Keep the implementation focused. Propose larger improvements separately when practical.

### Treating Comments as Definitive Truth

**Why it fails:** Comments and documentation may not reflect current behavior.

**Better approach:** Compare the stated intent with the implementation and other evidence.

### Guessing When Context Is Missing

**Why it fails:** An assumption can silently become a production defect.

**Better approach:** State the uncertainty, investigate it, and request clarification when necessary.

## 15. Interview Questions and Answers

### Q1. How would you approach an unfamiliar codebase?

Start with the task and expected behavior. Read the project's high-value documentation and configuration, locate the relevant entry point, trace the execution and data paths, inspect relevant callers and tests, and then identify the smallest appropriate change.

### Q2. Why shouldn't you read every file before making a change?

A codebase may contain far more information than the task requires. Exploring everything first wastes effort and obscures relevant details. A requirement-driven investigation prioritizes the information needed to make a safe decision.

### Q3. How do you determine where a change belongs?

Identify the responsibility that owns the requested behavior, inspect existing patterns and dependencies, consider the consumers of the affected interface, and choose the smallest change that fits the current design.

### Q4. What is the difference between an entry point and the implementation of a behavior?

An entry point is where an execution path begins or becomes accessible. The behavior may be implemented across several components invoked from that entry point.

### Q5. What would you do if documentation and code disagree?

Treat the disagreement as an unresolved issue. Compare the implementation with tests and observed behavior, determine whether the documentation is stale or the code is incorrect, and clarify the intended behavior before making a consequential change.

### Q6. How can you minimize regressions when modifying existing code?

Understand the relevant execution path and its consumers, preserve existing contracts, make a focused change, and validate both the new behavior and important existing behavior. Use the testing and quality practices covered in ENG-08.

### Q7. What should you do when you cannot determine the intended behavior from the code?

Document what you observed, identify the specific uncertainty, investigate the smallest relevant evidence, and ask a maintainer or requirement owner for clarification if the missing information affects the implementation decision.

## 16. Practical Assignment

### Scenario

You join an unfamiliar Python application that exposes a task-management API. A new requirement asks you to add a way to retrieve tasks by status.

You have not been told which files should change.

### Part A — Investigation

Write down how you would discover:

1. The application entry point.
2. The current task-list behavior.
3. The location of task status definitions.
4. The path from the API request to the underlying data.
5. The components that consume the result.
6. Existing conventions for filtering and handling invalid status values.

For each finding, distinguish verified evidence from assumptions.

### Part B — Change Planning

Prepare a short implementation plan that states:

- The expected behavior.
- The likely change location and why it is appropriate.
- The existing behavior that must remain unchanged.
- The main compatibility risks.
- The validation needed before considering the change complete.

### Part C — Review

After implementing the change in a suitable practice project, explain:

- Why you selected that implementation location.
- Which alternatives you considered.
- What evidence confirmed your understanding.
- Which assumptions you had to resolve.
- What you would investigate further if the application were significantly larger.

**Completion criterion:** You can explain not only what you changed, but also how you established that it was the correct place and the appropriate scope for the change.

## 17. Revision Questions

Answer these without looking back at the chapter:

1. Why should investigation begin with the requested behavior rather than a directory listing?
2. How do entry points, execution paths, and data flow differ?
3. Why is a function name insufficient evidence of its responsibility?
4. How can you determine whether a change belongs in an API handler, service, repository, or user interface?
5. Why should relevant callers be inspected before changing a shared interface?
6. How should you respond when code, tests, and documentation disagree?
7. How does incremental implementation reduce risk when working in an unfamiliar project?
8. What evidence would you collect before making a change to a widely used component?

## 18. Key Takeaways

- Existing-codebase work begins with understanding the requirement and the current behavior.
- Systematic exploration is more effective than reading files randomly.
- Entry points reveal where behavior begins; execution and data tracing reveal how it works.
- File names, comments, tests, and documentation are evidence, but each may be incomplete.
- The right change location depends on responsibility, existing design, and the required behavior.
- Inspect relevant callers and consumers before changing shared interfaces.
- Follow appropriate existing conventions without copying patterns blindly.
- Make focused changes and validate them using the quality practices established elsewhere in the curriculum.
- When important context is missing, investigate or ask rather than guess.

## 19. Further Reading

- [Chapter 02 — Requirements and Acceptance Criteria](02-Requirements-and-Acceptance-Criteria.md)
- [Chapter 03 — Task Breakdown and Work Planning](03-Task-Breakdown-and-Work-Planning.md)
- [Chapter 04 — Incremental Implementation Workflow](04-Incremental-Implementation-Workflow.md)
- ENG-03 — Software Engineering Principles
- ENG-04 — Version Control and Collaborative Development
- ENG-08 — Development Quality
