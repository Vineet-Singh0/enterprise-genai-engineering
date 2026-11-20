# AI Foundations (AIF)

**Domain:** AI Foundations

---

## 1. Purpose

AI Foundations establishes the mathematical, conceptual, and architectural foundations required to understand modern AI systems and engineer reliable Generative AI applications.

The domain progresses from mathematical reasoning and general AI concepts to machine learning, deep learning, representation learning, sequential models, and transformer architecture.

The objective is not to memorize algorithms or frameworks. It is to develop the ability to explain how AI systems learn and represent information, reason about their limitations, interpret evaluation results, and make informed engineering decisions.

AIF is designed to support the later domains of this curriculum, particularly LLM Engineering, Retrieval Engineering, Agent Engineering, Production AI Engineering, and Enterprise AI Systems.

## 2. Learning Outcomes

After completing AIF, the learner should be able to:

- Interpret mathematical concepts used in AI, including probability, statistics, linear algebra, derivatives, and optimization.
- Explain the evolution of AI and distinguish symbolic, statistical, and learning-based approaches.
- Formulate machine learning problems and select appropriate learning paradigms.
- Explain data preparation, generalization, bias–variance trade-offs, evaluation, and model selection.
- Trace neural-network forward propagation and explain loss functions, backpropagation, gradients, and training dynamics.
- Explain how learned representations and embeddings encode information in mathematical spaces.
- Describe sequential modeling approaches, including recurrent neural networks and LSTMs, and explain the motivation for attention.
- Explain self-attention, multi-head attention, positional information, transformer information flow, and major transformer architecture variants.
- Identify assumptions, limitations, failure modes, and trade-offs in foundational AI approaches.
- Connect foundational concepts to downstream AI engineering without confusing conceptual understanding with production implementation.

These outcomes describe the intended capabilities of the domain; completion requires explanation and practical reasoning, not reading alone.

## 3. Domain Scope

### Included

AIF covers the foundational concepts and mental models for:

- Mathematical foundations relevant to AI.
- General AI concepts, approaches, reasoning, and problem formulation.
- Machine learning foundations and evaluation methodology.
- Neural networks, deep learning, and training dynamics.
- Feature representations, distributed representations, embeddings, and representation quality.
- Sequential data and earlier sequence-modeling architectures.
- Attention and transformer architecture fundamentals.

### Covered elsewhere

| Domain | Boundary |
|---|---|
| ENG — Engineering Foundations | General computer science, programming, software engineering, and systems foundations. AIF references these concepts rather than duplicating their primary explanations. |
| LLM — LLM Engineering | LLM-specific engineering, detailed tokenizer implementation, and model-specific inference behavior beyond foundational transformer concepts. |
| RET — Retrieval Engineering | Chunking, indexing, vector databases, nearest-neighbor search, ranking, retrieval evaluation, and RAG implementation. |
| AGT — Agent Engineering | Agent workflows, planning, tool orchestration, and agent-framework implementation. |
| PROD — Production AI Engineering | Model serving, deployment, reliability, monitoring, optimization, and operational practices. |
| ENT — Enterprise AI Systems | Enterprise integration, security, governance, and broader system-level concerns assigned to that domain. |

AIF may introduce the concepts necessary to understand these areas, but it does not replace their specialized engineering treatment.

## 4. Learning Path

AIF contains seven pillars in the recommended order. Their order defines the curriculum's intended progression; it does **not**, by itself, establish mandatory prerequisite dependencies.

| Order | Pillar | Primary focus | Lessons |
|---:|---|---|---:|
| 1 | [Mathematics Foundation](AIF-01-Mathematics-Foundation/README.md) | Mathematical relationships, uncertainty, data, vectors, and optimization | 7 |
| 2 | [AI Fundamentals](AIF-02-AI-Fundamentals/README.md) | AI approaches, reasoning, search, and problem lifecycles | 4 |
| 3 | [Machine Learning Foundations](AIF-03-Machine-Learning-Foundations/README.md) | Learning paradigms, data, generalization, evaluation, and model selection | 6 |
| 4 | [Deep Learning Foundations](AIF-04-Deep-Learning-Foundations/README.md) | Neural networks, forward propagation, gradients, and training behavior | 6 |
| 5 | [Representation Learning](AIF-05-Representation-Learning/README.md) | Learned features, embeddings, representation spaces, and similarity | 4 |
| 6 | [Sequence Modeling](AIF-06-Sequence-Modeling/README.md) | Sequential data, recurrent models, and the motivation for attention | 3 |
| 7 | [Transformer Foundations](AIF-07-Transformer-Foundations/README.md) | Self-attention, transformer architecture, information flow, and scaling | 5 |

**Total:** 35 lessons across seven pillars.

## 5. Learning Principles

Study AIF with these principles in mind.

### 6.1 Engineering-first mathematics

Introduce mathematical ideas through the problem they help explain. Develop intuition before formal notation, then use examples to clarify assumptions, applications, and limitations.

### 6.2 One concept, one primary location

Each concept has one primary teaching location. Other chapters may reference it and explain how it is applied, but must not repeat the original explanation in depth.

### 6.3 Foundations before implementation

Explain the underlying mechanisms before introducing implementation details. Framework-specific tutorials and production integration belong to their appropriate domains.

### 6.4 Controlled depth

Documents should be detailed enough to develop conceptual understanding and engineering judgment. Do not expand chapters merely to increase length.

### 6.5 Explicit boundaries

Keep foundational AI concepts distinct from retrieval implementation, LLM-specific engineering, agent orchestration, and production operations.

### 6.6 Traceable navigation

Use descriptive headings, relative Markdown links, consistent filenames, and clear connections to related topics. Navigation READMEs should guide the learner rather than reproduce teaching chapters.

### 6.7 Preserve approved boundaries

Do not add, remove, split, merge, rename, or reorder the approved pillars or alter the approved chapter inventory without a deliberate plan revision.

## 7. Recommended Study Schedule

The proposed study plan uses 14 sessions, approximately 60–90 minutes each. It is a session-level guide, not a verified file-by-file assignment.

| Session | Focus | Expected capability |
|---:|---|---|
| 1 | Functions, algebra, exponents, and logarithms | Interpret mathematical relationships and transformations. |
| 2 | Probability and statistics | Reason about uncertainty, samples, and distributions. |
| 3 | Linear algebra and vector operations | Understand dimensions, matrix operations, dot products, and cosine similarity. |
| 4 | Derivatives, gradients, and optimization intuition | Explain how mathematical change relates to model learning. |
| 5 | AI concepts, evolution, symbolic AI, and statistical AI | Compare major AI approaches and their assumptions. |
| 6 | Search, reasoning, knowledge representation, and AI lifecycle | Formulate AI problems and recognize approach limitations. |
| 7 | ML problem formulation and learning paradigms | Choose a learning paradigm based on the problem and available data. |
| 8 | Data preparation, features, labels, and generalization | Identify data risks and explain overfitting and underfitting. |
| 9 | Evaluation, cross-validation, metrics, and model selection | Design evaluations and interpret model results. |
| 10 | Neural networks, perceptrons, and forward propagation | Trace the forward computation of a neural network. |
| 11 | Activation functions, loss functions, and backpropagation | Explain how prediction error informs parameter updates. |
| 12 | Optimization, regularization, training dynamics, and failure modes | Diagnose common training problems conceptually. |
| 13 | Representation learning, embeddings, and sequence modeling | Explain learned representations and earlier sequential architectures. |
| 14 | Attention and transformer foundations | Explain self-attention, transformer architecture, and foundational trade-offs. |

The schedule is intended to guide learning, not to enforce completion by a fixed deadline. Exercises, implementation, revision, and assessments require additional time.

## 8. Estimated Reading Time

The proposed reading estimates for the 35 teaching chapters are:

| Pillar | Estimated reading time |
|---|---:|
| Mathematics Foundation | 105–145 minutes |
| AI Fundamentals | 55–75 minutes |
| Machine Learning Foundations | 100–135 minutes |
| Deep Learning Foundations | 115–155 minutes |
| Representation Learning | 65–90 minutes |
| Sequence Modeling | 45–65 minutes |
| Transformer Foundations | 90–125 minutes |
| **Total chapter reading** | **575–790 minutes** |

This corresponds to approximately **9 hours 35 minutes to 13 hours 10 minutes** of reading.

Including the proposed 30–45 minutes for navigation and revision gives an overall planning estimate of **10 hours 5 minutes to 13 hours 55 minutes**.

These estimates exclude exercises, implementation, research, assessments, and projects. They are planning estimates, not measured reading durations or guarantees of mastery.

## 9. Completion Criteria

AIF should be considered complete when the learner can demonstrate the following capabilities:

1. **Understand:** Explain the central ideas of each pillar in their own words.
2. **Explain:** Trace important conceptual mechanisms and justify why they work.
3. **Apply:** Use foundational concepts to reason about concrete AI problems and model behavior.
4. **Analyze:** Identify assumptions, evaluation risks, limitations, and likely failure modes.
5. **Connect:** Explain how AIF concepts support downstream LLM, retrieval, agent, and production engineering.
6. **Teach:** Communicate the concepts clearly, using examples and reasoning rather than memorized definitions.

Reading every chapter is necessary for following the proposed curriculum, but reading alone is not sufficient evidence of mastery.

## 10. Known Limitations and Validation Status

The hierarchy has been approved as the working documentation plan. The following limitations remain explicitly open:

- **Authoritative curriculum coverage:** The authoritative detailed AIF topic hierarchy was not available for direct comparison. Completeness against that hierarchy therefore remains unverified.
- **Live repository validation:** File existence, naming collisions, and compatibility with the current GitHub repository have not been checked.
- **Relative links:** The intended relative paths follow the proposed structure, but their destinations have not been verified against existing files.
- **Per-file estimates:** Individual chapter reading times and per-file document-size estimates are unavailable. The aggregate estimates above are preserved from the plan.
- **Document-size milestones:** The original cumulative document-size milestones contain a disclosed inconsistency in how pillar READMEs may be accounted for. The original estimates have not been recalculated or silently changed.
- **Knowledge graph:** The corrected graph is membership-only. Its literal Mermaid source has not been rendered or tested, and it does not establish prerequisite relationships.
- **Dependency claims:** The pillar order should not be interpreted as proof that every earlier pillar is a mandatory prerequisite for every later pillar.

These limitations do not block generation under the approved plan, but they must not be represented as validated facts.
