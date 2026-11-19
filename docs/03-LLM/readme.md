# LLM Engineering

## 1. Domain Purpose

LLM Engineering develops the knowledge and practical skills required to understand, evaluate, adapt, and select Large Language Models (LLMs) for engineering applications.

The domain focuses on how language models are trained, how they represent and generate language, how their behavior can be investigated, and how engineers make evidence-based decisions about model capabilities, adaptation, and resource trade-offs.

Within the Enterprise GenAI Engineering curriculum, LLM Engineering builds on general AI and transformer foundations and provides model-level knowledge used by Retrieval Engineering (RET), Agent Engineering (AGT), Production AI Engineering (PROD), and Enterprise AI Systems (ENT).

The objective is not merely to learn model-provider APIs. It is to develop the engineering judgment needed to understand model behavior, evaluate limitations, and select appropriate solutions.

## 2. Learning Outcomes

After completing this domain, learners should be able to:

- Explain the evolution, capabilities, and limitations of modern language models.
- Explain how training objectives and training stages influence learned model behavior.
- Inspect tokenization and understand its implications for model inputs and outputs.
- Distinguish generative-model representations from outputs exposed by dedicated embedding models.
- Explain inference, decoding, text generation, and context constraints.
- Demonstrate structured or schema-constrained generation and model-generated tool-call requests.
- Investigate model behavior, reasoning-related limitations, hallucinations, robustness, and failure modes.
- Design controlled evaluations and distinguish structural validity from semantic correctness.
- Conduct a small, controlled model-adaptation experiment using a baseline and held-out evaluation.
- Compare inference-time interventions, parameter-efficient adaptation, model compression, and inference resource trade-offs.
- Select models and engineering interventions using requirements, evaluation evidence, limitations, and resource constraints.
- Explain model-level image and audio interfaces and the implications for capability evaluation.

## 3. Prerequisites and Relationship to Other Domains

### Recommended learning progression

**ENG — Engineering Foundations** provides general computing, programming, software engineering, and testing foundations.

**AIF — AI Foundations** provides general AI/ML/DL concepts, representation learning, sequence modeling, and foundational transformer architecture.

These domains establish the intended learning progression. They do not imply that every topic in ENG or AIF must be completed before every LLM topic can be studied.

### Relationship to other domains

| Domain | Relationship to LLM Engineering |
|---|---|
| RET — Retrieval Engineering | Uses embeddings and language models in retrieval, ranking, and Retrieval-Augmented Generation (RAG). |
| AGT — Agent Engineering | Uses model outputs and tool-call requests within agent workflows, execution, and orchestration. |
| PROD — Production AI Engineering | Owns production serving, deployment, operational monitoring, and serving-scale performance. |
| ENT — Enterprise AI Systems | Owns enterprise architecture, security, governance, compliance, and organizational risk decisions. |

LLM Engineering provides the relevant model-level foundations while preserving the ownership of these neighboring domains.

## 4. Domain Scope

The domain contains ten connected topics covering language-model foundations, representations, generation, behavior, evaluation, optimization, and engineering decisions.

### Included concepts

- Language-model evolution, families, capabilities, and limitations.
- Training objectives, training stages, and learned behavior.
- Tokenization and language representation.
- Token embeddings, contextual representations, and dedicated embedding-model interfaces.
- Inference, decoding, text generation, and context constraints.
- Structured outputs, JSON mode, schema-constrained generation where supported, and model-generated tool-call requests.
- Model behavior, reasoning-related limitations, hallucinations, robustness, and failure analysis.
- Technical model evaluation, benchmarking, and controlled comparisons.
- Inference-time interventions, parameter-efficient adaptation, compression, and inference resource trade-offs.
- Model and ecosystem selection using evidence and engineering requirements.
- Model-level image and audio interfaces, limitations, and evaluation implications.

### Concept ownership and exclusions

**AI and transformer foundations**

AIF owns general AI/ML/DL foundations, representation learning, sequence modeling, and foundational transformer architecture. LLM applies these concepts to language-model engineering without duplicating their detailed treatment.

**Embeddings and retrieval**

LLM explains model-internal representations and dedicated embedding-model interfaces. RET owns embedding-based retrieval, vector search, indexing, ranking, and RAG engineering.

**Tool-call generation versus execution**

LLM covers how a model generates a tool-call request, including the requested tool name and arguments. A generated request is model output; it does not execute the requested action.

AGT owns tool execution, authorization, orchestration, workflow state, and agent-level reliability. Application-level validation and production integration remain with their respective engineering domains.

**Model-level optimization versus production optimization**

LLM evaluates model-level interventions and their effects on quality, memory, computation, latency, and other relevant resource trade-offs.

PROD owns production deployment, serving infrastructure, operational monitoring, and serving-scale optimization. Advanced GPU kernels, distributed-training infrastructure, and production-serving implementations are outside this domain's required scope.

**Evaluation versus governance and operations**

LLM owns technical evaluation of model capabilities, reliability, robustness, and safety-relevant behavior. ENT owns enterprise governance, security policy, compliance, and risk acceptance. PROD owns production monitoring and incident management.

**Multimodal scope**

Image and audio are the primary modalities covered. Their model-level interfaces, capabilities, and limitations are required conceptual learning. A practical multimodal experiment is optional. Video and other modalities receive brief coverage only.

## 5. Topic Navigation

The following list preserves the approved topic IDs, names, and sequence.

> **Link status:** The exact LLM topic-folder structure and filenames have not been independently verified. The relative links below are provisional navigation targets and do not establish that the destination files exist.

1. [LLM-01 — Evolution and Landscape of Language Models](LLM-01-Evolution-and-Landscape-of-Language-Models/README.md)
2. [LLM-02 — Language Model Training and Learned Behavior](LLM-02-Language-Model-Training-and-Learned-Behavior/README.md)
3. [LLM-03 — Tokenization and Language Representation](LLM-03-Tokenization-and-Language-Representation/README.md)
4. [LLM-04 — Embedding Systems in Language Models](LLM-04-Embedding-Systems-in-Language-Models/README.md)
5. [LLM-05 — Inference and Text Generation](LLM-05-Inference-and-Text-Generation/README.md)
6. [LLM-06 — Context Engineering and Context Constraints](LLM-06-Context-Engineering-and-Context-Constraints/README.md)
7. [LLM-07 — Model Behavior, Reasoning, and Failure Modes](LLM-07-Model-Behavior-Reasoning-and-Failure-Modes/README.md)
8. [LLM-08 — Language Model Evaluation and Benchmarking](LLM-08-Language-Model-Evaluation-and-Benchmarking/README.md)
9. [LLM-09 — Language Model Optimization and Adaptation](LLM-09-Language-Model-Optimization-and-Adaptation/README.md)
10. [LLM-10 — Model Selection and Ecosystem Decisions](LLM-10-Model-Selection-and-Ecosystem-Decisions/README.md)

## 6. Practical Learning and Mastery

This domain combines conceptual understanding with bounded practical work.

### Required practical work

#### 1. Structured-generation demonstration

Demonstrate structured or schema-constrained generation and a model-generated tool-call request through a model interface.

Examine the generated structure, argument quality, and relevant failure cases. Distinguish structural validity from semantic correctness.

The required demonstration ends at model output. Executing tool calls and orchestrating workflows belong to AGT.

#### 2. Controlled adaptation experiment

Complete one small, controlled model-adaptation experiment.

The experiment must include:

1. A defined task and success criteria.
2. A baseline evaluation.
3. A suitable small-scale adaptation.
4. Evaluation on held-out data.
5. A comparison of quality and resource costs.
6. An explanation of the result, uncertainty, limitations, and whether adaptation was justified.

The goal is to develop engineering judgment, not to guarantee that adaptation improves results. A negative result is acceptable when supported by evidence.

This domain does not prescribe a specific model, dataset, framework, hardware configuration, or time limit.

### Required conceptual learning

Learners must understand model-level image and audio interfaces, their limitations, and the implications for evaluation.

A practical image or audio experiment is optional. Video and other modalities receive brief coverage only.

### Mastery expectations

Learners should progress from explaining model concepts to investigating behavior, implementing bounded demonstrations, evaluating evidence, making engineering decisions, and communicating their reasoning.

Mastery is demonstrated through understanding and practical evidence, not merely by reading every topic.

## 7. Learning Progression

The default learning path moves through seven stages:

1. **Model foundations:** Understand the language-model landscape and how training produces learned behavior.
2. **Language representation:** Explore tokenization and distinguish generative-model representations from dedicated embedding-model outputs.
3. **Generation mechanics:** Understand inference, decoding, structured outputs, tool-call requests, and context constraints.
4. **Behavior investigation:** Analyze reasoning-related limitations, robustness, and model failure modes.
5. **Evaluation discipline:** Design controlled tests and interpret quality, reliability, and limitations.
6. **Optimization decisions:** Compare adaptation, compression, inference-time interventions, and resource trade-offs.
7. **Model selection:** Use requirements and evaluation evidence to justify model and ecosystem choices.

The progression is not a rigid prerequisite chain. Some topics provide context for others, while evaluation and model selection integrate evidence from multiple topics.

## 8. Documentation Status

The LLM Domain Curriculum Architecture v1.0 defines the approved scope, topic hierarchy, learning progression, and concept ownership for this domain.

This README serves as the domain-level navigation document. It does not establish that the ten topic READMEs, teaching chapters, or practical implementation files have been generated or reviewed.

The topic links remain provisional until the approved folder and filename structure is confirmed and the destination files are available.

No completion percentages or dates are inferred from the curriculum architecture.

## 9. How to Use This Domain

1. Follow the topic list in order as the default learning path.
2. Focus on understanding model behavior and engineering implications, not memorizing terminology.
3. Complete the required structured-generation demonstration and controlled adaptation experiment.
4. Preserve baseline results, held-out evaluation results, resource comparisons, and the reasoning behind your conclusions.
5. Revisit earlier topics when evaluation evidence challenges an assumption or an optimization decision.
6. Follow cross-domain references when a concept belongs to another domain rather than duplicating its detailed explanation.

Do not treat familiarity with a model API or framework as proof of mastery. Be able to explain the underlying behavior, relevant limitations, and reasoning behind your engineering decisions.

## 10. Cross-Domain Navigation

The domain architecture identifies ENG, AIF, RET, AGT, PROD, and ENT as the neighboring domains. Their README destination paths have not been independently verified for this document, so links are not included here.

Once the repository paths are confirmed, this section should link to the corresponding domain-level README files using relative Markdown links.
