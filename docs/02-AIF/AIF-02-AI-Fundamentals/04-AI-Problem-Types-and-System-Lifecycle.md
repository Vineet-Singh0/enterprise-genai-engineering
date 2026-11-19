# AI Problem Types and System Lifecycle

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Classify common AI problems by the type of outcome they require.
- Distinguish classification, regression, clustering, ranking, recommendation, generation, search, and decision-making problems.
- Explain why the same business problem can be approached using different AI techniques.
- Translate a business requirement into a clearly defined AI problem.
- Understand the high-level lifecycle of an AI system, from problem definition to ongoing assessment.
- Identify the assumptions, constraints, risks, and trade-offs that influence approach selection.
- Explain why selecting an AI model before defining the problem is a weak engineering practice.

The goal is not to memorize a list of AI problem types. The goal is to recognize the underlying problem structure and choose an appropriate approach.

---

## 2. Prerequisites

Before studying this chapter, review:

- [01 — AI Concepts and Evolution](01-AI-Concepts-and-Evolution.md)
- [02 — Symbolic and Statistical AI](02-Symbolic-and-Statistical-AI.md)
- [03 — Search, Reasoning, and Knowledge Representation](03-Search-Reasoning-and-Knowledge-Representation.md)

You should understand that AI systems may use explicit rules, learned statistical patterns, search, reasoning, or combinations of these approaches.

This chapter builds on those ideas to answer two practical questions:

1. What kind of problem are we solving?
2. How should we organize the work required to build and maintain a solution?

Detailed mathematical foundations belong to AIF-01. Machine learning paradigms, model evaluation methodology, and generalization belong to AIF-03. Neural network training and transformer internals belong to AIF-04 and AIF-07, respectively. This chapter focuses on problem structure and lifecycle thinking rather than re-teaching those subjects.

---

## 3. Estimated Reading Time

**35–45 minutes**

---

## 4. Start With the Problem, Not the Model

Imagine a company wants to improve its customer support process.

Someone proposes:

> We should build an AI chatbot using a large language model.

This sounds like a technical direction, but it does not yet define the actual problem.

Consider the questions an engineer should ask:

- Do customers need answers to frequently asked questions?
- Do they need help finding information in company documents?
- Does the system need to classify incoming support tickets?
- Does it need to recommend troubleshooting steps?
- Does it need to take actions in internal systems?
- Is the objective to reduce response time, improve answer quality, reduce cost, or achieve some combination of these?
- What should happen when the system is uncertain?

These are different problems, even though they may all appear under the label *AI-powered customer support*.

A classification model, a search system, a recommendation engine, a retrieval-augmented generation system, and an agentic workflow may all be relevant—but they solve different parts of the problem.

### The engineering principle

**Define the required behavior and measurable outcome before choosing the technique.**

A useful starting sequence is:

1. Identify the business problem.
2. Identify the user and the decision or task they need to complete.
3. Define the expected system behavior.
4. Identify constraints and failure consequences.
5. Determine what evidence will show that the solution works.
6. Select an appropriate technical approach.

This sequence reduces the risk of building an impressive technical system that solves the wrong problem.

---

## 5. Understanding AI Problem Types

AI problem types describe the kind of output, decision, or behavior a system must produce.

They are not mutually exclusive categories. A single product can contain several problem types, and a single business workflow may require multiple techniques.

### 5.1 Classification

**Classification assigns an input to one or more predefined categories.**

Examples:

- Classifying an email as spam or legitimate.
- Categorizing a support ticket as billing, technical support, or account access.
- Detecting whether a transaction is potentially fraudulent.
- Identifying whether a document belongs to a particular category.

Example:

```text
Input:
"My payment was deducted, but my order was not confirmed."

Possible output:
Category = Payment Issue
```

The categories are defined before the system processes the input.

Classification is appropriate when the system must select from a known set of labels.

Important engineering questions include:

- Are the categories well defined?
- Can an input belong to multiple categories?
- What should happen when the input does not fit any category?
- What are the consequences of assigning the wrong category?

Classification does not automatically imply that the system understands the input in a human sense. It produces a category according to the behavior of the chosen approach.

### 5.2 Regression

**Regression estimates a numerical value.**

Examples:

- Estimating delivery time.
- Predicting energy consumption.
- Estimating the expected price of a property.
- Forecasting the number of support tickets expected tomorrow.

Example:

```text
Input:
Historical delivery records and current shipment details

Output:
Estimated delivery time = 3.4 days
```

The output is a numerical estimate rather than a category.

The distinction is based on the required output. A system estimating whether delivery will be late is solving a different output problem from one estimating the expected delivery time.

### 5.3 Clustering

**Clustering groups inputs according to similarities or patterns without requiring a predefined label for every input.**

Examples:

- Grouping customers by observed behavior.
- Discovering common themes in support tickets.
- Identifying patterns among product usage sessions.
- Grouping documents with related content.

Imagine a company has thousands of support tickets but no reliable category labels.

A clustering approach may help discover groups such as:

- Login problems.
- Payment failures.
- Delivery delays.
- Account verification issues.

These groups are patterns discovered from the data. They are not necessarily correct business categories until someone interprets and validates them.

Clustering is useful for exploration and discovering structure. It should not be assumed that every discovered group has a stable or meaningful business interpretation.

### 5.4 Ranking

**Ranking orders candidates according to their relevance or desirability for a particular query or context.**

Examples:

- Ordering search results.
- Ranking products for a customer.
- Ordering job candidates against a job description.
- Ranking matrimonial profiles according to a user's preferences.

Suppose a user is searching for a compatible matrimonial profile.

The system retrieves several eligible candidates:

```text
Candidate A: 0.91 relevance score
Candidate B: 0.84 relevance score
Candidate C: 0.72 relevance score
```

The scores may be used to order the candidates from most relevant to least relevant.

However, a score of `0.91` does not automatically mean there is a 91% probability of compatibility. Its meaning depends on how the score was constructed and validated.

Ranking is particularly useful when:

- There are many eligible candidates.
- The system must prioritize the most useful results.
- The relative order matters more than a single category.

A ranking system may use rules, statistical models, semantic similarity, or a combination of signals.

### 5.5 Recommendation

**Recommendation suggests items, actions, or options that may be useful to a particular user or situation.**

Examples:

- Recommending products.
- Suggesting learning resources.
- Recommending a suitable document.
- Suggesting potential matrimonial matches.

Recommendation and ranking are closely related, but they emphasize different outcomes.

- **Ranking** emphasizes ordering a set of candidates.
- **Recommendation** emphasizes selecting or presenting useful candidates or actions.

A recommendation system often ranks candidates internally, but the final recommendation may also depend on business rules, diversity requirements, eligibility constraints, or user preferences.

For example, a product recommendation system might rank similar products but avoid recommending items that are unavailable or already purchased.

### 5.6 Generation

**Generation produces new content rather than merely selecting an existing label or ordering existing candidates.**

Examples:

- Generating a summary of a document.
- Drafting a customer-support response.
- Producing code from a specification.
- Creating a natural-language explanation of search results.
- Generating a response based on retrieved company documentation.

Example:

```text
Input:
A support question and relevant policy documents

Output:
A natural-language response explaining the applicable policy
```

Generated content may be fluent and still be incorrect. Therefore, the required behavior must include more than producing text.

Depending on the use case, the system may need to:

- Use relevant evidence.
- Respect access permissions.
- Follow a response format.
- Avoid unsupported claims.
- Abstain or request clarification when necessary.

Detailed language-model architecture and generation internals belong to later AI and LLM engineering topics.

### 5.7 Search and Retrieval

**Search identifies relevant items from a collection according to a query, objective, or set of constraints.**

Examples:

- Finding documents containing particular terms.
- Retrieving semantically relevant passages.
- Finding products that satisfy specified filters.
- Locating relevant profiles in a matchmaking system.

Search can be based on exact matching, rules, indexes, semantic similarity, or combinations of these techniques.

Search and ranking are related but distinct:

- Search identifies a candidate set.
- Ranking orders candidates according to relevance or another objective.

A simple search system may return matching records without sophisticated ranking. A ranking system may then order the retrieved candidates.

Search and retrieval are especially important in information systems because the usefulness of a downstream component often depends on whether the relevant information was retrieved in the first place.

### 5.8 Planning and Decision-Making

**Planning determines a sequence of actions toward a goal. Decision-making selects an action or option under particular conditions.**

Examples:

- Planning a route between locations.
- Selecting a troubleshooting sequence.
- Choosing the next step in a workflow.
- Determining which action should be taken when a transaction violates a policy.

A planning problem may involve:

- An initial state.
- A goal state.
- Available actions.
- Constraints.
- Costs or preferences.
- Possible changes in the environment.

For example, a delivery system may need to select a route that respects delivery windows, vehicle capacity, and travel costs.

Planning is not the same as generating a written plan. A generated plan may be plausible without being feasible. A planning system must account for the constraints relevant to its environment.

Likewise, decision-making does not always require a sophisticated AI model. A deterministic rule may be more appropriate when the decision is simple, well specified, and safety-critical.

For deeper conceptual treatment of states, actions, goals, and search, refer to [03 — Search, Reasoning, and Knowledge Representation](03-Search-Reasoning-and-Knowledge-Representation.md).

---

## 6. Comparing Problem Types

The following table summarizes the main differences.

| Problem type | Primary objective | Typical output |
|---|---|---|
| Classification | Assign a category | Label or set of labels |
| Regression | Estimate a numerical quantity | Number |
| Clustering | Discover groups or structure | Groups or cluster assignments |
| Ranking | Order candidates | Ordered list |
| Recommendation | Suggest useful items or actions | Selected suggestions |
| Generation | Produce new content | Text, code, image, or other content |
| Search and retrieval | Find relevant existing information | Matching records or passages |
| Planning | Determine a sequence of actions | Action sequence or plan |
| Decision-making | Select an action or option | Decision or selected action |

These categories describe problem structure, not a mandatory choice of algorithm.

For example, classification might be implemented using a statistical model or explicit rules. Search might use keyword matching, semantic representations, or a hybrid approach. Recommendation may combine filtering, ranking, and business constraints.

The correct choice depends on the required behavior and the environment in which the system operates.

---

## 7. One Business Problem Can Contain Multiple AI Problems

Consider a matrimonial platform that wants to help users discover suitable profiles.

The business requirement is:

> Show each user relevant and eligible matrimonial matches.

This is not one isolated technical problem. It can be decomposed into several responsibilities.

### Step 1: Eligibility filtering

Determine which profiles are allowed to appear.

Possible constraints include:

- Gender preferences.
- Age ranges.
- Religion preferences, when explicitly specified by the user and permitted by the product's policies.
- Account status.
- Visibility and privacy settings.

This stage may primarily use deterministic rules and database filtering.

### Step 2: Candidate retrieval

Find profiles that could be relevant.

Possible techniques include:

- Database queries.
- Keyword search.
- Semantic retrieval.
- Geographic filtering.

### Step 3: Candidate ranking

Order eligible candidates according to relevant preferences.

Signals might include:

- Profession compatibility.
- Education preferences.
- Location preferences.
- Other explicitly configured criteria.

The ranking approach must account for the meaning and reliability of its inputs. A similarity score is not automatically a complete measure of compatibility.

### Step 4: Recommendation

Select which profiles to present to the user.

The system may need to consider more than raw rank, such as duplicate results, profile availability, and product-specific presentation rules.

### Step 5: Explanation

Provide a useful explanation for why a profile was recommended.

For example:

> This profile matches your preferred profession and education criteria.

The explanation must be grounded in actual profile data and the system's real decision signals. A language model should not invent a reason merely because it sounds convincing.

### Conceptual architecture

```text
User Preferences
       |
       v
Eligibility Filtering
       |
       v
Candidate Retrieval
       |
       v
Candidate Ranking
       |
       v
Recommendation Selection
       |
       v
Presentation and Explanation
```

Each stage has a distinct responsibility. Some stages may use AI, while others are better implemented through conventional software engineering.

This is an important architecture lesson: **an AI-powered product is usually a system of cooperating components, not a single model call.**

---

## 8. Selecting an Appropriate Approach

After identifying the problem type, the engineer must decide which approach is suitable.

AIF-02 introduced symbolic and statistical AI. Chapter 03 introduced search, reasoning, and knowledge representation. These concepts can now be applied to approach selection.

### 8.1 Rule-based approaches

Rules are often appropriate when:

- Requirements are explicit.
- Decisions must follow stable policies.
- The number of relevant conditions is manageable.
- Outcomes need to be predictable.
- A decision must be explained through specific conditions.

Example:

```text
IF account_status is inactive
THEN exclude the profile from recommendations
```

This rule does not require a model to infer account eligibility.

However, rule-based systems can become difficult to maintain when exceptions and interactions grow substantially.

### 8.2 Statistical or machine-learning approaches

Learning-based approaches may be appropriate when:

- Useful patterns are difficult to express as explicit rules.
- Representative data is available.
- The target behavior can be evaluated.
- The environment contains uncertainty or variation.
- The expected benefit justifies the cost of developing and maintaining the model.

For example, ranking search results based on historical user behavior may require a learned model rather than a fixed list of manually written rules.

A learned approach is not automatically better. Data quality, bias, drift, explainability requirements, and evaluation limitations can make it unsuitable for a particular task.

### 8.3 Search-based approaches

Search is appropriate when the system must identify candidates or find a path through a problem space.

Examples include:

- Retrieving documents relevant to a question.
- Finding a route through a graph.
- Exploring possible action sequences.
- Locating records satisfying particular criteria.

Search is a family of problem-solving techniques, not a synonym for machine learning.

### 8.4 Generative approaches

Generation is appropriate when the required output is new content, such as a summary, explanation, or draft response.

It is less suitable as the sole mechanism for decisions that require exact enforcement of deterministic constraints.

For example, a language model can explain an eligibility decision, but a critical eligibility rule should generally be enforced by a reliable component that checks the actual conditions.

### 8.5 Hybrid approaches

Many production systems combine approaches.

A support system might use:

1. Rules to validate the request and access permissions.
2. Classification to route the request.
3. Retrieval to find relevant documents.
4. A language model to generate an answer.
5. Deterministic checks to validate required output properties.
6. Human review for high-risk cases.

The architecture is chosen according to the problem, not according to the popularity of a particular model or framework.

---

## 9. The High-Level AI System Lifecycle

Identifying a problem type is only one part of engineering an AI system. The work continues through design, implementation, evaluation, deployment, and ongoing assessment.

A useful conceptual lifecycle is:

```text
Business Problem
       |
       v
Problem Definition
       |
       v
Requirements and Constraints
       |
       v
Data and Knowledge Preparation
       |
       v
Approach Selection
       |
       v
System Design and Implementation
       |
       v
Evaluation and Validation
       |
       v
Deployment Readiness
       |
       v
Deployment
       |
       v
Ongoing Assessment
       |
       +------> Feedback and Improvement
```

This is a conceptual model, not a rigid waterfall process. Real engineering work often revisits earlier stages when new evidence reveals incorrect assumptions or unmet requirements.

### 9.1 Problem definition

Describe the problem in terms of a user need and an observable outcome.

Weak definition:

> Build an AI recommendation engine.

Stronger definition:

> Help users discover eligible profiles that better satisfy their explicitly configured preferences, while respecting profile visibility rules.

The stronger definition communicates what the system should do without prematurely prescribing its implementation.

### 9.2 Requirements and constraints

Identify what the system must do and what it must not do.

Consider:

- Functional requirements.
- User expectations.
- Data availability.
- Latency and resource constraints.
- Privacy and access requirements.
- Failure consequences.
- Human oversight requirements.

Constraints help distinguish a technically possible solution from a suitable engineering solution.

For example, a system that produces excellent recommendations but exposes profiles to unauthorized users is not a successful solution.

### 9.3 Data and knowledge preparation

Determine what information the system needs and whether that information is available, reliable, relevant, and permitted for the intended use.

Depending on the problem, this may involve:

- Collecting or identifying relevant data.
- Validating records.
- Resolving inconsistent representations.
- Defining explicit rules and domain knowledge.
- Establishing appropriate labels or reference outcomes.
- Identifying missing or unreliable information.

Not every AI problem requires a large training dataset. A rule-based search system may primarily require accurate domain data and well-defined constraints.

Likewise, having a large dataset does not guarantee that it contains the information required to solve the problem.

### 9.4 Approach selection

Choose the approach that best fits the problem and constraints.

Possible approaches include:

- Deterministic rules.
- Search and retrieval.
- Statistical machine learning.
- Neural networks.
- Generative models.
- Hybrid architectures.

The selection should be supported by reasoning about requirements, evidence, cost, risk, and operational complexity.

Do not choose a complex model simply because a simpler technique seems less sophisticated.

### 9.5 System design and implementation

Translate the selected approach into components with clear responsibilities.

At this stage, engineers define interfaces, data flows, error handling, component boundaries, and the interactions between conventional software and AI components.

The system design should account for the complete user task rather than only the model's input and output.

Detailed software architecture, testing practices, serving infrastructure, and deployment engineering are covered in the relevant ENG and PROD topics.

### 9.6 Evaluation and validation

Determine whether the implemented system satisfies the requirements.

The evaluation strategy depends on the problem type and the consequences of failure.

For example:

- A classification system may need to be assessed on its category assignments.
- A retrieval system may need to be assessed on whether relevant information is found.
- A ranking system may need to be assessed on the ordering of candidates.
- A generative system may need checks for factual support, completeness, and adherence to requirements.
- A decision-making system may need validation against its constraints and acceptable outcomes.

A demo that works on a few examples is not sufficient evidence that a system is reliable.

Evaluation methodology, metrics, model selection, and generalization are owned by AIF-03. This chapter establishes why evaluation must be planned as part of the lifecycle; it does not replace that detailed treatment.

### 9.7 Deployment readiness

Before a system is made available to users, determine whether it is ready for the intended environment.

Relevant questions include:

- Does it satisfy the defined requirements?
- Are important failure cases understood?
- Are permissions and data-handling requirements enforced?
- Can failures be detected and handled?
- Are the expected operational costs acceptable?
- Is human intervention available where necessary?

Deployment readiness is not simply the act of packaging a model or making an API endpoint accessible.

### 9.8 Deployment

Deployment makes the system available in its intended environment.

Depending on the product, this may involve exposing an API, integrating with an application, or releasing a capability to a limited group of users.

Deployment is an engineering milestone, not proof that the system will remain effective indefinitely.

### 9.9 Ongoing assessment and improvement

After deployment, the system may encounter new inputs, changed user behavior, altered business requirements, data-quality problems, or previously unseen failure modes.

The team must assess whether the system continues to satisfy its intended purpose.

Possible responses include:

- Correcting data-quality issues.
- Revising business rules.
- Improving retrieval or ranking behavior.
- Re-evaluating the selected approach.
- Updating the system when requirements change.
- Restricting a capability when its risks become unacceptable.

Detailed monitoring, incident response, model lifecycle operations, and production reliability belong to PROD. The key concept here is that the AI system lifecycle continues after release.

---

## 10. Lifecycle Is Iterative, Not Linear

The lifecycle diagram gives an organized way to think about the work, but real projects rarely move through every stage exactly once.

Suppose a recommendation system performs poorly during evaluation.

The problem might not be the ranking algorithm. Investigation could reveal that:

- The business requirement is ambiguous.
- The available data does not represent the intended users.
- The retrieval stage excludes useful candidates.
- A business constraint is incorrectly implemented.
- The evaluation examples do not represent real usage.

Each finding may require returning to an earlier stage.

```text
Define
  |
  v
Build
  |
  v
Evaluate
  |
  +---- Requirements unclear? ----> Redefine
  |
  +---- Data inadequate? ---------> Revisit data preparation
  |
  +---- Approach unsuitable? -----> Reconsider approach
  |
  +---- Requirements satisfied? --> Prepare for release
```

An engineer should resist the temptation to treat every poor result as a model problem.

**The observed failure is evidence about the system. It is not yet a diagnosis of its cause.**

This connects directly to problem formulation and search from Chapter 03: a poorly defined objective or incomplete representation can make even a technically capable method produce the wrong result.

---

## 11. Common Engineering Mistakes

### Mistake 1: Starting with a framework or model

Choosing a framework before defining the problem encourages the team to shape the problem around the tool.

**Better approach:** Define the required behavior, constraints, and success criteria first.

### Mistake 2: Treating every AI problem as prediction

Not every system needs to predict a label or number. Retrieval, ranking, generation, planning, and deterministic decision-making have different objectives.

**Better approach:** Identify the type of output or behavior the user actually needs.

### Mistake 3: Treating all AI problem types as mutually exclusive

A product may use classification, retrieval, ranking, and generation in the same workflow.

**Better approach:** Decompose the business workflow into responsibilities before selecting techniques.

### Mistake 4: Assuming more AI means a better solution

Adding a model to a simple, well-defined decision can increase cost, uncertainty, and maintenance without providing meaningful value.

**Better approach:** Prefer the simplest approach that satisfies the requirements and acceptable risk level.

### Mistake 5: Defining success only as model quality

A model can perform well on a narrow test while the complete product fails because of incorrect data, unsuitable workflows, privacy violations, or poor integration.

**Better approach:** Define success at both the component level and the complete-system level.

### Mistake 6: Treating deployment as completion

A released system may stop meeting requirements as its environment changes.

**Better approach:** Plan for ongoing assessment and improvement from the beginning.

### Mistake 7: Ignoring failure consequences

An incorrect movie recommendation and an incorrect medical decision do not have the same consequences.

**Better approach:** Let the consequences of failure influence validation, safeguards, human oversight, and the amount of autonomy granted to the system.

### Mistake 8: Using generated explanations as proof

A system may produce a convincing explanation that does not reflect the actual decision process or underlying evidence.

**Better approach:** Ground explanations in the actual rules, records, retrieved evidence, and decision signals used by the system.

---

## 12. Engineering Decision Scenarios

Use the following scenarios to practice approach selection. The purpose is to justify a decision, not to name a model.

### Scenario A: Access control

A company needs to ensure that employees can access only documents permitted by their assigned permissions.

Questions to consider:

- Should the core access decision be delegated to a generative model?
- Which constraints must be enforced deterministically?
- What evidence should the system use to establish whether access is allowed?

Engineering direction: enforce authorization through reliable access-control mechanisms. AI may help users find or understand documents, but it should not replace required permission enforcement.

### Scenario B: Unstructured support tickets

A company receives thousands of support tickets and wants to discover recurring themes.

Questions to consider:

- Are reliable categories already defined?
- Is the immediate goal to assign known labels or discover unknown patterns?
- What role might human interpretation play?

Engineering direction: classification may fit a well-defined labeling task; clustering may help explore unknown themes. The correct choice depends on the objective and available evidence.

### Scenario C: Internal knowledge assistant

Employees ask questions about company policies and technical documentation.

Questions to consider:

- Does the system need to retrieve existing information, generate new content, or both?
- How will it avoid presenting unsupported information as fact?
- How will document permissions be respected?

Engineering direction: retrieval and generation may work together. Retrieval supplies relevant evidence, while generation produces a user-facing response. Access control and evidence validation remain separate engineering responsibilities.

### Scenario D: Route planning

A logistics system must find a route that respects vehicle restrictions and delivery windows.

Questions to consider:

- What constitutes a valid state?
- Which actions are available?
- What are the constraints and optimization objectives?
- How should the system behave when no feasible route exists?

Engineering direction: formulate the planning problem explicitly. Depending on its complexity, graph search, optimization, specialized routing methods, or hybrid approaches may be appropriate.

---

## 13. Interview Questions

### Q1. How do you determine the type of AI problem?

Start from the required behavior and output. Determine whether the system must assign categories, estimate values, discover groups, order candidates, recommend options, retrieve information, generate content, or plan and select actions. Then consider constraints, evidence, and failure consequences before selecting a technique.

### Q2. What is the difference between ranking and recommendation?

Ranking orders candidates according to relevance or another objective. Recommendation selects or presents useful candidates or actions. Recommendation systems often use ranking, but may also apply eligibility rules, diversity requirements, or other constraints.

### Q3. Can one AI product contain multiple problem types?

Yes. A knowledge assistant may retrieve documents, rank relevant passages, generate an answer, and validate its output. These stages have different responsibilities and may use different techniques.

### Q4. Why should an engineer define the problem before selecting a model?

Without a clear problem definition, the team cannot reliably determine which approach is suitable, what constraints must be enforced, or what evidence would demonstrate success. Premature model selection risks solving the wrong problem.

### Q5. Is the AI system lifecycle always linear?

No. It is a conceptual structure for organizing work. Evaluation, implementation, or deployment preparation may reveal issues that require revisiting requirements, data preparation, or approach selection.

### Q6. Why is model evaluation not the same as system evaluation?

A model is one component of a larger solution. The complete system may also depend on retrieval, data quality, rules, permissions, integrations, and user workflows. A component can perform well while the end-to-end product still fails.

### Q7. When should an engineer avoid using AI?

When deterministic software or explicit rules can satisfy the requirement more reliably, transparently, and economically, a model may add unnecessary complexity. The decision should be based on requirements, uncertainty, risk, and expected benefit rather than the desire to use AI.

### Q8. What does it mean for an AI system to be production-ready?

At a high level, it means the system has been evaluated against its requirements, important risks and failure cases are understood, necessary safeguards are in place, and the system is prepared for its intended operating environment. Detailed production readiness practices belong to PROD.

---

## 14. Quick Revision

Before moving forward, make sure you can explain these ideas without relying on the chapter text:

- Classification assigns categories; regression estimates numerical values.
- Clustering discovers groups; ranking orders candidates.
- Recommendation selects useful options; search retrieves relevant existing information.
- Generation produces new content; planning and decision-making address actions and goals.
- A single product can combine multiple problem types.
- Rules, search, learned models, and generative models solve different kinds of problems and may be combined.
- Problem definition should precede approach selection.
- The AI system lifecycle includes problem definition, requirements, data or knowledge preparation, approach selection, implementation, evaluation, deployment readiness, deployment, and ongoing assessment.
- The lifecycle is iterative.
- A system must be evaluated against the complete task and its failure consequences, not only against the behavior of an isolated model.

---

## 15. Key Takeaways

1. **Problem structure determines the technical direction.** Identify the required behavior before selecting a model or framework.
2. **AI problem types can be combined.** Real products often coordinate retrieval, ranking, classification, generation, and deterministic rules.
3. **A model is not the whole system.** Data, constraints, interfaces, safeguards, and user workflows all affect the outcome.
4. **The lifecycle begins with the problem and continues after release.** Deployment does not guarantee continuing suitability.
5. **Evaluation should inform engineering decisions.** Poor results may indicate a problem with requirements, data, approach selection, or system design—not just the model.
6. **Complexity must earn its place.** Use an AI technique when it provides value that justifies its cost, uncertainty, and operational burden.
7. **Failure consequences matter.** High-risk decisions require stronger safeguards and more careful validation than low-impact recommendations.

---

## 16. Further Reading

Use the following topics as connections to the rest of the curriculum rather than as reasons to duplicate material in this chapter:

- **AIF-01 — Mathematical Foundations:** probability, statistics, linear algebra, and optimization.
- **AIF-03 — Machine Learning Foundations:** learning paradigms, generalization, evaluation methodology, and model selection.
- **AIF-04 — Neural Network Foundations:** neural network structure and training fundamentals.
- **AIF-05 — Representation Learning and Embeddings:** learned representations and similarity-based retrieval.
- **AIF-07 — Attention and Transformers:** transformer architecture and information flow.
- **AGT — Agent Engineering:** practical planning, orchestration, and tool use.
- **PROD — Production AI Engineering:** deployment, monitoring, reliability, and operational evaluation.
- **ENT — Enterprise AI Systems:** integration with enterprise workflows, systems, and constraints.
- **ENG — Engineering Foundations:** software design, testing, data systems, and operational fundamentals.

---

## End of Document

**Completion marker:** AIF-02 Chapter 04 — AI Problem Types and System Lifecycle

**Validation note:** This chapter follows the proposed AIF-02 scope and the stated boundaries with adjacent curriculum domains. The detailed authoritative AIF hierarchy and live GitHub links have not been independently verified in this session. The relative links to neighboring chapters are based on the proposed filenames.
