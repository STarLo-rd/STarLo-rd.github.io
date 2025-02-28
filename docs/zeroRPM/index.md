# QuickLinker-ZeroRPM

> **Zero infrastructure cost, infinite scalability.**

## Project Overview

QuickLinker-ZeroRPM is a high-performance URL shortener designed to handle enterprise-scale traffic with minimal infrastructure costs. This project demonstrates how to build resilient, scalable systems using lightweight technologies and smart caching strategies.

## Core Goals

| Objective | Target | Strategy |
|-----------|--------|----------|
| **Cost Efficiency** | $0/month infrastructure | Self-hosted SQLite database |
| **Scalability** | 100k RPM (requests per minute) | Optimized caching & efficient I/O |
| **Reliability** | 99.9% uptime | Multi-layer redundancy & failover |
| **Learning Focus** | Production-ready scaling | Exploring cost vs. performance trade-offs |

## Project Outline

### Core Features
- Shorten URLs with unique codes
- Redirect users with low latency
- Track basic analytics (Phase 2)
- Survive infrastructure failures (Phase 3)

### Non-Functional Requirements
- **Latency**: <50ms for redirects (cached)
- **Durability**: No data loss during failures
- **Cost**: $0/month at scale (self-hosted SQLite)

## Use Cases

| User Story | Phase | Technical Implementation |
|------------|-------|--------------------------|
| **"As a user, I want to shorten URLs quickly."** | Phase 1 | Optimized write operations (PostgreSQL → SQLite) |
| **"As a user, I want reliable redirects."** | Phase 1 | Redis caching for frequently accessed URLs |
| **"As an admin, I want analytics on link clicks."** | Phase 2 | High-throughput analytics pipeline (Kafka → TimescaleDB) |
| **"As an engineer, I want to test system resilience."** | Phase 3 | Chaos engineering (simulated failures, network partitions) |

## Technical Architecture

```
Phase 1 Goal: MVP → Do we need HA? → No → Use PostgreSQL/SQLite
                        ↓
Phase 2 Goal: Analytics → Time-series data → Use TimescaleDB (PostgreSQL extension)
                        ↓
Phase 3 Goal: Chaos Testing → Simulate failure → Use Redis + LiteFS
```

### Phase 1: Minimum Viable Scaling
- **Frontend**: REST API built with Node.js/Express
- **Database**: Migration from PostgreSQL to SQLite
- **Cache Layer**: Redis for hot URL caching
- **Deployment**: Single-node server architecture

### Phase 2: Analytics Pipeline
- **Data Pipeline**: Kafka for event streaming
- **Analytics Storage**: TimescaleDB for time-series data
- **Visualization**: Next.js dashboard with Chart.js

### Phase 3: Resilience Engineering
- **Chaos Testing**: Chaos Mesh for fault injection
- **Data Replication**: LiteFS for SQLite replication
- **Recovery Systems**: Automated failover protocols

## Implementation Roadmap

### Phase 1: Core Platform
1. Implement basic URL shortening with PostgreSQL
2. Integrate Redis caching for performance optimization
3. Transition database from PostgreSQL to SQLite + LiteFS
4. Conduct load testing up to 100 req/s

### Phase 2: Analytics System
1. Implement click tracking with direct PostgreSQL writes
2. Add Kafka for asynchronous write batching
3. Optimize with SQLite WAL for write-ahead logging
4. Develop analytics dashboard for metrics visualization

### Phase 3: Resilience Testing
1. Simulate and mitigate Redis failure scenarios
2. Test Kafka/SQLite failover mechanisms
3. Replace Redis with in-memory Node.js cache
4. Document performance findings and scaling insights

## Expected Outcomes

Upon completion, QuickLinker-ZeroRPM will demonstrate:

- Handling of **100,000+ requests per minute** with a single SQLite instance
- **Zero monthly infrastructure costs** (self-hosted on a $5 VM)
- A comprehensive case study on:
  - Scaling SQLite for production workloads
  - Optimizing the cost-to-complexity ratio in modern web applications
  - Implementing efficient caching strategies for high-traffic services
<!-- - Resilience to survive **5-minute outages** with <1% data loss -->
