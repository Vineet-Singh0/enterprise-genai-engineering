# Networking Basics

## Learning Objectives

After completing this chapter, you should be able to:

- Explain why computer networks exist and what problems they solve.
- Describe how applications communicate across different computers.
- Distinguish a network, a protocol, and a network service.
- Understand the client-server communication model.
- Explain why networking requires multiple protocol layers.
- Describe the purpose of the OSI and TCP/IP models.
- Understand the basic idea of encapsulation and decapsulation.
- Connect networking fundamentals to backend development and GenAI applications.

## Prerequisites

Before starting this chapter, you should understand:

- Basic computer-system concepts from ENG-01.
- The role of processes and applications.
- Basic programming concepts from ENG-02.
- Operating-system and command-line fundamentals from ENG-05.

You do not need prior knowledge of networking protocols. Concepts such as IP addressing, ports, TCP, UDP, DNS, HTTP, and HTTPS will be introduced in their dedicated chapters.

## Estimated Reading Time

25–35 minutes.

## Before We Start

Imagine you are developing a backend application on your laptop.

The application needs to retrieve information from a database running on another computer. It also needs to call an external LLM API to generate a response.

Your application can execute its code correctly, but it still needs a way to communicate with those remote systems.

Consider these questions:

- How does your application reach another computer?
- How does the receiving computer understand the information being sent?
- How can multiple applications communicate without interfering with one another?
- What happens when the destination cannot be reached?

These questions reveal an important fact: **running an application and communicating with another application are different problems.**

A program can execute correctly on its own computer and still fail because its communication path is unavailable, its destination is incorrect, or the receiving service cannot process the request.

Networking provides the mechanisms and conventions that allow independent systems to communicate.

## Why Networking Exists

### The problem with isolated computers

A computer can perform useful work independently. It can run programs, process data, and store information.

However, isolated computers cannot directly exchange information through software communication unless some communication mechanism connects them.

Without networking, organizations would struggle to:

- Share files between computers.
- Access centralized databases.
- Use remote application servers.
- Communicate with external services.
- Distribute computation across multiple machines.
- Connect users to applications hosted elsewhere.

One solution would be to transfer data manually using removable storage. That can work for occasional transfers, but it is inefficient for applications that need frequent or immediate communication.

Networking makes communication possible through connected systems and agreed communication rules.

### What a network provides

A computer network is a collection of connected devices that can exchange information using communication technologies and protocols.

The devices may include computers, servers, phones, routers, and other network-capable systems.

A network provides the foundation for applications to exchange data without requiring every application to run on the same computer.

For example:

```text
User's Browser
      |
      | Network communication
      |
      v
Backend Application
      |
      | Network communication
      |
      v
Database Server
```

The browser, backend, and database may run on separate computers. Networking allows them to participate in one application workflow.

### Why shared rules are necessary

Connecting computers is not enough.

Suppose one computer sends a message using a format that the receiving computer does not understand. The physical connection may work, but communication at the application level will still fail.

Communicating systems need shared rules for tasks such as:

- Representing and transmitting data.
- Identifying communication destinations.
- Moving data between connected systems.
- Determining how messages should be interpreted.
- Handling communication errors.

These rules are called **protocols**.

A protocol defines agreed behavior for a particular aspect of communication. Different protocols solve different parts of the problem.

## Mental Model

### Networking as a delivery system

Think of a network as a delivery system.

A sender wants to deliver information to a destination. For the delivery to succeed, several things must happen:

1. The destination must be identified.
2. The information must be represented in an agreed form.
3. The delivery system must know how to move the information toward the destination.
4. The receiving system must know how to interpret it.
5. The receiving application must be able to process it.

No single mechanism necessarily handles every responsibility.

In a real network, protocols work together to provide these capabilities.

The analogy has limits. Network communication is not identical to physical mail delivery: data may be split into packets, paths can change, and transport protocols may provide different delivery guarantees.

### A practical example

Suppose a backend application calls an external LLM service.

```text
Backend Application
        |
        | Sends a request
        v
Communication Mechanisms
        |
        | Data travels through a network
        v
External LLM Service
        |
        | Processes the request
        v
Response returns to the backend
```

The backend does not need to know every internal detail of the remote server. It does, however, depend on the communication rules and services required to reach that server.

If the request fails, the cause might involve the destination, the network path, the communication protocol, or the remote application. Understanding networking helps an engineer distinguish these possibilities.

## Core Concepts

### 1. Network

A network connects devices so that they can exchange information.

Networks can differ in size, ownership, technology, and geographical coverage.

For example:

- A home network connects personal devices.
- An office network connects employee devices and internal services.
- The internet connects networks around the world.

The important concept is not the size of the network. It is the ability of connected systems to exchange information through agreed mechanisms.

### 2. Node

A **node** is a device or system participating in a network.

Examples include:

- A laptop.
- A backend server.
- A database host.
- A network router.

A node may send information, receive information, forward traffic, or perform several of these roles.

A node is not necessarily a single application. One computer can host multiple applications that communicate through the same network interface.

### 3. Protocol

A protocol defines rules for communication.

Imagine two systems attempting to exchange a message. They need to agree on how the message is structured and what the receiver should do with it.

Protocols establish those expectations.

Different protocols have different responsibilities. Some help move data between systems. Others define how applications represent requests and responses.

For example, HTTP defines application-level message behavior, while TCP provides a different set of communication capabilities. Their detailed behavior is covered in later chapters.

A protocol is not the same as a network. The network provides the communication environment; protocols define how participating systems communicate within it.

### 4. Client and Server

A **client** initiates or requests an operation. A **server** provides a service or processes the request.

Consider a browser accessing a website:

```text
Client                              Server
  |                                   |
  | -------- Request --------------> |
  |                                   |
  | <------- Response -------------- |
  |                                   |
```

The client requests information, and the server returns a response.

This model also appears in backend systems:

- A mobile application acts as a client of a backend API.
- A backend application acts as a client of a database service.
- A backend application acts as a client when calling an external LLM API.

The client-server relationship is a communication role, not necessarily a permanent property of a computer. A backend service can act as a server for one interaction and as a client for another.

### 5. Network Service

A network service provides a capability that another system can access through communication.

Examples include:

- A web service.
- A database service.
- An authentication service.
- An external model-inference API.

A server machine may host multiple services. The networking mechanisms and application protocols help clients reach the intended service and communicate with it.

The distinction matters because successfully reaching a machine does not automatically mean that the desired service is available.

### 6. Communication Protocol Layers

Networking involves several different responsibilities.

For example, an application needs to represent its request, communicate with a remote endpoint, and move information across the network.

Trying to implement all these responsibilities as one tightly coupled mechanism would make systems difficult to develop, maintain, and interoperate.

Networking models organize related responsibilities into **layers**.

Each layer has a defined role and relies on services provided by lower layers. It also provides capabilities that higher layers can use.

This organization allows a change in one part of the communication system without necessarily requiring every other part to change.

For example, an application can use HTTP without needing to implement the underlying transport mechanism itself.

Layering does not mean that each layer is completely independent. The layers interact through defined interfaces and protocol behavior.

## Network Models and Protocol Layers

Network models provide a conceptual structure for understanding how communication responsibilities are organized.

Two commonly discussed models are the OSI model and the TCP/IP model.

### The OSI model

The Open Systems Interconnection (OSI) model describes networking through seven conceptual layers.

| Layer | Name | General Responsibility |
|---:|---|---|
| 7 | Application | Provides network-related capabilities to applications. |
| 6 | Presentation | Describes how data is represented, formatted, or transformed. |
| 5 | Session | Describes the establishment and management of communication sessions. |
| 4 | Transport | Provides communication between endpoints, including transport behavior and delivery characteristics. |
| 3 | Network | Handles logical addressing and forwarding between networks. |
| 2 | Data Link | Handles communication across a directly connected network link. |
| 1 | Physical | Represents the transmission of signals over the physical medium. |

The OSI model is primarily a conceptual reference for understanding networking responsibilities. Real-world protocols do not always fit neatly into one layer.

The purpose of the model is to help engineers reason about where a responsibility belongs, not to force every implementation into a perfect seven-layer structure.

### The TCP/IP model

The TCP/IP model describes networking using a smaller set of layers commonly associated with internet communication.

| Layer | General Responsibility | Examples |
|---|---|---|
| Application | Application-level communication and data formats | HTTP, DNS |
| Transport | Communication between application endpoints | TCP, UDP |
| Internet | Logical addressing and packet forwarding between networks | IP |
| Link / Network Access | Communication over the local network technology | Ethernet, Wi-Fi |

This model provides a useful practical mental model for understanding internet communication.

The OSI and TCP/IP models are not competing implementations that applications must choose between. They are different ways to organize and explain networking responsibilities.

### How the layers work together

Suppose a backend application sends an HTTP request to a remote service.

At a conceptual level:

```text
Application Layer
    Creates an HTTP request
            |
            v
Transport Layer
    Provides transport behavior
            |
            v
Internet Layer
    Handles IP addressing and forwarding
            |
            v
Link Layer
    Transmits data over a local network
```

At the receiving system, the corresponding networking mechanisms process the incoming data so that the receiving application can interpret the request.

This is a conceptual illustration. The exact processing depends on the protocols and implementation involved.

The important point is that application communication relies on several cooperating mechanisms.

### Why layers are useful

Layering gives engineers a way to isolate responsibilities.

Suppose an application receives an HTTP error. That is different from a failure to establish a network connection. Both affect communication, but they occur at different stages and require different investigations.

Similarly, an application may be correctly formatted while the destination is unreachable.

Thinking in layers helps engineers avoid treating every communication failure as the same problem.

The detailed behavior of addressing, transport, DNS, HTTP, and HTTPS is covered in the chapters dedicated to those concepts.

## Internal Working

### Encapsulation: preparing data for transmission

When information moves through networking layers, each layer may add information needed for its own communication responsibility.

This process is called **encapsulation**.

Consider an application sending a request:

```text
Application Data
       |
       v
+----------------------+
| Transport Information|
+----------------------+
| Application Data     |
+----------------------+
       |
       v
+----------------------+
| IP Information       |
+----------------------+
| Transport Information|
| Application Data     |
+----------------------+
       |
       v
+----------------------+
| Link Information     |
+----------------------+
| IP Information       |
| Transport Information|
| Application Data     |
+----------------------+
```

The diagram is simplified. Actual packet and frame formats depend on the protocols involved, and some layers may add additional information.

The general principle is that each layer prepares information for the next stage of communication.

The receiving system processes the relevant information in the reverse direction. This is called **decapsulation**.

### Decapsulation: interpreting received data

At the receiving system, networking mechanisms inspect the information added during transmission and pass the remaining data to the appropriate higher layer.

Conceptually:

```text
Incoming Network Data
          |
          v
Link-Level Processing
          |
          v
IP-Level Processing
          |
          v
Transport-Level Processing
          |
          v
Application Receives Data
```

The process is not simply a universal sequence of identical operations for every packet. It illustrates how responsibilities are divided across layers.

### Why encapsulation matters

Encapsulation allows different layers to perform their jobs without requiring each layer to understand every detail of the others.

For example, an application can use an established communication interface while lower layers handle addressing and transmission.

This separation is one reason networking protocols can work together across different systems and implementations.

## Practical Examples

### Example 1: Calling an external LLM API

Suppose a backend service needs to generate a response using an external model.

The application-level workflow might look like this:

```text
User
 |
 v
Backend API
 |
 | Creates a request
 v
Networking and protocol mechanisms
 |
 | Communicate with remote endpoint
 v
LLM API Service
 |
 | Processes the request
 v
Response returns to backend
 |
 v
Backend processes the result
```

Several responsibilities are involved:

1. The backend prepares the application request.
2. The communication mechanisms help deliver the request.
3. The remote service receives and processes it.
4. A response is returned.
5. The backend interprets the response and continues its workflow.

The application depends on networking, but networking does not define the model's inference logic.

If the request fails, the engineer must determine whether the issue concerns the destination, communication path, protocol exchange, or remote service behavior.

### Example 2: Accessing a database

A backend application may connect to a database hosted on another machine.

The backend needs more than the database's existence. It needs a usable communication path and a database service that accepts the connection.

A successful network connection also does not guarantee that a database query will succeed. Authentication, database permissions, query validity, and application behavior are separate concerns.

This distinction helps engineers avoid assuming that every database error is a networking error.

### Example 3: Local versus remote communication

Consider two development setups.

**Setup A: Local application**

```text
Backend Application
        |
        v
Database on the same machine
```

**Setup B: Remote database**

```text
Backend Application
        |
        v
Network Communication
        |
        v
Database on another machine
```

The second setup introduces additional communication dependencies. The remote database must be reachable through the relevant network path, and the required service must be available.

The exact addressing and connection behavior will be explained in the TCP/IP Fundamentals chapter.

## Production Perspective

Networking is part of the foundation of modern software systems.

### Backend services

A backend application often communicates with databases, authentication providers, storage systems, and other APIs.

Understanding networking helps engineers reason about why a service can work locally but fail in another environment.

### GenAI applications

A GenAI application may depend on:

- A backend API.
- An embedding service.
- A vector database.
- An external LLM provider.
- An authentication service.

These components may run on different machines or in different environments. Their communication dependencies can affect whether the complete application workflow succeeds.

### Distributed applications

In a distributed application, different components communicate across service boundaries rather than relying only on function calls within one process.

This introduces communication failures that cannot always be resolved by examining application logic alone.

Later chapters will explain the request lifecycle and distributed communication concepts in more detail.

## Engineering Decisions and Trade-offs

### Why use layers instead of one communication mechanism?

A layered design separates responsibilities and makes systems easier to reason about.

However, layers introduce boundaries and additional processing. Understanding those boundaries is useful when investigating failures or performance problems.

The purpose of layering is not to make communication magically reliable. It is to organize responsibilities so that systems can interoperate and failures can be investigated more systematically.

### Why distinguish a machine from a service?

A machine can be reachable while a particular service is unavailable.

For example, a server may be running, but its database process may have stopped.

Engineers should therefore distinguish:

- Whether the destination system can be reached.
- Whether the required service is accepting communication.
- Whether the application-level operation succeeds.

These are different questions and may require different evidence.

### Why separate networking from application behavior?

Networking can deliver data without guaranteeing that the receiving application will accept or correctly process it.

Similarly, an application may construct a valid request that never reaches the destination.

A reliable diagnosis separates the communication mechanism from the application's own behavior.

## Common Mistakes and Misconceptions

### Mistake 1: Treating networking as only a physical connection

A physical or wireless connection is only one part of networking.

Communication also depends on addressing, protocols, transport behavior, and the receiving service.

**Correct understanding:** Networking includes the rules and mechanisms that allow connected systems to exchange meaningful information.

### Mistake 2: Assuming a reachable machine guarantees a working application

A machine can be reachable while a service is unavailable or returning errors.

**Correct understanding:** Machine reachability, service availability, and application success are separate conditions.

### Mistake 3: Treating all protocols as interchangeable

Protocols have different responsibilities and assumptions.

**Correct understanding:** Each protocol contributes specific behavior to the communication process. Their responsibilities must be understood in context.

### Mistake 4: Assuming the OSI model is a literal implementation blueprint

Real protocols do not always map perfectly onto the OSI layers.

**Correct understanding:** The OSI model is a conceptual framework for organizing networking responsibilities.

### Mistake 5: Assuming a request failure must be an application bug

The application may be correct while a destination, network path, or communication dependency is unavailable.

**Correct understanding:** Investigate the relevant communication stages instead of assuming the cause.

### Mistake 6: Believing layering eliminates all dependencies

Layers interact and depend on one another.

**Correct understanding:** Layering separates responsibilities; it does not remove the need for those responsibilities to work together.

## Interview Questions

### 1. Why do computer networks need protocols?

**Expected answer:**

Protocols define agreed rules for communication. They allow systems to interpret exchanged information consistently and coordinate different aspects of communication, such as addressing, transport, and application messages.

### 2. What is the difference between a network and a protocol?

**Expected answer:**

A network connects devices so they can exchange information. A protocol defines the rules those devices follow when communicating.

### 3. Explain the client-server model using a backend application.

**Expected answer:**

A client requests an operation from a server, and the server provides the requested service or returns a response. A backend can act as a server for incoming API requests and as a client when calling a database or an external LLM API.

### 4. Why are networking responsibilities divided into layers?

**Expected answer:**

Layering separates communication responsibilities. Each layer provides capabilities to other layers, making the system easier to understand, implement, and maintain. The layers still depend on one another.

### 5. What is the difference between the OSI and TCP/IP models?

**Expected answer:**

The OSI model describes networking through seven conceptual layers. The TCP/IP model groups networking responsibilities into a smaller set of layers commonly used to explain internet communication. Both help engineers reason about protocol responsibilities.

### 6. What is encapsulation?

**Expected answer:**

Encapsulation is the process by which a networking layer adds information needed for its communication responsibilities as data moves toward transmission. The receiving system processes that information during decapsulation.

### 7. A backend application cannot call an external API. What should you conclude?

**Expected answer:**

Only that the communication attempt failed. The failure could involve the destination, configuration, network path, transport, application protocol, or remote service. More evidence is required to identify the cause.

### 8. Why does a reachable server not guarantee that a database query will succeed?

**Expected answer:**

Reachability does not guarantee that the database service is available, that authentication succeeds, that permissions are sufficient, or that the query is valid. These are separate stages of the operation.

### 9. Can a backend application be both a client and a server?

**Expected answer:**

Yes. It can receive requests as a server and initiate requests to other services as a client. These terms describe roles in a communication interaction.

### 10. How does networking knowledge help a GenAI engineer?

**Expected answer:**

GenAI applications depend on communication among backend services, databases, embedding systems, and model APIs. Networking knowledge helps engineers understand dependencies and distinguish connectivity failures from application-level failures.

## Quick Revision

- A **network** connects devices so they can exchange information.
- A **protocol** defines rules for communication.
- A **node** is a device or system participating in a network.
- A **client** requests an operation; a **server** provides a service.
- A **network service** provides a capability that other systems can access.
- **Protocol layers** organize communication responsibilities.
- The **OSI model** has seven conceptual layers; the **TCP/IP model** uses a smaller grouping.
- **Encapsulation** adds layer-specific communication information.
- **Decapsulation** processes that information at the receiving system.
- A reachable machine does not guarantee a reachable service or successful application operation.
- Networking problems and application problems are related, but they are not identical.

## Key Takeaways

1. Networking enables independent systems to communicate.
2. Communication requires shared protocols and clearly defined responsibilities.
3. Network models help engineers understand how different communication mechanisms work together.
4. Layering separates responsibilities without eliminating dependencies.
5. Understanding communication boundaries makes troubleshooting more systematic.
6. Backend and GenAI applications rely on networking whenever their components communicate across system boundaries.

## Further Reading

The following resources provide authoritative explanations of the concepts introduced in this chapter.

- [Cisco — What Is Computer Networking?](https://www.cisco.com/c/en/us/solutions/enterprise-networks/what-is-computer-networking.html) — An introduction to network purpose and components.
- [Cloudflare Learning Center — What Is the OSI Model?](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/) — A practical explanation of the OSI layers.
- [Internet Society — A Brief History of the Internet](https://www.internetsociety.org/internet/history-internet/brief-history-internet/) — Historical context for the development of internet communication.

All content can now be saved as a single production-ready Markdown document in the ENG-06 repository.
