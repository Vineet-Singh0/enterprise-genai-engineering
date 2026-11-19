# REST Principles

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain what REST is and why it was introduced.
- Distinguish REST from HTTP and from APIs in general.
- Understand the six architectural constraints of REST.
- Explain resources, resource identifiers, representations, and resource-oriented design.
- Understand how HTTP methods support RESTful interactions.
- Distinguish REST from RPC-style API design.
- Evaluate whether an API follows REST principles or merely uses HTTP and JSON.
- Recognize common REST design mistakes.
- Apply REST principles when designing backend interfaces.

## 2. Prerequisites

Before starting this chapter, you should understand:

- [Networking Basics](01-Networking-Basics.md)
- [TCP/IP Fundamentals](02-TCP-IP-Fundamentals.md)
- [HTTP Fundamentals](04-HTTP-Fundamentals.md)
- [HTTPS Fundamentals](05-HTTPS-Fundamentals.md)

**Estimated reading time:** 25–35 minutes

## 3. Before We Start

Imagine that you are building a backend for a matrimonial application.

The application needs to support operations such as:

- Retrieve a candidate profile.
- Register a new candidate.
- Update profile information.
- Delete a profile.
- Retrieve a list of matching candidates.

You could design endpoints like these:

```text
GET    /getUser?id=42
POST   /createUser
POST   /updateUser
POST   /deleteUser
GET    /getMatches?userId=42
```

These endpoints can work. HTTP does not prohibit this design.

However, the interface makes clients learn a different action-oriented endpoint for each operation. Resource identity and operation semantics are not consistently expressed.

An alternative is:

```text
GET    /users/42
POST   /users
PATCH  /users/42
DELETE /users/42
GET    /users/42/matches
```

This design organizes the interface around resources and uses HTTP methods to communicate intended operations.

The second design follows common RESTful conventions more closely.

**REST provides architectural principles for designing networked systems whose components communicate through a uniform interface.**

It is not simply a rule to use HTTP and JSON. It is an architectural style with specific constraints.

## 4. What Is REST?

REST stands for **Representational State Transfer**.

It is an architectural style for distributed hypermedia systems, introduced by Roy Fielding in his doctoral dissertation.

REST describes constraints that shape how components communicate, how resources are identified, and how representations are transferred.

REST is not:

- A programming language.
- A web framework.
- A database technology.
- A serialization format.
- A protocol that replaces HTTP.
- A synonym for every HTTP API.

A RESTful API commonly uses HTTP, but REST itself is an architectural style rather than a particular HTTP method or framework.

### 4.1 The Core Mental Model

Think of a server as exposing resources through a uniform interface.

A client identifies a resource, requests an operation, and receives a representation or another appropriate response.

```text
Client
  |
  | Request a resource or operation
  v
Uniform Interface
  |
  v
Server Application
  |
  | Access or modify application state
  v
Resource Representation / Result
  |
  v
Client
```

The client does not need to know how the server stores the resource internally. It interacts through the interface that the server exposes.

For example, `/users/42` might correspond to a database record, a cached object, a combination of services, or some other internal implementation.

The URI identifies the resource; it does not dictate the server's internal storage design.

## 5. Resources, Identifiers, and Representations

These concepts are central to REST.

### 5.1 What Is a Resource?

A resource is a conceptual entity or piece of information that can be identified and interacted with.

Examples include:

- A user profile.
- A candidate profile.
- A list of matching candidates.
- An order.
- A document.
- A collection of products.

A resource does not have to correspond directly to a database table or row.

For example, a matching-candidates resource may be computed dynamically from preferences, eligibility rules, and ranking logic.

### 5.2 Resource Identifier

A resource identifier identifies the resource being addressed.

In HTTP-based systems, a URI commonly identifies a resource.

Examples:

```text
/users/42
/users/42/matches
/orders/ORD-1001
```

These identifiers express which resources the client wants to interact with.

The identifier does not need to reveal how the server stores or computes the resource.

### 5.3 Representation

A representation is the information about a resource transferred between components.

For example, a server might return the following JSON representation of a user:

```json
{
  "id": 42,
  "name": "Asha",
  "city": "Pune"
}
```

The representation is not necessarily the entire internal resource state.

The server might store additional information such as authentication metadata, audit records, internal identifiers, or private fields that are not exposed to the client.

A representation is the form of the resource information that the server chooses to communicate.

### 5.4 Resource vs Representation

| Concept | Meaning | Example |
|---|---|---|
| Resource | The conceptual entity being addressed | User 42 |
| Identifier | The URI identifying the resource | `/users/42` |
| Representation | The information returned about the resource | JSON containing the user's public profile |

Understanding this distinction prevents a common misconception: a resource is not the same thing as its JSON document.

## 6. The Six REST Architectural Constraints

Fielding's REST architectural style defines six constraints:

1. Client-server
2. Stateless
3. Cache
4. Uniform interface
5. Layered system
6. Code on demand (optional)

Each constraint addresses a particular architectural concern.

### 6.1 Client-Server

The client-server constraint separates responsibilities between the client and the server.

The client focuses on user interaction and presenting information. The server focuses on managing resources, enforcing business rules, and providing the interface.

For example:

```text
Mobile Application
        |
        | HTTP Requests
        v
Backend API
        |
        v
Business Logic and Data Access
```

The client does not need to know how the backend implements database access or matching algorithms.

Similarly, the server does not need to know how the client renders a profile card.

**Why it matters:** Separating responsibilities allows client and server implementations to evolve independently as long as their interface contract remains compatible.

**Trade-off:** A clear boundary requires a well-designed interface. Poorly defined contracts can still tightly couple clients to server implementation details.

### 6.2 Stateless

The stateless constraint requires each request to contain the information necessary for the server to understand and process it in the context of the resource interaction.

The server must not depend on remembering conversational client context from previous requests in order to interpret the current request.

For example, a request might include an access token or other relevant request information so the server can identify the caller.

```text
Request 1: GET /users/42
Request 2: GET /users/43
```

The server should be able to interpret each request without requiring hidden client-specific conversational state from the preceding request.

This does not prohibit storing application data in a database or maintaining other persistent resource state. It concerns the interaction context required to interpret requests.

**Why it matters:** Stateless interactions can make systems easier to scale and recover because requests do not inherently depend on per-client conversational state stored on a particular server instance.

**Trade-off:** Requests may carry repeated context, and the server may need to retrieve relevant application state for each request.

For the HTTP-level meaning of statelessness, see [HTTP Fundamentals](04-HTTP-Fundamentals.md). Here, the focus is on the architectural constraint applied to the system.

### 6.3 Cache

The cache constraint allows responses to be identified as cacheable or non-cacheable.

When a response can safely be reused, caching can reduce repeated computation and network communication.

For example, a public catalogue that changes infrequently may be a good caching candidate.

```text
Client
  |
  | Request catalogue
  v
Cache
  |
  | Cached response available
  v
Client
```

If the response is not available in the cache or cannot be reused safely, the request may need to reach the origin server.

The cache constraint does not mean that every response should be cached.

A personalized profile, private account information, or frequently changing resource may require restrictive caching behavior.

**Why it matters:** Appropriate caching improves performance and reduces load.

**Trade-off:** Incorrect caching can expose private data or return stale information.

### 6.4 Uniform Interface

The uniform-interface constraint is central to REST.

It establishes a consistent way for components to identify resources, interact with them, and communicate representations.

Fielding's formulation includes four interface-related constraints:

- Identification of resources.
- Manipulation of resources through representations.
- Self-descriptive messages.
- Hypermedia as the engine of application state (HATEOAS).

These are related but distinct aspects of the uniform interface.

#### A. Identification of Resources

Resources are identified independently of the representations transferred.

For example:

```text
/users/42
```

identifies a user resource, while the server might return its representation as JSON.

The same resource could potentially be represented in different formats without changing its conceptual identity.

#### B. Manipulation Through Representations

Clients interact with resources through representations and the interface's defined operations.

For example, a client may submit an updated profile representation through an appropriate request.

The server remains responsible for deciding whether the operation is valid and how the resource is changed.

Sending a representation does not automatically grant permission to modify the resource.

#### C. Self-Descriptive Messages

Messages should carry enough information for their intended interpretation through the protocol and applicable metadata.

For example, HTTP methods, status codes, and media types help communicate how a message should be interpreted.

```http
Content-Type: application/json
Accept: application/json
```

The headers communicate media-type information; the API contract and representation provide the application-specific meaning.

#### D. Hypermedia as the Engine of Application State

HATEOAS means that hypermedia controls in representations guide clients through available application transitions.

A response might include links to related resources or permitted next actions:

```json
{
  "id": 42,
  "name": "Asha",
  "links": {
    "self": "/users/42",
    "matches": "/users/42/matches"
  }
}
```

This example illustrates the idea of linking to related resources, but the presence of a custom `links` object alone does not establish full HATEOAS compliance.

In a hypermedia-driven design, clients use the links or controls supplied by the server to discover available transitions rather than relying entirely on hard-coded assumptions about URI construction.

HATEOAS is frequently omitted from APIs that are casually called RESTful. Strict REST claims should account for this constraint rather than treating resource-shaped URLs as sufficient.

**Why the uniform interface matters:** It reduces the need for clients to understand server internals and encourages consistent interaction patterns.

**Trade-off:** A truly uniform interface and hypermedia-driven client can require more design effort than a narrowly tailored action endpoint.

### 6.5 Layered System

The layered-system constraint allows components to communicate through intermediate layers without requiring the client to know the complete internal architecture.

For example:

```text
Client
  |
  v
API Gateway / Proxy
  |
  v
Backend Service
  |
  v
Database
```

The client interacts with the exposed interface. It does not necessarily know whether the request passes through a proxy, gateway, or several internal services.

Intermediate layers can support responsibilities such as security enforcement, routing, caching, and traffic management.

**Why it matters:** Layers can improve separation of responsibilities and allow infrastructure components to evolve independently.

**Trade-off:** Additional layers may introduce latency, operational complexity, and more places where failures can occur.

A layered architecture is a REST constraint, but simply placing a reverse proxy in front of an API does not make the API RESTful.

### 6.6 Code on Demand (Optional)

Code on demand allows a server to extend client functionality by transferring executable code.

For example, a web server might deliver JavaScript that runs in a browser.

The client can gain functionality without requiring every behavior to be implemented in advance in the client application.

This constraint is optional in REST.

Many REST-oriented systems do not use code on demand at all.

**Why it matters:** It can make clients more extensible.

**Trade-off:** Executing downloaded code introduces security, compatibility, and execution-control considerations.

### 6.7 Summary of the Six Constraints

| Constraint | Main purpose |
|---|---|
| Client-server | Separates client and server responsibilities |
| Stateless | Makes each request independently interpretable |
| Cache | Allows appropriate reuse of responses |
| Uniform interface | Establishes consistent resource interaction |
| Layered system | Allows intermediary layers between components |
| Code on demand | Optionally extends client functionality through executable code |

REST is defined by the architectural constraints working together, not by any single convention.

## 7. REST and HTTP Methods

RESTful HTTP APIs commonly use HTTP methods to communicate the intended operation on a resource.

Consider a user resource:

```text
/users/42
```

Typical interactions might include:

```http
GET /users/42
```

Retrieve a representation of the user.

```http
PATCH /users/42
Content-Type: application/json

{
  "city": "Pune"
}
```

Request a partial modification to the user resource.

```http
DELETE /users/42
```

Request deletion of the user resource.

The exact behavior, validation rules, and permissions are defined by the API contract.

HTTP methods provide standardized semantics, while the application defines how those operations apply to its resources.

For the detailed behavior of HTTP methods and status codes, refer to [HTTP Fundamentals](04-HTTP-Fundamentals.md) rather than treating this chapter as a second HTTP reference.

### 7.1 Resource-Oriented Design

A common RESTful design organizes URIs around resources:

```text
/users
/users/42
/users/42/matches
```

Methods then communicate the intended interaction.

An action-oriented design might instead expose:

```text
/getUser
/createUser
/deleteUser
```

Action-oriented interfaces are not inherently invalid. Some operations are naturally commands and do not fit neatly into ordinary resource CRUD operations.

However, for conventional resource interactions, resource-oriented design with consistent HTTP semantics usually produces a clearer and more predictable interface.

### 7.2 Not Every Operation Is CRUD

CRUD means Create, Read, Update, and Delete.

Many business operations go beyond basic CRUD.

Examples include:

- Accepting a match request.
- Approving a payment.
- Submitting a document for review.
- Starting a long-running analysis.
- Cancelling a scheduled task.

These operations may require explicit command resources, state transitions, or domain-specific endpoints.

Do not force every business operation into a simplistic CRUD model. The goal is a coherent interface whose semantics are clear to clients.

## 8. REST vs RPC-Style APIs

REST and Remote Procedure Call (RPC) styles organize interfaces differently.

REST emphasizes resources and a uniform interface.

RPC emphasizes invoking operations or procedures.

Consider the operation of accepting a match request.

An RPC-style endpoint might be:

```text
POST /acceptMatch
```

A resource-oriented alternative might be:

```text
POST /match-requests/123/acceptance
```

The second design expresses the result as a resource associated with a match request. Whether it is the best design depends on the domain and the interface's intended semantics.

Some systems may instead model acceptance as a state transition on the match-request resource.

Neither approach is automatically correct in every situation.

| Aspect | Resource-oriented REST | RPC-style API |
|---|---|---|
| Main organizing idea | Resources and their representations | Operations or procedures |
| Interface | Emphasizes a uniform interface | Emphasizes named operations |
| Typical URI shape | `/users/42` | `/getUser` or `/acceptMatch` |
| Operation semantics | Often expressed through HTTP methods and resource interactions | Often expressed through operation names and request payloads |
| Good fit | Resource-oriented interactions and standardized web interfaces | Explicit commands and procedure-oriented operations |

A system can use HTTP without being RESTful. An RPC API can run over HTTP, and REST-oriented APIs can contain domain-specific operations.

The engineering decision should reflect the domain, client requirements, and operational constraints rather than following a naming convention blindly.

## 9. Does Using HTTP and JSON Make an API RESTful?

No.

An API can use:

- HTTP.
- JSON.
- Resource-shaped URLs.
- Standard HTTP methods.

Yet still fail to satisfy important REST constraints.

For example, consider:

```text
GET /users/42
POST /users/42/update
POST /users/42/delete
```

This API uses HTTP and identifies a user resource, but its interface relies heavily on action-specific endpoints.

Now consider an API that returns:

```json
{
  "id": 42,
  "name": "Asha",
  "links": {
    "self": "/users/42",
    "matches": "/users/42/matches"
  }
}
```

The response includes links, but that alone does not prove the system implements the full REST uniform-interface constraint.

A rigorous evaluation must consider the architectural constraints as a whole, including how clients discover and interact with available application transitions.

In everyday engineering discussions, the term *REST API* is often used more loosely to mean an HTTP API organized around resources. Be clear about whether you mean practical REST-style conventions or strict adherence to Fielding's REST architectural style.

## 10. Applying REST Principles to a Backend

Consider a matrimonial application's candidate-profile interface.

A possible resource structure is:

```text
/candidates
/candidates/42
/candidates/42/matches
/match-requests/123
```

The interface can be designed around these resources.

For example:

| Operation | Example request | Intended outcome |
|---|---|---|
| List candidates | `GET /candidates` | Retrieve a candidate collection |
| Retrieve one candidate | `GET /candidates/42` | Retrieve a candidate representation |
| Create a candidate | `POST /candidates` | Create a candidate resource |
| Update selected fields | `PATCH /candidates/42` | Request a partial update |
| Delete a candidate | `DELETE /candidates/42` | Request resource removal |
| Retrieve matches | `GET /candidates/42/matches` | Retrieve the candidate's match collection |

This table is illustrative. Actual endpoint design should account for privacy, authentication, authorization, data validation, and the domain's lifecycle rules.

### 10.1 Separate Resource Design from Internal Implementation

A client may request:

```text
GET /candidates/42/matches
```

The backend might compute the result by:

1. Loading candidate preferences.
2. Applying hard eligibility filters.
3. Retrieving semantic candidates.
4. Ranking the results.
5. Producing a response representation.

The URI does not require the server to expose these internal steps to the client.

This separation allows the backend's internal implementation to change without necessarily changing the public interface.

### 10.2 Use a Consistent Interface Contract

A well-designed interface should be consistent about:

- Resource identification.
- Supported methods.
- Request and response representations.
- Status codes.
- Validation behavior.
- Error semantics.
- Access-control rules.

Consistency makes client implementations easier to maintain.

However, consistency should not be confused with forcing every resource to support every method. The supported operations must reflect the resource's domain behavior and security requirements.

## 11. Engineering Trade-Offs

### 11.1 Uniformity vs Domain Fit

A uniform resource interface helps clients learn a consistent interaction model.

However, not every domain operation maps cleanly to basic CRUD.

**Decision principle:** Prefer consistent resource-oriented interactions where they express the domain naturally. Use explicit domain operations when they communicate intent more clearly.

### 11.2 Statelessness vs Repeated Context

Stateless interactions make requests easier to interpret independently, but clients may need to send repeated context.

**Decision principle:** Avoid relying on hidden per-client conversational state when the request can carry the necessary context. Keep persistent business state in appropriate application storage.

### 11.3 Caching vs Freshness and Privacy

Caching can improve latency and reduce server load, but stale or incorrectly shared responses can create correctness and privacy problems.

**Decision principle:** Define caching behavior according to resource sensitivity, update frequency, and acceptable staleness.

### 11.4 Hypermedia vs Hard-Coded Client Navigation

Hypermedia can make client navigation more discoverable and allow the server to expose available transitions dynamically.

However, it requires careful representation and client design. Many practical HTTP APIs instead rely on documented, hard-coded URI conventions.

**Decision principle:** Understand the difference between strict REST and common REST-style API conventions, then choose the architecture deliberately.

## 12. Common Mistakes

### Mistake 1: Calling Every HTTP API RESTful

Using HTTP and JSON does not establish that an API satisfies REST's architectural constraints.

**Correction:** Evaluate the interface and architectural constraints rather than the technology labels.

### Mistake 2: Confusing a Resource with a Database Row

A resource can be computed, aggregated, or represented independently of database structure.

**Correction:** Design resource identifiers around the domain interface, not the internal schema alone.

### Mistake 3: Using Action Endpoints for Every Operation

An API built entirely from names such as `/getUser`, `/updateUser`, and `/deleteUser` can become inconsistent and harder to reason about.

**Correction:** Use resource-oriented identifiers and HTTP method semantics when appropriate, while allowing explicit domain operations when they genuinely fit better.

### Mistake 4: Assuming Stateless Means No Database or Sessions Anywhere

The REST stateless constraint concerns request interaction context. It does not prohibit persistent resource state.

**Correction:** Separate client interaction state from persistent business data and other application state.

### Mistake 5: Assuming Every Response Should Be Cached

Some responses contain private or frequently changing information.

**Correction:** Set caching behavior according to the data's sensitivity and freshness requirements.

### Mistake 6: Treating a `links` Field as Proof of HATEOAS

A response can contain links while still requiring clients to rely on hard-coded knowledge of available actions.

**Correction:** Evaluate how clients discover and use the application's transitions.

### Mistake 7: Forcing Every Business Operation into CRUD

Operations such as approval, cancellation, or workflow initiation may have domain-specific semantics.

**Correction:** Model business operations clearly rather than choosing a URI solely to match a generic CRUD template.

### Mistake 8: Ignoring Access Control Because the API Is RESTful

REST is an architectural style, not an authorization mechanism.

**Correction:** Enforce authentication and authorization according to the application's security requirements.

## 13. Interview Questions and Expected Answers

### Q1. What is REST?

REST is an architectural style for distributed hypermedia systems. It defines constraints such as client-server separation, stateless interaction, caching, a uniform interface, layered systems, and optional code on demand.

### Q2. Is REST a protocol?

No. REST is an architectural style. HTTP is a protocol commonly used to implement REST-oriented interfaces.

### Q3. What is the difference between a resource and a representation?

A resource is the conceptual entity being addressed. A representation is the information about that resource transferred between components.

### Q4. What are the six REST constraints?

Client-server, stateless, cache, uniform interface, layered system, and code on demand, with code on demand being optional.

### Q5. Why is statelessness important in REST?

It requires requests to contain the information needed for their interpretation rather than depending on hidden conversational context from previous requests. This can simplify scaling and recovery.

### Q6. What is the uniform-interface constraint?

It establishes consistent interaction semantics. Its aspects include resource identification, manipulation through representations, self-descriptive messages, and hypermedia as the engine of application state.

### Q7. Does using HTTP and JSON make an API RESTful?

No. Those technologies do not establish adherence to REST's architectural constraints.

### Q8. What is HATEOAS?

HATEOAS stands for Hypermedia as the Engine of Application State. Clients use hypermedia controls supplied by the server to discover available application transitions.

### Q9. What is the difference between REST and RPC?

REST emphasizes resources and a uniform interface. RPC emphasizes invoking named operations or procedures. Either style can be implemented over HTTP.

### Q10. Does REST require every operation to be CRUD?

No. Domain operations can require explicit commands or state transitions. The interface should express the domain clearly and consistently.

### Q11. What is the purpose of the cache constraint?

It allows responses to be identified as cacheable or non-cacheable so that appropriate responses can be reused, improving performance and reducing repeated communication.

### Q12. Does a layered system automatically make an API RESTful?

No. Intermediary layers are one REST constraint. The system must be evaluated against the other applicable constraints as well.

## 14. Quick Revision

- **REST:** Architectural style for distributed hypermedia systems.
- **Resource:** Conceptual entity or information that can be identified and interacted with.
- **Resource identifier:** URI used to identify a resource.
- **Representation:** Information about a resource transferred between components.
- **Client-server:** Separates client and server responsibilities.
- **Stateless:** Each request contains the information needed for its interpretation without hidden conversational context from previous requests.
- **Cache:** Allows appropriate response reuse.
- **Uniform interface:** Provides consistent resource interaction semantics.
- **Layered system:** Allows intermediary components between client and server.
- **Code on demand:** Optional transfer of executable code to extend client functionality.
- **HATEOAS:** Uses hypermedia controls to guide application transitions.
- **REST vs RPC:** Resource-oriented interaction versus procedure-oriented interaction.

## 15. Key Takeaways

1. REST is an architectural style, not a protocol or a synonym for HTTP.
2. REST defines six constraints, with code on demand being optional.
3. Resources are conceptual entities; representations are the information transferred about them.
4. A uniform interface is central to REST and includes hypermedia-related requirements.
5. Resource-oriented HTTP conventions are useful, but they do not by themselves prove strict REST compliance.
6. Statelessness does not prohibit persistent business state.
7. Caching requires deliberate decisions about freshness and privacy.
8. Good API design should reflect the domain while maintaining consistent, understandable interactions.

## 16. Further Reading

- [Roy Fielding's Dissertation — Architectural Styles and the Design of Network-based Software Architectures](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm) — Primary source defining REST and its architectural constraints.
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110) — HTTP resource interactions, methods, and message semantics.
- [MDN — An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) — Practical context for HTTP-based communication.

## 17. Connection to the Next Chapters

This chapter focused on REST as an architectural style. The next chapters cover adjacent concerns without repeating the REST constraints in depth.

- [Chapter 07 — Request/Response Lifecycle](07-Request-Response-Lifecycle.md): How DNS, network communication, HTTP, and HTTPS participate in an end-to-end exchange.
- [Chapter 08 — APIs and Network Communication](08-APIs-and-Network-Communication.md): How application interfaces expose capabilities and communicate over networks.
- [Chapter 09 — Serialization Fundamentals](09-Serialization-Fundamentals.md): How application data is represented for transfer and processing.
- [Chapter 10 — Distributed Communication Basics](10-Distributed-Communication-Basics.md): How to reason about communication failures and troubleshoot them systematically.

---

# End of Document
