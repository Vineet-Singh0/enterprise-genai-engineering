# AGT-01.01 — Agent Definition and System Boundaries

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain what an agent is from an engineering perspective.
- Explain why agent systems exist.
- Describe goal-directed behavior.
- Explain the relationship between an agent and its environment.
- Identify the boundary between an agent system and external systems.
- Distinguish responsibilities belonging to the agent system from responsibilities belonging to the environment or external systems.
- Explain the role of decisions, actions, and observations in an agent system.
- Explain autonomy as a system property.
- Explain why bounded autonomy is an important foundational engineering idea.
- Explain why an LLM alone is not necessarily a complete agent system.
- Distinguish model capability from agent-system capability.
- Use a simple agent mental model when analyzing unfamiliar AI systems.

This chapter establishes foundational vocabulary and system boundaries.

It does **not** teach the detailed implementation of runtime loops, tool execution, state and memory architectures, planning systems, workflow orchestration, human approval systems, or agent reliability mechanisms. Those topics belong to later Agent Engineering chapters.

---

## 2. Prerequisites

Before reading this chapter, you should have a basic understanding of:

- Software applications
- APIs
- External systems
- Basic application architecture
- Basic LLM concepts
- The difference between a model and an application using that model

You do not need experience with agent frameworks.

You should already understand that an LLM is a model capable of processing inputs and producing outputs. This chapter builds on that idea and asks a different question:

> What additional system behavior is required before we should describe the larger system as an agent system?

---

## 3. Estimated Reading Time

**Estimated reading time:** 30–40 minutes

This estimate assumes careful reading of the mental models, examples, and engineering trade-offs.

---

## 4. Before We Start

The word **agent** is used loosely in AI engineering.

Different systems are called agents even when their architectures are very different.

For example, an application might:

- send a user request to an LLM,
- retrieve documents,
- call an API,
- execute a workflow,
- maintain conversation history,
- or repeatedly ask a model what to do next.

Some of these systems may be agentic.

Some may simply be applications or workflows with several components.

Therefore, the important question is not:

> "Does this system use an LLM?"

The more useful engineering question is:

> "What responsibility does this system have for deciding and carrying out actions toward a goal?"

That question leads to the foundational idea of an agent system.

---

## 5. Why This Exists

Traditional software often follows a predefined path.

For example:

```text
User Request
     ↓
Validate Input
     ↓
Call Service A
     ↓
Call Service B
     ↓
Store Result
     ↓
Return Response
```

The software engineer defines the sequence.

The application executes that sequence.

This works extremely well when the required behavior can be specified in advance.

But some problems are less predictable.

Consider a software engineering assistant asked:

> "Investigate why the checkout service is returning errors and propose a fix."

The system may need to:

1. Understand the goal.
2. Determine what information is missing.
3. Inspect logs.
4. Examine relevant code.
5. Form a hypothesis.
6. Decide what evidence to inspect next.
7. Interpret the evidence.
8. Decide whether the hypothesis still makes sense.
9. Perform another investigation step.
10. Produce a conclusion.

The exact sequence may not be known when the system is designed.

The system therefore needs some ability to determine **what to do next based on the current situation**.

This is one of the central reasons agent systems exist.

An agent system is useful when a system must operate toward a goal while making decisions about its actions based on changing information.

---

# 6. Mental Model

A useful foundational model is:

```text
Goal
  ↓
Agent
  ↓
Decision
  ↓
Action
  ↓
Environment
  ↓
Observation
  ↓
Agent
```

This should be understood as a **conceptual model**, not a literal execution sequence that every implementation must follow.

The important relationships are:

- The **goal** gives the system something it is trying to accomplish.
- The **agent** represents the goal-directed decision-making responsibility.
- A **decision** determines what the system should do next within its authority.
- An **action** is an operation the agent performs or requests that interacts with the environment.
- The **environment** is the part of the world or system with which the agent interacts.
- An **observation** provides information about the resulting situation.
- The agent can use that information to make another decision.

This creates a fundamental relationship:

> An agent system does not exist only to generate an output. It has responsibility for pursuing a goal through decisions and interactions with an environment.

That distinction becomes important when separating an agent system from a simple LLM application.

---

# 7. What Is an Agent?

At a foundational engineering level:

> **An agent is a goal-directed entity or system responsibility that determines actions within its authority and uses observations from an environment to guide its behavior.**

In practical engineering discussions, the word **agent** is often used as shorthand for the broader **agent system**.

For this curriculum, the distinction is useful:

- **Agent** refers to the goal-directed decision/action responsibility.
- **Agent system** refers to the complete system that implements and supports that behavior.

This distinction becomes increasingly useful when discussing architecture and responsibility boundaries.

A useful agent-system model contains:

1. **A goal**
2. **A decision-making responsibility**
3. **The ability to take or request actions**
4. **An environment or external system with which it interacts**
5. **Observations or feedback about that environment**
6. **Some degree of autonomy in determining what happens next**

These properties are more useful than defining an agent simply as:

> "An LLM that uses tools."

Tool use can be part of an agent system, but tools alone do not define agentic behavior.

Similarly, an LLM can participate in an agent system without being the complete agent system.

---

## 8. Goal-Directed Behavior

## 8.1 What Is a Goal?

A goal describes a desired outcome.

Examples include:

- Resolve a customer issue.
- Investigate a production failure.
- Find suitable candidates for a business requirement.
- Complete a data-processing task.
- Research a topic and produce a report.
- Diagnose why an API is failing.
- Update information in an external system.

The goal does not necessarily specify every step required to achieve it.

That distinction is important.

Consider two systems.

### System A

```text
Step 1 → Step 2 → Step 3 → Step 4
```

Every step is predetermined.

### System B

```text
Goal
  ↓
Determine next action
  ↓
Observe result
  ↓
Determine next action
  ↓
Observe result
  ↓
...
```

System B has more responsibility for determining the path toward the goal.

This does not automatically make System B better.

It means that the system has a different execution responsibility.

---

## 8.2 Goal vs Task Instruction

A user instruction can describe a task without defining every execution step.

For example:

> "Find out why the payment API is failing."

The instruction expresses an objective.

It does not necessarily specify:

```text
1. Check service logs.
2. Inspect HTTP status codes.
3. Check database connectivity.
4. Inspect deployment configuration.
5. Compare recent changes.
```

An agentic system may determine which investigation steps are appropriate based on what it observes.

The important architectural property is therefore not that the system has a complicated prompt.

It is that the system has meaningful responsibility for determining how to progress toward the desired outcome.

---

# 9. Goal-Directed Behavior Is Not the Same as Intelligence

A common misconception is:

> More autonomous = more intelligent.

These are different properties.

A system can be highly capable but tightly constrained.

For example:

```text
Highly capable model
        ↓
Strictly controlled application
        ↓
Predetermined execution
```

The model may demonstrate sophisticated reasoning, but the surrounding application may determine exactly what happens before and after the model call.

Conversely, a system may have substantial autonomy but make poor decisions.

For example:

```text
Goal
 ↓
Agent decision
 ↓
Poor decision
 ↓
Incorrect action
```

Therefore:

> **Autonomy describes how much decision-making and execution responsibility the system has. Intelligence describes the capability or quality of its behavior.**

They should not be treated as synonyms.

---

# 10. The Agent and Its Environment

An agent system needs something to interact with.

That something is its **environment**.

The environment can be physical, digital, or abstract.

Examples:

| Agent | Possible Environment |
|---|---|
| Customer-support agent | Ticketing system, customer records, communication channels |
| Software engineering agent | Code repository, CI system, issue tracker, development environment |
| Research agent | Documents, databases, search systems, APIs |
| Operations agent | Monitoring systems, deployment systems, infrastructure APIs |
| Business assistant | CRM, internal APIs, business databases |
| Robotics system | Physical surroundings and sensors |

The environment is not necessarily "the real world."

For a software agent, the environment may simply be a collection of external digital systems and state.

---

## 11. Agent–Environment Relationship

The fundamental relationship can be represented as:

```text
             ┌───────────────┐
             │     Goal      │
             └───────┬───────┘
                     │
                     ▼
             ┌───────────────┐
             │     Agent     │
             └───────┬───────┘
                     │
                  Action
                     │
                     ▼
             ┌───────────────┐
             │  Environment  │
             └───────┬───────┘
                     │
                Observation
                     │
                     ▼
             ┌───────────────┐
             │     Agent     │
             └───────────────┘
```

The agent and environment are therefore conceptually different.

The agent is responsible for deciding and acting within its authority.

The environment contains the systems, resources, conditions, and external state that the agent interacts with.

This distinction becomes important when designing system boundaries.

---

# 12. What Counts as the Environment?

There is no single universal definition of an environment.

It depends on the system boundary being analyzed.

Consider a customer-support agent.

At one level:

```text
Agent
  ↕
Ticketing System
```

The ticketing system is external to the agent.

At a broader organizational level, the ticketing system might itself be considered part of the overall customer-support platform.

This means system boundaries are architectural decisions.

The important requirement is to define them clearly for the system being designed or analyzed.

---

# 13. Agent System Boundary

A **system boundary** defines what is considered part of the system being designed or analyzed and what is considered external.

For an agent system, the boundary might look like:

```text
┌─────────────────────────────────────────────┐
│                 Agent System                │
│                                             │
│  Decision-making                            │
│  Runtime                                    │
│  Model                                      │
│  Context / State                             │
│  Planning                                    │
│  Action coordination                         │
│                                             │
└───────────────────┬─────────────────────────┘
                    │
                    │ Interaction
                    ▼
┌─────────────────────────────────────────────┐
│             External Environment             │
│                                             │
│  APIs                                       │
│  Databases                                  │
│  Applications                               │
│  Documents                                  │
│  Services                                   │
│  External state                              │
│                                             │
└─────────────────────────────────────────────┘
```

This is a conceptual architecture.

It does not mean that every agent implementation must contain exactly these internal components.

The purpose is to reason about responsibility boundaries.

---

# 14. Why System Boundaries Matter

Without a clear boundary, it becomes difficult to answer basic engineering questions.

For example:

- Who decides what action to take?
- Who performs the action?
- Who owns the data?
- Who validates the result?
- Who controls authorization?
- Who is responsible when an external service fails?
- What information is available to the agent?
- What is inside the agent system and what is outside it?

Suppose an agent decides:

> "Update the customer's address."

The agent may determine that an update is required.

But the customer database or service may be responsible for:

- validating the request,
- enforcing database constraints,
- storing the record,
- maintaining transactional guarantees,
- returning success or failure.

The agent does not automatically inherit those responsibilities merely because it requested the operation.

This is a critical production engineering principle:

> **A component's ability to request an operation does not mean that the component owns the operation's full responsibility.**

---

## 15. Agent Responsibility vs External-System Responsibility

Consider this architecture:

```text
User
  ↓
Agent System
  ↓
Customer API
  ↓
Customer Database
```

The responsibilities may be separated as follows.

| Component | Example Responsibility |
|---|---|
| User | Defines intent or provides information |
| Agent system | Determines what action is appropriate |
| Customer API | Accepts and validates the API request |
| Database | Persists and protects stored data |

The exact responsibility depends on the architecture.

The key point is that the agent system should not be treated as the owner of every downstream operation simply because it initiated it.

---

# 16. Capability Is Not Authorization

An agent may have access to a capability without having unrestricted authority to use it.

For example:

```text
Agent
  ↓
Can request account deletion
```

does not necessarily mean:

```text
Agent
  ↓
May delete any account at any time
```

A capability describes what a system can potentially do.

Authorization describes what it is permitted to do.

These concepts should remain separate.

This chapter establishes the distinction only at a foundational level. Detailed authorization and security controls belong outside AGT-01.

---

# 17. Actions

An **action** is an operation the agent performs or requests that affects, queries, or otherwise interacts with the environment in pursuit of its goal.

Examples include:

- Requesting information
- Calling an external service
- Updating data
- Sending a message
- Creating a ticket
- Starting a process
- Asking another system for a result
- Submitting a request to an external system

The exact mechanism is implementation-dependent.

An action does not have to mean a physical action.

In software systems, an API request can be an action.

A generated response to a user may be an output of the system without necessarily being an environmental action. Whether it is treated as an action depends on the system boundary and the effect being analyzed.

---

## 18. Observations

An **observation** is information the agent receives about the state or result of the environment.

Examples:

```text
Action:
Create support ticket

Observation:
Ticket created successfully
```

Or:

```text
Action:
Call payment API

Observation:
HTTP 503 returned
```

Or:

```text
Action:
Inspect application logs

Observation:
Database connection timeout detected
```

The agent can use observations to determine what should happen next.

This is what allows a system to respond to changing conditions rather than blindly following the same sequence.

---

# 19. Action and Observation Form a Feedback Relationship

A useful engineering model is:

```text
Goal
  ↓
Decision
  ↓
Action
  ↓
Environment
  ↓
Observation
  ↓
Updated understanding
  ↓
Next decision
```

The important part is the feedback.

Without meaningful feedback, the system may simply execute a predetermined sequence.

With feedback, the system can potentially reconsider what to do next.

However, feedback alone does not automatically make a system an agent.

The system also needs meaningful responsibility for determining how to pursue its goal.

---

# 20. Autonomy

Autonomy describes the degree to which a system can determine and execute its behavior without requiring a human or another external controller to specify every step.

A simple conceptual spectrum is:

```text
Low Autonomy
    │
    ├── Fixed response
    │
    ├── Model-assisted decision
    │
    ├── Dynamic next-step selection
    │
    ├── Action execution with feedback
    │
    └── Higher autonomous responsibility
    │
High Autonomy
```

This is a conceptual spectrum rather than a standardized measurement scale.

The important idea is that autonomy concerns **decision and execution responsibility**.

---

# 21. Autonomy Is Not a Binary Property

It is tempting to ask:

> "Is this system autonomous?"

A better engineering question is:

> "Which decisions can this system make without external instruction, and within what authority?"

For example:

### System A

```text
Human chooses every action
        ↓
System executes
```

Very little decision autonomy exists.

### System B

```text
Human provides goal
        ↓
System chooses investigation steps
        ↓
System reports findings
```

The system has more decision autonomy.

### System C

```text
Human provides goal
        ↓
System chooses actions
        ↓
System executes external operations
        ↓
System observes results
        ↓
System continues within defined boundaries
```

The system has greater autonomous responsibility.

The difference is not simply whether an LLM is present.

It is how responsibility for decisions and actions is allocated.

---

# 22. Bounded Autonomy

Autonomy without boundaries is generally a poor engineering objective.

Production systems need constraints.

Examples of boundaries include:

- Which actions may be taken
- Which systems may be accessed
- Which data may be accessed
- Which operations require approval
- How long execution may continue
- What conditions cause execution to stop
- What authority the system has
- What resources it may consume

At a foundational level, this leads to the idea of **bounded autonomy**:

> The system may make decisions and act toward a goal, but its autonomy operates within explicitly defined boundaries.

AGT-01 establishes this concept only at the foundational level.

Detailed runtime mechanisms for enforcing bounded autonomy belong to **AGT-02 — Agent Runtime, Loops & Bounded Autonomy**.

---

## 23. Why Bounded Autonomy Matters

Imagine an agent responsible for investigating a production incident.

A poorly bounded system might continue:

```text
Investigate
  ↓
Investigate again
  ↓
Try another action
  ↓
Try another action
  ↓
Continue indefinitely
```

A production system needs clear boundaries around what the agent is allowed to do.

For example:

```text
Goal
 ↓
Agent
 ↓
Allowed actions
 ↓
Allowed systems
 ↓
Execution limits
 ↓
Stop conditions
```

The specific mechanisms for implementing these constraints belong to later chapters.

The foundational principle is enough for AGT-01:

> **Autonomy should be designed and bounded; it should not be treated as an unlimited capability.**

---

# 24. The Role of the Model

An agent system may use an LLM or another model as part of its decision-making process.

A simplified architecture might be:

```text
Goal
  ↓
Agent System
  ↓
Model
  ↓
Decision
  ↓
Action
```

But the model is only one component.

The model may generate a proposed action, interpretation, or decision.

The surrounding system determines how that output becomes system behavior.

This distinction is fundamental.

---

# 25. Why an LLM Alone Is Not Necessarily an Agent System

An LLM can accept an input and produce an output:

```text
Input
  ↓
LLM
  ↓
Output
```

The model may produce an excellent answer.

But this alone does not establish:

- an external environment,
- an action responsibility,
- feedback from that environment,
- autonomous next-step selection,
- a system boundary around execution,
- or responsibility for pursuing a goal through actions.

Therefore:

> **An LLM can be a component of an agent system without the LLM itself being the complete agent system.**

This distinction prevents an overly narrow definition of agents.

---

# 26. Model Capability vs Agent-System Capability

Consider a model that generates:

```text
"Call the customer API to retrieve the order."
```

The model has generated a proposed action.

But several additional system responsibilities may exist:

```text
Model
  ↓
Proposed Action
  ↓
Agent System
  ↓
Validate / Select / Execute
  ↓
External API
  ↓
Result
```

The agent system provides the surrounding execution capability.

The model provides one capability used by that system.

This distinction becomes particularly important when designing production systems.

---

# 27. An Agent System Is More Than a Model

A useful mental model is:

```text
                 ┌──────────────┐
                 │     Goal     │
                 └──────┬───────┘
                        │
                        ▼
             ┌─────────────────────┐
             │     Agent System    │
             │                     │
             │  Decision-making    │
             │  Execution          │
             │  Context            │
             │  State              │
             │  Other components   │
             └──────────┬──────────┘
                        │
                  ┌─────┴─────┐
                  ▼           ▼
               Model       External
                           Systems
```

The model is part of the system.

It is not necessarily equivalent to the system.

This is one of the most important mental models in Agent Engineering.

---

# 28. A Simple Example: Customer Support

Consider a customer-support system.

The user says:

> "My order hasn't arrived. Please investigate and tell me what happened."

A simple LLM application might do:

```text
User Input
    ↓
LLM
    ↓
Response
```

The LLM might explain general possibilities.

An agent system could instead operate more like:

```text
Goal
  ↓
Determine required information
  ↓
Request order information
  ↓
Observe result
  ↓
Determine next action
  ↓
Check shipment information
  ↓
Observe result
  ↓
Determine conclusion
  ↓
Respond to user
```

The important difference is not that one system uses an LLM and the other does not.

Both could use an LLM.

The difference is the responsibility for determining and carrying out the investigation.

---

# 29. Another Example: Software Engineering Assistant

Suppose the goal is:

> "Find the cause of the failing checkout tests."

An agent system might:

```text
Goal
  ↓
Inspect test results
  ↓
Observe failure
  ↓
Inspect relevant code
  ↓
Observe implementation
  ↓
Form hypothesis
  ↓
Run another investigation action
  ↓
Observe result
  ↓
Refine hypothesis
  ↓
Report likely cause
```

The exact actions depend on the situation.

That adaptability is central to the agent mental model.

However, the system still needs boundaries.

For example, the system might be allowed to inspect code but not merge changes without approval.

This demonstrates the relationship between:

- goal,
- decision,
- action,
- observation,
- autonomy,
- and boundaries.

---

# 30. Agent Boundary in a Real System

Consider:

```text
┌─────────────────────────────────────────────┐
│                 Agent System                │
│                                             │
│  Goal interpretation                        │
│  Decision-making                            │
│  Runtime                                    │
│  Model                                      │
│  Context / State                            │
│  Action coordination                         │
│                                             │
└───────────────────┬─────────────────────────┘
                    │
                    │ API / Tool / Interface
                    ▼
┌─────────────────────────────────────────────┐
│              External Systems                │
│                                             │
│  Git repository                             │
│  CI system                                  │
│  Ticket system                              │
│  Databases                                  │
│  Monitoring                                 │
│                                             │
└─────────────────────────────────────────────┘
```

The agent system may decide:

> "Inspect the latest CI failure."

The CI system remains responsible for:

- receiving the request,
- authenticating it,
- executing the requested operation,
- returning the result.

The agent interprets the result and determines what should happen next within its authority.

This separation allows engineers to reason about the system as multiple cooperating components with different responsibilities.

---

# 31. Responsibility Boundaries

A useful design question is:

> "Who owns this responsibility?"

For every important operation, ask:

| Question | Example |
|---|---|
| Who decides what should happen? | Agent system |
| Who performs the requested external operation? | External system |
| Who validates external-system requests? | External system |
| Who determines what information to inspect next? | Agent system |
| Who stores persistent business data? | External data system |
| Who determines whether the agent may perform an action? | Depends on the architecture and authorization boundary |
| Who reports the result? | External system |
| Who interprets the result in pursuit of the goal? | Agent system |

These answers are architectural rather than universal.

A different system may assign responsibilities differently.

The important engineering practice is to define those responsibilities explicitly.

---

## 32. Agent Boundary vs Environment Boundary

The distinction can be summarized as:

```text
                 Agent Boundary
        ┌─────────────────────────────┐
        │                             │
        │         Agent System        │
        │                             │
        │   Goal                      │
        │   Decisions                 │
        │   Model                     │
        │   Execution                 │
        │   Context / State           │
        │                             │
        └──────────────┬──────────────┘
                       │
                       │
                 Interaction
                       │
                       ▼
        ┌─────────────────────────────┐
        │        Environment          │
        │                             │
        │   APIs                      │
        │   Databases                 │
        │   Services                  │
        │   Applications              │
        │   External state            │
        │                             │
        └─────────────────────────────┘
```

The boundary determines what the agent system directly controls and what it interacts with externally.

This becomes especially important when external operations have side effects.

---

# 33. Side Effects

An agent's action may cause a change outside the agent system.

Examples:

```text
Send email
Create ticket
Update record
Submit request
Start deployment
Modify configuration
```

These are different from simply generating internal reasoning or text.

For example:

```text
Generate text
```

may produce an output without directly changing an external system.

Whereas:

```text
Send email
```

changes an external system or affects another party.

This distinction matters because autonomy becomes more consequential when actions produce real-world effects.

AGT-01 establishes the distinction conceptually.

Detailed tool execution, side-effect handling, idempotency, failures, and action boundaries belong to **AGT-03 — Tools & Action Execution**.

---

# 34. Agent Boundaries and External Failures

Suppose an agent requests:

```text
Create customer ticket
```

but the external ticketing service returns:

```text
503 Service Unavailable
```

The failure may be outside the agent system's direct control.

The agent may observe the failure and determine what to do next.

For example:

```text
Action
  ↓
External Service
  ↓
Failure
  ↓
Observation
  ↓
Agent Decision
```

The agent therefore needs to distinguish between:

- what it intended to do,
- what it requested,
- what the external system actually did,
- and what the external system reported.

This distinction is important for reliable system design.

Detailed failure handling belongs to later chapters.

---

# 35. Agent Boundaries and Data

The same reasoning applies to data.

Suppose an agent requests customer information.

The agent may be able to request:

```text
GET /customer/123
```

But that does not mean the agent owns the customer data.

The external system may own:

- data storage,
- data validation,
- data consistency,
- access enforcement,
- retention,
- and other system-level responsibilities.

The agent consumes information as part of pursuing its goal.

Therefore:

> **Access to information is not the same as ownership of the underlying system or data.**

---

# 36. A More Complete Conceptual Model

The foundational model can now be expanded:

```text
                         Goal
                           │
                           ▼
                    ┌─────────────┐
                    │    Agent    │
                    └──────┬──────┘
                           │
                     Decision
                           │
                           ▼
                        Action
                           │
                           ▼
                ┌────────────────────┐
                │     Environment     │
                │                    │
                │ APIs                │
                │ Databases           │
                │ Services            │
                │ Applications        │
                │ External state      │
                └─────────┬──────────┘
                          │
                     Observation
                          │
                          ▼
                    ┌─────────────┐
                    │    Agent    │
                    └─────────────┘
```

This model captures the core relationship without prescribing a specific framework or implementation.

---

# 37. Internal Working

At a high level, an agent system needs to answer three recurring questions:

### 1. What am I trying to accomplish?

This comes from the goal.

### 2. What should I do next?

This is the decision responsibility.

### 3. What happened after I acted?

This comes from observation.

The conceptual cycle therefore becomes:

```text
Goal
 ↓
Understand current situation
 ↓
Determine next action
 ↓
Act
 ↓
Observe
 ↓
Update understanding
 ↓
Determine next action
```

Not every agent implementation performs these steps in exactly this form.

Some systems may combine them.

Some may use predefined workflows.

Some may involve humans.

Some may stop after one action.

The model exists to establish the fundamental relationships, not to prescribe an implementation.

---

# 38. What Makes the System Agentic?

A useful diagnostic is to examine responsibility.

Ask:

> "Does the system merely produce an output, or does it have meaningful responsibility for determining what should happen next and carrying out actions toward a goal, within its defined authority?"

Compare:

### Simple model interaction

```text
Input
  ↓
Model
  ↓
Output
```

The surrounding application may fully determine what happens next.

### Agent-oriented interaction

```text
Goal
  ↓
Determine next action
  ↓
Action
  ↓
Observation
  ↓
Determine next action
  ↓
Action
```

The agent system has greater responsibility for determining how execution progresses.

That difference is central to agentic behavior.

---

# 39. Agentic Behavior Is Not Defined by Complexity

A system does not become an agent merely because its architecture is complicated.

Consider:

```text
User
 ↓
LLM
 ↓
Three API calls
 ↓
Response
```

This could still be a conventional workflow if the three API calls are predetermined.

Conversely, a relatively small system may be agentic if it has meaningful responsibility for selecting actions based on observations while pursuing a goal.

Therefore:

> **Architectural complexity is not the defining property of an agent. Decision and execution responsibility are more important.**

---

# 40. Agentic Behavior Is Not Defined by Tool Count

Another common misconception is:

> "If a system uses tools, it is an agent."

This is too broad.

Consider:

```text
Input
 ↓
Call API A
 ↓
Call API B
 ↓
Call API C
 ↓
Output
```

If the sequence is completely predetermined, tools do not necessarily make the system agentic.

Now consider:

```text
Goal
 ↓
Determine which capability is needed
 ↓
Call capability
 ↓
Observe result
 ↓
Determine what capability is needed next
```

The second system has more dynamic decision responsibility.

The important property is therefore not the number of tools.

It is how responsibility for selecting actions is allocated and how execution responds to observations.

Detailed tool engineering is owned by AGT-03.

---

# 41. Agentic Behavior Is Not Defined by an LLM

Similarly:

```text
LLM + tools = agent
```

is an incomplete definition.

An LLM can be used in:

- chat applications,
- summarization systems,
- classification systems,
- RAG applications,
- workflow automation,
- agent systems,
- and many other architectures.

The model does not determine the complete architecture by itself.

The surrounding system determines how model outputs are used.

---

# 42. Agentic Behavior Is Not Defined by Autonomy Alone

Autonomy is important, but autonomy alone is insufficient as a useful engineering definition.

For example, a system might automatically perform an operation according to a fixed schedule.

That system may operate without human intervention, but it does not necessarily have agent-like decision responsibility.

For example:

```text
Every night at 12:00
      ↓
Run job
      ↓
Process records
      ↓
Finish
```

The system is autonomous in the ordinary sense of operating without a human pressing a button.

But its behavior may still be completely predetermined.

This illustrates why **autonomy should be considered together with goal-directed decision-making and environmental interaction**.

---

# 43. A Useful Diagnostic Framework

When encountering an unfamiliar AI system, ask:

### Goal

> What outcome is the system trying to achieve?

### Decision

> Who determines what should happen next?

### Action

> What can the system cause or request?

### Environment

> What external systems or conditions does it interact with?

### Observation

> What information does it receive after acting?

### Adaptation

> Can it change what it does based on what it observes?

### Autonomy

> How much decision and execution responsibility belongs to the system rather than an external controller?

### Authority

> Within what permissions or boundaries can it act?

### Boundary

> What responsibilities are inside the agent system and what responsibilities remain outside it?

These questions provide a practical first-pass method for identifying agentic architecture.

---

## 44. Example: Three Systems With Similar User Interfaces

Imagine three systems that all accept:

> "Help me resolve this customer issue."

They may look identical from the user's perspective.

### System A — LLM Application

```text
User
 ↓
LLM
 ↓
Answer
```

The model generates a response.

### System B — Workflow

```text
User
 ↓
Step 1
 ↓
Retrieve customer
 ↓
Step 2
 ↓
Check order
 ↓
Step 3
 ↓
Generate response
```

The execution path is predetermined.

### System C — Agent System

```text
User
 ↓
Goal
 ↓
Agent Decision
 ↓
Action
 ↓
Observation
 ↓
Agent Decision
 ↓
Action
 ↓
Observation
 ↓
Response
```

The system has meaningful responsibility for determining the next action based on the current situation.

The user interface alone does not tell us which architecture exists underneath.

The engineering responsibility does.

---

# 45. What the Agent System Does Not Own

An agent system should not automatically be considered responsible for everything in the surrounding architecture.

For example:

```text
Agent System
  │
  ├── Uses database
  ├── Uses API
  ├── Uses authentication system
  ├── Uses monitoring
  └── Uses external services
```

Using a component does not necessarily mean owning it.

The agent system may depend on:

- external databases,
- APIs,
- identity systems,
- message systems,
- business services,
- infrastructure,
- and other applications.

Each may have its own responsibility boundary.

This principle becomes important as agent systems grow more complex.

---

# 46. Responsibility Is More Important Than Labels

Different engineering teams may use different terminology.

One team might call a component:

> "Agent"

Another might call it:

> "AI worker"

Another:

> "Autonomous service"

Another:

> "Decision engine"

The name alone does not tell us the architecture.

Instead, inspect the responsibilities.

Ask:

```text
What is the goal?
Who decides?
Who acts?
What environment is affected?
What feedback is received?
What authority exists?
Where is the boundary?
```

This approach is more reliable than relying on product terminology.

---

# 47. Production Perspective

In production systems, agent boundaries should be explicit.

A production engineer should be able to answer:

- What is the agent system responsible for?
- What is outside the agent system?
- Which actions can it request?
- Which actions can it actually execute?
- Which systems can it access?
- What information can it observe?
- What happens when an external system fails?
- What stops the agent system from continuing?
- Which decisions require external control?
- Which responsibilities belong to downstream systems?

These questions affect:

- reliability,
- security,
- cost,
- debugging,
- observability,
- testing,
- maintenance,
- and system ownership.

Detailed treatment of those concerns belongs to later chapters, but the boundary must be established before those concerns can be reasoned about correctly.

---

## 48. Engineering Decisions and Trade-offs

## 48.1 More Autonomy vs More Control

More autonomy can allow the system to adapt to situations that were not explicitly encoded in advance.

But greater autonomy also increases the amount of behavior the system can produce without direct human instruction.

Conceptually:

```text
More predefined control
        ↕
More adaptive autonomy
```

Neither extreme is universally correct.

The appropriate level depends on:

- task characteristics,
- consequences of failure,
- uncertainty,
- external-system impact,
- and required control.

AGT-01 establishes the trade-off concept.

Detailed bounded-autonomy engineering belongs to AGT-02.

---

## 48.2 Fixed Workflow vs Agentic Decision-Making

A fixed workflow can be easier to reason about.

```text
A → B → C → D
```

Advantages may include:

- predictable execution,
- easier testing,
- clear failure paths,
- simpler operational reasoning.

An agentic system can adapt:

```text
A → B
    ↓
 determine next step
    ↓
C or D or E
```

This can be useful when the correct path depends on observations.

But it can also introduce more behavioral variability.

Therefore, agentic behavior should be introduced because the problem requires it, not because it is fashionable.

---

## 48.3 Capability vs Authority

An agent system may technically be capable of requesting an operation.

That does not mean it should have unrestricted authority.

For example:

```text
Capability:
Can request deployment
```

does not imply:

```text
Authority:
May deploy any production service without restriction
```

This distinction becomes increasingly important as the consequences of actions increase.

AGT-01 establishes only the foundational distinction. Detailed authorization and security controls belong outside this chapter.

---

## 48.4 Intelligence vs Autonomy

A highly capable model does not require high autonomy.

For example:

```text
Highly capable model
        +
Strict workflow
```

can be a perfectly appropriate architecture.

Likewise:

```text
Moderately capable model
        +
High autonomy
```

can produce poor outcomes if the system makes bad decisions.

Therefore, architecture should not assume:

> "The better the model becomes, the more autonomy we should give it."

Autonomy is an engineering decision.

---

# 49. Common Mistakes and Misconceptions

## Mistake 1: Defining an Agent as "an LLM with Tools"

This definition is too narrow.

An agent system is better understood through:

- goal,
- decision-making,
- action,
- observation,
- environment,
- autonomy,
- and system boundaries.

Tools can support actions, but tools are not the definition of an agent.

---

## Mistake 2: Assuming Every LLM Application Is an Agent

An application can use an LLM simply to generate an answer.

```text
Input
 ↓
LLM
 ↓
Output
```

That alone does not establish agentic behavior.

---

## Mistake 3: Assuming Tool Use Automatically Creates Agency

A fixed workflow can use many tools.

```text
API A
 ↓
API B
 ↓
API C
```

The number of tools does not determine whether the system is agentic.

---

## Mistake 4: Assuming Autonomy Means Intelligence

Autonomy describes decision-making and execution responsibility.

It does not measure reasoning quality.

---

## Mistake 5: Assuming More Autonomy Is Always Better

More autonomy increases the system's decision responsibility.

That can be useful or harmful depending on the task and consequences.

Autonomy should therefore be designed deliberately.

---

## Mistake 6: Treating the Agent System as Owner of Every External Operation

An agent system may request an operation without owning the downstream system.

For example:

```text
Agent System
 ↓
Payment API
 ↓
Payment Service
```

The payment service still owns its own operational responsibilities.

---

## Mistake 7: Confusing Capability With Authorization

Being technically able to request an action does not automatically mean the system is authorized to perform it.

---

## Mistake 8: Treating the Conceptual Loop as a Universal Implementation

The model:

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
```

is a mental model.

Real systems may combine, reorder, or abstract these responsibilities.

---

## Mistake 9: Assuming Every Autonomous Process Is an Agent

A scheduled batch job can run without human intervention while still following a completely predetermined procedure.

Automatic execution alone is not sufficient.

---

## Mistake 10: Ignoring System Boundaries

If the boundary is unclear, it becomes difficult to determine:

- who owns decisions,
- who owns actions,
- who owns data,
- who handles failures,
- and who is accountable for behavior.

Boundary definition is therefore a core architecture skill.

---

# 50. Interview Questions with Expected Answers

## Question 1

**What is an agent from an engineering perspective?**

### Expected Answer

An agent is a goal-directed entity or system responsibility that determines actions within its authority and uses observations from an environment to guide its behavior. In practical systems, this behavior is implemented and supported by an agent system. The important properties are goal-directed behavior, decision-making, action, environmental interaction, observation, and some degree of autonomy. An agent should not be defined simply as an LLM that uses tools.

---

## Question 2

**Why is an LLM alone not necessarily a complete agent system?**

### Expected Answer

An LLM can generate outputs, but an agent system requires broader responsibilities around goal pursuit, decision-making, actions, observations, and interaction with an environment. The LLM may provide reasoning or generation capabilities, while the surrounding agent system handles execution and interaction with external systems.

---

## Question 3

**What is the relationship between an agent and its environment?**

### Expected Answer

The agent operates toward a goal and interacts with an environment through actions. The environment provides results or observations, which the agent can use to determine subsequent behavior. The environment may consist of APIs, databases, applications, services, or physical surroundings.

---

## Question 4

**Does using tools automatically make an application an agent? Why or why not?**

### Expected Answer

No. A conventional workflow can use many tools while following a predetermined sequence. Tool use becomes part of agentic behavior when the system has meaningful responsibility for selecting actions and adapting its execution based on observations while pursuing a goal.

---

## Question 5

**Is autonomy the same as intelligence?**

### Expected Answer

No. Autonomy describes how much decision-making and execution responsibility the system has without requiring an external controller to specify every step. Intelligence describes the system's capability or quality of behavior. A system can be highly capable but tightly controlled, or highly autonomous but make poor decisions.

---

## Question 6

**Why is bounded autonomy important?**

### Expected Answer

Autonomous systems need limits around what they can do, which systems they can access, what resources they can consume, and when execution must stop. Bounded autonomy allows adaptive behavior while keeping the system within defined operational boundaries.

---

## Question 7

**Suppose an agent system calls a customer database and updates a record. Does the agent system own the database operation?**

### Expected Answer

Not necessarily. The agent system may decide that the update is required and request it, but the database or service may remain responsible for validation, persistence, consistency, and other downstream responsibilities. The answer depends on the architecture and system boundaries.

---

## Question 8

**What is the difference between an action and an observation?**

### Expected Answer

An action is an operation the agent performs or requests that interacts with the environment. An observation is information received about the resulting state or outcome of the environment. The observation can influence the agent's next decision.

---

## Question 9

**Can a conventional workflow contain agentic behavior?**

### Expected Answer

Yes. These architectural patterns are not mutually exclusive. A workflow can contain an agentic component, and an agent system can use predefined workflows for parts of its execution. The important distinction is which component has meaningful responsibility for determining what should happen next.

---

## Question 10

**Can an agent system use a fixed workflow?**

### Expected Answer

Yes. An agent system does not have to dynamically determine every operation. It can use predefined workflows for parts of its execution while retaining decision responsibility at the broader system level. The presence of a workflow does not automatically make the entire system non-agentic.

---

## Question 11

**A scheduled system runs every night and automatically performs several actions. Is it necessarily an agent?**

### Expected Answer

No. Automatic execution is not enough. If the system simply follows a predetermined sequence without meaningful decision-making about how to pursue a goal based on observations, it may be ordinary automation rather than an agent system.

---

## Question 12

**What questions would you ask to determine whether an unfamiliar AI system is agentic?**

### Expected Answer

I would ask: What is the goal? Who determines what should happen next? What actions can the system take? What environment does it interact with? What observations does it receive? Can it adapt its actions based on those observations? How much decision and execution responsibility does it have? Within what authority can it act? Where is the system boundary?

---

## Question 13

**Why does system boundary definition matter for agent architecture?**

### Expected Answer

The boundary determines which responsibilities belong to the agent system and which belong to external systems. Without a clear boundary, it becomes difficult to reason about ownership of decisions, actions, data, failures, authorization, and external side effects.

---

## Question 14

**Can a system be highly intelligent but have very little autonomy?**

### Expected Answer

Yes. An LLM can have strong reasoning and generation capabilities while operating inside a tightly controlled workflow where the application determines every execution step. Intelligence and autonomy describe different properties.

---

## Question 15

**Should an engineering team maximize agent autonomy?**

### Expected Answer

No. Autonomy should be selected according to the problem, uncertainty, risk, external side effects, and required control. More autonomy can increase adaptability, but it can also increase behavioral variability and operational risk. Autonomy is an engineering decision, not an automatic objective.

---

## 51. Quick Revision

### Agent

A goal-directed entity or system responsibility that determines actions within its authority and uses observations from an environment to guide behavior.

### Agent System

The complete system that implements and supports the agent's goal-directed behavior.

### Goal

The desired outcome the agent is trying to achieve.

### Action

An operation the agent performs or requests that interacts with the environment in pursuit of the goal.

### Observation

Information the agent receives about the environment or the result of an action.

### Environment

The external world, systems, services, or conditions with which the agent interacts.

### Autonomy

The degree to which the system can determine and execute behavior without requiring an external controller to specify every step.

### Bounded Autonomy

Autonomy operating within explicitly defined limits and responsibilities.

### Agent Boundary

The architectural boundary separating the agent system's responsibilities from those of external systems and environments.

### Core Mental Model

```text
Goal
  ↓
Decision
  ↓
Action
  ↓
Environment
  ↓
Observation
  ↓
Decision
```

### Most Important Distinctions

```text
Agent ≠ LLM

Agent System ≠ Model

Agent ≠ Tool

Autonomy ≠ Intelligence

Capability ≠ Authorization

Automatic Execution ≠ Agentic Behavior
```

And:

> **RAG, workflows, and LLM applications can participate in agent systems, but none of them alone defines an agent.**

---

# 52. Key Takeaways

1. An agent is best understood through **goal-directed behavior, decision-making, action, observation, environment interaction, and autonomy**.

2. An LLM is a model component. It can participate in an agent system, but an LLM alone is not necessarily a complete agent system.

3. The central agent mental model is:

   ```text
   Goal
     ↓
   Decision
     ↓
   Action
     ↓
   Environment
     ↓
   Observation
     ↓
   Decision
   ```

4. The model is conceptual. Real implementations may combine or abstract these responsibilities differently.

5. An agent's environment may be digital or physical. APIs, databases, services, applications, and external systems can all form part of the environment.

6. System boundaries determine which responsibilities belong to the agent system and which belong to external systems.

7. An agent system may request an operation without owning the downstream system that performs it.

8. Tool use does not automatically make a system agentic.

9. Autonomy is not the same as intelligence.

10. Automatic execution is not necessarily agentic behavior.

11. More autonomy is not automatically better.

12. Bounded autonomy is a foundational engineering principle: systems should be able to act within explicitly defined limits.

13. Capability and authorization are different concepts.

14. Agent architecture should be analyzed through responsibility rather than labels.

15. The purpose of AGT-01.01 is to establish the mental model required to understand the detailed agent engineering topics that follow.

---

# 53. Further Reading

The following topics should be studied next within the Enterprise GenAI Engineering curriculum:

- [AGT-02 — Agent Runtime, Loops & Bounded Autonomy](../AGT-02-Agent-Runtime-Loops-and-Bounded-Autonomy/Readme.md)
- [AGT-03 — Tools & Action Execution](../AGT-03-Tools-and-Action-Execution/Readme.md)
- [AGT-04 — State, Context & Memory](../AGT-04-State-Context-and-Memory/Readme.md)
- [AGT-05 — Planning & Adaptive Execution](../AGT-05-Planning-and-Adaptive-Execution/Readme.md)

These chapters expand the foundational vocabulary introduced here.

AGT-01.01 should not be treated as a condensed version of those chapters. Its purpose is to establish the system-level mental model and responsibility boundaries required to understand them.

---
