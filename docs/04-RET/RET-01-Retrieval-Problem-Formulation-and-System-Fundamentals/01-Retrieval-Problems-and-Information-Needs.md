# Retrieval Problems and Information Needs

## 1. Start with the Information Need

Retrieval engineering begins by defining what information a user needs, not by choosing a search algorithm.

Consider a developer who asks, “How do I rotate an expired API credential?” The underlying **information need** is to find the approved rotation procedure. The **query** is the expression the user submits to locate that information.

These are different things. A query may be incomplete, ambiguous, or use terminology that differs from the source material. A system matching only words might return a guide about creating credentials rather than rotating them.

A retrieval problem specification should therefore identify the user's task independently of the exact query wording.

## 2. Core Retrieval Objects

The following terms describe the basic objects in a retrieval problem.

- **Corpus:** The defined collection of information available to the retrieval system. Its scope determines which sources can supply results.
- **Document:** An identifiable information-bearing source, such as a technical guide, support article, or database record.
- **Retrieval unit:** The item the system searches, scores, or returns. It may be a document, section, passage, or record.
- **Query:** The input used to initiate or guide retrieval.
- **Candidate:** An item surfaced as a potential result. A candidate is not necessarily relevant; a guide about credential creation could be retrieved for a rotation query.
- **Expected evidence:** Information that would help answer the user's question or complete the task.

A document and retrieval unit are not always the same. A technical guide may be the source document, while a troubleshooting passage within it is the item returned.

## 3. Define the Corpus Boundary

A retrieval system can find evidence only within its searchable corpus and permitted scope.

For an internal engineering assistant, the corpus might include approved runbooks, API documentation, and troubleshooting guides while excluding unreviewed drafts.

Before implementation, specify included and excluded sources, relevant version or time boundaries, and what should happen when the corpus contains no suitable evidence.

This prevents a common engineering mistake: treating every unsuccessful search as an algorithm problem when the required information may be absent or outside the permitted corpus.

Corpus preparation, document processing, and lifecycle management belong to RET-02.

## 4. Formulate the Problem Before Choosing a Method

A concise retrieval problem specification should record:

| Field | Question |
|---|---|
| User task | What is the user trying to accomplish? |
| Information need | What must the user find out? |
| Representative queries | How might the user express the need? |
| Corpus scope | Which sources are available and permitted? |
| Retrieval unit | What kind of item should be returned? |
| Expected evidence | What information would address the need? |

For the credential-rotation example, specify the relevant operational documentation and required procedure—not merely results containing *API* and *credential*.

This specification establishes the problem that retrieval design and evaluation must address. Detailed relevance and success criteria belong to Lesson 02; the conceptual pipeline and system boundaries belong to Lesson 03.

## Knowledge Check

1. Why is a query not a complete description of an information need?
2. How do a document, retrieval unit, and candidate differ?
3. What should an engineer consider when the corpus contains no suitable evidence?

## Practical Exercise

Choose a retrieval use case. Write a short specification containing the user task, two representative queries, corpus boundaries, intended retrieval unit, and expected evidence.

**Completion criterion:** Another engineer should understand what information the system must find and where it is permitted to search without needing you to explain unstated assumptions.
