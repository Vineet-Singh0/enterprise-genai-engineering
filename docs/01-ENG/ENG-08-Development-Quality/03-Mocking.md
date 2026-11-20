# Mocking

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain why dependencies sometimes need to be controlled during testing.
- Understand test doubles and distinguish mocks, stubs, fakes, and spies.
- Explain how mocking changes the behavior of a dependency during a test.
- Use Python's `unittest.mock` and `pytest` to control dependencies.
- Configure return values, exceptions, and expected interactions.
- Decide when mocking is useful and when a real dependency is more appropriate.
- Identify tests that are too tightly coupled to implementation details.
- Understand the limitations of tests that replace real dependencies.
- Apply mocking to realistic backend application scenarios.

## 2. Prerequisites

This chapter assumes familiarity with:

- Python functions, classes, methods, and exceptions.
- Basic unit testing with `pytest`, covered in [01 — Unit Testing](01-Unit-Testing.md).
- Component interactions and integration boundaries, covered in [02 — Integration Testing](02-Integration-Testing.md).
- Dependency injection and separation of concerns from ENG-03 — Software Engineering Principles.

**Estimated reading time:** 20–30 minutes.

## 3. Before We Start

Imagine that you are testing an order service that sends a payment request to an external payment provider.

```text
Order Service
      |
      v
Payment Provider
      |
      v
External Payment System
```

The order service contains business logic that you want to verify. However, calling the real payment provider during every test introduces several problems:

- The provider may be unavailable.
- A real payment might be created.
- Each request may incur a cost.
- Responses may depend on external state.
- Network delays may slow down the test suite.
- Reproducing a specific failure may be difficult.

You want to test how the order service behaves when payment succeeds, fails, or is declined—without performing an actual payment.

This is where mocking becomes useful.

Instead of calling the real provider, the test can substitute a controlled object that behaves according to the scenario being tested.

The service still executes its own logic. Only the selected dependency is replaced.

## 4. Why Mocking Exists

### 4.1 The problem of uncontrolled dependencies

A dependency is something a component relies on to perform its work.

Examples include:

- A database repository.
- An external API client.
- A payment provider.
- A file-reading function.
- A clock or random-number generator.
- Another application service.

Some dependencies are easy to control. Others are slow, expensive, stateful, or outside the application's control.

Suppose a function retrieves a customer from a database and then calculates a discount. If the purpose of the test is to verify the discount decision, repeatedly connecting to a real database may add complexity without improving the evidence needed about that decision.

A controlled dependency allows the test to supply a known customer record and focus on the behavior of the component under examination.

### 4.2 What is mocking?

**Mocking is a technique in which a test replaces or controls a dependency so that the test can exercise specific behavior under predictable conditions.**

A mock can be configured to:

- Return a specified value.
- Raise a specified exception.
- Record how it was called.
- Verify that expected interactions occurred.
- Help reproduce a failure condition.

Mocking is not the same as testing itself. It is a technique that can support testing.

The test must still verify meaningful behavior. A mock that returns a configured value proves only that the test double was configured to return that value. It does not establish that the real dependency would behave the same way.

### 4.3 Mocking does not eliminate dependencies

When a test replaces a dependency, the component still relies on that dependency's interface and expected behavior.

For example, an order service may expect a payment client to expose a `charge()` method.

Replacing the payment client with a mock allows the test to control that method's behavior. It does not prove that the real payment client implements the interface correctly or communicates successfully with the external provider.

That distinction is central to deciding which tests should use mocks and which should exercise real integrations.

## 5. Mental Model: A Controlled Substitute

Consider this arrangement:

```text
Without a test double:

Test
 |
 v
Order Service
 |
 v
Real Payment Client
 |
 v
External Provider

With a test double:

Test
 |
 v
Order Service
 |
 v
Mock Payment Client
 |
 v
Configured Test Behavior
```

In the second arrangement, the order service still runs. Its payment dependency behaves according to the test configuration.

For example:

- One test configures the dependency to report success.
- Another configures it to report a declined payment.
- Another configures it to raise a timeout exception.

This lets the test exercise multiple branches of the order service without relying on the external provider to produce each scenario.

The important limitation is that the substitute models only the behavior configured in the test. If that behavior does not match the real dependency's contract, the test can provide false confidence.

## 6. Core Concepts

### 6.1 Test doubles

A **test double** is a replacement object or function used in a test instead of a real dependency.

The term describes the broader category of substitutes. A mock is one kind of test double.

Several common forms are useful to distinguish.

| Type | Main purpose | Example |
|---|---|---|
| Dummy | Fills a required parameter but is not meaningfully used | An unused placeholder argument |
| Stub | Returns predetermined responses | A repository returning a known customer |
| Fake | Provides a simplified working implementation | An in-memory repository |
| Mock | Supports expectations about calls or interactions | Verifying that a payment client was called once |
| Spy | Records calls to an object while allowing behavior to execute | Recording how often a method is invoked |

These categories describe different testing purposes. Particular libraries may combine capabilities, so the name of a library object does not always map perfectly to one category.

### 6.2 Stubs

A stub supplies a predetermined response to a dependency call.

For example:

```python
class StubCustomerRepository:
    def get_customer(self, customer_id: int) -> dict:
        return {
            "id": customer_id,
            "tier": "premium",
        }
```

A service can use this repository to receive predictable customer data.

The stub is useful when the test needs a specific dependency response but does not need to verify detailed interactions with the dependency.

The test can then focus on how the service interprets the returned customer.

### 6.3 Fakes

A fake is a simplified implementation that performs real operations but does not reproduce the full production dependency.

For example, an in-memory repository may support storing and retrieving records using a dictionary instead of a database.

```python
class InMemoryRepository:
    def __init__(self):
        self._records = {}

    def save(self, record_id: int, value: dict) -> None:
        self._records[record_id] = value

    def get(self, record_id: int) -> dict | None:
        return self._records.get(record_id)
```

This object actually stores and retrieves data. It is not merely configured to return one fixed response.

A fake can be useful when tests need realistic state changes without the cost of a production dependency.

However, an in-memory repository may not reproduce database constraints, transaction semantics, concurrency behavior, or query execution. Those properties require tests against the relevant real database behavior.

### 6.4 Mocks

A mock can provide configured responses and record interactions so that the test can verify whether expected calls occurred.

For example, a test might verify that a payment client was called with the correct amount and that the service handled the returned payment status correctly.

Mock interaction checks can be valuable when the interaction itself is part of the behavior being tested.

They become less useful when they merely enforce the implementation's internal sequence without establishing an important requirement.

### 6.5 Spies

A spy records interactions while allowing an existing function or object to execute.

For example, a test may wrap a function and verify how many times it was called while retaining its original behavior.

Spies can be useful when observing an interaction is necessary but completely replacing the behavior would weaken the test.

### 6.6 Choosing the appropriate test double

Choose the substitute according to the question the test needs to answer.

- Need a known response? A stub may be sufficient.
- Need a simplified stateful implementation? A fake may be appropriate.
- Need to verify an important call or interaction? A mock may be useful.
- Need to observe calls while retaining real behavior? A spy may be appropriate.
- Need a real dependency contract to be verified? A test double alone is insufficient.

The objective is not to use mocks everywhere. It is to control only what needs to be controlled.

## 7. Internal Working: How Mocking Changes a Test

Consider a service that calls a dependency:

```python
result = payment_client.charge(amount=500)
```

In ordinary execution, `payment_client` refers to a real implementation.

During a test, the reference can instead point to a mock object configured to return a specific result.

The execution then follows this simplified sequence:

```text
Test creates mock
       |
       v
Test configures response
       |
       v
Service receives mock dependency
       |
       v
Service calls dependency
       |
       v
Mock returns configured result
       |
       v
Service processes the result
       |
       v
Test verifies service behavior
and relevant interaction
```

The mock intercepts the call at the selected boundary. The rest of the service logic executes normally unless the test also replaces other components.

A test may also configure the mock to raise an exception instead of returning a result.

This makes otherwise difficult conditions reproducible. It does not establish how frequently those conditions occur in the real system.

## 8. Practical Implementation with Python

Python provides `unittest.mock` in the standard library. Its `Mock` and `patch` utilities can be used with `pytest`.

The following example shows dependency injection first, followed by the use of a mock.

### 8.1 Project structure

```text
mocking-demo/
├── order_service.py
├── payment_client.py
└── tests/
    └── test_order_service.py
```

### 8.2 Define the payment dependency

Create `payment_client.py`:

```python
class PaymentClient:
    def charge(self, amount: float) -> dict:
        # Simplified example of an external payment operation.
        # A real implementation would communicate with a provider.
        raise NotImplementedError(
            "Connect this method to a real payment provider"
        )
```

This class represents the interface expected by the order service. It intentionally does not perform a real payment.

### 8.3 Implement the order service

Create `order_service.py`:

```python
class OrderService:
    def __init__(self, payment_client):
        self.payment_client = payment_client

    def place_order(self, amount: float) -> str:
        if amount <= 0:
            raise ValueError("Amount must be positive")

        result = self.payment_client.charge(amount=amount)

        if result["status"] == "success":
            return "Order confirmed"

        return "Payment unsuccessful"
```

The service validates the amount, requests payment, and interprets the returned status.

The dependency is supplied through the constructor. This makes it possible to provide a real client in one context and a controlled substitute in another.

### 8.4 Test a successful payment

Create `tests/test_order_service.py`:

```python
from unittest.mock import Mock

from order_service import OrderService

def test_confirms_order_when_payment_succeeds():
    payment_client = Mock()
    payment_client.charge.return_value = {
        "status": "success"
    }

    service = OrderService(payment_client)

    result = service.place_order(500)

    assert result == "Order confirmed"
    payment_client.charge.assert_called_once_with(
        amount=500
    )
```

This test establishes a controlled dependency response.

It verifies two things:

1. The service returns the expected result.
2. The payment client is called exactly once with the expected amount.

The first assertion verifies the service's observable result. The second verifies an interaction that matters to the payment operation.

The test does not prove that the real payment provider would approve the transaction. The payment response is configured by the test.

### 8.5 Test a declined payment

Add another test:

```python
def test_reports_unsuccessful_payment():
    payment_client = Mock()
    payment_client.charge.return_value = {
        "status": "declined"
    }

    service = OrderService(payment_client)

    result = service.place_order(500)

    assert result == "Payment unsuccessful"
    payment_client.charge.assert_called_once_with(
        amount=500
    )
```

The mock makes the declined-payment scenario repeatable without depending on an external provider.

The service still processes the returned status through its normal code path.

### 8.6 Test a dependency exception

A dependency may raise an exception. The test can configure this behavior explicitly.

```python
import pytest
from unittest.mock import Mock

from order_service import OrderService

def test_propagates_payment_dependency_failure():
    payment_client = Mock()
    payment_client.charge.side_effect = TimeoutError(
        "Payment provider timed out"
    )

    service = OrderService(payment_client)

    with pytest.raises(
        TimeoutError,
        match="Payment provider timed out",
    ):
        service.place_order(500)
```

This test verifies that the service propagates the configured timeout.

That expectation follows the example implementation, which does not catch the exception.

If the intended application contract requires the service to translate or handle timeouts, the implementation and test should reflect that contract instead.

### 8.7 Run the tests

Install `pytest` if needed:

```bash
python -m pip install pytest
```

Run the suite from the project root:

```bash
python -m pytest -v
```

The tests should pass with the code shown above. The `PaymentClient` implementation is not called because each test supplies a mock dependency.

### 8.8 What these tests establish

The tests provide evidence that the order service:

- Interprets configured payment responses correctly.
- Requests payment using the expected amount.
- Handles the demonstrated dependency exception according to its current implementation.

They do not verify:

- The actual payment provider's interface.
- Network communication with the provider.
- Real payment authorization.
- Provider authentication or configuration.
- The provider's actual error behavior.

Those properties require additional verification against the appropriate real integration or provider test environment.

## 9. Patching Existing Dependencies

Dependency injection is not always available. Some application code directly references a function or constructs a dependency internally.

In those cases, `unittest.mock.patch` can temporarily replace the name used by the code under test.

Consider this module.

Create `notification_service.py`:

```python
from email_sender import send_email

def notify_user(email: str) -> str:
    send_email(email, "Your order is confirmed")
    return "Notification requested"
```

The module imports `send_email` into its own namespace.

A test can patch that imported name:

```python
from unittest.mock import patch

from notification_service import notify_user

def test_notify_user_requests_email():
    with patch(
        "notification_service.send_email"
    ) as mock_send_email:
        result = notify_user("user@example.com")

    assert result == "Notification requested"
    mock_send_email.assert_called_once_with(
        "user@example.com",
        "Your order is confirmed",
    )
```

The important rule is to patch the name where the code under test looks it up.

Because `notification_service` imported `send_email`, the relevant name is `notification_service.send_email`.

Patching an unrelated reference elsewhere may not replace the dependency used by the function.

### 9.1 Why patching can become fragile

Patching ties the test to a particular lookup path and code structure.

A harmless refactor that changes how the dependency is imported or constructed may require changes to the test.

When practical, explicit dependency injection can make dependencies easier to identify and control. However, it should be used in a way that fits the application's existing design rather than introducing unnecessary abstraction solely to satisfy tests.

## 10. Production Perspective

### 10.1 Testing error handling

Real external failures may be difficult to reproduce reliably.

A mock can simulate conditions such as:

- A payment being declined.
- A repository raising a timeout.
- A notification service reporting failure.
- An external API returning a known error response.

The service's behavior can then be verified under those conditions.

This is especially useful when the test needs to establish that the application handles a particular failure according to its contract.

### 10.2 Testing rare or expensive scenarios

Some conditions are difficult to trigger in a real environment. A mock can make those scenarios reproducible without requiring the actual event to occur.

For example, a service may need to behave correctly when a dependency raises a specific exception.

The test can configure the dependency to raise that exception directly.

This provides evidence about the service's response to the exception. It does not establish that the external system actually produces the exception under the expected circumstances.

### 10.3 Protecting against unintended side effects

Replacing a dependency can prevent a test from:

- Sending a real email.
- Creating an actual payment.
- Modifying production data.
- Calling a costly external API.
- Performing an irreversible external operation.

The replacement must occur at the correct boundary. If the real dependency is still reachable through another path, the test may produce side effects despite using a mock elsewhere.

Never assume that a test is safe merely because one dependency has been mocked.

### 10.4 Mocking in backend and AI applications

Mocking can be useful in a backend or AI application when testing application logic that depends on external capabilities.

For example, an application may call an embedding service, a vector-search client, or an LLM API.

A test can provide a controlled response to verify how the application processes that response.

However, the test does not establish that the real model produces the expected embedding, that a live vector database returns the same results, or that the actual LLM integration works.

Those behaviors require appropriate additional verification.

## 11. Engineering Decisions and Trade-offs

### 11.1 When should you use a mock?

Mocking is often appropriate when:

- A dependency is expensive or slow.
- A dependency is outside the application's control.
- A particular failure condition must be reproduced.
- The test must avoid external side effects.
- The test needs to verify an important interaction.
- The dependency's behavior must be controlled to isolate a specific scenario.

Mocking is less useful when replacing the dependency removes the very behavior the test is intended to verify.

### 11.2 When should you prefer a real dependency?

Use a real dependency when its actual behavior is part of the requirement being verified.

Examples include:

- Database-specific constraints.
- Real serialization or parsing behavior.
- Compatibility with an external service interface.
- Dependency configuration and authentication.
- Actual communication behavior.

A mock may simulate the expected response without exercising any of those properties.

### 11.3 The risk of over-mocking

Over-mocking occurs when too many dependencies are replaced or when tests assert too many implementation details.

For example, a test might verify every internal method call made by a service, even though the actual requirement concerns only the final result.

This can create brittle tests: tests that break after internal refactoring even when the intended behavior remains unchanged.

A useful decision rule is:

**Mock external or uncontrolled behavior when necessary, but verify the behavior that matters to the application.**

### 11.4 Mock fidelity

Mock fidelity describes how closely a test double represents the real dependency's relevant behavior.

A mock that returns `{"status": "success"}` may be sufficient for testing a simple decision branch. It may be inadequate if the real provider returns a more complex response, uses different field names, or raises errors in a different format.

The greater the mismatch between the substitute and the real dependency, the greater the risk that tests will pass while the integration remains broken.

Use real integration tests or contract-focused verification where the dependency's actual behavior matters.

### 11.5 Test isolation versus realism

| Consideration | Controlled test double | Real dependency |
|---|---|---|
| Repeatability | Usually easier to control | Depends on environment and state |
| Execution speed | Usually faster | May be slower |
| Failure simulation | Easy to configure | May be difficult to reproduce |
| Real compatibility | Limited by the substitute | Exercises the actual dependency |
| External side effects | Can often be avoided | Must be managed carefully |
| Setup requirements | Often smaller | May require services and test data |

Neither approach is sufficient for every scenario. The choice should be based on the evidence the test needs to provide.

## 12. Common Mistakes and Misconceptions

### Mistake 1: Mocking everything

Replacing every dependency can prevent tests from verifying meaningful interactions and real behavior.

**Better approach:** Replace only the dependencies necessary to control the scenario or isolate the behavior under examination.

### Mistake 2: Testing the mock instead of the application

A test that verifies only that a mock returns its configured value does not establish that the application uses the result correctly.

**Better approach:** Execute the component under test and verify its observable behavior.

### Mistake 3: Assuming a mock proves the real integration works

A mock can be configured to return any response, even one that the real dependency never produces.

**Better approach:** Verify actual dependency behavior through appropriate integration tests.

### Mistake 4: Patching the wrong location

A patch may replace a name that the code under test never looks up.

**Better approach:** Patch the name used by the module or object being tested.

### Mistake 5: Asserting every internal call

Tests may become tightly coupled to implementation details and break during harmless refactoring.

**Better approach:** Assert interactions only when they matter to the behavior or contract.

### Mistake 6: Ignoring mock configuration

An incorrectly configured mock may return unexpected values or fail to reproduce the intended scenario.

**Better approach:** Make configured return values and exceptions explicit, and ensure they match the scenario being tested.

### Mistake 7: Treating stubs, fakes, and mocks as identical

These substitutes serve different purposes, even though a library object may support several of their capabilities.

**Better approach:** Choose terminology and implementation based on the role the test double performs.

### Mistake 8: Hiding design problems behind excessive mocking

A component with many tightly coupled dependencies may be difficult to test without elaborate mock setup.

**Better approach:** Investigate whether the component has too many responsibilities or unclear boundaries. Do not assume that more mocks automatically make the design better.

### Mistake 9: Forgetting external side effects

A real dependency may still be reachable through a different code path.

**Better approach:** Verify which dependency reference is replaced and ensure the test environment cannot accidentally perform unsafe external operations.

## 13. Interview Questions with Expected Answers

### Q1. What is mocking?

Mocking is a testing technique that replaces or controls a dependency so that a component can be tested under predictable conditions. A mock can provide configured responses and record interactions.

### Q2. What is a test double?

A test double is a substitute used in place of a real dependency during testing. Stubs, fakes, mocks, and spies are common forms of test doubles.

### Q3. What is the difference between a stub and a mock?

A stub primarily supplies predetermined responses. A mock can also support expectations about interactions, such as verifying that a method was called with specific arguments. Actual libraries may combine both capabilities.

### Q4. What is a fake?

A fake is a simplified working implementation of a dependency. An in-memory repository that stores and retrieves records is a common example.

### Q5. Why would you mock an external API?

Mocking allows the application logic to be tested without relying on external availability, cost, network behavior, or real side effects. It also makes specific responses and failures reproducible.

### Q6. Can a mocked test prove that an external API works?

No. It verifies the application's behavior against the configured substitute. The real integration requires additional verification.

### Q7. What is dependency injection, and how does it help with mocking?

Dependency injection supplies a component's dependencies from outside the component. It makes it easier to provide a mock or other test double without changing the component's internal logic.

### Q8. Why can over-mocking be harmful?

It can make tests brittle, hide real integration defects, and verify implementation details rather than meaningful behavior.

### Q9. Where should a dependency be patched in Python?

Patch the name where the code under test looks it up. For an imported name, this is commonly the module namespace that imported the dependency.

### Q10. When should you avoid mocking?

Avoid replacing a dependency when its real behavior is central to the test, such as database constraints or actual interface compatibility. Use an appropriate real integration test for that behavior.

### Q11. How would you test a payment service without making a real payment?

Inject a payment-client substitute, configure it to return the required result or raise the required exception, execute the service, and verify the service's behavior and relevant interaction.

### Q12. What is mock fidelity?

Mock fidelity describes how closely the substitute represents the relevant behavior of the real dependency. Low fidelity can allow tests to pass even when the real integration is incompatible.

## 14. Practical Assignment

### Assignment: Test an Order Service with a Payment Dependency

Create an order service that accepts a payment client as a dependency.

The service should:

- Reject non-positive payment amounts.
- Call the payment client with the requested amount.
- Confirm the order when the payment status is successful.
- Report unsuccessful payment when the provider declines the payment.
- Follow a clearly defined policy for dependency exceptions.

### Requirements

1. Implement the order service.
2. Create a mock payment client using `unittest.mock`.
3. Test the successful-payment scenario.
4. Test the declined-payment scenario.
5. Test a dependency timeout or other relevant exception.
6. Verify the amount passed to the payment client.
7. Verify that invalid amounts do not trigger a payment request.
8. Keep each test focused on one meaningful behavior.
9. Run the tests with `pytest`.
10. Explain which properties remain unverified because the real payment provider is not used.

### Engineering reflection

After completing the assignment, answer:

- Which dependency behaviors did you control with mocks?
- Which assertions verify application behavior, and which verify interactions?
- What would happen if the real payment provider used a different response format?
- Which additional integration test would help establish compatibility?
- Did any mock make the test unnecessarily coupled to implementation details?
- Could a fake or real test dependency provide better evidence for any scenario?

The goal is not simply to make the tests pass. It is to understand exactly what the tests establish—and what remains unknown.

## 15. Quick Revision

- Mocking controls a dependency during testing.
- A test double is the broader category that includes stubs, fakes, mocks, and spies.
- Stubs provide predetermined responses; fakes provide simplified working behavior; mocks support interaction verification.
- Python provides `unittest.mock`, which works with `pytest`.
- Dependency injection makes dependencies easier to replace explicitly.
- `patch` replaces a name where the code under test looks it up.
- Mocking can make failure scenarios reproducible and prevent unwanted side effects.
- A mock does not prove that a real dependency behaves the same way.
- Excessive mocking can hide integration defects and make tests brittle.
- Use the smallest amount of dependency control that provides meaningful evidence.

## 16. Key Takeaways

1. **Mocking is a means, not an objective.** Its value depends on the behavior the test verifies.
2. **Choose the right test double.** Different substitutes serve different testing purposes.
3. **Verify the application, not just the substitute.** The important evidence concerns how the component behaves when the dependency responds.
4. **Preserve realism where it matters.** Real integrations are necessary when actual dependency behavior is part of the requirement.
5. **Avoid excessive implementation coupling.** Interaction assertions should protect meaningful contracts, not every internal detail.

## 17. Further Reading

- [Python — `unittest.mock` Documentation](https://docs.python.org/3/library/unittest.mock.html): Mock objects, patching, call assertions, and side effects.
- [pytest — Official Documentation](https://docs.pytest.org/en/stable/): Test execution, fixtures, and test organization.

Consult the documentation for the actual dependency and its test environment when verifying real integration behavior.
