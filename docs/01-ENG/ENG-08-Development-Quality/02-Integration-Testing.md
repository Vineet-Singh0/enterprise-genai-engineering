# Integration Testing

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain why integration testing is necessary.
- Understand the difference between unit testing and integration testing.
- Identify component boundaries and integration points.
- Test interactions between application components.
- Understand how integration failures occur even when individual components work correctly.
- Design integration tests with controlled, repeatable conditions.
- Write integration tests in Python using `pytest`.
- Decide when to use real dependencies and when a controlled alternative is appropriate.
- Understand the trade-offs between test realism, execution speed, isolation, and maintenance.
- Recognize common integration-testing mistakes.

## 2. Prerequisites

This chapter assumes familiarity with:

- Python functions, modules, exceptions, and basic application behavior.
- The unit-testing concepts introduced in [01 — Unit Testing](01-Unit-Testing.md).
- Separation of concerns and dependency injection from ENG-03 — Software Engineering Principles.
- Basic application interfaces and dependencies.

**Estimated reading time:** 20–30 minutes.

## 3. Before We Start

Imagine that you are building an application with three components:

- A service that calculates an order total.
- A repository that retrieves product prices.
- An application service that combines the results.

Each component might work correctly when tested independently. Yet the application could still fail when the components interact.

For example:

- The service expects a decimal price, but the repository returns a string.
- One component returns `None` when another expects a list.
- A function is called with arguments in the wrong order.
- A database query returns data in a different shape than the application expects.
- One component raises an exception that its caller does not handle.

These problems do not necessarily originate inside a component's isolated logic. They arise at the boundaries between components.

**Integration testing verifies whether collaborating components work together correctly.**

## 4. Why Integration Testing Exists

### 4.1 Correct components do not guarantee a correct system

Consider two functions:

```python
def calculate_total(price: float, quantity: int) -> float:
    return price * quantity
```

```python
def get_quantity() -> int:
    return 3
```

Both functions can be correct independently.

Now suppose another component passes the arguments incorrectly:

```python
total = calculate_total(
    get_quantity(),
    100.0,
)
```

The call is syntactically valid, but the arguments have been reversed. The result is incorrect for the intended business operation.

A unit test for each function might pass while the combined operation fails to meet its requirements.

This illustrates the central purpose of integration testing: verify the behavior that emerges when components collaborate.

### 4.2 What is integration testing?

**Integration testing is the practice of verifying interactions between two or more components, including their interfaces, data exchange, and combined behavior.**

The components may be functions, modules, application services, repositories, or other dependencies.

The scope depends on the integration being verified.

For example:

- A service interacting with a repository.
- An application component calling another module.
- Business logic interacting with a real database.
- An API handler invoking an application service.

Integration testing focuses on the correctness of these interactions rather than only the isolated behavior of each component.

### 4.3 Integration testing is not limited to databases

Database integration tests are common, but integration testing is broader.

An integration test may verify that:

- One component passes the correct arguments to another.
- Returned data has the expected structure.
- Errors propagate or are handled correctly.
- Multiple components produce the expected combined result.
- A real dependency behaves as the application expects.

The important factor is the interaction being verified, not whether a particular technology is involved.

## 5. Mental Model: Components and Contracts

An interface is the boundary through which one component communicates with another.

A component's contract defines the behavior its collaborators can rely on, including expected inputs, outputs, and relevant errors.

Consider this simplified architecture:

```text
Application Service
        |
        v
Product Repository
        |
        v
Database
```

The application service depends on the repository's behavior. The repository depends on the database's behavior.

Each boundary introduces assumptions:

- What arguments are accepted?
- What values are returned?
- How are missing records represented?
- What happens when an operation fails?
- Are the returned values in the expected format?

Integration tests verify important assumptions at these boundaries.

A useful mental model is:

**Unit tests check individual responsibilities. Integration tests check whether the responsibilities connect correctly.**

The two practices complement each other.

## 6. Core Concepts

### 6.1 Integration boundaries

An integration boundary is a point where one component communicates with another.

Examples include:

| Boundary | What should be verified? |
|---|---|
| Service → Repository | Correct arguments and interpretation of returned data |
| Application → Database | Query behavior, data representation, and relevant constraints |
| API handler → Service | Correct request information passed into application logic |
| Parser → Consumer | Correct structure and interpretation of parsed data |
| Module A → Module B | Compatibility of interfaces and expected behavior |

Not every boundary requires a separate integration test. Prioritize boundaries where incorrect assumptions could cause meaningful failures.

### 6.2 Interface compatibility

Two components must agree on how they communicate.

For example, suppose a repository returns:

```python
{"price": "100.00"}
```

but its caller expects:

```python
{"price": 100.00}
```

The values represent the same apparent amount, but their types differ. Arithmetic or validation may fail.

An integration test can detect this mismatch by exercising the actual interaction between the components.

Interface compatibility includes more than types. It may also involve:

- Required fields.
- Optional values.
- Ordering assumptions.
- Error behavior.
- Data units and formats.
- Whether operations are synchronous or asynchronous.

The relevant contract determines what must be tested.

### 6.3 Real dependencies and controlled dependencies

An integration test can use real dependencies or controlled alternatives.

For example, a service and repository may be tested together using an in-memory implementation, or the repository may be connected to a real test database.

These approaches provide different kinds of evidence.

| Approach | Strength | Limitation |
|---|---|---|
| Real dependency | Exercises actual dependency behavior and compatibility | May be slower and require setup |
| Controlled alternative | Makes selected scenarios easier to reproduce | May not reveal defects in the real dependency |
| In-memory implementation | Can provide fast, repeatable integration feedback | May behave differently from a production database |

The right choice depends on the contract being verified.

If the purpose is to verify SQL constraints or database-specific behavior, an in-memory substitute may not provide sufficient evidence.

If the purpose is to verify how a service handles repository results, a controlled repository implementation may be adequate.

The distinction is not that one approach is universally better. It is that each verifies different assumptions.

Detailed dependency replacement techniques belong to [03 — Mocking](03-Mocking.md).

### 6.4 Test data and repeatability

Integration tests often require more setup than unit tests because several components must cooperate.

Suppose a test expects a product with a particular identifier to exist. If the required data is missing, the test may fail before reaching the behavior it intends to verify.

Good test data should be:

- Explicit enough to understand.
- Consistent with the scenario.
- Independent of unrelated test execution.
- Reproducible across repeated runs.
- Cleaned up or isolated when persistent state is involved.

For database-backed tests, uncontrolled shared state can make results depend on execution order or on data left behind by previous runs.

The setup and cleanup strategy should be appropriate to the dependency and the behavior being tested.

### 6.5 Failure propagation across components

Failures often cross component boundaries.

For example:

```text
Repository operation fails
          |
          v
Service receives an exception
          |
          v
Service handles or propagates it
          |
          v
Caller observes the resulting behavior
```

An integration test can verify whether the combined behavior matches the application's requirements.

It may check that a missing record is handled correctly, that a relevant exception propagates, or that an operation does not silently produce an incorrect result.

The expected outcome should come from the application's contract rather than from assumptions about what every application ought to do.

## 7. Internal Working: What an Integration Test Exercises

A simplified integration-test execution flow is:

```text
Test setup
    |
    v
Initialize collaborating components
    |
    v
Provide input to the entry component
    |
    v
Execute interactions across boundaries
    |
    v
Observe combined behavior
    |
    v
Compare with expected result
    |
    v
Clean up test state when necessary
```

Compared with a unit test, more of the application's behavior participates in the test.

This gives the test a broader scope, but it also introduces more possible failure sources.

A failure might result from:

- Incorrect application logic.
- Incompatible component interfaces.
- Invalid test data.
- Dependency configuration.
- Persistent state left by another test.
- A defect in the dependency itself.
- An incorrect test expectation.

Integration tests therefore require careful diagnosis. A failed test does not automatically identify which component is responsible.

## 8. Practical Implementation with Python and pytest

This example verifies that a service correctly interacts with a repository implementation.

The repository is deliberately implemented in memory so that the example remains runnable without an external database. It demonstrates component integration, not database integration.

### 8.1 Project structure

```text
integration-testing-demo/
├── order_service.py
├── product_repository.py
└── tests/
    └── test_order_service.py
```

### 8.2 Implement the repository

Create `product_repository.py`:

```python
class ProductRepository:
    def __init__(self, products: dict[int, dict]):
        self._products = products

    def get_product(self, product_id: int) -> dict | None:
        return self._products.get(product_id)
```

The repository provides a lookup operation. It returns a product when the identifier exists and `None` otherwise.

The in-memory dictionary is sufficient for demonstrating the interface. It does not reproduce the behavior of a real database.

### 8.3 Implement the service

Create `order_service.py`:

```python
from product_repository import ProductRepository

class OrderService:
    def __init__(self, repository: ProductRepository):
        self.repository = repository

    def calculate_order_total(
        self,
        product_id: int,
        quantity: int,
    ) -> float:
        if quantity <= 0:
            raise ValueError("Quantity must be positive")

        product = self.repository.get_product(product_id)

        if product is None:
            raise ValueError("Product not found")

        return product["price"] * quantity
```

The service validates the quantity, retrieves the product, handles a missing product, and calculates the total.

Its result depends on the repository returning data in the expected structure.

### 8.4 Write the integration tests

Create `tests/test_order_service.py`:

```python
import pytest

from order_service import OrderService
from product_repository import ProductRepository

@pytest.fixture
def order_service():
    products = {
        1: {"name": "Keyboard", "price": 100.0},
        2: {"name": "Mouse", "price": 50.0},
    }

    repository = ProductRepository(products)

    return OrderService(repository)

def test_calculates_total_using_repository_data(order_service):
    result = order_service.calculate_order_total(
        product_id=1,
        quantity=3,
    )

    assert result == 300.0

def test_uses_correct_product(order_service):
    result = order_service.calculate_order_total(
        product_id=2,
        quantity=2,
    )

    assert result == 100.0

def test_rejects_missing_product(order_service):
    with pytest.raises(
        ValueError,
        match="Product not found",
    ):
        order_service.calculate_order_total(
            product_id=999,
            quantity=1,
        )

def test_rejects_non_positive_quantity(order_service):
    with pytest.raises(
        ValueError,
        match="Quantity must be positive",
    ):
        order_service.calculate_order_total(
            product_id=1,
            quantity=0,
        )
```

The `pytest.fixture` creates a fresh service and repository for each test that requests the fixture under its default function scope.

This helps keep test data isolated between these test executions.

### 8.5 Run the tests

Install `pytest` if it is not already available in your development environment:

```bash
python -m pip install pytest
```

Run the suite from the project root:

```bash
python -m pytest -v
```

The tests should pass when the files are saved with the structure shown above.

### 8.6 What these tests verify

The tests exercise the service and repository together.

They verify that:

- The service retrieves the intended product.
- Repository data is interpreted correctly.
- The total is calculated from the returned price and quantity.
- Missing products are handled according to the service contract.
- Invalid quantities are rejected.

They do not verify:

- Database connectivity.
- SQL query correctness.
- Database constraints.
- Transaction behavior.
- Compatibility with a production database.

Those behaviors require tests that exercise the relevant real dependency.

This distinction matters when describing test coverage. The presence of a repository class does not automatically make a test a database integration test.

## 9. Designing Effective Integration Tests

### 9.1 Choose meaningful boundaries

Start by identifying which components collaborate to produce the behavior.

For each boundary, ask:

- What information crosses it?
- What assumptions does the caller make?
- What can go wrong if the components disagree?
- Which behavior cannot be adequately verified by testing the components separately?

This prevents integration testing from becoming a collection of arbitrary end-to-end scenarios.

### 9.2 Test the contract, not every internal step

An integration test should verify the important outcome of the interaction.

For example, when a service retrieves a product and calculates an order total, the test should verify that the correct total is returned for the selected product.

It generally does not need to assert every internal statement executed by the service.

Tests that over-specify internal interactions can become fragile and difficult to maintain.

### 9.3 Include failure scenarios

Successful interactions are only part of the contract.

Depending on the application, integration tests may need to verify:

- Missing data.
- Unexpected return values.
- Rejected operations.
- Relevant exceptions.
- Partial failures.
- Incorrect data formats.
- Dependency errors.

Choose scenarios according to the behavior and risks of the system.

Do not add failure scenarios that the application does not claim to handle without first establishing the intended contract.

### 9.4 Control state and test data

Shared databases and persistent resources can introduce hidden dependencies.

A test may pass when run alone but fail when another test has modified the same record.

Possible strategies include:

- Creating dedicated test records.
- Using an isolated test database or schema.
- Resetting relevant state before or after a test.
- Using transactions when the test environment and database behavior support the intended isolation.
- Ensuring that tests do not rely on execution order.

The correct strategy depends on the resource being tested. Cleanup must not accidentally remove data that other tests or processes depend on.

### 9.5 Keep test scope deliberate

Integration tests are generally more expensive than tests of isolated functions because they involve more setup and behavior.

This does not mean they should be avoided. It means they should be selected for the interactions they uniquely verify.

A balanced test suite uses unit tests for focused logic and integration tests for important component boundaries.

## 10. Production Perspective

### 10.1 Integration defects in backend services

Consider a backend application that processes a customer request.

The request handler calls a service, the service reads data from a repository, and the repository retrieves a record from a database.

Each component might work correctly in isolation, yet the combined application could still fail because:

- The repository returns a different data type than the service expects.
- A required field is absent.
- The service assumes a record always exists.
- The database enforces a constraint that the application does not account for.
- An error is transformed or propagated incorrectly.

Integration tests can expose these defects before the behavior reaches users.

### 10.2 Database-backed integration tests

When database behavior matters, use a test environment that exercises the relevant database semantics.

For example, if application correctness depends on a uniqueness constraint, an in-memory dictionary cannot establish that the actual database enforces the same constraint.

A database integration test can verify that the application and database agree on the intended behavior.

Practical concerns include:

- Reliable test database provisioning.
- Explicit test data.
- Cleanup and isolation.
- Consistent schema versions.
- Avoiding accidental writes to production data.
- Managing execution time.

The goal is to obtain meaningful evidence about the real integration without making the test environment unnecessarily complicated.

### 10.3 Integration tests and external services

Applications may interact with external services such as payment providers, identity systems, or model APIs.

Some integration behavior can be tested using controlled responses. Other behavior requires exercising a real test environment supplied by the external provider.

Choose based on the question being answered.

A controlled response can verify how the application handles a particular result. It cannot establish that a real external service is available or that its current interface is compatible.

External-service testing also requires careful management of credentials, test data, costs, and side effects.

Detailed dependency replacement techniques belong to [03 — Mocking](03-Mocking.md).

### 10.4 Interpreting failures

When an integration test fails, investigate the complete interaction rather than assuming that the last component called is defective.

A useful diagnostic sequence is:

1. Reproduce the failure.
2. Identify the entry point and participating components.
3. Inspect the inputs and outputs at relevant boundaries.
4. Check test data and environment assumptions.
5. Determine whether the defect lies in application logic, an interface, configuration, or a dependency.
6. Correct the underlying problem.
7. Run the focused test and the relevant broader suite again.

Systematic debugging techniques are covered in [04 — Debugging](04-Debugging.md).

## 11. Engineering Decisions and Trade-offs

### 11.1 Unit tests versus integration tests

| Dimension | Unit Testing | Integration Testing |
|---|---|---|
| Primary focus | Isolated behavior | Interactions between components |
| Typical scope | One function, method, or unit | Two or more collaborating components |
| Dependencies | Usually limited or controlled | Includes the dependencies relevant to the integration |
| Execution cost | Often low | Often higher |
| Failure diagnosis | Usually more localized | May involve multiple components or environment assumptions |
| Main value | Fast feedback on focused behavior | Evidence that component boundaries work correctly |

Neither approach replaces the other.

### 11.2 How many integration tests are needed?

There is no universal number.

Prioritize integrations that are important to correctness and difficult to verify through isolated tests.

For example, a critical database constraint deserves direct verification when the application's correctness depends on it. A simple transformation between two pure functions may not need a separate integration test if its interaction is already adequately verified elsewhere.

The decision should be based on risk, behavior, and the evidence provided by the test.

### 11.3 Should every dependency be real?

No.

Real dependencies provide stronger evidence about actual compatibility, but they can increase setup cost and execution time.

Controlled alternatives make scenarios easier to reproduce, but they can hide defects in the real dependency.

Use the smallest test scope that provides sufficient evidence for the behavior under investigation.

### 11.4 When is an integration test too broad?

A test becomes difficult to maintain when it involves many unrelated components and fails without clearly identifying the broken behavior.

A broader test may still be justified when the combined workflow is itself important. However, it should complement focused tests rather than make every defect depend on a large application-level scenario.

The aim is not to minimize the number of components at all costs. It is to choose a scope that answers a clear engineering question.

## 12. Common Mistakes and Misconceptions

### Mistake 1: Assuming successful unit tests prove integration correctness

Individual components may work correctly but disagree about data formats, argument order, or error handling.

**Better approach:** Test important component boundaries directly.

### Mistake 2: Calling every test involving multiple classes an integration test

The number of classes alone does not determine test scope. Several objects may collaborate entirely in memory, while one repository test may exercise a real database integration.

**Better approach:** Describe which boundaries and real dependencies the test actually exercises.

### Mistake 3: Using only in-memory substitutes to validate database behavior

An in-memory implementation may not reproduce SQL semantics, constraints, transactions, or database-specific behavior.

**Better approach:** Use the real test database when those properties matter.

### Mistake 4: Sharing uncontrolled test data

One test may modify state that another test assumes has not changed.

**Better approach:** Isolate test data and establish the required conditions explicitly.

### Mistake 5: Making integration tests unnecessarily broad

A failure involving many components may be difficult to diagnose.

**Better approach:** Keep each test focused on a meaningful integration contract.

### Mistake 6: Ignoring environment configuration

A test may fail because of missing configuration, unavailable resources, or incorrect test-environment assumptions.

**Better approach:** Make environmental requirements explicit and distinguish setup failures from application defects.

### Mistake 7: Testing only successful interactions

Components may behave correctly for valid inputs but fail when records are missing or dependencies return errors.

**Better approach:** Cover relevant failure behavior as defined by the application contract.

### Mistake 8: Treating every integration failure as an application bug

The test expectation, test data, configuration, or dependency may be responsible.

**Better approach:** Use evidence to identify the actual source before changing the implementation.

## 13. Interview Questions with Expected Answers

### Q1. What is integration testing?

Integration testing verifies that two or more components work together correctly, including their interfaces, data exchange, and combined behavior.

### Q2. Why are integration tests needed if unit tests already exist?

Unit tests verify isolated behavior. They may not detect mismatches between components, incompatible data formats, incorrect argument passing, or real dependency behavior. Integration tests provide evidence about those interactions.

### Q3. Is a test using an in-memory repository an integration test?

It can be, if it exercises the interaction between multiple collaborating components. However, it does not verify the behavior of a real database if the in-memory repository replaces the database entirely.

### Q4. What is an integration boundary?

It is a point where components communicate, such as a service calling a repository or an API handler calling an application service. Integration tests verify important assumptions at these boundaries.

### Q5. Why can integration tests be harder to debug than unit tests?

They involve more components, dependencies, state, and environmental assumptions. A failure may originate in any part of the interaction or in the test setup.

### Q6. Should integration tests always use real dependencies?

No. Real dependencies are appropriate when actual compatibility or dependency behavior must be verified. Controlled alternatives are useful when testing application behavior under specific, repeatable conditions.

### Q7. How can integration tests become flaky?

They may depend on shared state, external availability, timing, unstable test data, or uncontrolled environment differences. Explicit setup, isolation, and reproducible conditions help reduce these problems.

### Q8. How would you test a service that interacts with a database?

Identify the database behaviors the service relies on, use a suitable test database, establish explicit test data, execute the service through the relevant integration, verify the result, and clean up or isolate state.

### Q9. What is the difference between testing a repository and testing a service with a repository?

A repository test can focus on data-access behavior. A service-with-repository test verifies the combined behavior of the service and repository. The exact scope depends on which dependencies are real and which boundaries are exercised.

### Q10. What would you do if an integration test fails while all unit tests pass?

Reproduce the failure, inspect the interactions and data at the component boundaries, verify environment assumptions, and determine whether the problem is an interface mismatch, application defect, dependency issue, or incorrect test expectation.

### Q11. How do you decide which interactions need integration tests?

Prioritize interactions that are important to correctness, have meaningful failure risks, or depend on behavior that isolated tests cannot adequately verify.

### Q12. Can an integration test replace unit tests?

No. Integration tests provide broader evidence but generally have higher execution and diagnosis costs. Unit tests remain useful for focused, fast feedback on individual behaviors.

## 14. Practical Assignment

### Assignment: Test an Order Service and Its Repository

Build a small Python application with an order service and a product repository.

The service should retrieve product information from the repository and calculate the total for a requested quantity.

Use the following contract:

- A valid product identifier returns the corresponding product.
- The order service calculates the total from the product price and quantity.
- A missing product produces a clearly defined error.
- A non-positive quantity is rejected.
- The service must use the repository's returned data rather than hard-coded product values.

### Requirements

1. Implement a product repository.
2. Implement an order service that depends on the repository.
3. Write tests that exercise both components together.
4. Test at least two different products.
5. Test missing-product behavior.
6. Test invalid-quantity behavior.
7. Use a fresh, predictable set of test data.
8. Run the suite using `pytest`.
9. Explain which integration boundaries the tests verify.
10. State explicitly which real dependencies, if any, are not covered by your tests.

### Extension

Replace the in-memory repository with a repository backed by a suitable test database.

Add an integration test that verifies an important property of the actual database interaction. Choose a property that the in-memory version cannot establish, such as a database-enforced constraint.

Keep the original in-memory example available as a reference for understanding the difference in test scope.

### Engineering reflection

After completing the assignment, answer:

- Which defects could your integration tests detect that isolated unit tests might miss?
- What would happen if the repository returned a string instead of a numeric price?
- Which assumptions does the service make about repository behavior?
- How do your tests avoid depending on execution order?
- What additional evidence would a real database integration test provide?
- How would you diagnose a test that fails only when the full suite runs?

## 15. Quick Revision

- Integration testing verifies interactions between collaborating components.
- Unit tests focus on isolated behavior; integration tests focus on important boundaries and combined behavior.
- Interfaces include assumptions about arguments, returned values, data formats, and error handling.
- Real dependencies are needed when their actual behavior is part of the contract being verified.
- Controlled alternatives improve repeatability but may hide defects in real dependencies.
- Explicit test data and state isolation reduce order-dependent failures.
- Integration-test failures can originate in application logic, interfaces, dependencies, configuration, or test setup.
- Select integration tests based on risk and the evidence they provide.
- Integration testing complements rather than replaces unit testing.

## 16. Key Takeaways

1. **Correct components do not guarantee correct integration.** Their interfaces and combined behavior must also be verified.
2. **Test scope should match the engineering question.** Use real dependencies when their behavior matters and controlled alternatives when they provide sufficient evidence.
3. **Test data and state require deliberate management.** Uncontrolled state makes failures difficult to reproduce.
4. **Integration tests need focused expectations.** A clear contract makes failures easier to interpret.
5. **Unit and integration tests are complementary.** Both are needed to build confidence in different aspects of application behavior.

## 17. Further Reading

- [pytest — Official Documentation](https://docs.pytest.org/en/stable/): Test discovery, fixtures, execution, and reporting.
- [Python — `unittest` Documentation](https://docs.python.org/3/library/unittest.html): Standard-library testing concepts and test organization.

Consult the documentation relevant to the actual database or dependency used in your project when designing real integration tests.
