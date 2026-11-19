# AI-Specific Production Threats and Protection

## 1. Purpose

AI systems introduce security threats that do not always exist, or do not have the same characteristics, in conventional software systems.

A production AI service may accept natural-language input, process sensitive information, invoke models, generate untrusted content, and consume substantial compute resources.

A simplified production AI boundary looks like:

```text
User / External System
        ↓
AI API / Application
        ↓
AI Model / AI Capability
        ↓
Generated Output
        ↓
Application / External System
```

Every stage creates opportunities for abuse.

Examples include:

- Unauthorized inference
- Model endpoint abuse
- Resource exhaustion
- Denial-of-wallet
- Sensitive information exposure
- Data exfiltration
- Model extraction
- Model theft
- Prompt injection
- Unsafe handling of AI-generated output
- Malicious or poisoned AI data
- Insecure AI integrations
- Abuse of model capabilities

The central question for this chapter is:

> **What new or amplified security threats appear because the production system contains AI capabilities, and how should the system defend against them?**

The goal is not to provide an exhaustive threat encyclopedia.

The goal is to develop the ability to:

1. Identify AI-specific production attack surfaces.
2. Understand how an attacker can abuse AI capabilities.
3. Distinguish AI threats from conventional application vulnerabilities.
4. Map threats to appropriate technical controls.
5. Understand the limitations of those controls.
6. Design layered prevention, detection, containment, and response.
7. Reason about residual risk.
8. Make security decisions without assuming that AI-specific controls provide complete protection.

---

# 2. Why AI Changes the Production Security Model

Traditional software generally executes according to explicitly programmed logic.

AI systems introduce additional behavior.

For example:

```text
Traditional Application

Input
  ↓
Deterministic Program Logic
  ↓
Output
```

An AI application may instead look like:

```text
AI Application

Input
  ↓
Application Logic
  ↓
Model Interpretation
  ↓
Generated Output
  ↓
Application Action
```

The model becomes part of the system's behavior.

This introduces additional security questions:

- What can an attacker cause the model to reveal?
- What inputs can influence model behavior?
- Can model outputs be trusted by downstream systems?
- How much computation can one request consume?
- Can repeated requests expose information about the model?
- Can sensitive data enter the model context?
- Can generated content cross a security boundary?
- Can external content influence model behavior?

Therefore:

> **AI does not replace conventional application security; it adds new attack surfaces on top of it.**

---

# 3. AI Attack-Surface Mental Model

A useful production mental model is:

```text
                 AI Production System
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
     Inputs          Model            Outputs
        │               │                │
        ↓               ↓                ↓
  Prompt Abuse     Model Abuse      Output Abuse
        │               │                │
        └───────────────┼────────────────┘
                        ↓
                  Resource Abuse
                        ↓
                  Data Exposure
                        ↓
                  Business Impact
```

Threats can therefore originate from:

- What enters the system
- What the model can access
- How the model behaves
- What the model produces
- How the application consumes the output
- How much infrastructure the AI request can consume

---

# 4. AI Threat Reasoning Framework

A useful way to analyze an AI-specific threat is:

```text
Asset
  ↓
Entry Point
  ↓
Threat / Abuse Case
  ↓
Impact
  ↓
Security Control
  ↓
Residual Risk
```

For example:

```text
Model Endpoint
      ↓
Automated High-Volume Requests
      ↓
Resource Exhaustion
      ↓
Availability + Cost Impact
      ↓
Authentication + Rate Limits + Quotas
      ↓
Residual Abuse Risk
```

This framework prevents security analysis from becoming a list of disconnected threats.

The engineer should always ask:

> **What is being attacked, how is it reached, what can the attacker achieve, and which control reduces that risk?**

---

# 5. AI-Specific Threats vs Conventional Threats

Not every security problem in an AI system is an AI-specific problem.

For example:

- SQL injection remains an application security problem.
- Broken authentication remains an identity problem.
- Vulnerable dependencies remain a supply-chain problem.
- Excessive permissions remain an access-control problem.

AI adds additional threat dimensions.

Examples include:

- Prompt injection
- Model extraction
- Inference abuse
- Denial-of-wallet
- Sensitive information exposure through model behavior
- Untrusted model outputs
- AI-specific data poisoning
- Abuse of model capabilities

A useful distinction is:

```text
Conventional Security Threat
        ↓
Exists independently of AI
        ↓
May still affect an AI system

AI-Specific / AI-Amplified Threat
        ↓
AI materially changes the attack path,
impact, or required security control
```

Therefore:

> **A threat should be treated as AI-specific when the presence of AI materially changes how the threat is performed, what it can affect, or which security controls are required.**

This distinction prevents AI security from becoming a generic re-teaching of application security.

The correct production model is:

```text
Conventional Security
        +
AI-Specific / AI-Amplified Security
        =
Production AI Security
```

---

# 6. Model Endpoint Abuse

A model endpoint exposes inference capability to a caller.

For example:

```text
Client
  ↓
API
  ↓
Model Endpoint
  ↓
Inference
```

If access is insufficiently controlled, attackers may use the endpoint for unintended purposes.

Potential abuse includes:

- Automated request generation
- High-volume inference
- Repeated expensive prompts
- Unauthorized use of premium models
- Use of the endpoint as a proxy
- Attempts to extract information through repeated queries

The security objective is:

> **Ensure that inference capability is available only to authorized callers and within intended usage boundaries.**

---

# 7. Unauthorized Inference

Unauthorized inference occurs when a party obtains model execution capability without the intended authorization.

Examples include:

- Stolen credentials
- Exposed API keys
- Broken authorization
- Unprotected internal endpoints
- Misconfigured service boundaries
- Credential sharing

The basic attack path may look like:

```text
Attacker
   ↓
Unauthorized Access
   ↓
Model Endpoint
   ↓
Inference
   ↓
Resource / Data / Capability Abuse
```

Controls may include:

- Authentication
- Authorization
- Short-lived credentials
- Rate limits
- Usage quotas
- Network restrictions
- Request validation
- Usage monitoring

These controls complement the identity and access controls covered in File 01.

---

# 8. Model Endpoint Abuse Is More Than Unauthorized Access

A caller can be legitimately authenticated and still abuse the model.

For example:

```text
Authenticated User
       ↓
Excessive Requests
       ↓
High Compute Consumption
       ↓
Service Degradation
       +
Unexpected Cost
```

Therefore:

```text
Authentication
      ≠
Authorized Usage
      ≠
Safe Usage
```

Production AI security must consider not only **who** can call the model but also **how** the capability is being used.

---

# 9. Resource Exhaustion

AI inference can consume substantial resources.

Depending on the workload, resources may include:

- CPU
- GPU
- Memory
- Network bandwidth
- Storage
- Model runtime capacity
- External API quotas

An attacker may intentionally generate expensive requests.

The attack pattern is:

```text
Attacker
   ↓
Expensive Request
   ↓
High Resource Consumption
   ↓
Capacity Pressure
   ↓
Latency / Availability / Cost Impact
```

This is an AI-specific amplification of a broader resource-exhaustion problem.

---

# 10. Denial-of-Service vs Denial-of-Wallet

Resource abuse can have different primary impacts.

### Denial-of-Service

The primary objective is to reduce availability.

```text
Excessive Requests
      ↓
Resource Saturation
      ↓
Service Degradation
```

### Denial-of-Wallet

The primary objective is to cause unexpected financial consumption.

```text
Excessive / Expensive AI Requests
          ↓
High Inference Usage
          ↓
Unexpected Cost
```

The two may occur simultaneously.

An attacker can therefore attack:

```text
Availability
    +
Cost
```

rather than availability alone.

---

# 11. Why AI Makes Cost Abuse More Significant

AI requests can have highly variable cost.

For example:

```text
Simple Request
   ↓
Low Token / Compute Usage

Complex Request
   ↓
High Token / Compute Usage

Repeated Complex Requests
   ↓
Very High Aggregate Cost
```

A system may therefore be vulnerable even when request volume appears moderate.

Security controls should consider both:

- Request count
- Request cost / resource intensity

This is why simple request-per-minute limits may be insufficient for some AI systems.

---

# 12. Cost-Aware Protection

Protection against resource and cost abuse may include:

```text
Authentication
      ↓
Authorization
      ↓
Rate Limiting
      ↓
Concurrency Limits
      ↓
Token / Input Limits
      ↓
Compute / Usage Quotas
      ↓
Cost Monitoring
      ↓
Abuse Detection
```

Different controls address different dimensions.

For example:

- Rate limiting controls frequency.
- Concurrency limits control simultaneous work.
- Input limits control request size.
- Quotas control aggregate consumption.
- Cost controls limit financial exposure.

No individual control is sufficient for every AI workload.

---

# 13. Rate Limiting

Rate limiting restricts how frequently a caller can make requests.

A simple model is:

```text
Caller
   ↓
Request Count
   ↓
Rate Limit
   ↓
Allow / Reject / Delay
```

Rate limiting can reduce:

- Automated abuse
- Brute-force-style querying
- Excessive inference
- Resource spikes

However:

> **Rate limiting reduces abuse; it does not eliminate abuse.**

An attacker may distribute requests across multiple identities, networks, or accounts.

Rate limits therefore work best as one layer of defense.

---

# 14. Concurrency and Queue Controls

AI workloads may become expensive when many requests execute simultaneously.

For example:

```text
100 Requests
      ↓
100 Concurrent Inferences
      ↓
GPU Saturation
      ↓
Latency Explosion
```

Concurrency limits can instead enforce:

```text
100 Requests
      ↓
Controlled Concurrent Execution
      ↓
Queue / Reject / Prioritize
```

This protects scarce resources.

The exact mechanism depends on the system architecture.

The security principle is:

> **Control not only how many requests arrive, but how much work can execute simultaneously.**

---

# 15. Input Amplification

An attacker may deliberately provide unusually large or expensive inputs.

Examples include:

- Extremely large prompts
- Large documents
- Repeated context
- Large structured payloads
- High-cost multimodal inputs

The resulting processing cost may be disproportionate to the attacker's effort.

Conceptually:

```text
Small Attacker Effort
        ↓
Large AI Processing Cost
        ↓
Resource / Cost Impact
```

This creates an amplification attack.

Input limits are therefore a security control, not merely a usability constraint.

---

# 16. Sensitive Information Exposure

AI systems may process sensitive information such as:

- Personal information
- Authentication material
- Internal business data
- Confidential documents
- Proprietary source code
- Customer information
- Security-sensitive configuration

Exposure can occur through multiple paths.

```text
Sensitive Data
      ↓
AI Application
      ↓
Model / Context
      ↓
Generated Output
      ↓
Unauthorized Recipient
```

The security objective is:

> **Ensure sensitive information does not cross an authorization boundary unintentionally.**

---

# 17. Data Exfiltration Through AI Interfaces

An attacker may attempt to cause the system to reveal information that should remain inaccessible.

Potential targets include:

- Hidden application data
- Internal documents
- User records
- System instructions
- Configuration
- Sensitive context
- Other users' information

The attack may exploit:

- Weak authorization
- Excessive context
- Poor data isolation
- Prompt manipulation
- Unsafe retrieval behavior
- Insecure integrations

The key point is:

> **The model should not become an alternative path around the application's existing authorization boundaries.**

---

## 18. Authorization Must Survive the AI Boundary

Consider:

```text
User A
   ↓
AI Application
   ↓
Retrieval / Data Access
   ↓
User A's Authorized Data
```

A vulnerable design may instead allow:

```text
User A
   ↓
AI Application
   ↓
Broad Data Access
   ↓
User A Requests User B's Data
   ↓
Unauthorized Disclosure
```

The AI model does not eliminate the need for data authorization.

A production system must ensure that:

> **Data access permissions remain enforced even when natural-language requests are used to interact with the system.**

---

# 19. Sensitive Information Exposure Through Model Output

A model may generate content that contains information present in its current context, available through connected systems, or reflected in learned model behavior.

Potential security risks include:

- Reproduction of sensitive context
- Accidental disclosure
- Overly detailed responses
- Cross-user information leakage
- Exposure of confidential application state

Controls may include:

- Data minimization
- Context isolation
- Authorization checks
- Output validation
- Sensitive-data detection
- Access-aware retrieval
- Response filtering

However:

> **Output filtering should not be treated as a replacement for correct authorization and data isolation.**

---

## 20. Data Minimization

One of the strongest controls against data exposure is to avoid providing unnecessary sensitive data to the AI system.

A useful principle is:

```text
Required Data
      ↓
Minimum Necessary Context
      ↓
AI Processing
```

rather than:

```text
Entire Dataset
      ↓
AI Processing
```

Data minimization reduces the amount of information that could potentially be exposed.

It also reduces:

- Privacy exposure
- Attack impact
- Accidental disclosure
- Security investigation scope

---

# 21. Model Extraction

A model may represent significant intellectual property.

An attacker may attempt to infer model behavior by issuing many queries and analyzing responses.

A simplified attack is:

```text
Attacker
   ↓
Repeated Queries
   ↓
Model Responses
   ↓
Behavioral Analysis
   ↓
Approximation of Model Behavior
```

This is commonly referred to as **model extraction** or model stealing.

The attack does not necessarily require direct access to model weights.

Instead, the attacker may exploit inference access itself.

---

# 22. Model Theft

Model theft is different from model extraction.

### Model theft

The attacker obtains the actual model artifact or parameters.

```text
Unauthorized Access
      ↓
Model Artifact
      ↓
Model Theft
```

### Model extraction

The attacker approximates model behavior through inference.

```text
Inference Access
      ↓
Repeated Queries
      ↓
Behavioral Reconstruction
```

The controls differ because the attack paths differ.

---

# 23. Protecting Model Artifacts

Model artifacts should be treated as sensitive production assets when their confidentiality or intellectual-property value requires protection.

Controls may include:

- Access control
- Artifact authorization
- Encryption at rest
- Encryption in transit
- Restricted storage
- Network isolation
- Controlled model distribution
- Short-lived access
- Runtime restrictions

The important distinction is:

```text
Model Artifact Protection
        ≠
Inference Endpoint Protection
```

Both may be required.

---

# 24. Protecting Against Model Extraction

Model extraction is harder to eliminate because inference itself reveals information about model behavior.

Potential controls include:

```text
Authentication
      ↓
Authorization
      ↓
Rate Limiting
      ↓
Query / Usage Limits
      ↓
Abuse Detection
      ↓
Output Restrictions
      ↓
Monitoring / Investigation
```

Controls may reduce extraction efficiency.

However:

> **A public inference interface can never reveal zero information about model behavior.**

This creates a fundamental trade-off between:

- Model utility
- Model exposure
- Security
- Accessibility

---

# 25. Prompt Injection

Prompt injection occurs when untrusted content influences the behavior of an AI model in ways that conflict with the intended application behavior.

A simplified model is:

```text
Trusted Application Instruction
            +
Untrusted Input
            ↓
       Model Context
            ↓
     Unexpected Behavior
```

The important security issue is not simply that the input contains unusual text.

It is that the model may interpret untrusted content as an instruction.

---

# 26. Prompt Injection as a Production Security Concern

Prompt injection becomes a production security problem when model behavior can affect protected resources, sensitive information, or application decisions.

For example:

```text
Attacker-Controlled Content
          ↓
AI Model
          ↓
Unexpected Instruction Following
          ↓
Sensitive Data Exposure
```

The impact depends on what capabilities surround the model.

A model producing an incorrect answer is primarily a quality problem.

A model causing sensitive information to cross a security boundary is a security problem.

Therefore:

> **Prompt injection becomes security-critical when model behavior can cross a protected trust boundary.**

---

# 27. Prompt Injection Is Not Solved by Input Filtering Alone

A common assumption is:

```text
Detect Malicious Prompt
        ↓
Reject Prompt
        ↓
Problem Solved
```

This is too simplistic.

Attackers can vary wording, structure, encoding, context, and content.

Therefore:

```text
Input Filtering
      +
Context Isolation
      +
Authorization
      +
Output Controls
      +
Capability Restrictions
      +
Runtime Boundaries
```

provide stronger defense.

The production principle is:

> **Prompt filtering is one control, not a complete prompt-injection defense.**

---

# 28. Untrusted Content and Instruction Boundaries

AI applications often combine trusted instructions with untrusted content.

For example:

```text
Trusted Application Instructions
            +
Retrieved Document
            +
User Input
            ↓
        Model Context
```

The system should reason explicitly about which information is:

- Trusted instruction
- User-controlled input
- External content
- Retrieved data
- Model-generated content

Security boundaries become difficult when these categories are mixed.

A useful design principle is:

> **Do not assume that because content entered the model context, it should be treated as an instruction.**

---

# 29. Prompt Injection Through External Content

Prompt injection does not have to originate from the direct user.

Untrusted content may come from:

- Documents
- Web pages
- Emails
- Database records
- User profiles
- External APIs
- Retrieved knowledge

For example:

```text
External Document
       ↓
Retrieved by Application
       ↓
Inserted into AI Context
       ↓
Model Interprets Content
       ↓
Unexpected Behavior
```

This makes external content a potential security boundary.

The system must therefore treat content trust independently from content relevance.

---

# 30. Insecure AI Integrations

AI systems often connect to external capabilities.

Examples include:

- Databases
- APIs
- Search systems
- File stores
- Business applications
- External AI providers

An insecure integration may create a path from model behavior to a protected system.

For example:

```text
User
 ↓
AI Model
 ↓
Integration
 ↓
Sensitive System
```

The security concern is:

> **Can untrusted model input or output cause an external integration to perform an action that the caller should not be able to perform?**

---

# 31. AI Output as Untrusted Data

Model output should generally be treated as untrusted unless the consuming system has independently validated it.

For example:

```text
AI Output
    ↓
Application Parser
    ↓
Business Action
```

is potentially dangerous if the application assumes the output is safe.

A safer pattern is:

```text
AI Output
    ↓
Schema Validation
    ↓
Policy Validation
    ↓
Authorization
    ↓
Controlled Action
```

This is particularly important when AI output is interpreted as:

- SQL
- Commands
- URLs
- Configuration
- Structured actions
- File paths
- API parameters

---

# 32. Output Validation

Output validation should answer:

- Is the output structurally valid?
- Is it within expected bounds?
- Does it satisfy business rules?
- Does it contain prohibited content?
- Is the requested action authorized?
- Can the output safely cross the next trust boundary?

A valid schema does not automatically mean a safe action.

For example:

```text
Valid JSON
      ≠
Authorized Action
```

and:

```text
Valid Command
      ≠
Safe Command
```

---

# 33. AI-Assisted Data Exfiltration

AI capabilities can make data exfiltration easier when the model has broad access to information.

An attacker may attempt to cause the system to:

```text
Find Sensitive Data
       ↓
Transform / Summarize It
       ↓
Return It to Attacker
```

The model may make the attack more flexible because natural language can be used to request transformations.

However, the underlying security failure is often excessive data access.

Therefore:

> **AI can amplify data-exfiltration risk, but authorization and data isolation remain foundational controls.**

---

# 34. Cross-Tenant and Cross-User Data Leakage

Multi-user AI systems must maintain strict data boundaries.

A dangerous architecture may allow:

```text
User A
   ↓
Shared Context
   ↓
User B Data
```

Potential causes include:

- Incorrect context construction
- Shared caches
- Incorrect retrieval filters
- Poor session isolation
- Shared prompt state
- Incorrect authorization

The security principle is:

> **AI context must preserve the same tenant and user isolation required by the underlying application.**

---

# 35. AI-Specific Data Poisoning

Data used by AI systems can influence model behavior.

Potential sources include:

- Training data
- Fine-tuning data
- Retrieval data
- Knowledge bases
- Evaluation datasets
- Feedback data

An attacker may attempt to insert malicious or misleading content.

Conceptually:

```text
Attacker-Controlled Data
          ↓
Trusted Data Pipeline
          ↓
AI System
          ↓
Changed Behavior
```

The impact depends on where the poisoned data is used.

Two important categories should be distinguished:

```text
Training / Fine-Tuning Data Poisoning
        ↓
Primarily a data / model supply-chain concern

Retrieval / Runtime Data Poisoning
        ↓
Primarily a production AI application threat
```

This chapter focuses on the security impact of poisoned or attacker-controlled data **on a running AI capability**.

The security of the artifact and supply-chain processes through which model or data components enter production is covered in File 02.

For retrieval-based systems, the runtime concern is that attacker-controlled content can become trusted-looking context and influence downstream model behavior.

---

# 36. Retrieval Data Poisoning

For retrieval-based systems, attackers may attempt to insert content designed to influence downstream AI behavior.

For example:

```text
Untrusted Document
       ↓
Indexed
       ↓
Retrieved
       ↓
Inserted into Context
       ↓
Model Behavior Influenced
```

The threat becomes more serious when retrieved content is treated as authoritative instructions.

Controls may include:

- Source trust assessment
- Content validation
- Access control
- Provenance tracking
- Retrieval filtering
- Content isolation
- Output validation

The exact controls depend on the retrieval architecture.

The production security question is:

> **Can attacker-controlled content enter the retrieval path and influence a security-sensitive model decision or output?**

---

# 37. AI/ML Supply-Chain Threats vs AI-Specific Runtime Threats

These categories should be distinguished.

### Supply-chain threat

Compromise occurs before or during artifact acquisition and execution.

```text
Malicious Model
      ↓
Production Runtime
```

### Runtime AI threat

The production AI capability is abused after deployment.

```text
Trusted Model
      ↓
Attacker Abuse
      ↓
Production Impact
```

The controls overlap in places, but the attack paths differ.

This distinction connects File 02 with this chapter without duplicating it.

---

# 38. Sensitive Prompt and Context Exposure

AI applications may construct contexts containing information that the user did not explicitly provide.

For example:

```text
User Query
    +
Retrieved Data
    +
Application Metadata
    +
Conversation Context
    ↓
Model Context
```

The final context may contain more sensitive information than the original user request.

Security review should therefore examine:

> **What information can enter the model context, and who is authorized to receive any resulting output?**

Context construction is a security boundary.

---

# 39. Excessive Context

Providing more context than necessary can increase exposure.

For example:

```text
Required Context
      ↓
Small Security Exposure
```

versus:

```text
Entire Customer Record
      ↓
Model Context
      ↓
Large Security Exposure
```

Excessive context can increase the impact of:

- Prompt injection
- Data leakage
- Accidental disclosure
- Cross-user exposure

Therefore:

> **Context minimization is an AI-specific application of least-data principles.**

---

# 40. AI Endpoint Enumeration and Capability Discovery

Attackers may investigate an AI service to understand:

- Available models
- Supported operations
- Input limits
- Output behavior
- Rate limits
- Error behavior
- Capability boundaries

This information can help attackers optimize later abuse.

Security controls may include:

- Appropriate authentication
- Controlled error responses
- Rate limiting
- API surface minimization
- Abuse detection

However, some capability information must remain available for legitimate clients.

This creates a usability-versus-information-exposure trade-off.

---

## 41. Model Abuse Through Repeated Queries

Repeated querying can support several attack objectives simultaneously:

```text
Repeated Queries
      ├── Resource Exhaustion
      ├── Cost Abuse
      ├── Model Extraction
      ├── Capability Discovery
      └── Information Inference
```

This demonstrates why a single security signal may be insufficient.

A request that appears harmless individually may become suspicious when considered as part of a sequence.

Production AI security therefore benefits from reasoning about:

- Request frequency
- Request patterns
- Resource consumption
- Identity
- Historical behavior

---

# 42. AI Abuse Detection

AI abuse detection attempts to identify behavior that is inconsistent with intended usage.

Potential signals include:

- Unusual request volume
- Repeated expensive requests
- Abnormal input sizes
- Repeated probing patterns
- Unexpected geographic or identity changes
- Unusual model selection
- Suspicious output requests
- Repeated attempts to bypass restrictions

A conceptual model is:

```text
Request
   ↓
Identity + Context
   ↓
Behavioral Signals
   ↓
Risk Assessment
   ↓
Allow / Limit / Block / Investigate
```

These are security detection purposes rather than a replacement for the broader observability architecture defined in PROD-05.

---

# 43. Prevention, Detection, Containment, and Response

Production security should not rely only on prevention.

A useful layered model is:

```text
Threat
  ↓
Prevention
  ↓
Detection
  ↓
Containment
  ↓
Response
```

### Prevention

Attempt to stop the attack.

Examples:

- Authentication
- Authorization
- Input limits
- Rate limits
- Isolation

### Detection

Identify suspicious activity.

Examples:

- Abuse signals
- Security events
- Anomaly detection
- Access patterns

### Containment

Limit damage.

Examples:

- Disable a credential
- Restrict an endpoint
- Reduce model capability
- Isolate a workload
- Apply emergency quotas

### Response

Investigate and recover.

Examples:

- Analyze attack activity
- Rotate credentials
- Remove malicious data
- Replace compromised artifacts
- Restore trusted configuration

This chapter defines the **security purpose** of these detection and response layers. PROD-05 owns the broader observability and telemetry architecture used to collect, route, store, and operate those signals.

The exact operational implementation depends on the surrounding production platform.

---

# 44. Security Control Mapping

A useful threat-to-control mapping is:

| Threat | Primary Controls |
|---|---|
| Unauthorized inference | Authentication, authorization, network restrictions |
| Excessive inference | Rate limits, quotas, concurrency controls |
| Denial-of-wallet | Usage limits, cost controls, anomaly detection |
| Resource exhaustion | Concurrency limits, request limits, capacity controls |
| Sensitive information exposure | Data minimization, authorization, context isolation |
| Data exfiltration | Access control, retrieval filtering, output validation |
| Model extraction | Rate limits, abuse detection, query controls |
| Model theft | Artifact access control, encryption, restricted distribution |
| Prompt injection | Input controls, context isolation, authorization, output controls |
| Untrusted output | Validation, policy checks, controlled execution |
| Retrieval poisoning | Source controls, provenance, content validation |
| Cross-user leakage | Tenant isolation, authorization, context isolation |
| Insecure integration | Explicit authorization, validation, capability restrictions |
| AI capability abuse | Usage controls, policy enforcement, abuse detection |

The important engineering skill is to understand **why** each control applies.

---

## 45. Controls Are Not Equivalent

Several common security mistakes come from assuming one control solves an entire threat.

For example:

```text
Rate Limiting
      ≠
Complete Abuse Prevention
```

```text
Prompt Filtering
      ≠
Complete Prompt-Injection Prevention
```

```text
Output Filtering
      ≠
Correct Authorization
```

```text
Encryption
      ≠
Protection Against Compromised Credentials
```

```text
Authentication
      ≠
Safe AI Usage
```

```text
Model Access Control
      ≠
Protection Against Model Extraction
```

Security controls should therefore be evaluated according to the specific property they provide.

---

# 46. Defense in Depth for AI Systems

A mature AI security architecture may look like:

```text
                    External Request
                          ↓
                 Authentication
                          ↓
                  Authorization
                          ↓
                 Request Controls
                          ↓
                Input / Context Controls
                          ↓
                  AI Capability
                          ↓
                 Output Validation
                          ↓
                Action Authorization
                          ↓
                  External System
```

Supporting controls surround the path:

```text
             ┌─────────────────────────┐
             │ Abuse Detection          │
             │ Rate / Cost Controls     │
             │ Isolation                │
             │ Security Signals         │
             │ Incident Response        │
             └─────────────────────────┘
```

The goal is not to make one layer perfect.

The goal is to prevent one compromised layer from automatically becoming complete system compromise.

---

# 47. AI Security Trade-offs

AI-specific security controls introduce important trade-offs.

## Strict Input Filtering

**Benefit**

- Reduces some classes of malicious input.

**Trade-off**

- Can reject legitimate requests.
- Attackers may adapt their inputs.
- Detection logic can be bypassed.

---

## Aggressive Rate Limiting

**Benefit**

- Reduces abuse and extraction attempts.

**Trade-off**

- Can restrict legitimate high-volume workloads.
- Requires identity and workload-aware policies.

---

## Strong Output Filtering

**Benefit**

- Reduces some classes of information exposure and unsafe output.

**Trade-off**

- May reduce useful responses.
- Filtering can miss novel or context-dependent problems.

---

## Context Minimization

**Benefit**

- Reduces sensitive information exposure.

**Trade-off**

- Less context can reduce model quality.

---

## Model Isolation

**Benefit**

- Reduces blast radius.

**Trade-off**

- Increases infrastructure and operational complexity.

---

## Capability Restrictions

**Benefit**

- Limits the impact of model misuse.

**Trade-off**

- May reduce application functionality.

---

## 48. Residual Risk

AI security controls cannot eliminate all risk.

For example:

```text
Prompt Filtering
      ↓
Novel Prompt Injection
      ↓
Residual Risk
```

Or:

```text
Rate Limiting
      ↓
Distributed Abuse
      ↓
Residual Risk
```

Or:

```text
Output Validation
      ↓
Previously Unknown Dangerous Pattern
      ↓
Residual Risk
```

Or:

```text
Access Control
      ↓
Authorized User Misuse
      ↓
Residual Risk
```

Security engineering therefore requires understanding what each control cannot guarantee.

---

# 49. Production AI Security Review Framework

A production review should ask:

### Model Endpoint

- Who can invoke the model?
- What models can they invoke?
- What usage limits apply?
- What resources can each request consume?

### Data

- What sensitive information can enter the AI system?
- What information can enter model context?
- Are tenant and user boundaries preserved?
- Can model output reveal protected information?

### Prompt and Context

- Which inputs are trusted?
- Which inputs are untrusted?
- Can external content influence model behavior?
- What happens if untrusted content contains instructions?

### Output

- Is model output treated as untrusted?
- Is output validated?
- Can output trigger sensitive operations?
- Is authorization checked independently of the model?

### Model Protection

- How are model artifacts protected?
- Can unauthorized users access model weights?
- Can repeated inference enable extraction?
- Are high-volume queries controlled?

### Resource and Cost

- Are request sizes limited?
- Are concurrency limits enforced?
- Are usage quotas defined?
- Can one caller create disproportionate cost?

### Integrations

- What external systems can the AI capability interact with?
- Can model behavior influence those integrations?
- Are actions independently authorized?
- Are integration inputs and outputs validated?

### Detection and Response

- Can suspicious AI usage be identified?
- Can abusive access be restricted?
- Can compromised credentials be revoked?
- Can affected artifacts or data sources be isolated?

---

## 50. Threat-to-Control Reasoning Example

Consider an AI support system that can retrieve customer information.

### Asset

Customer data.

### Entry Point

Authenticated AI API.

### Threat

Attacker attempts to retrieve another customer's information through crafted natural-language requests.

### Impact

Sensitive information disclosure.

### Security Controls

```text
Authentication
      ↓
Authorization
      ↓
Tenant / User Data Isolation
      ↓
Access-Aware Retrieval
      ↓
Context Minimization
      ↓
Output Validation
```

### Residual Risk

Potential leakage through implementation defects, unexpected model behavior, or future vulnerabilities.

The important engineering lesson is:

> **The model should not be trusted to enforce the application's authorization policy by itself.**

Authorization must be enforced by security boundaries outside the model's probabilistic behavior.

---

# 51. Threat-to-Control Reasoning Example: Denial-of-Wallet

### Asset

AI compute or external model API budget.

### Entry Point

Public inference endpoint.

### Threat

Automated high-cost requests.

### Impact

Unexpected financial consumption and possible service degradation.

### Security Controls

```text
Authentication
      ↓
Per-Identity Rate Limits
      ↓
Input / Token Limits
      ↓
Concurrency Controls
      ↓
Usage Quotas
      ↓
Cost / Abuse Detection
```

### Residual Risk

Distributed attackers, legitimate high-cost workloads, and unexpected usage patterns may still create exposure.

The key engineering insight is:

> **Cost is a security resource when an attacker can consume it.**

---

# 52. Threat-to-Control Reasoning Example: Model Extraction

### Asset

Model intellectual property.

### Entry Point

Inference API.

### Threat

Repeated queries designed to infer model behavior.

### Impact

Loss of model value or competitive advantage.

### Security Controls

```text
Authentication
      ↓
Usage Controls
      ↓
Rate Limits
      ↓
Query Pattern Detection
      ↓
Abuse Investigation
```

Additional protection may be appropriate depending on the model and business value.

### Residual Risk

Inference necessarily exposes some information about model behavior.

Therefore:

> **Model extraction is a risk-management problem rather than a threat that can always be reduced to zero.**

---

# 53. Threat-to-Control Reasoning Example: Prompt Injection

### Asset

Protected application capability or sensitive information.

### Entry Point

User input or external content.

### Threat

Untrusted content attempts to influence model behavior.

### Impact

Potential data disclosure, unsafe processing, or unauthorized downstream behavior.

### Security Controls

```text
Input / Content Classification
          ↓
Context Separation
          ↓
Authorization
          ↓
Capability Restrictions
          ↓
Output Validation
          ↓
Action Validation
```

### Residual Risk

Prompt injection cannot always be perfectly detected because language and context are flexible.

Therefore:

> **Security should not depend on perfectly recognizing malicious prompts.**

The system should remain protected even when the model encounters adversarial input.

---

# 54. Security Architecture Principle: Do Not Put the Model in Charge of Its Own Security Boundary

A model can interpret instructions.

It should not be assumed to be the final authority for:

- Authentication
- Authorization
- Access control
- Secret protection
- Privilege enforcement
- Resource quotas
- Security policy

A safer architecture is:

```text
Security Boundary
       ↓
Policy Enforcement
       ↓
AI Capability
       ↓
Untrusted Output
       ↓
Security Boundary
```

The model operates inside security controls rather than replacing them.

This principle is especially important when AI outputs can influence protected systems.

---

# 55. Security Architecture Principle: Minimize Capability

The impact of an AI compromise depends heavily on what the AI system can access.

Consider:

```text
AI Service A
   ↓
Read-Only Knowledge
```

versus:

```text
AI Service B
   ↓
Read / Write Customer Database
   ↓
Payment System
   ↓
Administrative APIs
```

The second system has a much larger blast radius.

Therefore:

> **AI capabilities should be limited to the minimum functionality required by the application.**

This is the AI-specific application of least privilege.

---

# 56. Security Architecture Principle: Assume Model Behavior Can Be Manipulated

Production AI security should not rely on the assumption:

> “The model will always follow the intended instructions.”

A more resilient assumption is:

> **The model may produce unexpected or attacker-influenced behavior, so security boundaries must remain effective even when model behavior is manipulated.**

This changes the architecture.

Instead of:

```text
Model
  ↓
Trusted Action
```

prefer:

```text
Model Output
     ↓
Validation
     ↓
Authorization
     ↓
Policy Enforcement
     ↓
Controlled Action
```

This is a fundamental production AI security principle.

---

# 57. Common AI-Security Failures

## 57.1 Treating the Model as a Security Boundary

A model may be instructed not to reveal data.

That instruction is not equivalent to authorization enforcement.

---

## 57.2 Relying Only on Prompt Filtering

Prompt filtering can miss novel or context-dependent attacks.

---

## 57.3 Giving the Model Broad Data Access

Excessive data access increases the potential impact of prompt injection and other abuse.

---

## 57.4 Treating Model Output as Trusted

Generated output can be incorrect, manipulated, or unsafe.

---

## 57.5 Using Only Request Count for Cost Protection

Two requests can have dramatically different resource costs.

---

## 57.6 Assuming Authentication Prevents Abuse

A legitimate identity can still be compromised or misused.

---

## 57.7 Ignoring Model Extraction

Public inference access can expose model behavior even when model weights are protected.

---

## 57.8 Allowing AI to Directly Control Sensitive Systems

A model should not automatically receive authority merely because it can produce a syntactically valid action.

---

## 58. Production Security Checklist

Before exposing an AI capability to production users, verify:

### Model Access

- [ ] Model endpoints require appropriate authentication.
- [ ] Authorization determines which capabilities each caller can use.
- [ ] Model artifacts are protected according to their sensitivity.
- [ ] Inference access is controlled.

### Abuse Protection

- [ ] Rate limits are defined.
- [ ] Concurrency limits are defined.
- [ ] Request size or token limits are defined.
- [ ] Usage quotas are defined where appropriate.
- [ ] Cost exposure is understood.
- [ ] Abuse detection exists for high-risk workloads.

### Data Protection

- [ ] Sensitive data entering the AI system is identified.
- [ ] Context is minimized.
- [ ] Tenant and user isolation is preserved.
- [ ] Retrieval respects authorization.
- [ ] AI output cannot bypass existing data-access controls.

### Prompt and Content Security

- [ ] Trusted and untrusted content are distinguished.
- [ ] External content is treated as potentially untrusted.
- [ ] Prompt injection is considered in threat modeling.
- [ ] Security does not depend solely on prompt filtering.

### Output Security

- [ ] AI output is treated as untrusted unless independently validated.
- [ ] Structured output is schema-validated.
- [ ] Sensitive actions require independent authorization.
- [ ] AI output cannot directly bypass security policy.

### Model Protection

- [ ] Model access is restricted.
- [ ] Model extraction risk is assessed.
- [ ] Model theft risk is assessed.
- [ ] Model artifact protection is appropriate to business value.
- [ ] Repeated-query abuse can be detected or limited.

### Integration Security

- [ ] External AI integrations are identified.
- [ ] Model-influenced actions are independently authorized.
- [ ] Integration inputs are validated.
- [ ] Integration outputs are validated.
- [ ] AI capability does not automatically imply privileged system access.

### Detection and Response

- [ ] AI abuse signals are identifiable.
- [ ] Suspicious usage can be investigated.
- [ ] Credentials can be revoked.
- [ ] AI capabilities can be restricted during an incident.
- [ ] Compromised data or artifacts can be isolated or replaced.

---

## 59. Final Security Mental Model

Production AI security can be summarized as:

```text
Identity
   ↓
Access Control
   ↓
Application Security
   ↓
Artifact / Dependency Trust
   ↓
AI Capability
   ↓
AI-Specific Attack Surface
   ↓
Security Controls
   ↓
Prevention
   ↓
Detection
   ↓
Containment
   ↓
Response
   ↓
Residual Risk
```

The important shift is from asking:

> “Is the model secure?”

to asking:

> **“What can an attacker do through this AI capability, what assets can be reached, what controls prevent or limit that abuse, and what risk remains?”**

That is the production security mindset.

---

# 60. Summary

Production AI systems inherit conventional application and infrastructure security risks while introducing additional threats associated with model behavior, inference access, AI-generated output, context construction, and AI-specific resource consumption.

The key concepts are:

1. **AI-specific security extends conventional security rather than replacing it.**
2. **The AI attack surface includes inputs, model capabilities, outputs, resources, data, and integrations.**
3. **A threat should be considered AI-specific or AI-amplified when AI materially changes its attack path, impact, or required security controls.**
4. **Model endpoint abuse can occur even when the caller is authenticated.**
5. **Unauthorized inference and authorized-but-abusive inference are different security problems.**
6. **AI workloads can amplify resource-exhaustion attacks because inference may be computationally expensive.**
7. **Denial-of-wallet is a production security concern when attackers can cause disproportionate AI spending.**
8. **Rate limits, concurrency controls, input limits, quotas, and cost controls address different forms of resource abuse.**
9. **Sensitive information exposure can occur through model context, retrieval, output, or insecure integrations.**
10. **AI systems must preserve existing authorization boundaries rather than allowing the model to become an alternative path to protected data.**
11. **Data minimization reduces the amount of sensitive information that can be exposed.**
12. **Model extraction attempts to reconstruct model behavior through inference; model theft targets the model artifact itself.**
13. **Model artifact protection and inference endpoint protection are different security concerns.**
14. **Prompt injection occurs when untrusted content influences model behavior in unintended ways.**
15. **Prompt injection becomes a security problem when model behavior can cross protected trust boundaries.**
16. **Prompt filtering alone does not provide complete prompt-injection protection.**
17. **External documents, retrieved content, and other untrusted sources can introduce prompt-injection risk.**
18. **AI-generated output should generally be treated as untrusted until independently validated.**
19. **Valid structured output does not automatically represent an authorized or safe action.**
20. **AI integrations should enforce authorization independently of model behavior.**
21. **Training and fine-tuning data poisoning is primarily a data/model supply-chain concern, while retrieval and runtime data poisoning are primarily production AI application threats.**
22. **AI systems should minimize context and capabilities to reduce blast radius.**
23. **Security controls should be evaluated according to the specific property they provide rather than treated as interchangeable.**
24. **Prevention, detection, containment, and response provide complementary layers of defense.**
25. **This chapter defines the security purpose of AI abuse detection; broader observability and telemetry architecture remains owned by PROD-05.**
26. **AI security controls always have limitations and therefore leave residual risk.**
27. **The model should operate inside security boundaries rather than being trusted as the authority for its own security.**
28. **The security objective is not to make model behavior perfectly predictable; it is to ensure unexpected or manipulated model behavior cannot automatically bypass critical security boundaries.**

The core production principle is:

> **Assume AI behavior can be manipulated, treat AI outputs and external content as potentially untrusted, minimize the capabilities and data exposed to the model, enforce authorization outside the model, control inference resources, detect abuse, and design the surrounding system so that a compromised AI capability cannot automatically become a compromised production system.**
