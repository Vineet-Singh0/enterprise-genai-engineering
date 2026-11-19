# ENG-06 — Networking Fundamentals

## Chapter 04: HTTP Fundamentals

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain why HTTP exists and which problems it solves.
- Describe the HTTP request/response model.
- Understand the structure of HTTP requests and responses.
- Explain common HTTP methods and their intended semantics.
- Interpret HTTP status-code categories and commonly used codes.
- Understand the purpose of HTTP headers.
- Explain HTTP statelessness without confusing it with application-level state.
- Read and reason about HTTP exchanges used by backend applications.
- Recognize common engineering mistakes when working with HTTP.

## 2. Prerequisites

Before starting this chapter, you should understand:

- [Networking Basics](01-Networking-Basics.md)
- [TCP/IP Fundamentals](02-TCP-IP-Fundamentals.md)
- [DNS Fundamentals](03-DNS-Fundamentals.md)

**Estimated reading time:** 30–40 minutes

## 3. Before We Start

Imagine that a frontend application needs to retrieve a user's profile from a FastAPI backend.

The frontend needs to communicate:

1. Which resource it wants.
2. What operation it intends to perform.
3. Any additional information required by the server.
4. The data it wants to send, if applicable.

The backend must communicate:

1. Whether it understood the request.
2. Whether the operation succeeded.
3. What data or error information it should return.
4. Additional information about the response.

TCP can provide a reliable, ordered byte stream between endpoints, but it does not define the application-level meaning of those bytes.

**HTTP provides standardized rules for structuring requests and responses and assigning meaning to them.**

This is the problem HTTP solves.

## 4. What Is HTTP?

HTTP stands for **Hypertext Transfer Protocol**.

It is an application-layer protocol used to transfer representations of resources between clients and servers.

Although HTTP was originally developed for hypertext documents, it is now widely used for:

- Web pages and browser content.
- Backend APIs.
- Mobile application communication.
- Microservice communication.
- External service integrations, including LLM APIs.
- Downloading files and other resources.

HTTP defines how a client expresses a request and how a server communicates the result.

It does not, by itself, define your application's business rules, database schema, or authorization policy.

### 4.1 The Basic Mental Model

Think of HTTP as a standardized conversation format.

A client sends a structured message:

> Retrieve this resource, using this method, with these headers and optional content.

The server returns another structured message:

> Here is the result, represented by this status code, these headers, and optional content.

The exchange looks like this:

```text
Client
  |
  | HTTP Request
  | Method + Target + Headers + Optional Body
  |
  v
Server
  |
  | Process the request
  |
  | HTTP Response
  | Status Code + Headers + Optional Body
  |
  v
Client
```

The client initiates the exchange. The server processes the request and produces a response.

The client might be a browser, a mobile application, a Python program, or another backend service. The server might be a FastAPI application, a web server, or an API service.

### 4.2 HTTP Is an Application-Layer Protocol

Recall from [Networking Basics](01-Networking-Basics.md) that networking protocols operate at different layers.

HTTP defines application-level communication semantics. It relies on lower-level networking mechanisms to carry its messages.

For common HTTP/1.1 and HTTP/2 deployments, TCP provides the transport connection. HTTP/3 instead uses QUIC over UDP.

This distinction matters: HTTP defines what the application messages mean, while the transport mechanism determines how those messages are carried.

You do not need to implement transport protocols to use HTTP correctly, but understanding the separation helps when reasoning about application behavior and network failures.

## 5. The HTTP Request

An HTTP request communicates what a client wants the server to do.

Consider this illustrative HTTP/1.1 request:

```http
GET /api/users/42 HTTP/1.1
Host: api.example.com
Accept: application/json
User-Agent: ExampleClient/1.0

```

This request contains several important parts.

| Component | Example | Purpose |
|---|---|---|
| Method | `GET` | Indicates the intended operation |
| Request target | `/api/users/42` | Identifies the target resource |
| HTTP version | `HTTP/1.1` | Identifies the HTTP protocol version |
| `Host` header | `api.example.com` | Identifies the target authority in HTTP/1.1 |
| `Accept` header | `application/json` | Communicates an acceptable response media type |
| `User-Agent` header | `ExampleClient/1.0` | Identifies the client software |

The blank line separates the header section from the optional message body.

This example does not include a body because a body is not needed for this particular `GET` request.

### 5.1 Request Method

The method communicates the intended semantics of the request.

Examples include:

- `GET` — retrieve a representation of a resource.
- `POST` — submit content for processing or request resource-specific processing.
- `PUT` — create or replace the state of a target resource, depending on the resource and request semantics.
- `PATCH` — apply a partial modification to a resource.
- `DELETE` — request removal of a target resource.
- `HEAD` — request the response headers that would be returned for a corresponding `GET`, without response content.
- `OPTIONS` — request information about communication options supported by the target resource.

These methods are not interchangeable. Their intended semantics influence how clients, servers, caches, and intermediaries handle requests.

A method name does not guarantee that the server implements the corresponding behavior correctly. Application implementations must respect the method's semantics.

### 5.2 Request Target

The request target identifies what the client is addressing.

For example:

```text
/api/users/42
```

This commonly represents a user resource identified by `42`.

A query string can provide additional parameters:

```text
/api/users?active=true&limit=20
```

Here:

- `/api/users` is the path.
- `active=true` and `limit=20` are query parameters.

A path and a query string serve different purposes, but their exact meaning is defined by the application.

For example, one API may interpret `limit=20` as the maximum number of results, while another may use a different default or constraint.

### 5.3 Request Headers

Headers carry metadata about the request.

Examples:

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <access-token>
User-Agent: ExampleClient/1.0
```

Each header has a specific purpose.

- `Accept` communicates which response media types the client can handle.
- `Content-Type` describes the media type of the request content.
- `Authorization` carries credentials or authorization information according to the authentication scheme.
- `User-Agent` identifies the client software.

A useful distinction:

**`Accept` describes what the client can receive; `Content-Type` describes what the current message body contains.**

For example, a client can send JSON while asking the server to respond with JSON:

```http
Content-Type: application/json
Accept: application/json
```

These headers are related but not interchangeable.

### 5.4 Request Body

A request body carries content when the operation requires it.

For example:

```http
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json

{
  "name": "Asha",
  "email": "asha@example.com"
}
```

The body contains a representation of the data being submitted.

HTTP does not require every request to have a body. Whether a body is expected, permitted, or meaningful depends on the method and the application protocol's requirements.

For example:

- A `GET` request commonly has no body.
- A `POST` request commonly submits data.
- A `PUT` request commonly supplies a representation of the target resource.

Avoid assuming that every request has a body or that every body is JSON.

## 6. The HTTP Response

An HTTP response communicates the result of processing a request.

Consider this HTTP/1.1 response:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{
  "id": 42,
  "name": "Asha"
}
```

Its main components are:

| Component | Example | Purpose |
|---|---|---|
| HTTP version | `HTTP/1.1` | Identifies the protocol version |
| Status code | `200` | Communicates the result category and meaning |
| Reason phrase | `OK` | Human-readable phrase in HTTP/1.1 |
| Headers | `Content-Type: application/json` | Provide response metadata |
| Body | JSON object | Carries the returned representation |

The blank line separates the response headers from the optional response body.

The reason phrase shown in this example is part of HTTP/1.1 status-line syntax. It is not used in HTTP/2 or HTTP/3 in the same way; clients should rely on the numeric status code rather than treating the phrase as the authoritative result.

### 6.1 Response Headers

Response headers provide information about the returned content and how it should be handled.

Examples include:

```http
Content-Type: application/json
Cache-Control: no-store
Content-Length: 48
```

Their purposes differ:

- `Content-Type` identifies the response body's media type.
- `Cache-Control` communicates caching directives.
- `Content-Length` communicates the message content length when applicable.

Do not assume every response contains all these headers. Their presence depends on the message, protocol version, server, and intermediary behavior.

### 6.2 Response Body

The response body carries the returned representation or other response content when applicable.

Examples include:

- JSON data.
- HTML documents.
- Plain text.
- Images.
- Files.
- Error details.
- No content, when the response semantics call for it.

For example, a successful API response might contain:

```json
{
  "id": 42,
  "name": "Asha"
}
```

A server can also return a response without a body. A `204 No Content` response is a common example.

**Important:** A successful HTTP response does not automatically mean that the application returned the exact business outcome the caller expected. The client must interpret the response according to the API's contract.

## 7. HTTP Methods and Their Semantics

Choosing an HTTP method is an engineering decision. It communicates intent to clients, servers, caches, and other HTTP components.

### 7.1 Safe Methods

A method is considered *safe* when the client does not request a state-changing operation as part of its intended semantics.

`GET`, `HEAD`, and `OPTIONS` are defined as safe methods.

Safe does not mean that absolutely nothing can change while processing the request. For example, a server might update access logs or metrics. The important point is that the client is not requesting a state-changing business operation.

A dangerous design is to make a `GET` request delete an account or transfer money. Such behavior violates the expected semantics and can cause problems when clients, crawlers, or caches make requests automatically.

### 7.2 Idempotent Methods

A method is *idempotent* when making the same request multiple times has the same intended effect on the server as making it once.

Common idempotent methods include:

- `GET`
- `HEAD`
- `PUT`
- `DELETE`
- `OPTIONS`

`POST` is not generally defined as idempotent, although an application can implement additional safeguards that make a particular operation safe to retry.

Consider a resource update:

```http
PUT /api/users/42
Content-Type: application/json

{
  "name": "Asha"
}
```

Sending the same replacement request multiple times should leave the target resource in the same intended state as sending it once.

Compare this with a request that creates a new payment transaction every time it is received. Repeating that request could create multiple transactions.

Idempotency matters when dealing with retries, network interruptions, and uncertain outcomes.

### 7.3 Idempotency Does Not Mean Identical Responses

Two identical requests can produce different response codes or response metadata while still having the same intended effect.

For example, a `DELETE` request might return a successful deletion status on the first request and a not-found response on a later request.

Whether the method is idempotent depends on its intended effect, not on whether every response is identical.

### 7.4 Method Comparison

| Method | Common purpose | Safe? | Idempotent? |
|---|---|---|---|
| `GET` | Retrieve a resource | Yes | Yes |
| `HEAD` | Retrieve response metadata without content | Yes | Yes |
| `POST` | Submit content or initiate processing | No | Not generally |
| `PUT` | Create or replace target-resource state | No | Yes |
| `PATCH` | Partially modify a resource | No | Not guaranteed |
| `DELETE` | Request removal of a resource | No | Yes |
| `OPTIONS` | Discover communication options | Yes | Yes |

These classifications describe HTTP method semantics. A specific API can still be implemented incorrectly.

### 7.5 Practical Example

Suppose a backend exposes the following operations:

```text
GET    /api/users/42
POST   /api/users
PUT    /api/users/42
PATCH  /api/users/42
DELETE /api/users/42
```

Their intended behavior might be:

- `GET` retrieves user 42.
- `POST` creates a user.
- `PUT` replaces the representation of user 42.
- `PATCH` updates selected fields of user 42.
- `DELETE` requests deletion of user 42.

This is a conventional design, not a universal rule. The API contract determines the exact meaning and validation requirements.

For the broader design principles that guide resource-oriented APIs, see [REST Principles](06-REST-Principles.md). This chapter focuses on the HTTP semantics those designs build upon.

## 8. HTTP Status Codes

A status code communicates the result category of an HTTP request.

Status codes are grouped into five classes.

| Class | Range | Meaning |
|---|---|---|
| 1xx | 100–199 | Informational |
| 2xx | 200–299 | Successful |
| 3xx | 300–399 | Redirection |
| 4xx | 400–499 | Client error |
| 5xx | 500–599 | Server error |

The class gives a useful first indication of the response, but the specific status code and API contract determine its meaning.

### 8.1 Common Success Codes

| Status | Meaning | Typical use |
|---|---|---|
| `200 OK` | Request succeeded | Retrieving or processing a resource |
| `201 Created` | Resource created | Successful resource creation |
| `202 Accepted` | Request accepted for processing | Work that has been accepted but may not be complete |
| `204 No Content` | Request succeeded with no response content | Successful operation requiring no response body |

A `202 Accepted` response deserves special attention. It does not mean that the requested work has finished. It means the server accepted the request for processing.

For example, a backend might accept a long-running document-processing job and provide a job identifier that the client can use to check its progress.

### 8.2 Common Client Error Codes

| Status | Meaning | Typical use |
|---|---|---|
| `400 Bad Request` | Request cannot be processed because it is considered invalid | Malformed or invalid request |
| `401 Unauthorized` | Valid authentication credentials are missing or unacceptable | Authentication required or failed |
| `403 Forbidden` | Server refuses the request | Authenticated caller lacks permission, or access is otherwise refused |
| `404 Not Found` | Target resource was not found, or the server is unwilling to disclose its existence | Missing resource |
| `405 Method Not Allowed` | Method is not supported for the target resource | Unsupported method |
| `409 Conflict` | Request conflicts with the current state of the resource | Duplicate or conflicting operation |
| `415 Unsupported Media Type` | Content media type is not supported | Unsupported request `Content-Type` |
| `422 Unprocessable Content` | Content type and syntax are understood, but the contained instructions cannot be processed | Semantic or validation failure in applicable APIs |
| `429 Too Many Requests` | Client has sent too many requests in a given period | Rate limiting |

The exact choice between codes such as `400` and `422` depends on the API's design and the nature of the error. Do not assume every framework uses them identically.

A `401` and a `403` should not be treated as synonyms:

- `401` concerns authentication credentials.
- `403` indicates that the server refuses the request, often because the caller is not permitted to perform the operation.

### 8.3 Common Server Error Codes

| Status | Meaning | Typical use |
|---|---|---|
| `500 Internal Server Error` | Unexpected server-side failure | Unhandled application exception |
| `502 Bad Gateway` | Gateway or proxy received an invalid response from an upstream server | Upstream communication failure |
| `503 Service Unavailable` | Server is temporarily unable to handle the request | Maintenance, overload, or temporary unavailability |
| `504 Gateway Timeout` | Gateway or proxy did not receive a timely upstream response | Upstream timeout |

These codes help communicate failures, but they do not identify the root cause on their own.

For example, a `504` indicates a gateway timeout. It does not prove whether the upstream application was slow, the database was delayed, or another dependency caused the delay.

Systematic diagnosis belongs to [Distributed Communication Basics](10-Distributed-Communication-Basics.md).

### 8.4 Do Not Treat Every 2xx Response as the Same

A common mistake is to interpret all 2xx status codes as meaning that the requested work is complete.

Consider:

- `200 OK`: the request succeeded.
- `201 Created`: a resource was created.
- `202 Accepted`: processing was accepted but may still be ongoing.
- `204 No Content`: the request succeeded without response content.

The client should handle these responses according to the operation's contract.

## 9. HTTP Headers

Headers carry metadata that affects how HTTP messages are interpreted and handled.

Headers can communicate content types, authentication information, caching rules, request preferences, and other properties.

### 9.1 Headers You Should Recognize

| Header | Common purpose |
|---|---|
| `Host` | Identifies the target authority in HTTP/1.1 |
| `Accept` | Communicates acceptable response media types |
| `Content-Type` | Identifies the media type of message content |
| `Content-Length` | Indicates content length when applicable |
| `Authorization` | Carries authentication credentials or related authorization information |
| `Cache-Control` | Communicates caching directives |
| `User-Agent` | Identifies the client software |
| `Location` | Identifies a resource location, commonly used with redirects or resource creation |
| `Retry-After` | Communicates when a retry should be attempted in applicable responses |

You do not need to memorize every HTTP header. You should understand the purpose of commonly used headers and know how to consult the protocol documentation when needed.

### 9.2 Headers Are Not the Same as the Body

Consider this request:

```http
POST /api/orders HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "product_id": 17,
  "quantity": 2
}
```

The headers provide metadata about the request, including its content type and authentication information.

The body contains the order data.

This separation makes HTTP messages extensible: metadata can be added without necessarily changing the structure of the application data.

However, headers are not automatically trustworthy. A server must validate and interpret them appropriately. For example, receiving an `Authorization` header does not by itself prove that the caller is authenticated or authorized.

### 9.3 Header Names and Values

HTTP field names are case-insensitive.

For example, `Content-Type` and `content-type` refer to the same field name.

Header values have field-specific rules. Do not assume that all header values are case-insensitive or that every field accepts arbitrary text.

When designing or debugging an HTTP integration, use the relevant field definition rather than guessing.

## 10. HTTP Is Stateless at the Protocol Level

HTTP is commonly described as a stateless protocol.

In this context, statelessness means that the semantics of each request do not inherently require the protocol to remember the previous request to understand the current one.

For example, a request to retrieve a resource should identify the target and provide the information needed for that request to be interpreted.

This does **not** mean that applications built using HTTP cannot maintain state.

### 10.1 Protocol Statelessness vs Application State

Consider a user logging into an application.

The application might maintain a session, issue a token, or store user-specific information in a database.

Later requests can carry a session cookie or an authorization token so the server can identify the user.

The application maintains state, while each HTTP request carries the information needed for the server to interpret that particular exchange.

```text
Client
  |
  | Request + session cookie or token
  v
HTTP Server
  |
  | Validate identity and retrieve required state
  v
Application / Session Store / Database
```

The protocol does not automatically preserve a user's business state between requests. The application implements the required mechanism.

### 10.2 Why Statelessness Is Useful

When each request carries the information needed to process it, servers can often handle requests independently.

Potential benefits include:

- Easier horizontal scaling.
- Less dependence on in-memory connection-specific application state.
- More flexibility in routing requests among application instances.
- Simpler recovery when an individual application instance fails.

These benefits are not automatic. An application can still depend on shared databases, session stores, or other stateful services.

### 10.3 Statelessness Has Trade-Offs

Carrying context in each request can introduce overhead.

For example, sending a token with every request adds bytes to the communication. The application must also manage token expiration, validation, revocation where required, and access control.

A stateful session can reduce the amount of repeated application context the client needs to send, but introduces its own storage, availability, and scaling considerations.

The correct design depends on the application requirements. Do not assume that HTTP statelessness means sessions are forbidden or that stateless architectures never store state.

## 11. A Complete HTTP Exchange

Consider a frontend retrieving a user's profile.

The client sends:

```http
GET /api/users/42 HTTP/1.1
Host: api.example.com
Accept: application/json
```

The server returns:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{
  "id": 42,
  "name": "Asha",
  "role": "engineer"
}
```

Reason through the exchange:

1. The client targets `/api/users/42`.
2. `GET` communicates that the client wants to retrieve a representation.
3. `Accept: application/json` communicates the desired response media type.
4. The server processes the request according to its application logic.
5. `200 OK` communicates success.
6. `Content-Type: application/json` identifies the response content as JSON.
7. The body contains the returned user representation.

Notice what HTTP does not tell us here:

- Whether the user exists in a database.
- How the application authorizes access to the profile.
- Whether the data was retrieved from a cache.
- How the application internally represents the user.
- Whether a particular business rule has been satisfied.

Those are application-level concerns. HTTP provides the standardized communication envelope through which the result is conveyed.

## 12. HTTP in Backend Engineering

HTTP is central to backend engineering because many application components communicate through HTTP interfaces.

### 12.1 FastAPI Example

A FastAPI endpoint might look like this:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/users/{user_id}")
def get_user(user_id: int):
    return {
        "id": user_id,
        "name": "Asha"
    }
```

A client could request:

```http
GET /api/users/42 HTTP/1.1
Host: localhost:8000
Accept: application/json
```

The framework maps the request to the endpoint, validates the path parameter according to its configuration, invokes the handler, and constructs an HTTP response.

The exact response depends on the framework version, application configuration, middleware, and endpoint behavior.

This example illustrates an important separation:

- HTTP defines the request and response semantics.
- FastAPI provides framework behavior for routing, validation, and response construction.
- The application defines what retrieving a user means.

Understanding HTTP makes framework-generated behavior easier to reason about.

### 12.2 External LLM API Example

A backend might call an external LLM service using HTTP.

The request can include:

- A target URL.
- An HTTP method.
- Authentication information.
- Content-type and response-format preferences.
- A request body containing model parameters and input data.

The response can include:

- A status code.
- Headers.
- A body containing generated output or error details.

An application should not assume that every request succeeds or that every response body has the expected structure. The caller needs to handle responses according to the external API's documented contract.

This chapter does not cover the complete network troubleshooting process; see Chapter 10 for that.

## 13. Engineering Trade-Offs

HTTP is widely useful because it standardizes application communication across many different clients and servers. However, using HTTP does not automatically make an application reliable or well-designed.

### 13.1 Choosing a Method Correctly

**Trade-off:** A method that accurately communicates intent helps clients and intermediaries reason about the operation. An incorrectly chosen method can create surprising behavior.

For example, using `GET` for a destructive operation violates expected semantics and can interact badly with automated clients or caching.

**Engineering rule:** Choose methods according to their defined semantics, then document any application-specific behavior.

### 13.2 Choosing Status Codes Consistently

**Trade-off:** Precise status codes make client behavior easier to implement, while inconsistent status codes force clients to depend on undocumented conventions.

For example, returning `500 Internal Server Error` for every validation failure hides useful distinctions between invalid client input and unexpected server failure.

**Engineering rule:** Define a consistent error contract and use status codes that accurately describe the result.

### 13.3 Deciding What Belongs in Headers and the Body

**Trade-off:** Headers are appropriate for standardized message metadata, while the body carries the representation or content being exchanged.

Putting arbitrary application data into custom headers can make the protocol harder to understand and can run into intermediary limitations.

**Engineering rule:** Use established headers for their intended purposes and put ordinary application payloads in the message body.

### 13.4 Making Retries Safe

**Trade-off:** Retrying a failed request can improve resilience, but repeating a non-idempotent operation can cause duplicate effects.

A client may lose its connection after submitting a payment request without knowing whether the server processed the payment.

**Engineering rule:** Retry behavior must account for method semantics and the application's operation contract. Where necessary, design explicit deduplication or idempotency mechanisms rather than assuming all requests are safe to repeat.

## 14. Common Mistakes

### Mistake 1: Treating HTTP as the Transport Protocol

HTTP defines application-level communication semantics. TCP or QUIC may carry HTTP traffic, depending on the HTTP version and deployment.

**Correction:** Keep application-layer semantics separate from transport-layer behavior.

### Mistake 2: Assuming Every Request Has a Body

Many `GET` requests have no body, and some successful responses intentionally contain no content.

**Correction:** Interpret the message according to its method and response semantics.

### Mistake 3: Confusing `Accept` and `Content-Type`

`Accept` communicates what the client can receive. `Content-Type` describes the content being sent in a message.

**Correction:** Use each header for its intended purpose.

### Mistake 4: Treating All 2xx Status Codes as Equivalent

`200`, `201`, `202`, and `204` communicate different outcomes.

**Correction:** Handle the specific status code and the documented application contract.

### Mistake 5: Treating `401` and `403` as Identical

Authentication and permission checks are related but different concerns.

**Correction:** Use the status code that best describes the failure and avoid exposing sensitive information in error messages.

### Mistake 6: Assuming `POST` Is Always Safe to Retry

Repeated requests may create duplicate resources or trigger duplicate operations.

**Correction:** Understand the operation's idempotency and implement appropriate deduplication where needed.

### Mistake 7: Assuming Stateless HTTP Means No Application State

Applications can use sessions, tokens, databases, and shared state stores.

**Correction:** Distinguish protocol-level request semantics from application state management.

### Mistake 8: Assuming a Status Code Proves the Root Cause

A `502`, `503`, or `504` describes a response condition, not necessarily the underlying failure.

**Correction:** Use status codes as evidence and investigate the system that produced the response.

### Mistake 9: Assuming HTTP/1.1 Message Syntax Applies Identically to Every HTTP Version

HTTP/2 and HTTP/3 use different message framing and transport mechanisms from HTTP/1.1.

**Correction:** Learn the shared HTTP semantics first, then study version-specific behavior when the engineering task requires it.

## 15. Interview Questions and Expected Answers

### Q1. What problem does HTTP solve?

HTTP defines standardized application-level rules for expressing requests and returning responses. It lets different clients and servers communicate without requiring them to share the same implementation.

### Q2. What are the main parts of an HTTP request?

A request communicates a method, target, and protocol-version information where applicable. It can include headers and an optional body. Exact message framing depends on the HTTP version.

### Q3. What is the difference between `GET` and `POST`?

`GET` requests a representation of a resource and is defined as safe and idempotent. `POST` submits content for processing or requests resource-specific processing and is not generally idempotent.

### Q4. What is the difference between `PUT` and `PATCH`?

`PUT` generally requests creation or replacement of the target resource's state. `PATCH` requests a partial modification. `PUT` is defined as idempotent; `PATCH` is not guaranteed to be idempotent.

### Q5. What is the difference between `Accept` and `Content-Type`?

`Accept` communicates which response media types the client can handle. `Content-Type` identifies the media type of the message content.

### Q6. What is the difference between HTTP status-code classes 4xx and 5xx?

4xx codes indicate client-error conditions, while 5xx codes indicate server-error conditions. The exact meaning depends on the individual status code.

### Q7. Explain the difference between `401` and `403`.

`401` indicates that valid authentication credentials are missing or unacceptable. `403` indicates that the server refuses the request, often because the caller lacks permission.

### Q8. What does HTTP statelessness mean?

HTTP does not inherently require the protocol to remember previous requests to interpret a current request. Applications can still maintain sessions and other state through explicit mechanisms.

### Q9. Why is idempotency important?

Idempotency allows the same request to be repeated without changing its intended effect after the first successful application. It matters when retries occur after timeouts or uncertain outcomes.

### Q10. Does a `202 Accepted` response mean the work is complete?

No. It means the request was accepted for processing. The requested work may still be ongoing.

### Q11. Does a `500` response always mean the application code contains a bug?

No. It indicates an unexpected server-side failure, but the underlying cause could involve application logic, dependencies, configuration, or other conditions. Investigation is required.

### Q12. Is HTTP/1.1 the same as HTTP/2 or HTTP/3?

No. They share important HTTP semantics, but their message framing and transport mechanisms differ. HTTP/1.1 and HTTP/2 commonly use TCP, whereas HTTP/3 uses QUIC over UDP.

## 16. Quick Revision

Before moving forward, make sure you can explain these ideas without looking at the chapter.

- **HTTP:** Application-layer protocol for request/response communication.
- **Request:** Communicates the intended operation, target, and relevant metadata.
- **Response:** Communicates the result through a status code, headers, and optional content.
- **Method:** Defines the intended semantics of an operation.
- **Status code:** Communicates the result category and specific condition.
- **Header:** Carries metadata about a message.
- **Request body:** Carries submitted content when applicable.
- **Response body:** Carries returned content when applicable.
- **Safe method:** Does not request a state-changing operation as part of its intended semantics.
- **Idempotent method:** Repeated identical requests have the same intended effect as one request.
- **Statelessness:** The protocol does not inherently require remembering previous requests to interpret the current request.
- **Application state:** Can still be maintained through sessions, tokens, databases, or other mechanisms.

## 17. Key Takeaways

1. HTTP standardizes how clients express application-level requests and how servers return results.
2. HTTP message semantics are distinct from the transport mechanism carrying the messages.
3. Methods communicate intent; they should not be selected arbitrarily.
4. Status codes, headers, and message bodies each serve distinct purposes.
5. `Accept` and `Content-Type` are related but have different meanings.
6. Safe and idempotent describe different properties.
7. HTTP statelessness does not prohibit application state.
8. Correct HTTP behavior improves interoperability, but reliability still depends on sound application design and appropriate error handling.

## 18. Further Reading

Use these references to verify protocol details and deepen your understanding.

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110) — Core HTTP semantics, methods, status codes, headers, and statelessness.
- [RFC 9112 — HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112) — HTTP/1.1 message syntax and connection behavior.
- [RFC 9113 — HTTP/2](https://www.rfc-editor.org/rfc/rfc9113) — HTTP/2 protocol details.
- [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114) — HTTP/3 protocol details.
- [MDN — HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) — Practical explanations and examples.

## 19. Connection to the Next Chapters

This chapter established the core HTTP message model and semantics. The next chapters build on it without repeating the same material in depth.

- [Chapter 05 — HTTPS Fundamentals](05-HTTPS-Fundamentals.md): How HTTPS protects HTTP communication using TLS.
- [Chapter 06 — REST Principles](06-REST-Principles.md): How REST architectural constraints guide the design of networked APIs.
- [Chapter 07 — Request/Response Lifecycle](07-Request-Response-Lifecycle.md): How DNS, network communication, HTTP, and related components combine into an end-to-end exchange.
- [Chapter 08 — APIs and Network Communication](08-APIs-and-Network-Communication.md): How application interfaces use network communication to expose capabilities.
- [Chapter 10 — Distributed Communication Basics](10-Distributed-Communication-Basics.md): How to reason about communication failures and troubleshoot them systematically.

---

# End of Document
