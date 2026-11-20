
# 01 — Software Development Lifecycle

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what the Software Development Lifecycle (SDLC) represents.
- Understand why software development requires a repeatable process rather than unstructured coding.
- Describe the major activities involved in developing and maintaining a software change.
- Explain how feedback, validation, and iteration influence development.
- Distinguish a conceptual lifecycle from a rigid sequence of steps.
- Recognize how lifecycle choices affect risk, quality, cost, and maintainability.
- Apply a lifecycle model to a practical software engineering scenario.

## Prerequisites

You should have a basic understanding of programming and how software applications are built.

The following topics are useful references:

- **ENG-03 — Software Engineering Principles:** Software quality and maintainability.
- **ENG-04 — Version Control & Collaborative Development:** Repository and collaboration fundamentals.
- **ENG-08 — Development Quality:** Testing, debugging, and other quality practices.

These topics are prerequisites for some practical applications, not material that this chapter will reteach.

## Estimated Reading Time

15–22 minutes.

## Before We Start

Imagine that a product manager asks you to add a password-reset feature to an existing application.

You could immediately open the code editor and start writing an endpoint, an email function, and a database update.

But several questions remain unanswered:

- What should happen when the user enters an email address that does not exist?
- How should the user prove ownership of the account?
- How long should a reset link remain valid?
- What existing authentication behavior could this change affect?
- How will you determine whether the feature is complete?

Writing code before understanding these questions can create rework, inconsistent behavior, and security problems.

Software engineering involves more than producing code. Engineers must understand the problem, determine the expected behavior, plan the work, implement a solution, validate it, and incorporate what they learn.

The Software Development Lifecycle provides a way to understand and organize these activities.

## 1. What Is the Software Development Lifecycle?

The **Software Development Lifecycle (SDLC)** is a conceptual model describing the major activities involved in creating, changing, operating, and maintaining software over time.

It helps engineers understand how a software change moves from an initial need toward a working result.

A simplified lifecycle is:

```text
Understand the Need
        |
        v
Define Requirements
        |
        v
Plan the Work
        |
        v
Design and Implement
        |
        v
Validate the Result
        |
        v
Complete the Change
        |
        v
Observe Feedback and Maintain
        |
        +--------------------+
        |                    |
        +----> Improve <-----+
```

This diagram represents the relationship between activities. It does not prescribe a mandatory execution order for every project.

For example, validation may reveal a missing requirement. Implementation may reveal a design constraint. Feedback from users may change the original understanding of the problem.

A real development lifecycle therefore includes both forward progress and movement back to earlier activities.

### Why Does the Lifecycle Exist?

Without an organized workflow, development can become a sequence of disconnected actions:

- A developer starts coding before understanding the request.
- Different people interpret the expected behavior differently.
- Implementation grows without clear boundaries.
- Validation happens too late to identify problems cheaply.
- Documentation becomes inconsistent with the application.
- The team cannot clearly explain whether the change is complete.

A lifecycle makes these activities visible and provides a shared way to reason about the work.

It does not eliminate uncertainty or guarantee good software. It helps engineers manage uncertainty systematically.

## 2. The Mental Model: A Software Change Is a Journey

Think of a software change as a journey from a problem to a verified result.

The initial request describes a need, but it may not fully explain the required behavior.

The engineering process gradually turns that need into something more concrete:

```text
Business Need
     |
     v
Clear Expected Behavior
     |
     v
Planned Engineering Work
     |
     v
Implemented Change
     |
     v
Validated Behavior
     |
     v
Completed and Maintainable Change
```

Each stage reduces a different kind of uncertainty.

| Stage | Main uncertainty being reduced |
|---|---|
| Understanding the need | What problem are we solving? |
| Defining requirements | What should the software do? |
| Planning | What work is required, and in what order? |
| Implementation | How should the change be realized in code? |
| Validation | Does the result behave as expected? |
| Completion and maintenance | Is the change ready for its intended use, and can it be maintained? |

The stages are connected, but the uncertainty does not disappear permanently. New information can require earlier decisions to be revisited.

## 3. Core Lifecycle Activities

### 3.1 Understanding the Need

Before implementing a change, an engineer needs to understand the problem that the change is intended to solve.

A request might say:

> Users should be able to reset their passwords.

That statement identifies a desired capability, but it does not define all the expected behavior.

The engineer needs to understand the user's problem, the intended outcome, relevant constraints, and the existing system behavior.

Useful questions include:

- Who needs this capability?
- What problem are they experiencing?
- What outcome should the change produce?
- What constraints already exist?
- Which parts of the current system may be affected?

The goal is not to collect every possible detail before doing any work. It is to understand enough to make responsible engineering decisions and identify unresolved questions.

**Output:** A shared understanding of the problem and the intended outcome.

Detailed requirement-writing techniques belong to [02 — Requirements and Acceptance Criteria](02-Requirements-and-Acceptance-Criteria.md).

### 3.2 Defining Requirements

Requirements describe the behavior or constraints that the software must satisfy.

For the password-reset example, requirements might include:

- A user can request a password-reset link.
- The link contains a time-limited token.
- A valid token allows the user to set a new password.
- An expired or invalid token cannot reset the password.
- The user receives appropriate feedback when the operation succeeds or fails.

These requirements help establish what the implementation must achieve.

Requirements may evolve as the team discovers technical constraints or clarifies user expectations.

**Output:** A clearer definition of expected behavior and completion conditions.

### 3.3 Planning the Work

Once the intended behavior is sufficiently clear, the engineer identifies the work required to implement it.

The password-reset feature might involve:

1. Understanding the existing authentication flow.
2. Defining token generation and validation behavior.
3. Implementing the request endpoint.
4. Implementing the reset operation.
5. Integrating email delivery.
6. Validating successful and unsuccessful scenarios.
7. Updating relevant documentation.

These items are illustrative tasks, not a complete security design.

Planning helps reveal dependencies and makes a large change easier to reason about.

For example, implementing token validation before defining the token's properties can lead to unnecessary rework.

**Output:** A manageable set of work items and an understanding of their relationships.

See [03 — Task Breakdown and Work Planning](03-Task-Breakdown-and-Work-Planning.md) for the detailed techniques.

### 3.4 Designing and Implementing

Implementation turns the intended behavior into working software.

Engineers may need to examine the existing architecture, identify the appropriate modules, choose an implementation approach, and make changes to code or other project artifacts.

The implementation should remain connected to the original requirement.

For example, adding a password-reset endpoint is not sufficient if the endpoint does not validate the reset token correctly.

Implementation is often incremental. Engineers make a small change, inspect its behavior, validate relevant assumptions, and then continue.

**Output:** A concrete implementation of the required behavior.

See [04 — Incremental Implementation Workflow](04-Incremental-Implementation-Workflow.md) for the detailed implementation process.

### 3.5 Validating the Result

Validation determines whether the implemented change behaves as intended and satisfies its relevant requirements.

For the password-reset feature, validation might include:

- Requesting a reset link with a valid email address.
- Handling an unknown email address appropriately.
- Successfully resetting a password with a valid token.
- Rejecting an expired token.
- Rejecting an invalid token.
- Confirming that the new password works as expected.

Different validation activities provide different kinds of evidence. The appropriate approach depends on the behavior, risk, and scope of the change.

Validation can reveal defects, missing requirements, incorrect assumptions, or integration problems.

A failed validation does not necessarily mean the entire implementation must be discarded. It identifies something that requires investigation.

**Output:** Evidence about whether the change satisfies its expected behavior, along with findings that need to be addressed.

Detailed testing, debugging, and related quality practices belong to ENG-08 — Development Quality.

### 3.6 Completing the Change

A change is not necessarily complete just because the code has been written.

Completion depends on the intended scope and the relevant acceptance conditions.

Before considering a change complete, an engineer should establish that:

- The agreed behavior has been implemented.
- Relevant validation has been performed.
- Important defects or unresolved issues are understood.
- Necessary documentation has been updated.
- Required review or approval steps have been completed, where applicable.
- The result meets the applicable completion criteria.

These checks are not a universal release checklist. A small internal change and a security-sensitive authentication change may require different levels of evidence and approval.

The important principle is that completion should be based on explicit conditions rather than personal intuition.

**Output:** A change whose completion status can be explained and justified.

### 3.7 Feedback and Maintenance

Software continues to evolve after an individual change is completed.

Users may discover usability problems. Monitoring may reveal unexpected behavior. New requirements may emerge. Dependencies or surrounding systems may change.

These observations can create new development work.

For example, users might report that password-reset emails arrive too slowly. Investigation may reveal that the email-delivery process needs improvement.

The team then starts another cycle of understanding, planning, implementation, and validation.

Feedback is therefore not merely the final activity in a lifecycle. It influences the entire process.

**Output:** New information that supports maintenance, correction, and future improvements.

## 4. How the Lifecycle Works in Practice

Consider a request to add profile-picture uploads to an existing application.

A simplified development workflow might look like this:

```text
Request:
Users need profile pictures
          |
          v
Clarify expected behavior
          |
          v
Identify constraints
File type, size, permissions, storage
          |
          v
Inspect the existing application
          |
          v
Break the change into tasks
          |
          v
Implement a small part
          |
          v
Validate the behavior
       /       \
      /         \
   Pass         Fail
    |             |
    v             v
Continue       Investigate
implementation and correct
    |             |
    +<------------+
          |
          v
Review completion conditions
          |
          v
Update relevant documentation
          |
          v
Complete the change
          |
          v
Use feedback to identify improvements
```

The flow illustrates several important points.

First, understanding and planning happen before substantial implementation, but the engineer may return to them when new information appears.

Second, validation occurs throughout development, not only at the end.

Third, completing the current change does not mean the software will never need further work.

Finally, the diagram is an example of a workflow, not a universal procedure. A small change may require only a few of these activities, while a large or risky change may need more extensive investigation and review.

## 5. Lifecycle Models and Their Trade-offs

Different teams organize lifecycle activities in different ways.

The following models are useful ways to reason about that organization. They are not the same as the individual activities described earlier.

### 5.1 Sequential or Waterfall-Style Development

In a sequential approach, major activities are organized into relatively distinct phases. Teams generally establish requirements and design decisions before moving deeply into implementation.

A simplified representation is:

```text
Requirements
     |
     v
Design
     |
     v
Implementation
     |
     v
Validation
     |
     v
Completion
```

**Advantages**

- Major phases and expected deliverables are easier to identify.
- Planning and documentation can be established early.
- The approach may suit work with stable requirements and formal approval requirements.

**Trade-offs**

- Assumptions may remain untested for too long.
- Discoveries made during implementation can force expensive changes to earlier decisions.
- Users may receive useful feedback opportunities relatively late.

Sequential development does not mean that feedback or changes are impossible. It means that the workflow places greater emphasis on defined phases.

### 5.2 Iterative Development

In iterative development, the team repeatedly revisits and improves a solution.

An early version may reveal that the original requirements were incomplete or that the chosen approach needs adjustment.

For example, a team may first implement basic profile-picture uploads, learn from the initial result, and then improve validation and error handling.

**Advantages**

- Assumptions can be tested earlier.
- New information can influence later work.
- The solution can improve through repeated evaluation.

**Trade-offs**

- Poorly controlled iteration can create rework.
- Requirements may continue changing without a clear decision process.
- The team still needs explicit completion criteria.

Iteration does not mean making random changes. Each cycle should produce useful progress or information.

### 5.3 Incremental Development

In incremental development, the system is extended through smaller additions of functionality.

For example, a profile-management feature might be developed through separate increments:

1. Allow users to select an image.
2. Validate the selected file.
3. Store the image.
4. Display the image on the profile.
5. Handle replacement and failure cases.

Each increment contributes part of the intended capability.

**Advantages**

- Progress is easier to inspect.
- Problems may be isolated to a smaller change.
- Useful functionality can be built in manageable steps.

**Trade-offs**

- Increments need to fit together coherently.
- Poor task boundaries can create integration problems.
- Early increments may not deliver the complete user experience.

Incremental development and iterative development are related, but they emphasize different things: increments add portions of functionality, while iterations revisit and improve a solution. A team can use both.

### 5.4 Agile Approaches

Agile is an umbrella for approaches that emphasize adaptability, collaboration, frequent feedback, and delivering useful software.

Agile approaches commonly use iterative and incremental development.

For example, a team may deliver a small, usable profile-management capability, gather feedback, and adjust the next set of work based on what it learns.

Agile does not mean the absence of planning, requirements, documentation, or engineering discipline. It means adapting those practices to support effective delivery and learning.

The exact process depends on the approach adopted by the team.

### 5.5 Comparing the Models

| Dimension | Sequential approach | Iterative approach | Incremental approach |
|---|---|---|---|
| Primary emphasis | Defined phases | Repeated evaluation and improvement | Adding functionality in portions |
| Feedback | May arrive later between major phases | Influences successive iterations | Helps shape later increments |
| Handling uncertainty | Benefits from relatively stable requirements | Accommodates evolving understanding | Allows functionality to be delivered in pieces |
| Main risk | Late discovery of incorrect assumptions | Uncontrolled rework | Poorly integrated increments |
| Suitable conditions | Stable requirements and formal phase controls | Significant uncertainty or learning needs | Functionality that can be divided into coherent parts |

These are general tendencies, not guarantees. Real teams often combine techniques from several models.

## 6. Choosing an Appropriate Workflow

There is no single lifecycle model that is best for every software project.

The choice depends on the uncertainty, risk, constraints, and feedback available.

Consider the following factors.

**Requirement stability**

If requirements are stable and well understood, more upfront planning may be practical. If important requirements are uncertain, early implementation experiments and feedback can reduce the risk of building the wrong thing.

**Cost of failure**

A change that affects authentication, payments, or sensitive data may require stronger review and validation than a low-risk internal improvement.

The lifecycle should account for the consequences of an incorrect result.

**Feedback speed**

If the team can evaluate a change quickly, shorter feedback cycles may help identify incorrect assumptions earlier.

**Dependency constraints**

Some work cannot begin until another component, decision, or external dependency is available. The workflow must account for these relationships.

**Team and organizational constraints**

Approval requirements, regulatory obligations, release coordination, and team structure may influence how the work is organized.

The objective is not to adopt the most complicated process. It is to use a process that provides sufficient control and feedback for the work being performed.

## 7. Production Engineering Perspective

The lifecycle is especially useful when software is maintained by multiple engineers over time.

A production codebase contains existing behavior, dependencies, assumptions, and operational constraints. A change that appears small in isolation may affect several connected components.

Consider adding a field to a user profile.

The code change might be small, but the complete engineering task could involve:

- Understanding the existing profile behavior.
- Determining which components consume the profile data.
- Establishing expected behavior for old and new records.
- Implementing the change.
- Validating relevant use cases.
- Updating documentation or usage examples.
- Identifying any unresolved compatibility concerns.

The lifecycle encourages engineers to consider the complete change rather than focusing exclusively on the code they need to write.

### Completion Is Not the Same as Deployment

A change may be implemented and validated without having been deployed to production.

Deployment and operational processes have their own engineering concerns and curriculum boundaries.

For this chapter, the relevant distinction is that development completion should be defined in terms of the change's agreed scope and completion conditions. It should not be treated as proof that every subsequent operational activity has occurred.

### Maintain Evidence of Important Decisions

For meaningful changes, the team should be able to explain:

- What problem the change addresses.
- What behavior was intended.
- What was implemented.
- What validation was performed.
- What important limitations or unresolved issues remain.

The appropriate amount of evidence depends on the change's risk and complexity.

Documentation and change traceability are covered in [07 — Documentation and Change Traceability](07-Documentation-and-Change-Traceability.md).

## 8. Common Mistakes and Misconceptions

### Mistake 1: Treating the Lifecycle as a Rigid Checklist

A lifecycle model describes connected activities. It does not mean every task must move forward without revisiting earlier decisions.

**Better approach:** Revisit requirements, planning, or design when implementation and validation reveal important new information.

### Mistake 2: Starting Implementation Before Understanding the Problem

Beginning to code immediately can create a solution that does not address the actual need.

**Better approach:** Establish the intended outcome and identify critical unknowns before committing to an implementation.

### Mistake 3: Treating Validation as the Final Step Only

Waiting until all implementation is complete can allow incorrect assumptions to spread across multiple components.

**Better approach:** Validate relevant behavior as the implementation develops.

### Mistake 4: Confusing More Process with Better Engineering

Adding meetings, documents, approvals, and tools does not automatically improve outcomes.

**Better approach:** Choose practices that reduce meaningful uncertainty, prevent important failures, or improve coordination.

### Mistake 5: Assuming Agile Means No Planning

Adaptability still requires understanding the problem, making decisions, and managing dependencies.

**Better approach:** Plan enough to make progress responsibly, then update the plan when new information justifies doing so.

### Mistake 6: Declaring a Change Complete Because the Code Runs

A program can execute successfully while failing to meet the requested behavior.

**Better approach:** Evaluate the change against explicit acceptance conditions and relevant quality expectations.

### Mistake 7: Assuming Every Project Needs the Same Lifecycle

A small script and a security-sensitive service do not necessarily need identical controls.

**Better approach:** Scale planning, validation, documentation, and review according to risk and complexity.

## 9. Practical Assignment

### Scenario

You are working on an existing task-management application.

A stakeholder requests:

> Users should be able to mark tasks as important and view important tasks separately.

Your responsibility is to explain how you would approach this request using the Software Development Lifecycle.

Do not start by writing code. First describe the development work.

### Part A — Understand the Need

Write down:

- The problem the stakeholder is trying to solve.
- The expected user outcome.
- At least three questions that need clarification.

### Part B — Define the Work

Identify:

- The expected behavior of the feature.
- The major implementation activities.
- At least one dependency between activities.

Detailed acceptance-criteria and task-decomposition techniques will be covered in Chapters 02 and 03. For this assignment, focus on the overall lifecycle.

### Part C — Plan Validation

Describe how you would determine whether the feature behaves correctly.

Include at least one normal scenario and one failure or edge scenario.

### Part D — Handle Feedback

Suppose validation reveals that a task's important status disappears when the application restarts.

Explain:

- What the observation tells you.
- Which earlier activities might need to be revisited.
- How you would decide whether the change is ready for completion.

### Part E — Explain Your Reasoning

In a short paragraph, explain why immediately writing code would be an incomplete response to the original request.

**Expected outcome:** You should be able to describe the complete development journey and explain how feedback affects decisions throughout it.

## 10. Interview Questions with Expected Answers

### Q1. What is the Software Development Lifecycle?

**Expected answer:** The SDLC is a conceptual model describing the major activities involved in creating, changing, and maintaining software. It helps organize work from understanding the need through implementation, validation, completion, and subsequent feedback.

### Q2. Why is software development more than writing code?

**Expected answer:** Code implements behavior, but successful software changes also require understanding the problem, defining expected outcomes, planning work, validating correctness, and maintaining relevant technical information.

### Q3. Is the Software Development Lifecycle always linear?

**Expected answer:** No. Lifecycle diagrams often present activities sequentially for clarity, but real development includes feedback loops. Validation and implementation can reveal information that requires changes to requirements, plans, or design decisions.

### Q4. What is the difference between iterative and incremental development?

**Expected answer:** Iterative development emphasizes revisiting and improving a solution through repeated cycles. Incremental development emphasizes adding functionality in smaller portions. A team can combine both approaches.

### Q5. When might a sequential development approach be useful?

**Expected answer:** It may be appropriate when requirements are relatively stable, phase boundaries are important, and formal planning or approval requirements apply. Its suitability depends on the project's constraints and risks.

### Q6. Does Agile eliminate the need for planning and documentation?

**Expected answer:** No. Agile approaches emphasize adaptability and feedback, but planning and documentation remain useful when they help teams coordinate work, preserve important information, and deliver reliable software.

### Q7. Why should validation happen throughout development?

**Expected answer:** Earlier validation can reveal incorrect assumptions and defects before they spread into additional implementation work. This creates opportunities to correct problems while the relevant change is still manageable.

### Q8. How should an engineer determine whether a change is complete?

**Expected answer:** The engineer should compare the result against the agreed scope and completion conditions, consider relevant validation evidence, address important unresolved issues, and complete applicable review and documentation activities.

### Q9. How should lifecycle practices change for a high-risk feature?

**Expected answer:** Higher-risk features generally justify stronger requirements analysis, more careful design, additional validation, and appropriate review. The process should be proportional to the potential consequences of failure.

### Q10. A feature passes its initial tests but users report incorrect behavior. What does this indicate?

**Expected answer:** The validation performed so far did not establish that all relevant behavior was correct. The engineer should investigate the reported behavior, identify whether requirements or assumptions were incomplete, correct the problem, and perform appropriate additional validation.

## 11. Quick Revision

The Software Development Lifecycle organizes the activities involved in delivering and maintaining software changes.

Remember the central sequence:

**Understand → Define → Plan → Implement → Validate → Complete → Learn**

- Understanding establishes the problem.
- Requirements define expected behavior.
- Planning identifies the necessary work and dependencies.
- Implementation realizes the intended behavior.
- Validation provides evidence of correctness.
- Completion depends on the agreed scope and conditions.
- Feedback informs corrections and future improvements.

The lifecycle is a mental model, not a rigid sequence. Activities can overlap, and new information may require revisiting earlier decisions.

Sequential, iterative, and incremental approaches organize work differently. The appropriate approach depends on uncertainty, risk, feedback, dependencies, and organizational constraints.

Most importantly, **a completed code change is not automatically a correct or complete software change**. Engineering completion requires evidence that the intended behavior has been addressed appropriately.

## 12. Key Takeaways

- Software development includes understanding, planning, implementation, validation, and maintenance—not just coding.
- The SDLC provides a shared model for organizing development work.
- Feedback loops help engineers correct assumptions and improve solutions.
- Sequential, iterative, and incremental development represent different ways of organizing lifecycle activities.
- The appropriate workflow depends on the problem, uncertainty, risk, and constraints.
- Completion should be based on explicit conditions and relevant evidence.
- Lifecycle practices should provide useful control without creating unnecessary process overhead.

## 13. Further Reading

The following resources provide additional perspectives on software development processes and lifecycle practices:

- [ISO/IEC/IEEE 12207 — Systems and Software Engineering: Software Life Cycle Processes](https://www.iso.org/standard/63712.html)
- [Agile Manifesto](https://agilemanifesto.org/)
- [The Scrum Guide](https://scrumguides.org/scrum-guide.html)

These resources provide broader lifecycle and process perspectives. They do not replace the lessons in this chapter.
