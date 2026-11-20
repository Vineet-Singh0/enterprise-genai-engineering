# Identity, Authorization and AI Access Boundaries

## Learning Objectives

By the end of this chapter, you should be able to:

- distinguish **identity**, **principal**, **authentication**, **authorization**, and **access**
- identify the different principals that may interact with enterprise AI systems
- reason about authorization using the model **who → what → which resource/capability → under which conditions**
- distinguish permissions, roles, attributes, policies, and authorization decisions
- explain why authorization to use an AI application does not automatically imply unrestricted authorization for every downstream AI capability or enterprise resource
- identify AI-specific access boundaries between users, AI applications, agents, enterprise capabilities, data, tools, and services
- apply least privilege and separation of duties to enterprise AI access decisions
- reason about delegated access and service-to-service access
- distinguish user-to-AI, AI-to-data, AI-to-tool, and service-to-service authorization concerns
- recognize tenant, organizational, and environment boundaries
- reason about context-dependent authorization
- identify privilege escalation and excessive-permission risks
- explain why access must be lifecycle-managed
- reason about authorization failure, revocation, and access review
- distinguish an authorization decision from the enforcement of that decision
- evaluate enterprise AI access scenarios without depending on a specific IAM vendor or implementation technology

---

## Prerequisites

Before studying this chapter, you should understand:

- the enterprise AI security, privacy, and access-governance foundation from **ENT-04 Lesson 01**
- the distinction between security and privacy
- the concepts of trust boundaries and information-flow boundaries
- least privilege as a security principle
- the basic idea that enterprise AI systems may interact with users, data, models, tools, and enterprise capabilities

You should also have a basic understanding of:

- applications and services
- users and service identities
- enterprise resources
- permissions and roles

Detailed production implementation of identity infrastructure, secrets, runtime security, or security tooling belongs to **PROD-09** rather than this chapter.

---

## Estimated Reading Time

**35–45 minutes**

---

## Before We Start

Enterprise AI changes the shape of access decisions.

In a traditional enterprise application, the access question may be relatively direct:

> “Can this employee read this document?”

An AI-enabled system can introduce several additional actors and boundaries:

```text
User
  ↓
AI Application
  ↓
Model
  ↓
Retrieval / Data
  ↓
Tool / Service
  ↓
External Provider
  ↓
Downstream System
```

The authorization problem is therefore no longer only about whether a human user can enter an application.

The enterprise must reason about:

- who or what the principal is
- what action is being requested
- which resource or capability is involved
- whose authority is being exercised
- under which conditions the action is allowed
- whether the AI system is acting with delegated authority
- whether downstream resources have independently authorized the AI system
- whether the requested access crosses organizational, tenant, environment, or data boundaries

This chapter focuses on that reasoning problem.

It does **not** teach a vendor-specific IAM implementation.

---

# Why This Exists

## The Access Problem Becomes More Complex with AI

Consider a simple enterprise assistant.

An employee asks:

> “Summarize the confidential sales report for my region.”

At first glance, the access question appears simple:

```text
Employee
   ↓
Sales Report
   ↓
Allow?
```

But the actual system may look more like:

```text
Employee
   ↓
AI Application
   ↓
Model
   ↓
Retrieval System
   ↓
Sales Data
   ↓
Response
```

The system may also involve:

```text
Employee
   ↓
AI Application
   ↓
Enterprise API
   ↓
CRM
```

or:

```text
Employee
   ↓
AI Application
   ↓
External Model Provider
```

Each boundary introduces a different access question.

The employee may be authorized to view the report.

That does **not automatically establish** that:

- every AI component may access the report
- every model provider may process the report
- every tool connected to the AI system may access the report
- every service identity may retrieve the report
- every downstream system may receive the generated output

The central question is therefore not simply whether the user has access.

It is whether the **effective authority exercised across the AI path remains within the enterprise's intended authorization and privacy boundaries**.

---

# Mental Model

The core authorization model is:

```text
WHO
↓
WANTS TO DO WHAT
↓
TO WHICH RESOURCE / CAPABILITY
↓
UNDER WHICH CONDITIONS
↓
IS ACCESS ALLOWED?
```

A more complete representation is:

```text
Principal
   ↓
Requested Action
   ↓
Target Resource / Capability
   ↓
Context and Conditions
   ↓
Authorization Policy
   ↓
Authorization Decision
   ↓
Allow / Deny / Constrain
   ↓
Enforced Boundary
```

For AI systems, the principal may not always be a human.

It may be:

- a user
- an application
- a service
- a workload
- an AI application
- an agent
- a delegated principal or delegated execution context

The target may not always be a document.

It may be:

- data
- an API
- a tool
- a model
- an enterprise capability
- a service
- another AI system
- a sensitive operation

The important engineering question is therefore not:

> “Does this user have access?”

It is:

> **“Which principal is requesting which action against which resource or capability, under which conditions, and whose authority permits it?”**

---

# Core Concepts

## 1. Identity

An **identity** represents who or what a principal is within an enterprise context.

Examples include:

- employee
- customer
- administrator
- application
- service
- workload
- AI application
- agent

Identity answers:

> **Who or what is this?**

It does not answer what that entity is allowed to do.

For example:

```text
Identity:
Employee-123
```

does not by itself imply:

```text
Permission:
Read-All-Enterprise-Data
```

Identity is one input into authorization.

---

## 2. Principal

A **principal** is an entity that can request access or perform an action.

In enterprise AI systems, principals may include:

| Principal | Example |
|---|---|
| User | Employee using an AI assistant |
| Application | AI-powered business application |
| Service | Retrieval service |
| Workload | Background processing workload |
| Agent | AI system acting on behalf of a user |
| External system | Partner application |
| Provider service | External model service |

A useful distinction is:

```text
Identity
   ↓
Represents who or what the entity is
   ↓
Principal
   ↓
Entity participating in an access decision
```

A user and an AI application may participate in the same request without being the same principal.

Likewise, an AI application may act in a user's delegated context without becoming identical to the user.

---

## 3. Authentication

Authentication answers:

> **How is the claimed identity verified?**

Conceptually:

```text
Claimed Identity
       ↓
Authentication
       ↓
Verified / Established Principal Context
```

Authentication may involve mechanisms such as:

- credentials
- cryptographic credentials
- tokens
- certificates
- federated identity
- other enterprise authentication mechanisms

The specific mechanism is not the focus of this chapter.

The important distinction is:

> Authentication establishes confidence about identity. It does not determine what the identity is allowed to do.

---

## 4. Authorization

Authorization answers:

> **What is this principal allowed to do?**

Conceptually:

```text
Verified Principal Context
        ↓
Requested Action
        ↓
Target Resource
        ↓
Applicable Conditions
        ↓
Authorization Decision
```

Possible outcomes include:

- allow
- deny
- allow under constraints
- require additional conditions
- require delegated approval
- restrict the scope of the operation

Authorization therefore sits between identity and actual access.

---

## 5. Authorization Decision vs Enforcement

These concepts should also remain distinct.

An **authorization decision** determines whether an action is permitted.

**Enforcement** ensures that the decision actually constrains the requested action.

Conceptually:

```text
Request
   ↓
Authorization Decision
   ↓
Allow / Deny / Constrain
   ↓
Enforcement Boundary
   ↓
Actual Access
```

For example:

```text
Authorization:
"User may read Document A"

Enforcement:
The system prevents the user or downstream AI path
from reading Document B.
```

A correct policy is therefore not sufficient if the system does not reliably enforce the resulting boundary.

Detailed implementation of enforcement mechanisms belongs to the appropriate production engineering topics, particularly **PROD-09**.

---

## 6. Access

Access is the ability to interact with a resource or capability in a particular way.

Examples:

- read a document
- write a record
- invoke an API
- retrieve customer information
- execute a business operation
- invoke a model
- use a tool
- export information

Access is therefore action-specific.

A principal may be allowed to:

```text
Read → Yes
Write → No
Delete → No
Export → No
```

This is why saying:

> “The user has access”

is often too vague for engineering decisions.

The useful question is:

> **Access to what, for which action, under which conditions?**

---

# Identity, Authentication and Authorization Are Different

These concepts should not be collapsed into one idea.

```text
Identity
↓
Who or what is the principal?

Authentication
↓
How is the claimed identity established or verified?

Authorization
↓
What is that principal allowed to do?

Enforcement
↓
How is that decision actually constrained in the system?
```

For example:

> Alice is an employee.

That describes identity.

> Alice successfully authenticated using the enterprise identity system.

That describes authentication.

> Alice is allowed to read finance reports for her business unit.

That describes authorization.

> The application prevents Alice from retrieving reports outside that scope.

That describes enforcement.

These are different engineering decisions.

---

# Authorization Semantics

The fundamental authorization question is:

> **WHO may access WHAT under WHICH CONDITIONS?**

A useful authorization model is:

```text
Principal
    +
Action
    +
Resource
    +
Context
    ↓
Authorization Policy
    ↓
Decision
```

Consider:

```text
Principal:
Finance Manager

Action:
Read

Resource:
Quarterly Financial Report

Context:
Own Business Unit

Decision:
Allow
```

The same principal might receive a different decision for another resource:

```text
Principal:
Finance Manager

Action:
Read

Resource:
Executive Compensation Data

Context:
Same Business Unit

Decision:
Deny
```

Identity alone did not determine the result.

The complete authorization context mattered.

---

# What Can Influence an Authorization Decision?

Authorization decisions may depend on several dimensions.

## Identity

Who is requesting access?

Examples:

- employee
- administrator
- application
- service
- agent

---

## Role

What organizational or functional role does the principal hold?

Examples:

- analyst
- manager
- finance administrator
- security administrator

Roles can simplify authorization but should not be treated as universally sufficient.

---

## Attributes

What properties describe the principal, resource, or request?

Examples:

- department
- geography
- employment status
- data classification
- resource owner
- application type

---

## Resource

What is being accessed?

Examples:

- document
- database
- API
- model
- enterprise capability
- customer record

---

## Action

What is the principal trying to do?

Examples:

- read
- write
- delete
- execute
- export
- invoke
- administer

---

## Purpose

Why is the access being requested?

Purpose can matter when the same information may be appropriate for one business function but inappropriate for another.

For example:

```text
Customer Information

Purpose A:
Customer support
→ potentially allowed

Purpose B:
Unrelated internal analysis
→ potentially restricted
```

Purpose does not automatically determine the decision, but it can be an important authorization condition.

---

## Tenant

Which tenant or organizational partition is involved?

For example:

```text
Tenant A
    ↓
Data A

Tenant B
    ↓
Data B
```

Authorization should prevent unintended cross-tenant access.

---

## Environment

The same principal may have different permissions in:

- development
- testing
- staging
- production

For example:

```text
Developer
   ↓
Development Environment
   → Broad test-data access

Developer
   ↓
Production Environment
   → Restricted operational access
```

---

## Data Sensitivity

The sensitivity of the target resource may affect authorization.

Examples:

- public information
- internal information
- confidential information
- highly sensitive information

A general application permission should not automatically imply unrestricted access to sensitive resources.

---

## Context

Additional request context may matter.

Examples:

- time
- device or network context
- transaction context
- request origin
- current organizational state
- risk signals

The exact conditions depend on the enterprise.

---

# Permissions, Roles, Attributes and Policies

These terms are related but not identical.

## Permission

A permission represents an allowed operation over a resource or capability.

Conceptually:

```text
Permission =
Action + Resource
```

Example:

```text
Read + CustomerRecord
```

---

## Role

A role groups permissions around an organizational or functional responsibility.

For example:

```text
Finance Analyst
    ↓
Read Finance Reports
Read Approved Financial Data
```

Roles can simplify administration, but excessive role growth or overly broad roles can create access problems.

---

## Attribute

An attribute is a property used as an input to authorization.

Examples:

```text
Department = Finance
DataClassification = Confidential
Region = APAC
Environment = Production
```

---

## Policy

A policy expresses the conditions under which an action should be allowed or denied.

Conceptually:

```text
IF
    Principal is Finance Analyst
AND
    Resource belongs to Finance
AND
    Environment is Production
AND
    Action is Read
THEN
    Allow
```

The specific policy language or implementation mechanism is not important here.

The important engineering concept is that authorization should be based on explicit, understandable rules rather than accidental permission inheritance.

---

# Authorization Is More Than Role Checking

A common simplification is:

> “The user has the correct role, so allow access.”

That may be insufficient.

Consider:

```text
User:
Finance Manager

Role:
Finance Manager

Requested Resource:
Executive Compensation Dataset

Action:
Export

Environment:
Production
```

A role alone may not provide enough context.

A more complete decision might consider:

- user identity
- role
- resource
- sensitivity
- action
- environment
- purpose
- organizational boundary
- additional conditions

This is why enterprise authorization often becomes context-dependent.

---

# Context-Dependent Authorization

A context-dependent decision can be represented as:

```text
Who?
  ↓
What action?
  ↓
Which resource?
  ↓
Which environment?
  ↓
Which tenant?
  ↓
What purpose?
  ↓
What data sensitivity?
  ↓
What other conditions?
  ↓
Decision
```

For example:

```text
User:
Regional Sales Manager

Action:
Read

Resource:
Customer Records

Region:
APAC

Purpose:
Customer Support

Environment:
Production

Decision:
Allow
```

The same user may request:

```text
Action:
Export

Resource:
All Customer Records

Purpose:
Personal Analysis

Decision:
Deny
```

Authorization is therefore a decision problem, not simply a membership check.

---

# Policy Conflicts and Decision Semantics

Enterprise authorization policies may overlap.

For example:

```text
Policy A
→ Finance Manager may read financial reports

Policy B
→ Highly Sensitive records require additional authorization
```

A request may therefore satisfy one policy while failing another.

The enterprise needs defined decision semantics for situations such as:

- overlapping policies
- explicit denial
- additional approval requirements
- conflicting conditions
- missing authorization context

The specific policy-combination algorithm depends on the enterprise architecture and implementation.

The governance requirement is simpler:

> **Authorization decisions must have understandable and consistently defined semantics.**

An engineer should be able to answer:

> “Why was this request allowed or denied?”

without relying on accidental permission inheritance.

---

# AI-Specific Access Boundaries

AI systems introduce an important additional problem.

An AI application can act as an intermediary between a user and enterprise capabilities.

A simplified model is:

```text
User
  ↓
AI Application / Agent
  ↓
Enterprise Capability
  ↓
Data / Tool / Service
```

The critical principle is:

> **A user's authorization to use an AI application does not automatically grant the AI application unrestricted access to every enterprise resource.**

However, this does **not** mean that AI authorization must always be completely independent from the user's authorization.

An AI system may intentionally operate within a user's authorization context.

The important requirement is:

> **The AI system's effective authority must be explicitly governed and must not exceed the intended authority, scope, purpose, and conditions of the interaction.**

This distinction allows both common models:

```text
User
  ↓
AI acting within user's bounded authority
```

and:

```text
Service / Application
  ↓
AI acting with explicitly granted service authority
```

without assuming that either model is universally correct.

---

# User-to-AI Access

The first access boundary is:

```text
User
  ↓
AI Application
```

The enterprise must determine:

- who may use the AI capability
- which features they may use
- which organizational context applies
- whether the user may access sensitive AI capabilities
- whether different user groups require different restrictions

For example:

```text
Employee
    ↓
Internal AI Assistant
    ↓
Allowed

External Contractor
    ↓
Internal AI Assistant
    ↓
Restricted / Denied
```

The exact policy depends on enterprise requirements.

---

# AI-to-Data Access

The next boundary is:

```text
AI Application
      ↓
Enterprise Data
```

The AI application may require access to data to answer a request.

However, the enterprise must distinguish:

```text
User authorized to access data
```

from:

```text
AI component authorized to process data
```

These may be related, delegated, or intentionally aligned, but they are not automatically equivalent.

For example:

```text
User
 ↓
AI Assistant
 ↓
Customer Data
```

The authorization design should establish:

- which data the AI component may access
- for which actions
- on whose behalf
- under which conditions
- within which tenant or organizational boundary
- for what purpose

---

# AI-to-Tool Access

AI systems may also interact with enterprise capabilities:

```text
AI System
    ↓
CRM
```

or:

```text
AI System
    ↓
Email
```

or:

```text
AI System
    ↓
Ticketing System
```

The important governance question is:

> **What authority does the AI system have to invoke the capability?**

The fact that a user can use an AI application does not mean:

```text
AI Application
    ↓
Unlimited Tool Access
```

is appropriate.

Instead, access should be bounded by:

- capability
- action
- scope
- user or service context
- organizational boundary
- purpose
- risk
- required permissions

Detailed tool execution mechanics belong to **AGT-03**.

Detailed agent safety and containment belong to **AGT-11**.

---

# Service-to-Service Access

AI architectures often contain multiple services:

```text
AI Application
      ↓
Retrieval Service
      ↓
Data Service
      ↓
Enterprise Database
```

Each service may have its own identity and permissions.

Therefore:

> **Service-to-service access should be explicitly governed rather than assumed from the user's identity.**

A service identity should not receive broad permissions simply because it is part of an AI application.

This is especially important for shared enterprise AI platforms.

---

# Delegated Access

AI systems frequently act **on behalf of** a user.

This creates a delegated-authority problem.

Consider:

```text
User
  ↓
AI Assistant
  ↓
CRM
```

The AI assistant may be acting in the context of the user.

But the enterprise still needs to establish:

- whose authority is being exercised
- which permissions are delegated
- how much authority is delegated
- which resources are in scope
- how long the authority remains valid
- whether the AI system can perform actions the user cannot perform directly
- how the delegated authority is revoked

Delegation should not silently expand privilege.

A useful principle is:

> **Delegation should preserve the intended authorization boundary rather than becoming an implicit privilege expansion mechanism.**

---

# AI Access Is Not Automatically User Access

One of the most important misconceptions is:

> “If the user can access it, the AI can access it.”

That reasoning is incomplete.

Consider:

```text
User
 ↓
Authorized for Customer A

AI Application
 ↓
Access to Customers A, B, C, D
```

This creates a privilege boundary problem.

The AI application may have broader access than the user actually requires.

A safer conceptual model is:

```text
User Authority
       ↓
Delegated / Derived Authority
       ↓
AI Capability Scope
       ↓
Resource Scope
       ↓
Specific Action
```

The exact relationship between user authority and AI authority depends on the enterprise authorization model, but any resulting authority should remain explicit and bounded.

---

# AI Access Boundary Model

A useful enterprise model is:

```text
┌───────────────┐
│     User      │
└───────┬───────┘
        │
        │ user authorization / delegation
        ▼
┌───────────────────────┐
│ AI Application / Agent│
└──────────┬────────────┘
           │
           │ bounded service / delegated authority
           ▼
┌───────────────────────┐
│ Enterprise Capability │
└──────────┬────────────┘
           │
           │ resource authorization
           ▼
┌───────────────────────┐
│ Data / Tool / Service │
└───────────────────────┘
```

Every meaningful boundary can require an authorization decision.

This prevents the common assumption that one successful authorization decision automatically authorizes the entire downstream chain.

---

# Capability Boundaries

A capability is an operation that a system can perform.

Examples:

- search customer records
- create support tickets
- send email
- update CRM records
- retrieve documents
- execute a business transaction

Access should be scoped to the capability actually required.

For example:

```text
AI Assistant

Allowed:
Read customer profile

Not automatically allowed:
Delete customer profile
Export customer database
Modify billing records
```

This is capability-level least privilege.

---

# Resource Boundaries

Resources may have different security requirements.

Examples:

```text
Enterprise Data
├── Public
├── Internal
├── Confidential
└── Highly Sensitive
```

An AI system should not receive unrestricted access merely because it belongs to the enterprise.

Authorization should reflect the resource boundary.

---

# Tenant Boundaries

In multi-tenant environments:

```text
Tenant A
    ↓
AI Application
    ↓
Tenant A Data

Tenant B
    ↓
AI Application
    ↓
Tenant B Data
```

A failure to maintain tenant boundaries can expose information across organizational customers or business entities.

Tenant isolation therefore becomes an authorization concern as well as a system architecture concern.

The exact technical isolation mechanisms belong elsewhere.

This chapter focuses on the governance question:

> **Which principal is permitted to access which tenant's capabilities and information?**

---

# Organizational Boundaries

Enterprise AI may cross organizational boundaries.

Examples:

```text
Business Unit A
      ↓
Shared AI Platform
      ↓
Business Unit B Data
```

The shared platform does not automatically receive unrestricted authority across every business unit.

Authorization should reflect organizational ownership and access boundaries.

This becomes particularly important when:

- business units have different confidentiality requirements
- data ownership differs
- legal or contractual boundaries exist
- external organizations are involved

---

# Environment Boundaries

Authorization may differ by environment.

```text
Development
    ↓
Testing
    ↓
Production
```

For example:

```text
Developer
    ↓
Development AI System
    → broad test access

Developer
    ↓
Production AI System
    → restricted operational access
```

The principle is:

> **Permissions should be appropriate to the environment, not merely inherited because the principal has a legitimate enterprise identity.**

---

# Least Privilege

Least privilege is a durable authorization principle:

> **Give a principal only the permissions required to perform its intended function, for the required scope and duration.**

It applies to:

- users
- applications
- services
- workloads
- AI systems
- agents
- tools
- model providers

For AI systems, least privilege should be considered across multiple dimensions.

### Scope

What resources can be accessed?

### Action

What operations can be performed?

### Duration

How long is the permission valid?

### Context

Under which conditions is it valid?

### Delegation

Whose authority is being exercised?

A useful model is:

```text
Least Privilege
=
Minimum Required
    +
Correct Scope
    +
Correct Action
    +
Correct Duration
    +
Correct Context
```

Least privilege reduces the potential impact of:

- compromised identities
- compromised applications
- incorrect authorization
- unintended AI behavior
- excessive delegation
- misconfigured services

But least privilege alone does not solve every security or privacy problem.

---

# Separation of Duties

Separation of duties prevents one principal from having excessive authority over an entire sensitive workflow.

For example:

```text
Principal A
    ↓
Prepare Transaction

Principal B
    ↓
Approve Transaction
```

An AI system should not automatically receive both permissions simply because it can technically perform the workflow.

Consider:

```text
AI System

Permission 1:
Create payment request

Permission 2:
Approve payment
```

Combining both may create an excessive-authority problem.

The appropriate boundary depends on the enterprise process.

The principle is:

> **Sensitive actions may require independent responsibilities or approval boundaries rather than a single principal controlling the complete workflow.**

---

# Privilege Escalation

Privilege escalation occurs when a principal obtains more authority than intended.

In AI systems, this can happen when:

- an AI application has broader permissions than its users
- a service identity has excessive privileges
- delegated authority is broader than intended
- permissions are inherited unexpectedly
- an AI system can reach resources outside its intended scope
- environment boundaries are bypassed
- tenant boundaries are incorrectly enforced

Conceptually:

```text
Intended Authority
      ↓
Bounded Capability

Unexpected Expansion
      ↓
Excessive Authority
```

A strong access architecture therefore asks:

> **What is the maximum authority this AI component can exercise if everything around it behaves incorrectly?**

This is a useful containment question.

---

# Access Lifecycle

Access should not be treated as a permanent state.

A useful lifecycle is:

```text
Request
  ↓
Approve
  ↓
Grant
  ↓
Use
  ↓
Monitor
  ↓
Review
  ↓
Modify
  ↓
Revoke
```

The exact workflow varies by enterprise.

The durable principle is:

> **Access is lifecycle-managed rather than permanently granted.**

---

## Access Request

A principal requests access to a resource or capability.

The request should identify enough context to support a meaningful decision.

---

## Approval

Where required, an appropriate authority evaluates the request.

Approval should not automatically mean unrestricted access.

---

## Grant

The required permissions are granted.

The grant should be scoped appropriately.

---

## Use

The principal uses the permission for the intended purpose.

---

## Monitor

The enterprise may monitor access activity to identify:

- unexpected use
- excessive access
- policy violations
- suspicious behavior
- access drift

Monitoring implementation belongs to appropriate production systems.

The governance concern is that access should remain observable enough to support review and accountability.

---

## Review

Permissions should be periodically or conditionally reviewed.

Review may be triggered by:

- organizational changes
- role changes
- application changes
- data sensitivity changes
- security events
- material AI capability changes

---

## Modify

Permissions may need to change when the business requirement changes.

---

## Revoke

Access should be removed when it is no longer justified.

Examples:

- employee leaves
- role changes
- project ends
- application is retired
- capability is removed
- provider relationship changes

---

# Revocation

Revocation is particularly important for AI systems with delegated or service-based access.

Suppose:

```text
User
  ↓
AI Assistant
  ↓
CRM
```

The user changes role and should no longer access a particular CRM dataset.

The enterprise must ensure that the AI path does not preserve the old authority indefinitely.

A useful question is:

> **If the underlying business authorization changes today, how quickly should the AI access path stop honoring the previous authority?**

This is an access-lifecycle question.

---

# Access Review

Access review asks whether previously granted permissions are still justified.

For AI systems, review may need to examine:

- user permissions
- service permissions
- AI application permissions
- delegated permissions
- tool permissions
- data permissions
- provider access
- tenant boundaries
- environment permissions

A common failure mode is:

```text
Permission Granted
      ↓
Business Requirement Changes
      ↓
Permission Remains
      ↓
Access Drift
```

Access review helps identify this drift.

---

# Authorization Failure Handling

Not every authorization request should succeed.

A robust system must define what happens when access is denied.

Conceptually:

```text
Request
   ↓
Authorization Decision
   ↓
      ┌───────────┐
      │           │
    Allow        Deny
      │           │
      ↓           ↓
  Continue     Stop / Constrain
```

For AI systems, denial should not silently turn into a broader alternative path.

For example:

```text
Request:
Read Confidential Finance Data

Authorization:
Denied

Unsafe fallback:
Search another unrestricted data source
```

A denial should remain a meaningful boundary.

---

# AI-Specific Authorization Failure

AI systems can introduce an additional problem:

> The AI may attempt to find another path when the requested resource is unavailable.

For example:

```text
Requested Resource
       ↓
Access Denied
       ↓
AI Searches Another Source
       ↓
Sensitive Information Obtained
```

The governance implication is:

> **Authorization boundaries must apply to the information or capability, not merely to one access path.**

This does not require teaching agent safety here.

The access-governance question is simply whether alternative paths remain within the intended authorization boundary.

---

# Delegated Authority and User Context

When an AI system acts on behalf of a user, the enterprise should distinguish between:

```text
User Identity
```

and:

```text
AI Service / Workload Identity
```

A conceptual model is:

```text
User
  │
  │ Delegated Authority
  ▼
AI Application
  │
  │ Bounded Service Access
  ▼
Enterprise Resource
```

The important questions are:

1. Who initiated the request?
2. Which identity is actually making the downstream request?
3. Whose authority is being exercised?
4. What permissions were delegated?
5. What resource scope was delegated?
6. What actions were delegated?
7. Can the delegated authority exceed the user's intended authority?
8. How is the authority revoked?

These questions make delegated access explicit rather than implicit.

---

# AI-to-Data Authorization

Consider an internal knowledge assistant:

```text
Employee
   ↓
AI Assistant
   ↓
Enterprise Knowledge
```

Suppose the employee can access:

```text
Document A
Document B
```

but not:

```text
Document C
```

The AI system should not treat:

```text
Employee can use assistant
```

as equivalent to:

```text
Assistant can retrieve everything
```

The access boundary should preserve the intended information scope.

A useful conceptual rule is:

> **AI-mediated access should not silently widen the user's information authority.**

---

# AI-to-Tool Authorization

Consider:

```text
Employee
   ↓
AI Assistant
   ↓
CRM
```

The AI assistant may need:

```text
Read Customer
```

but not:

```text
Delete Customer
```

or:

```text
Export All Customers
```

This is capability-specific authorization.

The enterprise should ask:

```text
What capability is needed?
        ↓
What action is required?
        ↓
What scope is required?
        ↓
Whose authority permits it?
        ↓
What is the minimum required permission?
```

AGT-03 may later explain how tools are selected and executed.

ENT-04 defines the authorization boundary around those capabilities.

---

# AI Access to External Providers

Consider:

```text
User
   ↓
Enterprise AI Application
   ↓
External Model Provider
```

The enterprise may need to determine:

- whether the provider may process the information
- what information is within the permitted scope
- whether the AI application is authorized to send it
- whether user authorization is sufficient for the intended processing path
- whether organizational restrictions apply
- whether the provider is an approved processing boundary
- what security and privacy requirements apply to the provider relationship

Authorization alone does not establish that a provider is trustworthy, secure, or compliant.

A provider boundary may therefore require consideration of:

```text
Authorization
        +
Security Requirements
        +
Privacy Requirements
        +
Organizational Policy
        +
Applicable Obligations
```

Detailed provider strategy belongs to **ENT-07**.

---

# Authorization and Privacy

Authorization and privacy are closely related but not identical.

Authorization asks:

> **Who may access or perform an action?**

Privacy asks additional questions such as:

> **Why is the information being processed?**

> **Is the processing appropriate?**

> **Is the amount of information appropriate?**

> **Can the information be shared with this recipient?**

Therefore:

```text
Authorization
      +
Purpose
      +
Data Scope
      +
Processing Conditions
```

may be necessary to reason about an AI interaction appropriately.

A user may have permission to access information without every possible downstream use of that information being appropriate.

---

# Purpose-Bound Access

Suppose an employee can access customer information for support.

That does not necessarily imply permission to use the same information for:

- unrelated analysis
- personal experimentation
- model training
- external sharing
- another business purpose

The authorization decision may therefore need to consider purpose.

This is particularly important for AI because one interaction can transform information into:

- prompts
- model inputs
- retrieved context
- generated outputs
- logs
- telemetry
- downstream records

The authorization boundary should account for the intended processing path.

---

## Access Boundaries Across Information Flow

AI systems may create multi-stage information flows:

```text
User Input
   ↓
AI Application
   ↓
Model
   ↓
Retrieval / Tool
   ↓
External Provider
   ↓
Generated Output
   ↓
Downstream System
```

Each transition may introduce:

- identity questions
- authorization questions
- privacy questions
- trust-boundary questions
- data exposure questions

The important principle is:

> **Authorization should be considered across the information-flow chain, not only at the initial user-to-application boundary.**

---

# Practical Enterprise Example 1 — Enterprise AI Assistant

## Scenario

An employee asks:

> “Summarize the confidential sales performance information for my region.”

The architecture is conceptually:

```text
Employee
   ↓
AI Assistant
   ↓
Retrieval System
   ↓
Sales Data
   ↓
Model
   ↓
Response
```

## Authorization Questions

### Question 1 — Can the employee use the assistant?

```text
Employee
   ↓
AI Assistant
   ↓
Allow?
```

---

### Question 2 — Can the assistant retrieve the requested data?

```text
AI Assistant
   ↓
Sales Data
   ↓
Allowed scope?
```

---

### Question 3 — Which sales data?

The assistant may need access only to:

```text
Employee's Region
```

rather than:

```text
All Enterprise Sales Data
```

---

### Question 4 — Which model can process the data?

If an external provider is involved:

```text
Sales Data
   ↓
External Provider
```

the enterprise must consider whether this processing path is authorized and satisfies the applicable security and privacy requirements.

---

### Question 5 — What happens to the output?

The generated summary may itself contain sensitive information.

Therefore:

```text
Generated Output
   ↓
User
```

is also an information-access boundary.

The fact that the output was generated by an authorized AI system does not make every downstream use automatically appropriate.

---

# Practical Enterprise Example 2 — AI Agent with Enterprise Tools

## Scenario

An AI agent can interact with:

```text
Email
CRM
Ticketing System
Document System
```

Conceptually:

```text
User
  ↓
AI Agent
  ├── Email
  ├── CRM
  ├── Ticketing
  └── Documents
```

The enterprise should not reason:

> “The user can use the agent, therefore the agent can use all connected systems.”

Instead, define capability-specific boundaries.

For example:

| Capability | Possible Authorization |
|---|---|
| Read CRM customer record | Allowed |
| Update CRM customer record | Restricted |
| Delete CRM customer record | Denied |
| Create ticket | Allowed |
| Send external email | Restricted |
| Read confidential HR documents | Denied |

The exact decisions depend on enterprise requirements.

The important principle is bounded authority.

---

# Practical Enterprise Example 3 — External Model Provider

## Scenario

An enterprise application sends user-provided information to an external model provider.

```text
User
   ↓
Enterprise AI Application
   ↓
External Model Provider
```

The enterprise must reason about:

- who is permitted to use the application
- what information may leave the enterprise boundary
- whether the application is authorized to send that information
- whether the provider boundary is approved for the intended processing
- what purpose applies
- whether the information is within the permitted scope
- whether the information or processing should be restricted

The provider itself may have a separate security/privacy governance relationship with the enterprise.

Detailed provider strategy belongs to **ENT-07**.

---

# Practical Enterprise Example 4 — Shared Enterprise AI Platform

## Scenario

A central AI platform provides:

- model access
- identity integration
- common access controls
- logging
- policy enforcement

Domain applications consume the platform.

```text
                  Enterprise AI Platform
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
     Finance             HR                Sales
     App                  App                App
```

The central platform may establish shared controls.

But the platform does not automatically solve every application-specific authorization problem.

For example:

```text
Shared Platform Control
        ↓
Identity Integration
```

does not automatically establish:

```text
Application-specific data authorization
```

Each application may still need to define:

- resource scope
- business purpose
- sensitive-data boundaries
- capability permissions
- delegated authority
- application-specific restrictions

This is the difference between shared infrastructure and complete authorization governance.

---

# Shared vs Application-Specific Access

Enterprise AI often uses shared services.

A useful model is:

```text
Enterprise Platform
        ↓
Shared Identity / Access Capability
        ↓
Application
        ↓
Application-Specific Resource
```

Shared controls can provide consistency.

Application-specific controls may still be required because applications differ in:

- business purpose
- data sensitivity
- users
- resources
- workflows
- capabilities
- regulatory or contractual constraints

Therefore:

> **Centralization can reduce duplication without eliminating application-specific authorization responsibility.**

---

# Security and Privacy Access Trade-offs

Authorization design is not simply about maximizing restriction.

Enterprise systems must balance protection with usability and business functionality.

## Least Privilege vs Workflow Flexibility

Very narrow permissions can reduce exposure.

But excessive fragmentation can make legitimate workflows difficult to operate.

The goal is:

> Minimum justified authority, not minimum imaginable authority.

---

## Centralized Control vs Domain Autonomy

Centralized access governance can improve consistency.

Domain-specific authorization can preserve business context.

A practical architecture may combine:

```text
Enterprise Policy
        ↓
Common Guardrails
        ↓
Domain-Specific Authorization
```

---

## Stronger Authentication vs User Friction

Stronger authentication may reduce unauthorized access.

But authentication strength should be appropriate to the sensitivity and risk of the capability.

Authentication does not replace authorization.

---

## Granular Authorization vs Operational Complexity

Fine-grained authorization can improve protection.

But excessive policy complexity can create:

- difficult administration
- inconsistent decisions
- policy conflicts
- poor maintainability
- review difficulty

The objective is a policy model that is sufficiently precise without becoming operationally unmanageable.

---

## Delegated Authority vs Automation

Delegation enables AI systems to perform useful work.

But broader delegation increases potential impact.

A useful principle is:

> **Automate within bounded authority.**

---

## Shared Controls vs Application-Specific Requirements

Shared enterprise controls can improve consistency.

But applications may have unique requirements.

Therefore:

```text
Shared Controls
+
Application-Specific Controls
```

may be necessary.

---

# Authorization Decision Reasoning

A useful reasoning flow is:

```text
Resource / Capability
        ↓
Who / What Is the Principal?
        ↓
What Action Is Requested?
        ↓
What Is the Purpose?
        ↓
What Conditions Apply?
        ↓
What Security / Privacy Requirements Apply?
        ↓
What Authorization Decision Is Required?
        ↓
What Boundary Must Be Enforced?
        ↓
How Should Access Be Scoped?
        ↓
How Will Access Be Reviewed or Revoked?
```

This is a reasoning model, not a mandatory enterprise process.

It helps engineers avoid reducing authorization to:

> “Does the user have the role?”

---

# Enterprise / Production Perspective

At enterprise scale, weak authorization design can create systemic problems.

## Excessive Permissions

A service or AI application receives more authority than required.

Potential result:

```text
Compromise / Misuse
      ↓
Large Blast Radius
```

---

## Stale Permissions

Permissions remain after the original business need disappears.

```text
Need Ends
   ↓
Permission Remains
   ↓
Access Drift
```

---

## Weak Tenant Isolation

An AI system unintentionally accesses information belonging to another tenant or organizational boundary.

---

## Unbounded Delegation

An AI application receives authority broader than the authority that should have been delegated.

---

## Hidden Service Identity

A user appears to perform an operation, but the downstream system actually sees a highly privileged service identity.

This can make authorization reasoning difficult if user context is not preserved appropriately.

---

## Authorization Bypass Paths

A restricted resource may become reachable through another capability.

For example:

```text
Direct Access
    ↓
Denied

Alternative AI Capability
    ↓
Same Sensitive Information
    ↓
Allowed
```

This creates an access-boundary failure.

---

## Unclear Ownership

No team clearly owns:

- user authorization
- AI application authorization
- service permissions
- delegated authority
- resource permissions

The result can be gaps between organizational responsibilities.

---

# Common Mistakes and Misconceptions

## Mistake 1 — Treating Authentication as Authorization

Incorrect:

> “The user authenticated successfully, so access is allowed.”

Correct:

> Authentication establishes identity confidence. Authorization determines permitted actions.

---

## Mistake 2 — Treating Identity as Permission

Incorrect:

> “This is an employee, so they can access the data.”

Correct:

> Employee identity is an input to an authorization decision.

---

## Mistake 3 — Assuming User Authorization Automatically Grants AI Authorization

Incorrect:

> “The user can access the CRM, so the AI can access the entire CRM.”

Correct:

> The AI's effective authority must be explicitly governed and appropriately bounded. It may operate within the user's delegated context, but that context must not silently expand beyond the intended authority.

---

## Mistake 4 — Giving an AI Service Broad Permissions for Convenience

Incorrect:

```text
AI Service
    ↓
Full Enterprise Access
```

Correct:

```text
AI Service
    ↓
Minimum Required Capability
    ↓
Minimum Required Resource Scope
```

---

## Mistake 5 — Using Roles as the Entire Authorization Model

Roles can be useful, but authorization may also depend on:

- resource
- action
- context
- purpose
- tenant
- environment
- data sensitivity

---

## Mistake 6 — Ignoring Delegated Authority

An AI system acting on behalf of a user creates an authority relationship that must be governed.

---

## Mistake 7 — Treating Access as Permanent

Permissions should have lifecycle management.

---

## Mistake 8 — Assuming Denial on One Path Is Enough

If another capability can retrieve the same restricted information, the overall boundary may still be ineffective.

---

## Mistake 9 — Confusing Privacy with Access Control

Access control can support privacy, but privacy also concerns:

- purpose
- collection
- use
- sharing
- retention
- secondary use

---

## Mistake 10 — Assuming Shared Platforms Solve Application Authorization

A central platform may provide common capabilities.

It does not automatically understand every application's business-specific authorization requirements.

---

## Mistake 11 — Granting Permissions Based on Technical Convenience

A permission should exist because it is justified by a business or system requirement, not because granting it makes integration easier.

---

## Mistake 12 — Designing for the Happy Path Only

Authorization should also consider:

- denial
- revocation
- role changes
- environment changes
- tenant changes
- delegated authority changes
- system changes
- alternative access paths

---

# Cross-Domain Boundary Notes

This chapter deliberately focuses on identity, authorization, and access boundaries.

Related topics are owned elsewhere:

- **ENT-02** — governance authority, accountability, decision rights, and governance operating models
- **ENT-03** — risk, impact, oversight, human control, and assurance
- **ENT-05** — data governance, provenance, authority, quality, and information lifecycle governance
- **ENT-06** — enterprise integration and platform architecture
- **ENT-07** — model/provider/vendor strategy
- **ENT-08** — AI economics and FinOps
- **ENT-09** — criticality, resilience, and dependency governance
- **AGT-03** — tool contracts, routing, and execution
- **AGT-11** — agent-specific safety, excessive agency, containment, and termination
- **PROD-09** — production security engineering and technical implementation

The key boundary for this file is:

> **ENT-04 defines who may access what under which conditions; other chapters may implement, integrate, assess, or operate those boundaries within their own ownership areas.**

---

## Interview Questions with Expected Answers

## 1. What is the difference between identity, authentication, and authorization?

**Expected answer:**

Identity describes who or what the principal is. Authentication establishes confidence that the claimed identity is genuine. Authorization determines what that principal is permitted to do.

---

## 2. What is the difference between an identity and a principal?

**Expected answer:**

An identity represents who or what an entity is, while a principal is the entity participating in an access decision or requesting/perfecting an action. The concepts are closely related, but they should not be treated as interchangeable.

---

## 3. Why is user authorization not automatically equivalent to AI authorization?

**Expected answer:**

Because the AI application or agent may operate as a separate principal or delegated execution context. Its effective authority must be explicitly bounded so that the AI does not receive broader access than intended.

---

## 4. What is the core authorization question?

**Expected answer:**

Who may access what, under which conditions. More precisely: which principal wants to perform which action against which resource or capability under which contextual conditions?

---

## 5. What is the difference between an authorization decision and enforcement?

**Expected answer:**

Authorization determines whether an action is permitted. Enforcement ensures that the resulting decision actually constrains the system's behavior and prevents unauthorized access.

---

## 6. Why is role-based authorization sometimes insufficient?

**Expected answer:**

A role may not capture resource, action, purpose, tenant, environment, sensitivity, or contextual constraints. Enterprise authorization may therefore require additional attributes or policy conditions.

---

## 7. What does least privilege mean for an AI system?

**Expected answer:**

The AI system should receive only the permissions required for its intended function, with the minimum necessary resource scope, actions, duration, and contextual authority.

---

## 8. What is delegated authority?

**Expected answer:**

Delegated authority occurs when one principal permits another principal to act on its behalf within a defined scope. For AI systems, delegation must be bounded so it does not silently expand authority.

---

## 9. Why are AI-to-tool permissions an authorization concern?

**Expected answer:**

Because an AI system may invoke enterprise capabilities on behalf of users or services. Each capability and action should have an appropriate authorization boundary rather than inheriting unrestricted access from the AI application.

---

## 10. Why should access be lifecycle-managed?

**Expected answer:**

Business roles, systems, responsibilities, and requirements change. Without review, modification, and revocation, permissions become stale and create access drift and unnecessary exposure.

---

## 11. What is privilege escalation in an AI context?

**Expected answer:**

It occurs when an AI system, service, or delegated identity obtains or exercises more authority than intended, such as accessing resources outside its approved scope or performing actions beyond the required capability.

---

## 12. How does privacy affect authorization?

**Expected answer:**

Authorization determines who may access or perform an action, while privacy also considers why information is processed, what information is used, how it is shared, how long it is retained, and whether the processing is appropriate.

---

## 13. Why can a shared enterprise AI platform still require application-specific authorization?

**Expected answer:**

Because different applications may have different users, business purposes, data sensitivity, resources, and capabilities. Shared platform controls provide common protection but cannot automatically encode every application's business-specific authorization requirements.

---

## 14. An employee can access a confidential document directly. Can an AI assistant automatically send that document to an external model provider?

**Expected answer:**

No. The user's access does not automatically authorize every downstream processing path. The enterprise must separately consider the AI application's authority, the provider boundary, data scope, purpose, privacy requirements, and applicable security policies.

---

## 15. What is the difference between least privilege and separation of duties?

**Expected answer:**

Least privilege limits each principal to the authority required for its function. Separation of duties prevents a single principal from controlling multiple sensitive stages of a workflow where independent responsibilities or approval boundaries are appropriate.

---

## 16. Why is authorization denial itself an important boundary?

**Expected answer:**

Because a denied request should not simply cause the system to find an alternative path to the same restricted resource. Authorization must apply to the underlying resource or capability, not merely one access route.

---

## Quick Revision

## Core Definitions

```text
Identity
→ Who or what is the principal?

Principal
→ Which entity is participating in the access decision?

Authentication
→ How is the claimed identity established or verified?

Authorization
→ What may the principal do?

Enforcement
→ How is the authorization decision actually constrained?

Access
→ The ability to perform an action against a resource/capability.
```

---

## Core Authorization Model

```text
WHO
↓
WHAT ACTION
↓
WHICH RESOURCE / CAPABILITY
↓
UNDER WHICH CONDITIONS
↓
ALLOW / DENY / CONSTRAIN
↓
ENFORCE
```

---

## AI Access Boundary

```text
User
  ↓
AI Application / Agent
  ↓
Enterprise Capability
  ↓
Data / Tool / Service
```

Authorization should be considered across each meaningful boundary.

---

## Least Privilege

```text
Minimum Required
+
Correct Scope
+
Correct Action
+
Correct Duration
+
Correct Context
```

---

## Access Lifecycle

```text
Request
  ↓
Approve
  ↓
Grant
  ↓
Use
  ↓
Monitor
  ↓
Review
  ↓
Modify
  ↓
Revoke
```

---

## Important Distinctions

| Concept | Core Question |
|---|---|
| Identity | Who or what is the entity? |
| Principal | Which entity participates in the access decision? |
| Authentication | Is the claimed identity established or verified? |
| Authorization | What may the principal do? |
| Enforcement | How is the authorization decision constrained in practice? |
| Security | What must be protected from unauthorized or harmful access/use? |
| Privacy | How should information about people be appropriately processed? |
| Access | What resource/capability can be interacted with, and how? |
| Least privilege | What is the minimum justified authority? |
| Delegation | Whose authority is being exercised by another principal? |
| Separation of duties | Should sensitive responsibilities be divided? |

---

# Key Takeaways

1. **Identity, principal, authentication, authorization, enforcement, and access are related but distinct concepts.**
2. **Authorization is a decision about who may perform what action against which resource or capability under which conditions.**
3. **An authorization decision is not the same thing as enforcement; the intended boundary must actually constrain system behavior.**
4. **AI systems introduce additional principals and access boundaries.**
5. **A user's authorization to use an AI application does not automatically grant the AI unrestricted enterprise access.**
6. **An AI system may operate within a user's delegated authorization context, but its effective authority must remain explicitly bounded.**
7. **AI-to-data and AI-to-tool access must be appropriately governed.**
8. **Delegated authority must be bounded so automation does not silently become privilege expansion.**
9. **Least privilege applies to users, services, applications, AI systems, agents, tools, and other principals.**
10. **Separation of duties can be important when AI systems participate in sensitive workflows.**
11. **Tenant, organizational, and environment boundaries are meaningful authorization boundaries.**
12. **Access must be lifecycle-managed, including review, modification, and revocation.**
13. **Authorization denial should remain a real boundary rather than causing unrestricted alternative access paths.**
14. **Privacy and authorization interact but answer different questions.**
15. **Provider authorization does not by itself establish provider security, privacy, trustworthiness, or compliance.**
16. **Shared enterprise AI platforms provide common capabilities but do not automatically solve application-specific authorization requirements.**
17. **Authorization should be reasoned about across the complete AI information-flow and capability chain.**
18. **The objective is proportionate, bounded authority—not maximum restriction.**

---

## Further Reading

For continued study, focus on durable concepts rather than vendor-specific implementations:

- identity and access management fundamentals
- authorization models and policy-based access control
- least privilege and separation of duties
- delegated authorization
- zero-trust security principles
- privacy-by-design principles
- enterprise security architecture
- AI-specific security and privacy guidance
- access-control design for service-to-service architectures

When studying external material, keep the conceptual distinction clear:

```text
Identity
      ↓
Principal
      ↓
Authentication
      ↓
Authorization
      ↓
Enforcement
      ↓
Access Boundary
      ↓
Security / Privacy Governance
```

The next ENT-04 file builds on this foundation by addressing **how security and privacy controls are integrated with enterprise governance, including control ownership, evidence, effectiveness, review, and reassessment**.
