# Layered and Clean Architecture

## 1. Overview

Software architecture defines the high-level structure of a software system: how responsibilities are organized, how components interact, and which dependencies are allowed between them.

As a system grows, organizing code into files and classes is no longer sufficient. Engineers must decide where business rules belong, how external systems are accessed, and how implementation details can change without destabilizing the entire application.

Two commonly used architectural approaches are:

- **Layered Architecture:** Organizes a system into layers based on responsibility.
- **Clean Architecture:** Organizes a system around business rules and establishes dependency boundaries that prevent infrastructure details from controlling the core of the application.

Both approaches aim to manage complexity, but they emphasize different aspects of system design.

This chapter explains their structures, dependency rules, trade-offs, and practical application in production systems.

### Learning Objectives

After completing this chapter, you should be able to:

- Explain the purpose of software architecture.
- Identify the responsibilities of common architectural layers.
- Describe the structure and dependency rules of Clean Architecture.
- Compare Layered Architecture and Clean Architecture.
- Trace a request through an application architecture.
- Recognize architectural violations and misplaced responsibilities.
- Choose an architecture proportionate to a system's complexity.
- Apply architectural boundaries to API, database, and AI-enabled applications.

### Scope Boundaries

This chapter focuses on architectural organization and dependency direction.

- General design principles are covered in [Software Design Principles](02-Software-Design-Principles.md).
- Separation of responsibilities and abstraction boundaries are covered in [Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md).
- The relationship between dependencies and module quality is covered in [Coupling and Cohesion](04-Coupling-and-Cohesion.md).
- The SOLID principles are covered in [SOLID Principles](05-SOLID-Principles.md).
- Object construction and dependency wiring are covered in [Dependency Injection](06-Dependency-Injection.md).

These concepts are used here to explain architectural decisions rather than taught again in full.

---

## 2. What Software Architecture Solves

Consider a FastAPI application that supports user registration.

Initially, one endpoint may handle all of the following:

1. Parse the HTTP request.
2. Validate user input.
3. Check whether the email already exists.
4. Apply registration rules.
5. Hash the password.
6. Save the user to PostgreSQL.
7. Send a verification email.
8. Construct the HTTP response.

This approach may work for a small application. However, as features grow, the endpoint can become responsible for too many unrelated concerns.

Suppose the application later needs to:

- Replace PostgreSQL with another persistence mechanism.
- Support registration through a background job.
- Add a second verification provider.
- Test registration rules without a database.
- Expose the same business operation through an API and an administrative interface.

If the registration logic is inseparable from HTTP handling and database operations, each change becomes harder to make safely.

Architecture provides a way to organize these responsibilities so that changes remain localized.

### 2.1 Architecture as a Set of Boundaries

A useful mental model is to view an application as a set of boundaries around responsibilities.

```text
External World
     |
     v
HTTP API / User Interface
     |
     v
Application Workflow
     |
     v
Business Rules
     |
     v
External Capabilities
(Database, Email, APIs)
```

This diagram is conceptual rather than a universal dependency diagram. In a well-designed architecture, the runtime call path and the source-code dependency direction do not always point the same way.

For example, an application workflow can call a database abstraction at runtime while the database implementation depends on that abstraction at compile time.

That distinction becomes especially important in Clean Architecture.

### 2.2 Architecture Is Not a Folder Structure

Creating folders named `controllers`, `services`, `repositories`, and `models` does not automatically produce a good architecture.

A project can have many folders and still contain:

- Business rules inside HTTP handlers.
- Database queries scattered throughout the application.
- Infrastructure imports inside core business modules.
- Circular dependencies between modules.
- Multiple layers that merely forward calls without adding meaningful responsibility.

Architecture is defined by **responsibility ownership, dependency rules, and enforceable boundaries**, not by directory names alone.

---

## 3. Layered Architecture

Layered Architecture organizes software into logical layers, each responsible for a particular category of work.

A common application structure contains the following layers:

1. Presentation layer.
2. Application or service layer.
3. Domain or business layer.
4. Infrastructure or data-access layer.

Not every application needs four separate layers. The appropriate structure depends on business complexity, team size, change frequency, and operational requirements.

### 3.1 Presentation Layer

The presentation layer interacts with external callers.

In a web application, this usually includes:

- HTTP routes and controllers.
- Request parsing.
- Transport-level validation.
- Authentication integration.
- Response formatting.
- Mapping application outcomes to HTTP status codes.

Example:

```python
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.post("/registrations")
def register_user(request: RegistrationRequest):
    result = registration_service.register(
        email=request.email,
        password=request.password,
    )

    if result.is_duplicate:
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    return {"user_id": result.user_id}
```

This example is illustrative. The referenced request model and service would need to be defined in the application.

The presentation layer should not become the main location for business policy or persistence logic.

For example, the route should not independently decide every rule about password policy, account eligibility, or registration state. Those rules should be owned by the appropriate business or application component.

### 3.2 Application or Service Layer

The application layer coordinates a business operation.

It answers questions such as:

- What steps must happen to complete this use case?
- Which business operation should be invoked?
- Which external capabilities are required?
- What should happen if a step fails?
- Which transaction or consistency boundary is needed?

An application service might coordinate registration as follows:

```python
class RegisterUser:
    def __init__(self, users, password_hasher, email_sender):
        self.users = users
        self.password_hasher = password_hasher
        self.email_sender = email_sender

    def execute(self, email: str, password: str):
        existing_user = self.users.find_by_email(email)

        if existing_user is not None:
            return RegistrationResult.duplicate()

        password_hash = self.password_hasher.hash(password)

        user = User.register(
            email=email,
            password_hash=password_hash,
        )

        self.users.save(user)
        self.email_sender.send_verification(email)

        return RegistrationResult.success(user.id)
```

This code demonstrates the coordination role of an application service. It omits important production concerns such as transaction management, concurrent registration attempts, idempotency, and reliable email delivery.

The application layer should not need to know whether users are stored in PostgreSQL or whether emails are sent through a particular provider.

Its purpose is to coordinate the operation, not to implement every low-level detail.

### 3.3 Domain or Business Layer

The domain layer contains the business concepts and rules that define the system's behavior.

It may include:

- Domain entities.
- Value objects.
- Business invariants.
- Domain services.
- Domain events.
- State-transition rules.

For example, a domain object might prevent an invalid account transition:

```python
class Account:
    def __init__(self, account_id: str, status: str):
        self.id = account_id
        self.status = status

    def activate(self):
        if self.status != "pending":
            raise ValueError(
                "Only pending accounts can be activated"
            )

        self.status = "active"
```

The important architectural property is that the business rule is located with the business concept it governs.

The domain layer should not need FastAPI request objects, SQLAlchemy sessions, HTTP response classes, or vendor-specific SDKs to express this rule.

A domain layer may be small or even unnecessary as a separately named layer in a simple CRUD application. It becomes more valuable when business rules are meaningful, complex, or likely to evolve independently of infrastructure.

### 3.4 Infrastructure or Data-Access Layer

The infrastructure layer implements technical capabilities required by the application.

Examples include:

- Database repositories.
- SQL queries and ORM mappings.
- Email providers.
- Payment gateways.
- External HTTP clients.
- Message brokers.
- Object storage.
- Model-serving clients.

A PostgreSQL repository might look like this:

```python
class PostgresUserRepository:
    def __init__(self, session):
        self.session = session

    def find_by_email(self, email: str):
        return (
            self.session.query(UserRecord)
            .filter(UserRecord.email == email)
            .first()
        )

    def save(self, user):
        record = UserRecord(
            id=user.id,
            email=user.email,
            password_hash=user.password_hash,
        )

        self.session.add(record)
        self.session.flush()
```

This is illustrative rather than a complete repository implementation. Production code must account for ORM mappings, transaction ownership, uniqueness constraints, and the conversion between persistence records and domain objects.

The infrastructure layer knows how a capability is implemented. The business layer should not need to know those implementation details.

### 3.5 Layered Architecture at a Glance

| Layer | Primary responsibility | Typical contents |
|---|---|---|
| Presentation | Handle external interaction | Routes, controllers, request/response schemas |
| Application | Coordinate use cases | Application services, commands, queries, workflow orchestration |
| Domain | Express business meaning and rules | Entities, value objects, business invariants |
| Infrastructure | Implement technical capabilities | Database repositories, email adapters, external clients |

The exact names and boundaries vary between systems. The responsibilities matter more than the labels.

---

## 4. Dependency Direction in Layered Architecture

A layered system is easier to maintain when dependencies follow deliberate rules.

A common dependency arrangement is:

```text
Presentation
     |
     v
Application
     |
     v
Domain

Infrastructure implements capabilities
required by the application and domain.
```

In a traditional layered design, infrastructure may be called directly by the application layer, and some systems also allow presentation code to call data-access components. These choices can be acceptable in simpler applications, but they increase the risk of business logic becoming coupled to technical implementation.

The critical design question is not simply whether one layer can call another. It is:

**Which parts of the system are allowed to know about which other parts?**

### 4.1 Dependency Rules Must Be Explicit

For a straightforward CRUD application, the following rules may be sufficient:

- Presentation code calls application operations.
- Application code coordinates business behavior.
- Domain code owns core business rules.
- Infrastructure implements database and external-service access.
- Infrastructure details are not imported into core business rules.
- Shared contracts have a clear owner.

A team should document and enforce the rules that matter to its application. Without enforcement, layer boundaries often erode over time.

### 4.2 Runtime Calls and Source Dependencies Are Different

Consider an application service that invokes `users.save(user)`.

At runtime, the call may travel to a PostgreSQL repository:

```text
RegisterUser.execute()
        |
        v
UserRepository.save()
        |
        v
PostgresUserRepository.save()
        |
        v
PostgreSQL
```

But the application service does not necessarily import `PostgresUserRepository`.

Instead, it can depend on a repository contract, with the concrete implementation supplied during application startup.

This gives two different views:

- **Runtime flow:** Describes which components execute or call one another.
- **Source dependency flow:** Describes which modules import, reference, or compile against other modules.

Confusing these views leads to many architectural misunderstandings.

Clean Architecture makes this distinction a central design concern.

---

## 5. Clean Architecture

Clean Architecture organizes a system so that business rules remain independent of delivery mechanisms and infrastructure details.

It is commonly represented as concentric layers. The inner layers contain the most important business policies; the outer layers contain implementation details.

A simplified representation is:

```text
+------------------------------------------------------+
| Frameworks and Drivers                               |
|                                                      |
|  +-----------------------------------------------+   |
|  | Interface Adapters                            |   |
|  |                                               |   |
|  |  +----------------------------------------+   |   |
|  |  | Application Business Rules             |   |   |
|  |  |                                        |   |   |
|  |  |  +---------------------------------+   |   |   |
|  |  |  | Enterprise Business Rules       |   |   |   |
|  |  |  +---------------------------------+   |   |   |
|  |  +----------------------------------------+   |   |
|  +-----------------------------------------------+   |
+------------------------------------------------------+
```

The exact number of packages or modules is not important. The architectural intent is to keep the core independent of implementation details.

### 5.1 Enterprise Business Rules

The innermost area contains the system's core business concepts and policies.

It may include:

- Entities.
- Value objects.
- Domain invariants.
- Business calculations.
- Rules that remain meaningful across different delivery mechanisms.

For a matrimonial platform, examples might include:

- A profile cannot be shown as verified unless the verification state satisfies the business rules.
- A user cannot be matched with their own profile.
- A match score must follow the defined scoring policy.
- A profile's eligibility depends on the platform's matching rules.

These rules should not depend directly on a web framework, a particular database, or an external AI provider.

Not every business rule must be placed inside an entity. The important point is to locate each rule in the appropriate core business component.

### 5.2 Application Business Rules

The application layer defines and coordinates use cases.

Examples include:

- Register a user.
- Update profile preferences.
- Find compatible profiles.
- Submit a verification request.
- Generate a daily recommendation.

A use case describes what the application does in response to a meaningful request.

For example, `FindCompatibleProfiles` might:

1. Load the user's profile and preferences.
2. Obtain candidate profiles through a defined retrieval capability.
3. Apply eligibility rules.
4. Rank eligible candidates.
5. Return the result in an application-level format.

The use case coordinates the workflow. The exact vector database, ranking service, and transport protocol are implementation details that should remain behind suitable boundaries.

The use case should not become a dumping ground for every rule or technical operation. Business invariants belong in appropriate domain components; infrastructure work belongs in adapters and external implementations.

### 5.3 Interface Adapters

Interface adapters translate between the system's core and external representations.

Examples include:

- HTTP controllers.
- Request and response mappers.
- Database repository implementations.
- ORM-to-domain mapping.
- External service adapters.
- Message-consumer adapters.

An adapter prevents an external format from becoming the language of the core application.

For example, an HTTP request may contain JSON fields such as `preferred_age_min` and `preferred_age_max`. The controller can validate and translate those fields into an application-level command.

The use case should not need to receive a FastAPI `Request` object or return a FastAPI `JSONResponse`.

Similarly, a PostgreSQL adapter can translate between database records and domain objects rather than allowing database-specific record types to spread throughout the core.

### 5.4 Frameworks and Drivers

The outermost area contains replaceable technical mechanisms and external systems.

Examples include:

- FastAPI.
- SQLAlchemy.
- PostgreSQL.
- Qdrant.
- Redis.
- Cloud storage.
- Email providers.
- External model APIs.
- Web servers and deployment infrastructure.

These technologies are important, but they should not dictate the design of the most stable business rules.

A framework can still be used throughout the application where appropriate. The goal is not to prohibit frameworks; it is to prevent core business policy from being inseparably tied to framework-specific behavior.

---

## 6. The Dependency Rule

The central rule of Clean Architecture is:

**Source-code dependencies must point inward, toward higher-level policy.**

In practical terms:

- Outer layers may depend on inner layers.
- Inner layers must not depend on outer-layer implementation details.
- Core business code must not import a database implementation simply because it needs to save data.
- Application use cases must not require HTTP framework objects to execute their business workflow.

A simplified diagram:

```text
Outer Layers
Frameworks, APIs, Database Adapters
              |
              | source dependency
              v
Application Use Cases
              |
              v
Domain Rules
Inner Layers
```

The arrows indicate source dependencies, not necessarily runtime calls.

### 6.1 Why Dependency Direction Matters

Suppose the core registration workflow directly imports SQLAlchemy and a specific email provider.

Then a database migration or provider replacement can force changes inside core application code.

With inward-pointing dependencies, the application defines the capabilities it needs, while outer-layer adapters provide their implementations.

This makes it easier to:

- Test business behavior independently.
- Replace infrastructure implementations.
- Introduce new delivery mechanisms.
- Keep business rules understandable.
- Review changes with smaller impact surfaces.

These benefits are not automatic. They depend on meaningful contracts, clear boundaries, and disciplined implementation.

### 6.2 Dependency Inversion at the Architecture Level

The dependency rule is closely related to the Dependency Inversion Principle discussed in [SOLID Principles](05-SOLID-Principles.md).

At an architectural level, the application owns or consumes an abstraction for a required capability. The infrastructure adapter implements that abstraction.

For example:

```python
from typing import Protocol

class UserRepository(Protocol):
    def find_by_email(self, email: str):
        ...

    def save(self, user) -> None:
        ...
```

The application use case can depend on `UserRepository` rather than a PostgreSQL-specific class.

A PostgreSQL adapter then implements the contract.

The application is expressing what it needs, while infrastructure is expressing how the capability is provided.

The detailed mechanics of constructing and supplying dependencies belong to [Dependency Injection](06-Dependency-Injection.md).

### 6.3 Abstractions Must Have a Clear Owner

A common mistake is to create interfaces for every class without considering who needs the abstraction or which change it protects against.

An abstraction is useful when it establishes a meaningful boundary between policy and implementation.

For example, a `UserRepository` contract can be valuable if application use cases need persistence while remaining independent of database technology.

By contrast, creating multiple interfaces for a simple, stable function may add indirection without meaningful benefit.

Clean Architecture does not mean maximizing the number of interfaces. It means controlling dependency direction where that direction matters.

---

## 7. A Complete Example: Finding Compatible Profiles

Consider a profile-matching use case in a matrimonial application.

The application needs to retrieve candidate profiles, enforce eligibility rules, rank candidates, and return results through an HTTP API.

A reasonable architectural design might be:

```text
                         External Client
                               |
                               v
                       FastAPI Controller
                               |
                               v
                     FindCompatibleProfiles
                         (Use Case)
                               |
                +--------------+--------------+
                |              |              |
                v              v              v
         Profile Reader   Eligibility     Ranking Policy
           Contract         Rules
                |
                v
       Qdrant Profile Adapter
                |
                v
             Qdrant
```

The diagram illustrates responsibility and runtime collaboration. The source-code dependencies must still respect the dependency rule: the use case should depend on appropriate contracts and core policies, not on the concrete Qdrant adapter.

### 7.1 Suggested Responsibilities

**FastAPI controller**

- Accepts the request.
- Performs transport-level validation.
- Obtains the authenticated user context.
- Invokes the use case.
- Maps the result to an HTTP response.

**FindCompatibleProfiles use case**

- Coordinates the matching workflow.
- Obtains candidate profiles.
- Applies the required business operations.
- Returns a result suitable for the delivery adapter.

**Eligibility rules**

- Enforce hard business constraints, such as excluding the current user.
- Apply applicable profile eligibility policies.
- Avoid depending on HTTP or database implementation details.

**Ranking policy**

- Defines how eligible candidates are ordered.
- Applies the relevant scoring and ranking rules.
- Remains testable independently of the retrieval provider.

**Qdrant profile adapter**

- Executes vector queries.
- Maps Qdrant results into application-appropriate representations.
- Handles infrastructure-specific details such as query parameters and result formats.

**PostgreSQL profile adapter**

- Retrieves canonical profile information when required.
- Applies database-specific querying and mapping.
- Enforces or relies on database constraints where appropriate.

### 7.2 Why This Boundary Matters for AI Systems

AI-enabled systems often depend on multiple external technologies:

- An embedding model.
- A vector database.
- A relational database.
- A reranking model.
- An LLM provider.
- A caching layer.
- A telemetry or tracing service.

If business rules directly depend on each vendor's SDK, replacing a model or database may require widespread changes.

A well-designed boundary can isolate provider-specific details while keeping business policy explicit.

For example, a ranking use case should not accidentally inherit a vendor's default score interpretation without an explicit decision. Similarity scores from different embedding models or retrieval systems may not be directly comparable. Score normalization, ranking rules, and thresholds should be designed and tested deliberately.

However, architecture alone does not solve retrieval quality, model evaluation, or score calibration. Those require separate engineering work.

---

## 8. Request Lifecycle Across Architectural Boundaries

Understanding a request's lifecycle helps distinguish the responsibilities of the layers.

Suppose a client requests compatible profiles.

```text
1. HTTP Request
       |
       v
2. Controller
   Validate transport input
       |
       v
3. Application Use Case
   Coordinate the workflow
       |
       +----> Load user preferences
       |
       +----> Retrieve candidates through a contract
       |              |
       |              v
       |       Vector DB Adapter
       |
       +----> Apply eligibility rules
       |
       +----> Rank eligible candidates
       |
       v
4. Application Result
       |
       v
5. Controller maps result to HTTP response
       |
       v
6. HTTP Response
```

This is a simplified flow. Real systems may retrieve data concurrently, invoke multiple adapters, cache intermediate results, or delegate expensive work to background processes.

### 8.1 Architectural Questions to Ask

When reviewing this flow, ask:

- Does the controller contain business decisions that belong elsewhere?
- Can the use case be invoked without an HTTP request?
- Does the use case depend on a vendor SDK directly?
- Are business eligibility rules applied consistently across entry points?
- Are persistence and external-service errors translated at appropriate boundaries?
- Can the ranking policy be tested without connecting to a vector database?
- Are transactions, timeouts, and retries owned by the right components?

These questions are more useful than checking whether a project has a folder named `services`.

---

## 9. Layered Architecture vs Clean Architecture

Layered Architecture and Clean Architecture are related but not identical.

Layered Architecture primarily organizes components by responsibility. Clean Architecture adds a stronger emphasis on dependency direction and protecting business rules from infrastructure details.

| Dimension | Layered Architecture | Clean Architecture |
|---|---|---|
| Primary emphasis | Separation of responsibilities into layers | Independence of business policy from implementation details |
| Dependency direction | Often follows the layer hierarchy, but varies by design | Explicitly points inward toward higher-level policy |
| Business logic | Usually placed in service or domain layers | Protected inside domain and application business rules |
| Infrastructure | Often accessed through data-access or service components | Implementations sit at outer boundaries and satisfy core-required contracts |
| Testing | Depends on how tightly layers are coupled | Designed to make core rules and use cases testable without infrastructure |
| Initial complexity | Can be relatively low | May require more deliberate boundary design |
| Best fit | Many conventional web and business applications | Systems with meaningful business rules and a need for infrastructure independence |
| Common failure | Layers become pass-through wrappers or business logic spreads across them | Excessive abstractions and indirection without meaningful business value |

A layered application can follow Clean Architecture's dependency rule. These are not mutually exclusive alternatives.

For example, an application may use presentation, application, domain, and infrastructure layers while ensuring that infrastructure implementations depend on contracts defined inward.

### 9.1 When to Choose a Simple Layered Design

A straightforward layered design is often sufficient when:

- The application is primarily CRUD.
- Business rules are limited and stable.
- There are few external integrations.
- The team needs a clear structure without significant architectural overhead.
- The cost of abstraction would exceed its current benefit.

The design should still have clear responsibilities and avoid coupling core rules unnecessarily to technical details.

### 9.2 When Clean Architecture Becomes Valuable

Clean Architecture is more compelling when:

- Business rules are complex or strategically important.
- Several external providers support the same capability.
- The application has multiple delivery mechanisms.
- Core behavior requires extensive isolated testing.
- Infrastructure changes are likely.
- Multiple teams need stable ownership boundaries.
- The system is expected to evolve for a long time.

The objective is not to use Clean Architecture because it is considered more sophisticated. It is to use the smallest set of boundaries that protects the system's important change points.

---

## 10. Architecture Does Not Require Microservices

A common misconception is that clean architectural boundaries require separate deployable services.

They do not.

A system can follow Clean Architecture inside a single deployable application, commonly called a modular monolith.

```text
                 One Deployable Application
+---------------------------------------------------+
|                                                   |
|  Presentation                                     |
|       |                                           |
|       v                                           |
|  Application Use Cases                            |
|       |                                           |
|       v                                           |
|  Domain Rules                                     |
|       ^                                           |
|       | contracts                                 |
|  Infrastructure Adapters                          |
|                                                   |
+---------------------------------------------------+
```

The modules can have explicit boundaries while sharing a process and deployment unit.

### 10.1 Modular Monolith

A modular monolith is appropriate when the system benefits from strong internal boundaries but does not need independent service deployment.

Potential benefits include:

- Simpler local development.
- Fewer network failure modes.
- Easier transactional consistency.
- Lower operational overhead.
- Clear internal module ownership.

Its success depends on enforcing module boundaries. A monolith with unrestricted cross-module access can become tightly coupled despite having a modular folder structure.

### 10.2 Microservices

Microservices introduce independently deployable services that communicate over network boundaries.

They may be useful when independent deployment, scaling, ownership, or fault isolation justify the added complexity.

They also introduce concerns such as:

- Network latency and failures.
- Distributed tracing.
- Partial failure.
- Data consistency across services.
- API and event versioning.
- Deployment coordination.
- Operational overhead.

Clean Architecture can help organize code inside each microservice, but it does not by itself solve distributed-system design.

**Engineering rule:** establish sound internal boundaries before assuming that a deployment boundary is necessary.

---

## 11. Architectural Boundaries in FastAPI

FastAPI's dependency system can help connect the application to infrastructure, but framework capabilities do not determine the architecture automatically.

A possible project structure is:

```text
app/
├── main.py
├── presentation/
│   └── routes/
│       └── matching.py
├── application/
│   └── use_cases/
│       └── find_compatible_profiles.py
├── domain/
│   ├── entities/
│   └── policies/
└── infrastructure/
    ├── persistence/
    ├── vector_search/
    └── external_services/
```

This is an example, not a mandatory folder layout. Larger systems may organize code by business feature or bounded context rather than by technical layer alone.

### 11.1 Composition at the Application Boundary

The application startup or composition layer can construct the concrete adapters and supply them to the use case.

Conceptually:

```python
# Illustrative pseudocode: concrete classes are omitted.

profile_reader = QdrantProfileReader(qdrant_client)
user_repository = PostgresUserRepository(db_session)

find_profiles = FindCompatibleProfiles(
    profile_reader=profile_reader,
    user_repository=user_repository,
    ranking_policy=ranking_policy,
)
```

The controller then invokes the use case rather than constructing a Qdrant client or PostgreSQL repository for each request.

FastAPI dependency providers can perform this wiring and manage appropriate resource lifetimes. Detailed construction, scopes, overrides, and cleanup are covered in [Dependency Injection](06-Dependency-Injection.md).

### 11.2 Avoid Framework Leakage

Framework leakage occurs when framework-specific types or behavior spread into components that should be independent of the framework.

Examples include:

- Passing FastAPI `Request` objects into domain entities.
- Returning framework-specific response objects from domain policies.
- Using SQLAlchemy models as the only representation of business concepts.
- Requiring a vector database SDK to execute a business-rule unit test.

Some applications deliberately choose simpler designs that use framework or ORM models directly. That may be a reasonable trade-off for a small system. The concern is not that a framework type exists, but that the dependency creates unacceptable change costs or prevents important behavior from being tested independently.

---

## 12. Testing Architectural Boundaries

Architecture should improve how behavior can be tested. A structure that is difficult to test may indicate unclear responsibilities or overly broad dependencies.

Different test types validate different boundaries.

### 12.1 Domain Tests

Test business rules without requiring a database, HTTP server, or external model.

Examples:

- A user cannot activate an ineligible account.
- A profile cannot match itself.
- A candidate failing a hard constraint is excluded.
- A score calculation follows the defined ranking policy.

These tests should be fast and deterministic wherever possible.

### 12.2 Application Use-Case Tests

Test workflow coordination by supplying controlled implementations of required capabilities.

For example, a matching use-case test can supply:

- A fake profile reader returning a known candidate set.
- A repository fake returning a known user profile.
- A deterministic ranking policy or fixture.

The test can verify that the use case calls the appropriate capabilities, applies the workflow in the intended order, and returns the expected outcome.

Avoid turning these tests into implementation-detail tests that assert every internal method call without a meaningful behavioral reason.

### 12.3 Adapter Integration Tests

Test infrastructure adapters against the actual technology or a sufficiently faithful test environment.

Examples:

- A PostgreSQL repository persists and retrieves the expected records.
- A Qdrant adapter translates filters and vectors correctly.
- An email adapter handles provider responses and failures.
- Database transactions and uniqueness constraints behave as expected.

A fake repository cannot prove that a SQL query is correct. An isolated use-case test and an adapter integration test provide different evidence.

### 12.4 End-to-End Tests

Test selected flows through the application's external interface.

For example:

```text
HTTP Request
    |
    v
FastAPI
    |
    v
Use Case
    |
    v
Test Database / Test Adapters
    |
    v
HTTP Response
```

End-to-end tests help detect wiring and integration problems, but they are usually slower and more complex than isolated tests.

A balanced test strategy uses the test type appropriate to each risk rather than attempting to test everything through HTTP endpoints.

---

## 13. Common Architectural Anti-Patterns

### 13.1 Anemic Service Layers

A service layer that only forwards every call to another component may add little value.

```python
def get_user(user_id):
    return repository.get_user(user_id)
```

This function is not inherently wrong. It becomes questionable when many such wrappers create extra files and indirection without owning a real responsibility.

Before introducing a layer, identify the decision, workflow, policy, or boundary it exists to protect.

### 13.2 Business Logic Inside Controllers

Controllers that perform eligibility checks, ranking, transaction management, and persistence become difficult to reuse and test.

Move the relevant responsibilities into application or domain components according to their purpose.

### 13.3 Infrastructure-Driven Core Models

If core business objects directly inherit from ORM models or depend on vendor-specific request and response types, infrastructure choices can shape business behavior.

This can be acceptable in deliberately simple applications, but the trade-off should be understood. Separate representations when the independence they provide is worth the additional mapping and maintenance.

### 13.4 Repository Abstraction Without a Real Boundary

Creating a repository interface for every table is not automatically good design.

A repository abstraction is useful when it protects a meaningful application or domain boundary. A generic wrapper around every ORM operation may merely duplicate an existing abstraction.

Choose abstractions based on responsibility and expected change, not on a rule that every database access must have the same number of layers.

### 13.5 Circular Module Dependencies

Suppose the application module imports infrastructure, while infrastructure imports concrete application implementations. This can create circular dependencies and make initialization and testing difficult.

Define clear ownership of contracts and ensure dependencies follow the intended direction.

### 13.6 Overengineering a Small Application

A simple application may not need:

- Separate interfaces for every class.
- A custom framework for use-case execution.
- Multiple layers of identical DTOs.
- A complex dependency container.
- Generic abstractions for a single stable implementation.

Architecture has a cost. Abstraction should be introduced to manage real complexity or meaningful change risk.

### 13.7 Treating Clean Architecture as a Guarantee of Quality

A system can follow the expected diagram and still have poor domain modeling, unreliable transactions, weak security, or incorrect business rules.

Architecture creates structure and constraints. It does not replace sound implementation, testing, observability, or operational discipline.

---

## 14. Production Engineering Considerations

A production architecture must account for more than the organization of classes and packages.

### 14.1 Transactions and Consistency

Identify which operations must succeed or fail together.

For example, creating a user record and writing a separate verification-email event may require a reliable consistency strategy. A database transaction alone cannot guarantee delivery by an external email provider.

The architecture should make transaction ownership and external side effects explicit. Depending on the system, this may require an outbox pattern, idempotent processing, or a background job workflow.

These are implementation decisions built on the boundaries established by the architecture.

### 14.2 Timeouts and Failure Handling

Infrastructure adapters should handle provider-specific communication behavior, including timeouts and the interpretation of external errors.

Application workflows should decide how failures affect the use case: retry, return a controlled failure, defer work, or use an explicitly designed fallback.

Do not blindly retry every operation. Retrying a non-idempotent operation can create duplicate side effects.

### 14.3 Observability

Useful observability includes:

- Request and use-case duration.
- Dependency latency.
- Error rates by operation and adapter.
- Correlation or trace identifiers.
- Structured business events.
- Metrics for resource and infrastructure health.

Instrumentation should help engineers locate failures across architectural boundaries without leaking sensitive data.

### 14.4 Security Boundaries

Authentication and authorization must be designed deliberately.

The presentation layer may establish the caller's identity, but sensitive business operations should not rely solely on the assumption that a route was protected correctly. Use cases or domain-facing policies should receive the required identity and authorization context where necessary and enforce the relevant business constraints.

Do not pass raw credentials or unnecessary personal data through every layer. Keep secrets in appropriate configuration or secret-management systems rather than embedding them in core business objects.

### 14.5 AI and Model Provider Changes

In AI-enabled systems, the architecture should make provider assumptions explicit.

For example, an embedding adapter may encapsulate:

- Provider-specific API calls.
- Request and response conversion.
- Retry and timeout behavior.
- Model and vector-dimension configuration.
- Provider-specific error translation.

The application should still own important product decisions, such as which retrieval strategy to invoke and how candidates are evaluated.

Provider abstraction should not hide meaningful differences in model behavior. Changing an embedding model can require re-embedding data, recalibrating thresholds, and re-evaluating retrieval quality. A clean interface reduces code coupling; it does not make two models semantically interchangeable.

---

## 15. A Practical Architecture Decision Workflow

When designing a new application or restructuring an existing one, use the following workflow.

### Step 1: Identify Business Capabilities

List the operations the system must support.

Examples:

- Register user.
- Update profile.
- Search compatible profiles.
- Verify identity.
- Generate recommendations.

Focus on behavior before selecting folders or frameworks.

### Step 2: Identify Business Rules

Determine which decisions must remain consistent regardless of how the operation is invoked.

Examples include eligibility, ownership, valid state transitions, and ranking policy.

Identify the appropriate domain or application owner for each rule.

### Step 3: Identify External Capabilities

List dependencies on:

- Databases.
- Vector stores.
- Model APIs.
- Email services.
- Payment providers.
- Message brokers.
- External APIs.

Determine which capabilities are likely to change, fail independently, or require isolated testing.

### Step 4: Choose the Smallest Useful Set of Boundaries

Decide whether a straightforward layered design is sufficient or whether the business rules justify stricter Clean Architecture boundaries.

Do not add abstraction merely because a reference architecture contains it.

### Step 5: Define Dependency Rules

Write down which modules may depend on which others.

For a system using Clean Architecture, core business and application modules should not import concrete infrastructure implementations.

### Step 6: Implement One Representative Use Case

Build a vertical slice from request to response.

Verify that each component has a clear responsibility and that dependencies are wired at the intended boundary.

### Step 7: Test Each Boundary

Test business rules independently, application coordination with controlled dependencies, infrastructure adapters against suitable test environments, and selected complete flows through the external interface.

### Step 8: Enforce the Architecture

Use code review, package organization, dependency rules, static analysis, and automated architecture tests where justified.

A rule that exists only in a diagram can gradually disappear from the codebase.

### Step 9: Reassess as the System Evolves

Review whether the architecture is reducing change cost or adding unnecessary indirection.

Architecture is a set of decisions that should evolve with evidence. It is not a one-time exercise in selecting a diagram.

---

## 16. Architecture Review Checklist

Use this checklist during design reviews and code reviews.

### Responsibility Boundaries

- [ ] Does each component have a clear responsibility?
- [ ] Are business rules located in appropriate business or application components?
- [ ] Are transport concerns separated from core workflows where that separation is valuable?
- [ ] Are infrastructure-specific details localized?

### Dependency Direction

- [ ] Are dependency rules explicit?
- [ ] Do core modules avoid unnecessary dependencies on frameworks and vendors?
- [ ] Are required external capabilities represented by meaningful contracts where needed?
- [ ] Are circular dependencies absent?

### Testing

- [ ] Can important business rules be tested without infrastructure?
- [ ] Can application workflows be tested with controlled dependencies?
- [ ] Are adapters tested against their real integration boundaries?
- [ ] Are selected end-to-end flows covered?

### Production Readiness

- [ ] Are transaction boundaries and side effects understood?
- [ ] Are timeouts and failure policies explicit?
- [ ] Are observability and security responsibilities clear?
- [ ] Are provider-specific assumptions documented?
- [ ] Is the architecture proportionate to current and expected complexity?

---

## 17. Key Takeaways

- Software architecture organizes responsibilities and controls dependencies as systems grow.
- Layered Architecture separates work by responsibility; Clean Architecture emphasizes independence of business policy from implementation details.
- Folder names alone do not establish architectural quality.
- Runtime call direction and source-code dependency direction are different concepts.
- Clean Architecture requires source dependencies to point inward toward higher-level policy.
- Application use cases coordinate workflows, while domain components own the business rules appropriate to them.
- Infrastructure adapters implement external capabilities behind suitable boundaries.
- A modular monolith can have strong architectural boundaries without becoming a microservices system.
- Architecture should improve changeability, testability, and clarity without introducing unnecessary indirection.
- In AI systems, provider adapters can isolate SDK details, but they cannot eliminate differences in model behavior or evaluation requirements.
- Architecture is successful when it reduces meaningful engineering costs, not when it reproduces a particular diagram.

---

## 18. Knowledge Connections

This chapter builds on earlier ENG-03 topics and prepares for later ones.

### Prerequisites

- [01 — Software Quality Attributes](01-Software-Quality-Attributes.md)
- [02 — Software Design Principles](02-Software-Design-Principles.md)
- [03 — Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md)
- [04 — Coupling and Cohesion](04-Coupling-and-Cohesion.md)
- [05 — SOLID Principles](05-SOLID-Principles.md)
- [06 — Dependency Injection](06-Dependency-Injection.md)

### Related Topics

- Design Patterns: useful when a specific recurring design problem requires a suitable solution.
- Refactoring: useful when evolving existing code toward clearer architectural boundaries.
- Technical Debt: useful when evaluating the long-term cost of architectural shortcuts.

These related topics should build on the boundaries introduced here rather than re-teach layered and clean architecture in detail.

---

## 19. Revision Questions

Answer these in your own words. Focus on reasoning, not memorization.

1. What problem does software architecture solve that ordinary code organization does not?
2. How would you distinguish the presentation, application, domain, and infrastructure responsibilities in a real use case?
3. Why are runtime call direction and source-code dependency direction not necessarily the same?
4. Explain the dependency rule in Clean Architecture using a database repository example.
5. When is a straightforward layered architecture sufficient?
6. What business or technical conditions make stricter architectural boundaries worthwhile?
7. Why does Clean Architecture not automatically require microservices?
8. How would you test a matching use case without connecting to Qdrant?
9. Which parts of an AI-enabled application should be isolated behind provider adapters, and which decisions should remain explicit in the application?
10. Describe one case where adding an abstraction would make an application worse rather than better.

---

## 20. Teaching Check

Imagine you are reviewing a FastAPI application where:

- HTTP routes perform matching and ranking.
- Route handlers query PostgreSQL directly.
- Qdrant SDK calls are mixed into business rules.
- The same matching rules are duplicated in a background job.

Explain how you would restructure the application.

Your explanation should identify:

1. Which responsibilities belong in the presentation, application, domain, and infrastructure areas.
2. Which contracts or boundaries are worth introducing and why.
3. How the API and background job can reuse the same use case.
4. Which tests would demonstrate that the new architecture works.
5. Which abstractions you would deliberately avoid introducing.

Do not start by drawing folders. Start by identifying the responsibilities, rules, and dependencies that need to change.

---

## Chapter Completion Criteria

This chapter is complete when you can:

- Explain the difference between layered organization and Clean Architecture's dependency rule.
- Trace a use case through the system and distinguish runtime calls from source dependencies.
- Design a small application with clear business, application, presentation, and infrastructure boundaries.
- Explain the trade-offs of stricter architecture versus a simpler layered design.
- Defend an architectural decision based on change risk, testability, complexity, and operational requirements.

**Next chapter:** [08 — Design Patterns](./08-Design-Patterns.md), beginning with creational patterns. The next chapter should focus on recurring object-creation problems rather than re-teaching architecture boundaries.

---

*Document status: Generated content for review. This response does not directly modify the repository file.*
