File: `08-IO-Fundamentals.md`
---

# I/O Fundamentals

> **Domain:** Engineering Foundations (ENG)
> **Module:** ENG-01 — Computer Science Fundamentals
> **Document:** `08-IO-Fundamentals.md`

---

## Learning Objectives

After completing this chapter, you should be able to:

* Understand what Input/Output (I/O) is and why it exists.
* Explain how programs communicate with devices outside the CPU and memory.
* Build a mental model of the complete I/O path.
* Understand the roles of devices, device drivers, the operating system, and applications.
* Learn why I/O is much slower than CPU operations.
* Connect I/O concepts to production systems such as databases, cloud platforms, Docker, Kubernetes, networking, and AI systems.

---

## Prerequisites

Before reading this chapter, you should have completed:

* `README.md`
* `01-Computing-Systems-Overview.md`
* `02-CPU-Architecture.md`
* `03-Memory-Hierarchy.md`
* `04-Program-Execution-Model.md`
* `05-Operating-System-Responsibilities.md`
* `06-Processes-and-Threads.md`
* `07-Filesystems.md`

You should already understand:

* CPU Architecture
* Memory Hierarchy
* Operating Systems
* Processes
* Filesystems
* Device Drivers

---

## Estimated Reading Time

**50–60 minutes**

---

## Before We Start

## Question

Suppose you type the letter:

```text id="1iop1"
A
```

on your keyboard.

A fraction of a second later:

* It appears on the screen.
* Your application receives it.
* The cursor moves.

Have you ever wondered what actually happened?

Questions to think about:

* How does the keyboard communicate with the computer?
* How does the CPU know a key was pressed?
* How does the operating system deliver the character to your application?
* Why doesn't every application need to understand keyboard electronics?

The answer involves **Input/Output**, commonly called **I/O**.

---

## Answer

I/O is the mechanism through which a computer communicates with the outside world.

Without I/O:

* You could not type.
* Displays would remain blank.
* Files could not be read.
* Network requests would never arrive.
* AI models could not receive prompts or return responses.

The CPU can perform computations, but I/O allows those computations to interact with users, storage, and networks.

---

# Why This Exists

Imagine a CPU with no ability to communicate.

It could execute instructions forever.

But it would never receive:

* Keyboard input
* Mouse clicks
* Files
* Network packets
* Camera images
* Sensor readings

Likewise, it could never produce:

* Display output
* Printed documents
* Saved files
* API responses
* Audio

A computer without I/O would be isolated.

I/O connects computation with the real world.

---

> **Engineering Note**
>
> Every cloud API request, database query, Docker container, Kubernetes pod, AI inference request, and web application ultimately depends on Input/Output operations.

---

## Mental Model

Before discussing technical details, let's build intuition.

## Analogy: A Restaurant

Imagine a restaurant kitchen.

The chefs prepare food.

However, they never leave the kitchen.

Instead:

* Customers place orders.
* Waiters deliver orders to the kitchen.
* Chefs prepare meals.
* Waiters deliver food back.

The kitchen focuses only on cooking.

The waiters handle communication.

A computer behaves similarly.

| Restaurant     | Computer         |
| -------------- | ---------------- |
| Customer       | External Device  |
| Waiter         | Operating System |
| Kitchen        | CPU              |
| Ingredients    | Memory           |
| Orders         | Input            |
| Prepared Meals | Output           |

The CPU performs computation.

The operating system manages communication with external devices.

---

## What Is I/O?

Input/Output (I/O) refers to the transfer of information between a computer and external devices.

Examples of **Input**:

* Keyboard
* Mouse
* Microphone
* Camera
* Touchscreen
* Network packets
* Files read from storage

Examples of **Output**:

* Monitor
* Printer
* Speakers
* Files written to storage
* Network responses

---

## High-Level View

```text id="n2w4pd"
Input Device

↓

Operating System

↓

CPU

↓

Operating System

↓

Output Device
```

Notice that the operating system appears on both sides.

Applications do not communicate directly with hardware.

---

# The I/O Path

Whenever a program performs I/O, several components cooperate.

Conceptually:

```text id="f5z8mt"
Application

↓

Operating System

↓

Device Driver

↓

Hardware Device

↓

Operating System

↓

Application
```

Every layer has a specific responsibility.

---

# Types of I/O Devices

Modern computers interact with many different kinds of devices.

Examples include:

| Category    | Examples                         |
| ----------- | -------------------------------- |
| Input       | Keyboard, Mouse, Scanner, Camera |
| Output      | Monitor, Printer, Speakers       |
| Storage     | SSD, HDD, USB Drive              |
| Network     | Ethernet, Wi-Fi Adapter          |
| Specialized | GPU, Microphone, Sensors         |

Although these devices behave differently, applications use similar operating system interfaces to communicate with them.

---

## Why Applications Don't Talk Directly to Hardware

Imagine writing a text editor.

Should it contain separate code for:

* Every keyboard manufacturer?
* Every SSD?
* Every monitor?
* Every network card?

That would be impossible to maintain.

Instead:

```text id="m9q7yl"
Application

↓

Operating System

↓

Device Driver

↓

Hardware
```

The operating system hides hardware-specific complexity.

---

## Remember

I/O allows computers to communicate with the outside world.

Applications request I/O through the operating system, which coordinates with device drivers and hardware.

Without I/O, computers could compute—but they could not interact.

---

# Input Operations

## Question

What happens when you press a key?

Although it appears instant, several steps occur.

Conceptually:

```text id="j3t8qn"
Keyboard

↓

Keyboard Driver

↓

Operating System

↓

Application

↓

Display Character
```

Each layer performs a specific task.

The application simply receives the character.

It does not need to understand how the keyboard electronics work.

---
# Output Operations

## Question

Suppose you execute:

```python
print("Hello, Enterprise GenAI!")
```

The text appears on your screen almost instantly.

But where did it actually go?

Did Python write directly to your monitor?

No.

Several layers work together before pixels appear on the display.

---

# How Output Works

Conceptually:

```text
Python Program

↓

Operating System

↓

Display Driver

↓

Graphics Hardware

↓

Monitor

↓

Visible Output
```

Each layer has a different responsibility.

* The application requests output.
* The operating system validates the request.
* The device driver translates the request.
* The hardware performs the operation.

---

## Another Example

Saving a file:

```python
with open("report.txt", "w") as file:
    file.write("Enterprise GenAI")
```

Conceptually:

```text
Application

↓

Operating System

↓

Filesystem

↓

Storage Driver

↓

SSD

↓

Data Persisted
```

Even though this feels like a simple operation, many software components cooperate behind the scenes.

---

# Device Drivers

## Question

How can the same application work with thousands of different hardware devices?

For example:

* Dell keyboard
* Logitech keyboard
* HP printer
* Samsung SSD
* NVIDIA GPU

The application doesn't know anything about these devices.

So how does it work?

The answer is **device drivers**.

---

## What Is a Device Driver?

A device driver is software that understands a specific hardware device.

It acts as a translator between:

* The operating system
* The hardware

Conceptually:

```text
Application

↓

Operating System

↓

Device Driver

↓

Hardware
```

Without drivers, every application would need to understand every hardware device individually.

---

## Example

Suppose an application wants to display an image.

The application simply requests:

```text
Draw this image.
```

The operating system passes that request to the graphics driver.

The graphics driver converts it into instructions that the GPU understands.

The application never interacts with the GPU directly.

---

# Why Drivers Matter

Drivers provide several important benefits.

They:

* Hide hardware complexity.
* Standardize communication.
* Improve portability.
* Allow hardware upgrades without changing applications.

This layered architecture is one of the reasons software can run on many different computers.

---

> **Engineering Note**
>
> GPU drivers are especially important for AI workloads. Frameworks such as PyTorch and TensorFlow rely on GPU drivers (for example, NVIDIA CUDA drivers) to execute computations on graphics hardware.

---

## Interrupts Revisited

In the previous chapter, we introduced interrupts.

Now let's see how they relate to I/O.

---

## Question

Suppose the CPU requests data from an SSD.

Should it repeatedly ask:

> "Is the data ready?"

That would waste CPU time.

Instead, the storage device sends an interrupt when the operation completes.

---

## Interrupt-Based I/O

Conceptually:

```text
Application

↓

Read File

↓

Operating System

↓

SSD Starts Reading

↓

CPU Continues Other Work

↓

SSD Interrupt

↓

Operating System

↓

Application Receives Data
```

Instead of waiting idly, the CPU performs useful work.

---

# Benefits of Interrupts

Interrupts improve efficiency because:

* The CPU does not waste time polling devices.
* Multiple operations can overlap.
* Overall system responsiveness improves.

Modern operating systems rely heavily on interrupt-driven I/O.

---

## Direct Memory Access (DMA)

## Question

Suppose you copy a 10 GB video file.

Should the CPU move every byte manually?

That would consume enormous CPU time.

Instead, many systems use **Direct Memory Access (DMA)**.

---

## What Is DMA?

DMA allows certain hardware devices to transfer data directly between the device and memory.

The CPU only initiates the transfer.

After that, the DMA controller performs the movement.

Conceptually:

```text
CPU

↓

Start Transfer

↓

DMA Controller

↓

SSD

⇄

RAM

↓

Interrupt CPU When Finished
```

---

# Why DMA Exists

Without DMA:

```text
SSD

↓

CPU

↓

RAM
```

Every byte passes through the CPU.

With DMA:

```text
SSD

↓

DMA

↓

RAM
```

The CPU remains available for computation.

---

## Real-World Examples

DMA is commonly used for:

* SSD transfers
* Network communication
* Audio devices
* GPUs
* High-speed storage
* Video capture devices

Modern high-performance systems depend heavily on DMA.

---

## Remember

Device drivers translate operating system requests into hardware-specific commands.

Interrupts notify the CPU when devices finish work.

DMA allows devices to transfer large amounts of data without occupying the CPU.

Together, these mechanisms make modern I/O both efficient and scalable.

---

# Synchronous I/O

## Question

Suppose your application reads a file.

Should it wait until the file is completely read before continuing?

Sometimes the answer is yes.

This is called **synchronous I/O**.

---

## What Is Synchronous I/O?

In synchronous I/O, the application waits until the requested operation completes.

Conceptually:

```text
Read File

↓

Wait

↓

Data Arrives

↓

Continue Execution
```

During the wait, that execution path cannot continue processing other work.

---

## Example

```python
with open("large_file.txt") as file:
    data = file.read()

print("Finished")
```

The program waits until the entire read operation finishes before printing `"Finished"`.

---
# Asynchronous I/O

## Question

Suppose your application starts downloading a large file.

Should it stop doing everything else until the download finishes?

For many applications, that would create a poor user experience.

Imagine a web browser freezing every time you downloaded a file.

Instead, many modern systems use **asynchronous I/O**.

---

## What Is Asynchronous I/O?

With asynchronous I/O, an application starts an I/O operation and continues doing other work while the operating system performs the operation in the background.

When the operation completes, the application is notified.

Conceptually:

```text id="h8v2pm"
Start File Read

↓

Continue Other Work

↓

Operating System Performs I/O

↓

Notification

↓

Process Result
```

Unlike synchronous I/O, the application does not remain blocked for the entire operation.

---

## Real-Life Analogy

Imagine ordering food at a restaurant.

### Synchronous

You stand at the kitchen door and wait until your meal is ready.

You cannot do anything else.

### Asynchronous

You place your order.

Sit down.

Talk with friends.

The waiter informs you when the food is ready.

This is much more efficient.

---

# Comparison

| Synchronous I/O                  | Asynchronous I/O                   |
| -------------------------------- | ---------------------------------- |
| Waits for completion             | Continues executing                |
| Simpler programming model        | Higher complexity                  |
| Thread may remain blocked        | Better resource utilization        |
| Suitable for simple applications | Common in high-performance servers |

---

## Example

Conceptually:

```text id="a4km7d"
Request Data

↓

Continue Processing

↓

Data Ready

↓

Handle Response
```

Modern web servers frequently process thousands of requests using asynchronous I/O.

---

> **Engineering Note**
>
> Frameworks such as Node.js, FastAPI (with `async` support), Nginx, and many cloud services use asynchronous I/O to efficiently handle large numbers of concurrent network requests.

---

# Buffered I/O

## Question

Suppose an application writes one character at a time to a file.

Should the operating system immediately write every character to the SSD?

That would be very inefficient.

Instead, operating systems often use **buffers**.

---

## What Is a Buffer?

A buffer is a temporary memory area used to hold data before it is transferred.

Conceptually:

```text id="v7m3ql"
Application

↓

Memory Buffer

↓

Operating System

↓

SSD
```

Instead of performing thousands of tiny writes, the operating system combines them into fewer, larger operations.

---

# Why Buffering Exists

Suppose an application writes:

```text id="6vpt9n"
A

B

C

D
```

Without buffering:

```text id="d5pj8k"
Write A

↓

Write B

↓

Write C

↓

Write D
```

Four storage operations occur.

With buffering:

```text id="j3lx6q"
Store in Buffer

↓

Store in Buffer

↓

Store in Buffer

↓

Write ABCD Together
```

Only one storage operation is required.

This significantly improves performance.

---

# Advantages of Buffered I/O

Buffered I/O provides several benefits.

* Reduces the number of hardware operations.
* Improves overall performance.
* Reduces CPU overhead.
* Makes storage devices more efficient.

Because memory is much faster than storage devices, buffering is widely used.

---

## Unbuffered I/O

Sometimes applications cannot wait.

Examples include:

* Real-time control systems
* Certain database operations
* Device communication
* Specialized hardware interfaces

In these situations, applications may use **unbuffered I/O**, where data is transferred immediately.

---

## Comparison

| Buffered I/O                          | Unbuffered I/O                        |
| ------------------------------------- | ------------------------------------- |
| Uses temporary memory                 | Transfers immediately                 |
| Higher performance for many workloads | Lower latency for specific operations |
| Fewer hardware operations             | More direct device interaction        |
| Common default behavior               | Used only when necessary              |

---

## Why I/O Is Slow

## Question

Why do engineers often say:

> "I/O is expensive."

The CPU can execute billions of instructions every second.

Storage devices and networks are much slower.

Even modern SSDs require significantly more time than reading data already stored in CPU caches or RAM.

---

## Approximate Performance Order

From fastest to slowest:

```text id="m8h2zy"
CPU Registers

↓

CPU Cache

↓

RAM

↓

SSD

↓

HDD

↓

Network
```

The exact speeds vary by hardware, but the ordering remains broadly true.

---

# Engineering Implication

Because I/O is relatively slow, engineers try to:

* Minimize disk reads.
* Cache frequently used data.
* Batch writes.
* Compress transfers when appropriate.
* Avoid unnecessary network requests.

Many performance optimizations are really I/O optimizations.

---

## Remember

* Asynchronous I/O allows useful work to continue while waiting for devices.
* Buffers reduce expensive hardware operations.
* Storage and network operations are much slower than CPU and memory operations.
* Efficient software minimizes unnecessary I/O whenever possible.

---
## I/O Bottlenecks

## Question

Suppose your application has:

* A powerful 32-core CPU
* 128 GB RAM
* Optimized algorithms

Yet it still feels slow.

Why?

The CPU may not be the problem.

Your application may be **waiting for I/O**.

This is called an **I/O bottleneck**.

---

## What Is an I/O Bottleneck?

An I/O bottleneck occurs when the speed of an application is limited by input/output operations rather than computation.

Examples include:

* Reading large files
* Writing logs
* Waiting for network responses
* Accessing databases
* Downloading data from cloud storage

During these operations, the CPU may spend much of its time waiting.

---

## Conceptual Example

```text id="t8y4qp"
Application

↓

Read File

↓

Wait...

↓

Wait...

↓

Data Arrives

↓

Continue Processing
```

The CPU is capable of working much faster, but progress is limited by the storage device.

---

# CPU-Bound vs I/O-Bound Workloads

Understanding this distinction helps engineers choose the right optimization strategy.

| CPU-Bound                  | I/O-Bound               |
| -------------------------- | ----------------------- |
| Limited by computation     | Limited by input/output |
| Heavy calculations         | Frequent waiting        |
| Image processing           | File reading            |
| Machine learning inference | Database queries        |
| Encryption                 | Network communication   |

---

## Example

### CPU-Bound

```python id="3jw9qd"
for i in range(1_000_000):
    result += i * i
```

Most time is spent performing calculations.

---

### I/O-Bound

```python id="q8r2mn"
with open("large_dataset.csv") as file:
    data = file.read()
```

Most time is spent waiting for the storage device.

---

# Recognizing I/O Bottlenecks

Common symptoms include:

* Low CPU utilization
* High disk activity
* High network activity
* Slow response times
* Long file loading times
* Database latency

Monitoring tools often show the CPU waiting while storage or networking remains busy.

---

## Caching

## Question

Suppose an application reads the same configuration file thousands of times.

Should it read the file from disk every time?

No.

Instead, it can keep the data in memory.

This technique is called **caching**.

---

## What Is Caching?

Caching stores frequently accessed data in a faster location.

Conceptually:

```text id="6bz4yp"
Application

↓

Cache

↓

Memory

↓

Filesystem

↓

SSD
```

If the data already exists in the cache:

The expensive storage operation can be skipped.

---

## Example

Without caching:

```text id="1f7mdk"
Request

↓

Read SSD

↓

Return Data
```

Repeated every request.

---

With caching:

```text id="t3h5qa"
First Request

↓

Read SSD

↓

Store in Cache

↓

Return Data

──────────────

Later Request

↓

Read Cache

↓

Return Immediately
```

This dramatically reduces latency.

---

# Where Caching Appears

Caching exists throughout computer systems.

Examples include:

* CPU cache
* Filesystem cache
* Browser cache
* Database cache
* CDN cache
* Redis
* AI model cache

Each cache reduces expensive I/O operations.

---

## Batching

Instead of performing many small I/O operations:

```text id="7gk3ty"
Write

↓

Write

↓

Write

↓

Write
```

Applications often combine them.

```text id="8m0dwc"
Collect Data

↓

Single Large Write
```

Batching reduces overhead and improves throughput.

---

# Streaming

Sometimes data is too large to fit into memory.

Example:

A 100 GB dataset.

Instead of loading the entire file:

Applications process it gradually.

Conceptually:

```text id="h5s9ln"
Storage

↓

Chunk 1

↓

Process

↓

Chunk 2

↓

Process

↓

Chunk 3
```

Streaming reduces memory usage while still processing very large datasets.

---

## Remember

Many application performance problems are actually I/O problems.

Techniques such as:

* Caching
* Buffering
* Batching
* Streaming

reduce expensive I/O operations and improve overall performance.

---

# Production Perspective

Understanding I/O is essential for designing scalable systems.

---

## Linux

Linux exposes nearly everything as files.

Examples include:

* Devices
* Pipes
* Network interfaces
* Process information

Applications interact with these resources using familiar file operations.

This design simplifies software development.

---

## Web Servers

When a browser sends an HTTP request:

```text id="p4d7jq"
Client

↓

Network

↓

Operating System

↓

Application

↓

Database

↓

Response
```

Most of the request time is often spent waiting for I/O rather than performing calculations.

---

## Databases

Database systems perform enormous amounts of I/O.

Examples:

* Reading data pages
* Writing transaction logs
* Updating indexes
* Performing backups

Database tuning frequently focuses on reducing unnecessary disk operations.

---

## Docker

Containers perform filesystem and network I/O just like ordinary Linux processes.

Examples include:

* Reading container images
* Writing logs
* Accessing mounted volumes
* Downloading packages

Good storage performance improves container startup and runtime efficiency.

---

## Artificial Intelligence

AI systems perform significant I/O during:

* Loading datasets
* Reading model checkpoints
* Downloading models
* Writing logs
* Saving checkpoints
* Loading embeddings
* Retrieving vector database results

Large language models may spend substantial time waiting for storage or network operations before computation even begins.

---

> **Engineering Note**
>
> Many AI training pipelines are I/O-bound rather than GPU-bound. If data cannot be supplied quickly enough, expensive GPUs remain underutilized while waiting for input.

---
# Engineering Decisions

Understanding I/O helps engineers design applications that are both responsive and scalable.

Many production performance issues are caused not by slow CPUs, but by inefficient I/O.

---

## Decision 1 — Identify the Real Bottleneck

Before optimizing code, determine whether the application is:

* CPU-bound
* Memory-bound
* I/O-bound
* Network-bound

Optimizing algorithms will not help if the application spends most of its time waiting for disk or network operations.

Always measure before optimizing.

---

## Decision 2 — Minimize Blocking Operations

Blocking I/O reduces concurrency.

For example:

```text id="k3v9md"
Read File

↓

Wait

↓

Continue
```

In applications handling many users (such as web servers), excessive blocking can reduce throughput.

Where appropriate, consider:

* Asynchronous I/O
* Thread pools
* Event-driven architectures

The best approach depends on the workload.

---

## Decision 3 — Reduce Unnecessary I/O

Every storage or network operation has a cost.

Instead of:

```text id="v6p1qj"
Read Config

↓

Read Config

↓

Read Config
```

Prefer:

```text id="m7r2bx"
Read Once

↓

Cache in Memory

↓

Reuse
```

Reducing unnecessary I/O often provides significant performance improvements.

---

## Decision 4 — Batch Operations

Writing one record at a time can be inefficient.

Instead:

```text id="n2l5fw"
Collect Records

↓

Write Together
```

Batching reduces system call overhead and improves storage efficiency.

This technique is common in:

* Databases
* Logging systems
* Data pipelines
* Machine learning workflows

---

## Decision 5 — Choose the Right Concurrency Model

Different workloads benefit from different approaches.

| Workload            | Common Strategy  |
| ------------------- | ---------------- |
| File processing     | Buffered I/O     |
| Web APIs            | Asynchronous I/O |
| Large downloads     | Streaming        |
| Database writes     | Batching         |
| High-read workloads | Caching          |

Understanding I/O characteristics helps engineers choose appropriate designs instead of relying on default implementations.

---

## Remember

Efficient applications perform **less** I/O—not simply faster I/O.

Caching, buffering, batching, and asynchronous processing reduce waiting time and improve scalability.

---

# Common Mistakes

| Mistake                                                       | Why It Is Incorrect                                                                 | Correct Understanding                                                          |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| "The CPU performs all I/O."                                   | The operating system, drivers, DMA, and hardware all participate.                   | I/O is a coordinated system-wide operation.                                    |
| "Faster CPUs always improve application performance."         | Many applications wait for storage or network operations.                           | First identify the actual bottleneck.                                          |
| "Blocking I/O is always bad."                                 | Blocking I/O is often simpler and appropriate for many workloads.                   | Choose synchronous or asynchronous I/O based on application requirements.      |
| "More threads automatically solve I/O problems."              | Excessive threads increase scheduling overhead.                                     | Select an appropriate concurrency model for the workload.                      |
| "Reading from disk is nearly as fast as reading from memory." | Storage devices are significantly slower than RAM.                                  | Cache frequently accessed data whenever practical.                             |
| "Every write should go directly to storage immediately."      | Immediate writes increase overhead.                                                 | Buffering and batching often improve efficiency while maintaining correctness. |
| "Network requests are just function calls."                   | Network communication involves operating systems, protocols, and physical networks. | Treat network I/O as potentially slow and unreliable.                          |

---

## Interview Questions

## 1. What is I/O?

**Expected Answer**

Input/Output (I/O) is the mechanism through which a computer exchanges information with external devices such as storage, networks, keyboards, and displays.

---

## 2. Why do applications use the operating system for I/O?

**Expected Answer**

The operating system provides a consistent interface to hardware, manages permissions, coordinates device drivers, and hides hardware-specific complexity.

---

## 3. What is the role of a device driver?

**Expected Answer**

A device driver translates operating system requests into hardware-specific commands and allows applications to work across different hardware devices.

---

## 4. What is Direct Memory Access (DMA)?

**Expected Answer**

DMA allows hardware devices to transfer data directly to or from memory with minimal CPU involvement, improving overall system efficiency.

---

## 5. What is the difference between synchronous and asynchronous I/O?

**Expected Answer**

Synchronous I/O blocks until an operation completes. Asynchronous I/O allows the application to continue executing while the operation proceeds in the background.

---

## 6. Why is buffering used?

**Expected Answer**

Buffering temporarily stores data in memory so multiple small operations can be combined into fewer, larger operations, improving performance.

---

## 7. What is an I/O-bound application?

**Expected Answer**

An I/O-bound application spends most of its time waiting for storage, network, or device operations rather than performing CPU computations.

---

## 8. Why is caching important?

**Expected Answer**

Caching stores frequently accessed data in faster memory, reducing repeated I/O operations and improving performance.

---

## 9. What is the purpose of interrupts during I/O?

**Expected Answer**

Interrupts notify the CPU when an I/O operation completes, allowing the CPU to perform other work instead of continuously checking device status.

---

## 10. Why do AI systems care about I/O performance?

**Expected Answer**

AI workloads often involve loading large datasets, model checkpoints, embeddings, and network data. Slow I/O can leave CPUs and GPUs waiting, reducing overall system throughput.

---

## Quick Revision

## I/O Flow

```text id="2m7wqk"
Application

↓

Operating System

↓

Device Driver

↓

Hardware

↓

Operating System

↓

Application
```

---

## Input Devices

Examples:

* Keyboard
* Mouse
* Camera
* Microphone
* Network

---

## Output Devices

Examples:

* Monitor
* Printer
* Speakers
* Storage
* Network

---

## Device Drivers

* Translate operating system requests into hardware-specific commands.
* Enable portability across different hardware.

---

## DMA

Allows hardware devices to transfer data directly to memory with minimal CPU involvement.

---

## Synchronous vs Asynchronous I/O

| Synchronous          | Asynchronous                           |
| -------------------- | -------------------------------------- |
| Waits for completion | Continues executing while I/O proceeds |

---

## Performance Techniques

* Buffering
* Caching
* Batching
* Streaming

These techniques reduce expensive I/O operations and improve efficiency.

---

# Key Takeaways

* I/O enables computers to interact with storage devices, networks, users, and peripherals.
* Applications communicate with hardware through the operating system and device drivers.
* Interrupts and DMA improve I/O efficiency by reducing unnecessary CPU involvement.
* Synchronous and asynchronous I/O are different execution models suited to different workloads.
* Storage and network operations are generally much slower than CPU and memory operations.
* Caching, buffering, batching, and streaming are fundamental techniques for building high-performance systems.
* Every modern software system—including databases, cloud services, Docker, Kubernetes, and AI platforms—depends on efficient I/O.

---
