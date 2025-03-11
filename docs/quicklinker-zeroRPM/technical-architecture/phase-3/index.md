# Phase 3: Simulate Real-World Chaos

> *Breaking things intentionally to build unbreakable systems*

## Project Overview

**Objective:** Systematically introduce failures into our URL shortener architecture.

**Why This Matters:** Failure stories are compelling evidence of production readiness, and controlled chaos testing proves we understand real-world systems.

## Implementation Journey

### 1. Controlled Failure Scenarios

- **Implementation:** Use chaos-mesh to randomly terminate Redis instances and Kubernetes pods
- **Simulation Parameters:**
  - Random service terminations
  - Network latency between Kafka and database
  - Memory pressure scenarios
- **Key Learning:** Identifying failure modes and unexpected dependencies

### 2. Impact Measurement and Analysis

- **Key Questions to Answer:**
  - How many clicks are lost if Kafka is down for 5 minutes?
  - Does our retry logic work as expected under pressure?
  - What is the recovery time for different failure scenarios?
- **Documentation:** Create a comprehensive resilience report with quantitative metrics
- **Key Learning:** Quantifying resilience in meaningful business terms

### 3. Cost vs. Reliability Trade-off

- **Experiment:** Replace Redis with Node.js in-memory cache
- **Expected Outcome:** Document the spectacular failure modes
- **Analysis Points:**
  - Performance comparison under normal conditions
  - Behavior during node failures
  - Memory consumption patterns
  - Data loss scenarios
- **Key Learning:** Understanding when cutting costs creates unacceptable reliability risks

## Expected Outcomes

By the end of Phase 3, we will have:
- A battle-tested URL shortener architecture
- Documented evidence of system behavior during various failure modes
- Quantified resilience metrics that demonstrate production readiness
- A deep understanding of the trade-offs between cost, complexity, and reliability