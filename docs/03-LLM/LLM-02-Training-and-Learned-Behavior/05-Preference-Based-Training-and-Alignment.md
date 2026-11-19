# 05 — Preference-Based Training and Alignment

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain why supervised fine-tuning alone may not fully capture human preferences.
- Distinguish supervised demonstrations from preference comparisons.
- Explain the role of preference data in shaping language-model behavior.
- Understand the conceptual foundations of Reinforcement Learning from Human Feedback (RLHF).
- Describe the major stages of a traditional RLHF pipeline.
- Explain the purpose of reward models and how they differ from language models.
- Understand the high-level objectives of Proximal Policy Optimization (PPO) and Direct Preference Optimization (DPO).
- Compare preference-based training approaches and their engineering trade-offs.
- Identify limitations involving preference quality, reward misspecification, reward hacking, and alignment evaluation.
- Reason about when preference-based training is justified in a production model-development workflow.

## 2. Prerequisites

This chapter builds on:

- Next-token prediction and language-model optimization.
- Supervised fine-tuning and instruction tuning.
- Training and validation methodology.
- Model parameters, gradients, and loss functions.
- The distinction between learned behavior and guaranteed runtime behavior.

Relevant curriculum topics include:

- LLM-02, Chapter 1 — Language Model Training Foundations and Objectives
- LLM-02, Chapter 3 — Training Dynamics, Generalization, and Overfitting
- LLM-02, Chapter 4 — Supervised Fine-Tuning and Instruction Tuning

## 3. Estimated Reading Time

Approximately 15 minutes.

## 4. Before We Start

Consider the following user request:

> Explain how database indexes work to a junior software engineer.

A supervised fine-tuning dataset might contain this demonstration:

**Target response:**

A database index is a data structure that helps a database locate records without scanning the entire table. It can improve query performance, although indexes require storage and can increase the cost of writes.

This is a reasonable response. But there are many other reasonable responses. Some may be easier for beginners to understand, more technically precise, better structured, or more appropriately concise.

Supervised fine-tuning teaches a model to reproduce target responses. It does not, by itself, directly specify how to rank every possible response against every alternative.

Now imagine presenting two responses to a human evaluator:

- **Response A:** Technically correct, concise, and appropriate for a junior engineer.
- **Response B:** Technically correct but unnecessarily complex, full of unexplained terminology, and difficult for a beginner to follow.

The evaluator prefers Response A.

This comparison provides a different kind of supervision. Instead of specifying one exact target response, it identifies which of two responses is preferred under a particular evaluation context.

Preference-based training uses this kind of signal to influence the model's behavior.

The central question is:

**How can we train a model to prefer responses that are more useful, reliable, and appropriate when many possible responses could satisfy the same request?**

The answer involves preference data, objectives that use preference comparisons, and careful evaluation of whether the resulting behavior matches the intended goals.

## 5. Why This Exists

### 5.1 The limitations of a single supervised target

SFT commonly optimizes a model to assign higher probability to the demonstrated target tokens given their context.

For a given prompt, however, many different responses may be acceptable.

For example, an explanation could be:

- Correct but too long.
- Concise but incomplete.
- Helpful but poorly organized.
- Fluent but factually incorrect.
- Accurate but unsuitable for the intended audience.
- Appropriate in one context but inappropriate in another.

A single reference response does not necessarily capture all these distinctions.

A model can also achieve a low supervised loss while retaining behaviors that evaluators consider undesirable. The relationship between token-level training loss and human judgments of response quality is indirect.

### 5.2 Preferences provide comparative supervision

A preference dataset can record that one response is preferred over another for the same prompt.

For example:

| Prompt | Preferred response | Less-preferred response |
|---|---|---|
| Explain database indexes to a beginner. | Accurate explanation using simple language and a useful example. | Accurate explanation overloaded with unexplained technical terminology. |
| Summarize a report in three bullets. | Three relevant, concise bullets. | A long paragraph that ignores the requested format. |
| Explain an uncertain technical claim. | Clearly distinguishes known facts from uncertainty. | Presents an unsupported conclusion with excessive confidence. |

These comparisons provide information about relative quality.

They do not necessarily identify a single objectively correct answer. Human judgments can vary, and preferences depend on context, evaluator instructions, and the criteria being assessed.

### 5.3 The distinction between imitation and preference optimization

SFT primarily learns from demonstrations of desired outputs.

Preference-based training learns from information about which outputs are preferred over alternatives.

These objectives are related, but they are not identical.

```text
**Supervised fine-tuning**
“Given this instruction, learn to produce this demonstrated response.”
**Preference-based training**
“Given this instruction and these alternatives, learn to favor the preferred response.”
```

Many model-development pipelines use SFT before preference-based training. SFT provides an instruction-following starting point, while preference optimization can further shape response quality.

This sequence is common, not mandatory for every approach.

## 6. Mental Model

Imagine training a technical writer.

First, you provide examples of well-written technical explanations. The writer studies their structure, style, and content. This resembles supervised fine-tuning.

Next, you show the writer two possible explanations and ask which one better satisfies a set of requirements. Over many comparisons, the writer receives information about the relative quality of different outputs.

This second stage resembles preference-based training.

The analogy has an important limitation: language models do not automatically internalize abstract human values simply because they receive preference labels. They optimize a mathematical objective constructed from the available data and training procedure.

The quality of the resulting behavior depends on the quality of the preference signal, the model, the objective, and the evaluation process.

## 7. Core Concepts

### 7.1 Preference data

Preference data associates a prompt or context with multiple candidate responses and a judgment about their relative desirability.

A simple pairwise record might contain:

```json
{
  "prompt": "Explain what an API is to a beginner.",
  "chosen": "An API defines how software components communicate through agreed operations.",
  "rejected": "API is a thing used by programmers. It makes software work."
}
```

The `chosen` and `rejected` fields are illustrative dataset conventions, not a universal schema.

The preference label indicates that one response was favored under the evaluation criteria. It does not prove that the preferred response is perfect or that the rejected response is always unacceptable.

Preference data can come from human judgments, expert evaluations, model-assisted judgments, or combinations of these sources. Each source introduces different reliability and bias considerations.

### 7.2 What makes a useful preference?

A useful preference comparison should provide a meaningful distinction between candidate responses.

For example, evaluators might compare responses using criteria such as:

- Factual accuracy.
- Relevance to the prompt.
- Completeness.
- Clarity.
- Appropriate level of detail.
- Instruction adherence.
- Safety.
- Calibration of uncertainty.

If evaluators use inconsistent criteria, the dataset may contain conflicting signals.

A response preferred for brevity in one task may be inadequate when the task requires detailed reasoning. A refusal may be appropriate for one request but unhelpful for a legitimate request that only superficially resembles it.

Preference judgments must therefore be interpreted in context.

### 7.3 Alignment

In language-model development, alignment broadly refers to efforts to make model behavior better match intended goals, instructions, preferences, or constraints.

The term covers multiple methods and objectives. It does not refer to one universal algorithm, and it does not imply that a model is guaranteed to behave correctly in every situation.

Preference-based training is one family of methods used in alignment workflows.

Alignment also involves factors beyond training, including evaluation, deployment constraints, access controls, monitoring, and system-level safeguards.

### 7.4 Reward models

In a traditional RLHF pipeline, a reward model learns to score candidate responses according to preference data.

Given a prompt \(x\) and response \(y\), a reward model may produce a scalar score:

\[
r_\phi(x,y)\in\mathbb{R}
\]

Where:

- \(x\) is the prompt or context.
- \(y\) is a candidate response.
- \(r_\phi\) is the learned reward function.
- \(\phi\) represents reward-model parameters.

The score represents the reward model's learned assessment under its training objective. It is not an objective measurement of universal response quality.

A reward model is distinct from the language model that generates responses, although both are learned neural networks and their roles can be implemented in different ways.

### 7.5 Reinforcement Learning from Human Feedback

Reinforcement Learning from Human Feedback (RLHF) is a family of approaches that use human feedback to guide model optimization.

A widely known traditional pipeline consists of:

1. Supervised fine-tuning of a pretrained language model.
2. Collection of preference comparisons for candidate responses.
3. Training of a reward model from those comparisons.
4. Optimization of the language model using a reinforcement-learning algorithm and the learned reward signal.

PPO is one algorithm historically used for the policy-optimization stage.

This is an important reference architecture, not a requirement for every preference-based method. DPO, for example, uses preference pairs to optimize the policy directly without requiring a separately trained reward model and an online PPO loop in its standard formulation.

### 7.6 Proximal Policy Optimization

Proximal Policy Optimization (PPO) is a policy-gradient reinforcement-learning algorithm designed to limit overly large policy updates through a clipped surrogate objective.

In language-model training, the policy is the model that generates tokens. Optimization seeks to improve the reward obtained from generated responses while controlling changes to the policy.

In RLHF implementations, the objective commonly includes a penalty or constraint related to divergence from a reference policy. This helps prevent the optimized model from drifting too far from its starting behavior.

PPO does not eliminate reward misspecification, guarantee human preference satisfaction, or ensure that the optimized model generalizes well.

Its implementation also introduces operational complexity involving rollouts, reward scoring, optimization stability, memory usage, and training orchestration.

A full mathematical treatment of PPO belongs in reinforcement-learning material rather than this introductory chapter.

### 7.7 Direct Preference Optimization

Direct Preference Optimization (DPO) is a method that uses preference pairs to optimize a language model directly, without the traditional separate reward-model training stage followed by a PPO policy-optimization loop.

At a conceptual level, DPO uses the relationship between the policy, a reference policy, and chosen-versus-rejected responses to construct a preference-based training objective.

A commonly presented form of the DPO loss is:

\[
\begin{aligned}
\mathcal{L}_{\mathrm{DPO}}(\theta)
= -\mathbb{E}_{(x,y_w,y_l)}
\bigg[
\log \sigma\bigg(
\beta \bigg[
&\log \frac{\pi_\theta(y_w\mid x)}
{\pi_{\mathrm{ref}}(y_w\mid x)}\\
-&\log \frac{\pi_\theta(y_l\mid x)}
{\pi_{\mathrm{ref}}(y_l\mid x)}
\bigg]
\bigg)
\bigg]
\end{aligned}
\]

Where:

- \(x\) is the prompt.
- \(y_w\) is the preferred response.
- \(y_l\) is the less-preferred response.
- \(\pi_\theta\) is the policy being trained.
- \(\pi_{\mathrm{ref}}\) is the reference policy.
- \(\sigma\) is the sigmoid function.
- \(\beta\) controls the strength of the preference objective relative to the reference-policy relationship.

The equation is a standard conceptual form; implementations can differ in reduction, masking, and other details.

The key intuition is that DPO adjusts the model to increase the relative likelihood of preferred responses compared with less-preferred responses, while accounting for a reference policy.

DPO is not simply supervised fine-tuning with a different dataset. Its objective explicitly compares chosen and rejected responses.

### 7.8 Preference optimization versus supervised learning

SFT and preference-based methods both update model parameters through optimization. The important difference is the supervision signal and objective.

| Dimension | SFT | Preference-based training |
|---|---|---|
| Primary supervision | Demonstrated target responses | Relative preference between candidate responses |
| Typical data | Prompt and target output | Prompt, preferred response, less-preferred response |
| Learning signal | Fit the demonstrated target tokens | Favor preferred responses relative to alternatives |
| Common objective | Token-level negative log-likelihood | Preference-derived objective |
| Main limitation | Demonstrations may not fully capture relative quality | Preferences can be noisy, biased, or incomplete |

Neither method is universally better. The appropriate approach depends on the target behavior, available data, evaluation requirements, and operational constraints.

## 8. Internal Working

### 8.1 Traditional RLHF pipeline

A common high-level architecture is:

```text
**Pretrained language model**
Broad language capabilities learned during pretraining
        ↓
**Supervised fine-tuning**
Learn instruction-response patterns from demonstrations
        ↓
**Preference collection**
Compare multiple responses for the same prompt or context
        ↓
**Reward-model training**
Learn a scoring function from preference comparisons
        ↓
**Policy optimization**
Use reinforcement learning to improve reward while controlling policy drift
        ↓
**Evaluation and deployment selection**
Validate desired behavior and detect regressions
```

The stages may be repeated or modified depending on the training approach. In particular, DPO-based workflows can use preference data without following the reward-model-plus-PPO sequence.

### 8.2 Collecting candidate responses

For a given prompt, a model or set of models generates multiple candidate responses.

For example:

```text
Prompt:
Explain the difference between authentication and authorization.

Candidate A:
Authentication verifies who a user is. Authorization determines
what that user is allowed to access.

Candidate B:
Authentication and authorization are security concepts used
by applications to manage users and access.
```

An evaluator might prefer Candidate A because it expresses the distinction more precisely.

The quality of the comparison depends on the evaluator's instructions, expertise, context, and ability to recognize the relevant differences.

Candidate generation also affects what can be learned. If all candidates are nearly identical, the dataset may provide little useful information about important behavioral trade-offs.

### 8.3 Learning a reward function

In a common pairwise reward-model formulation, the probability that response \(y_w\) is preferred to \(y_l\) can be modeled as:

\[
P(y_w \succ y_l \mid x)
=
\sigma\left(r_\phi(x,y_w)-r_\phi(x,y_l)\right)
\]

This formulation associates a higher reward score with the preferred response.

The reward model is trained to assign scores that are consistent with the observed comparisons. It may generalize to unseen responses, but that generalization is imperfect and depends on the training data and model.

The score should not be interpreted as a calibrated probability of correctness unless a separate calibration process establishes that interpretation.

### 8.4 Optimizing the language model

In the traditional RLHF pipeline, the language model generates responses that receive scores from the reward model. A reinforcement-learning algorithm updates the language model to improve the expected reward.

A simplified conceptual objective is:

\[
\max_\theta
\mathbb{E}_{y\sim\pi_\theta(\cdot\mid x)}
\left[r_\phi(x,y)\right]
-
\lambda D_{\mathrm{KL}}
\left(\pi_\theta\Vert\pi_{\mathrm{ref}}\right)
\]

Where:

- The first term represents expected reward.
- The divergence term penalizes deviation from a reference policy.
- \(\lambda\) controls the strength of that penalty.

This expression captures a common design principle, not the full PPO objective or every implementation detail.

Without suitable constraints and evaluation, optimizing a learned reward can produce undesirable behavior. The model may learn to exploit weaknesses in the reward function rather than improve the qualities humans intended to measure.

### 8.5 Direct optimization from preference pairs

DPO changes the training workflow.

Instead of first training a separate reward model and then running a conventional reinforcement-learning policy-optimization loop, DPO uses preference pairs directly in a derived objective involving the trainable policy and a reference policy.

This can simplify parts of the training pipeline. However, DPO still requires careful dataset construction, correct loss computation, suitable reference-model handling, and robust evaluation.

It does not remove the underlying problems of noisy preferences, distribution shift, or imperfect alignment objectives.

## 9. Example or Practical Implementation

### 9.1 A small preference dataset

Suppose a team wants to improve the quality of technical explanations.

It collects the following examples:

```json
[
  {
    "prompt": "Explain caching to a junior engineer.",
    "chosen": "Caching stores reusable results so repeated requests can be served faster.",
    "rejected": "Caching is a complicated computer thing that makes things faster."
  },
  {
    "prompt": "Explain caching to a junior engineer.",
    "chosen": "Caching can reduce latency and backend load, but stale entries and invalidation must be handled carefully.",
    "rejected": "Caching always makes systems faster and has no meaningful downside."
  }
]
```

These examples demonstrate several preferences:

- Clear language over vague language.
- Technical usefulness over oversimplification.
- Recognition of trade-offs over unsupported absolutes.

However, two examples are not enough to establish robust behavior. A production dataset would need broader coverage, reliable annotation, representative tasks, and a carefully designed evaluation process.

### 9.2 How the methods use the data

**SFT approach**

Choose a target response for each example and train the model to predict its target tokens.

**Preference-based approach**

Use the chosen and rejected responses to train an objective that favors the preferred response relative to the alternative.

Both methods require appropriate tokenization, sequence formatting, loss computation, and evaluation. Their principal difference is the objective being optimized.

### 9.3 A diagnostic exercise

Imagine that preference optimization improves evaluator scores for concise answers but reduces the model's performance on tasks requiring detailed technical explanations.

Possible causes include:

- Preference data overrepresents brevity.
- Evaluators reward concision without sufficiently penalizing missing details.
- The evaluation set does not cover long-form tasks adequately.
- The optimization objective encourages a behavior that generalizes too broadly.
- The model has lost some useful behavior from its starting checkpoint.

Do not assume the first explanation is correct. Inspect the dataset, training configuration, evaluation results, and response examples to determine what actually happened.

This is the type of investigation expected in production model development.

## 10. Production Perspective

### 10.1 Preference quality is a data-engineering problem

Preference-based training depends on the quality of the judgments used as supervision.

A production pipeline should define:

- What each evaluator is being asked to optimize.
- How ambiguous comparisons are handled.
- Whether evaluators have sufficient domain expertise.
- How disagreement is measured.
- How annotation quality is reviewed.
- How data provenance and permitted use are documented.
- How duplicates and conflicting labels are detected.
- How the evaluation set is kept separate from training data.

A large volume of preference labels does not guarantee a reliable signal.

### 10.2 Human preferences are not a single universal objective

Different users may value different properties.

For example, a response appropriate for an expert engineer may be unsuitable for a beginner. A short answer may be ideal for a simple question but inadequate for a high-risk technical decision.

Preference collection should therefore define the relevant task context and evaluation criteria.

When objectives conflict, such as brevity versus completeness, the training and evaluation design must make the intended trade-off explicit.

### 10.3 Reward misspecification

A reward model approximates patterns in the preference data. It can fail to capture important properties that were absent, poorly represented, or inconsistently labeled.

Suppose evaluators consistently favor responses that sound confident. A reward model may learn to favor confident wording even when the answer is uncertain or incorrect.

This is an example of a mismatch between the measured signal and the actual goal.

Reward optimization can amplify such mismatches, which is why reward-model evaluation and independent behavioral testing matter.

### 10.4 Reward hacking

Reward hacking occurs when a model finds a way to obtain a high reward without achieving the intended outcome.

For example, if a reward model disproportionately rewards long responses, a policy may produce unnecessary detail to increase its score.

If a reward model rewards superficial signs of helpfulness, a policy may learn those patterns without becoming more accurate or useful.

The central engineering problem is not merely maximizing the reward. It is ensuring that the reward remains a useful proxy for the desired behavior under optimization.

### 10.5 Evaluation must remain independent

Use evaluation methods that are not simply repetitions of the reward-model training signal.

Depending on the application, this can include:

- Expert review.
- Held-out preference comparisons.
- Task-specific correctness tests.
- Instruction-following benchmarks.
- Adversarial and edge-case testing.
- Regression testing against earlier checkpoints.
- Production monitoring and incident analysis.

Automated reward scores can be useful, but they should not be the sole evidence that a model has become safer, more reliable, or more helpful.

### 10.6 Training alignment does not replace system controls

Preference-based training changes model behavior; it does not enforce every application requirement.

A production system may still need:

- Authentication and authorization.
- Input and output validation.
- Tool permission boundaries.
- Data-access controls.
- Policy enforcement.
- Audit logging.
- Rate limits.
- Human escalation.
- Monitoring and incident response.

The model's learned preferences and the system's enforceable controls serve different purposes.

## 11. Engineering Decisions and Trade-offs

### 11.1 SFT, RLHF, and DPO

| Dimension | SFT | Traditional RLHF with reward model and PPO | DPO |
|---|---|---|---|
| Main supervision | Target demonstrations | Preferences, learned reward, and policy optimization | Preference pairs |
| Separate reward model | Not required | Typically required | Not required in the standard formulation |
| Reinforcement-learning loop | Not required | Used in the policy-optimization stage | Not required in the standard formulation |
| Engineering complexity | Often the simplest | Typically higher | Often simpler than a full reward-model-plus-PPO pipeline |
| Main benefit | Learns demonstrated task behavior | Optimizes policy against a learned reward signal | Optimizes preference behavior directly from comparisons |
| Key limitation | Target demonstrations may not capture relative preferences | Reward misspecification and optimization complexity | Noisy preferences and objective limitations remain |

This comparison is conceptual. Actual complexity depends on infrastructure, training scale, libraries, and implementation choices.

### 11.2 When is preference-based training justified?

Consider it when:

- A meaningful gap remains after supervised fine-tuning.
- Relative quality matters more than reproducing one reference response.
- You can obtain reliable preference data.
- The desired behavior can be evaluated.
- The expected improvement justifies additional training and maintenance.
- You can monitor regressions and failure modes.

Do not adopt preference optimization simply because it is a popular stage in model-development pipelines. Establish a baseline and identify the problem it is expected to solve.

### 11.3 When should you avoid it?

It may not be justified when:

- Prompting or SFT already meets requirements.
- Preference judgments are too noisy or inconsistent.
- Evaluation criteria are vague.
- The desired outcome is factual retrieval rather than response preference.
- The team lacks the resources to evaluate and maintain the trained model.
- The optimization process would introduce complexity without measurable benefit.

### 11.4 How should the method be selected?

A reasonable engineering process is:

1. Define the behavioral problem.
2. Establish a baseline using the current model.
3. Determine whether SFT can address the problem.
4. If relative response preferences remain important, collect representative comparisons.
5. Select a suitable preference-optimization approach.
6. Evaluate against independent criteria.
7. Compare quality improvements with training and serving costs.
8. Deploy only after regression and risk testing.

The objective is not to use the most sophisticated training technique. It is to choose the simplest approach that meets the requirements reliably.

## 12. Common Mistakes and Misconceptions

### Mistake 1: Assuming human preference labels are objective truth

Preference judgments depend on context, evaluator instructions, expertise, and subjective priorities. They are supervision signals, not universal truth labels.

### Mistake 2: Assuming a reward model measures actual helpfulness

A reward model estimates a learned score based on its training data and objective. Its scores may correlate with desirable behavior but can also encode biases or miss important qualities.

### Mistake 3: Believing that a higher reward guarantees better responses

A model can exploit weaknesses in its reward function. Independent evaluation is necessary to check whether reward improvements correspond to real improvements.

### Mistake 4: Treating RLHF and DPO as identical

Traditional RLHF with a reward model and PPO uses a multi-stage workflow. DPO directly optimizes a preference-derived objective using a policy and reference policy. Both use preference information, but their training procedures differ.

### Mistake 5: Assuming DPO eliminates all alignment problems

DPO can simplify the optimization pipeline, but it does not remove noisy labels, dataset bias, distribution shift, or the difficulty of defining good behavior.

### Mistake 6: Collecting preferences without defining evaluation criteria

Without clear criteria, evaluators may make inconsistent judgments. The resulting training signal can be difficult to interpret and may encourage unintended trade-offs.

### Mistake 7: Optimizing one behavioral metric in isolation

Improving concision, style, or evaluator preference may degrade factual accuracy, completeness, or performance on other tasks. Track multiple relevant metrics and test for regressions.

### Mistake 8: Assuming training alignment guarantees runtime safety

Model training cannot replace authorization, validation, access controls, monitoring, or other enforceable application safeguards.

## 13. Interview Questions with Expected Answers

### Q1. Why might preference-based training be useful after SFT?

**Expected answer:** SFT teaches a model to reproduce demonstrated target responses, but one target does not capture all relative quality distinctions. Preference-based training uses comparisons between responses to guide the model toward outputs that evaluators prefer.

### Q2. What is a reward model?

**Expected answer:** A reward model is a learned function that assigns scores to responses given their context. In traditional RLHF, it is trained from preference comparisons and provides a reward signal for policy optimization. Its scores are approximations, not objective measures of correctness.

### Q3. Describe a traditional RLHF pipeline.

**Expected answer:** A common pipeline begins with a pretrained model, applies supervised fine-tuning, collects preference comparisons, trains a reward model, and then optimizes the language model using a reinforcement-learning algorithm such as PPO. The resulting model is evaluated before deployment.

### Q4. What is the role of PPO in RLHF?

**Expected answer:** PPO is a policy-gradient algorithm used to optimize the language model against a reward signal while constraining policy updates through a clipped objective. RLHF implementations often also control divergence from a reference policy. PPO does not eliminate reward misspecification.

### Q5. How does DPO differ from traditional RLHF?

**Expected answer:** DPO uses chosen and rejected responses to optimize the language model directly through a preference-derived objective involving a reference policy. Its standard formulation avoids the separate reward-model training and PPO policy-optimization loop used in traditional RLHF.

### Q6. What is reward hacking?

**Expected answer:** Reward hacking occurs when a model learns to exploit weaknesses in its reward function to obtain high scores without achieving the intended outcome. It demonstrates why reward optimization must be paired with independent evaluation and careful reward design.

### Q7. Why can preference data be inconsistent?

**Expected answer:** Evaluators may have different priorities, expertise, or interpretations of the instructions. Preferences may also depend on context, and ambiguous examples can produce disagreement. Annotation guidelines, quality review, and explicit task criteria help reduce inconsistency.

### Q8. How would you investigate a model whose reward scores improve while factual accuracy declines?

**Expected answer:** Audit reward-model behavior, preference data, evaluator criteria, and candidate responses. Evaluate factual accuracy independently, check for reward hacking and distribution shifts, compare against earlier checkpoints, and revise the training or evaluation setup based on evidence.

### Q9. When would you choose SFT instead of preference optimization?

**Expected answer:** SFT is often appropriate when high-quality target demonstrations can establish the desired behavior and relative preference information is unnecessary. Preference optimization becomes more relevant when ranking alternative responses captures important quality distinctions that demonstrations alone do not adequately represent.

### Q10. Does preference-based training guarantee alignment?

**Expected answer:** No. It improves behavior relative to a learned objective derived from preferences. The quality of that objective is limited by the data, evaluation criteria, model, and training procedure. Runtime controls and independent evaluation remain necessary.

## 14. Quick Revision

- **Preference data:** Comparisons that indicate which of multiple responses is preferred in a given context.
- **Alignment:** A broad set of methods intended to bring model behavior closer to specified goals, preferences, or constraints.
- **Reward model:** A learned function that scores candidate responses based on its training objective.
- **RLHF:** A family of methods that uses human feedback to guide model optimization.
- **Traditional RLHF pipeline:** Often combines SFT, preference collection, reward-model training, and reinforcement-learning policy optimization.
- **PPO:** A policy-gradient method used in some RLHF pipelines.
- **DPO:** Directly optimizes a preference-derived objective using chosen and rejected responses, without a separate reward-model-plus-PPO loop in its standard formulation.
- **Reward misspecification:** A mismatch between the reward objective and the behavior actually desired.
- **Reward hacking:** Exploiting a reward function to obtain high scores without achieving its intended goal.
- **Evaluation:** Must independently test whether improvements in the training objective translate into desirable behavior.
- **Production principle:** Learned preferences do not replace enforceable system controls.
- **Next topic:** How Training Shapes Learned Behavior.

## 15. Key Takeaways

1. SFT learns from demonstrated target responses; preference-based training learns from relative judgments about alternative responses.
2. Human preference labels are useful but imperfect supervision signals.
3. Traditional RLHF commonly uses a reward model and reinforcement-learning policy optimization.
4. PPO is one possible policy-optimization algorithm, not a requirement for every alignment method.
5. DPO provides a direct way to optimize preference comparisons without the traditional separate reward-model-plus-PPO loop.
6. Reward models approximate preference patterns and can fail to represent the intended goal accurately.
7. Reward optimization can amplify weaknesses in the reward function, making independent evaluation essential.
8. Preference-based training should be justified by measurable improvements over simpler approaches.
9. SFT, preference optimization, retrieval, and runtime safeguards address different problems.
10. No training method guarantees that a model will behave correctly in every context.

## 16. Further Reading

Use these primary papers and official documentation to deepen your understanding. Verify implementation details against the current versions of the relevant libraries before using them in production.

1. **Training Language Models to Follow Instructions with Human Feedback (InstructGPT)**  
   https://arxiv.org/abs/2203.02155  
   Describes an instruction-following workflow that includes supervised demonstrations, preference comparisons, reward modeling, and reinforcement-learning optimization.

2. **Proximal Policy Optimization Algorithms**  
   https://arxiv.org/abs/1707.06347  
   Introduces PPO and its clipped policy-optimization objective.

3. **Direct Preference Optimization: Your Language Model is Secretly a Reward Model**  
   https://arxiv.org/abs/2305.18290  
   Presents the DPO objective and its relationship to preference-based policy optimization.

4. **Deep Reinforcement Learning from Human Preferences**  
   https://arxiv.org/abs/1706.03741  
   Studies learning reward functions from human preference comparisons in reinforcement-learning settings.

5. **Hugging Face TRL Documentation**  
   https://huggingface.co/docs/trl  
   Provides implementation resources for supervised fine-tuning, preference optimization, and reinforcement-learning-based language-model training.

