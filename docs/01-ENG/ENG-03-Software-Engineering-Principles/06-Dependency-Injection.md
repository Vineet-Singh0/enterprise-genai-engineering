# Dependency Injection

## 1. Overview

Most software components depend on other components to perform their work.

A registration service may depend on a user repository. A matchmaking service may depend on an embedding provider. A reporting service may depend on a data source. These dependencies are necessary because useful software is built from collaborating components.

The design problem is **who creates these dependencies, who controls their lifecycle, and how the dependent component receives them**.

Dependency injection (DI) is a technique in which a component receives the dependencies it needs from an external source rather than constructing or locating all of them internally.

This technique can make dependencies more explicit, improve testability, support implementation substitution, and separate application behavior from object construction.

However, dependency injection is not automatically beneficial. Introducing a container, interfaces, or multiple layers for every class can increase complexity without improving the design.

### Learning objectives

After completing this chapter, you should be able to:

- Explain dependencies and dependency injection from first principles.
- Distinguish dependency injection from dependency inversion.
- Identify the problems caused by constructing dependencies internally.
- Implement constructor, setter, and method injection.
- Wire dependencies manually without a framework.
- Understand dependency injection through FastAPI.
- Use dependency injection to test components independently.
- Reason about object lifecycles, shared state, and resource management.
- Recognize service locator misuse, circular dependencies, and overengineering.
- Decide when dependency injection is justified in a production system.

### Scope boundaries

This chapter focuses on dependency construction, supply, and lifecycle.

Related concepts have their primary explanations elsewhere:

- [03 — Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md) explains responsibility boundaries and abstraction contracts.
- [04 — Coupling and Cohesion](04-Coupling-and-Cohesion.md) explains dependency relationships and their effects.
- [05 — SOLID Principles](05-SOLID-Principles.md) explains the Dependency Inversion Principle.
- [07 — Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md) explains architectural boundaries and dependency direction.
- [08 — Design Patterns](08-Design-Patterns/README.md) covers recurring design solutions.

---

## 2. The Problem: Components Construct Their Own Dependencies

Consider a service that retrieves user information.

```python
class UserService:
    def __init__(self):
        self.repository = PostgreSQLUserRepository()

    def get_user(self, user_id: int):
        return self.repository.get_by_id(user_id)
```

The service constructs a specific repository implementation internally.

This may be adequate for a small script. However, as the application grows, several problems can emerge.

### 2.1 Implementation is tightly selected

`UserService` directly names `PostgreSQLUserRepository`.

If the application needs a different implementation for testing, local development, or a different storage system, the service may need to change.

The service knows not only what capability it needs but also how that capability is implemented.

### 2.2 Testing becomes harder

A unit test for `UserService` may unintentionally initialize database-related objects.

Even if the test only needs to verify how the service handles a user record, it may require database configuration, network connectivity, or additional setup.

This couples a test of business behavior to infrastructure.

### 2.3 Construction responsibilities are mixed

The service has two jobs:

1. Perform the user-related operation.
2. Decide which repository implementation to construct.

The second responsibility is not inherently part of retrieving a user.

### 2.4 Configuration becomes scattered

If multiple services independently construct database repositories, changing connection settings or implementation choices may require changes in several places.

The same problem can occur with external APIs, caches, message brokers, embedding providers, and other dependencies.

These concerns motivate a separation between **using a dependency** and **creating and configuring that dependency**.

---

## 3. What Is Dependency Injection?

**Dependency injection is a technique in which an object or function receives the dependencies it requires from an external source instead of creating or locating those dependencies internally.**

Consider a revised implementation:

```python
class UserService:
    def __init__(self, repository):
        self.repository = repository

    def get_user(self, user_id: int):
        return self.repository.get_by_id(user_id)
```

The service no longer chooses a particular repository implementation.

The caller supplies one:

```python
repository = PostgreSQLUserRepository()
user_service = UserService(repository)
```

A test can supply a controlled implementation:

```python
class FakeUserRepository:
    def get_by_id(self, user_id: int):
        return {"id": user_id, "name": "Test User"}


service = UserService(FakeUserRepository())

user = service.get_user(42)
assert user["id"] == 42
```

The service can now be tested without constructing a PostgreSQL repository.

This example uses structural typing informally: the supplied object must implement the operation the service calls. A production design may define an explicit protocol or interface when that contract provides meaningful value.

### 3.1 The core mental model

Without dependency injection:

```text
UserService
    |
    | constructs
    v
PostgreSQLUserRepository
```

With dependency injection:

```text
Composition Code
       |
       | creates and supplies
       v
+--------------------+
|    UserService     |
+--------------------+
       |
       | uses
       v
Repository Capability
       ^
       |
PostgreSQL Implementation
```

The second arrangement separates construction from use.

The service still depends on the repository's behavior. Dependency injection does not eliminate dependencies; it changes how they are supplied and makes the relationship easier to control.

### 3.2 What dependency injection does not guarantee

Dependency injection does not automatically guarantee:

- Low coupling.
- Good abstractions.
- Correct architecture.
- Testability.
- Security.
- Correct object lifecycles.
- Reliable error handling.

For example, injecting a concrete repository can improve construction and testing while leaving the service dependent on that concrete implementation.

DI is a technique. Its benefits depend on the surrounding design.

---

## 4. Dependency Injection and Dependency Inversion

These concepts are closely related but must not be confused.

### 4.1 Dependency Inversion Principle

The Dependency Inversion Principle (DIP) is a design principle stating that high-level policy should not depend directly on low-level implementation details. Both should depend on appropriate abstractions.

It concerns the direction of source-code dependencies.

### 4.2 Dependency injection

Dependency injection is a construction technique. It supplies an object with the dependencies it needs rather than requiring the object to create or locate them internally.

### 4.3 Compare the two

| Aspect | Dependency Inversion | Dependency Injection |
|---|---|---|
| Nature | Design principle | Implementation technique |
| Main question | Which components depend on which abstractions? | How does a component receive its dependencies? |
| Primary goal | Control dependency direction | Separate dependency construction from dependency use |
| Typical mechanism | Contracts and dependency boundaries | Constructor arguments, method arguments, or setters |
| Requires a framework? | No | No |

Consider:

```python
class PostgreSQLUserRepository:
    def get_by_id(self, user_id: int):
        ...


class UserService:
    def __init__(self, repository: PostgreSQLUserRepository):
        self.repository = repository
```

The dependency is injected, but the service still names the concrete repository type.

Now consider a protocol:

```python
from typing import Protocol


class UserRepository(Protocol):
    def get_by_id(self, user_id: int):
        ...


class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository
```

The service now depends on a capability contract, and the concrete repository can implement that contract.

The two improvements address different concerns:

- Injection separates construction from use.
- The abstraction supports dependency inversion.

Neither requires a dependency injection framework.

**Engineering question:** Am I merely changing how an object is constructed, or am I also improving the dependency relationship itself?

---

## 5. The Three Common Injection Methods

Dependency injection can be implemented in several ways. The appropriate method depends on whether the dependency is required for the component's existence, optional configuration, or a particular operation.

### 5.1 Constructor injection

Constructor injection supplies dependencies when an object is created.

```python
class UserService:
    def __init__(self, repository):
        self.repository = repository
```

Construction:

```python
service = UserService(repository)
```

The object receives its required dependency before it can be used.

#### Advantages

- Required dependencies are explicit.
- An object cannot be constructed normally without supplying them.
- Dependencies are easy to inspect during testing.
- The object can establish its invariants during construction.
- Dependencies can be stored for use throughout the object's lifetime.

#### Trade-offs

- A constructor with many unrelated dependencies may indicate an overly broad responsibility.
- Object creation requires the caller to know the required collaborators.
- Incorrect lifecycle management can still result in shared-state or resource problems.

Constructor injection is generally the preferred default for required dependencies.

A class that requires a repository to perform its work should usually receive it during construction rather than allowing the repository to be silently absent.

### 5.2 Setter or property injection

Setter injection supplies or replaces a dependency after object construction.

```python
class ReportService:
    def __init__(self):
        self.repository = None

    def set_repository(self, repository) -> None:
        self.repository = repository
```

Usage:

```python
service = ReportService()
service.set_repository(repository)
```

This approach can be useful when a dependency is genuinely optional or must be configured after construction.

However, it introduces a possible invalid state: the service exists but has no repository.

If a method is called before the dependency is supplied, the service may fail at runtime.

Setter injection also permits the dependency to be replaced after construction, which may be undesirable if the object assumes that its collaborators remain stable.

**Use it selectively.** If a dependency is mandatory for correct operation, constructor injection usually communicates that requirement more clearly.

### 5.3 Method injection

Method injection supplies a dependency to a particular operation rather than storing it for the object's entire lifetime.

```python
class ReportFormatter:
    def format(self, data, clock) -> str:
        generated_at = clock.now()
        return f"Report generated at {generated_at}: {data}"
```

Usage:

```python
formatter = ReportFormatter()
report = formatter.format(data, clock)
```

The clock is required only for this operation, so it is supplied to the method.

Method injection can be useful when:

- The dependency is needed by only one operation.
- Different calls need different implementations.
- The dependency should not be retained as object state.
- The operation is naturally parameterized by a collaborator.

It can become cumbersome if every operation requires many collaborators that are really part of the object's permanent responsibility.

### 5.4 Choosing an injection method

| Method | Appropriate use | Main risk |
|---|---|---|
| Constructor injection | Required dependencies used throughout the object's lifetime | Constructors can reveal overly broad responsibilities if they accumulate many unrelated dependencies. |
| Setter injection | Optional or deliberately reconfigurable dependencies | The object may exist in an invalid or partially configured state. |
| Method injection | Dependencies needed for a specific operation | Repeated parameter passing can become cumbersome. |

The choice should communicate the component's real dependency requirements.

---

## 6. Manual Dependency Injection

A framework is not required to use dependency injection.

In many applications, manually creating and connecting objects is the simplest and most transparent approach.

Consider a small order-processing system.

### 6.1 Define the contract

```python
from typing import Protocol


class OrderRepository(Protocol):
    def get_by_id(self, order_id: int):
        ...


class PaymentGateway(Protocol):
    def charge(self, amount: float) -> None:
        ...
```

The protocols describe the capabilities the service needs.

They do not prescribe a database vendor or payment provider.

### 6.2 Implement the business workflow

```python
class OrderService:
    def __init__(
        self,
        repository: OrderRepository,
        payment_gateway: PaymentGateway,
    ) -> None:
        self.repository = repository
        self.payment_gateway = payment_gateway

    def pay_for_order(self, order_id: int) -> None:
        order = self.repository.get_by_id(order_id)

        if order is None:
            raise ValueError("Order not found")

        self.payment_gateway.charge(order["total"])
```

The service coordinates the operation using its required capabilities.

This example is intentionally simplified. Production payment processing needs explicit handling for payment authorization, idempotency, currency, concurrency, transaction states, provider failures, and reconciliation.

### 6.3 Construct concrete implementations at the application boundary

```python
repository = PostgreSQLOrderRepository()
payment_gateway = StripePaymentGateway()

order_service = OrderService(
    repository=repository,
    payment_gateway=payment_gateway,
)
```

The construction code chooses the implementations.

This location is often called the **composition root**: the part of the application where dependencies are created, configured, and assembled into a working object graph.

A composition root might be:

- An application's startup module.
- A command-line entry point.
- A web application's dependency configuration.
- A background worker's initialization code.
- A test setup function.

The composition root should remain understandable. If construction logic becomes scattered across business classes, the benefits of separating construction from use can be lost.

### 6.4 What is an object graph?

An object graph is the network of objects and their dependencies.

For example:

```text
Application Entry Point
        |
        v
    OrderService
      /       \
     v         v
Repository   PaymentGateway
     |         |
     v         v
 PostgreSQL  Payment Provider
```

The composition root constructs the concrete objects and connects them according to their required contracts.

In a larger application, the graph may contain dozens or hundreds of components. Manual wiring remains valid, but repeated construction and lifecycle management can eventually justify a framework or container.

**Key lesson:** Dependency injection is a design technique, not a framework feature.

---

## 7. Dependency Injection in FastAPI

FastAPI provides a dependency system that can resolve dependencies for request handlers and other dependencies.

This is particularly useful for web applications that need to supply database sessions, authentication information, services, or other request-scoped resources.

### 7.1 Define a service dependency

```python
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


class UserService:
    def get_user(self, user_id: int) -> dict:
        return {"id": user_id, "name": "Example User"}


def get_user_service() -> UserService:
    return UserService()


UserServiceDependency = Annotated[
    UserService,
    Depends(get_user_service),
]


@app.get("/users/{user_id}")
def read_user(
    user_id: int,
    service: UserServiceDependency,
):
    return service.get_user(user_id)
```

This is a minimal illustration of FastAPI's dependency resolution. The service is created by a dependency provider and supplied to the endpoint.

The example does not yet demonstrate a production repository or database lifecycle. A real application would construct or retrieve the service's required dependencies according to the application's configuration and lifecycle requirements.

### 7.2 Dependency providers can depend on other providers

A provider can itself require another dependency.

Conceptually:

```text
HTTP Endpoint
      |
      v
User Service Provider
      |
      v
User Repository Provider
      |
      v
Database Session Provider
```

FastAPI can resolve this dependency graph.

This allows an endpoint to declare the capability it needs without manually constructing every collaborator inside the endpoint.

### 7.3 Request-scoped database sessions

A common pattern is to provide a database session through a dependency that manages its lifetime.

The following is illustrative SQLAlchemy-style code; the engine and session factory must be configured elsewhere.

```python
from collections.abc import Generator
from sqlalchemy.orm import Session, sessionmaker

# Configured during application initialization.
SessionLocal = sessionmaker()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
```

The `yield` dependency allows FastAPI to provide the session to a dependent operation and perform cleanup when the dependency's lifecycle ends.

The exact transaction behavior should be defined deliberately. Creating and closing a session does not automatically determine when a business transaction should commit, how errors should be handled, or whether a workflow spans multiple transactions.

For production use, engineers must also consider:

- Commit and rollback policies.
- Connection-pool configuration.
- Request cancellation.
- Streaming responses and resource lifetime.
- Background tasks that outlive a request.
- Whether a session is safe to use in the relevant concurrency model.

### 7.4 Dependency overrides in tests

FastAPI allows dependencies to be overridden in tests.

For example, a test can provide a fake service instead of using the normal provider:

```python
from fastapi.testclient import TestClient


class FakeUserService:
    def get_user(self, user_id: int) -> dict:
        return {"id": user_id, "name": "Test User"}


def get_fake_user_service() -> FakeUserService:
    return FakeUserService()


app.dependency_overrides[get_user_service] = (
    get_fake_user_service
)

client = TestClient(app)


def test_read_user():
    response = client.get("/users/42")

    assert response.status_code == 200
    assert response.json() == {
        "id": 42,
        "name": "Test User",
    }
```

After the test, overrides should be cleared or restored so they do not leak into other tests:

```python
app.dependency_overrides.clear()
```

In a larger test suite, fixtures should manage overrides and cleanup reliably, particularly when multiple tests use different application configurations.

### 7.5 When FastAPI's dependency system helps

It is useful for:

- Supplying request handlers with services.
- Managing request-related resources.
- Reusing authentication or authorization dependencies.
- Sharing common dependency providers.
- Overriding dependencies during tests.
- Expressing a dependency graph declaratively.

Do not move all application construction into FastAPI-specific dependencies by default. Domain and application components should remain usable outside HTTP request handling when their responsibilities require it, such as in background jobs or command-line tasks.

---

## 8. Dependency Injection and Testing

Testing is one of the most practical reasons to introduce dependency injection.

A component that constructs real infrastructure internally can be difficult to test independently. A component that receives its collaborators can be supplied with controlled implementations.

### 8.1 Test with a fake dependency

Consider:

```python
class FakeOrderRepository:
    def __init__(self):
        self.orders = {
            101: {"id": 101, "total": 250.0},
        }

    def get_by_id(self, order_id: int):
        return self.orders.get(order_id)


class FakePaymentGateway:
    def __init__(self):
        self.charged_amounts = []

    def charge(self, amount: float) -> None:
        self.charged_amounts.append(amount)
```

A test can supply these implementations to `OrderService`:

```python
def test_pay_for_order():
    repository = FakeOrderRepository()
    gateway = FakePaymentGateway()

    service = OrderService(repository, gateway)

    service.pay_for_order(101)

    assert gateway.charged_amounts == [250.0]
```

The test verifies the interaction between the workflow and its collaborators without contacting a real payment provider or database.

### 8.2 Fake, stub, and mock are not identical

These terms describe different testing techniques.

- **Stub:** Supplies predetermined responses.
- **Fake:** Provides a simplified working implementation, such as an in-memory repository.
- **Mock:** Records or verifies interactions against expectations.

All can be supplied through dependency injection when appropriate.

The correct choice depends on what the test needs to establish.

For example, a fake repository is useful when testing business behavior against in-memory data. A mock may be useful when verifying that a payment gateway is invoked with a particular amount. Neither replaces integration tests that verify the actual database or provider integration.

### 8.3 Avoid testing only implementation details

Dependency injection makes interactions easy to observe, but a test can still be poorly designed.

For example, a test that verifies every internal method call may fail after a harmless refactoring even though the externally observable behavior remains correct.

Prefer tests that establish required behavior and important collaboration contracts rather than overfitting to a specific internal call sequence.

### 8.4 DI does not eliminate the need for integration tests

A fake repository cannot prove that a SQL query is correct. A fake payment gateway cannot prove that provider authentication works. A mocked embedding provider cannot prove that the production model returns the expected vector dimensions.

Use different test levels for different risks:

- Unit tests for isolated behavior.
- Integration tests for interactions with real components.
- Contract tests where implementations must satisfy a shared contract.
- End-to-end tests for critical workflows.

Dependency injection makes it easier to select implementations for different test levels. It does not determine which tests are necessary.

---

## 9. Dependency Lifecycles and Resource Management

Injecting a dependency is only part of the problem. Engineers must also determine when it is created, whether it is shared, and when its resources are released.

A dependency may contain:

- Database connections or session factories.
- HTTP connection pools.
- Cached data.
- Mutable request state.
- Authentication context.
- Expensive model clients.
- Background tasks.

Choosing the wrong lifecycle can cause correctness, performance, or security problems.

### 9.1 Transient dependencies

A transient dependency is created for a particular construction request rather than being intentionally shared as a long-lived instance.

Potential uses include small stateless objects whose construction cost is low.

However, creating an expensive client for every request may waste resources. The term "transient" should describe a deliberate lifecycle policy, not an automatic preference.

### 9.2 Singleton or application-scoped dependencies

An application-scoped dependency is created once for the application or worker process and reused.

Examples may include:

- A configured HTTP client with a connection pool.
- A database engine or session factory.
- A model client designed for concurrent use.
- Immutable application configuration.

Application-scoped objects must be safe to share for their intended use.

A shared mutable object can introduce race conditions, cross-request data leakage, or other concurrency problems if its state is not managed correctly.

A singleton is usually singleton **within a particular container or process**, not automatically across all application workers or machines.

### 9.3 Request-scoped dependencies

A request-scoped dependency is associated with a particular request lifecycle.

Examples include:

- A database session intended for one request.
- Request-specific authorization context.
- Correlation or tracing information.
- Request-local state.

Request-scoped resources should not accidentally outlive their intended scope.

For example, a background task that runs after the request has completed should not rely on a database session that has already been closed.

### 9.4 Scope is a correctness decision

| Lifecycle | Typical use | Important consideration |
|---|---|---|
| Transient | Lightweight, independently created objects | Avoid unnecessary construction overhead. |
| Application-scoped | Shared clients, configuration, reusable infrastructure | Ensure concurrency safety and controlled shutdown. |
| Request-scoped | Request-specific state and resources | Ensure cleanup and avoid use after the request lifecycle. |
| Operation-scoped | Resources tied to a particular workflow or transaction | Define when the operation starts, completes, or rolls back. |

The exact names and semantics differ between frameworks. Always verify the lifecycle behavior of the framework or container being used.

### 9.5 Resource cleanup

Some dependencies require explicit cleanup:

- Database sessions must be closed.
- HTTP clients may need to be closed at shutdown.
- Files must be closed.
- Locks must be released.
- Temporary resources may need deletion.

A dependency provider or lifecycle manager should make cleanup explicit and reliable, including when exceptions occur.

For production systems, lifecycle design should also account for application shutdown, request cancellation, failed initialization, and partial resource construction.

---

## 10. Dependency Injection Containers

Manual dependency injection works well when the dependency graph is small and straightforward.

As an application grows, constructing and connecting all dependencies manually may become repetitive.

A **dependency injection container** is a mechanism that manages dependency registration, resolution, and sometimes object lifecycles.

Conceptually, a container may be configured with mappings such as:

```text
UserRepository -> PostgreSQLUserRepository
PaymentGateway -> ConfiguredPaymentGateway
UserService -> UserService(UserRepository)
```

When the application requests `UserService`, the container resolves its required dependencies and constructs the object graph according to the configuration.

### 10.1 What a container can provide

Depending on the implementation, a container may support:

- Dependency registration.
- Automatic construction.
- Lifetime and scope management.
- Configuration of implementation choices.
- Reuse of shared instances.
- Validation of missing dependencies.
- Lifecycle cleanup.

Not every container provides every capability. Some use explicit registrations, while others rely on reflection, annotations, or conventions.

### 10.2 Manual wiring versus a container

| Consideration | Manual dependency injection | DI container |
|---|---|---|
| Simplicity | Often best for small graphs | May add unnecessary machinery for small applications |
| Visibility | Construction is explicit in code | Construction may be distributed across registrations and conventions |
| Repetition | Can grow as dependencies multiply | Can centralize repeated wiring |
| Lifecycle management | Must be implemented deliberately | May provide lifecycle support |
| Debugging | Usually straightforward for small graphs | Resolution failures may be harder to trace |
| Flexibility | Explicit control | Depends on container features and configuration |

A container is an implementation choice, not a prerequisite for DI.

### 10.3 When to introduce a container

Consider one when:

- The dependency graph is large.
- Construction logic is repetitive.
- Multiple application configurations require different implementations.
- Resource lifecycles are complex.
- A framework already provides a well-understood container that solves the problem.

Avoid introducing one simply because a large production application is expected to use a framework.

Start with explicit construction. Introduce container behavior when the benefits justify its abstraction and operational cost.

---

## 11. Common Anti-Patterns and Failure Modes

### 11.1 Service locator

A service locator is an object or registry from which a component retrieves its dependencies when needed.

For example:

```python
class UserService:
    def get_user(self, user_id: int):
        repository = ServiceLocator.get("user_repository")
        return repository.get_by_id(user_id)
```

This hides the dependency inside the method. The constructor does not reveal that the service requires a repository.

The caller must know that the service locator is configured correctly, and tests must configure the registry before calling the service.

A service locator can be appropriate in limited infrastructure contexts, but using it as the default application dependency mechanism often makes dependencies less explicit.

Compare it with constructor injection:

```python
class UserService:
    def __init__(self, repository):
        self.repository = repository
```

The second form makes the required dependency visible at construction time.

### 11.2 Excessive injection

A constructor with a very large number of unrelated dependencies may indicate that a class has accumulated too many responsibilities.

The solution is not necessarily to hide the dependencies inside a container. First investigate whether the component should be divided into smaller, more coherent responsibilities.

A container can simplify construction while leaving the underlying design problem unchanged.

### 11.3 Circular dependencies

A circular dependency occurs when components depend on each other in a cycle.

For example:

```text
UserService -> NotificationService
      ^              |
      |______________|
```

Perhaps `UserService` sends notifications, while `NotificationService` calls back into `UserService` to retrieve user details.

This can complicate construction, testing, and reasoning about behavior.

Possible solutions include:

- Clarifying which component owns the workflow.
- Passing the required data rather than retrieving it through a callback.
- Introducing a more appropriate shared capability.
- Separating coordination from the components being coordinated.
- Using an event-driven interaction when asynchronous decoupling is justified.

Not every cycle can be fixed by adding another interface. The underlying responsibility and dependency relationships must be examined.

### 11.4 Global mutable dependencies

A global repository, client, or service may appear convenient:

```python
global_user_repository = PostgreSQLUserRepository()
```

However, global mutable dependencies can make tests interfere with each other, hide configuration assumptions, and create concurrency risks.

A globally shared immutable configuration object or concurrency-safe client may be entirely appropriate. The problem is uncontrolled global state and unclear lifecycle ownership, not global access as an abstract concept.

### 11.5 Constructing dependencies inside every method

Consider:

```python
class ReportService:
    def generate(self):
        repository = PostgreSQLReportRepository()
        return repository.fetch()
```

Repeated construction may be inefficient and makes substitution difficult.

However, some resources are intentionally created for each operation. The decision should reflect the required lifecycle and resource cost.

### 11.6 Injecting dependencies that are not needed

A class should not receive a dependency merely because another class has it.

Unused dependencies increase construction complexity and may indicate that responsibilities or interfaces are too broad.

### 11.7 Confusing injection with testability

A component can receive dependencies and still be difficult to test if its behavior is complex, its contracts are unclear, or it relies on uncontrolled global state.

DI supports testability, but good tests still require clear behavior, controlled inputs, and appropriate test boundaries.

---

## 12. Production Engineering Considerations

Dependency injection becomes more important as systems incorporate databases, external APIs, background workers, and AI services.

### 12.1 Configuration and secrets

Dependencies often require configuration such as endpoint URLs, timeouts, connection settings, or credentials.

Construct and configure these dependencies at an appropriate application boundary. Keep secrets in an appropriate secret-management mechanism rather than embedding them in source code or exposing them through ordinary logs.

Injected objects should receive only the configuration and authority they actually need.

### 12.2 External client configuration

An injected HTTP or AI client may require:

- Connection and read timeouts.
- Retry policies.
- Connection pooling.
- Rate limits.
- Authentication.
- Telemetry.
- Controlled shutdown.

These settings should be consistent with the client's intended lifecycle.

Creating a new network client per request may discard connection-pooling benefits. Sharing one client across concurrent requests may be inappropriate if the client is not designed for concurrent use.

### 12.3 Error handling

A dependency contract should make important failure behavior explicit.

For example, a repository might distinguish between:

- A record that does not exist.
- A temporary database failure.
- A uniqueness conflict.
- An invalid request.
- An operation whose completion is uncertain.

The consuming service must handle these outcomes according to the business requirements.

DI can make failure behavior easier to test by supplying implementations that simulate specific failures.

### 12.4 Observability

Injected clients and services may need consistent logging, tracing, and metrics.

Avoid adding observability by scattering unrelated instrumentation through every business operation. Instead, decide which behavior belongs in the application workflow, which belongs in the infrastructure client, and which belongs in the surrounding runtime.

The correct boundary depends on what needs to be measured and how the system is operated.

### 12.5 Background tasks and workers

A web request and a background job may require the same business service but have different resource lifecycles.

Do not assume that a dependency created for an HTTP request can safely be reused by a worker after the request completes.

Construct or retrieve dependencies according to the worker's lifecycle, and ensure that sessions, clients, and request-specific state do not cross boundaries unintentionally.

### 12.6 AI and GenAI applications

Dependency injection is especially useful when an application may need to substitute AI infrastructure components.

Examples include:

- Embedding providers.
- Vector database clients.
- LLM providers.
- Reranking models.
- Retrieval implementations.
- Evaluation clients.
- Object storage.
- Telemetry exporters.

For example, a matchmaking service may depend on an embedding capability instead of directly constructing a specific provider's client.

A test can supply a deterministic fake embedding implementation. A deployment can supply the configured production provider.

This does not mean every AI component requires an interface. If an implementation is stable and there is no meaningful need for substitution, a direct dependency may be simpler. The abstraction should reflect a real capability or boundary.

---

## 13. Practical Engineering Workflow

Use this workflow when deciding how to introduce dependency injection into an existing codebase.

### Step 1: Identify an actual construction problem

Look for components that construct infrastructure internally, repeatedly initialize expensive resources, or are difficult to test without real external systems.

### Step 2: Identify the dependency contract

Determine what behavior the consumer needs.

Do not expose a concrete implementation's entire API if the consumer only requires a smaller capability.

### Step 3: Choose an injection method

Use constructor injection for required dependencies, method injection for operation-specific dependencies, and setter injection only when post-construction configuration is justified.

### Step 4: Establish a composition root

Choose where concrete implementations should be created and connected.

Keep construction separate from the business operations that use those implementations.

### Step 5: Define the lifecycle

Determine whether each dependency is transient, shared for the application, scoped to a request, or tied to a particular operation.

Include cleanup and concurrency considerations.

### Step 6: Test the consumer independently

Supply a fake, stub, or mock where appropriate and verify the component's behavior.

Do not replace all integration testing with mocks.

### Step 7: Validate the real integration

Verify that the concrete implementation satisfies the expected contract and handles relevant failures.

### Step 8: Evaluate the added complexity

Ask whether DI actually improved construction, testability, or implementation flexibility.

If the resulting code requires a complex container for a tiny dependency graph, simplify the design.

---

## 14. Chapter Summary

Dependency injection separates the creation of dependencies from the components that use them.

It helps make dependencies explicit, supports controlled substitution, and can improve testing and lifecycle management.

The key lessons are:

1. Components need dependencies; the design question is how those dependencies are selected, supplied, and managed.
2. Constructor injection is generally the clearest default for required dependencies.
3. Setter injection is useful only when post-construction configuration is justified.
4. Method injection works well for dependencies needed by specific operations.
5. Manual wiring is dependency injection and is often sufficient for small applications.
6. Dependency injection and dependency inversion are different concepts.
7. A dependency injection container is optional and should be introduced only when its benefits justify its complexity.
8. Object lifecycles, concurrency safety, cleanup, and error behavior are part of dependency management.
9. Test doubles help verify component behavior, but integration tests remain necessary.
10. Dependency injection does not compensate for poor responsibilities or unclear contracts.

The objective is not to use DI everywhere. It is to manage dependencies deliberately so that components remain understandable, testable, and appropriately independent.

---

## 15. Revision Checklist

Before moving to the next chapter, confirm that you can:

- [ ] Explain dependency injection without defining it as a framework feature.
- [ ] Distinguish dependency injection from the Dependency Inversion Principle.
- [ ] Identify problems caused by constructing dependencies inside business components.
- [ ] Implement constructor, setter, and method injection.
- [ ] Wire a small object graph manually.
- [ ] Explain the role of a composition root.
- [ ] Explain how FastAPI resolves dependencies and supports test overrides.
- [ ] Choose appropriate dependency lifecycles.
- [ ] Identify the risks of service locators, circular dependencies, and global mutable state.
- [ ] Explain why DI does not automatically guarantee testability or low coupling.
- [ ] Decide when a container is justified.
- [ ] Describe how you would test a consumer using a fake dependency and verify the real integration separately.

### Teaching check

Consider a FastAPI application in which every request constructs a new database engine, a new HTTP client, and a new LLM client. Some endpoints also instantiate their own repositories, while background jobs reuse objects created during HTTP requests.

Explain:

1. Which construction and lifecycle problems are present?
2. Which resources might be appropriate to share, and which should remain request- or operation-scoped?
3. Where would you establish the composition root or dependency providers?
4. How would you prevent background jobs from using expired request resources?
5. Which dependencies would you make replaceable for testing?
6. Would you introduce a DI container, or would FastAPI's dependency system and manual wiring be sufficient? Justify your choice.

A strong answer should distinguish construction from lifecycle management, account for concurrency and cleanup, and justify the complexity of the proposed solution.

---

## 16. Further Reading Within This Module

Continue in the approved chapter order:

1. [07 — Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md)
2. [08 — Design Patterns](08-Design-Patterns/README.md)
3. [09 — Refactoring](09-Refactoring.md)

For the complete module structure and learning path, see [README.md](README.md).

---

*End of Chapter 06 — Dependency Injection.*
