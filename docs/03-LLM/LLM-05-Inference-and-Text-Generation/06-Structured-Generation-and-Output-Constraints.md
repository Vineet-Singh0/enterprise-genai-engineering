# Structured Generation and Output Constraints

## 1. Purpose and Scope

Language models generate output by repeatedly selecting tokens according to their learned probability distributions and the active decoding configuration. This process is flexible, but flexibility alone does not guarantee that the output follows a required structure.

Applications often need responses that conform to a specific format, such as:

- Valid JSON objects.
- Outputs that follow a defined schema.
- Text that conforms to a grammar.
- Structured fields required by an API.
- Constrained choices from an allowed set of values.

**Structured generation** is the process of producing model output under structural or format constraints. These constraints restrict which continuations are permitted during generation or determine whether generated output is acceptable afterward.

This chapter explains the concepts, mechanisms, limitations, and engineering trade-offs involved in structured generation.

The focus is on the generation interface and its constraints. It does not attempt to teach JSON syntax, formal language theory, tokenizer implementation, or application-level schema design in depth.

## 2. Why Unconstrained Generation Is Not Always Sufficient

Ordinary text generation optimizes token selection according to the model's learned distribution and the configured decoding strategy. The model may produce an answer that is understandable to a human but unusable by a downstream system.

Consider an application that expects:

```json
{
  "status": "approved",
  "confidence": 0.92
}
```

An unconstrained model might instead generate:

```text
The request has been approved.

{
  "status": "approved",
  "confidence": "high"
}
```

The response communicates the intended meaning, but it violates the application's expected output contract in two ways:

- Additional prose appears outside the JSON object.
- The `confidence` value has a different type from the expected numeric value.

These problems arise because natural-language plausibility and structural validity are different objectives.

A production application cannot assume that a response will be machine-readable merely because the prompt requests a particular format.

Structured generation introduces mechanisms for making output conform to an expected structure. The strength of the guarantee depends on the mechanism, the supported constraints, and the behavior of the generation system.

## 3. Four Distinct Responsibilities

Structured generation is easier to reason about when four responsibilities are kept separate.

| Responsibility | Purpose |
|---|---|
| Generation | Produces candidate token continuations using the model |
| Constraint enforcement | Restricts generation to continuations permitted by the active structural rules |
| Parsing | Interprets generated text as a structured representation |
| Validation | Checks whether the parsed representation satisfies specified requirements |

These responsibilities can be combined in a framework, but they are not interchangeable.

For example, parsing a JSON response can establish that the text is syntactically valid JSON. It does not automatically establish that the object contains all required fields or that each value satisfies the application's business rules.

Similarly, validating a response after generation does not prevent the model from producing invalid text in the first place.

A robust application defines which guarantees are needed and assigns each responsibility accordingly.

## 4. Levels of Output Correctness

Structured output has several distinct correctness dimensions.

### 4.1 Syntax correctness

The output follows the syntax of the required format.

For JSON, this means that the response can be parsed according to JSON syntax rules.

### 4.2 Structural correctness

The parsed output follows the expected shape, including required fields, allowed properties, and expected data types.

For example, a response may be valid JSON but contain a string where the application requires a number.

### 4.3 Semantic correctness

The values express the intended meaning and are appropriate for the task.

An output can be syntactically and structurally valid while containing an incorrect classification, unsupported claim, or inappropriate value.

### 4.4 Application correctness

The response satisfies the application's operational requirements, including business rules, authorization requirements, and any necessary checks before the result is used.

These dimensions form a useful diagnostic hierarchy, but they are not a guarantee that success at one level implies success at the next.

**Engineering principle:** structural constraints can improve format reliability, but they do not establish that the content is factually correct, safe, authorized, or suitable for a particular business action.

## 5. Common Structured-Generation Approaches

Structured output can be supported through several approaches. They differ in when constraints are applied and what they guarantee.

### 5.1 Prompt-based formatting instructions

The prompt asks the model to return output in a required format.

Example:

```text
Return only a JSON object with:
- status: a string
- confidence: a number

Do not include explanatory text.
```

This approach is easy to implement and can work well for many tasks. However, the instruction is part of the model's context, not necessarily a hard enforcement mechanism.

The model may still produce malformed output, omit fields, use unexpected types, or include additional text.

Use prompt-based formatting when occasional formatting failures are acceptable or when downstream parsing and validation can handle them safely.

### 5.2 Post-generation parsing and validation

The application generates text and checks it after generation.

A simplified workflow is:

```text
Prompt
  |
  v
Model generation
  |
  v
Generated text
  |
  v
Parse output
  |
  v
Validate structure
  |
  +---- Valid ----> Continue application workflow
  |
  +---- Invalid --> Reject, retry, repair, or report failure
```

This approach makes the acceptance criteria explicit. It also allows the application to distinguish a generation failure from a parsing or validation failure.

However, validation happens after the model has generated the output. Invalid text may already have consumed tokens, time, and compute resources.

Retries or repair attempts may improve reliability, but they add latency and can introduce new errors. They must also be bounded to prevent unending retry loops.

### 5.3 Format modes

Some model APIs provide modes intended to produce a particular format, such as JSON output.

A format mode may enforce some properties of the response, but its guarantees vary by provider and model. A JSON-oriented mode should not automatically be interpreted as full enforcement of an arbitrary application schema.

Engineers must inspect the actual API contract to understand what is guaranteed, what is merely encouraged, and what remains the application's responsibility.

### 5.4 Schema-constrained generation

Schema-constrained generation restricts output according to a declared structure, often including field names, data types, required properties, and permitted values.

A schema can serve as an explicit output contract between the model and the application.

For example, a schema may require:

- `status` to be a string selected from an allowed set.
- `confidence` to be a number within a defined range.
- Both fields to be present.

The exact supported schema features depend on the generation system. Some implementations support only a subset of a schema language or impose additional restrictions.

A schema-constrained response can satisfy the supported structural contract while still containing semantically incorrect values.

### 5.5 Grammar-constrained generation

Grammar-constrained generation uses formal rules to restrict the sequences that can be produced.

A grammar can describe permitted structures beyond a fixed JSON schema, including expressions, domain-specific formats, or structured command representations.

The generation system uses the grammar to determine which continuations remain permissible as the output develops.

Grammar constraints are useful when the required output language has rules that are more naturally expressed through a grammar than through a schema. They require a supported grammar representation and an enforcement mechanism compatible with the generation system.

## 6. How Constrained Decoding Works Conceptually

Ordinary decoding selects the next token from the model's available token candidates using the configured selection strategy.

Constrained decoding adds another condition: a candidate continuation must also satisfy the active structural constraints.

At a high level, the process is:

1. The model produces scores for possible next tokens.
2. The constraint mechanism examines the current generation state.
3. It determines which candidate continuations are permitted by the constraints.
4. Candidates that violate the constraints are excluded or otherwise disallowed.
5. The decoding strategy selects among the remaining eligible candidates.
6. The generation state is updated, and the process repeats.

Conceptually:

```text
Model scores
     |
     v
Constraint evaluation
     |
     v
Eligible token candidates
     |
     v
Decoding strategy
     |
     v
Selected token
     |
     v
Updated generation state
```

This diagram describes the logical responsibilities, not a mandatory implementation order inside every framework. Implementations may combine, reorder, or optimize operations while preserving the required behavior.

### 6.1 Token boundaries matter

A constraint is defined over the output sequence, but a language model generates token IDs rather than individual characters.

A single token may represent several characters, part of a string, a delimiter, or a combination of text and syntax. Consequently, constraint enforcement cannot reliably decide whether a token is allowed by examining it as an isolated character or symbol.

Instead, the constraint mechanism must consider the effect of appending a candidate token to the current generated sequence. The resulting continuation must remain compatible with the active constraint state.

For example, a token containing multiple characters may be valid only when the parser is in a particular state. Another token may represent only the beginning of a string or escape sequence, leaving the structure incomplete but still valid as an intermediate prefix.

A correct constraint mechanism therefore reasons about valid continuations across token boundaries, not merely whether each token appears individually in the target format.

The precise implementation varies across systems. The important engineering requirement is that the token-level enforcement mechanism correctly represents the constraints imposed on the resulting output sequence.

### 6.2 Constraints and model preferences are different

The model assigns scores based on its learned distribution and the current context. The constraint mechanism determines which continuations are permitted.

These are separate sources of influence.

A continuation can be highly probable according to the model but prohibited by the active constraint. Conversely, a permitted continuation may have a relatively low model score.

The decoder chooses among eligible candidates according to the configured selection strategy. If the constraints leave no eligible continuation, generation may fail or terminate according to the system's behavior.

### 6.3 Constraints do not replace decoding

Constraint enforcement does not eliminate the need for a decoding strategy. The model can still have multiple eligible continuations, and the decoder must choose among them.

Temperature, sampling, greedy selection, and other decoding controls may continue to influence the output, depending on the API and implementation.

For this reason, structured generation should be understood as constrained token selection rather than as a separate process that bypasses the model's generation loop.

## 7. Post-Generation Repair Versus Constrained Generation

Two common strategies address malformed structured output at different stages.

| Dimension | Post-generation repair | Constrained generation |
|---|---|---|
| When it acts | After output has been generated | During token generation |
| Main mechanism | Parse, validate, then repair or retry | Restrict eligible continuations |
| Invalid intermediate output | Can be generated | Disallowed continuations are excluded within the supported constraint model |
| Runtime complexity | Depends on validation, repair, and retries | Depends on constraint processing and supported format |
| Main limitation | Repair can alter meaning or fail | Supported constraints may be limited; valid structure does not ensure correct meaning |

Post-generation repair can be useful when the format is simple, the generation system lacks constraint support, or an existing workflow already relies on validation and retry logic.

Constrained generation can reduce structural failures when the required format is supported and enforcement is correctly implemented.

Neither approach removes the need for application-level error handling. A production system should define behavior for unsupported constraints, generation failures, invalid outputs, timeouts, and downstream validation failures.

## 8. A Practical Example: Generating a Structured Classification

Suppose an application classifies an incoming request into one of three categories:

- `billing`
- `technical_support`
- `account_access`

The application expects an object containing a category and a short explanation.

A possible conceptual output is:

```json
{
  "category": "billing",
  "explanation": "The request concerns an invoice."
}
```

The engineering problem contains several independent requirements:

1. The output must be parseable as JSON.
2. The object must contain the required fields.
3. The category must be one of the allowed values.
4. The explanation must be appropriate for the incoming request.
5. The application must handle failures without assuming that every generation succeeds.

A structural constraint can enforce supported requirements such as field presence, value types, and allowed category values. The application still needs to determine whether the selected category and explanation are appropriate.

A production workflow might therefore:

1. Generate under the strongest suitable supported constraints.
2. Parse the returned representation if required by the API contract.
3. Validate application-specific conditions.
4. Reject or safely handle unacceptable results.
5. Record the outcome and relevant failure category for operational analysis.

The exact sequence depends on which guarantees the model API provides. Do not duplicate checks blindly, but do not assume that an API's structural guarantees cover application-specific requirements.

## 9. Grammar Constraints: A Simplified Illustrative Grammar

The following is a **simplified illustrative grammar**, intended to demonstrate the idea of grammar-constrained generation. It is not an executable grammar specification for every constraint engine.

```text
expression := integer operator integer
operator   := "+" | "-" | "*"
integer    := digit+
digit      := "0" | "1" | ... | "9"
```

This grammar describes a limited expression containing two integers and one permitted operator.

Examples of strings that fit the intended pattern include:

```text
12+7
8-3
4*25
```

The grammar excludes expressions with unsupported operators or additional terms, according to the rules shown.

This example intentionally omits details such as whitespace handling, precedence, parentheses, negative numbers, and division. Different grammar engines may also use different syntax, rule conventions, and supported features.

The important concept is that a grammar defines which sequences belong to an allowed language. A compatible constraint engine uses that definition to restrict generation to valid continuations of the grammar.

Grammar conformance alone does not establish that an expression is safe to evaluate, that its result is correct for a business task, or that an application should execute it.

## 10. Limitations and Failure Modes

Structured generation improves control over output form, but several failure modes remain relevant.

### 10.1 Unsupported constraints

A provider or library may support only a subset of the requested schema or grammar. Unsupported features may be rejected, ignored, or handled differently depending on the system.

Engineers should verify supported features rather than assume that a declared constraint is fully enforced.

### 10.2 No valid continuation

A constraint set can become incompatible with the current generation state, leaving no eligible next token. Depending on the implementation, this may produce an error, an incomplete response, or another documented failure behavior.

Applications must decide how to surface and recover from such failures.

### 10.3 Structural validity without semantic validity

A response may satisfy every enforced structural rule while expressing an incorrect answer. For example, a constrained classifier can return an allowed category that does not match the input.

The appropriate remedy is task-specific validation, stronger application logic, or another suitable quality-control mechanism—not simply a stricter syntax constraint.

### 10.4 Truncation and incomplete output

Generation may stop because of a token limit, timeout, cancellation, or another stopping condition. Even if the generation mechanism enforces constraints during token selection, applications should understand the API's behavior for incomplete results and determine whether the final output is usable.

### 10.5 Runtime and compatibility differences

Constraint support may differ across models, APIs, serving implementations, and versions. A configuration that works in one environment may not work identically in another.

Treat the declared output contract and its enforcement behavior as part of the system's tested interface.

## 11. Production Engineering Considerations

Structured generation should be integrated into the application's reliability design rather than treated as a prompt-writing trick.

### 11.1 Define the contract explicitly

Specify the required output shape, allowed values, and any relevant application-level conditions. Make it clear which guarantees come from the model API and which are enforced by application code.

### 11.2 Choose the narrowest suitable constraint

Use a constraint mechanism that matches the required format. A simple format mode may be sufficient for basic JSON output, while a more complex schema or grammar may require stronger constraint support.

Avoid adding unnecessary complexity when a simpler, testable approach meets the requirement.

### 11.3 Handle errors deliberately

Define behavior for:

- Unsupported schema or grammar features.
- Constraint initialization failures.
- Generation errors and timeouts.
- Incomplete output.
- Parsing or validation failures.
- Retry exhaustion.

Retries should be bounded, and failure handling should preserve a clear distinction between a rejected result and a successful application outcome.

### 11.4 Test the output contract

Tests should cover ordinary cases, boundary cases, invalid inputs, unsupported configurations, and failure paths. Where relevant, test that the application handles incomplete results and unexpected provider behavior.

Tests should validate the guarantees the application depends on, not just confirm that a few example responses look correct.

### 11.5 Observe operational behavior

Useful operational signals may include:

- Constraint or schema configuration errors.
- Generation failure rate.
- Parsing and validation failure rate.
- Retry frequency.
- Latency introduced by constraint enforcement and recovery.
- Frequency of incomplete or rejected outputs.

These measurements help determine whether the chosen mechanism provides sufficient reliability at an acceptable operational cost.

## 12. Common Misconceptions

### Misconception 1: Asking for JSON guarantees valid JSON

A prompt instruction expresses the desired behavior. It does not necessarily enforce it. Use an API guarantee, a supported constraint mechanism, or validation when correctness matters.

### Misconception 2: Valid JSON means valid application data

JSON syntax only establishes that the text follows JSON syntax. Additional structural and application checks may still be required.

### Misconception 3: Schema constraints make the model's answer correct

Schema constraints govern supported structural properties. They do not guarantee that the chosen values are factually or contextually correct.

### Misconception 4: Constrained generation replaces decoding

Constraint enforcement restricts the eligible continuations. The generation system still needs to select among them.

### Misconception 5: Every token can be validated independently

Constraints apply to the evolving output sequence. Token boundaries may not align with character, string, or syntax boundaries, so enforcement must account for the resulting continuation.

### Misconception 6: A declared schema is enforced identically by every provider

Constraint support and guarantees vary. Engineers must verify the specific model and API contract.

## 13. When to Use Structured Generation

Structured generation is especially useful when a model's output is consumed by software rather than read only by a human.

Typical examples include:

- Extracting fields from documents.
- Returning machine-readable classifications.
- Producing objects for API workflows.
- Generating constrained command representations.
- Returning structured results from an information-processing pipeline.

It may be unnecessary when the output is intended to be free-form prose and no downstream system depends on a strict structure.

The engineering decision should be driven by the required reliability contract, available API support, complexity, and failure-handling needs.

## 14. Interview and Design Discussion

A strong engineering explanation should distinguish the desired output format from the mechanism that enforces it.

Be prepared to discuss:

1. Why prompt-based format instructions may fail.
2. The difference between parsing, validation, and constraint enforcement.
3. How constrained decoding restricts token selection.
4. Why token boundaries matter to constraint enforcement.
5. The difference between schema-constrained and grammar-constrained generation.
6. Why structurally valid output may still be wrong.
7. How to handle unsupported constraints and incomplete generation.
8. How to test and monitor structured-output reliability in production.

For a design scenario, explain the output contract, identify the guarantees required, compare available approaches, and describe how failures will be handled. Avoid claiming stronger guarantees than the chosen API actually provides.

## 15. Revision Checklist

You should be able to explain the following without relying on the chapter:

- [ ] Why unconstrained generation can produce unusable structured output.
- [ ] How generation, constraint enforcement, parsing, and validation differ.
- [ ] The difference between syntax, structure, semantics, and application correctness.
- [ ] How constrained decoding restricts eligible continuations.
- [ ] Why constraints must account for token boundaries.
- [ ] The trade-offs between post-generation repair and constrained generation.
- [ ] What schemas and grammars contribute to output control.
- [ ] Why structural guarantees do not establish semantic correctness.
- [ ] How production systems should test, observe, and recover from failures.

## 16. Key Takeaways

- Structured generation makes model output conform to a defined format or structural contract.
- Prompt instructions, post-generation validation, format modes, schema constraints, and grammar constraints provide different levels and kinds of control.
- Constrained decoding restricts eligible token continuations while preserving the role of the decoding strategy.
- Constraint enforcement must reason about the resulting output sequence across token boundaries.
- Syntax and structural correctness are distinct from semantic and application correctness.
- Production systems must verify actual API guarantees and handle incomplete results, unsupported constraints, and validation failures explicitly.

The central engineering principle is simple: **treat generated output as an interface contract that must be specified, enforced where possible, validated where necessary, and tested under failure conditions.**
