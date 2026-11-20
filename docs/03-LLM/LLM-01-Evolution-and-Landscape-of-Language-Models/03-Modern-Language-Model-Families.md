# 03 — Modern Language Model Families

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Classify modern language models along multiple independent dimensions.
- Distinguish encoder-only, decoder-only, and encoder–decoder architectures at a conceptual level.
- Explain the difference between architecture, training purpose, specialization, and modality.
- Understand why models built on related architectures can have different capabilities and intended uses.
- Distinguish general-purpose language models from specialized models without assuming that one category is universally superior.
- Interpret common model-family labels without treating them as complete descriptions of a model.
- Connect model classification to practical engineering decisions while leaving systematic model selection to LLM-10.

## 2. Prerequisites

You should understand:

- The transition from statistical language models to neural language models.
- The high-level role of attention and Transformers.
- The difference between pretraining and subsequent model adaptation.

Recommended references:

- [01 — Evolution of Language Modeling](01-Evolution-of-Language-Modeling.md)
- [02 — From Neural Language Models to Modern LLMs](02-From-Neural-Language-Models-to-Modern-LLMs.md)
- [AIF-07 — Transformer Foundations](../../02-AIF/AIF-07-Transformer-Foundations/README.md)

Detailed architecture mechanics belong to AIF-07. This chapter focuses on classification and conceptual distinctions.

## 3. Estimated Reading Time

12–16 minutes.

## 4. Before We Start

Imagine that an engineering team is evaluating four models:

- Model A generates conversational responses.
- Model B produces vector representations for semantic search.
- Model C converts documents from one language to another.
- Model D processes images alongside text and answers questions about them.

Can these models be classified into mutually exclusive categories?

Not reliably.

Model A might be a decoder-only Transformer that has undergone instruction tuning. Model B might use an encoder architecture optimized for embedding generation. Model C could use an encoder–decoder architecture. Model D might combine a language model with image-processing components.

These descriptions refer to different properties of the systems.

A model can be decoder-only, instruction-tuned, multilingual, and multimodal at the same time. Those labels are not necessarily competing alternatives.

**The central principle of this chapter is that model families must be classified along multiple dimensions rather than placed into one universal list of categories.**

This distinction matters because engineers often compare models using labels that describe different things.

## 5. Why Model Classification Exists

The language-model ecosystem contains models developed for different objectives, architectures, data types, and deployment environments.

Without a classification framework, engineers may make incorrect assumptions, such as:

- Assuming every LLM is designed for conversational interaction.
- Assuming all Transformer models generate text.
- Assuming instruction-tuned models are always better for every task.
- Assuming multimodal models support every modality equally well.
- Assuming models from the same architectural family have equivalent capabilities.

Classification provides a vocabulary for describing what a model is designed to do and how it is broadly structured.

It does not establish which model is best for a particular application. That requires evaluating task requirements, quality, latency, cost, access constraints, and other factors covered in [LLM-10 — Model Selection and Ecosystem Decisions](../LLM-10-Model-Selection-and-Ecosystem-Decisions/README.md).

## 6. A Multidimensional Model Classification Framework

A useful first step is to separate five classification dimensions.

{`                         LANGUAGE MODEL
                               |
          +--------------------+--------------------+
          |                    |                    |
      Architecture           Purpose             Modality
          |                    |                    |
    Encoder-only         Text generation      Text-only
    Decoder-only         Embeddings           Image + text
    Encoder-decoder      Classification       Audio + text
                         Translation           Video + text
                               |
                 +-------------+-------------+
                 |                           |
              Training                   Specialization
                 |                           |
             Pretrained                 General-purpose
             Instruction-tuned          Domain-specific
             Task-adapted               Task-specific`

The diagram is a conceptual map, not a strict taxonomy. The dimensions overlap, and additional properties—such as model size, licensing, access method, and context capacity—can be used to describe models more precisely.

### 6.1 Architecture

Architecture describes the broad computational structure used by a model.

For Transformer-based language models, the commonly discussed categories are:

- Encoder-only.
- Decoder-only.
- Encoder–decoder.

These categories describe architectural organization, not necessarily the model's complete training history or intended application.

### 6.2 Purpose

Purpose describes the primary task or family of tasks a model is designed or adapted to support.

Examples include:

- Text generation.
- Embedding generation.
- Classification.
- Translation.
- Reranking candidate passages.

Purpose is not determined by architecture alone. A model's training objective, learned representations, adaptation, and output interface also matter.

### 6.3 Training and adaptation

Training labels describe how a model has been developed or adapted.

Examples include:

- Pretrained.
- Instruction-tuned.
- Fine-tuned for a particular task.
- Adapted using preference-based or other alignment methods.

These labels can overlap. A model may be pretrained, instruction-tuned, and further adapted for a specialized application.

The training process is covered in detail in [LLM-02 — Language Model Training and Learned Behavior](../LLM-02-Training-and-Learned-Behavior/Readme.md).

### 6.4 Specialization

Specialization describes the intended breadth of application.

A general-purpose model may support many different tasks. A specialized model may focus on a narrower domain, input type, or output requirement.

Specialization is not a guarantee of superiority. A domain-specific model may perform better on selected tasks but less well on tasks outside its specialization.

### 6.5 Modality

Modality describes the kinds of information a model can process or produce.

Examples include:

- Text.
- Images.
- Audio.
- Video.
- Structured or spatial representations.

A multimodal model supports multiple modalities in some combination. This does not mean that every input and output combination is supported.

For example, a model may accept images and text but generate text only. Another model may accept audio and produce spoken audio responses.

These five dimensions are related, but they should not be collapsed into a single category.

## 7. The Three Major Transformer Architecture Families

This section introduces the conceptual differences among encoder-only, decoder-only, and encoder–decoder models. It does not cover their internal attention operations or detailed information flow.

### 7.1 Encoder-only models

Encoder-only models are commonly associated with learning contextual representations of input text.

At a high level, the model processes an input sequence and produces representations that can be used for downstream tasks.

Typical applications include:

- Text classification.
- Semantic representation learning.
- Information extraction.
- Sentence or passage embeddings, depending on the model and its training.
- Other language-understanding tasks.

A well-known example is [BERT](https://arxiv.org/abs/1810.04805), introduced for language representation and understanding.

Conceptually:

{`Input text
    |
    v
Encoder-based model
    |
    v
Contextual representations
    |
    +----> Classification
    +----> Extraction
    +----> Other downstream tasks`

An encoder-only model is not automatically a good embedding model for every semantic-search application. Its usefulness depends on its training, adaptation, pooling strategy, and evaluation for the intended task.

Likewise, encoder-only models are not inherently incapable of supporting every form of text generation in every system. The point is that their architecture and typical training setups are commonly associated with representation and understanding tasks rather than standard autoregressive text generation.

### 7.2 Decoder-only models

Decoder-only models are widely used for autoregressive language generation.

At a conceptual level, they generate a sequence by predicting the next token conditioned on the preceding context.

For example:

```text
Input:  The deployment failed because

Prediction 1: the
Prediction 2: service
Prediction 3: crashed
```

The generated sequence becomes part of the context used for subsequent predictions.

Typical applications include:

- Conversational assistants.
- Text generation.
- Code generation.
- Summarization.
- Question answering.
- Instruction-following interfaces.

Many modern general-purpose LLMs use decoder-only Transformer architectures.

However, a decoder-only architecture does not guarantee that a model is instruction-tuned, reliable, or suitable for every generation task. Its behavior also depends on training, adaptation, prompting, and deployment configuration.

### 7.3 Encoder–decoder models

Encoder–decoder models contain two major functional components:

- An encoder that processes the input.
- A decoder that generates an output using information derived from the encoded input and the decoder's available context.

This arrangement is commonly associated with sequence-to-sequence tasks, in which an input sequence is transformed into an output sequence.

Typical applications include:

- Machine translation.
- Text summarization.
- Conditional text generation.
- Certain text transformation tasks.

For example:

```text
Input: "Good morning" in English
                 |
                 v
              Encoder
                 |
                 v
       Encoded input information
                 |
                 v
              Decoder
                 |
                 v
Output: "Bonjour" in French
```

This is a simplified conceptual representation. Actual model behavior depends on its architecture and training.

Encoder–decoder models are particularly natural for tasks in which the output is conditioned on an input sequence. However, architecture alone does not determine whether a model will outperform a decoder-only alternative on a particular task.

### 7.4 Comparison

| Dimension | Encoder-only | Decoder-only | Encoder–decoder |
|---|---|---|---|
| Broad role | Input representation | Autoregressive generation | Input-to-output transformation |
| Typical applications | Classification, representations, extraction | Text and code generation, assistants | Translation, summarization, conditional generation |
| Common conceptual output | Representations used by a task head or downstream system | Generated token sequence | Generated sequence conditioned on encoded input |
| Important qualification | Not every encoder is suitable for semantic search | Not every decoder is instruction-tuned | Not automatically superior for every sequence-to-sequence task |

These are typical associations, not strict limitations that apply identically to every implementation.

For the internal differences among Transformer architectures, including attention and information flow, use [AIF-07 — Transformer Foundations](../../02-AIF/AIF-07-Transformer-Foundations/README.md).

## 8. Model Families Classified by Purpose

Architecture tells us something about how a model is organized. Purpose tells us what work the model is intended to perform.

The following categories are particularly important in GenAI engineering.

### 8.1 Generative language models

Generative language models produce sequences of tokens, commonly used to generate text or code.

Depending on their capabilities and training, they may support:

- Drafting and rewriting.
- Summarization.
- Conversational interaction.
- Question answering.
- Code generation.
- Structured output generation.

Generation is not the same as verification. A model can produce grammatically correct text that contains factual errors or unsupported claims.

### 8.2 Embedding models

Embedding models transform input content into numerical vectors designed to preserve useful information for a particular task.

These vectors can support operations such as semantic similarity search, clustering, retrieval, and classification.

For example, an application might represent a question and a set of documents as vectors, then retrieve documents whose representations are similar to the question's representation.

Embedding models are often optimized for representation tasks rather than free-form response generation.

The detailed foundations of representations and embeddings are covered in [AIF-05 — Representation Learning](../../02-AIF/AIF-05-Representation-Learning/README.md). LLM-04 will cover embedding systems in the language-model context.

### 8.3 Reranking models

A reranking model evaluates candidate items in relation to a query and assigns scores intended to reflect their relevance.

In a retrieval system, an initial search stage might return 100 candidate documents. A reranker can evaluate those candidates more carefully and help order them for downstream use.

A reranker is therefore different from both a vector embedding model and a general-purpose text generator.

Its role is not necessarily to discover candidates across an entire corpus. It usually operates on a candidate set supplied by another retrieval stage.

### 8.4 Classification and extraction models

Some models or model configurations are designed for more constrained outputs.

Examples include:

- Assigning a document to a category.
- Identifying named entities.
- Extracting fields from a document.
- Producing labels or structured predictions.

These capabilities may be implemented using task-specific model heads, fine-tuned language models, or generative models constrained to produce a particular format.

Therefore, task purpose does not always correspond to a unique architecture.

### 8.5 Why purpose matters

Consider a semantic-search application.

A general-purpose generative model may be able to discuss documents, but it is not automatically the best component for generating document embeddings. A dedicated embedding model may be more suitable for the retrieval stage, while a generative model may be used later to formulate an answer.

The engineering lesson is to identify the function required by each component rather than assuming one model family should perform every job.

## 9. General-Purpose and Specialized Models

Another useful distinction concerns the breadth of intended use.

### 9.1 General-purpose models

General-purpose models are developed to support a broad range of tasks.

They may be useful for:

- Conversational interaction.
- Summarization and rewriting.
- General question answering.
- Coding assistance.
- Information transformation.
- Multiple instruction-following tasks.

Their breadth can simplify application development because one model may support several functions.

However, broad capabilities do not guarantee the best performance on every task. A general-purpose model may be unnecessarily expensive or less consistent than a specialized component for a narrow requirement.

### 9.2 Specialized models

Specialized models are designed or adapted for a narrower set of tasks, domains, or input types.

Examples include models focused on:

- Code.
- Medical or scientific text.
- Text embeddings.
- Reranking.
- Speech recognition.
- Translation.
- Document extraction.

Specialization may improve task performance, efficiency, or output consistency when the target problem matches the model's strengths.

It can also introduce limitations:

- Performance may degrade outside the target domain.
- The model may require additional integration.
- Specialized capabilities may not transfer to unrelated tasks.
- Maintenance and evaluation may become more complicated when many specialized models are used.

### 9.3 Specialization is not a quality ranking

The terms *general-purpose* and *specialized* describe intended scope, not absolute quality.

A specialized model is not automatically better because it focuses on one task. Its advantage must be demonstrated on relevant data and under the application's operational constraints.

Similarly, a general-purpose model is not automatically more capable in every meaningful sense.

The correct question is not:

> Which type is universally better?

It is:

> Which model provides the required behavior with acceptable quality, cost, latency, and operational complexity?

A systematic method for answering that question belongs in LLM-10.

## 10. Text-Only and Multimodal Models

Language models can also be classified by the types of information they accept and produce.

### 10.1 Text-only models

Text-only models operate on textual input and output.

Depending on their design, they may support generation, classification, summarization, extraction, or other language tasks.

Their interfaces may still accept structured metadata or tool definitions. That does not automatically make the model multimodal in the sense of processing image, audio, or video content.

### 10.2 Multimodal models

Multimodal models can process or generate more than one type of data.

Common examples include:

- **Image and text:** answering questions about images or describing visual content.
- **Audio and text:** transcribing speech, interpreting audio, or producing spoken responses.
- **Video and text:** analyzing visual sequences over time, where supported.
- **Other structured modalities:** processing specialized representations such as spatial or motion-related data in some systems.

A multimodal model may support only selected combinations of input and output modalities.

For example, a model that accepts an image and returns a text answer is multimodal even if it cannot generate images.

### 10.3 Why multimodality changes the problem

Different modalities have different representational and computational requirements.

Images contain spatial structure. Audio contains temporal signals. Video combines visual information with changes over time. A system must provide a mechanism for representing and integrating the relevant information.

Consequently, a model's modality label should be interpreted in relation to its actual supported inputs, outputs, and tasks.

The detailed implementation of multimodal models is outside this chapter's scope. The next relevant landscape topic is [07 — Multimodal Language Model Landscape](07-Multimodal-Language-Model-Landscape.md).

## 11. How the Classification Dimensions Interact

The dimensions introduced earlier become more useful when applied together.

Consider these illustrative descriptions:

| Model description | Architecture | Purpose | Training or adaptation | Modality |
|---|---|---|---|---|
| General conversational assistant | Often decoder-only | Text generation and instruction following | Pretrained and instruction-tuned | Text, potentially more |
| Semantic retrieval encoder | Often encoder-based | Embedding generation | Trained or adapted for representation quality | Commonly text |
| Translation model | Often encoder–decoder, but alternatives exist | Sequence-to-sequence translation | Trained or adapted for translation | Commonly text |
| Image-question-answering model | Architecture varies | Conditional response generation | Pretrained and adapted for multimodal tasks | Image and text |
| Code-specialized generator | Often decoder-only | Code generation and related tasks | Pretrained and/or adapted for code | Commonly text and code tokens |

The entries are typical examples, not universal definitions. Real models can differ, and model providers may use terminology that does not map perfectly onto this simplified classification.

Notice that each row combines several independent properties. The purpose is not to memorize every possible combination. It is to learn how to ask more precise questions about a model.

For example:

- What architecture does it use?
- What task was it trained or adapted to perform?
- Which input and output modalities does it support?
- How broad is its intended specialization?
- What evidence supports its claimed capabilities?

These questions provide a stronger foundation than relying on a model name or a single label.

## 12. Production Engineering Perspective

Classification is useful in production because a system may need several different model types rather than one universal model.

Consider a document-question-answering system:

```text
User question
     |
     v
Embedding model
     |
     v
Retrieve candidate documents
     |
     v
Reranking model
     |
     v
Select relevant context
     |
     v
Generative language model
     |
     v
Answer to the user
```

This diagram is illustrative; actual systems may omit stages or use different components.

The important point is that each model has a distinct responsibility:

- The embedding model represents content for retrieval.
- The retrieval mechanism finds candidate documents.
- The reranker refines candidate ordering.
- The generative model formulates the final response.

A model can be highly capable at generation but unsuitable for embedding retrieval, and a strong embedding model need not generate useful conversational answers.

Production architecture should therefore begin with component responsibilities and requirements, not with the assumption that the most powerful general-purpose model should handle everything.

Model selection, deployment constraints, cost comparisons, and provider decisions are addressed in later curriculum topics.

## 13. Common Mistakes and Misconceptions

### Mistake 1: Treating all model categories as mutually exclusive

A model can be decoder-only, instruction-tuned, code-specialized, and multimodal at the same time. These labels describe different dimensions.

### Mistake 2: Assuming architecture determines purpose

Architecture influences the computations a model performs, but its training objective, adaptation, and interface also affect its intended use.

### Mistake 3: Assuming every decoder-only model is a conversational assistant

A decoder-only model may be a base language model, a code model, an instruction-tuned assistant, or another specialized system. The architecture alone does not establish its behavior.

### Mistake 4: Assuming every encoder model is an effective embedding model

Useful embeddings depend on the model's training and how its representations are used. Not every encoder has been optimized for semantic similarity or retrieval.

### Mistake 5: Confusing embeddings with generated text

An embedding model produces numerical representations. A generative language model produces sequences of tokens. These outputs support different functions, even though both models may be neural networks.

### Mistake 6: Assuming a multimodal model supports every modality

Support must be verified for the specific inputs, outputs, and tasks required. Multimodality is not an all-or-nothing capability.

### Mistake 7: Treating specialization as proof of superiority

A specialized model may be excellent within its intended scope and weak outside it. Performance must be established on the target workload.

### Mistake 8: Selecting a model based only on its family name

A family label does not tell you enough about quality, context limits, latency, cost, access terms, or production suitability. Those details require model-specific evidence.

## 14. Interview Questions with Expected Answers

### Q1. What are the three major Transformer architecture families discussed in this chapter?

**Expected answer:** Encoder-only, decoder-only, and encoder–decoder. They differ in their broad organization and typical task associations. Detailed internal mechanics are separate from this high-level classification.

### Q2. Why is architecture not enough to determine a model's purpose?

**Expected answer:** Purpose also depends on training objectives, data, adaptation, and the interface through which the model is used. Models with similar architectures can be trained for different tasks.

### Q3. What is the difference between a generative model and an embedding model?

**Expected answer:** A generative model produces token sequences, while an embedding model transforms content into numerical vectors designed to preserve task-relevant information. Generation and semantic retrieval are different responsibilities.

### Q4. Can a model be both instruction-tuned and multimodal?

**Expected answer:** Yes. Instruction tuning describes a training or adaptation property, while multimodality describes supported data modalities. The labels belong to different classification dimensions.

### Q5. What is the difference between a general-purpose and a specialized model?

**Expected answer:** A general-purpose model targets a broad range of tasks, while a specialized model focuses on a narrower domain or function. Neither is universally better; suitability depends on the target workload and constraints.

### Q6. Why might a retrieval system use an embedding model, a reranker, and a generative model?

**Expected answer:** The embedding model supports candidate retrieval, the reranker improves the ordering of retrieved candidates, and the generative model formulates an answer from selected information. Separating responsibilities can improve system design and allow each component to be evaluated for its intended function.

### Q7. What must be verified before using a multimodal model in production?

**Expected answer:** The required input and output modalities, supported tasks, quality on representative data, operational constraints, and integration requirements. A broad multimodal label does not guarantee support for every modality combination.

## 15. Quick Revision

Try explaining these points without looking at the chapter:

1. Why should model families be classified along multiple dimensions?
2. How do encoder-only, decoder-only, and encoder–decoder models differ conceptually?
3. Why does architecture not uniquely determine task purpose?
4. What are the distinct roles of generative, embedding, and reranking models?
5. What trade-offs distinguish general-purpose from specialized models?
6. How does modality differ from architecture and training?
7. Why might a production application combine multiple model types?
8. What evidence is needed before concluding that a model fits a particular workload?

## 16. Key Takeaways

- Modern language models are best understood through multiple classification dimensions.
- Architecture, purpose, training, specialization, and modality describe different properties.
- Encoder-only models are commonly associated with representation and understanding tasks; decoder-only models with autoregressive generation; and encoder–decoder models with sequence-to-sequence tasks.
- These associations are useful abstractions, not absolute rules.
- Generative, embedding, reranking, and classification models serve distinct roles.
- General-purpose and specialized models differ in intended scope, not in a universal ranking of quality.
- Multimodal capability must be assessed for specific input and output combinations.
- Production systems may combine several model types, each selected and evaluated for its own responsibility.
- A classification label helps describe a model; it does not replace task-specific evaluation or systematic model selection.

## 17. Further Reading

1. **Devlin et al. — BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding (2018).** An influential example of encoder-based language representation.
2. **Vaswani et al. — Attention Is All You Need (2017).** Introduces the Transformer architecture and its original encoder–decoder design.
3. **Radford et al. — Language Models are Unsupervised Multitask Learners (2019).** Illustrates autoregressive language modeling and its use across multiple tasks.
4. **Reimers and Gurevych — Sentence-BERT (2019).** Discusses sentence embeddings designed for semantic similarity and related applications.
5. **Current model documentation from the relevant provider.** Use it to verify supported architectures, input and output modalities, intended use, and documented limitations before implementation.

---

## Chapter Validation

- **Scope:** Covers the classification of modern language models by architecture, purpose, training/adaptation, specialization, and modality.
- **Boundary control:** Transformer internals remain in AIF-07; training procedures remain in LLM-02; embedding foundations remain in AIF-05 and LLM-04; systematic model selection remains in LLM-10.
- **Engineering relevance:** Includes a multi-model retrieval example showing why model responsibilities should be separated.
