# 04 — Pretrained and Instruction-Tuned Models

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain what a pretrained language model is and why pretraining is important.
- Distinguish a base pretrained model from an instruction-tuned model.
- Explain why next-token prediction alone does not necessarily produce a model that reliably follows user instructions.
- Understand how instruction tuning changes a model's intended interaction behavior at a high level.
- Distinguish pretraining, instruction tuning, and inference-time prompting.
- Recognize why labels such as *base*, *instruct*, *chat*, and *aligned* require careful interpretation.
- Identify the practical implications of choosing between base and instruction-tuned models.
- Explain why instruction following does not guarantee factual accuracy, safety, or reliability.

## 2. Prerequisites

You should understand the following concepts from earlier chapters:

- Neural language models learn statistical patterns through trainable parameters.
- Modern LLMs commonly use large-scale pretraining.
- Model architecture and model purpose are different classification dimensions.
- Decoder-only language models can generate text autoregressively.

Recommended references:

- [02 — From Neural Language Models to Modern LLMs](02-From-Neural-Language-Models-to-Modern-LLMs.md)
- [03 — Modern Language Model Families](03-Modern-Language-Model-Families.md)

Detailed training objectives, optimization procedures, and alignment methods belong in [LLM-02 — Language Model Training and Learned Behavior](../LLM-02-Language-Model-Training-and-Learned-Behavior/README.md).

## 3. Estimated Reading Time

10–14 minutes.

## 4. Before We Start

Imagine giving two models the same input:

> Explain how a database index improves query performance. Use three bullet points and include one limitation.

Model A continues the text with a plausible passage about database indexes. Model B directly answers the question, follows the requested three-bullet format, and includes a limitation.

Both models may have learned from large text datasets. Both may use similar architectures. Yet their responses to the instruction can differ significantly.

Why?

The difference may come from how the models were trained and adapted, not simply from their architecture or size.

A base pretrained model learns broad statistical patterns from its training data. An instruction-tuned model receives additional training intended to improve its responses to instructions.

This distinction is foundational to modern LLM engineering because many applications require more than plausible text continuation. They require models to interpret requests, follow constraints, produce useful outputs, and interact consistently with users or software systems.

Instruction tuning helps address this need, but it does not eliminate the model's limitations.

## 5. What Is a Pretrained Language Model?

A pretrained language model is a model whose parameters have been learned from a substantial training process before it is used or adapted for a particular downstream application.

For many modern language models, pretraining involves learning to predict tokens from text. The exact objective depends on the model family and training design.

During training, the model processes examples, produces predictions, and updates its parameters to improve performance on the chosen objective.

Over many examples, the model can learn statistical regularities associated with language, including:

- Grammar and sentence structure.
- Common relationships between words and phrases.
- Writing styles and document structures.
- Associations between concepts.
- Patterns found in code or other training material, when included.
- Common ways information is expressed in the training data.

These learned patterns form a foundation that can be reused across many tasks.

### 5.1 What pretraining provides

Pretraining can produce a model with broad language-generation or language-representation capabilities, depending on its architecture and objective.

Rather than learning each downstream task independently from the beginning, an application can start with an existing pretrained model.

This creates an important engineering advantage: the same pretrained foundation may be adapted for multiple tasks.

For example, a pretrained model might later be adapted for instruction following, code generation, document summarization, or a specialized domain.

### 5.2 What pretraining does not guarantee

Pretraining does not automatically guarantee that a model will:

- Follow arbitrary user instructions.
- Respect every output-format constraint.
- Distinguish reliable facts from unsupported claims.
- Ask for clarification when a request is ambiguous.
- Refuse every unsafe or unauthorized request.
- Produce valid structured output consistently.
- Perform well on every downstream task.

A model's training objective influences what it learns to optimize. If the objective primarily rewards predicting tokens from training examples, that does not automatically teach every behavior expected of a useful assistant.

**A model can be effective at its pretraining objective without being a reliable instruction-following interface.**

## 6. What Is a Base Model?

The term *base model* commonly refers to a pretrained model before instruction tuning or comparable assistant-oriented adaptation.

A base model has learned patterns from its training data, but its behavior may be closer to general text continuation than to following an explicit conversational contract.

Consider this input:

```text
Question: Why do database indexes improve query performance?
Answer:
```

A base model might continue with a plausible answer. However, depending on its training and prompt format, it might also continue the document structure, generate additional questions, or produce text that does not directly satisfy the user's intended request.

The model is generating text conditioned on its context. It is not necessarily following an instruction in the same way an instruction-tuned assistant is designed to do.

### 6.1 Base models are not useless or unintelligent

A base model may generate coherent text, complete code, reproduce familiar formats, or perform well on certain tasks.

The distinction is not that base models cannot follow any instruction. They may demonstrate instruction-like behavior because they have encountered similar patterns in training.

The distinction is that instruction following has not necessarily been made a primary target of an additional adaptation stage.

### 6.2 Where base models may be useful

Base models can be useful when engineers need to:

- Conduct research into language-model behavior.
- Continue pretraining on additional domain data.
- Adapt a model using a custom training process.
- Experiment with specialized training objectives.
- Build a task-specific model where direct assistant behavior is not the primary requirement.

Their suitability depends on the intended task, available training resources, and expected behavior.

Starting from a base model can provide flexibility, but additional training may require substantial data, compute, expertise, and evaluation.

## 7. What Is an Instruction-Tuned Model?

An instruction-tuned model is a model that has undergone additional training intended to improve its ability to respond to instructions.

The training commonly uses examples that pair an instruction or request with a desired response. The exact datasets, formats, and optimization procedures vary by model.

For example:

**Instruction**

> Summarize the following incident report in three bullet points.

**Desired response**

- The service experienced elevated latency.
- The incident was caused by a database connection bottleneck.
- Connection-pool tuning and additional monitoring were introduced.

Training on many examples of instructions and appropriate responses can encourage the model to produce outputs that better match user intent.

At a high level, the process can be represented as:

```text
Pretrained model
       |
       v
Instruction-response examples
       |
       v
Additional training
       |
       v
Instruction-tuned model
```

This is a conceptual illustration, not a complete training pipeline. Real systems may use multiple adaptation stages, additional data types, preference-based methods, or other procedures.

### 7.1 What instruction tuning is intended to improve

Instruction tuning can improve a model's tendency to:

- Respond directly to a user's request.
- Follow explicit output constraints.
- Interpret common task instructions.
- Use conversational formats.
- Produce more useful responses for assistant-style interactions.
- Follow patterns represented in instruction-training examples.

The outcome depends on the quality and diversity of the training data, the model, and the training procedure.

Instruction tuning does not guarantee that every instruction will be followed correctly.

### 7.2 Instruction tuning is not the same as adding a prompt

Consider the following two approaches.

**Approach A — Inference-time prompting**

An engineer sends an existing model an instruction:

> Answer in exactly three bullet points.

The model receives the instruction as part of its input. Its parameters are not necessarily changed.

**Approach B — Instruction tuning**

A model is trained on many examples of instructions and desired responses. Its parameters are updated during training to improve the targeted behavior.

The difference is fundamental:

- Prompting changes the input supplied to the model.
- Instruction tuning changes the model's learned parameters through additional training.

Both can be used together. An instruction-tuned model can still benefit from a well-designed prompt.

## 8. Base Models Versus Instruction-Tuned Models

The following comparison captures the main conceptual differences.

| Dimension | Base pretrained model | Instruction-tuned model |
|---|---|---|
| Primary foundation | Learned patterns from pretraining | Pretrained foundation plus instruction-oriented adaptation |
| Typical behavior | General text continuation or task behavior learned during pretraining | More directly oriented toward following user instructions |
| Response format | May follow a requested format inconsistently | Often more likely to follow familiar formatting instructions |
| Conversational interaction | Depends on pretraining and input format | Commonly intended for assistant-style interaction |
| Further adaptation | Can be adapted for specialized objectives | Can also be further adapted for specialized objectives |
| Reliability | Not guaranteed | Not guaranteed |
| Factual accuracy | Depends on model and task | Instruction tuning does not guarantee factual accuracy |
| Safety | Depends on training and deployment controls | May include additional behavioral training, but is not inherently safe in every context |

The word *often* matters in this table. These are typical differences, not universal guarantees.

A base model may perform well on a specific benchmark. An instruction-tuned model may perform poorly on a task outside its strengths. A model's label is useful context, not sufficient evidence of its capabilities.

## 9. Why Instruction Following Is a Separate Engineering Goal

Generating plausible text and satisfying a user's intent are related but different requirements.

Consider this request:

> Return a JSON object containing `status` and `reason`. Do not include any text outside the JSON.

A model that generates a correct explanation followed by a sentence such as “Here is the requested JSON” has failed the output contract, even if the content is otherwise correct.

In an application, that extra sentence might break a parser or trigger a failed workflow.

Instruction following can therefore affect more than user experience. It can influence the reliability of downstream software components.

Examples of instruction-following requirements include:

- Producing a requested format.
- Respecting a requested scope.
- Using a specified language.
- Following task-specific response conventions.
- Providing an answer within defined constraints.

However, production systems should not rely solely on instruction tuning to enforce critical requirements.

If an application requires valid JSON, it should validate the output or use a structured-output mechanism where supported. If an operation requires authorization, the application must enforce authorization independently of the model's willingness to follow an instruction.

**Learned behavioral tendencies are not a substitute for deterministic application controls.**

## 10. Instruction Tuning and Alignment: Related but Different Concepts

Instruction tuning is often discussed alongside alignment, but the terms should not be treated as identical.

### 10.1 Instruction tuning

Instruction tuning aims to improve the model's responses to instructions by training on examples of desired input-output behavior.

Its focus is commonly on making a model more useful for tasks expressed through natural-language instructions.

### 10.2 Alignment

Alignment is a broader term that refers to efforts to make model behavior better match human intentions, preferences, policies, or other desired constraints.

Depending on the system, alignment-related work may involve:

- Instruction-response training.
- Preference data.
- Human or model feedback.
- Additional optimization procedures.
- Safety-oriented training and evaluation.
- Application-level policies and controls.

Not every model uses the same alignment process, and the label *aligned* does not specify a universal training recipe.

### 10.3 Why the distinction matters

Instruction following is only one aspect of desirable model behavior.

A model could follow instructions fluently while still providing incorrect information. It could satisfy a formatting request while misunderstanding the underlying task. It could respond helpfully in ordinary situations but behave poorly in an adversarial or unfamiliar scenario.

Therefore, an instruction-tuned model should not automatically be considered fully aligned, safe, or reliable.

Detailed training and alignment methods are covered in LLM-02. Behavioral limitations and failure analysis belong in [07 — Model Capabilities, Limitations, and Misconceptions](05-Model-Capabilities-Limitations-and-Misconceptions.md) and the later LLM-07 domain.

## 11. Understanding Model Labels

Model names and documentation often include labels such as *base*, *instruct*, *chat*, or *aligned*.

These labels can be useful, but their meanings are not perfectly standardized across providers.

### 11.1 Base

Usually indicates a pretrained model before instruction-oriented adaptation, though the exact meaning depends on the provider.

### 11.2 Instruct

Usually indicates that the model has been adapted to respond to instructions. The label does not establish which training method was used or how reliably the model follows instructions.

### 11.3 Chat

Usually indicates that the model is intended or adapted for conversational interaction. The exact conversational format and supported capabilities vary.

### 11.4 Aligned

Suggests that additional efforts were made to shape behavior toward certain objectives, preferences, or constraints. The label alone does not reveal the complete process or prove that the model is safe.

### 11.5 Read labels as clues, not guarantees

When evaluating a model, engineers should look beyond its name.

Relevant questions include:

- What does the provider say the model is intended to do?
- Is it a base model or has it undergone additional adaptation?
- What input and output formats are supported?
- What evaluation evidence is available?
- What limitations are documented?
- Does the model meet the application's requirements in representative tests?

These questions help avoid assuming that two similarly named models have equivalent behavior.

## 12. Practical Example: Choosing a Model for an Application

Suppose an engineering team is building an internal documentation assistant.

The system must:

1. Accept a natural-language question.
2. Retrieve relevant documentation.
3. Produce a concise answer.
4. Return a response in a defined structure.
5. Avoid presenting unsupported information as verified fact.

A base model might be a suitable starting point for a custom training experiment. However, if the immediate goal is to build an assistant that follows user instructions, an instruction-tuned model may be a more practical starting candidate.

The system might use the following workflow:

```text
User question
      |
      v
Application input validation
      |
      v
Retrieve relevant documentation
      |
      v
Construct model input
      |
      v
Instruction-tuned language model
      |
      v
Validate response format
      |
      v
Return answer or handle failure
```

This workflow is illustrative. The exact implementation depends on the application's requirements.

Several engineering principles emerge:

- Instruction tuning can improve the model's tendency to follow the requested response format.
- Retrieval can provide relevant source material, but it does not guarantee that the generated answer faithfully reflects that material.
- Output validation can catch malformed responses.
- Application-level access controls must operate independently of model instructions.
- Evaluation must measure actual task performance rather than assuming that the `instruct` label guarantees quality.

The choice between a base and an instruction-tuned model is therefore part of system design. It should be made according to the task, not based solely on the model's name.

## 13. Engineering Trade-offs

### 13.1 Flexibility versus ready-to-use behavior

A base model may offer a useful starting point for custom adaptation. An instruction-tuned model is often more convenient when the intended use is direct interaction with users.

However, a base model is not automatically more flexible in every practical sense, and an instruction-tuned model is not necessarily unsuitable for further adaptation.

### 13.2 Custom training cost versus behavioral starting point

Starting with a base model may require additional data preparation, training infrastructure, optimization, and evaluation to achieve the desired behavior.

Starting with an instruction-tuned model may reduce that initial effort, but the team must still verify performance for its specific workload.

### 13.3 Instruction compliance versus correctness

A model may follow the requested format while providing an incorrect answer. Conversely, a model may know relevant information but fail to satisfy a strict output requirement.

These are separate quality dimensions and should be evaluated separately.

### 13.4 Behavioral tendencies versus hard guarantees

Instruction tuning changes learned behavior; it does not turn a probabilistic language model into a deterministic policy engine.

Critical requirements—such as authorization, financial limits, database constraints, and schema validation—should be enforced through application logic and other appropriate controls.

## 14. Common Mistakes and Misconceptions

### Mistake 1: Assuming a base model cannot follow instructions

A base model may follow some instructions or reproduce familiar task formats because it learned relevant patterns during pretraining. Instruction tuning aims to make instruction-following behavior more consistent; it does not introduce the entire capability from nothing.

### Mistake 2: Assuming instruction tuning changes the architecture

Instruction tuning usually changes learned parameters through additional training. It does not necessarily change the model's underlying architecture.

### Mistake 3: Treating prompting and instruction tuning as equivalent

Prompting changes the input to a model. Instruction tuning updates model parameters during training. They operate at different stages and can complement each other.

### Mistake 4: Assuming instruction-tuned models are always more accurate

Instruction tuning targets behavior such as responding to instructions. It does not guarantee that factual claims, reasoning, or task-specific outputs are correct.

### Mistake 5: Treating every instruct or chat model as equivalent

Providers can use different data, training processes, templates, and objectives. The labels do not establish equivalent capabilities.

### Mistake 6: Assuming alignment is a single standardized procedure

Alignment is a broad concept covering different methods and goals. A model label alone does not describe the full process.

### Mistake 7: Trusting the model to enforce critical application rules

A model may fail to follow instructions. Authorization, validation, and other deterministic requirements must be enforced by the surrounding system.

## 15. Interview Questions with Expected Answers

### Q1. What is a base pretrained language model?

**Expected answer:** A model whose parameters have been learned through pretraining and that has not necessarily undergone instruction-oriented adaptation. Its behavior may be closer to general text continuation than to a consistently instruction-following assistant.

### Q2. What is instruction tuning?

**Expected answer:** An additional training stage intended to improve how a model responds to instructions, commonly using examples of instructions paired with desired responses. The exact methods vary by model.

### Q3. How does instruction tuning differ from prompting?

**Expected answer:** Prompting changes the input supplied to the model at inference time. Instruction tuning updates the model's parameters through additional training. Both can be used together.

### Q4. Does instruction tuning guarantee factual correctness?

**Expected answer:** No. It may improve the model's ability to respond appropriately to instructions, but correctness depends on the model, task, available information, and other factors. Evaluation and suitable system controls remain necessary.

### Q5. How are instruction tuning and alignment related?

**Expected answer:** Instruction tuning is one method for shaping model behavior. Alignment is broader and can include training, feedback, evaluation, and other mechanisms intended to make behavior better match desired objectives or constraints.

### Q6. Why should production systems validate model outputs?

**Expected answer:** Instruction-following behavior is probabilistic and can fail. Output validation helps detect malformed or unacceptable responses, while application-level controls enforce requirements that cannot safely depend on model compliance alone.

### Q7. When might an engineer start with a base model rather than an instruction-tuned model?

**Expected answer:** When the goal involves custom pretraining or adaptation, research, or a specialized objective for which a base model is an appropriate starting point. The decision depends on available data, compute, expertise, requirements, and evaluation results.

## 16. Quick Revision

Explain each of the following in your own words:

1. What does pretraining teach a language model at a high level?
2. Why might a base model continue text instead of directly following a user request?
3. What does instruction tuning aim to improve?
4. How is instruction tuning different from prompting?
5. Why is instruction following different from factual correctness?
6. Why are *base*, *instruct*, *chat*, and *aligned* imperfect descriptions of model behavior?
7. Which production requirements must be enforced independently of the model?
8. What evidence should support choosing an instruction-tuned model for an application?

## 17. Key Takeaways

- Pretraining develops a model's parameters using a broad training objective and dataset.
- A base model has not necessarily undergone instruction-oriented adaptation.
- Instruction tuning uses additional training to improve responses to instructions.
- Prompting changes the input at inference time, whereas instruction tuning changes learned parameters through training.
- Instruction tuning can improve usability without guaranteeing correctness, safety, or reliable behavior.
- Alignment is broader than instruction tuning, and the methods used vary across models.
- Model labels provide useful clues but do not replace documentation and task-specific evaluation.
- Production systems should validate outputs and enforce critical rules through appropriate application controls.
- Model choice should be based on the intended workload and evidence, not the assumption that one label guarantees quality.

## 18. Further Reading

1. **Ouyang et al. — Training language models to follow instructions with human feedback (2022).** A foundational paper on instruction following and reinforcement learning from human feedback.
2. **Wei et al. — Finetuned Language Models Are Zero-Shot Learners (2022).** Introduces FLAN and studies instruction tuning across tasks.
3. **Chung et al. — Scaling Instruction-Finetuned Language Models (2022).** Examines instruction tuning across model scales and task mixtures.
4. **Model documentation from the relevant provider.** Check the intended use, training descriptions, supported interfaces, and documented limitations of the specific model being considered.

These readings provide examples of instruction tuning and related methods. They should not be interpreted as a universal recipe used by every modern language model.

---

## Chapter Validation

- **Scope:** Explains pretrained and instruction-tuned models, their intended behavioral differences, common labels, and engineering implications.
- **Boundary control:** Detailed training and alignment procedures remain in LLM-02; detailed behavior and failure analysis remain in LLM-07; systematic model selection remains in LLM-10.
- **Practical relevance:** Includes a documentation-assistant example and separates learned behavior from application-level guarantees.
- **Navigation:** Relative links follow the planned curriculum hierarchy and should be checked against the repository before merging.
- **Review status:** Draft prepared for review; repository link targets and rendered Markdown have not been independently verified.
