# Tokenization Across Languages and Technical Text

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why tokenization behavior varies across languages, scripts, and writing systems.
- Understand how Unicode, normalization, whitespace, punctuation, and mixed-language text affect tokenization.
- Analyze tokenization challenges involving multilingual text, transliteration, names, numbers, URLs, and source code.
- Distinguish representability from tokenization efficiency and semantic quality.
- Design representative test cases for evaluating a tokenizer on real application data.
- Identify production risks caused by language imbalance, unexpected text transformations, and tokenizer assumptions.

## Prerequisites

- [Chapter 01 — Language as Model Input and Discrete Representation](01-Language-as-Model-Input-and-Discrete-Representation.md)
- [Chapter 02 — Tokenization Approaches and Design Trade-offs](02-Tokenization-Approaches-and-Design-Trade-offs.md)
- [Chapter 03 — Tokenizer Pipeline, Vocabulary, and Special Tokens](03-Tokenizer-Pipeline-Vocabulary-and-Special-Tokens.md)
- [Chapter 04 — Subword Tokenization Algorithms](04-Subword-Tokenization-Algorithms.md)

## Estimated Reading Time

11–14 minutes

---

## 1. Why Tokenization Across Languages Is Difficult

A tokenizer does not process every language in the same way. Its behavior depends on the writing system, training data, vocabulary, preprocessing rules, and segmentation algorithm.

Consider three examples:

- English text commonly uses spaces to separate words.
- Chinese text does not generally use spaces between every word.
- Hindi uses Devanagari, with character combinations and vowel signs that complicate simplistic character-by-character assumptions.

A tokenizer designed primarily around the patterns of one language may not segment another language as efficiently. A model may still be able to represent that other language, but representation can require more token pieces or produce less favorable results.

Technical text introduces another set of challenges. A source-code identifier, URL, email address, version number, or database query may contain punctuation and character sequences that do not follow ordinary natural-language word patterns.

The central engineering principle is:

**Tokenizer quality must be evaluated against the actual languages and text types an application processes.**

A tokenizer that performs well on ordinary English prose is not automatically suitable for multilingual chat, source code, document retrieval, or structured identifiers.

## 2. Language, Script, and Tokenization

### 2.1 Language Is Not the Same as Script

A language is a system of communication. A script is a writing system used to represent written language.

For example:

- Hindi is commonly written in Devanagari.
- English is commonly written in the Latin script.
- Bengali is commonly written in the Bengali script.
- Urdu is commonly written in a Perso-Arabic script.

A script can be shared by multiple languages, and a language can be represented using more than one script in some contexts.

This distinction matters because tokenization operates on encoded text, not directly on abstract language identity.

A tokenizer does not necessarily know which language a sentence belongs to before segmentation. Its behavior may instead emerge from character patterns, preprocessing rules, vocabulary entries, and the distribution of its training data.

### 2.2 Why Writing Systems Affect Tokenization

Writing systems differ in their use of:

- Spaces and other word separators.
- Punctuation conventions.
- Combining marks.
- Character composition.
- Directionality.
- Diacritics.
- Logographic, syllabic, alphabetic, or other writing-system structures.

These differences affect how a tokenizer can divide text into reusable pieces.

A simplistic rule such as “split on spaces and then tokenize each word” is insufficient for many languages and text types.

Likewise, a tokenizer's internal units should not be assumed to correspond to human-perceived characters or linguistic words.

### 2.3 Training Data Influences Vocabulary Coverage

Tokenizers are built using particular training corpora and design choices. If a language or script is underrepresented in the training data, its recurring text patterns may be less well represented in the resulting vocabulary.

Potential consequences include:

- Longer token sequences.
- Less reusable segmentation patterns.
- More frequent fallback behavior in tokenizers that use an unknown-token mechanism.
- Less predictable token counts for names or domain-specific vocabulary.

These outcomes are not guaranteed for every underrepresented language. They are risks that should be measured against representative data.

**Engineering implication:** Never infer multilingual suitability solely from a model's advertised language support. Inspect tokenization behavior and evaluate downstream task quality separately.

---

## 3. Unicode and Text Representation

### 3.1 Unicode Represents Text, Not a Universal One-Character-One-Unit Model

Unicode assigns code points to characters and related elements used across writing systems. The visible representation of a character or symbol may involve more than one code point.

For example, an accented character can sometimes be represented either as a single precomposed code point or as a base character followed by a combining mark.

These representations may look equivalent to a person while differing at the code-point level.

A tokenizer's normalization behavior determines whether some such representations are transformed before segmentation.

### 3.2 Code Points, Grapheme Clusters, and Bytes

Three distinct concepts are relevant:

| Representation | Meaning | Why it matters |
|---|---|---|
| Unicode code point | A numbered value in the Unicode code space | One visible symbol may involve multiple code points |
| Grapheme cluster | A sequence of code points treated as one user-perceived character in a given text context | Character-level reasoning cannot always rely on individual code points |
| Encoded bytes | The byte sequence used to represent text in an encoding such as UTF-8 | Byte-oriented tokenizers operate on a different initial representation |

A tokenizer that uses bytes as its initial units does not necessarily split text into user-perceived characters. Likewise, a tokenizer using Unicode-aware processing does not automatically guarantee that each visible character maps to one token.

These distinctions are particularly important for emoji, combining marks, Indic scripts, and other text containing multi-code-point sequences.

### 3.3 Normalization Is a Design Decision

Normalization can make some equivalent text representations more consistent. However, normalization can also change distinctions that matter to an application.

Examples of possible risks include:

- Changing the representation of names.
- Altering case-sensitive identifiers.
- Modifying punctuation or whitespace.
- Affecting text used for exact comparison.
- Changing the representation of multilingual input.

Normalization behavior varies by tokenizer. It should not be assumed that every tokenizer applies the same Unicode normalization form or performs normalization at all.

For exact text preservation, compare the original input with the decoded representation and define which transformations are acceptable.

### 3.4 Practical Unicode Tests

A useful test suite should include:

- Precomposed and decomposed accented characters.
- Combining marks.
- Emoji and emoji sequences.
- Non-Latin scripts.
- Mixed-script text.
- Non-breaking spaces and unusual whitespace.
- Visually similar but distinct characters.

For each test case, inspect the encoded token pieces and IDs, then test decoding according to the application's preservation requirements.

Do not assume that visually similar text has identical code points, identical tokenization, or identical meaning.

---

## 4. Multilingual Tokenization

### 4.1 Vocabulary Allocation Is a Resource Decision

A tokenizer usually operates with a finite vocabulary or a finite set of tokenization rules. The design must allocate representational capacity across the text patterns it is expected to encounter.

A vocabulary trained primarily on one language may contain many efficient pieces for that language but fewer reusable pieces for another.

For example, an English-heavy tokenizer may represent a frequently occurring English word as one token while dividing a word from a less represented language into several pieces.

This is a possible outcome, not a universal rule. Actual results depend on the specific tokenizer and input.

### 4.2 Token Count Is a Useful Signal, Not a Quality Verdict

Token count can reveal differences in segmentation efficiency. It cannot, by itself, establish that a model understands one language better than another.

Suppose two tokenizers represent the same sentence using different numbers of tokens. The difference may affect:

- Context-window consumption.
- Input processing cost.
- Generation length accounting.
- Truncation risk.
- Latency, depending on the serving implementation.

But downstream quality also depends on model training, architecture, data, and task-specific capabilities.

Therefore, multilingual evaluation should separate at least two questions:

1. **Representation efficiency:** How does the tokenizer segment this language?
2. **Task performance:** How well does the model perform on tasks involving this language?

These are related but distinct measurements.

### 4.3 Mixed-Language and Code-Switched Text

Real users often combine languages within one message. This is commonly called code-switching or mixed-language text.

Examples include:

- English mixed with Hindi.
- A regional-language sentence containing English technical terms.
- A message written in a native script with English product names.
- Romanized Hindi mixed with English words.

Such input may combine several tokenization patterns in one sequence.

For example:

`Mujhe RAG architecture samjhao`

This mixes Romanized Hindi with an English technical term. Its segmentation depends on the exact tokenizer and vocabulary. It should not be assumed to follow the same pattern as either standard English prose or Hindi written in Devanagari.

Production evaluation should include the actual language combinations used by the application's audience.

### 4.4 Transliteration Is Not Translation

Transliteration represents text from one writing system using another. Translation changes the language or meaning into another linguistic form.

For example, Hindi written in Devanagari and Hindi written in the Latin script may communicate the same sentence but use different character sequences.

A tokenizer processes the supplied representation. It does not automatically treat transliterated and native-script text as equivalent.

The two forms may therefore produce different token sequences and counts.

If an application supports transliterated text, evaluate it explicitly instead of assuming that performance on the native script predicts performance on transliteration.

### 4.5 Multilingual Evaluation Strategy

For a multilingual application, create a test corpus covering:

- Each supported language.
- Each relevant script.
- Common language combinations.
- Native-script and transliterated input where applicable.
- Names and region-specific vocabulary.
- Domain-specific terminology.
- Realistic message lengths and formatting.

Track tokenization statistics by language and input category rather than relying only on an aggregate average.

An overall average can hide poor behavior for a smaller language group.

---

## 5. Whitespace and Punctuation

### 5.1 Whitespace Can Be Part of Tokenization Behavior

Whitespace is not always merely a separator discarded before tokenization. Some tokenizers encode distinctions involving spaces or word boundaries in their token pieces.

Consequently, the same visible word may tokenize differently depending on whether it appears at the beginning of a string or after a space.

The exact behavior is tokenizer-specific.

Do not assume that tokenizing a word independently always produces the same token sequence as tokenizing that word inside a sentence.

### 5.2 Whitespace Variants

Real input may contain:

- Leading or trailing spaces.
- Multiple consecutive spaces.
- Tabs.
- Newlines.
- Non-breaking spaces.
- Platform-dependent line endings.

Application preprocessing may trim or standardize some of these. The tokenizer may also have its own handling rules.

If exact formatting matters—for example, in source code, structured documents, or text comparisons—test the full processing path rather than inspecting the tokenizer in isolation.

### 5.3 Punctuation and Boundaries

Punctuation can be attached to words, separated into its own token, or represented through other token-piece patterns.

Examples include:

- `hello,`
- `hello!`
- `(value)`
- `key=value`
- `name@example.com`

A tokenizer may segment these differently depending on the surrounding characters and configured rules.

Punctuation behavior is especially relevant for technical text, where a single character can change meaning. In source code, for instance, `==` and `=` have different semantics even though their character sequences are similar.

### 5.4 Engineering Rule

Test whitespace and punctuation using the same calling pattern as the production application.

A unit test that tokenizes isolated words may miss boundary behavior that appears only when words occur in full sentences, structured messages, or code snippets.

---

## 6. Numbers, Identifiers, URLs, and Structured Text

### 6.1 Numbers

Numbers can appear in many forms:

- `2026`
- `3.14159`
- `1,000,000`
- `+91`
- `10^6`
- `v2.5.1`

A tokenizer may represent these as single pieces or split them into multiple pieces. The result depends on its vocabulary, segmentation rules, and preprocessing.

Do not assume that a long number is one token or that numerically similar values share a consistent tokenization pattern.

For applications that depend on exact numeric interpretation, the tokenizer should not be treated as a numeric parser.

### 6.2 Identifiers and Product Names

Identifiers can contain combinations of letters, digits, underscores, hyphens, periods, and other symbols.

Examples include:

- `user_id`
- `CustomerProfileV2`
- `gemini-embedding-001`
- `HTTPResponseError`
- `AWS_REGION`

These strings may not follow ordinary natural-language patterns. Their tokenization depends on the pieces available in the vocabulary and the rules used to split the input.

For software documentation, logs, and developer-facing assistants, identifiers should be part of the evaluation corpus.

### 6.3 URLs and Email Addresses

URLs and email addresses combine punctuation and text in structured ways.

For example:

`https://example.com/docs?id=42`

A tokenizer may divide the scheme, domain, path, query parameters, and punctuation into several pieces. The precise segmentation is model-specific.

This matters for retrieval, code assistance, and support systems that need to preserve references accurately.

The tokenizer does not validate whether a URL is well-formed or whether an email address is valid. Those are separate application responsibilities.

### 6.4 Structured Text Is Not Necessarily Natural Language

A string may be meaningful to an application even when it is not a normal word or sentence.

Examples include:

- Database column names.
- API paths.
- JSON keys.
- Error codes.
- Version strings.
- Configuration values.
- Cryptographic hashes.

Tokenization may split these strings into multiple pieces, but tokenization alone does not establish their application-level semantics.

**Engineering implication:** Preserve the original structured value separately whenever exact identity, comparison, or execution depends on it. Do not rely on tokenized text as a substitute for a canonical identifier.

---

## 7. Source Code and Programming Languages

### 7.1 Why Code Has Different Tokenization Requirements

Programming languages use formal syntax. Small differences in punctuation, whitespace, capitalization, or identifiers can change how a program is interpreted.

Consider:

```python
if user_id == 10:
    process_user(user_id)
```

A tokenizer processes this as text according to its rules. It does not necessarily align its pieces with the programming language's lexical tokens.

For example, a programming-language lexer might identify `user_id` as one identifier. A model tokenizer could represent that identifier using several token pieces.

These are different layers:

- **Programming-language lexing:** Identifies language-specific lexical units.
- **Model tokenization:** Converts text into the representation expected by a language model.

A code tokenizer used by a language model is not automatically a compiler lexer.

### 7.2 Common Code Challenges

Code introduces patterns such as:

- Indentation and line breaks.
- Braces, brackets, and parentheses.
- Operators such as `==`, `!=`, `=>`, and `**`.
- Long identifiers.
- Nested expressions.
- String literals.
- Comments.
- Paths and package names.
- Repeated punctuation.
- Embedded SQL, HTML, or shell commands.

A tokenizer may handle these patterns efficiently or inefficiently depending on its training data and vocabulary.

### 7.3 Whitespace Can Be Semantically Significant

In some languages, indentation is part of the syntax. In others, whitespace can still affect string literals, formatting, or readability.

If preprocessing removes or changes whitespace, the resulting code may not preserve its original semantics or presentation.

For code-oriented applications, test tokenization through the actual end-to-end pipeline, including any prompt formatting, code extraction, or preprocessing.

### 7.4 Tokenization Efficiency Is Not Code Understanding

A tokenizer that represents an identifier in fewer pieces does not necessarily enable the model to understand the identifier better.

Code capability depends on model training, architecture, data, and the task.

Tokenization efficiency is relevant because it influences sequence length and may affect context use and serving cost. It is not a direct measure of program comprehension.

### 7.5 Code-Specific Evaluation

A useful code test suite should include:

- Short functions.
- Long identifiers.
- Nested expressions.
- Comments and docstrings.
- String literals containing punctuation.
- Indentation-sensitive examples.
- JSON, SQL, and shell fragments.
- Error messages and stack traces.
- Mixed prose and code.

Where exact preservation matters, verify decoded output against the source text using the application's required comparison rules.

---

## 8. Production Evaluation Framework

A tokenizer should be evaluated using representative inputs and explicit requirements rather than anecdotal examples.

### 8.1 Define the Workload

Before comparing tokenizers, establish:

- Which languages are supported.
- Which scripts and transliteration patterns are common.
- Whether users submit source code or structured identifiers.
- Whether whitespace and punctuation must be preserved exactly.
- Typical and maximum input sizes.
- Whether the system depends on accurate token counting or strict context limits.
- Whether the tokenizer is fixed by a pretrained model.

The final constraint is particularly important. If the application uses an existing pretrained model, compatibility generally takes priority over choosing a tokenizer independently.

### 8.2 Build a Stratified Test Corpus

A stratified corpus contains representative examples from each important input category.

For example:

| Category | Example cases | Evaluation focus |
|---|---|---|
| English prose | Common sentences, rare words | Typical segmentation |
| Indian languages | Hindi, Bengali, Tamil, Telugu, Marathi | Script and vocabulary coverage |
| Mixed-language text | English with Romanized Hindi | Code-switching behavior |
| Unicode | Combining marks, emoji, accented text | Representation and reconstruction |
| Whitespace | Tabs, newlines, repeated spaces | Boundary handling |
| Numbers | Decimals, large integers, version numbers | Structured numeric text |
| URLs and identifiers | Paths, email addresses, API names | Technical-string segmentation |
| Source code | Functions, operators, comments | Code-text behavior |
| Domain terminology | Product names, specialized vocabulary | Workload-specific efficiency |

These categories should be adapted to the application's real data. The listed languages are examples, not a requirement that every application support all of them.

### 8.3 Measure Separate Dimensions

A practical evaluation can track the following metrics:

**Tokenization efficiency**
- Tokens per input.
- Tokens per character or byte, where useful.
- Median and high-percentile token counts.
- Variation by language and input type.

**Correctness and preservation**
- Encoding and decoding behavior.
- Preservation of required punctuation and whitespace.
- Handling of Unicode edge cases.
- Expected special-token behavior.

**Operational behavior**
- Encoding latency.
- Throughput under realistic batch sizes.
- Memory usage where relevant.
- Compatibility with the model and tokenizer versions deployed together.

**Downstream quality**
- Task performance across supported languages and text types.
- Retrieval or code-assistance quality, where applicable.
- Error rates on the real workload.

The metrics above are a suggested evaluation framework. Select those that directly relate to the application's requirements.

### 8.4 Avoid Aggregate Metrics That Hide Failure

Suppose an application receives mostly English input but must also support several other languages. A global average token count may look acceptable even if some language groups require substantially more tokens.

Segment results by language and input category. Investigate outliers instead of assuming the overall average describes every user.

Likewise, token-count efficiency should not be used as a substitute for downstream quality evaluation.

### 8.5 Test the Complete Input Path

The actual application may transform text before tokenization.

A useful test path is:

```text
Raw user input
      |
      v
Application preprocessing
      |
      v
Message or prompt formatting
      |
      v
Tokenizer
      |
      v
Token IDs and metadata
      |
      v
Model interface
```

Inspect each boundary when investigating unexpected behavior.

For example, if a code snippet loses indentation, the defect may be in application preprocessing rather than the tokenizer. If token counts change after an upgrade, the cause may be a tokenizer artifact, library version, configuration, or a change to the input text.

The goal is to isolate the source of the difference before making a design decision.

---

## 9. Common Engineering Mistakes

### Mistake 1: Assuming one tokenizer performs equally well across languages

A tokenizer's vocabulary and training distribution can favor some text patterns over others.

**Correction:** Evaluate each important language and script using representative data.

### Mistake 2: Treating visible characters as single tokenization units

A visible character can involve multiple Unicode code points, and byte-oriented tokenizers use a different initial representation.

**Correction:** Keep code points, grapheme clusters, bytes, token pieces, and token IDs conceptually separate.

### Mistake 3: Assuming native-script and transliterated text behave identically

They can use different character sequences and have different vocabulary coverage.

**Correction:** Test both forms when both occur in the application.

### Mistake 4: Assuming spaces are always discarded before tokenization

Whitespace may influence token boundaries or be represented through tokenizer-specific conventions.

**Correction:** Test leading spaces, internal whitespace, line breaks, and full-sentence contexts.

### Mistake 5: Treating token count as a direct measure of language understanding

Token count primarily reflects representation efficiency for a particular tokenizer.

**Correction:** Evaluate tokenization and downstream model performance separately.

### Mistake 6: Assuming a model tokenizer is equivalent to a programming-language lexer

Model tokenization is designed to create model input units, not necessarily formal programming-language tokens.

**Correction:** Use a real lexer or parser when application logic requires programming-language structure.

### Mistake 7: Normalizing text without understanding its consequences

Normalization can alter names, identifiers, whitespace, or other distinctions.

**Correction:** Define preservation requirements and test the exact preprocessing and decoding behavior.

### Mistake 8: Evaluating only short, clean examples

Real-world inputs contain mixed scripts, rare vocabulary, malformed formatting, identifiers, and long-tail cases.

**Correction:** Build a stratified corpus and track high-percentile behavior as well as averages.

### Mistake 9: Replacing a pretrained model's tokenizer based only on token counts

A different tokenizer can produce IDs incompatible with the model's learned representations.

**Correction:** Treat the model and tokenizer as a compatible pair unless a deliberate adaptation strategy justifies changing that interface.

---

## 10. Interview Questions and Engineering Reasoning

### Q1. Why can the same sentence produce different token counts in two languages?

The tokenizers may have different vocabulary coverage and segmentation patterns for the two languages. Token counts also depend on the writing system, preprocessing, and the specific tokenizer implementation.

### Q2. What is the difference between a Unicode code point and a grapheme cluster?

A code point is a numbered value in Unicode. A grapheme cluster is a sequence of code points treated as one user-perceived character in a text context. One visible character may contain multiple code points.

### Q3. Why can transliterated text behave differently from native-script text?

Transliteration changes the writing-system representation. The resulting character sequences may interact differently with the tokenizer's vocabulary and segmentation rules, even when the intended language or meaning is similar.

### Q4. Why should tokenization efficiency be measured separately from model quality?

Tokenization efficiency measures properties such as sequence length. Model quality measures downstream task performance. A compact representation does not guarantee that the model performs well on that language or task.

### Q5. Why is a model tokenizer not a programming-language lexer?

A model tokenizer converts text into the token units expected by a model. A programming-language lexer identifies lexical units according to a language grammar. Their boundaries and purposes are different.

### Q6. How would you evaluate a tokenizer for a multilingual customer-support assistant?

I would first identify the supported languages, scripts, mixed-language patterns, and real message distribution. I would build a stratified test corpus, measure token counts and tail behavior by language, check Unicode and reconstruction behavior, and evaluate downstream support quality separately.

### Q7. A user reports that a name is represented by many tokens. How would you investigate?

I would reproduce the exact input with the deployed tokenizer, check preprocessing and normalization, inspect the pieces and IDs, compare variants only where relevant, and determine whether the result affects context use or task quality. I would avoid assuming that many tokens necessarily imply incorrect processing.

### Q8. How would you detect a regression after a tokenizer or library upgrade?

I would run a pinned regression corpus through the old and new configurations, compare token pieces, IDs, counts, decoding behavior, special-token handling, latency, and downstream behavior. I would group results by language and input category to identify regressions hidden by aggregate statistics.

---

## 11. Quick Revision

- Tokenization depends on language, script, training data, vocabulary, and implementation.
- Language and script are related but distinct concepts.
- Unicode code points, grapheme clusters, and encoded bytes are different representations.
- Normalization can affect text preservation and tokenization output.
- Mixed-language and transliterated text require explicit evaluation.
- Whitespace and punctuation can influence token boundaries.
- Numbers, URLs, identifiers, and source code are structured text, not necessarily ordinary prose.
- A model tokenizer is not the same as a programming-language lexer.
- Token count measures representation efficiency, not model understanding.
- Production evaluation should use representative, stratified test data.
- Model-tokenizer compatibility remains essential when deploying pretrained models.

## 12. Key Takeaways

1. **Evaluate the workload, not an abstract language label.** Real input patterns determine which tokenizer behaviors matter.
2. **Respect text representation layers.** Unicode code points, grapheme clusters, bytes, token pieces, and token IDs are not interchangeable.
3. **Separate efficiency from quality.** Token counts can reveal inefficiency but cannot establish language understanding.
4. **Treat technical text as a first-class input category.** Code, identifiers, numbers, and URLs need dedicated test cases.
5. **Make tokenizer behavior measurable.** A stratified regression corpus provides stronger evidence than a few hand-picked examples.

## 13. Further Reading

These resources provide foundational or implementation-specific information. Verify behavior against the exact tokenizer and library version used by your application.

- [Unicode Standard](https://www.unicode.org/standard/standard.html)
- [Unicode Text Segmentation — UAX #29](https://www.unicode.org/reports/tr29/)
- [RFC 3629 — UTF-8](https://www.rfc-editor.org/rfc/rfc3629)
- [Hugging Face Tokenizers documentation](https://huggingface.co/docs/tokenizers/)
- [Hugging Face Transformers tokenizer documentation](https://huggingface.co/docs/transformers/main_classes/tokenizer)
- [SentencePiece repository](https://github.com/google/sentencepiece)

---

## Document Completion

**Domain:** LLM — LLM Engineering  
**Topic:** LLM-03 — Tokenization and Language Representation  
**File:** `05-Tokenization-Across-Languages-and-Technical-Text.md`  
**Status:** Generated for review

**Scope:** This lesson covers language-, script-, Unicode-, whitespace-, punctuation-, and technical-text-specific tokenization challenges, along with the evaluation strategy for those inputs. Foundational representation concepts belong to Chapter 01; general tokenization trade-offs belong to Chapter 02; pipeline mechanics belong to Chapter 03; algorithm internals belong to Chapter 04; model-tokenizer compatibility belongs to Chapter 06; efficiency measurement and practical inspection belong to Chapter 07.

**Next step:** Review this chapter and approve it or request targeted changes before generating Chapter 06.
