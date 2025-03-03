# Phase 2: Introduce Asynchronous Workflows

> *Handling high-volume write operations with timeseries data*

## Project Overview

**Objective:** Add an analytics dashboard to our URL shortener.

**Why This Matters:** This phase forces us to handle high-write workloads using timeseries data, a common challenge in production systems.

## Implementation Journey

### 1. Naive Approach (The Learning Experience)

- **Implementation:** Write analytics directly to PostgreSQL on every redirect
- **Expected Result:** Performance degradation and potential system crashes under load
- **Key Learning:** Understanding the limitations of synchronous write operations at scale

### 2. Optimization with Event Streaming

- **Implementation:** Buffer clicks in Kafka → batch insert into TimescaleDB
- **Architecture Benefits:**
  - Decoupling of redirect and analytics services
  - Improved system resilience
  - Enhanced throughput for write operations
- **Key Learning:** Effective patterns for handling high-volume events

### 3. Resilience Testing

- **Challenge:** Measure how many clicks can be buffered during a Kafka broker outage
- **Metrics to Track:**
  - Buffer capacity and limitations
  - Recovery time after service restoration
  - Data integrity throughout the failure scenario
- **Key Learning:** Understanding the resilience characteristics of our event streaming architecture

## Expected Outcomes

By the end of Phase 2, we will have:
- A functional analytics dashboard providing insights into URL usage
- A resilient architecture that can handle high-write workloads
- Empirical data on system behavior during component failures
- Expertise in implementing and optimizing asynchronous workflows