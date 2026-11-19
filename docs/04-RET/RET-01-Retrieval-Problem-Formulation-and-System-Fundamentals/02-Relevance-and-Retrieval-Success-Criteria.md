# Relevance and Retrieval Success Criteria

## 1. Relevance Depends on the User's Task

Retrieval does not succeed merely because a system returns results. It succeeds when those results provide useful evidence for the information need defined in File 01.

**Relevance** describes how well a retrieved item serves the user's information need in a particular context. It is not necessarily equivalent to keyword overlap, topical similarity, or semantic similarity.

Consider a developer searching for instructions to rotate an expired API credential. A document explaining how credentials work may share terminology with the query but fail to provide the required procedure. An approved rotation runbook may be more relevant despite using different wording.

## 2. Distinguish Similarity from Relevance

Retrieval systems use signals such as lexical matches, semantic representations, metadata constraints, and ranking scores to identify promising candidates. These signals estimate usefulness; they do not prove that a result satisfies the user's need.

- **Similarity:** How closely two items match according to a particular representation or scoring method.
- **Relevance:** How useful an item is for the user's information need.
- **Retrieval success:** Whether the returned results meet the task's defined requirements.

A passage may be semantically similar to a question but describe an outdated procedure. Its similarity score could be high while its practical relevance is low.

## 3. Define Task-Specific Success

Success criteria describe the outcome a retrieval system must achieve. Define them before comparing retrieval approaches.

| Retrieval task | Example success condition |
|---|---|
| Fact lookup | A result contains the required fact and sufficient context. |
| Troubleshooting | A result provides an applicable procedure for the reported failure. |
| Policy lookup | A result identifies the applicable, authoritative policy version. |
| Exploratory research | Results cover useful perspectives without excessive duplication. |

“Return good documents” is too vague to guide engineering decisions. “Return an approved runbook that addresses credential rotation for the relevant environment” is actionable.

Success conditions should reflect the consequences of failure. An obsolete procedure may be unacceptable even when it is topically relevant.

## 4. Understand the Precision–Recall Trade-off

Two useful evaluation concepts are **precision** and **recall**.

- **Precision** concerns how much of the retrieved set is relevant. Low precision forces users to filter unhelpful results.
- **Recall** concerns how much of the relevant material the system retrieves. Low recall means useful evidence is missed.

These goals can compete. Returning more candidates may improve coverage but introduce irrelevant results. Returning fewer candidates may reduce noise while missing useful material.

The appropriate balance depends on the task. A support assistant may prioritize a small set of applicable procedures, while a research workflow may favor broader coverage.

Formal metric definitions, calculations, and experimental design belong to RET-10.

## 5. Apply Consistent Relevance Judgments

After defining success, reviewers need practical dimensions for assessing individual results. Choose dimensions that reflect the task.

- **Task fit:** Does the result address the actual question?
- **Evidence sufficiency:** Does it contain enough information to support the required action or conclusion?
- **Authority:** Is the source approved for this use?
- **Applicability:** Does it match the relevant product, environment, and version?

For a high-impact operational task, a result may describe the correct procedure but fail because it applies to a different product version. For exploratory research, coverage and source authority may matter more than exact environmental applicability.

Explicit criteria help reviewers explain why a result passes or fails instead of relying on an undefined impression of quality.

## Knowledge Check

1. Why can a highly similar result still be irrelevant?
2. How do precision and recall describe different retrieval failures?
3. Why should success criteria be defined before comparing retrieval approaches?

## Practical Exercise

Using the credential-rotation scenario from File 01, define three criteria for judging a retrieved passage, including task fit and applicability. Identify a result that matches the query's terminology but fails your criteria.

**Completion criterion:** Another engineer should be able to apply your criteria to candidate results and explain why each result does or does not satisfy the task.
