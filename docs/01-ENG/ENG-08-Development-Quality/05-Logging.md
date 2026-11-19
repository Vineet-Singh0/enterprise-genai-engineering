# Logging

## 1. Overview

Logging is the practice of recording selected events that occur while software executes. These records help engineers understand application behavior, investigate failures, identify unexpected conditions, and determine what happened during an execution.

A program's return value describes what it produces. An exception describes a failure condition. Logs provide a record of selected events surrounding the execution.

For example, an API request may fail because a required resource is unavailable. A useful log can record that the operation failed, which type of operation was involved, and a correlation identifier that helps locate related events. This information can help an engineer investigate the failure without reproducing the entire request locally.

Logging is not the same as printing messages to the terminal. Production-quality logging requires deliberate choices about event meaning, severity, context, consistency, and sensitive information.

This chapter covers logging fundamentals, Python's logging facilities, log levels, structured context, exception logging, and practical engineering guidelines.

### Learning Objectives

By the end of this chapter, you should be able to:

- Explain why applications need logs.
- Distinguish application logging from debugging and monitoring.
- Choose appropriate log levels.
- Use Python's built-in `logging` module.
- Record useful context without exposing sensitive data.
- Log exceptions without hiding their original causes.
- Configure consistent logging across application modules.
- Avoid noisy, redundant, and misleading log records.

### Prerequisites

You should understand:

- Functions, modules, and exceptions.
- Basic application execution.
- Debugging and root-cause investigation from the previous chapter.
- The difference between expected outcomes and exceptional conditions.

### Expected Reading Time

18–25 minutes.

---

## 2. Why Logging Matters

Software execution is transient. After an operation finishes, its intermediate state may no longer be available.

Without logs, an engineer investigating a failure may have only the final error message, a user's description, or an incomplete reproduction.

Logging preserves selected information about what happened.

Consider an order-processing workflow:

```text
Request received
      |
      v
Order validated
      |
      v
Payment requested
      |
      v
Payment rejected
      |
      v
Request failed
```

If the application records meaningful events at appropriate boundaries, an engineer can determine whether the request reached payment processing and whether the payment operation failed.

Without those records, several explanations may appear equally plausible.

### 2.1 Problems Logging Helps Solve

Logging can help answer questions such as:

- Did an operation start?
- Did it complete successfully?
- Which expected condition caused an operation to stop?
- Which dependency failed?
- What type of exception occurred?
- How long did an operation take, if duration was deliberately recorded?
- Which related application events belong to the same request?

Logs do not automatically answer every question. Their usefulness depends on which events were recorded and whether the information is sufficiently accurate and contextual.

### 2.2 Logging Is an Engineering Decision

Recording every variable and every function call is not necessarily useful.

Excessive logging creates noise, consumes storage, increases processing overhead, and makes important events harder to find.

Insufficient logging leaves engineers without the evidence needed to investigate failures.

The goal is to record **the right information at the right application boundaries**.

---

## 3. A Mental Model of Application Logging

Think of logging as an event record produced by an application.

A log record commonly contains:

- A timestamp.
- A severity level.
- The logger name or source module.
- A descriptive message.
- Optional contextual fields.
- Exception details, when applicable.

Conceptually:

```text
Timestamp: 2026-10-19T10:15:30
Level: ERROR
Logger: order_service
Message: Payment processing failed
Context:
  order_id: order-123
  operation: process_payment
```

This is an illustrative record, not a statement about a particular logging configuration.

Each field contributes different information:

- **Timestamp:** When the event was recorded.
- **Level:** How the event should be interpreted in terms of severity.
- **Logger name:** Which component produced the record.
- **Message:** What happened.
- **Context:** Which operation or entity was involved.
- **Exception details:** What failure occurred and where it originated.

A log record is useful when it allows a reader to understand an event without having to guess its meaning.

## 4. Log Levels

Log levels classify events by severity or diagnostic importance.

Python's built-in `logging` module defines five commonly used levels.

| Level | Intended use | Example |
|---|---|---|
| `DEBUG` | Detailed information useful during investigation | A selected branch or non-sensitive intermediate diagnostic value |
| `INFO` | Significant normal application events | An import job completed successfully |
| `WARNING` | An unexpected or undesirable condition that does not necessarily stop the operation | An optional data source is unavailable and a fallback is used |
| `ERROR` | An operation failed or could not complete as intended | A required external operation failed |
| `CRITICAL` | A severe failure that may prevent the application or a major component from continuing normally | A critical subsystem cannot start |

### 4.1 Choosing the Right Level

Consider an API endpoint that receives an order request.

- A successfully completed request may produce an `INFO` record if that event is operationally useful.
- A recoverable condition that causes a fallback may warrant `WARNING`.
- A failed required operation may warrant `ERROR`.
- A failure that prevents a critical service component from starting may warrant `CRITICAL`.
- Detailed diagnostic information needed only during investigation may warrant `DEBUG`.

The correct level depends on the event's meaning and the application's operational requirements.

Do not use `ERROR` for every unusual event. Similarly, do not use `WARNING` to disguise an operation that has actually failed.

### 4.2 Levels Are Not Business Outcomes

A rejected payment, invalid form submission, or unsuccessful authentication attempt is not automatically an application error.

If the application correctly handles an expected business outcome, the event may be normal application behavior.

Choose the level based on the event's significance and the system's intended behavior, not simply on whether the outcome is positive or negative.

### 4.3 Log-Level Thresholds

A logging configuration can specify a minimum severity threshold.

For example, a threshold of `WARNING` normally allows `WARNING`, `ERROR`, and `CRITICAL` records while excluding `DEBUG` and `INFO` records.

This helps control verbosity without requiring developers to remove useful logging statements from the code.

The effective behavior also depends on logger levels, handler levels, and propagation configuration.

---

## 5. Python Logging Fundamentals

Python provides the built-in `logging` module. It supports named loggers, configurable severity levels, handlers, formatting, and exception information.

For application code, prefer `logging` over scattered `print()` statements when records need consistent severity, formatting, or configuration.

### 5.1 Creating a Logger

A common module-level pattern is:

```python
import logging

logger = logging.getLogger(__name__)
```

The `__name__` value gives the logger a name corresponding to the module.

This allows different modules to produce records under distinct names while participating in a shared logging configuration.

For example, records may identify `order_service`, `payment_client`, or `api.routes.orders` as their source.

### 5.2 Writing Log Records

```python
import logging

logger = logging.getLogger(__name__)


def validate_quantity(quantity: int) -> bool:
    if quantity <= 0:
        logger.warning(
            "Quantity validation failed: quantity must be positive"
        )
        return False

    logger.debug("Quantity validation succeeded")
    return True
```

This example demonstrates the API, but a production implementation should consider whether the invalid quantity is an expected input-validation outcome. Expected user errors do not always need warning-level records.

Logging should reflect the application's behavior and operational needs rather than recording every possible branch.

### 5.3 Configuring Logging

For a small standalone script, `logging.basicConfig()` is a convenient way to establish a basic configuration.

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

logger = logging.getLogger(__name__)

logger.info("Application started")
```

The configuration defines:

- `level`: The minimum logging level.
- `format`: The fields included in each formatted record.

The example writes records to the default configured stream, normally standard error.

A common mistake is to call `basicConfig()` independently in many modules. Application-wide logging configuration should generally be established by the application's entry point or hosting environment. Individual modules should obtain named loggers and use them.

Also note that `basicConfig()` may have no effect when the root logger already has handlers configured, unless options such as `force=True` are used. In a shared application or framework, do not overwrite an existing logging configuration without understanding its consequences.

---

## 6. How Python Logging Works Internally

Python logging separates the creation of a log record from its final destination.

The main concepts are:

- **Logger:** The interface application code uses to emit records.
- **LogRecord:** The object containing the event's information.
- **Handler:** The component that sends records to a destination.
- **Formatter:** The component that converts a record into a textual representation.
- **Filter:** An optional component that decides whether a record should be processed.

A simplified flow is:

```text
Application code
      |
      v
Named logger
      |
      v
LogRecord
      |
      v
Logger / handler level checks
      |
      v
Handler
      |
      v
Formatter
      |
      v
Output destination
```

The destination might be a console stream or a file. Applications can also use custom handlers to integrate with other logging systems.

This separation is useful because application code does not need to know where every record will eventually be stored.

For example, the same `logger.info()` call can work with a development console configuration and a different deployment configuration, provided the logging setup is changed appropriately.

### 6.1 Logger Hierarchy and Propagation

Logger names form a hierarchy separated by dots.

For example:

```text
application
application.orders
application.orders.payment
```

A child logger can propagate records to ancestor loggers, commonly allowing application-wide handlers to process records from multiple modules.

This is convenient, but misconfiguration can produce duplicate records or unexpected filtering behavior.

When a record appears twice, inspect the logger hierarchy, propagation settings, and attached handlers before adding code to suppress it.

---

## 7. Writing Useful Log Messages

A log message should communicate an event clearly enough that an engineer can understand it without reconstructing the developer's intentions.

Compare:

```python
logger.error("Failed")
```

with:

```python
logger.error("Payment request failed for order")
```

The second message provides more context, although it may still be insufficient for a real application if the relevant order identifier is needed to locate the event.

A useful log message generally answers three questions:

1. What operation or event occurred?
2. What was its outcome?
3. What safe context is needed to investigate it?

For example:

```python
logger.info(
    "Order validation completed"
)
```

A contextual record can be more useful:

```python
logger.info(
    "Order validation completed for order_id=%s",
    order_id,
)
```

The second example assumes `order_id` is an appropriate, non-sensitive identifier to record under the application's data-handling rules.

### 7.1 Use Stable, Consistent Wording

Avoid writing the same event in many unrelated formats.

For example, these messages describe similar events but use inconsistent wording:

```text
Order created
New order added
Created an order successfully
Order creation done
```

Consistency makes searching and grouping events easier.

For events that need machine-readable analysis, use stable event names or structured fields rather than relying exclusively on natural-language message text.

### 7.2 Include Context, Not Everything

Context can include:

- Operation name.
- Request or correlation identifier.
- Non-sensitive resource identifier.
- Dependency name.
- Result category.
- Relevant duration or count.

Avoid recording entire request objects, database records, or arbitrary local variables just because they are available.

The information should be relevant to investigation and permitted by the application's privacy and security requirements.

---

## 8. Logging Exceptions Correctly

Exceptions are often important diagnostic evidence. Logging them incorrectly can either lose useful details or produce redundant records.

### 8.1 Use `logger.exception()` Inside an Exception Handler

Consider:

```python
import logging

logger = logging.getLogger(__name__)


def load_configuration(path: str) -> str:
    try:
        with open(path, encoding="utf-8") as file:
            return file.read()
    except OSError:
        logger.exception("Configuration loading failed")
        raise
```

When called from an active exception handler, `logger.exception()` records a message at `ERROR` level and includes exception information, normally including the traceback.

The `raise` statement re-raises the original exception.

This example records the failure and preserves normal exception propagation.

Whether to log and re-raise at this location depends on the application's error-handling design. If an upper layer will already record the same failure with useful context, logging at every layer can produce duplicate records.

### 8.2 `logger.exception()` vs. `logger.error()`

Use `logger.exception()` inside an exception handler when the traceback is useful.

You can also pass exception information explicitly to a logging call:

```python
try:
    perform_operation()
except RuntimeError:
    logger.error(
        "Operation failed",
        exc_info=True,
    )
    raise
```

Without exception information, an ordinary `logger.error()` call records the message but does not automatically include the active exception traceback.

### 8.3 Avoid Swallowing Exceptions

Consider:

```python
try:
    save_order()
except Exception:
    logger.error("Saving order failed")
```

The exception is caught and not re-raised or otherwise handled. The caller may continue as if the operation succeeded.

This can create inconsistent application state.

Logging does not resolve a failure. After recording it, the code must follow the intended error-handling contract: recover, return an explicit failure, or propagate the exception.

### 8.4 Avoid Logging the Same Exception at Every Layer

Suppose a database operation raises an exception, a repository logs it, a service logs it, and an API handler logs it again.

One failure can then generate several nearly identical error records.

A better approach is to choose logging boundaries deliberately. Lower layers should add records when they provide distinct diagnostic value; the layer responsible for handling or reporting the failure should generally ensure that it is recorded appropriately.

Do not remove useful context merely to avoid duplication. Instead, decide which layer has the best information and responsibility to record the event.

---

## 9. Contextual and Structured Logging

Plain text messages are easy to read, but their inconsistent wording can make automated analysis difficult.

Structured logging represents information as named fields.

For example, an event could contain:

```json
{
  "event": "payment_failed",
  "level": "ERROR",
  "order_id": "order-123",
  "dependency": "payment_provider"
}
```

This is an illustrative JSON record. Python's standard logging module does not automatically emit this exact JSON format merely because these fields are present.

Structured fields make it easier to filter records by event type, dependency, or resource identifier.

### 9.1 Adding Context With `extra`

Python's logging API supports additional record attributes through `extra`.

```python
logger.warning(
    "Payment provider returned an unexpected response",
    extra={
        "order_id": order_id,
        "dependency": "payment_provider",
    },
)
```

This adds attributes to the `LogRecord`. It does not guarantee that those fields appear in the output.

To display or serialize them, the configured formatter or handler must explicitly support the fields. Some logging setups use JSON formatters or custom adapters to achieve this.

Also, avoid using reserved `LogRecord` attribute names as custom fields because doing so can raise errors or conflict with the logging implementation.

### 9.2 Correlation Identifiers

In applications where one request triggers multiple operations, a correlation or request identifier can help connect related records.

For example:

```text
request_id=req-abc | Request received
request_id=req-abc | Order validated
request_id=req-abc | Payment requested
request_id=req-abc | Payment failed
```

A request identifier should be created or accepted according to the application's trust and validation rules, then propagated consistently through the relevant operations.

Do not assume that every component automatically shares this context. Context propagation must be implemented or configured deliberately.

Correlation identifiers help locate related events; they do not by themselves establish causality or replace a full tracing system.

---

## 10. Logging Sensitive Information Safely

Logs may be stored for long periods, copied into incident reports, or accessed by more people and systems than the original application data.

Logging must therefore be treated as a data-handling decision.

Avoid recording:

- Passwords.
- Access tokens and session secrets.
- API keys.
- Private keys.
- Full payment-card information.
- Sensitive personal information that is not required for the diagnostic purpose.
- Full request or response bodies without an approved need.

For example, do not write:

```python
logger.info("Login request: %s", request_body)
```

if `request_body` may contain credentials or other sensitive values.

Prefer recording safe metadata:

```python
logger.info(
    "Login attempt received"
)
```

If a specific user or request must be identified for investigation, use an approved identifier or a carefully designed redaction strategy.

### 10.1 Redaction Is Not a Substitute for Data Minimization

Removing secrets after building a log record can be fragile if new fields are added later or if another handler processes the original data.

The safer default is to avoid collecting unnecessary sensitive information in the first place.

When sensitive data must be handled for a legitimate purpose, follow the organization's access, retention, redaction, and audit policies.

---

## 11. Logging in Different Environments

Logging requirements vary by environment.

### 11.1 Development

Development logging may include more detailed diagnostic information because engineers are actively investigating behavior.

However, development logs should still avoid secrets and unnecessary personal data.

### 11.2 Testing

Tests may need to capture logs to verify that important events are recorded or to keep test output readable.

Logging should not become a substitute for assertions about actual behavior. A test that checks for an error message but ignores an incorrect return value may pass while the underlying defect remains.

### 11.3 Production

Production logging generally needs consistent configuration, appropriate severity thresholds, useful context, and safe output handling.

Depending on the environment, logs may be collected by the runtime platform or an external logging system. Application code should not assume that writing to a local file is always the correct deployment strategy.

For containerized applications, writing to standard output or standard error is often convenient because the runtime platform can collect those streams. The appropriate choice depends on the deployment architecture.

The key principle is to separate application event creation from environment-specific log collection wherever practical.

---

## 12. Logging Performance and Reliability

Logging consumes resources. The cost depends on the volume of records, formatting, serialization, output destination, and handler configuration.

### 12.1 Avoid Expensive Work for Disabled Levels

Consider:

```python
logger.debug("Detailed state: %s", build_expensive_diagnostic())
```

Although parameterized logging defers message formatting, Python evaluates function arguments before calling `logger.debug()`. Therefore, `build_expensive_diagnostic()` runs even when the `DEBUG` level is disabled.

If the diagnostic computation is expensive, check the level first:

```python
if logger.isEnabledFor(logging.DEBUG):
    logger.debug(
        "Detailed state: %s",
        build_expensive_diagnostic(),
    )
```

Use this pattern only when the extra computation is significant enough to justify the check.

### 12.2 Prefer Parameterized Logging

Prefer:

```python
logger.info("Processed %s records", record_count)
```

over:

```python
logger.info(f"Processed {record_count} records")
```

Parameterized logging allows the logging system to defer message formatting when the record is filtered out.

This does not defer evaluation of the arguments themselves, but it avoids some unnecessary formatting work.

### 12.3 Avoid Excessive Log Volume

Logging every iteration in a large processing loop can generate enormous volumes of records.

Prefer meaningful milestones, summaries, and exceptional conditions when those provide sufficient diagnostic information.

For example, recording that a batch of 10,000 records completed may be more useful than emitting a separate informational record for every record.

The right granularity depends on the operational requirements and the failure modes being investigated.

### 12.4 Do Not Assume Logs Are Guaranteed to Be Available

Logging can fail or become incomplete because of misconfiguration, unavailable destinations, process termination, buffering, or infrastructure problems.

Applications should have an intentional logging configuration and appropriate operational handling for the environment in which they run.

Logs are valuable evidence, but they should not be the only mechanism protecting important application state or enforcing correctness.

---

## 13. Common Logging Mistakes

### 13.1 Using `print()` Everywhere

**Problem:** Application messages have inconsistent formatting and no clear severity classification.

**Better approach:** Use named loggers and a deliberate configuration for application diagnostics.

`print()` remains appropriate for simple scripts, command-line output intended for users, and other cases where logging semantics are unnecessary.

### 13.2 Logging Vague Messages

**Problem:** Messages such as `Something failed` provide no meaningful context.

**Better approach:** Describe the operation and outcome, then add relevant safe context.

### 13.3 Logging Every Event at `ERROR`

**Problem:** Normal business outcomes and recoverable conditions become indistinguishable from serious failures.

**Better approach:** Choose levels according to the significance of the event.

### 13.4 Catching and Suppressing Exceptions

**Problem:** The log records a failure, but the application continues as if the operation succeeded.

**Better approach:** Recover explicitly, return a documented failure result, or propagate the exception.

### 13.5 Duplicating Exception Logs

**Problem:** The same failure is logged repeatedly at several layers.

**Better approach:** Choose meaningful logging boundaries and avoid redundant records that add no new context.

### 13.6 Logging Secrets

**Problem:** Diagnostic output exposes credentials or sensitive user information.

**Better approach:** Minimize collected data, redact where necessary, and follow the application's data-handling policies.

### 13.7 Assuming `extra` Fields Appear Automatically

**Problem:** Custom attributes are added to a log record but are not displayed by the formatter.

**Better approach:** Configure the formatter or handler to include or serialize the required fields.

### 13.8 Overusing `DEBUG`

**Problem:** Developers emit detailed records without considering the cost of computing their arguments.

**Better approach:** Use parameterized logging and guard expensive diagnostic computations when necessary.

### 13.9 Treating Logs as Proof of Correctness

**Problem:** A successful log message is taken as proof that the business operation completed correctly.

**Better approach:** Log events that correspond to real, well-defined operation outcomes. Use tests and explicit application contracts to verify correctness.

---

## 14. Engineering Trade-Offs

| Decision | Benefit | Cost or limitation |
|---|---|---|
| More detailed logs | More context during investigations | Higher volume, storage, and processing cost |
| Higher severity threshold | Less output and reduced noise | Some useful diagnostic events may be excluded |
| Structured logging | Easier filtering and automated analysis | Requires consistent field design and formatter support |
| Logging exceptions at lower layers | Can preserve local diagnostic context | May create duplicate records across the call stack |
| Logging at a central handling boundary | Can provide a coherent failure record | May lack details known only to lower-level components |
| Recording request identifiers | Helps connect related events | Requires careful propagation and safe identifier handling |
| Logging full payloads | Can expose detailed input information | Creates privacy, security, volume, and retention risks |

There is no single logging configuration that fits every application.

The engineering goal is to make important behavior diagnosable while keeping logs understandable, safe, and proportionate to their value.

---

## 15. Practical Assignment

### Assignment: Add Logging to an Order Service

Consider this function:

```python
def calculate_order_total(
    price: float,
    quantity: int,
    discount_percent: float,
) -> float:
    if price < 0:
        raise ValueError("Price cannot be negative")

    if quantity <= 0:
        raise ValueError("Quantity must be positive")

    if not 0 <= discount_percent <= 100:
        raise ValueError("Invalid discount percentage")

    discounted_price = price * (
        1 - discount_percent / 100
    )

    return discounted_price * quantity
```

### Tasks

1. Add a module-level named logger using `logging.getLogger(__name__)`.
2. Decide which meaningful events should be logged at `DEBUG`, `INFO`, `WARNING`, or `ERROR`.
3. Add logging for successful completion if that event is operationally useful.
4. Ensure invalid input is handled according to the function's existing exception contract.
5. Add an example of logging an exception at an appropriate handling boundary without accidentally suppressing it.
6. Configure a readable logging format in a standalone example.
7. Add one contextual field using `extra`, then explain what formatter support is required to display it.
8. Review the output for sensitive or unnecessary information.
9. Explain which records would help investigate a failed order calculation and why.

### Constraints

- Do not replace exception handling with logging alone.
- Do not log every variable or every line of execution.
- Do not log the same failure redundantly at every layer.
- Do not change the calculation's behavior simply to produce a log record.

### Expected Deliverables

- A Python implementation with appropriate logging.
- A short explanation of the chosen levels.
- An example output or description of the expected records.
- A brief review of privacy and log-volume considerations.

---

## 16. Quick Revision

- Logging records selected events during application execution.
- Log levels communicate diagnostic importance.
- Python's `logging` module supports named loggers and configurable handlers.
- Loggers create records; handlers route them; formatters control their representation.
- Useful messages describe events and include relevant safe context.
- `logger.exception()` records exception information when used in an active exception handler.
- Logging an exception does not mean the exception has been handled correctly.
- Structured fields require formatter or handler support to appear in output.
- Logs should avoid unnecessary sensitive data and excessive volume.
- Parameterized logging defers formatting, but not evaluation of arguments.
- Logging supports debugging; it does not replace tests or guarantee correctness.

## 17. Key Takeaways

1. **Record meaningful events:** Logging should help engineers understand important application behavior, not generate noise.
2. **Choose levels deliberately:** Distinguish normal outcomes, recoverable conditions, failures, and critical failures.
3. **Keep context useful:** Include enough information to investigate an event without exposing unnecessary data.
4. **Preserve error semantics:** Recording an exception must not accidentally suppress or misrepresent the failure.
5. **Configure logging centrally:** Application modules should use named loggers, while the entry point or runtime establishes the intended configuration.
6. **Design for operations:** Consider volume, privacy, performance, formatting, and collection behavior from the beginning.

## 18. Further Reading

- [Python Logging HOWTO](https://docs.python.org/3/howto/logging.html)
- [Python Logging Cookbook](https://docs.python.org/3/howto/logging-cookbook.html)
- [Python `logging` Module Reference](https://docs.python.org/3/library/logging.html)
- [Python Built-in Exceptions](https://docs.python.org/3/library/exceptions.html)

---

# End of Document

This completes the Markdown file: `05-Logging.md`
