File: `07-Exception-Handling.md`
---

# Exception Handling

> **Domain:** Engineering Foundations (ENG)
> **Module:** ENG-02 — Programming Foundations
> **Document:** `07-Exception-Handling.md`

---

## Learning Objectives

After completing this chapter, you should be able to:

* Understand why exceptions exist.
* Explain what happens when a program encounters an error.
* Distinguish between syntax errors and runtime exceptions.
* Understand Python's exception handling mechanism.
* Learn the `try`, `except`, `else`, and `finally` blocks.
* Understand why robust error handling is essential in production systems.
* Build a mental model of exception propagation.
* Connect exception handling to enterprise software engineering.

---

## Prerequisites

Before reading this chapter, you should have completed:

* `01-Programming-Fundamentals.md`
* `02-Variables-and-Data-Types.md`
* `03-Operators-and-Expressions.md`
* `04-Control-Flow.md`
* `05-Functions.md`
* `06-Modules-and-Packages.md`

You should already understand:

* Functions
* Modules
* Variables
* Control Flow
* Function Calls
* The Call Stack

---

## Estimated Reading Time

**60–70 minutes**

---

## Before We Start

## Question

Imagine you're building an online banking application.

A customer transfers ₹50,000.

Suddenly,

the database connection fails.

What should happen?

Should the application:

* Crash immediately?
* Close itself?
* Display confusing technical messages?
* Lose the transaction?

Obviously not.

Instead, the application should:

* Detect the problem.
* Inform the user politely.
* Log the failure.
* Recover if possible.
* Continue serving other users.

This is the purpose of **Exception Handling**.

---

## Think for a Moment

Consider another situation.

A user enters:

```text
abc
```

instead of:

```text
100
```

while entering their age.

Should the entire application stop working because one user entered invalid input?

No.

Programs must be able to handle unexpected situations gracefully.

---

# Why This Exists

Real-world software operates in unpredictable environments.

Things frequently go wrong.

Examples include:

* Files may not exist.
* Network connections may fail.
* Databases may become unavailable.
* Users may enter invalid data.
* APIs may return errors.
* Disk space may run out.
* Memory may become exhausted.

Without exception handling:

```text
Unexpected Error

↓

Program Stops

↓

Application Crashes
```

With exception handling:

```text
Unexpected Error

↓

Detect Error

↓

Handle Error

↓

Continue Execution
```

Exception handling transforms software from **fragile** into **robust**.

---

> **Engineering Note**
>
> One of the biggest differences between beginner code and production software is error handling. Production systems assume that failures will happen and are designed to recover from them gracefully.

---

# Mental Model

Before learning Python syntax, let's build intuition.

## Analogy: A Car's Airbag

Imagine driving a car.

Normally:

```text
Drive

↓

Reach Destination
```

But suppose an accident occurs.

Without airbags:

```text
Accident

↓

Severe Injury
```

With airbags:

```text
Accident

↓

Airbag Deploys

↓

Damage Reduced
```

Exception handling works similarly.

It does **not** prevent problems from occurring.

Instead, it provides a safe way to respond when problems do occur.

---

# What Is an Exception?

An **exception** is an event that interrupts the normal flow of program execution.

Instead of continuing normally,

the program encounters a situation it cannot handle automatically.

Examples:

```python
10 / 0
```

```python
int("hello")
```

```python
open("missing.txt")
```

Each of these operations raises an exception.

---

# What Happens Without Exception Handling?

Consider:

```python
print("Program Started")

number = 10 / 0

print("Program Finished")
```

Execution:

```text
Program Started

↓

10 / 0

↓

ZeroDivisionError

↓

Program Stops
```

Output:

```text
Program Started

Traceback (most recent call last):
...

ZeroDivisionError: division by zero
```

Notice something important.

The final statement:

```python
print("Program Finished")
```

never executes.

The exception interrupts normal execution.

---

# Exception vs Bug

Many beginners believe every exception means the program contains a bug.

This is not always true.

Consider:

A user enters an invalid password.

Is that a programming bug?

No.

It's an expected situation.

Similarly:

* Missing files
* Network timeouts
* Invalid user input
* Expired authentication tokens

are all expected failures.

Exception handling exists precisely because these situations are normal in production systems.

---

## Syntax Errors vs Exceptions

Understanding this distinction is very important.

## Syntax Error

Occurs **before** the program begins execution.

Example:

```python
if True
    print("Hello")
```

Python reports:

```text
SyntaxError
```

The interpreter cannot even understand the program.

---

## Runtime Exception

Occurs **while** the program is executing.

Example:

```python
10 / 0
```

Python begins execution successfully.

Later:

```text
ZeroDivisionError
```

is raised.

---

# Comparison

| Syntax Error                 | Exception                                     |
| ---------------------------- | --------------------------------------------- |
| Happens before execution     | Happens during execution                      |
| Program cannot start         | Program starts but later encounters a problem |
| Caused by invalid syntax     | Caused by unexpected runtime conditions       |
| Must be fixed before running | Can often be handled gracefully               |

---

## Common Python Exceptions

Python provides many built-in exception types.

Some common examples are:

| Exception             | Cause                            |
| --------------------- | -------------------------------- |
| `ZeroDivisionError`   | Division by zero                 |
| `ValueError`          | Invalid value                    |
| `TypeError`           | Invalid data type operation      |
| `NameError`           | Variable does not exist          |
| `IndexError`          | Invalid list index               |
| `KeyError`            | Missing dictionary key           |
| `FileNotFoundError`   | File does not exist              |
| `ModuleNotFoundError` | Module cannot be imported        |
| `AttributeError`      | Object lacks requested attribute |

We'll encounter many of these throughout the curriculum.

---

## Example

```python
numbers = [10, 20, 30]

print(numbers[5])
```

Output:

```text
IndexError: list index out of range
```

Another example:

```python
age = int("abc")
```

Output:

```text
ValueError: invalid literal for int()
```

Each exception tells us what kind of problem occurred.

---

## Remember

* Exceptions interrupt the normal flow of execution.
* Exception handling allows programs to recover gracefully from unexpected situations.
* Syntax errors prevent a program from starting.
* Runtime exceptions occur while the program is executing.
* Production software expects failures and handles them instead of crashing.

---
# The `try` Statement

## Question

Suppose a program performs division.

Normally:

```python
result = 100 / 10
```

Everything works.

But what if someone writes:

```python
result = 100 / 0
```

Without exception handling, the program immediately crashes.

How can we tell Python:

> "This operation might fail. If it does, let me handle it."

The answer is the `try` statement.

---

# What Is a `try` Block?

A `try` block contains code that **might raise an exception**.

General syntax:

```python
try:
    # Code that may fail
```

Think of `try` as saying:

> "Attempt this operation."

Python executes the code normally.

If no exception occurs, execution continues.

If an exception occurs, Python immediately stops executing the remaining statements inside the `try` block and begins searching for an appropriate `except` block.

---

# First Example

Without exception handling:

```python
number = 10 / 0

print("Finished")
```

Output:

```text
ZeroDivisionError
```

The program stops.

---

Using `try`:

```python
try:
    number = 10 / 0
```

This alone is **not enough**.

Python now knows that this code might fail.

But it still doesn't know **how to respond**.

For that, we need `except`.

---

# The `except` Statement

## Question

Suppose an exception occurs inside a `try` block.

What should happen next?

Python allows us to specify the recovery code using `except`.

General syntax:

```python
try:
    # Risky Code

except:
    # Recovery Code
```

If an exception occurs:

* The `try` block stops.
* Python jumps directly to the `except` block.
* The recovery code executes.
* The program continues.

---

# Example

```python
try:
    result = 10 / 0

except:
    print("Cannot divide by zero.")
```

Output:

```text
Cannot divide by zero.
```

Notice something important.

Instead of crashing,

the application handled the problem gracefully.

---

# Execution Flow

```text
Program

↓

Enter try Block

↓

Exception Occurs?

├── No
│      │
│      ▼
│ Continue Program
│
└── Yes
       │
       ▼
 Jump to except

↓

Handle Error

↓

Continue Program
```

---

# Continuing Execution

Example:

```python
print("Program Started")

try:
    result = 10 / 0

except:
    print("Division Failed")

print("Program Finished")
```

Output:

```text
Program Started

Division Failed

Program Finished
```

Without exception handling,

the final line would never execute.

---

> **Engineering Note**
>
> Exception handling should allow applications to recover whenever recovery is reasonable. Crashing should be the last resort, not the default behavior.

---

# Catching Specific Exceptions

Using a plain `except` catches **every exception**.

Professional software usually catches only the exceptions it expects.

Example:

```python
try:
    result = 10 / 0

except ZeroDivisionError:
    print("Division by zero is not allowed.")
```

Output:

```text
Division by zero is not allowed.
```

Now only:

```text
ZeroDivisionError
```

is handled.

Other unexpected exceptions still propagate normally.

---

# Another Example

```python
try:
    age = int(input("Enter Age: "))

except ValueError:
    print("Please enter a valid number.")
```

If the user enters:

```text
abc
```

Output:

```text
Please enter a valid number.
```

Instead of crashing,

the program informs the user politely.

---

# Multiple `except` Blocks

A single operation may raise different exceptions.

Python allows multiple handlers.

Example:

```python
try:

    number = int(input("Enter Number: "))

    result = 100 / number

except ValueError:

    print("Invalid Number")

except ZeroDivisionError:

    print("Division by Zero")
```

Possible outcomes:

Input:

```text
abc
```

Output:

```text
Invalid Number
```

Input:

```text
0
```

Output:

```text
Division by Zero
```

Input:

```text
25
```

Output:

```text
4.0
```

Each exception has its own recovery logic.

---

# Execution Order

Python evaluates `except` blocks from top to bottom.

Example:

```python
try:
    ...

except ValueError:
    ...

except ZeroDivisionError:
    ...

except FileNotFoundError:
    ...
```

The first matching exception handler executes.

The remaining handlers are skipped.

---

# Handling Multiple Exceptions Together

Sometimes different exceptions should be handled in the same way.

Example:

```python
try:

    value = int(input())

    result = 100 / value

except (ValueError, ZeroDivisionError):

    print("Invalid Input")
```

Here:

* `ValueError`
* `ZeroDivisionError`

both execute the same recovery code.

This reduces duplication.

---

# Exception Objects

Sometimes we want information about the exception itself.

Python allows us to capture the exception object.

Example:

```python
try:

    number = 10 / 0

except ZeroDivisionError as error:

    print(error)
```

Output:

```text
division by zero
```

Here:

```python
error
```

contains information about the exception.

This is especially useful for:

* Logging
* Debugging
* Monitoring
* Production diagnostics

---

## Remember

* `try` contains code that may fail.
* `except` handles exceptions raised inside the `try` block.
* Catch specific exceptions whenever possible.
* Multiple `except` blocks allow different recovery actions.
* Exception objects provide useful debugging information.

---
# The `else` Block

## Question

Suppose an operation succeeds without raising any exception.

Should the recovery code execute?

No.

Should we continue writing the success logic inside the `try` block?

Not necessarily.

Python provides the `else` block to separate **normal execution** from **error handling**.

---

## What Is the `else` Block?

The `else` block executes **only if no exception occurs** inside the `try` block.

General syntax:

```python
try:
    # Risky Code

except SomeException:
    # Error Handling

else:
    # Executes only if no exception occurred
```

Think of it like this:

```text
Attempt Operation

↓

Exception?

├── Yes
│      │
│      ▼
│ Execute except
│
└── No
       │
       ▼
 Execute else
```

---

# Example

```python
try:
    number = int(input("Enter Number: "))

except ValueError:
    print("Invalid Number")

else:
    print("You entered:", number)
```

Input:

```text
25
```

Output:

```text
You entered: 25
```

Input:

```text
abc
```

Output:

```text
Invalid Number
```

Notice that the `else` block executes **only when the `try` block succeeds completely**.

---

# Why Use `else`?

Without `else`:

```python
try:
    number = int(input())

    print("Input Accepted")

except ValueError:
    print("Invalid Input")
```

Although correct, it mixes:

* Risky operations
* Success operations

Using `else` separates responsibilities.

```python
try:
    number = int(input())

except ValueError:
    print("Invalid Input")

else:
    print("Input Accepted")
```

This improves readability.

---

# The `finally` Block

## Question

Imagine your application opens a database connection.

```text
Connect Database

↓

Read Data

↓

Disconnect
```

Suppose an exception occurs while reading the data.

Will the connection be closed?

If not,

the application may leak resources.

Python solves this using the **`finally` block**.

---

# What Is the `finally` Block?

The `finally` block executes **every time**, regardless of whether an exception occurred.

General syntax:

```python
try:
    ...

except:
    ...

finally:
    ...
```

The code inside `finally` is guaranteed to run.

---

# Example

```python
try:
    print("Program Started")

    result = 10 / 0

except ZeroDivisionError:
    print("Cannot Divide")

finally:
    print("Cleaning Resources")
```

Output:

```text
Program Started

Cannot Divide

Cleaning Resources
```

Even though an exception occurred,

the `finally` block still executed.

---

# Another Example

```python
try:
    print("Everything OK")

finally:
    print("Always Executes")
```

Output:

```text
Everything OK

Always Executes
```

Even when there is **no exception**, `finally` still runs.

---

# Execution Flow

```text
Enter try

↓

Exception?

├── Yes
│      │
│      ▼
│ Execute except
│
└── No
       │
       ▼
 Execute else (if present)

↓

Execute finally

↓

Continue Program
```

The `finally` block is always the last block to execute.

---

# Real-World Example

Imagine reading a file.

```python
file = open("data.txt")
```

Regardless of success or failure,

the file should always be closed.

```python
try:

    file = open("data.txt")

    data = file.read()

except FileNotFoundError:

    print("File Missing")

finally:

    file.close()
```

Conceptually:

```text
Open File

↓

Read File

↓

Success?

├── Yes
│
├── No
│
▼

Close File
```

This prevents resource leaks.

---

> **Engineering Note**
>
> Modern Python often uses the `with` statement for automatically managing resources like files and database connections. However, understanding `finally` is essential because many lower-level systems and libraries still rely on it.

---

# Complete Exception Handling Structure

Python allows all four blocks together.

```python
try:
    ...

except SomeException:
    ...

else:
    ...

finally:
    ...
```

Each block has a different responsibility.

| Block     | Purpose                          |
| --------- | -------------------------------- |
| `try`     | Execute risky code               |
| `except`  | Handle exceptions                |
| `else`    | Execute when no exception occurs |
| `finally` | Always execute cleanup code      |

---

# Raising Exceptions

## Question

So far, Python has raised exceptions automatically.

For example:

```python
10 / 0
```

raises:

```text
ZeroDivisionError
```

But what if **our own code** detects an invalid situation?

Example:

A bank application should reject negative deposits.

Python allows us to raise exceptions manually.

---

# The `raise` Statement

General syntax:

```python
raise ExceptionType("Message")
```

Example:

```python
age = -5

if age < 0:
    raise ValueError("Age cannot be negative.")
```

Output:

```text
ValueError: Age cannot be negative.
```

Here,

the programmer intentionally signals that something is wrong.

---

# Why Raise Exceptions?

Sometimes incorrect data should **not** be silently accepted.

Examples:

* Invalid account numbers
* Negative prices
* Missing API keys
* Unsupported file formats
* Invalid AI model configuration

Raising an exception prevents invalid data from propagating further into the application.

---

## Custom Validation Example

```python
def withdraw(balance, amount):

    if amount > balance:
        raise ValueError("Insufficient Balance")

    return balance - amount
```

Calling:

```python
withdraw(1000, 5000)
```

Produces:

```text
ValueError: Insufficient Balance
```

This protects the application's business rules.

---

## Remember

* `else` executes only when no exception occurs.
* `finally` always executes, regardless of success or failure.
* `finally` is commonly used for cleanup operations.
* The `raise` statement allows programmers to generate exceptions intentionally.
* Exception handling is not just about recovering from errors—it also protects the integrity of the application.

---
# Exception Propagation

## Question

Suppose one function calls another function.

The second function raises an exception.

What happens next?

Does Python ignore it?

Does it automatically terminate the program?

Or does it somehow pass the exception back?

To answer this, we need to understand **exception propagation**.

---

## Why Exception Propagation Exists

Recall what we learned about the **Call Stack**.

When one function calls another, Python remembers the execution order.

Conceptually:

```text
main()

↓

process_order()

↓

calculate_total()
```

Now imagine:

```text
calculate_total()

↓

ValueError
```

Which function should handle it?

Python starts searching **up the call stack** until it finds a matching exception handler.

This process is called **exception propagation**.

---

# Example

```python
def divide():

    return 10 / 0

def calculate():

    divide()

calculate()
```

Execution:

```text
calculate()

↓

divide()

↓

ZeroDivisionError

↓

No Handler

↓

Return to calculate()

↓

No Handler

↓

Program Terminates
```

Output:

```text
Traceback (most recent call last):
...

ZeroDivisionError: division by zero
```

Neither function handled the exception.

It propagated all the way to the top of the program.

---

# Handling the Exception in the Caller

Instead of handling the exception inside `divide()`, we can handle it in the calling function.

```python
def divide():

    return 10 / 0

def calculate():

    try:
        divide()

    except ZeroDivisionError:
        print("Division Failed")

calculate()
```

Execution:

```text
calculate()

↓

divide()

↓

Exception Raised

↓

Return to calculate()

↓

except Block Executes

↓

Program Continues
```

Output:

```text
Division Failed
```

---

# Visualizing Exception Propagation

Imagine three function calls.

```python
def function_c():
    raise ValueError("Invalid Data")

def function_b():
    function_c()

def function_a():
    function_b()

function_a()
```

Call Stack:

```text
┌────────────────────┐
│ function_c()       │
├────────────────────┤
│ function_b()       │
├────────────────────┤
│ function_a()       │
└────────────────────┘
```

Exception Flow:

```text
function_c()

↓

ValueError

↓

function_b()

↓

No Handler

↓

function_a()

↓

No Handler

↓

Program Ends
```

The exception climbs upward until a handler is found.

---

# Handling at Different Levels

Suppose we modify `function_a()`.

```python
def function_c():
    raise ValueError("Invalid Data")

def function_b():
    function_c()

def function_a():

    try:
        function_b()

    except ValueError:
        print("Recovered")

function_a()
```

Execution:

```text
function_c()

↓

Raise Exception

↓

function_b()

↓

No Handler

↓

function_a()

↓

Exception Handled

↓

Continue Program
```

Output:

```text
Recovered
```

Notice that neither `function_c()` nor `function_b()` handled the exception.

The caller handled it.

---

# Why Propagation Is Useful

Imagine a database module.

```python
def connect_database():
    ...
```

Should it decide:

* How to display errors?
* Whether to retry?
* Whether to notify users?

Usually not.

Instead:

```text
Database Module

↓

Raise Exception

↓

Business Logic

↓

Decide Recovery Strategy
```

Each layer performs its own responsibility.

---

> **Engineering Note**
>
> Lower-level functions should usually report problems by raising exceptions. Higher-level components decide how to recover, retry, log, or notify users.

---

# Re-raising Exceptions

Sometimes a function wants to perform additional work before allowing the exception to continue.

Python supports this using:

```python
raise
```

Example:

```python
try:

    result = 10 / 0

except ZeroDivisionError:

    print("Logging Error")

    raise
```

Execution:

```text
Exception

↓

Log Error

↓

Raise Again

↓

Caller Handles Exception
```

This technique is common in production logging systems.

---

# Custom Exceptions

## Question

Python provides many built-in exceptions.

But what if your application needs its own?

Example:

* Invalid Coupon Code
* Payment Declined
* AI Model Not Loaded
* User Already Exists

These situations are specific to your application.

Python allows us to define our own exception classes.

---

## Why Custom Exceptions Exist

Suppose an online banking application detects fraud.

Should it raise:

```text
ValueError
```

Probably not.

A more meaningful exception would be:

```text
FraudDetectedError
```

This immediately communicates the problem.

---

# Creating a Custom Exception

Custom exceptions are created by inheriting from Python's built-in `Exception` class.

Example:

```python
class InvalidAgeError(Exception):
    pass
```

Now we have our own exception type.

---

# Raising a Custom Exception

```python
class InvalidAgeError(Exception):
    pass

age = -10

if age < 0:
    raise InvalidAgeError("Age cannot be negative.")
```

Output:

```text
InvalidAgeError: Age cannot be negative.
```

The exception behaves just like Python's built-in exceptions.

---

# Catching Custom Exceptions

```python
class InvalidAgeError(Exception):
    pass

try:

    raise InvalidAgeError("Negative Age")

except InvalidAgeError as error:

    print(error)
```

Output:

```text
Negative Age
```

Custom exceptions integrate seamlessly with Python's exception system.

---

# When to Create Custom Exceptions

Custom exceptions are useful when the built-in exceptions do not clearly describe the problem.

Examples:

* `AuthenticationError`
* `PaymentFailedError`
* `ConfigurationError`
* `VectorDatabaseError`
* `ModelInferenceError`
* `RateLimitExceededError`

These names make production logs much easier to understand.

---

## Remember

* Exceptions move upward through the call stack until a handler is found.
* This process is called **exception propagation**.
* Higher-level functions often handle exceptions raised by lower-level functions.
* Use `raise` to re-throw an exception after performing additional work.
* Custom exceptions make application-specific failures easier to understand and debug.

---
## Production Perspective

Exception handling is one of the defining characteristics of production-quality software.

Real systems are built with the assumption that failures **will happen**.

Instead of asking:

> "Can this fail?"

Professional engineers ask:

> "When this fails, how should the system respond?"

---

## Web Applications

Consider a typical login request.

```text
Client Request

↓

Validate Input

↓

Authenticate User

↓

Generate Session

↓

Return Response
```

Possible failures include:

* Invalid password
* Database unavailable
* Session storage failure
* Network timeout

Instead of crashing, the application catches these exceptions and returns appropriate HTTP responses.

Example:

```python
try:
    user = authenticate(username, password)

except InvalidCredentialsError:
    return {"error": "Invalid username or password"}

except DatabaseConnectionError:
    return {"error": "Service temporarily unavailable"}
```

The server remains operational even when individual requests fail.

---

## REST APIs

Most REST APIs wrap request processing in exception handling.

Conceptually:

```text
Incoming Request

↓

Validate

↓

Business Logic

↓

Database

↓

Response

        ▲
        │
 Exception Handling
```

Instead of exposing Python tracebacks to users, APIs return structured error responses.

Example:

```json
{
    "error": "User Not Found",
    "status": 404
}
```

This improves both security and user experience.

---

## Database Systems

Databases may fail for many reasons:

* Network interruption
* Connection timeout
* Deadlock
* Constraint violation
* Disk failure

Example:

```python
try:
    save_order(order)

except DatabaseError:
    rollback_transaction()
    log_error()
```

Notice that the application protects data integrity by rolling back incomplete operations.

---

## Cloud Applications

Cloud environments are inherently unreliable.

Services may become temporarily unavailable.

Example:

```python
try:
    upload_file()

except NetworkError:
    retry_upload()
```

Many cloud systems implement:

* Automatic retries
* Exponential backoff
* Circuit breakers
* Fallback mechanisms

All of these rely on exception handling.

---

## Artificial Intelligence

AI systems encounter many exceptional situations.

Examples:

* Missing model files
* GPU memory exhaustion
* Invalid prompts
* Corrupted datasets
* Token limit exceeded

Example:

```python
try:
    prediction = model.predict(image)

except ModelNotLoadedError:
    load_model()

except OutOfMemoryError:
    reduce_batch_size()
```

Instead of failing completely, AI pipelines often recover automatically.

---

## Large Language Model Applications

Modern LLM applications communicate with external APIs.

Possible failures include:

* API timeout
* Authentication failure
* Rate limiting
* Invalid responses

Example:

```python
try:
    response = llm.generate(prompt)

except RateLimitExceededError:
    wait_and_retry()

except AuthenticationError:
    notify_administrator()
```

Graceful recovery improves both reliability and user experience.

---

## Distributed Systems

Distributed systems assume that remote services may fail.

Example:

```text
Service A

↓

Service B

↓

Database

↓

Storage
```

Failures can occur at any layer.

Exception handling allows each component to:

* Retry operations
* Log failures
* Return fallback responses
* Notify monitoring systems

---

> **Engineering Note**
>
> Robust software is not software that never fails. Robust software is software that fails predictably, safely, and recoverably.

---

## Remember

Exception handling is essential because production environments are unpredictable.

Good exception handling:

* Protects users.
* Protects data.
* Improves reliability.
* Simplifies debugging.
* Enables automatic recovery.

---

# Engineering Decisions

Professional engineers don't simply catch every exception.

They carefully decide:

* Which exceptions to catch.
* Where to catch them.
* How to recover.
* Which exceptions should propagate.

---

## Decision 1 — Catch Specific Exceptions

Poor:

```python
try:
    process_payment()

except:
    print("Something went wrong")
```

Better:

```python
try:
    process_payment()

except PaymentFailedError:
    print("Payment failed")
```

Specific exception handling makes debugging much easier.

---

## Decision 2 — Avoid Empty `except` Blocks

Poor:

```python
try:
    update_database()

except:
    pass
```

The error disappears completely.

Future debugging becomes extremely difficult.

Better:

```python
try:
    update_database()

except DatabaseError as error:
    log_error(error)
```

Always record unexpected failures.

---

## Decision 3 — Don't Use Exceptions for Normal Logic

Poor:

```python
try:
    item = numbers[index]

except IndexError:
    item = None
```

Better:

```python
if index < len(numbers):
    item = numbers[index]
```

Exceptions should represent **exceptional situations**, not ordinary program flow.

---

## Decision 4 — Clean Up Resources

Whenever resources are opened:

* Files
* Database connections
* Network sockets
* Temporary files

ensure they are cleaned up.

Example:

```python
try:
    file = open("report.txt")

finally:
    file.close()
```

Modern Python often replaces this pattern with context managers (`with`), but the underlying principle remains the same.

---

## Decision 5 — Raise Meaningful Exceptions

Instead of:

```python
raise Exception("Error")
```

Prefer:

```python
raise InvalidCouponError("Coupon has expired.")
```

Meaningful exception names improve logs and simplify troubleshooting.

---

## Decision 6 — Let Higher Layers Decide Recovery

Lower-level functions should generally report problems.

Higher-level functions decide how to respond.

Example:

```text
Database Layer

↓

Raise Exception

↓

Business Layer

↓

Retry?

↓

API Layer

↓

Return HTTP Response
```

This separation keeps software modular.

---

## Remember

Professional exception handling is about:

* Predictability
* Clarity
* Recovery
* Maintainability

The goal is not to hide errors—it is to manage them responsibly.

---
# Common Mistakes

| Mistake                                         | Why It Is Incorrect                                                          | Correct Understanding                                          |
| ----------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Catching every exception using a bare `except:` | Hides unexpected bugs and makes debugging difficult.                         | Catch only the exceptions you expect.                          |
| Using exceptions for normal program flow        | Exceptions are slower and reduce readability.                                | Use `if` statements for expected conditions.                   |
| Ignoring exceptions with `pass`                 | Errors disappear silently, making production failures difficult to diagnose. | Log the exception or handle it appropriately.                  |
| Forgetting `finally` or resource cleanup        | Open files, sockets, or database connections may remain open.                | Always clean up resources or use context managers (`with`).    |
| Raising generic `Exception` everywhere          | Error messages become vague and difficult to troubleshoot.                   | Raise meaningful built-in or custom exceptions.                |
| Catching exceptions too early                   | Lower-level modules should not always decide recovery strategy.              | Let exceptions propagate to the appropriate layer.             |
| Forgetting to log exceptions                    | Problems become almost impossible to diagnose in production.                 | Record important exceptions using logging systems.             |
| Confusing syntax errors with runtime exceptions | Syntax errors prevent execution entirely.                                    | Runtime exceptions occur after the program has started.        |
| Writing overly large `try` blocks               | Makes it unclear which statement caused the exception.                       | Keep `try` blocks as small as practical.                       |
| Swallowing exceptions after partial work        | Can leave the application in an inconsistent state.                          | Roll back, clean up, or propagate the exception appropriately. |

---

## Interview Questions

## 1. What is an exception?

**Expected Answer**

An exception is an event that interrupts the normal flow of program execution due to an unexpected runtime condition.

---

## 2. What is the difference between a syntax error and an exception?

**Expected Answer**

A syntax error occurs before the program starts because the code is invalid. An exception occurs during execution when an unexpected situation arises.

---

## 3. What is the purpose of the `try` block?

**Expected Answer**

The `try` block contains code that may raise an exception.

---

## 4. What is the purpose of the `except` block?

**Expected Answer**

The `except` block catches and handles exceptions raised inside the corresponding `try` block.

---

## 5. When does the `else` block execute?

**Expected Answer**

The `else` block executes only if the `try` block completes successfully without raising an exception.

---

## 6. When does the `finally` block execute?

**Expected Answer**

The `finally` block always executes, regardless of whether an exception occurs or not. It is commonly used for cleanup operations.

---

## 7. What is exception propagation?

**Expected Answer**

Exception propagation is the process of passing an unhandled exception up the call stack until a matching exception handler is found.

---

## 8. Why are custom exceptions useful?

**Expected Answer**

Custom exceptions provide meaningful names for application-specific failures, improving readability, debugging, and maintainability.

---

## 9. Why shouldn't we use a bare `except:` in production code?

**Expected Answer**

A bare `except:` catches every exception, including unexpected programming errors, making debugging difficult and potentially hiding serious problems.

---

## 10. How is exception handling used in production software?

**Expected Answer**

Production software uses exception handling to recover from failures, protect resources, log errors, retry operations, return meaningful responses, and maintain system stability.

---

## Quick Revision

## Exception Flow

```text id="mkt8t9"
Program

↓

try

↓

Exception?

├── Yes
│      │
│      ▼
│ except
│
└── No
       │
       ▼
     else

↓

finally

↓

Continue Program
```

---

## Exception Handling Blocks

| Block     | Purpose                          |
| --------- | -------------------------------- |
| `try`     | Execute code that might fail     |
| `except`  | Handle exceptions                |
| `else`    | Execute when no exception occurs |
| `finally` | Always execute cleanup code      |

---

## Raising Exceptions

```python id="7zhm5p"
raise ValueError("Invalid Input")
```

Use `raise` when your own code detects an invalid situation.

---

## Custom Exceptions

```python id="cbb75k"
class PaymentFailedError(Exception):
    pass
```

Create custom exceptions for application-specific errors.

---

## Exception Propagation

```text id="9y5gwk"
Function C

↓

Function B

↓

Function A

↓

Handler Found
```

Unhandled exceptions move upward through the call stack.

---

## Best Practices

* Catch specific exceptions.
* Keep `try` blocks small.
* Log unexpected failures.
* Clean up resources.
* Use meaningful custom exceptions.
* Let higher layers decide recovery strategies.
* Avoid silent failures.

---

# Key Takeaways

* Exceptions represent unexpected runtime conditions.
* Exception handling prevents applications from crashing unnecessarily.
* `try`, `except`, `else`, and `finally` each serve a distinct purpose.
* `raise` allows developers to signal invalid situations explicitly.
* Unhandled exceptions propagate up the call stack.
* Custom exceptions improve clarity in large applications.
* Production software assumes failures will occur and is designed to recover safely.
* Good exception handling improves reliability, maintainability, observability, and user experience.
* Logging and proper cleanup are just as important as catching exceptions.
* Exception handling is a core engineering skill used in web applications, AI systems, cloud platforms, databases, and distributed systems.

---
