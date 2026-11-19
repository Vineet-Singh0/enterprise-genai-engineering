# ENG-06 — Networking Fundamentals

## Overview

Networking enables applications running on different processes, computers, and environments to communicate.

A backend service may need to communicate with a database, an external API, a cloud service, or an LLM provider. Understanding networking helps engineers reason about how these connections work, what can fail, and how to investigate communication problems systematically.

This module builds the networking knowledge required for backend development, API integration, distributed applications, and later production engineering topics.

The focus is on understanding how networking works—not memorizing commands or learning advanced network administration.

## Learning Objectives

After completing this module, you should be able to:

- Explain why networks and communication protocols exist.
- Understand network models and protocol layers.
- Explain how IP addresses, ports, and sockets identify communication endpoints.
- Distinguish TCP from UDP and reason about their trade-offs.
- Explain the purpose of DNS and how name resolution works.
- Understand HTTP and HTTPS communication.
- Explain the relationship between REST principles and APIs.
- Trace a request from a client to a server and understand how the response returns.
- Explain how applications serialize data for communication.
- Understand the foundations of communication between distributed services.
- Diagnose common networking failures using a systematic approach.

## Prerequisites

Complete the following Engineering Foundations modules before beginning ENG-06:

- [ENG-01 — Computer Science Fundamentals](../ENG-01-Computer-Science-Fundamentals/README.md)
- [ENG-02 — Programming Foundations](../ENG-02-Programming-Foundations/README.md)
- [ENG-03 — Software Engineering Principles](../ENG-03-Software-Engineering-Principles/README.md)
- [ENG-04 — Version Control & Collaborative Development](../ENG-04-Version-Control-Collaborative-Development/README.md)
- [ENG-05 — Linux & Development Environment](../ENG-05-Linux-Development-Environment/README.md)

These modules provide the background knowledge needed to understand application behavior, programming examples, development environments, and basic command-line operations.

## Learning Path

Study the chapters in the recommended order. Some concepts can be learned independently, but the sequence gradually connects foundational networking concepts to application communication and troubleshooting.

| Order | Chapter | Learning Focus |
|---|---|---|
| 01 | [Networking Basics](01-Networking-Basics.md) | Why networking exists, communication models, and protocol layers |
| 02 | [TCP/IP Fundamentals](02-TCP-IP-Fundamentals.md) | IP addressing, ports, sockets, TCP, UDP, routing, gateways, and basic network access |
| 03 | [DNS Fundamentals](03-DNS-Fundamentals.md) | How domain names are resolved and how DNS failures occur |
| 04 | [HTTP Fundamentals](04-HTTP-Fundamentals.md) | HTTP requests, responses, methods, headers, and status codes |
| 05 | [HTTPS Fundamentals](05-HTTPS-Fundamentals.md) | Secure HTTP communication, TLS, and certificates |
| 06 | [REST Principles](06-REST-Principles.md) | REST architectural principles and resource-oriented communication |
| 07 | [Request/Response Lifecycle](07-Request-Response-Lifecycle.md) | How networking and application protocols combine during a request |
| 08 | [APIs and Network Communication](08-APIs-and-Network-Communication.md) | How applications expose and consume network-accessible interfaces |
| 09 | [Serialization Fundamentals](09-Serialization-Fundamentals.md) | How structured data is represented for exchange between applications |
| 10 | [Distributed Communication Basics](10-Distributed-Communication-Basics.md) | Communication across services and systematic troubleshooting |

## Concept Map

The module develops a connected mental model of networking:

1. **Networking foundations:** Understand the purpose of networks and communication protocols.
2. **Addressing and transport:** Understand how destinations are addressed and how data is transported.
3. **Name resolution:** Understand how applications use names to locate destinations.
4. **Application protocols:** Understand how clients and servers exchange application-level messages.
5. **Application interfaces and data:** Understand APIs, REST principles, and serialization.
6. **End-to-end communication:** Connect the individual concepts into a complete request/response journey.
7. **Troubleshooting:** Apply the concepts to identify likely communication failure boundaries.

The chapters are related, but they are not all strict prerequisites for one another. For example, DNS and HTTP are distinct topics, and serialization can be studied independently of the network transport.

## Networking in Software Engineering

Networking fundamentals are useful throughout software and AI engineering.

| Engineering Area | Networking Relevance |
|---|---|
| Backend development | Understanding how clients communicate with backend services |
| Databases | Reasoning about connections between applications and database servers |
| API integration | Understanding request destinations, HTTP behavior, and communication failures |
| LLM integrations | Understanding communication with external model APIs |
| Distributed applications | Reasoning about communication between services and dependency failures |
| Production engineering | Establishing a foundation for connectivity diagnosis and service reliability |
| Enterprise systems | Understanding the communication foundations behind system integration |

These are application areas for the concepts in this module. Detailed deployment architecture, production monitoring, cloud networking, and enterprise integration belong to their respective curriculum domains.

## How to Study This Module

For each chapter:

1. Read the explanation to understand the problem the concept solves.
2. Study the mental model and diagrams before memorizing terminology.
3. Trace the practical examples step by step.
4. Pay attention to engineering decisions, trade-offs, and common misconceptions.
5. Answer the interview questions without immediately looking at the expected answers.
6. Use Quick Revision and Key Takeaways when revisiting the chapter.
7. Explain the concept in your own words and connect it to a real application.

Focus on understanding cause and effect. Knowing that a command failed is less useful than understanding what that failure establishes, what it does not establish, and what evidence to collect next.

## Scope Boundaries

This module focuses on networking fundamentals for software engineers.

It does not attempt to teach:

- Advanced routing protocols or enterprise network-device configuration
- Deep packet-level protocol implementation
- Advanced cryptography or TLS internals
- Production load-balancing or reverse-proxy architecture
- VPN implementation or advanced network security
- Docker networking internals or Kubernetes networking
- Cloud VPC architecture or infrastructure as code
- Advanced observability and network automation

These subjects may be referenced when they help explain a foundational concept, but their detailed implementation belongs to later curriculum topics.

## Cross-Domain Connections

ENG-06 builds on the Engineering Foundations modules and supports later domains.

- **ENG-01 — Computer Science Fundamentals:** Provides foundational knowledge of computer systems and operating-system behavior.
- **ENG-02 — Programming Foundations:** Provides the programming knowledge used in client/server and data-exchange examples.
- **ENG-03 — Software Engineering Principles:** Provides the software-design background relevant to application interfaces.
- **ENG-04 — Version Control & Collaborative Development:** Provides experience with network-accessible development services.
- **ENG-05 — Linux & Development Environment:** Provides command-line and development-environment familiarity.
- **PROD — Production AI Engineering:** Applies networking knowledge to deployment, connectivity, reliability, and operational diagnosis.
- **ENT — Enterprise AI Systems:** Uses networking foundations when reasoning about application and service integration.

ENG-06 establishes the underlying concepts. It does not replace the detailed teaching owned by these other modules.

## Completion Criteria

Consider this module complete when you can:

- Explain the difference between an IP address, a port, and a socket.
- Explain TCP and UDP without relying only on memorized definitions.
- Describe how DNS resolution fits into application communication.
- Explain the difference between HTTP and HTTPS.
- Distinguish REST principles from APIs in general.
- Trace a client request through the relevant networking and application layers.
- Explain how serialization enables structured data exchange.
- Investigate a connectivity failure by gathering evidence and testing hypotheses systematically.
- Teach the complete request/response journey to another engineer using a practical example.

The goal is not to memorize every protocol detail. It is to build a reliable mental model that helps you understand unfamiliar networking problems and investigate them effectively.

---

**Module:** ENG-06 — Networking Fundamentals  
**Domain:** Engineering Foundations (ENG)  
**Documentation Standard:** Enterprise GenAI Engineering Documentation Generator v3.1
