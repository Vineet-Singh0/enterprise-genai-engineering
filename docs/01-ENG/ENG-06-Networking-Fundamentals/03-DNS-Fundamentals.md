# DNS Fundamentals

## Learning Objectives

After completing this chapter, you should be able to:

- Explain why DNS exists and why applications use domain names instead of relying only on IP addresses.
- Understand the relationship between domain names and IP addresses.
- Explain how DNS resolution works at a conceptual level.
- Distinguish recursive resolvers from authoritative DNS servers.
- Understand common DNS record types and their purposes.
- Explain DNS caching and its effects on application behavior.
- Recognize common DNS configuration and resolution failures.
- Understand how DNS fits into backend development, API integrations, and GenAI applications.
- Apply DNS concepts when investigating connectivity problems.

## Prerequisites

You should understand the following concepts:

- [Networking Basics](01-Networking-Basics.md)
- [TCP/IP Fundamentals](02-TCP-IP-Fundamentals.md)

In particular, you should understand that IP addresses identify network destinations and that successful communication depends on more than knowing an address.

## Estimated Reading Time

25–35 minutes.

## Before We Start

Imagine your backend application needs to call an external LLM API.

You configure the application to contact a hostname such as:

```text
api.example.com
```

But network communication ultimately needs an IP address to reach the appropriate destination.

How does the application find that address?

One option would be to maintain a list of IP addresses for every service the application uses. However, addresses can change, services can move, and large systems may have multiple addresses.

Maintaining those addresses manually would quickly become difficult.

The internet solves this problem using the **Domain Name System (DNS)**.

DNS provides a distributed system for associating domain names with information about the services and network destinations they represent.

It allows applications to use stable, meaningful names while the underlying address information can change.

## Why DNS Exists

### The problem with using only IP addresses

An IP address identifies a network destination, but it is not an especially convenient identifier for people or application configuration.

Consider these two examples:

```text
203.0.113.10
api.example.com
```

The first is an illustrative IPv4 address. The second is a hostname.

A hostname is easier to recognize and maintain in application configuration.

Without DNS, applications would often need to obtain destination addresses through manually maintained configuration or other mechanisms.

That approach becomes difficult when:

- A service changes its IP address.
- A service uses multiple IP addresses.
- An application depends on many external services.
- Infrastructure changes independently of application code.
- Different environments use different service destinations.

DNS separates the name used to identify a service from the address information needed to reach it.

### DNS is a distributed system

DNS information is not maintained by one central computer that answers every query on the internet.

Instead, DNS uses a hierarchy of servers and delegated responsibility for different parts of the domain-name space.

This distributed design allows different organizations to manage their own domain information while participating in a shared naming system.

For example, an organization can manage DNS records for its own domain without maintaining records for every other domain on the internet.

### What DNS does not do

DNS helps resolve names and retrieve associated information. It does not guarantee that the resulting destination is reachable or that the requested application is functioning.

A hostname can resolve successfully while:

- The destination is unavailable.
- A firewall blocks the connection.
- The service is not listening on the expected port.
- The application returns an error.

DNS is one stage in communication, not proof that the complete operation will succeed.

## Mental Model: A Directory for Network Destinations

Think of DNS as a distributed directory.

You know the name of the service you want to reach. The directory helps you discover the information associated with that name.

The simplified relationship is:

```text
Application
    |
    | Requests information about a hostname
    v
DNS Resolution
    |
    | Returns relevant DNS information
    v
IP Address or Other DNS Data
    |
    v
Application Uses the Result
```

This is a conceptual model. DNS can return multiple records or different types of information, and a resolution process may involve caches and several DNS servers.

The important idea is that the application does not have to treat the destination's IP address as its permanent identity.

## Core Concepts

## 1. Domain Names and Hostnames

### 1.1 What is a domain name?

A **domain name** is a human-readable name within the hierarchical DNS namespace.

For example:

```text
example.com
```

Domain names are organized hierarchically, with labels separated by dots.

Consider:

```text
api.example.com
```

Its labels are:

- `api`
- `example`
- `com`

The hierarchy is read from right to left when considering DNS delegation.

The `com` top-level domain is above `example.com`, which is above `api.example.com`.

### 1.2 Domain names versus hostnames

A domain name identifies a name within the DNS namespace.

A **hostname** is a name used to identify a host or network-accessible endpoint. In common application configuration, names such as `api.example.com` are often called hostnames.

The terms overlap in everyday software engineering, but they are not always interchangeable in every DNS context.

For this chapter, a hostname such as `api.example.com` is the name an application asks DNS to resolve.

### 1.3 Why hostnames are useful

Suppose an application uses this configuration:

```text
LLM_API_HOST=api.example.com
```

The service's address can change while the application continues to use the same hostname, provided the DNS configuration is updated appropriately.

This reduces the need to embed network addresses throughout application code.

However, DNS does not automatically update every application cache or guarantee that all clients observe a change immediately. Caching behavior matters and is covered later in this chapter.

## 2. The DNS Hierarchy

DNS uses a hierarchical naming system.

At a high level, the hierarchy contains:

1. The DNS root.
2. Top-level domains.
3. Domains beneath those top-level domains.
4. Further subdomains and names.

For example:

```text
                         Root
                           |
                           v
                          .com
                           |
                           v
                       example.com
                           |
                           v
                     api.example.com
```

This diagram simplifies the actual DNS hierarchy.

### 2.1 Root servers

Root DNS servers help direct resolvers toward the authoritative DNS infrastructure for top-level domains.

They generally do not contain the final IP address for every hostname.

Instead, they provide referrals that help the resolver continue the lookup.

### 2.2 Top-level domains

A **top-level domain (TLD)** is the part of a domain name immediately below the DNS root.

Examples include:

- `.com`
- `.org`
- `.in`

TLD infrastructure helps resolvers discover the DNS servers responsible for domains registered under the relevant top-level domain.

### 2.3 Authoritative domain information

An organization can configure authoritative DNS servers for its domain.

For example, the authoritative DNS infrastructure for `example.com` can contain records for names such as:

```text
api.example.com
www.example.com
mail.example.com
```

Each name can have different DNS records depending on the organization's requirements.

The owner of a domain can update its authoritative DNS records without requiring every application to be manually reconfigured with the new IP address.

## 3. How DNS Resolution Works

### 3.1 What is DNS resolution?

**DNS resolution** is the process of obtaining DNS information for a name.

When an application needs an address associated with a hostname, it typically uses a DNS resolver through its operating system or networking library.

The resolver may already have the required information cached. If not, it may need to query other DNS servers.

### 3.2 Recursive resolvers

A **recursive resolver** accepts a query from a client and attempts to obtain the requested DNS information on the client's behalf.

It may use cached data or query other DNS infrastructure to find the answer.

Recursive resolvers are commonly provided by:

- Internet service providers.
- Public DNS services.
- Organizations operating internal networks.
- Cloud or enterprise networking environments.

The client generally does not need to contact every DNS server in the hierarchy itself.

### 3.3 Authoritative DNS servers

An **authoritative DNS server** provides DNS information from the authoritative data for a domain.

For example, an authoritative server for `example.com` can provide the configured records for `api.example.com`.

A recursive resolver may consult authoritative servers to obtain information that it does not already have cached.

The distinction is important:

- A recursive resolver finds or retrieves information for a client.
- An authoritative server provides information for the domains for which it is authoritative.

A single DNS provider may operate both recursive and authoritative services, but their responsibilities remain distinct.

### 3.4 A simplified resolution flow

Suppose an application needs to resolve:

```text
api.example.com
```

A simplified process is:

```text
Application
    |
    v
Operating System / DNS Stub Resolver
    |
    | Sends a DNS query
    v
Recursive Resolver
    |
    | Checks its cache
    |
    | If necessary, follows DNS referrals
    v
Root DNS Infrastructure
    |
    v
TLD DNS Infrastructure
    |
    v
Authoritative DNS Server
    |
    | Returns the requested DNS information
    v
Recursive Resolver
    |
    | Returns the result
    v
Application
```

The flow illustrates a common cache-miss path. It is not the sequence performed for every query.

A resolver may already have the answer cached, and different DNS configurations can alter which servers are consulted.

### 3.5 What happens after resolution?

Suppose DNS returns an IP address for a hostname.

The application can then use the result when initiating communication with the destination.

For an HTTP-based service, the subsequent steps may involve establishing transport communication and exchanging HTTP messages.

Those mechanisms are explained in:

- [TCP/IP Fundamentals](02-TCP-IP-Fundamentals.md)
- [HTTP Fundamentals](04-HTTP-Fundamentals.md)
- [Request/Response Lifecycle](07-Request-Response-Lifecycle.md)

DNS resolution and application communication are related but separate stages.

## 4. DNS Record Types

DNS records describe information associated with names.

Different record types serve different purposes.

### 4.1 A record

An **A record** associates a hostname with an IPv4 address.

Example:

```text
api.example.com.  IN  A  203.0.113.10
```

This illustrative record says that `api.example.com` has an associated IPv4 address of `203.0.113.10`.

The address is reserved for documentation and should not be treated as a real production endpoint.

### 4.2 AAAA record

An **AAAA record** associates a hostname with an IPv6 address.

Example:

```text
api.example.com.  IN  AAAA  2001:db8::10
```

This is also a documentation example.

A hostname may have an A record, an AAAA record, both, or neither.

Applications and operating systems may have different address-selection behavior depending on configuration and network availability.

### 4.3 CNAME record

A **CNAME record** identifies another DNS name as the canonical name for an alias.

Example:

```text
www.example.com.  IN  CNAME  example.com.
```

This indicates that `www.example.com` is an alias for `example.com`.

A resolver follows the alias to obtain the relevant DNS information for the canonical name.

A CNAME is not itself an IP address. It points to another name.

DNS imposes restrictions on where CNAME records can coexist with other records at the same name. Engineers should not assume that any arbitrary combination of records is valid.

### 4.4 MX record

An **MX record** specifies a mail server responsible for receiving email for a domain, along with a preference value.

Example:

```text
example.com.  IN  MX  10 mail.example.com.
```

The number `10` is an example preference value. When multiple MX records exist, their preference values help determine which mail server should be attempted first.

An MX record does not directly identify an IP address. The mail server's hostname must itself be resolved as needed.

### 4.5 NS record

An **NS record** identifies a name server associated with a DNS zone.

Example:

```text
example.com.  IN  NS  ns1.example.net.
```

NS records are important for DNS delegation and identifying the servers responsible for a zone.

The full delegation process also involves DNS configuration at the parent zone.

### 4.6 TXT record

A **TXT record** stores text associated with a DNS name.

TXT records are used for several purposes, including domain-verification checks and email-related policies.

The meaning of the text depends on the application or standard using the record. DNS does not interpret every TXT record as the same kind of policy.

### 4.7 PTR record

A **PTR record** provides a pointer from a reverse-DNS name to another name.

PTR records are commonly used in reverse DNS lookups, where a query begins with an IP address and seeks associated naming information.

Reverse DNS information does not necessarily prove that a hostname is the intended identity of a service. It is one piece of DNS information and should be interpreted in context.

### 4.8 Record summary

| Record | Primary purpose | Typical use |
|---|---|---|
| A | Maps a name to an IPv4 address | IPv4 destination lookup |
| AAAA | Maps a name to an IPv6 address | IPv6 destination lookup |
| CNAME | Aliases one DNS name to another | Name indirection |
| MX | Identifies mail servers for a domain | Email delivery |
| NS | Identifies name servers for a zone | DNS delegation |
| TXT | Stores text associated with a name | Verification and policy information |
| PTR | Maps a reverse-DNS name to another name | Reverse DNS lookup |

This chapter focuses on understanding the roles of these records. Detailed DNS zone administration is outside ENG-06's scope.

## 5. DNS Caching and TTL

### 5.1 Why caching exists

DNS resolution can require communication with multiple servers.

Repeating the complete lookup for every application request would create unnecessary traffic and latency.

DNS uses caching to retain answers for a period of time.

A cached answer allows a resolver or another permitted caching component to answer subsequent queries without repeating the entire resolution process.

### 5.2 What is TTL?

A DNS record's **Time to Live (TTL)** indicates how long the record may be cached before it should be treated as expired.

For example, a TTL of 300 seconds represents five minutes.

A simplified example:

```text
Hostname: api.example.com
Address: 203.0.113.10
TTL: 300 seconds
```

A resolver that caches this answer can generally reuse it while the TTL remains valid.

When the TTL expires, the resolver may need to obtain updated information before answering another query from that cache.

The TTL does not guarantee that every client will refresh at exactly the same instant.

### 5.3 Why DNS changes are not always immediate

Suppose an organization changes the address associated with a hostname.

Different resolvers and clients may have cached the previous answer at different times. Some applications may also retain DNS information within their own runtime or connection-management behavior.

As a result, not every client necessarily observes the change immediately.

The actual transition depends on factors such as:

- The previous record's TTL.
- When caches obtained their answers.
- Resolver behavior.
- Application and runtime caching.
- Existing network connections.

This is why changing a DNS record does not necessarily cause every running application to switch destinations instantly.

### 5.4 TTL trade-offs

A shorter TTL can allow cached DNS information to expire sooner, making updated records eligible to be observed more quickly.

However, shorter TTLs may increase the frequency of DNS queries.

A longer TTL can reduce repeated queries but may allow cached answers to remain in use for longer after an update.

The appropriate TTL depends on the service's operational requirements and expected change frequency.

DNS caching is not inherently good or bad. It is a trade-off between efficiency and how quickly updated information may be observed.

## 6. DNS and Application Communication

DNS is part of the process used to reach network services, but it does not replace transport or application protocols.

Consider an application configured with:

```text
LLM_API_HOST=api.example.com
```

A typical communication sequence may be:

1. The application needs to contact the hostname.
2. The relevant resolver obtains the necessary DNS information.
3. The application or networking library selects an appropriate destination address.
4. The networking stack attempts to establish communication with that destination.
5. The application protocol exchanges messages if communication succeeds.

The exact implementation depends on the application, runtime, resolver configuration, and protocol in use.

### DNS success versus service success

Suppose the hostname resolves correctly, but the API request still fails.

The DNS result establishes that the name-resolution process returned an answer. It does not establish that the destination accepts connections or that the application returns a valid response.

The failure may occur later in the communication process.

Conversely, if a hostname fails to resolve, the application may never reach the stage where it can establish a connection to the intended destination.

Distinguishing these stages helps engineers avoid investigating the wrong component.

## Internal Working: A DNS Lookup in Practice

Imagine a backend application needs to contact `api.example.com`.

### Step 1: The application requests a name

The application or networking library asks the configured resolver for DNS information associated with the hostname.

### Step 2: The local resolution path is checked

Depending on the operating system and runtime, resolution may involve local configuration, caches, and a DNS stub resolver.

A cached answer or local mapping may satisfy the request without a new recursive lookup.

### Step 3: A recursive resolver processes the query

If the recursive resolver does not have a suitable cached answer, it may follow referrals through the DNS hierarchy.

The resolver queries the relevant infrastructure until it obtains an answer or determines that the query cannot be completed successfully.

### Step 4: DNS information is returned

The resolver returns the requested DNS information, which may include an IP address or another type of record.

The answer may be cached according to its applicable caching rules.

### Step 5: The application uses the result

The application can use the resulting address information when attempting to contact the service.

The subsequent network connection and application exchange are separate from DNS resolution.

## Common DNS Failure Scenarios

### Scenario 1: The hostname does not exist

The resolver may return a negative response indicating that the queried name does not exist.

Possible causes include a typo, an incorrect hostname, or a missing DNS record.

The appropriate investigation begins by verifying the intended hostname and the relevant DNS configuration.

### Scenario 2: The name exists, but the requested record is missing

A domain may exist without having the particular record type requested.

For example, a hostname might not have an A record even though other DNS records exist.

The result depends on which record type the client requests and which records are configured.

An absent A record does not automatically prove that the hostname has no usable IPv6 address.

### Scenario 3: DNS queries time out

A DNS query may fail to receive a response within the relevant time period.

Potential causes include resolver unavailability, network connectivity problems, filtering, or other DNS-path failures.

A timeout does not prove that the domain is misconfigured. The query may have failed before reaching the authoritative DNS infrastructure.

### Scenario 4: A stale answer is being used

A resolver or application may continue to use a cached answer while it remains valid under its caching behavior.

This can explain why different clients temporarily observe different destinations after a DNS change.

The appropriate investigation considers caching behavior rather than assuming that every client immediately sees the latest record.

## Production Perspective

### Backend configuration

Backend applications commonly use hostnames to configure database servers, external APIs, authentication services, and other dependencies.

Using hostnames allows destination information to be managed through DNS and configuration rather than requiring an IP address to be embedded permanently in application code.

### LLM integrations

A backend that calls an external LLM provider depends on name resolution before it can normally establish communication with the intended service.

If resolution fails, investigating HTTP request semantics first may not be useful because the application may never reach the HTTP exchange stage.

### Deployment environments

Development, staging, and production environments may use different hostnames or DNS configurations.

An application that works in one environment may fail in another because the name resolves differently, the relevant record is missing, or the resolver path differs.

Engineers should compare the actual resolution behavior in the affected environment rather than assuming that a hostname has identical results everywhere.

### Service availability

DNS can direct clients toward configured destinations, but it does not guarantee that those destinations are healthy.

The relationship between DNS, service reachability, and application success must remain explicit when diagnosing failures.

Detailed service-discovery architecture, production traffic management, and cloud DNS design belong to later curriculum topics.

## Engineering Decisions and Trade-offs

### 1. Use hostnames where appropriate

Hostnames are generally easier to manage than embedding service IP addresses throughout application code.

However, a hostname still depends on correct DNS configuration and resolution behavior.

### 2. Choose TTL values based on requirements

Shorter TTLs can support faster observation of updated DNS records but may increase query frequency.

Longer TTLs can improve caching efficiency but may extend the period during which an old answer remains usable.

The decision should reflect the service's expected change frequency and operational requirements.

### 3. Separate DNS failures from connectivity failures

If a hostname does not resolve, investigate the resolution path.

If it resolves but communication fails, investigate the later stages of the connection.

This distinction avoids treating every failed API call as a DNS problem.

### 4. Do not assume every DNS answer is an IP address

DNS supports multiple record types. Some return address information, while others return aliases, mail-routing information, delegation information, or other data.

Interpret the answer according to the query and record type.

## Common Mistakes and Misconceptions

### Mistake 1: Assuming DNS is a single central server

DNS is a distributed and hierarchical system.

**Correct understanding:** Recursive resolvers and authoritative servers cooperate to provide DNS information.

### Mistake 2: Assuming DNS resolves every hostname through a full root-to-authoritative lookup

A recursive resolver may already have the answer cached.

**Correct understanding:** The resolution path depends on caching, resolver configuration, and the requested record.

### Mistake 3: Treating CNAME records as IP addresses

A CNAME points to another DNS name.

**Correct understanding:** The alias must be resolved further to obtain the required information.

### Mistake 4: Assuming DNS success guarantees application availability

A name can resolve to a destination that is unreachable or unavailable.

**Correct understanding:** DNS resolution and successful application communication are separate stages.

### Mistake 5: Expecting every DNS change to appear immediately

Resolvers and applications may retain cached information.

**Correct understanding:** TTLs and caching behavior affect when updated records are observed.

### Mistake 6: Assuming a missing A record means the hostname cannot resolve

The hostname may have other record types, including an AAAA record.

**Correct understanding:** Interpret DNS results in the context of the query and the application's address-selection behavior.

### Mistake 7: Assuming a DNS timeout proves that a domain is invalid

The query may have failed because of resolver or network problems.

**Correct understanding:** Investigate the resolution path and distinguish a missing name from an unanswered query.

## Interview Questions

### 1. Why does DNS exist?

**Expected answer:**

DNS provides a distributed naming system that associates domain names with information such as IP addresses. It allows applications to use names without permanently embedding network addresses in application code.

### 2. What is the difference between a recursive resolver and an authoritative DNS server?

**Expected answer:**

A recursive resolver obtains the requested DNS information on behalf of a client, using cached data or additional queries as needed. An authoritative DNS server provides DNS information for the domains or zones for which it is authoritative.

### 3. What is the purpose of an A record?

**Expected answer:**

An A record associates a DNS name with an IPv4 address.

### 4. What is the difference between an A record and an AAAA record?

**Expected answer:**

An A record provides an IPv4 address. An AAAA record provides an IPv6 address.

### 5. What does a CNAME record do?

**Expected answer:**

A CNAME record identifies another DNS name as the canonical name for an alias. It does not directly contain an IP address.

### 6. Why does DNS use caching?

**Expected answer:**

Caching reduces repeated DNS queries and can reduce lookup latency. TTLs control how long cached records may be reused, subject to the relevant caching behavior.

### 7. A DNS record has a TTL of 300 seconds. What does that mean?

**Expected answer:**

The record may generally be cached for 300 seconds, or five minutes. It does not guarantee that every client will observe a DNS change exactly five minutes after the change is made.

### 8. A hostname resolves successfully, but the API request times out. Is DNS necessarily the problem?

**Expected answer:**

No. Resolution has returned an answer, but the subsequent communication may fail because of routing, access controls, transport behavior, destination availability, or application behavior. More evidence is needed.

### 9. Why might two clients temporarily resolve the same hostname to different addresses?

**Expected answer:**

They may have obtained DNS answers at different times or from different resolver paths, and caching may cause them to retain different answers while those answers remain valid.

### 10. What would you investigate if a hostname fails to resolve in production but works locally?

**Expected answer:**

Verify the hostname, the production resolver configuration, the relevant DNS records, and the resolution behavior in the affected environment. Also determine whether the failure is a negative DNS answer or a query timeout.

## Quick Revision

- **DNS:** A distributed naming system that provides information associated with domain names.
- **Domain hierarchy:** DNS organizes names through the root, top-level domains, and subordinate domains.
- **Recursive resolver:** Obtains requested DNS information for a client.
- **Authoritative server:** Provides DNS information for the zones for which it is authoritative.
- **A record:** Associates a name with an IPv4 address.
- **AAAA record:** Associates a name with an IPv6 address.
- **CNAME:** Aliases one DNS name to another.
- **MX:** Identifies mail servers for a domain.
- **NS:** Identifies name servers associated with a zone.
- **TXT:** Stores text used by various applications and policies.
- **PTR:** Provides a name through reverse-DNS lookup.
- **TTL:** Indicates how long a DNS record may be cached.
- **DNS success:** Does not guarantee that the destination is reachable or the application is healthy.
- **DNS failure:** Must be distinguished from failures that occur after resolution.

## Key Takeaways

1. DNS separates human-readable names from the IP addresses used for network communication.
2. DNS is a distributed hierarchy, not one central lookup server.
3. Recursive resolvers and authoritative servers perform different responsibilities.
4. DNS record types represent different kinds of information.
5. Caching improves efficiency but affects how quickly DNS changes are observed.
6. DNS resolution is one stage in reaching a service, not proof of application success.
7. Engineers should identify whether a failure occurs during resolution or during subsequent communication.

## Further Reading

- [RFC 1034 — Domain Names: Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034) — Foundational description of DNS concepts and the namespace.
- [RFC 1035 — Domain Names: Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035) — Foundational DNS protocol and implementation details.
- [IANA — Root Zone Database](https://www.iana.org/domains/root/db) — Reference for top-level domain delegation.
- [ICANN — DNS Basics](https://www.icann.org/resources/pages/dns-2012-02-25-en) — Introductory information about the Domain Name System.

---

# End of Document

This completes the Markdown file: `03-DNS-Fundamentals.md`

All content can now be saved as a single production-ready Markdown document in the ENG-06 repository.
