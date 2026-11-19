# AGT-01.02 — Agent vs LLM Applications, Workflows, and RAG Systems

## Learning Objectives

By the end of this chapter, you should be able to:

- distinguish an LLM application from an agentic system
- distinguish a RAG application from an agentic system
- distinguish a conventional workflow from an agentic system
- explain why RAG does not automatically make an application an agent
- explain why workflows and agents are not mutually exclusive
- compare architectures using execution responsibility rather than labels
- reason about who determines the next step in an application
- distinguish predetermined orchestration from dynamically selected actions
- understand the role of adaptation, action selection, goal pursuit, state, and autonomy
- recognize that state or autonomy alone does not define an agent
- choose a simpler LLM application, RAG application, workflow, or agentic architecture when appropriate

---

## Prerequisites

Before reading this chapter, you should understand:

- the basic definition of an agent
- the distinction between an agent and an agent system
- goal-directed behavior
- agent/environment interaction
- actions and observations
- autonomy as a foundational agent concept

These concepts were established in:

- [AGT-01.01 — Agent Definition and System Boundaries](./01-Agent-Definition-and-System-Boundaries.md)

You do not need prior knowledge of agent frameworks.

---

## Estimated Reading Time

**30–40 minutes**

---

## Before We Start

The words **LLM application**, **RAG system**, **workflow**, and **agent** are often used as if they describe four completely separate categories.

Real systems are more complicated.

A production system may combine several of these patterns:

- an agent may use RAG
- an agent may invoke a deterministic workflow
- a workflow may contain an agent
- an LLM application may maintain state
- a RAG application may contain multiple decision points

Therefore, the goal of this chapter is not to create rigid labels.

The goal is to understand the **architectural responsibility** behind each pattern.

A useful question throughout this chapter is:

> **Who or what is responsible for determining what happens next?**

That question is often more useful than asking:

> “Is this system an agent?”

---

## Why This Exists

An LLM by itself does not tell us what the surrounding application architecture looks like.

The same model can participate in very different systems.

For example, a model could:

1. receive a user question and generate an answer
2. receive a question, retrieve documents, and generate an answer
3. execute a predefined sequence of business operations
4. decide which action to take based on the current situation
5. interact with external systems and continue pursuing a goal

All five systems may use the same underlying model.

Yet they have very different execution responsibilities.

This distinction matters because architecture determines:

- where decisions are made
- how execution progresses
- how much adaptation is possible
- what the system is responsible for
- what failure modes exist
- how much autonomy is appropriate
- how difficult the system is to test and operate

The objective is therefore not to decide that one pattern is universally better.

The objective is to select the **simplest architecture that provides the required behavior**.

---

## Mental Model

We can begin with four simplified mental models.

These are conceptual models, not universal implementation rules.

## 1. LLM Application

A simple LLM application can be represented as:

```text
Input
  ↓
Model
  ↓
Output
```

The surrounding application supplies input to the model and uses the resulting output.

The application may contain additional business logic, validation, formatting, authentication, persistence, or other components.

The important point is that the central model interaction does not necessarily imply autonomous goal pursuit.

---

## 2. RAG Application

A basic RAG application can be represented as:

```text
Input
  ↓
Retrieval
  ↓
Model
  ↓
Output
```

The system retrieves relevant information and provides it to the model before generating an answer.

RAG therefore changes how information is supplied to the model.

It does not, by itself, define how much autonomy the overall system has.

A RAG application can be completely deterministic.

It can also be part of a more complex agentic system.

---

## 3. Workflow

A conventional workflow can be represented as:

```text
Step A
  ↓
Step B
  ↓
Step C
  ↓
Step D
```

The important characteristic is not that the workflow must always be linear.

A real workflow may contain:

- conditions
- branches
- loops
- retries
- parallel execution
- human decisions
- dynamically computed values

The important architectural characteristic is that the orchestration logic is **explicitly designed by the system's developers**.

The system can therefore make runtime decisions without becoming an agent.

---

## 4. Agent

A conceptual agent model can be represented as:

```text
Goal
  ↓
Decision
  ↓
Action
  ↓
Observation
  ↓
Decision
  ↓
Action
  ↓
...
```

The important idea is that the system can select what to do next as part of pursuing a goal and responding to the current situation.

The sequence is therefore not necessarily completely predetermined.

Again, this is a mental model.

Real agent systems can contain workflows, planning components, retrieval, human approval, and many other mechanisms.

---

# The Four Patterns Compared

A useful first comparison is:

| Dimension | LLM Application | RAG Application | Workflow | Agentic System |
|---|---|---|---|---|
| Primary responsibility | Generate or transform model output | Retrieve information and use it for generation or decision support | Orchestrate explicitly designed execution | Pursue a goal through dynamically selected actions |
| Who primarily determines the next step? | Application logic | Application/retrieval logic | Explicit orchestration logic | Agent system's decision process |
| Execution structure | Often simple request/response | Retrieval followed by generation or downstream use | Explicitly designed sequence/graph | Potentially adaptive sequence of decisions and actions |
| Adaptation | Usually limited by application design | Usually limited by application design | Can be explicitly programmed | Can be a fundamental part of behavior |
| Action selection | Usually application-controlled | Usually application-controlled | Orchestration-controlled | May be dynamically selected |
| Goal pursuit | May be implicit | May be implicit | Explicitly encoded in workflow logic | Central architectural responsibility |
| State | Optional | Optional | Often useful | Often important, but not sufficient by itself |
| Autonomy | Not necessarily required | Not necessarily required | May include limited automation | Meaningful autonomy is part of the agent concept |
| Changing conditions | Handled by application logic | Handled by retrieval/application logic | Handled through designed branches and conditions | Can influence subsequent decisions and actions |
| Execution responsibility | Application | Application plus retrieval | Workflow/orchestration layer | Agent system |

This table should not be interpreted as a set of hard boundaries.

It is a way to reason about **where execution responsibility lives**.

---

## LLM Applications

An LLM application is an application that uses a language model as one of its components.

For example:

```text
User
  ↓
Application
  ↓
LLM
  ↓
Response
```

The application may perform:

- input validation
- authentication
- prompt construction
- model invocation
- output parsing
- response formatting
- persistence
- business-rule checks

None of these automatically make the application an agent.

## Example

Suppose a customer-support API receives:

> "How do I reset my password?"

The application sends the request to an LLM and returns the generated response.

The model may be capable of reasoning internally.

That does not mean the surrounding application is necessarily an agent.

The important architectural question is:

> Does the system have responsibility for pursuing a goal through dynamically selected actions and interaction with an environment?

If not, simply using an LLM does not establish agentic behavior.

---

# RAG Applications

Retrieval-Augmented Generation adds an information retrieval step to an application.

A simplified architecture is:

```text
User Query
    ↓
Retrieval
    ↓
Relevant Information
    ↓
LLM
    ↓
Answer
```

The retrieval component may provide:

- documents
- passages
- records
- policies
- product information
- knowledge-base content

The model then uses the retrieved information as part of generating an answer or other output.

The important architectural point is:

> **RAG primarily describes how relevant external information is incorporated into an application.**

It does not, by itself, define the system's level of autonomy.

---

# RAG Is Not Automatically an Agent

Consider this system:

```text
User Question
      ↓
Retrieve Documents
      ↓
Generate Answer
      ↓
Return Answer
```

The system may use:

- embeddings
- a vector database
- keyword search
- metadata filtering
- reranking
- an LLM

It still does not automatically become an agent.

Why?

Because those components describe **information retrieval and generation**, not necessarily autonomous goal pursuit.

The system may simply execute a predefined request-processing pipeline.

For example:

```text
Question
   ↓
Retrieve
   ↓
Generate
   ↓
Return
```

There may be no meaningful agent-level responsibility for deciding what action to take next.

Therefore:

> **RAG is an application/retrieval pattern; RAG alone does not define an agent.**

Detailed retrieval engineering belongs to the Retrieval Engineering domain.

AGT-01 only needs to understand how retrieval may participate in a larger agent architecture.

---

# RAG and Agents Can Be Combined

RAG and agents are not competing categories.

An agent can use retrieval as one of its capabilities.

For example:

```text
Goal
  ↓
Agent Decision
  ↓
Retrieve Information
  ↓
Observe Retrieved Information
  ↓
Agent Decision
  ↓
Take Action
  ↓
Observe Result
  ↓
Continue
```

In this architecture:

- RAG provides information
- the agent determines how that information participates in the broader task

The agent may decide:

- whether retrieval is needed
- what information to retrieve
- whether additional information is required
- whether the retrieved information is sufficient
- what action should follow

The details of retrieval engineering belong elsewhere.

The architectural distinction is what matters here:

> **Retrieval can be a capability inside an agent system without making retrieval itself the definition of the agent.**

---

# Workflow Systems

A workflow is an orchestration pattern in which execution logic is explicitly designed.

For example:

```text
Receive Order
     ↓
Validate Order
     ↓
Check Inventory
     ↓
Charge Payment
     ↓
Create Shipment
     ↓
Send Confirmation
```

This system can be highly sophisticated.

It may contain:

```text
                ┌──> Reject Order
                │
Validate Order ─┤
                │
                └──> Continue
                         ↓
                   Check Inventory
```

The presence of branching does not automatically make it an agent.

The workflow still follows orchestration rules explicitly designed for the business process.

---

# Workflows Are Not Necessarily Static

A common misconception is:

> “A workflow is always fixed, while an agent is always dynamic.”

That is too simplistic.

A workflow can make runtime decisions.

For example:

```text
Receive Request
      ↓
Check Customer Type
      ↓
   ┌──┴──┐
   ↓     ↓
Standard Premium
   ↓     ↓
Path A  Path B
   └──┬──┘
      ↓
   Complete
```

The actual path depends on runtime information.

The workflow is therefore dynamic in its execution path.

What makes it a workflow is that the possible orchestration logic is explicitly designed.

This is different from an agent system where action selection can itself be part of the system's goal-directed decision process.

Therefore:

> **Dynamic execution alone does not make a system an agent.**

---

# Workflow vs Agent

The most useful distinction is not:

```text
Workflow = static
Agent = dynamic
```

A better distinction is:

```text
Workflow

Developer-designed orchestration
            ↓
      Runtime conditions
            ↓
     Selected workflow path
```

versus:

```text
Agent

Goal + current situation
            ↓
   Agent decision process
            ↓
     Selected action
            ↓
       Observation
            ↓
     Further decision
```

Both systems can make decisions.

The difference is primarily **where the responsibility for selecting the next meaningful action resides and how that selection is defined**.

A workflow generally executes an explicitly designed orchestration policy.

An agent system can select actions as part of pursuing a goal in response to its current observations and situation.

---

# Workflow Can Contain an Agent

A workflow and an agent do not have to be alternatives.

A workflow may invoke an agent for a specific task.

For example:

```text
Receive Support Ticket
        ↓
Classify Ticket
        ↓
        ┌─────────────────────┐
        │ Agent Investigation │
        └─────────────────────┘
                  ↓
        Generate Investigation Result
                  ↓
            Human Review
                  ↓
            Close Ticket
```

The workflow controls the overall business process.

The agent handles a bounded subtask.

This architecture can be useful when the overall process needs deterministic orchestration but one step benefits from adaptive reasoning.

---

# Agent Can Also Use Workflows

The relationship can also work in the opposite direction.

An agent may decide that a particular business operation should be executed through a predefined workflow.

For example:

```text
Goal
  ↓
Agent Decision
  ↓
"Customer refund is required"
  ↓
Invoke Refund Workflow
  ↓
Validate
  ↓
Authorize
  ↓
Process Refund
  ↓
Return Result
  ↓
Agent
```

The agent does not need to manually reason through every low-level business operation.

A deterministic workflow can provide a controlled execution path for a known process.

This is often a useful production design because it combines:

- adaptive decision-making where it adds value
- deterministic execution where determinism is desirable

---

# State Does Not Automatically Make a System an Agent

State is important in many systems.

An application may store:

- conversation history
- user preferences
- session data
- workflow progress
- transaction status
- cached results
- previous outputs

This does not automatically make the application an agent.

For example:

```text
User
 ↓
Chat Application
 ↓
Conversation State
 ↓
LLM
 ↓
Response
```

This system can be stateful without having agentic behavior.

Therefore:

> **Statefulness is not the defining property of an agent.**

State becomes relevant to agent systems because agents often need information about the current execution situation, previous observations, or progress toward a goal.

Detailed state, context, and memory engineering belongs to AGT-04.

---

# Autonomy Alone Does Not Define an Agent

Automation and autonomy can exist in many software systems.

For example, a scheduled system may automatically:

```text
Run Every Night
      ↓
Extract Data
      ↓
Transform Data
      ↓
Load Data
      ↓
Generate Report
```

The system acts without a human manually triggering every step.

That does not necessarily make it an agent.

Automation means that work occurs without continuous human execution.

Agentic autonomy concerns a system having meaningful responsibility for selecting actions in pursuit of a goal.

Therefore:

> **Automation is not synonymous with agentic autonomy.**

Similarly:

> **Autonomy alone does not define an agent.**

The broader architecture still matters.

---

# Action Selection

Action selection is one of the important distinctions between ordinary application behavior and agentic behavior.

Consider a simple API:

```text
Request
  ↓
Validate
  ↓
Call Database
  ↓
Return Response
```

The actions are explicitly defined by the application.

Now consider a system given the goal:

> “Investigate why this customer's payment failed and resolve the issue if possible.”

The system may need to determine whether it should:

```text
Check Payment Record
        ↓
Check Account Status
        ↓
Inspect Transaction History
        ↓
Contact Payment Service
        ↓
Determine Cause
        ↓
Take Appropriate Action
```

The exact sequence may depend on what the system observes.

This is where agentic behavior becomes architecturally meaningful.

The key question is not:

> “Does the system perform actions?”

Many software systems perform actions.

The better question is:

> **Does the system have meaningful responsibility for selecting actions as part of pursuing its goal?**

---

# Adaptation

Adaptation means that subsequent behavior can change based on what happens during execution.

For example:

```text
Goal
  ↓
Action A
  ↓
Observation
  ↓
Observation indicates failure
  ↓
Choose Action B instead
```

A workflow can also contain adaptation if developers explicitly design branches for different conditions.

Therefore, adaptation alone does not define an agent.

The distinction is whether the adaptation comes from:

- explicitly designed orchestration rules
- dynamically selected agent behavior
- or a combination of both

This is why architecture must be analyzed by responsibility rather than labels.

---

# Goal Pursuit

Goals are important to agent systems.

A goal provides the outcome that the system is attempting to achieve.

For example:

> “Resolve the customer's billing issue.”

The system may need to determine:

- what information is required
- what actions are available
- what should happen after each observation
- whether the goal has been achieved
- whether another action is required

A conventional workflow can also have a goal.

For example:

> “Complete the customer refund process.”

Therefore, **having a goal is not by itself sufficient to distinguish an agent from a workflow**.

The more important question is how the system translates that goal into execution.

A workflow may encode the execution path explicitly.

An agent may have meaningful responsibility for selecting actions and adapting its behavior while pursuing the goal.

---

## Execution Responsibility

This provides a useful way to compare the architectures.

## LLM Application

The application is primarily responsible for deciding:

```text
What input should go to the model?
What should happen with the model output?
```

The model provides generation or reasoning capabilities.

---

## RAG Application

The application is responsible for:

```text
What should be retrieved?
How should retrieved information be supplied?
What should happen with the generated result?
```

The retrieval system supplies information.

The model generates or transforms the result.

---

## Workflow

The orchestration layer is responsible for:

```text
What step comes next?
What conditions determine the path?
What happens when a step succeeds or fails?
```

The execution logic is explicitly designed.

---

## Agent

The agent system has meaningful responsibility for:

```text
What action should be taken next
given the goal and current situation?
```

The answer may depend on:

- the current goal
- available capabilities
- previous observations
- external results
- current state
- constraints
- the outcome of previous actions

This does not mean the agent has unlimited freedom.

Production agents should operate within defined boundaries.

Detailed bounded-autonomy engineering belongs to AGT-02.

---

# A More Precise Comparison

The following table summarizes the distinction:

| Question | LLM Application | RAG Application | Workflow | Agentic System |
|---|---|---|---|---|
| What is the primary pattern? | Model interaction | Retrieval + model interaction | Explicit orchestration | Goal-directed adaptive execution |
| Is a model required? | Usually yes | Usually yes | Not necessarily | Often, but not conceptually required as the sole defining feature |
| Is retrieval required? | No | Yes, by definition of the RAG pattern | No | No, but it may be used |
| Is a predefined execution structure required? | Often simple application logic | Often simple retrieval pipeline | Explicit orchestration logic | Not necessarily |
| Can execution branch? | Yes | Yes | Yes | Yes |
| Can execution adapt? | Yes, if application logic supports it | Yes, if application logic supports it | Yes, through designed logic | Yes, potentially as part of agent decision-making |
| Can it maintain state? | Yes | Yes | Yes | Yes |
| Does state make it an agent? | No | No | No | No |
| Does automation make it an agent? | No | No | No | No |
| Is goal pursuit relevant? | Sometimes | Sometimes | Often | Central |
| Is dynamic action selection relevant? | Not necessarily | Not necessarily | Usually constrained by designed orchestration | Often central |
| Can it use workflows? | Yes | Yes | It is the workflow | Yes |
| Can it use RAG? | Yes | Yes | Yes | Yes |
| Is autonomy foundational? | No | No | Not necessarily | Meaningful autonomy is part of the agent concept |

Again, these categories can overlap.

They should therefore be treated as **architectural patterns and responsibilities**, not mutually exclusive product labels.

---

## Important Non-Exclusive Relationships

The four categories can be combined.

A system can look like:

```text
                 ┌──────────────┐
                 │   Workflow   │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │    Agent     │
                 └──────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       RAG System     API Tool     LLM
```

This is not contradictory.

Each component has a different responsibility.

For example:

- the workflow controls the business process
- the agent handles an adaptive subtask
- RAG supplies information
- an API provides an external capability
- the LLM provides model-based generation/reasoning

The architecture should therefore be described in terms of **what each component does**, not only by assigning one label to the whole system.

---

# Responsibility Over Labels

Suppose someone asks:

> “Is this an agent?”

A better engineering response is to ask:

1. What is the system's goal?
2. What determines the next meaningful step?
3. Which component selects actions?
4. What information influences that decision?
5. Does the system observe results and respond to them?
6. Is the execution path explicitly orchestrated?
7. Is the system expected to operate with meaningful autonomy?
8. Which parts are deterministic?
9. Which parts are adaptive?
10. Where is the boundary between the agent and external systems?

These questions provide more useful architectural information than a label alone.

---

## Practical Example: Customer Support

Consider a customer-support system.

## Architecture A — Simple LLM Application

```text
Customer Question
        ↓
LLM
        ↓
Answer
```

This may be enough when the system only needs to generate conversational responses.

---

## Architecture B — RAG Application

```text
Customer Question
        ↓
Retrieve Support Documents
        ↓
LLM
        ↓
Answer
```

This is useful when answers should be grounded in organizational knowledge.

---

## Architecture C — Workflow

```text
Ticket Received
      ↓
Classify Ticket
      ↓
Check Customer Account
      ↓
Check Policy
      ↓
Route Ticket
      ↓
Notify Customer
```

This is appropriate when the business process is known and should be controlled.

---

## Architecture D — Agent

```text
Goal:
Resolve the customer's issue
        ↓
Agent Decision
        ↓
Inspect Account
        ↓
Observe Result
        ↓
Determine Next Action
        ↓
Retrieve Policy
        ↓
Observe Policy
        ↓
Determine Next Action
        ↓
Take Authorized Action
        ↓
Observe Result
        ↓
Complete or Continue
```

This becomes useful when the system needs meaningful adaptive decision-making across multiple possible actions.

The agent does not automatically replace the workflow.

A production architecture may combine both.

---

# Practical Example: Software Engineering Assistant

Consider a software engineering assistant.

## LLM Application

```text
Developer Question
      ↓
LLM
      ↓
Explanation or Code
```

---

## RAG Application

```text
Developer Question
      ↓
Retrieve Repository Documentation
      ↓
LLM
      ↓
Answer
```

---

## Workflow

```text
Issue Created
      ↓
Collect Repository Context
      ↓
Run Tests
      ↓
Build
      ↓
Generate Report
      ↓
Create Review Request
```

---

## Agent

Suppose the goal is:

> “Investigate why the build is failing and propose a fix.”

The system may:

```text
Goal
  ↓
Inspect Build Failure
  ↓
Observe Error
  ↓
Inspect Relevant Code
  ↓
Observe Code
  ↓
Determine Next Investigation
  ↓
Run Targeted Test
  ↓
Observe Result
  ↓
Propose Fix
```

The sequence depends on observations.

The system is therefore doing more than simply following a fixed business procedure.

---

# Practical Example: Research Assistant

Consider a research system.

## RAG-oriented system

```text
Research Question
      ↓
Retrieve Relevant Sources
      ↓
LLM
      ↓
Synthesized Answer
```

This may be sufficient for a question-answering product.

## Agent-oriented system

```text
Research Goal
      ↓
Determine Information Needed
      ↓
Search
      ↓
Observe Results
      ↓
Identify Missing Evidence
      ↓
Search Again
      ↓
Compare Findings
      ↓
Determine Whether Evidence Is Sufficient
      ↓
Produce Result
```

The distinction is not that the second system merely “uses tools.”

The important difference is that the system has meaningful responsibility for determining what actions are required to pursue the research goal.

---

# What These Categories Do Not Tell You

These labels do not automatically tell you:

- whether the system is reliable
- whether the system is safe
- whether the system is scalable
- whether the system is production-ready
- whether the model is capable enough
- whether the system is expensive
- whether the architecture is easy to test
- whether the system should have more or less autonomy

A system can be technically agentic and still be a poor production architecture.

Likewise, a deterministic workflow can be highly sophisticated and extremely effective.

The architectural label is only the beginning of the engineering discussion.

---

## Production Perspective

In production engineering, the goal should not be:

> “Use agents because agents are more advanced.”

The goal should be:

> **Use the architecture that provides the required behavior with acceptable complexity, risk, cost, and operational burden.**

A useful progression is:

```text
Simple Requirement
      ↓
Can deterministic logic solve it?
      ↓
Yes ───────────────→ Use deterministic logic
      │
      No
      ↓
Can an LLM application solve it?
      ↓
Yes ───────────────→ Use an LLM application
      │
      No
      ↓
Is retrieval the missing capability?
      ↓
Yes ───────────────→ Add RAG
      │
      No
      ↓
Is adaptive goal-directed execution required?
      ↓
Yes ───────────────→ Consider an agentic architecture
```

This is not a strict implementation algorithm.

It is a decision-making mental model.

---

# When an Agent May Be Appropriate

An agentic architecture may be justified when the problem requires meaningful adaptive behavior.

Examples include:

- investigation tasks with uncertain paths
- research tasks where information needs change during execution
- troubleshooting problems with multiple possible diagnostic actions
- tasks requiring selection among several capabilities
- long-running goal-directed work where the next action depends on observations

The important question is:

> **Does dynamic action selection provide enough value to justify the additional system complexity?**

If the answer is no, an agent may be unnecessary.

---

## When a Workflow May Be Better

A workflow may be preferable when:

- the business process is well understood
- execution order is known
- compliance requires predictable behavior
- deterministic outcomes are important
- testing needs to cover explicit execution paths
- approvals must occur at known points
- failure handling must follow predefined rules

For example:

```text
Validate Payment
      ↓
Authorize Payment
      ↓
Capture Payment
      ↓
Generate Receipt
```

There may be little value in allowing an agent to invent the execution sequence.

A deterministic workflow can be simpler and easier to control.

---

# When RAG May Be the Main Requirement

RAG may be the primary architectural requirement when the main problem is:

> “The model needs access to information that is not reliably contained in its internal knowledge.”

Examples include:

- organizational documentation
- product manuals
- policies
- knowledge bases
- internal records
- technical documentation

If the system simply needs to retrieve relevant information and generate an answer, adding agentic behavior may introduce unnecessary complexity.

---

## When a Simple LLM Application May Be Enough

A simple LLM application may be appropriate when:

- the task is primarily generation
- no external information is required
- no complex action selection is required
- no multi-step execution is required
- deterministic business logic can remain outside the model

Examples include:

- summarization
- rewriting
- classification
- drafting
- extraction
- simple conversational interfaces

The absence of an agent is not a weakness.

It may simply mean that the problem does not require one.

---

## Engineering Decision Framework

When choosing between these architectures, ask:

### Question 1 — What is the actual problem?

Do not begin with:

> “Should we build an agent?”

Begin with:

> “What behavior does the system need to provide?”

---

### Question 2 — Is generation the primary requirement?

If yes, an LLM application may be sufficient.

---

### Question 3 — Does the model need external information?

If yes, retrieval may be required.

That may lead to a RAG architecture.

---

### Question 4 — Is the execution path known?

If yes, a workflow may be preferable.

---

### Question 5 — Does the system need to determine actions dynamically?

If yes, an agentic architecture may be justified.

---

### Question 6 — Does the system need to observe outcomes and adapt?

If yes, the value of agentic behavior increases.

---

### Question 7 — Does the additional autonomy justify the complexity?

This is the production question that matters most.

More autonomy can introduce:

- more execution paths
- harder testing
- more complex failure behavior
- more difficult debugging
- additional operational cost
- greater control requirements

Therefore:

> **Autonomy should be introduced because the problem requires it, not because the technology makes it possible.**

---

## Practical Architecture Selection Matrix

| Requirement | Likely Starting Architecture |
|---|---|
| Text generation | LLM application |
| Classification | LLM application |
| Summarization | LLM application |
| Grounded question answering | RAG application |
| Internal knowledge lookup | RAG application |
| Predictable business process | Workflow |
| Multi-step deterministic transaction | Workflow |
| Conditional business process | Workflow |
| Investigation with uncertain next steps | Agentic system |
| Adaptive research | Agentic system |
| Goal-directed troubleshooting | Agentic system |
| Combination of deterministic process and adaptive reasoning | Workflow + Agent |
| Adaptive system requiring external information | Agent + RAG |

These are starting points, not rigid rules.

A real architecture should be selected after analyzing the actual requirements.

---

## Internal Working: Four Different Execution Responsibilities

The four patterns can be understood by looking at what the surrounding system is responsible for.

## LLM Application

```text
Application
    ↓
Prepare Input
    ↓
Model
    ↓
Process Output
```

The application primarily manages the model interaction.

---

## RAG Application

```text
Application
    ↓
Prepare Query
    ↓
Retrieve Information
    ↓
Prepare Model Input
    ↓
Model
    ↓
Process Output
```

The application adds an information-retrieval stage.

---

## Workflow

```text
Orchestrator
      ↓
Determine Next Designed Step
      ↓
Execute Step
      ↓
Evaluate Condition
      ↓
Determine Next Designed Step
      ↓
Execute Step
```

The orchestration logic defines the possible execution structure.

---

## Agent

```text
Goal + Current Situation
          ↓
Decision Process
          ↓
Selected Action
          ↓
Observation
          ↓
Updated Situation
          ↓
Decision Process
          ↓
Selected Action
```

The system has meaningful responsibility for selecting actions while pursuing the goal.

This does not imply unlimited freedom.

A production agent can still operate inside:

- defined capabilities
- authorization boundaries
- execution constraints
- business rules
- human controls
- system boundaries

Those topics are developed in later AGT chapters.

---

# Important Nuances

## 1. An Agent Can Use an LLM

An LLM may be a major component of an agent system.

But:

```text
LLM ≠ Complete Agent System
```

The surrounding architecture determines how model output participates in decisions, actions, state, and environmental interaction.

---

## 2. An Agent Can Use RAG

An agent may retrieve information as part of its execution.

Therefore:

```text
RAG ⊂ Possible Agent Capability
```

RAG is not automatically an agent.

---

## 3. An Agent Can Use Workflows

An agent may invoke a deterministic workflow.

Therefore:

```text
Agent
  ↓
Workflow
```

is a valid architectural relationship.

---

## 4. A Workflow Can Contain an Agent

A workflow may invoke an agent for a bounded task.

Therefore:

```text
Workflow
  ↓
Agent
```

is also valid.

---

## 5. State Does Not Define an Agent

A system may be stateful without being agentic.

Therefore:

```text
Stateful ≠ Agent
```

---

## 6. Dynamic Behavior Does Not Automatically Define an Agent

A workflow can dynamically choose among explicitly designed branches.

Therefore:

```text
Dynamic Execution ≠ Automatically Agentic
```

---

## 7. Automation Does Not Define an Agent

A system can automate a fixed process without dynamically selecting actions.

Therefore:

```text
Automation ≠ Agent
```

---

## 8. Intelligence Does Not Define the Architecture

A highly capable model can be used inside a simple application.

A less capable model can be part of a sophisticated agent system.

Therefore:

```text
Model Intelligence ≠ Agentic Architecture
```

Architecture depends on system responsibility, not only model capability.

---

# Common Mistakes and Misconceptions

## Mistake 1 — “An agent is just an LLM with tools.”

This is incomplete.

Tools can provide capabilities, but an agent system also involves:

- goals
- decision-making
- actions
- observations
- environmental interaction
- autonomy
- system boundaries

Tools are one possible component of the architecture.

Detailed tool engineering belongs to AGT-03.

---

## Mistake 2 — “RAG makes an application an agent.”

Incorrect.

RAG provides a retrieval pattern.

A system can retrieve documents, generate an answer, and stop.

That can remain a RAG application without being an agent.

---

## Mistake 3 — “Workflows are always static.”

Incorrect.

Workflows can contain:

- branches
- loops
- conditions
- retries
- dynamic data
- parallel execution

The important distinction is that the orchestration logic is explicitly designed.

---

## Mistake 4 — “Agents cannot contain workflows.”

Incorrect.

An agent can invoke a workflow when deterministic execution is appropriate.

---

## Mistake 5 — “Workflows cannot contain agents.”

Incorrect.

A workflow can invoke an agent for a bounded adaptive task.

---

## Mistake 6 — “Any system with state is an agent.”

Incorrect.

State is useful across many software architectures.

State alone does not establish agentic behavior.

---

## Mistake 7 — “Any autonomous automation is an agent.”

Incorrect.

A scheduled or unattended system may execute automatically while following a predetermined process.

Automation and agentic autonomy are related but not equivalent.

---

## Mistake 8 — “More autonomy is always better.”

Incorrect.

More autonomy can increase:

- complexity
- execution paths
- testing difficulty
- failure modes
- operational cost
- control requirements

Autonomy should therefore be justified by the problem.

---

## Mistake 9 — “Agent and workflow are mutually exclusive.”

Incorrect.

They describe different architectural responsibilities and can be composed.

---

## Mistake 10 — “The architecture should be chosen based on the newest technology.”

Incorrect.

The architecture should be selected based on:

- requirements
- constraints
- risk
- complexity
- maintainability
- operational needs
- expected value

---

## Interview Questions with Expected Answers

## 1. What is the primary architectural difference between an LLM application and an agentic system?

**Expected answer:**

An LLM application primarily uses the model to generate or transform output within application-defined logic.

An agentic system gives the surrounding system meaningful responsibility for pursuing a goal through decisions and dynamically selected actions, potentially responding to observations and changing conditions.

The distinction is therefore not simply model capability but execution responsibility.

---

## 2. Why does RAG not automatically make an application an agent?

**Expected answer:**

RAG adds retrieval to provide relevant external information to a model.

A basic RAG application can follow a predefined pipeline:

```text
Query → Retrieve → Generate → Return
```

There may be no meaningful autonomous action selection or goal-directed interaction with an environment.

Therefore, RAG and agentic behavior are independent architectural concepts that can also be combined.

---

## 3. Are workflows always deterministic?

**Expected answer:**

No.

Workflows can contain runtime branches, conditions, loops, retries, and other dynamic behavior.

The important distinction is that the orchestration logic is explicitly designed.

A workflow may therefore choose different execution paths without becoming an agent.

---

## 4. Can a workflow contain an agent?

**Expected answer:**

Yes.

A workflow can invoke an agent for a bounded task requiring adaptive reasoning.

For example, a support workflow may route a difficult ticket to an agent for investigation and then return to deterministic business processing.

---

## 5. Can an agent use a workflow?

**Expected answer:**

Yes.

An agent can select a deterministic workflow when a known business operation should follow controlled execution.

For example, an agent may determine that a refund is required and then invoke a predefined refund workflow.

This combines adaptive decision-making with deterministic execution.

---

## 6. Does maintaining state make a system an agent?

**Expected answer:**

No.

Many ordinary applications are stateful.

A chat application may maintain conversation history, and a workflow system may maintain execution state.

State supports many architectures and is not by itself a defining property of an agent.

---

## 7. Does automation mean that a system is autonomous in the agentic sense?

**Expected answer:**

No.

Automation means that a system performs work without continuous manual execution.

A scheduled ETL pipeline, for example, can run automatically while following a predefined sequence.

Agentic autonomy involves meaningful responsibility for selecting actions while pursuing a goal.

---

## 8. What is a better distinction between workflow and agent than “static versus dynamic”?

**Expected answer:**

A workflow primarily relies on explicitly designed orchestration logic to determine execution paths.

An agentic system can have meaningful responsibility for selecting actions as part of pursuing a goal and responding to observations.

Both can be dynamic at runtime, so static versus dynamic is too simplistic.

---

## 9. Can a RAG system contain an agent?

**Expected answer:**

Yes.

RAG can be a capability inside an agent system.

For example, an agent may decide when to retrieve information, use the retrieved information, observe the result, and then decide what to do next.

The retrieval mechanism does not define the entire architecture.

---

## 10. Can an LLM application maintain state without being an agent?

**Expected answer:**

Yes.

An application can store conversation history, user preferences, or session information and use that state for subsequent model calls.

Statefulness alone does not create agentic behavior.

---

## 11. When would you prefer a workflow over an agent?

**Expected answer:**

A workflow is often preferable when the process is well understood and should follow controlled execution paths.

Examples include payment processing, order fulfillment, compliance processes, or other operations where explicit orchestration improves predictability, testing, and control.

An agent should not be introduced merely because adaptive reasoning is technically possible.

---

## 12. When might an agent be justified?

**Expected answer:**

An agent may be justified when the task requires meaningful adaptive action selection.

Examples include troubleshooting, investigation, research, or other tasks where the next useful action depends on observations made during execution.

The additional autonomy should justify the resulting complexity and control requirements.

---

## 13. Is having a goal enough to make a system an agent?

**Expected answer:**

No.

Workflows can also have explicit goals.

The more important question is how the system translates the goal into execution.

An agent has meaningful responsibility for selecting actions and adapting behavior while pursuing the goal.

---

## 14. A system retrieves documents, generates an answer, and stops. Is it necessarily an agent?

**Expected answer:**

No.

That architecture can simply be a RAG application.

The fact that retrieval and generation are involved does not establish autonomous goal pursuit or dynamic action selection.

---

## 15. Why should an enterprise engineer avoid introducing an agent unnecessarily?

**Expected answer:**

Agents can increase architectural and operational complexity.

They may introduce:

- more execution paths
- harder testing
- more difficult debugging
- additional failure modes
- increased operational cost
- greater control requirements

If a deterministic workflow or simpler LLM/RAG application solves the problem, that may be the better production architecture.

---

# Quick Revision

Remember these core distinctions:

```text
LLM Application
→ Model interaction is the primary pattern.

RAG
→ Retrieval supplies external information to the application/model.

Workflow
→ Explicitly designed orchestration determines execution paths.

Agent
→ Goal-directed system with meaningful responsibility for selecting
  actions and responding to observations.
```

And remember the important non-equivalences:

```text
RAG ≠ Agent

State ≠ Agent

Automation ≠ Agent

Dynamic Execution ≠ Automatically Agentic

LLM ≠ Complete Agent System

Workflow ≠ Opposite of Agent
```

Real systems can combine these patterns:

```text
Agent + RAG
Agent + Workflow
Workflow + Agent
Agent + RAG + Workflow
```

The central architectural question remains:

> **Who is responsible for determining what happens next, and on what basis?**

---

# Key Takeaways

1. An LLM application is not automatically an agent.
2. RAG is a retrieval/application pattern, not an agent definition.
3. A RAG system can exist without agentic behavior.
4. An agent can use RAG as one of its capabilities.
5. A workflow can contain an agent.
6. An agent can invoke a workflow.
7. Workflows can be dynamic; dynamic execution alone does not define an agent.
8. State is useful in many architectures and does not define an agent.
9. Automation is not equivalent to agentic autonomy.
10. The important distinction is architectural responsibility, especially responsibility for selecting actions while pursuing a goal.
11. Agents should be introduced when adaptive goal-directed execution provides enough value to justify the additional complexity.
12. Production engineering should favor the simplest architecture that satisfies the actual requirement.

---

## Further Reading

- [AGT-01.01 — Agent Definition and System Boundaries](./01-Agent-Definition-and-System-Boundaries.md)
- [AGT-01.03 — Agent Architecture and System Composition](./03-Agent-Architecture-and-System-Composition.md)
- [AGT-02 — Agent Runtime, Loops & Bounded Autonomy](../AGT-02/README.md)
- [AGT-03 — Tools & Action Execution](../AGT-03/README.md)
- [AGT-04 — State, Context & Memory](../AGT-04/README.md)
- [AGT-05 — Planning & Adaptive Execution](../AGT-05/README.md)

> **Repository note:** The links above assume the approved AGT chapter structure. Verify destination files exist before committing the document.

---

## End of Document

This chapter establishes the architectural distinction between LLM applications, RAG applications, workflows, and agentic systems.

The next chapter, **AGT-01.03 — Agent Architecture and System Composition**, builds on this distinction by mapping the major components that surround the model inside an agent system.
