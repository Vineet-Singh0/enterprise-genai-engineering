# 06 — Model Access, Distribution, and Open Weights

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain the main ways engineers access and use language models.
- Distinguish hosted model APIs from self-hosted and locally deployed models.
- Explain what model weights are and why access to weights matters.
- Distinguish open-weight models from open-source software and fully open model development.
- Understand the differences between accessing model weights, source code, training data, and usage rights.
- Identify the operational trade-offs associated with hosted and self-hosted models.
- Recognize why availability, access conditions, and licensing are separate from model capabilities.
- Understand the engineering implications of model distribution without turning distribution labels into a substitute for technical and legal review.

## 2. Prerequisites

You should understand:

- The major families of modern language models.
- The distinction between a model's architecture and its intended purpose.
- The difference between pretrained and instruction-tuned models.
- The importance of evaluating a model against application requirements.

Recommended references:

- [03 — Modern Language Model Families](03-Modern-Language-Model-Families.md)
- [04 — Pretrained and Instruction-Tuned Models](04-Pretrained-and-Instruction-Tuned-Models.md)
- [05 — Model Capabilities, Limitations, and Misconceptions](05-Model-Capabilities-Limitations-and-Misconceptions.md)

This chapter focuses on access and distribution. Systematic model selection belongs in [LLM-10 — Model Selection and Ecosystem Decisions](../LLM-10-Model-Selection-and-Ecosystem-Decisions/README.md).

## 3. Estimated Reading Time

10–14 minutes.

## 4. Before We Start

Suppose an engineering team wants to integrate an LLM into an internal enterprise application.

The team finds three models with potentially suitable capabilities:

- Model A is available through a provider's hosted API.
- Model B allows developers to download its weights and run it on their own infrastructure.
- Model C provides downloadable weights under a license that imposes specific restrictions on use and redistribution.

All three may be useful for language generation. Yet they differ significantly in how the team can access, operate, and govern them.

With Model A, the team primarily integrates a service. With Model B, the team can operate the model within its own environment, subject to its technical and contractual conditions. With Model C, the team must also understand the applicable license restrictions before deciding how to deploy or distribute it.

These differences affect architecture, infrastructure, data handling, operational responsibility, and long-term flexibility.

**A model's capabilities tell you what it may be able to do. Its distribution and access model determine how you can obtain and operate it.**

These are separate dimensions of an engineering decision.

## 5. What Does Model Access Mean?

Model access describes how a developer or application obtains the ability to use a model.

For modern LLMs, access commonly takes several forms:

1. Hosted API access.
2. Downloadable model weights.
3. Locally deployed models.
4. Models operated on self-managed cloud or on-premises infrastructure.
5. Managed deployment offerings that provide some combination of model access and infrastructure management.

These options are not always mutually exclusive. A model provider might offer both a hosted API and downloadable weights, while another provider might support only hosted access.

Access should also be distinguished from ownership. Using a model through an API does not mean the customer owns the underlying model weights. Downloading weights does not automatically grant unrestricted rights to use, modify, or redistribute them.

A useful starting point is to separate three questions:

- **Availability:** Can the team obtain access to the model?
- **Operation:** Where and how will inference run?
- **Rights:** What is the team permitted to do with the model and its associated materials?

A complete engineering assessment needs answers to all three.

## 6. Hosted Model APIs

A hosted model API allows an application to send requests to a provider-operated service and receive model outputs.

Conceptually:

```text
Application
     |
     v
API request
     |
     v
Provider-operated service
     |
     v
Model inference
     |
     v
API response
     |
     v
Application
```

The provider manages the underlying inference environment, although the exact division of responsibility depends on the service agreement and product.

### 6.1 How API access works

An application typically:

1. Obtains credentials or another supported authentication mechanism.
2. Constructs a request containing the input and relevant configuration.
3. Sends the request to the provider's endpoint.
4. Receives the generated output or an error.
5. Handles the result within its own application workflow.

The provider may manage hardware, model loading, infrastructure scaling, and serving software.

The application team still needs to manage its own request handling, credentials, retries, input validation, error handling, and application-level observability.

### 6.2 Advantages

Hosted APIs can offer:

- Lower initial infrastructure-management effort.
- Access to provider-managed model updates.
- Simplified integration with existing applications.
- Reduced responsibility for GPU provisioning and model serving.
- Access to models that may be difficult or expensive to operate independently.

These advantages can be particularly useful when a team wants to validate a product idea before investing in its own serving infrastructure.

### 6.3 Limitations and trade-offs

Hosted access can introduce:

- Usage-based costs or other provider pricing arrangements.
- Dependence on network connectivity.
- Provider-specific APIs and interfaces.
- Service quotas, rate limits, or availability constraints.
- Limited control over the underlying serving environment.
- Dependence on provider policies and model availability.
- Data-handling and contractual considerations.

The provider may change model versions, deprecate endpoints, or revise service terms. The application must be designed to handle relevant changes rather than assuming that an external service remains unchanged indefinitely.

### 6.4 What hosted access does not imply

Using a hosted API does not automatically establish that:

- The model is open source.
- The model weights are available to the customer.
- The service satisfies every data-residency requirement.
- The model is available indefinitely.
- The provider has the same operational or legal obligations under every plan.

These properties must be determined from the specific service documentation and applicable agreements.

## 7. Downloadable Weights and Self-Hosted Models

Some models provide downloadable weights that can be used to run inference in an environment controlled by the developer or organization.

This creates a different operating model.

```text
Model repository or provider
             |
             v
      Download weights
             |
             v
  Prepare runtime environment
             |
             v
      Load the model
             |
             v
       Run inference
             |
             v
       Application
```

The weights contain learned numerical parameters that the model uses during inference. They are a major component of the trained model, but a working deployment also requires compatible software and sufficient computational resources.

Depending on the model and its distribution, the team may additionally need tokenizer files, configuration files, model-specific code, or other supporting assets.

### 7.1 What self-hosting means

Self-hosting means the organization operates the model-serving environment itself, whether on a local machine, a cloud virtual machine, a GPU server, or its own data center.

Self-hosting does not necessarily mean operating entirely without a cloud provider. An organization can self-host a model on rented cloud infrastructure while retaining responsibility for the model-serving stack.

The key distinction is operational responsibility, not simply the physical location of the hardware.

### 7.2 Advantages

Self-hosted models may offer:

- Greater control over the inference environment.
- More flexibility in integrating custom serving software.
- Potentially greater control over network boundaries and data flow.
- The ability to customize or adapt the model when permitted and technically supported.
- More control over model versioning and rollout timing.
- The option to optimize serving for a known workload.

These benefits are conditional. Downloadable weights do not automatically provide every form of customization or unrestricted use.

### 7.3 Operational responsibilities

Self-hosting transfers more responsibility to the engineering team.

The team may need to manage:

- CPU, GPU, memory, and storage capacity.
- Model downloads, integrity, and versioning.
- Runtime and dependency compatibility.
- Model loading and serving.
- Concurrency and request scheduling.
- Latency and throughput.
- Monitoring and failure recovery.
- Security updates and infrastructure access.
- Capacity planning and cost management.

A model that can run on one machine during experimentation may not meet production throughput or latency requirements without additional infrastructure.

### 7.4 Self-hosting is not automatically cheaper

Hosted APIs can have significant usage costs, while self-hosting requires infrastructure and operational effort.

A fair comparison should consider total operating cost rather than hardware cost alone.

For a self-hosted deployment, relevant costs may include:

- Compute and accelerator rental or ownership.
- Idle capacity.
- Storage and networking.
- Engineering and operational labor.
- Reliability measures and redundancy.
- Model optimization and upgrades.

The economics depend on workload volume, utilization, model size, latency requirements, infrastructure prices, and operational maturity.

This chapter introduces the distinction; systematic model and deployment comparisons belong in LLM-10 and later production-engineering modules.

## 8. What Are Model Weights?

Model weights are the learned numerical parameters used by a neural network.

During training, optimization changes these parameters to improve the model's performance on its training objective. During inference, the model uses the resulting parameters to compute outputs from its inputs.

At a high level:

```text
Training data
     |
     v
Training process
     |
     v
Learned parameters
     |
     v
Model weights + supporting assets
     |
     v
Inference runtime
     |
     v
Generated output
```

This is a simplified representation. The full model artifact may include additional components required to load and run the model correctly.

### 8.1 Why access to weights matters

If the weights are downloadable and the applicable terms permit the intended use, developers may be able to operate the model outside the original provider's hosted inference service.

Depending on the model, this can support:

- Local experimentation.
- Self-hosted inference.
- Integration with custom serving infrastructure.
- Certain forms of fine-tuning or adaptation.
- More control over deployment versions.

Access to weights does not automatically provide the original training dataset, complete training pipeline, or the ability to reproduce the model's development process.

### 8.2 Weights are not the same as source code

A model's weights contain learned parameter values. Source code describes executable logic or implementation.

These are different artifacts.

For example, a distribution may provide:

- Weights without the complete training code.
- Inference code without the training dataset.
- Model configuration files and tokenizer assets.
- Training code but not the original training data.
- Documentation and evaluation results without downloadable weights.

Engineers should identify which artifacts are actually available rather than assuming that access to one implies access to all the others.

## 9. Open-Weight Models Versus Open-Source Models

The terms *open weights* and *open source* are often used together, but they should not be treated as interchangeable.

### 9.1 Open-weight models

An open-weight model generally makes its trained weights available for download under specified terms.

This can allow developers to inspect the available artifacts, run the model themselves, and potentially adapt or redistribute it when the applicable license permits.

However, the term *open weights* does not, by itself, tell you:

- Whether the training data is available.
- Whether the complete training code is available.
- Whether all supporting assets are available.
- Whether redistribution is permitted.
- Whether commercial use is permitted.
- Whether there are restrictions based on users, scale, or use cases.
- Whether the training process can be reproduced.

These details depend on the actual distribution and license.

### 9.2 Open-source software

Open-source software is generally distributed under a license that grants specified rights to use, inspect, modify, and redistribute the software.

The Open Source Initiative's definition and approved licenses provide a reference for understanding open-source software.

A language model distribution is more complicated than an ordinary software package because it may contain several distinct artifacts:

- Inference software.
- Model weights.
- Tokenizer assets.
- Training code.
- Training datasets.
- Documentation and evaluation materials.

The availability and licensing of these artifacts may differ.

Therefore, a model that publishes downloadable weights should not automatically be described as fully open source.

### 9.3 Fully open model development

A more comprehensive form of openness may include access to multiple parts of the development process, such as training data, training code, model weights, documentation, and evaluation information.

Even then, the exact scope of openness must be examined carefully. Some datasets may have separate licenses, and certain training details may remain unavailable.

There is no safe basis for inferring full reproducibility or unrestricted use merely from the presence of downloadable weights.

### 9.4 A practical comparison

| Property | Hosted API | Open-weight distribution | More comprehensively open development |
|---|---|---|---|
| Inference access | Through a provider service | Can often run locally or on self-managed infrastructure | Depends on available artifacts and infrastructure |
| Downloadable weights | Not necessarily | Typically yes | Typically included |
| Training code | Not necessarily available | May be unavailable | More likely to be available |
| Training data | Not necessarily available | May be unavailable | May be available, subject to dataset terms |
| Custom deployment | Depends on provider offerings | Often possible if permitted and technically supported | Often possible if the required artifacts and rights are available |
| Usage restrictions | Service terms and applicable agreements | Model-specific license or terms | Licenses may apply separately to different artifacts |

The last column is a conceptual description, not a guarantee that every artifact is unrestricted or fully reproducible.

The important principle is to assess actual access and rights rather than relying on broad labels.

## 10. Access, Licensing, and Usage Rights Are Different

Model availability is a technical question. Permission to use or redistribute a model is a legal and contractual question.

An engineer may be able to download model weights but still need to follow restrictions on how they are used.

Depending on the specific model and license, relevant conditions may include:

- Whether commercial use is allowed.
- Whether modified weights can be redistributed.
- Whether attribution or notices are required.
- Whether there are restrictions on particular use cases.
- Whether additional terms apply above certain usage thresholds.
- Whether the license covers the weights, software, and other artifacts equally.

These conditions vary by distribution. This chapter does not provide legal advice or establish the terms for any particular model.

Before using a model in a production system, the organization should review the relevant license and agreements with the appropriate legal or compliance stakeholders.

**Downloadability establishes that an artifact can be obtained. It does not, by itself, establish unrestricted permission to use it.**

## 11. Deployment Patterns at a Glance

Model access and deployment are related but separate decisions.

Common deployment patterns include the following.

### 11.1 Provider-hosted inference

The application sends requests to an externally operated service.

```text
Application ──API──> Provider service ──> Model
```

The provider manages much of the serving infrastructure. The application team manages integration and its own operational controls.

### 11.2 Self-hosted inference on cloud infrastructure

The organization deploys model weights and serving software on cloud compute that it manages.

```text
Application
     |
     v
Organization-managed model endpoint
     |
     v
Cloud compute + model runtime + weights
```

The cloud provider supplies infrastructure, but the organization manages more of the serving stack.

### 11.3 Local inference

A model runs on a local machine, workstation, or other nearby compute environment.

```text
Local application
       |
       v
Local inference runtime
       |
       v
Local model weights
```

Local inference can be useful for experimentation, offline workflows, or selected privacy-sensitive applications. Feasibility depends on the model's computational requirements and the available hardware.

### 11.4 Managed deployment of downloadable models

Some platforms provide managed infrastructure for deploying models whose weights are available separately.

In this case, the organization may have more model-level flexibility than with a provider-only API while delegating some infrastructure management to the platform.

The exact responsibilities depend on the service.

These patterns illustrate a spectrum of operational responsibility rather than a strict choice between “cloud” and “local.”

## 12. Engineering Trade-offs

The access and distribution model affects several engineering dimensions.

### 12.1 Operational control versus operational burden

Self-hosting can provide greater control over model versions and runtime configuration, but it also increases responsibility for infrastructure and serving reliability.

Hosted APIs reduce some operational burdens but make the application more dependent on a provider's service, interface, and availability.

### 12.2 Flexibility versus integration effort

Downloadable weights can enable custom deployment and certain forms of adaptation, subject to the model's technical design and license.

Hosted APIs may offer simpler integration but fewer options for modifying the underlying model or its serving environment.

### 12.3 Data handling versus provider dependency

Self-hosting can give an organization greater control over where inference runs and how data flows through its infrastructure.

However, privacy and security do not follow automatically from self-hosting. Access controls, logging, storage, network configuration, and operational practices still matter.

Similarly, hosted services should be assessed using their actual data-handling terms and configuration options rather than assumptions about all providers.

### 12.4 Predictable control versus evolving services

Self-hosting can make model-version management more explicit, although the organization must maintain the deployment.

Hosted services may provide managed upgrades and improvements, but model availability and behavior can change under provider-defined policies.

The correct approach depends on the application's requirements for stability, flexibility, and maintenance.

## 13. Production Engineering Example

Consider an enterprise team developing an internal document assistant.

The team has two candidate deployment approaches.

**Option A: Hosted API**

The application sends questions and relevant document excerpts to a provider-operated model endpoint.

Potential advantages:

- Faster initial integration.
- Less responsibility for model-serving infrastructure.
- Access to provider-managed inference.

Questions to investigate:

- What data-handling terms apply?
- How are credentials managed?
- What are the service's availability and rate limits?
- How are model updates and endpoint deprecations handled?
- What are the expected costs at the projected workload?

**Option B: Self-hosted open-weight model**

The team deploys downloadable weights within its managed cloud environment.

Potential advantages:

- More direct control over the inference environment.
- Greater flexibility in serving configuration.
- Potentially more control over data flow and model versioning.

Questions to investigate:

- Does the license permit the intended enterprise use?
- Can the model meet latency and throughput requirements?
- What GPU or other compute resources are needed?
- Who maintains the runtime, security updates, and scaling?
- What monitoring and failure-recovery mechanisms are required?

Neither option is inherently better.

The decision depends on the team's technical requirements, data-handling obligations, workload, operational capabilities, licensing conditions, and cost model.

The next step is not to choose based on the label *open* or *hosted*. It is to collect evidence and compare the actual options against the system's requirements.

## 14. Common Mistakes and Misconceptions

### Mistake 1: Assuming hosted APIs are always closed models

A provider may offer a hosted API for a model whose weights are also downloadable. API availability and weight availability are separate properties.

### Mistake 2: Assuming downloadable weights mean unrestricted use

A model can provide downloadable weights while imposing license or usage restrictions. The applicable terms must be reviewed.

### Mistake 3: Treating open weights as equivalent to open source

Open-weight availability does not establish that the source code, training data, and complete development process are available under open-source terms.

### Mistake 4: Assuming self-hosting is automatically cheaper

Infrastructure, idle capacity, operational labor, redundancy, and maintenance all contribute to total cost.

### Mistake 5: Assuming self-hosting guarantees privacy

The deployment environment can give an organization greater control, but actual privacy and security depend on implementation and operational practices.

### Mistake 6: Assuming model weights are the entire deployment

A usable deployment may also require tokenizer assets, configuration files, a compatible runtime, sufficient hardware, and supporting software.

### Mistake 7: Assuming access to weights means access to training data

Training data may be unavailable, partially disclosed, or governed by separate terms.

### Mistake 8: Assuming an open-weight model can always be modified and redistributed

The specific license determines which activities are permitted. Technical capability does not imply legal permission.

## 15. Interview Questions with Expected Answers

### Q1. What is the difference between a hosted model API and a self-hosted model?

**Expected answer:** A hosted API exposes model inference through a provider-operated service, while self-hosting means the organization operates the inference environment itself. Hosted access generally reduces infrastructure-management responsibility, whereas self-hosting offers more operational control but requires more engineering work.

### Q2. What are model weights?

**Expected answer:** Model weights are learned numerical parameters used by a neural network during inference. They represent an important part of the trained model, but a working deployment may also need supporting assets and compatible software.

### Q3. Why are open weights not necessarily the same as open-source software?

**Expected answer:** Open weights make trained parameters available, while open-source status concerns rights to use, inspect, modify, and redistribute software under qualifying terms. A model distribution may provide weights without providing the complete source code, training data, or equivalent rights for every artifact.

### Q4. Does downloading a model mean it can be used commercially?

**Expected answer:** Not necessarily. Commercial use depends on the specific license and any applicable terms. The organization must review those conditions before deploying the model for a commercial purpose.

### Q5. Why might an enterprise choose self-hosting?

**Expected answer:** It may want greater control over the inference environment, model versions, data flow, or serving configuration. The trade-off is responsibility for infrastructure, scaling, security, monitoring, and maintenance.

### Q6. Why might an enterprise choose a hosted API?

**Expected answer:** A hosted API can reduce the initial operational burden and provide access to managed inference infrastructure. The team must still assess provider dependency, data-handling terms, pricing, availability, and interface changes.

### Q7. What should an engineer verify before deploying an open-weight model?

**Expected answer:** The applicable license, intended-use permissions, required model artifacts, hardware requirements, runtime compatibility, performance, security requirements, and operational support needed for the workload.

### Q8. Is a self-hosted model necessarily more private than a hosted model?

**Expected answer:** No. Self-hosting can provide greater control over data flow, but privacy depends on the complete implementation. A hosted service may also offer appropriate protections depending on its actual terms and configuration.

## 16. Quick Revision

Explain the following without referring to the chapter:

1. What does model access mean?
2. How does hosted API access differ from self-hosting?
3. What are model weights, and what other artifacts may be required to run a model?
4. Why are open weights not equivalent to full open-source model development?
5. Why must licensing be considered separately from technical availability?
6. What responsibilities does self-hosting introduce?
7. Why is self-hosting not automatically cheaper or more private?
8. What evidence would you collect before choosing between a hosted API and an open-weight deployment?

## 17. Key Takeaways

- Model access describes how an application obtains the ability to use a model.
- Hosted APIs and self-hosted deployments differ in operational responsibility and control.
- Model weights are learned parameters, not necessarily the complete set of artifacts required for deployment.
- Open-weight availability does not automatically establish open-source status or unrestricted use.
- Training data, source code, weights, supporting assets, and usage rights are distinct properties.
- Licensing and contractual conditions must be checked for the specific distribution.
- Self-hosting provides potential control benefits but introduces infrastructure, reliability, security, and maintenance responsibilities.
- Hosted APIs can simplify integration but introduce provider dependency and service-specific constraints.
- Deployment choice should reflect workload, cost, operational maturity, data requirements, and permitted use.
- Distribution labels are useful starting points, not substitutes for technical and legal due diligence.

## 18. Further Reading

1. **Open Source Initiative — The Open Source Definition.** A reference for understanding open-source software and its licensing principles.
2. **Hugging Face documentation on model repositories and model cards.** Useful for understanding common model artifacts, distribution practices, and model documentation.
3. **The license and usage documentation for the specific model under consideration.** Use the actual license and applicable terms to verify permitted use, modification, and redistribution.
4. **The provider's API and deployment documentation.** Verify service access, operational requirements, model availability, and data-handling conditions.
5. **The relevant model's technical documentation.** Check required artifacts, runtime compatibility, hardware expectations, and documented limitations.

These resources support further investigation. Actual access rights and deployment conditions must be determined from the documentation for the specific model and service.

---

## Chapter Validation

- **Scope:** Covers hosted API access, self-hosting, model weights, open-weight distribution, licensing distinctions, and deployment implications.
- **Boundary control:** Does not provide a full model-selection framework or detailed serving implementation; those belong in LLM-10 and later production-engineering modules.
- **Engineering relevance:** Includes a comparison of hosted and self-hosted deployment approaches for an enterprise document assistant.
- **Navigation:** Relative links follow the planned curriculum hierarchy and should be checked against the repository before merging.
- **Review status:** Draft prepared for review; repository link targets and rendered Markdown have not been independently verified.
