# AGT-04 — Agent State, Context and Lifecycle

## 1. Learning Objectives

After completing this file, you should be able to:

- Explain the difference between **state**, **context**, and **memory**.
- Explain why these concepts should not be collapsed into one generic “agent state.”
- Describe what state represents during an agent execution.
- Describe what context represents during a particular execution step.
- Explain why context is selected for a particular step rather than being equivalent to everything available.
- Describe how information moves through an agent execution lifecycle.
- Distinguish information used during the current execution from information retained for potential future use.
- Explain how state changes as execution progresses.
- Explain at a high level how retained information can later influence context.
- Explain why information leaving active context does not automatically become memory.
- Identify the boundaries between AGT-04 and runtime execution, tool engineering, retrieval engineering, and model interaction.

---

## 2. Prerequisites

Before studying this file, you should understand:

- [AGT-01-Agent-Systems-Foundations](../AGT-01-Agent-Systems-Foundations/README.md)
- [AGT-02 — Agent Runtime, Loops & Bounded Autonomy](../AGT-02-Agent-Runtime-Loops-and-Bounded-Autonomy/README.md)
- [AGT-03 — Tools & Action Execution](../AGT-03-Tools-and-Action-Execution/README.md)

In particular, you should already understand that an agent executes through a process involving inputs, decisions, actions, observations, and continuation.

AGT-04 does not re-teach the runtime loop.

Instead, it examines the **information conditions surrounding that execution**.

---

## 3. Estimated Reading Time

**30–40 minutes**

---

## 4. Before We Start

Consider an agent helping a customer with a delayed order.

The customer says:

> “Please check my order. Also, remember that I prefer communication in Hindi.”

The system now has several different information-management questions:

- What task is currently active?
- What step is the execution currently on?
- What information is needed for the next step?
- What information from previous interactions is relevant?
- What information should remain useful after this interaction?
- Should the language preference be retained?
- If it is retained, who should it apply to?
- What happens if the customer later changes the preference?

These are related questions, but they are not the same question.

A useful starting point is:

```text
State
= What is currently true about the execution?

Context
= What information is assembled for this execution step?

Memory
= What information is retained according to an intentional system policy
  for potential future use?
```

The foundational distinction is:

> **State ≠ Context ≠ Memory**

They interact, but they serve different purposes.

---

# 5. Why This Exists

Agent systems continuously operate on information.

Some information describes the current execution.

Some information is needed by the next execution step.

Some information may be useful later.

Some information should not be retained.

If all of these are treated as one undifferentiated information store, it becomes difficult to reason about:

- what the agent currently knows about its execution;
- what the next step actually needs;
- what information should survive beyond the current execution;
- what information should simply be discarded.

Consider:

```text
Current task
Current execution step
Recent tool result
Conversation history
User preference
Retrieved document
Old debugging information
```

These pieces of information can have very different roles and lifetimes.

The core engineering problem is therefore:

> **How should an agent represent its current condition, assemble information for the current step, and retain selected information according to an appropriate policy for future use?**

That is the focus of AGT-04.

---

# 6. Mental Model

The simplest useful model is:

```text
                    STATE
             Current condition
                    │
                    │ informs
                    ▼
                  CONTEXT
       Information assembled for
          the current step
                    │
                    ▼
                EXECUTION
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
     State Update       Retention Decision
                              │
                        ┌─────┴─────┐
                        │           │
                     Retain       Discard
                        │
                        ▼
                     MEMORY
                        │
                        │ may later
                        │ become relevant
                        ▼
                     CONTEXT
```

This diagram describes the **information relationship**, not a required software architecture.

The three questions are:

```text
State:
What is currently true?

Context:
What information does this execution step need?

Memory:
What information should remain available for potential future use?
```

---

# 7. State

## 7.1 What Is State?

State represents the **current condition** of an agent execution, session, or other bounded execution scope.

For example:

```text
Task:
Reset customer password

Status:
Verification pending

Current Step:
Waiting for verification code

Pending Action:
Continue after verification
```

This describes what is currently true about the execution.

That is state.

A useful test is:

> **Does this information describe the current condition of the execution?**

If yes, it may be part of state.

---

## 7.2 State Is Dynamic

State changes as execution progresses.

A simplified lifecycle is:

```text
Event / Input
      ↓
State Transition
      ↓
Current State
      ↓
Execution
      ↓
New Event / Result
      ↓
State Transition
      ↓
Updated State
```

For example:

```text
Initial State
    ↓
Task = "Book flight"
Status = "Started"

User provides destination
    ↓
State Update
    ↓
Task = "Book flight"
Status = "Collecting itinerary"
Destination = "Delhi"

Search completes
    ↓
State Update
    ↓
Status = "Options available"
```

The important point is that state represents a **changing execution condition**, not every piece of information the system has ever observed.

---

## 7.3 State Transitions

A state transition occurs when an event changes the execution condition.

For example:

```text
Waiting for user
       │
       │ user response received
       ▼
Processing response
       │
       │ validation succeeds
       ▼
Ready for next step
```

State should therefore represent meaningful execution conditions.

It should not automatically be treated as a complete historical record.

---

## 7.4 State and History

An agent may have historical events:

```text
Step 1:
User requested password reset

Step 2:
Verification email sent

Step 3:
User entered verification code

Step 4:
Verification succeeded
```

The current state might now be:

```text
Verification complete
Reset can proceed
```

History explains **how the system arrived at the current condition**.

State represents **the condition that currently holds**.

Historical information can be used to reconstruct or understand state, but historical information and current state are not synonymous.

---

## 7.5 Execution State and Session State

State can exist at different scopes.

### Execution state

Information about one active execution.

```text
Execution ID
Current task
Current step
Current status
Pending work
```

### Session state

Information associated with an ongoing interaction or session.

```text
Session identifier
Current interaction status
Session-specific information
Session metadata
```

The important engineering question is:

> **What scope does this state belong to?**

Information belonging to one execution should not automatically become state for another execution.

---

# 8. Context

## 8.1 What Is Context?

Context is the information **assembled and presented for a particular execution step**.

Possible context sources include:

- current user input;
- relevant state;
- selected previous information;
- relevant tool results;
- relevant retained information;
- selected retrieved information;
- applicable instructions.

A simplified model is:

```text
Current Input
      +
Relevant State
      +
Selected Information
      +
Relevant Retained Information
      ↓
    Context
```

The defining property is not the source.

The defining property is:

> **The information has been selected and assembled for the current execution step.**

---

## 8.2 Context Is Not Everything Available

An agent may have access to a large amount of information.

That does not mean all of it belongs in context.

For example:

```text
Available Information
├── Current user request
├── Current state
├── Previous messages
├── Old tool results
├── Retrieved documents
├── User preferences
└── Unrelated historical information
```

The next step may require only:

```text
Current user request
+
Current state
+
One relevant tool result
+
Relevant retained information
```

Therefore:

```text
Available Information ≠ Context
```

Instead:

```text
Available Information
        ↓
Information Selection
        ↓
Context
```

The detailed engineering of selection, prioritization, ordering, budgets, freshness, conflicts, compaction, truncation, and reconstruction is covered in:

[02 — Context Engineering and Execution Context Management](./02-Context-Engineering-and-Execution-Context-Management.md)

---

## 8.3 Context Is Not Conversation History

Conversation history is one possible source of context.

It is not synonymous with context.

For example:

```text
Conversation History

Message 1
Message 2
Message 3
Message 4
...
Message 100
```

A particular execution step may require only:

```text
Message 3
Message 17
Message 98
```

Therefore:

> **Conversation history is a source of information; context is the information selected for the current execution step.**

---

## 8.4 Context Changes Across Steps

Context is associated with a particular execution step.

Different steps can require different information.

For example:

```text
Step 1:
Identify customer

Context:
Customer request
Relevant identity information

Step 2:
Check order

Context:
Customer identity
Order information

Step 3:
Explain delay

Context:
Order status
Relevant evidence
Current user request
```

The execution may be one continuous task, but the information required by each step can differ.

This is why context should be understood as **step-specific information**, not as one permanent information set.

---

# 9. Memory

## 9.1 What Is Memory?

Memory is information **retained according to an intentional system policy for potential future use**.

Examples can include:

- stable user preferences;
- project conventions;
- historical decisions;
- long-lived facts;
- selected information from previous interactions.

For example:

```text
User says:

"I prefer technical explanations with examples."
```

During the current interaction, that statement may simply be part of context.

If the system determines that the preference should be retained for future interactions, it can become memory.

The important distinction is:

> **Observation does not automatically imply memory.**

---

## 9.2 Memory Is Not Simply Storage

A storage mechanism does not automatically define memory.

Memory involves a lifecycle decision:

```text
Information
     ↓
Should it be retained?
     ↓
Retain / Discard
```

The retained information may be implemented using:

- structured records;
- relational storage;
- key-value storage;
- documents;
- embeddings;
- specialized systems;
- combinations of these.

The implementation mechanism is not the conceptual definition of memory.

---

## 9.3 Memory Has a Different Lifetime

Consider two pieces of information:

```text
Current tool result
    ↓
Useful for current execution
    ↓
No longer needed
    ↓
Discard
```

and:

```text
User preference
    ↓
Potentially useful in future interactions
    ↓
Retain according to policy
```

These have different information lifecycles.

Therefore:

> **Information does not become memory merely because it existed during execution.**

---

## 9.4 Memory Can Become Future Context

Retained information can later influence another execution.

For example:

```text
Stored Memory
     ↓
Future Execution
     ↓
Relevant?
     ↓
Selected
     ↓
Context
     ↓
Execution
```

This is one of the most important relationships in AGT-04:

> **Memory may become a source of future context.**

But:

> **Not all memory is relevant to every future execution.**

Detailed memory retention, retrieval, relevance, correction, expiration, deletion, and scope are covered in:

[03 — Agent Memory, Retention, Retrieval and Lifecycle](./03-Agent-Memory-Retention-Retrieval-and-Lifecycle.md)

---

# 10. State, Context and Memory Compared

| Dimension | State | Context | Memory |
|---|---|---|---|
| Primary question | What is currently true? | What information is needed now? | What should remain available later? |
| Main purpose | Represent current condition | Support current execution step | Preserve selected information |
| Typical scope | Execution or session | Current execution step | Future executions |
| Lifetime | Current condition | Current step or execution window | Potentially longer-lived |
| Selected? | Through state design | Yes | Through retention policy |
| Automatically becomes memory? | No | No | Already retained |
| Can influence context? | Yes | Already is context | Yes |
| Example | Current step = verification | Relevant verification result | Stable user preference |

This table is a mental model, not a rigid storage specification.

---

## 11. Information Lifecycle

The three concepts become clearer when viewed together.

```text
                 INPUT / EVENT
                       │
                       ▼
                CURRENT STATE
                       │
                       ▼
              CONTEXT ASSEMBLY
                       │
                       ▼
                  EXECUTION
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
         STATE UPDATE     RETENTION DECISION
                                │
                         ┌──────┴──────┐
                         │             │
                      RETAIN        DISCARD
                         │
                         ▼
                      MEMORY
                         │
                         │ future relevance
                         ▼
                      CONTEXT
```

The important relationships are:

1. State represents the current condition.
2. Context supports the current execution step.
3. Execution can change state.
4. Information may be considered for retention.
5. Retained information can later become context.
6. Information can also simply be discarded.

Nothing in this lifecycle requires every observed piece of information to become memory.

---

# 12. Integrated Example — Customer Support Agent

Consider a customer support agent.

The customer says:

> “My order has not arrived. Please check it, and remember that I prefer communication in Hindi.”

Suppose the execution currently looks like this.

### Current state

```text
Task:
Investigate delayed order

Status:
Investigation in progress

Current Step:
Checking shipment status
```

This describes the current execution condition.

### Current context

```text
User request:
"My order has not arrived."

Relevant order:
Order #1234

Current shipment information:
Shipment delayed at regional facility

Relevant communication information:
Hindi
```

This is the information assembled for the current step.

### Potential memory

```text
User communication preference:
Prefers Hindi
```

This could be retained for future interactions if the system's retention policy determines that it should be.

The distinction is therefore:

```text
Investigation in progress
        → State

Current order information
        → Context

Preference intended for future use
        → Potential Memory
```

Now suppose the shipment API returns:

```text
Order #1234
Status: Delayed
Expected delivery: Tomorrow
```

That result may enter the current context.

After the current task completes, it might simply be discarded.

The system does not need to remember every temporary operational result.

The language preference, by contrast, may have future value and may therefore be retained.

---

# 13. Information Can Change Roles

The same underlying information can participate in different lifecycle stages.

For example:

```text
User statement
      ↓
Current Context
      ↓
Retention Decision
      ↓
Memory
      ↓
Future Execution
      ↓
Selected Into Context
```

This does **not** mean that state, context, and memory are the same thing.

It means that information can move between lifecycle stages depending on how the system uses it.

The role is determined by the information's purpose and lifecycle at that point.

---

# 14. Information Leaving Context

A common misconception is:

> “If information leaves context, it becomes memory.”

It does not.

Consider:

```text
Temporary API Result
       ↓
Current Context
       ↓
Execution
       ↓
No longer needed
       ↓
Discard
```

Another piece of information may follow:

```text
User Preference
       ↓
Current Context
       ↓
Retention Decision
       ↓
Memory
```

Both began as information used during execution.

Their lifecycles differ because their retention requirements differ.

---

# 15. Production Perspective

The State/Context/Memory distinction becomes especially important when an agent system is used in production.

## 15.1 Incorrect State

Suppose the system records:

```text
Verification complete
```

when verification is actually still pending.

A later execution step can then operate from an incorrect execution condition.

The failure is fundamentally an information-state problem.

---

## 15.2 Stale Context

Suppose an agent uses an old account balance.

The information may have been correct when produced, but it may no longer represent the current condition.

This demonstrates:

> **Historically correct information is not necessarily appropriate current context.**

---

## 15.3 Excessive Context

Suppose the system provides:

```text
Current request
+
Thousands of old messages
+
Old tool results
+
Unrelated documents
```

The problem is not lack of information.

The problem is failure to distinguish information that is available from information that is useful for the current step.

---

## 15.4 Incorrect Memory

Suppose the user says:

> “I am moving to Mumbai next month.”

A system incorrectly stores:

```text
User lives in Mumbai.
```

The retained information can later influence unrelated executions.

This demonstrates why retained information must have an appropriate representation and lifecycle.

---

## 15.5 Incorrect Scope

Suppose information retained for User A becomes available during User B's execution.

The information may be valid in isolation but invalid for the second execution.

This is why information scope matters.

AGT-04 addresses the **information-management dimension** of this problem.

Broader agent safety and security consequences belong to AGT-11, while enterprise governance belongs to ENT.

---

# 16. Engineering Decisions and Trade-offs

## 16.1 Temporary Information vs Retained Information

Not every useful piece of information needs to survive the current execution.

A system must distinguish:

```text
Useful now
```

from:

```text
Potentially useful later
```

Retaining everything increases lifecycle complexity and can increase the chance of stale or incorrectly scoped information.

---

## 16.2 Current Context vs Available Information

An agent may have access to more information than the current step requires.

Therefore:

> **Availability does not imply inclusion in context.**

The detailed mechanisms for deciding what belongs in context are handled by Lesson 02.

---

## 16.3 Retention vs Discarding

Retention can improve continuity.

Discarding can reduce stale, irrelevant, or unnecessarily persistent information.

Therefore:

> **The goal is not maximum retention. The goal is appropriate retention.**

Detailed retention policies belong to Lesson 03.

---

## 16.4 State Representation vs Historical Detail

A state representation should communicate the current execution condition.

Historical information may still be valuable for reconstruction, auditing, or debugging, but storing every historical event directly inside current state is not automatically appropriate.

---

# 17. Common Mistakes and Misconceptions

## Mistake 1 — “State, context, and memory are the same thing.”

They are related but have different responsibilities.

```text
State
→ current condition

Context
→ information assembled for the current step

Memory
→ information retained for future use
```

---

## Mistake 2 — “Everything in context is memory.”

Incorrect.

Context can contain temporary information that is useful only for the current execution.

---

## Mistake 3 — “Everything observed should become memory.”

Incorrect.

Observation does not establish future usefulness.

A retention decision is required.

---

## Mistake 4 — “Memory is a vector database.”

Incorrect.

A vector database may be part of a memory implementation, but memory is the broader responsibility of retaining information for potential future use.

---

## Mistake 5 — “Context means the entire conversation history.”

Incorrect.

Conversation history is a possible information source.

Context is the information assembled for the current execution step.

---

## Mistake 6 — “More context is always better.”

Incorrect.

Additional information can be irrelevant, stale, conflicting, or unnecessarily expensive to process.

---

## Mistake 7 — “Anything leaving context should be remembered.”

Incorrect.

Information can simply be discarded.

---

## Mistake 8 — “Persistent memory is permanent.”

Incorrect.

Retained information can later require updating, expiration, correction, or deletion.

Those lifecycle mechanisms are explored in Lesson 03.

---

## Mistake 9 — “Retrieved information automatically becomes memory.”

Incorrect.

Retrieved information may simply be used as current context and then discarded.

Retrieval and memory retention are separate decisions.

---

# 18. Interview Questions with Expected Answers

## 1. What is the difference between state, context, and memory?

**Expected answer:**

State represents the current condition of an execution or session. Context is the information assembled for a particular execution step. Memory is information retained according to an intentional system policy for potential future use.

A strong answer should also explain that these concepts interact but should not be collapsed into one generic information store.

---

## 2. Why is context not simply the entire conversation history?

**Expected answer:**

Conversation history is an information source. Context is the information selected and assembled for the current execution step. A long history can contain irrelevant or stale information, so the current step may require only a subset.

---

## 3. A tool returns a result that is useful for the current step. Should it automatically become memory?

**Expected answer:**

No. The result may only be useful for the current execution. Memory requires a retention decision based on whether the information should remain useful beyond the current execution.

---

## 4. Can memory become context?

**Expected answer:**

Yes. Retained information can be considered during a future execution and, if relevant, selected into that execution's context.

---

## 5. Can context exist without memory?

**Expected answer:**

Yes. An agent can operate using current input, current state, instructions, and temporary information without retaining long-lived memory.

---

## 6. Can state become context?

**Expected answer:**

Yes. Relevant state information can be included in context. However, state and context remain conceptually distinct: state represents the current condition, while context is the information assembled for the current step.

---

## 7. An agent has access to thousands of previous messages. Should all of them be placed into context?

**Expected answer:**

No. The system should determine which information is relevant to the current execution step. Availability alone does not justify inclusion.

---

## 8. A user's stored preference conflicts with their current request. Which one should win?

**Expected answer:**

The system needs an explicit conflict-resolution policy. The current request may represent a temporary override, while the stored preference may remain relevant to future interactions. The correct behavior depends on the scope and meaning of each piece of information.

---

## 9. What happens when information leaves the active context?

**Expected answer:**

Nothing automatically happens. It may be discarded, retained according to a memory policy, or used in another execution. Leaving context does not imply memory formation.

---

## 10. Why can historically correct information still be inappropriate for current context?

**Expected answer:**

Because it may be stale or no longer relevant to the current execution condition. Correctness at the time it was produced does not guarantee current relevance.

---

## 11. Why is state different from historical execution data?

**Expected answer:**

Historical data describes what happened previously, while state represents the condition that currently holds. Historical information can help reconstruct or understand state, but the two concepts are not synonymous.

---

## 12. What is the most important conceptual distinction in AGT-04?

**Expected answer:**

The foundational distinction is:

```text
State
= current execution condition

Context
= information assembled for the current execution step

Memory
= information retained according to an intentional system policy
  for potential future use
```

A strong engineer should also explain how these interact without collapsing them into one concept.

---

## 13. An agent stores current task state, conversation history, retrieved documents, and long-lived user preferences in one shared information store. What conceptual problem might this create?

**Expected answer:**

The system may lose clear distinctions between current state, temporary execution context, historical information, and retained memory. This can make lifecycle, scope, freshness, and retention decisions difficult to reason about and can cause inappropriate information to influence future executions.

---

# 19. Quick Revision

### State

> **What is currently true?**

```text
Current task
Current step
Current status
Pending work
```

### Context

> **What information does this execution step need?**

```text
Current request
Relevant state
Selected information
Relevant retained information
```

### Memory

> **What information should remain available for potential future use?**

```text
Stable preference
Project convention
Historical decision
Long-lived information
```

### Lifecycle

```text
Input / Event
     ↓
Current State
     ↓
Context Assembly
     ↓
Execution
     ↓
State Update
     ↓
Retention Decision
     ↓
Retain / Discard
     ↓
Future Context
```

### Three questions

```text
1. What is currently happening?
   → State

2. What information is needed now?
   → Context

3. What should remain useful later?
   → Memory
```

---

# 20. Key Takeaways

1. **State, context, and memory are distinct concepts.**
2. **State represents the current condition of execution.**
3. **Context is information assembled for a particular execution step.**
4. **Memory is information retained according to an intentional system policy for potential future use.**
5. **Available information is not automatically context.**
6. **Conversation history is not synonymous with context.**
7. **Information in context is not automatically memory.**
8. **Information leaving context is not automatically retained.**
9. **Memory can later become a source of context.**
10. **State can influence context, but state and context remain conceptually distinct.**
11. **Not every useful piece of information should be retained.**
12. **State changes as execution progresses.**
13. **Context can change from one execution step to another.**
14. **Memory has a lifecycle rather than being permanent storage by definition.**
15. **The central AGT-04 question is:**

> **What information does the agent need now, what condition is the execution currently in, and what information should be retained for future use?**

---

## 21. Further Reading

Within the Enterprise GenAI Engineering curriculum:

- [AGT-02 — Agent Runtime, Loops & Bounded Autonomy](../AGT-02-Agent-Runtime-Loops-and-Bounded-Autonomy/README.md)
- [AGT-03 — Tools & Action Execution](../AGT-03-Tools-and-Action-Execution/README.md)
- [02 — Context Engineering and Execution Context Management](./02-Context-Engineering-and-Execution-Context-Management.md)
- [03 — Agent Memory, Retention, Retrieval and Lifecycle](./03-Agent-Memory-Retention-Retrieval-and-Lifecycle.md)

The next file focuses on:

> **How should an agent decide what information belongs in the context for a particular execution step?**

It will therefore go deeper into context selection, prioritization, ordering, budgets, freshness, conflicts, contamination, compaction, truncation, omission, and reconstruction.
