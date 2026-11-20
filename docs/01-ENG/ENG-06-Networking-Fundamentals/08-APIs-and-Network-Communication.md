# APIs and Network Communication

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain what an API is and why applications need one.
- Distinguish an API from a network protocol and an API implementation.
- Understand how APIs enable communication between independent software components.
- Identify the responsibilities of API clients and API servers.
- Explain API contracts, endpoints, operations, inputs, and outputs.
- Understand synchronous and asynchronous communication at the application level.
- Distinguish internal function calls from remote API calls.
- Recognize common API integration failures and design implications.
- Apply these concepts to backend services and external AI integrations.

## 2. Prerequisites

Before starting this chapter, you should understand:

- [Networking Basics](01-Networking-Basics.md)
- [TCP/IP Fundamentals](02-TCP-IP-Fundamentals.md)
- [HTTP Fundamentals](04-HTTP-Fundamentals.md)
- [REST Principles](06-REST-Principles.md)
- [Request/Response Lifecycle](07-Request-Response-Lifecycle.md)

**Estimated reading time:** 25–35 minutes

## 3. Before We Start

Imagine that your backend needs to retrieve a candidate's profile from another service.

Your application needs to know:

- What operation the service supports.
- How to identify the operation.
- What input the operation requires.
- What result it returns.
- What errors might occur.
- What authentication or access requirements apply.

Your backend should not need to understand the other service's entire internal implementation.

It needs a defined interface through which the two systems can interact.

**An API provides a defined interface through which one software component can use the capabilities or data exposed by another component.**

When the components communicate across a network, the API contract and the network communication mechanisms work together to make that interaction possible.

## 4. What Is an API?

API stands for **Application Programming Interface**.

An API defines how one software component can interact with another.

An API can exist entirely within a program, between libraries, or across a network.

Examples include:

- A Python library API.
- A database client API.
- An operating-system API.
- A backend HTTP API.
- An external LLM provider's API.
- An internal service interface used by multiple backend components.

An API is an interface contract, not necessarily a network connection.

For example, calling a Python function in the same process uses an API but does not normally require network communication.

Calling a remote HTTP endpoint also uses an API, but the interaction additionally depends on networking, transport, and application protocols.

### 4.1 The Basic Mental Model

Consider two independent services:

```text
Service A
    |
    | Uses an exposed interface
    v
    API Contract
    |
    | Implemented by
    v
Service B
```

Service A needs to understand the interface Service B exposes. It does not necessarily need to know how Service B stores data, structures its internal code, or executes its business logic.

This separation allows each service to evolve independently, provided that the interface remains compatible with its consumers.

### 4.2 API vs Implementation

Suppose a service exposes this operation:

```text
GET /candidates/42
```

The API contract might specify that the operation returns a candidate representation when the caller is authorized and the candidate exists.

The implementation might:

1. Validate the request.
2. Check authorization.
3. Query a database.
4. Transform the retrieved data.
5. Construct the response.

The caller depends on the documented behavior, not necessarily on these internal steps.

The implementation can change from a direct database query to a cache-backed lookup without requiring a client change, provided the external contract remains compatible.

**Engineering principle:** Keep the public interface separate from the internal implementation wherever practical.

## 5. API vs Protocol vs Endpoint

These terms are related but describe different things.

| Term | Meaning | Example |
|---|---|---|
| API | The interface and contract through which a component exposes capabilities | Candidate-management API |
| Protocol | Rules governing communication between components | HTTP |
| Endpoint | A particular addressable interface location or operation, depending on context | `GET /candidates/42` |
| Implementation | The code that provides the interface's behavior | A FastAPI route handler |
| Client | A component that consumes the interface | A mobile application |
| Server | A component that provides the interface | A backend service |

An endpoint is often described by its HTTP method and path. However, the exact meaning of *endpoint* varies by context: it can also refer to a network address or a service destination.

### 5.1 How They Work Together

Suppose a Python backend calls an external service.

```text
Python Application
       |
       | API contract
       v
HTTP client library
       |
       | HTTP protocol
       v
Network connection
       |
       v
Remote API server
       |
       v
Service implementation
```

The API contract defines the expected operation and result.

HTTP defines the application-level communication semantics. The applicable transport and security mechanisms carry the messages.

The remote service implementation performs the requested operation.

These responsibilities are related but should not be confused.

## 6. Anatomy of a Network API

A network API needs enough information for a client to address an operation, communicate its input, and interpret the result.

For an HTTP-based API, important elements commonly include the following.

### 6.1 Base URL

The base URL identifies the service location used by the client.

For example:

```text
https://api.example.com
```

An application might combine this with a resource path:

```text
https://api.example.com/candidates/42
```

The base URL may differ between development, testing, and production environments.

### 6.2 Operation

The operation describes what the client wants to accomplish.

For an HTTP API, the method and request target contribute to identifying the operation.

Examples:

```http
GET /candidates/42
```

```http
POST /candidates
```

The API contract defines the expected behavior of each supported operation.

### 6.3 Inputs

Inputs can be provided through different parts of a request:

- Path parameters.
- Query parameters.
- Headers.
- Request body.
- Authentication credentials or tokens.

For example:

```http
GET /candidates?city=Pune&limit=20
```

The query parameters communicate filtering and pagination preferences if the API contract defines them that way.

A request body might carry structured data for creating or updating a resource.

Not every API operation uses every input mechanism.

### 6.4 Outputs

The response can contain:

- A result representation.
- A status code.
- Response headers.
- Error details.
- References to another resource or operation.

For example:

```json
{
  "id": 42,
  "name": "Asha",
  "city": "Pune"
}
```

The API contract should define the meaning and expected structure of the result.

The client should not assume that every response is successful or contains the same fields.

### 6.5 Errors

An API contract should explain how failures are communicated.

Possible failures include:

- Invalid input.
- Missing resources.
- Authentication or authorization failures.
- Rate limiting.
- Temporary service unavailability.
- Unexpected server errors.

HTTP APIs commonly use status codes alongside structured error representations.

For detailed HTTP status semantics, refer to [HTTP Fundamentals](04-HTTP-Fundamentals.md).

## 7. API Contracts

An API contract describes the behavior that consumers can rely on.

It commonly specifies:

- Available operations.
- Request parameters and their types.
- Required and optional fields.
- Response structures.
- Error behavior.
- Authentication requirements.
- Relevant limits and constraints.
- Compatibility expectations.

A contract allows the client and server to be developed independently.

### 7.1 Why Contracts Matter

Suppose a client expects this response:

```json
{
  "id": 42,
  "name": "Asha"
}
```

The server later changes the field from `name` to `full_name` without preserving compatibility.

The client may fail even though the server itself is running correctly.

The problem is a contract incompatibility, not necessarily a networking failure.

A well-managed API makes changes deliberately and considers their effects on existing consumers.

### 7.2 API Documentation

API documentation describes the contract in a form developers can understand and use.

It may include:

- Endpoint descriptions.
- Request and response examples.
- Authentication instructions.
- Error definitions.
- Parameter constraints.
- Versioning information.

For HTTP APIs, OpenAPI is a commonly used specification format for describing interfaces.

FastAPI can generate OpenAPI descriptions from application definitions, helping developers document and explore supported operations.

Documentation should describe actual behavior. A generated schema does not guarantee that every runtime behavior or business rule has been documented accurately.

### 7.3 Contract vs Documentation

The contract is the behavior and compatibility agreement that consumers rely on.

Documentation is one way to describe that contract.

An implementation can have documentation that is incomplete or out of date. Therefore, production engineering often combines documentation with automated tests and compatibility checks.

## 8. API Client and API Server

A client consumes an API. A server provides it.

These roles describe responsibilities in a particular interaction; they do not necessarily describe an application's permanent identity.

A backend can be a server for one request and a client for another.

### 8.1 API Client

The client is responsible for making requests according to the contract and interpreting the result.

Its responsibilities commonly include:

- Constructing valid requests.
- Providing required input.
- Supplying credentials where required.
- Applying timeout policies.
- Interpreting responses.
- Handling documented errors.
- Avoiding unsafe retry behavior.

A client should not assume that a remote service is always available or that every request succeeds.

### 8.2 API Server

The server is responsible for exposing the interface and implementing its contract.

Its responsibilities commonly include:

- Receiving and validating requests.
- Enforcing authentication and authorization.
- Executing the requested operation.
- Interacting with dependencies.
- Returning appropriate responses.
- Applying relevant security and resource limits.

The server should communicate failures through the documented interface where possible.

### 8.3 One Service Can Be Both

Consider a backend that exposes a candidate API and calls an external LLM API.

```text
Mobile Application
       |
       | Candidate API request
       v
Backend Service
       |
       | External LLM API request
       v
LLM Provider
```

In this interaction:

- The backend is the server for the mobile application.
- The backend is the client for the LLM provider.

This is common in service-oriented and distributed systems.

## 9. Local API Calls vs Network API Calls

Not every API call crosses a network.

### 9.1 Local Function Call

Consider:

```python
def calculate_score(semantic_score, age_score):
    return 0.8 * semantic_score + 0.2 * age_score

score = calculate_score(0.9, 0.7)
```

The caller invokes a function within the same running process.

The program uses an interface, but it does not need DNS resolution, a remote transport connection, or HTTP message exchange for this call.

### 9.2 Remote API Call

Now consider:

```python
import requests

response = requests.get(
    "https://api.example.com/candidates/42",
    timeout=10,
)
```

This interaction crosses a network boundary.

It introduces concerns that a local function call does not normally have:

- Network latency.
- Connection failures.
- Remote service availability.
- Timeouts.
- Authentication across service boundaries.
- Response validation.
- Retry behavior.
- Compatibility between independently deployed components.

### 9.3 Why This Difference Matters

A local function call typically returns control within the same process, subject to the program's execution behavior.

A remote call depends on another component and the communication path between them.

Even if a remote API looks like a simple function call in the code, it should be treated as a potentially unreliable interaction.

**Engineering principle:** Do not assume that remote calls have the same latency, failure behavior, or reliability characteristics as local function calls.

## 10. Synchronous and Asynchronous API Communication

API interactions can use different execution models.

At a high level, synchronous communication waits for a result before the caller continues with the dependent operation. Asynchronous communication allows the caller to initiate work without necessarily waiting for the entire operation to finish.

These terms describe interaction and execution behavior. They do not automatically identify a specific network protocol.

### 10.1 Synchronous Request/Response

Consider a client retrieving a candidate profile.

```text
Client
  |
  | Request profile
  v
Backend
  |
  | Retrieve profile
  v
Database
  |
  | Result
  v
Backend
  |
  | Response
  v
Client
```

The client waits for the response before it can use the returned profile in the next dependent step.

This model is suitable when the result is needed immediately.

However, the caller must account for latency, timeouts, and service failures.

### 10.2 Asynchronous Work

Suppose the backend needs to process a large document or execute a long-running analysis.

Instead of holding a request open until all work is finished, the API may accept the job and return an identifier.

```text
Client
  |
  | Submit job
  v
Backend
  |
  | Accept job
  v
Job Queue / Worker
  |
  | Process asynchronously
  v
Result Store
```

The client may then check the job's status or retrieve the result later.

An HTTP API can support this pattern. Asynchronous processing does not necessarily mean that the API stops using HTTP.

### 10.3 Choosing the Interaction Model

| Consideration | Synchronous interaction | Asynchronous work |
|---|---|---|
| Result availability | Usually returned during the request | May become available later |
| Caller waiting | Waits for the operation's result | Can continue after submission |
| Typical use | Profile retrieval or quick validation | Long-running processing or background jobs |
| Main concern | Latency and timeout behavior | Job tracking, status, failures, and eventual completion |

Choose the interaction model according to the operation's duration, user experience, reliability requirements, and business semantics.

Do not introduce asynchronous infrastructure without a real need. It adds complexity, including job state, retries, and failure recovery.

## 11. API Communication Across Services

Distributed applications commonly divide responsibilities among multiple services.

For example:

```text
Client
  |
  v
Backend API
  |
  +------> Profile Service
  |
  +------> Matching Service
  |
  +------> Notification Service
```

Each service exposes an interface that other components can consume.

This can improve separation of responsibilities, but it also introduces distributed-system concerns.

### 11.1 Service Independence

A service should expose a stable interface so consumers do not need to depend on its internal implementation.

For example, the matching service may change its ranking algorithm while preserving the request and response contract.

Consumers can continue using the API without knowing how the ranking logic works internally.

### 11.2 Failure Propagation

A request can fail because a downstream service is unavailable, even when the entry-point service is healthy.

For example:

```text
Client
  |
  v
Backend API
  |
  v
Matching Service
  |
  v
Database
```

If the database is unavailable, the matching service may fail to complete its work. That failure can propagate to the backend API and ultimately affect the client.

Each service boundary introduces a possible point of delay or failure.

### 11.3 Dependency Awareness

A service should understand which dependencies are necessary for a given operation.

For example, a profile endpoint might require the profile database but not the notification service.

If the notification service is unavailable, it may be unnecessary to fail an otherwise valid profile retrieval operation.

This is a domain and architecture decision, not a universal rule.

**Engineering principle:** Avoid making an operation depend on components that are not required to fulfill its contract.

## 12. API Reliability Considerations

Remote APIs cannot guarantee that every request succeeds. Client and server designs must account for failures.

### 12.1 Timeouts

A timeout limits how long a client waits for a relevant operation.

Without appropriate timeouts, a client may wait indefinitely or consume resources for too long.

However, a timeout does not prove that the server never received or processed the request.

### 12.2 Retries

Retries can help recover from transient failures, but repeating an operation may cause duplicate effects.

For example, retrying a request that creates a payment or submits an order can be dangerous if the original operation completed but the response was lost.

The retry policy must account for the operation's semantics and any deduplication or idempotency mechanism provided by the API.

### 12.3 Rate Limits

An API may limit the number of requests a client can make within a period.

Rate limits help protect service capacity and allocate resources.

Clients should respect the documented limits and handle rate-limit responses appropriately instead of retrying aggressively.

### 12.4 Error Contracts

Clients need to know how an API reports errors so they can decide whether to correct input, request authentication, wait before retrying, or report a failure.

A useful error contract distinguishes different failure categories and avoids exposing unnecessary sensitive implementation details.

### 12.5 Version Compatibility

An API change can break clients even when network communication is working correctly.

For example, removing a required response field can cause a client to fail during response processing.

Versioning strategies, compatibility rules, and contract tests help reduce these risks.

These considerations are foundational to dependable API integration. Advanced production monitoring and reliability implementation belong to the production engineering domain.

## 13. API Security Boundaries

An API is an interface through which capabilities or data are exposed. The interface must be designed with security boundaries in mind.

### 13.1 Authentication

Authentication establishes or verifies the identity of the caller.

Depending on the system, this can involve access tokens, API keys, client certificates, or other mechanisms.

The chosen mechanism should match the application's requirements and threat model.

### 13.2 Authorization

Authorization determines whether the authenticated caller may perform a particular operation.

For example, a user may be allowed to retrieve their own profile but not another user's private information.

The server must enforce these rules. Hiding an endpoint in the frontend is not a substitute for server-side authorization.

### 13.3 Transport Security

HTTPS protects communication in transit when correctly configured.

It does not automatically authenticate the user or grant permission to access resources.

For transport-security details, refer to [HTTPS Fundamentals](05-HTTPS-Fundamentals.md).

### 13.4 Input Validation

The server must validate inputs according to the API contract and business rules.

A well-formed request can still contain invalid or unauthorized data.

For example, an integer profile ID may be syntactically valid but refer to a resource the caller is not allowed to access.

**Engineering principle:** Treat API inputs as untrusted, validate them, and enforce authorization at the server boundary.

## 14. Common Mistakes

### Mistake 1: Treating an API as a Network Protocol

An API defines an interface and expected behavior. HTTP is a protocol that can carry requests to a network API.

**Correction:** Separate interface contracts from the communication mechanisms used to implement them.

### Mistake 2: Assuming Every API Call Uses a Network

Local functions and libraries expose APIs without requiring network communication.

**Correction:** Identify whether the interface is local or remote before reasoning about its failure and latency characteristics.

### Mistake 3: Assuming a Remote API Call Is Like a Local Function Call

Remote calls can fail because of network problems, timeouts, service outages, and contract mismatches.

**Correction:** Design remote integrations to handle failures explicitly.

### Mistake 4: Depending on Undocumented Response Fields

A client may accidentally rely on behavior that the API contract does not guarantee.

**Correction:** Use documented fields and compatibility guarantees, and validate responses where appropriate.

### Mistake 5: Retrying Every Failed Request

A retry may repeat an operation that already succeeded on the server.

**Correction:** Consider idempotency, operation semantics, and duplicate-effect prevention.

### Mistake 6: Assuming HTTPS Makes an API Secure by Itself

Transport security does not replace authentication, authorization, input validation, or secure business logic.

**Correction:** Evaluate each security boundary independently.

### Mistake 7: Making Every Service Dependency Mandatory

A nonessential dependency can cause an otherwise valid operation to fail.

**Correction:** Identify which dependencies are genuinely required by each operation.

### Mistake 8: Treating API Documentation as a Guarantee of Runtime Behavior

Documentation can be incomplete or out of date.

**Correction:** Keep the contract, implementation, tests, and documentation aligned.

## 15. Interview Questions and Expected Answers

### Q1. What is an API?

An API is a defined interface through which one software component can use the capabilities or data exposed by another component.

### Q2. What is the difference between an API and a protocol?

An API defines the interface and expected behavior. A protocol defines communication rules. An HTTP API uses HTTP as its application-level communication protocol.

### Q3. Can an API exist without a network?

Yes. Local functions, libraries, and operating-system interfaces expose APIs without necessarily communicating across a network.

### Q4. What is an API contract?

An API contract defines the operations, inputs, outputs, errors, and other behavior that consumers can rely on.

### Q5. What is the difference between an API client and an API server?

The client consumes an interface, while the server provides it. A backend can act as a client for one service and a server for another.

### Q6. What is the difference between synchronous and asynchronous communication?

Synchronous interaction typically waits for a result before continuing with the dependent operation. Asynchronous work allows the caller to initiate work without necessarily waiting for completion.

### Q7. Why are remote API calls less predictable than local function calls?

Remote calls depend on networking, transport connections, remote service availability, and communication contracts. They can time out or fail independently of the local process.

### Q8. Why are timeouts necessary for API clients?

Timeouts bound how long the client waits for an operation and help prevent indefinite waiting. They do not guarantee that the server stopped processing the request.

### Q9. Why can retries create duplicate operations?

The original request may have completed even though the client did not receive the response. Repeating a non-idempotent operation can produce duplicate effects.

### Q10. How should API contracts be managed when services evolve independently?

Define compatibility expectations, document changes, test consumer assumptions, and avoid breaking existing behavior without an appropriate migration strategy.

### Q11. Does HTTPS provide authorization?

No. HTTPS protects communication in transit. Authorization is an application-level decision about what a caller is permitted to do.

### Q12. Why is it useful to separate an API from its implementation?

It allows the implementation to evolve without forcing changes on consumers, provided the externally observable contract remains compatible.

## 16. Quick Revision

- **API:** Interface through which a software component exposes capabilities or data.
- **Protocol:** Rules governing communication between components.
- **Endpoint:** An addressable API operation or destination, depending on context.
- **API contract:** Defines behavior that consumers can rely on.
- **Client:** Consumes an API.
- **Server:** Provides an API.
- **Local API:** Interface used without requiring network communication.
- **Remote API:** Interface accessed across a communication boundary.
- **Synchronous interaction:** Caller waits for the relevant result.
- **Asynchronous work:** Caller can initiate work without necessarily waiting for completion.
- **Timeout:** Bounds how long a client waits.
- **Retry:** Repeats an operation and must account for possible duplicate effects.
- **Rate limit:** Restricts request volume according to a defined policy.
- **Authentication:** Establishes or verifies identity.
- **Authorization:** Determines which operations the caller may perform.

## 17. Key Takeaways

1. An API defines an interface; it is not itself necessarily a network protocol.
2. Network APIs commonly combine a contract with HTTP and other communication mechanisms.
3. Clients and servers depend on clear, compatible interface behavior.
4. Local function calls and remote API calls have different latency and failure characteristics.
5. API contracts should define inputs, outputs, errors, and compatibility expectations.
6. Timeouts, retries, and rate limits must be handled according to the operation's semantics.
7. Authentication, authorization, input validation, and transport security solve different problems.
8. Distributed services require careful dependency and failure-boundary design.

## 18. Further Reading

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) — A standard for describing HTTP APIs.
- [FastAPI Documentation](https://fastapi.tiangolo.com/) — Practical API implementation and generated OpenAPI documentation.
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110) — HTTP request and response semantics.
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457) — A standardized format for communicating HTTP API errors.

## 19. Connection to the Next Chapters

This chapter focused on APIs as software interfaces and on the engineering concerns involved in consuming and exposing them.

- [Chapter 09 — Serialization Fundamentals](09-Serialization-Fundamentals.md): How application data is represented for transmission and processing.
- [Chapter 10 — Distributed Communication Basics](10-Distributed-Communication-Basics.md): How to reason about failures across networked components and troubleshoot them systematically.

---
