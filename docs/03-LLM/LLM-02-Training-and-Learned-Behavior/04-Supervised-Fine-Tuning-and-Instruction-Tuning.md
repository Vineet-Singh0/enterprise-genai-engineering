# 04 — Supervised Fine-Tuning and Instruction Tuning

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain why pretrained language models are further trained after pretraining.
- Distinguish supervised fine-tuning (SFT) from pretraining and instruction tuning.
- Explain how instruction-response datasets are structured and used.
- Understand how loss masking determines which tokens contribute to training.
- Describe the relationship between supervised examples, model parameters, and learned response behavior.
- Identify the role of data quality, response diversity, and example construction in instruction tuning.
- Understand full fine-tuning and parameter-efficient approaches at a conceptual level.
- Evaluate the trade-offs of supervised fine-tuning in production systems.
- Recognize the limitations of instruction tuning and distinguish it from preference-based alignment.

## 2. Prerequisites

Before starting this chapter, you should understand:

- Next-token prediction and language-model training objectives.
- Model parameters, loss functions, gradients, and optimization.
- The distinction between training and inference.
- Training and validation datasets, generalization, and overfitting.
- The role of data quality and distribution in model behavior.

Relevant foundations:

- AIF-05 — Feature Engineering and Representation Learning
- AIF-06 — Sequential Models and Attention
- AIF-07 — Transformer Foundations
- LLM-01 — Language Model Foundations and Capabilities
- LLM-02, Chapter 1 — Language Model Training Foundations and Objectives
- LLM-02, Chapter 2 — Pretraining and Training Data
- LLM-02, Chapter 3 — Training Dynamics, Generalization, and Overfitting

## 3. Estimated Reading Time

Approximately 13–16 minutes.

## 4. Before We Start

Consider two models.

**Model A** has undergone large-scale pretraining on text from books, websites, documentation, code, and other sources. It has learned substantial linguistic structure and can continue text in many different ways.

**Model B** starts from the same pretrained model but receives additional training on examples such as:

```text
Instruction:
Explain the difference between a process and a thread.

Response:
A process is an executing program with its own address space
and resources. A thread is an execution path within a process
that shares many of those resources with other threads.
```

The second model has been explicitly trained on examples of instructions paired with desirable responses.

Both models may possess the underlying knowledge needed to answer the question. However, they have not necessarily been trained to use that knowledge in the same way.

This distinction motivates supervised fine-tuning and instruction tuning.

The central question is:

**How do we take a model that has learned to predict text and train it to respond more reliably to the kinds of requests people actually make?**

The answer is not simply to provide more data. It requires choosing suitable examples, defining the training objective correctly, controlling which tokens contribute to the loss, and evaluating whether the resulting behavior generalizes beyond the training examples.

## 5. Why This Exists

### 5.1 Pretraining does not directly optimize every desired interaction

Pretraining commonly teaches a causal language model to predict the next token in a sequence.

Given:

```text
The capital of France is
```

the model learns to assign probability to plausible continuations, including:

```text
Paris
```

This objective produces broad capabilities, but it does not directly guarantee that the model will consistently:

- Follow an instruction rather than continue it.
- Answer a question directly.
- Use a requested output format.
- Explain a concept at the requested level.
- Respect a particular response structure.
- Distinguish the instruction from the content being discussed.
- Produce concise answers when concision is requested.

A pretrained model can often perform these tasks because its training data contains relevant patterns. However, exposure to examples during pretraining is not the same as explicitly optimizing for instruction-following behavior.

### 5.2 The gap between capability and behavior

It is useful to distinguish three things:

| Dimension | Meaning |
|---|---|
| Knowledge | Information and patterns represented in the model's learned parameters |
| Capability | Tasks the model can potentially perform under suitable conditions |
| Behavior | The responses the model tends to produce in a particular interaction setting |

These dimensions are related but not interchangeable.

A model may contain relevant knowledge but fail to express it in the requested format. It may be capable of explaining a concept but produce an unnecessarily long answer. It may generate a plausible response without following an explicit constraint.

Instruction tuning attempts to shape the model's response behavior through supervised examples.

It does not guarantee that every underlying capability improves, nor does it guarantee factual correctness.

### 5.3 Why not solve everything with prompting?

Prompting can change the context presented to a model without updating its parameters. It is often the simplest and most flexible starting point.

However, repeatedly relying on increasingly complex prompts can be insufficient when a system requires consistent behavior across many requests, stable output conventions, or adaptation to a particular task distribution.

Supervised fine-tuning provides another mechanism: update model parameters using examples that demonstrate the desired behavior.

These approaches are complementary rather than mutually exclusive.

A production system may combine a tuned model with clear prompts, retrieval, structured output constraints, validation, and other controls.

## 6. Mental Model

Think of pretraining as learning a broad language-and-world representation, and supervised fine-tuning as practicing a particular way of using that representation.

```text
Pretrained language model
Broad learned representations and next-token prediction capability
        ↓
Supervised instruction-response examples
Supervised fine-tuning
Optimize model parameters using selected demonstrations
        ↓
Instruction-tuned model
A model trained to respond according to demonstrated patterns
```

This diagram represents a common workflow, not a guarantee that every model follows exactly these stages.

### The key distinction

Pretraining asks:

> Given the preceding tokens, what token should come next?

Supervised instruction tuning asks essentially the same mathematical question during causal language-model training, but on examples designed to demonstrate desired responses to instructions.

The fundamental next-token prediction machinery may remain unchanged. What changes is the training data, the sequence structure, the loss computation, and the distribution of behavior being optimized.

That is an important engineering insight: **a new behavioral objective does not always require a fundamentally new model architecture.**

## 7. Core Concepts

### 7.1 Supervised fine-tuning

Supervised fine-tuning (SFT) is a training stage in which a pretrained model is further optimized using labeled examples.

A labeled example contains an input and a target output. The target output provides the supervision signal.

For an instruction-following language model:

- The input may contain an instruction, conversation history, or contextual information.
- The target may contain an assistant response.
- The training objective encourages the model to assign higher probability to the target tokens under the supplied context.

SFT is a broad term. It can be used for instruction following, domain adaptation, structured extraction, classification through text generation, and other supervised tasks.

Not every SFT dataset is an instruction-tuning dataset.

### 7.2 Instruction tuning

Instruction tuning is a form of supervised fine-tuning that uses examples of instructions paired with responses to improve the model's ability to perform requested tasks.

Examples may include:

- Question answering.
- Summarization.
- Rewriting.
- Explanation.
- Information extraction.
- Code generation.
- Format-constrained responses.
- Multi-turn dialogue.

Instruction tuning is defined by the nature and purpose of its training examples, not by a unique neural network architecture.

### 7.3 SFT versus instruction tuning

The terms overlap substantially in practical usage.

| Dimension | Supervised fine-tuning | Instruction tuning |
|---|---|---|
| Meaning | Further training on labeled examples | SFT focused on following instructions |
| Training data | Depends on the target task | Typically instructions paired with demonstrations |
| Objective | Optimize for supervised targets | Optimize for demonstrated instruction-response behavior |
| Scope | Broad | More specific |
| Possible use | Domain adaptation, extraction, classification, dialogue | General-purpose or task-specific instruction following |

Instruction tuning should therefore be understood as a particular application of SFT, not as a completely separate optimization mechanism.

### 7.4 Instruction-response examples

A typical single-turn example has an instruction and a target response.

```json
{
  "instruction": "Summarize the following text in two sentences.",
  "input": "A long passage about renewable energy...",
  "output": "Renewable energy reduces dependence on fossil fuels. Its adoption depends on cost, infrastructure, and policy."
}
```

The exact schema varies by dataset and training pipeline.

Some examples contain an instruction and response only. Others include an additional input field, system instructions, conversation history, metadata, or multiple dialogue turns.

The data pipeline typically transforms the selected fields into the sequence format expected by the model.

### 7.5 Target behavior is encoded through examples

A training example does more than provide facts. It also demonstrates a response pattern.

For example, compare two responses to the same request:

**Request:** Explain caching to a junior engineer.

**Response A:** Caching is a performance optimization that stores reusable results to reduce repeated computation or access to slower systems.

**Response B:** Caching is a thing that makes things faster.

Both responses are related to the request, but they differ in precision and usefulness.

If a dataset consistently demonstrates precise, context-appropriate explanations, training can encourage similar response patterns. If it consistently demonstrates vague or misleading answers, the model may learn those patterns instead.

The model does not directly understand a dataset's abstract intention. It is optimized against the target tokens and the training objective.

### 7.6 The supervised objective

For a sequence of target tokens \(y_1, y_2, \ldots, y_T\), a causal language model typically minimizes token-level negative log-likelihood:

\[
\mathcal{L}_{\text{SFT}}
=
-\sum_{t=1}^{T}
\log P_\theta(y_t \mid x, y_{<t})
\]

Where:

- \(x\) is the conditioning context, such as an instruction and prior conversation.
- \(y_t\) is the target token at position \(t\).
- \(y_{<t}\) represents preceding target tokens.
- \(\theta\) represents the trainable model parameters.

This equation describes the basic objective. Real training pipelines may use masks, token weights, normalization, packing, and other implementation details.

The objective encourages the model to assign higher probability to the demonstrated response given its context.

It does not directly measure whether the response is factually correct, useful to a human, safe in every context, or preferable to every alternative.

### 7.7 Prompt tokens and target tokens

A critical implementation detail is deciding which tokens contribute to the loss.

Consider this formatted example:

```text
User: What is an API?

Assistant: An API is an interface that allows software
components to communicate through defined operations.
```

The model needs the user message as context. The assistant response is the target behavior being demonstrated.

In many instruction-tuning pipelines, loss is computed only over assistant response tokens, while user and system tokens are masked out of the loss.

Conceptually:

```text
User tokens:       [context; loss masked]
Assistant tokens:  [target; loss enabled]
```

This is a common pattern, not a universal rule. Some training configurations calculate loss over a larger portion of the sequence. Multi-turn examples may also require careful masking of tool outputs, user turns, and different assistant message types.

The mask must match the intended training objective.

If the wrong tokens contribute to the loss, the model may be optimized to imitate content that should have served only as context.

### 7.8 Full fine-tuning and parameter-efficient fine-tuning

SFT describes the training process, not a requirement to update every parameter.

Two common implementation strategies are:

**Full fine-tuning:** Update all, or nearly all, model parameters included in the optimization process.

**Parameter-efficient fine-tuning (PEFT):** Keep most base-model parameters frozen and train a smaller set of additional or selected parameters. Low-Rank Adaptation (LoRA) is a widely used example.

PEFT can reduce trainable parameter count and optimizer-state memory requirements. However, it still depends on the base model, training setup, and deployment environment. It is not automatically superior in final quality, latency, or total cost.

The choice is an engineering decision based on hardware, dataset size, target behavior, model access, quality requirements, and operational constraints.

A deeper treatment of fine-tuning methods and their implementation belongs in dedicated model-adaptation material rather than expanding this chapter into a separate optimization tutorial.

## 8. Internal Working

### 8.1 From dataset to trained model

A typical instruction-tuning pipeline contains the following stages.

```text
1. Prepare supervised examples
Instructions, context, demonstrations, and target responses
        ↓
2. Validate and format data
Quality checks, conversation templates, tokenization, and loss masks
        ↓
3. Run the forward pass
Predict token probabilities conditioned on the preceding sequence
        ↓
4. Compute supervised loss
Compare predicted probabilities with target tokens, respecting the loss mask
        ↓
5. Backpropagate and update
Calculate gradients and update trainable parameters
        ↓
6. Evaluate and select a checkpoint
Assess held-out performance, task quality, and behavioral regressions
```

This pipeline reuses the fundamental training loop described in Chapter 1. The important differences lie in the dataset's construction, sequence formatting, target selection, and evaluation criteria.

### 8.2 Sequence construction

Before training, raw examples must be converted into token sequences.

For example:

```text
System: You are a helpful technical assistant.
User: Explain dependency injection.
Assistant: Dependency injection is a design technique...
```

The actual model input is not necessarily this literal text. The tokenizer and chat template may introduce special tokens that mark message boundaries, roles, end-of-turn markers, or tool interactions.

These structural tokens matter because the model is trained on the representation produced by the preprocessing pipeline.

Using an incorrect template can change the context the model sees and the format it learns to generate.

Training and inference should therefore use compatible message-formatting conventions.

### 8.3 Forward pass and loss masking

The model processes the token sequence and produces a distribution over possible next tokens at each position.

For a target response, the training pipeline selects the positions that contribute to the objective.

A simplified view:

```text
Input sequence:
[system] [user] [question] [assistant] [response tokens]

Loss mask:
    0       0       0          0?       1  1  1  1
```

The question mark indicates that the exact treatment of the assistant-start marker depends on the implementation. Some templates include particular assistant prefix tokens in the loss; others do not.

The important point is that the mask is an explicit design decision.

For response-only SFT, context tokens are provided to the model but excluded from the supervised loss. Target tokens are used to calculate the loss.

### 8.4 Optimization

Once the loss is computed, automatic differentiation calculates gradients with respect to trainable parameters.

An optimizer then updates those parameters.

The process repeats across batches and training steps.

As training progresses, the model is encouraged to reproduce patterns found in the demonstrations, including:

- How it begins a response.
- How it organizes explanations.
- Which details it includes.
- How it follows requested formats.
- How it handles different categories of instructions.

These are tendencies learned from the training distribution, not deterministic rules enforced by SFT.

The model may still produce incorrect, incomplete, or inconsistent responses, particularly for requests that differ significantly from the examples it has seen.

### 8.5 Why dataset composition matters

Suppose a dataset contains thousands of examples of concise answers but very few examples requiring detailed reasoning or long-form explanations.

The resulting model may be more inclined toward concise responses. This does not mean it has acquired a hard-coded preference for short answers; rather, the supervised training signal provides much more evidence for that response pattern.

Similarly, a dataset dominated by one task category may improve behavior on that category while providing limited improvement elsewhere.

This is why instruction-tuning dataset design should consider:

- Task coverage.
- Diversity of instructions.
- Response quality.
- Response length and style.
- Difficulty and ambiguity.
- Edge cases.
- Conflicting or inconsistent demonstrations.
- Similarity between training examples and expected production requests.

The goal is not simply to maximize the number of examples. It is to provide reliable supervision for the behavior the deployed system needs.

## 9. Example or Practical Implementation

### 9.1 A minimal instruction-tuning example

Consider a dataset of three examples:

| Instruction | Target response |
|---|---|
| Explain an API to a beginner. | An API defines how software components communicate through agreed operations. |
| Summarize a paragraph in two sentences. | A concise summary containing the two most important points. |
| Return the result as JSON. | A response following the requested JSON structure. |

A training pipeline formats each example, tokenizes it, constructs target labels, applies the appropriate loss mask, and trains the model.

The same basic objective can be used across all three examples. The difference is in the demonstrated tasks and the target sequences.

### 9.2 Pseudocode for the training objective

The following pseudocode illustrates response-only supervised training. It is deliberately framework-independent and omits implementation details such as padding, mixed precision, gradient accumulation, and distributed execution.

```python
for batch in dataloader:
    input_ids = batch["input_ids"]
    labels = batch["labels"]

    # Labels contain target token IDs where loss is enabled
    # and an ignore index (commonly -100) elsewhere.

    outputs = model(input_ids=input_ids, labels=labels)
    loss = outputs.loss

    loss.backward()
    optimizer.step()
    optimizer.zero_grad()
```

The actual model implementation must correctly align labels with the causal language-model outputs. Many model libraries handle the one-token shift internally when labels are passed to the model, but this behavior must be verified for the specific implementation.

**Important engineering detail:** The `labels` tensor is not necessarily identical to `input_ids`. Positions excluded from loss are usually assigned the configured ignore index.

A mask that is constructed incorrectly can silently change what the model learns.

### 9.3 A small conceptual example of masking

Suppose the tokenized conversation is represented as:

```python
input_ids = [
    SYSTEM_TOKEN,
    USER_TOKEN,
    QUESTION_TOKEN_1,
    QUESTION_TOKEN_2,
    ASSISTANT_TOKEN,
    ANSWER_TOKEN_1,
    ANSWER_TOKEN_2,
]
```

For response-only training, the labels may conceptually look like:

```python
labels = [
    -100,
    -100,
    -100,
    -100,
    -100,
    ANSWER_TOKEN_1,
    ANSWER_TOKEN_2,
]
```

Here, `-100` represents a common ignore index in cross-entropy implementations. The exact value is framework-dependent.

This simplified example illustrates the masking principle, not a complete production-ready preprocessing implementation. Real pipelines must account for token shifts, special tokens, padding, multi-turn conversations, truncation, and the chat template.

### 9.4 What should be measured?

After training, do not evaluate success solely by checking whether training loss decreased.

Use a held-out evaluation set that represents the expected use cases.

Possible evaluation dimensions include:

- Instruction adherence.
- Factual correctness.
- Response completeness.
- Formatting compliance.
- Task-specific accuracy.
- Robustness to different phrasings.
- Regression on general capabilities.
- Safety-related behavior, where applicable.

Evaluation should include both representative examples and difficult cases. A model that memorizes the training demonstrations without generalizing will not necessarily perform well in production.

## 10. Production Perspective

### 10.1 SFT is one part of the model lifecycle

A production fine-tuning workflow generally involves more than launching a training job.

A typical lifecycle includes:

1. Define the target behavior and measurable requirements.
2. Collect or curate suitable examples.
3. Validate data quality, provenance, privacy, and usage rights.
4. Split data to support credible evaluation.
5. Select the base model and fine-tuning strategy.
6. Prepare templates, tokenization, labels, and masks.
7. Train and record reproducible experiment configurations.
8. Evaluate task performance and regressions.
9. Select and version a model checkpoint.
10. Deploy gradually and monitor real-world behavior.

The exact workflow depends on the model, data, risk profile, and deployment environment.

### 10.2 Dataset quality is an engineering responsibility

The model optimizes the supervision it receives. It does not automatically distinguish a high-quality demonstration from a misleading one.

Production datasets should therefore be reviewed for:

- Incorrect or contradictory responses.
- Duplicate or near-duplicate examples.
- Unrepresentative task distributions.
- Sensitive or unauthorized information.
- Data contamination between training and evaluation.
- Inconsistent response formatting.
- Unclear or ambiguous instructions.
- Unintended artifacts introduced by data generation.

Synthetic examples can be useful, but they require quality controls. Generating more examples does not guarantee better supervision.

### 10.3 Avoid evaluating only on training-style examples

A model may appear successful when evaluation examples closely resemble the training data.

Production requests may use different wording, contain incomplete context, combine multiple tasks, or require behavior that is underrepresented in the dataset.

Evaluation should test generalization to realistic variation rather than merely confirming that the model can reproduce familiar patterns.

### 10.4 Monitor behavioral regressions

Fine-tuning can improve a target task while weakening behavior elsewhere.

For example, a model tuned heavily on short customer-support responses might become less likely to provide detailed technical explanations. This is a possibility to test, not an inevitable result.

Maintain regression suites for critical behaviors and compare the tuned model against the base model or the currently deployed version.

### 10.5 Model adaptation versus external knowledge

SFT and retrieval solve different problems.

- **SFT** updates model parameters to shape behavior or specialize performance.
- **Retrieval-augmented generation (RAG)** supplies relevant external information at inference time.
- **Prompting** supplies instructions and context without updating model parameters.

If the primary requirement is to teach a stable response format or a domain-specific workflow, SFT may be useful.

If the primary requirement is to answer questions using frequently changing documents, retrieval may be a better fit.

If a clear prompt already meets the requirement reliably, fine-tuning may add unnecessary complexity.

These approaches can also be combined when their responsibilities are clearly separated.

## 11. Engineering Decisions and Trade-offs

### 11.1 When should you use SFT?

Consider SFT when there is a measurable behavioral gap that is difficult to close adequately through prompting or other simpler mechanisms.

Examples include:

- Repeated task-specific formatting requirements.
- Domain-specific response conventions.
- A stable instruction-following pattern.
- A specialized task with representative labeled examples.
- A need to adapt a base model to a particular class of interactions.

Before training, establish a baseline using the existing model and prompt. Otherwise, you may spend resources optimizing a problem that could be solved more simply.

### 11.2 When should you avoid SFT?

Avoid treating fine-tuning as the default solution for every model-quality problem.

It may be unnecessary or unsuitable when:

- The issue is primarily missing or changing factual knowledge.
- The task can already be handled reliably with prompting.
- There is insufficient high-quality supervised data.
- Evaluation criteria are not defined.
- The model cannot be adapted under the available licensing or access constraints.
- Training, serving, and maintenance costs outweigh the expected benefit.

### 11.3 Choosing a fine-tuning strategy

| Decision factor | Full fine-tuning | Parameter-efficient fine-tuning |
|---|---|---|
| Trainable parameters | Broad parameter updates | Smaller selected parameter set |
| Memory requirements | Generally higher | Often lower |
| Operational complexity | Depends on infrastructure and model | May simplify artifact storage and adaptation |
| Quality | Depends on model, data, and training | Depends on model, data, and method |
| Deployment | May require a dedicated checkpoint | May require loading or merging adapters |
| Best choice | When broad adaptation is justified and resources permit | When resource efficiency or multiple adaptations matter |

Neither strategy is universally best. Benchmark both when the expected benefit justifies the cost.

### 11.4 How much training is enough?

More training is not automatically better.

Insufficient training may fail to establish the desired behavior. Excessive training can increase overfitting or lead to regressions on tasks that are not adequately represented in the supervised dataset.

Choose checkpoints using held-out evaluation, not training loss alone. Monitor multiple task-specific metrics and regression tests, and retain a reproducible record of the selected checkpoint.

### 11.5 How should success be defined?

Define success before training.

For a structured extraction task, useful criteria might include schema validity, field-level precision and recall, and correct handling of missing information.

For instruction following, useful criteria might include adherence to constraints, completeness, factual correctness, and consistency across varied phrasings.

A lower loss indicates improved fit to the training objective. It does not, by itself, establish that the model is better for the target application.

## 12. Common Mistakes and Misconceptions

### Mistake 1: Treating SFT and instruction tuning as unrelated techniques

Instruction tuning is a form of SFT focused on instruction-response behavior. The terms overlap, and neither implies a unique architecture.

### Mistake 2: Assuming instruction tuning adds knowledge reliably

SFT can affect what the model recalls or expresses, but its objective is to fit supervised targets. It is not a guarantee of reliable knowledge acquisition or factual accuracy.

For changing or authoritative information, consider retrieval and external validation.

### Mistake 3: Training on the entire sequence without understanding the labels

The correct loss mask depends on the intended objective. Including user or system tokens unintentionally can change the training signal.

Inspect tokenized examples, labels, and masks before launching a large run.

### Mistake 4: Believing more examples always improve behavior

Low-quality, contradictory, duplicated, or poorly distributed examples can reduce the effectiveness of training.

Data quality and task coverage matter alongside quantity.

### Mistake 5: Using training loss as the only success metric

Training loss measures fit to the training objective. It does not directly measure user satisfaction, factual correctness, or robustness.

Use held-out evaluations and realistic behavioral tests.

### Mistake 6: Assuming the model will follow every demonstrated pattern

The model learns statistical patterns from its training distribution. Its outputs remain probabilistic and context-dependent.

Instruction tuning improves tendencies; it does not convert every demonstration into an enforceable rule.

### Mistake 7: Ignoring the training template

A mismatch between training-time and inference-time formatting can change the model's behavior.

Use compatible chat templates and test the actual serving path.

### Mistake 8: Using fine-tuning to compensate for missing retrieval

If the problem is that the model needs current internal documentation, repeatedly adding facts to a training dataset may create an expensive and difficult-to-maintain knowledge-update process.

Evaluate whether retrieval is a better fit.

### Mistake 9: Confusing instruction tuning with preference-based alignment

SFT generally learns from target demonstrations. Preference-based approaches use preference information to shape model behavior in a different way.

These techniques may appear in the same model-development pipeline, but they are not interchangeable. Preference-based training is covered in Chapter 5.

## 13. Interview Questions with Expected Answers

### Q1. What is supervised fine-tuning?

**Expected answer:** Supervised fine-tuning is additional training of a pretrained model using labeled examples. The model's parameters are updated to improve performance on the target task or behavior. For causal language models, this commonly involves minimizing next-token negative log-likelihood over selected target tokens.

### Q2. What is instruction tuning, and how does it relate to SFT?

**Expected answer:** Instruction tuning is a form of supervised fine-tuning that uses instructions paired with demonstrations of desired responses. SFT is the broader category; instruction tuning focuses on instruction-following behavior.

### Q3. Why might a pretrained model require instruction tuning?

**Expected answer:** Pretraining optimizes language-model prediction over its training distribution. Instruction tuning provides explicit examples of how the model should respond to requests, improving the likelihood of desired interaction patterns.

### Q4. Does instruction tuning require a new model architecture?

**Expected answer:** No. It commonly reuses the pretrained architecture and changes the supervised data, sequence formatting, target labels, and optimization process.

### Q5. Why are loss masks important in instruction tuning?

**Expected answer:** They determine which token positions contribute to the loss. In response-only SFT, the input provides context while the assistant response supplies the supervised target. Incorrect masks can cause the model to optimize unintended tokens.

### Q6. Does lower SFT loss prove that the model is better?

**Expected answer:** No. Lower loss indicates better fit to the specified training objective. It does not guarantee improved generalization, factual correctness, instruction adherence, or performance in production. Held-out evaluation is necessary.

### Q7. When would you choose RAG instead of fine-tuning?

**Expected answer:** RAG is often preferable when the model needs access to external, frequently changing, or source-grounded information. Fine-tuning is more appropriate when the goal is to shape recurring behavior or specialize a task. Both can be combined when needed.

### Q8. What is the difference between full fine-tuning and LoRA-based fine-tuning?

**Expected answer:** Full fine-tuning updates a broad set of model parameters, whereas LoRA introduces trainable low-rank adaptations while keeping most base parameters frozen. LoRA can reduce training memory and parameter-update costs, but its quality and deployment trade-offs depend on the task and implementation.

### Q9. How would you diagnose an instruction-tuned model that follows the training examples but fails on differently worded requests?

**Expected answer:** Investigate dataset diversity, near-duplicates, training and validation separation, overfitting, task coverage, prompt-template consistency, and evaluation quality. Test paraphrases and realistic edge cases, then adjust data composition or training settings based on the evidence.

### Q10. How would you decide whether SFT is worth the investment?

**Expected answer:** Define the behavioral gap, establish a baseline with prompting or the existing system, curate representative supervised examples, and evaluate candidate approaches against explicit quality and operational metrics. Proceed only if the measured benefit justifies training, deployment, and maintenance costs.

## 14. Quick Revision

- **Supervised fine-tuning:** Further training of a pretrained model using labeled examples.
- **Instruction tuning:** SFT that uses instruction-response demonstrations to shape instruction-following behavior.
- **Training objective:** Commonly next-token negative log-likelihood over selected target tokens.
- **Loss masking:** Controls which token positions contribute to the supervised objective.
- **Dataset design:** Determines which behaviors and task distributions the model is encouraged to reproduce.
- **Full fine-tuning:** Updates a broad set of model parameters.
- **PEFT:** Updates a smaller set of parameters or added components, often reducing training-resource requirements.
- **Evaluation:** Must measure generalization and target behavior, not just training loss.
- **RAG versus SFT:** Retrieval supplies external information; SFT updates parameters to shape learned behavior.
- **Limitation:** Instruction tuning improves behavioral tendencies but does not guarantee correctness or compliance in every situation.
- **Next topic:** Preference-Based Training and Alignment.

## 15. Key Takeaways

1. Pretraining and instruction tuning often use the same underlying causal language-model objective, but they differ in the data distribution and behavior being optimized.
2. Instruction tuning is a specific application of supervised fine-tuning, not a separate model architecture.
3. The quality and composition of demonstrations directly influence the supervision available to the model.
4. Loss masks are a fundamental part of the training objective and must be validated carefully.
5. A lower training loss does not prove that the model has become more useful or reliable.
6. Full fine-tuning and parameter-efficient fine-tuning represent different engineering trade-offs.
7. Fine-tuning should be justified through measurable improvements over simpler alternatives.
8. Instruction tuning, retrieval, prompting, and runtime validation address different problems and may be combined.
9. Demonstrated response patterns are learned tendencies, not guarantees.
10. SFT provides a foundation for understanding subsequent training stages, including preference-based alignment.

## 16. Further Reading

Use the following primary sources to deepen your understanding. Verify current documentation and publication details before incorporating specific implementation recommendations into a production system.

1. **InstructGPT — Training Language Models to Follow Instructions with Human Feedback**  
   https://arxiv.org/abs/2203.02155  
   Explains an instruction-following training pipeline that uses supervised demonstrations before subsequent preference-based training stages.

2. **FLAN — Finetuned Language Models Are Zero-Shot Learners**  
   https://arxiv.org/abs/2109.01652  
   Examines instruction tuning across a range of tasks and its effect on zero-shot generalization.

3. **FLAN-T5 — Scaling Instruction-Finetuned Language Models**  
   https://arxiv.org/abs/2210.11416  
   Studies instruction fine-tuning across task collections and model scales.

4. **LoRA — Low-Rank Adaptation of Large Language Models**  
   https://arxiv.org/abs/2106.09685  
   Introduces a parameter-efficient adaptation method that reduces the number of trainable parameters.

5. **Hugging Face Transformers Documentation**  
   https://huggingface.co/docs/transformers  
   Provides implementation guidance for model training, tokenization, data processing, and fine-tuning workflows.

6. **TRL Documentation**  
   https://huggingface.co/docs/trl  
   Covers training workflows for language models, including supervised fine-tuning and other post-training methods.

7. **Hugging Face PEFT Documentation**  
   https://huggingface.co/docs/peft  
   Explains parameter-efficient fine-tuning methods and their integration with model-training workflows.
