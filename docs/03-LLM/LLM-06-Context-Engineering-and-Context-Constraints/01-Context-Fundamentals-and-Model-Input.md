# 01 — Context Fundamentals and Model Input

## 1. Purpose

Before engineers can improve a language model's context, they must understand what information the model actually receives.

An application may have access to conversation history, database records, retrieved documents, tool results, and user instructions. However, these objects do not necessarily reach the model in their original form. Application code may select, transform, serialize, or omit information before submitting an inference request.

This creates the foundational question of context engineering:

**What information is available to the model for this particular inference step?**

This chapter establishes the mental model used throughout LLM-06. It distinguishes the user prompt, complete model input, conversation history, and broader application state. It also explains how information supplied at inference time differs from knowledge learned during training.

### Learning objectives

By the end of this chapter, you should be able to:

- Define context for a language-model interaction.
- Distinguish a user prompt from the complete model input.
- Explain the difference between conversation history and application state.
- Trace how application data becomes available to a model.
- Distinguish learned knowledge from information supplied at inference time.
- Identify information that an application possesses but does not send to the model.

## 2. What Is Context?

In this module, **context** means the information made available to a language model for a particular inference step.

Depending on the model and interface, context may include instructions, the current request, selected conversation history, reference material, tool results, structured data, and other supported inputs.

Context is not necessarily identical to the text visible in a chat window. Some interfaces represent inputs as multiple messages, structured content, metadata, or multimodal data. The exact representation and processing path depend on the model and interface.

Consider a customer-support application. A customer asks:

> Why was my order delayed?

The application may have access to the customer's question, previous messages, an order record, and a shipping status returned by an external service. But those items do not automatically become part of the model's input.

If the application sends only the question, the model does not receive the database record or shipping status through that request. If the application includes the relevant shipping information, the model has access to that supplied evidence.

**Information available to the application is not necessarily information available to the model.**

This distinction is the foundation for the context-selection, budgeting, and management decisions covered in later chapters.

## 3. Four Concepts Engineers Must Distinguish

The terms *user prompt*, *complete model input*, *conversation history*, and *application state* are related, but they represent different things.

### 3.1 User prompt

The user prompt is the request or content supplied by the user.

Examples include:

- "Summarize this report."
- "Explain the difference between precision and recall."
- "Use the following policy to answer the question."
- "Compare these two product specifications."

The prompt expresses the user's immediate intent, but it may not contain all the information needed to fulfill the request. For example, "Summarize this report" is insufficient if the report itself is neither supplied nor otherwise made available to the model.

The user prompt is one possible component of context, not a complete description of it.

### 3.2 Complete model input

The complete model input is the set of inputs supplied to the model for a particular inference step, as represented by the relevant interface.

Depending on the system, it may include:

- System-level instructions, where supported.
- Developer or application instructions.
- The current user request.
- Selected earlier messages.
- Retrieved passages or reference documents.
- Tool results and structured data.
- Task constraints, examples, or output-format requirements.
- Other supported modalities or metadata.

Not every interface exposes all these components. Message roles, input structures, and instruction semantics also vary across systems.

Engineers should inspect the actual interface and request construction rather than assume every model receives the same message structure or interprets every role identically.

### 3.3 Conversation history

Conversation history is the record of earlier messages or interaction turns. It may contain user requests, assistant responses, tool interactions, corrections, decisions, and previous context.

History can be a source of context, but it does not follow that every historical message is included in every inference request.

An application may include the full history, retain only recent messages, select relevant exchanges, summarize earlier interactions, or omit history that is no longer useful.

The model's available context depends on what the application supplies for the current step.

### 3.4 Broader application state

Application state is the information maintained by the surrounding software system.

Examples include:

- User preferences and account settings.
- Database records.
- Authentication and authorization state.
- Current workflow status.
- Files and documents.
- Tool execution results.
- Information held in caches or external services.

Much of this information may never be sent to the model.

For example, an application might use a customer identifier to retrieve an order but exclude that identifier from the model input. It could then send only the relevant order summary.

This distinction matters for correctness and data minimization: the model should receive information required for the task, not automatically everything the application possesses.

### Comparison

| Concept | What it represents | Does it necessarily reach the model? |
|---|---|---|
| User prompt | The user's immediate request or supplied content | No; it must be included in the request being processed. |
| Complete model input | Inputs supplied for a particular inference step | Yes, by definition, subject to the actual interface and processing path. |
| Conversation history | Earlier interaction messages or turns | No; history may be filtered, transformed, or omitted. |
| Application state | Information maintained by the surrounding system | No; only selected information may be supplied to the model. |

A multi-turn application may preserve a fact in its own state without including that fact in the next model request. Engineers must not treat application state and model context as interchangeable.

## 4. The Application-to-Model Information Boundary

Information typically passes through an application-side preparation stage before it reaches a model. The following diagram shows a conceptual flow, not a universal architecture.

<CodeBlock language="mermaid">flowchart TD
    A["User request"] --> D["Application prepares request"]
    B["Document repository"] --> C["Application obtains document"]
    C --> D
    E["Application instructions"] --> D
    F["Selected conversation history"] --> D
    D --> G["Model input"]
    G --> H["Model inference"]
    H --> I["Generated response"]</CodeBlock>

Consider a contract-summary application. The application obtains a contract, selects the material needed for the task, combines it with the request and applicable instructions, and constructs the model input.

If the application never supplies the contract or relevant excerpts, the model cannot reliably summarize that specific contract based on its actual contents. It might generate a plausible description of a typical contract, but plausibility does not establish that it accessed the missing document.

The same principle applies to database query results, recent account activity, uploaded files, tool results, and decisions retained by an application.

For debugging, establish the information boundary first: determine what the application possesses and what it actually submits for the inference step.

## 5. Learned Knowledge Versus Supplied Information

A model's behavior is influenced by two important sources of information:

1. Knowledge and behavioral patterns reflected in its learned parameters.
2. Information supplied through the current inference input.

These sources are related but not interchangeable.

### 5.1 Learned knowledge

During training, a model's parameters are adjusted through optimization. The resulting parameters encode patterns and capabilities acquired from training.

This can allow a model to explain general programming concepts or recognize common language patterns without receiving a reference document for every question.

However, learned knowledge is not equivalent to a complete, searchable database of training examples. It does not guarantee that a particular fact was learned, can be recalled correctly, or remains current.

Training objectives and the formation of learned behavior belong primarily to LLM-02. This chapter focuses on the relationship between learned knowledge and information supplied at inference time.

### 5.2 Information supplied at inference time

Inference-time information is provided as part of the current model interaction.

Examples include:

- A document uploaded by the user.
- A recent transaction returned by an application.
- A newly published policy supplied as reference material.
- A tool result included in a subsequent request.
- An explicit task constraint.
- A correction that changes the current requirements.

Consider this request:

> According to the policy below, what is the reimbursement limit for this employee?

General language understanding helps the model interpret the question. The applicable policy and relevant employee-specific information provide the evidence needed to answer it.

If the policy is absent, the model may rely on general expectations or produce an unsupported answer. If an outdated policy is supplied, the response may be based on incorrect evidence. Supplying the correct policy and relevant employee details provides a better basis for answering the specific question.

Even when relevant evidence is supplied, the model may still misinterpret or overlook it.

**Engineering principle:** distinguish what the model may know generally from what it must establish using the current task's evidence.

## 6. Context Quality Is Not Context Quantity

Having more information does not necessarily mean having better context.

Suppose a model must answer a question using a company policy. Possible inputs include:

- The question alone.
- The question plus the relevant policy section.
- The question plus the full policy, duplicate copies, unrelated emails, and outdated notes.

The first input may lack the evidence required for an answer. The second may provide sufficient, focused information. The third supplies more material but may also introduce contradictions and unnecessary content.

Which input is appropriate depends on the task and the information available. The foundational point is that context should be understood in terms of its suitability for the task, not merely its size.

The next chapters examine how to select context, budget for its size, and investigate how information is organized and used.

## 7. Inspecting What the Model Actually Receives

When an answer is incorrect, begin by checking whether the required information was supplied. This does not establish the cause of every model failure, but it prevents a basic category error: blaming the model for missing information that never reached it.

Use the following focused inspection method.

### Step 1: Define the information requirement

State what the model needs to answer the question. For a policy query, this might include the applicable policy version, relevant dates, and employee-specific conditions.

### Step 2: Identify where the information originates

Determine whether each required item comes from the user request, previous messages, a database, a reference document, or a tool result.

### Step 3: Inspect request construction

Check which information the application selected and how it represented that information in the outgoing request. Do not assume that all conversation history or every application variable was included.

Where appropriate, inspect sanitized request payloads, application logs, or request-building code. Avoid exposing credentials, secrets, or unnecessary personal information.

### Step 4: Compare required information with supplied information

Ask:

- Is the necessary evidence present?
- Is it the correct version?
- Are relevant dates, units, exceptions, and constraints preserved?
- Is the model being asked to use information that was never supplied?

If the required information is absent, the request-construction path needs attention. If the information is present but the answer is still incorrect, further investigation is required. Context availability alone does not guarantee correct interpretation.

## 8. Common Misconceptions

**"The model can access everything the application knows."**

No. Application state and model input are different. Relevant information must be made available through the current interaction or another supported mechanism.

**"The user prompt is the complete context."**

No. The model input may contain instructions, selected history, evidence, tool results, and other supported inputs.

**"The entire conversation is always included."**

No. Applications may select, summarize, or omit earlier messages. The actual request must be inspected.

**"Learned knowledge guarantees correct answers about current facts."**

No. Learned knowledge may be incomplete or outdated. Current or task-specific facts may need to be supplied as evidence.

**"If evidence is present, the model must use it correctly."**

No. Supplying information makes it available; it does not guarantee correct interpretation or utilization.

## 9. Chapter Summary

Context is the information available to a language model for a particular inference step. It must be distinguished from both the user's immediate prompt and the broader state maintained by the application.

The four concepts to remember are:

- **User prompt:** the user's immediate request or supplied content.
- **Complete model input:** the inputs supplied for the current inference step.
- **Conversation history:** earlier interaction messages that may or may not be included.
- **Application state:** information maintained by the surrounding software, only some of which may reach the model.

Learned knowledge differs from inference-time supplied information. A model may possess general knowledge, but task-specific or current facts may need to be supplied explicitly. Even then, correct use of that information is not guaranteed.

The central engineering principle is to inspect the actual model input before deciding how to improve it. Establish what information is available, what the task requires, and whether the two align.

## 10. Knowledge Check

Answer these questions in your own words before proceeding.

1. An application retrieves the correct order status from a database, but the model returns a generic answer. What would you inspect first, and why?
2. Why are conversation history and application state not interchangeable?
3. A model gives an incorrect answer about a recently changed company policy. How would you distinguish missing evidence from incorrect use of supplied evidence?
4. Why might including every previous message in every request be a poor design decision?
5. What is the difference between an application possessing a fact and making that fact available to the model?

Strong answers should identify the information boundary, state assumptions, and describe what evidence would support or reject the proposed explanation.

**Next chapter:** `02-Context-Composition-and-Information-Selection.md` — deciding what information belongs in the context and reasoning about relevance, freshness, authority, completeness, and conflicting material.
