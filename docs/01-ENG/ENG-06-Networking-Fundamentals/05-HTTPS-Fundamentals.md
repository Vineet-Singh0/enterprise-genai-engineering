# HTTPS Fundamentals

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain why HTTPS is needed when HTTP already defines how clients and servers communicate.
- Distinguish HTTP from HTTPS.
- Explain the security goals of TLS: confidentiality, integrity, and authentication.
- Understand the roles of encryption, certificates, and certificate authorities.
- Describe the high-level TLS handshake and how a secure connection is established.
- Explain certificate validation and hostname verification.
- Understand the difference between encryption in transit and application-level authorization.
- Recognize common HTTPS configuration and certificate mistakes.
- Explain HTTPS decisions in backend applications and external API integrations.

## 2. Prerequisites

Before starting this chapter, you should understand:

- [Networking Basics](01-Networking-Basics.md)
- [TCP/IP Fundamentals](02-TCP-IP-Fundamentals.md)
- [DNS Fundamentals](03-DNS-Fundamentals.md)
- [HTTP Fundamentals](04-HTTP-Fundamentals.md)

**Estimated reading time:** 25–35 minutes

## 3. Before We Start

Imagine that your backend calls an external LLM API.

The request contains a prompt, and the response contains generated output. The API request may also include an authentication token.

HTTP defines how the request and response are structured. But consider what could happen if the communication were sent without transport-level protection over an untrusted network:

- Someone could read sensitive request data.
- Someone could modify data while it is being transmitted.
- A client could communicate with an impostor instead of the intended server.

HTTP message structure alone does not solve these security problems.

**HTTPS combines HTTP with TLS to protect communication between the client and the server.**

This protection is important whenever communication crosses networks that should not be trusted to keep application data confidential or unchanged.

## 4. What Is HTTPS?

HTTPS stands for **Hypertext Transfer Protocol Secure**.

HTTPS is HTTP communication protected by Transport Layer Security (TLS).

TLS provides security mechanisms that can protect data while it travels between communicating endpoints. HTTP continues to define the meaning of requests, responses, methods, status codes, and headers.

The relationship is:

```text
Application communication
        |
        v
       HTTP
        |
        v
       TLS
        |
        v
Protected transport connection
        |
        v
   Network delivery
```

This is a conceptual view, not a universal protocol-stack diagram. In common HTTP/1.1 and HTTP/2 deployments, TLS operates over TCP. HTTP/3 uses QUIC, which integrates TLS 1.3 security mechanisms into its connection establishment.

The essential point is that HTTPS protects HTTP communication without replacing HTTP's application-level semantics.

### 4.1 HTTP vs HTTPS

| Aspect | HTTP without TLS | HTTPS |
|---|---|---|
| Application semantics | HTTP | HTTP |
| Confidentiality in transit | Not provided by HTTP itself | Provided by TLS when correctly configured |
| Integrity in transit | Not provided by HTTP itself | Protected by TLS |
| Server authentication | Not provided by HTTP itself | Normally provided through certificate validation |
| Default URL scheme | `http://` | `https://` |
| Typical web port | 80 | 443 |
| Additional requirements | HTTP implementation | HTTP implementation plus correctly configured TLS |

Ports 80 and 443 are conventional defaults, not mandatory restrictions. Services can use other ports.

HTTPS does not make the application inherently safe. It protects a communication channel against specific threats, while application security still depends on authentication, authorization, input validation, secure configuration, and other controls.

## 5. The Security Problems HTTPS Solves

TLS provides several important security properties.

### 5.1 Confidentiality

Confidentiality means that unauthorized parties observing the network traffic should not be able to read the protected application data.

Consider an API request:

```http
POST /v1/generate HTTP/1.1
Host: api.example.com
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "prompt": "Summarize this private document."
}
```

Without transport encryption, the HTTP content could be exposed to parties able to observe the relevant traffic.

With correctly configured HTTPS, TLS encrypts the protected communication between the TLS endpoints.

This helps protect:

- API credentials transmitted in headers.
- Request bodies.
- Response bodies.
- Other protected HTTP message content.

TLS does not guarantee that every piece of connection metadata is hidden. For example, IP addresses remain necessary for network delivery, and some connection metadata may remain observable depending on the protocol and deployment.

**Engineering principle:** Do not transmit sensitive application data over an unprotected connection when the communication requires confidentiality.

### 5.2 Integrity

Integrity means that unauthorized modifications to protected data can be detected.

Imagine that a client sends a request to update an account setting. If an attacker could modify the request in transit without detection, the server might receive different data from what the client intended.

TLS uses cryptographic mechanisms to protect the integrity of data exchanged over the secured connection.

This protection applies to data in transit. It does not guarantee that the application itself will process the request correctly or that stored data cannot be modified by an authorized or compromised component.

### 5.3 Authentication

Authentication helps establish the identity of the communicating endpoint.

In ordinary HTTPS connections, the client validates the server's certificate and hostname to verify that it is communicating with the intended server under the applicable trust rules.

For example, a client requesting:

```text
https://api.example.com
```

should verify that the presented certificate is valid for `api.example.com` and chains to a trusted certificate authority, subject to the client's validation rules.

This helps defend against impersonation by an attacker presenting an unrelated certificate.

HTTPS does not automatically authenticate the human user or authorize the requested business operation.

Server authentication, user authentication, and authorization are separate concerns.

### 5.4 The Three Properties Together

- **Confidentiality** — Protects transmitted content from being read by unauthorized observers.
- **Integrity** — Protects against undetected modification of data in transit.
- **Authentication** — Helps verify the identity of the intended server.

These properties complement one another. Encryption without proper authentication, for example, would not by itself guarantee that the client is communicating with the intended server.

## 6. What Is TLS?

TLS stands for **Transport Layer Security**.

It is a cryptographic protocol designed to protect communication between endpoints. HTTPS uses TLS to secure HTTP communication.

TLS provides mechanisms for:

- Negotiating supported security parameters.
- Authenticating the server, typically using certificates.
- Establishing shared cryptographic secrets.
- Protecting application data with authenticated encryption.
- Detecting unauthorized modifications to protected records.

Modern TLS deployments commonly use TLS 1.2 or TLS 1.3, with TLS 1.3 being the newer protocol version.

The exact handshake and cryptographic details differ by version. For this chapter, focus on the purpose of each stage rather than memorizing the cryptographic algorithms.

### 6.1 Why Not Use Encryption Alone?

Suppose a client encrypts data before sending it to a server.

If the client cannot establish who controls the server's public key, an attacker could potentially provide a different key and impersonate the intended server.

Encryption alone does not establish identity.

A secure connection needs an authenticated method for establishing trust and protecting subsequent communication. TLS combines authentication mechanisms, key establishment, and protected data transfer to achieve this.

## 7. Digital Certificates

A digital certificate is an electronic document that binds an identity, such as a domain name, to a public key under a certificate issuer's signature.

For a typical HTTPS server certificate, relevant information can include:

- The identities for which the certificate is valid.
- The server's public key.
- The certificate issuer.
- The certificate validity period.
- The issuer's digital signature.
- Additional extensions describing how the certificate may be used.

The client uses certificate validation to determine whether the presented certificate can be trusted for the intended connection.

### 7.1 Public and Private Keys

Public-key cryptography uses mathematically related public and private keys.

- The **public key** can be shared.
- The **private key** must be protected by its owner.

In certificate-based server authentication, the server proves possession of the relevant private key through the TLS handshake. The client validates the certificate and the handshake according to the protocol's security rules.

Modern TLS does not generally encrypt all application data directly with the server's public key. Instead, the handshake establishes shared secrets, and symmetric cryptography protects application data efficiently.

This distinction is important because public-key operations and bulk data encryption serve different roles.

### 7.2 What Is a Certificate Authority?

A Certificate Authority (CA) is an entity that issues certificates under a defined trust and validation process.

Browsers, operating systems, and other clients maintain or use trust stores containing trusted root certificates or other trust anchors.

A typical certificate chain looks like this:

```text
Trusted Root CA
      |
      | Signs
      v
Intermediate CA
      |
      | Signs
      v
Server Certificate
      |
      | Identifies
      v
api.example.com
```

This diagram illustrates a common chain. Actual certificate chains can vary, and a server may not send the root certificate because the client already has an appropriate trust anchor.

The client validates the certificate chain and other relevant properties before trusting the certificate for the connection.

### 7.3 Why Trust Stores Matter

A certificate is not trusted simply because it exists or contains a domain name.

The client must validate it according to its trust rules.

Depending on the environment, those rules can involve:

- A valid chain to an accepted trust anchor.
- Certificate validity dates.
- Hostname matching.
- Certificate constraints and key usage.
- Revocation or other applicable policy checks.

Different clients and environments may have different trust stores and validation behavior. A certificate trusted on one machine may fail validation on another if the environments are configured differently.

## 8. How HTTPS Establishes a Secure Connection

At a high level, an HTTPS connection requires the client and server to establish the security context used to protect communication.

For common HTTPS deployments using HTTP/1.1 or HTTP/2 over TCP, TLS is negotiated after the TCP connection is established. HTTP/3 establishes its transport using QUIC and integrates TLS 1.3 into that process.

The following describes a simplified TLS 1.3 handshake.

### 8.1 High-Level Handshake

```text
Client                                  Server
  |                                       |
  |------ ClientHello ------------------->|
  |                                       |
  |<----- ServerHello --------------------|
  |<----- EncryptedExtensions ------------|
  |<----- Certificate -------------------|
  |<----- CertificateVerify --------------|
  |<----- Finished -----------------------|
  |                                       |
  |------ Finished ---------------------->|
  |                                       |
  |====== Protected Application Data =====|
```

This diagram omits optional and implementation-dependent details to emphasize the main stages.

### 8.2 Step 1: ClientHello

The client initiates the TLS handshake by sending information about its capabilities and the parameters it supports.

This can include supported TLS versions, cryptographic algorithms, and key-share information.

The client may also provide the intended server name through Server Name Indication (SNI), allowing a server hosting multiple domains to select an appropriate configuration.

### 8.3 Step 2: ServerHello

The server selects compatible handshake parameters and responds.

The client and server use the negotiated key-establishment mechanism to derive shared secrets used to protect the connection.

The shared secrets are not simply sent as plaintext across the network.

### 8.4 Step 3: Server Authentication

The server normally provides its certificate and proves possession of the corresponding private key as part of the handshake.

The client validates the certificate and the server's handshake proof.

Validation includes checking that the certificate is suitable for the intended hostname and is trusted under the client's certificate-validation rules.

If validation fails, a correctly configured client should reject the connection rather than silently proceeding as if the server were authenticated.

### 8.5 Step 4: Handshake Completion

The endpoints exchange handshake messages that authenticate the negotiated handshake transcript and confirm the security context.

Once the handshake completes successfully, the endpoints can exchange protected application data.

The exact sequence and messages depend on the TLS version and handshake options.

### 8.6 Step 5: Protected HTTP Communication

After the secure connection is established, HTTP messages are carried through the protected channel.

The application can continue using familiar HTTP methods, headers, status codes, and bodies. TLS protects the communication without changing the intended meaning of those HTTP elements.

**Important:** A successful TLS handshake establishes a protected connection. It does not prove that the application request is valid, that the caller has permission to access a resource, or that the server's business logic is correct.

## 9. Certificate Validation and Hostname Verification

Certificate validation is one of the most important parts of HTTPS.

Consider a client requesting:

```text
https://api.example.com
```

Suppose the server presents a certificate that is valid for:

```text
other.example.com
```

Even if the certificate was issued by a trusted CA and has not expired, it does not identify the requested hostname.

The client should reject the connection because the certificate does not match the intended server identity.

### 9.1 Common Validation Failures

| Failure | Why it matters |
|---|---|
| Expired certificate | The certificate is outside its validity period |
| Untrusted issuer | The chain cannot be validated to an accepted trust anchor |
| Hostname mismatch | The certificate does not identify the requested hostname |
| Missing intermediate certificate | The client may be unable to construct a valid chain |
| Invalid certificate usage or constraints | The certificate may not be suitable for the intended purpose |
| Incorrect system clock | Time-based certificate checks can fail |
| Incomplete certificate deployment | Different clients may fail to build or validate the chain |

These failures are not interchangeable. Diagnosing the specific validation error is more useful than simply labeling every failure as an “SSL issue.”

The term *SSL error* is commonly used informally, but modern HTTPS generally uses TLS rather than the obsolete SSL protocols.

### 9.2 Why Disabling Certificate Verification Is Dangerous

A developer may encounter a certificate error while testing an API and attempt to bypass verification.

For example, a Python HTTP client may provide an option to disable certificate verification.

This is dangerous in production because it removes an important part of server authentication. An attacker may be able to impersonate the intended server, potentially exposing credentials or modifying application data.

**Do not disable certificate verification as a production workaround.**

Instead, identify and fix the underlying problem. Possible causes include an incorrect hostname, an expired certificate, a missing intermediate certificate, or an untrusted internal CA.

For development environments using an internal CA, configure the client to trust the appropriate certificate authority rather than disabling verification.

## 10. HTTPS Does Not Replace Application Security

HTTPS protects communication between TLS endpoints. It does not automatically secure every part of the application.

Consider a backend endpoint:

```text
POST /api/users/42/delete
```

Even when accessed through HTTPS, the endpoint could still have serious vulnerabilities if the application:

- Fails to authenticate the caller.
- Does not verify whether the caller is authorized to delete the user.
- Accepts unsafe input.
- Exposes sensitive information in responses.
- Uses insecure application logic.
- Stores sensitive data insecurely.

TLS does not repair these problems.

### 10.1 HTTPS vs Authentication vs Authorization

| Concern | Main question | Typical mechanism |
|---|---|---|
| Transport security | Is communication protected against observation and modification in transit? | TLS through HTTPS |
| Server authentication | Is the client communicating with the intended server? | Certificate and hostname validation |
| User or client authentication | Who is making the request? | Credentials, tokens, client certificates, or another authentication mechanism |
| Authorization | Is the caller permitted to perform this operation? | Application access-control rules |

These concerns interact, but they solve different problems.

A valid HTTPS connection does not mean that a user is authorized to access every endpoint.

Similarly, a valid access token does not make an unprotected network connection confidential.

### 10.2 Encryption in Transit Is Not Encryption at Rest

HTTPS protects data while it travels between the TLS endpoints.

After the server receives the data, the application may process it in memory, write it to a database, send it to another service, or log some of it.

HTTPS alone does not guarantee protection for those later stages.

For example, a backend may securely receive a request over HTTPS but then accidentally write an API token to a plaintext log file.

Transport security and data-at-rest security must be considered separately.

## 11. HTTPS in Backend Systems

HTTPS is important whenever backend services communicate across networks or expose application interfaces to clients.

### 11.1 Public API

A public API commonly uses HTTPS to protect:

- Authentication credentials.
- User information.
- Request payloads.
- Response data.

The server must also manage certificates, configure its TLS termination point correctly, and ensure that application behavior remains secure.

### 11.2 Backend Calling an External LLM API

Suppose a FastAPI application sends a prompt to an external LLM provider.

```text
FastAPI Backend
      |
      | HTTPS Request
      | Authorization + Prompt
      v
External LLM API
      |
      | HTTPS Response
      | Generated Output
      v
FastAPI Backend
```

The client must validate the external server's identity and protect the connection.

It should also handle application-level errors and timeouts appropriately. A secure connection does not guarantee that the remote API is available or that the requested operation succeeds.

If a TLS certificate error occurs, the backend should report and investigate the validation failure instead of silently disabling verification.

### 11.3 TLS Termination

Some deployments terminate TLS at an ingress, gateway, or reverse proxy rather than directly inside the application process.

A simplified deployment might look like this:

```text
External Client
      |
      | HTTPS
      v
TLS-Terminating Proxy
      |
      | Internal Connection
      v
Backend Application
```

In this arrangement, the proxy handles the external TLS connection and forwards the request to the backend.

The internal connection may or may not use TLS. That decision depends on the threat model and deployment architecture.

If the internal network is not fully trusted, or if organizational requirements demand end-to-end protection across internal hops, additional TLS protection may be necessary.

TLS termination does not automatically secure the connection between the proxy and the backend.

The detailed deployment architecture belongs to production engineering. Here, the important principle is to identify where encryption starts and ends.

## 12. Engineering Trade-Offs

### 12.1 Security vs Operational Complexity

HTTPS adds certificate provisioning, renewal, validation, and configuration responsibilities.

However, these operational responsibilities are part of providing secure network communication, not a reason to omit transport security.

**Engineering rule:** Use established certificate-management and renewal mechanisms, and monitor certificate validity in production environments.

### 12.2 Certificate Trust vs Convenience

Trusting an internal certificate authority can be appropriate for private systems, but distributing trust incorrectly can create security risks.

**Engineering rule:** Configure the required trust anchors explicitly and avoid broad trust changes that are unnecessary for the application.

### 12.3 TLS Termination vs End-to-End Protection

Terminating TLS at a proxy can simplify certificate management and centralize connection handling.

However, if the internal hop is unprotected, data may no longer have TLS protection after the proxy decrypts it.

**Engineering rule:** Define the intended security boundary and protect each network segment according to its risk and requirements.

### 12.4 Compatibility vs Security

Legacy clients or servers may support outdated protocol versions or weak configurations.

**Engineering rule:** Prefer modern, supported TLS configurations and verify compatibility against the application's actual client requirements. Do not retain obsolete security settings without a clear, justified need.

## 13. Common Mistakes

### Mistake 1: Assuming HTTPS Encrypts Everything About a Connection

TLS protects application data in transit, but some metadata remains observable.

**Correction:** Understand what the deployed protocol protects and what information remains exposed.

### Mistake 2: Assuming HTTPS Guarantees a Trustworthy Website

A valid certificate helps authenticate a domain-controlled endpoint under the client's trust rules. It does not guarantee that the website is honest, safe, or free of vulnerabilities.

**Correction:** Treat HTTPS as a transport-security control, not a complete security assessment.

### Mistake 3: Disabling Certificate Verification to Fix Errors

This weakens server authentication and can expose sensitive traffic to interception.

**Correction:** Fix the certificate, hostname, trust-store, or chain configuration.

### Mistake 4: Confusing Server Authentication with User Authentication

A valid server certificate authenticates the server under the relevant validation rules. It does not identify the human or application user making the request.

**Correction:** Implement application authentication and authorization separately.

### Mistake 5: Assuming TLS Protects Data After It Reaches the Server

TLS protection does not automatically extend to logs, databases, memory dumps, or downstream services.

**Correction:** Apply suitable controls to each stage of data processing and storage.

### Mistake 6: Assuming a Trusted Certificate Is Valid for Every Domain

Certificates identify specific names and are subject to validity and usage constraints.

**Correction:** Verify hostname matching, validity, trust chain, and relevant certificate properties.

### Mistake 7: Assuming TLS Termination Secures Every Internal Connection

A proxy may decrypt the external request and forward it over a separate, unencrypted connection.

**Correction:** Identify the TLS termination point and evaluate internal network protection independently.

### Mistake 8: Treating TLS Handshake Success as Proof That the API Works

A successful handshake does not guarantee correct routing, valid application input, successful authentication, or available dependencies.

**Correction:** Separate transport-security validation from application-level success.

## 14. Interview Questions and Expected Answers

### Q1. What is HTTPS?

HTTPS is HTTP communication protected by TLS. It helps provide confidentiality, integrity, and authentication for communication between endpoints.

### Q2. What is the difference between HTTP and HTTPS?

HTTP defines application-level request and response semantics. HTTPS uses TLS to protect HTTP communication in transit.

### Q3. What security properties does TLS provide?

TLS provides confidentiality and integrity for protected data and can authenticate the server through certificate-based validation. Mutual TLS can also authenticate the client when configured appropriately.

### Q4. What is a digital certificate?

A digital certificate binds an identity, such as a domain name, to a public key under a certificate issuer's signature. Clients validate certificates according to their trust rules.

### Q5. What is a Certificate Authority?

A Certificate Authority issues certificates under a defined trust and validation process. Clients use trusted certificate authorities or other trust anchors to validate certificate chains.

### Q6. What happens during a TLS handshake?

The endpoints negotiate security parameters, establish shared cryptographic secrets, authenticate the server when applicable, and confirm the handshake before exchanging protected application data.

### Q7. Why is hostname verification necessary?

A certificate issued by a trusted authority is not sufficient if it identifies a different hostname. Hostname verification helps ensure that the certificate corresponds to the server the client intended to reach.

### Q8. Why is disabling certificate verification dangerous?

It removes an important server-authentication check. A client may then accept an impostor server and expose sensitive data or credentials.

### Q9. Does HTTPS prevent SQL injection or broken authorization?

No. HTTPS protects communication in transit. Application vulnerabilities such as SQL injection and incorrect authorization require separate application-level controls.

### Q10. What is the difference between encryption in transit and encryption at rest?

Encryption in transit protects data as it moves between endpoints. Encryption at rest protects stored data, such as database files or backups. HTTPS alone does not provide encryption at rest.

### Q11. What is TLS termination?

TLS termination is the point where a component, such as a reverse proxy, handles the TLS connection and decrypts the protected traffic. A separate connection may then carry the request to the backend.

### Q12. Can HTTPS use a port other than 443?

Yes. Port 443 is the conventional default for HTTPS, but services can use other ports when configured accordingly.

## 15. Quick Revision

- **HTTPS:** HTTP communication protected by TLS.
- **TLS:** Protocol that provides cryptographic protection for communication.
- **Confidentiality:** Prevents unauthorized observers from reading protected data in transit.
- **Integrity:** Helps detect unauthorized modifications to protected data.
- **Authentication:** Helps verify the identity of the communicating endpoint.
- **Digital certificate:** Binds an identity to a public key under a certificate issuer's signature.
- **Certificate Authority:** Issues certificates under a defined trust process.
- **Trust store:** Holds or references trusted certificate authorities or other trust anchors.
- **Hostname verification:** Checks that the certificate identifies the intended hostname.
- **TLS handshake:** Establishes the security parameters and shared secrets needed for protected communication.
- **TLS termination:** The point where a component handles and decrypts a TLS connection.
- **Encryption in transit:** Protects data while it travels between endpoints.
- **Encryption at rest:** Protects stored data.
- **Application authorization:** Determines whether a caller may perform a particular operation.

## 16. Key Takeaways

1. HTTP defines application-level communication; HTTPS protects that communication using TLS.
2. TLS helps provide confidentiality, integrity, and authentication.
3. Certificates and hostname verification are essential to ordinary HTTPS server authentication.
4. Modern TLS uses a handshake to establish the security context before protected application data is exchanged.
5. A valid HTTPS connection does not guarantee application correctness or authorization.
6. Certificate-verification failures should be diagnosed and fixed, not bypassed in production.
7. TLS termination defines an important security boundary between external and internal communication.
8. Transport security, application security, and data-at-rest protection address different risks.

## 17. Further Reading

Use these references for authoritative protocol details and practical explanations.

- [RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3](https://www.rfc-editor.org/rfc/rfc8446) — TLS 1.3 handshake and security mechanisms.
- [RFC 5280 — Internet X.509 Public Key Infrastructure Certificate and CRL Profile](https://www.rfc-editor.org/rfc/rfc5280) — Certificate and certification-path validation foundations.
- [RFC 9525 — Service Identity in TLS](https://www.rfc-editor.org/rfc/rfc9525) — Service identity verification for TLS.
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110) — HTTP semantics, including the distinction between HTTP and transport security.
- [Cloudflare Learning Center — What is HTTPS?](https://www.cloudflare.com/learning/ssl/what-is-https/) — Practical overview of HTTPS and TLS.

## 18. Connection to the Next Chapters

This chapter established how TLS protects HTTP communication. The next chapters build on the HTTP concepts without re-teaching TLS in depth.

- [Chapter 06 — REST Principles](06-REST-Principles.md): Architectural constraints for designing networked APIs.
- [Chapter 07 — Request/Response Lifecycle](07-Request-Response-Lifecycle.md): How DNS, transport communication, HTTP, and HTTPS fit into an end-to-end request.
- [Chapter 08 — APIs and Network Communication](08-APIs-and-Network-Communication.md): How applications expose and consume network interfaces.
- [Chapter 10 — Distributed Communication Basics](10-Distributed-Communication-Basics.md): How to reason about communication failures, including TLS and certificate-related failures.

---

# End of Document
