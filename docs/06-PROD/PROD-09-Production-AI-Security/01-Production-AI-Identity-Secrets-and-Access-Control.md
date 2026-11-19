# Production AI Identity, Secrets, and Access Control

## 1. Purpose

Production AI systems are accessed by many different actors:

- Human users
- Application services
- AI inference services
- Background workers
- Scheduled jobs
- Deployment systems
- Data-processing workloads
- Monitoring and operational components
- External integrations

Each actor may need access to different resources and operations.

The central security problem is therefore not simply:

> **“How do we authenticate users?”**

It is:

> **“Who or what is making this request, how do we establish that identity, and what exactly should that identity be allowed to access or perform?”**

This chapter develops the engineering foundations for answering that question in production AI systems.

The focus is on:

- Identity
- Authentication
- Authorization
- Access control
- Least privilege
- Human and workload identities
- Service identity
- Secrets
- Credentials
- Credential lifecycle
- Short-lived access
- Privileged access
- Security boundaries

The objective is not to memorize identity technologies.

The objective is to reason correctly about **identity and access boundaries**.

---

## 2. Why Identity and Access Become Critical in Production AI

A production AI system rarely consists of one process communicating with one database.

A typical system may contain:

```text id="5s05t1"
User
  ↓
API
  ↓
Application Service
  ↓
AI Service
  ↓
Model Endpoint
  ↓
Data Store
  ↓
External Service
```

There may also be background paths:

```text id="vabd6a"
Scheduler
    ↓
Worker
    ↓
AI Processing
    ↓
Storage

Deployment System
    ↓
Production Workload

Monitoring System
    ↓
Operational APIs
```

Every connection introduces an identity and access decision.

For example:

- Which user is calling the API?
- Which service is calling the model endpoint?
- Which workload is accessing the database?
- Which worker can read uploaded documents?
- Which deployment system can change production?
- Which service can access a secret?
- Which administrator can modify access policies?

If these boundaries are poorly designed, a compromise of one identity can become a compromise of many resources.

This leads to an important production principle:

> **Identity is a security boundary, not merely a login mechanism.**

---

# 3. Identity: The “Who” of a Request

An identity is a security principal representing a human, workload, service, or other actor within a system's security model.

Conceptually:

```text id="fqdbht"
Actor
  ↓
Identity / Principal
  ↓
Request
  ↓
Resource / Operation
```

The identity allows the system to reason about the origin of the request.

## 3.1 Human Identity

A human identity represents a person interacting with the system.

Examples include:

- Application user
- Engineer
- Administrator
- Security operator
- Data operator

A human identity may authenticate using:

- Passwords
- Multi-factor authentication
- Federated identity
- Hardware-backed credentials
- Other organization-approved authentication mechanisms

The specific mechanism is implementation-dependent.

The engineering concern is that the resulting identity must be distinguishable and usable for access decisions.

---

## 3.2 Workload Identity

A workload identity represents a software workload rather than a human.

Examples include:

- API service
- Inference service
- Background worker
- Scheduled job
- Data-processing service
- Deployment workload

This distinction is important.

A service should not normally authenticate as a human user simply because it needs access to another service.

Instead:

```text id="rwep3d"
Human
  ↓
Human Identity

Service
  ↓
Workload Identity
```

This creates clearer accountability and narrower authorization boundaries.

---

## 3.3 Service Identity

A service identity identifies a particular service when it communicates with another component.

For example:

```text id="1ihgme"
Recommendation Service
        ↓
    Service Identity
        ↓
Vector Database
```

The receiving system can then evaluate:

> Is this service allowed to perform this operation?

This is preferable to treating every internal request as anonymous or using one shared identity for multiple services.

---

# 4. Identity vs Authentication vs Authorization

These concepts are related but not interchangeable.

## Identity

Identity answers:

> **Who or what is the actor?**

## Authentication

Authentication answers:

> **What evidence allows the system to establish the claimed identity with sufficient assurance for the intended security boundary?**

## Authorization

Authorization answers:

> **What is that identity allowed to do?**

The relationship is:

```text id="ovv170"
Identity
   ↓
Authentication
   ↓
Authorization
   ↓
Allowed Operation
```

These are separate security decisions.

---

# 5. Authentication

Authentication establishes confidence in an identity.

A simplified model is:

```text id="0kgoxw"
Claimed Identity
      ↓
Authentication Evidence
      ↓
Identity Established
```

The evidence may come from different mechanisms.

For a human:

```text id="kbbsfz"
User
 ↓
Authentication
 ↓
User Identity
```

For a workload:

```text id="hrxfvb"
Service
 ↓
Workload Authentication
 ↓
Service Identity
```

The exact authentication technology can vary, but the security question remains the same:

> **What evidence allows the system to establish the claimed identity with sufficient assurance for the intended security boundary?**

---

# 6. Authorization

Authentication alone does not determine what an identity may do.

Suppose a service successfully authenticates.

That tells the system:

> “This is service X.”

It does not automatically mean:

> “Service X may access every database, every model, every secret, and every administrative operation.”

Authorization establishes the allowed actions.

Conceptually:

```text id="rcx9pp"
Authenticated Identity
        +
Requested Action
        +
Target Resource
        ↓
Authorization Decision
        ↓
Allow / Deny
```

For example:

```text id="isjrwx"
Identity:
    Recommendation Service

Resource:
    Profile Database

Action:
    Read profile

Decision:
    Allow
```

But:

```text id="73orde"
Identity:
    Recommendation Service

Resource:
    User Administration

Action:
    Delete user

Decision:
    Deny
```

The authorization boundary should reflect the actual responsibility of the workload.

---

# 7. Authentication Does Not Imply Authorization

This distinction is one of the most important concepts in production security.

Consider:

```text id="ufwvpx"
Service A
   ↓
Authentication
   ↓
Identity = Service A
```

The system still needs to answer:

```text id="e0rvjk"
What can Service A access?
```

A common security failure occurs when authentication is implemented correctly but authorization is too broad.

For example:

```text id="km8gsv"
Service A
   ↓
Authenticated
   ↓
Full Database Access
```

The identity is valid, but the permission boundary is excessive.

A stronger design is:

```text id="74nu5l"
Service A
   ↓
Authenticated
   ↓
Limited Role
   ↓
Specific Database Operations
```

Therefore:

> **Authentication establishes identity; authorization limits capability.**

---

# 8. Access Control

Access control is the mechanism through which the system enforces authorization decisions.

A useful abstraction is:

```text id="0dg167"
Principal
    +
Action
    +
Resource
    +
Context
    ↓
Access Decision
```

Where:

- **Principal** is the identity requesting access.
- **Action** is what the identity wants to do.
- **Resource** is what it wants to access.
- **Context** contains relevant conditions for the decision.

Examples of actions include:

- Read
- Write
- Create
- Update
- Delete
- Invoke
- Execute
- Administer

Examples of resources include:

- Database
- Object storage
- Model endpoint
- Secret
- Queue
- API
- Configuration
- Infrastructure resource

Context can modify the authorization decision even when the identity, action, and resource remain the same.

For example, a policy may distinguish between:

- A normal application operation and an administrative operation
- Access to a low-sensitivity resource and a sensitive resource
- Requests made under different security conditions
- Normal access and access requiring stronger authentication

The exact context depends on the system's security requirements.

The important principle is:

> **Authorization is a policy decision, not simply an identity lookup.**

---

# 9. Authorization Models

Different systems express authorization policies in different ways.

The important models to recognize are:

### Role-Based Access Control

Permissions are associated with roles, and identities receive those roles.

```text id="9k8x5a"
Identity
   ↓
Role
   ↓
Permissions
```

For example, a workload might receive an `inference-service` role containing only the permissions required to invoke a model.

The benefit is operational simplicity when responsibilities map cleanly to stable roles.

The limitation is that roles can become too broad when many identities require slightly different permissions.

---

### Attribute- or Context-Based Access Control

Authorization decisions can use attributes associated with the identity, resource, action, or request context.

Conceptually:

```text id="m0w1gk"
Identity Attributes
        +
Resource Attributes
        +
Request Context
        ↓
Policy Decision
```

This can support more fine-grained decisions when access depends on conditions beyond a static role.

The trade-off is greater policy complexity and a larger reasoning surface.

---

### Policy-Based Access Control

Policies explicitly describe the conditions under which access is allowed or denied.

Conceptually:

```text id="y8j2o6"
Principal
   +
Action
   +
Resource
   +
Conditions
   ↓
Policy Evaluation
   ↓
Allow / Deny
```

These models are not mutually exclusive in every system.

A production architecture may combine role, attribute, and policy-based mechanisms.

The important engineering question is:

> **Can the authorization model express the access boundaries the system actually requires without becoming unnecessarily difficult to operate?**

---

# 10. Least Privilege

Least privilege means:

> **An identity should receive only the permissions required to perform its legitimate responsibilities.**

This does not necessarily mean giving every identity exactly one permission.

It means avoiding unnecessary capability.

Consider an inference service.

It may need:

```text id="hthljz"
Model Endpoint
    → Invoke

Configuration Store
    → Read

Database
    → Read specific data
```

It may not need:

```text id="vi4i9h"
Database
    → Delete everything

User Administration
    → Full control

Production Infrastructure
    → Administrator access
```

The desired boundary is:

```text id="xpl50i"
Required Capability
        ↓
Granted Permission
        ↓
No Unnecessary Privilege
```

---

# 11. Why Least Privilege Matters

Suppose a workload is compromised.

Without least privilege:

```text id="tosr4y"
Compromised Workload
       ↓
Broad Identity
       ↓
Many Accessible Resources
       ↓
Large Blast Radius
```

With least privilege:

```text id="wlz7hb"
Compromised Workload
       ↓
Narrow Identity
       ↓
Limited Accessible Resources
       ↓
Smaller Blast Radius
```

Least privilege therefore reduces the consequences of identity compromise.

It does not prevent compromise by itself.

Its primary value is **limiting what a compromised identity can do**.

---

# 12. Least Privilege Is a Design Problem

Least privilege cannot be implemented correctly by simply selecting a generic “secure” role.

The engineer must first understand the workload.

Ask:

1. What does this workload actually do?
2. Which resources does it require?
3. Which operations does it perform?
4. Which operations are read-only?
5. Which operations require modification?
6. Which access is required continuously?
7. Which access is required only occasionally?
8. What happens if the workload is compromised?

The resulting permissions should follow the workload's real responsibilities.

---

## 13. Human Identity vs Workload Identity

Production systems should distinguish human access from workload access.

Consider an engineer accessing production:

```text id="tgebsu"
Engineer
   ↓
Human Identity
   ↓
Administrative Access
```

Now consider an inference service:

```text id="s2l5f3"
Inference Service
   ↓
Workload Identity
   ↓
Model Invocation
```

These identities should not be interchangeable.

A workload should not need an engineer's personal credentials to operate.

Similarly, an engineer should not normally operate production workloads using a shared service credential.

The separation improves:

- Accountability
- Authorization precision
- Credential lifecycle management
- Auditability
- Blast-radius control

---

# 14. Shared Credentials Are a Security Boundary Failure

Consider:

```text id="hpdkz4"
Service A ─┐
Service B ─┼──> Shared Credential ──> Database
Service C ─┘
```

If the credential is compromised, it may be difficult to determine:

- Which service used it
- Which service was compromised
- Which permissions were actually required
- Which service should have access removed

A stronger model is:

```text id="ciw7gi"
Service A → Identity A → Permissions A
Service B → Identity B → Permissions B
Service C → Identity C → Permissions C
```

Each workload can then have a distinct security boundary.

---

# 15. Workload Identity

Workload identity provides a way for software workloads to establish their identity without relying on a human's credentials.

The conceptual flow is:

```text id="5jigwp"
Workload Starts
      ↓
Workload Identity Established
      ↓
Authentication
      ↓
Authorization
      ↓
Resource Access
```

The exact implementation varies by environment.

The important architectural property is:

> **The workload should have an identity appropriate to its role and lifecycle.**

This becomes particularly important when services scale dynamically.

A system may create and destroy many instances of the same workload.

The identity model should therefore be associated with the workload's security role rather than with manually managed individual machines.

---

# 16. Secrets and Credentials

A **secret** is sensitive information that must be protected from unauthorized disclosure.

A **credential** is information or material used to authenticate or authorize access.

They overlap but are not identical.

For example, a private key may be both sensitive secret material and credential material.

Examples of credentials or credential material may include:

- API keys
- Passwords
- Tokens
- Private keys
- Client credentials
- Access credentials
- Service credentials

The security problem is therefore not simply:

> “Where do we store the secret?”

It is:

> **“How do we control the entire lifecycle of sensitive credentials and secret material?”**

A simplified relationship is:

```text id="oqs1e6"
Secret / Credential Material
          ↓
Authentication / Authorization
          ↓
Resource Access
```

---

# 17. Secret Lifecycle

A production secret should be considered across its lifecycle:

```text id="zf37nm"
Creation
   ↓
Storage
   ↓
Distribution
   ↓
Use
   ↓
Rotation
   ↓
Revocation
   ↓
Expiration / Destruction
```

Security can fail at any stage.

For example:

- A secret may be generated securely but stored insecurely.
- A secret may be stored securely but exposed through logs.
- A secret may be distributed too broadly.
- A credential may remain valid for years.
- A compromised credential may not be revocable quickly.

Therefore:

> **Secret management is a lifecycle problem, not merely a storage problem.**

---

# 18. Secret Storage

Secrets should not normally be embedded directly into application source code.

Avoid patterns such as:

```text id="zk7x1a"
Application Source
      ↓
Hard-coded Production Credential
```

The problem is that source code may be:

- Shared
- Version-controlled
- Copied
- Logged
- Packaged
- Exposed to developers or automation

A stronger conceptual model is:

```text id="rnshvb"
Application
    ↓
Authorized Secret Retrieval
    ↓
Secret Management System
    ↓
Secret
```

The application receives the secret according to its identity and authorization boundary.

The exact secret-management technology is environment-specific.

---

# 19. Secret Access Must Also Be Authorized

A secret-management system does not automatically make secrets safe.

Suppose:

```text id="xea710"
Secret Store
     ↓
All Production Services
     ↓
All Secrets
```

The secrets may be stored securely, but access control is still weak.

A stronger model is:

```text id="ex5n9z"
Service A
   ↓
Authorized for Secret A

Service B
   ↓
Authorized for Secret B
```

This demonstrates an important principle:

> **Secure storage and least-privilege access must work together.**

---

# 20. Secret Exposure Through Application Behavior

A secret can be exposed even when the underlying secret store is secure.

Potential exposure paths include:

- Application logs
- Error messages
- Debug output
- Configuration dumps
- Exception traces
- Source repositories
- Build output
- Diagnostic endpoints
- Client-side responses

Therefore security engineers must reason about the entire path:

```text id="frbae5"
Secret Store
     ↓
Application
     ↓
Runtime
     ↓
Logs / Errors / Outputs
```

The security boundary does not end when the secret leaves the secret store.

---

# 21. Credential Rotation

Credentials should have a lifecycle that allows replacement.

Conceptually:

```text id="33jmw8"
Credential A
      ↓
Rotation Event
      ↓
Credential B
      ↓
Credential A Revoked
```

Rotation reduces the useful lifetime of a compromised credential.

It can therefore reduce exposure when:

- A credential is leaked
- An employee leaves
- A workload changes
- Access requirements change
- A security incident occurs

However, rotation also introduces operational complexity.

The system must ensure that legitimate workloads can transition safely.

---

# 22. Short-Lived Credentials

Long-lived credentials create a larger exposure window.

Consider:

```text id="iodtwx"
Credential Validity
<------------------------------>

          Compromise
              ↓
       Long Remaining Life
```

A short-lived credential reduces that window:

```text id="zxnxub"
Credential Validity
<-------->

     Compromise
         ↓
   Short Remaining Life
```

This does not eliminate compromise.

It limits how long the credential remains useful.

The engineering trade-off is:

```text id="hgexxd"
Shorter Lifetime
      ↓
Lower Exposure Window
      +
Greater Credential Lifecycle Complexity
```

Therefore short-lived access should be evaluated together with operational reliability.

---

# 23. Credential Revocation

Rotation and revocation solve related but different problems.

### Rotation

Replace a credential with another credential.

### Revocation

Make an existing credential unusable.

For example:

```text id="g1t9u6"
Credential Compromised
        ↓
Immediate Revocation
        ↓
Credential No Longer Accepted
```

A mature credential-management design needs to consider both.

---

# 24. Privileged Access

Not every identity should have administrative privileges.

Privileged operations may include:

- Changing access policies
- Managing production infrastructure
- Modifying security configuration
- Accessing sensitive data
- Creating credentials
- Granting permissions

A useful model is:

```text id="fu1emy"
Normal Identity
      ↓
Normal Operations

Privileged Identity
      ↓
Privileged Operations
```

Privileged access should be intentionally separated from ordinary application access.

The principle is:

> **The ability to perform an administrative operation should itself be treated as a security-sensitive capability.**

---

# 25. Access Boundaries Around AI Services

AI systems often contain several resources with different sensitivity levels.

For example:

```text id="1wbhsn"
User
 ↓
Application API
 ↓
AI Service
 ├── Model Endpoint
 ├── Profile Data
 ├── Prompt / Context Data
 ├── Configuration
 └── Secrets
```

The AI service should not automatically receive unrestricted access to all of these resources.

Instead, define explicit boundaries.

For example:

```text id="tpe6pb"
AI Service
   ├── Invoke Model → Allowed
   ├── Read Required Data → Allowed
   ├── Read Secret A → Allowed
   ├── Read Secret B → Denied
   └── Administrative Operations → Denied
```

The exact permissions depend on the application's requirements.

The principle is:

> **AI capability does not justify unrestricted resource access.**

---

# 26. Identity Boundaries in Multi-Service AI Systems

Consider a production architecture:

```text id="v5279u"
Client
  ↓
API Service
  ↓
Orchestration Service
  ↓
Inference Service
  ↓
Model Endpoint
```

Each service should have a clearly defined identity relationship.

For example:

```text id="3egyg3"
Client
   ↓
User Identity

API Service
   ↓
API Workload Identity

Orchestration Service
   ↓
Orchestrator Workload Identity

Inference Service
   ↓
Inference Workload Identity
```

This allows access decisions to be made at service boundaries.

Instead of asking:

> “Is this request internal?”

the system can ask:

> “Which workload is making this request, and is that workload authorized for this operation?”

---

# 27. Transitive Access and Blast Radius

A dangerous design occurs when one identity can obtain access to another identity's capabilities.

Consider:

```text id="f5kzj7"
Service A
   ↓
Access to Service B
   ↓
Service B
   ↓
Broad Database Access
```

If Service A is compromised, the attacker may indirectly obtain Service B's capabilities.

This creates **transitive privilege**.

A useful security question is:

> **If this identity is compromised, what capabilities can it reach directly or indirectly?**

This is a blast-radius question.

The objective is to minimize unnecessary privilege paths.

---

# 28. Authorization Should Be Explicit

A production system should avoid relying on assumptions such as:

- “Internal services are trusted.”
- “Anything inside the network is trusted.”
- “This service only calls us from one place.”
- “The model service is internal, so it needs full access.”
- “The application already authenticated the user.”

Instead, authorization should be explicit.

```text id="8wmryf"
Identity
   +
Action
   +
Resource
   ↓
Explicit Policy
   ↓
Allow / Deny
```

The exact authorization model may differ between systems.

The underlying principle remains the same.

---

# 29. Security Boundaries Should Follow Responsibility

A strong identity architecture aligns permissions with responsibility.

For example:

```text id="up7b2t"
Data Ingestion Service
    ↓
Write Required Dataset

Inference Service
    ↓
Read Required Model / Data

Reporting Service
    ↓
Read Aggregated Results
```

Each service receives the capabilities required for its role.

This produces a more understandable security architecture than:

```text id="29xc5u"
All Services
     ↓
Shared Administrator Credential
     ↓
Everything
```

Security boundaries should therefore reflect **what the workload is responsible for**, not merely where it happens to run.

---

# 30. Common Identity and Access Failures

## 30.1 Shared Credentials

Multiple workloads use the same credential.

### Problem

- Poor accountability
- Broad blast radius
- Difficult revocation
- Difficult permission tuning

---

## 30.2 Hard-Coded Secrets

Credentials are embedded in application code or configuration.

### Problem

- Difficult lifecycle management
- Increased exposure
- Accidental repository leakage
- Difficult rotation

---

## 30.3 Long-Lived Credentials

Credentials remain valid for extended periods.

### Problem

A compromised credential may remain useful for a long time.

---

## 30.4 Over-Privileged Workloads

A service receives more permissions than required.

### Problem

Compromise can produce a larger blast radius.

---

## 30.5 Human Credentials Used by Workloads

An automated service uses a developer or administrator credential.

### Problem

- Poor identity separation
- Difficult accountability
- Excessive privileges
- Fragile credential lifecycle

---

## 30.6 Authentication Without Authorization Discipline

The system verifies identities but grants broad permissions.

### Problem

A valid identity can perform unauthorized operations.

---

## 30.7 Secure Secret Store, Weak Access Policy

Secrets are stored in a strong secret-management system, but many workloads can retrieve them.

### Problem

The storage mechanism is secure while the authorization boundary is weak.

---

## 31. Engineering Review Questions

When reviewing identity and access architecture, ask:

### Identity

- Who are the actors?
- Which actors are human?
- Which actors are workloads?
- Does each important workload have a distinct identity?

### Authentication

- How is each identity established?
- What evidence establishes sufficient identity assurance?
- How long does authentication remain valid?

### Authorization

- What can each identity do?
- Which resources can it access?
- Which actions are allowed?
- Which actions are explicitly denied?
- Does the authorization model express the required boundaries clearly?

### Least Privilege

- Does the workload have more access than required?
- What is the blast radius if it is compromised?
- Can permissions be narrowed?

### Secrets

- Where are secrets stored?
- How are they distributed?
- Who can retrieve them?
- Can they leak through logs or diagnostics?
- How are they rotated?
- How are they revoked?

### Privileged Access

- Which identities can modify security boundaries?
- Which identities can grant permissions?
- Are administrative capabilities separated from normal workloads?

---

## 32. Production Design Pattern

A production-oriented identity model can be represented as:

```text id="7868sv"
                    ┌─────────────────────┐
                    │      Human User     │
                    └──────────┬──────────┘
                               │
                         Authentication
                               │
                               ▼
                    ┌─────────────────────┐
                    │    User Identity    │
                    └──────────┬──────────┘
                               │
                         Authorization
                               │
                               ▼
                    ┌─────────────────────┐
                    │    API / Service    │
                    └──────────┬──────────┘
                               │
                        Workload Identity
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Service Boundary  │
                    └──────┬──────┬───────┘
                           │      │
                    Authorized   Authorized
                      Access       Access
                           │      │
                           ▼      ▼
                      Data Store  AI Service
                                  │
                                  ▼
                             Model Endpoint
```

The diagram is conceptual.

It does not prescribe a particular identity provider, authorization technology, cloud platform, or AI framework.

---

# 33. Security Decision Framework

When designing identity and access for a production AI component, use the following sequence:

```text id="dmq7i1"
1. Identify the Actor
        ↓
2. Establish the Identity
        ↓
3. Authenticate the Identity
        ↓
4. Identify Required Resources
        ↓
5. Identify Required Operations
        ↓
6. Define Authorization
        ↓
7. Minimize Permissions
        ↓
8. Protect Credentials / Secrets
        ↓
9. Define Rotation and Revocation
        ↓
10. Evaluate Blast Radius
        ↓
11. Review Residual Risk
```

This turns identity design into an explicit engineering process.

---

# 34. Trade-offs

Identity and access controls introduce trade-offs.

## Least Privilege

**Benefit**

- Smaller blast radius
- Better access isolation
- More precise authorization

**Trade-off**

- More policies
- Greater operational complexity
- Greater risk of legitimate access failures if permissions are poorly designed

---

## Short-Lived Credentials

**Benefit**

- Reduced exposure window
- Reduced value of stolen credentials

**Trade-off**

- More complex credential issuance
- More lifecycle dependencies
- Potential operational failures if renewal is unreliable

---

## Strict Authorization

**Benefit**

- Stronger access boundaries
- Reduced unauthorized capability

**Trade-off**

- Increased implementation and maintenance effort
- Greater developer/operator friction
- Potential legitimate-workflow failures

---

## Separate Workload Identities

**Benefit**

- Better accountability
- Smaller blast radius
- More precise permissions

**Trade-off**

- More identities to manage
- More authorization policies
- More operational configuration

---

## 35. Important Non-Equivalences

Several statements should not be treated as equivalent:

```text id="ynqtmp"
Authentication
    ≠
Authorization
```

```text id="xarywh"
Secret Storage
    ≠
Secret Security
```

```text id="t4dsdf"
Credential Rotation
    ≠
Credential Compromise Prevention
```

```text id="caspdt"
Least Privilege
    ≠
Compromise Prevention
```

```text id="so0e7a"
Workload Identity
    ≠
Automatic Authorization
```

```text id="au3pe1"
Internal Service
    ≠
Automatically Trusted Service
```

```text id="4kk1t5"
Valid Identity
    ≠
Safe Operation
```

These distinctions are essential for production security reasoning.

---

# 36. Residual Risk

Identity and access controls reduce risk but cannot eliminate every security problem.

For example:

```text id="xvmpwb"
Least Privilege
      ↓
Reduced Blast Radius
      ↓
But Compromise May Still Occur
```

Similarly:

```text id="gg6aq5"
Short-Lived Credential
      ↓
Reduced Credential Exposure Window
      ↓
But Credential May Still Be Abused Before Expiration
```

And:

```text id="ajhdnq"
Strong Authorization
      ↓
Reduced Unauthorized Access
      ↓
But Authorized Operations May Still Be Unsafe
```

Therefore every access-control design should consider:

> **What remains possible if this control works exactly as designed?**

That question leads to the concept of residual risk.

---

# 37. Production Checklist

Before deploying an AI workload, verify:

### Identity

- [ ] Human and workload identities are separated.
- [ ] Important workloads have identifiable service/workload identities.
- [ ] Shared credentials are avoided where practical.

### Authentication

- [ ] Authentication mechanisms are appropriate for the identity type.
- [ ] Workloads do not depend unnecessarily on human credentials.
- [ ] Credential validity is appropriately bounded.

### Authorization

- [ ] Permissions are explicitly defined.
- [ ] Resource access is limited to required resources.
- [ ] Operations are limited to required actions.
- [ ] Administrative capabilities are separated from normal workload capabilities.
- [ ] The authorization model can express the required access boundaries.

### Least Privilege

- [ ] Workloads do not have unnecessary permissions.
- [ ] Blast radius has been evaluated.
- [ ] Indirect/transitive access paths have been considered.

### Secrets

- [ ] Secrets are not hard-coded.
- [ ] Secrets are stored using an appropriate protected mechanism.
- [ ] Secret access is itself authorized.
- [ ] Secrets are not exposed through logs or diagnostics.
- [ ] Rotation is defined.
- [ ] Revocation is possible.

### Lifecycle

- [ ] Credential creation is controlled.
- [ ] Credential distribution is controlled.
- [ ] Credential expiration/rotation is understood.
- [ ] Compromised credentials can be revoked.

---

## 38. Summary

Production AI security begins with a clear answer to:

> **Who or what is making this request, and what exactly should it be allowed to access or perform?**

The key concepts are:

1. **Identity** represents a security principal such as a human, workload, or service.
2. **Authentication** establishes the claimed identity with sufficient assurance for the intended security boundary.
3. **Authorization** determines what the identity may do.
4. **Access control** enforces those authorization decisions.
5. **Least privilege** limits identities to necessary capabilities.
6. **Workload identity** separates software identities from human identities.
7. **Secrets and credentials** require lifecycle management, not merely secure storage.
8. **Short-lived credentials** can reduce exposure windows.
9. **Rotation and revocation** provide mechanisms for credential lifecycle control.
10. **Privileged access** should be treated as a distinct security-sensitive capability.
11. **Identity boundaries** should follow workload responsibility.
12. **Blast-radius analysis** helps evaluate the consequences of identity compromise.
13. **Role-, attribute-, and policy-based authorization** provide different ways to express access decisions.
14. **Authentication does not imply authorization.**
15. **Secure storage does not compensate for weak access control.**
16. **Least privilege reduces impact but does not prevent compromise.**

The production engineering standard is therefore:

> **Design identity and access boundaries deliberately, grant only the capabilities required by each actor, protect credentials throughout their lifecycle, and continuously reason about what happens if an identity is compromised.**

This provides the foundation for the next security layer: protecting the application, runtime, dependencies, and artifact chain that those identities are authorized to access.
